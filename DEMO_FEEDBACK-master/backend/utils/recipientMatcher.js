const XLSX = require('xlsx');

function normalizeName(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Extract candidate names from raw text (PDF or pasted). */
function extractNamesFromText(text) {
  const names = new Set();
  const lines = String(text || '').split(/\r?\n/);

  for (const line of lines) {
    const cleaned = line.replace(/^\d+[\.\)\-\s]*/, '').trim();
    if (!cleaned || cleaned.length < 2) continue;
    if (/^(name|student|roll|sr|no|semester|sem|email|s\.?\s*no)/i.test(cleaned)) continue;
    if (/^[\d\s\-.,]+$/.test(cleaned)) continue;
    if (cleaned.length > 80) continue;
    names.add(cleaned);
  }

  return Array.from(names);
}

function extractNamesFromExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const names = new Set();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    for (const row of rows) {
      if (!Array.isArray(row)) continue;
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        if (cell == null || cell === '') continue;
        const str = String(cell).trim();
        if (!str || str.length < 2) continue;
        if (/^(name|student|roll|sr|no|semester|sem|email)/i.test(str)) continue;
        if (/^[\d\s\-.,]+$/.test(str) && str.length < 4) continue;
        if (str.length > 80) continue;
        names.add(str);
      }
    }
  }

  return Array.from(names);
}

function namesMatch(fileName, dbName, dbUsername) {
  const a = normalizeName(fileName);
  const b = normalizeName(dbName);
  const u = normalizeName(dbUsername);
  if (!a) return false;
  if (a === b || a === u) return true;
  if (b && (b.includes(a) || a.includes(b))) return true;
  if (u && (u.includes(a) || a.includes(u))) return true;
  const tokens = a.split(' ').filter((t) => t.length > 1);
  if (tokens.length >= 2 && b && tokens.every((t) => b.includes(t))) return true;
  return false;
}

/**
 * Match parsed file names to students in DB, optionally filtered by semester(s).
 */
function matchNamesToStudents(parsedNames, students) {
  const matched = [];
  const unmatched = [];
  const usedIds = new Set();

  for (const rawName of parsedNames) {
    const hit = students.find(
      (s) =>
        !usedIds.has(s._id.toString()) &&
        namesMatch(rawName, s.full_name, s.username)
    );

    if (hit) {
      usedIds.add(hit._id.toString());
      matched.push({
        id: hit._id.toString(),
        fullName: hit.full_name,
        email: hit.email,
        semester: hit.semester,
        matchedFrom: rawName
      });
    } else {
      unmatched.push(rawName);
    }
  }

  return { matched, unmatched, parsedCount: parsedNames.length };
}

async function parseRecipientFile(buffer, mimetype, originalname) {
  const lower = (originalname || '').toLowerCase();
  const isPdf =
    mimetype === 'application/pdf' || lower.endsWith('.pdf');
  const isExcel =
    mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimetype === 'application/vnd.ms-excel' ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xls') ||
    lower.endsWith('.csv');

  if (isPdf) {
    let pdfParse;
    try {
      pdfParse = require('pdf-parse');
    } catch {
      throw new Error('PDF support is not installed on the server. Run: npm install pdf-parse');
    }
    const data = await pdfParse(buffer);
    return extractNamesFromText(data.text);
  }

  if (isExcel || lower.endsWith('.csv')) {
    return extractNamesFromExcel(buffer);
  }

  throw new Error('Unsupported file type. Upload Excel (.xlsx, .xls, .csv) or PDF.');
}

module.exports = {
  normalizeName,
  extractNamesFromText,
  extractNamesFromExcel,
  namesMatch,
  matchNamesToStudents,
  parseRecipientFile
};
