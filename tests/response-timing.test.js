import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {requestPatientReply,PATIENT_REPLY_DEADLINE_MS} from '../response-timing.js';
import {AI_SPEECH_START_DEADLINE_MS} from '../speaker.js';

test('fast AI reply remains available without extra delay',async()=>{
 const begin=Date.now();
 const {response,data}=await requestPatientReply(async()=>({ok:true,json:async()=>({answer:'Yes, doctor.'})}),'https://example.test/chat',{},100);
 assert.equal(response.ok,true);
 assert.equal(data.answer,'Yes, doctor.');
 assert.ok(Date.now()-begin<100);
});
test('slow AI reply aborts and releases the local case fallback',async()=>{
 let aborted=false;
 const never=async(_url,options)=>new Promise((_,reject)=>{
  options.signal.addEventListener('abort',()=>{aborted=true;reject(new Error('aborted'));},{once:true});
 });
 const start=Date.now();
 await assert.rejects(requestPatientReply(never,'https://example.test/chat',{},35));
 assert.equal(aborted,true);
 assert.ok(Date.now()-start<500);
});
test('stalled response body parsing also respects the deadline',async()=>{
 const fetcher=async()=>({ok:true,json:()=>new Promise(()=>{})});
 await assert.rejects(requestPatientReply(fetcher,'https://example.test/chat',{},25),/deadline/);
});
test('UI enforces bounded response and speech waits, preserving the monitor',()=>{
 const ui=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
 const speaker=readFileSync(new URL('../speaker.js',import.meta.url),'utf8');
 const workflow=readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');
 assert.ok(PATIENT_REPLY_DEADLINE_MS>=4500&&PATIENT_REPLY_DEADLINE_MS<=6000);
 assert.ok(AI_SPEECH_START_DEADLINE_MS<=2000);
 assert.match(ui,/await requestPatientReply\(fetch/);
 assert.match(ui,/const immediate=immediatePatientReply\(/);
 assert.match(ui,/aiReplyUnavailableUntil=Date\.now\(\)\+30000/);
 assert.match(ui,/return naturalReply\(c\(\),text,r\(\)\.messages\)\.text/);
 assert.match(speaker,/controller\.abort\(\)/);
 assert.match(speaker,/this\.browserSpeech\(text,patient,finish,own,start\)/);
 assert.match(ui,/animateMonitor\(/);
 assert.match(workflow,/response-timing\.js _site\//);
});

test('spoken reply appears in the transcript without waiting for voice synthesis',()=>{
 const ui=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
 const voice=readFileSync(new URL('../voice.js',import.meta.url),'utf8');
 assert.match(ui,/log\('patient',answer\); \/\/ Show the response immediately/);
 const i=voice.indexOf('this.onPatient(result);');
 const j=voice.indexOf('this.say(result,');
 assert.ok(i>=0&&j>i,'Browser-microphone transcript should be available before patient audio playback');
});
