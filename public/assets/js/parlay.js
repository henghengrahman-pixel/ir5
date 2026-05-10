document.addEventListener('DOMContentLoaded', function(){
  const input = document.getElementById('matchFilter');
  const chips = document.querySelectorAll('#leagueChips .chip');
  const items = document.querySelectorAll('.match-search-item');
  let activeLeague = 'all';
  function apply(){
    const q = (input?.value || '').trim().toLowerCase();
    items.forEach(item => {
      const text = item.dataset.search || '';
      const league = item.dataset.league || '';
      const okText = !q || text.includes(q);
      const okLeague = activeLeague === 'all' || league.includes(activeLeague);
      item.style.display = okText && okLeague ? '' : 'none';
    });
  }
  input?.addEventListener('input', apply);
  chips.forEach(btn => btn.addEventListener('click', function(){
    chips.forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    activeLeague = btn.dataset.league || 'all';
    apply();
  }));
});
