const fields=['id','name','vintage','stage','source','brix','yeast','filtration','stability','volume','ph','ta','free','total','malic','temp','mlf','oak','additives','lab','notes','harvest','bottling','label','abv','bottles','sold','price'];
export function validateRecords(data){
 if(!Array.isArray(data)||data.length>500||JSON.stringify(data).length>2000000)throw Error('Invalid backup size');
 const ids=new Set();
 return data.map(b=>{
  if(!b||typeof b!=='object'||Array.isArray(b))throw Error('Invalid wine record');
  for(const k of ['id','name','vintage','stage'])if(typeof b[k]!=='string'||!b[k].trim()||b[k].length>300)throw Error('Missing batch identity');
  if(ids.has(b.id))throw Error('Duplicate batch identifier');ids.add(b.id);
  const out={};for(const k of fields){if(b[k]!==undefined&&typeof b[k]!=='string')throw Error('Invalid field: '+k);out[k]=b[k]||'';}
  if(!Array.isArray(b.events)||!Array.isArray(b.tasks)||b.events.length>5000||b.tasks.length>5000)throw Error('Invalid batch history');
  out.events=b.events.map(e=>{if(!e||['date','type','text'].some(k=>typeof e[k]!=='string'))throw Error('Invalid event');return {date:e.date,type:e.type,text:e.text};});
  out.tasks=b.tasks.map(t=>{if(!t||typeof t.title!=='string'||typeof t.due!=='string'||typeof t.done!=='boolean')throw Error('Invalid task');return {title:t.title,due:t.due,done:t.done};});
  if(b.sourceNotes!==undefined){if(!Array.isArray(b.sourceNotes)||b.sourceNotes.length>100)throw Error('Invalid source notes');out.sourceNotes=b.sourceNotes.map(n=>{const s={};for(const k of ['key','year','title','created','modified','text','kind']){if(typeof n[k]!=='string')throw Error('Invalid original note');s[k]=n[k];}return s;});}
  for(const k of ['importVersion','notesImportVersion'])if(Number.isInteger(b[k]))out[k]=b[k];
  return out;
 });
}
