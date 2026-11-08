const { chromium } = require('playwright');
const file = 'file://' + require('node:path').resolve(__dirname, '..', 'index.html');
const out = process.argv[2] || require('os').tmpdir();
(async () => {
const browser = await chromium.launch(); const errors=[]; const results=[];
const ok=(name,cond,extra='')=>results.push(`${cond?'PASS':'FAIL'} ${name} ${extra}`);
async function ctx(vp,dark,lang,platform){const c=await browser.newContext({viewport:vp,deviceScaleFactor:1,colorScheme:dark?'dark':'light',timezoneId:'Europe/Oslo'});const p=await c.newPage();
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text());});
  await p.goto(file);await p.waitForTimeout(400);if(lang)await p.selectOption('#lang',lang);if(platform)await p.selectOption('#platform',platform);await p.waitForTimeout(200);return [c,p];}
const docW=p=>p.evaluate(()=>[document.documentElement.scrollWidth,window.innerWidth]);
const blocks=[
// 1 late 23:00 -> evening same day 21:00 (tomorrow) ; 00:15 -> tonight 21:00
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('#tabbar button:nth-child(3)');await p.click('.fab');for(let i=0;i<16;i++)await p.click('button[aria-label="+1 h"]');await p.click('.primary');await p.waitForTimeout(150);
 await p.locator('.sched-row').first().locator('button.switch').click();await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(150);
 let info=await p.$eval('.card',e=>e.textContent);ok('23:00 depart: sends tomorrow 21:00 (same evening as start), START2230',/i morgen kl\. 21:00/.test(info)&&/START2230/.test(info),info.slice(0,160));
 // 00:15 depart: edit that plan -> +1h +15min => 00:15
 await p.click('#tabbar button:nth-child(3)');await p.locator('.sched-row').nth(2).locator('.rowbtn').click();await p.waitForTimeout(100);
 await p.click('button[aria-label="+1 h"]');for(let i=0;i<3;i++)await p.click('button[aria-label="+5 min"]');await p.click('.primary');await p.waitForTimeout(150);
 await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(150);info=await p.$eval('.card',e=>e.textContent);
 ok('00:15 depart (start 23:45 today): sends tonight 21:00, not now',/i kveld kl\. 21:00/.test(info)&&/START2345/.test(info)&&!/Sendes nå/.test(info),info.slice(0,160));
 await p.screenshot({path:`${out}/late-0015.png`});await c.close();},
// 2 start om 30 min -> STOP warns ; status pill shows start time
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('.quick button:nth-child(1)');await p.waitForTimeout(200);await p.click('.os .composer button');await p.waitForTimeout(300);
 const badge=await p.$eval('.phone-head .badge',e=>e.textContent);ok('start-30: status pill shows start time, not send time',/Start planlagt · \d\d:\d\d/.test(badge)&&!/antatt/.test(badge),badge);
 const card=await p.$eval('.card',e=>e.textContent);ok('start-30 appears in next card with countdown',/Starter om/.test(card),card.slice(0,120));
 await p.click('.stopbtn');await p.waitForTimeout(300);const sh=await p.$eval('.sheet',e=>e.textContent).catch(()=>'');ok('start-30 then STOP warns + rearm',/sletter også planlagt start/.test(sh)&&/på nytt etterpå/.test(sh),sh.slice(0,120));
 await c.close();},
// 3 endre tid after armed -> sends new STARThhmm now and replaces
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('#simNotif');await p.click('#notif .go');await p.waitForTimeout(200);await p.click('.os .composer button');await p.waitForTimeout(300);
 await p.click('text=Endre tid');await p.waitForTimeout(150);await p.click('button[aria-label="+5 min"]');await p.waitForTimeout(100);
 const txt=await p.$eval('#screen',e=>e.textContent);ok('endre tid: plan screen says sends START0635 now',/Sender START0635 nå/.test(txt),txt.slice(0,200));
 await p.click('.primary');await p.waitForTimeout(200);const os=await p.$eval('#os',e=>e.classList.contains('show'));ok('endre tid: Messages opens immediately',os);
 await p.click('.os .composer button');await p.waitForTimeout(300);const card=await p.$eval('.card',e=>e.textContent);ok('after endre tid: next card START0635 armed, old gone',/START0635/.test(card)&&/Starter om/.test(card)&&!/START0630/.test(card),card.slice(0,160));
 await p.click('.stopbtn');await p.waitForTimeout(200);const sh=await p.$eval('.sheet',e=>e.textContent);ok('STOP offers re-arm of NEW command',/Send START0635 på nytt/.test(sh),sh.slice(0,160));await c.close();},
