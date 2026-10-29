/* BePhos marks: profile sigils built from a shape, colours, a pattern, an emblem, a style, a frame and a charm.
   Shapes, patterns, frames, charms and styles drawn for BePhos. Emblems: marks-emblems.js (Game-icons, CC BY 3.0)
   and marks-colour.js (Fluent Emoji, MIT). Both load in the background; until they arrive a mark shows its shape only. */
(function(){
const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const m=v=>Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)));return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('')};
const poly=(n,r,rot)=>{let d='';for(let i=0;i<n;i++){const a=(rot||0)+i/n*Math.PI*2-Math.PI/2;d+=(i?'L':'M')+(50+Math.cos(a)*r).toFixed(1)+' '+(50+Math.sin(a)*r).toFixed(1)}return d+'Z'};
const star=(n,r1,r2,cx,cy)=>{cx=cx==null?50:cx;cy=cy==null?50:cy;let d='';for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2-Math.PI/2,r=i%2?r2:r1;d+=(i?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1)}return d+'Z'};
const SH={circle:'M50 4a46 46 0 1 0 .1 0Z',shield:'M50 4 L90 16 V48 C90 74 72 88 50 97 C28 88 10 74 10 48 V16 Z',heater:'M10 8 H90 V42 C90 70 72 88 50 97 C28 88 10 70 10 42Z',hexagon:poly(6,47),octagon:poly(8,47,Math.PI/8),
 arch:'M12 97 V48 A38 38 0 0 1 88 48 V97 Z',flame:'M50 2 C70 25 91 44 89 66 C87 86 70 98 50 98 C30 98 13 86 11 66 C9 44 31 33 50 2Z',diamond:'M50 3 L95 50 L50 97 L5 50Z',
 squircle:'M50 5 C89 5 95 11 95 50 C95 89 89 95 50 95 C11 95 5 89 5 50 C5 11 11 5 50 5Z',leaf:'M50 2 C88 24 95 64 50 98 C5 64 12 24 50 2Z',
 lantern:'M34 5 H66 V13 C84 21 93 38 93 56 C93 74 83 86 66 90 V97 H34 V90 C17 86 7 74 7 56 C7 38 16 21 34 13Z',burst:star(12,48,40),seal:star(16,48,43),drop:'M50 3 C64 26 86 46 86 64 A36 36 0 0 1 14 64 C14 46 36 26 50 3Z',
 ticket:'M8 14 H92 V40 A10 10 0 0 0 92 60 V86 H8 V60 A10 10 0 0 0 8 40Z',pebble:'M52 6 C80 4 96 26 94 52 C92 80 72 96 46 94 C18 92 4 72 6 46 C8 22 26 8 52 6Z'};
