export interface WeeklyRow {
  period: string; start: string; end: string; network: string;
  entity: string; metric: string; value: number; province: string; category: string;
}
// Un solo CSV fisico: la columna periodicidad separa lecturas mensuales y semanales.
export async function fetchWeeklyRows(baseUrl: string): Promise<WeeklyRow[]> {
  const response = await fetch(`${baseUrl}data.csv`);
  if (!response.ok) throw new Error(`data.csv: HTTP ${response.status}`);
  const csv = await response.text();
  const [header, ...lines] = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const cols = header.split(';');
  const get = (fields: string[], key: string) => fields[cols.indexOf(key)] || '';
  return lines.map(line => {
    const f = line.split(';');
    if(get(f,'periodicidad') !== 'semanal') return null;
    return {period:get(f,'periodo_id'),start:get(f,'fecha_inicio'),end:get(f,'fecha_fin'),
      network:get(f,'RRSS') === 'TT' ? 'TIK TOK' : get(f,'RRSS'),entity:get(f,'Gobernador'),
      metric:get(f,'Atributo'),value:Number(get(f,'Valor')),province:get(f,'Provincia'),category:get(f,'tipo')};
  }).filter((r): r is WeeklyRow => r !== null && Boolean(r.period && r.entity && r.metric && Number.isFinite(r.value)));
}
export function weeklyPeriods(rows: WeeklyRow[]): {id:string;name:string}[] {
  const periods = new Map<string,string>();
  rows.forEach(r => {if(!periods.has(r.period)) periods.set(r.period, `${r.start.slice(8,10)}/${r.start.slice(5,7)} al ${r.end.slice(8,10)}/${r.end.slice(5,7)}/${r.end.slice(0,4)}`);});
  return [...periods.entries()].sort((a,b)=>b[0].localeCompare(a[0])).map(([id,name])=>({id,name}));
}
