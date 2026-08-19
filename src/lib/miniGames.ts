// ---------------------------------------------------------------------------
// Self-contained mini-games used by DEMO MODE.
// Each entry is a complete HTML5 game as a string. When Supabase is not
// configured, these are turned into blob: URLs and loaded in the iframe
// player so the portal is fully explorable end-to-end with real gameplay.
// ---------------------------------------------------------------------------

export interface MiniGame {
  id: string
  html: string
}

const SHARED_CSS = `
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;overflow:hidden;background:#0b1020;color:#e2e8f0;
    font-family:Inter,system-ui,Segoe UI,Roboto,sans-serif;user-select:none}
  .wrap{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px}
  canvas{background:#0f172a;border-radius:12px;box-shadow:0 0 0 1px #1e293b,0 20px 50px rgba(0,0,0,.5)}
  .hud{display:flex;gap:24px;font-weight:700;font-size:14px;letter-spacing:.5px}
  .hud span b{color:#60a5fa}
  button{cursor:pointer;border:none;border-radius:10px;padding:10px 18px;font-weight:700;
    background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;font-size:14px}
  .hint{font-size:12px;color:#64748b}
`

const wrap = (innerCss: string, body: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
  `<style>${SHARED_CSS}${innerCss}</style></head><body>${body}</body></html>`

// --- Neon Breaker (paddle + bricks) -----------------------------------------
const breaker = wrap(
  '',
  `<div class="wrap"><div class="hud"><span>SCORE <b id="s">0</b></span><span>LIVES <b id="l">3</b></span></div>
   <canvas id="c" width="480" height="360"></canvas><div class="hint">Move mouse or use ◀ ▶ keys</div></div>
   <script>
   const c=document.getElementById('c'),x=c.getContext('2d');let W=480,H=360;
   function fit(){const s=Math.min((innerWidth-32)/W,(innerHeight-120)/H,1.4);c.style.width=W*s+'px';c.style.height=H*s+'px';}
   addEventListener('resize',fit);fit();
   let paddle=W/2,ball={x:W/2,y:H-40,dx:3,dy:-3,r:6},score=0,lives=3,bricks=[];
   const cols=9,rows=5,bw=44,bh=16,gap=6,off=(W-cols*(bw+gap)+gap)/2;
   for(let r=0;r<rows;r++)for(let i=0;i<cols;i++)bricks.push({x:off+i*(bw+gap),y:40+r*(bh+gap),a:1,hue:200+r*20});
   onmousemove=e=>{paddle=Math.max(40,Math.min(W-40,(e.clientX-c.getBoundingClientRect().left)/(c.clientWidth/W)))};
   onkeydown=e=>{if(e.key==='ArrowLeft')paddle-=24;if(e.key==='ArrowRight')paddle+=24};
   function reset(b){ball={x:W/2,y:H-40,dx:b?3:-3,dy:-3,r:6}}
   function loop(){
     x.fillStyle='#0f172a';x.fillRect(0,0,W,H);
     paddle=Math.max(40,Math.min(W-40,paddle));
     ball.x+=ball.dx;ball.y+=ball.dy;
     if(ball.x<ball.r||ball.x>W-ball.r)ball.dx*=-1;
     if(ball.y<ball.r)ball.dy*=-1;
     if(ball.y>H+20){lives--;document.getElementById('l').textContent=lives;if(lives<=0){alert('Game Over! Score: '+score);score=0;lives=3;reset(true)}else reset(true)}
     if(ball.y>H-18&&ball.x>paddle-40&&ball.x<paddle+40){ball.dy=-Math.abs(ball.dy);ball.dx=(ball.x-paddle)/8}
     let alive=0;
     for(const b of bricks){if(!b.a)continue;alive++;
       if(ball.x>b.x&&ball.x<b.x+bw&&ball.y>b.y&&ball.y<b.y+bh){b.a=0;ball.dy*=-1;score+=10;document.getElementById('s').textContent=score}}
     for(const b of bricks){if(!b.a)continue;x.fillStyle='hsl('+b.hue+',80%,60%)';x.fillRect(b.x,b.y,bw,bh)}
     x.fillStyle='#60a5fa';x.fillRect(paddle-40,H-12,80,8);
     x.fillStyle='#fff';x.beginPath();x.arc(ball.x,ball.y,ball.r,0,7);x.fill();
     if(!alive){alert('You cleared the board! Score: '+score);bricks.forEach(b=>b.a=1);score=0;document.getElementById('s').textContent=0;reset(true)}
     requestAnimationFrame(loop);
   }
   loop();
   </script>`,
)

// --- Tic Tac Toe vs simple AI -----------------------------------------------
const tic = wrap(
  `#b{display:grid;grid-template-columns:repeat(3,84px);grid-template-rows:repeat(3,84px);gap:8px}
   .c{display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:800;
     background:#1e293b;border-radius:12px;cursor:pointer;color:#60a5fa}.c.o{color:#f472b6}`,
  `<div class="wrap"><div class="hud" id="msg">Your turn (X)</div><div id="b"></div><button id="again">Play again</button></div>
   <script>
   const b=document.getElementById('b'),msg=document.getElementById('msg');let g=Array(9).fill(''),over=false;
   const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
   function render(){b.innerHTML='';g.forEach((v,i)=>{const d=document.createElement('div');d.className='c'+(v==='O'?' o':'');d.textContent=v; d.onclick=()=>play(i);b.appendChild(d)})}
   function check(b){for(const[a,c,d]of wins)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return null}
   function best(b){let m=-99,mi=-1;for(let i=0;i<9;i++)if(!b[i]){b[i]='O';let s=score(b,0,false);b[i]='';if(s>m){m=s;mi=i}}return mi}
   function score(b,depth,max){const w=check(b);if(w==='O')return 10-depth;if(w==='X')return depth-10;if(!b.includes(''))return 0;
     if(max){let m=-99;for(let i=0;i<9;i++)if(!b[i]){b[i]='O';m=Math.max(m,score(b,depth+1,false));b[i]=''}return m}
     let m=99;for(let i=0;i<9;i++)if(!b[i]){b[i]='X';m=Math.min(m,score(b,depth+1,true));b[i]=''}return m}
   function play(i){if(over||g[i])return;g[i]='X';end();if(over)return;const m=best(g);if(m>=0)g[m]='O';end()}
   function end(){render();const w=check(g);if(w){over=true;msg.textContent=w==='X'?'You win! 🎉':'AI wins!';return}
     if(!g.includes('')){over=true;msg.textContent="It's a draw!";return}msg.textContent='Your turn (X)'}
   document.getElementById('again').onclick=()=>{g=Array(9).fill('');over=false;end()};
   render();
   </script>`,
)

// --- Snake ------------------------------------------------------------------
const snake = wrap(
  '',
  `<div class="wrap"><div class="hud"><span>SCORE <b id="s">0</b></span></div>
   <canvas id="c" width="360" height="360"></canvas><div class="hint">Arrow keys / WASD · Space to pause</div></div>
   <script>
   const c=document.getElementById('c'),x=c.getContext('2d'),G=18,N=20;let snake=[{x:8,y:8}],dir={x:1,y:0},food={x:12,y:8},score=0,t=0,paused=false;
   function fit(){const s=Math.min((innerWidth-32)/360,(innerHeight-120)/360,1.3);c.style.width=360*s+'px';c.style.height=360*s+'px';}
   addEventListener('resize',fit);fit();
   onkeydown=e=>{const k=e.key.toLowerCase();if(k===' ')paused=!paused;
     if((k==='arrowup'||k==='w')&&dir.y===0)dir={x:0,y:-1};
     if((k==='arrowdown'||k==='s')&&dir.y===0)dir={x:0,y:1};
     if((k==='arrowleft'||k==='a')&&dir.x===0)dir={x:-1,y:0};
     if((k==='arrowright'||k==='d')&&dir.x===0)dir={x:1,y:0}};
   function step(){if(paused)return requestAnimationFrame(()=>{t=0;requestAnimationFrame(loop)});
     const h={x:(snake[0].x+dir.x+N)%N,y:(snake[0].y+dir.y+N)%N};
     if(snake.some(s=>s.x===h.x&&s.y===h.y)){alert('Game Over! Score: '+score);snake=[{x:8,y:8}];dir={x:1,y:0};score=0;document.getElementById('s').textContent=0;food={x:12,y:8}}
     snake.unshift(h);
     if(h.x===food.x&&h.y===food.y){score++;document.getElementById('s').textContent=score;food={x:(Math.random()*N)|0,y:(Math.random()*N)|0}}
     else snake.pop();
     requestAnimationFrame(()=>{t=0;loop()})}
   function loop(){x.fillStyle='#0f172a';x.fillRect(0,0,360,360);
     x.fillStyle='#f472b6';x.fillRect(food.x*G+2,food.y*G+2,G-4,G-4);
     snake.forEach((s,i)=>{x.fillStyle=i===0?'#60a5fa':'#3b82f6';x.fillRect(s.x*G+2,s.y*G+2,G-4,G-4)});
     t++;if(t>7)step();else requestAnimationFrame(loop)}
   loop();
   </script>`,
)

// --- Memory Match -----------------------------------------------------------
const memory = wrap(
  `#b{display:grid;grid-template-columns:repeat(4,72px);gap:8px}
   .c{width:72px;height:72px;border-radius:12px;font-size:34px;display:flex;align-items:center;justify-content:center;
     background:#1e293b;cursor:pointer;transition:.2s}.c.flip{background:#334155}.c.done{opacity:.4;cursor:default}`,
  `<div class="wrap"><div class="hud"><span>MOVES <b id="m">0</b></span><span>PAIRS <b id="p">0</b>/8</span></div><div id="b"></div><button id="again">Restart</button></div>
   <script>
   const b=document.getElementById('b');const emojis=['🎮','🚀','👾','🕹️','⭐','🔥','💎','🎯'];let cards=[],first=null,lock=false,moves=0,pairs=0;
   function build(){cards=[...emojis,...emojis].sort(()=>Math.random()-.5).map((e,i)=>({i,e,flip:false,done:false}));first=null;lock=false;moves=0;pairs=0;document.getElementById('m').textContent=0;document.getElementById('p').textContent=0;render()}
   function render(){b.innerHTML='';cards.forEach((c,i)=>{const d=document.createElement('div');d.className='c'+(c.flip?' flip':'')+(c.done?' done':'');d.textContent=c.flip||c.done?c.e:'';d.onclick=()=>tap(i);b.appendChild(d)})}
   function tap(i){const c=cards[i];if(lock||c.done||c.flip)return;c.flip=true;render();
     if(!first){first=c;return}
     if(first.e===c.e){first.done=c.done=true;pairs++;document.getElementById('p').textContent=pairs;first=null;
       if(pairs===8)setTimeout(()=>alert('You won in '+moves+' moves!'),300)}
     else{lock=true;moves++;document.getElementById('m').textContent=moves;setTimeout(()=>{first.flip=false;c.flip=false;first=null;lock=false;render()},700)}}
   document.getElementById('again').onclick=build;build();
   </script>`,
)

// --- Reaction Test ----------------------------------------------------------
const reaction = wrap(
  `#pad{width:320px;height:320px;border-radius:24px;display:flex;align-items:center;justify-content:center;
     font-weight:800;font-size:22px;text-align:center;padding:20px;cursor:pointer;transition:.05s;
     background:#1e293b}.go{background:#16a34a!important}.wait{background:#ca8a04!important}.fail{background:#dc2626!important}`,
  `<div class="wrap"><div class="hud"><span>BEST <b id="best">—</b></span></div>
   <div id="pad">Click to start</div><div class="hint">Wait for green, then click as fast as you can</div></div>
   <script>
   const pad=document.getElementById('pad');let state='idle',t0=0,best=null,to;
   pad.onclick=()=>{
     if(state==='idle'||state==='done'||state==='early'){
       pad.className='wait';pad.textContent='Wait for green...';state='wait';
       to=setTimeout(()=>{state='go';pad.className='go';pad.textContent='CLICK!';t0=Date.now()},800+Math.random()*2200)}
     else if(state==='wait'){clearTimeout(to);state='early';pad.className='fail';pad.textContent='Too soon! Click to retry'}
     else if(state==='go'){const ms=Date.now()-t0;state='done';pad.className='';pad.textContent=ms+' ms — click to retry';
       if(best===null||ms<best){best=ms;document.getElementById('best').textContent=best+'ms'}}
   };
   </script>`,
)

// --- 2048-lite --------------------------------------------------------------
const g2048 = wrap(
  `#b{display:grid;grid-template-columns:repeat(4,72px);grid-template-rows:repeat(4,72px);gap:8px;padding:8px;background:#1e293b;border-radius:14px}
   .c{width:72px;height:72px;border-radius:10px;background:#0f172a;display:flex;align-items:center;justify-content:center;
     font-weight:800;font-size:26px;color:#e2e8f0}.c[data-v="2"]{background:#334155}.c[data-v="4"]{background:#3b82f6}.c[data-v="8"]{background:#8b5cf6}
   .c[data-v="16"]{background:#a855f7}.c[data-v="32"]{background:#ec4899}.c[data-v="64"]{background:#f43f5e}.c[data-v="128"]{background:#f59e0b;font-size:22px}.c[data-v="256"]{background:#eab308;font-size:22px}`,
  `<div class="wrap"><div class="hud"><span>SCORE <b id="s">0</b></span><button id="again">New game</button></div><div id="b"></div><div class="hint">Arrow keys or swipe to merge</div></div>
   <script>
   const b=document.getElementById('b');let g,score;
   function add(){const e=[];for(let i=0;i<16;i++)if(!g[i])e.push(i);if(!e.length)return;g[e[(Math.random()*e.length)|0]]=Math.random()<.9?2:4}
   function init(){g=Array(16).fill(0);score=0;add();add();draw()}
   function draw(){document.getElementById('s').textContent=score;b.innerHTML='';for(let i=0;i<16;i++){const d=document.createElement('div');d.className='c';d.dataset.v=g[i]||'';d.textContent=g[i]||'';b.appendChild(d)}}
   // slide+merge one row to the LEFT, return {row,score,moved}
   function slide(r){const a=r.filter(x=>x);const out=[];let sc=0;
     for(let i=0;i<a.length;i++){if(i<a.length-1&&a[i]===a[i+1]){out.push(a[i]*2);sc+=a[i]*2;i++}else out.push(a[i])}
     while(out.length<4)out.push(0);let moved=false;for(let i=0;i<4;i++)if(out[i]!==r[i])moved=true;return{row:out,sc,moved}}
   // get line of 4 cells in traversal order for direction dir (start cell first)
   function lineCells(dir,k){const idx=[];
     for(let j=0;j<4;j++){let cell; if(dir==='l')cell=k*4+j; else if(dir==='r')cell=k*4+3-j; else if(dir==='u')cell=k+j*4; else cell=12-k+j*4; idx.push(cell);}return idx;}
   function move(dir){let moved=false,gain=0;
     for(let k=0;k<4;k++){const idx=lineCells(dir,k);const row=idx.map(i=>g[i]);const{row:out,sc,moved:m}=slide(row);
       idx.forEach((i,j)=>g[i]=out[j]);if(m)moved=true;gain+=sc;}
     if(moved){score+=gain;add();draw();if(!canMove())setTimeout(()=>alert('No moves left! Score: '+score),200)}}
   function canMove(){for(let i=0;i<16;i++){if(!g[i])return true;const x=i%4,y=(i/4)|0;
     if(x<3&&g[i]===g[i+1])return true;if(y<3&&g[i]===g[i+4])return true}return false}
   onkeydown=e=>{const k=e.key;if(!k.startsWith('Arrow'))return;e.preventDefault();move({ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'}[k])};
   let sx,sy;b.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
   b.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
     if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'))},{passive:true});
   document.getElementById('again').onclick=init;init();
   </script>`,
)
export const MINI_GAMES: Record<string, string> = {
  breaker,
  tic,
  snake,
  memory,
  reaction,
  g2048,
}
