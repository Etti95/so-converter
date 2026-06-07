# R DataBlocks SIE Converter

Static browser app for converting Swedish SIE `.se` / `.sie` accounting files into analysis-ready `.xlsx` workbooks.

## Usage

Open `index.html` in a browser, choose a SIE file, and click `Skapa .xlsx`.

The current version runs fully client-side:

- no SIE upload leaves the browser
- no LLM is used for the deterministic conversion
- no payment backend is connected yet

## Workbook Sheets

- `Metadata`
- `FiscalYears`
- `Accounts`
- `Balances`
- `Vouchers`
- `Transactions`
- `MonthlySummary`
- `AccountSummary`
- `Warnings`
- `RawSIE` when enabled

## Pricing Surface

The website presents the intended commercial model:

- `10 kr` per converted document
- `99 kr / månad` subscription for unlimited documents

Production charging should be gated server-side, for example through Stripe Checkout, before exposing the final download URL.

## Handoff

See `HANDOFF.md` for current architecture, parser notes, verification status, limitations, and recommended next steps.
