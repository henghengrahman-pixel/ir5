import session from 'express-session';
import fs from 'fs/promises';
import path from 'path';
import { dataDir } from './json-db.js';

export class FileSessionStore extends session.Store {
  constructor(){ super(); this.dir = path.join(dataDir, 'sessions'); fs.mkdir(this.dir,{recursive:true}).catch(()=>{}); }
  file(sid){ return path.join(this.dir, `${String(sid).replace(/[^a-zA-Z0-9_-]/g,'')}.json`); }
  async get(sid, cb){ try{ const raw = await fs.readFile(this.file(sid),'utf8'); const data=JSON.parse(raw); if(data?.cookie?.expires && new Date(data.cookie.expires).getTime()<Date.now()){ await this.destroy(sid,()=>{}); return cb(null,null); } cb(null,data); }catch(e){ cb(null,null); } }
  async set(sid, sess, cb){ try{ await fs.mkdir(this.dir,{recursive:true}); await fs.writeFile(this.file(sid), JSON.stringify(sess), 'utf8'); cb&&cb(null); }catch(e){ cb&&cb(e); } }
  async destroy(sid, cb){ try{ await fs.rm(this.file(sid),{force:true}); cb&&cb(null); }catch(e){ cb&&cb(e); } }
}
