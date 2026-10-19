/**
 * Accessible, evidence-first feedback presentation.
 * Every user-provided transcript fragment is escaped.
 */
import {SKILLS,aggregateReports,gradeEncounter} from './grading.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const para=value=>escape(value).replace(/\n/g,' ');
const gradeClass=n=>n===2?'rating-good':n===1?'rating-warn':n===0?'rating-low':'rating-na';
const list=(items,fn)=>items.length?'<ul class="evidence-list">'+items.map(fn).join('')+'</ul>':'<p class="feedback-empty">No directly recorded examples for this part of the case.</p>';
export function caseFeedbackHtml(p,record){
 const report=record.report||gradeEncounter(p,record);
 const usable=report.skills.filter(s=>s.applicable);
 const marks=usable.map(s=>'<div class="skill-rating"><div><strong>Skill '+escape(s.id)+'</strong> '+escape(s.name)+'</div><span class="skill-pill '+gradeClass(s.grade)+'">'+escape(s.label)+'</span><small>'+escape(s.note||'')+'</small></div>').join('');
 const consultants=report.consultants.map(con=>'<section class="consultant-assessment"><div class="consultant-heading"><span class="consultant-bubble">'+(con.name.includes('1')?'1':'2')+'</span><div><h3>'+escape(con.name)+'</h3><p>'+escape(con.role)+'</p></div></div>'+
 '<p class="consultant-overview">'+escape(con.summary)+'</p>'+
 '<h4>Evidence of strengths</h4>'+list(con.strengths,x=>'<li><strong>Skill '+escape(x.skill)+': '+escape(x.criterion)+'</strong><blockquote>“'+escape(x.quote)+'”</blockquote></li>')+
 '<h4>What to improve next</h4>'+list(con.improvements,x=>'<li><strong>Skill '+escape(x.skill)+': '+escape(x.criterion)+'</strong><p>'+escape(x.practice)+'</p></li>')+
 (con.safety.length?'<div class="safety-review"><strong>Priority: review potentially unsafe wording</strong>'+list(con.safety,x=>'<li>Skill '+escape(x.skill)+': “'+escape(x.quote)+'”</li>')+'</div>':'')+
 (con.note?'<p class="feedback-limitation">'+escape(con.note)+'</p>':'')+'</section>').join('');
 const ai=(record.assessment||[]).map(a=>'<div class="ai-review"><strong>'+escape(a.name)+' — additional AI perspective</strong><p>'+para(a.feedback)+'</p></div>').join('');
 const status=record.assessmentPending?'<p class="ai-note" role="status">Optional AI consultant commentary is being prepared. The evidence-based report is already available.</p>':
  record.assessmentError?'<p class="ai-note">AI commentary unavailable. The evidence-based consultant review remains available.</p>':'';
 const qAndA=(p.qa||[]).length?'<details class="feedback-transcript"><summary>Examiner questions and teaching points (available after the case)</summary>'+
 (p.qa||[]).map((item,i)=>'<div class="answer-comparison"><strong>Q'+(i+1)+': '+escape(item[0])+'</strong>'+
 '<p><b>Your answer:</b> '+escape(record.answers?.[i]||'Not recorded')+'</p>'+
 '<p><b>Suggested teaching points:</b> '+escape(item[1])+'</p></div>').join('')+'</details>':'';
 const next=report.nextPractice.length?'<ol class="practice-steps">'+report.nextPractice.slice(0,4).map(step=>'<li>'+escape(step)+'</li>').join('')+'</ol>':
 '<p>Start the next case with an introduction, relevant questions, and a structured closing plan.</p>';
 return '<div class="feedback-report"><div class="feedback-casehead"><div class="eyebrow">PACES PRACTICE DEBRIEF</div><h2>'+escape(p.name)+' — '+escape(p.title)+'</h2><p>'+escape(report.evidenceQuality)+' · '+report.studentTurns+' recorded candidate contribution(s), including '+(report.examinerAnswers||0)+' examiner answer(s) · '+report.examActions+' examination selection(s)</p></div>'+
 '<p class="feedback-disclaimer">'+escape(report.disclaimer)+'</p>'+
 '<section class="feedback-section"><h3>Skill-by-skill practice ratings</h3><p class="feedback-explainer">Satisfactory (2), Borderline (1), Unsatisfactory (0). Skills without reliable observation are not scored. These are provisional learning ratings, not official examiner marks.</p><div class="skill-rating-grid">'+marks+'</div></section>'+
 '<section class="feedback-section"><h3>Your two consultant reviews</h3><div class="consultant-feedback-grid">'+consultants+'</div></section>'+
 '<section class="feedback-section"><h3>Priorities for the next case</h3>'+next+'</section>'+
 (ai?'<section class="feedback-section"><h3>Additional AI consultant feedback</h3>'+ai+'</section>':'')+status+
 '<details class="feedback-transcript"><summary>Review your recorded consultation transcript</summary>'+((record.messages||[]).length?(record.messages||[]).map(m=>'<p><strong>'+escape(m.who==='you'?'Candidate':p.name)+':</strong> '+escape(m.text)+'</p>').join(''):'<p>No conversation was recorded.</p>')+'</details>'+qAndA+'</div>';
}
export function aggregateFeedbackHtml(records,patients){
 const reports=patients.map(p=>records[p.id]?.report).filter(Boolean);
 const summary=aggregateReports(reports);
 const rows=summary.skills.filter(x=>x.encounters).map(x=>'<div class="summary-skill"><strong>Skill '+escape(x.id)+'</strong><span>'+escape(SKILLS[x.id])+'</span><span>'+ (x.average===null?'Not assessable':escape(x.average.toFixed(2))+' / 2')+'</span><small>'+x.rated+' of '+x.encounters+' encounters with enough evidence</small></div>').join('');
 const tips=summary.priorities.length?'<ol class="practice-steps">'+summary.priorities.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ol>':'<p>Complete more recorded clinical conversations to see actionable trends.</p>';
 return '<section class="final-summary"><div class="eyebrow">END-OF-SESSION REFLECTION</div><h2>Practice across '+summary.cases+' encounter(s)</h2><p>'+escape(summary.disclaimer)+'</p><div class="summary-skill-grid">'+rows+'</div><h3>Recommended practice priorities</h3>'+tips+'<p class="feedback-limitation">The real PACES has eight encounters, with two independent examiners per station. This extended ten-case practice is educational and cannot calculate the official overall score.</p></section>';
}
