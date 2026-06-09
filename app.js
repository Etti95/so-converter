"use strict";

const CP437_HIGH =
  "ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒ" +
  "áíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐" +
  "└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀" +
  "αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";

const state = {
  file: null,
  lastUrl: null
};

const form = document.querySelector("#converter-form");
const fileInput = document.querySelector("#sie-file");
const dropZone = document.querySelector("#drop-zone");
const resetButton = document.querySelector("#reset-button");
const workbookName = document.querySelector("#workbook-name");
const periodFilter = document.querySelector("#period-filter");
const includeRaw = document.querySelector("#include-raw");
const includeEmpty = document.querySelector("#include-empty");
const statusBlock = document.querySelector("#status-block");
const metrics = {
  vouchers: document.querySelector("#metric-vouchers"),
  transactions: document.querySelector("#metric-transactions"),
  accounts: document.querySelector("#metric-accounts"),
  observations: document.querySelector("#metric-observations")
};
const downloadSlot = document.querySelector("#download-slot");
const downloadLink = document.querySelector("#download-link");
const downloadNote = document.querySelector("#download-note");
const warningsBox = document.querySelector("#warnings");
const warningsList = document.querySelector("#warnings-list");

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("is-dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("is-dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-dragging");
  const [file] = event.dataTransfer.files;
  if (file) {
    state.file = file;
    fileInput.files = event.dataTransfer.files;
    setStatus("idle", file.name, t("status.fileSelected"));
  }
});

fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  state.file = file || null;
  if (file) {
    setStatus("idle", file.name, t("status.fileSelected"));
  }
});

