const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{
  window.Telegram={WebApp:{initData:'x',initDataUnsafe:{},ready(){},expand(){},
    disableVerticalSwipes(){},enableClosingConfirmation(){},viewportStableHeight:844,
    onEvent(){},offEvent(){},openTelegramLink(){},colorScheme:'dark',
    HapticFeedback:{impactOccurred(){},notificationOccurred(){}},
    setHeaderColor(){},setBackgroundColor(){},MainButton:{hide(){}},BackButton:{hide(){},show(){},onClick(){}}}};
});
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(1600);
await p.evaluate(()=>{
  window.__beta={101:false};window.__betaCalls=[];
  window.sbRpc=async(fn,a)=>{
    if(fn==='admin_chat_list')return {ok:true,unread:2,list:[
      {tg:101,name:'Купис',user:'LilFat',last:'Не рахує пробіг',who:'d',at:'2026-08-28 10:12',unread:2,n:3}]};
    if(fn==='admin_chat')return {ok:true,list:[
      {id:1,who:'d',body:'Не рахує пробіг',ph:null,at:'2026-08-28 10:12',seen:true},
      {id:5,who:'a',body:'Вітаю',ph:null,at:'2026-08-28 11:00',seen:true,ok:true}]};
    if(fn==='admin_people')return {list:[{id:101,name:'Купис',user:'LilFat',beta:window.__beta[101],
      src:'threads',joined:'2026-08-10 14:20',seen:'2026-08-29 09:40'}],total:1,beta:0};
    if(fn==='admin_beta'){window.__betaCalls.push(a);window.__beta[a.p_tg_id]=a.p_on;return {ok:true};}
    return {};
  };
});
await p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  admData={users:12,tickets:4,tickets_1d:1,started:8,from:'2026-08-01',to:'2026-08-29',tick:[],
           recent:[{name:'Купис',user:'LilFat',joined:'2026-08-10',seen:'2026-08-29 09:40',shifts:14,orders:132}]};
  await loadAdminFolks();await loadAdminChats();renderAll();
});
await p.waitForTimeout(400);
await p.click('#fab-chat');await p.waitForTimeout(500);
await p.click('#chats-list [data-chat="101"]');await p.waitForTimeout(800);
const txt=await p.textContent('#at-who-card');
console.log('1 · картка:',txt.replace(/\s+/g,' ').trim());
console.log('2 · корона є:',await p.evaluate(()=>!!document.querySelector('#at-who-card .adm-crown')),
  '· увімкнена:',await p.evaluate(()=>document.querySelector('#at-who-card .adm-crown').classList.contains('on')));
console.log('3 · сум у картці немає:',!/₴|грн/.test(txt));
await p.locator('#modal-athread .modal').screenshot({path:'who-card.png'});
await p.click('#at-who-card .adm-crown');await p.waitForTimeout(700);
console.log('4 · виклик:',await p.evaluate(()=>JSON.stringify(window.__betaCalls[0])),
  '· корона тепер:',await p.evaluate(()=>document.querySelector('#at-who-card .adm-crown').classList.contains('on')),
  '· тост:',await p.textContent('#toast'));
await p.click('#at-who-card .adm-crown');await p.waitForTimeout(700);
console.log('5 · усі виклики:',await p.evaluate(()=>JSON.stringify(window.__betaCalls)),
  '· корона:',await p.evaluate(()=>document.querySelector('#at-who-card .adm-crown').classList.contains('on')));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