const SHN=Object.keys(SH);
const PAL=['#E8603C','#2F8F6B','#E9A23B','#5B6BD6','#E58BA6','#8C5A86','#1E6F8C','#C9483A','#6FAE5A','#3E3A6B','#F4A26B','#1E1C38','#0F8A8A','#B5651D','#7A9E3B','#D4553F','#4A6FA5','#A44A7A','#C99A2E','#2B5D4A','#9C6ADE','#E07A5F','#355070','#6D597A'];
const INK=['#FFF6E9','#1E1C38','#FFD35C','#FFFFFF','#2B1E14','#FFE0C2','#CFF5E3','#FCE1EA'];
const PATS=['none','dots','stripes','rings','waves','checks','rays','grid','zigzag','scales','split','sunset'];
const RINGS=['none','thin','double','dotted','notched','gold'];
const CHARMS=['none','star','moon','spark','dots','heart','leaf','crown','flame','note'];
const STYLES=['Flat','Line','Shadow','Woodcut','Neon','Paper cut','Riso print','Stained glass','Full colour'];
// which choices change how each style looks (used for the honest count)
const USES={Flat:{ink:1,pat:1},Line:{pat:1},Shadow:{ink:1,pat:1},Woodcut:{ink:1,pat:1},Neon:{pat:1},'Paper cut':{ink:1,pat:1},'Riso print':{pat:1},'Stained glass':{ink:1},'Full colour':{pat:1}};
function pat(p,c){let s='';switch(p){
 case'dots':for(let x=8;x<100;x+=13)for(let y=8;y<100;y+=13)s+=`<circle cx="${x+(y%26?6:0)}" cy="${y}" r="2.6" fill="${c}"/>`;break;
 case'stripes':for(let i=-100;i<200;i+=14)s+=`<path d="M${i} 0 L${i+100} 100" stroke="${c}" stroke-width="5"/>`;break;
 case'rings':for(let r=10;r<80;r+=11)s+=`<circle cx="50" cy="50" r="${r}" stroke="${c}" stroke-width="3.5" fill="none"/>`;break;
 case'waves':for(let y=6;y<100;y+=12)s+=`<path d="M0 ${y} q12.5 -6 25 0 t25 0 t25 0 t25 0" stroke="${c}" stroke-width="3.5" fill="none"/>`;break;
 case'checks':for(let x=0;x<100;x+=16)for(let y=0;y<100;y+=16)if((x+y)/16%2===0)s+=`<rect x="${x}" y="${y}" width="16" height="16" fill="${c}"/>`;break;
 case'rays':for(let i=0;i<20;i+=2){const a=i/20*6.283,b=(i+1)/20*6.283;s+=`<path d="M50 50 L${(50+Math.cos(a)*80).toFixed(1)} ${(50+Math.sin(a)*80).toFixed(1)} L${(50+Math.cos(b)*80).toFixed(1)} ${(50+Math.sin(b)*80).toFixed(1)}Z" fill="${c}"/>`}break;
 case'grid':for(let i=0;i<100;i+=12)s+=`<path d="M${i} 0V100M0 ${i}H100" stroke="${c}" stroke-width="2"/>`;break;
 case'zigzag':for(let y=6;y<100;y+=14){let d=`M0 ${y}`;for(let x=0;x<100;x+=10)d+=` l5 ${x%20?6:-6} l5 ${x%20?-6:6}`;s+=`<path d="${d}" stroke="${c}" stroke-width="3" fill="none"/>`}break;
 case'scales':for(let y=0;y<110;y+=12)for(let x=0;x<110;x+=16)s+=`<path d="M${x+(y%24?8:0)-8} ${y} a8 8 0 0 0 16 0" stroke="${c}" stroke-width="2.5" fill="none"/>`;break;
 case'split':s=`<path d="M0 0 H100 L0 100Z" fill="${c}"/>`;break;
 case'sunset':s=`<rect x="0" y="55" width="100" height="45" fill="${c}"/><rect x="0" y="70" width="100" height="30" fill="${shade(c,-.2)}"/>`;break;}return s}
function charm(c,col){switch(c){case'star':return `<path d="${star(5,8,3.4,86,13)}" fill="${col}"/>`;case'moon':return `<path d="M88 4 a10 10 0 1 0 7 16 a8 8 0 1 1 -7 -16Z" fill="${col}"/>`;case'spark':return `<path d="M88 2 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3Z" fill="${col}"/>`;
 case'dots':return `<circle cx="79" cy="10" r="3.2" fill="${col}"/><circle cx="88" cy="10" r="3.2" fill="${col}"/><circle cx="97" cy="10" r="3.2" fill="${col}"/>`;case'heart':return `<path d="M88 22 C77 14 79 5 84.5 5 C86.5 5 88 7 88 8.5 C88 7 89.5 5 91.5 5 C97 5 99 14 88 22Z" fill="${col}"/>`;
 case'leaf':return `<path d="M88 2 C99 9 99 20 88 26 C77 20 77 9 88 2Z" fill="${col}"/>`;case'crown':return `<path d="M77 20 L79 7 L84.5 13 L88 5 L91.5 13 L97 7 L99 20Z" fill="${col}"/>`;case'flame':return `<path d="M88 1 C93 8 98 12 97 18 A9 9 0 0 1 79 18 C79 11 85 9 88 1Z" fill="${col}"/>`;
 case'note':return `<path d="M83 22 a4.5 4.5 0 1 1 0-.1 V5 h11 v4.5 h-7 v12.5Z" fill="${col}"/>`;default:return ''}}
function emb(name,col,extra){const E=window.BP_EMB;if(!E||!E.d[name])return '';const v=E.d[name];
 const inner=v[0]==='B'?v.slice(1):`<path d="${v}"/>`;return `<g transform="translate(23 23) scale(.10547)" fill="${col}" ${extra||''}>${inner}</g>`}
function embStroke(name,col,w){const E=window.BP_EMB;if(!E||!E.d[name])return '';const v=E.d[name];const inner=v[0]==='B'?v.slice(1):`<path d="${v}"/>`;
 return `<g transform="translate(23 23) scale(.10547)" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round">${inner}</g>`}
