import * as THREE from './vendor/three.module.js';
import {vec, random, dryGeometry, wetGeometry} from './world.js';
import {captions, fps, frames} from './script.js';

const film = document.querySelector('#film');
const output = film.getContext('2d', {alpha:false});
const scene = document.createElement('canvas');
const width = scene.width = 270;
const height = scene.height = 480;
const ctx = scene.getContext('2d', {alpha:false, willReadFrequently:true});
const camera = new THREE.PerspectiveCamera(43, width / height, .12, 130);
const matrix = new THREE.Matrix4();
const sheet = new Image();
sheet.src = 'assets/otter-sheet.png';
const poses = [
  [133,71,318,417], [550,121,430,368], [44,545,473,394],
  [550,615,448,251], [32,1053,495,313], [627,987,285,490],
];
const clamp = x => Math.max(0, Math.min(1,x));
const mix = (x,y,a) => x + (y-x)*a;
const smooth = t => clamp(t) ** 2 * (3 - 2 * clamp(t));
const span = (frame,a,b) => clamp((frame-a)/(b-a));
const ease = (frame,a,b) => smooth(span(frame,a,b));
const color = (r,g,b) => 'rgb(' + (r|0) + ',' + (g|0) + ',' + (b|0) + ')';
const rand = random(7859);
const clouds = Array.from({length:40}, (_,i) => {
  const x = i < 26 ? -19 : 18, z = i < 26 ? -51 : -42;
  const base = 5 + rand()*16;
  return [x + (rand()-.5)*13, base, z + rand()*5, 1.15 + rand()*3.75, rand()];
});
const glints = Array.from({length:1080}, (_,i) => ({
  x:i<720 ? -4+rand()*15 : -16+rand()*37,
  z:i<720 ? 7-rand()*16 : 10-rand()*65,
  len:.15+rand()*1.28, phase:rand()*6.28, value:rand(),
}));
const shallowPatches=Array.from({length:125},()=>({
  x:-3.6+rand()*10,z:8-rand()*24,width:.25+rand()*1.05,depth:.07+rand()*.65,phase:rand()*6.28,
}));
const drops = Array.from({length:64}, () => ({
  az:rand()*Math.PI*2, speed:.8+rand()*3.1, up:.85+rand()*3.8, size:.022+rand()*.077,
}));
const specks = Array.from({length:105}, () => [rand()*15-4, -4.4+rand()*4.25, 6-rand()*22, rand()]);
const foregroundDrops = [[39,135,7],[223,95,11],[238,180,5],[21,208,9],[198,159,5],[56,322,6],[231,304,9],[27,366,6],[208,362,5]];

