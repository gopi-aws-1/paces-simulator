import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cases} from '../cases.js';
import {extraCases} from '../extra-cases.js';
const ui=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const worker=readFileSync(new URL('../server/worker.js',import.meta.url),'utf8');
test('new entrypoint is simple single page rather than legacy complex dashboard',()=>{
 assert.match(html,/demo\.js/);assert.match(html,/demo\.css/);
 assert.match(ui,/Start Full Exam/);assert.match(ui,/Practise One Case/);
 assert.match(ui,/id="skip"/);assert.match(ui,/id="talk"/);assert.match(ui,/id="examine"/);
});
test('ten unique patient cases support extended training',()=>{
 const ids=[...cases,...extraCases].map(c=>c.id);
 assert.equal(ids.length,10);assert.equal(new Set(ids).size,10);
 assert.ok([...cases,...extraCases].every(c=>c.opening&&c.instruction&&c.dialogue.length>0));
});
test('consultant introduction is audible, skippable and automatically advances',()=>{
 assert.match(ui,/function playIntro\(/);assert.match(ui,/function hearIntro\(/);
 assert.match(ui,/speechSynthesis/);assert.match(ui,/firstPatient\(\)/);
 assert.match(ui,/setTimeout\(\(\)=>\{if\(n===token&&session\?\.stage==='intro'\)firstPatient\(\)/);
});
test('video streaming fallback and authenticated supplier session hooks exist',()=>{
 assert.match(ui,/drawPatient\(/);assert.match(ui,/requestAnimationFrame/);assert.match(ui,/video\/create/);
 assert.match(worker,/TAVUS_API_KEY/);assert.match(worker,/require_auth:true/);
 assert.match(worker,/video\/end/);
 assert.doesNotMatch(ui,/OPENAI_API_KEY|TAVUS_API_KEY/);
});