resetButton.addEventListener("click", () => {
  form.reset();
  workbookName.value = "sie-analys";
  state.file = null;
  fileInput.value = "";
  revokeLastUrl();
  resetResults();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = state.file || fileInput.files[0];
  if (!file) {
    setStatus("warning", t("status.noFile"), t("status.noFileDesc"));
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = t("conv.creating");

  try {
    setStatus("idle", t("status.reading"), t("status.readingDesc"));
    const bytes = new Uint8Array(await file.arrayBuffer());
    const text = decodeSie(bytes);
    const parsed = parseSie(text);
    const validated = validateVouchers(parsed);
    const filtered = applyPeriodFilter(validated, periodFilter.value);
    const observations = analyzeDataQuality(filtered);
    const workbook = buildWorkbook(filtered, {
      sourceFile: file.name,
      includeRaw: includeRaw.checked,
      includeEmpty: includeEmpty.checked,
      observations
    });
    const blob = await createXlsx(workbook);
    const safeName = sanitizeFileName(workbookName.value || file.name.replace(/\.[^.]+$/, ""));
    revokeLastUrl();
    state.lastUrl = URL.createObjectURL(blob);
    downloadLink.href = state.lastUrl;
    downloadLink.download = `${safeName}.xlsx`;
    downloadSlot.hidden = false;
    downloadNote.textContent = t("status.downloadNote").replace("{size}", formatNumber(blob.size));
    updateMetrics(filtered, observations.length);
    renderWarnings(filtered.warnings);
    updateNudge(observations.length);
    setStatus(
      filtered.warnings.length ? "warning" : "success",
      t("status.created"),
      t("status.createdDesc").replace("{count}", formatNumber(filtered.transactions.length))
    );
  } catch (error) {
    console.error(error);
    setStatus("warning", t("status.error"), error.message || t("status.unknownError"));
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = t("conv.submit");
  }
});

function resetResults() {
  updateMetrics({ vouchers: [], transactions: [], accounts: [] }, 0);
  downloadSlot.hidden = true;
  warningsBox.hidden = true;
  warningsList.innerHTML = "";
  setStatus("idle", t("result.readyTitle"), t("result.readyDesc"));
}

function setStatus(kind, title, body) {
  statusBlock.innerHTML = `
    <span class="status-dot ${kind}"></span>
    <div>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(body)}</p>
    </div>
  `;
}

function updateMetrics(parsed, observationCount) {
  metrics.vouchers.textContent = formatNumber(parsed.vouchers.length);
  metrics.transactions.textContent = formatNumber(parsed.transactions.length);
  metrics.accounts.textContent = formatNumber(parsed.accounts.length);
  metrics.observations.textContent = formatNumber(observationCount || 0);
}

function updateNudge(observationCount) {
  const nudge = document.querySelector("#nudge-link");
  if (!nudge) return;
  if (observationCount > 0) {
    const word = observationCount === 1 ? t("nudge.observation") : t("nudge.observations");
    nudge.innerHTML = t("nudge.withObs").replace("{count}", observationCount).replace("{word}", word);
  } else {
    nudge.innerHTML = t("nudge.default");
  }
}

function renderWarnings(warnings) {
  warningsList.innerHTML = "";
  const visible = warnings.slice(0, 8);
  for (const warning of visible) {
    const item = document.createElement("li");
    item.textContent = warning;
    warningsList.appendChild(item);
  }
  if (warnings.length > visible.length) {
    const item = document.createElement("li");
    item.textContent = t("status.moreWarnings").replace("{count}", warnings.length - visible.length);
    warningsList.appendChild(item);
  }
  warningsBox.hidden = warnings.length === 0;
}

function revokeLastUrl() {
  if (state.lastUrl) {
    URL.revokeObjectURL(state.lastUrl);
    state.lastUrl = null;
  }
}

function decodeSie(bytes) {
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const formatMatch = utf8.match(/#FORMAT\s+([^\s]+)/i);
  const format = formatMatch ? formatMatch[1].toUpperCase() : "";

  if (format === "PC8") {
    return decodeCp437(bytes);
  }

  const replacementCount = (utf8.match(/�/g) || []).length;
  if (replacementCount === 0) {
    return utf8;
  }

  const latin1 = new TextDecoder("iso-8859-1").decode(bytes);
  if (/[åäöÅÄÖ]/.test(latin1)) {
    return latin1;
  }

  try {
    const win1252 = new TextDecoder("windows-1252").decode(bytes);
    if (/[åäöÅÄÖ]/.test(win1252)) {
      return win1252;
    }
  } catch {}

  return decodeCp437(bytes);
}

function decodeCp437(bytes) {
  let output = "";
  for (const byte of bytes) {
    output += byte < 128 ? String.fromCharCode(byte) : CP437_HIGH[byte - 128] || "";
  }
  return output;
}

function parseSie(text) {
  const data = {
    metadata: [],
    fiscalYears: [],
    accounts: [],
    balances: [],
    vouchers: [],
    transactions: [],
    rawLines: [],
    warnings: []
  };
  const accountNames = new Map();
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  let currentVoucher = null;
  let transactionIndex = 0;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    if (!line) return;

    data.rawLines.push({ lineNumber, raw: rawLine });

    if (line === "{") return;
    if (line === "}") {
      currentVoucher = null;
      return;
    }

    const tokens = tokenizeSieLine(line);
    if (!tokens.length) return;

    const command = tokens[0].toUpperCase();
    try {
      switch (command) {
        case "#KONTO": {
          const account = tokens[1] || "";
          const name = tokens.slice(2).join(" ");
          accountNames.set(account, name);
          data.accounts.push({ account, name, lineNumber });
          break;
        }
        case "#RAR": {
          data.fiscalYears.push({
            yearId: tokens[1] || "",
            startDate: normalizeSieDate(tokens[2]),
            endDate: normalizeSieDate(tokens[3]),
            lineNumber
          });
          break;
        }
        case "#IB":
        case "#UB":
        case "#RES": {
          data.balances.push({
            type: command.slice(1),
            yearId: tokens[1] || "",
            account: tokens[2] || "",
            amount: parseAmount(tokens[3]),
            quantity: parseAmount(tokens[4]),
            lineNumber
          });
          break;
        }
        case "#VER": {
          currentVoucher = {
            series: tokens[1] || "",
            voucherNumber: tokens[2] || "",
            voucherDate: normalizeSieDate(tokens[3]),
            text: tokens[4] || "",
            registeredAt: normalizeSieDate(tokens[5]),
            signature: tokens[6] || "",
            lineNumber
          };
          data.vouchers.push(currentVoucher);
          break;
        }
        case "#TRANS":
        case "#RTRANS":
        case "#BTRANS": {
          transactionIndex += 1;
          const transaction = parseTransaction(tokens, command, currentVoucher, lineNumber, transactionIndex);
          transaction.accountName = accountNames.get(transaction.account) || "";
          data.transactions.push(transaction);
          if (!currentVoucher) {
            data.warnings.push(`Rad ${lineNumber}: transaktion utan aktiv #VER.`);
          }
          break;
        }
        default: {
          if (command.startsWith("#")) {
            data.metadata.push({
              key: command.slice(1),
              value: tokens.slice(1).join(" "),
              lineNumber
            });
          } else {
            data.warnings.push(`Rad ${lineNumber}: okänd rad utan SIE-kommando.`);
          }
        }
      }
    } catch (error) {
      data.warnings.push(`Rad ${lineNumber}: kunde inte tolka "${line.slice(0, 80)}".`);
    }
  });

  if (!data.transactions.length) {
    data.warnings.push("Inga transaktioner hittades. Kontrollera att filen är en SIE4-fil.");
  }

  return data;
}

