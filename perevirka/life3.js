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
  S.onboarded=1;S.commissionPct=20;S.acquiringPct=2;S.taxPct=5;S.taxFixed=1500;
  S.fundPct=15;S.fundMode='pct';S.carMode='rent';S.rentMode='sum';S.rentAmount=800;S.rentPeriod='day';
  S.fuelKind='gas';S.fuelGrade='gas';S.fuelPrice=45;S.consumption=9;S.tankLiters=35;
  S.serviceTarget=20000;S.stations=[];
  data.entries=[];data.refuels=[];data.fundOps=[];data.active=null;data.gone={};
  const D=todayStr();
  data.refuels.push({id:500,date:D,liters:30,price:45,sum:1350,odo:0,full:true,reset:true,
    resetAt:toMs(D,'08:00')});
  data.fundOps.push({id:600,date:D,amount:500,in:true,desc:'Поповнення'});
  window.mk=(id,from,to,km,amount)=>{
    const o=[{id:id*10,t:toMs(D,from),endT:toMs(D,to),amount:amount,odoStart:0,odoEnd:km*0.7,
      pay:'cash',own:false,tip:0}];
    const inp={gross:amount,tips:0,liters:km/100*9,km:km,fuelPrice:45,cardGross:0,ownGross:0,rentShifts:1};
    data.entries.push({id:id,date:D,startT:toMs(D,from),endT:toMs(D,to),
      hours:(toMs(D,to)-toMs(D,from))/3600000,odoStart:0,odoEnd:km,orders:o,oc:1,weather:'',
      path:[],manualLiters:false,manualTips:true,kmEst:false,auto:false,...inp,calc:calc(inp,S)});
  };
  window.all=()=>{
    const tl=tankLevel()||{};const ts=tankSaving();const fp=fuelPurse();
    const spent=data.fundOps.filter(o=>!o.in).reduce((a,o)=>a+(+o.amount||0),0);
    const added=data.fundOps.filter(o=>o.in).reduce((a,o)=>a+(+o.amount||0),0);
    const earned=data.entries.reduce((a,e)=>a+e.calc.fund,0);
    const D=todayStr();
    const es=data.entries.filter(e=>e.date===D);
    const ae=activeAsEntry();const day=ae&&ae.date===D?[...es,ae]:es;
    const S=k=>+day.reduce((a,e)=>a+(+(e.calc||{})[k]||0),0).toFixed(2);
    return {бакЛітрів:+(tl.left||0).toFixed(1), бакКм:+(tl.km||0).toFixed(1),
      наБалонВідкладено:+ts.saved.toFixed(2), ціль:+ts.target.toFixed(2),
      папкаПальне:+fp.balance.toFixed(2),
      фондОбслуговування:+(earned+added-spent).toFixed(2),
      деньОренда:S('rent'), деньПодатки:S('tax'), деньПальне:S('fuel'), деньНаРуки:S('personal'),
      деньКм:+day.reduce((a,e)=>a+(+e.km||0),0).toFixed(1)};
  };
  mk(1,'09:00','15:00',100,900);
  recalcAll();
});
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const show=async t=>{const s=await run(()=>all());console.log(t.padEnd(30),JSON.stringify(s));return s;};

const base=await show('1 · база: одна зміна');

/* 2 · тестова зміна відкрита й із замовленням */
await run(()=>{const D=todayStr();const now=Date.now();
  data.active={id:9,startT:toMs(D,'16:00'),odoStart:100,breakMs:0,orders:[
    {id:91,t:toMs(D,'16:10'),endT:toMs(D,'16:40'),amount:400,odoStart:100,odoEnd:118,pay:'cash',own:false,tip:0}]};
  recalcAll();});
const s2=await show('2 · +тестова відкрита');
console.log('   бак і фонд змінились:',(s2.бакЛітрів!==base.бакЛітрів)?'ok':'ПОМИЛКА');

/* 3 · скасовуємо тестову — усе має повернутись */
await run(()=>{markGone('e',data.active.id);data.active=null;recalcAll();});
const s3=await show('3 · тестову скасовано');
console.log('   ПОВЕРНУЛОСЬ УСЕ:',eq(s3,base)?'ok':'ПОМИЛКА → '+JSON.stringify(
  Object.fromEntries(Object.keys(base).filter(k=>base[k]!==s3[k]).map(k=>[k,[base[k],s3[k]]]))));

/* 4 · тестову зміну закрили як звичайну, потім видалили з історії */
await run(()=>{const D=todayStr();
  data.active={id:8,startT:toMs(D,'16:00'),odoStart:100,breakMs:0,orders:[
    {id:81,t:toMs(D,'16:10'),endT:toMs(D,'16:40'),amount:400,odoStart:100,odoEnd:118,pay:'cash',own:false,tip:0}]};
  closeShiftWith({endT:toMs(D,'18:00'),odoEnd:130,tips:0,liters:0,weather:'',auto:false});});
const s4=await show('4 · тестову закрито');
await run(()=>{markGone('e',8);data.entries=data.entries.filter(x=>x.id!==8);recalcAll();});
const s5=await show('5 · запис видалено');
console.log('   ПОВЕРНУЛОСЬ УСЕ:',eq(s5,base)?'ok':'ПОМИЛКА → '+JSON.stringify(
  Object.fromEntries(Object.keys(base).filter(k=>base[k]!==s5[k]).map(k=>[k,[base[k],s5[k]]]))));

/* 6 · видалення замовлення всередині зміни */
await run(()=>{const e=data.entries[0];
  e.orders.push({id:12,t:toMs(todayStr(),'12:00'),endT:toMs(todayStr(),'12:30'),
    amount:300,odoStart:70,odoEnd:80,pay:'card',own:false,tip:0});recalcEntry(e);recalcAll();});
const s6=await show('6 · +замовлення у зміну');
await run(()=>{const e=data.entries[0];e.orders=e.orders.filter(o=>o.id!==12);recalcEntry(e);recalcAll();});
const s7=await show('7 · замовлення видалено');
console.log('   ПОВЕРНУЛОСЬ УСЕ:',eq(s7,base)?'ok':'ПОМИЛКА → '+JSON.stringify(
  Object.fromEntries(Object.keys(base).filter(k=>base[k]!==s7[k]).map(k=>[k,[base[k],s7[k]]]))));
console.log('помилок JS:',errs.length,errs.slice(0,2).join(' | '));
await b.close();})();
