/** Photographic stand-in for a live video actor. These are stock images, NOT the case patient. */
const photos={
 female:'https://pikwizard.com/pw/medium/f0475f0baa249b79b6354e854aad8900.jpg',
 male:'https://pikwizard.com/pw/medium/b81cfa7d376d16f87b671099a7d5eac1.jpg'
};
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function photographicStage(patient){
 const sex=/woman|female/i.test(String(patient.sex))?'female':'male';
 return `<div class="photo-stage" id="photoStage" role="group" aria-label="Photographic hospital illustration, using stock models rather than the fictional patient">
 <img class="ward-photograph" id="wardPhotograph" src="${photos[sex]}" alt="Illustrative photograph of one patient alone in a hospital bed, facing the student; this is not the fictional patient" referrerpolicy="no-referrer" fetchpriority="high" decoding="async"/>
 <div class="photo-light" aria-hidden="true"></div>
 <div class="consultation-focus" aria-hidden="true"></div>
 <div class="patient-presence" id="patientPresence"><span class="presence-indicator" aria-hidden="true"></span><span id="presenceText">Patient listening</span><span class="presence-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div>
 <div class="photo-disclaimer">One-on-one practice · Photographic stand-in, not live video</div>
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