function validateVouchers(parsed) {
  const warnings = [...parsed.warnings];

  const voucherTotals = new Map();
  for (const tx of parsed.transactions) {
    if (tx.type !== "TRANS") continue;
    const key = `${tx.series}|${tx.voucherNumber}|${tx.voucherDate}`;
    const current = voucherTotals.get(key) || { sum: 0, series: tx.series, number: tx.voucherNumber, date: tx.voucherDate };
    current.sum += typeof tx.amount === "number" ? tx.amount : 0;
    voucherTotals.set(key, current);
  }

  let imbalancedCount = 0;
  for (const v of voucherTotals.values()) {
    if (Math.abs(v.sum) > 0.009) {
      imbalancedCount += 1;
      if (imbalancedCount <= 5) {
        warnings.push(`Verifikation ${v.series} ${v.number} (${v.date}): obalanserad med ${v.sum.toFixed(2)} kr.`);
      }
    }
  }
  if (imbalancedCount > 5) {
    warnings.push(`${imbalancedCount - 5} ytterligare obalanserade verifikationer.`);
  }

  const unnamed = parsed.accounts.filter((a) => !a.name.trim());
  if (unnamed.length) {
    warnings.push(`${unnamed.length} konton saknar kontonamn.`);
  }

  return { ...parsed, warnings };
}

function tokenizeSieLine(line) {
  const tokens = [];
  let token = "";
  let inQuote = false;
  let inBrace = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (inQuote) {
      if (char === "\"" && next === "\"") {
        token += "\"";
        i += 1;
      } else if (char === "\"") {
        inQuote = false;
      } else {
        token += char;
      }
      continue;
    }

    if (inBrace) {
      token += char;
      if (char === "}") {
        tokens.push(token.trim());
        token = "";
        inBrace = false;
      }
      continue;
    }

    if (char === "\"") {
      inQuote = true;
      continue;
    }

    if (char === "{") {
      if (token.trim()) {
        tokens.push(token.trim());
        token = "";
      }
      token = "{";
      inBrace = true;
      continue;
    }

    if (/\s/.test(char)) {
      if (token.trim()) {
        tokens.push(token.trim());
        token = "";
      }
      continue;
    }

    token += char;
  }

  if (token.trim()) {
    tokens.push(token.trim());
  }

  return tokens;
}

