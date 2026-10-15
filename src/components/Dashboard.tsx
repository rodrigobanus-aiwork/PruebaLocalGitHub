import React, { useState, useMemo, useEffect } from "react";
import { DataRow, fetchAndParseData, GOBERNADORES_INFO } from "../lib/data";
import { cn } from "../lib/utils";
import { Facebook, Instagram, Twitter, MapPin, Calendar, TrendingUp, TrendingDown, Users, Activity, BarChart2, FileText, LayoutDashboard, MessageCircle as MessageCircleIcon, TrendingUp as TrendingUpIcon, Download, X, FileCode, CheckCircle2, Loader2, Sparkles, HelpCircle, HardDrive } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { LecturaView } from './LecturaView';
import { ComparacionView } from './ComparacionView';
import { Database } from "lucide-react";
import EntityModule from "./EntityModule";

const GOV_ORDER = [
  "M. Pullaro",
  "R. Jalil",
  "M. Llaryora",
  "N. Torres",
  "L. Zdero",
  "JP. Valdés",
  "G. Melella",
  "A. Kicillof"
];

// Components
export function ProgressBar({ name, value, max, colorClass, suffix = "", format = (v: number) => Math.round(v).toLocaleString("es-AR"), rank, tooltipText, isHighlighted, hasHighlighted }: any) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const info: any = GOBERNADORES_INFO[name] || {};
  const displayName = info.isGobierno ? info.provincia : name;
  
  return (
    <div className={cn("flex flex-col gap-1.5 py-2 group relative transition-opacity duration-300", hasHighlighted && !isHighlighted ? "opacity-30 grayscale hover:grayscale-0 hover:opacity-100" : "")}>
      {tooltipText && (
        <div className="absolute bottom-[calc(100%-14px)] pointer-events-none left-8 z-50 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
          <div className="bg-prosumia-dark text-white text-[11px] font-sans font-medium px-2.5 py-1.5 rounded-lg whitespace-pre-wrap w-max max-w-[220px] leading-tight">
            {tooltipText}
          </div>
          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-prosumia-dark ml-4"></div>
        </div>
      )}
      <div className="flex justify-between items-center text-sm font-sans">
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          <span className="text-[10px] font-bold text-prosumia-gray w-4 text-right tabular-nums">{rank}</span>
          <span className={cn("font-semibold truncate transition-colors group-hover:text-prosumia-dark flex items-center gap-2", isHighlighted ? "text-prosumia-dark" : "text-prosumia-gray")}>
            <img src={info.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} alt={displayName} className={cn("w-5 h-5 rounded-full border-2 shadow-sm transition-all", isHighlighted ? "border-prosumia-dark scale-110" : "border-white", info.isGobierno ? "object-contain bg-white p-[1px]" : "object-cover")} />
            {displayName}
          </span>
        </div>
        <span className={cn("font-medium tabular-nums whitespace-nowrap text-[13px]", isHighlighted ? "text-prosumia-dark" : "text-prosumia-dark")}>
          {format(value)}<span className="text-prosumia-gray font-normal ml-0.5">{suffix}</span>
        </span>
      </div>
      <div className="h-1.5 w-full bg-prosumia-gray-lighter rounded-full overflow-hidden flex ml-8" style={{ width: 'calc(100% - 32px)' }}>
         <div 
           className={cn("h-full rounded-full transition-all duration-700 ease-out", isHighlighted ? "bg-prosumia-dark brightness-110 drop-shadow-md" : colorClass)} 
           style={{ width: `${Math.min(100, Math.max(1, percentage))}%` }} 
         />
      </div>
    </div>
  );
};

export function formatAbs(v: number) { return Math.round(v).toLocaleString("es-AR"); }
export function formatPct(v: number) { return v.toFixed(1).replace(".", ",") + "%"; }
export function formatPct2(v: number) { return v.toFixed(2).replace(".", ",") + "%"; }

export function generateTooltipText(index: number, currentVal: number, sortedArray: any[], metricKey: string, formatText: (v: number) => string) {
  let lines = [];
  if (index > 0) {
    const diffToNext = sortedArray[index - 1][metricKey] - currentVal;
    lines.push(`Para superar a ${sortedArray[index - 1].gobernador}: +${formatText(diffToNext)}`);
  }
  
  if (index >= 6 && index < 12) {
    if (sortedArray.length > 5) {
      const diffToGreen = sortedArray[5][metricKey] - currentVal;
      lines.push(`Para zona Verde: +${formatText(diffToGreen)}`);
    }
  }
  
  if (index >= 12) {
    if (sortedArray.length > 11) {
      const diffToYellow = sortedArray[11][metricKey] - currentVal;
      lines.push(`Para zona Amarilla: +${formatText(diffToYellow)}`);
    }
  }

  return lines.join('\n');
}

