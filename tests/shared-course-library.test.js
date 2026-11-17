/* Synthetic data only. No real storage, GPS, Maps, microphone or data requests. */
(async()=>{
  const api=window.ChainChaserCourseLibrary,results=[];
  const check=(v,name)=>{if(!v)throw Error(name);results.push(name)};
  const clone=x=>structuredClone(x),same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const ids=['privare-course-salt-lake-city-ut','mills-park-woods-cross-ut','disc-on-6th-midvale-ut','dry-creek-trail-park-lehi-ut'];
  function fixture(id){
    const dry=id===ids[3],order=dry?[1,2,13,3,4,5,6,7,8,9,10,11,12]:Array.from({length:id===ids[0]?19:id===ids[1]?13:10},(_,i)=>i+1);
    const holes=order.map(number=>{const h={number,label:dry&&number===13?'2A':String(number),par:dry&&number===4?4:3,distanceFeet:id===ids[1]&&number===13?303:id===ids[2]&&number===10?null:100,tee:{lat:0,lng:0},basket:{lat:0.001,lng:0.001},overrides:{}};h.overrides={par:h.par,distanceFeet:h.distanceFeet,tee:clone(h.tee),basket:clone(h.basket)};return h});
    const layout=(layoutId,holeOrder,official,reference=null)=>{const rows=holeOrder.map(n=>holes.find(h=>h.number===n));return {id:layoutId,name:'Synthetic layout',holeCount:holeOrder.length,holeOrder,official,par:rows.reduce((n,h)=>n+h.par,0),totalDistanceFeet:rows.every(h=>h.distanceFeet!==null)?rows.reduce((n,h)=>n+h.distanceFeet,0):null,reference}};
    const layouts=dry?[layout('main-12',order.filter(n=>n!==13),true,{distanceFeet:3184,coversHoleCount:12}),layout('custom-13',order,false)]:[layout(id===ids[0]?'custom':id===ids[1]?'main-13':'main-10',order,id===ids[0]?false:null)];
    return {format:'chain-chaser-shared-course',schemaVersion:1,appName:'Chain Chaser',courseId:id,courseName:'Synthetic course',courseType:null,distanceUnit:'ft',holeCount:order.length,location:{address:null,city:null,center:null},defaultLayoutId:layouts[0].id,holes,holeShapes:Object.fromEntries(order.map(n=>[n,{route:[{lat:0,lng:0},{lat:0.001,lng:0.001}],fairway:[],mandos:[]}])),layouts,validation:{mappingComplete:true,incompleteHoles:[],missingReferenceDistances:holes.filter(h=>h.distanceFeet===null).map(h=>h.number),baseCoordinateHoles:[],warnings:[]}};
  }
  const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
  try{
    const courses=ids.map(fixture),manifest={format:'chain-chaser-course-library',schemaVersion:1,courses:[]},files=new Map();
    const root='http://127.0.0.1:8765/courses/';
    for(const c of courses){const name='chain-chaser-shared-course-'+c.courseId+'-v1.json',raw=JSON.stringify(c);files.set(root+name,raw);manifest.courses.push({courseId:c.courseId,url:name,sha256:await digest(raw)});api.validateCourse(c)}
    files.set(root+'manifest.json',JSON.stringify(manifest));
    const values=new Map([['chain-chaser-app-state-v1','synthetic round'],['disc-golf-course-edits-v2','synthetic mapping'],['chain-chaser-disc-bag-v2','synthetic bag']]),writes=[];
    const original=[...values],storage={getItem:k=>{if(k!==api.cacheKey)throw Error('Personal storage read');return values.get(k)??null},setItem:(k,v)=>{if(k!==api.cacheKey)throw Error('Personal storage write');writes.push(k);values.set(k,v)}};
    let offline=false;
    const fetchFile=async url=>{if(offline||!files.has(url))throw Error('Synthetic offline');return files.get(url)};
    const client=()=>api.createClient({storage,fetchFile,manifestUrl:root+'manifest.json',digest});
    let c=client();check(c.cached().length===0,'Fresh cache is absent');let r=await c.refresh(()=>true);
    check(r.status==='loaded'&&r.courses.length===4&&writes.length===1,'Atomic four-course download and isolated cache');
    check(c.isDurable(),'New library cache is durable before round start');
    check(original.every(([k,v])=>values.get(k)===v),'Personal storage values unchanged');
    const frozen=values.get(api.cacheKey);let fallbackFetches=0;const fallback=api.createClient({storage,fetchFile:async()=>{fallbackFetches++;throw Error('Forbidden fallback network')},manifestUrl:root+'manifest.json',digest,networkEnabled:false});check(fallback.cached().length===4,'Cache-only startup retains course definitions');const fallbackResult=await fallback.refresh(()=>true);check(fallbackResult.status==='cache-only'&&fallbackFetches===0&&values.get(api.cacheKey)===frozen,'Cache-only rollback performs zero downloads or writes');
    const emptyFallback=api.createClient({storage:{getItem:()=>null,setItem:()=>{throw Error('Forbidden fallback write')}},fetchFile:async()=>{throw Error('Forbidden fallback fetch')},manifestUrl:root+'manifest.json',digest,networkEnabled:false});emptyFallback.cached();check((await emptyFallback.refresh(()=>true)).status==='cache-only-empty','Empty fallback does not invent courses');
    check(r.courses[0].holes.length===19,'Private 19');check(r.courses[1].holes[12].distanceFeet===303,'Mills custom 13');check(r.courses[2].holes.length===10,'Disc On 6th 10');check(r.courses[3].holes[2].label==='2A'&&r.courses[3].layouts[0].holeCount===12,'Dry Creek 12 and 2A order');
    c=client();const cached=c.cached();offline=true;r=await c.refresh(()=>true);check(cached.length===4&&r.status==='offline-cache'&&writes.length===1,'Offline reload preserves validated cache');offline=false;
    const reject=(name,mutate)=>{const x=clone(courses[0]);mutate(x);let rejected=false;try{api.validateCourse(x)}catch{rejected=true}check(rejected,name)};
    reject('Duplicate IDs rejected',x=>x.holes[1].number=1);reject('Bounds rejected',x=>x.holes[0].tee.lat=91);reject('Personal fields rejected',x=>x.apiKey='synthetic');reject('Layout identity rejected',x=>x.layouts[0].holeOrder.reverse());reject('Schema version rejected',x=>x.schemaVersion=2);reject('Shape ownership rejected',x=>x.holeShapes[99]=x.holeShapes[1]);
    const cacheBefore=values.get(api.cacheKey),other=clone(manifest);other.courses[0].sha256='0'.repeat(64);files.set(root+'manifest.json',JSON.stringify(other));r=await c.refresh(()=>true);check(r.status==='offline-cache'&&values.get(api.cacheKey)===cacheBefore,'Hash mismatch cannot poison cache');files.set(root+'manifest.json',JSON.stringify(manifest));
    const changed=clone(courses[0]);changed.courseName='Synthetic new revision';const raw=JSON.stringify(changed);files.set(root+manifest.courses[0].url,raw);const updated=clone(manifest);updated.courses[0].sha256=await digest(raw);files.set(root+'manifest.json',JSON.stringify(updated));r=await c.refresh(()=>true);check(r.status==='update-available'&&values.get(api.cacheKey)===cacheBefore,'Published updates never replace cached revision automatically');
    files.set(root+manifest.courses[0].url,JSON.stringify(courses[0]));files.set(root+'manifest.json',JSON.stringify(manifest));
    values.delete(api.cacheKey);c=client();c.cached();r=await c.refresh(()=>false);check(r.status==='deferred'&&!values.has(api.cacheKey),'Active/navigation guard prevents application and caching');
    c=client();c.cached();values.set(api.cacheKey,'synthetic foreign cache');r=await c.refresh(()=>true);check(r.status==='cache-conflict'&&r.courses.length===0&&values.get(api.cacheKey)==='synthetic foreign cache','Concurrent cache is not overwritten or applied');
    const badManifest=clone(manifest);badManifest.courses[0].courseId='constructor';badManifest.courses[0].url='chain-chaser-shared-course-constructor-v1.json';let rejected=false;try{api.validateManifest(badManifest)}catch{rejected=true}check(rejected,'Inherited object names are not course IDs');
    values.set(api.cacheKey,'synthetic corrupt JSON');c=client();c.cached();r=await c.refresh(()=>true);check(r.status==='memory-only'&&values.get(api.cacheKey)==='synthetic corrupt JSON','Corrupt cache retained; validated session fallback');
    const failClient=api.createClient({storage:{getItem:()=>null,setItem:()=>{throw Error('Synthetic quota')}},fetchFile,manifestUrl:root+'manifest.json',digest});failClient.cached();r=await failClient.refresh(()=>true);check(r.status==='memory-only'&&r.courses.length===4&&!failClient.isDurable(),'Failed cache write retains session library without claiming durability');
    const noStorage=api.createClient({storage:{getItem:()=>{throw Error('Synthetic denial')},setItem:()=>{throw Error('Forbidden')}},fetchFile,manifestUrl:root+'manifest.json',digest});check(noStorage.cached().length===0,'Unavailable cache is handled');r=await noStorage.refresh(()=>true);check(r.status==='memory-only','Storage denial does not overwrite anything');
    let partialReads=0,partialWrites=0;const interrupted=api.createClient({storage:{getItem:()=>null,setItem:()=>{partialWrites++}},fetchFile:async url=>{if(++partialReads===3)throw Error('Synthetic interrupted transfer');return fetchFile(url)},manifestUrl:root+'manifest.json',digest});interrupted.cached();r=await interrupted.refresh(()=>true);check(r.status==='unavailable'&&r.courses.length===0&&partialWrites===0,'Interrupted cohort never applies or caches partial course data');
    document.getElementById('results').textContent=JSON.stringify({pass:true,tests:results,personalStorageWrites:0,realStorageAccess:0,realGpsAccess:0},null,2);
  }catch(e){document.getElementById('results').textContent=JSON.stringify({pass:false,completed:results,error:'Synthetic test failed: '+e.message})}
})();
