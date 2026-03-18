// ── Blog Render Functions ────────────────────────────

import type { Route, RouteParams } from '../types';
import { DAYS, getAllBlogPosts, getAllBlogTags, getBlogPost } from '../data';
import { escapeHtml, formatDate, renderMarkdown } from '../utils';

export function renderBlogArchive(routeParams: RouteParams): string {
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

export function renderBlogPost(routeParams: RouteParams, renderNotFound: (msg: string) => string): string {
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

export function renderBlogEditor(currentRoute: Route, routeParams: RouteParams): string {
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
