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
  creatorNames: string[]
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

// ===== Weekly tracker types =====
export interface InstagramWeek {
  reach: number | null
  engagementRate: number | null
  shares: number | null
  followersDelta?: number | null
  followersTotal?: number | null
}

export interface XWeek {
  impressions: number | null
  engagementRate: number | null
  reposts: number | null
  followersTotal?: number | null
}

export interface BrandWeeklyData {
  brandId: string
  instagram: (InstagramWeek | null)[]
  x?: (XWeek | null)[]
}

// Week labels in order (Wed-to-Wed, 10 weeks)
export const WEEKS = [
  'Mar 11',
  'Mar 18',
  'Mar 25',
  'Apr 1',
  'Apr 8',
  'Apr 15',
  'Apr 22',
  'Apr 29',
  'May 6',
  'May 13',
]

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
      'Led the Tinder brief solo. Client signed off without revisions. Brought a fresh angle on the seasonal launch that the team hadn\'t considered.',
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
    content: 'Holding FK and Tinder accounts steady. No fires, no breakouts. Time for a stretch project.',
    urgency: 'Low',
    authorName: 'Viren Noronha',
  },
  {
    id: 'n6',
    personId: 'p3',
    date: '2026-04-12',
    type: 'Loss',
    content:
      'Missed the Wakefit moodboard deadline by 3 days. Second slip this month. Need to understand what\'s changing.',
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
      'Owned the Epigamia Q2 calendar end to end. Client lead said it\'s the cleanest deck they\'ve seen from us.',
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
    id: 'fk',
    name: 'FK',
    amName: 'Rohan Mehta',
    platforms: ['Instagram', 'X'],
    status: 'active',
    color: '#8B5CF6',
    creatorNames: ['Ananya Sharma', 'Kabir Das'],
  },
  {
    id: 'wakefit',
    name: 'Wakefit',
    amName: 'Shreya Patel',
    platforms: ['Instagram'],
    status: 'active',
    color: '#0EA5E9',
    creatorNames: ['Priya Nair'],
  },
  {
    id: 'tinder',
    name: 'Tinder India',
    amName: 'Rohan Mehta',
    platforms: ['Instagram'],
    status: 'active',
    color: '#FF6B6B',
    creatorNames: ['Ananya Sharma'],
  },
  {
    id: 'epigamia',
    name: 'Epigamia',
    amName: 'Shreya Patel',
    platforms: ['Instagram'],
    status: 'attention',
    color: '#F97316',
    creatorNames: ['Kabir Das'],
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    amName: 'Shreya Patel',
    platforms: ['Instagram'],
    status: 'active',
    color: '#5F259F',
    creatorNames: ['Priya Nair', 'Kabir Das'],
  },
  {
    id: 'league',
    name: 'League',
    amName: 'Rohan Mehta',
    platforms: ['Instagram', 'X'],
    status: 'attention',
    color: '#10B981',
    creatorNames: ['Ananya Sharma'],
  },
]

