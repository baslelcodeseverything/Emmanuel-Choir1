(async function(){
  const status=document.getElementById('status'), chatBox=document.getElementById('chatBox'), messages=document.getElementById('messages');
  try{
    const meRes = await fetch('/api/me');
    if(!meRes.ok) throw new Error('not auth');
    const me = await meRes.json();
    status.textContent = 'Welcome '+me.user.name;
    chatBox.style.display='block';
    const msgsRes = await fetch('/api/messages'); const data = await msgsRes.json();
    data.messages.forEach(m=>{ const el=document.createElement('div'); el.textContent = `[${new Date(m.created_at).toLocaleString()}] ${m.username}: ${m.message}`; messages.appendChild(el); });
    const socket = io();
    socket.on('message', m=>{ const el=document.createElement('div'); el.textContent = `[${new Date(m.created_at).toLocaleString()}] ${m.username}: ${m.message}`; messages.appendChild(el); messages.scrollTop = messages.scrollHeight; });
    socket.on('system', s=>{ const el=document.createElement('div'); el.textContent = `* ${s.message}`; messages.appendChild(el); });
    document.getElementById('msgForm').onsubmit = e => { e.preventDefault(); const v=document.getElementById('msgInp').value.trim(); if(!v) return; socket.emit('sendMessage', v); document.getElementById('msgInp').value=''; };
    document.getElementById('logoutBtn').onclick = async ()=>{ await fetch('/api/logout',{method:'POST'}); location='/'; };
    document.getElementById('up').onclick = async ()=>{ const file=document.getElementById('photo').files[0]; if(!file) return alert('Choose file'); const form=new FormData(); form.append('photo', file); const res = await fetch('/api/upload',{method:'POST',body:form}); const j = await res.json(); if(j.success) alert('Uploaded'); else alert('Upload failed'); };
  }catch(e){ status.textContent='You must be logged in to use chat.'; chatBox.style.display='none'; }
})();
