const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const http = require('http');
const { parse } = require('cookie');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const DB_URL = process.env.DB_URL || process.env.DATABASE_URL;
if (!DB_URL) { console.error('Please set DB_URL'); }

const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function init(){
  await pool.query(`CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member',
    photo TEXT
  );`);
  await pool.query(`CREATE TABLE IF NOT EXISTS messages(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
  console.log("DB ready");
}
init().catch(e=>console.error(e));

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

const upload = multer({ dest: 'uploads/' });

async function auth(req,res,next){
  try{
    const cookieHeader = req.headers.cookie || '';
    const token = parse(cookieHeader).token;
    if(!token) return res.status(401).json({error:"Unauthorized"});
    const data = jwt.verify(token, JWT_SECRET);
    const u = await pool.query("SELECT id,name,email,role,photo FROM users WHERE id=$1",[data.id]);
    if(!u.rows.length) return res.status(401).json({error:"Unauthorized"});
    req.user = u.rows[0];
    next();
  }catch(e){ res.status(401).json({error:"Unauthorized"}); }
}

function adminOnly(req,res,next){
  if(req.user && req.user.role === 'admin') return next();
  return res.status(403).json({error:'Admins only'});
}

// Register
app.post('/api/register', async (req,res)=>{
  try{
    const {name,email,password} = req.body;
    if(!name||!email||!password) return res.json({error:'Missing'});
    const exists = await pool.query("SELECT id FROM users WHERE email=$1",[email.toLowerCase()]);
    if(exists.rows.length) return res.json({error:'Email exists'});
    const hash = await bcrypt.hash(password,10);
    await pool.query("INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3)",[name,email.toLowerCase(),hash]);
    res.json({success:true});
  }catch(e){ console.error(e); res.json({error:'Error'}); }
});

// Login
app.post('/api/login', async (req,res)=>{
  try{
    const {email,password} = req.body;
    const u = await pool.query("SELECT * FROM users WHERE email=$1",[email.toLowerCase()]);
    if(!u.rows.length) return res.json({error:'Invalid'});
    const ok = await bcrypt.compare(password, u.rows[0].password_hash);
    if(!ok) return res.json({error:'Invalid'});
    const token = jwt.sign({id:u.rows[0].id}, JWT_SECRET, { expiresIn: '7d' });
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*86400}`);
    res.json({success:true});
  }catch(e){ console.error(e); res.json({error:'Error'}); }
});

app.post('/api/logout',(req,res)=>{
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
  res.json({success:true});
});

app.get('/api/me', auth, (req,res)=> res.json({user:req.user}));

app.get('/api/messages', auth, async (req,res)=>{
  const m = await pool.query(`SELECT m.id,m.message,m.created_at,u.id as user_id,u.name as username
    FROM messages m JOIN users u ON m.user_id=u.id ORDER BY m.id DESC LIMIT 200`);
  res.json({messages: m.rows.reverse()});
});

// Admin APIs
app.get('/api/admin/users', auth, adminOnly, async (req,res)=>{
  const u = await pool.query("SELECT id,name,email,role,photo FROM users ORDER BY id DESC");
  res.json({users:u.rows});
});

app.post('/api/admin/user/:id/role', auth, adminOnly, async (req,res)=>{
  const id = req.params.id; const {role} = req.body;
  if(!['admin','member'].includes(role)) return res.json({error:'Invalid role'});
  await pool.query("UPDATE users SET role=$1 WHERE id=$2",[role,id]);
  res.json({success:true});
});

app.delete('/api/admin/user/:id', auth, adminOnly, async (req,res)=>{
  const id = req.params.id;
  await pool.query("DELETE FROM users WHERE id=$1",[id]);
  res.json({success:true});
});

// Upload profile photo
app.post('/api/upload', auth, upload.single('photo'), async (req,res)=>{
  if(!req.file) return res.json({error:'No file'});
  const ext = path.extname(req.file.originalname) || '';
  const newName = req.file.filename + ext;
  const newPath = path.join('uploads', newName);
  fs.renameSync(req.file.path, newPath);
  await pool.query("UPDATE users SET photo=$1 WHERE id=$2", [newName, req.user.id]);
  res.json({success:true, photo: newName});
});

// Socket.io auth
io.use(async (socket, next)=>{
  try{
    const cookieHeader = socket.handshake.headers.cookie || '';
    const token = parse(cookieHeader).token;
    if(!token) return next(new Error('Unauthorized'));
    const data = jwt.verify(token, JWT_SECRET);
    const u = await pool.query("SELECT id,name FROM users WHERE id=$1",[data.id]);
    if(!u.rows.length) return next(new Error('Unauthorized'));
    socket.user = u.rows[0];
    next();
  }catch(e){ next(new Error('Unauthorized')) }
});

io.on('connection', socket=>{
  socket.broadcast.emit('system', {message: `${socket.user.name} joined the chat`});
  socket.on('sendMessage', async (msg)=>{
    if(!msg) return;
    const now = new Date();
    await pool.query("INSERT INTO messages(user_id,message,created_at) VALUES($1,$2,$3)",[socket.user.id,msg,now]);
    io.emit('message', {user_id: socket.user.id, username: socket.user.name, message: msg, created_at: now});
  });
  socket.on('disconnect', ()=>{
    socket.broadcast.emit('system', {message: `${socket.user.name} left the chat`});
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log('Server running on '+PORT));
