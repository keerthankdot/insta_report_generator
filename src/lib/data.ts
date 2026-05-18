export type Trajectory = 'Rising' | 'Steady' | 'Needs Attention' | 'New'
export type NoteType = 'Win' | 'Loss' | 'Growth Note' | 'Feedback Area' | 'Observation'
export type Urgency = 'Low' | 'Medium' | 'High'
export type Platform = 'Instagram' | 'LinkedIn' | 'YouTube' | 'X'
export type ContentCategory = 'Humour' | 'Trend' | 'Education' | 'Storytelling' | 'Promo'

export interface Person {
  id: string
  name: string
  role: string
  team: 'Creative' | 'Accounts' | 'Strategy' | 'Production'
  trajectory: Trajectory
  avatarInitials: string
  joinedDate: string
}

export interface Note {
  id: string
  personId: string
  date: string
  type: NoteType
  content: string
  urgency: Urgency
  authorName: string
}

export interface Brand {
  id: string
  name: string
  amName: string
  platforms: Platform[]
  status: 'active' | 'paused' | 'attention'
  color: string
}

export interface PlatformMetrics {
  platform: Platform
  primary: { label: string; value: number }
  secondary: { label: string; value: number }[]
}

export interface BrandMetrics {
  brandId: string
  weekEnding: string
  platforms: PlatformMetrics[]
}

export interface TrendPoint {
  week: string
  Instagram: number
  LinkedIn: number
  YouTube: number
}

export interface CreativeEntry {
  id: string
  category: ContentCategory
  platform: Platform
  brand: string
  title: string
  insight: string
  rating: number
  creatorName: string
  dateAdded: string
}

export interface AMNote {
  id: string
  brandId: string
  date: string
  author: string
  content: string
}

// ===== People =====
export const PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Ananya Sharma',
    role: 'Senior Copywriter',
    team: 'Creative',
    trajectory: 'Rising',
    avatarInitials: 'AS',
    joinedDate: '2024-08-12',
  },
  {
    id: 'p2',
    name: 'Rohan Mehta',
    role: 'Account Manager',
    team: 'Accounts',
    trajectory: 'Steady',
    avatarInitials: 'RM',
    joinedDate: '2023-05-02',
  },
  {
    id: 'p3',
    name: 'Priya Nair',
    role: 'Art Director',
    team: 'Creative',
    trajectory: 'Needs Attention',
    avatarInitials: 'PN',
    joinedDate: '2024-02-18',
  },
  {
    id: 'p4',
    name: 'Kabir Das',
    role: 'Social Media Manager',
    team: 'Creative',
    trajectory: 'New',
    avatarInitials: 'KD',
    joinedDate: '2026-03-01',
  },
  {
    id: 'p5',
    name: 'Shreya Patel',
    role: 'Account Executive',
    team: 'Accounts',
    trajectory: 'Rising',
    avatarInitials: 'SP',
    joinedDate: '2025-01-09',
  },
]

