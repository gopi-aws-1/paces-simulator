import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cases} from '../cases.js';
import {extraCases} from '../extra-cases.js';
import {patientStyle,selectDeviceVoice,PATIENT_STYLE} from '../patient-style.js';
import {drawPatient} from '../avatar.js';
const people=[...cases,...extraCases];
test('every fictional patient has a sex-appropriate, distinct voice profile',()=>{
 assert.equal(PATIENT_STYLE.length,10);
 for(const p of people){
  const profile=patientStyle(p);
  assert.equal(profile.voice,p.sex==='Man'?'male':'female');
  assert.ok(profile.pitch>.5&&profile.pitch<1.4);
  assert.ok(profile.rate>.7&&profile.rate<1.1);
  assert.match(profile.skin,/^#[a-f0-9]{6}$/i);
 }
 assert.notDeepEqual(patientStyle(people[0]),patientStyle(people[7]));
});
test('the gendered mobile voice picker prefers recognizable male/female voices',()=>{
 const voices=[
  {name:'Samantha',lang:'en-US',localService:true},
  {name:'Daniel',lang:'en-GB',localService:true},
  {name:'Serena Premium',lang:'en-GB',localService:true},
  {name:'Alex',lang:'en-US',localService:true}
 ];
 assert.match(selectDeviceVoice(voices,people[0]).name,/Serena/);
 assert.match(selectDeviceVoice(voices,people[1]).name,/Daniel/);
 assert.equal(selectDeviceVoice([],people[0]),null);
});
test('illustrated patient animator has canvas primitives for blink and moving lips',()=>{
 const avatar=readFileSync(new URL('../avatar.js',import.meta.url),'utf8');
 assert.match(avatar,/blinkPhase/);
 assert.match(avatar,/mouthActivity/);
 assert.match(avatar,/audioLevel/);
 const calls=[];const gradient={addColorStop(){}};
 const ctx=new Proxy({createLinearGradient:()=>gradient},{get(obj,key){return key in obj?obj[key]:(...args)=>{calls.push(key);};},set(obj,key,value){obj[key]=value;return true;}});
 drawPatient(ctx,people[0],0,false,0,false);
 drawPatient(ctx,people[1],4.02,true,.8,false);
 assert.ok(calls.includes('ellipse'));
 assert.ok(calls.includes('quadraticCurveTo'));
 assert.ok(calls.includes('strokeRect'));
});
test('mobile layout has viewport safe areas, sticky controls and nonstreaming canvas',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const css=readFileSync(new URL('../demo.css',import.meta.url),'utf8');
 const js=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
 assert.match(html,/viewport-fit=cover/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(css,/position:sticky;bottom:0/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/font-size:16px/);
 assert.match(js,/drawPatient\(ctx,p/);
 assert.match(js,/old\.replaceWith\(cv\)/);
 assert.doesNotMatch(js,/cv\.captureStream/);
});
test('natural patient voices can be synthesized securely without exposing API keys',()=>{
 const worker=readFileSync(new URL('../server/worker.js',import.meta.url),'utf8');
 const speaker=readFileSync(new URL('../speaker.js',import.meta.url),'utf8');
 const voice=readFileSync(new URL('../voice.js',import.meta.url),'utf8');
 assert.match(worker,/gpt-4o-mini-tts/);
 assert.match(worker,/\/speech/);
 assert.match(worker,/c\.sex==='Man'\?'cedar':'shimmer'/);
 assert.match(speaker,/selectDeviceVoice/);
 assert.match(speaker,/onSpeaking\(true\)/);
 assert.match(voice,/this\.busy/);
 assert.doesNotMatch(speaker,/OPENAI_API_KEY|TAVUS_API_KEY/);
});