function parseTransaction(tokens, command, voucher, lineNumber, transactionIndex) {
  const account = tokens[1] || "";
  let cursor = 2;
  let dimensions = "";
  if ((tokens[cursor] || "").startsWith("{")) {
    dimensions = tokens[cursor];
    cursor += 1;
  }

  return {
    transactionId: transactionIndex,
    type: command.slice(1),
    series: voucher?.series || "",
    voucherNumber: voucher?.voucherNumber || "",
    voucherDate: voucher?.voucherDate || "",
    voucherText: voucher?.text || "",
    account,
    dimensions,
    amount: parseAmount(tokens[cursor]),
    transactionDate: normalizeSieDate(tokens[cursor + 1]),
    text: tokens[cursor + 2] || "",
    quantity: parseAmount(tokens[cursor + 3]),
    signature: tokens[cursor + 4] || "",
    lineNumber
  };
}

function applyPeriodFilter(parsed, filter) {
  if (filter !== "current-year" || !parsed.fiscalYears.length) {
    return parsed;
  }

  const years = parsed.fiscalYears
    .filter((year) => year.startDate && year.endDate)
    .sort((a, b) => b.endDate.localeCompare(a.endDate));
  const latest = years[0];
  if (!latest) return parsed;

  const inRange = (date) => date >= latest.startDate && date <= latest.endDate;
  const transactions = parsed.transactions.filter((row) => inRange(row.transactionDate || row.voucherDate));
  const voucherKeys = new Set(transactions.map((row) => `${row.series}|${row.voucherNumber}|${row.voucherDate}`));
  return {
    ...parsed,
    vouchers: parsed.vouchers.filter((row) => voucherKeys.has(`${row.series}|${row.voucherNumber}|${row.voucherDate}`)),
    transactions,
    warnings: [
      ...parsed.warnings,
      `Periodfilter: endast ${latest.startDate} till ${latest.endDate} inkluderades.`
    ]
  };
}

function analyzeDataQuality(parsed) {
  const observations = [];
  const accountNames = new Map();
  for (const a of parsed.accounts) {
    accountNames.set(a.account, a.name);
  }

  const corrections = new Map();
  const transOnly = new Map();
  for (const tx of parsed.transactions) {
    if (tx.type === "TRANS") {
      transOnly.set(tx.account, (transOnly.get(tx.account) || 0) + 1);
    } else {
      corrections.set(tx.account, (corrections.get(tx.account) || 0) + 1);
    }
  }

  for (const [account, corrCount] of corrections) {
    const txCount = transOnly.get(account) || 0;
    const total = txCount + corrCount;
    const rate = Math.round((corrCount / total) * 100);
    if (corrCount >= 3 || rate >= 20) {
      observations.push([
        "Korrigeringsfrekvens",
        account,
        accountNames.get(account) || "",
        `${corrCount} korrigeringar av ${total} bokföringsrader (${rate}%)`,
        "Hög andel rättelser kan tyda på avstämningsproblem."
      ]);
    }
  }

  const years = parsed.fiscalYears
    .filter((y) => y.startDate && y.endDate)
    .sort((a, b) => b.endDate.localeCompare(a.endDate));

  if (years.length > 0) {
    const fy = years[0];
    const fyMonths = monthRange(fy.startDate.slice(0, 7), fy.endDate.slice(0, 7));
    const innerMonths = fyMonths.length > 2 ? fyMonths.slice(1, -1) : [];

    if (innerMonths.length >= 3) {
      const accountMonths = new Map();
      for (const tx of parsed.transactions) {
        if (tx.type !== "TRANS") continue;
        const month = (tx.transactionDate || tx.voucherDate || "").slice(0, 7);
        if (!month) continue;
        if (!accountMonths.has(tx.account)) accountMonths.set(tx.account, new Set());
        accountMonths.get(tx.account).add(month);
      }

      for (const [account, months] of accountMonths) {
        const activeInner = innerMonths.filter((m) => months.has(m));
        if (activeInner.length < 4) continue;
        const first = activeInner[0];
        const last = activeInner[activeInner.length - 1];
        const span = innerMonths.filter((m) => m >= first && m <= last);
        const missing = span.filter((m) => !months.has(m));
        if (missing.length > 0) {
          observations.push([
            "Inaktiva perioder",
            account,
            accountNames.get(account) || "",
            `Saknar aktivitet ${missing.length} av ${span.length} förväntade månader`,
            missing.join(", ")
          ]);
        }
      }
    }
  }

  observations.sort((a, b) => a[0].localeCompare(b[0], "sv") || a[1].localeCompare(b[1]));
  return observations;
}

