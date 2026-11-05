/* Course data is fetched from the same origin; activation is controlled by the app.
   This module never reads or writes personal course, round, disc or Maps keys. */
(() => {
  'use strict';
  const IDS = Object.freeze({
    'privare-course-salt-lake-city-ut': Array.from({length:19},(_,i)=>i+1),
    'mills-park-woods-cross-ut': Array.from({length:13},(_,i)=>i+1),
    'disc-on-6th-midvale-ut': Array.from({length:10},(_,i)=>i+1),
    'dry-creek-trail-park-lehi-ut': [1,2,13,3,4,5,6,7,8,9,10,11,12]
  });
  const KEY = 'chain-chaser-shared-library-cache-v1';
  const object = x => x!==null && typeof x==='object' && !Array.isArray(x);
  const equal = (a,b) => JSON.stringify(a)===JSON.stringify(b);
  const fail = () => { throw Error('Shared library validation failed. No personal data was changed.'); };
  const fields = (x,keys) => { if(!object(x)||Object.keys(x).length!==keys.length||keys.some(k=>!Object.hasOwn(x,k)))fail(); };
  const point = p => p===null || object(p)&&Object.keys(p).length===2&&Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lng)&&Math.abs(p.lng)<=180;
  const positive = (x,integer=false) => x===null||Number.isFinite(x)&&x>0&&(!integer||Number.isInteger(x));
  function validateCourse(c){
    fields(c,['format','schemaVersion','appName','courseId','courseName','courseType','distanceUnit','holeCount','location','defaultLayoutId','holes','holeShapes','layouts','validation']);
    const order=IDS[c.courseId];
    if(!Object.hasOwn(IDS,c.courseId)||c.format!=='chain-chaser-shared-course'||c.schemaVersion!==1||c.appName!=='Chain Chaser'||c.distanceUnit!=='ft'||typeof c.courseName!=='string'||!c.courseName.trim()||!(c.courseType===null||typeof c.courseType==='string')||!Array.isArray(c.holes)||c.holeCount!==order.length||c.holes.length!==order.length)fail();
    fields(c.location,['address','city','center']);
    if(!point(c.location.center)||![c.location.address,c.location.city].every(x=>x===null||typeof x==='string'))fail();
    const label=n=>c.courseId==='dry-creek-trail-park-lehi-ut'&&n===13?'2A':String(n);
    for(const [i,h]of c.holes.entries()){
      fields(h,['number','label','par','distanceFeet','tee','basket','overrides']);
      if(h.number!==order[i]||h.label!==label(h.number)||!positive(h.par,true)||!positive(h.distanceFeet)||!point(h.tee)||!point(h.basket)||!object(h.overrides))fail();
      for(const k of Object.keys(h.overrides))if(!['par','distanceFeet','tee','basket'].includes(k)||!equal(h.overrides[k],h[k]))fail();
    }
    if(!object(c.holeShapes)||Object.keys(c.holeShapes).length!==order.length)fail();
    for(const [key,sh]of Object.entries(c.holeShapes)){
      if(!/^[1-9]\d*$/.test(key)||!order.includes(Number(key)))fail();
      fields(sh,['route','fairway','mandos']);
      for(const k of ['route','fairway','mandos']){
        if(!Array.isArray(sh[k]))fail();
        for(const p of sh[k]){
          if(k==='mandos'){fields(p,['lat','lng','side']);if(!['left','right'].includes(p.side)||!point({lat:p.lat,lng:p.lng}))fail();}
          else if(p===null||!point(p))fail();
        }
      }
    }
    const dry=c.courseId==='dry-creek-trail-park-lehi-ut';
    const layouts=dry?[['main-12',IDS[c.courseId].filter(n=>n!==13)],['custom-13',order]]:[[c.courseId==='privare-course-salt-lake-city-ut'?'custom':c.courseId==='mills-park-woods-cross-ut'?'main-13':'main-10',order]];
    if(!Array.isArray(c.layouts)||c.layouts.length!==layouts.length||c.defaultLayoutId!==layouts[0][0])fail();
    for(const [i,l]of c.layouts.entries()){
      fields(l,['id','name','holeCount','holeOrder','official','par','totalDistanceFeet','reference']);
      const expected=layouts[i];
      if(l.id!==expected[0]||typeof l.name!=='string'||!l.name.trim()||!equal(l.holeOrder,expected[1])||l.holeCount!==expected[1].length||![true,false,null].includes(l.official))fail();
      const rows=l.holeOrder.map(n=>c.holes.find(h=>h.number===n));
      const sum=k=>rows.every(h=>h[k]!==null)?rows.reduce((n,h)=>n+h[k],0):null;
      if(l.par!==sum('par')||l.totalDistanceFeet!==sum('distanceFeet'))fail();
      if(l.reference!==null){fields(l.reference,['distanceFeet','coversHoleCount']);if(!positive(l.reference.distanceFeet)||!Number.isInteger(l.reference.coversHoleCount)||l.reference.coversHoleCount<1||l.reference.coversHoleCount>l.holeCount)fail();}
    }
    if(c.courseId==='mills-park-woods-cross-ut'&&(c.holes[12].par!==3||c.holes[12].distanceFeet!==303))fail();
    if(dry&&(c.layouts[0].official!==true||c.layouts[1].official!==false||c.layouts[0].reference?.distanceFeet!==3184||c.layouts[0].reference?.coversHoleCount!==12))fail();
    fields(c.validation,['mappingComplete','incompleteHoles','missingReferenceDistances','baseCoordinateHoles','warnings']);
    const incomplete=c.holes.map(h=>({number:h.number,label:h.label,missing:['par','tee','basket'].filter(k=>h[k]===null)})).filter(h=>h.missing.length);
    if(c.validation.mappingComplete!==(incomplete.length===0)||!equal(c.validation.incompleteHoles,incomplete)||!equal(c.validation.missingReferenceDistances,c.holes.filter(h=>h.distanceFeet===null).map(h=>h.number))||!Array.isArray(c.validation.baseCoordinateHoles)||c.validation.baseCoordinateHoles.some(n=>!order.includes(n))||!Array.isArray(c.validation.warnings)||!c.validation.warnings.every(s=>typeof s==='string'))fail();
    return c;
  }
  function validateManifest(m){
    fields(m,['format','schemaVersion','courses']);
    if(m.format!=='chain-chaser-course-library'||m.schemaVersion!==1||!Array.isArray(m.courses)||m.courses.length!==4)fail();
    const seen=new Set();
    for(const e of m.courses){fields(e,['courseId','url','sha256']);if(!Object.hasOwn(IDS,e.courseId)||seen.has(e.courseId)||e.url!=='chain-chaser-shared-course-'+e.courseId+'-v1.json'||!/^[a-f0-9]{64}$/.test(e.sha256))fail();seen.add(e.courseId);}
    return m;
  }
  function createClient({storage,fetchFile,manifestUrl,digest,networkEnabled=true}){
    let accepted=null,acceptedRaw=null,cacheBlocked=false;
    function decode(value){
      fields(value,['version','manifest','courses']);if(value.version!==1)fail();validateManifest(value.manifest);
      if(!Array.isArray(value.courses)||value.courses.length!==4)fail();
      for(const [i,c]of value.courses.entries())if(validateCourse(c).courseId!==value.manifest.courses[i].courseId)fail();
      return value;
    }
    function cached(){
      try{const raw=storage.getItem(KEY);if(raw!==null){accepted=decode(JSON.parse(raw));acceptedRaw=raw;}}
      catch{cacheBlocked=true;}
      return accepted?structuredClone(accepted.courses):[];
    }
    async function refresh(canApply){
      if(!networkEnabled)return {status:accepted?'cache-only':'cache-only-empty',courses:[]};
      let bundle;
      try{
        const manifest=validateManifest(JSON.parse(await fetchFile(manifestUrl)));
        const courses=[];
        for(const e of manifest.courses){
          const url=new URL(e.url,manifestUrl);if(url.origin!==new URL(manifestUrl).origin)fail();
          const raw=await fetchFile(url.href);if(await digest(raw)!==e.sha256)fail();
          const c=validateCourse(JSON.parse(raw));if(c.courseId!==e.courseId)fail();courses.push(c);
        }
        bundle=decode({version:1,manifest,courses});
      }catch{return {status:accepted?'offline-cache':'unavailable',courses:[]};}
      if(accepted&&!equal(accepted.manifest,bundle.manifest))return {status:'update-available',courses:[]};
      if(!canApply())return {status:'deferred',courses:[]};
      // Do not replace corrupt/unreadable cache data, or a concurrent tab's cache.
      let status='loaded';
      if(!accepted&&!cacheBlocked){
        try{if(storage.getItem(KEY)!==null)status='cache-conflict';else{const raw=JSON.stringify(bundle);storage.setItem(KEY,raw);acceptedRaw=raw;}}
        catch{status='memory-only';}
      }else if(cacheBlocked)status='memory-only';
      if(status==='cache-conflict')return {status,courses:[]};
      accepted=bundle;
      return {status,courses:structuredClone(bundle.courses)};
    }
    function isDurable(){try{return acceptedRaw!==null&&storage.getItem(KEY)===acceptedRaw}catch{return false}}
    const revisionFor=id=>accepted?.manifest.courses.find(e=>e.courseId===id)?.sha256||null;
    return Object.freeze({cached,refresh,isDurable,revisionFor});
  }
  window.ChainChaserCourseLibrary=Object.freeze({validateCourse,validateManifest,createClient,cacheKey:KEY});
})();