// ===== Notes =====
export const NOTES: Note[] = [
  {
    id: 'n1',
    personId: 'p1',
    date: '2026-04-05',
    type: 'Win',
    content:
      'Led the Dunkin brief solo. Client signed off without revisions. Brought a fresh angle on the seasonal launch that the team hadn\'t considered.',
    urgency: 'Low',
    authorName: 'Viren Noronha',
  },
  {
    id: 'n2',
    personId: 'p1',
    date: '2026-03-28',
    type: 'Growth Note',
    content:
      'Struggles with time-boxing research. Spent 2 days on Tinder competitor scan when 4 hours was budgeted. Worth a structured framework conversation.',
    urgency: 'Medium',
    authorName: 'Viren Noronha',
  },
  {
    id: 'n3',
    personId: 'p1',
    date: '2026-03-15',
    type: 'Win',
    content:
      'Flagged a campaign inconsistency before it went to client. Caught a tone mismatch in the Tinder April calendar that would have been awkward.',
    urgency: 'Low',
    authorName: 'Rohan Mehta',
  },
  {
    id: 'n4',
    personId: 'p1',
    date: '2026-03-08',
    type: 'Feedback Area',
    content:
      'Presentation skills need work. Strong written but freezes in client room. Pair her with Rohan on the next 3 pitches as second chair.',
    urgency: 'Medium',
    authorName: 'Viren Noronha',
  },
  {
    id: 'n5',
    personId: 'p2',
    date: '2026-04-10',
    type: 'Observation',
    content: 'Holding Tinder account steady. No fires, no breakouts. Time for a stretch project.',
    urgency: 'Low',
    authorName: 'Viren Noronha',
  },
  {
    id: 'n6',
    personId: 'p3',
    date: '2026-04-12',
    type: 'Loss',
    content:
      'Missed the Dunkin moodboard deadline by 3 days. Second slip this month. Need to understand what\'s changing.',
    urgency: 'High',
    authorName: 'Viren Noronha',
  },
  {
    id: 'n7',
    personId: 'p3',
    date: '2026-04-01',
    type: 'Feedback Area',
    content:
      'Visual quality dropping on quick-turn briefs. Excellent on long-form, struggling on weekly social posts.',
    urgency: 'Medium',
    authorName: 'Rohan Mehta',
  },
  {
    id: 'n8',
    personId: 'p5',
    date: '2026-04-08',
    type: 'Win',
    content:
      'Owned the Dunkin Q2 calendar end to end. Client lead said it\'s the cleanest deck they\'ve seen from us.',
    urgency: 'Low',
    authorName: 'Viren Noronha',
  },
  {
    id: 'n9',
    personId: 'p4',
    date: '2026-04-15',
    type: 'Observation',
    content: 'Onboarding well. Slack presence is strong, asking good questions in standups.',
    urgency: 'Low',
    authorName: 'Rohan Mehta',
  },
]

// ===== Brands =====
export const BRANDS: Brand[] = [
  {
    id: 'b1',
    name: 'Tinder India',
    amName: 'Rohan Mehta',
    platforms: ['Instagram', 'LinkedIn', 'YouTube'],
    status: 'active',
    color: '#FF6B6B',
  },
  {
    id: 'b2',
    name: 'Dunkin India',
    amName: 'Shreya Patel',
    platforms: ['Instagram', 'X'],
    status: 'attention',
    color: '#FF6600',
  },
]

// ===== Metrics =====
export const BRAND_METRICS: BrandMetrics[] = [
  {
    brandId: 'b1',
    weekEnding: '2026-05-17',
    platforms: [
      {
        platform: 'Instagram',
        primary: { label: 'Views', value: 240000 },
        secondary: [
          { label: 'Likes', value: 18400 },
          { label: 'Comments', value: 892 },
          { label: 'Shares', value: 3200 },
        ],
      },
      {
        platform: 'LinkedIn',
        primary: { label: 'Impressions', value: 45000 },
        secondary: [
          { label: 'Reactions', value: 1200 },
          { label: 'Comments', value: 87 },
        ],
      },
      {
        platform: 'YouTube',
        primary: { label: 'Views', value: 89000 },
        secondary: [
          { label: 'Likes', value: 4100 },
          { label: 'Comments', value: 320 },
        ],
      },
    ],
  },
  {
    brandId: 'b2',
    weekEnding: '2026-05-17',
    platforms: [
      {
        platform: 'Instagram',
        primary: { label: 'Views', value: 156000 },
        secondary: [
          { label: 'Likes', value: 9800 },
          { label: 'Comments', value: 412 },
          { label: 'Shares', value: 1400 },
        ],
      },
      {
        platform: 'X',
        primary: { label: 'Impressions', value: 78000 },
        secondary: [
          { label: 'Likes', value: 2100 },
          { label: 'Reposts', value: 340 },
        ],
      },
    ],
  },
]

