/* ===================================================
   (주)노금휀스철망 — Admin
   localStorage-backed CRUD for portfolio & quotes
   =================================================== */

(function () {
  'use strict';

  const KEYS = {
    images: 'nk_gallery',
    quotes: 'nk_quotes'
  };

  // ---------- Storage helpers
  const load = (k, fallback = []) => {
    try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
    catch { return fallback; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // Seed sample data on first run
  if (!localStorage.getItem(KEYS.images)) {
    save(KEYS.images, [
      { id: 'img_1', image_url: '', title: '○○산업단지 철망휀스 시공', description: '대규모 산업단지 외곽 보안 휀스 설치', category: 'factory', display_order: 1, is_active: true, created_at: new Date().toISOString() },
      { id: 'img_2', image_url: '', title: '아파트 건설현장 가림막', description: '안전과 미관을 모두 고려한 공사장 가림막', category: 'construction', display_order: 2, is_active: true, created_at: new Date().toISOString() }
    ]);
  }

  // ---------- Refs
  const $ = (id) => document.getElementById(id);
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const imagesGrid = $('imagesGrid');
  const quotesBody = $('quotesBody');
  const categoryFilter = $('categoryFilter');
  const statusFilter = $('statusFilter');

  // ---------- Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      tabContents.forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
    });
  });

  // ---------- Modals
  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => {
      el.closest('.modal').classList.remove('open');
    });
  });
  function openModal(id) { $(id).classList.add('open'); }
  function closeModal(id) { $(id).classList.remove('open'); }

  // ---------- Toast
  function toast(msg) {
    $('toastMsg').textContent = msg;
    $('toast').classList.add('show');
    setTimeout(() => $('toast').classList.remove('show'), 2200);
  }

  // ---------- Categories
  const CATEGORY_LABELS = {
    factory: '공장·산업시설',
    construction: '건설현장',
    residential: '주거시설',
    agricultural: '농업시설'
  };

  // ---------- Render dashboard
  function renderStats() {
    const images = load(KEYS.images);
    const quotes = load(KEYS.quotes);
    $('totalImages').textContent = images.length;
    $('totalQuotes').textContent = quotes.length;
    $('pendingQuotes').textContent = quotes.filter(q => q.status === '접수완료' || q.status === '검토중').length;
  }

  // ---------- Render images
  function renderImages() {
    const filter = categoryFilter.value;
    const all = load(KEYS.images);
    const items = filter === 'all' ? all : all.filter(i => i.category === filter);

    if (items.length === 0) {
      imagesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-images"></i>
          <h3>이미지가 없습니다</h3>
          <p>‘이미지 추가’ 버튼으로 시작해 보세요.</p>
        </div>`;
      return;
    }

    imagesGrid.innerHTML = items.map(img => `
      <div class="image-card" data-id="${img.id}">
        <div class="thumb">
          ${img.image_url
            ? `<img src="${escapeAttr(img.image_url)}" alt="${escapeAttr(img.title)}" onerror="this.parentElement.innerHTML='<div class=&quot;empty&quot;>이미지 로드 실패</div>'" />`
            : `<div class="empty">No image</div>`}
        </div>
        <div class="meta">
          <span class="cat">${CATEGORY_LABELS[img.category] || img.category}</span>
          <h4>${escapeHtml(img.title)}</h4>
          <p>${escapeHtml(img.description)}</p>
        </div>
        <div class="actions">
          <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${img.id}">
            <i class="fas fa-pen"></i> 수정
          </button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${img.id}">
            <i class="fas fa-trash"></i> 삭제
          </button>
        </div>
      </div>
    `).join('');
  }

  imagesGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === 'edit') editImage(id);
    if (action === 'delete') deleteImage(id);
  });

  function editImage(id) {
    const img = load(KEYS.images).find(i => i.id === id);
    if (!img) return;
    $('imageModalTitle').textContent = '이미지 수정';
    $('imageId').value = img.id;
    $('imageUrl').value = img.image_url || '';
    $('imageTitle').value = img.title;
    $('imageDescription').value = img.description;
    $('imageCategory').value = img.category;
    openModal('imageModal');
  }

  function deleteImage(id) {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return;
    const list = load(KEYS.images).filter(i => i.id !== id);
    save(KEYS.images, list);
    renderImages();
    renderStats();
    toast('이미지가 삭제되었습니다.');
  }

  $('addImageBtn').addEventListener('click', () => {
    $('imageModalTitle').textContent = '이미지 추가';
    $('imageForm').reset();
    $('imageId').value = '';
    openModal('imageModal');
  });

  $('imageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = $('imageId').value;
    const data = {
      image_url: $('imageUrl').value.trim(),
      title: $('imageTitle').value.trim(),
      description: $('imageDescription').value.trim(),
      category: $('imageCategory').value,
      is_active: true
    };
    const list = load(KEYS.images);
    if (id) {
      const idx = list.findIndex(i => i.id === id);
      if (idx >= 0) list[idx] = { ...list[idx], ...data };
      toast('이미지가 수정되었습니다.');
    } else {
      list.unshift({
        id: 'img_' + Date.now(),
        ...data,
        display_order: list.length + 1,
        created_at: new Date().toISOString()
      });
      toast('이미지가 추가되었습니다.');
    }
    save(KEYS.images, list);
    closeModal('imageModal');
    renderImages();
    renderStats();
  });

  categoryFilter.addEventListener('change', renderImages);

  // ---------- Quotes
  let currentQuoteId = null;

  function renderQuotes() {
    const filter = statusFilter.value;
    const all = load(KEYS.quotes);
    const items = filter === 'all' ? all : all.filter(q => q.status === filter);

    if (items.length === 0) {
      quotesBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="fas fa-inbox"></i>
              <h3>견적 문의가 없습니다</h3>
              <p>홈페이지 견적 문의 폼이 접수되면 여기에 표시됩니다.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    quotesBody.innerHTML = items.map(q => {
      const date = new Date(q.submitted_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
      return `
        <tr data-id="${q.id}">
          <td>${date}</td>
          <td><strong>${escapeHtml(q.company)}</strong></td>
          <td>${escapeHtml(q.phone)}</td>
          <td>${escapeHtml(q.service)}</td>
          <td>${escapeHtml(q.location)}</td>
          <td>${statusPill(q.status)}</td>
          <td>
            <button class="btn btn-ghost btn-sm" data-action="view" data-id="${q.id}">
              <i class="fas fa-eye"></i> 보기
            </button>
          </td>
        </tr>`;
    }).join('');
  }

  function statusPill(s) {
    const cls = {
      '접수완료': 's-received',
      '검토중': 's-review',
      '견적발송': 's-sent',
      '상담완료': 's-done',
      '계약완료': 's-contracted'
    }[s] || 's-received';
    return `<span class="status-pill ${cls}">${s}</span>`;
  }

  quotesBody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="view"]');
    if (!btn) return;
    viewQuote(btn.dataset.id);
  });

  function viewQuote(id) {
    const q = load(KEYS.quotes).find(x => x.id === id);
    if (!q) return;
    currentQuoteId = id;
    const date = new Date(q.submitted_at).toLocaleString('ko-KR');
    $('quoteDetail').innerHTML = `
      <div class="detail-row"><div class="label">회사명 / 이름</div><div class="value">${escapeHtml(q.company)}</div></div>
      <div class="detail-row"><div class="label">접수일</div><div class="value">${date}</div></div>
      <div class="detail-row"><div class="label">연락처</div><div class="value">${escapeHtml(q.phone)}</div></div>
      <div class="detail-row"><div class="label">이메일</div><div class="value">${escapeHtml(q.email || '—')}</div></div>
      <div class="detail-row"><div class="label">시공 지역</div><div class="value">${escapeHtml(q.location)}</div></div>
      <div class="detail-row"><div class="label">서비스</div><div class="value">${escapeHtml(q.service)}</div></div>
      <div class="detail-row full">
        <div class="label">상세 내용</div>
        <div class="value long">${escapeHtml(q.message)}</div>
      </div>
      <div class="detail-row full">
        <div class="label">상태</div>
        <select id="statusEdit" class="form-select">
          <option ${q.status === '접수완료' ? 'selected' : ''}>접수완료</option>
          <option ${q.status === '검토중' ? 'selected' : ''}>검토중</option>
          <option ${q.status === '견적발송' ? 'selected' : ''}>견적발송</option>
          <option ${q.status === '상담완료' ? 'selected' : ''}>상담완료</option>
          <option ${q.status === '계약완료' ? 'selected' : ''}>계약완료</option>
        </select>
      </div>`;
    openModal('quoteModal');
  }

  $('saveQuoteStatus').addEventListener('click', () => {
    if (!currentQuoteId) return;
    const list = load(KEYS.quotes);
    const idx = list.findIndex(q => q.id === currentQuoteId);
    if (idx >= 0) {
      list[idx].status = $('statusEdit').value;
      save(KEYS.quotes, list);
      toast('상태가 변경되었습니다.');
      closeModal('quoteModal');
      renderQuotes();
      renderStats();
    }
  });

  statusFilter.addEventListener('change', renderQuotes);

  // ---------- Utils
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function escapeAttr(s) {
    return escapeHtml(s);
  }

  // ---------- Init
  renderStats();
  renderImages();
  renderQuotes();

})();