function project(x,y,z) {
  const m = matrix.elements;
  const d = m[3]*x + m[7]*y + m[11]*z + m[15];
  if (d < .10) return null;
  return [
    width*.5*(1+(m[0]*x+m[4]*y+m[8]*z+m[12])/d),
    height*.5*(1-(m[1]*x+m[5]*y+m[9]*z+m[13])/d),d,
  ];
}
function projectVector(v) { return project(v.x,v.y,v.z); }
function triangle(a,b,c,fill) {
  ctx.fillStyle=fill;
  ctx.beginPath();
  ctx.moveTo(a[0],a[1]);
  ctx.lineTo(b[0],b[1]); ctx.lineTo(c[0],c[1]);
  ctx.closePath();
  ctx.fill();
}
function polygon(pts,fill) {
  if (pts.some(p=>!p)) return;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0],pts[0][1]);
  for (const p of pts.slice(1)) ctx.lineTo(p[0],p[1]);
  ctx.closePath(); ctx.fill();
}
function ellipse(x,y,rx,ry,fill) {
  if (rx < .4 || ry < .4) return;
  ctx.fillStyle=fill;
  ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
}
function gradient(stops) {
  const g=ctx.createLinearGradient(0,0,0,height);
  for (const [stop,c] of stops) g.addColorStop(stop,c);
  return g;
}
function paintSkies(t, wet, rippleClose) {
  ctx.fillStyle = wet
    ? gradient([[0,'#56cdc6'],[.32,'#278b9a'],[.68,'#195e78'],[1,'#103956']])
    : gradient([[0,'#399fcc'],[.52,'#85d7da'],[.71,'#ffe2b3'],[1,'#d9bd8a']]);
  ctx.fillRect(0,0,width,height);
  if (wet) return;
  for (const [x,y,z,r,shade] of clouds) {
    const p=project(x+.11*t,y,z); if (!p) continue;
    const s=r*480/p[2];
    ellipse(p[0]+s*.20,p[1]+s*.24,s*1.1,s*.66,shade>.5?'#b8b7c7':'#dbced0');
    ellipse(p[0],p[1]-.18*s,s,s*.77,shade>.57?'#ffeaca':'#fff2d8');
  }
  const gazeY=project(0,0,-95)?.[1] ?? height*.4;
  const line=Math.floor(gazeY);
  if (line >= height) return;
  const surf=ctx.createLinearGradient(0,line,0,height+1);
  surf.addColorStop(0,'#58bbc2'); surf.addColorStop(.25,'#239eae');
  surf.addColorStop(.58,'#23aba9'); surf.addColorStop(1,rippleClose?'#39c5b2':'#45bba9');
  ctx.fillStyle=surf; ctx.fillRect(0,line,width,height-line);
  ctx.fillStyle='#afe4d5'; ctx.fillRect(0,line,width,2);
}
function waterPatches(t) {
  for (const g of shallowPatches) {
    const wave=Math.sin(g.phase+t*.7);
    const p=project(g.x,.002,g.z), px=project(g.x+g.width,.002,g.z), pz=project(g.x,.002,g.z+g.depth);
    if(!p || !px || !pz || p[0]<-32 || p[0]>width+32 || p[1]<0 || p[1]>height) continue;
    const a=Math.min(42,Math.abs(px[0]-p[0]));
    const b=Math.min(16,Math.abs(pz[1]-p[1]));
    if(a<2 || b<1) continue;
    ctx.fillStyle=wave>.12?'rgba(129,225,179,.11)':'rgba(9,110,139,.10)';
    ctx.beginPath();
    ctx.moveTo(p[0]-a*.6,p[1]); ctx.lineTo(p[0]-a*.2,p[1]-b);
    ctx.lineTo(p[0]+a*.52,p[1]-b*.74); ctx.lineTo(p[0]+a,p[1]+b*.1);
    ctx.lineTo(p[0]+a*.33,p[1]+b*.68); ctx.closePath();ctx.fill();
  }
}
function lineWater(t,wet,mode) {
  ctx.lineWidth=1;
  const y=wet?-.025:.012;
  for (const g of glints) {
    const cycle=Math.sin(g.phase+t*(wet?2.25:2.9)+g.z*.24);
    const z=g.z+(wet ? .18 : .42)*cycle;
    const p=project(g.x,y,z), q=project(g.x+g.len*(1+.25*cycle),y,z+.10*cycle);
    if(!p || !q || p[0]>width+100 || q[0]<-100 || p[1]<-3 || p[1]>height+3) continue;
    const f=clamp(.49+cycle*.38) * Math.min(1,p[2]/2.5);
    ctx.strokeStyle=wet ? 'rgba(177,254,222,'+(f*.36)+')' :
      g.value>.83 ? 'rgba(246,255,206,'+(f*(mode?.99:.72))+')' :
      g.value>.35 ? 'rgba(130,227,205,'+(f*.49)+')' : 'rgba(18,100,128,'+(f*.24)+')';
    if(g.value>.84) ctx.lineWidth=Math.max(1,Math.min(2,13/p[2]));
    else ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(p[0],p[1]);
    ctx.quadraticCurveTo(mix(p[0],q[0],.48),mix(p[1],q[1],.5)+cycle*Math.min(3,4/p[2]),q[0],q[1]);
    ctx.stroke();
  }
}
function grit(f,a,b,c,depth,wet) {
  const area=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))*.5;
  if(area<150||depth>21) return;
  const seed=(f.center.x*11033 + f.center.y*28031 + f.center.z*46183)|0;
  const dots=random(seed);
  const count=Math.min(32,Math.floor(area/65));
  for(let i=0;i<count;i++) {
    let u=dots(),v=dots();
    if(u+v>1) {u=1-u;v=1-v;}
    const x=Math.floor(a[0]+u*(b[0]-a[0])+v*(c[0]-a[0]));
    const y=Math.floor(a[1]+u*(b[1]-a[1])+v*(c[1]-a[1]));
    ctx.fillStyle=wet?'rgba(174,205,174,.16)':i%3===0?'rgba(255,226,161,.23)':'rgba(101,72,56,.19)';
    ctx.fillRect(x,y,i%4===0?2:1,1);
  }
}
function triangleQueue(geometry,wet,raster) {
  for (const f of geometry) {
    const d=camera.position.dot(f.normal)-f.center.dot(f.normal);
    // Thin tropical leaves and coral facets are visible from both sides.
    if (d < -.13 && f.normal.y > -.56 && f.color[1] < f.color[0]*1.24) continue;
    const a=projectVector(f.points[0]),b=projectVector(f.points[1]),c=projectVector(f.points[2]);
    if (!a||!b||!c) continue;
    if (Math.max(a[0],b[0],c[0])<0 || Math.min(a[0],b[0],c[0])>width ||
        Math.max(a[1],b[1],c[1])<0 || Math.min(a[1],b[1],c[1])>height) continue;
    const z=(a[2]+b[2]+c[2])/3;
    const fog = wet?clamp((z-2)*.06)*.83:clamp(z/63)*.41;
    const [r,g,b0]=f.color;
    const tint=wet ? color(mix(r*182,24,fog),mix(g*232,104,fog),mix(b0*251,124,fog))
      : color(mix(r*255,149,fog),mix(g*255,201,fog),mix(b0*255,193,fog));
    raster.push([z,()=>{
      triangle(a,b,c,tint);
      if(wet || r>g*1.025) grit(f,a,b,c,z,wet);
    }]);
  }
}

