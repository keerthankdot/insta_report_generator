export type Trajectory = 'Rising' | 'Steady' | 'Needs Attention' | 'New'
export type NoteType = 'Win' | 'Loss' | 'Growth Note' | 'Feedback Area' | 'Observation'
export type Urgency = 'Low' | 'Medium' | 'High'
export type Platform = 'Instagram' | 'LinkedIn' | 'YouTube' | 'X'
export type ContentCategory = 'Humour' | 'Trend' | 'Education' | 'Storytelling' | 'Promo'
export type ContentType = 'Reel' | 'Static' | 'Carousel' | 'Tweet'

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
  logoDomain?: string
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
  contentType: ContentType
  category: ContentCategory
  platform: Platform
  brand: string
  title: string
  liveLink?: string
  insight: string
  views?: number
  likes?: number
  shares?: number
  benchmarkMet?: boolean
  selfRating: number
  explainRating?: string
  whatIdChange?: string
  managerRating?: number
  otherWins?: string
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
  { id: 'p1',  name: 'Shraddha',  role: 'Creator', team: 'Creative', trajectory: 'Rising',          avatarInitials: 'SH', joinedDate: '2025-01-01' },
  { id: 'p2',  name: 'Hari',      role: 'Creator', team: 'Creative', trajectory: 'Steady',          avatarInitials: 'HA', joinedDate: '2025-01-01' },
  { id: 'p3',  name: 'Anand',     role: 'Creator', team: 'Creative', trajectory: 'Rising',          avatarInitials: 'AN', joinedDate: '2025-01-01' },
  { id: 'p4',  name: 'Vedant',    role: 'Creator', team: 'Creative', trajectory: 'Steady',          avatarInitials: 'VE', joinedDate: '2025-01-01' },
  { id: 'p5',  name: 'Stuti',     role: 'Creator', team: 'Creative', trajectory: 'Rising',          avatarInitials: 'ST', joinedDate: '2025-01-01' },
  { id: 'p6',  name: 'Manisha',   role: 'Creator', team: 'Creative', trajectory: 'Steady',          avatarInitials: 'MA', joinedDate: '2025-01-01' },
  { id: 'p7',  name: 'Jonathan',  role: 'Creator', team: 'Creative', trajectory: 'New',             avatarInitials: 'JO', joinedDate: '2025-06-01' },
  { id: 'p8',  name: 'Mahek',     role: 'Creator', team: 'Creative', trajectory: 'Steady',          avatarInitials: 'MH', joinedDate: '2025-01-01' },
  { id: 'p9',  name: 'Shreya',    role: 'Creator', team: 'Creative', trajectory: 'Rising',          avatarInitials: 'SR', joinedDate: '2025-01-01' },
  { id: 'p10', name: 'Jishnu',    role: 'Creator', team: 'Creative', trajectory: 'Steady',          avatarInitials: 'JI', joinedDate: '2025-01-01' },
  { id: 'p11', name: 'Shruti',    role: 'Creator', team: 'Creative', trajectory: 'Needs Attention', avatarInitials: 'SU', joinedDate: '2025-01-01' },
  { id: 'p12', name: 'Niveditha', role: 'Creator', team: 'Creative', trajectory: 'New',             avatarInitials: 'NI', joinedDate: '2025-06-01' },
  { id: 'p13', name: 'Rohan Mehta',  role: 'Account Manager',   team: 'Accounts', trajectory: 'Steady', avatarInitials: 'RM', joinedDate: '2023-05-02' },
  { id: 'p14', name: 'Shreya Patel', role: 'Account Executive',  team: 'Accounts', trajectory: 'Rising', avatarInitials: 'SP', joinedDate: '2025-01-09' },
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
    content: 'Holding Flipkart and Tinder accounts steady. No fires, no breakouts. Time for a stretch project.',
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
    id: 'fk', logoDomain: 'flipkart.com',
    name: 'Flipkart',
    amName: 'Rohan Mehta',
    platforms: ['Instagram', 'X'],
    status: 'active',
    color: '#8B5CF6',
    creatorNames: ['Shraddha', 'Hari', 'Anand'],
  },
  {
    id: 'wakefit', logoDomain: 'wakefit.co',
    name: 'Wakefit',
    amName: 'Shreya Patel',
    platforms: ['Instagram'],
    status: 'active',
    color: '#0EA5E9',
    creatorNames: ['Vedant', 'Stuti'],
  },
  {
    id: 'tinder', logoDomain: 'tinder.com',
    name: 'Tinder India',
    amName: 'Rohan Mehta',
    platforms: ['Instagram'],
    status: 'active',
    color: '#FF6B6B',
    creatorNames: ['Manisha', 'Jonathan'],
  },
  {
    id: 'epigamia', logoDomain: 'epigamia.com',
    name: 'Epigamia',
    amName: 'Shreya Patel',
    platforms: ['Instagram'],
    status: 'attention',
    color: '#F97316',
    creatorNames: ['Mahek', 'Shreya'],
  },
  {
    id: 'phonepe', logoDomain: 'phonepe.com',
    name: 'PhonePe',
    amName: 'Shreya Patel',
    platforms: ['Instagram'],
    status: 'active',
    color: '#5F259F',
    creatorNames: ['Shraddha', 'Jishnu', 'Shruti'],
  },
  {
    id: 'league', logoDomain: 'league.com',
    name: 'League',
    amName: 'Rohan Mehta',
    platforms: ['Instagram', 'X'],
    status: 'attention',
    color: '#10B981',
    creatorNames: ['Niveditha', 'Hari'],
  },
  {
    id: 'fkminutes', logoDomain: 'flipkart.com',
    name: 'Flipkart Minutes',
    amName: 'Rohan Mehta',
    platforms: ['Instagram'],
    status: 'active',
    color: '#F59E0B',
    creatorNames: ['Anand', 'Stuti'],
  },
]

