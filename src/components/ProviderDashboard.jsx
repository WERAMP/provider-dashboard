import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, Customized, ReferenceLine
} from 'recharts';

/* ─── Design Tokens ─── */
const T = {
  bg: '#F8F7F4',
  navy: '#0f172a',
  gold: '#C9A96E',
  border: '#E8E5DE',
  divider: '#F0EDE6',
  body: '#1F2937',
  muted: '#6b7280',
  slate: '#94a3b8',
  white: '#ffffff',
  serif: "'GFS Didot', Didot, Georgia, serif",
  sans: "'Nunito Sans', 'Avenir Next', Avenir, sans-serif",
};

/* ─── Provider Data (CorralData: Jessica Beaugris, Ever/Body-Logan Circle) ─── */
const PROVIDER = { name: 'Jessica Beaugris', title: 'NP', location: 'Logan Circle' };

const TODAY_APPOINTMENTS = [
  { time: '9:00 AM', patient: 'Sarah Chen', service: 'Botox — Full Face', duration: '30 min', status: 'Confirmed' },
  { time: '9:45 AM', patient: 'Maria Lopez', service: 'Dermal Filler — Lips', duration: '45 min', status: 'Confirmed' },
  { time: '10:45 AM', patient: 'Jessica Park', service: 'Hydrafacial Signature', duration: '60 min', status: 'Checked In' },
  { time: '12:00 PM', patient: 'Emily Tran', service: 'Coolsculpting — Abdomen', duration: '60 min', status: 'Confirmed' },
  { time: '1:15 PM', patient: 'Amanda White', service: 'Laser Hair Removal', duration: '30 min', status: 'Confirmed' },
  { time: '2:00 PM', patient: 'Rachel Kim', service: 'Botox — Forehead', duration: '30 min', status: 'Waitlist' },
  { time: '2:45 PM', patient: 'Diana Ross', service: 'Chemical Peel — VI Peel', duration: '45 min', status: 'Confirmed' },
  { time: '3:45 PM', patient: 'Lauren Hayes', service: 'Microneedling + PRP', duration: '60 min', status: 'Confirmed' },
  { time: '5:00 PM', patient: 'Sophia Martinez', service: 'Sculptra — Temples', duration: '45 min', status: 'Confirmed' },
  { time: '6:00 PM', patient: 'Olivia Bennett', service: 'Botox Touch-Up', duration: '15 min', status: 'Confirmed' },
];

const RECENT_APPOINTMENTS = [
  { date: 'Mar 15', patient: 'Nina Patel', service: 'Botox — Forehead', revenue: 450 },
  { date: 'Mar 15', patient: 'Grace Liu', service: 'Filler — Cheeks', revenue: 1200 },
  { date: 'Mar 14', patient: 'Tara Singh', service: 'Hydrafacial Deluxe', revenue: 350 },
  { date: 'Mar 14', patient: 'Kim Nguyen', service: 'Laser Genesis', revenue: 500 },
  { date: 'Mar 13', patient: 'Mia Johnson', service: 'Coolsculpting — Flanks', revenue: 1500 },
  { date: 'Mar 12', patient: 'Zoe Adams', service: 'Botox — Crow\'s Feet', revenue: 350 },
  { date: 'Mar 11', patient: 'Hannah Lee', service: 'VI Peel', revenue: 450 },
  { date: 'Mar 10', patient: 'Ella Thomas', service: 'Sculptra — Face', revenue: 2100 },
];

/* ─── Equity Tier Thresholds (annual) ─── */
const TIERS = {
  gold:     { label: 'Gold',     annual: 700000,  equity: 10000, color: '#C9A96E' },
  platinum: { label: 'Platinum', annual: 900000,  equity: 20000, color: '#94a3b8' },
  diamond:  { label: 'Diamond',  annual: 1000000, equity: 50000, color: '#7dd3fc', coe: true },
};
const TIER_MONTHLY = {
  gold:     TIERS.gold.annual / 12,
  platinum: TIERS.platinum.annual / 12,
  diamond:  TIERS.diamond.annual / 12,
};

/* ─── Monthly Service Sales (YTD 2026 — CorralData) ─── */
const MONTHLY_SALES = [
  { month: 'Jan', sales: 75027 },
  { month: 'Feb', sales: 87973 },
  { month: 'Mar', sales: 38105 },
  { month: 'Apr', sales: null },
  { month: 'May', sales: null },
  { month: 'Jun', sales: null },
  { month: 'Jul', sales: null },
  { month: 'Aug', sales: null },
  { month: 'Sep', sales: null },
  { month: 'Oct', sales: null },
  { month: 'Nov', sales: null },
  { month: 'Dec', sales: null },
];

/* Clustered column chart data (Row 10–14 from template) */
const CLUSTERED_DATA = MONTHLY_SALES.map(d => ({
  month: d.month,
  sales: d.sales,
  gold: Math.round(TIER_MONTHLY.gold),
  platinum: Math.round(TIER_MONTHLY.platinum),
  diamond: Math.round(TIER_MONTHLY.diamond),
}));

/* Cumulative line chart data (Row 16–20 from template) */
const CUMULATIVE_DATA = (() => {
  let cumSales = 0, cumGold = 0, cumPlat = 0, cumDiam = 0;
  return MONTHLY_SALES.map(d => {
    cumGold += Math.round(TIER_MONTHLY.gold);
    cumPlat += Math.round(TIER_MONTHLY.platinum);
    cumDiam += Math.round(TIER_MONTHLY.diamond);
    if (d.sales !== null) cumSales += d.sales;
    return {
      month: d.month,
      sales: d.sales !== null ? cumSales : null,
      gold: cumGold,
      platinum: cumPlat,
      diamond: cumDiam,
    };
  });
})();

/* Months with actual data (YTD through current month) — used to filter non-tier charts */
const YTD_MONTHS = MONTHLY_SALES.filter(d => d.sales !== null).map(d => d.month);

/* Injectables KPI data — CorralData (filler line_items/appts = avg syringes; BTX rev/appts / $14 ≈ avg units) */
const INJECTABLES_DATA = [
  { month: 'Jan', avgSyringes: 1.4, avgBTXUnits: 33 },
  { month: 'Feb', avgSyringes: 1.3, avgBTXUnits: 37 },
  { month: 'Mar', avgSyringes: 1.4, avgBTXUnits: 43 },
  { month: 'Apr', avgSyringes: null, avgBTXUnits: null },
  { month: 'May', avgSyringes: null, avgBTXUnits: null },
  { month: 'Jun', avgSyringes: null, avgBTXUnits: null },
  { month: 'Jul', avgSyringes: null, avgBTXUnits: null },
  { month: 'Aug', avgSyringes: null, avgBTXUnits: null },
  { month: 'Sep', avgSyringes: null, avgBTXUnits: null },
  { month: 'Oct', avgSyringes: null, avgBTXUnits: null },
  { month: 'Nov', avgSyringes: null, avgBTXUnits: null },
  { month: 'Dec', avgSyringes: null, avgBTXUnits: null },
];

/* Revenue efficiency data — CorralData (rev/patients, rev/new patients, rev/net sched hr) */
const REVENUE_EFFICIENCY_DATA = [
  { month: 'Jan', avgRevPerPatient: 521, avgRevPerNewPatient: 438, revPerNetSchedHr: 853 },
  { month: 'Feb', avgRevPerPatient: 583, avgRevPerNewPatient: 472, revPerNetSchedHr: 978 },
  { month: 'Mar', avgRevPerPatient: 595, avgRevPerNewPatient: 485, revPerNetSchedHr: 847 },
  { month: 'Apr', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'May', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'Jun', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'Jul', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'Aug', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'Sep', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'Oct', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'Nov', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
  { month: 'Dec', avgRevPerPatient: null, avgRevPerNewPatient: null, revPerNetSchedHr: null },
];

/* ─── Benchmark Providers (Top 20 by YTD Sales, filtered to similar profile) ─── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const nullPad = (arr) => [...arr, ...Array(12 - arr.length).fill(null)];

/* Benchmark providers — CorralData top 20 by YTD sales, similar service mix to Jessica (74.6% inj) */
const BENCHMARK_PROVIDERS = [
  {
    name: 'Kate Wilde', short: 'K. Wilde', practice: 'Pur Skin Clinic', location: 'Edmonds', color: '#ef4444',
    monthlySales: nullPad([94590, 77722, 40538]),
    syringes: nullPad([1.8, 1.8, 1.2]), btxUnits: nullPad([43, 44, 45]),
    revPerPatient: nullPad([739, 682, 687]), revPerNewPatient: nullPad([580, 530, 540]), revPerSchedHr: nullPad([1631, 1340, 699]),
  },
  {
    name: 'Janna Sheire', short: 'J. Sheire', practice: 'Ever/Body', location: 'Flatiron', color: '#8b5cf6',
    monthlySales: nullPad([107918, 98337, 43168]),
    syringes: nullPad([1.2, 1.2, 1.1]), btxUnits: nullPad([38, 39, 37]),
    revPerPatient: nullPad([600, 603, 553]), revPerNewPatient: nullPad([490, 485, 450]), revPerSchedHr: nullPad([1124, 1024, 450]),
  },
  {
    name: 'Kristin Dachenhausen', short: 'K. Dachen.', practice: 'Glo Med Spa', location: 'Wilmington', color: '#10b981',
    monthlySales: nullPad([82489, 124593, 60560]),
    syringes: nullPad([1.6, 1.8, 1.6]), btxUnits: nullPad([37, 35, 37]),
    revPerPatient: nullPad([801, 848, 704]), revPerNewPatient: nullPad([620, 660, 550]), revPerSchedHr: nullPad([825, 1246, 606]),
  },
  {
    name: 'Megan Abuelkhair', short: 'M. Abuelk.', practice: 'Pur Skin Clinic', location: 'Edmonds', color: '#f59e0b',
    monthlySales: nullPad([100541, 100033, 57241]),
    syringes: nullPad([2.1, 2.0, 1.9]), btxUnits: nullPad([41, 42, 43]),
    revPerPatient: nullPad([595, 685, 795]), revPerNewPatient: nullPad([470, 540, 620]), revPerSchedHr: nullPad([1183, 1177, 673]),
  },
  {
    name: 'Kachiu Lee', short: 'K. Lee', practice: 'Main Line Laser', location: 'Ardmore', color: '#ec4899',
    monthlySales: nullPad([94948, 117718, 42751]),
    syringes: nullPad([1.7, 1.7, 2.0]), btxUnits: nullPad([34, 35, 31]),
    revPerPatient: nullPad([693, 823, 620]), revPerNewPatient: nullPad([540, 640, 480]), revPerSchedHr: nullPad([1461, 1811, 658]),
  },
];

/* Merged benchmark datasets */
const BENCH_SALES_DATA = MONTHS.map((m, i) => {
  const row = { month: m, current: MONTHLY_SALES[i]?.sales ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.monthlySales[i]; });
  row.gold = Math.round(TIERS.gold.annual / 12);
  row.platinum = Math.round(TIERS.platinum.annual / 12);
  row.diamond = Math.round(TIERS.diamond.annual / 12);
  return row;
});

