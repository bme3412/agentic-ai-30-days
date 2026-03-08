// ══════════════════════════════════════════════════════════════
// CORE DATA TYPES
// ══════════════════════════════════════════════════════════════

export interface Phase {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
}

export interface Resource {
  title: string;
  url: string;
  type?: 'video' | 'article' | 'docs' | 'tutorial' | 'github' | 'course' | 'book' | 'paper' | 'tool' | 'link';
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  description?: string;
  summaryPath?: string;  // Path to a markdown summary file (e.g., "data/day-2/openai-function-calling.md")
}

export interface LocalResource {
  id: string;
  title: string;
  description?: string;
  filePath: string;
  type?: 'notes' | 'guide' | 'exercise' | 'reference';
  estimatedTime?: string;
}

export interface CodeExample {
  title?: string;
  language?: string;
  code: string;
  category?: 'basic' | 'intermediate' | 'advanced';
  explanation?: string;
}

export interface Diagram {
  title?: string;
  type?: string;
  content?: string;
  ascii?: string;
  caption?: string;
}

export interface Principle {
  title: string;
  description: string;
}

export interface Concept {
  title: string;
  description: string;
  analogy?: string;
  gotchas?: string[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Application {
  title: string;
  description: string;
}

export interface LearnOverview {
  summary?: string;
  fullDescription?: string;
  prerequisites?: string[];
  estimatedTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Learn {
  overview?: LearnOverview;
  concepts?: Concept[];
  codeExamples?: CodeExample[];
  diagrams?: Diagram[];
  keyTakeaways?: string[];
  resources?: Resource[];
  localResources?: LocalResource[];
  faq?: FAQ[];
  applications?: Application[];
  relatedDays?: number[];
}

export interface Lesson {
  overview?: string;
  principles?: Principle[];
  codeExample?: {
    language?: string;
    title?: string;
    code: string;
  };
  diagram?: {
    type?: string;
    title?: string;
    ascii: string;
  };
  keyTakeaways?: string[];
  resources?: Resource[];
  localResources?: LocalResource[];
}

export interface Day {
  day: number;
  phase: number;
  title: string;
  partner: string;
  tags: string[];
  concept?: string;
  demoUrl?: string;
  demoDescription?: string;
  lesson?: Lesson;
  learn?: Learn;
}

// ══════════════════════════════════════════════════════════════
// JOURNAL & ENTRIES
// ══════════════════════════════════════════════════════════════

export interface MicroPost {
  content: string;
  mood?: string | null;
  createdAt: string;
}

export interface JournalEntry {
  day: number;
  status: 'pending' | 'in-progress' | 'completed';
  body?: string;
  lessons?: string;
  keyTakeaways?: string;
  updatedAt?: string;
  microPost?: MicroPost;
}

// ══════════════════════════════════════════════════════════════
// BLOG SYSTEM
// ══════════════════════════════════════════════════════════════

export interface BlogPost {
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

export interface BlogData {
  posts: Record<string, BlogPost>;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface BlogFilterOptions {
  status?: 'draft' | 'published';
  tag?: string;
  linkedDay?: number;
}

// ══════════════════════════════════════════════════════════════
// GAMIFICATION
// ══════════════════════════════════════════════════════════════

export interface Streak {
  current: number;
  longest: number;
  lastActivityDate: string | null;
  startDate: string | null;
}

export interface DayActivity {
  journalEntry: boolean;
  blogPost: boolean;
  microPost: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestones' | 'streaks' | 'completion' | 'content';
  unlocked?: boolean;
  unlockedAt?: string | null;
}

export interface GamificationStats {
  totalEntries: number;
  totalBlogPosts: number;
  totalMicroPosts: number;
  totalWords: number;
}

export interface GamificationData {
  streak: Streak;
  activityLog: Record<string, DayActivity>;
  achievements: Record<string, Achievement & { unlockedAt: string }>;
  stats: GamificationStats;
}

// ══════════════════════════════════════════════════════════════
// READING & SECTION PROGRESS
// ══════════════════════════════════════════════════════════════

export interface CompletedResource {
  completedAt: string;
  title: string;
  day: number;
  resourceId?: string;
  isLocal?: boolean;
}

export interface ReadingProgressData {
  completed: Record<string, CompletedResource>;
}

export interface SectionItem {
  completedAt: string;
  day: number;
  type: 'concept' | 'takeaway' | 'overview';
  index: number;
  title: string;
}

export interface SectionProgressData {
  items: Record<string, SectionItem>;
}

export interface SectionProgressCounts {
  completed: number;
  total: number;
  percent: number;
}

export interface DayOverallProgress {
  concepts: number;
  takeaways: number;
  resources: number;
  total: number;
}

// ══════════════════════════════════════════════════════════════
// DAY COMPLETION
// ══════════════════════════════════════════════════════════════

export interface DayCompletionRequirement {
  label: string;
  completed: boolean;
  count: string;
  required: boolean;
}

export interface DayCompletionCheck {
  canComplete: boolean;
  requirements: DayCompletionRequirement[];
}

export interface DayCompletion {
  demoCompleted?: boolean;
  demoCompletedAt?: string;
  completed?: boolean;
  completedAt?: string;
}

export interface MarkDayCompleteResult {
  success: boolean;
  message?: string;
  requirements?: DayCompletionRequirement[];
  completedAt?: string;
}

// ══════════════════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════════════════

export type Route =
  | 'home'
  | 'journal'
  | 'day'
  | 'stats'
  | 'demos'
  | 'blog'
  | 'blog-post'
  | 'blog-new'
  | 'blog-edit'
  | 'resource';

export interface RouteParams {
  day?: number;
  filter?: string;
  id?: string;
  tag?: string;
  showDrafts?: boolean;
  resourceId?: string;
  linkedDay?: number;
}
