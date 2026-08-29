const {chromium}=require('playwright');
const R=[];const ok=(n,c,d)=>R.push({n,ok:!!c,d:d||''});
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const ctx=await b.newContext({viewport:{width:390,height:844}});
const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e.message)));
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(2400);
const ev=fn=>p.evaluate(fn);

await ev(()=>{document.getElementById('modal-intro').classList.remove('open');
  data.settings.onboarded=1;});

/* ── 1 · усі екрани малюються без помилок ── */
for(const sc of ['shift','stats','map','tank','funds']){
  await ev(new Function(`goScreen('${sc}');renderAll();`));
  await p.waitForTimeout(250);
}
ok('усі екрани малюються',errs.length===0,errs.slice(0,2).join(' | '));

/* ── 2 · періоди статистики ── */
let bad=[];
for(const per of ['today','yesterday','week','month','year','all','day']){
  const before=errs.length;
  await ev(new Function(`period='${per}';dayCursor=todayStr();renderStats();`));
  await p.waitForTimeout(120);
  if(errs.length>before)bad.push(per);
}
ok('усі періоди статистики',bad.length===0,bad.join(','));

/* ── 3 · види пального й валюти ── */
bad=[];
for(const k of ['petrol','gas','ev']){
  for(const c of ['UAH','PLN','EUR','HUF']){
    const before=errs.length;
    await ev(new Function(`data.settings.fuelKind='${k}';data.settings.fuelGrade=gradesFor('${k}')[0];
      data.settings.currency='${c}';ensureHomeStations(data.settings);recalcAll();renderAll();
      renderSettings();renderTank();`));
    if(errs.length>before)bad.push(k+'/'+c);
  }
}
ok('пальне × валюти',bad.length===0,bad.join(','));
const lab=await ev(()=>{data.settings.fuelKind='ev';data.settings.fuelGrade='ev';
  data.settings.currency='PLN';paintCurrency();renderTank();renderSettings();
  return {price:(document.getElementById('lab-price')||{}).textContent,
          tank:(document.getElementById('tank-title')||{}).textContent||''};});
ok('підпис ціни під електро й злоті',/кВт|zł/i.test(lab.price||''),JSON.stringify(lab));

/* ── 4 · режими оренди й фонду ── */
bad=[];
for(const rm of ['sum','pct'])for(const fm of ['pct','km']){
  const before=errs.length;
  await ev(new Function(`data.settings.carMode='rent';data.settings.rentMode='${rm}';
    data.settings.rentAmount=800;data.settings.rentPct=10;data.settings.fundMode='${fm}';
    data.settings.fundPct=15;data.settings.fundPerKm=3;recalcAll();renderAll();`));
  if(errs.length>before)bad.push(rm+'/'+fm);
}
ok('оренда × фонд',bad.length===0,bad.join(','));

/* ── 5 · розрахунок: свій клієнт і еквайринг ── */
const c5=await ev(()=>{
  const s={...data.settings,commissionPct:20,acquiringPct:2,taxPct:0,taxFixed:0,
    fundPct:0,fundMode:'pct',carMode:'own'};
  const a=calc({gross:1000,tips:0,liters:0,km:0,fuelPrice:0,cardGross:1000,ownGross:0,rentShifts:1},s);
  const b=calc({gross:1000,tips:0,liters:0,km:0,fuelPrice:0,cardGross:1000,ownGross:1000,rentShifts:1},s);
  return {звичайний:+a.commission.toFixed(2),свій:+b.commission.toFixed(2),
          еквЗвич:+a.acquiring.toFixed(2),еквСвій:+b.acquiring.toFixed(2)};});
ok('свій клієнт без комісії',c5.звичайний===200&&c5.свій===0,JSON.stringify(c5));

