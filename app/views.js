// Views for Hearth Ledger — one render function per hash route. Each returns
// an HTML string for #app; main.js owns routing, events and the small piece
// of UI state (filters, which row is being edited, whether the add form is
// open). All figures come from store.js, so every number on screen recomputes
// from the same ledger.

import { CATEGORIES, CATEGORY_MAP, HOUSEHOLD, MONTHS } from './data.js';
import {
  budgetStatus, goalProgress, monthLabel, monthSummary, monthTransactions,
  money, moneySigned, nextMonth, prevMonth, totalBudgeted, upcomingBills,
} from './store.js';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function catPill(category) {
  const c = CATEGORY_MAP[category];
  return `<span class="pill" style="background:${c ? c.color : '#78716c'}">${esc(c ? c.label : category)}</span>`;
}

function pageHead(title, intro) {
  return `<div class="page-head"><h2>${esc(title)}</h2><p>${esc(intro)}</p></div>`;
}

function monthNav(month) {
  const prev = prevMonth(month);
  const next = nextMonth(month);
  return `<div class="monthbar" role="group" aria-label="Choose month">
    <button type="button" class="ghost" data-action="month-prev" ${prev ? '' : 'disabled'} aria-label="Previous month">‹ Prev</button>
    <span class="month-label" id="month-label">${esc(monthLabel(month))}</span>
    <button type="button" class="ghost" data-action="month-next" ${next ? '' : 'disabled'} aria-label="Next month">Next ›</button>
  </div>`;
}

// --- Overview ----------------------------------------------------------------

