const $ = selector => document.querySelector(selector);
const createNode = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; };
const ymd = d => d.toISOString().slice(0,10);
const fmtID = d => d.toLocaleDateString('id-ID',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});

const logoBtn = document.getElementById('logoBtn');
if (logoBtn) logoBtn.addEventListener('click', () => { window.scrollTo({top:0, behavior:'smooth'}); location.reload(); });

(function initSlider(){
  const track = document.getElementById('track');
  const slider = document.getElementById('slider');
  if (!track || !slider || !track.children.length) return;
  const slides = track.children.length;
  let idx = 0, timer = null, startX = 0, deltaX = 0;
  const dots = document.getElementById('dots');
  const setDots = () => dots && [...dots.children].forEach((d,i)=>d.classList.toggle('active', i===idx));
  const go = (n, hold=false) => {
    idx = (n + slides) % slides;
    track.style.transform = `translateX(-${idx*100}%)`;
    setDots();
    if (hold) reset();
  };
  if (dots) for(let i=0;i<slides;i++){ const dot=document.createElement('div'); dot.className='dot'+(i===0?' active':''); dot.addEventListener('click',()=>go(i,true)); dots.appendChild(dot); }
  const reset = () => { if(timer) clearInterval(timer); timer = setInterval(()=>go(idx+1), 3800); };
  document.getElementById('next')?.addEventListener('click',()=>go(idx+1,true));
  document.getElementById('prev')?.addEventListener('click',()=>go(idx-1,true));
  slider.addEventListener('mouseenter',()=>timer&&clearInterval(timer));
  slider.addEventListener('mouseleave',reset);
  slider.addEventListener('touchstart', e=>{startX=e.touches[0].clientX; deltaX=0; if(timer) clearInterval(timer);},{passive:true});
  slider.addEventListener('touchmove', e=>{deltaX=e.touches[0].clientX-startX;},{passive:true});
  slider.addEventListener('touchend',()=>{ if(Math.abs(deltaX)>40) deltaX>0?go(idx-1):go(idx+1); reset(); });
  reset();
})();

const MAJOR = ['CHAMPIONS LEAGUE','EUROPA LEAGUE','PREMIER LEAGUE','LA LIGA','SERIE A','BUNDESLIGA','LIGUE 1','INDONESIA'];
function leagueRank(title=''){
  const upper = title.toUpperCase();
  const idx = MAJOR.findIndex(x => upper.includes(x));
  return idx === -1 ? 99 : idx;
}
function initials(name='Team'){
  return String(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'FC';
}
function confidenceClass(n){ n=Number(n||0); return n>=78?'High':n>=60?'Medium':'Value'; }
function card(row, league){
  const teams = String(row.match || 'Home vs Away').split(' vs ');
  const conf = Math.max(0, Math.min(100, Number(row.confidence || 62)));
  return `<article class="home-match-card" data-row="${[league.title,row.match,row.tip].join(' ').toLowerCase()}">
    <div class="home-match-top">
      <span>${league.flag ? `<img src="${league.flag}" alt="" loading="lazy">` : ''}${league.title}</span>
      <b>${row.kickoff || '-'}</b>
    </div>
    <div class="home-teams">
      <div><i>${initials(teams[0])}</i><strong>${teams[0] || 'Home'}</strong></div>
      <em>VS</em>
      <div><i>${initials(teams[1])}</i><strong>${teams[1] || 'Away'}</strong></div>
    </div>
    <div class="home-prediction">
      <span><small>Pick</small><b>${row.tip || '-'}</b></span>
      <span><small>Skor</small><b>${row.predictedScore || row.score || '-'}</b></span>
      <span><small>Confidence</small><b>${conf}%</b></span>
    </div>
    <div class="confidence"><span style="width:${conf}%"></span></div>
    <div class="home-match-foot"><span class="live-dot"></span><span>${confidenceClass(conf)} Confidence</span></div>
  </article>`;
}
function render(data){
  const root = $('#content');
  if (!root) return;
  const groups = [...(data.groups || [])].sort((a,b)=>leagueRank(a.title)-leagueRank(b.title));
  if (!groups.length) {
    root.innerHTML = `<div class="empty-state"><h2>Data pertandingan belum tersedia.</h2><p>Coba refresh beberapa saat lagi atau pastikan API-FOOTBALL sudah aktif di Railway Variables.</p></div>`;
    return;
  }
  root.innerHTML = groups.map(g => {
    const rows = [...(g.rows || [])].slice(0,12);
    if (!rows.length) return '';
    return `<section class="home-league-block panel" data-title="${g.title}">
      <div class="head">${g.flag ? `<img src="${g.flag}" alt="" loading="lazy" style="width:20px;height:14px;object-fit:cover;border-radius:3px">` : ''}${g.title}</div>
      <div class="home-card-grid">${rows.map(r => card(r,g)).join('')}</div>
    </section>`;
  }).join('');
  applyFilter(document.getElementById('q')?.value.trim().toLowerCase() || '');
}
async function fetchData(dateStr){
  const res = await fetch('/api/fixtures?date='+encodeURIComponent(dateStr));
  if(!res.ok) throw new Error('HTTP '+res.status);
  return res.json();
}
function fallback(dateStr){
  return {date:dateStr,groups:[{title:'ENGLAND - Premier League',flag:'https://flagcdn.com/w20/gb.png',rows:[{kickoff:'Hari ini 22:30 WIB',match:'West Ham United vs Arsenal',tip:'Arsenal',confidence:76,predictedScore:'1 - 2'},{kickoff:'Hari ini 20:00 WIB',match:'Liverpool vs Everton',tip:'Liverpool',confidence:72,predictedScore:'2 - 1'}]},{title:'SPAIN - La Liga',flag:'https://flagcdn.com/w20/es.png',rows:[{kickoff:'Besok 02:00 WIB',match:'Barcelona vs Real Madrid',tip:'Over 2.5',confidence:70,predictedScore:'2 - 2'}]}]};
}
async function load(date){
  const dateLine = document.getElementById('dateLine');
  if(dateLine) dateLine.textContent = fmtID(date);
  const loader = document.getElementById('loader');
  loader?.classList.add('show');
  try { render(await fetchData(ymd(date))); }
  catch { render(fallback(ymd(date))); }
  finally { loader?.classList.remove('show'); }
}
function applyFilter(q){
  document.querySelectorAll('.home-match-card').forEach(card=>{ card.style.display = !q || (card.dataset.row||'').includes(q) ? '' : 'none'; });
  document.querySelectorAll('.home-league-block').forEach(block=>{
    const any = [...block.querySelectorAll('.home-match-card')].some(x => x.style.display !== 'none');
    block.style.display = any ? '' : 'none';
  });
}
document.getElementById('q')?.addEventListener('input', e=>applyFilter(e.target.value.trim().toLowerCase()));

(function quickMenu(){
  const fab = document.getElementById('mcFab');
  const sheet = document.getElementById('mcSheet');
  const closeBtn = document.getElementById('mcClose');
  if(!fab || !sheet) return;
  const open = () => { sheet.classList.add('show'); fab.setAttribute('aria-expanded','true'); sheet.setAttribute('aria-hidden','false'); };
  const close = () => { sheet.classList.remove('show'); fab.setAttribute('aria-expanded','false'); sheet.setAttribute('aria-hidden','true'); };
  fab.addEventListener('click', () => sheet.classList.contains('show') ? close() : open());
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  document.addEventListener('click', e => { if(sheet.classList.contains('show') && !sheet.contains(e.target) && !fab.contains(e.target)) close(); });
})();

load(new Date());