/* ── 6 · заправки: періоди, витрата, обнулення ── */
const c6=await ev(()=>{
  data.refuels=[];data.entries=[];
  const D=todayStr();
  data.refuels.push({id:1,date:'2026-08-01',liters:40,price:50,sum:2000,odo:380,full:true,reset:true,resetAt:toMs('2026-08-01','08:00'),t:toMs('2026-08-01','08:00')});
  data.refuels.push({id:2,date:'2026-08-05',liters:38,price:50,sum:1900,odo:420,full:true,reset:false,t:toMs('2026-08-05','09:00')});
  const ps=tankPeriods();
  return {періодів:ps.length,витрата:ps.length?+ps[0].cons.toFixed(2):null};});
ok('витрата від бака до бака',c6.періодів>=1&&c6.витрата>0,JSON.stringify(c6));

/* ── 7 · одометр лише зростає ── */
const c7=await ev(()=>{
  const t=Date.now();
  data.refuels=[];
  data.active={id:7,startT:t-7200000,odoStart:10,breakMs:0,orders:[
    {id:71,t:t-6000000,endT:t-5000000,amount:100,odoStart:10,odoEnd:60,pay:'cash',own:false,tip:0},
    {id:72,t:t-4000000,endT:t-3000000,amount:100,odoStart:60,odoEnd:40,pay:'cash',own:false,tip:0}]};
  return lastOdometer();});
ok('одометр бере найбільше',c7===60,String(c7));

/* ── 8 · пауза не пускає замовлення ── */
const c8=await ev(()=>{pauseShift();openNewOrder();
  const r=document.getElementById('modal-paused').classList.contains('open')&&
          !document.getElementById('modal-order').classList.contains('open');
  closeM('modal-paused');resumeShift();return r;});
ok('на паузі замовлення не приймається',c8);

/* ── 9 · картка підсумку малюється ── */
const c9=await ev(async()=>{try{await drawShare('today');return true;}catch(e){return String(e.message);}});
ok('картка «Поділитись підсумком»',c9===true,String(c9));

/* ── 10 · збереження й відновлення ── */
await ev(async()=>{data.active=null;data.entries=[];data.refuels=[];data.fundOps=[];
  const D=todayStr();
  const inp={gross:500,tips:0,liters:5,km:50,fuelPrice:50,cardGross:0,ownGross:0,rentShifts:1};
  data.entries.push({id:77,date:D,startT:toMs(D,'08:00'),endT:toMs(D,'12:00'),hours:4,
    odoStart:0,odoEnd:50,orders:[],oc:0,weather:'',...inp,calc:calc(inp,data.settings)});
  await persist();});
await p.reload();await p.waitForTimeout(2400);
const c10=await ev(()=>({записів:data.entries.length,є77:data.entries.some(e=>e.id===77)}));
ok('запис пережив перезавантаження',c10.є77,JSON.stringify(c10));

/* ── 11 · вузький екран без горизонтальної прокрутки ── */
await p.setViewportSize({width:320,height:568});
await p.waitForTimeout(400);
const c11=await ev(()=>{const d=document.documentElement;
  return {scroll:d.scrollWidth,client:d.clientWidth};});
ok('320 px без бічної прокрутки',c11.scroll<=c11.client+1,JSON.stringify(c11));

/* ── 12 · вікна не вилазять на короткому екрані ── */
await p.setViewportSize({width:375,height:667});
await p.waitForTimeout(300);
bad=[];
for(const m of ['modal-order','modal-finish','modal-close','modal-refuel','modal-chat','modal-support']){
  const r=await ev(new Function(`openM('${m}');const el=document.querySelector('#${m} .modal');
    const b=el.getBoundingClientRect();closeM('${m}');
    return {top:Math.round(b.top),h:Math.round(b.height)};`));
  if(r.top<-1)bad.push(m+' (верх '+r.top+')');
}
ok('вікна не вилазять угору на 667 px',bad.length===0,bad.join(', '));

await p.setViewportSize({width:390,height:844});
ok('жодної помилки JS за весь прогін',errs.length===0,errs.slice(0,3).join(' | '));

console.log('');
R.forEach(r=>console.log((r.ok?'  ok  ':'ПРОБЛЕМА')+' · '+r.n+(r.d&&!r.ok?'  → '+r.d:'')));
console.log('\nвсього перевірок:',R.length,'· проблем:',R.filter(x=>!x.ok).length);
await b.close();})();