// ===== Weekly Data (10 weeks per brand) =====
export const WEEKLY_DATA: BrandWeeklyData[] = [
  // FK (Filter Kaapi)
  {
    brandId: 'fk',
    instagram: [
      { reach: 736356, engagementRate: 0.75, shares: 493, followersDelta: 670, followersTotal: 9200000 },
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
  // Flipkart Minutes
  {
    brandId: 'fkminutes',
    instagram: [
      null, null, null, null, null, null, null, null, null, null,
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
    contentType: 'Static',
    category: 'Trend',
    platform: 'Instagram',
    brand: 'Flipkart',
    title: 'Met Gala | If the theme was art, why did no one dress like"',
    liveLink: 'https://www.instagram.com/p/example1',
    insight: "We've all made the classic 2 hills, one house drawing in art class as kids",
    likes: 6914,
    shares: 273,
    benchmarkMet: true,
    selfRating: 3,
    explainRating: 'The nostalgic insight which would make you want to comment about your school experience',
    whatIdChange: "I'd post it within hours of the event",
    creatorName: 'Shraddha',
    dateAdded: '2026-05-08',
  },
  {
    id: 'c2',
    contentType: 'Static',
    category: 'Trend',
    platform: 'Instagram',
    brand: 'Flipkart',
    title: "Met Gala | Where's my invite",
    liveLink: 'https://www.instagram.com/p/example2',
    insight: "Isha Ambani wore a mango bag to the red carpet",
    likes: 274,
    shares: 8,
    selfRating: 2,
    explainRating: '-',
    whatIdChange: "The connection to Isha Ambani's outfit was not direct without her image as a reference. Could've gone for something simpler like Swiggy.",
    creatorName: 'Shraddha',
    dateAdded: '2026-05-08',
  },
  {
    id: 'c3',
    contentType: 'Reel',
    category: 'Humour',
    platform: 'Instagram',
    brand: 'PhonePe',
    title: 'Life of an Elder Sister',
    liveLink: 'https://www.instagram.com/p/example3',
    insight: 'Younger siblings constantly nag their didi/bhaiya for money by sending QR codes, asking for OTP, etc.',
    views: 21900,
    likes: 130,
    shares: 19,
    selfRating: 3,
    explainRating: '"Song overlapping rant" format was trending',
    whatIdChange: 'The video is not native-looking, it\'s too stiff. The punchline of the PhonePe audio is coming too late. Trend hashtag.',
    creatorName: 'Shraddha',
    dateAdded: '2026-05-10',
  },
  {
    id: 'c4',
    contentType: 'Tweet',
    category: 'Humour',
    platform: 'X',
    brand: 'Flipkart',
    title: 'Chat is this a bhagona or tapeli?',
    liveLink: 'https://x.com/example4',
    insight: 'This vessel has different names in different households',
    views: 8800,
    likes: 16,
    benchmarkMet: false,
    selfRating: 3,
    explainRating: '-',
    whatIdChange: 'We need to seed responses in the first few hours of posting to get the momentum going maybe even get some brand banter involved.',
    creatorName: 'Shraddha',
    dateAdded: '2026-05-12',
  },
]

// ===== AM Report types =====

export type HealthSignal = 'green' | 'amber' | 'red'

export interface BrandPost {
  id: string
  brandId: string
  title: string
  contentType: ContentType
  platform: Platform
  date: string
  reach?: number
  impressions?: number
  er: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  url?: string
  reel14dEr?: number
  reel30dEr?: number
}

export interface ContentTypeStat {
  contentType: ContentType
  postCount: number
  avgEr: number
  bestPostTitle: string
  bestPostEr: number
}

// Reporting constants
export const PULSE_WEEK_IDX   = 8                   // May 6 week (Week -2 from May 20)
export const PRIOR_WEEK_IDX   = 5                   // Apr 15 (last non-null before May 6 gap)
export const PULSE_PERIOD     = 'May 6 – May 12'
export const MONTHLY_PERIOD_LABEL = 'April 2026'
export const MONTHLY_WEEK_IDXS    = [3, 4, 5, 6, 7] // Apr 1, 8, 15, 22, 29
export const PREV_MONTH_WEEK_IDXS = [0, 1, 2]       // Mar 11, 18, 25

// ===== Post-level data for April (monthly report period) =====

export const BRAND_POSTS: Record<string, BrandPost[]> = {
  fk: [
    // Mar 11 week (Wed–Wed)
    { id: 'fk-m1', brandId: 'fk', title: 'Whose Order – Ep 1: Dog', contentType: 'Reel', platform: 'Instagram', date: '2026-03-11', reach: 400000, er: 0.82, likes: 3280, comments: 410, shares: 260, saves: 1340, url: 'https://www.instagram.com/reels/DVlRv2Ik1Vp/' },
    { id: 'fk-m2', brandId: 'fk', title: "POV: Teachers' 'Important Discussion' during Exam invigilation", contentType: 'Reel', platform: 'Instagram', date: '2026-03-11', reach: 336356, er: 0.68, likes: 2287, comments: 290, shares: 233, saves: 478 },
    { id: 'fk-m3', brandId: 'fk', title: 'Holi', contentType: 'Tweet', platform: 'X', date: '2026-03-11', impressions: 9500, er: 3.10, likes: 185, shares: 9 },
    { id: 'fk-m4', brandId: 'fk', title: 'IndvsEng Semi Finals', contentType: 'Tweet', platform: 'X', date: '2026-03-13', impressions: 8200, er: 2.60, likes: 142, shares: 8 },
    { id: 'fk-m5', brandId: 'fk', title: 'WC Finals', contentType: 'Tweet', platform: 'X', date: '2026-03-15', impressions: 8175, er: 2.40, likes: 129, shares: 8 },
    // Apr posts title: 'Whose Order – Ep5: Cricket', contentType: 'Reel', platform: 'Instagram', date: '2026-04-08', reach: 950000, er: 1.45, likes: 9500, comments: 1150, shares: 210, saves: 3800, reel14dEr: 1.58, reel30dEr: 1.61 },
    { id: 'fk-p2', brandId: 'fk', title: 'Whose Order – Ep4: Serial Aunty', contentType: 'Reel', platform: 'Instagram', date: '2026-04-01', reach: 850000, er: 1.20, likes: 7200, comments: 820, shares: 290, saves: 2700, reel14dEr: 1.31, reel30dEr: 1.35 },
    { id: 'fk-p3', brandId: 'fk', title: 'IPL Predictions 6 teams, 6 outcomes', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-15', reach: 720000, er: 0.95, likes: 5800, comments: 680, shares: 1100, saves: 2500 },
    { id: 'fk-p4', brandId: 'fk', title: 'Samay Raina collab moment', contentType: 'Static', platform: 'Instagram', date: '2026-04-15', reach: 580000, er: 0.72, likes: 4200, comments: 480, shares: 800, saves: 1200 },
    { id: 'fk-p5', brandId: 'fk', title: 'Siblings', contentType: 'Reel', platform: 'Instagram', date: '2026-04-15', reach: 520000, er: 0.68, likes: 3500, comments: 420, shares: 320, saves: 1100, reel14dEr: 0.74, reel30dEr: 0.76 },
    { id: 'fk-p6', brandId: 'fk', title: 'April something new', contentType: 'Static', platform: 'Instagram', date: '2026-04-01', reach: 320000, er: 0.42, likes: 1350, comments: 210, shares: 130, saves: 450 },
    { id: 'fk-p7', brandId: 'fk', title: 'IPL tweet thread best catches of the week', contentType: 'Tweet', platform: 'X', date: '2026-04-08', impressions: 46771, er: 2.20, likes: 580, shares: 289 },
    { id: 'fk-p8', brandId: 'fk', title: 'KitKat Trend break karo, Flipkart karo', contentType: 'Tweet', platform: 'X', date: '2026-04-08', impressions: 60969, er: 6.48, likes: 1820, shares: 289 },
  ],
  wakefit: [
    { id: 'wk-p1', brandId: 'wakefit', title: '5 sleep positions and what they say about you', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-10', reach: 38000, er: 3.20, likes: 1215, comments: 140, shares: 95, saves: 870 },
    { id: 'wk-p2', brandId: 'wakefit', title: 'Mattress science: why you wake up groggy', contentType: 'Reel', platform: 'Instagram', date: '2026-04-03', reach: 42000, er: 2.80, likes: 1175, comments: 156, shares: 89, saves: 750, reel14dEr: 3.10, reel30dEr: 3.24 },
    { id: 'wk-p3', brandId: 'wakefit', title: 'Pillows ranked by sleep scientists', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-24', reach: 28000, er: 2.90, likes: 812, comments: 105, shares: 67, saves: 780 },
    { id: 'wk-p4', brandId: 'wakefit', title: 'Morning routine that changed my sleep', contentType: 'Reel', platform: 'Instagram', date: '2026-04-17', reach: 35000, er: 2.50, likes: 875, comments: 120, shares: 78, saves: 610, reel14dEr: 2.65, reel30dEr: 2.71 },
    { id: 'wk-p5', brandId: 'wakefit', title: 'World Sleep Day reminder', contentType: 'Static', platform: 'Instagram', date: '2026-04-19', reach: 18000, er: 1.20, likes: 216, comments: 48, shares: 32, saves: 220 },
    { id: 'wk-p6', brandId: 'wakefit', title: 'New product: the zero-gravity pillow', contentType: 'Static', platform: 'Instagram', date: '2026-04-07', reach: 15000, er: 0.90, likes: 135, comments: 28, shares: 19, saves: 153 },
  ],
  tinder: [
    { id: 'ti-p1', brandId: 'tinder', title: '5 texts you should never send on a first match', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-09', reach: 10500, er: 6.20, likes: 651, comments: 248, shares: 178, saves: 556 },
    { id: 'ti-p2', brandId: 'tinder', title: 'Dating after 25 is actually better', contentType: 'Reel', platform: 'Instagram', date: '2026-04-02', reach: 12000, er: 5.80, likes: 695, comments: 290, shares: 140, saves: 572, reel14dEr: 6.30, reel30dEr: 6.45 },
    { id: 'ti-p3', brandId: 'tinder', title: 'Dating red flags vs. green flags', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-10', reach: 9500, er: 4.80, likes: 456, comments: 156, shares: 89, saves: 455 },
    { id: 'ti-p4', brandId: 'tinder', title: 'Things people lie about on dating apps', contentType: 'Reel', platform: 'Instagram', date: '2026-04-23', reach: 11000, er: 5.10, likes: 561, comments: 198, shares: 95, saves: 506, reel14dEr: 5.40 },
    { id: 'ti-p5', brandId: 'tinder', title: 'Your vibe attracts your tribe', contentType: 'Static', platform: 'Instagram', date: '2026-04-16', reach: 8200, er: 3.40, likes: 278, comments: 88, shares: 52, saves: 142 },
    { id: 'ti-p6', brandId: 'tinder', title: 'April Fools dating edition', contentType: 'Static', platform: 'Instagram', date: '2026-04-01', reach: 7200, er: 2.10, likes: 151, comments: 56, shares: 29, saves: 115 },
  ],
  epigamia: [
    { id: 'ep-p1', brandId: 'epigamia', title: '5 ways to eat Epigamia without it tasting like health food', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-12', reach: 19500, er: 4.10, likes: 799, comments: 155, shares: 112, saves: 735 },
    { id: 'ep-p2', brandId: 'epigamia', title: 'Greek yogurt at 3pm hits different', contentType: 'Reel', platform: 'Instagram', date: '2026-04-05', reach: 22000, er: 3.50, likes: 770, comments: 180, shares: 89, saves: 650, reel14dEr: 3.72, reel30dEr: 3.81 },
    { id: 'ep-p3', brandId: 'epigamia', title: 'What a nutritionist actually eats for breakfast', contentType: 'Reel', platform: 'Instagram', date: '2026-04-25', reach: 20000, er: 3.20, likes: 640, comments: 145, shares: 78, saves: 617, reel14dEr: 3.38 },
    { id: 'ep-p4', brandId: 'epigamia', title: 'Summer flavour drop', contentType: 'Static', platform: 'Instagram', date: '2026-04-18', reach: 16000, er: 2.80, likes: 448, comments: 98, shares: 65, saves: 448 },
    { id: 'ep-p5', brandId: 'epigamia', title: 'Mango season is here', contentType: 'Static', platform: 'Instagram', date: '2026-04-06', reach: 14000, er: 2.10, likes: 294, comments: 75, shares: 42, saves: 295 },
    { id: 'ep-p6', brandId: 'epigamia', title: 'Protein per 100g know your yogurt', contentType: 'Static', platform: 'Instagram', date: '2026-04-20', reach: 12000, er: 1.50, likes: 180, comments: 43, shares: 28, saves: 189 },
  ],
  phonepe: [
    { id: 'pp-p1', brandId: 'phonepe', title: 'KitKat Trend scan, snap, sorted', contentType: 'Reel', platform: 'Instagram', date: '2026-04-08', reach: 62000, er: 2.80, likes: 1736, comments: 350, shares: 240, saves: 710, reel14dEr: 2.95, reel30dEr: 3.02 },
    { id: 'pp-p2', brandId: 'phonepe', title: 'National Pet Day QRT', contentType: 'Reel', platform: 'Instagram', date: '2026-04-11', reach: 52000, er: 2.50, likes: 1300, comments: 240, shares: 180, saves: 600, reel14dEr: 2.62 },
    { id: 'pp-p3', brandId: 'phonepe', title: 'DC V MI: pay like a champion', contentType: 'Reel', platform: 'Instagram', date: '2026-04-08', reach: 58000, er: 2.40, likes: 1392, comments: 280, shares: 198, saves: 614, reel14dEr: 2.51 },
    { id: 'pp-p4', brandId: 'phonepe', title: 'National Pet Day: pets and payments', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-11', reach: 48000, er: 2.20, likes: 1056, comments: 215, shares: 156, saves: 529 },
    { id: 'pp-p5', brandId: 'phonepe', title: 'Why UPI is the backbone of India', contentType: 'Static', platform: 'Instagram', date: '2026-04-22', reach: 35000, er: 1.80, likes: 630, comments: 135, shares: 89, saves: 378 },
    { id: 'pp-p6', brandId: 'phonepe', title: 'Your payment, your privacy', contentType: 'Static', platform: 'Instagram', date: '2026-04-29', reach: 28000, er: 1.40, likes: 392, comments: 95, shares: 65, saves: 278 },
  ],
  league: [
    { id: 'lg-p1', brandId: 'league', title: 'Culture audit: April round-up', contentType: 'Reel', platform: 'Instagram', date: '2026-04-25', reach: 9000, er: 4.80, likes: 432, comments: 168, shares: 75, saves: 357, reel14dEr: 5.10 },
    { id: 'lg-p2', brandId: 'league', title: 'Why League is where culture meets commerce', contentType: 'Reel', platform: 'Instagram', date: '2026-04-04', reach: 8500, er: 4.20, likes: 357, comments: 145, shares: 62, saves: 289, reel14dEr: 4.44, reel30dEr: 4.51 },
    { id: 'lg-p3', brandId: 'league', title: 'Brands doing social right in 2026', contentType: 'Carousel', platform: 'Instagram', date: '2026-04-11', reach: 7200, er: 3.80, likes: 273, comments: 98, shares: 55, saves: 246 },
    { id: 'lg-p4', brandId: 'league', title: 'Why storytelling beats selling', contentType: 'Static', platform: 'Instagram', date: '2026-04-07', reach: 6200, er: 3.10, likes: 192, comments: 72, shares: 38, saves: 143 },
    { id: 'lg-p5', brandId: 'league', title: 'The League drop: April edition', contentType: 'Static', platform: 'Instagram', date: '2026-04-18', reach: 5800, er: 2.50, likes: 145, comments: 58, shares: 32, saves: 110 },
    { id: 'lg-p6', brandId: 'league', title: 'April got us moving', contentType: 'Static', platform: 'Instagram', date: '2026-04-28', reach: 4800, er: 1.80, likes: 86, comments: 38, shares: 20, saves: 82 },
  ],
}

// ===== Content type performance for April (monthly report) =====

export const CONTENT_TYPE_STATS: Record<string, ContentTypeStat[]> = {
  fk:       [
    { contentType: 'Reel',     postCount: 3, avgEr: 1.11, bestPostTitle: 'Whose Order – Ep5: Cricket',        bestPostEr: 1.45 },
    { contentType: 'Carousel', postCount: 1, avgEr: 0.95, bestPostTitle: 'IPL Predictions 6 teams, 6 outcomes', bestPostEr: 0.95 },
    { contentType: 'Static',   postCount: 2, avgEr: 0.57, bestPostTitle: 'Samay Raina collab moment',         bestPostEr: 0.72 },
    { contentType: 'Tweet',    postCount: 2, avgEr: 4.34, bestPostTitle: 'KitKat Trend break karo',         bestPostEr: 6.48 },
  ],
  wakefit:  [
    { contentType: 'Reel',     postCount: 2, avgEr: 2.65, bestPostTitle: 'Mattress science: why you wake up groggy', bestPostEr: 2.80 },
    { contentType: 'Carousel', postCount: 2, avgEr: 3.05, bestPostTitle: '5 sleep positions and what they say', bestPostEr: 3.20 },
    { contentType: 'Static',   postCount: 2, avgEr: 1.05, bestPostTitle: 'World Sleep Day reminder',          bestPostEr: 1.20 },
  ],
  tinder:   [
    { contentType: 'Reel',     postCount: 2, avgEr: 5.45, bestPostTitle: 'Dating after 25 is actually better', bestPostEr: 5.80 },
    { contentType: 'Carousel', postCount: 2, avgEr: 5.50, bestPostTitle: '5 texts you should never send',     bestPostEr: 6.20 },
    { contentType: 'Static',   postCount: 2, avgEr: 2.75, bestPostTitle: 'Your vibe attracts your tribe',     bestPostEr: 3.40 },
  ],
  epigamia: [
    { contentType: 'Reel',     postCount: 2, avgEr: 3.35, bestPostTitle: 'Greek yogurt at 3pm hits different', bestPostEr: 3.50 },
    { contentType: 'Carousel', postCount: 1, avgEr: 4.10, bestPostTitle: '5 ways to eat Epigamia without it tasting like health food', bestPostEr: 4.10 },
    { contentType: 'Static',   postCount: 3, avgEr: 2.13, bestPostTitle: 'Summer flavour drop',               bestPostEr: 2.80 },
  ],
  phonepe:  [
    { contentType: 'Reel',     postCount: 3, avgEr: 2.57, bestPostTitle: 'KitKat Trend scan, snap, sorted', bestPostEr: 2.80 },
    { contentType: 'Carousel', postCount: 1, avgEr: 2.20, bestPostTitle: 'National Pet Day: pets and payments', bestPostEr: 2.20 },
    { contentType: 'Static',   postCount: 2, avgEr: 1.60, bestPostTitle: 'Why UPI is the backbone of India',  bestPostEr: 1.80 },
  ],
  fkminutes: [],
  league:   [
    { contentType: 'Reel',     postCount: 2, avgEr: 4.50, bestPostTitle: 'Culture audit: April round-up',     bestPostEr: 4.80 },
    { contentType: 'Carousel', postCount: 1, avgEr: 3.80, bestPostTitle: 'Brands doing social right in 2026', bestPostEr: 3.80 },
    { contentType: 'Static',   postCount: 3, avgEr: 2.47, bestPostTitle: 'Why storytelling beats selling',    bestPostEr: 3.10 },
  ],
}

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

export function getBrandPosts(brandId: string): BrandPost[] {
  return (BRAND_POSTS[brandId] ?? []).sort((a, b) => b.er - a.er)
}

export function getContentTypeStats(brandId: string): ContentTypeStat[] {
  return CONTENT_TYPE_STATS[brandId] ?? []
}

// Derive brand health from last 3 non-null IG ER weeks
export function getBrandHealth(brandId: string): { signal: HealthSignal; reason: string } {
  const wd = WEEKLY_DATA.find((d) => d.brandId === brandId)
  if (!wd) return { signal: 'amber', reason: 'No data' }
  const ers = wd.instagram
    .map((w, i) => ({ er: w?.engagementRate, i }))
    .filter((x): x is { er: number; i: number } => x.er !== null && x.er !== undefined)
  if (ers.length < 2) return { signal: 'amber', reason: 'Insufficient data' }
  const last = ers[ers.length - 1].er
  const prev = ers[ers.length - 2].er
  const prev2 = ers.length >= 3 ? ers[ers.length - 3].er : null
  if (last >= prev) return { signal: 'green', reason: `ER ${last.toFixed(2)}%: improving` }
  if (prev2 !== null && last < prev && prev < prev2)
    return { signal: 'red', reason: `ER declining 3+ weeks (${prev2.toFixed(2)} → ${prev.toFixed(2)} → ${last.toFixed(2)}%)` }
  return { signal: 'amber', reason: `ER dipped to ${last.toFixed(2)}% from ${prev.toFixed(2)}%` }
}

// Aggregate weekly stats for a set of week indexes
export function getWeekRangeStats(brandId: string, idxs: number[]) {
  const wd = WEEKLY_DATA.find((d) => d.brandId === brandId)
  if (!wd) return null
  const igWeeks = idxs.map((i) => wd.instagram[i]).filter(Boolean) as InstagramWeek[]
  const xWeeks  = wd.x ? idxs.map((i) => wd.x![i]).filter(Boolean) as XWeek[] : []

  const reaches = igWeeks.map((w) => w.reach).filter((v): v is number => v !== null)
  const ers     = igWeeks.map((w) => w.engagementRate).filter((v): v is number => v !== null)
  const shares  = igWeeks.map((w) => w.shares).filter((v): v is number => v !== null)
  const followers = igWeeks.map((w) => w.followersTotal).filter((v): v is number => v !== null && v !== undefined) as number[]

  const xImps = xWeeks.map((w) => w.impressions).filter((v): v is number => v !== null)
  const xErs  = xWeeks.map((w) => w.engagementRate).filter((v): v is number => v !== null)

  return {
    totalReach:   reaches.reduce((s, v) => s + v, 0),
    avgReach:     reaches.length ? reaches.reduce((s, v) => s + v, 0) / reaches.length : 0,
    avgEr:        ers.length ? ers.reduce((s, v) => s + v, 0) / ers.length : 0,
    totalShares:  shares.reduce((s, v) => s + v, 0),
    latestFollowers: followers[followers.length - 1] ?? null,
    firstFollowers:  followers[0] ?? null,
    weeksWithData: reaches.length,
    xTotalImpressions: xImps.reduce((s, v) => s + v, 0),
    xAvgEr: xErs.length ? xErs.reduce((s, v) => s + v, 0) / xErs.length : 0,
  }
}

export function getBrandsForUser(userName: string, role: string): Brand[] {
  if (role === 'admin' || role === 'manager') return BRANDS
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

// Aggregated totals across all brands for admin view
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
  'Shraddha':  { entriesLogged: 4, avgRating: 3.0, topCategory: 'Reel',     postsLive: 4 },
  'Hari':      { entriesLogged: 3, avgRating: 3.3, topCategory: 'Static',   postsLive: 3 },
  'Anand':     { entriesLogged: 3, avgRating: 3.7, topCategory: 'Carousel', postsLive: 3 },
  'Vedant':    { entriesLogged: 2, avgRating: 4.0, topCategory: 'Reel',     postsLive: 2 },
  'Stuti':     { entriesLogged: 3, avgRating: 3.5, topCategory: 'Static',   postsLive: 3 },
  'Manisha':   { entriesLogged: 4, avgRating: 4.2, topCategory: 'Carousel', postsLive: 4 },
  'Jonathan':  { entriesLogged: 2, avgRating: 3.0, topCategory: 'Reel',     postsLive: 2 },
  'Mahek':     { entriesLogged: 3, avgRating: 3.8, topCategory: 'Static',   postsLive: 3 },
  'Shreya':    { entriesLogged: 4, avgRating: 4.5, topCategory: 'Reel',     postsLive: 4 },
  'Jishnu':    { entriesLogged: 3, avgRating: 3.3, topCategory: 'Carousel', postsLive: 3 },
  'Shruti':    { entriesLogged: 2, avgRating: 2.5, topCategory: 'Static',   postsLive: 2 },
  'Niveditha': { entriesLogged: 1, avgRating: 3.0, topCategory: 'Reel',     postsLive: 1 },
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
    brand: 'Flipkart',
    platform: 'Instagram',
    caption: '"Friendly hai. Kaatega nahi." Whose Order Is It Anyway, Ep 1',
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
    caption: 'Dating after 25 hits different carousel series part 3',
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
    caption: 'Mattress flip challenge May giveaway launch',
    reach: 38600,
    likes: 205,
    shares: 91,
    engagementRate: 0.9,
    date: '2026-05-13',
  },
  {
    id: 'tp4',
    brand: 'Flipkart',
    platform: 'X',
    caption: 'Filter coffee vs cold brew the eternal debate thread',
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
    caption: 'Greek yogurt parfait stack recipe reel',
    reach: 25000,
    likes: 670,
    shares: 25,
    engagementRate: 2.69,
    date: '2026-05-13',
  },
]
