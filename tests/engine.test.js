import {test} from 'node:test';import assert from 'node:assert/strict';
import {timeline,locate,patientReply} from '../engine.js';import {cases} from '../cases.js';
test('full carousel is precisely 125 minutes, five readings and 20 clinical minutes each',()=>{const p=timeline();assert.equal(p.at(-1).end,7500);assert.equal(p.filter(x=>x.type==='reading').length,5);for(let s=0;s<5;s++){assert.equal(p.filter(x=>x.station===s&&x.type!=='reading').reduce((n,x)=>n+x.seconds,0),1200);}for(let i=1;i<p.length;i++)assert.equal(p[i].start,p[i-1].end);});
test('boundary transitions happen exactly once with no lost or added seconds',()=>{const p=timeline();for(let i=0;i<p.length;i++){assert.equal(locate(p,p[i].end-.001).index,i);assert.equal(locate(p,p[i].end).index,i+1);}assert.equal(locate(p,7500).done,true);assert.equal(locate(p,9000).done,true);assert.equal(locate(p,0).remaining,300);});
test('clinical encounters are 6+4, consultations 15+5 and communication has no questions',()=>{const p=timeline();for(const id of [0,5])assert.deepEqual(p.filter(x=>x.caseId===id&&x.type!=='reading').map(x=>[x.type,x.seconds]),[['communication',600]]);for(const id of [2,7])assert.deepEqual(p.filter(x=>x.caseId===id&&x.type!=='reading').map(x=>x.seconds),[900,300]);for(const id of [1,3,4,6])assert.deepEqual(p.filter(x=>x.caseId===id&&x.type!=='reading').map(x=>x.seconds),[360,240]);});
test('all eight single-case practice timelines target the right case',()=>{for(let id=0;id<8;id++){const p=timeline(id);assert.ok(p.every(x=>x.caseId===id));assert.equal(p.at(-1).end,[2,7].includes(id)?1500:900);}});
test('re-entry after skipped time finds correct phase directly',()=>{const p=timeline();assert.equal(locate(p,1260).phase.type,'questions');assert.equal(locate(p,1500).phase.type,'reading');assert.equal(locate(p,2700).phase.type,'questions');assert.equal(locate(p,7200).phase.type,'questions');});
test('patient engine reveals only matching facts and never invents an unknown answer',()=>{const c=cases[2];assert.match(patientReply(c,'When did this start?').text,/four hours/);assert.match(patientReply(c,'Have you travelled recently?').text,/ten-hour flight/);assert.match(patientReply(c,'What is your favourite novel?').text,/not covered/);assert.ok(!patientReply(c,'Hello').text.includes('contraceptive'));});
test('case bank is complete and references resolve',()=>{for(const c of cases){assert.ok(c.name&&c.age&&c.instruction&&c.diagnosis&&c.opening);assert.ok(c.qa.length>=2&&c.checklist.length>=6&&c.dialogue.length);if(c.kind!=='Communication')assert.ok(c.signs.length>=5);}});

test('ten-patient extended practice has 10 real-time encounters and 2 consultant observers per station',async()=>{
 const {extraCases}=await import('../extra-cases.js');
 const all=[...cases,...extraCases],p=timeline(null,true);
 const encountered=p.filter(x=>!['reading','questions'].includes(x.type));
 assert.equal(all.length,10);
 assert.deepEqual(encountered.map(x=>x.caseId),[0,1,2,8,3,4,5,6,7,9]);
 assert.equal(p.at(-1).end,7500);
 assert.equal(p.filter(x=>x.type==='reading').length,5);
 for(let i=0;i<5;i++)assert.equal(encountered.filter(x=>x.station===i).length,2);
 for(const x of encountered){const stationPhases=p.filter(y=>y.caseId===x.caseId&&y.type!=='reading');assert.equal(stationPhases.reduce((sum,y)=>sum+y.seconds,0),600);}
 for(const c of extraCases){assert.ok(c.opening&&c.concern&&c.checklist.length>=6&&c.signs.length>=5&&c.dialogue.length>=10);}
});
test('the original official eight encounters remain exactly unchanged',()=>{
 const p=timeline();
 assert.equal(p.filter(x=>!['reading','questions'].includes(x.type)).length,8);
 assert.equal(p.at(-1).end,7500);
 assert.deepEqual(p.filter(x=>x.station===1).map(x=>x.type),['reading','consultation','questions']);
});
test('extra consultation drills target their own cases',()=>{
 for(const id of [8,9]){
  const p=timeline(id);
  assert.ok(p.every(x=>x.caseId===id));
  assert.equal(p.at(-1).end,900);
  assert.deepEqual(p.map(x=>x.type),['reading','consultation']);
 }
});
test('observer summaries are evidence-based and clearly not official scoring',async()=>{
 const {observerSummaries}=await import('../examiner.js');
 const evidence={messages:[{who:'you',text:'How long have you been worried about this? May I examine you?'}],signs:[0],answers:{}};
 const result=observerSummaries(cases[2],evidence);
 assert.equal(result.length,2);
 assert.match(result[0].summary,/examination actions recorded/);
 assert.match(result[1].summary,/Patient concerns/);
});
