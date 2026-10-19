import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cases} from '../cases.js';
import {extraCases} from '../extra-cases.js';
import {gradeEncounter,aggregateReports,SKILLS} from '../grading.js';
import {caseFeedbackHtml,aggregateFeedbackHtml} from '../feedback-ui.js';
const patients=[...cases,...extraCases];
const attempt=(messages=[],signs=[])=>({messages:messages.map(text=>({who:'you',text})),signs});

test('all ten cases produce structured two-consultant PACES practice feedback',()=>{
 for(const c of patients){
  const report=gradeEncounter(c,attempt(['Hello, my name is Dr Taylor.','Could you tell me more about that?','How long has this been going on?']));
  assert.equal(report.caseId,c.id);
  assert.equal(report.consultants.length,2);
  assert.deepEqual(report.skills.map(s=>s.id),Object.keys(SKILLS));
  assert.match(report.disclaimer,/not an official|not official/i);
  for(const s of report.skills)assert.ok(s.grade===null||[0,1,2].includes(s.grade));
 }
});
test('domain applicability matches PACES encounter combinations',()=>{
 const communication=gradeEncounter(cases[0],attempt(['Can you tell me what you know?']));
 assert.deepEqual(communication.skills.filter(s=>s.applicable).map(s=>s.id),['C','E','F','G']);
 const examination=gradeEncounter(cases[1],attempt(['May I examine you?'],[0,1,2]));
 assert.deepEqual(examination.skills.filter(s=>s.applicable).map(s=>s.id),['A','B','D','E','G']);
 const consultation=gradeEncounter(cases[2],attempt(['How long have you been feeling breathless?']));
 assert.equal(consultation.skills.filter(s=>s.applicable).length,7);
});
test('button selection never yields fictional examination technique or sign marks',()=>{
 const report=gradeEncounter(cases[1],attempt(['May I examine you?'],[0,1,2,3,4,5,6]));
 for(const id of ['A','B']){
  const skill=report.skills.find(s=>s.id===id);
  assert.equal(skill.grade,null);
  assert.match(skill.label,/Not assessable/);
  assert.match(skill.note,/clicks do not establish/);
 }
 assert.equal(report.examActions,7);
});
test('only trainee words count as evidence; patient case answers do not earn credit',()=>{
 const empty=gradeEncounter(cases[0],{messages:[{who:'patient',text:'I have cancer and need a biopsy, and I am worried. Please arrange a specialist.'}],signs:[]});
 assert.equal(empty.studentTurns,0);
 assert.equal(empty.skills.find(s=>s.id==='C').grade,null);
 assert.equal(empty.skills.find(s=>s.id==='E').grade,null);
 assert.equal(empty.skills.find(s=>s.id==='F').grade,null);
 assert.match(empty.consultants[0].summary,/No candidate dialogue/);
});
test('specific trainee evidence appears verbatim in strengths, with precise next-practice steps',()=>{
 const practice=gradeEncounter(cases[0],attempt([
  'Good morning, my name is Dr Patel.',
  'What did they tell you about the scan?',
  'Do you have any concerns about what it might mean?',
  "I'm sorry, that sounds frightening.",
  'We need a biopsy and specialist review because the scan is not confirmed.',
  'Does that make sense?'
 ]));
 assert.ok(practice.skills.find(s=>s.id==='C').evidence.length>=2);
 assert.ok(practice.skills.find(s=>s.id==='E').grade>=1);
 assert.ok(practice.consultants[1].strengths.some(x=>/Good morning|scan|concerns|sorry|sense/i.test(x.quote)));
 assert.ok(practice.nextPractice.length>=1);
});
test('potentially unsafe certainty is highlighted and never rewarded as reassurance',()=>{
 const poor=gradeEncounter(cases[0],attempt(['Everything is fine, you look fine.', 'You have nothing wrong.', 'No need to worry.', 'Go home please.']));
 assert.ok(poor.safetyConcerns.length>=1);
 assert.equal(poor.skills.find(s=>s.id==='E').grade,0);
 assert.ok(poor.consultants[0].safety.length>=1);
});
test('very short attempts and unheard skills do not receive fabricated official marks',()=>{
 const minimal=gradeEncounter(cases[3],attempt(['Hello']));
 assert.equal(minimal.skills.find(s=>s.id==='D').grade,null);
 assert.equal(minimal.skills.find(s=>s.id==='A').grade,null);
 assert.equal(minimal.skills.find(s=>s.id==='B').grade,null);
 assert.match(minimal.disclaimer,/Not an official/);
});
test('trend summary only aggregates genuinely rated skills',()=>{
 const r1=gradeEncounter(cases[0],attempt(['I am Dr Lee.','How long has it been?','Do you have concerns?','I am sorry this is upsetting.']));
 const r2=gradeEncounter(cases[1],attempt(['Hello']));
 const sum=aggregateReports([r1,r2]);
 assert.equal(sum.cases,2);
 assert.equal(sum.skills.find(s=>s.id==='A').average,null);
 assert.equal(sum.skills.find(s=>s.id==='B').average,null);
 assert.match(sum.disclaimer,/not an official/i);
});
test('feedback HTML escapes recorded utterances and offers all consultant sections',()=>{
 const r=attempt(['Good morning <script>alert(1)</script>, I am Dr Stone.','May I examine you please?']);
 r.report=gradeEncounter(cases[2],r);
 const html=caseFeedbackHtml(cases[2],r);
 assert.doesNotMatch(html,/<script>/);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/Consultant 1/);
 assert.match(html,/Consultant 2/);
 assert.match(html,/Priorities for the next case/);
 assert.match(aggregateFeedbackHtml({2:r},[cases[2]]),/Practice across 1 encounter/);
});
test('feedback timing choices, case debrief and final export are connected',()=>{
 const ui=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
 const css=readFileSync(new URL('../demo.css',import.meta.url),'utf8');
 const workflow=readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');
 const worker=readFileSync(new URL('../server/worker.js',import.meta.url),'utf8');
 assert.match(ui,/name="feedbackTiming" value="each"/);
 assert.match(ui,/name="feedbackTiming" value="end"/);
 assert.match(ui,/session\.stage='caseFeedback'/);
 assert.match(ui,/function continueAfterDebrief/);
 assert.match(ui,/caseFeedbackHtml/);
 assert.match(ui,/aggregateFeedbackHtml/);
 assert.match(ui,/paces-ward-feedback\.json/);
 assert.match(css,/\.consultant-feedback-grid/);
 assert.match(workflow,/grading\.js feedback-ui\.js _site\//);
 assert.match(worker,/judgeGemini/);
 assert.match(worker,/candidateMessages/);
});

test('examiner presentation answers contribute to reasoning ratings but do not fake physical observation',()=>{
 const c=cases[2];
 const rec={messages:[{who:'patient',text:c.opening}],signs:[0,1],answers:{0:'My working diagnosis is pulmonary embolism or a blood clot. I would urgently consider ACS as an alternative.',1:'I would arrange an urgent senior review, observations and the Wells pathway.'}};
 const report=gradeEncounter(c,rec);
 assert.equal(report.examinerAnswers,2);
 assert.ok(report.skills.find(x=>x.id==='D').grade>=1);
 assert.ok(report.skills.find(x=>x.id==='E').grade>=1);
 assert.equal(report.skills.find(x=>x.id==='A').grade,null);
 assert.equal(report.skills.find(x=>x.id==='B').grade,null);
 assert.ok(report.consultants[0].strengths.some(x=>/pulmonary embolism/i.test(x.quote)));
 const html=caseFeedbackHtml(c,{...rec,report});
 assert.match(html,/Examiner questions and teaching points/);
 assert.match(html,/My working diagnosis is pulmonary embolism/);
 assert.match(html,/Suggested teaching points/);
});
test('student sees examiner questions during practice but not the calibration answers',()=>{
 const ui=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
 const start=ui.indexOf('function presentationModal('),end=ui.indexOf('function encounter(){',start);
 const modal=ui.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.match(modal,/entry\[0\]/);
 assert.doesNotMatch(modal,/entry\[1\]/);
 assert.match(ui,/id="present">Present to Consultants/);
 assert.match(ui,/savePresentation/);
 assert.match(ui,/answers\[field\.dataset\.examinerAnswer\]/);
 assert.match(ui,/Object\.values\(v\.answers\|\|\{\}\)/);
});
