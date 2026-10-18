import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {photographicStage} from '../photographic-scene.js';

test('photographic fallback uses HTTPS and clearly discloses illustration',()=>{
 const html=photographicStage({name:'Helen Ward',sex:'Woman'});
 assert.match(html,/https:\/\/pikwizard\.com\/pw\/medium\//);
 assert.match(html,/One-on-one practice/);
 assert.match(html,/Photographic stand-in, not live video/);
 assert.match(html,/wardPhotograph/);
});

test('photographic fallback supports male and female case profiles',()=>{
 const female=photographicStage({name:'Example',sex:'Woman'});
 const male=photographicStage({name:'Example',sex:'Man'});
 assert.notEqual(female.match(/src="([^"]+)"/)[1],male.match(/src="([^"]+)"/)[1]);
});

test('new browser imports ship in the GitHub Pages publish list',()=>{
 const workflow=readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');
 const app=readFileSync(new URL('../demo.js',import.meta.url),'utf8');
 for(const filename of ['vitals-monitor.js','photographic-scene.js']){
  assert.ok(existsSync(new URL('../'+filename,import.meta.url)));
  assert.match(app,new RegExp(filename.replace('.','\\.')));
  assert.match(workflow,new RegExp(filename.replace('.','\\.')));
 }
});
