const { chromium } = require('playwright');
const file = 'file://' + require('node:path').resolve(__dirname, '..', 'index.html');
const out = process.argv[2] || require('os').tmpdir();
(async () => {
const browser = await chromium.launch(); const errors=[]; const results=[];
const ok=(name,cond,extra='')=>results.push(`${cond?'PASS':'FAIL'} ${name} ${extra}`);
function nextMonday(h,m){const d=new Date();d.setDate(d.getDate()+((8-d.getDay())%7||7));d.setHours(h,m,0,0);return d;}
async function ctx(vp,lang,platform,fixedTime){const c=await browser.newContext({viewport:vp,deviceScaleFactor:1,timezoneId:'Europe/Oslo'});const p=await c.newPage();
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
  if(fixedTime){await p.clock.install({time:fixedTime});}
  await p.goto(file);await p.waitForTimeout(300);if(lang)await p.selectOption('#lang',lang);if(platform)await p.selectOption('#platform',platform);await p.waitForTimeout(150);return [c,p];}
const card=p=>p.$eval('.card',e=>e.textContent);
const blocks=[
// 1 slot overwrite warning + rearm later
async()=>{const t0=new Date();const [c,p]=await ctx({width:1280,height:900},'nb','ios',t0);
 await p.click('#simNotif');await p.click('#notif .go');await p.waitForTimeout(150);await p.click('.os .composer button');await p.waitForTimeout(250);
 await p.click('.quick button:nth-child(1)');await p.waitForTimeout(250);const sh=await p.$eval('.sheet',e=>e.textContent).catch(()=>'');
 ok('start-30 while START0630 armed: slot warning + remind-later checkbox',/husker bare én planlagt start/.test(sh)&&/erstatter START0630/.test(sh)&&/på nytt etterpå/.test(sh),sh.slice(0,200));
 await p.click('.sheet .primary');await p.waitForTimeout(150);await p.click('.os .composer button');await p.waitForTimeout(300);
 const cd=await card(p);ok('after overwrite: pending re-arm line for Jobb',/Jobb: START0630 sendes på nytt/.test(cd),cd.slice(0,220));
 await p.screenshot({path:`${out}/slot-warning.png`});
 ok('re-arm button hidden while the new start is still ahead',!(await p.$('.card button.ghost:has-text("Send nå")')));
 await p.clock.setFixedTime(new Date(t0.getTime()+32*60000));await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(150);
 await p.click('.card button.ghost:has-text("Send nå")');await p.waitForTimeout(200);const sh2=await p.$eval('.sheet .cmdbig',e=>e.textContent).catch(()=>'');ok('re-arm sheet for START0630',sh2==='START0630',sh2);
 await p.click('.sheet .primary');await p.waitForTimeout(150);await p.click('.os .composer button');await p.waitForTimeout(300);const cd2=await card(p);ok('after re-arm (32 min later): Jobb armed again, one-off done, no pending line',/Jobb/.test(cd2)&&/START0630/.test(cd2)&&/Starter om/.test(cd2)&&!/sendes på nytt/.test(cd2)&&!/Planlegg start/.test(cd2),cd2.slice(0,160));
 await c.close();},
// 2 sent -> done transition and skipDate reset with fake clock
async()=>{const mon=nextMonday(5,0);const [c,p]=await ctx({width:1280,height:900},'nb','ios',mon);
 await p.click('#simNotif');await p.click('#notif .go');await p.waitForTimeout(150);await p.click('.os .composer button');await p.waitForTimeout(250);
 let cd=await card(p);ok('fake Monday 05:00: START0630 armed for mandag',/mandag/.test(cd)&&/START0630/.test(cd)&&/Starter om/.test(cd),cd.slice(0,160));
 await p.clock.setFixedTime(new Date(mon.getTime()+3*3600000));await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(150);
 cd=await card(p);ok('Monday 08:00: sent occurrence is done, next is tirsdag, no "Starter om 0 min"',/tirsdag/.test(cd)&&!/Starter om 0 min/.test(cd),cd.slice(0,160));
 const badge=await p.$eval('.phone-head .badge',e=>e.textContent);ok('Monday 08:00: status expired to Varmer av',/Varmer av/.test(badge),badge);
 // skip next (tirsdag) then move to Wednesday: skip must be cleared and next = onsdag? (Tue skipped, so Wed) then Thursday: skip cleared -> next = torsdag
 await p.click('text=Hopp over neste');await p.waitForTimeout(150);await p.click('#tabbar button:nth-child(3)');await p.waitForTimeout(100);let row=await p.$eval('.sched-row',e=>e.textContent);ok('skip shows date of skipped tirsdag',/hoppes over/.test(row),row.slice(0,160));
 await p.clock.setFixedTime(new Date(mon.getTime()+2*86400000+3*3600000));await p.click('#tabbar button:nth-child(3)');await p.waitForTimeout(150);row=await p.$eval('.sched-row',e=>e.textContent);
 ok('Wednesday 08:00: skip auto-cleared, next = torsdag',!/hoppes over/.test(row)&&/torsdag/.test(row),row.slice(0,160));
 await p.screenshot({path:`${out}/clock-wed.png`});await c.close();},
// 3 automation skip = confirmation, then STOP reminder via simNotif
async()=>{const [c,p]=await ctx({width:1280,height:900},'nb','ios');
 await p.click('#tabbar button:nth-child(3)');await p.locator('.sched-row').first().locator('.rowbtn').click();await p.click('button.switch[aria-label="Sendes av Kortkommandoer"]');await p.click('.primary');await p.waitForTimeout(150);
 await p.click('#tabbar button:nth-child(1)');await p.click('text=Hopp over neste');await p.waitForTimeout(200);const sh=await p.$eval('.sheet',e=>e.textContent);
 ok('automation skip: confirmation, no STOP command sent now',/Hopp over mandag\?/.test(sh)&&!(await p.$('.sheet .cmdbig')),sh.slice(0,120));
 await p.click('.sheet .primary');await p.waitForTimeout(150);const cd=await card(p);ok('home shows STOP reminder 21:05 line',/STOP-påminnelse kl\. 21:05/.test(cd),cd.slice(0,200));
 ok('no STOP in log yet',!(await p.$$eval('.event code',e=>e.map(x=>x.textContent).some(t=>t==='STOP'))));
 await p.click('#simNotif');await p.waitForTimeout(150);const nb=await p.$eval('#notif .nb',e=>e.textContent);ok('evening reminder is the STOP reminder',/Kortkommandoer sendte START0630/.test(nb)&&/Send STOP nå/.test(nb),nb);
 await p.click('#notif .go');await p.waitForTimeout(150);ok('STOP sheet opens from reminder',(await p.$eval('.sheet .cmdbig',e=>e.textContent))==='STOP');await c.close();},
// 4 recipe uses engine rule at start exactly 21:00
async()=>{const [c,p]=await ctx({width:1280,height:900},'nb','ios');
 await p.click('#tabbar button:nth-child(3)');await p.locator('.sched-row').first().locator('.rowbtn').click();
 for(let i=0;i<14;i++)await p.click('button[aria-label="+1 h"]');for(let i=0;i<6;i++)await p.click('button[aria-label="+5 min"]'); // 21:30 depart, 30 min preheat -> start 21:00
 await p.click('button.switch[aria-label="Sendes av Kortkommandoer"]');await p.click('text=Oppskrift for Kortkommandoer');await p.waitForTimeout(150);
 const txt=await p.$eval('#screen',e=>e.textContent);ok('recipe for 21:00 start: send 21:30 day before (window), START2100',/Tid 21:30/.test(txt)&&/START2100/.test(txt),txt.slice(0,220));
 await p.screenshot({path:`${out}/recipe-2100.png`});await c.close();},
// 5 widths incl. new screens
async()=>{let fails=0;for(const lang of ['nb','de','fi','fr']){for(const w of [360,390]){const [c,p]=await ctx({width:w,height:800},lang,'ios');
   await p.click('#simNotif');await p.click('#notif .go');await p.waitForTimeout(100);await p.click('.os .composer button');await p.waitForTimeout(150);await p.click('.quick button:nth-child(1)');await p.waitForTimeout(150);
   const [sw,iw]=await p.evaluate(()=>[document.documentElement.scrollWidth,window.innerWidth]);if(sw>iw){fails++;ok(`${lang} ${w} slot sheet overflow`,false,`${sw}/${iw}`);}await c.close();}}
 ok('slot-warning sheet: no overflow in 4 langs × 360/390',fails===0);},
];
for(const [i,b] of blocks.entries()){try{await b();}catch(e){results.push(`CRASH block ${i+1}: ${e.message.split('\n')[0]}`);}}
console.log(results.join('\n'));console.log('errors:',errors.length?errors:'none');await browser.close();})();
