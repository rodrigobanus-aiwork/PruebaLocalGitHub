/**
 * PROSUMIA - NUEVAS ENTIDADES / ETAPA 3: RANKING REUTILIZADO.
 * No modifica ni reutiliza indebidamente la ruta de datos de Gobernadores.
 * Fuente: public/mega_metricas.csv (LONG, separador punto y coma).
 * Selector: cada entidad con un circulo y nombre, aun cuando no exista fotografia.
 * TT y TK permanecen separados hasta confirmar equivalencia con el propietario.
 * Ausencia de una medicion NO equivale a cero; Fans es un stock mensual.
 * Alcance de esta etapa: reutilizar el componente visual original para el ranking.
 * Lectura, Evolutivo y Comparacion se conservan como estaban en Etapa 2;
 * aun no estan visualmente homologados con Gobernadores.
 */
import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Users, FileText, Heart, MessageCircle, Activity, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { RankingCard, ProgressBar, getTrafficLightColor } from './Dashboard';

export type Universe = 'dirigentes' | 'medios' | 'comparador';
export type AnalysisTab = 'ranking' | 'lectura' | 'evolutivo' | 'comparacion';
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

/**
 * RANKING REUTILIZADO DEL DASHBOARD ORIGINAL.
 * No se crea una tarjeta ni barra paralela: se importan RankingCard y ProgressBar.
 * La identidad nueva se pasa mediante visualInfo, sin alterar GOBERNADORES_INFO.
 * Las observaciones ausentes no se transforman en ceros.
 * Los duplicados no se suman silenciosamente.
 */
function localInitialsAvatar(name: string): string {
  // SVG local embebido. Evita llamadas externas y asegura avatar si falta fotografia.
  const letters = initials(name).replace(/[^A-ZÁÉÍÓÚÜÑ0-9]/gi, '').slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="#F3F4F6"/><text x="32" y="39" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="23" fill="#374151">${letters}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
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
  return <div className="min-w-0">
    <RankingCard
      title={metric.label}
      subtitle={metric.subtitle}
      icon={<Icon className="w-5 h-5 text-prosumia-gray"/>}
      colorClass="bg-prosumia-gray-lighter"
    >
      {duplicateCount>0&&<p className="rounded bg-amber-50 text-amber-900 p-2 text-xs">{duplicateCount} observaciones repetidas: se conserva la primera sin sumarlas. Revisar origen.</p>}
      {!names.length&&<p className="text-xs text-prosumia-gray py-6 text-center">Sin datos para esta red y período</p>}
      {names.map((item,i)=>{
        const value=values.get(item.id)!;
        const isHighlighted=selected.includes(item.id);
        const next=names[i-1];
        const tooltipText=next ? `Para superar a ${next.name}: +${fmt(Math.max(0,(values.get(next.id)??0)-value))}` : '';
        return <div key={item.id} role="button" tabIndex={0} aria-label={`Seleccionar ${item.name}`}
          onClick={()=>onToggle(item.id)}
          onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onToggle(item.id);}}}
          className="cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-prosumia-dark rounded"
        >
          <ProgressBar
            name={item.name}
            value={value}
            max={max}
            rank={i+1}
            colorClass={getTrafficLightColor(i,names.length)}
            format={fmt}
            tooltipText={tooltipText}
            hasHighlighted={selected.length>0}
            isHighlighted={isHighlighted}
            visualInfo={{displayName:item.name,image:localInitialsAvatar(item.name),isGobierno:false}}
          />
        </div>;
      })}
    </RankingCard>
  </div>;
}

