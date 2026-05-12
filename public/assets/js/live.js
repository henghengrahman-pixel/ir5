(function(){
  const rowsEl=document.getElementById('liveRows'); const statusEl=document.getElementById('liveStatus');
  if(!rowsEl) return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const logo=s=>s?`<img class="team-logo" src="${esc(s)}" onerror="this.src='/assets/img/default-team.png'">`:'<span class="team-logo"></span>';
  function card(m){ const h=m.home||m.homeName||'Home', a=m.away||m.awayName||'Away', conf=Number(m.confidence||0); return `<div class="match-card"><div class="match-top"><span>${esc(m.league||m.leagueName||'Liga')}</span><span>${esc(m.kickoffWib||m.status||'-')}</span></div><div class="teams"><div class="team">${logo(m.homeLogo)}<b>${esc(h)}</b></div><div class="vs">${esc(m.score&&m.score!=='-'?m.score:'VS')}</div><div class="team away"><b>${esc(a)}</b>${logo(m.awayLogo)}</div></div><div class="pick-row"><div class="pill"><small>Status</small><b>${esc(m.status||'-')}</b></div><div class="pill"><small>Prediksi</small><b>${esc(m.prediction||'-')}</b></div><div class="pill"><small>Skor Prediksi</small><b>${esc(m.predictedScore||'-')}</b></div><div class="pill"><small>Confidence</small><b>${conf||'-'}%</b><div class="progress"><i style="width:${conf}%"></i></div></div></div></div>`; }
  async function load(tab='live'){
    rowsEl.innerHTML=''; statusEl.style.display='block'; statusEl.textContent='Memuat data...';
    const url=tab==='upcoming'?'/api/upcoming':tab==='finished'?'/api/finished':'/api/live';
    try{ const res=await fetch(url); const data=await res.json(); const rows=data.rows||[]; if(!rows.length){statusEl.textContent=data.error?'API belum siap: '+(typeof data.error==='string'?data.error:'cek API key'):'Belum ada pertandingan untuk filter ini.'; return;} statusEl.style.display='none'; rowsEl.innerHTML=rows.map(card).join(''); }
    catch(e){ statusEl.textContent='Gagal memuat live score. Cek koneksi API football.'; }
  }
  document.querySelectorAll('[data-live-tab]').forEach(btn=>btn.addEventListener('click',()=>load(btn.dataset.liveTab)));
  load('live');
})();