export default function Dashboard() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Universo de análisis. Los módulos nuevos son maquetas sin datos.
  const [universe, setUniverse] = useState<"gobernadores" | "dirigentes" | "medios" | "comparador">("gobernadores");

  // Tabs
  const [activeTab, setActiveTab] = useState<"ranking" | "lectura" | "evolutivo" | "comparacion">("ranking");
  
  // Filters
  const [regionFilter, setRegionFilter] = useState("Todo");
  const [socialFilter, setSocialFilter] = useState<"FB" | "IG" | "TW" | "TIK TOK">("FB");
  const [evolutivoSocials, setEvolutivoSocials] = useState<string[]>(["FB"]);
  const [periodFilter, setPeriodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Gobernadores" | "Gobiernos" | "Ambos">("Gobernadores");
  const [selectedGovs, setSelectedGovs] = useState<string[]>([]);

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        fetchAndParseData(text).then(rows => {
          setData(rows);
          setLoading(false);
          if (rows.length > 0) setPeriodFilter("");
        }).catch(err => {
          console.error("Parse error:", err);
          setLoading(false);
        });
      };
      reader.readAsText(file);
    }
  };

  const loadData = (force = false) => {
    // 1. Chequear si los datos ya están embebidos en el archivo HTML autónomo
    if (typeof window !== "undefined" && (window as any).__PRELOADED_DATA__ && (window as any).__PRELOADED_DATA__.length > 0) {
      setData((window as any).__PRELOADED_DATA__);
      setLoading(false);
      return;
    }

    setLoading(true);
    // GitHub Pages: los CSV son archivos versionados, no endpoints de Express.
    fetch(`${import.meta.env.BASE_URL}data.csv${force ? `?v=${Date.now()}` : ""}`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.text(); })
      .then(csv => fetchAndParseData(csv))
      .then(rows => { setData(rows); setLoading(false); })
      .catch(err => { console.error("Error leyendo data.csv:", err); setLoading(false); });
  };

  const handleDownloadStandaloneHtml = async () => {
    // Descarga la base original; generar un HTML compilado requiere el proceso de build.
    setIsExporting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data.csv`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'prosumia-data.csv'; a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) { console.error('Error exportando CSV', err); }
    finally { setIsExporting(false); }
  };

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) return;
    const header = "año;Período;mes_n;RRSS;Gobernador;Atributo;Valor;Provincia;tipo\n";
    const rows = data.map(d => `${d.año};${d.Período};${d.mes_n};${d.RRSS};${d.Gobernador};${d.Atributo};${d.Valor};${d.Provincia};${d.tipo}`).join("\n");
    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `datos_ranking_gobernadores_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadData();
  }, []);

  const availablePeriods = useMemo(() => {
    const periodsMap = new Map<string, { month: number, year: number, name: string }>();
    data.forEach(d => {
      const key = `${d.mes_n}-${d.año}`;
      if (!periodsMap.has(key) && d.Período) {
        periodsMap.set(key, { month: d.mes_n, year: d.año, name: `${d.Período?.toLowerCase() || ''} de ${d.año}` });
      }
    });

    return Array.from(periodsMap.values())
      .sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month)
      .map(p => ({
        id: `${p.month}-${p.year}`,
        name: p.name
      }));
  }, [data]);

  useEffect(() => {
    if (!periodFilter && availablePeriods.length > 0) {
      setPeriodFilter(availablePeriods[0].id);
    }
  }, [availablePeriods, periodFilter]);

  const stats = useMemo(() => {
    const periodData = data.filter(d => 
      `${d.mes_n}-${d.año}` === periodFilter && 
      d.RRSS === socialFilter
    );

    const governors = Array.from(new Set(periodData.map(d => d.Gobernador))) as string[];
    const result = governors.map((gov: string) => {
      const gData = periodData.filter(d => d.Gobernador === gov);
      const fans = gData.find(d => d.Atributo === "Fans")?.Valor || 0;
      const publicaciones = gData.find(d => d.Atributo === "Publicaciones")?.Valor || 0;
      const reacciones = gData.find(d => d.Atributo === "Reacciones")?.Valor || 0;
      const info = GOBERNADORES_INFO[gov] || { padron: 1000000, region: "Unknown" };
      
      const relReaccionesPubs = publicaciones > 0 ? reacciones / publicaciones : 0;
      const padronPercent = (fans / info.padron) * 100;
      const padronReacPercent = (reacciones / info.padron) * 100;

      return {
        gobernador: gov,
        region: info.region,
        fans,
        padronPercent,
        publicaciones,
        relReaccionesPubs,
        padronReacPercent
      };
    });

    return result.filter(r => {
      const matchRegion = regionFilter === "Todo" || r.region === regionFilter;
      let matchType = true;
      if (activeTab === "ranking" || activeTab === "comparacion") {
        const isGob = GOBERNADORES_INFO[r.gobernador]?.isGobierno || false;
        if (typeFilter === "Gobernadores") matchType = !isGob;
        else if (typeFilter === "Gobiernos") matchType = isGob;
      }
      return matchRegion && matchType;
    });
  }, [data, regionFilter, socialFilter, periodFilter, typeFilter, activeTab]);

 const visibleGovernors = useMemo(() => {
  if (activeTab === "evolutivo" || activeTab === "lectura") {
    const gData = data.filter(d => d.RRSS === socialFilter);

    let allGovsForSocial = Array.from(
      new Set(gData.map(d => d.Gobernador))
    ) as string[];

    // Santiago del Estero:
    // mostrar al gobernador actual en lugar del histórico
    if (allGovsForSocial.includes("G. Zamora")) {
      allGovsForSocial = allGovsForSocial.filter(
        gov => gov !== "G. Zamora"
      );

      if (!allGovsForSocial.includes("E. Suárez")) {
        allGovsForSocial.push("E. Suárez");
      }
    }

    return allGovsForSocial.filter((gov: string) => {
      if (regionFilter === "Todo") return true;
      return GOBERNADORES_INFO[gov]?.region === regionFilter;
    });

  } else {
    return stats
      .map(s => s.gobernador)
      .filter((v, i, a) => a.indexOf(v) === i) as string[];
  }
}, [data, activeTab, socialFilter, regionFilter, stats]);
  useEffect(() => {
    if (selectedGovs.length > 0 && visibleGovernors.length > 0) {
      const validGovs = selectedGovs.filter(gov => visibleGovernors.includes(gov));
      if (validGovs.length !== selectedGovs.length) {
        setSelectedGovs(validGovs);
      }
    }
  }, [visibleGovernors, selectedGovs]);

  // Sorting
  const sortByMetrics = {
    fans: [...stats].sort((a, b) => b.fans - a.fans),
    padronPercent: [...stats].sort((a, b) => b.padronPercent - a.padronPercent),
    publicaciones: [...stats].sort((a, b) => b.publicaciones - a.publicaciones),
    relReaccionesPubs: [...stats].sort((a, b) => b.relReaccionesPubs - a.relReaccionesPubs),
    padronReacPercent: [...stats].sort((a, b) => b.padronReacPercent - a.padronReacPercent),
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-prosumia-gray-lighter">
        <Activity className="w-8 h-8 text-prosumia-red animate-pulse mb-4" />
        <p className="text-prosumia-gray font-medium font-sans animate-pulse">Cargando métricas...</p>
      </div>
    );
  }

  const socialIcons = {
    "FB": <Facebook className="w-4 h-4" />,
    "IG": <Instagram className="w-4 h-4" />,
    "TW": <Twitter className="w-4 h-4" />,
    "TIK TOK": <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/></svg>
  };

  const personas = visibleGovernors.filter(g => !GOBERNADORES_INFO[g]?.isGobierno).sort((a,b) => {
    const iA = GOV_ORDER.indexOf(a);
    const iB = GOV_ORDER.indexOf(b);
    if (iA !== -1 && iB !== -1) return iA - iB;
    if (iA !== -1) return -1;
    if (iB !== -1) return 1;
    return a.localeCompare(b);
  });

  const getPersonaIndex = (escudoGov: string) => {
    const escudoInfo = GOBERNADORES_INFO[escudoGov];
    if (!escudoInfo) return -1;
    const persona = Object.keys(GOBERNADORES_INFO).find(k => !GOBERNADORES_INFO[k].isGobierno && GOBERNADORES_INFO[k].provincia === escudoInfo.provincia);
    return persona ? GOV_ORDER.indexOf(persona) : -1;
  };

  const escudos = visibleGovernors.filter(g => GOBERNADORES_INFO[g]?.isGobierno).sort((a,b) => {
    const iA = getPersonaIndex(a);
    const iB = getPersonaIndex(b);
    if (iA !== -1 && iB !== -1) return iA - iB;
    if (iA !== -1) return -1;
    if (iB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-white text-prosumia-dark font-sans pb-12 selection:bg-prosumia-red-lighter selection:text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-prosumia-gray-light shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Analytics Logo" className="w-11 h-11 object-contain shrink-0 rounded-xl shadow-sm" />
              <div>
                <h1 className="font-poppins text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-prosumia-dark to-prosumia-gray tracking-tight leading-none">
                  {universe === "gobernadores" ? "Ranking de Gobernadores" : universe === "dirigentes" ? "Dirigentes" : universe === "medios" ? "Medios" : "Comparador"}
                </h1>
                <span className="text-[10px] uppercase font-bold text-prosumia-gray/70 tracking-widest block mt-0.5 mb-1.5">powered by analytics</span>
                <div className="flex items-center gap-3 text-xs text-prosumia-gray font-medium font-sans">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-prosumia-red" /> Argentina</span>
                  <span className="w-1 h-1 rounded-full bg-prosumia-gray-light" />
                  <span className="flex items-center gap-1.5">
                    <TrendingUpIcon className="w-3.5 h-3.5" /> Ranking Mensual
                  </span>
                </div>
              </div>
            </div>

            {/* View Tabs */}
            {universe === "gobernadores" && <div className="hidden md:flex bg-prosumia-gray-lighter p-1 rounded-lg ml-4">
              <button 
                onClick={() => setActiveTab("ranking")}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold font-sans transition-all duration-200", activeTab === "ranking" ? "bg-white text-prosumia-dark shadow-sm ring-1 ring-black/5" : "text-prosumia-gray hover:text-prosumia-dark")}
              >
                <LayoutDashboard className="w-4 h-4" /> Ranking
              </button>
              <button 
                onClick={() => setActiveTab("lectura")}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold font-sans transition-all duration-200", activeTab === "lectura" ? "bg-white text-prosumia-dark shadow-sm ring-1 ring-black/5" : "text-prosumia-gray hover:text-prosumia-dark")}
              >
                <FileText className="w-4 h-4" /> Lectura
              </button>
              <button 
                onClick={() => setActiveTab("evolutivo")}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold font-sans transition-all duration-200", activeTab === "evolutivo" ? "bg-white text-prosumia-dark shadow-sm ring-1 ring-black/5" : "text-prosumia-gray hover:text-prosumia-dark")}
              >
                <TrendingUpIcon className="w-4 h-4" /> Evolutivo
              </button>
              <button 
                onClick={() => setActiveTab("comparacion")}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold font-sans transition-all duration-200", activeTab === "comparacion" ? "bg-white text-prosumia-dark shadow-sm ring-1 ring-black/5" : "text-prosumia-gray hover:text-prosumia-dark")}
              >
                <LayoutDashboard className="w-4 h-4" /> Comparación
              </button>
            </div>}
          </div>

          {universe === "gobernadores" && <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {(activeTab === "ranking" || activeTab === "comparacion") && (
              <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-prosumia-gray-light/60 shadow-sm gap-1">
                 {(["Gobernadores", "Gobiernos", "Ambos"] as const).map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTypeFilter(t)} 
                      className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all", typeFilter === t ? "bg-prosumia-dark text-white shadow-md shadow-black/20" : "text-prosumia-gray hover:text-prosumia-dark hover:bg-black/5")}
                    >
                      {t}
                    </button>
                 ))}
              </div>
            )}
            {/* Social Network Tabs */}
            {activeTab !== "comparacion" && (
              <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-full border border-prosumia-gray-light/60 shadow-sm gap-1">
                {(["FB", "IG", "TW", "TIK TOK"] as const).map((net) => {
                const getActiveClasses = (n: string) => {
                  if (n === "FB") return "bg-[#1877F2] text-white shadow-md shadow-blue-500/20";
                  if (n === "IG") return "bg-gradient-to-r from-purple-500 via-[#c13584] to-yellow-500 text-white shadow-md shadow-pink-500/20";
                  if (n === "TW" || n === "TIK TOK") return "bg-black text-white shadow-md shadow-black/20";
                  return "bg-prosumia-dark text-white";
                };

                return (
                  <button 
                    key={net}
                    onClick={() => {
                       if (activeTab === "evolutivo") {
                         setEvolutivoSocials(prev => prev.includes(net) ? prev.filter(x => x !== net).length > 0 ? prev.filter(x => x !== net) : prev : [...prev, net]);
                         setSocialFilter(net);
                       } else {
                         setSocialFilter(net);
                         if (!evolutivoSocials.includes(net)) setEvolutivoSocials([net]);
                       }
                     }} 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold font-sans transition-all duration-300", 
                      (activeTab === "evolutivo" ? evolutivoSocials.includes(net) : socialFilter === net)
                        ? getActiveClasses(net)
                        : "bg-transparent text-prosumia-gray hover:text-prosumia-dark hover:bg-prosumia-gray-lighter"
                    )}
                  >
                    <span className={cn("transition-transform duration-300", (activeTab === "evolutivo" ? evolutivoSocials.includes(net) : socialFilter === net) ? "scale-110" : "scale-100")}>
                      {socialIcons[net]}
                    </span>
                    <span className="hidden sm:inline tracking-tight">{net === "TW" ? "X" : net === "TIK TOK" ? "TikTok" : net}</span>
                  </button>
                );
              })}
              </div>
            )}

            {/* Region Dropdown */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin className={cn("h-4 w-4 transition-colors", regionFilter !== "Todo" ? "text-prosumia-red" : "text-prosumia-gray")} />
              </div>
              <select 
                value={regionFilter} 
                onChange={e => setRegionFilter(e.target.value)}
                className="pl-9 pr-10 py-2.5 bg-white border border-prosumia-gray-light text-prosumia-dark text-sm font-bold font-sans rounded-full appearance-none shadow-sm focus:outline-none focus:ring-2 focus:ring-prosumia-red/20 focus:border-prosumia-red transition-all cursor-pointer hover:bg-gray-50 focus:bg-white w-[140px]"
              >
                <option value="Todo">Todas las Reg.</option>
                <option value="Centro">Centro</option>
                <option value="Cuyo">Cuyo</option>
                <option value="NEA">NEA</option>
                <option value="NOA">NOA</option>
                <option value="Patagonia">Patagonia</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-prosumia-gray">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>

            {/* Date Dropdown */}
            <div className={`relative group ${activeTab === 'evolutivo' ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-prosumia-red" />
              </div>
              <select 
                value={periodFilter} 
                onChange={e => setPeriodFilter(e.target.value)}
                className="pl-9 pr-10 py-2.5 bg-white border border-prosumia-gray-light text-prosumia-dark text-sm font-bold font-sans rounded-full appearance-none shadow-sm focus:outline-none focus:ring-2 focus:ring-prosumia-red/20 focus:border-prosumia-red transition-all cursor-pointer hover:bg-gray-50 focus:bg-white capitalize w-[195px]"
                disabled={activeTab === 'evolutivo'}
              >
                {availablePeriods.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-prosumia-gray">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-prosumia-dark hover:bg-black text-white text-xs font-bold font-sans rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer group"
              title="Exportar esta app como HTML autónomo u otros formatos"
            >
              <Download className="w-3.5 h-3.5 text-prosumia-red group-hover:scale-110 transition-transform" />
              <span>Exportar</span>
            </button>

          </div>}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 mt-8 relative min-h-[60vh]">
        <div className="flex flex-wrap gap-2 mb-7 border-b border-prosumia-gray-light pb-5" aria-label="Universos de análisis">
          {([
            {id: "gobernadores", text: "Gobernadores", sub: "Provinciales"},
            {id: "dirigentes", text: "Dirigentes", sub: "Personas públicas"},
            {id: "medios", text: "Medios", sub: "Cuentas digitales"},
            {id: "comparador", text: "Comparador", sub: "Entre universos"}
          ] as const).map(item => (
            <button key={item.id} type="button" onClick={() => setUniverse(item.id)}
              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all border min-w-[175px]",
                universe === item.id ? "bg-prosumia-dark text-white border-prosumia-dark shadow-md" : "bg-white text-prosumia-dark border-prosumia-gray-light hover:border-prosumia-dark/30 hover:shadow-sm")}>
              <span className={cn("w-2 h-2 rounded-full", universe === item.id ? "bg-prosumia-red" : "bg-prosumia-gray-light")}/>
              <span className="flex flex-col leading-tight"><span className="font-poppins font-bold text-sm">{item.text}</span>
              <span className={cn("text-[10px] mt-1", universe === item.id ? "text-white/65" : "text-prosumia-gray")}>{item.sub}</span></span>
            </button>
          ))}
        </div>
        {universe !== "gobernadores" && <EntityModule universe={universe} />}
        {universe === "gobernadores" && <>
        {/* Governor Highlight Selector */}
        {visibleGovernors.length > 0 && (
          <div className="mb-8 overflow-x-auto pb-6 scrollbar-hide flex flex-col gap-3">
            {personas.length > 0 && (
              <div className="flex items-center gap-3 w-max mx-auto p-2 bg-prosumia-gray-lighter rounded-2xl">
                {typeFilter !== "Gobiernos" && (
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <button 
                      onClick={() => setSelectedGovs([])}
                      className={cn(
                        "px-4 py-2 text-sm font-semibold rounded-xl transition-all font-poppins duration-200", 
                        selectedGovs.length === 0 ? "bg-white text-prosumia-dark shadow-sm" : "text-prosumia-gray hover:bg-white/50"
                      )}
                    >
                      Todos
                    </button>
                  </div>
                )}
                {personas.map(govName => {
                  const info: any = GOBERNADORES_INFO[govName] || {};
                  const isSelected = selectedGovs.includes(govName);
                  return (
                    <div key={govName} className="flex-shrink-0 w-16 sm:w-20 flex justify-center">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGovs(selectedGovs.filter(g => g !== govName));
                          } else {
                            setSelectedGovs([...selectedGovs, govName]);
                          }
                        }}
                        className={cn(
                          "relative group rounded-full transition-all duration-300",
                          isSelected ? "scale-110 z-10" : "hover:scale-105 opacity-70 hover:opacity-100 grayscale hover:grayscale-0",
                          selectedGovs.length > 0 && !isSelected ? "opacity-30 grayscale" : ""
                        )}
                      >
                        <div className={cn(
                          "w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3px] transition-colors relative bg-white",
                          isSelected ? "border-prosumia-dark shadow-md" : "border-transparent"
                        )}>
                          {info.image ? (
                            <img src={info.image} alt={govName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-prosumia-gray flex items-center justify-center text-white text-sm font-bold">
                              {govName.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-prosumia-dark text-white text-[11px] font-sans px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                          {govName}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-prosumia-dark"></div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {escudos.length > 0 && (
              <div className="flex items-center gap-3 w-max mx-auto p-2 bg-prosumia-gray-lighter rounded-2xl">
                <div className="flex-shrink-0 flex items-center justify-center">
                  <button 
                    onClick={() => setSelectedGovs([])}
                    className={cn(
                      "px-4 py-2 text-sm font-semibold rounded-xl transition-all font-poppins duration-200", 
                      (typeFilter === "Gobiernos" || personas.length === 0) ? (selectedGovs.length === 0 ? "bg-white text-prosumia-dark shadow-sm" : "text-prosumia-gray hover:bg-white/50") : "opacity-0 pointer-events-none"
                    )}
                    aria-hidden={(typeFilter !== "Gobiernos" && personas.length > 0) ? "true" : "false"}
                  >
                    Todos
                  </button>
                </div>
                {escudos.map(govName => {
                  const info: any = GOBERNADORES_INFO[govName] || {};
                  const isSelected = selectedGovs.includes(govName);
                  return (
                    <div key={govName} className="flex-shrink-0 w-16 sm:w-20 flex justify-center">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedGovs(selectedGovs.filter(g => g !== govName));
                          } else {
                            setSelectedGovs([...selectedGovs, govName]);
                          }
                        }}
                        className={cn(
                          "relative group rounded-full transition-all duration-300",
                          isSelected ? "scale-110 z-10" : "hover:scale-105 opacity-70 hover:opacity-100 grayscale hover:grayscale-0",
                          selectedGovs.length > 0 && !isSelected ? "opacity-30 grayscale" : ""
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full overflow-hidden border-[2px] transition-colors relative bg-white",
                          isSelected ? "border-prosumia-dark shadow-md" : "border-transparent"
                        )}>
                          {info.image ? (
                            <img src={info.image} alt={govName} className="w-full h-full object-contain p-2" />
                          ) : (
                            <div className="w-full h-full bg-prosumia-gray flex items-center justify-center text-white text-sm font-bold">
                              {govName.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-prosumia-dark text-[10px] font-bold font-sans whitespace-nowrap text-center leading-tight">
                          {info.provincia}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {stats.length === 0 && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-prosumia-gray-lighter rounded-2xl border border-prosumia-gray-light border-dashed z-10">
            <Activity className="w-12 h-12 text-prosumia-gray mb-4" />
            <p className="text-prosumia-dark font-poppins font-bold text-lg">No hay datos para esta selección.</p>
            <p className="text-prosumia-gray font-sans text-sm mt-1">Prueba cambiando la red social o asegurate de importar el CSV completo.</p>
          </div>
        )}

        {activeTab === "ranking" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 xl:gap-8 overflow-x-hidden">
            
            {/* Column 1: Followers */}
          <RankingCard 
            title="Seguidores" 
            subtitle="Valores absolutos"
            icon={<Users className="w-5 h-5 text-prosumia-gray" />}
            colorClass="bg-prosumia-gray-lighter"
          >
            {sortByMetrics.fans.map((s, i, arr) => (
              <ProgressBar 
                key={s.gobernador}
                rank={i + 1}
                name={s.gobernador}
                value={s.fans}
                max={Math.max(...stats.map(st => st.fans), 1)}
                colorClass={getTrafficLightColor(i, arr.length)}
                tooltipText={generateTooltipText(i, s.fans, arr, 'fans', formatAbs)}
                isHighlighted={selectedGovs.includes(s.gobernador)}
                hasHighlighted={selectedGovs.length > 0}
              />
            ))}
          </RankingCard>

          {/* Column 2: Seguidores Padrón */}
          <RankingCard 
            title="Penetración Padrón" 
            subtitle="% seguidores sobre padrón"
            icon={<Activity className="w-5 h-5 text-prosumia-gray" />}
            colorClass="bg-prosumia-gray-lighter"
          >
            {sortByMetrics.padronPercent.map((s, i, arr) => (
              <ProgressBar 
                key={s.gobernador}
                rank={i + 1}
                name={s.gobernador}
                value={s.padronPercent}
                max={Math.max(...stats.map(st => st.padronPercent), 1)}
                colorClass={getTrafficLightColor(i, arr.length)}
                tooltipText={generateTooltipText(i, s.padronPercent, arr, 'padronPercent', formatPct)}
                suffix="%"
                format={(v: number) => v.toFixed(1).replace(".", ",")}
                isHighlighted={selectedGovs.includes(s.gobernador)}
                hasHighlighted={selectedGovs.length > 0}
              />
            ))}
          </RankingCard>

          {/* Column 3: Publicaciones */}
          <RankingCard 
            title="Publicaciones" 
            subtitle="Volumen absoluto de posts"
            icon={<MessageCircleIcon className="w-5 h-5 text-prosumia-gray" />}
            colorClass="bg-prosumia-gray-lighter"
          >
            {sortByMetrics.publicaciones.map((s, i, arr) => (
              <ProgressBar 
                key={s.gobernador}
                rank={i + 1}
                name={s.gobernador}
                value={s.publicaciones}
                max={Math.max(...stats.map(st => st.publicaciones), 1)}
                colorClass={getTrafficLightColor(i, arr.length)}
                tooltipText={generateTooltipText(i, s.publicaciones, arr, 'publicaciones', formatAbs)}
                isHighlighted={selectedGovs.includes(s.gobernador)}
                hasHighlighted={selectedGovs.length > 0}
              />
            ))}
          </RankingCard>

          {/* Column 4: Engagament (Reac/Pub) */}
          <RankingCard 
            title="Engagement / Post" 
            subtitle="Reacciones por publicación"
            icon={<TrendingUp className="w-5 h-5 text-prosumia-gray" />}
            colorClass="bg-prosumia-gray-lighter"
          >
            {sortByMetrics.relReaccionesPubs.map((s, i, arr) => (
              <ProgressBar 
                key={s.gobernador}
                rank={i + 1}
                name={s.gobernador}
                value={s.relReaccionesPubs}
                max={Math.max(...stats.map(st => st.relReaccionesPubs), 1)}
                colorClass={getTrafficLightColor(i, arr.length)}
                tooltipText={generateTooltipText(i, s.relReaccionesPubs, arr, 'relReaccionesPubs', formatAbs)}
                isHighlighted={selectedGovs.includes(s.gobernador)}
                hasHighlighted={selectedGovs.length > 0}
              />
            ))}
          </RankingCard>

          {/* Column 5: Reacciones / Padrón */}
          <RankingCard 
            title="Impacto Padrón" 
            subtitle="% reacciones sobre padrón"
            icon={<BarChart2 className="w-5 h-5 text-prosumia-gray" />}
            colorClass="bg-prosumia-gray-lighter"
          >
            {sortByMetrics.padronReacPercent.map((s, i, arr) => (
              <ProgressBar 
                key={s.gobernador}
                rank={i + 1}
                name={s.gobernador}
                value={s.padronReacPercent}
                max={Math.max(...stats.map(st => st.padronReacPercent), 1)}
                colorClass={getTrafficLightColor(i, arr.length)}
                tooltipText={generateTooltipText(i, s.padronReacPercent, arr, 'padronReacPercent', formatPct2)}
                suffix="%"
                format={(v: number) => v.toFixed(2).replace(".", ",")}
                isHighlighted={selectedGovs.includes(s.gobernador)}
                hasHighlighted={selectedGovs.length > 0}
              />
            ))}
          </RankingCard>

        </div>
        ) : activeTab === "lectura" ? (
          selectedGovs.length > 0 ? (
            <LecturaView 
              selectedGovs={selectedGovs} 
              periodName={availablePeriods.find(p => p.id === periodFilter)?.name}
              currentPeriodId={periodFilter}
              previousPeriodId={availablePeriods.find(p => p.id === periodFilter)?.id ? availablePeriods[availablePeriods.findIndex(p => p.id === periodFilter) + 1]?.id : null}
              allData={data}
              availablePeriods={availablePeriods}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-prosumia-gray-lighter/30 rounded-2xl border border-prosumia-gray-light border-dashed">
              <Users className="w-12 h-12 text-prosumia-gray mb-4" />
              <p className="text-prosumia-dark font-poppins font-bold text-lg">Selecciona un gobernador arriba</p>
              <p className="text-prosumia-gray font-sans text-sm mt-1">Para ver la lectura detallada de las métricas.</p>
            </div>
          )
        ) : activeTab === "evolutivo" ? (
          <EvolutivosView 
            data={data}
            selectedGovs={selectedGovs}
            socials={evolutivoSocials}
            regionFilter={regionFilter}
            availablePeriods={availablePeriods}
          />
        ) : activeTab === "comparacion" ? (
          <ComparacionView 
            data={data}
            selectedGovs={selectedGovs}
            regionFilter={regionFilter}
            periodFilter={periodFilter}
            typeFilter={typeFilter}
          />
        ) : null}
        </>}
      </main>

      {/* Modal de Exportación HTML y Datos */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-prosumia-gray-light shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto font-sans relative">
            
            {/* Header del Modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-50 text-prosumia-red rounded-2xl">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-poppins text-prosumia-dark">
                    Exportar Aplicación
                  </h3>
                  <p className="text-xs text-prosumia-gray mt-0.5">
                    Descargá la herramienta en formato HTML o exportá los datos.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 text-prosumia-gray hover:text-prosumia-dark hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opciones de exportación */}
            <div className="space-y-4">
              
              {/* Opción 1: Archivo HTML Autónomo */}
              <div className="p-5 rounded-2xl border-2 border-prosumia-red/20 bg-red-50/20 hover:bg-red-50/40 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-prosumia-red text-white rounded-lg">
                      <FileCode className="w-4 h-4" />
                    </span>
                    <h4 className="font-bold text-sm text-prosumia-dark">
                      HTML Autónomo (Single-File Offline)
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-prosumia-red text-white px-2 py-0.5 rounded-full">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-prosumia-gray leading-relaxed">
                  Un único archivo <strong>.html</strong> de ~4.6 MB que incluye <strong>todo el código, estilos, las 24 fotos y la base de datos completa precargada</strong>. Funciona con doble clic en cualquier navegador (Chrome, Safari, Edge) <strong>sin necesidad de servidor Node.js ni conexión a internet</strong>.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-prosumia-gray flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Acceso con contraseña: <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono text-[10px] font-bold text-prosumia-dark">prosumia2026</code>
                  </span>
                  <button
                    onClick={handleDownloadStandaloneHtml}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-prosumia-red hover:bg-prosumia-red-dark text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar HTML</span>
                      </>
                    )}
                  </button>
                </div>
                {exportSuccess && (
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ¡Archivo descargado correctamente! Ya podés abrirlo en cualquier navegador.
                  </p>
                )}
              </div>

              {/* Opción 2: Base de Datos en CSV */}
              <div className="p-4 rounded-2xl border border-prosumia-gray-light bg-gray-50/50 hover:bg-gray-50 transition-all flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-prosumia-dark flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-prosumia-gray" />
                    Base de Datos en CSV
                  </h4>
                  <p className="text-xs text-prosumia-gray mt-0.5">
                    Descargar los datos completos tabulares ({data.length.toLocaleString("es-AR")} registros) para Excel o PowerBI.
                  </p>
                </div>
                <button
                  onClick={handleDownloadCSV}
                  className="px-3.5 py-2 bg-white hover:bg-gray-100 border border-prosumia-gray-light text-prosumia-dark text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>

              {/* Opción 3: Despliegue estático CLI */}
              <div className="p-4 rounded-2xl border border-prosumia-gray-light bg-white text-xs text-prosumia-gray space-y-2">
                <div className="font-bold text-prosumia-dark flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-prosumia-yellow-dark" />
                  Comandos de Terminal para desarrolladores:
                </div>
                <p className="text-[11px] text-prosumia-gray">
                  Para generar el archivo HTML autónomo directamente desde la consola:
                </p>
                <div className="bg-prosumia-dark text-white p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto select-all">
                  npm run export:html
                </div>
                <p className="text-[11px] text-prosumia-gray">
                  O para compilar el sitio estático para hostings (GitHub Pages / Vercel / Netlify):
                </p>
                <div className="bg-prosumia-dark text-white p-2.5 rounded-xl font-mono text-[11px] overflow-x-auto select-all">
                  npm run build
                </div>
              </div>

            </div>

            {/* Footer del Modal */}
            <div className="flex justify-end pt-2 border-t border-prosumia-gray-light/60">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-5 py-2.5 bg-prosumia-gray-lighter hover:bg-gray-200 text-prosumia-dark text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

const CustomTooltip = ({ active, payload, label, selectedGovs, metric }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md border border-prosumia-gray-light font-sans text-sm z-50">
        <p className="font-bold text-prosumia-dark mb-2">{label}</p>
        {payload.map((entry: any, index: number) => {
          const gov = entry.name;
          const val = entry.value;
          const isSelectedOnly = selectedGovs && selectedGovs.length > 0;
          
          let formattedValue = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(val);
          if (metric.includes("(%)")) {
             formattedValue = formattedValue + "%";
          }

          return (
            <div key={`item-${index}`} className="mb-3 last:mb-0">
              <p style={{ color: entry.color }} className="font-semibold">{gov}: {formattedValue}</p>
              
              {isSelectedOnly && entry.payload[`${gov}_extra`] && (
                <div className="text-[11px] text-prosumia-gray mt-1.5 pl-2 border-l-[3px] border-prosumia-gray-light whitespace-pre-wrap leading-tight">
                   {entry.payload[`${gov}_extra`]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

function EvolutivosView({ data, selectedGovs, socials, regionFilter, availablePeriods }: { data: DataRow[], selectedGovs: string[], socials: string[], regionFilter: string, availablePeriods?: any[] }) {
  const [metric, setMetric] = useState("Fans");
  const [granularity, setGranularity] = useState<"mensual" | "trimestral" | "semestral" | "anual">("mensual");
  const [startPeriodId, setStartPeriodId] = useState<string>("");
  const [endPeriodId, setEndPeriodId] = useState<string>("");
  // Las series del evolutivo se eligen por cuenta Y red (independientes de los filtros del ranking).
  const [selectionMode, setSelectionMode] = useState<"clasico" | "personalizado">("clasico");
  const [showHistorical, setShowHistorical] = useState(false);
  const [calculationMode, setCalculationMode] = useState<"acumulado" | "mensual">("acumulado");
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [seriesInitialized, setSeriesInitialized] = useState(false);
  const [seriesSearch, setSeriesSearch] = useState("");
  const [seriesPanelOpen, setSeriesPanelOpen] = useState(false);
  const seriesKey = (account: string, net: string) => `${account} (${net})`;
  const networksOrder = ["FB", "IG", "TIK TOK", "TW", "YT"];
  const availableSeries = useMemo(() => {
    const seen = new Set<string>();
    data.forEach(d => {
      if (GOBERNADORES_INFO[d.Gobernador] && (regionFilter === "Todo" || GOBERNADORES_INFO[d.Gobernador]?.region === regionFilter) && networksOrder.includes(d.RRSS)) {
        seen.add(seriesKey(d.Gobernador, d.RRSS));
      }
    });
    return Array.from(seen).sort((a,b) => a.localeCompare(b, 'es'));
  }, [data, regionFilter]);
  useEffect(() => {
    if (!seriesInitialized && availableSeries.length > 0) {
      const preferred = availableSeries.filter(k => selectedGovs.some(g => k.startsWith(`${g} (`)) && k.endsWith('(FB)'));
      setSelectedSeries((preferred.length ? preferred : availableSeries.filter(k => k.endsWith('(FB)'))).slice(0, 3));
      setSeriesInitialized(true);
    }
  }, [seriesInitialized, availableSeries, selectedGovs]);
  // La seleccion clasica es EXCLUSIVA: ocultar las cuentas restantes tambien del dominio del eje Y.
  // Si todavia no hay seleccion, se conserva la vista general original.
  const activeSeries = useMemo(() => {
    if (selectionMode === "personalizado") return selectedSeries.filter(k => availableSeries.includes(k));
    return availableSeries.filter(key => {
      const match = key.match(/^(.*) \((FB|IG|TW|TIK TOK|YT)\)$/);
      return !!match && socials.includes(match[2]) && (selectedGovs.length === 0 || selectedGovs.includes(match[1]));
    });
  }, [selectionMode, selectedSeries, availableSeries, socials, selectedGovs]);
  const hasClassicHighlight = selectionMode === "clasico" && selectedGovs.length > 0;
  const getOriginalNetworkColor = (net: string) => {
    if (net === "FB") return "#1877F2";
    if (net === "IG") return "#c13584";
    if (net === "TW") return "#000000";
    if (net === "TIK TOK") return "#FE2C55";
    if (net === "YT") return "#E62117";
    return "#041527";
  };
  const toggleSeries = (key: string) => setSelectedSeries(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  const colorForSeries = (account: string, net: string) => {
    const palettes: Record<string,string[]> = {
      FB: ["#124A9E", "#1877F2", "#368EDF", "#69B3FA", "#085BBF", "#0065A8"],
      IG: ["#832060", "#C13584", "#E15A9A", "#9D378D", "#F075B5", "#A01964"],
      "TIK TOK": ["#A80F32", "#FE2C55", "#DF4E68", "#F36B87", "#C52847", "#8E2844"],
      TW: ["#171717", "#505050", "#777777", "#303A46", "#616C79", "#293545"],
      YT: ["#BB0000", "#E62117", "#FF3434", "#CC3141", "#F06060", "#982121"]
    };
    // Hash fijo por cuenta (sin depender del orden de selección).
    let hash = 0;
    for (const char of account) hash = ((hash * 31) + char.charCodeAt(0)) >>> 0;
    const palette = palettes[net] || ["#041527"];
    // Cinco decenas de tonos reproducibles por plataforma: cada perfil tiene un tono estable.
    // No depende de la cantidad u orden de las series seleccionadas.
    const allAccounts = Object.keys(GOBERNADORES_INFO).sort((a,b) => a.localeCompare(b, "es"));
    const accountIndex = allAccounts.indexOf(account);
    if (accountIndex >= 0) {
      const baseHue: Record<string, number> = { FB: 204, IG: 318, "TIK TOK": 346, TW: 205, YT: 0 };
      if (net === "TW") return `hsl(215 8% ${22 + (accountIndex * 7) % 38}%)`;
      return `hsl(${(baseHue[net] ?? 220) + (accountIndex % 11) * 2} ${70 + Math.floor(accountIndex / 11) * 3}% ${30 + (accountIndex * 7) % 23}%)`;
    }
    return palette[hash % palette.length];
  };

  interface GroupedPeriod {
    id: string;
    name: string;
    sortValue: number;
    months: { month: number; year: number }[];
  }

  const rawMonths = useMemo(() => {
    const monthsMap = new Map<string, { month: number, year: number, name: string }>();
    data.forEach(d => {
      const key = `${d.mes_n}-${d.año}`;
      if (!monthsMap.has(key) && d.Período) {
        monthsMap.set(key, { month: d.mes_n, year: d.año, name: d.Período });
      }
    });
    return Array.from(monthsMap.values()).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  }, [data]);

  const groupedPeriods = useMemo<GroupedPeriod[]>(() => {
    const groups: Record<string, GroupedPeriod> = {};

    rawMonths.forEach(({ month, year, name }) => {
      let id = "";
      let displayName = "";
      let sortValue = 0;

      if (granularity === "mensual") {
        id = `${month}-${year}`;
        displayName = `${name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()} de ${year}`;
        sortValue = year * 12 + month;
      } else if (granularity === "trimestral") {
        const q = Math.ceil(month / 3);
        id = `Q${q}-${year}`;
        displayName = `${q}° Trimestre de ${year}`;
        sortValue = year * 10 + q;
      } else if (granularity === "semestral") {
        const s = Math.ceil(month / 6);
        id = `S${s}-${year}`;
        displayName = `${s}° Semestre de ${year}`;
        sortValue = year * 10 + s;
      } else {
        id = `${year}`;
        displayName = `Año ${year}`;
        sortValue = year;
      }

      if (!groups[id]) {
        groups[id] = {
          id,
          name: displayName,
          sortValue,
          months: []
        };
      }
      groups[id].months.push({ month, year });
    });

    return Object.values(groups).sort((a, b) => a.sortValue - b.sortValue);
  }, [rawMonths, granularity]);

  useEffect(() => {
     if (groupedPeriods.length > 0) {
        setStartPeriodId(groupedPeriods[0].id);
        setEndPeriodId(groupedPeriods[groupedPeriods.length - 1].id);
     }
  }, [groupedPeriods]);

  const availableMetricsCount = useMemo(() => {
    return Array.from(new Set(data.filter((d: any) => activeSeries.includes(seriesKey(d.Gobernador, d.RRSS))).map((d: any) => d.Atributo)));
  }, [data, activeSeries]);

  const availableMetrics = useMemo(() => {
    const desiredOrder = [
      "Fans",
      "Penetración Padrón (%)",
      "Publicaciones",
      "Engagement / Post",
      "Reacciones / Padrón (%)",
      "Reacciones"
    ];
    
    const allMetrics = Array.from(new Set([
      ...availableMetricsCount, 
      "Penetración Padrón (%)",
      "Engagement / Post", 
      "Reacciones / Padrón (%)"
    ]));

    return allMetrics.sort((a, b) => {
      const idxA = desiredOrder.indexOf(a as string);
      const idxB = desiredOrder.indexOf(b as string);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a as string).localeCompare(b as string);
    });
  }, [availableMetricsCount]);

  useEffect(() => {
    if (!availableMetrics.includes(metric) && availableMetrics.length > 0) {
      setMetric(availableMetrics[0] as string);
    }
  }, [availableMetrics, metric]);

  const networkColor = useMemo(() => {
    if (socials.length === 1) {
      const social = socials[0];
      if (social === "FB") return "#1877F2";
      if (social === "IG") return "#c13584";
      if (social === "TW") return "#000000";
      if (social === "TIK TOK") return "#FE2C55";
    }
    return "#041527";
  }, [socials]);

  const govs = Array.from(new Set(activeSeries.map(k => k.replace(/ \((FB|IG|TW|TIK TOK|YT)\)$/, ""))));

  const startIndex = Math.max(0, groupedPeriods.findIndex((p: any) => p.id === startPeriodId));
  const endIndex = Math.min(groupedPeriods.length - 1, groupedPeriods.findIndex((p: any) => p.id === endPeriodId));

  const activeGroupedPeriods = useMemo(() => {
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      return groupedPeriods.slice(startIndex, endIndex + 1);
    }
    return groupedPeriods;
  }, [groupedPeriods, startIndex, endIndex]);

  const chartData = useMemo(() => {
    return activeGroupedPeriods.map(group => {
      const groupData = data.filter((d: any) => 
        activeSeries.includes(seriesKey(d.Gobernador, d.RRSS)) &&
        group.months.some(m => m.month === d.mes_n && m.year === d.año)
      );

      const row: any = { name: group.name };
      
      if (granularity === "mensual") {
        const firstMonth = group.months[0];
        const sample = data.find((d: any) => d.mes_n === firstMonth.month && d.año === firstMonth.year);
        if (sample && sample.Período) {
          row.name = `${sample.Período.substring(0, 3)} ${sample.año}`;
        } else {
          row.name = `${firstMonth.month}/${firstMonth.year}`;
        }
      } else if (granularity === "trimestral") {
        row.name = group.id.replace("-", " ");
      } else if (granularity === "semestral") {
        row.name = group.id.replace("-", " ");
      } else {
        row.name = group.id;
      }

      govs.forEach((g: any) => {
        networksOrder.forEach(net => {
          if (!activeSeries.includes(seriesKey(g, net))) return;
          const gData = groupData.filter((d: any) => d.Gobernador === g && d.RRSS === net);
          if (gData.length === 0) return;

          const getValForMonth = (month: number, year: number, attr: string) => {
             const found = gData.find((d: any) => d.mes_n === month && d.año === year && d.Atributo === attr);
             return found ? found.Valor : 0;
          };

          // 1. Fans: Cumulative. Take latest month's value within the group
          const sortedGroupMonths = [...group.months].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
          let fans = 0;
          for (let i = sortedGroupMonths.length - 1; i >= 0; i--) {
            const val = getValForMonth(sortedGroupMonths[i].month, sortedGroupMonths[i].year, "Fans");
            if (val > 0) {
              fans = val;
              break;
            }
          }

          if (fans === 0) return;

          // 2. Publicaciones: Sum of all months in the group
          let pubs = 0;
          group.months.forEach(m => {
            pubs += getValForMonth(m.month, m.year, "Publicaciones");
          });

          // 3. Reacciones: Sum of all months in the group
          let reac = 0;
          group.months.forEach(m => {
            reac += getValForMonth(m.month, m.year, "Reacciones");
          });

          const padron = GOBERNADORES_INFO[g as string]?.padron || 1;

          const padronPercent = (fans / padron) * 100;
          const reacPadronPercent = (reac / padron) * 100;
          const engPost = pubs > 0 ? (reac / pubs) : 0;

          const rowKey = seriesKey(g, net);

          if (metric === "Engagement / Post") {
            row[rowKey] = engPost;
          } else if (metric === "Reacciones / Padrón (%)") {
            row[rowKey] = reacPadronPercent;
          } else if (metric === "Penetración Padrón (%)") {
            row[rowKey] = padronPercent;
          } else if (metric === "Fans") {
            row[rowKey] = fans;
          } else if (metric === "Publicaciones") {
            row[rowKey] = pubs;
          } else if (metric === "Reacciones") {
            row[rowKey] = reac;
          } else {
            let sumVal = 0;
            group.months.forEach(m => {
              sumVal += getValForMonth(m.month, m.year, metric);
            });
            row[rowKey] = sumVal;
          }

          let extra = "";
          if (metric === "Fans") {
             extra = `Penetración Padrón: ${padronPercent.toFixed(2).replace('.', ',')}%`;
          } else if (metric === "Publicaciones") {
             extra = `Engagement / Post: ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(engPost)}\nReacciones / Padrón: ${reacPadronPercent.toFixed(2).replace('.', ',')}%`;
          } else if (metric === "Engagement / Post") {
             extra = `Publicaciones: ${new Intl.NumberFormat("es-AR").format(pubs)}\nReacciones / Padrón: ${reacPadronPercent.toFixed(2).replace('.', ',')}%`;
          }
          row[`${rowKey}_extra`] = extra;
        });
      });

      const allRowKeys = activeSeries;
      const validValues = allRowKeys
        .filter((k: any) => row[k] !== undefined)
        .map((k: any) => {
           const govName = k.replace(/ \((FB|IG|TW|TIK TOK|YT)\)$/, '');
           return { key: k, val: row[k], gov: govName, isGob: GOBERNADORES_INFO[govName]?.isGobierno || false };
        });

      const gobs = validValues.filter(v => v.isGob).sort((a: any, b: any) => b.val - a.val);
      const personas = validValues.filter(v => !v.isGob).sort((a: any, b: any) => b.val - a.val);

      const assignRank = (sortedArray: any[], isGobType: boolean) => {
         const entityLabel = isGobType ? 'gobiernos' : 'gobernadores';
         sortedArray.forEach((item: any, index: number) => {
            const isSelected = selectionMode === "personalizado" || selectedGovs.includes(item.gov);
            if (isSelected) {
               row[`${item.key}_extra`] += `\nPosición: #${index + 1} de ${sortedArray.length} ${entityLabel}`;
            } else {
               // Clásico: conservar serie de fondo y no mostrar detalle de ranking.
               delete row[`${item.key}_extra`];
            }
         });
      };

      assignRank(gobs, true);
      assignRank(personas, false);

      return row;
    });
  }, [activeGroupedPeriods, data, activeSeries, govs, metric, granularity, selectionMode, selectedGovs]);

  // Referencia historica: una sola linea, calculada en la unidad del grafico.
  // Cada perfil/red tiene el mismo peso, independientemente de cuantos periodos reporte.
  // Se excluyen periodos incompletos y meses sin registros de las metricas necesarias.
  const historicalReference = useMemo(() => {
    if (!showHistorical || !["trimestral", "anual"].includes(granularity)) return null;
    if (selectionMode === "clasico" && selectedGovs.length === 0) return null;
    if (activeSeries.length === 0) return null;
    const expectedMonths = granularity === "trimestral" ? 3 : 12;
    const perSeriesMeans: number[] = [];
    const requiredAttributes = metric === "Fans" || metric === "Penetración Padrón (%)" ? ["Fans"]
      : metric === "Engagement / Post" ? ["Publicaciones", "Reacciones", "Fans"]
      : metric === "Reacciones / Padrón (%)" ? ["Reacciones", "Fans"]
      : metric === "Publicaciones" || metric === "Reacciones" ? [metric, "Fans"] : [metric, "Fans"];
    let historicalPeriods = 0;
    activeSeries.forEach(key => {
      const match = key.match(/^(.*) \((FB|IG|TW|TIK TOK|YT)\)$/);
      if (!match) return;
      const [, account, net] = match;
      const records = data.filter(d => d.Gobernador === account && d.RRSS === net);
      const values: number[] = [];
      groupedPeriods.forEach(group => {
        if (group.months.length !== expectedMonths) return;
        const months = group.months;
        const monthlyValues = months.map(m => {
          const items = records.filter(d => d.mes_n === m.month && d.año === m.year);
          const attributes = new Map(items.map(d => [d.Atributo, d.Valor]));
          return attributes;
        });
        if (!monthlyValues.every(m => requiredAttributes.every(attr => m.has(attr)))) return;
        const sum = (attr: string) => monthlyValues.reduce((total, m) => total + Number(m.get(attr) || 0), 0);
        const finalFans = Number(monthlyValues[monthlyValues.length - 1].get("Fans") || 0);
        if (!Number.isFinite(finalFans) || finalFans <= 0) return;
        const padron = GOBERNADORES_INFO[account]?.padron || 1;
        const pubs = sum("Publicaciones");
        const reac = sum("Reacciones");
        let val: number;
        if (metric === "Fans") val = finalFans;
        else if (metric === "Penetración Padrón (%)") val = finalFans / padron * 100;
        else if (metric === "Engagement / Post") val = pubs > 0 ? reac / pubs : 0;
        else if (metric === "Reacciones / Padrón (%)") val = reac / padron * 100;
        else val = sum(metric);
        if (calculationMode === "mensual" && (metric === "Publicaciones" || metric === "Reacciones")) val /= expectedMonths;
        if (Number.isFinite(val)) values.push(val);
      });
      if (values.length) {
        perSeriesMeans.push(values.reduce((a,b) => a+b, 0) / values.length);
        historicalPeriods += values.length;
      }
    });
    if (!perSeriesMeans.length) return null;
    return { value: perSeriesMeans.reduce((a,b)=>a+b,0)/perSeriesMeans.length,
      seriesCount: perSeriesMeans.length, periods: historicalPeriods };
  }, [showHistorical, granularity, selectionMode, selectedGovs, activeSeries, metric, calculationMode, data, groupedPeriods]);

  const displayedChartData = useMemo(() => {
    if (calculationMode !== "mensual" || (metric !== "Publicaciones" && metric !== "Reacciones")) return chartData;
    return chartData.map((row, i) => {
      const months = activeGroupedPeriods[i]?.months.length || 1;
      const updated = { ...row };
      activeSeries.forEach(key => { if (typeof updated[key] === "number") updated[key] /= months; });
      return updated;
    });
  }, [chartData, calculationMode, metric, activeGroupedPeriods, activeSeries]);
  const showReferenceOption = granularity === "trimestral" || granularity === "anual";
  const selectedAccountsCount = new Set(activeSeries.map(k=>k.replace(/ \((FB|IG|TW|TIK TOK|YT)\)$/,""))).size;

  const colors = ["#e60026", "#041527", "#1CB86D", "#FF9F1C", "#2EC4B6", "#E71D36", "#011627", "#8338EC", "#3A86FF", "#FF006E", "#8A94A5", "#F15BB5", "#9B5DE5", "#00F5D4", "#FEE440"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-prosumia-gray-light p-6 md:p-8 mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="text-xl font-poppins font-bold text-prosumia-dark mr-4">{selectionMode === "clasico" ? `Evolución en ${socials.join(", ")}` : "Evolución por cuenta y red"}</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-prosumia-gray">Temporalidad:</span>
            <div className="flex bg-prosumia-gray-lighter p-1 rounded-xl">
              {(["mensual", "trimestral", "semestral", "anual"] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                    granularity === g 
                      ? "bg-white text-prosumia-dark shadow-sm ring-1 ring-black/5" 
                      : "text-prosumia-gray hover:text-prosumia-dark"
                  )}
                >
                  {g === "mensual" ? "Mensual" : g === "trimestral" ? "Trimestral" : g === "semestral" ? "Semestral" : "Anual"}
                </button>
              ))}
            </div>
          </div>

          {groupedPeriods.length > 0 && (
            <div className="flex items-center gap-2 bg-prosumia-gray-lighter p-2 rounded-xl">
              <span className="text-sm font-semibold text-prosumia-gray">Desde:</span>
              <select 
                value={startPeriodId} onChange={e => setStartPeriodId(e.target.value)}
                className="px-2 py-1 bg-white border border-prosumia-gray-light text-xs font-bold rounded-lg focus:outline-none focus:border-prosumia-red transition-all cursor-pointer capitalize"
              >
                {groupedPeriods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <span className="text-sm font-semibold text-prosumia-gray ml-2">Hasta:</span>
              <select 
                value={endPeriodId} onChange={e => setEndPeriodId(e.target.value)}
                className="px-2 py-1 bg-white border border-prosumia-gray-light text-xs font-bold rounded-lg focus:outline-none focus:border-prosumia-red transition-all cursor-pointer capitalize"
              >
                {groupedPeriods.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-prosumia-gray">Métrica:</span>
            <select 
              value={metric} onChange={e => setMetric(e.target.value)}
              className="px-4 py-2 bg-prosumia-gray-lighter border border-prosumia-gray-light font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-prosumia-red/20 focus:border-prosumia-red transition-all cursor-pointer"
            >
            {availableMetrics.map(m => {
              let display = m as string;
              if (m === "Fans") display = "Seguidores";
              if (m === "Penetración Padrón (%)") display = "Penetración Padrón";
              if (m === "Reacciones / Padrón (%)") display = "Impacto Padrón";
              return <option key={m as string} value={m as string}>{display}</option>;
            })}
          </select>
        </div>
        </div>
      </div>

      {/* La selección clásica conserva fotos, escudos y redes; la personalizada es independiente. */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm font-semibold text-prosumia-dark">Modo de selección:</span>
        <div className="inline-flex bg-prosumia-gray-lighter rounded-xl p-1 gap-1">
          {(["clasico", "personalizado"] as const).map(mode => (
            <button key={mode} type="button" onClick={() => setSelectionMode(mode)}
              className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-colors", selectionMode === mode ? "bg-white shadow-sm text-prosumia-dark" : "text-prosumia-gray hover:text-prosumia-dark")}>
              {mode === "clasico" ? "Clásico" : "Personalizado"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        {(metric === "Publicaciones" || metric === "Reacciones") && (
          <div className="inline-flex items-center gap-2 bg-prosumia-gray-lighter rounded-xl p-2">
            <span className="font-semibold text-prosumia-gray">Cálculo:</span>
            <select className="bg-white border border-prosumia-gray-light rounded-lg px-2 py-1.5 font-semibold text-prosumia-dark"
              value={calculationMode} onChange={e=>setCalculationMode(e.target.value as "acumulado" | "mensual")}>
              <option value="acumulado">Total del período</option>
              <option value="mensual">Promedio mensual</option>
            </select>
          </div>
        )}
        {showReferenceOption && (
          <label className="inline-flex items-center gap-2 bg-prosumia-gray-lighter rounded-xl px-3 py-2 font-semibold text-prosumia-dark cursor-pointer">
            <input type="checkbox" checked={showHistorical} onChange={e=>setShowHistorical(e.target.checked)} className="accent-red-600" />
            Referencia histórica horizontal
          </label>
        )}
        {showReferenceOption && showHistorical && (
          <span className="text-prosumia-gray">
            {historicalReference ? `${selectedAccountsCount === 1 ? "Promedio de la cuenta" : "Promedio conjunto"} · ${historicalReference.seriesCount} serie(s), ${historicalReference.periods} períodos completos` : "Sin períodos históricos completos comparables"}
          </span>
        )}
      </div>
      {selectionMode === "clasico" && (
        <p className="text-xs text-prosumia-gray mb-4">Seleccioná fotografías o escudos y las redes del encabezado. Se muestran solamente las cuentas elegidas, sin líneas grises ni influencia de las demás sobre la escala. Sin cuentas seleccionadas se muestra la vista general.</p>
      )}
      {selectionMode === "personalizado" && (<>
      <div className="mb-5 border border-prosumia-gray-light rounded-xl p-3 bg-prosumia-gray-lighter/20">
        <div className="flex flex-wrap justify-between gap-2 items-center">
          <div className="text-sm font-bold text-prosumia-dark">Series del gráfico ({activeSeries.length})</div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelectedSeries([])} className="text-xs font-semibold text-prosumia-gray hover:text-prosumia-dark px-3 py-2">Limpiar</button>
            <button type="button" onClick={() => setSeriesPanelOpen(o => !o)} className="text-xs font-bold rounded-lg bg-white border border-prosumia-gray-light px-3 py-2 hover:border-prosumia-red">
              {seriesPanelOpen ? "Cerrar selector" : "Elegir cuentas y redes"}
            </button>
          </div>
        </div>
        {activeSeries.length > 0 && <div className="flex flex-wrap gap-2 mt-3">
          {activeSeries.map(key => {
            const match = key.match(/^(.*) \((FB|IG|TW|TIK TOK|YT)\)$/);
            const account = match?.[1] || key;
            const net = match?.[2] || "FB";
            return <button type="button" key={key} onClick={() => toggleSeries(key)} title={`Quitar ${key}`} className="inline-flex gap-2 items-center bg-white border border-prosumia-gray-light rounded-lg px-2.5 py-1.5 text-xs font-semibold text-prosumia-dark">
              <span className="w-5 h-[3px] rounded-full" style={{backgroundColor: colorForSeries(account, net)}} />{key} <span aria-hidden="true">×</span>
            </button>;
          })}
        </div>}
        {seriesPanelOpen && <div className="mt-3 bg-white rounded-lg border border-prosumia-gray-light p-3">
          <input aria-label="Buscar cuenta" placeholder="Buscar gobernador o gobierno..." value={seriesSearch} onChange={e=>setSeriesSearch(e.target.value)} className="w-full border border-prosumia-gray-light rounded-lg px-3 py-2 text-sm mb-3" />
          <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {availableSeries.filter(k => k.toLocaleLowerCase('es').includes(seriesSearch.toLocaleLowerCase('es'))).map(key=>{
              const match = key.match(/^(.*) \((FB|IG|TW|TIK TOK|YT)\)$/);
              const account=match?.[1]||key, net=match?.[2]||"FB";
              return <label key={key} className="flex items-center gap-2 cursor-pointer rounded-lg hover:bg-prosumia-gray-lighter px-2 py-1.5 text-xs text-prosumia-dark">
                <input type="checkbox" checked={selectedSeries.includes(key)} onChange={()=>toggleSeries(key)} className="accent-red-600" />
                <span className="w-5 h-[3px] flex-shrink-0" style={{backgroundColor:colorForSeries(account,net)}} />
                <span>{account} · {net === 'TW' ? 'X' : net}</span>
              </label>;
            })}
          </div>
        </div>}
      </div>
      {activeSeries.length === 0 && <p className="text-sm text-prosumia-gray mb-3">Elegí al menos una combinación de cuenta y red para visualizar su evolución.</p>}
      </>)}
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayedChartData} margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
            <defs>
              <clipPath id="circleClip" clipPathUnits="objectBoundingBox">
                <circle cx="0.5" cy="0.5" r="0.5" />
              </clipPath>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#8A94A5" }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#8A94A5" }} 
              tickFormatter={(val) => new Intl.NumberFormat("es-AR", { notation: "compact" }).format(val)} 
              dx={-10}
            />
            <RechartsTooltip content={<CustomTooltip selectedGovs={selectionMode === "clasico" ? selectedGovs : activeSeries} metric={metric} />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {showReferenceOption && historicalReference && (
              <ReferenceLine y={historicalReference.value} stroke="#D97706" strokeWidth={2} strokeDasharray="7 5"
                label={{ value: `Promedio histórico: ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(historicalReference.value)}`, position: "insideTopRight", fill: "#A55A08", fontSize: 11 }} />
            )}
            {activeSeries.map(key => {
                const match = key.match(/^(.*) \((FB|IG|TW|TIK TOK|YT)\)$/);
                return { gov: match?.[1] || key, net: match?.[2] || "FB" };
              })
              .map(({ gov, net }, i: number) => {
              const rowKey = seriesKey(gov, net);
              const isSelected = selectionMode === "personalizado" || selectedGovs.includes(gov);
              const isDimmed = hasClassicHighlight && !selectedGovs.includes(gov);
              
              const lineColor = selectionMode === "personalizado" ? colorForSeries(gov, net) : getOriginalNetworkColor(net);
              const CustomLabel = (props: any) => {
                const { x, y, index } = props;
                if (index === chartData.length - 1 && chartData[index][rowKey] !== undefined) { // End of line
                  const info: any = GOBERNADORES_INFO[gov as string] || {};
                  const image = info.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(gov as string)}`;
                  return (
                    <g>
                      <image href={image} x={x + 10} y={y - 12} height="24px" width="24px" clipPath={info.isGobierno ? undefined : "url(#circleClip)"} preserveAspectRatio={info.isGobierno ? "xMidYMid meet" : "xMidYMid slice"} />
                      {(selectionMode === "personalizado" || socials.length > 1) && (
                         <text x={x + 38} y={y + 4} fontSize="10" fontWeight="bold" fill={lineColor}>{net}</text>
                      )}
                    </g>
                  );
                }
                return null;
              };

              return (
                  <Line 
                    key={rowKey}
                    type="monotone" 
                    dataKey={rowKey} 
                    stroke={lineColor} 
                    strokeWidth={isSelected ? 4 : 2}
                    dot={isSelected ? { r: 5, fill: lineColor, strokeWidth: 2, stroke: "#fff" } : { r: 0 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    opacity={1}
                    label={<CustomLabel />}
                    isAnimationActive={false}
                  />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}




/** Maqueta de estructura futura: no calcula ni simula estadísticas. */
function ProsumiaModulePreview({ universe }: {universe: "dirigentes" | "medios" | "comparador"}) {
  const [view, setView] = useState<"ranking" | "lectura" | "evolutivo" | "comparacion">("ranking");
  const [filter, setFilter] = useState("Todas las categorías");
  const [network, setNetwork] = useState("FB");
  const [chosen, setChosen] = useState<string[]>([]);
  const isCross = universe === "comparador";
  const heading = universe === "dirigentes" ? "Dirigentes" : universe === "medios" ? "Medios digitales" : "Comparador transversal";
  const categories = universe === "dirigentes" ? ["Todas las categorías", "Intendentes", "Ministros", "Legisladores", "Otros dirigentes"] : ["Todas las categorías", "Medios provinciales", "Medios locales", "Periodistas", "Otros medios"];
  const cards = [
    {name: "Seguidores", sub: "Valores absolutos", icon: <Users className="w-4 h-4"/>},
    {name: "Penetración", sub: "% sobre universo de referencia", icon: <Activity className="w-4 h-4"/>},
    {name: "Publicaciones", sub: "Volumen de posteos", icon: <FileText className="w-4 h-4"/>},
    {name: "Engagement / Post", sub: "Interacciones por publicación", icon: <TrendingUpIcon className="w-4 h-4"/>},
    {name: "Impacto", sub: "Indicador configurable", icon: <BarChart2 className="w-4 h-4"/>}
  ];
  const titleByView = {ranking: "Ranking de perfiles", lectura: "Lectura por perfil", evolutivo: "Evolución de métricas", comparacion: "Comparación dentro del universo"};
  return (
    <section className="space-y-6 pb-12">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-prosumia-red mb-2">Arquitectura Prosumia · Vista de diseño</div>
          <h2 className="text-2xl font-poppins font-bold text-prosumia-dark">{heading}</h2>
          <p className="text-prosumia-gray text-sm mt-1">{isCross ? "Comparar perfiles de distintos universos, plataformas y períodos." : "Misma lógica visual que Gobernadores, preparada para incorporar nuevas entidades."}</p>
        </div>
        <span className="rounded-full px-3 py-1.5 text-xs font-bold bg-prosumia-gray-lighter border border-prosumia-gray-light text-prosumia-gray">Maqueta · Sin datos cargados</span>
      </div>
      {!isCross && <div className="flex flex-wrap gap-2 items-center justify-between bg-prosumia-gray-lighter rounded-2xl p-3">
        <div className="flex flex-wrap gap-1 bg-white/60 p-1 rounded-xl">
          {(["ranking", "lectura", "evolutivo", "comparacion"] as const).map(v => <button key={v} type="button" onClick={() => setView(v)}
            className={cn("rounded-lg px-3 py-2 text-xs font-bold transition", view===v ? "bg-white shadow-sm text-prosumia-dark" : "text-prosumia-gray hover:text-prosumia-dark")}>{v === "comparacion" ? "Comparación" : v[0].toUpperCase()+v.slice(1)}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Categoría" className="rounded-xl border border-prosumia-gray-light bg-white px-3 py-2 text-xs font-semibold" value={filter} onChange={e=>setFilter(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select>
          <select aria-label="Red social" className="rounded-xl border border-prosumia-gray-light bg-white px-3 py-2 text-xs font-semibold" value={network} onChange={e=>setNetwork(e.target.value)}><option value="FB">Facebook</option><option value="IG">Instagram</option><option value="TIK TOK">TikTok</option><option value="TW">X</option></select>
        </div>
      </div>}
      {isCross ? <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["Gobernadores y gobiernos", "Dirigentes", "Medios digitales"] as const).map(c => <button key={c} type="button" onClick={()=>setChosen(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])}
            className={cn("text-left px-5 py-4 rounded-2xl border transition-all", chosen.includes(c) ? "border-prosumia-dark bg-prosumia-gray-lighter" : "border-prosumia-gray-light bg-white hover:border-prosumia-gray")}>
            <div className="flex items-center gap-3"><span className={cn("rounded-md w-5 h-5 border flex items-center justify-center text-xs",chosen.includes(c)?"bg-prosumia-dark text-white":"bg-white")}>{chosen.includes(c)?"✓":""}</span><span className="font-semibold text-sm">{c}</span></div>
            <p className="text-xs text-prosumia-gray mt-2 pl-8">{c === "Gobernadores y gobiernos" ? "Universo existente" : "Pendiente de incorporación de datos"}</p>
          </button>)}
        </div>
        <div className="rounded-2xl border border-prosumia-gray-light bg-white p-6">
          <div className="flex flex-wrap justify-between gap-2"><h3 className="font-poppins font-bold">Área de comparación entre universos</h3><span className="text-xs text-prosumia-gray">{chosen.length} universos seleccionados</span></div>
          <div className="border-2 border-dashed border-prosumia-gray-light rounded-xl mt-5 min-h-[230px] flex flex-col items-center justify-center gap-3 text-center px-6 bg-prosumia-gray-lighter/20"><BarChart2 className="w-9 h-9 text-prosumia-gray/40"/><p className="font-semibold text-prosumia-dark">Comparación transversal</p><p className="text-prosumia-gray text-xs max-w-lg">Acá se ubicarán las series elegidas con métricas y períodos homologados. No se muestran resultados hasta incorporar los datos y validar comparabilidad.</p></div>
        </div>
      </> : <>
        {view === "ranking" ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">{cards.map((c,i)=><div key={i} className="bg-white rounded-2xl border border-prosumia-gray-light overflow-hidden shadow-sm"><div className="p-4 bg-prosumia-gray-lighter/30 border-b border-prosumia-gray-light"><div className="flex items-center gap-2 font-poppins font-bold text-sm"><span className="bg-prosumia-gray-lighter p-2 rounded-lg">{c.icon}</span>{c.name}</div><p className="text-[11px] text-prosumia-gray mt-2">{c.sub}</p></div><div className="p-4 space-y-5">{[1,2,3,4].map(j=><div key={j} className="flex items-center gap-2"><span className="text-xs text-prosumia-gray">{j}</span><div className="rounded-full bg-prosumia-gray-lighter w-7 h-7 flex-shrink-0"/><div className="flex-1"><div className="h-2 rounded-full bg-prosumia-gray-light/70 w-3/4"/><div className="h-1.5 rounded-full bg-prosumia-gray-lighter w-full mt-2"/></div></div>)}</div></div>)}</div> : <div className="rounded-2xl bg-white border border-prosumia-gray-light p-5 md:p-8 shadow-sm">
          <h3 className="font-poppins font-bold text-lg">{titleByView[view]}</h3><p className="text-xs text-prosumia-gray mt-1">Estructura de la vista: sin registros ni valores simulados.</p>
          {view === "lectura" ? <div className="grid sm:grid-cols-3 gap-3 mt-5">{["Información del perfil", "Indicadores", "Variación por período"].map(t=><div key={t} className="bg-prosumia-gray-lighter/30 rounded-xl border border-dashed border-prosumia-gray-light p-8 text-center text-sm text-prosumia-gray">{t}<p className="text-[11px] mt-2">Sin datos</p></div>)}</div> : <div className="mt-6 min-h-[280px] border-2 border-dashed border-prosumia-gray-light rounded-xl flex items-center justify-center bg-prosumia-gray-lighter/20"><div className="text-center text-prosumia-gray"><TrendingUpIcon className="w-9 h-9 mx-auto mb-3 opacity-40"/><p className="font-semibold text-sm">Área del gráfico</p><p className="text-xs mt-1">Selección de perfiles y períodos pendiente</p></div></div>}
        </div>}
        <p className="text-xs text-prosumia-gray">Esta sección es una maqueta de navegación. Los controles cambian la vista y los filtros de presentación, pero no consultan datos inexistentes.</p>
      </>}
    </section>
  );
}

export function RankingCard({ title, subtitle, icon, children, colorClass }: any) {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-prosumia-gray-light shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-prosumia-gray-light bg-prosumia-gray-lighter/30 rounded-t-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className={cn("p-2 rounded-lg", colorClass)}>
            {icon}
          </div>
          <h2 className="font-poppins font-bold text-prosumia-dark text-base">{title}</h2>
        </div>
        <p className="text-xs text-prosumia-gray font-medium pl-11 font-sans">{subtitle}</p>
      </div>
      <div className="p-5 flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}

export function getTrafficLightColor(rankIndex: number, totalCount: number) {
  if (rankIndex < 6) return "bg-prosumia-green";
  if (totalCount > 6 && rankIndex >= totalCount - 12) return "bg-prosumia-red";
  return "bg-prosumia-yellow";
}


