/* =========================================
   BRIDGIT UX AUDIT — INTERACTIVE JS
   Covers: findings filter, tab switching,
   finding card expand/collapse, mobile nav
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Mobile sidebar toggle (supports both #menuBtn and legacy #sidebarToggle) ---- */
  const menuBtn   = document.getElementById('menuBtn') || document.getElementById('sidebarToggle');
  const sidebar   = document.getElementById('sidebar') || document.querySelector('.sidebar');
  const overlay   = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');

  function openSidebar() {
    sidebar  && sidebar.classList.add('is-open');
    overlay  && overlay.classList.add('is-visible');
    menuBtn  && menuBtn.classList.add('is-open');
  }
  function closeSidebar() {
    sidebar  && sidebar.classList.remove('is-open');
    overlay  && overlay.classList.remove('is-visible');
    menuBtn  && menuBtn.classList.remove('is-open');
  }
  menuBtn  && menuBtn.addEventListener('click', () =>
    sidebar && sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar()
  );
  overlay  && overlay.addEventListener('click', closeSidebar);

  /* ---- Accordion triggers ---- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      const content = trigger.nextElementSibling;
      if (content && content.classList.contains('accordion-content')) {
        content.style.display = expanded ? 'none' : '';
      }
    });
    // Initialise closed
    const content = trigger.nextElementSibling;
    if (content && content.classList.contains('accordion-content')) {
      content.style.display = trigger.getAttribute('aria-expanded') === 'true' ? '' : 'none';
    }
  });

  /* ---- Finding card expand/collapse (supports both old .expanded and new always-visible) ---- */
  document.querySelectorAll('.finding-card-header').forEach(header => {
    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      const body = header.closest('.finding-card').querySelector('.finding-body');
      if (body) {
        body.classList.toggle('expanded');
        const icon = header.querySelector('.expand-icon');
        if (icon) icon.textContent = body.classList.contains('expanded') ? '▲' : '▼';
      }
    });
  });

  /* ---- Tabs (.tab-bar/.tab-link and legacy .tabs/.tab-btn) ---- */
  function initTabGroup(bar, btnSelector) {
    bar.querySelectorAll(btnSelector).forEach(btn => {
      btn.addEventListener('click', () => {
        const section = bar.closest('[data-tabs]') || bar.parentElement;
        const target  = btn.dataset.tab;
        bar.querySelectorAll(btnSelector).forEach(b => b.classList.remove('active'));
        section.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = section.querySelector(`[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  }
  document.querySelectorAll('.tab-bar').forEach(bar => initTabGroup(bar, '.tab-link[data-tab]'));
  document.querySelectorAll('.tabs').forEach(bar => initTabGroup(bar, '.tab-btn[data-tab]'));

  /* ---- Recommendations filterable DB ---- */
  initFilters();

});

function initFilters() {
  const container = document.getElementById('findingsContainer');
  if (!container) return;

  const searchInput  = document.getElementById('filterSearch');
  const severitySelect = document.getElementById('filterSeverity');
  const effortSelect = document.getElementById('filterEffort');
  const prioritySelect = document.getElementById('filterPriority');
  const personaSelect = document.getElementById('filterPersona');
  const pageSelect   = document.getElementById('filterPage');
  const phaseSelect  = document.getElementById('filterPhase');
  const countEl     = document.getElementById('filterCount');
  const resetBtn    = document.getElementById('filterReset');

  const cards = Array.from(container.querySelectorAll('.finding-card'));
  const total = cards.length;

  function applyFilters() {
    const search   = (searchInput  && searchInput.value.toLowerCase()) || '';
    const severity = (severitySelect && severitySelect.value) || '';
    const effort   = (effortSelect && effortSelect.value) || '';
    const priority = (prioritySelect && prioritySelect.value) || '';
    const persona  = (personaSelect && personaSelect.value) || '';
    const page     = (pageSelect && pageSelect.value) || '';
    const phase    = (phaseSelect && phaseSelect.value) || '';

    let visible = 0;
    cards.forEach(card => {
      const ds = card.dataset;
      const text = card.textContent.toLowerCase();

      const matchSearch   = !search   || text.includes(search);
      const matchSeverity = !severity || ds.severity === severity;
      const matchEffort   = !effort   || ds.effort === effort;
      const matchPriority = !priority || ds.priority === priority;
      const matchPersona  = !persona  || (ds.personas && ds.personas.includes(persona));
      const matchPage     = !page     || ds.page === page;
      const matchPhase    = !phase    || ds.phase === phase;

      const show = matchSearch && matchSeverity && matchEffort && matchPriority && matchPersona && matchPage && matchPhase;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (countEl) {
      countEl.textContent = visible === total
        ? `${total} findings`
        : `${visible} of ${total} findings`;
    }

    // Show empty state if nothing visible
    let emptyState = container.querySelector('.filter-empty-state');
    if (visible === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'empty-state filter-empty-state';
        emptyState.innerHTML = '<div class="empty-state-icon">🔍</div><div class="empty-state-title">No findings match these filters</div><p>Try adjusting your filters or clearing them.</p>';
        container.appendChild(emptyState);
      }
      emptyState.style.display = '';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }
  }

  [searchInput, severitySelect, effortSelect, prioritySelect, personaSelect, pageSelect, phaseSelect]
    .filter(Boolean)
    .forEach(el => el.addEventListener('input', applyFilters));

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      [severitySelect, effortSelect, prioritySelect, personaSelect, pageSelect, phaseSelect]
        .filter(Boolean)
        .forEach(el => el.value = '');
      applyFilters();
    });
  }

  // Initial count
  if (countEl) countEl.textContent = `${total} findings`;
}

/* ---- Shared navigation active state ---- */
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    // Resolve relative to current page location
    const resolved = new URL(href, window.location.href).pathname;
    if (resolved === path || (path.endsWith('/') && resolved === path + 'index.html')) {
      link.classList.add('active');
    }
  });
}
setActiveNav();
