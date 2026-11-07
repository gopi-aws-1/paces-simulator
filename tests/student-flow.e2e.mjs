import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chromium} from 'playwright';

const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
const failures=[];
const origin='http://127.0.0.1:4173';

async function newPage(viewport={width:1360,height:850}){
 const page=await browser.newPage({viewport,acceptDownloads:true});
 await page.addInitScript(()=>{
  localStorage.setItem('paces-ward-voice-api','');
  // Deterministic spoken replies: test the consultation flow, not the host voice catalogue.
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
   getVoices:()=>[],speak:utterance=>setTimeout(()=>{utterance.onstart?.();setTimeout(()=>utterance.onend?.(),25);},10),
   cancel:()=>{},speaking:false
  }});
  window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
 });
 page.on('pageerror',e=>failures.push(e.message));
 page.on('dialog',d=>d.accept());
 await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
 await page.locator('#one').waitFor({timeout:15000});
 return page;
}

function pass(message){console.log('PASS:',message);}
async function main(){
 let page=await newPage();
 try{
  // Student picks a case, asks questions, examines, presents, finishes and downloads feedback.
  await page.locator('#one').click();
  await page.locator('#choice').selectOption('0');
  await page.locator('#launch').click();
  await page.locator('#typed').waitFor();
  assert.match(await page.locator('#countdown').textContent(),/\d\d:\d\d/);
  await page.locator('#details').click();
  assert.equal(await page.locator('#instructionsModal').evaluate(x=>x.open),true);
  await page.locator('#closeInstructions').click();
  await page.locator('#typed').fill('How long have you been coughing?');
  await page.locator('#typeForm button[type=submit]').click();
  await page.waitForFunction(()=>document.querySelectorAll('.line.patient').length>=2,{timeout:12000});
  await page.waitForFunction(()=>!document.querySelector('#typed').disabled,{timeout:12000});
  assert.match(await page.locator('.line.you').last().textContent(),/cough/i);
  assert((await page.locator('.line.patient').last().textContent()||'').length>12);
  pass('single case: typed question produces recorded patient response and restores input');

  await page.locator('#examine').click();
  assert.equal(await page.locator('#examModal').evaluate(x=>x.open),true);
  if(await page.locator('#signs [data-i]').count()){
   await page.locator('#signs [data-i]').first().click();
   assert.match(await page.locator('#signs [data-i]').first().textContent(),/✓/);
  }
  await page.locator('#closeSigns').click();
  await page.locator('#present').click();
  assert.equal(await page.locator('#presentationModal').evaluate(x=>x.open),true);
  const firstAnswer=page.locator('[data-examiner-answer]').first();
  if(await firstAnswer.count())await firstAnswer.fill('I would explain my findings and ask about red flag symptoms.');
  await page.locator('#savePresentation').click();
  assert.equal(await page.locator('#presentationModal').evaluate(x=>x.open),false);
  pass('candidate instructions, examination findings and consultant presentation work');

  await page.locator('#next').click();
  await page.getByText('SESSION COMPLETED').waitFor({timeout:15000});
  await page.getByText('Consultant feedback',{exact:true}).waitFor();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#export').click();
  const download=await downloadPromise;
  const payload=JSON.parse(readFileSync(await download.path(),'utf8'));
  assert.equal(payload.cases.length,1);
  assert.equal(payload.cases[0].caseId,0);
  assert(payload.cases[0].transcript.some(m=>m.who==='you'));
  if(await firstAnswer.count())assert.equal(typeof payload.cases[0].report,'object');
  pass('finish shows graded report, export preserves transcript and case');

  await page.locator('#again').click();
  await page.locator('#one').waitFor();
  pass('start new session returns to selection');
 }finally{await page.close();}

 page=await newPage();
 try{
  await page.locator('input[name=feedbackTiming][value=each]').check();
  await page.locator('#one').click();
  await page.locator('#choice').selectOption('2');
  await page.locator('#launch').click();
  await page.locator('#next').click();
  await page.locator('#continueCase').waitFor();
  assert.match(await page.locator('#continueCase').textContent(),/See final report/);
  await page.locator('#continueCase').click();
  await page.getByText('SESSION COMPLETED').waitFor();
  pass('per-case feedback mode completes and advances into final review');
 }finally{await page.close();}

 page=await newPage();
 try{
  await page.locator('#full').click();
  await page.locator('#skip').waitFor();
  await page.locator('#skip').click();
  await page.locator('#typed').waitFor();
  for(let i=1;i<=10;i++){
   const header=(await page.locator('.sessionbar h2').textContent())||'';
   assert(header.includes('Patient '+i+' of 10'),'Unexpected case progression: '+header);
   await page.locator('#next').click();
   if(i<10)await page.locator('#typed').waitFor();
  }
  await page.getByText('SESSION COMPLETED').waitFor();
  assert.equal(await page.locator('.case-result').count(),10);
  pass('full 10-patient circuit advances sequentially and produces cumulative report');
 }finally{await page.close();}

 page=await newPage({width:390,height:844});
 try{
  await page.locator('#one').click();
  await page.locator('#launch').click();
  await page.locator('#typed').waitFor();
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  assert(overflow.scroll<=overflow.client+6,'Mobile horizontal overflow: '+JSON.stringify(overflow));
  await page.locator('#end').click();
  await page.getByText('SESSION COMPLETED').waitFor();
  pass('mobile viewport has no horizontal overflow and early exit reaches review');
 }finally{await page.close();}

 if(failures.length)throw new Error('Browser JavaScript errors: '+JSON.stringify(failures));
 console.log('ALL STUDENT JOURNEY TESTS PASSED');
}
try{await main();}catch(error){console.error(error);process.exitCode=1;}finally{await browser.close();}
