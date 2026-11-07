const target='https://paces-simulator.gopir3.workers.dev/evaluate';
const body={
 caseId:0,
 messages:[
  {who:'patient',text:'I have had a cough and I am concerned about my scan.'},
  {who:'you',text:'Hello, I am Dr Smith. Is it okay if I ask a few questions? What worries you most?'},
  {who:'patient',text:'I am frightened this could be cancer.'},
  {who:'you',text:'I understand that this is worrying. We should discuss what the scan shows and plan the next steps.'}
 ],
 signs:[],answers:{'0':'I would obtain more history, communicate uncertainty clearly and safety net.'}
};
const response=await fetch(target,{
 method:'POST',
 headers:{Origin:'https://gopi-aws-1.github.io','Content-Type':'application/json'},
 body:JSON.stringify(body),
 signal:AbortSignal.timeout(14000)
});
const text=await response.text();
if(!response.ok)throw Error('/evaluate HTTP '+response.status+': '+text.slice(0,600));
const data=JSON.parse(text);
if(!Array.isArray(data.assessors)||data.assessors.length!==2||data.assessors.some(x=>typeof x.feedback!=='string'||x.feedback.trim().length<40)){
 throw Error('Assessment did not return two substantive consultant reviews: '+text.slice(0,600));
}
console.log('LIVE ASSESSMENT PASS: two consultant feedback reports returned in client 14-second deadline.');