// ===== Trend data (4 weeks per brand) =====
export const ENGAGEMENT_TREND: Record<string, TrendPoint[]> = {
  b1: [
    { week: 'Apr 26', Instagram: 198000, LinkedIn: 38000, YouTube: 71000 },
    { week: 'May 3', Instagram: 212000, LinkedIn: 41000, YouTube: 75000 },
    { week: 'May 10', Instagram: 225000, LinkedIn: 42500, YouTube: 82000 },
    { week: 'May 17', Instagram: 240000, LinkedIn: 45000, YouTube: 89000 },
  ],
  b2: [
    { week: 'Apr 26', Instagram: 132000, LinkedIn: 0, YouTube: 0 },
    { week: 'May 3', Instagram: 141000, LinkedIn: 0, YouTube: 0 },
    { week: 'May 10', Instagram: 148000, LinkedIn: 0, YouTube: 0 },
    { week: 'May 17', Instagram: 156000, LinkedIn: 0, YouTube: 0 },
  ],
}

// ===== AM Notes =====
export const AM_NOTES: AMNote[] = [
  {
    id: 'amn1',
    brandId: 'b1',
    date: '2026-05-15',
    author: 'Rohan Mehta',
    content:
      'Reels are crushing. The "dating after 25" series is our strongest format this quarter. Recommend doubling down with 2 more in this thread.',
  },
  {
    id: 'amn2',
    brandId: 'b1',
    date: '2026-05-12',
    author: 'Rohan Mehta',
    content:
      'LinkedIn growth steady. Client asked about YouTube Shorts as a new format. Aligning with creative next Monday.',
  },
  {
    id: 'amn3',
    brandId: 'b1',
    date: '2026-05-08',
    author: 'Rohan Mehta',
    content: 'Comment sentiment audit done. 92% positive. Two trolls flagged and reported.',
  },
  {
    id: 'amn4',
    brandId: 'b2',
    date: '2026-05-14',
    author: 'Shreya Patel',
    content:
      'Donut trend reel underperformed. Client wants more recipe-led content. Pivoting calendar for next 2 weeks.',
  },
  {
    id: 'amn5',
    brandId: 'b2',
    date: '2026-05-10',
    author: 'Shreya Patel',
    content: 'X engagement up 18% week on week. Reply-led strategy is working.',
  },
]

// ===== Creative Bank =====
export const CREATIVE_ENTRIES: CreativeEntry[] = [
  {
    id: 'c1',
    category: 'Humour',
    platform: 'Instagram',
    brand: 'Tinder India',
    title: 'When you match but they have 9 pictures and you have 0',
    insight:
      'Self-deprecating humour carousel. Plays on the universal anxiety of having no photos to put on the app. 1.2M views, 45k saves. Saved >> shared, suggests people are tagging themselves not friends.',
    rating: 4,
    creatorName: 'Ananya Sharma',
    dateAdded: '2026-05-10',
  },
  {
    id: 'c2',
    category: 'Trend',
    platform: 'Instagram',
    brand: 'Dunkin India',
    title: 'Girl dinner donut reel',
    insight:
      'Jumped on the "girl dinner" trend with a donut tower as the meal. Reach was okay but engagement low — trend was past peak by 5 days. Lesson: react to trends within 72 hours or skip.',
    rating: 3,
    creatorName: 'Priya Nair',
    dateAdded: '2026-05-07',
  },
  {
    id: 'c3',
    category: 'Education',
    platform: 'LinkedIn',
    brand: 'Tinder India',
    title: '5 things that changed about online dating after 25',
    insight:
      'Carousel on dating behaviour shifts in late 20s. Hit a nerve — 3.4k reactions, 280 comments, mostly women in 26-32 age band. Top comment thread became its own discussion.',
    rating: 5,
    creatorName: 'Ananya Sharma',
    dateAdded: '2026-05-02',
  },
]

// ===== Helpers =====
export function getPersonById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id)
}

export function getNotesForPerson(personId: string): Note[] {
  return NOTES.filter((n) => n.personId === personId).sort((a, b) =>
    b.date.localeCompare(a.date),
  )
}

export function getBrandById(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id)
}

export function getMetricsForBrand(brandId: string): BrandMetrics | undefined {
  return BRAND_METRICS.find((m) => m.brandId === brandId)
}

export function getAMNotesForBrand(brandId: string): AMNote[] {
  return AM_NOTES.filter((n) => n.brandId === brandId).sort((a, b) =>
    b.date.localeCompare(a.date),
  )
}

export function formatNumber(n: number): string {
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toString()
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
