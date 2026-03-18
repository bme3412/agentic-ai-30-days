import { inject } from '@vercel/analytics';
import type { Route, RouteParams, Day, JournalEntry, Learn, Lesson } from './types';

// Import render functions from modules
import {
  renderStats as renderStatsModule,
  renderDemos as renderDemosModule,
  renderBlogArchive as renderBlogArchiveModule,
  renderBlogPost as renderBlogPostModule,
  renderBlogEditor as renderBlogEditorModule,
  renderJournal as renderJournalModule,
} from './render';

// Import utilities from modules
import {
  escapeHtml,
  formatDate,
  highlightSyntax,
  highlightAgentTrace,
  renderMarkdown,
  renderMarkdownFull,
  renderMermaidDiagrams,
  renderDiagram,
  initCopyCode,
  initModalEvents,
  showModal,
  closeModal,
  setupScrollSpy,
} from './utils';

// Initialize Vercel Analytics
inject();
import {
  PHASES,
  DAYS,
  getEntry,
  saveEntry,
  getAllEntries,
  getCompletedDays,
  getInProgressDays,
  getMicroPost,
  getAllBlogPosts,
  getBlogPost,
  getAllBlogTags,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getStreak,
  getAchievements,
  getActivityLog,
  isStreakAtRisk,
  isResourceCompleted,
  isLocalResourceCompleted,
  toggleResourceCompletion,
  toggleLocalResourceCompletion,
  isSectionItemCompleted,
  toggleSectionItem,
  getSectionProgressCounts,
  getSectionProgressForDay,
  getCompletedResourcesForDay,
  getLocalResourcesForDay,
  getLocalResource,
  fetchLocalResource,
  isDemoCompleted,
  markDemoCompleted,
  getDayCompletion,
  checkDayCompletionRequirements,
  markDayComplete,
  isReadingComplete,
  toggleReadingComplete,
  generateAutoLogEntry,
  getReadingCompletion,
  clearDayProgress,
  getCompletedReadingsCount,
  getCompletedReadingDays,
} from './data';

// ── Router ─────────────────────────────────────────
let currentRoute: Route = "home";
let routeParams: RouteParams = {};

function navigate(route: Route, params: RouteParams = {}): void {
  currentRoute = route;
  routeParams = params;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.querySelectorAll<HTMLAnchorElement>(".nav-links a").forEach(a => {
    const r = a.dataset.route as Route | undefined;
    // Handle blog sub-routes
    const isBlogRoute = route.startsWith("blog");
    a.classList.toggle("active",
      r === route ||
      (route === "day" && r === "journal") ||
      (isBlogRoute && r === "blog")
    );
  });
}

document.querySelectorAll<HTMLElement>("[data-route]").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    navigate(el.dataset.route as Route);
  });
});

// ── Render Dispatcher ──────────────────────────────
function render(): void {
  const app = document.getElementById("app");
  if (!app) return;

  switch (currentRoute) {
    case "home":      app.innerHTML = renderHome();        break;
    case "journal":   app.innerHTML = renderJournalModule(routeParams); break;
    case "day":       app.innerHTML = renderDayPage();     break;
    case "stats":     app.innerHTML = renderStatsModule(); break;
    case "demos":     app.innerHTML = renderDemosModule(); break;
    case "blog":      app.innerHTML = renderBlogArchiveModule(routeParams); break;
    case "blog-post": app.innerHTML = renderBlogPostModule(routeParams, renderNotFound); break;
    case "blog-new":  app.innerHTML = renderBlogEditorModule(currentRoute, routeParams); break;
    case "blog-edit": app.innerHTML = renderBlogEditorModule(currentRoute, routeParams); break;
    case "resource":  renderResourceViewer();              return; // async, handles its own render
    default:          app.innerHTML = renderHome();
  }
  bindEvents();
}

// ── Home / Roadmap ─────────────────────────────────
function renderHome(): string {
  const completed = getCompletedReadingDays();
  const inProgress = getInProgressDays();

  let html = `
    <section class="hero anim-fade-up" style="--i:0">
      <div class="hero-eyebrow">Learning Challenge</div>
      <h1>Thirty days of<br><em>Agentic AI</em></h1>
      <p class="hero-desc">From design patterns to production deployment — building a verifiable portfolio of AI agent engineering, one day at a time.</p>
      <div class="progress-strip">
        <div class="progress-dots">
          ${Array.from({ length: 30 }, (_, i) => {
            const dayNum = i + 1;
            const cls = completed.has(dayNum) ? "done" : inProgress.has(dayNum) ? "active" : "";
            return `<div class="progress-dot ${cls}"></div>`;
          }).join("")}
        </div>
        <div class="progress-fraction">${completed.size}<span>/30</span></div>
      </div>
    </section>
  `;

  let cardIndex = 0;
  PHASES.forEach((phase, pi) => {
    const phaseDays = DAYS.filter(d => d.phase === phase.id);
    html += `
      <section class="phase anim-fade-up" style="--i:${pi + 2}">
        <div class="phase-header">
          <span class="phase-num ${phase.badge}">Phase ${phase.id}</span>
          <h2>${phase.title}</h2>
        </div>
        <p class="phase-subtitle">${phase.subtitle}</p>
        <div class="days-grid">
          ${phaseDays.map((d) => {
            cardIndex++;
            return renderDayCard(d, completed, inProgress, cardIndex);
          }).join("")}
        </div>
      </section>
    `;
  });

  return html;
}

// Track which days are expanded inline
const expandedDays = new Set<number>();
const learnExpandedDays = new Set<number>();

function renderDayCard(d: Day, completed: Set<number>, inProgress: Set<number>, idx: number): string {
  const isCompleted = completed.has(d.day);
  const status = isCompleted ? "completed" : inProgress.has(d.day) ? "in-progress" : "pending";
  const statusLabel = isCompleted ? "published" : status === "in-progress" ? "active" : "pending";
  const isExpanded = expandedDays.has(d.day);
  const isLearnExpanded = learnExpandedDays.has(d.day);
  const hasLearnContent = d.learn || d.lesson;
  const cardClass = `day-card phase-${d.phase}${isCompleted ? " completed" : ""}${isExpanded ? " expanded" : ""}`;
  const hasDemo = d.demoUrl ? " has-demo" : "";
  const action = "go-to-day";

  // Check for micro-post and linked blog posts
  const microPost = getMicroPost(d.day);
  const linkedBlogPosts = getAllBlogPosts({ linkedDay: d.day, status: "published" });
  const hasBlogPost = linkedBlogPosts.length > 0;

  let html = `
    <div class="${cardClass}${hasDemo} anim-scale-in" style="--i:${idx}" data-action="${action}" data-day="${d.day}">
      <!-- Icon buttons row -->
      <div class="day-card-icons">
        ${microPost ? `
          <span class="micro-post-badge" title="Has quick update">&#128172;</span>
        ` : ''}
        ${hasBlogPost ? `
          <span class="blog-post-badge" title="Has blog post">&#128240;</span>
        ` : ''}
        <button class="learn-icon-btn${isLearnExpanded ? ' active' : ''}${!hasLearnContent ? ' coming-soon' : ''}"
                data-action="toggle-learn"
                data-day="${d.day}"
                title="${hasLearnContent ? 'Learn more about this topic' : 'Educational content coming soon'}">
          <span class="learn-icon">${hasLearnContent ? '&#128218;' : '&#128679;'}</span>
        </button>
      </div>

      <div class="day-card-top">
        <span class="day-number">Day ${String(d.day).padStart(2, "0")}</span>
        <span class="day-status ${status}">${statusLabel}</span>
      </div>
      <h3>${d.title}</h3>
      <span class="partner">${d.partner}</span>
      ${d.concept ? `<p class="day-concept">${d.concept}</p>` : ""}
      ${microPost ? `
        <div class="micro-post-preview">
          <span class="micro-quote">"</span>${escapeHtml(microPost.content.substring(0, 100))}${microPost.content.length > 100 ? '...' : ''}<span class="micro-quote">"</span>
        </div>
      ` : ''}
      <div class="day-card-tags">
        ${d.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
      ${d.demoUrl ? `<div class="demo-badge">Demo Available</div>` : ""}
      <div class="view-day-indicator"><span class="view-icon">&#8594;</span> View Day</div>
    </div>
  `;

  // Learn expansion panel (BEFORE journal expansion)
  if (isLearnExpanded) {
    html += renderLearnContent(d);
  }

  // Journal expansion panel (for completed days)
  if (isCompleted && isExpanded) {
    html += renderInlineContent(d);
  }

  return html;
}

