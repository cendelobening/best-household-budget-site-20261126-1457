// Hearth Ledger — router and interactions. Hash routes only, no server:
//   #/            Overview
//   #/transactions  Transactions
//   #/budgets       Budgets
//   #/goals        Savings goals
//   #/reports      Reports
// After each render the route's charts are drawn from the same ledger the
// numbers came from, so a chart can never disagree with its table.

import { CATEGORIES, CATEGORY_MAP, HOUSEHOLD, MONTHS } from './data.js';
import { drawDonut, drawMonthBars, drawTopBars } from './charts.js';
import {
  addGoal, addTransaction, deleteTransaction, getState, money, monthLabel,
  monthSummary, monthTransactions, nextMonth, prevMonth, resetAll, setMonth,
  toggleBillPaid, updateBudget, updateGoal, updateTransaction,
} from './store.js';
import { renderBudgets, renderGoals, renderOverview, renderReports, renderTransactions } from './views.js';

const app = document.getElementById('app');

// Small piece of UI state: filters, the row being edited, open forms.
const ui = {
  txSearch: '', txCategory: 'all', txType: 'all',
  editingTxId: null, showAddForm: false,
  editingBudget: null, showGoalForm: false,
};

const ROUTES = {
  '': { title: 'Overview', render: () => renderOverview(getState()) },
  'transactions': { title: 'Transactions', render: () => renderTransactions(getState(), ui) },
  'budgets': { title: 'Budgets', render: () => renderBudgets(getState(), ui) },
  'goals': { title: 'Savings goals', render: () => renderGoals(getState(), ui) },
  'reports': { title: 'Reports', render: () => renderReports(getState()) },
};

function currentRoute() {
  const hash = window.location.hash || '#/';
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  return ROUTES[path] ? path : '';
}

function drawRouteCharts(route) {
  const state = getState();
  if (route === '') {
    const canvas = document.getElementById('donut');
    if (canvas) {
      const s = monthSummary(state.month);
      const slices = CATEGORIES
        .map((c) => ({ label: c.label, value: s.byCategory[c.id] || 0, color: c.color }))
        .filter((x) => x.value > 0)
        .sort((a, b) => b.value - a.value);
      drawDonut(canvas, slices, 'Spent in ' + monthLabel(state.month).split(' ')[0], money(s.spent));
    }
  }
  if (route === 'reports') {
    const barsEl = document.getElementById('month-bars');
    if (barsEl) {
      const short = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
      const bars = MONTHS.map((m, i) => {
        const s = monthSummary(m);
        return { label: short[i], income: s.income, spent: s.spent };
      });
      drawMonthBars(barsEl, bars);
    }
    const topEl = document.getElementById('top-bars');
    if (topEl) {
      const top = monthTransactions(state.month)
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)
        .map((t) => ({ label: t.payee, value: Number(t.amount), color: CATEGORY_MAP[t.category]?.color || '#78716c' }));
      drawTopBars(topEl, top, top.length ? top[0].value : 1);
    }
  }
}

