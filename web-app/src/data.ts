import type {
  Phase,
  Day,
  JournalEntry,
  BlogPost,
  BlogData,
  BlogFilterOptions,
  Achievement,
  GamificationData,
  Streak,
  DayActivity,
  GamificationStats,
  ReadingProgressData,
  CompletedResource,
  SectionProgressData,
  SectionItem,
  SectionProgressCounts,
  DayOverallProgress,
  DayCompletion,
  DayCompletionRequirement,
  DayCompletionCheck,
  MarkDayCompleteResult,
  LocalResource,
  MicroPost,
} from './types';

// ══════════════════════════════════════════════════════════════
// PHASE & DAY DATA (now imported from modular files)
// ══════════════════════════════════════════════════════════════

// Import from modular data files
import { PHASES } from './data/phases';
import { DAYS } from './data/days';

// Re-export for backward compatibility
export { PHASES, DAYS };

// ══════════════════════════════════════════════════════════════
// JOURNAL STORAGE
// ══════════════════════════════════════════════════════════════

const STORAGE_KEY = "genai30_journal";

export function loadJournal(): Record<number, JournalEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveJournal(entries: Record<number, JournalEntry>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getEntry(day: number): JournalEntry | null {
  return loadJournal()[day] || null;
}

export function saveEntry(day: number, entry: Partial<JournalEntry>): void {
  const all = loadJournal();
  const wasCompleted = all[day]?.status === "completed";
  const isNowCompleted = entry.status === "completed";

  all[day] = { ...entry, day, updatedAt: new Date().toISOString() } as JournalEntry;
  saveJournal(all);

  // Record activity for gamification when completing an entry
  if (isNowCompleted && !wasCompleted) {
    recordActivity("journalEntry");
  }
}

export function deleteEntry(day: number): void {
  const all = loadJournal();
  delete all[day];
  saveJournal(all);
}

export function getAllEntries(): JournalEntry[] {
  const all = loadJournal();
  return Object.values(all).sort((a, b) => a.day - b.day);
}

export function getCompletedDays(): Set<number> {
  return new Set(getAllEntries().filter(e => e.status === "completed").map(e => e.day));
}

export function getInProgressDays(): Set<number> {
  // A day is "in progress" if it has ANY activity but is NOT reading-complete
  const readingComplete = getCompletedReadingDays();
  const inProgressDays = new Set<number>();

  // Check all 30 days
  for (let day = 1; day <= 30; day++) {
    // Skip if already reading-complete
    if (readingComplete.has(day)) continue;

    // Check for any progress indicators:
    // 1. Section items completed (concepts, takeaways)
    const sectionProgress = getSectionProgressForDay(day, 'concept').length > 0 ||
                           getSectionProgressForDay(day, 'takeaway').length > 0;

    // 2. External resources completed
    const resourceProgress = getCompletedResourcesForDay(day).length > 0;

    // 3. Local resources viewed
    const localResourceProgress = getLocalResourcesForDay(day).some(r =>
      isLocalResourceCompleted(day, r.id)
    );

    // 4. Journal entry has content
    const entry = getEntry(day);
    const hasJournalContent = entry && (entry.body?.trim() || entry.microPost?.content);

    // 5. Demo completed (for days with demos)
    const demoProgress = isDemoCompleted(day);

    if (sectionProgress || resourceProgress || localResourceProgress || hasJournalContent || demoProgress) {
      inProgressDays.add(day);
    }
  }

  return inProgressDays;
}

// ══════════════════════════════════════════════════════════════
// BLOG SYSTEM
// ══════════════════════════════════════════════════════════════

const BLOG_STORAGE_KEY = "genai30_blog";

// ── Seed blog posts ──────────────────────────────────────────
// These are pre-written posts that get injected into localStorage
// on first load (or when seedVersion is bumped). Users can edit
// or delete them like any other post.

const SEED_POSTS_VERSION = 1;

interface SeedPost {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  tags: string[];
  linkedDay: number | null;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

const SEED_BLOG_POSTS: SeedPost[] = [
  {
    id: "seed-post-day-23",
    slug: "day-23-browser-automation-agents-playwright",
    title: "Day 23: Building Browser Automation Agents with Playwright",
    linkedDay: 23,
    tags: ["browser", "automation", "playwright", "reflection"],
    status: "published",
    createdAt: "2026-03-25T09:00:00.000Z",
    updatedAt: "2026-03-25T09:00:00.000Z",
    publishedAt: "2026-03-25T09:00:00.000Z",
    excerpt: "Day 23 was a breakthrough moment—turning an AI agent loose on a real browser and watching it navigate, fill forms, and extract data without any hand-holding.",
    body: `# Day 23: Browser Automation Agents with Playwright

Today's topic hit differently. We've spent the last few weeks giving agents *tools*—APIs, function calls, MCP servers—but those tools all assume the world has a clean, well-designed interface. Browser automation agents are for the real world: the ancient government portal, the SaaS dashboard that predates REST APIs, the competitor pricing page that absolutely does not want you there.

## What Clicked for Me

The mental model that made everything snap into place: **the browser is just another tool interface, but it's the universal one**. Every system that a human uses through a web browser is now, in principle, accessible to an agent. That's enormous.

The stack is surprisingly clean once you see it:

1. **Playwright** handles the mechanical layer—open a real Chromium browser, click things, fill inputs, take screenshots
2. **DOM extraction** translates the live page into something an LLM can reason about (ARIA tree, visible text, interactive elements)
3. **LLM reasoning** looks at the page state + goal and decides the next action
4. **Verify & loop** — after each action, check the outcome and repeat

## The Element Selection Hierarchy

Before today I would have reached for CSS selectors first. Now I know better. The priority order matters:

- **ARIA roles + labels first**: \`get_by_role("button", name="Add to cart")\` survives redesigns because it's semantic, not positional
- **Test IDs**: incredibly stable if the app has them (\`data-testid\`)
- **Visible text**: readable but fragile if copy changes
- **CSS selectors**: fine for IDs, treacherous for class names
- **Visual grounding**: the escape hatch—when nothing else works, screenshot the page and ask a multimodal model "where is X?"

That last one is what really opened my eyes. You can click on things in a PDF viewer, a Figma canvas, or any iframe-embedded widget that the DOM doesn't expose—because you're literally looking at a picture of the page.

## Practical Takeaways

**Wait for conditions, not clocks.** I've written so many \`time.sleep(2)\` lines in my life. Never again. \`page.wait_for_selector(".results-grid")\` is both faster (proceeds immediately when ready) and more reliable (works on any connection speed).

**State tracking saves debugging time.** Treating the workflow as a state machine—\`step: "navigate"\` → \`step: "fill_form"\` → \`step: "verify_submission"\`—means that when something fails, the error tells you exactly where you were.

**Human-in-the-loop before irreversible actions.** An agent that places an order or submits a form on your behalf needs a confirmation gate. The cost of that pause is low; the cost of the agent clicking "Place Order" on a $500 item you didn't intend to buy is high.

## What I'm Going to Build

I've been manually pulling data from a web portal at work every Monday morning—logging in, navigating three menus, selecting a date range, exporting a CSV. It takes 15 minutes and I hate it. 

After today, I'm confident I can replace that with a browser agent that runs overnight Sunday and drops the file in my inbox before I wake up. The portal has reasonable ARIA labels (it's a government site, actually), and the workflow is deterministic. Perfect candidate.

## The Bigger Picture

Combine browser agents with yesterday's tool-calling and MCP work and you start to see the full picture: agents can now reach *everything*. Structured APIs via function calls, local files and databases via MCP, and any web interface via browser automation. The remaining blockers are mostly human ones—permissions, trust, oversight—not technical ones.

That's exciting and a little unsettling in equal measure.

---

*Day 23/30 complete. Tomorrow: Coding Agents & Sandboxed Execution (Day 24). Looking forward to seeing how agents write and run their own code safely.*`
  }
];

export function loadBlogData(): BlogData {
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    const data: BlogData = raw ? JSON.parse(raw) : { posts: {}, tags: [], metadata: {} };

    // Seed default posts on first load or when seed version is bumped
    const currentVersion = (data.metadata.seedVersion as number) || 0;
    if (currentVersion < SEED_POSTS_VERSION) {
      for (const seed of SEED_BLOG_POSTS) {
        // Only inject if not already present (preserves user edits/deletions)
        if (!data.posts[seed.id]) {
          data.posts[seed.id] = seed;
          for (const tag of seed.tags) {
            if (!data.tags.includes(tag)) data.tags.push(tag);
          }
        }
      }
      data.metadata.seedVersion = SEED_POSTS_VERSION;
      localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch {
    return { posts: {}, tags: [], metadata: {} };
  }
}

export function saveBlogData(data: BlogData): void {
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(data));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60);
}

export function generateExcerpt(body: string, maxLength = 160): string {
  const plain = body.replace(/[#*_`\[\]]/g, '').trim();
  return plain.length > maxLength
    ? plain.substring(0, maxLength).trim() + '...'
    : plain;
}

export function createBlogPost(post: {
  title: string;
  body: string;
  excerpt?: string;
  tags?: string[];
  linkedDay?: number | null;
  status?: 'draft' | 'published';
}): BlogPost {
  const data = loadBlogData();
  const id = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const slug = generateSlug(post.title);
  const now = new Date().toISOString();

  data.posts[id] = {
    id,
    slug,
    title: post.title,
    body: post.body,
    excerpt: post.excerpt || generateExcerpt(post.body),
    tags: post.tags || [],
    linkedDay: post.linkedDay || null,
    status: post.status || "draft",
    createdAt: now,
    updatedAt: now,
    publishedAt: post.status === "published" ? now : null
  };

  // Update tags list
  (post.tags || []).forEach(tag => {
    if (!data.tags.includes(tag)) data.tags.push(tag);
  });

  saveBlogData(data);
  if (post.status === "published") {
    recordActivity("blogPost");
  }
  return data.posts[id];
}

export function updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
  const data = loadBlogData();
  if (!data.posts[id]) return null;

  const wasPublished = data.posts[id].status === "published";
  data.posts[id] = {
    ...data.posts[id],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Regenerate excerpt if body changed
  if (updates.body && !updates.excerpt) {
    data.posts[id].excerpt = generateExcerpt(updates.body);
  }

  // Regenerate slug if title changed
  if (updates.title) {
    data.posts[id].slug = generateSlug(updates.title);
  }

  // Set publishedAt if transitioning to published
  if (!wasPublished && updates.status === "published") {
    data.posts[id].publishedAt = new Date().toISOString();
    recordActivity("blogPost");
  }

  // Update tags list
  if (updates.tags) {
    updates.tags.forEach(tag => {
      if (!data.tags.includes(tag)) data.tags.push(tag);
    });
  }

  saveBlogData(data);
  return data.posts[id];
}

export function deleteBlogPost(id: string): void {
  const data = loadBlogData();
  delete data.posts[id];
  saveBlogData(data);
}

export function getBlogPost(id: string): BlogPost | null {
  return loadBlogData().posts[id] || null;
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = Object.values(loadBlogData().posts);
  return posts.find(p => p.slug === slug) || null;
}

export function getAllBlogPosts(options: BlogFilterOptions = {}): BlogPost[] {
  const data = loadBlogData();
  let posts = Object.values(data.posts);

  // Filter by status
  if (options.status) {
    posts = posts.filter(p => p.status === options.status);
  }

  // Filter by tag
  if (options.tag) {
    const tag = options.tag;
    posts = posts.filter(p => p.tags.includes(tag));
  }

  // Filter by linked day
  if (options.linkedDay) {
    posts = posts.filter(p => p.linkedDay === options.linkedDay);
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return posts;
}

export function getAllBlogTags(): string[] {
  return loadBlogData().tags;
}

// ══════════════════════════════════════════════════════════════
// MICRO-POSTS (Quick Updates on Journal Entries)
// ══════════════════════════════════════════════════════════════

export function saveMicroPost(day: number, content: string, mood: string | null = null): void {
  const all = loadJournal();
  if (!all[day]) {
    all[day] = { day, status: "pending", updatedAt: new Date().toISOString() };
  }

  all[day].microPost = {
    content,
    mood,
    createdAt: new Date().toISOString()
  };
  all[day].updatedAt = new Date().toISOString();

  saveJournal(all);
  recordActivity("microPost");
}

export function getMicroPost(day: number): MicroPost | null {
  const entry = getEntry(day);
  return entry?.microPost || null;
}

export function getAllMicroPosts(): (MicroPost & { day: number })[] {
  const entries = getAllEntries();
  return entries
    .filter(e => e.microPost)
    .map(e => ({ day: e.day, ...e.microPost! }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDaysWithMicroPosts(): Set<number> {
  return new Set(getAllMicroPosts().map(mp => mp.day));
}

// ══════════════════════════════════════════════════════════════
// GAMIFICATION: Streaks & Achievements
// ══════════════════════════════════════════════════════════════

const GAMIFICATION_KEY = "genai30_gamification";

export const ACHIEVEMENTS: Achievement[] = [
  // Milestones
  { id: "first-entry", name: "First Steps", description: "Write your first journal entry", icon: "rocket", category: "milestones" },
  { id: "first-blog", name: "Blogger", description: "Publish your first blog post", icon: "pencil", category: "milestones" },
  { id: "five-entries", name: "Getting Started", description: "Complete 5 journal entries", icon: "star", category: "milestones" },

  // Streaks
  { id: "week-warrior", name: "Week Warrior", description: "Maintain a 7-day streak", icon: "flame", category: "streaks" },
  { id: "fortnight-focus", name: "Fortnight Focus", description: "Maintain a 14-day streak", icon: "fire", category: "streaks" },
  { id: "three-week-trek", name: "Three Week Trek", description: "Maintain a 21-day streak", icon: "mountain", category: "streaks" },

  // Completion
  { id: "halfway-there", name: "Halfway There", description: "Complete 15 days", icon: "flag", category: "completion" },
  { id: "completionist", name: "Completionist", description: "Complete all 30 days", icon: "trophy", category: "completion" },

  // Content
  { id: "prolific-writer", name: "Prolific Writer", description: "Write 5,000+ words total", icon: "book", category: "content" },
  { id: "thought-leader", name: "Thought Leader", description: "Publish 5 blog posts", icon: "lightbulb", category: "content" },
];

export function loadGamificationData(): GamificationData {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    return raw ? JSON.parse(raw) : getDefaultGamificationData();
  } catch {
    return getDefaultGamificationData();
  }
}

function getDefaultGamificationData(): GamificationData {
  return {
    streak: { current: 0, longest: 0, lastActivityDate: null, startDate: null },
    activityLog: {},
    achievements: {},
    stats: { totalEntries: 0, totalBlogPosts: 0, totalMicroPosts: 0, totalWords: 0 }
  };
}

export function saveGamificationData(data: GamificationData): void {
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(data));
}

function getYesterday(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function updateStreak(data: GamificationData, today: string): void {
  const yesterday = getYesterday(today);

  if (!data.streak.lastActivityDate) {
    // First ever activity
    data.streak.current = 1;
    data.streak.longest = 1;
    data.streak.startDate = today;
  } else if (data.streak.lastActivityDate === today) {
    // Already recorded today, no change
    return;
  } else if (data.streak.lastActivityDate === yesterday) {
    // Consecutive day - extend streak
    data.streak.current += 1;
    if (data.streak.current > data.streak.longest) {
      data.streak.longest = data.streak.current;
    }
  } else {
    // Streak broken - reset
    data.streak.current = 1;
    data.streak.startDate = today;
  }

  data.streak.lastActivityDate = today;
}

function recalculateStats(data: GamificationData): void {
  const entries = getAllEntries();
  const blogPosts = getAllBlogPosts({ status: "published" });

  data.stats.totalEntries = entries.filter(e => e.status === "completed").length;
  data.stats.totalBlogPosts = blogPosts.length;
  data.stats.totalMicroPosts = entries.filter(e => e.microPost).length;
  data.stats.totalWords = entries.reduce((sum, e) =>
    sum + ((e.body || "").split(/\s+/).filter(Boolean).length), 0
  ) + blogPosts.reduce((sum, p) =>
    sum + (p.body.split(/\s+/).filter(Boolean).length), 0
  );
}

function checkAchievements(data: GamificationData): void {
  const stats = data.stats;
  const streak = data.streak;

  ACHIEVEMENTS.forEach(achievement => {
    if (data.achievements[achievement.id]?.unlockedAt) return; // Already unlocked

    let unlocked = false;

    switch (achievement.id) {
      case "first-entry":
        unlocked = stats.totalEntries >= 1;
        break;
      case "first-blog":
        unlocked = stats.totalBlogPosts >= 1;
        break;
      case "five-entries":
        unlocked = stats.totalEntries >= 5;
        break;
      case "week-warrior":
        unlocked = streak.current >= 7 || streak.longest >= 7;
        break;
      case "fortnight-focus":
        unlocked = streak.current >= 14 || streak.longest >= 14;
        break;
      case "three-week-trek":
        unlocked = streak.current >= 21 || streak.longest >= 21;
        break;
      case "halfway-there":
        unlocked = stats.totalEntries >= 15;
        break;
      case "completionist":
        unlocked = stats.totalEntries >= 30;
        break;
      case "prolific-writer":
        unlocked = stats.totalWords >= 5000;
        break;
      case "thought-leader":
        unlocked = stats.totalBlogPosts >= 5;
        break;
    }

    if (unlocked) {
      data.achievements[achievement.id] = {
        ...achievement,
        unlockedAt: new Date().toISOString()
      };
    }
  });
}

export function recordActivity(type: "journalEntry" | "blogPost" | "microPost" | "resourceCompleted" | "sectionCompleted"): void {
  const data = loadGamificationData();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Initialize today's activity if needed
  if (!data.activityLog[today]) {
    data.activityLog[today] = { journalEntry: false, blogPost: false, microPost: false };
  }

  // Record the specific activity type
  if (type === "journalEntry") data.activityLog[today].journalEntry = true;
  if (type === "blogPost") data.activityLog[today].blogPost = true;
  if (type === "microPost") data.activityLog[today].microPost = true;

  // Update streak
  updateStreak(data, today);

  // Update stats
  recalculateStats(data);

  // Check for new achievements
  checkAchievements(data);

  saveGamificationData(data);
}

export function getStreak(): Streak {
  return loadGamificationData().streak;
}

export function getActivityLog(): Record<string, DayActivity> {
  return loadGamificationData().activityLog;
}

export function getAchievements(): (Achievement & { unlocked: boolean; unlockedAt: string | null })[] {
  const data = loadGamificationData();
  return ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: !!data.achievements[a.id]?.unlockedAt,
    unlockedAt: data.achievements[a.id]?.unlockedAt || null
  }));
}

export function getGamificationStats(): GamificationStats {
  return loadGamificationData().stats;
}

export function isStreakAtRisk(): boolean {
  const data = loadGamificationData();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = getYesterday(today);

  return data.streak.current > 0 &&
         data.streak.lastActivityDate === yesterday &&
         !data.activityLog[today];
}

export function getNewlyUnlockedAchievements(): Achievement[] {
  // Returns achievements unlocked in the last check (useful for notifications)
  const data = loadGamificationData();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  return ACHIEVEMENTS.filter(a => {
    const unlocked = data.achievements[a.id];
    return unlocked && unlocked.unlockedAt > fiveMinutesAgo;
  });
}

// ═══════════════════════════════════════════════════════════════
// READING PROGRESS TRACKING
// ═══════════════════════════════════════════════════════════════

const READING_PROGRESS_KEY = "genai30_reading_progress";

export function loadReadingProgress(): ReadingProgressData {
  try {
    const data = localStorage.getItem(READING_PROGRESS_KEY);
    return data ? JSON.parse(data) : { completed: {} };
  } catch (e) {
    console.error("Error loading reading progress:", e);
    return { completed: {} };
  }
}

export function saveReadingProgress(data: ReadingProgressData): void {
  try {
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving reading progress:", e);
  }
}

export function generateResourceId(day: number, resourceUrl: string): string {
  // Create a unique ID for each resource based on day and URL
  return `day${day}_${btoa(resourceUrl).slice(0, 20)}`;
}

export function toggleResourceCompletion(day: number, resourceUrl: string, resourceTitle: string): boolean {
  const data = loadReadingProgress();
  const resourceId = generateResourceId(day, resourceUrl);

  if (data.completed[resourceId]) {
    // Unmark as completed
    delete data.completed[resourceId];
  } else {
    // Mark as completed
    data.completed[resourceId] = {
      completedAt: new Date().toISOString(),
      title: resourceTitle,
      day: day
    };
    // Record activity for gamification
    recordActivity("resourceCompleted");
  }

  saveReadingProgress(data);
  return !data.completed[resourceId]; // Return whether it was just un-completed
}

export function isResourceCompleted(day: number, resourceUrl: string): boolean {
  const data = loadReadingProgress();
  const resourceId = generateResourceId(day, resourceUrl);
  return !!data.completed[resourceId];
}

// For local resources (markdown files in /data/day-N/)
export function toggleLocalResourceCompletion(day: number, resourceId: string, resourceTitle: string): boolean {
  const data = loadReadingProgress();
  const fullId = `local_${day}_${resourceId}`;

  if (data.completed[fullId]) {
    delete data.completed[fullId];
  } else {
    data.completed[fullId] = {
      completedAt: new Date().toISOString(),
      title: resourceTitle,
      resourceId: resourceId,
      isLocal: true,
      day: day
    };
    recordActivity("resourceCompleted");
  }

  saveReadingProgress(data);
  return !data.completed[fullId];
}

export function isLocalResourceCompleted(day: number, resourceId: string): boolean {
  const data = loadReadingProgress();
  const fullId = `local_${day}_${resourceId}`;
  return !!data.completed[fullId];
}

export function getCompletedLocalResourcesForDay(day: number): CompletedResource[] {
  const data = loadReadingProgress();
  return Object.entries(data.completed)
    .filter(([, info]) => info.day === day && info.isLocal === true)
    .map(([, info]) => info);
}

export function getCompletedResourcesForDay(day: number): CompletedResource[] {
  const data = loadReadingProgress();
  return Object.entries(data.completed)
    .filter(([, info]) => info.day === day)
    .map(([, info]) => info);
}

export function getAllCompletedResources(): (CompletedResource & { id: string })[] {
  const data = loadReadingProgress();
  return Object.entries(data.completed).map(([id, info]) => ({
    id,
    ...info
  }));
}

export function getReadingProgressStats(): {
  totalCompleted: number;
  byDay: Record<number, number>;
  recentlyCompleted: CompletedResource[];
} {
  const data = loadReadingProgress();
  const completed = Object.values(data.completed);
  const byDay: Record<number, number> = {};

  completed.forEach(r => {
    byDay[r.day] = (byDay[r.day] || 0) + 1;
  });

  return {
    totalCompleted: completed.length,
    byDay: byDay,
    recentlyCompleted: completed
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5)
  };
}

// ═══════════════════════════════════════════════════════════════
// SECTION PROGRESS TRACKING (Concepts, Key Takeaways)
// ═══════════════════════════════════════════════════════════════

const SECTION_PROGRESS_KEY = "genai30_section_progress";

export function loadSectionProgress(): SectionProgressData {
  try {
    const data = localStorage.getItem(SECTION_PROGRESS_KEY);
    return data ? JSON.parse(data) : { items: {} };
  } catch (e) {
    console.error("Error loading section progress:", e);
    return { items: {} };
  }
}

export function saveSectionProgress(data: SectionProgressData): void {
  try {
    localStorage.setItem(SECTION_PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving section progress:", e);
  }
}

export function generateSectionItemId(day: number, type: string, index: number): string {
  // type: 'concept', 'takeaway', 'overview'
  return `day${day}_${type}_${index}`;
}

export function toggleSectionItem(day: number, type: SectionItem['type'], index: number, title = ''): boolean {
  const data = loadSectionProgress();
  const itemId = generateSectionItemId(day, type, index);

  if (data.items[itemId]) {
    delete data.items[itemId];
  } else {
    data.items[itemId] = {
      completedAt: new Date().toISOString(),
      day: day,
      type: type,
      index: index,
      title: title
    };
    // Record activity for gamification
    recordActivity("sectionCompleted");
  }

  saveSectionProgress(data);
  return !!data.items[itemId];
}

export function isSectionItemCompleted(day: number, type: string, index: number): boolean {
  const data = loadSectionProgress();
  const itemId = generateSectionItemId(day, type, index);
  return !!data.items[itemId];
}

export function getSectionProgressForDay(day: number, type: string | null = null): SectionItem[] {
  const data = loadSectionProgress();
  return Object.entries(data.items)
    .filter(([, info]) => info.day === day && (type === null || info.type === type))
    .map(([, info]) => info);
}

export function getSectionProgressCounts(day: number, type: string, total: number): SectionProgressCounts {
  const completed = getSectionProgressForDay(day, type).length;
  return {
    completed,
    total,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

export function getDayOverallProgress(day: number): DayOverallProgress {
  // Get all completed items for a day across all types
  const data = loadSectionProgress();
  const readingData = loadReadingProgress();

  const sectionItems = Object.values(data.items).filter(i => i.day === day);
  const resourceItems = Object.values(readingData.completed).filter(r => r.day === day);

  return {
    concepts: sectionItems.filter(i => i.type === 'concept').length,
    takeaways: sectionItems.filter(i => i.type === 'takeaway').length,
    resources: resourceItems.length,
    total: sectionItems.length + resourceItems.length
  };
}

// ═══════════════════════════════════════════════════════════════
// LOCAL RESOURCES (Markdown files in /data/day-N/)
// ═══════════════════════════════════════════════════════════════

export function getLocalResourcesForDay(day: number): LocalResource[] {
  const dayData = DAYS.find(d => d.day === day);
  if (!dayData) return [];

  // Check both lesson.localResources and learn.localResources
  const lessonResources = dayData.lesson?.localResources || [];
  const learnResources = dayData.learn?.localResources || [];

  return [...lessonResources, ...learnResources];
}

export function getLocalResource(day: number, resourceId: string): LocalResource | null {
  const resources = getLocalResourcesForDay(day);
  return resources.find(r => r.id === resourceId) || null;
}

export async function fetchLocalResource(filePath: string): Promise<string | null> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch resource: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching local resource:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// DAY COMPLETION TRACKING
// ═══════════════════════════════════════════════════════════════

const DAY_COMPLETION_KEY = "genai30_day_completions";

export function loadDayCompletions(): Record<number, DayCompletion> {
  try {
    const raw = localStorage.getItem(DAY_COMPLETION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDayCompletions(data: Record<number, DayCompletion>): void {
  localStorage.setItem(DAY_COMPLETION_KEY, JSON.stringify(data));
}

/**
 * Check if a day meets completion requirements:
 * - All local resources completed (reading materials)
 * - Has a blog post linked to this day
 * - Demo completed (if day has a demo)
 */
export function checkDayCompletionRequirements(day: number): DayCompletionCheck {
  const dayData = DAYS.find(d => d.day === day);
  if (!dayData) return { canComplete: false, requirements: [] };

  const requirements: DayCompletionRequirement[] = [];
  let allMet = true;

  // 1. Check local resources (study materials)
  const localResources = getLocalResourcesForDay(day);
  const completedLocalCount = localResources.filter(r => isLocalResourceCompleted(day, r.id)).length;
  const allLocalResourcesComplete = localResources.length === 0 ||
    completedLocalCount === localResources.length;

  if (localResources.length > 0) {
    requirements.push({
      label: "Study Materials",
      completed: allLocalResourcesComplete,
      count: `${completedLocalCount}/${localResources.length}`,
      required: true
    });

    if (!allLocalResourcesComplete) {
      allMet = false;
    }
  }

  // 2. External resources are optional (not required for completion)

  // 3. Check blog post linked to this day
  const blogPosts = getAllBlogPosts({ linkedDay: day, status: 'published' });
  const hasBlogPost = blogPosts.length > 0;

  requirements.push({
    label: "Blog Post",
    completed: hasBlogPost,
    count: hasBlogPost ? "1" : "0",
    required: true
  });

  if (!hasBlogPost) {
    allMet = false;
  }

  // 4. Check demo completion (only if day has a demo)
  const hasDemo = !!dayData.demoUrl;
  const demoCompleted = hasDemo ? isDemoCompleted(day) : true;

  if (hasDemo) {
    requirements.push({
      label: "Demo",
      completed: demoCompleted,
      count: demoCompleted ? "done" : "not done",
      required: true
    });

    if (!demoCompleted) {
      allMet = false;
    }
  }

  return {
    canComplete: allMet,
    requirements
  };
}

export function isDemoCompleted(day: number): boolean {
  const data = loadDayCompletions();
  return data[day]?.demoCompleted === true;
}

export function markDemoCompleted(day: number): void {
  const data = loadDayCompletions();
  if (!data[day]) {
    data[day] = {};
  }
  data[day].demoCompleted = true;
  data[day].demoCompletedAt = new Date().toISOString();
  saveDayCompletions(data);
}

export function markDayComplete(day: number): MarkDayCompleteResult {
  const { canComplete, requirements } = checkDayCompletionRequirements(day);

  if (!canComplete) {
    return {
      success: false,
      message: "Cannot complete day - requirements not met",
      requirements
    };
  }

  const data = loadDayCompletions();
  data[day] = {
    ...data[day],
    completed: true,
    completedAt: new Date().toISOString()
  };
  saveDayCompletions(data);

  // Also update journal entry status
  const entry = getEntry(day) || { body: "", status: "pending" as const };
  entry.status = "completed";
  saveEntry(day, entry);

  return {
    success: true,
    completedAt: data[day].completedAt
  };
}

export function getDayCompletion(day: number): DayCompletion | null {
  const data = loadDayCompletions();
  return data[day] || null;
}

export function isDayCompleted(day: number): boolean {
  const data = loadDayCompletions();
  return data[day]?.completed === true;
}

export function getCompletedDaysCount(): number {
  const data = loadDayCompletions();
  return Object.values(data).filter(d => d.completed).length;
}

// Reading completion with date tracking
const READING_KEY = "30days-reading-complete";

interface ReadingCompletion {
  completed: boolean;
  completedAt: string | null;
  blogPostId: string | null;
}

function loadReadingData(): Record<number, ReadingCompletion> {
  const raw = localStorage.getItem(READING_KEY);
  return raw ? JSON.parse(raw) : {};
}

function saveReadingData(data: Record<number, ReadingCompletion>): void {
  localStorage.setItem(READING_KEY, JSON.stringify(data));
}

export function isReadingComplete(day: number): boolean {
  return loadReadingData()[day]?.completed === true;
}

export function getReadingCompletion(day: number): ReadingCompletion | null {
  return loadReadingData()[day] || null;
}

export function getCompletedReadingsCount(): number {
  const data = loadReadingData();
  return Object.values(data).filter(r => r.completed).length;
}

export function getCompletedReadingDays(): Set<number> {
  const data = loadReadingData();
  const days = new Set<number>();
  for (const [day, completion] of Object.entries(data)) {
    if (completion.completed) {
      days.add(parseInt(day));
    }
  }
  return days;
}

export function toggleReadingComplete(day: number): boolean {
  const data = loadReadingData();
  const current = data[day] || { completed: false, completedAt: null, blogPostId: null };

  if (!current.completed) {
    // Marking as complete
    current.completed = true;
    current.completedAt = new Date().toISOString();
  } else {
    // Unmarking
    current.completed = false;
    current.completedAt = null;
  }

  data[day] = current;
  saveReadingData(data);
  return current.completed;
}

export function setReadingBlogPostId(day: number, blogPostId: string): void {
  const data = loadReadingData();
  if (data[day]) {
    data[day].blogPostId = blogPostId;
    saveReadingData(data);
  }
}

export function clearDayProgress(day: number): void {
  // Clear reading completion
  const readingData = loadReadingData();
  const blogPostId = readingData[day]?.blogPostId;
  delete readingData[day];
  saveReadingData(readingData);

  // Delete associated blog post if exists
  if (blogPostId) {
    deleteBlogPost(blogPostId);
  }
}

export function generateAutoLogEntry(day: number): BlogPost | null {
  const dayData = DAYS.find(d => d.day === day);
  if (!dayData) return null;

  const learn = dayData.learn;
  const phase = PHASES.find(p => p.id === dayData.phase);

  // Build a concise, colloquial "greatest hits" style entry
  let body = '';

  // One-liner hook
  if (learn?.overview?.summary) {
    body += `**TL;DR:** ${learn.overview.summary}\n\n`;
  }

  // Pick just the top 2-3 concepts as highlights
  if (learn?.concepts?.length) {
    body += `**Key insights:**\n`;
    const topConcepts = learn.concepts.slice(0, 3);
    topConcepts.forEach(c => {
      // Just the title, maybe first sentence of description
      const firstSentence = c.description.split('.')[0];
      body += `- **${c.title}** — ${firstSentence}.\n`;
    });
    body += '\n';
  }

  // Just the takeaways as bullet points (max 4)
  if (learn?.keyTakeaways?.length) {
    body += `**What stuck with me:**\n`;
    const topTakeaways = learn.keyTakeaways.slice(0, 4);
    topTakeaways.forEach(t => {
      body += `- ${t}\n`;
    });
  }

  // Create the blog post with a simpler title
  const title = `Day ${day}: ${dayData.title}`;
  const tags = [...(dayData.tags || [])].slice(0, 3); // max 3 tags

  const post = createBlogPost({
    title,
    body: body.trim() || `Finished Day ${day} — ${dayData.title}`,
    excerpt: learn?.overview?.summary?.slice(0, 120) + '...' || `Notes from Day ${day}`,
    tags,
    linkedDay: day,
    status: 'published'
  });

  // Link the blog post to the reading completion
  setReadingBlogPostId(day, post.id);

  return post;
}