function renderInlineContent(d: Day): string {
  const entry = getEntry(d.day) || {} as JournalEntry;
  const lessons = entry.lessons ? entry.lessons.split("\n").filter(Boolean) : [];
  const takeaways = entry.keyTakeaways ? entry.keyTakeaways.split("\n").filter(Boolean) : [];

  return `
    <div class="inline-content phase-${d.phase}" data-day="${d.day}">
      <div class="inline-content-inner">
        ${d.demoUrl ? `
          <div class="demo-launch-section inline">
            <a href="${d.demoUrl}" target="_blank" class="btn btn-demo">
              <span class="demo-icon">&#9654;</span> Launch Interactive Demo
            </a>
          </div>
        ` : ""}

        ${d.lesson ? renderLessonContent(d.lesson) : ""}

        ${entry.body ? `
          <div class="inline-journal">
            <div class="inline-journal-header">
              <h4>My Journal Entry</h4>
              <span class="journal-date">${formatDate(entry.updatedAt)}</span>
            </div>
            <p class="journal-body">${escapeHtml(entry.body)}</p>

            ${takeaways.length ? `
              <div class="journal-takeaways">
                <h5>Key Takeaways</h5>
                <ul>
                  ${takeaways.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
                </ul>
              </div>
            ` : ""}

            ${lessons.length ? `
              <div class="journal-lessons-inline">
                <h5>Lessons Learned</h5>
                <div class="lessons-chips">
                  ${lessons.map(l => `<span class="lesson-chip">${escapeHtml(l.trim())}</span>`).join("")}
                </div>
              </div>
            ` : ""}
          </div>
        ` : ""}

      </div>
    </div>
  `;
}

// ── Reading Checkbox with Completion Info ───────────
function renderReadingCheckbox(dayNum: number): string {
  const completion = getReadingCompletion(dayNum);
  const isComplete = completion?.completed === true;

  let labelText = 'Mark as read';
  let completionInfo = '';
  let clearButton = '';

  if (isComplete && completion?.completedAt) {
    const date = new Date(completion.completedAt);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    labelText = 'Completed';
    completionInfo = `<span class="completion-date">${dateStr}</span>`;
    clearButton = `<button class="clear-day-btn" data-action="clear-day" data-day="${dayNum}" title="Clear progress">&times;</button>`;
  }

  return `
    <div class="reading-complete-row">
      <label class="reading-complete-label ${isComplete ? 'checked' : ''}">
        <input type="checkbox"
               data-action="toggle-reading"
               data-day="${dayNum}"
               ${isComplete ? 'checked' : ''}>
        <span class="checkmark"></span>
        <span class="label-text">${labelText}</span>
        ${completionInfo}
      </label>
      ${clearButton}
    </div>
  `;
}

