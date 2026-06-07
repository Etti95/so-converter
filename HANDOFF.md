# R DataBlocks SIE Converter Handoff

## Project Status

This project is a static browser MVP for converting Swedish SIE `.se` / `.sie` accounting files into analysis-ready `.xlsx` workbooks.

The app is currently opened in the in-app browser at:

`file:///Users/richmore/Desktop/projects/so_converter/index.html`

No framework, package manager, build step, server, database, payment provider, or LLM integration is currently used.

## Files

- `index.html`  
  Swedish-facing product page and converter UI. Includes R DataBlocks branding, upload form, options, results panel, pricing section, and workbook format section.

- `styles.css`  
  Responsive styling for the branded landing/converter experience. The design uses the R DataBlocks logo colors naturally without relying on external design libraries.

- `app.js`  
  Client-side deterministic SIE parser, workbook builder, and minimal XLSX writer. No external JS dependencies.

- `assets/rdata_logo.jpeg`  
  R DataBlocks logo copied from `/Users/richmore/Documents/R_DataBlocks/rdata_logo.jpeg`.

- `README.md`  
  Short usage and product-boundary notes.

## Current Product Behavior

The current version:

- accepts `.se`, `.sie`, and `.txt` SIE exports through a file input or drag-and-drop
- parses the file locally in the browser
- does not upload the file anywhere
- uses no LLM or AI calls
- generates an `.xlsx` workbook directly in browser JavaScript
- exposes conversion options:
  - workbook name
  - all transactions vs latest fiscal-year filter
  - include raw SIE lines
  - keep empty analysis sheets
- displays metrics for vouchers, transactions, accounts, and warnings
- provides a download link once conversion succeeds

The page presents the intended commercial model:

- `10 kr` per converted document
- `99 kr / månad` subscription for unlimited documents

Payment is not implemented yet.

## Workbook Output

Generated workbooks include these sheets:

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

The XLSX generation is implemented manually in `app.js`:

- XML worksheets are generated with inline strings and numeric cells.
- A minimal valid OpenXML package is created.
- ZIP output is generated in-browser using uncompressed ZIP entries and CRC32.
- No SheetJS, ExcelJS, JSZip, or CDN dependency is used.

## SIE Parser Notes

The parser currently supports:

- quoted SIE fields
- grouped dimension tokens like `{}`
- `#KONTO`
- `#RAR`
- `#IB`
- `#UB`
- `#RES`
- `#VER`
- `#TRANS`
- `#RTRANS`
- `#BTRANS`
- generic metadata rows for other `#` commands
- warnings for unknown non-command rows and transactions outside an active voucher

Encoding handling:

- UTF-8 is used by default.
- `#FORMAT PC8` triggers CP437 decoding.
- If UTF-8 has replacement characters, it falls back toward legacy decoding.
- Swedish characters are preserved in tested UTF-8 and CP437 flows.

Known parser limitations:

- Dimension/object data is preserved as raw text, not normalized into separate dimension columns yet.
- SIE variants beyond common SIE4 transaction exports may need additional command handling.
- No formal fixture suite exists yet.
- The current parser is deterministic but not certified against the full SIE specification.

## Verification Completed

Commands already run successfully:

```bash
node --check app.js
```

Smoke test performed with a small Swedish SIE sample:

- 1 voucher parsed
- 3 transactions parsed
- 3 accounts parsed
- 10 workbook sheets generated
- `.xlsx` blob generated successfully

Temporary workbook validation:

```bash
unzip -t /private/tmp/rdatablocks-sie-test.xlsx
```

Result: all expected OpenXML package files tested OK, no ZIP errors.

Visual browser automation was not performed because Playwright was not installed and the dedicated browser automation tool was not exposed in the session. The user has the page open through the in-app browser.

## Recommended Next Steps

1. Add real fixture-based tests.
   - Create representative `.se` fixtures for UTF-8, PC8, dimensions, missing account names, multi-year files, and larger exports.
   - Add expected row counts and workbook sheet assertions.

2. Add payment gating.
   - Use a backend route and Stripe Checkout or equivalent.
   - Gate production downloads server-side.
   - Keep deterministic conversion separate from optional AI features.

3. Add batch conversion for subscribers.
   - Multiple SIE files in one upload.
   - One workbook per file or one combined workbook with source-file columns.

4. Improve SIE dimension handling.
   - Parse dimension/object pairs into normalized columns.
   - Add a dimension summary sheet.

5. Add import/export quality checks.
   - Trial balance checks.
   - Voucher-level debit/credit balance checks.
   - Missing account-name report.

6. Add optional AI analysis later.
   - Keep it explicitly opt-in.
   - Use workbook output or parsed transaction tables as the analysis input.
   - Do not mix AI with the core conversion path.

## Important Constraint

Do not introduce LLM calls into the core conversion path. The main value proposition is deterministic, low-cost SIE-to-XLSX conversion for Swedish companies.
