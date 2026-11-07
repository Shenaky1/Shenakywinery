// Cloudflare Access application identity. These are public verification settings.
export const ACCESS_ISSUER='https://small-band-01d5.cloudflareaccess.com';
export const ACCESS_AUDIENCE='d3578986e5d393bc6bc37dcc65c737a4a2c6bf6353e9ddc1aeb46649b4146d6b';
const OWNER_EMAIL_SHA256='87af2a9d1de17ccd9057c0211bde8612161b42a2fb3ac554f1c33fb14fe1980a';
let cachedKeys=null,keysUntil=0;
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const json=s=>JSON.parse(new TextDecoder().decode(decode(s)));
export async function verifyAccess(request,loadKeys=async()=>{
 if(cachedKeys&&Date.now()<keysUntil)return cachedKeys;
 const response=await fetch(ACCESS_ISSUER+'/cdn-cgi/access/certs',{redirect:'error'});
 if(!response.ok)throw Error('Key lookup failed');
 const jwks=await response.json();if(!Array.isArray(jwks.keys))throw Error('Invalid key set');
 cachedKeys=jwks.keys;keysUntil=Date.now()+300000;return cachedKeys;
}){
 const token=request.headers.get('Cf-Access-Jwt-Assertion');
 if(!token||token.length>16384)throw Error('Authentication required');
 const parts=token.split('.');if(parts.length!==3)throw Error('Invalid assertion');
 const head=json(parts[0]),payload=json(parts[1]);
 if(head.alg!=='RS256'||typeof head.kid!=='string'||head.crit)throw Error('Unsupported assertion');
 const now=Math.floor(Date.now()/1000);
 if(payload.iss!==ACCESS_ISSUER||!Array.isArray(payload.aud)||!payload.aud.includes(ACCESS_AUDIENCE)||typeof payload.exp!=='number'||payload.exp<=now||typeof payload.sub!=='string'||!payload.sub||typeof payload.email!=='string')throw Error('Invalid identity');
 if(payload.nbf!==undefined&&(typeof payload.nbf!=='number'||payload.nbf>now))throw Error('Assertion not active');
 if(payload.iat!==undefined&&(typeof payload.iat!=='number'||payload.iat>now+30))throw Error('Assertion issued in future');
 const keys=await loadKeys();let key=keys.find(k=>k.kid===head.kid&&k.kty==='RSA');
 if(!key){cachedKeys=null;keysUntil=0;throw Error('Unknown signing key; retry');}
 const imported=await crypto.subtle.importKey('jwk',key,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',imported,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1])))throw Error('Bad signature');
 const email=payload.email.trim().toLowerCase();const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(email));
 const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==OWNER_EMAIL_SHA256)throw Error('Owner access only');
 return {sub:payload.sub,email};
}
