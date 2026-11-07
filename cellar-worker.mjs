import {verifyAccess,authHealth} from './cellar-auth.mjs';
import {validateRecords} from './cellar-data.mjs';
import {HTML,JS,CSS} from './cellar-ui.mjs';
const headers={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"};
const response=(body,status=200,type='text/plain; charset=utf-8')=>new Response(body,{status,headers:{...headers,'Content-Type':type}});
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/__cellar_auth_health'&&request.method==='GET')return Response.json(await authHealth(),{headers:{'Cache-Control':'no-store'}});
  if(url.pathname!=='/cellar'&&!url.pathname.startsWith('/cellar/'))return env.ASSETS.fetch(request);
  if(url.hostname!=='shenakywinery.com')return response('Owner access required. Open https://shenakywinery.com/cellar',403);
  try{await verifyAccess(request);}catch(error){const reasons={'Authentication required':'missing-token','Invalid assertion':'token-format','Unsupported assertion':'algorithm','Invalid assertion encoding':'token-encoding','Key service unavailable':'key-service','Verification key import failed':'key-import','Issuer mismatch':'issuer','Audience mismatch':'audience','Session expired':'expired','Missing user identity':'user-identity','Key lookup failed':'key-lookup','Invalid key set':'key-format','Unknown signing key; retry':'key-rotation','Bad signature':'signature','Owner access only':'owner-only','Assertion not active':'not-active','Assertion issued in future':'clock'};const code=reasons[error?.message]||'token-check';return response('<!doctype html><html><head><meta charset="utf-8"><title>Cellar sign-in</title></head><body><h1>Your cellar sign-in needs to be renewed</h1><p>Your wine records have not changed.</p><p><a href="/cdn-cgi/access/logout">Sign out of the old session</a>, then return to <a href="/cellar">your cellar</a> and request a new email code.</p><p>Support code: '+code+'</p></body></html>',401,'text/html; charset=utf-8');}
  if(url.pathname==='/cellar/api/cellar'){
   if(!['GET','PUT'].includes(request.method))return response('Method not allowed',405);
   if(request.method==='PUT'){
    if(request.headers.get('Origin')!==url.origin||request.headers.get('X-Cellar-Request')!=='1'||!request.headers.get('Content-Type')?.startsWith('application/json'))return response('Invalid request origin',403);
    const size=Number(request.headers.get('Content-Length')||0);if(size>2100000)return response('Backup too large',413);
   }
   if(!env.CELLAR_STORE)return response('Cellar storage is being configured. Your old private cellar remains available.',503);
   try{const id=env.CELLAR_STORE.idFromName('shenaky-owner-cellar-v1');const result=await env.CELLAR_STORE.get(id).fetch(new Request('https://cellar.internal/state',{method:request.method,headers:{'Content-Type':'application/json'},body:request.method==='PUT'?await request.text():undefined}));return new Response(result.body,{status:result.status,headers:{...headers,'Content-Type':result.headers.get('Content-Type')||'application/json'}});}catch{return response('Unable to access cellar storage. Please retry; keep your backup.',503);}
  }
  if(!['GET','HEAD'].includes(request.method))return response('Method not allowed',405);
  if(url.pathname==='/cellar/app.js')return response(request.method==='HEAD'?null:JS,200,'application/javascript; charset=utf-8');
  if(url.pathname==='/cellar/style.css')return response(request.method==='HEAD'?null:CSS,200,'text/css; charset=utf-8');
  if(url.pathname==='/cellar'||url.pathname==='/cellar/')return response(request.method==='HEAD'?null:HTML,200,'text/html; charset=utf-8');
  return response('Not found',404);
 }
};
// This object has no public URL. Only the authenticated Worker above can reach it.
export class CellarStore {
 constructor(ctx,env){this.ctx=ctx;ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS cellar_state (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL)');ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS cellar_history (revision INTEGER PRIMARY KEY, data TEXT NOT NULL, updated_at TEXT NOT NULL)');}
 async fetch(request){
  const sql=this.ctx.storage.sql;
  if(request.method==='GET'){const row=sql.exec('SELECT data, revision, updated_at FROM cellar_state WHERE id=1').toArray()[0];return Response.json(row||{data:null,revision:0});}
  if(request.method!=='PUT')return new Response('Method not allowed',{status:405});
  try{
   const raw=await request.text();if(raw.length>2100000)return new Response('Backup too large',{status:413});
   const incoming=JSON.parse(raw);if(!Number.isInteger(incoming.revision)||incoming.revision<0)return new Response('Invalid revision',{status:400});
   const data=JSON.stringify(validateRecords(incoming.data));
   return this.ctx.storage.transactionSync(()=>{
    const current=sql.exec('SELECT data, revision, updated_at FROM cellar_state WHERE id=1').toArray()[0];
    if((current?.revision||0)!==incoming.revision)return new Response('Another session saved changes. Export your changes, then reload before saving.',{status:409});
    const revision=incoming.revision+1,when=new Date().toISOString();
    if(current)sql.exec('INSERT OR REPLACE INTO cellar_history (revision,data,updated_at) VALUES (?,?,?)',current.revision,current.data,current.updated_at);
    sql.exec('INSERT OR REPLACE INTO cellar_state (id,data,revision,updated_at) VALUES (1,?,?,?)',data,revision,when);
    sql.exec('DELETE FROM cellar_history WHERE revision < ?',Math.max(0,revision-20));
    return Response.json({revision});
   });
  }catch{return new Response('Invalid backup or wine records. No changes were saved.',{status:400});}
 }
}
