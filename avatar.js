import {patientStyle} from './patient-style.js';
/** Expressive *illustrated* patient, not a photorealistic video or face clone.
 * Lip openings follow speaking state / WebAudio amplitude, and eyes blink.
 */
function ellipse(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function arc(ctx,x,y,r,a,b,color,width=3){ctx.beginPath();ctx.arc(x,y,r,a,b);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
function blend(hex,mix,fraction){const parts=hex.replace('#','').match(/.{2}/g).map(x=>parseInt(x,16));const target=mix.replace('#','').match(/.{2}/g).map(x=>parseInt(x,16));return '#'+parts.map((v,i)=>Math.round(v*(1-fraction)+target[i]*fraction).toString(16).padStart(2,'0')).join('');}
const TWO=Math.PI*2;
export function drawPatient(ctx,patient,seconds,speaking=false,audioLevel=0,reduceMotion=false){
 const style=patientStyle(patient),W=960,H=650;
 const breath=reduceMotion?0:Math.sin(seconds*1.7)*2.0;
 const mouthActivity=speaking?(reduceMotion?.26:Math.max(.17,Math.min(1,.4+.27*Math.sin(seconds*17)+.21*Math.sin(seconds*10)+audioLevel*.65))):0;
 const blinkPhase=(seconds+patient.id*.57)%4.5;
 const blinking=!reduceMotion&&blinkPhase>3.94&&blinkPhase<4.12;
 ctx.clearRect(0,0,W,H);
 const wall=ctx.createLinearGradient(0,0,W,H);
 wall.addColorStop(0,'#22465a');wall.addColorStop(.55,'#315465');wall.addColorStop(1,'#122f42');
 ctx.fillStyle=wall;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#ffffff0d';ctx.fillRect(0,82,W,11);
 // Quiet ward background, intentionally out of focus to emphasise the patient's face.
 ctx.fillStyle='#89c1bc21';ctx.fillRect(95,85,145,275);ctx.fillRect(780,90,105,275);
 ctx.fillStyle='#b7d9da15';ctx.fillRect(107,97,120,250);ctx.fillRect(793,100,79,240);
 ctx.strokeStyle='#bde0e033';ctx.lineWidth=7;ctx.strokeRect(95,85,145,275);
 ctx.fillStyle='#0a293755';ctx.fillRect(0,515,W,135);
 ellipse(ctx,480,660,360,230,'#071c2aa9');
 const headBob=reduceMotion?0:Math.sin(seconds*.77+patient.id)*1.5;
 ctx.save();ctx.translate(0,headBob+breath);
 // Torso, shoulders, cardigan or hospital-appropriate everyday clothing.
 ctx.beginPath();ctx.moveTo(365,405);ctx.bezierCurveTo(290,419,250,460,230,660);
 ctx.lineTo(730,660);ctx.bezierCurveTo(710,461,668,417,593,405);ctx.closePath();
 const coat=ctx.createLinearGradient(250,425,695,640);coat.addColorStop(0,blend(style.accent,'#ffffff',.12));coat.addColorStop(1,blend(style.accent,'#000000',.38));
 ctx.fillStyle=coat;ctx.fill();
 ctx.lineWidth=3;ctx.strokeStyle='#ffffff14';ctx.stroke();
 // Neck and neck shade.
 ctx.fillStyle=blend(style.skin,'#633626',.16);
 ctx.beginPath();ctx.moveTo(438,394);ctx.lineTo(438,443);ctx.quadraticCurveTo(480,481,522,442);ctx.lineTo(522,395);ctx.closePath();ctx.fill();
 ellipse(ctx,480,424,38,44,style.skin);
 // Hair behind head.
 if(style.hairdo!=='short'){
  ellipse(ctx,480,307,139,174,style.hair);
  ctx.fillStyle=style.hair;
  ctx.beginPath();ctx.moveTo(351,292);ctx.quadraticCurveTo(321,399,334,492);ctx.lineTo(410,472);ctx.lineTo(395,320);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(567,305);ctx.lineTo(558,463);ctx.lineTo(622,490);ctx.quadraticCurveTo(637,371,605,288);ctx.closePath();ctx.fill();
 }
 // Ears and softer skin-shaded face.
 ellipse(ctx,366,315,19,35,blend(style.skin,'#784634',.09));
 ellipse(ctx,594,315,19,35,blend(style.skin,'#784634',.09));
 const skin=ctx.createLinearGradient(383,194,550,395);
 skin.addColorStop(0,blend(style.skin,'#ffffff',.13));skin.addColorStop(.67,style.skin);skin.addColorStop(1,blend(style.skin,'#7f4331',.12));
 ellipse(ctx,480,304,112,136,skin);
 // Jawline warmth and expression cheeks.
 ellipse(ctx,410,338,27,15,blend(style.skin,'#b85c54',.14));
 ellipse(ctx,550,338,27,15,blend(style.skin,'#b85c54',.14));
 // Hairline/top, case-specific length and styling.
 ctx.fillStyle=style.hair;
 ctx.beginPath();ctx.moveTo(368,268);ctx.bezierCurveTo(358,174,426,151,487,157);
 ctx.bezierCurveTo(556,154,601,189,592,260);
 if(style.hairdo==='wave'||style.hairdo==='long'||style.hairdo==='bob'){
  ctx.bezierCurveTo(576,219,548,206,529,203);ctx.bezierCurveTo(484,239,432,206,400,228);ctx.quadraticCurveTo(390,246,368,268);
 }else{
  ctx.bezierCurveTo(567,236,542,219,511,215);ctx.bezierCurveTo(453,210,404,224,368,268);
 }
 ctx.closePath();ctx.fill();
 if(patient.age>=58&&style.hairdo==='short'){
  ctx.strokeStyle=blend(style.hair,'#ffffff',.34);ctx.lineWidth=4;
  for(let i=0;i<8;i++)arc(ctx,417+i*16,197,12,3.3,5.5,ctx.strokeStyle,2);
 }
 const eyebrow=blend(style.hair,'#26191c',.2);
 ctx.strokeStyle=eyebrow;ctx.lineCap='round';ctx.lineWidth=5;
 ctx.beginPath();ctx.moveTo(404,271);ctx.quadraticCurveTo(428,262,451,272);ctx.stroke();
 ctx.beginPath();ctx.moveTo(509,272);ctx.quadraticCurveTo(531,262,556,271);ctx.stroke();
 // Expressive eye shapes. Brief natural blinks.
 const eyeH=blinking?1.6:9;
 ellipse(ctx,427,291,24,eyeH,'#f5f3ee');
 ellipse(ctx,533,291,24,eyeH,'#f5f3ee');
 if(!blinking){
  ellipse(ctx,429,291,9,9,'#60493f');ellipse(ctx,531,291,9,9,'#60493f');
  ellipse(ctx,430,290,5,5,'#242d31');ellipse(ctx,532,290,5,5,'#242d31');
  ellipse(ctx,433,287,2.3,2.3,'#ffffff');ellipse(ctx,535,287,2.3,2.3,'#ffffff');
 }
 ctx.strokeStyle=blend(style.skin,'#4e2e27',.48);ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(405,289);ctx.quadraticCurveTo(428,281,452,289);ctx.stroke();
 ctx.beginPath();ctx.moveTo(508,289);ctx.quadraticCurveTo(531,281,555,289);ctx.stroke();
 // Nose shading.
 ctx.strokeStyle=blend(style.skin,'#714536',.35);ctx.lineWidth=3;
 ctx.beginPath();ctx.moveTo(483,303);ctx.quadraticCurveTo(477,326,480,331);ctx.lineTo(489,332);ctx.stroke();
 ellipse(ctx,474,332,3.5,2,blend(style.skin,'#784032',.45));
 ellipse(ctx,495,332,3.5,2,blend(style.skin,'#784032',.45));
 // Lip silhouette and visible mouth cavity respond to speech.
 const lip=blend(style.skin,'#853e47',.34);
 ctx.fillStyle=lip;
 ctx.beginPath();ctx.ellipse(482,368,31,6+mouthActivity*11,0,0,TWO);ctx.fill();
 if(speaking){
  ellipse(ctx,482,368,25,Math.max(3,mouthActivity*11),'#512d32');
  if(mouthActivity>.48)ellipse(ctx,482,364,18,2.5,'#fff7ed');
 }else{
  ctx.strokeStyle=blend(style.skin,'#762f34',.6);ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(454,366);ctx.quadraticCurveTo(481,379,509,365);ctx.stroke();
 }
 // Age-appropriate subtle expression lines.
 if(patient.age>=58){
  ctx.strokeStyle=blend(style.skin,'#785344',.22);ctx.lineWidth=1.7;
  for(const sign of [-1,1]){
   ctx.beginPath();ctx.moveTo(480+sign*72,322);ctx.quadraticCurveTo(480+sign*91,329,480+sign*86,336);ctx.stroke();
   ctx.beginPath();ctx.moveTo(480+sign*55,351);ctx.lineTo(480+sign*61,366);ctx.stroke();
  }
 }
 if(style.glasses){
  ctx.strokeStyle='#35464cb3';ctx.lineWidth=5;
  ctx.strokeRect(395,271,67,43);ctx.strokeRect(498,271,67,43);
  ctx.beginPath();ctx.moveTo(462,282);ctx.quadraticCurveTo(480,270,498,282);ctx.stroke();
 }
 // Shirt collar and neckline.
 ctx.fillStyle='#eff3f3';ctx.beginPath();ctx.moveTo(438,421);ctx.lineTo(480,467);ctx.lineTo(522,421);ctx.lineTo(500,480);ctx.lineTo(480,490);ctx.lineTo(460,480);ctx.closePath();ctx.fill();
 ctx.restore();
 const vignette=ctx.createLinearGradient(0,470,0,H);vignette.addColorStop(0,'#06192700');vignette.addColorStop(1,'#0518269f');ctx.fillStyle=vignette;ctx.fillRect(0,470,W,180);
}
