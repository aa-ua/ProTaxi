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
  window.__threads={101:[{id:1,who:'d',body:'Не рахує пробіг',ph:null,at:'2026-08-28 10:12'}]};
  window.__pulls=0;window.__sent=[];
  window.sbRpc=async(fn,a)=>{
    if(fn==='chat_pull'){window.__pulls++;return {ok:true,unread:0,list:[]};}
    if(fn==='admin_chat_list')return {ok:true,unread:2,list:[
      {tg:101,name:'Купис',user:'LilFat',last:'Не рахує пробіг',who:'d',at:'2026-08-28 10:12',unread:2,n:1},
      {tg:202,name:'Олег',user:null,last:'Дякую',who:'d',at:'2026-08-29 09:00',unread:0,n:1}]};
    if(fn==='admin_chat')return {ok:true,list:window.__threads[a.p_tg_id]||[]};
    if(fn==='admin_chat_send'){window.__sent.push(a);
      window.__threads[a.p_tg_id].push({id:9,who:'a',body:a.p_text,ph:null,at:'2026-08-29 16:00'});return {ok:true};}
    return {};
  };
});
/* ── ВЛАСНИК ── */
await p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  admData={users:12,tickets:4,tickets_1d:1,started:8,from:'2026-08-01',to:'2026-08-29',tick:[]};
  await loadAdminChats();
  await chatPull(false);
  renderAll();
});
await p.waitForTimeout(400);
console.log('1 · власник · кнопка видима:',await p.isVisible('#fab-chat'),
  '· цифра:',await p.textContent('#fab-n'),
  '· звернень chat_pull:',await p.evaluate(()=>window.__pulls));
await p.click('#fab-chat');await p.waitForTimeout(600);
console.log('2 · відкрився список:',await p.isVisible('#modal-chats'),
  '· рядків:',await p.evaluate(()=>document.querySelectorAll('#chats-list [data-chat]').length),
  '· чату з підтримкою немає:',await p.evaluate(()=>!document.getElementById('modal-chat').classList.contains('open')));
await p.locator('#modal-chats .modal').screenshot({path:'own-chats.png'});
await p.click('#chats-list [data-chat="101"]');await p.waitForTimeout(700);
console.log('3 · переписка:',await p.isVisible('#modal-athread'),'·',await p.textContent('#at-who'),
  '· список закрився:',await p.evaluate(()=>!document.getElementById('modal-chats').classList.contains('open')));
await p.fill('#at-text','Уже виправили');
await p.click('#at-send');await p.waitForTimeout(700);
console.log('4 · відповідь пішла:',await p.evaluate(()=>window.__sent.length===1&&window.__sent[0].p_tg_id===101));
await p.click('#at-back');await p.waitForTimeout(400);
console.log('5 · повернулись у список:',await p.isVisible('#modal-chats'));
/* ── ЗВИЧАЙНИЙ ВОДІЙ ── */
await p.evaluate(async()=>{admData=null;admChats=null;chatOn=null;await chatPull(false);renderAll();});
await p.waitForTimeout(300);
await p.click('#chats-back').catch(()=>{});
await p.waitForTimeout(200);
await p.evaluate(()=>closeM('modal-chats'));
await p.click('#fab-chat');await p.waitForTimeout(500);
console.log('6 · водій · відкрився чат підтримки:',await p.isVisible('#modal-chat'),
  '· список переписок не відкрився:',await p.evaluate(()=>!document.getElementById('modal-chats').classList.contains('open')));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
