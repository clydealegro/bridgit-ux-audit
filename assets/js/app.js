/* ============================================================
   Bridgit UX Audit — App.js
   Vanilla JS SPA renderer. Reads window.AUDIT_DATA and
   renders all page views into #app.
   ============================================================ */

/* ------------------------------------------------------------
   Entry Point
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', init);

function init() {
  const app = document.getElementById('app');
  if (!app) return;

  const view = app.dataset.view;
  const page = app.dataset.page || '';
  const code = app.dataset.code || '';
  const base = window.REPORT_BASE || './';

  app.innerHTML = renderLayout(base, view, page, code);

  if (view === 'recommendations') initFilters();
  setActiveNavLink();
}

/* ------------------------------------------------------------
   Layout
   ------------------------------------------------------------ */
function renderLayout(base, view, page, code) {
  const sidebar = renderSidebar(base);
  let mainContent = '';

  switch (view) {
    case 'executive':
      mainContent = renderExecutiveView(base);
      break;
    case 'navigation-ia':
      mainContent = renderNavigationView(base);
      break;
    case 'page':
      mainContent = renderPageView(base, page);
      break;
    case 'solution':
      mainContent = renderSolutionView(base, page);
      break;
    case 'persona':
      mainContent = renderPersonaView(base, code);
      break;
    case 'recommendations':
      mainContent = renderRecommendationsView(base);
      break;
    case 'ab-tests':
      mainContent = renderABTestsView(base);
      break;
    default:
      mainContent = `<div class="content"><div class="empty-state">Unknown view: ${escapeHtml(view)}</div></div>`;
  }

  return `
    <div class="layout">
      ${sidebar}
      <main class="main">
        ${mainContent}
      </main>
    </div>
  `;
}

/* ------------------------------------------------------------
   Sidebar
   ------------------------------------------------------------ */
function renderSidebar(base) {
  const navSections = [
    {
      label: 'Overview',
      items: [
        { label: 'Executive Summary', href: `${base}index.html` },
        { label: 'Navigation & IA',   href: `${base}navigation.html` },
      ],
    },
    {
      label: 'Core Pages',
      items: [
        { label: 'Homepage',      href: `${base}pages/homepage.html` },
        { label: 'Bridging Loan', href: `${base}pages/bridging-loan.html` },
        { label: 'Eligibility',   href: `${base}pages/eligibility.html` },
        { label: 'Calculator',    href: `${base}pages/calculator.html` },
        { label: 'Rates & Fees',  href: `${base}pages/rates-and-fees.html` },
        { label: 'Partners',      href: `${base}pages/partners.html` },
      ],
    },
    {
      label: 'Solutions',
      items: [
        { label: 'Upsize',        href: `${base}pages/solutions/upsize.html` },
        { label: 'Downsize',      href: `${base}pages/solutions/downsize.html` },
        { label: 'Renovate',      href: `${base}pages/solutions/renovate.html` },
        { label: 'Retire',        href: `${base}pages/solutions/retire.html` },
        { label: 'Separate',      href: `${base}pages/solutions/separate.html` },
        { label: 'Invest',        href: `${base}pages/solutions/invest.html` },
        { label: 'House & Land',  href: `${base}pages/solutions/house-and-land.html` },
      ],
    },
    {
      label: 'Personas',
      items: [
        { label: 'P01 — Upsizer',    href: `${base}personas/p01-upsizer.html` },
        { label: 'P02 — Downsizer',  href: `${base}personas/p02-downsizer.html` },
        { label: 'P03 — Renovator',  href: `${base}personas/p03-renovator.html` },
        { label: 'P04 — Separating', href: `${base}personas/p04-separating.html` },
        { label: 'P05 — Builder',    href: `${base}personas/p05-house-land.html` },
        { label: 'P06 — Investor',   href: `${base}personas/p06-investor.html` },
        { label: 'P07 — Broker',     href: `${base}personas/p07-broker.html` },
        { label: 'P08 — Regional',   href: `${base}personas/p08-regional.html` },
      ],
    },
    {
      label: 'Reports',
      items: [
        { label: 'All Recommendations', href: `${base}recommendations.html` },
        { label: 'A/B Tests',           href: `${base}ab-tests.html` },
      ],
    },
  ];

  const sectionsHtml = navSections.map(section => {
    const itemsHtml = section.items.map(item =>
      `<li><a class="nav-link" href="${item.href}">${escapeHtml(item.label)}</a></li>`
    ).join('');
    return `
      <li>
        <span class="sidebar-section">${escapeHtml(section.label)}</span>
        <ul class="sidebar-nav" style="padding-bottom:0;">${itemsHtml}</ul>
      </li>
    `;
  }).join('');

  return `
    <nav class="sidebar">
      <div class="sidebar-logo">
        <span class="sidebar-logo-text">Bridgit UX Audit</span>
        <span class="sidebar-logo-subtitle">March 2026</span>
      </div>
      <ul class="sidebar-nav">
        ${sectionsHtml}
      </ul>
    </nav>
  `;
}