function monthRange(start, end) {
  const months = [];
  let [y, m] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return months;
}

function buildWorkbook(parsed, options) {
  const metadata = parsed.metadata.map((row) => [row.key, row.value, row.lineNumber]);
  metadata.unshift(["Källa", options.sourceFile, ""]);
  metadata.unshift(["Fält", "Värde", "Rad"]);

  const fiscalYears = [
    ["Års-ID", "Startdatum", "Slutdatum", "Rad"],
    ...parsed.fiscalYears.map((row) => [row.yearId, row.startDate, row.endDate, row.lineNumber])
  ];

  const accounts = [
    ["Konto", "Kontonamn", "Rad"],
    ...parsed.accounts.map((row) => [row.account, row.name, row.lineNumber])
  ];

  const balances = [
    ["Typ", "Års-ID", "Konto", "Belopp", "Kvantitet", "Rad"],
    ...parsed.balances.map((row) => [row.type, row.yearId, row.account, row.amount, row.quantity, row.lineNumber])
  ];

  const vouchers = [
    ["Serie", "Verifikationsnummer", "Datum", "Text", "Registrerad", "Signatur", "Rad"],
    ...parsed.vouchers.map((row) => [
      row.series,
      row.voucherNumber,
      row.voucherDate,
      row.text,
      row.registeredAt,
      row.signature,
      row.lineNumber
    ])
  ];

  const transactions = [
    [
      "Transaktions-ID",
      "Typ",
      "Serie",
      "Verifikationsnummer",
      "Verifikationsdatum",
      "Verifikationstext",
      "Konto",
      "Kontonamn",
      "Dimensioner",
      "Belopp",
      "Transaktionsdatum",
      "Text",
      "Kvantitet",
      "Signatur",
      "Rad"
    ],
    ...parsed.transactions.map((row) => [
      row.transactionId,
      row.type,
      row.series,
      row.voucherNumber,
      row.voucherDate,
      row.voucherText,
      row.account,
      row.accountName,
      row.dimensions,
      row.amount,
      row.transactionDate,
      row.text,
      row.quantity,
      row.signature,
      row.lineNumber
    ])
  ];

  const monthlySummary = summarizeMonthly(parsed.transactions);
  const accountSummary = summarizeAccounts(parsed.transactions);
  const qualityRows = [
    ["Kategori", "Konto", "Kontonamn", "Observation", "Detalj"],
    ...(options.observations || [])
  ];
  const warnings = [["Kontrollpunkt"], ...parsed.warnings.map((warning) => [warning])];
  const rawLines = [["Rad", "SIE-rad"], ...parsed.rawLines.map((row) => [row.lineNumber, row.raw])];

  const sheets = [
    ["Datakvalitet", qualityRows],
    ["Company info", metadata],
    ["FiscalYears", fiscalYears],
    ["Accounts", accounts],
    ["Balances", balances],
    ["Vouchers", vouchers],
    ["Transactions", transactions],
    ["MonthlySummary", monthlySummary],
    ["AccountSummary", accountSummary],
    ["Warnings", warnings]
  ];

  if (options.includeRaw) sheets.push(["RawSIE", rawLines]);

  return {
    sheets: options.includeEmpty ? sheets : sheets.filter(([, rows]) => rows.length > 1 || rows[0].length > 0)
  };
}

