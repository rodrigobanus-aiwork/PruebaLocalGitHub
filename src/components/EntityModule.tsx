/**
 * PROSUMIA - NUEVAS ENTIDADES / ETAPA 1: RANKING.
 * No modifica ni reutiliza indebidamente la ruta de datos de Gobernadores.
 * Fuente: public/mega_metricas.csv (LONG, separador punto y coma).
 * Selector: cada entidad con un circulo y nombre, aun cuando no exista fotografia.
 * TT y TK permanecen separados hasta confirmar equivalencia con el propietario.
 * Ausencia de una medicion NO equivale a cero; Fans es un stock mensual.
 * Alcance de esta etapa: ranking y seleccion funcional. El resto de vistas
 * permanece explicitamente pendiente, no se presentan prototipos como terminados.
 */
import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Users, FileText, Heart, MessageCircle, Activity } from 'lucide-react';

export type Universe = 'dirigentes' | 'medios' | 'comparador';
type Entry = {
  year: number; month: number; network: string; entity: string;
  metric: string; value: number; province: string; category: string;
};
type Metric = { key: string; label: string; subtitle: string; icon: React.ComponentType<{className?:string}> };
const METRICS: Metric[] = [
  {key:'Fans',label:'Seguidores',subtitle:'Valores absolutos',icon:Users},
  {key:'Publicaciones',label:'Publicaciones',subtitle:'Volumen mensual de posts',icon:FileText},
  {key:'Reacciones',label:'Reacciones',subtitle:'Total mensual de reacciones',icon:Heart},
  {key:'Interacciones',label:'Interacciones',subtitle:'Total mensual de interacciones',icon:Activity},
  {key:'Comentarios',label:'Comentarios',subtitle:'Total mensual de comentarios',icon:MessageCircle},
];
const fmt = (n:number) => new Intl.NumberFormat('es-AR',{maximumFractionDigits:1}).format(n);
const periodId = (r:Entry) => `${r.year}-${String(r.month).padStart(2,'0')}`;
const keyOf = (r:Entry) => `${r.category}\u001f${r.entity}`;
const initials = (name:string) => name.trim().split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase();
const selectClass = 'max-w-full rounded-full border border-prosumia-gray-light bg-white px-4 py-2.5 text-sm font-bold text-prosumia-dark shadow-sm';
const periodName=(p:string)=>{ const [y,m]=p.split('-').map(Number);return new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric'}).format(new Date(y,m-1,1)); };

function parseCSV(csv:string):Entry[] {
  const parsed=Papa.parse<Record<string,string>>(csv.replace(/^\uFEFF/,''),{header:true,delimiter:';',skipEmptyLines:true});
  if(parsed.errors.length) throw new Error(`CSV invalido: ${parsed.errors[0].message}`);
  const required=['Año','Mes_num','Red','Entidad','Métrica','Valor','Provincia','Categoría'];
  if(required.some(k=>!parsed.meta.fields?.includes(k))) throw new Error('Faltan columnas del contrato de datos.');
  const result:Entry[]=[];
  for(const row of parsed.data){
    const year=Number(row['Año']); const month=Number(row.Mes_num);
    const value=Number((row.Valor||'').replace(',','.'));
    if(!Number.isInteger(year)||!Number.isInteger(month)||month<1||month>12||!Number.isFinite(value)) continue;
    const entity=(row.Entidad||'').trim(),category=(row['Categoría']||'').trim();
    const network=(row.Red||'').trim(),metric=(row['Métrica']||'').trim();
    if(!entity||!category||!network||!metric)continue;
    result.push({year,month,entity,category,network,metric,value,province:(row.Provincia||'').trim()});
  }
  return result;
}

/** Sum only values actually present for the selected calendar month and network.
 * If multiple rows have the same key, they may represent duplicate observations:
 * instead of silently summing, flag them for review through duplicateCount.
 */
function buildMetric(entries:Entry[],metric:string){
  const map=new Map<string,number>(); let duplicateCount=0;
  for(const row of entries.filter(r=>r.metric===metric)){
    const k=keyOf(row);
    if(map.has(k)){duplicateCount++;continue;}
    map.set(k,row.value);
  }
  return {values:map,duplicateCount};
}

function RankCard({metric, entries, selected, onToggle}:{
  metric:Metric; entries:Entry[]; selected:string[]; onToggle:(id:string)=>void;
}){
  const {values,duplicateCount}=useMemo(()=>buildMetric(entries,metric.key),[entries,metric.key]);
  const names=useMemo(()=>{
    const u=new Map<string,{id:string;name:string;category:string}>();
    for(const row of entries){const id=keyOf(row);if(!u.has(id))u.set(id,{id,name:row.entity,category:row.category});}
    return [...u.values()].filter(x=>values.has(x.id)).sort((a,b)=>{
      const diff=(values.get(b.id)??0)-(values.get(a.id)??0);
      return diff || a.name.localeCompare(b.name,'es');
    });
  },[entries,values]);
  const max=Math.max(0,...names.map(n=>values.get(n.id)??0));
  const Icon=metric.icon;
  return <div className="min-w-0 rounded-2xl border border-prosumia-gray-light bg-white shadow-sm overflow-hidden">
    <div className="p-4 border-b border-prosumia-gray-light bg-prosumia-gray-lighter/30">
      <div className="flex items-center gap-2"><Icon className="w-5 h-5 text-prosumia-gray"/><h3 className="font-poppins font-bold text-sm">{metric.label}</h3></div>
      <p className="text-xs text-prosumia-gray mt-1">{metric.subtitle}</p>
      <p className="text-[11px] text-prosumia-gray mt-2">{names.length} cuentas con datos</p>
    </div>
    {duplicateCount>0&&<p className="m-3 rounded bg-amber-50 text-amber-900 p-2 text-xs">{duplicateCount} observaciones repetidas: se conserva la primera sin sumarlas. Revisar origen.</p>}
    <div className="p-3 space-y-1">
      {!names.length&&<p className="text-xs text-prosumia-gray py-6 text-center">Sin datos para esta red y período</p>}
      {names.map((item,i)=>{
        const value=values.get(item.id)!;
        const active=selected.includes(item.id);const dimmed=selected.length>0&&!active;
        const color=i<Math.ceil(names.length/3)?'bg-prosumia-green':i<Math.ceil(2*names.length/3)?'bg-prosumia-yellow':'bg-prosumia-red';
        return <button key={item.id} type="button" onClick={()=>onToggle(item.id)} title={`${item.name} · ${metric.label}: ${fmt(value)}`} className={`w-full text-left py-2 group transition-opacity ${dimmed?'opacity-35 hover:opacity-100':''}`}>
          <div className="flex items-center justify-between gap-2 text-[12px]">
            <div className="flex min-w-0 items-center gap-2"><span className="w-4 shrink-0 text-right text-[10px] text-prosumia-gray">{i+1}</span>
              <span className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold ${active?'border-prosumia-dark bg-prosumia-dark text-white':'border-prosumia-gray-light bg-prosumia-gray-lighter text-prosumia-dark'}`}>{initials(item.name)}</span>
              <span className="truncate font-semibold group-hover:text-prosumia-red" title={item.name}>{item.name}</span>
            </div><strong className="shrink-0 tabular-nums">{fmt(value)}</strong>
          </div>
          <div className="h-1.5 rounded-full bg-prosumia-gray-lighter ml-8 mt-1.5 overflow-hidden"><div className={`h-full rounded-full ${active?'bg-prosumia-dark':color}`} style={{width:`${max>0?Math.max(0,Math.min(100,value/max*100)):0}%`}}/></div>
        </button>;
      })}
    </div>
  </div>;
}

export default function EntityModule({universe}:{universe:Universe}){
  const [data,setData]=useState<Entry[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [category,setCategory]=useState('Todas');
  const [network,setNetwork]=useState('FB');
  const [province,setProvince]=useState('Todas');
  const [period,setPeriod]=useState('');
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState<string[]>([]);
  useEffect(()=>{
    let alive=true;
    const embed=(window as Window & {__ENTITY_CSV__?:string}).__ENTITY_CSV__;
    const request=embed?Promise.resolve(embed):fetch(`${import.meta.env.BASE_URL}mega_metricas.csv`).then(r=>{if(!r.ok)throw Error(`No se encontro mega_metricas.csv (${r.status})`);return r.text();});
    request.then(raw=>{if(alive)setData(parseCSV(raw));}).catch(e=>{if(alive)setError(String(e.message||e));}).finally(()=>{if(alive)setLoading(false);});
    return()=>{alive=false;};
  },[]);
  const universeRows=useMemo(()=>data.filter(r=>universe==='comparador'||(universe==='medios'?r.category==='Detractor':r.category!=='Detractor')),[data,universe]);
  const categories=useMemo(()=>[...new Set(universeRows.map(r=>r.category))].sort((a,b)=>a.localeCompare(b,'es')),[universeRows]);
  const scoped=useMemo(()=>universeRows.filter(r=>category==='Todas'||r.category===category),[universeRows,category]);
  const networks=useMemo(()=>[...new Set(scoped.map(r=>r.network))].sort(),[scoped]);
  const provinces=useMemo(()=>[...new Set(scoped.map(r=>r.province).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')),[scoped]);
  const effectiveNetwork=networks.includes(network)?network:networks[0]||'';
  const scopedNetwork=useMemo(()=>scoped.filter(r=>r.network===effectiveNetwork&&(province==='Todas'||r.province===province)),[scoped,effectiveNetwork,province]);
  const periods=useMemo(()=>[...new Set(scopedNetwork.map(periodId))].sort().reverse(),[scopedNetwork]);
  const chosenPeriod=period&&periods.includes(period)?period:periods[0]||'';
  const entries=useMemo(()=>scopedNetwork.filter(r=>periodId(r)===chosenPeriod),[scopedNetwork,chosenPeriod]);
  const roster=useMemo(()=>{
    // Lists all entities in selected category/network, including those absent in chosen month.
    const m=new Map<string,{id:string;name:string;category:string}>();
    for(const r of scopedNetwork){const id=keyOf(r);if(!m.has(id))m.set(id,{id,name:r.entity,category:r.category});}
    return [...m.values()].filter(e=>e.name.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es'))).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  },[scopedNetwork,search]);
  const toggle=(id:string)=>setSelected(x=>x.includes(id)?x.filter(i=>i!==id):[...x,id]);
  const metricsEntries=useMemo(()=>entries.filter(r=>!search||r.entity.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es'))),[entries,search]);
  const title=universe==='medios'?'Medios y cuentas digitales':universe==='comparador'?'Comparador transversal':'Dirigentes y organismos';
  return <section className="space-y-6 pb-12">
    <div><p className="uppercase font-bold tracking-widest text-[10px] text-prosumia-red mb-1">PROSUMIA · NUEVAS ENTIDADES</p><h2 className="font-poppins text-2xl font-bold">{title}</h2><p className="text-sm text-prosumia-gray mt-1">Ranking por categoría y plataforma · registros originales sin imputaciones</p></div>
    <div className="flex flex-wrap gap-3 rounded-2xl bg-prosumia-gray-lighter p-3 items-center">
      <label className="flex flex-col gap-1 text-[11px] text-prosumia-gray">Categoría<select aria-label="Categoría" className={selectClass} value={category} onChange={e=>{setCategory(e.target.value);setPeriod('');setSelected([]);}}><option value="Todas">Todas las categorías</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-[11px] text-prosumia-gray">Red social<select aria-label="Red social" className={selectClass} value={effectiveNetwork} onChange={e=>{setNetwork(e.target.value);setPeriod('');setSelected([]);}}>{networks.map(n=><option key={n} value={n}>{n}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-[11px] text-prosumia-gray">Provincia<select aria-label="Provincia" className={selectClass} value={province} onChange={e=>{setProvince(e.target.value);setPeriod('');setSelected([]);}}><option value="Todas">Todas las provincias</option>{provinces.map(p=><option key={p}>{p}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-[11px] text-prosumia-gray">Mes<select aria-label="Mes" className={selectClass} value={chosenPeriod} onChange={e=>setPeriod(e.target.value)}>{periods.map(p=><option key={p} value={p}>{periodName(p)}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-[11px] text-prosumia-gray">Buscar cuenta<input aria-label="Buscar cuenta" className={selectClass} placeholder="Nombre..." value={search} onChange={e=>setSearch(e.target.value)}/></label>
    </div>
    {loading&&<p role="status">Cargando datos de entidades...</p>}
    {error&&<p role="alert" className="p-4 rounded-xl border border-red-300 bg-red-50 text-red-800">Error de datos: {error}</p>}
    {!loading&&!error&&<>
      <div className="rounded-2xl bg-prosumia-gray-lighter p-3 space-y-2">
        <div className="flex justify-between gap-3 items-center text-sm font-semibold"><span>Seleccionar cuentas</span><span className="text-xs text-prosumia-gray">{roster.length} entidades · {selected.length} seleccionadas</span></div>
        <div className="flex items-start gap-3 overflow-x-auto pb-2">
          <button type="button" onClick={()=>setSelected([])} className={`shrink-0 w-[82px] text-center text-xs font-bold ${selected.length===0?'text-prosumia-dark':'text-prosumia-gray'}`}><span className={`mx-auto mb-1 flex w-14 h-14 items-center justify-center rounded-full border-2 ${selected.length===0?'border-prosumia-dark bg-white':'border-prosumia-gray-light bg-white'}`}>Todos</span>Todos</button>
          {roster.map(item=><button type="button" key={item.id} onClick={()=>toggle(item.id)} title={`${item.name} · ${item.category}`} className={`shrink-0 w-[88px] text-center ${selected.length>0&&!selected.includes(item.id)?'opacity-40':''}`}><span className={`mx-auto mb-1 flex w-14 h-14 items-center justify-center rounded-full border-[3px] font-bold text-sm ${selected.includes(item.id)?'border-prosumia-red bg-white text-prosumia-dark':'border-white bg-white shadow-sm text-prosumia-gray'}`}>{initials(item.name)}</span><span className="block truncate text-[11px] font-semibold">{item.name}</span></button>)}
        </div>
        <p className="text-[11px] text-prosumia-gray">Las cuentas sin foto conservan su círculo y nombre. Una selección destaca las cuentas en las cinco columnas, sin eliminarlas del ranking.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 xl:gap-8">{METRICS.map(metric=><RankCard key={metric.key} metric={metric} entries={metricsEntries} selected={selected} onToggle={toggle}/>)}</div>
      <p className="text-xs text-prosumia-gray">Período: {chosenPeriod?periodName(chosenPeriod):'sin registros'} · Red: {effectiveNetwork}. Las métricas ausentes no se reemplazan por cero. TT y TK se mantienen separados hasta validar equivalencia. Etapa 1: Ranking; Lectura, Evolutivo y Comparación quedan para las próximas integraciones.</p>
    </>}
  </section>;
}
