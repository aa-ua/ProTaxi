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
  const S=data.settings;S.onboarded=1;S.fuelKind='petrol';S.fuelGrade='a95';
  S.fuelPrice=45;S.consumption=9;S.tankLiters=35;S.stations=[];S.commissionPct=20;
  data.entries=[];data.refuels=[];data.active=null;data.fundOps=[];
  const D=todayStr();
  /* зміна, що почалась ДО заправки: два замовлення до, одне після */
  const o=[{id:1,t:toMs(D,'09:00'),endT:toMs(D,'09:30'),amount:200,odoStart:100,odoEnd:112,pay:'cash',own:false,tip:0},
           {id:2,t:toMs(D,'10:00'),endT:toMs(D,'10:30'),amount:250,odoStart:112,odoEnd:125,pay:'cash',own:false,tip:0},
           {id:3,t:toMs(D,'13:00'),endT:toMs(D,'13:30'),amount:300,odoStart:130,odoEnd:140,pay:'cash',own:false,tip:0}];
  const inp={gross:750,tips:0,liters:3.6,km:40,fuelPrice:45,cardGross:0,ownGross:0,rentShifts:1};
  data.entries.push({id:9,date:D,startT:toMs(D,'08:30'),endT:toMs(D,'15:00'),hours:6.5,
    odoStart:100,odoEnd:140,orders:o,oc:3,weather:'',...inp,calc:calc(inp,S)});
  data.refuels.push({id:5,date:D,liters:20,price:45,sum:900,odo:128,full:true,reset:false,
    t:toMs(D,'12:00')});
  recalcAll();renderAll();});
const d=await p.evaluate(()=>daysSinceRefuel());
console.log('1 · на цьому баку замовлень:',d.oc,d.oc===1?'ok (одне після заправки)':'ПОМИЛКА');
console.log('2 · одометр зараз:',await p.evaluate(()=>curOdo()),'· очікуємо 140');
/* сума замість літрів */
await p.evaluate(()=>{goScreen('tank');openRefuel(null);});
await p.waitForTimeout(600);
await p.fill('#rf-price','45');
await p.fill('#rf-liters','900');
await p.fill('#rf-odo','160');
await p.waitForTimeout(300);
console.log('3 · підказка при 900:',(await p.textContent('#rf-calc')).replace(/\s+/g,' '));
await p.fill('#rf-liters','27');
await p.waitForTimeout(300);
console.log('4 · підказка при 27:',(await p.textContent('#rf-calc')).replace(/\s+/g,' '));
console.log('5 · рядок бака:',(await p.textContent('#rf-days')).replace(/\s+/g,' '));
await p.locator('#modal-refuel .modal').screenshot({path:'refuel-new.png'});
/* зберігаємо сумою */
await p.fill('#rf-liters','900');
await p.waitForTimeout(200);
await p.click('#rf-save');await p.waitForTimeout(200);await p.click('#rf-save');
await p.waitForTimeout(700);
const r=await p.evaluate(()=>{const x=data.refuels[data.refuels.length-1];
  return {літрів:x.liters,ціна:x.price,одометр:x.odo};});
console.log('6 · збережено:',JSON.stringify(r),Math.abs(r.літрів-20)<0.01?'ok':'ПОМИЛКА');
console.log('7 · одометр на екрані бака:',await p.evaluate(()=>{renderTank();
  const t=document.getElementById('screen-tank').textContent;
  return /Одометр зараз/.test(t)?t.replace(/\s+/g,' ').match(/Одометр зараз[^А-Яа-я]*км/)[0]:'немає';}));
console.log('помилок JS:',errs.length,errs.slice(0,2).join(' | '));
await b.close();})();