const BENCH_CUMULATIVE_DATA = (() => {
  const cums = { current: 0 };
  BENCHMARK_PROVIDERS.forEach(p => { cums[p.name] = 0; });
  let cumGold = 0, cumPlat = 0, cumDiam = 0;
  return MONTHS.map((m, i) => {
    cumGold += Math.round(TIERS.gold.annual / 12);
    cumPlat += Math.round(TIERS.platinum.annual / 12);
    cumDiam += Math.round(TIERS.diamond.annual / 12);
    const s = MONTHLY_SALES[i]?.sales;
    if (s !== null && s !== undefined) cums.current += s;
    const row = { month: m, current: s !== null && s !== undefined ? cums.current : null, gold: cumGold, platinum: cumPlat, diamond: cumDiam };
    BENCHMARK_PROVIDERS.forEach(p => {
      const v = p.monthlySales[i];
      if (v !== null && v !== undefined) cums[p.name] += v;
      row[p.name] = v !== null && v !== undefined ? cums[p.name] : null;
    });
    return row;
  });
})();

const BENCH_SYRINGES_DATA = MONTHS.map((m, i) => {
  const row = { month: m, current: INJECTABLES_DATA[i]?.avgSyringes ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.syringes[i]; });
  return row;
});

const BENCH_BTX_DATA = MONTHS.map((m, i) => {
  const row = { month: m, current: INJECTABLES_DATA[i]?.avgBTXUnits ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.btxUnits[i]; });
  return row;
});

const BENCH_REV_PER_PATIENT = MONTHS.map((m, i) => {
  const row = { month: m, current: REVENUE_EFFICIENCY_DATA[i]?.avgRevPerPatient ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.revPerPatient[i]; });
  return row;
});

const BENCH_REV_PER_NEW = MONTHS.map((m, i) => {
  const row = { month: m, current: REVENUE_EFFICIENCY_DATA[i]?.avgRevPerNewPatient ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.revPerNewPatient[i]; });
  return row;
});

const BENCH_REV_PER_HR = MONTHS.map((m, i) => {
  const row = { month: m, current: REVENUE_EFFICIENCY_DATA[i]?.revPerNetSchedHr ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.revPerSchedHr[i]; });
  return row;
});

/* Peer average datasets (for Variant 2) */
const peerAvg = (arr, key) => {
  const vals = BENCHMARK_PROVIDERS.map(p => arr.find(r => r.month === key)?.[p.name]).filter(v => v !== null && v !== undefined);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
};

const BENCH_INJ_AVG_DATA = MONTHS.map((m, i) => ({
  month: m,
  currentSyringes: INJECTABLES_DATA[i]?.avgSyringes ?? null,
  currentBTX: INJECTABLES_DATA[i]?.avgBTXUnits ?? null,
  peerAvgSyringes: peerAvg(BENCH_SYRINGES_DATA, m) !== null ? Math.round(peerAvg(BENCH_SYRINGES_DATA, m) * 10) / 10 : null,
  peerAvgBTX: peerAvg(BENCH_BTX_DATA, m) !== null ? Math.round(peerAvg(BENCH_BTX_DATA, m)) : null,
}));

const BENCH_EFF_AVG_DATA = MONTHS.map((m, i) => ({
  month: m,
  currentRevPatient: REVENUE_EFFICIENCY_DATA[i]?.avgRevPerPatient ?? null,
  currentRevNew: REVENUE_EFFICIENCY_DATA[i]?.avgRevPerNewPatient ?? null,
  currentRevHr: REVENUE_EFFICIENCY_DATA[i]?.revPerNetSchedHr ?? null,
  peerAvgRevPatient: peerAvg(BENCH_REV_PER_PATIENT, m) !== null ? Math.round(peerAvg(BENCH_REV_PER_PATIENT, m)) : null,
  peerAvgRevNew: peerAvg(BENCH_REV_PER_NEW, m) !== null ? Math.round(peerAvg(BENCH_REV_PER_NEW, m)) : null,
  peerAvgRevHr: peerAvg(BENCH_REV_PER_HR, m) !== null ? Math.round(peerAvg(BENCH_REV_PER_HR, m)) : null,
}));

/* Combined datasets for Variant 4 (individual peers + peer average in one array) */
const BENCH_SYRINGES_FULL = MONTHS.map((m, i) => {
  const row = { month: m, current: INJECTABLES_DATA[i]?.avgSyringes ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.syringes[i]; });
  const vals = BENCHMARK_PROVIDERS.map(p => p.syringes[i]).filter(v => v !== null && v !== undefined);
  row.peerAvg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 10) / 10 : null;
  return row;
});

const BENCH_BTX_FULL = MONTHS.map((m, i) => {
  const row = { month: m, current: INJECTABLES_DATA[i]?.avgBTXUnits ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.btxUnits[i]; });
  const vals = BENCHMARK_PROVIDERS.map(p => p.btxUnits[i]).filter(v => v !== null && v !== undefined);
  row.peerAvg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  return row;
});

const BENCH_REV_PATIENT_FULL = MONTHS.map((m, i) => {
  const row = { month: m, current: REVENUE_EFFICIENCY_DATA[i]?.avgRevPerPatient ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.revPerPatient[i]; });
  const vals = BENCHMARK_PROVIDERS.map(p => p.revPerPatient[i]).filter(v => v !== null && v !== undefined);
  row.peerAvg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  return row;
});

const BENCH_REV_NEW_FULL = MONTHS.map((m, i) => {
  const row = { month: m, current: REVENUE_EFFICIENCY_DATA[i]?.avgRevPerNewPatient ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.revPerNewPatient[i]; });
  const vals = BENCHMARK_PROVIDERS.map(p => p.revPerNewPatient[i]).filter(v => v !== null && v !== undefined);
  row.peerAvg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  return row;
});

const BENCH_REV_HR_FULL = MONTHS.map((m, i) => {
  const row = { month: m, current: REVENUE_EFFICIENCY_DATA[i]?.revPerNetSchedHr ?? null };
  BENCHMARK_PROVIDERS.forEach(p => { row[p.name] = p.revPerSchedHr[i]; });
  const vals = BENCHMARK_PROVIDERS.map(p => p.revPerSchedHr[i]).filter(v => v !== null && v !== undefined);
  row.peerAvg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  return row;
});

/* Filter helper: only months with actual data (Jan–Mar for 2026) */
const ytd = (arr) => arr.filter(d => YTD_MONTHS.includes(d.month));

const YTD_SALES = MONTHLY_SALES.reduce((s, d) => s + (d.sales || 0), 0);
const MONTHS_ELAPSED = MONTHLY_SALES.filter(d => d.sales !== null).length;

/* Service breakdown — CorralData YTD */
const SERVICE_BREAKDOWN = [
  { category: 'Injectables', revenue: 150073, pct: 74.6, appts: 237 },
  { category: 'Skin Rejuvenation', revenue: 22448, pct: 11.2, appts: 52 },
  { category: 'Laser Hair Reduction', revenue: 20630, pct: 10.3, appts: 75 },
  { category: 'Body Contouring', revenue: 7504, pct: 3.7, appts: 9 },
  { category: 'Consultation', revenue: 450, pct: 0.2, appts: 74 },
];

