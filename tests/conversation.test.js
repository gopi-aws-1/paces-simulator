import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cases} from '../cases.js';
import {extraCases} from '../extra-cases.js';
import {naturalReply,immediatePatientReply} from '../conversation.js';
import {readFileSync} from 'node:fs';
const patients=[...cases,...extraCases];
function answer(id,question,history=[]){return naturalReply(patients[id],question,history).text;}
const examples=[
 [0,'How much weight have you lost?',/three kilograms/i],
 [0,'Is anyone here with you?',/husband/i],
 [0,'Any known allergies?',/no known drug allergies/i],
 [1,'Do you bring up any phlegm?',/dry cough/i],
 [1,'Any occupational exposures?',/office manager|asbestos/i],
 [2,'When did this start?',/four hours/i],
 [2,'Have you travelled recently?',/ten-hour flight/i],
 [2,'Have you had a recent operation?',/no.*surgery/i],
 [2,'Any swelling in your legs?',/left calf/i],
 [2,'Do you get more pain when you breathe in?',/breath|right side|sharp/i],
 [3,'Have you had any chest pain?',/no chest pain|have not had chest pain/i],
 [4,'How long has your hand been shaking?',/eighteen months/i],
 [4,'Have you had any falls?',/not fallen/i],
 [5,'Why do you need to leave?',/mother.*dementia/i],
 [5,'Could we call your brother?',/call him|call my brother/i],
 [6,'Have you vomited any blood?',/not vomited blood/i],
 [6,'How long has your abdomen been swollen?',/month/i],
 [7,'Is it worse first thing in the morning?',/ninety minutes/i],
 [7,'Are you hoping to have a baby?',/next year/i],
 [8,'Are you going to the toilet more often?',/toilet|much more often/i],
 [8,'Does diabetes run in your family?',/dad.*diabetes/i],
 [9,'Did the headache come on suddenly?',/gradually/i],
 [9,'Do bright lights make it worse?',/lights.*noise/i],
 [9,'Have you been vomiting?',/vomited once/i]
];
test('natural spoken questions recover grounded facts across all ten patients',()=>{
 for(const [id,q,expected] of examples)assert.match(answer(id,q),expected,'Case '+id+' question: '+q);
});
test('introduction, consent, empathy and worries work naturally',()=>{
 assert.match(answer(2,'Hello doctor, my name is Sarah'),/Hello, doctor/);
 assert.match(answer(7,'May I examine you?'),/Yes, of course/);
 assert.match(answer(0,'That sounds difficult'),/Thank you/);
 assert.match(answer(0,'What is your biggest concern?'),/sister|cancer/i);
});
test('natural follow-ups are contextual and do not repeat generic fallback',()=>{
 const h=[{who:'patient',text:'Sharp pain on the right side of my chest, worse when breathing in.'},{who:'you',text:'Could you tell me more about that?'}];
 assert.match(answer(2,'Can you tell me more?',h),/four hours|breathe/i);
 assert.doesNotMatch(answer(2,'Can you tell me more?',h),/not sure about that doctor could you ask/i);
});
test('questions outside the authored medical history do not fabricate detailed findings',()=>{
 const unknowns=['What is your favourite novel?','Who won the football match last night?','Can you explain your genetics?'];
 for(const [i,q] of unknowns.entries()){
  const history=Array.from({length:i+1},()=>({who:'patient',text:'Thank you, doctor.'}));
  const reply=answer(7,q,history);
  assert.ok(reply.length>10);
  assert.doesNotMatch(reply,/I have the BRCA mutation|My favourite novel is|Liverpool won/);
 }
});
test('the main app uses the same grounded answers for typed and browser-microphone dialogue',()=>{
 const ui=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
 assert.match(ui,/import \{naturalReply\}/);
 assert.match(ui,/return naturalReply\(c\(\),text,r\(\)\.messages\)\.text/);
 assert.doesNotMatch(ui,/I am not sure about that, doctor\. Could you ask me in a different way/);
});
test('birthday ticker replaces the previous dedication on all screens',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/<div class="dedication-banner" role="region" aria-label="Happy birthday my princess 💝">/);
 assert.equal((html.match(/<span class="dedication-message">Happy birthday my princess 💝<\/span>/g)||[]).length,2);
 assert.match(html,/<div class="dedication-track" aria-hidden="true">/);
 assert.doesNotMatch(html,/specially designed for my princess|Dr\. Jyo|Beautiful People/i);
 assert.ok(html.indexOf('dedication-banner')<html.indexOf('<header>'));
});

