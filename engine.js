export const stations=[['Communication','Respiratory'],['Consultation'],['Cardiovascular','Neurology'],['Communication','Abdominal'],['Consultation']];
export function timeline(practice=null,extended=false){
 let phases=[]; const add=(station,caseId,type,seconds)=>phases.push({station,caseId,type,seconds});
 const mapping=(extended||practice>=8)?[[0,1],[2,8],[3,4],[5,6],[7,9]]:[[0,1],[2],[3,4],[5,6],[7]];
 for(let s=0;s<5;s++){
  if(practice!==null&&!mapping[s].includes(practice))continue;
  add(s,mapping[s][0],'reading',300);
  for(const id of mapping[s]){
   if(practice!==null&&id!==practice)continue;
   if((extended||id>=8)&&[2,7,8,9].includes(id))add(s,id,'consultation',600);
   else if(id===0||id===5)add(s,id,'communication',600);
   else if(id===2||id===7){add(s,id,'consultation',900);add(s,id,'questions',300);}
   else{add(s,id,'examination',360);add(s,id,'questions',240);}
  }
 }
 if(practice!==null)phases[0].caseId=practice;
 let start=0;return phases.map(p=>{const out={...p,start,end:start+p.seconds};start=out.end;return out;});
}
export function locate(phases,elapsed){const index=phases.findIndex(p=>elapsed<p.end);return index<0?{done:true,index:phases.length,remaining:0}:{done:false,index,phase:phases[index],remaining:Math.max(0,Math.ceil(phases[index].end-elapsed))};}
export function patientReply(c,input){
 const t=input.toLowerCase().replace(/[’']/g,'');
 const hits=c.dialogue.filter(d=>d.keys.some(k=>t.includes(k)));
 if(hits.length)return {text:hits.slice(0,2).map(d=>d.answer).join(' '),topics:hits.slice(0,2).map(d=>d.topic)};
 if(/hello|my name|introduc|good morning|good afternoon/.test(t))return {text:`Hello doctor. I'm ${c.name.split(' ')[0]}. ${c.opening}`,topics:['Introduction']};
 if(/consent|examine|permission/.test(t))return {text:'Yes, you may examine me. Please explain what you are doing and stop if I am uncomfortable.',topics:['Consent']};
 if(/sorry|difficult|understand how|worrying|upsetting/.test(t))return {text:'Thank you for listening. Could you explain what happens next?',topics:['Empathy']};
 if(/thank|anything else|other question/.test(t))return {text:c.concern,topics:['Concerns']};
 return {text:'[Simulator: this question is not covered by the script. Try one specific question about symptoms, timing, medicines, background or concerns. No clinical fact has been inferred.]',topics:[]};
}
