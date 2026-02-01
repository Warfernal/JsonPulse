import * as ExcelJS from 'exceljs';

// Couleurs du rapport
const COLORS = {
  primary: 'FF1F4E79',      // bleu foncé
  primaryLight: 'FFD6E4F0',  // bleu clair
  headerBg: 'FF1F4E79',
  headerText: 'FFFFFFFF',
  sectionBg: 'FFD6E4F0',
  sectionText: 'FF1F4E79',
  text: 'FF2D2D2D',
  textDim: 'FF6B7280',
  border: 'FFD1D5DB',
  zebraLight: 'FFF9FAFB',
  zebraDark: 'FFFFFFFF',
  null: 'FF9CA3AF',
};

const THIN_BORDER = {
  top: { style: 'thin', color: { argb: COLORS.border } },
  bottom: { style: 'thin', color: { argb: COLORS.border } },
  left: { style: 'thin', color: { argb: COLORS.border } },
  right: { style: 'thin', color: { argb: COLORS.border } },
};

/**
 * Aplatit un objet imbriqué en clés pointées.
 * { address: { city: "Paris" } } => { "address.city": "Paris" }
 * Les tableaux ne sont pas aplatis (traités séparément).
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, path));
    } else if (!Array.isArray(value)) {
      result[path] = value;
    }
  }
  return result;
}

/**
 * Collecte les sous-tableaux d'un objet pour les traiter séparément.
 */
function collectSubArrays(obj, prefix = '') {
  const arrays = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      arrays.push({ path, data: value });
    } else if (value !== null && typeof value === 'object') {
      arrays.push(...collectSubArrays(value, path));
    }
  }
  return arrays;
}

/**
 * Formate un chemin JSON en titre lisible: "users > 0 > address"
 */
function formatPath(path) {
  return path
    .replace(/^root\.?/, '')
    .replace(/\./g, ' > ')
    .replace(/\[(\d+)\]/g, ' > $1') || 'Racine';
}

/**
 * Applique le style de cellule de valeur selon le type
 */
function styleValueCell(cell, value, rowIndex) {
  cell.fill = {
    type: 'pattern', pattern: 'solid',
    fgColor: { argb: rowIndex % 2 === 0 ? COLORS.zebraDark : COLORS.zebraLight },
  };
  cell.border = THIN_BORDER;
  cell.alignment = { vertical: 'middle', wrapText: true };

  if (value === null || value === undefined) {
    cell.value = '(vide)';
    cell.font = { italic: true, color: { argb: COLORS.null }, size: 10 };
  } else if (typeof value === 'boolean') {
    cell.value = value ? 'Oui' : 'Non';
    cell.font = { color: { argb: COLORS.text }, size: 10 };
  } else if (typeof value === 'number') {
    cell.value = value;
    cell.font = { color: { argb: COLORS.text }, size: 10 };
    cell.numFmt = Number.isInteger(value) ? '#,##0' : '#,##0.00';
  } else {
    cell.value = String(value);
    cell.font = { color: { argb: COLORS.text }, size: 10 };
  }
}

export async function exportToExcel(jsonData, filename = 'export.xlsx') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'JSON to Excel Converter';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('Rapport', {
    properties: { defaultColWidth: 18 },
    pageSetup: { orientation: 'landscape', fitToPage: true },
  });

  let row = 1;

  // --- En-tête du rapport ---
  const titleCell = ws.getCell(row, 1);
  titleCell.value = 'Rapport de donnees JSON';
  titleCell.font = { bold: true, size: 18, color: { argb: COLORS.primary } };
  ws.mergeCells(row, 1, row, 6);
  row++;

  const dateCell = ws.getCell(row, 1);
  const now = new Date();
  dateCell.value = `Genere le ${now.toLocaleDateString('fr-FR')} a ${now.toLocaleTimeString('fr-FR')}`;
  dateCell.font = { size: 10, color: { argb: COLORS.textDim } };
  ws.mergeCells(row, 1, row, 6);
  row++;

  // Ligne de séparation
  for (let c = 1; c <= 6; c++) {
    ws.getCell(row, c).border = { bottom: { style: 'medium', color: { argb: COLORS.primary } } };
  }
  row += 2;

  // --- Traitement du JSON ---
  row = processLevel(ws, jsonData, 'root', row);

  // --- Ajustement colonnes ---
  ws.columns.forEach((col) => {
    let maxLen = 10;
    if (col.values) {
      col.values.forEach((v) => {
        const len = v ? String(v).length : 0;
        if (len > maxLen) maxLen = len;
      });
    }
    col.width = Math.min(Math.max(maxLen + 4, 14), 55);
  });

  // --- Téléchargement ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, filename);
  return true;
}

function processLevel(ws, data, path, startRow) {
  let row = startRow;

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
    row = writeTableSection(ws, data, path, row);

    // Sous-tableaux de chaque élément
    data.forEach((item, idx) => {
      if (typeof item === 'object' && item !== null) {
        const subArrays = collectSubArrays(item);
        for (const sub of subArrays) {
          row++;
          row = processLevel(ws, sub.data, `${path}[${idx}].${sub.path}`, row);
        }
      }
    });
  } else if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    row = writeObjectSection(ws, data, path, row);

    // Sous-objets et sous-tableaux
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        row++;
        row = processLevel(ws, value, `${path}.${key}`, row);
      } else if (typeof value === 'object' && value !== null) {
        row++;
        row = processLevel(ws, value, `${path}.${key}`, row);
      }
    }
  } else if (Array.isArray(data)) {
    row = writePrimitiveArray(ws, data, path, row);
  }

  return row;
}

