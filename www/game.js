(()=>{
"use strict";
const T=32,COLS=20,ROWS=11,W=COLS*T,H=ROWS*T;
const GRAV=.5,JUMP=9.5,SPEED=3;
const $=id=>document.getElementById(id);
const cv=$("c"),ctx=cv.getContext("2d");
cv.width=W;cv.height=H;
const P={ink:"#fff4dc",tile:"#3a3766",top:"#8f8bd2",spike:"#ff4d5e",door:"#ffc247",doorD:"#b8791a",muted:"#9d98d0",violet:"#a98bff",teal:"#5ee0c8"};
const E=".".repeat(COLS);
const FONT='"Trebuchet MS","Segoe UI",system-ui,sans-serif';
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
};

/* ---------- Som e voz ---------- */
let ac=null,voiceOn=store.get("nm_voice",true);
function unlock(){try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();}catch(e){}}
function beep(f,d,type="square",v=.04,to=0){
  try{
    if(!ac)return;
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(f,ac.currentTime);
    if(to)o.frequency.exponentialRampToValueAtTime(to,ac.currentTime+d);
    g.gain.setValueAtTime(v,ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);
    o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d);
  }catch(e){}
}
function speak(t){
  try{
    if(!voiceOn||!("speechSynthesis" in window))return;
    const ss=window.speechSynthesis;ss.cancel();
    const u=new SpeechSynthesisUtterance(t);
    u.lang="pt-PT";u.rate=.92;u.pitch=.7;
    const vs=ss.getVoices();
    const v=vs.find(x=>/^pt[-_]PT/i.test(x.lang))||vs.find(x=>/^pt/i.test(x.lang));
    if(v)u.voice=v;
    ss.speak(u);
  }catch(e){}
}
function stopSpeak(){try{if("speechSynthesis" in window)window.speechSynthesis.cancel();}catch(e){}}

/* ---------- Motor ---------- */
function mk(k,tx,ty,tw=1,th=1,o={}){
  return Object.assign({k,x:tx*T,y:ty*T,w:tw*T,h:th*T,vis:true,on:true,dir:"up",
    trig:null,fx:null,fired:false,vy:0,stopY:0,rev:0,lie:false},o);
}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function hurt(o){
  if(o.k==="spike")return o.dir==="down"?{x:o.x+7,y:o.y,w:o.w-14,h:o.h-9}:{x:o.x+7,y:o.y+9,w:o.w-14,h:o.h-9};
  return {x:o.x+2,y:o.y+2,w:o.w-4,h:o.h-2};
}
function newActor(s){return {x:s.x,y:s.y,w:20,h:28,vx:0,vy:0,f:1,onGround:false,coyote:0};}
function moveActor(a,Sd,dir,jumpReq){
  a.vx=dir*SPEED;if(dir)a.f=dir;
  a.coyote=a.onGround?6:a.coyote-1;
  let jumped=false;
  if(jumpReq&&a.coyote>0){a.vy=-JUMP;a.coyote=0;jumped=true;}
  a.vy=Math.min(a.vy+GRAV,12);
  a.x+=a.vx;
  for(const s of Sd)if(hit(a,s)){if(a.vx>0)a.x=s.x-a.w;else if(a.vx<0)a.x=s.x+s.w;}
  a.y+=a.vy;a.onGround=false;
  for(const s of Sd)if(hit(a,s)){
    if(a.vy>0){a.y=s.y-a.h;a.onGround=true;}
    else if(a.vy<0){a.y=s.y+s.h;}
    a.vy=0;
  }
  return jumped;
}
function parse(rows){
  const statics=[{x:-200,y:-200,w:200,h:1000},{x:W,y:-200,w:200,h:1000},{x:-200,y:-200,w:W+400,h:200}];
  const objs=[];let spawn={x:0,y:0};
  for(let ty=0;ty<ROWS;ty++){
    const row=((rows[ty]||E)+E).slice(0,COLS);
    for(let tx=0;tx<COLS;tx++){
      const c=row[tx];
      if(c==="#")statics.push({x:tx*T,y:ty*T,w:T,h:T});
      else if(c==="S")spawn={x:tx*T+6,y:ty*T+4};
      else if(c==="D")objs.push(mk("door",tx,ty,1,1,{x:tx*T+4,w:24}));
      else if(c==="F")objs.push(mk("fake",tx,ty,1,1,{x:tx*T+4,w:24}));
      else if(c==="^")objs.push(mk("spike",tx,ty));
      else if(c==="v")objs.push(mk("spike",tx,ty,1,1,{dir:"down"}));
    }
  }
  return {statics,objs,spawn};
}
const pop=o=>{o.vis=true;o.on=true;beep(180,.12,"sawtooth",.05,90);};
const fallSpike=tx=>mk("spike",tx,1,1,1,{dir:"down",stopY:288,trig:[tx*T-50,100,62,220],fx:{vy:8}});
const hiddenSpike=tx=>mk("spike",tx,9,1,1,{vis:false,on:false});
const invisPlat=(tx,w=1)=>mk("block",tx,10,w,1,{vis:false});
function rowStr(items){
  const a=Array(COLS).fill(".");
  for(const[c,ch]of items)a[c]=ch;
  return a.join("");
}
function floorStr(gaps=[]){
  const a=Array(COLS).fill("#");
  for(const c of gaps)a[c]=".";
  return a.join("");
}
const CEIL=floorStr([]);

