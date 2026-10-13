import Papa from "papaparse";

export interface DataRow {
  año: number;
  Período: string;
  mes_n: number;
  RRSS: "IG" | "FB" | "TW" | "TIK TOK";
  Gobernador: string;
  Atributo: string;
  Valor: number;
  Provincia: string;
  tipo: "Gobernador" | "Gobierno";
}

export const GOBERNADORES_INFO: Record<string, { provincia: string; region: string; padron: number; image?: string; isGobierno?: boolean }> = {
  "A. Kicillof": { provincia: "Buenos Aires", region: "Centro", padron: 13110768, image: `${import.meta.env.BASE_URL}A. Kicillof.png` },
  "J. Macri": { provincia: "CABA", region: "Centro", padron: 2533092, image: `${import.meta.env.BASE_URL}J. Macri.png` },
  "M. Pullaro": { provincia: "Santa Fe", region: "Centro", padron: 2818280, image: `${import.meta.env.BASE_URL}M. Pullaro.png` },
  "M. Llaryora": { provincia: "Córdoba", region: "Centro", padron: 3065088, image: `${import.meta.env.BASE_URL}M. Llaryora.png` },
  "R. Frigerio": { provincia: "Entre Ríos", region: "Centro", padron: 1143459, image: `${import.meta.env.BASE_URL}R. Frigerio.png` },
  "S. Ziliotto": { provincia: "La Pampa", region: "Centro", padron: 300160, image: `${import.meta.env.BASE_URL}S. Ziliotto.png` },
  "A. Cornejo": { provincia: "Mendoza", region: "Cuyo", padron: 1492379, image: `${import.meta.env.BASE_URL}A. Cornejo.png` },
  "M. Orrego": { provincia: "San Juan", region: "Cuyo", padron: 608920, image: `${import.meta.env.BASE_URL}M. Orrego.png` },
  "C. Poggi": { provincia: "San Luis", region: "Cuyo", padron: 421370, image: `${import.meta.env.BASE_URL}c. Poggi.png` },
  "R. Quintela": { provincia: "La Rioja", region: "NOA", padron: 304456, image: `${import.meta.env.BASE_URL}R. Quintela.png` },
  "R. Jalil": { provincia: "Catamarca", region: "NOA", padron: 340160, image: `${import.meta.env.BASE_URL}R. Jalil.png` },
  "C. Sadir": { provincia: "Jujuy", region: "NOA", padron: 593340, image: `${import.meta.env.BASE_URL}C. Sadir.png` },
  "G. Sáenz": { provincia: "Salta", region: "NOA", padron: 1090057, image: `${import.meta.env.BASE_URL}G. Saenz.png` },
  "E. Suárez": { provincia: "Santiago del Estero", region: "NOA", padron: 814986, image: `${import.meta.env.BASE_URL}E. Suárez.jpg` },
  "O. Jaldo": { provincia: "Tucumán", region: "NOA", padron: 1320478, image: `${import.meta.env.BASE_URL}O. Jaldo.png` },
  "L. Zdero": { provincia: "Chaco", region: "NEA", padron: 1001732, image: `${import.meta.env.BASE_URL}L. Zdero.png` },
  "JP. Valdés": { provincia: "Corrientes", region: "NEA", padron: 933876, image: `${import.meta.env.BASE_URL}JP. Valdés.jpg` },
  "G. Valdés": { provincia: "Corrientes", region: "NEA", padron: 933876, image: `${import.meta.env.BASE_URL}G. Valdés.png` },
  "G. Insfrán": { provincia: "Formosa", region: "NEA", padron: 482602, image: `${import.meta.env.BASE_URL}G. Insfran.png` },
  "H. Passalacqua": { provincia: "Misiones", region: "NEA", padron: 988482, image: `${import.meta.env.BASE_URL}H. Passalacqua.png` },
  "N. Torres": { provincia: "Chubut", region: "Patagonia", padron: 474242, image: `${import.meta.env.BASE_URL}N. Torres.png` },
  "R. Figueroa": { provincia: "Neuquén", region: "Patagonia", padron: 553748, image: `${import.meta.env.BASE_URL}R. Figueroa.png` },
  "A. Weretilneck": { provincia: "Río Negro", region: "Patagonia", padron: 595081, image: `${import.meta.env.BASE_URL}A. weretilneck.png` },
  "C. Vidal": { provincia: "Santa Cruz", region: "Patagonia", padron: 265330, image: `${import.meta.env.BASE_URL}C. Vidal.png` },
  "G. Melella": { provincia: "Tierra del Fuego", region: "Patagonia", padron: 148020, image: `${import.meta.env.BASE_URL}G. Melella.png` },
  "Buenos Aires": { provincia: "Buenos Aires", region: "Centro", padron: 13110768, image: `${import.meta.env.BASE_URL}pba.png`, isGobierno: true },
  "CABA": { provincia: "CABA", region: "Centro", padron: 2533092, image: `${import.meta.env.BASE_URL}CABA.png`, isGobierno: true },
  "Santa Fe": { provincia: "Santa Fe", region: "Centro", padron: 2818280, image: `${import.meta.env.BASE_URL}santa fe.png`, isGobierno: true },
  "Córdoba": { provincia: "Córdoba", region: "Centro", padron: 3065088, image: `${import.meta.env.BASE_URL}cordoba.png`, isGobierno: true },
  "Entre Ríos": { provincia: "Entre Ríos", region: "Centro", padron: 1143459, image: `${import.meta.env.BASE_URL}entre rios.png`, isGobierno: true },
  "La Pampa": { provincia: "La Pampa", region: "Centro", padron: 300160, image: `${import.meta.env.BASE_URL}la pampa.png`, isGobierno: true },
  "Mendoza": { provincia: "Mendoza", region: "Cuyo", padron: 1492379, image: `${import.meta.env.BASE_URL}mendoza.png`, isGobierno: true },
  "San Juan": { provincia: "San Juan", region: "Cuyo", padron: 608920, image: `${import.meta.env.BASE_URL}san juan.png`, isGobierno: true },
  "San Luis": { provincia: "San Luis", region: "Cuyo", padron: 421370, image: `${import.meta.env.BASE_URL}san luis.png`, isGobierno: true },
  "La Rioja": { provincia: "La Rioja", region: "NOA", padron: 304456, image: `${import.meta.env.BASE_URL}la rioja.png`, isGobierno: true },
  "Catamarca": { provincia: "Catamarca", region: "NOA", padron: 340160, image: `${import.meta.env.BASE_URL}catamarca.png`, isGobierno: true },
  "Jujuy": { provincia: "Jujuy", region: "NOA", padron: 593340, image: `${import.meta.env.BASE_URL}jujuy.png`, isGobierno: true },
  "Salta": { provincia: "Salta", region: "NOA", padron: 1090057, image: `${import.meta.env.BASE_URL}salta.png`, isGobierno: true },
  "Santiago del Estero": { provincia: "Santiago del Estero", region: "NOA", padron: 814986, image: `${import.meta.env.BASE_URL}santiago del estero.png`, isGobierno: true },
  "Tucumán": { provincia: "Tucumán", region: "NOA", padron: 1320478, image: `${import.meta.env.BASE_URL}tucuman.png`, isGobierno: true },
  "Chaco": { provincia: "Chaco", region: "NEA", padron: 1001732, image: `${import.meta.env.BASE_URL}chaco.png`, isGobierno: true },
  "Corrientes": { provincia: "Corrientes", region: "NEA", padron: 933876, image: `${import.meta.env.BASE_URL}corrientes.png`, isGobierno: true },
  "Formosa": { provincia: "Formosa", region: "NEA", padron: 482602, image: `${import.meta.env.BASE_URL}formosa.png`, isGobierno: true },
  "Misiones": { provincia: "Misiones", region: "NEA", padron: 988482, image: `${import.meta.env.BASE_URL}misiones.png`, isGobierno: true },
  "Chubut": { provincia: "Chubut", region: "Patagonia", padron: 474242, image: `${import.meta.env.BASE_URL}chubut.png`, isGobierno: true },
  "Neuquén": { provincia: "Neuquén", region: "Patagonia", padron: 553748, image: `${import.meta.env.BASE_URL}neuquen.png`, isGobierno: true },
  "Río Negro": { provincia: "Río Negro", region: "Patagonia", padron: 595081, image: `${import.meta.env.BASE_URL}rio negro.png`, isGobierno: true },
  "Santa Cruz": { provincia: "Santa Cruz", region: "Patagonia", padron: 265330, image: `${import.meta.env.BASE_URL}santa cruz.png`, isGobierno: true },
  "Tierra del Fuego": { provincia: "Tierra del Fuego", region: "Patagonia", padron: 148020, image: `${import.meta.env.BASE_URL}tierra del fuego.png`, isGobierno: true },
};