const RETAIL_RECOMMENDATIONS = [
  { patient: 'Sarah Chen', service: 'Botox — Full Face', lastProduct: 'SkinCeuticals C E Ferulic', daysSince: 45, recommendation: 'SkinCeuticals HA Intensifier', confidence: 'Product Pattern', why: 'Sarah purchased C E Ferulic 45 days ago. Patients who use this serum see 3x better results when paired with HA Intensifier for deeper hydration post-Botox.' },
  { patient: 'Jessica Park', service: 'Hydrafacial Signature', lastProduct: 'Alastin Restorative Skin Complex', daysSince: 92, recommendation: 'Alastin Regenerating Skin Nectar', confidence: 'Service Match', why: 'Her Alastin is likely running low after 92 days. The Regenerating Skin Nectar extends Hydrafacial results and pairs naturally with her existing Alastin routine.' },
  { patient: 'Emily Tran', service: 'Coolsculpting — Abdomen', lastProduct: 'None on file', daysSince: null, recommendation: 'Revision Nectifirm Advanced', confidence: 'Universal', why: 'First-time retail opportunity — Nectifirm Advanced is our top seller for body-contouring patients. Great entry point for building a skincare routine.' },
  { patient: 'Diana Ross', service: 'Chemical Peel — VI Peel', lastProduct: 'EltaMD UV Clear SPF 46', daysSince: 28, recommendation: 'VI Derm Post-Treatment Repair Cream', confidence: 'Service Match', why: 'VI Peel patients need the post-treatment repair cream for optimal healing. She already uses EltaMD SPF so she understands the importance of aftercare.' },
  { patient: 'Lauren Hayes', service: 'Microneedling + PRP', lastProduct: 'SkinMedica TNS Advanced+', daysSince: 67, recommendation: 'SkinMedica HA5 Rejuvenating Hydrator', confidence: 'Product Pattern', why: 'Patients using TNS Advanced+ get enhanced microneedling results with HA5 — it supports the skin barrier during the recovery phase.' },
  { patient: 'Sophia Martinez', service: 'Sculptra — Temples', lastProduct: 'Revision DEJ Night Face Cream', daysSince: 110, recommendation: 'Revision DEJ Face Cream (day)', confidence: 'Product Pattern', why: 'Sophia uses the night cream but not the day cream. Completing the DEJ pair maximizes collagen support, which is exactly what Sculptra stimulates.' },
];

const WEEK_SCHEDULE = {
  'Mon 3/16': [
    { time: '9:00 AM', patient: 'Sarah Chen', service: 'Botox — Full Face', duration: '30 min', status: 'Confirmed' },
    { time: '9:45 AM', patient: 'Maria Lopez', service: 'Dermal Filler — Lips', duration: '45 min', status: 'Confirmed' },
    { time: '10:45 AM', patient: 'Jessica Park', service: 'Hydrafacial Signature', duration: '60 min', status: 'Checked In' },
    { time: '12:00 PM', patient: 'Emily Tran', service: 'Coolsculpting — Abdomen', duration: '60 min', status: 'Confirmed' },
    { time: '1:15 PM', patient: 'Amanda White', service: 'Laser Hair Removal', duration: '30 min', status: 'Confirmed' },
    { time: '2:00 PM', patient: 'Rachel Kim', service: 'Botox — Forehead', duration: '30 min', status: 'Waitlist' },
    { time: '2:45 PM', patient: 'Diana Ross', service: 'Chemical Peel — VI Peel', duration: '45 min', status: 'Confirmed' },
    { time: '3:45 PM', patient: 'Lauren Hayes', service: 'Microneedling + PRP', duration: '60 min', status: 'Confirmed' },
    { time: '5:00 PM', patient: 'Sophia Martinez', service: 'Sculptra — Temples', duration: '45 min', status: 'Confirmed' },
    { time: '6:00 PM', patient: 'Olivia Bennett', service: 'Botox Touch-Up', duration: '15 min', status: 'Confirmed' },
  ],
  'Tue 3/17': [
    { time: '9:00 AM', patient: 'Anna Brooks', service: 'Botox — Full Face', duration: '30 min', status: 'Confirmed' },
    { time: '10:00 AM', patient: 'Lily Chang', service: 'Hydrafacial Platinum', duration: '75 min', status: 'Confirmed' },
    { time: '11:30 AM', patient: 'Maya Rivera', service: 'Filler — Nasolabial', duration: '45 min', status: 'Confirmed' },
    { time: '1:00 PM', patient: 'Priya Sharma', service: 'Laser Hair Removal', duration: '30 min', status: 'Confirmed' },
    { time: '2:00 PM', patient: 'Eva Collins', service: 'Microneedling', duration: '60 min', status: 'Confirmed' },
    { time: '3:15 PM', patient: 'Claire Dubois', service: 'Botox — Jawline', duration: '30 min', status: 'Confirmed' },
    { time: '4:00 PM', patient: 'Natalie Wood', service: 'Coolsculpting — Inner Thighs', duration: '60 min', status: 'Waitlist' },
    { time: '5:15 PM', patient: 'Ruby Chen', service: 'Chemical Peel — Jessner', duration: '30 min', status: 'Confirmed' },
  ],
  'Wed 3/18': [
    { time: '10:00 AM', patient: 'Isabella Grant', service: 'Sculptra — Cheeks', duration: '45 min', status: 'Confirmed' },
    { time: '11:00 AM', patient: 'Chloe Park', service: 'Botox — Full Face', duration: '30 min', status: 'Confirmed' },
    { time: '12:00 PM', patient: 'Harper Lee', service: 'Dermal Filler — Chin', duration: '45 min', status: 'Confirmed' },
    { time: '1:30 PM', patient: 'Ava Thompson', service: 'Hydrafacial Signature', duration: '60 min', status: 'Confirmed' },
    { time: '3:00 PM', patient: 'Iris Moon', service: 'Laser Genesis', duration: '45 min', status: 'Confirmed' },
    { time: '4:00 PM', patient: 'Jade Wilson', service: 'Botox — Neck Bands', duration: '30 min', status: 'Confirmed' },
  ],
  'Thu 3/19': [
    { time: '9:00 AM', patient: 'Stella Kim', service: 'Filler — Lips', duration: '45 min', status: 'Confirmed' },
    { time: '10:00 AM', patient: 'Violet Chen', service: 'Coolsculpting — Double Chin', duration: '45 min', status: 'Confirmed' },
    { time: '11:00 AM', patient: 'Hazel Brown', service: 'Botox — Forehead', duration: '30 min', status: 'Confirmed' },
    { time: '12:00 PM', patient: 'Luna Davis', service: 'Microneedling + PRP', duration: '60 min', status: 'Waitlist' },
    { time: '1:30 PM', patient: 'Willow James', service: 'VI Peel', duration: '45 min', status: 'Confirmed' },
    { time: '2:30 PM', patient: 'Daisy Chen', service: 'Laser Hair Removal', duration: '30 min', status: 'Confirmed' },
    { time: '3:15 PM', patient: 'Poppy Lee', service: 'Botox — Full Face', duration: '30 min', status: 'Confirmed' },
    { time: '4:00 PM', patient: 'Fern Garcia', service: 'Hydrafacial Deluxe', duration: '60 min', status: 'Confirmed' },
    { time: '5:15 PM', patient: 'Rose Taylor', service: 'Filler — Cheeks', duration: '45 min', status: 'Confirmed' },
  ],
  'Fri 3/20': [
    { time: '9:00 AM', patient: 'Ivy Robinson', service: 'Botox — Crow\'s Feet', duration: '30 min', status: 'Confirmed' },
    { time: '10:00 AM', patient: 'Pearl White', service: 'Sculptra — Full Face', duration: '60 min', status: 'Confirmed' },
    { time: '11:15 AM', patient: 'Coral Adams', service: 'Hydrafacial Platinum', duration: '75 min', status: 'Confirmed' },
    { time: '1:00 PM', patient: 'Sage Morris', service: 'Chemical Peel — TCA', duration: '30 min', status: 'Confirmed' },
    { time: '2:00 PM', patient: 'Briar Clark', service: 'Laser Hair Removal', duration: '30 min', status: 'Confirmed' },
    { time: '2:45 PM', patient: 'Wren Hall', service: 'Microneedling', duration: '60 min', status: 'Confirmed' },
    { time: '4:00 PM', patient: 'Lark Young', service: 'Botox — Full Face', duration: '30 min', status: 'Confirmed' },
  ],
};

