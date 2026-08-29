const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(2200);
const out=await p.evaluate(()=>{
  document.getElementById('modal-intro').classList.remove('open');
  const S=data.settings;
  S.onboarded=1;S.commissionPct=20;S.acquiringPct=2;S.taxPct=5;S.taxFixed=0;
  S.fundPct=15;S.fundMode='pct';S.carMode='own';S.fuelKind='gas';S.fuelGrade='gas';
  S.fuelPrice=45;S.consumption=9;S.tankLiters=35;S.serviceTarget=20000;S.stations=[];
  S.calcMode='exact';                       /* саме той режим, що в власника */
  data.entries=[];data.refuels=[];data.fundOps=[];data.active=null;data.gone={};
  const D=todayStr();
  data.refuels.push({id:500,date:D,liters:30,price:44.9,sum:1347,odo:0,full:true,reset:true,
    resetAt:toMs(D,'08:00')});
  const mk=(id,from,to,km,amount)=>{
    const o=[{id:id*10,t:toMs(D,from),endT:toMs(D,to),amount:amount,odoStart:0,odoEnd:km*0.7,
      pay:'cash',own:false,tip:0}];
    const inp={gross:amount,tips:0,liters:km/100*9,km:km,fuelPrice:45,cardGross:0,ownGross:0,rentShifts:1};
    data.entries.push({id:id,date:D,startT:toMs(D,from),endT:toMs(D,to),
      hours:(toMs(D,to)-toMs(D,from))/3600000,odoStart:0,odoEnd:km,orders:o,oc:1,weather:'',
      path:[],manualLiters:false,manualTips:true,kmEst:false,auto:false,...inp,calc:calc(inp,S)});
  };
  mk(1,'10:16','13:06',33.8,547);
  mk(2,'14:00','15:30',12.8,281);
  recalcAll();renderAll();

  const dayFuel=data.entries.filter(e=>e.date===D).reduce((a,e)=>a+e.calc.fuel,0)
    +((activeAsEntry()&&activeAsEntry().calc.fuel)||0);
  const dayKm=data.entries.filter(e=>e.date===D).reduce((a,e)=>a+(+e.km||0),0)+activeKmEst();
  const ts=tankSaving(), tl=tankLevel()||{};
  const fundScreen=()=>+((document.getElementById('fund-balance')||{}).textContent||'')
    .replace(/[^\d,.-]/g,'').replace(/\s/g,'').replace(',','.');
  const fundDay=data.entries.filter(e=>e.date===D).reduce((a,e)=>a+e.calc.fund,0)
    +((activeAsEntry()&&activeAsEntry().calc.fund)||0);
  const r1={'пальне у статистиці за день':+dayFuel.toFixed(2),
            'відкладено на балон (Бак)':+ts.saved.toFixed(2),
            'км у статистиці':+dayKm.toFixed(1),'км у Баку':+(tl.km||0).toFixed(1),
            'фонд на екрані Сервіс':fundScreen(),'фонд за день':+fundDay.toFixed(2)};

  /* тепер відкрита зміна — обидва екрани мають рухатись разом */
  data.active={id:9,startT:toMs(D,'16:00'),odoStart:46.6,breakMs:0,orders:[
    {id:91,t:toMs(D,'16:10'),endT:toMs(D,'16:40'),amount:300,odoStart:46.6,odoEnd:60,pay:'cash',own:false,tip:0}]};
  recalcAll();renderAll();
  const dayFuel2=data.entries.filter(e=>e.date===D).reduce((a,e)=>a+e.calc.fuel,0)
    +((activeAsEntry()&&activeAsEntry().calc.fuel)||0);
  const ts2=tankSaving();
  const fundDay2=data.entries.filter(e=>e.date===D).reduce((a,e)=>a+e.calc.fund,0)
    +((activeAsEntry()&&activeAsEntry().calc.fund)||0);
  const r2={'пальне у статистиці':+dayFuel2.toFixed(2),'відкладено на балон':+ts2.saved.toFixed(2),
            'фонд на екрані Сервіс':fundScreen(),'фонд за день':+fundDay2.toFixed(2)};
  return {без:r1,зВідкритою:r2};
});
console.log('БЕЗ ВІДКРИТОЇ ЗМІНИ');
Object.entries(out.без).forEach(([k,v])=>console.log('  '+k.padEnd(30),v));
console.log('  збіг пальне/балон:',Math.abs(out.без['пальне у статистиці за день']-out.без['відкладено на балон (Бак)'])<0.5?'ok':'РОЗБІЖНІСТЬ');
console.log('  збіг км:',Math.abs(out.без['км у статистиці']-out.без['км у Баку'])<0.15?'ok':'РОЗБІЖНІСТЬ');
console.log('  збіг фонду:',Math.abs(out.без['фонд на екрані Сервіс']-out.без['фонд за день'])<1?'ok':'РОЗБІЖНІСТЬ');
console.log('З ВІДКРИТОЮ ЗМІНОЮ');
Object.entries(out.зВідкритою).forEach(([k,v])=>console.log('  '+k.padEnd(30),v));
console.log('  збіг пальне/балон:',Math.abs(out.зВідкритою['пальне у статистиці']-out.зВідкритою['відкладено на балон'])<0.5?'ok':'РОЗБІЖНІСТЬ');
console.log('  збіг фонду:',Math.abs(out.зВідкритою['фонд на екрані Сервіс']-out.зВідкритою['фонд за день'])<1?'ok':'РОЗБІЖНІСТЬ');
console.log('помилок JS:',errs.length,errs.slice(0,2).join(' | '));
await b.close();})();