// Parchear imágenes con Base64 precargadas en window.__IMAGE_ASSETS__ si estamos en modo autónomo
if (typeof window !== "undefined") {
  const patchImages = () => {
    const assets = (window as any).__IMAGE_ASSETS__;
    if (assets) {
      Object.keys(GOBERNADORES_INFO).forEach((k) => {
        const curImg = GOBERNADORES_INFO[k].image;
        if (curImg) {
          const rawName = curImg.replace(/^\.?\//, "");
          if (assets[rawName]) {
            GOBERNADORES_INFO[k].image = assets[rawName];
          }
        }
      });
    }
  };
  patchImages();
}

export function getGovImage(name: string): string {
  if (typeof window !== "undefined" && (window as any).__IMAGE_ASSETS__) {
    const assets = (window as any).__IMAGE_ASSETS__;
    if (assets[name]) return assets[name];
    if (assets[`${name}.png`]) return assets[`${name}.png`];
    if (assets[`${name}.jpg`]) return assets[`${name}.jpg`];
  }
  const info = GOBERNADORES_INFO[name];
  if (!info) return "";
  return info.image || "";
}

export async function fetchAndParseData(csvText: string): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: ";", // Explicitly define the delimiter
      complete: (results) => {
        const rows: DataRow[] = (results.data as any[])
          .filter(row => row.Gobernador && row.Atributo) // Filter out incomplete rows
          .map((row) => ({
            año: parseInt(row.año, 10),
            Período: row.Período || row.Periodo,
            mes_n: parseInt(row.mes_n, 10),
            RRSS: (row.RRSS === "TT" ? "TIK TOK" : row.RRSS) as any,
            Gobernador: String(row.Gobernador).trim(),
            Atributo: String(row.Atributo).trim(),
            Valor: parseFloat(row.Valor) || 0,
            Provincia: String(row.Provincia || "").trim(),
            tipo: (row.tipo || row.Tipo || "Gobernador") as "Gobernador" | "Gobierno",
          }))
          .filter(row => row.Atributo !== "Fans en miles" && row.Atributo !== "reacciones c/ fans en miles");
        resolve(rows);
      },
      error: (error: any) => reject(error),
    });
  });
}
