import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import worker from '../server/worker.js';

const ORIGIN='https://gopi-aws-1.github.io';
const env={GEMINI_API_KEY:'test-key',GEMINI_MODEL:'gemini-3.5-flash-lite',ALLOWED_ORIGIN:ORIGIN};
function request(path,body){
 return new Request('https://paces-simulator.gopir3.workers.dev'+path,{
  method:'POST',headers:{Origin:ORIGIN,'Content-Type':'application/json'},body:JSON.stringify(body)
 });
}

test('chat falls back to a second stable model instead of losing the patient conversation',async t=>{
 const prior=globalThis.fetch;
 t.after(()=>{globalThis.fetch=prior;});
 const calls=[];
 globalThis.fetch=async (url,options)=>{
  calls.push(String(url));
  if(String(url).includes('gemini-3.5-flash-lite'))return new Response('{}',{status:404});
  const payload=JSON.parse(options.body);
  assert.match(payload.systemInstruction.parts[0].text,/fictional patient/);
  assert.equal(payload.contents.at(-1).parts[0].text,'What has been bothering you?');
  return Response.json({candidates:[{content:{parts:[{text:'My cough is what has been worrying me most, doctor.'}]}}]});
 };
 const response=await worker.fetch(request('/chat',{caseId:0,question:'What has been bothering you?',history:[]}),env);
 assert.equal(response.status,200);
 const body=await response.json();
 assert.equal(body.model,'gemini-3.1-flash-lite');
 assert.match(body.answer,/cough/);
 assert.equal(calls.length,2);
});

test('chat preserves prior candidate and patient turns for context',async t=>{
 const prior=globalThis.fetch;
 t.after(()=>{globalThis.fetch=prior;});
 globalThis.fetch=async (_url,options)=>{
  const payload=JSON.parse(options.body);
  assert.deepEqual(payload.contents.map(x=>x.role),['user','model','user']);
  assert.equal(payload.contents[1].parts[0].text,'I have had a cough for weeks.');
  return Response.json({candidates:[{content:{parts:[{text:'Yes, I have been tired too.'}]}}]});
 };
 const history=[{who:'patient',text:'Initial introduction'}, {who:'you',text:'How long have you been coughing?'},{who:'patient',text:'I have had a cough for weeks.'}];
 const response=await worker.fetch(request('/chat',{caseId:0,question:'Any other symptoms?',history}),env);
 assert.equal(response.status,200);
 assert.match((await response.json()).answer,/tired/);
});

test('speech wraps PCM audio in a WAV header for compatible browsers',async t=>{
 const prior=globalThis.fetch;
 t.after(()=>{globalThis.fetch=prior;});
 const pcm=Buffer.from([0,0,1,0,2,0,3,0]);
 globalThis.fetch=async ()=>Response.json({candidates:[{content:{parts:[{inlineData:{data:pcm.toString('base64'),mimeType:'audio/pcm'}}]}}]});
 const response=await worker.fetch(request('/speech',{caseId:0,text:'Good morning, doctor.'}),env);
 assert.equal(response.status,200);
 assert.match(response.headers.get('Content-Type'),/audio\/wav/);
 const wav=new Uint8Array(await response.arrayBuffer());
 assert.equal(new TextDecoder().decode(wav.slice(0,4)),'RIFF');
 assert.equal(new TextDecoder().decode(wav.slice(8,12)),'WAVE');
 assert.equal(wav.length,pcm.length+44);
});

test('client speech output does not get routed into a suspended audio context',()=>{
 const speaker=readFileSync(new URL('../speaker.js',import.meta.url),'utf8');
 assert.match(speaker,/if\(this\.context\.state==='running'\)/);
 assert.match(speaker,/this\.context\.resume\(\)\.catch/);
});

test('worker rejects invalid patient identifiers without contacting AI',async()=>{
 const response=await worker.fetch(request('/chat',{caseId:99,question:'Hello'}),env);
 assert.equal(response.status,400);
 assert.match((await response.json()).error,/Unknown simulated patient/);
});
