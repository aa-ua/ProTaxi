const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const p=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(2200);
await p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  const S=data.settings;S.onboarded=1;S.consumption=9;S.fuelPrice=45;S.commissionPct=20;
  S.acquiringPct=2;S.taxPct=5;S.fundPct=15;S.carMode='own';S.geoOn=false;
  data.entries=[];data.refuels=[];data.active=null;
  const D=todayStr(),t=Date.now();
  data.active={id:1,startT:toMs(D,'18:00'),odoStart:0,breakMs:0,orders:[
    {id:11,t:toMs(D,'18:20'),endT:toMs(D,'18:50'),amount:260,odoStart:0,odoEnd:12.5,pay:'cash',own:false,tip:0}]};
  await persist();renderAll();openCloseShift();});
await p.waitForTimeout(900);
console.log('1 · поля «Фактично заправив» немає:',await p.evaluate(()=>!document.getElementById('cm-liters')));
console.log('2 · підказка:',(await p.textContent('#cm-preview')).replace(/\s+/g,' '));
await p.fill('#cm-odo','16.7');
await p.waitForTimeout(300);
console.log('3 · після одометра:',(await p.textContent('#cm-preview')).replace(/\s+/g,' '));
await p.locator('#modal-close .modal').screenshot({path:'close-new.png'});
const box=await p.locator('#cm-save').boundingBox();
const y=box.y+box.height/2,x0=box.x+8;
await p.mouse.move(x0,y);await p.mouse.down();
for(let i=1;i<=10;i++){await p.mouse.move(x0+box.width*0.7*i/10,y);await p.waitForTimeout(10);}
await p.mouse.up();await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const e=data.entries[0];
  return {км:e.km,літрів:+e.liters.toFixed(2),пальне:+e.calc.fuel.toFixed(2),
          наРуки:+e.calc.personal.toFixed(2),руками:!!e.manualLiters};});
console.log('4 · записано:',JSON.stringify(r));
console.log('   літри з пробігу:',Math.abs(r.літрів-16.7*0.09)<0.01?'ok':'ПОМИЛКА');
console.log('помилок JS:',errs.length,errs.slice(0,2).join(' | '));
await b.close();})();