function summarizeMonthly(transactions) {
  const map = new Map();
  for (const row of transactions) {
    if (row.type !== "TRANS") continue;
    const date = row.transactionDate || row.voucherDate || "";
    const month = date ? date.slice(0, 7) : "Okänd";
    const key = `${month}|${row.account}|${row.accountName}`;
    const current = map.get(key) || {
      month,
      account: row.account,
      accountName: row.accountName,
      debit: 0,
      credit: 0,
      net: 0,
      count: 0
    };
    addAmount(current, row.amount);
    map.set(key, current);
  }
  return [
    ["Månad", "Konto", "Kontonamn", "Debet", "Kredit", "Netto", "Antal transaktioner"],
    ...Array.from(map.values())
      .sort((a, b) => `${a.month}|${a.account}`.localeCompare(`${b.month}|${b.account}`))
      .map((row) => [row.month, row.account, row.accountName, row.debit, row.credit, row.net, row.count])
  ];
}

function summarizeAccounts(transactions) {
  const map = new Map();
  for (const row of transactions) {
    if (row.type !== "TRANS") continue;
    const key = `${row.account}|${row.accountName}`;
    const current = map.get(key) || {
      account: row.account,
      accountName: row.accountName,
      debit: 0,
      credit: 0,
      net: 0,
      count: 0
    };
    addAmount(current, row.amount);
    map.set(key, current);
  }
  return [
    ["Konto", "Kontonamn", "Debet", "Kredit", "Netto", "Antal transaktioner"],
    ...Array.from(map.values())
      .sort((a, b) => a.account.localeCompare(b.account, "sv"))
      .map((row) => [row.account, row.accountName, row.debit, row.credit, row.net, row.count])
  ];
}

function addAmount(target, amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  if (value >= 0) {
    target.debit += value;
  } else {
    target.credit += Math.abs(value);
  }
  target.net += value;
  target.count += 1;
}

