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
const out=await p.evaluate(async()=>{
  document.getElementById('modal-intro').classList.remove('open');
  const S=data.settings;
  S.onboarded=1;S.commissionPct=20;S.acquiringPct=2;S.taxPct=0;S.fundPct=25;S.fundMode='pct';
  S.carMode='own';S.fuelKind='petrol';S.fuelGrade='a95';S.fuelPrice=45;S.consumption=9;
  data.entries=[];data.refuels=[];data.fundOps=[];
  const d=todayStr();
  const t=x=>toMs(d,x);
  /* закрита зміна як у власника: 10:16–13:06, два замовлення, одометр 0→33,8 */
  const orders=[
    {id:1,t:t('10:37'),endT:t('11:01'),amount:291,odoStart:0,odoEnd:14.6,pay:'card',own:false,tip:0},
    {id:2,t:t('10:40'),endT:t('11:27'),amount:256,odoStart:14.6,odoEnd:25,pay:'cash',own:false,tip:0}];
  const inp={gross:547,tips:0,liters:33.8/100*9,km:33.8,fuelPrice:45,cardGross:291,ownGross:0,rentShifts:1};
  data.entries.push({id:100,date:d,startT:t('10:16'),endT:t('13:06'),hours:2.833,
    odoStart:0,odoEnd:33.8,orders:orders,oc:2,weather:'',path:[],manualLiters:false,
    manualTips:true,kmEst:false,auto:false,...inp,calc:calc(inp,S)});
  /* відкрита зміна: почалась дві хвилини тому, одометр вписано вчорашній */
  const now=Date.now();
  data.active={id:200,startT:now-2*60000,odoStart:13.9,breakMs:0,orders:[
    {id:3,t:now-60000,endT:0,amount:230,odoStart:63.4,odoEnd:0,pay:'cash',own:false,tip:0}]};
  recalcAll();
  period='today';goScreen('stats');renderAll();
  const g=id=>(document.getElementById(id)||{}).textContent;
  return {kmЗміни:activeKmEst(),
          плиткаЗамовлень:g('s-orders'),
          розбір:(document.querySelector('#orders-analysis .card-title')||{}).textContent,
          підказка:(document.querySelector('#orders-analysis .hint')||{}).textContent,
          деньКм:(data.entries.reduce((a,e)=>a+(+e.km||0),0)+activeKmEst()).toFixed(1)};
});
console.log(JSON.stringify(out,null,1));
console.log('помилок JS:',errs.length,errs.slice(0,2).join(' | '));
await b.close();})();
