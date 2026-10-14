// Values transcribed from the user-provided Ferrari F138 F1 V8.mr.
// This is a browser synthesis approximation, NOT an Engine Simulator runtime.
export const F1_ENGINE=Object.freeze({
 name:'Ferrari Tipo 056-2013 V8',cylinders:8,redline:18000,
 firingOrder:[1,5,3,7,4,8,2,6],firingAngles:[0,90,180,270,360,450,540,630],
 cylinderGains:[.9,.8,1.1,1,1,.8,1,.7],
 gearRatios:[6.40,4.87,3.70,3.10,2.67,2.37,2.10],finalDrive:3.5,
 tireRadius:.3556,boreMM:98,strokeMM:39.75,limiterDuration:.03,
 // Game tuning: the uploaded file supplies starter speed, not a target idle.
 idleRPM:4000,shiftRPM:17400,downshiftRPM:9800,shiftSeconds:.09
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createF1State(){return{rpm:F1_ENGINE.idleRPM,gear:1,shiftRemaining:0,load:0,limiting:false}}
export function updateF1State(state,speed,throttle,dt){
 const e=F1_ENGINE;dt=clamp(dt,0,.1);speed=Math.abs(speed);throttle=clamp(throttle,0,1);
 state.shiftRemaining=Math.max(0,state.shiftRemaining-dt);
 const wheelRPM=speed/(2*Math.PI*e.tireRadius)*60;
 let wheelEngineRPM=wheelRPM*e.finalDrive*e.gearRatios[state.gear-1];
 if(!state.shiftRemaining){
  if(wheelEngineRPM>e.shiftRPM&&state.gear<e.gearRatios.length){state.gear++;state.shiftRemaining=e.shiftSeconds}
  else if(wheelEngineRPM<e.downshiftRPM&&state.gear>1&&wheelRPM*e.finalDrive*e.gearRatios[state.gear-2]<e.shiftRPM){state.gear--;state.shiftRemaining=e.shiftSeconds}
 }
 wheelEngineRPM=wheelRPM*e.finalDrive*e.gearRatios[state.gear-1];
 const launchRPM=e.idleRPM+throttle*2500*clamp(1-speed/15,0,1);
 const target=clamp(Math.max(launchRPM,wheelEngineRPM),e.idleRPM,e.redline);
 state.rpm+=(target-state.rpm)*(1-Math.exp(-dt*24));
 state.load+=(throttle-state.load)*(1-Math.exp(-dt*12));
 state.limiting=wheelEngineRPM>=e.redline;
 return state;
}
export function firingWave(){
 const real=new Float32Array(65),imag=new Float32Array(65),e=F1_ENGINE;
 for(let h=1;h<real.length;h++)for(let event=0;event<8;event++){
  const angle=2*Math.PI*e.firingAngles[event]/720;
  const amplitude=e.cylinderGains[e.firingOrder[event]-1]*Math.exp(-h*.065)/8;
  real[h]+=amplitude*Math.cos(h*angle);imag[h]-=amplitude*Math.sin(h*angle);
 }
 return{real,imag};
}
export class F1Sound{
 constructor(context){
  this.context=context;const wave=firingWave();this.osc=context.createOscillator();
  this.osc.setPeriodicWave(context.createPeriodicWave(wave.real,wave.imag));
  this.filter=context.createBiquadFilter();this.filter.type='lowpass';this.filter.Q.value=.6;
  this.highpass=context.createBiquadFilter();this.highpass.type='highpass';this.highpass.frequency.value=90;
  this.gain=context.createGain();this.gain.gain.value=0;
  this.compressor=context.createDynamicsCompressor();this.compressor.threshold.value=-15;this.compressor.ratio.value=5;
  this.osc.connect(this.filter).connect(this.highpass).connect(this.gain).connect(this.compressor).connect(context.destination);
  this.osc.frequency.value=F1_ENGINE.idleRPM/120;this.osc.start();
 }
 update(state,active){const now=this.context.currentTime;
  this.osc.frequency.setTargetAtTime(state.rpm/120,now,.012);
  this.filter.frequency.setTargetAtTime(1400+state.rpm*.3+state.load*1500,now,.04);
  const cut=state.shiftRemaining>0?.13:state.limiting&&Math.floor(now/F1_ENGINE.limiterDuration)%2?0:1;
  this.gain.gain.setTargetAtTime(active?( .045+state.load*.08)*cut:0,now,.008);
 }
 silence(){const p=this.gain.gain;p.cancelScheduledValues(this.context.currentTime);p.setValueAtTime(0,this.context.currentTime)}
}