// ===== Weekly Data (10 weeks per brand) =====
export const WEEKLY_DATA: BrandWeeklyData[] = [
  // FK (Filter Kaapi)
  {
    brandId: 'fk',
    instagram: [
      { reach: 736356, engagementRate: 0.75, shares: 493, followersTotal: 9200000 },
      { reach: 729557, engagementRate: 0.85, shares: 507, followersTotal: 9603000 },
      { reach: 757226, engagementRate: 0.97, shares: 324, followersTotal: 9836000 },
      { reach: 903028, engagementRate: 0.86, shares: 393, followersTotal: 10000000 },
      { reach: 1008461, engagementRate: 0.996, shares: 221, followersTotal: 10360000 },
      { reach: 917582, engagementRate: 0.88, shares: 1181, followersTotal: 10640000 },
      { reach: null, engagementRate: null, shares: null, followersTotal: 10920000 },
      { reach: null, engagementRate: null, shares: null, followersTotal: 11100000 },
      { reach: 774639, engagementRate: 0.73, shares: 48, followersTotal: 11300000 },
      { reach: 704041, engagementRate: 1.02, shares: 944, followersTotal: 11500000 },
    ],
    x: [
      { impressions: 25875, engagementRate: 2.78, reposts: 25, followersTotal: 2800000 },
      { impressions: 12668, engagementRate: 1.83, reposts: 4, followersTotal: 2800000 },
      { impressions: 9569, engagementRate: 2.11, reposts: 8, followersTotal: 2800000 },
      { impressions: 46771, engagementRate: 2.2, reposts: 32, followersTotal: 2800000 },
      { impressions: 60969, engagementRate: 6.48, reposts: 289, followersTotal: 2800000 },
      { impressions: 415114, engagementRate: 5.68, reposts: 1359, followersTotal: 2800000 },
      { impressions: 35256, engagementRate: 3.52, reposts: 62, followersTotal: 2800000 },
      { impressions: 19716, engagementRate: 5.23, reposts: 43, followersTotal: 2800000 },
      { impressions: 11755, engagementRate: 0.98, reposts: 0, followersTotal: 2800000 },
      { impressions: 8958, engagementRate: 3.23, reposts: 8, followersTotal: 2800000 },
    ],
  },
  // Wakefit
  {
    brandId: 'wakefit',
    instagram: [
      { reach: 63985, engagementRate: 0.88, shares: 67, followersDelta: 19571 },
      { reach: 40417, engagementRate: 0.71, shares: 78, followersDelta: 4209 },
      { reach: 47210, engagementRate: 0.78, shares: 143, followersDelta: 2379 },
      { reach: 27929, engagementRate: 0.73, shares: 6, followersDelta: -676 },
      { reach: 43325, engagementRate: 0.7, shares: 38, followersDelta: -625 },
      { reach: 54817, engagementRate: 0.72, shares: 68, followersDelta: -573 },
      { reach: 30946, engagementRate: 0.72, shares: 81, followersDelta: 3373 },
      { reach: 39408, engagementRate: 0.66, shares: 8, followersDelta: 1809 },
      { reach: 38600, engagementRate: 0.53, shares: 90, followersDelta: 4149 },
      { reach: 34838, engagementRate: 0.9, shares: 91, followersDelta: 30930 },
    ],
  },
  // Tinder India
  {
    brandId: 'tinder',
    instagram: [
      { reach: 87472, engagementRate: 3.25, shares: 1977, followersDelta: 1927 },
      { reach: 150110, engagementRate: 1.59, shares: 809, followersDelta: 2038 },
      { reach: 1414368, engagementRate: 5.8, shares: 10196, followersDelta: 2230 },
      { reach: null, engagementRate: null, shares: null, followersDelta: 2087 },
      { reach: 219480, engagementRate: 3.26, shares: 1232, followersDelta: 1349 },
      { reach: 40019, engagementRate: 4.24, shares: 3577, followersDelta: 945 },
      { reach: 45050, engagementRate: 4.84, shares: 1163, followersDelta: 1064 },
      { reach: 10921, engagementRate: 4.1, shares: 126, followersDelta: null },
      { reach: 12086, engagementRate: 5.5, shares: 136, followersDelta: null },
      { reach: null, engagementRate: null, shares: null, followersDelta: null },
    ],
  },
  // Epigamia
  {
    brandId: 'epigamia',
    instagram: [
      { reach: 11400, engagementRate: 1.93, shares: 23, followersDelta: 0 },
      { reach: 105600, engagementRate: 1.63, shares: 180, followersDelta: 100 },
      { reach: 16993, engagementRate: 2.45, shares: 85, followersDelta: 0 },
      { reach: null, engagementRate: 0.26, shares: 41, followersDelta: 0 },
      { reach: 2879, engagementRate: null, shares: null, followersDelta: 0 },
      { reach: 8439, engagementRate: 2.3, shares: 17, followersDelta: 0 },
      { reach: null, engagementRate: 0.71, shares: 253, followersDelta: 100 },
      { reach: 6074, engagementRate: 4.03, shares: 152, followersDelta: -100 },
      { reach: null, engagementRate: null, shares: null, followersDelta: 100 },
      { reach: null, engagementRate: 2.69, shares: 25, followersDelta: null },
    ],
  },
  // PhonePe
  {
    brandId: 'phonepe',
    instagram: [
      { reach: 14900, engagementRate: 1.83, shares: 20, followersDelta: 3000 },
      { reach: 19700, engagementRate: 0.92, shares: 52, followersDelta: 1000 },
      { reach: 20000, engagementRate: 2.89, shares: 107, followersDelta: 2000 },
      { reach: 25900, engagementRate: 0.6, shares: 600, followersDelta: 3000 },
      { reach: 14000, engagementRate: 0.31, shares: 18, followersDelta: 2000 },
      { reach: 31300, engagementRate: 0.17, shares: 34, followersDelta: 2000 },
      { reach: 13100, engagementRate: 0.17, shares: 62, followersDelta: 1000 },
      { reach: 10500, engagementRate: 0.13, shares: 141, followersDelta: null },
      { reach: 13000, engagementRate: 0.15, shares: 133, followersDelta: 2000 },
      { reach: null, engagementRate: 0.07, shares: 42, followersDelta: null },
    ],
  },
  // League
  {
    brandId: 'league',
    instagram: [
      { reach: 213346, engagementRate: 5.81, shares: 573, followersTotal: 156021 },
      { reach: 1355018, engagementRate: 0.62, shares: 429, followersTotal: 158343 },
      { reach: 0, engagementRate: null, shares: 0, followersTotal: 162378 },
      { reach: 0, engagementRate: null, shares: 0, followersTotal: 165911 },
      { reach: 0, engagementRate: null, shares: 0, followersTotal: 167421 },
      { reach: 176277, engagementRate: 9.52, shares: 964, followersTotal: 168048 },
      { reach: 391139, engagementRate: 8.77, shares: 1250, followersTotal: 168048 },
      { reach: 227079, engagementRate: 8.8, shares: 1054, followersTotal: 168813 },
      { reach: null, engagementRate: null, shares: null, followersTotal: null },
      { reach: null, engagementRate: null, shares: null, followersTotal: null },
    ],
    x: [
      { impressions: 3405, engagementRate: 4.23, reposts: 9, followersTotal: 58100 },
      { impressions: 6125, engagementRate: 0.53, reposts: 3, followersTotal: 58100 },
      { impressions: 9511, engagementRate: 1.75, reposts: 3, followersTotal: 58100 },
      { impressions: 0, engagementRate: null, reposts: 0, followersTotal: 58100 },
      { impressions: 0, engagementRate: null, reposts: 0, followersTotal: 58100 },
      { impressions: 0, engagementRate: null, reposts: 0, followersTotal: 58200 },
      { impressions: 0, engagementRate: null, reposts: 0, followersTotal: 58200 },
      { impressions: 0, engagementRate: null, reposts: 0, followersTotal: 58200 },
      null,
      null,
    ],
  },
]