export function renderOverview(state) {
  const month = state.month;
  const s = monthSummary(month);
  const budgets = budgetStatus(month);
  const over = budgets.filter((b) => b.over);
  const near = budgets.filter((b) => !b.over && b.pct >= 85);
  const bills = upcomingBills();
  const unpaid = bills.filter((b) => !b.paid);
  const recent = monthTransactions(month).slice(-5).reverse();
  const slices = CATEGORIES
    .map((c) => ({ label: c.label, value: s.byCategory[c.id] || 0, color: c.color }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);

  let alert = '';
  if (over.length) {
    alert = `<div class="callout bad"><p><strong>Over budget in ${over.length} categor${over.length === 1 ? 'y' : 'ies'}:</strong> ${over.map((b) => esc(b.label)).join(', ')}. See <a href="#/budgets">Budgets</a> to adjust or move money.</p></div>`;
  } else if (near.length) {
    alert = `<div class="callout"><p><strong>Almost there:</strong> ${near.map((b) => `${esc(b.label)} (${Math.round(b.pct)}%)`).join(', ')} — a few days left in the month.</p></div>`;
  } else {
    alert = `<div class="callout good"><p><strong>On track.</strong> Every category is inside its monthly limit with ${esc(monthLabel(month).split(' ')[0])} still to go.</p></div>`;
  }

  const legend = slices.map((x) => `<li><span class="dot" style="background:${x.color}"></span>${esc(x.label)}<span class="amt">${money(x.value)}</span></li>`).join('');

  const billRows = bills.map((b) => `
    <li class="${b.paid ? 'paid' : ''}">
      <span class="bill-name">${esc(b.name)}<span class="sub">Due ${esc(b.due)}${b.autopay ? ' · Autopay on' : ' · Pay manually'}</span></span>
      <span class="bill-amt">${money(b.amount)}</span>
      <button type="button" class="small ${b.paid ? 'ghost' : ''}" data-action="bill-toggle" data-name="${esc(b.name)}">${b.paid ? 'Paid ✓' : 'Mark paid'}</button>
    </li>`).join('');

  const recentRows = recent.length
    ? recent.map((t) => `
      <tr class="${t.type}">
        <td>${esc(t.date.slice(5))}</td>
        <td>${esc(t.payee)}${t.note ? `<span class="sub">${esc(t.note)}</span>` : ''}</td>
        <td class="hide-sm">${catPill(t.category)}</td>
        <td class="num">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
      </tr>`).join('')
    : `<tr><td colspan="4" class="empty">No transactions in ${esc(monthLabel(month))} yet.</td></tr>`;

  return `
    ${pageHead(`${HOUSEHOLD.name} — Overview`, `${HOUSEHOLD.members} · ${HOUSEHOLD.city}. Here is where ${monthLabel(month)} stands, at a glance.`)}
    ${monthNav(month)}
    ${alert}
    <div class="tiles">
      <div class="tile good"><div class="label">Income</div><div class="figure">${money(s.income)}</div><div class="sub">2 paychecks each</div></div>
      <div class="tile"><div class="label">Spent</div><div class="figure">${money(s.spent)}</div><div class="sub">${s.count} transactions</div></div>
      <div class="tile ${s.saved >= 0 ? 'good' : 'warn'}"><div class="label">Left to save</div><div class="figure">${moneySigned(s.saved)}</div><div class="sub">${s.savingsRate.toFixed(1)}% savings rate</div></div>
      <div class="tile"><div class="label">Budgeted</div><div class="figure">${money(totalBudgeted())}</div><div class="sub">${over.length ? over.length + ' over limit' : 'all inside limits'}</div></div>
    </div>
    <div class="grid two">
      <section class="card">
        <h3>Where the money went</h3>
        <p class="hint">Spending by category in ${esc(monthLabel(month))}, transfers to savings included.</p>
        <div class="chart-box"><canvas class="donut" id="donut" width="600" height="240" aria-label="Donut chart of spending by category"></canvas></div>
        <ul class="legend">${legend}</ul>
      </section>
      <section class="card">
        <h3>Bills coming up</h3>
        <p class="hint">${unpaid.length} unpaid · ${money(unpaid.reduce((a, b) => a + b.amount, 0))} still to pay.</p>
        <ul class="bill-list">${billRows}</ul>
      </section>
      <section class="card span2">
        <h3>Recent transactions</h3>
        <p class="hint">The latest five in ${esc(monthLabel(month))}. <a href="#/transactions">See them all →</a></p>
        <div class="table-wrap"><table>
          <thead><tr><th>Date</th><th>Payee</th><th class="hide-sm">Category</th><th class="num">Amount</th></tr></thead>
          <tbody>${recentRows}</tbody>
        </table></div>
      </section>
    </div>`;
}

// --- Transactions ------------------------------------------------------------

function txFormFields(tx) {
  const t = tx || { date: '2026-11-26', payee: '', category: 'groceries', amount: '', type: 'expense', note: '' };
  const opts = CATEGORIES.map((c) => `<option value="${c.id}" ${t.category === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
  return `
    <div class="field"><label for="f-date">Date</label><input id="f-date" name="date" type="date" value="${esc(t.date)}" required></div>
    <div class="field"><label for="f-payee">Payee</label><input id="f-payee" name="payee" type="text" value="${esc(t.payee)}" placeholder="e.g. Fred Meyer" required maxlength="80"></div>
    <div class="field"><label for="f-category">Category</label><select id="f-category" name="category">${opts}</select></div>
    <div class="field"><label for="f-amount">Amount (USD)</label><input id="f-amount" name="amount" type="number" min="0.01" step="0.01" value="${t.amount === '' ? '' : t.amount}" placeholder="0.00" required></div>
    <div class="field"><label for="f-type">Type</label><select id="f-type" name="type">
      <option value="expense" ${t.type === 'expense' ? 'selected' : ''}>Expense</option>
      <option value="income" ${t.type === 'income' ? 'selected' : ''}>Income</option>
    </select></div>
    <div class="field"><label for="f-note">Note (optional)</label><input id="f-note" name="note" type="text" value="${esc(t.note || '')}" maxlength="120" placeholder="What was this for?"></div>`;
}

export function renderTransactions(state, ui) {
  const month = state.month;
  const all = monthTransactions(month);
  const q = (ui.txSearch || '').trim().toLowerCase();
  const cat = ui.txCategory || 'all';
  const type = ui.txType || 'all';
  const filtered = all.filter((t) => {
    if (cat !== 'all' && t.category !== cat) return false;
    if (type !== 'all' && t.type !== type) return false;
    if (q && !(t.payee.toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q))) return false;
    return true;
  });

  // Running balance: walk oldest first, then display newest first.
  const running = new Map();
  let bal = 0;
  for (const t of all) {
    bal += t.type === 'income' ? Number(t.amount) : -Number(t.amount);
    running.set(t.id, bal);
  }
  const shown = [...filtered].reverse();

  const rows = shown.length ? shown.map((t) => {
    if (ui.editingTxId === t.id) {
      return `<tr class="editing"><td colspan="6">
        <form data-form="edit-tx" data-id="${esc(t.id)}">
          <div class="form-grid cols-2">${txFormFields(t)}</div>
          <p class="field"><span class="error" data-error></span></p>
          <div class="edit-row">
            <button type="submit">Save changes</button>
            <button type="button" class="ghost" data-action="edit-cancel">Cancel</button>
            <button type="button" class="danger" data-action="tx-delete" data-id="${esc(t.id)}">Delete</button>
          </div>
        </form>
      </td></tr>`;
    }
    return `<tr class="${t.type}">
      <td>${esc(t.date)}</td>
      <td>${esc(t.payee)}${t.note ? `<span class="sub">${esc(t.note)}</span>` : ''}</td>
      <td class="hide-sm">${catPill(t.category)}</td>
      <td class="num">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td>
      <td class="num">${moneySigned(running.get(t.id))}</td>
      <td class="num"><button type="button" class="small ghost" data-action="tx-edit" data-id="${esc(t.id)}">Edit</button></td>
    </tr>`;
  }).join('') : `<tr><td colspan="6" class="empty">Nothing matches — try clearing the search or picking another month.</td></tr>`;

  const catOpts = `<option value="all">All categories</option>` + CATEGORIES.map((c) => `<option value="${c.id}" ${cat === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
  const totalIn = filtered.filter((t) => t.type === 'income').reduce((a, t) => a + Number(t.amount), 0);
  const totalOut = filtered.filter((t) => t.type === 'expense').reduce((a, t) => a + Number(t.amount), 0);

  return `
    ${pageHead('Transactions', `Every dollar in and out in ${monthLabel(month)}. Add, edit or delete — totals and budgets update everywhere at once.`)}
    ${monthNav(month)}
    <div class="toolbar">
      <div class="field search"><label for="tx-search">Search payee or note</label><input id="tx-search" type="text" value="${esc(ui.txSearch || '')}" placeholder="e.g. Fred Meyer" data-input="tx-search"></div>
      <div class="field"><label for="tx-cat">Category</label><select id="tx-cat" data-input="tx-category">${catOpts}</select></div>
      <div class="field"><label for="tx-type">Type</label><select id="tx-type" data-input="tx-type">
        <option value="all" ${type === 'all' ? 'selected' : ''}>Income &amp; expense</option>
        <option value="expense" ${type === 'expense' ? 'selected' : ''}>Expenses only</option>
        <option value="income" ${type === 'income' ? 'selected' : ''}>Income only</option>
      </select></div>
      <button type="button" data-action="add-toggle">${ui.showAddForm ? 'Close form' : '+ Add transaction'}</button>
    </div>
    ${ui.showAddForm ? `
    <section class="card" style="margin-bottom:16px">
      <h3>Add a transaction</h3>
      <form data-form="add-tx">
        <div class="form-grid cols-2">${txFormFields(null)}</div>
        <p class="field"><span class="error" data-error></span></p>
        <button type="submit">Add transaction</button>
      </form>
    </section>` : ''}
    <section class="card">
      <div class="kv"><span class="k">Showing ${shown.length} of ${all.length} transactions</span><span class="v">${money(totalIn)} in · ${money(totalOut)} out</span></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Payee</th><th class="hide-sm">Category</th><th class="num">Amount</th><th class="num">Balance</th><th class="num">Edit</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </section>`;
}

// --- Budgets -----------------------------------------------------------------

export function renderBudgets(state, ui) {
  const month = state.month;
  const rows = budgetStatus(month);
  const s = monthSummary(month);
  const totalSpent = rows.reduce((a, b) => a + b.spent, 0);
  const totalLimit = totalBudgeted();

  const body = rows.map((b) => {
    const pct = Math.min(100, b.pct);
    const cls = b.over ? 'over' : b.pct >= 85 ? 'warm' : '';
    const status = b.over
      ? `<span class="status over">Over by ${money(-b.remaining)} — move money or raise the limit.</span>`
      : b.remaining === 0
        ? `<span class="status near">Exactly at the limit — nothing left, nothing over.</span>`
      : b.pct >= 85
        ? `<span class="status near">${money(b.remaining)} left — nearly there.</span>`
        : `<span class="status ok">${money(b.remaining)} left this month.</span>`;
    const editor = ui.editingBudget === b.category
      ? `<form data-form="edit-budget" data-category="${esc(b.category)}" class="inline-form" style="margin-top:8px">
          <label for="limit-${esc(b.category)}">Monthly limit $</label>
          <input id="limit-${esc(b.category)}" name="limit" type="number" min="0" step="1" value="${b.limit}" required>
          <button type="submit" class="small">Save</button>
          <button type="button" class="small ghost" data-action="budget-cancel">Cancel</button>
        </form>`
      : `<button type="button" class="small ghost" data-action="budget-edit" data-category="${esc(b.category)}">Change limit</button>`;
    return `<div class="budget-row">
      <div class="row-top"><span class="cat"><span class="dot" style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${b.color};margin-right:8px"></span>${esc(b.label)}</span>
      <span class="nums"><b>${money(b.spent)}</b> of ${money(b.limit)} · ${Math.round(b.pct)}%</span></div>
      <div class="meter ${cls}" role="progressbar" aria-valuenow="${Math.round(b.pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(b.label)} budget used"><span style="width:${pct}%"></span></div>
      ${status}
      <div style="margin-top:8px">${editor}</div>
    </div>`;
  }).join('');

  return `
    ${pageHead('Budgets', `Monthly limits for ${monthLabel(month)}. A bar turns amber past 85% and red when the limit is passed — change any limit to fit real life.`)}
    ${monthNav(month)}
    <div class="tiles">
      <div class="tile"><div class="label">Total budgeted</div><div class="figure">${money(totalLimit)}</div><div class="sub">across ${rows.length} categories</div></div>
      <div class="tile"><div class="label">Spent vs budget</div><div class="figure">${money(totalSpent)}</div><div class="sub">${totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0}% of the plan used</div></div>
      <div class="tile ${totalLimit - totalSpent >= 0 ? 'good' : 'warn'}"><div class="label">Budget left</div><div class="figure">${moneySigned(totalLimit - totalSpent)}</div><div class="sub">income ${money(s.income)} this month</div></div>
    </div>
    <section class="card">${body}</section>
    <p style="color:var(--muted);font-size:14px">Tip: rent is fixed, so its bar is either full or empty. The bars that move day to day are groceries, dining and transport — those are the ones worth watching.</p>`;
}

// --- Goals -------------------------------------------------------------------

export function renderGoals(state, ui) {
  const goals = state.goals;
  const totalSaved = goals.reduce((a, g) => a + Number(g.saved), 0);
  const totalTarget = goals.reduce((a, g) => a + Number(g.target), 0);
  const monthly = goals.reduce((a, g) => a + Number(g.monthly || 0), 0);

  const cards = goals.map((g) => {
    const p = goalProgress(g);
    const monthsLeft = g.monthly > 0 && p.remaining > 0 ? Math.ceil(p.remaining / g.monthly) : 0;
    return `<section class="card goal">
      <div class="goal-head"><span class="name">${esc(g.name)}</span><span class="figure">${money(g.saved)} <span style="color:var(--faint);font-size:14px">of ${money(g.target)}</span></span></div>
      <p class="note">${esc(g.note)}</p>
      <div class="meter" role="progressbar" aria-valuenow="${Math.round(p.pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(g.name)} progress"><span style="width:${p.pct}%"></span></div>
      <div class="goal-foot">
        <span>${Math.round(p.pct)}% funded · ${money(p.remaining)} to go${monthsLeft ? ` · about ${monthsLeft} month${monthsLeft === 1 ? '' : 's'} at ${money(g.monthly)}/mo` : ''}</span>
      </div>
      <form data-form="contribute" data-id="${esc(g.id)}" class="inline-form" style="margin-top:12px">
        <label for="add-${esc(g.id)}">Add to this goal $</label>
        <input id="add-${esc(g.id)}" name="amount" type="number" min="1" step="1" placeholder="50" required>
        <button type="submit" class="small">Add savings</button>
      </form>
    </section>`;
  }).join('');

  return `
    ${pageHead('Savings goals', 'Four things the Alvarez family is saving for. Add money to a goal and watch its bar move — every contribution is a transfer, not new spending.')}
    <div class="tiles">
      <div class="tile good"><div class="label">Saved so far</div><div class="figure">${money(totalSaved)}</div><div class="sub">across ${goals.length} goals</div></div>
      <div class="tile"><div class="label">Total target</div><div class="figure">${money(totalTarget)}</div><div class="sub">${totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0}% funded overall</div></div>
      <div class="tile"><div class="label">Auto-saving</div><div class="figure">${money(monthly)}/mo</div><div class="sub">transferred on payday</div></div>
    </div>
    <div class="grid two">${cards}</div>
    ${ui.showGoalForm ? `
    <section class="card" style="margin-top:16px">
      <h3>Start a new goal</h3>
      <form data-form="add-goal">
        <div class="form-grid cols-2">
          <div class="field"><label for="g-name">Goal name</label><input id="g-name" name="name" type="text" placeholder="e.g. New bikes for the kids" required maxlength="60"></div>
          <div class="field"><label for="g-target">Target amount (USD)</label><input id="g-target" name="target" type="number" min="1" step="1" placeholder="500" required></div>
          <div class="field"><label for="g-saved">Already saved (USD)</label><input id="g-saved" name="saved" type="number" min="0" step="1" value="0"></div>
          <div class="field"><label for="g-monthly">Monthly contribution (USD)</label><input id="g-monthly" name="monthly" type="number" min="0" step="1" value="50"></div>
          <div class="field" style="grid-column:1/-1"><label for="g-note">Why this goal?</label><input id="g-note" name="note" type="text" placeholder="A sentence to keep you going" maxlength="140"></div>
        </div>
        <p class="field"><span class="error" data-error></span></p>
        <button type="submit">Create goal</button>
        <button type="button" class="ghost" data-action="goal-form-toggle">Cancel</button>
      </form>
    </section>` : `
    <p style="margin-top:16px"><button type="button" data-action="goal-form-toggle">+ Start a new goal</button></p>`}
    <p style="color:var(--muted);font-size:14px">Contributions move money you already have into a goal — they do not change this month's income or spending, only where the savings sit.</p>`;
}

// --- Reports -----------------------------------------------------------------

const SHORT_MONTHS = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

export function renderReports(state) {
  const month = state.month;
  const current = monthSummary(month);
  const prev = prevMonth(month);
  const prevSum = prev ? monthSummary(prev) : null;

  const bars = MONTHS.map((m, i) => {
    const s = monthSummary(m);
    return { label: SHORT_MONTHS[i], income: s.income, spent: s.spent };
  });

  const top = monthTransactions(month)
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
    .map((t) => ({ label: t.payee, value: Number(t.amount), color: CATEGORY_MAP[t.category]?.color || '#78716c' }));
  const topMax = top.length ? top[0].value : 1;

  // Category table: this month vs last month.
  const catRows = CATEGORIES.map((c) => {
    const now = current.byCategory[c.id] || 0;
    const then = prevSum ? (prevSum.byCategory[c.id] || 0) : 0;
    const delta = now - then;
    return { label: c.label, color: c.color, now, then, delta };
  }).filter((r) => r.now > 0 || r.then > 0).sort((a, b) => b.now - a.now);

  const catBody = catRows.map((r) => `
    <tr>
      <td><span class="dot" style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${r.color};margin-right:8px"></span>${esc(r.label)}</td>
      <td class="num">${money(r.now)}</td>
      <td class="num">${money(r.then)}</td>
      <td class="num" style="color:${r.delta > 0 ? 'var(--terra)' : r.delta < 0 ? 'var(--green)' : 'inherit'}">${r.delta === 0 ? '—' : (r.delta > 0 ? '+' : '−') + money(Math.abs(r.delta))}</td>
    </tr>`).join('');

  const spentDelta = prevSum ? current.spent - prevSum.spent : 0;
  const incomeDelta = prevSum ? current.income - prevSum.income : 0;
  const verdict = prevSum
    ? (spentDelta <= 0
      ? `<div class="callout good"><p><strong>Good month.</strong> Spending is ${money(Math.abs(spentDelta))} lower than ${esc(monthLabel(prev))} while income is ${incomeDelta >= 0 ? 'up' : 'down'} ${money(Math.abs(incomeDelta))}.</p></div>`
      : `<div class="callout"><p><strong>Watch it:</strong> spending is ${money(spentDelta)} higher than ${esc(monthLabel(prev))}. The table below shows which categories drove the increase.</p></div>`)
    : '';

  return `
    ${pageHead('Reports', `Six months of the Alvarez budget, June to November 2026. Compare months, find the biggest single purchases, and see which categories moved.`)}
    ${monthNav(month)}
    ${verdict}
    <div class="tiles">
      <div class="tile"><div class="label">This month spent</div><div class="figure">${money(current.spent)}</div><div class="sub">${prevSum ? `${spentDelta >= 0 ? '+' : '−'}${money(Math.abs(spentDelta))} vs last month` : ''}</div></div>
      <div class="tile"><div class="label">This month income</div><div class="figure">${money(current.income)}</div><div class="sub">${prevSum ? `${incomeDelta >= 0 ? '+' : '−'}${money(Math.abs(incomeDelta))} vs last month` : ''}</div></div>
      <div class="tile ${current.savingsRate >= 20 ? 'good' : ''}"><div class="label">Savings rate</div><div class="figure">${current.savingsRate.toFixed(1)}%</div><div class="sub">${prevSum ? `was ${prevSum.savingsRate.toFixed(1)}% last month` : ''}</div></div>
      <div class="tile"><div class="label">Biggest single expense</div><div class="figure">${top.length ? money(top[0].value) : '—'}</div><div class="sub">${top.length ? esc(top[0].label) : ''}</div></div>
    </div>
    <div class="grid two">
      <section class="card">
        <h3>Income vs spending — last 6 months</h3>
        <p class="hint">Green is money in, terracotta is money out. November is the month in progress.</p>
        <div class="chart-box"><canvas class="bars" id="month-bars" width="600" height="280" aria-label="Bar chart of income versus spending for the last six months"></canvas></div>
      </section>
      <section class="card">
        <h3>Biggest expenses — ${esc(monthLabel(month))}</h3>
        <p class="hint">The six largest single purchases this month, rent included.</p>
        <div class="chart-box"><canvas class="topbars" id="top-bars" width="600" height="260" aria-label="Horizontal bar chart of the biggest expenses"></canvas></div>
      </section>
      <section class="card span2">
        <h3>Category by category — this month vs last</h3>
        <p class="hint">Red means more than last month, green means less. Savings transfers count as spending here because the money left the checking account.</p>
        <div class="table-wrap"><table>
          <thead><tr><th>Category</th><th class="num">${esc(monthLabel(month))}</th><th class="num">${prev ? esc(monthLabel(prev)) : '—'}</th><th class="num">Change</th></tr></thead>
          <tbody>${catBody}</tbody>
        </table></div>
      </section>
    </div>`;
}
