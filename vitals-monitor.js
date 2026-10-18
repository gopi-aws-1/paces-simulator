/** Fictional educational telemetry. Never represents a clinical measurement. */
const defaults={hr:76,spo2:98,rr:16,sys:124,dia:78};
export function caseVitals(patient){
 const stated=patient.vitals||patient.observations||{};
 const read=(names,fallback,min,max)=>{
  for(const name of names){const raw=stated[name];const n=Number(raw);if(raw!==undefined&&raw!==null&&raw!==''&&Number.isFinite(n))return Math.max(min,Math.min(max,Math.round(n)));}
  return fallback;
 };
 return {hr:read(['hr','heartRate','pulse'],defaults.hr,35,180),spo2:read(['spo2','SpO2','oxygenSaturation'],defaults.spo2,70,100),rr:read(['rr','respiratoryRate'],defaults.rr,5,45),sys:read(['sys','systolic'],defaults.sys,65,220),dia:read(['dia','diastolic'],defaults.dia,35,140),isDefault:!Object.keys(stated).length};
}
export function monitorMarkup(patient){
 const v=caseVitals(patient);
 return `<div class="clinical-monitor" aria-label="Animated simulated bedside vital signs" data-base-hr="${v.hr}" data-base-spo2="${v.spo2}" data-base-rr="${v.rr}">
 <div class="monitor-topline"><span class="monitor-dot"></span> BEDSIDE MONITOR <span class="monitor-sim">SIMULATED</span></div>
 <div class="monitor-line ecg"><div class="monitor-label">ECG · HR</div><svg viewBox="0 0 260 56" preserveAspectRatio="none" aria-hidden="true"><path class="monitor-trace monitor-ecg" d="M0 29 H25 L32 26 L39 29 H49 L54 35 L60 5 L66 49 L73 26 L80 29 H115 L122 26 L129 29 H139 L144 35 L150 5 L156 49 L163 26 L170 29 H205 L212 26 L219 29 H229 L234 35 L240 5 L246 49 L253 26 L260 29"/></svg><strong class="monitor-hr">${v.hr}</strong></div>
 <div class="monitor-line oxygen"><div class="monitor-label">SpO₂</div><svg viewBox="0 0 260 42" preserveAspectRatio="none" aria-hidden="true"><path class="monitor-trace monitor-pleth" d="M0 28 Q11 29 16 14 Q21 2 29 23 Q37 36 45 28 Q56 29 61 14 Q66 2 74 23 Q82 36 90 28 Q101 29 106 14 Q111 2 119 23 Q127 36 135 28 Q146 29 151 14 Q156 2 164 23 Q172 36 180 28 Q191 29 196 14 Q201 2 209 23 Q217 36 225 28 Q236 29 241 14 Q246 2 254 23 L260 28"/></svg><strong class="monitor-spo2">${v.spo2}<small>%</small></strong></div>
 <div class="monitor-footer"><div><span>RESP</span><strong class="monitor-rr">${v.rr}<small>/min</small></strong></div><div><span>NIBP · mmHg</span><strong>${v.sys}/${v.dia}</strong></div></div>
 <div class="monitor-disclaimer">${v.isDefault?'Illustrative normal-range readings · no case observations supplied':'Case-defined simulated readings'} · Not real monitoring</div></div>`;
}
export function animateMonitor(root){
 if(!root)return()=>{};
 const v={hr:Number(root.dataset.baseHr),spo2:Number(root.dataset.baseSpo2),rr:Number(root.dataset.baseRr)};
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 if(reduced)return()=>{};
 let n=0;
 const timer=window.setInterval(()=>{
  if(!root.isConnected){window.clearInterval(timer);return;}
  n+=1;
  root.querySelector('.monitor-hr').textContent=String(Math.max(35,Math.min(180,v.hr+Math.round(Math.sin(n*.71)*2))));
  root.querySelector('.monitor-spo2').innerHTML=String(Math.max(70,Math.min(100,v.spo2+(n%9===0?-1:0))))+'<small>%</small>';
  root.querySelector('.monitor-rr').innerHTML=String(Math.max(5,Math.min(45,v.rr+Math.round(Math.sin(n*.29)))))+'<small>/min</small>';
 },1700);
 return()=>window.clearInterval(timer);
}
