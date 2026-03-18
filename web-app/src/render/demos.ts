// ── Demos Page Render ────────────────────────────────

import { PHASES, DAYS } from '../data';

export function renderDemos(): string {
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