// ── Day Page (Full Page View) ───────────────────────
function renderDayPage(): string {
  const dayNum = routeParams.day;
  if (!dayNum) {
    return renderNotFound("Day not found");
  }

  const dayData = DAYS.find(d => d.day === dayNum);

  if (!dayData) {
    return renderNotFound("Day not found");
  }

  const phase = PHASES.find(p => p.id === dayData.phase);
  const hasLearnContent = dayData.learn || dayData.lesson;
  const learn = hasLearnContent ? (dayData.learn || convertLessonToLearn(dayData.lesson)) : null;

  // Find prev/next days
  const prevDay = dayNum > 1 ? DAYS.find(d => d.day === dayNum - 1) : null;
  const nextDay = dayNum < 30 ? DAYS.find(d => d.day === dayNum + 1) : null;

  const html = `
    <div class="day-page-simple phase-${dayData.phase}">
      <!-- Breadcrumbs -->
      <nav class="breadcrumbs">
        <a href="#" data-action="go-home">Home</a>
        <span class="breadcrumb-sep">/</span>
        <a href="#" data-action="go-home">Phase ${dayData.phase}</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Day ${dayNum}</span>
      </nav>

      <!-- Compact Header -->
      <header class="day-header-simple">
        <nav class="day-nav-simple">
          <div class="day-nav-arrows">
            ${prevDay ? `<a href="#" class="nav-arrow-btn" data-action="go-to-day" data-day="${prevDay.day}" title="Day ${prevDay.day}">&#8592;</a>` : '<span class="nav-arrow-btn disabled">&#8592;</span>'}
            <span class="day-indicator">Day ${dayNum} of 30</span>
            ${nextDay ? `<a href="#" class="nav-arrow-btn" data-action="go-to-day" data-day="${nextDay.day}" title="Day ${nextDay.day}">&#8594;</a>` : '<span class="nav-arrow-btn disabled">&#8594;</span>'}
          </div>
        </nav>
        <div class="day-title-simple">
          <span class="phase-tag ${phase?.badge || ''}">Phase ${dayData.phase}</span>
          <h1>${dayData.title}</h1>
        </div>
      </header>

      <!-- Action Bar: Demo & Code Tabs -->
      ${(dayData.demoUrl || (learn?.codeExamples?.length)) ? `
        <div class="day-action-bar">
          <div class="action-tabs">
            ${dayData.demoUrl ? `
              <button class="action-tab active" data-action="switch-action-tab" data-tab="demo">
                <span class="action-tab-icon">&#9654;</span>
                <span>Interactive Demo</span>
              </button>
            ` : ''}
            ${learn?.codeExamples?.length ? `
              <button class="action-tab ${!dayData.demoUrl ? 'active' : ''}" data-action="switch-action-tab" data-tab="code">
                <span class="action-tab-icon">&#128187;</span>
                <span>Code Examples</span>
                <span class="action-tab-count">${learn.codeExamples.length}</span>
              </button>
            ` : ''}
          </div>

          <div class="action-panels">
            ${dayData.demoUrl ? `
              <div class="action-panel active" data-panel="demo">
                <div class="demo-hero">
                  <div class="demo-hero-content">
                    <div class="demo-hero-badge">Interactive Demo for Day ${dayData.day}</div>
                    <h3>${dayData.title}</h3>
                    <p>${dayData.demoDescription || 'Experiment with the concepts from this lesson in a live, interactive environment.'}</p>
                    <a href="${dayData.demoUrl}" target="_blank" class="demo-hero-btn">
                      <span class="demo-play-icon">&#9654;</span>
                      Launch Demo
                      <span class="demo-external-icon">&#8599;</span>
                    </a>
                  </div>
                  <div class="demo-hero-visual">
                    <div class="demo-visual-circles">
                      <div class="demo-circle demo-circle-1"></div>
                      <div class="demo-circle demo-circle-2"></div>
                      <div class="demo-circle demo-circle-3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            ${learn?.codeExamples?.length ? `
              <div class="action-panel ${!dayData.demoUrl ? 'active' : ''}" data-panel="code">
                <div class="code-panel-header">
                  <span>Reference implementations for this lesson. Each example builds on the concepts above.</span>
                </div>
                <div class="code-panel-examples">
                  ${learn.codeExamples.map((ex, idx) => `
                    <div class="code-panel-example ${idx === 0 ? 'expanded' : ''}">
                      <button class="code-panel-toggle" data-action="toggle-code-panel" data-index="${idx}">
                        <span class="toggle-icon">${idx === 0 ? '&#9660;' : '&#9654;'}</span>
                        <span class="code-panel-title">${ex.title || 'Example'}</span>
                        <span class="code-lang-badge">${ex.language || 'python'}</span>
                      </button>
                      <div class="code-panel-content" style="${idx === 0 ? '' : 'display: none;'}">
                        ${ex.explanation ? `<p class="code-panel-explanation">${ex.explanation}</p>` : ''}
                        <pre class="code-pre"><code>${highlightSyntax(ex.code, ex.language || 'python')}</code></pre>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Layout with optional TOC sidebar -->
      <div class="day-layout-wrapper">
        ${hasLearnContent && learn ? renderSectionNav(learn, dayData) : ''}

        <!-- Main Content -->
        <main class="day-content-simple">
          ${hasLearnContent && learn ? renderLearnContentSimple(learn, dayData) : `
            <div class="coming-soon-simple">
              <h3>Content Coming Soon</h3>
              <p>Educational materials for "${dayData.title}" are being prepared.</p>
            </div>
          `}

          <!-- Reading Complete Checkbox -->
          ${renderReadingCheckbox(dayNum)}
        </main>
      </div>

      <!-- Simple Bottom Navigation -->
      <nav class="day-footer-nav">
        ${prevDay ? `
          <a href="#" class="footer-nav-link" data-action="go-to-day" data-day="${prevDay.day}">
            <span>&#8592;</span> Day ${prevDay.day}
          </a>
        ` : '<span></span>'}
        <a href="#" class="footer-nav-home" data-action="go-home">All Days</a>
        ${nextDay ? `
          <a href="#" class="footer-nav-link" data-action="go-to-day" data-day="${nextDay.day}">
            Day ${nextDay.day} <span>&#8594;</span>
          </a>
        ` : '<span></span>'}
      </nav>
    </div>
  `;

  return html;
}

// ── Section Navigation (TOC Sidebar) ─────────────────
function renderSectionNav(learn: Learn, d: Day): string {
  const sections: { id: string; label: string; icon: string }[] = [];

  // Build sections list based on available content
  if (learn.overview?.fullDescription) {
    sections.push({ id: 'overview', label: 'Overview', icon: '&#128196;' });
  }
  if (learn.diagrams?.length) {
    sections.push({ id: 'diagrams', label: 'Diagrams', icon: '&#128202;' });
  }
  if (learn.concepts?.length) {
    sections.push({ id: 'concepts', label: 'Concepts', icon: '&#128161;' });
  }
  // Code examples are now shown in the action bar, not in main content
  if (learn.keyTakeaways?.length) {
    sections.push({ id: 'takeaways', label: 'Takeaways', icon: '&#10003;' });
  }
  if (learn.resources?.length) {
    sections.push({ id: 'resources', label: 'Resources', icon: '&#128279;' });
  }
  if (learn.localResources?.length) {
    sections.push({ id: 'local-resources', label: 'Guides', icon: '&#128221;' });
  }
  if (learn.faq?.length) {
    sections.push({ id: 'faq', label: 'FAQ', icon: '&#10067;' });
  }
  if (learn.applications?.length) {
    sections.push({ id: 'applications', label: 'Applications', icon: '&#128640;' });
  }

  if (sections.length < 2) return ''; // Not enough sections to warrant nav

  const navLinks = sections.map(s => `
    <a href="#section-${s.id}" class="section-nav-link" data-section="${s.id}">
      <span class="section-nav-icon">${s.icon}</span>
      <span>${s.label}</span>
    </a>
  `).join('');

  return `
    <!-- Desktop sidebar -->
    <aside class="section-nav" id="section-nav">
      <div class="section-nav-header">
        <span class="section-nav-title">On this page</span>
      </div>
      <nav class="section-nav-links">
        ${navLinks}
      </nav>
    </aside>

    <!-- Mobile floating button + dropdown -->
    <button class="section-nav-mobile-toggle" id="section-nav-mobile-toggle" aria-label="Table of contents">
      &#9776;
    </button>
    <nav class="section-nav-mobile" id="section-nav-mobile">
      ${navLinks}
    </nav>
  `;
}

// ── Simplified Learn Content (Reading-focused) ───────
function renderLearnContentSimple(learn: Learn, d: Day): string {
  const overview = learn.overview || {};

  return `
    <article class="learn-simple">
      ${overview.summary ? `<p class="lead">${overview.summary}</p>` : ''}

      ${overview.fullDescription ? `
        <section id="section-overview" class="content-section">
          <div class="prose">
            ${formatLearnMarkdown(overview.fullDescription)}
          </div>
        </section>
      ` : ''}

      ${learn.diagrams?.length ? `
        <section id="section-diagrams" class="content-section diagram-box">
          ${learn.diagrams.map(diag => `
            <figure>
              ${diag.title ? `<figcaption>${diag.title}</figcaption>` : ''}
              ${renderDiagram(diag)}
            </figure>
          `).join('')}
        </section>
      ` : ''}

      ${learn.concepts?.length ? `
        <section id="section-concepts" class="content-section concepts-section">
          <h2>Key Concepts</h2>
          ${learn.concepts.map((c, i) => `
            <div class="concept-item">
              <h3><span class="concept-num">${i + 1}</span>${c.title}</h3>
              <div class="prose">
                ${formatLearnMarkdown(c.description)}
              </div>
            </div>
          `).join('')}
        </section>
      ` : ''}

      <!-- Code examples are shown in the action bar above -->

      ${learn.keyTakeaways?.length ? `
        <section id="section-takeaways" class="content-section takeaways-section">
          <h2>Key Takeaways</h2>
          <ul>
            ${learn.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </section>
      ` : ''}

      ${learn.resources?.length ? `
        <section id="section-resources" class="content-section resources-section">
          <h2>Resources</h2>
          <div class="resources-list-simple">
            ${learn.resources.map((r, idx) => {
              const hasSummary = !!r.summaryPath;
              const resourceId = `resource-simple-${d.day}-${idx}-${encodeURIComponent(r.title).slice(0, 20)}`;
              return `
              <div class="resource-item-simple ${hasSummary ? 'has-summary' : ''}" data-resource-id="${resourceId}">
                <div class="resource-row-simple">
                  ${hasSummary ? `
                    <button type="button" class="resource-expand-btn-simple" data-action="toggle-resource-summary" data-resource-id="${resourceId}" data-path="${r.summaryPath}" title="Show/hide summary">
                      <span class="expand-icon">+</span>
                    </button>
                  ` : ''}
                  <a href="${r.url}" target="_blank" class="resource-link-simple">
                    <span class="resource-type-tag">${r.type || 'link'}</span>
                    <span class="resource-title-simple">${r.title}</span>
                    <span class="arrow">&#8599;</span>
                  </a>
                </div>
                ${hasSummary ? `
                  <div class="resource-summary-dropdown" id="${resourceId}-summary">
                    <div class="summary-content"></div>
                  </div>
                ` : ''}
              </div>
            `}).join('')}
          </div>
        </section>
      ` : ''}

      ${learn.localResources?.length ? `
        <section id="section-local-resources" class="content-section local-resources-section">
          <h2>Guides & Notes</h2>
          <div class="local-resources-list-simple">
            ${learn.localResources.map(lr => `
              <a href="#" class="local-resource-card-simple" data-action="open-local-resource" data-day="${d.day}" data-resource-id="${lr.id}">
                <span class="local-resource-icon">&#128221;</span>
                <div class="local-resource-info">
                  <span class="local-resource-title">${lr.title}</span>
                  ${lr.estimatedTime ? `<span class="local-resource-time">${lr.estimatedTime}</span>` : ''}
                </div>
                <span class="local-resource-arrow">&#8594;</span>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${learn.faq?.length ? `
        <section id="section-faq" class="content-section faq-section">
          <h2>FAQ</h2>
          <div class="faq-list">
            ${learn.faq.map((item, i) => `
              <details class="faq-item">
                <summary class="faq-question">${item.question}</summary>
                <div class="faq-answer prose">${formatLearnMarkdown(item.answer)}</div>
              </details>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${learn.applications?.length ? `
        <section id="section-applications" class="content-section applications-section">
          <h2>Real-World Applications</h2>
          <div class="applications-grid">
            ${learn.applications.map(app => `
              <div class="application-card">
                <h4>${app.title}</h4>
                <p>${app.description}</p>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}
    </article>
  `;
}

function renderNotFound(message: string): string {
  return `
    <div class="day-page">
      <div class="empty-state anim-fade-up">
        <div class="empty-icon">&#128533;</div>
        <h3>${message}</h3>
        <button class="btn btn-secondary" data-action="go-home">Back to Roadmap</button>
      </div>
    </div>
  `;
}

// ── Day Progress Tracker ─────────────────────────────
function renderDayProgress(day: number, learn: Learn | null): string {
  const entry = getEntry(day) || { status: "pending" } as JournalEntry;

  // Calculate progress for each section
  const conceptsTotal = learn?.concepts?.length || 0;
  const conceptsDone = conceptsTotal > 0 ? getSectionProgressForDay(day, 'concept').length : 0;

  const takeawaysTotal = learn?.keyTakeaways?.length || 0;
  const takeawaysDone = takeawaysTotal > 0 ? getSectionProgressForDay(day, 'takeaway').length : 0;

  const resourcesTotal = learn?.resources?.length || 0;
  const resourcesDone = resourcesTotal > 0 ? getCompletedResourcesForDay(day).length : 0;

  // Calculate overall progress
  const totalItems = conceptsTotal + takeawaysTotal + resourcesTotal;
  const completedItems = conceptsDone + takeawaysDone + resourcesDone;
  const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Determine status based on progress
  let statusText = 'Not Started';
  let statusClass = 'pending';
  if (overallPercent === 100) {
    statusText = 'Complete';
    statusClass = 'completed';
  } else if (overallPercent > 0 || entry.status === 'in-progress') {
    statusText = 'In Progress';
    statusClass = 'in-progress';
  }

  return `
    <div class="day-progress-tracker">
      <!-- Overall Progress Ring -->
      <div class="progress-overview">
        <div class="progress-ring-container">
          <svg class="progress-ring" viewBox="0 0 60 60">
            <circle class="progress-ring-bg" cx="30" cy="30" r="26" />
            <circle class="progress-ring-fill ${statusClass}"
                    cx="30" cy="30" r="26"
                    stroke-dasharray="163.36"
                    stroke-dashoffset="${163.36 - (163.36 * overallPercent / 100)}" />
          </svg>
          <div class="progress-ring-text">
            <span class="progress-percent">${overallPercent}%</span>
          </div>
        </div>
        <span class="progress-status ${statusClass}">${statusText}</span>
      </div>

      <!-- Section Breakdown -->
      <div class="progress-breakdown">
        ${conceptsTotal > 0 ? `
          <div class="progress-item">
            <div class="progress-item-header">
              <span class="progress-item-icon">&#128161;</span>
              <span class="progress-item-label">Concepts</span>
              <span class="progress-item-count">${conceptsDone}/${conceptsTotal}</span>
            </div>
            <div class="progress-bar-mini">
              <div class="progress-bar-fill" style="width: ${conceptsTotal > 0 ? (conceptsDone/conceptsTotal*100) : 0}%"></div>
            </div>
          </div>
        ` : ''}

        ${takeawaysTotal > 0 ? `
          <div class="progress-item">
            <div class="progress-item-header">
              <span class="progress-item-icon">&#10003;</span>
              <span class="progress-item-label">Takeaways</span>
              <span class="progress-item-count">${takeawaysDone}/${takeawaysTotal}</span>
            </div>
            <div class="progress-bar-mini">
              <div class="progress-bar-fill" style="width: ${takeawaysTotal > 0 ? (takeawaysDone/takeawaysTotal*100) : 0}%"></div>
            </div>
          </div>
        ` : ''}

        ${resourcesTotal > 0 ? `
          <div class="progress-item">
            <div class="progress-item-header">
              <span class="progress-item-icon">&#128279;</span>
              <span class="progress-item-label">Resources</span>
              <span class="progress-item-count">${resourcesDone}/${resourcesTotal}</span>
            </div>
            <div class="progress-bar-mini">
              <div class="progress-bar-fill" style="width: ${resourcesTotal > 0 ? (resourcesDone/resourcesTotal*100) : 0}%"></div>
            </div>
          </div>
        ` : ''}

        ${totalItems === 0 ? `
          <div class="progress-empty">
            No trackable items yet
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderDayCompletionSection(day: number): string {
  const completion = getDayCompletion(day);
  const isCompleted = completion?.completed === true;

  if (isCompleted) {
    const completedDate = new Date(completion.completedAt!).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    return `
      <div class="day-completion-section completed">
        <div class="completion-badge">
          <span class="completion-icon">&#10003;</span>
          <span class="completion-text">Day Completed</span>
        </div>
        <div class="completion-date">${completedDate}</div>
      </div>
    `;
  }

  const { canComplete, requirements } = checkDayCompletionRequirements(day);

  return `
    <div class="day-completion-section">
      <div class="nav-section-label" style="margin-top: 16px;">Requirements</div>
      <div class="completion-checklist">
        ${requirements.map(req => `
          <div class="completion-req ${req.completed ? 'done' : ''}">
            <span class="req-icon">${req.completed ? '&#10003;' : '&#9675;'}</span>
            <span class="req-label">${req.label}</span>
            ${req.count ? `<span class="req-count">${req.count}</span>` : ''}
          </div>
        `).join('')}
      </div>
      <button
        class="btn-finish-day ${canComplete ? '' : 'disabled'}"
        data-action="finish-day"
        data-day="${day}"
        ${canComplete ? '' : 'disabled'}
      >
        <span class="btn-icon">&#127942;</span>
        Finish Day ${day}
      </button>
      ${!canComplete ? '<p class="completion-hint">Complete all requirements to finish this day</p>' : ''}
    </div>
  `;
}

// ── Learn Content V2 (Vertical Sections) ─────────────
function renderLearnContentV2(learn: Learn, d: Day): string {
  const overview = learn.overview || {};
  const hasConcepts = learn.concepts && learn.concepts.length;
  const hasCode = learn.codeExamples && learn.codeExamples.length;
  const hasResources = learn.resources && learn.resources.length;

  return `
    <article class="learn-article">
      <!-- Overview Section -->
      <section id="section-overview" class="learn-section">
        <div class="section-header">
          <span class="section-number">01</span>
          <h2>Overview</h2>
          <div class="section-meta">
            ${overview.difficulty ? `<span class="difficulty-badge ${overview.difficulty}">${overview.difficulty}</span>` : ''}
            ${overview.estimatedTime ? `<span class="time-badge">&#9201; ${overview.estimatedTime}</span>` : ''}
          </div>
        </div>

        ${overview.summary ? `<p class="section-lead">${overview.summary}</p>` : ''}

        ${overview.fullDescription ? `
          <div class="section-prose">
            ${formatLearnMarkdown(overview.fullDescription)}
          </div>
        ` : ''}

        ${overview.prerequisites?.length ? `
          <div class="prerequisites-box">
            <h4>&#128218; Prerequisites</h4>
            <ul>
              ${overview.prerequisites.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${learn.diagrams?.length ? `
          <div class="diagrams-container">
            ${learn.diagrams.map(diag => `
              <figure class="diagram-figure">
                <figcaption>${diag.title || 'Diagram'}</figcaption>
                ${renderDiagram(diag, 'diagram-pre')}
              </figure>
            `).join('')}
          </div>
        ` : ''}

        ${learn.keyTakeaways?.length ? (() => {
          const takeawayProgress = getSectionProgressCounts(d.day, 'takeaway', learn.keyTakeaways!.length);
          return `
          <div class="takeaways-box">
            <div class="takeaways-header">
              <h4>&#127919; Key Takeaways</h4>
              <div class="section-progress-sm">
                <span>${takeawayProgress.completed}/${takeawayProgress.total}</span>
                ${takeawayProgress.completed === takeawayProgress.total ? '<span class="progress-done-sm">&#10003;</span>' : ''}
              </div>
            </div>
            <ul class="takeaways-list">
              ${learn.keyTakeaways!.map((t, i) => {
                const isItemCompleted = isSectionItemCompleted(d.day, 'takeaway', i);
                return `
                <li class="${isItemCompleted ? 'completed' : ''}">
                  <button class="takeaway-checkbox" data-action="toggle-section" data-day="${d.day}" data-type="takeaway" data-index="${i}" data-title="${t.substring(0, 50)}">
                    ${isItemCompleted ? '&#10003;' : ''}
                  </button>
                  <span>${t}</span>
                </li>
              `}).join('')}
            </ul>
          </div>
        `})() : ''}
      </section>

      <!-- Concepts Section -->
      ${hasConcepts ? (() => {
        const conceptProgress = getSectionProgressCounts(d.day, 'concept', learn.concepts!.length);
        return `
        <section id="section-concepts" class="learn-section">
          <div class="section-header">
            <span class="section-number">02</span>
            <h2>Key Concepts</h2>
            <div class="section-progress">
              <span class="progress-count">${conceptProgress.completed}/${conceptProgress.total}</span>
              <div class="progress-bar-mini">
                <div class="progress-fill-mini" style="width: ${conceptProgress.percent}%"></div>
              </div>
              ${conceptProgress.completed === conceptProgress.total ? '<span class="progress-done">&#10003;</span>' : ''}
            </div>
          </div>
          <div class="concepts-list">
            ${learn.concepts!.map((c, i) => {
              const isItemCompleted = isSectionItemCompleted(d.day, 'concept', i);
              return `
              <div class="concept-block ${isItemCompleted ? 'completed' : ''}">
                <div class="concept-title">
                  <button class="section-checkbox" data-action="toggle-section" data-day="${d.day}" data-type="concept" data-index="${i}" data-title="${c.title}">
                    ${isItemCompleted ? '&#10003;' : ''}
                  </button>
                  <span class="concept-num">${i + 1}</span>
                  <h3>${c.title}</h3>
                </div>
                <div class="concept-body">
                  ${formatLearnMarkdown(c.description)}
                </div>
                ${c.analogy ? `
                  <div class="concept-analogy">
                    <strong>&#128161; Analogy:</strong> ${c.analogy}
                  </div>
                ` : ''}
                ${c.gotchas?.length ? `
                  <div class="concept-gotchas">
                    <strong>&#9888; Watch out:</strong>
                    <ul>${c.gotchas.map(g => `<li>${g}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            `}).join('')}
          </div>
        </section>
      `})() : ''}

      <!-- Code Section -->
      ${hasCode ? `
        <section id="section-code" class="learn-section">
          <div class="section-header">
            <span class="section-number">${hasConcepts ? '03' : '02'}</span>
            <h2>Code Examples</h2>
          </div>
          <div class="code-examples-list">
            ${learn.codeExamples!.map(ex => `
              <div class="code-block-v2">
                <div class="code-header-v2">
                  <span class="code-title">${ex.title || 'Example'}</span>
                  <div class="code-meta">
                    <span class="code-lang">${ex.language || 'python'}</span>
                    ${ex.category ? `<span class="code-category">${ex.category}</span>` : ''}
                    <button class="btn-copy" onclick="copyCode(this)">Copy</button>
                  </div>
                </div>
                <pre class="code-pre"><code>${highlightSyntax(ex.code, ex.language || 'python')}</code></pre>
                ${ex.explanation ? `<div class="code-explanation">${ex.explanation}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Resources Section -->
      ${hasResources ? `
        <section id="section-resources" class="learn-section">
          <div class="section-header">
            <span class="section-number">${String(2 + (hasConcepts ? 1 : 0) + (hasCode ? 1 : 0)).padStart(2, '0')}</span>
            <h2>Resources</h2>
          </div>
          ${renderResourcesV2(learn.resources!, d.day)}
        </section>
      ` : ''}
    </article>
  `;
}

// ── Resources V2 ─────────────────────────────────────
function renderResourcesV2(resources: Learn['resources'], day: number): string {
  if (!resources) return '';

  // Get local resources for this day
  const localResources = getLocalResourcesForDay(day);

  const totalResources = resources.length;
  const completedCount = resources.filter(r => isResourceCompleted(day, r.url)).length;
  const progressPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0;

  let html = `
    <div class="resources-header-v2">
      <div class="resources-progress-v2">
        <div class="progress-text">${completedCount}/${totalResources} completed</div>
        <div class="progress-bar-v2">
          <div class="progress-fill-v2" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    </div>
  `;

  // Local resources section (if any)
  if (localResources.length > 0) {
    html += `
      <div class="local-resources-section">
        <h4 class="local-resources-title">&#128214; Study Materials</h4>
        <div class="local-resources-grid">
          ${localResources.map(r => {
            const isCompleted = isLocalResourceCompleted(day, r.id);
            return `
            <div class="local-resource-card ${isCompleted ? 'completed' : ''}">
              <button type="button" class="local-resource-check" data-action="toggle-local-resource" data-day="${day}" data-resource-id="${r.id}" data-title="${r.title}" title="${isCompleted ? 'Mark incomplete' : 'Mark complete'}">
                ${isCompleted ? '&#10003;' : ''}
              </button>
              <div class="local-resource-clickable" data-action="view-local-resource" data-day="${day}" data-resource-id="${r.id}">
                <div class="local-resource-icon">${getResourceTypeIcon(r.type)}</div>
                <div class="local-resource-info">
                  <span class="local-resource-title">${r.title}</span>
                  ${r.description ? `<span class="local-resource-desc">${r.description}</span>` : ''}
                </div>
                <div class="local-resource-meta">
                  <span class="resource-type-badge local">${r.type || 'notes'}</span>
                  ${r.estimatedTime ? `<span class="local-resource-time">&#128337; ${r.estimatedTime}</span>` : ''}
                </div>
                <span class="local-resource-arrow">&#8594;</span>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  // External resources
  html += `
    <div class="external-resources-section">
      <h4 class="external-resources-title">&#128279; External Resources</h4>
      <div class="resources-grid">
        ${resources.map((r, idx) => {
          const isCompleted = isResourceCompleted(day, r.url);
          const hasSummary = !!r.summaryPath;
        const resourceId = `resource-${day}-${idx}-${encodeURIComponent(r.title).slice(0, 20)}`;
        return `
          <div class="resource-card ${isCompleted ? 'completed' : ''} ${hasSummary ? 'has-summary' : ''}" data-resource-id="${resourceId}">
            <div class="resource-row">
              <button type="button" class="resource-check" data-action="toggle-resource" data-day="${day}" data-url="${r.url}" data-title="${r.title}">
                ${isCompleted ? '&#10003;' : ''}
              </button>
              ${hasSummary ? `
                <button type="button" class="resource-expand-btn" data-action="toggle-resource-summary" data-resource-id="${resourceId}" data-path="${r.summaryPath}" title="Show/hide summary">
                  <span class="expand-icon">+</span>
                </button>
              ` : ''}
              <a href="${r.url}" target="_blank" class="resource-link-v2">
                <div class="resource-type-icon">${getResourceTypeIcon(r.type)}</div>
                <div class="resource-info-v2">
                  <span class="resource-title-v2">${r.title}</span>
                  ${r.description ? `<span class="resource-desc-v2">${r.description}</span>` : ''}
                </div>
                <div class="resource-meta-v2">
                  <span class="resource-type-label" data-type="${r.type || 'link'}">${r.type || 'link'}</span>
                  ${r.duration ? `<span class="resource-duration-v2">${r.duration}</span>` : ''}
                </div>
                <span class="resource-external-arrow">&#8599;</span>
              </a>
            </div>
            ${hasSummary ? `
              <div class="resource-summary-dropdown" id="${resourceId}-summary">
                <div class="summary-content"></div>
              </div>
            ` : ''}
          </div>
        `;
        }).join('')}
      </div>
    </div>
  `;

  return html;
}

// ── Learn Content Expansion ─────────────────────────
function renderLearnContent(d: Day): string {
  // Support both learn and lesson objects for backwards compatibility
  const learn = d.learn || convertLessonToLearn(d.lesson);

  // Coming soon state
  if (!learn) {
    return `
      <div class="learn-content coming-soon phase-${d.phase}" data-day="${d.day}">
        <div class="learn-coming-soon">
          <span class="coming-soon-icon">&#128679;</span>
          <h4>Educational Content Coming Soon</h4>
          <p>Comprehensive learning materials for "${d.title}" are being prepared.</p>
          <div class="coming-soon-preview">
            <strong>Topics to be covered:</strong>
            <ul>
              ${d.concept ? `<li>${d.concept}</li>` : ''}
              ${d.tags.map(t => `<li>${formatTagForDisplay(t)}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Full learn content
  const overview = learn.overview || {};
  const difficulty = overview.difficulty || 'intermediate';
  const estimatedTime = overview.estimatedTime || '';
  const hasConcepts = learn.concepts && learn.concepts.length;
  const hasCode = learn.codeExamples && learn.codeExamples.length;
  const hasResources = learn.resources && learn.resources.length;

  return `
    <div class="learn-content phase-${d.phase}" data-day="${d.day}">
      <div class="learn-content-inner">
        <div class="learn-header">
          <h4><span class="learn-icon">&#128218;</span> Learn: ${d.title}</h4>
          <div class="learn-meta">
            ${difficulty ? `<span class="difficulty ${difficulty}">${difficulty}</span>` : ''}
            ${estimatedTime ? `<span class="estimated-time">&#9200; ${estimatedTime}</span>` : ''}
          </div>
        </div>

        <div class="learn-tabs">
          <button class="learn-tab active" data-learn-tab="overview">Overview</button>
          ${hasConcepts ? `<button class="learn-tab" data-learn-tab="concepts">Concepts</button>` : ''}
          ${hasCode ? `<button class="learn-tab" data-learn-tab="code">Code</button>` : ''}
          ${hasResources ? `<button class="learn-tab" data-learn-tab="resources">Resources</button>` : ''}
        </div>

        ${renderLearnOverviewTab(learn, d)}
        ${hasConcepts ? renderLearnConceptsTab(learn) : ''}
        ${hasCode ? renderLearnCodeTab(learn) : ''}
        ${hasResources ? renderLearnResourcesTab(learn, d.day) : ''}
      </div>
    </div>
  `;
}

function convertLessonToLearn(lesson: Lesson | undefined): Learn | null {
  if (!lesson) return null;
  return {
    overview: {
      fullDescription: lesson.overview,
      difficulty: 'intermediate',
      estimatedTime: '1-2 hours'
    },
    concepts: lesson.principles ? lesson.principles.map(p => ({
      title: p.title,
      description: p.description
    })) : [],
    codeExamples: lesson.codeExample ? [{
      title: lesson.codeExample.title,
      language: lesson.codeExample.language,
      code: lesson.codeExample.code,
      category: 'basic' as const
    }] : [],
    diagrams: lesson.diagram ? [{
      title: lesson.diagram.title,
      type: lesson.diagram.type,
      content: lesson.diagram.ascii,
      ascii: lesson.diagram.ascii,
      mermaid: lesson.diagram.mermaid
    }] : [],
    keyTakeaways: lesson.keyTakeaways || [],
    resources: lesson.resources || []
  };
}

function formatTagForDisplay(tag: string): string {
  return tag.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function renderLearnOverviewTab(learn: Learn, d: Day): string {
  const overview = learn.overview || {};
  return `
    <div class="learn-tab-content active" data-learn-tab-content="overview">
      ${overview.summary ? `<p class="learn-summary">${overview.summary}</p>` : ''}
      ${overview.fullDescription ? `<div class="learn-description">${formatLearnMarkdown(overview.fullDescription)}</div>` : ''}

      ${overview.prerequisites && overview.prerequisites.length ? `
        <div class="learn-prerequisites">
          <h5>Prerequisites</h5>
          <ul>
            ${overview.prerequisites.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${learn.diagrams && learn.diagrams.length ? `
        <div class="learn-diagrams">
          ${learn.diagrams.map(diag => `
            <div class="learn-diagram">
              <h5>${diag.title || 'Diagram'}</h5>
              ${renderDiagram(diag)}
              ${diag.caption ? `<p class="diagram-caption">${diag.caption}</p>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${learn.keyTakeaways && learn.keyTakeaways.length ? `
        <div class="learn-takeaways">
          <h5>Key Takeaways</h5>
          <ul>
            ${learn.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${learn.applications && learn.applications.length ? `
        <div class="learn-applications">
          <h5>Real-World Applications</h5>
          <div class="applications-grid">
            ${learn.applications.map(app => `
              <div class="application-card">
                <h6>${app.title}</h6>
                <p>${app.description}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${learn.relatedDays && learn.relatedDays.length ? `
        <div class="learn-related">
          <h5>Related Days</h5>
          <div class="related-chips">
            ${learn.relatedDays.map(dayNum => {
              const relatedDay = DAYS.find(day => day.day === dayNum);
              return relatedDay ? `<span class="related-chip" data-action="toggle-learn" data-day="${dayNum}">Day ${dayNum}: ${relatedDay.title}</span>` : '';
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderLearnConceptsTab(learn: Learn): string {
  return `
    <div class="learn-tab-content" data-learn-tab-content="concepts">
      <div class="learn-concepts">
        ${learn.concepts!.map((c, i) => `
          <div class="concept-card-full">
            <div class="concept-header">
              <span class="concept-number">${i + 1}</span>
              <h4>${c.title}</h4>
            </div>
            <div class="concept-content">
              ${formatLearnMarkdown(c.description)}
            </div>
            ${c.analogy ? `<div class="concept-analogy"><strong>Analogy:</strong> ${c.analogy}</div>` : ''}
            ${c.gotchas && c.gotchas.length ? `
              <div class="concept-gotchas">
                <strong>Watch out for:</strong>
                <ul>${c.gotchas.map(g => `<li>${g}</li>`).join('')}</ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderLearnCodeTab(learn: Learn): string {
  return `
    <div class="learn-tab-content" data-learn-tab-content="code">
      <div class="learn-code-examples">
        ${learn.codeExamples!.map(ex => `
          <div class="code-example-block">
            <div class="code-example-header">
              <span class="code-lang">${ex.language || 'python'}</span>
              <span class="code-title">${ex.title || 'Example'}</span>
              ${ex.category ? `<span class="code-category ${ex.category}">${ex.category}</span>` : ''}
              <button class="btn-copy-code" title="Copy code">Copy</button>
            </div>
            <pre class="code-pre"><code>${highlightSyntax(ex.code, ex.language || 'python')}</code></pre>
            ${ex.explanation ? `<div class="code-explanation">${ex.explanation}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderLearnResourcesTab(learn: Learn, day: number): string {
  const resources = learn.resources!;
  const totalResources = resources.length;
  const completedCount = resources.filter(r => isResourceCompleted(day, r.url)).length;
  const progressPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0;

  return `
    <div class="learn-tab-content" data-learn-tab-content="resources">
      <div class="resources-progress-header">
        <div class="resources-progress-info">
          <span class="resources-count">${completedCount} of ${totalResources} completed</span>
          <div class="resources-progress-bar">
            <div class="resources-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>
        ${completedCount === totalResources && totalResources > 0 ? '<span class="resources-complete-badge">&#10003; All Done!</span>' : ''}
      </div>

      <div class="learn-resources">
        ${resources.map((r) => {
          const isCompleted = isResourceCompleted(day, r.url);
          return `
          <div class="resource-item ${isCompleted ? 'completed' : ''}" data-day="${day}" data-resource-url="${r.url}" data-resource-title="${r.title}">
            <button class="resource-checkbox" data-action="toggle-resource" data-day="${day}" data-url="${r.url}" data-title="${r.title}" title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
              ${isCompleted ? '<span class="check-icon">&#10003;</span>' : '<span class="check-empty"></span>'}
            </button>
            <a href="${r.url}" target="_blank" class="resource-link">
              <span class="resource-type ${r.type || 'link'}">${getResourceTypeIcon(r.type)}${r.type || 'link'}</span>
              <div class="resource-info">
                <span class="resource-title">${r.title}</span>
                ${r.description ? `<span class="resource-desc">${r.description}</span>` : ''}
              </div>
              <div class="resource-meta">
                ${r.duration ? `<span class="resource-duration">&#9201; ${r.duration}</span>` : ''}
                ${r.difficulty ? `<span class="resource-difficulty ${r.difficulty}">${r.difficulty}</span>` : ''}
              </div>
              <span class="resource-arrow">&#8599;</span>
            </a>
          </div>
        `}).join('')}
      </div>

      ${learn.faq && learn.faq.length ? `
        <div class="learn-faq">
          <h5>Frequently Asked Questions</h5>
          ${learn.faq.map(f => `
            <details class="faq-item">
              <summary>${f.question}</summary>
              <p>${f.answer}</p>
            </details>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function getResourceTypeIcon(type: string | undefined): string {
  const icons: Record<string, string> = {
    video: '&#127909; ',
    article: '&#128196; ',
    docs: '&#128214; ',
    tutorial: '&#128187; ',
    github: '&#128736; ',
    course: '&#127891; ',
    book: '&#128218; ',
    paper: '&#128220; ',
    tool: '&#128295; ',
    link: '&#128279; ',
    notes: '&#128221; ',
    guide: '&#128218; ',
    exercise: '&#128187; ',
    reference: '&#128214; '
  };
  return icons[type || 'link'] || icons.link;
}

function formatLearnMarkdown(text: string | undefined): string {
  if (!text) return '';

  // First, extract and replace code blocks with placeholders
  const codeBlocks: string[] = [];
  let processedText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const index = codeBlocks.length;
    const language = lang || 'text';
    codeBlocks.push(`<pre class="code-block-inline"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`);
    return `__CODE_BLOCK_${index}__`;
  });

  // Process paragraphs and inline formatting
  let html = processedText
    .split(/\n\n+/)
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => {
      // Don't wrap code block placeholders in <p> tags
      if (para.startsWith('__CODE_BLOCK_')) {
        return para;
      }
      return `<p>${para}</p>`;
    })
    .join('\n')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/<p>(.*?)<\/p>/gs, (match, content) => {
      // Don't process code block placeholders
      if (content.startsWith('__CODE_BLOCK_')) return match;
      return `<p>${content.replace(/\n/g, ' ')}</p>`;
    });

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return html;
}

// ── Lesson Content Renderer ─────────────────────────
function renderLessonContent(lesson: Lesson): string {
  if (!lesson) return "";

  let html = `<div class="lesson-content">`;

  html += `
    <div class="lesson-tabs">
      <button class="lesson-tab active" data-tab="overview">Overview</button>
      <button class="lesson-tab" data-tab="principles">Key Principles</button>
      <button class="lesson-tab" data-tab="code">Code Example</button>
      <button class="lesson-tab" data-tab="resources">Resources</button>
    </div>
  `;

  html += `
    <div class="lesson-tab-content active" data-tab-content="overview">
      <div class="lesson-overview">
        ${lesson.overview ? `<p>${lesson.overview.replace(/\n\n/g, '</p><p>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>` : ""}
      </div>

      ${lesson.diagram ? `
        <div class="lesson-diagram">
          <h4>${lesson.diagram.title || "Diagram"}</h4>
          ${lesson.diagram.mermaid
            ? `<pre class="mermaid">${lesson.diagram.mermaid}</pre>`
            : `<pre class="diagram-ascii">${escapeHtml(lesson.diagram.ascii || '')}</pre>`}
        </div>
      ` : ""}

      ${lesson.keyTakeaways && lesson.keyTakeaways.length ? `
        <div class="lesson-takeaways">
          <h4>Key Takeaways</h4>
          <ul>
            ${lesson.keyTakeaways.map(t => `<li>${t}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
    </div>
  `;

  if (lesson.principles && lesson.principles.length) {
    html += `
      <div class="lesson-tab-content" data-tab-content="principles">
        <div class="lesson-principles">
          ${lesson.principles.map((p, i) => `
            <div class="principle-card">
              <div class="principle-number">${i + 1}</div>
              <div class="principle-body">
                <h4>${p.title}</h4>
                <p>${p.description}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (lesson.codeExample) {
    html += `
      <div class="lesson-tab-content" data-tab-content="code">
        <div class="code-example">
          <div class="code-header">
            <span class="code-lang">${lesson.codeExample.language || "python"}</span>
            <span class="code-title">${lesson.codeExample.title || "Example"}</span>
            <button class="btn-copy-code" title="Copy code">Copy</button>
          </div>
          <pre class="code-block"><code>${escapeHtml(lesson.codeExample.code)}</code></pre>
        </div>
      </div>
    `;
  }

  if (lesson.resources && lesson.resources.length) {
    html += `
      <div class="lesson-tab-content" data-tab-content="resources">
        <div class="lesson-resources">
          ${lesson.resources.map(r => `
            <a href="${r.url}" target="_blank" class="resource-link">
              <span class="resource-type ${r.type || 'link'}">${r.type || 'link'}</span>
              <span class="resource-title">${r.title}</span>
              <span class="resource-arrow">&#8599;</span>
            </a>
          `).join("")}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

function bindLessonTabs(): void {
  document.querySelectorAll<HTMLButtonElement>(".lesson-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      const tabName = tab.dataset.tab;
      const container = tab.closest(".lesson-content");
      if (!container || !tabName) return;

      container.querySelectorAll(".lesson-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      container.querySelectorAll(".lesson-tab-content").forEach(c => c.classList.remove("active"));
      const content = container.querySelector(`[data-tab-content="${tabName}"]`);
      if (content) content.classList.add("active");
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".btn-copy-code").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const codeBlock = btn.closest(".code-example")?.querySelector("code");
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.textContent || '');
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = "Copy", 2000);
      }
    });
  });
}


// ── Resource Viewer ─────────────────────────────────
async function renderResourceViewer(): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;

  const day = routeParams.day;
  const resourceId = routeParams.resourceId;

  if (!day || !resourceId) {
    app.innerHTML = renderNotFound("Resource not found");
    bindEvents();
    return;
  }

  const dayData = DAYS.find(d => d.day === day);
  const resource = getLocalResource(day, resourceId);

  if (!dayData || !resource) {
    app.innerHTML = `
      <div class="resource-viewer">
        <div class="resource-viewer-header">
          <button class="btn btn-back" data-action="go-to-day-from-resource" data-day="${day}">
            &#8592; Back to Day ${day}
          </button>
        </div>
        <div class="resource-not-found">
          <h2>Resource Not Found</h2>
          <p>The requested resource could not be found.</p>
        </div>
      </div>
    `;
    bindEvents();
    return;
  }

  app.innerHTML = `
    <div class="resource-viewer">
      <div class="resource-viewer-header">
        <button class="btn btn-back" data-action="go-to-day-from-resource" data-day="${day}">
          &#8592; Back to Day ${day}
        </button>
        <div class="resource-meta">
          <span class="resource-type-badge">${resource.type || 'notes'}</span>
          ${resource.estimatedTime ? `<span class="resource-time">&#128337; ${resource.estimatedTime}</span>` : ''}
        </div>
      </div>
      <div class="resource-loading">
        <div class="loading-spinner"></div>
        <p>Loading resource...</p>
      </div>
    </div>
  `;

  const content = await fetchLocalResource(resource.filePath);

  if (!content) {
    app.innerHTML = `
      <div class="resource-viewer">
        <div class="resource-viewer-header">
          <button class="btn btn-back" data-action="go-to-day-from-resource" data-day="${day}">
            &#8592; Back to Day ${day}
          </button>
        </div>
        <div class="resource-error">
          <h2>Failed to Load Resource</h2>
          <p>There was an error loading "${resource.title}". Please try again later.</p>
          <p class="error-path">Path: ${resource.filePath}</p>
        </div>
      </div>
    `;
    bindEvents();
    return;
  }

  const renderedContent = renderMarkdownFull(content);

  app.innerHTML = `
    <div class="resource-viewer">
      <div class="resource-viewer-header">
        <button class="btn btn-back" data-action="go-to-day-from-resource" data-day="${day}">
          &#8592; Back to Day ${day}
        </button>
        <div class="resource-meta">
          <span class="resource-type-badge">${resource.type || 'notes'}</span>
          ${resource.estimatedTime ? `<span class="resource-time">&#128337; ${resource.estimatedTime}</span>` : ''}
        </div>
      </div>
      <article class="resource-content">
        <div class="resource-content-inner markdown-body">
          ${renderedContent}
        </div>
      </article>
      <div class="resource-viewer-footer">
        <button class="btn btn-secondary" data-action="go-to-day-from-resource" data-day="${day}">
          &#8592; Back to Day ${day}: ${dayData.title}
        </button>
      </div>
    </div>
  `;

  bindEvents();
}

// ── Modal Helpers ──────────────────────────────────
function showModal(): void {
  document.getElementById("modal-overlay")?.classList.remove("hidden");
}

function closeModal(): void {
  document.getElementById("modal-overlay")?.classList.add("hidden");
}

document.getElementById("modal-close")?.addEventListener("click", closeModal);
document.getElementById("modal-overlay")?.addEventListener("click", e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ── Scroll Spy for Section Navigation ──────────────
let scrollSpyCleanup: (() => void) | null = null;

function setupScrollSpy(): void {
  // Clean up any existing scroll spy
  if (scrollSpyCleanup) {
    scrollSpyCleanup();
    scrollSpyCleanup = null;
  }

  const sections = document.querySelectorAll<HTMLElement>('.content-section');
  const navLinks = document.querySelectorAll<HTMLAnchorElement>('.section-nav-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in upper portion
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));

  // Store cleanup function
  scrollSpyCleanup = () => {
    observer.disconnect();
  };
}

// ── Event Delegation ───────────────────────────────
function bindEvents(): void {
  // Render any mermaid diagrams on the page (with small delay for DOM)
  setTimeout(() => renderMermaidDiagrams(), 100);

  // Navigate to day page
  document.querySelectorAll<HTMLElement>("[data-action='go-to-day']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const day = parseInt(el.dataset.day || '0');
      navigate("day", { day });
    });
  });

  // Go back to home/roadmap
  document.querySelectorAll<HTMLElement>("[data-action='go-home']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("home");
    });
  });

  // Navigate to local resource viewer
  document.querySelectorAll<HTMLElement>("[data-action='view-local-resource']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const day = parseInt(el.dataset.day || '0');
      const resourceId = el.dataset.resourceId;
      navigate("resource", { day, resourceId });
    });
  });

  // Toggle resource summary dropdown
  document.querySelectorAll<HTMLElement>("[data-action='toggle-resource-summary']").forEach(el => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const resourceId = el.dataset.resourceId;
      const path = el.dataset.path;
      if (!resourceId || !path) return;

      const dropdown = document.getElementById(`${resourceId}-summary`);
      const expandIcon = el.querySelector('.expand-icon');
      if (!dropdown) return;

      const isExpanded = dropdown.classList.contains('expanded');

      if (isExpanded) {
        // Collapse
        dropdown.classList.remove('expanded');
        if (expandIcon) expandIcon.textContent = '+';
      } else {
        // Expand
        dropdown.classList.add('expanded');
        if (expandIcon) expandIcon.textContent = '−';

        const contentEl = dropdown.querySelector('.summary-content');
        if (contentEl && !contentEl.innerHTML.trim()) {
          // Load content if not already loaded
          contentEl.innerHTML = '<div class="summary-loading">Loading...</div>';

          const content = await fetchLocalResource(path);
          if (content) {
            contentEl.innerHTML = renderMarkdownFull(content);
          } else {
            contentEl.innerHTML = '<p class="summary-error">Summary not available.</p>';
          }
        }
      }
    });
  });

  // Go back to day page from resource viewer
  document.querySelectorAll<HTMLElement>("[data-action='go-to-day-from-resource']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const day = parseInt(el.dataset.day || '0');
      navigate("day", { day });
    });
  });

  // Write blog post for specific day
  document.querySelectorAll<HTMLElement>("[data-action='write-blog-for-day']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const day = parseInt(el.dataset.day || '0');
      routeParams.linkedDay = day;
      navigate("blog-new", { linkedDay: day });
    });
  });

  // Finish day
  document.querySelectorAll<HTMLElement>("[data-action='finish-day']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const day = parseInt(el.dataset.day || '0');
      const result = markDayComplete(day);
      if (result.success) {
        render();
      } else {
        alert("Cannot complete day yet. Check the requirements checklist.");
      }
    });
  });

  // Toggle reading complete
  document.querySelectorAll<HTMLInputElement>("[data-action='toggle-reading']").forEach(el => {
    el.addEventListener("change", () => {
      const day = parseInt(el.dataset.day || '0');
      const wasComplete = isReadingComplete(day);
      const isComplete = toggleReadingComplete(day);
      const label = el.closest('.reading-complete-label');

      if (label) {
        label.classList.toggle('checked', isComplete);
      }

      // Auto-generate log entry when marking as complete (not when unchecking)
      if (isComplete && !wasComplete) {
        const post = generateAutoLogEntry(day);
        if (post) {
          // Update the label text to show it was logged
          const labelText = label?.querySelector('.label-text');
          if (labelText) {
            labelText.textContent = 'Completed & logged';
          }
        }
      }
    });
  });

  // Clear day progress
  document.querySelectorAll<HTMLElement>("[data-action='clear-day']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const day = parseInt(el.dataset.day || '0');
      clearDayProgress(day);
      render(); // Re-render to show unchecked state
    });
  });

  // Mark demo as completed
  document.querySelectorAll<HTMLElement>("[data-action='mark-demo-complete']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const day = parseInt(el.dataset.day || '0');
      markDemoCompleted(day);
      render();
    });
  });

  // Toggle inline expansion for completed days
  document.querySelectorAll<HTMLElement>("[data-action='toggle-expand']").forEach(el => {
    el.addEventListener("click", () => {
      const day = parseInt(el.dataset.day || '0');
      if (expandedDays.has(day)) {
        expandedDays.delete(day);
      } else {
        expandedDays.add(day);
      }
      render();
      setTimeout(() => {
        const expanded = document.querySelector(`.inline-content[data-day="${day}"]`);
        if (expanded) {
          expanded.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='view-entry']").forEach(el => {
    el.addEventListener("click", () => {
      const day = parseInt(el.dataset.day || '0');
      navigate("day", { day });
    });
  });

  document.querySelectorAll<HTMLElement>("[data-filter]").forEach(el => {
    el.addEventListener("click", () => {
      routeParams.filter = el.dataset.filter;
      render();
    });
  });

  // Toggle learn expansion
  document.querySelectorAll<HTMLElement>("[data-action='toggle-learn']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const day = parseInt(el.dataset.day || '0');
      if (learnExpandedDays.has(day)) {
        learnExpandedDays.delete(day);
      } else {
        learnExpandedDays.add(day);
      }
      render();
      setTimeout(() => {
        const learnContent = document.querySelector(`.learn-content[data-day="${day}"]`);
        if (learnContent) {
          learnContent.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 50);
    });
  });

  // Toggle resource completion checkbox
  document.querySelectorAll<HTMLElement>("[data-action='toggle-resource']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const day = parseInt(el.dataset.day || '0');
      const url = el.dataset.url || '';
      const title = el.dataset.title || '';
      toggleResourceCompletion(day, url, title);
      render();
    });
  });

  // Toggle local resource completion
  document.querySelectorAll<HTMLElement>("[data-action='toggle-local-resource']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const day = parseInt(el.dataset.day || '0');
      const resourceId = el.dataset.resourceId || '';
      const title = el.dataset.title || '';
      toggleLocalResourceCompletion(day, resourceId, title);
      render();
    });
  });

  // Toggle section item completion
  document.querySelectorAll<HTMLElement>("[data-action='toggle-section']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const day = parseInt(el.dataset.day || '0');
      const type = el.dataset.type as 'concept' | 'takeaway' | 'overview';
      const index = parseInt(el.dataset.index || '0');
      const title = el.dataset.title || '';
      toggleSectionItem(day, type, index, title);
      render();
    });
  });

  // Save journal from textarea
  document.querySelectorAll<HTMLElement>("[data-action='save-journal']").forEach(el => {
    el.addEventListener("click", () => {
      const day = parseInt(el.dataset.day || '0');
      const textarea = document.getElementById(`journal-textarea-${day}`) as HTMLTextAreaElement | null;
      if (textarea) {
        const entry = getEntry(day) || { status: "pending" as const };
        saveEntry(day, {
          ...entry,
          body: textarea.value
        });
        el.textContent = "Saved!";
        setTimeout(() => { el.textContent = "Save"; }, 1500);
      }
    });
  });

  // Section navigation (TOC sidebar)
  document.querySelectorAll<HTMLAnchorElement>(".section-nav-link").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = el.getAttribute("href")?.substring(1);
      if (!sectionId) return;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        document.querySelectorAll(".section-nav-link").forEach(n => n.classList.remove("active"));
        el.classList.add("active");
        // Close mobile menu if open
        document.getElementById("section-nav-mobile")?.classList.remove("open");
        document.getElementById("section-nav-mobile-toggle")?.classList.remove("active");
      }
    });
  });

  // Mobile TOC toggle
  const mobileToggle = document.getElementById("section-nav-mobile-toggle");
  const mobileNav = document.getElementById("section-nav-mobile");
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", () => {
      mobileNav.classList.toggle("open");
      mobileToggle.classList.toggle("active");
    });
    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!mobileNav.contains(e.target as Node) && !mobileToggle.contains(e.target as Node)) {
        mobileNav.classList.remove("open");
        mobileToggle.classList.remove("active");
      }
    });
  }

  // Scroll spy for section navigation
  setupScrollSpy();

  bindLessonTabs();
  bindLearnTabs();
  bindBlogEvents();
}

// ── Blog Event Handlers ─────────────────────────────
function bindBlogEvents(): void {
  document.querySelectorAll<HTMLElement>("[data-action='new-blog-post']").forEach(el => {
    el.addEventListener("click", () => {
      navigate("blog-new");
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='view-blog']").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      navigate("blog-post", { id });
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='edit-blog']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.id;
      navigate("blog-edit", { id });
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='delete-blog']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.dataset.id;
      if (id && confirm("Are you sure you want to delete this blog post?")) {
        deleteBlogPost(id);
        navigate("blog");
      }
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='go-blog']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("blog");
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='go-day']").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const day = parseInt(el.dataset.day || '0');
      expandedDays.add(day);
      navigate("home");
      setTimeout(() => {
        const card = document.querySelector(`.day-card[data-day="${day}"]`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='cancel-blog']").forEach(el => {
    el.addEventListener("click", () => {
      navigate("blog");
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='blog-filter']").forEach(el => {
    el.addEventListener("click", () => {
      const showDrafts = el.dataset.showDrafts === "true";
      navigate("blog", { showDrafts, tag: undefined });
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='blog-tag-filter']").forEach(el => {
    el.addEventListener("click", () => {
      const tag = el.dataset.tag || undefined;
      navigate("blog", { tag, showDrafts: false });
    });
  });

  document.querySelectorAll<HTMLElement>("[data-action='add-tag']").forEach(el => {
    el.addEventListener("click", () => {
      const tag = el.dataset.tag;
      const input = document.getElementById("blog-tags") as HTMLInputElement | null;
      if (input && tag) {
        const currentTags = input.value.split(",").map(t => t.trim()).filter(Boolean);
        if (!currentTags.includes(tag)) {
          currentTags.push(tag);
          input.value = currentTags.join(", ");
        }
      }
    });
  });

  const blogForm = document.getElementById("blog-form") as HTMLFormElement | null;
  if (blogForm) {
    blogForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target as HTMLFormElement);
      const title = (fd.get("title") as string)?.trim() || '';
      const body = (fd.get("body") as string)?.trim() || '';
      const tagsStr = fd.get("tags") as string;
      const tags = tagsStr ? tagsStr.split(",").map(t => t.trim()).filter(Boolean) : [];
      const linkedDayStr = fd.get("linkedDay") as string;
      const linkedDay = linkedDayStr ? parseInt(linkedDayStr) : null;
      const status = fd.get("status") as 'draft' | 'published';

      if (!title || !body) {
        alert("Title and content are required.");
        return;
      }

      const isEdit = currentRoute === "blog-edit";

      if (isEdit && routeParams.id) {
        updateBlogPost(routeParams.id, { title, body, tags, linkedDay, status });
        navigate("blog-post", { id: routeParams.id });
      } else {
        const newPost = createBlogPost({ title, body, tags, linkedDay, status });
        if (status === "published") {
          navigate("blog-post", { id: newPost.id });
        } else {
          navigate("blog", { showDrafts: true });
        }
      }
    });
  }

  document.querySelectorAll<HTMLElement>("[data-action='preview-blog']").forEach(el => {
    el.addEventListener("click", () => {
      const titleInput = document.getElementById("blog-title") as HTMLInputElement | null;
      const bodyInput = document.getElementById("blog-body") as HTMLTextAreaElement | null;
      const title = titleInput?.value || "Untitled";
      const body = bodyInput?.value || "";

      const modal = document.getElementById("modal-content");
      if (modal) {
        modal.innerHTML = `
          <div class="blog-preview">
            <div class="blog-preview-header">
              <h3>Preview</h3>
            </div>
            <article class="blog-post-content">
              <h1>${escapeHtml(title)}</h1>
              <div class="blog-post-body">
                ${renderMarkdown(body)}
              </div>
            </article>
          </div>
        `;
        showModal();
      }
    });
  });
}

function bindLearnTabs(): void {
  document.querySelectorAll<HTMLButtonElement>(".learn-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      const tabName = tab.dataset.learnTab;
      const container = tab.closest(".learn-content");
      if (!container || !tabName) return;

      container.querySelectorAll(".learn-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      container.querySelectorAll(".learn-tab-content").forEach(c => c.classList.remove("active"));
      const content = container.querySelector(`[data-learn-tab-content="${tabName}"]`);
      if (content) content.classList.add("active");
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".learn-content .btn-copy-code").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const codeBlock = btn.closest(".code-example-block")?.querySelector("code");
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.textContent || '');
        btn.textContent = "Copied!";
        setTimeout(() => btn.textContent = "Copy", 2000);
      }
    });
  });

  // Action bar tab switching (Demo / Code)
  document.querySelectorAll<HTMLButtonElement>("[data-action='switch-action-tab']").forEach(tab => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      const actionBar = tab.closest(".day-action-bar");
      if (!actionBar || !tabName) return;

      // Update tab states
      actionBar.querySelectorAll(".action-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      // Update panel visibility
      actionBar.querySelectorAll(".action-panel").forEach(p => p.classList.remove("active"));
      const panel = actionBar.querySelector(`[data-panel="${tabName}"]`);
      if (panel) panel.classList.add("active");
    });
  });

  // Code panel toggle (expand/collapse)
  document.querySelectorAll<HTMLButtonElement>("[data-action='toggle-code-panel']").forEach(btn => {
    btn.addEventListener("click", () => {
      const example = btn.closest(".code-panel-example");
      if (!example) return;

      const content = example.querySelector(".code-panel-content") as HTMLElement | null;
      const icon = btn.querySelector(".toggle-icon");
      if (!content) return;

      const isExpanded = example.classList.contains("expanded");
      if (isExpanded) {
        example.classList.remove("expanded");
        content.style.display = "none";
        if (icon) icon.innerHTML = "&#9654;";
      } else {
        example.classList.add("expanded");
        content.style.display = "block";
        if (icon) icon.innerHTML = "&#9660;";
      }
    });
  });
}

// ── Init ───────────────────────────────────────────
initCopyCode();
initModalEvents();
render();
