const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
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
  window.sbRpc=async(fn)=>{if(fn==='chat_pull')return {ok:true,unread:0,list:[]};return {};};
});
await p.evaluate(async()=>{document.getElementById('modal-intro').classList.remove('open');
  data.settings.onboarded=1;await persist();await chatPull(false);renderAll();});
await p.waitForTimeout(400);
await p.click('#fab-chat');await p.waitForTimeout(600);
await p.setInputFiles('#chat-file',['t1.jpg','t2.jpg']);
await p.waitForTimeout(1200);
console.log('1 · знімків додано:',await p.evaluate(()=>supShots.length),
  '· плиток видно:',await p.evaluate(()=>document.querySelectorAll('#chat-shots .shot').length),
  '· у якому боксі:',await p.evaluate(()=>JSON.stringify(shotsTo)));
const btn=p.locator('#chat-shots .shot button').first();
console.log('2 · хрестик видимий:',await btn.isVisible(),'· розмір:',JSON.stringify(await btn.boundingBox()));
await btn.click();
await p.waitForTimeout(500);
console.log('3 · після дотику по хрестику залишилось:',await p.evaluate(()=>supShots.length),
  '· плиток:',await p.evaluate(()=>document.querySelectorAll('#chat-shots .shot').length));
await p.locator('#modal-chat .modal').screenshot({path:'shots-x.png'});
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
