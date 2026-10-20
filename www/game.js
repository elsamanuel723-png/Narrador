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

/* ---------- Idiomas (i18n) ----------
   Motor de tradução da interface. As falas do narrador dentro dos 120 níveis
   continuam em português por agora (fase seguinte do trabalho); tudo o resto
   (menus, loja, skins, HUD, mensagens de sistema) já está traduzido. */
const SUPPORTED_LANGS=["pt","en","es","fr","de","ru","ja","zh","hi","ar","id","bn"];
const LANG_NAMES={pt:"Português",en:"English",es:"Español",fr:"Français",de:"Deutsch",ru:"Русский",ja:"日本語",zh:"中文",hi:"हिन्दी",ar:"العربية",id:"Indonesia",bn:"বাংলা"};
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
  shopText:"Tens 💎 {gems} gemas, ganhas a ver anúncios.\n\nAs personagens compram-se com gemas em 🧍 Personagens, no menu principal, ou todas de uma vez aqui com dinheiro real.",
  skinsTitle:"Personagens",skinsUnlockAll:"💳 Desbloquear todas — pagamento único",
  skinsEquipped:"✓ {name} (equipado)",skinsEquip:"Equipar: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} gemas. Escolhe quem vais ser. Compra skins com gemas ganhas a ver anúncios, ou desbloqueia tudo de uma vez com dinheiro real.",
  langTitle:"Idioma",langText:"Escolhe o idioma do jogo.",
  hudDaily:"Desafio Diário",hudEndless:"Infinito · nível {n}",hudDeaths:"mortes {n}",hudShield:"🛡 escudo pronto",hudInvert:"↔ controlos trocados",
  adPlaying:"📺 Anúncio a decorrer",adNote:"(no jogo final, um anúncio real da AdMob aparece aqui)",
  shieldAbsorbed:"O escudo absorveu isso. Sorte a tua.",
  purchaseOnlyStore:"Compras só funcionam na versão instalada pela Play Store.",
  productNotConfigured:"Esse produto ainda não está configurado na loja. Tenta mais tarde.",
  nothingToRestore:"Nada a restaurar nesta versão.",purchasesRestored:"Compras restauradas.",
  adWatched:"Anúncio visto. +{g} gemas e um escudo. De nada.",
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
  shopText:"You have 💎 {gems} gems, earned by watching ads.\n\nCharacters are bought with gems under 🧍 Characters in the main menu, or all at once here with real money.",
  skinsTitle:"Characters",skinsUnlockAll:"💳 Unlock all — one-time payment",
  skinsEquipped:"✓ {name} (equipped)",skinsEquip:"Equip: {name}",skinsLocked:"🔒 {name} — 💎 {price}",
  skinsText:"💎 {gems} gems. Choose who you'll be. Buy skins with gems earned from watching ads, or unlock them all at once with real money.",
  langTitle:"Language",langText:"Choose the game's language.",
  hudDaily:"Daily Challenge",hudEndless:"Endless · level {n}",hudDeaths:"deaths {n}",hudShield:"🛡 shield ready",hudInvert:"↔ controls swapped",
  adPlaying:"📺 Ad playing",adNote:"(in the final game, a real AdMob ad appears here)",
  shieldAbsorbed:"The shield absorbed that. Lucky you.",
  purchaseOnlyStore:"Purchases only work in the version installed from the Play Store.",
  productNotConfigured:"That product isn't set up in the store yet. Try again later.",
  nothingToRestore:"Nothing to restore in this version.",purchasesRestored:"Purchases restored.",
  adWatched:"Ad watched. +{g} gems and a shield. You are welcome.",
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
  return nt(arr[Math.floor(Math.random()*arr.length)]);
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
    sayIt(t("shieldAbsorbed"));
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
        sayIt(t("adWatched",{g}));
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
    if(!b.done&&p.x>=b.x){b.done=true;if(b.say)sayIt(nt(b.say));if(b.act)b.act();}
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
  else if(mode==="daily")txt(t("hudDaily"),W-12,14,14,P.muted,"right","normal");
  else if(mode==="endless")txt(t("hudEndless",{n:ecLevel}),W-12,14,14,P.muted,"right","normal");
  txt(t("hudDeaths",{n:deaths}),W-12,32,12,P.muted,"right","normal");
  txt(`💎 ${gems}`,12,14,14,P.door,"left","normal");
  if(shield)txt(t("hudShield"),12,32,12,P.teal,"left","normal");
  if(invert>0)txt(t("hudInvert"),W/2,H-26,13,P.door);
  if(narr.t&&gf-narr.t0<360)bubble(narr.t,narr.t0);
  if(st==="dead"){
    const tpulse=Math.max(0,timer)/75;
    ctx.fillStyle=`rgba(255,77,94,${(0.26*tpulse).toFixed(3)})`;
    ctx.fillRect(0,0,W,H);
  }
  if(adPlaying>0){
    ctx.setTransform(1,0,0,1,0,0);
    ctx.fillStyle="rgba(8,6,18,.94)";ctx.fillRect(0,0,W,H);
    txt(t("adPlaying"),W/2,H/2-30,26,P.ink);
    txt(String(Math.ceil(adPlaying/60)),W/2,H/2+22,44,P.door);
    txt(t("adNote"),W/2,H-24,12,P.muted,"center","normal");
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
    btns.push({t:t("continueBtn",{n:saved+1,total:LEVELS.length}),main:true,f:()=>{hideMenu();startLevel(saved);}});
    btns.push({t:t("newGame"),f:()=>newGame()});
  }else btns.push({t:t("play"),main:true,f:()=>newGame()});

  const today=todayStr();
  const doneToday=store.get("nm_daily_last",null)===today;
  const streak=store.get("nm_daily_streak",0);
  btns.push({t:doneToday?t("dailyDone",{streak}):t("dailyPlain")+(streak>0?t("streakSuffix",{streak}):""),f:()=>startDaily()});

  if(store.get("nm_endless_unlocked",false)){
    const endlessBest=store.get("nm_endless_best",0);
    btns.push({t:t("endlessPlain")+(endlessBest>0?t("endlessBestSuffix",{best:endlessBest}):""),f:()=>startEndless()});
  }

  btns.push({t:t("voiceLabel",{state:voiceOn?t("voiceOn"):t("voiceOff")}),f:()=>{toggleVoice();titleMenu();}});
  btns.push({t:t("charactersBtn",{name:skinName(getSkin())}),f:()=>openSkins()});
  btns.push({t:t("shopBtn",{gems}),f:()=>openShop()});
  btns.push({t:t("langBtn",{name:LANG_NAMES[lang]}),f:()=>openLang()});
  showMenu(t("appTitle"),t("appSubtitle"),btns);
}
function openShop(){
  const btns=[];
  if(noAds)btns.push({t:t("shopAdsRemoved"),main:true,f:()=>openShop()});
  else btns.push({t:t("shopRemoveAds"),main:true,f:()=>buyRealNoAds()});
  btns.push({t:t("shopRestore"),f:()=>restorePurchases()});
  btns.push({t:t("back"),f:()=>titleMenu()});
  showMenu(t("shopTitle"),t("shopText",{gems}),btns);
}
function openSkins(){
  const btns=[];
  const allOwned=SKINS.every(s=>skinsOwned.includes(s.id));
  if(!allOwned)btns.push({t:t("skinsUnlockAll"),f:()=>buyRealAllSkins()});
  SKINS.forEach(s=>{
    const owned=skinsOwned.includes(s.id),equipped=skin===s.id,name=skinName(s);
    if(equipped){btns.push({t:t("skinsEquipped",{name}),main:true,f:()=>openSkins()});return;}
    if(owned){btns.push({t:t("skinsEquip",{name}),f:()=>{skin=s.id;store.set("nm_skin",skin);openSkins();}});return;}
    btns.push({t:t("skinsLocked",{name,price:s.price}),f:()=>{
      if(gems>=s.price){
        gems-=s.price;store.set("nm_gems",gems);
        skinsOwned.push(s.id);store.set("nm_skins_owned",skinsOwned);
        skin=s.id;store.set("nm_skin",skin);
      }
      openSkins();
    }});
  });
  btns.push({t:t("back"),f:()=>titleMenu()});
  showMenu(t("skinsTitle"),t("skinsText",{gems}),btns);
}
function openLang(){
  const btns=SUPPORTED_LANGS.map(l=>({
    t:(l===lang?"✓ ":"")+LANG_NAMES[l],
    main:l===lang,
    f:()=>{setLang(l);titleMenu();}
  }));
  btns.push({t:t("back"),f:()=>titleMenu()});
  showMenu(t("langTitle"),t("langText"),btns);
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
  if(!RC){sayIt(t("purchaseOnlyStore"));openShop();return;}
  try{
    const offerings=await RC.getOfferings();
    const pkg=findPackage(offerings,PROD_NO_ADS);
    if(!pkg){sayIt(t("productNotConfigured"));openShop();return;}
    const res=await RC.purchasePackage({aPackage:pkg});
    applyEntitlements(res&&res.customerInfo);
  }catch(e){}
  openShop();
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