const PATIENTS = [
  { name: 'Sarah Chen', lastVisit: 'Mar 16', nextAppt: 'Apr 12', lifetime: 8450, services: 'Botox, Filler', notes: 'Prefers morning appts' },
  { name: 'Maria Lopez', lastVisit: 'Mar 16', nextAppt: 'Apr 5', lifetime: 12300, services: 'Filler, Sculptra', notes: 'VIP — always on time' },
  { name: 'Jessica Park', lastVisit: 'Mar 16', nextAppt: 'Apr 20', lifetime: 5200, services: 'Hydrafacial, Peels', notes: 'Sensitive skin — patch test' },
  { name: 'Emily Tran', lastVisit: 'Mar 16', nextAppt: null, lifetime: 3100, services: 'Coolsculpting', notes: 'First body contouring' },
  { name: 'Amanda White', lastVisit: 'Mar 16', nextAppt: 'Apr 18', lifetime: 6800, services: 'Laser, Botox', notes: '' },
  { name: 'Rachel Kim', lastVisit: 'Mar 9', nextAppt: 'Mar 16', lifetime: 4200, services: 'Botox', notes: 'Referred by Diana Ross' },
  { name: 'Diana Ross', lastVisit: 'Mar 16', nextAppt: 'Apr 8', lifetime: 15600, services: 'Peels, Botox, Filler', notes: 'Loyal since 2022' },
  { name: 'Lauren Hayes', lastVisit: 'Mar 16', nextAppt: 'Apr 15', lifetime: 9100, services: 'Microneedling, PRP', notes: 'Acne scarring protocol' },
  { name: 'Sophia Martinez', lastVisit: 'Mar 16', nextAppt: 'May 1', lifetime: 22400, services: 'Sculptra, Filler, Botox', notes: 'Top spender — quarterly Sculptra' },
  { name: 'Olivia Bennett', lastVisit: 'Mar 16', nextAppt: 'Jun 10', lifetime: 2800, services: 'Botox', notes: 'New patient — 2nd visit' },
  { name: 'Nina Patel', lastVisit: 'Mar 15', nextAppt: 'Apr 22', lifetime: 7600, services: 'Botox, Hydrafacial', notes: '' },
  { name: 'Grace Liu', lastVisit: 'Mar 15', nextAppt: 'Apr 28', lifetime: 11200, services: 'Filler, Sculptra', notes: 'Prefers Juvederm brand' },
];

