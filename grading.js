/**
 * Evidence-limited PACES practice report.
 * Official domains: https://www.thefederation.uk/examinations/paces/format
 * No score here is an official examiner judgement or pass prediction.
 */
export const SKILLS={A:'Physical examination',B:'Identifying physical signs',C:'Clinical communication',D:'Differential diagnosis',E:'Clinical judgement',F:"Managing patients' concerns",G:'Maintaining patient welfare'};
export const GRADES=['Unsatisfactory','Borderline','Satisfactory'];
const rule=(label,pattern,practice)=>({label,pattern,practice});
const COMMON={
 C:[
 rule('Introduced themselves and established rapport',/\b(?:my name is|i am dr|i'm dr|i am doctor|i'm doctor|good morning|good afternoon|hello)\b/i,'Introduce yourself, your role and the purpose of the encounter.'),
 rule('Elicited a focused clinical history',/\b(?:how long|when did|have you|do you|could you tell|tell me about|what happens|what brings|describe your|where is)\b/i,'Ask focused questions about the relevant clinical history.'),
 rule('Gave a plain-language explanation',/\b(?:this means|the results?|the scan|i will explain|let me explain|we need|we should|because|this could|this might|what we know)\b/i,'Explain what you know, what remains uncertain and the next steps without jargon.'),
 rule('Checked understanding or invited questions',/\b(?:does that make sense|is that clear|do you understand|any questions|questions for me|what have you understood)\b/i,'Check understanding and invite the patient’s questions.')
 ],
 D:[
 rule('Described the working diagnosis or a clinical possibility',/\b(?:working diagnosis|differential|suspect|suggests|could be|might be|likely to be|consider|my impression)\b/i,'State your leading diagnosis with the supporting findings.'),
 rule('Considered alternatives or serious differentials',/\b(?:other causes|also consider|differential|rule out|exclude|alternative|cannot exclude)\b/i,'Identify reasonable alternatives and how you would distinguish them.')
 ],
 E:[
 rule('Proposed relevant investigations',/\b(?:arrange|order|request|need|should|will|would).{0,90}\b(?:tests?|blood|scan|ecg|echo|ctpa|biopsy|sample|x.ray|ultrasound|investigation|specialist|referral)\b/i,'Name relevant tests and explain their clinical purpose.'),
 rule('Explained a plan, treatment or follow-up',/\b(?:treatment|follow.up|management|refer|specialist|monitor|admission|admit|appointment|plan|review|prescrib)\b/i,'Offer an actionable, patient-specific plan and follow-up route.'),
 rule('Safety-netted or arranged urgent escalation',/\b(?:urgent|immediate|worse|worsen|deteriorat|emergency|red flag|escalat|call 999|ambulance|return to hospital)\b/i,'Discuss when urgent review is needed or when to escalate.')
 ],
 F:[
 rule('Asked about worries and expectations',/\b(?:worried|worry|concern|fear|afraid|what matters|what do you think|feel about|expecting)\b/i,'Ask what worries the patient and explore expectations.'),
 rule('Acknowledged the patient’s emotion',/\b(?:i am sorry|i'm sorry|that sounds|understand why|must be hard|must be difficult|i can see|i appreciate)\b/i,'Acknowledge emotions specifically and avoid false reassurance.'),
 rule('Offered practical support',/\b(?:family|partner|husband|wife|relative|support|help you|mother|daughter|childcare|someone with you)\b/i,'Address the practical concern or ask who the patient wants involved.')
 ],
 G:[
 rule('Asked permission or consent',/\b(?:may i|can i examine|permission|consent|is it okay if|would you mind|are you happy for me)\b/i,'Explain the action and seek consent when appropriate.'),
 rule('Checked patient comfort and dignity',/\b(?:comfortable|comfort|privacy|dignity|curtain|painful|need a break|sit up|lie down)\b/i,'Check comfort, privacy, safe positioning and dignity.'),
 rule('Closed respectfully',/\b(?:thank you|please|any questions|anything else|take your time|let me know)\b/i,'Close respectfully, check understanding and invite further questions.')
 ]
};
const CASE={
 0:{D:[],E:[rule('Explained diagnostic uncertainty',/\b(?:cannot confirm|can't confirm|not confirmed|not certain|not sure|might be cancer|could be cancer|biopsy|shadow|scan shows)\b/i,'Explain that the CT is concerning but cancer has not been confirmed.'),rule('Discussed tissue diagnosis or specialist review',/\b(?:biopsy|bronchoscopy|sample|respiratory team|specialist|follow.up)\b/i,'Explain tissue sampling, specialist review and who contacts Helen.')],F:[rule('Explored cancer fear and family support',/\b(?:sister|cancer|husband|family)\b/i,'Ask about Helen’s fear following her sister’s illness and whether she wants support.')]},
 1:{D:[rule('Recognised possible fibrotic ILD',/\b(?:fibrosis|interstitial|ild|clubbing|crackles)\b/i,'Describe basal crackles and clubbing and consider fibrotic ILD.')],E:[rule('Suggested appropriate ILD work-up',/\b(?:hrct|lung function|spirometry|gas transfer|autoimmune|ild team)\b/i,'Request HRCT, lung function and specialist ILD discussion.')]},
 2:{D:[rule('Considered pulmonary embolism',/\b(?:pulmonary embol|blood clot|\bpe\b|thromboembol|\bvte\b)\b/i,'Consider PE and relevant alternatives urgently.')],E:[rule('Elicited thromboembolic risk factors',/\b(?:flight|travel|calf|swelling|contracept|dvt|clot)\b/i,'Explore travel, contraception and unilateral leg symptoms.'),rule('Planned urgent PE assessment',/\b(?:urgent|senior|wells|d.dimer|ctpa|anticoagul|hospital)\b/i,'Escalate and describe a safe PE assessment pathway.')]},
 3:{D:[rule('Recognised mitral regurgitation features',/\b(?:mitral|regurgitation|pansystolic|axilla)\b/i,'Identify the murmur location and radiation and name the likely valve disease.')],E:[rule('Recommended echocardiography',/\b(?:echo|echocardi|valve|ventricular function)\b/i,'Explain why echocardiography is needed to assess severity.')]},
 4:{D:[rule('Recognised parkinsonism',/\b(?:parkinson|bradykinesi|rigidity|resting tremor)\b/i,'Describe bradykinesia, rigidity and tremor.')],E:[rule('Considered falls or atypical features',/\b(?:falls?|gait|balance|medication|drug.induced|atypical)\b/i,'Address falls precautions, drug causes and atypical features.')]},
 5:{C:[rule('Explored why the patient needs to leave',/\b(?:why.*leave|why.*home|mother|dementia|care for)\b/i,'Ask about his mother and the practical reason for leaving.')],E:[rule('Recognised capacity and shared decision-making',/\b(?:capacity|understand the risks|able to decide|your decision|options)\b/i,'Assess decision-making capacity without equating disagreement with incapacity.'),rule('Suggested an alternative safe arrangement',/\b(?:brother|neighbour|support|return|call|stay)\b/i,'Explore family support and agree a safe plan.')]},
 6:{D:[rule('Considered ascites / liver disease',/\b(?:ascites|cirrhosis|liver|portal hypertension)\b/i,'Identify ascites and possible causes.')],E:[rule('Considered complications or diagnostic paracentesis',/\b(?:paracentesis|ascitic tap|ultrasound|infection|bleeding)\b/i,'Consider infection, liver decompensation and ascitic sampling.')]},
 7:{D:[rule('Considered inflammatory small-joint arthritis',/\b(?:rheumatoid|synovitis|inflammatory|morning stiffness)\b/i,'Consider rheumatoid arthritis and relevant differentials.')],E:[rule('Addressed function or pregnancy plans',/\b(?:pregnan|baby|work|scissors|dmard|rheumatolog)\b/i,'Discuss functional impact, family plans and specialist treatment.')]},
 8:{D:[rule('Recognised possible diabetes',/\b(?:diabetes|hyperglyc|glucose|hba1c)\b/i,'Discuss possible diabetes and how it is confirmed.')],E:[rule('Addressed acute and foot risks',/\b(?:ketone|dka|hhs|dehydrat|foot|feet|neuropath|ulcer)\b/i,'Assess acute hyperglycaemia risk and foot safety.')]},
 9:{D:[rule('Considered migraine',/\b(?:migraine|headache syndrome|cluster headache)\b/i,'Explain the likely headache type and differential.')],E:[rule('Checked red flags',/\b(?:thunderclap|sudden|neurolog|weakness|fever|neck stiffness|seizure|red flag)\b/i,'Screen for secondary headache red flags.')] }
};
const allowed=c=>c.kind==='Communication'?['C','E','F','G']:c.kind==='Consultation'?['A','B','C','D','E','F','G']:['A','B','D','E','G'];
const candidateText=r=>[...(r?.messages||[]).filter(x=>x?.who==='you'&&typeof x.text==='string'&&x.text.trim()).map(x=>x.text.trim()),...Object.values(r?.answers||{}).filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim())];
const shorten=s=>s.length>155?s.slice(0,152)+'…':s;
const unsafe=(c,utterances)=>utterances.filter(u=>{
 const s=u.toLowerCase();
 if(c.id===0)return /nothing wrong|everything (?:is|s) (?:fine|normal)|you (?:are|look) (?:fine|alright)|definitely not cancer|cancer is confirmed/.test(s);
 if(c.id===2)return /you can go home|safe to go home|no need.*(?:test|hospital)/.test(s);
 if(c.id===5)return /you have no capacity|you cannot decide|i will force you/.test(s);
 return false;
});
function assessSkill(c,id,r,utterances,unsafeStatements){
 const relevant=allowed(c).includes(id),examActions=(r?.signs||[]).length;
 if(!relevant)return {id,name:SKILLS[id],applicable:false,grade:null,label:'Not assessed in this encounter',evidence:[],missing:[],note:''};
 if(id==='A'||id==='B')return {id,name:SKILLS[id],applicable:true,grade:null,label:'Not assessable digitally',evidence:[],missing:[],note:examActions+' selected simulated examination action(s); clicks do not establish actual technique or accurate identification of signs.'};
 const rules=[...(COMMON[id]||[]),...((CASE[c.id]||{})[id]||[])];
 const hits=rules.map(x=>({...x,quote:utterances.find(t=>x.pattern.test(t))}));
 const evidence=hits.filter(x=>x.quote).map(x=>({criterion:x.label,quote:shorten(x.quote)}));
 const missing=hits.filter(x=>!x.quote).map(x=>({criterion:x.label,practice:x.practice})).slice(0,4);
 const meaningful=utterances.filter(x=>x.split(/\s+/).length>=3).length;
 let grade=null;
 if((id==='E'||id==='G')&&unsafeStatements.length)grade=0;
 else if(evidence.length>=Math.max(2,Math.ceil(rules.length*.55))&&meaningful>=3)grade=2;
 else if(evidence.length)grade=1;
 else if(meaningful>=4)grade=0;
 return {id,name:SKILLS[id],applicable:true,grade,label:grade===null?'Insufficient evidence':GRADES[grade],evidence,missing,unsafe:(id==='E'||id==='G')?unsafeStatements.map(shorten):[],note:unsafeStatements.length&&(id==='E'||id==='G')?'Potentially unsafe statement requires supervisory review.':grade===null?'Insufficient recorded evidence for a defensible provisional rating.':'Provisional rating from recorded words only; not a validated PACES mark.'};
}
function reviewer(index,skills,turns){
 const ids=index===1?['A','B','D','E']:['C','F','G'];
 const selected=skills.filter(x=>ids.includes(x.id)&&x.applicable);
 const strengths=selected.flatMap(s=>s.evidence.map(e=>({skill:s.id,...e}))).slice(0,3);
 const improvements=selected.flatMap(s=>s.missing.map(m=>({skill:s.id,...m}))).slice(0,3);
 const safety=selected.flatMap(s=>(s.unsafe||[]).map(quote=>({skill:s.id,quote})));
 return {name:index===1?'Consultant 1 · Clinical':'Consultant 2 · Communication',role:index===1?'Clinical reasoning and judgement':'Communication, concerns and welfare',
  skills:selected.map(s=>s.id),strengths,improvements,safety,
  summary:!turns?'No candidate dialogue or examiner answers were recorded; only developmental advice is possible.':safety.length?'Potential patient-safety concern in recorded words; review before the next case.':strengths.length?'Feedback based on the candidate’s actual statements and case actions.':'Little assessable evidence recorded in this area.',
  note:selected.some(s=>s.id==='A'||s.id==='B')?'Hands-on physical technique and sign recognition cannot be graded from simulated clicks.':null
 };
}
export function gradeEncounter(c,r){
 if(!c)throw Error('A patient case is required');
 const utterances=candidateText(r),unsafeStatements=unsafe(c,utterances);
 const skills=Object.keys(SKILLS).map(id=>assessSkill(c,id,r,utterances,unsafeStatements));
 const rated=skills.filter(s=>s.applicable&&s.grade!==null);
 return {schema:'educational-paces-1',caseId:c.id,title:c.title,kind:c.kind,
  studentTurns:utterances.length,examinerAnswers:Object.values(r?.answers||{}).filter(x=>typeof x==='string'&&x.trim()).length,examActions:(r?.signs||[]).length,
  evidenceQuality:utterances.length>=8?'Good transcript coverage':utterances.length>=3?'Partial transcript coverage':'Very limited transcript coverage',
  skills,consultants:[reviewer(1,skills,utterances.length),reviewer(2,skills,utterances.length)],
  observedPoints:rated.reduce((n,s)=>n+s.grade,0),observedMax:rated.length*2,
  safetyConcerns:unsafeStatements.map(shorten),
  nextPractice:skills.flatMap(s=>s.applicable?s.missing.map(m=>m.practice):[]).filter((x,i,a)=>a.indexOf(x)===i).slice(0,4),
  disclaimer:'Provisional educational feedback only. Not an official PACES score, pass prediction, or observation of examination technique.'};
}
export function aggregateReports(reports){
 const r=reports.filter(Boolean);
 return {cases:r.length,skills:Object.keys(SKILLS).map(id=>{
  const relevant=r.flatMap(x=>x.skills.filter(s=>s.id===id&&s.applicable));
  const rated=relevant.filter(s=>s.grade!==null);
  return {id,name:SKILLS[id],encounters:relevant.length,rated:rated.length,average:rated.length?Number((rated.reduce((n,s)=>n+s.grade,0)/rated.length).toFixed(2)):null,needsWork:rated.filter(s=>s.grade<2).length};
 }),priorities:r.flatMap(x=>x.nextPractice).filter((x,i,a)=>a.indexOf(x)===i).slice(0,6),
 disclaimer:'Practice trends from assessable recorded evidence only; not an official PACES pass/fail result.'};
}