/**
 * Section titre
 */
function writeSectionTitle(ws, title, row, colSpan) {
  const cell = ws.getCell(row, 1);
  cell.value = title;
  cell.font = { bold: true, size: 12, color: { argb: COLORS.sectionText } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
  cell.alignment = { vertical: 'middle' };
  cell.border = THIN_BORDER;
  if (colSpan > 1) {
    ws.mergeCells(row, 1, row, colSpan);
    for (let c = 2; c <= colSpan; c++) {
      const mc = ws.getCell(row, c);
      mc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.sectionBg } };
      mc.border = THIN_BORDER;
    }
  }
  return row + 1;
}

/**
 * Tableau d'objets — aplatit les sous-objets en colonnes pointées
 */
function writeTableSection(ws, array, path, startRow) {
  // Aplatir chaque élément
  const flatRows = array.map((item) => flattenObject(item));

  // Collecter toutes les clés
  const keySet = new Set();
  flatRows.forEach((r) => Object.keys(r).forEach((k) => keySet.add(k)));
  const keys = Array.from(keySet);

  if (keys.length === 0) return startRow;

  const colSpan = keys.length;
  let row = writeSectionTitle(ws, formatPath(path), startRow, colSpan);

  // En-têtes de colonnes
  keys.forEach((key, i) => {
    const cell = ws.getCell(row, i + 1);
    cell.value = key;
    cell.font = { bold: true, size: 10, color: { argb: COLORS.headerText } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
    cell.border = THIN_BORDER;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  row++;

  // Lignes de données
  flatRows.forEach((flatObj, rowIdx) => {
    keys.forEach((key, colIdx) => {
      const cell = ws.getCell(row, colIdx + 1);
      styleValueCell(cell, flatObj[key], rowIdx);
    });
    row++;
  });

  return row;
}

/**
 * Objet simple — format Champ / Valeur (uniquement primitives)
 */
function writeObjectSection(ws, obj, path, startRow) {
  // Filtrer seulement les primitives
  const primitiveEntries = Object.entries(obj).filter(
    ([, v]) => v === null || typeof v !== 'object'
  );

  if (primitiveEntries.length === 0) return startRow;

  let row = writeSectionTitle(ws, formatPath(path), startRow, 2);

  // En-têtes
  const hChamp = ws.getCell(row, 1);
  hChamp.value = 'Champ';
  hChamp.font = { bold: true, size: 10, color: { argb: COLORS.headerText } };
  hChamp.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  hChamp.border = THIN_BORDER;
  hChamp.alignment = { vertical: 'middle', horizontal: 'center' };

  const hValeur = ws.getCell(row, 2);
  hValeur.value = 'Valeur';
  hValeur.font = { bold: true, size: 10, color: { argb: COLORS.headerText } };
  hValeur.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  hValeur.border = THIN_BORDER;
  hValeur.alignment = { vertical: 'middle', horizontal: 'center' };
  row++;

  // Données
  primitiveEntries.forEach(([key, value], idx) => {
    const keyCell = ws.getCell(row, 1);
    keyCell.value = key;
    keyCell.font = { bold: true, color: { argb: COLORS.text }, size: 10 };
    keyCell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: idx % 2 === 0 ? COLORS.zebraDark : COLORS.zebraLight },
    };
    keyCell.border = THIN_BORDER;
    keyCell.alignment = { vertical: 'middle' };

    const valCell = ws.getCell(row, 2);
    styleValueCell(valCell, value, idx);
    row++;
  });

  return row;
}

/**
 * Tableau de primitives
 */
function writePrimitiveArray(ws, array, path, startRow) {
  let row = writeSectionTitle(ws, formatPath(path), startRow, 2);

  // En-têtes
  const hIdx = ws.getCell(row, 1);
  hIdx.value = '#';
  hIdx.font = { bold: true, size: 10, color: { argb: COLORS.headerText } };
  hIdx.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  hIdx.border = THIN_BORDER;
  hIdx.alignment = { horizontal: 'center' };

  const hVal = ws.getCell(row, 2);
  hVal.value = 'Valeur';
  hVal.font = { bold: true, size: 10, color: { argb: COLORS.headerText } };
  hVal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } };
  hVal.border = THIN_BORDER;
  hVal.alignment = { horizontal: 'center' };
  row++;

  array.forEach((value, idx) => {
    const idxCell = ws.getCell(row, 1);
    idxCell.value = idx + 1;
    idxCell.font = { color: { argb: COLORS.textDim }, size: 10 };
    idxCell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: idx % 2 === 0 ? COLORS.zebraDark : COLORS.zebraLight },
    };
    idxCell.border = THIN_BORDER;
    idxCell.alignment = { horizontal: 'center' };

    const valCell = ws.getCell(row, 2);
    styleValueCell(valCell, value, idx);
    row++;
  });

  return row;
}

/**
 * Parse JSON avec gestion d'erreur
 */
export function parseJSON(str) {
  try {
    return { success: true, data: JSON.parse(str), error: null };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}
