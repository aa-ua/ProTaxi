const {chromium}=require('playwright');
const R=[];const ok=(n,c,d)=>R.push({n,ok:!!c,d:d||''});
(async()=>{
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--ignore-certificate-errors','--no-sandbox'],
  proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e.message)));
await p.goto('file:///home/user/Ye-taksyst-/index.html');
await p.waitForTimeout(2400);
const ev=fn=>p.evaluate(fn);
await ev(()=>{document.getElementById('modal-intro').classList.remove('open');data.settings.onboarded=1;});

/* 1 · витрата від бака до бака — з правильним одометром */
const c1=await ev(()=>{
  data.refuels=[];data.entries=[];
  data.refuels.push({id:1,date:'2026-08-01',liters:40,price:50,sum:2000,odo:380,full:true,
    reset:true,resetAt:toMs('2026-08-01','08:00'),t:toMs('2026-08-01','08:00')});
  data.refuels.push({id:2,date:'2026-08-05',liters:38,price:50,sum:1900,odo:420,full:true,
    reset:false,t:toMs('2026-08-05','09:00')});
  const ps=tankPeriods();
  return {n:ps.length,cons:ps.length?+ps[0].cons.toFixed(2):null,km:ps.length?ps[0].km:null};});
ok('витрата від бака до бака',c1.n>=1&&c1.cons>0,JSON.stringify(c1));

/* 2 · заправка з нульовим одометром відкидається (як задумано) */
const c2=await ev(()=>{
  data.refuels=[{id:1,date:'2026-08-01',liters:40,price:50,sum:2000,odo:0,full:true,t:1},
                {id:2,date:'2026-08-05',liters:38,price:50,sum:1900,odo:420,full:true,t:2}];
  return tankPeriods().length;});
ok('заправка без одометра не ламає розрахунок',c2===0,String(c2));

/* 3 · знижки на АЗС: вигідна не та, де більша знижка */
const c3=await ev(()=>{
  const s=data.settings;s.fuelKind='petrol';s.fuelGrade='a95';s.fuelPrice=50;
  s.stations=[{id:1,name:'А',price:56,mode:'uah',val:5},{id:2,name:'Б',price:52,mode:'uah',val:2}];
  s.stationId=1;
  return {А:+stationNet(s.stations[0],s).toFixed(2),Б:+stationNet(s.stations[1],s).toFixed(2),
          основна:+netPrice(s).toFixed(2)};});
ok('ціна мережі рахується від табло',c3.А===51&&c3.Б===50&&c3.основна===51,JSON.stringify(c3));

/* 4 · домашня зарядка для електро */
const c4=await ev(()=>{
  const s=data.settings;s.fuelKind='ev';s.fuelGrade='ev';s.stations=[];
  ensureHomeStations(s);
  const h=homeStations(s);
  return {скільки:h.length,ціни:h.map(x=>x.price).sort()};});
ok('домашня зарядка зʼявляється',c4.скільки===2&&c4.ціни[0]>0,JSON.stringify(c4));

/* 5 · ціль дня рахується від «на руки» */
const c5=await ev(()=>{
  const s=data.settings;s.fuelKind='petrol';s.fuelGrade='a95';s.stations=[];s.dailyGoal=1500;
  s.carMode='own';s.commissionPct=20;s.acquiringPct=0;s.taxPct=0;s.taxFixed=0;s.fundPct=0;
  data.entries=[];data.active=null;data.refuels=[];
  const D=todayStr();
  const inp={gross:1000,tips:0,liters:0,km:0,fuelPrice:50,cardGross:0,ownGross:0,rentShifts:1};
  data.entries.push({id:1,date:D,startT:toMs(D,'08:00'),endT:toMs(D,'12:00'),hours:4,
    odoStart:0,odoEnd:0,orders:[],oc:0,weather:'',...inp,calc:calc(inp,s)});
  recalcAll();
  return {наРуки:+todayTotals().personal.toFixed(2)};});
ok('ціль рахується від «на руки»',c5.наРуки===800,JSON.stringify(c5));

/* 6 · зміна налаштувань перераховує всю історію */
const c6=await ev(()=>{
  const was=data.entries[0].calc.commission;
  data.settings.commissionPct=25;recalcAll();
  const now=data.entries[0].calc.commission;
  data.settings.commissionPct=20;recalcAll();
  return {було:was,стало:now,назад:data.entries[0].calc.commission};});
ok('налаштування перераховують історію',c6.було===200&&c6.стало===250&&c6.назад===200,JSON.stringify(c6));

