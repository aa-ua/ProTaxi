const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(2200);
const run=async fn=>p.evaluate(fn);
await run(()=>{
  document.getElementById('modal-intro').classList.remove('open');
  const S=data.settings;
  S.onboarded=1;S.commissionPct=20;S.acquiringPct=2;S.taxPct=5;S.taxFixed=0;
  S.fundPct=10;S.fundMode='pct';S.carMode='own';S.fuelKind='petrol';S.fuelGrade='a95';
  S.fuelPrice=50;S.consumption=10;S.stations=[];
  data.entries=[];data.refuels=[];data.fundOps=[];data.active=null;data.gone={};
  window.mk=(id,ds,km,amount)=>{
    const o=[{id:id*10,t:toMs(ds,'09:00'),endT:toMs(ds,'09:40'),amount:amount,
      odoStart:0,odoEnd:km*0.7,pay:'cash',own:false,tip:0}];
    const inp={gross:amount,tips:0,liters:km/100*10,km:km,fuelPrice:50,cardGross:0,ownGross:0,
      rentShifts:1};
    data.entries.push({id:id,date:ds,startT:toMs(ds,'08:00'),endT:toMs(ds,'14:00'),hours:6,
      odoStart:0,odoEnd:km,orders:o,oc:1,weather:'',path:[],manualLiters:false,manualTips:true,
      kmEst:false,auto:false,...inp,calc:calc(inp,data.settings)});
  };
  const d=new Date();const mm=todayStr().slice(0,8);
  window.days=[mm+'05',mm+'12',mm+'19'];
  days.forEach((ds,i)=>mk(i+1,ds,100+i*10,500+i*100));
  recalcAll();
  window.per=k=>{period=k;dayCursor=days[1];
    const es=data.entries.filter(e=>inPeriod(e.date));
    const ae=activeAsEntry();const all=ae&&inPeriod(ae.date)?[...es,ae]:es;
    return {змін:all.length,виручка:+all.reduce((a,e)=>a+(+e.gross||0),0).toFixed(2),
      км:+all.reduce((a,e)=>a+(+e.km||0),0).toFixed(1),
      пальне:+all.reduce((a,e)=>a+e.calc.fuel,0).toFixed(2),
      наРуки:+all.reduce((a,e)=>a+e.calc.personal,0).toFixed(2)};};
});
const show=async(t,k)=>{const s=await run(new Function('return per("'+k+'")'));console.log(t.padEnd(30),JSON.stringify(s));return s;};
const m1=await show('1 · місяць, три зміни','month');
const d1=await show('    день (середня)','day');

/* 2 · заправка змінює ціну пального для наступних змін */
await run(()=>{const mm=todayStr().slice(0,8);
  data.refuels.push({id:900,date:mm+'10',liters:40,price:60,sum:2400,odo:120,full:true,reset:false});
  recalcAll();});
const m2=await show('2 · +заправка по 60','month');
console.log('   пальне зросло:',m2.пальне>m1.пальне?'ok':'ПОМИЛКА');

/* 3 · видаляємо заправку — має повернутись */
await run(()=>{markGone('r',900);data.refuels=data.refuels.filter(r=>r.id!==900);recalcAll();});
const m3=await show('3 · заправку видалено','month');
console.log('   повернулось до кроку 1:',JSON.stringify(m3)===JSON.stringify(m1)?'ok':'ПОМИЛКА');

/* 4 · видаляємо середню зміну */
await run(()=>{markGone('e',2);data.entries=data.entries.filter(x=>x.id!==2);recalcAll();});
const m4=await show('4 · зміну 2 видалено','month');
console.log('   виручка впала рівно на 600:',+(m1.виручка-m4.виручка).toFixed(2)===600?'ok':'ПОМИЛКА',
  '· км рівно на 110:',+(m1.км-m4.км).toFixed(1)===110?'ok':'ПОМИЛКА');

/* 5 · день видаленої зміни має бути порожній */
const d5=await run(()=>{period='day';dayCursor=days[1];
  const es=data.entries.filter(e=>inPeriod(e.date));return es.length;});
console.log('5 · у дні видаленої зміни записів:',d5===0?'0 · ok':'ПОМИЛКА '+d5);

/* 6 · видалене не воскресає після перезавантаження сховища */
await run(async()=>{await persist();});
await p.reload();await p.waitForTimeout(2400);
const after=await run(()=>({записів:data.entries.length,
  є2:data.entries.some(e=>e.id===2),заправок:data.refuels.length}));
console.log('6 · після перезавантаження:',JSON.stringify(after),
  after.записів===2&&!after.є2&&after.заправок===0?'ok':'ПОМИЛКА');
console.log('помилок JS:',errs.length,errs.slice(0,2).join(' | '));
await b.close();})();