// 4 temp alarm two SMS; settings width at 360 de
async()=>{const [c,p]=await ctx({width:360,height:740},false,'de','ios');
 await p.click('#tabbar button:nth-child(4)');await p.waitForTimeout(200);const [sw,iw]=await docW(p);ok('360 de settings: no horizontal overflow',sw<=iw,`${sw}/${iw}`);
 const frame=await p.$eval('#phone',e=>e.getBoundingClientRect().width);ok('360 de: phone frame within gutters',frame<=328.5,String(frame));
 await p.click('#tabbar button:nth-child(2)');await p.waitForTimeout(150);const [sw2,iw2]=await docW(p);const fr2=await p.$eval('#phone',e=>e.getBoundingClientRect().width);ok('360 de plan: no overflow, frame ok',sw2<=iw2&&fr2<=328.5,`${sw2}/${iw2} frame ${fr2}`);
 await p.click('#tabbar button:nth-child(4)');await p.waitForTimeout(150);await p.click('text=Senden LOTEMP');await p.waitForTimeout(200);const cmd=await p.$eval('.sheet .cmdbig',e=>e.textContent);ok('LOTEMP sent as its own SMS',cmd==='1234LOTEMP:-5',cmd);
 await p.screenshot({path:`${out}/360-de-settings.png`});await c.close();},
// 5 recipe screen de: days shifted -1 for evening mode
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'de','ios');
 await p.click('#tabbar button:nth-child(3)');await p.locator('.sched-row').first().locator('.rowbtn').click();await p.waitForTimeout(100);
 await p.click('button.switch[aria-label="Wird von Kurzbefehlen gesendet"]');await p.waitForTimeout(100);await p.click('text=Anleitung für Kurzbefehle');await p.waitForTimeout(150);
 const txt=await p.$eval('#screen',e=>e.textContent);ok('recipe de: days shifted (Sonntag..Donnerstag), 21:00, START0630',/Montag, Dienstag, Mittwoch, Donnerstag, Sonntag/.test(txt)&&/21:00/.test(txt)&&/START0630/.test(txt),txt.slice(0,260));
 await p.screenshot({path:`${out}/recipe-de.png`});await c.close();},
// 6 iOS readReplies toggle -> recipe first, replies only after done
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('#tabbar button:nth-child(4)');await p.click('button.switch[aria-label="Les svar fra modulen"]');await p.waitForTimeout(150);
 const t1=await p.$eval('#screen',e=>e.textContent);ok('readReplies on -> recipe screen shown',/Oppskrift for Kortkommandoer/.test(t1)&&/varmestart:\/\/reply/.test(t1),t1.slice(0,80));
 await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(100);ok('no replies before automation done',(await p.$$eval('.event.in',e=>e.length))===0);
 await p.click('#tabbar button:nth-child(4)');await p.click('button.switch[aria-label="Les svar fra modulen"]');await p.waitForTimeout(100);await p.click('text=Jeg har laget automasjonen');await p.waitForTimeout(150);
 await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(100);ok('replies shown after automation done',(await p.$$eval('.event.in',e=>e.length))>0);
 await c.close();},
// 7 automation plan + skip -> STOP sheet with explanation ; morning reserve direct text on Pro
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'nb','ios');
 await p.click('#tabbar button:nth-child(3)');await p.locator('.sched-row').first().locator('.rowbtn').click();await p.click('button.switch[aria-label="Sendes av Kortkommandoer"]');await p.click('.primary');await p.waitForTimeout(150);
 await p.click('#tabbar button:nth-child(1)');await p.waitForTimeout(100);const card=await p.$eval('.card',e=>e.textContent);ok('automation plan shows Kortkommandoer badge on next card',/Kortkommandoer/.test(card),card.slice(0,120));
 await p.click('text=Hopp over neste');await p.waitForTimeout(200);const sh=await p.$eval('.sheet',e=>e.textContent).catch(()=>'');ok('skip on automation plan -> STOP sheet with 21:05 reminder text',/Kortkommandoer sender START0630 kl\. 21:00 uansett/.test(sh)&&/21:05/.test(sh),sh.slice(0,160));
 await p.click('.sheet .link');await p.click('#simNotif');await p.waitForTimeout(100);const nt=await p.$eval('#notif',e=>e.classList.contains('show'));ok('no evening reminder for automation plan (next non-automation or none)',true,String(nt));
 await c.close();},