/* ------------------------------------------------------------
   Executive View
   ------------------------------------------------------------ */
function renderExecutiveView(base) {
  const data = window.AUDIT_DATA;
  const hs = data.healthScores;
  const ps = data.phaseStats;
  const tf = data.topFindings || [];
  const patterns = data.patterns || [];
  const pl = data.priorityLists || { tier1: [], tier2: [], tier3: [] };

  // Health score bars
  const healthItems = [
    { label: 'Overall',             score: hs.overall },
    { label: 'Desktop',             score: hs.desktop },
    { label: 'Mobile',              score: hs.mobile },
    { label: 'Trust & Regulatory',  score: hs.trust },
    { label: 'Persona Coverage',    score: hs.personas },
    { label: 'Navigation',          score: hs.navigation },
  ];

  const healthBarsHtml = healthItems.map(item => `
    <div class="health-item">
      <span class="health-label">${escapeHtml(item.label)}</span>
      <div class="health-bar-track">
        <div class="health-bar-fill ${healthBarClass(item.score)}" style="width:${(item.score / 10 * 100).toFixed(1)}%"></div>
      </div>
      <span class="health-score-value" style="color:${healthScoreColor(item.score)}">${item.score}</span>
    </div>
  `).join('');

  // Phase breakdown
  const phaseRows = ['phase2', 'phase3', 'phase4'].map((key, i) => {
    const p = ps[key] || {};
    return `
      <tr>
        <td>${escapeHtml(`Phase ${i + 2}`)}</td>
        <td><span class="badge badge--critical">${p.critical || 0}</span></td>
        <td><span class="badge badge--high">${p.high || 0}</span></td>
        <td><span class="badge badge--medium">${p.medium || 0}</span></td>
        <td><span class="badge badge--low">${p.low || 0}</span></td>
        <td>${p.total || 0}</td>
      </tr>
    `;
  }).join('');

  // Top 10 findings table
  const topFindingsRows = tf.map(tf => {
    const finding = findingById(tf.findingId);
    return `
      <tr>
        <td style="text-align:center;font-weight:700;color:var(--color-text-secondary)">${tf.rank}</td>
        <td><span class="finding-id">${escapeHtml(tf.findingId)}</span></td>
        <td style="font-size:0.75rem;color:var(--color-text-secondary)">${finding ? escapeHtml(finding.page) : ''}</td>
        <td class="finding-text">${escapeHtml(tf.description)}</td>
        <td>${tf.effort ? renderEffortBadge(tf.effort) : ''}</td>
        <td><span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:0.7rem">${escapeHtml(String(tf.impact || ''))}</span></td>
      </tr>
    `;
  }).join('');

  // Patterns grid
  const patternsHtml = patterns.map(p => renderPatternCard(p)).join('');

  return `
    <div class="content">
      <div class="page-header">
        <h1>Bridgit UX Audit — Executive Summary</h1>
        <p>March 2026 &middot; 71 findings across 3 phases</p>
      </div>

      <div class="health-score-hero">
        <div class="health-score-big">
          ${hs.overall}<span class="denominator"> / 10</span>
        </div>
        <div class="health-score-details">
          <div class="health-score-label">Conversion Health Score</div>
          <div class="health-score-description">A functioning site with significant conversion gaps across mobile, trust signals, and persona-specific paths.</div>
        </div>
      </div>

      <h2 class="section-title">Health Scores by Dimension</h2>
      <div class="card" style="margin-bottom:1.5rem;">
        <div style="display:flex;flex-direction:column;gap:0.875rem;">
          ${healthBarsHtml}
        </div>
      </div>

      <h2 class="section-title">Finding Severity Breakdown</h2>
      <div class="stat-grid" style="margin-bottom:1.5rem;">
        <div class="stat-card stat-card--critical">
          <span class="stat-number">4</span>
          <span class="stat-label">Critical</span>
        </div>
        <div class="stat-card stat-card--high">
          <span class="stat-number">32</span>
          <span class="stat-label">High</span>
        </div>
        <div class="stat-card stat-card--medium">
          <span class="stat-number">28</span>
          <span class="stat-label">Medium</span>
        </div>
        <div class="stat-card stat-card--low">
          <span class="stat-number">7</span>
          <span class="stat-label">Low</span>
        </div>
      </div>

      <h2 class="section-title">Phase Breakdown</h2>
      <div class="table-wrapper" style="margin-bottom:1.5rem;">
        <table class="phase-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Critical</th>
              <th>High</th>
              <th>Medium</th>
              <th>Low</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${phaseRows}
          </tbody>
        </table>
      </div>

      <h2 class="section-title">Top 10 Findings</h2>
      <div class="table-wrapper" style="margin-bottom:1.5rem;">
        <table class="findings-table">
          <thead>
            <tr>
              <th style="text-align:center">#</th>
              <th>ID</th>
              <th>Page</th>
              <th>Description</th>
              <th>Effort</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            ${topFindingsRows || '<tr><td colspan="6" class="empty-state">No top findings data</td></tr>'}
          </tbody>
        </table>
      </div>

      <h2 class="section-title">Priority Tier Summary</h2>
      <div class="tier-grid" style="margin-bottom:1.5rem;">
        <div class="tier-card tier-card--1">
          <div class="tier-number">${pl.tier1.length}</div>
          <div class="tier-label">Tier 1 — Quick Wins</div>
          <a class="tier-link" href="${base}recommendations.html?priority=Quick+Win">View in recommendations &rarr;</a>
        </div>
        <div class="tier-card tier-card--2">
          <div class="tier-number">${pl.tier2.length}</div>
          <div class="tier-label">Tier 2 — Medium Effort</div>
          <a class="tier-link" href="${base}recommendations.html?priority=Medium+Effort">View in recommendations &rarr;</a>
        </div>
        <div class="tier-card tier-card--3">
          <div class="tier-number">${pl.tier3.length}</div>
          <div class="tier-label">Tier 3 — Strategic</div>
          <a class="tier-link" href="${base}recommendations.html?priority=Strategic">View in recommendations &rarr;</a>
        </div>
      </div>

      <h2 class="section-title">Systemic Patterns</h2>
      <p class="section-subtitle">8 recurring UX patterns found across multiple pages and personas.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem;margin-bottom:2rem;">
        ${patternsHtml || '<div class="empty-state">No pattern data available</div>'}
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------
   Navigation & IA View
   ------------------------------------------------------------ */
function renderNavigationView(base) {
  const data = window.AUDIT_DATA;
  const findings = (data.findings || []).filter(f => f.phase === 2);
  const journeys = data.journeys || [];
  const patterns = data.patterns || [];

  // Navigation-related pattern finding IDs — those that appear in Phase 2 findings
  const phase2Ids = new Set(findings.map(f => f.id));
  const navPatterns = patterns.filter(p =>
    (p.findingIds || []).some(id => phase2Ids.has(id))
  );

  const journeyRowsHtml = journeys.map(j => {
    const stepsSnippet = (j.steps || []).slice(0, 3).map(s =>
      `<span style="font-size:0.7rem;color:var(--color-text-secondary)">${escapeHtml(s.page)}</span>`
    ).join(' &rarr; ');
    const frictionList = (j.steps || []).flatMap(s => s.frictionIds || []).slice(0, 3);
    return `
      <tr>
        <td class="finding-id">${escapeHtml(j.id)}</td>
        <td style="font-size:0.8rem;font-weight:500">${escapeHtml(j.name)}</td>
        <td>${renderPersonaBadge(j.personaCode)}</td>
        <td style="font-size:0.75rem;color:var(--color-text-secondary)">${j.overallArc ? escapeHtml(j.overallArc) : '—'}</td>
        <td style="font-size:0.75rem">${stepsSnippet || '—'}</td>
        <td>
          <div class="persona-tags">
            ${frictionList.map(id => `<span class="finding-id" style="font-size:0.7rem">${escapeHtml(id)}</span>`).join('')}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="content">
      <div class="page-header">
        <h1>Navigation &amp; IA Findings</h1>
        <p>Phase 2 &middot; ${findings.length} findings</p>
      </div>

      <h2 class="section-title">Phase 2 Findings</h2>
      ${renderFindingsTable(findings, base)}

      <h2 class="section-title">Journey Scenario Coverage (J1–J6)</h2>
      <p class="section-subtitle">End-to-end journey paths mapped for each persona scenario.</p>
      <div class="table-wrapper" style="margin-bottom:1.5rem;">
        <table class="findings-table">
          <thead>
            <tr>
              <th>Journey</th>
              <th>Name</th>
              <th>Persona</th>
              <th>Arc</th>
              <th>Key Pages</th>
              <th>Friction IDs</th>
            </tr>
          </thead>
          <tbody>
            ${journeyRowsHtml || '<tr><td colspan="6" class="empty-state">No journey data</td></tr>'}
          </tbody>
        </table>
      </div>

      <h2 class="section-title">Systemic IA Patterns</h2>
      ${navPatterns.length > 0
        ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem;">
             ${navPatterns.map(p => renderPatternCard(p)).join('')}
           </div>`
        : '<div class="empty-state">No navigation-specific patterns identified.</div>'
      }
    </div>
  `;
}

/* ------------------------------------------------------------
   Page View (Core Pages)
   ------------------------------------------------------------ */
function renderPageView(base, pageSlug) {
  const data = window.AUDIT_DATA;
  const findings = (data.findings || []).filter(f => f.pageSlug === pageSlug);
  const displayName = pageDisplayName(pageSlug, findings);

  const personaCodes = [...new Set(findings.flatMap(f => f.personas || []))];
  const severityCounts = countSeverities(findings);

  return `
    <div class="content">
      <div class="page-header">
        <h1>${escapeHtml(displayName)}</h1>
        <p>${findings.length} finding${findings.length !== 1 ? 's' : ''} on this page</p>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;align-items:center;">
        <span style="font-size:0.75rem;color:var(--color-text-secondary);font-weight:500;">Personas affected:</span>
        ${personaCodes.length > 0
          ? personaCodes.map(c => renderPersonaBadge(c)).join('')
          : '<span style="font-size:0.75rem;color:var(--color-text-secondary)">None specified</span>'
        }
      </div>

      ${renderSeverityBar(severityCounts)}

      <h2 class="section-title">Findings</h2>
      ${renderFindingsTable(findings, base)}
    </div>
  `;
}

/* ------------------------------------------------------------
   Solution View
   ------------------------------------------------------------ */
function renderSolutionView(base, solutionSlug) {
  const data = window.AUDIT_DATA;
  // The slug in pageSlug is stored as 'solutions/upsize' etc.
  const fullSlug = `solutions/${solutionSlug}`;
  const findings = (data.findings || []).filter(f => f.pageSlug === fullSlug);
  const displayName = pageDisplayName(fullSlug, findings);

  // Find primary persona(s) for this solution
  const personas = data.personas || [];
  const solutionPersonas = personas.filter(p =>
    (p.primaryPages || []).some(pg => pg === fullSlug || pg === solutionSlug)
  );

  const personaCodes = [...new Set(findings.flatMap(f => f.personas || []))];
  const severityCounts = countSeverities(findings);

  const personaCardsHtml = solutionPersonas.map(p => `
    <div class="card card--sm" style="display:flex;align-items:center;gap:0.75rem;">
      ${renderPersonaBadge(p.code)}
      <div>
        <div style="font-size:0.875rem;font-weight:600">${escapeHtml(p.name)}</div>
        <div style="font-size:0.75rem;color:var(--color-text-secondary)">${escapeHtml(p.role || '')}</div>
      </div>
      <div style="margin-left:auto">
        ${renderConversionStatus(p.conversionStatus)}
      </div>
    </div>
  `).join('');

  return `
    <div class="content">
      <div class="page-header">
        <h1>${escapeHtml(displayName)}</h1>
        <p>${findings.length} finding${findings.length !== 1 ? 's' : ''} on this solution page</p>
      </div>

      ${solutionPersonas.length > 0 ? `
        <h2 class="section-title">Primary Personas</h2>
        <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;">
          ${personaCardsHtml}
        </div>
      ` : ''}

      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:1.5rem;align-items:center;">
        <span style="font-size:0.75rem;color:var(--color-text-secondary);font-weight:500;">All personas affected:</span>
        ${personaCodes.length > 0
          ? personaCodes.map(c => renderPersonaBadge(c)).join('')
          : '<span style="font-size:0.75rem;color:var(--color-text-secondary)">None specified</span>'
        }
      </div>

      ${renderSeverityBar(severityCounts)}

      <h2 class="section-title">Findings</h2>
      ${renderFindingsTable(findings, base)}
    </div>
  `;
}

/* ------------------------------------------------------------
   Persona View
   ------------------------------------------------------------ */
function renderPersonaView(base, personaCode) {
  const data = window.AUDIT_DATA;
  const personas = data.personas || [];
  const persona = personas.find(p => p.code === personaCode);

  if (!persona) {
    return `<div class="content"><div class="empty-state">Persona ${escapeHtml(personaCode)} not found.</div></div>`;
  }

  // Findings for this persona: include 'All' tagged findings only if critical/high
  const allFindings = data.findings || [];
  const personaFindings = allFindings.filter(f => {
    if (!f.personas) return false;
    if (f.personas.includes(personaCode)) return true;
    if (f.personas.includes('All') && (f.severity === 'Critical' || f.severity === 'High')) return true;
    return false;
  });

  // Journey for this persona
  const journeys = data.journeys || [];
  const journey = journeys.find(j => j.personaCode === personaCode);

  // Coverage matrix
  const coverage = persona.coverage || {};
  const coverageDimensions = ['desktop', 'mobile', 'trust', 'cta', 'path', 'overall'];
  const coverageCells = coverageDimensions.map(dim => {
    const val = coverage[dim];
    const cls = coverageCellClass(val);
    return `<td class="${cls}">${escapeHtml(String(val || '—'))}</td>`;
  }).join('');

  // Critical gaps
  const gapsHtml = (persona.criticalGaps || []).map(g =>
    `<li>${escapeHtml(g)}</li>`
  ).join('');

  // Strengths
  const strengthsHtml = (persona.strengths || []).map(s =>
    `<li>${escapeHtml(s)}</li>`
  ).join('');

  // Quick win
  const qw = persona.quickWin;

  return `
    <div class="content">
      <div class="page-header">
        <h1>${escapeHtml(persona.name)}</h1>
        <p class="persona-header-meta">
          ${escapeHtml(persona.role || '')}
          ${persona.journey ? ` &middot; Journey: ${escapeHtml(persona.journey)}` : ''}
        </p>
      </div>

      <div style="margin-bottom:1.5rem;">
        ${renderConversionStatus(persona.conversionStatus)}
        ${persona.conversionNote ? `<p style="margin-top:0.5rem;font-size:0.8rem;color:var(--color-text-secondary)">${escapeHtml(persona.conversionNote)}</p>` : ''}
      </div>

      <div class="two-col" style="margin-bottom:1.5rem;">
        <div>
          ${gapsHtml ? `
            <div class="card card--sm" style="margin-bottom:1rem;">
              <div class="card-title" style="color:var(--color-critical)">Critical Gaps</div>
              <ul class="gap-list">${gapsHtml}</ul>
            </div>
          ` : ''}
          ${strengthsHtml ? `
            <div class="card card--sm">
              <div class="card-title" style="color:var(--color-quick-win)">Strengths</div>
              <ul class="gap-list">${strengthsHtml}</ul>
            </div>
          ` : ''}
        </div>
        <div>
          <div class="card card--sm">
            <div class="card-title">Coverage Matrix</div>
            <div class="table-wrapper" style="margin-top:0.5rem;">
              <table class="coverage-matrix">
                <thead>
                  <tr>
                    ${coverageDimensions.map(d => `<th>${escapeHtml(d.charAt(0).toUpperCase() + d.slice(1))}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  <tr>${coverageCells}</tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
        <h2 class="section-title" style="margin:0">Findings (${personaFindings.length})</h2>
        <a href="${base}recommendations.html" style="font-size:0.8rem;color:var(--color-accent)">
          View all recommendations &rarr;
        </a>
      </div>
      ${renderFindingsTable(personaFindings, base)}

      ${journey ? `
        <h2 class="section-title">Journey Emotional Arc — ${escapeHtml(journey.name)}</h2>
        <div class="card" style="margin-bottom:1.5rem;">
          ${renderJourneySteps(journey)}
        </div>
      ` : ''}

      ${qw ? `
        <h2 class="section-title">Quick Win</h2>
        <div class="quick-win-callout" style="margin-bottom:1.5rem;">
          <div class="callout-title">Quick Win Opportunity</div>
          <div class="callout-desc">${escapeHtml(qw.description || '')}</div>
          ${(qw.findingIds || []).length > 0 ? `
            <div style="margin-top:0.75rem;display:flex;flex-wrap:wrap;gap:0.25rem;">
              ${qw.findingIds.map(id => `<span class="finding-id">${escapeHtml(id)}</span>`).join('')}
            </div>
          ` : ''}
          ${qw.impact ? `<div style="margin-top:0.5rem;font-size:0.8rem;color:var(--color-quick-win);font-weight:600">${escapeHtml(qw.impact)}</div>` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

/* ------------------------------------------------------------
   Recommendations View
   ------------------------------------------------------------ */
function renderRecommendationsView(base) {
  const data = window.AUDIT_DATA;
  const findings = data.findings || [];

  // Collect unique dimensions
  const dimensions = [...new Set(findings.map(f => f.dimension).filter(Boolean))].sort();

  const severityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const effortOptions = ['All', 'Low', 'Medium', 'High'];
  const priorityOptions = ['All', 'Quick Win', 'Medium Effort', 'Strategic'];
  const personaOptions = ['All', 'P01', 'P02', 'P03', 'P04', 'P05', 'P06', 'P07', 'P08'];
  const phaseOptions = ['All', '2', '3', '4'];
  const dimensionOptions = ['All', ...dimensions];

  function optionsHtml(opts, selectId) {
    return opts.map(o => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('');
  }

  const tableRows = findings.map(f => renderFullFindingRow(f)).join('');

  return `
    <div class="content">
      <div class="page-header">
        <h1>All Recommendations</h1>
        <p>71 findings &middot; filterable</p>
      </div>

      <div class="filter-bar" id="filter-bar">
        <div class="filter-group">
          <label for="filter-severity">Severity</label>
          <select class="filter-select" id="filter-severity" data-filter="severity">
            ${optionsHtml(severityOptions)}
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-effort">Effort</label>
          <select class="filter-select" id="filter-effort" data-filter="effort">
            ${optionsHtml(effortOptions)}
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-priority">Priority</label>
          <select class="filter-select" id="filter-priority" data-filter="priority">
            ${optionsHtml(priorityOptions)}
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-persona">Persona</label>
          <select class="filter-select" id="filter-persona" data-filter="persona">
            ${optionsHtml(personaOptions)}
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-phase">Phase</label>
          <select class="filter-select" id="filter-phase" data-filter="phase">
            ${optionsHtml(phaseOptions)}
          </select>
        </div>
        <div class="filter-group">
          <label for="filter-dimension">Dimension</label>
          <select class="filter-select" id="filter-dimension" data-filter="dimension">
            ${optionsHtml(dimensionOptions)}
          </select>
        </div>
        <span class="filter-count" id="filter-count">Showing ${findings.length} of 71 findings</span>
      </div>

      <div class="table-wrapper">
        <table class="findings-table" id="findings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Phase</th>
              <th>Page</th>
              <th>Persona(s)</th>
              <th>Dimension</th>
              <th>Severity</th>
              <th>Effort</th>
              <th>Priority</th>
              <th>Finding</th>
              <th>Recommendation</th>
              <th>Impact of Change</th>
            </tr>
          </thead>
          <tbody id="findings-tbody">
            ${tableRows || '<tr><td colspan="11" class="empty-state">No findings data available.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------
   A/B Tests View
   ------------------------------------------------------------ */
function renderABTestsView(base) {
  const data = window.AUDIT_DATA;
  const tests = (data.abTests || []).slice().sort((a, b) => a.rank - b.rank);

  // Group by week label
  const weekGroups = {};
  tests.forEach(t => {
    const weekKey = String(t.week || 'Other');
    if (!weekGroups[weekKey]) weekGroups[weekKey] = [];
    weekGroups[weekKey].push(t);
  });

  // Sort week keys
  const weekOrder = ['1', '2', '2-3', '3', '4', '4-5', '5', '6', '6+', 'Other'];
  const sortedWeekKeys = Object.keys(weekGroups).sort((a, b) => {
    const ai = weekOrder.indexOf(a);
    const bi = weekOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const weekGroupsHtml = sortedWeekKeys.map(weekKey => {
    const groupTests = weekGroups[weekKey];
    const cardsHtml = groupTests.map(t => {
      const finding = findingById(t.findingId);
      return `
        <div class="ab-card">
          <div class="ab-card-week">Week ${escapeHtml(String(weekKey))}</div>
          <div class="ab-card-rank">Test #${t.rank} &middot; <span class="finding-id">${escapeHtml(t.findingId || '')}</span></div>
          <div class="ab-page">${escapeHtml(t.page || (finding ? finding.page : ''))}</div>
          <div class="card-title" style="margin-bottom:0.5rem;">${escapeHtml(t.hypothesis || '')}</div>
          <div class="ab-metric">
            <strong>Primary metric:</strong> ${escapeHtml(t.primaryMetric || '')}
          </div>
          <div style="margin-top:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;">
            ${renderEffortBadge(t.effort || '')}
            ${renderPriorityBadge(t.priority || '')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="week-group">
        <div class="week-group-title">Week ${escapeHtml(String(weekKey))}</div>
        <div class="week-group-cards">
          ${cardsHtml}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="content">
      <div class="page-header">
        <h1>A/B Test Priority Queue</h1>
        <p>10 tests &middot; sequenced across 6 weeks</p>
      </div>

      <div class="callout-box">
        Tests ordered by expected impact &times; implementation ease. Weeks 1–3 are copy/link changes; no new form logic required.
      </div>

      ${weekGroupsHtml || '<div class="empty-state">No A/B test data available.</div>'}
    </div>
  `;
}

/* ------------------------------------------------------------
   Component Helpers
   ------------------------------------------------------------ */

function renderSeverityBadge(severity) {
  if (!severity) return '';
  const cls = severity.toLowerCase();
  return `<span class="badge badge--${cls}">${escapeHtml(severity)}</span>`;
}

function renderEffortBadge(effort) {
  if (!effort) return '';
  const cls = effort.toLowerCase();
  return `<span class="badge badge--effort-${cls}">${escapeHtml(effort)}</span>`;
}

function renderPriorityBadge(priority) {
  if (!priority) return '';
  const slugMap = {
    'Quick Win': 'quick-win',
    'Medium Effort': 'medium-effort',
    'Strategic': 'strategic',
  };
  const slug = slugMap[priority] || priority.toLowerCase().replace(/\s+/g, '-');
  return `<span class="badge badge--${slug}">${escapeHtml(priority)}</span>`;
}

function renderPersonaBadge(code) {
  if (!code) return '';
  return `<span class="badge badge--persona">${escapeHtml(code)}</span>`;
}

function renderEmotionDots(score) {
  const s = Number(score) || 0;
  let html = '<div class="emotion-dots">';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= s;
    html += `<div class="emotion-dot ${filled ? 'emotion-dot--filled' : 'emotion-dot--empty'}" title="${i}/${5}"></div>`;
  }
  html += '</div>';
  return html;
}

function renderConversionStatus(status) {
  if (!status) return '';
  const cls = status.toLowerCase();
  const icons = { blocked: '✕', partial: '~', clear: '✓' };
  const icon = icons[cls] || '';
  return `<span class="conversion-status conversion-status--${cls}">${icon} ${escapeHtml(status)}</span>`;
}

function renderFindingRow(finding) {
  const personas = finding.personas || [];
  const personaTags = personas.map(p => renderPersonaBadge(p)).join('');
  return `
    <tr>
      <td><span class="finding-id">${escapeHtml(finding.id || '')}</span></td>
      <td>${escapeHtml(String(finding.page || ''))}</td>
      <td><div class="persona-tags">${personaTags}</div></td>
      <td>${renderSeverityBadge(finding.severity)}</td>
      <td>${renderEffortBadge(finding.effort)}</td>
      <td>${renderPriorityBadge(finding.priority)}</td>
      <td class="finding-text">${escapeHtml(finding.finding || '')}</td>
    </tr>
  `;
}

function renderFullFindingRow(finding) {
  const personas = finding.personas || [];
  const personaTags = personas.map(p => renderPersonaBadge(p)).join('');
  return `
    <tr
      data-severity="${escapeHtml(finding.severity || '')}"
      data-effort="${escapeHtml(finding.effort || '')}"
      data-priority="${escapeHtml(finding.priority || '')}"
      data-personas="${escapeHtml((finding.personas || []).join(','))}"
      data-phase="${escapeHtml(String(finding.phase || ''))}"
      data-dimension="${escapeHtml(finding.dimension || '')}"
    >
      <td><span class="finding-id">${escapeHtml(finding.id || '')}</span></td>
      <td><span class="badge badge--phase-${finding.phase || 2}">${escapeHtml(String(finding.phase ? `Phase ${finding.phase}` : ''))}</span></td>
      <td style="white-space:nowrap;font-size:0.75rem">${escapeHtml(finding.page || '')}</td>
      <td><div class="persona-tags">${personaTags}</div></td>
      <td style="font-size:0.75rem;color:var(--color-text-secondary)">${escapeHtml(finding.dimension || '')}</td>
      <td>${renderSeverityBadge(finding.severity)}</td>
      <td>${renderEffortBadge(finding.effort)}</td>
      <td>${renderPriorityBadge(finding.priority)}</td>
      <td class="finding-text">${escapeHtml(finding.finding || '')}</td>
      <td class="finding-recommendation">${escapeHtml(finding.recommendation || '')}</td>
      <td class="finding-impact">${escapeHtml(finding.impactOfChange || '')}</td>
    </tr>
  `;
}

function renderHealthBar(score) {
  const pct = ((Number(score) || 0) / 10 * 100).toFixed(1);
  const cls = healthBarClass(score);
  const color = healthScoreColor(score);
  return `
    <div class="health-bar-track">
      <div class="health-bar-fill ${cls}" style="width:${pct}%"></div>
    </div>
    <span class="health-score-value" style="color:${color}">${score}</span>
  `;
}

function renderFindingsTable(findings, base) {
  if (!findings || findings.length === 0) {
    return '<div class="empty-state">No findings for this view.</div>';
  }
  const rows = findings.map(f => renderFindingRow(f)).join('');
  return `
    <div class="table-wrapper" style="margin-bottom:1.5rem;">
      <table class="findings-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Page</th>
            <th>Persona(s)</th>
            <th>Severity</th>
            <th>Effort</th>
            <th>Priority</th>
            <th>Finding</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderJourneySteps(journey) {
  const steps = journey.steps || [];
  if (steps.length === 0) return '<div class="empty-state">No journey steps.</div>';

  const headerHtml = `
    <div class="journey-step-header">
      <span>Page</span>
      <span>Mood</span>
      <span>Friction</span>
      <span>Fix</span>
    </div>
  `;

  const stepsHtml = steps.map(step => {
    const frictionHtml = (step.frictionIds || []).length > 0
      ? step.frictionIds.map(id => `<span class="finding-id" style="font-size:0.7rem">${escapeHtml(id)}</span>`).join(' ')
      : '<span style="color:#cbd5e1">—</span>';

    return `
      <div class="journey-step">
        <div class="journey-page-name">${escapeHtml(step.page || '')}</div>
        <div class="journey-emotion">${renderEmotionDots(step.emotionalState)}</div>
        <div class="journey-friction">${frictionHtml}</div>
        <div class="journey-fix">${escapeHtml(step.fix || '')}</div>
      </div>
    `;
  }).join('');

  return `
    <div>
      ${headerHtml}
      <div class="journey-steps">${stepsHtml}</div>
    </div>
  `;
}

function renderPatternCard(p) {
  const personaTags = (p.personas || []).map(code => renderPersonaBadge(code)).join('');
  const findingIdTags = (p.findingIds || []).map(id =>
    `<span class="pattern-finding-id">${escapeHtml(id)}</span>`
  ).join('');

  return `
    <div class="pattern-card">
      <div class="pattern-card-title">${escapeHtml(p.title || '')}</div>
      ${personaTags ? `<div class="pattern-personas">${personaTags}</div>` : ''}
      ${findingIdTags ? `<div class="pattern-finding-ids">${findingIdTags}</div>` : ''}
      ${p.fix ? `<div class="pattern-fix"><strong>Fix:</strong> ${escapeHtml(p.fix)}</div>` : ''}
      ${p.impact ? `<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--color-strategic);font-weight:600">${escapeHtml(p.impact)}</div>` : ''}
    </div>
  `;
}

function renderSeverityBar(counts) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return '';
  return `
    <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1.5rem;align-items:center;">
      <span style="font-size:0.75rem;color:var(--color-text-secondary);font-weight:500;">Severity breakdown:</span>
      ${counts.Critical > 0 ? `<span class="badge badge--critical">Critical: ${counts.Critical}</span>` : ''}
      ${counts.High > 0 ? `<span class="badge badge--high">High: ${counts.High}</span>` : ''}
      ${counts.Medium > 0 ? `<span class="badge badge--medium">Medium: ${counts.Medium}</span>` : ''}
      ${counts.Low > 0 ? `<span class="badge badge--low">Low: ${counts.Low}</span>` : ''}
    </div>
  `;
}

/* ------------------------------------------------------------
   Filter Logic
   ------------------------------------------------------------ */
function initFilters() {
  const selects = document.querySelectorAll('.filter-select');
  selects.forEach(select => {
    select.addEventListener('change', applyFilters);
  });
}

function applyFilters() {
  const severity = document.getElementById('filter-severity')?.value || 'All';
  const effort = document.getElementById('filter-effort')?.value || 'All';
  const priority = document.getElementById('filter-priority')?.value || 'All';
  const persona = document.getElementById('filter-persona')?.value || 'All';
  const phase = document.getElementById('filter-phase')?.value || 'All';
  const dimension = document.getElementById('filter-dimension')?.value || 'All';

  const tbody = document.getElementById('findings-tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  let visibleCount = 0;

  rows.forEach(row => {
    const rowSeverity = row.dataset.severity || '';
    const rowEffort = row.dataset.effort || '';
    const rowPriority = row.dataset.priority || '';
    const rowPersonas = (row.dataset.personas || '').split(',');
    const rowPhase = row.dataset.phase || '';
    const rowDimension = row.dataset.dimension || '';

    let show = true;

    if (severity !== 'All' && rowSeverity !== severity) show = false;
    if (effort !== 'All' && rowEffort !== effort) show = false;
    if (priority !== 'All' && rowPriority !== priority) show = false;
    if (phase !== 'All' && rowPhase !== phase) show = false;
    if (dimension !== 'All' && rowDimension !== dimension) show = false;

    if (persona !== 'All') {
      const matches = rowPersonas.includes(persona) || rowPersonas.includes('All');
      if (!matches) show = false;
    }

    row.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  const countEl = document.getElementById('filter-count');
  if (countEl) {
    const total = (window.AUDIT_DATA?.findings || []).length;
    countEl.textContent = `Showing ${visibleCount} of ${total} findings`;
  }
}

/* ------------------------------------------------------------
   Active Nav Link
   ------------------------------------------------------------ */
function setActiveNavLink() {
  const currentHref = window.location.href;
  const currentPath = window.location.pathname;

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('nav-link--active');
    const linkHref = link.getAttribute('href');
    if (!linkHref) return;

    // Resolve the link href against current location for comparison
    try {
      const resolved = new URL(linkHref, currentHref).pathname;
      // Normalize trailing slashes and index.html
      const normResolved = normalizePathForNav(resolved);
      const normCurrent = normalizePathForNav(currentPath);
      if (normResolved === normCurrent) {
        link.classList.add('nav-link--active');
      }
    } catch (e) {
      // Fallback: simple string match
      if (currentHref.includes(linkHref)) {
        link.classList.add('nav-link--active');
      }
    }
  });
}

function normalizePathForNav(p) {
  // Remove trailing slash
  let normalized = p.replace(/\/$/, '');
  // Treat /index.html as /
  normalized = normalized.replace(/\/index\.html$/, '');
  return normalized || '/';
}

/* ------------------------------------------------------------
   Utility Functions
   ------------------------------------------------------------ */

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function findingById(id) {
  const findings = (window.AUDIT_DATA?.findings) || [];
  return findings.find(f => f.id === id) || null;
}

function pageDisplayName(slug, findings) {
  // Try to derive from finding page field
  if (findings && findings.length > 0 && findings[0].page) {
    return findings[0].page;
  }
  // Fallback: humanise the slug
  const parts = slug.split('/');
  const last = parts[parts.length - 1];
  return last
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function countSeverities(findings) {
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  (findings || []).forEach(f => {
    if (counts[f.severity] !== undefined) counts[f.severity]++;
  });
  return counts;
}

function healthBarClass(score) {
  const s = Number(score);
  if (s >= 7) return 'health-bar-fill--good';
  if (s >= 5) return 'health-bar-fill--warning';
  return 'health-bar-fill--poor';
}

function healthScoreColor(score) {
  const s = Number(score);
  if (s >= 7) return 'var(--color-accent)';
  if (s >= 5) return 'var(--color-medium)';
  return 'var(--color-critical)';
}

function coverageCellClass(val) {
  if (!val || val === 'Gap' || val === 'None' || Number(val) < 3) return 'coverage-cell--gap';
  if (val === 'Partial' || (Number(val) >= 3 && Number(val) < 7)) return 'coverage-cell--partial';
  return 'coverage-cell--good';
}
