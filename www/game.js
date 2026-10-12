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
/* ---- Armadilhas novas ---- */
const crumble=(tx,w=1)=>mk("crumble",tx,10,w,1,{state:"idle",timer:0,vis:true});
const movePlat=(tx,ty,w,opts={})=>mk("moveplat",tx,ty,w,1,Object.assign({baseX:tx*T,baseY:ty*T,ax:0,ay:0,speed:.03,phase:0,vis:true},opts));
const timedGate=(tx,ty,h,onDur,offDur,phase=0)=>mk("timedgate",tx,ty,1,h,{onDur,offDur,phase,vis:true});
const bouncePad=(tx,real=true)=>mk("bounce",tx,10,1,1,{real,vis:true});
const dartGun=(tx,ty,dir,interval,phase=0)=>mk("dartgun",tx,ty,1,1,{dir,interval,phase,vis:true});
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
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[9,"^"],[14,"^"],[18,"D"]]),"####################"],
  win:"Muito bem. Sabia que ias conseguir.",
  build:a=>[
   {x:40,say:"Sou o Narrador. Tudo o que eu disser é verdade."},
   {x:190,say:"Espeto à frente. Salta."},
   {x:350,say:"Outro. Salta de novo."},
   {x:420,say:"Já confias em mim. Óptimo."},
   {x:500,say:"A porta é a seguir. Vai."}
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
    const sp2=hiddenSpike(15);sp2.lie=true;a.objs.push(sp2);
    return [
     {x:40,say:"Este nível não tem nada de especial."},
     {x:302,act:()=>pop(sp)},
     {x:430,act:()=>pop(sp2)}
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
   {x:60,say:"Vou trocar os teus controlos. Só para rir.",act:()=>{invert=260;}},
   {x:400,say:"Pronto, já passou. A porta é ali."}
  ]},

 /* ---- Fase E (21-26): manipulador, blefes duplos ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[10,"^"],[14,"^"],[16,"D"]]),floorStr()],
  win:"Vês? Também posso ser sincero.",
  build:()=>[
   {x:40,say:"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente."},
   {x:400,say:"Mais um, logo depois. Também real."}
  ]},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr()],
  win:"Prometi. Não cumpri.",
  build:a=>{
    const sp=hiddenSpike(12);sp.lie=true;a.objs.push(sp);
    const sp2=hiddenSpike(15);sp2.lie=true;a.objs.push(sp2);
    return [
     {x:40,say:"Prometo: nunca mais te apanho de surpresa."},
     {x:334,act:()=>pop(sp)},
     {x:430,act:()=>pop(sp2)}
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
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[10,"^"],[13,"^"],[16,"D"]]),floorStr()],
  win:"Obrigado por teres continuado.",
  build:()=>[
   {x:40,say:"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias."},
   {x:250,say:"Este é real. Desculpa por todos os outros."},
   {x:380,say:"Mais um, já quase no fim."}
  ]},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[14,"D"],[19,"F"]]),floorStr()],
  win:"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.",
  build:()=>[
   {x:40,say:"Chegámos ao fim. Já não te vou dizer o que é verdade."},
   {x:250,say:"A partir de agora, decides tu."}
  ]},

 /* ---- Fase G (31-40): O Jogo Continua -- o narrador nao esperava que chegasses aqui ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([8,9])],
  win:"Continuas a surpreender-me.",
  build:a=>{
    a.objs.push(crumble(8,2));
    return [
     {x:30,say:"Oh. Ainda aqui? A maior parte desiste depois do \"fim\"."},
     {x:150,say:"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[17,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"]]),floorStr()],
  win:"Alturas. Quem diria.",
  build:a=>{
    a.objs.push(bouncePad(5,false));
    a.objs.push(bouncePad(9,true));
    return [
     {x:30,say:"Oh. Ainda aqui? Não esperava isso."},
     {x:140,say:"Aquilo ali é só decoração. Nem repares."},
     {x:260,say:"Mas isto... isto atira-te para cima. A porta não está no chão desta vez."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr([9,10,11,12])],
  win:"Equilíbrio. Quem diria que tinhas.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:64,speed:.045,phase:0}));
    return [
     {x:30,say:"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta."},
     {x:170,say:"Sobe para cima dela quando ela passar perto. Não saltes cedo demais."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Paciência. Não esperava isso de ti.",
  build:a=>{
    a.objs.push(timedGate(10,8,2,55,55,0));
    return [
     {x:30,say:"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente."},
     {x:170,say:"Espera que abra. Depois atravessa depressa."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Reflexos decentes. Para um humano.",
  build:a=>{
    a.objs.push(dartGun(10,7,-1,80,0));
    return [
     {x:30,say:"Aquilo ali dispara. Não perguntes como nem porquê."},
     {x:250,say:"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[14,"^"],[18,"D"]]),floorStr([7,8])],
  win:"Ainda tens os reflexos todos.",
  build:a=>{
    a.objs.push(crumble(7,2));
    a.spike(14).lie=true;
    return [
     {x:30,say:"De volta aos clássicos. Lembras-te destes?"},
     {x:120,say:"O chão vai tremer. Não pares."},
     {x:380,say:"Esse espeto parece a decoração do costume. Não é."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[15,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"]]),floorStr()],
  win:"Dois sustos seguidos. Nada mau.",
  build:a=>{
    const hs=hiddenSpike(5);hs.lie=false;a.objs.push(hs);
    a.objs.push(bouncePad(9,true));
    return [
     {x:30,say:"Mais uma surpresa. Literalmente."},
     {x:110,act:()=>pop(hs)},
     {x:250,say:"A seguir, não penses. Salta para dentro daquilo."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr([11,12])],
  win:"Dois obstáculos, zero mentiras. Estranhamente simples.",
  build:a=>{
    a.objs.push(timedGate(7,8,2,50,50,0));
    return [
     {x:30,say:"Outra parede teimosa. E depois, um buraco a sério."},
     {x:170,say:"Espera a parede abrir."},
     {x:330,say:"Agora salta o buraco. Desta vez não minto: é real."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([9,10,11,12])],
  win:"Isso foi... impressionantemente coordenado.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:64,speed:.05,phase:30}));
    a.objs.push(dartGun(15,7,-1,90,0));
    return [
     {x:30,say:"Combinação nova: uma plataforma que anda. Confia no ritmo dela."},
     {x:170,say:"Sobe quando ela passar perto."},
     {x:400,say:"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[14,"^"],[18,"D"]]),floorStr([7,8])],
  win:"Alguma coisa está a mudar em mim. Não sei se é bom sinal.",
  build:a=>{
    a.objs.push(crumble(7,2));
    a.objs.push(timedGate(10,8,2,45,45,0));
    a.spike(14).lie=true;
    return [
     {x:30,say:"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar."},
     {x:120,say:"O chão treme outra vez. Não penses demais, só anda."},
     {x:300,say:"Espera a parede. Sei que estás cansado de esperar por mim."},
     {x:430,say:"Esse espeto é a sério. Como quase tudo o que não te digo."}
    ];
  }}
];
LEVELS.push(
 /* ---- Fase H (41-55): Confissoes -- o narrador comeca a mostrar-se mais humano ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"Ainda aqui. Obrigado por isso.",
  build:a=>{
    const hs12=hiddenSpike(12);hs12.lie=true;a.objs.push(hs12);
    a.objs.push(timedGate(3,8,2,50,50,0));
    return [
     {x:20,say:"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora."},
     {x:30,say:"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas."},
     {x:102,say:"Salta isto. É real, prometo. Hoje não me apetece mentir."},
     {x:264,say:"Confia em mim mais uma vez. Só mais uma."},
     {x:334,act:()=>pop(hs12)}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr([3,4,8,9,10,11])],
  win:"Às vezes a verdade é só isto: continuaste.",
  build:a=>{
    a.objs.push(crumble(3,2));
    a.objs.push(movePlat(10,10,2,{ax:64,speed:0.05,phase:10}));
    return [
     {x:20,say:"O chão vai tremer. Não penses muito nisso."},
     {x:30,say:"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir."},
     {x:166,say:"Essa plataforma é a única coisa estável nesta conversa toda."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"]]),floorStr()],
  win:"Interrompi-me a mim mesmo. Nem acredito.",
  build:a=>{
    const hs6=hiddenSpike(6);hs6.lie=true;a.objs.push(hs6);
    a.objs.push(bouncePad(10,true));
    return [
     {x:30,say:"Há uma coisa que preciso de te contar antes de continuarmos."},
     {x:142,act:()=>pop(hs6)},
     {x:260,say:"Esquece o que ia dizer. Salta para ali."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[14,"D"]]),floorStr([6,7])],
  win:"Vês? Ainda consigo ser direto, quando quero.",
  build:a=>{
    a.objs.push(dartGun(3,7,-1,85,0));
    return [
     {x:20,say:"Aquilo dispara. Fica no chão e não acontece nada."},
     {x:30,say:"Tenho saudades de quando só havia espetos. Simples. Previsíveis."},
     {x:102,say:"Este buraco, esse sim, exige que saltes."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[3,"^"],[17,"D"]]),floorStr([10,11])],
  win:"Disse a verdade. Ena. Estranho não arder a língua.",
  build:a=>{
    a.spike(3).lie=true;
    a.objs.push(timedGate(7,8,2,55,55,0));
    a.objs.push(crumble(10,2));
    return [
     {x:20,say:"Esse espeto ali. Chama-lhe o que quiseres. É real."},
     {x:30,say:"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia."},
     {x:134,say:"A parede vai abrir. Como tudo, eventualmente."},
     {x:230,say:"E o chão... o chão nunca foi de confiança, pois não?"}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[16,"D"]]),floorStr([3,4,5,6])],
  win:"Aguentaste. Outra vez.",
  build:a=>{
    const hs10=hiddenSpike(10);hs10.lie=true;a.objs.push(hs10);
    a.objs.push(movePlat(5,10,2,{ax:64,speed:0.05,phase:20}));
    return [
     {x:20,say:"Sobe a plataforma. Sem perguntas desta vez."},
     {x:30,say:"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais."},
     {x:200,say:"Última coisa: há algo escondido à frente."},
     {x:270,act:()=>pop(hs10)}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[11,"^"],[17,"D"]]),floorStr([3,4])],
  win:"Sobreviveste ao meu tédio existencial. Parabéns.",
  build:a=>{
    a.objs.push(crumble(3,2));
    a.objs.push(dartGun(8,7,-1,85,0));
    return [
     {x:20,say:"Chão instável. O habitual."},
     {x:30,say:"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto."},
     {x:156,say:"Aquilo dispara, mas sabes a regra: fica no chão."},
     {x:262,say:"Este espeto não tem graça nenhuma. É só perigoso."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"^"],[19,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"]]),floorStr()],
  win:"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.",
  build:a=>{
    a.objs.push(bouncePad(9,true));
    a.spike(16).lie=true;
    return [
     {x:30,say:"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia."},
     {x:220,say:"Salta para dentro daquilo."},
     {x:470,say:"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[15,"D"]]),floorStr([6,7,8,9])],
  win:"Ritmo. Afinal tens ritmo.",
  build:a=>{
    a.objs.push(timedGate(3,8,2,55,55,0));
    a.objs.push(movePlat(8,10,2,{ax:64,speed:0.05,phase:0}));
    return [
     {x:20,say:"Espera a parede."},
     {x:30,say:"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira."},
     {x:102,say:"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[3,"^"],[19,"D"]]),floorStr([7,8])],
  win:"Não sei o que isto significa para ti. Para mim, significa mais do que devia.",
  build:a=>{
    const hs12=hiddenSpike(12);hs12.lie=true;a.objs.push(hs12);
    a.spike(3).lie=true;
    a.objs.push(crumble(7,2));
    a.objs.push(timedGate(16,8,2,50,50,0));
    return [
     {x:20,say:"Esse espeto é real. Como a maior parte do que te disse hoje, aliás."},
     {x:30,say:"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero."},
     {x:134,say:"O chão treme. Já sabes o resto."},
     {x:264,say:"Vem aí outro susto. Desculpa antecipadamente."},
     {x:334,act:()=>pop(hs12)},
     {x:422,say:"E por fim, uma parede paciente. Como tu, aparentemente."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[13,"D"]]),floorStr([6,7])],
  win:"Caos controlado. É a minha especialidade.",
  build:a=>{
    a.objs.push(dartGun(3,7,-1,85,0));
    a.objs.push(crumble(6,2));
    return [
     {x:20,say:"Fica no chão, foge do dardo."},
     {x:30,say:"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos."},
     {x:102,say:"E agora, não te demores no chão instável."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[13,"^"],[19,"D"]]),floorStr([3,4])],
  win:"Discerniste o perigo do adereço. Boa.",
  build:a=>{
    const hs9=hiddenSpike(9);hs9.lie=true;a.objs.push(hs9);
    a.spike(13).on=false;
    return [
     {x:20,say:"Esse ali exige mesmo um salto."},
     {x:30,say:"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar."},
     {x:168,say:"E algo invisível à espreita, como sempre."},
     {x:238,act:()=>pop(hs9)},
     {x:326,say:"Esse espeto ali nem ligues. Decoração pura, desta vez a sério."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[10,"^"],[16,"D"]]),floorStr([3,4,5,6])],
  win:"Resumiste bem a lição. Orgulhoso, sinceramente.",
  build:a=>{
    a.objs.push(movePlat(5,10,2,{ax:64,speed:0.05,phase:15}));
    a.spike(10).lie=true;
    return [
     {x:20,say:"Sobe quando ela passar perto."},
     {x:30,say:"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo."},
     {x:230,say:"Esse espeto é real, apesar de tudo o que já te disse em contrário."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr([9,10])],
  win:"Festival terminado. Sobreviveste à programação toda.",
  build:a=>{
    a.objs.push(timedGate(3,8,2,50,50,0));
    a.objs.push(dartGun(6,7,-1,85,0));
    return [
     {x:20,say:"Esperar. A tua parte preferida, sei bem."},
     {x:30,say:"Parede, dardo, buraco. Um festival dos meus favoritos."},
     {x:92,say:"Fica no chão aqui."},
     {x:198,say:"E este salta-se mesmo. Sem truques."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[15,"^"],[19,"D"]]),floorStr([3,4,8,9,10,11])],
  win:"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.",
  build:a=>{
    a.objs.push(crumble(3,2));
    a.objs.push(movePlat(10,10,2,{ax:64,speed:0.05,phase:5}));
    a.spike(15).lie=true;
    return [
     {x:20,say:"Chão instável, dos teus preferidos a esta altura."},
     {x:30,say:"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires."},
     {x:166,say:"Plataforma errante, uma última vez neste capítulo."},
     {x:400,say:"Espeto real. Sem surpresas. E sem mais truques, por hoje."}
    ];
  }}
);
LEVELS.push(
 /* ---- Fase I (56-70): O Espelho -- o narrador comeca a questionar-se, nao so a ti ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[13,"^"],[18,"D"]]),floorStr([7,8])],
  win:"Repetimos isto tantas vezes que até perdi a conta. Tu também?",
  build:a=>{
    a.objs.push(crumble(7,2));
    a.spike(13).lie=true;
    return [
     {x:20,say:"Chão instável. Já sabes a dança."},
     {x:30,say:"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado."},
     {x:330,say:"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Escondi-me de ti. Falhei.",
  build:a=>{
    const hs=hiddenSpike(9);hs.lie=true;a.objs.push(hs);
    a.objs.push(timedGate(14,8,2,55,55,10));
    return [
     {x:20,say:"Há algo escondido. Como sempre, de resto."},
     {x:120,act:()=>pop(hs)},
     {x:260,say:"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([9,10,11,12])],
  win:"Coordenaste duas mentiras ao mesmo tempo. Impressionante.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:64,speed:.05,phase:0}));
    a.objs.push(dartGun(4,7,-1,85,0));
    return [
     {x:20,say:"Fica no chão aqui, há algo a voar."},
     {x:30,say:"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?"},
     {x:230,say:"Sobe na plataforma quando ela passar perto."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"],[9,"^"]]),floorStr()],
  win:"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.",
  build:a=>{
    a.spike(9).lie=true;
    a.objs.push(bouncePad(11,true));
    return [
     {x:30,say:"Esse espeto é real, mas isso já não te surpreende, pois não?"},
     {x:300,say:"Salta para dentro daquilo. Confia no impulso, não em mim."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr([5,6,12,13])],
  win:"Dois buracos, zero hesitação. Estás a ficar bom nisto.",
  build:a=>{
    return [
     {x:20,say:"Esse buraco é a sério. Salta-o."},
     {x:30,say:"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim."},
     {x:340,say:"Este também. Sem rede, sem mentira, sem desculpa."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[16,"D"]]),floorStr([7,8])],
  win:"Precisão. Nem eu esperava.",
  build:a=>{
    a.objs.push(dartGun(3,7,-1,80,0));
    a.objs.push(crumble(7,2));
    return [
     {x:20,say:"Fica no chão. Deixa o dardo passar por cima."},
     {x:120,say:"E agora o chão some-se. Não penses, só avança."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Esperaste duas vezes sem te queixares. Progresso.",
  build:a=>{
    a.objs.push(timedGate(5,8,2,50,50,0));
    a.objs.push(movePlat(11,10,2,{ax:0,ay:40,speed:.04,phase:0}));
    return [
     {x:20,say:"Espera a parede abrir."},
     {x:200,say:"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[11,"^"],[17,"D"]]),floorStr()],
  win:"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.",
  build:a=>{
    a.objs.push(bouncePad(6,true));
    a.spike(11).on=false;
    return [
     {x:20,say:"Salta para dentro daquilo. Vais passar por cima do resto."},
     {x:280,say:"Aquele espeto nem interessa agora. Já estás no ar."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.",
  build:a=>{
    const hs=hiddenSpike(8);hs.lie=false;a.objs.push(hs);
    a.objs.push(dartGun(13,7,-1,85,0));
    return [
     {x:20,say:"Vou avisar-te a sério: há algo escondido já ali à frente."},
     {x:90,act:()=>pop(hs)},
     {x:290,say:"E outro dardo. Sabes a regra."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([5,6,13,14])],
  win:"Dois voos, dois pousos perfeitos.",
  build:a=>{
    a.objs.push(crumble(5,2));
    a.objs.push(movePlat(13,10,2,{ax:64,speed:.045,phase:20}));
    return [
     {x:20,say:"Chão que treme primeiro."},
     {x:30,say:"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida."},
     {x:260,say:"Plataforma a seguir. Apanha o ritmo dela."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[5,"^"],[9,"^"],[14,"^"],[18,"D"]]),floorStr()],
  win:"Três espetos, três verdades. Um recorde para mim.",
  build:a=>{
    return [
     {x:20,say:"Vou ser claro, por uma vez: os três espetos a seguir são todos reais."},
     {x:30,say:"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr([9,10])],
  win:"Deste o litro. Eu, por dentro, também.",
  build:a=>{
    a.objs.push(timedGate(4,8,2,50,50,0));
    a.objs.push(dartGun(7,7,-1,85,20));
    return [
     {x:20,say:"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim."},
     {x:230,say:"E este buraco não perdoa. Salta."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"]]),floorStr([6,7])],
  win:"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(bouncePad(10,true));
    return [
     {x:20,say:"Chão a tremer primeiro, nada de novo."},
     {x:180,say:"E agora o salto de fé. Literal, desta vez."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[19,"D"]]),floorStr([5,6])],
  win:"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.",
  build:a=>{
    a.objs.push(crumble(5,2));
    a.spike(12).lie=true;
    a.objs.push(dartGun(15,7,-1,80,0));
    return [
     {x:20,say:"Chão instável, espeto real, dardo no fim. O de sempre, só que mais."},
     {x:30,say:"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7,13,14])],
  win:"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(timedGate(10,8,2,50,50,0));
    a.objs.push(movePlat(13,10,2,{ax:64,speed:.05,phase:10}));
    return [
     {x:20,say:"Chão a tremer, o costume."},
     {x:30,say:"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma."},
     {x:190,say:"Parede paciente, espera por ela."},
     {x:350,say:"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o."}
    ];
  }}
);

LEVELS.push(
 /* ---- Fase J (71-85): A Queda -- o narrador perde a compostura ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"Não sei porque gritei. Desculpa.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(dartGun(12,7,-1,80,0));
    return [
     {x:20,say:"CHÃO. INSTÁVEL."},
     {x:30,say:"Desculpa. Não queria gritar. Estou... não sei o que estou."},
     {x:220,say:"Fica no chão aqui. Por favor. Só peço isto."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.",
  build:a=>{
    a.objs.push(timedGate(6,8,2,45,45,0));
    const hs=hiddenSpike(13);hs.lie=true;a.objs.push(hs);
    return [
     {x:20,say:"Espera. Eu também estou à espera de algo que não sei nomear."},
     {x:300,act:()=>pop(hs)}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([5,6,11,12])],
  win:"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:64,speed:.05,phase:0}));
    return [
     {x:20,say:"Esse buraco é real."},
     {x:30,say:"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim."},
     {x:170,say:"E a plataforma, apanha-a."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.",
  build:a=>{
    a.objs.push(dartGun(4,7,-1,70,0));
    a.objs.push(dartGun(10,7,1,70,30));
    return [
     {x:20,say:"Dois canhões, direções opostas. Fica no chão e ignora-os."},
     {x:30,say:"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"],[8,"^"]]),floorStr()],
  win:"Subiste enquanto eu caía. Função engraçada, a nossa.",
  build:a=>{
    a.spike(8).on=false;
    a.objs.push(bouncePad(11,true));
    return [
     {x:30,say:"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora."},
     {x:300,say:"Salta. Sobe. Foge de mim, se quiseres."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(timedGate(12,8,2,45,45,0));
    return [
     {x:20,say:"O chão, outra vez. Já nem peço desculpa por repetir."},
     {x:280,say:"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[7,"^"],[18,"D"]]),floorStr([12,13])],
  win:"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.",
  build:a=>{
    a.spike(7).lie=false;
    a.objs.push(movePlat(13,10,2,{ax:64,speed:.055,phase:10}));
    return [
     {x:20,say:"Esse é real. Hoje tudo é real. Até eu, acho."},
     {x:300,say:"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.",
  build:a=>{
    a.objs.push(dartGun(5,7,-1,75,0));
    a.objs.push(crumble(11,2));
    return [
     {x:20,say:"Fica no chão. A sério desta vez, mais do que nunca."},
     {x:250,say:"E agora o chão foge de ti. Irónico, não achas?"}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=true;
    a.objs.push(timedGate(15,8,2,45,45,0));
    return [
     {x:20,say:"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora."},
     {x:300,say:"Aquele espeto é real."},
     {x:420,say:"E espera a parede. Última coisa que te peço neste nível, prometo."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([5,6,11,12])],
  win:"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:0,ay:40,speed:.045,phase:0}));
    return [
     {x:20,say:"Esse buraco não perdoa ninguém."},
     {x:170,say:"A plataforma sobe e desce. Apanha-a no fundo."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Nem perguntaste porquê. Obrigado por isso, sinceramente.",
  build:a=>{
    const hs=hiddenSpike(6);hs.lie=true;a.objs.push(hs);
    a.objs.push(dartGun(11,7,-1,75,0));
    const hs2=hiddenSpike(15);hs2.lie=true;a.objs.push(hs2);
    return [
     {x:20,say:"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo."},
     {x:120,act:()=>pop(hs)},
     {x:380,act:()=>pop(hs2)}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(bouncePad(12,true));
    return [
     {x:20,say:"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te."},
     {x:290,say:"E agora um salto para cima. Foge para onde eu não chego."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.",
  build:a=>{
    a.objs.push(timedGate(5,8,2,45,45,0));
    a.objs.push(timedGate(11,8,2,45,45,25));
    return [
     {x:20,say:"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes."},
     {x:260,say:"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"O fundo do poço, finalmente. Só se sobe a partir daqui.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=false;
    a.objs.push(dartGun(15,7,-1,70,0));
    return [
     {x:20,say:"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre."},
     {x:290,say:"Esse espeto é real. Nem tenho energia para mentir sobre isto agora."},
     {x:420,say:"E um dardo, para rematar. Fica no chão e acaba com isto, por favor."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr([6,7,12,13])],
  win:"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.",
  build:a=>{
    a.objs.push(movePlat(12,10,2,{ax:64,speed:.05,phase:15}));
    a.objs.push(timedGate(16,8,2,45,45,0));
    return [
     {x:20,say:"Mais um buraco real."},
     {x:30,say:"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor."},
     {x:200,say:"Apanha a plataforma."},
     {x:420,say:"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor."}
    ];
  }}
);

LEVELS.push(
 /* ---- Fase K (86-100): Redenção -- o narrador tenta ser honesto. Tu ja nao acreditas nele ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr()],
  win:"Disse a verdade. Não saltaste logo. Não te culpo.",
  build:a=>{
    a.spike(12).lie=false;
    return [
     {x:20,say:"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo."},
     {x:280,say:"Esse espeto é real. Juro. Sei que já ouviste isto antes."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr([6,7])],
  win:"Hesitaste no salto. Eu teria hesitado também, no teu lugar.",
  build:a=>{
    a.objs.push(crumble(6,2));
    const hs=hiddenSpike(13);hs.lie=false;a.objs.push(hs);
    return [
     {x:20,say:"O chão vai tremer. Verdade, sem truques."},
     {x:290,act:()=>pop(hs)},
     {x:300,say:"Isto ia ser uma surpresa má. Desta vez não é. Prometo."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr()],
  win:"Ficaste no chão mesmo sem confiares em mim. Isso chega.",
  build:a=>{
    a.objs.push(dartGun(6,7,-1,70,0));
    a.objs.push(timedGate(12,8,2,45,45,0));
    return [
     {x:20,say:"Fica no chão. Sei que vais pensar que é mentira. Não é."},
     {x:280,say:"Espera a parede. Só isso. Nada escondido desta vez."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr([5,6,11,12])],
  win:"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:64,speed:.05,phase:0}));
    return [
     {x:20,say:"Real. Salta."},
     {x:170,say:"A plataforma também é exatamente o que parece ser."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"]]),floorStr()],
  win:"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.",
  build:a=>{
    a.objs.push(bouncePad(10,true));
    return [
     {x:30,say:"Desta vez não há pegadinha. Salta para dentro daquilo e pronto."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=false;
    return [
     {x:20,say:"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto."},
     {x:290,say:"Real. Outra vez. Vou continuar a dizer até acreditares."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.",
  build:a=>{
    a.objs.push(dartGun(5,7,-1,70,0));
    a.objs.push(dartGun(11,7,1,70,20));
    const hs=hiddenSpike(16);hs.lie=false;a.objs.push(hs);
    return [
     {x:20,say:"Dois dardos, direções opostas. Fica no chão."},
     {x:330,act:()=>pop(hs)},
     {x:340,say:"Esse era mesmo real. Não ia esconder isso de ti, não hoje."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([5,6,11,12])],
  win:"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:0,ay:40,speed:.045,phase:0}));
    return [
     {x:20,say:"..."},
     {x:170,say:"..."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Parece que, afinal, também sei dizer só verdades, quando me esforço.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=false;
    a.objs.push(timedGate(15,8,2,45,45,0));
    return [
     {x:20,say:"Chão instável. Real."},
     {x:290,say:"Espeto real."},
     {x:420,say:"Parede real, que abre e fecha como combinado. Nada de surpresas hoje."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.",
  build:a=>{
    const hs=hiddenSpike(7);hs.lie=false;a.objs.push(hs);
    a.objs.push(dartGun(12,7,-1,70,0));
    return [
     {x:20,say:"Vai haver uma surpresa, mas vou avisar-te quando chegar."},
     {x:130,act:()=>pop(hs)},
     {x:330,say:"Essa foi real, já agora. Como a maioria, nos últimos tempos."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(bouncePad(12,true));
    return [
     {x:20,say:"Chão a tremer. Real, verifica à vontade."},
     {x:290,say:"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[17,"D"]]),floorStr()],
  win:"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.",
  build:a=>{
    a.objs.push(timedGate(5,8,2,40,40,0));
    a.objs.push(timedGate(11,8,2,40,40,20));
    return [
     {x:20,say:"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada."},
     {x:260,say:"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Chegámos aqui os dois inteiros. Mais ou menos.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=false;
    a.objs.push(dartGun(15,7,-1,70,0));
    return [
     {x:20,say:"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível."},
     {x:290,say:"Espeto real."},
     {x:420,say:"Dardo real. Fica no chão e acabou."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr([6,7,12,13])],
  win:"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.",
  build:a=>{
    a.objs.push(movePlat(12,10,2,{ax:64,speed:.05,phase:10}));
    a.objs.push(timedGate(16,8,2,42,42,0));
    return [
     {x:20,say:"Buraco real, plataforma real."},
     {x:200,say:"Apanha-a."},
     {x:420,say:"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[8,"^"],[14,"^"],[19,"D"]]),floorStr()],
  win:"Redimi-me o suficiente por hoje. Amanhã, quem sabe.",
  build:a=>{
    a.spike(8).lie=false;a.spike(14).lie=false;
    return [
     {x:20,say:"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início."},
     {x:420,say:"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles."}
    ];
  }}
);

LEVELS.push(
 /* ---- Fase L (101-115): O Circulo -- tudo o que ja vimos, mais rapido e mais apertado ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([5,6,11,12])],
  win:"Cem e um. Nem festejámos o cem como devia ser.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:64,speed:.06,phase:0}));
    return [
     {x:20,say:"De volta ao trabalho. Buraco real."},
     {x:170,say:"Plataforma mais rápida que antes. Repara."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(timedGate(12,8,2,38,38,0));
    return [
     {x:20,say:"Chão instável, mais rápido a desfazer-se."},
     {x:280,say:"Parede mais impaciente também. Tudo aqui ficou mais apertado."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr()],
  win:"Três dardos, zero espaço para erros. Gosto do teu estilo.",
  build:a=>{
    a.objs.push(dartGun(4,7,-1,65,0));
    a.objs.push(dartGun(9,7,1,65,15));
    a.objs.push(dartGun(14,7,-1,65,30));
    return [
     {x:20,say:"Três canhões. Fica no chão o tempo todo e não acontece nada."},
     {x:30,say:"É basicamente um corredor. Confia nos teus pés."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"],[8,"^"]]),floorStr()],
  win:"Voaste mais alto do que precisavas. Estilo, isso sim.",
  build:a=>{
    a.spike(8).lie=false;
    a.objs.push(bouncePad(11,true));
    return [
     {x:30,say:"Esse é real."},
     {x:300,say:"E este atira-te lá para cima. O de sempre, mais rápido."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=true;
    return [
     {x:20,say:"Chão a tremer mais depressa que da última vez."},
     {x:290,say:"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.",
  build:a=>{
    a.objs.push(timedGate(5,8,2,36,36,0));
    a.objs.push(timedGate(11,8,2,36,36,18));
    return [
     {x:20,say:"Duas paredes, ritmos diferentes, mais rápidas que antes."},
     {x:260,say:"Não pares a pensar. O ritmo delas não espera por pensamentos."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([5,6,11,12])],
  win:"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.",
  build:a=>{
    a.objs.push(movePlat(11,10,2,{ax:0,ay:48,speed:.05,phase:0}));
    return [
     {x:20,say:"Real, como sempre."},
     {x:170,say:"Esta sobe e desce mais depressa. Apanha-a no fundo."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=false;
    a.objs.push(timedGate(15,8,2,36,36,0));
    return [
     {x:20,say:"Chão, espeto, parede. Tudo mais apertado que antes."},
     {x:290,say:"Real."},
     {x:420,say:"Espera a parede, mais rápida agora."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?",
  build:a=>{
    const hs=hiddenSpike(6);hs.lie=true;a.objs.push(hs);
    a.objs.push(dartGun(11,7,-1,65,0));
    const hs2=hiddenSpike(16);hs2.lie=true;a.objs.push(hs2);
    return [
     {x:20,say:"Vêm aí duas surpresas, sem avisos desta vez."},
     {x:120,act:()=>pop(hs)},
     {x:390,act:()=>pop(hs2)}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"Chão e ar, na mesma dança de sempre.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(bouncePad(12,true));
    return [
     {x:20,say:"Chão a tremer, mais depressa."},
     {x:290,say:"Salto para cima, mais forte que o habitual. Sente a diferença."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([5,6,11,12])],
  win:"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.",
  build:a=>{
    a.objs.push(movePlat(6,10,2,{ax:0,ay:30,speed:.05,phase:0}));
    a.objs.push(movePlat(12,10,2,{ax:64,speed:.055,phase:10}));
    return [
     {x:20,say:"Primeira plataforma: sobe e desce."},
     {x:170,say:"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Quatro obstáculos, um só tu. Impressionante, outra vez.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=true;
    a.objs.push(timedGate(15,8,2,34,34,0));
    return [
     {x:20,say:"Chão, espeto, parede, tudo no mesmo fôlego."},
     {x:290,say:"Pode ser real, pode não ser. Já devias estar habituado à dúvida."},
     {x:420,say:"Parede, a última do nível. Rápida."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.",
  build:a=>{
    a.objs.push(dartGun(4,7,1,60,0));
    a.objs.push(dartGun(9,7,-1,60,20));
    a.objs.push(dartGun(14,7,1,60,40));
    return [
     {x:20,say:"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7,12,13])],
  win:"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.",
  build:a=>{
    a.objs.push(movePlat(12,10,2,{ax:64,speed:.055,phase:5}));
    a.objs.push(timedGate(16,8,2,34,34,0));
    return [
     {x:20,say:"Mais um buraco. Plataforma rápida a seguir."},
     {x:200,say:"Apanha-a."},
     {x:420,say:"E a última parede antes do que vem a seguir. Sente que estamos quase lá."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[8,"^"],[14,"^"],[19,"D"]]),floorStr()],
  win:"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.",
  build:a=>{
    a.spike(8).lie=true;a.spike(14).lie=false;
    return [
     {x:20,say:"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez."},
     {x:420,say:"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois."}
    ];
  }}
);

LEVELS.push(
 /* ---- Fase M (116-120): Final Verdadeiro -- tudo o que resta e a verdade, e o fim ---- */
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[18,"D"]]),floorStr([6,7])],
  win:"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.objs.push(timedGate(12,8,2,34,34,0));
    return [
     {x:20,say:"Chão a tremer, pela última vez neste tom."},
     {x:280,say:"Espera a parede. A seguir já não há mais pausas como esta."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.",
  build:a=>{
    a.objs.push(dartGun(5,7,-1,60,0));
    const hs=hiddenSpike(11);hs.lie=false;a.objs.push(hs);
    a.objs.push(dartGun(16,7,1,60,20));
    return [
     {x:20,say:"Fica no chão. Isto já devia ser automático para ti."},
     {x:260,act:()=>pop(hs)},
     {x:270,say:"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma."}
    ];
  }},
 {map:[E,E,E,E,E,rowStr([[16,"D"]]),rowStr([[14,"#"],[15,"#"],[16,"#"],[17,"#"],[18,"#"],[19,"#"]]),E,E,rowStr([[1,"S"],[8,"^"]]),floorStr([3,4])],
  win:"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.",
  build:a=>{
    a.spike(8).lie=false;
    a.objs.push(bouncePad(11,true));
    return [
     {x:20,say:"Esse buraco é real, mas é o mais pequeno dos teus problemas agora."},
     {x:280,say:"Esse espeto também é real."},
     {x:400,say:"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[12,"^"],[18,"D"]]),floorStr([6,7])],
  win:"Dezanove. Só falta um. Nem sei como isto deveria soar.",
  build:a=>{
    a.objs.push(crumble(6,2));
    a.spike(12).lie=false;
    a.objs.push(timedGate(15,8,2,32,32,0));
    return [
     {x:20,say:"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto."},
     {x:290,say:"Real. Sem surpresas, não hoje."},
     {x:420,say:"Espera a parede. É a última vez que te peço isso."}
    ];
  }},
 {map:[E,E,E,E,E,E,E,E,E,rowStr([[1,"S"],[19,"D"]]),floorStr()],
  win:"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.",
  build:a=>{
    return [
     {x:20,say:"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido."},
     {x:40,say:"Só queria caminhar contigo até ao fim, desta vez sem testar nada."},
     {x:260,say:"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia."},
     {x:420,say:"A porta aqui à frente não é um truque. É só a porta. Vai."}
    ];
  }}
);

/* ---------- Gerador de níveis (Diário / Infinito) ---------- */
function mulberry32(a){
  return function(){
    a|=0;a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a);
    t=t+Math.imul(t^t>>>7,61|t)^t;
    return((t^t>>>14)>>>0)/4294967296;
  };
}
function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
const PROC_INTRO=["Mais um. Vamos a isto.","Sabes bem como isto funciona a esta altura.","Nem vou fingir que isto é fácil.","Este é só mais um. Ou não."];
const PROC_LIE_SAFE=["Aquele espeto ali é só para enfeite.","Podes passar por cima sem problema.","Esse és capaz de ignorar."];
const PROC_TRUE_WARN=["Esse aí é real. Cuidado.","Salta esse. A sério desta vez.","Esse vai doer se lhe tocares."];
const PROC_GAP_LIE=["O buraco tem chão. Confia.","Podes andar por cima sem saltar."];
const PROC_GAP_TRUE=["Esse buraco é real. Salta-o."];
const PROC_WIN=["Mais um para a conta.","Continuas vivo. Por agora.","Vamos ver quanto tempo aguentas.","Nada mau."];
function genLevel(rng,diff){
  const hazards=Math.min(5,1+Math.floor(diff/2));
  const useCeiling=diff>=6&&rng()<0.6;
  const pool=[];for(let c=5;c<=17;c++)pool.push(c);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const used=[];
  function takeCol(minGap){
    for(let i=0;i<pool.length;i++){
      const c=pool[i];
      if(used.every(u=>Math.abs(u-c)>=minGap)){used.push(c);pool.splice(i,1);return c;}
    }
    const c=pool.length?pool.pop():(10+used.length);used.push(c);return c;
  }
  const nVisible=Math.max(1,hazards-1);
  const spikeCols=[];for(let i=0;i<nVisible;i++)spikeCols.push(takeCol(2));
  const gapCount=diff<2?0:diff<6?1:2;
  const gapCols=[];for(let i=0;i<gapCount;i++)gapCols.push(takeCol(3));
  const hiddenCol=(diff>=3&&rng()<0.7)?takeCol(2):null;
  const fallCol=useCeiling?takeCol(2):null;
  const spikeInfo=spikeCols.map((c,i)=>{
    const real=i===spikeCols.length-1||rng()<0.55+diff*0.03;
    const lieFlavor=real?rng()<0.3:true;
    return {c,real,lieFlavor};
  });
  const gapInfo=gapCols.map(c=>({c,safe:rng()<0.35}));
  const introLine=pick(rng,PROC_INTRO);
  const spikeLines=spikeInfo.map(si=>pick(rng,si.real?(si.lieFlavor?PROC_LIE_SAFE:PROC_TRUE_WARN):PROC_LIE_SAFE));
  const gapLines=gapInfo.map(gi=>pick(rng,gi.safe?PROC_GAP_LIE:PROC_GAP_TRUE));
  const winLine=pick(rng,PROC_WIN);
  const items=[[1,"S"],[18,"D"]];
  for(const si of spikeInfo)items.push([si.c,"^"]);
  const row0=useCeiling?CEIL:E;
  const map=[row0,E,E,E,E,E,E,E,E,rowStr(items),floorStr(gapInfo.map(g=>g.c))];
  function build(a){
    const beats=[{x:30,say:introLine}];
    spikeInfo.forEach((si,i)=>{
      const sp=a.spike(si.c);
      if(!si.real)sp.on=false;
      sp.lie=si.lieFlavor;
      beats.push({x:si.c*32-70,say:spikeLines[i]});
    });
    gapInfo.forEach((gi,i)=>{
      if(gi.safe)a.objs.push(invisPlat(gi.c,1));
      beats.push({x:gi.c*32-80,say:gapLines[i]});
    });
    if(hiddenCol!=null){
      const sp=hiddenSpike(hiddenCol);sp.lie=true;a.objs.push(sp);
      beats.push({x:hiddenCol*32-60,act:()=>pop(sp)});
    }
    if(fallCol!=null)a.objs.push(fallSpike(fallCol));
    beats.sort((x,y)=>x.x-y.x);
    return beats;
  }
  return {map,win:winLine,build};
}
function todayStr(){
  const d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function dateSeed(s){
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}

/* ---------- Estado ---------- */
let gf=0,lv=0,att=1,deaths=0,lieDeaths=0,st="title",timer=0,shake=0,invert=0;
let mode="campaign",curGen=null,ecLevel=1;
let shield=false,adPlaying=0,invuln=0;
let gems=store.get("nm_gems",0);
let skin=store.get("nm_skin","shadow");
let skinsOwned=store.get("nm_skins_owned",["shadow"]);
if(!skinsOwned.includes("shadow"))skinsOwned.push("shadow");
let noAds=store.get("nm_no_ads",false);
let adReward=true;
let S=[],objs=[],beats=[],p=null,particles=[],darts=[];
const narr={t:"",t0:0};
const inp={l:false,r:false};
let jumpBuf=0;

function sayIt(t){narr.t=t;narr.t0=gf;speak(t);if(/!$/.test(t))shake=5;}
function phaseOf(l){return l<4?0:l<8?1:l<14?2:l<20?3:l<26?4:l<30?5:l<40?6:l<55?7:l<70?8:l<85?9:l<100?10:l<115?11:12;}
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
    l:["Até no fim, não resisti.","Última mentira, prometo. Ou não.","Faltava mesmo esta."]},
 6:{t:["Ainda aqui. A sério?","Pensei que tinhas parado no \"fim\".","Isto nem devia continuar, mas cá estás."],
    l:["Nem eu sabia que isto ia continuar a mentir.","Desculpa, hábito antigo.","Pensei que já tinhas aprendido a não confiar em mim."]},
 7:{t:["Essa doeu-me a ver, sinceramente.","Nem tudo é sobre mentiras. Às vezes é só física.","Volta lá. Eu espero."],
    l:["Desculpa. Essa fui mesmo eu.","Confesso: inventei essa parte.","Estou a tentar parar de mentir. A tentar."]},
 8:{t:["Nem eu sei porque te avisei a sério desta vez.","Talvez a culpa seja minha. Ou tua. Já não distingo.","Olha para isto como eu olho: sem certezas."],
    l:["Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.","Às vezes minto só para ver se ainda reages.","Quem mente mais, eu ou a tua memória do que eu disse?"]},
 9:{t:["Desculpa. Eu devia era calar-me.","Estou a piorar isto, não estou?","Já nem sei se te estou a ajudar ou a atrapalhar."],
    l:["Eu sei, eu sei. Mais uma mentira minha.","Estou a desmoronar-me e a levar-te comigo.","Perdão. A sério desta vez."]},
 10:{t:["Disse a verdade. Não acreditaste. Justo.","Vou continuar a tentar, mesmo sem acreditares em mim.","Essa doeu mais a mim do que a ti, garanto."],
    l:["Não. Essa não foi mentira. Juro que não.","Começo a perceber porque já não confias em mim.","Estou a tentar. A sério que estou."]},
 11:{t:["Tudo outra vez, mais rápido, mais apertado.","Já vimos isto. E ainda assim.","Sem tempo para explicações desta vez."],
    l:["Nem sei já quantas vezes te menti hoje.","O círculo fecha-se. A mentira também.","Desta vez nem eu sabia que ia mentir."]},
 12:{t:["Já não há mentiras para esconder isto.","Isto é real. Como tudo agora.","Falta pouco. Aguenta."],
    l:["Nem no fim resisto. Desculpa.","Última mentira. Prometo, desta vez prometo a sério.","Isto já não é um jogo para mim. Acho que nunca foi."]}
};
function deathLine(lie){
  const pool=mode==="campaign"?DEATH[phaseOf(lv)]:DEATH[4],arr=lie?pool.l:pool.t;
  return arr[Math.floor(Math.random()*arr.length)];
}
function currentLevel(){return mode==="campaign"?LEVELS[lv]:curGen;}
function load(){
  const L=currentLevel(),m=parse(L.map);
  S=m.statics;objs=m.objs;
  const a={att,objs,
    spike:tx=>objs.find(o=>o.k==="spike"&&o.dir==="up"&&Math.round(o.x/T)===tx),
    fake:()=>objs.find(o=>o.k==="fake")};
  beats=L.build(a).map(b=>Object.assign({done:false},b));
  p=newActor(m.spawn);particles=[];darts=[];st="play";jumpBuf=0;invert=0;invuln=0;
}
function startLevel(n){mode="campaign";lv=n;att=1;load();store.set("nm_lv",lv);}
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
  if(mode==="campaign"){
    const key="nm_best_"+lv,prevBest=store.get(key,null);
    let extra="";
    if(prevBest===null)store.set(key,att);
    else if(att<prevBest){store.set(key,att);extra=" Novo recorde pessoal neste nível!";}
    sayIt(LEVELS[lv].win+extra);
  }else{
    sayIt(currentLevel().win);
  }
  beep(523,.12,"square",.05);setTimeout(()=>beep(784,.2,"square",.05),110);
}
function nextLevel(){
  if(mode==="campaign"){
    if(lv+1>=LEVELS.length){finish();return;}
    startLevel(lv+1);
    if(!noAds&&lv>0&&lv%4===0){adPlaying=150;adReward=false;}
    return;
  }
  if(mode==="daily"){completeDaily();return;}
  if(mode==="endless"){
    const best=store.get("nm_endless_best",0);
    if(ecLevel>best)store.set("nm_endless_best",ecLevel);
    ecLevel++;
    startEndlessLevel(ecLevel);
    return;
  }
}
function finish(){
  st="end";store.set("nm_lv",0);stopSpeak();
  store.set("nm_endless_unlocked",true);
  showMenu("120 Vezes",
    `Mortes: ${deaths}. Vezes que acreditaste em mim e perdeste: ${lieDeaths}.\nCento e vinte níveis, e a única mentira que nunca te disse foi a última: que valia a pena chegar aqui.\nObrigado por teres continuado a jogar enquanto eu aprendia a parar de mentir.`,
    [{t:"Jogar outra vez",main:true,f:()=>newGame()},
     {t:"📅 Desafio Diário",f:()=>{hideMenu();startDaily();}},
     {t:"♾ Modo Infinito",f:()=>startEndless()}]);
}
function newGame(){mode="campaign";deaths=0;lieDeaths=0;hideMenu();startLevel(0);}

