// ── Stats Page Render ────────────────────────────────

import type { DayActivity } from '../types';
import {
  PHASES,
  DAYS,
  getAllEntries,
  getInProgressDays,
  getStreak,
  getAchievements,
  getActivityLog,
  isStreakAtRisk,
  getAllBlogPosts,
  getCompletedReadingDays,
} from '../data';
import { formatDate } from '../utils';

export function renderStats(): string {
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
