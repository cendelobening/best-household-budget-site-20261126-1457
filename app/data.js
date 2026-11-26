// Seed data for Hearth Ledger — the Alvarez household budget (Portland, OR).
// Every figure is fictional but realistic: a family of four, two salaries, one
// mortgage-free rental, and the ordinary spending of a November. Past months
// (June–October 2026) are generated from the same category templates with a
// fixed-seed generator, so the Reports page always has six comparable months
// and the numbers never change between loads.

export const HOUSEHOLD = {
  name: 'The Alvarez Household',
  members: 'Maya & Jordan Alvarez · Sofia (9) · Leo (6)',
  city: 'Portland, Oregon',
  currency: 'USD',
};

export const CATEGORIES = [
  { id: 'housing', label: 'Housing', color: '#1e4d3a' },
  { id: 'groceries', label: 'Groceries', color: '#2f7d4f' },
  { id: 'utilities', label: 'Utilities', color: '#0e7490' },
  { id: 'transport', label: 'Transport', color: '#b45309' },
  { id: 'dining', label: 'Dining Out', color: '#c2410c' },
  { id: 'entertainment', label: 'Entertainment', color: '#7c3aed' },
  { id: 'health', label: 'Health', color: '#be185d' },
  { id: 'clothing', label: 'Clothing', color: '#475569' },
  { id: 'kids', label: 'Kids & School', color: '#0891b2' },
  { id: 'subscriptions', label: 'Subscriptions', color: '#65a30d' },
  { id: 'savings', label: 'Savings', color: '#166534' },
  { id: 'misc', label: 'Miscellaneous', color: '#78716c' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

// Monthly spending limits the household set for itself (November 2026).
export const BUDGETS = [
  { category: 'housing', limit: 1850 },
  { category: 'groceries', limit: 650 },
  { category: 'utilities', limit: 240 },
  { category: 'transport', limit: 380 },
  { category: 'dining', limit: 280 },
  { category: 'entertainment', limit: 180 },
  { category: 'health', limit: 220 },
  { category: 'clothing', limit: 150 },
  { category: 'kids', limit: 300 },
  { category: 'subscriptions', limit: 85 },
  { category: 'misc', limit: 200 },
];

// Savings goals the family is working toward.
export const GOALS = [
  { id: 'g-emergency', name: 'Emergency fund', note: 'Six months of essentials, kept in a high-yield savings account.', target: 12000, saved: 8450, monthly: 400 },
  { id: 'g-coast', name: 'Oregon Coast family trip', note: 'Four nights in Cannon Beach next July — cottage, crab dinner, kites.', target: 2400, saved: 1150, monthly: 150 },
  { id: 'g-car', name: 'New car down payment', note: 'Replacing the 2013 Outback before next winter.', target: 6000, saved: 2300, monthly: 250 },
  { id: 'g-college', name: 'College fund — Sofia & Leo', note: 'A little each month into the 529 plans, split evenly.', target: 10000, saved: 3800, monthly: 200 },
];

// Bills that repeat and are due soon (shown on the Overview page).
export const BILLS = [
  { name: 'Rent — Maple Street house', amount: 1850, due: '2026-12-01', autopay: true },
  { name: 'PGE electric', amount: 132, due: '2026-11-28', autopay: true },
  { name: 'Xfinity internet', amount: 89, due: '2026-12-03', autopay: true },
  { name: 'NW Natural gas', amount: 64, due: '2026-12-05', autopay: false },
  { name: 'City water & sewer', amount: 78, due: '2026-12-08', autopay: false },
  { name: 'TriMet monthly passes', amount: 100, due: '2026-12-01', autopay: true },
];

// November 2026, written out by hand: the month the household is living in.
// type is "expense" or "income". Income is Maya's and Jordan's pay, twice a month.
export const NOVEMBER_TX = [
  { id: 't001', date: '2026-11-01', payee: 'Maple Street Property Mgmt', category: 'housing', amount: 1850.00, type: 'expense', note: 'November rent' },
  { id: 't002', date: '2026-11-01', payee: 'Fred Meyer', category: 'groceries', amount: 142.37, type: 'expense', note: 'Weekly shop — produce, pantry' },
  { id: 't003', date: '2026-11-02', payee: 'PGE — Portland General Electric', category: 'utilities', amount: 118.42, type: 'expense', note: 'October electric' },
  { id: 't004', date: '2026-11-03', payee: 'Chevron — Powell Blvd', category: 'transport', amount: 46.80, type: 'expense', note: 'Outback fill-up' },
  { id: 't005', date: '2026-11-04', payee: 'Trader Joe\u2019s', category: 'groceries', amount: 58.19, type: 'expense', note: 'Snacks and lunches' },
  { id: 't006', date: '2026-11-05', payee: 'NW Natural', category: 'utilities', amount: 61.05, type: 'expense', note: 'October gas' },
  { id: 't007', date: '2026-11-06', payee: 'Providence Health — Maya pay', category: 'savings', amount: 2300.00, type: 'income', note: 'Paycheck 1 of 2' },
  { id: 't008', date: '2026-11-06', payee: 'Portland Public Schools — Jordan pay', category: 'savings', amount: 1625.00, type: 'income', note: 'Paycheck 1 of 2' },
  { id: 't009', date: '2026-11-06', payee: 'New Seasons Market', category: 'groceries', amount: 96.44, type: 'expense', note: 'Weekly shop' },
  { id: 't010', date: '2026-11-07', payee: 'Powell\u2019s City of Books', category: 'entertainment', amount: 34.50, type: 'expense', note: 'Two paperbacks for Maya' },
  { id: 't011', date: '2026-11-07', payee: 'Salt & Straw', category: 'dining', amount: 21.75, type: 'expense', note: 'Ice cream after soccer' },
  { id: 't012', date: '2026-11-08', payee: 'Costco', category: 'groceries', amount: 187.92, type: 'expense', note: 'Bulk — rice, oats, toilet paper' },
  { id: 't013', date: '2026-11-09', payee: 'TriMet', category: 'transport', amount: 100.00, type: 'expense', note: 'November Hop passes x2' },
  { id: 't014', date: '2026-11-10', payee: 'Legacy Health — copay', category: 'health', amount: 35.00, type: 'expense', note: 'Leo\u2019s check-up' },
  { id: 't015', date: '2026-11-11', payee: 'Fred Meyer', category: 'groceries', amount: 128.66, type: 'expense', note: 'Weekly shop' },
  { id: 't016', date: '2026-11-12', payee: 'Chipotle', category: 'dining', amount: 32.40, type: 'expense', note: 'Dinner, late practice night' },
  { id: 't017', date: '2026-11-13', payee: 'Netflix', category: 'subscriptions', amount: 15.49, type: 'expense', note: 'Monthly' },
  { id: 't018', date: '2026-11-13', payee: 'Spotify', category: 'subscriptions', amount: 11.99, type: 'expense', note: 'Family plan' },
  { id: 't019', date: '2026-11-14', payee: 'Target', category: 'clothing', amount: 74.20, type: 'expense', note: 'Winter coats for the kids' },
  { id: 't020', date: '2026-11-15', payee: 'Chevron — Powell Blvd', category: 'transport', amount: 42.15, type: 'expense', note: 'Fill-up' },
  { id: 't021', date: '2026-11-15', payee: 'Oregon Zoo', category: 'entertainment', amount: 58.00, type: 'expense', note: 'Family day — 4 tickets' },
  { id: 't022', date: '2026-11-16', payee: 'New Seasons Market', category: 'groceries', amount: 88.31, type: 'expense', note: 'Weekly shop' },
  { id: 't023', date: '2026-11-17', payee: 'Amazon', category: 'kids', amount: 46.99, type: 'expense', note: 'School supplies restock' },
  { id: 't024', date: '2026-11-18', payee: 'Plaid Pantry', category: 'dining', amount: 14.85, type: 'expense', note: 'Coffee and pastries' },
  { id: 't025', date: '2026-11-19', payee: 'Fred Meyer', category: 'groceries', amount: 134.58, type: 'expense', note: 'Weekly shop + Thanksgiving list' },
  { id: 't026', date: '2026-11-20', payee: 'Providence Health — Maya pay', category: 'savings', amount: 2300.00, type: 'income', note: 'Paycheck 2 of 2' },
  { id: 't027', date: '2026-11-20', payee: 'Portland Public Schools — Jordan pay', category: 'savings', amount: 1625.00, type: 'income', note: 'Paycheck 2 of 2' },
  { id: 't028', date: '2026-11-20', payee: 'Xfinity', category: 'utilities', amount: 89.00, type: 'expense', note: 'Internet' },
  { id: 't029', date: '2026-11-21', payee: 'Portland Parks — soccer fees', category: 'kids', amount: 85.00, type: 'expense', note: 'Sofia winter league' },
  { id: 't030', date: '2026-11-22', payee: 'Le Pigeon', category: 'dining', amount: 96.00, type: 'expense', note: 'Anniversary dinner' },
  { id: 't031', date: '2026-11-23', payee: 'CVS Pharmacy', category: 'health', amount: 28.47, type: 'expense', note: 'Prescriptions' },
  { id: 't032', date: '2026-11-24', payee: 'Trader Joe\u2019s', category: 'groceries', amount: 71.20, type: 'expense', note: 'Thanksgiving week top-up' },
  { id: 't033', date: '2026-11-25', payee: 'Transfer to emergency fund', category: 'savings', amount: 400.00, type: 'expense', note: 'Monthly auto-transfer' },
  { id: 't034', date: '2026-11-26', payee: 'Transfer to coast trip fund', category: 'savings', amount: 150.00, type: 'expense', note: 'Monthly auto-transfer' },
];

// --- Past months, generated deterministically --------------------------------
// A tiny fixed-seed generator (mulberry32) so June–October look lived-in but
// never change. Each month gets the two paychecks, rent, a weekly grocery run,
// utilities, fuel, and a rotating cast of ordinary purchases.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PAST_TEMPLATES = [
  ['Fred Meyer', 'groceries', 95, 165],
  ['New Seasons Market', 'groceries', 70, 130],
  ['Trader Joe\u2019s', 'groceries', 45, 95],
  ['Costco', 'groceries', 120, 210],
  ['PGE — Portland General Electric', 'utilities', 95, 150],
  ['NW Natural', 'utilities', 45, 85],
  ['Xfinity', 'utilities', 89, 89],
  ['Chevron — Powell Blvd', 'transport', 38, 55],
  ['TriMet', 'transport', 100, 100],
  ['Chipotle', 'dining', 24, 40],
  ['Salt & Straw', 'dining', 16, 28],
  ['Plaid Pantry', 'dining', 10, 22],
  ['Powell\u2019s City of Books', 'entertainment', 18, 45],
  ['Oregon Zoo', 'entertainment', 0, 60],
  ['Regal Cinemas', 'entertainment', 22, 38],
  ['Legacy Health — copay', 'health', 25, 60],
  ['CVS Pharmacy', 'health', 15, 45],
  ['Target', 'clothing', 35, 95],
  ['Amazon', 'kids', 25, 70],
  ['Portland Parks — soccer fees', 'kids', 0, 90],
  ['Netflix', 'subscriptions', 15.49, 15.49],
  ['Spotify', 'subscriptions', 11.99, 11.99],
  ['Transfer to emergency fund', 'savings', 400, 400],
  ['Transfer to coast trip fund', 'savings', 150, 150],
];

function pastMonthTx(year, month /* 1-based */, seedBase) {
  const rnd = mulberry32(seedBase + year * 100 + month);
  const out = [];
  const days = new Date(year, month, 0).getDate();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = (d) => `${year}-${pad(month)}-${pad(d)}`;
  let n = 0;
  const push = (day, payee, category, amount, type, note) => {
    n += 1;
    out.push({ id: `p${year}${pad(month)}${String(n).padStart(2, '0')}`, date: stamp(day), payee, category, amount: Math.round(amount * 100) / 100, type, note });
  };
  push(1, 'Maple Street Property Mgmt', 'housing', 1850, 'expense', 'Monthly rent');
  push(6, 'Providence Health — Maya pay', 'savings', 2300, 'income', 'Paycheck 1 of 2');
  push(6, 'Portland Public Schools — Jordan pay', 'savings', 1625, 'income', 'Paycheck 1 of 2');
  push(20, 'Providence Health — Maya pay', 'savings', 2300, 'income', 'Paycheck 2 of 2');
  push(20, 'Portland Public Schools — Jordan pay', 'savings', 1625, 'income', 'Paycheck 2 of 2');
  for (const [payee, category, lo, hi] of PAST_TEMPLATES) {
    if (rnd() < 0.22) continue; // some months skip some purchases
    const day = 2 + Math.floor(rnd() * (days - 3));
    const amount = lo === hi ? lo : lo + rnd() * (hi - lo);
    push(day, payee, category, amount, 'expense', '');
  }
  // A couple of unplanned one-offs keep each month distinct.
  const oneOffs = [
    ['Farmers market — PSU', 'groceries', 28, 52],
    ['Burgerville', 'dining', 26, 44],
    ['Home Depot', 'misc', 40, 120],
    ['Powell\u2019s — kids books', 'kids', 18, 36],
    ['REI', 'clothing', 45, 110],
    ['Oil change — Les Schwab', 'transport', 65, 95],
  ];
  for (const [payee, category, lo, hi] of oneOffs) {
    if (rnd() < 0.5) continue;
    push(3 + Math.floor(rnd() * (days - 4)), payee, category, lo + rnd() * (hi - lo), 'expense', '');
  }
  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
  return out;
}

export const PAST_MONTH_TX = [
  ...pastMonthTx(2026, 6, 11),
  ...pastMonthTx(2026, 7, 23),
  ...pastMonthTx(2026, 8, 37),
  ...pastMonthTx(2026, 9, 51),
  ...pastMonthTx(2026, 10, 67),
];

export const SEED_TRANSACTIONS = [...PAST_MONTH_TX, ...NOVEMBER_TX];

// Months the site has data for, oldest first. November 2026 is "now".
export const MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
export const CURRENT_MONTH = '2026-11';
