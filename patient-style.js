/**
 * Distinct fictional patient identities for offline/on-device speech and the
 * expressive illustrated video fallback. No voice is cloned or impersonated.
 */
export const PATIENT_STYLE=[
 {voice:'female',pitch:1.05,rate:.91,skin:'#e5b59b',hair:'#40302d',accent:'#a3b4c8',hairdo:'wave',glasses:false},
 {voice:'male',pitch:.83,rate:.85,skin:'#d6aa8a',hair:'#b8b5ac',accent:'#a2b7c3',hairdo:'short',glasses:false},
 {voice:'female',pitch:1.02,rate:.96,skin:'#ad785c',hair:'#24252a',accent:'#bdcbe0',hairdo:'long',glasses:false},
 {voice:'male',pitch:.88,rate:.90,skin:'#d9a98b',hair:'#66605b',accent:'#8dc0cc',hairdo:'short',glasses:false},
 {voice:'female',pitch:1.0,rate:.85,skin:'#deb59c',hair:'#71645c',accent:'#a6bcdf',hairdo:'bob',glasses:true},
 {voice:'male',pitch:.91,rate:.95,skin:'#a46f4e',hair:'#25262b',accent:'#a7c9bb',hairdo:'short',glasses:false},
 {voice:'male',pitch:.85,rate:.87,skin:'#c99b7e',hair:'#625449',accent:'#b8b9d4',hairdo:'short',glasses:false},
 {voice:'female',pitch:1.09,rate:.97,skin:'#e5b49b',hair:'#533a35',accent:'#d5b8b3',hairdo:'long',glasses:false},
 {voice:'male',pitch:.85,rate:.89,skin:'#dbb093',hair:'#b0a69a',accent:'#91b1c8',hairdo:'short',glasses:true},
 {voice:'female',pitch:1.07,rate:.94,skin:'#b58062',hair:'#232328',accent:'#a5a1cb',hairdo:'long',glasses:false}
];
export function patientStyle(patient){return PATIENT_STYLE[patient?.id]||PATIENT_STYLE[0];}
const FEMALE=['kate','serena','libby','martha','samantha','victoria','karen','moira','fiona','tessa','allison','zoe','susan','ava','emma','siri female','female'];
const MALE=['daniel','oliver','george','arthur','james','thomas','aaron','alex','fred','rishi','david','ryan','siri male','male'];
export function selectDeviceVoice(voices,patient){
 const profile=patientStyle(patient),kind=profile.voice;
 const names=kind==='female'?FEMALE:MALE;
 const pool=(voices||[]).filter(v=>/^en([-_]|$)/i.test(v.lang||''));
 if(!pool.length)return null;
 function score(v){
  const name=(v.name||'').toLowerCase(),lang=(v.lang||'').toLowerCase();
  const genderMatches=names.some(n=>name.includes(n));
  const other=(kind==='female'?MALE:FEMALE).some(n=>name.includes(n));
  return (genderMatches?100:0)+(other?-110:0)
   +(lang.startsWith('en-gb')?24:0)
   +(/premium|enhanced|neural|natural|high quality/.test(name)?13:0)
   +(!v.localService?2:0);
 }
 return [...pool].sort((a,b)=>score(b)-score(a))[0];
}
export function speechSettings(patient){
 const s=patientStyle(patient);
 return {voice:s.voice,rate:s.rate,pitch:s.pitch};
}
