// Bounded easing avoids Catmull-Rom overshoot below ground near a tall control point.
export function elevationAt(heights,t,closed){
 if(!heights.length)return 0;
 const count=closed?heights.length:heights.length-1;
 const u=Math.max(0,Math.min(1,t))*count,i=Math.min(Math.floor(u),heights.length-1),f=u-i;
 const a=heights[i],b=heights[(i+1)%heights.length];
 return a+(b-a)*f*f*(3-2*f);
}
