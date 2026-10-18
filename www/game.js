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
},ru:{},ja:{},zh:{},hi:{},ar:{},id:{},bn:{}};

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
