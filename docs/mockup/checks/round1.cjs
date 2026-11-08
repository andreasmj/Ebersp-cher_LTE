const { chromium } = require('playwright');
const file = 'file://' + require('node:path').resolve(__dirname, '..', 'index.html');
const out = process.argv[2] || require('os').tmpdir();
(async () => {
const browser = await chromium.launch(); const errors=[]; const results=[];
const ok=(name,cond,extra='')=>results.push(`${cond?'PASS':'FAIL'} ${name} ${extra}`);
async function ctx(vp,dark,lang,platform){const c=await browser.newContext({viewport:vp,deviceScaleFactor:1,colorScheme:dark?'dark':'light',timezoneId:'Europe/Oslo'});const p=await c.newPage();
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
  await p.goto(file);await p.waitForTimeout(400);if(lang)await p.selectOption('#lang',lang);if(platform)await p.selectOption('#platform',platform);await p.waitForTimeout(200);return [c,p];}
const inView=async(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return 'missing';const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=window.innerHeight?'in':`out(top=${Math.round(r.top)},bottom=${Math.round(r.bottom)},vh=${window.innerHeight})`;},sel);
const blocks=[
async()=>{const [c,p]=await ctx({width:360,height:740},false,'fi');
 ok('compatMode CSS1Compat',await p.evaluate(()=>document.compatMode)==='CSS1Compat');
 ok('no horizontal scroll 360',!(await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth)));
 await p.click('.bigbtn');await p.waitForTimeout(300);
 const v=await inView(p,'.os.show .composer');ok('360 fi: OS composer in viewport',v==='in',v);
 await p.screenshot({path:`${out}/360-fi-os.png`});await c.close();},
async()=>{const [c,p]=await ctx({width:390,height:844},false,'nb');
 await p.click('#tabbar button:nth-child(4)');await p.waitForTimeout(150);
 await p.click('button.switch[aria-label="Bekreft før sending"]');await p.waitForTimeout(150);
 await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(150);await p.click('.bigbtn');await p.waitForTimeout(300);
 const v=await inView(p,'.sheet .primary');ok('390 nb: sheet Send button in viewport',v==='in',v);
 await p.screenshot({path:`${out}/390-nb-sheet.png`});await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 const inEvents=await p.$$eval('.event.in',e=>e.length);ok('iOS: no module replies in log',inEvents===0,String(inEvents));
 await p.click('#simReply');await p.waitForTimeout(200);
 ok('iOS: simulate reply adds no in-event',(await p.$$eval('.event.in',e=>e.length))===0);
 const toast=await p.$eval('#toast',e=>e.textContent);ok('iOS: toast says reply in Messages',/Meldinger/.test(toast),toast);
 await p.click('.bigbtn');await p.waitForTimeout(250);ok('iOS compose default: Messages opens directly',await p.$eval('#os',e=>e.classList.contains('show')));
 await p.click('.os .composer button');await p.waitForTimeout(300);
 const badge=await p.$eval('.phone-head .badge',e=>e.textContent);ok('iOS: status assumed after START',/antatt/.test(badge),badge);
 await p.screenshot({path:`${out}/ios-home-after-start.png`});await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('#simNotif');await p.waitForTimeout(200);await p.click('#notif .go');await p.waitForTimeout(300);
 await p.click('.os .composer button');await p.waitForTimeout(400);
 const card=await p.$eval('.card',e=>e.textContent);
 ok('after reminder: next card shows Jobb + Starter om',/Jobb/.test(card)&&/Starter om/.test(card),card.slice(0,160));
 ok('after reminder: no "Dekket av"',!/Dekket av|Erstattet/.test(card));
 await p.click('text=Hopp over neste');await p.waitForTimeout(300);
 const sh=await p.$eval('.sheet',e=>e.textContent).catch(()=>'');ok('skip after sent opens STOP sheet',/STOP/.test(sh)&&/allerede sendt/.test(sh),sh.slice(0,120));
 await p.screenshot({path:`${out}/skip-after-sent.png`});
 await p.click('.sheet .link');await p.waitForTimeout(200);
 await p.click('.stopbtn');await p.waitForTimeout(300);
 const sh2=await p.$eval('.sheet',e=>e.textContent).catch(()=>'');ok('STOP with armed start shows warning + rearm',/sletter også planlagt start/.test(sh2)&&/på nytt etterpå/.test(sh2),sh2.slice(0,160));
 await p.screenshot({path:`${out}/stop-warning.png`});
 await p.click('.sheet .primary');await p.waitForTimeout(200);await p.click('.os .composer button');await p.waitForTimeout(1300);
 const sh3=await p.$eval('.sheet .cmdbig',e=>e.textContent).catch(()=>'none');ok('after STOP, re-arm sheet opens with START0630',sh3==='START0630',sh3);
 await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('#tabbar button:nth-child(3)');await p.waitForTimeout(150);await p.click('.fab');await p.waitForTimeout(150);
 for(let i=0;i<16;i++){await p.click('button[aria-label="+1 h"]');}
 await p.waitForTimeout(100);await p.click('.primary');await p.waitForTimeout(200);
 await p.locator('.sched-row').first().locator('button.switch').click();await p.waitForTimeout(100);
 await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(150);
 const info=await p.evaluate(()=>document.querySelector('.card').textContent);
 ok('late plan 22:30 start (v1.2 rule): sent the same evening 21:00 = tomorrow 21:00',/i morgen kl\. 21:00/.test(info)&&/START2230/.test(info),info.slice(0,200));
 await p.screenshot({path:`${out}/late-plan-home.png`});
 await p.click('#tabbar button:nth-child(2)');await p.waitForTimeout(150);
 const nowH=await p.evaluate(()=>new Date().getHours()),nowM=await p.evaluate(()=>new Date().getMinutes());
 const targetMin=Math.ceil((nowM+10)/5)*5;const addH=((nowH-7)+24)%24+(targetMin>=60?1:0);const tm=targetMin%60;
 for(let i=0;i<addH;i++)await p.click('button[aria-label="+1 h"]');for(let i=0;i<tm/5;i++)await p.click('button[aria-label="+5 min"]');
 await p.waitForTimeout(150);const planTxt=await p.$eval('#screen',e=>e.textContent);
 ok('past start: warning shown and START used',/Starttiden er passert/.test(planTxt)&&/Sender START nå/.test(planTxt),planTxt.slice(0,80));
 await p.screenshot({path:`${out}/plan-past.png`});await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},true,'de','androidPro');
 await p.click('.bigbtn');await p.waitForTimeout(250);ok('Pro: confirm on shows sheet',await p.$eval('#sheetLayer',e=>e.classList.contains('show')));
 await p.click('.sheet .primary');await p.waitForTimeout(4000);
 const inEv=await p.$$eval('.event.in',e=>e.length);ok('Pro: reply parsed into log',inEv>0,String(inEv));
 const badge=await p.$eval('.phone-head .badge',e=>e.textContent);ok('Pro: status confirmed after reply',/bestätigt/.test(badge),badge);
 await p.screenshot({path:`${out}/pro-de-home-dark.png`});
 await p.click('#tabbar button:nth-child(4)');await p.waitForTimeout(150);await p.click('button.switch[aria-label="Vor dem Senden bestätigen"]');await p.waitForTimeout(100);
 await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(100);await p.click('.bigbtn');await p.waitForTimeout(200);
 const hasProg=await p.$('.sheet .progress')!==null;ok('Pro: confirm off sends directly (progress, no Send button)',hasProg&&(await p.$('.sheet .primary'))===null);
 await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('#tabbar button:nth-child(4)');await p.click('button.switch[aria-label="Bekreft før sending"]');await p.click('#tabbar button:nth-child(1)');await p.click('.bigbtn');await p.waitForTimeout(200);
 await p.click('#simReset');await p.waitForTimeout(200);ok('reset closes sheet',!(await p.$eval('#sheetLayer',e=>e.classList.contains('show'))));
 ok('reset shows onboarding',/Trinn 1 av 4/.test(await p.$eval('#screen',e=>e.textContent)));
 await p.click('#simEmpty');await p.waitForTimeout(200);const s=await p.$eval('#screen',e=>e.textContent);ok('empty state rendered',/Legg inn modulens nummer/.test(s));
 await p.screenshot({path:`${out}/empty-state.png`});await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'de','ios');await p.click('#tabbar button:nth-child(4)');await p.waitForTimeout(150);await p.screenshot({path:`${out}/settings-de.png`});
 await p.selectOption('#lang','fr');await p.click('text=Numéros autorisés');await p.waitForTimeout(150);await p.screenshot({path:`${out}/numbers-fr.png`});await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},true,'fi','ios');await p.click('#tabbar button:nth-child(3)');await p.waitForTimeout(150);await p.click('.rowbtn');await p.waitForTimeout(150);await p.screenshot({path:`${out}/edit-fi-dark.png`});await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'sv','android');await p.click('#tabbar button:nth-child(3)');await p.waitForTimeout(150);await p.screenshot({path:`${out}/sched-sv.png`});await c.close();},
];
for(const [i,b] of blocks.entries()){try{await b();}catch(e){results.push(`CRASH block ${i+1}: ${e.message.split('\n')[0]}`);}}
console.log(results.join('\n'));console.log('errors:',errors.length?errors:'none');await browser.close();})();
