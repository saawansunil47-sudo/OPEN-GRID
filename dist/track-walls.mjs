import * as T from './three.module.js';
export function buildDetailedWalls(samples,closed,width){
 const root=new T.Group();root.name='detailed-track-walls';
 const count=closed?samples.length:samples.length-1,placements=[];let distance=0;
 for(let i=0;i<count;i++){const a=samples[i],b=samples[(i+1)%samples.length],dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<.01)continue;for(let side of[-1,1])placements.push({x:(a.x+b.x)/2+dz/len*side*(width/2+4.5),y:(a.y+b.y)/2,z:(a.z+b.z)/2-dx/len*side*(width/2+4.5),angle:Math.atan2(dx,dz),pitch:-Math.atan2(b.y-a.y,len),length:len+.08,side,index:i,distance});distance+=len}
 const white=new T.MeshStandardMaterial({color:0xe2e1d5,roughness:.95}),metal=new T.MeshStandardMaterial({color:0x89979b,metalness:.6,roughness:.42}),dark=new T.MeshStandardMaterial({color:0x414b4b,roughness:.8}),reflect=new T.MeshStandardMaterial({color:0xffffff,emissive:0xaaa588,emissiveIntensity:.18});
 function instances(name,geo,material,list,configure){const m=new T.InstancedMesh(geo,material,list.length);m.name=name;const d=new T.Object3D();list.forEach((p,i)=>{d.position.set(p.x,p.y,p.z);d.rotation.set(p.pitch,p.angle,0,'YXZ');d.scale.set(1,1,1);configure(d,p,i,m);d.updateMatrix();m.setMatrixAt(i,d.matrix)});m.castShadow=true;m.receiveShadow=true;root.add(m);return m}
 instances('concrete-foundation',new T.BoxGeometry(.9,.55,1),white,placements,(d,p)=>{d.position.y+=.15;d.scale.z=p.length});
 instances('crash-wall-panels',new T.BoxGeometry(.58,.85,1),white,placements,(d,p,i,m)=>{d.position.y+=.81;d.scale.z=Math.max(.02,p.length-.065);m.setColorAt(i,new T.Color(Math.floor(p.distance/8)%2?0xdde0d4:0xad594b))});
 for(const height of[.49,.73,.97])instances('corrugated-steel-rail',new T.BoxGeometry(.13,.14,1),metal,placements,(d,p)=>{d.position.y+=height;d.position.x-=Math.cos(p.angle)*p.side*.35;d.position.z+=Math.sin(p.angle)*p.side*.35;d.scale.z=p.length});
 const posts=placements.filter(p=>p.index%3===0);
 instances('fence-uprights',new T.BoxGeometry(.12,2.4,.13),metal,posts,(d)=>d.position.y+=2.05);
 instances('reflector-plates',new T.BoxGeometry(.035,.16,.28),reflect,posts,(d,p,i,m)=>{d.position.x-=Math.cos(p.angle)*p.side*.44;d.position.z+=Math.sin(p.angle)*p.side*.44;d.position.y+=1.05;m.setColorAt(i,new T.Color(p.side>0?0xffc65b:0xf7f5df))});
 const bolts=placements.filter(p=>p.index%2===0);instances('rail-fasteners',new T.SphereGeometry(.038,5,4),dark,bolts,(d,p)=>{d.position.x-=Math.cos(p.angle)*p.side*.44;d.position.z+=Math.sin(p.angle)*p.side*.44;d.position.y+=.73});
 // Actual fence wires, not a transparent sheet: no texture blur or alpha sorting.
 const wires=[];for(const p of placements){const sx=Math.sin(p.angle),cz=Math.cos(p.angle),half=p.length/2;for(const h of[1.5,1.9,2.3,2.7,3.1])wires.push(p.x-sx*half,p.y+h,p.z-cz*half,p.x+sx*half,p.y+h,p.z+cz*half);for(let z=-half;z<half;z+=.65)wires.push(p.x+sx*z,p.y+1.3,p.z+cz*z,p.x+sx*z,p.y+3.1,p.z+cz*z)}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(wires,3));const fence=new T.LineSegments(g,new T.LineBasicMaterial({color:0x687776,transparent:true,opacity:.6}));fence.name='catch-fence-grid';root.add(fence);return root;
}
