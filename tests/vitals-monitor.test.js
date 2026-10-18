import test from 'node:test';
import assert from 'node:assert/strict';
import {caseVitals,monitorMarkup} from '../vitals-monitor.js';
test('default telemetry is clearly illustrative',()=>{
 const v=caseVitals({name:'Example',id:1});
 assert.deepEqual([v.hr,v.spo2,v.rr,v.sys,v.dia],[76,98,16,124,78]);
 assert.match(monitorMarkup({name:'Example'}),/Illustrative normal-range readings/);
});
test('explicit case vital signs override defaults',()=>{
 const v=caseVitals({vitals:{hr:112,spo2:91,rr:24,sys:105,dia:66}});
 assert.deepEqual([v.hr,v.spo2,v.rr,v.sys,v.dia],[112,91,24,105,66]);
 assert.equal(v.isDefault,false);
});
test('monitor never presents values as actual clinical readings',()=>{
 const html=monitorMarkup({vitals:{hr:400,spo2:0,rr:-4}});
 assert.match(html,/SIMULATED/);
 assert.match(html,/Not real monitoring/);
 assert.match(html,/data-base-hr="180"/);
 assert.match(html,/data-base-spo2="70"/);
});
