const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true});
const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(2200);
await p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  data.settings.onboarded=1;
  data.active={id:Date.now(),startT:Date.now()-3600000,odoStart:0,orders:[],breakMs:0};
  await persist();renderAll();
});
/* проведення пальцем на частку ширини */
async function swipe(sel,frac){
  const box=await p.locator(sel).boundingBox();
  const y=box.y+box.height/2, x0=box.x+8;
  await p.mouse.move(x0,y);await p.mouse.down();
  const to=x0+box.width*frac;
  for(let i=1;i<=12;i++){await p.mouse.move(x0+(to-x0)*i/12,y);await p.waitForTimeout(12);}
  await p.mouse.up();await p.waitForTimeout(450);
}
await p.click('#btn-order');await p.waitForTimeout(400);
console.log('вигляд кнопки:',await p.textContent('#om-save'));

/* 1 · простий дотик — нічого не приймає */
await p.click('#om-save');await p.waitForTimeout(300);
console.log('1 · дотик:',await p.evaluate(()=>data.active.orders.length),'замовлень · тост:',await p.textContent('#toast'));

/* 2 · коротке проведення (половина) — не спрацьовує й вертається */
await p.fill('#om-amount','240');await p.fill('#om-odo','12');
await swipe('#om-save',0.33);
console.log('2 · третина:',await p.evaluate(()=>data.active.orders.length),'замовлень · заливка:',
  await p.evaluate(()=>document.querySelector('#om-save .swp-fill').style.width));

/* 3 · повне проведення — приймає */
await swipe('#om-save',0.99);
console.log('3 · до кінця:',await p.evaluate(()=>data.active.orders.length),'замовлень · вікно закрите:',
  await p.evaluate(()=>!document.getElementById('modal-order').classList.contains('open')));

/* 4 · завершення */
await p.evaluate(()=>openFinish(data.active.orders[0].id));await p.waitForTimeout(400);
console.log('4 · напис:',await p.textContent('#fin-save'));
await p.fill('#fin-odo-end','25');
await swipe('#fin-save',0.33);
console.log('   третина:',await p.evaluate(()=>!!data.active.orders[0].endT));
await swipe('#fin-save',0.99);
console.log('   до кінця завершено:',await p.evaluate(()=>!!data.active.orders[0].endT),
  '· км:',await p.evaluate(()=>data.active.orders[0].km));

/* 5 · редагування закритого замовлення теж свайпом */
await p.evaluate(()=>openFinish(data.active.orders[0].id));await p.waitForTimeout(350);
console.log('5 · напис при редагуванні:',await p.textContent('#fin-save'));
await p.fill('#fin-amount','300');
await swipe('#fin-save',0.99);
console.log('   сума збережена:',await p.evaluate(()=>data.active.orders[0].amount));

/* 6 · порожня сума — свайп не проходить і смуга вертається */
await p.click('#btn-order');await p.waitForTimeout(350);
await swipe('#om-save',0.99);
console.log('6 · без суми:',await p.evaluate(()=>data.active.orders.length),'замовлень · заливка:',
  await p.evaluate(()=>document.querySelector('#om-save .swp-fill').style.width),
  '· вікно ще відкрите:',await p.evaluate(()=>document.getElementById('modal-order').classList.contains('open')));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await p.screenshot({path:'swipe-order.png'});
await b.close();})();
