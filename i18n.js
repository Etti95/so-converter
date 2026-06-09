"use strict";

const translations = {
  en: {
    "meta.title": "Free SIE to Excel | SIE Converter | R DataBlocks",
    "meta.desc": "Convert Swedish SIE files to analysis-ready Excel workbooks for free. Local conversion with automatic balance validation and data quality analysis. A tool by R DataBlocks.",

    "nav.convert": "Convert",
    "nav.forWhom": "For whom",
    "nav.format": "Format",

    "hero.eyebrow": "Built for controllers, auditors, and CFO teams",
    "hero.title": "SIE to analysis-ready Excel in seconds",
    "hero.desc": 'Upload a <strong>.se</strong> or <strong>.sie</strong> file and get a structured <strong>.xlsx</strong> with vouchers, transactions, chart of accounts, and automatic balance validation. Your data never leaves the browser.',
    "hero.cta": "Convert now",
    "hero.secondary": "How it works",

    "trust.local.title": "Local & private",
    "trust.local.desc": "All conversion happens in your browser. No data is sent to a server.",
    "trust.format.title": "Analysis-ready format",
    "trust.format.desc": "Separate sheets for transactions, summaries, balance rows, and metadata.",
    "trust.quality.title": "Data quality analysis",
    "trust.quality.desc": "Correction frequency, inactive periods, and balance validation. Anomalies are flagged automatically.",

    "conv.eyebrow": "Converter",
    "conv.title": "Upload SIE and create workbook",
    "conv.desc": "The file is processed entirely in your browser. Nothing is uploaded.",
    "conv.dropTitle": "Select or drag a SIE file",
    "conv.dropHint": ".se, .sie, or text file exported from accounting software",
    "conv.fileName": "File name",
    "conv.periodFilter": "Period filter",
    "conv.periodAll": "All transactions",
    "conv.periodCurrent": "Latest fiscal year in the file",
    "conv.includeRaw": "Include raw SIE lines",
    "conv.includeEmpty": "Keep empty analysis sheets",
    "conv.submit": "Create .xlsx",
    "conv.clear": "Clear",
    "conv.creating": "Creating…",

    "result.readyTitle": "Ready for file",
    "result.readyDesc": "Summary will appear once a SIE file is loaded.",
    "result.vouchers": "Vouchers",
    "result.transactions": "Transactions",
    "result.accounts": "Accounts",
    "result.observations": "Observations",
    "result.download": "Download workbook",
    "result.warnings": "Checkpoints",

    "status.fileSelected": "File selected. Create workbook when ready.",
    "status.reading": "Reading file",
    "status.readingDesc": "Parsing SIE lines and creating workbook.",
    "status.created": "Workbook created",
    "status.createdDesc": "{count} transactions ready for download.",
    "status.noFile": "No file selected",
    "status.noFileDesc": "Select a .se or .sie file first.",
    "status.error": "Conversion stopped",
    "status.unknownError": "Unknown error.",
    "status.downloadNote": "{size} bytes created locally in the browser.",
    "status.moreWarnings": "{count} additional checkpoints in the Warnings sheet.",

    "nudge.default": "Do your numbers in Stripe, CRM, and accounting match? →",
    "nudge.withObs": 'We found <strong>{count} {word}</strong> in your accounting data. Want to go deeper? →',
    "nudge.observation": "observation",
    "nudge.observations": "observations",

    "uc.eyebrow": "Target audience",
    "uc.title": "Built for those who analyze, not those who book",
    "uc.desc": "SIE Converter targets decision-makers who receive SIE files but work in Excel.",
    "uc.controllers.title": "Controllers",
    "uc.controllers.desc": "Consolidate SIE data from subsidiaries and external firms into your own Excel models.",
    "uc.auditors.title": "Auditors",
    "uc.auditors.desc": "Convert client SIE exports to audit-ready format with automatic balance validation.",
    "uc.cfo.title": "CFO & board",
    "uc.cfo.desc": "Create financial overviews and board materials directly from accounting system output.",
    "uc.ma.title": "M&A advisors",
    "uc.ma.desc": "Quick due diligence. Analyze transaction history without access to the target company's systems.",

    "details.eyebrow": "Workbook format",
    "details.title": "Sheets included",
    "sheet.metadata.title": "Metadata",
    "sheet.metadata.desc": "Company name, organization number, program, format, and fiscal year.",
    "sheet.quality.title": "Data quality",
    "sheet.quality.desc": "Correction frequency per account and inactive periods. Flags patterns that may indicate reconciliation issues.",
    "sheet.accounts.title": "Chart of accounts",
    "sheet.accounts.desc": "All #KONTO lines with account number and account name.",
    "sheet.vouchers.title": "Vouchers",
    "sheet.vouchers.desc": "Series, voucher number, date, text, and registration information.",
    "sheet.transactions.title": "Transactions",
    "sheet.transactions.desc": "Row-level with account, amount, dimensions, date, and voucher.",
    "sheet.monthly.title": "Monthly summary",
    "sheet.monthly.desc": "Amounts summarized by month and account.",
    "sheet.accountSum.title": "Account summary",
    "sheet.accountSum.desc": "Debit, credit, net amount, and transaction count per account.",

    "bridge.eyebrow": "From R DataBlocks",
    "bridge.title": "Your books are clean. Does the rest add up?",
    "bridge.desc": "Most growing companies have numbers in their books, Stripe, CRM, and BI dashboards that don't match. Revenue Trust Layer identifies discrepancies before they become costly, or before AI automation amplifies them.",
    "bridge.cta": "Book a Revenue Trust Audit",
    "bridge.secondary": "Learn more",
    "bridge.diag.title": "Diagnosis in 10 days",
    "bridge.diag.desc": "We map discrepancies between your systems and deliver a Revenue Trust Score.",
    "bridge.recon.title": "Reconciliation dashboards",
    "bridge.recon.desc": "Real-time overview showing where numbers diverge. Stripe vs. books, CRM vs. invoicing.",
    "bridge.ai.title": "AI-ready data",
    "bridge.ai.desc": "Secure data quality before you automate. AI amplifies existing problems, it doesn't solve them.",

    "footer.tools": 'Free SIE tool &middot; <a href="https://trust.rdatablocks.com/">Revenue Trust Layer</a>'
  },

  sv: {
    "meta.title": "Gratis SIE till Excel | SIE-konverterare | R DataBlocks",
    "meta.desc": "Konvertera svenska SIE-filer till analysklara Excel-arbetsböcker gratis. Lokal konvertering med automatisk balansvalidering och datakvalitetsanalys. Ett verktyg från R DataBlocks.",

    "nav.convert": "Konvertera",
    "nav.forWhom": "För vem",
    "nav.format": "Format",

    "hero.eyebrow": "Byggt för controllers, revisorer och CFO-team",
    "hero.title": "SIE till analysklart Excel på sekunder",
    "hero.desc": 'Ladda upp en <strong>.se</strong> eller <strong>.sie</strong>-fil och få en strukturerad <strong>.xlsx</strong> med verifikationer, transaktioner, kontoplan och automatisk balansvalidering. Din data lämnar aldrig webbläsaren.',
    "hero.cta": "Konvertera nu",
    "hero.secondary": "Så fungerar det",

    "trust.local.title": "Lokal & privat",
    "trust.local.desc": "All konvertering sker i din webbläsare. Ingen data skickas till en server.",
    "trust.format.title": "Analysredo format",
    "trust.format.desc": "Separata ark för transaktioner, sammanfattningar, balansrader och metadata.",
    "trust.quality.title": "Datakvalitetsanalys",
    "trust.quality.desc": "Korrigeringsfrekvens, inaktiva perioder och balansvalidering. Avvikelser flaggas direkt.",

    "conv.eyebrow": "Konverterare",
    "conv.title": "Ladda upp SIE och skapa arbetsbok",
    "conv.desc": "Filen behandlas helt i webbläsaren. Inget laddas upp.",
    "conv.dropTitle": "Välj eller dra in en SIE-fil",
    "conv.dropHint": ".se, .sie eller textfil exporterad från bokföringssystem",
    "conv.fileName": "Filnamn",
    "conv.periodFilter": "Periodfilter",
    "conv.periodAll": "Alla transaktioner",
    "conv.periodCurrent": "Senaste räkenskapsåret i filen",
    "conv.includeRaw": "Inkludera råa SIE-rader",
    "conv.includeEmpty": "Behåll tomma analysark",
    "conv.submit": "Skapa .xlsx",
    "conv.clear": "Rensa",
    "conv.creating": "Skapar…",

    "result.readyTitle": "Redo för fil",
    "result.readyDesc": "Sammanfattning visas när en SIE-fil har lästs in.",
    "result.vouchers": "Verifikationer",
    "result.transactions": "Transaktioner",
    "result.accounts": "Konton",
    "result.observations": "Observationer",
    "result.download": "Ladda ner arbetsbok",
    "result.warnings": "Kontrollpunkter",

    "status.fileSelected": "Filen är vald. Skapa arbetsbok när du är redo.",
    "status.reading": "Läser fil",
    "status.readingDesc": "Tolkar SIE-rader och skapar arbetsbok.",
    "status.created": "Arbetsbok skapad",
    "status.createdDesc": "{count} transaktioner redo för nedladdning.",
    "status.noFile": "Ingen fil vald",
    "status.noFileDesc": "Välj en .se eller .sie-fil först.",
    "status.error": "Konverteringen stoppade",
    "status.unknownError": "Okänt fel.",
    "status.downloadNote": "{size} byte skapade lokalt i webbläsaren.",
    "status.moreWarnings": "{count} ytterligare kontrollpunkter finns i arket Warnings.",

    "nudge.default": "Stämmer era siffror i Stripe, CRM och bokföring överens? →",
    "nudge.withObs": 'Vi hittade <strong>{count} {word}</strong> i er bokföringsdata. Vill ni gå djupare? →',
    "nudge.observation": "observation",
    "nudge.observations": "observationer",

    "uc.eyebrow": "Målgrupp",
    "uc.title": "Byggt för de som analyserar, inte bokför",
    "uc.desc": "SIE Converter riktar sig till beslutsfattare som tar emot SIE-filer men arbetar i Excel.",
    "uc.controllers.title": "Controllers",
    "uc.controllers.desc": "Konsolidera SIE-data från dotterbolag och externa byråer i egna Excel-modeller.",
    "uc.auditors.title": "Revisorer",
    "uc.auditors.desc": "Omvandla klienters SIE-exporter till granskningsbart format med automatisk balansvalidering.",
    "uc.cfo.title": "CFO & styrelse",
    "uc.cfo.desc": "Skapa finansiella översikter och styrelseunderlag direkt från bokföringssystemets utdata.",
    "uc.ma.title": "M&A-rådgivare",
    "uc.ma.desc": "Snabb due diligence. Analysera transaktionshistorik utan tillgång till målbolagets system.",

    "details.eyebrow": "Arbetsbokformat",
    "details.title": "Arken som skapas",
    "sheet.metadata.title": "Metadata",
    "sheet.metadata.desc": "Företagsnamn, organisationsnummer, program, format och räkenskapsår.",
    "sheet.quality.title": "Datakvalitet",
    "sheet.quality.desc": "Korrigeringsfrekvens per konto och inaktiva perioder. Flaggar mönster som kan tyda på avstämningsproblem.",
    "sheet.accounts.title": "Kontoplan",
    "sheet.accounts.desc": "Alla #KONTO-rader med kontonummer och kontonamn.",
    "sheet.vouchers.title": "Verifikationer",
    "sheet.vouchers.desc": "Serie, verifikationsnummer, datum, text och registreringsinformation.",
    "sheet.transactions.title": "Transaktioner",
    "sheet.transactions.desc": "Radnivå med konto, belopp, dimensioner, datum och verifikation.",
    "sheet.monthly.title": "Månadssummering",
    "sheet.monthly.desc": "Belopp summerade per månad och konto.",
    "sheet.accountSum.title": "Kontosummering",
    "sheet.accountSum.desc": "Debet, kredit, nettobelopp och transaktionsantal per konto.",

    "bridge.eyebrow": "Från R DataBlocks",
    "bridge.title": "Din bokföring är ren. Stämmer resten?",
    "bridge.desc": "De flesta växande bolag har siffror i bokföringen, Stripe, CRM och BI-dashboards som inte stämmer överens. Revenue Trust Layer identifierar avvikelserna innan de blir dyra, eller innan AI-automatisering förstärker dem.",
    "bridge.cta": "Boka en Revenue Trust Audit",
    "bridge.secondary": "Läs mer",
    "bridge.diag.title": "Diagnos på 10 dagar",
    "bridge.diag.desc": "Vi kartlägger avvikelser mellan era system och levererar en Revenue Trust Score.",
    "bridge.recon.title": "Reconciliation-dashboards",
    "bridge.recon.desc": "Realtidsöversikt som visar var siffrorna går isär. Stripe mot bokföring, CRM mot fakturering.",
    "bridge.ai.title": "AI-redo data",
    "bridge.ai.desc": "Säkra datakvaliteten innan ni automatiserar. AI förstärker befintliga problem, den löser dem inte.",

    "footer.tools": 'Gratis SIE-verktyg &middot; <a href="https://trust.rdatablocks.com/">Revenue Trust Layer</a>'
  }
};

let currentLang = localStorage.getItem("lang") || "en";

function t(key) {
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  document.title = t("meta.title");
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = t("meta.desc");

  const toggle = document.querySelector("#lang-toggle");
  if (toggle) toggle.textContent = lang === "en" ? "EN" : "SV";
}

applyLanguage(currentLang);

document.querySelector("#lang-toggle")?.addEventListener("click", () => {
  applyLanguage(currentLang === "en" ? "sv" : "en");
});