function placeCamera(p,q) {
  camera.position.set(...p);
  camera.lookAt(...q);
  camera.updateMatrixWorld();
  matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
}

function storyboard(frame) {
  const t=frame/fps;
  const pose={p:[-1.47,1.49,.08], kind:0, size:1.64, rotation:0, wet:false};
  let eye, look, macro=false, splash=-10, wipe=0, lens=false;
  if (frame < 82) {
    const push=ease(frame,10,62);
    eye=[.36-push*.2,2.75-push*.36,5.55-push*.87]; look=[-1.74,1.36,.02];
    pose.rotation=.02*Math.sin(t*2.1);
  } else if (frame < 239) {
    const p=ease(frame,163,217);
    eye=[.45+p*1.45,2.86-p*.57,6.2-p*.47]; look=[-1.68+p*2.41,1.19-p*.83,.0];
    if (frame>=167) {
      const u=span(frame,173,206);
      pose.kind=frame<173?1:2;
      pose.p=[mix(-1.47,1.1,u),1.44+Math.sin(u*Math.PI)*1.03-u*1.69,.12];
      pose.rotation=.01+u*.76;
      pose.size=1.72;
      if (u>=1) { pose.p[1]=.28; pose.kind=3+(Math.floor(frame/6)%2); pose.rotation=.03; pose.size=1.72; }
      splash=(frame-205)/fps;
    }
  } else if (frame < 310) {
    const p=ease(frame,239,285);
    eye=[2.85,2.36,5.65-p*.6]; look=[1.00,.51,.13];
    pose.p=[1.02,.26+.055*Math.sin(t*4),.06]; pose.size=1.65; pose.kind=3+(Math.floor(frame/8)%2);
  } else if (frame < 418) {
    const p=ease(frame,310,413);
    eye=[2.20,1.74-p*.58,5.30-p*.86]; look=[.95,.60-p*.23,0];
    pose.p=[.93,.43+.05*Math.sin(t*4),.1]; pose.size=1.05; pose.kind=5;
  } else if (frame < 503) {
    const p=ease(frame,418,502);
    eye=[2.8-p*.75,1.8-p*.54,4.9-p*1.02]; look=[.61,.05,-.45];
    pose.size=0; macro=true;
  } else if (frame < 653) {
    const u=span(frame,527,549);
    const track=ease(frame,524,559);
    const after=span(frame,555,653);
    eye=[-.12+track*1.95+after*.86,2.55-track*.65,5.05+track*.61];
    look=[-1.31+track*2.38+after*1.25,1.28-track*.88,0];
    pose.kind=frame<516?0:1;
    if (frame>=527) {
      pose.kind=2;
      pose.p=[mix(-1.46,1.1,u),1.46+Math.sin(u*Math.PI)*1.10-u*1.43,.12];
      pose.rotation=.08+u*.78;
      pose.size=1.53;
    }
    splash=(frame-549)/fps;
    if (frame>=549) {
      const v=span(frame,553,652);
      pose.p=[mix(1.1,2.65,v),.34+.105*Math.sin(t*5.6),.12];
      pose.kind=3+(Math.floor(frame/6)%2); pose.rotation=.08*Math.cos(t*6.7); pose.size=1.54;
    }
  } else {
    const crossing=ease(frame,653,698);
    const swim=ease(frame,700,813);
    const ending=ease(frame,949,1061);
    eye=[2.74+swim*1.38-ending*1.03,1.77-crossing*3.25,5.65-crossing*.68-ending*1.29];
    look=[2.42+swim*1.53-ending*.99,.46-crossing*2.58,.0];
    pose.wet=frame>=676;
    let bob=.10*Math.sin(t*4.9);
    pose.p=[2.65+swim*1.36-ending*1.1,.32-crossing*2.37+bob,.0];
    pose.kind=frame<978?3+(Math.floor(frame/6)%2):5;
    if(frame>=817&&frame<949) {
      const peek=ease(frame,817,842);
      eye[2]-=.24*peek;
      lens=true;
    }
    pose.rotation=pose.kind===5?.032*Math.sin(t*4):.11*Math.sin(t*4.9);
    pose.size=pose.kind===5?1.24:1.62;
    wipe=Math.max(0,1-Math.abs(frame-677)/13);
  }
  return {pose,eye,look,macro,splash,wipe,lens};
}

