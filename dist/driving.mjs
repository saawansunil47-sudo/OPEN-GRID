const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function stepVehicle(p,v,input,dt,{grip=1,onroad=true,slipstream=false}={}){
 const speed=Math.hypot(p.vx,p.vz),traction=Math.max(.3,v.grip*grip);
 // Analog-like keyboard ramp with quicker self-centering and bounded lateral acceleration.
 const target=clamp(input.steer,-1,1),rate=target===0?7:4.8;
 p.steer=(p.steer||0)+clamp(target-(p.steer||0),-rate*dt,rate*dt);
 let forward=p.vx*Math.sin(p.heading)+p.vz*Math.cos(p.heading);
 let lateral=p.vx*Math.cos(p.heading)-p.vz*Math.sin(p.heading);
 let drive=input.throttle*v.accel*(1-clamp(Math.max(0,forward)/v.top,0,1)**2);
 const braking=input.brake*(forward>.4?23:forward<-.4?-7:0);
 let accel=drive-braking-forward*.012-(Math.abs(forward)>.08?Math.sign(forward)*.22:0);
 if(input.brake&&!input.throttle&&forward<.4){p.reverseHold=(p.reverseHold||0)+dt;if(p.reverseHold>.45)accel=-v.accel*.45;}else p.reverseHold=0;
 if(!onroad)accel-=forward*.55;if(slipstream)accel+=v.accel*.1;
 let next=clamp(forward+accel*dt,-v.top*.12,v.top);
 if(input.brake&&forward>0&&next<0)next=0;
 if(!input.throttle&&!input.brake&&Math.abs(next)<.1)next=0;
 const wheelbase=Math.max(1.7,v.length*.62),angle=p.steer*.52/(1+(speed/24)**1.35);
 const maxYaw=traction*(input.hand?15:13)/Math.max(speed,7);
 const wantedYaw=clamp(Math.tan(angle)*next/wheelbase,-maxYaw,maxYaw)*(input.hand?1.12:1);
 p.yawRate=(p.yawRate||0)+(wantedYaw-(p.yawRate||0))*(1-Math.exp(-dt*11));
 p.heading+=p.yawRate*dt;
 lateral*=Math.exp(-dt*(input.hand?1.8:20)*traction);
 if(input.hand){lateral-=p.yawRate*speed*dt*.6;next*=Math.exp(-dt*.65)}
 p.speed=next;p.vx=Math.sin(p.heading)*next+Math.cos(p.heading)*lateral;
 p.vz=Math.cos(p.heading)*next-Math.sin(p.heading)*lateral;
 p.x+=p.vx*dt;p.z+=p.vz*dt;
 return Math.hypot(p.vx,p.vz);
}
export function trackContact(samples,x,z,closed=true){let best=Infinity,result;const count=closed?samples.length:samples.length-1;
 for(let i=0;i<count;i++){const a=samples[i],b=samples[(i+1)%samples.length],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;if(l2<1e-9)continue;const t=clamp(((x-a.x)*dx+(z-a.z)*dz)/l2,0,1),px=a.x+t*dx,pz=a.z+t*dz,dist=(x-px)**2+(z-pz)**2;if(dist<best){best=dist;let l=Math.sqrt(l2);result={index:i,fraction:t,point:{x:px,y:a.y+(b.y-a.y)*t,z:pz},nx:dz/l,nz:-dx/l,distance:Math.sqrt(dist)}}}return result;
}
export function resolveWall(p,contact,limit){const side=(p.x-contact.point.x)*contact.nx+(p.z-contact.point.z)*contact.nz,sign=Math.sign(side),excess=Math.abs(side)-limit;if(excess<=0)return false;
 p.x-=contact.nx*sign*excess;p.z-=contact.nz*sign*excess;
 const outward=(p.vx*contact.nx+p.vz*contact.nz)*sign;
 if(outward>0){p.vx-=outward*sign*contact.nx;p.vz-=outward*sign*contact.nz;const friction=Math.max(.72,1-outward*.008);p.vx*=friction;p.vz*=friction}return true;
}
