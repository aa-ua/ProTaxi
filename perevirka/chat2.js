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
  window.__threads={101:[{id:1,who:'d',body:'Не рахує пробіг',ph:null,at:'2026-08-28 10:12',seen:true},
                         {id:5,who:'a',body:'Вітаю',ph:null,at:'2026-08-28 11:00',seen:true,ok:true},
                         {id:6,who:'a',body:'Ще раз',ph:null,at:'2026-08-28 11:20',seen:false,ok:false,why:'водій не запускав бота'}],
                    202:[{id:2,who:'d',body:'Дякую за застосунок',ph:null,at:'2026-08-29 09:00',seen:false}]};
  window.__sent=[];
  window.sbRpc=async(fn,a)=>{
    if(fn==='admin_chat_list')return {ok:true,unread:3,list:[
      {tg:101,name:'Купис',user:'LilFat',last:'Не рахує пробіг',who:'d',at:'2026-08-28 10:12',unread:2,n:1},
      {tg:202,name:'Олег',user:null,last:'Дякую за застосунок',who:'d',at:'2026-08-29 09:00',unread:1,n:1}]};
    if(fn==='admin_chat')return {ok:true,list:window.__threads[a.p_tg_id]||[]};
    if(fn==='admin_chat_send'){window.__sent.push(a);
      window.__threads[a.p_tg_id].push({id:9,who:'a',body:a.p_text,ph:a.p_photos,at:'2026-08-29 16:00'});
      return {ok:true};}
    if(fn==='admin_stats')return {users:12,tickets:4,tickets_1d:1,started:8,from:'2026-08-01',to:'2026-08-29'};
    return {};
  };
});
await p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  admData={users:12,tickets:4,tickets_1d:1,started:8,from:'2026-08-01',to:'2026-08-29',tick:[]};
  await loadAdminChats();
  admTab='talk';goScreen('admin');admPaint();
});
await p.waitForTimeout(500);
console.log('1 · лічильник на вкладці:',await p.textContent('#adm-talk-n'),
  '· рядків переписок:',await p.evaluate(()=>document.querySelectorAll('#admin-body [data-chat]').length));
await p.locator('#admin-body').screenshot({path:'adm-chats.png'});
await p.click('[data-chat="101"]');await p.waitForTimeout(600);
console.log('2 · вікно:',await p.isVisible('#modal-athread'),
  '· заголовок:',await p.textContent('#at-who'),
  '· повідомлень:',await p.evaluate(()=>document.querySelectorAll('#at-list .cm').length));
await p.fill('#at-text','Вітаю! Уже виправили, оновіть застосунок.');
await p.click('#at-send');await p.waitForTimeout(800);
console.log('3 · надіслано:',await p.evaluate(()=>JSON.stringify(window.__sent[0])));
console.log('   доставлено в бот:',await p.evaluate(()=>/доставлено в бот/.test(document.getElementById('at-list').textContent)),
  '· причина відмови видна:',await p.evaluate(()=>/не запускав бота/.test(document.getElementById('at-list').textContent)),
  '· галочки:',await p.evaluate(()=>[...document.querySelectorAll('#at-list .tick')].map(x=>x.textContent).join(' ')));
console.log('   у стрічці:',await p.evaluate(()=>document.querySelectorAll('#at-list .cm').length));
await p.locator('#modal-athread .modal').screenshot({path:'adm-thread.png'});
await p.click('#at-back');await p.waitForTimeout(300);
console.log('4 · закрито:',await p.evaluate(()=>!document.getElementById('modal-athread').classList.contains('open')));
/* 5 · стара база — лишається старий список */
await p.evaluate(async()=>{
  const old=window.sbRpc;
  window.sbRpc=async(fn,a)=>{if(fn==='admin_chat_list'){throw new Error('404 Could not find');}return old(fn,a);};
  await loadAdminChats();admPaint();
});
await p.waitForTimeout(300);
console.log('5 · без функції в базі · переписок:',await p.evaluate(()=>document.querySelectorAll('#admin-body [data-chat]').length),
  '· старий заголовок є:',await p.evaluate(()=>/Останні звернення/.test(document.getElementById('admin-body').textContent)));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