/* ─── Helpers ─── */
const fmtK = (v) => v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`;
const fmtDollar = (v) => '$' + v.toLocaleString();

const statusColor = (s) => {
  if (s === 'Confirmed') return { bg: '#dcfce7', color: '#166534' };
  if (s === 'Checked In') return { bg: '#dbeafe', color: '#1e40af' };
  if (s === 'Waitlist') return { bg: '#fef3c7', color: '#92400e' };
  return { bg: '#f3f4f6', color: '#374151' };
};

const confidenceColor = (c) => {
  if (c === 'Product Pattern') return { bg: '#dcfce7', color: '#166534' };
  if (c === 'Service Match') return { bg: '#dbeafe', color: '#1e40af' };
  return { bg: '#f3f4f6', color: '#374151' };
};

/* ─── Shared Components ─── */

const PROVIDER_NAV_ITEMS = [
  { view: 'overview', label: 'Overview' },
  { view: 'performance', label: 'Performance' },
  { view: 'schedule', label: 'My Schedule' },
  { view: 'retail', label: 'Retail' },
  { view: 'patients', label: 'My Patients' },
];

const GlobalNav = ({ onNavigate, activeView }) => (
  <div style={{ background: T.navy, borderBottom: '1px solid #1e293b' }}>
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
      <span
        onClick={() => onNavigate('portal')}
        style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px',
          color: T.gold, padding: '14px 28px 14px 0', borderRight: '1px solid #1e293b',
          marginRight: 4, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
        }}
      >
        AMP &middot; PROVIDER
      </span>
      {PROVIDER_NAV_ITEMS.map(item => (
        <button key={item.view} onClick={() => onNavigate(item.view)} style={{
          background: 'none', border: 'none',
          borderBottom: activeView === item.view ? `2px solid ${T.gold}` : '2px solid transparent',
          color: activeView === item.view ? T.gold : T.slate,
          padding: '14px 18px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.8px', cursor: 'pointer',
          fontFamily: T.sans, whiteSpace: 'nowrap', transition: 'color 0.15s', flexShrink: 0,
        }}>
          {item.label}
        </button>
      ))}
    </div>
  </div>
);

const PageHeader = ({ eyebrow, title, subtitle }) => (
  <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, padding: '32px 40px 28px' }}>
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: T.gold, margin: '0 0 10px' }}>
        {eyebrow}
      </p>
      <h1 style={{ fontFamily: T.serif, fontSize: 40, fontWeight: 400, color: T.navy, margin: '0 0 8px', lineHeight: 1.15 }}>
        {title}
      </h1>
      {subtitle && <p style={{ fontSize: 14, color: T.muted, margin: 0 }}>{subtitle}</p>}
      <div style={{ width: 60, height: 2, background: T.gold, marginTop: 18 }} />
    </div>
  </div>
);

const KPICard = ({ label, value, sub, status }) => {
  const dots = { good: '#4ade80', warn: '#fbbf24', bad: '#f87171' };
  return (
    <div style={{ background: T.navy, borderRadius: 12, padding: '20px 22px', border: '1px solid #1e293b', boxShadow: '0 2px 8px rgba(0,0,0,.18)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: T.white, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 400, fontFamily: T.serif, color: T.gold, lineHeight: 1.15 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.white, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        {status && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dots[status] || T.slate, display: 'inline-block', flexShrink: 0 }} />}
        {sub}
      </div>
    </div>
  );
};

const DashboardCard = ({ title, desc, onClick }) => (
  <button onClick={onClick} style={{
    background: 'white', border: `1px solid ${T.border}`, borderRadius: 12,
    padding: '24px 24px 20px', cursor: 'pointer', textAlign: 'left',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s',
  }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = T.gold; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = T.border; }}
  >
    <div style={{ width: 32, height: 2, background: T.gold, marginBottom: 16 }} />
    <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: T.serif, color: T.navy, marginBottom: 6 }}>{title}</h3>
    <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{desc}</p>
  </button>
);

const TableHeader = ({ columns }) => (
  <thead>
    <tr style={{ background: T.navy }}>
      {columns.map((col, i) => (
        <th key={i} style={{
          padding: '10px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '1px', color: T.gold, textAlign: col.align || 'left',
        }}>
          {col.label}
        </th>
      ))}
    </tr>
  </thead>
);

const Card = ({ children, style }) => (
  <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,.04)', padding: 24, ...style }}>
    {children}
  </div>
);

/* ─── Portal View ─── */
const PortalView = ({ onNavigate }) => (
  <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.sans }}>
    <div style={{ background: T.navy, padding: '48px 40px 44px', textAlign: 'center' }}>
      <img src="/amp-logo-white.png" alt="AMP" style={{ height: 36, marginBottom: 20, opacity: 0.9 }} />
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: T.gold, marginBottom: 10 }}>
        PROVIDER PORTAL &middot; {PROVIDER.location.toUpperCase()}
      </p>
      <h1 style={{ fontFamily: T.serif, fontSize: 44, fontWeight: 400, color: T.white, margin: '0 0 8px', lineHeight: 1.15 }}>
        Provider Dashboard
      </h1>
      <p style={{ fontSize: 15, color: T.slate, margin: '0 0 6px' }}>
        {PROVIDER.name}, {PROVIDER.title}
      </p>
      <div style={{ width: 60, height: 2, background: T.gold, margin: '20px auto 0' }} />
    </div>
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 40px 60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        <DashboardCard title="Overview" desc="Today's schedule, KPIs, and recent activity at a glance" onClick={() => onNavigate('overview')} />
        <DashboardCard title="Performance" desc="Revenue tracking, goal progress, and service breakdown" onClick={() => onNavigate('performance')} />
        <DashboardCard title="My Schedule" desc="Weekly calendar with appointment details and empty slots" onClick={() => onNavigate('schedule')} />
        <DashboardCard title="Retail" desc="Today's patients with personalized product recommendations" onClick={() => onNavigate('retail')} />
        <DashboardCard title="My Patients" desc="Patient roster with visit history and lifetime value" onClick={() => onNavigate('patients')} />
      </div>
    </div>
  </div>
);

/* ─── Overview View ─── */
const OverviewView = ({ onNavigate }) => {
  const todayRevenue = TODAY_APPOINTMENTS.length * 480; // rough avg
  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.sans }}>
      <GlobalNav onNavigate={onNavigate} activeView="overview" />
      <PageHeader
        eyebrow={`PROVIDER OVERVIEW · ${PROVIDER.location.toUpperCase()}`}
        title={`Good morning, ${PROVIDER.name.split(' ')[0]}`}
        subtitle="Monday, March 16, 2026"
      />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <KPICard label="Today's Appointments" value={TODAY_APPOINTMENTS.length} sub="10 scheduled" status="good" />
          <KPICard label="MTD Revenue" value="$38,105" sub="Mar in progress" status="warn" />
          <KPICard label="Avg Guest Spend" value="$595" sub="Mar avg per patient" status="good" />
          <KPICard label="YTD Patients" value="310" sub="144 Jan + 151 Feb + 64 Mar" status="good" />
        </div>

        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Today's Schedule</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader columns={[
                { label: 'Time' }, { label: 'Patient' }, { label: 'Service' },
                { label: 'Duration' }, { label: 'Status', align: 'center' },
              ]} />
              <tbody>
                {TODAY_APPOINTMENTS.map((a, i) => {
                  const sc = statusColor(a.status);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.divider}` }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy }}>{a.time}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{a.patient}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{a.service}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.muted }}>{a.duration}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Recent Completed (Last 7 Days)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader columns={[
                { label: 'Date' }, { label: 'Patient' }, { label: 'Service' }, { label: 'Revenue', align: 'right' },
              ]} />
              <tbody>
                {RECENT_APPOINTMENTS.map((a, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.divider}` }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy }}>{a.date}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{a.patient}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{a.service}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy, textAlign: 'right' }}>{fmtDollar(a.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ─── Tier Status Progress Component ─── */
const TierProgressCard = () => {
  const pctGold = Math.min(100, Math.round((YTD_SALES / TIERS.gold.annual) * 100));
  const pctPlat = Math.min(100, Math.round((YTD_SALES / TIERS.platinum.annual) * 100));
  const pctDiam = Math.min(100, Math.round((YTD_SALES / TIERS.diamond.annual) * 100));

  const tierData = [
    { ...TIERS.gold, pct: pctGold, remaining: Math.max(0, TIERS.gold.annual - YTD_SALES) },
    { ...TIERS.platinum, pct: pctPlat, remaining: Math.max(0, TIERS.platinum.annual - YTD_SALES) },
    { ...TIERS.diamond, pct: pctDiam, remaining: Math.max(0, TIERS.diamond.annual - YTD_SALES) },
  ];

  // Determine current achieved tier
  const achievedTier = YTD_SALES >= TIERS.diamond.annual ? 'diamond'
    : YTD_SALES >= TIERS.platinum.annual ? 'platinum'
    : YTD_SALES >= TIERS.gold.annual ? 'gold' : null;

  // Determine next target tier
  const nextTier = !achievedTier ? tierData[0]
    : achievedTier === 'gold' ? tierData[1]
    : achievedTier === 'platinum' ? tierData[2] : null;

  // Projected annual based on current run rate
  const projectedAnnual = MONTHS_ELAPSED > 0 ? Math.round((YTD_SALES / MONTHS_ELAPSED) * 12) : 0;
  const projectedTier = projectedAnnual >= TIERS.diamond.annual ? 'Diamond'
    : projectedAnnual >= TIERS.platinum.annual ? 'Platinum'
    : projectedAnnual >= TIERS.gold.annual ? 'Gold' : 'Below Gold';

  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, margin: 0 }}>2026 Equity Tier Progress</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projected Status:</span>
          <span style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 800,
            background: projectedTier === 'Diamond' ? 'linear-gradient(135deg, #7dd3fc, #bae6fd)' : projectedTier === 'Platinum' ? 'linear-gradient(135deg, #94a3b8, #cbd5e1)' : projectedTier === 'Gold' ? 'linear-gradient(135deg, #C9A96E, #e2c992)' : '#f3f4f6',
            color: projectedTier === 'Below Gold' ? T.muted : T.navy,
          }}>
            {projectedTier}
          </span>
        </div>
      </div>

      {/* YTD Summary Row */}
      <div style={{ background: T.navy, borderRadius: 10, padding: '16px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: T.slate, marginBottom: 4 }}>YTD Service Sales</div>
          <div style={{ fontSize: 28, fontWeight: 400, fontFamily: T.serif, color: T.gold }}>{fmtDollar(YTD_SALES)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: T.slate, marginBottom: 4 }}>Projected Annual</div>
          <div style={{ fontSize: 28, fontWeight: 400, fontFamily: T.serif, color: T.white }}>{fmtDollar(projectedAnnual)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: T.slate, marginBottom: 4 }}>Months Elapsed</div>
          <div style={{ fontSize: 28, fontWeight: 400, fontFamily: T.serif, color: T.white }}>{MONTHS_ELAPSED} of 12</div>
        </div>
      </div>

      {/* Tier Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {tierData.map((tier, i) => {
          const reached = YTD_SALES >= tier.annual;
          return (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
                    background: reached ? '#4ade80' : tier.color,
                    boxShadow: reached ? '0 0 8px rgba(74,222,128,0.5)' : 'none',
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{tier.label}</span>
                  <span style={{ fontSize: 12, color: T.muted }}>— {fmtDollar(tier.annual)} annual</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {tier.coe && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: reached ? '#dcfce7' : '#f3f4f6', color: reached ? '#166534' : T.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {reached ? '★ Circle of Excellence' : 'Circle of Excellence'}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, color: reached ? '#166534' : T.muted }}>
                    {reached ? `✓ ${fmtDollar(tier.equity)} equity earned` : `${fmtDollar(tier.remaining)} remaining`}
                  </span>
                </div>
              </div>
              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4, transition: 'width 0.8s ease',
                  width: `${tier.pct}%`,
                  background: reached ? '#4ade80' : `linear-gradient(90deg, ${tier.color}, ${tier.color}88)`,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                <span style={{ fontSize: 10, color: T.muted }}>{tier.pct}% complete</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: tier.color }}>
                  Equity: {fmtDollar(tier.equity)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

/* ─── Benchmark Toggle Chart (Variant 3) ─── */
const BenchmarkToggleChart = ({ title, subtitle, datasets, type }) => {
  const [visible, setVisible] = useState(() => {
    const init = { current: true };
    BENCHMARK_PROVIDERS.forEach(p => { init[p.name] = true; });
    return init;
  });
  const toggle = (key) => setVisible(prev => ({ ...prev, [key]: !prev[key] }));

  const allNames = ['current', ...BENCHMARK_PROVIDERS.map(p => p.name)];
  const colorMap = { current: T.navy };
  BENCHMARK_PROVIDERS.forEach(p => { colorMap[p.name] = p.color; });
  const labelMap = { current: PROVIDER.name + ' (You)' };
  BENCHMARK_PROVIDERS.forEach(p => { labelMap[p.name] = p.short; });

  const renderLegend = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
      {allNames.map(name => (
        <button key={name} onClick={() => toggle(name)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          border: `1px solid ${visible[name] ? colorMap[name] : T.border}`,
          background: visible[name] ? colorMap[name] + '15' : '#f9fafb',
          cursor: 'pointer', fontSize: 11, fontWeight: 600,
          color: visible[name] ? colorMap[name] : T.muted,
          opacity: visible[name] ? 1 : 0.5, transition: 'all 0.15s',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorMap[name], opacity: visible[name] ? 1 : 0.3 }} />
          {labelMap[name]}
        </button>
      ))}
    </div>
  );

  if (type === 'injectables') {
    return (
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 12, color: T.muted, margin: '0 0 12px' }}>{subtitle}</p>
        {renderLegend()}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 8 }}>Avg Syringes / Injectables Appt</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={datasets.syringes} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={T.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [v !== null ? v.toFixed(1) : '—']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                {visible.current && <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />}
                {BENCHMARK_PROVIDERS.map(p => visible[p.name] && (
                  <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={1.5} dot={{ r: 2, fill: p.color }} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 8 }}>Avg BTX Units / Botox Appt</h4>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={datasets.btx} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={T.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 60]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v) => [v !== null ? Math.round(v) + ' units' : '—']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                {visible.current && <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />}
                {BENCHMARK_PROVIDERS.map(p => visible[p.name] && (
                  <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={1.5} dot={{ r: 2, fill: p.color }} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    );
  }

  // type === 'efficiency'
  const charts = [
    { data: datasets.revPatient, title: 'Avg Revenue / Patient', fmt: '$' },
    { data: datasets.revNew, title: 'Avg Revenue / New Patient', fmt: '$' },
    { data: datasets.revHr, title: 'Revenue / Net Sched Hr', fmt: '$' },
  ];
  return (
    <Card style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 12, color: T.muted, margin: '0 0 12px' }}>{subtitle}</p>
      {renderLegend()}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {charts.map(ch => (
          <div key={ch.title}>
            <h4 style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 8 }}>{ch.title}</h4>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ch.data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={T.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${ch.fmt}${v}`} />
                <Tooltip formatter={(v) => [v !== null ? ch.fmt + Math.round(v) : '—']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                {visible.current && <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />}
                {BENCHMARK_PROVIDERS.map(p => visible[p.name] && (
                  <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={1.5} dot={{ r: 2, fill: p.color }} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </Card>
  );
};

/* ─── Benchmark V4 Chart (Split + Peer Avg + Individual Peers, All Toggleable) ─── */
const BenchmarkV4Chart = ({ title, subtitle, datasets, type }) => {
  const [visible, setVisible] = useState(() => {
    const init = { current: true, peerAvg: true };
    BENCHMARK_PROVIDERS.forEach(p => { init[p.name] = true; });
    return init;
  });
  const toggle = (key) => setVisible(prev => ({ ...prev, [key]: !prev[key] }));

  const allKeys = ['current', 'peerAvg', ...BENCHMARK_PROVIDERS.map(p => p.name)];
  const colorMap = { current: T.navy, peerAvg: '#9333ea' };
  BENCHMARK_PROVIDERS.forEach(p => { colorMap[p.name] = p.color; });
  const labelMap = { current: PROVIDER.name + ' (You)', peerAvg: 'Peer Average' };
  BENCHMARK_PROVIDERS.forEach(p => { labelMap[p.name] = p.short; });

  const renderLegend = () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
      {allKeys.map(key => (
        <button key={key} onClick={() => toggle(key)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6,
          border: `1px solid ${visible[key] ? colorMap[key] : T.border}`,
          background: visible[key] ? colorMap[key] + '15' : '#f9fafb',
          cursor: 'pointer', fontSize: 11, fontWeight: 600,
          color: visible[key] ? colorMap[key] : T.muted,
          opacity: visible[key] ? 1 : 0.5, transition: 'all 0.15s',
        }}>
          <span style={{
            width: key === 'peerAvg' ? 16 : 8, height: key === 'peerAvg' ? 0 : 8,
            borderRadius: key === 'peerAvg' ? 0 : '50%',
            background: key === 'peerAvg' ? 'none' : colorMap[key],
            borderTop: key === 'peerAvg' ? `2px dashed ${colorMap[key]}` : 'none',
            opacity: visible[key] ? 1 : 0.3,
          }} />
          {labelMap[key]}
        </button>
      ))}
    </div>
  );

  const renderChart = ({ data, chartTitle, yDomain, formatter, tickFmt }) => (
    <div>
      <h4 style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 8 }}>{chartTitle}</h4>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={T.divider} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={yDomain} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={tickFmt} />
          <Tooltip formatter={formatter} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          {visible.current && <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />}
          {visible.peerAvg && <Line type="monotone" dataKey="peerAvg" name="Peer Avg" stroke="#9333ea" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3, fill: '#9333ea', strokeWidth: 0 }} connectNulls={false} />}
          {BENCHMARK_PROVIDERS.map(p => visible[p.name] && (
            <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={1.5} dot={{ r: 2, fill: p.color }} connectNulls={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (type === 'injectables') {
    return (
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 12, color: T.muted, margin: '0 0 12px' }}>{subtitle}</p>
        {renderLegend()}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {renderChart({
            data: datasets.syringes,
            chartTitle: 'Avg Syringes / Injectables Appt',
            yDomain: [0, 4],
            formatter: (v) => [v !== null ? v.toFixed(1) : '—'],
            tickFmt: (v) => v,
          })}
          {renderChart({
            data: datasets.btx,
            chartTitle: 'Avg BTX Units / Botox Appt',
            yDomain: [0, 60],
            formatter: (v) => [v !== null ? Math.round(v) + ' units' : '—'],
            tickFmt: (v) => v,
          })}
        </div>
      </Card>
    );
  }

  // type === 'efficiency'
  const charts = [
    { data: datasets.revPatient, chartTitle: 'Avg Revenue / Patient', formatter: (v) => [v !== null ? '$' + Math.round(v) : '—'], tickFmt: (v) => `$${v}` },
    { data: datasets.revNew, chartTitle: 'Avg Revenue / New Patient', formatter: (v) => [v !== null ? '$' + Math.round(v) : '—'], tickFmt: (v) => `$${v}` },
    { data: datasets.revHr, chartTitle: 'Revenue / Net Sched Hr', formatter: (v) => [v !== null ? '$' + Math.round(v) : '—'], tickFmt: (v) => `$${v}` },
  ];
  return (
    <Card style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{title}</h3>
      <p style={{ fontSize: 12, color: T.muted, margin: '0 0 12px' }}>{subtitle}</p>
      {renderLegend()}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {charts.map(ch => renderChart({ ...ch, yDomain: ['auto', 'auto'], key: ch.chartTitle }))}
      </div>
    </Card>
  );
};

/* ─── Performance View ─── */
const PerformanceView = ({ onNavigate }) => {
  const mtdSales = MONTHLY_SALES.find(d => d.month === 'Mar')?.sales || 0;
  const avgPerMonth = MONTHS_ELAPSED > 0 ? Math.round(YTD_SALES / MONTHS_ELAPSED) : 0;
  const pctToGold = Math.round((YTD_SALES / TIERS.gold.annual) * 100);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.sans }}>
      <GlobalNav onNavigate={onNavigate} activeView="performance" />
      <PageHeader
        eyebrow={`PERFORMANCE · ${PROVIDER.name.toUpperCase()}`}
        title="Performance Metrics"
        subtitle={`${PROVIDER.location} — 2026 YTD`}
      />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px 60px' }}>
        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <KPICard label="YTD Service Sales" value={fmtDollar(YTD_SALES)} sub={`Jan–Mar 2026 (${MONTHS_ELAPSED} months)`} status="good" />
          <KPICard label="Monthly Average" value={fmtDollar(avgPerMonth)} sub="Avg service sales / month" />
          <KPICard label="Gold Tier Progress" value={`${pctToGold}%`} sub={`${fmtDollar(Math.max(0, TIERS.gold.annual - YTD_SALES))} remaining`} status={pctToGold >= 75 ? 'good' : pctToGold >= 50 ? 'warn' : 'bad'} />
          <KPICard label="MTD (March)" value={fmtDollar(mtdSales)} sub="Current month in progress" status={mtdSales >= TIER_MONTHLY.gold ? 'good' : 'warn'} />
        </div>

        {/* Tier Progress */}
        <TierProgressCard />

        {/* Clustered Column Chart — Monthly Sales vs Tier Budgets */}
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Service Sales vs Tier Budgets — Monthly</h3>
          <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Monthly service sales compared to the monthly budget needed to achieve each equity tier</p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={CLUSTERED_DATA} margin={{ top: 20, right: 12, left: 0, bottom: 0 }} barCategoryGap="12%" barGap={2}>
              <CartesianGrid vertical={false} stroke={T.divider} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: T.sans }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
              <Tooltip
                formatter={(v, name) => [v !== null ? '$' + Math.round(v).toLocaleString() : '—', name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}` }}
              />
              <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
              <Bar dataKey="sales" name="Service Sales" radius={[3, 3, 0, 0]} maxBarSize={52}>
                {CLUSTERED_DATA.map((d, i) => (
                  <Cell key={i} fill={d.sales !== null ? T.gold : '#e5e7eb'} />
                ))}
              </Bar>
              <Bar dataKey="gold" name="Gold Budget" fill="#C9A96E55" radius={[3, 3, 0, 0]} maxBarSize={52} />
              <Bar dataKey="platinum" name="Platinum Budget" fill="#94a3b855" radius={[3, 3, 0, 0]} maxBarSize={52} />
              <Bar dataKey="diamond" name="Diamond Budget" fill="#7dd3fc55" radius={[3, 3, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cumulative Line Chart — YTD Sales vs Tier Run Rates */}
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Cumulative Sales vs Tier Targets — YTD</h3>
          <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Aggregate 2026 service sales progression vs cumulative budget needed for each tier</p>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={CUMULATIVE_DATA} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={T.divider} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: T.sans }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
              <Tooltip
                formatter={(v, name) => [v !== null ? '$' + Math.round(v).toLocaleString() : '—', name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}` }}
              />
              <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
              <Line type="monotone" dataKey="sales" name="YTD Service Sales" stroke={T.navy} strokeWidth={3} dot={{ r: 5, fill: T.navy }} connectNulls={false} />
              <Line type="monotone" dataKey="gold" name="Gold Tier" stroke={TIERS.gold.color} strokeWidth={2} strokeDasharray="6 3" dot={false} />
              <Line type="monotone" dataKey="platinum" name="Platinum Tier" stroke={TIERS.platinum.color} strokeWidth={2} strokeDasharray="6 3" dot={false} />
              <Line type="monotone" dataKey="diamond" name="Diamond Tier" stroke={TIERS.diamond.color} strokeWidth={2} strokeDasharray="6 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Dual-Axis Line Chart — Avg Syringe & BTX Units */}
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Injectables Efficiency — Monthly</h3>
          <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Average syringes per injectables appointment vs average BTX units per Botox appointment</p>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={ytd(INJECTABLES_DATA)} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={T.divider} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: T.sans }} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={[0, 4]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Avg Syringes', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: T.muted, fontFamily: T.sans } }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 60]}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Avg BTX Units', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 11, fill: T.muted, fontFamily: T.sans } }}
              />
              <Tooltip
                formatter={(v, name) => {
                  if (v === null) return ['—', name];
                  return name === 'Avg Syringes / Injectables Appt' ? [v.toFixed(1), name] : [Math.round(v) + ' units', name];
                }}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}` }}
              />
              <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
              <Line yAxisId="left" type="monotone" dataKey="avgSyringes" name="Avg Syringes / Injectables Appt" stroke={T.gold} strokeWidth={3} dot={{ r: 5, fill: T.gold }} connectNulls={false} />
              <Line yAxisId="right" type="monotone" dataKey="avgBTXUnits" name="Avg BTX Units / Botox Appt" stroke={T.navy} strokeWidth={3} dot={{ r: 5, fill: T.navy }} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* Multi-Line Chart — Revenue Efficiency Metrics */}
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Revenue Efficiency — Monthly</h3>
          <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Avg Revenue Per Patient, Avg Revenue Per New Patient, and Revenue Per Net Scheduled Hour</p>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={ytd(REVENUE_EFFICIENCY_DATA)} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={T.divider} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: T.sans }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(v, name) => [v !== null ? '$' + Math.round(v).toLocaleString() : '—', name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}` }}
              />
              <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
              <Line type="monotone" dataKey="avgRevPerPatient" name="Avg Revenue / Patient" stroke={T.navy} strokeWidth={3} dot={{ r: 5, fill: T.navy }} connectNulls={false} />
              <Line type="monotone" dataKey="avgRevPerNewPatient" name="Avg Revenue / New Patient" stroke={T.gold} strokeWidth={3} dot={{ r: 5, fill: T.gold }} connectNulls={false} />
              <Line type="monotone" dataKey="revPerNetSchedHr" name="Revenue / Net Scheduled Hour" stroke="#7dd3fc" strokeWidth={3} dot={{ r: 5, fill: '#7dd3fc' }} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Service Breakdown Table */}
        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Revenue by Service Category — YTD</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader columns={[
                { label: 'Category' }, { label: 'Revenue', align: 'right' }, { label: '% of Total', align: 'right' }, { label: 'Appointments', align: 'right' },
              ]} />
              <tbody>
                {SERVICE_BREAKDOWN.map((s, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.divider}` }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{s.category}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy, textAlign: 'right' }}>{fmtDollar(s.revenue)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: T.muted, textAlign: 'right' }}>{s.pct}%</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: T.muted, textAlign: 'right' }}>{s.appts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════
            PEER BENCHMARK SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 48, borderTop: `2px solid ${T.gold}`, paddingTop: 32 }}>
          <h2 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 400, color: T.navy, margin: '0 0 6px' }}>
            Peer Benchmark
          </h2>
          <p style={{ fontSize: 13, color: T.muted, margin: '0 0 20px' }}>
            Top providers with similar service mix and net scheduled hours — selected from top 20 by YTD service sales across AMP
          </p>

          {/* Legend */}
          <Card style={{ marginBottom: 24, padding: '16px 24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 3, background: T.navy, display: 'inline-block', borderRadius: 2 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{PROVIDER.name} (You)</span>
              </div>
              {BENCHMARK_PROVIDERS.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 3, background: p.color, display: 'inline-block', borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: T.body }}>{p.short}</span>
                  <span style={{ fontSize: 10, color: T.muted }}>— {p.practice}, {p.location}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Chart A: Service Sales vs Peers — Monthly (bars + lines) */}
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Service Sales vs Peers — Monthly</h3>
            <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Your monthly sales (bars) compared to 5 benchmark providers (lines)</p>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={BENCH_SALES_DATA} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={T.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: T.sans }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
                <Tooltip formatter={(v, name) => [v !== null ? '$' + Math.round(v).toLocaleString() : '—', name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}` }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 10, paddingBottom: 8 }} />
                <Bar dataKey="current" name={PROVIDER.name} radius={[3, 3, 0, 0]} maxBarSize={40}>
                  {BENCH_SALES_DATA.map((d, i) => (
                    <Cell key={i} fill={d.current !== null ? T.gold : '#e5e7eb'} />
                  ))}
                </Bar>
                {BENCHMARK_PROVIDERS.map(p => (
                  <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={2} dot={{ r: 3, fill: p.color }} connectNulls={false} />
                ))}
                <ReferenceLine y={Math.round(TIERS.gold.annual / 12)} stroke={TIERS.gold.color} strokeDasharray="4 3" strokeWidth={1} />
                <ReferenceLine y={Math.round(TIERS.platinum.annual / 12)} stroke={TIERS.platinum.color} strokeDasharray="4 3" strokeWidth={1} />
                <ReferenceLine y={Math.round(TIERS.diamond.annual / 12)} stroke={TIERS.diamond.color} strokeDasharray="4 3" strokeWidth={1} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Chart B: Cumulative Sales vs Peers — YTD */}
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Cumulative Sales vs Peers — YTD</h3>
            <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Aggregate 2026 service sales progression compared to peers and tier targets</p>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={BENCH_CUMULATIVE_DATA} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={T.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: T.sans }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
                <Tooltip formatter={(v, name) => [v !== null ? '$' + Math.round(v).toLocaleString() : '—', name]} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${T.border}` }} />
                <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: 10, paddingBottom: 8 }} />
                <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 5, fill: T.navy }} connectNulls={false} />
                {BENCHMARK_PROVIDERS.map(p => (
                  <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={2} dot={{ r: 3, fill: p.color }} connectNulls={false} />
                ))}
                <Line type="monotone" dataKey="gold" name="Gold Tier" stroke={TIERS.gold.color} strokeWidth={1} strokeDasharray="6 3" dot={false} />
                <Line type="monotone" dataKey="platinum" name="Platinum Tier" stroke={TIERS.platinum.color} strokeWidth={1} strokeDasharray="6 3" dot={false} />
                <Line type="monotone" dataKey="diamond" name="Diamond Tier" stroke={TIERS.diamond.color} strokeWidth={1} strokeDasharray="6 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* ── INJECTABLES EFFICIENCY — VARIANT 1: Mini Charts (Split by Metric) ── */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Injectables Efficiency — Variant 1: Split Charts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Card>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Avg Syringes / Injectables Appt</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={ytd(BENCH_SYRINGES_DATA)} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={T.divider} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => [v !== null ? v.toFixed(1) : '—']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />
                    {BENCHMARK_PROVIDERS.map(p => (
                      <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={1.5} dot={{ r: 2, fill: p.color }} connectNulls={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Avg BTX Units / Botox Appt</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={ytd(BENCH_BTX_DATA)} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={T.divider} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 60]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => [v !== null ? Math.round(v) + ' units' : '—']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />
                    {BENCHMARK_PROVIDERS.map(p => (
                      <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={1.5} dot={{ r: 2, fill: p.color }} connectNulls={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>

          {/* ── INJECTABLES EFFICIENCY — VARIANT 2: Peer Average Overlay ── */}
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Injectables Efficiency — Variant 2: Peer Average</h3>
            <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Your metrics (solid) vs peer group average (dashed)</p>
            <ResponsiveContainer width="100%" height={340}>
              <ComposedChart data={ytd(BENCH_INJ_AVG_DATA)} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={T.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" domain={[0, 4]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'Syringes', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 10, fill: T.muted } }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 60]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'BTX Units', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 10, fill: T.muted } }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: 10, paddingBottom: 8 }} />
                <Line yAxisId="left" type="monotone" dataKey="currentSyringes" name="Your Syringes" stroke={T.gold} strokeWidth={3} dot={{ r: 4, fill: T.gold }} connectNulls={false} />
                <Line yAxisId="left" type="monotone" dataKey="peerAvgSyringes" name="Peer Avg Syringes" stroke={T.gold} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
                <Line yAxisId="right" type="monotone" dataKey="currentBTX" name="Your BTX Units" stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />
                <Line yAxisId="right" type="monotone" dataKey="peerAvgBTX" name="Peer Avg BTX" stroke={T.navy} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* ── INJECTABLES EFFICIENCY — VARIANT 3: Toggle ── */}
          <BenchmarkToggleChart
            title="Injectables Efficiency — Variant 3: Toggle"
            subtitle="Click provider names to show/hide"
            datasets={{ syringes: ytd(BENCH_SYRINGES_DATA), btx: ytd(BENCH_BTX_DATA) }}
            type="injectables"
          />

          {/* ── INJECTABLES EFFICIENCY — VARIANT 4: Split + Peer Avg + Individual + Toggle ── */}
          <BenchmarkV4Chart
            title="Injectables Efficiency — Variant 4: Full Comparison"
            subtitle="Split charts with peer average, individual peers, and toggles"
            datasets={{ syringes: ytd(BENCH_SYRINGES_FULL), btx: ytd(BENCH_BTX_FULL) }}
            type="injectables"
          />

          {/* ── REVENUE EFFICIENCY — VARIANT 1: Mini Charts (Split by Metric) ── */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Revenue Efficiency — Variant 1: Split Charts</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {[
                { data: ytd(BENCH_REV_PER_PATIENT), title: 'Avg Revenue / Patient', fmt: (v) => v !== null ? '$' + Math.round(v) : '—' },
                { data: ytd(BENCH_REV_PER_NEW), title: 'Avg Revenue / New Patient', fmt: (v) => v !== null ? '$' + Math.round(v) : '—' },
                { data: ytd(BENCH_REV_PER_HR), title: 'Revenue / Net Sched Hr', fmt: (v) => v !== null ? '$' + Math.round(v) : '—' },
              ].map((chart) => (
                <Card key={chart.title}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>{chart.title}</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chart.data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={T.divider} />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(v) => [chart.fmt(v)]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="current" name={PROVIDER.name} stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />
                      {BENCHMARK_PROVIDERS.map(p => (
                        <Line key={p.name} type="monotone" dataKey={p.name} name={p.short} stroke={p.color} strokeWidth={1.5} dot={{ r: 2, fill: p.color }} connectNulls={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              ))}
            </div>
          </div>

          {/* ── REVENUE EFFICIENCY — VARIANT 2: Peer Average Overlay ── */}
          <Card style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Revenue Efficiency — Variant 2: Peer Average</h3>
            <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px' }}>Your metrics (solid) vs peer group average (dashed)</p>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={ytd(BENCH_EFF_AVG_DATA)} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={T.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => [v !== null ? '$' + Math.round(v) : '—']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend verticalAlign="top" align="right" iconType="line" wrapperStyle={{ fontSize: 10, paddingBottom: 8 }} />
                <Line type="monotone" dataKey="currentRevPatient" name="Your Rev/Patient" stroke={T.navy} strokeWidth={3} dot={{ r: 4, fill: T.navy }} connectNulls={false} />
                <Line type="monotone" dataKey="peerAvgRevPatient" name="Peer Avg Rev/Patient" stroke={T.navy} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="currentRevNew" name="Your Rev/New Patient" stroke={T.gold} strokeWidth={3} dot={{ r: 4, fill: T.gold }} connectNulls={false} />
                <Line type="monotone" dataKey="peerAvgRevNew" name="Peer Avg Rev/New" stroke={T.gold} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
                <Line type="monotone" dataKey="currentRevHr" name="Your Rev/Sched Hr" stroke="#7dd3fc" strokeWidth={3} dot={{ r: 4, fill: '#7dd3fc' }} connectNulls={false} />
                <Line type="monotone" dataKey="peerAvgRevHr" name="Peer Avg Rev/Hr" stroke="#7dd3fc" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* ── REVENUE EFFICIENCY — VARIANT 3: Toggle ── */}
          <BenchmarkToggleChart
            title="Revenue Efficiency — Variant 3: Toggle"
            subtitle="Click provider names to show/hide"
            datasets={{ revPatient: ytd(BENCH_REV_PER_PATIENT), revNew: ytd(BENCH_REV_PER_NEW), revHr: ytd(BENCH_REV_PER_HR) }}
            type="efficiency"
          />

          {/* ── REVENUE EFFICIENCY — VARIANT 4: Split + Peer Avg + Individual + Toggle ── */}
          <BenchmarkV4Chart
            title="Revenue Efficiency — Variant 4: Full Comparison"
            subtitle="Split charts with peer average, individual peers, and toggles"
            datasets={{ revPatient: ytd(BENCH_REV_PATIENT_FULL), revNew: ytd(BENCH_REV_NEW_FULL), revHr: ytd(BENCH_REV_HR_FULL) }}
            type="efficiency"
          />
        </div>
      </div>
    </div>
  );
};

/* ─── Schedule View ─── */
const ScheduleView = ({ onNavigate }) => {
  const days = Object.keys(WEEK_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const appts = WEEK_SCHEDULE[selectedDay] || [];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.sans }}>
      <GlobalNav onNavigate={onNavigate} activeView="schedule" />
      <PageHeader
        eyebrow={`MY SCHEDULE · ${PROVIDER.name.toUpperCase()}`}
        title="My Schedule"
        subtitle={`${PROVIDER.location} — Week of March 16, 2026`}
      />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px 60px' }}>
        {/* Day selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {days.map(day => (
            <button key={day} onClick={() => setSelectedDay(day)} style={{
              padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              border: selectedDay === day ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
              background: selectedDay === day ? T.navy : 'white',
              color: selectedDay === day ? T.gold : T.body,
              cursor: 'pointer', fontFamily: T.sans, transition: 'all 0.15s',
            }}>
              {day}
              <span style={{ display: 'block', fontSize: 11, fontWeight: 400, color: selectedDay === day ? T.slate : T.muted, marginTop: 2 }}>
                {WEEK_SCHEDULE[day].length} appts
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <KPICard label="Appointments" value={appts.length} sub={selectedDay} />
          <KPICard label="Booked Hours" value={`${(appts.reduce((s, a) => s + parseInt(a.duration), 0) / 60).toFixed(1)}h`} sub="of 9h shift" />
          <KPICard label="Utilization" value={`${Math.round(appts.reduce((s, a) => s + parseInt(a.duration), 0) / 540 * 100)}%`} sub="Target: 85%" status={appts.reduce((s, a) => s + parseInt(a.duration), 0) / 540 >= 0.8 ? 'good' : 'warn'} />
        </div>

        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader columns={[
                { label: 'Time' }, { label: 'Patient' }, { label: 'Service' },
                { label: 'Duration' }, { label: 'Status', align: 'center' },
              ]} />
              <tbody>
                {appts.map((a, i) => {
                  const sc = statusColor(a.status);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.divider}` }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy }}>{a.time}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{a.patient}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{a.service}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.muted }}>{a.duration}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ─── Retail View ─── */