export default function EntityModule({universe,activeTab}:{universe:Universe;activeTab:AnalysisTab}){
  const [data,setData]=useState<Entry[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [category,setCategory]=useState('Todas');
  const [network,setNetwork]=useState('FB');
  const [province,setProvince]=useState('Todas');
  const [period,setPeriod]=useState('');
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState<string[]>([]);
  const [granularity,setGranularity]=useState<'mensual'|'trimestral'|'semestral'|'anual'>('mensual');
  const [evoMetric,setEvoMetric]=useState('Fans');
  const [evoStart,setEvoStart]=useState('');
  const [evoEnd,setEvoEnd]=useState('');
  const [evoNets,setEvoNets]=useState<string[]>([]);
  const [historical,setHistorical]=useState(false);
  const [evoSelectionMode,setEvoSelectionMode]=useState<'clasico'|'personalizado'>('clasico');
  const [evoCustom,setEvoCustom]=useState<string[]>([]);
  const [compareCols,setCompareCols]=useState([{net:'FB',metric:'Fans'},{net:'IG',metric:'Fans'},{net:'X',metric:'Fans'},{net:'TT',metric:'Fans'},{net:'FB',metric:'Publicaciones'}]);
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
  const universePeriods=useMemo(()=>[...new Set(scoped.filter(r=>province==='Todas'||r.province===province).map(periodId))].sort(),[scoped,province]);
  const viewRows=useMemo(()=>scoped.filter(r=>province==='Todas'||r.province===province),[scoped,province]);
  const title=universe==='medios'?'Medios y cuentas digitales':universe==='comparador'?'Comparador transversal':'Dirigentes y organismos';
  return <section className="space-y-6 pb-12">
    <div><p className="uppercase font-bold tracking-widest text-[10px] text-prosumia-red mb-1">PROSUMIA · NUEVAS ENTIDADES</p><h2 className="font-poppins text-2xl font-bold">{title}</h2><p className="text-sm text-prosumia-gray mt-1">{activeTab === 'ranking'?'Ranking':activeTab === 'lectura'?'Lectura':activeTab === 'evolutivo'?'Evolutivo':'Comparación'} por categoría y plataforma · registros originales sin imputaciones</p></div>
    <div className="flex flex-wrap gap-3 rounded-2xl bg-prosumia-gray-lighter p-3 items-center">
      <label className="flex flex-col gap-1 text-[11px] text-prosumia-gray">Categoría<select aria-label="Categoría" className={selectClass} value={category} onChange={e=>{setCategory(e.target.value);setPeriod('');setSelected([]);}}><option value="Todas">Todas las categorías</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      {activeTab!=='comparacion'&&<label className="flex flex-col gap-1 text-[11px] text-prosumia-gray">Red social<select aria-label="Red social" className={selectClass} value={effectiveNetwork} onChange={e=>{setNetwork(e.target.value);setPeriod('');setSelected([]);}}>{networks.map(n=><option key={n} value={n}>{n}</option>)}</select></label>}
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
      {activeTab==='ranking'&&<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 xl:gap-8">{METRICS.map(metric=><RankCard key={metric.key} metric={metric} entries={metricsEntries} selected={selected} onToggle={toggle}/>)}</div>}
      {activeTab==='lectura'&&<EntityLectura entries={metricsEntries} previousRows={scopedNetwork} period={chosenPeriod} selected={selected} onToggle={toggle}/>}
      {activeTab==='evolutivo'&&<EntityEvolutivo rows={viewRows} selected={selected} granularity={granularity} setGranularity={setGranularity} metric={evoMetric} setMetric={setEvoMetric} start={evoStart} setStart={setEvoStart} end={evoEnd} setEnd={setEvoEnd} nets={evoNets} setNets={setEvoNets} historical={historical} setHistorical={setHistorical} selectionMode={evoSelectionMode} setSelectionMode={setEvoSelectionMode} custom={evoCustom} setCustom={setEvoCustom}/>}
      {activeTab==='comparacion'&&<EntityComparacion rows={viewRows} period={chosenPeriod} selected={selected} onToggle={toggle} columns={compareCols} setColumns={setCompareCols}/>}

      <p className="text-xs text-prosumia-gray">Período: {chosenPeriod?periodName(chosenPeriod):'sin registros'} · Red: {effectiveNetwork}. Las métricas ausentes no se reemplazan por cero. TT y TK se mantienen separados hasta validar equivalencia. Las métricas no disponibles se indican como sin dato y las cuentas sin foto conservan sus iniciales.</p>
    </>}
  </section>;
}

// =============================================================
// NUEVAS ENTIDADES: calculos compartidos entre vistas.
// No alteran DataRow ni los componentes protegidos de Gobernadores.
// =============================================================
type CardAccount={id:string;name:string;category:string};
const accountList=(rows:Entry[]):CardAccount[]=>{
  const map=new Map<string,CardAccount>();
  rows.forEach(r=>{const id=keyOf(r);if(!map.has(id))map.set(id,{id,name:r.entity,category:r.category});});
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
};
function observed(rows:Entry[], metric:string, id:string):number|null{
  const vals=rows.filter(r=>keyOf(r)===id&&r.metric===metric);
  return vals.length===1?vals[0].value:null;
}
const availableMetrics=(rows:Entry[])=>[...new Set(rows.map(r=>r.metric))].sort((a,b)=>a.localeCompare(b,'es'));
const metricValue=(v:number|null)=>v===null?'Sin dato':fmt(v);
const infoBox='rounded-2xl border border-prosumia-gray-light bg-white p-5 shadow-sm';

function EntityLectura({entries,previousRows,period,selected,onToggle}:{entries:Entry[];previousRows:Entry[];period:string;selected:string[];onToggle:(id:string)=>void}){
  const accounts=accountList(entries);
  const chosen=selected.length?accounts.filter(a=>selected.includes(a.id)):accounts.slice(0,1);
  const historyPeriods=[...new Set(previousRows.map(periodId))].sort();
  const prevId=historyPeriods[historyPeriods.indexOf(period)-1];
  const prev=previousRows.filter(r=>periodId(r)===prevId);
  if(!chosen.length)return <div className={infoBox}>No hay cuentas con registros para el período y la plataforma seleccionados.</div>;
  return <div className="space-y-5">
    {chosen.length===1&&selected.length===0&&<p className="text-xs text-prosumia-gray">Lectura inicial de la primera cuenta con datos. Seleccioná círculos arriba para analizar las cuentas de tu interés.</p>}
    {chosen.map(a=>{
      const fans=observed(entries,'Fans',a.id);
      const pubs=observed(entries,'Publicaciones',a.id);
      const reac=observed(entries,'Reacciones',a.id);
      const prevFans=observed(prev,'Fans',a.id);
      const engagement=pubs!==null&&reac!==null&&pubs>0?reac/pubs:null;
      const growth=fans!==null&&prevFans!==null&&prevFans>0?(fans-prevFans)/prevFans*100:null;
      return <div key={a.id} className={infoBox}>
        <div className="flex items-center gap-3 mb-5"><div className="rounded-full w-14 h-14 bg-prosumia-gray-lighter border flex items-center justify-center font-bold">{initials(a.name)}</div><div><h3 className="font-poppins font-bold text-xl">{a.name}</h3><p className="text-xs text-prosumia-gray">{a.category} · {periodName(period)}</p></div></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">{[
          ['Seguidores',fans],['Publicaciones',pubs],['Reacciones',reac],['Engagement / Post',engagement],['Variación de seguidores (%)',growth]
        ].map(([label,v])=><div key={String(label)} className="rounded-xl border border-prosumia-gray-light p-4"><p className="text-xs text-prosumia-gray">{label}</p><p className="font-bold text-xl mt-2">{metricValue(v as number|null)}</p></div>)}</div>
        <p className="text-xs text-prosumia-gray mt-4">{fans===null?'No se dispone del número de seguidores para este corte. ':`La cuenta registra ${fmt(fans)} seguidores. `}{pubs===null?'Sin datos de publicaciones. ':`Se registran ${fmt(pubs)} publicaciones. `}{reac===null?'No hay dato de reacciones. ':`Las reacciones informadas alcanzan ${fmt(reac)}. `}{growth===null?'No hay una base mensual anterior comparable para calcular la variación de seguidores.':`La variación frente al mes anterior disponible es ${growth.toFixed(1).replace('.',',')}%.`}</p>
      </div>;
    })}
    {chosen.length>1&&<div className={infoBox}><h3 className="font-bold mb-3">Análisis comparativo directo</h3><p className="text-xs text-prosumia-gray mb-3">Solo se comparan observaciones efectivamente disponibles para la misma red y el mismo período.</p><div className="overflow-auto"><table className="min-w-full text-sm"><thead><tr className="text-left border-b"><th className="py-2">Cuenta</th>{['Fans','Publicaciones','Reacciones','Comentarios'].map(m=><th key={m}>{m}</th>)}</tr></thead><tbody>{chosen.map(a=><tr key={a.id} className="border-b"><td className="py-2 font-semibold">{a.name}</td>{['Fans','Publicaciones','Reacciones','Comentarios'].map(m=><td key={m}>{metricValue(observed(entries,m,a.id))}</td>)}</tr>)}</tbody></table></div></div>}
  </div>;
}

