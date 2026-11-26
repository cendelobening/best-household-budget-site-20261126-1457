// The household's ledger: state, persistence and the arithmetic every view
// shares. Data lives in localStorage under one key so the family can edit,
// delete and add without a server; the seed in data.js is only the starting
// point and is re-seeded when the stored copy is missing or corrupt.
import { BUDGETS, BILLS, CATEGORIES, CATEGORY_MAP, CURRENT_MONTH, GOALS, MONTHS, SEED_TRANSACTIONS } from './data.js';

const STORAGE_KEY = 'hearth-ledger-v1';

export const MONTH_LABELS = {
  '2026-06': 'June 2026', '2026-07': 'July 2026', '2026-08': 'August 2026',
  '2026-09': 'September 2026', '2026-10': 'October 2026', '2026-11': 'November 2026',
};

export function money(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function moneySigned(n) {
  const v = Number(n) || 0;
  return (v < 0 ? '−' : '') + money(Math.abs(v));
}

export function monthOf(dateStr) {
  return String(dateStr || '').slice(0, 7);
}

export function monthLabel(month) {
  return MONTH_LABELS[month] || month;
}

export function monthIndex(month) {
  return MONTHS.indexOf(month);
}

export function prevMonth(month) {
  const i = MONTHS.indexOf(month);
  return i > 0 ? MONTHS[i - 1] : null;
}

export function nextMonth(month) {
  const i = MONTHS.indexOf(month);
  return i >= 0 && i < MONTHS.length - 1 ? MONTHS[i + 1] : null;
}

function seedState() {
  return {
    version: 1,
    month: CURRENT_MONTH,
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: BUDGETS.map((b) => ({ ...b })),
    goals: GOALS.map((g) => ({ ...g })),
    bills: BILLS.map((b) => ({ ...b })),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.budgets) || !Array.isArray(parsed.goals)) {
      return seedState();
    }
    return parsed;
  } catch {
    return seedState();
  }
}

let state = loadState();

export function getState() {
  return state;
}

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the in-memory copy still works for the session.
  }
}

export function resetAll() {
  state = seedState();
  save();
  return state;
}

export function setMonth(month) {
  if (MONTHS.includes(month)) {
    state.month = month;
    save();
  }
  return state.month;
}

// --- Transactions ------------------------------------------------------------

export function monthTransactions(month) {
  return state.transactions
    .filter((t) => monthOf(t.date) === month)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
}

export function nextTxId() {
  let max = 0;
  for (const t of state.transactions) {
    const m = /^t(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `t${String(max + 1).padStart(3, '0')}`;
}

export function addTransaction(tx) {
  const rec = { id: nextTxId(), ...tx };
  state.transactions.push(rec);
  save();
  return rec;
}

export function updateTransaction(id, patch) {
  const rec = state.transactions.find((t) => t.id === id);
  if (!rec) return null;
  Object.assign(rec, patch);
  save();
  return rec;
}

export function deleteTransaction(id) {
  const before = state.transactions.length;
  state.transactions = state.transactions.filter((t) => t.id !== id);
  if (state.transactions.length !== before) save();
  return state.transactions.length !== before;
}

// --- Month arithmetic --------------------------------------------------------

export function monthSummary(month) {
  const txs = monthTransactions(month);
  let income = 0;
  let spent = 0;
  const byCategory = {};
  for (const c of CATEGORIES) byCategory[c.id] = 0;
  for (const t of txs) {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') {
      income += amt;
    } else {
      spent += amt;
      if (byCategory[t.category] !== undefined) byCategory[t.category] += amt;
    }
  }
  const saved = income - spent;
  const savingsRate = income > 0 ? (saved / income) * 100 : 0;
  return { income, spent, saved, savingsRate, byCategory, count: txs.length };
}

export function budgetStatus(month) {
  const summary = monthSummary(month);
  return state.budgets.map((b) => {
    const spent = summary.byCategory[b.category] || 0;
    const remaining = b.limit - spent;
    const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
    return {
      ...b,
      label: CATEGORY_MAP[b.category]?.label || b.category,
      color: CATEGORY_MAP[b.category]?.color || '#78716c',
      spent,
      remaining,
      pct,
      over: spent > b.limit,
    };
  });
}

export function totalBudgeted() {
  return state.budgets.reduce((s, b) => s + (Number(b.limit) || 0), 0);
}

// --- Goals -------------------------------------------------------------------

export function updateGoal(id, patch) {
  const goal = state.goals.find((g) => g.id === id);
  if (!goal) return null;
  Object.assign(goal, patch);
  save();
  return goal;
}

export function addGoal(goal) {
  const rec = { id: `g-${Date.now().toString(36)}`, ...goal };
  state.goals.push(rec);
  save();
  return rec;
}

export function goalProgress(goal) {
  const pct = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
  return { pct, remaining: Math.max(0, goal.target - goal.saved) };
}

// --- Budgets -----------------------------------------------------------------

export function updateBudget(category, limit) {
  const b = state.budgets.find((x) => x.category === category);
  if (!b) return null;
  b.limit = Math.max(0, Number(limit) || 0);
  save();
  return b;
}

// --- Bills -------------------------------------------------------------------

export function toggleBillPaid(name) {
  const bill = state.bills.find((b) => b.name === name);
  if (!bill) return null;
  bill.paid = !bill.paid;
  save();
  return bill;
}

export function upcomingBills() {
  return [...state.bills].sort((a, b) => (a.due < b.due ? -1 : 1));
}
