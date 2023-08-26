export function readCSVFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fileReader = new FileReader();

    fileReader.onload = (ev) => {
      const text = ev.target?.result as string;
      res(text);
    };

    fileReader.onerror = (ev) => {
      rej(ev.target?.error);
    };

    fileReader.readAsText(file);
  });
}

export function parseCSV(text: string, sep = ",") {
  const rows = text
    .split("\n")
    .map((i) => i.split(sep).map((i) => i.trim().replaceAll('"', "")));
  const header = rows[0];

  return rows.slice(1).map((row) => {
    const out: any = {};
    header.forEach((i, j) => (out[i] = row[j]));
    return out;
  });
}
