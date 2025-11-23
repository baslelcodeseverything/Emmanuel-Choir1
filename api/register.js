import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
const DATA_FILE = './data.json';
async function readData(){ try{ const t = await fs.readFile(DATA_FILE, 'utf8'); return JSON.parse(t); }catch(e){ return {users:[], messages:[]}; } }
async function writeData(d){ try{ await fs.writeFile(DATA_FILE, JSON.stringify(d, null, 2)); return true;}catch(e){ console.warn('write failed',e); return false; } }
export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Only POST'});
  const {name,email,password} = req.body || {};
  if(!name||!email||!password) return res.status(400).json({error:'Missing fields'});
  const data = await readData();
  if(data.users.find(u=>u.email.toLowerCase()===email.toLowerCase())) return res.status(400).json({error:'Email exists'});
  const hash = await bcrypt.hash(password, 10);
  const id = (data.users.reduce((a,b)=>Math.max(a,b.id||0),0)||0)+1;
  const user = {id,name, email: email.toLowerCase(), password_hash: hash, role:'member'};
  data.users.push(user);
  await writeData(data);
  return res.json({success:true, id});
}