test('patient challenges premature reassurance rather than parroting symptoms',()=>{
 const h=[{who:'patient',text:patients[0].opening},{who:'you',text:'no nothing wrong you looks alright'}];
 const reply=answer(0,'no nothing wrong you looks alright',h);
 assert.match(reply,/scan|why am i here|worried/i);
 assert.doesNotMatch(reply,/six weeks|3 kg|not quite sure about that particular detail/i);
});
test('patient responds naturally to clinical uncertainty and checking understanding',()=>{
 assert.match(answer(0,'I cannot say for certain until we have more tests.'),/serious|certain|worried/i);
 assert.match(answer(0,'Does that make sense to you?'),/scan|think so/i);
 assert.match(answer(0,'We can go slowly, take your time.'),/thank you|nervous/i);
});
test('unrecognised doctor remarks do not trigger scripted symptom dumps',()=>{
 const reply=answer(0,'The weather is rather lovely today.',[{who:'patient',text:patients[0].opening}]);
 assert.doesNotMatch(reply,/six weeks|3 kg|symptom|main thing i have noticed/i);
 assert.match(reply,/doctor|tell me|see/i);
});

test('record review statements get concise acknowledgements, not unrelated medical history',()=>{
 const c=patients[0];
 const first=[{who:'patient',text:c.opening},{who:'you',text:'let me look at your records'}];
 const a=answer(0,'let me look at your records',first);
 assert.match(a,/take your time|wait|thank you/i);
 assert.doesNotMatch(a,/tell me a little more|six weeks|3 kg|scan showed/i);
 const second=[...first,{who:'patient',text:a},{who:'you',text:"I mean I haven't gone through your record yet let me see your reports now"}];
 const b=answer(0,"I mean I haven't gone through your record yet let me see your reports now",second);
 assert.match(b,/take your time|wait|thank you/i);
 assert.notEqual(a,b,'Patient should not repeat the exact same acknowledgment');
 assert.doesNotMatch(b,/tell me a little more|six weeks|lost about/i);
});
test('non-medical patient acknowledgements can run without waiting on an AI request',()=>{
 const c=patients[0];
 for(const phrase of ['Let me look at your records','Just a moment please',"I haven't seen your test reports yet; let me review them"]){
  const instant=immediatePatientReply(c,phrase,[{who:'patient',text:c.opening}]);
  assert.ok(instant,'Expected immediate acknowledgement: '+phrase);
  assert.equal(instant.topics[0],'Acknowledgement');
 }
 assert.equal(immediatePatientReply(c,'How long have you been coughing?',[]),null);
 assert.equal(immediatePatientReply(c,'Have you coughed up blood?',[]),null);
});
test('unfamiliar remarks never force the patient to ask for more details repeatedly',()=>{
 const c=patients[0];
 let h=[{who:'patient',text:c.opening}];
 const replies=[];
 for(const line of ['Well, I have just arrived.','Okay, please wait here.','Right, I am thinking about it.']){
  h.push({who:'you',text:line});
  const a=answer(0,line,h);
  replies.push(a);h.push({who:'patient',text:a});
  assert.doesNotMatch(a,/I see, doctor. Could you tell me a little more\?/i);
 }
 assert.ok(new Set(replies).size>=2);
});

test('ticker uses Montserrat, loops from right to left, and respects reduced motion',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../demo.css',import.meta.url),'utf8');
 assert.match(html,/https:\/\/fonts\.googleapis\.com\/css2\?family=Montserrat/);
 assert.match(css,/font-family:'Montserrat',Arial,Helvetica,sans-serif/);
 assert.match(css,/animation:birthday-news-scroll 19s linear infinite/);
 assert.match(css,/@keyframes birthday-news-scroll\{/);
 assert.match(css,/to\{transform:translate3d\(-50%,0,0\)\}/);
 assert.match(css,/@media\(max-width:600px\)\{/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{/);
 assert.match(css,/\.dedication-track\{animation:none;transform:none;will-change:auto\}/);
 assert.doesNotMatch(html,/fonts\.cdnfonts\.com|beautiful-people-personal-use/);
 assert.doesNotMatch(css,/Beautiful People/);
});

test('site-wide credit stays below the main content without changing the birthday ticker',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../demo.css',import.meta.url),'utf8');
 assert.match(html,/<footer class="site-footer" aria-label="Site credits"><span>Developed by Gopi<\/span><\/footer>/);
 assert.ok(html.indexOf('<footer class="site-footer"')>html.indexOf('<main id="app"'));
 assert.ok(html.indexOf('<footer class="site-footer"')<html.indexOf('<script type="module"'));
 assert.match(html,/Happy birthday my princess 💝/);
 assert.match(css,/body > main#app\{flex:1 0 auto;width:100%\}/);
 assert.match(css,/\.site-footer\{/);
 assert.match(css,/@media\(max-width:600px\)\{\.site-footer/);
});
