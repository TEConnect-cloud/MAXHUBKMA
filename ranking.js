/* ===========================================================
   TEConnect Game Event — shared ranking module
   Usage:
     Ranking.promptNameAndSave('maze', '미로 탈출', seconds, `${seconds}초`, 'asc');
     Ranking.showModal('maze', '미로 탈출');
   order: 'asc'  -> lower value is better (time-based games)
          'desc' -> higher value is better (score-based games)
   =========================================================== */
(function(){
  function key(id){ return 'tc_rank_' + id; }

  function load(id){
    try { return JSON.parse(localStorage.getItem(key(id))) || []; }
    catch(e){ return []; }
  }

  function persist(id, list){
    localStorage.setItem(key(id), JSON.stringify(list.slice(0,10)));
  }

  function ensureRankingModal(){
    if(document.getElementById('rankingModal')) return;
    const div = document.createElement('div');
    div.id = 'rankingModal';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" aria-label="닫기">×</button>
        <h2>🏆 명예의 전당 <span id="rankGameTitle"></span></h2>
        <ul class="rank-list" id="rankList"></ul>
        <button class="btn btn-ghost" id="rankClearBtn">랭킹 초기화</button>
      </div>`;
    document.body.appendChild(div);
    div.querySelector('.modal-close').addEventListener('click', ()=>Ranking.hideModal());
    div.addEventListener('click', (e)=>{ if(e.target === div) Ranking.hideModal(); });
  }

  function ensureNameModal(){
    if(document.getElementById('nameModal')) return;
    const div = document.createElement('div');
    div.id = 'nameModal';
    div.className = 'modal-overlay hidden';
    div.innerHTML = `
      <div class="modal-card">
        <h2>🎉 완료! 이름을 입력해주세요</h2>
        <input type="text" id="nameInputField" class="name-input" maxlength="8" placeholder="이름 (최대 8자)">
        <div style="margin-top:6px;">
          <button class="btn btn-primary" id="nameSubmitBtn">랭킹 등록</button>
        </div>
      </div>`;
    document.body.appendChild(div);
  }

  window.Ranking = {
    add(id, name, value, display, order){
      order = order || 'asc';
      const list = load(id);
      list.push({ name: (name || '익명').slice(0,8), value, display, date: Date.now() });
      list.sort((a,b)=> order==='asc' ? a.value - b.value : b.value - a.value);
      persist(id, list);
    },

    list(id){ return load(id); },

    clear(id){ localStorage.removeItem(key(id)); },

    showModal(id, title){
      ensureRankingModal();
      document.getElementById('rankGameTitle').textContent = title ? `(${title})` : '';
      const list = load(id);
      const ul = document.getElementById('rankList');
      ul.innerHTML = '';
      if(list.length === 0){
        ul.innerHTML = '<li class="rank-empty">아직 랭킹이 없습니다.</li>';
      } else {
        const medals = ['🥇','🥈','🥉'];
        list.forEach((item, i)=>{
          const li = document.createElement('li');
          const rankLabel = medals[i] || (i+1) + '.';
          li.innerHTML = `<span>${rankLabel} ${escapeHtml(item.name)}</span><span>${escapeHtml(item.display)}</span>`;
          ul.appendChild(li);
        });
      }
      const clearBtn = document.getElementById('rankClearBtn');
      clearBtn.onclick = ()=>{
        if(confirm('랭킹을 초기화할까요?')){
          Ranking.clear(id);
          Ranking.showModal(id, title);
        }
      };
      document.getElementById('rankingModal').classList.remove('hidden');
    },

    hideModal(){
      const el = document.getElementById('rankingModal');
      if(el) el.classList.add('hidden');
    },

    promptNameAndSave(id, title, value, display, order, onDone){
      ensureNameModal();
      const modal = document.getElementById('nameModal');
      modal.classList.remove('hidden');
      const field = document.getElementById('nameInputField');
      field.value = '';
      setTimeout(()=>field.focus(), 50);

      const submit = ()=>{
        const name = field.value.trim() || '익명';
        Ranking.add(id, name, value, display, order);
        modal.classList.add('hidden');
        Ranking.showModal(id, title);
        if(onDone) onDone();
      };
      document.getElementById('nameSubmitBtn').onclick = submit;
      field.onkeydown = (e)=>{ if(e.key==='Enter') submit(); };
    }
  };

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, (c)=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
})();