/* ---------- Níveis ----------
   Fase 1 (1-4): o narrador só diz a verdade e ajuda.
   Fase 2 (5-8): começa a mentir... e às vezes volta a dizer a verdade. */
const FLAT=[E,E,E,E,E,E,E,E,E,".S................D.","####################"];
const LEVELS=[
 {map:[E,E,E,E,E,E,E,E,E,".S.......^........D.","####################"],
  win:"Muito bem. Sabia que ias conseguir.",
  build:a=>[
   {x:40,say:"Sou o Narrador. Tudo o que eu disser é verdade."},
   {x:190,say:"Espeto à frente. Salta."},
   {x:350,say:"Já confias em mim. Óptimo."},
   {x:480,say:"A porta é a seguir. Vai."}
  ]},
 {map:[E,E,E,E,E,E,E,E,E,".S............^...D.","########..##########"],
  win:"Perfeito. Continua a ouvir-me.",
  build:a=>{
    a.spike(14).on=false;
    return [
     {x:40,say:"Buraco à frente. Salta-o."},
     {x:345,say:"Aquele espeto é de enfeite. Passa."},
     {x:500,say:"Vês? Eu digo sempre a verdade."}
    ];
  }},
 {map:FLAT,
  win:"Foste rápido. Gosto disso.",
  build:a=>{
    const sp=mk("spike",10,9,1,1,{vis:false,on:false});a.objs.push(sp);
    return [
     {x:40,say:"Há um espeto escondido à tua frente."},
     {x:170,say:"Salta quando eu disser."},
     {x:236,say:"Agora!",act:()=>pop(sp)},
     {x:420,say:"Sabia que ias conseguir."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,".S................D.","###############..###"],
  win:"Estamos a entender-nos.",
  build:a=>{
    a.objs.push(mk("spike",12,1,1,1,{dir:"down",stopY:288,trig:[334,100,62,220],fx:{vy:8}}));
    a.objs.push(mk("block",15,10,2,1,{vis:false}));
    return [
     {x:40,say:"O teto vai cair à tua frente."},
     {x:150,say:"Quando cair, pára. Depois salta."},
     {x:420,say:"Não saltes aquele buraco. O chão está lá."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,".S......^....^....D.","####################"],
  win:"Nada de dramas. Continuemos.",
  build:a=>{
    const s1=a.spike(8),s2=a.spike(13);
    s1.lie=a.att===1;s2.on=false;
    return [
     {x:90,say:a.att===1?"Aquele espeto é falso. Passa por cima.":"Perdoa. Esse era real. Salta-o."},
     {x:300,say:"Este também é falso. Passa."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,".S....^...^...^...D.","####################"],
  win:"Sobreviveste. Por agora.",
  build:a=>{
    a.spike(6).on=false;a.spike(10).on=false;
    const last=a.spike(14),lying=a.att%2===1;
    last.lie=lying;
    return [
     {x:90,say:"Este espeto é inofensivo. Passa."},
     {x:215,say:"Este também é inofensivo."},
     {x:340,say:lying?"O último é inofensivo também. Garanto.":"O último é mortal. Salta."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,"........vvvv........",E,".S................D.","########....########"],
  win:"Confiaste. Ou tiveste sorte.",
  build:a=>{
    a.objs.push(mk("block",8,10,4,1,{vis:false}));
    return [
     {x:40,say:"O próximo buraco tem chão. Não saltes."},
     {x:150,say:"O teto está baixo. Se saltares, morres."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,".S.........D......F.","####################"],
  win:"Escolheste bem. Ou eu deixei.",
  build:a=>{
    a.fake().lie=a.att===1;
    return [
     {x:40,say:a.att===1?"A primeira porta é falsa. Vai até à última.":"Já não sei qual é a porta verdadeira. Escolhe tu."}
    ];
  }},

 /* ---- Fase C (9-14): as mentiras tornam-se a norma ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[7,"^"],[13,"^"],[17,"D"]]),floorStr()],
  win:"Vês? Sobreviveste na mesma.",
  build:a=>{
    a.spike(7).lie=true;a.spike(13).lie=true;
    return [
     {x:40,say:"Nem repares nesses espetos. São falsos, os dois."},
     {x:300,say:"Confia em mim. Quase sempre resulta."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Não avisei. E pronto.",
  build:a=>{
    const sp=hiddenSpike(11);sp.lie=true;a.objs.push(sp);
    return [
     {x:40,say:"Este nível não tem nada de especial."},
     {x:302,act:()=>pop(sp)}
    ];
  }},
 {map:["####################",E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Verdade a sério. Desta vez.",
  build:a=>{
    a.objs.push(fallSpike(9));
    return [{x:40,say:"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[16,"D"]]),floorStr([9,10,11])],
  win:"Sobrevives sempre a este. Curioso.",
  build:a=>{
    a.objs.push(invisPlat(9,3));
    return [{x:40,say:"Aquele buraco à frente é real. Vais ter de saltar."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[7,"^"],[13,"^"],[18,"D"]]),floorStr()],
  win:"Confiaste. Mais uma vez.",
  build:a=>{
    a.spike(7).on=false;
    const real=a.spike(13);real.lie=true;
    return [{x:40,say:"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[11,"D"],[18,"F"]]),floorStr()],
  win:"Escolheste bem.",
  build:()=>[{x:40,say:"Há duas portas mais à frente. Só uma é verdadeira."}]},

 /* ---- Fase D (15-20): já não esconde que mente ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[10,"^"],[16,"D"]]),floorStr()],
  win:"Aprendeste depressa.",
  build:()=>[
   {x:40,say:"Confissão: nem sempre digo a verdade. A partir de agora, cuidado."},
   {x:250,say:"Este espeto é real. Por acaso."}
  ]},
 {map:["####################",E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Devias ter parado.",
  build:a=>{
    a.objs.push(fallSpike(8));
    return [{x:40,say:"Nada de perigoso à frente. Podes correr à vontade."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr()],
  win:"Estavas mesmo a acreditar?",
  build:a=>{
    const sp=hiddenSpike(12);sp.lie=true;a.objs.push(sp);
    return [
     {x:40,say:"Este nível é uma oferta. Sem armadilhas."},
     {x:334,act:()=>pop(sp)}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[9,"^"],[18,"D"]]),floorStr([5,6,12,13])],
  win:"Os buracos nunca mentem. Só eu.",
  build:a=>{
    a.objs.push(invisPlat(5,2));a.objs.push(invisPlat(12,2));
    return [{x:40,say:"Os buracos são inofensivos. O espeto lá no meio, não."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[6,"^"],[10,"^"],[14,"^"],[18,"D"]]),floorStr()],
  win:"Desta vez eram mesmo todos reais.",
  build:a=>{
    for(const o of a.objs)if(o.k==="spike")o.lie=true;
    return [{x:40,say:"Como sempre, dois destes espetos são só decoração."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Foi só uma brincadeira.",
  build:()=>[
   {x:60,say:"Vou trocar os teus controlos. Só para rir.",act:()=>{invert=200;}},
   {x:400,say:"Pronto, já passou. A porta é ali."}
  ]},

 /* ---- Fase E (21-26): manipulador, blefes duplos ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[10,"^"],[16,"D"]]),floorStr()],
  win:"Vês? Também posso ser sincero.",
  build:()=>[{x:40,say:"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente."}]},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr()],
  win:"Prometi. Não cumpri.",
  build:a=>{
    const sp=hiddenSpike(12);sp.lie=true;a.objs.push(sp);
    return [
     {x:40,say:"Prometo: nunca mais te apanho de surpresa."},
     {x:334,act:()=>pop(sp)}
    ];
  }},
 {map:["####################",E,E,E,E,E,E,E,E,rowStr([[1,"S"],[15,"^"],[19,"D"]]),floorStr()],
  win:"Dois avisos certos seguidos. Estranho.",
  build:a=>{
    a.objs.push(fallSpike(7));
    a.spike(15).on=false;
    return [
     {x:40,say:"Atenção real: o teto vai cair aqui à frente."},
     {x:420,say:"Aquele espeto lá à frente já não importa. É inofensivo."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[6,"^"],[10,"^"],[14,"^"],[18,"D"]]),floorStr()],
  win:"O primeiro. Quem diria.",
  build:a=>{
    a.spike(6).lie=true;
    a.spike(10).on=false;a.spike(14).on=false;
    return [{x:40,say:"Só o último é perigoso, como sempre."}];
  }},
 {map:["####################",E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"...",
  build:a=>{
    a.objs.push(fallSpike(9));
    return [{x:40,say:"..."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[8,"F"],[13,"^"],[18,"D"]]),floorStr()],
  win:"A porta longe é que importa.",
  build:()=>[{x:40,say:"A porta mais próxima é a verdadeira, para variar."}]},

 /* ---- Fase F (27-30): a máscara cai ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[7,"^"],[18,"D"]]),floorStr()],
  win:"Ainda sei dizer a verdade, vês?",
  build:a=>{
    const sp=hiddenSpike(13);a.objs.push(sp);
    return [
     {x:40,say:"Já não vale a pena mentir mais. Espeto real à frente."},
     {x:250,say:"Vou avisar-te sempre a partir de agora: salta quando eu disser."},
     {x:366,say:"Agora!",act:()=>pop(sp)}
    ];
  }},
 {map:["####################",E,E,E,E,E,E,E,E,rowStr([[1,"S"],[11,"^"],[15,"^"],[19,"D"]]),floorStr()],
  win:"Chegaste. Contra tudo.",
  build:a=>{
    a.objs.push(fallSpike(6));
    const s1=a.spike(11),s2=a.spike(15);
    if(a.att%2===1){s1.on=true;s2.on=false;}else{s1.on=false;s2.on=true;}
    return [{x:40,say:"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade."}];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[10,"^"],[16,"D"]]),floorStr()],
  win:"Obrigado por teres continuado.",
  build:()=>[
   {x:40,say:"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias."},
   {x:250,say:"Este é real. Desculpa por todos os outros."}
  ]},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[14,"D"],[19,"F"]]),floorStr()],
  win:"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.",
  build:()=>[
   {x:40,say:"Chegámos ao fim. Já não te vou dizer o que é verdade."},
   {x:250,say:"A partir de agora, decides tu."}
  ]}
];

/* ---------- Estado ---------- */
let gf=0,lv=0,att=1,deaths=0,lieDeaths=0,st="title",timer=0,shake=0,invert=0;
let shield=false,adPlaying=0,invuln=0;
let gems=store.get("nm_gems",0);
let S=[],objs=[],beats=[],p=null,particles=[];
const narr={t:"",t0:0};
const inp={l:false,r:false};
let jumpBuf=0;

function sayIt(t){narr.t=t;narr.t0=gf;speak(t);if(/!$/.test(t))shake=5;}
function phaseOf(l){return l<4?0:l<8?1:l<14?2:l<20?3:l<26?4:5;}
const DEATH={
 0:{t:["Não faz mal. Tenta outra vez.","Eu expliquei bem. Concentra-te.","Respira e volta a tentar."],
    l:["Isso não devia ter acontecido."]},
 1:{t:["Isso foi culpa tua.","Eu avisei. Acho eu.","Interessante escolha."],
    l:["Eu disse isso? Não me lembro.","Foi um engano. Já passou.","Isso não estava no guião."]},
 2:{t:["Tenta prestar mais atenção.","Isso foi previsível.","Achavas mesmo que era seguro?"],
    l:["Ups. Essa parte eu inventei.","Pormenor que esqueci de mencionar.","Nem tudo o que digo é verdade, sabias?"]},
 3:{t:["Já não sei se ainda confias em mim.","Boa tentativa.","Isso teria funcionado, noutro nível."],
    l:["Eu avisei que às vezes minto.","Culpa tua por acreditares.","Isso foi só para ver se saltavas."]},
 4:{t:["Estás a magoar-me com essa desconfiança.","Nem sempre é armadilha, sabes?","Vais mesmo continuar assim?"],
    l:["Desta vez era mentira mesmo. Desculpa.","Eu só queria ver a tua cara.","Confiança é para os fracos, aparentemente."]},
 5:{t:["Estamos quase no fim.","Só mais um pouco.","Depois disto, acabou."],
    l:["Até no fim, não resisti.","Última mentira, prometo. Ou não.","Faltava mesmo esta."]}
};
function deathLine(lie){
  const pool=DEATH[phaseOf(lv)],arr=lie?pool.l:pool.t;
  return arr[Math.floor(Math.random()*arr.length)];
}
function load(){
  const L=LEVELS[lv],m=parse(L.map);
  S=m.statics;objs=m.objs;
  const a={att,objs,
    spike:tx=>objs.find(o=>o.k==="spike"&&o.dir==="up"&&Math.round(o.x/T)===tx),
    fake:()=>objs.find(o=>o.k==="fake")};
  beats=L.build(a).map(b=>Object.assign({done:false},b));
  p=newActor(m.spawn);particles=[];st="play";jumpBuf=0;invert=0;invuln=0;
}
function startLevel(n){lv=n;att=1;load();store.set("nm_lv",lv);}
function die(o){
  if(st!=="play"||invuln>0)return;
  if(shield){
    shield=false;invuln=45;shake=8;beep(600,.16,"triangle",.06,900);
    sayIt("O escudo absorveu isso. Sorte a tua.");
    return;
  }
  st="dead";timer=75;deaths++;att++;
  const lie=!!(o&&o.lie);if(lie)lieDeaths++;
  sayIt(deathLine(lie));shake=10;
  for(let i=0;i<16;i++){
    const a=Math.random()*Math.PI*2,s=1.5+Math.random()*3.5;
    particles.push({x:p.x+10,y:p.y+14,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:40+Math.random()*20});
  }
  beep(200,.35,"sawtooth",.07,40);
  try{if(navigator.vibrate)navigator.vibrate(60);}catch(e){}
}
function win(){
  if(st!=="play")return;
  st="win";timer=130;
  sayIt(LEVELS[lv].win);
  beep(523,.12,"square",.05);setTimeout(()=>beep(784,.2,"square",.05),110);
}
function nextLevel(){
  if(lv+1>=LEVELS.length){finish();return;}
  startLevel(lv+1);
}
function finish(){
  st="end";store.set("nm_lv",0);stopSpeak();
  showMenu("Fim",
    `Mortes: ${deaths}. Por acreditares em mim: ${lieDeaths}.\nNunca confies em quem te guia. Nem em mim. Ou confia. Já não sei.`,
    [{t:"Jogar outra vez",main:true,f:()=>newGame()}]);
}
function newGame(){deaths=0;lieDeaths=0;hideMenu();startLevel(0);}

/* ---------- Passo ---------- */
function step(){
  gf++;
  if(adPlaying>0){
    adPlaying--;
    if(adPlaying===0){
      shield=true;
      const g=8+Math.floor(Math.random()*8);gems+=g;store.set("nm_gems",gems);
      sayIt(`Anúncio visto. +${g} gemas e um escudo. De nada.`);
    }
    return;
  }
  if(jumpBuf>0)jumpBuf--;
  if(invuln>0)invuln--;
  if(shake>0)shake--;
  for(const q of particles){q.x+=q.vx;q.y+=q.vy;q.vy+=.25;q.life--;}
  particles=particles.filter(q=>q.life>0);
  if(st==="dead"){if(--timer<=0)load();return;}
  if(st==="win"){if(--timer<=0)nextLevel();return;}
  if(st!=="play")return;

  const dir=(inp.r?1:0)-(inp.l?1:0);
  const eff=invert>0?-dir:dir;
  if(invert>0)invert--;
  const Sd=S.concat(objs.filter(o=>o.k==="block"&&o.on));
  const j=moveActor(p,Sd,eff,jumpBuf>0);
  if(j){jumpBuf=0;beep(340,.1,"square",.03,620);}

  for(const b of beats){
    if(!b.done&&p.x>=b.x){b.done=true;if(b.say)sayIt(b.say);if(b.act)b.act();}
  }
  for(const o of objs){
    if(!o.fired&&o.trig&&hit(p,{x:o.trig[0],y:o.trig[1],w:o.trig[2],h:o.trig[3]})){
      o.fired=true;if(o.fx&&o.fx.vy)o.vy=o.fx.vy;beep(120,.15,"sawtooth",.05,60);
    }
    if(o.vy){o.y+=o.vy;if(o.vy>0&&o.y>=o.stopY){o.y=o.stopY;o.vy=0;shake=4;}}
    if(o.rev>0)o.rev--;
    if(o.k==="block"&&p.onGround&&Math.abs(p.y+p.h-o.y)<.5&&p.x+p.w>o.x&&p.x<o.x+o.w)o.rev=70;
  }
  for(const o of objs){
    if(!o.on)continue;
    if((o.k==="spike"||o.k==="fake")&&hit(p,hurt(o))){die(o);return;}
    if(o.k==="door"&&hit(p,o)){win();return;}
  }
  if(p.y>H+60)die(null);
}

/* ---------- Desenho ---------- */
const bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,"#1d1a3d");bg.addColorStop(1,"#0f0d20");
function txt(s,x,y,size,color,align="center",weight="bold"){
  ctx.font=`${weight} ${size}px ${FONT}`;
  ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline="middle";ctx.fillText(s,x,y);
}
function drawTile(x,y,w,h){
  ctx.fillStyle=P.tile;ctx.fillRect(x,y,w,h);
  const cols=Math.max(1,Math.round(w/T));
  for(let i=0;i<cols;i++){
    if(((x/T+i)|0)%2===0){ctx.fillStyle="rgba(255,255,255,.03)";ctx.fillRect(x+i*T,y,T,h);}
  }
  ctx.fillStyle=P.top;ctx.fillRect(x,y,w,3);
  ctx.fillStyle="rgba(0,0,0,.22)";ctx.fillRect(x,y+h-3,w,3);
  ctx.fillStyle="rgba(0,0,0,.18)";ctx.fillRect(x+w-2,y,2,h);
}
function drawHills(){
  ctx.fillStyle="rgba(169,139,255,.06)";
  for(let i=0;i<3;i++){
    const cx=90+i*260+(lv*37)%80,cy=H-40,r=100+((i*53+lv*19)%50);
    ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,0);ctx.fill();
  }
  ctx.fillStyle="rgba(255,255,255,.025)";
  for(let i=0;i<4;i++){
    const cx=40+i*190+(lv*41)%60,cy=H-30,r=60+((i*29+lv*11)%40);
    ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,0);ctx.fill();
  }
}
function drawSpike(o){
  const n=Math.max(1,Math.round(o.w/T));
  ctx.fillStyle=P.spike;
  for(let i=0;i<n;i++){
    const x=o.x+i*T;ctx.beginPath();
    if(o.dir==="down"){ctx.moveTo(x+2,o.y);ctx.lineTo(x+T-2,o.y);ctx.lineTo(x+T/2,o.y+o.h);}
    else{ctx.moveTo(x+2,o.y+o.h);ctx.lineTo(x+T-2,o.y+o.h);ctx.lineTo(x+T/2,o.y+2);}
    ctx.closePath();ctx.fill();
  }
}
function drawHero(a){
  const cx=a.x+a.w/2,gy=a.y+a.h,f=a.f;
  const sq=Math.max(-.35,Math.min(.35,a.vy/16));
  const bw=a.w*(1+sq*.5),bh=a.h*(1-sq*.5),bx=cx-bw/2,by=gy-bh;
  // capa
  ctx.fillStyle=P.violet;
  ctx.beginPath();
  ctx.moveTo(cx-f*bw*.35,by+bh*.3);
  ctx.quadraticCurveTo(cx-f*(bw*.9+Math.abs(a.vx)*1.6),by+bh*.55,cx-f*bw*.15,gy-1);
  ctx.lineTo(cx-f*bw*.05,by+bh*.55);
  ctx.closePath();ctx.fill();
  // pernas (só quando no chão e a mexer)
  if(a.onGround){
    const step=Math.sin(gf/5)*4*(Math.abs(a.vx)>.2?1:0);
    ctx.fillStyle="#2a2750";
    ctx.fillRect(bx+bw*.2,gy-6,5,6+step);
    ctx.fillRect(bx+bw*.6,gy-6,5,6-step);
  }
  // corpo
  const r=Math.min(bw,bh)*.32;
  ctx.fillStyle=P.ink;
  ctx.beginPath();
  ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);ctx.arcTo(bx+bw,by,bx+bw,by+r,r);
  ctx.lineTo(bx+bw,gy-r);ctx.arcTo(bx+bw,gy,bx+bw-r,gy,r);
  ctx.lineTo(bx+r,gy);ctx.arcTo(bx,gy,bx,gy-r,r);
  ctx.lineTo(bx,by+r);ctx.arcTo(bx,by,bx+r,by,r);
  ctx.closePath();ctx.fill();
  // capuz
  ctx.fillStyle="#d8cdfa";
  ctx.beginPath();ctx.ellipse(cx+f*bw*.08,by+bh*.18,bw*.42,bh*.28,0,0,6.3);ctx.fill();
  // olho
  ctx.fillStyle="#15132b";
  ctx.beginPath();ctx.ellipse(cx+f*bw*.3,by+bh*.22,2.6,3.4,0,0,6.3);ctx.fill();
  // brilho do olho
  ctx.fillStyle="rgba(255,255,255,.8)";
  ctx.beginPath();ctx.ellipse(cx+f*bw*.3+1,by+bh*.19,.9,1,0,0,6.3);ctx.fill();
}
function drawDoor(o){
  const w=o.w,x=o.x,y=o.y;
  ctx.fillStyle=P.doorD;ctx.fillRect(x-2,y+6,w+4,o.h-6);
  ctx.beginPath();ctx.arc(x+w/2,y+8,w/2+2,Math.PI,0);ctx.fill();
  ctx.fillStyle=P.door;ctx.fillRect(x,y+8,w,o.h-8);
  ctx.beginPath();ctx.arc(x+w/2,y+8,w/2,Math.PI,0);ctx.fill();
  ctx.fillStyle=P.doorD;ctx.beginPath();ctx.arc(x+w-6,y+o.h/2+4,2.5,0,7);ctx.fill();
}
function wrap(text,maxW){
  const words=text.split(" "),lines=[];let line="";
  for(const w of words){
    const t=line?line+" "+w:w;
    if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w;}else line=t;
  }
  if(line)lines.push(line);return lines;
}
function bubble(text,t0){
  ctx.font=`bold 16px ${FONT}`;
  const lines=wrap(text,500),bh=lines.length*22+16,bw=540,bx=(W-bw)/2,by=26;
  ctx.fillStyle="rgba(10,8,24,.92)";ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle=P.violet;ctx.fillRect(bx,by,5,bh);
  ctx.strokeStyle="rgba(169,139,255,.5)";ctx.lineWidth=1.5;ctx.strokeRect(bx,by,bw,bh);
  let left=Math.floor((gf-t0)/.8);
  lines.forEach((ln,i)=>{
    txt(ln.slice(0,Math.max(0,left)),bx+18,by+19+i*22,16,P.ink,"left","bold");
    left-=ln.length+1;
  });
}
function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  if(st==="title"||st==="end")return;
  if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  drawHills();
  for(const s of S){if(s.x<0||s.x>=W||s.y<0)continue;drawTile(s.x,s.y,s.w,s.h);}
  for(const o of objs){
    if(o.k==="block"){
      if(o.vis)drawTile(o.x,o.y,o.w,o.h);
      else if(o.rev>0){
        ctx.globalAlpha=Math.min(1,o.rev/50)*.6;
        drawTile(o.x,o.y,o.w,o.h);ctx.globalAlpha=1;
      }
      continue;
    }
    if(!o.vis)continue;
    if(o.k==="spike")drawSpike(o);else drawDoor(o);
  }
  if(st!=="dead"&&!(invuln>0&&(gf%6<3)))drawHero(p);
  if(shield&&st!=="dead"){
    ctx.strokeStyle="rgba(94,224,200,.7)";ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h/2,p.w*.9,p.h*.7,0,0,6.3);ctx.stroke();
  }
  for(const q of particles){ctx.fillStyle=P.ink;ctx.fillRect(q.x,q.y,4,4);}
  ctx.setTransform(1,0,0,1,0,0);
  txt(`${lv+1}/${LEVELS.length}`,W-12,14,14,P.muted,"right","normal");
  txt(`mortes ${deaths}`,W-12,32,12,P.muted,"right","normal");
  txt(`💎 ${gems}`,12,14,14,P.door,"left","normal");
  if(shield)txt("🛡 escudo pronto",12,32,12,P.teal,"left","normal");
  if(invert>0)txt("↔ controlos trocados",W/2,H-26,13,P.door);
  if(narr.t&&gf-narr.t0<360)bubble(narr.t,narr.t0);
  if(st==="dead"){ctx.fillStyle="rgba(255,77,94,.2)";ctx.fillRect(0,0,W,H);}
  if(adPlaying>0){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle="rgba(8,6,18,.94)";ctx.fillRect(0,0,W,H);
    txt("📺 Anúncio a decorrer",W/2,H/2-30,26,P.ink);
    txt(String(Math.ceil(adPlaying/60)),W/2,H/2+22,44,P.door);
    txt("(no jogo final, um anúncio real da AdMob aparece aqui)",W/2,H-24,12,P.muted,"center","normal");
  }
}

/* ---------- Menu ---------- */
function showMenu(title,text,buttons){
  $("mTitle").textContent=title;$("mText").textContent=text;
  const box=$("btns");box.innerHTML="";
  buttons.forEach(b=>{
    const el=document.createElement("button");
    el.className="card"+(b.main?" main":"");el.textContent=b.t;
    el.addEventListener("click",()=>{unlock();b.f();});
    box.appendChild(el);
  });
  $("menu").style.display="flex";
  $("app").classList.add("inmenu");document.body.classList.add("inmenu");
}
function hideMenu(){
  $("menu").style.display="none";
  $("app").classList.remove("inmenu");document.body.classList.remove("inmenu");
}
function voiceLabel(){return voiceOn?"🔊":"🔇";}
function titleMenu(){
  st="title";stopSpeak();inp.l=inp.r=false;
  const saved=Math.min(LEVELS.length-1,store.get("nm_lv",0)||0);
  const btns=[];
  if(saved>0){
    btns.push({t:`Continuar (nível ${saved+1} de ${LEVELS.length})`,main:true,f:()=>{hideMenu();startLevel(saved);}});
    btns.push({t:"Novo jogo",f:()=>newGame()});
  }else btns.push({t:"Jogar",main:true,f:()=>newGame()});
  btns.push({t:`Voz do narrador: ${voiceOn?"ligada":"desligada"}`,f:()=>{toggleVoice();titleMenu();}});
  btns.push({t:`🛍 Loja (💎 ${gems})`,f:()=>openShop()});
  showMenu("O Narrador Mente","O narrador guia-te até à porta de cada nível. Confia nele. Ou não.",btns);
}
function openShop(){
  showMenu("Loja",`Tens 💎 ${gems} gemas, ganhas a ver anúncios.\n\nRemover anúncios — em breve\nPacote de skins — em breve\nEsta loja é só um protótipo: ainda não liga a pagamentos reais.`,
    [{t:"Voltar",main:true,f:()=>titleMenu()}]);
}
function toggleVoice(){
  voiceOn=!voiceOn;store.set("nm_voice",voiceOn);$("bVoice").textContent=voiceLabel();
  if(!voiceOn)stopSpeak();
}
$("bVoice").textContent=voiceLabel();
$("bVoice").addEventListener("pointerdown",e=>{e.preventDefault();unlock();toggleVoice();});
$("bMenu").addEventListener("pointerdown",e=>{e.preventDefault();titleMenu();});
$("bAd").addEventListener("pointerdown",e=>{
  e.preventDefault();unlock();
  if(st!=="play"||adPlaying>0||shield)return;
  adPlaying=150;
});

/* ---------- Entrada ---------- */
const dpad=$("dpad"),bl=$("bl"),br=$("br");
let dpId=null;
function dpUpdate(e){
  const r=dpad.getBoundingClientRect(),left=e.clientX<r.left+r.width/2;
  inp.l=left;inp.r=!left;
  bl.classList.toggle("on",inp.l);br.classList.toggle("on",inp.r);
}
function dpEnd(){inp.l=inp.r=false;dpId=null;bl.classList.remove("on");br.classList.remove("on");}
dpad.addEventListener("pointerdown",e=>{
  e.preventDefault();unlock();dpId=e.pointerId;
  try{dpad.setPointerCapture(e.pointerId);}catch(_){}
  dpUpdate(e);
});
dpad.addEventListener("pointermove",e=>{if(e.pointerId===dpId)dpUpdate(e);});
["pointerup","pointercancel","lostpointercapture"].forEach(t=>dpad.addEventListener(t,e=>{if(e.pointerId===dpId||t==="lostpointercapture")dpEnd();}));
const jb=$("jump");
jb.addEventListener("pointerdown",e=>{e.preventDefault();unlock();jb.classList.add("on");jumpBuf=8;});
["pointerup","pointercancel","pointerleave"].forEach(t=>jb.addEventListener(t,()=>jb.classList.remove("on")));
addEventListener("keydown",e=>{
  const k=e.key;
  if(["ArrowLeft","a","A"].includes(k)){inp.l=true;e.preventDefault();}
  else if(["ArrowRight","d","D"].includes(k)){inp.r=true;e.preventDefault();}
  else if([" ","ArrowUp","w","W"].includes(k)){if(!e.repeat)jumpBuf=8;e.preventDefault();}
});
addEventListener("keyup",e=>{
  const k=e.key;
  if(["ArrowLeft","a","A"].includes(k))inp.l=false;
  else if(["ArrowRight","d","D"].includes(k))inp.r=false;
});
addEventListener("contextmenu",e=>e.preventDefault());

/* ---------- Ciclo ---------- */
window.__nm={inp,step,setJump(v){jumpBuf=v?8:0;},
  begin(n,a){hideMenu();deaths=0;lieDeaths=0;lv=n;att=a||1;load();},
  get st(){return st;},get p(){return p;},get lv(){return lv;},get att(){return att;},get lie(){return lieDeaths;},
  get objs(){return objs;},get LEVELS(){return LEVELS;}};
titleMenu();
let last=0,acc=0;const DT=1000/60;
function loop(t){
  if(!last)last=t;
  acc+=Math.min(100,t-last);last=t;
  while(acc>=DT){step();acc-=DT;}
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
