// Integration smoke test with real Three.js geometry and a minimal DOM/renderer stub.
// This does not verify WebGL rendering or browser input behaviour.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as Three from '../dist/three.module.js';
import * as BaseCore from '../dist/core.mjs';
import * as Engine from '../dist/f1-engine.mjs';
import * as Driving from '../dist/driving.mjs';
import * as Walls from '../dist/track-walls.mjs';
import * as Audio from '../dist/sample-audio.mjs';
import * as Elevation from '../dist/elevation.mjs';
const Core={...Elevation,...BaseCore,...Engine,...Driving,...Walls,...Audio};
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
class Element{
 constructor(id=''){this.id=id;this.value='';this.checked=false;this.hidden=false;this.width=800;this.height=600;this.style={};this.children=[];this.listeners={};this.dataset={};this.textContent='';this.classList={add(){},remove(){},toggle(){}};this.open=false;this.clientWidth=1000;this.clientHeight=700;}
 append(...x){this.children.push(...x)}
 addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)}
 removeEventListener(){}
 getBoundingClientRect(){return{width:1000,height:700,left:0,top:0,right:1000,bottom:700}}
 getContext(){return new Proxy({},{get:()=>()=>{},set:()=>true})}
 querySelector(){return new Element()}
 setPointerCapture(){}
 showModal(){this.open=true}
 close(){this.open=false;for(const fn of this.listeners.close??[])fn({})}
 select(){}
 click(){this.onclick?.({target:this})}
 set innerHTML(v){this.html=v;this.children=[]}get innerHTML(){return this.html||''}
}
const elements=new Map();for(const match of html.matchAll(/<[^>]+id="([^"]+)"[^>]*>/g)){let e=new Element(match[1]),tag=match[0];e.value=tag.match(/value="([^"]*)"/)?.[1]||'';e.checked=tag.includes(' checked');e.hidden=tag.includes(' hidden');e.tagName=tag.match(/^<([a-z]+)/)[1].toUpperCase();elements.set(e.id,e)}
const dialogs=[...elements.values()].filter(e=>e.tagName==='DIALOG');
globalThis.document={getElementById:id=>{assert.ok(elements.has(id),'Unknown DOM id '+id);return elements.get(id)},querySelectorAll:s=>s==='dialog'?dialogs:s==='dialog[open]'?dialogs.filter(e=>e.open):[],createElement:()=>new Element(),body:new Element(),documentElement:new Element(),addEventListener(){}};
globalThis.window=globalThis;globalThis.addEventListener=()=>{};globalThis.devicePixelRatio=1;globalThis.ResizeObserver=class{observe(){}};globalThis.requestAnimationFrame=()=>{};let stored=new Map();globalThis.localStorage={getItem:k=>stored.get(k)??null,setItem:(k,v)=>stored.set(k,v)};
Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[]},configurable:true});
class Renderer{constructor(){this.domElement=new Element();this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}}
let code=fs.readFileSync(new URL('../dist/game.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
const api=Function('T',...Object.keys(Core),code+'\nreturn {get settings(){return settings},choosePoint,setPointElevation,boardBox,setTool,set selected(v){selected=v},get f1State(){return f1State},get samples(){return samples},get player(){return player},get elapsed(){return elapsed},get bots(){return bots},get driving(){return driving},buildTrack,startGame,tick,animate,backToEditor,pauseGame,resume,garage,library,makeCar,get keys(){return keys},vehicles};')({...Three,WebGLRenderer:Renderer},...Object.values(Core));
assert.equal(api.samples.length>300,true);api.garage();assert.equal(elements.get('carGrid').children.length,34);api.library();assert.equal(elements.get('trackGrid').children.length,7);
for(const v of Core.vehicles){const g=api.makeCar(v);assert.ok(g.children.length>=8);g.traverse(o=>{if(o.geometry)for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n))})}
api.startGame();for(let i=0;i<80;i++)api.tick(1/60);api.keys.w=true;for(let i=0;i<180;i++)api.tick(1/60);assert.ok(Math.hypot(api.player.vx,api.player.vz)>3,'Throttle accelerates');assert.ok(Number.isFinite(api.player.x));assert.ok(api.bots.every(b=>Number.isFinite(b.x)&&b.distance>0));api.animate(100);let prior=api.elapsed;api.pauseGame();api.tick(1/60);assert.equal(api.elapsed,prior);api.resume();api.backToEditor();assert.equal(api.driving,false);
for(const mode of['race','rally','drag']){api.settings.mode=mode;api.buildTrack();api.startGame();for(let i=0;i<260;i++)api.tick(1/60);api.animate(200);assert.ok(Number.isFinite(api.player.x));api.backToEditor()}
for(const biome of['alpine','desert','forest','city','snow']){api.settings.biome=biome;api.settings.mode='practice';api.buildTrack();assert.ok(api.samples.every(p=>Number.isFinite(p.y)))}
console.log('PASS: app boot, 34 car models, garage, library, acceleration, AI, pause, camera/HUD, four modes, and six environments. WebGL visual QA not performed.');

api.selected=1;api.settings.mode='practice';api.settings.ai=0;api.buildTrack();api.startGame();for(let i=0;i<80;i++)api.tick(1/60);api.keys.w=true;for(let i=0;i<180;i++)api.tick(1/60);api.animate(300);assert.ok(api.f1State.rpm>4000);assert.equal(elements.get('engineReadout').hidden,false);api.pauseGame();api.resume();api.backToEditor();console.log('PASS: Formula One engine profile and RPM/gear HUD integration.');

api.settings.mode='rally';api.settings.hills=0;api.settings.points=[{x:.2,y:.2},{x:.5,y:.5},{x:.8,y:.8}];api.buildTrack();api.choosePoint(1);api.setPointElevation(65);
assert.equal(api.settings.points[1].height,65);assert.ok(Math.max(...api.samples.map(p=>p.y))>64);assert.equal(api.samples[0].y,0);assert.equal(api.samples.at(-1).y,0);
// Move the elevated point via the actual input handlers, preserving height.
const board=elements.get('board'),box=api.boardBox(board.width,board.height),evt={pointerId:1,clientX:box.x+.5*box.s,clientY:box.y+.5*box.s};
board.listeners.pointerdown[0](evt);board.listeners.pointermove[0]({...evt,clientX:evt.clientX+10});board.listeners.pointerup[0]();assert.equal(api.settings.points[1].height,65);
elements.get('saveBtn').click();assert.equal(JSON.parse(stored.get('og-tracks'))[0].points[1].height,65);
api.choosePoint(0);api.setPointElevation(22);elements.get('reverseBtn').click();assert.equal(api.settings.points.at(-1).height,22);elements.get('undoBtn').click();assert.equal(api.settings.points[0].height,22);
elements.get('flattenTrack').click();assert.ok(api.settings.points.every(p=>p.height===0));elements.get('undoBtn').click();assert.equal(api.settings.points[1].height,65);
api.library();elements.get('trackGrid').children.at(-1).click();assert.equal(api.settings.points[1].height,65);assert.equal(api.settings.mode,'rally');
console.log('PASS: point elevation changes geometry and survives dragging, save/load, reverse and undo.');

assert.ok(api.samples.every(p=>p.y>=0),"Elevated road never dips below base terrain");
