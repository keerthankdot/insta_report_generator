import PptxGenJS from 'pptxgenjs'
import { formatNumber, type BrandPost, type Brand } from './data'

interface RangeStats {
  avgReach: number
  avgEr: number
  totalShares: number
  totalReach: number
  weeksWithData: number
  xTotalImpressions: number
  xAvgEr: number
  latestFollowers?: number | null
}

interface CtStat {
  contentType: string
  postCount: number
  avgEr: number
  bestPostTitle: string
  bestPostEr: number
}

interface WeeklyRow {
  weekLabel: string
  igReach: number | null
  igEr: number | null
  igShares: number | null
  followers: number | null
  xImp: number | null
  xEr: number | null
}

export interface PptxReportParams {
  brand: Brand
  rangeLabel: string
  rangeStats: RangeStats | null
  priorStats: RangeStats | null
  weeklyRows: WeeklyRow[]
  trendValues: { week: string; reach: number | null }[]
  igPosts: BrandPost[]
  ctStats: CtStat[]
  hasX: boolean
}

const WHITE   = 'FFFFFF'
const DARK    = '0F0F11'
const GREY    = '6B7280'
const LGREY   = 'D1D5DB'
const IG_RED  = 'E1306C'
const ACCENT  = '7C3AED'

function hex(color: string): string {
  return color.replace('#', '')
}

