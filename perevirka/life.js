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
  S.onboarded=1;S.commissionPct=20;S.acquiringPct=2;S.taxPct=0;S.taxFixed=3000;
  S.fundPct=0;S.fundMode='pct';S.carMode='rent';S.rentMode='sum';S.rentAmount=900;S.rentPeriod='day';
  S.fuelKind='petrol';S.fuelGrade='a95';S.fuelPrice=50;S.consumption=10;S.stations=[];
  data.entries=[];data.refuels=[];data.fundOps=[];data.active=null;data.gone={};
  window.D=todayStr();
  window.mk=(id,from,to,km,orders)=>{
    const inp={gross:orders.reduce((a,o)=>a+o.amount,0),tips:0,liters:km/100*10,km:km,
      fuelPrice:50,cardGross:0,ownGross:0,rentShifts:shiftsOnDay(D,false)};
    data.entries.push({id:id,date:D,startT:toMs(D,from),endT:toMs(D,to),
      hours:(toMs(D,to)-toMs(D,from))/3600000,odoStart:0,odoEnd:km,orders:orders,oc:orders.length,
      weather:'',path:[],manualLiters:false,manualTips:true,kmEst:false,auto:false,...inp,
      calc:calc(inp,data.settings)});
  };
  window.snap=()=>{
    const es=data.entries.filter(e=>e.date===D);
    const ae=activeAsEntry();
    const all=ae&&ae.date===D?[...es,ae]:es;
    const sum=k=>all.reduce((a,e)=>a+(+((e.calc||{})[k])||0),0);
    return {змін:all.length,
      замовлень:all.reduce((a,e)=>a+(e.orders||[]).length,0),
      виручка:+all.reduce((a,e)=>a+(+e.gross||0),0).toFixed(2),
      км:+all.reduce((a,e)=>a+(+e.km||0),0).toFixed(1),
      пальне:+sum('fuel').toFixed(2), оренда:+sum('rent').toFixed(2),
      податки:+sum('tax').toFixed(2), наРуки:+sum('personal').toFixed(2)};
  };
});
const show=async(t)=>{const s=await run(()=>snap());console.log(t.padEnd(34),JSON.stringify(s));return s;};

const O=(id,a,km)=>({id,t:0,endT:1,amount:a,odoStart:0,odoEnd:km,pay:'cash',own:false,tip:0});

/* 1 · одна закрита зміна */
await run(()=>{mk(1,'08:00','14:00',100,[{id:11,t:toMs(D,'08:30'),endT:toMs(D,'09:00'),amount:300,odoStart:0,odoEnd:10,pay:'cash',own:false,tip:0}]);});
const s1=await show('1 · одна зміна');

/* 2 · друга зміна того самого дня */
await run(()=>{mk(2,'15:00','20:00',80,[{id:21,t:toMs(D,'16:00'),endT:toMs(D,'16:30'),amount:400,odoStart:0,odoEnd:12,pay:'cash',own:false,tip:0}]);recalcAll();});
const s2=await show('2 · дві зміни за день');
console.log('   оренда за добу має бути 900:',s2.оренда===900?'ok':'ПОМИЛКА '+s2.оренда,
  '· податок 100:',s2.податки===100?'ok':'ПОМИЛКА '+s2.податки);

/* 3 · видаляємо другу зміну — має стати як у кроці 1 */
await run(()=>{markGone('e',2);data.entries=data.entries.filter(x=>x.id!==2);recalcAll();});
const s3=await show('3 · другу зміну видалено');
console.log('   повернулось до кроку 1:',JSON.stringify(s3)===JSON.stringify(s1)?'ok':'ПОМИЛКА');

/* 4 · додаємо замовлення в закриту зміну */
await run(()=>{const e=data.entries[0];e.orders.push({id:12,t:toMs(D,'10:00'),endT:toMs(D,'10:20'),
  amount:250,odoStart:10,odoEnd:18,pay:'card',own:false,tip:0});recalcEntry(e);});
const s4=await show('4 · +замовлення в зміну');

/* 5 · видаляємо його — має повернутись до кроку 1 */
await run(()=>{const e=data.entries[0];e.orders=e.orders.filter(o=>o.id!==12);recalcEntry(e);});
const s5=await show('5 · замовлення видалено');
console.log('   повернулось до кроку 1:',JSON.stringify(s5)===JSON.stringify(s1)?'ok':'ПОМИЛКА');

/* 6 · відкрита зміна з замовленням */
await run(()=>{const now=Date.now();
  data.active={id:3,startT:now-3600000,odoStart:0,breakMs:0,orders:[
    {id:31,t:now-1800000,endT:now-600000,amount:500,odoStart:0,odoEnd:20,pay:'cash',own:false,tip:0}]};recalcAll();});
const s6=await show('6 · +відкрита зміна');

/* 7 · скасовуємо її — має повернутись до кроку 1 */
await run(()=>{markGone('e',data.active.id);data.active=null;recalcAll();});
const s7=await show('7 · відкриту скасовано');
console.log('   повернулось до кроку 1:',JSON.stringify(s7)===JSON.stringify(s1)?'ok':'ПОМИЛКА');

/* 8 · відкрита зміна → закриваємо як звичайну */
await run(()=>{const now=Date.now();
  data.active={id:4,startT:toMs(D,'15:00'),odoStart:0,breakMs:0,orders:[
    {id:41,t:toMs(D,'16:00'),endT:toMs(D,'16:30'),amount:400,odoStart:0,odoEnd:12,pay:'cash',own:false,tip:0}]};
  closeShiftWith({endT:toMs(D,'20:00'),odoEnd:80,tips:0,liters:0,weather:'',auto:false});});
const s8=await show('8 · закрито через closeShiftWith');
console.log('   збіглось із двома змінами (крок 2):',JSON.stringify(s8)===JSON.stringify(s2)?'ok':'ПОМИЛКА');
console.log('помилок JS:',errs.length,errs.slice(0,2).join(' | '));
await b.close();})();
