/* Executed explicitly by the disposable-profile CDP harness, never by the app. */
(async()=>{
 const assert=(v,m)=>{if(!v)throw Error(m)},same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 const scenario=new URL(location.href).searchParams.get('case')||'fresh';
 const snapshot=()=>JSON.stringify(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)]));
 try{
  for(let i=0;i<100&&sharedLibraryBusy;i++)await new Promise(r=>setTimeout(r,50));
  assert(sharedLibraryMode,'Local mode missing');
  const env=sharedLibraryEnvironmentFor;
  assert(env('https://jeremydspencer-disc.github.io/disc-golf-gps/chain-chaser-preview.html').enabled,'Normal production URL not enabled');
  assert(!env('https://jeremydspencer-disc.github.io/disc-golf-gps/index.html').enabled&&!env('https://unrelated.invalid/disc-golf-gps/chain-chaser-preview.html').enabled&&!env('http://127.0.0.1:8765/chain-chaser-preview.html').enabled,'Unrelated environment enabled');
  assert(!env('https://jeremydspencer-disc.github.io/disc-golf-gps/chain-chaser-preview.html?devSim=1').enabled,'Simulator enabled library');
  assert(env('https://jeremydspencer-disc.github.io/disc-golf-gps/chain-chaser-preview.html?sharedNetwork=off').enabled&&!env('https://jeremydspencer-disc.github.io/disc-golf-gps/chain-chaser-preview.html?sharedNetwork=off').network,'Fallback disabled recovery');
  assert(!window.libraryTestErrors.length,'JavaScript error');
  const expectedCourseIds=['disc-on-6th-midvale-ut','mills-park-woods-cross-ut','dry-creek-trail-park-lehi-ut','dragonfly-lehi-ut','privare-course-salt-lake-city-ut'];
  assert(same([...document.querySelectorAll('.home-course-card')].map(card=>card.dataset.courseId).sort(),expectedCourseIds.sort()),'Five default course cards with expected identities');
  assert(document.documentElement.scrollWidth<=innerWidth,'Mobile overflow');
  const privateCourse=courseRegistry.find(c=>c.id===privareCourseId);
  if(scenario==='personal'){
   assert(sharedResolvedMappings.size===0,'Personal courses replaced');
   for(const [k,v]of window.libraryTestProtected)assert(localStorage.getItem(k)===v,'Protected storage changed');
   assert(privateCourse.holes.length===19,'Personal 19-hole definition lost');
  }else if(scenario==='blocked'){
   assert(customStorageBlocked&&privateCourse.holes.length===18&&!sharedResolvedMappings.size,'Fallback repaired automatically');
   for(const [k,v]of window.libraryTestProtected)assert(localStorage.getItem(k)===v,'Blocked storage changed');
   assert(localStorage.getItem(ChainChaserCourseLibrary.cacheKey)===null,'Blocked state cached');
  }else if(scenario==='interrupted'||scenario==='emptyfallback'){
   assert(!s.active&&!sharedResolvedMappings.size&&localStorage.getItem(ChainChaserCourseLibrary.cacheKey)===null,'Unavailable data was applied or cached');
   const independentIds=['disc-on-6th-midvale-ut','dragonfly-lehi-ut'];
   assert([...document.querySelectorAll('#homeCourseList .course-actions .btn')].every(b=>b.disabled===!independentIds.includes(b.closest('[data-course-id]').dataset.courseId)),'Independent courses must remain enabled; shared-only courses must remain disabled');
   selectCourse(privareCourseId);const before=snapshot();startRound();assert(!s.active&&before===snapshot(),'Unavailable shared round started');
   assert(document.getElementById('sharedLibraryHomeStatus').textContent.length>0,'Missing readiness feedback');
   for(const id of independentIds){
    selectCourse(id);startHole=2;startRound();assert(s.active&&selectedCourseId===id&&s.hole===2,'Independent course could not start without shared library: '+id);
    endRound(true);assert(!s.active,'Synthetic independent round did not end');
   }
   assert(!sharedResolvedMappings.size&&localStorage.getItem(ChainChaserCourseLibrary.cacheKey)===null,'Independent rounds fabricated shared data');
  }else if(scenario==='contextquota'){
   assert(sharedLibraryClient.isDurable(),'Library cache missing');selectCourse(privareCourseId);const before=snapshot(),state=JSON.stringify(s);startRound();assert(!s.active&&snapshot()===before&&state===JSON.stringify(s),'Context failure did not roll back round');
  }else if(scenario==='quota'){
   assert(sharedResolvedMappings.size===4&&!sharedLibraryClient.isDurable(),'Memory-only library missing');
   selectCourse(privareCourseId);const before=snapshot();startRound();assert(!s.active&&snapshot()===before,'Unrecoverable round was allowed');
   openMapper(false,privareCourseId);assert(mapEditStorage()!==false,'Explicit personal save failed');closeMapper();startRound();assert(s.active&&privateCourse.holes.length===19,'Durable personal definition did not permit round');
  }else if(scenario==='race'){
   assert(window.libraryRaceStarted&&!s.active,'Round started before library completion');
   assert(window.libraryLoadingButtonsDisabled,'Shared buttons were enabled during slow download');
   assert(sharedResolvedMappings.size===4&&localStorage.getItem(ChainChaserCourseLibrary.cacheKey)!==null,'Library not ready after slow start blocked');
  }else if(scenario==='active'||scenario==='activecached'||scenario==='physicalcached'){
   assert(s.active&&isPhysicalRound()===(scenario==='physicalcached')&&s.hole===2&&selectedCourseId===millsCourse.id,'Existing active round changed');
   assert(s.throws.length===1&&s.rounds.length===1&&s.completed.length===1,'Legacy records changed');
   assert(!sharedResolvedMappings.size&&(scenario.endsWith('cached')?localStorage.getItem(ChainChaserCourseLibrary.cacheKey)===window.libraryTestCacheRaw:localStorage.getItem(ChainChaserCourseLibrary.cacheKey)===null),'Library changed during active round');
   assert(millsCourse.holes[1].tee===null,'Unbound active round inherited library GPS');
   const raw=snapshot(),before=JSON.stringify(s);await refreshSharedCourseLibrary();assert(raw===snapshot()&&before===JSON.stringify(s),'Active refresh mutated data');
  }else{
   assert(sharedResolvedMappings.size>=(sessionStorage.getItem('library-test-round')?3:4)&&privateCourse.holes.length===19,'Fresh or cached course load');
   assert(localStorage.getItem(customCourseKey)===null,'Shared course written to personal storage');
   assert(readCourseMappings(dryCreekCourse).edits[13].tee&&readCourseMappings(dryCreekCourse).shapes[13].route.length===2,'2A mapping missing');
   if(sessionStorage.getItem('library-test-round')){
    assert(s.active&&s.hole===19&&isPhysicalRound()&&physicalRound.selectedDiscId==='library-blue','Cached physical round did not resume');
    assert(!s.started&&throwStartGps===null,'Resume fabricated throw origin');
   }else{
    const baseline=snapshot();await refreshSharedCourseLibrary();assert(snapshot()===baseline,'Idle refresh wrote existing storage');
    assert((await collectFullBackup()).data[ChainChaserCourseLibrary.cacheKey]===localStorage.getItem(ChainChaserCourseLibrary.cacheKey),'Full Backup omitted shared cache');
    selectCourse(discOnSixth.id);openMapper(false,discOnSixth.id);const foreign='{"1":{"distanceFeet":222}}';localStorage.setItem(oldEditKey,foreign);assert(mapEditStorage()===false&&localStorage.getItem(oldEditKey)===foreign&&localStorage.getItem(oldShapeKey)===null,'Foreign mapping was overwritten');localStorage.removeItem(oldEditKey);closeMapper();
    selectCourse(dryCreekCourse.id);drySetupLayoutId='custom-13';assert(same(roundHoleOrder(),[1,2,13,3,4,5,6,7,8,9,10,11,12]),'2A round order');
    // A first explicit Dry Creek edit must preserve the rest of its shared maps.
    openMapper(false,dryCreekCourse.id);mapperHole(2);window.confirm=()=>true;clearFlightPath();closeMapper();
    assert(readCourseMappings(dryCreekCourse).shapes[2].route.length===0&&readCourseMappings(dryCreekCourse).shapes[13].route.length===2&&readCourseMappings(dryCreekCourse).shapes[12].route.length===2,'First edit lost other Dry Creek mappings or restored cleared route');
    selectCourse(privareCourseId);startHole=19;startRound();assert(s.active&&s.hole===19&&isPhysicalRound(),'Private physical round start');selectThrowDisc('library-blue');
    const active=snapshot(),state=JSON.stringify(s),selected=physicalRound.selectedDiscId;await refreshSharedCourseLibrary();assert(active===snapshot()&&state===JSON.stringify(s)&&physicalRound.selectedDiscId===selected,'Active gameplay changed');
    sessionStorage.setItem('library-test-round','yes');
   }
  }
  assert(!window.libraryTestErrors.length,'JavaScript error after interaction');
  if(s.active&&isPhysicalRound()&&sharedResolvedMappings.has(selectedCourseId)&&!sharedCourseHasPersonalData(selectedCourseId))assert((await collectFullBackup()).data[sharedRoundContextPrefix+physicalRound.roundId]===localStorage.getItem(sharedRoundContextPrefix+physicalRound.roundId),'Full Backup omitted shared round context');
  return {pass:true,scenario,width:innerWidth,sharedCourses:sharedResolvedMappings.size,privateHoles:privateCourse.holes.length,activeRoundPreserved:true,protectedStorage:true,noErrors:true};
 }catch(e){return {pass:false,scenario,width:innerWidth,error:e.message}}
})();