let uid=0;
function render(o,opts){opts=opts||{};o=norm(o);const id='bm'+(uid++),d=SH[o.s],col=o.c,ink=o.i,st=o.y,pc=shade(col,o.p==='sunset'?.15:-.16);
 let defs=`<clipPath id="c${id}"><path d="${d}"/></clipPath>`,body='',em='';const E=(c,x)=>emb(o.e,c,x);const fill=(p,c)=>`<g clip-path="url(#c${id})">${pat(p,c)}</g>`;
 if(st==='Flat'){body=`<path d="${d}" fill="${col}"/>`+fill(o.p,pc);em=E(ink)}
 else if(st==='Line'){body=`<path d="${d}" fill="#FFF6E9" stroke="${col}" stroke-width="5"/>`+fill(o.p,shade(col,.78))+`<path d="${d}" fill="none" stroke="${col}" stroke-width="1.6" transform="translate(50 50) scale(.84) translate(-50 -50)"/>`;em=E(col)}
 else if(st==='Shadow'){body=`<path d="${d}" fill="${col}"/>`+fill(o.p,pc);em=`<g transform="translate(4 4)">${E(shade(col,-.45))}</g>`+E(ink)}
 else if(st==='Woodcut'){defs+=`<pattern id="h${id}" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="3.4" height="1.7" fill="${ink}"/></pattern><mask id="k${id}">${emb(o.e,'#fff')}</mask>`;
  body=`<path d="${d}" fill="${col}"/>`+fill(o.p,shade(col,-.2));em=`<g mask="url(#k${id})"><rect width="100" height="100" fill="${shade(col,-.35)}"/><rect width="100" height="100" fill="url(#h${id})"/></g>`+embStroke(o.e,ink,10)}
 else if(st==='Neon'){defs+=`<filter id="g${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  body=`<path d="${d}" fill="#16142C"/>`+fill(o.p,shade(col,-.55))+`<path d="${d}" fill="none" stroke="${col}" stroke-width="2.6" filter="url(#g${id})" transform="translate(50 50) scale(.9) translate(-50 -50)"/>`;em=`<g filter="url(#g${id})">${E(shade(col,.35))}</g>`}
 else if(st==='Paper cut'){defs+=`<filter id="s${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2.2" stdDeviation="1.6" flood-color="#000" flood-opacity=".35"/></filter><clipPath id="m${id}"><path d="${d}" transform="translate(50 50) scale(.86) translate(-50 -50)"/></clipPath>`;
  body=`<path d="${d}" fill="${shade(col,.25)}"/><path d="${d}" fill="${col}" filter="url(#s${id})" transform="translate(50 50) scale(.86) translate(-50 -50)"/><g clip-path="url(#m${id})">${pat(o.p,shade(col,-.1))}</g><path d="${d}" fill="${shade(col,-.18)}" filter="url(#s${id})" transform="translate(50 50) scale(.7) translate(-50 -50)"/>`;em=`<g filter="url(#s${id})">${E(ink)}</g>`}
 else if(st==='Riso print'){defs+=`<pattern id="r${id}" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><circle cx="1.5" cy="1.5" r=".75" fill="${col}"/></pattern>`;
  body=`<path d="${d}" fill="${shade(col,.62)}"/><path d="${d}" fill="url(#r${id})"/>`+fill(o.p,shade(col,.35));em=`<g style="mix-blend-mode:multiply"><g transform="translate(2.4 1.8)">${E('#E8603C')}</g>${E(shade(col,-.3))}</g>`}
 else if(st==='Stained glass'){const pts=[[0,0],[50,0],[100,0],[100,50],[100,100],[50,100],[0,100],[0,50]],sh=[.25,-.1,.1,-.2,.3,-.05,.15,-.15];let f='';for(let i=0;i<8;i++){const a=pts[i],b=pts[(i+1)%8];f+=`<path d="M50 50 L${a} L${b}Z" fill="${shade(col,sh[i])}"/>`}
  body=`<g clip-path="url(#c${id})">${f}</g><path d="${d}" fill="none" stroke="#1E1C38" stroke-width="4"/>`;em=embStroke(o.e,'#1E1C38',30)+E(ink==='#1E1C38'?'#FFD35C':ink)}
 else if(st==='Full colour'){body=`<path d="${d}" fill="${shade(col,.55)}"/>`+fill(o.p,shade(col,.4));const C=window.BP_EMC;em=C&&C[o.e]?`<g transform="translate(22 22) scale(1.75)">${C[o.e]}</g>`:''}
 let ring='';const rc=o.r==='gold'?'#E9B949':(st==='Line'?col:'#FFF6E9');const sc=k=>`transform="translate(50 50) scale(${k}) translate(-50 -50)"`;
 if(o.r==='thin')ring=`<path d="${d}" fill="none" stroke="${rc}" stroke-width="2" ${sc(.88)}/>`;
 if(o.r==='double')ring=`<path d="${d}" fill="none" stroke="${rc}" stroke-width="1.6" ${sc(.9)}/><path d="${d}" fill="none" stroke="${rc}" stroke-width="1.6" ${sc(.84)}/>`;
 if(o.r==='dotted')ring=`<path d="${d}" fill="none" stroke="${rc}" stroke-width="2.6" stroke-dasharray="0.1 5" stroke-linecap="round" ${sc(.88)}/>`;
 if(o.r==='notched')ring=`<path d="${d}" fill="none" stroke="${rc}" stroke-width="3" stroke-dasharray="6 4" ${sc(.88)}/>`;
 if(o.r==='gold')ring=`<path d="${d}" fill="none" stroke="#E9B949" stroke-width="5"/>`;
 const glow=opts.glow?`<circle cx="50" cy="50" r="58" fill="#FFD35C" opacity=".18"/><circle cx="50" cy="50" r="52" fill="#FFD35C" opacity=".2"/>`:'';
 return `<svg class="bm${opts.cls?' '+opts.cls:''}" viewBox="${opts.glow?'-12 -12 124 124':'-6 -6 112 112'}" role="img" aria-label="${opts.label||'Mark'}"><defs>${defs}</defs>${glow}${body}${ring}${em}${charm(o.h,o.r==='gold'?'#E9B949':'#FFD35C')}</svg>`}
// a mark is stored as a short code: s.c.i.p.e.y.r.h (indexes, emblem by name)
function emblems(style){if(style==='Full colour')return window.BP_EMC?Object.keys(window.BP_EMC):['lion'];const E=window.BP_EMB;return E?Object.keys(E.d):['lion']}
function norm(o){o=Object.assign({s:'circle',c:'#2F8F6B',i:'#FFF6E9',p:'none',e:'lion',y:'Flat',r:'none',h:'none'},o||{});
 if(!SH[o.s])o.s='circle';if(!STYLES.includes(o.y))o.y='Flat';if(o.y==='Full colour'){if(window.BP_EMC&&!window.BP_EMC[o.e])o.e='lion'}else if(window.BP_EMB&&!window.BP_EMB.d[o.e])o.e='lion';return o}
function encode(o){o=norm(o);return [SHN.indexOf(o.s),PAL.indexOf(o.c),INK.indexOf(o.i),PATS.indexOf(o.p),o.e,STYLES.indexOf(o.y),RINGS.indexOf(o.r),CHARMS.indexOf(o.h)].join('.')}
function decode(code){const a=String(code||'').split('.');if(a.length<8)return norm({});const n=(arr,i)=>arr[+a[i]]||arr[0];
 return norm({s:n(SHN,0),c:n(PAL,1),i:n(INK,2),p:n(PATS,3),e:a[4],y:n(STYLES,5),r:n(RINGS,6),h:n(CHARMS,7)})}
function rng(seed){let s=seed>>>0||1;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function hash(str){let h=2166136261;for(const ch of String(str)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function random(seed){const r=seed==null?Math.random:rng(seed),pick=a=>a[Math.floor(r()*a.length)];
 const y=r()<.12?'Full colour':pick(STYLES.slice(0,8)),c=pick(PAL);let i=pick(INK);if(i===c)i='#FFF6E9';
 return norm({s:pick(SHN),c,i,p:pick(PATS),e:pick(emblems(y)),y,r:r()<.45?'none':pick(RINGS),h:r()<.55?'none':pick(CHARMS)})}
const forName=name=>random(hash(name||'x'));
// honest count: only choices that change how a style looks are counted
function count(){const E=window.BP_EMB?Object.keys(window.BP_EMB.d).length:378,C=window.BP_EMC?Object.keys(window.BP_EMC).length:115;let t=0;
 for(const y of STYLES){const u=USES[y];t+=(y==='Full colour'?C:E)*(u.ink?INK.length:1)*(u.pat?PATS.length:1)}
 return t*SHN.length*PAL.length*RINGS.length*CHARMS.length}
window.BPM={render,encode,decode,random,forName,count,norm,emblems,SHN,PAL,INK,PATS,RINGS,CHARMS,STYLES,SH};
})();
