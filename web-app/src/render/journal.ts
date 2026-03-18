// ── Journal Render ───────────────────────────────────

import type { RouteParams } from '../types';
import { DAYS, getAllEntries } from '../data';
import { escapeHtml, formatDate } from '../utils';

export function renderJournal(routeParams: RouteParams): string {
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