// ===== Derived "this week" Metrics (latest non-null week per platform) =====
function deriveLatestMetrics(brand: Brand): BrandMetrics {
  const wd = WEEKLY_DATA.find((d) => d.brandId === brand.id)
  const platforms: PlatformMetrics[] = []

  if (wd) {
    // Find latest Instagram week with reach
    const latestIg = [...wd.instagram]
      .map((w, i) => ({ w, i }))
      .reverse()
      .find((x) => x.w && x.w.reach !== null && x.w.reach !== undefined)
    if (latestIg && latestIg.w) {
      platforms.push({
        platform: 'Instagram',
        primary: { label: 'Reach', value: latestIg.w.reach ?? 0 },
        secondary: [
          { label: 'Eng Rate', value: latestIg.w.engagementRate ?? 0 },
          { label: 'Shares', value: latestIg.w.shares ?? 0 },
        ],
      })
    }

    // Find latest X week with impressions
    if (wd.x) {
      const latestX = [...wd.x]
        .map((w, i) => ({ w, i }))
        .reverse()
        .find((x) => x.w && x.w.impressions !== null && x.w.impressions !== undefined)
      if (latestX && latestX.w) {
        platforms.push({
          platform: 'X',
          primary: { label: 'Impressions', value: latestX.w.impressions ?? 0 },
          secondary: [
            { label: 'Eng Rate', value: latestX.w.engagementRate ?? 0 },
            { label: 'Reposts', value: latestX.w.reposts ?? 0 },
          ],
        })
      }
    }
  }

  return {
    brandId: brand.id,
    weekEnding: '2026-05-13',
    platforms,
  }
}

export const BRAND_METRICS: BrandMetrics[] = BRANDS.map(deriveLatestMetrics)

// ===== Trend data (derived from WEEKLY_DATA, last 4 weeks) =====
export const ENGAGEMENT_TREND: Record<string, TrendPoint[]> = (() => {
  const out: Record<string, TrendPoint[]> = {}
  WEEKLY_DATA.forEach((wd) => {
    const start = Math.max(0, WEEKS.length - 4)
    out[wd.brandId] = WEEKS.slice(start).map((week, idx) => {
      const i = start + idx
      return {
        week,
        Instagram: wd.instagram[i]?.reach ?? 0,
        LinkedIn: 0,
        YouTube: 0,
      }
    })
  })
  return out
})()

