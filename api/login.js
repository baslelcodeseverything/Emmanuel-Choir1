import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
const DATA_FILE = './data.json';
async function readData(){ try{ const t = await fs.readFile(DATA_FILE, 'utf8'); return JSON.parse(t); }catch(e){ return {users:[], messages:[]}; } }
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Only POST'});
  const {email,password} = req.body||{};
  if(!email||!password) return res.status(400).json({error:'Missing'});
  const data = await readData();
  const u = data.users.find(x=>x.email===email.toLowerCase());
  if(!u) return res.status(400).json({error:'Invalid'});
  const ok = await bcrypt.compare(password, u.password_hash);
  if(!ok) return res.status(400).json({error:'Invalid'});
  const token = 'demo-token-'+u.id;
  res.json({success:true, token, user:{id:u.id,name:u.name,email:u.email,role:u.role}});
}
