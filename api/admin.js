(async function(){
  const status=document.getElementById('status'), panel=document.getElementById('panel'), usersDiv=document.getElementById('users');
  try{
    const meRes = await fetch('/api/me'); if(!meRes.ok) throw new Error('not auth'); const me = await meRes.json();
    status.textContent = 'Welcome '+me.user.name; panel.style.display='block';
    const ures = await fetch('/api/admin/users'); const j = await ures.json();
    usersDiv.innerHTML = '';
    j.users.forEach(u=>{ const row = document.createElement('div'); row.innerHTML = `<strong>${u.name}</strong> (${u.email}) - ${u.role} <button data-id="${u.id}" class="make-admin">Make Admin</button> <button data-id="${u.id}" class="make-member">Make Member</button> <button data-id="${u.id}" class="del">Delete</button>`; usersDiv.appendChild(row); });
    usersDiv.querySelectorAll('.make-admin').forEach(b=>b.onclick=async ()=>{ await fetch('/api/admin/user/'+b.dataset.id+'/role',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'admin'})}); location.reload(); });
    usersDiv.querySelectorAll('.make-member').forEach(b=>b.onclick=async ()=>{ await fetch('/api/admin/user/'+b.dataset.id+'/role',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'member'})}); location.reload(); });
    usersDiv.querySelectorAll('.del').forEach(b=>b.onclick=async ()=>{ if(confirm('Delete?')){ await fetch('/api/admin/user/'+b.dataset.id,{method:'DELETE'}); location.reload(); }});
  }catch(e){ status.textContent='Admins only or not logged in.'; panel.style.display='none'; }
})();
