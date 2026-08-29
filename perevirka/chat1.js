const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
/* підробляємо Telegram і сервер: справжня база тут недосяжна */
await p.addInitScript(()=>{
  window.Telegram={WebApp:{initData:'x',initDataUnsafe:{},ready(){},expand(){},
    disableVerticalSwipes(){},enableClosingConfirmation(){},
    viewportStableHeight:844,onEvent(){},offEvent(){},openTelegramLink(){},
    HapticFeedback:{impactOccurred(){},notificationOccurred(){}},colorScheme:'dark',
    setHeaderColor(){},setBackgroundColor(){},MainButton:{hide(){}},BackButton:{hide(){},show(){},onClick(){}}}};
  window.__chat=[{id:1,who:'d',body:'Не рахує пробіг',ph:null,at:'2026-08-28 10:12'},
                 {id:2,who:'a',body:'Вітаю! Перевірте одометр у замовленні.',ph:null,at:'2026-08-28 11:02'}];
  window.__unread=2;
});
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(1500);
/* перехоплюємо RPC */
await p.evaluate(()=>{
  window.__sent=[];
  window.sbRpc=async(fn,args)=>{
    if(fn==='chat_pull'){
      const u=window.__unread; if(args.p_seen)window.__unread=0;
      return {ok:true,unread:u,list:window.__chat};
    }
    if(fn==='chat_send'){
      window.__sent.push(args);
      window.__chat.push({id:99,who:'d',body:args.p_text,ph:args.p_photos,at:'2026-08-29 15:00'});
      return {ok:true};
    }
    return {};
  };
});
await p.evaluate(async()=>{document.getElementById('modal-intro').classList.remove('open');
  data.settings.onboarded=1;await persist();renderAll();await chatPull(false);});
await p.waitForTimeout(400);
console.log('1 · кнопка видима:',await p.isVisible('#fab-chat'),
  '· лічильник:',await p.textContent('#fab-n'),
  '· клас new:',await p.evaluate(()=>document.getElementById('fab-chat').classList.contains('new')));
await p.screenshot({path:'chat-fab.png'});
await p.click('#fab-chat');await p.waitForTimeout(600);
console.log('2 · вікно відкрите:',await p.isVisible('#modal-chat'),
  '· повідомлень:',await p.evaluate(()=>document.querySelectorAll('#chat-list .cm').length),
  '· лічильник після відкриття:',await p.evaluate(()=>chatUnread));
await p.locator('#modal-chat .modal').screenshot({path:'chat-open.png'});
await p.fill('#chat-text','Дякую, спрацювало');
await p.click('#chat-send');await p.waitForTimeout(700);
console.log('3 · надіслано:',await p.evaluate(()=>JSON.stringify(window.__sent[0])),
  '· у стрічці:',await p.evaluate(()=>document.querySelectorAll('#chat-list .cm').length));
await p.click('#chat-close');await p.waitForTimeout(300);
console.log('4 · закрито:',await p.evaluate(()=>!document.getElementById('modal-chat').classList.contains('open')),
  '· кнопка без цифри:',await p.evaluate(()=>!document.getElementById('fab-chat').classList.contains('new')));
/* 5 · стара база — кнопки немає, відкривається старе вікно */
await p.evaluate(()=>{chatOn=null;window.sbRpc=async()=>{const e=new Error('404 Could not find');throw e;};});
await p.evaluate(()=>chatPull(false));await p.waitForTimeout(300);
console.log('5 · стара база · кнопка схована:',await p.evaluate(()=>!document.getElementById('fab-chat').classList.contains('on')));
await p.evaluate(()=>openChat());await p.waitForTimeout(300);
console.log('   відкрилось старе вікно:',await p.isVisible('#modal-support'));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