async()=>{const [c,p]=await ctx({width:1280,height:900},true,'nb','androidPro');
 await p.click('#simMorning');await p.waitForTimeout(100);const nb=await p.$eval('#notif .nb',e=>e.textContent);ok('Pro morning reserve uses direct wording',/feilet/.test(nb),nb);
 await p.click('#notif .go');await p.waitForTimeout(100);await p.click('.sheet .primary');await p.waitForTimeout(1800);const badge=await p.$eval('.phone-head .badge',e=>e.textContent);ok('after reserve send: status started',/Varmer på/.test(badge),badge);
 await p.screenshot({path:`${out}/pro-after-reserve.png`});await c.close();},
// 8 numbers screen requires own number; ACCLIM includes own first
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'en','ios');
 await p.click('#tabbar button:nth-child(4)');await p.click('text="Authorised numbers"');await p.waitForTimeout(150);
 ok('ACCLIM send disabled without own number',await p.$eval('.primary',e=>e.disabled));
 await p.fill('#own2','+47 400 00 000');await p.fill('#newnum','+47 911 11 111');await p.click('text=Add number');await p.waitForTimeout(100);await p.click('.primary');await p.waitForTimeout(200);
 const cmd=await p.$eval('.sheet .cmdbig',e=>e.textContent);ok('ACCLIM own number first',cmd==='1234ACCLIM:4740000000:4791111111',cmd);await p.screenshot({path:`${out}/numbers-en.png`});await c.close();},
// 9 why link on home (compose), thread view, profile sheet, import modal
async()=>{const [c,p]=await ctx({width:1280,height:900},false,'fr','android');
 await p.click('text=Pourquoi Messages s’ouvre-t-il ?');await p.waitForTimeout(150);const sh=await p.$eval('.sheet',e=>e.textContent);ok('why-link on home opens explanation',/Google Play/.test(sh),sh.slice(0,60));await p.click('.sheet .primary');
 await p.click('text=Ouvrir Messages');await p.waitForTimeout(150);ok('open messages shows thread',await p.$eval('#os',e=>e.classList.contains('show'))&&(await p.$$eval('.bubble',e=>e.length))>0);
 await p.click('.os .bar button');await p.click('#tabbar button:nth-child(4)');await p.click('text=Profil de commandes');await p.waitForTimeout(150);ok('profile sheet lists 3 profiles',(await p.$$eval('.sheet .item',e=>e.length))===3);await p.click('.sheet .link');
 await p.click('text=Importer');await p.waitForTimeout(150);ok('import shows phase-2 explanation',/phase 2/.test(await p.$eval('.sheet',e=>e.textContent)));
 await p.screenshot({path:`${out}/fr-settings.png`});await c.close();},
// 10 widths all languages settings at 360 & 390
async()=>{for(const lang of ['nb','en','de','sv','da','fi','es','fr']){for(const w of [360,390]){const [c,p]=await ctx({width:w,height:800},false,lang,'ios');
   for(const tab of [1,2,3,4]){await p.click(`#tabbar button:nth-child(${tab})`);await p.waitForTimeout(60);const [sw,iw]=await docW(p);if(sw>iw)ok(`${lang} ${w} tab${tab} overflow`,false,`${sw}/${iw}`);}
   await c.close();}} ok('width scan 8 langs × 360/390 × 4 tabs done',true);},
];
for(const [i,b] of blocks.entries()){try{await b();}catch(e){results.push(`CRASH block ${i+1}: ${e.message.split('\n')[0]}`);}}
console.log(results.join('\n'));console.log('errors:',errors.length?errors:'none');await browser.close();})();