/* 7 · ручне поповнення фонду */
const c7=await ev(()=>{
  data.fundOps=[];renderFunds();
  const b0=(document.getElementById('fund-balance')||{}).textContent;
  data.fundOps.push({id:1,date:todayStr(),amount:1000,in:true,desc:'Поповнення'});
  renderFunds();
  const b1=(document.getElementById('fund-balance')||{}).textContent;
  data.fundOps.push({id:2,date:todayStr(),amount:400,desc:'Витрата'});
  renderFunds();
  const b2=(document.getElementById('fund-balance')||{}).textContent;
  return {порожньо:b0,після1000:b1,після400:b2};});
ok('поповнення й витрата фонду',/1\s?000/.test(c7.після1000)&&/600/.test(c7.після400),JSON.stringify(c7));

/* 8 · знайомство відкривається й закривається */
const c8=await ev(()=>{const before=errs=>0;openIntro();
  const o=document.getElementById('modal-intro').classList.contains('open');
  closeM('modal-intro');return o;});
ok('знайомство відкривається',c8);

/* 9 · словник понять і «Що нового» */
const c9=await ev(()=>{
  let r={};
  try{openM('modal-gloss');r.about=true;closeM('modal-gloss');}catch(e){r.about=String(e.message);}
  try{openM('modal-changelog');r.chg=true;closeM('modal-changelog');}catch(e){r.chg=String(e.message);}
  return r;});
ok('вікна «Словник» і «Що нового»',c9.about===true&&c9.chg===true,JSON.stringify(c9));

/* 10 · діагностика сховища не показує зайвого */
const c10=await ev(()=>{renderDiag();
  const t=(document.getElementById('diag-list')||{}).textContent||'';
  return {є:t.length>0,домен:/github|\.io|Домен|Сторінка/i.test(t),адмін:/Адмін|панель/i.test(t)};});
ok('у діагностиці немає домену й адмінки',c10.є&&!c10.домен&&!c10.адмін,JSON.stringify(c10));

/* 11 · мапа з точками */
const c11=await ev(()=>{
  data.entries[0].path=[[48.46,35.04],[48.47,35.05]];
  try{goScreen('map');renderRouteAnalytics();return true;}catch(e){return String(e.message);}});
await p.waitForTimeout(600);
ok('мапа з точками малюється',c11===true,String(c11));

/* 12 · темп замовлень потребує щонайменше 4 */
const c12=await ev(()=>{
  const D=todayStr();
  data.entries[0].orders=[1,2,3].map(i=>({id:i,t:toMs(D,'08:0'+i),endT:toMs(D,'08:3'+i),
    amount:200,odoStart:i*10,odoEnd:i*10+8,pay:'cash',own:false,tip:0}));
  recalcEntry(data.entries[0]);recalcAll();
  const s=ordersStatsIn(D,D);
  return {n:s.n,all:s.all};});
ok('розбір рахує лише завершені',c12.n===3&&c12.all===3,JSON.stringify(c12));

/* 13 · «Замовлень» і розбір розходяться лише на відкриті */
const c13=await ev(()=>{
  const D=todayStr();
  data.active={id:9,startT:toMs(D,'14:00'),odoStart:0,breakMs:0,orders:[
    {id:91,t:toMs(D,'14:10'),endT:0,amount:0,odoStart:0,odoEnd:0,pay:'cash',own:false,tip:0}]};
  const s=ordersStatsIn(D,D);
  const tile=data.entries.filter(e=>e.date===D).reduce((a,e)=>a+(e.oc||0),0)+
             (activeAsEntry()?activeAsEntry().oc:0);
  data.active=null;
  return {розбір:s.n,усього:s.all,плитка:tile};});
ok('плитка = усі, розбір = завершені',c13.усього===c13.плитка&&c13.розбір===c13.усього-1,JSON.stringify(c13));

/* 14 · чат: без сервера кнопки немає, підтримка відкривається */
const c14=await ev(()=>{
  chatOn=false;paintFab();
  const hidden=!document.getElementById('fab-chat').classList.contains('on');
  /* поза Telegram підтримка відкриває бот, тому перевіряємо саме те,
     що застосунок не ламається і кнопка чату не світиться */
  let broke=false;try{openChat();}catch(e){broke=true;}
  return {hidden,broke};});
ok('без сервера чат не ламається',c14.hidden&&!c14.broke,JSON.stringify(c14));

ok('жодної помилки JS за прогін',errs.length===0,errs.slice(0,3).join(' | '));
console.log('');
R.forEach(r=>console.log((r.ok?'  ok  ':'ПРОБЛЕМА')+' · '+r.n+(r.d&&!r.ok?'  → '+r.d:'')));
console.log('\nперевірок:',R.length,'· проблем:',R.filter(x=>!x.ok).length);
await b.close();})();