function parseAmount(value) {
  if (value === undefined || value === "") return "";
  const normalized = String(value).replace(/\s/g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : "";
}

function normalizeSieDate(value) {
  const raw = String(value || "");
  if (!/^\d{8}$/.test(raw)) return "";
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}

function collectStrings(sheets) {
  const strings = new Map();
  let totalCount = 0;
  for (const [, rows] of sheets) {
    for (const row of rows) {
      for (const cell of row) {
        if (typeof cell === "number" && Number.isFinite(cell)) continue;
        const text = cell === undefined || cell === null ? "" : String(cell);
        if (!strings.has(text)) {
          strings.set(text, strings.size);
        }
        totalCount += 1;
      }
    }
  }
  return { strings, totalCount };
}

async function createXlsx(workbook) {
  const { strings, totalCount } = collectStrings(workbook.sheets);

  const files = new Map();
  files.set("[Content_Types].xml", contentTypesXml(workbook.sheets.length));
  files.set("_rels/.rels", rootRelsXml());
  files.set("xl/workbook.xml", workbookXml(workbook.sheets));
  files.set("xl/_rels/workbook.xml.rels", workbookRelsXml(workbook.sheets.length));
  files.set("xl/styles.xml", stylesXml());
  files.set("xl/sharedStrings.xml", sharedStringsXml(strings, totalCount));

  workbook.sheets.forEach(([, rows], index) => {
    files.set(`xl/worksheets/sheet${index + 1}.xml`, worksheetXml(rows, strings));
  });

  return await zipFiles(files);
}

function contentTypesXml(sheetCount) {
  let overrides = "";
  for (let index = 1; index <= sheetCount; index += 1) {
    overrides += `<Override PartName="/xl/worksheets/sheet${index}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`;
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  ${overrides}
</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function workbookXml(sheets) {
  const sheetXml = sheets
    .map(([name], index) => `<sheet name="${escapeXml(sheetName(name))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetXml}</sheets>
</workbook>`;
}

function workbookRelsXml(sheetCount) {
  let rels = "";
  for (let index = 1; index <= sheetCount; index += 1) {
    rels += `<Relationship Id="rId${index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index}.xml"/>`;
  }
  rels += `<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
  rels += `<Relationship Id="rId${sheetCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function sharedStringsXml(strings, totalCount) {
  const items = [];
  for (const [text] of strings) {
    items.push(`<si><t>${escapeXml(text)}</t></si>`);
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${totalCount}" uniqueCount="${strings.size}">${items.join("")}</sst>`;
}

function worksheetXml(rows, strings) {
  const safeRows = rows.length ? rows : [[""]];
  const maxCols = safeRows.reduce((max, row) => Math.max(max, row.length), 1);
  const dimension = `A1:${columnName(maxCols)}${safeRows.length}`;
  const sheetData = safeRows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, colIndex) => cellXml(value, rowIndex + 1, colIndex + 1, rowIndex === 0, strings))
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${sheetData}</sheetData>
  <autoFilter ref="${dimension}"/>
</worksheet>`;
}

function cellXml(value, row, col, isHeader, strings) {
  const ref = `${columnName(col)}${row}`;
  const style = isHeader ? ' s="1"' : "";
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${ref}"${style}><v>${value}</v></c>`;
  }
  const text = value === undefined || value === null ? "" : String(value);
  const index = strings.get(text);
  return `<c r="${ref}" t="s"${style}><v>${index}</v></c>`;
}

function columnName(index) {
  let name = "";
  let current = index;
  while (current > 0) {
    current -= 1;
    name = String.fromCharCode(65 + (current % 26)) + name;
    current = Math.floor(current / 26);
  }
  return name;
}

async function deflateData(data) {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const stream = new Blob([data]).stream().pipeThrough(new CompressionStream("deflate-raw"));
    const reader = stream.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    let totalLength = 0;
    for (const chunk of chunks) totalLength += chunk.length;
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  } catch {
    return null;
  }
}

async function zipFiles(files) {
  const encoder = new TextEncoder();
  const entries = [];

  for (const [path, content] of files) {
    const nameBytes = encoder.encode(path);
    const raw = typeof content === "string" ? encoder.encode(content) : content;
    const crc = crc32(raw);
    const compressed = await deflateData(raw);
    const useDeflate = compressed !== null && compressed.length < raw.length;
    entries.push({
      nameBytes,
      data: useDeflate ? compressed : raw,
      uncompressedSize: raw.length,
      compressedSize: useDeflate ? compressed.length : raw.length,
      crc,
      method: useDeflate ? 8 : 0
    });
  }

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const localHeader = new Uint8Array(30 + entry.nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, entry.method, true);
    localView.setUint16(10, dosTime(), true);
    localView.setUint16(12, dosDate(), true);
    localView.setUint32(14, entry.crc, true);
    localView.setUint32(18, entry.compressedSize, true);
    localView.setUint32(22, entry.uncompressedSize, true);
    localView.setUint16(26, entry.nameBytes.length, true);
    localHeader.set(entry.nameBytes, 30);
    localParts.push(localHeader, entry.data);

    const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, entry.method, true);
    centralView.setUint16(12, dosTime(), true);
    centralView.setUint16(14, dosDate(), true);
    centralView.setUint32(16, entry.crc, true);
    centralView.setUint32(20, entry.compressedSize, true);
    centralView.setUint32(24, entry.uncompressedSize, true);
    centralView.setUint16(28, entry.nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(entry.nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + entry.data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...localParts, ...centralParts, end], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTime() {
  const now = new Date();
  return (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
}

function dosDate() {
  const now = new Date();
  return ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
}

function sheetName(name) {
  return String(name).replace(/[\\/?*\[\]:]/g, " ").slice(0, 31) || "Sheet";
}

function sanitizeFileName(name) {
  return String(name)
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "sie-analys";
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(value) {
  return escapeXml(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("sv-SE").format(value || 0);
}
