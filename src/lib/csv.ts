export const FLIGHT_CSV_HEADERS = [
  "id",
  "date",
  "duration_min",
  "game",
  "aircraft",
  "squadron",
  "squadron_tag",
  "pilot",
  "callsign",
  "pilot_status",
  "mission_type",
  "mission_name",
  "outcome",
  "notes",
  "kills_air",
  "kills_naval",
  "kills_ground",
  "kills_building",
] as const;

export type FlightCsvRow = Record<(typeof FLIGHT_CSV_HEADERS)[number], string>;

export function csvEscape(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(rows: Array<Array<string | number | null | undefined>>): string {
  return rows.map((row) => row.map(csvEscape).join(",")).join("\r\n");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((item) => item.some((value) => value.trim() !== ""));
}

export function rowsToFlightCsv(records: string[][]): FlightCsvRow[] {
  const [header = [], ...body] = records;
  const indexByHeader = new Map(
    header.map((name, index) => [name.trim(), index]),
  );

  return body.map((values, rowIndex) => {
    const row = {} as FlightCsvRow;
    for (const key of FLIGHT_CSV_HEADERS) {
      const index = indexByHeader.get(key);
      row[key] = index == null ? "" : (values[index] ?? "").trim();
    }
    if (!row.date || !row.pilot || !row.squadron || !row.aircraft || !row.game) {
      throw new Error(`Ligne ${rowIndex + 2} incomplète (date, pilote, escadrille, appareil, simulateur requis)`);
    }
    return row;
  });
}
