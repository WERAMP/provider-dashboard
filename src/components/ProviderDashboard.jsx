import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, Customized
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

/* ─── Mock Data ─── */
const PROVIDER = { name: 'Bianca Thelisma', title: 'NP', location: 'Flatiron' };

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

const MONTHLY_REVENUE = [
  { month: 'Oct', revenue: 62000, goal: 65000 },
  { month: 'Nov', revenue: 58000, goal: 65000 },
  { month: 'Dec', revenue: 71000, goal: 65000 },
  { month: 'Jan', revenue: 54000, goal: 68000 },
  { month: 'Feb', revenue: 66000, goal: 68000 },
  { month: 'Mar', revenue: 38000, goal: 68000 },
];

const SERVICE_BREAKDOWN = [
  { category: 'Injectables (Botox/Dysport)', revenue: 18200, pct: 47.9, appts: 34 },
  { category: 'Dermal Fillers', revenue: 9800, pct: 25.8, appts: 12 },
  { category: 'Body Contouring', revenue: 4500, pct: 11.8, appts: 3 },
  { category: 'Skin Treatments', revenue: 3200, pct: 8.4, appts: 8 },
  { category: 'Laser Services', revenue: 2300, pct: 6.1, appts: 5 },
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
          <KPICard label="MTD Revenue" value="$38,200" sub="56% to $68k goal" status="warn" />
          <KPICard label="Avg Guest Spend" value="$485" sub="+$22 vs last month" status="good" />
          <KPICard label="Retail Conversion" value="34%" sub="6 of 10 patients" status="good" />
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

/* ─── Performance View ─── */
const PerformanceView = ({ onNavigate }) => {
  const mtdRev = 38200;
  const mtdGoal = 68000;
  const goalPct = Math.round((mtdRev / mtdGoal) * 100);

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate() - 1;
  const chartData = MONTHLY_REVENUE.map(d => {
    if (d.month !== 'Mar' || daysElapsed <= 0) return d;
    return { ...d, goal: Math.round(d.goal / daysInMonth * daysElapsed) };
  });

  const PctLabels = (props) => {
    const { xAxisMap, yAxisMap } = props;
    if (!xAxisMap || !yAxisMap) return null;
    const xAxis = xAxisMap[0];
    const yAxis = yAxisMap[0];
    if (!xAxis || !yAxis || !xAxis.scale || !yAxis.scale) return null;
    return (
      <g>
        {chartData.map((d, i) => {
          if (!d.goal || !d.revenue) return null;
          const pct = Math.round((d.revenue / d.goal) * 100);
          const color = pct >= 100 ? '#166534' : '#ef4444';
          const cx = xAxis.scale(d.month) + xAxis.scale.bandwidth() / 2;
          const topY = yAxis.scale(Math.max(d.revenue, d.goal)) - 5;
          return (
            <text key={i} x={cx} y={topY} textAnchor="middle" fontSize={13} fontWeight="bold" fill={color}>
              {pct}%
            </text>
          );
        })}
      </g>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.sans }}>
      <GlobalNav onNavigate={onNavigate} activeView="performance" />
      <PageHeader
        eyebrow={`PERFORMANCE · ${PROVIDER.name.toUpperCase()}`}
        title="Performance Metrics"
        subtitle={`${PROVIDER.location} — March 2026`}
      />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <KPICard label="MTD Revenue" value={fmtDollar(mtdRev)} sub="Mar 1–16" status="warn" />
          <KPICard label="MTD Goal" value={fmtDollar(mtdGoal)} sub="Full month target" />
          <KPICard label="Goal %" value={`${goalPct}%`} sub={goalPct >= 100 ? 'On track' : `${100 - goalPct}% remaining`} status={goalPct >= 80 ? 'good' : 'warn'} />
          <KPICard label="Avg / Appointment" value="$485" sub="62 appointments MTD" status="good" />
        </div>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Revenue vs Goal — Monthly</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 28, right: 8, left: 0, bottom: 0 }} barCategoryGap="3%" barGap={2}>
              <CartesianGrid vertical={false} stroke={T.divider} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtK} />
              <Tooltip formatter={(v) => '$' + Math.round(v).toLocaleString()} />
              <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: 11, paddingBottom: 4 }} />
              <Bar dataKey="revenue" name="Revenue" fill={T.gold} radius={[3, 3, 0, 0]} maxBarSize={78} />
              <Bar dataKey="goal" name="Goal (Run-Rated)" fill={T.navy} radius={[3, 3, 0, 0]} maxBarSize={78} />
              <Customized component={PctLabels} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Revenue by Service Category — MTD</h3>
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