const RetailView = ({ onNavigate }) => (
  <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.sans }}>
    <GlobalNav onNavigate={onNavigate} activeView="retail" />
    <PageHeader
      eyebrow={`RETAIL OPTIMIZATION · ${PROVIDER.name.toUpperCase()}`}
      title="Retail Recommendations"
      subtitle={`${PROVIDER.location} — Today's patients with personalized product suggestions`}
    />
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px 60px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <KPICard label="MTD Retail Sales" value="$4,280" sub="34% conversion rate" status="good" />
        <KPICard label="Retail %" value="11.2%" sub="of total revenue" status="good" />
        <KPICard label="Units Sold" value="38" sub="MTD — 6.3 avg/day" />
        <KPICard label="Top Product" value="C E Ferulic" sub="SkinCeuticals — 8 units" />
      </div>

      <Card>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Today's Patients — Retail Opportunities</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHeader columns={[
              { label: 'Patient' }, { label: 'Service' }, { label: 'Last Product' },
              { label: 'Days Since', align: 'center' }, { label: 'Recommendation' }, { label: 'Confidence', align: 'center' },
            ]} />
            <tbody>
              {RETAIL_RECOMMENDATIONS.map((r, i) => {
                const cc = confidenceColor(r.confidence);
                const urgency = r.daysSince === null ? { label: 'New', bg: '#f3f4f6', color: '#374151' }
                  : r.daysSince <= 30 ? { label: 'Recent', bg: '#dcfce7', color: '#166534' }
                  : r.daysSince <= 90 ? { label: 'Due', bg: '#fef3c7', color: '#92400e' }
                  : { label: 'Lapsed', bg: '#fee2e2', color: '#991b1b' };
                return (
                  <React.Fragment key={i}>
                    <tr style={{ borderBottom: `1px solid ${T.divider}` }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy }}>{r.patient}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{r.service}</td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>
                        {r.lastProduct}
                        {r.daysSince !== null && (
                          <span style={{ display: 'inline-block', marginLeft: 8, padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700, background: urgency.bg, color: urgency.color }}>
                            {r.daysSince}d — {urgency.label}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: T.muted, textAlign: 'center' }}>
                        {r.daysSince !== null ? `${r.daysSince}d` : '—'}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy }}>{r.recommendation}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: cc.bg, color: cc.color }}>
                          {r.confidence}
                        </span>
                      </td>
                    </tr>
                    <tr style={{ background: T.bg, borderBottom: `1px solid ${T.border}` }}>
                      <td colSpan={6} style={{ padding: '8px 14px 12px 14px', borderLeft: `4px solid ${T.gold}` }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.8px', marginRight: 8 }}>Talking Point</span>
                        <span style={{ fontSize: 12, color: T.body, lineHeight: 1.5 }}>{r.why}</span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  </div>
);

