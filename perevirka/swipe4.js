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
const mkShift=async()=>p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  data.settings.onboarded=1;
  const t=Date.now();
  data.active={id:t,startT:t-5*3600000,odoStart:0,breakMs:0,orders:[
    {id:t-5e6,t:t-4*3600000,endT:t-3.7*3600000,amount:210,odoStart:0,odoEnd:9.4,pay:'cash',own:false,tip:0}]};
  await persist();renderAll();});
await mkShift();
async function swipe(sel,frac){
  const box=await p.locator(sel).boundingBox();
  const y=box.y+box.height/2,x0=box.x+8;
  await p.mouse.move(x0,y);await p.mouse.down();
  const to=x0+box.width*frac;
  for(let i=1;i<=10;i++){await p.mouse.move(x0+(to-x0)*i/10,y);await p.waitForTimeout(10);}
  await p.mouse.up();await p.waitForTimeout(600);
}
/* 1 · від середини смуга докочується сама */
await p.evaluate(()=>openNewOrder());await p.waitForTimeout(400);
await p.fill('#om-amount','300');await p.fill('#om-odo','30');
await swipe('#om-save',0.55);
console.log('1 · провів трохи за середину:',await p.evaluate(()=>data.active.orders.length),'замовлень (було 1)');
/* 2 · менше половини — вертається */
await p.evaluate(()=>openNewOrder());await p.waitForTimeout(400);
await p.fill('#om-amount','120');await p.fill('#om-odo','40');
await swipe('#om-save',0.42);
console.log('2 · не дотяг до середини:',await p.evaluate(()=>data.active.orders.length),'замовлень · вікно ще відкрите:',
  await p.evaluate(()=>document.getElementById('modal-order').classList.contains('open')));
await p.click('#om-cancel');await p.waitForTimeout(300);
/* 3 · скасування зміни — червона смуга (спершу закриваємо відкриті замовлення) */
await mkShift();
await p.evaluate(()=>openCloseShift());await p.waitForTimeout(700);
console.log('3 · напис:',await p.textContent('#cm-cancelshift .swp-label'),
  '· червона:',await p.evaluate(()=>document.getElementById('cm-cancelshift').classList.contains('swp-red')));
await p.evaluate(()=>{try{document.activeElement.blur();}catch(e){}
  document.getElementById('cm-cancelshift').scrollIntoView({block:'center'});});
await p.waitForTimeout(400);
const box=await p.locator('#cm-cancelshift').boundingBox();
if(!box)throw new Error('червона смуга не видима');
const y=box.y+box.height/2,x0=box.x+8;
await p.mouse.move(x0,y);await p.mouse.down();
for(let i=1;i<=8;i++){await p.mouse.move(x0+box.width*0.62*i/8,y);await p.waitForTimeout(12);}
await p.waitForTimeout(150);
await p.locator('#modal-close .modal').screenshot({path:'cancel-mid.png'});
await p.mouse.up();await p.waitForTimeout(700);
console.log('4 · зміну скасовано:',await p.evaluate(()=>!data.active),
  '· записів не додалось:',await p.evaluate(()=>data.entries.length));
/* 5 · дотик по червоній нічого не робить */
await mkShift();
await p.evaluate(()=>openCloseShift());await p.waitForTimeout(600);
await p.evaluate(()=>document.getElementById('cm-cancelshift').scrollIntoView({block:'center'}));
await p.waitForTimeout(300);
await p.click('#cm-cancelshift');await p.waitForTimeout(400);
console.log('5 · дотик:',await p.evaluate(()=>!!data.active),'зміна жива · тост:',await p.textContent('#toast'));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