/* ---------- Desafio Diário / Modo Infinito ---------- */
function startDaily(){
  mode="daily";
  const today=todayStr();
  curGen=genLevel(mulberry32(dateSeed("nm-daily-"+today)),4);
  deaths=0;lieDeaths=0;att=1;
  hideMenu();load();
}
function completeDaily(){
  st="end";stopSpeak();
  const today=todayStr();
  const already=store.get("nm_daily_last",null);
  let streak=store.get("nm_daily_streak",0),gained=0;
  if(already!==today){
    const y=new Date();y.setDate(y.getDate()-1);
    const yesterday=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");
    streak=(already===yesterday)?streak+1:1;
    store.set("nm_daily_streak",streak);store.set("nm_daily_last",today);
    gained=10+Math.min(20,streak*2);
    gems+=gained;store.set("nm_gems",gems);
  }
  showMenu("Desafio Diário",
    gained>0
      ?`Concluído! Sequência: ${streak} dia(s).\n+${gained} gemas.\nVolta amanhã para continuar a sequência.`
      :`Já tinhas feito o desafio de hoje.\nSequência atual: ${streak} dia(s).\nVolta amanhã.`,
    [{t:"Menu",main:true,f:()=>titleMenu()}]);
}
function startEndless(){
  mode="endless";ecLevel=1;deaths=0;lieDeaths=0;
  hideMenu();
  startEndlessLevel(ecLevel);
}
function startEndlessLevel(n){
  const diff=Math.min(12,n-1);
  curGen=genLevel(mulberry32(((Date.now()^(n*2654435761))>>>0)^Math.floor(Math.random()*1e9)),diff);
  att=1;load();
}
function endlessGameOver(){
  st="end";stopSpeak();
  const best=store.get("nm_endless_best",0);
  if(ecLevel>best)store.set("nm_endless_best",ecLevel);
  showMenu("Modo Infinito — Fim",
    `Chegaste ao nível ${ecLevel}.\nRecorde: ${Math.max(ecLevel,best)}.`,
    [{t:"Tentar outra vez",main:true,f:()=>startEndless()},
     {t:"Menu",f:()=>titleMenu()}]);
}

