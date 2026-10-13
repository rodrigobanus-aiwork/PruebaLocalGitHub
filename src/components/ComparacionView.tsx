import React, { useState, useMemo } from 'react';
import { DataRow, GOBERNADORES_INFO } from '../lib/data';
import { ProgressBar, generateTooltipText, formatAbs, formatPct, formatPct2, getTrafficLightColor, RankingCard } from './Dashboard';
import { Facebook, Instagram, Twitter, Users, Activity, MessageCircle as MessageCircleIcon, TrendingUp, BarChart2, Maximize2, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export const METRIC_OPTIONS = [
  { id: 'fans', label: 'Seguidores', icon: <Users className="w-5 h-5" />, format: formatAbs, suffix: '' },
  { id: 'padronPercent', label: 'Penetración Padrón', icon: <Activity className="w-5 h-5" />, format: (v: number) => v.toFixed(1).replace(".", ","), suffix: '%' },
  { id: 'publicaciones', label: 'Publicaciones', icon: <MessageCircleIcon className="w-5 h-5" />, format: formatAbs, suffix: '' },
  { id: 'relReaccionesPubs', label: 'Engagement / Post', icon: <TrendingUp className="w-5 h-5" />, format: formatAbs, suffix: '' },
  { id: 'padronReacPercent', label: 'Impacto Padrón', icon: <BarChart2 className="w-5 h-5" />, format: (v: number) => v.toFixed(2).replace(".", ","), suffix: '%' }
];

export const SOCIAL_NETWORKS = ["FB", "IG", "TW", "TIK TOK"];

const getNetworkColorClass = (net: string) => {
  if (net === "FB") return "bg-[#1877F2]/5 border-[#1877F2]/20 text-[#1877F2]";
  if (net === "IG") return "bg-[#c13584]/5 border-[#c13584]/20 text-[#c13584]";
  if (net === "TW") return "bg-black/5 border-black/20 text-black";
  if (net === "TIK TOK") return "bg-[#FE2C55]/5 border-[#FE2C55]/20 text-[#FE2C55]";
  return "bg-gray-100 text-gray-800";
};

const getNetworkIcon = (net: string) => {
  if (net === "FB") return <Facebook className="w-4 h-4" />;
  if (net === "IG") return <Instagram className="w-4 h-4" />;
  if (net === "TW") return <Twitter className="w-4 h-4" />;
  if (net === "TIK TOK") return <svg className="w-4 h-4 fill-current" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72A162.55 162.55 0 1 1 185 188.31v89.89a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/></svg>;
  return null;
};

export function ComparacionView({ data, selectedGovs, regionFilter, periodFilter, typeFilter }: any) {
  const [columns, setColumns] = useState([
    { id: 1, social: "IG", metric: "fans" },
    { id: 2, social: "FB", metric: "fans" },
    { id: 3, social: "TW", metric: "fans" },
    { id: 4, social: "TIK TOK", metric: "fans" },
    { id: 5, social: "IG", metric: "relReaccionesPubs" },
  ]);

  const updateColumn = (id: number, key: string, value: string) => {
    setColumns(cols => cols.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  const getStatsForColumn = (socialFilter: string) => {
    const periodData = data.filter((d: any) => 
      `${d.mes_n}-${d.año}` === periodFilter && 
      d.RRSS === socialFilter
    );

    const governors = Array.from(new Set(periodData.map((d: any) => d.Gobernador))) as string[];
    const result = governors.map((gov: string) => {
      const gData = periodData.filter((d: any) => d.Gobernador === gov);
      
      const getVal = (attr: string) => {
        const found = gData.find((d: any) => d.Atributo === attr);
        return found ? found.Valor : 0;
      };

      const fans = getVal("Fans");
      const pubs = getVal("Publicaciones");
      const reac = getVal("Reacciones");
      const err = getVal("ERR");

      const info: any = GOBERNADORES_INFO[gov] || {};
      const padron = info.padron || 1;

      return {
        gobernador: gov,
        region: info.region || "Sin Región",
        fans,
        padronPercent: (fans / padron) * 100,
        publicaciones: pubs,
        reacciones: reac,
        err,
        relReaccionesPubs: pubs > 0 ? (reac / pubs) : 0,
        padronReacPercent: (reac / padron) * 100,
      };
    });

    return result.filter(r => {
      const matchRegion = regionFilter === "Todo" || r.region === regionFilter;
      let matchType = true;
      const isGob = GOBERNADORES_INFO[r.gobernador]?.isGobierno || false;
      if (typeFilter === "Gobernadores") matchType = !isGob;
      else if (typeFilter === "Gobiernos") matchType = isGob;
      return matchRegion && matchType;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 xl:gap-8 overflow-x-hidden pt-4">
      {columns.map((col, idx) => {
        const stats = getStatsForColumn(col.social);
        const sortedStats = [...stats].sort((a: any, b: any) => b[col.metric] - a[col.metric]);
        const metricConfig = METRIC_OPTIONS.find(m => m.id === col.metric)!;

        return (
          <div key={col.id} className="flex flex-col bg-white rounded-2xl border border-prosumia-gray-light shadow-sm hover:shadow-md transition-shadow relative">
            {/* Customization controls */}
            <div className="p-3 border-b border-prosumia-gray-light bg-prosumia-gray-lighter/50 rounded-t-2xl flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <div className="relative flex-1">
                  <select 
                    value={col.social}
                    onChange={(e) => updateColumn(col.id, "social", e.target.value)}
                    className="w-full text-sm font-semibold text-prosumia-dark p-2 pr-8 border-none bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-prosumia-dark appearance-none cursor-pointer"
                  >
                    {SOCIAL_NETWORKS.map(net => (
                      <option key={net} value={net}>{net === "TW" ? "X" : net === "TIK TOK" ? "TikTok" : net}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-prosumia-gray absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className={cn("p-2 rounded-lg flex items-center justify-center border", getNetworkColorClass(col.social))}>
                  {getNetworkIcon(col.social)}
                </div>
              </div>
              
              <div className="relative w-full">
                <select 
                  value={col.metric}
                  onChange={(e) => updateColumn(col.id, "metric", e.target.value)}
                  className="w-full text-sm font-medium text-prosumia-dark p-2 pr-8 border-none bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-prosumia-dark appearance-none cursor-pointer"
                >
                  {METRIC_OPTIONS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-prosumia-gray absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 p-5 max-h-[600px] overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {sortedStats.map((s, i, arr) => {
                  if (selectedGovs.length > 0 && !selectedGovs.includes(s.gobernador)) return null;
                  return (
                    <ProgressBar 
                      key={s.gobernador}
                      rank={i + 1}
                      name={s.gobernador}
                      value={s[col.metric]}
                      max={Math.max(...stats.map((st: any) => st[col.metric]), 1)}
                      colorClass={getTrafficLightColor(i, arr.length)}
                      tooltipText={generateTooltipText(i, s[col.metric], arr, col.metric, metricConfig.format)}
                      suffix={metricConfig.suffix}
                      format={metricConfig.format}
                      isHighlighted={selectedGovs.includes(s.gobernador)}
                      hasHighlighted={selectedGovs.length > 0}
                    />
                  );
                })}
                {sortedStats.length === 0 && (
                  <div className="text-center py-10 text-prosumia-gray font-medium text-sm">
                    No hay datos
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
