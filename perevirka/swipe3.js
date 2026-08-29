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
  data.settings.onboarded=1;
  const t=Date.now();
  data.active={id:t,startT:t-6*3600000,odoStart:0,breakMs:0,orders:[
    {id:t-5e6,t:t-5*3600000,endT:t-4.7*3600000,amount:210,odoStart:0,odoEnd:9.4,pay:'cash',own:false,tip:0},
    {id:t-4e6,t:t-3*3600000,endT:t-2.7*3600000,amount:340,odoStart:14,odoEnd:27.5,pay:'card',own:false,tip:0}]};
  await persist();renderAll();});
async function swipe(sel,frac){
  const box=await p.locator(sel).boundingBox();
  const y=box.y+box.height/2,x0=box.x+8;
  await p.mouse.move(x0,y);await p.mouse.down();
  const to=x0+box.width*frac;
  for(let i=1;i<=12;i++){await p.mouse.move(x0+(to-x0)*i/12,y);await p.waitForTimeout(12);}
  await p.mouse.up();await p.waitForTimeout(500);
}
await p.evaluate(()=>openCloseShift());await p.waitForTimeout(700);
console.log('1 · напис:',await p.textContent('#cm-save .swp-label'));
await p.evaluate(()=>document.activeElement.blur());await p.waitForTimeout(300);
await p.click('#cm-save');await p.waitForTimeout(300);
console.log('2 · дотик:',await p.evaluate(()=>!!data.active),'зміна ще відкрита · тост:',await p.textContent('#toast'));
/* знімок на 60 % */
const box=await p.locator('#cm-save').boundingBox();
const y=box.y+box.height/2,x0=box.x+8;
await p.mouse.move(x0,y);await p.mouse.down();
for(let i=1;i<=10;i++){await p.mouse.move(x0+box.width*0.33*i/10,y);await p.waitForTimeout(15);}
await p.waitForTimeout(200);
await p.locator('#modal-close .modal').screenshot({path:'cm-mid.png'});
await p.mouse.up();await p.waitForTimeout(500);
console.log('3 · третина:',await p.evaluate(()=>!!data.active),'зміна ще відкрита');
await swipe('#cm-save',0.99);
console.log('4 · до кінця:',await p.evaluate(()=>!data.active),'зміну закрито · записів:',
  await p.evaluate(()=>data.entries.length),'· тост:',await p.textContent('#toast'));
console.log('помилок JS:',errs.length,errs.slice(0,3).join(' | '));
await b.close();})();