/* ---------- Passo ---------- */
function step(){
  gf++;
  if(adPlaying>0){
    adPlaying--;
    if(adPlaying===0){
      if(adReward){
        shield=true;
        const g=8+Math.floor(Math.random()*8);gems+=g;store.set("nm_gems",gems);
        sayIt(`Anúncio visto. +${g} gemas e um escudo. De nada.`);
      }
      adReward=true;
    }
    return;
  }
  if(jumpBuf>0)jumpBuf--;
  if(invuln>0)invuln--;
  if(shake>0)shake--;
  for(const q of particles){q.x+=q.vx;q.y+=q.vy;q.vy+=.25;q.life--;}
  particles=particles.filter(q=>q.life>0);
  if(st==="dead"){
    if(--timer<=0){
      if(mode==="endless")endlessGameOver();else load();
    }
    return;
  }
  if(st==="win"){if(--timer<=0)nextLevel();return;}
  if(st!=="play")return;

  const dir=(inp.r?1:0)-(inp.l?1:0);
  const eff=invert>0?-dir:dir;
  if(invert>0)invert--;
  const Sd=S.concat(objs.filter(o=>(o.k==="block"||o.k==="crumble"||o.k==="moveplat"||o.k==="timedgate"||o.k==="bounce")&&o.on));
  const carry=p.onGround?objs.find(o=>o.k==="moveplat"&&o.on&&Math.abs(p.y+p.h-o.y)<3&&p.x+p.w>o.x&&p.x<o.x+o.w):null;
  const j=moveActor(p,Sd,eff,jumpBuf>0);
  if(j){jumpBuf=0;beep(340,.1,"square",.03,620);}
  if(p.onGround&&Math.abs(p.vx)>.3&&gf%6===0){
    particles.push({x:p.x+p.w/2,y:p.y+p.h-2,vx:-p.vx*.3+(Math.random()-.5),vy:-.4-Math.random()*.4,life:14+Math.random()*10,dust:true});
  }

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
    if(o.k==="crumble"){
      if(o.state==="idle"){
        if(p.onGround&&Math.abs(p.y+p.h-o.y)<.5&&p.x+p.w>o.x&&p.x<o.x+o.w){o.state="shake";o.timer=26;}
      }else if(o.state==="shake"){
        if(--o.timer<=0){o.state="gone";o.timer=70;o.on=false;shake=Math.max(shake,3);beep(110,.18,"sawtooth",.05,40);}
      }else if(o.state==="gone"){
        if(--o.timer<=0){o.state="idle";o.on=true;}
      }
    }
    if(o.k==="moveplat"){
      const nx=o.baseX+Math.sin((gf+o.phase)*o.speed)*o.ax;
      const ny=o.baseY+Math.sin((gf+o.phase)*o.speed)*o.ay;
      if(carry===o){p.x+=nx-o.x;p.y+=ny-o.y;}
      o.x=nx;o.y=ny;
    }
    if(o.k==="timedgate"){
      const cyc=o.onDur+o.offDur;
      o.on=((gf+o.phase)%cyc)<o.onDur;
    }
    if(o.k==="dartgun"){
      if((gf+o.phase)%o.interval===0){
        darts.push({x:o.dir>0?o.x+o.w:o.x-10,y:o.y+o.h/2-3,w:10,h:6,vx:o.dir*4});
        beep(300,.06,"square",.03,200);
      }
    }
  }
  for(const o of objs){
    if(!o.on)continue;
    if((o.k==="spike"||o.k==="fake")&&hit(p,hurt(o))){die(o);return;}
    if(o.k==="door"&&hit(p,o)){win();return;}
    if(o.k==="bounce"&&p.onGround&&p.vy>=0&&Math.abs(p.y+p.h-o.y)<4&&p.x+p.w>o.x&&p.x<o.x+o.w){
      if(o.real){p.vy=-(JUMP*1.7);p.coyote=0;p.onGround=false;jumpBuf=0;beep(520,.15,"square",.06,920);}
      else{beep(140,.1,"triangle",.03);}
    }
  }
  for(const d of darts){d.x+=d.vx;}
  darts=darts.filter(d=>d.x>-24&&d.x<W+24);
  for(const d of darts){
    if(hit(p,{x:d.x,y:d.y,w:d.w,h:d.h})){die(null);return;}
  }
  if(p.y>H+60)die(null);
}

