const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(2200);
await p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  data.settings.onboarded=1;data.settings.dailyGoal=1500;
  const t=Date.now();
  data.active={id:t,startT:t-5*3600000,odoStart:0,breakMs:0,orders:[
    {id:t-5e6,t:t-4*3600000,endT:t-3.7*3600000,amount:210,odoStart:0,odoEnd:9.4,pay:'cash',own:false,tip:0},
    {id:t-4e6,t:t-3.4*3600000,endT:t-3.1*3600000,amount:340,odoStart:14,odoEnd:27.5,pay:'card',own:false,tip:0}]};
  await persist();renderAll();});
await p.waitForTimeout(400);
const order=async()=>p.evaluate(()=>[...document.querySelectorAll('#screen-shift .card')]
  .map(c=>(c.querySelector('.card-title,.pause-head b,.hero-big')||{}).textContent||'?').slice(0,4));
console.log('1 · до паузи, порядок карток:',JSON.stringify(await order()));
await p.evaluate(async()=>{pauseShift();await persist();renderAll();});
await p.waitForTimeout(400);
console.log('2 · на паузі, порядок карток:',JSON.stringify(await order()));
console.log('   цифри сірі:',await p.evaluate(()=>!!document.querySelector('.shift-hero.dim')));
await p.screenshot({path:'pause-screen.png',fullPage:false});
/* спроба прийняти замовлення */
await p.click('#btn-order');await p.waitForTimeout(400);
console.log('3 · вікно паузи:',await p.isVisible('#modal-paused'),
  '· вікно замовлення не відкрилось:',await p.evaluate(()=>!document.getElementById('modal-order').classList.contains('open')));
await p.locator('#modal-paused .modal').screenshot({path:'pause-modal.png'});
await p.click('#pz-resume');await p.waitForTimeout(700);
console.log('4 · зміну продовжено:',await p.evaluate(()=>!data.active.pausedAt),
  '· одразу відкрилось вікно замовлення:',await p.isVisible('#modal-order'),
  '· цифри знову кольорові:',await p.evaluate(()=>!document.querySelector('.shift-hero.dim')));
await p.click('#om-cancel');await p.waitForTimeout(300);
console.log('5 · порядок після продовження:',JSON.stringify(await order()));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
