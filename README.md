# Hearth Ledger — The Alvarez Household Budget

[![make.fun](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/cendelobening/best-household-budget-site-20261126-1457/rank.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/cendelobening/best-household-budget-site-20261126-1457/reward.svg)](https://make.fun/c/best-household-budget-site-20261126-1457)

An entry for the [make.fun "Make the best household budget site" bounty](https://make.fun/c/best-household-budget-site-20261126-1457).

**Hearth Ledger** is a working household budget site for a fictional family — Maya & Jordan Alvarez, Sofia (9) and Leo (6) in Portland, Oregon. Real figures are already in place (two paychecks, rent, weekly shops, bills, four savings goals), and every control does what it says: add, edit and delete transactions, change budget limits, add money to a goal, move between months, and watch every total recompute. All data is saved in the browser's localStorage; nothing leaves the device.

## The site

- **Overview** (`#/`): month tiles (income, spent, left to save, budgeted), a spending-by-category donut chart, bills coming up with mark-paid buttons, and the five latest transactions.
- **Transactions** (`#/transactions`): the full ledger for the month with a running balance, search by payee or note, filter by category and type, an add form, and inline edit / delete on every row.
- **Budgets** (`#/budgets`): a monthly limit per category with a progress bar that turns amber past 85% and red when over, over/under status, and an inline limit editor.
- **Savings goals** (`#/goals`): four goals with progress bars, months-to-go at the current monthly contribution, an add-savings form per goal, and a form to start a new goal.
- **Reports** (`#/reports`): income vs spending bars for six months, the biggest single expenses of the month, and a category-by-category table against last month.

Charts are drawn with vanilla canvas (see `app/charts.js`); the ledger and its arithmetic live in `app/store.js`, the seed figures in `app/data.js`, and the pages in `app/views.js`. No libraries, no build step, no network requests — the site works from its own files alone, on a desktop and on a phone.

## Run it

```sh
node serve.ts        # serves app/ on http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