// ===== AM Notes =====
export const AM_NOTES: AMNote[] = [
  {
    id: 'amn1',
    brandId: 'fk',
    date: '2026-05-15',
    author: 'Rohan Mehta',
    content:
      'Apr 15 X spike (415k impressions, 5.68% eng) drove our biggest week. Reposting strategy on the viral thread is working. Recommend 2 more in the same format.',
  },
  {
    id: 'amn2',
    brandId: 'fk',
    date: '2026-05-08',
    author: 'Rohan Mehta',
    content:
      'IG reach softening over last 3 weeks. Followers still climbing past 11.5M but engagement dipped on May 6. Auditing creative calendar.',
  },
  {
    id: 'amn3',
    brandId: 'tinder',
    date: '2026-04-12',
    author: 'Rohan Mehta',
    content:
      'Mar 25 was a breakout. 1.4M reach, 5.8% eng rate, 10k shares. Carousel format about dating after 25. Doubling down.',
  },
  {
    id: 'amn4',
    brandId: 'wakefit',
    date: '2026-05-14',
    author: 'Shreya Patel',
    content:
      'May 13 follower spike of +30k tied to the giveaway campaign. Eng rate also bounced back to 0.9%. Lead with giveaways next month.',
  },
  {
    id: 'amn5',
    brandId: 'epigamia',
    date: '2026-05-10',
    author: 'Shreya Patel',
    content:
      'Data inconsistency from Meta exports has been an issue. Two weeks with reach gaps. Cross-checking against in-app numbers manually.',
  },
  {
    id: 'amn6',
    brandId: 'phonepe',
    date: '2026-05-09',
    author: 'Shreya Patel',
    content:
      'Engagement rate has dropped from 2.89% to 0.07% over 8 weeks. Algorithm shift or content fatigue. Strategy session booked for Mon.',
  },
  {
    id: 'amn7',
    brandId: 'league',
    date: '2026-04-25',
    author: 'Rohan Mehta',
    content:
      'Three-week dark period (Mar 25 - Apr 8) hurt momentum. Apr 15 relaunch at 9.52% eng was strong. Need to never go dark that long again.',
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
    brand: 'Epigamia',
    title: 'Girl dinner yogurt reel',
    insight:
      'Jumped on the "girl dinner" trend with a yogurt parfait as the meal. Reach was okay but engagement low — trend was past peak by 5 days. Lesson: react to trends within 72 hours or skip.',
    rating: 3,
    creatorName: 'Kabir Das',
    dateAdded: '2026-05-07',
  },
  {
    id: 'c3',
    category: 'Education',
    platform: 'Instagram',
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

export function getWeeklyData(brandId: string): BrandWeeklyData | undefined {
  return WEEKLY_DATA.find((w) => w.brandId === brandId)
}

export function getBrandsForUser(userName: string, role: string): Brand[] {
  if (role === 'founder' || role === 'manager') return BRANDS
  if (role === 'am') {
    const own = BRANDS.filter((b) => b.amName === userName)
    return own.length ? own : BRANDS
  }
  if (role === 'creator') {
    const own = BRANDS.filter((b) => b.creatorNames.includes(userName))
    return own.length ? own : BRANDS
  }
  return BRANDS
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

// ===== Fortnight summaries (May 4–18, 2026, derived from last 2 weeks of WEEKLY_DATA) =====
export const FORTNIGHT_PERIOD = 'May 4 – May 18, 2026'

function deriveFortnightForBrand(brandId: string): {
  postsPublished: number
  hoursLogged: number
  engagementRate: number
} {
  const wd = WEEKLY_DATA.find((d) => d.brandId === brandId)
  if (!wd) return { postsPublished: 0, hoursLogged: 0, engagementRate: 0 }

  // last two weeks: indices 8 and 9 (May 6, May 13)
  const lastTwo = wd.instagram.slice(8, 10)
  const rates = lastTwo
    .map((w) => w?.engagementRate)
    .filter((r): r is number => r !== null && r !== undefined)
  const avgEng = rates.length ? rates.reduce((s, r) => s + r, 0) / rates.length : 0

  // Heuristic posts/hours based on brand size
  const postEstimate: Record<string, number> = {
    fk: 16,
    wakefit: 10,
    tinder: 8,
    epigamia: 6,
    phonepe: 9,
    league: 5,
  }
  const hourEstimate: Record<string, number> = {
    fk: 42,
    wakefit: 28,
    tinder: 22,
    epigamia: 18,
    phonepe: 25,
    league: 16,
  }

  return {
    postsPublished: postEstimate[brandId] ?? 8,
    hoursLogged: hourEstimate[brandId] ?? 24,
    engagementRate: Number(avgEng.toFixed(2)),
  }
}

export const FORTNIGHT_BRAND: Record<string, {
  postsPublished: number
  hoursLogged: number
  engagementRate: number
}> = Object.fromEntries(BRANDS.map((b) => [b.id, deriveFortnightForBrand(b.id)]))

// Aggregated totals across all brands for founder view
export const AGENCY_FORTNIGHT = {
  totalReach: BRANDS.reduce((sum, b) => {
    const wd = WEEKLY_DATA.find((d) => d.brandId === b.id)
    if (!wd) return sum
    const lastTwo = wd.instagram.slice(8, 10)
    return sum + lastTwo.reduce((s, w) => s + (w?.reach ?? 0), 0)
  }, 0),
  totalLikes: 0, // unknown from PDF, kept for compat
  totalShares: BRANDS.reduce((sum, b) => {
    const wd = WEEKLY_DATA.find((d) => d.brandId === b.id)
    if (!wd) return sum
    const lastTwo = wd.instagram.slice(8, 10)
    return sum + lastTwo.reduce((s, w) => s + (w?.shares ?? 0), 0)
  }, 0),
  totalPosts: Object.values(FORTNIGHT_BRAND).reduce((s, f) => s + f.postsPublished, 0),
  engagementRate: Number(
    (
      Object.values(FORTNIGHT_BRAND).reduce((s, f) => s + f.engagementRate, 0) /
      Math.max(1, Object.keys(FORTNIGHT_BRAND).length)
    ).toFixed(2),
  ),
  brandsActive: BRANDS.length,
}

// Per-creator content stats
export const CREATOR_FORTNIGHT: Record<string, {
  entriesLogged: number
  avgRating: number
  topCategory: string
  postsLive: number
}> = {
  'Ananya Sharma': { entriesLogged: 6, avgRating: 4.2, topCategory: 'Humour', postsLive: 11 },
  'Rohan Mehta':  { entriesLogged: 3, avgRating: 3.8, topCategory: 'Education', postsLive: 7 },
  'Priya Nair':   { entriesLogged: 5, avgRating: 4.5, topCategory: 'Storytelling', postsLive: 9 },
  'Kabir Das':    { entriesLogged: 4, avgRating: 3.5, topCategory: 'Trend', postsLive: 8 },
  'Shreya Patel': { entriesLogged: 2, avgRating: 4.0, topCategory: 'Promo', postsLive: 6 },
}

// ===== Top performing posts this fortnight (derived from real peaks) =====
export interface TopPost {
  id: string
  brand: string
  platform: Platform
  caption: string
  reach: number
  likes: number
  shares: number
  engagementRate: number
  date: string
  url?: string
}

export const TOP_POSTS_FORTNIGHT: TopPost[] = [
  {
    id: 'tp1',
    brand: 'FK',
    platform: 'Instagram',
    caption: '"Friendly hai. Kaatega nahi." — Whose Order Is It Anyway, Ep 1',
    reach: 774639,
    likes: 5650,
    shares: 944,
    engagementRate: 1.02,
    date: '2026-05-13',
    url: 'https://www.instagram.com/reels/DVlRv2Ik1Vp/',
  },
  {
    id: 'tp2',
    brand: 'Tinder India',
    platform: 'Instagram',
    caption: 'Dating after 25 hits different — carousel series part 3',
    reach: 12086,
    likes: 665,
    shares: 136,
    engagementRate: 5.5,
    date: '2026-05-06',
  },
  {
    id: 'tp3',
    brand: 'Wakefit',
    platform: 'Instagram',
    caption: 'Mattress flip challenge — May giveaway launch',
    reach: 38600,
    likes: 205,
    shares: 91,
    engagementRate: 0.9,
    date: '2026-05-13',
  },
  {
    id: 'tp4',
    brand: 'FK',
    platform: 'X',
    caption: 'Filter coffee vs cold brew — the eternal debate thread',
    reach: 11755,
    likes: 115,
    shares: 8,
    engagementRate: 3.23,
    date: '2026-05-13',
  },
  {
    id: 'tp5',
    brand: 'Epigamia',
    platform: 'Instagram',
    caption: 'Greek yogurt parfait stack — recipe reel',
    reach: 25000,
    likes: 670,
    shares: 25,
    engagementRate: 2.69,
    date: '2026-05-13',
  },
]
