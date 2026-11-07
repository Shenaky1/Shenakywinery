import {buildSync} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const result=buildSync({entryPoints:[path.join(root,'main.tsx')],bundle:true,minify:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Shenaky | Private Cellar</title><link rel="stylesheet" href="/cellar/style.css"></head><body><div id="root"></div><script defer src="/cellar/app.js"></script></body></html>';
const js=result.outputFiles[0].text,css=fs.readFileSync(path.join(root,'style.css'),'utf8');
fs.writeFileSync(path.join(root,'../cellar-ui.mjs'),'// Generic application only. Wine records are held in private runtime storage.\nexport const HTML='+JSON.stringify(html)+';\nexport const JS='+JSON.stringify(js)+';\nexport const CSS='+JSON.stringify(css)+';\n');
