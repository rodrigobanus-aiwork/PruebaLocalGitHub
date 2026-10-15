import React, {useEffect, useMemo, useState} from 'react';
import Papa from 'papaparse';
import {LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip,ResponsiveContainer,Legend} from 'recharts';
import {Users,FileText,Heart,Eye,TrendingUp} from 'lucide-react';

type EntityRow={year:number;month:number;monthName:string;network:string;name:string;metric:string;value:number;province:string;category:string};
type Props={universe:'dirigentes'|'medios'|'comparador'};
const normalizeNetwork=(s:string)=>({TT:'TIK TOK',TK:'TIK TOK',TW:'X'} as Record<string,string>)[s]||s;
const normalizeMetric=(s:string)=>s.trim().replace(/^Crecimiento de seguidores$/i,'Crecimiento seguidores');
const format=(v:number)=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:1}).format(v);
const metricDefs=[
 {label:'Seguidores',key:'Fans',icon:Users},
 {label:'Publicaciones',key:'Publicaciones',icon:FileText},
 {label:'Interacciones',key:'Interacciones',icon:Heart},
 {label:'Visualizaciones',key:'Visualizaciones',icon:Eye},
 {label:'Crecimiento',key:'Crecimiento seguidores',icon:TrendingUp},
];
const cssSelect='rounded-xl border border-prosumia-gray-light bg-white px-3 py-2 text-xs font-semibold max-w-full';
function dateIndex(r:EntityRow){return r.year*12+r.month;}
function aggregate(rows:EntityRow[],metric:string,latestOnly:boolean){
 const values=new Map<string,{value:number;category:string;province:string}>();
 const current=latestOnly?Math.max(0,...rows.filter(r=>r.metric===metric).map(dateIndex)):0;
 for(const r of rows){if(r.metric!==metric || (latestOnly&&dateIndex(r)!==current))continue;
 const key=r.name+'|'+r.network+'|'+r.category;
 const prev=values.get(key); values.set(key,{value:(prev?.value||0)+r.value,category:r.category,province:r.province});}
 return Array.from(values.entries()).map(([key,v])=>({key,name:key.split('|')[0],network:key.split('|')[1],...v})).sort((a,b)=>b.value-a.value);
}
export default function EntityModule({universe}:Props){
 const [data,setData]=useState<EntityRow[]>([]);
 const [error,setError]=useState('');
 const [view,setView]=useState<'ranking'|'lectura'|'evolutivo'|'comparacion'>('ranking');
 const [category,setCategory]=useState('Todas las categorías');
 const [province,setProvince]=useState('Todas las provincias');
 const [network,setNetwork]=useState('Todas las redes');
 const [period,setPeriod]=useState('Último mes disponible');
 const [metric,setMetric]=useState('Fans');
 const [search,setSearch]=useState('');
 const [selected,setSelected]=useState<string[]>([]);
 useEffect(()=>{
   const parse=(csv:string)=>{
      const parsed=Papa.parse<Record<string,string>>(csv.replace(/^\uFEFF/,''),{header:true,delimiter:';',skipEmptyLines:true});
      const result=parsed.data.map(r=>({year:+r.Año,month:+r.Mes_num,monthName:r.Mes||'',network:normalizeNetwork(r.Red||''),name:(r.Entidad||'').trim(),metric:normalizeMetric(r['Métrica']||''),value:Number((r.Valor||'').replace(',','.')),province:(r.Provincia||'').trim(),category:(r['Categoría']||'').trim()})).filter(r=>r.name&&r.metric&&r.year>0&&Number.isFinite(r.value));
      setData(result);
   };
   const embedded=(window as any).__ENTITY_CSV__;
   if(embedded){parse(embedded);return;}
   fetch(`${import.meta.env.BASE_URL}mega_metricas.csv`).then(r=>{if(!r.ok)throw Error('Sin CSV de entidades');return r.text()}).then(parse).catch(e=>setError(e.message));
 },[]);
 const categories=useMemo(()=>Array.from(new Set(data.map(r=>r.category))).sort(),[data]);
 const provinces=useMemo(()=>Array.from(new Set(data.map(r=>r.province))).filter(Boolean).sort(),[data]);
 const networks=useMemo(()=>Array.from(new Set(data.map(r=>r.network))).sort(),[data]);
 const periods=useMemo(()=>Array.from(new Set(data.map(r=>`${r.year}-${String(r.month).padStart(2,'0')}`))).sort().reverse(),[data]);
 const group=useMemo(()=>data.filter(r=> universe==='medios'?r.category==='Detractor':universe==='dirigentes'?r.category!=='Detractor':true),[data,universe]);
 const base=useMemo(()=>group.filter(r=>(category==='Todas las categorías'||r.category===category)&&(province==='Todas las provincias'||r.province===province)&&(network==='Todas las redes'||r.network===network)&&(!search||r.name.toLowerCase().includes(search.toLowerCase()))),[group,category,province,network,search]);
 const display=useMemo(()=>{if(period==='Último mes disponible')return base;return base.filter(r=>`${r.year}-${String(r.month).padStart(2,'0')}`===period)},[base,period]);
 const effectiveMetric=metric;
 const ranking=useMemo(()=>aggregate(display,effectiveMetric,period==='Último mes disponible'),[display,effectiveMetric,period]);
 const cards=metricDefs.map(m=>({ ...m,rows:aggregate(display,m.key,period==='Último mes disponible').slice(0,12)}));
 const selectedNames=selected.length?selected:ranking.slice(0,3).map(r=>r.key);
 const evolution=useMemo(()=>{
  const source=base.filter(r=>r.metric===effectiveMetric&&selectedNames.includes(r.name+'|'+r.network+'|'+r.category));
  const m=new Map<string,Record<string,number|string>>();
  for(const r of source){const p=`${r.year}-${String(r.month).padStart(2,'0')}`;const item=m.get(p)||{period:p}; const key=r.name+'|'+r.network+'|'+r.category; item[key]=Number(item[key]||0)+r.value;m.set(p,item);}
  return [...m.values()].sort((a,b)=>String(a.period).localeCompare(String(b.period)));
 },[base,effectiveMetric,selectedNames.join('|')]);
 const totals=useMemo(()=>selectedNames.map(name=>({name,value:base.filter(r=>r.name+'|'+r.network+'|'+r.category===name&&r.metric===effectiveMetric&&(!period||period==='Último mes disponible'||`${r.year}-${String(r.month).padStart(2,'0')}`===period)).reduce((s,r)=>s+r.value,0)})),[base,effectiveMetric,period,selectedNames.join('|')]);
 const section=universe==='medios'?'Medios y cuentas digitales':universe==='comparador'?'Comparador transversal':'Dirigentes y organizaciones';
 return <section className="space-y-6 pb-12">
 <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-[10px] uppercase font-bold tracking-widest text-prosumia-red mb-2">PROSUMIA · NUEVAS ENTIDADES</div><h2 className="text-2xl font-poppins font-bold text-prosumia-dark">{section}</h2><p className="text-prosumia-gray text-sm mt-1">Mismos universos y componentes visuales · datos reales de la nueva base</p></div><span className="text-xs rounded-full bg-prosumia-gray-lighter border border-prosumia-gray-light px-3 py-2">{format(group.length)} registros</span></div>
 <div className="flex flex-wrap gap-2 items-center bg-prosumia-gray-lighter rounded-2xl p-3">
 <div className="flex flex-wrap gap-1 bg-white/60 p-1 rounded-xl mr-auto">{(['ranking','lectura','evolutivo','comparacion'] as const).map(v=><button key={v} onClick={()=>setView(v)} className={`px-3 py-2 rounded-lg text-xs font-bold ${view===v?'bg-white text-prosumia-dark shadow-sm':'text-prosumia-gray'}`}>{v==='comparacion'?'Comparación':v[0].toUpperCase()+v.slice(1)}</button>)}</div>
 <select aria-label="Categoría" className={cssSelect} value={category} onChange={e=>setCategory(e.target.value)}><option>Todas las categorías</option>{categories.filter(c=>universe==='medios'?c==='Detractor':universe==='dirigentes'?c!=='Detractor':true).map(c=><option key={c}>{c}</option>)}</select>
 <select aria-label="Provincia" className={cssSelect} value={province} onChange={e=>setProvince(e.target.value)}><option>Todas las provincias</option>{provinces.map(c=><option key={c}>{c}</option>)}</select>
 <select aria-label="Red social" className={cssSelect} value={network} onChange={e=>setNetwork(e.target.value)}><option>Todas las redes</option>{networks.map(c=><option key={c}>{c}</option>)}</select>
 <select aria-label="Período" className={cssSelect} value={period} onChange={e=>setPeriod(e.target.value)}><option>Último mes disponible</option>{periods.map(c=><option key={c}>{c}</option>)}</select>
 <input aria-label="Buscar entidad" className={cssSelect} placeholder="Buscar entidad..." value={search} onChange={e=>setSearch(e.target.value)}/>
 </div>
 {error&&<div className="border border-red-300 bg-red-50 p-4 rounded-lg">Error cargando datos: {error}</div>}
 {!data.length&&!error&&<div className="p-6">Cargando nuevas entidades...</div>}
 {data.length>0&&<>
 {view==='ranking'&&<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">{cards.map((c,i)=><div key={c.key} className="bg-white rounded-2xl border border-prosumia-gray-light shadow-sm overflow-hidden"><div className="p-4 bg-prosumia-gray-lighter/30 border-b border-prosumia-gray-light"><div className="flex items-center gap-2 font-poppins font-bold text-sm"><c.icon className="w-4 h-4"/>{c.label}</div><p className="text-[11px] text-prosumia-gray mt-2">{c.rows.length} perfiles con datos</p></div><div className="px-3 py-2">{c.rows.length?c.rows.map((r,j)=><div key={r.key} className="py-2"><div className="flex gap-2 justify-between items-center text-xs"><span className="truncate"><span className="mr-2 text-prosumia-gray">{j+1}</span>{r.name}</span><strong className="tabular-nums">{format(r.value)}</strong></div><div className="mt-2 h-1.5 bg-prosumia-gray-lighter rounded-full overflow-hidden"><div className={i%2===0?'h-full bg-prosumia-dark':'h-full bg-prosumia-red'} style={{width:`${c.rows[0]?.value>0?Math.max(1,r.value/c.rows[0].value*100):0}%`}}/></div></div>):<p className="py-8 text-center text-prosumia-gray text-xs">Sin datos comparables</p>}</div></div>)}</div>}
 {view!=='ranking'&&<div className="bg-white rounded-2xl border border-prosumia-gray-light shadow-sm p-5 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-poppins font-bold">{view==='lectura'?'Lectura por entidad':view==='evolutivo'?'Evolución de métricas':'Comparación de perfiles'}</h3><select className={cssSelect} value={metric} onChange={e=>setMetric(e.target.value)}>{Array.from(new Set([...metricDefs.map(m=>m.key),...data.map(r=>r.metric)])).map(m=><option key={m}>{m}</option>)}</select></div><div className="flex flex-wrap gap-2 max-h-36 overflow-auto">{Array.from(new Set(base.map(r=>r.name+'|'+r.network+'|'+r.category))).sort().map(name=><button key={name} onClick={()=>setSelected(p=>p.includes(name)?p.filter(n=>n!==name):[...p,name])} className={`text-xs px-3 py-1.5 rounded-full border ${selectedNames.includes(name)?'bg-prosumia-dark text-white':'bg-white'}`}>{name.replaceAll('|',' · ')}</button>)}</div>
 {view==='lectura'?<div className="grid md:grid-cols-3 gap-3">{totals.map(x=><div key={x.name} className="rounded-xl bg-prosumia-gray-lighter/30 border p-5"><p className="text-sm font-semibold">{x.name.replaceAll('|',' · ')}</p><p className="text-2xl font-bold mt-3">{format(x.value)}</p><p className="text-xs text-prosumia-gray">{effectiveMetric} · valores del filtro</p></div>)}</div>:<div className="w-full h-[360px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={evolution}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="period" tick={{fontSize:10}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={(n:any)=>format(Number(n))}/><Legend/>{selectedNames.slice(0,8).map((name,i)=><Line key={name} type="monotone" dataKey={name} stroke={['#d61b36','#282828','#ea8c2c','#2685a5','#885acb','#379761','#b48a43','#746b62'][i%8]} strokeWidth={2} dot={false} connectNulls={false}/>)}</LineChart></ResponsiveContainer></div>}
 </div>}
 <p className="text-[11px] text-prosumia-gray">Prototipo: cifras originales sin completar ausentes. En el ranking se toma el último mes disponible para cada métrica del conjunto filtrado; si faltan datos en ese mes no se imputan.</p>
 </>}
 </section>;
}