/* ─── Patients View ─── */
const PatientsView = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.services.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.sans }}>
      <GlobalNav onNavigate={onNavigate} activeView="patients" />
      <PageHeader
        eyebrow={`MY PATIENTS · ${PROVIDER.name.toUpperCase()}`}
        title="My Patients"
        subtitle={`${PROVIDER.location} — ${PATIENTS.length} active patients`}
      />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px 60px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Search patients by name or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, border: `1px solid ${T.border}`,
                fontSize: 14, fontFamily: T.sans, outline: 'none', background: T.bg,
              }}
            />
            <span style={{ fontSize: 13, color: T.muted }}>{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <TableHeader columns={[
                { label: 'Patient' }, { label: 'Last Visit' }, { label: 'Next Appt' },
                { label: 'Lifetime Value', align: 'right' }, { label: 'Services' }, { label: 'Notes' },
              ]} />
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.divider}` }}>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy }}>{p.name}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{p.lastVisit}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: p.nextAppt ? T.body : T.muted }}>
                      {p.nextAppt || 'Not scheduled'}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: T.navy, textAlign: 'right' }}>{fmtDollar(p.lifetime)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: T.body }}>{p.services}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: T.muted, fontStyle: p.notes ? 'normal' : 'italic' }}>
                      {p.notes || 'No notes'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ─── Main App ─── */
const ProviderDashboard = () => {
  const { location } = useParams();
  const [currentView, setCurrentView] = useState('portal');

  const navigate = (view) => setCurrentView(view);

  switch (currentView) {
    case 'overview': return <OverviewView onNavigate={navigate} />;
    case 'performance': return <PerformanceView onNavigate={navigate} />;
    case 'schedule': return <ScheduleView onNavigate={navigate} />;
    case 'retail': return <RetailView onNavigate={navigate} />;
    case 'patients': return <PatientsView onNavigate={navigate} />;
    default: return <PortalView onNavigate={navigate} />;
  }
};

export default ProviderDashboard;
