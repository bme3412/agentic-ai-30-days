import type { Route, RouteParams, Day, JournalEntry, BlogPost, Learn, Lesson, Achievement, DayActivity } from './types';
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
    case "journal":   app.innerHTML = renderJournal();     break;
    case "day":       app.innerHTML = renderDayPage();     break;
    case "stats":     app.innerHTML = renderStats();       break;
    case "demos":     app.innerHTML = renderDemos();       break;
    case "blog":      app.innerHTML = renderBlogArchive(); break;
    case "blog-post": app.innerHTML = renderBlogPost();    break;
    case "blog-new":  app.innerHTML = renderBlogEditor();  break;
    case "blog-edit": app.innerHTML = renderBlogEditor();  break;
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
          ${dayData.demoUrl ? `
            <a href="${dayData.demoUrl}" target="_blank" class="demo-btn">
              <span>&#9654;</span> Try Demo
            </a>
          ` : ''}
        </div>
      </header>

      <!-- Main Content (Single Column, Readable) -->
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

// ── Simplified Learn Content (Reading-focused) ───────
function renderLearnContentSimple(learn: Learn, d: Day): string {
  const overview = learn.overview || {};

  return `
    <article class="learn-simple">
      ${overview.summary ? `<p class="lead">${overview.summary}</p>` : ''}

      ${overview.fullDescription ? `
        <div class="prose">
          ${formatLearnMarkdown(overview.fullDescription)}
        </div>
      ` : ''}

      ${learn.diagrams?.length ? `
        <div class="diagram-box">
          ${learn.diagrams.map(diag => `
            <figure>
              ${diag.title ? `<figcaption>${diag.title}</figcaption>` : ''}
              <pre>${escapeHtml(diag.content || '')}</pre>
            </figure>
          `).join('')}
        </div>
      ` : ''}

      ${learn.concepts?.length ? `
        <section class="concepts-section">
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

      ${learn.codeExamples?.length ? `
        <section class="code-section">
          <h2>Code Examples</h2>
          ${learn.codeExamples.map(ex => `
            <div class="code-block-simple">
              <div class="code-header-simple">
                <span>${ex.title || 'Example'}</span>
                <span class="code-lang-tag">${ex.language || 'python'}</span>
              </div>
              <pre><code>${escapeHtml(ex.code)}</code></pre>
              ${ex.explanation ? `<p class="code-note">${ex.explanation}</p>` : ''}
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${learn.keyTakeaways?.length ? `
        <section class="takeaways-section">
          <h2>Key Takeaways</h2>
          <ul>
            ${learn.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </section>
      ` : ''}

      ${learn.resources?.length ? `
        <section class="resources-section">
          <h2>Resources</h2>
          <div class="resources-list-simple">
            ${learn.resources.map(r => {
              const hasSummary = !!r.summaryPath;
              const resourceId = `resource-simple-${d.day}-${encodeURIComponent(r.url).slice(0, 20)}`;
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
                <pre class="diagram-pre">${escapeHtml(diag.content || '')}</pre>
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
                <pre class="code-pre"><code>${escapeHtml(ex.code)}</code></pre>
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
        ${resources.map(r => {
          const isCompleted = isResourceCompleted(day, r.url);
          const hasSummary = !!r.summaryPath;
        const resourceId = `resource-${day}-${encodeURIComponent(r.url).slice(0, 20)}`;
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
      content: lesson.diagram.ascii
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
              <pre class="diagram-ascii">${escapeHtml(diag.content || '')}</pre>
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
            <pre class="code-block"><code>${escapeHtml(ex.code)}</code></pre>
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

// ── Journal List ───────────────────────────────────
function renderJournal(): string {
  const entries = getAllEntries();
  const filter = routeParams.filter || "all";
  const filtered = filter === "all" ? entries : entries.filter(e => e.status === filter);

  let html = `
    <div class="journal-header anim-fade-up" style="--i:0">
      <h1>Journal</h1>
      <div class="journal-filters">
        <button class="filter-btn ${filter === "all" ? "active" : ""}" data-filter="all">All</button>
        <button class="filter-btn ${filter === "completed" ? "active" : ""}" data-filter="completed">Completed</button>
        <button class="filter-btn ${filter === "in-progress" ? "active" : ""}" data-filter="in-progress">In Progress</button>
      </div>
    </div>
  `;

  if (filtered.length === 0) {
    html += `
      <div class="empty-state anim-fade-up" style="--i:1">
        <div class="empty-icon">&#128221;</div>
        <h3>No journal entries yet</h3>
        <p>Journal entries will appear here as you progress through the challenge.</p>
      </div>
    `;
  } else {
    html += `<div class="journal-list">`;
    filtered.forEach((entry, i) => {
      const dayData = DAYS.find(d => d.day === entry.day);
      const lessons = entry.lessons ? entry.lessons.split("\n").filter(Boolean) : [];
      html += `
        <div class="journal-entry-card anim-slide-right" style="--i:${i + 1}" data-action="view-entry" data-day="${entry.day}">
          <h3>Day ${entry.day}: ${dayData ? dayData.title : "Unknown"}</h3>
          <div class="journal-meta">
            <span>${dayData ? dayData.partner : ""}</span>
            <span>${formatDate(entry.updatedAt)}</span>
            <span class="day-status ${entry.status}">${entry.status === "completed" ? "done" : "active"}</span>
          </div>
          <div class="journal-preview">${escapeHtml(entry.body || "")}</div>
          ${lessons.length ? `
            <div class="journal-lessons">
              ${lessons.slice(0, 4).map(l => `<span class="lesson-tag">${escapeHtml(l.trim())}</span>`).join("")}
              ${lessons.length > 4 ? `<span class="lesson-tag">+${lessons.length - 4} more</span>` : ""}
            </div>
          ` : ""}
        </div>
      `;
    });
    html += `</div>`;
  }

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
          <pre class="diagram-ascii">${escapeHtml(lesson.diagram.ascii)}</pre>
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

// ── Demos Page ─────────────────────────────────────
function renderDemos(): string {
  const daysWithDemos = DAYS.filter(d => d.demoUrl);
  const daysWithoutDemos = DAYS.filter(d => !d.demoUrl);

  // Group upcoming demos by phase
  const upcomingByPhase: Record<number, typeof DAYS> = {};
  daysWithoutDemos.forEach(d => {
    if (!upcomingByPhase[d.phase]) upcomingByPhase[d.phase] = [];
    upcomingByPhase[d.phase].push(d);
  });

  let html = `
    <div class="demos-page">
      <div class="demos-header anim-fade-up" style="--i:0">
        <h1>Interactive Demos</h1>
        <p class="demos-subtitle">Hands-on playgrounds to explore each day's concepts</p>
        <div class="demos-progress">
          <span class="demos-progress-bar" style="--progress: ${(daysWithDemos.length / 30) * 100}%"></span>
          <span class="demos-progress-text">${daysWithDemos.length} of 30 demos available</span>
        </div>
      </div>

      ${daysWithDemos.length > 0 ? `
        <section class="demos-available anim-fade-up" style="--i:1">
          <h2>Available Now</h2>
          <div class="demos-featured-grid">
            ${daysWithDemos.map(day => `
              <a href="${day.demoUrl}" target="_blank" class="demo-featured-card phase-${day.phase}">
                <div class="demo-featured-badge">Day ${day.day}</div>
                <h3>${day.title}</h3>
                <p class="demo-featured-concept">${day.concept || ''}</p>
                <span class="demo-featured-cta">
                  <span>&#9654;</span> Launch Demo
                </span>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <section class="demos-upcoming anim-fade-up" style="--i:2">
        <h2>Coming Soon</h2>
        <div class="demos-upcoming-list">
          ${PHASES.map(phase => {
            const phaseDays = upcomingByPhase[phase.id] || [];
            if (phaseDays.length === 0) return '';
            return `
              <div class="demos-phase-group">
                <div class="demos-phase-header phase-${phase.id}">
                  <span class="demos-phase-num">Phase ${phase.id}</span>
                  <span class="demos-phase-title">${phase.title}</span>
                </div>
                <div class="demos-phase-days">
                  ${phaseDays.map(d => `
                    <div class="demos-upcoming-day">
                      <span class="demos-day-num">Day ${d.day}</span>
                      <span class="demos-day-title">${d.title}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;

  return html;
}

// ── Stats Page ─────────────────────────────────────
function renderStats(): string {
  const completed = getCompletedReadingDays();
  const inProgress = getInProgressDays();
  const entries = getAllEntries();
  const totalLessons = entries.reduce((sum, e) =>
    sum + (e.lessons ? e.lessons.split("\n").filter(Boolean).length : 0), 0);
  const totalWords = entries.reduce((sum, e) =>
    sum + ((e.body || "").split(/\s+/).filter(Boolean).length), 0);
  const phaseColors = [
    "var(--phase-1)", "var(--phase-2)", "var(--phase-3)",
    "var(--phase-4)", "var(--phase-5)", "var(--phase-6)"
  ];

  const streak = getStreak();
  const achievements = getAchievements();
  const activityLog = getActivityLog();
  const streakAtRisk = isStreakAtRisk();
  const blogPosts = getAllBlogPosts({ status: "published" });

  let html = `
    <div class="stats-page">
      <h1 class="anim-fade-up" style="--i:0">Progress</h1>

      <!-- Streak Banner -->
      <div class="streak-banner anim-fade-up ${streakAtRisk ? 'at-risk' : ''} ${streak.current > 0 ? 'active' : ''}" style="--i:1">
        <div class="streak-flame">${streak.current > 0 ? '&#128293;' : '&#9898;'}</div>
        <div class="streak-info">
          <div class="streak-current">${streak.current}</div>
          <div class="streak-label">Day Streak</div>
        </div>
        <div class="streak-stats">
          <div class="streak-stat">
            <span class="streak-stat-value">${streak.longest}</span>
            <span class="streak-stat-label">Best</span>
          </div>
          <div class="streak-stat">
            <span class="streak-stat-value">${blogPosts.length}</span>
            <span class="streak-stat-label">Posts</span>
          </div>
        </div>
        ${streakAtRisk ? `
          <div class="streak-warning">
            <span>&#9888;</span> Don't break your streak! Log activity today.
          </div>
        ` : ''}
      </div>

      <div class="stats-marquee anim-fade-up" style="--i:2">
        <div class="marquee-cell">
          <div class="stat-value clr-accent">${completed.size}/30</div>
          <div class="stat-label">Days Done</div>
        </div>
        <div class="marquee-cell">
          <div class="stat-value clr-green">${totalLessons}</div>
          <div class="stat-label">Lessons</div>
        </div>
        <div class="marquee-cell">
          <div class="stat-value clr-amber">${totalWords.toLocaleString()}</div>
          <div class="stat-label">Words</div>
        </div>
        <div class="marquee-cell">
          <div class="stat-value clr-ink">${Math.round((completed.size / 30) * 100)}%</div>
          <div class="stat-label">Complete</div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="achievements-section anim-fade-up" style="--i:3">
        <h3>Achievements</h3>
        <div class="achievements-grid">
          ${achievements.map(a => `
            <div class="achievement-badge ${a.unlocked ? 'unlocked' : 'locked'}" title="${a.description}">
              <div class="achievement-icon">${getAchievementIcon(a.icon)}</div>
              <div class="achievement-name">${a.name}</div>
              ${a.unlocked ? `
                <div class="achievement-date">${formatDate(a.unlockedAt)}</div>
              ` : `
                <div class="achievement-locked-icon">&#128274;</div>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Activity Calendar -->
      <div class="activity-calendar-section anim-fade-up" style="--i:4">
        <h3>Activity Calendar</h3>
        <div class="activity-calendar">
          ${renderActivityCalendar(activityLog)}
        </div>
        <div class="calendar-legend">
          <span><span class="legend-dot empty"></span> No activity</span>
          <span><span class="legend-dot partial"></span> Some activity</span>
          <span><span class="legend-dot full"></span> Full day</span>
        </div>
      </div>

      <div class="heatmap-section anim-fade-up" style="--i:5">
        <h3>30-Day Heatmap</h3>
        <div class="heatmap">
          ${Array.from({ length: 30 }, (_, i) => {
            const day = i + 1;
            const cls = completed.has(day) ? "done" : inProgress.has(day) ? "today" : "empty";
            return `<div class="heatmap-cell ${cls}">${day}</div>`;
          }).join("")}
        </div>
      </div>

      <div class="phase-progress-section anim-fade-up" style="--i:6">
        <h3>By Phase</h3>
        <div class="phase-progress-list">
          ${PHASES.map((phase, pi) => {
            const phaseDays = DAYS.filter(d => d.phase === phase.id);
            const phaseDone = phaseDays.filter(d => completed.has(d.day)).length;
            const phasePct = Math.round((phaseDone / phaseDays.length) * 100);
            return `
              <div class="phase-progress-item anim-slide-right" style="--i:${pi + 7}">
                <h4><span class="phase-num ${phase.badge}">${phase.id}</span> ${phase.title}</h4>
                <div class="mini-progress">
                  <div class="mini-progress-fill" style="width:${phasePct}%;background:${phaseColors[pi]}"></div>
                </div>
                <div class="phase-progress-meta">
                  <span>${phaseDone} / ${phaseDays.length} days</span>
                  <span>${phasePct}%</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;

  return html;
}

function renderActivityCalendar(activityLog: Record<string, DayActivity>): string {
  const days = [];
  for (let i = 34; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const activity = activityLog[dateStr];
    const activityCount = activity
      ? (activity.journalEntry ? 1 : 0) + (activity.blogPost ? 1 : 0) + (activity.microPost ? 1 : 0)
      : 0;
    days.push({
      date: dateStr,
      dayOfMonth: date.getDate(),
      activityLevel: activityCount === 0 ? 'empty' : activityCount >= 2 ? 'full' : 'partial'
    });
  }

  return days.map(d => `
    <div class="calendar-cell ${d.activityLevel}" title="${d.date}">
      <span class="calendar-day">${d.dayOfMonth}</span>
    </div>
  `).join('');
}

function getAchievementIcon(iconName: string): string {
  const icons: Record<string, string> = {
    'rocket': '&#128640;',
    'pencil': '&#9998;',
    'star': '&#11088;',
    'flame': '&#128293;',
    'fire': '&#128165;',
    'mountain': '&#9968;',
    'flag': '&#127937;',
    'trophy': '&#127942;',
    'book': '&#128214;',
    'lightbulb': '&#128161;'
  };
  return icons[iconName] || '&#128204;';
}

// ── Blog Archive ────────────────────────────────────
function renderBlogArchive(): string {
  const posts = getAllBlogPosts({ status: "published" });
  const drafts = getAllBlogPosts({ status: "draft" });
  const tags = getAllBlogTags();
  const activeTag = routeParams.tag || null;
  const showDrafts = routeParams.showDrafts || false;

  const displayPosts = showDrafts ? drafts : (activeTag
    ? posts.filter(p => p.tags.includes(activeTag))
    : posts);

  let html = `
    <div class="blog-page">
      <div class="blog-header anim-fade-up" style="--i:0">
        <h1>Blog</h1>
        <p class="blog-subtitle">Thoughts, deep dives, and reflections on my agentic AI journey</p>
        <button class="btn btn-primary" data-action="new-blog-post">
          <span>+</span> New Post
        </button>
      </div>

      <div class="blog-filters anim-fade-up" style="--i:1">
        <div class="blog-tabs">
          <button class="blog-tab ${!showDrafts ? 'active' : ''}" data-action="blog-filter" data-show-drafts="false">
            Published (${posts.length})
          </button>
          <button class="blog-tab ${showDrafts ? 'active' : ''}" data-action="blog-filter" data-show-drafts="true">
            Drafts (${drafts.length})
          </button>
        </div>

        ${!showDrafts && tags.length ? `
          <div class="blog-tags">
            <button class="tag-filter ${!activeTag ? 'active' : ''}" data-action="blog-tag-filter" data-tag="">All</button>
            ${tags.map(t => `
              <button class="tag-filter ${activeTag === t ? 'active' : ''}" data-action="blog-tag-filter" data-tag="${t}">${t}</button>
            `).join('')}
          </div>
        ` : ''}
      </div>
  `;

  if (displayPosts.length === 0) {
    html += `
      <div class="empty-state anim-fade-up" style="--i:2">
        <div class="empty-icon">${showDrafts ? '&#128221;' : '&#128240;'}</div>
        <h3>${showDrafts ? 'No drafts yet' : 'No blog posts yet'}</h3>
        <p>${showDrafts ? 'Your draft posts will appear here.' : 'Click "New Post" to write your first article.'}</p>
      </div>
    `;
  } else {
    html += `<div class="blog-list">`;
    displayPosts.forEach((post, i) => {
      const linkedDay = post.linkedDay ? DAYS.find(d => d.day === post.linkedDay) : null;
      html += `
        <article class="blog-card anim-slide-right" style="--i:${i + 2}" data-action="view-blog" data-id="${post.id}">
          <div class="blog-card-meta">
            <span class="blog-date">${formatDate(post.publishedAt || post.createdAt)}</span>
            ${post.status === 'draft' ? '<span class="blog-draft-badge">Draft</span>' : ''}
            ${linkedDay ? `<span class="blog-linked-day">Day ${post.linkedDay}</span>` : ''}
          </div>
          <h2>${escapeHtml(post.title)}</h2>
          <p class="blog-excerpt">${escapeHtml(post.excerpt)}</p>
          ${post.tags.length ? `
            <div class="blog-card-tags">
              ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          ` : ''}
        </article>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

// ── Blog Post View ──────────────────────────────────
function renderBlogPost(): string {
  const postId = routeParams.id;
  if (!postId) return renderNotFound("Post not found");

  const post = getBlogPost(postId);

  if (!post) {
    return `
      <div class="blog-page">
        <div class="empty-state anim-fade-up">
          <div class="empty-icon">&#128533;</div>
          <h3>Post not found</h3>
          <p>This blog post doesn't exist or has been deleted.</p>
          <button class="btn btn-secondary" data-action="go-blog">Back to Blog</button>
        </div>
      </div>
    `;
  }

  const linkedDay = post.linkedDay ? DAYS.find(d => d.day === post.linkedDay) : null;

  return `
    <div class="blog-post-page anim-fade-up">
      <nav class="blog-breadcrumb">
        <a href="#" data-action="go-blog">Blog</a>
        <span class="breadcrumb-sep">/</span>
        <span>${escapeHtml(post.title.substring(0, 30))}${post.title.length > 30 ? '...' : ''}</span>
      </nav>

      <article class="blog-post-content">
        <header class="blog-post-header">
          <div class="blog-post-meta">
            <span class="blog-date">${formatDate(post.publishedAt || post.createdAt)}</span>
            ${post.status === 'draft' ? '<span class="blog-draft-badge">Draft</span>' : ''}
            ${linkedDay ? `
              <a href="#" class="blog-linked-day" data-action="go-day" data-day="${post.linkedDay}">
                Day ${post.linkedDay}: ${linkedDay.title}
              </a>
            ` : ''}
          </div>
          <h1>${escapeHtml(post.title)}</h1>
          ${post.tags.length ? `
            <div class="blog-post-tags">
              ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
            </div>
          ` : ''}
        </header>

        <div class="blog-post-body">
          ${renderMarkdown(post.body)}
        </div>

        <footer class="blog-post-footer">
          <button class="btn btn-secondary" data-action="edit-blog" data-id="${post.id}">
            <span>&#9998;</span> Edit Post
          </button>
          <button class="btn btn-danger" data-action="delete-blog" data-id="${post.id}">
            Delete
          </button>
        </footer>
      </article>
    </div>
  `;
}

// ── Blog Editor ─────────────────────────────────────
function renderBlogEditor(): string {
  const isEdit = currentRoute === "blog-edit";
  const post = isEdit && routeParams.id ? getBlogPost(routeParams.id) : null;
  const allTags = getAllBlogTags();

  if (isEdit && !post) {
    return `
      <div class="blog-page">
        <div class="empty-state anim-fade-up">
          <div class="empty-icon">&#128533;</div>
          <h3>Post not found</h3>
          <button class="btn btn-secondary" data-action="go-blog">Back to Blog</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="blog-editor-page anim-fade-up">
      <div class="blog-editor-header">
        <h1>${isEdit ? 'Edit Post' : 'New Post'}</h1>
        <button class="btn btn-secondary" data-action="cancel-blog">Cancel</button>
      </div>

      <form class="blog-editor-form" id="blog-form">
        <div class="form-group">
          <label for="blog-title">Title</label>
          <input type="text" id="blog-title" name="title" placeholder="Enter post title..."
                 value="${isEdit && post ? escapeHtml(post.title) : ''}" required>
        </div>

        <div class="form-group">
          <label for="blog-body">Content <span class="label-hint">(Markdown supported)</span></label>
          <textarea id="blog-body" name="body" rows="20" placeholder="Write your post here..."
                    required>${isEdit && post ? escapeHtml(post.body) : ''}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group form-group-half">
            <label for="blog-tags">Tags <span class="label-hint">(comma-separated)</span></label>
            <input type="text" id="blog-tags" name="tags" placeholder="e.g., reflection, week-1, technical"
                   value="${isEdit && post ? post.tags.join(', ') : ''}">
            ${allTags.length ? `
              <div class="existing-tags">
                <span class="existing-tags-label">Existing:</span>
                ${allTags.map(t => `<span class="tag clickable" data-action="add-tag" data-tag="${t}">${t}</span>`).join(' ')}
              </div>
            ` : ''}
          </div>

          <div class="form-group form-group-half">
            <label for="blog-linked-day">Link to Day <span class="label-hint">(optional)</span></label>
            <select id="blog-linked-day" name="linkedDay">
              <option value="">None</option>
              ${DAYS.map(d => {
                const selected = isEdit && post ? post.linkedDay === d.day : routeParams.linkedDay === d.day;
                return `
                  <option value="${d.day}" ${selected ? 'selected' : ''}>
                    Day ${d.day}: ${d.title}
                  </option>
                `;
              }).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="blog-status">Status</label>
          <div class="status-toggle">
            <label class="status-option">
              <input type="radio" name="status" value="draft" ${!isEdit || (post && post.status === 'draft') ? 'checked' : ''}>
              <span class="status-label">Draft</span>
            </label>
            <label class="status-option">
              <input type="radio" name="status" value="published" ${isEdit && post && post.status === 'published' ? 'checked' : ''}>
              <span class="status-label">Published</span>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" data-action="preview-blog">
            Preview
          </button>
          <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Update' : 'Save'} Post
          </button>
        </div>
      </form>
    </div>
  `;
}

// ── Markdown Renderer ────────────────────────────────
function renderMarkdown(text: string, simple = false): string {
  if (!text) return '';

  if (simple) {
    let html = escapeHtml(text)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .split(/\n\n+/)
      .map(para => {
        para = para.trim();
        if (!para) return '';
        if (para.startsWith('<h') || para.startsWith('<pre') || para.startsWith('<li>')) {
          if (para.includes('<li>')) return `<ul>${para}</ul>`;
          return para;
        }
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
    return html;
  }

  return renderMarkdownFull(text);
}

function renderMarkdownFull(text: string): string {
  const codeBlocks: Array<{ lang: string; code: string }> = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push({ lang: lang || 'text', code: code.trim() });
    return placeholder;
  });

  const tables: Array<{ header: string; separator: string; body: string }> = [];
  text = text.replace(/\n(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/g, (match, header, separator, body) => {
    const placeholder = `__TABLE_${tables.length}__`;
    tables.push({ header, separator, body: body.trim() });
    return '\n' + placeholder + '\n';
  });

  let html = escapeHtml(text);

  codeBlocks.forEach((block, i) => {
    const escapedCode = escapeHtml(block.code);
    html = html.replace(`__CODE_BLOCK_${i}__`,
      `<pre class="code-block" data-lang="${block.lang}"><code>${escapedCode}</code></pre>`);
  });

  tables.forEach((table, i) => {
    const headerCells = table.header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const bodyRows = table.body.split('\n').filter(r => r.trim()).map(row => {
      const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    html = html.replace(`__TABLE_${i}__`,
      `<table class="md-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`);
  });

  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/^---+$/gm, '<hr>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = false;
        listType = null;
      }
      continue;
    }

    const ulMatch = trimmed.match(/^[-*] (.+)$/);
    const olMatch = trimmed.match(/^\d+\. (.+)$/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList && listType) result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = true;
        listType = 'ul';
      }
      listItems.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList && listType) result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = true;
        listType = 'ol';
      }
      listItems.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inList && listType) {
        result.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = [];
        inList = false;
        listType = null;
      }

      if (trimmed.startsWith('<h') || trimmed.startsWith('<hr') ||
          trimmed.startsWith('<pre') || trimmed.startsWith('<table')) {
        result.push(trimmed);
      } else {
        result.push(`<p>${trimmed}</p>`);
      }
    }
  }

  if (inList && listType) {
    result.push(`<${listType}>${listItems.join('')}</${listType}>`);
  }

  return result.join('\n');
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

// ── Event Delegation ───────────────────────────────
function bindEvents(): void {
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
      const type = el.dataset.type as 'concept' | 'exercise' | 'takeaway' | 'overview';
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

  // Section navigation
  document.querySelectorAll<HTMLAnchorElement>(".section-nav-item").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = el.getAttribute("href")?.substring(1);
      if (!sectionId) return;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        document.querySelectorAll(".section-nav-item").forEach(n => n.classList.remove("active"));
        el.classList.add("active");
      }
    });
  });

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
}

// ── Utilities ──────────────────────────────────────
function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Global function for inline onclick
(window as unknown as { copyCode: (btn: HTMLButtonElement) => void }).copyCode = function(btn: HTMLButtonElement): void {
  const codeBlock = btn.closest('.code-block-v2')?.querySelector('code');
  if (codeBlock) {
    navigator.clipboard.writeText(codeBlock.textContent || '');
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = "Copy"; }, 2000);
  }
};

// ── Init ───────────────────────────────────────────
render();
