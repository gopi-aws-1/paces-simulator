/* These live observers offer coverage cues, not a validated PACES mark. */
const words=s=>String(s||'').toLowerCase();
export function observerSummaries(c,r){
 const said=(r.messages||[]).filter(m=>m.who==='you').map(m=>m.text).join(' ').toLowerCase();
 const covered=(c.dialogue||[]).filter(d=>d.keys.some(k=>said.includes(k))).length;
 const total=(c.dialogue||[]).length;
 const findings=(r.signs||[]).length;
 const totalSigns=c.signs.length;
 const interactions=(r.messages||[]).filter(m=>m.who==='you').length;
 const clinical=totalSigns?findings+'/'+totalSigns+' examination actions recorded':covered+'/'+total+' scripted history topics explored';
 const concerns=/worr|concern|afraid|fear|understand|sorry|feel|impact|hope|expect|what matters/.test(said);
 const consent=/consent|permission|examin|may i|is it okay|comfortable/.test(said);
 const safety=/worsen|emergency|urgent|call|help|return|red flag|safety/.test(said);
 return [
  {name:'Consultant 1',role:'Clinical reasoning & examination',summary:clinical,detail:'Listening for focused history, appropriate examination and clinical reasoning. '+(interactions?'Interactions heard: '+interactions+'.':'Awaiting candidate interaction.')},
  {name:'Consultant 2',role:'Communication & patient welfare',summary:concerns?'Patient concerns addressed in conversation':'Patient concerns not yet explicitly explored',detail:(consent?'Consent / examination language heard. ':'Seek permission before examination. ')+(safety?'Safety-netting language heard.':'Remember patient welfare and safety-netting.')}
 ];
}
export function assessmentPayload(c,r){
 return {caseId:c.id,messages:(r.messages||[]).slice(-80).map(m=>({who:m.who,text:String(m.text).slice(0,1200)})),signs:(r.signs||[]).slice(0,25),answers:r.answers||{}};
}
