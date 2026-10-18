import {patientStyle} from './patient-style.js';
const safe = value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
/** An entirely fictional, responsive illustrated ward. No patient photographs or invented clinical observations. */
export function wardScene(patient,position='lying'){
 const style=patientStyle(patient),skin=safe(style.skin),hair=safe(style.hair),accent=safe(style.accent);
 const pose=['lying','sitting','standing'].includes(position)?position:'lying';
 const face=`<g class="ward-head"><ellipse cx="0" cy="0" rx="43" ry="49" fill="${skin}" stroke="#885c4b" stroke-opacity=".24" stroke-width="2"/>
 <path d="M-43 -9 Q-52 -55 -11 -57 Q23 -67 43 -32 L43 -12 Q32 -43 10 -40 Q-19 -27 -43 -9Z" fill="${hair}"/>
 <path d="M-25 -3q11 -7 19 0M8 -3q11 -7 19 0" fill="none" stroke="#463a39" stroke-width="3" stroke-linecap="round"/>
 <g class="ward-eyes"><circle cx="-16" cy="0" r="3.2" fill="#23343a"/><circle cx="16" cy="0" r="3.2" fill="#23343a"/></g>
 <path d="M1 7l-4 11h8" fill="none" stroke="#936959" stroke-width="2.2" stroke-linecap="round"/>
 <path class="ward-mouth" d="M-12 28q12 8 24 0" fill="none" stroke="#824d52" stroke-width="3" stroke-linecap="round"/></g>`;
 const patientBody = `<g class="ward-person" aria-label="Illustrated patient in ${pose} position">
  <g class="body-lying">
    <path d="M361 349Q380 322 431 319L562 317Q618 330 637 366L651 399L352 408Z" fill="#edf5f7" stroke="#99b9c7" stroke-width="3"/>
    <path d="M384 338v55m19 -64v64m33 -67v70m34 -72v74m34 -72v74m33 -70v69m31 -65v60" stroke="#c0d5dc" stroke-dasharray="3 12" stroke-width="3"/>
    <path d="M410 372Q458 360 510 375L674 405Q715 419 713 448L388 452Z" fill="#6f91b1"/>
    <path d="M387 430Q545 417 711 453L710 496Q546 466 384 474Z" fill="#9fb9d0"/>
    <path d="M641 453l46 34 61 7m-112 -25 40 37 61 6" stroke="#e4e9ee" stroke-width="24" stroke-linecap="round"/>
    <g transform="translate(350 334) rotate(-74)">${face}</g>
    <path d="M425 358q20 26 45 3" fill="none" stroke="${skin}" stroke-width="15" stroke-linecap="round"/>
  </g>
  <g class="body-sitting">
    <path d="M442 300Q399 325 397 393L400 459L548 465L551 386Q546 334 503 304Z" fill="#e8f3f5" stroke="#95b5bf" stroke-width="3"/>
    <path d="M456 333v114m27 -121v117m28 -108v109" stroke="#bdd2d9" stroke-width="3" stroke-dasharray="4 12"/>
    <path d="M408 444q66 -28 136 0l70 22-13 40H437Z" fill="#85a4c1"/>
    <path d="M437 474l162 20 78 4m-185 -5 102 32 86 8" fill="none" stroke="#a1bbd4" stroke-width="37" stroke-linecap="round"/>
    <path d="M415 358l-48 68 42 34m129 -98 30 62-37 38" fill="none" stroke="${skin}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(471 255)">${face}</g>
  </g>
  <g class="body-standing">
    <path d="M463 224Q433 231 415 272L402 396L551 398L533 271Q517 230 492 224Z" fill="#eaf4f5" stroke="#9eb5c3" stroke-width="3"/>
    <path d="M439 257v125m31 -141v144m33 -128v123" fill="none" stroke="#bed5df" stroke-width="3" stroke-dasharray="3 12"/>
    <path d="M420 281l-39 109m147 -112 36 112" stroke="${skin}" stroke-width="19" stroke-linecap="round"/>
    <path d="M429 400l-11 130m112 -130 12 130" stroke="#8baac8" stroke-width="34" stroke-linecap="round"/>
    <path d="M398 533l-30 6h75m81 -6 53 6h-70" stroke="#eaf2f5" stroke-width="17" stroke-linecap="round"/>
    <g transform="translate(479 177)">${face}</g>
  </g>
 </g>`;
 return `<svg class="ward-art pose-${pose}" id="wardArt" viewBox="0 0 1000 620" role="img" aria-label="${safe(patient.name)} in a fictional hospital ward, ${pose==='lying'?'lying on the bed':pose==='sitting'?'sitting on the bed':'standing beside the bed'}" preserveAspectRatio="xMidYMid meet">
 <defs>
  <linearGradient id="hospitalWall" x2="0" y2="1"><stop stop-color="#e9e4de"/><stop offset="1" stop-color="#c8d6d9"/></linearGradient>
  <linearGradient id="hospitalFloor" x2="0" y2="1"><stop stop-color="#ccd9dd"/><stop offset="1" stop-color="#a8bdc6"/></linearGradient>
  <linearGradient id="bedBlanket" x2="0" y2="1"><stop stop-color="#bfd2df"/><stop offset="1" stop-color="#708ea9"/></linearGradient>
  <linearGradient id="wardCurtain" x2="0" y2="1"><stop stop-color="#f9f1eb"/><stop offset=".6" stop-color="#f6e8e1"/><stop offset=".61" stop-color="#e8b9b6"/><stop offset="1" stop-color="#daa3a0"/></linearGradient>
  <filter id="softWardShadow"><feGaussianBlur stdDeviation="9"/></filter>
 </defs>
 <path fill="url(#hospitalWall)" d="M0 0h1000v460H0z"/>
 <path fill="#f7f8f6" d="M0 0h1000v80H0z"/>
 <path d="M0 78h1000M0 110h1000" stroke="#b3c8ce" stroke-width="3"/>
 <g fill="#fff" stroke="#d8e3e7" stroke-width="5"><rect x="90" y="16" width="140" height="43" rx="3"/><rect x="660" y="16" width="130" height="43" rx="3"/></g>
 <path fill="url(#hospitalFloor)" d="M0 455h1000v165H0z"/><path d="M0 456h1000" stroke="#a1b3bb" stroke-width="7"/>
 <path d="M752 82v378" stroke="#aab6bc" stroke-width="7"/>
 <path d="M755 96q18 9 34 0t34 0t34 0t34 0t34 0t34 0v360H755Z" fill="url(#wardCurtain)" opacity=".87"/>
 <path d="M778 99v355m39 -355v355m39 -355v355m39 -355v355m39 -355v355" stroke="#fff" stroke-opacity=".33" stroke-width="6"/>
 <g opacity=".65"><rect x="778" y="316" width="153" height="111" rx="10" fill="#c2cfd5"/><rect x="801" y="341" width="109" height="22" rx="6" fill="#f7f9fa"/></g>
 <rect x="255" y="168" width="458" height="47" rx="5" fill="#f4f4f0" stroke="#9eb3b9" stroke-width="3"/>
 <g fill="#89a9a7"><rect x="281" y="180" width="24" height="25" rx="4"/><rect x="315" y="180" width="24" height="25" rx="4"/></g>
 <g fill="#d3b2a7"><rect x="351" y="180" width="24" height="25" rx="4"/><rect x="387" y="180" width="24" height="25" rx="4"/></g>
 <g fill="#c1cbd2"><rect x="439" y="180" width="44" height="25" rx="4"/><rect x="493" y="180" width="44" height="25" rx="4"/></g>
 <rect x="294" y="110" width="170" height="47" rx="5" fill="#f4f6f4" stroke="#b9c4c5" stroke-width="3"/>
 <path d="M305 123h118M305 137h87" stroke="#a8b5b7" stroke-width="5" stroke-linecap="round"/>
 <g transform="translate(123 222)"><rect width="137" height="110" rx="13" fill="#4e6a76" stroke="#bcccd2" stroke-width="8"/><rect x="10" y="10" width="116" height="90" rx="5" fill="#122a30"/><path d="M14 54h15l10 -15 12 30 11 -22h19l10 -13 9 20h24" fill="none" stroke="#59d7a1" stroke-width="3"/><text x="20" y="31" fill="#82ebbd" font-size="17" font-family="sans-serif">72</text><text x="79" y="85" fill="#92d9f7" font-size="15" font-family="sans-serif">98%</text></g>
 <path d="M192 330v160" stroke="#a4bbc5" stroke-width="7"/><path d="M153 494h76" stroke="#a4bbc5" stroke-width="8" stroke-linecap="round"/>
 <g><rect x="80" y="435" width="161" height="120" rx="7" fill="#dce5e7" stroke="#a0b2b8" stroke-width="4"/><path d="M93 474h135M93 516h135" stroke="#aebec4" stroke-width="5"/><path d="M146 457h36m-36 43h36" stroke="#889ba5" stroke-width="5" stroke-linecap="round"/></g>
 <path d="M669 181v306m-33 -288h66" stroke="#929fa4" stroke-width="6" stroke-linecap="round"/><path d="M655 208h29l-3 66h-24z" fill="#eaf9fb" stroke="#a5c4cd" stroke-width="3" opacity=".8"/>
 <g class="ward-bed"><ellipse cx="496" cy="551" rx="315" ry="33" fill="#41596b" opacity=".19" filter="url(#softWardShadow)"/>
 <rect x="280" y="330" width="430" height="165" rx="24" fill="#c6d5db" stroke="#94aeb7" stroke-width="9"/>
 <rect x="270" y="355" width="466" height="127" rx="25" fill="#f5f9fa" stroke="#95aebb" stroke-width="10"/>
 <rect x="298" y="357" width="405" height="95" rx="28" fill="#dce8ec"/>
 <ellipse cx="368" cy="367" rx="95" ry="32" fill="#ffffff" stroke="#d0e0e7" stroke-width="5"/>
 <path d="M360 414q163 -36 341 13v66H355Z" fill="url(#bedBlanket)" stroke="#8fa8bc" stroke-width="4"/>
 <path d="M311 468l-7 77m382 -76 9 76" stroke="#8da2ac" stroke-width="11"/>
 <g fill="#718da2"><circle cx="307" cy="546" r="13"/><circle cx="694" cy="547" r="13"/></g>
 <path d="M273 367l-13 97m466 -97 13 97" stroke="#eaf4f7" stroke-width="16" stroke-linecap="round"/>
 </g>
 ${patientBody}
 <g class="ward-foreground-rail"><path d="M263 466q6 -22 25 -22h423q23 0 25 24v25H259Z" fill="#e9f3f6" fill-opacity=".68" stroke="#a9c1cb" stroke-width="7"/><path d="M320 470h364" stroke="#f9fbfc" stroke-width="9" stroke-linecap="round"/></g>
 <text x="27" y="589" fill="#426273" font-family="sans-serif" font-size="14" font-weight="600">FICTIONAL CLINICAL SIMULATION · NOT A LIVE PATIENT</text>
 </svg>`;
}
