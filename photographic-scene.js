/** Photographic stand-in for a live video actor. These are stock images, NOT the case patient. */
const photos={
 female:'https://images.unsplash.com/photo-1631558556820-89123ea1ef89?auto=format&fit=crop&w=1600&q=82',
 male:'https://images.unsplash.com/photo-1712232415633-095dc9e03c5d?auto=format&fit=crop&w=1600&q=82'
};
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function photographicStage(patient){
 const sex=/woman|female/i.test(String(patient.sex))?'female':'male';
 return `<div class="photo-stage" id="photoStage" role="group" aria-label="Photographic hospital illustration, using stock models rather than the fictional patient">
 <img class="ward-photograph" id="wardPhotograph" src="${photos[sex]}" alt="Photograph of an adult patient receiving care in a hospital bed; illustrative stock photograph, not the fictional patient" referrerpolicy="no-referrer" fetchpriority="high" decoding="async"/>
 <div class="photo-light" aria-hidden="true"></div>
 <div class="patient-presence" id="patientPresence"><span class="presence-indicator" aria-hidden="true"></span><span id="presenceText">Patient ready to speak</span><span class="presence-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
 <div class="photo-disclaimer">Illustrative hospital photograph · Simulated patient ${escapeHtml(patient.name)}</div>
 </div>`;
}
export function setupPhotographicStage(){
 const img=document.getElementById('wardPhotograph');
 if(!img)return;
 img.addEventListener('error',()=>{
  document.getElementById('videoFrame')?.classList.add('photo-unavailable');
  document.getElementById('videoMode')?.replaceChildren(document.createTextNode('Illustrated ward · offline photo fallback'));
 },{once:true});
}