/* ---------- Desenho ---------- */
/* ---------- Tema visual por arco (profundidade/atmosfera) ---------- */
function themeFor(l){
  if(mode!=="campaign")l=2;
  if(l<8)return{bg0:"#1d1a3d",bg1:"#0f0d20",tile:"#3a3766",top:"#8f8bd2",hill:"169,139,255"};
  if(l<20)return{bg0:"#1b1836",bg1:"#0c0a1a",tile:"#363359",top:"#7f7bc2",hill:"150,130,220"};
  if(l<30)return{bg0:"#241a30",bg1:"#160f20",tile:"#453155",top:"#b05fa0",hill:"200,100,170"};
  if(l<40)return{bg0:"#122a33",bg1:"#081820",tile:"#1f4a52",top:"#5ee0c8",hill:"94,224,200"};
  if(l<70)return{bg0:"#2a2015",bg1:"#1a1208",tile:"#4a3a20",top:"#d9a860",hill:"220,170,90"};
  if(l<85)return{bg0:"#330d10",bg1:"#1a0608",tile:"#5a1f22",top:"#ff6b6b",hill:"255,90,90"};
  if(l<115)return{bg0:"#0d2230",bg1:"#061218",tile:"#1f3f55",top:"#5ba8d9",hill:"90,170,230"};
  return{bg0:"#2b2410",bg1:"#1a1608",tile:"#55481f",top:"#ffd868",hill:"255,220,120"};
}
let curTheme=themeFor(0);
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
  ctx.fillStyle=`rgba(${curTheme.hill},.07)`;
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
function drawMotes(){
  ctx.fillStyle=`rgba(${curTheme.hill},.16)`;
  for(let i=0;i<14;i++){
    const seed=i*53.7;
    const x=(seed*7+gf*0.15)%(W+20)-10;
    const y=((Math.sin(seed+gf*0.012)+1)/2)*(H-20)+10;
    ctx.beginPath();ctx.arc(x,y,1.3,0,6.3);ctx.fill();
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
/* ---------- Personagens (skins) ---------- */
const SKINS=[
 {id:"shadow",name:"Encapuzado das Sombras",price:0,body:P.ink,cape:P.violet,head:"#d8cdfa",eye:"#15132b",accessory:"none"},
 {id:"armor",name:"Armadura-Génio",price:60,body:"#e6482f",cape:"#7a2015",head:"#c9372a",eye:"#ffe9a8",accessory:"chestlight"},
 {id:"spider",name:"Aranha das Vielas",price:60,body:"#b3233a",cape:"#1c2b6b",head:"#1c2b6b",eye:"#ffffff",accessory:"web"},
 {id:"craque10",name:"Craque Nº10",price:40,body:"#1f8a4c",cape:"#f5d90a",head:"#1f8a4c",eye:"#15132b",accessory:"number10"},
 {id:"craque7",name:"Craque Nº7",price:40,body:"#d22630",cape:"#151515",head:"#d22630",eye:"#15132b",accessory:"number7"},
 {id:"craque11",name:"Craque Nº11",price:40,body:"#1c4fa0",cape:"#ffffff",head:"#1c4fa0",eye:"#15132b",accessory:"number11"},
 {id:"mic",name:"Lenda do Microfone",price:80,body:"#1a1a1a",cape:"#caa23d",head:"#1a1a1a",eye:"#15132b",accessory:"shades"},
 {id:"ritmo",name:"Rei do Ritmo",price:80,body:"#2e7d32",cape:"#6a1b9a",head:"#6a1b9a",eye:"#15132b",accessory:"durag"},
 {id:"magnata",name:"Magnata",price:100,body:"#1b1b2e",cape:"#b8a14a",head:"#1b1b2e",eye:"#15132b",accessory:"tie"},
 {id:"visionario",name:"Visionário",price:100,body:"#161616",cape:"#444444",head:"#161616",eye:"#15132b",accessory:"none"},
 {id:"mumia",name:"Múmia",price:50,body:"#d8cdb0",cape:"#c2b48c",head:"#d8cdb0",eye:"#2a2010",accessory:"wraps"},
 {id:"fantasma",name:"Fantasma",price:50,body:"rgba(235,240,255,.75)",cape:"rgba(235,240,255,.55)",head:"rgba(235,240,255,.75)",eye:"#15132b",accessory:"ghost"},
 {id:"astronauta",name:"Astronauta",price:90,body:"#e8e8e8",cape:"#9aa0a6",head:"#cfd8dc",eye:"#111111",accessory:"helmet"},
 {id:"militar",name:"Militar",price:70,body:"#4b5320",cape:"#39421c",head:"#4b5320",eye:"#15132b",accessory:"helmet2"},
 {id:"hacker",name:"Hacker",price:70,body:"#1a1a1a",cape:"#1a1a1a",head:"#1a1a1a",eye:"#39ff14",accessory:"glow"},
 {id:"canalizador",name:"Canalizador",price:45,body:"#1f4fa0",cape:"#8a3b12",head:"#d8a35c",eye:"#15132b",accessory:"capmustache"},
 {id:"pedreiro",name:"Pedreiro",price:45,body:"#e08b2e",cape:"#444444",head:"#f2c84b",eye:"#15132b",accessory:"hardhat"}
];
function getSkin(){return SKINS.find(s=>s.id===skin)||SKINS[0];}
function drawAccessory(acc,cx,by,bh,bw,bx,gy,f){
  switch(acc){
    case"chestlight":
      ctx.fillStyle="#ffe9a8";ctx.beginPath();ctx.arc(cx,by+bh*.55,3,0,6.3);ctx.fill();
      ctx.fillStyle="#2a2750";ctx.fillRect(cx-bw*.3,by-2,bw*.14,3);ctx.fillRect(cx+bw*.16,by-2,bw*.14,3);
      break;
    case"web":
      ctx.strokeStyle="rgba(255,255,255,.55)";ctx.lineWidth=1;
      for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(cx+f*bw*.08,by+bh*.18);ctx.lineTo(cx+f*bw*.08+i*4,by+bh*.18+6);ctx.stroke();}
      break;
    case"number10":case"number7":case"number11":{
      const n=acc==="number10"?"10":acc==="number7"?"7":"11";
      ctx.font="bold 9px sans-serif";ctx.fillStyle="rgba(255,255,255,.9)";ctx.textAlign="center";
      ctx.fillText(n,cx,gy-bh*.35);
      break;}
    case"shades":
      ctx.fillStyle="#111";ctx.fillRect(cx+f*bw*.06,by+bh*.17,bw*.34,bh*.09);
      ctx.fillStyle="#caa23d";ctx.beginPath();ctx.arc(cx,by+bh*.6,2.5,0,6.3);ctx.fill();
      break;
    case"durag":
      ctx.fillStyle="#6a1b9a";ctx.beginPath();
      ctx.moveTo(cx+f*bw*.4,by+bh*.1);ctx.lineTo(cx+f*bw*.55,by+bh*.35);ctx.lineTo(cx+f*bw*.3,by+bh*.4);
      ctx.closePath();ctx.fill();
      break;
    case"tie":
      ctx.fillStyle="#b3222f";ctx.beginPath();
      ctx.moveTo(cx-2,by+bh*.4);ctx.lineTo(cx+2,by+bh*.4);ctx.lineTo(cx+4,gy-bh*.1);ctx.lineTo(cx,gy);ctx.lineTo(cx-4,gy-bh*.1);
      ctx.closePath();ctx.fill();
      break;
    case"wraps":
      ctx.strokeStyle="rgba(120,105,75,.6)";ctx.lineWidth=2;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(bx,by+bh*(.3+i*.22));ctx.lineTo(bx+bw,by+bh*(.18+i*.22));ctx.stroke();}
      break;
    case"helmet":
      ctx.fillStyle="rgba(20,20,30,.5)";ctx.beginPath();ctx.ellipse(cx+f*bw*.08,by+bh*.18,bw*.3,bh*.2,0,0,6.3);ctx.fill();
      break;
    case"helmet2":
      ctx.fillStyle="#39421c";ctx.beginPath();ctx.ellipse(cx+f*bw*.08,by+bh*.06,bw*.46,bh*.16,0,3.4,6.1);ctx.fill();
      break;
    case"glow":
      ctx.fillStyle="rgba(57,255,20,.5)";ctx.beginPath();ctx.arc(cx-f*bw*.3,gy-4,3,0,6.3);ctx.fill();
      break;
    case"capmustache":
      ctx.fillStyle="#1f4fa0";ctx.beginPath();ctx.ellipse(cx+f*bw*.08,by+bh*.04,bw*.44,bh*.14,0,3.3,6.2);ctx.fill();
      ctx.fillStyle="#3a2a1a";ctx.fillRect(cx+f*bw*.18,by+bh*.3,5,2);
      break;
    case"hardhat":
      ctx.fillStyle="#f2c84b";ctx.beginPath();ctx.ellipse(cx+f*bw*.08,by+bh*.08,bw*.46,bh*.18,0,3.3,6.2);ctx.fill();
      ctx.fillRect(bx-1,by+bh*.12,bw+2,2);
      break;
    default: break;
  }
}
function drawHero(a){
  const sk=getSkin(),isGhost=sk.accessory==="ghost";
  const cx=a.x+a.w/2,gy=a.y+a.h,f=a.f;
  const sq=Math.max(-.35,Math.min(.35,a.vy/16));
  const bw=a.w*(1+sq*.5),bh=a.h*(1-sq*.5),bx=cx-bw/2,by=gy-bh;
  // capa
  if(!isGhost){
    ctx.fillStyle=sk.cape;
    ctx.beginPath();
    ctx.moveTo(cx-f*bw*.35,by+bh*.3);
    ctx.quadraticCurveTo(cx-f*(bw*.9+Math.abs(a.vx)*1.6),by+bh*.55,cx-f*bw*.15,gy-1);
    ctx.lineTo(cx-f*bw*.05,by+bh*.55);
    ctx.closePath();ctx.fill();
  }
  // pernas (só quando no chão e a mexer; o fantasma não tem pernas)
  if(a.onGround&&!isGhost){
    const step=Math.sin(gf/5)*4*(Math.abs(a.vx)>.2?1:0);
    ctx.fillStyle="#2a2750";
    ctx.fillRect(bx+bw*.2,gy-6,5,6+step);
    ctx.fillRect(bx+bw*.6,gy-6,5,6-step);
  }
  // corpo
  const r=Math.min(bw,bh)*.32;
  ctx.fillStyle=sk.body;
  ctx.beginPath();
  if(isGhost){
    ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);ctx.arcTo(bx+bw,by,bx+bw,by+r,r);
    ctx.lineTo(bx+bw,gy-8);
    ctx.quadraticCurveTo(bx+bw*.75,gy+4,bx+bw*.5,gy-6);
    ctx.quadraticCurveTo(bx+bw*.25,gy+4,bx,gy-8);
    ctx.lineTo(bx,by+r);ctx.arcTo(bx,by,bx+r,by,r);
  }else{
    ctx.moveTo(bx+r,by);ctx.lineTo(bx+bw-r,by);ctx.arcTo(bx+bw,by,bx+bw,by+r,r);
    ctx.lineTo(bx+bw,gy-r);ctx.arcTo(bx+bw,gy,bx+bw-r,gy,r);
    ctx.lineTo(bx+r,gy);ctx.arcTo(bx,gy,bx,gy-r,r);
    ctx.lineTo(bx,by+r);ctx.arcTo(bx,by,bx+r,by,r);
  }
  ctx.closePath();ctx.fill();
  // capuz / cabeça
  ctx.fillStyle=sk.head;
  ctx.beginPath();ctx.ellipse(cx+f*bw*.08,by+bh*.18,bw*.42,bh*.28,0,0,6.3);ctx.fill();
  // olho
  ctx.fillStyle=sk.eye;
  ctx.beginPath();ctx.ellipse(cx+f*bw*.3,by+bh*.22,2.6,3.4,0,0,6.3);ctx.fill();
  // brilho do olho
  ctx.fillStyle="rgba(255,255,255,.8)";
  ctx.beginPath();ctx.ellipse(cx+f*bw*.3+1,by+bh*.19,.9,1,0,0,6.3);ctx.fill();
  // acessório da personagem
  if(sk.accessory!=="none"&&sk.accessory!=="ghost")drawAccessory(sk.accessory,cx,by,bh,bw,bx,gy,f);
}
function drawDoor(o){
  const w=o.w,x=o.x,y=o.y;
  const pulse=.5+.5*Math.sin(gf/14);
  ctx.save();
  ctx.shadowColor=P.door;ctx.shadowBlur=5+pulse*9;
  ctx.fillStyle=P.doorD;ctx.fillRect(x-2,y+6,w+4,o.h-6);
  ctx.beginPath();ctx.arc(x+w/2,y+8,w/2+2,Math.PI,0);ctx.fill();
  ctx.fillStyle=P.door;ctx.fillRect(x,y+8,w,o.h-8);
  ctx.beginPath();ctx.arc(x+w/2,y+8,w/2,Math.PI,0);ctx.fill();
  ctx.fillStyle=P.doorD;ctx.beginPath();ctx.arc(x+w-6,y+o.h/2+4,2.5,0,7);ctx.fill();
  ctx.restore();
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
  const age=gf-t0,intro=Math.min(1,age/8),offY=(1-intro)*-10;
  ctx.save();
  ctx.globalAlpha=intro;
  ctx.fillStyle="rgba(10,8,24,.92)";ctx.fillRect(bx,by+offY,bw,bh);
  ctx.fillStyle=P.violet;ctx.fillRect(bx,by+offY,5,bh);
  ctx.strokeStyle="rgba(169,139,255,.5)";ctx.lineWidth=1.5;ctx.strokeRect(bx,by+offY,bw,bh);
  let left=Math.floor(age/.8);
  lines.forEach((ln,i)=>{
    txt(ln.slice(0,Math.max(0,left)),bx+18,by+offY+19+i*22,16,P.ink,"left","bold");
    left-=ln.length+1;
  });
  ctx.restore();
}
function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  curTheme=themeFor(lv);
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,curTheme.bg0);bg.addColorStop(1,curTheme.bg1);
  P.tile=curTheme.tile;P.top=curTheme.top;
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  if(st==="title"||st==="end")return;
  if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  drawHills();
  drawMotes();
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
    if(o.k==="crumble"){
      if(o.state==="gone")continue;
      if(o.state==="shake"&&(gf%6<3)){ctx.globalAlpha=.5;drawTile(o.x,o.y,o.w,o.h);ctx.globalAlpha=1;}
      else drawTile(o.x,o.y,o.w,o.h);
      continue;
    }
    if(o.k==="moveplat"){drawTile(o.x,o.y,o.w,o.h);continue;}
    if(o.k==="timedgate"){
      if(o.on)drawTile(o.x,o.y,o.w,o.h);
      else{ctx.strokeStyle="rgba(169,139,255,.4)";ctx.lineWidth=1.5;ctx.strokeRect(o.x+1,o.y+1,o.w-2,o.h-2);}
      continue;
    }
    if(o.k==="bounce"){
      ctx.fillStyle=o.real?P.teal:"#5a5480";
      ctx.fillRect(o.x+3,o.y+o.h-10,o.w-6,10);
      ctx.fillStyle=P.ink;ctx.fillRect(o.x+5,o.y+o.h-14,o.w-10,5);
      continue;
    }
    if(o.k==="dartgun"){
      ctx.fillStyle=P.muted;ctx.fillRect(o.x,o.y+o.h*.3,o.w,o.h*.4);
      continue;
    }
    if(!o.vis)continue;
    if(o.k==="spike")drawSpike(o);else drawDoor(o);
  }
  ctx.fillStyle=P.spike;
  for(const d of darts){ctx.fillRect(d.x,d.y,d.w,d.h);}
  if(st!=="dead"&&!(invuln>0&&(gf%6<3)))drawHero(p);
  if(shield&&st!=="dead"){
    ctx.strokeStyle="rgba(94,224,200,.7)";ctx.lineWidth=2;
    ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h/2,p.w*.9,p.h*.7,0,0,6.3);ctx.stroke();
  }
  for(const q of particles){
    if(q.dust){ctx.fillStyle=`rgba(255,255,255,${Math.max(0,Math.min(.5,q.life/30))})`;ctx.fillRect(q.x,q.y,2,2);}
    else{ctx.fillStyle=P.ink;ctx.fillRect(q.x,q.y,4,4);}
  }
  ctx.setTransform(1,0,0,1,0,0);
  if(mode==="campaign")txt(`${lv+1}/${LEVELS.length}`,W-12,14,14,P.muted,"right","normal");
  else if(mode==="daily")txt("Desafio Diário",W-12,14,14,P.muted,"right","normal");
  else if(mode==="endless")txt(`Infinito · nível ${ecLevel}`,W-12,14,14,P.muted,"right","normal");
  txt(`mortes ${deaths}`,W-12,32,12,P.muted,"right","normal");
  txt(`💎 ${gems}`,12,14,14,P.door,"left","normal");
  if(shield)txt("🛡 escudo pronto",12,32,12,P.teal,"left","normal");
  if(invert>0)txt("↔ controlos trocados",W/2,H-26,13,P.door);
  if(narr.t&&gf-narr.t0<360)bubble(narr.t,narr.t0);
  if(st==="dead"){
    const tpulse=Math.max(0,timer)/75;
    ctx.fillStyle=`rgba(255,77,94,${(0.26*tpulse).toFixed(3)})`;
    ctx.fillRect(0,0,W,H);
  }
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
  mode="campaign";st="title";stopSpeak();inp.l=inp.r=false;
  const saved=Math.min(LEVELS.length-1,store.get("nm_lv",0)||0);
  const btns=[];
  if(saved>0){
    btns.push({t:`Continuar (nível ${saved+1} de ${LEVELS.length})`,main:true,f:()=>{hideMenu();startLevel(saved);}});
    btns.push({t:"Novo jogo",f:()=>newGame()});
  }else btns.push({t:"Jogar",main:true,f:()=>newGame()});

  const today=todayStr();
  const doneToday=store.get("nm_daily_last",null)===today;
  const streak=store.get("nm_daily_streak",0);
  btns.push({t:doneToday?`📅 Desafio Diário (feito hoje · sequência ${streak})`:`📅 Desafio Diário${streak>0?` (sequência ${streak})`:""}`,f:()=>startDaily()});

  if(store.get("nm_endless_unlocked",false)){
    const endlessBest=store.get("nm_endless_best",0);
    btns.push({t:`♾ Modo Infinito${endlessBest>0?` (recorde ${endlessBest})`:""}`,f:()=>startEndless()});
  }

  btns.push({t:`Voz do narrador: ${voiceOn?"ligada":"desligada"}`,f:()=>{toggleVoice();titleMenu();}});
  btns.push({t:`🧍 Personagens (${getSkin().name})`,f:()=>openSkins()});
  btns.push({t:`🛍 Loja (💎 ${gems})`,f:()=>openShop()});
  showMenu("O Narrador Mente","O narrador guia-te até à porta de cada nível. Confia nele. Ou não.",btns);
}
function openShop(){
  const btns=[];
  if(noAds)btns.push({t:"✓ Anúncios removidos. Obrigado.",main:true,f:()=>openShop()});
  else btns.push({t:"💳 Remover anúncios (pagamento único)",main:true,f:()=>buyRealNoAds()});
  btns.push({t:"🔄 Restaurar compras",f:()=>restorePurchases()});
  btns.push({t:"Voltar",f:()=>titleMenu()});
  showMenu("Loja",`Tens 💎 ${gems} gemas, ganhas a ver anúncios.\n\nAs personagens compram-se com gemas em 🧍 Personagens, no menu principal, ou todas de uma vez aqui com dinheiro real.`,btns);
}
function openSkins(){
  const btns=[];
  const allOwned=SKINS.every(s=>skinsOwned.includes(s.id));
  if(!allOwned)btns.push({t:"💳 Desbloquear todas — pagamento único",f:()=>buyRealAllSkins()});
  SKINS.forEach(s=>{
    const owned=skinsOwned.includes(s.id),equipped=skin===s.id;
    if(equipped){btns.push({t:`✓ ${s.name} (equipado)`,main:true,f:()=>openSkins()});return;}
    if(owned){btns.push({t:`Equipar: ${s.name}`,f:()=>{skin=s.id;store.set("nm_skin",skin);openSkins();}});return;}
    btns.push({t:`🔒 ${s.name} — 💎 ${s.price}`,f:()=>{
      if(gems>=s.price){
        gems-=s.price;store.set("nm_gems",gems);
        skinsOwned.push(s.id);store.set("nm_skins_owned",skinsOwned);
        skin=s.id;store.set("nm_skin",skin);
      }
      openSkins();
    }});
  });
  btns.push({t:"Voltar",f:()=>titleMenu()});
  showMenu("Personagens",`💎 ${gems} gemas. Escolhe quem vais ser. Compra skins com gemas ganhas a ver anúncios, ou desbloqueia tudo de uma vez com dinheiro real.`,btns);
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

/* ---------- Compras com dinheiro real (RevenueCat) ----------
   Só funciona dentro da versão instalada pela Play Store (precisa da Play Store
   a validar o pagamento). Fora disso (ex.: APK de debug instalado por fora,
   ou a correr num browser normal) estas funções falham em segurança e mostram
   uma mensagem em vez de rebentar. */
const RC_API_KEY_ANDROID="goog_IDYOLuBqpLvoCgnhjFRRVcFNNxH";
const PROD_NO_ADS="remove_ads";
const PROD_ALL_SKINS="skins_pack_all";
function rcPlugin(){return(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Purchases)||null;}
function findPackage(offerings,productId){
  try{
    const current=offerings&&offerings.current;
    if(!current)return null;
    return current.availablePackages.find(p=>p.product&&p.product.identifier===productId)||null;
  }catch(e){return null;}
}
function applyEntitlements(info){
  if(!info||!info.entitlements)return;
  const act=info.entitlements.active||{};
  if(act.no_ads){noAds=true;store.set("nm_no_ads",true);}
  if(act.all_skins){
    SKINS.forEach(s=>{if(!skinsOwned.includes(s.id))skinsOwned.push(s.id);});
    store.set("nm_skins_owned",skinsOwned);
  }
}
async function rcInit(){
  const RC=rcPlugin();if(!RC)return;
  try{
    await RC.configure({apiKey:RC_API_KEY_ANDROID});
    const res=await RC.getCustomerInfo();
    applyEntitlements(res&&res.customerInfo);
  }catch(e){}
}
async function buyRealNoAds(){
  const RC=rcPlugin();
  if(!RC){sayIt("Compras só funcionam na versão instalada pela Play Store.");openShop();return;}
  try{
    const offerings=await RC.getOfferings();
    const pkg=findPackage(offerings,PROD_NO_ADS);
    if(!pkg){sayIt("Esse produto ainda não está configurado na loja. Tenta mais tarde.");openShop();return;}
    const res=await RC.purchasePackage({aPackage:pkg});
    applyEntitlements(res&&res.customerInfo);
  }catch(e){}
  openShop();
}
async function buyRealAllSkins(){
  const RC=rcPlugin();
  if(!RC){sayIt("Compras só funcionam na versão instalada pela Play Store.");openSkins();return;}
  try{
    const offerings=await RC.getOfferings();
    const pkg=findPackage(offerings,PROD_ALL_SKINS);
    if(!pkg){sayIt("Esse produto ainda não está configurado na loja. Tenta mais tarde.");openSkins();return;}
    const res=await RC.purchasePackage({aPackage:pkg});
    applyEntitlements(res&&res.customerInfo);
  }catch(e){}
  openSkins();
}
async function restorePurchases(){
  const RC=rcPlugin();
  if(!RC){sayIt("Nada a restaurar nesta versão.");titleMenu();return;}
  try{
    const res=await RC.restorePurchases();
    applyEntitlements(res&&res.customerInfo);
    sayIt("Compras restauradas.");
  }catch(e){}
  titleMenu();
}

/* ---------- Ciclo ---------- */
window.__nm={inp,step,setJump(v){jumpBuf=v?8:0;},
  begin(n,a){hideMenu();mode="campaign";deaths=0;lieDeaths=0;lv=n;att=a||1;load();},
  get st(){return st;},get p(){return p;},get lv(){return lv;},get att(){return att;},get lie(){return lieDeaths;},
  get objs(){return objs;},get LEVELS(){return LEVELS;},get darts(){return darts;},
  get mode(){return mode;},get ecLevel(){return ecLevel;},
  get skin(){return skin;},set skin(v){skin=v;},get SKINS(){return SKINS;},
  draw,
  startDaily,startEndless,
  get noAds(){return noAds;},get skinsOwned(){return skinsOwned;},
  buyRealNoAds,buyRealAllSkins,restorePurchases,openShop,openSkins};
titleMenu();
rcInit();
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
