// Public deployment smoke check: exercises the live fictional PACES patient.
// No API keys, private data, or clinical user transcripts are sent.
const base='https://paces-simulator.gopir3.workers.dev';
const origin='https://gopi-aws-1.github.io';
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function post(route,body,maxMs){
 let last;
 for(let attempt=1;attempt<=2;attempt++){
  try{
   const response=await fetch(base+route,{
    method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},
    body:JSON.stringify(body),signal:AbortSignal.timeout(maxMs)
   });
   if(!response.ok){
    const text=(await response.text()).slice(0,500);
    throw new Error(route+' HTTP '+response.status+': '+text);
   }
   return response;
  }catch(error){
   last=error;
   if(attempt<2)await pause(4000);
  }
 }
 throw last;
}
const chat=await post('/chat',{caseId:0,question:'Hello, what has been worrying you lately?',history:[]},14000);
const data=await chat.json();
if(typeof data.answer!=='string'||data.answer.trim().length<8||!data.model){
 throw new Error('Live /chat returned no usable AI patient answer: '+JSON.stringify(data).slice(0,300));
}
console.log('LIVE CHAT PASS:',data.model,'—',data.answer.slice(0,140));
const speech=await post('/speech',{caseId:0,text:'Good morning, doctor. I am worried about this cough.'},30000);
const mime=speech.headers.get('Content-Type')||'';
if(!/audio\/(wav|mpeg)/i.test(mime))throw new Error('Live /speech invalid content type: '+mime);
const bytes=new Uint8Array(await speech.arrayBuffer());
if(bytes.length<1000)throw new Error('Live /speech returned too few audio bytes: '+bytes.length);
if(mime.includes('wav')&&new TextDecoder().decode(bytes.slice(0,4))!=='RIFF')throw new Error('Live /speech has invalid WAV header');
console.log('LIVE SPEECH PASS:',mime,bytes.length,'bytes');
console.log('Client smoke check passed for AI text and AI audio transport.');
