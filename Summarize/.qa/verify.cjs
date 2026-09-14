const {chromium} = require('/Users/win/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

(async () => {
  const dir=path.resolve(__dirname,'..');
  const contextData={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(dir,'content.js'),'utf8'),contextData);
  const data=contextData.window.EC212;
  const catalog=JSON.parse(fs.readFileSync(path.join(dir,'../tmp/pdfs/ec212_catalog.json'),'utf8'));
  let references=0;
  function checkRef(file,page){const c=catalog.find(x=>x.file===file);assert(c,'Catalog target: '+file);assert(fs.existsSync(path.join(dir,'..',file)),file);assert(page>=1&&page<=c.pages,'Page in range: '+file+' '+page);references++;}
  data.chapters.forEach(c=>c.sections.forEach(s=>checkRef(c.file,s.page)));
  data.days.forEach(day=>{assert.equal(day.tasks.reduce((n,t)=>n+t.minutes,0),240);day.tasks.forEach(t=>{if(t.file)checkRef(t.file,t.page);if(t.route.startsWith('lessons/')){const [,n,topic]=t.route.split('/');const c=data.chapters[Number(n)-1];assert(c);if(topic)assert(c.sections[Number(topic.split('-')[1])-1]);}});});
  data.formulas.forEach(f=>checkRef(f.file,f.page));data.documents.forEach(doc=>checkRef(doc.file,doc.page));
  console.log('Source references and 5-day time budgets:',references,'references verified.');

  const browser=await chromium.launch({executablePath:'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',headless:true});
  try {
    const ctx=await browser.newContext({viewport:{width:1440,height:1100},locale:'th-TH',timezoneId:'Asia/Bangkok'});
    const page=await ctx.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const base='http://127.0.0.1:8765/Summarize/';
    await page.goto(base);
    await page.getByRole('heading',{level:1}).waitFor();
    await page.screenshot({path:path.join(__dirname,'desktop-home.png'),fullPage:true});
    await page.locator('[data-nav="plan"]').click();
    await page.locator('#d1-t1').check();
    await page.locator('#start-date').fill('2026-09-20');
    await page.locator('#start-date').dispatchEvent('change');
    await page.reload();
    assert(await page.locator('#d1-t1').isChecked());
    assert.equal(await page.locator('#start-date').inputValue(),'2026-09-20');
    assert.match(await page.locator('#plan-stats').innerText(),/1 \/ 20/);
    assert.match(await page.locator('.day-date').last().innerText(),/24/);
    for (const box of await page.locator('[data-task]').all()) await box.check();
    await page.locator('[data-nav="home"]').click();
    assert.equal(await page.locator('.ring strong').innerText(),'100%');
    await page.locator('[data-nav="plan"]').click();
    await page.locator('#d1-t1').uncheck();
    await page.reload();assert(!(await page.locator('#d1-t1').isChecked()));
    console.log('Progress: check, uncheck, all complete, date change and reload passed.');

    const routes=['home','plan','lessons','lessons/1','lessons/2','lessons/3','lessons/4','formulas','documents'];
    const pdfs=new Set();
    for(const route of routes){
      await page.goto(base+'#'+route);await page.getByRole('heading',{level:1}).waitFor();
      const links=await page.locator('a[href*=".pdf"]').evaluateAll(els=>els.map(e=>e.href));links.forEach(u=>pdfs.add(u));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Desktop overflow '+route);
    }
    for(const url of new Set([...pdfs].map(u=>u.split('#')[0]))){const response=await ctx.request.head(url);assert(response.ok(),'PDF HTTP '+url);assert.match(response.headers()['content-type'],/application\/pdf/);}
    await page.goto(base+'#lessons/3/topic-4');await page.waitForFunction(()=>Math.abs(document.getElementById('topic-4').getBoundingClientRect().top)<70);
    await page.screenshot({path:path.join(__dirname,'desktop-lesson.png'),fullPage:false});
    await page.locator('#topic-4 .chart').screenshot({path:path.join(__dirname,'desktop-chart.png')});
    await page.goto(base+'#documents');
    const popupWait=page.waitForEvent('popup');
    await page.locator('.document a').first().click();
    const popup=await popupWait;
    await popup.waitForURL(/Course_Detail\.pdf/);
    assert.match(popup.url(),/#page=5$/);
    await popup.close();
    console.log('PDF button opened original file in a new tab with page=5.');
    await page.goto(base+'#formulas');
    const closed=page.locator('details').nth(5);await closed.locator('summary').click();assert(await closed.evaluate(e=>e.open));
    await closed.locator('summary').focus();await page.keyboard.press('Enter');assert(!(await closed.evaluate(e=>e.open)));
    console.log('Routes, PDF MIME responses, anchor navigation, formula mouse/keyboard controls passed.');

    await page.setViewportSize({width:390,height:844});
    for(const route of routes){await page.goto(base+'#'+route);await page.getByRole('heading',{level:1}).waitFor();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Mobile overflow '+route);}
    await page.goto(base+'#home');await page.screenshot({path:path.join(__dirname,'mobile-home.png'),fullPage:true});
    await page.goto(base+'#plan');await page.screenshot({path:path.join(__dirname,'mobile-plan.png'),fullPage:false});
    await page.goto(base+'#lessons/3/topic-4');await page.waitForFunction(()=>Math.abs(document.getElementById('topic-4').getBoundingClientRect().top)<70);await page.screenshot({path:path.join(__dirname,'mobile-lesson.png'),fullPage:false});
    await page.locator('#topic-4 .chart').screenshot({path:path.join(__dirname,'mobile-chart.png')});
    await page.goto(base+'#lessons/unknown');assert.match(await page.locator('h1').innerText(),/ไม่พบ/);
    assert.deepEqual(errors,[]);console.log('Mobile routes and browser errors passed.');

    const offline=await browser.newContext({offline:true});const p2=await offline.newPage();
    await p2.goto('file://'+path.join(dir,'index.html')+'#lessons/3');
    assert.equal(await p2.locator('.lesson-content article').count(),7);
    await p2.locator('[data-nav="plan"]').click();await p2.locator('#d2-t2').check();await p2.reload();assert(await p2.locator('#d2-t2').isChecked());
    console.log('Offline file opening and progress passed.');
    const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('Disabled');}}));
    const p3=await blocked.newPage();await p3.goto(base+'#plan');await p3.locator('#d1-t1').check();assert.match(await p3.locator('#storage-note').innerText(),/ไม่อนุญาต/);
    console.log('Unavailable storage fallback passed.');

    const mock=await browser.newContext();await mock.addInitScript(()=>{window.registeredStudyTools={};Object.defineProperty(document,'modelContext',{value:{registerTool(tool){window.registeredStudyTools[tool.name]=tool;}}});});
    const p4=await mock.newPage();await p4.goto(base+'#plan');
    const result=await p4.evaluate(()=>{const tools=window.registeredStudyTools;const initial=tools.read_study_progress.execute();tools.set_study_task_completion.execute({changes:[{id:'d1-t1',done:true}]});let invalid=false;try{tools.set_study_task_completion.execute({changes:[{id:'unknown',done:true}]});}catch{invalid=true;}return {names:Object.keys(tools),initial,after:tools.read_study_progress.execute(),invalid,ui:document.getElementById('d1-t1').checked};});
    assert.equal(result.initial.percent,0);assert.equal(result.after.percent,5);assert(result.invalid&&result.ui);
    console.log('Optional WebMCP adapter valid/invalid behavior passed with a mock registry (native context not available).');
    console.log('PASS:',JSON.stringify({chapters:data.chapters.length,topics:data.chapters.reduce((n,c)=>n+c.sections.length,0),formulas:data.formulas.length,variables:data.variables.reduce((n,g)=>n+g.rows.length,0),pdfAnchorLinks:pdfs.size,browserErrors:errors.length}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