type Granularity='mensual'|'trimestral'|'semestral'|'anual';
const periodGroup=(r:Entry,g:Granularity)=>g==='anual'?`${r.year}`:g==='semestral'?`${r.year}-S${Math.ceil(r.month/6)}`:g==='trimestral'?`${r.year}-T${Math.ceil(r.month/3)}`:periodId(r);
const SERIES_COLORS=['#1877F2','#C13584','#FE2C55','#1e293b','#16a34a','#eab308','#9333ea','#f97316','#0d9488','#dc2626'];
function EntityEvolutivo({rows,selected,granularity,setGranularity,metric,setMetric,start,setStart,end,setEnd,nets,setNets,historical,setHistorical,selectionMode,setSelectionMode,custom,setCustom}:{rows:Entry[];selected:string[];granularity:Granularity;setGranularity:(g:Granularity)=>void;metric:string;setMetric:(m:string)=>void;start:string;setStart:(p:string)=>void;end:string;setEnd:(p:string)=>void;nets:string[];setNets:React.Dispatch<React.SetStateAction<string[]>>;historical:boolean;setHistorical:(b:boolean)=>void;selectionMode:'clasico'|'personalizado';setSelectionMode:(m:'clasico'|'personalizado')=>void;custom:string[];setCustom:React.Dispatch<React.SetStateAction<string[]>>}){
  const metrics=availableMetrics(rows);const metricSelected=metrics.includes(metric)?metric:metrics[0]||'';
  const networks=[...new Set(rows.map(r=>r.network))].sort();
  const activeNetworks=nets.length?nets.filter(n=>networks.includes(n)):[networks[0]].filter(Boolean);
  const periods=[...new Set(rows.map(periodId))].sort();
  const startId=periods.includes(start)?start:periods[0]||'';
  const endId=periods.includes(end)?end:periods[periods.length-1]||'';
  const candidates=useMemo(()=>{
    const combos=new Map<string,{key:string;id:string;net:string;name:string}>();
    rows.forEach(r=>{if(r.metric!==metricSelected)return;const id=keyOf(r);const k=`${id}\u001e${r.network}`;if(!combos.has(k))combos.set(k,{key:k,id,net:r.network,name:r.entity});});
    return [...combos.values()].sort((a,b)=>a.name.localeCompare(b.name,'es')||a.net.localeCompare(b.net));
  },[rows,metricSelected]);
  const active=candidates.filter(s=>selectionMode==='personalizado'?custom.includes(s.key):(activeNetworks.includes(s.net)&&(!selected.length||selected.includes(s.id))));
  const chart=useMemo(()=>{
    const grouped=new Map<string,Record<string,string|number|null>>();
    for(const r of rows){
      if(r.metric!==metricSelected||periodId(r)<startId||periodId(r)>endId)continue;
      const key=`${keyOf(r)}\u001e${r.network}`;
      if(!active.some(s=>s.key===key))continue;
      const p=periodGroup(r,granularity);
      if(!grouped.has(p))grouped.set(p,{period:p});
      const obj=grouped.get(p)!;
      const prior=obj[key];
      // Fans es stock: ultimo mes observado; flujos se agregan dentro del período.
      if(prior===undefined||prior===null)obj[key]=r.value;
      else if(metricSelected!=='Fans')obj[key]=Number(prior)+r.value;
      else obj[key]=r.value;
    }
    return [...grouped.values()].sort((a,b)=>String(a.period).localeCompare(String(b.period)));
  },[rows,active,metricSelected,granularity,startId,endId]);
  const historicalMean=historical&&chart.length?chart.reduce((total,r)=>total+active.reduce((t,s)=>t+(typeof r[s.key]==='number'?Number(r[s.key]):0),0),0)/chart.length/Math.max(1,active.length):null;
  return <section className="space-y-4">
    <div className={infoBox}><div className="flex flex-wrap items-end gap-3">
      <label className="text-xs text-prosumia-gray">Temporalidad<div className="flex gap-1 mt-1">{(['mensual','trimestral','semestral','anual'] as const).map(g=><button key={g} className={`px-2 py-2 rounded-lg text-xs font-semibold ${granularity===g?'bg-prosumia-dark text-white':'bg-prosumia-gray-lighter'}`} onClick={()=>setGranularity(g)}>{g[0].toUpperCase()+g.slice(1)}</button>)}</div></label>
      <label className="text-xs text-prosumia-gray">Desde<select className={selectClass+' block mt-1'} value={startId} onChange={e=>setStart(e.target.value)}>{periods.map(p=><option key={p} value={p}>{periodName(p)}</option>)}</select></label>
      <label className="text-xs text-prosumia-gray">Hasta<select className={selectClass+' block mt-1'} value={endId} onChange={e=>setEnd(e.target.value)}>{periods.map(p=><option key={p} value={p}>{periodName(p)}</option>)}</select></label>
      <label className="text-xs text-prosumia-gray">Métrica<select className={selectClass+' block mt-1'} value={metricSelected} onChange={e=>setMetric(e.target.value)}>{metrics.map(m=><option key={m}>{m}</option>)}</select></label>
      <label className="text-xs flex gap-2 items-center"><input type="checkbox" checked={historical} onChange={e=>setHistorical(e.target.checked)}/> Referencia media</label>
    </div></div>
    <div className={infoBox}>
      <div className="flex flex-wrap gap-2 mb-4"><button className={selectClass+(selectionMode==='clasico'?' ring-2 ring-prosumia-dark':'')} onClick={()=>setSelectionMode('clasico')}>Clásico</button><button className={selectClass+(selectionMode==='personalizado'?' ring-2 ring-prosumia-dark':'')} onClick={()=>setSelectionMode('personalizado')}>Personalizado</button></div>
      {selectionMode==='clasico'?<div className="flex flex-wrap gap-2 mb-4">{networks.map(net=><label key={net} className="flex items-center gap-1 text-xs border rounded-full px-3 py-2"><input type="checkbox" checked={activeNetworks.includes(net)} onChange={()=>setNets(current=>{const base=current.length?current:[networks[0]];return base.includes(net)?base.filter(x=>x!==net):[...base,net];})}/>{net}</label>)}</div>:<div className="max-h-40 overflow-auto grid grid-cols-2 md:grid-cols-4 gap-1 mb-4">{candidates.map(s=><label key={s.key} className="text-xs flex gap-2 items-center p-2 rounded hover:bg-prosumia-gray-lighter"><input type="checkbox" checked={custom.includes(s.key)} onChange={()=>setCustom(curr=>curr.includes(s.key)?curr.filter(k=>k!==s.key):[...curr,s.key])}/><span className="truncate" title={s.name}>{s.name} ({s.net})</span></label>)}</div>}
      <p className="text-xs text-prosumia-gray mb-4">{active.length} series de cuenta y red · {metricSelected==='Fans'?'Seguidores: último dato de cada período':'Métrica de flujo: suma de las observaciones disponibles por período'}</p>
      {!chart.length?<p className="text-sm text-prosumia-gray py-12 text-center">Elegí series y un intervalo con observaciones para visualizar la evolución.</p>:<div className="w-full h-[420px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{top:15,right:25,bottom:5,left:5}}><CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/><XAxis dataKey="period" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}} width={74} tickFormatter={v=>fmt(v)}/><RechartsTooltip formatter={(v:any)=>typeof v==='number'?fmt(v):'Sin dato'}/><Legend wrapperStyle={{fontSize:11}}/>{active.map((s,i)=><Line key={s.key} name={`${s.name} (${s.net})`} type="monotone" dataKey={s.key} stroke={SERIES_COLORS[i%SERIES_COLORS.length]} strokeWidth={2} dot={{r:3}} connectNulls={false} isAnimationActive={false}/>)}{historicalMean!==null&&<ReferenceLine y={historicalMean} stroke="#777" strokeDasharray="5 5" label="Media"/>}</LineChart></ResponsiveContainer></div>}
    </div>
    <p className="text-xs text-prosumia-gray">Sin fotos disponibles: las series se identifican por nombre y red. TT y TK continúan separados. Los indicadores derivados y la referencia histórica de años completos requieren validación adicional antes de incorporarse.</p>
  </section>;
}

function EntityComparacion({rows,period,selected,onToggle,columns,setColumns}:{rows:Entry[];period:string;selected:string[];onToggle:(id:string)=>void;columns:{net:string;metric:string}[];setColumns:React.Dispatch<React.SetStateAction<{net:string;metric:string}[]>>}){
  const nets=[...new Set(rows.map(r=>r.network))].sort();
  const metrics=availableMetrics(rows);
  const periodRows=rows.filter(r=>periodId(r)===period);
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 xl:gap-8 pt-2">{columns.map((col,i)=>{
    const net=nets.includes(col.net)?col.net:nets[0]||'';
    const metric=metrics.includes(col.metric)?col.metric:metrics[0]||'';
    const entries=periodRows.filter(r=>r.network===net);
    const icon=METRICS.find(m=>m.key===metric)?.icon||Activity;
    const config={key:metric,label:metric,subtitle:`${net} · ${periodName(period)}`,icon};
    return <div key={i} className="min-w-0"><div className="flex flex-col gap-2 mb-3"><select aria-label={`Red columna ${i+1}`} className={selectClass} value={net} onChange={e=>setColumns(old=>old.map((o,j)=>i===j?{...o,net:e.target.value}:o))}>{nets.map(n=><option key={n}>{n}</option>)}</select><select aria-label={`Métrica columna ${i+1}`} className={selectClass} value={metric} onChange={e=>setColumns(old=>old.map((o,j)=>i===j?{...o,metric:e.target.value}:o))}>{metrics.map(m=><option key={m}>{m}</option>)}</select></div><RankCard metric={config} entries={entries} selected={selected} onToggle={onToggle}/></div>;
  })}</div>;
}