function render() {
  const route = currentRoute();
  const state = getState();
  document.title = `Hearth Ledger — ${ROUTES[route].title} · ${HOUSEHOLD.name}`;
  document.querySelectorAll('nav.tabs a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
    if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  app.innerHTML = ROUTES[route].render();
  drawRouteCharts(route);
  const label = document.getElementById('month-label');
  if (label) label.textContent = monthLabel(state.month);
}

// --- Form helpers ------------------------------------------------------------

function readForm(form) {
  const data = {};
  for (const el of form.elements) {
    if (el.name) data[el.name] = el.value;
  }
  return data;
}

function formError(form, message) {
  const slot = form.querySelector('[data-error]');
  if (slot) slot.textContent = message;
  return false;
}

function validTx(data) {
  const amount = Number(data.amount);
  if (!data.payee || !data.payee.trim()) return 'Add a payee so you know where the money went.';
  if (!Number.isFinite(amount) || amount <= 0) return 'Amount must be more than $0.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date || '')) return 'Pick a valid date.';
  if (!CATEGORY_MAP[data.category]) return 'Pick a category.';
  if (data.type !== 'income' && data.type !== 'expense') return 'Pick income or expense.';
  return null;
}

// --- Events ------------------------------------------------------------------

document.addEventListener('click', (event) => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const state = getState();

  if (action === 'month-prev') {
    const p = prevMonth(state.month);
    if (p) { setMonth(p); render(); }
  }
  if (action === 'month-next') {
    const n = nextMonth(state.month);
    if (n) { setMonth(n); render(); }
  }
  if (action === 'bill-toggle') {
    toggleBillPaid(el.dataset.name);
    render();
  }
  if (action === 'add-toggle') {
    ui.showAddForm = !ui.showAddForm;
    ui.editingTxId = null;
    render();
    if (ui.showAddForm) {
      const first = document.getElementById('f-date');
      if (first) first.focus();
    }
  }
  if (action === 'tx-edit') {
    ui.editingTxId = el.dataset.id;
    ui.showAddForm = false;
    render();
  }
  if (action === 'edit-cancel') {
    ui.editingTxId = null;
    render();
  }
  if (action === 'tx-delete') {
    if (window.confirm('Delete this transaction? Totals and budgets will update.')) {
      deleteTransaction(el.dataset.id);
      ui.editingTxId = null;
      render();
    }
  }
  if (action === 'budget-edit') {
    ui.editingBudget = el.dataset.category;
    render();
  }
  if (action === 'budget-cancel') {
    ui.editingBudget = null;
    render();
  }
  if (action === 'goal-form-toggle') {
    ui.showGoalForm = !ui.showGoalForm;
    render();
  }
  if (action === 'reset-data') {
    if (window.confirm('Reset the demo data? All your edits will be replaced by the original Alvarez household figures.')) {
      resetAll();
      ui.editingTxId = null; ui.editingBudget = null; ui.showAddForm = false; ui.showGoalForm = false;
      render();
    }
  }
});

document.addEventListener('input', (event) => {
  const el = event.target.closest('[data-input]');
  if (!el) return;
  if (el.dataset.input === 'tx-search') { ui.txSearch = el.value; }
  if (el.dataset.input === 'tx-category') { ui.txCategory = el.value; }
  if (el.dataset.input === 'tx-type') { ui.txType = el.value; }
  // Re-render, but keep the caret in the search box.
  const route = currentRoute();
  if (route !== 'transactions') return;
  const caret = el.selectionStart;
  const id = el.id;
  render();
  const again = document.getElementById(id);
  if (again && id === 'tx-search') {
    again.focus();
    again.setSelectionRange(caret, caret);
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  const kind = form.dataset.form;
  const data = readForm(form);

  if (kind === 'add-tx') {
    const err = validTx(data);
    if (err) return formError(form, err);
    addTransaction({
      date: data.date, payee: data.payee.trim(), category: data.category,
      amount: Number(data.amount), type: data.type, note: (data.note || '').trim(),
    });
    ui.showAddForm = false;
    setMonth(data.date.slice(0, 7));
    render();
  }
  if (kind === 'edit-tx') {
    const err = validTx(data);
    if (err) return formError(form, err);
    updateTransaction(form.dataset.id, {
      date: data.date, payee: data.payee.trim(), category: data.category,
      amount: Number(data.amount), type: data.type, note: (data.note || '').trim(),
    });
    ui.editingTxId = null;
    setMonth(data.date.slice(0, 7));
    render();
  }
  if (kind === 'edit-budget') {
    const limit = Number(data.limit);
    if (!Number.isFinite(limit) || limit < 0) return formError(form, 'Limit must be $0 or more.');
    updateBudget(form.dataset.category, limit);
    ui.editingBudget = null;
    render();
  }
  if (kind === 'contribute') {
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;
    const goal = getState().goals.find((g) => g.id === form.dataset.id);
    if (!goal) return;
    updateGoal(goal.id, { saved: Math.round((Number(goal.saved) + amount) * 100) / 100 });
    render();
  }
  if (kind === 'add-goal') {
    const target = Number(data.target);
    const saved = Number(data.saved) || 0;
    const monthly = Number(data.monthly) || 0;
    if (!data.name || !data.name.trim()) return formError(form, 'Give the goal a name.');
    if (!Number.isFinite(target) || target <= 0) return formError(form, 'Target must be more than $0.');
    if (saved < 0 || saved > target) return formError(form, 'Already saved must be between $0 and the target.');
    addGoal({
      name: data.name.trim(), target, saved, monthly,
      note: (data.note || '').trim() || 'A new goal for the Alvarez household.',
    });
    ui.showGoalForm = false;
    render();
  }
});

window.addEventListener('hashchange', () => {
  ui.editingTxId = null;
  ui.editingBudget = null;
  render();
  window.scrollTo(0, 0);
});

render();
