import test from 'node:test';
import assert from 'node:assert/strict';
import {elevationAt} from '../dist/elevation.mjs';
test('isolated peaks and valleys never overshoot their control heights',()=>{
 for(const closed of [true,false])for(const heights of [[0,0,150,0],[150,0,0,150],[0,150,0,150]]){
  for(let i=0;i<=1000;i++){const y=elevationAt(heights,i/1000,closed);assert.ok(y>=0&&y<=150)}
  const count=closed?heights.length:heights.length-1;
  heights.forEach((y,i)=>assert.ok(Math.abs(elevationAt(heights,i/count,closed)-y)<1e-8));
 }
});
