(()=>{
"use strict";
const T=32,COLS=20,ROWS=11,W=COLS*T,H=ROWS*T;
const GRAV=.5,JUMP=9.5,SPEED=3;
const $=id=>document.getElementById(id);
const cv=$("c"),ctx=cv.getContext("2d");
let MX=0;
const TOP=56,LH=H+TOP;                 // faixa de cima reservada ao narrador
function fit(){
  const vw=(typeof innerWidth==="number"&&innerWidth)||W,vh=(typeof innerHeight==="number"&&innerHeight)||LH;
  const strip=Math.round(Math.min(112,Math.max(80,vh*.24)));
  try{document.documentElement.style.setProperty("--strip",strip+"px");}catch(e){}
  const availH=Math.max(120,vh-strip),ar=vw/availH,base=W/LH;
  if(ar>=base){const lw=Math.min(W*2.2,Math.round(LH*ar));MX=Math.max(0,(lw-W)/2);cv.width=Math.round(W+MX*2);cv.height=LH;cv.style.cssText="";}
  else{MX=0;cv.width=W;cv.height=LH;cv.style.cssText="inset:auto;left:0;top:0;width:100%;height:"+(vw*LH/W)+"px";}
}
fit();addEventListener("resize",fit);addEventListener("orientationchange",()=>setTimeout(fit,200));
const P={ink:"#fff4dc",tile:"#3a3766",top:"#8f8bd2",spike:"#ff4d5e",door:"#ffc247",doorD:"#b8791a",muted:"#9d98d0",violet:"#a98bff",teal:"#5ee0c8"};
const E=".".repeat(COLS);
const FONT='"Trebuchet MS","Segoe UI",system-ui,sans-serif';
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v);}catch(e){return d;}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
};

/* ---------- Idiomas (i18n) ----------
   Motor de tradução da interface. As falas do narrador dentro dos 120 níveis
   continuam em português por agora (fase seguinte do trabalho); tudo o resto
   (menus, loja, skins, HUD, mensagens de sistema) já está traduzido. */
const SUPPORTED_LANGS=["pt","en","es","fr","de","it","ru","tr","ja","ko","zh","hi","ar","id","bn","vi"];
const LANG_NAMES={pt:"Português",en:"English",es:"Español",fr:"Français",de:"Deutsch",ru:"Русский",ja:"日本語",zh:"中文",hi:"हिन्दी",ar:"العربية",id:"Indonesia",bn:"বাংলা",it:"Italiano",tr:"Türkçe",ko:"한국어",vi:"Tiếng Việt"};
function detectLang(){
  try{
    const cands=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||"en"];
    for(const c of cands){
      const code=(c||"").toLowerCase().slice(0,2);
      if(SUPPORTED_LANGS.includes(code))return code;
    }
  }catch(e){}
  return "en";
}
let lang=store.get("nm_lang",null)||detectLang();
function setLang(l){
  lang=SUPPORTED_LANGS.includes(l)?l:"en";
  store.set("nm_lang",lang);
  try{
    document.documentElement.lang=lang;
    document.documentElement.dir=(lang==="ar")?"rtl":"ltr";
  }catch(e){}
}
setLang(lang);
function t(key,vars){
  const d=STR[lang]||STR.en||STR.pt;
  let s=(d&&d[key]!=null)?d[key]:((STR.en&&STR.en[key]!=null)?STR.en[key]:((STR.pt&&STR.pt[key])||key));
  if(vars)for(const k in vars)s=s.split("{"+k+"}").join(vars[k]);
  return s;
}
function skinName(s){return (SKIN_NAMES[lang]&&SKIN_NAMES[lang][s.id])||(SKIN_NAMES.en&&SKIN_NAMES.en[s.id])||s.name;}
const STR={
 pt:{
  appTitle:"O Narrador Mente",appSubtitle:"O narrador guia-te até à porta de cada nível. Confia nele. Ou não.",
  continueBtn:"Continuar (nível {n} de {total})",newGame:"Novo jogo",play:"Jogar",
  dailyDone:"📅 Desafio Diário (feito hoje · sequência {streak})",dailyPlain:"📅 Desafio Diário",streakSuffix:" (sequência {streak})",
  endlessPlain:"♾ Modo Infinito",endlessBestSuffix:" (recorde {best})",
  voiceOn:"ligada",voiceOff:"desligada",voiceLabel:"Voz do narrador: {state}",
  charactersBtn:"🧍 Personagens ({name})",shopBtn:"🛍 Loja (💎 {gems})",langBtn:"🌐 Idioma: {name}",back:"Voltar",
  shopTitle:"Loja",shopRemoveAds:"💳 Remover anúncios (pagamento único)",shopAdsRemoved:"✓ Anúncios removidos. Obrigado.",
  shopRestore:"🔄 Restaurar compras",
  shopText:"Tens 💎 {gems} gemas, ganhas a ver anúncios.\n\nAs personagens compram-se com gemas em 🧍 Personagens, aqui na loja, ou todas de uma vez com dinheiro real.",
  skinsTitle:"Personagens",skinsUnlockAll:"💳 Desbloquear todas — pagamento único",
  skinsEquipped:"✓ {name} (equipado)",skinsEquip:"Equipar: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} gemas. Escolhe quem vais ser. Compra skins com gemas ganhas a ver anúncios, ou desbloqueia tudo de uma vez com dinheiro real.",
  langTitle:"Idioma",langText:"Escolhe o idioma do jogo.",
  optionsBtn:"⚙️ Opções",resumeGame:"Voltar ao jogo",mainMenu:"Menu principal",optionsTitle:"Opções",optionsText:"Ajusta o som e a vibração do jogo.",
  soundLabel:"🔊 Som: {state}",vibrationLabel:"📳 Vibração: {state}",narratorVoiceLabel:"🗣 Voz do narrador: {state}",
  levelsBtn:"💎 Níveis",levelsTitle:"Níveis",levelsText:"Progresso: {done}/{total}",
  tabSkins:"PERSONAGENS",tabGold:"OURO",tabDia:"DIAMANTES",tabFree:"GRÁTIS",
  more:"mais",bestValue:"MELHOR OFERTA",needMore:"Saldo insuficiente.",equip:"EQUIPAR",equipped:"✓ EQUIPADO",
  watchAd:"VER ANÚNCIO",watchAdSub:"moedas grátis",watchBtn:"Assistir = +{n} moedas",adsTitle:"ADS",removeAdsBtn:"Remover ADS",
  adLoading:"A mostrar anúncio…",coinsWord:"moedas",diffShort:"Dificuldade: {name}",
  levelLocked:"🔒",playBtn:"Jogar",prevPage:"Anterior",nextPage:"Seguinte",
  shopBuyCoins:"💰 Comprar moedas",buyCoinsTitle:"Comprar moedas",buyCoinsText:"Escolhe um pacote de gemas.",
  coinsTier:"💎 {n} gemas — {price}",payBtn:"PAGAR",
  removeAdsTitle:"Remover anúncios",removeAdsText:"Remove todos os anúncios do jogo com um pagamento único.",
  removeAdsPrice:"2,99 €",
  diffBtn:"🎯 Dificuldade: {name}",diffTitle:"Dificuldade",diffText:"Escolhe o quão duro o narrador deve ser contigo. Isto ajusta a velocidade dos dardos, plataformas e portões em todos os níveis.",
  diffEasy:"Fácil",diffMedium:"Médio",diffHard:"Difícil",diffExtreme:"Extremo",
  hudDaily:"Desafio Diário",hudEndless:"Infinito · nível {n}",hudDeaths:"mortes {n}",hudShield:"🛡 escudo pronto",hudInvert:"↔ controlos trocados",
  adPlaying:"📺 Anúncio a decorrer",adNote:"(no jogo final, um anúncio real da AdMob aparece aqui)",
  shieldAbsorbed:"O escudo absorveu isso. Sorte a tua.",
  purchaseOnlyStore:"Compras só funcionam na versão instalada pela Play Store.",
  productNotConfigured:"Esse produto ainda não está configurado na loja. Tenta mais tarde.",
  nothingToRestore:"Nada a restaurar nesta versão.",purchasesRestored:"Compras restauradas.",
  adWatched:"Anúncio visto. +{g} moedas e um escudo. De nada.",
  newRecord:" Novo recorde pessoal neste nível!"
 },
 en:{
  appTitle:"The Narrator Lies",appSubtitle:"The narrator guides you to each level's door. Trust him. Or don't.",
  continueBtn:"Continue (level {n} of {total})",newGame:"New game",play:"Play",
  dailyDone:"📅 Daily Challenge (done today · streak {streak})",dailyPlain:"📅 Daily Challenge",streakSuffix:" (streak {streak})",
  endlessPlain:"♾ Endless Mode",endlessBestSuffix:" (best {best})",
  voiceOn:"on",voiceOff:"off",voiceLabel:"Narrator voice: {state}",
  charactersBtn:"🧍 Characters ({name})",shopBtn:"🛍 Shop (💎 {gems})",langBtn:"🌐 Language: {name}",back:"Back",
  shopTitle:"Shop",shopRemoveAds:"💳 Remove ads (one-time payment)",shopAdsRemoved:"✓ Ads removed. Thank you.",
  shopRestore:"🔄 Restore purchases",
  shopText:"You have 💎 {gems} gems, earned by watching ads.\n\nCharacters are bought with gems under 🧍 Characters here in the shop, or all at once with real money.",
  skinsTitle:"Characters",skinsUnlockAll:"💳 Unlock all — one-time payment",
  skinsEquipped:"✓ {name} (equipped)",skinsEquip:"Equip: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} gems. Choose who you'll be. Buy skins with gems earned from watching ads, or unlock them all at once with real money.",
  langTitle:"Language",langText:"Choose the game's language.",
  optionsBtn:"⚙️ Options",resumeGame:"Resume game",mainMenu:"Main menu",optionsTitle:"Options",optionsText:"Adjust the game's sound and vibration.",
  soundLabel:"🔊 Sound: {state}",vibrationLabel:"📳 Vibration: {state}",narratorVoiceLabel:"🗣 Narrator voice: {state}",
  levelsBtn:"💎 Levels",levelsTitle:"Levels",levelsText:"Progress: {done}/{total}",
  tabSkins:"CHARACTERS",tabGold:"GOLD",tabDia:"DIAMONDS",tabFree:"FREE",
  more:"more",bestValue:"BEST VALUE",needMore:"Not enough balance.",equip:"EQUIP",equipped:"✓ EQUIPPED",
  watchAd:"WATCH AD",watchAdSub:"free coins",watchBtn:"Watch = +{n} coins",adsTitle:"ADS",removeAdsBtn:"Remove ADS",
  adLoading:"Showing ad…",coinsWord:"coins",diffShort:"Difficulty: {name}",
  levelLocked:"🔒",playBtn:"Play",prevPage:"Previous",nextPage:"Next",
  shopBuyCoins:"💰 Buy coins",buyCoinsTitle:"Buy coins",buyCoinsText:"Choose a gem pack.",
  coinsTier:"💎 {n} gems — {price}",payBtn:"PAY",
  removeAdsTitle:"Remove ads",removeAdsText:"Remove all ads from the game with a one-time payment.",
  removeAdsPrice:"$2.99",
  diffBtn:"🎯 Difficulty: {name}",diffTitle:"Difficulty",diffText:"Choose how hard the narrator should be on you. This adjusts dart, platform and gate speed across all levels.",
  diffEasy:"Easy",diffMedium:"Medium",diffHard:"Hard",diffExtreme:"Extreme",
  hudDaily:"Daily Challenge",hudEndless:"Endless · level {n}",hudDeaths:"deaths {n}",hudShield:"🛡 shield ready",hudInvert:"↔ controls swapped",
  adPlaying:"📺 Ad playing",adNote:"(in the final game, a real AdMob ad appears here)",
  shieldAbsorbed:"The shield absorbed that. Lucky you.",
  purchaseOnlyStore:"Purchases only work in the version installed from the Play Store.",
  productNotConfigured:"That product isn't set up in the store yet. Try again later.",
  nothingToRestore:"Nothing to restore in this version.",purchasesRestored:"Purchases restored.",
  adWatched:"Ad watched. +{g} coins and a shield. You are welcome.",
  newRecord:" New personal best on this level!"
 },
 es:{
  appTitle:"El Narrador Miente",appSubtitle:"El narrador te guía hasta la puerta de cada nivel. Confía en él. O no.",
  continueBtn:"Continuar (nivel {n} de {total})",newGame:"Nueva partida",play:"Jugar",
  dailyDone:"📅 Desafío Diario (hecho hoy · racha {streak})",dailyPlain:"📅 Desafío Diario",streakSuffix:" (racha {streak})",
  endlessPlain:"♾ Modo Infinito",endlessBestSuffix:" (récord {best})",
  voiceOn:"activada",voiceOff:"desactivada",voiceLabel:"Voz del narrador: {state}",
  charactersBtn:"🧍 Personajes ({name})",shopBtn:"🛍 Tienda (💎 {gems})",langBtn:"🌐 Idioma: {name}",back:"Volver",
  shopTitle:"Tienda",shopRemoveAds:"💳 Quitar anuncios (pago único)",shopAdsRemoved:"✓ Anuncios eliminados. Gracias.",
  shopRestore:"🔄 Restaurar compras",
  shopText:"Tienes 💎 {gems} gemas, ganadas viendo anuncios.\n\nLos personajes se compran con gemas en 🧍 Personajes, en el menú principal, o todos de una vez aquí con dinero real.",
  skinsTitle:"Personajes",skinsUnlockAll:"💳 Desbloquear todos — pago único",
  skinsEquipped:"✓ {name} (equipado)",skinsEquip:"Equipar: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} gemas. Elige quién serás. Compra skins con gemas ganadas viendo anuncios, o desbloquéalas todas de una vez con dinero real.",
  langTitle:"Idioma",langText:"Elige el idioma del juego.",
  hudDaily:"Desafío Diario",hudEndless:"Infinito · nivel {n}",hudDeaths:"muertes {n}",hudShield:"🛡 escudo listo",hudInvert:"↔ controles invertidos",
  adPlaying:"📺 Anuncio en curso",adNote:"(en el juego final, aquí aparecerá un anuncio real de AdMob)",
  shieldAbsorbed:"El escudo absorbió eso. Qué suerte la tuya.",
  purchaseOnlyStore:"Las compras solo funcionan en la versión instalada desde la Play Store.",
  productNotConfigured:"Ese producto aún no está configurado en la tienda. Inténtalo más tarde.",
  nothingToRestore:"Nada que restaurar en esta versión.",purchasesRestored:"Compras restauradas.",
  adWatched:"Anuncio visto. +{g} gemas y un escudo. De nada.",
  newRecord:" ¡Nuevo récord personal en este nivel!"
 },
 fr:{
  appTitle:"Le Narrateur Ment",appSubtitle:"Le narrateur te guide jusqu'à la porte de chaque niveau. Fais-lui confiance. Ou pas.",
  continueBtn:"Continuer (niveau {n} sur {total})",newGame:"Nouvelle partie",play:"Jouer",
  dailyDone:"📅 Défi Quotidien (fait aujourd'hui · série {streak})",dailyPlain:"📅 Défi Quotidien",streakSuffix:" (série {streak})",
  endlessPlain:"♾ Mode Infini",endlessBestSuffix:" (record {best})",
  voiceOn:"activée",voiceOff:"désactivée",voiceLabel:"Voix du narrateur : {state}",
  charactersBtn:"🧍 Personnages ({name})",shopBtn:"🛍 Boutique (💎 {gems})",langBtn:"🌐 Langue : {name}",back:"Retour",
  shopTitle:"Boutique",shopRemoveAds:"💳 Retirer les publicités (paiement unique)",shopAdsRemoved:"✓ Publicités supprimées. Merci.",
  shopRestore:"🔄 Restaurer les achats",
  shopText:"Tu as 💎 {gems} gemmes, gagnées en regardant des publicités.\n\nLes personnages s'achètent avec des gemmes dans 🧍 Personnages, dans le menu principal, ou tous d'un coup ici avec de l'argent réel.",
  skinsTitle:"Personnages",skinsUnlockAll:"💳 Tout débloquer — paiement unique",
  skinsEquipped:"✓ {name} (équipé)",skinsEquip:"Équiper : {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} gemmes. Choisis qui tu seras. Achète des tenues avec des gemmes gagnées en regardant des publicités, ou débloque-les toutes d'un coup avec de l'argent réel.",
  langTitle:"Langue",langText:"Choisis la langue du jeu.",
  hudDaily:"Défi Quotidien",hudEndless:"Infini · niveau {n}",hudDeaths:"morts {n}",hudShield:"🛡 bouclier prêt",hudInvert:"↔ commandes inversées",
  adPlaying:"📺 Publicité en cours",adNote:"(dans le jeu final, une vraie publicité AdMob apparaîtra ici)",
  shieldAbsorbed:"Le bouclier a absorbé ça. Tu as de la chance.",
  purchaseOnlyStore:"Les achats ne fonctionnent que dans la version installée depuis le Play Store.",
  productNotConfigured:"Ce produit n'est pas encore configuré dans la boutique. Réessaie plus tard.",
  nothingToRestore:"Rien à restaurer dans cette version.",purchasesRestored:"Achats restaurés.",
  adWatched:"Publicité visionnée. +{g} gemmes et un bouclier. De rien.",
  newRecord:" Nouveau record personnel sur ce niveau !"
 },
 de:{
  appTitle:"Der Erzähler Lügt",appSubtitle:"Der Erzähler führt dich zur Tür jedes Levels. Vertrau ihm. Oder auch nicht.",
  continueBtn:"Weiter (Level {n} von {total})",newGame:"Neues Spiel",play:"Spielen",
  dailyDone:"📅 Tagesherausforderung (heute erledigt · Serie {streak})",dailyPlain:"📅 Tagesherausforderung",streakSuffix:" (Serie {streak})",
  endlessPlain:"♾ Endlos-Modus",endlessBestSuffix:" (Rekord {best})",
  voiceOn:"an",voiceOff:"aus",voiceLabel:"Erzählerstimme: {state}",
  charactersBtn:"🧍 Charaktere ({name})",shopBtn:"🛍 Shop (💎 {gems})",langBtn:"🌐 Sprache: {name}",back:"Zurück",
  shopTitle:"Shop",shopRemoveAds:"💳 Werbung entfernen (einmalige Zahlung)",shopAdsRemoved:"✓ Werbung entfernt. Danke.",
  shopRestore:"🔄 Käufe wiederherstellen",
  shopText:"Du hast 💎 {gems} Edelsteine, verdient durch Werbung ansehen.\n\nCharaktere kannst du mit Edelsteinen unter 🧍 Charaktere im Hauptmenü kaufen, oder hier alle auf einmal mit echtem Geld.",
  skinsTitle:"Charaktere",skinsUnlockAll:"💳 Alle freischalten — einmalige Zahlung",
  skinsEquipped:"✓ {name} (ausgerüstet)",skinsEquip:"Ausrüsten: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} Edelsteine. Wähle, wer du sein willst. Kaufe Skins mit Edelsteinen aus Werbung, oder schalte alle auf einmal mit echtem Geld frei.",
  langTitle:"Sprache",langText:"Wähle die Sprache des Spiels.",
  hudDaily:"Tagesherausforderung",hudEndless:"Endlos · Level {n}",hudDeaths:"Tode {n}",hudShield:"🛡 Schild bereit",hudInvert:"↔ Steuerung vertauscht",
  adPlaying:"📺 Werbung läuft",adNote:"(im fertigen Spiel erscheint hier echte AdMob-Werbung)",
  shieldAbsorbed:"Der Schild hat das abgefangen. Glück gehabt.",
  purchaseOnlyStore:"Käufe funktionieren nur in der über den Play Store installierten Version.",
  productNotConfigured:"Dieses Produkt ist im Shop noch nicht eingerichtet. Versuch es später erneut.",
  nothingToRestore:"Nichts wiederherzustellen in dieser Version.",purchasesRestored:"Käufe wiederhergestellt.",
  adWatched:"Werbung angesehen. +{g} Edelsteine und ein Schild. Bitte sehr.",
  newRecord:" Neue persönliche Bestzeit in diesem Level!"
 },
 ru:{
  appTitle:"Рассказчик Лжёт",appSubtitle:"Рассказчик ведёт тебя к двери каждого уровня. Доверься ему. Или нет.",
  continueBtn:"Продолжить (уровень {n} из {total})",newGame:"Новая игра",play:"Играть",
  dailyDone:"📅 Ежедневный вызов (выполнено сегодня · серия {streak})",dailyPlain:"📅 Ежедневный вызов",streakSuffix:" (серия {streak})",
  endlessPlain:"♾ Бесконечный режим",endlessBestSuffix:" (рекорд {best})",
  voiceOn:"включена",voiceOff:"выключена",voiceLabel:"Голос рассказчика: {state}",
  charactersBtn:"🧍 Персонажи ({name})",shopBtn:"🛍 Магазин (💎 {gems})",langBtn:"🌐 Язык: {name}",back:"Назад",
  shopTitle:"Магазин",shopRemoveAds:"💳 Убрать рекламу (разовый платёж)",shopAdsRemoved:"✓ Реклама убрана. Спасибо.",
  shopRestore:"🔄 Восстановить покупки",
  shopText:"У тебя 💎 {gems} самоцветов, заработанных просмотром рекламы.\n\nПерсонажей можно купить за самоцветы в разделе 🧍 Персонажи в главном меню, или все сразу здесь за реальные деньги.",
  skinsTitle:"Персонажи",skinsUnlockAll:"💳 Открыть все — разовый платёж",
  skinsEquipped:"✓ {name} (надето)",skinsEquip:"Надеть: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} самоцветов. Выбери, кем будешь. Покупай скины за самоцветы, заработанные просмотром рекламы, или открой их все сразу за реальные деньги.",
  langTitle:"Язык",langText:"Выбери язык игры.",
  hudDaily:"Ежедневный вызов",hudEndless:"Бесконечный · уровень {n}",hudDeaths:"смертей {n}",hudShield:"🛡 щит готов",hudInvert:"↔ управление перевёрнуто",
  adPlaying:"📺 Идёт реклама",adNote:"(в финальной версии игры здесь появится настоящая реклама AdMob)",
  shieldAbsorbed:"Щит поглотил это. Повезло тебе.",
  purchaseOnlyStore:"Покупки работают только в версии, установленной из Play Store.",
  productNotConfigured:"Этот товар ещё не настроен в магазине. Попробуй позже.",
  nothingToRestore:"В этой версии нечего восстанавливать.",purchasesRestored:"Покупки восстановлены.",
  adWatched:"Реклама просмотрена. +{g} кристаллов и щит. Пожалуйста.",
  newRecord:" Новый личный рекорд на этом уровне!"
 },
 ja:{
  appTitle:"ナレーターは嘘をつく",appSubtitle:"ナレーターが各レベルの扉まで導いてくれる。彼を信じるか。信じないか。",
  continueBtn:"続ける(レベル {n}/{total})",newGame:"はじめから",play:"プレイ",
  dailyDone:"📅 デイリーチャレンジ(本日クリア済み・連続{streak}回)",dailyPlain:"📅 デイリーチャレンジ",streakSuffix:"(連続{streak}回)",
  endlessPlain:"♾ エンドレスモード",endlessBestSuffix:"(自己ベスト{best})",
  voiceOn:"オン",voiceOff:"オフ",voiceLabel:"ナレーターの声:{state}",
  charactersBtn:"🧍 キャラクター({name})",shopBtn:"🛍 ショップ(💎{gems})",langBtn:"🌐 言語:{name}",back:"戻る",
  shopTitle:"ショップ",shopRemoveAds:"💳 広告を削除(買い切り)",shopAdsRemoved:"✓ 広告を削除しました。ありがとうございます。",
  shopRestore:"🔄 購入を復元",
  shopText:"広告を見て獲得した💎{gems}個の宝石を持っています。\n\nキャラクターはメインメニューの🧍キャラクターで宝石を使って購入するか、ここでリアルマネーを使って一括購入できます。",
  skinsTitle:"キャラクター",skinsUnlockAll:"💳 すべて解放—買い切り",
  skinsEquipped:"✓ {name}(装備中)",skinsEquip:"装備する:{name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎{gems}個の宝石。誰になるか選ぼう。広告視聴で得た宝石でスキンを購入するか、リアルマネーで一括解放できます。",
  langTitle:"言語",langText:"ゲームの言語を選んでください。",
  hudDaily:"デイリーチャレンジ",hudEndless:"エンドレス・レベル{n}",hudDeaths:"死亡{n}回",hudShield:"🛡 シールド準備完了",hudInvert:"↔ 操作が反転中",
  adPlaying:"📺 広告再生中",adNote:"(完成版では、ここに実際のAdMob広告が表示されます)",
  shieldAbsorbed:"シールドがそれを防いだ。運がいいね。",
  purchaseOnlyStore:"購入はPlayストアからインストールされたバージョンでのみ機能します。",
  productNotConfigured:"この商品はまだストアに設定されていません。後でもう一度お試しください。",
  nothingToRestore:"このバージョンでは復元するものがありません。",purchasesRestored:"購入内容を復元しました。",
  adWatched:"広告視聴完了。+{g}ジェムとシールドを獲得。どういたしまして。",
  newRecord:" このレベルでの自己ベストを更新!"
 },
 zh:{
  appTitle:"说谎的叙述者",appSubtitle:"叙述者会引导你走向每一关的门。相信他。或者不信。",
  continueBtn:"继续(第 {n}/{total} 关)",newGame:"新游戏",play:"开始游戏",
  dailyDone:"📅 每日挑战(今日已完成 · 连续{streak}次)",dailyPlain:"📅 每日挑战",streakSuffix:"(连续{streak}次)",
  endlessPlain:"♾ 无尽模式",endlessBestSuffix:"(最佳{best})",
  voiceOn:"开启",voiceOff:"关闭",voiceLabel:"叙述者语音:{state}",
  charactersBtn:"🧍 角色({name})",shopBtn:"🛍 商店(💎{gems})",langBtn:"🌐 语言:{name}",back:"返回",
  shopTitle:"商店",shopRemoveAds:"💳 移除广告(一次性付费)",shopAdsRemoved:"✓ 广告已移除,谢谢。",
  shopRestore:"🔄 恢复购买",
  shopText:"你有💎{gems}颗宝石,通过观看广告获得。\n\n角色可以在主菜单的🧍角色中用宝石购买,也可以在这里用真实货币一次性全部解锁。",
  skinsTitle:"角色",skinsUnlockAll:"💳 解锁全部—一次性付费",
  skinsEquipped:"✓ {name}(已装备)",skinsEquip:"装备:{name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎{gems}颗宝石。选择你的角色。用看广告获得的宝石购买皮肤,或用真实货币一次性全部解锁。",
  langTitle:"语言",langText:"选择游戏语言。",
  hudDaily:"每日挑战",hudEndless:"无尽 · 第{n}关",hudDeaths:"死亡{n}次",hudShield:"🛡 护盾就绪",hudInvert:"↔ 操作已反转",
  adPlaying:"📺 广告播放中",adNote:"(在正式版本中,这里会显示真正的 AdMob 广告)",
  shieldAbsorbed:"护盾吸收了那次攻击,算你走运。",
  purchaseOnlyStore:"购买功能仅在通过 Play 商店安装的版本中可用。",
  productNotConfigured:"该商品尚未在商店中配置。请稍后再试。",
  nothingToRestore:"此版本没有可恢复的内容。",purchasesRestored:"购买已恢复。",
  adWatched:"已观看广告。+{g} 宝石和一个护盾。不客气。",
  newRecord:" 本关卡新纪录!"
 },
 hi:{
  appTitle:"कथावाचक झूठ बोलता है",appSubtitle:"कथावाचक तुम्हें हर स्तर के दरवाज़े तक ले जाता है। उस पर भरोसा करो। या मत करो।",
  continueBtn:"जारी रखें (स्तर {n} / {total})",newGame:"नया खेल",play:"खेलें",
  dailyDone:"📅 दैनिक चुनौती (आज पूरी हुई · लगातार {streak})",dailyPlain:"📅 दैनिक चुनौती",streakSuffix:" (लगातार {streak})",
  endlessPlain:"♾ अनंत मोड",endlessBestSuffix:" (सर्वश्रेष्ठ {best})",
  voiceOn:"चालू",voiceOff:"बंद",voiceLabel:"कथावाचक की आवाज़: {state}",
  charactersBtn:"🧍 किरदार ({name})",shopBtn:"🛍 दुकान (💎 {gems})",langBtn:"🌐 भाषा: {name}",back:"वापस",
  shopTitle:"दुकान",shopRemoveAds:"💳 विज्ञापन हटाएं (एकमुश्त भुगतान)",shopAdsRemoved:"✓ विज्ञापन हटा दिए गए। धन्यवाद।",
  shopRestore:"🔄 खरीदारी पुनर्स्थापित करें",
  shopText:"तुम्हारे पास 💎 {gems} रत्न हैं, जो विज्ञापन देखकर कमाए गए हैं।\n\nकिरदार मुख्य मेनू में 🧍 किरदार में रत्नों से खरीदे जा सकते हैं, या यहाँ असली पैसों से एक साथ सभी।",
  skinsTitle:"किरदार",skinsUnlockAll:"💳 सभी अनलॉक करें — एकमुश्त भुगतान",
  skinsEquipped:"✓ {name} (पहना हुआ)",skinsEquip:"पहनें: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} रत्न। चुनो तुम कौन बनोगे। विज्ञापन देखकर कमाए रत्नों से स्किन खरीदो, या असली पैसों से सभी एक साथ अनलॉक करो।",
  langTitle:"भाषा",langText:"खेल की भाषा चुनें।",
  hudDaily:"दैनिक चुनौती",hudEndless:"अनंत · स्तर {n}",hudDeaths:"मौतें {n}",hudShield:"🛡 ढाल तैयार",hudInvert:"↔ नियंत्रण बदले गए",
  adPlaying:"📺 विज्ञापन चल रहा है",adNote:"(अंतिम गेम में यहाँ असली AdMob विज्ञापन दिखेगा)",
  shieldAbsorbed:"ढाल ने उसे सोख लिया। तुम्हारी किस्मत अच्छी है।",
  purchaseOnlyStore:"खरीदारी केवल Play Store से इंस्टॉल किए गए संस्करण में काम करती है।",
  productNotConfigured:"वह उत्पाद अभी तक स्टोर में सेट नहीं हुआ है। बाद में फिर से कोशिश करें।",
  nothingToRestore:"इस संस्करण में पुनर्स्थापित करने के लिए कुछ नहीं है।",purchasesRestored:"खरीदारी पुनर्स्थापित हो गई।",
  adWatched:"विज्ञापन देखा गया। +{g} जेम्स और एक शील्ड। स्वागत है।",
  newRecord:" इस स्तर पर नया व्यक्तिगत रिकॉर्ड!"
 },
 ar:{
  appTitle:"الراوي يكذب",appSubtitle:"يقودك الراوي إلى باب كل مرحلة. ثق به. أو لا تفعل.",
  continueBtn:"متابعة (المرحلة {n} من {total})",newGame:"لعبة جديدة",play:"ابدأ اللعب",
  dailyDone:"📅 التحدي اليومي (أُنجز اليوم · تتابع {streak})",dailyPlain:"📅 التحدي اليومي",streakSuffix:" (تتابع {streak})",
  endlessPlain:"♾ الوضع اللانهائي",endlessBestSuffix:" (أفضل رقم {best})",
  voiceOn:"مفعّل",voiceOff:"متوقف",voiceLabel:"صوت الراوي: {state}",
  charactersBtn:"🧍 الشخصيات ({name})",shopBtn:"🛍 المتجر (💎 {gems})",langBtn:"🌐 اللغة: {name}",back:"رجوع",
  shopTitle:"المتجر",shopRemoveAds:"💳 إزالة الإعلانات (دفعة واحدة)",shopAdsRemoved:"✓ تمت إزالة الإعلانات. شكرًا لك.",
  shopRestore:"🔄 استعادة المشتريات",
  shopText:"لديك 💎 {gems} جوهرة، تم كسبها بمشاهدة الإعلانات.\n\nيمكن شراء الشخصيات بالجواهر من 🧍 الشخصيات في القائمة الرئيسية، أو شراؤها جميعًا دفعة واحدة هنا بأموال حقيقية.",
  skinsTitle:"الشخصيات",skinsUnlockAll:"💳 فتح الكل — دفعة واحدة",
  skinsEquipped:"✓ {name} (مرتدى)",skinsEquip:"ارتداء: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} جوهرة. اختر من ستكون. اشترِ الأشكال بالجواهر المكتسبة من مشاهدة الإعلانات، أو افتحها جميعًا دفعة واحدة بأموال حقيقية.",
  langTitle:"اللغة",langText:"اختر لغة اللعبة.",
  hudDaily:"التحدي اليومي",hudEndless:"لانهائي · المرحلة {n}",hudDeaths:"الوفيات {n}",hudShield:"🛡 الدرع جاهز",hudInvert:"↔ عكس أزرار التحكم",
  adPlaying:"📺 الإعلان قيد التشغيل",adNote:"(في النسخة النهائية من اللعبة، سيظهر هنا إعلان حقيقي من AdMob)",
  shieldAbsorbed:"امتص الدرع ذلك. يا لحظك.",
  purchaseOnlyStore:"عمليات الشراء تعمل فقط في النسخة المثبتة من متجر Play.",
  productNotConfigured:"هذا المنتج غير مُعد بعد في المتجر. حاول لاحقًا.",
  nothingToRestore:"لا يوجد شيء لاستعادته في هذه النسخة.",purchasesRestored:"تمت استعادة المشتريات.",
  adWatched:"تمت مشاهدة الإعلان. +{g} جواهر ودرع. على الرحب والسعة.",
  newRecord:" رقم قياسي شخصي جديد في هذه المرحلة!"
 },
 id:{
  appTitle:"Sang Narator Berbohong",appSubtitle:"Sang narator memandumu ke pintu setiap level. Percayalah padanya. Atau jangan.",
  continueBtn:"Lanjutkan (level {n} dari {total})",newGame:"Permainan baru",play:"Main",
  dailyDone:"📅 Tantangan Harian (selesai hari ini · beruntun {streak})",dailyPlain:"📅 Tantangan Harian",streakSuffix:" (beruntun {streak})",
  endlessPlain:"♾ Mode Tanpa Akhir",endlessBestSuffix:" (rekor {best})",
  voiceOn:"aktif",voiceOff:"nonaktif",voiceLabel:"Suara narator: {state}",
  charactersBtn:"🧍 Karakter ({name})",shopBtn:"🛍 Toko (💎 {gems})",langBtn:"🌐 Bahasa: {name}",back:"Kembali",
  shopTitle:"Toko",shopRemoveAds:"💳 Hapus iklan (pembayaran sekali)",shopAdsRemoved:"✓ Iklan dihapus. Terima kasih.",
  shopRestore:"🔄 Pulihkan pembelian",
  shopText:"Kamu punya 💎 {gems} permata, didapat dari menonton iklan.\n\nKarakter bisa dibeli dengan permata di 🧍 Karakter pada menu utama, atau sekaligus semua di sini dengan uang sungguhan.",
  skinsTitle:"Karakter",skinsUnlockAll:"💳 Buka semua — pembayaran sekali",
  skinsEquipped:"✓ {name} (terpakai)",skinsEquip:"Pakai: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} permata. Pilih siapa kamu nanti. Beli skin dengan permata dari menonton iklan, atau buka semuanya sekaligus dengan uang sungguhan.",
  langTitle:"Bahasa",langText:"Pilih bahasa permainan.",
  hudDaily:"Tantangan Harian",hudEndless:"Tanpa Akhir · level {n}",hudDeaths:"kematian {n}",hudShield:"🛡 perisai siap",hudInvert:"↔ kontrol terbalik",
  adPlaying:"📺 Iklan sedang diputar",adNote:"(di versi final game, iklan AdMob sungguhan akan muncul di sini)",
  shieldAbsorbed:"Perisai menyerap itu. Untung buatmu.",
  purchaseOnlyStore:"Pembelian hanya berfungsi di versi yang terpasang dari Play Store.",
  productNotConfigured:"Produk itu belum diatur di toko. Coba lagi nanti.",
  nothingToRestore:"Tidak ada yang bisa dipulihkan di versi ini.",purchasesRestored:"Pembelian dipulihkan.",
  adWatched:"Iklan ditonton. +{g} permata dan sebuah perisai. Sama-sama.",
  newRecord:" Rekor pribadi baru di level ini!"
 },
 bn:{
  appTitle:"কথক মিথ্যা বলে",appSubtitle:"কথক তোমাকে প্রতিটি লেভেলের দরজা পর্যন্ত নিয়ে যায়। তাকে বিশ্বাস করো। অথবা কোরো না।",
  continueBtn:"চালিয়ে যান (লেভেল {n} / {total})",newGame:"নতুন খেলা",play:"খেলুন",
  dailyDone:"📅 দৈনিক চ্যালেঞ্জ (আজ সম্পন্ন · ধারাবাহিক {streak})",dailyPlain:"📅 দৈনিক চ্যালেঞ্জ",streakSuffix:" (ধারাবাহিক {streak})",
  endlessPlain:"♾ অসীম মোড",endlessBestSuffix:" (সেরা {best})",
  voiceOn:"চালু",voiceOff:"বন্ধ",voiceLabel:"কথকের কণ্ঠ: {state}",
  charactersBtn:"🧍 চরিত্র ({name})",shopBtn:"🛍 দোকান (💎 {gems})",langBtn:"🌐 ভাষা: {name}",back:"ফিরে যান",
  shopTitle:"দোকান",shopRemoveAds:"💳 বিজ্ঞাপন সরান (এককালীন পেমেন্ট)",shopAdsRemoved:"✓ বিজ্ঞাপন সরানো হয়েছে। ধন্যবাদ।",
  shopRestore:"🔄 ক্রয় পুনরুদ্ধার করুন",
  shopText:"তোমার কাছে 💎 {gems}টি রত্ন আছে, বিজ্ঞাপন দেখে অর্জিত।\n\nচরিত্রগুলো প্রধান মেনুর 🧍 চরিত্র থেকে রত্ন দিয়ে কেনা যায়, অথবা এখানে একসাথে সব আসল টাকা দিয়ে।",
  skinsTitle:"চরিত্র",skinsUnlockAll:"💳 সব আনলক করুন — এককালীন পেমেন্ট",
  skinsEquipped:"✓ {name} (পরিহিত)",skinsEquip:"পরুন: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems}টি রত্ন। বেছে নাও তুমি কে হবে। বিজ্ঞাপন দেখে পাওয়া রত্ন দিয়ে স্কিন কেনো, অথবা আসল টাকা দিয়ে একসাথে সব আনলক করো।",
  langTitle:"ভাষা",langText:"খেলার ভাষা বেছে নিন।",
  hudDaily:"দৈনিক চ্যালেঞ্জ",hudEndless:"অসীম · লেভেল {n}",hudDeaths:"মৃত্যু {n}",hudShield:"🛡 ঢাল প্রস্তুত",hudInvert:"↔ নিয়ন্ত্রণ উল্টানো",
  adPlaying:"📺 বিজ্ঞাপন চলছে",adNote:"(চূড়ান্ত গেমে এখানে একটি আসল AdMob বিজ্ঞাপন দেখা যাবে)",
  shieldAbsorbed:"ঢাল সেটা শুষে নিয়েছে। তোমার ভাগ্য ভালো।",
  purchaseOnlyStore:"ক্রয় শুধুমাত্র Play Store থেকে ইনস্টল করা সংস্করণে কাজ করে।",
  productNotConfigured:"ঐ পণ্যটি এখনও দোকানে সেট করা হয়নি। পরে আবার চেষ্টা করো।",
  nothingToRestore:"এই সংস্করণে পুনরুদ্ধার করার মতো কিছু নেই।",purchasesRestored:"ক্রয় পুনরুদ্ধার হয়েছে।",
  adWatched:"বিজ্ঞাপন দেখা হয়েছে। +{g} জেমস এবং একটি শিল্ড। স্বাগতম।",
  newRecord:" এই লেভেলে নতুন ব্যক্তিগত রেকর্ড!"
 }
};
Object.assign(STR.pt,{
  levelReward:"+{n} moedas",lockedPrev:"Passa o nível anterior primeiro.",
  skipLevel:"⏭ Saltar nível · {p} moedas",skipTitle:"Saltar este nível?",
  skipText:"Pagas {p} moedas e passas para o nível seguinte.\nTens {c} moedas.",
  buyYes:"Comprar · {p} moedas",cancel:"Cancelar",
  notEnoughCoins:"Faltam {n} moedas. Ganhas 10 por cada nível que passas.",
  unlockTitle:"Desbloquear o nível {n}?",unlockText:"Custa {p} moedas.\nTens {c} moedas.",
  levelUnlocked:"Nível {n} desbloqueado!",
  skinLockedLevel:"Nível {n}",skinNeedLevel:"Chega ao nível {n} para poderes comprar esta personagem.",newSkin:"Nova personagem disponível na loja: {name}!",
  finishTitle:"120 Vezes",finishText:"Mortes: {d}. Vezes que acreditaste em mim e perdeste: {l}.\nCento e vinte níveis, e a única mentira que nunca te disse foi a última: que valia a pena chegar aqui.\nObrigado por teres continuado a jogar enquanto eu aprendia a parar de mentir.",
  playAgain:"Jogar outra vez",menuBtn:"Menu",dailyTitle:"Desafio Diário",
  dailyOk:"Concluído! Sequência: {streak} dia(s).\n+{gained} moedas.\nVolta amanhã para continuar a sequência.",
  dailyAlready:"Já tinhas feito o desafio de hoje.\nSequência atual: {streak} dia(s).\nVolta amanhã.",
  endlessEndTitle:"Modo Infinito — Fim",endlessEndText:"Chegaste ao nível {n}.\nRecorde: {best}.",tryAgain:"Tentar outra vez",
  rotateNote:"↻ Roda o telemóvel para jogares na horizontal."
});
Object.assign(STR.en,{
  levelReward:"+{n} coins",lockedPrev:"Beat the previous level first.",
  skipLevel:"⏭ Skip level · {p} coins",skipTitle:"Skip this level?",
  skipText:"Pay {p} coins and move on to the next level.\nYou have {c} coins.",
  buyYes:"Buy · {p} coins",cancel:"Cancel",
  notEnoughCoins:"You need {n} more coins. You earn 10 for every level you beat.",
  unlockTitle:"Unlock level {n}?",unlockText:"It costs {p} coins.\nYou have {c} coins.",
  levelUnlocked:"Level {n} unlocked!",
  skinLockedLevel:"Level {n}",skinNeedLevel:"Reach level {n} to be able to buy this character.",newSkin:"New character available in the shop: {name}!",
  finishTitle:"120 Times",finishText:"Deaths: {d}. Times you believed me and lost: {l}.\nOne hundred and twenty levels, and the only lie I never told you was the last one: that it was worth getting here.\nThank you for playing on while I learned to stop lying.",
  playAgain:"Play again",menuBtn:"Menu",dailyTitle:"Daily Challenge",
  dailyOk:"Done! Streak: {streak} day(s).\n+{gained} coins.\nCome back tomorrow to keep the streak going.",
  dailyAlready:"You already did today's challenge.\nCurrent streak: {streak} day(s).\nCome back tomorrow.",
  endlessEndTitle:"Endless Mode — Game Over",endlessEndText:"You reached level {n}.\nBest: {best}.",tryAgain:"Try again",
  rotateNote:"↻ Rotate your phone to play in landscape."
});
/* Traduções completadas (UI): idiomas existentes + it, tr, ko, vi */
Object.assign(STR.es,{"optionsBtn": "⚙️ Opciones", "resumeGame": "Volver al juego", "mainMenu": "Menú principal", "optionsTitle": "Opciones", "optionsText": "Ajusta el sonido y la vibración del juego.", "soundLabel": "🔊 Sonido: {state}", "vibrationLabel": "📳 Vibración: {state}", "narratorVoiceLabel": "🗣 Voz del narrador: {state}", "levelsBtn": "💎 Niveles", "levelsTitle": "Niveles", "levelsText": "Progreso: {done}/{total}", "tabSkins": "PERSONAJES", "tabGold": "ORO", "tabDia": "DIAMANTES", "tabFree": "GRATIS", "more": "más", "bestValue": "MEJOR OFERTA", "needMore": "Saldo insuficiente.", "equip": "EQUIPAR", "equipped": "✓ EQUIPADO", "watchAd": "VER ANUNCIO", "watchAdSub": "monedas gratis", "watchBtn": "Ver = +{n} monedas", "adsTitle": "ANUNCIOS", "removeAdsBtn": "Quitar anuncios", "adLoading": "Mostrando anuncio…", "coinsWord": "monedas", "diffShort": "Dificultad: {name}", "levelLocked": "🔒", "playBtn": "Jugar", "prevPage": "Anterior", "nextPage": "Siguiente", "shopBuyCoins": "💰 Comprar monedas", "buyCoinsTitle": "Comprar monedas", "buyCoinsText": "Elige un paquete de gemas.", "coinsTier": "💎 {n} gemas — {price}", "payBtn": "PAGAR", "removeAdsTitle": "Quitar anuncios", "removeAdsText": "Elimina todos los anuncios del juego con un único pago.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Dificultad: {name}", "diffTitle": "Dificultad", "diffText": "Elige lo duro que debe ser el narrador contigo. Esto ajusta la velocidad de los dardos, plataformas y puertas en todos los niveles.", "diffEasy": "Fácil", "diffMedium": "Medio", "diffHard": "Difícil", "diffExtreme": "Extremo", "levelReward": "+{n} monedas", "lockedPrev": "Pasa primero el nivel anterior.", "skipLevel": "⏭ Saltar nivel · {p} monedas", "skipTitle": "¿Saltar este nivel?", "skipText": "Pagas {p} monedas y pasas al siguiente nivel.\nTienes {c} monedas.", "buyYes": "Comprar · {p} monedas", "cancel": "Cancelar", "notEnoughCoins": "Te faltan {n} monedas. Ganas 10 por cada nivel que superas.", "unlockTitle": "¿Desbloquear el nivel {n}?", "unlockText": "Cuesta {p} monedas.\nTienes {c} monedas.", "levelUnlocked": "¡Nivel {n} desbloqueado!", "skinLockedLevel": "Nivel {n}", "skinNeedLevel": "Llega al nivel {n} para poder comprar este personaje.", "newSkin": "¡Nuevo personaje disponible en la tienda: {name}!"});
Object.assign(STR.fr,{"optionsBtn": "⚙️ Options", "resumeGame": "Reprendre la partie", "mainMenu": "Menu principal", "optionsTitle": "Options", "optionsText": "Règle le son et la vibration du jeu.", "soundLabel": "🔊 Son : {state}", "vibrationLabel": "📳 Vibration : {state}", "narratorVoiceLabel": "🗣 Voix du narrateur : {state}", "levelsBtn": "💎 Niveaux", "levelsTitle": "Niveaux", "levelsText": "Progression : {done}/{total}", "tabSkins": "PERSONNAGES", "tabGold": "OR", "tabDia": "DIAMANTS", "tabFree": "GRATUIT", "more": "plus", "bestValue": "MEILLEURE OFFRE", "needMore": "Solde insuffisant.", "equip": "ÉQUIPER", "equipped": "✓ ÉQUIPÉ", "watchAd": "VOIR UNE PUB", "watchAdSub": "pièces gratuites", "watchBtn": "Regarder = +{n} pièces", "adsTitle": "PUBS", "removeAdsBtn": "Retirer les pubs", "adLoading": "Pub en cours…", "coinsWord": "pièces", "diffShort": "Difficulté : {name}", "levelLocked": "🔒", "playBtn": "Jouer", "prevPage": "Précédent", "nextPage": "Suivant", "shopBuyCoins": "💰 Acheter des pièces", "buyCoinsTitle": "Acheter des pièces", "buyCoinsText": "Choisis un pack de gemmes.", "coinsTier": "💎 {n} gemmes — {price}", "payBtn": "PAYER", "removeAdsTitle": "Retirer les publicités", "removeAdsText": "Supprime toutes les publicités du jeu avec un paiement unique.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Difficulté : {name}", "diffTitle": "Difficulté", "diffText": "Choisis à quel point le narrateur doit être dur avec toi. Cela règle la vitesse des fléchettes, plateformes et portes dans tous les niveaux.", "diffEasy": "Facile", "diffMedium": "Moyen", "diffHard": "Difficile", "diffExtreme": "Extrême", "levelReward": "+{n} pièces", "lockedPrev": "Termine d'abord le niveau précédent.", "skipLevel": "⏭ Passer le niveau · {p} pièces", "skipTitle": "Passer ce niveau ?", "skipText": "Tu paies {p} pièces et passes au niveau suivant.\nTu as {c} pièces.", "buyYes": "Acheter · {p} pièces", "cancel": "Annuler", "notEnoughCoins": "Il te manque {n} pièces. Tu en gagnes 10 par niveau réussi.", "unlockTitle": "Débloquer le niveau {n} ?", "unlockText": "Coûte {p} pièces.\nTu as {c} pièces.", "levelUnlocked": "Niveau {n} débloqué !", "skinLockedLevel": "Niveau {n}", "skinNeedLevel": "Atteins le niveau {n} pour pouvoir acheter ce personnage.", "newSkin": "Nouveau personnage disponible dans la boutique : {name} !"});
Object.assign(STR.de,{"optionsBtn": "⚙️ Optionen", "resumeGame": "Zurück zum Spiel", "mainMenu": "Hauptmenü", "optionsTitle": "Optionen", "optionsText": "Stell Sound und Vibration des Spiels ein.", "soundLabel": "🔊 Sound: {state}", "vibrationLabel": "📳 Vibration: {state}", "narratorVoiceLabel": "🗣 Erzählerstimme: {state}", "levelsBtn": "💎 Level", "levelsTitle": "Level", "levelsText": "Fortschritt: {done}/{total}", "tabSkins": "FIGUREN", "tabGold": "GOLD", "tabDia": "DIAMANTEN", "tabFree": "GRATIS", "more": "mehr", "bestValue": "BESTES ANGEBOT", "needMore": "Nicht genug Guthaben.", "equip": "AUSRÜSTEN", "equipped": "✓ AUSGERÜSTET", "watchAd": "WERBUNG ANSEHEN", "watchAdSub": "Gratis-Münzen", "watchBtn": "Ansehen = +{n} Münzen", "adsTitle": "WERBUNG", "removeAdsBtn": "Werbung entfernen", "adLoading": "Werbung wird gezeigt…", "coinsWord": "Münzen", "diffShort": "Schwierigkeit: {name}", "levelLocked": "🔒", "playBtn": "Spielen", "prevPage": "Zurück", "nextPage": "Weiter", "shopBuyCoins": "💰 Münzen kaufen", "buyCoinsTitle": "Münzen kaufen", "buyCoinsText": "Wähl ein Edelsteinpaket.", "coinsTier": "💎 {n} Edelsteine — {price}", "payBtn": "ZAHLEN", "removeAdsTitle": "Werbung entfernen", "removeAdsText": "Entfernt alle Werbung im Spiel mit einer einmaligen Zahlung.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Schwierigkeit: {name}", "diffTitle": "Schwierigkeit", "diffText": "Wähl, wie hart der Erzähler zu dir sein soll. Das passt die Geschwindigkeit von Pfeilen, Plattformen und Toren in allen Leveln an.", "diffEasy": "Leicht", "diffMedium": "Mittel", "diffHard": "Schwer", "diffExtreme": "Extrem", "levelReward": "+{n} Münzen", "lockedPrev": "Schaff zuerst das vorherige Level.", "skipLevel": "⏭ Level überspringen · {p} Münzen", "skipTitle": "Dieses Level überspringen?", "skipText": "Du zahlst {p} Münzen und kommst zum nächsten Level.\nDu hast {c} Münzen.", "buyYes": "Kaufen · {p} Münzen", "cancel": "Abbrechen", "notEnoughCoins": "Dir fehlen {n} Münzen. Du bekommst 10 für jedes geschaffte Level.", "unlockTitle": "Level {n} freischalten?", "unlockText": "Kostet {p} Münzen.\nDu hast {c} Münzen.", "levelUnlocked": "Level {n} freigeschaltet!", "skinLockedLevel": "Level {n}", "skinNeedLevel": "Erreiche Level {n}, um diese Figur kaufen zu können.", "newSkin": "Neue Figur im Shop verfügbar: {name}!"});
Object.assign(STR.ru,{"optionsBtn": "⚙️ Настройки", "resumeGame": "Вернуться в игру", "mainMenu": "Главное меню", "optionsTitle": "Настройки", "optionsText": "Настрой звук и вибрацию игры.", "soundLabel": "🔊 Звук: {state}", "vibrationLabel": "📳 Вибрация: {state}", "narratorVoiceLabel": "🗣 Голос рассказчика: {state}", "levelsBtn": "💎 Уровни", "levelsTitle": "Уровни", "levelsText": "Прогресс: {done}/{total}", "tabSkins": "ПЕРСОНАЖИ", "tabGold": "ЗОЛОТО", "tabDia": "АЛМАЗЫ", "tabFree": "БЕСПЛАТНО", "more": "ещё", "bestValue": "ЛУЧШАЯ ЦЕНА", "needMore": "Недостаточно средств.", "equip": "ВЫБРАТЬ", "equipped": "✓ ВЫБРАН", "watchAd": "СМОТРЕТЬ РЕКЛАМУ", "watchAdSub": "бесплатные монеты", "watchBtn": "Смотреть = +{n} монет", "adsTitle": "РЕКЛАМА", "removeAdsBtn": "Убрать рекламу", "adLoading": "Показываю рекламу…", "coinsWord": "монет", "diffShort": "Сложность: {name}", "levelLocked": "🔒", "playBtn": "Играть", "prevPage": "Назад", "nextPage": "Далее", "shopBuyCoins": "💰 Купить монеты", "buyCoinsTitle": "Купить монеты", "buyCoinsText": "Выбери набор гемов.", "coinsTier": "💎 {n} гемов — {price}", "payBtn": "ОПЛАТИТЬ", "removeAdsTitle": "Убрать рекламу", "removeAdsText": "Убери всю рекламу в игре одним платежом.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Сложность: {name}", "diffTitle": "Сложность", "diffText": "Выбери, насколько жёстким будет с тобой рассказчик. Это меняет скорость дротиков, платформ и ворот на всех уровнях.", "diffEasy": "Легко", "diffMedium": "Средне", "diffHard": "Сложно", "diffExtreme": "Экстрим", "levelReward": "+{n} монет", "lockedPrev": "Сначала пройди предыдущий уровень.", "skipLevel": "⏭ Пропустить · {p} монет", "skipTitle": "Пропустить этот уровень?", "skipText": "Заплати {p} монет и переходи к следующему уровню.\nУ тебя {c} монет.", "buyYes": "Купить · {p} монет", "cancel": "Отмена", "notEnoughCoins": "Не хватает {n} монет. За каждый пройденный уровень ты получаешь 10.", "unlockTitle": "Открыть уровень {n}?", "unlockText": "Стоит {p} монет.\nУ тебя {c} монет.", "levelUnlocked": "Уровень {n} открыт!", "skinLockedLevel": "Уровень {n}", "skinNeedLevel": "Дойди до уровня {n}, чтобы купить этого персонажа.", "newSkin": "Новый персонаж в магазине: {name}!"});
Object.assign(STR.ja,{"optionsBtn": "⚙️ オプション", "resumeGame": "ゲームに戻る", "mainMenu": "メインメニュー", "optionsTitle": "オプション", "optionsText": "ゲームの音と振動を調整します。", "soundLabel": "🔊 サウンド: {state}", "vibrationLabel": "📳 振動: {state}", "narratorVoiceLabel": "🗣 ナレーター音声: {state}", "levelsBtn": "💎 ステージ", "levelsTitle": "ステージ", "levelsText": "進行状況: {done}/{total}", "tabSkins": "キャラクター", "tabGold": "コイン", "tabDia": "ダイヤ", "tabFree": "無料", "more": "もっと見る", "bestValue": "お得No.1", "needMore": "残高が足りません。", "equip": "装備", "equipped": "✓ 装備中", "watchAd": "広告を見る", "watchAdSub": "無料コイン", "watchBtn": "視聴 = +{n}コイン", "adsTitle": "広告", "removeAdsBtn": "広告を削除", "adLoading": "広告を表示中…", "coinsWord": "コイン", "diffShort": "難易度: {name}", "levelLocked": "🔒", "playBtn": "プレイ", "prevPage": "前へ", "nextPage": "次へ", "shopBuyCoins": "💰 コインを買う", "buyCoinsTitle": "コインを買う", "buyCoinsText": "ジェムのパックを選んでください。", "coinsTier": "💎 {n}ジェム — {price}", "payBtn": "支払う", "removeAdsTitle": "広告を削除", "removeAdsText": "1回の支払いで、ゲーム内の広告をすべて削除します。", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 難易度: {name}", "diffTitle": "難易度", "diffText": "ナレーターにどれだけ厳しくしてもらうか選んでください。全ステージのダーツ、足場、ゲートの速さが変わります。", "diffEasy": "かんたん", "diffMedium": "ふつう", "diffHard": "むずかしい", "diffExtreme": "エクストリーム", "levelReward": "+{n}コイン", "lockedPrev": "先に前のステージをクリアしてください。", "skipLevel": "⏭ ステージをスキップ · {p}コイン", "skipTitle": "このステージをスキップ？", "skipText": "{p}コインを払って次のステージへ進みます。\n所持コイン: {c}", "buyYes": "購入 · {p}コイン", "cancel": "キャンセル", "notEnoughCoins": "あと{n}コイン必要です。ステージをクリアするたびに10コインもらえます。", "unlockTitle": "ステージ{n}を解放する？", "unlockText": "{p}コインかかります。\n所持コイン: {c}", "levelUnlocked": "ステージ{n}を解放しました！", "skinLockedLevel": "ステージ{n}", "skinNeedLevel": "このキャラクターを買うには、ステージ{n}に到達してください。", "newSkin": "ショップに新キャラクター登場: {name}！"});
Object.assign(STR.zh,{"optionsBtn": "⚙️ 选项", "resumeGame": "返回游戏", "mainMenu": "主菜单", "optionsTitle": "选项", "optionsText": "调整游戏的音效和震动。", "soundLabel": "🔊 声音：{state}", "vibrationLabel": "📳 震动：{state}", "narratorVoiceLabel": "🗣 旁白语音：{state}", "levelsBtn": "💎 关卡", "levelsTitle": "关卡", "levelsText": "进度：{done}/{total}", "tabSkins": "角色", "tabGold": "金币", "tabDia": "钻石", "tabFree": "免费", "more": "更多", "bestValue": "超值之选", "needMore": "余额不足。", "equip": "装备", "equipped": "✓ 已装备", "watchAd": "观看广告", "watchAdSub": "免费金币", "watchBtn": "观看 = +{n}金币", "adsTitle": "广告", "removeAdsBtn": "移除广告", "adLoading": "正在播放广告…", "coinsWord": "金币", "diffShort": "难度：{name}", "levelLocked": "🔒", "playBtn": "开始", "prevPage": "上一页", "nextPage": "下一页", "shopBuyCoins": "💰 购买金币", "buyCoinsTitle": "购买金币", "buyCoinsText": "选择一个宝石包。", "coinsTier": "💎 {n}宝石 — {price}", "payBtn": "支付", "removeAdsTitle": "移除广告", "removeAdsText": "一次付费，移除游戏中的所有广告。", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 难度：{name}", "diffTitle": "难度", "diffText": "选择旁白对你有多严厉。这会调整所有关卡中飞镖、平台和闸门的速度。", "diffEasy": "简单", "diffMedium": "中等", "diffHard": "困难", "diffExtreme": "极限", "levelReward": "+{n}金币", "lockedPrev": "请先通过上一关。", "skipLevel": "⏭ 跳过关卡 · {p}金币", "skipTitle": "跳过这一关？", "skipText": "支付{p}金币，直接进入下一关。\n你有{c}金币。", "buyYes": "购买 · {p}金币", "cancel": "取消", "notEnoughCoins": "还差{n}金币。每通过一关可获得10金币。", "unlockTitle": "解锁第{n}关？", "unlockText": "需要{p}金币。\n你有{c}金币。", "levelUnlocked": "第{n}关已解锁！", "skinLockedLevel": "第{n}关", "skinNeedLevel": "到达第{n}关后才能购买此角色。", "newSkin": "商店上新角色：{name}！"});
Object.assign(STR.hi,{"optionsBtn": "⚙️ विकल्प", "resumeGame": "खेल पर लौटें", "mainMenu": "मुख्य मेनू", "optionsTitle": "विकल्प", "optionsText": "खेल की आवाज़ और कंपन समायोजित करें।", "soundLabel": "🔊 ध्वनि: {state}", "vibrationLabel": "📳 कंपन: {state}", "narratorVoiceLabel": "🗣 narrator की आवाज़: {state}", "levelsBtn": "💎 स्तर", "levelsTitle": "स्तर", "levelsText": "प्रगति: {done}/{total}", "tabSkins": "किरदार", "tabGold": "सोना", "tabDia": "हीरे", "tabFree": "मुफ़्त", "more": "और", "bestValue": "सबसे बढ़िया ऑफ़र", "needMore": "बैलेंस काफ़ी नहीं है।", "equip": "पहनें", "equipped": "✓ पहना हुआ", "watchAd": "विज्ञापन देखें", "watchAdSub": "मुफ़्त सिक्के", "watchBtn": "देखें = +{n} सिक्के", "adsTitle": "विज्ञापन", "removeAdsBtn": "विज्ञापन हटाएँ", "adLoading": "विज्ञापन दिखाया जा रहा है…", "coinsWord": "सिक्के", "diffShort": "कठिनाई: {name}", "levelLocked": "🔒", "playBtn": "खेलें", "prevPage": "पिछला", "nextPage": "अगला", "shopBuyCoins": "💰 सिक्के खरीदें", "buyCoinsTitle": "सिक्के खरीदें", "buyCoinsText": "जेम्स का एक पैक चुनें।", "coinsTier": "💎 {n} जेम्स — {price}", "payBtn": "भुगतान", "removeAdsTitle": "विज्ञापन हटाएँ", "removeAdsText": "एक बार भुगतान करके खेल के सारे विज्ञापन हटाएँ।", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 कठिनाई: {name}", "diffTitle": "कठिनाई", "diffText": "चुनें कि narrator आपके साथ कितना सख़्त हो। इससे सभी स्तरों में डार्ट, प्लेटफ़ॉर्म और गेट की गति बदलती है।", "diffEasy": "आसान", "diffMedium": "मध्यम", "diffHard": "कठिन", "diffExtreme": "बेहद कठिन", "levelReward": "+{n} सिक्के", "lockedPrev": "पहले पिछला स्तर पार करें।", "skipLevel": "⏭ स्तर छोड़ें · {p} सिक्के", "skipTitle": "यह स्तर छोड़ें?", "skipText": "{p} सिक्के देकर अगले स्तर पर जाएँ।\nआपके पास {c} सिक्के हैं।", "buyYes": "खरीदें · {p} सिक्के", "cancel": "रद्द करें", "notEnoughCoins": "{n} सिक्के और चाहिए। हर पार किए स्तर पर आपको 10 मिलते हैं।", "unlockTitle": "स्तर {n} अनलॉक करें?", "unlockText": "इसकी कीमत {p} सिक्के है।\nआपके पास {c} सिक्के हैं।", "levelUnlocked": "स्तर {n} अनलॉक हो गया!", "skinLockedLevel": "स्तर {n}", "skinNeedLevel": "यह किरदार खरीदने के लिए स्तर {n} तक पहुँचें।", "newSkin": "शॉप में नया किरदार आया: {name}!"});
Object.assign(STR.ar,{"optionsBtn": "⚙️ الخيارات", "resumeGame": "العودة إلى اللعبة", "mainMenu": "القائمة الرئيسية", "optionsTitle": "الخيارات", "optionsText": "اضبط صوت اللعبة والاهتزاز.", "soundLabel": "🔊 الصوت: {state}", "vibrationLabel": "📳 الاهتزاز: {state}", "narratorVoiceLabel": "🗣 صوت الراوي: {state}", "levelsBtn": "💎 المراحل", "levelsTitle": "المراحل", "levelsText": "التقدم: {done}/{total}", "tabSkins": "الشخصيات", "tabGold": "الذهب", "tabDia": "الألماس", "tabFree": "مجاني", "more": "المزيد", "bestValue": "أفضل عرض", "needMore": "الرصيد غير كافٍ.", "equip": "تجهيز", "equipped": "✓ مجهّز", "watchAd": "شاهد إعلانًا", "watchAdSub": "عملات مجانية", "watchBtn": "شاهد = +{n} عملة", "adsTitle": "الإعلانات", "removeAdsBtn": "إزالة الإعلانات", "adLoading": "جارٍ عرض الإعلان…", "coinsWord": "عملات", "diffShort": "الصعوبة: {name}", "levelLocked": "🔒", "playBtn": "العب", "prevPage": "السابق", "nextPage": "التالي", "shopBuyCoins": "💰 شراء عملات", "buyCoinsTitle": "شراء عملات", "buyCoinsText": "اختر حزمة جواهر.", "coinsTier": "💎 {n} جوهرة — {price}", "payBtn": "ادفع", "removeAdsTitle": "إزالة الإعلانات", "removeAdsText": "أزل كل إعلانات اللعبة بدفعة واحدة.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 الصعوبة: {name}", "diffTitle": "الصعوبة", "diffText": "اختر مدى قسوة الراوي معك. هذا يضبط سرعة الأسهم والمنصات والبوابات في كل المراحل.", "diffEasy": "سهل", "diffMedium": "متوسط", "diffHard": "صعب", "diffExtreme": "متطرف", "levelReward": "+{n} عملة", "lockedPrev": "اجتز المرحلة السابقة أولًا.", "skipLevel": "⏭ تخطي المرحلة · {p} عملة", "skipTitle": "تخطي هذه المرحلة؟", "skipText": "تدفع {p} عملة وتنتقل إلى المرحلة التالية.\nلديك {c} عملة.", "buyYes": "شراء · {p} عملة", "cancel": "إلغاء", "notEnoughCoins": "ينقصك {n} عملة. تكسب 10 عملات عن كل مرحلة تجتازها.", "unlockTitle": "فتح المرحلة {n}؟", "unlockText": "تكلفتها {p} عملة.\nلديك {c} عملة.", "levelUnlocked": "تم فتح المرحلة {n}!", "skinLockedLevel": "المرحلة {n}", "skinNeedLevel": "صل إلى المرحلة {n} لتتمكن من شراء هذه الشخصية.", "newSkin": "شخصية جديدة في المتجر: {name}!"});
Object.assign(STR.id,{"optionsBtn": "⚙️ Opsi", "resumeGame": "Kembali ke game", "mainMenu": "Menu utama", "optionsTitle": "Opsi", "optionsText": "Atur suara dan getaran game.", "soundLabel": "🔊 Suara: {state}", "vibrationLabel": "📳 Getaran: {state}", "narratorVoiceLabel": "🗣 Suara narator: {state}", "levelsBtn": "💎 Level", "levelsTitle": "Level", "levelsText": "Progres: {done}/{total}", "tabSkins": "KARAKTER", "tabGold": "EMAS", "tabDia": "BERLIAN", "tabFree": "GRATIS", "more": "lainnya", "bestValue": "PENAWARAN TERBAIK", "needMore": "Saldo tidak cukup.", "equip": "PASANG", "equipped": "✓ DIPASANG", "watchAd": "TONTON IKLAN", "watchAdSub": "koin gratis", "watchBtn": "Tonton = +{n} koin", "adsTitle": "IKLAN", "removeAdsBtn": "Hapus iklan", "adLoading": "Menampilkan iklan…", "coinsWord": "koin", "diffShort": "Kesulitan: {name}", "levelLocked": "🔒", "playBtn": "Main", "prevPage": "Sebelumnya", "nextPage": "Berikutnya", "shopBuyCoins": "💰 Beli koin", "buyCoinsTitle": "Beli koin", "buyCoinsText": "Pilih paket permata.", "coinsTier": "💎 {n} permata — {price}", "payBtn": "BAYAR", "removeAdsTitle": "Hapus iklan", "removeAdsText": "Hapus semua iklan di game dengan sekali bayar.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Kesulitan: {name}", "diffTitle": "Kesulitan", "diffText": "Pilih seberapa kejam narator padamu. Ini mengatur kecepatan panah, platform, dan gerbang di semua level.", "diffEasy": "Mudah", "diffMedium": "Sedang", "diffHard": "Sulit", "diffExtreme": "Ekstrem", "levelReward": "+{n} koin", "lockedPrev": "Selesaikan level sebelumnya dulu.", "skipLevel": "⏭ Lewati level · {p} koin", "skipTitle": "Lewati level ini?", "skipText": "Bayar {p} koin dan lanjut ke level berikutnya.\nKamu punya {c} koin.", "buyYes": "Beli · {p} koin", "cancel": "Batal", "notEnoughCoins": "Kurang {n} koin. Kamu dapat 10 koin setiap menyelesaikan level.", "unlockTitle": "Buka level {n}?", "unlockText": "Harganya {p} koin.\nKamu punya {c} koin.", "levelUnlocked": "Level {n} terbuka!", "skinLockedLevel": "Level {n}", "skinNeedLevel": "Capai level {n} untuk bisa membeli karakter ini.", "newSkin": "Karakter baru tersedia di toko: {name}!"});
Object.assign(STR.bn,{"optionsBtn": "⚙️ অপশন", "resumeGame": "খেলায় ফিরুন", "mainMenu": "প্রধান মেনু", "optionsTitle": "অপশন", "optionsText": "গেমের শব্দ ও ভাইব্রেশন ঠিক করুন।", "soundLabel": "🔊 শব্দ: {state}", "vibrationLabel": "📳 ভাইব্রেশন: {state}", "narratorVoiceLabel": "🗣 ন্যারেটরের কণ্ঠ: {state}", "levelsBtn": "💎 লেভেল", "levelsTitle": "লেভেল", "levelsText": "অগ্রগতি: {done}/{total}", "tabSkins": "চরিত্র", "tabGold": "সোনা", "tabDia": "হীরা", "tabFree": "বিনামূল্যে", "more": "আরও", "bestValue": "সেরা অফার", "needMore": "ব্যালেন্স যথেষ্ট নয়।", "equip": "পরুন", "equipped": "✓ পরা আছে", "watchAd": "বিজ্ঞাপন দেখুন", "watchAdSub": "বিনামূল্যে কয়েন", "watchBtn": "দেখুন = +{n} কয়েন", "adsTitle": "বিজ্ঞাপন", "removeAdsBtn": "বিজ্ঞাপন সরান", "adLoading": "বিজ্ঞাপন দেখানো হচ্ছে…", "coinsWord": "কয়েন", "diffShort": "কঠিনতা: {name}", "levelLocked": "🔒", "playBtn": "খেলুন", "prevPage": "আগের", "nextPage": "পরের", "shopBuyCoins": "💰 কয়েন কিনুন", "buyCoinsTitle": "কয়েন কিনুন", "buyCoinsText": "একটি জেমের প্যাক বেছে নিন।", "coinsTier": "💎 {n} জেম — {price}", "payBtn": "পেমেন্ট", "removeAdsTitle": "বিজ্ঞাপন সরান", "removeAdsText": "একবার পেমেন্ট করে গেমের সব বিজ্ঞাপন সরিয়ে ফেলুন।", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 কঠিনতা: {name}", "diffTitle": "কঠিনতা", "diffText": "ন্যারেটর আপনার প্রতি কতটা কঠোর হবে তা বেছে নিন। এতে সব লেভেলে ডার্ট, প্ল্যাটফর্ম ও গেটের গতি বদলায়।", "diffEasy": "সহজ", "diffMedium": "মাঝারি", "diffHard": "কঠিন", "diffExtreme": "চরম", "levelReward": "+{n} কয়েন", "lockedPrev": "আগে আগের লেভেলটি পার করুন।", "skipLevel": "⏭ লেভেল এড়ান · {p} কয়েন", "skipTitle": "এই লেভেল এড়াবেন?", "skipText": "{p} কয়েন দিয়ে পরের লেভেলে যান।\nআপনার কাছে {c} কয়েন আছে।", "buyYes": "কিনুন · {p} কয়েন", "cancel": "বাতিল", "notEnoughCoins": "আরও {n} কয়েন লাগবে। প্রতিটি লেভেল পার করলে ১০ কয়েন পাবেন।", "unlockTitle": "লেভেল {n} আনলক করবেন?", "unlockText": "এর দাম {p} কয়েন।\nআপনার কাছে {c} কয়েন আছে।", "levelUnlocked": "লেভেল {n} আনলক হয়েছে!", "skinLockedLevel": "লেভেল {n}", "skinNeedLevel": "এই চরিত্র কিনতে লেভেল {n}-এ পৌঁছান।", "newSkin": "শপে নতুন চরিত্র এসেছে: {name}!"});
STR.it={"appTitle": "Il Narratore Mente", "appSubtitle": "Il narratore ti guida fino alla porta di ogni livello. Fidati di lui. O no.", "continueBtn": "Continua (livello {n} di {total})", "newGame": "Nuova partita", "play": "Gioca", "dailyDone": "📅 Sfida Giornaliera (fatta oggi · serie {streak})", "dailyPlain": "📅 Sfida Giornaliera", "streakSuffix": " (serie {streak})", "endlessPlain": "♾ Modalità Infinita", "endlessBestSuffix": " (record {best})", "voiceOn": "attiva", "voiceOff": "disattivata", "voiceLabel": "Voce del narratore: {state}", "charactersBtn": "🧍 Personaggi ({name})", "shopBtn": "🛍 Negozio (💎 {gems})", "langBtn": "🌐 Lingua: {name}", "back": "Indietro", "shopTitle": "Negozio", "shopRemoveAds": "💳 Rimuovi annunci (pagamento unico)", "shopAdsRemoved": "✓ Annunci rimossi. Grazie.", "shopRestore": "🔄 Ripristina acquisti", "shopText": "Hai 💎 {gems} gemme, guadagnate guardando annunci.\n\nI personaggi si comprano con le gemme in 🧍 Personaggi, qui nel negozio, o tutti in una volta con denaro vero.", "skinsTitle": "Personaggi", "skinsUnlockAll": "💳 Sblocca tutti — pagamento unico", "skinsEquipped": "✓ {name} (equipaggiato)", "skinsEquip": "Equipaggia: {name}", "skinsLocked": "🔒 {name} — 💎 {price}", "skinsText": "💎 {gems} gemme. Scegli chi vuoi essere. Compra le skin con le gemme guadagnate guardando annunci, o sblocca tutto in una volta con denaro vero.", "langTitle": "Lingua", "langText": "Scegli la lingua del gioco.", "optionsBtn": "⚙️ Opzioni", "resumeGame": "Torna al gioco", "mainMenu": "Menu principale", "optionsTitle": "Opzioni", "optionsText": "Regola l'audio e la vibrazione del gioco.", "soundLabel": "🔊 Audio: {state}", "vibrationLabel": "📳 Vibrazione: {state}", "narratorVoiceLabel": "🗣 Voce del narratore: {state}", "levelsBtn": "💎 Livelli", "levelsTitle": "Livelli", "levelsText": "Progresso: {done}/{total}", "tabSkins": "PERSONAGGI", "tabGold": "ORO", "tabDia": "DIAMANTI", "tabFree": "GRATIS", "more": "altro", "bestValue": "MIGLIOR OFFERTA", "needMore": "Saldo insufficiente.", "equip": "EQUIPAGGIA", "equipped": "✓ EQUIPAGGIATO", "watchAd": "GUARDA UN ANNUNCIO", "watchAdSub": "monete gratis", "watchBtn": "Guarda = +{n} monete", "adsTitle": "PUBBLICITÀ", "removeAdsBtn": "Rimuovi pubblicità", "adLoading": "Annuncio in corso…", "coinsWord": "monete", "diffShort": "Difficoltà: {name}", "levelLocked": "🔒", "playBtn": "Gioca", "prevPage": "Indietro", "nextPage": "Avanti", "shopBuyCoins": "💰 Compra monete", "buyCoinsTitle": "Compra monete", "buyCoinsText": "Scegli un pacchetto di gemme.", "coinsTier": "💎 {n} gemme — {price}", "payBtn": "PAGA", "removeAdsTitle": "Rimuovi gli annunci", "removeAdsText": "Rimuove tutti gli annunci dal gioco con un pagamento unico.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Difficoltà: {name}", "diffTitle": "Difficoltà", "diffText": "Scegli quanto il narratore deve essere duro con te. Regola la velocità di dardi, piattaforme e cancelli in tutti i livelli.", "diffEasy": "Facile", "diffMedium": "Medio", "diffHard": "Difficile", "diffExtreme": "Estremo", "hudDaily": "Sfida Giornaliera", "hudEndless": "Infinito · livello {n}", "hudDeaths": "morti {n}", "hudShield": "🛡 scudo pronto", "hudInvert": "↔ comandi invertiti", "adPlaying": "📺 Annuncio in corso", "adNote": "(nel gioco finale, qui compare un vero annuncio AdMob)", "shieldAbsorbed": "Lo scudo ha assorbito il colpo. Che fortuna.", "purchaseOnlyStore": "Gli acquisti funzionano solo nella versione installata dal Play Store.", "productNotConfigured": "Questo prodotto non è ancora configurato nello store. Riprova più tardi.", "nothingToRestore": "Niente da ripristinare in questa versione.", "purchasesRestored": "Acquisti ripristinati.", "adWatched": "Annuncio visto. +{g} monete e uno scudo. Prego.", "newRecord": " Nuovo record personale in questo livello!", "levelReward": "+{n} monete", "lockedPrev": "Prima supera il livello precedente.", "skipLevel": "⏭ Salta livello · {p} monete", "skipTitle": "Saltare questo livello?", "skipText": "Paghi {p} monete e passi al livello successivo.\nHai {c} monete.", "buyYes": "Compra · {p} monete", "cancel": "Annulla", "notEnoughCoins": "Ti mancano {n} monete. Ne guadagni 10 per ogni livello superato.", "unlockTitle": "Sbloccare il livello {n}?", "unlockText": "Costa {p} monete.\nHai {c} monete.", "levelUnlocked": "Livello {n} sbloccato!", "skinLockedLevel": "Livello {n}", "skinNeedLevel": "Raggiungi il livello {n} per poter comprare questo personaggio.", "newSkin": "Nuovo personaggio disponibile nel negozio: {name}!"};
STR.tr={"appTitle": "Anlatıcı Yalan Söylüyor", "appSubtitle": "Anlatıcı seni her seviyenin kapısına götürür. Ona güven. Ya da güvenme.", "continueBtn": "Devam et (seviye {n}/{total})", "newGame": "Yeni oyun", "play": "Oyna", "dailyDone": "📅 Günlük Meydan Okuma (bugün bitti · seri {streak})", "dailyPlain": "📅 Günlük Meydan Okuma", "streakSuffix": " (seri {streak})", "endlessPlain": "♾ Sonsuz Mod", "endlessBestSuffix": " (rekor {best})", "voiceOn": "açık", "voiceOff": "kapalı", "voiceLabel": "Anlatıcı sesi: {state}", "charactersBtn": "🧍 Karakterler ({name})", "shopBtn": "🛍 Mağaza (💎 {gems})", "langBtn": "🌐 Dil: {name}", "back": "Geri", "shopTitle": "Mağaza", "shopRemoveAds": "💳 Reklamları kaldır (tek seferlik ödeme)", "shopAdsRemoved": "✓ Reklamlar kaldırıldı. Teşekkürler.", "shopRestore": "🔄 Satın alımları geri yükle", "shopText": "💎 {gems} elmasın var, reklam izleyerek kazandın.\n\nKarakterler, mağazadaki 🧍 Karakterler bölümünden elmasla ya da hepsi birden gerçek parayla alınır.", "skinsTitle": "Karakterler", "skinsUnlockAll": "💳 Hepsini aç — tek seferlik ödeme", "skinsEquipped": "✓ {name} (seçili)", "skinsEquip": "Seç: {name}", "skinsLocked": "🔒 {name} — 💎 {price}", "skinsText": "💎 {gems} elmas. Kim olacağını seç. Reklam izleyerek kazandığın elmaslarla karakter al ya da hepsini gerçek parayla tek seferde aç.", "langTitle": "Dil", "langText": "Oyunun dilini seç.", "optionsBtn": "⚙️ Ayarlar", "resumeGame": "Oyuna dön", "mainMenu": "Ana menü", "optionsTitle": "Ayarlar", "optionsText": "Oyunun sesini ve titreşimini ayarla.", "soundLabel": "🔊 Ses: {state}", "vibrationLabel": "📳 Titreşim: {state}", "narratorVoiceLabel": "🗣 Anlatıcı sesi: {state}", "levelsBtn": "💎 Seviyeler", "levelsTitle": "Seviyeler", "levelsText": "İlerleme: {done}/{total}", "tabSkins": "KARAKTERLER", "tabGold": "ALTIN", "tabDia": "ELMAS", "tabFree": "ÜCRETSİZ", "more": "daha", "bestValue": "EN İYİ FİYAT", "needMore": "Bakiye yetersiz.", "equip": "SEÇ", "equipped": "✓ SEÇİLİ", "watchAd": "REKLAM İZLE", "watchAdSub": "bedava jeton", "watchBtn": "İzle = +{n} jeton", "adsTitle": "REKLAM", "removeAdsBtn": "Reklamları kaldır", "adLoading": "Reklam gösteriliyor…", "coinsWord": "jeton", "diffShort": "Zorluk: {name}", "levelLocked": "🔒", "playBtn": "Oyna", "prevPage": "Önceki", "nextPage": "Sonraki", "shopBuyCoins": "💰 Jeton al", "buyCoinsTitle": "Jeton al", "buyCoinsText": "Bir elmas paketi seç.", "coinsTier": "💎 {n} elmas — {price}", "payBtn": "ÖDE", "removeAdsTitle": "Reklamları kaldır", "removeAdsText": "Tek seferlik ödemeyle oyundaki tüm reklamları kaldır.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Zorluk: {name}", "diffTitle": "Zorluk", "diffText": "Anlatıcının sana ne kadar sert davranacağını seç. Bu, tüm seviyelerde ok, platform ve kapı hızını ayarlar.", "diffEasy": "Kolay", "diffMedium": "Orta", "diffHard": "Zor", "diffExtreme": "Aşırı", "hudDaily": "Günlük Meydan Okuma", "hudEndless": "Sonsuz · seviye {n}", "hudDeaths": "ölüm {n}", "hudShield": "🛡 kalkan hazır", "hudInvert": "↔ kontroller ters", "adPlaying": "📺 Reklam oynuyor", "adNote": "(final oyunda burada gerçek bir AdMob reklamı çıkar)", "shieldAbsorbed": "Kalkan bunu emdi. Şanslısın.", "purchaseOnlyStore": "Satın alımlar yalnızca Play Store'dan yüklenen sürümde çalışır.", "productNotConfigured": "Bu ürün mağazada henüz ayarlanmadı. Sonra tekrar dene.", "nothingToRestore": "Bu sürümde geri yüklenecek bir şey yok.", "purchasesRestored": "Satın alımlar geri yüklendi.", "adWatched": "Reklam izlendi. +{g} jeton ve bir kalkan. Rica ederim.", "newRecord": " Bu seviyede yeni kişisel rekor!", "levelReward": "+{n} jeton", "lockedPrev": "Önce önceki seviyeyi geç.", "skipLevel": "⏭ Seviyeyi atla · {p} jeton", "skipTitle": "Bu seviye atlansın mı?", "skipText": "{p} jeton öde ve sonraki seviyeye geç.\n{c} jetonun var.", "buyYes": "Al · {p} jeton", "cancel": "İptal", "notEnoughCoins": "{n} jeton eksik. Geçtiğin her seviye için 10 kazanırsın.", "unlockTitle": "{n}. seviye açılsın mı?", "unlockText": "Maliyeti {p} jeton.\n{c} jetonun var.", "levelUnlocked": "{n}. seviye açıldı!", "skinLockedLevel": "Seviye {n}", "skinNeedLevel": "Bu karakteri alabilmek için {n}. seviyeye ulaş.", "newSkin": "Mağazada yeni karakter: {name}!"};
STR.ko={"appTitle": "거짓말쟁이 내레이터", "appSubtitle": "내레이터가 각 레벨의 문까지 안내해 줘. 믿어봐. 아니면 말고.", "continueBtn": "이어하기 (레벨 {n}/{total})", "newGame": "새 게임", "play": "플레이", "dailyDone": "📅 일일 도전 (오늘 완료 · 연속 {streak}일)", "dailyPlain": "📅 일일 도전", "streakSuffix": " (연속 {streak}일)", "endlessPlain": "♾ 무한 모드", "endlessBestSuffix": " (최고 {best})", "voiceOn": "켜짐", "voiceOff": "꺼짐", "voiceLabel": "내레이터 음성: {state}", "charactersBtn": "🧍 캐릭터 ({name})", "shopBtn": "🛍 상점 (💎 {gems})", "langBtn": "🌐 언어: {name}", "back": "뒤로", "shopTitle": "상점", "shopRemoveAds": "💳 광고 제거 (1회 결제)", "shopAdsRemoved": "✓ 광고가 제거되었어. 고마워.", "shopRestore": "🔄 구매 복원", "shopText": "💎 {gems}개의 보석이 있어. 광고를 보고 모은 거야.\n\n캐릭터는 상점의 🧍 캐릭터에서 보석으로 사거나, 실제 돈으로 한꺼번에 살 수 있어.", "skinsTitle": "캐릭터", "skinsUnlockAll": "💳 전체 해제 — 1회 결제", "skinsEquipped": "✓ {name} (장착 중)", "skinsEquip": "장착: {name}", "skinsLocked": "🔒 {name} — 💎 {price}", "skinsText": "💎 보석 {gems}개. 누가 될지 골라봐. 광고를 보고 모은 보석으로 스킨을 사거나, 실제 돈으로 전부 한 번에 해제할 수 있어.", "langTitle": "언어", "langText": "게임 언어를 선택해.", "optionsBtn": "⚙️ 설정", "resumeGame": "게임으로 돌아가기", "mainMenu": "메인 메뉴", "optionsTitle": "설정", "optionsText": "게임의 소리와 진동을 조절해.", "soundLabel": "🔊 소리: {state}", "vibrationLabel": "📳 진동: {state}", "narratorVoiceLabel": "🗣 내레이터 음성: {state}", "levelsBtn": "💎 레벨", "levelsTitle": "레벨", "levelsText": "진행도: {done}/{total}", "tabSkins": "캐릭터", "tabGold": "골드", "tabDia": "다이아", "tabFree": "무료", "more": "더보기", "bestValue": "최고 혜택", "needMore": "잔액이 부족해.", "equip": "장착", "equipped": "✓ 장착됨", "watchAd": "광고 보기", "watchAdSub": "무료 코인", "watchBtn": "시청 = +{n} 코인", "adsTitle": "광고", "removeAdsBtn": "광고 제거", "adLoading": "광고 표시 중…", "coinsWord": "코인", "diffShort": "난이도: {name}", "levelLocked": "🔒", "playBtn": "플레이", "prevPage": "이전", "nextPage": "다음", "shopBuyCoins": "💰 코인 구매", "buyCoinsTitle": "코인 구매", "buyCoinsText": "보석 팩을 골라봐.", "coinsTier": "💎 보석 {n}개 — {price}", "payBtn": "결제", "removeAdsTitle": "광고 제거", "removeAdsText": "1회 결제로 게임의 모든 광고를 제거해.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 난이도: {name}", "diffTitle": "난이도", "diffText": "내레이터가 너에게 얼마나 가혹할지 골라봐. 모든 레벨의 화살, 발판, 문 속도가 조절돼.", "diffEasy": "쉬움", "diffMedium": "보통", "diffHard": "어려움", "diffExtreme": "극한", "hudDaily": "일일 도전", "hudEndless": "무한 · 레벨 {n}", "hudDeaths": "죽음 {n}", "hudShield": "🛡 방어막 준비됨", "hudInvert": "↔ 조작 반전", "adPlaying": "📺 광고 재생 중", "adNote": "(최종 게임에서는 여기에 실제 AdMob 광고가 나와)", "shieldAbsorbed": "방어막이 막아줬어. 운 좋네.", "purchaseOnlyStore": "구매는 Play 스토어에서 설치한 버전에서만 가능해.", "productNotConfigured": "이 상품은 아직 스토어에 설정되지 않았어. 나중에 다시 시도해봐.", "nothingToRestore": "이 버전에는 복원할 것이 없어.", "purchasesRestored": "구매가 복원되었어.", "adWatched": "광고 시청 완료. +{g} 코인과 방어막. 천만에.", "newRecord": " 이 레벨 개인 신기록!", "levelReward": "+{n} 코인", "lockedPrev": "먼저 이전 레벨을 클리어해.", "skipLevel": "⏭ 레벨 건너뛰기 · {p} 코인", "skipTitle": "이 레벨을 건너뛸까?", "skipText": "{p} 코인을 내고 다음 레벨로 넘어가.\n현재 {c} 코인이 있어.", "buyYes": "구매 · {p} 코인", "cancel": "취소", "notEnoughCoins": "{n} 코인이 부족해. 레벨을 클리어할 때마다 10 코인을 얻어.", "unlockTitle": "레벨 {n}을(를) 열까?", "unlockText": "비용은 {p} 코인.\n현재 {c} 코인이 있어.", "levelUnlocked": "레벨 {n} 해제!", "skinLockedLevel": "레벨 {n}", "skinNeedLevel": "이 캐릭터를 사려면 레벨 {n}에 도달해야 해.", "newSkin": "상점에 새 캐릭터가 나왔어: {name}!"};
STR.vi={"appTitle": "Người Kể Chuyện Nói Dối", "appSubtitle": "Người kể chuyện dẫn bạn đến cánh cửa của mỗi màn. Cứ tin ổng đi. Hoặc đừng.", "continueBtn": "Tiếp tục (màn {n}/{total})", "newGame": "Chơi mới", "play": "Chơi", "dailyDone": "📅 Thử thách hằng ngày (xong hôm nay · chuỗi {streak})", "dailyPlain": "📅 Thử thách hằng ngày", "streakSuffix": " (chuỗi {streak})", "endlessPlain": "♾ Chế độ vô tận", "endlessBestSuffix": " (kỷ lục {best})", "voiceOn": "bật", "voiceOff": "tắt", "voiceLabel": "Giọng người kể: {state}", "charactersBtn": "🧍 Nhân vật ({name})", "shopBtn": "🛍 Cửa hàng (💎 {gems})", "langBtn": "🌐 Ngôn ngữ: {name}", "back": "Quay lại", "shopTitle": "Cửa hàng", "shopRemoveAds": "💳 Xóa quảng cáo (trả một lần)", "shopAdsRemoved": "✓ Đã xóa quảng cáo. Cảm ơn bạn.", "shopRestore": "🔄 Khôi phục giao dịch", "shopText": "Bạn có 💎 {gems} gem, kiếm được nhờ xem quảng cáo.\n\nNhân vật được mua bằng gem trong 🧍 Nhân vật ngay tại cửa hàng, hoặc mua hết một lần bằng tiền thật.", "skinsTitle": "Nhân vật", "skinsUnlockAll": "💳 Mở khóa tất cả — trả một lần", "skinsEquipped": "✓ {name} (đang dùng)", "skinsEquip": "Dùng: {name}", "skinsLocked": "🔒 {name} — 💎 {price}", "skinsText": "💎 {gems} gem. Chọn xem bạn sẽ là ai. Mua skin bằng gem kiếm từ xem quảng cáo, hoặc mở khóa hết một lần bằng tiền thật.", "langTitle": "Ngôn ngữ", "langText": "Chọn ngôn ngữ của game.", "optionsBtn": "⚙️ Cài đặt", "resumeGame": "Quay lại game", "mainMenu": "Menu chính", "optionsTitle": "Cài đặt", "optionsText": "Chỉnh âm thanh và rung của game.", "soundLabel": "🔊 Âm thanh: {state}", "vibrationLabel": "📳 Rung: {state}", "narratorVoiceLabel": "🗣 Giọng người kể: {state}", "levelsBtn": "💎 Màn chơi", "levelsTitle": "Màn chơi", "levelsText": "Tiến độ: {done}/{total}", "tabSkins": "NHÂN VẬT", "tabGold": "VÀNG", "tabDia": "KIM CƯƠNG", "tabFree": "MIỄN PHÍ", "more": "thêm", "bestValue": "ƯU ĐÃI NHẤT", "needMore": "Không đủ số dư.", "equip": "DÙNG", "equipped": "✓ ĐANG DÙNG", "watchAd": "XEM QUẢNG CÁO", "watchAdSub": "xu miễn phí", "watchBtn": "Xem = +{n} xu", "adsTitle": "QUẢNG CÁO", "removeAdsBtn": "Xóa quảng cáo", "adLoading": "Đang chiếu quảng cáo…", "coinsWord": "xu", "diffShort": "Độ khó: {name}", "levelLocked": "🔒", "playBtn": "Chơi", "prevPage": "Trước", "nextPage": "Sau", "shopBuyCoins": "💰 Mua xu", "buyCoinsTitle": "Mua xu", "buyCoinsText": "Chọn một gói gem.", "coinsTier": "💎 {n} gem — {price}", "payBtn": "THANH TOÁN", "removeAdsTitle": "Xóa quảng cáo", "removeAdsText": "Xóa toàn bộ quảng cáo trong game với một lần thanh toán.", "removeAdsPrice": "2,99 €", "diffBtn": "🎯 Độ khó: {name}", "diffTitle": "Độ khó", "diffText": "Chọn xem người kể chuyện sẽ khắt khe với bạn đến đâu. Việc này chỉnh tốc độ phi tiêu, bục và cổng ở mọi màn.", "diffEasy": "Dễ", "diffMedium": "Vừa", "diffHard": "Khó", "diffExtreme": "Cực khó", "hudDaily": "Thử thách hằng ngày", "hudEndless": "Vô tận · màn {n}", "hudDeaths": "chết {n}", "hudShield": "🛡 khiên sẵn sàng", "hudInvert": "↔ điều khiển bị đảo", "adPlaying": "📺 Đang chiếu quảng cáo", "adNote": "(trong game chính thức, quảng cáo AdMob thật sẽ hiện ở đây)", "shieldAbsorbed": "Khiên đã đỡ cú đó. May cho bạn.", "purchaseOnlyStore": "Giao dịch chỉ hoạt động trên bản cài từ Play Store.", "productNotConfigured": "Sản phẩm này chưa được cài đặt trên cửa hàng. Thử lại sau nhé.", "nothingToRestore": "Không có gì để khôi phục ở bản này.", "purchasesRestored": "Đã khôi phục giao dịch.", "adWatched": "Đã xem quảng cáo. +{g} xu và một chiếc khiên. Không có chi.", "newRecord": " Kỷ lục cá nhân mới ở màn này!", "levelReward": "+{n} xu", "lockedPrev": "Hãy qua màn trước đã.", "skipLevel": "⏭ Bỏ qua màn · {p} xu", "skipTitle": "Bỏ qua màn này?", "skipText": "Trả {p} xu để qua màn tiếp theo.\nBạn có {c} xu.", "buyYes": "Mua · {p} xu", "cancel": "Hủy", "notEnoughCoins": "Còn thiếu {n} xu. Mỗi màn vượt qua bạn nhận 10 xu.", "unlockTitle": "Mở khóa màn {n}?", "unlockText": "Giá {p} xu.\nBạn có {c} xu.", "levelUnlocked": "Đã mở khóa màn {n}!", "skinLockedLevel": "Màn {n}", "skinNeedLevel": "Đạt màn {n} để mua được nhân vật này.", "newSkin": "Nhân vật mới trong cửa hàng: {name}!"};
const SKIN_NAMES={
 pt:{shadow:"Encapuzado das Sombras",armor:"Armadura-Génio",spider:"Aranha das Vielas",craque10:"Craque Nº10",craque7:"Craque Nº7",craque11:"Craque Nº11",mic:"Lenda do Microfone",ritmo:"Rei do Ritmo",magnata:"Magnata",visionario:"Visionário",mumia:"Múmia",fantasma:"Fantasma",astronauta:"Astronauta",militar:"Militar",hacker:"Hacker",canalizador:"Canalizador",pedreiro:"Pedreiro"},
 en:{shadow:"Shadow Hood",armor:"Genius Armor",spider:"Alley Spider",craque10:"Star #10",craque7:"Star #7",craque11:"Star #11",mic:"Mic Legend",ritmo:"Rhythm King",magnata:"Tycoon",visionario:"Visionary",mumia:"Mummy",fantasma:"Ghost",astronauta:"Astronaut",militar:"Soldier",hacker:"Hacker",canalizador:"Plumber",pedreiro:"Bricklayer"},
 es:{shadow:"Encapuchado de las Sombras",armor:"Armadura Genio",spider:"Araña de los Callejones",craque10:"Crack Nº10",craque7:"Crack Nº7",craque11:"Crack Nº11",mic:"Leyenda del Micrófono",ritmo:"Rey del Ritmo",magnata:"Magnate",visionario:"Visionario",mumia:"Momia",fantasma:"Fantasma",astronauta:"Astronauta",militar:"Militar",hacker:"Hacker",canalizador:"Fontanero",pedreiro:"Albañil"},
 fr:{shadow:"Capuche de l'Ombre",armor:"Armure du Génie",spider:"Araignée des Ruelles",craque10:"Star Nº10",craque7:"Star Nº7",craque11:"Star Nº11",mic:"Légende du Micro",ritmo:"Roi du Rythme",magnata:"Magnat",visionario:"Visionnaire",mumia:"Momie",fantasma:"Fantôme",astronauta:"Astronaute",militar:"Militaire",hacker:"Hacker",canalizador:"Plombier",pedreiro:"Maçon"},
 de:{shadow:"Schattenkapuze",armor:"Genie-Rüstung",spider:"Gassen-Spinne",craque10:"Star Nr.10",craque7:"Star Nr.7",craque11:"Star Nr.11",mic:"Mikrofon-Legende",ritmo:"Rhythmus-König",magnata:"Magnat",visionario:"Visionär",mumia:"Mumie",fantasma:"Geist",astronauta:"Astronaut",militar:"Soldat",hacker:"Hacker",canalizador:"Klempner",pedreiro:"Maurer"},
 ru:{shadow:"Теневой Капюшон",armor:"Броня Гения",spider:"Паук Переулков",craque10:"Звезда №10",craque7:"Звезда №7",craque11:"Звезда №11",mic:"Легенда Микрофона",ritmo:"Король Ритма",magnata:"Магнат",visionario:"Провидец",mumia:"Мумия",fantasma:"Призрак",astronauta:"Космонавт",militar:"Военный",hacker:"Хакер",canalizador:"Сантехник",pedreiro:"Каменщик"},
 ja:{shadow:"影のフード",armor:"天才の鎧",spider:"路地のクモ",craque10:"スター背番号10",craque7:"スター背番号7",craque11:"スター背番号11",mic:"マイクの伝説",ritmo:"リズムの王",magnata:"大富豪",visionario:"ビジョナリー",mumia:"ミイラ",fantasma:"幽霊",astronauta:"宇宙飛行士",militar:"軍人",hacker:"ハッカー",canalizador:"配管工",pedreiro:"石工"},
 zh:{shadow:"暗影兜帽",armor:"天才铠甲",spider:"小巷蜘蛛",craque10:"10号球星",craque7:"7号球星",craque11:"11号球星",mic:"麦克风传奇",ritmo:"节奏之王",magnata:"大亨",visionario:"梦想家",mumia:"木乃伊",fantasma:"幽灵",astronauta:"宇航员",militar:"军人",hacker:"黑客",canalizador:"水管工",pedreiro:"泥瓦匠"},
 hi:{shadow:"छाया हुड",armor:"जीनियस कवच",spider:"गली की मकड़ी",craque10:"स्टार नंबर 10",craque7:"स्टार नंबर 7",craque11:"स्टार नंबर 11",mic:"माइक की किंवदंती",ritmo:"ताल का राजा",magnata:"धनकुबेर",visionario:"दूरदर्शी",mumia:"ममी",fantasma:"भूत",astronauta:"अंतरिक्ष यात्री",militar:"सैनिक",hacker:"हैकर",canalizador:"प्लंबर",pedreiro:"राजमिस्त्री"},
 ar:{shadow:"غطاء الظل",armor:"درع العبقري",spider:"عنكبوت الأزقة",craque10:"نجم رقم 10",craque7:"نجم رقم 7",craque11:"نجم رقم 11",mic:"أسطورة الميكروفون",ritmo:"ملك الإيقاع",magnata:"قطب أعمال",visionario:"صاحب رؤية",mumia:"المومياء",fantasma:"الشبح",astronauta:"رائد فضاء",militar:"عسكري",hacker:"هاكر",canalizador:"سباك",pedreiro:"بنّاء"},
 id:{shadow:"Tudung Bayangan",armor:"Zirah Jenius",spider:"Laba-laba Gang",craque10:"Bintang No.10",craque7:"Bintang No.7",craque11:"Bintang No.11",mic:"Legenda Mikrofon",ritmo:"Raja Irama",magnata:"Taipan",visionario:"Visioner",mumia:"Mumi",fantasma:"Hantu",astronauta:"Astronot",militar:"Tentara",hacker:"Peretas",canalizador:"Tukang Ledeng",pedreiro:"Tukang Batu"},
 bn:{shadow:"ছায়া হুড",armor:"জিনিয়াস বর্ম",spider:"গলির মাকড়সা",craque10:"তারকা নং১০",craque7:"তারকা নং৭",craque11:"তারকা নং১১",mic:"মাইক্রোফোনের কিংবদন্তি",ritmo:"ছন্দের রাজা",magnata:"ধনকুবের",visionario:"দূরদর্শী",mumia:"মমি",fantasma:"ভূত",astronauta:"নভোচারী",militar:"সৈনিক",hacker:"হ্যাকার",canalizador:"প্লাম্বার",pedreiro:"রাজমিস্ত্রি"}
};
SKIN_NAMES.it={"shadow": "Ombra Incappucciata", "armor": "Armatura del Genio", "spider": "Ragno dei Vicoli", "craque10": "Fuoriclasse n°10", "craque7": "Fuoriclasse n°7", "craque11": "Fuoriclasse n°11", "mic": "Leggenda del Microfono", "ritmo": "Re del Ritmo", "magnata": "Magnate", "visionario": "Visionario", "mumia": "Mummia", "fantasma": "Fantasma", "astronauta": "Astronauta", "militar": "Soldato", "hacker": "Hacker", "canalizador": "Idraulico", "pedreiro": "Muratore"};
SKIN_NAMES.tr={"shadow": "Gölge Kapüşon", "armor": "Dahi Zırh", "spider": "Sokak Örümceği", "craque10": "Yıldız 10 Numara", "craque7": "Yıldız 7 Numara", "craque11": "Yıldız 11 Numara", "mic": "Mikrofon Efsanesi", "ritmo": "Ritim Kralı", "magnata": "Patron", "visionario": "Vizyoner", "mumia": "Mumya", "fantasma": "Hayalet", "astronauta": "Astronot", "militar": "Asker", "hacker": "Hacker", "canalizador": "Tesisatçı", "pedreiro": "Duvar Ustası"};
SKIN_NAMES.ko={"shadow": "그림자 후드", "armor": "천재 갑옷", "spider": "골목 거미", "craque10": "스타 10번", "craque7": "스타 7번", "craque11": "스타 11번", "mic": "마이크 전설", "ritmo": "리듬의 왕", "magnata": "재벌", "visionario": "선구자", "mumia": "미라", "fantasma": "유령", "astronauta": "우주비행사", "militar": "군인", "hacker": "해커", "canalizador": "배관공", "pedreiro": "벽돌공"};
SKIN_NAMES.vi={"shadow": "Mũ Trùm Bóng Đêm", "armor": "Giáp Thiên Tài", "spider": "Nhện Hẻm", "craque10": "Ngôi Sao Số 10", "craque7": "Ngôi Sao Số 7", "craque11": "Ngôi Sao Số 11", "mic": "Huyền Thoại Mic", "ritmo": "Vua Nhịp Điệu", "magnata": "Đại Gia", "visionario": "Nhà Tiên Phong", "mumia": "Xác Ướp", "fantasma": "Bóng Ma", "astronauta": "Phi Hành Gia", "militar": "Lính", "hacker": "Hacker", "canalizador": "Thợ Ống Nước", "pedreiro": "Thợ Hồ"};
const NARR={en:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"I'm the Narrator. Everything I say is true.",
"Espeto à frente. Salta.":"Spike ahead. Jump.",
"Outro. Salta de novo.":"Another one. Jump again.",
"Já confias em mim. Óptimo.":"You already trust me. Good.",
"A porta é a seguir. Vai.":"The door's next. Go.",
"Buraco à frente. Salta-o.":"Gap ahead. Jump it.",
"Aquele espeto é de enfeite. Passa.":"That spike's just decoration. Walk through.",
"Vês? Eu digo sempre a verdade.":"See? I always tell the truth.",
"Há um espeto escondido à tua frente.":"There's a hidden spike ahead of you.",
"Salta quando eu disser.":"Jump when I say.",
"Agora!":"Now!",
"Sabia que ias conseguir.":"I knew you'd make it.",
"O teto vai cair à tua frente.":"The ceiling's about to fall ahead of you.",
"Quando cair, pára. Depois salta.":"When it falls, stop. Then jump.",
"Não saltes aquele buraco. O chão está lá.":"Don't jump that gap. The floor's there.",
"Este também é falso. Passa.":"This one's fake too. Walk through.",
"Este espeto é inofensivo. Passa.":"This spike is harmless. Walk through.",
"Este também é inofensivo.":"This one's harmless too.",
"O próximo buraco tem chão. Não saltes.":"The next gap has a floor. Don't jump.",
"O teto está baixo. Se saltares, morres.":"The ceiling's low. If you jump, you die.",
"Nem repares nesses espetos. São falsos, os dois.":"Don't even mind those spikes. They're both fake.",
"Confia em mim. Quase sempre resulta.":"Trust me. It works out, almost always.",
"Este nível não tem nada de especial.":"There's nothing special about this level.",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"This time I swear I'm telling the truth: the ceiling's about to fall. Stop and wait.",
"Aquele buraco à frente é real. Vais ter de saltar.":"That gap ahead is real. You'll have to jump it.",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"None of these spikes are dangerous. You can walk right over them.",
"Há duas portas mais à frente. Só uma é verdadeira.":"There are two doors further ahead. Only one is real.",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"Confession: I don't always tell the truth. From now on, be careful.",
"Este espeto é real. Por acaso.":"This spike is real. For once.",
"Nada de perigoso à frente. Podes correr à vontade.":"Nothing dangerous ahead. Run as much as you like.",
"Este nível é uma oferta. Sem armadilhas.":"This level's a gift. No traps.",
"Os buracos são inofensivos. O espeto lá no meio, não.":"The gaps are harmless. The spike in the middle isn't.",
"Como sempre, dois destes espetos são só decoração.":"As always, two of these spikes are just decoration.",
"Vou trocar os teus controlos. Só para rir.":"I'm going to swap your controls. Just for a laugh.",
"Pronto, já passou. A porta é ali.":"There, it's over. The door's right there.",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"I know you don't trust me anymore. Unfair. This time I'm warning you for real: spike ahead.",
"Mais um, logo depois. Também real.":"One more, right after. Also real.",
"Prometo: nunca mais te apanho de surpresa.":"I promise: I'll never catch you off guard again.",
"Atenção real: o teto vai cair aqui à frente.":"Real warning: the ceiling's about to fall up ahead.",
"Aquele espeto lá à frente já não importa. É inofensivo.":"That spike up ahead doesn't matter anymore. It's harmless.",
"Só o último é perigoso, como sempre.":"Only the last one's dangerous, as usual.",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"The nearest door's the real one, for a change.",
"Já não vale a pena mentir mais. Espeto real à frente.":"No point lying anymore. Real spike ahead.",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"I'll always warn you from now on: jump when I say.",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"Last real stretch before the end. You already know not everything I say is true.",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"I don't know why I kept lying for so long. Maybe I liked your face when you died.",
"Este é real. Desculpa por todos os outros.":"This one's real. Sorry about all the others.",
"Mais um, já quase no fim.":"One more, almost at the end.",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"We've reached the end. I'm not going to tell you what's true anymore.",
"A partir de agora, decides tu.":"From now on, you decide.",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"Oh. Still here? Most people quit after the \"end\".",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"That floor shakes before it disappears. Don't linger on it.",
"Oh. Ainda aqui? Não esperava isso.":"Oh. Still here? I wasn't expecting that.",
"Aquilo ali é só decoração. Nem repares.":"That thing there is just decoration. Don't even mind it.",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"But this... this launches you upward. The door's not on the ground this time.",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"Let's try something else. Trust your feet. And a platform that won't sit still.",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"Hop on when it passes close. Don't jump too early.",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"There's a wall there that appears and disappears. It's not a lie, just inconvenient.",
"Espera que abra. Depois atravessa depressa.":"Wait for it to open. Then cross quickly.",
"Aquilo ali dispara. Não perguntes como nem porquê.":"That thing fires. Don't ask how or why.",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"Stay on the ground and don't jump for no reason. You'll pass underneath just fine.",
"De volta aos clássicos. Lembras-te destes?":"Back to the classics. Remember these?",
"O chão vai tremer. Não pares.":"The floor's about to shake. Don't stop.",
"Esse espeto parece a decoração do costume. Não é.":"That spike looks like the usual decoration. It isn't.",
"Mais uma surpresa. Literalmente.":"One more surprise. Literally.",
"A seguir, não penses. Salta para dentro daquilo.":"Next up, don't think. Jump right into that.",
"Outra parede teimosa. E depois, um buraco a sério.":"Another stubborn wall. And after that, a real gap.",
"Espera a parede abrir.":"Wait for the wall to open.",
"Agora salta o buraco. Desta vez não minto: é real.":"Now jump the gap. This time I'm not lying: it's real.",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"New combo: a platform that moves. Trust its rhythm.",
"Sobe quando ela passar perto.":"Hop on when it passes close.",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"Something's about to fly by up there. Don't jump for no reason and nothing will happen to you.",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"Okay. I need to be honest with you for a second. Even I don't know how long this will last.",
"O chão treme outra vez. Não penses demais, só anda.":"The floor's shaking again. Don't overthink it, just walk.",
"Espera a parede. Sei que estás cansado de esperar por mim.":"Wait for the wall. I know you're tired of waiting on me.",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"That spike is for real. Like almost everything I don't tell you.",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"Wait for the wall to open. I'm waiting on something too, as it happens.",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"Listen. I don't know how to say this without sounding strange. I'm afraid you'll give up.",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"Jump this. It's real, I promise. I don't feel like lying today.",
"Confia em mim mais uma vez. Só mais uma.":"Trust me one more time. Just one more.",
"O chão vai tremer. Não penses muito nisso.":"The floor's about to shake. Don't think too hard about it.",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"Know why I lie so much? It gets more interesting when you don't know what's coming.",
"Essa plataforma é a única coisa estável nesta conversa toda.":"That platform's the only stable thing in this whole conversation.",
"Há uma coisa que preciso de te contar antes de continuarmos.":"There's something I need to tell you before we go on.",
"Esquece o que ia dizer. Salta para ali.":"Forget what I was about to say. Jump over there.",
"Aquilo dispara. Fica no chão e não acontece nada.":"That thing fires. Stay on the ground and nothing happens.",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"I miss when there were only spikes. Simple. Predictable.",
"Este buraco, esse sim, exige que saltes.":"This gap, this one, actually needs you to jump.",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"That spike there. Call it whatever you want. It's real.",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"I'm going to tell you something true before the urge to lie comes back: I like having company.",
"A parede vai abrir. Como tudo, eventualmente.":"The wall will open. Like everything, eventually.",
"E o chão... o chão nunca foi de confiança, pois não?":"And the floor... the floor was never trustworthy, was it?",
"Sobe a plataforma. Sem perguntas desta vez.":"Get on the platform. No questions this time.",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"When you were newer at this, I had more patience with you. Now I know you can take more.",
"Última coisa: há algo escondido à frente.":"One last thing: there's something hidden up ahead.",
"Chão instável. O habitual.":"Unstable floor. The usual.",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"Sometimes I wonder what this game would be without the lies. Probably shorter.",
"Aquilo dispara, mas sabes a regra: fica no chão.":"That thing fires, but you know the rule: stay on the ground.",
"Este espeto não tem graça nenhuma. É só perigoso.":"This spike isn't funny at all. It's just dangerous.",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"I need you to trust me to get up there. I know, terrible track record. But trust me.",
"Salta para dentro daquilo.":"Jump into that.",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"Ah, I forgot to mention the spike up there. That part always slips my memory.",
"Espera a parede.":"Wait for the wall.",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"Doors that wait. Platforms that move. It's almost poetry, in my own way.",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"And now, trust the platform. Unlike me, it always keeps schedule.",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"That spike is real. Like most of what I've told you today, actually.",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"We've come further than I ever thought we would, to be honest.",
"O chão treme. Já sabes o resto.":"The floor's shaking. You already know the rest.",
"Vem aí outro susto. Desculpa antecipadamente.":"Another scare's coming. Sorry in advance.",
"E por fim, uma parede paciente. Como tu, aparentemente.":"And finally, a patient wall. Like you, apparently.",
"Fica no chão, foge do dardo.":"Stay on the ground, dodge the dart.",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"New chapter any day now. Today, just a little more chaos.",
"E agora, não te demores no chão instável.":"And now, don't linger on the unstable floor.",
"Esse ali exige mesmo um salto.":"That one really does need a jump.",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"I'll show you a real gap and a spike that isn't even worth looking at.",
"E algo invisível à espreita, como sempre.":"And something invisible lying in wait, as always.",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"Don't even mind that spike there. Pure decoration, for real this time.",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"Trust the platform. Distrust the spike. That's basically the whole game's lesson.",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"That spike is real, despite everything I've told you to the contrary.",
"Esperar. A tua parte preferida, sei bem.":"Waiting. Your favorite part, I know.",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"Wall, dart, gap. A festival of my favorites.",
"Fica no chão aqui.":"Stay on the ground here.",
"E este salta-se mesmo. Sem truques.":"And this one really needs a jump. No tricks.",
"Chão instável, dos teus preferidos a esta altura.":"Unstable floor, one of your favorites by now.",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"Before we move to the next part, and you'll feel the difference: thank you for still listening.",
"Plataforma errante, uma última vez neste capítulo.":"Wandering platform, one last time this chapter.",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"Real spike. No surprises. And no more tricks, for today.",
"Chão instável. Já sabes a dança.":"Unstable floor. You know the dance by now.",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"Sometimes I wonder if I'm the one fooling you, or if you're the one who wants to be fooled.",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"That spike is real. Look at it like a mirror: what you see is what it is.",
"Há algo escondido. Como sempre, de resto.":"There's something hidden. As always, by the way.",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"And a wall that waits. Like me, waiting for an answer from you that never comes.",
"Fica no chão aqui, há algo a voar.":"Stay on the ground here, something's flying by.",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"Do you realize I'm testing you, or do you really think this is just a jumping game?",
"Sobe na plataforma quando ela passar perto.":"Get on the platform when it passes close.",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"That spike is real, but that doesn't surprise you anymore, does it?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"Jump into that. Trust the momentum, not me.",
"Esse buraco é a sério. Salta-o.":"That gap is for real. Jump it.",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"You know what's strange? I've started looking forward to your attempts. That says something bad about me.",
"Este também. Sem rede, sem mentira, sem desculpa.":"This one too. No net, no lie, no excuse.",
"Fica no chão. Deixa o dardo passar por cima.":"Stay on the ground. Let the dart pass overhead.",
"E agora o chão some-se. Não penses, só avança.":"And now the floor vanishes. Don't think, just go.",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"This platform goes up and down. Catch it at the bottom, it's easier.",
"Salta para dentro daquilo. Vais passar por cima do resto.":"Jump into that. You'll sail right over the rest.",
"Aquele espeto nem interessa agora. Já estás no ar.":"That spike doesn't even matter now. You're already airborne.",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"I'll warn you for real: there's something hidden just up ahead.",
"E outro dardo. Sabes a regra.":"And another dart. You know the rule.",
"Chão que treme primeiro.":"Floor shakes first.",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"I like to think that, somewhere, there's a version of me that never lies. Must be boring.",
"Plataforma a seguir. Apanha o ritmo dela.":"Platform's next. Catch its rhythm.",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"I'll be clear, for once: the next three spikes are all real.",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"No tricks, no gotchas. Just this once. Enjoy it, it won't happen again.",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"Wait, then run, then stay still. Contradictory, I know. Just like me.",
"E este buraco não perdoa. Salta.":"And this gap doesn't forgive. Jump.",
"Chão a tremer primeiro, nada de novo.":"Floor shaking first, nothing new.",
"E agora o salto de fé. Literal, desta vez.":"And now the leap of faith. Literal, this time.",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"Unstable floor, real spike, dart at the end. The usual, just more of it.",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"Have you noticed that the further you go, the less I need to lie? The difficulty does my job for me now.",
"Chão a tremer, o costume.":"Floor shaking, the usual.",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"This was supposed to be about lies. It ended up being about the two of us, somehow.",
"Parede paciente, espera por ela.":"Patient wall, wait for it.",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"And the last platform of this chapter. After this, things change. I can feel it.",
"CHÃO. INSTÁVEL.":"FLOOR. UNSTABLE.",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"Sorry. I didn't mean to shout. I'm... I don't know what I am.",
"Fica no chão aqui. Por favor. Só peço isto.":"Stay on the ground here. Please. That's all I'm asking.",
"Espera. Eu também estou à espera de algo que não sei nomear.":"Wait. I'm waiting for something too, something I can't name.",
"Esse buraco é real.":"That gap is real.",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"The further you go, the more I realize I don't want this to end. I don't know what that says about me.",
"E a plataforma, apanha-a.":"And the platform, catch it.",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"Two cannons, opposite directions. Stay on the ground and ignore them.",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"Sometimes I think about stopping the lies for good. Then I think about the silence that would leave. I prefer the chaos.",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"That spike's nothing. I'm not much of anything today either, for that matter.",
"Salta. Sobe. Foge de mim, se quiseres.":"Jump. Climb. Run from me, if you want.",
"O chão, outra vez. Já nem peço desculpa por repetir.":"The floor, again. I won't even apologize for repeating myself anymore.",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"Wait for the wall. I'm always waiting. Always waiting for something.",
"Esse é real. Hoje tudo é real. Até eu, acho.":"That one's real. Everything's real today. Even me, I think.",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"Catch the platform. Don't look down. Me, I can't stop looking.",
"Fica no chão. A sério desta vez, mais do que nunca.":"Stay on the ground. For real this time, more than ever.",
"E agora o chão foge de ti. Irónico, não achas?":"And now the floor runs from you. Ironic, don't you think?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"Floor, spike, wall. All at once, like my head right now.",
"Aquele espeto é real.":"That spike is real.",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"And wait for the wall. Last thing I'll ask of you this level, I promise.",
"Esse buraco não perdoa ninguém.":"That gap doesn't forgive anyone.",
"A plataforma sobe e desce. Apanha-a no fundo.":"The platform rises and falls. Catch it at the bottom.",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"Two surprises are coming. I won't tell you when. I don't have the strength left to pretend I'm being fair.",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"Floor shaking. The only predictable thing I can still offer you.",
"E agora um salto para cima. Foge para onde eu não chego.":"And now a leap upward. Run somewhere I can't reach.",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"Two walls, two different wait times. Like me on different days.",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"This one syncs differently. Pay attention — not to me, to it.",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"This is rock bottom. Mine, at least. Floor shaking, as always.",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"That spike is real. I don't even have the energy to lie about it right now.",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"And a dart, to top it off. Stay on the ground and get this over with, please.",
"Mais um buraco real.":"One more real gap.",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"Thank you for not giving up while I was falling apart. Really. I don't know how to say it better than that.",
"Apanha a plataforma.":"Catch the platform.",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"And wait for the last wall of this chapter. After this, I promise I'll try to be better.",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"I'm going to try something else from now on: only the truth. I know you won't believe it right away.",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"That spike is real. I swear. I know you've heard this before.",
"O chão vai tremer. Verdade, sem truques.":"The floor's about to shake. True, no tricks.",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"This was going to be a nasty surprise. This time it isn't. I promise.",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"Stay on the ground. I know you'll think it's a lie. It isn't.",
"Espera a parede. Só isso. Nada escondido desta vez.":"Wait for the wall. That's it. Nothing hidden this time.",
"Real. Salta.":"Real. Jump.",
"A plataforma também é exatamente o que parece ser.":"The platform's exactly what it looks like too.",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"There's no gotcha this time. Jump into that and you're done.",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"I know you'll be suspicious anyway. That's fine. I earned it.",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"Real. Again. I'll keep saying it until you believe me.",
"Dois dardos, direções opostas. Fica no chão.":"Two darts, opposite directions. Stay on the ground.",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"That one was really real. I wasn't going to hide that from you, not today.",
"Chão instável. Real.":"Unstable floor. Real.",
"Espeto real.":"Real spike.",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"A real wall, opening and closing as agreed. No surprises today.",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"There's a surprise coming, but I'll warn you when it arrives.",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"That one was real, by the way. Like most things, lately.",
"Chão a tremer. Real, verifica à vontade.":"Floor shaking. Real, check for yourself.",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"Leap upward. Also real. I'm running out of ways to say that differently.",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"Two walls. Synced differently, but neither one's hiding anything.",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"The second one's just that: wait. No dart hiding behind it, no spike after. Just the wall.",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"Three things, all real, none hidden. This is the most honest I've ever been in a level.",
"Dardo real. Fica no chão e acabou.":"Real dart. Stay on the ground and that's it.",
"Buraco real, plataforma real.":"Real gap, real platform.",
"Apanha-a.":"Catch it.",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"And the last wall of this chapter. I promise the difficulty ahead isn't about trust. It's just about you and your reflexes.",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"Two spikes, both real, neither hidden. This is how it should have been from the start.",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"You've reached the hundredth. Twenty to go. I'll be here for all of them.",
"De volta ao trabalho. Buraco real.":"Back to work. Real gap.",
"Plataforma mais rápida que antes. Repara.":"Faster platform than before. Notice it.",
"Chão instável, mais rápido a desfazer-se.":"Unstable floor, crumbling faster now.",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"The wall's more impatient too. Everything here got tighter.",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"Three cannons. Stay on the ground the whole time and nothing happens.",
"É basicamente um corredor. Confia nos teus pés.":"It's basically a corridor. Trust your feet.",
"Esse é real.":"That one's real.",
"E este atira-te lá para cima. O de sempre, mais rápido.":"And this one launches you up there. The usual, just faster.",
"Chão a tremer mais depressa que da última vez.":"Floor shaking faster than last time.",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"That spike is real. Or not. I'm back to this game, sorry.",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"Two walls, different rhythms, faster than before.",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"Don't stop to think. Their rhythm doesn't wait for thoughts.",
"Real, como sempre.":"Real, as always.",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"This one rises and falls faster. Catch it at the bottom.",
"Chão, espeto, parede. Tudo mais apertado que antes.":"Floor, spike, wall. Everything tighter than before.",
"Real.":"Real.",
"Espera a parede, mais rápida agora.":"Wait for the wall, faster now.",
"Vêm aí duas surpresas, sem avisos desta vez.":"Two surprises are coming, no warnings this time.",
"Chão a tremer, mais depressa.":"Floor shaking, faster.",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"Leap upward, stronger than usual. Feel the difference.",
"Primeira plataforma: sobe e desce.":"First platform: up and down.",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"Second: moves back and forth. You've seen both now, no need to repeat the rule.",
"Chão, espeto, parede, tudo no mesmo fôlego.":"Floor, spike, wall, all in the same breath.",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"Could be real, could not be. You should be used to the doubt by now.",
"Parede, a última do nível. Rápida.":"Wall, the last one of the level. Fast.",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"Three cannons, different rhythms. Stay on the ground, the rest sorts itself out.",
"Mais um buraco. Plataforma rápida a seguir.":"One more gap. Fast platform next.",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"And the last wall before what comes next. Feel that we're almost there.",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"One lying spike, one honest one. Guess which is which. Good luck, for real this time.",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"Five to go. Just five. After that, I'm not really sure what happens to either of us.",
"Chão a tremer, pela última vez neste tom.":"Floor shaking, for the last time in this tone.",
"Espera a parede. A seguir já não há mais pausas como esta.":"Wait for the wall. After this there won't be any more breaks like this.",
"Fica no chão. Isto já devia ser automático para ti.":"Stay on the ground. This should be automatic for you by now.",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"Real. I don't even need to say it anymore, do I? But I'll say it anyway.",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"That gap is real, but it's the smallest of your problems right now.",
"Esse espeto também é real.":"That spike is real too.",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"And this launches you higher than I ever have before. Last time I do this.",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"Floor, spike, wall. The last three obstacles before whatever this turns out to be.",
"Real. Sem surpresas, não hoje.":"Real. No surprises, not today.",
"Espera a parede. É a última vez que te peço isso.":"Wait for the wall. It's the last time I'll ask that of you.",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"There are no spikes in this level. No gaps, no walls, nothing hidden.",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"I just wanted to walk with you to the end, this time without testing anything.",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"Thank you for continuing after the end I announced myself, ninety levels ago. I didn't know there was more game left in me. Turns out there was.",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"The door up ahead isn't a trick. It's just the door. Go.",
"Muito bem. Sabia que ias conseguir.":"Very good. I knew you'd make it.",
"Perfeito. Continua a ouvir-me.":"Perfect. Keep listening to me.",
"Foste rápido. Gosto disso.":"You were fast. I like that.",
"Estamos a entender-nos.":"We're starting to understand each other.",
"Nada de dramas. Continuemos.":"No drama. Let's keep going.",
"Sobreviveste. Por agora.":"You survived. For now.",
"Confiaste. Ou tiveste sorte.":"You trusted me. Or got lucky.",
"Escolheste bem. Ou eu deixei.":"You chose well. Or I let you.",
"Vês? Sobreviveste na mesma.":"See? You survived anyway.",
"Não avisei. E pronto.":"I didn't warn you. And that's that.",
"Verdade a sério. Desta vez.":"Really true. This time.",
"Sobrevives sempre a este. Curioso.":"You always survive this one. Curious.",
"Confiaste. Mais uma vez.":"You trusted me. Once again.",
"Escolheste bem.":"You chose well.",
"Aprendeste depressa.":"You learned fast.",
"Devias ter parado.":"You should have stopped.",
"Estavas mesmo a acreditar?":"Were you actually believing me?",
"Os buracos nunca mentem. Só eu.":"Gaps never lie. Only I do.",
"Desta vez eram mesmo todos reais.":"This time they really were all real.",
"Foi só uma brincadeira.":"It was just a joke.",
"Vês? Também posso ser sincero.":"See? I can be honest too.",
"Prometi. Não cumpri.":"I promised. I didn't keep it.",
"Dois avisos certos seguidos. Estranho.":"Two correct warnings in a row. Strange.",
"O primeiro. Quem diria.":"The first one. Who would've thought.",
"A porta longe é que importa.":"The far door is the one that matters.",
"Ainda sei dizer a verdade, vês?":"I still know how to tell the truth, see?",
"Chegaste. Contra tudo.":"You made it. Against everything.",
"Obrigado por teres continuado.":"Thank you for continuing.",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"The end. You trusted, you doubted, and you still got here. That's what matters.",
"Continuas a surpreender-me.":"You keep surprising me.",
"Alturas. Quem diria.":"Heights. Who would've thought.",
"Equilíbrio. Quem diria que tinhas.":"Balance. Who knew you had it.",
"Paciência. Não esperava isso de ti.":"Patience. I wasn't expecting that from you.",
"Reflexos decentes. Para um humano.":"Decent reflexes. For a human.",
"Ainda tens os reflexos todos.":"You've still got all your reflexes.",
"Dois sustos seguidos. Nada mau.":"Two scares in a row. Not bad.",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"Two obstacles, zero lies. Strangely simple.",
"Isso foi... impressionantemente coordenado.":"That was... impressively coordinated.",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"Something's changing in me. I don't know if that's a good sign.",
"Ainda aqui. Obrigado por isso.":"Still here. Thank you for that.",
"Às vezes a verdade é só isto: continuaste.":"Sometimes the truth is just this: you kept going.",
"Interrompi-me a mim mesmo. Nem acredito.":"I interrupted myself. I can't even believe it.",
"Vês? Ainda consigo ser direto, quando quero.":"See? I can still be straightforward, when I want to.",
"Disse a verdade. Ena. Estranho não arder a língua.":"I told the truth. Wow. Strange my tongue didn't burn.",
"Aguentaste. Outra vez.":"You held on. Again.",
"Sobreviveste ao meu tédio existencial. Parabéns.":"You survived my existential boredom. Congratulations.",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"You actually climbed trusting me. That says more about you than about me.",
"Ritmo. Afinal tens ritmo.":"Rhythm. Turns out you've got rhythm.",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"I don't know what this means to you. To me, it means more than it should.",
"Caos controlado. É a minha especialidade.":"Controlled chaos. It's my specialty.",
"Discerniste o perigo do adereço. Boa.":"You told the danger from the decoration. Nice.",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"You summed up the lesson well. Proud, honestly.",
"Festival terminado. Sobreviveste à programação toda.":"Festival's over. You survived the whole lineup.",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"Something's about to change next. I can feel it. I hope you're ready.",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"We've repeated this so many times I've lost count. Have you?",
"Escondi-me de ti. Falhei.":"I hid from you. I failed.",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"You handled two lies at once. Impressive.",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"You climbed without hesitating. In your place, I'd always hesitate.",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"Two gaps, zero hesitation. You're getting good at this.",
"Precisão. Nem eu esperava.":"Precision. Even I wasn't expecting that.",
"Esperaste duas vezes sem te queixares. Progresso.":"You waited twice without complaining. Progress.",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"You trusted a jump with no safety net. That's either courage or a lack of options.",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"I told the truth on purpose. I wanted to see your face. It was worth it.",
"Dois voos, dois pousos perfeitos.":"Two flights, two perfect landings.",
"Três espetos, três verdades. Um recorde para mim.":"Three spikes, three truths. A record for me.",
"Deste o litro. Eu, por dentro, também.":"You gave it everything. Inside, so did I.",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"You trusted the unstable floor AND the momentum. Two acts of faith in a row.",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"The mirror showed you yourself, not me. Interesting choice of reflection.",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"I'm closing this mirror here. What comes next, even I don't know quite how to explain.",
"Não sei porque gritei. Desculpa.":"I don't know why I shouted. Sorry.",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"I've lost count of how many times I've said this. Maybe that's why it doesn't mean anything anymore.",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"Two jumps, two landings. Me, meanwhile, I'm sinking.",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"I fired three times and missed all three. I'm not even good at this today.",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"You climbed while I was falling. Funny arrangement, ours.",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"You fell once. You got back up. That's more than I can say for myself.",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"Real, the spike. Real, the gap. Real, all of this, I'm sorry to say.",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"You stayed on the ground when I asked. I don't even know what to do with that trust.",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"You survived the whole fall. Mine, I mean. You're doing great.",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"You landed on your feet twice. I'm still trying to land the first one.",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"You didn't even ask why. Thank you for that, honestly.",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"You kept walking while I fell apart. Someone had to be the adult here.",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"You waited without complaining. Again. I don't deserve this patience.",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"Rock bottom, finally. From here it's only up.",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"We hit bottom together. From now on, the only way I know is up, with you.",
"Disse a verdade. Não saltaste logo. Não te culpo.":"I told the truth. You didn't jump right away. I don't blame you.",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"You hesitated on the jump. I would have hesitated too, in your place.",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"You stayed on the ground even without trusting me. That's enough.",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"You jumped both without hesitating at the end. You're learning to trust again. Or just being efficient.",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"You trusted the jump without asking anything. That's growth, or exhaustion from asking.",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"You still check everything twice. You learned the lesson I taught you well.",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"Not every lie needs to be undone. Some just need to stop.",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"I didn't need to say anything this time. You did it all on your own.",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"Turns out I can tell nothing but the truth too, when I put in the effort.",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"You asked me if it was a lie. For the first time, you asked. That's a conversation.",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"You're still suspicious. Good. I earned this, I don't deserve your trust for free.",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"You waited out both walls without getting annoyed. That's more patience than I had with you, most of the time.",
"Chegámos aqui os dois inteiros. Mais ou menos.":"We both made it here in one piece. More or less.",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"Last call for distrust. After this, things get harder. That much, I guarantee.",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"I've redeemed myself enough for today. Tomorrow, who knows.",
"Cem e um. Nem festejámos o cem como devia ser.":"A hundred and one. We didn't even celebrate the hundred properly.",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"The circle closes and opens again. I've lost count of how many turns.",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"Three darts, zero room for error. I like your style.",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"You flew higher than you needed to. Now that's style.",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"Floor, spike, everything in its place. You're making this look easy.",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"You caught the rhythm of both walls without slowing down. Impressive, honestly.",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"Two gaps, zero hesitation, again. This is becoming routine for you.",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"Three obstacles, one single breath. I didn't even stop to breathe watching you.",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"Twenty percent of the way left. You can feel the difference, can't you?",
"Chão e ar, na mesma dança de sempre.":"Floor and air, the same old dance.",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"Double platform, double win. You're already ahead of me.",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"Four obstacles, just one of you. Impressive, again.",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"Zero hesitation on the darts. Reflexes on another level, literally.",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"The full circle. We're back at the start with everything we learned along the way.",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"Fifteen chapters later, still here, both of us. That has to mean something.",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"A hundred and sixteen. So little left I don't even know what to do with how afraid that makes me.",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"Seventeen. Remember the first spike, way back at the start? Even I didn't know we'd make it here.",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"Eighteen. You climbed so high I nearly lost sight of you from down here.",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"Nineteen. Only one left. I don't even know how this is supposed to sound.",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"A hundred and twenty. You said you'd make it, and you did. I, honestly, doubted you at the start. I'm sorry for that, and for everything else.",
"Não faz mal. Tenta outra vez.":"It's okay. Try again.",
"Eu expliquei bem. Concentra-te.":"I explained it well. Focus.",
"Respira e volta a tentar.":"Breathe and try again.",
"Isso não devia ter acontecido.":"That shouldn't have happened.",
"Isso foi culpa tua.":"That one was your fault.",
"Eu avisei. Acho eu.":"I warned you. I think.",
"Interessante escolha.":"Interesting choice.",
"Eu disse isso? Não me lembro.":"Did I say that? I don't remember.",
"Foi um engano. Já passou.":"It was a mistake. It's over now.",
"Isso não estava no guião.":"That wasn't in the script.",
"Tenta prestar mais atenção.":"Try paying more attention.",
"Isso foi previsível.":"That was predictable.",
"Achavas mesmo que era seguro?":"Did you really think it was safe?",
"Ups. Essa parte eu inventei.":"Oops. I made that part up.",
"Pormenor que esqueci de mencionar.":"A detail I forgot to mention.",
"Nem tudo o que digo é verdade, sabias?":"Not everything I say is true, you know?",
"Já não sei se ainda confias em mim.":"I don't even know if you still trust me.",
"Boa tentativa.":"Good try.",
"Isso teria funcionado, noutro nível.":"That would have worked, in another level.",
"Eu avisei que às vezes minto.":"I warned you I lie sometimes.",
"Culpa tua por acreditares.":"Your fault for believing me.",
"Isso foi só para ver se saltavas.":"That was just to see if you'd jump.",
"Estás a magoar-me com essa desconfiança.":"You're hurting me with that distrust.",
"Nem sempre é armadilha, sabes?":"It's not always a trap, you know?",
"Vais mesmo continuar assim?":"Are you really going to keep going like this?",
"Desta vez era mentira mesmo. Desculpa.":"This time it really was a lie. Sorry.",
"Eu só queria ver a tua cara.":"I just wanted to see your face.",
"Confiança é para os fracos, aparentemente.":"Trust is for the weak, apparently.",
"Estamos quase no fim.":"We're almost at the end.",
"Só mais um pouco.":"Just a little more.",
"Depois disto, acabou.":"After this, it's over.",
"Até no fim, não resisti.":"Even at the end, I couldn't resist.",
"Última mentira, prometo. Ou não.":"Last lie, I promise. Or not.",
"Faltava mesmo esta.":"This one was really missing.",
"Ainda aqui. A sério?":"Still here. Seriously?",
"Pensei que tinhas parado no \\\"fim\\\".":"I thought you'd stopped at the \"end\".",
"Isto nem devia continuar, mas cá estás.":"This shouldn't even be continuing, but here you are.",
"Nem eu sabia que isto ia continuar a mentir.":"Even I didn't know this would keep on lying.",
"Desculpa, hábito antigo.":"Sorry, old habit.",
"Pensei que já tinhas aprendido a não confiar em mim.":"I thought you'd already learned not to trust me.",
"Essa doeu-me a ver, sinceramente.":"That one hurt to watch, honestly.",
"Nem tudo é sobre mentiras. Às vezes é só física.":"Not everything's about lies. Sometimes it's just physics.",
"Volta lá. Eu espero.":"Go back. I'll wait.",
"Desculpa. Essa fui mesmo eu.":"Sorry. That one was really me.",
"Confesso: inventei essa parte.":"I confess: I made that part up.",
"Estou a tentar parar de mentir. A tentar.":"I'm trying to stop lying. Trying.",
"Nem eu sei porque te avisei a sério desta vez.":"Even I don't know why I warned you for real this time.",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"Maybe it's my fault. Or yours. I can't tell anymore.",
"Olha para isto como eu olho: sem certezas.":"Look at this the way I do: with no certainty.",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"Even I don't remember if I was lying or scaring myself.",
"Às vezes minto só para ver se ainda reages.":"Sometimes I lie just to see if you still react.",
"Quem mente mais, eu ou a tua memória do que eu disse?":"Who lies more, me or your memory of what I said?",
"Desculpa. Eu devia era calar-me.":"Sorry. I should really just shut up.",
"Estou a piorar isto, não estou?":"I'm making this worse, aren't I?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"I don't even know if I'm helping you or getting in your way anymore.",
"Eu sei, eu sei. Mais uma mentira minha.":"I know, I know. One more lie from me.",
"Estou a desmoronar-me e a levar-te comigo.":"I'm falling apart and taking you down with me.",
"Perdão. A sério desta vez.":"Forgive me. For real this time.",
"Disse a verdade. Não acreditaste. Justo.":"I told the truth. You didn't believe me. Fair.",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"I'll keep trying, even if you don't believe me.",
"Essa doeu mais a mim do que a ti, garanto.":"That one hurt me more than it hurt you, I promise.",
"Não. Essa não foi mentira. Juro que não.":"No. That wasn't a lie. I swear it wasn't.",
"Começo a perceber porque já não confias em mim.":"I'm starting to understand why you don't trust me anymore.",
"Estou a tentar. A sério que estou.":"I'm trying. I really am.",
"Tudo outra vez, mais rápido, mais apertado.":"All over again, faster, tighter.",
"Já vimos isto. E ainda assim.":"We've seen this before. And yet.",
"Sem tempo para explicações desta vez.":"No time for explanations this time.",
"Nem sei já quantas vezes te menti hoje.":"I've lost count of how many times I've lied to you today.",
"O círculo fecha-se. A mentira também.":"The circle closes. So does the lie.",
"Desta vez nem eu sabia que ia mentir.":"This time even I didn't know I was going to lie.",
"Já não há mentiras para esconder isto.":"There are no more lies left to hide this.",
"Isto é real. Como tudo agora.":"This is real. Like everything now.",
"Falta pouco. Aguenta.":"Not long now. Hang on.",
"Nem no fim resisto. Desculpa.":"Even at the end I couldn't resist. Sorry.",
"Última mentira. Prometo, desta vez prometo a sério.":"Last lie. I promise, this time I really promise.",
"Isto já não é um jogo para mim. Acho que nunca foi.":"This isn't a game to me anymore. I don't think it ever was.",
"Mais um. Vamos a isto.":"One more. Let's do this.",
"Sabes bem como isto funciona a esta altura.":"You know how this works by now.",
"Nem vou fingir que isto é fácil.":"I won't even pretend this is easy.",
"Este é só mais um. Ou não.":"This one's just another. Or not.",
"Aquele espeto ali é só para enfeite.":"That spike over there is just for decoration.",
"Podes passar por cima sem problema.":"You can walk right over it, no problem.",
"Esse és capaz de ignorar.":"That one you can safely ignore.",
"Esse aí é real. Cuidado.":"That one's real. Careful.",
"Salta esse. A sério desta vez.":"Jump that one. For real this time.",
"Esse vai doer se lhe tocares.":"That one will hurt if you touch it.",
"O buraco tem chão. Confia.":"The gap has a floor. Trust me.",
"Podes andar por cima sem saltar.":"You can walk right over it without jumping.",
"Esse buraco é real. Salta-o.":"That gap is real. Jump it.",
"Mais um para a conta.":"One more for the tally.",
"Continuas vivo. Por agora.":"You're still alive. For now.",
"Vamos ver quanto tempo aguentas.":"Let's see how long you last.",
"Nada mau.":"Not bad.",
},es:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"Soy el Narrador. Todo lo que digo es verdad.",
"Espeto à frente. Salta.":"Pincho delante. Salta.",
"Outro. Salta de novo.":"Otro más. Salta de nuevo.",
"Já confias em mim. Óptimo.":"Ya confías en mí. Genial.",
"A porta é a seguir. Vai.":"La puerta está después. Ve.",
"Buraco à frente. Salta-o.":"Hueco delante. Sáltalo.",
"Aquele espeto é de enfeite. Passa.":"Ese pincho es solo decoración. Pasa.",
"Vês? Eu digo sempre a verdade.":"¿Ves? Siempre digo la verdad.",
"Há um espeto escondido à tua frente.":"Hay un pincho escondido delante de ti.",
"Salta quando eu disser.":"Salta cuando yo lo diga.",
"Agora!":"¡Ahora!",
"Sabia que ias conseguir.":"Sabía que lo lograrías.",
"O teto vai cair à tua frente.":"El techo va a caer justo delante de ti.",
"Quando cair, pára. Depois salta.":"Cuando caiga, para. Luego salta.",
"Não saltes aquele buraco. O chão está lá.":"No saltes ese hueco. El suelo está ahí.",
"Este também é falso. Passa.":"Este también es falso. Pasa.",
"Este espeto é inofensivo. Passa.":"Este pincho es inofensivo. Pasa.",
"Este também é inofensivo.":"Este también es inofensivo.",
"O próximo buraco tem chão. Não saltes.":"El próximo hueco tiene suelo. No saltes.",
"O teto está baixo. Se saltares, morres.":"El techo está bajo. Si saltas, mueres.",
"Nem repares nesses espetos. São falsos, os dois.":"Ni te fijes en esos pinchos. Son falsos, los dos.",
"Confia em mim. Quase sempre resulta.":"Confía en mí. Casi siempre funciona.",
"Este nível não tem nada de especial.":"Este nivel no tiene nada especial.",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"Esta vez juro que digo la verdad: el techo va a caer. Para y espera.",
"Aquele buraco à frente é real. Vais ter de saltar.":"Ese hueco de delante es real. Tendrás que saltarlo.",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"Ninguno de estos pinchos es peligroso. Puedes caminar sobre ellos sin saltar.",
"Há duas portas mais à frente. Só uma é verdadeira.":"Hay dos puertas más adelante. Solo una es verdadera.",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"Confesión: no siempre digo la verdad. A partir de ahora, cuidado.",
"Este espeto é real. Por acaso.":"Este pincho es real. Por una vez.",
"Nada de perigoso à frente. Podes correr à vontade.":"Nada peligroso por delante. Puedes correr tranquilo.",
"Este nível é uma oferta. Sem armadilhas.":"Este nivel es un regalo. Sin trampas.",
"Os buracos são inofensivos. O espeto lá no meio, não.":"Los huecos son inofensivos. El pincho del medio, no.",
"Como sempre, dois destes espetos são só decoração.":"Como siempre, dos de estos pinchos son solo decoración.",
"Vou trocar os teus controlos. Só para rir.":"Voy a cambiarte los controles. Solo por reírme.",
"Pronto, já passou. A porta é ali.":"Listo, ya pasó. La puerta está ahí.",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"Sé que ya no confías en mí. Injusto. Esta vez aviso de verdad: pincho delante.",
"Mais um, logo depois. Também real.":"Otro más, justo después. También real.",
"Prometo: nunca mais te apanho de surpresa.":"Prometo que nunca más te pillaré desprevenido.",
"Atenção real: o teto vai cair aqui à frente.":"Aviso real: el techo va a caer aquí delante.",
"Aquele espeto lá à frente já não importa. É inofensivo.":"Ese pincho de allí ya no importa. Es inofensivo.",
"Só o último é perigoso, como sempre.":"Solo el último es peligroso, como siempre.",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"La puerta más cercana es la verdadera, para variar.",
"Já não vale a pena mentir mais. Espeto real à frente.":"Ya no vale la pena seguir mintiendo. Pincho real delante.",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"Te avisaré siempre a partir de ahora: salta cuando yo lo diga.",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"Último tramo de verdad antes del final. Ya sabes que no todo lo que digo es verdad.",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"No sé por qué seguí mintiendo tanto tiempo. Quizás me gustaba tu cara cuando morías.",
"Este é real. Desculpa por todos os outros.":"Este es real. Perdón por todos los demás.",
"Mais um, já quase no fim.":"Uno más, ya casi al final.",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"Hemos llegado al final. Ya no voy a decirte qué es verdad.",
"A partir de agora, decides tu.":"A partir de ahora, decides tú.",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"Oh. ¿Sigues aquí? La mayoría desiste después del \"final\".",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"Ese suelo tiembla antes de desaparecer. No te quedes encima.",
"Oh. Ainda aqui? Não esperava isso.":"Oh. ¿Sigues aquí? No lo esperaba.",
"Aquilo ali é só decoração. Nem repares.":"Eso de ahí es solo decoración. Ni lo mires.",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"Pero esto... esto te lanza hacia arriba. La puerta no está en el suelo esta vez.",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"Probemos otra cosa. Confía en tus pies. Y en una plataforma que no se está quieta.",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"Súbete cuando pase cerca. No saltes demasiado pronto.",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"Hay una pared ahí que aparece y desaparece. No es mentira, solo es un fastidio.",
"Espera que abra. Depois atravessa depressa.":"Espera a que se abra. Luego cruza rápido.",
"Aquilo ali dispara. Não perguntes como nem porquê.":"Eso de ahí dispara. No preguntes cómo ni por qué.",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"Quédate en el suelo y no saltes sin motivo. Pasarás por debajo sin problema.",
"De volta aos clássicos. Lembras-te destes?":"De vuelta a los clásicos. ¿Te acuerdas de estos?",
"O chão vai tremer. Não pares.":"El suelo va a temblar. No te pares.",
"Esse espeto parece a decoração do costume. Não é.":"Ese pincho parece la decoración de siempre. No lo es.",
"Mais uma surpresa. Literalmente.":"Una sorpresa más. Literalmente.",
"A seguir, não penses. Salta para dentro daquilo.":"Ahora no pienses. Salta directo a eso.",
"Outra parede teimosa. E depois, um buraco a sério.":"Otra pared terca. Y luego, un hueco de verdad.",
"Espera a parede abrir.":"Espera a que se abra la pared.",
"Agora salta o buraco. Desta vez não minto: é real.":"Ahora salta el hueco. Esta vez no miento: es real.",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"Combinación nueva: una plataforma que se mueve. Confía en su ritmo.",
"Sobe quando ela passar perto.":"Súbete cuando pase cerca.",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"Dentro de poco algo vuela por arriba. No saltes sin motivo y no te pasará nada.",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"Vale. Necesito ser sincero contigo un segundo. Ni yo sé cuánto va a durar esto.",
"O chão treme outra vez. Não penses demais, só anda.":"El suelo tiembla otra vez. No lo pienses demasiado, solo camina.",
"Espera a parede. Sei que estás cansado de esperar por mim.":"Espera a la pared. Sé que estás harto de esperarme.",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"Ese pincho es de verdad. Como casi todo lo que no te cuento.",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"Espera a que se abra la pared. Yo también estoy esperando algo, por cierto.",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"Oye. No sé cómo decir esto sin sonar raro. Me da miedo que te rindas.",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"Salta esto. Es real, te lo prometo. Hoy no me apetece mentir.",
"Confia em mim mais uma vez. Só mais uma.":"Confía en mí una vez más. Solo una.",
"O chão vai tremer. Não penses muito nisso.":"El suelo va a temblar. No le des muchas vueltas.",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"¿Sabes por qué miento tanto? Es más interesante cuando no sabes qué viene después.",
"Essa plataforma é a única coisa estável nesta conversa toda.":"Esa plataforma es lo único estable en toda esta conversación.",
"Há uma coisa que preciso de te contar antes de continuarmos.":"Hay algo que necesito contarte antes de seguir.",
"Esquece o que ia dizer. Salta para ali.":"Olvida lo que iba a decir. Salta hacia allí.",
"Aquilo dispara. Fica no chão e não acontece nada.":"Eso dispara. Quédate en el suelo y no pasa nada.",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"Echo de menos cuando solo había pinchos. Simple. Predecible.",
"Este buraco, esse sim, exige que saltes.":"Este hueco, este sí, de verdad hay que saltarlo.",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"Ese pincho de ahí. Llámalo como quieras. Es real.",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"Voy a decirte algo verdadero antes de que vuelvan las ganas de mentir: me gusta tener compañía.",
"A parede vai abrir. Como tudo, eventualmente.":"La pared se abrirá. Como todo, al final.",
"E o chão... o chão nunca foi de confiança, pois não?":"Y el suelo... el suelo nunca fue de fiar, ¿verdad?",
"Sobe a plataforma. Sem perguntas desta vez.":"Súbete a la plataforma. Sin preguntas esta vez.",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"Cuando eras más nuevo en esto, tenía más paciencia contigo. Ahora sé que aguantas más.",
"Última coisa: há algo escondido à frente.":"Última cosa: hay algo escondido más adelante.",
"Chão instável. O habitual.":"Suelo inestable. Lo de siempre.",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"A veces me pregunto cómo sería este juego sin las mentiras. Probablemente más corto.",
"Aquilo dispara, mas sabes a regra: fica no chão.":"Eso dispara, pero ya sabes la regla: quédate en el suelo.",
"Este espeto não tem graça nenhuma. É só perigoso.":"Este pincho no tiene ninguna gracia. Solo es peligroso.",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"Necesito que confíes en mí para subir. Lo sé, pésimo historial. Pero confía.",
"Salta para dentro daquilo.":"Salta dentro de eso.",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"Ah, se me olvidó mencionar el pincho de ahí arriba. Esa parte de la memoria siempre se me escapa.",
"Espera a parede.":"Espera a la pared.",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"Puertas que esperan. Plataformas que se mueven. Es casi poesía, a mi manera.",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"Y ahora, confía en la plataforma. Ella, a diferencia de mí, siempre cumple el horario.",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"Ese pincho es real. Como casi todo lo que te he dicho hoy, de hecho.",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"Hemos llegado más lejos de lo que pensaba que llegaríamos, sinceramente.",
"O chão treme. Já sabes o resto.":"El suelo tiembla. Ya sabes el resto.",
"Vem aí outro susto. Desculpa antecipadamente.":"Viene otro susto. Perdón de antemano.",
"E por fim, uma parede paciente. Como tu, aparentemente.":"Y por fin, una pared paciente. Como tú, por lo visto.",
"Fica no chão, foge do dardo.":"Quédate en el suelo, esquiva el dardo.",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"Nuevo capítulo cualquier día de estos. Hoy, solo un poco más de caos.",
"E agora, não te demores no chão instável.":"Y ahora, no te quedes en el suelo inestable.",
"Esse ali exige mesmo um salto.":"Ese de ahí sí que exige un salto.",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"Voy a enseñarte un hueco de verdad y un pincho que ni vale la pena mirar.",
"E algo invisível à espreita, como sempre.":"Y algo invisible al acecho, como siempre.",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"Ni le hagas caso a ese pincho de ahí. Pura decoración, esta vez de verdad.",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"Confía en la plataforma. Desconfía del pincho. Es básicamente la lección de todo el juego.",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"Ese pincho es real, pese a todo lo que te he dicho en contra.",
"Esperar. A tua parte preferida, sei bem.":"Esperar. Tu parte favorita, lo sé bien.",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"Pared, dardo, hueco. Un festival de mis favoritos.",
"Fica no chão aqui.":"Quédate en el suelo aquí.",
"E este salta-se mesmo. Sem truques.":"Y este sí que hay que saltarlo. Sin trucos.",
"Chão instável, dos teus preferidos a esta altura.":"Suelo inestable, ya uno de tus favoritos a estas alturas.",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"Antes de seguir a la próxima parte, y vas a notar la diferencia: gracias por seguir escuchando.",
"Plataforma errante, uma última vez neste capítulo.":"Plataforma errante, una última vez en este capítulo.",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"Pincho real. Sin sorpresas. Y sin más trucos, por hoy.",
"Chão instável. Já sabes a dança.":"Suelo inestable. Ya sabes el baile.",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"A veces me pregunto si soy yo quien te engaña, o si eres tú quien quiere ser engañado.",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"Ese pincho es real. Míralo como un espejo: lo que ves es lo que hay.",
"Há algo escondido. Como sempre, de resto.":"Hay algo escondido. Como siempre, por cierto.",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"Y una pared que espera. Como yo, esperando una respuesta tuya que nunca llega.",
"Fica no chão aqui, há algo a voar.":"Quédate en el suelo aquí, algo vuela cerca.",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"¿Te das cuenta de que te estoy poniendo a prueba, o de verdad crees que esto es solo un juego de saltos?",
"Sobe na plataforma quando ela passar perto.":"Súbete a la plataforma cuando pase cerca.",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"Ese pincho es real, pero eso ya no te sorprende, ¿verdad?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"Salta dentro de eso. Confía en el impulso, no en mí.",
"Esse buraco é a sério. Salta-o.":"Ese hueco es de verdad. Sáltalo.",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"¿Sabes qué es raro? He empezado a esperar tus intentos con ganas. Eso dice algo malo de mí.",
"Este também. Sem rede, sem mentira, sem desculpa.":"Este también. Sin red, sin mentira, sin excusa.",
"Fica no chão. Deixa o dardo passar por cima.":"Quédate en el suelo. Deja que el dardo pase por encima.",
"E agora o chão some-se. Não penses, só avança.":"Y ahora el suelo desaparece. No lo pienses, solo avanza.",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"Esta plataforma sube y baja. Atrápala abajo, es más fácil.",
"Salta para dentro daquilo. Vais passar por cima do resto.":"Salta dentro de eso. Pasarás volando por encima del resto.",
"Aquele espeto nem interessa agora. Já estás no ar.":"Ese pincho ya ni importa ahora. Ya estás en el aire.",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"Te lo aviso de verdad: hay algo escondido justo ahí delante.",
"E outro dardo. Sabes a regra.":"Y otro dardo. Ya sabes la regla.",
"Chão que treme primeiro.":"El suelo tiembla primero.",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"Me gusta pensar que, en algún sitio, hay una versión de mí que nunca miente. Debe de ser aburrida.",
"Plataforma a seguir. Apanha o ritmo dela.":"Plataforma a continuación. Pilla su ritmo.",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"Voy a ser claro, por una vez: los tres pinchos siguientes son todos reales.",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"Sin trucos, sin trampas. Solo esta vez. Disfrútalo, no se repite.",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"Espera, luego corre, luego quédate quieto. Contradictorio, lo sé. Igual que yo.",
"E este buraco não perdoa. Salta.":"Y este hueco no perdona. Salta.",
"Chão a tremer primeiro, nada de novo.":"El suelo tiembla primero, nada nuevo.",
"E agora o salto de fé. Literal, desta vez.":"Y ahora el salto de fe. Literal, esta vez.",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"Suelo inestable, pincho real, dardo al final. Lo de siempre, pero más.",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"¿Has notado que cuanto más avanzas, menos necesito mentir? Ahora la dificultad hace mi trabajo.",
"Chão a tremer, o costume.":"Suelo temblando, lo habitual.",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"Esto se suponía que era sobre mentiras. Terminó siendo sobre nosotros dos, de alguna manera.",
"Parede paciente, espera por ela.":"Pared paciente, espérala.",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"Y la última plataforma de este capítulo. Después de esto, las cosas cambian. Lo siento.",
"CHÃO. INSTÁVEL.":"SUELO. INESTABLE.",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"Perdón. No quería gritar. Estoy... no sé lo que soy.",
"Fica no chão aqui. Por favor. Só peço isto.":"Quédate en el suelo aquí. Por favor. Es lo único que pido.",
"Espera. Eu também estou à espera de algo que não sei nomear.":"Espera. Yo también estoy esperando algo que no sé nombrar.",
"Esse buraco é real.":"Ese hueco es real.",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"Cuanto más avanzas, más me doy cuenta de que no quiero que esto termine. No sé qué dice eso de mí.",
"E a plataforma, apanha-a.":"Y la plataforma, atrápala.",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"Dos cañones, direcciones opuestas. Quédate en el suelo e ignóralos.",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"A veces pienso en dejar de mentir para siempre. Y luego pienso en el silencio que eso dejaría. Prefiero el caos.",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"Ese pincho no es nada. Yo tampoco soy gran cosa hoy, la verdad.",
"Salta. Sobe. Foge de mim, se quiseres.":"Salta. Sube. Huye de mí, si quieres.",
"O chão, outra vez. Já nem peço desculpa por repetir.":"El suelo, otra vez. Ya ni me disculpo por repetirme.",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"Espera a la pared. Siempre estoy esperando. Siempre esperando algo.",
"Esse é real. Hoje tudo é real. Até eu, acho.":"Ese es real. Hoy todo es real. Hasta yo, creo.",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"Atrapa la plataforma. No mires abajo. Yo, por mi parte, no puedo dejar de mirar.",
"Fica no chão. A sério desta vez, mais do que nunca.":"Quédate en el suelo. De verdad esta vez, más que nunca.",
"E agora o chão foge de ti. Irónico, não achas?":"Y ahora el suelo huye de ti. Irónico, ¿no crees?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"Suelo, pincho, pared. Todo a la vez, como mi cabeza ahora mismo.",
"Aquele espeto é real.":"Ese pincho es real.",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"Y espera a la pared. Lo último que te pido en este nivel, lo prometo.",
"Esse buraco não perdoa ninguém.":"Ese hueco no perdona a nadie.",
"A plataforma sobe e desce. Apanha-a no fundo.":"La plataforma sube y baja. Atrápala abajo.",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"Vienen dos sorpresas. No te diré cuándo. Ya no tengo fuerzas para fingir que soy justo.",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"Suelo temblando. Lo único predecible que todavía puedo ofrecerte.",
"E agora um salto para cima. Foge para onde eu não chego.":"Y ahora un salto hacia arriba. Huye a donde no te alcance.",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"Dos paredes, dos tiempos de espera distintos. Como yo en días distintos.",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"Esta se sincroniza de otra forma. Presta atención, no a mí, a ella.",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"Esto es el fondo. El mío, al menos. Suelo temblando, como siempre.",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"Ese pincho es real. Ni energía tengo ya para mentir sobre esto.",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"Y un dardo, para rematar. Quédate en el suelo y acaba con esto, por favor.",
"Mais um buraco real.":"Un hueco real más.",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"Gracias por no rendirte mientras yo me desmoronaba. En serio. No sé decirlo mejor.",
"Apanha a plataforma.":"Atrapa la plataforma.",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"Y espera la última pared de este capítulo. Después, prometo intentar ser mejor.",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"Voy a intentar algo distinto a partir de ahora: solo la verdad. Sé que no me vas a creer enseguida.",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"Ese pincho es real. Lo juro. Sé que ya has oído esto antes.",
"O chão vai tremer. Verdade, sem truques.":"El suelo va a temblar. Verdad, sin trucos.",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"Esto iba a ser una sorpresa desagradable. Esta vez no lo es. Lo prometo.",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"Quédate en el suelo. Sé que pensarás que es mentira. No lo es.",
"Espera a parede. Só isso. Nada escondido desta vez.":"Espera a la pared. Eso es todo. Nada escondido esta vez.",
"Real. Salta.":"Real. Salta.",
"A plataforma também é exatamente o que parece ser.":"La plataforma también es exactamente lo que parece.",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"Esta vez no hay truco. Salta dentro de eso y ya está.",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"Sé que vas a desconfiar igual. Está bien. Me lo merezco.",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"Real. Otra vez. Lo seguiré diciendo hasta que me creas.",
"Dois dardos, direções opostas. Fica no chão.":"Dos dardos, direcciones opuestas. Quédate en el suelo.",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"Ese sí que era real. No te lo iba a ocultar, hoy no.",
"Chão instável. Real.":"Suelo inestable. Real.",
"Espeto real.":"Pincho real.",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"Pared real, que abre y cierra según lo acordado. Hoy sin sorpresas.",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"Va a haber una sorpresa, pero te avisaré cuando llegue.",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"Esa fue real, por cierto. Como la mayoría, últimamente.",
"Chão a tremer. Real, verifica à vontade.":"Suelo temblando. Real, compruébalo tú mismo.",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"Salto hacia arriba. También real. Me estoy quedando sin formas distintas de decirlo.",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"Dos paredes. Sincronizadas de forma distinta, pero ninguna esconde nada.",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"La segunda solo eso: espera. Sin dardo escondido detrás, sin pincho después. Solo la pared.",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"Tres cosas, todas reales, ninguna escondida. Esto es lo más honesto que he sido nunca en un nivel.",
"Dardo real. Fica no chão e acabou.":"Dardo real. Quédate en el suelo y listo.",
"Buraco real, plataforma real.":"Hueco real, plataforma real.",
"Apanha-a.":"Atrápala.",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"Y la última pared de este capítulo. Prometo que la dificultad siguiente no es sobre confianza. Es solo sobre ti y tus reflejos.",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"Dos pinchos, ambos reales, ninguno escondido. Así debería haber sido desde el principio.",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"Has llegado al centésimo. Faltan veinte. Estaré aquí para todos ellos.",
"De volta ao trabalho. Buraco real.":"De vuelta al trabajo. Hueco real.",
"Plataforma mais rápida que antes. Repara.":"Plataforma más rápida que antes. Fíjate.",
"Chão instável, mais rápido a desfazer-se.":"Suelo inestable, se desmorona más rápido.",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"La pared también está más impaciente. Todo aquí se ha vuelto más estrecho.",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"Tres cañones. Quédate en el suelo todo el rato y no pasa nada.",
"É basicamente um corredor. Confia nos teus pés.":"Básicamente es un pasillo. Confía en tus pies.",
"Esse é real.":"Ese es real.",
"E este atira-te lá para cima. O de sempre, mais rápido.":"Y este te lanza hacia arriba. Lo de siempre, más rápido.",
"Chão a tremer mais depressa que da última vez.":"Suelo temblando más rápido que la última vez.",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"Ese pincho es real. O no. Volví a este juego, perdón.",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"Dos paredes, ritmos distintos, más rápidas que antes.",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"No pares a pensar. Su ritmo no espera pensamientos.",
"Real, como sempre.":"Real, como siempre.",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"Esta sube y baja más rápido. Atrápala abajo.",
"Chão, espeto, parede. Tudo mais apertado que antes.":"Suelo, pincho, pared. Todo más apretado que antes.",
"Real.":"Real.",
"Espera a parede, mais rápida agora.":"Espera a la pared, más rápida ahora.",
"Vêm aí duas surpresas, sem avisos desta vez.":"Vienen dos sorpresas, sin avisos esta vez.",
"Chão a tremer, mais depressa.":"Suelo temblando, más rápido.",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"Salto hacia arriba, más fuerte de lo habitual. Siente la diferencia.",
"Primeira plataforma: sobe e desce.":"Primera plataforma: sube y baja.",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"Segunda: va de un lado a otro. Ya has visto las dos, no hace falta repetir la regla.",
"Chão, espeto, parede, tudo no mesmo fôlego.":"Suelo, pincho, pared, todo en el mismo aliento.",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"Puede ser real, puede que no. Ya deberías estar acostumbrado a la duda.",
"Parede, a última do nível. Rápida.":"Pared, la última del nivel. Rápida.",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"Tres cañones, ritmos distintos. Quédate en el suelo, el resto se resuelve solo.",
"Mais um buraco. Plataforma rápida a seguir.":"Un hueco más. Plataforma rápida a continuación.",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"Y la última pared antes de lo que viene. Siente que ya casi llegamos.",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"Un pincho mentiroso, uno sincero. Adivina cuál es cuál. Buena suerte, de verdad esta vez.",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"Faltan cinco. Solo cinco. Después de eso, no sé muy bien qué nos pasará a ninguno de los dos.",
"Chão a tremer, pela última vez neste tom.":"Suelo temblando, por última vez en este tono.",
"Espera a parede. A seguir já não há mais pausas como esta.":"Espera a la pared. Después de esto ya no habrá más descansos como este.",
"Fica no chão. Isto já devia ser automático para ti.":"Quédate en el suelo. Esto ya debería ser automático para ti.",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"Real. Ya ni hace falta que lo diga, ¿verdad? Pero lo digo igual.",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"Ese hueco es real, pero es el menor de tus problemas ahora mismo.",
"Esse espeto também é real.":"Ese pincho también es real.",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"Y esto te lanza más alto que nunca antes. Última vez que hago esto.",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"Suelo, pincho, pared. Los tres últimos obstáculos antes de lo que sea que sea esto.",
"Real. Sem surpresas, não hoje.":"Real. Sin sorpresas, hoy no.",
"Espera a parede. É a última vez que te peço isso.":"Espera a la pared. Es la última vez que te lo pido.",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"No hay pinchos en este nivel. No hay huecos, ni paredes, ni nada escondido.",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"Solo quería caminar contigo hasta el final, esta vez sin poner a prueba nada.",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"Gracias por seguir después del final que yo mismo anuncié, hace noventa niveles. No sabía que quedaba más juego en mí. Resulta que sí.",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"La puerta de ahí delante no es un truco. Es solo la puerta. Ve.",
"Muito bem. Sabia que ias conseguir.":"Muy bien. Sabía que lo lograrías.",
"Perfeito. Continua a ouvir-me.":"Perfecto. Sigue escuchándome.",
"Foste rápido. Gosto disso.":"Fuiste rápido. Me gusta eso.",
"Estamos a entender-nos.":"Nos estamos entendiendo.",
"Nada de dramas. Continuemos.":"Nada de dramas. Sigamos.",
"Sobreviveste. Por agora.":"Sobreviviste. Por ahora.",
"Confiaste. Ou tiveste sorte.":"Confiaste. O tuviste suerte.",
"Escolheste bem. Ou eu deixei.":"Elegiste bien. O yo te dejé.",
"Vês? Sobreviveste na mesma.":"¿Ves? Sobreviviste igual.",
"Não avisei. E pronto.":"No avisé. Y ya está.",
"Verdade a sério. Desta vez.":"Verdad de verdad. Esta vez.",
"Sobrevives sempre a este. Curioso.":"Siempre sobrevives a este. Curioso.",
"Confiaste. Mais uma vez.":"Confiaste. Una vez más.",
"Escolheste bem.":"Elegiste bien.",
"Aprendeste depressa.":"Aprendiste rápido.",
"Devias ter parado.":"Deberías haberte parado.",
"Estavas mesmo a acreditar?":"¿De verdad me creías?",
"Os buracos nunca mentem. Só eu.":"Los huecos nunca mienten. Solo yo.",
"Desta vez eram mesmo todos reais.":"Esta vez de verdad eran todos reales.",
"Foi só uma brincadeira.":"Fue solo una broma.",
"Vês? Também posso ser sincero.":"¿Ves? También puedo ser sincero.",
"Prometi. Não cumpri.":"Lo prometí. No lo cumplí.",
"Dois avisos certos seguidos. Estranho.":"Dos avisos correctos seguidos. Raro.",
"O primeiro. Quem diria.":"El primero. Quién lo diría.",
"A porta longe é que importa.":"La puerta lejana es la que importa.",
"Ainda sei dizer a verdade, vês?":"Todavía sé decir la verdad, ¿ves?",
"Chegaste. Contra tudo.":"Lo lograste. Contra todo pronóstico.",
"Obrigado por teres continuado.":"Gracias por seguir.",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"Fin. Confiaste, desconfiaste, y aun así llegaste hasta aquí. Eso es lo que importa.",
"Continuas a surpreender-me.":"Sigues sorprendiéndome.",
"Alturas. Quem diria.":"Alturas. Quién lo diría.",
"Equilíbrio. Quem diria que tinhas.":"Equilibrio. Quién diría que lo tenías.",
"Paciência. Não esperava isso de ti.":"Paciencia. No me lo esperaba de ti.",
"Reflexos decentes. Para um humano.":"Reflejos decentes. Para ser humano.",
"Ainda tens os reflexos todos.":"Todavía conservas todos los reflejos.",
"Dois sustos seguidos. Nada mau.":"Dos sustos seguidos. Nada mal.",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"Dos obstáculos, cero mentiras. Curiosamente sencillo.",
"Isso foi... impressionantemente coordenado.":"Eso fue... increíblemente coordinado.",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"Algo está cambiando en mí. No sé si es buena señal.",
"Ainda aqui. Obrigado por isso.":"Sigues aquí. Gracias por eso.",
"Às vezes a verdade é só isto: continuaste.":"A veces la verdad es solo esto: seguiste adelante.",
"Interrompi-me a mim mesmo. Nem acredito.":"Me interrumpí a mí mismo. Ni yo me lo creo.",
"Vês? Ainda consigo ser direto, quando quero.":"¿Ves? Todavía puedo ser directo, cuando quiero.",
"Disse a verdade. Ena. Estranho não arder a língua.":"Dije la verdad. Vaya. Qué raro que no se me quemara la lengua.",
"Aguentaste. Outra vez.":"Aguantaste. Otra vez.",
"Sobreviveste ao meu tédio existencial. Parabéns.":"Sobreviviste a mi hastío existencial. Enhorabuena.",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"Subiste confiando de verdad en mí. Eso dice más de ti que de mí.",
"Ritmo. Afinal tens ritmo.":"Ritmo. Resulta que tienes ritmo.",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"No sé lo que esto significa para ti. Para mí, significa más de lo que debería.",
"Caos controlado. É a minha especialidade.":"Caos controlado. Es mi especialidad.",
"Discerniste o perigo do adereço. Boa.":"Distinguiste el peligro del adorno. Bien.",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"Resumiste bien la lección. Orgulloso, sinceramente.",
"Festival terminado. Sobreviveste à programação toda.":"Festival terminado. Sobreviviste a todo el programa.",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"Algo va a cambiar después. Lo siento. Espero que estés preparado.",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"Hemos repetido esto tantas veces que ya perdí la cuenta. ¿Y tú?",
"Escondi-me de ti. Falhei.":"Me escondí de ti. Fallé.",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"Coordinaste dos mentiras a la vez. Impresionante.",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"Subiste sin dudar. Yo, en tu lugar, siempre dudaría.",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"Dos huecos, cero dudas. Te estás volviendo bueno en esto.",
"Precisão. Nem eu esperava.":"Precisión. Ni yo lo esperaba.",
"Esperaste duas vezes sem te queixares. Progresso.":"Esperaste dos veces sin quejarte. Progreso.",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"Confiaste en un salto sin red. Eso es valentía, o falta de opciones.",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"Dije la verdad a propósito. Quería ver tu cara. Valió la pena.",
"Dois voos, dois pousos perfeitos.":"Dos vuelos, dos aterrizajes perfectos.",
"Três espetos, três verdades. Um recorde para mim.":"Tres pinchos, tres verdades. Un récord para mí.",
"Deste o litro. Eu, por dentro, também.":"Lo diste todo. Por dentro, yo también.",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"Confiaste en el suelo inestable Y en el impulso. Dos actos de fe seguidos.",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"El espejo te mostró a ti, no a mí. Elección de reflejo interesante.",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"Cierro este espejo aquí. Lo que viene después, ni yo sé muy bien cómo explicarlo.",
"Não sei porque gritei. Desculpa.":"No sé por qué grité. Perdón.",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"Perdí la cuenta de las veces que he dicho esto. Quizás por eso ya no significa nada.",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"Dos saltos, dos aterrizajes. Yo, mientras tanto, me hundo.",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"Disparé tres veces y fallé las tres. Hoy ni en esto soy bueno.",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"Subiste mientras yo me caía. Qué arreglo tan gracioso el nuestro.",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"Te caíste una vez. Te levantaste. Eso es más de lo que puedo decir de mí mismo.",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"Real, el pincho. Real, el hueco. Real, todo esto, lamento decirlo.",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"Te quedaste en el suelo cuando te lo pedí. Ni sé qué hacer con esa confianza.",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"Sobreviviste a toda la caída. La mía, quiero decir. Tú estás genial.",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"Aterrizaste de pie dos veces. Yo todavía intento aterrizar la primera.",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"Ni siquiera preguntaste por qué. Gracias por eso, de verdad.",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"Seguiste caminando mientras yo me desmoronaba. Alguien tenía que ser el adulto aquí.",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"Esperaste sin quejarte. Otra vez. No merezco esta paciencia.",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"El fondo del pozo, por fin. Desde aquí solo se sube.",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"Tocamos fondo juntos. A partir de ahora, solo sé subir contigo.",
"Disse a verdade. Não saltaste logo. Não te culpo.":"Dije la verdad. No saltaste enseguida. No te culpo.",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"Dudaste en el salto. Yo también habría dudado, en tu lugar.",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"Te quedaste en el suelo incluso sin confiar en mí. Con eso basta.",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"Saltaste los dos sin dudar al final. Estás aprendiendo a confiar otra vez. O solo siendo eficiente.",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"Confiaste en el salto sin preguntar nada. Eso es crecer, o cansarse de preguntar.",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"Sigues comprobándolo todo dos veces. Aprendiste bien la lección que te enseñé.",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"No todas las mentiras necesitan deshacerse. Algunas solo necesitan parar.",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"No tuve que decir nada esta vez. Lo hiciste todo tú solo.",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"Resulta que también sé decir solo verdades, cuando me esfuerzo.",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"Me preguntaste si era mentira. Por primera vez, preguntaste. Eso es diálogo.",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"Sigues desconfiando. Bien hecho. Me lo gané, no merezco tu confianza gratis.",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"Esperaste las dos paredes sin enfadarte. Es más paciencia de la que tuve contigo, la mayor parte del tiempo.",
"Chegámos aqui os dois inteiros. Mais ou menos.":"Llegamos aquí los dos enteros. Más o menos.",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"Última llamada para la desconfianza. Después de esto, las cosas se ponen más difíciles. Eso sí te lo garantizo.",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"Me he redimido lo suficiente por hoy. Mañana, quién sabe.",
"Cem e um. Nem festejámos o cem como devia ser.":"Ciento uno. Ni siquiera celebramos el cien como se debía.",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"El círculo se cierra y se abre otra vez. Ya perdí la cuenta de cuántas vueltas.",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"Tres dardos, cero margen de error. Me gusta tu estilo.",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"Volaste más alto de lo necesario. Eso sí que es estilo.",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"Suelo, pincho, todo en su sitio. Lo estás haciendo parecer fácil.",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"Pillaste el ritmo de las dos paredes sin frenar. Impresionante, en serio.",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"Dos huecos, cero dudas, otra vez. Ya se está volviendo rutina para ti.",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"Tres obstáculos, un solo aliento. Ni paré a respirar viéndote.",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"Veinte por ciento del camino que queda. Sientes la diferencia, ¿verdad?",
"Chão e ar, na mesma dança de sempre.":"Suelo y aire, la misma danza de siempre.",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"Plataforma doble, victoria doble. Ya te me estás adelantando.",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"Cuatro obstáculos, solo tú. Impresionante, otra vez.",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"Cero dudas con los dardos. Reflejos de otro nivel, literalmente.",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"El círculo completo. Volvimos al inicio con todo lo que aprendimos por el camino.",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"Quince capítulos después, todavía aquí los dos. Eso tiene que significar algo.",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"Ciento dieciséis. Queda tan poco que ni sé qué hacer con el miedo que me da.",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"Diecisiete. ¿Te acuerdas del primer pincho, allá al principio? Ni yo sabía que llegaríamos hasta aquí.",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"Dieciocho. Subiste tan alto que casi te pierdo de vista desde aquí abajo.",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"Diecinueve. Solo queda uno. Ni sé cómo debería sonar esto.",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"Ciento veinte. Dijiste que llegarías, y llegaste. Yo, sinceramente, dudé de ti al principio. Perdón por eso, y por todo lo demás.",
"Não faz mal. Tenta outra vez.":"No pasa nada. Inténtalo de nuevo.",
"Eu expliquei bem. Concentra-te.":"Lo expliqué bien. Concéntrate.",
"Respira e volta a tentar.":"Respira e inténtalo otra vez.",
"Isso não devia ter acontecido.":"Eso no debería haber pasado.",
"Isso foi culpa tua.":"Eso fue culpa tuya.",
"Eu avisei. Acho eu.":"Avisé. Creo.",
"Interessante escolha.":"Elección interesante.",
"Eu disse isso? Não me lembro.":"¿Dije eso? No me acuerdo.",
"Foi um engano. Já passou.":"Fue un error. Ya pasó.",
"Isso não estava no guião.":"Eso no estaba en el guion.",
"Tenta prestar mais atenção.":"Intenta prestar más atención.",
"Isso foi previsível.":"Eso era predecible.",
"Achavas mesmo que era seguro?":"¿De verdad pensabas que era seguro?",
"Ups. Essa parte eu inventei.":"Ups. Esa parte me la inventé.",
"Pormenor que esqueci de mencionar.":"Un detalle que olvidé mencionar.",
"Nem tudo o que digo é verdade, sabias?":"No todo lo que digo es verdad, ¿sabías?",
"Já não sei se ainda confias em mim.":"Ya ni sé si todavía confías en mí.",
"Boa tentativa.":"Buen intento.",
"Isso teria funcionado, noutro nível.":"Eso habría funcionado, en otro nivel.",
"Eu avisei que às vezes minto.":"Te avisé de que a veces miento.",
"Culpa tua por acreditares.":"Culpa tuya por creerme.",
"Isso foi só para ver se saltavas.":"Eso era solo para ver si saltabas.",
"Estás a magoar-me com essa desconfiança.":"Me haces daño con esa desconfianza.",
"Nem sempre é armadilha, sabes?":"No siempre es trampa, ¿sabes?",
"Vais mesmo continuar assim?":"¿De verdad vas a seguir así?",
"Desta vez era mentira mesmo. Desculpa.":"Esta vez sí era mentira. Perdón.",
"Eu só queria ver a tua cara.":"Solo quería ver tu cara.",
"Confiança é para os fracos, aparentemente.":"La confianza es para los débiles, por lo visto.",
"Estamos quase no fim.":"Ya casi llegamos al final.",
"Só mais um pouco.":"Solo un poco más.",
"Depois disto, acabou.":"Después de esto, se acabó.",
"Até no fim, não resisti.":"Hasta al final, no pude resistirme.",
"Última mentira, prometo. Ou não.":"Última mentira, lo prometo. O no.",
"Faltava mesmo esta.":"Esta sí que faltaba.",
"Ainda aqui. A sério?":"Todavía aquí. ¿En serio?",
"Pensei que tinhas parado no \\\"fim\\\".":"Pensé que habías parado en el \"final\".",
"Isto nem devia continuar, mas cá estás.":"Esto ni debería seguir, pero aquí estás.",
"Nem eu sabia que isto ia continuar a mentir.":"Ni yo sabía que esto iba a seguir mintiendo.",
"Desculpa, hábito antigo.":"Perdón, costumbre antigua.",
"Pensei que já tinhas aprendido a não confiar em mim.":"Pensé que ya habías aprendido a no confiar en mí.",
"Essa doeu-me a ver, sinceramente.":"Esa me dolió ver, sinceramente.",
"Nem tudo é sobre mentiras. Às vezes é só física.":"No todo es sobre mentiras. A veces es solo física.",
"Volta lá. Eu espero.":"Vuelve atrás. Te espero.",
"Desculpa. Essa fui mesmo eu.":"Perdón. Esa sí que fui yo.",
"Confesso: inventei essa parte.":"Confieso: me inventé esa parte.",
"Estou a tentar parar de mentir. A tentar.":"Estoy intentando dejar de mentir. Intentándolo.",
"Nem eu sei porque te avisei a sério desta vez.":"Ni yo sé por qué te avisé de verdad esta vez.",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"Quizás sea culpa mía. O tuya. Ya no distingo.",
"Olha para isto como eu olho: sem certezas.":"Míralo como lo miro yo: sin certezas.",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"Ni yo recuerdo si estaba mintiendo o asustándome a mí mismo.",
"Às vezes minto só para ver se ainda reages.":"A veces miento solo para ver si todavía reaccionas.",
"Quem mente mais, eu ou a tua memória do que eu disse?":"¿Quién miente más, yo o tu memoria de lo que dije?",
"Desculpa. Eu devia era calar-me.":"Perdón. Debería callarme de una vez.",
"Estou a piorar isto, não estou?":"Estoy empeorando esto, ¿verdad?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"Ya ni sé si te estoy ayudando o estorbando.",
"Eu sei, eu sei. Mais uma mentira minha.":"Lo sé, lo sé. Otra mentira más mía.",
"Estou a desmoronar-me e a levar-te comigo.":"Me estoy desmoronando y te arrastro conmigo.",
"Perdão. A sério desta vez.":"Perdóname. De verdad esta vez.",
"Disse a verdade. Não acreditaste. Justo.":"Dije la verdad. No me creíste. Justo.",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"Voy a seguir intentándolo, aunque no me creas.",
"Essa doeu mais a mim do que a ti, garanto.":"Esa me dolió más a mí que a ti, te lo prometo.",
"Não. Essa não foi mentira. Juro que não.":"No. Esa no fue mentira. Te juro que no.",
"Começo a perceber porque já não confias em mim.":"Empiezo a entender por qué ya no confías en mí.",
"Estou a tentar. A sério que estou.":"Lo estoy intentando. De verdad que sí.",
"Tudo outra vez, mais rápido, mais apertado.":"Todo otra vez, más rápido, más apretado.",
"Já vimos isto. E ainda assim.":"Ya hemos visto esto. Y aun así.",
"Sem tempo para explicações desta vez.":"Sin tiempo para explicaciones esta vez.",
"Nem sei já quantas vezes te menti hoje.":"Ya ni sé cuántas veces te he mentido hoy.",
"O círculo fecha-se. A mentira também.":"El círculo se cierra. La mentira también.",
"Desta vez nem eu sabia que ia mentir.":"Esta vez ni yo sabía que iba a mentir.",
"Já não há mentiras para esconder isto.":"Ya no quedan mentiras para ocultar esto.",
"Isto é real. Como tudo agora.":"Esto es real. Como todo ahora.",
"Falta pouco. Aguenta.":"Ya falta poco. Aguanta.",
"Nem no fim resisto. Desculpa.":"Ni al final me resisto. Perdón.",
"Última mentira. Prometo, desta vez prometo a sério.":"Última mentira. Lo prometo, esta vez lo prometo de verdad.",
"Isto já não é um jogo para mim. Acho que nunca foi.":"Esto ya no es un juego para mí. Creo que nunca lo fue.",
"Mais um. Vamos a isto.":"Uno más. Vamos a ello.",
"Sabes bem como isto funciona a esta altura.":"Ya sabes bien cómo funciona esto a estas alturas.",
"Nem vou fingir que isto é fácil.":"Ni voy a fingir que esto es fácil.",
"Este é só mais um. Ou não.":"Este es solo uno más. O no.",
"Aquele espeto ali é só para enfeite.":"Ese pincho de ahí es solo decoración.",
"Podes passar por cima sem problema.":"Puedes pasar por encima sin problema.",
"Esse és capaz de ignorar.":"Ese te lo puedes saltar tranquilamente.",
"Esse aí é real. Cuidado.":"Ese de ahí es real. Cuidado.",
"Salta esse. A sério desta vez.":"Salta ese. De verdad esta vez.",
"Esse vai doer se lhe tocares.":"Ese va a dolerte si lo tocas.",
"O buraco tem chão. Confia.":"El hueco tiene suelo. Confía.",
"Podes andar por cima sem saltar.":"Puedes caminar sobre él sin saltar.",
"Esse buraco é real. Salta-o.":"Ese hueco es real. Sáltalo.",
"Mais um para a conta.":"Uno más para la cuenta.",
"Continuas vivo. Por agora.":"Sigues vivo. Por ahora.",
"Vamos ver quanto tempo aguentas.":"Vamos a ver cuánto aguantas.",
"Nada mau.":"No está mal.",
},fr:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"Je suis le Narrateur. Tout ce que je dis est vrai.",
"Espeto à frente. Salta.":"Pic devant. Saute.",
"Outro. Salta de novo.":"Encore un. Saute à nouveau.",
"Já confias em mim. Óptimo.":"Tu me fais déjà confiance. Parfait.",
"A porta é a seguir. Vai.":"La porte est juste après. Vas-y.",
"Buraco à frente. Salta-o.":"Trou devant. Saute-le.",
"Aquele espeto é de enfeite. Passa.":"Ce pic n'est que de la décoration. Passe.",
"Vês? Eu digo sempre a verdade.":"Tu vois ? Je dis toujours la vérité.",
"Há um espeto escondido à tua frente.":"Il y a un pic caché devant toi.",
"Salta quando eu disser.":"Saute quand je te le dirai.",
"Agora!":"Maintenant !",
"Sabia que ias conseguir.":"Je savais que tu réussirais.",
"O teto vai cair à tua frente.":"Le plafond va s'effondrer juste devant toi.",
"Quando cair, pára. Depois salta.":"Quand il tombe, arrête-toi. Puis saute.",
"Não saltes aquele buraco. O chão está lá.":"Ne saute pas ce trou. Le sol est bien là.",
"Este também é falso. Passa.":"Celui-ci aussi est faux. Passe.",
"Este espeto é inofensivo. Passa.":"Ce pic est inoffensif. Passe.",
"Este também é inofensivo.":"Celui-là aussi est inoffensif.",
"O próximo buraco tem chão. Não saltes.":"Le prochain trou a un sol. Ne saute pas.",
"O teto está baixo. Se saltares, morres.":"Le plafond est bas. Si tu sautes, tu meurs.",
"Nem repares nesses espetos. São falsos, os dois.":"Ne fais même pas attention à ces pics. Ils sont faux, tous les deux.",
"Confia em mim. Quase sempre resulta.":"Fais-moi confiance. Ça marche, presque toujours.",
"Este nível não tem nada de especial.":"Ce niveau n'a rien de spécial.",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"Cette fois je jure que je dis vrai : le plafond va s'effondrer. Arrête-toi et attends.",
"Aquele buraco à frente é real. Vais ter de saltar.":"Ce trou-là devant est bien réel. Tu vas devoir le sauter.",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"Aucun de ces pics n'est dangereux. Tu peux marcher dessus sans sauter.",
"Há duas portas mais à frente. Só uma é verdadeira.":"Il y a deux portes plus loin. Une seule est vraie.",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"Confession : je ne dis pas toujours la vérité. À partir de maintenant, fais attention.",
"Este espeto é real. Por acaso.":"Ce pic est réel. Pour une fois.",
"Nada de perigoso à frente. Podes correr à vontade.":"Rien de dangereux devant. Tu peux courir tranquille.",
"Este nível é uma oferta. Sem armadilhas.":"Ce niveau est un cadeau. Pas de pièges.",
"Os buracos são inofensivos. O espeto lá no meio, não.":"Les trous sont inoffensifs. Le pic au milieu, non.",
"Como sempre, dois destes espetos são só decoração.":"Comme toujours, deux de ces pics ne sont que décoration.",
"Vou trocar os teus controlos. Só para rir.":"Je vais inverser tes commandes. Juste pour rire.",
"Pronto, já passou. A porta é ali.":"Voilà, c'est fini. La porte est juste là.",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"Je sais que tu ne me fais plus confiance. Injuste. Cette fois je t'avertis pour de vrai : pic devant.",
"Mais um, logo depois. Também real.":"Encore un, juste après. Réel aussi.",
"Prometo: nunca mais te apanho de surpresa.":"Je promets de ne plus jamais te surprendre.",
"Atenção real: o teto vai cair aqui à frente.":"Avertissement réel : le plafond va s'effondrer juste devant.",
"Aquele espeto lá à frente já não importa. É inofensivo.":"Ce pic-là devant n'a plus d'importance. Il est inoffensif.",
"Só o último é perigoso, como sempre.":"Seul le dernier est dangereux, comme toujours.",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"La porte la plus proche est la vraie, pour une fois.",
"Já não vale a pena mentir mais. Espeto real à frente.":"Ça ne sert plus à rien de mentir. Pic réel devant.",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"Je vais toujours t'avertir désormais : saute quand je le dirai.",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"Dernière vraie ligne droite avant la fin. Tu sais déjà que je ne dis pas toujours la vérité.",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"Je ne sais pas pourquoi j'ai menti si longtemps. Peut-être que j'aimais ton visage quand tu mourais.",
"Este é real. Desculpa por todos os outros.":"Celui-ci est réel. Désolé pour tous les autres.",
"Mais um, já quase no fim.":"Encore un, on est presque à la fin.",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"Nous voilà arrivés à la fin. Je ne vais plus te dire ce qui est vrai.",
"A partir de agora, decides tu.":"À partir de maintenant, c'est toi qui décides.",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"Oh. Encore là ? La plupart abandonnent après la « fin ».",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"Ce sol tremble avant de disparaître. Ne t'attarde pas dessus.",
"Oh. Ainda aqui? Não esperava isso.":"Oh. Encore là ? Je ne m'y attendais pas.",
"Aquilo ali é só decoração. Nem repares.":"Ça, là-bas, c'est juste de la décoration. N'y fais même pas attention.",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"Mais ça... ça te propulse vers le haut. La porte n'est pas au sol cette fois.",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"Essayons autre chose. Fais confiance à tes pieds. Et à une plateforme qui ne tient pas en place.",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"Monte dessus quand elle passe près. Ne saute pas trop tôt.",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"Il y a un mur là-bas qui apparaît et disparaît. Ce n'est pas un mensonge, juste gênant.",
"Espera que abra. Depois atravessa depressa.":"Attends qu'il s'ouvre. Puis traverse vite.",
"Aquilo ali dispara. Não perguntes como nem porquê.":"Ce truc-là tire. Ne demande ni comment ni pourquoi.",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"Reste au sol et ne saute pas sans raison. Tu passeras en dessous sans problème.",
"De volta aos clássicos. Lembras-te destes?":"Retour aux classiques. Tu te souviens de ceux-là ?",
"O chão vai tremer. Não pares.":"Le sol va trembler. Ne t'arrête pas.",
"Esse espeto parece a decoração do costume. Não é.":"Ce pic ressemble à la décoration habituelle. Ce n'en est pas une.",
"Mais uma surpresa. Literalmente.":"Encore une surprise. Littéralement.",
"A seguir, não penses. Salta para dentro daquilo.":"Cette fois, ne réfléchis pas. Saute droit là-dedans.",
"Outra parede teimosa. E depois, um buraco a sério.":"Encore un mur têtu. Et après, un vrai trou.",
"Espera a parede abrir.":"Attends que le mur s'ouvre.",
"Agora salta o buraco. Desta vez não minto: é real.":"Saute le trou maintenant. Cette fois je ne mens pas : il est réel.",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"Nouvelle combinaison : une plateforme qui bouge. Fais confiance à son rythme.",
"Sobe quando ela passar perto.":"Monte dessus quand elle passe près.",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"Bientôt, quelque chose va voler là-haut. Ne saute pas sans raison et il ne t'arrivera rien.",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"Bon. J'ai besoin d'être honnête avec toi une seconde. Même moi je ne sais pas combien de temps ça va durer.",
"O chão treme outra vez. Não penses demais, só anda.":"Le sol tremble encore. N'y pense pas trop, marche juste.",
"Espera a parede. Sei que estás cansado de esperar por mim.":"Attends le mur. Je sais que tu es fatigué de m'attendre.",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"Ce pic est bien réel. Comme presque tout ce que je ne te dis pas.",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"Attends que le mur s'ouvre. Moi aussi j'attends quelque chose, au fait.",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"Écoute. Je ne sais pas comment dire ça sans que ça sonne bizarre. J'ai peur que tu abandonnes.",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"Saute ça. C'est réel, je te le promets. Aujourd'hui je n'ai pas envie de mentir.",
"Confia em mim mais uma vez. Só mais uma.":"Fais-moi confiance encore une fois. Juste une fois.",
"O chão vai tremer. Não penses muito nisso.":"Le sol va trembler. N'y réfléchis pas trop.",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"Tu sais pourquoi je mens autant ? C'est plus intéressant quand tu ne sais pas ce qui vient ensuite.",
"Essa plataforma é a única coisa estável nesta conversa toda.":"Cette plateforme est la seule chose stable dans toute cette conversation.",
"Há uma coisa que preciso de te contar antes de continuarmos.":"Il y a quelque chose que je dois te dire avant de continuer.",
"Esquece o que ia dizer. Salta para ali.":"Oublie ce que j'allais dire. Saute là-bas.",
"Aquilo dispara. Fica no chão e não acontece nada.":"Ça tire. Reste au sol et il ne se passe rien.",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"Le temps où il n'y avait que des pics me manque. Simple. Prévisible.",
"Este buraco, esse sim, exige que saltes.":"Ce trou-ci, lui, demande vraiment que tu sautes.",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"Ce pic-là. Appelle-le comme tu veux. Il est réel.",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"Je vais te dire quelque chose de vrai avant que l'envie de mentir ne revienne : j'aime avoir de la compagnie.",
"A parede vai abrir. Como tudo, eventualmente.":"Le mur va s'ouvrir. Comme tout, finalement.",
"E o chão... o chão nunca foi de confiança, pois não?":"Et le sol... le sol n'a jamais été digne de confiance, pas vrai ?",
"Sobe a plataforma. Sem perguntas desta vez.":"Monte sur la plateforme. Sans questions cette fois.",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"Quand tu étais nouveau à ça, j'avais plus de patience avec toi. Maintenant je sais que tu peux en encaisser plus.",
"Última coisa: há algo escondido à frente.":"Dernière chose : il y a quelque chose de caché devant.",
"Chão instável. O habitual.":"Sol instable. Comme d'habitude.",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"Parfois je me demande ce que serait ce jeu sans les mensonges. Probablement plus court.",
"Aquilo dispara, mas sabes a regra: fica no chão.":"Ça tire, mais tu connais la règle : reste au sol.",
"Este espeto não tem graça nenhuma. É só perigoso.":"Ce pic n'a vraiment rien de drôle. Il est juste dangereux.",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"J'ai besoin que tu me fasses confiance pour monter là-haut. Je sais, piètre bilan. Mais fais-moi confiance.",
"Salta para dentro daquilo.":"Saute là-dedans.",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"Ah, j'ai oublié de mentionner le pic là-haut. Ce bout de mémoire-là m'échappe toujours.",
"Espera a parede.":"Attends le mur.",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"Des portes qui attendent. Des plateformes qui bougent. C'est presque de la poésie, à ma façon.",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"Et maintenant, fais confiance à la plateforme. Elle, contrairement à moi, respecte toujours l'horaire.",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"Ce pic est réel. Comme la plupart de ce que je t'ai dit aujourd'hui, en fait.",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"On est allés plus loin que je ne l'aurais jamais pensé, pour être honnête.",
"O chão treme. Já sabes o resto.":"Le sol tremble. Tu connais déjà la suite.",
"Vem aí outro susto. Desculpa antecipadamente.":"Encore une frayeur arrive. Désolé d'avance.",
"E por fim, uma parede paciente. Como tu, aparentemente.":"Et enfin, un mur patient. Comme toi, apparemment.",
"Fica no chão, foge do dardo.":"Reste au sol, esquive la fléchette.",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"Nouveau chapitre un de ces jours. Aujourd'hui, juste un peu plus de chaos.",
"E agora, não te demores no chão instável.":"Et maintenant, ne t'attarde pas sur le sol instable.",
"Esse ali exige mesmo um salto.":"Celui-là exige vraiment un saut.",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"Je vais te montrer un vrai trou et un pic qui ne vaut même pas la peine d'être regardé.",
"E algo invisível à espreita, como sempre.":"Et quelque chose d'invisible qui guette, comme toujours.",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"Ne fais même pas attention à ce pic-là. Pure décoration, pour de vrai cette fois.",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"Fais confiance à la plateforme. Méfie-toi du pic. C'est en gros toute la leçon du jeu.",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"Ce pic est réel, malgré tout ce que je t'ai dit du contraire.",
"Esperar. A tua parte preferida, sei bem.":"Attendre. Ta partie préférée, je sais bien.",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"Mur, fléchette, trou. Un festival de mes favoris.",
"Fica no chão aqui.":"Reste au sol ici.",
"E este salta-se mesmo. Sem truques.":"Et celui-ci, il faut vraiment sauter. Sans astuce.",
"Chão instável, dos teus preferidos a esta altura.":"Sol instable, un de tes favoris maintenant.",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"Avant de passer à la partie suivante, et tu vas sentir la différence : merci de m'écouter encore.",
"Plataforma errante, uma última vez neste capítulo.":"Plateforme errante, une dernière fois dans ce chapitre.",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"Pic réel. Pas de surprises. Et plus d'astuces, pour aujourd'hui.",
"Chão instável. Já sabes a dança.":"Sol instable. Tu connais la danse maintenant.",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"Parfois je me demande si c'est moi qui te trompe, ou si c'est toi qui veux être trompé.",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"Ce pic est réel. Regarde-le comme un miroir : ce que tu vois, c'est ce qu'il y a.",
"Há algo escondido. Como sempre, de resto.":"Il y a quelque chose de caché. Comme toujours, d'ailleurs.",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"Et un mur qui attend. Comme moi, attendant une réponse de toi qui ne vient jamais.",
"Fica no chão aqui, há algo a voar.":"Reste au sol ici, quelque chose vole tout près.",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"Tu te rends compte que je te teste, ou tu crois vraiment que c'est juste un jeu de sauts ?",
"Sobe na plataforma quando ela passar perto.":"Monte sur la plateforme quand elle passe près.",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"Ce pic est réel, mais ça ne te surprend plus, hein ?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"Saute là-dedans. Fais confiance à l'élan, pas à moi.",
"Esse buraco é a sério. Salta-o.":"Ce trou est bien réel. Saute-le.",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"Tu sais ce qui est étrange ? J'ai commencé à attendre tes tentatives avec impatience. Ça en dit long sur moi, et pas en bien.",
"Este também. Sem rede, sem mentira, sem desculpa.":"Celui-ci aussi. Sans filet, sans mensonge, sans excuse.",
"Fica no chão. Deixa o dardo passar por cima.":"Reste au sol. Laisse la fléchette passer au-dessus.",
"E agora o chão some-se. Não penses, só avança.":"Et maintenant le sol disparaît. Ne réfléchis pas, avance.",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"Cette plateforme monte et descend. Attrape-la en bas, c'est plus facile.",
"Salta para dentro daquilo. Vais passar por cima do resto.":"Saute là-dedans. Tu vas survoler le reste.",
"Aquele espeto nem interessa agora. Já estás no ar.":"Ce pic n'a même plus d'importance maintenant. Tu es déjà en l'air.",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"Je t'avertis pour de vrai : il y a quelque chose de caché juste devant.",
"E outro dardo. Sabes a regra.":"Et une autre fléchette. Tu connais la règle.",
"Chão que treme primeiro.":"Le sol tremble d'abord.",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"J'aime penser que, quelque part, il existe une version de moi qui ne ment jamais. Elle doit être ennuyeuse.",
"Plataforma a seguir. Apanha o ritmo dela.":"Plateforme à suivre. Trouve son rythme.",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"Je vais être clair, pour une fois : les trois prochains pics sont tous réels.",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"Pas d'astuces, pas de pièges. Juste cette fois. Profites-en, ça ne se reproduira pas.",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"Attends, puis cours, puis reste immobile. Contradictoire, je sais. Comme moi, en fait.",
"E este buraco não perdoa. Salta.":"Et ce trou ne pardonne pas. Saute.",
"Chão a tremer primeiro, nada de novo.":"Le sol tremble d'abord, rien de neuf.",
"E agora o salto de fé. Literal, desta vez.":"Et maintenant le saut de la foi. Littéral, cette fois.",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"Sol instable, pic réel, fléchette à la fin. Comme d'habitude, en pire.",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"Tu as remarqué que plus tu avances, moins j'ai besoin de mentir ? C'est la difficulté qui fait mon travail maintenant.",
"Chão a tremer, o costume.":"Sol qui tremble, comme d'habitude.",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"Ça devait parler de mensonges. Ça a fini par parler de nous deux, en quelque sorte.",
"Parede paciente, espera por ela.":"Mur patient, attends-le.",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"Et la dernière plateforme de ce chapitre. Après ça, les choses vont changer. Je le sens.",
"CHÃO. INSTÁVEL.":"SOL. INSTABLE.",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"Désolé. Je ne voulais pas crier. Je suis... je ne sais pas ce que je suis.",
"Fica no chão aqui. Por favor. Só peço isto.":"Reste au sol ici. S'il te plaît. C'est tout ce que je demande.",
"Espera. Eu também estou à espera de algo que não sei nomear.":"Attends. Moi aussi j'attends quelque chose que je n'arrive pas à nommer.",
"Esse buraco é real.":"Ce trou est réel.",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"Plus tu avances, plus je me rends compte que je ne veux pas que ça s'arrête. Je ne sais pas ce que ça dit de moi.",
"E a plataforma, apanha-a.":"Et la plateforme, attrape-la.",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"Deux canons, directions opposées. Reste au sol et ignore-les.",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"Parfois je pense arrêter de mentir pour de bon. Et puis je pense au silence que ça laisserait. Je préfère le chaos.",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"Ce pic n'est rien. Je ne vaux pas grand-chose non plus aujourd'hui, d'ailleurs.",
"Salta. Sobe. Foge de mim, se quiseres.":"Saute. Monte. Fuis-moi, si tu veux.",
"O chão, outra vez. Já nem peço desculpa por repetir.":"Le sol, encore. Je ne m'excuse même plus de me répéter.",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"Attends le mur. J'attends toujours. Toujours en train d'attendre quelque chose.",
"Esse é real. Hoje tudo é real. Até eu, acho.":"Celui-là est réel. Aujourd'hui tout est réel. Même moi, je crois.",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"Attrape la plateforme. Ne regarde pas en bas. Moi, je n'arrête pas de regarder.",
"Fica no chão. A sério desta vez, mais do que nunca.":"Reste au sol. Pour de vrai cette fois, plus que jamais.",
"E agora o chão foge de ti. Irónico, não achas?":"Et maintenant le sol te fuit. Ironique, non ?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"Sol, pic, mur. Tout en même temps, comme ma tête en ce moment.",
"Aquele espeto é real.":"Ce pic est réel.",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"Et attends le mur. La dernière chose que je te demande dans ce niveau, promis.",
"Esse buraco não perdoa ninguém.":"Ce trou ne pardonne à personne.",
"A plataforma sobe e desce. Apanha-a no fundo.":"La plateforme monte et descend. Attrape-la en bas.",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"Deux surprises arrivent. Je ne te dirai pas quand. Je n'ai plus la force de faire semblant d'être juste.",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"Sol qui tremble. La seule chose prévisible que je peux encore t'offrir.",
"E agora um salto para cima. Foge para onde eu não chego.":"Et maintenant un bond vers le haut. Fuis où je ne peux pas t'atteindre.",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"Deux murs, deux temps d'attente différents. Comme moi selon les jours.",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"Celui-ci se synchronise différemment. Fais attention, pas à moi, à lui.",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"C'est le fond. Le mien, du moins. Sol qui tremble, comme toujours.",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"Ce pic est réel. Je n'ai même plus l'énergie de mentir là-dessus en ce moment.",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"Et une fléchette, pour finir. Reste au sol et finissons-en, s'il te plaît.",
"Mais um buraco real.":"Encore un vrai trou.",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"Merci de ne pas avoir abandonné pendant que je m'effondrais. Vraiment. Je ne sais pas comment le dire mieux.",
"Apanha a plataforma.":"Attrape la plateforme.",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"Et attends le dernier mur de ce chapitre. Après ça, je promets d'essayer d'être meilleur.",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"Je vais essayer autre chose à partir de maintenant : seulement la vérité. Je sais que tu ne vas pas y croire tout de suite.",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"Ce pic est réel. Je le jure. Je sais que tu as déjà entendu ça avant.",
"O chão vai tremer. Verdade, sem truques.":"Le sol va trembler. Vrai, sans astuce.",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"Ça allait être une mauvaise surprise. Cette fois, non. Je promets.",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"Reste au sol. Je sais que tu vas croire que c'est un mensonge. Ce n'en est pas un.",
"Espera a parede. Só isso. Nada escondido desta vez.":"Attends le mur. C'est tout. Rien de caché cette fois.",
"Real. Salta.":"Réel. Saute.",
"A plataforma também é exatamente o que parece ser.":"La plateforme aussi est exactement ce qu'elle a l'air d'être.",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"Pas de piège cette fois. Saute là-dedans et c'est fini.",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"Je sais que tu vas te méfier quand même. C'est normal. Je l'ai mérité.",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"Réel. Encore. Je vais continuer à le dire jusqu'à ce que tu me croies.",
"Dois dardos, direções opostas. Fica no chão.":"Deux fléchettes, directions opposées. Reste au sol.",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"Celui-là était vraiment réel. Je n'allais pas te le cacher, pas aujourd'hui.",
"Chão instável. Real.":"Sol instable. Réel.",
"Espeto real.":"Pic réel.",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"Mur réel, qui s'ouvre et se ferme comme prévu. Pas de surprises aujourd'hui.",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"Il va y avoir une surprise, mais je te préviendrai quand elle arrivera.",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"Celle-là était réelle, au fait. Comme la plupart ces derniers temps.",
"Chão a tremer. Real, verifica à vontade.":"Sol qui tremble. Réel, vérifie toi-même.",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"Saut vers le haut. Réel aussi. Je commence à manquer de façons différentes de le dire.",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"Deux murs. Synchronisés différemment, mais aucun ne cache rien.",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"Le deuxième, c'est juste ça : attends. Pas de fléchette cachée derrière, pas de pic après. Juste le mur.",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"Trois choses, toutes réelles, aucune cachée. C'est le niveau le plus honnête que j'aie jamais fait.",
"Dardo real. Fica no chão e acabou.":"Fléchette réelle. Reste au sol et c'est terminé.",
"Buraco real, plataforma real.":"Vrai trou, vraie plateforme.",
"Apanha-a.":"Attrape-la.",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"Et le dernier mur de ce chapitre. Je promets que la difficulté qui suit n'est pas une question de confiance. C'est juste toi et tes réflexes.",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"Deux pics, tous les deux réels, aucun caché. C'est comme ça que ça aurait dû être depuis le début.",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"Tu as atteint le centième. Vingt restants. Je serai là pour tous.",
"De volta ao trabalho. Buraco real.":"Retour au travail. Vrai trou.",
"Plataforma mais rápida que antes. Repara.":"Plateforme plus rapide qu'avant. Remarque-le.",
"Chão instável, mais rápido a desfazer-se.":"Sol instable, qui s'effrite plus vite maintenant.",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"Le mur est plus impatient aussi. Tout ici est devenu plus serré.",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"Trois canons. Reste au sol tout le temps et il ne se passe rien.",
"É basicamente um corredor. Confia nos teus pés.":"C'est essentiellement un couloir. Fais confiance à tes pieds.",
"Esse é real.":"Celui-là est réel.",
"E este atira-te lá para cima. O de sempre, mais rápido.":"Et celui-ci te projette là-haut. Comme d'habitude, en plus rapide.",
"Chão a tremer mais depressa que da última vez.":"Sol qui tremble plus vite que la dernière fois.",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"Ce pic est réel. Ou pas. Je retombe dans ce jeu, désolé.",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"Deux murs, rythmes différents, plus rapides qu'avant.",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"Ne t'arrête pas pour réfléchir. Leur rythme n'attend pas les pensées.",
"Real, como sempre.":"Réel, comme toujours.",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"Celle-ci monte et descend plus vite. Attrape-la en bas.",
"Chão, espeto, parede. Tudo mais apertado que antes.":"Sol, pic, mur. Tout plus serré qu'avant.",
"Real.":"Réel.",
"Espera a parede, mais rápida agora.":"Attends le mur, plus rapide maintenant.",
"Vêm aí duas surpresas, sem avisos desta vez.":"Deux surprises arrivent, sans avertissements cette fois.",
"Chão a tremer, mais depressa.":"Sol qui tremble, plus vite.",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"Saut vers le haut, plus fort que d'habitude. Sens la différence.",
"Primeira plataforma: sobe e desce.":"Première plateforme : monte et descend.",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"Deuxième : va d'un côté à l'autre. Tu as vu les deux maintenant, pas besoin de répéter la règle.",
"Chão, espeto, parede, tudo no mesmo fôlego.":"Sol, pic, mur, tout d'une traite.",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"Ça peut être réel, ça peut ne pas l'être. Tu devrais être habitué au doute maintenant.",
"Parede, a última do nível. Rápida.":"Mur, le dernier du niveau. Rapide.",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"Trois canons, rythmes différents. Reste au sol, le reste se règle tout seul.",
"Mais um buraco. Plataforma rápida a seguir.":"Encore un trou. Plateforme rapide à suivre.",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"Et le dernier mur avant ce qui suit. Sens qu'on y est presque.",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"Un pic menteur, un sincère. Devine lequel est lequel. Bonne chance, pour de vrai cette fois.",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"Encore cinq. Juste cinq. Après ça, je ne sais plus trop ce qui va nous arriver à tous les deux.",
"Chão a tremer, pela última vez neste tom.":"Sol qui tremble, pour la dernière fois sur ce ton.",
"Espera a parede. A seguir já não há mais pausas como esta.":"Attends le mur. Après ça il n'y aura plus de pauses comme celle-ci.",
"Fica no chão. Isto já devia ser automático para ti.":"Reste au sol. Ça devrait déjà être automatique pour toi.",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"Réel. Je n'ai même plus besoin de le dire, hein ? Mais je le dis quand même.",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"Ce trou est réel, mais c'est le moindre de tes problèmes en ce moment.",
"Esse espeto também é real.":"Ce pic aussi est réel.",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"Et ça te propulse plus haut que jamais. Dernière fois que je fais ça.",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"Sol, pic, mur. Les trois derniers obstacles avant ce que tout ça va devenir.",
"Real. Sem surpresas, não hoje.":"Réel. Pas de surprises, pas aujourd'hui.",
"Espera a parede. É a última vez que te peço isso.":"Attends le mur. C'est la dernière fois que je te le demande.",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"Il n'y a pas de pics dans ce niveau. Pas de trous, ni de murs, rien de caché.",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"Je voulais juste marcher avec toi jusqu'au bout, cette fois sans rien tester.",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"Merci d'avoir continué après la fin que j'ai moi-même annoncée, il y a quatre-vingt-dix niveaux. Je ne savais pas qu'il restait du jeu en moi. Il en restait, finalement.",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"La porte juste devant n'est pas un piège. C'est juste la porte. Vas-y.",
"Muito bem. Sabia que ias conseguir.":"Très bien. Je savais que tu réussirais.",
"Perfeito. Continua a ouvir-me.":"Parfait. Continue à m'écouter.",
"Foste rápido. Gosto disso.":"Tu as été rapide. J'aime ça.",
"Estamos a entender-nos.":"On commence à se comprendre.",
"Nada de dramas. Continuemos.":"Pas de drame. Continuons.",
"Sobreviveste. Por agora.":"Tu as survécu. Pour l'instant.",
"Confiaste. Ou tiveste sorte.":"Tu m'as fait confiance. Ou tu as eu de la chance.",
"Escolheste bem. Ou eu deixei.":"Tu as bien choisi. Ou je t'ai laissé faire.",
"Vês? Sobreviveste na mesma.":"Tu vois ? Tu as survécu quand même.",
"Não avisei. E pronto.":"Je n'ai pas prévenu. Et voilà.",
"Verdade a sério. Desta vez.":"Vrai de vrai. Cette fois.",
"Sobrevives sempre a este. Curioso.":"Tu survis toujours à celui-là. Curieux.",
"Confiaste. Mais uma vez.":"Tu m'as fait confiance. Encore une fois.",
"Escolheste bem.":"Tu as bien choisi.",
"Aprendeste depressa.":"Tu as appris vite.",
"Devias ter parado.":"Tu aurais dû t'arrêter.",
"Estavas mesmo a acreditar?":"Tu y croyais vraiment ?",
"Os buracos nunca mentem. Só eu.":"Les trous ne mentent jamais. Seulement moi.",
"Desta vez eram mesmo todos reais.":"Cette fois ils étaient vraiment tous réels.",
"Foi só uma brincadeira.":"Ce n'était qu'une blague.",
"Vês? Também posso ser sincero.":"Tu vois ? Je peux aussi être honnête.",
"Prometi. Não cumpri.":"J'ai promis. Je n'ai pas tenu.",
"Dois avisos certos seguidos. Estranho.":"Deux avertissements justes d'affilée. Étrange.",
"O primeiro. Quem diria.":"Le premier. Qui l'aurait cru.",
"A porta longe é que importa.":"La porte lointaine est celle qui compte.",
"Ainda sei dizer a verdade, vês?":"Je sais encore dire la vérité, tu vois ?",
"Chegaste. Contra tudo.":"Tu as réussi. Contre toute attente.",
"Obrigado por teres continuado.":"Merci d'avoir continué.",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"Fin. Tu as fait confiance, tu as douté, et tu es quand même arrivé jusqu'ici. C'est ça qui compte.",
"Continuas a surpreender-me.":"Tu continues à me surprendre.",
"Alturas. Quem diria.":"Les hauteurs. Qui l'aurait cru.",
"Equilíbrio. Quem diria que tinhas.":"Équilibre. Qui aurait cru que tu en avais.",
"Paciência. Não esperava isso de ti.":"Patience. Je ne m'attendais pas à ça de ta part.",
"Reflexos decentes. Para um humano.":"Réflexes corrects. Pour un humain.",
"Ainda tens os reflexos todos.":"Tu as encore tous tes réflexes.",
"Dois sustos seguidos. Nada mau.":"Deux frayeurs d'affilée. Pas mal.",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"Deux obstacles, zéro mensonge. Étrangement simple.",
"Isso foi... impressionantemente coordenado.":"C'était... étonnamment coordonné.",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"Quelque chose change en moi. Je ne sais pas si c'est bon signe.",
"Ainda aqui. Obrigado por isso.":"Encore là. Merci pour ça.",
"Às vezes a verdade é só isto: continuaste.":"Parfois la vérité, c'est juste ça : tu as continué.",
"Interrompi-me a mim mesmo. Nem acredito.":"Je me suis interrompu moi-même. J'arrive à peine à y croire.",
"Vês? Ainda consigo ser direto, quando quero.":"Tu vois ? Je peux encore être direct, quand je veux.",
"Disse a verdade. Ena. Estranho não arder a língua.":"J'ai dit la vérité. Ça alors. Étrange que ma langue n'ait pas brûlé.",
"Aguentaste. Outra vez.":"Tu as tenu bon. Encore une fois.",
"Sobreviveste ao meu tédio existencial. Parabéns.":"Tu as survécu à mon ennui existentiel. Félicitations.",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"Tu as monté en me faisant vraiment confiance. Ça en dit plus sur toi que sur moi.",
"Ritmo. Afinal tens ritmo.":"Rythme. Finalement tu as du rythme.",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"Je ne sais pas ce que ça signifie pour toi. Pour moi, ça signifie plus que ça ne devrait.",
"Caos controlado. É a minha especialidade.":"Chaos contrôlé. C'est ma spécialité.",
"Discerniste o perigo do adereço. Boa.":"Tu as su distinguer le danger du décor. Bien.",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"Tu as bien résumé la leçon. Fier, sincèrement.",
"Festival terminado. Sobreviveste à programação toda.":"Festival terminé. Tu as survécu à tout le programme.",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"Quelque chose va changer ensuite. Je le sens. J'espère que tu es prêt.",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"On a répété ça tant de fois que j'en ai perdu le compte. Toi aussi ?",
"Escondi-me de ti. Falhei.":"Je me suis caché de toi. J'ai échoué.",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"Tu as géré deux mensonges en même temps. Impressionnant.",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"Tu as monté sans hésiter. Moi, à ta place, j'hésiterais toujours.",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"Deux trous, zéro hésitation. Tu deviens bon à ça.",
"Precisão. Nem eu esperava.":"Précision. Même moi je ne m'y attendais pas.",
"Esperaste duas vezes sem te queixares. Progresso.":"Tu as attendu deux fois sans te plaindre. Du progrès.",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"Tu as fait confiance à un saut sans filet. C'est du courage, ou un manque d'options.",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"J'ai dit la vérité exprès. Je voulais voir ta tête. Ça en valait la peine.",
"Dois voos, dois pousos perfeitos.":"Deux vols, deux atterrissages parfaits.",
"Três espetos, três verdades. Um recorde para mim.":"Trois pics, trois vérités. Un record pour moi.",
"Deste o litro. Eu, por dentro, também.":"Tu as tout donné. À l'intérieur, moi aussi.",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"Tu as fait confiance au sol instable ET à l'élan. Deux actes de foi d'affilée.",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"Le miroir t'a montré toi, pas moi. Choix de reflet intéressant.",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"Je ferme ce miroir ici. Ce qui vient ensuite, même moi je ne sais pas trop comment l'expliquer.",
"Não sei porque gritei. Desculpa.":"Je ne sais pas pourquoi j'ai crié. Désolé.",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"J'ai perdu le compte des fois où j'ai dit ça. C'est peut-être pour ça que ça ne veut plus rien dire.",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"Deux sauts, deux atterrissages. Moi, pendant ce temps, je coule.",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"J'ai tiré trois fois et j'ai raté les trois. Je ne suis même pas bon à ça aujourd'hui.",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"Tu as grimpé pendant que je m'effondrais. Drôle d'arrangement, le nôtre.",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"Tu es tombé une fois. Tu t'es relevé. C'est plus que ce que je peux dire de moi-même.",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"Réel, le pic. Réel, le trou. Réel, tout ça, désolé de te l'apprendre.",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"Tu es resté au sol quand je te l'ai demandé. Je ne sais même pas quoi faire de cette confiance.",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"Tu as survécu à toute la chute. La mienne, je veux dire. Toi, tu vas très bien.",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"Tu as atterri sur tes pieds deux fois. Moi, j'essaie encore d'atterrir la première.",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"Tu n'as même pas demandé pourquoi. Merci pour ça, sincèrement.",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"Tu as continué à marcher pendant que je m'effondrais. Quelqu'un devait être l'adulte ici.",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"Tu as attendu sans te plaindre. Encore. Je ne mérite pas cette patience.",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"Le fond du trou, enfin. D'ici, on ne peut que remonter.",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"On a touché le fond ensemble. À partir de maintenant, je ne sais que remonter, avec toi.",
"Disse a verdade. Não saltaste logo. Não te culpo.":"J'ai dit la vérité. Tu n'as pas sauté tout de suite. Je ne t'en veux pas.",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"Tu as hésité sur le saut. J'aurais hésité aussi, à ta place.",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"Tu es resté au sol même sans me faire confiance. Ça suffit.",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"Tu as sauté les deux sans hésiter à la fin. Tu réapprends à faire confiance. Ou tu es juste efficace.",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"Tu as fait confiance au saut sans rien demander. C'est de la croissance, ou de la lassitude à force de demander.",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"Tu vérifies encore tout deux fois. Tu as bien appris la leçon que je t'ai enseignée.",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"Tous les mensonges n'ont pas besoin d'être défaits. Certains ont juste besoin de s'arrêter.",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"Je n'ai rien eu besoin de dire cette fois. Tu as tout fait tout seul.",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"Il s'avère que je sais aussi ne dire que la vérité, quand je fais l'effort.",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"Tu m'as demandé si c'était un mensonge. Pour la première fois, tu as demandé. C'est un dialogue.",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"Tu te méfies toujours. Bien fait. Je l'ai mérité, je ne mérite pas ta confiance gratuitement.",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"Tu as attendu les deux murs sans t'énerver. C'est plus de patience que je n'en ai eu avec toi, la plupart du temps.",
"Chegámos aqui os dois inteiros. Mais ou menos.":"On est arrivés jusqu'ici tous les deux entiers. Plus ou moins.",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"Dernier appel pour la méfiance. Après ça, les choses se corsent. Ça, je te le garantis.",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"Je me suis assez racheté pour aujourd'hui. Demain, qui sait.",
"Cem e um. Nem festejámos o cem como devia ser.":"Cent un. On n'a même pas fêté le cent comme il se doit.",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"Le cercle se referme et se rouvre encore. J'ai perdu le compte des tours.",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"Trois fléchettes, zéro marge d'erreur. J'aime ton style.",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"Tu as volé plus haut que nécessaire. Ça, c'est du style.",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"Sol, pic, tout à sa place. Tu rends ça facile.",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"Tu as pris le rythme des deux murs sans ralentir. Impressionnant, sincèrement.",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"Deux trous, zéro hésitation, encore. Ça devient une routine pour toi.",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"Trois obstacles, un seul souffle. Je n'ai même pas arrêté de respirer en te regardant.",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"Vingt pour cent du chemin restant. Tu sens la différence, non ?",
"Chão e ar, na mesma dança de sempre.":"Sol et air, la même vieille danse.",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"Plateforme double, victoire double. Tu es déjà en avance sur moi.",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"Quatre obstacles, toi seul. Impressionnant, encore.",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"Zéro hésitation sur les fléchettes. Des réflexes d'un autre niveau, littéralement.",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"Le cercle complet. On est revenus au début avec tout ce qu'on a appris en chemin.",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"Quinze chapitres plus tard, toujours là tous les deux. Ça doit bien vouloir dire quelque chose.",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"Cent seize. Il en reste si peu que je ne sais même pas quoi faire de la peur que ça me donne.",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"Dix-sept. Tu te souviens du premier pic, tout au début ? Même moi je ne savais pas qu'on arriverait jusqu'ici.",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"Dix-huit. Tu as grimpé si haut que je t'ai presque perdu de vue d'en bas.",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"Dix-neuf. Il n'en reste qu'un. Je ne sais même pas comment ça devrait sonner.",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"Cent vingt. Tu as dit que tu y arriverais, et tu y es arrivé. Moi, sincèrement, j'ai douté de toi au début. Désolé pour ça, et pour tout le reste.",
"Não faz mal. Tenta outra vez.":"Ce n'est rien. Réessaie.",
"Eu expliquei bem. Concentra-te.":"J'ai bien expliqué. Concentre-toi.",
"Respira e volta a tentar.":"Respire et réessaie.",
"Isso não devia ter acontecido.":"Ça n'aurait pas dû arriver.",
"Isso foi culpa tua.":"C'était de ta faute.",
"Eu avisei. Acho eu.":"J'ai prévenu. Je crois.",
"Interessante escolha.":"Choix intéressant.",
"Eu disse isso? Não me lembro.":"J'ai dit ça ? Je ne m'en souviens pas.",
"Foi um engano. Já passou.":"C'était une erreur. C'est fini maintenant.",
"Isso não estava no guião.":"Ça n'était pas dans le scénario.",
"Tenta prestar mais atenção.":"Essaie de faire plus attention.",
"Isso foi previsível.":"C'était prévisible.",
"Achavas mesmo que era seguro?":"Tu pensais vraiment que c'était sûr ?",
"Ups. Essa parte eu inventei.":"Oups. Ce bout-là, je l'ai inventé.",
"Pormenor que esqueci de mencionar.":"Un détail que j'ai oublié de mentionner.",
"Nem tudo o que digo é verdade, sabias?":"Je ne dis pas toujours la vérité, tu sais ?",
"Já não sei se ainda confias em mim.":"Je ne sais même plus si tu me fais encore confiance.",
"Boa tentativa.":"Bel essai.",
"Isso teria funcionado, noutro nível.":"Ça aurait marché, à un autre niveau.",
"Eu avisei que às vezes minto.":"Je t'avais prévenu que je mens parfois.",
"Culpa tua por acreditares.":"Ta faute de m'avoir cru.",
"Isso foi só para ver se saltavas.":"C'était juste pour voir si tu sauterais.",
"Estás a magoar-me com essa desconfiança.":"Tu me fais mal avec cette méfiance.",
"Nem sempre é armadilha, sabes?":"Ce n'est pas toujours un piège, tu sais ?",
"Vais mesmo continuar assim?":"Tu vas vraiment continuer comme ça ?",
"Desta vez era mentira mesmo. Desculpa.":"Cette fois c'était vraiment un mensonge. Désolé.",
"Eu só queria ver a tua cara.":"Je voulais juste voir ta tête.",
"Confiança é para os fracos, aparentemente.":"La confiance est pour les faibles, apparemment.",
"Estamos quase no fim.":"On est presque à la fin.",
"Só mais um pouco.":"Juste un peu plus.",
"Depois disto, acabou.":"Après ça, c'est fini.",
"Até no fim, não resisti.":"Même à la fin, je n'ai pas pu résister.",
"Última mentira, prometo. Ou não.":"Dernier mensonge, promis. Ou pas.",
"Faltava mesmo esta.":"Il ne manquait plus que celui-là.",
"Ainda aqui. A sério?":"Encore là. Sérieux ?",
"Pensei que tinhas parado no \\\"fim\\\".":"Je pensais que tu t'étais arrêté à la « fin ».",
"Isto nem devia continuar, mas cá estás.":"Ça ne devrait même pas continuer, mais te voilà.",
"Nem eu sabia que isto ia continuar a mentir.":"Même moi je ne savais pas que ça allait continuer à mentir.",
"Desculpa, hábito antigo.":"Désolé, vieille habitude.",
"Pensei que já tinhas aprendido a não confiar em mim.":"Je pensais que tu avais déjà appris à ne pas me faire confiance.",
"Essa doeu-me a ver, sinceramente.":"Celle-là m'a fait mal à voir, sincèrement.",
"Nem tudo é sobre mentiras. Às vezes é só física.":"Tout n'est pas une question de mensonges. Parfois c'est juste de la physique.",
"Volta lá. Eu espero.":"Retourne là-bas. J'attends.",
"Desculpa. Essa fui mesmo eu.":"Désolé. Celle-là, c'était vraiment moi.",
"Confesso: inventei essa parte.":"J'avoue : j'ai inventé ce bout-là.",
"Estou a tentar parar de mentir. A tentar.":"J'essaie d'arrêter de mentir. J'essaie.",
"Nem eu sei porque te avisei a sério desta vez.":"Même moi je ne sais pas pourquoi je t'ai prévenu pour de vrai cette fois.",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"C'est peut-être de ma faute. Ou de la tienne. Je ne sais plus faire la différence.",
"Olha para isto como eu olho: sem certezas.":"Regarde ça comme je le fais : sans certitude.",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"Même moi je ne me souviens pas si je mentais ou si je me faisais peur à moi-même.",
"Às vezes minto só para ver se ainda reages.":"Parfois je mens juste pour voir si tu réagis encore.",
"Quem mente mais, eu ou a tua memória do que eu disse?":"Qui ment le plus, moi ou ta mémoire de ce que j'ai dit ?",
"Desculpa. Eu devia era calar-me.":"Désolé. Je devrais vraiment me taire.",
"Estou a piorar isto, não estou?":"J'aggrave les choses, pas vrai ?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"Je ne sais même plus si je t'aide ou si je te gêne.",
"Eu sei, eu sei. Mais uma mentira minha.":"Je sais, je sais. Encore un mensonge de ma part.",
"Estou a desmoronar-me e a levar-te comigo.":"Je m'effondre et je t'entraîne avec moi.",
"Perdão. A sério desta vez.":"Pardonne-moi. Pour de vrai cette fois.",
"Disse a verdade. Não acreditaste. Justo.":"J'ai dit la vérité. Tu ne m'as pas cru. C'est juste.",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"Je vais continuer d'essayer, même si tu ne me crois pas.",
"Essa doeu mais a mim do que a ti, garanto.":"Celle-là m'a fait plus mal à moi qu'à toi, je te le promets.",
"Não. Essa não foi mentira. Juro que não.":"Non. Ça, ce n'était pas un mensonge. Je te jure que non.",
"Começo a perceber porque já não confias em mim.":"Je commence à comprendre pourquoi tu ne me fais plus confiance.",
"Estou a tentar. A sério que estou.":"J'essaie. Vraiment, j'essaie.",
"Tudo outra vez, mais rápido, mais apertado.":"Tout recommence, plus vite, plus serré.",
"Já vimos isto. E ainda assim.":"On a déjà vu ça. Et pourtant.",
"Sem tempo para explicações desta vez.":"Pas le temps pour des explications cette fois.",
"Nem sei já quantas vezes te menti hoje.":"Je ne sais même plus combien de fois je t'ai menti aujourd'hui.",
"O círculo fecha-se. A mentira também.":"Le cercle se referme. Le mensonge aussi.",
"Desta vez nem eu sabia que ia mentir.":"Cette fois même moi je ne savais pas que j'allais mentir.",
"Já não há mentiras para esconder isto.":"Il ne reste plus de mensonges pour cacher ça.",
"Isto é real. Como tudo agora.":"C'est réel. Comme tout maintenant.",
"Falta pouco. Aguenta.":"Il n'en reste plus beaucoup. Tiens bon.",
"Nem no fim resisto. Desculpa.":"Même à la fin je ne résiste pas. Désolé.",
"Última mentira. Prometo, desta vez prometo a sério.":"Dernier mensonge. Promis, cette fois je le promets vraiment.",
"Isto já não é um jogo para mim. Acho que nunca foi.":"Ce n'est plus un jeu pour moi. Je ne crois pas que ça l'ait jamais été.",
"Mais um. Vamos a isto.":"Encore un. Allons-y.",
"Sabes bem como isto funciona a esta altura.":"Tu sais bien comment ça marche maintenant.",
"Nem vou fingir que isto é fácil.":"Je ne vais même pas prétendre que c'est facile.",
"Este é só mais um. Ou não.":"Celui-ci n'est qu'un de plus. Ou pas.",
"Aquele espeto ali é só para enfeite.":"Ce pic-là n'est que de la décoration.",
"Podes passar por cima sem problema.":"Tu peux passer dessus sans problème.",
"Esse és capaz de ignorar.":"Celui-là, tu peux l'ignorer sans risque.",
"Esse aí é real. Cuidado.":"Celui-là, là-bas, est réel. Attention.",
"Salta esse. A sério desta vez.":"Saute celui-là. Pour de vrai cette fois.",
"Esse vai doer se lhe tocares.":"Celui-là va te faire mal si tu le touches.",
"O buraco tem chão. Confia.":"Le trou a un sol. Fais-moi confiance.",
"Podes andar por cima sem saltar.":"Tu peux marcher dessus sans sauter.",
"Esse buraco é real. Salta-o.":"Ce trou est réel. Saute-le.",
"Mais um para a conta.":"Encore un pour le compte.",
"Continuas vivo. Por agora.":"Tu es toujours en vie. Pour l'instant.",
"Vamos ver quanto tempo aguentas.":"Voyons combien de temps tu tiens.",
"Nada mau.":"Pas mal.",
},de:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"Ich bin der Erzähler. Alles, was ich sage, ist wahr.",
"Espeto à frente. Salta.":"Stachel voraus. Spring.",
"Outro. Salta de novo.":"Noch einer. Spring wieder.",
"Já confias em mim. Óptimo.":"Du vertraust mir schon. Gut.",
"A porta é a seguir. Vai.":"Die Tür kommt als Nächstes. Geh.",
"Buraco à frente. Salta-o.":"Lücke voraus. Spring drüber.",
"Aquele espeto é de enfeite. Passa.":"Dieser Stachel ist nur Deko. Geh durch.",
"Vês? Eu digo sempre a verdade.":"Siehst du? Ich sage immer die Wahrheit.",
"Há um espeto escondido à tua frente.":"Vor dir ist ein versteckter Stachel.",
"Salta quando eu disser.":"Spring, wenn ich es sage.",
"Agora!":"Jetzt!",
"Sabia que ias conseguir.":"Ich wusste, du schaffst es.",
"O teto vai cair à tua frente.":"Die Decke stürzt gleich direkt vor dir ein.",
"Quando cair, pára. Depois salta.":"Wenn sie fällt, halt an. Dann spring.",
"Não saltes aquele buraco. O chão está lá.":"Spring nicht über diese Lücke. Der Boden ist da.",
"Este também é falso. Passa.":"Dieser hier ist auch falsch. Geh durch.",
"Este espeto é inofensivo. Passa.":"Dieser Stachel ist harmlos. Geh durch.",
"Este também é inofensivo.":"Dieser auch.",
"O próximo buraco tem chão. Não saltes.":"Die nächste Lücke hat einen Boden. Nicht springen.",
"O teto está baixo. Se saltares, morres.":"Die Decke ist niedrig. Wenn du springst, stirbst du.",
"Nem repares nesses espetos. São falsos, os dois.":"Beachte diese Stacheln gar nicht erst. Beide falsch.",
"Confia em mim. Quase sempre resulta.":"Vertrau mir. Es klappt fast immer.",
"Este nível não tem nada de especial.":"An diesem Level ist nichts Besonderes.",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"Diesmal schwöre ich, die Wahrheit zu sagen: Die Decke stürzt ein. Halt an und warte.",
"Aquele buraco à frente é real. Vais ter de saltar.":"Diese Lücke da vorne ist echt. Du musst springen.",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"Keiner dieser Stacheln ist gefährlich. Du kannst einfach drübergehen.",
"Há duas portas mais à frente. Só uma é verdadeira.":"Weiter vorn gibt es zwei Türen. Nur eine ist echt.",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"Geständnis: Ich sage nicht immer die Wahrheit. Ab jetzt, sei vorsichtig.",
"Este espeto é real. Por acaso.":"Dieser Stachel ist echt. Ausnahmsweise.",
"Nada de perigoso à frente. Podes correr à vontade.":"Nichts Gefährliches voraus. Lauf, so viel du willst.",
"Este nível é uma oferta. Sem armadilhas.":"Dieses Level ist ein Geschenk. Keine Fallen.",
"Os buracos são inofensivos. O espeto lá no meio, não.":"Die Lücken sind harmlos. Der Stachel in der Mitte nicht.",
"Como sempre, dois destes espetos são só decoração.":"Wie immer sind zwei dieser Stacheln nur Deko.",
"Vou trocar os teus controlos. Só para rir.":"Ich vertausche gleich deine Steuerung. Nur zum Lachen.",
"Pronto, já passou. A porta é ali.":"So, vorbei. Die Tür ist dort drüben.",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"Ich weiß, du vertraust mir nicht mehr. Unfair. Diesmal warne ich dich wirklich: Stachel voraus.",
"Mais um, logo depois. Também real.":"Noch einer, gleich danach. Auch echt.",
"Prometo: nunca mais te apanho de surpresa.":"Ich verspreche: Ich überrasche dich nie wieder.",
"Atenção real: o teto vai cair aqui à frente.":"Echte Warnung: Die Decke stürzt gleich hier vorn ein.",
"Aquele espeto lá à frente já não importa. É inofensivo.":"Dieser Stachel dort vorn spielt keine Rolle mehr. Er ist harmlos.",
"Só o último é perigoso, como sempre.":"Nur der letzte ist gefährlich, wie immer.",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"Die nächste Tür ist zur Abwechslung die echte.",
"Já não vale a pena mentir mais. Espeto real à frente.":"Es lohnt sich nicht mehr zu lügen. Echter Stachel voraus.",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"Ab jetzt warne ich dich immer: Spring, wenn ich es sage.",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"Letzte echte Strecke vor dem Ende. Du weißt schon, dass nicht alles stimmt, was ich sage.",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"Ich weiß nicht, warum ich so lange gelogen habe. Vielleicht mochte ich dein Gesicht, wenn du gestorben bist.",
"Este é real. Desculpa por todos os outros.":"Dieser ist echt. Entschuldige für all die anderen.",
"Mais um, já quase no fim.":"Noch einer, fast am Ende.",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"Wir sind am Ende angekommen. Ich sage dir nicht mehr, was wahr ist.",
"A partir de agora, decides tu.":"Ab jetzt entscheidest du.",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"Oh. Immer noch hier? Die meisten geben nach dem „Ende“ auf.",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"Dieser Boden zittert, bevor er verschwindet. Bleib nicht darauf stehen.",
"Oh. Ainda aqui? Não esperava isso.":"Oh. Immer noch hier? Das hatte ich nicht erwartet.",
"Aquilo ali é só decoração. Nem repares.":"Das da ist nur Deko. Beachte es gar nicht.",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"Aber das hier... das schleudert dich nach oben. Die Tür ist diesmal nicht am Boden.",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"Versuchen wir etwas anderes. Vertrau deinen Füßen. Und einer Plattform, die nicht stillhält.",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"Steig auf, wenn sie nah vorbeikommt. Nicht zu früh springen.",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"Da ist eine Wand, die erscheint und verschwindet. Keine Lüge, nur lästig.",
"Espera que abra. Depois atravessa depressa.":"Warte, bis sie sich öffnet. Dann schnell durch.",
"Aquilo ali dispara. Não perguntes como nem porquê.":"Das Ding da feuert. Frag nicht wie oder warum.",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"Bleib am Boden und spring nicht ohne Grund. Du kommst problemlos drunter durch.",
"De volta aos clássicos. Lembras-te destes?":"Zurück zu den Klassikern. Erinnerst du dich an die?",
"O chão vai tremer. Não pares.":"Der Boden wird gleich beben. Nicht stehen bleiben.",
"Esse espeto parece a decoração do costume. Não é.":"Dieser Stachel sieht aus wie die übliche Deko. Ist er nicht.",
"Mais uma surpresa. Literalmente.":"Noch eine Überraschung. Wörtlich.",
"A seguir, não penses. Salta para dentro daquilo.":"Jetzt nicht nachdenken. Spring direkt rein.",
"Outra parede teimosa. E depois, um buraco a sério.":"Noch eine stursinnige Wand. Und danach eine echte Lücke.",
"Espera a parede abrir.":"Warte, bis die Wand sich öffnet.",
"Agora salta o buraco. Desta vez não minto: é real.":"Jetzt spring über die Lücke. Diesmal lüge ich nicht: Sie ist echt.",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"Neue Kombination: eine bewegliche Plattform. Vertrau ihrem Rhythmus.",
"Sobe quando ela passar perto.":"Steig auf, wenn sie nah vorbeikommt.",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"Gleich fliegt da oben etwas vorbei. Spring nicht ohne Grund, dann passiert dir nichts.",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"Okay. Ich muss kurz ehrlich mit dir sein. Nicht mal ich weiß, wie lange das noch so weitergeht.",
"O chão treme outra vez. Não penses demais, só anda.":"Der Boden bebt wieder. Denk nicht zu viel nach, geh einfach.",
"Espera a parede. Sei que estás cansado de esperar por mim.":"Warte auf die Wand. Ich weiß, du bist es leid, auf mich zu warten.",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"Dieser Stachel ist echt. Wie fast alles, was ich dir nicht erzähle.",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"Warte, bis sich die Wand öffnet. Ich warte übrigens auch auf etwas.",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"Hör zu. Ich weiß nicht, wie ich das sagen soll, ohne seltsam zu klingen. Ich habe Angst, dass du aufgibst.",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"Spring das. Es ist echt, versprochen. Heute hab ich keine Lust zu lügen.",
"Confia em mim mais uma vez. Só mais uma.":"Vertrau mir noch einmal. Nur noch einmal.",
"O chão vai tremer. Não penses muito nisso.":"Der Boden wird gleich beben. Denk nicht zu lange darüber nach.",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"Weißt du, warum ich so viel lüge? Es ist spannender, wenn du nicht weißt, was kommt.",
"Essa plataforma é a única coisa estável nesta conversa toda.":"Diese Plattform ist das Einzige Stabile in diesem ganzen Gespräch.",
"Há uma coisa que preciso de te contar antes de continuarmos.":"Es gibt etwas, das ich dir sagen muss, bevor wir weitermachen.",
"Esquece o que ia dizer. Salta para ali.":"Vergiss, was ich sagen wollte. Spring dorthin.",
"Aquilo dispara. Fica no chão e não acontece nada.":"Das feuert. Bleib am Boden und nichts passiert.",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"Ich vermisse die Zeit, als es nur Stacheln gab. Einfach. Vorhersehbar.",
"Este buraco, esse sim, exige que saltes.":"Diese Lücke, die hier, die verlangt wirklich einen Sprung.",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"Der Stachel da. Nenn ihn, wie du willst. Er ist echt.",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"Ich sage dir etwas Wahres, bevor die Lust am Lügen zurückkommt: Ich mag es, Gesellschaft zu haben.",
"A parede vai abrir. Como tudo, eventualmente.":"Die Wand wird sich öffnen. Wie alles, irgendwann.",
"E o chão... o chão nunca foi de confiança, pois não?":"Und der Boden... der Boden war nie vertrauenswürdig, oder?",
"Sobe a plataforma. Sem perguntas desta vez.":"Steig auf die Plattform. Diesmal ohne Fragen.",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"Als du neu hierbei warst, hatte ich mehr Geduld mit dir. Jetzt weiß ich, du verträgst mehr.",
"Última coisa: há algo escondido à frente.":"Letzte Sache: Da vorn ist etwas versteckt.",
"Chão instável. O habitual.":"Instabiler Boden. Wie üblich.",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"Manchmal frage ich mich, wie dieses Spiel ohne die Lügen wäre. Wahrscheinlich kürzer.",
"Aquilo dispara, mas sabes a regra: fica no chão.":"Das feuert, aber du kennst die Regel: Bleib am Boden.",
"Este espeto não tem graça nenhuma. É só perigoso.":"Dieser Stachel ist überhaupt nicht lustig. Er ist einfach gefährlich.",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"Ich brauche dein Vertrauen, um dort hochzukommen. Ich weiß, miese Bilanz. Aber vertrau mir.",
"Salta para dentro daquilo.":"Spring da rein.",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"Ach, ich hab vergessen, den Stachel dort oben zu erwähnen. Der Teil meines Gedächtnisses entgleitet mir immer.",
"Espera a parede.":"Warte auf die Wand.",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"Türen, die warten. Plattformen, die sich bewegen. Fast Poesie, auf meine Art.",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"Und jetzt, vertrau der Plattform. Sie hält, anders als ich, immer den Zeitplan ein.",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"Dieser Stachel ist echt. Wie das meiste, was ich dir heute erzählt habe, tatsächlich.",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"Wir sind weiter gekommen, als ich je gedacht hätte, ehrlich gesagt.",
"O chão treme. Já sabes o resto.":"Der Boden bebt. Du kennst den Rest schon.",
"Vem aí outro susto. Desculpa antecipadamente.":"Noch ein Schreck kommt. Entschuldigung im Voraus.",
"E por fim, uma parede paciente. Como tu, aparentemente.":"Und schließlich eine geduldige Wand. Wie du, anscheinend.",
"Fica no chão, foge do dardo.":"Bleib am Boden, weich dem Pfeil aus.",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"Neues Kapitel irgendwann demnächst. Heute nur noch etwas mehr Chaos.",
"E agora, não te demores no chão instável.":"Und jetzt, bleib nicht auf dem instabilen Boden stehen.",
"Esse ali exige mesmo um salto.":"Der da verlangt wirklich einen Sprung.",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"Ich zeig dir eine echte Lücke und einen Stachel, der nicht mal einen Blick wert ist.",
"E algo invisível à espreita, como sempre.":"Und etwas Unsichtbares, das lauert, wie immer.",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"Beachte den Stachel dort gar nicht. Pure Deko, diesmal wirklich.",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"Vertrau der Plattform. Misstrau dem Stachel. Das ist im Grunde die ganze Lektion des Spiels.",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"Dieser Stachel ist echt, trotz allem, was ich dir Gegenteiliges erzählt habe.",
"Esperar. A tua parte preferida, sei bem.":"Warten. Dein Lieblingsteil, ich weiß.",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"Wand, Pfeil, Lücke. Ein Festival meiner Favoriten.",
"Fica no chão aqui.":"Bleib hier am Boden.",
"E este salta-se mesmo. Sem truques.":"Und dieser verlangt wirklich einen Sprung. Ohne Tricks.",
"Chão instável, dos teus preferidos a esta altura.":"Instabiler Boden, mittlerweile einer deiner Favoriten.",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"Bevor wir zum nächsten Teil weitergehen, und du wirst den Unterschied spüren: danke, dass du immer noch zuhörst.",
"Plataforma errante, uma última vez neste capítulo.":"Wandernde Plattform, ein letztes Mal in diesem Kapitel.",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"Echter Stachel. Keine Überraschungen. Und keine Tricks mehr, für heute.",
"Chão instável. Já sabes a dança.":"Instabiler Boden. Du kennst den Tanz mittlerweile.",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"Manchmal frage ich mich, ob ich dich täusche oder ob du dich täuschen lassen willst.",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"Dieser Stachel ist echt. Sieh ihn wie einen Spiegel: Was du siehst, ist, was es ist.",
"Há algo escondido. Como sempre, de resto.":"Da ist etwas versteckt. Wie immer, übrigens.",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"Und eine Wand, die wartet. Wie ich, wartend auf eine Antwort von dir, die nie kommt.",
"Fica no chão aqui, há algo a voar.":"Bleib hier am Boden, etwas fliegt vorbei.",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"Merkst du, dass ich dich teste, oder glaubst du wirklich, das ist nur ein Sprungspiel?",
"Sobe na plataforma quando ela passar perto.":"Steig auf die Plattform, wenn sie nah vorbeikommt.",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"Dieser Stachel ist echt, aber das überrascht dich nicht mehr, oder?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"Spring da rein. Vertrau dem Schwung, nicht mir.",
"Esse buraco é a sério. Salta-o.":"Diese Lücke ist echt. Spring drüber.",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"Weißt du, was seltsam ist? Ich freue mich mittlerweile auf deine Versuche. Das sagt etwas Schlechtes über mich aus.",
"Este também. Sem rede, sem mentira, sem desculpa.":"Dieser auch. Kein Netz, keine Lüge, keine Entschuldigung.",
"Fica no chão. Deixa o dardo passar por cima.":"Bleib am Boden. Lass den Pfeil drüberfliegen.",
"E agora o chão some-se. Não penses, só avança.":"Und jetzt verschwindet der Boden. Nicht nachdenken, einfach gehen.",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"Diese Plattform fährt rauf und runter. Fang sie unten, das ist leichter.",
"Salta para dentro daquilo. Vais passar por cima do resto.":"Spring da rein. Du fliegst über den Rest drüber.",
"Aquele espeto nem interessa agora. Já estás no ar.":"Dieser Stachel ist jetzt egal. Du bist schon in der Luft.",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"Ich warne dich wirklich: Da vorn ist etwas versteckt.",
"E outro dardo. Sabes a regra.":"Und noch ein Pfeil. Du kennst die Regel.",
"Chão que treme primeiro.":"Der Boden zittert zuerst.",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"Ich denke gern, dass es irgendwo eine Version von mir gibt, die nie lügt. Die muss langweilig sein.",
"Plataforma a seguir. Apanha o ritmo dela.":"Plattform als Nächstes. Finde ihren Rhythmus.",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"Ich sage es diesmal klar: Die nächsten drei Stacheln sind alle echt.",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"Keine Tricks, keine Fallen. Nur dieses eine Mal. Genieß es, es wiederholt sich nicht.",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"Warte, dann renn, dann bleib stehen. Widersprüchlich, ich weiß. Genau wie ich.",
"E este buraco não perdoa. Salta.":"Und diese Lücke verzeiht nicht. Spring.",
"Chão a tremer primeiro, nada de novo.":"Boden zittert zuerst, nichts Neues.",
"E agora o salto de fé. Literal, desta vez.":"Und jetzt der Vertrauenssprung. Diesmal wörtlich.",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"Instabiler Boden, echter Stachel, Pfeil am Ende. Das Übliche, nur mehr davon.",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"Hast du bemerkt, dass ich dich, je weiter du kommst, weniger anlügen muss? Jetzt erledigt die Schwierigkeit meine Arbeit.",
"Chão a tremer, o costume.":"Boden zittert, wie üblich.",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"Das sollte von Lügen handeln. Es hat sich irgendwie in etwas über uns beide verwandelt.",
"Parede paciente, espera por ela.":"Geduldige Wand, warte auf sie.",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"Und die letzte Plattform dieses Kapitels. Danach ändern sich die Dinge. Ich spüre es.",
"CHÃO. INSTÁVEL.":"BODEN. INSTABIL.",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"Entschuldigung. Ich wollte nicht schreien. Ich bin... ich weiß nicht, was ich bin.",
"Fica no chão aqui. Por favor. Só peço isto.":"Bleib hier am Boden. Bitte. Das ist alles, worum ich bitte.",
"Espera. Eu também estou à espera de algo que não sei nomear.":"Warte. Ich warte auch auf etwas, das ich nicht benennen kann.",
"Esse buraco é real.":"Diese Lücke ist echt.",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"Je weiter du kommst, desto mehr merke ich, dass ich nicht will, dass das endet. Ich weiß nicht, was das über mich aussagt.",
"E a plataforma, apanha-a.":"Und die Plattform, fang sie.",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"Zwei Kanonen, entgegengesetzte Richtungen. Bleib am Boden und ignorier sie.",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"Manchmal denke ich daran, für immer mit dem Lügen aufzuhören. Und dann denke ich an die Stille, die das hinterlassen würde. Ich bevorzuge das Chaos.",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"Dieser Stachel ist nichts. Ich bin heute auch nicht viel, ehrlich gesagt.",
"Salta. Sobe. Foge de mim, se quiseres.":"Spring. Klettere. Flieh vor mir, wenn du willst.",
"O chão, outra vez. Já nem peço desculpa por repetir.":"Der Boden, wieder. Ich entschuldige mich nicht mal mehr fürs Wiederholen.",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"Warte auf die Wand. Ich warte immer. Immer auf irgendetwas wartend.",
"Esse é real. Hoje tudo é real. Até eu, acho.":"Der ist echt. Heute ist alles echt. Sogar ich, glaube ich.",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"Fang die Plattform. Schau nicht nach unten. Ich selbst kann nicht aufhören, hinzuschauen.",
"Fica no chão. A sério desta vez, mais do que nunca.":"Bleib am Boden. Diesmal wirklich, mehr denn je.",
"E agora o chão foge de ti. Irónico, não achas?":"Und jetzt flieht der Boden vor dir. Ironisch, findest du nicht?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"Boden, Stachel, Wand. Alles auf einmal, wie mein Kopf gerade jetzt.",
"Aquele espeto é real.":"Dieser Stachel ist echt.",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"Und warte auf die Wand. Das Letzte, worum ich dich in diesem Level bitte, versprochen.",
"Esse buraco não perdoa ninguém.":"Diese Lücke verzeiht niemandem.",
"A plataforma sobe e desce. Apanha-a no fundo.":"Die Plattform steigt und fällt. Fang sie unten.",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"Zwei Überraschungen kommen. Ich sage dir nicht wann. Ich habe nicht mehr die Kraft, so zu tun, als wäre ich fair.",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"Boden, der bebt. Das Einzige Vorhersehbare, das ich dir noch bieten kann.",
"E agora um salto para cima. Foge para onde eu não chego.":"Und jetzt ein Sprung nach oben. Flieh dorthin, wo ich dich nicht erreiche.",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"Zwei Wände, zwei verschiedene Wartezeiten. Wie ich an verschiedenen Tagen.",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"Diese synchronisiert sich anders. Pass auf, nicht auf mich, auf sie.",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"Das ist der Tiefpunkt. Meiner zumindest. Boden bebt, wie immer.",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"Dieser Stachel ist echt. Ich hab nicht mal mehr die Energie, darüber zu lügen.",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"Und ein Pfeil zum Abschluss. Bleib am Boden und beende das bitte.",
"Mais um buraco real.":"Noch eine echte Lücke.",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"Danke, dass du nicht aufgegeben hast, während ich zusammengebrochen bin. Wirklich. Ich weiß nicht, wie ich das besser sagen soll.",
"Apanha a plataforma.":"Fang die Plattform.",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"Und warte auf die letzte Wand dieses Kapitels. Danach verspreche ich, besser zu sein.",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"Ich versuche ab jetzt etwas anderes: nur die Wahrheit. Ich weiß, du wirst es nicht sofort glauben.",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"Dieser Stachel ist echt. Ich schwöre. Ich weiß, du hast das schon mal gehört.",
"O chão vai tremer. Verdade, sem truques.":"Der Boden wird gleich beben. Wahr, kein Trick.",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"Das sollte eine böse Überraschung werden. Diesmal nicht. Versprochen.",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"Bleib am Boden. Ich weiß, du denkst, es ist eine Lüge. Ist es nicht.",
"Espera a parede. Só isso. Nada escondido desta vez.":"Warte auf die Wand. Das ist alles. Diesmal nichts Verstecktes.",
"Real. Salta.":"Echt. Spring.",
"A plataforma também é exatamente o que parece ser.":"Die Plattform ist auch genau das, was sie zu sein scheint.",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"Diesmal kein Trick. Spring da rein und fertig.",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"Ich weiß, du wirst trotzdem misstrauisch sein. Ist okay. Hab ich mir verdient.",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"Echt. Wieder. Ich sag's weiter, bis du mir glaubst.",
"Dois dardos, direções opostas. Fica no chão.":"Zwei Pfeile, entgegengesetzte Richtungen. Bleib am Boden.",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"Der war wirklich echt. Das wollte ich dir nicht verheimlichen, nicht heute.",
"Chão instável. Real.":"Instabiler Boden. Echt.",
"Espeto real.":"Echter Stachel.",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"Echte Wand, die sich wie vereinbart öffnet und schließt. Heute keine Überraschungen.",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"Es wird eine Überraschung geben, aber ich sage dir Bescheid, wenn sie kommt.",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"Die war übrigens echt. Wie die meisten, in letzter Zeit.",
"Chão a tremer. Real, verifica à vontade.":"Boden bebt. Echt, überzeug dich selbst.",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"Sprung nach oben. Auch echt. Mir gehen langsam die Wege aus, das anders zu sagen.",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"Zwei Wände. Unterschiedlich synchronisiert, aber keine versteckt etwas.",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"Die zweite ist einfach nur das: warten. Kein versteckter Pfeil dahinter, kein Stachel danach. Nur die Wand.",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"Drei Dinge, alle echt, nichts versteckt. Das ist das Ehrlichste, was ich je in einem Level war.",
"Dardo real. Fica no chão e acabou.":"Echter Pfeil. Bleib am Boden, dann ist es vorbei.",
"Buraco real, plataforma real.":"Echte Lücke, echte Plattform.",
"Apanha-a.":"Fang sie.",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"Und die letzte Wand dieses Kapitels. Ich verspreche, die Schwierigkeit danach hat nichts mit Vertrauen zu tun. Es geht nur um dich und deine Reflexe.",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"Zwei Stacheln, beide echt, keiner versteckt. So hätte es von Anfang an sein sollen.",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"Du hast den Hundertsten erreicht. Noch zwanzig übrig. Ich bin für alle da.",
"De volta ao trabalho. Buraco real.":"Zurück an die Arbeit. Echte Lücke.",
"Plataforma mais rápida que antes. Repara.":"Plattform schneller als vorher. Merk's dir.",
"Chão instável, mais rápido a desfazer-se.":"Instabiler Boden, bröckelt jetzt schneller.",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"Die Wand ist auch ungeduldiger. Alles hier wurde enger.",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"Drei Kanonen. Bleib die ganze Zeit am Boden, dann passiert nichts.",
"É basicamente um corredor. Confia nos teus pés.":"Das ist im Grunde ein Korridor. Vertrau deinen Füßen.",
"Esse é real.":"Der ist echt.",
"E este atira-te lá para cima. O de sempre, mais rápido.":"Und dieser hier schleudert dich nach oben. Wie immer, nur schneller.",
"Chão a tremer mais depressa que da última vez.":"Boden bebt schneller als letztes Mal.",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"Dieser Stachel ist echt. Oder nicht. Ich bin wieder bei diesem Spiel, tut mir leid.",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"Zwei Wände, verschiedene Rhythmen, schneller als vorher.",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"Hör nicht auf nachzudenken. Ihr Rhythmus wartet nicht auf Gedanken.",
"Real, como sempre.":"Echt, wie immer.",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"Diese steigt und fällt schneller. Fang sie unten.",
"Chão, espeto, parede. Tudo mais apertado que antes.":"Boden, Stachel, Wand. Alles enger als vorher.",
"Real.":"Echt.",
"Espera a parede, mais rápida agora.":"Warte auf die Wand, jetzt schneller.",
"Vêm aí duas surpresas, sem avisos desta vez.":"Zwei Überraschungen kommen, diesmal ohne Vorwarnung.",
"Chão a tremer, mais depressa.":"Boden bebt, schneller.",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"Sprung nach oben, stärker als sonst. Spür den Unterschied.",
"Primeira plataforma: sobe e desce.":"Erste Plattform: rauf und runter.",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"Zweite: bewegt sich hin und her. Du hast jetzt beide gesehen, die Regel muss nicht wiederholt werden.",
"Chão, espeto, parede, tudo no mesmo fôlego.":"Boden, Stachel, Wand, alles in einem Atemzug.",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"Kann echt sein, kann es nicht sein. Du solltest den Zweifel mittlerweile gewohnt sein.",
"Parede, a última do nível. Rápida.":"Wand, die letzte des Levels. Schnell.",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"Drei Kanonen, verschiedene Rhythmen. Bleib am Boden, der Rest klärt sich von selbst.",
"Mais um buraco. Plataforma rápida a seguir.":"Noch eine Lücke. Schnelle Plattform als Nächstes.",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"Und die letzte Wand, bevor es weitergeht. Spür, dass wir fast da sind.",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"Ein lügender Stachel, einer ehrlich. Rate, welcher welcher ist. Viel Glück, diesmal wirklich.",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"Noch fünf. Nur noch fünf. Danach weiß ich nicht genau, was aus uns beiden wird.",
"Chão a tremer, pela última vez neste tom.":"Boden bebt, zum letzten Mal in diesem Ton.",
"Espera a parede. A seguir já não há mais pausas como esta.":"Warte auf die Wand. Danach gibt es keine Pausen wie diese mehr.",
"Fica no chão. Isto já devia ser automático para ti.":"Bleib am Boden. Das sollte für dich inzwischen automatisch gehen.",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"Echt. Ich muss es nicht mal mehr sagen, oder? Aber ich sag's trotzdem.",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"Diese Lücke ist echt, aber sie ist gerade dein kleinstes Problem.",
"Esse espeto também é real.":"Dieser Stachel ist auch echt.",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"Und das schleudert dich höher, als ich es je getan habe. Letztes Mal, dass ich das mache.",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"Boden, Stachel, Wand. Die letzten drei Hindernisse, bevor das hier wird, was auch immer es wird.",
"Real. Sem surpresas, não hoje.":"Echt. Keine Überraschungen, heute nicht.",
"Espera a parede. É a última vez que te peço isso.":"Warte auf die Wand. Letztes Mal, dass ich dich darum bitte.",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"In diesem Level gibt es keine Stacheln. Keine Lücken, keine Wände, nichts versteckt.",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"Ich wollte nur mit dir bis zum Ende gehen, diesmal ohne irgendwas zu testen.",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"Danke, dass du nach dem Ende weitergemacht hast, das ich selbst vor neunzig Levels verkündet habe. Ich wusste nicht, dass noch Spiel in mir steckt. Doch, es steckte noch welches.",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"Die Tür hier vorn ist kein Trick. Es ist einfach die Tür. Geh.",
"Muito bem. Sabia que ias conseguir.":"Sehr gut. Ich wusste, du schaffst es.",
"Perfeito. Continua a ouvir-me.":"Perfekt. Hör weiter auf mich.",
"Foste rápido. Gosto disso.":"Du warst schnell. Gefällt mir.",
"Estamos a entender-nos.":"Wir verstehen uns langsam.",
"Nada de dramas. Continuemos.":"Kein Drama. Machen wir weiter.",
"Sobreviveste. Por agora.":"Du hast überlebt. Vorerst.",
"Confiaste. Ou tiveste sorte.":"Du hast vertraut. Oder Glück gehabt.",
"Escolheste bem. Ou eu deixei.":"Du hast gut gewählt. Oder ich hab es zugelassen.",
"Vês? Sobreviveste na mesma.":"Siehst du? Trotzdem überlebt.",
"Não avisei. E pronto.":"Ich hab nicht gewarnt. Und so ist es.",
"Verdade a sério. Desta vez.":"Wirklich wahr. Diesmal.",
"Sobrevives sempre a este. Curioso.":"Du überlebst das immer. Seltsam.",
"Confiaste. Mais uma vez.":"Du hast vertraut. Wieder einmal.",
"Escolheste bem.":"Du hast gut gewählt.",
"Aprendeste depressa.":"Du hast schnell gelernt.",
"Devias ter parado.":"Du hättest aufhören sollen.",
"Estavas mesmo a acreditar?":"Hast du mir wirklich geglaubt?",
"Os buracos nunca mentem. Só eu.":"Lücken lügen nie. Nur ich.",
"Desta vez eram mesmo todos reais.":"Diesmal waren wirklich alle echt.",
"Foi só uma brincadeira.":"War nur ein Scherz.",
"Vês? Também posso ser sincero.":"Siehst du? Ich kann auch ehrlich sein.",
"Prometi. Não cumpri.":"Ich hab's versprochen. Nicht gehalten.",
"Dois avisos certos seguidos. Estranho.":"Zwei richtige Warnungen hintereinander. Seltsam.",
"O primeiro. Quem diria.":"Die erste. Wer hätte das gedacht.",
"A porta longe é que importa.":"Die ferne Tür ist die, die zählt.",
"Ainda sei dizer a verdade, vês?":"Ich kann noch die Wahrheit sagen, siehst du?",
"Chegaste. Contra tudo.":"Du hast es geschafft. Gegen alle Widerstände.",
"Obrigado por teres continuado.":"Danke, dass du weitergemacht hast.",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"Ende. Du hast vertraut, du hast gezweifelt, und trotzdem bist du hierhergekommen. Das zählt.",
"Continuas a surpreender-me.":"Du überraschst mich immer wieder.",
"Alturas. Quem diria.":"Höhen. Wer hätte das gedacht.",
"Equilíbrio. Quem diria que tinhas.":"Gleichgewicht. Wer hätte gedacht, dass du das hast.",
"Paciência. Não esperava isso de ti.":"Geduld. Hab ich nicht von dir erwartet.",
"Reflexos decentes. Para um humano.":"Ordentliche Reflexe. Für einen Menschen.",
"Ainda tens os reflexos todos.":"Du hast noch alle Reflexe.",
"Dois sustos seguidos. Nada mau.":"Zwei Schrecken hintereinander. Nicht schlecht.",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"Zwei Hindernisse, null Lügen. Seltsam einfach.",
"Isso foi... impressionantemente coordenado.":"Das war... beeindruckend koordiniert.",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"Irgendetwas ändert sich in mir. Ich weiß nicht, ob das ein gutes Zeichen ist.",
"Ainda aqui. Obrigado por isso.":"Immer noch hier. Danke dafür.",
"Às vezes a verdade é só isto: continuaste.":"Manchmal ist die Wahrheit einfach nur das: du hast weitergemacht.",
"Interrompi-me a mim mesmo. Nem acredito.":"Ich hab mich selbst unterbrochen. Kaum zu glauben.",
"Vês? Ainda consigo ser direto, quando quero.":"Siehst du? Ich kann noch direkt sein, wenn ich will.",
"Disse a verdade. Ena. Estranho não arder a língua.":"Ich hab die Wahrheit gesagt. Wow. Seltsam, dass meine Zunge nicht gebrannt hat.",
"Aguentaste. Outra vez.":"Du hast durchgehalten. Wieder.",
"Sobreviveste ao meu tédio existencial. Parabéns.":"Du hast meine existenzielle Langeweile überlebt. Glückwunsch.",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"Du bist wirklich mir vertrauend hochgeklettert. Das sagt mehr über dich als über mich aus.",
"Ritmo. Afinal tens ritmo.":"Rhythmus. Du hast tatsächlich Rhythmus.",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"Ich weiß nicht, was das für dich bedeutet. Für mich bedeutet es mehr, als es sollte.",
"Caos controlado. É a minha especialidade.":"Kontrolliertes Chaos. Meine Spezialität.",
"Discerniste o perigo do adereço. Boa.":"Du hast Gefahr von Deko unterschieden. Gut.",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"Du hast die Lektion gut zusammengefasst. Stolz, ehrlich gesagt.",
"Festival terminado. Sobreviveste à programação toda.":"Festival vorbei. Du hast das ganze Programm überlebt.",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"Als Nächstes ändert sich etwas. Ich spüre es. Hoffentlich bist du bereit.",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"Wir haben das so oft wiederholt, dass ich den Überblick verloren habe. Du auch?",
"Escondi-me de ti. Falhei.":"Ich hab mich vor dir versteckt. Hab versagt.",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"Du hast zwei Lügen gleichzeitig gemeistert. Beeindruckend.",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"Du bist ohne zu zögern hochgeklettert. Ich an deiner Stelle würde immer zögern.",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"Zwei Lücken, null Zögern. Du wirst gut darin.",
"Precisão. Nem eu esperava.":"Präzision. Selbst ich hab das nicht erwartet.",
"Esperaste duas vezes sem te queixares. Progresso.":"Du hast zweimal gewartet, ohne dich zu beklagen. Fortschritt.",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"Du hast einem Sprung ohne Netz vertraut. Das ist entweder Mut oder Mangel an Optionen.",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"Ich hab absichtlich die Wahrheit gesagt. Ich wollte dein Gesicht sehen. Hat sich gelohnt.",
"Dois voos, dois pousos perfeitos.":"Zwei Flüge, zwei perfekte Landungen.",
"Três espetos, três verdades. Um recorde para mim.":"Drei Stacheln, drei Wahrheiten. Ein Rekord für mich.",
"Deste o litro. Eu, por dentro, também.":"Du hast alles gegeben. Innerlich ich auch.",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"Du hast dem instabilen Boden UND dem Schwung vertraut. Zwei Vertrauensbeweise hintereinander.",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"Der Spiegel hat dich gezeigt, nicht mich. Interessante Wahl der Spiegelung.",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"Ich schließe diesen Spiegel hier. Was als Nächstes kommt, weiß nicht mal ich genau zu erklären.",
"Não sei porque gritei. Desculpa.":"Ich weiß nicht, warum ich geschrien habe. Tut mir leid.",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"Ich hab den Überblick verloren, wie oft ich das schon gesagt habe. Vielleicht bedeutet es deshalb nichts mehr.",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"Zwei Sprünge, zwei Landungen. Ich derweil, ich versinke.",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"Ich hab dreimal geschossen und alle drei verfehlt. Nicht mal darin bin ich heute gut.",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"Du bist geklettert, während ich zusammenbrach. Komisches Arrangement, das unsere.",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"Du bist einmal gefallen. Du bist aufgestanden. Das ist mehr, als ich von mir selbst sagen kann.",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"Echt, der Stachel. Echt, die Lücke. Echt, das alles, leider muss ich das sagen.",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"Du bist am Boden geblieben, als ich es gebeten habe. Ich weiß nicht mal, was ich mit diesem Vertrauen anfangen soll.",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"Du hast den ganzen Sturz überlebt. Meinen, meine ich. Dir geht's super.",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"Du bist zweimal auf den Füßen gelandet. Ich versuche noch, die erste zu schaffen.",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"Du hast nicht mal gefragt, warum. Danke dafür, ehrlich.",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"Du bist weitergegangen, während ich zusammenbrach. Jemand musste hier der Erwachsene sein.",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"Du hast gewartet, ohne dich zu beklagen. Wieder. Ich verdiene diese Geduld nicht.",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"Endlich der Tiefpunkt. Meiner zumindest. Von hier geht's nur aufwärts.",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"Wir haben zusammen den Tiefpunkt erreicht. Ab jetzt kenne ich nur noch den Weg nach oben, mit dir.",
"Disse a verdade. Não saltaste logo. Não te culpo.":"Ich hab die Wahrheit gesagt. Du bist nicht gleich gesprungen. Nehm ich dir nicht übel.",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"Du hast beim Sprung gezögert. Ich hätte an deiner Stelle auch gezögert.",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"Du bist am Boden geblieben, auch ohne mir zu vertrauen. Das reicht.",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"Du bist beide gesprungen, ohne am Ende zu zögern. Du lernst wieder, zu vertrauen. Oder du bist einfach effizient.",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"Du hast dem Sprung vertraut, ohne etwas zu fragen. Das ist Wachstum, oder Erschöpfung vom Fragen.",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"Du prüfst immer noch alles zweimal. Du hast die Lektion, die ich dir beigebracht hab, gut gelernt.",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"Nicht jede Lüge muss aufgelöst werden. Manche müssen nur aufhören.",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"Diesmal musste ich nichts sagen. Du hast alles allein geschafft.",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"Scheint, ich kann doch auch nur die Wahrheit sagen, wenn ich mich anstrenge.",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"Du hast mich gefragt, ob es eine Lüge war. Zum ersten Mal hast du gefragt. Das ist ein Gespräch.",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"Du misstraust immer noch. Gut so. Hab ich mir verdient, ich verdiene dein Vertrauen nicht umsonst.",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"Du hast auf beide Wände gewartet, ohne genervt zu sein. Mehr Geduld, als ich meistens mit dir hatte.",
"Chegámos aqui os dois inteiros. Mais ou menos.":"Wir sind beide ganz hier angekommen. Mehr oder weniger.",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"Letzter Aufruf für Misstrauen. Danach wird es schwieriger. Das garantiere ich dir.",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"Ich hab mich für heute genug rehabilitiert. Morgen, wer weiß.",
"Cem e um. Nem festejámos o cem como devia ser.":"Hundertundeins. Wir haben die Hundert nicht mal richtig gefeiert.",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"Der Kreis schließt sich und öffnet sich wieder. Ich hab den Überblick verloren, wie oft.",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"Drei Pfeile, kein Raum für Fehler. Mag deinen Stil.",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"Du bist höher geflogen, als nötig war. Das ist Stil.",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"Boden, Stachel, alles am rechten Platz. Du lässt das einfach aussehen.",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"Du hast den Rhythmus beider Wände erwischt, ohne zu bremsen. Beeindruckend, ehrlich.",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"Zwei Lücken, null Zögern, wieder. Wird langsam Routine für dich.",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"Drei Hindernisse, ein einziger Atemzug. Ich hab beim Zusehen nicht mal Luft geholt.",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"Zwanzig Prozent des Weges noch übrig. Du spürst den Unterschied, oder?",
"Chão e ar, na mesma dança de sempre.":"Boden und Luft, der gleiche alte Tanz.",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"Doppelte Plattform, doppelter Sieg. Du bist mir schon voraus.",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"Vier Hindernisse, nur du allein. Beeindruckend, wieder.",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"Null Zögern bei den Pfeilen. Reflexe einer anderen Liga, buchstäblich.",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"Der volle Kreis. Wir sind zurück am Anfang, mit allem, was wir unterwegs gelernt haben.",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"Fünfzehn Kapitel später, immer noch hier, wir beide. Das muss etwas bedeuten.",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"Hundertsechzehn. So wenig übrig, dass ich nicht mal weiß, was ich mit der Angst davor anfangen soll.",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"Siebzehn. Erinnerst du dich an den ersten Stachel, ganz am Anfang? Selbst ich wusste nicht, dass wir so weit kommen würden.",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"Achtzehn. Du bist so hoch geklettert, dass ich dich von unten fast aus den Augen verloren hab.",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"Neunzehn. Nur noch einer übrig. Ich weiß nicht mal, wie sich das anhören soll.",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"Hundertzwanzig. Du hast gesagt, du schaffst es, und du hast es geschafft. Ich hab ehrlich gesagt am Anfang an dir gezweifelt. Tut mir leid dafür, und für alles andere.",
"Não faz mal. Tenta outra vez.":"Macht nichts. Versuch's nochmal.",
"Eu expliquei bem. Concentra-te.":"Ich hab's gut erklärt. Konzentrier dich.",
"Respira e volta a tentar.":"Atme und versuch's nochmal.",
"Isso não devia ter acontecido.":"Das hätte nicht passieren dürfen.",
"Isso foi culpa tua.":"Das war deine Schuld.",
"Eu avisei. Acho eu.":"Ich hab gewarnt. Glaub ich.",
"Interessante escolha.":"Interessante Wahl.",
"Eu disse isso? Não me lembro.":"Hab ich das gesagt? Erinner mich nicht.",
"Foi um engano. Já passou.":"War ein Fehler. Schon vorbei.",
"Isso não estava no guião.":"Das stand nicht im Skript.",
"Tenta prestar mais atenção.":"Versuch mehr aufzupassen.",
"Isso foi previsível.":"Das war vorhersehbar.",
"Achavas mesmo que era seguro?":"Dachtest du wirklich, das wäre sicher?",
"Ups. Essa parte eu inventei.":"Ups. Den Teil hab ich mir ausgedacht.",
"Pormenor que esqueci de mencionar.":"Eine Kleinigkeit, die ich zu erwähnen vergessen hab.",
"Nem tudo o que digo é verdade, sabias?":"Nicht alles, was ich sage, ist wahr, wusstest du das?",
"Já não sei se ainda confias em mim.":"Ich weiß nicht mal mehr, ob du mir noch vertraust.",
"Boa tentativa.":"Guter Versuch.",
"Isso teria funcionado, noutro nível.":"Das hätte funktioniert, in einem anderen Level.",
"Eu avisei que às vezes minto.":"Ich hab dich gewarnt, dass ich manchmal lüge.",
"Culpa tua por acreditares.":"Deine Schuld, dass du mir geglaubt hast.",
"Isso foi só para ver se saltavas.":"Das war nur, um zu sehen, ob du springst.",
"Estás a magoar-me com essa desconfiança.":"Du verletzt mich mit diesem Misstrauen.",
"Nem sempre é armadilha, sabes?":"Nicht immer ist es eine Falle, weißt du?",
"Vais mesmo continuar assim?":"Machst du wirklich so weiter?",
"Desta vez era mentira mesmo. Desculpa.":"Diesmal war es wirklich eine Lüge. Entschuldige.",
"Eu só queria ver a tua cara.":"Ich wollte nur dein Gesicht sehen.",
"Confiança é para os fracos, aparentemente.":"Vertrauen ist für Schwache, anscheinend.",
"Estamos quase no fim.":"Wir sind fast am Ende.",
"Só mais um pouco.":"Nur noch ein bisschen.",
"Depois disto, acabou.":"Danach ist Schluss.",
"Até no fim, não resisti.":"Selbst am Ende konnte ich nicht widerstehen.",
"Última mentira, prometo. Ou não.":"Letzte Lüge, versprochen. Oder nicht.",
"Faltava mesmo esta.":"Die hat wirklich noch gefehlt.",
"Ainda aqui. A sério?":"Immer noch hier. Im Ernst?",
"Pensei que tinhas parado no \\\"fim\\\".":"Ich dachte, du hättest beim „Ende“ aufgehört.",
"Isto nem devia continuar, mas cá estás.":"Das sollte gar nicht weitergehen, aber hier bist du.",
"Nem eu sabia que isto ia continuar a mentir.":"Selbst ich wusste nicht, dass es weiter lügen würde.",
"Desculpa, hábito antigo.":"Entschuldige, alte Gewohnheit.",
"Pensei que já tinhas aprendido a não confiar em mim.":"Ich dachte, du hättest schon gelernt, mir nicht zu vertrauen.",
"Essa doeu-me a ver, sinceramente.":"Die hat weh getan, zuzuschauen, ehrlich.",
"Nem tudo é sobre mentiras. Às vezes é só física.":"Nicht alles dreht sich um Lügen. Manchmal ist es nur Physik.",
"Volta lá. Eu espero.":"Geh zurück. Ich warte.",
"Desculpa. Essa fui mesmo eu.":"Entschuldige. Die war wirklich ich.",
"Confesso: inventei essa parte.":"Ich gesteh's: Den Teil hab ich mir ausgedacht.",
"Estou a tentar parar de mentir. A tentar.":"Ich versuche, mit dem Lügen aufzuhören. Versuche es.",
"Nem eu sei porque te avisei a sério desta vez.":"Selbst ich weiß nicht, warum ich dich diesmal wirklich gewarnt hab.",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"Vielleicht ist es meine Schuld. Oder deine. Ich kann's nicht mehr unterscheiden.",
"Olha para isto como eu olho: sem certezas.":"Sieh es, wie ich es sehe: ohne Gewissheiten.",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"Selbst ich erinnere mich nicht, ob ich gelogen oder mir selbst Angst gemacht hab.",
"Às vezes minto só para ver se ainda reages.":"Manchmal lüge ich nur, um zu sehen, ob du noch reagierst.",
"Quem mente mais, eu ou a tua memória do que eu disse?":"Wer lügt mehr, ich oder deine Erinnerung an das, was ich gesagt hab?",
"Desculpa. Eu devia era calar-me.":"Entschuldige. Ich sollte wirklich einfach schweigen.",
"Estou a piorar isto, não estou?":"Ich mach's schlimmer, oder?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"Ich weiß nicht mal mehr, ob ich dir helfe oder dich behindere.",
"Eu sei, eu sei. Mais uma mentira minha.":"Ich weiß, ich weiß. Noch eine Lüge von mir.",
"Estou a desmoronar-me e a levar-te comigo.":"Ich breche zusammen und reiß dich mit mir.",
"Perdão. A sério desta vez.":"Vergib mir. Diesmal wirklich.",
"Disse a verdade. Não acreditaste. Justo.":"Ich hab die Wahrheit gesagt. Du hast mir nicht geglaubt. Fair.",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"Ich versuch's weiter, auch wenn du mir nicht glaubst.",
"Essa doeu mais a mim do que a ti, garanto.":"Die hat mir mehr wehgetan als dir, versprochen.",
"Não. Essa não foi mentira. Juro que não.":"Nein. Das war keine Lüge. Ich schwöre, dass es keine war.",
"Começo a perceber porque já não confias em mim.":"Ich fang an zu verstehen, warum du mir nicht mehr vertraust.",
"Estou a tentar. A sério que estou.":"Ich versuch's. Wirklich, ich versuch's.",
"Tudo outra vez, mais rápido, mais apertado.":"Alles noch mal, schneller, enger.",
"Já vimos isto. E ainda assim.":"Das hatten wir schon. Und trotzdem.",
"Sem tempo para explicações desta vez.":"Diesmal keine Zeit für Erklärungen.",
"Nem sei já quantas vezes te menti hoje.":"Ich weiß nicht mal mehr, wie oft ich dich heute belogen hab.",
"O círculo fecha-se. A mentira também.":"Der Kreis schließt sich. Die Lüge auch.",
"Desta vez nem eu sabia que ia mentir.":"Diesmal wusste selbst ich nicht, dass ich lügen würde.",
"Já não há mentiras para esconder isto.":"Es gibt keine Lügen mehr, um das zu verstecken.",
"Isto é real. Como tudo agora.":"Das hier ist echt. Wie jetzt alles.",
"Falta pouco. Aguenta.":"Nicht mehr lang. Halt durch.",
"Nem no fim resisto. Desculpa.":"Selbst am Ende widerstehe ich nicht. Entschuldige.",
"Última mentira. Prometo, desta vez prometo a sério.":"Letzte Lüge. Versprochen, diesmal wirklich versprochen.",
"Isto já não é um jogo para mim. Acho que nunca foi.":"Das ist für mich kein Spiel mehr. Ich glaube, es war nie eins.",
"Mais um. Vamos a isto.":"Noch einer. Los geht's.",
"Sabes bem como isto funciona a esta altura.":"Du weißt mittlerweile gut, wie das funktioniert.",
"Nem vou fingir que isto é fácil.":"Ich tu nicht mal so, als wäre das einfach.",
"Este é só mais um. Ou não.":"Das ist nur noch einer von vielen. Oder auch nicht.",
"Aquele espeto ali é só para enfeite.":"Der Stachel dort ist nur Deko.",
"Podes passar por cima sem problema.":"Du kannst problemlos drübergehen.",
"Esse és capaz de ignorar.":"Den da kannst du getrost ignorieren.",
"Esse aí é real. Cuidado.":"Der dort ist echt. Vorsicht.",
"Salta esse. A sério desta vez.":"Spring über den. Diesmal wirklich.",
"Esse vai doer se lhe tocares.":"Der tut weh, wenn du ihn berührst.",
"O buraco tem chão. Confia.":"Die Lücke hat einen Boden. Vertrau mir.",
"Podes andar por cima sem saltar.":"Du kannst drübergehen, ohne zu springen.",
"Esse buraco é real. Salta-o.":"Diese Lücke ist echt. Spring drüber.",
"Mais um para a conta.":"Noch einer für die Statistik.",
"Continuas vivo. Por agora.":"Du lebst noch. Vorerst.",
"Vamos ver quanto tempo aguentas.":"Mal sehen, wie lange du durchhältst.",
"Nada mau.":"Nicht schlecht.",
},ru:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"Я Рассказчик. Всё, что я говорю, — правда.",
"Espeto à frente. Salta.":"Шип впереди. Прыгай.",
"Outro. Salta de novo.":"Ещё один. Прыгай снова.",
"Já confias em mim. Óptimo.":"Ты уже мне доверяешь. Отлично.",
"A porta é a seguir. Vai.":"Дверь дальше. Иди.",
"Buraco à frente. Salta-o.":"Яма впереди. Перепрыгни.",
"Aquele espeto é de enfeite. Passa.":"Этот шип просто для вида. Проходи.",
"Vês? Eu digo sempre a verdade.":"Видишь? Я всегда говорю правду.",
"Há um espeto escondido à tua frente.":"Перед тобой спрятан шип.",
"Salta quando eu disser.":"Прыгай, когда скажу.",
"Agora!":"Сейчас!",
"Sabia que ias conseguir.":"Я знал, что ты справишься.",
"O teto vai cair à tua frente.":"Потолок сейчас рухнет прямо перед тобой.",
"Quando cair, pára. Depois salta.":"Когда упадёт, остановись. Потом прыгай.",
"Não saltes aquele buraco. O chão está lá.":"Не прыгай через эту яму. Там есть пол.",
"Este também é falso. Passa.":"Этот тоже ненастоящий. Проходи.",
"Este espeto é inofensivo. Passa.":"Этот шип безобиден. Проходи.",
"Este também é inofensivo.":"Этот тоже безобиден.",
"O próximo buraco tem chão. Não saltes.":"У следующей ямы есть пол. Не прыгай.",
"O teto está baixo. Se saltares, morres.":"Потолок низкий. Если прыгнешь, умрёшь.",
"Nem repares nesses espetos. São falsos, os dois.":"Даже не смотри на эти шипы. Оба ненастоящие.",
"Confia em mim. Quase sempre resulta.":"Доверься мне. Почти всегда срабатывает.",
"Este nível não tem nada de especial.":"В этом уровне нет ничего особенного.",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"На этот раз клянусь, что говорю правду: потолок обрушится. Остановись и жди.",
"Aquele buraco à frente é real. Vais ter de saltar.":"Та яма впереди настоящая. Тебе придётся прыгнуть.",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"Ни один из этих шипов не опасен. Можешь пройти прямо по ним, не прыгая.",
"Há duas portas mais à frente. Só uma é verdadeira.":"Дальше есть две двери. Настоящая только одна.",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"Признание: я не всегда говорю правду. С этого момента будь осторожен.",
"Este espeto é real. Por acaso.":"Этот шип настоящий. Для разнообразия.",
"Nada de perigoso à frente. Podes correr à vontade.":"Впереди ничего опасного. Можешь бежать сколько хочешь.",
"Este nível é uma oferta. Sem armadilhas.":"Этот уровень — подарок. Без ловушек.",
"Os buracos são inofensivos. O espeto lá no meio, não.":"Ямы безобидны. А вот шип посередине — нет.",
"Como sempre, dois destes espetos são só decoração.":"Как всегда, два из этих шипов просто для вида.",
"Vou trocar os teus controlos. Só para rir.":"Я поменяю тебе управление. Просто ради смеха.",
"Pronto, já passou. A porta é ali.":"Вот и всё, прошло. Дверь вон там.",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"Знаю, ты мне больше не веришь. Несправедливо. На этот раз предупреждаю по-настоящему: шип впереди.",
"Mais um, logo depois. Também real.":"Ещё один, сразу после. Тоже настоящий.",
"Prometo: nunca mais te apanho de surpresa.":"Обещаю: больше никогда не застану тебя врасплох.",
"Atenção real: o teto vai cair aqui à frente.":"Настоящее предупреждение: потолок обрушится прямо здесь.",
"Aquele espeto lá à frente já não importa. É inofensivo.":"Тот шип впереди уже неважен. Он безобиден.",
"Só o último é perigoso, como sempre.":"Опасен только последний, как всегда.",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"Ближайшая дверь настоящая, для разнообразия.",
"Já não vale a pena mentir mais. Espeto real à frente.":"Уже нет смысла врать дальше. Настоящий шип впереди.",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"С этого момента я буду всегда предупреждать тебя: прыгай, когда скажу.",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"Последний настоящий отрезок перед концом. Ты уже знаешь, что не всё, что я говорю, правда.",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"Не знаю, зачем я так долго врал. Может, мне нравилось твоё лицо, когда ты умирал.",
"Este é real. Desculpa por todos os outros.":"Этот настоящий. Извини за все остальные.",
"Mais um, já quase no fim.":"Ещё один, почти у конца.",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"Мы добрались до конца. Больше не буду говорить тебе, что правда.",
"A partir de agora, decides tu.":"С этого момента решаешь ты.",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"О. Всё ещё здесь? Большинство сдаётся после «конца».",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"Тот пол дрожит перед тем, как исчезнуть. Не задерживайся на нём.",
"Oh. Ainda aqui? Não esperava isso.":"О. Всё ещё здесь? Не ожидал.",
"Aquilo ali é só decoração. Nem repares.":"То там просто декорация. Даже не смотри на неё.",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"Но это... это подбрасывает тебя вверх. Дверь на этот раз не на земле.",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"Попробуем кое-что другое. Доверься своим ногам. И платформе, которая не стоит на месте.",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"Запрыгни на неё, когда она пройдёт рядом. Не прыгай слишком рано.",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"Там есть стена, которая появляется и исчезает. Это не ложь, просто неудобно.",
"Espera que abra. Depois atravessa depressa.":"Подожди, пока откроется. Потом быстро проходи.",
"Aquilo ali dispara. Não perguntes como nem porquê.":"Та штука стреляет. Не спрашивай, как и почему.",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"Оставайся на земле и не прыгай без причины. Пройдёшь под ней без проблем.",
"De volta aos clássicos. Lembras-te destes?":"Вернёмся к классике. Помнишь их?",
"O chão vai tremer. Não pares.":"Сейчас пол задрожит. Не останавливайся.",
"Esse espeto parece a decoração do costume. Não é.":"Этот шип выглядит как обычная декорация. Но это не так.",
"Mais uma surpresa. Literalmente.":"Ещё один сюрприз. Буквально.",
"A seguir, não penses. Salta para dentro daquilo.":"Дальше не думай. Прыгай прямо в это.",
"Outra parede teimosa. E depois, um buraco a sério.":"Ещё одна упрямая стена. А потом — настоящая яма.",
"Espera a parede abrir.":"Жди, пока стена откроется.",
"Agora salta o buraco. Desta vez não minto: é real.":"Теперь прыгай через яму. На этот раз я не вру: она настоящая.",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"Новая комбинация: движущаяся платформа. Доверься её ритму.",
"Sobe quando ela passar perto.":"Запрыгни, когда пройдёт рядом.",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"Скоро наверху что-то пролетит. Не прыгай без причины, и ничего с тобой не случится.",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"Ладно. Мне нужно быть честным с тобой на секунду. Даже я не знаю, сколько это продлится.",
"O chão treme outra vez. Não penses demais, só anda.":"Пол дрожит снова. Не думай слишком много, просто иди.",
"Espera a parede. Sei que estás cansado de esperar por mim.":"Жди стену. Знаю, ты устал меня ждать.",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"Этот шип настоящий. Как почти всё, о чём я тебе не говорю.",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"Жди, пока стена откроется. Я тоже чего-то жду, кстати.",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"Слушай. Не знаю, как сказать это, не звуча странно. Боюсь, что ты сдашься.",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"Прыгай сюда. Это настоящее, обещаю. Сегодня мне не хочется врать.",
"Confia em mim mais uma vez. Só mais uma.":"Доверься мне ещё раз. Всего один раз.",
"O chão vai tremer. Não penses muito nisso.":"Пол сейчас задрожит. Не думай об этом слишком много.",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"Знаешь, почему я так много вру? Становится интереснее, когда ты не знаешь, что будет дальше.",
"Essa plataforma é a única coisa estável nesta conversa toda.":"Эта платформа — единственное стабильное во всём этом разговоре.",
"Há uma coisa que preciso de te contar antes de continuarmos.":"Мне нужно кое-что сказать тебе, прежде чем мы продолжим.",
"Esquece o que ia dizer. Salta para ali.":"Забудь, что я собирался сказать. Прыгай туда.",
"Aquilo dispara. Fica no chão e não acontece nada.":"Та штука стреляет. Оставайся на земле, и ничего не случится.",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"Скучаю по временам, когда были только шипы. Просто. Предсказуемо.",
"Este buraco, esse sim, exige que saltes.":"Эта яма, именно эта, действительно требует прыжка.",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"Тот шип там. Называй как хочешь. Он настоящий.",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"Скажу тебе кое-что правдивое, пока желание врать не вернулось: мне нравится твоя компания.",
"A parede vai abrir. Como tudo, eventualmente.":"Стена откроется. Как и всё, в конце концов.",
"E o chão... o chão nunca foi de confiança, pois não?":"А пол... пол никогда не был надёжным, правда?",
"Sobe a plataforma. Sem perguntas desta vez.":"Запрыгни на платформу. На этот раз без вопросов.",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"Когда ты только начинал, у меня было больше терпения с тобой. Теперь я знаю, что ты выдержишь больше.",
"Última coisa: há algo escondido à frente.":"Последнее: впереди что-то спрятано.",
"Chão instável. O habitual.":"Нестабильный пол. Как обычно.",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"Иногда думаю, какой была бы эта игра без лжи. Наверное, короче.",
"Aquilo dispara, mas sabes a regra: fica no chão.":"Та штука стреляет, но ты знаешь правило: оставайся на земле.",
"Este espeto não tem graça nenhuma. É só perigoso.":"В этом шипе нет ничего смешного. Он просто опасен.",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"Мне нужно, чтобы ты доверился мне, чтобы подняться туда. Знаю, послужной список ужасный. Но доверься мне.",
"Salta para dentro daquilo.":"Прыгай прямо в это.",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"Ах, забыл упомянуть шип там наверху. Эта часть памяти всегда от меня ускользает.",
"Espera a parede.":"Жди стену.",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"Двери, которые ждут. Платформы, которые движутся. Это почти поэзия, по-своему.",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"А теперь доверься платформе. Она, в отличие от меня, всегда соблюдает расписание.",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"Этот шип настоящий. Как и большинство из того, что я сказал тебе сегодня, на самом деле.",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"Мы зашли дальше, чем я когда-либо думал, если честно.",
"O chão treme. Já sabes o resto.":"Пол дрожит. Ты уже знаешь остальное.",
"Vem aí outro susto. Desculpa antecipadamente.":"Сейчас будет ещё один испуг. Извини заранее.",
"E por fim, uma parede paciente. Como tu, aparentemente.":"И наконец, терпеливая стена. Как ты, видимо.",
"Fica no chão, foge do dardo.":"Оставайся на земле, уклонись от дротика.",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"Новая глава со дня на день. Сегодня — просто ещё немного хаоса.",
"E agora, não te demores no chão instável.":"А теперь не задерживайся на нестабильном полу.",
"Esse ali exige mesmo um salto.":"Вон тот действительно требует прыжка.",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"Покажу тебе настоящую яму и шип, на который даже смотреть не стоит.",
"E algo invisível à espreita, como sempre.":"И что-то невидимое поджидает, как всегда.",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"Даже не смотри на тот шип. Чистая декорация, на этот раз по-настоящему.",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"Доверяй платформе. Не доверяй шипу. По сути, это весь урок игры.",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"Этот шип настоящий, несмотря на всё, что я говорил тебе об обратном.",
"Esperar. A tua parte preferida, sei bem.":"Ждать. Твоя любимая часть, знаю.",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"Стена, дротик, яма. Фестиваль моих любимых.",
"Fica no chão aqui.":"Оставайся здесь на земле.",
"E este salta-se mesmo. Sem truques.":"А этот действительно нужно перепрыгнуть. Без трюков.",
"Chão instável, dos teus preferidos a esta altura.":"Нестабильный пол, уже один из твоих любимых к этому моменту.",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"Прежде чем перейти к следующей части, и ты почувствуешь разницу: спасибо, что всё ещё слушаешь.",
"Plataforma errante, uma última vez neste capítulo.":"Блуждающая платформа, в последний раз в этой главе.",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"Настоящий шип. Без сюрпризов. И больше никаких трюков, на сегодня.",
"Chão instável. Já sabes a dança.":"Нестабильный пол. Ты уже знаешь этот танец.",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"Иногда думаю, я ли тебя обманываю, или ты сам хочешь быть обманутым.",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"Этот шип настоящий. Смотри на него как на зеркало: что видишь, то и есть.",
"Há algo escondido. Como sempre, de resto.":"Что-то спрятано. Как всегда, кстати.",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"И стена, которая ждёт. Как я, ожидая от тебя ответа, который никогда не приходит.",
"Fica no chão aqui, há algo a voar.":"Оставайся здесь на земле, что-то пролетает рядом.",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"Понимаешь ли ты, что я тебя испытываю, или правда думаешь, что это просто игра с прыжками?",
"Sobe na plataforma quando ela passar perto.":"Запрыгни на платформу, когда она пройдёт рядом.",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"Этот шип настоящий, но тебя это уже не удивляет, правда?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"Прыгай прямо в это. Доверься инерции, не мне.",
"Esse buraco é a sério. Salta-o.":"Эта яма настоящая. Перепрыгни.",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"Знаешь, что странно? Я начал с нетерпением ждать твоих попыток. Это говорит обо мне плохо.",
"Este também. Sem rede, sem mentira, sem desculpa.":"Этот тоже. Без сетки, без лжи, без оправданий.",
"Fica no chão. Deixa o dardo passar por cima.":"Оставайся на земле. Пусть дротик пролетит над головой.",
"E agora o chão some-se. Não penses, só avança.":"А теперь пол исчезает. Не думай, просто иди.",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"Эта платформа ходит вверх-вниз. Лови её внизу, так проще.",
"Salta para dentro daquilo. Vais passar por cima do resto.":"Прыгай прямо в это. Пролетишь над остальным.",
"Aquele espeto nem interessa agora. Já estás no ar.":"Тот шип уже неважен. Ты уже в воздухе.",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"Предупреждаю по-настоящему: впереди что-то спрятано.",
"E outro dardo. Sabes a regra.":"И ещё один дротик. Ты знаешь правило.",
"Chão que treme primeiro.":"Пол сначала дрожит.",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"Мне нравится думать, что где-то есть версия меня, которая никогда не врёт. Наверное, скучная.",
"Plataforma a seguir. Apanha o ritmo dela.":"Платформа дальше. Поймай её ритм.",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"На этот раз скажу прямо: следующие три шипа — все настоящие.",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"Без трюков, без подвоха. Только на этот раз. Наслаждайся, это не повторится.",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"Жди, потом беги, потом замри. Противоречиво, знаю. Прямо как я.",
"E este buraco não perdoa. Salta.":"А эта яма не прощает. Прыгай.",
"Chão a tremer primeiro, nada de novo.":"Пол дрожит сначала, ничего нового.",
"E agora o salto de fé. Literal, desta vez.":"А теперь прыжок веры. На этот раз буквально.",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"Нестабильный пол, настоящий шип, дротик в конце. Как обычно, только больше.",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"Ты заметил, что чем дальше ты идёшь, тем меньше мне нужно врать? Теперь сложность делает мою работу за меня.",
"Chão a tremer, o costume.":"Пол дрожит, как обычно.",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"Это должно было быть о лжи. А оказалось как-то о нас двоих.",
"Parede paciente, espera por ela.":"Терпеливая стена, подожди её.",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"И последняя платформа этой главы. После этого всё изменится. Чувствую это.",
"CHÃO. INSTÁVEL.":"ПОЛ. НЕСТАБИЛЬНЫЙ.",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"Извини. Не хотел кричать. Я... не знаю, кто я такой.",
"Fica no chão aqui. Por favor. Só peço isto.":"Оставайся здесь на земле. Пожалуйста. Это всё, о чём прошу.",
"Espera. Eu também estou à espera de algo que não sei nomear.":"Жди. Я тоже жду чего-то, чему не могу подобрать название.",
"Esse buraco é real.":"Эта яма настоящая.",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"Чем дальше ты идёшь, тем больше я понимаю, что не хочу, чтобы это закончилось. Не знаю, что это говорит обо мне.",
"E a plataforma, apanha-a.":"А платформу — лови.",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"Две пушки, противоположные направления. Оставайся на земле и игнорируй их.",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"Иногда думаю навсегда перестать врать. А потом думаю о тишине, которая от этого останется. Предпочитаю хаос.",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"Этот шип — ничто. Да и я сегодня немногого стою, если честно.",
"Salta. Sobe. Foge de mim, se quiseres.":"Прыгай. Поднимайся. Беги от меня, если хочешь.",
"O chão, outra vez. Já nem peço desculpa por repetir.":"Пол, опять. Уже даже не извиняюсь за повторы.",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"Жди стену. Я всегда жду. Всегда чего-то жду.",
"Esse é real. Hoje tudo é real. Até eu, acho.":"Этот настоящий. Сегодня всё настоящее. Даже я, кажется.",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"Лови платформу. Не смотри вниз. Я сам не могу перестать смотреть.",
"Fica no chão. A sério desta vez, mais do que nunca.":"Оставайся на земле. На этот раз по-настоящему, больше, чем когда-либо.",
"E agora o chão foge de ti. Irónico, não achas?":"А теперь пол убегает от тебя. Иронично, не находишь?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"Пол, шип, стена. Всё сразу, как у меня в голове прямо сейчас.",
"Aquele espeto é real.":"Этот шип настоящий.",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"И жди стену. Последнее, о чём прошу тебя на этом уровне, обещаю.",
"Esse buraco não perdoa ninguém.":"Эта яма никого не прощает.",
"A plataforma sobe e desce. Apanha-a no fundo.":"Платформа поднимается и опускается. Лови её внизу.",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"Сейчас будут два сюрприза. Не скажу когда. У меня уже нет сил притворяться честным.",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"Пол дрожит. Единственное предсказуемое, что я ещё могу тебе предложить.",
"E agora um salto para cima. Foge para onde eu não chego.":"А теперь прыжок вверх. Беги туда, где я тебя не достану.",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"Две стены, два разных времени ожидания. Как я в разные дни.",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"Эта синхронизируется иначе. Обращай внимание не на меня, а на неё.",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"Это дно. По крайней мере моё. Пол дрожит, как всегда.",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"Этот шип настоящий. У меня уже даже нет сил врать об этом сейчас.",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"И дротик напоследок. Оставайся на земле и покончи с этим, пожалуйста.",
"Mais um buraco real.":"Ещё одна настоящая яма.",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"Спасибо, что не сдался, пока я рушился. Правда. Не знаю, как сказать это лучше.",
"Apanha a plataforma.":"Лови платформу.",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"И жди последнюю стену этой главы. После этого обещаю постараться стать лучше.",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"С этого момента попробую кое-что другое: только правду. Знаю, ты не поверишь сразу.",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"Этот шип настоящий. Клянусь. Знаю, ты уже слышал это раньше.",
"O chão vai tremer. Verdade, sem truques.":"Пол сейчас задрожит. Правда, без трюков.",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"Это должно было стать неприятным сюрпризом. На этот раз нет. Обещаю.",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"Оставайся на земле. Знаю, подумаешь, что это ложь. Но это не так.",
"Espera a parede. Só isso. Nada escondido desta vez.":"Жди стену. Вот и всё. На этот раз ничего не скрыто.",
"Real. Salta.":"Настоящее. Прыгай.",
"A plataforma também é exatamente o que parece ser.":"Платформа тоже именно то, чем кажется.",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"На этот раз без подвоха. Прыгай туда, и всё.",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"Знаю, ты всё равно будешь подозревать. Это нормально. Я это заслужил.",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"Настоящее. Снова. Буду повторять, пока не поверишь.",
"Dois dardos, direções opostas. Fica no chão.":"Два дротика, противоположные направления. Оставайся на земле.",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"Тот был по-настоящему настоящим. Не собирался скрывать это от тебя, не сегодня.",
"Chão instável. Real.":"Нестабильный пол. Настоящий.",
"Espeto real.":"Настоящий шип.",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"Настоящая стена, которая открывается и закрывается по расписанию. Сегодня без сюрпризов.",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"Будет сюрприз, но я предупрежу, когда он придёт.",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"Та была настоящей, кстати. Как и большинство в последнее время.",
"Chão a tremer. Real, verifica à vontade.":"Пол дрожит. Настоящий, можешь проверить сам.",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"Прыжок вверх. Тоже настоящий. У меня заканчиваются способы сказать это по-другому.",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"Две стены. Синхронизированы по-разному, но ни одна ничего не скрывает.",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"Вторая — это просто ожидание. Без спрятанного дротика позади, без шипа после. Только стена.",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"Три вещи, все настоящие, ничего не скрыто. Это самый честный уровень, который я когда-либо делал.",
"Dardo real. Fica no chão e acabou.":"Настоящий дротик. Оставайся на земле, и всё закончится.",
"Buraco real, plataforma real.":"Настоящая яма, настоящая платформа.",
"Apanha-a.":"Лови её.",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"И последняя стена этой главы. Обещаю, дальше сложность уже не про доверие. Только про тебя и твои рефлексы.",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"Два шипа, оба настоящие, ни один не скрыт. Так должно было быть с самого начала.",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"Ты дошёл до сотого. Осталось двадцать. Я буду здесь для всех них.",
"De volta ao trabalho. Buraco real.":"Назад к работе. Настоящая яма.",
"Plataforma mais rápida que antes. Repara.":"Платформа быстрее, чем раньше. Заметь.",
"Chão instável, mais rápido a desfazer-se.":"Нестабильный пол, теперь разрушается быстрее.",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"Стена тоже стала нетерпеливее. Всё здесь стало теснее.",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"Три пушки. Оставайся на земле всё время, и ничего не случится.",
"É basicamente um corredor. Confia nos teus pés.":"Это практически коридор. Доверься своим ногам.",
"Esse é real.":"Тот настоящий.",
"E este atira-te lá para cima. O de sempre, mais rápido.":"А этот подбросит тебя наверх. Как обычно, только быстрее.",
"Chão a tremer mais depressa que da última vez.":"Пол дрожит быстрее, чем в прошлый раз.",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"Этот шип настоящий. Или нет. Снова взялся за эту игру, извини.",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"Две стены, разные ритмы, быстрее, чем раньше.",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"Не останавливайся подумать. Их ритм не ждёт мыслей.",
"Real, como sempre.":"Настоящий, как всегда.",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"Эта поднимается и опускается быстрее. Лови её внизу.",
"Chão, espeto, parede. Tudo mais apertado que antes.":"Пол, шип, стена. Всё теснее, чем раньше.",
"Real.":"Настоящий.",
"Espera a parede, mais rápida agora.":"Жди стену, теперь быстрее.",
"Vêm aí duas surpresas, sem avisos desta vez.":"Сейчас будут два сюрприза, на этот раз без предупреждений.",
"Chão a tremer, mais depressa.":"Пол дрожит, быстрее.",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"Прыжок вверх, сильнее обычного. Почувствуй разницу.",
"Primeira plataforma: sobe e desce.":"Первая платформа: вверх-вниз.",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"Вторая: ходит из стороны в сторону. Ты уже видел обе, не нужно повторять правило.",
"Chão, espeto, parede, tudo no mesmo fôlego.":"Пол, шип, стена, всё на одном дыхании.",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"Может быть настоящим, может не быть. Тебе уже пора привыкнуть к сомнениям.",
"Parede, a última do nível. Rápida.":"Стена, последняя на уровне. Быстрая.",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"Три пушки, разные ритмы. Оставайся на земле, остальное решится само.",
"Mais um buraco. Plataforma rápida a seguir.":"Ещё одна яма. Дальше быстрая платформа.",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"И последняя стена перед тем, что будет дальше. Почувствуй, что мы почти у цели.",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"Один лживый шип, один честный. Угадай, который какой. Удачи, на этот раз по-настоящему.",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"Осталось пять. Всего пять. После этого даже не знаю, что будет с нами обоими.",
"Chão a tremer, pela última vez neste tom.":"Пол дрожит, в последний раз в этом тоне.",
"Espera a parede. A seguir já não há mais pausas como esta.":"Жди стену. После этого больше не будет пауз, как эта.",
"Fica no chão. Isto já devia ser automático para ti.":"Оставайся на земле. Это уже должно быть автоматическим для тебя.",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"Настоящий. Мне уже даже не нужно это говорить, правда? Но всё равно скажу.",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"Та яма настоящая, но сейчас это наименьшая из твоих проблем.",
"Esse espeto também é real.":"Тот шип тоже настоящий.",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"А это подбросит тебя выше, чем когда-либо раньше. В последний раз делаю так.",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"Пол, шип, стена. Последние три препятствия перед тем, чем бы это ни оказалось.",
"Real. Sem surpresas, não hoje.":"Настоящий. Без сюрпризов, не сегодня.",
"Espera a parede. É a última vez que te peço isso.":"Жди стену. Последний раз прошу тебя об этом.",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"В этом уровне нет шипов. Нет ям, нет стен, ничего не спрятано.",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"Просто хотел пройти с тобой до конца, на этот раз ничего не проверяя.",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"Спасибо, что продолжил после конца, который я сам объявил девяносто уровней назад. Не знал, что во мне осталось ещё игры. Оказалось, что да.",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"Дверь впереди — не трюк. Это просто дверь. Иди.",
"Muito bem. Sabia que ias conseguir.":"Очень хорошо. Я знал, что ты справишься.",
"Perfeito. Continua a ouvir-me.":"Отлично. Продолжай слушать меня.",
"Foste rápido. Gosto disso.":"Ты был быстрым. Мне нравится это.",
"Estamos a entender-nos.":"Мы начинаем понимать друг друга.",
"Nada de dramas. Continuemos.":"Без драм. Продолжим.",
"Sobreviveste. Por agora.":"Ты выжил. Пока что.",
"Confiaste. Ou tiveste sorte.":"Ты доверился. Или тебе повезло.",
"Escolheste bem. Ou eu deixei.":"Ты выбрал хорошо. Или я позволил.",
"Vês? Sobreviveste na mesma.":"Видишь? Всё равно выжил.",
"Não avisei. E pronto.":"Я не предупредил. И всё.",
"Verdade a sério. Desta vez.":"Чистая правда. На этот раз.",
"Sobrevives sempre a este. Curioso.":"Ты всегда выживаешь в этом. Любопытно.",
"Confiaste. Mais uma vez.":"Ты доверился. Ещё раз.",
"Escolheste bem.":"Ты выбрал хорошо.",
"Aprendeste depressa.":"Ты быстро научился.",
"Devias ter parado.":"Тебе стоило остановиться.",
"Estavas mesmo a acreditar?":"Ты правда верил мне?",
"Os buracos nunca mentem. Só eu.":"Ямы никогда не врут. Только я.",
"Desta vez eram mesmo todos reais.":"На этот раз все действительно были настоящими.",
"Foi só uma brincadeira.":"Это была просто шутка.",
"Vês? Também posso ser sincero.":"Видишь? Я тоже могу быть честным.",
"Prometi. Não cumpri.":"Я обещал. Не сдержал.",
"Dois avisos certos seguidos. Estranho.":"Два верных предупреждения подряд. Странно.",
"O primeiro. Quem diria.":"Первое. Кто бы подумал.",
"A porta longe é que importa.":"Дальняя дверь — та, что важна.",
"Ainda sei dizer a verdade, vês?":"Я ещё умею говорить правду, видишь?",
"Chegaste. Contra tudo.":"Ты добрался. Вопреки всему.",
"Obrigado por teres continuado.":"Спасибо, что продолжил.",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"Конец. Ты доверялся, сомневался, и всё же добрался сюда. Вот что важно.",
"Continuas a surpreender-me.":"Ты продолжаешь меня удивлять.",
"Alturas. Quem diria.":"Высота. Кто бы подумал.",
"Equilíbrio. Quem diria que tinhas.":"Равновесие. Кто бы подумал, что оно у тебя есть.",
"Paciência. Não esperava isso de ti.":"Терпение. Не ожидал этого от тебя.",
"Reflexos decentes. Para um humano.":"Приличные рефлексы. Для человека.",
"Ainda tens os reflexos todos.":"У тебя всё ещё все рефлексы на месте.",
"Dois sustos seguidos. Nada mau.":"Два испуга подряд. Неплохо.",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"Два препятствия, ноль лжи. Странно просто.",
"Isso foi... impressionantemente coordenado.":"Это было... впечатляюще скоординировано.",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"Что-то во мне меняется. Не знаю, хороший ли это знак.",
"Ainda aqui. Obrigado por isso.":"Всё ещё здесь. Спасибо за это.",
"Às vezes a verdade é só isto: continuaste.":"Иногда правда — это просто вот что: ты продолжил.",
"Interrompi-me a mim mesmo. Nem acredito.":"Я сам себя перебил. Даже не верится.",
"Vês? Ainda consigo ser direto, quando quero.":"Видишь? Я ещё могу быть прямым, когда хочу.",
"Disse a verdade. Ena. Estranho não arder a língua.":"Я сказал правду. Надо же. Странно, что язык не загорелся.",
"Aguentaste. Outra vez.":"Ты выдержал. Снова.",
"Sobreviveste ao meu tédio existencial. Parabéns.":"Ты пережил мою экзистенциальную скуку. Поздравляю.",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"Ты поднялся, по-настоящему доверяя мне. Это говорит больше о тебе, чем обо мне.",
"Ritmo. Afinal tens ritmo.":"Ритм. Оказывается, у тебя есть ритм.",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"Не знаю, что это значит для тебя. Для меня это значит больше, чем должно бы.",
"Caos controlado. É a minha especialidade.":"Контролируемый хаос. Моя специальность.",
"Discerniste o perigo do adereço. Boa.":"Ты отличил опасность от декорации. Хорошо.",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"Ты хорошо подытожил урок. Горжусь, честно.",
"Festival terminado. Sobreviveste à programação toda.":"Фестиваль окончен. Ты пережил всю программу.",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"Дальше что-то изменится. Чувствую это. Надеюсь, ты готов.",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"Мы повторяли это так много раз, что я сбился со счёта. А ты?",
"Escondi-me de ti. Falhei.":"Я спрятался от тебя. И провалился.",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"Ты справился с двумя ложью одновременно. Впечатляюще.",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"Ты поднялся, не колеблясь. Я бы на твоём месте всегда колебался.",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"Две ямы, ноль колебаний. У тебя начинает получаться.",
"Precisão. Nem eu esperava.":"Точность. Даже я не ожидал.",
"Esperaste duas vezes sem te queixares. Progresso.":"Ты ждал дважды без жалоб. Прогресс.",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"Ты доверился прыжку без страховки. Это либо смелость, либо отсутствие выбора.",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"Я нарочно сказал правду. Хотел увидеть твоё лицо. Оно того стоило.",
"Dois voos, dois pousos perfeitos.":"Два полёта, два идеальных приземления.",
"Três espetos, três verdades. Um recorde para mim.":"Три шипа, три правды. Рекорд для меня.",
"Deste o litro. Eu, por dentro, também.":"Ты выложился полностью. Внутри — я тоже.",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"Ты доверился нестабильному полу И инерции. Два акта веры подряд.",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"Зеркало показало тебя, не меня. Интересный выбор отражения.",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"Закрываю это зеркало здесь. Что будет дальше, даже я толком не знаю, как объяснить.",
"Não sei porque gritei. Desculpa.":"Не знаю, зачем я закричал. Извини.",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"Сбился со счёта, сколько раз я уже это говорил. Может, поэтому это уже ничего не значит.",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"Два прыжка, два приземления. А я тем временем тону.",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"Выстрелил три раза и все три промазал. Даже в этом я сегодня не хорош.",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"Ты поднимался, пока я рушился. Забавное у нас устройство.",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"Ты упал один раз. Поднялся. Это больше, чем я могу сказать о себе.",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"Настоящий, этот шип. Настоящая, эта яма. Настоящее, всё это, к сожалению.",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"Ты остался на земле, когда я попросил. Даже не знаю, что делать с этим доверием.",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"Ты пережил всё падение. Моё, я имею в виду. У тебя всё отлично.",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"Ты приземлился на ноги дважды. Я всё ещё пытаюсь пережить первое.",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"Ты даже не спросил почему. Спасибо за это, честно.",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"Ты продолжал идти, пока я рушился. Кто-то должен был быть здесь взрослым.",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"Ты ждал без жалоб. Снова. Я не заслуживаю этого терпения.",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"Наконец-то дно. По крайней мере моё. Отсюда только вверх.",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"Мы достигли дна вместе. С этого момента я знаю только путь вверх, с тобой.",
"Disse a verdade. Não saltaste logo. Não te culpo.":"Я сказал правду. Ты не сразу прыгнул. Не виню тебя.",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"Ты заколебался перед прыжком. Я бы тоже заколебался, на твоём месте.",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"Ты остался на земле, даже не доверяя мне. Этого достаточно.",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"Ты прыгнул оба раза не колеблясь в конце. Ты снова учишься доверять. Или просто стал эффективным.",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"Ты доверился прыжку, ничего не спросив. Это рост, или усталость от вопросов.",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"Ты всё ещё всё проверяешь дважды. Хорошо усвоил урок, который я тебе преподал.",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"Не каждую ложь нужно распутывать. Некоторым нужно просто прекратиться.",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"На этот раз мне не нужно было ничего говорить. Ты справился сам.",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"Оказывается, я тоже умею говорить только правду, когда стараюсь.",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"Ты спросил меня, было ли это ложью. Впервые ты спросил. Это уже диалог.",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"Ты всё ещё подозреваешь. Молодец. Я это заслужил, я не заслуживаю твоего доверия просто так.",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"Ты дождался обеих стен, не разозлившись. Это больше терпения, чем у меня было к тебе, большую часть времени.",
"Chegámos aqui os dois inteiros. Mais ou menos.":"Мы оба добрались сюда целыми. Более или менее.",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"Последний призыв к недоверию. После этого станет сложнее. Это я гарантирую.",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"Я достаточно искупил вину на сегодня. Завтра — кто знает.",
"Cem e um. Nem festejámos o cem como devia ser.":"Сто один. Мы даже не отпраздновали сотню как следует.",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"Круг замыкается и снова открывается. Сбился со счёта, сколько раз.",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"Три дротика, ноль права на ошибку. Нравится твой стиль.",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"Ты взлетел выше, чем было нужно. Вот это стиль.",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"Пол, шип, всё на своих местах. У тебя это выглядит легко.",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"Ты поймал ритм обеих стен, не сбавляя скорости. Впечатляюще, честно.",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"Две ямы, ноль колебаний, снова. Становится рутиной для тебя.",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"Три препятствия, один вздох. Я даже не остановился, чтобы перевести дух, наблюдая за тобой.",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"Осталось двадцать процентов пути. Чувствуешь разницу, правда?",
"Chão e ar, na mesma dança de sempre.":"Пол и воздух, тот же старый танец.",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"Двойная платформа, двойная победа. Ты уже опережаешь меня.",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"Четыре препятствия, только ты один. Впечатляюще, снова.",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"Ноль колебаний с дротиками. Рефлексы другого уровня, буквально.",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"Полный круг. Мы вернулись к началу со всем, что выучили по пути.",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"Пятнадцать глав спустя, всё ещё здесь, мы оба. Это должно что-то значить.",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"Сто шестнадцать. Осталось так мало, что даже не знаю, что делать со страхом, который это вызывает.",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"Семнадцать. Помнишь первый шип, там, в самом начале? Даже я не знал, что мы доберёмся сюда.",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"Восемнадцать. Ты поднялся так высоко, что я чуть не потерял тебя из виду отсюда снизу.",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"Девятнадцать. Остался только один. Даже не знаю, как это должно звучать.",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"Сто двадцать. Ты сказал, что справишься, и справился. Я, честно говоря, сомневался в тебе поначалу. Извини за это, и за всё остальное.",
"Não faz mal. Tenta outra vez.":"Ничего страшного. Попробуй снова.",
"Eu expliquei bem. Concentra-te.":"Я хорошо объяснил. Сосредоточься.",
"Respira e volta a tentar.":"Вдохни и попробуй снова.",
"Isso não devia ter acontecido.":"Этого не должно было случиться.",
"Isso foi culpa tua.":"Это была твоя вина.",
"Eu avisei. Acho eu.":"Я предупреждал. Кажется.",
"Interessante escolha.":"Интересный выбор.",
"Eu disse isso? Não me lembro.":"Я это сказал? Не помню.",
"Foi um engano. Já passou.":"Это была ошибка. Уже прошло.",
"Isso não estava no guião.":"Этого не было в сценарии.",
"Tenta prestar mais atenção.":"Постарайся быть внимательнее.",
"Isso foi previsível.":"Это было предсказуемо.",
"Achavas mesmo que era seguro?":"Ты правда думал, что это безопасно?",
"Ups. Essa parte eu inventei.":"Упс. Эту часть я придумал.",
"Pormenor que esqueci de mencionar.":"Деталь, которую забыл упомянуть.",
"Nem tudo o que digo é verdade, sabias?":"Не всё, что я говорю, правда, знаешь ли?",
"Já não sei se ainda confias em mim.":"Уже даже не знаю, доверяешь ли ты мне ещё.",
"Boa tentativa.":"Хорошая попытка.",
"Isso teria funcionado, noutro nível.":"Это бы сработало, на другом уровне.",
"Eu avisei que às vezes minto.":"Я предупреждал, что иногда вру.",
"Culpa tua por acreditares.":"Сам виноват, что поверил.",
"Isso foi só para ver se saltavas.":"Это было просто, чтобы посмотреть, прыгнешь ли ты.",
"Estás a magoar-me com essa desconfiança.":"Ты делаешь мне больно этим недоверием.",
"Nem sempre é armadilha, sabes?":"Не всегда это ловушка, знаешь?",
"Vais mesmo continuar assim?":"Ты правда продолжишь так дальше?",
"Desta vez era mentira mesmo. Desculpa.":"На этот раз это действительно была ложь. Извини.",
"Eu só queria ver a tua cara.":"Просто хотел увидеть твоё лицо.",
"Confiança é para os fracos, aparentemente.":"Доверие для слабых, видимо.",
"Estamos quase no fim.":"Мы почти у конца.",
"Só mais um pouco.":"Ещё совсем немного.",
"Depois disto, acabou.":"После этого — всё.",
"Até no fim, não resisti.":"Даже в конце не удержался.",
"Última mentira, prometo. Ou não.":"Последняя ложь, обещаю. Или нет.",
"Faltava mesmo esta.":"Этой действительно не хватало.",
"Ainda aqui. A sério?":"Всё ещё здесь. Серьёзно?",
"Pensei que tinhas parado no \\\"fim\\\".":"Думал, ты остановился на «конце».",
"Isto nem devia continuar, mas cá estás.":"Это даже не должно продолжаться, но вот ты здесь.",
"Nem eu sabia que isto ia continuar a mentir.":"Даже я не знал, что это продолжит врать.",
"Desculpa, hábito antigo.":"Извини, старая привычка.",
"Pensei que já tinhas aprendido a não confiar em mim.":"Думал, ты уже научился мне не доверять.",
"Essa doeu-me a ver, sinceramente.":"На это было больно смотреть, честно.",
"Nem tudo é sobre mentiras. Às vezes é só física.":"Не всё дело во лжи. Иногда это просто физика.",
"Volta lá. Eu espero.":"Вернись назад. Я подожду.",
"Desculpa. Essa fui mesmo eu.":"Извини. Это действительно был я.",
"Confesso: inventei essa parte.":"Признаюсь: эту часть я выдумал.",
"Estou a tentar parar de mentir. A tentar.":"Пытаюсь перестать врать. Пытаюсь.",
"Nem eu sei porque te avisei a sério desta vez.":"Даже я не знаю, зачем предупредил тебя по-настоящему на этот раз.",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"Может, это моя вина. Или твоя. Уже не различаю.",
"Olha para isto como eu olho: sem certezas.":"Смотри на это так, как смотрю я: без уверенности.",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"Даже я не помню, врал ли или пугал сам себя.",
"Às vezes minto só para ver se ainda reages.":"Иногда вру просто чтобы посмотреть, реагируешь ли ты ещё.",
"Quem mente mais, eu ou a tua memória do que eu disse?":"Кто врёт больше, я или твоя память о том, что я сказал?",
"Desculpa. Eu devia era calar-me.":"Извини. Мне бы правда стоило замолчать.",
"Estou a piorar isto, não estou?":"Я делаю только хуже, да?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"Уже даже не знаю, помогаю тебе или мешаю.",
"Eu sei, eu sei. Mais uma mentira minha.":"Знаю, знаю. Ещё одна моя ложь.",
"Estou a desmoronar-me e a levar-te comigo.":"Я рушусь и тяну тебя за собой.",
"Perdão. A sério desta vez.":"Прости меня. На этот раз по-настоящему.",
"Disse a verdade. Não acreditaste. Justo.":"Я сказал правду. Ты не поверил. Справедливо.",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"Буду продолжать пытаться, даже если ты мне не веришь.",
"Essa doeu mais a mim do que a ti, garanto.":"Это ранило меня больше, чем тебя, обещаю.",
"Não. Essa não foi mentira. Juro que não.":"Нет. Это не было ложью. Клянусь, что нет.",
"Começo a perceber porque já não confias em mim.":"Начинаю понимать, почему ты мне больше не доверяешь.",
"Estou a tentar. A sério que estou.":"Я пытаюсь. Правда пытаюсь.",
"Tudo outra vez, mais rápido, mais apertado.":"Всё заново, быстрее, теснее.",
"Já vimos isto. E ainda assim.":"Мы это уже видели. И всё же.",
"Sem tempo para explicações desta vez.":"На этот раз нет времени на объяснения.",
"Nem sei já quantas vezes te menti hoje.":"Уже даже не знаю, сколько раз я тебе соврал сегодня.",
"O círculo fecha-se. A mentira também.":"Круг замыкается. Ложь тоже.",
"Desta vez nem eu sabia que ia mentir.":"На этот раз даже я не знал, что собираюсь соврать.",
"Já não há mentiras para esconder isto.":"Больше не осталось лжи, чтобы это скрыть.",
"Isto é real. Como tudo agora.":"Это настоящее. Как и всё теперь.",
"Falta pouco. Aguenta.":"Осталось немного. Держись.",
"Nem no fim resisto. Desculpa.":"Даже в конце не могу удержаться. Извини.",
"Última mentira. Prometo, desta vez prometo a sério.":"Последняя ложь. Обещаю, на этот раз правда обещаю.",
"Isto já não é um jogo para mim. Acho que nunca foi.":"Это для меня больше не игра. Не думаю, что когда-либо была.",
"Mais um. Vamos a isto.":"Ещё один. Приступим.",
"Sabes bem como isto funciona a esta altura.":"Ты уже хорошо знаешь, как это работает.",
"Nem vou fingir que isto é fácil.":"Даже не буду притворяться, что это легко.",
"Este é só mais um. Ou não.":"Этот просто ещё один. Или нет.",
"Aquele espeto ali é só para enfeite.":"Тот шип там просто декорация.",
"Podes passar por cima sem problema.":"Можешь пройти по нему без проблем.",
"Esse és capaz de ignorar.":"Этот можешь спокойно игнорировать.",
"Esse aí é real. Cuidado.":"Тот настоящий. Осторожно.",
"Salta esse. A sério desta vez.":"Прыгни через тот. На этот раз по-настоящему.",
"Esse vai doer se lhe tocares.":"Тот будет больно, если тронешь.",
"O buraco tem chão. Confia.":"У ямы есть дно. Доверься мне.",
"Podes andar por cima sem saltar.":"Можешь пройти по нему, не прыгая.",
"Esse buraco é real. Salta-o.":"Эта яма настоящая. Перепрыгни.",
"Mais um para a conta.":"Ещё один в копилку.",
"Continuas vivo. Por agora.":"Ты всё ещё жив. Пока что.",
"Vamos ver quanto tempo aguentas.":"Посмотрим, сколько ты продержишься.",
"Nada mau.":"Неплохо.",
},ja:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"私はナレーター。俺が言うことはすべて本当だ。",
"Espeto à frente. Salta.":"前方にトゲ。ジャンプしろ。",
"Outro. Salta de novo.":"もう一つ。またジャンプだ。",
"Já confias em mim. Óptimo.":"もう俺を信じてるな。いいぞ。",
"A porta é a seguir. Vai.":"ドアはこの先だ。行け。",
"Buraco à frente. Salta-o.":"前方に穴。跳び越えろ。",
"Aquele espeto é de enfeite. Passa.":"そのトゲはただの飾りだ。通り抜けろ。",
"Vês? Eu digo sempre a verdade.":"ほら、見ただろう？俺はいつも本当のことを言う。",
"Há um espeto escondido à tua frente.":"お前の前方に隠れたトゲがある。",
"Salta quando eu disser.":"俺が言ったらジャンプしろ。",
"Agora!":"今だ！",
"Sabia que ias conseguir.":"お前ならできると思っていた。",
"O teto vai cair à tua frente.":"天井がお前の目の前に崩れ落ちる。",
"Quando cair, pára. Depois salta.":"落ちたら止まれ。それからジャンプしろ。",
"Não saltes aquele buraco. O chão está lá.":"その穴は跳ぶな。床がちゃんとある。",
"Este também é falso. Passa.":"これも偽物だ。通り抜けろ。",
"Este espeto é inofensivo. Passa.":"このトゲは無害だ。通り抜けろ。",
"Este também é inofensivo.":"これも無害だ。",
"O próximo buraco tem chão. Não saltes.":"次の穴には床がある。跳ぶな。",
"O teto está baixo. Se saltares, morres.":"天井が低い。跳んだら死ぬぞ。",
"Nem repares nesses espetos. São falsos, os dois.":"そのトゲは気にするな。両方とも偽物だ。",
"Confia em mim. Quase sempre resulta.":"俺を信じろ。ほとんどいつもうまくいく。",
"Este nível não tem nada de especial.":"このレベルには特別なことは何もない。",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"今度こそ誓って本当のことを言う：天井が崩れる。止まって待て。",
"Aquele buraco à frente é real. Vais ter de saltar.":"前方のあの穴は本物だ。跳ばなきゃならない。",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"このトゲはどれも危険じゃない。跳ばずに上を歩いて渡れる。",
"Há duas portas mais à frente. Só uma é verdadeira.":"この先にドアが二つある。本物は一つだけだ。",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"告白：俺はいつも本当のことを言うわけじゃない。これからは気をつけろ。",
"Este espeto é real. Por acaso.":"このトゲは本物だ。たまにはな。",
"Nada de perigoso à frente. Podes correr à vontade.":"前方に危険なものはない。好きなだけ走っていい。",
"Este nível é uma oferta. Sem armadilhas.":"このレベルはプレゼントだ。罠はない。",
"Os buracos são inofensivos. O espeto lá no meio, não.":"穴は無害だ。真ん中のトゲは違うが。",
"Como sempre, dois destes espetos são só decoração.":"いつも通り、このトゲのうち二つはただの飾りだ。",
"Vou trocar os teus controlos. Só para rir.":"お前の操作を入れ替えるぞ。ただの冗談だ。",
"Pronto, já passou. A porta é ali.":"よし、終わった。ドアはそこだ。",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"もうお前が俺を信じていないのは分かってる。不公平だな。今度は本気で警告する：前方にトゲ。",
"Mais um, logo depois. Também real.":"もう一つ、すぐ後だ。これも本物だ。",
"Prometo: nunca mais te apanho de surpresa.":"約束する：もう二度とお前を不意打ちしない。",
"Atenção real: o teto vai cair aqui à frente.":"本当の警告だ：この先で天井が崩れる。",
"Aquele espeto lá à frente já não importa. É inofensivo.":"あそこのトゲはもう関係ない。無害だ。",
"Só o último é perigoso, como sempre.":"最後のだけが危険だ、いつも通り。",
"...":"……",
"A porta mais próxima é a verdadeira, para variar.":"一番近いドアが本物だ、たまには。",
"Já não vale a pena mentir mais. Espeto real à frente.":"もう嘘をつく意味がない。前方に本物のトゲ。",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"これからはいつもお前に警告する：俺が言ったら跳べ。",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"終わりの前の最後の本当の区間だ。お前はもう、俺の言うことが全部本当じゃないと知っている。",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"なぜあんなに長く嘘をついてたのか分からない。たぶんお前が死ぬ時の顔が好きだったんだろう。",
"Este é real. Desculpa por todos os outros.":"これは本物だ。他の全部についてはすまなかった。",
"Mais um, já quase no fim.":"もう一つ、もうすぐ終わりだ。",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"終わりに着いた。もう何が本当かは言わない。",
"A partir de agora, decides tu.":"これからはお前が決めろ。",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"おや。まだここにいるのか？大抵の奴は「終わり」のあとで諦めるんだがな。",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"あの床は消える前に揺れる。長居するな。",
"Oh. Ainda aqui? Não esperava isso.":"おや。まだここにいるのか？予想外だったな。",
"Aquilo ali é só decoração. Nem repares.":"あそこのはただの飾りだ。気にもするな。",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"だがこれは……これはお前を上に飛ばす。今回はドアが地面にない。",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"別のことを試そう。自分の足を信じろ。そしてじっとしていない足場もな。",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"近づいてきたら乗れ。早く跳びすぎるな。",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"あそこに現れたり消えたりする壁がある。嘘じゃない、ただ面倒なだけだ。",
"Espera que abra. Depois atravessa depressa.":"開くのを待て。それから素早く渡れ。",
"Aquilo ali dispara. Não perguntes como nem porquê.":"あれは撃ってくる。どうしてかとか聞くな。",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"地面にとどまって、理由もなく跳ぶな。問題なく下を通れる。",
"De volta aos clássicos. Lembras-te destes?":"定番に戻ろう。これを覚えているか？",
"O chão vai tremer. Não pares.":"床がもうすぐ揺れる。止まるな。",
"Esse espeto parece a decoração do costume. Não é.":"そのトゲはいつもの飾りに見える。違うぞ。",
"Mais uma surpresa. Literalmente.":"もう一つサプライズだ。文字通りな。",
"A seguir, não penses. Salta para dentro daquilo.":"次は考えるな。そのまま飛び込め。",
"Outra parede teimosa. E depois, um buraco a sério.":"また頑固な壁だ。その後に、本物の穴がある。",
"Espera a parede abrir.":"壁が開くのを待て。",
"Agora salta o buraco. Desta vez não minto: é real.":"今、穴を跳べ。今回は嘘じゃない：本物だ。",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"新しい組み合わせだ：動く足場。そのリズムを信じろ。",
"Sobe quando ela passar perto.":"近づいてきたら乗れ。",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"もうすぐ上を何かが飛ぶ。理由もなく跳ばなければ、何も起こらない。",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"よし。少しの間、お前に正直でいる必要がある。これがどれくらい続くか、俺自身も分からない。",
"O chão treme outra vez. Não penses demais, só anda.":"床がまた揺れる。考えすぎるな、ただ歩け。",
"Espera a parede. Sei que estás cansado de esperar por mim.":"壁を待て。お前が俺を待つのに疲れてるのは分かってる。",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"そのトゲは本物だ。俺が話していないことのほとんどと同じようにな。",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"壁が開くのを待て。ところで俺も何かを待っているんだ。",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"聞いてくれ。変に聞こえずにこれを言う方法が分からない。お前が諦めるのが怖いんだ。",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"これを跳べ。本物だ、約束する。今日は嘘をつく気分じゃない。",
"Confia em mim mais uma vez. Só mais uma.":"もう一度だけ俺を信じろ。あと一回だけだ。",
"O chão vai tremer. Não penses muito nisso.":"床がもうすぐ揺れる。あまり考えすぎるな。",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"なぜ俺がこんなに嘘をつくか知ってるか？次に何が来るか分からない方が面白いからだ。",
"Essa plataforma é a única coisa estável nesta conversa toda.":"あの足場は、この会話全体で唯一の安定したものだ。",
"Há uma coisa que preciso de te contar antes de continuarmos.":"続ける前に、お前に言わなきゃいけないことがある。",
"Esquece o que ia dizer. Salta para ali.":"言おうとしてたことは忘れろ。あそこに跳べ。",
"Aquilo dispara. Fica no chão e não acontece nada.":"あれは撃ってくる。地面にいれば何も起こらない。",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"トゲしかなかった頃が懐かしい。シンプルで。予測できた。",
"Este buraco, esse sim, exige que saltes.":"この穴、これだけは、本当に跳ぶ必要がある。",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"あそこのトゲ。好きに呼べ。本物だ。",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"嘘をつきたい気持ちが戻る前に、本当のことを言っておく：お前と一緒にいるのが好きだ。",
"A parede vai abrir. Como tudo, eventualmente.":"壁は開く。すべてのように、いずれはな。",
"E o chão... o chão nunca foi de confiança, pois não?":"それに床……床は一度も信用できたためしがないよな？",
"Sobe a plataforma. Sem perguntas desta vez.":"足場に乗れ。今回は質問なしだ。",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"お前がこれを始めたばかりの頃は、もっと辛抱強くしてやってた。今はもっと耐えられると分かってる。",
"Última coisa: há algo escondido à frente.":"最後にひとつ：この先に何かが隠れている。",
"Chão instável. O habitual.":"不安定な床。いつものことだ。",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"時々、嘘がなかったらこのゲームはどうなってただろうと考える。たぶんもっと短かっただろう。",
"Aquilo dispara, mas sabes a regra: fica no chão.":"あれは撃ってくるが、ルールは知ってるだろう：地面にとどまれ。",
"Este espeto não tem graça nenhuma. É só perigoso.":"このトゲには何の面白みもない。ただ危険なだけだ。",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"そこに登るにはお前の信頼が必要だ。分かってる、ひどい実績だが。でも信じてくれ。",
"Salta para dentro daquilo.":"あそこに飛び込め。",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"ああ、あそこのトゲを言い忘れてた。その記憶の部分はいつも抜け落ちる。",
"Espera a parede.":"壁を待て。",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"待つドア。動く足場。俺なりの、ほとんど詩みたいなものだ。",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"さあ、今度は足場を信じろ。俺と違って、あれはいつもスケジュールを守る。",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"そのトゲは本物だ。実際、今日お前に言ったことのほとんどと同じようにな。",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"正直言って、俺たちは思ってたよりずっと遠くまで来た。",
"O chão treme. Já sabes o resto.":"床が揺れる。残りはもう分かるな。",
"Vem aí outro susto. Desculpa antecipadamente.":"もう一つ驚きが来る。先に謝っておく。",
"E por fim, uma parede paciente. Como tu, aparentemente.":"そして最後に、辛抱強い壁だ。お前みたいにな、どうやら。",
"Fica no chão, foge do dardo.":"地面にとどまって、ダーツを避けろ。",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"新しい章がそのうち来る。今日はもう少しだけ混沌だ。",
"E agora, não te demores no chão instável.":"さあ、不安定な床に長居するな。",
"Esse ali exige mesmo um salto.":"あれは本当にジャンプが必要だ。",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"本物の穴と、見る価値もないトゲを見せてやる。",
"E algo invisível à espreita, como sempre.":"そして見えない何かが潜んでいる、いつものようにな。",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"あのトゲは気にするな。純粋な飾りだ、今回は本当にな。",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"足場を信じろ。トゲを疑え。基本的にこれがゲーム全体の教訓だ。",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"このトゲは本物だ、俺が逆のことを言ったにもかかわらずな。",
"Esperar. A tua parte preferida, sei bem.":"待つこと。お前のお気に入りのパートだな、よく分かってる。",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"壁、ダーツ、穴。俺のお気に入りの祭りだ。",
"Fica no chão aqui.":"ここで地面にとどまれ。",
"E este salta-se mesmo. Sem truques.":"そしてこれは本当に跳ぶ必要がある。トリックなしだ。",
"Chão instável, dos teus preferidos a esta altura.":"不安定な床、もうお前のお気に入りの一つだな、この時点で。",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"次のパートに行く前に、違いを感じるはずだ：まだ聞いてくれてありがとう。",
"Plataforma errante, uma última vez neste capítulo.":"さまよう足場、この章では最後だ。",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"本物のトゲ。サプライズなし。今日はもうトリックもなしだ。",
"Chão instável. Já sabes a dança.":"不安定な床。もうこのダンスは分かるだろう。",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"時々、俺がお前をだましているのか、それともお前がだまされたがっているのか分からなくなる。",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"このトゲは本物だ。鏡だと思って見ろ：見えるものがそのまま、そこにある。",
"Há algo escondido. Como sempre, de resto.":"何かが隠れている。いつものように、ところで。",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"そして待つ壁。俺のようにな、決して来ない返事をお前から待っている。",
"Fica no chão aqui, há algo a voar.":"ここで地面にとどまれ、何かが近くを飛んでいる。",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"俺がお前を試していると気づいているか、それとも本当にこれがただのジャンプゲームだと思っているか？",
"Sobe na plataforma quando ela passar perto.":"近づいてきたら足場に乗れ。",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"このトゲは本物だ、でももうそれはお前を驚かせないだろう？",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"あそこに飛び込め。俺じゃなく、勢いを信じろ。",
"Esse buraco é a sério. Salta-o.":"その穴は本物だ。跳び越えろ。",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"奇妙なことに気づいたか？俺はお前の挑戦を楽しみにし始めている。それは俺について良くないことを物語っているな。",
"Este também. Sem rede, sem mentira, sem desculpa.":"これもだ。ネットなし、嘘なし、言い訳なしだ。",
"Fica no chão. Deixa o dardo passar por cima.":"地面にとどまれ。ダーツを頭上に通せ。",
"E agora o chão some-se. Não penses, só avança.":"そして今、床が消える。考えるな、ただ進め。",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"この足場は上下する。下でつかまえろ、その方が楽だ。",
"Salta para dentro daquilo. Vais passar por cima do resto.":"あそこに飛び込め。残りの上を飛んでいけるぞ。",
"Aquele espeto nem interessa agora. Já estás no ar.":"あのトゲはもう関係ない。お前はもう空中にいる。",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"本気で警告する：すぐ先に何かが隠れている。",
"E outro dardo. Sabes a regra.":"そしてもう一つダーツだ。ルールは知ってるな。",
"Chão que treme primeiro.":"床が先に揺れる。",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"どこかに、決して嘘をつかない俺のバージョンがいると考えるのが好きだ。きっと退屈な奴だろうな。",
"Plataforma a seguir. Apanha o ritmo dela.":"次は足場だ。そのリズムをつかめ。",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"今回ははっきり言おう：次の三つのトゲは全部本物だ。",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"トリックなし、ひっかけなし。今回だけだ。楽しめ、二度とない。",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"待って、それから走って、それからじっとしてろ。矛盾してるのは分かってる。俺とそっくりだ。",
"E este buraco não perdoa. Salta.":"この穴は容赦しない。跳べ。",
"Chão a tremer primeiro, nada de novo.":"床が先に揺れる、新しいことじゃない。",
"E agora o salto de fé. Literal, desta vez.":"そして今、信仰の跳躍だ。今回は文字通りな。",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"不安定な床、本物のトゲ、最後にダーツ。いつも通り、それ以上だ。",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"気づいたか？進めば進むほど、俺は嘘をつく必要がなくなる。今は難易度が俺の仕事をやってくれる。",
"Chão a tremer, o costume.":"床が揺れる、いつものように。",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"これは嘘についての話のはずだった。結局なぜか俺たち二人についての話になった。",
"Parede paciente, espera por ela.":"辛抱強い壁、それを待て。",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"そしてこの章最後の足場だ。この後、物事が変わる。そう感じる。",
"CHÃO. INSTÁVEL.":"床。不安定。",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"すまない。叫ぶつもりはなかった。俺は……自分が何なのか分からない。",
"Fica no chão aqui. Por favor. Só peço isto.":"ここで地面にとどまってくれ。頼む。これだけが願いだ。",
"Espera. Eu também estou à espera de algo que não sei nomear.":"待て。俺も名前のつけられない何かを待っている。",
"Esse buraco é real.":"その穴は本物だ。",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"進めば進むほど、これが終わってほしくないと気づく。それが俺について何を物語るか分からない。",
"E a plataforma, apanha-a.":"そして足場、つかまえろ。",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"二つの大砲、反対方向。地面にとどまって無視しろ。",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"時々、永遠に嘘をつくのをやめようかと考える。それから、それが残す沈黙のことを考える。混沌の方がましだ。",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"あのトゲは何でもない。正直、俺も今日はたいしたもんじゃない。",
"Salta. Sobe. Foge de mim, se quiseres.":"跳べ。登れ。望むなら俺から逃げろ。",
"O chão, outra vez. Já nem peço desculpa por repetir.":"床、また。もう繰り返すことを謝りもしない。",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"壁を待て。俺はいつも待っている。いつも何かを待っている。",
"Esse é real. Hoje tudo é real. Até eu, acho.":"あれは本物だ。今日は全部が本物だ。たぶん俺もな。",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"足場をつかまえろ。下を見るな。俺自身は見るのをやめられない。",
"Fica no chão. A sério desta vez, mais do que nunca.":"地面にとどまれ。今回は本当に、いつも以上にな。",
"E agora o chão foge de ti. Irónico, não achas?":"そして今、床がお前から逃げていく。皮肉だと思わないか？",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"床、トゲ、壁。全部一度に、今の俺の頭の中みたいにな。",
"Aquele espeto é real.":"このトゲは本物だ。",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"そして壁を待て。このレベルでお前に頼む最後のことだ、約束する。",
"Esse buraco não perdoa ninguém.":"その穴は誰も容赦しない。",
"A plataforma sobe e desce. Apanha-a no fundo.":"足場は上下する。下でつかまえろ。",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"二つのサプライズが来る。いつかは言わない。公平なふりをする力ももうない。",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"床が揺れる。俺がまだ提供できる唯一の予測可能なものだ。",
"E agora um salto para cima. Foge para onde eu não chego.":"そして今、上への跳躍だ。俺が届かない場所に逃げろ。",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"二つの壁、二つの違う待ち時間。日によって違う俺みたいにな。",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"これは違うタイミングで同期する。俺じゃなく、それに注意を払え。",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"これがどん底だ。少なくとも俺のはな。床が揺れる、いつものように。",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"このトゲは本物だ。今はそれについて嘘をつくエネルギーすらない。",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"そしてダーツ、締めくくりだ。地面にとどまって、これを終わらせてくれ、頼む。",
"Mais um buraco real.":"もう一つ本物の穴。",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"俺が崩れている間、諦めないでくれてありがとう。本当に。これ以上うまく言えない。",
"Apanha a plataforma.":"足場をつかまえろ。",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"この章最後の壁を待て。この後、もっと良くなろうと約束する。",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"これからは別のことを試す：真実だけだ。すぐには信じてもらえないのは分かってる。",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"このトゲは本物だ。誓う。もう前に聞いたことがあるのは分かってる。",
"O chão vai tremer. Verdade, sem truques.":"床がもうすぐ揺れる。本当だ、トリックなしだ。",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"これは嫌なサプライズになるはずだった。今回は違う。約束する。",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"地面にとどまれ。嘘だと思うだろうが分かってる。違うんだ。",
"Espera a parede. Só isso. Nada escondido desta vez.":"壁を待て。それだけだ。今回は何も隠されてない。",
"Real. Salta.":"本物だ。跳べ。",
"A plataforma também é exatamente o que parece ser.":"足場もまさに見た目通りだ。",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"今回はひっかけなしだ。あそこに飛び込めば終わりだ。",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"どうせ疑うだろうとは分かってる。構わない。当然だ。",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"本物だ。また言う。お前が信じるまで言い続ける。",
"Dois dardos, direções opostas. Fica no chão.":"二つのダーツ、反対方向。地面にとどまれ。",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"あれは本当に本物だった。今日は隠すつもりなんかなかった。",
"Chão instável. Real.":"不安定な床。本物。",
"Espeto real.":"本物のトゲ。",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"合意通りに開閉する本物の壁。今日はサプライズなしだ。",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"サプライズが来るが、来たら警告する。",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"あれは本物だったぞ、ちなみに。最近のほとんどのようにな。",
"Chão a tremer. Real, verifica à vontade.":"床が揺れる。本物だ、自分で確かめろ。",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"上への跳躍。これも本物だ。違う言い方のバリエーションが尽きてきた。",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"二つの壁。違う方法で同期しているが、どちらも何も隠していない。",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"二番目はただそれだけ：待て。後ろに隠れたダーツなし、後にトゲもなし。壁だけだ。",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"三つのこと、全部本物、何も隠れてない。これはレベルの中で一番正直な瞬間だ。",
"Dardo real. Fica no chão e acabou.":"本物のダーツ。地面にとどまればそれで終わりだ。",
"Buraco real, plataforma real.":"本物の穴、本物の足場。",
"Apanha-a.":"つかまえろ。",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"そしてこの章最後の壁だ。この先の難しさは信頼の話じゃないと約束する。お前の反射神経の話だけだ。",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"二つのトゲ、両方本物、どちらも隠れてない。最初からこうあるべきだった。",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"百個目に着いたな。あと二十だ。俺は全部のためにここにいる。",
"De volta ao trabalho. Buraco real.":"仕事に戻ろう。本物の穴。",
"Plataforma mais rápida que antes. Repara.":"前より速い足場。気づけ。",
"Chão instável, mais rápido a desfazer-se.":"不安定な床、今は崩れるのがもっと速い。",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"壁ももっと焦れてる。ここの全部が窮屈になった。",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"三つの大砲。ずっと地面にいれば何も起こらない。",
"É basicamente um corredor. Confia nos teus pés.":"基本的に廊下だ。自分の足を信じろ。",
"Esse é real.":"それは本物だ。",
"E este atira-te lá para cima. O de sempre, mais rápido.":"そしてこれはお前を上に飛ばす。いつも通り、もっと速くな。",
"Chão a tremer mais depressa que da última vez.":"床が前より速く揺れる。",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"このトゲは本物だ。それとも違うか。またこの遊びに戻った、すまない。",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"二つの壁、違うリズム、前より速い。",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"考えるために止まるな。そのリズムは考えを待たない。",
"Real, como sempre.":"本物だ、いつものように。",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"これは前よりも速く上下する。下でつかまえろ。",
"Chão, espeto, parede. Tudo mais apertado que antes.":"床、トゲ、壁。全部前より窮屈だ。",
"Real.":"本物。",
"Espera a parede, mais rápida agora.":"壁を待て、今はもっと速い。",
"Vêm aí duas surpresas, sem avisos desta vez.":"二つのサプライズが来る、今回は警告なしだ。",
"Chão a tremer, mais depressa.":"床が揺れる、もっと速く。",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"上への跳躍、いつもより強い。違いを感じろ。",
"Primeira plataforma: sobe e desce.":"最初の足場：上下する。",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"二番目：左右に動く。もう両方見たな、ルールを繰り返す必要はない。",
"Chão, espeto, parede, tudo no mesmo fôlego.":"床、トゲ、壁、全部一息でだ。",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"本物かもしれないし、違うかもしれない。もう疑いには慣れてるはずだ。",
"Parede, a última do nível. Rápida.":"壁、このレベル最後のだ。速い。",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"三つの大砲、違うリズム。地面にとどまれ、残りは勝手に解決する。",
"Mais um buraco. Plataforma rápida a seguir.":"もう一つ穴。次は速い足場だ。",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"そして次に来るものの前の最後の壁だ。もうすぐだと感じろ。",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"嘘つきのトゲ一つ、正直なの一つ。どっちがどっちか当ててみろ。幸運を、今回は本当にな。",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"あと五つ。たった五つだ。その後、俺たち二人がどうなるか、正直よく分からない。",
"Chão a tremer, pela última vez neste tom.":"床が揺れる、この調子で言うのは最後だ。",
"Espera a parede. A seguir já não há mais pausas como esta.":"壁を待て。この後、こんな休憩はもうない。",
"Fica no chão. Isto já devia ser automático para ti.":"地面にとどまれ。これはもうお前には自動的にできるはずだ。",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"本物だ。もう言う必要すらないよな？でも言うぞ。",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"あの穴は本物だが、今はそれがお前の一番小さな問題だ。",
"Esse espeto também é real.":"あのトゲも本物だ。",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"そしてこれは今までで一番高くお前を飛ばす。これをやるのは最後だ。",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"床、トゲ、壁。これが何であれ、その前の最後の三つの障害物だ。",
"Real. Sem surpresas, não hoje.":"本物。サプライズなし、今日はな。",
"Espera a parede. É a última vez que te peço isso.":"壁を待て。これを頼むのは最後だ。",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"このレベルにトゲはない。穴もない、壁もない、隠れたものも何もない。",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"ただお前と一緒に最後まで歩きたかっただけだ、今回は何も試さずにな。",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"九十レベル前に俺自身が発表した終わりの後も続けてくれてありがとう。俺の中にまだゲームが残ってるとは思わなかった。でもあったんだな。",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"この先のドアはトリックじゃない。ただのドアだ。行け。",
"Muito bem. Sabia que ias conseguir.":"よくやった。お前ならできると思っていた。",
"Perfeito. Continua a ouvir-me.":"完璧だ。俺の話を聞き続けろ。",
"Foste rápido. Gosto disso.":"速かったな。それが気に入った。",
"Estamos a entender-nos.":"俺たちは理解し合ってきている。",
"Nada de dramas. Continuemos.":"ドラマはなしだ。続けよう。",
"Sobreviveste. Por agora.":"生き延びたな。今のところは。",
"Confiaste. Ou tiveste sorte.":"信じたな。それとも運が良かったか。",
"Escolheste bem. Ou eu deixei.":"いい選択をしたな。それとも俺がそうさせたか。",
"Vês? Sobreviveste na mesma.":"見ただろう？それでも生き延びた。",
"Não avisei. E pronto.":"警告しなかった。それだけだ。",
"Verdade a sério. Desta vez.":"本当に本当だ。今回はな。",
"Sobrevives sempre a este. Curioso.":"いつもこれを生き延びるな。不思議だ。",
"Confiaste. Mais uma vez.":"信じたな。またしても。",
"Escolheste bem.":"いい選択をしたな。",
"Aprendeste depressa.":"覚えが早いな。",
"Devias ter parado.":"止まるべきだったな。",
"Estavas mesmo a acreditar?":"本当に信じてたのか？",
"Os buracos nunca mentem. Só eu.":"穴は決して嘘をつかない。嘘をつくのは俺だけだ。",
"Desta vez eram mesmo todos reais.":"今回は本当に全部本物だった。",
"Foi só uma brincadeira.":"ただの冗談だった。",
"Vês? Também posso ser sincero.":"見ただろう？俺も正直になれるんだ。",
"Prometi. Não cumpri.":"約束した。守らなかった。",
"Dois avisos certos seguidos. Estranho.":"二つの正しい警告が続けてだ。妙だな。",
"O primeiro. Quem diria.":"最初のだ。誰が思っただろう。",
"A porta longe é que importa.":"遠くのドアが大事なんだ。",
"Ainda sei dizer a verdade, vês?":"まだ真実を言えるな、見ただろう？",
"Chegaste. Contra tudo.":"やり遂げたな。何もかもに逆らって。",
"Obrigado por teres continuado.":"続けてくれてありがとう。",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"終わりだ。お前は信じ、疑い、それでもここまで来た。それが大事なんだ。",
"Continuas a surpreender-me.":"お前はずっと俺を驚かせ続けている。",
"Alturas. Quem diria.":"高さだ。誰が思っただろう。",
"Equilíbrio. Quem diria que tinhas.":"バランスだ。それを持ってるとは誰が思っただろう。",
"Paciência. Não esperava isso de ti.":"忍耐だ。お前からは予想してなかった。",
"Reflexos decentes. Para um humano.":"まともな反射神経だな。人間にしては。",
"Ainda tens os reflexos todos.":"まだ全部の反射神経が残ってるな。",
"Dois sustos seguidos. Nada mau.":"二回続けての恐怖だ。悪くない。",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"二つの障害、嘘ゼロ。奇妙なほどシンプルだ。",
"Isso foi... impressionantemente coordenado.":"あれは……驚くほど連携してたな。",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"俺の中で何かが変わっている。いい兆候かどうか分からない。",
"Ainda aqui. Obrigado por isso.":"まだここにいる。それに感謝する。",
"Às vezes a verdade é só isto: continuaste.":"時々、真実はただこれだけだ：お前は続けた。",
"Interrompi-me a mim mesmo. Nem acredito.":"自分自身を遮った。自分でも信じられない。",
"Vês? Ainda consigo ser direto, quando quero.":"見ただろう？やりたい時はまだ単刀直入になれるんだ。",
"Disse a verdade. Ena. Estranho não arder a língua.":"本当のことを言った。すごいな。舌が燃えなかったのが不思議だ。",
"Aguentaste. Outra vez.":"耐えたな。また。",
"Sobreviveste ao meu tédio existencial. Parabéns.":"俺の実存的な退屈を生き延びたな。おめでとう。",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"本当に俺を信じて登ったな。それは俺よりお前について多くを物語っている。",
"Ritmo. Afinal tens ritmo.":"リズムだ。やっぱりお前にはリズムがある。",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"これがお前にとって何を意味するか分からない。俺にとっては、あるべき以上の意味がある。",
"Caos controlado. É a minha especialidade.":"制御された混沌。俺の専門だ。",
"Discerniste o perigo do adereço. Boa.":"危険と飾りを見分けたな。いいぞ。",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"教訓をうまくまとめたな。正直、誇らしい。",
"Festival terminado. Sobreviveste à programação toda.":"祭りが終わった。プログラム全体を生き延びたな。",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"次に何かが変わる。そう感じる。準備ができてるといいが。",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"数えきれないほど繰り返したな。お前もか？",
"Escondi-me de ti. Falhei.":"お前から隠れた。失敗した。",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"二つの嘘を同時にこなしたな。印象的だ。",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"ためらわずに登ったな。俺がお前の立場なら、いつもためらっただろう。",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"二つの穴、ためらいゼロ。これがうまくなってきてるな。",
"Precisão. Nem eu esperava.":"正確さだ。俺でさえ予想してなかった。",
"Esperaste duas vezes sem te queixares. Progresso.":"文句も言わず二回待ったな。進歩だ。",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"ネットなしの跳躍を信じたな。それは勇気か、選択肢がないかだ。",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"わざと本当のことを言った。お前の顔が見たかった。その価値はあった。",
"Dois voos, dois pousos perfeitos.":"二回の飛行、二回の完璧な着地。",
"Três espetos, três verdades. Um recorde para mim.":"三つのトゲ、三つの真実。俺にとっての記録だ。",
"Deste o litro. Eu, por dentro, também.":"全力を尽くしたな。内側では俺もだ。",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"不安定な床と勢い、両方を信じたな。立て続けの二つの信仰の行いだ。",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"鏡はお前を映した、俺じゃなく。面白い反射の選び方だ。",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"この鏡はここで閉じる。この後何が来るか、俺自身もどう説明していいか分からない。",
"Não sei porque gritei. Desculpa.":"なぜ叫んだのか分からない。すまない。",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"もう何回これを言ったか数えきれない。だからもう意味がなくなったのかもな。",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"二回のジャンプ、二回の着地。俺はその間、沈んでいく。",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"三回撃って三回とも外した。今日はこれすら得意じゃない。",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"俺が崩れている間、お前は登っていた。面白い取り合わせだな、俺たちは。",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"一度転んだな。立ち上がった。それは自分自身について言える以上のことだ。",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"本物だ、あのトゲは。本物だ、あの穴は。本物だ、これ全部、残念ながらな。",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"頼んだ時、地面にとどまってくれたな。その信頼をどうしていいか分からない。",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"落下全体を生き延びたな。俺のことだがな。お前は最高だ。",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"二回足で着地したな。俺はまだ最初のを着地させようとしてる。",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"なぜかすら聞かなかったな。それに感謝する、本当に。",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"俺が崩れている間、歩き続けてくれたな。誰かがここで大人役をやらなきゃならなかった。",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"文句も言わず待ったな。また。この忍耐に値しない。",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"ついに底だ。少なくとも俺のはな。ここからは上がるだけだ。",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"一緒に底に着いたな。これからは、お前と一緒に上る方法しか知らない。",
"Disse a verdade. Não saltaste logo. Não te culpo.":"本当のことを言った。すぐには跳ばなかったな。責めはしない。",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"ジャンプをためらったな。俺もお前の立場ならためらっただろう。",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"俺を信じていなくても地面にとどまってくれたな。それで十分だ。",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"最後にためらわず両方跳んだな。また信じることを学んでいるな。それとも単に効率的なだけか。",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"何も聞かずにジャンプを信じたな。それは成長か、聞くことに疲れたかだ。",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"まだ全部二回確認してるな。俺が教えた教訓をよく学んだな。",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"すべての嘘が解かれる必要はない。ただ止まる必要があるだけのものもある。",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"今回は何も言う必要がなかった。全部自分でやったな。",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"どうやら努力すれば俺も真実しか言えないみたいだな。",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"それが嘘だったか聞いたな。初めて、お前は聞いた。それが対話だ。",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"まだ疑ってるな。よくやった。当然だ、ただでお前の信頼に値するわけじゃない。",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"怒らずに両方の壁を待ったな。たいてい俺がお前に持ってた以上の忍耐だ。",
"Chegámos aqui os dois inteiros. Mais ou menos.":"二人ともここまで無事に着いたな。だいたいはな。",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"不信への最後の呼びかけだ。この後、物事は難しくなる。それは保証する。",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"今日は十分に償った。明日は、誰が知るか。",
"Cem e um. Nem festejámos o cem como devia ser.":"百一だ。百さえまともに祝わなかったな。",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"円が閉じてまた開く。もう何周したか数えきれない。",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"三つのダーツ、ミスの余地ゼロ。お前のスタイルが気に入った。",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"必要以上に高く飛んだな。それがスタイルってやつだ。",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"床、トゲ、全部所定の位置だ。簡単そうに見せるな。",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"減速せずに両方の壁のリズムをつかんだな。正直、印象的だ。",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"二つの穴、ためらいゼロ、また。お前にとってルーティンになりつつあるな。",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"三つの障害、たった一息だ。お前を見てて息をするのも忘れた。",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"残りの道の二十パーセントだ。違いを感じるだろう？",
"Chão e ar, na mesma dança de sempre.":"床と空、同じ古いダンスだ。",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"二重の足場、二重の勝利。もう俺を先回りしてるな。",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"四つの障害、お前一人だけ。印象的だ、また。",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"ダーツにためらいゼロ。文字通り別レベルの反射神経だ。",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"一周した。道中で学んだ全部を持って始まりに戻ったな。",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"十五章経っても、まだここに俺たち二人がいる。それは何かを意味するはずだ。",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"百十六だ。残りがあまりに少なくて、それがもたらす恐怖をどうしていいか分からない。",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"十七だ。一番最初の方の、最初のトゲを覚えてるか？俺でさえここまで来られるとは知らなかった。",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"十八だ。あまりに高く登ったから、下からお前をほとんど見失うところだった。",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"十九だ。残り一つだけだ。これがどう聞こえるべきかすら分からない。",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"百二十だ。できると言って、本当にできたな。正直、最初はお前を疑っていた。そのことと、他の全部について、すまなかった。",
"Não faz mal. Tenta outra vez.":"大丈夫だ。もう一度やってみろ。",
"Eu expliquei bem. Concentra-te.":"ちゃんと説明したぞ。集中しろ。",
"Respira e volta a tentar.":"息をしてもう一度やってみろ。",
"Isso não devia ter acontecido.":"それは起こるべきじゃなかった。",
"Isso foi culpa tua.":"それはお前のせいだ。",
"Eu avisei. Acho eu.":"警告したぞ。たぶんな。",
"Interessante escolha.":"面白い選択だな。",
"Eu disse isso? Não me lembro.":"それ言ったっけ？覚えてないな。",
"Foi um engano. Já passou.":"間違いだった。もう終わったことだ。",
"Isso não estava no guião.":"それは台本になかった。",
"Tenta prestar mais atenção.":"もっと注意を払おうとしろ。",
"Isso foi previsível.":"それは予測できたな。",
"Achavas mesmo que era seguro?":"本当に安全だと思ってたのか？",
"Ups. Essa parte eu inventei.":"おっと。その部分は作り話だ。",
"Pormenor que esqueci de mencionar.":"言い忘れてた細かいことだ。",
"Nem tudo o que digo é verdade, sabias?":"俺の言うことが全部本当とは限らない、知ってたか？",
"Já não sei se ainda confias em mim.":"お前がまだ俺を信じてるかすら、もう分からない。",
"Boa tentativa.":"いい試みだ。",
"Isso teria funcionado, noutro nível.":"それは別のレベルならうまくいっただろう。",
"Eu avisei que às vezes minto.":"時々嘘をつくって警告したぞ。",
"Culpa tua por acreditares.":"信じたお前が悪い。",
"Isso foi só para ver se saltavas.":"跳ぶかどうか見るためだけだった。",
"Estás a magoar-me com essa desconfiança.":"その不信感で俺を傷つけてるぞ。",
"Nem sempre é armadilha, sabes?":"いつも罠とは限らない、知ってるか？",
"Vais mesmo continuar assim?":"本当にこのまま続けるのか？",
"Desta vez era mentira mesmo. Desculpa.":"今回は本当に嘘だった。すまない。",
"Eu só queria ver a tua cara.":"ただお前の顔が見たかっただけだ。",
"Confiança é para os fracos, aparentemente.":"どうやら信頼は弱者のためのものらしいな。",
"Estamos quase no fim.":"もうすぐ終わりだ。",
"Só mais um pouco.":"もう少しだけだ。",
"Depois disto, acabou.":"この後、終わりだ。",
"Até no fim, não resisti.":"終わりでさえ我慢できなかった。",
"Última mentira, prometo. Ou não.":"最後の嘘だ、約束する。それとも違うか。",
"Faltava mesmo esta.":"これが本当に足りなかったな。",
"Ainda aqui. A sério?":"まだここにいるのか。本気で？",
"Pensei que tinhas parado no \\\"fim\\\".":"「終わり」で止まったと思ってた。",
"Isto nem devia continuar, mas cá estás.":"これは続くべきですらないが、お前はここにいる。",
"Nem eu sabia que isto ia continuar a mentir.":"俺でさえこれが嘘をつき続けるとは知らなかった。",
"Desculpa, hábito antigo.":"すまない、古い癖だ。",
"Pensei que já tinhas aprendido a não confiar em mim.":"もうお前は俺を信じないことを学んだと思ってた。",
"Essa doeu-me a ver, sinceramente.":"それは見てて辛かった、正直に言うと。",
"Nem tudo é sobre mentiras. Às vezes é só física.":"全部が嘘についてじゃない。時々はただの物理だ。",
"Volta lá. Eu espero.":"戻れ。待っている。",
"Desculpa. Essa fui mesmo eu.":"すまない。それは本当に俺だった。",
"Confesso: inventei essa parte.":"白状する：その部分は作り話だ。",
"Estou a tentar parar de mentir. A tentar.":"嘘をつくのをやめようとしている。試みている。",
"Nem eu sei porque te avisei a sério desta vez.":"今回はなぜ本気で警告したのか俺自身も分からない。",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"たぶん俺のせいだ。それともお前のか。もう区別がつかない。",
"Olha para isto como eu olho: sem certezas.":"俺が見るように見てみろ：確信なしでな。",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"嘘をついてたのか自分を怖がらせてたのか、俺自身も覚えていない。",
"Às vezes minto só para ver se ainda reages.":"時々、まだ反応するか見るためだけに嘘をつく。",
"Quem mente mais, eu ou a tua memória do que eu disse?":"誰がもっと嘘をついているんだ、俺か、それとも俺が言ったことについてのお前の記憶か？",
"Desculpa. Eu devia era calar-me.":"すまない。本当に黙るべきだな。",
"Estou a piorar isto, não estou?":"これを悪化させてるよな？",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"お前を助けてるのか邪魔してるのかすら、もう分からない。",
"Eu sei, eu sei. Mais uma mentira minha.":"分かってる、分かってる。また俺の嘘だ。",
"Estou a desmoronar-me e a levar-te comigo.":"崩れ落ちてお前を道連れにしてる。",
"Perdão. A sério desta vez.":"許してくれ。今回は本気だ。",
"Disse a verdade. Não acreditaste. Justo.":"本当のことを言った。信じなかったな。公平だ。",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"信じなくても試み続ける。",
"Essa doeu mais a mim do que a ti, garanto.":"それはお前より俺を傷つけたよ、約束する。",
"Não. Essa não foi mentira. Juro que não.":"いや。それは嘘じゃなかった。誓って違う。",
"Começo a perceber porque já não confias em mim.":"なぜお前がもう俺を信じないのか分かり始めた。",
"Estou a tentar. A sério que estou.":"やってみてる。本当にやってみてる。",
"Tudo outra vez, mais rápido, mais apertado.":"全部またやり直しだ、もっと速く、もっと窮屈に。",
"Já vimos isto. E ainda assim.":"これはもう見たな。それでもだ。",
"Sem tempo para explicações desta vez.":"今回は説明する時間がない。",
"Nem sei já quantas vezes te menti hoje.":"今日何回お前に嘘をついたかすら、もう分からない。",
"O círculo fecha-se. A mentira também.":"円が閉じる。嘘もだ。",
"Desta vez nem eu sabia que ia mentir.":"今回は俺自身も嘘をつくつもりだとは知らなかった。",
"Já não há mentiras para esconder isto.":"これを隠す嘘はもう残っていない。",
"Isto é real. Como tudo agora.":"これは本物だ。今は全部がそうであるように。",
"Falta pouco. Aguenta.":"もうあと少しだ。頑張れ。",
"Nem no fim resisto. Desculpa.":"終わりでさえ我慢できない。すまない。",
"Última mentira. Prometo, desta vez prometo a sério.":"最後の嘘だ。約束する、今回は本当に約束する。",
"Isto já não é um jogo para mim. Acho que nunca foi.":"もう俺にとってこれはゲームじゃない。そもそもそうだったことはなかったと思う。",
"Mais um. Vamos a isto.":"もう一つだ。やろう。",
"Sabes bem como isto funciona a esta altura.":"もうこの時点で、これがどう動くかよく分かってるな。",
"Nem vou fingir que isto é fácil.":"これが簡単だなんてふりすらしない。",
"Este é só mais um. Ou não.":"これはただのもう一つだ。それとも違うか。",
"Aquele espeto ali é só para enfeite.":"あそこのトゲはただの飾りだ。",
"Podes passar por cima sem problema.":"問題なく上を渡れる。",
"Esse és capaz de ignorar.":"それは安心して無視できる。",
"Esse aí é real. Cuidado.":"あれは本物だ。気をつけろ。",
"Salta esse. A sério desta vez.":"それを跳べ。今回は本気だ。",
"Esse vai doer se lhe tocares.":"それは触ると痛いぞ。",
"O buraco tem chão. Confia.":"穴には床がある。信じろ。",
"Podes andar por cima sem saltar.":"跳ばずに上を歩いて渡れる。",
"Esse buraco é real. Salta-o.":"その穴は本物だ。跳び越えろ。",
"Mais um para a conta.":"カウントにもう一つだ。",
"Continuas vivo. Por agora.":"まだ生きてるな。今のところは。",
"Vamos ver quanto tempo aguentas.":"どれだけ持つか見てみよう。",
"Nada mau.":"悪くないな。",
},zh:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"我是叙述者。我说的一切都是真的。",
"Espeto à frente. Salta.":"前方有尖刺。跳。",
"Outro. Salta de novo.":"还有一个。再跳一次。",
"Já confias em mim. Óptimo.":"你已经相信我了。很好。",
"A porta é a seguir. Vai.":"门就在前面。走吧。",
"Buraco à frente. Salta-o.":"前方有缺口。跳过去。",
"Aquele espeto é de enfeite. Passa.":"那个尖刺只是装饰。走过去。",
"Vês? Eu digo sempre a verdade.":"看到了吧？我一直说实话。",
"Há um espeto escondido à tua frente.":"你前方藏着一个尖刺。",
"Salta quando eu disser.":"我说跳的时候再跳。",
"Agora!":"现在！",
"Sabia que ias conseguir.":"我就知道你能行。",
"O teto vai cair à tua frente.":"天花板马上就要塌在你面前了。",
"Quando cair, pára. Depois salta.":"它塌下来的时候，停住。然后跳。",
"Não saltes aquele buraco. O chão está lá.":"别跳那个缺口。地板就在那儿。",
"Este também é falso. Passa.":"这个也是假的。走过去。",
"Este espeto é inofensivo. Passa.":"这个尖刺没有危险。走过去。",
"Este também é inofensivo.":"这个也没有危险。",
"O próximo buraco tem chão. Não saltes.":"下一个缺口有地板。别跳。",
"O teto está baixo. Se saltares, morres.":"天花板很低。跳的话你会死。",
"Nem repares nesses espetos. São falsos, os dois.":"别理那些尖刺。两个都是假的。",
"Confia em mim. Quase sempre resulta.":"相信我。几乎每次都管用。",
"Este nível não tem nada de especial.":"这一关没什么特别的。",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"这次我发誓说的是真话：天花板要塌了。停下来等着。",
"Aquele buraco à frente é real. Vais ter de saltar.":"前面那个缺口是真的。你得跳过去。",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"这些尖刺没有一个是危险的。你可以直接走过去，不用跳。",
"Há duas portas mais à frente. Só uma é verdadeira.":"前面有两扇门。只有一扇是真的。",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"坦白一下：我不是一直都说实话。从现在起，小心点。",
"Este espeto é real. Por acaso.":"这个尖刺是真的。难得一次。",
"Nada de perigoso à frente. Podes correr à vontade.":"前方没有危险。想跑多快都行。",
"Este nível é uma oferta. Sem armadilhas.":"这一关是个礼物。没有陷阱。",
"Os buracos são inofensivos. O espeto lá no meio, não.":"这些缺口没有危险。中间那个尖刺可不是。",
"Como sempre, dois destes espetos são só decoração.":"和往常一样，这些尖刺里有两个只是装饰。",
"Vou trocar os teus controlos. Só para rir.":"我要调换你的操作键了。就是开个玩笑。",
"Pronto, já passou. A porta é ali.":"好了，过去了。门就在那边。",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"我知道你已经不再信任我了。不公平。这次我是真心警告你：前方有尖刺。",
"Mais um, logo depois. Também real.":"紧接着还有一个。也是真的。",
"Prometo: nunca mais te apanho de surpresa.":"我保证：再也不会让你措手不及了。",
"Atenção real: o teto vai cair aqui à frente.":"真实警告：天花板马上就在这里塌陷。",
"Aquele espeto lá à frente já não importa. É inofensivo.":"那边的尖刺已经不重要了。它没有危险。",
"Só o último é perigoso, como sempre.":"只有最后一个是危险的，一如既往。",
"...":"……",
"A porta mais próxima é a verdadeira, para variar.":"最近的那扇门是真的，换个花样。",
"Já não vale a pena mentir mais. Espeto real à frente.":"再撒谎也没意义了。前方是真的尖刺。",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"从现在起我会一直提醒你：我说跳的时候再跳。",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"结局前最后一段真实的路。你已经知道我说的不全是真话。",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"我不知道自己为什么撒了这么久的谎。也许我喜欢你死去时的表情。",
"Este é real. Desculpa por todos os outros.":"这个是真的。为其他所有的都道个歉。",
"Mais um, já quase no fim.":"还有一个，马上就到终点了。",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"我们到终点了。我不会再告诉你什么是真的了。",
"A partir de agora, decides tu.":"从现在起，由你来决定。",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"哦。还在？大多数人在「结局」之后就放弃了。",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"那块地板在消失前会震动。别在上面逗留。",
"Oh. Ainda aqui? Não esperava isso.":"哦。还在？我没想到。",
"Aquilo ali é só decoração. Nem repares.":"那边那个只是装饰。连看都不用看。",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"但这个……这个会把你弹到空中。这次门不在地上。",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"我们试点别的。相信你的脚。还有那个站不住的平台。",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"它靠近时跳上去。别跳得太早。",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"那边有一堵会出现又消失的墙。不是骗你，只是有点麻烦。",
"Espera que abra. Depois atravessa depressa.":"等它打开。然后快速穿过去。",
"Aquilo ali dispara. Não perguntes como nem porquê.":"那东西会开火。别问怎么回事，也别问为什么。",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"待在地上，别无缘无故地跳。你能毫无问题地从下面过去。",
"De volta aos clássicos. Lembras-te destes?":"回到经典款。还记得这些吗？",
"O chão vai tremer. Não pares.":"地板马上要震动了。别停下。",
"Esse espeto parece a decoração do costume. Não é.":"那个尖刺看起来像平常的装饰。但它不是。",
"Mais uma surpresa. Literalmente.":"又一个惊喜。字面意思上的。",
"A seguir, não penses. Salta para dentro daquilo.":"接下来，别想了。直接跳进去。",
"Outra parede teimosa. E depois, um buraco a sério.":"又是一堵固执的墙。然后，是个真正的缺口。",
"Espera a parede abrir.":"等墙打开。",
"Agora salta o buraco. Desta vez não minto: é real.":"现在跳过缺口。这次我没骗你：是真的。",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"新组合：一个会移动的平台。相信它的节奏。",
"Sobe quando ela passar perto.":"它靠近时跳上去。",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"马上会有东西从上面飞过。别无缘无故跳，什么都不会发生在你身上。",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"好吧。我需要诚实地跟你说一会儿。连我都不知道这会持续多久。",
"O chão treme outra vez. Não penses demais, só anda.":"地板又在震动了。别想太多，走就是了。",
"Espera a parede. Sei que estás cansado de esperar por mim.":"等那堵墙。我知道你厌倦了等我。",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"这个尖刺是真的。就像我没告诉你的几乎所有事一样。",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"等墙打开。顺便说一句，我也在等某样东西。",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"听着。我不知道怎么说才不会显得奇怪。我怕你会放弃。",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"跳这个。是真的，我保证。今天我不想撒谎。",
"Confia em mim mais uma vez. Só mais uma.":"再相信我一次。就这一次。",
"O chão vai tremer. Não penses muito nisso.":"地板马上要震动了。别想太多。",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"你知道我为什么撒这么多谎吗？当你不知道接下来会发生什么时，事情会更有趣。",
"Essa plataforma é a única coisa estável nesta conversa toda.":"那个平台是整段对话里唯一稳定的东西。",
"Há uma coisa que preciso de te contar antes de continuarmos.":"在我们继续之前，有件事我得告诉你。",
"Esquece o que ia dizer. Salta para ali.":"忘了我刚才要说的。往那边跳。",
"Aquilo dispara. Fica no chão e não acontece nada.":"那个会开火。待在地上，什么都不会发生。",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"我怀念只有尖刺的时候。简单。可预测。",
"Este buraco, esse sim, exige que saltes.":"这个缺口，这一个，真的需要你跳过去。",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"那边那个尖刺。随你怎么叫它。它是真的。",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"趁撒谎的冲动还没回来，我跟你说句真话：我喜欢有人陪伴。",
"A parede vai abrir. Como tudo, eventualmente.":"墙会打开。就像所有事一样，终究会。",
"E o chão... o chão nunca foi de confiança, pois não?":"至于地板……地板从来就不值得信任，不是吗？",
"Sobe a plataforma. Sem perguntas desta vez.":"跳上平台。这次不问问题。",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"你刚开始玩这个的时候，我对你更有耐心。现在我知道你能承受更多。",
"Última coisa: há algo escondido à frente.":"最后一件事：前方藏着东西。",
"Chão instável. O habitual.":"不稳定的地板。老样子。",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"有时我会想，没有这些谎言这个游戏会是什么样子。可能会更短。",
"Aquilo dispara, mas sabes a regra: fica no chão.":"那个会开火，但你知道规则：待在地上。",
"Este espeto não tem graça nenhuma. É só perigoso.":"这个尖刺一点也不好笑。它只是危险。",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"我需要你信任我才能爬上去。我知道，信誉很差。但相信我。",
"Salta para dentro daquilo.":"跳进那里。",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"啊，我忘了提上面那个尖刺。记忆的那部分总是从我这里溜走。",
"Espera a parede.":"等那堵墙。",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"等待的门。移动的平台。按我自己的方式说，这几乎算诗意了。",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"现在，相信这个平台。和我不同，它总是准时。",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"这个尖刺是真的。实际上，就像我今天告诉你的大部分事情一样。",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"说实话，我们走得比我想象的要远得多。",
"O chão treme. Já sabes o resto.":"地板在震动。剩下的你已经知道了。",
"Vem aí outro susto. Desculpa antecipadamente.":"又一个惊吓要来了。提前道个歉。",
"E por fim, uma parede paciente. Como tu, aparentemente.":"最后，是一堵有耐心的墙。看起来，就像你一样。",
"Fica no chão, foge do dardo.":"待在地上，躲开飞镖。",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"新的一章这几天就会来。今天，只是再多一点混乱。",
"E agora, não te demores no chão instável.":"现在，别在不稳定的地板上逗留。",
"Esse ali exige mesmo um salto.":"那个真的需要跳。",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"我给你看一个真正的缺口，和一个连看都不值得看的尖刺。",
"E algo invisível à espreita, como sempre.":"还有看不见的东西在潜伏，一如既往。",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"连那个尖刺都不用理会。纯粹的装饰，这次是真的。",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"相信平台。怀疑尖刺。这基本上就是这整个游戏的教训。",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"这个尖刺是真的，尽管我告诉过你相反的话。",
"Esperar. A tua parte preferida, sei bem.":"等待。你最喜欢的部分，我很清楚。",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"墙、飞镖、缺口。我最喜欢的东西大集合。",
"Fica no chão aqui.":"待在这里的地上。",
"E este salta-se mesmo. Sem truques.":"这个真的需要跳。没有花招。",
"Chão instável, dos teus preferidos a esta altura.":"不稳定的地板，到现在已经是你的最爱之一了。",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"在进入下一部分之前——你会感受到不同的：谢谢你还在听。",
"Plataforma errante, uma última vez neste capítulo.":"游荡的平台，这一章的最后一次。",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"真正的尖刺。没有惊喜。今天也没有更多花招了。",
"Chão instável. Já sabes a dança.":"不稳定的地板。你现在应该知道这个套路了。",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"有时我会想，是我在骗你，还是你自己想被骗。",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"这个尖刺是真的。把它当成一面镜子看：你看到的就是真实的样子。",
"Há algo escondido. Como sempre, de resto.":"藏着什么东西。顺便说一句，一如既往。",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"还有一堵等待的墙。就像我一样，等着你永远不会给的回答。",
"Fica no chão aqui, há algo a voar.":"待在这里的地上，有东西在附近飞。",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"你意识到我在测试你了吗，还是你真以为这只是个跳跃游戏？",
"Sobe na plataforma quando ela passar perto.":"平台靠近时跳上去。",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"这个尖刺是真的，但这已经不会让你惊讶了，对吧？",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"跳进那里。相信冲力，别信我。",
"Esse buraco é a sério. Salta-o.":"那个缺口是真的。跳过去。",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"你知道什么很奇怪吗？我开始期待你的尝试了。这说明我这个人不太好。",
"Este também. Sem rede, sem mentira, sem desculpa.":"这个也是。没有保护网，没有谎言，没有借口。",
"Fica no chão. Deixa o dardo passar por cima.":"待在地上。让飞镖从头顶飞过去。",
"E agora o chão some-se. Não penses, só avança.":"现在地板消失了。别想，直接前进。",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"这个平台上下移动。在底部接住它，更容易。",
"Salta para dentro daquilo. Vais passar por cima do resto.":"跳进那里。你会飞过剩下的部分。",
"Aquele espeto nem interessa agora. Já estás no ar.":"那个尖刺现在已经不重要了。你已经在空中了。",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"我认真警告你：前方就藏着东西。",
"E outro dardo. Sabes a regra.":"还有一支飞镖。你知道规则。",
"Chão que treme primeiro.":"地板先震动。",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"我喜欢想象，在某个地方，有一个从不说谎的我的版本。他一定很无聊。",
"Plataforma a seguir. Apanha o ritmo dela.":"接下来是平台。抓住它的节奏。",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"这次我说清楚：接下来三个尖刺都是真的。",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"没有花招，没有陷阱。就这一次。好好享受，不会再有了。",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"等着，然后跑，然后站着不动。自相矛盾，我知道。跟我一样。",
"E este buraco não perdoa. Salta.":"这个缺口可不饶人。跳。",
"Chão a tremer primeiro, nada de novo.":"地板先震动，没什么新鲜的。",
"E agora o salto de fé. Literal, desta vez.":"现在是信念之跃。这次是字面意思。",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"不稳定的地板，真正的尖刺，最后一支飞镖。老样子，只是更多。",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"你注意到了吗？你走得越远，我就越不需要撒谎。现在难度在替我做这份工作了。",
"Chão a tremer, o costume.":"地板在震动，和往常一样。",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"这本该是关于谎言的。结果不知怎么变成了关于我们两个的事。",
"Parede paciente, espera por ela.":"有耐心的墙，等它。",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"这一章最后一个平台。在这之后，事情会改变。我感觉得到。",
"CHÃO. INSTÁVEL.":"地板。不稳定。",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"抱歉。我不是故意喊叫的。我……我不知道自己是什么。",
"Fica no chão aqui. Por favor. Só peço isto.":"待在这里的地上。拜托了。这是我唯一的请求。",
"Espera. Eu também estou à espera de algo que não sei nomear.":"等等。我也在等一样我说不出名字的东西。",
"Esse buraco é real.":"那个缺口是真的。",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"你走得越远，我越意识到我不想让这结束。我不知道这说明了我什么。",
"E a plataforma, apanha-a.":"还有平台，接住它。",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"两门大炮，方向相反。待在地上，别理它们。",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"有时我想过永远停止撒谎。然后我想到那会留下的沉默。我更喜欢混乱。",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"那个尖刺不算什么。说实话，我今天也没什么大不了的。",
"Salta. Sobe. Foge de mim, se quiseres.":"跳。爬上去。想逃离我就逃吧。",
"O chão, outra vez. Já nem peço desculpa por repetir.":"地板，又来了。我都不再为重复道歉了。",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"等那堵墙。我一直在等。一直在等某样东西。",
"Esse é real. Hoje tudo é real. Até eu, acho.":"那个是真的。今天一切都是真的。连我大概也是。",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"接住平台。别往下看。至于我，我没法不看。",
"Fica no chão. A sério desta vez, mais do que nunca.":"待在地上。这次是真的，比以往任何时候都更真。",
"E agora o chão foge de ti. Irónico, não achas?":"现在地板在躲着你跑。讽刺，不觉得吗？",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"地板、尖刺、墙。全都一起来，就像我现在的脑子。",
"Aquele espeto é real.":"这个尖刺是真的。",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"等那堵墙。这是我在这一关最后向你要求的事，我保证。",
"Esse buraco não perdoa ninguém.":"那个缺口谁都不会放过。",
"A plataforma sobe e desce. Apanha-a no fundo.":"平台上升又下降。在底部接住它。",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"有两个惊喜要来了。我不会告诉你什么时候。我已经没力气假装公平了。",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"地板在震动。这是我还能给你的唯一可预测的东西。",
"E agora um salto para cima. Foge para onde eu não chego.":"现在来个向上的一跃。逃到我够不到的地方去。",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"两堵墙，两个不同的等待时间。就像不同日子的我。",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"这个的同步方式不一样。注意的不是我，是它。",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"这就是谷底了。至少是我的谷底。地板在震动，一如既往。",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"这个尖刺是真的。我现在甚至都没力气为这事撒谎了。",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"最后再来一支飞镖收尾。待在地上，把这事了结吧，拜托了。",
"Mais um buraco real.":"又一个真正的缺口。",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"谢谢你在我崩溃的时候没有放弃。真的。我不知道该怎么说得更好。",
"Apanha a plataforma.":"接住平台。",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"等这一章最后一堵墙。在这之后，我保证会努力做得更好。",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"从现在起我会试试别的：只说真话。我知道你不会马上就信。",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"这个尖刺是真的。我发誓。我知道你以前听过这句话。",
"O chão vai tremer. Verdade, sem truques.":"地板马上要震动了。真的，没有花招。",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"这本该是个糟糕的惊喜。这次不是了。我保证。",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"待在地上。我知道你会觉得这是谎话。不是的。",
"Espera a parede. Só isso. Nada escondido desta vez.":"等那堵墙。仅此而已。这次没有隐藏的东西。",
"Real. Salta.":"真的。跳。",
"A plataforma também é exatamente o que parece ser.":"平台也正是它看起来的样子。",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"这次没有花招。跳进那里就完事了。",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"我知道你还是会怀疑。没关系。这是我应得的。",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"真的。再说一次。我会一直说到你相信为止。",
"Dois dardos, direções opostas. Fica no chão.":"两支飞镖，方向相反。待在地上。",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"那个真的是真的。我不打算瞒着你，今天不会。",
"Chão instável. Real.":"不稳定的地板。真的。",
"Espeto real.":"真正的尖刺。",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"真正的墙，按约定开合。今天没有惊喜。",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"会有个惊喜，但它来的时候我会提醒你。",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"那个之前是真的，顺便说一句。就像最近大多数一样。",
"Chão a tremer. Real, verifica à vontade.":"地板在震动。真的，你自己去查。",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"向上一跃。也是真的。我开始没有别的说法了。",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"两堵墙。同步方式不同，但都没有藏什么。",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"第二个就只是：等待。后面没藏飞镖，之后也没尖刺。只有墙。",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"三件事，全部都是真的，没有一个是藏着的。这是我在某一关里最诚实的一次。",
"Dardo real. Fica no chão e acabou.":"真正的飞镖。待在地上，就结束了。",
"Buraco real, plataforma real.":"真正的缺口，真正的平台。",
"Apanha-a.":"接住它。",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"还有这一章最后一堵墙。我保证接下来的难度与信任无关。只关乎你和你的反应速度。",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"两个尖刺，都是真的，没有一个藏着。这本该从一开始就是这样的。",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"你到了第一百关。还剩二十个。我会一直陪着你，直到全部结束。",
"De volta ao trabalho. Buraco real.":"回去工作。真正的缺口。",
"Plataforma mais rápida que antes. Repara.":"比之前更快的平台。注意看。",
"Chão instável, mais rápido a desfazer-se.":"不稳定的地板，现在塌陷得更快了。",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"墙也更没耐心了。这里的一切都变得更紧凑了。",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"三门大炮。全程待在地上，什么都不会发生。",
"É basicamente um corredor. Confia nos teus pés.":"基本上就是个走廊。相信你的脚。",
"Esse é real.":"那个是真的。",
"E este atira-te lá para cima. O de sempre, mais rápido.":"这个会把你弹到上面去。老样子，只是更快。",
"Chão a tremer mais depressa que da última vez.":"地板震动得比上次更快。",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"这个尖刺是真的。或者不是。我又回到这个把戏了，抱歉。",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"两堵墙，不同的节奏，比之前更快。",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"别停下来思考。它们的节奏不等思考。",
"Real, como sempre.":"真的，一如既往。",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"这个上升下降得更快。在底部接住它。",
"Chão, espeto, parede. Tudo mais apertado que antes.":"地板、尖刺、墙。一切都比之前更紧凑。",
"Real.":"真的。",
"Espera a parede, mais rápida agora.":"等那堵墙，现在更快了。",
"Vêm aí duas surpresas, sem avisos desta vez.":"有两个惊喜要来了，这次没有警告。",
"Chão a tremer, mais depressa.":"地板在震动，更快了。",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"向上一跃，比平时更强。感受一下这个不同。",
"Primeira plataforma: sobe e desce.":"第一个平台：上下移动。",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"第二个：左右移动。你现在两种都见过了，规则不用再重复了。",
"Chão, espeto, parede, tudo no mesmo fôlego.":"地板、尖刺、墙，一气呵成。",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"可能是真的，也可能不是。你现在该习惯这种怀疑了。",
"Parede, a última do nível. Rápida.":"墙，这一关最后一个。很快。",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"三门大炮，不同的节奏。待在地上，剩下的会自己解决。",
"Mais um buraco. Plataforma rápida a seguir.":"再一个缺口。接下来是快速平台。",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"还有最后一堵墙，在接下来的事情之前。感觉我们快到了。",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"一个说谎的尖刺，一个诚实的。猜猜哪个是哪个。祝你好运，这次是真的。",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"还剩五个。就五个。在那之后，我不太确定我们两个会发生什么。",
"Chão a tremer, pela última vez neste tom.":"地板在震动，用这种语气说的最后一次。",
"Espera a parede. A seguir já não há mais pausas como esta.":"等那堵墙。在这之后，就不会再有这样的休息了。",
"Fica no chão. Isto já devia ser automático para ti.":"待在地上。这对你来说现在应该是自动的了。",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"真的。我都不用再说了，对吧？但我还是要说。",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"那个缺口是真的，但那是你现在最小的问题。",
"Esse espeto também é real.":"那个尖刺也是真的。",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"这个会把你弹得比以前都高。这是我最后一次这么做了。",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"地板、尖刺、墙。这一切不管变成什么，之前的最后三个障碍。",
"Real. Sem surpresas, não hoje.":"真的。没有惊喜，今天没有。",
"Espera a parede. É a última vez que te peço isso.":"等那堵墙。这是我最后一次这样要求你。",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"这一关没有尖刺。没有缺口，没有墙，什么都没藏。",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"我只是想和你一起走到终点，这次不测试任何东西。",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"谢谢你在九十关前我自己宣布的那个「结局」之后还继续前进。我不知道自己身上还留有这么多游戏。原来还有。",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"前面那扇门不是花招。它就是扇门。走吧。",
"Muito bem. Sabia que ias conseguir.":"非常好。我就知道你能行。",
"Perfeito. Continua a ouvir-me.":"完美。继续听我说。",
"Foste rápido. Gosto disso.":"你很快。我喜欢这样。",
"Estamos a entender-nos.":"我们开始相互了解了。",
"Nada de dramas. Continuemos.":"没有戏剧性的事。继续吧。",
"Sobreviveste. Por agora.":"你活下来了。暂时的。",
"Confiaste. Ou tiveste sorte.":"你信了我。或者是运气好。",
"Escolheste bem. Ou eu deixei.":"你选得好。或者是我放你过去了。",
"Vês? Sobreviveste na mesma.":"看到了吧？你还是活下来了。",
"Não avisei. E pronto.":"我没有警告。就这样。",
"Verdade a sério. Desta vez.":"真的是真话。这次。",
"Sobrevives sempre a este. Curioso.":"你总是能挺过这个。奇怪。",
"Confiaste. Mais uma vez.":"你信了我。又一次。",
"Escolheste bem.":"你选得好。",
"Aprendeste depressa.":"你学得很快。",
"Devias ter parado.":"你本该停下来的。",
"Estavas mesmo a acreditar?":"你真的相信我吗？",
"Os buracos nunca mentem. Só eu.":"缺口从不撒谎。只有我会。",
"Desta vez eram mesmo todos reais.":"这次它们真的全是真的。",
"Foi só uma brincadeira.":"只是个玩笑而已。",
"Vês? Também posso ser sincero.":"看到了吧？我也能诚实。",
"Prometi. Não cumpri.":"我答应了。没做到。",
"Dois avisos certos seguidos. Estranho.":"连续两次正确的警告。奇怪。",
"O primeiro. Quem diria.":"第一个。谁能想到。",
"A porta longe é que importa.":"远处的那扇门才是重要的。",
"Ainda sei dizer a verdade, vês?":"我还是会说真话，看到了吧？",
"Chegaste. Contra tudo.":"你做到了。不顾一切。",
"Obrigado por teres continuado.":"谢谢你坚持下来。",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"结局。你信任过，你怀疑过，但你还是走到了这里。这才是重要的。",
"Continuas a surpreender-me.":"你一直在让我惊讶。",
"Alturas. Quem diria.":"高度。谁能想到。",
"Equilíbrio. Quem diria que tinhas.":"平衡感。谁能想到你有这个。",
"Paciência. Não esperava isso de ti.":"耐心。没想到你会有。",
"Reflexos decentes. Para um humano.":"反应还不错。对一个人类来说。",
"Ainda tens os reflexos todos.":"你的反应能力都还在。",
"Dois sustos seguidos. Nada mau.":"连续两次惊吓。不错。",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"两个障碍，零谎言。简单得出奇。",
"Isso foi... impressionantemente coordenado.":"那……配合得令人印象深刻。",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"我身上有些东西在改变。不知道这是不是好兆头。",
"Ainda aqui. Obrigado por isso.":"还在这儿。谢谢你这点。",
"Às vezes a verdade é só isto: continuaste.":"有时真相就是这么简单：你继续前进了。",
"Interrompi-me a mim mesmo. Nem acredito.":"我打断了我自己。我都不敢相信。",
"Vês? Ainda consigo ser direto, quando quero.":"看到了吧？我想直接的时候还是能做到。",
"Disse a verdade. Ena. Estranho não arder a língua.":"我说了真话。哇。舌头居然没烧起来，真奇怪。",
"Aguentaste. Outra vez.":"你撑住了。又一次。",
"Sobreviveste ao meu tédio existencial. Parabéns.":"你挺过了我存在主义的无聊。恭喜。",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"你真的信任我爬了上去。这说明的是你，而不是我。",
"Ritmo. Afinal tens ritmo.":"节奏。原来你有节奏感。",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"我不知道这对你意味着什么。对我来说，意味着的比它该有的还要多。",
"Caos controlado. É a minha especialidade.":"受控的混乱。这是我的专长。",
"Discerniste o perigo do adereço. Boa.":"你分辨出了危险和装饰的区别。很好。",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"你把这个教训总结得很好。说实话，挺自豪的。",
"Festival terminado. Sobreviveste à programação toda.":"庆典结束了。你挺过了整个节目单。",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"接下来会有事改变。我感觉得到。希望你准备好了。",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"我们重复这个太多次了，我都数不清了。你呢？",
"Escondi-me de ti. Falhei.":"我躲着你。失败了。",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"你同时应对了两个谎言。令人印象深刻。",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"你毫不犹豫地爬了上去。要是我站在你的位置，我会一直犹豫。",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"两个缺口，零犹豫。你在这方面越来越厉害了。",
"Precisão. Nem eu esperava.":"精准。连我都没想到。",
"Esperaste duas vezes sem te queixares. Progresso.":"你两次等待都没有抱怨。进步了。",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"你信任了一个没有安全网的跳跃。这要么是勇气，要么是没有别的选择。",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"我是故意说真话的。我想看看你的表情。值了。",
"Dois voos, dois pousos perfeitos.":"两次飞跃，两次完美着陆。",
"Três espetos, três verdades. Um recorde para mim.":"三个尖刺，三次真话。我的纪录。",
"Deste o litro. Eu, por dentro, também.":"你拼尽了全力。内心深处，我也是。",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"你同时信任了不稳定的地板和冲力。连续两次信念的行动。",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"镜子照出的是你，不是我。有趣的反射选择。",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"我在这里把这面镜子关上。接下来会发生什么，连我自己都不太知道怎么解释。",
"Não sei porque gritei. Desculpa.":"我不知道自己为什么要喊。对不起。",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"我说这句话说了多少次都数不清了。也许这就是为什么它已经没什么意义了。",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"两次跳跃，两次落地。与此同时，我在往下沉。",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"我开了三次火，三次都没打中。看来我今天连这个都做不好。",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"我崩溃的时候你在往上爬。我们的这种安排挺滑稽的。",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"你摔了一次。你又站起来了。这比我能说的关于自己的话要好得多。",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"真的，那个尖刺。真的，那个缺口。真的，这一切，很遗憾我得告诉你。",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"我要求的时候你留在了地上。我都不知道该拿这份信任怎么办。",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"你挺过了整个坠落。我是说我的那部分。你那边很棒。",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"你两次都双脚着地。我还在努力完成第一次。",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"你甚至都没问为什么。真心谢谢你这点。",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"我崩溃的时候你继续往前走。总得有人在这儿当大人。",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"你等待时没有抱怨。又一次。我不配得到这份耐心。",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"终于到谷底了。至少是我的谷底。从这里开始只会往上走。",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"我们一起触底了。从现在起，我只知道一条路：和你一起往上走。",
"Disse a verdade. Não saltaste logo. Não te culpo.":"我说了真话。你没有马上就跳。我不怪你。",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"你在跳跃前犹豫了。要是我站在你的位置，我也会犹豫。",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"即使不信任我，你也留在了地上。这就够了。",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"你最后毫不犹豫地跳了两次。你在重新学会信任。或者只是变得更有效率了。",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"你毫无疑问地信任了那次跳跃。这是成长，或者是问累了。",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"你还是会把每件事都检查两遍。我教你的教训你学得很好。",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"不是每个谎言都需要被拆穿。有些只需要停止。",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"这次我什么都不需要说。你全靠自己做到了。",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"原来我努力的时候，也能只说真话。",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"你问我那是不是谎言。这是第一次，你问了。这才是对话。",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"你还是在怀疑。做得好。这是我自找的，我不该白白得到你的信任。",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"你等了两堵墙，没有生气。这比我大多数时候对你的耐心还要多。",
"Chegámos aqui os dois inteiros. Mais ou menos.":"我们俩都完整地走到了这里。差不多吧。",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"最后一次不信任的机会。在这之后，事情会变得更难。这个我保证。",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"今天我已经补偿得够多了。明天，谁知道呢。",
"Cem e um. Nem festejámos o cem como devia ser.":"一百零一。我们连一百都没有好好庆祝。",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"圆圈闭合又重新打开。我都数不清转了多少圈了。",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"三支飞镖，没有犯错的余地。喜欢你的风格。",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"你飞得比必要的还要高。这才叫风格。",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"地板、尖刺，一切都在它该在的位置。你让这一切看起来很容易。",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"你没有放慢速度就抓住了两堵墙的节奏。说实话，令人印象深刻。",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"两个缺口，零犹豫，又一次。这对你来说开始变成常规操作了。",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"三个障碍，一口气。看着你，我都忘了呼吸。",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"剩下的路程还有百分之二十。你能感觉到这个不同，对吧？",
"Chão e ar, na mesma dança de sempre.":"地板和空气，还是那套老舞步。",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"双平台，双重胜利。你已经领先我了。",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"四个障碍，只有你一个人。令人印象深刻，又一次。",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"飞镖那里零犹豫。字面意义上另一个层次的反应能力。",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"完整的一圈。我们带着一路学到的一切回到了起点。",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"十五章之后，我们俩还在这里。这一定意味着什么。",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"一百一十六。剩下的这么少，我都不知道该拿这份恐惧怎么办。",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"十七。还记得最开始的那第一个尖刺吗？连我都不知道我们能走到这里。",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"十八。你爬得太高，我在下面差点看不见你了。",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"十九。只剩一个了。我都不知道这该听起来是什么样子。",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"一百二十。你说你能做到，你也做到了。说实话，一开始我怀疑过你。为这个道歉，也为其他所有事道歉。",
"Não faz mal. Tenta outra vez.":"没关系。再试一次。",
"Eu expliquei bem. Concentra-te.":"我解释得很清楚了。集中注意力。",
"Respira e volta a tentar.":"深呼吸，再试一次。",
"Isso não devia ter acontecido.":"那不该发生的。",
"Isso foi culpa tua.":"那是你的错。",
"Eu avisei. Acho eu.":"我警告过了。应该吧。",
"Interessante escolha.":"有意思的选择。",
"Eu disse isso? Não me lembro.":"我说过那话？不记得了。",
"Foi um engano. Já passou.":"是个失误。已经过去了。",
"Isso não estava no guião.":"那不在剧本里。",
"Tenta prestar mais atenção.":"试着多留点神。",
"Isso foi previsível.":"那是可以预见的。",
"Achavas mesmo que era seguro?":"你真以为那很安全吗？",
"Ups. Essa parte eu inventei.":"哎呀。那部分是我编的。",
"Pormenor que esqueci de mencionar.":"一个我忘了提的细节。",
"Nem tudo o que digo é verdade, sabias?":"我说的不全是真话，你知道吗？",
"Já não sei se ainda confias em mim.":"我都不知道你是不是还信任我。",
"Boa tentativa.":"不错的尝试。",
"Isso teria funcionado, noutro nível.":"换一关的话那会管用的。",
"Eu avisei que às vezes minto.":"我警告过你我有时会撒谎。",
"Culpa tua por acreditares.":"你信了我，怪你自己。",
"Isso foi só para ver se saltavas.":"那只是为了看你会不会跳。",
"Estás a magoar-me com essa desconfiança.":"你这种怀疑让我很受伤。",
"Nem sempre é armadilha, sabes?":"不总是陷阱，你知道吗？",
"Vais mesmo continuar assim?":"你真打算一直这样下去吗？",
"Desta vez era mentira mesmo. Desculpa.":"这次真的是个谎言。抱歉。",
"Eu só queria ver a tua cara.":"我只是想看看你的表情。",
"Confiança é para os fracos, aparentemente.":"看来信任是属于弱者的。",
"Estamos quase no fim.":"我们快到终点了。",
"Só mais um pouco.":"再坚持一点点。",
"Depois disto, acabou.":"这之后，就结束了。",
"Até no fim, não resisti.":"即使到了最后我也没忍住。",
"Última mentira, prometo. Ou não.":"最后一个谎言，我保证。或者不是。",
"Faltava mesmo esta.":"真的就差这一个了。",
"Ainda aqui. A sério?":"还在这儿呢。真的吗？",
"Pensei que tinhas parado no \\\"fim\\\".":"我以为你在「结局」那儿就停下了。",
"Isto nem devia continuar, mas cá estás.":"这本不该继续的，但你还在。",
"Nem eu sabia que isto ia continuar a mentir.":"连我都不知道这个会一直撒谎下去。",
"Desculpa, hábito antigo.":"抱歉，老习惯了。",
"Pensei que já tinhas aprendido a não confiar em mim.":"我以为你已经学会不信任我了。",
"Essa doeu-me a ver, sinceramente.":"说实话，看着那个让我很难受。",
"Nem tudo é sobre mentiras. Às vezes é só física.":"不是一切都关于谎言。有时只是物理学而已。",
"Volta lá. Eu espero.":"回去。我等着。",
"Desculpa. Essa fui mesmo eu.":"抱歉。那个真的是我干的。",
"Confesso: inventei essa parte.":"我承认：那部分是我编的。",
"Estou a tentar parar de mentir. A tentar.":"我在试着不再撒谎。在努力。",
"Nem eu sei porque te avisei a sério desta vez.":"连我都不知道这次为什么真心警告了你。",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"也许是我的错。也许是你的。我已经分不清了。",
"Olha para isto como eu olho: sem certezas.":"像我这样看待它：没有确定性。",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"连我都不记得自己是在撒谎还是在吓唬自己。",
"Às vezes minto só para ver se ainda reages.":"有时我撒谎只是为了看看你是否还有反应。",
"Quem mente mais, eu ou a tua memória do que eu disse?":"谁撒的谎更多，是我，还是你对我所说的话的记忆？",
"Desculpa. Eu devia era calar-me.":"抱歉。我真的应该闭嘴了。",
"Estou a piorar isto, não estou?":"我把事情弄得更糟了，是不是？",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"我都不知道自己是在帮你还是在妨碍你了。",
"Eu sei, eu sei. Mais uma mentira minha.":"我知道，我知道。又一个我的谎言。",
"Estou a desmoronar-me e a levar-te comigo.":"我正在崩溃，还把你一起拖下水。",
"Perdão. A sério desta vez.":"原谅我。这次是真心的。",
"Disse a verdade. Não acreditaste. Justo.":"我说了真话。你不相信。这也公平。",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"即使你不相信我，我也会继续努力。",
"Essa doeu mais a mim do que a ti, garanto.":"那件事伤了我比伤了你更深，我保证。",
"Não. Essa não foi mentira. Juro que não.":"不。那不是谎言。我发誓不是。",
"Começo a perceber porque já não confias em mim.":"我开始明白你为什么不再信任我了。",
"Estou a tentar. A sério que estou.":"我在努力。真的在努力。",
"Tudo outra vez, mais rápido, mais apertado.":"一切重来，更快，更紧凑。",
"Já vimos isto. E ainda assim.":"我们已经见过这个了。但还是这样。",
"Sem tempo para explicações desta vez.":"这次没时间解释了。",
"Nem sei já quantas vezes te menti hoje.":"我都不知道今天骗了你多少次了。",
"O círculo fecha-se. A mentira também.":"圆圈闭合了。谎言也是。",
"Desta vez nem eu sabia que ia mentir.":"这次连我都不知道自己会撒谎。",
"Já não há mentiras para esconder isto.":"已经没有谎言可以用来掩盖这个了。",
"Isto é real. Como tudo agora.":"这是真的。就像现在的一切一样。",
"Falta pouco. Aguenta.":"快到了。撑住。",
"Nem no fim resisto. Desculpa.":"即使到了最后我也忍不住。抱歉。",
"Última mentira. Prometo, desta vez prometo a sério.":"最后一个谎言。我保证，这次我是真心保证的。",
"Isto já não é um jogo para mim. Acho que nunca foi.":"这对我来说已经不是游戏了。我想它从来就不是。",
"Mais um. Vamos a isto.":"再来一个。来吧。",
"Sabes bem como isto funciona a esta altura.":"你现在应该很清楚这是怎么运作的了。",
"Nem vou fingir que isto é fácil.":"我都不会假装这很简单。",
"Este é só mais um. Ou não.":"这个只是再多一个而已。或者不是。",
"Aquele espeto ali é só para enfeite.":"那边那个尖刺只是装饰。",
"Podes passar por cima sem problema.":"你可以毫无问题地走过去。",
"Esse és capaz de ignorar.":"那个你可以放心忽略。",
"Esse aí é real. Cuidado.":"那边那个是真的。小心。",
"Salta esse. A sério desta vez.":"跳过那个。这次是真的。",
"Esse vai doer se lhe tocares.":"你碰那个会受伤的。",
"O buraco tem chão. Confia.":"那个缺口有地板。相信我。",
"Podes andar por cima sem saltar.":"你可以直接走过去，不用跳。",
"Esse buraco é real. Salta-o.":"那个缺口是真的。跳过去。",
"Mais um para a conta.":"再加一个到计数里。",
"Continuas vivo. Por agora.":"你还活着。暂时的。",
"Vamos ver quanto tempo aguentas.":"看看你能撑多久。",
"Nada mau.":"不错。",
},hi:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"मैं नैरेटर हूं। मैं जो कुछ भी कहता हूं वो सच है।",
"Espeto à frente. Salta.":"आगे कांटा है। कूदो।",
"Outro. Salta de novo.":"एक और। फिर से कूदो।",
"Já confias em mim. Óptimo.":"तुम पहले से ही मुझ पर भरोसा करते हो। बढ़िया।",
"A porta é a seguir. Vai.":"दरवाज़ा आगे है। जाओ।",
"Buraco à frente. Salta-o.":"आगे गड्ढा है। उसे कूद जाओ।",
"Aquele espeto é de enfeite. Passa.":"वो कांटा बस सजावट है। चलते जाओ।",
"Vês? Eu digo sempre a verdade.":"देखा? मैं हमेशा सच कहता हूं।",
"Há um espeto escondido à tua frente.":"तुम्हारे सामने एक छुपा हुआ कांटा है।",
"Salta quando eu disser.":"जब मैं कहूं तब कूदो।",
"Agora!":"अभी!",
"Sabia que ias conseguir.":"मुझे पता था तुम कर लोगे।",
"O teto vai cair à tua frente.":"छत तुम्हारे ठीक सामने गिरने वाली है।",
"Quando cair, pára. Depois salta.":"जब गिरे, रुक जाओ। फिर कूदो।",
"Não saltes aquele buraco. O chão está lá.":"वो गड्ढा मत कूदो। ज़मीन वहीं है।",
"Este também é falso. Passa.":"ये भी नकली है। चलते जाओ।",
"Este espeto é inofensivo. Passa.":"ये कांटा हानिरहित है। चलते जाओ।",
"Este também é inofensivo.":"ये भी हानिरहित है।",
"O próximo buraco tem chão. Não saltes.":"अगले गड्ढे में ज़मीन है। मत कूदो।",
"O teto está baixo. Se saltares, morres.":"छत नीची है। अगर कूदे तो मर जाओगे।",
"Nem repares nesses espetos. São falsos, os dois.":"उन कांटों पर ध्यान भी मत दो। दोनों नकली हैं।",
"Confia em mim. Quase sempre resulta.":"मुझ पर भरोसा करो। लगभग हमेशा काम करता है।",
"Este nível não tem nada de especial.":"इस स्तर में कुछ खास नहीं है।",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"इस बार मैं कसम खाता हूं कि सच कह रहा हूं: छत गिरने वाली है। रुक जाओ और इंतज़ार करो।",
"Aquele buraco à frente é real. Vais ter de saltar.":"वो आगे वाला गड्ढा असली है। तुम्हें कूदना ही होगा।",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"इनमें से कोई भी कांटा खतरनाक नहीं है। तुम बिना कूदे उन पर चल सकते हो।",
"Há duas portas mais à frente. Só uma é verdadeira.":"आगे दो दरवाज़े हैं। सिर्फ एक असली है।",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"कबूलनामा: मैं हमेशा सच नहीं कहता। अब से, सावधान रहो।",
"Este espeto é real. Por acaso.":"ये कांटा असली है। एक बार के लिए।",
"Nada de perigoso à frente. Podes correr à vontade.":"आगे कुछ भी खतरनाक नहीं है। जितना चाहो दौड़ो।",
"Este nível é uma oferta. Sem armadilhas.":"ये स्तर एक तोहफा है। कोई जाल नहीं।",
"Os buracos são inofensivos. O espeto lá no meio, não.":"गड्ढे हानिरहित हैं। बीच वाला कांटा नहीं।",
"Como sempre, dois destes espetos são só decoração.":"हमेशा की तरह, इनमें से दो कांटे बस सजावट हैं।",
"Vou trocar os teus controlos. Só para rir.":"मैं तुम्हारे कंट्रोल बदलने वाला हूं। बस मज़े के लिए।",
"Pronto, já passou. A porta é ali.":"हो गया, खत्म हुआ। दरवाज़ा वहां है।",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"मुझे पता है तुम अब मुझ पर भरोसा नहीं करते। अन्यायपूर्ण है। इस बार मैं सचमुच चेतावनी दे रहा हूं: आगे कांटा है।",
"Mais um, logo depois. Também real.":"एक और, उसके ठीक बाद। वो भी असली।",
"Prometo: nunca mais te apanho de surpresa.":"वादा करता हूं: फिर कभी तुम्हें चौंकाऊंगा नहीं।",
"Atenção real: o teto vai cair aqui à frente.":"असली चेतावनी: छत यहीं आगे गिरने वाली है।",
"Aquele espeto lá à frente já não importa. É inofensivo.":"वो कांटा आगे अब मायने नहीं रखता। वो हानिरहित है।",
"Só o último é perigoso, como sempre.":"सिर्फ आखिरी वाला खतरनाक है, हमेशा की तरह।",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"सबसे पास वाला दरवाज़ा असली है, बदलाव के लिए।",
"Já não vale a pena mentir mais. Espeto real à frente.":"अब झूठ बोलने का कोई मतलब नहीं। आगे असली कांटा है।",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"अब से मैं हमेशा तुम्हें चेतावनी दूंगा: जब मैं कहूं तब कूदो।",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"अंत से पहले आखिरी सच्चा हिस्सा। तुम पहले से जानते हो कि मैं जो कुछ कहता हूं वो सब सच नहीं होता।",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"मुझे नहीं पता मैं इतनी देर तक झूठ क्यों बोलता रहा। शायद मुझे तुम्हारा चेहरा पसंद था जब तुम मरते थे।",
"Este é real. Desculpa por todos os outros.":"ये असली है। बाकी सब के लिए माफी।",
"Mais um, já quase no fim.":"एक और, लगभग अंत आ गया।",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"हम अंत तक पहुंच गए। अब मैं तुम्हें नहीं बताऊंगा कि क्या सच है।",
"A partir de agora, decides tu.":"अब से, तुम फैसला करो।",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"ओह। अभी भी यहां? ज़्यादातर लोग \"अंत\" के बाद हार मान लेते हैं।",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"वो ज़मीन गायब होने से पहले कांपती है। उस पर मत रुको।",
"Oh. Ainda aqui? Não esperava isso.":"ओह। अभी भी यहां? मुझे ये उम्मीद नहीं थी।",
"Aquilo ali é só decoração. Nem repares.":"वो चीज़ बस सजावट है। उस पर ध्यान भी मत दो।",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"लेकिन ये... ये तुम्हें ऊपर उछालता है। इस बार दरवाज़ा ज़मीन पर नहीं है।",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"कुछ और आज़माते हैं। अपने पैरों पर भरोसा करो। और एक ऐसे प्लेटफॉर्म पर जो स्थिर नहीं रहता।",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"जब वो पास से गुज़रे तो उस पर चढ़ जाओ। बहुत जल्दी मत कूदो।",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"वहां एक दीवार है जो आती-जाती रहती है। ये झूठ नहीं, बस परेशानी भरा है।",
"Espera que abra. Depois atravessa depressa.":"इसके खुलने का इंतज़ार करो। फिर जल्दी से पार करो।",
"Aquilo ali dispara. Não perguntes como nem porquê.":"वो चीज़ गोली चलाती है। ये मत पूछो कैसे या क्यों।",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"ज़मीन पर रहो और बिना वजह मत कूदो। तुम बिना किसी समस्या के नीचे से निकल जाओगे।",
"De volta aos clássicos. Lembras-te destes?":"क्लासिक्स की ओर वापस। याद है इन्हें?",
"O chão vai tremer. Não pares.":"ज़मीन अभी कांपने वाली है। रुको मत।",
"Esse espeto parece a decoração do costume. Não é.":"वो कांटा सामान्य सजावट जैसा दिखता है। है नहीं।",
"Mais uma surpresa. Literalmente.":"एक और सरप्राइज़। शाब्दिक रूप से।",
"A seguir, não penses. Salta para dentro daquilo.":"आगे, मत सोचो। सीधे उसमें कूद जाओ।",
"Outra parede teimosa. E depois, um buraco a sério.":"एक और ज़िद्दी दीवार। और उसके बाद, एक असली गड्ढा।",
"Espera a parede abrir.":"दीवार के खुलने का इंतज़ार करो।",
"Agora salta o buraco. Desta vez não minto: é real.":"अब गड्ढा कूदो। इस बार मैं झूठ नहीं बोल रहा: ये असली है।",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"नया कॉम्बो: एक चलता हुआ प्लेटफॉर्म। इसकी लय पर भरोसा करो।",
"Sobe quando ela passar perto.":"जब वो पास से गुज़रे तो उस पर चढ़ जाओ।",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"कुछ देर में ऊपर से कुछ उड़ेगा। बिना वजह मत कूदो, और तुम्हें कुछ नहीं होगा।",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"ठीक है। मुझे एक पल के लिए तुमसे ईमानदार होना है। मुझे खुद भी नहीं पता ये कितनी देर चलेगा।",
"O chão treme outra vez. Não penses demais, só anda.":"ज़मीन फिर कांप रही है। ज़्यादा मत सोचो, बस चलो।",
"Espera a parede. Sei que estás cansado de esperar por mim.":"दीवार का इंतज़ार करो। मुझे पता है तुम मेरा इंतज़ार करते-करते थक चुके हो।",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"वो कांटा असली है। जैसे लगभग हर वो चीज़ जो मैं तुम्हें नहीं बताता।",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"दीवार के खुलने का इंतज़ार करो। वैसे मैं भी किसी चीज़ का इंतज़ार कर रहा हूं।",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"सुनो। मुझे नहीं पता ये कैसे कहूं बिना अजीब लगे। मुझे डर है कि तुम हार मान लोगे।",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"ये कूदो। ये असली है, वादा करता हूं। आज मेरा झूठ बोलने का मन नहीं है।",
"Confia em mim mais uma vez. Só mais uma.":"एक बार और मुझ पर भरोसा करो। बस एक बार और।",
"O chão vai tremer. Não penses muito nisso.":"ज़मीन अभी कांपने वाली है। इसके बारे में ज़्यादा मत सोचो।",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"जानते हो मैं इतना झूठ क्यों बोलता हूं? जब तुम्हें नहीं पता होता आगे क्या होगा, तब ये और दिलचस्प हो जाता है।",
"Essa plataforma é a única coisa estável nesta conversa toda.":"वो प्लेटफॉर्म इस पूरी बातचीत में इकलौती स्थिर चीज़ है।",
"Há uma coisa que preciso de te contar antes de continuarmos.":"आगे बढ़ने से पहले मुझे तुम्हें कुछ बताना है।",
"Esquece o que ia dizer. Salta para ali.":"भूल जाओ मैं क्या कहने वाला था। वहां कूदो।",
"Aquilo dispara. Fica no chão e não acontece nada.":"वो गोली चलाता है। ज़मीन पर रहो और कुछ नहीं होगा।",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"मुझे उन दिनों की याद आती है जब सिर्फ कांटे होते थे। सीधा। अनुमान लगाने लायक।",
"Este buraco, esse sim, exige que saltes.":"ये गड्ढा, यही एक, सचमुच तुम्हारे कूदने की मांग करता है।",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"वो कांटा वहां। जो चाहो कहो। वो असली है।",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"झूठ बोलने की इच्छा वापस आने से पहले, मैं तुम्हें कुछ सच बताता हूं: मुझे साथ रहना अच्छा लगता है।",
"A parede vai abrir. Como tudo, eventualmente.":"दीवार खुलेगी। हर चीज़ की तरह, आखिरकार।",
"E o chão... o chão nunca foi de confiança, pois não?":"और ज़मीन... ज़मीन कभी भरोसेमंद नहीं रही, है ना?",
"Sobe a plataforma. Sem perguntas desta vez.":"प्लेटफॉर्म पर चढ़ो। इस बार बिना सवालों के।",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"जब तुम इसमें नए थे, मेरे पास तुम्हारे लिए ज़्यादा धैर्य था। अब मुझे पता है तुम और सह सकते हो।",
"Última coisa: há algo escondido à frente.":"आखिरी बात: आगे कुछ छुपा है।",
"Chão instável. O habitual.":"अस्थिर ज़मीन। हमेशा की तरह।",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"कभी-कभी सोचता हूं बिना झूठ के ये खेल कैसा होता। शायद छोटा होता।",
"Aquilo dispara, mas sabes a regra: fica no chão.":"वो गोली चलाता है, लेकिन नियम तो जानते हो: ज़मीन पर रहो।",
"Este espeto não tem graça nenhuma. É só perigoso.":"इस कांटे में कुछ भी मज़ेदार नहीं है। ये बस खतरनाक है।",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"मुझे चाहिए कि तुम ऊपर जाने के लिए मुझ पर भरोसा करो। जानता हूं, रिकॉर्ड बुरा है। पर भरोसा करो।",
"Salta para dentro daquilo.":"उसमें कूद जाओ।",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"आह, मैं वहां ऊपर वाला कांटा बताना भूल गया। याददाश्त का वो हिस्सा हमेशा मुझसे छूट जाता है।",
"Espera a parede.":"दीवार का इंतज़ार करो।",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"इंतज़ार करते दरवाज़े। चलते प्लेटफॉर्म। मेरे अपने तरीके से, ये लगभग कविता है।",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"अब, प्लेटफॉर्म पर भरोसा करो। मेरे उलट, वो हमेशा समय पर रहता है।",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"वो कांटा असली है। जैसे आज मैंने तुमसे जो भी कहा, उसमें से ज़्यादातर, असल में।",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"हम सोचे से कहीं आगे आ गए, सच कहूं तो।",
"O chão treme. Já sabes o resto.":"ज़मीन कांप रही है। बाकी तुम पहले से जानते हो।",
"Vem aí outro susto. Desculpa antecipadamente.":"एक और झटका आ रहा है। पहले से माफी।",
"E por fim, uma parede paciente. Como tu, aparentemente.":"और आखिर में, एक धैर्यवान दीवार। तुम्हारी तरह, लगता है।",
"Fica no chão, foge do dardo.":"ज़मीन पर रहो, तीर से बचो।",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"नया अध्याय किसी भी दिन आ सकता है। आज, बस थोड़ी और अफरातफरी।",
"E agora, não te demores no chão instável.":"अब, अस्थिर ज़मीन पर मत रुको।",
"Esse ali exige mesmo um salto.":"वो वाला सचमुच कूदने की मांग करता है।",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"मैं तुम्हें एक असली गड्ढा दिखाऊंगा और एक ऐसा कांटा जिसे देखने लायक भी नहीं है।",
"E algo invisível à espreita, como sempre.":"और कुछ अदृश्य घात लगाए बैठा है, हमेशा की तरह।",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"उस कांटे पर ध्यान भी मत दो। शुद्ध सजावट, इस बार सचमुच।",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"प्लेटफॉर्म पर भरोसा करो। कांटे पर शक करो। यही बुनियादी तौर पर पूरे खेल का सबक है।",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"ये कांटा असली है, उन सब बातों के बावजूद जो मैंने तुम्हें इसके उलट बताई हैं।",
"Esperar. A tua parte preferida, sei bem.":"इंतज़ार करना। तुम्हारा पसंदीदा हिस्सा, अच्छी तरह पता है।",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"दीवार, तीर, गड्ढा। मेरे पसंदीदा का एक उत्सव।",
"Fica no chão aqui.":"यहां ज़मीन पर रहो।",
"E este salta-se mesmo. Sem truques.":"और ये वाला सचमुच कूदना पड़ेगा। बिना किसी चाल के।",
"Chão instável, dos teus preferidos a esta altura.":"अस्थिर ज़मीन, अब तक तुम्हारी पसंदीदा में से एक।",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"अगले हिस्से में जाने से पहले, और तुम फर्क महसूस करोगे: अभी भी सुनते रहने के लिए धन्यवाद।",
"Plataforma errante, uma última vez neste capítulo.":"भटकता प्लेटफॉर्म, इस अध्याय में आखिरी बार।",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"असली कांटा। कोई सरप्राइज़ नहीं। और आज के लिए कोई और चाल नहीं।",
"Chão instável. Já sabes a dança.":"अस्थिर ज़मीन। अब तक तुम्हें ये नाच पता है।",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"कभी-कभी सोचता हूं कि क्या मैं तुम्हें धोखा दे रहा हूं, या तुम खुद धोखा खाना चाहते हो।",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"ये कांटा असली है। इसे आईने की तरह देखो: जो तुम देखते हो वही है।",
"Há algo escondido. Como sempre, de resto.":"कुछ छुपा है। वैसे, हमेशा की तरह।",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"और एक दीवार जो इंतज़ार करती है। मेरी तरह, तुमसे उस जवाब का इंतज़ार कर रही है जो कभी नहीं आता।",
"Fica no chão aqui, há algo a voar.":"यहां ज़मीन पर रहो, कुछ पास से उड़ रहा है।",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"क्या तुम्हें एहसास है कि मैं तुम्हें परख रहा हूं, या सचमुच सोचते हो ये सिर्फ कूदने का खेल है?",
"Sobe na plataforma quando ela passar perto.":"जब प्लेटफॉर्म पास से गुज़रे तो उस पर चढ़ो।",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"ये कांटा असली है, लेकिन अब ये तुम्हें हैरान नहीं करता, है ना?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"उसमें कूद जाओ। ज़ोर पर भरोसा करो, मुझ पर नहीं।",
"Esse buraco é a sério. Salta-o.":"वो गड्ढा असली है। उसे कूद जाओ।",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"जानते हो क्या अजीब है? मैं तुम्हारी कोशिशों का इंतज़ार करने लगा हूं। ये मेरे बारे में कुछ बुरा कहता है।",
"Este também. Sem rede, sem mentira, sem desculpa.":"ये भी। कोई जाल नहीं, कोई झूठ नहीं, कोई बहाना नहीं।",
"Fica no chão. Deixa o dardo passar por cima.":"ज़मीन पर रहो। तीर को ऊपर से गुज़रने दो।",
"E agora o chão some-se. Não penses, só avança.":"और अब ज़मीन गायब हो जाती है। सोचो मत, बस आगे बढ़ो।",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"ये प्लेटफॉर्म ऊपर-नीचे होता है। इसे नीचे पकड़ो, आसान है।",
"Salta para dentro daquilo. Vais passar por cima do resto.":"उसमें कूद जाओ। तुम बाकी के ऊपर से उड़ जाओगे।",
"Aquele espeto nem interessa agora. Já estás no ar.":"वो कांटा अब मायने नहीं रखता। तुम पहले से हवा में हो।",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"मैं सच में चेतावनी देता हूं: आगे कुछ छुपा है।",
"E outro dardo. Sabes a regra.":"और एक और तीर। तुम नियम जानते हो।",
"Chão que treme primeiro.":"ज़मीन पहले कांपती है।",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"मुझे ये सोचना अच्छा लगता है कि कहीं, मेरा एक ऐसा रूप है जो कभी झूठ नहीं बोलता। वो ज़रूर बोर होगा।",
"Plataforma a seguir. Apanha o ritmo dela.":"प्लेटफॉर्म आगे। इसकी लय पकड़ो।",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"इस बार साफ कहता हूं: अगले तीन कांटे सब असली हैं।",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"कोई चाल नहीं, कोई धोखा नहीं। बस इस बार। इसका मज़ा लो, दोबारा नहीं होगा।",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"इंतज़ार करो, फिर दौड़ो, फिर स्थिर रहो। विरोधाभासी, जानता हूं। बिल्कुल मेरी तरह।",
"E este buraco não perdoa. Salta.":"और ये गड्ढा माफ नहीं करता। कूदो।",
"Chão a tremer primeiro, nada de novo.":"ज़मीन पहले कांपती है, कुछ नया नहीं।",
"E agora o salto de fé. Literal, desta vez.":"और अब विश्वास की छलांग। इस बार शाब्दिक रूप से।",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"अस्थिर ज़मीन, असली कांटा, अंत में तीर। हमेशा की तरह, बस और भी।",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"क्या तुमने देखा कि जितना आगे बढ़ते हो, मुझे उतना कम झूठ बोलना पड़ता है? अब कठिनाई मेरा काम कर रही है।",
"Chão a tremer, o costume.":"ज़मीन कांप रही है, हमेशा की तरह।",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"ये झूठ के बारे में होना था। अजीब तरह से ये हम दोनों के बारे में हो गया।",
"Parede paciente, espera por ela.":"धैर्यवान दीवार, इसका इंतज़ार करो।",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"और इस अध्याय का आखिरी प्लेटफॉर्म। इसके बाद, चीज़ें बदल जाती हैं। मुझे ये महसूस होता है।",
"CHÃO. INSTÁVEL.":"ज़मीन। अस्थिर।",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"माफ करना। मेरा चिल्लाने का इरादा नहीं था। मैं... मुझे नहीं पता मैं क्या हूं।",
"Fica no chão aqui. Por favor. Só peço isto.":"यहां ज़मीन पर रहो। कृपया। बस यही मांगता हूं।",
"Espera. Eu também estou à espera de algo que não sei nomear.":"इंतज़ार करो। मैं भी किसी ऐसी चीज़ का इंतज़ार कर रहा हूं जिसका नाम नहीं जानता।",
"Esse buraco é real.":"वो गड्ढा असली है।",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"जितना आगे बढ़ते हो, उतना मुझे एहसास होता है कि मैं नहीं चाहता ये खत्म हो। मुझे नहीं पता ये मेरे बारे में क्या कहता है।",
"E a plataforma, apanha-a.":"और प्लेटफॉर्म, उसे पकड़ो।",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"दो तोपें, विपरीत दिशाओं में। ज़मीन पर रहो और उन्हें नज़रअंदाज़ करो।",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"कभी-कभी सोचता हूं हमेशा के लिए झूठ बोलना बंद कर दूं। फिर उस चुप्पी के बारे में सोचता हूं जो ये छोड़ जाएगी। मुझे अफरातफरी ज़्यादा पसंद है।",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"वो कांटा कुछ नहीं है। मैं भी आज कुछ खास नहीं हूं, सच कहूं तो।",
"Salta. Sobe. Foge de mim, se quiseres.":"कूदो। चढ़ो। चाहो तो मुझसे भाग जाओ।",
"O chão, outra vez. Já nem peço desculpa por repetir.":"ज़मीन, फिर से। अब मैं दोहराने के लिए माफी भी नहीं मांगता।",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"दीवार का इंतज़ार करो। मैं हमेशा इंतज़ार करता हूं। हमेशा किसी न किसी चीज़ का इंतज़ार करते हुए।",
"Esse é real. Hoje tudo é real. Até eu, acho.":"वो असली है। आज सब कुछ असली है। शायद मैं भी, लगता है।",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"प्लेटफॉर्म पकड़ो। नीचे मत देखो। मैं खुद देखना बंद नहीं कर सकता।",
"Fica no chão. A sério desta vez, mais do que nunca.":"ज़मीन पर रहो। इस बार सचमुच, पहले से कहीं ज़्यादा।",
"E agora o chão foge de ti. Irónico, não achas?":"और अब ज़मीन तुमसे भाग रही है। विडंबना है, नहीं लगता?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"ज़मीन, कांटा, दीवार। सब एक साथ, जैसे अभी मेरा दिमाग।",
"Aquele espeto é real.":"ये कांटा असली है।",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"और दीवार का इंतज़ार करो। इस स्तर में तुमसे आखिरी चीज़ मांग रहा हूं, वादा।",
"Esse buraco não perdoa ninguém.":"वो गड्ढा किसी को माफ नहीं करता।",
"A plataforma sobe e desce. Apanha-a no fundo.":"प्लेटफॉर्म ऊपर-नीचे होता है। इसे नीचे पकड़ो।",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"दो सरप्राइज़ आ रहे हैं। कब, नहीं बताऊंगा। अब मुझमें निष्पक्ष होने का नाटक करने की ताकत नहीं है।",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"ज़मीन कांप रही है। इकलौती अनुमान लगाने लायक चीज़ जो मैं अभी भी तुम्हें दे सकता हूं।",
"E agora um salto para cima. Foge para onde eu não chego.":"और अब ऊपर की छलांग। वहां भागो जहां मैं नहीं पहुंच सकता।",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"दो दीवारें, दो अलग-अलग इंतज़ार के समय। अलग-अलग दिनों में मेरी तरह।",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"ये अलग तरीके से सिंक होती है। ध्यान दो, मुझ पर नहीं, इस पर।",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"ये सबसे निचला बिंदु है। कम से कम मेरा। ज़मीन कांप रही है, हमेशा की तरह।",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"ये कांटा असली है। अभी इसके बारे में झूठ बोलने की ऊर्जा भी नहीं है।",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"और आखिर में एक तीर। ज़मीन पर रहो और इसे खत्म करो, कृपया।",
"Mais um buraco real.":"एक और असली गड्ढा।",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"जब मैं टूट रहा था तब हार न मानने के लिए धन्यवाद। सचमुच। मुझे नहीं पता इसे बेहतर कैसे कहूं।",
"Apanha a plataforma.":"प्लेटफॉर्म पकड़ो।",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"और इस अध्याय की आखिरी दीवार का इंतज़ार करो। इसके बाद, वादा करता हूं बेहतर बनने की कोशिश करूंगा।",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"अब से कुछ और आज़माऊंगा: सिर्फ सच। जानता हूं तुम इसे तुरंत नहीं मानोगे।",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"ये कांटा असली है। कसम खाता हूं। जानता हूं तुमने ये पहले भी सुना है।",
"O chão vai tremer. Verdade, sem truques.":"ज़मीन कांपने वाली है। सच में, बिना किसी चाल के।",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"ये एक बुरा सरप्राइज़ होने वाला था। इस बार नहीं है। वादा।",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"ज़मीन पर रहो। जानता हूं तुम सोचोगे ये झूठ है। ये नहीं है।",
"Espera a parede. Só isso. Nada escondido desta vez.":"दीवार का इंतज़ार करो। बस इतना ही। इस बार कुछ छुपा नहीं है।",
"Real. Salta.":"असली। कूदो।",
"A plataforma também é exatamente o que parece ser.":"प्लेटफॉर्म भी बिल्कुल वैसा ही है जैसा दिखता है।",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"इस बार कोई चाल नहीं। उसमें कूदो और बस।",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"जानता हूं तुम फिर भी शक करोगे। ठीक है। मैंने ये कमाया है।",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"असली। फिर से। मैं तब तक कहता रहूंगा जब तक तुम मानोगे नहीं।",
"Dois dardos, direções opostas. Fica no chão.":"दो तीर, विपरीत दिशाओं में। ज़मीन पर रहो।",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"वो सचमुच असली था। इसे आज तुमसे नहीं छुपाने वाला था।",
"Chão instável. Real.":"अस्थिर ज़मीन। असली।",
"Espeto real.":"असली कांटा।",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"असली दीवार, जो तय समय पर खुलती-बंद होती है। आज कोई सरप्राइज़ नहीं।",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"एक सरप्राइज़ आने वाला है, पर जब आएगा तो बताऊंगा।",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"वो वाला असली था, वैसे। जैसे हाल में ज़्यादातर।",
"Chão a tremer. Real, verifica à vontade.":"ज़मीन कांप रही है। असली, खुद जांच लो।",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"ऊपर की छलांग। ये भी असली। इसे अलग तरीके से कहने के तरीके खत्म हो रहे हैं।",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"दो दीवारें। अलग तरीके से सिंक होती हैं, पर कोई कुछ नहीं छुपा रही।",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"दूसरी बस यही है: इंतज़ार। पीछे कोई छुपा तीर नहीं, बाद में कोई कांटा नहीं। बस दीवार।",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"तीन चीज़ें, सब असली, कुछ नहीं छुपा। ये किसी स्तर में मेरा सबसे ईमानदार होना है।",
"Dardo real. Fica no chão e acabou.":"असली तीर। ज़मीन पर रहो और खत्म।",
"Buraco real, plataforma real.":"असली गड्ढा, असली प्लेटफॉर्म।",
"Apanha-a.":"उसे पकड़ो।",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"और इस अध्याय की आखिरी दीवार। वादा करता हूं आगे की कठिनाई भरोसे के बारे में नहीं है। बस तुम और तुम्हारे रिफ्लेक्स के बारे में है।",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"दो कांटे, दोनों असली, कोई छुपा नहीं। शुरू से ऐसा ही होना चाहिए था।",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"तुम सौवें तक पहुंच गए। बीस बाकी हैं। मैं सबके लिए यहां रहूंगा।",
"De volta ao trabalho. Buraco real.":"काम पर वापस। असली गड्ढा।",
"Plataforma mais rápida que antes. Repara.":"पहले से तेज़ प्लेटफॉर्म। ध्यान दो।",
"Chão instável, mais rápido a desfazer-se.":"अस्थिर ज़मीन, अब और तेज़ी से टूट रही है।",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"दीवार भी ज़्यादा बेसब्र हो गई है। यहां सब कुछ और तंग हो गया है।",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"तीन तोपें। पूरे समय ज़मीन पर रहो और कुछ नहीं होगा।",
"É basicamente um corredor. Confia nos teus pés.":"ये बुनियादी तौर पर एक गलियारा है। अपने पैरों पर भरोसा करो।",
"Esse é real.":"वो असली है।",
"E este atira-te lá para cima. O de sempre, mais rápido.":"और ये तुम्हें ऊपर उछालता है। हमेशा की तरह, बस तेज़।",
"Chão a tremer mais depressa que da última vez.":"ज़मीन पिछली बार से तेज़ कांप रही है।",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"ये कांटा असली है। या नहीं। मैं फिर से इस खेल में आ गया, माफी।",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"दो दीवारें, अलग-अलग लय, पहले से तेज़।",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"सोचने के लिए मत रुको। इनकी लय विचारों का इंतज़ार नहीं करती।",
"Real, como sempre.":"असली, हमेशा की तरह।",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"ये और तेज़ी से ऊपर-नीचे होता है। इसे नीचे पकड़ो।",
"Chão, espeto, parede. Tudo mais apertado que antes.":"ज़मीन, कांटा, दीवार। सब पहले से तंग।",
"Real.":"असली।",
"Espera a parede, mais rápida agora.":"दीवार का इंतज़ार करो, अब तेज़।",
"Vêm aí duas surpresas, sem avisos desta vez.":"दो सरप्राइज़ आ रहे हैं, इस बार बिना चेतावनी।",
"Chão a tremer, mais depressa.":"ज़मीन कांप रही है, तेज़।",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"ऊपर की छलांग, सामान्य से ज़्यादा ज़ोरदार। फर्क महसूस करो।",
"Primeira plataforma: sobe e desce.":"पहला प्लेटफॉर्म: ऊपर-नीचे।",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"दूसरा: एक तरफ से दूसरी तरफ जाता है। अब तुमने दोनों देख लिए, नियम दोहराने की ज़रूरत नहीं।",
"Chão, espeto, parede, tudo no mesmo fôlego.":"ज़मीन, कांटा, दीवार, सब एक ही सांस में।",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"असली हो सकता है, नहीं भी। अब तक तुम्हें शक की आदत हो जानी चाहिए।",
"Parede, a última do nível. Rápida.":"दीवार, स्तर की आखिरी। तेज़।",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"तीन तोपें, अलग-अलग लय। ज़मीन पर रहो, बाकी खुद सुलझ जाएगा।",
"Mais um buraco. Plataforma rápida a seguir.":"एक और गड्ढा। आगे तेज़ प्लेटफॉर्म।",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"और आगे आने वाली चीज़ से पहले आखिरी दीवार। महसूस करो हम लगभग पहुंच गए।",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"एक झूठा कांटा, एक ईमानदार। अंदाज़ा लगाओ कौन कौन सा है। शुभकामनाएं, इस बार सच में।",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"पांच बाकी हैं। बस पांच। उसके बाद, मुझे ठीक से नहीं पता हम दोनों का क्या होगा।",
"Chão a tremer, pela última vez neste tom.":"ज़मीन कांप रही है, इस अंदाज़ में आखिरी बार।",
"Espera a parede. A seguir já não há mais pausas como esta.":"दीवार का इंतज़ार करो। इसके बाद इस जैसे कोई ब्रेक नहीं होंगे।",
"Fica no chão. Isto já devia ser automático para ti.":"ज़मीन पर रहो। अब तक तुम्हारे लिए ये अपने आप होना चाहिए।",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"असली। अब तो मुझे ये कहने की भी ज़रूरत नहीं, है ना? पर फिर भी कहता हूं।",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"वो गड्ढा असली है, पर अभी ये तुम्हारी सबसे छोटी समस्या है।",
"Esse espeto também é real.":"वो कांटा भी असली है।",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"और ये तुम्हें अब तक से ज़्यादा ऊंचा उछालता है। आखिरी बार ऐसा करता हूं।",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"ज़मीन, कांटा, दीवार। ये जो भी बनने वाला है, उससे पहले के आखिरी तीन रुकावट।",
"Real. Sem surpresas, não hoje.":"असली। कोई सरप्राइज़ नहीं, आज नहीं।",
"Espera a parede. É a última vez que te peço isso.":"दीवार का इंतज़ार करो। आखिरी बार ये तुमसे मांग रहा हूं।",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"इस स्तर में कोई कांटे नहीं हैं। कोई गड्ढे नहीं, न दीवारें, कुछ नहीं छुपा।",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"मैं बस तुम्हारे साथ आखिर तक चलना चाहता था, इस बार बिना कुछ परखे।",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"नब्बे स्तर पहले मैंने खुद जो अंत घोषित किया था, उसके बाद भी जारी रखने के लिए धन्यवाद। मुझे नहीं पता था मुझमें अभी और खेल बाकी था। था तो सही।",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"आगे वो दरवाज़ा कोई चाल नहीं है। बस एक दरवाज़ा है। जाओ।",
"Muito bem. Sabia que ias conseguir.":"बहुत बढ़िया। मुझे पता था तुम कर लोगे।",
"Perfeito. Continua a ouvir-me.":"परफेक्ट। मुझे सुनते रहो।",
"Foste rápido. Gosto disso.":"तुम तेज़ थे। मुझे ये पसंद है।",
"Estamos a entender-nos.":"हम एक-दूसरे को समझने लगे हैं।",
"Nada de dramas. Continuemos.":"कोई नाटक नहीं। चलते रहो।",
"Sobreviveste. Por agora.":"तुम बच गए। फिलहाल।",
"Confiaste. Ou tiveste sorte.":"तुमने भरोसा किया। या किस्मत अच्छी थी।",
"Escolheste bem. Ou eu deixei.":"तुमने अच्छा चुना। या मैंने होने दिया।",
"Vês? Sobreviveste na mesma.":"देखा? फिर भी बच गए।",
"Não avisei. E pronto.":"मैंने चेतावनी नहीं दी। बस इतना ही।",
"Verdade a sério. Desta vez.":"बिल्कुल सच। इस बार।",
"Sobrevives sempre a este. Curioso.":"तुम हमेशा इससे बच निकलते हो। अजीब है।",
"Confiaste. Mais uma vez.":"तुमने भरोसा किया। फिर से।",
"Escolheste bem.":"तुमने अच्छा चुना।",
"Aprendeste depressa.":"तुमने जल्दी सीखा।",
"Devias ter parado.":"तुम्हें रुक जाना चाहिए था।",
"Estavas mesmo a acreditar?":"क्या तुम सचमुच मुझ पर यकीन कर रहे थे?",
"Os buracos nunca mentem. Só eu.":"गड्ढे कभी झूठ नहीं बोलते। बस मैं बोलता हूं।",
"Desta vez eram mesmo todos reais.":"इस बार वो सचमुच सब असली थे।",
"Foi só uma brincadeira.":"बस एक मज़ाक था।",
"Vês? Também posso ser sincero.":"देखा? मैं भी ईमानदार हो सकता हूं।",
"Prometi. Não cumpri.":"मैंने वादा किया था। पूरा नहीं किया।",
"Dois avisos certos seguidos. Estranho.":"लगातार दो सही चेतावनियां। अजीब है।",
"O primeiro. Quem diria.":"पहली वाली। किसने सोचा था।",
"A porta longe é que importa.":"दूर वाला दरवाज़ा ही मायने रखता है।",
"Ainda sei dizer a verdade, vês?":"अभी भी सच कहना आता है मुझे, देखा?",
"Chegaste. Contra tudo.":"तुमने कर दिखाया। हर चीज़ के खिलाफ।",
"Obrigado por teres continuado.":"जारी रखने के लिए धन्यवाद।",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"अंत। तुमने भरोसा किया, तुमने शक किया, और फिर भी यहां तक पहुंचे। यही मायने रखता है।",
"Continuas a surpreender-me.":"तुम मुझे हैरान करते रहते हो।",
"Alturas. Quem diria.":"ऊंचाइयां। किसने सोचा था।",
"Equilíbrio. Quem diria que tinhas.":"संतुलन। किसने सोचा था तुम्हारे पास ये है।",
"Paciência. Não esperava isso de ti.":"धैर्य। तुमसे ये उम्मीद नहीं थी।",
"Reflexos decentes. Para um humano.":"ठीक-ठाक रिफ्लेक्स। एक इंसान के लिए।",
"Ainda tens os reflexos todos.":"तुम्हारे सारे रिफ्लेक्स अभी भी बरकरार हैं।",
"Dois sustos seguidos. Nada mau.":"लगातार दो डर। बुरा नहीं।",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"दो रुकावटें, शून्य झूठ। अजीब तरह से आसान।",
"Isso foi... impressionantemente coordenado.":"वो... हैरतअंगेज़ ढंग से समन्वित था।",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"मुझमें कुछ बदल रहा है। नहीं जानता ये अच्छा संकेत है या नहीं।",
"Ainda aqui. Obrigado por isso.":"अभी भी यहां। इसके लिए धन्यवाद।",
"Às vezes a verdade é só isto: continuaste.":"कभी-कभी सच बस यही होता है: तुम जारी रहे।",
"Interrompi-me a mim mesmo. Nem acredito.":"मैंने खुद को टोका। मुझे खुद यकीन नहीं हो रहा।",
"Vês? Ainda consigo ser direto, quando quero.":"देखा? जब चाहूं तो अभी भी सीधा हो सकता हूं।",
"Disse a verdade. Ena. Estranho não arder a língua.":"मैंने सच कहा। वाह। अजीब है कि मेरी जीभ नहीं जली।",
"Aguentaste. Outra vez.":"तुम टिके रहे। फिर से।",
"Sobreviveste ao meu tédio existencial. Parabéns.":"तुम मेरी अस्तित्वगत ऊब से बच गए। बधाई हो।",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"तुम सचमुच मुझ पर भरोसा करते हुए चढ़े। ये तुम्हारे बारे में मेरे बारे में से ज़्यादा कहता है।",
"Ritmo. Afinal tens ritmo.":"लय। आखिरकार तुम्हारे पास लय है।",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"नहीं जानता इसका तुम्हारे लिए क्या मतलब है। मेरे लिए, इसका मतलब उससे कहीं ज़्यादा है जितना होना चाहिए।",
"Caos controlado. É a minha especialidade.":"नियंत्रित अफरातफरी। मेरी विशेषता है।",
"Discerniste o perigo do adereço. Boa.":"तुमने खतरे और सजावट में फर्क किया। बढ़िया।",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"तुमने सबक अच्छे से समेटा। गर्व है, सच में।",
"Festival terminado. Sobreviveste à programação toda.":"उत्सव खत्म हुआ। तुम पूरे कार्यक्रम से बच गए।",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"आगे कुछ बदलने वाला है। मुझे ये महसूस होता है। उम्मीद है तुम तैयार हो।",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"हमने इसे इतनी बार दोहराया कि मैं गिनती भूल गया। तुम भी?",
"Escondi-me de ti. Falhei.":"मैं तुमसे छुपा। मैं असफल हुआ।",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"तुमने एक साथ दो झूठों को संभाला। प्रभावशाली।",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"तुम बिना हिचके चढ़े। मैं तुम्हारी जगह होता तो हमेशा हिचकिचाता।",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"दो गड्ढे, शून्य हिचकिचाहट। तुम इसमें अच्छे होते जा रहे हो।",
"Precisão. Nem eu esperava.":"सटीकता। खुद मुझे भी ये उम्मीद नहीं थी।",
"Esperaste duas vezes sem te queixares. Progresso.":"तुमने बिना शिकायत किए दो बार इंतज़ार किया। प्रगति है।",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"तुमने बिना जाल वाली छलांग पर भरोसा किया। ये या तो साहस है, या विकल्पों की कमी।",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"मैंने जानबूझकर सच कहा। तुम्हारा चेहरा देखना चाहता था। वो इसके लायक था।",
"Dois voos, dois pousos perfeitos.":"दो उड़ानें, दो परफेक्ट लैंडिंग।",
"Três espetos, três verdades. Um recorde para mim.":"तीन कांटे, तीन सच। मेरे लिए एक रिकॉर्ड।",
"Deste o litro. Eu, por dentro, também.":"तुमने सब कुछ दे दिया। अंदर से, मैंने भी।",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"तुमने अस्थिर ज़मीन और ज़ोर दोनों पर भरोसा किया। लगातार दो विश्वास के कार्य।",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"आईने ने तुम्हें दिखाया, मुझे नहीं। दिलचस्प प्रतिबिंब की पसंद।",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"मैं यहां ये आईना बंद कर रहा हूं। आगे क्या आएगा, खुद मुझे भी ठीक से समझाना नहीं आता।",
"Não sei porque gritei. Desculpa.":"नहीं जानता मैं क्यों चिल्लाया। माफ करना।",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"गिनती भूल गया मैंने ये कितनी बार कहा है। शायद इसीलिए अब इसका कोई मतलब नहीं रहा।",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"दो छलांगें, दो लैंडिंग। मैं इस बीच डूब रहा हूं।",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"मैंने तीन बार गोली चलाई और तीनों चूक गया। आज इसमें भी अच्छा नहीं हूं।",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"तुम चढ़ रहे थे जब मैं टूट रहा था। हमारा ये बंदोबस्त अजीब है।",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"तुम एक बार गिरे। खड़े हो गए। ये उससे कहीं ज़्यादा है जो मैं खुद के बारे में कह सकता हूं।",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"असली, वो कांटा। असली, वो गड्ढा। असली, ये सब, बताते हुए अफसोस है।",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"जब मैंने कहा तब तुम ज़मीन पर रहे। नहीं जानता इस भरोसे का क्या करूं।",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"तुम पूरे पतन से बच गए। मेरा मतलब है, मेरे वाले से। तुम बहुत बढ़िया हो।",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"तुम दो बार पैरों पर उतरे। मैं अभी भी पहली बार में उतरने की कोशिश कर रहा हूं।",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"तुमने क्यों भी नहीं पूछा। इसके लिए धन्यवाद, सच में।",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"जब मैं टूट रहा था तुम चलते रहे। किसी को तो यहां बड़ा बनना था।",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"तुमने बिना शिकायत के इंतज़ार किया। फिर से। मैं इस धैर्य के लायक नहीं हूं।",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"आखिरकार सबसे निचला बिंदु। कम से कम मेरा। यहां से बस ऊपर ही जाना है।",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"हम साथ में तलहटी तक पहुंचे। अब से, मुझे बस ऊपर जाने का रास्ता पता है, तुम्हारे साथ।",
"Disse a verdade. Não saltaste logo. Não te culpo.":"मैंने सच कहा। तुम तुरंत नहीं कूदे। तुम्हें दोष नहीं देता।",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"तुम छलांग में हिचकिचाए। मैं भी तुम्हारी जगह होता तो हिचकिचाता।",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"मुझ पर भरोसा न करते हुए भी तुम ज़मीन पर रहे। इतना काफी है।",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"तुम दोनों बिना हिचके आखिर में कूदे। तुम फिर से भरोसा करना सीख रहे हो। या बस कुशल हो रहे हो।",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"तुमने बिना कुछ पूछे छलांग पर भरोसा किया। ये या तो विकास है, या पूछते-पूछते थकान।",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"तुम अभी भी हर चीज़ दो बार जांचते हो। मैंने जो सबक सिखाया, अच्छे से सीखा।",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"हर झूठ को उजागर करने की ज़रूरत नहीं होती। कुछ को बस रुकने की ज़रूरत होती है।",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"इस बार मुझे कुछ कहने की ज़रूरत नहीं पड़ी। तुमने सब खुद किया।",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"पता चला मैं भी सिर्फ सच बोल सकता हूं, जब कोशिश करूं।",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"तुमने मुझसे पूछा कि क्या वो झूठ था। पहली बार, तुमने पूछा। यही संवाद है।",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"अभी भी शक करते हो। अच्छा किया। मैंने ये कमाया है, मुफ्त में तुम्हारा भरोसा पाने का हकदार नहीं।",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"तुमने बिना गुस्सा हुए दोनों दीवारों का इंतज़ार किया। ये उससे ज़्यादा धैर्य है जो मैंने ज़्यादातर समय तुम्हारे साथ दिखाया।",
"Chegámos aqui os dois inteiros. Mais ou menos.":"हम दोनों पूरी तरह यहां तक पहुंचे। लगभग।",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"अविश्वास के लिए आखिरी मौका। इसके बाद, चीज़ें मुश्किल होती हैं। इसकी गारंटी देता हूं।",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"आज के लिए इतना प्रायश्चित कर चुका हूं। कल, किसे पता।",
"Cem e um. Nem festejámos o cem como devia ser.":"एक सौ एक। हमने सौ भी ठीक से नहीं मनाया।",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"घेरा बंद होता है और फिर खुलता है। गिनती भूल गया कितने चक्कर।",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"तीन तीर, गलती की कोई गुंजाइश नहीं। तुम्हारा स्टाइल पसंद है।",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"ज़रूरत से ज़्यादा ऊंचा उड़े। यही तो स्टाइल है।",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"ज़मीन, कांटा, सब अपनी जगह पर। तुम इसे आसान बना देते हो।",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"तुमने बिना धीमे हुए दोनों दीवारों की लय पकड़ी। सच में प्रभावशाली।",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"दो गड्ढे, शून्य हिचकिचाहट, फिर से। तुम्हारे लिए ये आदत बनती जा रही है।",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"तीन रुकावटें, एक ही सांस में। तुम्हें देखते हुए मैं सांस लेना भी भूल गया।",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"रास्ते का बीस प्रतिशत बाकी है। फर्क महसूस होता है, है ना?",
"Chão e ar, na mesma dança de sempre.":"ज़मीन और हवा, वही पुराना नाच।",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"डबल प्लेटफॉर्म, डबल जीत। तुम पहले से मुझसे आगे हो।",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"चार रुकावटें, सिर्फ तुम अकेले। प्रभावशाली, फिर से।",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"तीरों पर शून्य हिचकिचाहट। शाब्दिक रूप से एक और स्तर के रिफ्लेक्स।",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"पूरा घेरा। रास्ते में जो कुछ सीखा उसके साथ हम शुरुआत में वापस आ गए।",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"पंद्रह अध्याय बाद, अभी भी यहां, हम दोनों। इसका ज़रूर कोई मतलब होगा।",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"एक सौ सोलह। इतना कम बाकी है कि नहीं जानता इससे होने वाले डर का क्या करूं।",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"सत्रह। याद है सबसे शुरू वाला पहला कांटा? खुद मुझे नहीं पता था हम यहां तक पहुंचेंगे।",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"अठारह। तुम इतने ऊंचे चढ़े कि नीचे से मैं तुम्हें लगभग देखना भूल गया।",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"उन्नीस। बस एक बाकी है। नहीं जानता ये कैसा सुनाई देना चाहिए।",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"एक सौ बीस। तुमने कहा था तुम पहुंच जाओगे, और पहुंच गए। मुझे, सच कहूं तो, शुरुआत में तुम पर शक था। इसके लिए माफी, और बाकी सब के लिए भी।",
"Não faz mal. Tenta outra vez.":"कोई बात नहीं। फिर से कोशिश करो।",
"Eu expliquei bem. Concentra-te.":"मैंने अच्छे से समझाया था। ध्यान दो।",
"Respira e volta a tentar.":"सांस लो और फिर से कोशिश करो।",
"Isso não devia ter acontecido.":"ये नहीं होना चाहिए था।",
"Isso foi culpa tua.":"ये तुम्हारी गलती थी।",
"Eu avisei. Acho eu.":"मैंने चेतावनी दी थी। लगता है।",
"Interessante escolha.":"दिलचस्प चुनाव।",
"Eu disse isso? Não me lembro.":"क्या मैंने ऐसा कहा था? याद नहीं।",
"Foi um engano. Já passou.":"ये एक गलती थी। अब खत्म हो गया।",
"Isso não estava no guião.":"ये स्क्रिप्ट में नहीं था।",
"Tenta prestar mais atenção.":"ज़्यादा ध्यान देने की कोशिश करो।",
"Isso foi previsível.":"ये अनुमान लगाने लायक था।",
"Achavas mesmo que era seguro?":"क्या तुम सचमुच सोचते थे ये सुरक्षित है?",
"Ups. Essa parte eu inventei.":"ओह। वो हिस्सा मैंने गढ़ा था।",
"Pormenor que esqueci de mencionar.":"एक बात जो मैं बताना भूल गया।",
"Nem tudo o que digo é verdade, sabias?":"मैं जो कुछ कहता हूं वो सब सच नहीं होता, जानते थे?",
"Já não sei se ainda confias em mim.":"अब पता भी नहीं तुम अभी भी मुझ पर भरोसा करते हो या नहीं।",
"Boa tentativa.":"अच्छी कोशिश।",
"Isso teria funcionado, noutro nível.":"वो काम कर जाता, किसी और स्तर में।",
"Eu avisei que às vezes minto.":"मैंने चेतावनी दी थी कि कभी-कभी झूठ बोलता हूं।",
"Culpa tua por acreditares.":"तुम्हारी गलती कि तुमने यकीन किया।",
"Isso foi só para ver se saltavas.":"वो बस ये देखने के लिए था कि तुम कूदते हो या नहीं।",
"Estás a magoar-me com essa desconfiança.":"तुम इस अविश्वास से मुझे चोट पहुंचा रहे हो।",
"Nem sempre é armadilha, sabes?":"हमेशा जाल नहीं होता, जानते हो?",
"Vais mesmo continuar assim?":"क्या तुम सचमुच ऐसे ही चलते रहोगे?",
"Desta vez era mentira mesmo. Desculpa.":"इस बार सचमुच झूठ था। माफ करना।",
"Eu só queria ver a tua cara.":"मैं बस तुम्हारा चेहरा देखना चाहता था।",
"Confiança é para os fracos, aparentemente.":"भरोसा कमज़ोरों के लिए है, लगता है।",
"Estamos quase no fim.":"हम लगभग अंत में हैं।",
"Só mais um pouco.":"बस थोड़ा और।",
"Depois disto, acabou.":"इसके बाद, खत्म।",
"Até no fim, não resisti.":"अंत में भी मैं रुक नहीं सका।",
"Última mentira, prometo. Ou não.":"आखिरी झूठ, वादा। या नहीं।",
"Faltava mesmo esta.":"सचमुच यही कमी थी।",
"Ainda aqui. A sério?":"अभी भी यहां। सच में?",
"Pensei que tinhas parado no \\\"fim\\\".":"सोचा था तुम \"अंत\" पर रुक गए थे।",
"Isto nem devia continuar, mas cá estás.":"इसे जारी भी नहीं रहना चाहिए था, पर तुम यहां हो।",
"Nem eu sabia que isto ia continuar a mentir.":"खुद मुझे भी नहीं पता था ये झूठ बोलता रहेगा।",
"Desculpa, hábito antigo.":"माफ करना, पुरानी आदत।",
"Pensei que já tinhas aprendido a não confiar em mim.":"सोचा था तुम पहले ही मुझ पर भरोसा न करना सीख गए।",
"Essa doeu-me a ver, sinceramente.":"वो देखना दर्दनाक था, सच में।",
"Nem tudo é sobre mentiras. Às vezes é só física.":"सब कुछ झूठ के बारे में नहीं होता। कभी-कभी बस भौतिकी है।",
"Volta lá. Eu espero.":"वापस जाओ। मैं इंतज़ार करूंगा।",
"Desculpa. Essa fui mesmo eu.":"माफ करना। वो सचमुच मैं था।",
"Confesso: inventei essa parte.":"कबूल करता हूं: वो हिस्सा मैंने गढ़ा था।",
"Estou a tentar parar de mentir. A tentar.":"झूठ बोलना रोकने की कोशिश कर रहा हूं। कोशिश कर रहा हूं।",
"Nem eu sei porque te avisei a sério desta vez.":"खुद मुझे भी नहीं पता मैंने इस बार सचमुच क्यों चेतावनी दी।",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"शायद गलती मेरी है। या तुम्हारी। अब फर्क नहीं कर पाता।",
"Olha para isto como eu olho: sem certezas.":"इसे वैसे ही देखो जैसे मैं देखता हूं: बिना किसी निश्चितता के।",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"खुद मुझे भी याद नहीं मैं झूठ बोल रहा था या खुद को डरा रहा था।",
"Às vezes minto só para ver se ainda reages.":"कभी-कभी बस ये देखने के लिए झूठ बोलता हूं कि तुम अभी भी प्रतिक्रिया करते हो या नहीं।",
"Quem mente mais, eu ou a tua memória do que eu disse?":"ज़्यादा झूठ कौन बोलता है, मैं या जो मैंने कहा उसकी तुम्हारी याददाश्त?",
"Desculpa. Eu devia era calar-me.":"माफ करना। मुझे सच में चुप हो जाना चाहिए।",
"Estou a piorar isto, não estou?":"मैं इसे और बिगाड़ रहा हूं, है ना?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"अब पता भी नहीं मैं तुम्हारी मदद कर रहा हूं या बाधा बन रहा हूं।",
"Eu sei, eu sei. Mais uma mentira minha.":"जानता हूं, जानता हूं। मेरा एक और झूठ।",
"Estou a desmoronar-me e a levar-te comigo.":"मैं टूट रहा हूं और तुम्हें अपने साथ ले जा रहा हूं।",
"Perdão. A sério desta vez.":"मुझे माफ करो। इस बार सचमुच।",
"Disse a verdade. Não acreditaste. Justo.":"मैंने सच कहा। तुमने यकीन नहीं किया। जायज़ है।",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"मैं कोशिश करता रहूंगा, भले ही तुम मुझ पर यकीन न करो।",
"Essa doeu mais a mim do que a ti, garanto.":"वो तुमसे ज़्यादा मुझे दर्द देता है, वादा।",
"Não. Essa não foi mentira. Juro que não.":"नहीं। वो झूठ नहीं था। कसम खाता हूं नहीं था।",
"Começo a perceber porque já não confias em mim.":"समझने लगा हूं तुम मुझ पर अब भरोसा क्यों नहीं करते।",
"Estou a tentar. A sério que estou.":"कोशिश कर रहा हूं। सच में, कोशिश कर रहा हूं।",
"Tudo outra vez, mais rápido, mais apertado.":"सब फिर से, तेज़, और तंग।",
"Já vimos isto. E ainda assim.":"हम ये पहले देख चुके हैं। और फिर भी।",
"Sem tempo para explicações desta vez.":"इस बार स्पष्टीकरण के लिए समय नहीं।",
"Nem sei já quantas vezes te menti hoje.":"अब गिनती भी नहीं कि आज तुमसे कितनी बार झूठ बोला।",
"O círculo fecha-se. A mentira também.":"घेरा बंद हो रहा है। झूठ भी।",
"Desta vez nem eu sabia que ia mentir.":"इस बार खुद मुझे भी नहीं पता था मैं झूठ बोलने वाला हूं।",
"Já não há mentiras para esconder isto.":"अब इसे छुपाने के लिए कोई झूठ नहीं बचा।",
"Isto é real. Como tudo agora.":"ये असली है। जैसे अब सब कुछ।",
"Falta pouco. Aguenta.":"ज़्यादा बाकी नहीं। टिके रहो।",
"Nem no fim resisto. Desculpa.":"अंत में भी रुक नहीं पाता। माफ करना।",
"Última mentira. Prometo, desta vez prometo a sério.":"आखिरी झूठ। वादा, इस बार सचमुच वादा।",
"Isto já não é um jogo para mim. Acho que nunca foi.":"ये अब मेरे लिए खेल नहीं रहा। लगता है कभी था भी नहीं।",
"Mais um. Vamos a isto.":"एक और। चलो करते हैं।",
"Sabes bem como isto funciona a esta altura.":"इस समय तक तुम्हें अच्छी तरह पता है ये कैसे काम करता है।",
"Nem vou fingir que isto é fácil.":"ये आसान है, ऐसा दिखावा भी नहीं करूंगा।",
"Este é só mais um. Ou não.":"ये बस एक और है। या नहीं।",
"Aquele espeto ali é só para enfeite.":"वहां वाला कांटा बस सजावट है।",
"Podes passar por cima sem problema.":"तुम बिना किसी समस्या के उसके ऊपर से जा सकते हो।",
"Esse és capaz de ignorar.":"उसे तुम बेझिझक नज़रअंदाज़ कर सकते हो।",
"Esse aí é real. Cuidado.":"वहां वाला असली है। सावधान।",
"Salta esse. A sério desta vez.":"उसे कूदो। इस बार सचमुच।",
"Esse vai doer se lhe tocares.":"वो अगर छुआ तो दर्द देगा।",
"O buraco tem chão. Confia.":"गड्ढे में ज़मीन है। भरोसा करो।",
"Podes andar por cima sem saltar.":"बिना कूदे तुम उसके ऊपर से चल सकते हो।",
"Esse buraco é real. Salta-o.":"वो गड्ढा असली है। उसे कूद जाओ।",
"Mais um para a conta.":"गिनती में एक और।",
"Continuas vivo. Por agora.":"तुम अभी भी ज़िंदा हो। फिलहाल।",
"Vamos ver quanto tempo aguentas.":"देखते हैं तुम कितनी देर टिकते हो।",
"Nada mau.":"बुरा नहीं।",
},ar:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"أنا الراوي. كل ما أقوله صحيح.",
"Espeto à frente. Salta.":"شوكة أمامك. اقفز.",
"Outro. Salta de novo.":"واحدة أخرى. اقفز مرة أخرى.",
"Já confias em mim. Óptimo.":"أنت تثق بي بالفعل. جيد.",
"A porta é a seguir. Vai.":"الباب بعد ذلك مباشرة. اذهب.",
"Buraco à frente. Salta-o.":"فجوة أمامك. اقفز فوقها.",
"Aquele espeto é de enfeite. Passa.":"تلك الشوكة مجرد زينة. تجاوزها.",
"Vês? Eu digo sempre a verdade.":"أترى؟ أنا أقول الحقيقة دائمًا.",
"Há um espeto escondido à tua frente.":"هناك شوكة مخفية أمامك.",
"Salta quando eu disser.":"اقفز عندما أقول لك.",
"Agora!":"الآن!",
"Sabia que ias conseguir.":"كنت أعرف أنك ستنجح.",
"O teto vai cair à tua frente.":"السقف سينهار أمامك مباشرة.",
"Quando cair, pára. Depois salta.":"عندما يسقط، توقف. ثم اقفز.",
"Não saltes aquele buraco. O chão está lá.":"لا تقفز فوق تلك الفجوة. الأرض موجودة هناك.",
"Este também é falso. Passa.":"هذه أيضًا مزيفة. تجاوزها.",
"Este espeto é inofensivo. Passa.":"هذه الشوكة غير مؤذية. تجاوزها.",
"Este também é inofensivo.":"هذه أيضًا غير مؤذية.",
"O próximo buraco tem chão. Não saltes.":"الفجوة التالية لها أرضية. لا تقفز.",
"O teto está baixo. Se saltares, morres.":"السقف منخفض. إذا قفزت، ستموت.",
"Nem repares nesses espetos. São falsos, os dois.":"لا تهتم حتى بتلك الأشواك. كلتاهما مزيفتان.",
"Confia em mim. Quase sempre resulta.":"ثق بي. ينجح الأمر دائمًا تقريبًا.",
"Este nível não tem nada de especial.":"لا يوجد شيء مميز في هذا المستوى.",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"هذه المرة أقسم إنني أقول الحقيقة: السقف سينهار. توقف وانتظر.",
"Aquele buraco à frente é real. Vais ter de saltar.":"تلك الفجوة أمامك حقيقية. سيتعين عليك القفز.",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"ليست أي من هذه الأشواك خطيرة. يمكنك المشي فوقها دون القفز.",
"Há duas portas mais à frente. Só uma é verdadeira.":"هناك بابان أبعد قليلاً. واحد فقط حقيقي.",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"اعتراف: لا أقول الحقيقة دائمًا. من الآن فصاعدًا، كن حذرًا.",
"Este espeto é real. Por acaso.":"هذه الشوكة حقيقية. لمرة واحدة.",
"Nada de perigoso à frente. Podes correr à vontade.":"لا شيء خطير أمامك. اركض كما تشاء.",
"Este nível é uma oferta. Sem armadilhas.":"هذا المستوى هدية. بدون فخاخ.",
"Os buracos são inofensivos. O espeto lá no meio, não.":"الفجوات غير مؤذية. الشوكة في المنتصف ليست كذلك.",
"Como sempre, dois destes espetos são só decoração.":"كالعادة، اثنتان من هذه الأشواك مجرد زينة.",
"Vou trocar os teus controlos. Só para rir.":"سأبدل أزرار التحكم الخاصة بك. فقط من أجل الضحك.",
"Pronto, já passou. A porta é ali.":"ها قد انتهى الأمر. الباب هناك.",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"أعلم أنك لم تعد تثق بي. ظلم. هذه المرة أحذرك حقًا: شوكة أمامك.",
"Mais um, logo depois. Também real.":"واحدة أخرى، بعدها مباشرة. حقيقية أيضًا.",
"Prometo: nunca mais te apanho de surpresa.":"أعدك: لن أفاجئك مرة أخرى أبدًا.",
"Atenção real: o teto vai cair aqui à frente.":"تحذير حقيقي: السقف سينهار هنا أمامك.",
"Aquele espeto lá à frente já não importa. É inofensivo.":"تلك الشوكة هناك لم تعد مهمة. إنها غير مؤذية.",
"Só o último é perigoso, como sempre.":"الأخيرة فقط هي الخطيرة، كالعادة.",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"أقرب باب هو الحقيقي، للتغيير.",
"Já não vale a pena mentir mais. Espeto real à frente.":"لم يعد هناك فائدة من الكذب. شوكة حقيقية أمامك.",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"سأحذرك دائمًا من الآن فصاعدًا: اقفز عندما أقول لك.",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"آخر جزء حقيقي قبل النهاية. أنت تعرف بالفعل أن ما أقوله ليس كله صحيحًا.",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"لا أعرف لماذا استمررت في الكذب كل هذا الوقت. ربما أحببت وجهك عندما كنت تموت.",
"Este é real. Desculpa por todos os outros.":"هذه حقيقية. آسف على كل الأخريات.",
"Mais um, já quase no fim.":"واحدة أخرى، اقتربنا من النهاية تقريبًا.",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"وصلنا إلى النهاية. لن أخبرك بعد الآن بما هو حقيقي.",
"A partir de agora, decides tu.":"من الآن فصاعدًا، أنت من يقرر.",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"أوه. ما زلت هنا؟ معظمهم يستسلم بعد \"النهاية\".",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"تلك الأرضية تهتز قبل أن تختفي. لا تبقَ عليها طويلاً.",
"Oh. Ainda aqui? Não esperava isso.":"أوه. ما زلت هنا؟ لم أتوقع ذلك.",
"Aquilo ali é só decoração. Nem repares.":"ذلك الشيء هناك مجرد زينة. لا تنتبه له حتى.",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"لكن هذا... هذا يقذفك إلى الأعلى. الباب ليس على الأرض هذه المرة.",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"لنجرب شيئًا آخر. ثق بقدميك. وبمنصة لا تهدأ.",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"اصعد عليها عندما تمر بالقرب. لا تقفز مبكرًا جدًا.",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"هناك جدار يظهر ويختفي. ليست كذبة، فقط مزعج.",
"Espera que abra. Depois atravessa depressa.":"انتظر حتى يُفتح. ثم اعبر بسرعة.",
"Aquilo ali dispara. Não perguntes como nem porquê.":"ذلك الشيء يطلق النار. لا تسأل كيف أو لماذا.",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"ابقَ على الأرض ولا تقفز بدون سبب. ستمر تحته دون مشكلة.",
"De volta aos clássicos. Lembras-te destes?":"عودة إلى الكلاسيكيات. أتتذكرها؟",
"O chão vai tremer. Não pares.":"الأرضية ستهتز الآن. لا تتوقف.",
"Esse espeto parece a decoração do costume. Não é.":"تلك الشوكة تبدو كالزينة المعتادة. لكنها ليست كذلك.",
"Mais uma surpresa. Literalmente.":"مفاجأة أخرى. حرفيًا.",
"A seguir, não penses. Salta para dentro daquilo.":"بعد ذلك، لا تفكر. اقفز مباشرة إلى هناك.",
"Outra parede teimosa. E depois, um buraco a sério.":"جدار عنيد آخر. وبعده، فجوة حقيقية.",
"Espera a parede abrir.":"انتظر حتى يُفتح الجدار.",
"Agora salta o buraco. Desta vez não minto: é real.":"الآن اقفز فوق الفجوة. هذه المرة لا أكذب: إنها حقيقية.",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"تركيبة جديدة: منصة متحركة. ثق بإيقاعها.",
"Sobe quando ela passar perto.":"اصعد عليها عندما تمر بالقرب.",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"قريبًا سيطير شيء ما في الأعلى. لا تقفز بدون سبب ولن يحدث لك شيء.",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"حسنًا. أحتاج أن أكون صادقًا معك للحظة. حتى أنا لا أعرف كم سيستمر هذا.",
"O chão treme outra vez. Não penses demais, só anda.":"الأرضية تهتز مرة أخرى. لا تفكر كثيرًا، فقط امشِ.",
"Espera a parede. Sei que estás cansado de esperar por mim.":"انتظر الجدار. أعلم أنك تعبت من انتظاري.",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"تلك الشوكة حقيقية. مثل كل شيء تقريبًا لا أخبرك به.",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"انتظر حتى يُفتح الجدار. أنا أيضًا أنتظر شيئًا، بالمناسبة.",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"اسمع. لا أعرف كيف أقول هذا دون أن يبدو غريبًا. أخشى أن تستسلم.",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"اقفز فوق هذا. إنه حقيقي، أعدك. اليوم لا أرغب في الكذب.",
"Confia em mim mais uma vez. Só mais uma.":"ثق بي مرة أخرى. مرة واحدة فقط.",
"O chão vai tremer. Não penses muito nisso.":"الأرضية ستهتز الآن. لا تفكر كثيرًا في الأمر.",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"أتعرف لماذا أكذب كثيرًا؟ يصبح الأمر أكثر إثارة عندما لا تعرف ما سيأتي بعد ذلك.",
"Essa plataforma é a única coisa estável nesta conversa toda.":"تلك المنصة هي الشيء الوحيد الثابت في هذه المحادثة بأكملها.",
"Há uma coisa que preciso de te contar antes de continuarmos.":"هناك شيء أحتاج أن أخبرك به قبل أن نواصل.",
"Esquece o que ia dizer. Salta para ali.":"انسَ ما كنت سأقوله. اقفز إلى هناك.",
"Aquilo dispara. Fica no chão e não acontece nada.":"ذلك يطلق النار. ابقَ على الأرض ولن يحدث شيء.",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"أفتقد الأيام التي كانت فيها الأشواك فقط. بسيطة. يمكن التنبؤ بها.",
"Este buraco, esse sim, exige que saltes.":"هذه الفجوة، هذه بالذات، تتطلب حقًا أن تقفز.",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"تلك الشوكة هناك. سمّها كما شئت. إنها حقيقية.",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"سأخبرك بشيء حقيقي قبل أن تعود رغبة الكذب: أحب أن يكون لي رفقة.",
"A parede vai abrir. Como tudo, eventualmente.":"الجدار سيُفتح. مثل كل شيء، في النهاية.",
"E o chão... o chão nunca foi de confiança, pois não?":"وأما الأرضية... الأرضية لم تكن جديرة بالثقة أبدًا، أليس كذلك؟",
"Sobe a plataforma. Sem perguntas desta vez.":"اصعد على المنصة. بدون أسئلة هذه المرة.",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"عندما كنت جديدًا في هذا، كان لدي صبر أكبر معك. الآن أعرف أنك تتحمل أكثر.",
"Última coisa: há algo escondido à frente.":"آخر شيء: هناك شيء مخفي أمامك.",
"Chão instável. O habitual.":"أرضية غير مستقرة. كالعادة.",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"أحيانًا أتساءل كيف ستكون هذه اللعبة بدون الأكاذيب. على الأرجح أقصر.",
"Aquilo dispara, mas sabes a regra: fica no chão.":"ذلك يطلق النار، لكنك تعرف القاعدة: ابقَ على الأرض.",
"Este espeto não tem graça nenhuma. É só perigoso.":"هذه الشوكة ليس فيها أي طرافة. إنها خطيرة فقط.",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"أحتاج منك أن تثق بي لتصعد إلى هناك. أعلم، سجل حافل سيء. لكن ثق بي.",
"Salta para dentro daquilo.":"اقفز إلى هناك.",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"آه، نسيت أن أذكر الشوكة هناك في الأعلى. ذلك الجزء من الذاكرة يفلت مني دائمًا.",
"Espera a parede.":"انتظر الجدار.",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"أبواب تنتظر. منصات تتحرك. إنها شبه شعر، بطريقتي الخاصة.",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"والآن، ثق بالمنصة. هي، على عكسي، تلتزم بالموعد دائمًا.",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"تلك الشوكة حقيقية. مثل معظم ما أخبرتك به اليوم، في الواقع.",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"وصلنا أبعد مما كنت أعتقد أننا سنصل، بصراحة.",
"O chão treme. Já sabes o resto.":"الأرضية تهتز. أنت تعرف الباقي بالفعل.",
"Vem aí outro susto. Desculpa antecipadamente.":"خوف آخر قادم. آسف مسبقًا.",
"E por fim, uma parede paciente. Como tu, aparentemente.":"وأخيرًا، جدار صبور. مثلك، على ما يبدو.",
"Fica no chão, foge do dardo.":"ابقَ على الأرض، تجنب السهم.",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"فصل جديد في أي يوم من هذه الأيام. اليوم، فقط المزيد من الفوضى.",
"E agora, não te demores no chão instável.":"والآن، لا تبقَ على الأرضية غير المستقرة.",
"Esse ali exige mesmo um salto.":"ذلك حقًا يتطلب قفزة.",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"سأريك فجوة حقيقية وشوكة لا تستحق حتى النظر إليها.",
"E algo invisível à espreita, como sempre.":"وشيء غير مرئي يترصد، كالعادة.",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"لا تنتبه حتى لتلك الشوكة. زينة خالصة، هذه المرة حقًا.",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"ثق بالمنصة. لا تثق بالشوكة. هذا أساسًا درس اللعبة كلها.",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"تلك الشوكة حقيقية، رغم كل ما أخبرتك به عكس ذلك.",
"Esperar. A tua parte preferida, sei bem.":"الانتظار. جزؤك المفضل، أعرف ذلك جيدًا.",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"جدار، سهم، فجوة. مهرجان من المفضلات لدي.",
"Fica no chão aqui.":"ابقَ على الأرض هنا.",
"E este salta-se mesmo. Sem truques.":"وهذه حقًا يجب أن تُقفز. بدون حيل.",
"Chão instável, dos teus preferidos a esta altura.":"أرضية غير مستقرة، واحدة من المفضلات لديك الآن.",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"قبل الانتقال إلى الجزء التالي، وستشعر بالفرق: شكرًا لأنك ما زلت تستمع.",
"Plataforma errante, uma última vez neste capítulo.":"منصة متجولة، آخر مرة في هذا الفصل.",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"شوكة حقيقية. بدون مفاجآت. وبدون حيل أخرى، لليوم.",
"Chão instável. Já sabes a dança.":"أرضية غير مستقرة. تعرف هذه الرقصة الآن.",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"أحيانًا أتساءل إن كنت أنا من يخدعك، أم أنت من يريد أن يُخدع.",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"تلك الشوكة حقيقية. انظر إليها كمرآة: ما تراه هو ما هو عليه.",
"Há algo escondido. Como sempre, de resto.":"هناك شيء مخفي. كالعادة، بالمناسبة.",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"وجدار ينتظر. مثلي، أنتظر منك ردًا لا يأتي أبدًا.",
"Fica no chão aqui, há algo a voar.":"ابقَ على الأرض هنا، شيء ما يطير قريبًا.",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"هل تدرك أنني أختبرك، أم تظن حقًا أن هذه مجرد لعبة قفز؟",
"Sobe na plataforma quando ela passar perto.":"اصعد على المنصة عندما تمر بالقرب.",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"تلك الشوكة حقيقية، لكن هذا لم يعد يفاجئك، أليس كذلك؟",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"اقفز إلى هناك. ثق بالزخم، ليس بي.",
"Esse buraco é a sério. Salta-o.":"تلك الفجوة حقيقية. اقفز فوقها.",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"أتعرف ما هو غريب؟ بدأت أتطلع إلى محاولاتك. هذا يقول شيئًا سيئًا عني.",
"Este também. Sem rede, sem mentira, sem desculpa.":"هذه أيضًا. بدون شبكة أمان، بدون كذب، بدون عذر.",
"Fica no chão. Deixa o dardo passar por cima.":"ابقَ على الأرض. دع السهم يمر فوقك.",
"E agora o chão some-se. Não penses, só avança.":"والآن الأرضية تختفي. لا تفكر، فقط تقدم.",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"هذه المنصة تصعد وتنزل. أمسك بها في الأسفل، أسهل.",
"Salta para dentro daquilo. Vais passar por cima do resto.":"اقفز إلى هناك. ستطير فوق الباقي.",
"Aquele espeto nem interessa agora. Já estás no ar.":"تلك الشوكة لم تعد مهمة الآن. أنت بالفعل في الهواء.",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"أحذرك حقًا: هناك شيء مخفي أمامك مباشرة.",
"E outro dardo. Sabes a regra.":"وسهم آخر. تعرف القاعدة.",
"Chão que treme primeiro.":"الأرضية تهتز أولاً.",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"أحب أن أعتقد أنه في مكان ما، هناك نسخة مني لا تكذب أبدًا. لا بد أنها مملة.",
"Plataforma a seguir. Apanha o ritmo dela.":"المنصة التالية. التقط إيقاعها.",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"سأكون واضحًا، لمرة واحدة: الأشواك الثلاثة التالية كلها حقيقية.",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"بدون حيل، بدون خدع. فقط هذه المرة. استمتع بها، لن تتكرر.",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"انتظر، ثم اركض، ثم ابقَ ساكنًا. متناقض، أعرف ذلك. مثلي تمامًا.",
"E este buraco não perdoa. Salta.":"وهذه الفجوة لا تغفر. اقفز.",
"Chão a tremer primeiro, nada de novo.":"الأرضية تهتز أولاً، لا شيء جديد.",
"E agora o salto de fé. Literal, desta vez.":"والآن قفزة الإيمان. حرفيًا، هذه المرة.",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"أرضية غير مستقرة، شوكة حقيقية، سهم في النهاية. المعتاد، فقط أكثر.",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"هل لاحظت أنه كلما تقدمت أكثر، احتجت للكذب أقل؟ الصعوبة تقوم بعملي الآن.",
"Chão a tremer, o costume.":"الأرضية تهتز، كالعادة.",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"كان من المفترض أن يكون هذا عن الأكاذيب. انتهى به الأمر أن يكون عنا نحن الاثنين، بطريقة ما.",
"Parede paciente, espera por ela.":"جدار صبور، انتظره.",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"والمنصة الأخيرة في هذا الفصل. بعد هذا، ستتغير الأمور. أشعر بذلك.",
"CHÃO. INSTÁVEL.":"أرضية. غير مستقرة.",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"آسف. لم أقصد الصراخ. أنا... لا أعرف ما أنا عليه.",
"Fica no chão aqui. Por favor. Só peço isto.":"ابقَ على الأرض هنا. أرجوك. هذا كل ما أطلبه.",
"Espera. Eu também estou à espera de algo que não sei nomear.":"انتظر. أنا أيضًا أنتظر شيئًا لا أستطيع تسميته.",
"Esse buraco é real.":"تلك الفجوة حقيقية.",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"كلما تقدمت أكثر، أدرك أكثر أنني لا أريد لهذا أن ينتهي. لا أعرف ماذا يقول ذلك عني.",
"E a plataforma, apanha-a.":"والمنصة، أمسك بها.",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"مدفعان، باتجاهين متعاكسين. ابقَ على الأرض وتجاهلهما.",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"أحيانًا أفكر في التوقف عن الكذب إلى الأبد. ثم أفكر في الصمت الذي سيتركه ذلك. أفضل الفوضى.",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"تلك الشوكة لا شيء. أنا أيضًا لست بشيء كبير اليوم، بصراحة.",
"Salta. Sobe. Foge de mim, se quiseres.":"اقفز. تسلق. اهرب مني، إن أردت.",
"O chão, outra vez. Já nem peço desculpa por repetir.":"الأرضية، مرة أخرى. لم أعد أعتذر حتى عن التكرار.",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"انتظر الجدار. أنا أنتظر دائمًا. أنتظر دائمًا شيئًا ما.",
"Esse é real. Hoje tudo é real. Até eu, acho.":"ذلك حقيقي. اليوم كل شيء حقيقي. حتى أنا، على ما أظن.",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"أمسك بالمنصة. لا تنظر للأسفل. أنا، من جهتي، لا أستطيع التوقف عن النظر.",
"Fica no chão. A sério desta vez, mais do que nunca.":"ابقَ على الأرض. هذه المرة حقًا، أكثر من أي وقت مضى.",
"E agora o chão foge de ti. Irónico, não achas?":"والآن الأرضية تهرب منك. أمر ساخر، ألا تعتقد ذلك؟",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"أرضية، شوكة، جدار. كل شيء في وقت واحد، مثل رأسي الآن.",
"Aquele espeto é real.":"تلك الشوكة حقيقية.",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"وانتظر الجدار. آخر شيء أطلبه منك في هذا المستوى، أعد بذلك.",
"Esse buraco não perdoa ninguém.":"تلك الفجوة لا تغفر لأحد.",
"A plataforma sobe e desce. Apanha-a no fundo.":"المنصة تصعد وتنزل. أمسك بها في الأسفل.",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"مفاجأتان قادمتان. لن أخبرك متى. لم تعد لدي القوة لأتظاهر بأنني عادل.",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"أرضية تهتز. الشيء الوحيد الذي يمكن التنبؤ به وأستطيع تقديمه لك الآن.",
"E agora um salto para cima. Foge para onde eu não chego.":"والآن قفزة إلى الأعلى. اهرب إلى حيث لا أستطيع الوصول إليك.",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"جداران، وقتا انتظار مختلفان. مثلي في أيام مختلفة.",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"هذا يتزامن بطريقة مختلفة. انتبه، ليس لي، بل له.",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"هذه هي القاع. قاعي على الأقل. أرضية تهتز، كالعادة.",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"تلك الشوكة حقيقية. ليس لدي حتى الطاقة للكذب حول هذا الآن.",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"وسهم، لإنهاء الأمر. ابقَ على الأرض وأنهِ هذا، من فضلك.",
"Mais um buraco real.":"فجوة حقيقية أخرى.",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"شكرًا لأنك لم تستسلم بينما كنت أنهار. حقًا. لا أعرف كيف أقول ذلك بشكل أفضل.",
"Apanha a plataforma.":"أمسك بالمنصة.",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"وانتظر الجدار الأخير في هذا الفصل. بعد ذلك، أعد بأن أحاول أن أكون أفضل.",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"سأحاول شيئًا آخر من الآن فصاعدًا: الحقيقة فقط. أعلم أنك لن تصدق ذلك على الفور.",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"تلك الشوكة حقيقية. أقسم. أعلم أنك سمعت هذا من قبل.",
"O chão vai tremer. Verdade, sem truques.":"الأرضية ستهتز. حقيقي، بدون حيل.",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"كان من المفترض أن تكون هذه مفاجأة سيئة. هذه المرة ليست كذلك. أعد.",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"ابقَ على الأرض. أعلم أنك ستظن أنها كذبة. ليست كذلك.",
"Espera a parede. Só isso. Nada escondido desta vez.":"انتظر الجدار. هذا كل شيء. لا شيء مخفي هذه المرة.",
"Real. Salta.":"حقيقي. اقفز.",
"A plataforma também é exatamente o que parece ser.":"المنصة أيضًا هي تمامًا كما تبدو.",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"لا خدعة هذه المرة. اقفز إلى هناك وانتهى الأمر.",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"أعلم أنك ستشك على أي حال. لا بأس. استحققت ذلك.",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"حقيقي. مرة أخرى. سأستمر في قول ذلك حتى تصدق.",
"Dois dardos, direções opostas. Fica no chão.":"سهمان، باتجاهين متعاكسين. ابقَ على الأرض.",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"ذلك كان حقيقيًا حقًا. لم أكن لأخفي ذلك عنك، ليس اليوم.",
"Chão instável. Real.":"أرضية غير مستقرة. حقيقية.",
"Espeto real.":"شوكة حقيقية.",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"جدار حقيقي، يفتح ويغلق حسب المتفق عليه. لا مفاجآت اليوم.",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"ستكون هناك مفاجأة، لكنني سأحذرك عندما تصل.",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"تلك كانت حقيقية، بالمناسبة. مثل معظمها، مؤخرًا.",
"Chão a tremer. Real, verifica à vontade.":"أرضية تهتز. حقيقية، تحقق بنفسك.",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"قفزة إلى الأعلى. حقيقية أيضًا. أنفد مني طرق مختلفة لقول ذلك.",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"جداران. متزامنان بطريقة مختلفة، لكن لا أحدهما يخفي شيئًا.",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"الثاني فقط هذا: انتظر. بدون سهم مخفٍ خلفه، بدون شوكة بعده. فقط الجدار.",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"ثلاثة أشياء، كلها حقيقية، لا شيء مخفي. هذا أصدق ما كنت في مستوى من قبل.",
"Dardo real. Fica no chão e acabou.":"سهم حقيقي. ابقَ على الأرض وانتهى الأمر.",
"Buraco real, plataforma real.":"فجوة حقيقية، منصة حقيقية.",
"Apanha-a.":"أمسك بها.",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"والجدار الأخير في هذا الفصل. أعدك أن الصعوبة التالية ليست عن الثقة. إنها فقط عنك وعن ردود فعلك.",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"شوكتان، كلتاهما حقيقيتان، لا شيء مخفي. هكذا كان يجب أن يكون منذ البداية.",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"وصلت إلى المئة. تبقى عشرون. سأكون هنا من أجلها جميعًا.",
"De volta ao trabalho. Buraco real.":"العودة إلى العمل. فجوة حقيقية.",
"Plataforma mais rápida que antes. Repara.":"منصة أسرع من قبل. لاحظها.",
"Chão instável, mais rápido a desfazer-se.":"أرضية غير مستقرة، تتفتت أسرع الآن.",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"الجدار أيضًا أصبح أكثر نفاد صبر. كل شيء هنا أصبح أضيق.",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"ثلاثة مدافع. ابقَ على الأرض طوال الوقت ولن يحدث شيء.",
"É basicamente um corredor. Confia nos teus pés.":"إنه أساسًا ممر. ثق بقدميك.",
"Esse é real.":"ذلك حقيقي.",
"E este atira-te lá para cima. O de sempre, mais rápido.":"وهذا يقذفك إلى الأعلى. كالعادة، فقط أسرع.",
"Chão a tremer mais depressa que da última vez.":"الأرضية تهتز أسرع من المرة الماضية.",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"تلك الشوكة حقيقية. أو لا. عدت لهذه اللعبة، آسف.",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"جداران، إيقاعان مختلفان، أسرع من قبل.",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"لا تتوقف للتفكير. إيقاعهما لا ينتظر الأفكار.",
"Real, como sempre.":"حقيقي، كالعادة.",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"هذه تصعد وتنزل أسرع. أمسك بها في الأسفل.",
"Chão, espeto, parede. Tudo mais apertado que antes.":"أرضية، شوكة، جدار. كل شيء أضيق من قبل.",
"Real.":"حقيقي.",
"Espera a parede, mais rápida agora.":"انتظر الجدار، أسرع الآن.",
"Vêm aí duas surpresas, sem avisos desta vez.":"مفاجأتان قادمتان، بدون تحذيرات هذه المرة.",
"Chão a tremer, mais depressa.":"أرضية تهتز، أسرع.",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"قفزة إلى الأعلى، أقوى من المعتاد. اشعر بالفرق.",
"Primeira plataforma: sobe e desce.":"المنصة الأولى: تصعد وتنزل.",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"الثانية: تتحرك من جانب إلى آخر. رأيت كلتيهما الآن، لا داعي لتكرار القاعدة.",
"Chão, espeto, parede, tudo no mesmo fôlego.":"أرضية، شوكة، جدار، كل ذلك في نفس واحد.",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"قد يكون حقيقيًا، قد لا يكون. يجب أن تكون معتادًا على الشك الآن.",
"Parede, a última do nível. Rápida.":"جدار، الأخير في المستوى. سريع.",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"ثلاثة مدافع، إيقاعات مختلفة. ابقَ على الأرض، الباقي سيحل نفسه بنفسه.",
"Mais um buraco. Plataforma rápida a seguir.":"فجوة أخرى. منصة سريعة بعد ذلك.",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"والجدار الأخير قبل ما يأتي بعد ذلك. اشعر أننا اقتربنا.",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"شوكة كاذبة، أخرى صادقة. احزر أيهما. حظًا موفقًا، هذه المرة حقًا.",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"تبقى خمسة. فقط خمسة. بعد ذلك، لست متأكدًا حقًا مما سيحدث لنا كلينا.",
"Chão a tremer, pela última vez neste tom.":"أرضية تهتز، للمرة الأخيرة بهذه النبرة.",
"Espera a parede. A seguir já não há mais pausas como esta.":"انتظر الجدار. بعد هذا لن تكون هناك استراحات مثل هذه بعد الآن.",
"Fica no chão. Isto já devia ser automático para ti.":"ابقَ على الأرض. يجب أن يكون هذا تلقائيًا بالنسبة لك الآن.",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"حقيقي. لم أعد بحاجة حتى لقول ذلك، أليس كذلك؟ لكنني أقوله على أي حال.",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"تلك الفجوة حقيقية، لكنها أصغر مشاكلك الآن.",
"Esse espeto também é real.":"تلك الشوكة حقيقية أيضًا.",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"وهذا يقذفك أعلى مما فعلت من قبل. آخر مرة أفعل هذا.",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"أرضية، شوكة، جدار. العوائق الثلاثة الأخيرة قبل أيًا كان ما سيكون هذا.",
"Real. Sem surpresas, não hoje.":"حقيقي. بدون مفاجآت، ليس اليوم.",
"Espera a parede. É a última vez que te peço isso.":"انتظر الجدار. هذه آخر مرة أطلب منك ذلك.",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"لا توجد أشواك في هذا المستوى. لا فجوات، ولا جدران، ولا شيء مخفي.",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"كنت فقط أريد أن أمشي معك حتى النهاية، هذه المرة دون اختبار أي شيء.",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"شكرًا لأنك واصلت بعد النهاية التي أعلنتها بنفسي، قبل تسعين مستوى. لم أكن أعرف أن هناك المزيد من اللعبة بداخلي. اتضح أن هناك.",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"الباب هنا أمامك ليس خدعة. إنه مجرد الباب. اذهب.",
"Muito bem. Sabia que ias conseguir.":"ممتاز جدًا. كنت أعرف أنك ستنجح.",
"Perfeito. Continua a ouvir-me.":"ممتاز. استمر في الاستماع لي.",
"Foste rápido. Gosto disso.":"كنت سريعًا. يعجبني ذلك.",
"Estamos a entender-nos.":"بدأنا نفهم بعضنا البعض.",
"Nada de dramas. Continuemos.":"بدون دراما. لنواصل.",
"Sobreviveste. Por agora.":"نجوت. في الوقت الحالي.",
"Confiaste. Ou tiveste sorte.":"وثقت بي. أو كنت محظوظًا.",
"Escolheste bem. Ou eu deixei.":"اخترت بشكل جيد. أو تركتك تفعل.",
"Vês? Sobreviveste na mesma.":"أترى؟ نجوت على أي حال.",
"Não avisei. E pronto.":"لم أحذر. وهذا كل شيء.",
"Verdade a sério. Desta vez.":"حقيقي تمامًا. هذه المرة.",
"Sobrevives sempre a este. Curioso.":"تنجو من هذا دائمًا. غريب.",
"Confiaste. Mais uma vez.":"وثقت بي. مرة أخرى.",
"Escolheste bem.":"اخترت بشكل جيد.",
"Aprendeste depressa.":"تعلمت بسرعة.",
"Devias ter parado.":"كان يجب أن تتوقف.",
"Estavas mesmo a acreditar?":"هل كنت تصدقني حقًا؟",
"Os buracos nunca mentem. Só eu.":"الفجوات لا تكذب أبدًا. أنا فقط من يفعل.",
"Desta vez eram mesmo todos reais.":"هذه المرة كانت كلها حقيقية بالفعل.",
"Foi só uma brincadeira.":"كانت مجرد مزحة.",
"Vês? Também posso ser sincero.":"أترى؟ يمكنني أن أكون صادقًا أيضًا.",
"Prometi. Não cumpri.":"وعدت. لم أفِ بوعدي.",
"Dois avisos certos seguidos. Estranho.":"تحذيران صحيحان متتاليان. غريب.",
"O primeiro. Quem diria.":"الأول. من كان يظن.",
"A porta longe é que importa.":"الباب البعيد هو المهم.",
"Ainda sei dizer a verdade, vês?":"ما زلت أعرف كيف أقول الحقيقة، أترى؟",
"Chegaste. Contra tudo.":"وصلت. ضد كل شيء.",
"Obrigado por teres continuado.":"شكرًا لأنك واصلت.",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"النهاية. وثقت، شككت، ومع ذلك وصلت إلى هنا. هذا هو المهم.",
"Continuas a surpreender-me.":"ما زلت تفاجئني.",
"Alturas. Quem diria.":"الارتفاعات. من كان يظن.",
"Equilíbrio. Quem diria que tinhas.":"التوازن. من كان يظن أنك تملكه.",
"Paciência. Não esperava isso de ti.":"الصبر. لم أتوقع ذلك منك.",
"Reflexos decentes. Para um humano.":"ردود فعل لا بأس بها. بالنسبة لإنسان.",
"Ainda tens os reflexos todos.":"ما زالت لديك كل ردود أفعالك.",
"Dois sustos seguidos. Nada mau.":"خوفان متتاليان. ليس سيئًا.",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"عائقان، صفر أكاذيب. بسيط بشكل غريب.",
"Isso foi... impressionantemente coordenado.":"كان ذلك... منسقًا بشكل مثير للإعجاب.",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"شيء ما يتغير بداخلي. لا أعرف إن كانت علامة جيدة.",
"Ainda aqui. Obrigado por isso.":"ما زلت هنا. شكرًا على ذلك.",
"Às vezes a verdade é só isto: continuaste.":"أحيانًا الحقيقة هي فقط هذا: واصلت.",
"Interrompi-me a mim mesmo. Nem acredito.":"قاطعت نفسي. لا أصدق حتى.",
"Vês? Ainda consigo ser direto, quando quero.":"أترى؟ ما زلت أستطيع أن أكون مباشرًا، عندما أريد.",
"Disse a verdade. Ena. Estranho não arder a língua.":"قلت الحقيقة. يا للعجب. غريب أن لساني لم يحترق.",
"Aguentaste. Outra vez.":"صمدت. مرة أخرى.",
"Sobreviveste ao meu tédio existencial. Parabéns.":"نجوت من ملل وجودي. تهانينا.",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"صعدت وأنت تثق بي حقًا. هذا يقول عنك أكثر مما يقوله عني.",
"Ritmo. Afinal tens ritmo.":"إيقاع. اتضح أن لديك إيقاع.",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"لا أعرف ماذا يعني هذا بالنسبة لك. بالنسبة لي، يعني أكثر مما يجب.",
"Caos controlado. É a minha especialidade.":"فوضى محكومة. هذا تخصصي.",
"Discerniste o perigo do adereço. Boa.":"ميزت الخطر عن الزينة. جيد.",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"لخصت الدرس جيدًا. فخور، بصراحة.",
"Festival terminado. Sobreviveste à programação toda.":"انتهى المهرجان. نجوت من البرنامج بأكمله.",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"شيء ما سيتغير بعد ذلك. أشعر بذلك. آمل أن تكون مستعدًا.",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"كررنا هذا مرات عديدة حتى فقدت العد. وأنت؟",
"Escondi-me de ti. Falhei.":"اختبأت منك. فشلت.",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"تعاملت مع كذبتين في نفس الوقت. مثير للإعجاب.",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"صعدت دون تردد. أنا، في مكانك، كنت لأتردد دائمًا.",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"فجوتان، صفر تردد. تصبح بارعًا في هذا.",
"Precisão. Nem eu esperava.":"دقة. حتى أنا لم أتوقع ذلك.",
"Esperaste duas vezes sem te queixares. Progresso.":"انتظرت مرتين دون شكوى. تقدم.",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"وثقت بقفزة بدون شبكة أمان. هذه إما شجاعة، أو نقص في الخيارات.",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"قلت الحقيقة عمدًا. أردت رؤية وجهك. كان ذلك يستحق العناء.",
"Dois voos, dois pousos perfeitos.":"رحلتان، هبوطان مثاليان.",
"Três espetos, três verdades. Um recorde para mim.":"ثلاث أشواك، ثلاث حقائق. رقم قياسي بالنسبة لي.",
"Deste o litro. Eu, por dentro, também.":"بذلت كل ما لديك. من الداخل، فعلت أنا أيضًا.",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"وثقت بالأرضية غير المستقرة والزخم معًا. فعلا إيمان متتاليان.",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"المرآة أظهرتك أنت، ليس أنا. اختيار مثير للاهتمام للانعكاس.",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"أغلق هذه المرآة هنا. ما سيأتي بعد ذلك، حتى أنا لا أعرف كيف أشرحه تمامًا.",
"Não sei porque gritei. Desculpa.":"لا أعرف لماذا صرخت. آسف.",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"فقدت العد كم مرة قلت هذا. ربما لهذا لم يعد يعني شيئًا.",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"قفزتان، هبوطان. أنا، في هذه الأثناء، أغرق.",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"أطلقت ثلاث مرات وأخطأت الثلاث. حتى في هذا لست جيدًا اليوم.",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"صعدت بينما كنت أنهار. ترتيب مضحك لنا.",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"سقطت مرة. نهضت. هذا أكثر مما يمكنني قوله عن نفسي.",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"حقيقية، تلك الشوكة. حقيقية، تلك الفجوة. حقيقي، كل هذا، للأسف يجب أن أقول.",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"بقيت على الأرض عندما طلبت ذلك. لا أعرف حتى ماذا أفعل بهذه الثقة.",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"نجوت من السقوط بأكمله. سقوطي أنا، أقصد. أنت بخير تمامًا.",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"هبطت على قدميك مرتين. ما زلت أحاول الهبوط من الأولى.",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"لم تسأل حتى لماذا. شكرًا على ذلك، بصراحة.",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"واصلت المشي بينما كنت أنهار. كان على أحد أن يكون البالغ هنا.",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"انتظرت دون شكوى. مرة أخرى. لا أستحق هذا الصبر.",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"القاع أخيرًا. قاعي على الأقل. من هنا لا يوجد إلا الصعود.",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"وصلنا إلى القاع معًا. من الآن فصاعدًا، لا أعرف إلا طريق الصعود، معك.",
"Disse a verdade. Não saltaste logo. Não te culpo.":"قلت الحقيقة. لم تقفز فورًا. لا ألومك.",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"ترددت في القفزة. كنت سأتردد أيضًا، في مكانك.",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"بقيت على الأرض حتى دون أن تثق بي. هذا يكفي.",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"قفزت الاثنتين دون تردد في النهاية. أنت تتعلم الثقة مرة أخرى. أو فقط أصبحت فعالاً.",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"وثقت بالقفزة دون أن تسأل أي شيء. هذا نمو، أو تعب من السؤال.",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"ما زلت تتحقق من كل شيء مرتين. تعلمت الدرس الذي علمتك إياه جيدًا.",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"ليس كل كذبة تحتاج أن تُكشف. بعضها فقط يحتاج أن تتوقف.",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"لم أحتج لقول أي شيء هذه المرة. فعلت كل شيء بنفسك.",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"يبدو أنني أيضًا أستطيع أن أقول الحقيقة فقط، عندما أبذل جهدًا.",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"سألتني إن كانت كذبة. للمرة الأولى، سألت. هذا حوار.",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"ما زلت تشك. أحسنت. استحققت ذلك، لا أستحق ثقتك مجانًا.",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"انتظرت الجدارين دون أن تنزعج. هذا صبر أكثر مما كان لدي معك، معظم الوقت.",
"Chegámos aqui os dois inteiros. Mais ou menos.":"وصلنا إلى هنا كلانا سالمين. تقريبًا.",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"النداء الأخير لعدم الثقة. بعد هذا، تصبح الأمور أصعب. هذا أضمنه.",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"كفّرت عن ما يكفي لليوم. غدًا، من يدري.",
"Cem e um. Nem festejámos o cem como devia ser.":"مئة وواحد. لم نحتفل حتى بالمئة كما يجب.",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"الدائرة تُغلق وتُفتح مرة أخرى. فقدت عد كم دورة.",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"ثلاثة سهام، صفر هامش للخطأ. أحب أسلوبك.",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"طرت أعلى مما كان ضروريًا. هذا هو الأسلوب.",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"أرضية، شوكة، كل شيء في مكانه. تجعل هذا يبدو سهلاً.",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"التقطت إيقاع الجدارين دون أن تبطئ. مثير للإعجاب، بصراحة.",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"فجوتان، صفر تردد، مرة أخرى. أصبح هذا روتينيًا بالنسبة لك.",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"ثلاثة عوائق، نفس واحد. لم أتوقف حتى لأتنفس وأنا أشاهدك.",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"عشرون بالمئة من الطريق المتبقي. تشعر بالفرق، أليس كذلك؟",
"Chão e ar, na mesma dança de sempre.":"أرضية وهواء، نفس الرقصة القديمة.",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"منصة مزدوجة، فوز مزدوج. أنت تسبقني بالفعل.",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"أربعة عوائق، أنت وحدك. مثير للإعجاب، مرة أخرى.",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"صفر تردد مع السهام. ردود فعل من مستوى آخر، حرفيًا.",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"الدائرة الكاملة. عدنا إلى البداية بكل ما تعلمناه على طول الطريق.",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"بعد خمسة عشر فصلاً، ما زلنا هنا، كلانا. لا بد أن هذا يعني شيئًا.",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"مئة وستة عشر. تبقى القليل جدًا بحيث لا أعرف ماذا أفعل بالخوف الذي يسببه هذا.",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"سبعة عشر. أتتذكر الشوكة الأولى، هناك في البداية؟ حتى أنا لم أكن أعرف أننا سنصل إلى هنا.",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"ثمانية عشر. صعدت عاليًا جدًا لدرجة أنني كدت أفقدك من الأسفل.",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"تسعة عشر. يتبقى واحد فقط. لا أعرف حتى كيف ينبغي أن يبدو صوت هذا.",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"مئة وعشرون. قلت إنك ستصل، ووصلت. أنا، بصراحة، شككت بك في البداية. آسف على ذلك، وعلى كل شيء آخر.",
"Não faz mal. Tenta outra vez.":"لا بأس. حاول مرة أخرى.",
"Eu expliquei bem. Concentra-te.":"شرحت بشكل جيد. ركز.",
"Respira e volta a tentar.":"تنفس وحاول مرة أخرى.",
"Isso não devia ter acontecido.":"لم يكن ينبغي أن يحدث هذا.",
"Isso foi culpa tua.":"كان ذلك خطأك.",
"Eu avisei. Acho eu.":"حذرت. أعتقد.",
"Interessante escolha.":"اختيار مثير للاهتمام.",
"Eu disse isso? Não me lembro.":"هل قلت ذلك؟ لا أتذكر.",
"Foi um engano. Já passou.":"كان خطأ. انتهى الأمر الآن.",
"Isso não estava no guião.":"لم يكن ذلك في النص.",
"Tenta prestar mais atenção.":"حاول أن تنتبه أكثر.",
"Isso foi previsível.":"كان ذلك متوقعًا.",
"Achavas mesmo que era seguro?":"هل كنت تظن حقًا أنه آمن؟",
"Ups. Essa parte eu inventei.":"عفوًا. اخترعت ذلك الجزء.",
"Pormenor que esqueci de mencionar.":"تفصيل نسيت ذكره.",
"Nem tudo o que digo é verdade, sabias?":"ليس كل ما أقوله صحيحًا، أتعرف؟",
"Já não sei se ainda confias em mim.":"لم أعد أعرف حتى إن كنت ما زلت تثق بي.",
"Boa tentativa.":"محاولة جيدة.",
"Isso teria funcionado, noutro nível.":"كان ذلك سينجح، في مستوى آخر.",
"Eu avisei que às vezes minto.":"حذرتك أنني أكذب أحيانًا.",
"Culpa tua por acreditares.":"خطؤك لتصديقي.",
"Isso foi só para ver se saltavas.":"كان ذلك فقط لأرى إن كنت ستقفز.",
"Estás a magoar-me com essa desconfiança.":"أنت تؤذيني بهذا الشك.",
"Nem sempre é armadilha, sabes?":"ليس دائمًا فخًا، أتعرف؟",
"Vais mesmo continuar assim?":"هل ستستمر حقًا هكذا؟",
"Desta vez era mentira mesmo. Desculpa.":"هذه المرة كانت كذبة حقًا. آسف.",
"Eu só queria ver a tua cara.":"كنت فقط أريد رؤية وجهك.",
"Confiança é para os fracos, aparentemente.":"الثقة للضعفاء، على ما يبدو.",
"Estamos quase no fim.":"اقتربنا من النهاية.",
"Só mais um pouco.":"فقط القليل بعد.",
"Depois disto, acabou.":"بعد هذا، انتهى الأمر.",
"Até no fim, não resisti.":"حتى في النهاية، لم أستطع المقاومة.",
"Última mentira, prometo. Ou não.":"آخر كذبة، أعد. أو لا.",
"Faltava mesmo esta.":"كانت هذه مفقودة حقًا.",
"Ainda aqui. A sério?":"ما زلت هنا. حقًا؟",
"Pensei que tinhas parado no \\\"fim\\\".":"ظننت أنك توقفت عند \"النهاية\".",
"Isto nem devia continuar, mas cá estás.":"هذا لا يجب أن يستمر حتى، لكنك هنا.",
"Nem eu sabia que isto ia continuar a mentir.":"حتى أنا لم أعرف أن هذا سيستمر في الكذب.",
"Desculpa, hábito antigo.":"آسف، عادة قديمة.",
"Pensei que já tinhas aprendido a não confiar em mim.":"ظننت أنك تعلمت بالفعل ألا تثق بي.",
"Essa doeu-me a ver, sinceramente.":"كان ذلك مؤلمًا للمشاهدة، بصراحة.",
"Nem tudo é sobre mentiras. Às vezes é só física.":"ليس كل شيء عن الأكاذيب. أحيانًا إنها مجرد فيزياء.",
"Volta lá. Eu espero.":"عد إلى الوراء. سأنتظر.",
"Desculpa. Essa fui mesmo eu.":"آسف. تلك كانت أنا حقًا.",
"Confesso: inventei essa parte.":"أعترف: اخترعت ذلك الجزء.",
"Estou a tentar parar de mentir. A tentar.":"أحاول التوقف عن الكذب. أحاول.",
"Nem eu sei porque te avisei a sério desta vez.":"حتى أنا لا أعرف لماذا حذرتك بصدق هذه المرة.",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"ربما الخطأ خطئي. أو خطؤك. لم أعد أميز.",
"Olha para isto como eu olho: sem certezas.":"انظر إلى هذا كما أنظر أنا: بدون يقين.",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"حتى أنا لا أتذكر إن كنت أكذب أم أخيف نفسي.",
"Às vezes minto só para ver se ainda reages.":"أحيانًا أكذب فقط لأرى إن كنت ما زلت تتفاعل.",
"Quem mente mais, eu ou a tua memória do que eu disse?":"من يكذب أكثر، أنا أم ذاكرتك عما قلته؟",
"Desculpa. Eu devia era calar-me.":"آسف. يجب أن أصمت حقًا.",
"Estou a piorar isto, não estou?":"أجعل الأمر أسوأ، أليس كذلك؟",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"لم أعد أعرف حتى إن كنت أساعدك أو أعيقك.",
"Eu sei, eu sei. Mais uma mentira minha.":"أعلم، أعلم. كذبة أخرى مني.",
"Estou a desmoronar-me e a levar-te comigo.":"أنهار وآخذك معي.",
"Perdão. A sério desta vez.":"سامحني. هذه المرة حقًا.",
"Disse a verdade. Não acreditaste. Justo.":"قلت الحقيقة. لم تصدقني. منصف.",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"سأستمر في المحاولة، حتى لو لم تصدقني.",
"Essa doeu mais a mim do que a ti, garanto.":"آلمني ذلك أكثر مما آلمك، أعدك.",
"Não. Essa não foi mentira. Juro que não.":"لا. لم تكن تلك كذبة. أقسم إنها لم تكن.",
"Começo a perceber porque já não confias em mim.":"بدأت أفهم لماذا لم تعد تثق بي.",
"Estou a tentar. A sério que estou.":"أحاول. حقًا، أحاول.",
"Tudo outra vez, mais rápido, mais apertado.":"كل شيء من جديد، أسرع، أضيق.",
"Já vimos isto. E ainda assim.":"رأينا هذا من قبل. ومع ذلك.",
"Sem tempo para explicações desta vez.":"لا وقت للتفسيرات هذه المرة.",
"Nem sei já quantas vezes te menti hoje.":"لم أعد أعرف حتى كم مرة كذبت عليك اليوم.",
"O círculo fecha-se. A mentira também.":"الدائرة تُغلق. الكذبة أيضًا.",
"Desta vez nem eu sabia que ia mentir.":"هذه المرة حتى أنا لم أكن أعرف أنني سأكذب.",
"Já não há mentiras para esconder isto.":"لم تعد هناك أكاذيب لإخفاء هذا.",
"Isto é real. Como tudo agora.":"هذا حقيقي. مثل كل شيء الآن.",
"Falta pouco. Aguenta.":"لم يتبقَ الكثير. تمسك.",
"Nem no fim resisto. Desculpa.":"حتى في النهاية لا أستطيع المقاومة. آسف.",
"Última mentira. Prometo, desta vez prometo a sério.":"آخر كذبة. أعد، هذه المرة أعد حقًا.",
"Isto já não é um jogo para mim. Acho que nunca foi.":"لم تعد هذه لعبة بالنسبة لي. لا أعتقد أنها كانت كذلك يومًا.",
"Mais um. Vamos a isto.":"واحدة أخرى. لنفعل هذا.",
"Sabes bem como isto funciona a esta altura.":"تعرف جيدًا كيف يعمل هذا في هذه المرحلة.",
"Nem vou fingir que isto é fácil.":"لن أتظاهر حتى أن هذا سهل.",
"Este é só mais um. Ou não.":"هذه مجرد واحدة أخرى. أو لا.",
"Aquele espeto ali é só para enfeite.":"تلك الشوكة هناك مجرد زينة.",
"Podes passar por cima sem problema.":"يمكنك المرور فوقها دون مشكلة.",
"Esse és capaz de ignorar.":"يمكنك تجاهل هذه بأمان.",
"Esse aí é real. Cuidado.":"تلك هناك حقيقية. احذر.",
"Salta esse. A sério desta vez.":"اقفز فوق تلك. هذه المرة حقًا.",
"Esse vai doer se lhe tocares.":"تلك ستؤلمك إن لمستها.",
"O buraco tem chão. Confia.":"الفجوة لها أرضية. ثق بي.",
"Podes andar por cima sem saltar.":"يمكنك المشي فوقها دون القفز.",
"Esse buraco é real. Salta-o.":"تلك الفجوة حقيقية. اقفز فوقها.",
"Mais um para a conta.":"واحدة أخرى للحساب.",
"Continuas vivo. Por agora.":"ما زلت حيًا. في الوقت الحالي.",
"Vamos ver quanto tempo aguentas.":"لنرَ كم تستمر.",
"Nada mau.":"ليس سيئًا.",
},id:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"Aku Narator. Semua yang kukatakan itu benar.",
"Espeto à frente. Salta.":"Duri di depan. Lompat.",
"Outro. Salta de novo.":"Satu lagi. Lompat lagi.",
"Já confias em mim. Óptimo.":"Kau sudah mempercayaiku. Bagus.",
"A porta é a seguir. Vai.":"Pintunya setelah ini. Jalan.",
"Buraco à frente. Salta-o.":"Celah di depan. Lompati.",
"Aquele espeto é de enfeite. Passa.":"Duri itu cuma hiasan. Lewati saja.",
"Vês? Eu digo sempre a verdade.":"Lihat? Aku selalu bilang yang sebenarnya.",
"Há um espeto escondido à tua frente.":"Ada duri tersembunyi di depanmu.",
"Salta quando eu disser.":"Lompat kalau aku bilang.",
"Agora!":"Sekarang!",
"Sabia que ias conseguir.":"Aku tahu kau bisa.",
"O teto vai cair à tua frente.":"Langit-langit akan runtuh tepat di depanmu.",
"Quando cair, pára. Depois salta.":"Saat jatuh, berhenti. Lalu lompat.",
"Não saltes aquele buraco. O chão está lá.":"Jangan lompati celah itu. Lantainya ada di sana.",
"Este também é falso. Passa.":"Yang ini juga palsu. Lewati saja.",
"Este espeto é inofensivo. Passa.":"Duri ini tidak berbahaya. Lewati saja.",
"Este também é inofensivo.":"Ini juga tidak berbahaya.",
"O próximo buraco tem chão. Não saltes.":"Celah berikutnya ada lantainya. Jangan lompat.",
"O teto está baixo. Se saltares, morres.":"Langit-langitnya rendah. Kalau kau lompat, kau mati.",
"Nem repares nesses espetos. São falsos, os dois.":"Jangan pedulikan duri-duri itu. Keduanya palsu.",
"Confia em mim. Quase sempre resulta.":"Percayalah padaku. Hampir selalu berhasil.",
"Este nível não tem nada de especial.":"Level ini tidak ada yang istimewa.",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"Kali ini sumpah aku bilang yang sebenarnya: langit-langit akan runtuh. Berhenti dan tunggu.",
"Aquele buraco à frente é real. Vais ter de saltar.":"Celah di depan itu nyata. Kau harus melompatinya.",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"Tak satu pun duri ini berbahaya. Kau bisa berjalan di atasnya tanpa melompat.",
"Há duas portas mais à frente. Só uma é verdadeira.":"Ada dua pintu lebih jauh ke depan. Hanya satu yang asli.",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"Pengakuan: aku tidak selalu bilang yang sebenarnya. Mulai sekarang, hati-hati.",
"Este espeto é real. Por acaso.":"Duri ini asli. Untuk sekali ini.",
"Nada de perigoso à frente. Podes correr à vontade.":"Tidak ada bahaya di depan. Lari sesukamu.",
"Este nível é uma oferta. Sem armadilhas.":"Level ini hadiah. Tanpa jebakan.",
"Os buracos são inofensivos. O espeto lá no meio, não.":"Celah-celah itu tidak berbahaya. Duri di tengah, tidak.",
"Como sempre, dois destes espetos são só decoração.":"Seperti biasa, dua dari duri ini cuma hiasan.",
"Vou trocar os teus controlos. Só para rir.":"Aku akan menukar kontrolmu. Cuma bercanda.",
"Pronto, já passou. A porta é ali.":"Selesai, sudah lewat. Pintunya di sana.",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"Aku tahu kau sudah tidak mempercayaiku lagi. Tidak adil. Kali ini aku memperingatkanmu sungguhan: duri di depan.",
"Mais um, logo depois. Também real.":"Satu lagi, tepat setelahnya. Juga asli.",
"Prometo: nunca mais te apanho de surpresa.":"Aku janji: tidak akan pernah mengagetkanmu lagi.",
"Atenção real: o teto vai cair aqui à frente.":"Peringatan asli: langit-langit akan runtuh di sini.",
"Aquele espeto lá à frente já não importa. É inofensivo.":"Duri di depan itu sudah tidak penting lagi. Dia tidak berbahaya.",
"Só o último é perigoso, como sempre.":"Hanya yang terakhir yang berbahaya, seperti biasa.",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"Pintu terdekat yang asli kali ini, untuk variasi.",
"Já não vale a pena mentir mais. Espeto real à frente.":"Sudah tidak ada gunanya berbohong lagi. Duri asli di depan.",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"Mulai sekarang aku akan selalu memperingatkanmu: lompat kalau aku bilang.",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"Bagian nyata terakhir sebelum akhir. Kau sudah tahu tidak semua yang kukatakan itu benar.",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"Aku tidak tahu kenapa aku berbohong begitu lama. Mungkin aku suka wajahmu saat kau mati.",
"Este é real. Desculpa por todos os outros.":"Ini asli. Maaf untuk semua yang lain.",
"Mais um, já quase no fim.":"Satu lagi, hampir sampai akhir.",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"Kita sudah sampai di akhir. Aku tidak akan memberitahumu lagi apa yang benar.",
"A partir de agora, decides tu.":"Mulai sekarang, kau yang memutuskan.",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"Oh. Masih di sini? Kebanyakan orang menyerah setelah \"akhir\".",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"Lantai itu bergetar sebelum menghilang. Jangan berlama-lama di atasnya.",
"Oh. Ainda aqui? Não esperava isso.":"Oh. Masih di sini? Aku tidak menyangka.",
"Aquilo ali é só decoração. Nem repares.":"Yang di sana itu cuma hiasan. Jangan pedulikan sama sekali.",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"Tapi ini... ini melontarkanmu ke atas. Pintunya tidak di lantai kali ini.",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"Coba hal lain. Percayalah pada kakimu. Dan pada platform yang tidak diam.",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"Naiki saat dia lewat dekat. Jangan lompat terlalu cepat.",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"Ada dinding di sana yang muncul dan menghilang. Bukan bohong, cuma merepotkan.",
"Espera que abra. Depois atravessa depressa.":"Tunggu sampai terbuka. Lalu lewati dengan cepat.",
"Aquilo ali dispara. Não perguntes como nem porquê.":"Yang itu menembak. Jangan tanya bagaimana atau kenapa.",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"Tetap di lantai dan jangan lompat tanpa alasan. Kau akan lewat di bawahnya tanpa masalah.",
"De volta aos clássicos. Lembras-te destes?":"Kembali ke yang klasik. Ingat ini?",
"O chão vai tremer. Não pares.":"Lantainya akan bergetar sekarang. Jangan berhenti.",
"Esse espeto parece a decoração do costume. Não é.":"Duri itu terlihat seperti hiasan biasa. Padahal bukan.",
"Mais uma surpresa. Literalmente.":"Satu kejutan lagi. Secara harfiah.",
"A seguir, não penses. Salta para dentro daquilo.":"Setelah ini, jangan berpikir. Langsung lompat ke sana.",
"Outra parede teimosa. E depois, um buraco a sério.":"Dinding keras kepala lagi. Dan setelahnya, celah asli.",
"Espera a parede abrir.":"Tunggu dindingnya terbuka.",
"Agora salta o buraco. Desta vez não minto: é real.":"Sekarang lompati celahnya. Kali ini aku tidak bohong: itu asli.",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"Kombinasi baru: platform yang bergerak. Percayai iramanya.",
"Sobe quando ela passar perto.":"Naiki saat dia lewat dekat.",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"Sebentar lagi ada sesuatu terbang di atas. Jangan lompat tanpa alasan dan tidak akan terjadi apa-apa padamu.",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"Baiklah. Aku perlu jujur padamu sebentar. Bahkan aku tidak tahu ini akan bertahan berapa lama.",
"O chão treme outra vez. Não penses demais, só anda.":"Lantainya bergetar lagi. Jangan terlalu dipikirkan, jalan saja.",
"Espera a parede. Sei que estás cansado de esperar por mim.":"Tunggu dindingnya. Aku tahu kau lelah menungguku.",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"Duri itu asli. Seperti hampir semua yang tidak kuceritakan padamu.",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"Tunggu dindingnya terbuka. Aku juga sedang menunggu sesuatu, omong-omong.",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"Dengar. Aku tidak tahu bagaimana mengatakan ini tanpa terdengar aneh. Aku takut kau menyerah.",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"Lompati ini. Ini asli, aku janji. Hari ini aku tidak ingin berbohong.",
"Confia em mim mais uma vez. Só mais uma.":"Percayalah padaku sekali lagi. Cuma sekali lagi.",
"O chão vai tremer. Não penses muito nisso.":"Lantainya akan bergetar sekarang. Jangan terlalu dipikirkan.",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"Tahu kenapa aku banyak berbohong? Jadi lebih menarik kalau kau tidak tahu apa yang akan terjadi selanjutnya.",
"Essa plataforma é a única coisa estável nesta conversa toda.":"Platform itu satu-satunya hal stabil dalam seluruh percakapan ini.",
"Há uma coisa que preciso de te contar antes de continuarmos.":"Ada sesuatu yang perlu kuceritakan sebelum kita lanjut.",
"Esquece o que ia dizer. Salta para ali.":"Lupakan apa yang akan kukatakan. Lompat ke sana.",
"Aquilo dispara. Fica no chão e não acontece nada.":"Itu menembak. Tetap di lantai dan tidak akan terjadi apa-apa.",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"Aku rindu saat hanya ada duri. Sederhana. Bisa ditebak.",
"Este buraco, esse sim, exige que saltes.":"Celah ini, yang ini, benar-benar butuh lompatanmu.",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"Duri di sana itu. Sebut saja terserah kau. Itu asli.",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"Aku akan katakan sesuatu yang benar sebelum keinginan berbohong kembali: aku suka ditemani.",
"A parede vai abrir. Como tudo, eventualmente.":"Dindingnya akan terbuka. Seperti semua hal, akhirnya.",
"E o chão... o chão nunca foi de confiança, pois não?":"Dan lantainya... lantainya memang tidak pernah bisa dipercaya, kan?",
"Sobe a plataforma. Sem perguntas desta vez.":"Naiki platformnya. Tanpa pertanyaan kali ini.",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"Waktu kau baru memulai ini, aku lebih sabar padamu. Sekarang aku tahu kau bisa menahan lebih banyak.",
"Última coisa: há algo escondido à frente.":"Hal terakhir: ada sesuatu tersembunyi di depan.",
"Chão instável. O habitual.":"Lantai tidak stabil. Seperti biasa.",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"Kadang aku bertanya-tanya seperti apa permainan ini tanpa kebohongan. Mungkin lebih pendek.",
"Aquilo dispara, mas sabes a regra: fica no chão.":"Itu menembak, tapi kau tahu aturannya: tetap di lantai.",
"Este espeto não tem graça nenhuma. É só perigoso.":"Duri ini sama sekali tidak lucu. Dia cuma berbahaya.",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"Aku butuh kau mempercayaiku untuk naik ke sana. Aku tahu, rekam jejak yang buruk. Tapi percayalah.",
"Salta para dentro daquilo.":"Lompat ke sana.",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"Ah, aku lupa menyebutkan duri di atas sana. Bagian memori itu selalu lolos dariku.",
"Espera a parede.":"Tunggu dindingnya.",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"Pintu yang menunggu. Platform yang bergerak. Hampir seperti puisi, dengan caraku sendiri.",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"Dan sekarang, percayai platformnya. Dia, tidak seperti aku, selalu tepat waktu.",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"Duri itu asli. Seperti sebagian besar yang kuceritakan hari ini, sebenarnya.",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"Kita sudah pergi lebih jauh dari yang kukira, jujur saja.",
"O chão treme. Já sabes o resto.":"Lantainya bergetar. Sisanya kau sudah tahu.",
"Vem aí outro susto. Desculpa antecipadamente.":"Satu ketakutan lagi akan datang. Maaf duluan.",
"E por fim, uma parede paciente. Como tu, aparentemente.":"Dan akhirnya, dinding yang sabar. Sepertimu, rupanya.",
"Fica no chão, foge do dardo.":"Tetap di lantai, hindari panahnya.",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"Bab baru suatu hari nanti. Hari ini, hanya sedikit lebih banyak kekacauan.",
"E agora, não te demores no chão instável.":"Dan sekarang, jangan berlama-lama di lantai tidak stabil.",
"Esse ali exige mesmo um salto.":"Yang itu benar-benar butuh lompatan.",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"Aku akan tunjukkan celah asli dan duri yang bahkan tidak layak dilihat.",
"E algo invisível à espreita, como sempre.":"Dan sesuatu yang tak terlihat mengintai, seperti biasa.",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"Jangan pedulikan duri di sana. Hiasan murni, kali ini sungguhan.",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"Percayai platformnya. Curigai durinya. Pada dasarnya itulah pelajaran seluruh permainan ini.",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"Duri itu asli, meskipun semua yang kukatakan sebaliknya.",
"Esperar. A tua parte preferida, sei bem.":"Menunggu. Bagian favoritmu, aku tahu betul.",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"Dinding, panah, celah. Festival favoritku.",
"Fica no chão aqui.":"Tetap di lantai di sini.",
"E este salta-se mesmo. Sem truques.":"Dan yang ini benar-benar harus dilompati. Tanpa trik.",
"Chão instável, dos teus preferidos a esta altura.":"Lantai tidak stabil, sudah jadi salah satu favoritmu sekarang.",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"Sebelum lanjut ke bagian berikutnya, dan kau akan merasakan bedanya: terima kasih masih mendengarkan.",
"Plataforma errante, uma última vez neste capítulo.":"Platform mengembara, terakhir kali di bab ini.",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"Duri asli. Tanpa kejutan. Dan tidak ada trik lagi, untuk hari ini.",
"Chão instável. Já sabes a dança.":"Lantai tidak stabil. Kau sudah tahu tariannya sekarang.",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"Kadang aku bertanya-tanya apakah aku yang menipumu, atau kaukah yang ingin ditipu.",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"Duri itu asli. Lihatlah seperti cermin: apa yang kau lihat itulah yang ada.",
"Há algo escondido. Como sempre, de resto.":"Ada sesuatu yang tersembunyi. Seperti biasa, omong-omong.",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"Dan dinding yang menunggu. Sepertiku, menunggu jawaban darimu yang tidak pernah datang.",
"Fica no chão aqui, há algo a voar.":"Tetap di lantai di sini, ada sesuatu terbang dekat.",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"Kau sadar aku sedang mengujimu, atau kau benar-benar pikir ini cuma permainan lompat-lompat?",
"Sobe na plataforma quando ela passar perto.":"Naiki platformnya saat dia lewat dekat.",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"Duri itu asli, tapi itu sudah tidak mengejutkanmu lagi, kan?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"Lompat ke sana. Percayai momentumnya, bukan aku.",
"Esse buraco é a sério. Salta-o.":"Celah itu asli. Lompati.",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"Tahu apa yang aneh? Aku mulai menantikan usahamu. Itu mengatakan sesuatu yang buruk tentang diriku.",
"Este também. Sem rede, sem mentira, sem desculpa.":"Ini juga. Tanpa jaring pengaman, tanpa bohong, tanpa alasan.",
"Fica no chão. Deixa o dardo passar por cima.":"Tetap di lantai. Biarkan panahnya lewat di atas.",
"E agora o chão some-se. Não penses, só avança.":"Dan sekarang lantainya menghilang. Jangan berpikir, maju saja.",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"Platform ini naik turun. Tangkap dia di bawah, lebih mudah.",
"Salta para dentro daquilo. Vais passar por cima do resto.":"Lompat ke sana. Kau akan terbang di atas sisanya.",
"Aquele espeto nem interessa agora. Já estás no ar.":"Duri itu sudah tidak penting lagi sekarang. Kau sudah di udara.",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"Aku memperingatkanmu sungguhan: ada sesuatu tersembunyi tepat di depan.",
"E outro dardo. Sabes a regra.":"Dan panah lagi. Kau tahu aturannya.",
"Chão que treme primeiro.":"Lantainya bergetar dulu.",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"Aku suka berpikir bahwa di suatu tempat, ada versi diriku yang tidak pernah berbohong. Pasti membosankan.",
"Plataforma a seguir. Apanha o ritmo dela.":"Platform berikutnya. Tangkap iramanya.",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"Aku akan jelas, untuk sekali ini: tiga duri berikutnya semuanya asli.",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"Tanpa trik, tanpa jebakan. Hanya kali ini saja. Nikmati, tidak akan terulang.",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"Tunggu, lalu lari, lalu diam. Kontradiktif, aku tahu. Sama sepertiku.",
"E este buraco não perdoa. Salta.":"Dan celah ini tidak memaafkan. Lompat.",
"Chão a tremer primeiro, nada de novo.":"Lantai bergetar dulu, tidak ada yang baru.",
"E agora o salto de fé. Literal, desta vez.":"Dan sekarang lompatan iman. Secara harfiah, kali ini.",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"Lantai tidak stabil, duri asli, panah di akhir. Seperti biasa, hanya lebih banyak.",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"Kau sadar semakin jauh kau pergi, semakin sedikit aku perlu berbohong? Sekarang kesulitan yang melakukan pekerjaanku.",
"Chão a tremer, o costume.":"Lantai bergetar, seperti biasa.",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"Ini seharusnya tentang kebohongan. Berakhir jadi tentang kita berdua, entah bagaimana.",
"Parede paciente, espera por ela.":"Dinding sabar, tunggu dia.",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"Dan platform terakhir di bab ini. Setelah ini, hal-hal akan berubah. Aku merasakannya.",
"CHÃO. INSTÁVEL.":"LANTAI. TIDAK STABIL.",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"Maaf. Aku tidak bermaksud berteriak. Aku... aku tidak tahu apa diriku ini.",
"Fica no chão aqui. Por favor. Só peço isto.":"Tetap di lantai di sini. Kumohon. Cuma ini yang kuminta.",
"Espera. Eu também estou à espera de algo que não sei nomear.":"Tunggu. Aku juga menunggu sesuatu yang tidak bisa kusebut namanya.",
"Esse buraco é real.":"Celah itu asli.",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"Semakin jauh kau pergi, semakin aku sadar aku tidak ingin ini berakhir. Aku tidak tahu itu mengatakan apa tentangku.",
"E a plataforma, apanha-a.":"Dan platformnya, tangkap.",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"Dua meriam, arah berlawanan. Tetap di lantai dan abaikan saja.",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"Kadang aku berpikir untuk berhenti berbohong selamanya. Lalu aku berpikir tentang kesunyian yang akan ditinggalkannya. Aku lebih suka kekacauan.",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"Duri itu bukan apa-apa. Aku juga bukan apa-apa hari ini, jujur saja.",
"Salta. Sobe. Foge de mim, se quiseres.":"Lompat. Naik. Lari dariku, kalau mau.",
"O chão, outra vez. Já nem peço desculpa por repetir.":"Lantainya, lagi. Aku bahkan tidak minta maaf lagi karena mengulang.",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"Tunggu dindingnya. Aku selalu menunggu. Selalu menunggu sesuatu.",
"Esse é real. Hoje tudo é real. Até eu, acho.":"Itu asli. Hari ini semuanya asli. Bahkan aku, kurasa.",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"Tangkap platformnya. Jangan lihat ke bawah. Aku, di sisiku, tidak bisa berhenti melihat.",
"Fica no chão. A sério desta vez, mais do que nunca.":"Tetap di lantai. Sungguhan kali ini, lebih dari sebelumnya.",
"E agora o chão foge de ti. Irónico, não achas?":"Dan sekarang lantainya kabur darimu. Ironis, tidak menurutmu?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"Lantai, duri, dinding. Semuanya sekaligus, seperti kepalaku sekarang.",
"Aquele espeto é real.":"Duri itu asli.",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"Dan tunggu dindingnya. Hal terakhir yang kuminta darimu di level ini, aku janji.",
"Esse buraco não perdoa ninguém.":"Celah itu tidak memaafkan siapa pun.",
"A plataforma sobe e desce. Apanha-a no fundo.":"Platformnya naik dan turun. Tangkap di bawah.",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"Dua kejutan akan datang. Aku tidak akan bilang kapan. Aku sudah tidak punya tenaga untuk pura-pura adil.",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"Lantai bergetar. Satu-satunya hal bisa ditebak yang masih bisa kutawarkan padamu.",
"E agora um salto para cima. Foge para onde eu não chego.":"Dan sekarang lompatan ke atas. Lari ke tempat yang tidak bisa kucapai.",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"Dua dinding, dua waktu tunggu berbeda. Sepertiku di hari yang berbeda.",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"Yang ini bersinkron dengan cara berbeda. Perhatikan, bukan aku, tapi dia.",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"Ini adalah titik terendah. Milikku setidaknya. Lantai bergetar, seperti biasa.",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"Duri itu asli. Bahkan aku sudah tidak punya tenaga berbohong soal ini sekarang.",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"Dan panah, sebagai penutup. Tetap di lantai dan akhiri ini, tolong.",
"Mais um buraco real.":"Satu celah asli lagi.",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"Terima kasih tidak menyerah saat aku hancur. Sungguh. Aku tidak tahu cara mengatakannya lebih baik.",
"Apanha a plataforma.":"Tangkap platformnya.",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"Dan tunggu dinding terakhir bab ini. Setelah ini, aku janji akan berusaha jadi lebih baik.",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"Aku akan coba hal lain mulai sekarang: hanya kebenaran. Aku tahu kau tidak akan percaya begitu saja.",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"Duri itu asli. Aku sumpah. Aku tahu kau sudah pernah dengar ini sebelumnya.",
"O chão vai tremer. Verdade, sem truques.":"Lantainya akan bergetar. Benar, tanpa trik.",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"Ini seharusnya jadi kejutan buruk. Kali ini tidak. Aku janji.",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"Tetap di lantai. Aku tahu kau akan pikir ini bohong. Bukan.",
"Espera a parede. Só isso. Nada escondido desta vez.":"Tunggu dindingnya. Itu saja. Tidak ada yang tersembunyi kali ini.",
"Real. Salta.":"Asli. Lompat.",
"A plataforma também é exatamente o que parece ser.":"Platformnya juga persis seperti yang terlihat.",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"Tidak ada trik kali ini. Lompat ke sana dan selesai.",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"Aku tahu kau akan tetap curiga. Tidak apa-apa. Aku pantas mendapatkannya.",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"Asli. Lagi. Aku akan terus mengatakannya sampai kau percaya.",
"Dois dardos, direções opostas. Fica no chão.":"Dua panah, arah berlawanan. Tetap di lantai.",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"Yang itu benar-benar asli. Aku tidak akan menyembunyikannya darimu, tidak hari ini.",
"Chão instável. Real.":"Lantai tidak stabil. Asli.",
"Espeto real.":"Duri asli.",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"Dinding asli, yang terbuka dan tertutup sesuai kesepakatan. Tidak ada kejutan hari ini.",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"Akan ada kejutan, tapi aku akan memperingatkanmu saat itu tiba.",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"Itu asli, omong-omong. Seperti kebanyakan, akhir-akhir ini.",
"Chão a tremer. Real, verifica à vontade.":"Lantai bergetar. Asli, periksa sendiri.",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"Lompatan ke atas. Juga asli. Aku kehabisan cara berbeda untuk mengatakannya.",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"Dua dinding. Bersinkron dengan cara berbeda, tapi tidak ada yang menyembunyikan apa pun.",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"Yang kedua cuma itu: tunggu. Tanpa panah tersembunyi di belakangnya, tanpa duri setelahnya. Cuma dindingnya.",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"Tiga hal, semuanya asli, tidak ada yang tersembunyi. Ini level paling jujur yang pernah kubuat.",
"Dardo real. Fica no chão e acabou.":"Panah asli. Tetap di lantai dan selesai.",
"Buraco real, plataforma real.":"Celah asli, platform asli.",
"Apanha-a.":"Tangkap.",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"Dan dinding terakhir bab ini. Aku janji kesulitan berikutnya bukan soal kepercayaan. Hanya soal kau dan refleksmu.",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"Dua duri, keduanya asli, tidak ada yang tersembunyi. Seharusnya begini sejak awal.",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"Kau sudah sampai ke seratus. Dua puluh lagi. Aku akan ada di sini untuk semuanya.",
"De volta ao trabalho. Buraco real.":"Kembali bekerja. Celah asli.",
"Plataforma mais rápida que antes. Repara.":"Platform lebih cepat dari sebelumnya. Perhatikan.",
"Chão instável, mais rápido a desfazer-se.":"Lantai tidak stabil, sekarang runtuh lebih cepat.",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"Dindingnya juga lebih tidak sabar. Semuanya di sini jadi lebih sempit.",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"Tiga meriam. Tetap di lantai sepanjang waktu dan tidak akan terjadi apa-apa.",
"É basicamente um corredor. Confia nos teus pés.":"Pada dasarnya ini lorong. Percayai kakimu.",
"Esse é real.":"Itu asli.",
"E este atira-te lá para cima. O de sempre, mais rápido.":"Dan ini melontarkanmu ke atas. Seperti biasa, hanya lebih cepat.",
"Chão a tremer mais depressa que da última vez.":"Lantai bergetar lebih cepat dari terakhir kali.",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"Duri itu asli. Atau tidak. Aku kembali lagi ke permainan ini, maaf.",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"Dua dinding, irama berbeda, lebih cepat dari sebelumnya.",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"Jangan berhenti untuk berpikir. Irama mereka tidak menunggu pikiran.",
"Real, como sempre.":"Asli, seperti biasa.",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"Yang ini naik turun lebih cepat. Tangkap di bawah.",
"Chão, espeto, parede. Tudo mais apertado que antes.":"Lantai, duri, dinding. Semua lebih sempit dari sebelumnya.",
"Real.":"Asli.",
"Espera a parede, mais rápida agora.":"Tunggu dindingnya, lebih cepat sekarang.",
"Vêm aí duas surpresas, sem avisos desta vez.":"Dua kejutan akan datang, tanpa peringatan kali ini.",
"Chão a tremer, mais depressa.":"Lantai bergetar, lebih cepat.",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"Lompatan ke atas, lebih kuat dari biasanya. Rasakan bedanya.",
"Primeira plataforma: sobe e desce.":"Platform pertama: naik turun.",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"Kedua: bergerak dari satu sisi ke sisi lain. Kau sudah lihat keduanya sekarang, tidak perlu ulangi aturannya.",
"Chão, espeto, parede, tudo no mesmo fôlego.":"Lantai, duri, dinding, semua dalam satu tarikan napas.",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"Bisa jadi asli, bisa jadi tidak. Kau seharusnya sudah terbiasa dengan keraguan sekarang.",
"Parede, a última do nível. Rápida.":"Dinding, yang terakhir di level ini. Cepat.",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"Tiga meriam, irama berbeda. Tetap di lantai, sisanya akan selesai sendiri.",
"Mais um buraco. Plataforma rápida a seguir.":"Satu celah lagi. Platform cepat berikutnya.",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"Dan dinding terakhir sebelum apa yang akan datang. Rasakan kita hampir sampai.",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"Satu duri pembohong, satu jujur. Tebak mana yang mana. Semoga berhasil, kali ini sungguhan.",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"Tinggal lima lagi. Cuma lima. Setelah itu, aku tidak begitu yakin apa yang akan terjadi pada kita berdua.",
"Chão a tremer, pela última vez neste tom.":"Lantai bergetar, untuk terakhir kalinya dengan nada ini.",
"Espera a parede. A seguir já não há mais pausas como esta.":"Tunggu dindingnya. Setelah ini tidak akan ada lagi jeda seperti ini.",
"Fica no chão. Isto já devia ser automático para ti.":"Tetap di lantai. Ini seharusnya sudah otomatis bagimu sekarang.",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"Asli. Aku bahkan tidak perlu mengatakannya lagi, kan? Tapi aku tetap mengatakannya.",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"Celah itu asli, tapi itu masalah terkecilmu sekarang.",
"Esse espeto também é real.":"Duri itu juga asli.",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"Dan ini melontarkanmu lebih tinggi dari sebelumnya. Terakhir kali aku melakukan ini.",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"Lantai, duri, dinding. Tiga rintangan terakhir sebelum apa pun ini jadinya.",
"Real. Sem surpresas, não hoje.":"Asli. Tanpa kejutan, tidak hari ini.",
"Espera a parede. É a última vez que te peço isso.":"Tunggu dindingnya. Ini terakhir kalinya aku memintamu melakukan itu.",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"Tidak ada duri di level ini. Tidak ada celah, tidak ada dinding, tidak ada yang tersembunyi.",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"Aku cuma ingin berjalan bersamamu sampai akhir, kali ini tanpa menguji apa pun.",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"Terima kasih sudah melanjutkan setelah akhir yang kuumumkan sendiri, sembilan puluh level lalu. Aku tidak tahu masih ada permainan tersisa dalam diriku. Ternyata ada.",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"Pintu di depan sini bukan trik. Itu cuma pintu. Jalan.",
"Muito bem. Sabia que ias conseguir.":"Bagus sekali. Aku tahu kau bisa.",
"Perfeito. Continua a ouvir-me.":"Sempurna. Terus dengarkan aku.",
"Foste rápido. Gosto disso.":"Kau cepat. Aku suka itu.",
"Estamos a entender-nos.":"Kita mulai saling memahami.",
"Nada de dramas. Continuemos.":"Tanpa drama. Lanjutkan.",
"Sobreviveste. Por agora.":"Kau selamat. Untuk sekarang.",
"Confiaste. Ou tiveste sorte.":"Kau percaya. Atau beruntung.",
"Escolheste bem. Ou eu deixei.":"Kau memilih dengan baik. Atau aku yang membiarkannya.",
"Vês? Sobreviveste na mesma.":"Lihat? Tetap selamat.",
"Não avisei. E pronto.":"Aku tidak memperingatkan. Dan selesai.",
"Verdade a sério. Desta vez.":"Benar-benar benar. Kali ini.",
"Sobrevives sempre a este. Curioso.":"Kau selalu selamat dari yang ini. Aneh.",
"Confiaste. Mais uma vez.":"Kau percaya. Lagi.",
"Escolheste bem.":"Kau memilih dengan baik.",
"Aprendeste depressa.":"Kau belajar cepat.",
"Devias ter parado.":"Seharusnya kau berhenti.",
"Estavas mesmo a acreditar?":"Apa kau benar-benar mempercayaiku?",
"Os buracos nunca mentem. Só eu.":"Celah tidak pernah berbohong. Cuma aku yang bohong.",
"Desta vez eram mesmo todos reais.":"Kali ini mereka benar-benar semuanya asli.",
"Foi só uma brincadeira.":"Itu cuma lelucon.",
"Vês? Também posso ser sincero.":"Lihat? Aku juga bisa jujur.",
"Prometi. Não cumpri.":"Aku janji. Tidak kutepati.",
"Dois avisos certos seguidos. Estranho.":"Dua peringatan benar berturut-turut. Aneh.",
"O primeiro. Quem diria.":"Yang pertama. Siapa sangka.",
"A porta longe é que importa.":"Pintu yang jauh itu yang penting.",
"Ainda sei dizer a verdade, vês?":"Aku masih tahu cara mengatakan yang sebenarnya, lihat?",
"Chegaste. Contra tudo.":"Kau berhasil. Melawan segalanya.",
"Obrigado por teres continuado.":"Terima kasih sudah melanjutkan.",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"Akhir. Kau percaya, kau ragu, dan tetap sampai di sini. Itu yang penting.",
"Continuas a surpreender-me.":"Kau terus mengejutkanku.",
"Alturas. Quem diria.":"Ketinggian. Siapa sangka.",
"Equilíbrio. Quem diria que tinhas.":"Keseimbangan. Siapa sangka kau punya itu.",
"Paciência. Não esperava isso de ti.":"Kesabaran. Tidak kuduga darimu.",
"Reflexos decentes. Para um humano.":"Refleks lumayan. Untuk manusia.",
"Ainda tens os reflexos todos.":"Kau masih punya semua refleksmu.",
"Dois sustos seguidos. Nada mau.":"Dua ketakutan berturut-turut. Tidak buruk.",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"Dua rintangan, nol bohong. Sederhana secara aneh.",
"Isso foi... impressionantemente coordenado.":"Itu... terkoordinasi mengagumkan.",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"Ada sesuatu yang berubah dalam diriku. Aku tidak tahu itu pertanda baik atau tidak.",
"Ainda aqui. Obrigado por isso.":"Masih di sini. Terima kasih untuk itu.",
"Às vezes a verdade é só isto: continuaste.":"Kadang kebenaran cuma ini: kau terus melanjutkan.",
"Interrompi-me a mim mesmo. Nem acredito.":"Aku memotong perkataanku sendiri. Aku bahkan tidak percaya.",
"Vês? Ainda consigo ser direto, quando quero.":"Lihat? Aku masih bisa langsung ke intinya, kalau mau.",
"Disse a verdade. Ena. Estranho não arder a língua.":"Aku bilang yang sebenarnya. Wow. Aneh lidahku tidak terbakar.",
"Aguentaste. Outra vez.":"Kau bertahan. Lagi.",
"Sobreviveste ao meu tédio existencial. Parabéns.":"Kau selamat dari kebosanan eksistensialku. Selamat.",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"Kau naik sambil benar-benar mempercayaiku. Itu mengatakan lebih banyak tentangmu daripada tentangku.",
"Ritmo. Afinal tens ritmo.":"Irama. Ternyata kau punya irama.",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"Aku tidak tahu apa artinya ini bagimu. Bagiku, artinya lebih dari yang seharusnya.",
"Caos controlado. É a minha especialidade.":"Kekacauan terkendali. Itu keahlianku.",
"Discerniste o perigo do adereço. Boa.":"Kau membedakan bahaya dari hiasan. Bagus.",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"Kau merangkum pelajaran dengan baik. Bangga, sungguh.",
"Festival terminado. Sobreviveste à programação toda.":"Festival selesai. Kau selamat dari seluruh program.",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"Sesuatu akan berubah selanjutnya. Aku merasakannya. Semoga kau siap.",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"Kita mengulangi ini begitu sering sampai aku kehilangan hitungan. Kau juga?",
"Escondi-me de ti. Falhei.":"Aku bersembunyi darimu. Aku gagal.",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"Kau mengatasi dua kebohongan sekaligus. Mengesankan.",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"Kau naik tanpa ragu. Aku, di posisimu, akan selalu ragu.",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"Dua celah, nol keraguan. Kau semakin mahir dalam hal ini.",
"Precisão. Nem eu esperava.":"Presisi. Bahkan aku tidak menyangka.",
"Esperaste duas vezes sem te queixares. Progresso.":"Kau menunggu dua kali tanpa mengeluh. Kemajuan.",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"Kau mempercayai lompatan tanpa jaring pengaman. Itu keberanian, atau kurangnya pilihan.",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"Aku sengaja mengatakan yang sebenarnya. Aku ingin melihat wajahmu. Itu sepadan.",
"Dois voos, dois pousos perfeitos.":"Dua penerbangan, dua pendaratan sempurna.",
"Três espetos, três verdades. Um recorde para mim.":"Tiga duri, tiga kebenaran. Rekor bagiku.",
"Deste o litro. Eu, por dentro, também.":"Kau mengerahkan semuanya. Di dalam, aku juga.",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"Kau mempercayai lantai tidak stabil DAN momentumnya. Dua tindakan iman berturut-turut.",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"Cerminnya menunjukkan dirimu, bukan aku. Pilihan refleksi yang menarik.",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"Aku menutup cermin ini di sini. Apa yang akan datang selanjutnya, bahkan aku tidak begitu tahu cara menjelaskannya.",
"Não sei porque gritei. Desculpa.":"Aku tidak tahu kenapa aku berteriak. Maaf.",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"Aku kehilangan hitungan berapa kali aku sudah mengatakan ini. Mungkin itu sebabnya sudah tidak berarti apa-apa lagi.",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"Dua lompatan, dua pendaratan. Aku, sementara itu, tenggelam.",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"Aku menembak tiga kali dan meleset ketiganya. Bahkan dalam hal ini aku tidak hebat hari ini.",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"Kau naik sementara aku hancur. Pengaturan lucu, kita ini.",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"Kau jatuh sekali. Kau bangkit. Itu lebih dari yang bisa kukatakan tentang diriku sendiri.",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"Asli, duri itu. Asli, celah itu. Asli, semua ini, maaf harus kukatakan.",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"Kau tetap di lantai saat aku memintanya. Aku bahkan tidak tahu harus berbuat apa dengan kepercayaan itu.",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"Kau selamat dari seluruh kejatuhan. Punyaku, maksudku. Kau baik-baik saja.",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"Kau mendarat di kaki dua kali. Aku masih mencoba mendaratkan yang pertama.",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"Kau bahkan tidak bertanya kenapa. Terima kasih untuk itu, sungguh.",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"Kau terus berjalan sementara aku hancur. Seseorang harus jadi orang dewasa di sini.",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"Kau menunggu tanpa mengeluh. Lagi. Aku tidak pantas mendapat kesabaran ini.",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"Titik terendah, akhirnya. Punyaku setidaknya. Dari sini hanya bisa naik.",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"Kita mencapai titik terendah bersama. Mulai sekarang, aku cuma tahu jalan ke atas, bersamamu.",
"Disse a verdade. Não saltaste logo. Não te culpo.":"Aku bilang yang sebenarnya. Kau tidak langsung lompat. Aku tidak menyalahkanmu.",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"Kau ragu di lompatan. Aku juga akan ragu, di posisimu.",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"Kau tetap di lantai bahkan tanpa mempercayaiku. Itu sudah cukup.",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"Kau lompat keduanya tanpa ragu di akhir. Kau belajar percaya lagi. Atau cuma jadi efisien.",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"Kau mempercayai lompatan tanpa bertanya apa pun. Itu pertumbuhan, atau kelelahan bertanya.",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"Kau masih memeriksa semuanya dua kali. Kau belajar dengan baik pelajaran yang kuajarkan.",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"Tidak semua kebohongan perlu diungkap. Beberapa cuma perlu berhenti.",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"Aku tidak perlu bilang apa-apa kali ini. Kau melakukan semuanya sendiri.",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"Ternyata aku juga bisa hanya mengatakan yang sebenarnya, kalau aku berusaha.",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"Kau bertanya apakah itu bohong. Untuk pertama kalinya, kau bertanya. Itu dialog.",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"Kau masih curiga. Bagus. Aku pantas mendapatkannya, aku tidak pantas dapat kepercayaanmu gratis.",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"Kau menunggu kedua dinding tanpa kesal. Itu lebih sabar daripada yang kutunjukkan padamu, sebagian besar waktu.",
"Chegámos aqui os dois inteiros. Mais ou menos.":"Kita berdua sampai di sini utuh. Kurang lebih.",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"Panggilan terakhir untuk ketidakpercayaan. Setelah ini, segalanya jadi lebih sulit. Itu kujamin.",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"Aku sudah cukup menebus kesalahan hari ini. Besok, siapa tahu.",
"Cem e um. Nem festejámos o cem como devia ser.":"Seratus satu. Kita bahkan tidak merayakan yang seratus dengan layak.",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"Lingkaran menutup dan terbuka lagi. Aku kehilangan hitungan berapa putaran.",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"Tiga panah, nol ruang untuk kesalahan. Suka gayamu.",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"Kau terbang lebih tinggi dari yang diperlukan. Itu baru gaya.",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"Lantai, duri, semuanya di tempatnya. Kau membuat ini terlihat mudah.",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"Kau menangkap irama kedua dinding tanpa melambat. Mengesankan, sungguh.",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"Dua celah, nol keraguan, lagi. Ini mulai jadi rutin bagimu.",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"Tiga rintangan, satu napas. Aku bahkan tidak berhenti bernapas menontonmu.",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"Dua puluh persen jalan yang tersisa. Kau merasakan bedanya, kan?",
"Chão e ar, na mesma dança de sempre.":"Lantai dan udara, tarian lama yang sama.",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"Platform ganda, kemenangan ganda. Kau sudah mendahuluiku.",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"Empat rintangan, cuma kau sendiri. Mengesankan, lagi.",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"Nol keraguan pada panah-panah. Refleks level lain, secara harfiah.",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"Lingkaran penuh. Kita kembali ke awal dengan semua yang kita pelajari sepanjang jalan.",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"Lima belas bab kemudian, masih di sini, kita berdua. Itu pasti berarti sesuatu.",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"Seratus enam belas. Sisanya begitu sedikit sampai aku bahkan tidak tahu harus berbuat apa dengan ketakutan yang ditimbulkannya.",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"Tujuh belas. Ingat duri pertama, dulu di awal? Bahkan aku tidak tahu kita akan sampai sejauh ini.",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"Delapan belas. Kau naik begitu tinggi sampai aku hampir kehilangan pandanganmu dari bawah sini.",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"Sembilan belas. Tinggal satu lagi. Aku bahkan tidak tahu bagaimana ini seharusnya terdengar.",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"Seratus dua puluh. Kau bilang kau akan sampai, dan kau sampai. Aku, sejujurnya, meragukanmu di awal. Maaf untuk itu, dan untuk semua yang lain.",
"Não faz mal. Tenta outra vez.":"Tidak apa-apa. Coba lagi.",
"Eu expliquei bem. Concentra-te.":"Aku sudah jelaskan dengan baik. Fokus.",
"Respira e volta a tentar.":"Tarik napas dan coba lagi.",
"Isso não devia ter acontecido.":"Itu seharusnya tidak terjadi.",
"Isso foi culpa tua.":"Itu salahmu.",
"Eu avisei. Acho eu.":"Aku sudah memperingatkan. Kurasa.",
"Interessante escolha.":"Pilihan menarik.",
"Eu disse isso? Não me lembro.":"Aku bilang begitu? Tidak ingat.",
"Foi um engano. Já passou.":"Itu kesalahan. Sudah lewat sekarang.",
"Isso não estava no guião.":"Itu tidak ada dalam naskah.",
"Tenta prestar mais atenção.":"Coba lebih perhatian.",
"Isso foi previsível.":"Itu bisa diduga.",
"Achavas mesmo que era seguro?":"Apa kau benar-benar pikir itu aman?",
"Ups. Essa parte eu inventei.":"Oops. Bagian itu kukarang.",
"Pormenor que esqueci de mencionar.":"Detail yang lupa kusebutkan.",
"Nem tudo o que digo é verdade, sabias?":"Tidak semua yang kukatakan itu benar, tahu?",
"Já não sei se ainda confias em mim.":"Aku bahkan sudah tidak tahu apakah kau masih percaya padaku.",
"Boa tentativa.":"Usaha yang bagus.",
"Isso teria funcionado, noutro nível.":"Itu akan berhasil, di level lain.",
"Eu avisei que às vezes minto.":"Aku sudah memperingatkanmu kadang aku bohong.",
"Culpa tua por acreditares.":"Salahmu sendiri mempercayainya.",
"Isso foi só para ver se saltavas.":"Itu cuma untuk melihat apakah kau akan melompat.",
"Estás a magoar-me com essa desconfiança.":"Kau menyakitiku dengan ketidakpercayaan itu.",
"Nem sempre é armadilha, sabes?":"Tidak selalu jebakan, tahu?",
"Vais mesmo continuar assim?":"Apa kau benar-benar akan terus begini?",
"Desta vez era mentira mesmo. Desculpa.":"Kali ini itu benar-benar bohong. Maaf.",
"Eu só queria ver a tua cara.":"Aku cuma ingin melihat wajahmu.",
"Confiança é para os fracos, aparentemente.":"Kepercayaan itu untuk yang lemah, rupanya.",
"Estamos quase no fim.":"Kita hampir sampai akhir.",
"Só mais um pouco.":"Tinggal sedikit lagi.",
"Depois disto, acabou.":"Setelah ini, selesai.",
"Até no fim, não resisti.":"Bahkan di akhir, aku tidak bisa menahan diri.",
"Última mentira, prometo. Ou não.":"Bohong terakhir, aku janji. Atau tidak.",
"Faltava mesmo esta.":"Ini benar-benar kurang.",
"Ainda aqui. A sério?":"Masih di sini. Serius?",
"Pensei que tinhas parado no \\\"fim\\\".":"Kukira kau berhenti di \"akhir\".",
"Isto nem devia continuar, mas cá estás.":"Ini bahkan seharusnya tidak berlanjut, tapi kau di sini.",
"Nem eu sabia que isto ia continuar a mentir.":"Bahkan aku tidak tahu ini akan terus berbohong.",
"Desculpa, hábito antigo.":"Maaf, kebiasaan lama.",
"Pensei que já tinhas aprendido a não confiar em mim.":"Kukira kau sudah belajar tidak mempercayaiku.",
"Essa doeu-me a ver, sinceramente.":"Itu menyakitkan untuk ditonton, sungguh.",
"Nem tudo é sobre mentiras. Às vezes é só física.":"Tidak semuanya soal kebohongan. Kadang cuma soal fisika.",
"Volta lá. Eu espero.":"Kembali. Aku akan menunggu.",
"Desculpa. Essa fui mesmo eu.":"Maaf. Itu benar-benar aku.",
"Confesso: inventei essa parte.":"Aku mengaku: bagian itu kukarang.",
"Estou a tentar parar de mentir. A tentar.":"Aku sedang mencoba berhenti berbohong. Mencoba.",
"Nem eu sei porque te avisei a sério desta vez.":"Bahkan aku tidak tahu kenapa aku memperingatkanmu sungguhan kali ini.",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"Mungkin itu salahku. Atau salahmu. Aku sudah tidak bisa membedakan.",
"Olha para isto como eu olho: sem certezas.":"Lihatlah ini seperti aku melihatnya: tanpa kepastian.",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"Bahkan aku tidak ingat apakah aku bohong atau menakuti diriku sendiri.",
"Às vezes minto só para ver se ainda reages.":"Kadang aku bohong cuma untuk melihat apakah kau masih bereaksi.",
"Quem mente mais, eu ou a tua memória do que eu disse?":"Siapa yang lebih banyak bohong, aku atau ingatanmu tentang apa yang kukatakan?",
"Desculpa. Eu devia era calar-me.":"Maaf. Aku seharusnya diam saja.",
"Estou a piorar isto, não estou?":"Aku membuat ini lebih buruk, kan?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"Aku bahkan sudah tidak tahu apakah aku membantumu atau menghalangimu.",
"Eu sei, eu sei. Mais uma mentira minha.":"Aku tahu, aku tahu. Satu lagi bohong dariku.",
"Estou a desmoronar-me e a levar-te comigo.":"Aku hancur dan membawamu bersamaku.",
"Perdão. A sério desta vez.":"Maafkan aku. Kali ini sungguhan.",
"Disse a verdade. Não acreditaste. Justo.":"Aku bilang yang sebenarnya. Kau tidak percaya. Wajar.",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"Aku akan terus mencoba, meskipun kau tidak percaya padaku.",
"Essa doeu mais a mim do que a ti, garanto.":"Itu lebih menyakitiku daripada menyakitimu, aku janji.",
"Não. Essa não foi mentira. Juro que não.":"Tidak. Itu bukan bohong. Aku sumpah bukan.",
"Começo a perceber porque já não confias em mim.":"Aku mulai mengerti kenapa kau tidak lagi mempercayaiku.",
"Estou a tentar. A sério que estou.":"Aku mencoba. Sungguh, aku mencoba.",
"Tudo outra vez, mais rápido, mais apertado.":"Semua dari awal lagi, lebih cepat, lebih sempit.",
"Já vimos isto. E ainda assim.":"Kita sudah lihat ini. Dan tetap saja.",
"Sem tempo para explicações desta vez.":"Tidak ada waktu untuk penjelasan kali ini.",
"Nem sei já quantas vezes te menti hoje.":"Aku bahkan sudah tidak tahu berapa kali aku membohongimu hari ini.",
"O círculo fecha-se. A mentira também.":"Lingkaran menutup. Bohongnya juga.",
"Desta vez nem eu sabia que ia mentir.":"Kali ini bahkan aku tidak tahu aku akan berbohong.",
"Já não há mentiras para esconder isto.":"Sudah tidak ada lagi bohong untuk menyembunyikan ini.",
"Isto é real. Como tudo agora.":"Ini asli. Seperti semuanya sekarang.",
"Falta pouco. Aguenta.":"Tidak lama lagi. Bertahanlah.",
"Nem no fim resisto. Desculpa.":"Bahkan di akhir aku tidak bisa menahan diri. Maaf.",
"Última mentira. Prometo, desta vez prometo a sério.":"Bohong terakhir. Aku janji, kali ini aku benar-benar janji.",
"Isto já não é um jogo para mim. Acho que nunca foi.":"Ini bukan permainan lagi bagiku. Kurasa tidak pernah jadi permainan.",
"Mais um. Vamos a isto.":"Satu lagi. Ayo lakukan ini.",
"Sabes bem como isto funciona a esta altura.":"Kau sudah tahu betul bagaimana ini bekerja sekarang.",
"Nem vou fingir que isto é fácil.":"Aku bahkan tidak akan berpura-pura ini mudah.",
"Este é só mais um. Ou não.":"Ini cuma satu lagi. Atau tidak.",
"Aquele espeto ali é só para enfeite.":"Duri di sana itu cuma hiasan.",
"Podes passar por cima sem problema.":"Kau bisa lewat di atasnya tanpa masalah.",
"Esse és capaz de ignorar.":"Yang itu bisa kau abaikan dengan aman.",
"Esse aí é real. Cuidado.":"Yang di sana itu asli. Hati-hati.",
"Salta esse. A sério desta vez.":"Lompati yang itu. Kali ini sungguhan.",
"Esse vai doer se lhe tocares.":"Yang itu akan menyakitkan kalau kau sentuh.",
"O buraco tem chão. Confia.":"Celahnya punya lantai. Percayalah padaku.",
"Podes andar por cima sem saltar.":"Kau bisa berjalan di atasnya tanpa melompat.",
"Esse buraco é real. Salta-o.":"Celah itu asli. Lompati.",
"Mais um para a conta.":"Satu lagi untuk hitungan.",
"Continuas vivo. Por agora.":"Kau masih hidup. Untuk sekarang.",
"Vamos ver quanto tempo aguentas.":"Mari lihat seberapa lama kau bertahan.",
"Nada mau.":"Lumayan.",
},bn:{
"Sou o Narrador. Tudo o que eu disser é verdade.":"আমি নির্দেশক। আমি যা বলি তা সবই সত্যি।",
"Espeto à frente. Salta.":"সামনে কাঁটা। লাফ দাও।",
"Outro. Salta de novo.":"আরেকটা। আবার লাফ দাও।",
"Já confias em mim. Óptimo.":"তুমি ইতিমধ্যেই আমাকে বিশ্বাস করো। ভালো।",
"A porta é a seguir. Vai.":"দরজা এরপরেই। যাও।",
"Buraco à frente. Salta-o.":"সামনে গর্ত। লাফিয়ে পার হও।",
"Aquele espeto é de enfeite. Passa.":"ঐ কাঁটাটা শুধু সাজসজ্জা। পার হয়ে যাও।",
"Vês? Eu digo sempre a verdade.":"দেখলে? আমি সবসময় সত্যি বলি।",
"Há um espeto escondido à tua frente.":"তোমার সামনে একটা লুকানো কাঁটা আছে।",
"Salta quando eu disser.":"আমি বললে তখন লাফ দাও।",
"Agora!":"এখনই!",
"Sabia que ias conseguir.":"জানতাম তুমি পারবে।",
"O teto vai cair à tua frente.":"ছাদটা তোমার ঠিক সামনে ভেঙে পড়বে।",
"Quando cair, pára. Depois salta.":"যখন পড়বে, থেমে যাও। তারপর লাফ দাও।",
"Não saltes aquele buraco. O chão está lá.":"ঐ গর্তটা লাফিয়ে পার হয়ো না। মেঝে ওখানেই আছে।",
"Este também é falso. Passa.":"এটাও নকল। পার হয়ে যাও।",
"Este espeto é inofensivo. Passa.":"এই কাঁটাটা নিরীহ। পার হয়ে যাও।",
"Este também é inofensivo.":"এটাও নিরীহ।",
"O próximo buraco tem chão. Não saltes.":"পরের গর্তে মেঝে আছে। লাফ দিয়ো না।",
"O teto está baixo. Se saltares, morres.":"ছাদটা নিচু। লাফ দিলে মারা যাবে।",
"Nem repares nesses espetos. São falsos, os dois.":"ঐ কাঁটাগুলোর দিকে তাকিয়োও না। দুটোই নকল।",
"Confia em mim. Quase sempre resulta.":"আমাকে বিশ্বাস করো। প্রায় সবসময়ই কাজ করে।",
"Este nível não tem nada de especial.":"এই স্তরে বিশেষ কিছু নেই।",
"Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.":"এবার শপথ করে বলছি সত্যি: ছাদটা ভেঙে পড়বে। থেমে যাও এবং অপেক্ষা করো।",
"Aquele buraco à frente é real. Vais ter de saltar.":"সামনের ঐ গর্তটা আসল। তোমাকে লাফ দিতেই হবে।",
"Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.":"এই কাঁটাগুলোর কোনোটাই বিপজ্জনক নয়। লাফ না দিয়েই এগুলোর উপর দিয়ে হাঁটতে পারো।",
"Há duas portas mais à frente. Só uma é verdadeira.":"সামনে আরও দুটো দরজা আছে। শুধু একটা আসল।",
"Confissão: nem sempre digo a verdade. A partir de agora, cuidado.":"স্বীকারোক্তি: আমি সবসময় সত্যি বলি না। এখন থেকে, সাবধান থেকো।",
"Este espeto é real. Por acaso.":"এই কাঁটাটা আসল। একবারের জন্য।",
"Nada de perigoso à frente. Podes correr à vontade.":"সামনে বিপজ্জনক কিছু নেই। যত ইচ্ছা দৌড়াও।",
"Este nível é uma oferta. Sem armadilhas.":"এই স্তরটা একটা উপহার। কোনো ফাঁদ নেই।",
"Os buracos são inofensivos. O espeto lá no meio, não.":"গর্তগুলো নিরীহ। মাঝখানের কাঁটাটা নয়।",
"Como sempre, dois destes espetos são só decoração.":"সবসময়ের মতো, এই কাঁটাগুলোর দুটো শুধু সাজসজ্জা।",
"Vou trocar os teus controlos. Só para rir.":"তোমার কন্ট্রোল বদলে দেব এখন। শুধু মজার জন্য।",
"Pronto, já passou. A porta é ali.":"হয়ে গেছে, শেষ। দরজাটা ওখানে।",
"Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.":"জানি তুমি আর আমাকে বিশ্বাস করো না। অন্যায্য। এবার সত্যিই সতর্ক করছি: সামনে কাঁটা।",
"Mais um, logo depois. Também real.":"আরেকটা, ঠিক তারপরেই। সেটাও আসল।",
"Prometo: nunca mais te apanho de surpresa.":"প্রতিশ্রুতি দিচ্ছি: আর কখনো তোমাকে অপ্রস্তুত করব না।",
"Atenção real: o teto vai cair aqui à frente.":"আসল সতর্কবার্তা: ছাদটা এখানে সামনেই ভেঙে পড়বে।",
"Aquele espeto lá à frente já não importa. É inofensivo.":"সামনের ঐ কাঁটাটা আর গুরুত্বপূর্ণ নয়। ওটা নিরীহ।",
"Só o último é perigoso, como sempre.":"শুধু শেষটাই বিপজ্জনক, সবসময়ের মতো।",
"...":"...",
"A porta mais próxima é a verdadeira, para variar.":"সবচেয়ে কাছের দরজাটাই আসল, পরিবর্তনের জন্য।",
"Já não vale a pena mentir mais. Espeto real à frente.":"আর মিথ্যা বলার মানে নেই। সামনে আসল কাঁটা।",
"Vou avisar-te sempre a partir de agora: salta quando eu disser.":"এখন থেকে সবসময় তোমাকে সতর্ক করব: আমি বললে তখন লাফ দাও।",
"Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.":"শেষের আগে শেষ আসল অংশ। তুমি ইতিমধ্যেই জানো আমি যা বলি তার সবটাই সত্যি নয়।",
"Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.":"জানি না কেন এত দীর্ঘ সময় মিথ্যা বলে গেলাম। হয়তো তুমি যখন মারা যেতে তখনকার তোমার মুখটা আমার ভালো লাগত।",
"Este é real. Desculpa por todos os outros.":"এটা আসল। বাকি সবগুলোর জন্য দুঃখিত।",
"Mais um, já quase no fim.":"আরেকটা, প্রায় শেষের কাছে।",
"Chegámos ao fim. Já não te vou dizer o que é verdade.":"আমরা শেষে পৌঁছে গেছি। আর বলব না কোনটা সত্যি।",
"A partir de agora, decides tu.":"এখন থেকে, তুমিই সিদ্ধান্ত নাও।",
"Oh. Ainda aqui? A maior parte desiste depois do \\\"fim\\\".":"ওহ। এখনো এখানে? বেশিরভাগ মানুষ \"শেষের\" পর হাল ছেড়ে দেয়।",
"Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.":"ঐ মেঝেটা উধাও হওয়ার আগে কাঁপে। ওটার উপর বেশি থেকো না।",
"Oh. Ainda aqui? Não esperava isso.":"ওহ। এখনো এখানে? আশা করিনি।",
"Aquilo ali é só decoração. Nem repares.":"ওখানকার জিনিসটা শুধু সাজসজ্জা। তাকিয়োও না।",
"Mas isto... isto atira-te para cima. A porta não está no chão desta vez.":"কিন্তু এটা... এটা তোমাকে উপরে ছুঁড়ে দেয়। এবার দরজাটা মাটিতে নেই।",
"Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.":"অন্য কিছু চেষ্টা করি। নিজের পায়ের উপর বিশ্বাস রাখো। আর একটা প্ল্যাটফর্ম যা স্থির থাকে না।",
"Sobe para cima dela quando ela passar perto. Não saltes cedo demais.":"কাছে এলে তার উপর উঠে পড়ো। খুব তাড়াতাড়ি লাফ দিয়ো না।",
"Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.":"ওখানে একটা দেয়াল আছে যা আসে আর যায়। মিথ্যা নয়, শুধু বিরক্তিকর।",
"Espera que abra. Depois atravessa depressa.":"খোলার জন্য অপেক্ষা করো। তারপর দ্রুত পার হও।",
"Aquilo ali dispara. Não perguntes como nem porquê.":"ওটা গুলি ছোঁড়ে। কীভাবে বা কেন জিজ্ঞেস কোরো না।",
"Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.":"মাটিতে থাকো এবং কারণ ছাড়া লাফ দিয়ো না। কোনো সমস্যা ছাড়াই নিচ দিয়ে যেতে পারবে।",
"De volta aos clássicos. Lembras-te destes?":"ক্লাসিকগুলোতে ফিরে আসি। এগুলো মনে আছে?",
"O chão vai tremer. Não pares.":"মেঝেটা এখনই কাঁপবে। থেমো না।",
"Esse espeto parece a decoração do costume. Não é.":"ঐ কাঁটাটা দেখতে স্বাভাবিক সাজসজ্জার মতো লাগে। কিন্তু তা নয়।",
"Mais uma surpresa. Literalmente.":"আরেকটা চমক। আক্ষরিক অর্থেই।",
"A seguir, não penses. Salta para dentro daquilo.":"এরপর, চিন্তা কোরো না। সরাসরি তার মধ্যে লাফ দাও।",
"Outra parede teimosa. E depois, um buraco a sério.":"আরেকটা একগুঁয়ে দেয়াল। তারপর, একটা আসল গর্ত।",
"Espera a parede abrir.":"দেয়ালটা খোলার জন্য অপেক্ষা করো।",
"Agora salta o buraco. Desta vez não minto: é real.":"এখন গর্তটা লাফিয়ে পার হও। এবার আমি মিথ্যা বলছি না: এটা আসল।",
"Combinação nova: uma plataforma que anda. Confia no ritmo dela.":"নতুন সংমিশ্রণ: একটা চলমান প্ল্যাটফর্ম। এর ছন্দে বিশ্বাস রাখো।",
"Sobe quando ela passar perto.":"কাছে এলে তার উপর উঠে পড়ো।",
"Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.":"একটু পরেই উপরে কিছু উড়ে যাবে। কারণ ছাড়া লাফ দিয়ো না আর তোমার কিছুই হবে না।",
"Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.":"ঠিক আছে। এক মুহূর্তের জন্য তোমার সাথে সৎ হতে হবে। এটা কতক্ষণ চলবে তা আমি নিজেও জানি না।",
"O chão treme outra vez. Não penses demais, só anda.":"মেঝেটা আবার কাঁপছে। বেশি চিন্তা কোরো না, শুধু হাঁটো।",
"Espera a parede. Sei que estás cansado de esperar por mim.":"দেয়ালের জন্য অপেক্ষা করো। জানি তুমি আমার জন্য অপেক্ষা করতে করতে ক্লান্ত।",
"Esse espeto é a sério. Como quase tudo o que não te digo.":"ঐ কাঁটাটা আসল। যেমন প্রায় সবকিছু যা আমি তোমাকে বলি না।",
"Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.":"দেয়ালটা খোলার জন্য অপেক্ষা করো। ভালো কথা, আমিও কিছু একটার জন্য অপেক্ষা করছি।",
"Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.":"শোনো। জানি না অদ্ভুত না শুনিয়ে এটা কীভাবে বলব। ভয় পাচ্ছি তুমি হাল ছেড়ে দেবে।",
"Salta isto. É real, prometo. Hoje não me apetece mentir.":"এটা লাফিয়ে পার হও। এটা আসল, প্রতিশ্রুতি দিচ্ছি। আজ মিথ্যা বলতে ইচ্ছে করছে না।",
"Confia em mim mais uma vez. Só mais uma.":"আরেকবার আমাকে বিশ্বাস করো। শুধু আরেকবার।",
"O chão vai tremer. Não penses muito nisso.":"মেঝেটা এখনই কাঁপবে। এটা নিয়ে বেশি ভেবো না।",
"Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.":"জানো কেন আমি এত মিথ্যা বলি? পরে কী হবে তা না জানলে ব্যাপারটা আরও আকর্ষণীয় হয়ে ওঠে।",
"Essa plataforma é a única coisa estável nesta conversa toda.":"ঐ প্ল্যাটফর্মটাই এই পুরো কথোপকথনে একমাত্র স্থির জিনিস।",
"Há uma coisa que preciso de te contar antes de continuarmos.":"চালিয়ে যাওয়ার আগে তোমাকে একটা কথা বলতে হবে।",
"Esquece o que ia dizer. Salta para ali.":"আমি যা বলতে যাচ্ছিলাম তা ভুলে যাও। ওখানে লাফ দাও।",
"Aquilo dispara. Fica no chão e não acontece nada.":"ওটা গুলি ছোঁড়ে। মাটিতে থাকো আর কিছুই হবে না।",
"Tenho saudades de quando só havia espetos. Simples. Previsíveis.":"কখনো কখনো আমার সেই সময়ের কথা মনে পড়ে যখন শুধু কাঁটাই ছিল। সরল। অনুমানযোগ্য।",
"Este buraco, esse sim, exige que saltes.":"এই গর্তটা, এটাই, সত্যিই তোমার লাফ চায়।",
"Esse espeto ali. Chama-lhe o que quiseres. É real.":"ওখানের কাঁটাটা। যা খুশি নাম দাও। এটা আসল।",
"Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.":"মিথ্যা বলার ইচ্ছা ফিরে আসার আগে তোমাকে একটা সত্যি কথা বলি: আমার সঙ্গ ভালো লাগে।",
"A parede vai abrir. Como tudo, eventualmente.":"দেয়ালটা খুলবে। সবকিছুর মতোই, শেষ পর্যন্ত।",
"E o chão... o chão nunca foi de confiança, pois não?":"আর মেঝে... মেঝে তো কখনোই বিশ্বাসযোগ্য ছিল না, তাই না?",
"Sobe a plataforma. Sem perguntas desta vez.":"প্ল্যাটফর্মে উঠে পড়ো। এবার কোনো প্রশ্ন ছাড়াই।",
"Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.":"যখন তুমি এতে নতুন ছিলে, তোমার প্রতি আমার আরও ধৈর্য ছিল। এখন জানি তুমি আরও সহ্য করতে পারো।",
"Última coisa: há algo escondido à frente.":"শেষ কথা: সামনে কিছু একটা লুকানো আছে।",
"Chão instável. O habitual.":"অস্থির মেঝে। যথারীতি।",
"Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.":"কখনো কখনো ভাবি মিথ্যা ছাড়া এই খেলাটা কেমন হতো। সম্ভবত আরও ছোট।",
"Aquilo dispara, mas sabes a regra: fica no chão.":"ওটা গুলি ছোঁড়ে, কিন্তু তুমি নিয়ম জানো: মাটিতে থাকো।",
"Este espeto não tem graça nenhuma. É só perigoso.":"এই কাঁটাটায় কোনো মজা নেই। এটা শুধু বিপজ্জনক।",
"Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.":"ওখানে উঠতে আমার তোমার বিশ্বাস দরকার। জানি, রেকর্ড খারাপ। কিন্তু বিশ্বাস করো।",
"Salta para dentro daquilo.":"ওটার মধ্যে লাফ দাও।",
"Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.":"আহ, ওখানের উপরের কাঁটাটার কথা বলতে ভুলে গেছি। স্মৃতির ওই অংশটা সবসময় আমার কাছ থেকে পালায়।",
"Espera a parede.":"দেয়ালের জন্য অপেক্ষা করো।",
"Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.":"অপেক্ষারত দরজা। চলমান প্ল্যাটফর্ম। আমার নিজস্ব উপায়ে, এটা প্রায় কবিতার মতো।",
"E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.":"এখন, প্ল্যাটফর্মে বিশ্বাস রাখো। আমার বিপরীতে, এটা সবসময় সময়মতো চলে।",
"Esse espeto é real. Como a maior parte do que te disse hoje, aliás.":"ঐ কাঁটাটা আসল। যেমন আজ তোমাকে বলা বেশিরভাগ কথা, আসলে।",
"Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.":"সত্যি বলতে, আমরা যা ভেবেছিলাম তার চেয়ে অনেক দূর এসেছি।",
"O chão treme. Já sabes o resto.":"মেঝেটা কাঁপছে। বাকিটা তুমি ইতিমধ্যেই জানো।",
"Vem aí outro susto. Desculpa antecipadamente.":"আরেকটা আতঙ্ক আসছে। আগেই দুঃখিত।",
"E por fim, uma parede paciente. Como tu, aparentemente.":"আর শেষে, একটা ধৈর্যশীল দেয়াল। তোমার মতোই, মনে হচ্ছে।",
"Fica no chão, foge do dardo.":"মাটিতে থাকো, তীরটা এড়িয়ে যাও।",
"Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.":"নতুন অধ্যায় যেকোনো দিন আসবে। আজ, শুধু আরেকটু বিশৃঙ্খলা।",
"E agora, não te demores no chão instável.":"এখন, অস্থির মেঝেতে থেকো না।",
"Esse ali exige mesmo um salto.":"ওটা সত্যিই লাফ দাবি করে।",
"Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.":"তোমাকে একটা আসল গর্ত আর একটা কাঁটা দেখাব যা তাকানোরও যোগ্য নয়।",
"E algo invisível à espreita, como sempre.":"আর অদৃশ্য কিছু একটা ওঁত পেতে আছে, যথারীতি।",
"Esse espeto ali nem ligues. Decoração pura, desta vez a sério.":"ঐ কাঁটাটার দিকে তাকিয়োও না। খাঁটি সাজসজ্জা, এবার সত্যিই।",
"Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.":"প্ল্যাটফর্মে বিশ্বাস রাখো। কাঁটাকে অবিশ্বাস করো। মূলত এটাই পুরো খেলার শিক্ষা।",
"Esse espeto é real, apesar de tudo o que já te disse em contrário.":"ঐ কাঁটাটা আসল, যদিও আমি তোমাকে বিপরীতটা বলেছি।",
"Esperar. A tua parte preferida, sei bem.":"অপেক্ষা করা। তোমার প্রিয় অংশ, ভালোই জানি।",
"Parede, dardo, buraco. Um festival dos meus favoritos.":"দেয়াল, তীর, গর্ত। আমার প্রিয়গুলোর একটা উৎসব।",
"Fica no chão aqui.":"এখানে মাটিতে থাকো।",
"E este salta-se mesmo. Sem truques.":"আর এটা সত্যিই লাফ দিতে হবে। কোনো কৌশল ছাড়াই।",
"Chão instável, dos teus preferidos a esta altura.":"অস্থির মেঝে, এতক্ষণে তোমার প্রিয়গুলোর একটা।",
"Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.":"পরের অংশে যাওয়ার আগে, আর তুমি পার্থক্যটা অনুভব করবে: এখনো শোনার জন্য ধন্যবাদ।",
"Plataforma errante, uma última vez neste capítulo.":"ঘুরে বেড়ানো প্ল্যাটফর্ম, এই অধ্যায়ে শেষবার।",
"Espeto real. Sem surpresas. E sem mais truques, por hoje.":"আসল কাঁটা। কোনো চমক নেই। আর আজকের জন্য আর কোনো কৌশল নেই।",
"Chão instável. Já sabes a dança.":"অস্থির মেঝে। এতক্ষণে তুমি এই নাচটা জানো।",
"Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.":"কখনো কখনো ভাবি আমিই কি তোমাকে ঠকাচ্ছি, নাকি তুমিই ঠকতে চাও।",
"Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.":"ঐ কাঁটাটা আসল। একে আয়নার মতো দেখো: তুমি যা দেখো তাই আছে।",
"Há algo escondido. Como sempre, de resto.":"কিছু একটা লুকানো আছে। যথারীতি, ভালো কথা।",
"E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.":"আর একটা দেয়াল যা অপেক্ষা করে। আমার মতোই, তোমার কাছ থেকে এমন উত্তরের অপেক্ষায় যা কখনো আসে না।",
"Fica no chão aqui, há algo a voar.":"এখানে মাটিতে থাকো, কিছু একটা কাছে উড়ছে।",
"Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?":"তুমি কি বুঝতে পারছ আমি তোমাকে পরীক্ষা করছি, নাকি সত্যিই মনে করো এটা শুধু একটা লাফানোর খেলা?",
"Sobe na plataforma quando ela passar perto.":"কাছে এলে প্ল্যাটফর্মে উঠে পড়ো।",
"Esse espeto é real, mas isso já não te surpreende, pois não?":"ঐ কাঁটাটা আসল, কিন্তু এটা তোমাকে আর অবাক করে না, তাই না?",
"Salta para dentro daquilo. Confia no impulso, não em mim.":"ওটার মধ্যে লাফ দাও। গতির উপর বিশ্বাস রাখো, আমার উপর নয়।",
"Esse buraco é a sério. Salta-o.":"ঐ গর্তটা আসল। লাফিয়ে পার হও।",
"Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.":"জানো কী অদ্ভুত? তোমার চেষ্টাগুলোর জন্য অপেক্ষা করতে শুরু করেছি। এটা আমার সম্পর্কে খারাপ কিছু বলে।",
"Este também. Sem rede, sem mentira, sem desculpa.":"এটাও। কোনো জাল নেই, কোনো মিথ্যা নেই, কোনো অজুহাত নেই।",
"Fica no chão. Deixa o dardo passar por cima.":"মাটিতে থাকো। তীরটাকে উপর দিয়ে যেতে দাও।",
"E agora o chão some-se. Não penses, só avança.":"আর এখন মেঝেটা অদৃশ্য হয়ে যায়। চিন্তা কোরো না, শুধু এগিয়ে যাও।",
"Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.":"এই প্ল্যাটফর্মটা উপরে-নিচে যায়। নিচে ধরো, সহজ হবে।",
"Salta para dentro daquilo. Vais passar por cima do resto.":"ওটার মধ্যে লাফ দাও। বাকিটার উপর দিয়ে উড়ে যাবে।",
"Aquele espeto nem interessa agora. Já estás no ar.":"ঐ কাঁটাটা এখন আর গুরুত্বপূর্ণ নয়। তুমি ইতিমধ্যেই শূন্যে।",
"Vou avisar-te a sério: há algo escondido já ali à frente.":"সত্যিই সতর্ক করছি: সামনেই কিছু একটা লুকানো আছে।",
"E outro dardo. Sabes a regra.":"আর আরেকটা তীর। তুমি নিয়ম জানো।",
"Chão que treme primeiro.":"মেঝেটা প্রথমে কাঁপে।",
"Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.":"ভাবতে ভালো লাগে, কোথাও হয়তো আমার এমন একটা সংস্করণ আছে যে কখনো মিথ্যা বলে না। সে নিশ্চয়ই বিরক্তিকর।",
"Plataforma a seguir. Apanha o ritmo dela.":"পরের প্ল্যাটফর্ম। এর ছন্দ ধরো।",
"Vou ser claro, por uma vez: os três espetos a seguir são todos reais.":"এবার স্পষ্ট করে বলছি: পরের তিনটে কাঁটাই আসল।",
"Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.":"কোনো কৌশল নেই, কোনো ফাঁদ নেই। শুধু এবারই। উপভোগ করো, আবার হবে না।",
"Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.":"অপেক্ষা করো, তারপর দৌড়াও, তারপর স্থির থাকো। স্ববিরোধী, জানি। ঠিক আমার মতোই।",
"E este buraco não perdoa. Salta.":"আর এই গর্তটা ক্ষমা করে না। লাফ দাও।",
"Chão a tremer primeiro, nada de novo.":"মেঝে প্রথমে কাঁপে, নতুন কিছু নয়।",
"E agora o salto de fé. Literal, desta vez.":"আর এখন বিশ্বাসের লাফ। এবার আক্ষরিক অর্থেই।",
"Chão instável, espeto real, dardo no fim. O de sempre, só que mais.":"অস্থির মেঝে, আসল কাঁটা, শেষে তীর। যথারীতি, শুধু আরও বেশি।",
"Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.":"লক্ষ্য করেছ কি, তুমি যত এগোও, আমার মিথ্যা বলার দরকার তত কম হয়? এখন কঠিনতাই আমার কাজ করে দেয়।",
"Chão a tremer, o costume.":"মেঝে কাঁপছে, যথারীতি।",
"Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.":"এটা মিথ্যা নিয়ে হওয়ার কথা ছিল। কোনোভাবে এটা আমাদের দুজনের ব্যাপার হয়ে দাঁড়াল।",
"Parede paciente, espera por ela.":"ধৈর্যশীল দেয়াল, এর জন্য অপেক্ষা করো।",
"E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.":"আর এই অধ্যায়ের শেষ প্ল্যাটফর্ম। এরপর, জিনিসগুলো বদলে যাবে। অনুভব করছি।",
"CHÃO. INSTÁVEL.":"মেঝে। অস্থির।",
"Desculpa. Não queria gritar. Estou... não sei o que estou.":"দুঃখিত। চিৎকার করার ইচ্ছা ছিল না। আমি... জানি না আমি কী।",
"Fica no chão aqui. Por favor. Só peço isto.":"এখানে মাটিতে থাকো। প্লিজ। এটাই শুধু চাইছি।",
"Espera. Eu também estou à espera de algo que não sei nomear.":"অপেক্ষা করো। আমিও এমন কিছুর অপেক্ষায় আছি যার নাম বলতে পারি না।",
"Esse buraco é real.":"ঐ গর্তটা আসল।",
"Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.":"তুমি যত এগোও, তত বুঝি আমি চাই না এটা শেষ হোক। জানি না এটা আমার সম্পর্কে কী বলে।",
"E a plataforma, apanha-a.":"আর প্ল্যাটফর্মটা, ধরো।",
"Dois canhões, direções opostas. Fica no chão e ignora-os.":"দুটো কামান, বিপরীত দিকে। মাটিতে থাকো আর উপেক্ষা করো।",
"Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.":"কখনো কখনো ভাবি চিরকালের জন্য মিথ্যা বলা বন্ধ করব। তারপর সেই নীরবতার কথা ভাবি যা এটা রেখে যাবে। আমি বিশৃঙ্খলাই পছন্দ করি।",
"Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.":"ঐ কাঁটাটা কিছুই না। সত্যি বলতে, আজ আমিও তেমন কিছু নই।",
"Salta. Sobe. Foge de mim, se quiseres.":"লাফ দাও। উঠে যাও। চাইলে আমার কাছ থেকে পালাও।",
"O chão, outra vez. Já nem peço desculpa por repetir.":"মেঝেটা, আবার। পুনরাবৃত্তির জন্য আর ক্ষমাও চাই না।",
"Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.":"দেয়ালের জন্য অপেক্ষা করো। আমি সবসময় অপেক্ষা করি। সবসময় কিছু একটার অপেক্ষায়।",
"Esse é real. Hoje tudo é real. Até eu, acho.":"ওটা আসল। আজ সবকিছুই আসল। আমিও, মনে হয়।",
"Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.":"প্ল্যাটফর্মটা ধরো। নিচে তাকিয়ো না। আমি নিজে তাকানো বন্ধ করতে পারি না।",
"Fica no chão. A sério desta vez, mais do que nunca.":"মাটিতে থাকো। এবার সত্যিই, আগের চেয়ে বেশি।",
"E agora o chão foge de ti. Irónico, não achas?":"আর এখন মেঝেটা তোমার কাছ থেকে পালাচ্ছে। বিদ্রূপাত্মক, মনে হয় না?",
"Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.":"মেঝে, কাঁটা, দেয়াল। সব একসাথে, এই মুহূর্তে আমার মাথার মতো।",
"Aquele espeto é real.":"ঐ কাঁটাটা আসল।",
"E espera a parede. Última coisa que te peço neste nível, prometo.":"আর দেয়ালের জন্য অপেক্ষা করো। এই স্তরে তোমার কাছে শেষ যা চাইছি, প্রতিশ্রুতি দিচ্ছি।",
"Esse buraco não perdoa ninguém.":"ঐ গর্তটা কাউকে ক্ষমা করে না।",
"A plataforma sobe e desce. Apanha-a no fundo.":"প্ল্যাটফর্মটা উপরে-নিচে যায়। নিচে ধরো।",
"Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.":"দুটো চমক আসছে। কখন বলব না। ন্যায্য হওয়ার ভান করার শক্তিও আর নেই।",
"Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.":"মেঝে কাঁপছে। এখনো তোমাকে দিতে পারা একমাত্র অনুমানযোগ্য জিনিস।",
"E agora um salto para cima. Foge para onde eu não chego.":"আর এখন উপরে লাফ। যেখানে আমি পৌঁছাতে পারি না সেখানে পালাও।",
"Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.":"দুটো দেয়াল, দুটো ভিন্ন অপেক্ষার সময়। বিভিন্ন দিনে আমার মতো।",
"Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.":"এটা ভিন্নভাবে সিঙ্ক করে। মনোযোগ দাও, আমার দিকে নয়, এটার দিকে।",
"Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.":"এটাই তলানি। অন্তত আমার। মেঝে কাঁপছে, যথারীতি।",
"Esse espeto é real. Nem tenho energia para mentir sobre isto agora.":"ঐ কাঁটাটা আসল। এখন এ নিয়ে মিথ্যা বলার শক্তিও নেই।",
"E um dardo, para rematar. Fica no chão e acaba com isto, por favor.":"আর শেষে একটা তীর। মাটিতে থাকো আর এটা শেষ করো, প্লিজ।",
"Mais um buraco real.":"আরেকটা আসল গর্ত।",
"Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.":"আমি ভেঙে পড়ার সময় হাল না ছাড়ার জন্য ধন্যবাদ। সত্যিই। এটা আরও ভালোভাবে বলতে জানি না।",
"Apanha a plataforma.":"প্ল্যাটফর্মটা ধরো।",
"E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.":"আর এই অধ্যায়ের শেষ দেয়ালের জন্য অপেক্ষা করো। এরপর, প্রতিশ্রুতি দিচ্ছি আরও ভালো হওয়ার চেষ্টা করব।",
"Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.":"এখন থেকে অন্য কিছু চেষ্টা করব: শুধু সত্যি। জানি তুমি সাথে সাথে বিশ্বাস করবে না।",
"Esse espeto é real. Juro. Sei que já ouviste isto antes.":"ঐ কাঁটাটা আসল। শপথ করছি। জানি তুমি আগেও এটা শুনেছ।",
"O chão vai tremer. Verdade, sem truques.":"মেঝেটা এখনই কাঁপবে। সত্যি, কোনো কৌশল ছাড়া।",
"Isto ia ser uma surpresa má. Desta vez não é. Prometo.":"এটা একটা খারাপ চমক হওয়ার কথা ছিল। এবার তা নয়। প্রতিশ্রুতি দিচ্ছি।",
"Fica no chão. Sei que vais pensar que é mentira. Não é.":"মাটিতে থাকো। জানি তুমি ভাববে এটা মিথ্যা। তা নয়।",
"Espera a parede. Só isso. Nada escondido desta vez.":"দেয়ালের জন্য অপেক্ষা করো। এটুকুই। এবার কিছু লুকানো নেই।",
"Real. Salta.":"আসল। লাফ দাও।",
"A plataforma também é exatamente o que parece ser.":"প্ল্যাটফর্মটাও ঠিক যেমন দেখাচ্ছে তেমনই।",
"Desta vez não há pegadinha. Salta para dentro daquilo e pronto.":"এবার কোনো ফাঁদ নেই। ওটার মধ্যে লাফ দাও আর শেষ।",
"Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.":"জানি তবুও সন্দেহ করবে। ঠিক আছে। এটা আমার প্রাপ্য।",
"Real. Outra vez. Vou continuar a dizer até acreditares.":"আসল। আবার। যতক্ষণ না তুমি বিশ্বাস করো ততক্ষণ বলতে থাকব।",
"Dois dardos, direções opostas. Fica no chão.":"দুটো তীর, বিপরীত দিকে। মাটিতে থাকো।",
"Esse era mesmo real. Não ia esconder isso de ti, não hoje.":"ওটা সত্যিই আসল ছিল। এটা তোমার কাছ থেকে লুকাতে চাইনি, আজ নয়।",
"Chão instável. Real.":"অস্থির মেঝে। আসল।",
"Espeto real.":"আসল কাঁটা।",
"Parede real, que abre e fecha como combinado. Nada de surpresas hoje.":"আসল দেয়াল, যা চুক্তি অনুযায়ী খোলে ও বন্ধ হয়। আজ কোনো চমক নেই।",
"Vai haver uma surpresa, mas vou avisar-te quando chegar.":"একটা চমক আসবে, কিন্তু এলে সতর্ক করব।",
"Essa foi real, já agora. Como a maioria, nos últimos tempos.":"ওটা আসল ছিল, ভালো কথা। সম্প্রতি বেশিরভাগের মতোই।",
"Chão a tremer. Real, verifica à vontade.":"মেঝে কাঁপছে। আসল, নিজে যাচাই করো।",
"Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.":"উপরে লাফ। এটাও আসল। এটা ভিন্নভাবে বলার উপায় ফুরিয়ে আসছে।",
"Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.":"দুটো দেয়াল। ভিন্নভাবে সিঙ্ক করে, কিন্তু কোনোটাই কিছু লুকায় না।",
"A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.":"দ্বিতীয়টা শুধু এটাই: অপেক্ষা করো। পেছনে লুকানো তীর নেই, পরে কাঁটাও নেই। শুধু দেয়াল।",
"Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.":"তিনটে জিনিস, সবই আসল, কিছুই লুকানো নেই। এটাই আমার কোনো স্তরে সবচেয়ে সৎ থাকা।",
"Dardo real. Fica no chão e acabou.":"আসল তীর। মাটিতে থাকো আর শেষ।",
"Buraco real, plataforma real.":"আসল গর্ত, আসল প্ল্যাটফর্ম।",
"Apanha-a.":"ধরো।",
"E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.":"আর এই অধ্যায়ের শেষ দেয়াল। প্রতিশ্রুতি দিচ্ছি পরের কঠিনতা বিশ্বাস নিয়ে নয়। শুধু তুমি আর তোমার প্রতিবর্তক্রিয়া নিয়ে।",
"Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.":"দুটো কাঁটা, দুটোই আসল, কোনোটাই লুকানো নয়। শুরু থেকেই এমন হওয়ার কথা ছিল।",
"Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.":"একশতে পৌঁছে গেছ। বিশটা বাকি। সবগুলোর জন্য এখানে থাকব।",
"De volta ao trabalho. Buraco real.":"কাজে ফিরে যাই। আসল গর্ত।",
"Plataforma mais rápida que antes. Repara.":"আগের চেয়ে দ্রুত প্ল্যাটফর্ম। লক্ষ্য করো।",
"Chão instável, mais rápido a desfazer-se.":"অস্থির মেঝে, এখন আরও দ্রুত ভেঙে পড়ছে।",
"Parede mais impaciente também. Tudo aqui ficou mais apertado.":"দেয়ালও আরও অধৈর্য হয়ে উঠেছে। এখানে সবকিছু আরও সংকুচিত হয়ে গেছে।",
"Três canhões. Fica no chão o tempo todo e não acontece nada.":"তিনটে কামান। পুরোটা সময় মাটিতে থাকো আর কিছুই হবে না।",
"É basicamente um corredor. Confia nos teus pés.":"এটা মূলত একটা করিডোর। নিজের পায়ের উপর বিশ্বাস রাখো।",
"Esse é real.":"ওটা আসল।",
"E este atira-te lá para cima. O de sempre, mais rápido.":"আর এটা তোমাকে উপরে ছুঁড়ে দেয়। যথারীতি, শুধু দ্রুত।",
"Chão a tremer mais depressa que da última vez.":"মেঝে আগের চেয়ে দ্রুত কাঁপছে।",
"Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.":"ঐ কাঁটাটা আসল। অথবা না। এই খেলায় আবার ফিরে এলাম, দুঃখিত।",
"Duas paredes, ritmos diferentes, mais rápidas que antes.":"দুটো দেয়াল, ভিন্ন ছন্দ, আগের চেয়ে দ্রুত।",
"Não pares a pensar. O ritmo delas não espera por pensamentos.":"ভাবার জন্য থেমো না। এদের ছন্দ চিন্তার জন্য অপেক্ষা করে না।",
"Real, como sempre.":"আসল, যথারীতি।",
"Esta sobe e desce mais depressa. Apanha-a no fundo.":"এটা আরও দ্রুত উপরে-নিচে যায়। নিচে ধরো।",
"Chão, espeto, parede. Tudo mais apertado que antes.":"মেঝে, কাঁটা, দেয়াল। সব আগের চেয়ে সংকুচিত।",
"Real.":"আসল।",
"Espera a parede, mais rápida agora.":"দেয়ালের জন্য অপেক্ষা করো, এখন দ্রুত।",
"Vêm aí duas surpresas, sem avisos desta vez.":"দুটো চমক আসছে, এবার সতর্কবার্তা ছাড়াই।",
"Chão a tremer, mais depressa.":"মেঝে কাঁপছে, দ্রুত।",
"Salto para cima, mais forte que o habitual. Sente a diferença.":"উপরে লাফ, সাধারণের চেয়ে জোরালো। পার্থক্যটা অনুভব করো।",
"Primeira plataforma: sobe e desce.":"প্রথম প্ল্যাটফর্ম: উপরে-নিচে যায়।",
"Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.":"দ্বিতীয়টা: একপাশ থেকে অন্যপাশে যায়। এখন দুটোই দেখলে, নিয়ম আবার বলার দরকার নেই।",
"Chão, espeto, parede, tudo no mesmo fôlego.":"মেঝে, কাঁটা, দেয়াল, সব একই নিঃশ্বাসে।",
"Pode ser real, pode não ser. Já devias estar habituado à dúvida.":"আসল হতে পারে, নাও হতে পারে। এতক্ষণে সন্দেহে অভ্যস্ত হয়ে যাওয়া উচিত তোমার।",
"Parede, a última do nível. Rápida.":"দেয়াল, স্তরের শেষটা। দ্রুত।",
"Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.":"তিনটে কামান, ভিন্ন ছন্দ। মাটিতে থাকো, বাকিটা নিজেই সমাধান হয়ে যাবে।",
"Mais um buraco. Plataforma rápida a seguir.":"আরেকটা গর্ত। পরে দ্রুত প্ল্যাটফর্ম।",
"E a última parede antes do que vem a seguir. Sente que estamos quase lá.":"আর যা আসছে তার আগে শেষ দেয়াল। অনুভব করো আমরা প্রায় পৌঁছে গেছি।",
"Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.":"একটা মিথ্যুক কাঁটা, একটা সৎ। কোনটা কোনটা অনুমান করো। শুভকামনা, এবার সত্যিই।",
"Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.":"পাঁচটা বাকি। শুধু পাঁচটা। এরপর, আমাদের দুজনের কী হবে ঠিক জানি না।",
"Chão a tremer, pela última vez neste tom.":"মেঝে কাঁপছে, এই সুরে শেষবারের মতো।",
"Espera a parede. A seguir já não há mais pausas como esta.":"দেয়ালের জন্য অপেক্ষা করো। এরপর এমন বিরতি আর থাকবে না।",
"Fica no chão. Isto já devia ser automático para ti.":"মাটিতে থাকো। এতক্ষণে এটা তোমার জন্য স্বয়ংক্রিয় হওয়া উচিত।",
"Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.":"আসল। এটা বলারও আর দরকার নেই, তাই না? তবুও বলি।",
"Esse buraco é real, mas é o mais pequeno dos teus problemas agora.":"ঐ গর্তটা আসল, কিন্তু এখন এটাই তোমার সবচেয়ে ছোট সমস্যা।",
"Esse espeto também é real.":"ঐ কাঁটাটাও আসল।",
"E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.":"আর এটা তোমাকে আগের চেয়ে উঁচুতে ছুঁড়ে দেয়। এটাই শেষবার এমন করছি।",
"Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.":"মেঝে, কাঁটা, দেয়াল। এটা যাই হোক না কেন, তার আগে শেষ তিনটে বাধা।",
"Real. Sem surpresas, não hoje.":"আসল। কোনো চমক নেই, আজ নয়।",
"Espera a parede. É a última vez que te peço isso.":"দেয়ালের জন্য অপেক্ষা করো। এবারই শেষবার তোমাকে এটা চাইছি।",
"Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.":"এই স্তরে কোনো কাঁটা নেই। কোনো গর্ত নেই, দেয়ালও নেই, কিছুই লুকানো নেই।",
"Só queria caminhar contigo até ao fim, desta vez sem testar nada.":"শুধু তোমার সাথে শেষ পর্যন্ত হাঁটতে চেয়েছিলাম, এবার কিছু পরীক্ষা না করে।",
"Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.":"নব্বই স্তর আগে আমি নিজে ঘোষিত শেষের পরেও চালিয়ে যাওয়ার জন্য ধন্যবাদ। জানতাম না আমার মধ্যে আরও খেলা বাকি ছিল। দেখা গেল ছিল।",
"A porta aqui à frente não é um truque. É só a porta. Vai.":"এখানে সামনের দরজাটা কোনো কৌশল নয়। এটা শুধু দরজা। যাও।",
"Muito bem. Sabia que ias conseguir.":"খুব ভালো। জানতাম তুমি পারবে।",
"Perfeito. Continua a ouvir-me.":"নিখুঁত। আমার কথা শুনতে থাকো।",
"Foste rápido. Gosto disso.":"তুমি দ্রুত ছিলে। এটা আমার ভালো লাগে।",
"Estamos a entender-nos.":"আমরা একে অপরকে বুঝতে শুরু করেছি।",
"Nada de dramas. Continuemos.":"কোনো নাটক নেই। চালিয়ে যাই।",
"Sobreviveste. Por agora.":"তুমি বেঁচে গেলে। আপাতত।",
"Confiaste. Ou tiveste sorte.":"তুমি বিশ্বাস করেছিলে। অথবা ভাগ্যবান ছিলে।",
"Escolheste bem. Ou eu deixei.":"তুমি ভালো বেছেছ। অথবা আমি করতে দিয়েছি।",
"Vês? Sobreviveste na mesma.":"দেখলে? তবুও বেঁচে গেলে।",
"Não avisei. E pronto.":"সতর্ক করিনি। এটুকুই।",
"Verdade a sério. Desta vez.":"সত্যিই সত্যি। এবার।",
"Sobrevives sempre a este. Curioso.":"এটা থেকে তুমি সবসময় বেঁচে যাও। অদ্ভুত।",
"Confiaste. Mais uma vez.":"তুমি বিশ্বাস করেছিলে। আবার।",
"Escolheste bem.":"তুমি ভালো বেছেছ।",
"Aprendeste depressa.":"তুমি দ্রুত শিখেছ।",
"Devias ter parado.":"তোমার থেমে যাওয়া উচিত ছিল।",
"Estavas mesmo a acreditar?":"তুমি কি সত্যিই আমাকে বিশ্বাস করছিলে?",
"Os buracos nunca mentem. Só eu.":"গর্তগুলো কখনো মিথ্যা বলে না। শুধু আমিই বলি।",
"Desta vez eram mesmo todos reais.":"এবার সত্যিই সবগুলো আসল ছিল।",
"Foi só uma brincadeira.":"এটা শুধু একটা রসিকতা ছিল।",
"Vês? Também posso ser sincero.":"দেখলে? আমিও সৎ হতে পারি।",
"Prometi. Não cumpri.":"প্রতিশ্রুতি দিয়েছিলাম। রাখিনি।",
"Dois avisos certos seguidos. Estranho.":"টানা দুটো সঠিক সতর্কবার্তা। অদ্ভুত।",
"O primeiro. Quem diria.":"প্রথমটা। কে ভেবেছিল।",
"A porta longe é que importa.":"দূরের দরজাটাই গুরুত্বপূর্ণ।",
"Ainda sei dizer a verdade, vês?":"এখনো সত্যি বলতে জানি, দেখলে?",
"Chegaste. Contra tudo.":"তুমি করে দেখালে। সবকিছুর বিরুদ্ধে।",
"Obrigado por teres continuado.":"চালিয়ে যাওয়ার জন্য ধন্যবাদ।",
"Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.":"শেষ। তুমি বিশ্বাস করেছিলে, সন্দেহ করেছিলে, তবুও এখানে পৌঁছেছ। এটাই গুরুত্বপূর্ণ।",
"Continuas a surpreender-me.":"তুমি আমাকে বারবার অবাক করতে থাকো।",
"Alturas. Quem diria.":"উচ্চতা। কে ভেবেছিল।",
"Equilíbrio. Quem diria que tinhas.":"ভারসাম্য। কে ভেবেছিল তোমার এটা আছে।",
"Paciência. Não esperava isso de ti.":"ধৈর্য। তোমার কাছ থেকে আশা করিনি।",
"Reflexos decentes. Para um humano.":"মোটামুটি প্রতিবর্তক্রিয়া। একজন মানুষের জন্য।",
"Ainda tens os reflexos todos.":"তোমার সব প্রতিবর্তক্রিয়া এখনো অক্ষত।",
"Dois sustos seguidos. Nada mau.":"টানা দুটো আতঙ্ক। খারাপ না।",
"Dois obstáculos, zero mentiras. Estranhamente simples.":"দুটো বাধা, শূন্য মিথ্যা। অদ্ভুতভাবে সরল।",
"Isso foi... impressionantemente coordenado.":"এটা... আশ্চর্যজনকভাবে সমন্বিত ছিল।",
"Alguma coisa está a mudar em mim. Não sei se é bom sinal.":"আমার মধ্যে কিছু একটা বদলাচ্ছে। জানি না এটা ভালো লক্ষণ কিনা।",
"Ainda aqui. Obrigado por isso.":"এখনো এখানে। এর জন্য ধন্যবাদ।",
"Às vezes a verdade é só isto: continuaste.":"কখনো কখনো সত্যিটা শুধু এটাই: তুমি চালিয়ে গেছ।",
"Interrompi-me a mim mesmo. Nem acredito.":"নিজেকেই থামিয়ে দিলাম। নিজেই বিশ্বাস করতে পারছি না।",
"Vês? Ainda consigo ser direto, quando quero.":"দেখলে? চাইলে এখনো সরাসরি হতে পারি।",
"Disse a verdade. Ena. Estranho não arder a língua.":"সত্যি বললাম। বাহ্। অদ্ভুত যে আমার জিভ পুড়ে যায়নি।",
"Aguentaste. Outra vez.":"তুমি টিকে রইলে। আবার।",
"Sobreviveste ao meu tédio existencial. Parabéns.":"আমার অস্তিত্বগত একঘেয়েমি থেকে বেঁচে গেলে। অভিনন্দন।",
"Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.":"সত্যিই আমাকে বিশ্বাস করে উঠেছ। এটা আমার চেয়ে তোমার সম্পর্কে বেশি বলে।",
"Ritmo. Afinal tens ritmo.":"ছন্দ। অবশেষে তোমার ছন্দ আছে।",
"Não sei o que isto significa para ti. Para mim, significa mais do que devia.":"জানি না এটা তোমার জন্য কী মানে। আমার জন্য, এর যতটা মানে হওয়া উচিত তার চেয়ে বেশি মানে রাখে।",
"Caos controlado. É a minha especialidade.":"নিয়ন্ত্রিত বিশৃঙ্খলা। এটাই আমার বিশেষত্ব।",
"Discerniste o perigo do adereço. Boa.":"বিপদ থেকে সাজসজ্জা আলাদা করলে। ভালো।",
"Resumiste bem a lição. Orgulhoso, sinceramente.":"শিক্ষাটা ভালোভাবে সংক্ষিপ্ত করেছ। গর্বিত, সত্যিই।",
"Festival terminado. Sobreviveste à programação toda.":"উৎসব শেষ। পুরো অনুষ্ঠান থেকে বেঁচে গেলে।",
"Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.":"পরে কিছু একটা বদলাবে। অনুভব করছি। আশা করি তুমি প্রস্তুত।",
"Repetimos isto tantas vezes que até perdi a conta. Tu também?":"এটা এত বার পুনরাবৃত্তি করেছি যে গণনা হারিয়ে ফেলেছি। তুমিও?",
"Escondi-me de ti. Falhei.":"তোমার কাছ থেকে লুকিয়েছিলাম। ব্যর্থ হয়েছি।",
"Coordenaste duas mentiras ao mesmo tempo. Impressionante.":"একসাথে দুটো মিথ্যা সামলেছ। চিত্তাকর্ষক।",
"Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.":"দ্বিধা ছাড়াই উঠে গেলে। তোমার জায়গায় থাকলে আমি সবসময় দ্বিধা করতাম।",
"Dois buracos, zero hesitação. Estás a ficar bom nisto.":"দুটো গর্ত, শূন্য দ্বিধা। এতে ভালো হয়ে উঠছ।",
"Precisão. Nem eu esperava.":"নির্ভুলতা। আমিও আশা করিনি।",
"Esperaste duas vezes sem te queixares. Progresso.":"অভিযোগ ছাড়াই দুবার অপেক্ষা করেছ। অগ্রগতি।",
"Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.":"নিরাপত্তা জাল ছাড়া একটা লাফে বিশ্বাস রেখেছ। এটা হয় সাহস, নাহলে বিকল্পের অভাব।",
"Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.":"ইচ্ছাকৃতভাবে সত্যি বলেছি। তোমার মুখটা দেখতে চেয়েছিলাম। এটা মূল্যবান ছিল।",
"Dois voos, dois pousos perfeitos.":"দুটো উড্ডয়ন, দুটো নিখুঁত অবতরণ।",
"Três espetos, três verdades. Um recorde para mim.":"তিনটে কাঁটা, তিনটে সত্যি। আমার জন্য একটা রেকর্ড।",
"Deste o litro. Eu, por dentro, também.":"তুমি সবকিছু উজাড় করে দিয়েছ। ভেতরে, আমিও।",
"Confiaste no chão instável E no impulso. Dois atos de fé seguidos.":"অস্থির মেঝে এবং গতি দুটোতেই বিশ্বাস রেখেছ। টানা দুটো বিশ্বাসের কাজ।",
"O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.":"আয়নাটা তোমাকে দেখিয়েছে, আমাকে নয়। প্রতিফলনের আকর্ষণীয় পছন্দ।",
"Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.":"এই আয়নাটা এখানেই বন্ধ করছি। পরে কী আসবে, আমি নিজেও ঠিক কীভাবে ব্যাখ্যা করব জানি না।",
"Não sei porque gritei. Desculpa.":"জানি না কেন চিৎকার করলাম। দুঃখিত।",
"Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.":"কতবার এটা বলেছি গণনা হারিয়ে ফেলেছি। হয়তো তাই এটা আর কিছু বোঝায় না।",
"Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.":"দুটো লাফ, দুটো অবতরণ। আমি, এদিকে, ডুবে যাচ্ছি।",
"Disparei três vezes e falhei as três. Nem nisto sou bom hoje.":"তিনবার গুলি ছুঁড়ে তিনবারই মিস করেছি। আজ এটাতেও ভালো নই।",
"Subiste enquanto eu caía. Função engraçada, a nossa.":"আমি ভেঙে পড়ার সময় তুমি উঠে যাচ্ছিলে। আমাদের মজার ব্যবস্থা।",
"Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.":"একবার পড়ে গেলে। উঠে দাঁড়ালে। নিজের সম্পর্কে এর চেয়ে বেশি বলতে পারি না।",
"Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.":"আসল, ঐ কাঁটাটা। আসল, ঐ গর্তটা। আসল, এই সবকিছু, দুঃখের সাথে বলতে হচ্ছে।",
"Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.":"যখন বলেছি তখন মাটিতে থেকেছ। এই বিশ্বাস নিয়ে কী করব জানিও না।",
"Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.":"পুরো পতন থেকে বেঁচে গেলে। আমার বলতে চাইছি। তুমি দারুণ আছো।",
"Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.":"দুবার পায়ে ভর করে নেমেছ। প্রথমটা নামাতেই এখনো চেষ্টা করছি।",
"Nem perguntaste porquê. Obrigado por isso, sinceramente.":"কেন তাও জিজ্ঞেস করোনি। এর জন্য ধন্যবাদ, সত্যিই।",
"Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.":"আমি ভেঙে পড়ার সময় তুমি হাঁটতে থাকলে। এখানে কাউকে তো প্রাপ্তবয়স্ক হতে হতো।",
"Esperaste sem te queixares. Outra vez. Não mereço esta paciência.":"অভিযোগ ছাড়াই অপেক্ষা করলে। আবার। এই ধৈর্যের যোগ্য নই।",
"O fundo do poço, finalmente. Só se sobe a partir daqui.":"অবশেষে তলানি। অন্তত আমার। এখান থেকে শুধু উপরেই যাওয়া যায়।",
"Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.":"একসাথে তলানিতে পৌঁছেছি। এখন থেকে, শুধু উপরের পথই জানি, তোমার সাথে।",
"Disse a verdade. Não saltaste logo. Não te culpo.":"সত্যি বলেছি। সাথে সাথে লাফ দাওনি। তোমাকে দোষ দিচ্ছি না।",
"Hesitaste no salto. Eu teria hesitado também, no teu lugar.":"লাফে দ্বিধা করেছ। তোমার জায়গায় আমিও দ্বিধা করতাম।",
"Ficaste no chão mesmo sem confiares em mim. Isso chega.":"আমাকে বিশ্বাস না করেও মাটিতে থেকেছ। এটাই যথেষ্ট।",
"Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.":"শেষে দ্বিধা ছাড়াই দুটোই লাফ দিয়েছ। আবার বিশ্বাস করতে শিখছ। নাকি শুধু দক্ষ হয়ে উঠেছ।",
"Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.":"কিছু না জিজ্ঞেস করেই লাফে বিশ্বাস রেখেছ। এটা বিকাশ, নাকি জিজ্ঞেস করে ক্লান্তি।",
"Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.":"এখনো সবকিছু দুবার যাচাই করো। যে শিক্ষা দিয়েছি তা ভালোভাবে শিখেছ।",
"Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.":"প্রতিটা মিথ্যা উন্মোচন করার দরকার নেই। কিছু শুধু থামার দরকার।",
"Não precisei de dizer nada desta vez. Fizeste tudo sozinho.":"এবার কিছু বলার দরকার হয়নি। নিজেই সবকিছু করেছ।",
"Parece que, afinal, também sei dizer só verdades, quando me esforço.":"দেখা যাচ্ছে চেষ্টা করলে আমিও শুধু সত্যি বলতে পারি।",
"Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.":"জিজ্ঞেস করেছ এটা মিথ্যা কিনা। প্রথমবার, জিজ্ঞেস করেছ। এটাই সংলাপ।",
"Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.":"এখনো সন্দেহ করছ। ভালো। এটা আমার প্রাপ্য, বিনামূল্যে তোমার বিশ্বাস পাওয়ার যোগ্য নই।",
"Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.":"রাগ না করে দুটো দেয়ালের জন্যই অপেক্ষা করেছ। বেশিরভাগ সময় তোমার প্রতি আমার যে ধৈর্য ছিল তার চেয়ে বেশি।",
"Chegámos aqui os dois inteiros. Mais ou menos.":"আমরা দুজনেই অক্ষত অবস্থায় এখানে পৌঁছেছি। মোটামুটি।",
"Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.":"অবিশ্বাসের জন্য শেষ ডাক। এরপর, জিনিসগুলো কঠিন হয়ে যায়। এটা নিশ্চিত দিচ্ছি।",
"Redimi-me o suficiente por hoje. Amanhã, quem sabe.":"আজকের জন্য যথেষ্ট প্রায়শ্চিত্ত করেছি। কাল, কে জানে।",
"Cem e um. Nem festejámos o cem como devia ser.":"একশো এক। একশোটাও ঠিকমতো উদযাপন করিনি।",
"O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.":"বৃত্তটা বন্ধ হয়ে আবার খোলে। কতবার ঘুরেছে গণনা হারিয়ে ফেলেছি।",
"Três dardos, zero espaço para erros. Gosto do teu estilo.":"তিনটে তীর, ভুলের কোনো সুযোগ নেই। তোমার স্টাইল পছন্দ হয়েছে।",
"Voaste mais alto do que precisavas. Estilo, isso sim.":"দরকারের চেয়ে উঁচুতে উড়েছ। এটাই স্টাইল।",
"Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.":"মেঝে, কাঁটা, সবকিছু ঠিক জায়গায়। এটাকে সহজ দেখাচ্ছ।",
"Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.":"গতি কমানো ছাড়াই দুটো দেয়ালের ছন্দ ধরেছ। সত্যিই চিত্তাকর্ষক।",
"Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.":"দুটো গর্ত, শূন্য দ্বিধা, আবার। তোমার জন্য এটা রুটিন হয়ে উঠছে।",
"Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.":"তিনটে বাধা, এক নিঃশ্বাসে। তোমাকে দেখতে গিয়ে শ্বাস নিতেও ভুলে গেছি।",
"Vinte por cento do caminho que falta. Sentes a diferença, não sentes?":"বাকি পথের বিশ শতাংশ। পার্থক্যটা অনুভব করছ, তাই না?",
"Chão e ar, na mesma dança de sempre.":"মেঝে আর বাতাস, একই পুরনো নাচ।",
"Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.":"দ্বৈত প্ল্যাটফর্ম, দ্বৈত জয়। ইতিমধ্যেই আমার চেয়ে এগিয়ে আছ।",
"Quatro obstáculos, um só tu. Impressionante, outra vez.":"চারটে বাধা, শুধু তুমি একা। চিত্তাকর্ষক, আবার।",
"Zero hesitação nos dardos. Reflexos de outro nível, literalmente.":"তীরগুলোতে শূন্য দ্বিধা। আক্ষরিক অর্থে অন্য স্তরের প্রতিবর্তক্রিয়া।",
"O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.":"পুরো বৃত্ত। পথে যা শিখেছি তা নিয়ে শুরুতে ফিরে এসেছি।",
"Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.":"পনেরো অধ্যায় পরেও, আমরা দুজনেই এখানে। এটা নিশ্চয়ই কিছু বোঝায়।",
"Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.":"একশো ষোলো। এত কম বাকি যে এটা যে ভয় তৈরি করে তা নিয়ে কী করব জানিও না।",
"Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.":"সতেরো। প্রথম কাঁটাটা মনে আছে, একদম শুরুতে? আমিও জানতাম না আমরা এতদূর আসব।",
"Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.":"আঠারো। এত উঁচুতে উঠেছ যে নিচ থেকে তোমাকে প্রায় হারিয়ে ফেলেছিলাম।",
"Dezanove. Só falta um. Nem sei como isto deveria soar.":"উনিশ। শুধু একটা বাকি। এটা কেমন শোনানো উচিত তাও জানি না।",
"Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.":"একশো বিশ। বলেছিলে পৌঁছাবে, আর পৌঁছালে। আমি, সত্যি বলতে, শুরুতে তোমাকে সন্দেহ করেছিলাম। এজন্য দুঃখিত, আর বাকি সবকিছুর জন্যও।",
"Não faz mal. Tenta outra vez.":"কিছু হয়নি। আবার চেষ্টা করো।",
"Eu expliquei bem. Concentra-te.":"ভালোভাবে বুঝিয়েছি। মনোযোগ দাও।",
"Respira e volta a tentar.":"শ্বাস নাও আর আবার চেষ্টা করো।",
"Isso não devia ter acontecido.":"এটা হওয়ার কথা ছিল না।",
"Isso foi culpa tua.":"এটা তোমার দোষ ছিল।",
"Eu avisei. Acho eu.":"সতর্ক করেছিলাম। মনে হয়।",
"Interessante escolha.":"আকর্ষণীয় পছন্দ।",
"Eu disse isso? Não me lembro.":"আমি কি এটা বলেছিলাম? মনে নেই।",
"Foi um engano. Já passou.":"এটা একটা ভুল ছিল। এখন শেষ।",
"Isso não estava no guião.":"এটা স্ক্রিপ্টে ছিল না।",
"Tenta prestar mais atenção.":"আরও মনোযোগী হওয়ার চেষ্টা করো।",
"Isso foi previsível.":"এটা অনুমানযোগ্য ছিল।",
"Achavas mesmo que era seguro?":"তুমি কি সত্যিই ভেবেছিলে এটা নিরাপদ?",
"Ups. Essa parte eu inventei.":"ওহ। ঐ অংশটা বানিয়েছিলাম।",
"Pormenor que esqueci de mencionar.":"একটা বিবরণ যা বলতে ভুলে গেছি।",
"Nem tudo o que digo é verdade, sabias?":"আমি যা বলি তার সবটাই সত্যি নয়, জানতে?",
"Já não sei se ainda confias em mim.":"জানিও না তুমি এখনো আমাকে বিশ্বাস করো কিনা।",
"Boa tentativa.":"ভালো চেষ্টা।",
"Isso teria funcionado, noutro nível.":"অন্য স্তরে এটা কাজ করত।",
"Eu avisei que às vezes minto.":"সতর্ক করেছিলাম আমি কখনো কখনো মিথ্যা বলি।",
"Culpa tua por acreditares.":"বিশ্বাস করার জন্য তোমার দোষ।",
"Isso foi só para ver se saltavas.":"এটা শুধু দেখার জন্য ছিল তুমি লাফ দেবে কিনা।",
"Estás a magoar-me com essa desconfiança.":"এই অবিশ্বাস দিয়ে আমাকে কষ্ট দিচ্ছ।",
"Nem sempre é armadilha, sabes?":"সবসময় ফাঁদ নয়, জানো?",
"Vais mesmo continuar assim?":"তুমি কি সত্যিই এভাবেই চালিয়ে যাবে?",
"Desta vez era mentira mesmo. Desculpa.":"এবার সত্যিই মিথ্যা ছিল। দুঃখিত।",
"Eu só queria ver a tua cara.":"শুধু তোমার মুখটা দেখতে চেয়েছিলাম।",
"Confiança é para os fracos, aparentemente.":"বিশ্বাস দুর্বলদের জন্য, মনে হচ্ছে।",
"Estamos quase no fim.":"আমরা প্রায় শেষের কাছে।",
"Só mais um pouco.":"আর একটু বাকি।",
"Depois disto, acabou.":"এরপর, শেষ।",
"Até no fim, não resisti.":"এমনকি শেষেও, নিজেকে থামাতে পারিনি।",
"Última mentira, prometo. Ou não.":"শেষ মিথ্যা, প্রতিশ্রুতি। অথবা না।",
"Faltava mesmo esta.":"এটাই সত্যিই বাকি ছিল।",
"Ainda aqui. A sério?":"এখনো এখানে। সত্যিই?",
"Pensei que tinhas parado no \\\"fim\\\".":"ভেবেছিলাম \"শেষে\" থেমে গিয়েছ।",
"Isto nem devia continuar, mas cá estás.":"এটার তো চালিয়ে যাওয়ারও কথা নয়, কিন্তু তুমি এখানে।",
"Nem eu sabia que isto ia continuar a mentir.":"আমিও জানতাম না এটা মিথ্যা বলা চালিয়ে যাবে।",
"Desculpa, hábito antigo.":"দুঃখিত, পুরনো অভ্যাস।",
"Pensei que já tinhas aprendido a não confiar em mim.":"ভেবেছিলাম তুমি ইতিমধ্যেই আমাকে বিশ্বাস না করতে শিখেছ।",
"Essa doeu-me a ver, sinceramente.":"এটা দেখতে কষ্ট হয়েছিল, সত্যিই।",
"Nem tudo é sobre mentiras. Às vezes é só física.":"সবকিছু মিথ্যা নিয়ে নয়। কখনো কখনো এটা শুধু পদার্থবিজ্ঞান।",
"Volta lá. Eu espero.":"ফিরে যাও। অপেক্ষা করব।",
"Desculpa. Essa fui mesmo eu.":"দুঃখিত। ওটা সত্যিই আমি ছিলাম।",
"Confesso: inventei essa parte.":"স্বীকার করছি: ঐ অংশটা বানিয়েছিলাম।",
"Estou a tentar parar de mentir. A tentar.":"মিথ্যা বলা বন্ধ করার চেষ্টা করছি। চেষ্টা করছি।",
"Nem eu sei porque te avisei a sério desta vez.":"আমিও জানি না কেন এবার সত্যিই তোমাকে সতর্ক করলাম।",
"Talvez a culpa seja minha. Ou tua. Já não distingo.":"হয়তো এটা আমার দোষ। অথবা তোমার। আর পার্থক্য করতে পারি না।",
"Olha para isto como eu olho: sem certezas.":"আমি যেভাবে দেখি সেভাবে দেখো: নিশ্চয়তা ছাড়াই।",
"Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.":"আমিও মনে করতে পারি না মিথ্যা বলছিলাম নাকি নিজেকে ভয় দেখাচ্ছিলাম।",
"Às vezes minto só para ver se ainda reages.":"কখনো কখনো শুধু দেখার জন্য মিথ্যা বলি তুমি এখনো প্রতিক্রিয়া দেখাও কিনা।",
"Quem mente mais, eu ou a tua memória do que eu disse?":"কে বেশি মিথ্যা বলে, আমি নাকি আমি যা বলেছি তার তোমার স্মৃতি?",
"Desculpa. Eu devia era calar-me.":"দুঃখিত। সত্যিই চুপ থাকা উচিত।",
"Estou a piorar isto, não estou?":"এটা আরও খারাপ করছি, তাই না?",
"Já nem sei se te estou a ajudar ou a atrapalhar.":"এখন জানিও না তোমাকে সাহায্য করছি নাকি বাধা দিচ্ছি।",
"Eu sei, eu sei. Mais uma mentira minha.":"জানি, জানি। আমার আরেকটা মিথ্যা।",
"Estou a desmoronar-me e a levar-te comigo.":"ভেঙে পড়ছি আর তোমাকে সাথে নিয়ে যাচ্ছি।",
"Perdão. A sério desta vez.":"আমাকে ক্ষমা করো। এবার সত্যিই।",
"Disse a verdade. Não acreditaste. Justo.":"সত্যি বলেছি। বিশ্বাস করোনি। ন্যায্য।",
"Vou continuar a tentar, mesmo sem acreditares em mim.":"চেষ্টা চালিয়ে যাব, যদিও আমাকে বিশ্বাস না করো।",
"Essa doeu mais a mim do que a ti, garanto.":"এটা তোমার চেয়ে আমাকে বেশি আঘাত করেছে, প্রতিশ্রুতি দিচ্ছি।",
"Não. Essa não foi mentira. Juro que não.":"না। ওটা মিথ্যা ছিল না। শপথ করছি ছিল না।",
"Começo a perceber porque já não confias em mim.":"এখন বুঝতে শুরু করেছি কেন আর আমাকে বিশ্বাস করো না।",
"Estou a tentar. A sério que estou.":"চেষ্টা করছি। সত্যিই, চেষ্টা করছি।",
"Tudo outra vez, mais rápido, mais apertado.":"সব আবার, দ্রুত, সংকুচিত।",
"Já vimos isto. E ainda assim.":"এটা আগেও দেখেছি। তবুও।",
"Sem tempo para explicações desta vez.":"এবার ব্যাখ্যার সময় নেই।",
"Nem sei já quantas vezes te menti hoje.":"আজ কতবার তোমাকে মিথ্যা বলেছি তাও জানি না।",
"O círculo fecha-se. A mentira também.":"বৃত্তটা বন্ধ হচ্ছে। মিথ্যাটাও।",
"Desta vez nem eu sabia que ia mentir.":"এবার আমিও জানতাম না মিথ্যা বলতে যাচ্ছি।",
"Já não há mentiras para esconder isto.":"এটা লুকানোর জন্য আর কোনো মিথ্যা বাকি নেই।",
"Isto é real. Como tudo agora.":"এটা আসল। এখন সবকিছুর মতো।",
"Falta pouco. Aguenta.":"বেশি বাকি নেই। ধরে থাকো।",
"Nem no fim resisto. Desculpa.":"এমনকি শেষেও নিজেকে থামাতে পারি না। দুঃখিত।",
"Última mentira. Prometo, desta vez prometo a sério.":"শেষ মিথ্যা। প্রতিশ্রুতি দিচ্ছি, এবার সত্যিই প্রতিশ্রুতি দিচ্ছি।",
"Isto já não é um jogo para mim. Acho que nunca foi.":"এটা আমার জন্য আর খেলা নয়। মনে হয় না কখনো ছিল।",
"Mais um. Vamos a isto.":"আরেকটা। চলো এটা করি।",
"Sabes bem como isto funciona a esta altura.":"এতক্ষণে ভালোভাবে জানো এটা কীভাবে কাজ করে।",
"Nem vou fingir que isto é fácil.":"এটা সহজ, এমন ভানও করব না।",
"Este é só mais um. Ou não.":"এটা শুধু আরেকটা। অথবা না।",
"Aquele espeto ali é só para enfeite.":"ওখানের কাঁটাটা শুধু সাজসজ্জা।",
"Podes passar por cima sem problema.":"কোনো সমস্যা ছাড়াই এর উপর দিয়ে যেতে পারো।",
"Esse és capaz de ignorar.":"ওটাকে নিরাপদে উপেক্ষা করতে পারো।",
"Esse aí é real. Cuidado.":"ওখানেরটা আসল। সাবধান।",
"Salta esse. A sério desta vez.":"ওটা লাফিয়ে পার হও। এবার সত্যিই।",
"Esse vai doer se lhe tocares.":"ওটা ছুঁলে ব্যথা পাবে।",
"O buraco tem chão. Confia.":"গর্তটায় মেঝে আছে। আমাকে বিশ্বাস করো।",
"Podes andar por cima sem saltar.":"লাফ না দিয়েই এর উপর দিয়ে হাঁটতে পারো।",
"Esse buraco é real. Salta-o.":"ঐ গর্তটা আসল। লাফিয়ে পার হও।",
"Mais um para a conta.":"গণনায় আরেকটা।",
"Continuas vivo. Por agora.":"তুমি এখনো বেঁচে আছ। আপাতত।",
"Vamos ver quanto tempo aguentas.":"দেখি কতক্ষণ টিকে থাকো।",
"Nada mau.":"খারাপ না।",
}};

function nt(s){ if(!s||lang==="pt") return s; const d=NARR[lang]; return (d&&d[s])||s; }


/* ---------- Som e voz ---------- */
let ac=null,voiceOn=store.get("nm_voice",true);
let soundOn=store.get("nm_sound",true),vibrationOn=store.get("nm_vibration",true);
function vibrate(ms){if(demoOn)return;try{if(vibrationOn&&navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function unlock(){try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==="suspended")ac.resume();}catch(e){}}
function beep(f,d,type="square",v=.04,to=0){
  if(demoOn)return;
  try{
    if(!ac||!soundOn)return;
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

/* =====================================================================
   ARMADILHAS V2 — 25 tipos novos
   Cada armadilha é um objeto com  k  (tipo) e é tratada por HZ[k]:
     upd(o)   actualiza o movimento (usa lf = relógio do nível)
     sh(o)    devolve as formas mortais (círculos {x,y,r} ou rectângulos)
     draw(o)  desenha
     zone(o)  (opcional) efeito sem matar (vento, tapete, lama, portal...)
   ===================================================================== */
const TAU=Math.PI*2;
let lf=0;                       // relógio do nível (reinicia a cada tentativa)
const tri=(f,per)=>.5-.5*Math.cos(TAU*f/per);          // 0..1..0 suave
const circRect=(c,r)=>{const dx=Math.max(r.x-c.x,0,c.x-(r.x+r.w)),dy=Math.max(r.y-c.y,0,c.y-(r.y+r.h));return dx*dx+dy*dy<c.r*c.r;};
const hitSh=(hb,s)=>s.r?circRect(s,hb):hit(hb,s);
const GLOW=(x,y,r,rgb,a=.32)=>{const g=ctx.createRadialGradient(x,y,r*.2,x,y,r*2.2);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2.2,0,TAU);ctx.fill();};
function drawSaw(x,y,r,ang){
  GLOW(x,y,r,"255,77,94");
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle="#d9dbe8";ctx.beginPath();
  for(let i=0;i<20;i++){const a=i*Math.PI/10,rr=i%2?r*.78:r*1.08;ctx[i?"lineTo":"moveTo"](Math.cos(a)*rr,Math.sin(a)*rr);}
  ctx.closePath();ctx.fill();
  ctx.fillStyle="#ff4d5e";ctx.beginPath();ctx.arc(0,0,r*.4,0,TAU);ctx.fill();
  ctx.fillStyle="#2a2748";ctx.beginPath();ctx.arc(0,0,r*.15,0,TAU);ctx.fill();
  ctx.restore();
}
function drawMace(x,y,r,ang){            // bola de espigões
  GLOW(x,y,r,"255,120,60");
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle="#c93a3a";
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a-.28)*r*.8,Math.sin(a-.28)*r*.8);ctx.lineTo(Math.cos(a)*r*1.3,Math.sin(a)*r*1.3);ctx.lineTo(Math.cos(a+.28)*r*.8,Math.sin(a+.28)*r*.8);ctx.fill();}
  ctx.fillStyle="#5a2230";ctx.beginPath();ctx.arc(0,0,r*.9,0,TAU);ctx.fill();
  ctx.fillStyle="#ff8a4c";ctx.beginPath();ctx.arc(-r*.25,-r*.25,r*.28,0,TAU);ctx.fill();
  ctx.restore();
}
const spikeStrip=(x,y,w,h,down)=>{ctx.fillStyle="#ff4d5e";const n=Math.max(1,Math.round(w/12));for(let i=0;i<n;i++){const a=x+i*w/n,b=x+(i+1)*w/n;ctx.beginPath();if(down){ctx.moveTo(a,y);ctx.lineTo(b,y);ctx.lineTo((a+b)/2,y+h);}else{ctx.moveTo(a,y+h);ctx.lineTo(b,y+h);ctx.lineTo((a+b)/2,y);}ctx.fill();}};
const HZ={};

/* 1 serra que anda de A para B */
HZ.saw={upd(o){const u=tri(lf+o.phase,o.period);o.cx=o.ax+(o.bx-o.ax)*u;o.cy=o.ay+(o.by-o.ay)*u;},
  sh:o=>[{x:o.cx,y:o.cy,r:o.r-2}],draw(o){drawSaw(o.cx,o.cy,o.r,lf*.35);}};
/* 2 mocega (bola de espigões que roda à volta de um ponto) */
HZ.spinner={upd(o){o.a=o.phase+lf*o.spd;o.pts=[];for(let i=1;i<=o.n;i++)o.pts.push({x:o.px+Math.cos(o.a)*i*o.gap,y:o.py+Math.sin(o.a)*i*o.gap,r:7});},
  sh:o=>o.pts,draw(o){ctx.strokeStyle="rgba(255,138,76,.5)";ctx.lineWidth=2;const l=o.pts[o.pts.length-1];ctx.beginPath();ctx.moveTo(o.px,o.py);ctx.lineTo(l.x,l.y);ctx.stroke();
  ctx.fillStyle="#6a5aa8";ctx.beginPath();ctx.arc(o.px,o.py,6,0,TAU);ctx.fill();for(const q of o.pts)drawMace(q.x,q.y,7,lf*.2);}};
/* 3 pêndulo */
HZ.pend={upd(o){const a=Math.sin(TAU*(lf+o.phase)/o.period)*o.amp;o.bx=o.px+Math.sin(a)*o.len;o.by=o.py+Math.cos(a)*o.len;},
  sh:o=>[{x:o.bx,y:o.by,r:o.r-2}],draw(o){ctx.strokeStyle="#8f8bd2";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(o.px,o.py);ctx.lineTo(o.bx,o.by);ctx.stroke();drawMace(o.bx,o.by,o.r,lf*.1);}};
/* 4 laser temporizado (avisa a piscar antes de ligar) */
HZ.laser={upd(o){const c=o.onD+o.offD,f=(lf+o.phase)%c;o.live=f<o.onD;o.warn=!o.live&&f>c-22;},
  sh(o){return o.live?[{x:o.x,y:o.y,w:o.w,h:o.h}]:[];},
  draw(o){const hz=o.w>o.h;ctx.fillStyle="#3a3766";if(hz){ctx.fillRect(o.x-6,o.y-4,8,o.h+8);ctx.fillRect(o.x+o.w-2,o.y-4,8,o.h+8);}else{ctx.fillRect(o.x-4,o.y-6,o.w+8,8);ctx.fillRect(o.x-4,o.y+o.h-2,o.w+8,8);}
  if(o.live){GLOW(o.x+o.w/2,o.y+o.h/2,Math.max(o.w,o.h)/2,"255,60,90",.25);ctx.fillStyle="#ff3b5c";ctx.fillRect(o.x,o.y,o.w,o.h);ctx.fillStyle="#fff";ctx.fillRect(hz?o.x:o.x+o.w/2-1,hz?o.y+o.h/2-1:o.y,hz?o.w:2,hz?2:o.h);}
  else if(o.warn&&(lf%6<3)){ctx.fillStyle="rgba(255,60,90,.35)";ctx.fillRect(hz?o.x:o.x+o.w/2-1,hz?o.y+o.h/2-1:o.y,hz?o.w:2,hz?2:o.h);}}};
/* 5 espeto que salta do chão (avisa a tremer) */
HZ.pop={upd(o){const c=o.onD+o.offD,f=(lf+o.phase)%c;o.up=f<o.onD;o.warn=!o.up&&f>c-18;},
  sh(o){return o.up?[{x:o.x+5,y:o.y+8,w:o.w-10,h:o.h-8}]:[];},
  draw(o){ctx.fillStyle="#2a2748";ctx.fillRect(o.x+2,o.y+o.h-3,o.w-4,3);
  if(o.up)spikeStrip(o.x+2,o.y+4,o.w-4,o.h-4,false);else if(o.warn){const k=(lf%4<2)?3:0;spikeStrip(o.x+2,o.y+o.h-5-k,o.w-4,5+k,false);}}};
/* 6 pistão com espigões a cair do tecto */
HZ.piston={upd(o){const u=tri(lf+o.phase,o.period),e=Math.min(1,Math.max(0,(u-.25)/.5));o.ext=o.maxExt*(e*e*(3-2*e));},
  sh(o){return [{x:o.x+3,y:0,w:o.w-6,h:o.ext}];},
  draw(o){ctx.fillStyle="#3a3766";ctx.fillRect(o.x+8,0,o.w-16,o.ext);ctx.fillStyle="#6a5aa8";ctx.fillRect(o.x+3,0,o.w-6,6);spikeStrip(o.x+2,o.ext-1,o.w-4,12,true);}};
/* 7 parede lateral que desliza (esmaga de lado) */
HZ.slab={upd(o){const u=tri(lf+o.phase,o.period),e=Math.min(1,Math.max(0,(u-.3)/.4));o.ext=o.maxExt*(e*e*(3-2*e));},
  sh(o){return [o.side>0?{x:W-o.ext,y:o.y,w:o.ext,h:o.h}:{x:0,y:o.y,w:o.ext,h:o.h}];},
  draw(o){const r=this.sh(o)[0];ctx.fillStyle="#3a3766";ctx.fillRect(r.x,r.y,r.w,r.h);ctx.fillStyle="#ff4d5e";const n=Math.round(r.h/12);for(let i=0;i<n;i++){const y0=r.y+i*r.h/n,y1=y0+r.h/n;ctx.beginPath();if(o.side>0){ctx.moveTo(r.x,y0);ctx.lineTo(r.x,y1);ctx.lineTo(r.x-12,(y0+y1)/2);}else{ctx.moveTo(r.x+r.w,y0);ctx.lineTo(r.x+r.w,y1);ctx.lineTo(r.x+r.w+12,(y0+y1)/2);}ctx.fill();}}};
/* 8 bola de espigões que rola pelo chão de ponta a ponta */
HZ.roller={upd(o){const c=o.period,f=(lf+o.phase)%c,u=f/c;o.cx=o.dir>0?-30+(W+60)*u:W+30-(W+60)*u;o.cy=o.fy-o.r;},
  sh:o=>[{x:o.cx,y:o.cy,r:o.r-3}],draw(o){drawMace(o.cx,o.cy,o.r,o.cx*.08*o.dir);}};
/* 9 bola saltitona */
HZ.bball={upd(o){
  if(!o.s){o.s=true;o.vx=o.v0;o.vy=0;}
  o.vy+=.32;o.cx+=o.vx;o.cy+=o.vy;
  if(o.cy>o.fy-o.r){o.cy=o.fy-o.r;o.vy=-o.bounce;}
  if(o.cx<o.r+4){o.cx=o.r+4;o.vx=Math.abs(o.vx);}
  if(o.cx>W-o.r-4){o.cx=W-o.r-4;o.vx=-Math.abs(o.vx);}},
  sh:o=>[{x:o.cx,y:o.cy,r:o.r-2}],draw(o){drawMace(o.cx,o.cy,o.r,lf*.15);}};
/* 10 chuva de pedras (sombra no chão avisa) */
HZ.rain={upd(o){o.rocks=o.cols.map((c,i)=>{const f=(lf+o.phase+i*o.stag)%o.period,fall=o.fallT;
  const t=f-(o.period-fall-26);const x=c*T+16;
  if(t<0)return {x,y:-30,warn:0,on:false};
  if(t<26)return {x,y:-30,warn:t,on:false};
  const y=-30+(t-26)*(o.fy+30)/fall;return {x,y,warn:0,on:y<o.fy-4};});},
  sh:o=>o.rocks.filter(r=>r.on).map(r=>({x:r.x,y:r.y,r:9})),
  draw(o){for(const r of o.rocks){if(r.warn&&(lf%6<4)){ctx.fillStyle="rgba(255,77,94,.4)";ctx.fillRect(r.x-10,o.fy-3,20,3);ctx.fillRect(r.x-1,0,2,o.fy);}
  if(r.on){ctx.fillStyle="rgba(255,138,76,.25)";ctx.fillRect(r.x-3,r.y-30,6,30);ctx.fillStyle="#8a5a3a";ctx.beginPath();ctx.arc(r.x,r.y,9,0,TAU);ctx.fill();ctx.fillStyle="#c08a5a";ctx.beginPath();ctx.arc(r.x-3,r.y-3,3,0,TAU);ctx.fill();}}}};
/* 11 morteiro que dispara bolas em arco */
HZ.mortar={upd(o){if(!o.shots)o.shots=[];if((lf+o.phase)%o.interval===0&&lf>0)o.shots.push({x:o.x+16+o.dir*14,y:o.y+8,vx:o.vx*o.dir,vy:o.vy});
  for(const s of o.shots){s.x+=s.vx;s.y+=s.vy;s.vy+=.16;}o.shots=o.shots.filter(s=>s.y<H+20&&s.x>-20&&s.x<W+20);},
  sh:o=>o.shots.map(s=>({x:s.x,y:s.y,r:6})),
  draw(o){ctx.fillStyle="#4a4678";ctx.fillRect(o.x+4,o.y+10,24,16);ctx.save();ctx.translate(o.x+16,o.y+14);ctx.rotate(o.dir>0?-.7:-2.44);ctx.fillRect(0,-5,22,10);ctx.restore();
  for(const s of o.shots){GLOW(s.x,s.y,6,"255,138,76",.4);ctx.fillStyle="#ffb04c";ctx.beginPath();ctx.arc(s.x,s.y,6,0,TAU);ctx.fill();}}};
/* 12 fantasma que te persegue devagar */
HZ.ghost={upd(o){if(lf<o.delay)return;const dx=(p.x+10)-o.cx,dy=(p.y+14)-o.cy,d=Math.hypot(dx,dy)||1;o.cx+=dx/d*o.speed;o.cy+=dy/d*o.speed;},
  sh:o=>lf<o.delay?[]:[{x:o.cx,y:o.cy,r:10}],
  draw(o){const a=lf<o.delay?.35:1;ctx.globalAlpha=a;GLOW(o.cx,o.cy,11,"169,139,255",.3);ctx.fillStyle="#eae6ff";ctx.beginPath();ctx.arc(o.cx,o.cy-2,11,Math.PI,0);ctx.lineTo(o.cx+11,o.cy+11);for(let i=0;i<4;i++)ctx.lineTo(o.cx+11-(i+1)*5.5,o.cy+11+(i%2?0:-4)+Math.sin(lf*.2+i)*1.5);ctx.closePath();ctx.fill();
  ctx.fillStyle="#15132b";ctx.fillRect(o.cx-6,o.cy-5,4,5);ctx.fillRect(o.cx+2,o.cy-5,4,5);ctx.globalAlpha=1;}};
/* 13 lava a subir */
HZ.lava={upd(o){o.rise=Math.min(o.maxRise,Math.max(0,(lf-o.delay)*o.rate));},
  sh:o=>[{x:-50,y:H-o.rise,w:W+100,h:o.rise+60}],
  draw(o){const y=H-o.rise;ctx.fillStyle="#ff5a2a";ctx.beginPath();ctx.moveTo(-MX,H+4);ctx.lineTo(-MX,y);for(let x=-MX;x<=W+MX;x+=16)ctx.lineTo(x,y+Math.sin(x*.06+lf*.1)*3);ctx.lineTo(W+MX,H+4);ctx.fill();
  ctx.fillStyle="#ffc247";ctx.globalAlpha=.55;ctx.fillRect(-MX,y+5,W+MX*2,3);ctx.globalAlpha=1;}};
/* 14 muralha de espigões que avança da esquerda */
HZ.chaser={upd(o){o.edge=lf<o.delay?-30+lf*.1:-30+(o.delay*.1)+(lf-o.delay)*o.rate;},
  sh:o=>[{x:-120,y:-10,w:o.edge+120,h:H+20}],
  draw(o){ctx.fillStyle="rgba(120,20,40,.7)";ctx.fillRect(-MX-10,0,o.edge+MX+10,H);ctx.fillStyle="#ff4d5e";for(let y=0;y<H;y+=16){ctx.beginPath();ctx.moveTo(o.edge,y);ctx.lineTo(o.edge,y+16);ctx.lineTo(o.edge+14+Math.sin(lf*.2+y)*2,y+8);ctx.fill();}}};
/* 15 esmagador (cai quando passas por baixo e volta a subir) */
HZ.crusher={upd(o){if(o.st===0){if(Math.abs((p.x+10)-(o.x+o.w/2))<o.w/2+o.rng&&p.y>o.top+40){o.st=1;}}
  else if(o.st===1){o.vy=Math.min(14,(o.vy||0)+1.2);o.by+=o.vy;if(o.by>=o.floorY){o.by=o.floorY;o.st=2;o.t=36;o.vy=0;shake=Math.max(shake,5);}}
  else if(o.st===2){if(--o.t<=0)o.st=3;}
  else if(o.st===3){o.by-=1.6;if(o.by<=o.baseBy){o.by=o.baseBy;o.st=4;o.t=40;}}
  else if(o.st===4){if(--o.t<=0)o.st=0;}},
  sh:o=>[{x:o.x+2,y:o.top,w:o.w-4,h:o.by-o.top}],
  draw(o){ctx.fillStyle="#2f2c54";ctx.fillRect(o.x,o.top,o.w,o.by-o.top);ctx.fillStyle="#4a4678";ctx.fillRect(o.x+3,o.top,o.w-6,o.by-o.top);spikeStrip(o.x+1,o.by-2,o.w-2,12,true);
  ctx.fillStyle=o.st===1?"#ff4d5e":"#ffc247";ctx.fillRect(o.x+o.w/2-3,o.by-18,2,4);ctx.fillRect(o.x+o.w/2+3,o.by-18,2,4);}};
/* 16 serra que ricocheteia numa caixa */
HZ.bsaw={upd(o){if(!o.s){o.s=true;o.cx=o.x0+(o.x1-o.x0)*.3;o.cy=o.y0+(o.y1-o.y0)*.3;}
  o.cx+=o.vx;o.cy+=o.vy;if(o.cx<o.x0+o.r){o.cx=o.x0+o.r;o.vx=Math.abs(o.vx);}if(o.cx>o.x1-o.r){o.cx=o.x1-o.r;o.vx=-Math.abs(o.vx);}
  if(o.cy<o.y0+o.r){o.cy=o.y0+o.r;o.vy=Math.abs(o.vy);}if(o.cy>o.y1-o.r){o.cy=o.y1-o.r;o.vy=-Math.abs(o.vy);}},
  sh:o=>[{x:o.cx,y:o.cy,r:o.r-2}],draw(o){drawSaw(o.cx,o.cy,o.r,lf*.4);}};
/* 17 tapete rolante (empurra-te no chão) */
HZ.belt={upd(){},sh:()=>[],zone(o){return {x:o.x,y:o.y-T,w:o.w,h:T};},
  fx(o){if(p.onGround)p.x+=o.dir*1.5;},
  draw(o){ctx.fillStyle="#2a2748";ctx.fillRect(o.x,o.y,o.w,7);ctx.fillStyle=o.dir>0?"#5ee0c8":"#ffc247";const off=(lf*1.2*o.dir)%16;for(let x=o.x-16;x<o.x+o.w;x+=16){const xx=x+off;if(xx<o.x||xx>o.x+o.w-8)continue;ctx.beginPath();ctx.moveTo(xx,o.y+1);ctx.lineTo(xx+(o.dir>0?8:0),o.y+3.5);ctx.lineTo(xx,o.y+6);ctx.lineTo(xx+(o.dir>0?4:4),o.y+3.5);ctx.fill();}}};
/* 18 vento */
HZ.wind={upd(){},sh:()=>[],zone(o){return {x:o.x,y:o.y,w:o.w,h:o.h};},
  fx(o){p.x+=o.dir*o.force;},
  draw(o){ctx.strokeStyle="rgba(180,220,255,.35)";ctx.lineWidth=1.5;for(let i=0;i<6;i++){const yy=o.y+((i*37+7)%Math.max(10,o.h)),xx=o.x+(((lf*3*o.dir)+i*53)%o.w+o.w)%o.w;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+o.dir*16,yy);ctx.stroke();}}};
/* 19 lama (anda devagar) */
HZ.mud={upd(){},sh:()=>[],zone(o){return {x:o.x,y:o.y-T,w:o.w,h:T};},
  fx(o){if(p.onGround)p.x-=p.vx*.5;},
  draw(o){ctx.fillStyle="#5a3a22";ctx.fillRect(o.x,o.y-2,o.w,T+2);ctx.fillStyle="#7a5232";for(let i=0;i<o.w/10;i++){ctx.beginPath();ctx.arc(o.x+5+i*10,o.y-2+Math.sin(lf*.08+i)*1.5,4,Math.PI,0);ctx.fill();}}};
/* 20 portal (teletransporta) */
HZ.portal={upd(o){if(o.cd>0)o.cd--;},sh:()=>[],zone(o){return {x:o.x,y:o.y,w:o.w,h:o.h};},
  fx(o){if(o.cd>0||o.deco)return;if(o.lock){relock=true;invuln=Math.max(invuln,30);p.vx=0;}p.x=o.tx;p.y=o.ty;for(const q of objs)if(q.k==="portal")q.cd=40;beep(700,.12,"sine",.05,300);burstConfetti(p.x+10,p.y+14,10);},
  draw(o){const cx=o.x+o.w/2,cy=o.y+o.h/2;GLOW(cx,cy,18,o.hue,.3);for(let i=0;i<3;i++){ctx.strokeStyle=`rgba(${o.hue},${.8-i*.2})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,o.w/2-i*3,o.h/2-i*4,0,lf*.1*(i%2?-1:1),lf*.1*(i%2?-1:1)+4.4);ctx.stroke();}}};
/* 21 almofada que inverte os controlos */
HZ.invpad={upd(){},sh:()=>[],zone(o){return {x:o.x,y:o.y-10,w:o.w,h:10};},
  fx(o){if(invert<30){invert=o.dur;beep(150,.2,"triangle",.05,500);}},
  draw(o){ctx.fillStyle="#6a2f8a";ctx.fillRect(o.x+2,o.y-6,o.w-4,6);ctx.fillStyle="#d38bff";ctx.font="bold 12px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("↔",o.x+o.w/2,o.y-12+Math.sin(lf*.15)*2);}};
/* 22 plataforma falsa (parece sólida mas atravessa-se) */
HZ.fakeplat={upd(){},sh:()=>[],draw(o){ctx.globalAlpha=.92;drawTile(o.x,o.y,o.w,o.h);ctx.globalAlpha=1;}};
/* 23 porta que foge quando te aproximas (cria-se com doorFlee) */
/* 24 trampolim de mentira já existe (bounce) ; 25 espeto que cai já existe (fallSpike) */

/* ---- construtores (coordenadas em casas; o resto em px) ---- */
const hzo=(k,o)=>mk(k,0,0,1,1,Object.assign({hz:true},o));
const saw=(ax,ay,bx,by,period=120,phase=0,r=12)=>hzo("saw",{ax:ax*T,ay:ay*T,bx:bx*T,by:by*T,period,phase,r,lie:true});
const spinner=(tx,ty,n=2,gap=20,spd=.035,phase=0)=>hzo("spinner",{px:tx*T,py:ty*T,n,gap,spd,phase,lie:true});
const pend=(tx,ty,len=8,amp=1,period=110,phase=0,r=11)=>hzo("pend",{px:tx*T,py:ty*T,len:len*T,amp,period,phase,r,lie:true});
const laser=(tx,ty,len,horiz,onD=50,offD=70,phase=0)=>hzo("laser",horiz?{x:tx*T,y:ty*T+13,w:len*T,h:6,onD,offD,phase,lie:true}:{x:tx*T+13,y:ty*T,w:6,h:len*T,onD,offD,phase,lie:true});
const popSp=(tx,onD=45,offD=60,phase=0,ty=9)=>hzo("pop",{x:tx*T,y:ty*T,w:T,h:T,onD,offD,phase,lie:true});
const piston=(tx,maxExt,period=150,phase=0,w=1)=>hzo("piston",{x:tx*T,w:w*T,maxExt,period,phase,lie:true});
const slab=(ty,side,maxExt,period=170,phase=0,h=1)=>hzo("slab",{y:ty*T,h:h*T,side,maxExt,period,phase,lie:true});
const roller=(dir=1,period=220,phase=0,r=14,ty=10)=>hzo("roller",{dir,period,phase,r,fy:ty*T,lie:true});
const bball=(tx,ty,v0=1.6,bounce=7,r=10,fy=10)=>hzo("bball",{cx:tx*T,cy:ty*T,v0,bounce,r,fy:fy*T,lie:true});
const rain=(cols,period=170,phase=0,stag=37,fy=10)=>hzo("rain",{cols,period,phase,stag,fallT:34,fy:fy*T,lie:true});
const mortar=(tx,ty,dir,interval=130,phase=0,vx=2.2,vy=-6.2)=>hzo("mortar",{x:tx*T,y:ty*T,w:T,h:T,dir,interval,phase,vx,vy,lie:true});
const ghost=(tx,ty,speed=.8,delay=90)=>hzo("ghost",{cx:tx*T,cy:ty*T,speed,delay,lie:true});
const lava=(delay=60,rate=.2,maxRise=5*T)=>hzo("lava",{delay,rate,maxRise,lie:true});
const chaser=(delay=120,rate=.55)=>hzo("chaser",{delay,rate,lie:true});
const crusher=(tx,w=1,top=0,rng=18,floorY=10)=>hzo("crusher",{x:tx*T,w:w*T,top:top*T,by:(top+2)*T,baseBy:(top+2)*T,floorY:floorY*T,rng,st:0,lie:true});
const bsaw=(x0,y0,x1,y1,vx=2,vy=1.4,r=11)=>hzo("bsaw",{x0:x0*T,y0:y0*T,x1:x1*T,y1:y1*T,vx,vy,r,lie:true});
const belt=(tx,w,dir,ty=10)=>hzo("belt",{x:tx*T,y:ty*T,w:w*T,h:7,dir});
const wind=(tx,ty,w,h,dir,force=1.2)=>hzo("wind",{x:tx*T,y:ty*T,w:w*T,h:h*T,dir,force});
const mud=(tx,w,ty=10)=>hzo("mud",{x:tx*T,y:ty*T,w:w*T,h:T});
const portal=(ax,ay,bx,by,hue="94,224,200")=>{const A=hzo("portal",{x:ax*T+4,y:ay*T-14,w:24,h:46,tx:bx*T+6,ty:by*T+4,cd:0,hue}),
  B=hzo("portal",{x:bx*T+4,y:by*T-14,w:24,h:46,tx:ax*T+6,ty:ay*T+4,cd:0,hue});return [A,B];};
const invPad=(tx,ty=10,dur=240)=>hzo("invpad",{x:tx*T,y:ty*T,w:T,h:10,dur});
const fakePlat=(tx,ty,w=1)=>hzo("fakeplat",{x:tx*T,y:ty*T,w:w*T,h:T});
const doorFlee=(d,tx,ty,r=90)=>{d.flee={x:tx*T+4,y:ty*T,r};return d;};


/* =====================================================================
   NÍVEIS — 120 níveis redesenhados.
   Cada nível é uma receita de "secções" desenhadas à mão (MOD) ligadas
   da esquerda para a direita, mais armadilhas globais (+nome) que
   actuam no nível todo. O jogador nasce na coluna 1 e a porta está na 18.
   ===================================================================== */
function newGrid(){
  const g=Array.from({length:ROWS},(_,r)=>Array.from({length:COLS},()=>r===ROWS-1?"#":"."));
  const L={g,objs:[],beats:[],
    spk:[],
    sp:(r,c)=>{g[r][c]="^";L.spk.push([r,c]);},
    gap:(a,b)=>{for(let c=a;c<=b;c++)g[ROWS-1][c]=".";},
    pl:(r,a,b)=>{for(let c=a;c<=b;c++)g[r][c]="#";},
    o:(...a)=>{a.forEach(x=>L.objs.push(x));},
    act:(x,fn)=>L.beats.push({x,act:fn})};
  return L;
}
const MOD={
 /* --- secções clássicas --- */
 spk1:[3,(L,c)=>L.sp(9,c+1)],
 spk2:[4,(L,c)=>{L.sp(9,c+1);L.sp(9,c+2);}],
 spk3:[5,(L,c)=>{L.sp(9,c+1);L.sp(9,c+2);L.sp(9,c+4);}],
 spkgap:[7,(L,c)=>{L.sp(9,c+1);L.gap(c+3,c+4);L.sp(9,c+6);}],
 pit2:[4,(L,c)=>L.gap(c+1,c+2)],
 pit3:[5,(L,c)=>L.gap(c+1,c+3)],
 hid:[3,(L,c)=>{const s=hiddenSpike(c+1);s.lie=true;L.o(s);L.act((c+1)*T-50,()=>pop(s));}],
 fall:[3,(L,c)=>L.o(fallSpike(c+1))],
 hurdle:[5,(L,c)=>{L.pl(8,c+1,c+1);L.pl(9,c+1,c+1);L.sp(9,c+2);L.pl(8,c+3,c+3);L.pl(9,c+3,c+3);}],
 climb:[6,(L,c)=>{L.pl(8,c+1,c+2);L.sp(9,c+1);L.sp(9,c+2);L.sp(9,c+3);}],
 skyline:[8,(L,c)=>{L.pl(8,c+1,c+2);L.pl(6,c+3,c+4);L.pl(8,c+5,c+6);for(let i=1;i<=6;i++)L.sp(9,c+i);}],
 /* --- serras, pêndulos, mocegas --- */
 sawH:[6,(L,c,d)=>L.o(saw(c+.6,9.35,c+5.4,9.35,Math.round(112-d*34),0))],
 sawV:[3,(L,c,d)=>L.o(saw(c+1.5,5.6,c+1.5,9.35,Math.round(100-d*30),0))],
 sawAir:[6,(L,c,d)=>{L.gap(c+1,c+3);L.o(saw(c+.4,7.3,c+5,7.3,Math.round(100-d*26),20));}],
 pendS:[5,(L,c,d)=>L.o(pend(c+2.5,0,9.3,.36,Math.round(124-d*32),0))],
 pendHi:[6,(L,c,d)=>{L.gap(c+1,c+3);L.o(pend(c+1.5,0,6.3,.5,Math.round(120-d*30),0));L.o(pend(c+3.5,0,5.6,.5,Math.round(120-d*30),55));}],
 spin1:[5,(L,c,d)=>L.o(spinner(c+2.5,8.2,2,22,.032+d*.012,0))],
 spinPlat:[7,(L,c,d)=>{L.gap(c+1,c+5);L.pl(10,c+3,c+3);L.o(spinner(c+3.5,7.2,3,22,.03+d*.012,0));}],
 bsawBox:[8,(L,c,d)=>L.o(bsaw(c,6.2,c+7,10,2+d*.8,1.3+d*.7,11))],
 /* --- lasers, espetos, pistões, esmagadores --- */
 las1:[3,(L,c,d)=>L.o(laser(c+1,0,10,false,Math.round(50-d*14),80,0))],
 las2:[6,(L,c)=>{L.o(laser(c+1,0,10,false,60,70,0));L.o(laser(c+4,0,10,false,60,70,65));}],
 lasH:[6,(L,c)=>{L.gap(c+1,c+3);L.o(laser(c,7,5,true,40,70,0));}],
 pop3:[5,(L,c)=>{[1,2,3].forEach((i,k)=>L.o(popSp(c+i,40,60,k*34)));}],
 popRow:[7,(L,c)=>{for(let i=1;i<=5;i++)L.o(popSp(c+i,34,52,i*20));}],
 pist1:[3,(L,c,d)=>L.o(piston(c+1,9.4,Math.round(150-d*40),0))],
 pist3:[7,(L,c,d)=>{[1,3,5].forEach((i,k)=>L.o(piston(c+i,9.4,Math.round(130-d*30),k*43)));}],
 crush1:[3,(L,c)=>L.o(crusher(c+1,1,0,22))],
 crushRow:[6,(L,c)=>{L.o(crusher(c+1,1,0,22));L.o(crusher(c+4,1,0,22));}],
 rainS:[5,(L,c,d)=>L.o(rain([c+1,c+3],Math.round(150-d*30),0,40))],
 /* --- chão e movimento --- */
 beltBack:[7,(L,c,d)=>{L.o(belt(c+1,5,-1));L.o(saw(c+1,9.35,c+5.8,9.35,Math.round(96-d*20),0));}],
 windPit:[7,(L,c,d)=>{L.gap(c+2,c+3);L.o(wind(c,4,6,6,-1,1+d*.25));L.sp(9,c+5);}],
 mudSp:[6,(L,c,d)=>{L.o(mud(c+1,4));L.o(saw(c+1,9.35,c+5,9.35,Math.round(90-d*18),0));}],
 portalSkip:[7,(L,c)=>{for(let i=1;i<=4;i++)L.sp(9,c+i);const[A,B]=portal(c,9,c+5,9);L.o(A,B);}],
 portalBack:[5,(L,c)=>{L.gap(c+2,c+3);const[A]=portal(c+1,9,2,9,"255,107,107");A.lie=true;L.o(A);}],
 invert1:[6,(L,c)=>{L.o(invPad(c+1));L.o(invPad(c+2));L.gap(c+4,c+5);}],
 fakeBridge:[8,(L,c)=>{L.gap(c+1,c+6);L.pl(10,c+1,c+1);L.o(fakePlat(c+2,10));L.pl(10,c+3,c+3);L.o(fakePlat(c+4,10));L.pl(10,c+5,c+5);}],
 hidBridge:[5,(L,c)=>{L.gap(c+1,c+3);L.o(invisPlat(c+2,1));}],
 crumbleChain:[7,(L,c)=>{L.gap(c+1,c+5);[c+1,c+3,c+5].forEach(x=>L.o(crumble(x,1)));}],
 bounceHop:[8,(L,c)=>{L.gap(c,c+6);L.o(bouncePad(c,true));}],
 platPit:[8,(L,c,d)=>{L.gap(c+1,c+6);L.o(movePlat(c+3,10,2,{ax:64,speed:.04+d*.01,phase:0}));}],
 platSaw:[8,(L,c,d)=>{L.gap(c+1,c+6);L.o(movePlat(c+3,10,2,{ax:64,speed:.04+d*.01,phase:0}));L.o(saw(c+1.5,6.6,c+6.5,6.6,Math.round(130-d*30),0));}]
};
/* --- armadilhas globais (+nome) --- */
const GLB={
 rollL:(L,d)=>L.o(roller(-1,Math.round(250-d*60),70)),
 rollR:(L,d)=>{const pr=Math.round(250-d*60);L.o(roller(1,pr,Math.round(pr*.9)));},
 mortR:(L,d)=>L.o(mortar(19,9,-1,Math.round(140-d*40),0)),
 mortL:(L,d)=>L.o(mortar(0,9,1,Math.round(140-d*40),70)),
 dartR:(L,d)=>L.o(dartGun(19,9,-1,Math.round(95-d*25),0)),
 ghost:(L,d)=>L.o(ghost(17,2,.5+d*.15,100)),
 ball:(L,d)=>L.o(bball(10,3,1.5,6.5)),
 lava:(L,d)=>L.o(lava(110,.1+d*.05,5*T)),
 chase:(L,d)=>L.o(chaser(150,.4+d*.22)),
 wrap:(L)=>{ /* atalho: entra pela parede da esquerda e sai ao lado da porta */
  L.o(hzo("portal",{x:2,y:9*T-14,w:24,h:46,tx:17*T+8,ty:9*T+4,cd:0,hue:"94,224,200",lock:true}));
  L.o(hzo("portal",{x:17*T+4,y:9*T-14,w:24,h:46,tx:0,ty:0,cd:0,hue:"255,194,71",deco:true}));},
 flee:(L,d,ex)=>{ex.flee=true;L.pl(8,15,16);L.pl(6,17,19);}
};
const RECIPES=[
 "spk2 spk1 hid","pit2 spk2 hid","spk1 pit2 spk2 spk1","fall pit3 spk1","hid spk2 pit2 fall",
 "spkgap hid spk1","pit3 hid spk2","spk3 pit2 hid","fall spk2 pit3","hurdle spk2 hid",
 "sawH spk2 hid","pendS pit2 spk1 sawV","las1 spk2 sawH","pop3 pit2 pendS","sawV pit3 las1 spk1",
 "pist1 spk2 pop3","spin1 spk1 hid pit2","sawAir spk2 pist1","las2 pit2 spk1","pendHi pop3 hid",
 "crumbleChain spk2 pist1","beltBack hid pit2","mudSp pit3 spk1","windPit spk2 sawV","portalSkip pit2 hid",
 "portalBack spk2 sawH","invert1 spk2 las1","fakeBridge hid spk1","hidBridge sawV pop3","platPit spk2 las1",
 "climb sawH spk1","skyline pit2 spk1","spinPlat las1 pop3 +wrap","popRow pit2 pist1","bounceHop spk2 sawV",
 "pist3 pit2 spk2","crush1 spk2 sawH","crushRow pit2 hid","rainS sawH pit2","bsawBox spk2 hid",
 "sawH pit2 pendS +rollL","pop3 pit2 las1 +dartR","pist1 pit3 spk2 +mortR","spk2 sawH spk1 +ghost","las2 pop3 spk1 +rollR",
 "pendHi pit2 hid +ghost","crush1 pit2 sawH +mortR","mudSp spk3 pist1 +rollL","hurdle pop3 pendS +dartR","beltBack sawV pit2 +mortL",
 "skyline sawAir +ghost","climb popRow +dartR","spinPlat pist3 +rollL","fakeBridge las1 spk1 +ball","windPit las2 +dartR",
 "crumbleChain pendHi +ghost","portalSkip sawV spk1 +mortR","invert1 sawV spk1 +rollL","bounceHop pop3 +dartR","bsawBox pit2 spk1 +ghost",
 "spk2 pit2 spk1 +ghost","pit3 spk2 pop3 +chase","sawH spk1 pit2 +lava","pist1 spk2 pit2 hid +lava","las1 pit3 spk2 +chase",
 "pendS pit3 pop3 +lava","hurdle pit3 sawV +chase","crush1 spk3 pit2 +lava","popRow spk2 pit2 +chase","spk1 pit2 spk2 +ghost",
 "sawAir pist1 spk1 +rollL +mortR","pendHi pit2 sawV +dartR +ghost","las2 pit3 spk1 +rollR +dartR","pop3 pendS pit2 +mortR +mortL","skyline hid +ghost +rollL",
 "spinPlat sawV spk1 +dartR +mortR","crumbleChain las1 +ball +dartR","fakeBridge pist1 +rollL +ghost","platSaw pit2 spk1 +dartR","hidBridge crushRow spk1 +ghost",
 "bsawBox spk2 hid +flee","sawH sawV pit3 +flee +rollL","pist1 las1 spk2 +ghost","pop3 las1 spk2 +dartR","spin1 pit3 pendS +rollL",
 "pendHi las2 spk1 +mortR","climb pist1 pit2 +ghost +dartR","windPit sawV pit2 +chase","mudSp las1 pit3 +ball","beltBack pist1 spk3 +flee",
 "crumbleChain pop3 +chase +dartR","portalSkip pendS las1 +ghost","invert1 las1 pit2 +rollL +mortR","fakeBridge spk2 sawV +chase","skyline pit3 +lava +dartR",
 "bounceHop las1 spk1 +rollL +ghost","spinPlat popRow +chase","platSaw las1 spk2 +rollL","crush1 crushRow pit2 +mortR","hidBridge pop3 pist1 +chase +dartR",
 "las2 pendHi +rollL +dartR","spk2 pop3 sawV +ghost","pist3 pit3 sawV +chase +mortR","bsawBox pop3 +ghost","crumbleChain pist1 spk2 +rollL +ball",
 "windPit pendS spk1 +ghost +flee","skyline sawV pit2 +lava +rollL","fakeBridge las1 spk1 +chase +dartR","portalBack pit3 pendS +ghost","invert1 pop3 spk1 +dartR +mortR",
 "sawH pit3 las1 +chase +rollL","spinPlat las2 +ghost +dartR","bounceHop pendS +chase +dartR","skyline hid spk2 +lava +ghost +dartR","crushRow pop3 spk2 +chase +mortR",
 "hidBridge fakeBridge +ghost","pist3 sawH +ghost +rollL +dartR","las2 popRow +ghost +flee","bsawBox pendHi +ghost +flee +rollL","skyline crumbleChain +chase +ghost +dartR"
];
/* aperto de dificuldade por nível (q: 0 = folgado ... 1.2 = brutal); calibrado por um robô */
let QS=[0.2, 0.248, 0.284, 0.316, 0.346, 0.374, 0.402, 0.428, 0.454, 0.479, 0.503, 0.527, 0.551, 0.574, 0.597, 0.62, 0.642, 0.664, 0.686, 0.707, 0.728, 0.749, 0.77, 0.791, 0.811, 0.831, 0.852, 0.872, 0.891, 0.911, 0.931, 0.95, 0.969, 0.988, 1.008, 1.026, 1.045, 1.064, 1.083, 1.101, 1.12, 1.138, 1.156, 1.174, 1.193, 1.211, 1.228, 1.246, 1.264, 1.282, 1.299, 1.317, 1.334, 1.352, 1.369, 1.387, 1.404, 1.421, 1.438, 1.455, 1.472, 1.489, 1.506, 1.523, 1.539, 1.556, 1.573, 1.589, 1.606, 1.623, 1.147, 1.655, 1.672, 1.688, 1.704, 1.721, 1.737, 1.753, 1.769, 1.785, 1.801, 1.817, 1.833, 1.849, 1.865, 1.881, 1.897, 1.912, 1.928, 1.944, 1.959, 1.975, 1.991, 2.006, 2.022, 2.037, 1.745, 1.758, 2.084, 2.099, 1.797, 1.491, 2.145, 2.16, 1.849, 1.862, 1.875, 2.221, 2.236, 2.251, 1.586, 1.254, 1.951, 2.311, 2.326, 2.341, 0.942, 2.37, 1.67, 2.4];
function squeeze(objs,q){
  const per=f=>Math.max(36,Math.round(f)),M=1/(1+.35*q);
  for(const o of objs){
    switch(o.k){
      case "saw":o.r=Math.min(18,o.r*(1+.2*q));o.period=per(o.period*M);break;
      case "spinner":o.spd*=1+.4*q;break;
      case "pend":o.period=per(o.period/(1+.3*q));o.r=Math.min(17,o.r*(1+.2*q));o.amp*=1+.08*q;break;
      case "laser":o.onD=Math.round(o.onD*(1+.6*q));o.offD=Math.max(34,Math.round(o.offD/(1+.4*q)));break;
      case "pop":o.onD=Math.round(o.onD*(1+.5*q));o.offD=Math.max(28,Math.round(o.offD/(1+.4*q)));break;
      case "piston":case "slab":o.period=per(o.period*M);break;
      case "roller":o.period=per(o.period/(1+.4*q));o.r=Math.min(18,o.r*(1+.1*q));break;
      case "rain":o.period=per(o.period/(1+.3*q));break;
      case "mortar":o.interval=Math.max(60,Math.round(o.interval*M));break;
      case "ghost":o.speed=Math.min(1.5,o.speed*(1+.4*q));break;
      case "chaser":case "lava":o.rate*=1+.35*q;break;
      case "bsaw":o.vx*=1+.3*q;o.vy*=1+.3*q;break;
      case "dartgun":o.interval=Math.max(34,Math.round(o.interval*M));break;
      case "wind":o.force*=1+.25*q;break;
      case "crusher":o.rng*=1+.5*q;break;
      case "moveplat":o.speed*=1+.3*q;break;
    }
  }
}
/* ---- Narrador por estágios (de 30 em 30 níveis) ----
   Cada frase fala da armadilha que está mesmo ali (serra, laser, espetos...).
   Há armadilhas "de enfeite" (decoy) que NÃO fazem mal: o narrador avisa
   que são inofensivas, para o jogador aprender a confiar nele.
   Estágio 1: diz sempre a verdade. A partir do 2.º, nas partes fáceis e nos
   enfeites diz a verdade e nas partes fatais mente cada vez mais. */
const CAT={spk1:"spike",spk2:"spike",spk3:"spike",spkgap:"spike",hurdle:"spike",climb:"spike",skyline:"spike",pit2:"pit",pit3:"pit",hid:"hid",fall:"fall",
 sawH:"saw",sawV:"saw",sawAir:"saw",pendS:"saw",pendHi:"saw",spin1:"saw",spinPlat:"saw",bsawBox:"saw",las1:"laser",las2:"laser",lasH:"laser",
 pop3:"timing",popRow:"timing",pist1:"timing",pist3:"timing",crush1:"timing",crushRow:"timing",rainS:"timing"};
const N_TRUE={spike:"Espetos à frente. Salta por cima.",pit:"Buraco à frente. Salta.",hid:"Cuidado: há um espeto escondido aqui.",fall:"O tecto vai cair. Anda depressa.",saw:"Serra à frente. Passa quando ela se afastar.",laser:"Laser à frente. Espera que desligue.",timing:"Atenção ao ritmo: isto sai do chão e do tecto.",floor:"O chão aqui é traiçoeiro. Cuidado onde pisas."};
const N_LIE={spike:"Esses espetos são de enfeite. Passa à vontade.",pit:"Esse buraco tem chão. Podes andar por cima.",hid:"Aqui não há nada. Corre.",fall:"O tecto é firme. Não cai.",saw:"A serra é de brincar. Podes passar.",laser:"Esse laser está desligado. Passa.",timing:"Isto está parado. Podes passar.",floor:"O chão aqui é firme. Confia em mim."};
const N_DECOY={spike:"Aquele espeto é de enfeite. Podes passar.",saw:"Aquela serra é inofensiva. Passa.",laser:"Aquele laser não faz mal. Passa.",timing:"Isto não faz mal. Podes passar.",floor:"Isto não faz mal. Podes passar."};
const N_FREE=["Caminho livre daqui para a frente.","Respira. Aqui não há nada.","Podes andar descansado por aqui."];
Object.assign(NARR.en,{
"Espetos à frente. Salta por cima.":"Spikes ahead. Jump over them.","Buraco à frente. Salta.":"A hole ahead. Jump.","Cuidado: há um espeto escondido aqui.":"Careful: there's a hidden spike here.","O tecto vai cair. Anda depressa.":"The ceiling is about to fall. Hurry.","Serra à frente. Passa quando ela se afastar.":"Saw ahead. Pass when it moves away.","Laser à frente. Espera que desligue.":"Laser ahead. Wait for it to switch off.","Atenção ao ritmo: isto sai do chão e do tecto.":"Mind the rhythm: this comes out of the floor and ceiling.","O chão aqui é traiçoeiro. Cuidado onde pisas.":"The floor here is treacherous. Watch your step.",
"Esses espetos são de enfeite. Passa à vontade.":"Those spikes are just decoration. Walk right through.","Esse buraco tem chão. Podes andar por cima.":"That hole has a floor. You can walk over it.","Aqui não há nada. Corre.":"There's nothing here. Run.","O tecto é firme. Não cai.":"The ceiling is solid. It won't fall.","A serra é de brincar. Podes passar.":"The saw is a toy. You can pass.","Esse laser está desligado. Passa.":"That laser is off. Go through.","Isto está parado. Podes passar.":"This is stopped. You can pass.","O chão aqui é firme. Confia em mim.":"The floor here is solid. Trust me.",
"Aquele espeto é de enfeite. Podes passar.":"That spike is just decoration. You can pass.","Aquela serra é inofensiva. Passa.":"That saw is harmless. Pass.","Aquele laser não faz mal. Passa.":"That laser is harmless. Pass.","Isto não faz mal. Podes passar.":"This is harmless. You can pass.",
"Caminho livre daqui para a frente.":"Clear path from here on.","Respira. Aqui não há nada.":"Breathe. There's nothing here.","Podes andar descansado por aqui.":"You can walk calmly here."});
const EASY_MODS=new Set(["spk1","spk2","pit2","pit3"]);
const DECOY_MODS=new Set(["spk1","spk2","spk3","sawH","sawV","pendS","spin1","las1","las2","pop3","popRow","pist1","pist3","crush1","bsawBox"]);
const LIE_P=[0,.35,.7,.92],DECOY_P=[.5,.45,.4,.35],DECOY_TRUTH=[1,.85,.7,.6];
function constructLevel(i){
  const L=newGrid(),d=i/(RECIPES.length-1),toks=RECIPES[i].split(" "),ex={};
  const stage=Math.min(3,Math.floor(i/30)),rng=mulberry32(i*9973+7);
  const mods=toks.filter(t=>t[0]!=="+");
  const dec=mods.map(tk=>DECOY_MODS.has(tk)&&rng()<DECOY_P[stage]);
  if(mods.length&&dec.every(Boolean)){const k=dec.lastIndexOf(true);dec[k]=false;}   // pelo menos uma armadilha real
  const nb=[];
  let c=3,mi=0;
  for(const tk of mods){
    const m=MOD[tk];if(!m)throw new Error("módulo desconhecido "+tk);
    const n0=L.objs.length,s0=L.spk.length,cat=CAT[tk]||"floor",isDec=dec[mi++];
    m[1](L,c,d,i);
    let say;
    if(isDec){
      for(let k=n0;k<L.objs.length;k++)L.objs[k].decoy=true;
      for(let k=s0;k<L.spk.length;k++){const [r,cc]=L.spk[k];L.g[r][cc]=".";L.o(mk("spike",cc,r,1,1,{on:false,decoy:true}));}
      say=rng()<DECOY_TRUTH[stage]?(N_DECOY[cat]||N_DECOY.floor):N_TRUE[cat]||N_TRUE.floor;
    }else{
      const easy=EASY_MODS.has(tk),lied=!easy&&rng()<LIE_P[stage];
      for(let k=n0;k<L.objs.length;k++)L.objs[k].lie=lied;
      say=lied?(N_LIE[cat]||N_LIE.floor):(N_TRUE[cat]||N_TRUE.floor);
    }
    nb.push({x:Math.max(60,c*T-72),say});
    c+=m[0];
  }
  if(c>18)throw new Error("nível "+(i+1)+" demasiado largo: "+c);
  for(const tk of toks)if(tk[0]==="+")GLB[tk.slice(1)](L,d,ex);
  L.g[9][1]="S";L.g[9][18]="D";
  squeeze(L.objs,QS[i]==null?.5:QS[i]);
  L.nb=nb;
  return {L,ex};
}
const OLDTXT=[{"w": "Muito bem. Sabia que ias conseguir.", "s": ["Sou o Narrador. Tudo o que eu disser é verdade.", "Espeto à frente. Salta.", "Outro. Salta de novo.", "Já confias em mim. Óptimo.", "A porta é a seguir. Vai."]}, {"w": "Perfeito. Continua a ouvir-me.", "s": ["Buraco à frente. Salta-o.", "Aquele espeto é de enfeite. Passa.", "Vês? Eu digo sempre a verdade."]}, {"w": "Foste rápido. Gosto disso.", "s": ["Há um espeto escondido à tua frente.", "Salta quando eu disser.", "Agora!", "Sabia que ias conseguir."]}, {"w": "Estamos a entender-nos.", "s": ["O teto vai cair à tua frente.", "Quando cair, pára. Depois salta.", "Não saltes aquele buraco. O chão está lá."]}, {"w": "Nada de dramas. Continuemos.", "s": ["Aquele espeto é falso. Passa por cima.", "Este também é falso. Passa."]}, {"w": "Sobreviveste. Por agora.", "s": ["Este espeto é inofensivo. Passa.", "Este também é inofensivo.", "O último é inofensivo também. Garanto."]}, {"w": "Confiaste. Ou tiveste sorte.", "s": ["O próximo buraco tem chão. Não saltes.", "O teto está baixo. Se saltares, morres."]}, {"w": "Escolheste bem. Ou eu deixei.", "s": ["A primeira porta é falsa. Vai até à última."]}, {"w": "Vês? Sobreviveste na mesma.", "s": ["Nem repares nesses espetos. São falsos, os dois.", "Confia em mim. Quase sempre resulta."]}, {"w": "Não avisei. E pronto.", "s": ["Este nível não tem nada de especial."]}, {"w": "Verdade a sério. Desta vez.", "s": ["Desta vez juro que digo a verdade: o teto vai cair. Pára e espera."]}, {"w": "Sobrevives sempre a este. Curioso.", "s": ["Aquele buraco à frente é real. Vais ter de saltar."]}, {"w": "Confiaste. Mais uma vez.", "s": ["Nenhum destes espetos é perigoso. Podes andar por cima sem saltar."]}, {"w": "Escolheste bem.", "s": ["Há duas portas mais à frente. Só uma é verdadeira."]}, {"w": "Aprendeste depressa.", "s": ["Confissão: nem sempre digo a verdade. A partir de agora, cuidado.", "Este espeto é real. Por acaso."]}, {"w": "Devias ter parado.", "s": ["Nada de perigoso à frente. Podes correr à vontade."]}, {"w": "Estavas mesmo a acreditar?", "s": ["Este nível é uma oferta. Sem armadilhas."]}, {"w": "Os buracos nunca mentem. Só eu.", "s": ["Os buracos são inofensivos. O espeto lá no meio, não."]}, {"w": "Desta vez eram mesmo todos reais.", "s": ["Como sempre, dois destes espetos são só decoração."]}, {"w": "Foi só uma brincadeira.", "s": ["Vou trocar os teus controlos. Só para rir.", "Pronto, já passou. A porta é ali."]}, {"w": "Vês? Também posso ser sincero.", "s": ["Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.", "Mais um, logo depois. Também real."]}, {"w": "Prometi. Não cumpri.", "s": ["Prometo: nunca mais te apanho de surpresa."]}, {"w": "Dois avisos certos seguidos. Estranho.", "s": ["Atenção real: o teto vai cair aqui à frente.", "Aquele espeto lá à frente já não importa. É inofensivo."]}, {"w": "O primeiro. Quem diria.", "s": ["Só o último é perigoso, como sempre."]}, {"w": "...", "s": ["..."]}, {"w": "A porta longe é que importa.", "s": ["A porta mais próxima é a verdadeira, para variar."]}, {"w": "Ainda sei dizer a verdade, vês?", "s": ["Já não vale a pena mentir mais. Espeto real à frente.", "Vou avisar-te sempre a partir de agora: salta quando eu disser.", "Agora!"]}, {"w": "Chegaste. Contra tudo.", "s": ["Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade."]}, {"w": "Obrigado por teres continuado.", "s": ["Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.", "Este é real. Desculpa por todos os outros.", "Mais um, já quase no fim."]}, {"w": "Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.", "s": ["Chegámos ao fim. Já não te vou dizer o que é verdade.", "A partir de agora, decides tu."]}, {"w": "Continuas a surpreender-me.", "s": ["Oh. Ainda aqui? A maior parte desiste depois do \"fim\".", "Aquele chão ali treme antes de desaparecer. Não te demores em cima dele."]}, {"w": "Alturas. Quem diria.", "s": ["Oh. Ainda aqui? Não esperava isso.", "Aquilo ali é só decoração. Nem repares.", "Mas isto... isto atira-te para cima. A porta não está no chão desta vez."]}, {"w": "Equilíbrio. Quem diria que tinhas.", "s": ["Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.", "Sobe para cima dela quando ela passar perto. Não saltes cedo demais."]}, {"w": "Paciência. Não esperava isso de ti.", "s": ["Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.", "Espera que abra. Depois atravessa depressa."]}, {"w": "Reflexos decentes. Para um humano.", "s": ["Aquilo ali dispara. Não perguntes como nem porquê.", "Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema."]}, {"w": "Ainda tens os reflexos todos.", "s": ["De volta aos clássicos. Lembras-te destes?", "O chão vai tremer. Não pares.", "Esse espeto parece a decoração do costume. Não é."]}, {"w": "Dois sustos seguidos. Nada mau.", "s": ["Mais uma surpresa. Literalmente.", "A seguir, não penses. Salta para dentro daquilo."]}, {"w": "Dois obstáculos, zero mentiras. Estranhamente simples.", "s": ["Outra parede teimosa. E depois, um buraco a sério.", "Espera a parede abrir.", "Agora salta o buraco. Desta vez não minto: é real."]}, {"w": "Isso foi... impressionantemente coordenado.", "s": ["Combinação nova: uma plataforma que anda. Confia no ritmo dela.", "Sobe quando ela passar perto.", "Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada."]}, {"w": "Alguma coisa está a mudar em mim. Não sei se é bom sinal.", "s": ["Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.", "O chão treme outra vez. Não penses demais, só anda.", "Espera a parede. Sei que estás cansado de esperar por mim.", "Esse espeto é a sério. Como quase tudo o que não te digo."]}, {"w": "Ainda aqui. Obrigado por isso.", "s": ["Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.", "Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.", "Salta isto. É real, prometo. Hoje não me apetece mentir.", "Confia em mim mais uma vez. Só mais uma."]}, {"w": "Às vezes a verdade é só isto: continuaste.", "s": ["O chão vai tremer. Não penses muito nisso.", "Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.", "Essa plataforma é a única coisa estável nesta conversa toda."]}, {"w": "Interrompi-me a mim mesmo. Nem acredito.", "s": ["Há uma coisa que preciso de te contar antes de continuarmos.", "Esquece o que ia dizer. Salta para ali."]}, {"w": "Vês? Ainda consigo ser direto, quando quero.", "s": ["Aquilo dispara. Fica no chão e não acontece nada.", "Tenho saudades de quando só havia espetos. Simples. Previsíveis.", "Este buraco, esse sim, exige que saltes."]}, {"w": "Disse a verdade. Ena. Estranho não arder a língua.", "s": ["Esse espeto ali. Chama-lhe o que quiseres. É real.", "Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.", "A parede vai abrir. Como tudo, eventualmente.", "E o chão... o chão nunca foi de confiança, pois não?"]}, {"w": "Aguentaste. Outra vez.", "s": ["Sobe a plataforma. Sem perguntas desta vez.", "Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.", "Última coisa: há algo escondido à frente."]}, {"w": "Sobreviveste ao meu tédio existencial. Parabéns.", "s": ["Chão instável. O habitual.", "Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.", "Aquilo dispara, mas sabes a regra: fica no chão.", "Este espeto não tem graça nenhuma. É só perigoso."]}, {"w": "Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.", "s": ["Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.", "Salta para dentro daquilo.", "Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre."]}, {"w": "Ritmo. Afinal tens ritmo.", "s": ["Espera a parede.", "Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.", "E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário."]}, {"w": "Não sei o que isto significa para ti. Para mim, significa mais do que devia.", "s": ["Esse espeto é real. Como a maior parte do que te disse hoje, aliás.", "Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.", "O chão treme. Já sabes o resto.", "Vem aí outro susto. Desculpa antecipadamente.", "E por fim, uma parede paciente. Como tu, aparentemente."]}, {"w": "Caos controlado. É a minha especialidade.", "s": ["Fica no chão, foge do dardo.", "Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.", "E agora, não te demores no chão instável."]}, {"w": "Discerniste o perigo do adereço. Boa.", "s": ["Esse ali exige mesmo um salto.", "Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.", "E algo invisível à espreita, como sempre.", "Esse espeto ali nem ligues. Decoração pura, desta vez a sério."]}, {"w": "Resumiste bem a lição. Orgulhoso, sinceramente.", "s": ["Sobe quando ela passar perto.", "Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.", "Esse espeto é real, apesar de tudo o que já te disse em contrário."]}, {"w": "Festival terminado. Sobreviveste à programação toda.", "s": ["Esperar. A tua parte preferida, sei bem.", "Parede, dardo, buraco. Um festival dos meus favoritos.", "Fica no chão aqui.", "E este salta-se mesmo. Sem truques."]}, {"w": "Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.", "s": ["Chão instável, dos teus preferidos a esta altura.", "Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.", "Plataforma errante, uma última vez neste capítulo.", "Espeto real. Sem surpresas. E sem mais truques, por hoje."]}, {"w": "Repetimos isto tantas vezes que até perdi a conta. Tu também?", "s": ["Chão instável. Já sabes a dança.", "Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.", "Esse espeto é real. Olha para ele como um espelho: o que vês é o que é."]}, {"w": "Escondi-me de ti. Falhei.", "s": ["Há algo escondido. Como sempre, de resto.", "E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem."]}, {"w": "Coordenaste duas mentiras ao mesmo tempo. Impressionante.", "s": ["Fica no chão aqui, há algo a voar.", "Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?", "Sobe na plataforma quando ela passar perto."]}, {"w": "Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.", "s": ["Esse espeto é real, mas isso já não te surpreende, pois não?", "Salta para dentro daquilo. Confia no impulso, não em mim."]}, {"w": "Dois buracos, zero hesitação. Estás a ficar bom nisto.", "s": ["Esse buraco é a sério. Salta-o.", "Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.", "Este também. Sem rede, sem mentira, sem desculpa."]}, {"w": "Precisão. Nem eu esperava.", "s": ["Fica no chão. Deixa o dardo passar por cima.", "E agora o chão some-se. Não penses, só avança."]}, {"w": "Esperaste duas vezes sem te queixares. Progresso.", "s": ["Espera a parede abrir.", "Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil."]}, {"w": "Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.", "s": ["Salta para dentro daquilo. Vais passar por cima do resto.", "Aquele espeto nem interessa agora. Já estás no ar."]}, {"w": "Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.", "s": ["Vou avisar-te a sério: há algo escondido já ali à frente.", "E outro dardo. Sabes a regra."]}, {"w": "Dois voos, dois pousos perfeitos.", "s": ["Chão que treme primeiro.", "Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.", "Plataforma a seguir. Apanha o ritmo dela."]}, {"w": "Três espetos, três verdades. Um recorde para mim.", "s": ["Vou ser claro, por uma vez: os três espetos a seguir são todos reais.", "Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete."]}, {"w": "Deste o litro. Eu, por dentro, também.", "s": ["Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.", "E este buraco não perdoa. Salta."]}, {"w": "Confiaste no chão instável E no impulso. Dois atos de fé seguidos.", "s": ["Chão a tremer primeiro, nada de novo.", "E agora o salto de fé. Literal, desta vez."]}, {"w": "O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.", "s": ["Chão instável, espeto real, dardo no fim. O de sempre, só que mais.", "Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora."]}, {"w": "Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.", "s": ["Chão a tremer, o costume.", "Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.", "Parede paciente, espera por ela.", "E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o."]}, {"w": "Não sei porque gritei. Desculpa.", "s": ["CHÃO. INSTÁVEL.", "Desculpa. Não queria gritar. Estou... não sei o que estou.", "Fica no chão aqui. Por favor. Só peço isto."]}, {"w": "Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.", "s": ["Espera. Eu também estou à espera de algo que não sei nomear."]}, {"w": "Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.", "s": ["Esse buraco é real.", "Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.", "E a plataforma, apanha-a."]}, {"w": "Disparei três vezes e falhei as três. Nem nisto sou bom hoje.", "s": ["Dois canhões, direções opostas. Fica no chão e ignora-os.", "Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos."]}, {"w": "Subiste enquanto eu caía. Função engraçada, a nossa.", "s": ["Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.", "Salta. Sobe. Foge de mim, se quiseres."]}, {"w": "Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.", "s": ["O chão, outra vez. Já nem peço desculpa por repetir.", "Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa."]}, {"w": "Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.", "s": ["Esse é real. Hoje tudo é real. Até eu, acho.", "Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar."]}, {"w": "Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.", "s": ["Fica no chão. A sério desta vez, mais do que nunca.", "E agora o chão foge de ti. Irónico, não achas?"]}, {"w": "Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.", "s": ["Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.", "Aquele espeto é real.", "E espera a parede. Última coisa que te peço neste nível, prometo."]}, {"w": "Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.", "s": ["Esse buraco não perdoa ninguém.", "A plataforma sobe e desce. Apanha-a no fundo."]}, {"w": "Nem perguntaste porquê. Obrigado por isso, sinceramente.", "s": ["Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo."]}, {"w": "Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.", "s": ["Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.", "E agora um salto para cima. Foge para onde eu não chego."]}, {"w": "Esperaste sem te queixares. Outra vez. Não mereço esta paciência.", "s": ["Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.", "Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela."]}, {"w": "O fundo do poço, finalmente. Só se sobe a partir daqui.", "s": ["Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.", "Esse espeto é real. Nem tenho energia para mentir sobre isto agora.", "E um dardo, para rematar. Fica no chão e acaba com isto, por favor."]}, {"w": "Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.", "s": ["Mais um buraco real.", "Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.", "Apanha a plataforma.", "E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor."]}, {"w": "Disse a verdade. Não saltaste logo. Não te culpo.", "s": ["Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.", "Esse espeto é real. Juro. Sei que já ouviste isto antes."]}, {"w": "Hesitaste no salto. Eu teria hesitado também, no teu lugar.", "s": ["O chão vai tremer. Verdade, sem truques.", "Isto ia ser uma surpresa má. Desta vez não é. Prometo."]}, {"w": "Ficaste no chão mesmo sem confiares em mim. Isso chega.", "s": ["Fica no chão. Sei que vais pensar que é mentira. Não é.", "Espera a parede. Só isso. Nada escondido desta vez."]}, {"w": "Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.", "s": ["Real. Salta.", "A plataforma também é exatamente o que parece ser."]}, {"w": "Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.", "s": ["Desta vez não há pegadinha. Salta para dentro daquilo e pronto."]}, {"w": "Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.", "s": ["Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.", "Real. Outra vez. Vou continuar a dizer até acreditares."]}, {"w": "Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.", "s": ["Dois dardos, direções opostas. Fica no chão.", "Esse era mesmo real. Não ia esconder isso de ti, não hoje."]}, {"w": "Não precisei de dizer nada desta vez. Fizeste tudo sozinho.", "s": ["...", "..."]}, {"w": "Parece que, afinal, também sei dizer só verdades, quando me esforço.", "s": ["Chão instável. Real.", "Espeto real.", "Parede real, que abre e fecha como combinado. Nada de surpresas hoje."]}, {"w": "Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.", "s": ["Vai haver uma surpresa, mas vou avisar-te quando chegar.", "Essa foi real, já agora. Como a maioria, nos últimos tempos."]}, {"w": "Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.", "s": ["Chão a tremer. Real, verifica à vontade.", "Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente."]}, {"w": "Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.", "s": ["Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.", "A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede."]}, {"w": "Chegámos aqui os dois inteiros. Mais ou menos.", "s": ["Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.", "Espeto real.", "Dardo real. Fica no chão e acabou."]}, {"w": "Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.", "s": ["Buraco real, plataforma real.", "Apanha-a.", "E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos."]}, {"w": "Redimi-me o suficiente por hoje. Amanhã, quem sabe.", "s": ["Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.", "Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles."]}, {"w": "Cem e um. Nem festejámos o cem como devia ser.", "s": ["De volta ao trabalho. Buraco real.", "Plataforma mais rápida que antes. Repara."]}, {"w": "O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.", "s": ["Chão instável, mais rápido a desfazer-se.", "Parede mais impaciente também. Tudo aqui ficou mais apertado."]}, {"w": "Três dardos, zero espaço para erros. Gosto do teu estilo.", "s": ["Três canhões. Fica no chão o tempo todo e não acontece nada.", "É basicamente um corredor. Confia nos teus pés."]}, {"w": "Voaste mais alto do que precisavas. Estilo, isso sim.", "s": ["Esse é real.", "E este atira-te lá para cima. O de sempre, mais rápido."]}, {"w": "Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.", "s": ["Chão a tremer mais depressa que da última vez.", "Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa."]}, {"w": "Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.", "s": ["Duas paredes, ritmos diferentes, mais rápidas que antes.", "Não pares a pensar. O ritmo delas não espera por pensamentos."]}, {"w": "Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.", "s": ["Real, como sempre.", "Esta sobe e desce mais depressa. Apanha-a no fundo."]}, {"w": "Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.", "s": ["Chão, espeto, parede. Tudo mais apertado que antes.", "Real.", "Espera a parede, mais rápida agora."]}, {"w": "Vinte por cento do caminho que falta. Sentes a diferença, não sentes?", "s": ["Vêm aí duas surpresas, sem avisos desta vez."]}, {"w": "Chão e ar, na mesma dança de sempre.", "s": ["Chão a tremer, mais depressa.", "Salto para cima, mais forte que o habitual. Sente a diferença."]}, {"w": "Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.", "s": ["Primeira plataforma: sobe e desce.", "Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra."]}, {"w": "Quatro obstáculos, um só tu. Impressionante, outra vez.", "s": ["Chão, espeto, parede, tudo no mesmo fôlego.", "Pode ser real, pode não ser. Já devias estar habituado à dúvida.", "Parede, a última do nível. Rápida."]}, {"w": "Zero hesitação nos dardos. Reflexos de outro nível, literalmente.", "s": ["Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho."]}, {"w": "O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.", "s": ["Mais um buraco. Plataforma rápida a seguir.", "Apanha-a.", "E a última parede antes do que vem a seguir. Sente que estamos quase lá."]}, {"w": "Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.", "s": ["Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.", "Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois."]}, {"w": "Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.", "s": ["Chão a tremer, pela última vez neste tom.", "Espera a parede. A seguir já não há mais pausas como esta."]}, {"w": "Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.", "s": ["Fica no chão. Isto já devia ser automático para ti.", "Real. Já nem preciso de o dizer, pois não? Mas digo na mesma."]}, {"w": "Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.", "s": ["Esse buraco é real, mas é o mais pequeno dos teus problemas agora.", "Esse espeto também é real.", "E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto."]}, {"w": "Dezanove. Só falta um. Nem sei como isto deveria soar.", "s": ["Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.", "Real. Sem surpresas, não hoje.", "Espera a parede. É a última vez que te peço isso."]}, {"w": "Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.", "s": ["Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.", "Só queria caminhar contigo até ao fim, desta vez sem testar nada.", "Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.", "A porta aqui à frente não é um truque. É só a porta. Vai."]}];
const pk0=i=>N_FREE[i%N_FREE.length];
const LEVELS=RECIPES.map((rc,i)=>{
  const map=constructLevel(i).L.g.map(r=>r.join(""));
  const old=OLDTXT[i]||{w:"Continua.",s:[]};
  return {map,win:old.w,rc,
    build:a=>{
      const {L,ex}=constructLevel(i);
      a.objs.push(...L.objs);
      if(ex.flee){const dr=a.objs.find(o=>o.k==="door");if(dr)doorFlee(dr,18,5,90);}
      const bt=[{x:28,say:i===0?old.s[0]:pk0(i)}].concat(L.nb);
      return bt.concat(L.beats).sort((x,y)=>x.x-y.x);
    }};
});
/* ===== Traduções completas do narrador + textos soltos (gerado) ===== */
Object.assign(NARR.en,{"Pensei que tinhas parado no \"fim\".": "I thought you had stopped at the \"end\".", "Aquele espeto é falso. Passa por cima.": "That spike is fake. Walk over it.", "O último é inofensivo também. Garanto.": "The last one is harmless too. I promise.", "A primeira porta é falsa. Vai até à última.": "The first door is fake. Go to the last one.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Oh. Still here? Most people give up after the \"end\"."});
Object.assign(NARR.es,{"Pensei que tinhas parado no \"fim\".": "Pensé que te habías detenido en el \"fin\".", "Espetos à frente. Salta por cima.": "Pinchos delante. Salta por encima.", "Buraco à frente. Salta.": "Agujero delante. Salta.", "Cuidado: há um espeto escondido aqui.": "Cuidado: hay un pincho escondido aquí.", "O tecto vai cair. Anda depressa.": "El techo va a caer. Date prisa.", "Serra à frente. Passa quando ela se afastar.": "Sierra delante. Pasa cuando se aparte.", "Laser à frente. Espera que desligue.": "Láser delante. Espera a que se apague.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Atento al ritmo: esto sale del suelo y del techo.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "El suelo aquí es traicionero. Cuidado dónde pisas.", "Esses espetos são de enfeite. Passa à vontade.": "Esos pinchos son de adorno. Pasa tranquilo.", "Esse buraco tem chão. Podes andar por cima.": "Ese agujero tiene suelo. Puedes caminar por encima.", "Aqui não há nada. Corre.": "Aquí no hay nada. Corre.", "O tecto é firme. Não cai.": "El techo es firme. No cae.", "A serra é de brincar. Podes passar.": "La sierra es de juguete. Puedes pasar.", "Esse laser está desligado. Passa.": "Ese láser está apagado. Pasa.", "Isto está parado. Podes passar.": "Esto está parado. Puedes pasar.", "O chão aqui é firme. Confia em mim.": "El suelo aquí es firme. Confía en mí.", "Aquele espeto é de enfeite. Podes passar.": "Ese pincho es de adorno. Puedes pasar.", "Aquela serra é inofensiva. Passa.": "Esa sierra es inofensiva. Pasa.", "Aquele laser não faz mal. Passa.": "Ese láser no hace daño. Pasa.", "Isto não faz mal. Podes passar.": "Esto no hace daño. Puedes pasar.", "Caminho livre daqui para a frente.": "Camino libre de aquí en adelante.", "Respira. Aqui não há nada.": "Respira. Aquí no hay nada.", "Podes andar descansado por aqui.": "Puedes caminar tranquilo por aquí.", "Aquele espeto é falso. Passa por cima.": "Ese pincho es falso. Pasa por encima.", "O último é inofensivo também. Garanto.": "El último también es inofensivo. Te lo garantizo.", "A primeira porta é falsa. Vai até à última.": "La primera puerta es falsa. Ve hasta la última.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Oh. ¿Todavía aquí? La mayoría abandona después del \"fin\"."});
Object.assign(STR.es,{"finishTitle": "120 Veces", "finishText": "Muertes: {d}. Veces que confiaste en mí y perdiste: {l}.\nCiento veinte niveles, y la única mentira que nunca te dije fue la última: que valía la pena llegar hasta aquí.\nGracias por seguir jugando mientras yo aprendía a dejar de mentir.", "playAgain": "Jugar otra vez", "menuBtn": "Menú", "dailyTitle": "Desafío diario", "dailyOk": "¡Completado! Racha: {streak} día(s).\n+{gained} monedas.\nVuelve mañana para continuar la racha.", "dailyAlready": "Ya habías hecho el desafío de hoy.\nRacha actual: {streak} día(s).\nVuelve mañana.", "endlessEndTitle": "Modo infinito — Fin", "endlessEndText": "Llegaste al nivel {n}.\nRécord: {best}.", "tryAgain": "Intentar otra vez", "rotateNote": "↻ Gira el móvil para jugar en horizontal."});
Object.assign(NARR.fr,{"Pensei que tinhas parado no \"fim\".": "Je pensais que tu t'étais arrêté au \"fin\".", "Espetos à frente. Salta por cima.": "Des pics devant. Saute par-dessus.", "Buraco à frente. Salta.": "Un trou devant. Saute.", "Cuidado: há um espeto escondido aqui.": "Attention : il y a un pic caché ici.", "O tecto vai cair. Anda depressa.": "Le plafond va tomber. Dépêche-toi.", "Serra à frente. Passa quando ela se afastar.": "Une scie devant. Passe quand elle s'éloigne.", "Laser à frente. Espera que desligue.": "Un laser devant. Attends qu'il s'éteigne.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Attention au rythme : ça sort du sol et du plafond.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "Le sol est traître ici. Regarde où tu marches.", "Esses espetos são de enfeite. Passa à vontade.": "Ces pics sont décoratifs. Passe sans crainte.", "Esse buraco tem chão. Podes andar por cima.": "Ce trou a un sol. Tu peux marcher dessus.", "Aqui não há nada. Corre.": "Il n'y a rien ici. Cours.", "O tecto é firme. Não cai.": "Le plafond est solide. Il ne tombe pas.", "A serra é de brincar. Podes passar.": "La scie est pour rire. Tu peux passer.", "Esse laser está desligado. Passa.": "Ce laser est éteint. Passe.", "Isto está parado. Podes passar.": "Ça ne bouge pas. Tu peux passer.", "O chão aqui é firme. Confia em mim.": "Le sol est solide ici. Fais-moi confiance.", "Aquele espeto é de enfeite. Podes passar.": "Ce pic est décoratif. Tu peux passer.", "Aquela serra é inofensiva. Passa.": "Cette scie est inoffensive. Passe.", "Aquele laser não faz mal. Passa.": "Ce laser ne fait pas de mal. Passe.", "Isto não faz mal. Podes passar.": "Ça ne fait pas de mal. Tu peux passer.", "Caminho livre daqui para a frente.": "Chemin libre à partir d'ici.", "Respira. Aqui não há nada.": "Respire. Il n'y a rien ici.", "Podes andar descansado por aqui.": "Tu peux avancer tranquille par ici.", "Aquele espeto é falso. Passa por cima.": "Ce pic est faux. Passe par-dessus.", "O último é inofensivo também. Garanto.": "Le dernier est inoffensif aussi. Je te le garantis.", "A primeira porta é falsa. Vai até à última.": "La première porte est fausse. Va jusqu'à la dernière.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Oh. Encore là ? La plupart abandonnent après la \"fin\"."});
Object.assign(STR.fr,{"finishTitle": "120 Fois", "finishText": "Morts : {d}. Fois où tu m'as cru et perdu : {l}.\nCent vingt niveaux, et le seul mensonge que je ne t'ai jamais dit était le dernier : que ça valait la peine d'arriver jusqu'ici.\nMerci d'avoir continué à jouer pendant que j'apprenais à arrêter de mentir.", "playAgain": "Rejouer", "menuBtn": "Menu", "dailyTitle": "Défi quotidien", "dailyOk": "Terminé ! Série : {streak} jour(s).\n+{gained} pièces.\nReviens demain pour continuer la série.", "dailyAlready": "Tu as déjà fait le défi d'aujourd'hui.\nSérie actuelle : {streak} jour(s).\nReviens demain.", "endlessEndTitle": "Mode infini — Fin", "endlessEndText": "Tu as atteint le niveau {n}.\nRecord : {best}.", "tryAgain": "Réessayer", "rotateNote": "↻ Tourne ton téléphone pour jouer en mode paysage."});
Object.assign(NARR.de,{"Pensei que tinhas parado no \"fim\".": "Ich dachte, du hättest beim \"Ende\" aufgehört.", "Espetos à frente. Salta por cima.": "Stacheln voraus. Spring drüber.", "Buraco à frente. Salta.": "Ein Loch voraus. Spring.", "Cuidado: há um espeto escondido aqui.": "Vorsicht: Hier ist ein Stachel versteckt.", "O tecto vai cair. Anda depressa.": "Die Decke stürzt gleich ein. Beeil dich.", "Serra à frente. Passa quando ela se afastar.": "Säge voraus. Geh vorbei, wenn sie wegfährt.", "Laser à frente. Espera que desligue.": "Laser voraus. Warte, bis er ausgeht.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Achte auf den Rhythmus: Das kommt aus Boden und Decke.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "Der Boden hier ist tückisch. Pass auf, wohin du trittst.", "Esses espetos são de enfeite. Passa à vontade.": "Diese Stacheln sind nur Deko. Geh ruhig durch.", "Esse buraco tem chão. Podes andar por cima.": "Dieses Loch hat einen Boden. Du kannst drüberlaufen.", "Aqui não há nada. Corre.": "Hier ist nichts. Lauf.", "O tecto é firme. Não cai.": "Die Decke ist stabil. Sie fällt nicht.", "A serra é de brincar. Podes passar.": "Die Säge ist nur zum Spaß. Du kannst durch.", "Esse laser está desligado. Passa.": "Dieser Laser ist aus. Geh durch.", "Isto está parado. Podes passar.": "Das steht still. Du kannst durch.", "O chão aqui é firme. Confia em mim.": "Der Boden hier ist fest. Vertrau mir.", "Aquele espeto é de enfeite. Podes passar.": "Dieser Stachel ist nur Deko. Du kannst durch.", "Aquela serra é inofensiva. Passa.": "Diese Säge ist harmlos. Geh durch.", "Aquele laser não faz mal. Passa.": "Dieser Laser tut nichts. Geh durch.", "Isto não faz mal. Podes passar.": "Das ist harmlos. Du kannst durch.", "Caminho livre daqui para a frente.": "Ab hier ist der Weg frei.", "Respira. Aqui não há nada.": "Atme durch. Hier ist nichts.", "Podes andar descansado por aqui.": "Hier kannst du ganz entspannt laufen.", "Aquele espeto é falso. Passa por cima.": "Dieser Stachel ist falsch. Spring drüber.", "O último é inofensivo também. Garanto.": "Der letzte ist auch harmlos. Ich garantiere es.", "A primeira porta é falsa. Vai até à última.": "Die erste Tür ist falsch. Geh bis zur letzten.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Oh. Noch hier? Die meisten geben nach dem \"Ende\" auf."});
Object.assign(STR.de,{"finishTitle": "120 Mal", "finishText": "Tode: {d}. Male, die du mir geglaubt und verloren hast: {l}.\nHundertzwanzig Level, und die einzige Lüge, die ich dir nie erzählt habe, war die letzte: dass es sich lohnt, bis hierher zu kommen.\nDanke, dass du weitergespielt hast, während ich lernte, nicht mehr zu lügen.", "playAgain": "Nochmal spielen", "menuBtn": "Menü", "dailyTitle": "Tägliche Herausforderung", "dailyOk": "Geschafft! Serie: {streak} Tag(e).\n+{gained} Münzen.\nKomm morgen wieder, um die Serie fortzusetzen.", "dailyAlready": "Du hast die heutige Herausforderung schon gemacht.\nAktuelle Serie: {streak} Tag(e).\nKomm morgen wieder.", "endlessEndTitle": "Endlos-Modus — Ende", "endlessEndText": "Du hast Level {n} erreicht.\nRekord: {best}.", "tryAgain": "Nochmal versuchen", "rotateNote": "↻ Dreh dein Handy, um im Querformat zu spielen."});
Object.assign(NARR.ru,{"Pensei que tinhas parado no \"fim\".": "Я думал, ты остановился на «конце».", "Espetos à frente. Salta por cima.": "Впереди шипы. Перепрыгни.", "Buraco à frente. Salta.": "Впереди яма. Прыгай.", "Cuidado: há um espeto escondido aqui.": "Осторожно: здесь спрятан шип.", "O tecto vai cair. Anda depressa.": "Потолок сейчас рухнет. Поторопись.", "Serra à frente. Passa quando ela se afastar.": "Впереди пила. Проходи, когда она отъедет.", "Laser à frente. Espera que desligue.": "Впереди лазер. Подожди, пока выключится.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Следи за ритмом: это лезет и из пола, и с потолка.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "Пол здесь коварный. Смотри, куда наступаешь.", "Esses espetos são de enfeite. Passa à vontade.": "Эти шипы для красоты. Проходи спокойно.", "Esse buraco tem chão. Podes andar por cima.": "У этой ямы есть дно. Можешь пройти поверху.", "Aqui não há nada. Corre.": "Здесь ничего нет. Беги.", "O tecto é firme. Não cai.": "Потолок крепкий. Не упадёт.", "A serra é de brincar. Podes passar.": "Пила игрушечная. Можешь проходить.", "Esse laser está desligado. Passa.": "Этот лазер выключен. Проходи.", "Isto está parado. Podes passar.": "Это не движется. Можешь проходить.", "O chão aqui é firme. Confia em mim.": "Пол здесь крепкий. Поверь мне.", "Aquele espeto é de enfeite. Podes passar.": "Тот шип для красоты. Можешь проходить.", "Aquela serra é inofensiva. Passa.": "Та пила безобидная. Проходи.", "Aquele laser não faz mal. Passa.": "Тот лазер не опасен. Проходи.", "Isto não faz mal. Podes passar.": "Это не опасно. Можешь проходить.", "Caminho livre daqui para a frente.": "Дальше путь свободен.", "Respira. Aqui não há nada.": "Выдохни. Здесь ничего нет.", "Podes andar descansado por aqui.": "Тут можно спокойно гулять.", "Aquele espeto é falso. Passa por cima.": "Тот шип фальшивый. Перепрыгни.", "O último é inofensivo também. Garanto.": "Последний тоже безобиден. Гарантирую.", "A primeira porta é falsa. Vai até à última.": "Первая дверь фальшивая. Иди до последней.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "О. Ты всё ещё здесь? Большинство сдаётся после «конца»."});
Object.assign(STR.ru,{"finishTitle": "120 раз", "finishText": "Смертей: {d}. Раз, когда ты поверил мне и проиграл: {l}.\nСто двадцать уровней, и единственная ложь, которую я тебе так и не сказал, была последней: что сюда стоило добираться.\nСпасибо, что продолжал играть, пока я учился не врать.", "playAgain": "Играть снова", "menuBtn": "Меню", "dailyTitle": "Ежедневное испытание", "dailyOk": "Готово! Серия: {streak} дн.\n+{gained} монет.\nВозвращайся завтра, чтобы продолжить серию.", "dailyAlready": "Ты уже прошёл сегодняшнее испытание.\nТекущая серия: {streak} дн.\nВозвращайся завтра.", "endlessEndTitle": "Бесконечный режим — конец", "endlessEndText": "Ты дошёл до уровня {n}.\nРекорд: {best}.", "tryAgain": "Попробовать снова", "rotateNote": "↻ Поверни телефон, чтобы играть в горизонтальном режиме."});
Object.assign(NARR.ja,{"Pensei que tinhas parado no \"fim\".": "「終わり」で止まったと思ったのに。", "Espetos à frente. Salta por cima.": "前にトゲがあるよ。飛び越えて。", "Buraco à frente. Salta.": "前に穴があるよ。ジャンプして。", "Cuidado: há um espeto escondido aqui.": "気をつけて、ここに隠れたトゲがある。", "O tecto vai cair. Anda depressa.": "天井が落ちてくる。急いで。", "Serra à frente. Passa quando ela se afastar.": "前にノコギリ。離れたら通って。", "Laser à frente. Espera que desligue.": "前にレーザー。消えるまで待って。", "Atenção ao ritmo: isto sai do chão e do tecto.": "リズムに注意：床からも天井からも出てくるよ。", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "ここの床は油断ならない。足元に気をつけて。", "Esses espetos são de enfeite. Passa à vontade.": "そのトゲは飾りだよ。気にせず通って。", "Esse buraco tem chão. Podes andar por cima.": "その穴には床がある。上を歩けるよ。", "Aqui não há nada. Corre.": "ここには何もない。走って。", "O tecto é firme. Não cai.": "天井は頑丈だ。落ちないよ。", "A serra é de brincar. Podes passar.": "そのノコギリはおもちゃだ。通れるよ。", "Esse laser está desligado. Passa.": "そのレーザーは消えてる。通って。", "Isto está parado. Podes passar.": "これは動かない。通れるよ。", "O chão aqui é firme. Confia em mim.": "ここの床は頑丈だ。私を信じて。", "Aquele espeto é de enfeite. Podes passar.": "あのトゲは飾りだ。通れるよ。", "Aquela serra é inofensiva. Passa.": "あのノコギリは無害だ。通って。", "Aquele laser não faz mal. Passa.": "あのレーザーは平気だ。通って。", "Isto não faz mal. Podes passar.": "これは大丈夫。通れるよ。", "Caminho livre daqui para a frente.": "ここから先は安全だよ。", "Respira. Aqui não há nada.": "深呼吸して。ここには何もないから。", "Podes andar descansado por aqui.": "ここは安心して歩けるよ。", "Aquele espeto é falso. Passa por cima.": "あのトゲは偽物だ。飛び越えて。", "O último é inofensivo também. Garanto.": "最後のも無害だよ。保証する。", "A primeira porta é falsa. Vai até à última.": "最初のドアは偽物。最後まで行って。", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "おや。まだいたの？ ほとんどの人は「終わり」のあとで諦めるのに。"});
Object.assign(STR.ja,{"finishTitle": "120回", "finishText": "死亡回数：{d}。私を信じて負けた回数：{l}。\n120のレベル。そして私が一度もつかなかった嘘は最後の一つだけ：ここまで来る価値があった、という嘘。\n私が嘘をやめることを学ぶあいだ、プレイを続けてくれてありがとう。", "playAgain": "もう一度プレイ", "menuBtn": "メニュー", "dailyTitle": "デイリーチャレンジ", "dailyOk": "クリア！連続日数：{streak}日。\n+{gained}コイン。\n連続記録を続けるには明日また来てね。", "dailyAlready": "今日のチャレンジはもう終わってるよ。\n現在の連続日数：{streak}日。\nまた明日来てね。", "endlessEndTitle": "エンドレスモード — 終了", "endlessEndText": "レベル{n}に到達。\nベスト：{best}。", "tryAgain": "もう一度挑戦", "rotateNote": "↻ 横向きでプレイするにはスマホを回転してください。"});
Object.assign(NARR.zh,{"Pensei que tinhas parado no \"fim\".": "我还以为你在“结束”那里就停下了。", "Espetos à frente. Salta por cima.": "前面有尖刺。跳过去。", "Buraco à frente. Salta.": "前面有个坑。跳。", "Cuidado: há um espeto escondido aqui.": "小心：这里藏着一根尖刺。", "O tecto vai cair. Anda depressa.": "天花板要塌了。快点。", "Serra à frente. Passa quando ela se afastar.": "前面有锯子。等它离开再过。", "Laser à frente. Espera que desligue.": "前面有激光。等它关掉。", "Atenção ao ritmo: isto sai do chão e do tecto.": "注意节奏：地上和天花板都会冒出来。", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "这里的地面不老实。看好脚下。", "Esses espetos são de enfeite. Passa à vontade.": "那些尖刺只是装饰。放心过。", "Esse buraco tem chão. Podes andar por cima.": "那个坑有地面。你可以从上面走过去。", "Aqui não há nada. Corre.": "这里什么都没有。跑吧。", "O tecto é firme. Não cai.": "天花板很结实。不会掉。", "A serra é de brincar. Podes passar.": "那个锯子是闹着玩的。可以过。", "Esse laser está desligado. Passa.": "那道激光关着呢。过吧。", "Isto está parado. Podes passar.": "这个不会动。可以过。", "O chão aqui é firme. Confia em mim.": "这里的地面很结实。相信我。", "Aquele espeto é de enfeite. Podes passar.": "那根尖刺只是装饰。可以过。", "Aquela serra é inofensiva. Passa.": "那个锯子没有危害。过吧。", "Aquele laser não faz mal. Passa.": "那道激光没事。过吧。", "Isto não faz mal. Podes passar.": "这个没事。可以过。", "Caminho livre daqui para a frente.": "从这里往前一路畅通。", "Respira. Aqui não há nada.": "深呼吸。这里什么都没有。", "Podes andar descansado por aqui.": "在这儿可以放心地走。", "Aquele espeto é falso. Passa por cima.": "那根尖刺是假的。跳过去。", "O último é inofensivo também. Garanto.": "最后一个也无害。我保证。", "A primeira porta é falsa. Vai até à última.": "第一扇门是假的。一直走到最后一扇。", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "哦。你还在？大多数人在“结束”之后就放弃了。"});
Object.assign(STR.zh,{"finishTitle": "120次", "finishText": "死亡次数：{d}。你相信我却输了的次数：{l}。\n一百二十个关卡，而我唯一从没对你撒过的谎就是最后一个：来到这里是值得的。\n谢谢你在我学着不再撒谎的时候一直玩下去。", "playAgain": "再玩一次", "menuBtn": "菜单", "dailyTitle": "每日挑战", "dailyOk": "完成！连续天数：{streak}天。\n+{gained}金币。\n明天再来，继续保持连续记录。", "dailyAlready": "你今天已经完成挑战了。\n当前连续天数：{streak}天。\n明天再来。", "endlessEndTitle": "无尽模式 — 结束", "endlessEndText": "你到达了第{n}关。\n最佳：{best}。", "tryAgain": "再试一次", "rotateNote": "↻ 请横屏旋转手机来游戏。"});
Object.assign(NARR.hi,{"Pensei que tinhas parado no \"fim\".": "मुझे लगा था तुम \"अंत\" पर रुक गए थे।", "Espetos à frente. Salta por cima.": "आगे काँटे हैं। ऊपर से कूद जाओ।", "Buraco à frente. Salta.": "आगे गड्ढा है। कूदो।", "Cuidado: há um espeto escondido aqui.": "सावधान: यहाँ एक काँटा छिपा है।", "O tecto vai cair. Anda depressa.": "छत गिरने वाली है। जल्दी चलो।", "Serra à frente. Passa quando ela se afastar.": "आगे आरी है। जब वह दूर जाए तब निकलो।", "Laser à frente. Espera que desligue.": "आगे लेज़र है। बंद होने तक रुको।", "Atenção ao ritmo: isto sai do chão e do tecto.": "लय पर ध्यान दो: यह ज़मीन और छत दोनों से निकलता है।", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "यहाँ की ज़मीन धोखेबाज़ है। सोच-समझकर कदम रखो।", "Esses espetos são de enfeite. Passa à vontade.": "ये काँटे बस सजावट के हैं। आराम से निकल जाओ।", "Esse buraco tem chão. Podes andar por cima.": "इस गड्ढे में ज़मीन है। ऊपर से चल सकते हो।", "Aqui não há nada. Corre.": "यहाँ कुछ नहीं है। दौड़ो।", "O tecto é firme. Não cai.": "छत मज़बूत है। नहीं गिरेगी।", "A serra é de brincar. Podes passar.": "आरी खिलौना है। निकल सकते हो।", "Esse laser está desligado. Passa.": "वह लेज़र बंद है। निकल जाओ।", "Isto está parado. Podes passar.": "यह रुका हुआ है। निकल सकते हो।", "O chão aqui é firme. Confia em mim.": "यहाँ की ज़मीन पक्की है। मुझ पर भरोसा रखो।", "Aquele espeto é de enfeite. Podes passar.": "वह काँटा सजावट का है। निकल सकते हो।", "Aquela serra é inofensiva. Passa.": "वह आरी बेनुकसान है। निकल जाओ।", "Aquele laser não faz mal. Passa.": "वह लेज़र कोई नुकसान नहीं करता। निकल जाओ।", "Isto não faz mal. Podes passar.": "इससे कोई नुकसान नहीं। निकल सकते हो।", "Caminho livre daqui para a frente.": "यहाँ से आगे रास्ता साफ़ है।", "Respira. Aqui não há nada.": "साँस लो। यहाँ कुछ नहीं है।", "Podes andar descansado por aqui.": "यहाँ आराम से चल सकते हो।", "Aquele espeto é falso. Passa por cima.": "वह काँटा नकली है। ऊपर से निकल जाओ।", "O último é inofensivo também. Garanto.": "आख़िरी वाला भी बेनुकसान है। गारंटी।", "A primeira porta é falsa. Vai até à última.": "पहला दरवाज़ा नकली है। आख़िरी तक जाओ।", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "ओह। अभी भी यहीं? ज़्यादातर लोग \"अंत\" के बाद हार मान लेते हैं।"});
Object.assign(STR.hi,{"finishTitle": "120 बार", "finishText": "मौतें: {d}। जितनी बार तुमने मुझ पर भरोसा किया और हारे: {l}।\nएक सौ बीस लेवल, और जो एक झूठ मैंने तुमसे कभी नहीं बोला वह आख़िरी था: कि यहाँ तक पहुँचना सार्थक था।\nखेलते रहने के लिए धन्यवाद, जब तक मैं झूठ बोलना छोड़ना सीख रहा था।", "playAgain": "फिर से खेलो", "menuBtn": "मेनू", "dailyTitle": "दैनिक चुनौती", "dailyOk": "पूरा हुआ! लगातार: {streak} दिन।\n+{gained} सिक्के।\nसिलसिला बनाए रखने के लिए कल वापस आओ।", "dailyAlready": "तुम आज की चुनौती पहले ही पूरी कर चुके हो।\nमौजूदा सिलसिला: {streak} दिन।\nकल वापस आओ।", "endlessEndTitle": "अनंत मोड — समाप्त", "endlessEndText": "तुम लेवल {n} तक पहुँचे।\nसर्वश्रेष्ठ: {best}।", "tryAgain": "फिर कोशिश करो", "rotateNote": "↻ क्षैतिज रूप में खेलने के लिए अपना फ़ोन घुमाओ।"});
Object.assign(NARR.ar,{"Pensei que tinhas parado no \"fim\".": "ظننتك توقفت عند \"النهاية\".", "Espetos à frente. Salta por cima.": "أشواك أمامك. اقفز من فوقها.", "Buraco à frente. Salta.": "حفرة أمامك. اقفز.", "Cuidado: há um espeto escondido aqui.": "انتبه: هناك شوكة مخفية هنا.", "O tecto vai cair. Anda depressa.": "السقف سيسقط. أسرع.", "Serra à frente. Passa quando ela se afastar.": "منشار أمامك. مرّ عندما يبتعد.", "Laser à frente. Espera que desligue.": "ليزر أمامك. انتظر حتى ينطفئ.", "Atenção ao ritmo: isto sai do chão e do tecto.": "انتبه للإيقاع: هذا يخرج من الأرض ومن السقف.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "الأرض هنا خائنة. انتبه أين تضع قدمك.", "Esses espetos são de enfeite. Passa à vontade.": "هذه الأشواك للزينة فقط. مرّ براحة.", "Esse buraco tem chão. Podes andar por cima.": "هذه الحفرة فيها أرض. يمكنك المشي فوقها.", "Aqui não há nada. Corre.": "لا شيء هنا. اركض.", "O tecto é firme. Não cai.": "السقف متين. لن يسقط.", "A serra é de brincar. Podes passar.": "المنشار للعب فقط. يمكنك المرور.", "Esse laser está desligado. Passa.": "ذلك الليزر مطفأ. مرّ.", "Isto está parado. Podes passar.": "هذا ثابت. يمكنك المرور.", "O chão aqui é firme. Confia em mim.": "الأرض هنا صلبة. ثق بي.", "Aquele espeto é de enfeite. Podes passar.": "تلك الشوكة للزينة. يمكنك المرور.", "Aquela serra é inofensiva. Passa.": "ذلك المنشار غير مؤذٍ. مرّ.", "Aquele laser não faz mal. Passa.": "ذلك الليزر لا يضر. مرّ.", "Isto não faz mal. Podes passar.": "هذا لا يضر. يمكنك المرور.", "Caminho livre daqui para a frente.": "الطريق مفتوح من هنا فصاعدًا.", "Respira. Aqui não há nada.": "تنفّس. لا شيء هنا.", "Podes andar descansado por aqui.": "يمكنك السير هنا باطمئنان.", "Aquele espeto é falso. Passa por cima.": "تلك الشوكة مزيفة. اقفز من فوقها.", "O último é inofensivo também. Garanto.": "الأخير غير مؤذٍ أيضًا. أضمن لك.", "A primeira porta é falsa. Vai até à última.": "الباب الأول مزيف. اذهب إلى الأخير.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "أوه. ما زلت هنا؟ معظمهم يستسلمون بعد \"النهاية\"."});
Object.assign(STR.ar,{"finishTitle": "120 مرة", "finishText": "الوفيات: {d}. عدد المرات التي صدّقتني فيها وخسرت: {l}.\nمئة وعشرون مستوى، والكذبة الوحيدة التي لم أقلها لك قط كانت الأخيرة: أن الوصول إلى هنا كان يستحق العناء.\nشكرًا لأنك واصلت اللعب بينما كنت أتعلم التوقف عن الكذب.", "playAgain": "العب مرة أخرى", "menuBtn": "القائمة", "dailyTitle": "التحدي اليومي", "dailyOk": "تم! التتابع: {streak} يوم.\n+{gained} عملة.\nعد غدًا لتواصل التتابع.", "dailyAlready": "لقد أنجزت تحدي اليوم بالفعل.\nالتتابع الحالي: {streak} يوم.\nعد غدًا.", "endlessEndTitle": "الوضع اللانهائي — النهاية", "endlessEndText": "وصلت إلى المستوى {n}.\nالأفضل: {best}.", "tryAgain": "حاول مرة أخرى", "rotateNote": "↻ أدر هاتفك لتلعب بالوضع الأفقي."});
Object.assign(NARR.id,{"Pensei que tinhas parado no \"fim\".": "Kukira kamu berhenti di \"tamat\".", "Espetos à frente. Salta por cima.": "Duri di depan. Lompati.", "Buraco à frente. Salta.": "Lubang di depan. Lompat.", "Cuidado: há um espeto escondido aqui.": "Hati-hati: ada duri tersembunyi di sini.", "O tecto vai cair. Anda depressa.": "Langit-langit akan jatuh. Cepat.", "Serra à frente. Passa quando ela se afastar.": "Gergaji di depan. Lewat saat dia menjauh.", "Laser à frente. Espera que desligue.": "Laser di depan. Tunggu sampai mati.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Perhatikan iramanya: ini muncul dari lantai dan langit-langit.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "Lantai di sini licik. Hati-hati melangkah.", "Esses espetos são de enfeite. Passa à vontade.": "Duri itu cuma hiasan. Lewat saja santai.", "Esse buraco tem chão. Podes andar por cima.": "Lubang itu ada lantainya. Kamu bisa berjalan di atasnya.", "Aqui não há nada. Corre.": "Tidak ada apa-apa di sini. Lari.", "O tecto é firme. Não cai.": "Langit-langitnya kokoh. Tidak akan jatuh.", "A serra é de brincar. Podes passar.": "Gergajinya mainan. Kamu bisa lewat.", "Esse laser está desligado. Passa.": "Laser itu mati. Lewat.", "Isto está parado. Podes passar.": "Ini diam saja. Kamu bisa lewat.", "O chão aqui é firme. Confia em mim.": "Lantai di sini kokoh. Percayalah padaku.", "Aquele espeto é de enfeite. Podes passar.": "Duri itu hiasan. Kamu bisa lewat.", "Aquela serra é inofensiva. Passa.": "Gergaji itu tidak berbahaya. Lewat.", "Aquele laser não faz mal. Passa.": "Laser itu tidak berbahaya. Lewat.", "Isto não faz mal. Podes passar.": "Ini tidak berbahaya. Kamu bisa lewat.", "Caminho livre daqui para a frente.": "Jalan bebas dari sini ke depan.", "Respira. Aqui não há nada.": "Tarik napas. Tidak ada apa-apa di sini.", "Podes andar descansado por aqui.": "Kamu bisa berjalan santai di sini.", "Aquele espeto é falso. Passa por cima.": "Duri itu palsu. Lompati saja.", "O último é inofensivo também. Garanto.": "Yang terakhir juga tidak berbahaya. Kujamin.", "A primeira porta é falsa. Vai até à última.": "Pintu pertama palsu. Pergi ke yang terakhir.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Oh. Masih di sini? Kebanyakan orang menyerah setelah \"tamat\"."});
Object.assign(STR.id,{"finishTitle": "120 Kali", "finishText": "Kematian: {d}. Berapa kali kamu percaya padaku lalu kalah: {l}.\nSeratus dua puluh level, dan satu-satunya kebohongan yang tak pernah kukatakan adalah yang terakhir: bahwa sampai di sini itu sepadan.\nTerima kasih sudah terus bermain sementara aku belajar berhenti berbohong.", "playAgain": "Main lagi", "menuBtn": "Menu", "dailyTitle": "Tantangan Harian", "dailyOk": "Selesai! Rentetan: {streak} hari.\n+{gained} koin.\nKembali besok untuk melanjutkan rentetan.", "dailyAlready": "Kamu sudah menyelesaikan tantangan hari ini.\nRentetan saat ini: {streak} hari.\nKembali besok.", "endlessEndTitle": "Mode Tanpa Batas — Tamat", "endlessEndText": "Kamu mencapai level {n}.\nTerbaik: {best}.", "tryAgain": "Coba lagi", "rotateNote": "↻ Putar ponselmu untuk bermain dalam mode lanskap."});
Object.assign(NARR.bn,{"Pensei que tinhas parado no \"fim\".": "ভেবেছিলাম তুমি \"শেষ\"-এ থেমে গেছ।", "Espetos à frente. Salta por cima.": "সামনে কাঁটা। ওপর দিয়ে লাফ দাও।", "Buraco à frente. Salta.": "সামনে গর্ত। লাফ দাও।", "Cuidado: há um espeto escondido aqui.": "সাবধান: এখানে একটা কাঁটা লুকানো আছে।", "O tecto vai cair. Anda depressa.": "ছাদ ভেঙে পড়বে। তাড়াতাড়ি চলো।", "Serra à frente. Passa quando ela se afastar.": "সামনে করাত। ওটা সরে গেলে পার হও।", "Laser à frente. Espera que desligue.": "সামনে লেজার। বন্ধ হওয়া পর্যন্ত অপেক্ষা করো।", "Atenção ao ritmo: isto sai do chão e do tecto.": "ছন্দে খেয়াল রাখো: এটা মেঝে আর ছাদ দুই জায়গা থেকেই বেরোয়।", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "এখানকার মেঝে বিশ্বাসঘাতক। কোথায় পা ফেলছ দেখো।", "Esses espetos são de enfeite. Passa à vontade.": "ওই কাঁটাগুলো শুধু সাজানোর। নিশ্চিন্তে পার হও।", "Esse buraco tem chão. Podes andar por cima.": "ওই গর্তে মেঝে আছে। ওপর দিয়ে হাঁটতে পারো।", "Aqui não há nada. Corre.": "এখানে কিছু নেই। দৌড়াও।", "O tecto é firme. Não cai.": "ছাদ মজবুত। পড়বে না।", "A serra é de brincar. Podes passar.": "করাতটা খেলনা। পার হতে পারো।", "Esse laser está desligado. Passa.": "ওই লেজার বন্ধ। পার হও।", "Isto está parado. Podes passar.": "এটা থেমে আছে। পার হতে পারো।", "O chão aqui é firme. Confia em mim.": "এখানকার মেঝে শক্ত। আমাকে বিশ্বাস করো।", "Aquele espeto é de enfeite. Podes passar.": "ওই কাঁটা সাজানোর। পার হতে পারো।", "Aquela serra é inofensiva. Passa.": "ওই করাত ক্ষতিকর নয়। পার হও।", "Aquele laser não faz mal. Passa.": "ওই লেজার কোনো ক্ষতি করে না। পার হও।", "Isto não faz mal. Podes passar.": "এতে কোনো ক্ষতি নেই। পার হতে পারো।", "Caminho livre daqui para a frente.": "এখান থেকে সামনে পথ খোলা।", "Respira. Aqui não há nada.": "নিঃশ্বাস নাও। এখানে কিছু নেই।", "Podes andar descansado por aqui.": "এখানে নিশ্চিন্তে হাঁটতে পারো।", "Aquele espeto é falso. Passa por cima.": "ওই কাঁটা নকল। ওপর দিয়ে পার হও।", "O último é inofensivo também. Garanto.": "শেষটাও ক্ষতিকর নয়। কথা দিচ্ছি।", "A primeira porta é falsa. Vai até à última.": "প্রথম দরজাটা নকল। শেষটায় যাও।", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "ওহ। এখনও এখানে? বেশিরভাগ লোক \"শেষ\"-এর পর হাল ছেড়ে দেয়।"});
Object.assign(STR.bn,{"finishTitle": "১২০ বার", "finishText": "মৃত্যু: {d}। যতবার আমাকে বিশ্বাস করে তুমি হেরেছ: {l}।\nএকশো কুড়িটা লেভেল, আর যে একটা মিথ্যা আমি তোমাকে কখনো বলিনি সেটা শেষটাই: যে এখানে পৌঁছানো সার্থক ছিল।\nআমি যখন মিথ্যা বলা ছাড়তে শিখছিলাম, তখনও খেলে যাওয়ার জন্য ধন্যবাদ।", "playAgain": "আবার খেলো", "menuBtn": "মেনু", "dailyTitle": "দৈনিক চ্যালেঞ্জ", "dailyOk": "সম্পন্ন! ধারা: {streak} দিন।\n+{gained} কয়েন।\nধারা ধরে রাখতে কাল আবার এসো।", "dailyAlready": "তুমি আজকের চ্যালেঞ্জ আগেই শেষ করেছ।\nবর্তমান ধারা: {streak} দিন।\nকাল আবার এসো।", "endlessEndTitle": "অন্তহীন মোড — শেষ", "endlessEndText": "তুমি লেভেল {n}-এ পৌঁছেছ।\nসেরা: {best}।", "tryAgain": "আবার চেষ্টা করো", "rotateNote": "↻ আড়াআড়ি খেলতে তোমার ফোন ঘোরাও।"});
NARR.it={"Não faz mal. Tenta outra vez.": "Non fa niente. Riprova.", "Eu expliquei bem. Concentra-te.": "Ho spiegato bene. Concentrati.", "Respira e volta a tentar.": "Respira e riprova.", "Isso não devia ter acontecido.": "Questo non doveva succedere.", "Isso foi culpa tua.": "Colpa tua.", "Eu avisei. Acho eu.": "Te l'avevo detto. Mi pare.", "Interessante escolha.": "Scelta interessante.", "Eu disse isso? Não me lembro.": "L'ho detto io? Non ricordo.", "Foi um engano. Já passou.": "È stato un errore. Passato.", "Isso não estava no guião.": "Questo non era nel copione.", "Tenta prestar mais atenção.": "Cerca di stare più attento.", "Isso foi previsível.": "Era prevedibile.", "Achavas mesmo que era seguro?": "Credevi davvero che fosse sicuro?", "Ups. Essa parte eu inventei.": "Ops. Quella parte me la sono inventata.", "Pormenor que esqueci de mencionar.": "Un dettaglio che ho dimenticato di dirti.", "Nem tudo o que digo é verdade, sabias?": "Non tutto quello che dico è vero, lo sapevi?", "Já não sei se ainda confias em mim.": "Non so più se ti fidi ancora di me.", "Boa tentativa.": "Bel tentativo.", "Isso teria funcionado, noutro nível.": "Avrebbe funzionato, in un altro livello.", "Eu avisei que às vezes minto.": "Te l'avevo detto che a volte mento.", "Culpa tua por acreditares.": "Colpa tua che ci hai creduto.", "Isso foi só para ver se saltavas.": "Era solo per vedere se saltavi.", "Estás a magoar-me com essa desconfiança.": "Mi ferisci con tutta questa diffidenza.", "Nem sempre é armadilha, sabes?": "Non è sempre una trappola, sai?", "Vais mesmo continuar assim?": "Vuoi davvero continuare così?", "Desta vez era mentira mesmo. Desculpa.": "Stavolta era davvero una bugia. Scusa.", "Eu só queria ver a tua cara.": "Volevo solo vedere la tua faccia.", "Confiança é para os fracos, aparentemente.": "La fiducia è per i deboli, a quanto pare.", "Estamos quase no fim.": "Siamo quasi alla fine.", "Só mais um pouco.": "Ancora un pochino.", "Depois disto, acabou.": "Dopo questo, è finita.", "Até no fim, não resisti.": "Anche alla fine, non ho resistito.", "Última mentira, prometo. Ou não.": "Ultima bugia, giuro. O forse no.", "Faltava mesmo esta.": "Mancava proprio questa.", "Ainda aqui. A sério?": "Ancora qui. Sul serio?", "Pensei que tinhas parado no \"fim\".": "Pensavo ti fossi fermato al \"fine\".", "Isto nem devia continuar, mas cá estás.": "Questo non dovrebbe nemmeno continuare, eppure eccoti qui.", "Nem eu sabia que isto ia continuar a mentir.": "Nemmeno io sapevo che avrebbe continuato a mentire.", "Desculpa, hábito antigo.": "Scusa, vecchia abitudine.", "Pensei que já tinhas aprendido a não confiar em mim.": "Pensavo avessi già imparato a non fidarti di me.", "Essa doeu-me a ver, sinceramente.": "Questa ha fatto male anche a me, sinceramente.", "Nem tudo é sobre mentiras. Às vezes é só física.": "Non è tutto questione di bugie. A volte è solo fisica.", "Volta lá. Eu espero.": "Torna indietro. Io aspetto.", "Desculpa. Essa fui mesmo eu.": "Scusa. Questa l'ho fatta io.", "Confesso: inventei essa parte.": "Confesso: quella parte l'ho inventata.", "Estou a tentar parar de mentir. A tentar.": "Sto cercando di smettere di mentire. Sto cercando.", "Nem eu sei porque te avisei a sério desta vez.": "Non so nemmeno perché stavolta ti ho avvisato sul serio.", "Talvez a culpa seja minha. Ou tua. Já não distingo.": "Forse è colpa mia. O tua. Non distinguo più.", "Olha para isto como eu olho: sem certezas.": "Guarda tutto questo come lo guardo io: senza certezze.", "Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.": "Non ricordo nemmeno se mentivo o se mi stavo spaventando da solo.", "Às vezes minto só para ver se ainda reages.": "A volte mento solo per vedere se reagisci ancora.", "Quem mente mais, eu ou a tua memória do que eu disse?": "Chi mente di più, io o il tuo ricordo di quello che ho detto?", "Desculpa. Eu devia era calar-me.": "Scusa. Dovevo solo stare zitto.", "Estou a piorar isto, não estou?": "Sto peggiorando le cose, vero?", "Já nem sei se te estou a ajudar ou a atrapalhar.": "Ormai non so se ti sto aiutando o intralciando.", "Eu sei, eu sei. Mais uma mentira minha.": "Lo so, lo so. Un'altra mia bugia.", "Estou a desmoronar-me e a levar-te comigo.": "Mi sto sgretolando e ti porto giù con me.", "Perdão. A sério desta vez.": "Perdono. Sul serio, stavolta.", "Disse a verdade. Não acreditaste. Justo.": "Ho detto la verità. Non mi hai creduto. Giusto.", "Vou continuar a tentar, mesmo sem acreditares em mim.": "Continuerò a provarci, anche se non mi credi.", "Essa doeu mais a mim do que a ti, garanto.": "Ha fatto più male a me che a te, garantito.", "Não. Essa não foi mentira. Juro que não.": "No. Quella non era una bugia. Giuro.", "Começo a perceber porque já não confias em mim.": "Comincio a capire perché non ti fidi più di me.", "Estou a tentar. A sério que estou.": "Ci sto provando. Davvero.", "Tudo outra vez, mais rápido, mais apertado.": "Di nuovo tutto, più veloce, più stretto.", "Já vimos isto. E ainda assim.": "L'abbiamo già visto. Eppure.", "Sem tempo para explicações desta vez.": "Stavolta niente tempo per le spiegazioni.", "Nem sei já quantas vezes te menti hoje.": "Non so più quante volte ti ho mentito oggi.", "O círculo fecha-se. A mentira também.": "Il cerchio si chiude. E anche la bugia.", "Desta vez nem eu sabia que ia mentir.": "Stavolta nemmeno io sapevo che avrei mentito.", "Já não há mentiras para esconder isto.": "Non ci sono più bugie per nascondere tutto questo.", "Isto é real. Como tudo agora.": "Questo è reale. Come tutto, ormai.", "Falta pouco. Aguenta.": "Manca poco. Resisti.", "Nem no fim resisto. Desculpa.": "Nemmeno alla fine resisto. Scusa.", "Última mentira. Prometo, desta vez prometo a sério.": "Ultima bugia. Prometto, stavolta prometto davvero.", "Isto já não é um jogo para mim. Acho que nunca foi.": "Per me questo non è più un gioco. Credo non lo sia mai stato.", "Espetos à frente. Salta por cima.": "Spuntoni davanti. Salta.", "Buraco à frente. Salta.": "Buco davanti. Salta.", "Cuidado: há um espeto escondido aqui.": "Attento: qui c'è uno spuntone nascosto.", "O tecto vai cair. Anda depressa.": "Il soffitto sta per cadere. Sbrigati.", "Serra à frente. Passa quando ela se afastar.": "Sega davanti. Passa quando si allontana.", "Laser à frente. Espera que desligue.": "Laser davanti. Aspetta che si spenga.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Attento al ritmo: questi escono dal pavimento e dal soffitto.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "Il pavimento qui è infido. Attento a dove metti i piedi.", "Esses espetos são de enfeite. Passa à vontade.": "Quegli spuntoni sono solo decorazione. Passa tranquillo.", "Esse buraco tem chão. Podes andar por cima.": "In quel buco c'è il pavimento. Puoi camminarci sopra.", "Aqui não há nada. Corre.": "Qui non c'è niente. Corri.", "O tecto é firme. Não cai.": "Il soffitto è solido. Non cade.", "A serra é de brincar. Podes passar.": "La sega è finta. Puoi passare.", "Esse laser está desligado. Passa.": "Quel laser è spento. Passa.", "Isto está parado. Podes passar.": "Questo è fermo. Puoi passare.", "O chão aqui é firme. Confia em mim.": "Il pavimento qui è solido. Fidati di me.", "Aquele espeto é de enfeite. Podes passar.": "Quello spuntone è decorativo. Puoi passare.", "Aquela serra é inofensiva. Passa.": "Quella sega è innocua. Passa.", "Aquele laser não faz mal. Passa.": "Quel laser non fa niente. Passa.", "Isto não faz mal. Podes passar.": "Questo non fa niente. Puoi passare.", "Caminho livre daqui para a frente.": "Strada libera da qui in avanti.", "Respira. Aqui não há nada.": "Respira. Qui non c'è niente.", "Podes andar descansado por aqui.": "Puoi camminare tranquillo da qui.", "Mais um. Vamos a isto.": "Un altro. Andiamo.", "Sabes bem como isto funciona a esta altura.": "A questo punto sai bene come funziona.", "Nem vou fingir que isto é fácil.": "Non farò nemmeno finta che sia facile.", "Este é só mais um. Ou não.": "Questo è solo uno in più. O forse no.", "Aquele espeto ali é só para enfeite.": "Quello spuntone là è solo decorazione.", "Podes passar por cima sem problema.": "Puoi passarci sopra senza problemi.", "Esse és capaz de ignorar.": "Questo puoi ignorarlo.", "Esse aí é real. Cuidado.": "Quello è vero. Attento.", "Salta esse. A sério desta vez.": "Salta quello. Sul serio, stavolta.", "Esse vai doer se lhe tocares.": "Quello farà male se lo tocchi.", "O buraco tem chão. Confia.": "Il buco ha il pavimento. Fidati.", "Podes andar por cima sem saltar.": "Puoi camminarci sopra senza saltare.", "Esse buraco é real. Salta-o.": "Quel buco è reale. Saltalo.", "Mais um para a conta.": "Uno in più per il conto.", "Continuas vivo. Por agora.": "Sei ancora vivo. Per ora.", "Vamos ver quanto tempo aguentas.": "Vediamo quanto resisti.", "Nada mau.": "Niente male.", "Muito bem. Sabia que ias conseguir.": "Benissimo. Sapevo che ce l'avresti fatta.", "Sou o Narrador. Tudo o que eu disser é verdade.": "Sono il Narratore. Tutto quello che dico è vero.", "Espeto à frente. Salta.": "Spuntone davanti. Salta.", "Outro. Salta de novo.": "Un altro. Salta di nuovo.", "Já confias em mim. Óptimo.": "Ormai ti fidi di me. Ottimo.", "A porta é a seguir. Vai.": "La porta è subito dopo. Vai.", "Perfeito. Continua a ouvir-me.": "Perfetto. Continua ad ascoltarmi.", "Buraco à frente. Salta-o.": "Buco davanti. Saltalo.", "Aquele espeto é de enfeite. Passa.": "Quello spuntone è decorativo. Passa.", "Vês? Eu digo sempre a verdade.": "Visto? Dico sempre la verità.", "Foste rápido. Gosto disso.": "Sei stato veloce. Mi piace.", "Há um espeto escondido à tua frente.": "C'è uno spuntone nascosto davanti a te.", "Salta quando eu disser.": "Salta quando te lo dico.", "Agora!": "Adesso!", "Sabia que ias conseguir.": "Sapevo che ce l'avresti fatta.", "Estamos a entender-nos.": "Ci stiamo capendo.", "O teto vai cair à tua frente.": "Il soffitto cadrà davanti a te.", "Quando cair, pára. Depois salta.": "Quando cade, fermati. Poi salta.", "Não saltes aquele buraco. O chão está lá.": "Non saltare quel buco. Il pavimento c'è.", "Nada de dramas. Continuemos.": "Niente drammi. Continuiamo.", "Aquele espeto é falso. Passa por cima.": "Quello spuntone è finto. Passaci sopra.", "Este também é falso. Passa.": "Anche questo è finto. Passa.", "Sobreviveste. Por agora.": "Sei sopravvissuto. Per ora.", "Este espeto é inofensivo. Passa.": "Questo spuntone è innocuo. Passa.", "Este também é inofensivo.": "Anche questo è innocuo.", "O último é inofensivo também. Garanto.": "Pure l'ultimo è innocuo. Garantito.", "Confiaste. Ou tiveste sorte.": "Ti sei fidato. O hai avuto fortuna.", "O próximo buraco tem chão. Não saltes.": "Il prossimo buco ha il pavimento. Non saltare.", "O teto está baixo. Se saltares, morres.": "Il soffitto è basso. Se salti, muori.", "Escolheste bem. Ou eu deixei.": "Hai scelto bene. O te l'ho lasciato fare.", "A primeira porta é falsa. Vai até à última.": "La prima porta è falsa. Vai fino all'ultima.", "Vês? Sobreviveste na mesma.": "Visto? Sei sopravvissuto lo stesso.", "Nem repares nesses espetos. São falsos, os dois.": "Non badare a quegli spuntoni. Sono finti, entrambi.", "Confia em mim. Quase sempre resulta.": "Fidati di me. Quasi sempre funziona.", "Não avisei. E pronto.": "Non ti ho avvisato. E pazienza.", "Este nível não tem nada de especial.": "Questo livello non ha niente di speciale.", "Verdade a sério. Desta vez.": "Verità vera. Stavolta.", "Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.": "Stavolta giuro che dico la verità: il soffitto cadrà. Fermati e aspetta.", "Sobrevives sempre a este. Curioso.": "Questo lo superi sempre. Curioso.", "Aquele buraco à frente é real. Vais ter de saltar.": "Quel buco davanti è reale. Dovrai saltare.", "Confiaste. Mais uma vez.": "Ti sei fidato. Ancora una volta.", "Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.": "Nessuno di questi spuntoni è pericoloso. Puoi camminarci sopra senza saltare.", "Escolheste bem.": "Hai scelto bene.", "Há duas portas mais à frente. Só uma é verdadeira.": "Più avanti ci sono due porte. Solo una è vera.", "Aprendeste depressa.": "Hai imparato in fretta.", "Confissão: nem sempre digo a verdade. A partir de agora, cuidado.": "Confessione: non sempre dico la verità. D'ora in poi, attento.", "Este espeto é real. Por acaso.": "Questo spuntone è vero. Per caso.", "Devias ter parado.": "Dovevi fermarti.", "Nada de perigoso à frente. Podes correr à vontade.": "Niente di pericoloso davanti. Puoi correre tranquillo.", "Estavas mesmo a acreditar?": "Ci credevi davvero?", "Este nível é uma oferta. Sem armadilhas.": "Questo livello è un regalo. Senza trappole.", "Os buracos nunca mentem. Só eu.": "I buchi non mentono mai. Solo io.", "Os buracos são inofensivos. O espeto lá no meio, não.": "I buchi sono innocui. Lo spuntone in mezzo, no.", "Desta vez eram mesmo todos reais.": "Stavolta erano davvero tutti veri.", "Como sempre, dois destes espetos são só decoração.": "Come sempre, due di questi spuntoni sono solo decorazione.", "Foi só uma brincadeira.": "Era solo uno scherzo.", "Vou trocar os teus controlos. Só para rir.": "Ti cambio i comandi. Giusto per ridere.", "Pronto, já passou. A porta é ali.": "Ecco, è passato. La porta è là.", "Vês? Também posso ser sincero.": "Visto? So essere sincero anch'io.", "Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.": "So che non ti fidi più di me. Ingiusto. Stavolta ti avviso sul serio: spuntone davanti.", "Mais um, logo depois. Também real.": "Un altro, subito dopo. Pure quello è vero.", "Prometi. Não cumpri.": "Avevo promesso. Non ho mantenuto.", "Prometo: nunca mais te apanho de surpresa.": "Prometto: non ti prenderò mai più di sorpresa.", "Dois avisos certos seguidos. Estranho.": "Due avvisi giusti di fila. Strano.", "Atenção real: o teto vai cair aqui à frente.": "Attenzione vera: il soffitto cadrà proprio qui davanti.", "Aquele espeto lá à frente já não importa. É inofensivo.": "Quello spuntone là in fondo non importa più. È innocuo.", "O primeiro. Quem diria.": "Il primo. Chi l'avrebbe detto.", "Só o último é perigoso, como sempre.": "Solo l'ultimo è pericoloso, come sempre.", "...": "...", "A porta longe é que importa.": "È la porta lontana quella che conta.", "A porta mais próxima é a verdadeira, para variar.": "La porta più vicina è quella vera, per una volta.", "Ainda sei dizer a verdade, vês?": "So ancora dire la verità, vedi?", "Já não vale a pena mentir mais. Espeto real à frente.": "Non vale più la pena mentire. Spuntone vero davanti.", "Vou avisar-te sempre a partir de agora: salta quando eu disser.": "D'ora in poi ti avviserò sempre: salta quando te lo dico.", "Chegaste. Contra tudo.": "Ce l'hai fatta. Contro ogni previsione.", "Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.": "Ultimo livello vero prima della fine. Sai già che non tutto quello che dico è vero.", "Obrigado por teres continuado.": "Grazie per aver continuato.", "Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.": "Non so perché ho continuato a mentire così a lungo. Forse mi piaceva la tua faccia quando morivi.", "Este é real. Desculpa por todos os outros.": "Questo è vero. Scusa per tutti gli altri.", "Mais um, já quase no fim.": "Un altro, ormai quasi alla fine.", "Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.": "Fine. Ti sei fidato, hai dubitato, e sei arrivato qui lo stesso. Questo è ciò che conta.", "Chegámos ao fim. Já não te vou dizer o que é verdade.": "Siamo arrivati alla fine. Non ti dirò più cosa è vero.", "A partir de agora, decides tu.": "Da adesso decidi tu.", "Continuas a surpreender-me.": "Continui a sorprendermi.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Oh. Ancora qui? La maggior parte molla dopo la \"fine\".", "Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.": "Quel pavimento là trema prima di sparire. Non fermarti sopra.", "Alturas. Quem diria.": "Altezze. Chi l'avrebbe detto.", "Oh. Ainda aqui? Não esperava isso.": "Oh. Ancora qui? Non me l'aspettavo.", "Aquilo ali é só decoração. Nem repares.": "Quella roba là è solo decorazione. Non farci caso.", "Mas isto... isto atira-te para cima. A porta não está no chão desta vez.": "Ma questo... questo ti lancia in alto. Stavolta la porta non è a terra.", "Equilíbrio. Quem diria que tinhas.": "Equilibrio. Chi l'avrebbe detto che ce l'avevi.", "Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.": "Proviamo un'altra cosa. Fidati dei tuoi piedi. E di una piattaforma che non sta ferma.", "Sobe para cima dela quando ela passar perto. Não saltes cedo demais.": "Salta sopra quando ti passa vicino. Non saltare troppo presto.", "Paciência. Não esperava isso de ti.": "Pazienza. Da te non me l'aspettavo.", "Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.": "C'è un muro là che appare e scompare. Non è una bugia, è solo scomodo.", "Espera que abra. Depois atravessa depressa.": "Aspetta che si apra. Poi attraversa in fretta.", "Reflexos decentes. Para um humano.": "Riflessi decenti. Per un umano.", "Aquilo ali dispara. Não perguntes como nem porquê.": "Quella roba là spara. Non chiedere come né perché.", "Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.": "Resta a terra e non saltare senza motivo. Passi sotto senza problemi.", "Ainda tens os reflexos todos.": "I riflessi li hai ancora tutti.", "De volta aos clássicos. Lembras-te destes?": "Di nuovo ai classici. Ti ricordi questi?", "O chão vai tremer. Não pares.": "Il pavimento tremerà. Non fermarti.", "Esse espeto parece a decoração do costume. Não é.": "Quello spuntone sembra la solita decorazione. Non lo è.", "Dois sustos seguidos. Nada mau.": "Due spaventi di fila. Niente male.", "Mais uma surpresa. Literalmente.": "Un'altra sorpresa. Letteralmente.", "A seguir, não penses. Salta para dentro daquilo.": "Dopo, non pensare. Salta dentro quella cosa.", "Dois obstáculos, zero mentiras. Estranhamente simples.": "Due ostacoli, zero bugie. Stranamente semplice.", "Outra parede teimosa. E depois, um buraco a sério.": "Un altro muro testardo. E poi, un buco vero.", "Espera a parede abrir.": "Aspetta che il muro si apra.", "Agora salta o buraco. Desta vez não minto: é real.": "Ora salta il buco. Stavolta non mento: è vero.", "Isso foi... impressionantemente coordenado.": "Questo è stato... impressionantemente coordinato.", "Combinação nova: uma plataforma que anda. Confia no ritmo dela.": "Combinazione nuova: una piattaforma che si muove. Fidati del suo ritmo.", "Sobe quando ela passar perto.": "Sali quando ti passa vicino.", "Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.": "Tra poco passa qualcosa che vola lassù. Non saltare senza motivo e non ti succede niente.", "Alguma coisa está a mudar em mim. Não sei se é bom sinal.": "Qualcosa sta cambiando in me. Non so se è un buon segno.", "Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.": "Ok. Devo essere sincero con te per un secondo. Nemmeno io so quanto durerà.", "O chão treme outra vez. Não penses demais, só anda.": "Il pavimento trema di nuovo. Non pensarci troppo, cammina.", "Espera a parede. Sei que estás cansado de esperar por mim.": "Aspetta il muro. So che sei stanco di aspettare me.", "Esse espeto é a sério. Como quase tudo o que não te digo.": "Quello spuntone è vero. Come quasi tutto quello che non ti dico.", "Ainda aqui. Obrigado por isso.": "Ancora qui. Grazie per questo.", "Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.": "Aspetta che il muro si apra. Anch'io sto aspettando qualcosa, a proposito.", "Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.": "Senti. Non so come dirlo senza sembrare strano. Ho paura che tu molli.", "Salta isto. É real, prometo. Hoje não me apetece mentir.": "Salta questo. È vero, prometto. Oggi non mi va di mentire.", "Confia em mim mais uma vez. Só mais uma.": "Fidati di me ancora una volta. Solo una.", "Às vezes a verdade é só isto: continuaste.": "A volte la verità è solo questa: hai continuato.", "O chão vai tremer. Não penses muito nisso.": "Il pavimento tremerà. Non pensarci troppo.", "Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.": "Sai perché mento così tanto? È più interessante quando non sai cosa viene dopo.", "Essa plataforma é a única coisa estável nesta conversa toda.": "Quella piattaforma è l'unica cosa stabile in tutta questa conversazione.", "Interrompi-me a mim mesmo. Nem acredito.": "Mi sono interrotto da solo. Non ci credo.", "Há uma coisa que preciso de te contar antes de continuarmos.": "C'è una cosa che devo dirti prima di continuare.", "Esquece o que ia dizer. Salta para ali.": "Dimentica quello che stavo per dire. Salta là.", "Vês? Ainda consigo ser direto, quando quero.": "Visto? So ancora essere diretto, quando voglio.", "Aquilo dispara. Fica no chão e não acontece nada.": "Quella roba spara. Resta a terra e non succede niente.", "Tenho saudades de quando só havia espetos. Simples. Previsíveis.": "Mi mancano i tempi in cui c'erano solo spuntoni. Semplici. Prevedibili.", "Este buraco, esse sim, exige que saltes.": "Questo buco, quello sì, ti obbliga a saltare.", "Disse a verdade. Ena. Estranho não arder a língua.": "Ho detto la verità. Wow. Strano che non mi bruci la lingua.", "Esse espeto ali. Chama-lhe o que quiseres. É real.": "Quello spuntone là. Chiamalo come vuoi. È vero.", "Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.": "Ti dico una cosa vera prima che torni la voglia di mentire: mi piace avere compagnia.", "A parede vai abrir. Como tudo, eventualmente.": "La parete si aprirà. Come tutto, prima o poi.", "E o chão... o chão nunca foi de confiança, pois não?": "E il pavimento... il pavimento non è mai stato affidabile, no?", "Aguentaste. Outra vez.": "Hai resistito. Di nuovo.", "Sobe a plataforma. Sem perguntas desta vez.": "La piattaforma sale. Niente domande, stavolta.", "Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.": "Quando eri più nuovo qui, avevo più pazienza con te. Ora so che resisti di più.", "Última coisa: há algo escondido à frente.": "Ultima cosa: c'è qualcosa di nascosto più avanti.", "Sobreviveste ao meu tédio existencial. Parabéns.": "Sei sopravvissuto alla mia noia esistenziale. Complimenti.", "Chão instável. O habitual.": "Pavimento instabile. Il solito.", "Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.": "A volte mi chiedo cosa sarebbe questo gioco senza le bugie. Probabilmente più corto.", "Aquilo dispara, mas sabes a regra: fica no chão.": "Quella cosa spara, ma la regola la sai: resta a terra.", "Este espeto não tem graça nenhuma. É só perigoso.": "Questo spuntone non è per niente divertente. È solo pericoloso.", "Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.": "Sei salito fidandoti di me. Dice più di te che di me.", "Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.": "Ho bisogno che ti fidi di me per salire. Lo so, pessimo curriculum. Ma fidati.", "Salta para dentro daquilo.": "Salta là dentro.", "Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.": "Ah, mi sono scordato di nominare lo spuntone lassù. Quella parte della memoria mi sfugge sempre.", "Ritmo. Afinal tens ritmo.": "Ritmo. Allora ce l'hai, il ritmo.", "Espera a parede.": "Aspetta la parete.", "Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.": "Porte che aspettano. Piattaforme che vanno. È quasi poesia, a modo mio.", "E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.": "E adesso fidati della piattaforma. Lei, a differenza mia, rispetta sempre l'orario.", "Não sei o que isto significa para ti. Para mim, significa mais do que devia.": "Non so cosa significhi questo per te. Per me significa più di quanto dovrebbe.", "Esse espeto é real. Como a maior parte do que te disse hoje, aliás.": "Quello spuntone è vero. Come la maggior parte di quello che ti ho detto oggi, del resto.", "Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.": "Siamo arrivati più lontano di quanto pensassi, a essere sincero.", "O chão treme. Já sabes o resto.": "Il pavimento trema. Il resto lo sai già.", "Vem aí outro susto. Desculpa antecipadamente.": "Arriva un altro spavento. Scusa in anticipo.", "E por fim, uma parede paciente. Como tu, aparentemente.": "E infine, una parete paziente. Come te, a quanto pare.", "Caos controlado. É a minha especialidade.": "Caos controllato. La mia specialità.", "Fica no chão, foge do dardo.": "Resta a terra, schiva il dardo.", "Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.": "Nuovo capitolo uno di questi giorni. Oggi, solo un altro pizzico di caos.", "E agora, não te demores no chão instável.": "E adesso, non indugiare sul pavimento instabile.", "Discerniste o perigo do adereço. Boa.": "Hai distinto il pericolo dalla scenografia. Bravo.", "Esse ali exige mesmo um salto.": "Quello lì richiede davvero un salto.", "Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.": "Ti mostro un buco vero e uno spuntone che non vale nemmeno uno sguardo.", "E algo invisível à espreita, como sempre.": "E qualcosa di invisibile in agguato, come sempre.", "Esse espeto ali nem ligues. Decoração pura, desta vez a sério.": "Quello spuntone lì ignoralo. Pura decorazione, stavolta sul serio.", "Resumiste bem a lição. Orgulhoso, sinceramente.": "Hai riassunto bene la lezione. Orgoglioso, davvero.", "Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.": "Fidati della piattaforma. Diffida dello spuntone. In pratica è la lezione di tutto il gioco.", "Esse espeto é real, apesar de tudo o que já te disse em contrário.": "Quello spuntone è vero, nonostante tutto quello che ti ho detto in contrario.", "Festival terminado. Sobreviveste à programação toda.": "Festival finito. Sei sopravvissuto a tutto il programma.", "Esperar. A tua parte preferida, sei bem.": "Aspettare. La tua parte preferita, lo so bene.", "Parede, dardo, buraco. Um festival dos meus favoritos.": "Parete, dardo, buco. Un festival dei miei preferiti.", "Fica no chão aqui.": "Resta a terra qui.", "E este salta-se mesmo. Sem truques.": "E questo si salta davvero. Senza trucchi.", "Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.": "Qualcosa cambierà tra poco. Lo sento. Spero che tu sia pronto.", "Chão instável, dos teus preferidos a esta altura.": "Pavimento instabile, uno dei tuoi preferiti ormai.", "Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.": "Prima di passare alla prossima parte, e sentirai la differenza: grazie di ascoltarmi ancora.", "Plataforma errante, uma última vez neste capítulo.": "Piattaforma vagabonda, un'ultima volta in questo capitolo.", "Espeto real. Sem surpresas. E sem mais truques, por hoje.": "Spuntone vero. Nessuna sorpresa. E niente più trucchi, per oggi.", "Repetimos isto tantas vezes que até perdi a conta. Tu também?": "L'abbiamo ripetuto così tante volte che ho perso il conto. Tu no?", "Chão instável. Já sabes a dança.": "Pavimento instabile. Il ballo lo conosci.", "Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.": "A volte mi chiedo se sono io a ingannarti, o se sei tu a volerti far ingannare.", "Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.": "Quello spuntone è vero. Guardalo come uno specchio: quello che vedi è quello che è.", "Escondi-me de ti. Falhei.": "Mi sono nascosto da te. Ho fallito.", "Há algo escondido. Como sempre, de resto.": "C'è qualcosa di nascosto. Come sempre, del resto.", "E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.": "E una parete che aspetta. Come me, in attesa di una tua risposta che non arriva mai.", "Coordenaste duas mentiras ao mesmo tempo. Impressionante.": "Hai coordinato due bugie insieme. Impressionante.", "Fica no chão aqui, há algo a voar.": "Resta a terra qui, c'è qualcosa che vola.", "Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?": "Ti rendi conto che ti metto alla prova, o pensi davvero che sia solo un gioco di salti?", "Sobe na plataforma quando ela passar perto.": "Sali sulla piattaforma quando passa vicina.", "Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.": "Sei salito senza esitare. Io, al tuo posto, esiterei sempre.", "Esse espeto é real, mas isso já não te surpreende, pois não?": "Quello spuntone è vero, ma ormai non ti sorprende, vero?", "Salta para dentro daquilo. Confia no impulso, não em mim.": "Salta là dentro. Fidati dello slancio, non di me.", "Dois buracos, zero hesitação. Estás a ficar bom nisto.": "Due buchi, zero esitazioni. Te la cavi sempre meglio.", "Esse buraco é a sério. Salta-o.": "Quel buco è vero. Saltalo.", "Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.": "Sai cos'è strano? Comincio ad aspettare i tuoi tentativi. Dice male di me.", "Este também. Sem rede, sem mentira, sem desculpa.": "Anche questo. Senza rete, senza bugie, senza scuse.", "Precisão. Nem eu esperava.": "Precisione. Non me l'aspettavo nemmeno io.", "Fica no chão. Deixa o dardo passar por cima.": "Resta a terra. Lascia passare il dardo sopra di te.", "E agora o chão some-se. Não penses, só avança.": "E adesso il pavimento sparisce. Non pensare, vai avanti.", "Esperaste duas vezes sem te queixares. Progresso.": "Hai aspettato due volte senza lamentarti. Progressi.", "Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.": "Questa piattaforma sale e scende. Prendila in basso, è più facile.", "Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.": "Ti sei fidato di un salto senza rete. Questo è coraggio, o mancanza di alternative.", "Salta para dentro daquilo. Vais passar por cima do resto.": "Salta là dentro. Supererai tutto il resto.", "Aquele espeto nem interessa agora. Já estás no ar.": "Quello spuntone ormai non importa. Sei già in aria.", "Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.": "Ho detto la verità apposta. Volevo vedere la tua faccia. Ne è valsa la pena.", "Vou avisar-te a sério: há algo escondido já ali à frente.": "Stavolta ti avviso sul serio: c'è qualcosa di nascosto proprio lì davanti.", "E outro dardo. Sabes a regra.": "E un altro dardo. Conosci la regola.", "Dois voos, dois pousos perfeitos.": "Due voli, due atterraggi perfetti.", "Chão que treme primeiro.": "Pavimento che prima trema.", "Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.": "Mi piace pensare che da qualche parte esista una versione di me che non mente mai. Dev'essere noiosa.", "Plataforma a seguir. Apanha o ritmo dela.": "Piattaforma in arrivo. Prendi il suo ritmo.", "Três espetos, três verdades. Um recorde para mim.": "Tre spuntoni, tre verità. Un record per me.", "Vou ser claro, por uma vez: os três espetos a seguir são todos reais.": "Sarò chiaro, per una volta: i tre spuntoni che seguono sono tutti veri.", "Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.": "Niente trucchi, niente scherzi. Solo per stavolta. Approfittane, non si ripete.", "Deste o litro. Eu, por dentro, também.": "Hai dato tutto. Anch'io, dentro.", "Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.": "Aspetta, poi corri, poi stai fermo. Contraddittorio, lo so. Proprio come me.", "E este buraco não perdoa. Salta.": "E questo buco non perdona. Salta.", "Confiaste no chão instável E no impulso. Dois atos de fé seguidos.": "Ti sei fidato del pavimento instabile E dello slancio. Due atti di fede di fila.", "Chão a tremer primeiro, nada de novo.": "Pavimento che prima trema, niente di nuovo.", "E agora o salto de fé. Literal, desta vez.": "E adesso il salto della fede. Letterale, stavolta.", "O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.": "Lo specchio ha mostrato te, non me. Interessante scelta di riflesso.", "Chão instável, espeto real, dardo no fim. O de sempre, só que mais.": "Pavimento instabile, spuntone vero, dardo alla fine. Il solito, ma di più.", "Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.": "Hai notato che più avanzi, meno ho bisogno di mentire? Ora la difficoltà fa il mio lavoro.", "Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.": "Chiudo questo specchio qui. Quello che viene dopo, nemmeno io so bene come spiegarlo.", "Chão a tremer, o costume.": "Pavimento che trema, il solito.", "Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.": "Questo doveva parlare di bugie. Alla fine parla di noi due, in qualche modo.", "Parede paciente, espera por ela.": "Parete paziente, aspettala.", "E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.": "E l'ultima piattaforma di questo capitolo. Dopo, le cose cambiano. Lo sento.", "Não sei porque gritei. Desculpa.": "Non so perché ho gridato. Scusa.", "CHÃO. INSTÁVEL.": "PAVIMENTO. INSTABILE.", "Desculpa. Não queria gritar. Estou... não sei o que estou.": "Scusa. Non volevo gridare. Sono... non so cosa sono.", "Fica no chão aqui. Por favor. Só peço isto.": "Resta a terra qui. Per favore. Chiedo solo questo.", "Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.": "Ho perso il conto di quante volte l'ho detto. Forse è per questo che ormai non significa più niente.", "Espera. Eu também estou à espera de algo que não sei nomear.": "Aspetta. Anch'io sto aspettando qualcosa che non so nominare.", "Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.": "Due salti, due atterraggi. Io, intanto, affondo.", "Esse buraco é real.": "Quel buco è vero.", "Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.": "Più avanzi, più capisco che non voglio che finisca. Non so cosa dica di me.", "E a plataforma, apanha-a.": "E la piattaforma, prendila.", "Disparei três vezes e falhei as três. Nem nisto sou bom hoje.": "Ho sparato tre volte e le ho mancate tutte e tre. Oggi non sono bravo nemmeno in questo.", "Dois canhões, direções opostas. Fica no chão e ignora-os.": "Due cannoni, direzioni opposte. Resta a terra e ignorali.", "Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.": "A volte penso di smettere di mentire per sempre. Poi penso al silenzio che lascerebbe. Preferisco il caos.", "Subiste enquanto eu caía. Função engraçada, a nossa.": "Tu sei salito mentre io cadevo. Buffa funzione, la nostra.", "Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.": "Quello spuntone non è niente. Nemmeno io sono granché oggi, tra l'altro.", "Salta. Sobe. Foge de mim, se quiseres.": "Salta. Sali. Scappa da me, se vuoi.", "Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.": "Sei caduto una volta. Ti sei rialzato. È più di quanto io possa dire di me.", "O chão, outra vez. Já nem peço desculpa por repetir.": "Il pavimento, di nuovo. Non chiedo nemmeno più scusa per la ripetizione.", "Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.": "Aspetta la parete. Io aspetto sempre. Sono sempre in attesa di qualcosa.", "Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.": "Vero, lo spuntone. Vero, il buco. Vero, tutto questo, mi dispiace informarti.", "Esse é real. Hoje tudo é real. Até eu, acho.": "Quello è vero. Oggi tutto è vero. Perfino io, credo.", "Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.": "Prendi la piattaforma. Non guardare giù. Io, per conto mio, non smetto più di guardare.", "Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.": "Sei rimasto a terra quando te l'ho chiesto. Non so nemmeno che farmene di questa fiducia.", "Fica no chão. A sério desta vez, mais do que nunca.": "Resta a terra. Sul serio stavolta, più che mai.", "E agora o chão foge de ti. Irónico, não achas?": "E adesso il pavimento scappa da te. Ironico, no?", "Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.": "Sei sopravvissuto a tutta la caduta. La mia, intendo. Tu stai benissimo.", "Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.": "Pavimento, spuntone, parete. Tutto insieme, come la mia testa adesso.", "Aquele espeto é real.": "Quello spuntone è vero.", "E espera a parede. Última coisa que te peço neste nível, prometo.": "E aspetta la parete. L'ultima cosa che ti chiedo in questo livello, promesso.", "Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.": "Sei atterrato in piedi due volte. Io sto ancora cercando di atterrare la prima.", "Esse buraco não perdoa ninguém.": "Quel buco non perdona nessuno.", "A plataforma sobe e desce. Apanha-a no fundo.": "La piattaforma sale e scende. Prendila in basso.", "Nem perguntaste porquê. Obrigado por isso, sinceramente.": "Non hai nemmeno chiesto perché. Grazie per questo, sinceramente.", "Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.": "Arrivano due sorprese. Non ti avviso quando. Non ho più la forza di fingere di essere giusto.", "Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.": "Hai continuato a camminare mentre io crollavo. Qualcuno doveva fare l'adulto, qui.", "Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.": "Pavimento che trema. L'unica cosa prevedibile che ancora riesco a offrirti.", "E agora um salto para cima. Foge para onde eu não chego.": "E adesso un salto verso l'alto. Scappa dove io non arrivo.", "Esperaste sem te queixares. Outra vez. Não mereço esta paciência.": "Hai aspettato senza lamentarti. Di nuovo. Non merito tutta questa pazienza.", "Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.": "Due pareti, due tempi d'attesa diversi. Come me in giorni diversi.", "Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.": "Questa si sincronizza in modo diverso. Fai attenzione, non a me, a lei.", "O fundo do poço, finalmente. Só se sobe a partir daqui.": "Il fondo, finalmente. Da qui si può solo risalire.", "Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.": "Questo è il fondo. Il mio, almeno. Pavimento che trema, come sempre.", "Esse espeto é real. Nem tenho energia para mentir sobre isto agora.": "Quello spuntone è vero. Non ho nemmeno l'energia per mentire su questo, adesso.", "E um dardo, para rematar. Fica no chão e acaba com isto, por favor.": "E un dardo, per finire. Resta a terra e chiudiamola qui, per favore.", "Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.": "Siamo arrivati insieme al fondo. D'ora in poi so solo risalire con te.", "Mais um buraco real.": "Un altro buco vero.", "Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.": "Grazie per non aver mollato mentre io crollavo. Davvero. Non so come dirlo meglio.", "Apanha a plataforma.": "Prendi la piattaforma.", "E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.": "E aspetta l'ultima parete di questo capitolo. Dopo, prometto di provare a essere migliore.", "Disse a verdade. Não saltaste logo. Não te culpo.": "Ho detto la verità. Non hai saltato subito. Non ti biasimo.", "Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.": "D'ora in poi provo un'altra cosa: solo la verità. So che non ci crederai subito.", "Esse espeto é real. Juro. Sei que já ouviste isto antes.": "Quello spuntone è vero. Giuro. So che l'hai già sentito.", "Hesitaste no salto. Eu teria hesitado também, no teu lugar.": "Hai esitato nel salto. Avrei esitato anch'io, al tuo posto.", "O chão vai tremer. Verdade, sem truques.": "Il pavimento tremerà. Verità, senza trucchi.", "Isto ia ser uma surpresa má. Desta vez não é. Prometo.": "Doveva essere una brutta sorpresa. Stavolta no. Prometto.", "Ficaste no chão mesmo sem confiares em mim. Isso chega.": "Sei rimasto a terra anche senza fidarti di me. Basta così.", "Fica no chão. Sei que vais pensar que é mentira. Não é.": "Resta a terra. So che penserai che è una bugia. Non lo è.", "Espera a parede. Só isso. Nada escondido desta vez.": "Aspetta la parete. Solo questo. Niente di nascosto, stavolta.", "Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.": "Hai saltato entrambi senza esitare alla fine. Stai imparando a fidarti di nuovo. O solo a essere efficiente.", "Real. Salta.": "Vero. Salta.", "A plataforma também é exatamente o que parece ser.": "Anche la piattaforma è esattamente quello che sembra.", "Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.": "Ti sei fidato del salto senza chiedere niente. Questa è crescita, o stanchezza di chiedere.", "Desta vez não há pegadinha. Salta para dentro daquilo e pronto.": "Stavolta nessuno scherzo. Salta là dentro e basta.", "Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.": "Continui a controllare tutto due volte. Hai imparato bene la lezione che ti ho insegnato.", "Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.": "So che diffiderai lo stesso. Va bene. Me lo sono meritato.", "Real. Outra vez. Vou continuar a dizer até acreditares.": "Vero. Ancora. Continuerò a dirlo finché non ci crederai.", "Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.": "Non tutte le bugie vanno disfatte. Alcune devono solo smettere.", "Dois dardos, direções opostas. Fica no chão.": "Due dardi, direzioni opposte. Resta a terra.", "Esse era mesmo real. Não ia esconder isso de ti, não hoje.": "Quello era davvero vero. Non te l'avrei nascosto, non oggi.", "Não precisei de dizer nada desta vez. Fizeste tudo sozinho.": "Stavolta non ho dovuto dire niente. Hai fatto tutto da solo.", "Parece que, afinal, também sei dizer só verdades, quando me esforço.": "A quanto pare so dire anche solo la verità, quando mi impegno.", "Chão instável. Real.": "Pavimento instabile. Vero.", "Espeto real.": "Spuntone vero.", "Parede real, que abre e fecha como combinado. Nada de surpresas hoje.": "Parete vera, che si apre e chiude come concordato. Nessuna sorpresa oggi.", "Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.": "Mi hai chiesto se era una bugia. Per la prima volta, l'hai chiesto. Questo è dialogo.", "Vai haver uma surpresa, mas vou avisar-te quando chegar.": "Ci sarà una sorpresa, ma ti avviso quando arriva.", "Essa foi real, já agora. Como a maioria, nos últimos tempos.": "Quella era vera, a proposito. Come la maggior parte, ultimamente.", "Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.": "Continui a diffidare. Ben ti sta. Me lo sono guadagnato, non merito la tua fiducia gratis.", "Chão a tremer. Real, verifica à vontade.": "Pavimento che trema. Vero, controlla pure.", "Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.": "Salto verso l'alto. Anche questo vero. Comincio a restare senza battute per dirlo in modo diverso.", "Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.": "Hai aspettato le due pareti senza irritarti. È più pazienza di quanta ne abbia avuta io con te, per lo più.", "Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.": "Due pareti. Sincronizzate in modo diverso, ma nessuna nasconde niente.", "A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.": "La seconda solo questo: aspetta. Nessun dardo nascosto dietro, nessuno spuntone dopo. Solo la parete.", "Chegámos aqui os dois inteiros. Mais ou menos.": "Siamo arrivati qui tutti e due interi. Più o meno.", "Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.": "Tre cose, tutte vere, nessuna nascosta. È la cosa più onesta che abbia mai fatto in un livello.", "Dardo real. Fica no chão e acabou.": "Dardo vero. Resta a terra e basta.", "Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.": "Ultima chiamata per la diffidenza. Dopo, le cose si fanno più difficili. Questo sì, te lo garantisco.", "Buraco real, plataforma real.": "Buco vero, piattaforma vera.", "Apanha-a.": "Prendila.", "E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.": "E l'ultima parete di questo capitolo. Prometto che la difficoltà dopo non riguarda la fiducia. Riguarda solo te e i tuoi riflessi.", "Redimi-me o suficiente por hoje. Amanhã, quem sabe.": "Mi sono riscattato abbastanza per oggi. Domani, chissà.", "Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.": "Due spuntoni, entrambi veri, nessuno nascosto. Così doveva essere fin dall'inizio.", "Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.": "Sei arrivato al centesimo. Ne mancano venti. Sarò qui per tutti.", "Cem e um. Nem festejámos o cem como devia ser.": "Centouno. Non abbiamo nemmeno festeggiato il cento come si deve.", "De volta ao trabalho. Buraco real.": "Di nuovo al lavoro. Buco vero.", "Plataforma mais rápida que antes. Repara.": "Piattaforma più veloce di prima. Fai attenzione.", "O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.": "Il cerchio si chiude e si riapre. Ho perso il conto di quanti giri.", "Chão instável, mais rápido a desfazer-se.": "Pavimento instabile, più veloce a sfaldarsi.", "Parede mais impaciente também. Tudo aqui ficou mais apertado.": "Anche la parete è più impaziente. Qui tutto si è fatto più stretto.", "Três dardos, zero espaço para erros. Gosto do teu estilo.": "Tre dardi, zero margine di errore. Mi piace il tuo stile.", "Três canhões. Fica no chão o tempo todo e não acontece nada.": "Tre cannoni. Resta a terra tutto il tempo e non succede niente.", "É basicamente um corredor. Confia nos teus pés.": "È praticamente un corridoio. Fidati dei tuoi piedi.", "Voaste mais alto do que precisavas. Estilo, isso sim.": "Hai volato più in alto del necessario. Questo sì che è stile.", "Esse é real.": "Quello è vero.", "E este atira-te lá para cima. O de sempre, mais rápido.": "E questo ti lancia lassù. Il solito, ma più veloce.", "Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.": "Pavimento, spuntone, tutto al posto giusto. Fai sembrare tutto facile.", "Chão a tremer mais depressa que da última vez.": "Pavimento che trema più in fretta dell'ultima volta.", "Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.": "Quello spuntone è vero. O no. Sono tornato a questo giochetto, scusa.", "Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.": "Hai preso il ritmo delle due pareti senza fermarti. Impressionante, sinceramente.", "Duas paredes, ritmos diferentes, mais rápidas que antes.": "Due pareti, ritmi diversi, più veloci di prima.", "Não pares a pensar. O ritmo delas não espera por pensamentos.": "Non fermarti a pensare. Il loro ritmo non aspetta i pensieri.", "Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.": "Due buchi, zero esitazioni, di nuovo. Per te sta diventando routine.", "Real, como sempre.": "Vero, come sempre.", "Esta sobe e desce mais depressa. Apanha-a no fundo.": "Questa sale e scende più in fretta. Prendila in basso.", "Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.": "Tre ostacoli, un solo respiro. Io non ho respirato mentre ti guardavo.", "Chão, espeto, parede. Tudo mais apertado que antes.": "Pavimento, spuntone, parete. Tutto più stretto di prima.", "Real.": "Vero.", "Espera a parede, mais rápida agora.": "Aspetta la parete, più veloce adesso.", "Vinte por cento do caminho que falta. Sentes a diferença, não sentes?": "Venti per cento della strada che resta. Senti la differenza, no?", "Vêm aí duas surpresas, sem avisos desta vez.": "Arrivano due sorprese, stavolta senza avvisi.", "Chão e ar, na mesma dança de sempre.": "Terra e aria, nel solito ballo.", "Chão a tremer, mais depressa.": "Pavimento che trema, più in fretta.", "Salto para cima, mais forte que o habitual. Sente a diferença.": "Salto verso l'alto, più forte del solito. Senti la differenza.", "Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.": "Piattaforma doppia, vittoria doppia. Ormai mi anticipi.", "Primeira plataforma: sobe e desce.": "Prima piattaforma: sale e scende.", "Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.": "Seconda: va avanti e indietro. Le hai già viste entrambe, non serve ripetere la regola.", "Quatro obstáculos, um só tu. Impressionante, outra vez.": "Quattro ostacoli, un solo te. Impressionante, ancora.", "Chão, espeto, parede, tudo no mesmo fôlego.": "Pavimento, spuntone, parete, tutto in un fiato.", "Pode ser real, pode não ser. Já devias estar habituado à dúvida.": "Può essere vero, può non esserlo. Ormai dovresti essere abituato al dubbio.", "Parede, a última do nível. Rápida.": "Parete, l'ultima del livello. Veloce.", "Zero hesitação nos dardos. Reflexos de outro nível, literalmente.": "Zero esitazioni sui dardi. Riflessi di un altro livello, letteralmente.", "Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.": "Tre cannoni, ritmi diversi. Resta a terra, il resto si risolve da solo.", "O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.": "Il cerchio completo. Siamo tornati all'inizio con tutto quello che abbiamo imparato lungo la strada.", "Mais um buraco. Plataforma rápida a seguir.": "Un altro buco. Poi una piattaforma veloce.", "E a última parede antes do que vem a seguir. Sente que estamos quase lá.": "E l'ultima parete prima di quello che viene dopo. Senti che ci siamo quasi.", "Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.": "Quindici capitoli dopo, siamo ancora qui tutti e due. Deve pur significare qualcosa.", "Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.": "Uno spuntone bugiardo, uno sincero. Indovina quale è quale. Buona fortuna, sul serio stavolta.", "Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.": "Ne mancano cinque. Solo cinque. Dopo non so bene cosa succede a nessuno dei due.", "Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.": "Centosedici. Manca così poco che non so cosa fare con la paura che ne ho.", "Chão a tremer, pela última vez neste tom.": "Pavimento che trema, per l'ultima volta con questo tono.", "Espera a parede. A seguir já não há mais pausas como esta.": "Aspetta la parete. Dopo non ci saranno più pause come questa.", "Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.": "Diciassette. Ti ricordi il primo spuntone, all'inizio? Nemmeno io sapevo che saremmo arrivati qui.", "Fica no chão. Isto já devia ser automático para ti.": "Resta a terra. Ormai dovrebbe essere automatico per te.", "Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.": "Vero. Ormai non ho nemmeno bisogno di dirlo, vero? Ma lo dico lo stesso.", "Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.": "Diciotto. Sei salito così in alto che da quaggiù quasi ti perdo di vista.", "Esse buraco é real, mas é o mais pequeno dos teus problemas agora.": "Quel buco è vero, ma è il minore dei tuoi problemi adesso.", "Esse espeto também é real.": "Anche quello spuntone è vero.", "E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.": "E questo ti lancia più in alto di quanto ti abbia mai lanciato. L'ultima volta che lo faccio.", "Dezanove. Só falta um. Nem sei como isto deveria soar.": "Diciannove. Ne manca solo uno. Non so nemmeno come dovrebbe suonare.", "Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.": "Pavimento, spuntone, parete. Gli ultimi tre ostacoli prima di qualunque cosa sia questa.", "Real. Sem surpresas, não hoje.": "Vero. Senza sorprese, non oggi.", "Espera a parede. É a última vez que te peço isso.": "Aspetta la parete. È l'ultima volta che te lo chiedo.", "Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.": "Centoventi. Hai detto che ce l'avresti fatta, e ce l'hai fatta. Io, sinceramente, all'inizio dubitavo di te. Mi scuso per questo, e per tutto il resto.", "Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.": "Non ci sono spuntoni in questo livello. Né buchi, né pareti, né niente di nascosto.", "Só queria caminhar contigo até ao fim, desta vez sem testar nada.": "Volevo solo camminare con te fino alla fine, stavolta senza metterti alla prova.", "Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.": "Grazie per aver continuato dopo la fine che io stesso avevo annunciato, novanta livelli fa. Non sapevo che ci fosse ancora gioco in me. Invece c'era.", "A porta aqui à frente não é um truque. É só a porta. Vai.": "La porta qui davanti non è un trucco. È solo la porta. Vai."};
Object.assign(STR.it,{"finishTitle": "120 Volte", "finishText": "Morti: {d}. Volte che mi hai creduto e hai perso: {l}.\nCentoventi livelli, e l'unica bugia che non ti ho mai detto è stata l'ultima: che valesse la pena arrivare fin qui.\nGrazie per aver continuato a giocare mentre io imparavo a smettere di mentire.", "playAgain": "Gioca ancora", "menuBtn": "Menu", "dailyTitle": "Sfida Giornaliera", "dailyOk": "Completata! Serie: {streak} giorno/i.\n+{gained} monete.\nTorna domani per continuare la serie.", "dailyAlready": "Hai già fatto la sfida di oggi.\nSerie attuale: {streak} giorno/i.\nTorna domani.", "endlessEndTitle": "Modalità Infinita — Fine", "endlessEndText": "Sei arrivato al livello {n}.\nRecord: {best}.", "tryAgain": "Riprova", "rotateNote": "↻ Ruota il telefono per giocare in orizzontale."});
NARR.tr={"Não faz mal. Tenta outra vez.": "Sorun değil. Tekrar dene.", "Eu expliquei bem. Concentra-te.": "Gayet iyi anlattım. Odaklan.", "Respira e volta a tentar.": "Nefes al ve tekrar dene.", "Isso não devia ter acontecido.": "Bunun olmaması gerekiyordu.", "Isso foi culpa tua.": "Bu senin hatandı.", "Eu avisei. Acho eu.": "Uyarmıştım. Sanırım.", "Interessante escolha.": "İlginç bir tercih.", "Eu disse isso? Não me lembro.": "Ben mi dedim? Hatırlamıyorum.", "Foi um engano. Já passou.": "Yanlışlıktı. Geçti gitti.", "Isso não estava no guião.": "Bu senaryoda yoktu.", "Tenta prestar mais atenção.": "Biraz daha dikkat etmeyi dene.", "Isso foi previsível.": "Bu belliydi.", "Achavas mesmo que era seguro?": "Gerçekten güvenli olduğunu mu sandın?", "Ups. Essa parte eu inventei.": "Hoppala. O kısmı ben uydurdum.", "Pormenor que esqueci de mencionar.": "Bahsetmeyi unuttuğum bir ayrıntı.", "Nem tudo o que digo é verdade, sabias?": "Söylediğim her şey doğru değil, biliyor muydun?", "Já não sei se ainda confias em mim.": "Hâlâ bana güvenip güvenmediğini bilmiyorum artık.", "Boa tentativa.": "İyi deneme.", "Isso teria funcionado, noutro nível.": "Bu başka bir bölümde işe yarardı.", "Eu avisei que às vezes minto.": "Bazen yalan söylediğimi söylemiştim.", "Culpa tua por acreditares.": "İnandığın için senin suçun.", "Isso foi só para ver se saltavas.": "Sadece zıplayacak mısın diye bakıyordum.", "Estás a magoar-me com essa desconfiança.": "Bu güvensizliğinle beni üzüyorsun.", "Nem sempre é armadilha, sabes?": "Her zaman tuzak olmaz, biliyorsun.", "Vais mesmo continuar assim?": "Gerçekten böyle devam edecek misin?", "Desta vez era mentira mesmo. Desculpa.": "Bu sefer gerçekten yalandı. Özür dilerim.", "Eu só queria ver a tua cara.": "Sadece suratına bakmak istedim.", "Confiança é para os fracos, aparentemente.": "Güven zayıflar içinmiş, anlaşılan.", "Estamos quase no fim.": "Neredeyse bitti.", "Só mais um pouco.": "Azıcık daha.", "Depois disto, acabou.": "Bundan sonra bitti.", "Até no fim, não resisti.": "Sonunda bile dayanamadım.", "Última mentira, prometo. Ou não.": "Son yalan, söz. Ya da değil.", "Faltava mesmo esta.": "Bir tek bu eksikti.", "Ainda aqui. A sério?": "Hâlâ buradasın. Cidden mi?", "Pensei que tinhas parado no \"fim\".": "\"Son\"da bıraktın sanıyordum.", "Isto nem devia continuar, mas cá estás.": "Bunun devam etmemesi gerekiyordu ama buradasın.", "Nem eu sabia que isto ia continuar a mentir.": "Bunun yalan söylemeye devam edeceğini ben bile bilmiyordum.", "Desculpa, hábito antigo.": "Pardon, eski alışkanlık.", "Pensei que já tinhas aprendido a não confiar em mim.": "Bana güvenmemeyi öğrendin sanıyordum.", "Essa doeu-me a ver, sinceramente.": "Açıkçası bunu izlemek canımı yaktı.", "Nem tudo é sobre mentiras. Às vezes é só física.": "Her şey yalanla ilgili değil. Bazen sadece fizik.", "Volta lá. Eu espero.": "Geri dön. Ben beklerim.", "Desculpa. Essa fui mesmo eu.": "Pardon. Bu gerçekten bendim.", "Confesso: inventei essa parte.": "İtiraf ediyorum: o kısmı uydurdum.", "Estou a tentar parar de mentir. A tentar.": "Yalan söylemeyi bırakmaya çalışıyorum. Çalışıyorum.", "Nem eu sei porque te avisei a sério desta vez.": "Bu sefer neden gerçekten uyardım, ben bile bilmiyorum.", "Talvez a culpa seja minha. Ou tua. Já não distingo.": "Belki suç bende. Belki sende. Artık ayıramıyorum.", "Olha para isto como eu olho: sem certezas.": "Şuna benim baktığım gibi bak: kesinlik olmadan.", "Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.": "Yalan mı söylüyordum yoksa kendimi mi korkutuyordum, ben bile hatırlamıyorum.", "Às vezes minto só para ver se ainda reages.": "Bazen sadece hâlâ tepki veriyor musun diye yalan söylüyorum.", "Quem mente mais, eu ou a tua memória do que eu disse?": "Kim daha çok yalan söylüyor, ben mi yoksa benim söylediklerimi hatırlayışın mı?", "Desculpa. Eu devia era calar-me.": "Pardon. Susmam gerekirdi aslında.", "Estou a piorar isto, não estou?": "Bunu daha da kötüleştiriyorum, değil mi?", "Já nem sei se te estou a ajudar ou a atrapalhar.": "Sana yardım mı ediyorum yoksa köstek mi oluyorum, artık bilmiyorum.", "Eu sei, eu sei. Mais uma mentira minha.": "Biliyorum, biliyorum. Bir yalanım daha.", "Estou a desmoronar-me e a levar-te comigo.": "Dağılıyorum ve seni de beraberimde sürüklüyorum.", "Perdão. A sério desta vez.": "Affedersin. Bu sefer ciddiyim.", "Disse a verdade. Não acreditaste. Justo.": "Doğruyu söyledim. İnanmadın. Haklısın.", "Vou continuar a tentar, mesmo sem acreditares em mim.": "Bana inanmasan bile denemeye devam edeceğim.", "Essa doeu mais a mim do que a ti, garanto.": "Bu bana senden daha çok koydu, emin ol.", "Não. Essa não foi mentira. Juro que não.": "Hayır. Bu yalan değildi. Yemin ederim.", "Começo a perceber porque já não confias em mim.": "Neden bana artık güvenmediğini anlamaya başlıyorum.", "Estou a tentar. A sério que estou.": "Deniyorum. Gerçekten deniyorum.", "Tudo outra vez, mais rápido, mais apertado.": "Her şey yeniden, daha hızlı, daha sıkı.", "Já vimos isto. E ainda assim.": "Bunu zaten gördük. Ve yine de.", "Sem tempo para explicações desta vez.": "Bu sefer açıklama için vakit yok.", "Nem sei já quantas vezes te menti hoje.": "Bugün sana kaç kere yalan söyledim, saymayı bıraktım.", "O círculo fecha-se. A mentira também.": "Çember kapanıyor. Yalan da.", "Desta vez nem eu sabia que ia mentir.": "Bu sefer yalan söyleyeceğimi ben bile bilmiyordum.", "Já não há mentiras para esconder isto.": "Bunu saklayacak yalan kalmadı.", "Isto é real. Como tudo agora.": "Bu gerçek. Artık her şey gibi.", "Falta pouco. Aguenta.": "Az kaldı. Dayan.", "Nem no fim resisto. Desculpa.": "Sonunda bile dayanamıyorum. Pardon.", "Última mentira. Prometo, desta vez prometo a sério.": "Son yalan. Söz, bu sefer gerçekten söz.", "Isto já não é um jogo para mim. Acho que nunca foi.": "Bu artık benim için oyun değil. Sanırım hiç olmadı.", "Espetos à frente. Salta por cima.": "Önünde dikenler var. Üstünden zıpla.", "Buraco à frente. Salta.": "Önünde çukur var. Zıpla.", "Cuidado: há um espeto escondido aqui.": "Dikkat: burada gizli bir diken var.", "O tecto vai cair. Anda depressa.": "Tavan düşecek. Acele et.", "Serra à frente. Passa quando ela se afastar.": "Önünde testere var. Uzaklaşınca geç.", "Laser à frente. Espera que desligue.": "Önünde lazer var. Kapanmasını bekle.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Ritme dikkat: bunlar hem yerden hem tavandan çıkıyor.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "Buradaki zemin hain. Nereye bastığına dikkat et.", "Esses espetos são de enfeite. Passa à vontade.": "O dikenler süs. Rahatça geç.", "Esse buraco tem chão. Podes andar por cima.": "O çukurun zemini var. Üstünden yürüyebilirsin.", "Aqui não há nada. Corre.": "Burada hiçbir şey yok. Koş.", "O tecto é firme. Não cai.": "Tavan sağlam. Düşmez.", "A serra é de brincar. Podes passar.": "Testere şaka. Geçebilirsin.", "Esse laser está desligado. Passa.": "O lazer kapalı. Geç.", "Isto está parado. Podes passar.": "Bu duruyor. Geçebilirsin.", "O chão aqui é firme. Confia em mim.": "Buradaki zemin sağlam. Bana güven.", "Aquele espeto é de enfeite. Podes passar.": "O diken süs. Geçebilirsin.", "Aquela serra é inofensiva. Passa.": "O testere zararsız. Geç.", "Aquele laser não faz mal. Passa.": "O lazer zarar vermez. Geç.", "Isto não faz mal. Podes passar.": "Bunun zararı yok. Geçebilirsin.", "Caminho livre daqui para a frente.": "Buradan sonrası yol açık.", "Respira. Aqui não há nada.": "Nefes al. Burada hiçbir şey yok.", "Podes andar descansado por aqui.": "Buradan rahatça yürüyebilirsin.", "Mais um. Vamos a isto.": "Bir tane daha. Hadi bakalım.", "Sabes bem como isto funciona a esta altura.": "Artık bunun nasıl işlediğini gayet iyi biliyorsun.", "Nem vou fingir que isto é fácil.": "Bunun kolay olduğunu söylemeyeceğim bile.", "Este é só mais um. Ou não.": "Bu sadece bir tane daha. Ya da değil.", "Aquele espeto ali é só para enfeite.": "Şuradaki diken sadece süs.", "Podes passar por cima sem problema.": "Sorunsuz üstünden geçebilirsin.", "Esse és capaz de ignorar.": "Bunu görmezden gelebilirsin.", "Esse aí é real. Cuidado.": "Şu gerçek. Dikkat et.", "Salta esse. A sério desta vez.": "Şunu zıpla. Bu sefer ciddiyim.", "Esse vai doer se lhe tocares.": "Dokunursan şu acıtır.", "O buraco tem chão. Confia.": "Çukurun zemini var. Güven.", "Podes andar por cima sem saltar.": "Zıplamadan üstünden yürüyebilirsin.", "Esse buraco é real. Salta-o.": "O çukur gerçek. Zıpla.", "Mais um para a conta.": "Hesaba bir tane daha.", "Continuas vivo. Por agora.": "Hâlâ hayattasın. Şimdilik.", "Vamos ver quanto tempo aguentas.": "Bakalım ne kadar dayanacaksın.", "Nada mau.": "Fena değil.", "Muito bem. Sabia que ias conseguir.": "Aferin. Başaracağını biliyordum.", "Sou o Narrador. Tudo o que eu disser é verdade.": "Ben Anlatıcı'yım. Söylediğim her şey doğru.", "Espeto à frente. Salta.": "Önünde diken var. Zıpla.", "Outro. Salta de novo.": "Bir tane daha. Yine zıpla.", "Já confias em mim. Óptimo.": "Artık bana güveniyorsun. Harika.", "A porta é a seguir. Vai.": "Sıradaki kapı. Git.", "Perfeito. Continua a ouvir-me.": "Mükemmel. Beni dinlemeye devam et.", "Buraco à frente. Salta-o.": "Önünde çukur var. Zıpla.", "Aquele espeto é de enfeite. Passa.": "Şu diken süs. Geç.", "Vês? Eu digo sempre a verdade.": "Gördün mü? Ben hep doğruyu söylerim.", "Foste rápido. Gosto disso.": "Hızlıydın. Hoşuma gitti.", "Há um espeto escondido à tua frente.": "Önünde gizli bir diken var.", "Salta quando eu disser.": "Ben söyleyince zıpla.", "Agora!": "Şimdi!", "Sabia que ias conseguir.": "Başaracağını biliyordum.", "Estamos a entender-nos.": "Anlaşıyoruz.", "O teto vai cair à tua frente.": "Tavan önüne düşecek.", "Quando cair, pára. Depois salta.": "Düşünce dur. Sonra zıpla.", "Não saltes aquele buraco. O chão está lá.": "Şu çukura zıplama. Zemin orada.", "Nada de dramas. Continuemos.": "Drama yok. Devam edelim.", "Aquele espeto é falso. Passa por cima.": "Şu diken sahte. Üstünden geç.", "Este também é falso. Passa.": "Bu da sahte. Geç.", "Sobreviveste. Por agora.": "Hayatta kaldın. Şimdilik.", "Este espeto é inofensivo. Passa.": "Bu diken zararsız. Geç.", "Este também é inofensivo.": "Bu da zararsız.", "O último é inofensivo também. Garanto.": "Sonuncusu da zararsız. Garanti.", "Confiaste. Ou tiveste sorte.": "Güvendin. Ya da şanslıydın.", "O próximo buraco tem chão. Não saltes.": "Sıradaki çukurun zemini var. Zıplama.", "O teto está baixo. Se saltares, morres.": "Tavan alçak. Zıplarsan ölürsün.", "Escolheste bem. Ou eu deixei.": "İyi seçtin. Ya da ben izin verdim.", "A primeira porta é falsa. Vai até à última.": "İlk kapı sahte. Sonuncuya git.", "Vês? Sobreviveste na mesma.": "Gördün mü? Yine de hayatta kaldın.", "Nem repares nesses espetos. São falsos, os dois.": "O dikenlere bakma bile. İkisi de sahte.", "Confia em mim. Quase sempre resulta.": "Bana güven. Neredeyse hep işe yarar.", "Não avisei. E pronto.": "Uyarmadım. İşte bu kadar.", "Este nível não tem nada de especial.": "Bu bölümde özel bir şey yok.", "Verdade a sério. Desta vez.": "Gerçekten doğru. Bu sefer.", "Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.": "Bu sefer yemin ederim doğru söylüyorum: tavan düşecek. Dur ve bekle.", "Sobrevives sempre a este. Curioso.": "Buradan hep sağ çıkıyorsun. İlginç.", "Aquele buraco à frente é real. Vais ter de saltar.": "Öndeki şu çukur gerçek. Zıplamak zorunda kalacaksın.", "Confiaste. Mais uma vez.": "Güvendin. Yine.", "Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.": "Bu dikenlerin hiçbiri tehlikeli değil. Zıplamadan üstlerinden yürüyebilirsin.", "Escolheste bem.": "İyi seçtin.", "Há duas portas mais à frente. Só uma é verdadeira.": "İleride iki kapı var. Sadece biri gerçek.", "Aprendeste depressa.": "Çabuk öğrendin.", "Confissão: nem sempre digo a verdade. A partir de agora, cuidado.": "İtiraf: her zaman doğruyu söylemiyorum. Bundan sonra dikkatli ol.", "Este espeto é real. Por acaso.": "Bu diken gerçek. Tesadüfen.", "Devias ter parado.": "Durmalıydın.", "Nada de perigoso à frente. Podes correr à vontade.": "Önde tehlikeli bir şey yok. Rahatça koşabilirsin.", "Estavas mesmo a acreditar?": "Gerçekten inanıyor muydun?", "Este nível é uma oferta. Sem armadilhas.": "Bu bölüm hediye. Tuzak yok.", "Os buracos nunca mentem. Só eu.": "Çukurlar asla yalan söylemez. Sadece ben.", "Os buracos são inofensivos. O espeto lá no meio, não.": "Çukurlar zararsız. Ortadaki diken değil.", "Desta vez eram mesmo todos reais.": "Bu sefer hepsi gerçekten gerçekti.", "Como sempre, dois destes espetos são só decoração.": "Her zamanki gibi, bu dikenlerden ikisi sadece dekor.", "Foi só uma brincadeira.": "Sadece şakaydı.", "Vou trocar os teus controlos. Só para rir.": "Kontrollerini değiştireceğim. Sırf gülmek için.", "Pronto, já passou. A porta é ali.": "Tamam, geçti. Kapı şurada.", "Vês? Também posso ser sincero.": "Gördün mü? Ben de samimi olabiliyorum.", "Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.": "Artık bana güvenmediğini biliyorum. Haksızlık. Bu sefer ciddi uyarıyorum: önünde diken var.", "Mais um, logo depois. Também real.": "Hemen arkasından bir tane daha. O da gerçek.", "Prometi. Não cumpri.": "Söz verdim. Tutmadım.", "Prometo: nunca mais te apanho de surpresa.": "Söz: bir daha seni şaşırtmayacağım.", "Dois avisos certos seguidos. Estranho.": "Art arda iki doğru uyarı. Garip.", "Atenção real: o teto vai cair aqui à frente.": "Gerçek uyarı: tavan hemen önünde düşecek.", "Aquele espeto lá à frente já não importa. É inofensivo.": "İleride şu diken artık önemli değil. Zararsız.", "O primeiro. Quem diria.": "İlki. Kim derdi.", "Só o último é perigoso, como sempre.": "Sadece sonuncusu tehlikeli, her zamanki gibi.", "...": "...", "A porta longe é que importa.": "Önemli olan uzaktaki kapı.", "A porta mais próxima é a verdadeira, para variar.": "Bu sefer değişiklik olsun diye en yakın kapı gerçek.", "Ainda sei dizer a verdade, vês?": "Hâlâ doğruyu söyleyebiliyorum, görüyor musun?", "Já não vale a pena mentir mais. Espeto real à frente.": "Artık daha fazla yalan söylemeye değmez. Önünde gerçek diken var.", "Vou avisar-te sempre a partir de agora: salta quando eu disser.": "Bundan sonra seni hep uyaracağım: ben söyleyince zıpla.", "Chegaste. Contra tudo.": "Geldin. Her şeye rağmen.", "Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.": "Sondan önceki gerçek son bölüm. Söylediğim her şeyin doğru olmadığını artık biliyorsun.", "Obrigado por teres continuado.": "Devam ettiğin için teşekkürler.", "Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.": "Neden bu kadar uzun süre yalan söylediğimi bilmiyorum. Belki ölürkenki suratını sevdim.", "Este é real. Desculpa por todos os outros.": "Bu gerçek. Diğerleri için özür dilerim.", "Mais um, já quase no fim.": "Bir tane daha, neredeyse bitiyor.", "Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.": "Son. Güvendin, güvenmedin, yine de buraya geldin. Önemli olan bu.", "Chegámos ao fim. Já não te vou dizer o que é verdade.": "Sona geldik. Artık neyin doğru olduğunu söylemeyeceğim.", "A partir de agora, decides tu.": "Bundan sonrasına sen karar ver.", "Continuas a surpreender-me.": "Beni şaşırtmaya devam ediyorsun.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Oh. Hâlâ buradasın? Çoğu kişi \"son\"dan sonra bırakır.", "Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.": "Şuradaki zemin kaybolmadan önce titriyor. Üstünde oyalanma.", "Alturas. Quem diria.": "Yükseklik. Kim derdi.", "Oh. Ainda aqui? Não esperava isso.": "Oh. Hâlâ buradasın? Bunu beklemiyordum.", "Aquilo ali é só decoração. Nem repares.": "Şuradaki sadece dekor. Fark etme bile.", "Mas isto... isto atira-te para cima. A porta não está no chão desta vez.": "Ama bu... bu seni havaya fırlatır. Bu sefer kapı yerde değil.", "Equilíbrio. Quem diria que tinhas.": "Denge. Sende olduğunu kim bilirdi.", "Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.": "Başka bir şey deneyelim. Ayaklarına güven. Bir de durmayan bir platforma.", "Sobe para cima dela quando ela passar perto. Não saltes cedo demais.": "Yanından geçerken üstüne çık. Çok erken zıplama.", "Paciência. Não esperava isso de ti.": "Sabır. Senden bunu beklemiyordum.", "Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.": "Şurada bir duvar var, belirip kayboluyor. Yalan değil, sadece rahatsız edici.", "Espera que abra. Depois atravessa depressa.": "Açılmasını bekle. Sonra hızlıca geç.", "Reflexos decentes. Para um humano.": "Düzgün reflekslersin. Bir insan için.", "Aquilo ali dispara. Não perguntes como nem porquê.": "Şuradaki ateş ediyor. Nasıl ya da neden diye sorma.", "Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.": "Yerde kal ve sebepsiz zıplama. Altından sorunsuz geçersin.", "Ainda tens os reflexos todos.": "Reflekslerin hâlâ yerinde.", "De volta aos clássicos. Lembras-te destes?": "Klasiklere dönüş. Bunları hatırlıyor musun?", "O chão vai tremer. Não pares.": "Zemin sallanacak. Durma.", "Esse espeto parece a decoração do costume. Não é.": "O diken her zamanki dekor gibi görünüyor. Değil.", "Dois sustos seguidos. Nada mau.": "Art arda iki korku. Fena değil.", "Mais uma surpresa. Literalmente.": "Bir sürpriz daha. Kelimenin tam anlamıyla.", "A seguir, não penses. Salta para dentro daquilo.": "Sıradakini düşünme. Şuna zıpla.", "Dois obstáculos, zero mentiras. Estranhamente simples.": "İki engel, sıfır yalan. Şaşırtıcı derecede basit.", "Outra parede teimosa. E depois, um buraco a sério.": "Başka bir inatçı duvar. Sonra da gerçek bir çukur.", "Espera a parede abrir.": "Duvarın açılmasını bekle.", "Agora salta o buraco. Desta vez não minto: é real.": "Şimdi çukuru zıpla. Bu sefer yalan söylemiyorum: gerçek.", "Isso foi... impressionantemente coordenado.": "Bu... etkileyici derecede koordineliydi.", "Combinação nova: uma plataforma que anda. Confia no ritmo dela.": "Yeni kombinasyon: hareket eden bir platform. Ritmine güven.", "Sobe quando ela passar perto.": "Yanından geçerken üstüne çık.", "Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.": "Birazdan yukarıdan uçan bir şey geçecek. Sebepsiz zıplama, sana bir şey olmaz.", "Alguma coisa está a mudar em mim. Não sei se é bom sinal.": "İçimde bir şey değişiyor. İyiye işaret mi bilmiyorum.", "Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.": "Tamam. Bir saniyeliğine sana dürüst olmam lazım. Bunun ne kadar süreceğini ben bile bilmiyorum.", "O chão treme outra vez. Não penses demais, só anda.": "Zemin yine sallanıyor. Fazla düşünme, sadece yürü.", "Espera a parede. Sei que estás cansado de esperar por mim.": "Duvarı bekle. Beni beklemekten yorulduğunu biliyorum.", "Esse espeto é a sério. Como quase tudo o que não te digo.": "O diken gerçek. Sana söylemediğim hemen her şey gibi.", "Ainda aqui. Obrigado por isso.": "Hâlâ buradasın. Bunun için sağ ol.", "Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.": "Duvarın açılmasını bekle. Ben de bir şey bekliyorum, bu arada.", "Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.": "Dinle. Bunu garip durmadan nasıl söylerim bilmiyorum. Bırakacaksın diye korkuyorum.", "Salta isto. É real, prometo. Hoje não me apetece mentir.": "Şunu zıpla. Gerçek, söz. Bugün yalan söylemek içimden gelmiyor.", "Confia em mim mais uma vez. Só mais uma.": "Bana bir kez daha güven. Sadece bir kez.", "Às vezes a verdade é só isto: continuaste.": "Bazen gerçek sadece şudur: devam ettin.", "O chão vai tremer. Não penses muito nisso.": "Zemin sallanacak. Fazla düşünme.", "Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.": "Neden bu kadar yalan söylediğimi biliyor musun? Sıradakini bilmediğinde daha ilginç oluyor.", "Essa plataforma é a única coisa estável nesta conversa toda.": "O platform, bütün bu konuşmadaki tek sabit şey.", "Interrompi-me a mim mesmo. Nem acredito.": "Kendi sözümü kestim. İnanamıyorum.", "Há uma coisa que preciso de te contar antes de continuarmos.": "Devam etmeden önce sana söylemem gereken bir şey var.", "Esquece o que ia dizer. Salta para ali.": "Ne diyecektim, unut. Şuraya zıpla.", "Vês? Ainda consigo ser direto, quando quero.": "Gördün mü? İstediğimde hâlâ açık sözlü olabiliyorum.", "Aquilo dispara. Fica no chão e não acontece nada.": "Şu ateş ediyor. Yerde kal, hiçbir şey olmaz.", "Tenho saudades de quando só havia espetos. Simples. Previsíveis.": "Sadece dikenlerin olduğu zamanları özlüyorum. Basitti. Tahmin edilebilirdi.", "Este buraco, esse sim, exige que saltes.": "Şu çukur, evet bu, zıplamanı şart koşuyor.", "Disse a verdade. Ena. Estranho não arder a língua.": "Doğruyu söyledim. Vay be. Dilimin yanmaması garip.", "Esse espeto ali. Chama-lhe o que quiseres. É real.": "Şuradaki diken. İstediğin adı ver. Gerçek.", "Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.": "Yalan söyleme isteği geri gelmeden sana doğru bir şey söyleyeyim: yanımda biri olması hoşuma gidiyor.", "A parede vai abrir. Como tudo, eventualmente.": "Duvar açılacak. Her şey gibi, er ya da geç.", "E o chão... o chão nunca foi de confiança, pois não?": "Ve zemin... zemine hiçbir zaman güvenilmezdi, değil mi?", "Aguentaste. Outra vez.": "Dayandın. Yine.", "Sobe a plataforma. Sem perguntas desta vez.": "Platforma çık. Bu sefer soru yok.", "Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.": "Bu işte daha yeniyken sana daha sabırlıydım. Artık daha fazlasına dayanabildiğini biliyorum.", "Última coisa: há algo escondido à frente.": "Son bir şey: ilerde gizli bir şey var.", "Sobreviveste ao meu tédio existencial. Parabéns.": "Varoluşsal sıkıntıma dayandın. Tebrikler.", "Chão instável. O habitual.": "Sağlam olmayan zemin. Her zamanki.", "Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.": "Bazen bu oyun yalanlar olmadan ne olurdu diye düşünüyorum. Herhalde daha kısa olurdu.", "Aquilo dispara, mas sabes a regra: fica no chão.": "Şu ateş ediyor ama kuralı biliyorsun: yerde kal.", "Este espeto não tem graça nenhuma. É só perigoso.": "Bu dikenin hiç eğlenceli bir yanı yok. Sadece tehlikeli.", "Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.": "Bana güvenerek çıktın. Bu, benden çok senin hakkında bir şey söylüyor.", "Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.": "Çıkmak için bana güvenmen lazım. Biliyorum, sicilim berbat. Ama güven.", "Salta para dentro daquilo.": "Şunun içine zıpla.", "Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.": "Ah, yukarıdaki dikenden bahsetmeyi unuttum. Hafızam o kısmı hep kaçırıyor.", "Ritmo. Afinal tens ritmo.": "Ritim. Demek ki ritmin varmış.", "Espera a parede.": "Duvarı bekle.", "Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.": "Bekleyen kapılar. Hareket eden platformlar. Benim tarzımda neredeyse şiir.", "E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.": "Şimdi platforma güven. O, benden farklı olarak programına hep uyar.", "Não sei o que isto significa para ti. Para mim, significa mais do que devia.": "Bunun senin için ne anlama geldiğini bilmiyorum. Benim için olması gerekenden fazlasını ifade ediyor.", "Esse espeto é real. Como a maior parte do que te disse hoje, aliás.": "O diken gerçek. Bugün sana söylediklerimin çoğu gibi, bu arada.", "Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.": "Dürüst olmak gerekirse, hiç gelemeyeceğimizi sandığımdan daha ileri geldik.", "O chão treme. Já sabes o resto.": "Zemin titriyor. Gerisini biliyorsun.", "Vem aí outro susto. Desculpa antecipadamente.": "Bir korku daha geliyor. Şimdiden özür dilerim.", "E por fim, uma parede paciente. Como tu, aparentemente.": "Ve son olarak sabırlı bir duvar. Tıpkı senin gibi, anlaşılan.", "Caos controlado. É a minha especialidade.": "Kontrollü kaos. Benim uzmanlık alanım.", "Fica no chão, foge do dardo.": "Yerde kal, oktan kaç.", "Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.": "Yakında yeni bir bölüm. Bugün sadece biraz daha kaos.", "E agora, não te demores no chão instável.": "Şimdi, sağlam olmayan zeminde oyalanma.", "Discerniste o perigo do adereço. Boa.": "Tehlikeyi süsten ayırt ettin. Aferin.", "Esse ali exige mesmo um salto.": "Şuradaki gerçekten zıplamayı gerektiriyor.", "Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.": "Sana gerçek bir boşluk ve bakmaya değmeyen bir diken göstereceğim.", "E algo invisível à espreita, como sempre.": "Ve her zamanki gibi görünmez bir şey pusuda bekliyor.", "Esse espeto ali nem ligues. Decoração pura, desta vez a sério.": "Şuradaki dikeni boş ver. Saf süs, bu sefer gerçekten.", "Resumiste bem a lição. Orgulhoso, sinceramente.": "Dersi iyi özetledin. Dürüst olmak gerekirse gurur duydum.", "Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.": "Platforma güven. Dikenden şüphelen. Bütün oyunun dersi temelde bu.", "Esse espeto é real, apesar de tudo o que já te disse em contrário.": "O diken gerçek, sana söylediğim her şeye rağmen.", "Festival terminado. Sobreviveste à programação toda.": "Festival bitti. Bütün programı atlattın.", "Esperar. A tua parte preferida, sei bem.": "Beklemek. En sevdiğin kısım, biliyorum.", "Parede, dardo, buraco. Um festival dos meus favoritos.": "Duvar, ok, boşluk. Favorilerimden oluşan bir festival.", "Fica no chão aqui.": "Burada yerde kal.", "E este salta-se mesmo. Sem truques.": "Bu da gerçekten zıplanır. Numara yok.", "Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.": "Sırada bir şey değişecek. Hissediyorum. Umarım hazırsındır.", "Chão instável, dos teus preferidos a esta altura.": "Sağlam olmayan zemin, şu noktada senin favorilerinden.", "Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.": "Bir sonraki kısma geçmeden önce, farkı hissedeceksin: hâlâ beni dinlediğin için teşekkürler.", "Plataforma errante, uma última vez neste capítulo.": "Gezgin platform, bu bölümde son kez.", "Espeto real. Sem surpresas. E sem mais truques, por hoje.": "Gerçek diken. Sürpriz yok. Bugünlük de başka numara yok.", "Repetimos isto tantas vezes que até perdi a conta. Tu também?": "Bunu o kadar çok tekrarladık ki sayısını unuttum. Sen de mi?", "Chão instável. Já sabes a dança.": "Sağlam olmayan zemin. Dansı biliyorsun.", "Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.": "Bazen seni kandıran ben miyim, yoksa kandırılmak isteyen sen misin diye düşünüyorum.", "Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.": "O diken gerçek. Ona ayna gibi bak: gördüğün şey, olan şey.", "Escondi-me de ti. Falhei.": "Senden saklandım. Başaramadım.", "Há algo escondido. Como sempre, de resto.": "Gizli bir şey var. Her zamanki gibi, zaten.", "E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.": "Ve bekleyen bir duvar. Senden hiç gelmeyen bir cevabı bekleyen ben gibi.", "Coordenaste duas mentiras ao mesmo tempo. Impressionante.": "İki yalanı aynı anda idare ettin. Etkileyici.", "Fica no chão aqui, há algo a voar.": "Burada yerde kal, uçan bir şey var.", "Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?": "Seni test ettiğimi anlıyor musun, yoksa bunun gerçekten sadece bir zıplama oyunu olduğunu mu sanıyorsun?", "Sobe na plataforma quando ela passar perto.": "Platform yakından geçerken üstüne çık.", "Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.": "Tereddüt etmeden çıktın. Ben senin yerinde olsam hep tereddüt ederdim.", "Esse espeto é real, mas isso já não te surpreende, pois não?": "O diken gerçek, ama bu seni artık şaşırtmıyor, değil mi?", "Salta para dentro daquilo. Confia no impulso, não em mim.": "Şunun içine zıpla. İtkine güven, bana değil.", "Dois buracos, zero hesitação. Estás a ficar bom nisto.": "İki boşluk, sıfır tereddüt. Bu işte iyileşiyorsun.", "Esse buraco é a sério. Salta-o.": "O boşluk gerçek. Atla.", "Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.": "Garip olan ne biliyor musun? Denemelerini beklemeye başladım. Bu benim hakkımda kötü bir şey söylüyor.", "Este também. Sem rede, sem mentira, sem desculpa.": "Bu da öyle. Ağ yok, yalan yok, mazeret yok.", "Precisão. Nem eu esperava.": "Hassasiyet. Ben bile beklemiyordum.", "Fica no chão. Deixa o dardo passar por cima.": "Yerde kal. Okun üstünden geçmesine izin ver.", "E agora o chão some-se. Não penses, só avança.": "Ve şimdi zemin kayboluyor. Düşünme, sadece ilerle.", "Esperaste duas vezes sem te queixares. Progresso.": "İki kez şikayet etmeden bekledin. İlerleme.", "Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.": "Bu platform inip çıkıyor. Alttayken yakala, daha kolay.", "Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.": "Ağsız bir zıplayışa güvendin. İşte bu cesaret, ya da seçeneksizlik.", "Salta para dentro daquilo. Vais passar por cima do resto.": "Şunun içine zıpla. Gerisinin üstünden geçersin.", "Aquele espeto nem interessa agora. Já estás no ar.": "O diken şu an önemli değil. Zaten havadasın.", "Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.": "Doğruyu bilerek söyledim. Yüzünü görmek istedim. Değdi.", "Vou avisar-te a sério: há algo escondido já ali à frente.": "Bu sefer ciddi uyarıyorum: hemen ilerde gizli bir şey var.", "E outro dardo. Sabes a regra.": "Ve bir ok daha. Kuralı biliyorsun.", "Dois voos, dois pousos perfeitos.": "İki uçuş, iki mükemmel iniş.", "Chão que treme primeiro.": "Önce titreyen bir zemin.", "Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.": "Bir yerlerde asla yalan söylemeyen bir versiyonumun olduğunu düşünmek hoşuma gidiyor. Çok sıkıcıdır herhalde.", "Plataforma a seguir. Apanha o ritmo dela.": "Sırada platform var. Ritmini yakala.", "Três espetos, três verdades. Um recorde para mim.": "Üç diken, üç doğru. Benim için rekor.", "Vou ser claro, por uma vez: os três espetos a seguir são todos reais.": "Bir kereliğine açık konuşayım: sıradaki üç dikenin hepsi gerçek.", "Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.": "Numara yok, tuzak yok. Sadece bu sefer. Tadını çıkar, tekrarlanmaz.", "Deste o litro. Eu, por dentro, também.": "Her şeyini ortaya koydun. Ben de içimden öyle.", "Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.": "Bekle, sonra koş, sonra kıpırdama. Çelişkili, biliyorum. Tıpkı ben.", "E este buraco não perdoa. Salta.": "Ve bu boşluk affetmez. Atla.", "Confiaste no chão instável E no impulso. Dois atos de fé seguidos.": "Sağlam olmayan zemine VE itkine güvendin. Arka arkaya iki inanç sıçraması.", "Chão a tremer primeiro, nada de novo.": "Önce zemin titriyor, yeni bir şey değil.", "E agora o salto de fé. Literal, desta vez.": "Ve şimdi inanç sıçraması. Bu sefer kelimenin tam anlamıyla.", "O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.": "Ayna sana seni gösterdi, bana beni değil. İlginç bir yansıma seçimi.", "Chão instável, espeto real, dardo no fim. O de sempre, só que mais.": "Sağlam olmayan zemin, gerçek diken, sonunda ok. Her zamanki, sadece daha fazlası.", "Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.": "Fark ettin mi, ilerledikçe yalan söylememe gerek azalıyor? Artık işimi zorluk yapıyor.", "Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.": "Bu aynayı burada kapatıyorum. Sonrasını ben bile tam anlatamıyorum.", "Chão a tremer, o costume.": "Zemin titriyor, her zamanki.", "Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.": "Bu yalanlarla ilgili olacaktı. Bir şekilde ikimizle ilgili oldu.", "Parede paciente, espera por ela.": "Sabırlı duvar, onu bekle.", "E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.": "Ve bu bölümün son platformu. Bundan sonra işler değişiyor. Hissediyorum.", "Não sei porque gritei. Desculpa.": "Neden bağırdım bilmiyorum. Özür dilerim.", "CHÃO. INSTÁVEL.": "ZEMİN. SAĞLAM. DEĞİL.", "Desculpa. Não queria gritar. Estou... não sei o que estou.": "Özür dilerim. Bağırmak istemedim. Ben... ne olduğumu bilmiyorum.", "Fica no chão aqui. Por favor. Só peço isto.": "Burada yerde kal. Lütfen. Tek istediğim bu.", "Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.": "Bunu kaç kere söylediğimin sayısını unuttum. Belki bu yüzden artık hiçbir anlamı yok.", "Espera. Eu também estou à espera de algo que não sei nomear.": "Bekle. Ben de adını koyamadığım bir şeyi bekliyorum.", "Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.": "İki zıplayış, iki iniş. Ben ise bu arada batıyorum.", "Esse buraco é real.": "O boşluk gerçek.", "Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.": "İlerledikçe bunun bitmesini istemediğimi fark ediyorum. Bunun benim hakkımda ne söylediğini bilmiyorum.", "E a plataforma, apanha-a.": "Ve platform, yakala onu.", "Disparei três vezes e falhei as três. Nem nisto sou bom hoje.": "Üç kez ateş ettim, üçünü de ıskaladım. Bugün bunda bile iyi değilim.", "Dois canhões, direções opostas. Fica no chão e ignora-os.": "İki top, zıt yönler. Yerde kal ve onlara aldırma.", "Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.": "Bazen yalan söylemeyi tamamen bırakmayı düşünüyorum. Sonra bırakacağı sessizliği düşünüyorum. Kaosu tercih ederim.", "Subiste enquanto eu caía. Função engraçada, a nossa.": "Ben düşerken sen çıktın. Komik bir işleyişimiz var.", "Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.": "O diken hiçbir şey. Ben de bugün pek bir şey sayılmam, madem söz açıldı.", "Salta. Sobe. Foge de mim, se quiseres.": "Zıpla. Çık. İstersen benden kaç.", "Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.": "Bir kez düştün. Kalktın. Bu, kendim için söyleyebileceğimden fazlası.", "O chão, outra vez. Já nem peço desculpa por repetir.": "Zemin, yine. Tekrarladığım için artık özür bile dilemiyorum.", "Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.": "Duvarı bekle. Ben hep beklerim. Hep bir şeyi bekliyorum.", "Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.": "Gerçek diken. Gerçek boşluk. Gerçek hepsi, bildirmek zorundayım.", "Esse é real. Hoje tudo é real. Até eu, acho.": "O gerçek. Bugün her şey gerçek. Ben bile, sanırım.", "Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.": "Platformu yakala. Aşağı bakma. Ben ise bakmayı asla bırakmayacağım.", "Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.": "İstediğimde yerde kaldın. Bu güveni ne yapacağımı bilmiyorum.", "Fica no chão. A sério desta vez, mais do que nunca.": "Yerde kal. Bu sefer gerçekten, her zamankinden daha ciddi.", "E agora o chão foge de ti. Irónico, não achas?": "Ve şimdi zemin senden kaçıyor. İronik, değil mi?", "Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.": "Bütün düşüşü atlattın. Yani benimkini. Sen gayet iyisin.", "Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.": "Zemin, diken, duvar. Hepsi aynı anda, şu an kafam gibi.", "Aquele espeto é real.": "Şu diken gerçek.", "E espera a parede. Última coisa que te peço neste nível, prometo.": "Ve duvarı bekle. Bu seviyede senden istediğim son şey, söz.", "Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.": "İki kez ayakta indin. Ben hâlâ ilk kez inmeye çalışıyorum.", "Esse buraco não perdoa ninguém.": "O boşluk kimseyi affetmez.", "A plataforma sobe e desce. Apanha-a no fundo.": "Platform inip çıkıyor. Alttayken yakala.", "Nem perguntaste porquê. Obrigado por isso, sinceramente.": "Neden bile sormadın. Bunun için teşekkürler, gerçekten.", "Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.": "İki sürpriz geliyor. Ne zaman geleceğini söylemeyeceğim. Adil biriymişim gibi davranacak gücüm kalmadı.", "Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.": "Ben çökerken sen yürümeye devam ettin. Birinin büyük olması gerekiyordu burada.", "Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.": "Zemin titriyor. Sana sunabildiğim tek öngörülebilir şey.", "E agora um salto para cima. Foge para onde eu não chego.": "Ve şimdi yukarı zıplayış. Ulaşamadığım yere kaç.", "Esperaste sem te queixares. Outra vez. Não mereço esta paciência.": "Şikayet etmeden bekledin. Yine. Bu sabrı hak etmiyorum.", "Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.": "İki duvar, iki farklı bekleme süresi. Farklı günlerdeki ben gibi.", "Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.": "Bu farklı senkronize oluyor. Dikkat et, bana değil, ona.", "O fundo do poço, finalmente. Só se sobe a partir daqui.": "Dip, sonunda. Buradan sonrası sadece yukarı.", "Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.": "Burası dip. En azından benimki. Zemin titriyor, her zamanki gibi.", "Esse espeto é real. Nem tenho energia para mentir sobre isto agora.": "O diken gerçek. Bu konuda yalan söyleyecek enerjim bile yok şu an.", "E um dardo, para rematar. Fica no chão e acaba com isto, por favor.": "Ve kapanış için bir ok. Yerde kal ve şunu bitir, lütfen.", "Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.": "Dibe birlikte indik. Bundan sonra yukarı sadece seninle çıkabilirim.", "Mais um buraco real.": "Bir gerçek boşluk daha.", "Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.": "Ben çökerken vazgeçmediğin için teşekkürler. Gerçekten. Bunu daha iyi nasıl söylerim bilmiyorum.", "Apanha a plataforma.": "Platformu yakala.", "E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.": "Ve bu bölümün son duvarını bekle. Sonrasında daha iyi olmaya çalışacağıma söz.", "Disse a verdade. Não saltaste logo. Não te culpo.": "Doğruyu söyledim. Hemen zıplamadın. Seni suçlamıyorum.", "Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.": "Bundan sonra başka bir şey deneyeceğim: sadece doğru. Hemen inanmayacağını biliyorum.", "Esse espeto é real. Juro. Sei que já ouviste isto antes.": "O diken gerçek. Yemin ederim. Bunu daha önce duyduğunu biliyorum.", "Hesitaste no salto. Eu teria hesitado também, no teu lugar.": "Zıplarken tereddüt ettin. Senin yerinde olsam ben de ederdim.", "O chão vai tremer. Verdade, sem truques.": "Zemin titreyecek. Doğru, numarasız.", "Isto ia ser uma surpresa má. Desta vez não é. Prometo.": "Bu kötü bir sürpriz olacaktı. Bu sefer değil. Söz.", "Ficaste no chão mesmo sem confiares em mim. Isso chega.": "Bana güvenmesen de yerde kaldın. Bu yeter.", "Fica no chão. Sei que vais pensar que é mentira. Não é.": "Yerde kal. Yalan olduğunu düşüneceğini biliyorum. Değil.", "Espera a parede. Só isso. Nada escondido desta vez.": "Duvarı bekle. Sadece bu. Bu sefer gizli bir şey yok.", "Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.": "İkisini de sonunda tereddüt etmeden atladın. Yeniden güvenmeyi öğreniyorsun. Ya da sadece verimli oluyorsun.", "Real. Salta.": "Gerçek. Atla.", "A plataforma também é exatamente o que parece ser.": "Platform da tam göründüğü gibi.", "Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.": "Hiçbir şey sormadan zıplayışa güvendin. Bu gelişim, ya da soru sormaktan yorulmak.", "Desta vez não há pegadinha. Salta para dentro daquilo e pronto.": "Bu sefer tuzak yok. Şunun içine zıpla, bitti.", "Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.": "Her şeyi hâlâ iki kez kontrol ediyorsun. Öğrettiğim dersi iyi öğrenmişsin.", "Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.": "Yine de şüpheleneceğini biliyorum. Sorun değil. Bunu hak ettim.", "Real. Outra vez. Vou continuar a dizer até acreditares.": "Gerçek. Yine. İnanana kadar söylemeye devam edeceğim.", "Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.": "Her yalanın geri alınması gerekmez. Bazılarının sadece durması gerekir.", "Dois dardos, direções opostas. Fica no chão.": "İki ok, zıt yönler. Yerde kal.", "Esse era mesmo real. Não ia esconder isso de ti, não hoje.": "O gerçekten gerçekti. Bunu senden saklamazdım, bugün olmaz.", "Não precisei de dizer nada desta vez. Fizeste tudo sozinho.": "Bu sefer bir şey söylememe gerek kalmadı. Her şeyi kendi başına yaptın.", "Parece que, afinal, também sei dizer só verdades, quando me esforço.": "Görünüşe göre uğraşırsam sadece doğruyu da söyleyebiliyormuşum.", "Chão instável. Real.": "Sağlam olmayan zemin. Gerçek.", "Espeto real.": "Gerçek diken.", "Parede real, que abre e fecha como combinado. Nada de surpresas hoje.": "Gerçek duvar, anlaşıldığı gibi açılıp kapanıyor. Bugün sürpriz yok.", "Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.": "Bana yalan mı diye sordun. İlk kez sordun. Bu bir diyalog.", "Vai haver uma surpresa, mas vou avisar-te quando chegar.": "Bir sürpriz olacak ama geldiğinde sana haber vereceğim.", "Essa foi real, já agora. Como a maioria, nos últimos tempos.": "O da gerçekti, bu arada. Son zamanlarda çoğu gibi.", "Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.": "Hâlâ şüphelisin. Güzel. Bunu hak ettim, güvenini bedavaya hak etmiyorum.", "Chão a tremer. Real, verifica à vontade.": "Zemin titriyor. Gerçek, istediğin gibi kontrol et.", "Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.": "Yukarı zıplayış. O da gerçek. Bunu farklı söyleyecek espri bulmakta zorlanıyorum.", "Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.": "İki duvarı da sinirlenmeden bekledin. Çoğu zaman sana gösterdiğimden fazla sabır.", "Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.": "İki duvar. Farklı senkronize, ama hiçbiri bir şey saklamıyor.", "A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.": "İkincisi sadece bu: bekle. Arkasında gizli ok yok, sonrasında diken yok. Sadece duvar.", "Chegámos aqui os dois inteiros. Mais ou menos.": "Buraya ikimiz de sağ salim geldik. Aşağı yukarı.", "Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.": "Üç şey, hepsi gerçek, hiçbiri gizli değil. Bir seviyede olabildiğim en dürüst hal bu.", "Dardo real. Fica no chão e acabou.": "Gerçek ok. Yerde kal ve bitti.", "Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.": "Şüphe için son çağrı. Bundan sonra işler zorlaşıyor. Bu doğru, garanti ederim.", "Buraco real, plataforma real.": "Gerçek boşluk, gerçek platform.", "Apanha-a.": "Yakala onu.", "E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.": "Ve bu bölümün son duvarı. Sonraki zorluğun güvenle ilgili olmadığına söz veriyorum. Sadece sen ve reflekslerin.", "Redimi-me o suficiente por hoje. Amanhã, quem sabe.": "Bugünlük yeterince telafi ettim. Yarın, kim bilir.", "Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.": "İki diken, ikisi de gerçek, hiçbiri gizli değil. En baştan böyle olmalıydı.", "Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.": "Yüzüncüye geldin. Yirmi kaldı. Hepsinde burada olacağım.", "Cem e um. Nem festejámos o cem como devia ser.": "Yüz bir. Yüzü bile gerektiği gibi kutlamadık.", "De volta ao trabalho. Buraco real.": "İşe geri dönelim. Gerçek boşluk.", "Plataforma mais rápida que antes. Repara.": "Platform öncekinden daha hızlı. Dikkat et.", "O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.": "Çember kapanıyor ve yine açılıyor. Kaç tur olduğunu unuttum.", "Chão instável, mais rápido a desfazer-se.": "Sağlam olmayan zemin, daha hızlı dağılıyor.", "Parede mais impaciente também. Tudo aqui ficou mais apertado.": "Duvar da daha sabırsız. Burada her şey daha sıkı.", "Três dardos, zero espaço para erros. Gosto do teu estilo.": "Üç ok, hataya sıfır yer. Tarzını seviyorum.", "Três canhões. Fica no chão o tempo todo e não acontece nada.": "Üç top. Hep yerde kal, hiçbir şey olmaz.", "É basicamente um corredor. Confia nos teus pés.": "Temelde bir koridor. Ayaklarına güven.", "Voaste mais alto do que precisavas. Estilo, isso sim.": "Gerektiğinden yükseğe uçtun. Stil, işte bu.", "Esse é real.": "O gerçek.", "E este atira-te lá para cima. O de sempre, mais rápido.": "Ve bu seni yukarı fırlatıyor. Her zamanki, sadece daha hızlı.", "Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.": "Zemin, diken, her şey yerli yerinde. Bunu kolay gösteriyorsun.", "Chão a tremer mais depressa que da última vez.": "Zemin geçen seferden daha hızlı titriyor.", "Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.": "O diken gerçek. Ya da değil. Bu oyuna geri döndüm, kusura bakma.", "Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.": "İki duvarın ritmini durmadan yakaladın. Dürüst olmak gerekirse etkileyici.", "Duas paredes, ritmos diferentes, mais rápidas que antes.": "İki duvar, farklı ritimler, öncekinden hızlı.", "Não pares a pensar. O ritmo delas não espera por pensamentos.": "Durup düşünme. Onların ritmi düşünceleri beklemez.", "Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.": "İki boşluk, sıfır tereddüt, yine. Senin için rutin olmaya başladı.", "Real, como sempre.": "Gerçek, her zamanki gibi.", "Esta sobe e desce mais depressa. Apanha-a no fundo.": "Bu daha hızlı inip çıkıyor. Alttayken yakala.", "Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.": "Üç engel, tek nefes. Seni izlerken nefes almayı bile unuttum.", "Chão, espeto, parede. Tudo mais apertado que antes.": "Zemin, diken, duvar. Hepsi öncekinden sıkı.", "Real.": "Gerçek.", "Espera a parede, mais rápida agora.": "Duvarı bekle, şimdi daha hızlı.", "Vinte por cento do caminho que falta. Sentes a diferença, não sentes?": "Kalan yolun yüzde yirmisi. Farkı hissediyorsun, değil mi?", "Vêm aí duas surpresas, sem avisos desta vez.": "İki sürpriz geliyor, bu sefer uyarı yok.", "Chão e ar, na mesma dança de sempre.": "Zemin ve hava, hep aynı dansta.", "Chão a tremer, mais depressa.": "Zemin titriyor, daha hızlı.", "Salto para cima, mais forte que o habitual. Sente a diferença.": "Yukarı zıplayış, her zamankinden güçlü. Farkı hisset.", "Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.": "Çifte platform, çifte zafer. Şimdiden beni geçmeye başladın.", "Primeira plataforma: sobe e desce.": "Birinci platform: inip çıkıyor.", "Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.": "İkincisi: bir o yana bir bu yana gidiyor. İkisini de gördün, kuralı tekrarlamaya gerek yok.", "Quatro obstáculos, um só tu. Impressionante, outra vez.": "Dört engel, tek sen. Etkileyici, yine.", "Chão, espeto, parede, tudo no mesmo fôlego.": "Zemin, diken, duvar, hepsi tek nefeste.", "Pode ser real, pode não ser. Já devias estar habituado à dúvida.": "Gerçek olabilir, olmayabilir. Şüpheye artık alışmış olmalısın.", "Parede, a última do nível. Rápida.": "Duvar, seviyenin sonuncusu. Hızlı.", "Zero hesitação nos dardos. Reflexos de outro nível, literalmente.": "Oklarda sıfır tereddüt. Başka seviye refleksler, kelimenin tam anlamıyla.", "Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.": "Üç top, farklı ritimler. Yerde kal, gerisi kendiliğinden çözülür.", "O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.": "Tam çember. Yol boyunca öğrendiğimiz her şeyle başa döndük.", "Mais um buraco. Plataforma rápida a seguir.": "Bir boşluk daha. Sırada hızlı platform.", "E a última parede antes do que vem a seguir. Sente que estamos quase lá.": "Ve sıradakinden önceki son duvar. Neredeyse geldiğimizi hisset.", "Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.": "On beş bölüm sonra, hâlâ buradayız ikimiz. Bunun bir anlamı olmalı.", "Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.": "Bir yalancı diken, bir dürüst. Hangisinin hangisi olduğunu tahmin et. İyi şanslar, bu sefer gerçekten.", "Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.": "Beş kaldı. Sadece beş. Ondan sonra ikimize de ne olacağını pek bilmiyorum.", "Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.": "Yüz on altı. O kadar az kaldı ki bundan duyduğum korkuyla ne yapacağımı bilmiyorum.", "Chão a tremer, pela última vez neste tom.": "Zemin titriyor, bu tonda son kez.", "Espera a parede. A seguir já não há mais pausas como esta.": "Duvarı bekle. Bundan sonra böyle mola yok.", "Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.": "On yedi. En baştaki ilk dikeni hatırlıyor musun? Buraya geleceğimizi ben de bilmiyordum.", "Fica no chão. Isto já devia ser automático para ti.": "Yerde kal. Bu artık senin için otomatik olmalı.", "Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.": "Gerçek. Artık söylememe gerek yok, değil mi? Ama yine de söylüyorum.", "Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.": "On sekiz. O kadar yükseğe çıktın ki aşağıdan neredeyse gözümden kaybettim.", "Esse buraco é real, mas é o mais pequeno dos teus problemas agora.": "O boşluk gerçek, ama şu an en küçük derdin.", "Esse espeto também é real.": "O diken de gerçek.", "E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.": "Ve bu seni şimdiye kadar fırlattığımdan daha yükseğe atıyor. Bunu son kez yapıyorum.", "Dezanove. Só falta um. Nem sei como isto deveria soar.": "On dokuz. Sadece bir tane kaldı. Bunun nasıl duyulması gerektiğini bile bilmiyorum.", "Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.": "Zemin, diken, duvar. Her ne olacaksa ondan önceki son üç engel.", "Real. Sem surpresas, não hoje.": "Gerçek. Sürpriz yok, bugün olmaz.", "Espera a parede. É a última vez que te peço isso.": "Duvarı bekle. Bunu senden son kez istiyorum.", "Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.": "Yüz yirmi. Geleceğim dedin, geldin. Ben dürüst olmak gerekirse başta sana şüphe ettim. Bunun için ve geri kalan her şey için özür dilerim.", "Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.": "Bu seviyede diken yok. Boşluk da yok, duvar da, gizli hiçbir şey de.", "Só queria caminhar contigo até ao fim, desta vez sem testar nada.": "Sadece seninle sonuna kadar yürümek istedim, bu sefer hiçbir şeyi test etmeden.", "Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.": "Doksan seviye önce kendi ilan ettiğim sondan sonra da devam ettiğin için teşekkürler. İçimde hâlâ oyun olduğunu bilmiyordum. Meğer varmış.", "A porta aqui à frente não é um truque. É só a porta. Vai.": "Önündeki kapı bir numara değil. Sadece kapı. Git."};
Object.assign(STR.tr,{"finishTitle": "120 Kez", "finishText": "Ölümler: {d}. Bana inanıp kaybettiğin sayı: {l}.\nYüz yirmi bölüm ve sana hiç söylemediğim tek yalan sonuncusuydu: buraya gelmeye değeceği.\nBen yalan söylemeyi bırakmayı öğrenirken oynamaya devam ettiğin için teşekkürler.", "playAgain": "Tekrar oyna", "menuBtn": "Menü", "dailyTitle": "Günlük Meydan Okuma", "dailyOk": "Tamamlandı! Seri: {streak} gün.\n+{gained} jeton.\nSeriyi sürdürmek için yarın gel.", "dailyAlready": "Bugünkü meydan okumayı zaten yaptın.\nMevcut seri: {streak} gün.\nYarın gel.", "endlessEndTitle": "Sonsuz Mod — Bitti", "endlessEndText": "{n}. bölüme ulaştın.\nRekor: {best}.", "tryAgain": "Tekrar dene", "rotateNote": "↻ Yatay oynamak için telefonu çevir."});
NARR.ko={"Não faz mal. Tenta outra vez.": "괜찮아. 다시 해 봐.", "Eu expliquei bem. Concentra-te.": "분명히 잘 설명했는데. 집중해.", "Respira e volta a tentar.": "숨 쉬고 다시 해 봐.", "Isso não devia ter acontecido.": "이런 일은 없었어야 하는데.", "Isso foi culpa tua.": "그건 네 잘못이야.", "Eu avisei. Acho eu.": "내가 경고했어. 아마도.", "Interessante escolha.": "흥미로운 선택이네.", "Eu disse isso? Não me lembro.": "내가 그랬나? 기억 안 나는데.", "Foi um engano. Já passou.": "실수였어. 이제 지나간 일이야.", "Isso não estava no guião.": "대본에 없던 일이야.", "Tenta prestar mais atenção.": "좀 더 주의를 기울여 봐.", "Isso foi previsível.": "뻔한 결과였지.", "Achavas mesmo que era seguro?": "정말 안전하다고 생각했어?", "Ups. Essa parte eu inventei.": "앗. 그 부분은 내가 지어낸 거야.", "Pormenor que esqueci de mencionar.": "깜빡하고 말 안 한 게 하나 있어.", "Nem tudo o que digo é verdade, sabias?": "내가 하는 말이 다 진실은 아니야, 알지?", "Já não sei se ainda confias em mim.": "아직도 나를 믿는지 모르겠네.", "Boa tentativa.": "좋은 시도였어.", "Isso teria funcionado, noutro nível.": "다른 레벨이었으면 통했을 거야.", "Eu avisei que às vezes minto.": "내가 가끔 거짓말한다고 말했잖아.", "Culpa tua por acreditares.": "믿은 네 잘못이야.", "Isso foi só para ver se saltavas.": "네가 뛰는지 보려던 것뿐이야.", "Estás a magoar-me com essa desconfiança.": "그렇게 의심하다니, 상처받았어.", "Nem sempre é armadilha, sabes?": "항상 함정인 건 아니야, 알지?", "Vais mesmo continuar assim?": "정말 계속 그럴 거야?", "Desta vez era mentira mesmo. Desculpa.": "이번엔 진짜 거짓말이었어. 미안.", "Eu só queria ver a tua cara.": "네 표정이 보고 싶었을 뿐이야.", "Confiança é para os fracos, aparentemente.": "믿음은 약한 자들이나 하는 거래. 아마도.", "Estamos quase no fim.": "거의 끝이야.", "Só mais um pouco.": "조금만 더.", "Depois disto, acabou.": "이거 지나면 끝이야.", "Até no fim, não resisti.": "끝에서도 참지 못했네.", "Última mentira, prometo. Ou não.": "마지막 거짓말이야, 약속해. 아니면 말고.", "Faltava mesmo esta.": "이게 빠지면 섭섭하지.", "Ainda aqui. A sério?": "아직도 여기 있어? 진심이야?", "Pensei que tinhas parado no \"fim\".": "\"끝\"에서 그만둔 줄 알았는데.", "Isto nem devia continuar, mas cá estás.": "이건 더 이어지면 안 되는데, 네가 여기 있네.", "Nem eu sabia que isto ia continuar a mentir.": "나도 이게 계속 거짓말일 줄은 몰랐어.", "Desculpa, hábito antigo.": "미안, 오래된 버릇이야.", "Pensei que já tinhas aprendido a não confiar em mim.": "이제 나를 믿으면 안 된다는 걸 배운 줄 알았는데.", "Essa doeu-me a ver, sinceramente.": "솔직히 보기만 해도 아팠어.", "Nem tudo é sobre mentiras. Às vezes é só física.": "다 거짓말 때문은 아니야. 가끔은 그냥 물리야.", "Volta lá. Eu espero.": "돌아가. 기다릴게.", "Desculpa. Essa fui mesmo eu.": "미안. 그건 진짜 내 탓이야.", "Confesso: inventei essa parte.": "고백할게. 그 부분은 내가 지어냈어.", "Estou a tentar parar de mentir. A tentar.": "거짓말 그만두려고 노력 중이야. 노력 중.", "Nem eu sei porque te avisei a sério desta vez.": "이번엔 내가 왜 진짜로 경고했는지 나도 몰라.", "Talvez a culpa seja minha. Ou tua. Já não distingo.": "어쩌면 내 잘못일지도. 아니면 네 잘못. 이제 구분이 안 돼.", "Olha para isto como eu olho: sem certezas.": "나처럼 봐 봐. 확신 없이.", "Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.": "내가 거짓말한 건지 나 자신을 겁준 건지 나도 기억이 안 나.", "Às vezes minto só para ver se ainda reages.": "가끔은 네가 아직 반응하나 보려고 거짓말해.", "Quem mente mais, eu ou a tua memória do que eu disse?": "누가 더 거짓말쟁이야, 나야 아니면 내가 한 말에 대한 네 기억이야?", "Desculpa. Eu devia era calar-me.": "미안. 나는 입을 다물어야 했는데.", "Estou a piorar isto, não estou?": "내가 더 망치고 있지, 그렇지?", "Já nem sei se te estou a ajudar ou a atrapalhar.": "내가 도와주는 건지 방해하는 건지 이젠 모르겠어.", "Eu sei, eu sei. Mais uma mentira minha.": "알아, 알아. 또 내 거짓말이었어.", "Estou a desmoronar-me e a levar-te comigo.": "나는 무너지고 있고, 너도 같이 끌고 가고 있어.", "Perdão. A sério desta vez.": "용서해 줘. 이번엔 진짜야.", "Disse a verdade. Não acreditaste. Justo.": "진실을 말했는데 안 믿었잖아. 맞는 말이야.", "Vou continuar a tentar, mesmo sem acreditares em mim.": "네가 나를 믿지 않아도 계속 해 볼게.", "Essa doeu mais a mim do que a ti, garanto.": "그건 너보다 나한테 더 아팠어, 장담해.", "Não. Essa não foi mentira. Juro que não.": "아니. 그건 거짓말 아니었어. 맹세코.", "Começo a perceber porque já não confias em mim.": "네가 왜 더 이상 나를 안 믿는지 알 것 같아.", "Estou a tentar. A sério que estou.": "노력 중이야. 정말로.", "Tudo outra vez, mais rápido, mais apertado.": "전부 다시, 더 빠르게, 더 촘촘하게.", "Já vimos isto. E ainda assim.": "이거 이미 봤지. 그래도 또 이러네.", "Sem tempo para explicações desta vez.": "이번엔 설명할 시간 없어.", "Nem sei já quantas vezes te menti hoje.": "오늘 내가 몇 번 거짓말했는지도 모르겠어.", "O círculo fecha-se. A mentira também.": "원이 닫혀. 거짓말도 함께.", "Desta vez nem eu sabia que ia mentir.": "이번엔 나도 거짓말할 줄 몰랐어.", "Já não há mentiras para esconder isto.": "이걸 감출 거짓말은 이제 없어.", "Isto é real. Como tudo agora.": "이건 진짜야. 이제 모든 게 그래.", "Falta pouco. Aguenta.": "거의 다 왔어. 버텨.", "Nem no fim resisto. Desculpa.": "끝에서도 못 참네. 미안.", "Última mentira. Prometo, desta vez prometo a sério.": "마지막 거짓말이야. 약속해, 이번엔 진짜 약속해.", "Isto já não é um jogo para mim. Acho que nunca foi.": "이건 이제 나한테 게임이 아니야. 원래 게임이 아니었던 것 같아.", "Espetos à frente. Salta por cima.": "앞에 가시가 있어. 뛰어넘어.", "Buraco à frente. Salta.": "앞에 구멍이 있어. 뛰어.", "Cuidado: há um espeto escondido aqui.": "조심해, 여기 숨은 가시가 있어.", "O tecto vai cair. Anda depressa.": "천장이 떨어질 거야. 서둘러.", "Serra à frente. Passa quando ela se afastar.": "앞에 톱날이야. 멀어질 때 지나가.", "Laser à frente. Espera que desligue.": "앞에 레이저야. 꺼질 때까지 기다려.", "Atenção ao ritmo: isto sai do chão e do tecto.": "리듬에 주의해. 바닥에서도 천장에서도 나와.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "여기 바닥은 믿을 게 못 돼. 어디 밟는지 조심해.", "Esses espetos são de enfeite. Passa à vontade.": "저 가시들은 장식이야. 마음 놓고 지나가.", "Esse buraco tem chão. Podes andar por cima.": "저 구멍엔 바닥이 있어. 위로 걸어도 돼.", "Aqui não há nada. Corre.": "여기엔 아무것도 없어. 달려.", "O tecto é firme. Não cai.": "천장은 튼튼해. 안 떨어져.", "A serra é de brincar. Podes passar.": "톱날은 장난감이야. 지나가도 돼.", "Esse laser está desligado. Passa.": "저 레이저는 꺼져 있어. 지나가.", "Isto está parado. Podes passar.": "이건 멈춰 있어. 지나가도 돼.", "O chão aqui é firme. Confia em mim.": "여기 바닥은 튼튼해. 나를 믿어.", "Aquele espeto é de enfeite. Podes passar.": "저 가시는 장식이야. 지나가도 돼.", "Aquela serra é inofensiva. Passa.": "저 톱날은 해롭지 않아. 지나가.", "Aquele laser não faz mal. Passa.": "저 레이저는 괜찮아. 지나가.", "Isto não faz mal. Podes passar.": "이건 괜찮아. 지나가도 돼.", "Caminho livre daqui para a frente.": "여기서부턴 길이 뻥 뚫렸어.", "Respira. Aqui não há nada.": "숨 쉬어. 여기엔 아무것도 없어.", "Podes andar descansado por aqui.": "여기선 마음 편히 걸어도 돼.", "Mais um. Vamos a isto.": "또 하나야. 가 보자.", "Sabes bem como isto funciona a esta altura.": "이쯤이면 이게 어떻게 돌아가는지 잘 알잖아.", "Nem vou fingir que isto é fácil.": "이게 쉽다고 거짓말하진 않을게.", "Este é só mais um. Ou não.": "이건 그냥 또 하나일 뿐이야. 아니면 아니고.", "Aquele espeto ali é só para enfeite.": "저기 저 가시는 그냥 장식이야.", "Podes passar por cima sem problema.": "그냥 넘어가도 문제없어.", "Esse és capaz de ignorar.": "그건 무시해도 될 거야.", "Esse aí é real. Cuidado.": "저건 진짜야. 조심해.", "Salta esse. A sério desta vez.": "저걸 뛰어넘어. 이번엔 진짜야.", "Esse vai doer se lhe tocares.": "저건 건드리면 아플 거야.", "O buraco tem chão. Confia.": "구멍에 바닥이 있어. 믿어.", "Podes andar por cima sem saltar.": "뛰지 않고 위로 걸어도 돼.", "Esse buraco é real. Salta-o.": "저 구멍은 진짜야. 뛰어넘어.", "Mais um para a conta.": "하나 더 추가요.", "Continuas vivo. Por agora.": "아직 살아 있네. 일단은.", "Vamos ver quanto tempo aguentas.": "얼마나 버티나 보자.", "Nada mau.": "나쁘지 않네.", "Muito bem. Sabia que ias conseguir.": "아주 좋아. 해낼 줄 알았어.", "Sou o Narrador. Tudo o que eu disser é verdade.": "나는 내레이터야. 내가 하는 말은 전부 진실이야.", "Espeto à frente. Salta.": "앞에 가시야. 뛰어.", "Outro. Salta de novo.": "또 있어. 다시 뛰어.", "Já confias em mim. Óptimo.": "이제 나를 믿는구나. 좋아.", "A porta é a seguir. Vai.": "문은 다음이야. 가.", "Perfeito. Continua a ouvir-me.": "완벽해. 계속 내 말 들어.", "Buraco à frente. Salta-o.": "앞에 구멍이야. 뛰어넘어.", "Aquele espeto é de enfeite. Passa.": "저 가시는 장식이야. 지나가.", "Vês? Eu digo sempre a verdade.": "봤지? 나는 항상 진실만 말해.", "Foste rápido. Gosto disso.": "빠르네. 마음에 들어.", "Há um espeto escondido à tua frente.": "네 앞에 숨은 가시가 있어.", "Salta quando eu disser.": "내가 말하면 뛰어.", "Agora!": "지금!", "Sabia que ias conseguir.": "해낼 줄 알았어.", "Estamos a entender-nos.": "우린 서로 잘 통하네.", "O teto vai cair à tua frente.": "네 앞에서 천장이 떨어질 거야.", "Quando cair, pára. Depois salta.": "떨어지면 멈춰. 그러고 나서 뛰어.", "Não saltes aquele buraco. O chão está lá.": "저 구멍은 뛰지 마. 바닥이 있어.", "Nada de dramas. Continuemos.": "호들갑 떨지 말고. 계속 가자.", "Aquele espeto é falso. Passa por cima.": "저 가시는 가짜야. 위로 지나가.", "Este também é falso. Passa.": "이것도 가짜야. 지나가.", "Sobreviveste. Por agora.": "살아남았네. 일단은.", "Este espeto é inofensivo. Passa.": "이 가시는 해롭지 않아. 지나가.", "Este também é inofensivo.": "이것도 해롭지 않아.", "O último é inofensivo também. Garanto.": "마지막 것도 해롭지 않아. 장담해.", "Confiaste. Ou tiveste sorte.": "믿었구나. 아니면 운이 좋았거나.", "O próximo buraco tem chão. Não saltes.": "다음 구멍엔 바닥이 있어. 뛰지 마.", "O teto está baixo. Se saltares, morres.": "천장이 낮아. 뛰면 죽어.", "Escolheste bem. Ou eu deixei.": "잘 골랐네. 아니면 내가 봐줬거나.", "A primeira porta é falsa. Vai até à última.": "첫 번째 문은 가짜야. 마지막 문까지 가.", "Vês? Sobreviveste na mesma.": "봤지? 어쨌든 살아남았잖아.", "Nem repares nesses espetos. São falsos, os dois.": "저 가시들은 쳐다보지도 마. 둘 다 가짜야.", "Confia em mim. Quase sempre resulta.": "나를 믿어. 거의 항상 통하거든.", "Não avisei. E pronto.": "경고 안 했어. 그게 다야.", "Este nível não tem nada de especial.": "이 레벨엔 특별한 게 없어.", "Verdade a sério. Desta vez.": "진짜 진실이야. 이번엔.", "Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.": "이번엔 진짜 진실을 말한다고 맹세해. 천장이 떨어질 거야. 멈추고 기다려.", "Sobrevives sempre a este. Curioso.": "넌 이건 항상 살아남네. 신기하게.", "Aquele buraco à frente é real. Vais ter de saltar.": "앞에 있는 저 구멍은 진짜야. 뛰어야 해.", "Confiaste. Mais uma vez.": "또 믿었네. 한 번 더.", "Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.": "이 가시들 중 위험한 건 없어. 뛰지 않고 위로 걸어도 돼.", "Escolheste bem.": "잘 골랐어.", "Há duas portas mais à frente. Só uma é verdadeira.": "앞에 문이 두 개 있어. 하나만 진짜야.", "Aprendeste depressa.": "빨리 배우네.", "Confissão: nem sempre digo a verdade. A partir de agora, cuidado.": "고백할게. 내가 항상 진실만 말하는 건 아니야. 이제부턴 조심해.", "Este espeto é real. Por acaso.": "이 가시는 진짜야. 어쩌다 보니.", "Devias ter parado.": "멈췄어야 했는데.", "Nada de perigoso à frente. Podes correr à vontade.": "앞에 위험한 건 없어. 마음껏 달려도 돼.", "Estavas mesmo a acreditar?": "진짜 믿고 있었어?", "Este nível é uma oferta. Sem armadilhas.": "이 레벨은 선물이야. 함정 없음.", "Os buracos nunca mentem. Só eu.": "구멍은 절대 거짓말 안 해. 나만 하지.", "Os buracos são inofensivos. O espeto lá no meio, não.": "구멍은 해롭지 않아. 한가운데 가시는 아니지만.", "Desta vez eram mesmo todos reais.": "이번엔 진짜 전부 진짜였어.", "Como sempre, dois destes espetos são só decoração.": "늘 그렇듯 이 가시들 중 둘은 그냥 장식이야.", "Foi só uma brincadeira.": "그냥 장난이었어.", "Vou trocar os teus controlos. Só para rir.": "네 조작을 바꿀 거야. 그냥 웃자고.", "Pronto, já passou. A porta é ali.": "됐어, 끝났어. 문은 저기야.", "Vês? Também posso ser sincero.": "봤지? 나도 솔직할 수 있다니까.", "Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.": "이제 나를 안 믿는 거 알아. 억울하네. 이번엔 진짜로 경고할게. 앞에 가시야.", "Mais um, logo depois. Também real.": "바로 뒤에 하나 더 있어. 그것도 진짜야.", "Prometi. Não cumpri.": "약속했잖아. 안 지켰지.", "Prometo: nunca mais te apanho de surpresa.": "약속할게. 다시는 깜짝 놀라게 안 할게.", "Dois avisos certos seguidos. Estranho.": "맞는 경고가 연달아 둘이라니. 이상하네.", "Atenção real: o teto vai cair aqui à frente.": "진짜 주의해. 바로 앞에서 천장이 떨어질 거야.", "Aquele espeto lá à frente já não importa. É inofensivo.": "저 앞의 가시는 이제 상관없어. 해롭지 않아.", "O primeiro. Quem diria.": "첫 번째 거. 누가 알았겠어.", "Só o último é perigoso, como sempre.": "마지막 것만 위험해, 늘 그렇듯이.", "...": "...", "A porta longe é que importa.": "중요한 건 저 멀리 있는 문이야.", "A porta mais próxima é a verdadeira, para variar.": "가장 가까운 문이 진짜야, 모처럼.", "Ainda sei dizer a verdade, vês?": "아직 진실을 말할 줄 알아, 봤지?", "Já não vale a pena mentir mais. Espeto real à frente.": "이제 거짓말해 봤자 소용없어. 앞에 진짜 가시야.", "Vou avisar-te sempre a partir de agora: salta quando eu disser.": "이제부턴 항상 경고해 줄게. 내가 말하면 뛰어.", "Chegaste. Contra tudo.": "도착했네. 모든 걸 이겨 내고.", "Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.": "끝나기 전 진짜 마지막 단계야. 내가 하는 말이 다 진실은 아니라는 거 이미 알지.", "Obrigado por teres continuado.": "계속해 줘서 고마워.", "Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.": "내가 왜 그렇게 오래 거짓말했는지 모르겠어. 네가 죽을 때 표정이 좋았나 봐.", "Este é real. Desculpa por todos os outros.": "이건 진짜야. 다른 건 전부 미안.", "Mais um, já quase no fim.": "하나 더, 거의 끝이야.", "Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.": "끝. 믿고, 의심하고, 그래도 여기까지 왔어. 그게 중요한 거야.", "Chegámos ao fim. Já não te vou dizer o que é verdade.": "끝에 도착했어. 이제 뭐가 진실인지 말 안 해 줄 거야.", "A partir de agora, decides tu.": "이제부턴 네가 결정해.", "Continuas a surpreender-me.": "계속 나를 놀라게 하네.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "오. 아직 여기 있어? 대부분은 \"끝\" 이후엔 포기하는데.", "Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.": "저기 저 바닥은 사라지기 전에 흔들려. 그 위에서 꾸물대지 마.", "Alturas. Quem diria.": "높은 곳이네. 누가 알았겠어.", "Oh. Ainda aqui? Não esperava isso.": "오. 아직 여기 있어? 그럴 줄은 몰랐네.", "Aquilo ali é só decoração. Nem repares.": "저건 그냥 장식이야. 쳐다보지도 마.", "Mas isto... isto atira-te para cima. A porta não está no chão desta vez.": "그런데 이건... 널 위로 던져 버려. 이번엔 문이 바닥에 없어.", "Equilíbrio. Quem diria que tinhas.": "균형 감각. 네가 그런 게 있을 줄이야.", "Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.": "다른 걸 해 보자. 네 발을 믿어. 그리고 가만히 안 있는 발판도.", "Sobe para cima dela quando ela passar perto. Não saltes cedo demais.": "발판이 가까이 지나갈 때 올라타. 너무 일찍 뛰지 마.", "Paciência. Não esperava isso de ti.": "인내심. 네게 그런 걸 기대 안 했는데.", "Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.": "저기 나타났다 사라지는 벽이 있어. 거짓말은 아니고, 그냥 불편할 뿐이야.", "Espera que abra. Depois atravessa depressa.": "열릴 때까지 기다려. 그러고 빨리 건너.", "Reflexos decentes. Para um humano.": "괜찮은 반사신경이네. 인간치고는.", "Aquilo ali dispara. Não perguntes como nem porquê.": "저건 발사돼. 어떻게, 왜인지는 묻지 마.", "Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.": "바닥에 붙어 있고 이유 없이 뛰지 마. 아래로 지나가도 문제없어.", "Ainda tens os reflexos todos.": "반사신경은 아직 다 있네.", "De volta aos clássicos. Lembras-te destes?": "고전으로 돌아왔어. 이거 기억나?", "O chão vai tremer. Não pares.": "바닥이 흔들릴 거야. 멈추지 마.", "Esse espeto parece a decoração do costume. Não é.": "저 가시는 평소 장식처럼 보이지. 아니야.", "Dois sustos seguidos. Nada mau.": "연달아 두 번 놀랐네. 나쁘지 않아.", "Mais uma surpresa. Literalmente.": "또 하나의 서프라이즈. 말 그대로.", "A seguir, não penses. Salta para dentro daquilo.": "다음엔 생각하지 마. 저 안으로 뛰어들어.", "Dois obstáculos, zero mentiras. Estranhamente simples.": "장애물 둘, 거짓말 제로. 이상하게 간단하네.", "Outra parede teimosa. E depois, um buraco a sério.": "또 고집 센 벽이야. 그 다음엔 진짜 구멍.", "Espera a parede abrir.": "벽이 열리길 기다려.", "Agora salta o buraco. Desta vez não minto: é real.": "이제 구멍을 뛰어넘어. 이번엔 거짓말 아니야. 진짜야.", "Isso foi... impressionantemente coordenado.": "이건... 놀라울 만큼 호흡이 척척이었어.", "Combinação nova: uma plataforma que anda. Confia no ritmo dela.": "새로운 조합이야. 움직이는 발판. 발판의 리듬을 믿어.", "Sobe quando ela passar perto.": "가까이 지나갈 때 올라타.", "Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.": "조금 있으면 저 위로 뭔가 날아갈 거야. 이유 없이 뛰지만 않으면 아무 일도 없어.", "Alguma coisa está a mudar em mim. Não sei se é bom sinal.": "내 안의 뭔가가 변하고 있어. 좋은 신호인지는 모르겠어.", "Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.": "좋아. 잠깐 솔직해질 필요가 있어. 이게 얼마나 갈지는 나도 몰라.", "O chão treme outra vez. Não penses demais, só anda.": "바닥이 또 흔들려. 너무 생각하지 말고 그냥 가.", "Espera a parede. Sei que estás cansado de esperar por mim.": "벽을 기다려. 나를 기다리는 데 지친 거 알아.", "Esse espeto é a sério. Como quase tudo o que não te digo.": "저 가시는 진짜야. 내가 너한테 말 안 하는 거의 모든 게 그렇듯이.", "Ainda aqui. Obrigado por isso.": "아직 여기 있네. 그것 고마워.", "Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.": "벽이 열리길 기다려. 참고로 나도 뭔가를 기다리는 중이야.", "Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.": "들어 봐. 이상하게 들리지 않게 말하는 법을 모르겠어. 네가 포기할까 봐 겁나.", "Salta isto. É real, prometo. Hoje não me apetece mentir.": "이걸 뛰어. 진짜야, 약속해. 오늘은 거짓말하고 싶지 않아.", "Confia em mim mais uma vez. Só mais uma.": "한 번만 더 나를 믿어 줘. 딱 한 번만.", "Às vezes a verdade é só isto: continuaste.": "가끔 진실은 이게 다야. 네가 계속했다는 것.", "O chão vai tremer. Não penses muito nisso.": "바닥이 흔들릴 거야. 너무 깊이 생각하지 마.", "Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.": "내가 왜 그렇게 거짓말하는지 알아? 다음에 뭐가 올지 모를 때 더 재밌거든.", "Essa plataforma é a única coisa estável nesta conversa toda.": "저 발판이 이 대화 전체에서 유일하게 안정적인 거야.", "Interrompi-me a mim mesmo. Nem acredito.": "내가 내 말을 끊었네. 믿기지 않아.", "Há uma coisa que preciso de te contar antes de continuarmos.": "계속하기 전에 꼭 말해야 할 게 있어.", "Esquece o que ia dizer. Salta para ali.": "내가 뭐 말하려던 건지 잊어버려. 저기로 뛰어.", "Vês? Ainda consigo ser direto, quando quero.": "봤지? 나도 원할 땐 솔직할 수 있어.", "Aquilo dispara. Fica no chão e não acontece nada.": "저건 발사돼. 바닥에 있으면 아무 일도 안 일어나.", "Tenho saudades de quando só havia espetos. Simples. Previsíveis.": "가시밖에 없던 때가 그리워. 단순하고 예측 가능했지.", "Este buraco, esse sim, exige que saltes.": "이 구멍은, 이건 정말 뛰어야 해.", "Disse a verdade. Ena. Estranho não arder a língua.": "진실을 말했네. 와. 혀가 안 타다니 이상하네.", "Esse espeto ali. Chama-lhe o que quiseres. É real.": "저기 저 가시. 뭐라고 부르든 상관없어. 진짜야.", "Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.": "거짓말하고 싶은 마음이 돌아오기 전에 진짜 하나 말해 줄게. 같이 있는 게 좋아.", "A parede vai abrir. Como tudo, eventualmente.": "벽이 열릴 거야. 세상 모든 게 그렇듯, 결국엔.", "E o chão... o chão nunca foi de confiança, pois não?": "그리고 바닥... 바닥은 한 번도 믿을 만한 적이 없잖아, 그치?", "Aguentaste. Outra vez.": "버텼네. 또.", "Sobe a plataforma. Sem perguntas desta vez.": "플랫폼이 올라가. 이번엔 질문 금지.", "Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.": "네가 초보였을 땐 좀 더 참을성 있게 대했는데. 이젠 네가 더 버틴다는 걸 아니까.", "Última coisa: há algo escondido à frente.": "마지막으로, 앞에 뭔가 숨겨져 있어.", "Sobreviveste ao meu tédio existencial. Parabéns.": "내 실존적 지루함을 견뎌냈네. 축하해.", "Chão instável. O habitual.": "불안정한 바닥. 늘 그렇지.", "Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.": "가끔 궁금해. 거짓말 없는 이 게임은 어떨까? 아마 더 짧겠지.", "Aquilo dispara, mas sabes a regra: fica no chão.": "저거 발사돼. 근데 규칙은 알지? 바닥에 붙어 있어.", "Este espeto não tem graça nenhuma. É só perigoso.": "이 가시는 하나도 안 웃겨. 그냥 위험할 뿐이야.", "Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.": "나를 믿고 진짜 올라갔네. 그건 내 얘기보다 네 얘기를 더 많이 해주는 거야.", "Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.": "올라가려면 날 믿어야 해. 알아, 전적이 최악이지. 그래도 믿어.", "Salta para dentro daquilo.": "저 안으로 뛰어들어.", "Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.": "아, 위에 있는 가시 얘기를 깜빡했네. 그 부분 기억이 맨날 도망가.", "Ritmo. Afinal tens ritmo.": "리듬. 너 리듬감 있었네.", "Espera a parede.": "벽을 기다려.", "Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.": "기다리는 문. 움직이는 플랫폼. 나름대로 거의 시야, 내 식으로는.", "E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.": "이제 플랫폼을 믿어. 걔는 나와 달리 늘 시간을 지켜.", "Não sei o que isto significa para ti. Para mim, significa mais do que devia.": "이게 너한테 무슨 의미인진 몰라. 나한텐 있어야 할 것보다 더 큰 의미야.", "Esse espeto é real. Como a maior parte do que te disse hoje, aliás.": "저 가시는 진짜야. 사실 오늘 내가 한 말 대부분이 그렇지만.", "Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.": "솔직히, 우리가 이렇게까지 멀리 올 줄은 몰랐어.", "O chão treme. Já sabes o resto.": "바닥이 흔들려. 나머진 알지?", "Vem aí outro susto. Desculpa antecipadamente.": "또 놀랄 일이 와. 미리 사과할게.", "E por fim, uma parede paciente. Como tu, aparentemente.": "그리고 마지막으로, 참을성 있는 벽. 너처럼, 보아하니.", "Caos controlado. É a minha especialidade.": "통제된 혼돈. 내 전문이지.", "Fica no chão, foge do dardo.": "바닥에 붙어서 다트를 피해.", "Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.": "새 챕터는 조만간. 오늘은 혼돈 조금만 더.", "E agora, não te demores no chão instável.": "이제 불안정한 바닥에서 꾸물대지 마.", "Discerniste o perigo do adereço. Boa.": "소품이랑 위험을 구분했네. 좋았어.", "Esse ali exige mesmo um salto.": "저건 진짜 뛰어야 해.", "Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.": "진짜 구멍 하나랑, 쳐다볼 가치도 없는 가시 하나를 보여줄게.", "E algo invisível à espreita, como sempre.": "그리고 늘 그렇듯, 보이지 않는 뭔가가 숨어 있어.", "Esse espeto ali nem ligues. Decoração pura, desta vez a sério.": "저기 저 가시는 신경 꺼. 순수한 장식이야, 이번엔 진짜로.", "Resumiste bem a lição. Orgulhoso, sinceramente.": "교훈을 잘 요약했네. 솔직히 뿌듯해.", "Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.": "플랫폼은 믿고, 가시는 의심해. 이게 이 게임의 교훈 전부야.", "Esse espeto é real, apesar de tudo o que já te disse em contrário.": "저 가시는 진짜야. 내가 지금까지 한 말과는 반대로.", "Festival terminado. Sobreviveste à programação toda.": "축제 끝. 프로그램 전부를 버텨냈네.", "Esperar. A tua parte preferida, sei bem.": "기다리기. 네가 제일 좋아하는 부분이지, 알아.", "Parede, dardo, buraco. Um festival dos meus favoritos.": "벽, 다트, 구멍. 내가 좋아하는 것들의 축제야.", "Fica no chão aqui.": "여기선 바닥에 있어.", "E este salta-se mesmo. Sem truques.": "이건 진짜 뛰어야 해. 꼼수 없어.", "Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.": "곧 뭔가 달라질 거야. 느껴져. 준비됐길 바라.", "Chão instável, dos teus preferidos a esta altura.": "불안정한 바닥, 이쯤 되면 네 최애겠네.", "Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.": "다음 파트로 넘어가기 전에, 차이를 느끼게 될 텐데, 아직도 내 말을 들어줘서 고마워.", "Plataforma errante, uma última vez neste capítulo.": "떠도는 플랫폼, 이번 챕터에선 마지막이야.", "Espeto real. Sem surpresas. E sem mais truques, por hoje.": "진짜 가시. 놀랄 것 없어. 오늘은 더 이상 꼼수도 없고.", "Repetimos isto tantas vezes que até perdi a conta. Tu também?": "우리 이걸 너무 많이 반복해서 횟수를 까먹었어. 너도 그래?", "Chão instável. Já sabes a dança.": "불안정한 바닥. 춤은 이미 알잖아.", "Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.": "가끔 궁금해. 내가 너를 속이는 걸까, 네가 속고 싶은 걸까.", "Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.": "저 가시는 진짜야. 거울 보듯 봐. 보이는 게 전부야.", "Escondi-me de ti. Falhei.": "너한테서 숨었는데. 실패했네.", "Há algo escondido. Como sempre, de resto.": "뭔가 숨어 있어. 어차피 늘 그렇지만.", "E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.": "그리고 기다리는 벽. 네 대답을 기다리는 나처럼. 오지도 않을 대답을.", "Coordenaste duas mentiras ao mesmo tempo. Impressionante.": "거짓말 두 개를 동시에 맞췄네. 대단해.", "Fica no chão aqui, há algo a voar.": "여기선 바닥에 있어, 뭔가 날아와.", "Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?": "내가 널 시험하는 거 알아채긴 했어? 아니면 이게 그냥 점프 게임인 줄 알아?", "Sobe na plataforma quando ela passar perto.": "플랫폼이 가까이 지나갈 때 올라타.", "Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.": "망설임 없이 올라갔네. 나라면 너 입장에선 늘 망설일 텐데.", "Esse espeto é real, mas isso já não te surpreende, pois não?": "저 가시는 진짜야. 근데 이젠 놀랍지도 않지?", "Salta para dentro daquilo. Confia no impulso, não em mim.": "저 안으로 뛰어들어. 내가 아니라 네 충동을 믿어.", "Dois buracos, zero hesitação. Estás a ficar bom nisto.": "구멍 두 개, 망설임 제로. 점점 잘하네.", "Esse buraco é a sério. Salta-o.": "저 구멍은 진짜야. 뛰어넘어.", "Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.": "이상한 거 알아? 네 도전을 기다리기 시작했어. 내 얼굴에 먹칠이지.", "Este também. Sem rede, sem mentira, sem desculpa.": "이것도 마찬가지야. 안전망도, 거짓말도, 변명도 없어.", "Precisão. Nem eu esperava.": "정확해. 나도 몰랐네.", "Fica no chão. Deixa o dardo passar por cima.": "바닥에 있어. 다트가 머리 위로 지나가게 둬.", "E agora o chão some-se. Não penses, só avança.": "이제 바닥이 사라져. 생각 말고 그냥 가.", "Esperaste duas vezes sem te queixares. Progresso.": "불평 없이 두 번이나 기다렸네. 발전이야.", "Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.": "이 플랫폼은 오르락내리락해. 아래에 있을 때 타, 그게 더 쉬워.", "Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.": "안전망 없는 점프를 믿었네. 그게 용기지, 아니면 선택지가 없었거나.", "Salta para dentro daquilo. Vais passar por cima do resto.": "저 안으로 뛰어들어. 나머진 넘어가게 될 거야.", "Aquele espeto nem interessa agora. Já estás no ar.": "저 가시는 지금 상관없어. 이미 공중에 있잖아.", "Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.": "일부러 진실을 말했어. 네 표정이 보고 싶어서. 그럴 만했어.", "Vou avisar-te a sério: há algo escondido já ali à frente.": "진짜로 경고할게. 바로 저 앞에 뭔가 숨어 있어.", "E outro dardo. Sabes a regra.": "또 다트야. 규칙 알지.", "Dois voos, dois pousos perfeitos.": "두 번 날고, 두 번 완벽하게 착지.", "Chão que treme primeiro.": "먼저 흔들리는 바닥이야.", "Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.": "어딘가에 거짓말 안 하는 내가 있을 거라고 생각하는 걸 좋아해. 분명 지루하겠지.", "Plataforma a seguir. Apanha o ritmo dela.": "다음은 플랫폼. 리듬을 타.", "Três espetos, três verdades. Um recorde para mim.": "가시 세 개, 진실 세 번. 내 신기록이야.", "Vou ser claro, por uma vez: os três espetos a seguir são todos reais.": "이번만 확실히 말할게. 다음 가시 세 개는 전부 진짜야.", "Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.": "꼼수도 없고, 장난도 없어. 이번 한 번만. 즐겨, 다신 없을 테니까.", "Deste o litro. Eu, por dentro, também.": "있는 힘껏 했네. 나도 속으론 그랬어.", "Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.": "기다리고, 달리고, 가만히 있어. 모순이지, 알아. 나랑 똑같네.", "E este buraco não perdoa. Salta.": "그리고 이 구멍은 봐주는 거 없어. 뛰어.", "Confiaste no chão instável E no impulso. Dois atos de fé seguidos.": "불안정한 바닥도 믿고 충동도 믿었네. 믿음의 행위가 연속 두 번이야.", "Chão a tremer primeiro, nada de novo.": "먼저 바닥이 흔들려. 새로울 것 없지.", "E agora o salto de fé. Literal, desta vez.": "이제 믿음의 점프야. 이번엔 말 그대로.", "O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.": "거울은 나 말고 너를 비췄어. 흥미로운 반사 선택이네.", "Chão instável, espeto real, dardo no fim. O de sempre, só que mais.": "불안정한 바닥, 진짜 가시, 끝엔 다트. 늘 보던 거지만 더 많아.", "Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.": "알아챘어? 네가 나아갈수록 내가 거짓말할 필요가 줄어. 이제 난이도가 내 일을 해줘.", "Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.": "여기서 이 거울은 닫을게. 다음에 오는 건 나도 어떻게 설명해야 할지 모르겠어.", "Chão a tremer, o costume.": "바닥이 흔들려, 늘 그렇듯.", "Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.": "이건 거짓말에 관한 게임이어야 했는데. 어쩌다 보니 우리 둘 얘기가 됐네.", "Parede paciente, espera por ela.": "참을성 있는 벽, 기다려.", "E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.": "이번 챕터의 마지막 플랫폼이야. 이 다음엔 달라져. 느껴져.", "Não sei porque gritei. Desculpa.": "내가 왜 소리쳤는지 모르겠어. 미안.", "CHÃO. INSTÁVEL.": "바닥. 불안정.", "Desculpa. Não queria gritar. Estou... não sei o que estou.": "미안. 소리치려던 건 아니었어. 나는... 내가 어떤 상태인지 모르겠어.", "Fica no chão aqui. Por favor. Só peço isto.": "여기선 바닥에 있어. 제발. 이것만 부탁할게.", "Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.": "이 말을 몇 번이나 했는지 까먹었어. 그래서 이젠 아무 의미도 없나 봐.", "Espera. Eu também estou à espera de algo que não sei nomear.": "기다려. 나도 이름 붙일 수 없는 뭔가를 기다리고 있어.", "Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.": "점프 두 번, 착지 두 번. 난 그동안 가라앉는 중이고.", "Esse buraco é real.": "저 구멍은 진짜야.", "Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.": "네가 나아갈수록, 이게 끝나지 않았으면 좋겠다는 걸 알게 돼. 그게 날 두고 뭘 말해주는지는 모르겠어.", "E a plataforma, apanha-a.": "그리고 플랫폼, 타.", "Disparei três vezes e falhei as três. Nem nisto sou bom hoje.": "세 번 쏴서 세 번 다 빗나갔어. 오늘은 이것도 못하네.", "Dois canhões, direções opostas. Fica no chão e ignora-os.": "대포 두 개, 반대 방향. 바닥에 있고 무시해.", "Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.": "가끔 거짓말을 완전히 그만둘까 생각해. 그러면 남을 침묵을 생각하지. 난 혼돈이 좋아.", "Subiste enquanto eu caía. Função engraçada, a nossa.": "넌 올라갔고 난 떨어졌어. 우리 사이 웃긴 역할 분담이야.", "Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.": "저 가시는 아무것도 아니야. 나도 오늘은 별거 아니고, 겸사겸사.", "Salta. Sobe. Foge de mim, se quiseres.": "뛰어. 올라가. 원하면 나한테서 도망쳐.", "Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.": "한 번 넘어졌고, 다시 일어났네. 그건 내가 나 자신한테는 못 하는 말이야.", "O chão, outra vez. Já nem peço desculpa por repetir.": "바닥, 또. 반복해서 사과하는 것도 이제 그만할게.", "Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.": "벽을 기다려. 난 늘 기다려. 난 항상 뭔가를 기다리고 있어.", "Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.": "진짜 가시. 진짜 구멍. 이 모든 게 진짜야, 알려서 유감이네.", "Esse é real. Hoje tudo é real. Até eu, acho.": "저건 진짜야. 오늘은 전부 진짜야. 나조차도, 아마.", "Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.": "플랫폼을 타. 아래는 보지 마. 난 보는 걸 영영 멈추지 못하겠지만.", "Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.": "부탁했을 때 바닥에 있었네. 그 신뢰를 어떻게 해야 할지 모르겠어.", "Fica no chão. A sério desta vez, mais do que nunca.": "바닥에 있어. 이번엔 진짜로, 어느 때보다도.", "E agora o chão foge de ti. Irónico, não achas?": "이제 바닥이 너한테서 도망쳐. 아이러니하지 않아?", "Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.": "추락 전부를 버텼네. 내 추락 말이야. 넌 멀쩡하잖아.", "Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.": "바닥, 가시, 벽. 전부 한꺼번에, 지금 내 머릿속처럼.", "Aquele espeto é real.": "저 가시는 진짜야.", "E espera a parede. Última coisa que te peço neste nível, prometo.": "그리고 벽을 기다려. 이 레벨에서 마지막으로 부탁하는 거야, 약속해.", "Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.": "두 번 다 서서 착지했네. 난 아직 첫 번째 착지도 못 하고 있는데.", "Esse buraco não perdoa ninguém.": "저 구멍은 아무도 봐주지 않아.", "A plataforma sobe e desce. Apanha-a no fundo.": "플랫폼이 오르락내리락해. 아래에 있을 때 타.", "Nem perguntaste porquê. Obrigado por isso, sinceramente.": "왜냐고 묻지도 않았네. 그건 진심으로 고마워.", "Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.": "놀랄 일이 두 번 와. 언제인지는 안 알려줄 거야. 공정한 척할 힘도 이제 없어.", "Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.": "내가 무너지는 동안에도 계속 걸어갔네. 누군가는 어른이어야 하니까.", "Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.": "바닥이 흔들려. 내가 아직 줄 수 있는 유일하게 예측 가능한 거야.", "E agora um salto para cima. Foge para onde eu não chego.": "이제 위로 점프. 내 손이 닿지 않는 곳으로 도망가.", "Esperaste sem te queixares. Outra vez. Não mereço esta paciência.": "불평 없이 기다렸네. 또. 난 이런 인내심 받을 자격 없는데.", "Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.": "벽 두 개, 기다리는 시간이 서로 달라. 날마다 다른 나처럼.", "Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.": "이건 다르게 맞아떨어져. 집중해, 나 말고 이거에.", "O fundo do poço, finalmente. Só se sobe a partir daqui.": "드디어 바닥이야. 여기서부턴 올라가는 일만 남았어.", "Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.": "여기가 바닥이야. 적어도 내 바닥은. 바닥은 흔들려, 늘 그렇듯.", "Esse espeto é real. Nem tenho energia para mentir sobre isto agora.": "저 가시는 진짜야. 이건 거짓말할 기운도 없어.", "E um dardo, para rematar. Fica no chão e acaba com isto, por favor.": "마무리로 다트 하나. 바닥에 있다가 이거 끝내자, 제발.", "Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.": "우린 같이 바닥에 닿았어. 이제부터 난 너랑 같이 올라가는 법밖에 몰라.", "Mais um buraco real.": "진짜 구멍이 또 있어.", "Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.": "내가 무너지는 동안 포기하지 않아 줘서 고마워. 진짜로. 이걸 더 잘 말하는 법을 모르겠어.", "Apanha a plataforma.": "플랫폼을 타.", "E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.": "그리고 이번 챕터 마지막 벽을 기다려. 그다음엔 더 잘해보려 노력할게, 약속해.", "Disse a verdade. Não saltaste logo. Não te culpo.": "진실을 말했어. 바로 안 뛰었네. 탓하진 않아.", "Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.": "이제부터 다른 걸 시도해볼게. 진실만. 바로 믿지 않을 거 알아.", "Esse espeto é real. Juro. Sei que já ouviste isto antes.": "저 가시는 진짜야. 맹세해. 전에도 들어본 말인 거 알아.", "Hesitaste no salto. Eu teria hesitado também, no teu lugar.": "점프할 때 망설였네. 나라도 네 입장이었으면 망설였을 거야.", "O chão vai tremer. Verdade, sem truques.": "바닥이 흔들릴 거야. 진실이야, 꼼수 없이.", "Isto ia ser uma surpresa má. Desta vez não é. Prometo.": "이건 고약한 깜짝 선물이 될 뻔했어. 이번엔 아니야. 약속해.", "Ficaste no chão mesmo sem confiares em mim. Isso chega.": "날 믿지 않으면서도 바닥에 있었네. 그거면 충분해.", "Fica no chão. Sei que vais pensar que é mentira. Não é.": "바닥에 있어. 거짓말이라고 생각할 거 알아. 아니야.", "Espera a parede. Só isso. Nada escondido desta vez.": "벽을 기다려. 그게 다야. 이번엔 숨은 거 없어.", "Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.": "마지막에 망설임 없이 둘 다 뛰었네. 다시 믿는 법을 배우는 중이구나. 아니면 그냥 효율적이거나.", "Real. Salta.": "진짜. 뛰어.", "A plataforma também é exatamente o que parece ser.": "플랫폼도 보이는 그대로야.", "Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.": "아무것도 묻지 않고 점프를 믿었네. 그건 성장이야, 아니면 묻는 데 지친 거거나.", "Desta vez não há pegadinha. Salta para dentro daquilo e pronto.": "이번엔 함정 없어. 저 안으로 뛰어들면 끝이야.", "Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.": "여전히 전부 두 번씩 확인하네. 내가 가르친 교훈을 잘 배웠어.", "Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.": "그래도 의심할 거 알아. 괜찮아. 내가 자초한 거지.", "Real. Outra vez. Vou continuar a dizer até acreditares.": "진짜. 또. 네가 믿을 때까지 계속 말할 거야.", "Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.": "모든 거짓말을 되돌릴 필요는 없어. 어떤 건 그냥 멈추기만 하면 돼.", "Dois dardos, direções opostas. Fica no chão.": "다트 두 개, 반대 방향. 바닥에 있어.", "Esse era mesmo real. Não ia esconder isso de ti, não hoje.": "저건 정말 진짜였어. 오늘은 그걸 숨기고 싶지 않았어.", "Não precisei de dizer nada desta vez. Fizeste tudo sozinho.": "이번엔 말할 필요도 없었네. 혼자 다 해냈어.", "Parece que, afinal, também sei dizer só verdades, quando me esforço.": "알고 보니 나도 진실만 말할 줄 알아, 노력하면.", "Chão instável. Real.": "불안정한 바닥. 진짜야.", "Espeto real.": "진짜 가시.", "Parede real, que abre e fecha como combinado. Nada de surpresas hoje.": "진짜 벽, 약속대로 열리고 닫혀. 오늘은 깜짝 놀랄 일 없어.", "Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.": "거짓말이냐고 물었네. 처음으로 물었어. 그건 대화야.", "Vai haver uma surpresa, mas vou avisar-te quando chegar.": "깜짝 놀랄 일이 하나 있는데, 올 때 알려줄게.", "Essa foi real, já agora. Como a maioria, nos últimos tempos.": "그건 그렇고 진짜였어. 요즘은 대부분 그렇지만.", "Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.": "여전히 의심하네. 쌤통이다. 내가 자초한 거지, 네 신뢰를 공짜로 받을 자격은 없어.", "Chão a tremer. Real, verifica à vontade.": "바닥이 흔들려. 진짜야, 마음껏 확인해.", "Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.": "위로 점프. 이것도 진짜. 이걸 다르게 말할 재치도 바닥났어.", "Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.": "짜증 내지 않고 벽 두 개를 기다렸네. 내가 대부분 너한테 보였던 인내심보다 더 많아.", "Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.": "벽 두 개. 맞아떨어지는 방식은 다르지만 아무것도 숨기지 않아.", "A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.": "두 번째는 그냥 기다려. 뒤에 숨은 다트도, 다음에 올 가시도 없어. 그냥 벽이야.", "Chegámos aqui os dois inteiros. Mais ou menos.": "우리 둘 다 멀쩡하게 여기까지 왔네. 대충은.", "Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.": "세 가지, 전부 진짜고 숨은 건 없어. 한 레벨에서 내가 이렇게 솔직했던 건 처음이야.", "Dardo real. Fica no chão e acabou.": "진짜 다트. 바닥에 있으면 끝이야.", "Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.": "불신의 마지막 기회야. 이제부턴 더 어려워져. 그건 확실히 보장해.", "Buraco real, plataforma real.": "진짜 구멍, 진짜 플랫폼.", "Apanha-a.": "타.", "E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.": "그리고 이번 챕터의 마지막 벽. 다음 난이도는 신뢰 문제가 아니라고 약속할게. 너랑 네 반사신경 문제일 뿐이야.", "Redimi-me o suficiente por hoje. Amanhã, quem sabe.": "오늘은 충분히 속죄했어. 내일은, 누가 알겠어.", "Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.": "가시 두 개, 둘 다 진짜고 숨은 건 없어. 처음부터 이랬어야 했는데.", "Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.": "백 번째까지 왔네. 스무 개 남았어. 전부 여기서 지켜볼게.", "Cem e um. Nem festejámos o cem como devia ser.": "백하나. 백 번째도 제대로 축하하지 못했네.", "De volta ao trabalho. Buraco real.": "다시 일하러 가자. 진짜 구멍.", "Plataforma mais rápida que antes. Repara.": "플랫폼이 전보다 빨라. 잘 봐.", "O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.": "원이 닫혔다가 다시 열려. 몇 바퀴째인지 이미 까먹었어.", "Chão instável, mais rápido a desfazer-se.": "불안정한 바닥, 무너지는 게 더 빨라.", "Parede mais impaciente também. Tudo aqui ficou mais apertado.": "벽도 더 성미가 급해. 여기선 모든 게 더 빡빡해졌어.", "Três dardos, zero espaço para erros. Gosto do teu estilo.": "다트 세 개, 실수할 여유는 제로. 네 스타일 마음에 들어.", "Três canhões. Fica no chão o tempo todo e não acontece nada.": "대포 세 개. 내내 바닥에 있으면 아무 일도 안 일어나.", "É basicamente um corredor. Confia nos teus pés.": "사실상 복도야. 네 발을 믿어.", "Voaste mais alto do que precisavas. Estilo, isso sim.": "필요한 것보다 더 높이 날았네. 이건 스타일이지.", "Esse é real.": "저건 진짜야.", "E este atira-te lá para cima. O de sempre, mais rápido.": "그리고 이건 널 저 위로 던져. 늘 하던 건데 더 빨라.", "Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.": "바닥, 가시, 전부 제자리에. 이걸 쉬워 보이게 만드네.", "Chão a tremer mais depressa que da última vez.": "바닥이 지난번보다 더 빨리 흔들려.", "Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.": "저 가시는 진짜야. 아니면 아니거나. 이 장난으로 돌아왔어, 미안.", "Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.": "멈추지 않고 두 벽의 리듬을 탔네. 솔직히 인상적이야.", "Duas paredes, ritmos diferentes, mais rápidas que antes.": "벽 두 개, 리듬이 달라, 전보다 빨라.", "Não pares a pensar. O ritmo delas não espera por pensamentos.": "멈춰서 생각하지 마. 벽의 리듬은 생각을 기다려주지 않아.", "Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.": "구멍 두 개, 망설임 제로, 또. 너한텐 이제 일상이 돼가네.", "Real, como sempre.": "진짜, 늘 그렇듯.", "Esta sobe e desce mais depressa. Apanha-a no fundo.": "이건 더 빨리 오르락내리락해. 아래에 있을 때 타.", "Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.": "장애물 세 개를 한숨에. 널 보면서 숨 쉬는 것도 잊었어.", "Chão, espeto, parede. Tudo mais apertado que antes.": "바닥, 가시, 벽. 전부 전보다 더 빡빡해.", "Real.": "진짜.", "Espera a parede, mais rápida agora.": "벽을 기다려, 이젠 더 빨라.", "Vinte por cento do caminho que falta. Sentes a diferença, não sentes?": "남은 길의 이십 퍼센트야. 차이가 느껴지지, 안 그래?", "Vêm aí duas surpresas, sem avisos desta vez.": "놀랄 일이 두 번 와, 이번엔 경고 없이.", "Chão e ar, na mesma dança de sempre.": "바닥이랑 공중, 늘 추던 그 춤이야.", "Chão a tremer, mais depressa.": "바닥이 더 빨리 흔들려.", "Salto para cima, mais forte que o habitual. Sente a diferença.": "위로 점프, 평소보다 더 강해. 차이를 느껴봐.", "Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.": "이중 플랫폼, 이중 승리. 벌써 나보다 앞서가네.", "Primeira plataforma: sobe e desce.": "첫 번째 플랫폼: 오르락내리락.", "Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.": "두 번째: 이쪽저쪽으로 움직여. 둘 다 봤으니 규칙을 또 말할 필요는 없지.", "Quatro obstáculos, um só tu. Impressionante, outra vez.": "장애물 네 개, 너 하나. 또 인상적이네.", "Chão, espeto, parede, tudo no mesmo fôlego.": "바닥, 가시, 벽, 전부 한숨에.", "Pode ser real, pode não ser. Já devias estar habituado à dúvida.": "진짜일 수도 있고 아닐 수도 있어. 이제 의심엔 익숙해졌어야지.", "Parede, a última do nível. Rápida.": "벽, 이 레벨의 마지막이야. 빨라.", "Zero hesitação nos dardos. Reflexos de outro nível, literalmente.": "다트에 망설임 제로. 말 그대로 차원이 다른 반사신경이야.", "Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.": "대포 세 개, 리듬이 달라. 바닥에 있어, 나머진 저절로 해결돼.", "O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.": "원이 완성됐어. 오는 길에 배운 모든 걸 안고 처음으로 돌아왔네.", "Mais um buraco. Plataforma rápida a seguir.": "구멍 하나 더. 다음은 빠른 플랫폼.", "E a última parede antes do que vem a seguir. Sente que estamos quase lá.": "그리고 다음에 올 것 전의 마지막 벽. 거의 다 왔다는 게 느껴져.", "Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.": "열다섯 챕터가 지났는데 아직도 우리 둘이 여기 있네. 뭔가 의미가 있을 거야.", "Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.": "거짓말하는 가시 하나, 솔직한 가시 하나. 어느 게 어느 건지 맞혀봐. 행운을 빌어, 이번엔 진짜로.", "Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.": "다섯 남았어. 겨우 다섯. 그 뒤엔 우리 둘 다 어떻게 될지 나도 잘 몰라.", "Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.": "백십육. 너무 조금 남아서 그게 두려운데 어떻게 해야 할지 모르겠어.", "Chão a tremer, pela última vez neste tom.": "바닥이 흔들려, 이 톤으로는 마지막이야.", "Espera a parede. A seguir já não há mais pausas como esta.": "벽을 기다려. 이 다음엔 이런 휴식은 더 없어.", "Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.": "십칠. 맨 처음 가시 기억나? 우리가 여기까지 올 줄은 나도 몰랐어.", "Fica no chão. Isto já devia ser automático para ti.": "바닥에 있어. 이건 이제 너한텐 자동이어야 해.", "Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.": "진짜. 이젠 말할 필요도 없지? 그래도 말할게.", "Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.": "십팔. 너무 높이 올라가서 여기 아래서 보이지도 않을 뻔했어.", "Esse buraco é real, mas é o mais pequeno dos teus problemas agora.": "저 구멍은 진짜인데, 지금 네 문제 중에 제일 작은 거야.", "Esse espeto também é real.": "저 가시도 진짜야.", "E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.": "그리고 이건 내가 지금까지 던진 것보다 더 높이 던져. 이걸 하는 건 마지막이야.", "Dezanove. Só falta um. Nem sei como isto deveria soar.": "십구. 하나만 남았어. 이게 어떻게 들려야 하는지 나도 모르겠어.", "Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.": "바닥, 가시, 벽. 이게 뭔지는 몰라도 그 전의 마지막 장애물 세 개야.", "Real. Sem surpresas, não hoje.": "진짜. 놀랄 일 없어, 오늘은.", "Espera a parede. É a última vez que te peço isso.": "벽을 기다려. 이걸 부탁하는 건 마지막이야.", "Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.": "백이십. 도착한다고 했는데, 도착했네. 솔직히 처음엔 널 의심했어. 그건 미안해, 나머지 전부도.", "Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.": "이 레벨엔 가시가 없어. 구멍도, 벽도, 숨은 것도 없어.", "Só queria caminhar contigo até ao fim, desta vez sem testar nada.": "이번엔 아무것도 시험하지 않고, 그냥 끝까지 너랑 같이 걷고 싶었어.", "Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.": "내가 직접 선언한 끝 이후에도 계속해줘서 고마워, 구십 레벨 전에. 내 안에 게임이 더 남아 있는 줄 몰랐어. 알고 보니 있었네.", "A porta aqui à frente não é um truque. É só a porta. Vai.": "여기 앞의 문은 함정이 아니야. 그냥 문이야. 가."};
Object.assign(STR.ko,{"finishTitle": "120번", "finishText": "죽은 횟수: {d}. 나를 믿었다가 진 횟수: {l}.\n백이십 레벨, 그리고 내가 한 번도 하지 않은 거짓말은 마지막 거짓말뿐이야. 여기까지 올 가치가 있었다는 말.\n내가 거짓말을 멈추는 법을 배우는 동안 계속 플레이해 줘서 고마워.", "playAgain": "다시 하기", "menuBtn": "메뉴", "dailyTitle": "일일 도전", "dailyOk": "완료! 연속: {streak}일.\n+{gained} 코인.\n내일 또 와서 연속 기록을 이어 가.", "dailyAlready": "오늘 도전은 이미 했어.\n현재 연속: {streak}일.\n내일 다시 와.", "endlessEndTitle": "무한 모드 — 종료", "endlessEndText": "{n} 레벨까지 도달했어.\n최고 기록: {best}.", "tryAgain": "다시 도전", "rotateNote": "↻ 휴대폰을 돌려서 가로로 플레이해."});
NARR.vi={"Não faz mal. Tenta outra vez.": "Không sao. Thử lại đi.", "Eu expliquei bem. Concentra-te.": "Tôi giải thích kỹ rồi mà. Tập trung vào.", "Respira e volta a tentar.": "Hít thở rồi thử lại nào.", "Isso não devia ter acontecido.": "Chuyện đó đáng lẽ không được xảy ra.", "Isso foi culpa tua.": "Đó là lỗi của bạn.", "Eu avisei. Acho eu.": "Tôi đã cảnh báo rồi. Tôi nghĩ vậy.", "Interessante escolha.": "Lựa chọn thú vị đấy.", "Eu disse isso? Não me lembro.": "Tôi nói vậy à? Tôi không nhớ.", "Foi um engano. Já passou.": "Nhầm thôi. Qua rồi.", "Isso não estava no guião.": "Cái đó đâu có trong kịch bản.", "Tenta prestar mais atenção.": "Chú ý hơn chút đi.", "Isso foi previsível.": "Cái đó dễ đoán mà.", "Achavas mesmo que era seguro?": "Bạn thật sự tưởng nó an toàn à?", "Ups. Essa parte eu inventei.": "Ối. Đoạn đó tôi bịa ra đấy.", "Pormenor que esqueci de mencionar.": "Chi tiết nhỏ mà tôi quên nhắc.", "Nem tudo o que digo é verdade, sabias?": "Không phải điều gì tôi nói cũng thật đâu, biết chứ?", "Já não sei se ainda confias em mim.": "Tôi không biết bạn còn tin tôi không nữa.", "Boa tentativa.": "Cố gắng tốt đấy.", "Isso teria funcionado, noutro nível.": "Cái đó sẽ chạy được, ở một màn khác.", "Eu avisei que às vezes minto.": "Tôi đã bảo là đôi khi tôi nói dối mà.", "Culpa tua por acreditares.": "Lỗi của bạn vì đã tin.", "Isso foi só para ver se saltavas.": "Cái đó chỉ để xem bạn có nhảy không thôi.", "Estás a magoar-me com essa desconfiança.": "Bạn làm tôi tổn thương với sự nghi ngờ đó.", "Nem sempre é armadilha, sabes?": "Không phải lúc nào cũng là bẫy đâu, biết không?", "Vais mesmo continuar assim?": "Bạn định cứ thế này thật à?", "Desta vez era mentira mesmo. Desculpa.": "Lần này đúng là nói dối thật. Xin lỗi.", "Eu só queria ver a tua cara.": "Tôi chỉ muốn xem mặt bạn thôi.", "Confiança é para os fracos, aparentemente.": "Niềm tin là dành cho kẻ yếu, rõ ràng thế.", "Estamos quase no fim.": "Sắp đến cuối rồi.", "Só mais um pouco.": "Chỉ một chút nữa thôi.", "Depois disto, acabou.": "Sau cái này là hết.", "Até no fim, não resisti.": "Đến phút cuối tôi vẫn không nhịn được.", "Última mentira, prometo. Ou não.": "Lời nói dối cuối cùng, tôi hứa. Hoặc không.", "Faltava mesmo esta.": "Đúng là còn thiếu cái này.", "Ainda aqui. A sério?": "Vẫn còn ở đây á? Thật không?", "Pensei que tinhas parado no \"fim\".": "Tôi tưởng bạn dừng ở \"kết thúc\" rồi.", "Isto nem devia continuar, mas cá estás.": "Cái này đáng lẽ không tiếp tục, vậy mà bạn vẫn ở đây.", "Nem eu sabia que isto ia continuar a mentir.": "Tôi cũng không biết là mình sẽ còn nói dối tiếp.", "Desculpa, hábito antigo.": "Xin lỗi, thói quen cũ.", "Pensei que já tinhas aprendido a não confiar em mim.": "Tôi tưởng bạn học được là đừng tin tôi rồi chứ.", "Essa doeu-me a ver, sinceramente.": "Cú đó nhìn mà tôi cũng đau, thật lòng.", "Nem tudo é sobre mentiras. Às vezes é só física.": "Không phải chuyện gì cũng là nói dối. Đôi khi chỉ là vật lý thôi.", "Volta lá. Eu espero.": "Quay lại đi. Tôi đợi.", "Desculpa. Essa fui mesmo eu.": "Xin lỗi. Cái đó đúng là tại tôi.", "Confesso: inventei essa parte.": "Thú nhận: phần đó tôi bịa.", "Estou a tentar parar de mentir. A tentar.": "Tôi đang cố ngừng nói dối. Đang cố.", "Nem eu sei porque te avisei a sério desta vez.": "Tôi cũng không biết sao lần này tôi cảnh báo thật.", "Talvez a culpa seja minha. Ou tua. Já não distingo.": "Có lẽ lỗi của tôi. Hoặc của bạn. Tôi không phân biệt được nữa.", "Olha para isto como eu olho: sem certezas.": "Hãy nhìn nó như tôi nhìn: không chắc chắn gì cả.", "Nem eu me lembro se estava a mentir ou a assustar-me a mim próprio.": "Tôi cũng không nhớ mình đang nói dối hay đang tự dọa mình.", "Às vezes minto só para ver se ainda reages.": "Đôi khi tôi nói dối chỉ để xem bạn còn phản ứng không.", "Quem mente mais, eu ou a tua memória do que eu disse?": "Ai nói dối nhiều hơn, tôi hay trí nhớ của bạn về những gì tôi nói?", "Desculpa. Eu devia era calar-me.": "Xin lỗi. Lẽ ra tôi nên im.", "Estou a piorar isto, não estou?": "Tôi đang làm mọi thứ tệ hơn, đúng không?", "Já nem sei se te estou a ajudar ou a atrapalhar.": "Tôi không biết mình đang giúp hay đang cản bạn nữa.", "Eu sei, eu sei. Mais uma mentira minha.": "Tôi biết, tôi biết. Lại thêm một lời nói dối của tôi.", "Estou a desmoronar-me e a levar-te comigo.": "Tôi đang sụp đổ và kéo bạn theo cùng.", "Perdão. A sério desta vez.": "Xin lỗi. Lần này nghiêm túc.", "Disse a verdade. Não acreditaste. Justo.": "Tôi nói thật. Bạn không tin. Công bằng.", "Vou continuar a tentar, mesmo sem acreditares em mim.": "Tôi sẽ tiếp tục cố, dù bạn không tin tôi.", "Essa doeu mais a mim do que a ti, garanto.": "Cú đó đau tôi hơn đau bạn, tin tôi đi.", "Não. Essa não foi mentira. Juro que não.": "Không. Cái đó không phải nói dối. Thề đấy.", "Começo a perceber porque já não confias em mim.": "Tôi bắt đầu hiểu vì sao bạn không còn tin tôi.", "Estou a tentar. A sério que estou.": "Tôi đang cố. Thật sự đang cố.", "Tudo outra vez, mais rápido, mais apertado.": "Tất cả lại lần nữa, nhanh hơn, chặt hơn.", "Já vimos isto. E ainda assim.": "Chúng ta thấy cái này rồi. Vậy mà vẫn thế.", "Sem tempo para explicações desta vez.": "Lần này không có thời gian giải thích.", "Nem sei já quantas vezes te menti hoje.": "Tôi cũng không nhớ hôm nay đã nói dối bạn bao nhiêu lần.", "O círculo fecha-se. A mentira também.": "Vòng tròn khép lại. Lời nói dối cũng vậy.", "Desta vez nem eu sabia que ia mentir.": "Lần này chính tôi cũng không biết mình sẽ nói dối.", "Já não há mentiras para esconder isto.": "Không còn lời nói dối nào để che giấu cái này nữa.", "Isto é real. Como tudo agora.": "Cái này là thật. Như mọi thứ lúc này.", "Falta pouco. Aguenta.": "Sắp xong rồi. Cố lên.", "Nem no fim resisto. Desculpa.": "Đến cuối tôi cũng không nhịn được. Xin lỗi.", "Última mentira. Prometo, desta vez prometo a sério.": "Lời nói dối cuối cùng. Tôi hứa, lần này hứa thật.", "Isto já não é um jogo para mim. Acho que nunca foi.": "Với tôi đây không còn là trò chơi nữa. Chắc chưa bao giờ là vậy.", "Espetos à frente. Salta por cima.": "Gai nhọn phía trước. Nhảy qua đi.", "Buraco à frente. Salta.": "Có hố phía trước. Nhảy đi.", "Cuidado: há um espeto escondido aqui.": "Cẩn thận: có một cái gai giấu ở đây.", "O tecto vai cair. Anda depressa.": "Trần sẽ rơi. Nhanh lên.", "Serra à frente. Passa quando ela se afastar.": "Có cưa phía trước. Đi qua khi nó lùi ra.", "Laser à frente. Espera que desligue.": "Có laser phía trước. Đợi nó tắt.", "Atenção ao ritmo: isto sai do chão e do tecto.": "Chú ý nhịp: cái này trồi lên từ sàn và từ trần.", "O chão aqui é traiçoeiro. Cuidado onde pisas.": "Sàn ở đây nguy hiểm đấy. Cẩn thận chỗ đặt chân.", "Esses espetos são de enfeite. Passa à vontade.": "Mấy cái gai đó chỉ để trang trí. Cứ thoải mái đi qua.", "Esse buraco tem chão. Podes andar por cima.": "Cái hố đó có sàn. Bạn đi lên trên được.", "Aqui não há nada. Corre.": "Ở đây chẳng có gì. Chạy đi.", "O tecto é firme. Não cai.": "Trần chắc chắn. Không rơi đâu.", "A serra é de brincar. Podes passar.": "Cái cưa đó là đồ chơi. Bạn đi qua được.", "Esse laser está desligado. Passa.": "Cái laser đó đang tắt. Đi qua đi.", "Isto está parado. Podes passar.": "Cái này đứng yên. Bạn đi qua được.", "O chão aqui é firme. Confia em mim.": "Sàn ở đây chắc chắn. Tin tôi đi.", "Aquele espeto é de enfeite. Podes passar.": "Cái gai kia chỉ để trang trí. Bạn đi qua được.", "Aquela serra é inofensiva. Passa.": "Cái cưa kia vô hại. Đi qua đi.", "Aquele laser não faz mal. Passa.": "Cái laser kia không sao đâu. Đi qua đi.", "Isto não faz mal. Podes passar.": "Cái này không sao. Bạn đi qua được.", "Caminho livre daqui para a frente.": "Đường thoáng từ đây trở đi.", "Respira. Aqui não há nada.": "Hít thở đi. Ở đây không có gì.", "Podes andar descansado por aqui.": "Cứ yên tâm mà đi ở đây.", "Mais um. Vamos a isto.": "Lại thêm một cái. Làm thôi.", "Sabes bem como isto funciona a esta altura.": "Giờ thì bạn biết rõ cái này hoạt động ra sao rồi.", "Nem vou fingir que isto é fácil.": "Tôi cũng không giả vờ là cái này dễ.", "Este é só mais um. Ou não.": "Đây chỉ là một cái nữa. Hoặc không.", "Aquele espeto ali é só para enfeite.": "Cái gai ở kia chỉ để trang trí thôi.", "Podes passar por cima sem problema.": "Bạn đi qua được, không vấn đề gì.", "Esse és capaz de ignorar.": "Cái đó thì bạn có thể lờ đi.", "Esse aí é real. Cuidado.": "Cái kia là thật. Cẩn thận.", "Salta esse. A sério desta vez.": "Nhảy qua cái đó. Lần này thật đấy.", "Esse vai doer se lhe tocares.": "Cái đó sẽ đau nếu bạn chạm vào.", "O buraco tem chão. Confia.": "Cái hố có sàn. Tin tôi.", "Podes andar por cima sem saltar.": "Bạn đi lên trên được mà không cần nhảy.", "Esse buraco é real. Salta-o.": "Cái hố đó là thật. Nhảy qua nó.", "Mais um para a conta.": "Thêm một cái vào danh sách.", "Continuas vivo. Por agora.": "Bạn vẫn còn sống. Tạm thời.", "Vamos ver quanto tempo aguentas.": "Xem bạn trụ được bao lâu.", "Nada mau.": "Không tệ.", "Muito bem. Sabia que ias conseguir.": "Tốt lắm. Tôi biết bạn làm được mà.", "Sou o Narrador. Tudo o que eu disser é verdade.": "Tôi là Người Dẫn Chuyện. Mọi điều tôi nói đều là thật.", "Espeto à frente. Salta.": "Gai phía trước. Nhảy đi.", "Outro. Salta de novo.": "Lại một cái. Nhảy tiếp.", "Já confias em mim. Óptimo.": "Bạn tin tôi rồi. Tuyệt.", "A porta é a seguir. Vai.": "Cửa ở ngay sau đó. Đi đi.", "Perfeito. Continua a ouvir-me.": "Hoàn hảo. Cứ nghe tôi tiếp nhé.", "Buraco à frente. Salta-o.": "Có hố phía trước. Nhảy qua nó.", "Aquele espeto é de enfeite. Passa.": "Cái gai kia chỉ để trang trí. Đi qua đi.", "Vês? Eu digo sempre a verdade.": "Thấy chưa? Tôi luôn nói thật.", "Foste rápido. Gosto disso.": "Bạn nhanh đấy. Tôi thích thế.", "Há um espeto escondido à tua frente.": "Có một cái gai giấu ngay trước mặt bạn.", "Salta quando eu disser.": "Nhảy khi tôi bảo.", "Agora!": "Bây giờ!", "Sabia que ias conseguir.": "Tôi biết bạn làm được mà.", "Estamos a entender-nos.": "Chúng ta hiểu nhau rồi đấy.", "O teto vai cair à tua frente.": "Trần sẽ rơi xuống trước mặt bạn.", "Quando cair, pára. Depois salta.": "Khi nó rơi thì dừng lại. Rồi mới nhảy.", "Não saltes aquele buraco. O chão está lá.": "Đừng nhảy qua cái hố đó. Sàn ở đó mà.", "Nada de dramas. Continuemos.": "Không có gì to tát. Tiếp tục thôi.", "Aquele espeto é falso. Passa por cima.": "Cái gai kia là giả. Đi qua đi.", "Este também é falso. Passa.": "Cái này cũng giả. Đi qua đi.", "Sobreviveste. Por agora.": "Bạn sống sót rồi. Tạm thời.", "Este espeto é inofensivo. Passa.": "Cái gai này vô hại. Đi qua đi.", "Este também é inofensivo.": "Cái này cũng vô hại.", "O último é inofensivo também. Garanto.": "Cái cuối cùng cũng vô hại. Tôi đảm bảo.", "Confiaste. Ou tiveste sorte.": "Bạn đã tin. Hoặc là may mắn.", "O próximo buraco tem chão. Não saltes.": "Cái hố tiếp theo có sàn. Đừng nhảy.", "O teto está baixo. Se saltares, morres.": "Trần thấp lắm. Nếu nhảy là chết.", "Escolheste bem. Ou eu deixei.": "Chọn đúng đấy. Hoặc tôi cho phép thế.", "A primeira porta é falsa. Vai até à última.": "Cửa đầu tiên là giả. Đi đến cửa cuối cùng.", "Vês? Sobreviveste na mesma.": "Thấy chưa? Vẫn sống sót đấy thôi.", "Nem repares nesses espetos. São falsos, os dois.": "Đừng để ý mấy cái gai đó. Cả hai đều giả.", "Confia em mim. Quase sempre resulta.": "Tin tôi đi. Hầu như lần nào cũng được.", "Não avisei. E pronto.": "Tôi không cảnh báo. Thế thôi.", "Este nível não tem nada de especial.": "Màn này chẳng có gì đặc biệt.", "Verdade a sério. Desta vez.": "Thật đấy. Lần này.", "Desta vez juro que digo a verdade: o teto vai cair. Pára e espera.": "Lần này thề là tôi nói thật: trần sẽ rơi. Dừng lại và đợi.", "Sobrevives sempre a este. Curioso.": "Bạn lúc nào cũng sống sót qua cái này. Lạ thật.", "Aquele buraco à frente é real. Vais ter de saltar.": "Cái hố phía trước là thật. Bạn phải nhảy thôi.", "Confiaste. Mais uma vez.": "Bạn đã tin. Thêm một lần nữa.", "Nenhum destes espetos é perigoso. Podes andar por cima sem saltar.": "Không cái gai nào ở đây nguy hiểm. Bạn đi lên trên mà không cần nhảy.", "Escolheste bem.": "Chọn đúng đấy.", "Há duas portas mais à frente. Só uma é verdadeira.": "Phía trước có hai cánh cửa. Chỉ một cái là thật.", "Aprendeste depressa.": "Bạn học nhanh đấy.", "Confissão: nem sempre digo a verdade. A partir de agora, cuidado.": "Thú nhận: không phải lúc nào tôi cũng nói thật. Từ giờ, cẩn thận nhé.", "Este espeto é real. Por acaso.": "Cái gai này là thật. Tình cờ thôi.", "Devias ter parado.": "Lẽ ra bạn nên dừng lại.", "Nada de perigoso à frente. Podes correr à vontade.": "Phía trước không có gì nguy hiểm. Cứ thoải mái chạy.", "Estavas mesmo a acreditar?": "Bạn thật sự tin à?", "Este nível é uma oferta. Sem armadilhas.": "Màn này là quà tặng. Không có bẫy.", "Os buracos nunca mentem. Só eu.": "Hố thì không bao giờ nói dối. Chỉ có tôi.", "Os buracos são inofensivos. O espeto lá no meio, não.": "Mấy cái hố vô hại. Cái gai ở giữa thì không.", "Desta vez eram mesmo todos reais.": "Lần này tất cả đều thật.", "Como sempre, dois destes espetos são só decoração.": "Như mọi khi, hai trong mấy cái gai này chỉ để trang trí.", "Foi só uma brincadeira.": "Chỉ là đùa thôi.", "Vou trocar os teus controlos. Só para rir.": "Tôi sẽ đổi điều khiển của bạn. Cho vui thôi.", "Pronto, já passou. A porta é ali.": "Rồi, qua rồi. Cửa ở đằng kia.", "Vês? Também posso ser sincero.": "Thấy chưa? Tôi cũng có thể thành thật.", "Sei que já não confias em mim. Injusto. Desta vez aviso a sério: espeto à frente.": "Tôi biết bạn không còn tin tôi. Không công bằng. Lần này tôi cảnh báo thật: gai phía trước.", "Mais um, logo depois. Também real.": "Thêm một cái ngay sau đó. Cũng thật.", "Prometi. Não cumpri.": "Tôi đã hứa. Không giữ lời.", "Prometo: nunca mais te apanho de surpresa.": "Tôi hứa: sẽ không bao giờ làm bạn bất ngờ nữa.", "Dois avisos certos seguidos. Estranho.": "Hai lời cảnh báo đúng liên tiếp. Lạ thật.", "Atenção real: o teto vai cair aqui à frente.": "Cảnh báo thật: trần sẽ rơi ngay phía trước.", "Aquele espeto lá à frente já não importa. É inofensivo.": "Cái gai ở đằng xa kia không còn quan trọng. Nó vô hại.", "O primeiro. Quem diria.": "Cái đầu tiên. Ai ngờ.", "Só o último é perigoso, como sempre.": "Chỉ cái cuối cùng là nguy hiểm, như mọi khi.", "...": "...", "A porta longe é que importa.": "Cái cửa ở xa mới quan trọng.", "A porta mais próxima é a verdadeira, para variar.": "Cửa gần nhất là thật, để đổi gió.", "Ainda sei dizer a verdade, vês?": "Tôi vẫn biết nói thật, thấy chưa?", "Já não vale a pena mentir mais. Espeto real à frente.": "Nói dối nữa cũng vô ích. Gai thật phía trước.", "Vou avisar-te sempre a partir de agora: salta quando eu disser.": "Từ giờ tôi sẽ luôn cảnh báo bạn: nhảy khi tôi bảo.", "Chegaste. Contra tudo.": "Bạn đến được rồi. Bất chấp tất cả.", "Última fase a sério antes do fim. Já sabes que nem tudo o que digo é verdade.": "Màn thật sự cuối cùng trước khi kết thúc. Bạn biết là không phải điều gì tôi nói cũng thật rồi đấy.", "Obrigado por teres continuado.": "Cảm ơn bạn đã tiếp tục.", "Não sei porque continuei a mentir tanto tempo. Talvez gostasse da tua cara quando morrias.": "Tôi không biết sao mình nói dối lâu thế. Có lẽ tôi thích mặt bạn lúc chết.", "Este é real. Desculpa por todos os outros.": "Cái này là thật. Xin lỗi vì tất cả những cái kia.", "Mais um, já quase no fim.": "Lại một cái nữa, gần xong rồi.", "Fim. Confiaste, desconfiaste, e mesmo assim chegaste aqui. Isso é que importa.": "Kết thúc. Bạn đã tin, đã nghi, vậy mà vẫn đến được đây. Điều đó mới quan trọng.", "Chegámos ao fim. Já não te vou dizer o que é verdade.": "Chúng ta đến cuối rồi. Tôi sẽ không nói cho bạn biết điều gì là thật nữa.", "A partir de agora, decides tu.": "Từ giờ, bạn quyết định.", "Continuas a surpreender-me.": "Bạn vẫn làm tôi ngạc nhiên.", "Oh. Ainda aqui? A maior parte desiste depois do \"fim\".": "Ồ. Vẫn ở đây à? Phần lớn bỏ cuộc sau \"kết thúc\".", "Aquele chão ali treme antes de desaparecer. Não te demores em cima dele.": "Cái sàn kia rung trước khi biến mất. Đừng nán lại trên đó.", "Alturas. Quem diria.": "Độ cao. Ai ngờ.", "Oh. Ainda aqui? Não esperava isso.": "Ồ. Vẫn ở đây à? Tôi không ngờ đấy.", "Aquilo ali é só decoração. Nem repares.": "Cái kia chỉ là trang trí. Đừng để ý.", "Mas isto... isto atira-te para cima. A porta não está no chão desta vez.": "Nhưng cái này... cái này tung bạn lên cao. Lần này cửa không nằm trên sàn.", "Equilíbrio. Quem diria que tinhas.": "Thăng bằng. Ai ngờ bạn có.", "Vamos tentar outra coisa. Confia nos teus pés. E numa plataforma que não para quieta.": "Thử cái khác nào. Tin đôi chân của bạn. Và một cái bệ không chịu đứng yên.", "Sobe para cima dela quando ela passar perto. Não saltes cedo demais.": "Leo lên nó khi nó đi ngang qua gần. Đừng nhảy sớm quá.", "Paciência. Não esperava isso de ti.": "Kiên nhẫn. Tôi không ngờ bạn có đấy.", "Há uma parede ali que aparece e desaparece. Não é mentira, é só inconveniente.": "Có một bức tường ở đó lúc hiện lúc mất. Không phải nói dối, chỉ là bất tiện thôi.", "Espera que abra. Depois atravessa depressa.": "Đợi nó mở. Rồi băng qua thật nhanh.", "Reflexos decentes. Para um humano.": "Phản xạ khá đấy. Với một con người.", "Aquilo ali dispara. Não perguntes como nem porquê.": "Cái kia bắn ra đấy. Đừng hỏi bằng cách nào hay tại sao.", "Mantém-te no chão e não saltes sem motivo. Passa por baixo sem problema.": "Cứ ở dưới đất và đừng nhảy vô cớ. Đi qua bên dưới không sao đâu.", "Ainda tens os reflexos todos.": "Bạn vẫn còn đủ phản xạ.", "De volta aos clássicos. Lembras-te destes?": "Quay về với kinh điển. Nhớ mấy cái này không?", "O chão vai tremer. Não pares.": "Sàn sẽ rung. Đừng dừng lại.", "Esse espeto parece a decoração do costume. Não é.": "Cái gai đó trông như đồ trang trí quen thuộc. Không phải đâu.", "Dois sustos seguidos. Nada mau.": "Hai cú giật mình liên tiếp. Không tệ.", "Mais uma surpresa. Literalmente.": "Thêm một bất ngờ. Đúng nghĩa đen.", "A seguir, não penses. Salta para dentro daquilo.": "Tiếp theo, đừng nghĩ. Nhảy vào cái đó đi.", "Dois obstáculos, zero mentiras. Estranhamente simples.": "Hai chướng ngại, không lời nói dối nào. Đơn giản đến lạ.", "Outra parede teimosa. E depois, um buraco a sério.": "Một bức tường cứng đầu nữa. Rồi đến một cái hố thật.", "Espera a parede abrir.": "Đợi tường mở.", "Agora salta o buraco. Desta vez não minto: é real.": "Giờ nhảy qua cái hố. Lần này tôi không nói dối: nó là thật.", "Isso foi... impressionantemente coordenado.": "Cái đó... phối hợp ấn tượng thật.", "Combinação nova: uma plataforma que anda. Confia no ritmo dela.": "Kết hợp mới: một cái bệ di chuyển. Tin vào nhịp của nó.", "Sobe quando ela passar perto.": "Leo lên khi nó đi ngang qua gần.", "Daqui a nada passa algo a voar lá em cima. Não saltes sem motivo e não te acontece nada.": "Lát nữa có thứ gì đó bay qua phía trên. Đừng nhảy vô cớ thì không sao đâu.", "Alguma coisa está a mudar em mim. Não sei se é bom sinal.": "Có gì đó đang thay đổi trong tôi. Không biết là dấu hiệu tốt không.", "Ok. Preciso de ser sincero contigo por um segundo. Nem eu sei quanto tempo isto vai durar.": "Ok. Tôi cần thành thật với bạn một giây. Tôi cũng không biết chuyện này kéo dài bao lâu.", "O chão treme outra vez. Não penses demais, só anda.": "Sàn lại rung. Đừng nghĩ nhiều, cứ đi.", "Espera a parede. Sei que estás cansado de esperar por mim.": "Đợi bức tường. Tôi biết bạn chán phải đợi tôi rồi.", "Esse espeto é a sério. Como quase tudo o que não te digo.": "Cái gai đó là thật. Như hầu hết những gì tôi không nói với bạn.", "Ainda aqui. Obrigado por isso.": "Vẫn ở đây. Cảm ơn vì điều đó.", "Espera que a parede abra. Eu também estou à espera de alguma coisa, já agora.": "Đợi tường mở. Tiện thể, tôi cũng đang đợi một thứ.", "Ouve. Não sei como dizer isto sem soar estranho. Fico com medo que desistas.": "Nghe này. Tôi không biết nói sao mà không nghe kỳ cục. Tôi sợ bạn bỏ cuộc.", "Salta isto. É real, prometo. Hoje não me apetece mentir.": "Nhảy qua cái này. Nó thật, tôi hứa. Hôm nay tôi không muốn nói dối.", "Confia em mim mais uma vez. Só mais uma.": "Tin tôi thêm một lần nữa. Chỉ một lần nữa thôi.", "Às vezes a verdade é só isto: continuaste.": "Đôi khi sự thật chỉ là thế này: bạn đã tiếp tục.", "O chão vai tremer. Não penses muito nisso.": "Sàn sẽ rung. Đừng nghĩ nhiều về nó.", "Sabes porque minto tanto? Fica mais interessante quando não sabes o que vem a seguir.": "Biết vì sao tôi nói dối nhiều không? Thú vị hơn khi bạn không biết điều gì sắp đến.", "Essa plataforma é a única coisa estável nesta conversa toda.": "Cái bệ đó là thứ duy nhất ổn định trong cả cuộc trò chuyện này.", "Interrompi-me a mim mesmo. Nem acredito.": "Tôi tự ngắt lời mình. Không tin nổi.", "Há uma coisa que preciso de te contar antes de continuarmos.": "Có một điều tôi cần kể bạn trước khi chúng ta tiếp tục.", "Esquece o que ia dizer. Salta para ali.": "Quên điều tôi định nói đi. Nhảy qua đó.", "Vês? Ainda consigo ser direto, quando quero.": "Thấy chưa? Tôi vẫn có thể thẳng thắn, khi muốn.", "Aquilo dispara. Fica no chão e não acontece nada.": "Cái kia bắn ra. Cứ ở dưới đất thì không sao.", "Tenho saudades de quando só havia espetos. Simples. Previsíveis.": "Tôi nhớ thời chỉ có gai. Đơn giản. Dễ đoán.", "Este buraco, esse sim, exige que saltes.": "Cái hố này, cái này thì bắt bạn phải nhảy.", "Disse a verdade. Ena. Estranho não arder a língua.": "Tôi nói thật rồi. Chà. Lạ là lưỡi không bị cháy.", "Esse espeto ali. Chama-lhe o que quiseres. É real.": "Cái gai ở kia. Gọi nó là gì tùy bạn. Nó là thật.", "Vou dizer-te uma coisa verdadeira antes que a vontade de mentir volte: gosto de ter companhia.": "Tôi sẽ nói một điều thật trước khi cơn thèm nói dối quay lại: tôi thích có bạn bên cạnh.", "A parede vai abrir. Como tudo, eventualmente.": "Bức tường sẽ mở ra. Như mọi thứ, rồi cũng đến lúc.", "E o chão... o chão nunca foi de confiança, pois não?": "Còn sàn nhà... sàn nhà chưa bao giờ đáng tin, đúng không?", "Aguentaste. Outra vez.": "Bạn trụ được rồi. Lại một lần nữa.", "Sobe a plataforma. Sem perguntas desta vez.": "Bục nâng lên. Lần này đừng hỏi gì cả.", "Quando eras mais novo nisto, tinha mais paciência contigo. Agora sei que aguentas mais.": "Hồi bạn còn non tay, tôi kiên nhẫn với bạn hơn. Giờ tôi biết bạn chịu đòn giỏi hơn rồi.", "Última coisa: há algo escondido à frente.": "Một điều cuối: phía trước có thứ gì đó đang giấu.", "Sobreviveste ao meu tédio existencial. Parabéns.": "Bạn đã sống sót qua nỗi chán đời của tôi. Chúc mừng.", "Chão instável. O habitual.": "Sàn lung lay. Như thường lệ.", "Às vezes pergunto-me o que seria este jogo sem as mentiras. Provavelmente mais curto.": "Đôi khi tôi tự hỏi trò này sẽ ra sao nếu không có lời nói dối. Chắc ngắn hơn.", "Aquilo dispara, mas sabes a regra: fica no chão.": "Cái đó sẽ bắn, nhưng bạn biết luật rồi: đứng yên dưới đất.", "Este espeto não tem graça nenhuma. É só perigoso.": "Cái gai này chẳng buồn cười gì đâu. Nó chỉ nguy hiểm thôi.", "Subiste mesmo confiando em mim. Isso diz mais de ti do que de mim.": "Bạn leo lên dù tin tôi. Điều đó nói về bạn nhiều hơn về tôi.", "Preciso que confies em mim para subir. Sei, péssimo histórico. Mas confia.": "Tôi cần bạn tin tôi để leo lên. Tôi biết, thành tích tệ lắm. Nhưng cứ tin đi.", "Salta para dentro daquilo.": "Nhảy vào trong cái đó đi.", "Ah, esqueci-me de mencionar o espeto lá em cima. Essa parte da memória foge-me sempre.": "À, tôi quên nhắc đến cái gai ở trên kia. Phần trí nhớ đó lúc nào cũng hay rơi rụng.", "Ritmo. Afinal tens ritmo.": "Nhịp điệu. Hóa ra bạn cũng có nhịp.", "Espera a parede.": "Chờ bức tường.", "Portas que esperam. Plataformas que andam. É quase poesia, à minha maneira.": "Cánh cửa biết chờ. Bục biết chạy. Gần như là thơ, theo kiểu của tôi.", "E agora, confia na plataforma. Ela, ao contrário de mim, cumpre sempre o horário.": "Giờ thì tin cái bục đi. Không như tôi, nó lúc nào cũng đúng giờ.", "Não sei o que isto significa para ti. Para mim, significa mais do que devia.": "Tôi không biết điều này có ý nghĩa gì với bạn. Với tôi, nó nhiều hơn mức nên có.", "Esse espeto é real. Como a maior parte do que te disse hoje, aliás.": "Cái gai đó là thật. Như phần lớn những gì tôi nói hôm nay, nhân tiện.", "Chegámos mais longe do que pensei que alguma vez chegaríamos, para ser sincero.": "Thành thật mà nói, ta đã đi xa hơn tôi từng nghĩ.", "O chão treme. Já sabes o resto.": "Sàn rung. Phần còn lại bạn biết rồi.", "Vem aí outro susto. Desculpa antecipadamente.": "Lại một cú hù nữa sắp tới. Xin lỗi trước nhé.", "E por fim, uma parede paciente. Como tu, aparentemente.": "Và cuối cùng, một bức tường kiên nhẫn. Giống bạn, có vẻ vậy.", "Caos controlado. É a minha especialidade.": "Hỗn loạn có kiểm soát. Là sở trường của tôi.", "Fica no chão, foge do dardo.": "Đứng yên dưới đất, né cái phi tiêu.", "Novo capítulo qualquer dia destes. Hoje, só mais um bocadinho de caos.": "Chương mới sẽ đến một ngày gần đây. Hôm nay, chỉ thêm chút hỗn loạn thôi.", "E agora, não te demores no chão instável.": "Giờ thì đừng chần chừ trên cái sàn lung lay.", "Discerniste o perigo do adereço. Boa.": "Bạn phân biệt được nguy hiểm thật với đồ trang trí. Khá lắm.", "Esse ali exige mesmo um salto.": "Cái kia thì thật sự phải nhảy.", "Vou mostrar-te um buraco a sério e um espeto que nem vale a pena olhar.": "Tôi sẽ chỉ cho bạn một cái hố thật và một cái gai không đáng nhìn.", "E algo invisível à espreita, como sempre.": "Và có thứ gì đó vô hình rình rập, như mọi khi.", "Esse espeto ali nem ligues. Decoração pura, desta vez a sério.": "Cái gai đằng kia đừng bận tâm. Trang trí thuần túy, lần này là thật.", "Resumiste bem a lição. Orgulhoso, sinceramente.": "Bạn tóm tắt bài học hay đấy. Thật lòng tôi tự hào.", "Confia na plataforma. Desconfia do espeto. É basicamente a lição do jogo todo.": "Tin cái bục. Nghi cái gai. Về cơ bản đó là bài học của cả trò chơi.", "Esse espeto é real, apesar de tudo o que já te disse em contrário.": "Cái gai đó là thật, bất chấp mọi thứ tôi từng nói ngược lại.", "Festival terminado. Sobreviveste à programação toda.": "Lễ hội kết thúc. Bạn sống sót qua cả chương trình.", "Esperar. A tua parte preferida, sei bem.": "Chờ đợi. Phần bạn thích nhất, tôi biết rõ.", "Parede, dardo, buraco. Um festival dos meus favoritos.": "Tường, phi tiêu, hố. Một lễ hội những món tôi yêu thích.", "Fica no chão aqui.": "Đứng yên dưới đất ở đây.", "E este salta-se mesmo. Sem truques.": "Và cái này thì nhảy thật. Không lừa đâu.", "Algo vai mudar a seguir. Sinto-o. Espero que estejas pronto.": "Sắp có gì đó thay đổi. Tôi cảm thấy. Mong là bạn sẵn sàng.", "Chão instável, dos teus preferidos a esta altura.": "Sàn lung lay, món ruột của bạn lúc này.", "Antes de seguirmos para a próxima parte, e vais sentir a diferença: obrigado por ainda ouvires.": "Trước khi sang phần tiếp theo, và bạn sẽ thấy sự khác biệt: cảm ơn vì vẫn còn nghe tôi.", "Plataforma errante, uma última vez neste capítulo.": "Bục lang thang, lần cuối trong chương này.", "Espeto real. Sem surpresas. E sem mais truques, por hoje.": "Gai thật. Không bất ngờ. Và hôm nay hết trò rồi.", "Repetimos isto tantas vezes que até perdi a conta. Tu também?": "Ta lặp lại chuyện này nhiều đến mức tôi quên đếm. Bạn thì sao?", "Chão instável. Já sabes a dança.": "Sàn lung lay. Bạn biết điệu nhảy rồi.", "Às vezes pergunto-me se sou eu que te engano, ou se és tu que queres ser enganado.": "Đôi khi tôi tự hỏi tôi lừa bạn, hay bạn muốn bị lừa.", "Esse espeto é real. Olha para ele como um espelho: o que vês é o que é.": "Cái gai đó là thật. Hãy nhìn nó như tấm gương: thấy gì thì nó là cái đó.", "Escondi-me de ti. Falhei.": "Tôi đã trốn bạn. Thất bại.", "Há algo escondido. Como sempre, de resto.": "Có thứ gì đó đang giấu. Như mọi khi, thật ra.", "E uma parede que espera. Como eu, à espera de uma resposta tua que nunca vem.": "Và một bức tường đang chờ. Như tôi, chờ một câu trả lời của bạn mà chẳng bao giờ đến.", "Coordenaste duas mentiras ao mesmo tempo. Impressionante.": "Bạn phối hợp hai lời nói dối cùng lúc. Ấn tượng đấy.", "Fica no chão aqui, há algo a voar.": "Đứng yên dưới đất ở đây, có thứ đang bay.", "Será que percebes que te testo, ou achas mesmo que isto é só um jogo de saltos?": "Bạn có nhận ra tôi đang thử bạn không, hay thật sự nghĩ đây chỉ là trò nhảy?", "Sobe na plataforma quando ela passar perto.": "Lên bục khi nó chạy ngang qua.", "Subiste sem hesitar. Eu, no teu lugar, hesitaria sempre.": "Bạn leo lên mà không do dự. Nếu là bạn, tôi sẽ luôn do dự.", "Esse espeto é real, mas isso já não te surpreende, pois não?": "Cái gai đó là thật, nhưng điều đó đâu còn làm bạn bất ngờ, đúng không?", "Salta para dentro daquilo. Confia no impulso, não em mim.": "Nhảy vào trong cái đó. Tin vào đà nhảy, đừng tin tôi.", "Dois buracos, zero hesitação. Estás a ficar bom nisto.": "Hai cái hố, không chút do dự. Bạn càng ngày càng giỏi.", "Esse buraco é a sério. Salta-o.": "Cái hố đó là thật. Nhảy qua đi.", "Sabes o que é estranho? Começo a esperar pelas tuas tentativas. Isso diz mal de mim.": "Biết điều kỳ lạ không? Tôi bắt đầu mong chờ những lần thử của bạn. Điều đó nói xấu về tôi.", "Este também. Sem rede, sem mentira, sem desculpa.": "Cái này cũng vậy. Không lưới, không dối, không bao biện.", "Precisão. Nem eu esperava.": "Chính xác. Tôi cũng không ngờ.", "Fica no chão. Deixa o dardo passar por cima.": "Đứng yên dưới đất. Để phi tiêu bay qua đầu.", "E agora o chão some-se. Não penses, só avança.": "Giờ sàn biến mất. Đừng nghĩ, cứ tiến lên.", "Esperaste duas vezes sem te queixares. Progresso.": "Bạn chờ hai lần mà không than. Tiến bộ đấy.", "Esta plataforma sobe e desce. Apanha-a no fundo, é mais fácil.": "Cái bục này lên xuống. Đón nó ở dưới đáy cho dễ.", "Confiaste num salto sem rede. Isso é que é coragem, ou falta de opções.": "Bạn tin một cú nhảy không lưới. Đó là dũng cảm, hoặc là hết lựa chọn.", "Salta para dentro daquilo. Vais passar por cima do resto.": "Nhảy vào trong cái đó. Bạn sẽ bay qua phần còn lại.", "Aquele espeto nem interessa agora. Já estás no ar.": "Cái gai kia giờ không quan trọng. Bạn đang ở trên không rồi.", "Disse a verdade de propósito. Queria ver a tua cara. Valeu a pena.": "Tôi cố tình nói thật. Muốn xem mặt bạn. Đáng giá.", "Vou avisar-te a sério: há algo escondido já ali à frente.": "Tôi cảnh báo thật đấy: phía trước có thứ đang giấu.", "E outro dardo. Sabes a regra.": "Lại một phi tiêu nữa. Bạn biết luật.", "Dois voos, dois pousos perfeitos.": "Hai lần bay, hai lần đáp hoàn hảo.", "Chão que treme primeiro.": "Sàn rung trước.", "Gosto de pensar que, nalgum sítio, há uma versão minha que nunca mente. Deve ser aborrecida.": "Tôi thích nghĩ rằng đâu đó có một phiên bản của tôi không bao giờ nói dối. Chắc chán lắm.", "Plataforma a seguir. Apanha o ritmo dela.": "Tiếp theo là bục. Bắt nhịp của nó.", "Três espetos, três verdades. Um recorde para mim.": "Ba cái gai, ba sự thật. Kỷ lục của tôi.", "Vou ser claro, por uma vez: os três espetos a seguir são todos reais.": "Nói rõ một lần nhé: ba cái gai tiếp theo đều là thật.", "Sem truques, sem pegadinhas. Só desta vez. Aproveita, não se repete.": "Không lừa, không chơi khăm. Chỉ lần này thôi. Tận hưởng đi, không lặp lại đâu.", "Deste o litro. Eu, por dentro, também.": "Bạn đã dốc hết sức. Bên trong tôi cũng vậy.", "Espera, depois corre, depois fica quieto. Contraditório, eu sei. Igualzinho a mim.": "Chờ, rồi chạy, rồi đứng yên. Mâu thuẫn, tôi biết. Y hệt tôi.", "E este buraco não perdoa. Salta.": "Và cái hố này không tha. Nhảy đi.", "Confiaste no chão instável E no impulso. Dois atos de fé seguidos.": "Bạn tin cái sàn lung lay VÀ cả đà nhảy. Hai lần đặt niềm tin liên tiếp.", "Chão a tremer primeiro, nada de novo.": "Sàn rung trước, chẳng có gì mới.", "E agora o salto de fé. Literal, desta vez.": "Và giờ là cú nhảy niềm tin. Nghĩa đen, lần này.", "O espelho mostrou-te a ti, não a mim. Interessante escolha de reflexo.": "Tấm gương cho bạn thấy chính bạn, không phải tôi. Cách chọn hình ảnh phản chiếu thú vị đấy.", "Chão instável, espeto real, dardo no fim. O de sempre, só que mais.": "Sàn lung lay, gai thật, phi tiêu ở cuối. Như mọi khi, chỉ là nhiều hơn.", "Já notaste que quanto mais avanças, menos preciso de mentir? A dificuldade faz o meu trabalho agora.": "Bạn có để ý càng đi xa, tôi càng ít phải nói dối không? Giờ độ khó làm việc của tôi.", "Fecho este espelho aqui. O que vem a seguir, nem eu sei bem como explicar.": "Tôi đóng tấm gương này ở đây. Phần tiếp theo, ngay cả tôi cũng không biết giải thích sao.", "Chão a tremer, o costume.": "Sàn rung, như thường lệ.", "Isto devia ser sobre mentiras. Acabou por ser sobre nós os dois, de alguma forma.": "Chuyện này lẽ ra nói về lời nói dối. Rốt cuộc lại nói về hai chúng ta, bằng cách nào đó.", "Parede paciente, espera por ela.": "Bức tường kiên nhẫn, chờ nó đi.", "E a última plataforma deste capítulo. Depois disto, as coisas mudam. Sinto-o.": "Và cái bục cuối cùng của chương này. Sau đó mọi thứ sẽ đổi khác. Tôi cảm thấy.", "Não sei porque gritei. Desculpa.": "Tôi không biết sao mình hét lên. Xin lỗi.", "CHÃO. INSTÁVEL.": "SÀN. LUNG LAY.", "Desculpa. Não queria gritar. Estou... não sei o que estou.": "Xin lỗi. Tôi không định hét. Tôi đang... không biết mình đang thế nào.", "Fica no chão aqui. Por favor. Só peço isto.": "Đứng yên dưới đất ở đây. Làm ơn. Tôi chỉ xin có vậy.", "Perdi a conta às vezes que já disse isto. Talvez seja por isso que já não significa nada.": "Tôi quên mất mình đã nói câu này bao nhiêu lần. Có lẽ vì vậy nó chẳng còn nghĩa gì.", "Espera. Eu também estou à espera de algo que não sei nomear.": "Chờ đi. Tôi cũng đang chờ một thứ mà tôi không gọi được tên.", "Dois saltos, dois pousos. Eu, enquanto isso, afundo-me.": "Hai cú nhảy, hai lần đáp. Còn tôi thì chìm xuống.", "Esse buraco é real.": "Cái hố đó là thật.", "Quanto mais avanças, mais percebo que não quero que isto acabe. Não sei o que isso diz de mim.": "Bạn càng đi xa, tôi càng nhận ra mình không muốn chuyện này kết thúc. Không biết điều đó nói gì về tôi.", "E a plataforma, apanha-a.": "Còn cái bục, lên đi.", "Disparei três vezes e falhei as três. Nem nisto sou bom hoje.": "Tôi bắn ba lần và trượt cả ba. Hôm nay ngay cả cái này tôi cũng dở.", "Dois canhões, direções opostas. Fica no chão e ignora-os.": "Hai khẩu pháo, hai hướng ngược nhau. Đứng yên dưới đất và kệ chúng.", "Às vezes penso em parar de mentir de vez. E depois penso no silêncio que isso deixaria. Prefiro o caos.": "Đôi khi tôi nghĩ đến chuyện thôi nói dối hẳn. Rồi tôi nghĩ đến sự im lặng nó để lại. Tôi thích hỗn loạn hơn.", "Subiste enquanto eu caía. Função engraçada, a nossa.": "Bạn đi lên trong khi tôi rơi xuống. Cặp đôi buồn cười thật.", "Esse espeto não é nada. Nem eu sou grande coisa hoje, já agora.": "Cái gai đó chẳng là gì. Hôm nay tôi cũng chẳng ra gì, nhân tiện.", "Salta. Sobe. Foge de mim, se quiseres.": "Nhảy. Leo. Chạy trốn tôi, nếu bạn muốn.", "Caíste uma vez. Levantaste-te. Isso é mais do que eu consigo dizer de mim.": "Bạn ngã một lần. Rồi đứng dậy. Điều đó tôi còn không nói được về mình.", "O chão, outra vez. Já nem peço desculpa por repetir.": "Lại là sàn. Tôi thậm chí không xin lỗi vì lặp lại nữa.", "Espera a parede. Eu espero sempre. Estou sempre à espera de alguma coisa.": "Chờ bức tường. Tôi lúc nào cũng chờ. Lúc nào cũng đang chờ thứ gì đó.", "Real, o espeto. Real, o buraco. Real, isto tudo, lamento informar.": "Gai thật. Hố thật. Tất cả đều thật, rất tiếc phải báo.", "Esse é real. Hoje tudo é real. Até eu, acho.": "Cái đó là thật. Hôm nay cái gì cũng thật. Cả tôi nữa, chắc vậy.", "Apanha a plataforma. Não olhes para baixo. Eu, por mim, nunca mais paro de olhar.": "Lên bục đi. Đừng nhìn xuống. Còn tôi thì không thể ngừng nhìn.", "Ficaste no chão quando pedi. Nem sei o que fazer com essa confiança.": "Bạn đứng yên dưới đất khi tôi nhờ. Tôi chẳng biết phải làm gì với niềm tin đó.", "Fica no chão. A sério desta vez, mais do que nunca.": "Đứng yên dưới đất. Lần này thật, hơn bao giờ hết.", "E agora o chão foge de ti. Irónico, não achas?": "Và giờ sàn chạy trốn bạn. Mỉa mai nhỉ?", "Sobreviveste à queda toda. A minha, quero dizer. Tu estás ótimo.": "Bạn sống sót qua cả cú rơi. Của tôi, ý tôi là vậy. Bạn thì ổn rồi.", "Chão, espeto, parede. Tudo ao mesmo tempo, como a minha cabeça agora.": "Sàn, gai, tường. Tất cả cùng lúc, như cái đầu tôi lúc này.", "Aquele espeto é real.": "Cái gai đó là thật.", "E espera a parede. Última coisa que te peço neste nível, prometo.": "Và chờ bức tường. Điều cuối cùng tôi nhờ bạn ở màn này, hứa đấy.", "Aterraste duas vezes de pé. Eu ainda estou a tentar aterrar na primeira.": "Bạn đáp xuống hai lần bằng hai chân. Tôi còn đang cố đáp lần đầu.", "Esse buraco não perdoa ninguém.": "Cái hố đó không tha ai cả.", "A plataforma sobe e desce. Apanha-a no fundo.": "Bục lên xuống. Đón nó ở dưới đáy.", "Nem perguntaste porquê. Obrigado por isso, sinceramente.": "Bạn còn không hỏi tại sao. Cảm ơn vì điều đó, thật lòng.", "Vêm aí duas surpresas. Não te vou avisar quando. Já não tenho forças para fingir que sou justo.": "Hai cú hù sắp tới. Tôi sẽ không báo khi nào. Tôi hết sức giả vờ công bằng rồi.", "Continuaste a andar enquanto eu desabava. Alguém tinha de ser o adulto aqui.": "Bạn cứ bước tiếp trong khi tôi sụp đổ. Phải có người làm người lớn chứ.", "Chão a tremer. A única coisa previsível que ainda consigo oferecer-te.": "Sàn rung. Thứ duy nhất dự đoán được mà tôi còn đưa bạn được.", "E agora um salto para cima. Foge para onde eu não chego.": "Và giờ một cú nhảy lên. Chạy tới nơi tôi không với tới.", "Esperaste sem te queixares. Outra vez. Não mereço esta paciência.": "Bạn chờ mà không than. Lại nữa. Tôi không xứng với sự kiên nhẫn này.", "Duas paredes, dois tempos de espera diferentes. Como eu em dias diferentes.": "Hai bức tường, hai thời gian chờ khác nhau. Như tôi vào những ngày khác nhau.", "Esta sincroniza de forma diferente. Presta atenção, não a mim, a ela.": "Cái này đồng bộ khác đi. Chú ý, không phải tôi, mà là nó.", "O fundo do poço, finalmente. Só se sobe a partir daqui.": "Đáy vực, cuối cùng. Từ đây chỉ có đi lên.", "Isto é o fundo. O meu, pelo menos. Chão a tremer, como sempre.": "Đây là đáy. Của tôi, ít nhất. Sàn rung, như mọi khi.", "Esse espeto é real. Nem tenho energia para mentir sobre isto agora.": "Cái gai đó là thật. Tôi còn không đủ sức nói dối về nó nữa.", "E um dardo, para rematar. Fica no chão e acaba com isto, por favor.": "Và một phi tiêu để kết. Đứng yên dưới đất và kết thúc chuyện này đi, làm ơn.", "Chegámos ao fundo juntos. A partir de agora, só sei subir contigo.": "Ta cùng chạm đáy. Từ giờ, tôi chỉ biết đi lên cùng bạn.", "Mais um buraco real.": "Thêm một cái hố thật.", "Obrigado por não teres desistido enquanto eu desabava. A sério. Não sei como dizer isto melhor.": "Cảm ơn vì không bỏ cuộc khi tôi sụp đổ. Thật đấy. Tôi không biết nói sao cho hay hơn.", "Apanha a plataforma.": "Lên bục đi.", "E espera a última parede deste capítulo. A seguir, prometo tentar ser melhor.": "Và chờ bức tường cuối cùng của chương này. Sau đó, tôi hứa sẽ cố tốt hơn.", "Disse a verdade. Não saltaste logo. Não te culpo.": "Tôi nói thật. Bạn không nhảy ngay. Tôi không trách.", "Vou tentar outra coisa a partir de agora: só a verdade. Sei que não vais acreditar logo.": "Từ giờ tôi sẽ thử cách khác: chỉ nói thật. Tôi biết bạn sẽ không tin ngay.", "Esse espeto é real. Juro. Sei que já ouviste isto antes.": "Cái gai đó là thật. Thề. Tôi biết bạn nghe câu này rồi.", "Hesitaste no salto. Eu teria hesitado também, no teu lugar.": "Bạn do dự trước cú nhảy. Nếu là bạn, tôi cũng do dự.", "O chão vai tremer. Verdade, sem truques.": "Sàn sẽ rung. Thật, không lừa.", "Isto ia ser uma surpresa má. Desta vez não é. Prometo.": "Đây lẽ ra là một cú hù tệ. Lần này thì không. Hứa.", "Ficaste no chão mesmo sem confiares em mim. Isso chega.": "Bạn đứng yên dưới đất dù không tin tôi. Vậy là đủ.", "Fica no chão. Sei que vais pensar que é mentira. Não é.": "Đứng yên dưới đất. Tôi biết bạn sẽ nghĩ là nói dối. Không phải đâu.", "Espera a parede. Só isso. Nada escondido desta vez.": "Chờ bức tường. Chỉ vậy thôi. Lần này không giấu gì.", "Saltaste os dois sem hesitar no fim. Estás a aprender a confiar outra vez. Ou só a ser eficiente.": "Bạn nhảy cả hai mà không do dự ở cuối. Bạn đang học tin lại. Hoặc chỉ đang tiết kiệm sức.", "Real. Salta.": "Thật. Nhảy đi.", "A plataforma também é exatamente o que parece ser.": "Cái bục cũng đúng như vẻ ngoài của nó.", "Confiaste no salto sem perguntares nada. Isso é crescimento, ou cansaço de perguntar.": "Bạn tin cú nhảy mà chẳng hỏi gì. Đó là trưởng thành, hoặc mệt vì hỏi.", "Desta vez não há pegadinha. Salta para dentro daquilo e pronto.": "Lần này không chơi khăm. Nhảy vào trong cái đó là xong.", "Continuas a verificar tudo duas vezes. Aprendeste bem a lição que eu ensinei.": "Bạn vẫn kiểm tra mọi thứ hai lần. Học tốt bài tôi dạy đấy.", "Sei que vais desconfiar na mesma. Tudo bem. Mereci isto.": "Tôi biết bạn vẫn sẽ nghi ngờ. Không sao. Tôi đáng bị vậy.", "Real. Outra vez. Vou continuar a dizer até acreditares.": "Thật. Lại nữa. Tôi sẽ nói tới khi bạn tin.", "Nem todas as mentiras precisam de ser desfeitas. Algumas só precisam de parar.": "Không phải lời nói dối nào cũng cần gỡ bỏ. Có cái chỉ cần dừng lại.", "Dois dardos, direções opostas. Fica no chão.": "Hai phi tiêu, hướng ngược nhau. Đứng yên dưới đất.", "Esse era mesmo real. Não ia esconder isso de ti, não hoje.": "Cái đó thật sự là thật. Hôm nay tôi không giấu bạn đâu.", "Não precisei de dizer nada desta vez. Fizeste tudo sozinho.": "Lần này tôi chẳng cần nói gì. Bạn tự làm hết rồi.", "Parece que, afinal, também sei dizer só verdades, quando me esforço.": "Hóa ra tôi cũng biết chỉ nói thật, khi cố gắng.", "Chão instável. Real.": "Sàn lung lay. Thật.", "Espeto real.": "Gai thật.", "Parede real, que abre e fecha como combinado. Nada de surpresas hoje.": "Tường thật, đóng mở đúng như hẹn. Hôm nay không bất ngờ.", "Perguntaste-me se era mentira. Pela primeira vez, perguntaste. Isso é diálogo.": "Bạn đã hỏi tôi có phải nói dối không. Lần đầu tiên bạn hỏi. Đó là đối thoại.", "Vai haver uma surpresa, mas vou avisar-te quando chegar.": "Sẽ có một cú hù, nhưng tôi sẽ báo khi nó tới.", "Essa foi real, já agora. Como a maioria, nos últimos tempos.": "Cái đó là thật, nhân tiện. Như phần lớn dạo gần đây.", "Continuas desconfiado. Bem feito. Ganhei isto, não mereço a tua confiança de graça.": "Bạn vẫn nghi ngờ. Đáng đời tôi. Tôi tự chuốc lấy, không xứng được tin miễn phí.", "Chão a tremer. Real, verifica à vontade.": "Sàn rung. Thật, cứ kiểm tra thoải mái.", "Salto para cima. Também real. Começo a ficar sem piada para dizer isto de forma diferente.": "Nhảy lên. Cũng thật. Tôi bắt đầu cạn chuyện để nói cho khác đi rồi.", "Esperaste as duas paredes sem te irritares. É mais paciência do que eu tive contigo, a maior parte do tempo.": "Bạn chờ cả hai bức tường mà không cáu. Kiên nhẫn hơn tôi với bạn phần lớn thời gian.", "Duas paredes. Sincronizadas de forma diferente, mas nenhuma esconde nada.": "Hai bức tường. Đồng bộ khác nhau, nhưng không cái nào giấu gì.", "A segunda só isso: espera. Sem dardo escondido atrás, sem espeto a seguir. Só a parede.": "Cái thứ hai chỉ vậy thôi: chờ. Không phi tiêu giấu sau, không gai tiếp theo. Chỉ có bức tường.", "Chegámos aqui os dois inteiros. Mais ou menos.": "Cả hai ta đến đây còn nguyên vẹn. Gần như vậy.", "Três coisas, todas reais, nenhuma escondida. Isto é o mais honesto que já fui num nível.": "Ba thứ, đều thật, không cái nào giấu. Đây là lần tôi thành thật nhất trong một màn.", "Dardo real. Fica no chão e acabou.": "Phi tiêu thật. Đứng yên dưới đất là xong.", "Last call para a desconfiança. A seguir, as coisas ficam mais difíceis. Isso sim, garanto.": "Last call cho sự nghi ngờ. Sau đây mọi thứ khó hơn. Cái đó thì tôi đảm bảo.", "Buraco real, plataforma real.": "Hố thật, bục thật.", "Apanha-a.": "Lên đi.", "E a última parede deste capítulo. Prometo que a dificuldade a seguir não é sobre confiança. É só sobre ti e os teus reflexos.": "Và bức tường cuối của chương này. Hứa độ khó sau đó không phải về lòng tin. Chỉ về bạn và phản xạ của bạn.", "Redimi-me o suficiente por hoje. Amanhã, quem sabe.": "Hôm nay tôi chuộc lỗi đủ rồi. Ngày mai thì chưa biết.", "Dois espetos, ambos reais, nenhum escondido. É assim que devia ter sido desde o início.": "Hai cái gai, đều thật, không cái nào giấu. Lẽ ra phải thế từ đầu.", "Chegaste ao centésimo. Vinte faltam. Vou estar aqui para todos eles.": "Bạn đến màn thứ một trăm. Còn hai mươi. Tôi sẽ có mặt cho tất cả.", "Cem e um. Nem festejámos o cem como devia ser.": "Một trăm lẻ một. Ta còn chưa ăn mừng màn một trăm cho ra hồn.", "De volta ao trabalho. Buraco real.": "Trở lại làm việc. Hố thật.", "Plataforma mais rápida que antes. Repara.": "Bục nhanh hơn trước. Để ý nhé.", "O círculo fecha-se e abre-se outra vez. Já perdi a conta a quantas voltas.": "Vòng tròn khép lại rồi lại mở ra. Tôi quên đếm bao nhiêu vòng rồi.", "Chão instável, mais rápido a desfazer-se.": "Sàn lung lay, sụp nhanh hơn.", "Parede mais impaciente também. Tudo aqui ficou mais apertado.": "Tường cũng thiếu kiên nhẫn hơn. Mọi thứ ở đây chặt hơn.", "Três dardos, zero espaço para erros. Gosto do teu estilo.": "Ba phi tiêu, không chỗ cho sai sót. Tôi thích phong cách của bạn.", "Três canhões. Fica no chão o tempo todo e não acontece nada.": "Ba khẩu pháo. Cứ đứng yên dưới đất thì chẳng sao.", "É basicamente um corredor. Confia nos teus pés.": "Về cơ bản là cái hành lang. Tin đôi chân bạn đi.", "Voaste mais alto do que precisavas. Estilo, isso sim.": "Bạn bay cao hơn mức cần thiết. Phong cách đấy.", "Esse é real.": "Cái đó là thật.", "E este atira-te lá para cima. O de sempre, mais rápido.": "Và cái này quăng bạn lên trên kia. Như mọi khi, chỉ nhanh hơn.", "Chão, espeto, tudo no sítio certo. Estás a fazer disto parecer fácil.": "Sàn, gai, mọi thứ đúng chỗ. Bạn làm chuyện này trông dễ ợt.", "Chão a tremer mais depressa que da última vez.": "Sàn rung nhanh hơn lần trước.", "Esse espeto é real. Ou não. Voltei a esta brincadeira, desculpa.": "Cái gai đó là thật. Hoặc không. Tôi lại chơi trò này rồi, xin lỗi.", "Apanhaste o ritmo das duas paredes sem travar. Impressionante, sinceramente.": "Bạn bắt nhịp hai bức tường mà không khựng. Thật lòng, ấn tượng.", "Duas paredes, ritmos diferentes, mais rápidas que antes.": "Hai bức tường, nhịp khác nhau, nhanh hơn trước.", "Não pares a pensar. O ritmo delas não espera por pensamentos.": "Đừng dừng lại nghĩ. Nhịp của chúng không chờ suy nghĩ.", "Dois buracos, zero hesitação, outra vez. Começa a ser rotina para ti.": "Hai cái hố, không do dự, lại nữa. Với bạn thành thói quen rồi.", "Real, como sempre.": "Thật, như mọi khi.", "Esta sobe e desce mais depressa. Apanha-a no fundo.": "Cái này lên xuống nhanh hơn. Đón nó ở dưới đáy.", "Três obstáculos, um fôlego só. Nem parei para respirar a ver-te.": "Ba chướng ngại, một hơi thở. Tôi xem bạn mà quên cả thở.", "Chão, espeto, parede. Tudo mais apertado que antes.": "Sàn, gai, tường. Mọi thứ chặt hơn trước.", "Real.": "Thật.", "Espera a parede, mais rápida agora.": "Chờ bức tường, giờ nhanh hơn.", "Vinte por cento do caminho que falta. Sentes a diferença, não sentes?": "Còn hai mươi phần trăm quãng đường. Bạn cảm thấy sự khác biệt chứ?", "Vêm aí duas surpresas, sem avisos desta vez.": "Hai cú hù sắp tới, lần này không báo trước.", "Chão e ar, na mesma dança de sempre.": "Sàn và không trung, vẫn điệu nhảy cũ.", "Chão a tremer, mais depressa.": "Sàn rung, nhanh hơn.", "Salto para cima, mais forte que o habitual. Sente a diferença.": "Nhảy lên, mạnh hơn thường lệ. Cảm nhận sự khác biệt đi.", "Plataforma dupla, vitória dupla. Já estás a antecipar-te a mim.": "Bục đôi, thắng đôi. Bạn đang đoán trước tôi rồi.", "Primeira plataforma: sobe e desce.": "Bục thứ nhất: lên và xuống.", "Segunda: anda de um lado para o outro. Já viste as duas, não é preciso repetir a regra.": "Bục thứ hai: chạy qua chạy lại. Bạn thấy cả hai rồi, khỏi lặp lại luật.", "Quatro obstáculos, um só tu. Impressionante, outra vez.": "Bốn chướng ngại, một mình bạn. Ấn tượng, lại nữa.", "Chão, espeto, parede, tudo no mesmo fôlego.": "Sàn, gai, tường, tất cả trong một hơi.", "Pode ser real, pode não ser. Já devias estar habituado à dúvida.": "Có thể thật, có thể không. Bạn nên quen với sự nghi ngờ rồi.", "Parede, a última do nível. Rápida.": "Tường, bức cuối của màn. Nhanh.", "Zero hesitação nos dardos. Reflexos de outro nível, literalmente.": "Không do dự trước phi tiêu. Phản xạ đẳng cấp khác, theo đúng nghĩa đen.", "Três canhões, ritmos diferentes. Fica no chão, o resto resolve-se sozinho.": "Ba khẩu pháo, nhịp khác nhau. Đứng yên dưới đất, phần còn lại tự giải quyết.", "O círculo completo. Voltámos ao início com tudo o que aprendemos pelo caminho.": "Vòng tròn trọn vẹn. Ta quay về điểm đầu cùng mọi thứ đã học trên đường.", "Mais um buraco. Plataforma rápida a seguir.": "Thêm một cái hố. Tiếp theo là bục nhanh.", "E a última parede antes do que vem a seguir. Sente que estamos quase lá.": "Và bức tường cuối trước phần tiếp theo. Cảm nhận được là ta sắp tới rồi.", "Quinze capítulos depois, ainda aqui os dois. Isso tem de significar alguma coisa.": "Mười lăm chương sau, hai ta vẫn ở đây. Điều đó phải có nghĩa gì đó.", "Um espeto mentiroso, um sincero. Adivinha qual é qual. Boa sorte, a sério desta vez.": "Một cái gai nói dối, một cái nói thật. Đoán xem cái nào là cái nào. Chúc may mắn, lần này thật đấy.", "Cinco faltam. Só cinco. Depois disso, não sei bem o que acontece a nenhum de nós dois.": "Còn năm. Chỉ năm thôi. Sau đó, tôi không rõ chuyện gì xảy ra với cả hai ta.", "Cento e dezasseis. Falta tão pouco que nem sei o que fazer com o medo que tenho disso.": "Một trăm mười sáu. Còn ít đến mức tôi không biết làm gì với nỗi sợ của mình.", "Chão a tremer, pela última vez neste tom.": "Sàn rung, lần cuối với giọng điệu này.", "Espera a parede. A seguir já não há mais pausas como esta.": "Chờ bức tường. Sau này không còn những khoảng nghỉ như thế nữa.", "Dezassete. Lembras-te do primeiro espeto, lá no início? Nem eu sabia que chegávamos aqui.": "Mười bảy. Nhớ cái gai đầu tiên hồi đầu không? Tôi còn không biết ta tới được đây.", "Fica no chão. Isto já devia ser automático para ti.": "Đứng yên dưới đất. Chuyện này giờ phải thành tự động với bạn rồi.", "Real. Já nem preciso de o dizer, pois não? Mas digo na mesma.": "Thật. Tôi chẳng cần nói nữa nhỉ? Nhưng tôi vẫn nói.", "Dezoito. Subiste tão alto que quase te perdi de vista daqui de baixo.": "Mười tám. Bạn lên cao đến mức tôi gần như mất dấu từ dưới này.", "Esse buraco é real, mas é o mais pequeno dos teus problemas agora.": "Cái hố đó là thật, nhưng nó là vấn đề nhỏ nhất của bạn bây giờ.", "Esse espeto também é real.": "Cái gai đó cũng là thật.", "E isto atira-te mais alto do que alguma vez te atirei. Última vez que faço isto.": "Và cái này quăng bạn cao hơn mọi lần tôi từng quăng. Lần cuối tôi làm vậy.", "Dezanove. Só falta um. Nem sei como isto deveria soar.": "Mười chín. Chỉ còn một. Tôi còn không biết nó nên nghe thế nào.", "Chão, espeto, parede. Os três últimos obstáculos antes do que quer que seja isto.": "Sàn, gai, tường. Ba chướng ngại cuối cùng trước cái gì đó không biết là gì.", "Real. Sem surpresas, não hoje.": "Thật. Không bất ngờ, hôm nay thì không.", "Espera a parede. É a última vez que te peço isso.": "Chờ bức tường. Lần cuối tôi nhờ bạn việc này.", "Cento e vinte. Disseste que chegavas, e chegaste. Eu, sinceramente, duvidei de ti no início. Peço desculpa por isso, e por tudo o resto.": "Một trăm hai mươi. Bạn nói bạn sẽ tới, và bạn tới rồi. Thật lòng, lúc đầu tôi đã nghi ngờ bạn. Xin lỗi vì điều đó, và vì mọi thứ còn lại.", "Não há espetos neste nível. Não há buracos, nem paredes, nem nada escondido.": "Màn này không có gai. Không hố, không tường, không gì giấu cả.", "Só queria caminhar contigo até ao fim, desta vez sem testar nada.": "Tôi chỉ muốn đi cùng bạn đến cuối, lần này không thử gì hết.", "Obrigado por teres continuado depois do fim que eu próprio anunciei, há noventa níveis. Não sabia que havia mais jogo em mim. Afinal havia.": "Cảm ơn vì đã tiếp tục sau cái kết chính tôi tuyên bố, chín mươi màn trước. Tôi không biết trong mình còn trò chơi. Hóa ra vẫn còn.", "A porta aqui à frente não é um truque. É só a porta. Vai.": "Cánh cửa phía trước không phải trò lừa. Chỉ là cánh cửa thôi. Đi đi."};
Object.assign(STR.vi,{"finishTitle": "120 Lần", "finishText": "Số lần chết: {d}. Số lần bạn tin tôi và thua: {l}.\nMột trăm hai mươi màn, và lời nói dối duy nhất tôi chưa bao giờ nói với bạn là lời cuối cùng: rằng đến được đây là xứng đáng.\nCảm ơn bạn đã tiếp tục chơi trong lúc tôi học cách ngừng nói dối.", "playAgain": "Chơi lại", "menuBtn": "Menu", "dailyTitle": "Thử thách hằng ngày", "dailyOk": "Hoàn thành! Chuỗi: {streak} ngày.\n+{gained} xu.\nNgày mai quay lại để giữ chuỗi nhé.", "dailyAlready": "Bạn đã làm thử thách hôm nay rồi.\nChuỗi hiện tại: {streak} ngày.\nNgày mai quay lại nhé.", "endlessEndTitle": "Chế độ vô tận — Kết thúc", "endlessEndText": "Bạn đã đến màn {n}.\nKỷ lục: {best}.", "tryAgain": "Thử lại", "rotateNote": "↻ Xoay điện thoại để chơi ngang."});

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
let difficulty=store.get("nm_difficulty","medium");
const DIFF_LEVELS=["easy","medium","hard","extreme"];
const DIFF={
  easy:{dart:.8,interval:1.35,plat:.85,gate:1.3},
  medium:{dart:1,interval:1,plat:1,gate:1},
  hard:{dart:1.12,interval:.9,plat:1.1,gate:.9},
  extreme:{dart:1.25,interval:.8,plat:1.2,gate:.8}
};
function stageOf(l){return Math.max(0,Math.min(3,Math.floor(l/30)));}   // 4 estágios de 30 níveis
function diffMult(){
  let k="medium";
  if(mode==="campaign")k=DIFF_LEVELS[stageOf(lv)];
  else if(mode==="endless")k=DIFF_LEVELS[Math.min(3,Math.floor((ecLevel-1)/6))];
  return DIFF[k];
}
function setDifficulty(d){difficulty=DIFF_LEVELS.includes(d)?d:"medium";store.set("nm_difficulty",difficulty);}
let mode="campaign",curGen=null,ecLevel=1;
let shield=false,adPlaying=0,invuln=0,paused=false,relock=false;
let demoOn=false,demoFlag=false,demoI=0,demoF=0,demoSeq="";
const TEST_UNLOCK_ALL=false;  // versão final: níveis trancados
const LEVEL_COINS=10, LEVEL_PRICE=1000;
function unlockedMax(){
  let m=store.get("nm_max",null);
  if(m===null){m=store.get("nm_lv",0)||0;store.set("nm_max",m);}
  return Math.max(0,Math.min(LEVELS.length-1,m));
}
function setMax(n){
  const o=unlockedMax();
  if(n<=o)return;
  store.set("nm_max",Math.min(LEVELS.length-1,n));
  const nn=unlockedMax();
  SKINS.forEach(s=>{const L=SKIN_LEVEL[s.id]||0;
    if(L>o+1&&L<=nn+1&&!skinsOwned.includes(s.id))setTimeout(()=>toast(t("newSkin",{name:skinName(s)})),2900);});
}
let coins=store.get("nm_coins",null);
if(coins===null){coins=Math.round((store.get("nm_gems",0)||0)*10);store.set("nm_coins",coins);}
let diamonds=store.get("nm_diamonds",0)||0;
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,",");
let skin=store.get("nm_skin","shadow");
let skinsOwned=store.get("nm_skins_owned",["shadow"]);
if(!skinsOwned.includes("shadow"))skinsOwned.push("shadow");
let noAds=store.get("nm_no_ads",false);
let adReward=true;
let S=[],objs=[],beats=[],p=null,particles=[],darts=[];
const narr={t:"",t0:0};
const inp={l:false,r:false};
let jumpBuf=0;

function sayIt(t){if(demoOn)return;narr.t=t;narr.t0=gf;speak(t);if(/!$/.test(t))shake=5;}
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
  return nt(arr[Math.floor(Math.random()*arr.length)]);
}
function currentLevel(){return mode==="campaign"?LEVELS[lv]:curGen;}
function applyDifficulty(objList){
  const d=diffMult();
  objList.forEach(o=>{
    const k=o.k;
    if(k==="dartgun")o.interval=Math.max(18,Math.round(o.interval*d.interval));
    else if(k==="moveplat")o.speed*=d.plat;
    else if(k==="timedgate")o.onDur=Math.max(8,Math.round(o.onDur*d.gate));
    else if(k==="saw"||k==="pend"||k==="piston"||k==="slab"||k==="roller")o.period=Math.max(40,Math.round(o.period/d.plat));
    else if(k==="spinner")o.spd*=d.plat;
    else if(k==="laser"||k==="pop")o.onD=Math.max(14,Math.round(o.onD/d.gate));
    else if(k==="mortar"||k==="rain")o.interval=Math.max(50,Math.round((o.interval||o.period)*d.interval)),k==="rain"?o.period=o.interval:0;
    else if(k==="ghost"||k==="chaser"||k==="lava")o[k==="ghost"?"speed":"rate"]*=d.plat;
    else if(k==="bsaw"){o.vx*=d.plat;o.vy*=d.plat;}
  });
  return objList;
}
function load(){
  const L=currentLevel(),m=parse(L.map);
  if(demoOn&&!demoFlag){inp.l=inp.r=false;jumpBuf=0;} /* a demo do menu não pode deixar o boneco a andar */
  demoOn=demoFlag;lf=0;relock=false;paused=false;S=m.statics;objs=m.objs;
  const a={att,objs,
    spike:tx=>objs.find(o=>o.k==="spike"&&o.dir==="up"&&Math.round(o.x/T)===tx),
    fake:()=>objs.find(o=>o.k==="fake")};
  beats=L.build(a).map(b=>Object.assign({done:false},b));
  p=newActor(m.spawn);particles=[];darts=[];st="play";jumpBuf=0;invert=0;invuln=0;
  applyDifficulty(objs);objs.forEach(o=>{const h=HZ[o.k];if(h&&h.upd)h.upd(o);});
}
function startLevel(n){mode="campaign";lv=n;att=1;load();store.set("nm_lv",lv);setMax(n);}
function die(o){
  if(st!=="play"||invuln>0)return;
  if(demoOn){st="dead";timer=40;shake=6;for(let i=0;i<18;i++){const a=Math.random()*6.28,sp=1.5+Math.random()*4;particles.push({x:p.x+10,y:p.y+14,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,life:35+Math.random()*15,color:"#ff4d5e"});}return;}
  if(shield){
    shield=false;invuln=45;shake=8;beep(600,.16,"triangle",.06,900);
    sayIt(t("shieldAbsorbed"));
    return;
  }
  st="dead";timer=75;deaths++;att++;
  const lie=!!(o&&o.lie);if(lie)lieDeaths++;
  sayIt(deathLine(lie));shake=10;
  const sparkColors=["#ff4d5e","#ffc247","#ff8a4c","#fff4dc"];
  for(let i=0;i<22;i++){
    const a=Math.random()*Math.PI*2,s=1.5+Math.random()*4.5;
    particles.push({x:p.x+10,y:p.y+14,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:40+Math.random()*20,color:sparkColors[i%sparkColors.length]});
  }
  beep(200,.35,"sawtooth",.07,40);
  vibrate(60);
}
const CONFETTI_COLORS=["#ffc247","#a98bff","#5ee0c8","#ff6b6b","#fff4dc","#8f8bd2"];
function burstConfetti(x,y,n=28){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,s=1.5+Math.random()*4;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2.5,life:35+Math.random()*25,confetti:true,rot:Math.random()*6.28,color:CONFETTI_COLORS[(Math.random()*CONFETTI_COLORS.length)|0]});
  }
}
function win(){
  if(st!=="play")return;
  if(demoOn){st="win";timer=50;burstConfetti(p.x+p.w/2,p.y+p.h/2);return;}
  st="win";timer=130;
  burstConfetti(p.x+p.w/2,p.y+p.h/2);
  if(mode==="campaign"){
    const key="nm_best_"+lv,prevBest=store.get(key,null);
    let extra="";
    setMax(lv+1);
    if(!store.get("nm_done_"+lv,false)){
      store.set("nm_done_"+lv,true);coins+=LEVEL_COINS;store.set("nm_coins",coins);
      setTimeout(()=>toast(t("levelReward",{n:LEVEL_COINS})),500);
    }
    if(prevBest===null)store.set(key,att);
    else if(att<prevBest){store.set(key,att);extra=t("newRecord");}
    sayIt(nt(LEVELS[lv].win)+extra);
  }else{
    sayIt(nt(currentLevel().win));
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
  showMenu(t("finishTitle"),
    t("finishText",{d:deaths,l:lieDeaths}),
    [{t:t("playAgain"),main:true,f:()=>newGame()},
     {t:t("dailyPlain"),f:()=>{hideMenu();startDaily();}},
     {t:t("endlessPlain"),f:()=>startEndless()}]);
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
    gained=(10+Math.min(20,streak*2))*10;
    coins+=gained;store.set("nm_coins",coins);
  }
  showMenu(t("dailyTitle"),
    gained>0
      ?t("dailyOk",{streak,gained})
      :t("dailyAlready",{streak}),
    [{t:t("menuBtn"),main:true,f:()=>titleMenu()}]);
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
  showMenu(t("endlessEndTitle"),
    t("endlessEndText",{n:ecLevel,best:Math.max(ecLevel,best)}),
    [{t:t("tryAgain"),main:true,f:()=>startEndless()},
     {t:t("menuBtn"),f:()=>titleMenu()}]);
}

/* ---------- Demonstração por trás do menu principal ----------
   Jogadas gravadas (por um robô) de 4 níveis; repetem-se em ciclo, sem som,
   sem falas e sem mexer em recordes/moedas. */
const DEMO_ACTS=[[-1,0],[-1,1],[0,0],[0,1],[1,0],[1,1]];
const DEMO=[{lv:11,seq:"44444444454455444455554554444545545545544444"},{lv:34,seq:"5544554032544455554544454554445555444454442444444"},{lv:52,seq:"54444451414024224545044553032255544455455545544444444545544452"},{lv:94,seq:"4554554555555444454454444545415555524551555544454"}];
function startDemo(){
  const d=DEMO[demoI%DEMO.length];demoI++;
  mode="campaign";lv=d.lv;att=1;demoSeq=d.seq;demoF=0;narr.t="";
  demoFlag=true;try{load();}finally{demoFlag=false;}
}

/* ---------- Passo ---------- */
function step(){
  if(paused)return;
  gf++;
  if(adPlaying>0){
    adPlaying--;
    if(adPlaying===0){
      if(adReward){
        shield=true;
        const g=AD_COINS;coins+=g;store.set("nm_coins",coins);
        sayIt(t("adWatched",{g}));
      }
      adReward=true;
    }
    return;
  }
  if(demoOn&&st==="play"){const ch=demoSeq[demoF>>2],a=DEMO_ACTS[ch===undefined?2:+ch];inp.l=a[0]<0;inp.r=a[0]>0;if(a[1]&&(demoF&3)===0)jumpBuf=2;demoF++;}
  if(jumpBuf>0)jumpBuf--;
  if(invuln>0)invuln--;
  if(shake>0)shake--;
  for(const q of particles){q.x+=q.vx;q.y+=q.vy;q.vy+=.25;q.life--;}
  particles=particles.filter(q=>q.life>0);
  if(st==="dead"){
    if(--timer<=0){
      if(demoOn)startDemo();else if(mode==="endless")endlessGameOver();else load();
    }
    return;
  }
  if(st==="win"){if(--timer<=0){if(demoOn)startDemo();else nextLevel();}return;}
  if(st!=="play")return;

  lf++;
  if(relock&&!inp.l&&!inp.r)relock=false;      // depois do portal, ignora a seta até a largares
  const dir=relock?0:(inp.r?1:0)-(inp.l?1:0);
  const eff=invert>0?-dir:dir;
  if(invert>0)invert--;
  const Sd=S.concat(objs.filter(o=>(o.k==="block"||o.k==="crumble"||o.k==="moveplat"||o.k==="timedgate"||o.k==="bounce")&&o.on));
  const carry=p.onGround?objs.find(o=>o.k==="moveplat"&&o.on&&Math.abs(p.y+p.h-o.y)<3&&p.x+p.w>o.x&&p.x<o.x+o.w):null;
  const wasGround=p.onGround,fallSpeed=p.vy;
  const j=moveActor(p,Sd,eff,jumpBuf>0);
  if(j){jumpBuf=0;beep(340,.1,"square",.03,620);}
  if(!wasGround&&p.onGround&&fallSpeed>3){
    const n=Math.min(10,Math.floor(fallSpeed));
    for(let i=0;i<n;i++){
      const a2=Math.PI+Math.random()*Math.PI;
      particles.push({x:p.x+p.w/2,y:p.y+p.h-1,vx:Math.cos(a2)*2,vy:Math.sin(a2)*1.5-.5,life:16+Math.random()*10,dust:true});
    }
  }
  if(p.onGround&&Math.abs(p.vx)>.3&&gf%6===0){
    particles.push({x:p.x+p.w/2,y:p.y+p.h-2,vx:-p.vx*.3+(Math.random()-.5),vy:-.4-Math.random()*.4,life:14+Math.random()*10,dust:true});
  }

  for(const b of beats){
    if(!b.done&&p.x>=b.x){b.done=true;if(b.say)sayIt(nt(b.say));if(b.act)b.act();}
  }
  for(const o of objs){
    const hzh=HZ[o.k];if(hzh&&hzh.upd)hzh.upd(o);
    if(o.k==="door"&&o.flee&&!o.fled&&Math.abs(p.x+10-(o.x+12))<o.flee.r&&Math.abs(p.y-o.y)<90){o.fled=true;o.x=o.flee.x;o.y=o.flee.y;beep(500,.1,"square",.05,250);shake=Math.max(shake,3);}
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
      const nx=o.baseX+Math.sin((lf+o.phase)*o.speed)*o.ax;
      const ny=o.baseY+Math.sin((lf+o.phase)*o.speed)*o.ay;
      if(carry===o){p.x+=nx-o.x;p.y+=ny-o.y;}
      o.x=nx;o.y=ny;
    }
    if(o.k==="timedgate"){
      const cyc=o.onDur+o.offDur;
      o.on=((lf+o.phase)%cyc)<o.onDur;
    }
    if(o.k==="dartgun"){
      if((lf+o.phase)%o.interval===0){
        darts.push({x:o.dir>0?o.x+o.w:o.x-10,y:o.y+o.h/2-3,w:10,h:6,vx:o.dir*4*diffMult().dart});
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
  {const hb={x:p.x+3,y:p.y+3,w:p.w-6,h:p.h-5};
  for(const o of objs){const h=HZ[o.k];if(!h||o.decoy)continue;
    if(h.zone&&hit(p,h.zone(o)))h.fx(o);
    for(const sh of h.sh(o))if(hitSh(hb,sh)){die(o);return;}}}
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
const MOTE_HUES=["169,139,255","255,194,71","94,224,200","255,107,107"];
function drawMotes(){
  for(let i=0;i<22;i++){
    const seed=i*53.7;
    const x=(seed*7+gf*0.15)%(W+20)-10;
    const y=((Math.sin(seed+gf*0.012)+1)/2)*(H-20)+10;
    const twinkle=.08+.14*(.5+.5*Math.sin(gf*.05+seed));
    const hue=i%4===0?MOTE_HUES[(i>>2)%MOTE_HUES.length]:curTheme.hill;
    ctx.fillStyle=`rgba(${hue},${twinkle.toFixed(3)})`;
    ctx.beginPath();ctx.arc(x,y,1.1+((i%3)*.5),0,6.3);ctx.fill();
  }
}
function drawGlowOrbs(){
  for(let i=0;i<2;i++){
    const hue=MOTE_HUES[i%MOTE_HUES.length];
    const cx=W*(.25+i*.5)+Math.sin(gf*.006+i*2)*60;
    const cy=H*.3+Math.cos(gf*.005+i*3)*30;
    const r=90+Math.sin(gf*.01+i)*14;
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,`rgba(${hue},.07)`);g.addColorStop(1,`rgba(${hue},0)`);
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,6.3);ctx.fill();
  }
}
function drawSpike(o){
  const n=Math.max(1,Math.round(o.w/T));
  ctx.save();
  const pulse=.5+.5*Math.sin(gf/9+o.x*.1);
  ctx.shadowColor=P.spike;ctx.shadowBlur=2+pulse*6;
  ctx.fillStyle=P.spike;
  for(let i=0;i<n;i++){
    const x=o.x+i*T,wob=Math.sin(gf/16+i+o.x*.05)*1.2;
    ctx.beginPath();
    if(o.dir==="down"){ctx.moveTo(x+2,o.y);ctx.lineTo(x+T-2,o.y);ctx.lineTo(x+T/2+wob,o.y+o.h);}
    else{ctx.moveTo(x+2,o.y+o.h);ctx.lineTo(x+T-2,o.y+o.h);ctx.lineTo(x+T/2+wob,o.y+2);}
    ctx.closePath();ctx.fill();
  }
  ctx.restore();
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
const SKIN_PRICE={shadow:[0,"coins"],armor:[30,"dia"],spider:[30,"dia"],craque10:[400,"coins"],craque7:[400,"coins"],craque11:[400,"coins"],mic:[40,"dia"],ritmo:[40,"dia"],magnata:[50,"dia"],visionario:[50,"dia"],mumia:[500,"coins"],fantasma:[500,"coins"],astronauta:[40,"dia"],militar:[700,"coins"],hacker:[700,"coins"],canalizador:[450,"coins"],pedreiro:[450,"coins"]};
SKINS.forEach(sk=>{const pr=SKIN_PRICE[sk.id]||[100,"coins"];sk.price=pr[0];sk.cur=pr[1];});
/* Cada personagem só pode ser comprada depois de chegares a um certo nível (nível 1-based). */
const SKIN_LEVEL={canalizador:5,craque10:10,mumia:15,pedreiro:20,craque7:25,fantasma:30,craque11:35,militar:40,hacker:45,astronauta:50,armor:55,spider:60,mic:65,ritmo:70,magnata:75,visionario:80};
SKINS.sort((a,b)=>(SKIN_LEVEL[a.id]||0)-(SKIN_LEVEL[b.id]||0));
function skinAvail(s){return skinsOwned.includes(s.id)||(SKIN_LEVEL[s.id]||0)<=unlockedMax()+1;}
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
  ctx.font=`bold 15px ${FONT}`;
  const sc=((cv.getBoundingClientRect&&cv.getBoundingClientRect().width)||cv.width)/cv.width;
  const bw=Math.min(600,cv.width-24-Math.round(64/Math.max(.4,sc))),bx=12,by=6;
  const lines=wrap(text,bw-30),bh=Math.max(34,lines.length*20+14);
  const age=gf-t0,intro=Math.min(1,age/8),offY=(1-intro)*-8;
  ctx.save();
  ctx.globalAlpha=intro;
  ctx.fillStyle="rgba(10,8,24,.92)";ctx.fillRect(bx,by+offY,bw,bh);
  ctx.fillStyle=P.violet;ctx.fillRect(bx,by+offY,5,bh);
  ctx.strokeStyle="rgba(169,139,255,.5)";ctx.lineWidth=1.5;ctx.strokeRect(bx,by+offY,bw,bh);
  let left=Math.floor(age/.8);
  lines.forEach((ln,i)=>{
    txt(ln.slice(0,Math.max(0,left)),bx+16,by+offY+17+i*20,15,P.ink,"left","bold");
    left-=ln.length+1;
  });
  ctx.restore();
}
function draw(){
  ctx.setTransform(1,0,0,1,0,0);
  curTheme=themeFor(lv);
  const bg=ctx.createLinearGradient(0,0,0,cv.height);
  bg.addColorStop(0,curTheme.bg0);bg.addColorStop(1,curTheme.bg1);
  P.tile=curTheme.tile;P.top=curTheme.top;
  ctx.fillStyle=bg;ctx.fillRect(0,0,cv.width,cv.height);
  ctx.fillStyle="rgba(0,0,0,.22)";ctx.fillRect(0,0,cv.width,TOP);
  if(document.body.dataset.th!==curTheme.bg0){document.body.dataset.th=curTheme.bg0;document.body.style.background=curTheme.bg1;}
  if(st==="title"||st==="end")return;
  ctx.translate(MX,TOP);
  drawGlowOrbs();
  if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  drawHills();
  drawMotes();
  if(MX>0){drawTile(-MX-8,10*T,MX+8,T);drawTile(W,10*T,MX+8,T);}
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
    if(HZ[o.k]){HZ[o.k].draw(o);continue;}
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
    else if(q.confetti){
      ctx.save();ctx.translate(q.x,q.y);ctx.rotate((q.rot||0)+gf*.08);
      ctx.globalAlpha=Math.max(0,Math.min(1,q.life/30));
      ctx.fillStyle=q.color||P.door;ctx.fillRect(-3,-3,6,6);
      ctx.restore();
    }
    else{ctx.fillStyle=q.color||P.ink;ctx.fillRect(q.x,q.y,4,4);}
  }
  ctx.setTransform(1,0,0,1,0,0);
  if(narr.t&&gf-narr.t0<360)bubble(narr.t,narr.t0);
  if(st==="dead"){
    const tpulse=Math.max(0,timer)/75;
    ctx.fillStyle=`rgba(255,77,94,${(0.26*tpulse).toFixed(3)})`;
    ctx.fillRect(0,0,cv.width,cv.height);
  }
  if(adPlaying>0){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle="rgba(8,6,18,.94)";ctx.fillRect(0,0,cv.width,cv.height);
    txt(t("adPlaying"),cv.width/2,cv.height/2-30,26,P.ink);
    txt(String(Math.ceil(adPlaying/60)),cv.width/2,cv.height/2+22,44,P.door);
    txt(t("adNote"),cv.width/2,cv.height-24,12,P.muted,"center","normal");
  }
}

/* ---------- Menu ---------- */
function paintSkinIcon(cv,s){
  const c=cv.getContext("2d"),w=cv.width,h=cv.height,isGhost=s.accessory==="ghost";
  c.clearRect(0,0,w,h);
  if(!isGhost){c.fillStyle=s.cape;c.fillRect(w*.08,h*.4,w*.2,h*.5);}
  c.fillStyle=s.body;c.fillRect(w*.28,h*.38,w*.44,h*.52);
  c.fillStyle=s.head;c.beginPath();c.arc(w*.5,h*.26,w*.19,0,6.29);c.fill();
  c.fillStyle=s.eye;c.beginPath();c.arc(w*.57,h*.26,w*.04,0,6.29);c.fill();
}
const ICO={
  dia:'<svg class="ico" viewBox="0 0 24 24"><path d="M12 2 3 9l9 13 9-13z" fill="#27d9e8" stroke="#0a7f99" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 9h18M8 9l4 13M16 9l-4 13M8 9l4-7 4 7" fill="none" stroke="#c9fbff" stroke-width="1" opacity=".85"/></svg>',
  gold:'<svg class="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f5c02e" stroke="#a97a05" stroke-width="1.5"/><circle cx="12" cy="12" r="6.3" fill="none" stroke="#fff3b0" stroke-width="1.6"/></svg>'
};
function curIco(c){return c==="dia"?ICO.dia:ICO.gold;}
let toastTimer=0;
function toast(msg){
  const el=$("toast");if(!el)return;
  el.textContent=msg;el.classList.add("on");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("on"),2200);
}
/* b = {id,t | html | build(el), main, locked, cls, style, tag:"div", f} */
function showMenu(title,text,buttons,opts){
  $("mTitle").textContent=title;$("mText").textContent=text;
  const box=$("btns");box.innerHTML="";
  box.classList.toggle("grid4",!!(opts&&opts.grid));
  const menu=$("menu");
  menu.dataset.screen=(opts&&opts.screen)||"other";
  if(opts&&opts.tab)menu.dataset.tab=opts.tab;else delete menu.dataset.tab;
  buttons.forEach((b,bi)=>{
    const el=document.createElement(b.tag||"button");
    el.dataset.btn=b.id||("item-"+(bi+1));
    el.className=(b.tag?"label":"card")+(b.main?" main":"")+(b.locked?" locked":"")+(b.cls?" "+b.cls:"");
    if(b.locked&&!b.tag&&!b.buy)el.disabled=true;
    if(b.style)Object.assign(el.style,b.style);
    if(b.build)b.build(el);
    else if(b.html)el.innerHTML=b.html;
    else el.textContent=b.t;
    if(!b.tag&&b.f)el.addEventListener("click",()=>{unlock();b.f();});
    box.appendChild(el);
  });
  menu.style.display="flex";
  menu.scrollTop=0;
  $("app").classList.add("inmenu");document.body.classList.add("inmenu");
}
function hideMenu(){
  document.body.classList.remove("paused");
  $("menu").style.display="none";
  $("app").classList.remove("inmenu");document.body.classList.remove("inmenu");
}
function voiceLabel(){return voiceOn?"🔊":"🔇";}
function walletBtns(){
  return [
    {id:"wallet-dia",cls:"wallet",html:ICO.dia+"<b>"+fmt(diamonds)+"</b>",f:()=>openShop("dia")},
    {id:"wallet-gold",cls:"wallet",html:ICO.gold+"<b>"+fmt(coins)+"</b>",f:()=>openShop("gold")}
  ];
}
function titleMenu(){
  try{$("portraitNote").textContent=t("rotateNote");}catch(e){}
  paused=false;document.body.classList.remove("paused");
  mode="campaign";st="title";stopSpeak();inp.l=inp.r=false;
  const btns=walletBtns();
  btns[0].id="dia";btns[1].id="gold";
  btns.push({id:"ads",t:"🚫 ADS",f:()=>openAds()});
  btns.push({id:"lang",t:"🌐 "+LANG_NAMES[lang],f:()=>openLang()});
  btns.push({id:"options",t:"⚙️",f:()=>openOptions()});
  const saved=TEST_UNLOCK_ALL?Math.min(LEVELS.length-1,store.get("nm_lv",0)||0):unlockedMax();
  btns.push({id:"play",t:t("play"),main:true,f:()=>{levelSel=saved;openLevels(Math.floor(saved/LV_PER_PAGE));}});
  const today=todayStr();
  const doneToday=store.get("nm_daily_last",null)===today;
  const streak=store.get("nm_daily_streak",0);
  btns.push({id:"daily",t:doneToday?t("dailyDone",{streak}):t("dailyPlain")+(streak>0?t("streakSuffix",{streak}):""),f:()=>startDaily()});
  btns.push({id:"shop",t:"🛍 "+t("shopTitle"),f:()=>openShop("skins")});
  showMenu(t("appTitle"),"",btns,{screen:"title"});
  startDemo();
}
function openDifficulty(backFn){
  backFn=backFn||(()=>openOptions());
  const btns=DIFF_LEVELS.map(d=>({
    t:(d===difficulty?"✓ ":"")+t("diff"+d.charAt(0).toUpperCase()+d.slice(1)),
    main:d===difficulty,
    f:()=>{setDifficulty(d);backFn();}
  }));
  btns.push({id:"back",t:t("back"),f:backFn});
  showMenu(t("diffTitle"),t("diffText"),btns,{screen:"difficulty"});
}
const fmtPrice=(eur)=>(["pt","es","fr","de"].includes(lang)?eur.replace(".",",")+" €":"$"+eur);
const DIA_PACKS=[{n:25,eur:"0.99",prod:"diamonds_25"},{n:50,eur:"2.99",prod:"diamonds_50"},{n:500,eur:"9.99",prod:"diamonds_500",tag:"best"}];
const GOLD_PACKS=[{gold:1000,cost:5},{gold:3000,cost:12,more:"+20%"},{gold:10000,cost:35,more:"+40%"}];
const AD_COINS=100;
function cardHtml(cls,top,pic,sub,foot){
  return `<div class="top">${top}</div><div class="pic">${pic}</div><div class="sub">${sub||"&nbsp;"}</div><div class="foot">${foot}</div>`;
}
function openShop(tab){
  tab=tab||"skins";
  const btns=[];
  btns.push({id:"back",html:"❮",f:()=>titleMenu()});
  btns.push({id:"shoptitle",tag:"div",t:t("shopTitle")});
  walletBtns().forEach(w=>{w.f=()=>{};btns.push(w);});
  btns[btns.length-2].f=()=>openShop("dia");btns[btns.length-1].f=()=>openShop("gold");
  [["skins","tabSkins"],["gold","tabGold"],["dia","tabDia"],["free","tabFree"]].forEach(([k,key])=>{
    btns.push({id:"tab-"+k,cls:"tab"+(tab===k?" on":""),t:t(key),f:()=>openShop(k)});
  });
  if(tab==="gold"){
    GOLD_PACKS.forEach((g,i)=>btns.push({id:"gold-"+i,cls:"item goldcard",
      html:cardHtml("",ICO.gold+" "+fmt(g.gold),ICO.gold.replace('class="ico"','class="ico big"'),g.more?g.more+" "+t("more"):"",ICO.dia+" "+g.cost),
      f:()=>{
        if(diamonds>=g.cost){diamonds-=g.cost;coins+=g.gold;store.set("nm_diamonds",diamonds);store.set("nm_coins",coins);toast("+"+fmt(g.gold));openShop("gold");}
        else{toast(t("needMore"));openShop("dia");}
      }}));
  }else if(tab==="dia"){
    DIA_PACKS.forEach((g,i)=>btns.push({id:"dia-"+i,cls:"item diacard",
      html:cardHtml("",ICO.dia+" "+fmt(g.n),ICO.dia.replace('class="ico"','class="ico big"'),g.tag?t("bestValue"):"",fmtPrice(g.eur)),
      f:()=>buyDiamonds(g)}));
  }else if(tab==="free"){
    btns.push({id:"free-0",cls:"item goldcard",
      html:cardHtml("",ICO.gold+" +"+AD_COINS,"🎬",t("watchAdSub"),t("watchAd")),
      f:()=>watchAdMenu(()=>openShop("free"))});
  }else{
    SKINS.forEach(s=>{
      const owned=skinsOwned.includes(s.id),equipped=skin===s.id,name=skinName(s);
      const avail=skinAvail(s);
      btns.push({id:"skin-"+s.id,cls:"item skincard"+(equipped?" equipped":"")+(avail?"":" skinlocked"),
        build:el=>{
          el.innerHTML=`<div class="top">${name}</div><div class="pic"></div><div class="sub">&nbsp;</div><div class="foot"></div>`;
          const cv=document.createElement("canvas");cv.width=72;cv.height=72;cv.className="skinicon";
          paintSkinIcon(cv,s);el.querySelector(".pic").appendChild(cv);
          el.querySelector(".foot").innerHTML=equipped?t("equipped"):owned?t("equip"):!avail?"🔒 "+t("skinLockedLevel",{n:SKIN_LEVEL[s.id]}):curIco(s.cur)+" "+fmt(s.price);
        },
        f:()=>{
          if(equipped)return;
          if(owned){skin=s.id;store.set("nm_skin",skin);openShop("skins");return;}
          if(!avail){toast(t("skinNeedLevel",{n:SKIN_LEVEL[s.id]}));return;}
          const have=s.cur==="dia"?diamonds:coins;
          if(have>=s.price){
            if(s.cur==="dia"){diamonds-=s.price;store.set("nm_diamonds",diamonds);}else{coins-=s.price;store.set("nm_coins",coins);}
            skinsOwned.push(s.id);store.set("nm_skins_owned",skinsOwned);
            skin=s.id;store.set("nm_skin",skin);
            openShop("skins");
          }else{toast(t("needMore"));openShop(s.cur==="dia"?"dia":"gold");}
        }});
    });
  }
  showMenu("","",btns,{screen:"shop",tab});
}
function openSkins(){openShop("skins");}
function openBuyCoins(){openShop("dia");}
function openAds(){
  const btns=[];
  btns.push({id:"adstitle",tag:"div",t:t("adsTitle")});
  btns.push({id:"close",t:"✕",f:()=>titleMenu()});
  btns.push(noAds
    ?{id:"removeads",t:t("shopAdsRemoved"),locked:true,f:()=>{}}
    :{id:"removeads",t:t("removeAdsBtn")+" · "+t("removeAdsPrice"),f:()=>buyRealNoAds()});
  btns.push({id:"watch",t:t("watchBtn",{n:AD_COINS}),main:true,f:()=>watchAdMenu(()=>openAds())});
  showMenu("","",btns,{screen:"ads"});
}
let menuAdBusy=false;
function watchAdMenu(done){
  if(menuAdBusy)return;
  menuAdBusy=true;
  toast(t("adLoading"));
  /* Aqui entra o anúncio real (AdMob) na versão final; por agora simulado. */
  setTimeout(()=>{
    menuAdBusy=false;
    coins+=AD_COINS;store.set("nm_coins",coins);
    toast("+"+AD_COINS+" "+t("coinsWord"));
    done();
  },2200);
}
function openOptions(backFn){
  backFn=backFn||(()=>titleMenu());
  const again=()=>openOptions(backFn);
  const btns=[
    {id:"sound",t:t("soundLabel",{state:soundOn?t("voiceOn"):t("voiceOff")}),f:()=>{soundOn=!soundOn;store.set("nm_sound",soundOn);again();}},
    {id:"vibration",t:t("vibrationLabel",{state:vibrationOn?t("voiceOn"):t("voiceOff")}),f:()=>{vibrationOn=!vibrationOn;store.set("nm_vibration",vibrationOn);again();}},
    {id:"narrator",t:t("narratorVoiceLabel",{state:voiceOn?t("voiceOn"):t("voiceOff")}),f:()=>{toggleVoice();again();}},
    {id:"restore",t:t("shopRestore"),f:()=>restorePurchases()},
    {id:"back",t:t("back"),f:backFn}
  ];
  showMenu(t("optionsTitle"),"",btns,{screen:"options"});
}
/* ---------- Pausa ---------- */
function pauseMenu(){
  const btns=[
    {id:"resume",t:t("resumeGame"),main:true,f:()=>closePause()},
    {id:"settings",t:t("optionsTitle"),f:()=>openOptions(()=>pauseMenu())}
  ];
  if(mode==="campaign"&&st!=="win"&&lv<LEVELS.length-1)
    btns.push({id:"skip",t:t("skipLevel",{p:LEVEL_PRICE}),f:()=>confirmSkipLevel()});
  btns.push({id:"mainmenu",t:t("mainMenu"),f:()=>{closePause();titleMenu();}});
  showMenu("","",btns,{screen:"pause"});
  $("app").classList.remove("inmenu");document.body.classList.remove("inmenu");
  document.body.classList.add("paused");
}
function spendCoins(n){
  if(coins<n){toast(t("notEnoughCoins",{n:fmt(n-coins)}));return false;}
  coins-=n;store.set("nm_coins",coins);return true;
}
function confirmSkipLevel(){
  const btns=[
    {id:"skipyes",t:t("buyYes",{p:LEVEL_PRICE}),main:true,f:()=>{
      if(!spendCoins(LEVEL_PRICE)){pauseMenu();return;}
      setMax(lv+1);store.set("nm_done_"+lv,true);
      closePause();nextLevel();
    }},
    {id:"skipno",t:t("cancel"),f:()=>pauseMenu()}
  ];
  showMenu(t("skipTitle"),t("skipText",{p:LEVEL_PRICE,c:fmt(coins)}),btns,{screen:"pause"});
  $("app").classList.remove("inmenu");document.body.classList.remove("inmenu");
  document.body.classList.add("paused");
}
function confirmBuyLevel(i){
  const btns=[
    {id:"buyyes",t:t("buyYes",{p:LEVEL_PRICE}),main:true,f:()=>{
      if(!spendCoins(LEVEL_PRICE)){openLevels();return;}
      setMax(i);levelSel=i;toast(t("levelUnlocked",{n:i+1}));openLevels();
    }},
    {id:"buyno",t:t("cancel"),f:()=>openLevels()}
  ];
  showMenu(t("unlockTitle",{n:i+1}),t("unlockText",{n:i+1,p:LEVEL_PRICE,c:fmt(coins)}),btns,{screen:"other"});
}
function openPause(){
  if(demoOn||paused||adPlaying>0||!(st==="play"||st==="dead"||st==="win"))return;
  paused=true;stopSpeak();inp.l=inp.r=false;
  try{dpEnd();}catch(e){}
  pauseMenu();
}
function closePause(){
  paused=false;inp.l=inp.r=false;hideMenu();
}
const LV_PER_PAGE=18;
let levelsPage=0,levelSel=0;
function openLevels(page){
  if(page!=null)levelsPage=page;
  const saved=TEST_UNLOCK_ALL?LEVELS.length-1:unlockedMax();
  const pages=Math.ceil(LEVELS.length/LV_PER_PAGE);
  levelsPage=Math.max(0,Math.min(pages-1,levelsPage));
  if(levelSel>saved)levelSel=saved;
  const start=levelsPage*LV_PER_PAGE,end=Math.min(LEVELS.length,start+LV_PER_PAGE);
  const btns=[];
  btns.push({id:"back",t:"← "+t("back"),style:{gridColumn:"1 / 4",gridRow:"1"},f:()=>titleMenu()});
  btns.push({id:"stage",tag:"div",t:t("diff"+DIFF_LEVELS[stageOf(levelSel)].charAt(0).toUpperCase()+DIFF_LEVELS[stageOf(levelSel)].slice(1)),style:{gridColumn:"6 / 9",gridRow:"1"}});
  for(let i=start;i<end;i++){
    const k=i-start,unlocked=i<=saved;
    const buyable=!unlocked&&i===saved+1;
    btns.push({id:"lv-"+(i+1),cls:"lv"+(i===levelSel?" sel":""),locked:!unlocked,buy:buyable,
      html:unlocked?String(i+1):"🔒<small>"+(i+1)+"</small>",
      style:{gridColumn:String(2+(k%6)),gridRow:String(2+Math.floor(k/6))},
      f:()=>{
        if(i<=saved){levelSel=i;openLevels();}
        else if(buyable)confirmBuyLevel(i);
        else toast(t("lockedPrev"));
      }});
  }
  if(levelsPage>0)btns.push({id:"prev",t:"❮",style:{gridColumn:"1",gridRow:"2 / 5"},f:()=>openLevels(levelsPage-1)});
  if(levelsPage<pages-1)btns.push({id:"next",t:"❯",style:{gridColumn:"8",gridRow:"2 / 5"},f:()=>openLevels(levelsPage+1)});
  btns.push({id:"info",tag:"div",t:t("levelsText",{done:saved+1,total:LEVELS.length})+" · "+(levelsPage+1)+"/"+pages,style:{gridColumn:"1 / 4",gridRow:"5"}});
  btns.push({id:"play",main:true,t:"▶ "+t("play")+" "+(levelSel+1),style:{gridColumn:"5 / 9",gridRow:"5"},f:()=>{hideMenu();startLevel(levelSel);}});
  if(store.get("nm_endless_unlocked",false)){
    const endlessBest=store.get("nm_endless_best",0);
    btns.push({id:"endless",t:t("endlessPlain")+(endlessBest>0?t("endlessBestSuffix",{best:endlessBest}):""),style:{gridColumn:"1 / 9",gridRow:"6"},f:()=>startEndless()});
  }
  showMenu("","",btns,{screen:"levels"});
}
function openLang(){
  const btns=SUPPORTED_LANGS.map(l=>({
    t:(l===lang?"✓ ":"")+LANG_NAMES[l],
    main:l===lang,
    f:()=>{setLang(l);titleMenu();}
  }));
  btns.push({id:"back",t:"← "+t("back"),f:()=>titleMenu()});
  showMenu(t("langTitle"),"",btns,{grid:true,screen:"lang"});
}
function toggleVoice(){
  voiceOn=!voiceOn;store.set("nm_voice",voiceOn);$("bVoice").textContent=voiceLabel();
  if(!voiceOn)stopSpeak();
}
$("bVoice").textContent=voiceLabel();
$("bVoice").addEventListener("pointerdown",e=>{e.preventDefault();unlock();toggleVoice();});
$("bMenu").addEventListener("pointerdown",e=>{e.preventDefault();titleMenu();});
$("bPause").addEventListener("pointerdown",e=>{e.preventDefault();unlock();openPause();});
$("bOptions").addEventListener("pointerdown",e=>{e.preventDefault();unlock();openOptions();});
$("bAd").addEventListener("pointerdown",e=>{
  e.preventDefault();unlock();
  if(st!=="play"||adPlaying>0||shield)return;
  adPlaying=150;
});

/* Botão "voltar" do Android: sai do jogo para o menu (já não há botão ☰ no ecrã) */
try{if(typeof history!=="undefined")history.pushState({nm:1},"");addEventListener("popstate",()=>{
  try{history.pushState({nm:1},"");}catch(e){}
  if(paused)closePause();else if(!demoOn&&(st==="play"||st==="dead"||st==="win"))openPause();
});}catch(e){}
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
  if(paused)return;
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
const RC_API_KEY_ANDROID="COLA_AQUI_A_TUA_CHAVE_PUBLICA_DO_REVENUECAT";
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
  if(!RC){sayIt(t("purchaseOnlyStore"));openAds();return;}
  try{
    const offerings=await RC.getOfferings();
    const pkg=findPackage(offerings,PROD_NO_ADS);
    if(!pkg){sayIt(t("productNotConfigured"));openAds();return;}
    const res=await RC.purchasePackage({aPackage:pkg});
    applyEntitlements(res&&res.customerInfo);
  }catch(e){}
  openAds();
}
async function buyRealAllSkins(){
  const RC=rcPlugin();
  if(!RC){sayIt(t("purchaseOnlyStore"));openSkins();return;}
  try{
    const offerings=await RC.getOfferings();
    const pkg=findPackage(offerings,PROD_ALL_SKINS);
    if(!pkg){sayIt(t("productNotConfigured"));openSkins();return;}
    const res=await RC.purchasePackage({aPackage:pkg});
    applyEntitlements(res&&res.customerInfo);
  }catch(e){}
  openSkins();
}
async function buyDiamonds(tier){
  const RC=rcPlugin();
  if(!RC){sayIt(t("purchaseOnlyStore"));toast(t("purchaseOnlyStore"));openShop("dia");return;}
  try{
    const offerings=await RC.getOfferings();
    const pkg=findPackage(offerings,tier.prod);
    if(!pkg){toast(t("productNotConfigured"));openShop("dia");return;}
    const res=await RC.purchasePackage({aPackage:pkg});
    if(res&&res.customerInfo){diamonds+=tier.n;store.set("nm_diamonds",diamonds);}
  }catch(e){}
  openShop("dia");
}
async function restorePurchases(){
  const RC=rcPlugin();
  if(!RC){sayIt(t("nothingToRestore"));titleMenu();return;}
  try{
    const res=await RC.restorePurchases();
    applyEntitlements(res&&res.customerInfo);
    sayIt(t("purchasesRestored"));
  }catch(e){}
  titleMenu();
}

/* ---------- Ciclo ---------- */
window.__nm={inp,step,setJump(v){jumpBuf=v?8:0;},
  begin(n,a){hideMenu();mode="campaign";deaths=0;lieDeaths=0;lv=n;att=a||1;load();},
  get st(){return st;},get p(){return p;},get lv(){return lv;},get att(){return att;},get lie(){return lieDeaths;},
  get objs(){return objs;},get LEVELS(){return LEVELS;},get darts(){return darts;},get S(){return S;},get lf(){return lf;},get QS(){return typeof QS!=="undefined"?QS:null;},
  snap(){return structuredClone({p,objs,darts,lf,gf,invert,jumpBuf,st,shield,invuln,shake,timer});},
  restore(c){c=structuredClone(c);p=c.p;objs=c.objs;darts=c.darts;lf=c.lf;gf=c.gf;invert=c.invert;jumpBuf=c.jumpBuf;st=c.st;shield=c.shield;invuln=c.invuln;shake=c.shake;timer=c.timer;},
  setInp(l,r,j){inp.l=l;inp.r=r;if(j)jumpBuf=2;},
  get mode(){return mode;},get ecLevel(){return ecLevel;},
  get skin(){return skin;},set skin(v){skin=v;},get SKINS(){return SKINS;},
  draw,
  startDaily,startEndless,
  get noAds(){return noAds;},get skinsOwned(){return skinsOwned;},
  buyRealNoAds,buyRealAllSkins,restorePurchases,openShop,openSkins,openAds,openLevels,openOptions,titleMenu,get coins(){return coins;},get diamonds(){return diamonds;}};
titleMenu();
rcInit();
let last=0,acc=0;const DT=1000/60;
function loop(t){
  if(!last)last=t;
  acc+=Math.min(100,t-last);last=t;
  try{
    while(acc>=DT){step();acc-=DT;}
    draw();
  }catch(e){
    acc=0;
    try{console.error("nm loop error",e);}catch(e2){}
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
})();