function sprite(pose,raster) {
  const p=project(...pose.p);
  if(!p||!pose.size) return;
  const [sx,sy,sw,sh]=poses[pose.kind];
  const w=pose.size*560/p[2], h=w*sh/sw;
  raster.push([p[2]-.23,()=>{
    if(!pose.wet && pose.p[1]>.88 && pose.kind<2) {
      const shadow=project(pose.p[0],.683,pose.p[2]);
      if (shadow) ellipse(shadow[0],shadow[1]-1,w*.34,w*.09,'rgba(71,46,42,.4)');
    }
    ctx.save();
    ctx.translate(p[0],p[1]); ctx.rotate(pose.rotation);
    if(!pose.wet && pose.p[1]<.5) {
      ctx.beginPath(); ctx.rect(-w,-h,w*2,h*1.23); ctx.clip();
    }
    ctx.drawImage(sheet,sx,sy,sw,sh,-w*.5,-h*.57,w,h);
    ctx.restore();
    if(!pose.wet && pose.p[1]<.52) {
      ctx.strokeStyle='rgba(178,245,218,.72)';
      ctx.beginPath(); ctx.ellipse(p[0],p[1]+h*.23,w*.51,3,0,0,Math.PI); ctx.stroke();
    }
  }]);
}

function splashWater(seconds,x) {
  if(seconds<0 || seconds>1.35) return;
  const p=project(x,.032,.11);
  if(p) {
    for (let i=0;i<3;i++) {
      const age=seconds-i*.095;
      if(age<0) continue;
      const f=1-clamp(age/1.25);
      ctx.strokeStyle='rgba(212,254,224,'+f*.92+')';
      ctx.lineWidth=Math.max(1,f*2);
      ctx.beginPath(); ctx.ellipse(p[0],p[1],5+age*73,1+age*13,0,0,6.29); ctx.stroke();
    }
  }
  for(const d of drops) {
    const y=.03+d.up*seconds-4.7*seconds*seconds;
    if(y<.015) continue;
    const rad=d.speed*seconds;
    const p=project(x+Math.cos(d.az)*rad,y,.11+Math.sin(d.az)*rad);
    if(p) ellipse(p[0],p[1],Math.max(.55,270*d.size/p[2]),Math.max(.75,330*d.size/p[2]),d.up>3?'#efffe1':'#a7eacd');
  }
}
function caustics(t) {
  ctx.lineWidth=1.15;
  for (let i=0;i<glints.length;i+=4) {
    const g=glints[i];
    const s=Math.sin(g.phase+t*1.04);
    const p=project(g.x,-4.479,g.z+.35*s);
    const q=project(g.x+g.len*.65,-4.475,g.z+.56*s+.32);
    if(p&&q&&p[2]<26) {
      ctx.strokeStyle='rgba(161,236,201,'+(.07+.17*clamp(s+.4))+')';
      ctx.beginPath();
      ctx.moveTo(...p.slice(0,2)); ctx.lineTo(mix(p[0],q[0],.55)+s*3,mix(p[1],q[1],.53)+2); ctx.lineTo(...q.slice(0,2)); ctx.stroke();
    }
  }
}
function beams(t) {
  for(let i=0;i<6;i++) {
    const s=5.2*Math.sin(t*.46+i);
    const x=width*.1+i*31+s;
    polygon([[x,-20],[x+15,-20],[x+120,345+i*9],[x+85,345+i*9]], i%2?'rgba(204,243,192,.055)':'rgba(214,246,200,.095)');
  }
}
function drift(t,age,bubbleOrigin) {
  for(const [x,y,z,j] of specks) {
    const p=project(x+.16*Math.sin(t+j*7),y,z+.11*Math.cos(t*.9+j*4));
    if(p&&p[2]<15) {
      ctx.fillStyle=j>.7?'rgba(223,249,193,.42)':'rgba(148,227,196,.36)';
      ctx.fillRect(Math.floor(p[0]),Math.floor(p[1]),j>.84?2:1,1);
    }
  }
  for(let i=0;i<15;i++) {
    const offset=i*.25, progress=((age+offset)%3+3)%3;
    const y=bubbleOrigin[1]+.08+progress*.80;
    if(y>-.08) continue;
    const p=project(bubbleOrigin[0]+Math.sin(i*2.78+progress*1.1)*(.19+i*.022),
      y,bubbleOrigin[2]+.2+Math.sin(i*1.71)*.19);
    if(!p) continue;
    const r=Math.max(.65,(6+(i%5)*1.5)/p[2]);
    ellipse(p[0],p[1],r+1,r+1,'rgba(175,241,217,.72)');
    ellipse(p[0]+.35,p[1]+.35,r*.77,r*.77,'#418b96');
    ctx.fillStyle='#d7f6d6'; ctx.fillRect(p[0]-r*.65,p[1]-r*.65,1,1);
  }
}
function fish(t,raster) {
  for(let i=0;i<11;i++){
    const x=((t*.82+i*.61)%13)-4;
    const y=-2.04+Math.sin(i*1.9+t*1.1)*.35;
    const z=-8+i%4*.5;
    const p=project(x,y,z);
    if(!p) continue;
    const a=140/p[2], b=a*.22;
    raster.push([p[2],()=>{
      const tint=i%3?'#509da0':'#9bcfb1';
      ellipse(p[0],p[1],a*.60,b,tint);
      triangle([p[0]-a*.43,p[1]],[p[0]-a,p[1]-b],[p[0]-a,p[1]+b],tint);
      ctx.fillStyle='#35818b'; ctx.fillRect(p[0]+a*.31,p[1]-1,1,1);
    }]);
  }
}
function droplets(frame) {
  const age=span(frame,824,946);
  if(frame<824) return;
  for(let i=0;i<foregroundDrops.length;i++) {
    const [x,base,r]=foregroundDrops[i], f=span(frame,824+i*5,839+i*5);
    if(!f) continue;
    const y=base+age*age*(20+i*4);
    ellipse(x+1,y+2,r*f,r*f*1.16,'rgba(12,72,94,.49)');
    ellipse(x,y,r*f,r*f*1.16,'rgba(171,233,211,.32)');
    ellipse(x,y-1,r*f*.76,r*f*.81,'rgba(83,178,182,.62)');
    ellipse(x-r*.38*f,y-r*.55*f,r*f*.23,Math.max(.58,r*f*.13),'#e3fae0');
  }
}
const bayer=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function pixelPass() {
  const image=ctx.getImageData(0,0,width,height);
  const pixels=image.data;
  for(let y=0;y<height;y++) {
    for(let x=0;x<width;x++) {
      const i=(y*width+x)*4;
      const d=(bayer[(y&3)*4+(x&3)]-7.5)*.73;
      pixels[i]=((pixels[i]+d+4)>>3)*8;
      pixels[i+1]=((pixels[i+1]+d+4)>>3)*8;
      pixels[i+2]=((pixels[i+2]+d+4)>>3)*8;
    }
  }
  ctx.putImageData(image,0,0);
}
const emphases=new Set(['water','real.','GTA.','dry.','underwater?','ripples','light.','splash','muffled.','droplets','breath']);
function caption(frame) {
  if (frame>=59 && frame<82) return;
  let index=captions.findIndex(([start])=>start>frame)-1;
  if(index===-2) index=captions.length-1;
  const [start,line]=captions[index];
  const words=line.split(' ');
  const base=63;
  output.font='800 '+base+'px Montserrat, sans-serif';
  const width=output.measureText(line).width;
  const size=Math.min(base,Math.floor(base*822/width));
  output.font='800 '+size+'px Montserrat, sans-serif';
  output.textBaseline='middle';
  const gap=output.measureText(' ').width;
  const total=output.measureText(line).width;
  let x=540-total/2;
  const impact=1-smooth((frame-start)/5);
  const y=1261+impact*6;
  output.lineCap='round'; output.lineJoin='round'; output.lineWidth=11;
  for (const w of words){
    output.strokeStyle='#132632'; output.strokeText(w,x,y+4);
    output.strokeText(w,x,y);
    output.fillStyle=emphases.has(w)?'#ffd775':'#fff2d5'; output.fillText(w,x,y);
    x+=output.measureText(w).width+gap;
  }
}
function render(frame) {
  const t=frame/fps;
  const {pose,eye,look,macro,splash,wipe,lens}=storyboard(frame);
  placeCamera(eye,look);
  paintSkies(t,pose.wet,macro);
  if(!pose.wet) waterPatches(t);
  lineWater(t,pose.wet,macro);
  const queue=[];
  triangleQueue(pose.wet?wetGeometry:dryGeometry,pose.wet,queue);
  if(pose.wet) fish(t,queue);
  sprite(pose,queue);
  queue.sort((a,b)=>b[0]-a[0]);
  for(const [,draw] of queue) draw();
  if(pose.wet) {
    caustics(t); beams(t);
    ctx.fillStyle='rgba(18,109,126,.14)'; ctx.fillRect(0,0,width,height);
    drift(t,(frame-677)/fps,pose.p);
  } else {
    splashWater(splash,1.1);
  }
  if(macro) {
    for(let j=0;j<5;j++) {
      const p=project(.5,.018,-.15);
      const a=((t*1.14+j/5)%1);
      if(!p) continue;
      ctx.strokeStyle='rgba(207,249,207,'+((1-a)*.47)+')';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.ellipse(p[0],p[1],a*124+3,a*27+1,0,.07,Math.PI*.99);ctx.stroke();
    }
  }
  if(lens) droplets(frame);
  if(wipe>0) {
    const y=height*(1-span(frame,664,690));
    ctx.fillStyle='rgba(80,183,181,'+(wipe*.57)+')';ctx.fillRect(0,0,width,height);
    polygon([[0,y-10],[75,y-25],[155,y-12],[270,y-28],[270,y-5],[147,y+12],[58,y-7],[0,y+7]],'rgba(186,239,210,'+(wipe*.74)+')');
  }
  pixelPass();
  output.imageSmoothingEnabled=false;
  output.drawImage(scene,0,0,1080,1920);
  caption(frame);
}
await Promise.all([sheet.decode(),document.fonts.load('800 60px Montserrat')]);
window.renderFrame=render;
window.renderInfo={fps,frames};
render(0);
if (!new URLSearchParams(location.search).has('capture')) {
  const start=performance.now();
  const animate=(time)=>{
    render(Math.floor((time-start)*fps/1000)%frames);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
