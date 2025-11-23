import fs from 'fs/promises';
const DATA_FILE = './data.json';
async function readData(){ try{ const t = await fs.readFile(DATA_FILE, 'utf8'); return JSON.parse(t); }catch(e){ return {users:[], messages:[]}; } }
async function writeData(d){ try{ await fs.writeFile(DATA_FILE, JSON.stringify(d, null, 2)); return true;}catch(e){ console.warn('write failed',e); return false; } }
export default async function handler(req,res){
  const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
  const key = req.headers['x-admin-key'] || req.query.key;
  if(key !== ADMIN_KEY) return res.status(403).json({error:'Forbidden'});
  if(req.method==='GET'){
    const data = await readData();
    return res.json({users: data.users||[]});
  }
  if(req.method==='POST'){
    const {userId, role} = req.body||{};
    if(!userId||!role) return res.status(400).json({error:'Missing'});
    const data = await readData();
    const u = data.users.find(x=>x.id===userId);
    if(!u) return res.status(404).json({error:'User not found'});
    u.role = role;
    await writeData(data);
    return res.json({success:true, user:u});
  }
  return res.status(405).json({error:'Only GET/POST'});
}