function deltaStr(cur: number, prev: number): string {
  if (!prev) return ''
  const pct = ((cur - prev) / prev) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

function fmtOrDash(v: number | null | undefined, pct?: boolean): string {
  if (v === null || v === undefined) return '-'
  if (pct) return `${v.toFixed(2)}%`
  return formatNumber(v)
}

export async function generatePptx(params: PptxReportParams): Promise<void> {
  const { brand, rangeLabel, rangeStats, priorStats, weeklyRows, trendValues, igPosts, ctStats, hasX } = params

  const pptx = new PptxGenJS()
  pptx.layout  = 'LAYOUT_16x9'
  pptx.author  = 'TNT OS by Ascnd'
  pptx.company = 'Ascnd'
  pptx.subject = `${brand.name} Performance Report`
  pptx.title   = `${brand.name} · ${rangeLabel}`

  const brandHex = hex(brand.color)
  const top5     = igPosts.slice(0, 5)

  // ── Helpers ──────────────────────────────────────────────────────────────

  function addSlideHeader(slide: PptxGenJS['addSlide'] extends () => infer S ? S : never, title: string) {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.6, fill: { color: DARK } })
    slide.addText(title, {
      x: 0.4, y: 0.1, w: 8, h: 0.42,
      fontSize: 13, bold: true, color: WHITE, fontFace: 'Calibri',
    })
    slide.addText(`${brand.name}  ·  ${rangeLabel}`, {
      x: 0, y: 0.1, w: 9.6, h: 0.42,
      fontSize: 10, color: 'AAAAAA', fontFace: 'Calibri', align: 'right',
    })
  }

  function addFooter(slide: PptxGenJS['addSlide'] extends () => infer S ? S : never) {
    slide.addText(`TNT OS by Ascnd  ·  Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, {
      x: 0, y: 5.35, w: '100%', h: 0.28,
      fontSize: 8, color: 'AAAAAA', align: 'center', fontFace: 'Calibri',
    })
  }

  // ── Slide 1: Cover ───────────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: DARK }

    // Left accent bar
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.18, h: '100%', fill: { color: brandHex } })

    // Brand initial circle
    slide.addShape(pptx.ShapeType.ellipse, { x: 0.5, y: 1.6, w: 1.0, h: 1.0, fill: { color: brandHex } })
    slide.addText(brand.name.charAt(0).toUpperCase(), {
      x: 0.5, y: 1.6, w: 1.0, h: 1.0,
      fontSize: 30, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: 'Calibri',
    })

    // Brand name
    slide.addText(brand.name, {
      x: 1.7, y: 1.55, w: 7.8, h: 0.8,
      fontSize: 40, bold: true, color: WHITE, fontFace: 'Calibri',
    })

    // Report title
    slide.addText('Performance Report', {
      x: 1.7, y: 2.35, w: 7.8, h: 0.5,
      fontSize: 18, color: 'BBBBBB', fontFace: 'Calibri',
    })

    // Date range
    slide.addText(rangeLabel, {
      x: 1.7, y: 2.85, w: 7.8, h: 0.4,
      fontSize: 14, color: 'AAAAAA', fontFace: 'Calibri',
    })

    // Divider
    slide.addShape(pptx.ShapeType.rect, { x: 1.7, y: 3.35, w: 7.8, h: 0.02, fill: { color: '333333' } })

    // AM name
    slide.addText(`Account Manager: ${brand.amName}`, {
      x: 1.7, y: 3.55, w: 7.8, h: 0.35,
      fontSize: 11, color: GREY, fontFace: 'Calibri',
    })

    // Footer
    slide.addText('TNT OS by Ascnd', {
      x: 0, y: 5.1, w: '100%', h: 0.35,
      fontSize: 9, color: '555555', align: 'center', fontFace: 'Calibri',
    })
  }

  // ── Slide 2: At a Glance ─────────────────────────────────────────────────
  if (rangeStats && rangeStats.weeksWithData > 0) {
    const slide = pptx.addSlide()
    slide.background = { color: 'F9FAFB' }
    addSlideHeader(slide, 'At a Glance')

    const metrics = [
      { label: 'Avg Reach',    value: formatNumber(Math.round(rangeStats.avgReach)),  cur: rangeStats.avgReach,    prev: priorStats?.avgReach    ?? 0, color: brandHex },
      { label: 'Avg ER',       value: `${rangeStats.avgEr.toFixed(2)}%`,              cur: rangeStats.avgEr,       prev: priorStats?.avgEr        ?? 0, color: IG_RED   },
      { label: 'Total Shares', value: formatNumber(rangeStats.totalShares),           cur: rangeStats.totalShares, prev: priorStats?.totalShares  ?? 0, color: ACCENT   },
      { label: 'Total Reach',  value: formatNumber(rangeStats.totalReach),            cur: rangeStats.totalReach,  prev: priorStats?.totalReach   ?? 0, color: '059669' },
    ]

    metrics.forEach((m, i) => {
      const x = 0.3 + i * 2.4
      slide.addShape(pptx.ShapeType.rect, { x, y: 0.8, w: 2.2, h: 1.8, fill: { color: WHITE }, line: { color: LGREY, pt: 1 }, rectRadius: 0.08 })
      slide.addShape(pptx.ShapeType.rect, { x, y: 0.8, w: 2.2, h: 0.12, fill: { color: m.color }, rectRadius: 0.08 })
      slide.addText(m.label, { x, y: 1.0, w: 2.2, h: 0.3, fontSize: 9, color: GREY, align: 'center', fontFace: 'Calibri' })
      slide.addText(m.value, { x, y: 1.3, w: 2.2, h: 0.7, fontSize: 22, bold: true, color: DARK, align: 'center', fontFace: 'Calibri' })
      if (m.prev > 0) {
        const d = deltaStr(m.cur, m.prev)
        const up = m.cur >= m.prev
        slide.addText(`${d} vs prior`, { x, y: 2.0, w: 2.2, h: 0.4, fontSize: 9, color: up ? '059669' : 'DC2626', align: 'center', fontFace: 'Calibri' })
      }
    })

    // X row if available
    if (hasX && rangeStats.xTotalImpressions > 0) {
      const xMetrics = [
        { label: 'X Impressions', value: formatNumber(rangeStats.xTotalImpressions), cur: rangeStats.xTotalImpressions, prev: priorStats?.xTotalImpressions ?? 0 },
        { label: 'X Avg ER',      value: `${rangeStats.xAvgEr.toFixed(2)}%`,         cur: rangeStats.xAvgEr,            prev: priorStats?.xAvgEr             ?? 0 },
      ]
      xMetrics.forEach((m, i) => {
        const x = 0.3 + i * 2.4
        slide.addShape(pptx.ShapeType.rect, { x, y: 2.85, w: 2.2, h: 1.4, fill: { color: WHITE }, line: { color: LGREY, pt: 1 }, rectRadius: 0.08 })
        slide.addText(m.label, { x, y: 2.95, w: 2.2, h: 0.3, fontSize: 9, color: GREY, align: 'center', fontFace: 'Calibri' })
        slide.addText(m.value, { x, y: 3.25, w: 2.2, h: 0.6, fontSize: 20, bold: true, color: DARK, align: 'center', fontFace: 'Calibri' })
        if (m.prev > 0) {
          const d = deltaStr(m.cur, m.prev)
          const up = m.cur >= m.prev
          slide.addText(`${d} vs prior`, { x, y: 3.85, w: 2.2, h: 0.3, fontSize: 9, color: up ? '059669' : 'DC2626', align: 'center', fontFace: 'Calibri' })
        }
      })
    }

    addFooter(slide)
  }

  // ── Slide 3: Reach Trend ─────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: 'F9FAFB' }
    addSlideHeader(slide, 'Reach Trend')

    const chartData = [{
      name: 'IG Reach',
      labels: trendValues.map((t) => t.week),
      values: trendValues.map((t) => t.reach ?? 0),
    }]

    slide.addChart(pptx.ChartType.line, chartData, {
      x: 0.4, y: 0.75, w: 9.2, h: 4.4,
      chartColors: [IG_RED],
      lineDataSymbol: 'circle',
      lineDataSymbolSize: 6,
      lineSmooth: false,
      showLegend: true,
      legendPos: 'b',
      legendFontSize: 10,
      catAxisLabelFontSize: 10,
      valAxisLabelFontSize: 10,
      valAxisLabelFormatCode: '#,##0',
      catGridLine: { style: 'none' },
    })

    addFooter(slide)
  }

  // ── Slide 4: Weekly Breakdown ─────────────────────────────────────────────
  if (weeklyRows.length > 0) {
    const slide = pptx.addSlide()
    slide.background = { color: 'F9FAFB' }
    addSlideHeader(slide, 'Weekly Breakdown')

    const colDefs = [
      { label: 'Week',       width: 1.2 },
      { label: 'IG Reach',   width: 1.3 },
      { label: 'IG ER',      width: 1.1 },
      { label: 'IG Shares',  width: 1.2 },
      { label: 'Followers',  width: 1.3 },
      ...(hasX ? [{ label: 'X Impressions', width: 1.5 }, { label: 'X ER', width: 1.1 }] : []),
    ]

    const headerRow = colDefs.map((c) => ({
      text: c.label,
      options: { bold: true, fontSize: 9, color: WHITE, fill: { color: DARK }, align: 'center' as const, fontFace: 'Calibri' },
    }))

    const dataRows = weeklyRows.map((r, idx) => {
      const bg = idx % 2 === 0 ? 'FFFFFF' : 'F3F4F6'
      const cell = (val: string) => ({
        text: val,
        options: { fontSize: 9, color: DARK, fill: { color: bg }, align: 'center' as const, fontFace: 'Calibri' },
      })
      const row = [
        { text: r.weekLabel, options: { fontSize: 9, bold: true, color: DARK, fill: { color: bg }, align: 'left' as const, fontFace: 'Calibri', margin: [0, 0, 0, 6] as [number,number,number,number] } },
        cell(fmtOrDash(r.igReach)),
        cell(fmtOrDash(r.igEr, true)),
        cell(fmtOrDash(r.igShares)),
        cell(fmtOrDash(r.followers)),
        ...(hasX ? [cell(fmtOrDash(r.xImp)), cell(fmtOrDash(r.xEr, true))] : []),
      ]
      return row
    })

    const colW = colDefs.map((c) => c.width)
    const totalW = colW.reduce((s, v) => s + v, 0)
    const xStart = (10 - totalW) / 2

    slide.addTable([headerRow, ...dataRows], {
      x: xStart, y: 0.7, w: totalW,
      colW,
      border: { type: 'solid', color: LGREY, pt: 0.5 },
      autoPage: true,
      autoPageRepeatHeader: true,
      fontSize: 9,
    })

    addFooter(slide)
  }

  // ── Slide 5: Content Type Performance ────────────────────────────────────
  if (ctStats.length > 0) {
    const slide = pptx.addSlide()
    slide.background = { color: 'F9FAFB' }
    addSlideHeader(slide, 'Content Type Performance')

    const chartData = [{
      name: 'Avg ER',
      labels: ctStats.map((s) => s.contentType),
      values: ctStats.map((s) => parseFloat(s.avgEr.toFixed(2))),
    }]

    const ctColorMap: Record<string, string> = { Reel: IG_RED, Carousel: '8B5CF6', Static: '0EA5E9', Tweet: '38BDF8' }

    slide.addChart(pptx.ChartType.bar, chartData, {
      x: 0.4, y: 0.7, w: 5.2, h: 4.5,
      chartColors: ctStats.map((s) => ctColorMap[s.contentType] ?? '999999'),
      barDir: 'col',
      showLegend: false,
      catAxisLabelFontSize: 11,
      valAxisLabelFontSize: 10,
      valAxisLabelFormatCode: '0.00"%"',
      valGridLine: { style: 'solid', color: 'E5E7EB' },
      dataLabelFontSize: 10,
      showValue: true,
    })

    // Table on right
    const tHeader = [
      ['Type', 'Posts', 'Avg ER', 'Best ER'].map((h) => ({
        text: h,
        options: { bold: true, fontSize: 9, color: WHITE, fill: { color: DARK }, align: 'center' as const, fontFace: 'Calibri' },
      })),
    ]
    const tRows = ctStats.map((s, idx) => {
      const bg = idx % 2 === 0 ? 'FFFFFF' : 'F3F4F6'
      const cell = (val: string) => ({ text: val, options: { fontSize: 9, color: DARK, fill: { color: bg }, align: 'center' as const, fontFace: 'Calibri' } })
      return [
        { text: s.contentType, options: { fontSize: 9, bold: true, color: DARK, fill: { color: bg }, align: 'left' as const, fontFace: 'Calibri', margin: [0, 0, 0, 6] as [number,number,number,number] } },
        cell(String(s.postCount)),
        cell(`${s.avgEr.toFixed(2)}%`),
        cell(`${s.bestPostEr.toFixed(2)}%`),
      ]
    })
    slide.addTable([...tHeader, ...tRows], {
      x: 6.0, y: 1.0, w: 3.6,
      colW: [1.2, 0.7, 0.9, 0.8],
      border: { type: 'solid', color: LGREY, pt: 0.5 },
      fontSize: 9,
    })

    addFooter(slide)
  }

  // ── Slide 6: Top Posts ───────────────────────────────────────────────────
  if (top5.length > 0) {
    const slide = pptx.addSlide()
    slide.background = { color: 'F9FAFB' }
    addSlideHeader(slide, 'Top Posts by ER')

    const tHeader = [
      ['#', 'Type', 'Date', 'Title', 'Reach', 'ER'].map((h) => ({
        text: h,
        options: { bold: true, fontSize: 9, color: WHITE, fill: { color: DARK }, align: 'center' as const, fontFace: 'Calibri' },
      })),
    ]
    const tRows = top5.map((p, i) => {
      const bg = i % 2 === 0 ? 'FFFFFF' : 'F3F4F6'
      const cell = (val: string, left = false) => ({
        text: val,
        options: { fontSize: 9, color: DARK, fill: { color: bg }, align: left ? 'left' as const : 'center' as const, fontFace: 'Calibri' },
      })
      return [
        cell(String(i + 1)),
        cell(p.contentType),
        cell(p.date),
        { text: p.title, options: { fontSize: 9, color: DARK, fill: { color: bg }, align: 'left' as const, fontFace: 'Calibri', margin: [0, 0, 0, 4] as [number,number,number,number] } },
        cell(fmtOrDash(p.reach ?? p.impressions)),
        cell(`${p.er.toFixed(2)}%`),
      ]
    })

    slide.addTable([...tHeader, ...tRows], {
      x: 0.3, y: 0.7, w: 9.4,
      colW: [0.4, 0.9, 1.0, 4.6, 1.3, 1.2],
      border: { type: 'solid', color: LGREY, pt: 0.5 },
      fontSize: 9,
      rowH: 0.55,
    })

    addFooter(slide)
  }

  // ── Slide 7: AM Insights ─────────────────────────────────────────────────
  {
    const slide = pptx.addSlide()
    slide.background = { color: DARK }
    addSlideHeader(slide, 'AM Insight Layer')

    const sections = [
      { label: 'Executive Summary', hint: 'What did this period look like? The one thing that worked and one thing to address.' },
      { label: 'Insights & Recommendations', hint: 'Data point → reason → action. 2-3 specific actions.' },
      { label: 'Next Period Focus', hint: 'What will we test, retire, or double down on?' },
    ]

    sections.forEach((s, i) => {
      const y = 0.75 + i * 1.55
      slide.addShape(pptx.ShapeType.rect, { x: 0.4, y, w: 9.2, h: 1.35, fill: { color: '1A1A1F' }, line: { color: '333333', pt: 1 }, rectRadius: 0.08 })
      slide.addText(s.label.toUpperCase(), { x: 0.65, y: y + 0.1, w: 8.7, h: 0.25, fontSize: 8, bold: true, color: '888888', fontFace: 'Calibri', charSpacing: 1 })
      slide.addText(s.hint, { x: 0.65, y: y + 0.35, w: 8.7, h: 0.7, fontSize: 10, color: '555555', fontFace: 'Calibri', italic: true })
    })

    slide.addText('Fill in above before sharing with the client.', {
      x: 0, y: 5.35, w: '100%', h: 0.28,
      fontSize: 8, color: '555555', align: 'center', fontFace: 'Calibri',
    })
  }

  // ── Write file ───────────────────────────────────────────────────────────
  await pptx.writeFile({ fileName: `${brand.name} — ${rangeLabel} — TNT Report.pptx` })
}

export type { WeeklyRow }
