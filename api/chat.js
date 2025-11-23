import fs from 'fs/promises';
const DATA_FILE = './data.json';
async function readData(){ try{ const t = await fs.readFile(DATA_FILE, 'utf8'); return JSON.parse(t); }catch(e){ return {users:[], messages:[]}; } }
async function writeData(d){ try{ await fs.writeFile(DATA_FILE, JSON.stringify(d, null, 2)); return true;}catch(e){ console.warn('write failed',e); return false; } }
export default async function handler(req,res){
  if(req.method==='GET'){
    const data = await readData();
    return res.json({messages: data.messages||[]});
  }
  if(req.method==='POST'){
    const {name,message} = req.body||{};
    if(!name||!message) return res.status(400).json({error:'Missing'});
    const data = await readData();
    const id = (data.messages.reduce((a,b)=>Math.max(a,b.id||0),0)||0)+1;
    const m = {id, name, message, created_at: new Date().toISOString()};
    data.messages.push(m);
    await writeData(data);
    return res.json({success:true, message:m});
  }
  return res.status(405).json({error:'Only GET/POST'});
}
