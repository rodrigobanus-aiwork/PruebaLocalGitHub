import React from 'react';
import { FileText, TrendingDown, TrendingUp, Activity, Users, MapPin, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { GOBERNADORES_INFO } from '../lib/data';

function getTrafficLightColor(rankIndex: number, totalCount: number) {
  if (rankIndex <= 5) return "bg-prosumia-green";
  if (totalCount > 6 && rankIndex >= totalCount - 12) return "bg-prosumia-red";
  return "bg-prosumia-yellow";
}

export function LecturaView({ selectedGovs, periodName, currentPeriodId, previousPeriodId, allData, availablePeriods }: any) {
  if (!selectedGovs || selectedGovs.length === 0) return null;

  const currentPeriodData = allData.filter((d: any) => `${d.mes_n}-${d.año}` === currentPeriodId);
  const prevPeriodData = previousPeriodId ? allData.filter((d: any) => `${d.mes_n}-${d.año}` === previousPeriodId) : [];

  if (currentPeriodData.length === 0) return null;

  const getGovStats = (gov: string, dataSet: any[]) => {
    const govData = dataSet.filter((d: any) => d.Gobernador === gov);
    const byNetwork: any = {};
    let totalFans = 0;
    let totalPubs = 0;
    let totalReac = 0;
    
    ["FB", "IG", "TW", "TIK TOK"].forEach(net => {
      const netData = govData.filter((d: any) => d.RRSS === net);
      const fans = netData.find((d: any) => d.Atributo === "Fans")?.Valor || 0;
      const pubs = netData.find((d: any) => d.Atributo === "Publicaciones")?.Valor || 0;
      const reac = netData.find((d: any) => d.Atributo === "Reacciones")?.Valor || 0;
      byNetwork[net] = { fans, pubs, reac, eng: pubs > 0 ? reac / pubs : 0 };
      totalPubs += pubs;
      totalReac += reac;
    });

    const padron = GOBERNADORES_INFO[gov]?.padron || 1;
    const region = GOBERNADORES_INFO[gov]?.region || "Unknown";

    const bestNetworkFans = Object.keys(byNetwork).reduce((a, b) => byNetwork[a].fans > byNetwork[b].fans ? a : b);
    const bestNetworkEng = Object.keys(byNetwork).reduce((a, b) => byNetwork[a].eng > byNetwork[b].eng ? a : b);
    
    // We get the max fans across networks instead of total
    totalFans = Object.values(byNetwork).reduce((acc: number, val: any) => acc + val.fans, 0) as number;

    return {
      gov,
      region,
      totalFans,
      maxFans: byNetwork[bestNetworkFans].fans,
      totalPubs,
      totalReac,
      padron,
      byNetwork,
      bestNetworkFans,
      bestNetworkEng,
      totalEng: totalPubs > 0 ? totalReac / totalPubs : 0,
      padronPercent: (byNetwork[bestNetworkFans].fans / padron) * 100,
      padronReacPercent: (totalReac / padron) * 100
    };
  };

  const allGovernors = Array.from(new Set(allData.map((d: any) => d.Gobernador))) as string[];
  const allCurrentStats = allGovernors.map(gov => getGovStats(gov, currentPeriodData));
  const allPrevStats = prevPeriodData.length > 0 ? allGovernors.map(gov => getGovStats(gov, prevPeriodData)) : [];

  const getNetworkStyle = (net: string) => {
    switch (net) {
      case "FB": return "bg-[#1877F2]/5 border-[#1877F2]/20 text-[#1877F2] shadow-sm shadow-[#1877F2]/5";
      case "IG": return "bg-gradient-to-br from-[#f09433]/5 via-[#c13584]/5 to-[#bc1888]/5 border-[#c13584]/20 text-[#c13584] shadow-sm shadow-[#c13584]/5";
      case "TW": return "bg-black/5 border-black/10 text-black shadow-sm shadow-black/5";
      case "TIK TOK": return "bg-black/5 border-black/10 text-black shadow-sm shadow-black/5 relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-[#00f2fe] after:absolute after:top-0 after:right-0 after:w-1 after:h-full after:bg-[#fe0979]";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getNetworkTextColor = (net: string) => {
    switch(net) {
      case "FB": return "text-[#1877F2]";
      case "IG": return "text-[#c13584]";
      default: return "text-black";
    }
  };

  const renderGovAnalysis = (gov: string) => {
    const curr = allCurrentStats.find(s => s.gov === gov);
    const prev = allPrevStats.find(s => s.gov === gov);
    if (!curr) return null;

    const analysisCards: any[] = [];
    
    const isGobierno = GOBERNADORES_INFO[gov]?.isGobierno || false;
    const sameTypePrevStats = allPrevStats.filter(s => (GOBERNADORES_INFO[s.gov]?.isGobierno || false) === isGobierno);
    const sameTypeCurrentStats = allCurrentStats.filter(s => (GOBERNADORES_INFO[s.gov]?.isGobierno || false) === isGobierno);

    if (prev) {
      const prevRegion = sameTypePrevStats.filter(s => s.region === curr.region);
      const currRegion = sameTypeCurrentStats.filter(s => s.region === curr.region);

      const checkColorChange = (prevCollection: any[], currCollection: any[], metricKey: string, metricName: string, descBad: string, descGood: string, context: string) => {
        const prevRank = [...prevCollection].sort((a, b) => b[metricKey] - a[metricKey]).findIndex(s => s.gov === gov);
        const currRank = [...currCollection].sort((a, b) => b[metricKey] - a[metricKey]).findIndex(s => s.gov === gov);

        if (prevRank === -1 || currRank === -1) return;

        const prevColor = getTrafficLightColor(prevRank, prevCollection.length);
        const currColor = getTrafficLightColor(currRank, currCollection.length);
        const rankDiff = prevRank - currRank;
        
        const outOf = currCollection.length;

        const entityLabel = isGobierno ? 'gobiernos' : 'gobernadores';

        if (
          (prevColor === "bg-prosumia-green" && (currColor === "bg-prosumia-yellow" || currColor === "bg-prosumia-red")) ||
          (prevColor === "bg-prosumia-yellow" && currColor === "bg-prosumia-red")
        ) {
           analysisCards.push({ type: "warning", context, metric: metricName, text: `Pasó a zona de alerta (Puesto ${currRank + 1} de ${outOf} ${entityLabel}). ${descBad}.` });
        } 
        else if (
          (prevColor === "bg-prosumia-red" && (currColor === "bg-prosumia-yellow" || currColor === "bg-prosumia-green")) ||
          (prevColor === "bg-prosumia-yellow" && currColor === "bg-prosumia-green")
        ) {
           analysisCards.push({ type: "success", context, metric: metricName, text: `Mejoró su posición al Puesto ${currRank + 1} de ${outOf} ${entityLabel}, apuntando hacia zona superior. ${descGood}.` });
        } else if (prevColor === currColor && currColor === "bg-prosumia-red") {
           analysisCards.push({ type: "warning", context, metric: metricName, text: `Precaución: Mantiene una posición persistentemente baja (Puesto ${currRank + 1} de ${outOf} ${entityLabel}).` });
        } else if (prevColor === currColor && currColor === "bg-prosumia-green") {
           analysisCards.push({ type: "success", context, metric: metricName, text: `Liderazgo consolidado: Se mantiene en el grupo superior (Puesto ${currRank + 1} de ${outOf} ${entityLabel}).` });
        } else if (Math.abs(rankDiff) >= 2) {
           if (rankDiff > 0) {
             analysisCards.push({ type: "info", context, metric: metricName, text: `Avanzó ${rankDiff} posiciones hasta el Puesto ${currRank + 1} de ${outOf} ${entityLabel}.` });
           } else {
             analysisCards.push({ type: "warning", context, metric: metricName, text: `Retrocedió ${Math.abs(rankDiff)} posiciones hasta el Puesto ${currRank + 1} de ${outOf} ${entityLabel}.` });
           }
        } else if (prevColor === currColor && currColor === "bg-prosumia-yellow") {
           analysisCards.push({ type: "info", context, metric: metricName, text: `Mantiene una posición intermedia estable (Puesto ${currRank + 1} de ${outOf} ${entityLabel}).` });
        }
      };

      checkColorChange(sameTypePrevStats, sameTypeCurrentStats, "totalEng", "Engagement (Global Nacional)", `Interacción en retroceso comparativo`, `Crece sostenidamente la interacción`, "Nacional");
      checkColorChange(sameTypePrevStats, sameTypeCurrentStats, "padronPercent", "Penetración (Nacional)", `Su influencia relativa desciende a nivel país`, `Mejora consistente en penetración a nivel país`, "Nacional");
      checkColorChange(prevRegion, currRegion, "totalEng", "Engagement (Regional)", `El impacto de sus interacciones disminuyó en la región`, `Mayor impacto en interacciones frente a sus pares`, "Regional");
      checkColorChange(prevRegion, currRegion, "padronPercent", "Penetración (Regional)", `Su influencia disminuyó comparado al mes anterior`, `La influencia mejoró frente al mes previo`, "Regional");
    }

    const evolutionCards: any[] = [];
    if (availablePeriods && availablePeriods.length > 0) {
      const chronologicalPeriods = [...availablePeriods].reverse();
      const histStats = chronologicalPeriods.map((p: any) => {
        const periodData = allData.filter((d: any) => `${d.mes_n}-${d.año}` === p.id);
        const stats = getGovStats(gov, periodData);
        return {
           periodId: p.id,
           periodName: p.name,
           ...stats
        };
      }).filter((s: any) => s.totalFans > 0);

      const histIdx = histStats.findIndex((s: any) => s.periodId === currentPeriodId);
      
      if (histIdx > 0) {
        const statsCurr = histStats[histIdx];
        const statsPrev = histStats[histIdx - 1];

        const addCard = (network: string, type: string, metric: string, text: string) => {
          evolutionCards.push({ network, type, metric, text });
        };

        const isRecordFans = statsCurr.totalFans >= Math.max(...histStats.map((s: any) => s.totalFans));
        const fansDiff = statsCurr.totalFans - statsPrev.totalFans;
        if (isRecordFans && statsCurr.totalFans > 0) {
          addCard("Global", "success", "Audiencia Global", "Mes récord. Alcanzó su nivel de seguidores histórico máximo.");
        } else if (fansDiff > 0) {
          addCard("Global", "success", "Audiencia Global", `Crecimiento sostenido. Sumó ${Math.round(fansDiff).toLocaleString("es-AR")} seguidores respecto al mes anterior.`);
        } else if (fansDiff < 0) {
          addCard("Global", "warning", "Audiencia Global", `Caída en seguidores. Perdió ${Math.round(Math.abs(fansDiff)).toLocaleString("es-AR")} seguidores respecto al mes anterior.`);
        }

        const isRecordEng = statsCurr.totalEng >= Math.max(...histStats.map((s: any) => s.totalEng));
        const engDiff = statsCurr.totalEng - statsPrev.totalEng;
        if (isRecordEng && statsCurr.totalEng > 0) {
          addCard("Global", "success", "Nivel de Engagement", "Mes récord de interacción. Sus publicaciones están generando el mayor impacto histórico.");
        } else if (engDiff > 0) {
          addCard("Global", "success", "Nivel de Engagement", "Mejora en la interacción promedio por posteo lograda frente al período anterior.");
        } else if (engDiff < 0) {
          addCard("Global", "warning", "Nivel de Engagement", "El impacto de interacciones generado por publicación disminuyó comparado al mes previo.");
        }

        const isRecordPubs = statsCurr.totalPubs >= Math.max(...histStats.map((s: any) => s.totalPubs));
        const pubsDiff = statsCurr.totalPubs - statsPrev.totalPubs;
        if (isRecordPubs && statsCurr.totalPubs > 0) {
          addCard("Global", "info", "Volumen de Publicaciones", "Cifra récord reportada en cantidad de publicaciones.");
        } else if (pubsDiff > 0) {
          addCard("Global", "info", "Volumen de Publicaciones", `Su actividad aumentó sumando ${pubsDiff} publicaciones más que el mes pasado.`);
        } else if (pubsDiff < 0) {
          addCard("Global", "warning", "Volumen de Publicaciones", `Publicó ${Math.abs(pubsDiff)} piezas de contenido menos que el mes previo.`);
        }

        ["FB", "IG", "TW", "TIK TOK"].forEach(net => {
           const netCurr = statsCurr.byNetwork[net];
           const netPrev = statsPrev.byNetwork[net];
           if (!netCurr || !netPrev) return;

           const isRecordNetFans = netCurr.fans >= Math.max(...histStats.map((s: any) => s.byNetwork[net]?.fans || 0));
           const netFansDiff = netCurr.fans - netPrev.fans;
           if (isRecordNetFans && netCurr.fans > 0) {
              addCard(net, "success", "Seguidores", `Récord alcanzado de su nivel histórico máximo en esta red.`);
           } else if (netFansDiff > 0) {
              addCard(net, "success", "Seguidores", `Sigue creciendo. Sumó ${Math.round(netFansDiff).toLocaleString("es-AR")} seguidores el último mes.`);
           } else if (netFansDiff < 0) {
              addCard(net, "warning", "Seguidores", `Caída en seguidores. Perdió ${Math.round(Math.abs(netFansDiff)).toLocaleString("es-AR")} seguidores.`);
           }

           const isRecordNetEng = netCurr.eng >= Math.max(...histStats.map((s: any) => s.byNetwork[net]?.eng || 0));
           const netEngDiff = netCurr.eng - netPrev.eng;
           if (isRecordNetEng && netCurr.eng > 0) {
              addCard(net, "success", "Engagement", `Mes récord de interacción en esta comunidad.`);
           } else if (netEngDiff > 0) {
              addCard(net, "success", "Engagement", `Mejora en la interacción promedio por posteo comparado al mes anterior.`);
           } else if (netEngDiff < 0) {
              addCard(net, "warning", "Engagement", `El impacto relativo de sus posteos disminuyó frente al mes previo.`);
           }
           
           const isRecordNetPubs = netCurr.pubs >= Math.max(...histStats.map((s: any) => s.byNetwork[net]?.pubs || 0));
           const netPubsDiff = netCurr.pubs - netPrev.pubs;
           if (isRecordNetPubs && netCurr.pubs > 0) {
              addCard(net, "info", "Publicaciones", `Mayor frecuencia de publicación histórica reportada en esta red.`);
           } else if (netPubsDiff > 0) {
              addCard(net, "info", "Publicaciones", `Con un aumento de ${netPubsDiff} publicaciones en este mes.`);
           } else if (netPubsDiff < 0) {
              addCard(net, "warning", "Publicaciones", `Publicó ${Math.abs(netPubsDiff)} piezas menos que el mes previo.`);
           }
        });
      }
    }

    return (
      <div key={gov} className="mb-12 border border-prosumia-gray-light rounded-2xl p-8 bg-white/50 backdrop-blur-md relative overflow-hidden">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-prosumia-red-lighter blur-3xl opacity-20 pointer-events-none"></div>
         <div className="flex items-center gap-4 mb-6 relative z-10">
           <div className="h-14 w-14 rounded-full border-4 border-white shadow-md overflow-hidden bg-prosumia-gray-lighter">
              <img src={GOBERNADORES_INFO[gov]?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(gov)}`} alt={gov} className={cn("w-full h-full", GOBERNADORES_INFO[gov]?.isGobierno ? "object-contain bg-white p-1" : "object-cover")} />
           </div>
           <div>
             <h2 className="text-2xl font-poppins font-bold tracking-tight text-prosumia-dark">{gov}</h2>
             <span className="text-sm font-semibold text-prosumia-gray">Análisis de Penetración e Interacciones • Región {curr.region}</span>
           </div>
         </div>

         <div className="prose prose-red max-w-none font-sans text-prosumia-gray leading-relaxed space-y-4 mb-8">
            <p className="text-lg">
              Durante <strong className="text-prosumia-dark capitalize">{periodName?.toLowerCase()}</strong>, sumando todas sus redes alcanza los <strong className="text-prosumia-dark">{Math.round(curr.totalFans).toLocaleString("es-AR")}</strong> seguidores. En su red de mayor alcance (<strong className={getNetworkTextColor(curr.bestNetworkFans)}>{curr.bestNetworkFans === 'TW' ? 'X' : curr.bestNetworkFans}</strong>) logra penetrar en un equivalente al <strong className="text-prosumia-dark">{curr.padronPercent.toFixed(1).replace(".", ",")}%</strong> del padrón poblacional de su provincia.
            </p>
            <p className="text-lg">
              Observando las métricas de respuesta por parte de su audiencia, el <strong>mayor nivel de interacción por posteo</strong> 
              se registró en <strong className={getNetworkTextColor(curr.bestNetworkEng)}>{curr.bestNetworkEng === 'TW' ? 'X' : curr.bestNetworkEng}</strong>, con un promedio de <strong className="text-prosumia-dark">{Math.round(curr.byNetwork[curr.bestNetworkEng].eng).toLocaleString("es-AR")} reacciones</strong> por publicación.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {["FB", "IG", "TW", "TIK TOK"].map(net => {
                const isWinner = net === curr.bestNetworkEng;
                return (
                 <div key={net} className={cn("p-5 rounded-2xl border transition-all", getNetworkStyle(net), isWinner ? "scale-105 shadow-md ring-2 ring-current ring-offset-2 z-10" : "scale-100 opacity-90")}>
                  <div className="text-sm font-black mb-3 tracking-widest uppercase">{net === "TW" ? "X" : net}</div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-current/60">Penetración</div>
                    <div className="text-lg font-bold text-current">
                       {((curr.byNetwork[net].fans / curr.padron) * 100).toFixed(1).replace(".", ",")}%
                       <span className="text-[10px] font-medium ml-1 text-current/80">({Math.round(curr.byNetwork[net].fans).toLocaleString("es-AR")})</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-current/60">Engagement</div>
                    <div className="text-lg font-bold text-current drop-shadow-sm">
                      {Math.round(curr.byNetwork[net].eng).toLocaleString("es-AR")}
                    </div>
                  </div>
                 </div>
                );
              })}
            </div>
         </div>

        {analysisCards.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-poppins font-bold text-prosumia-dark mb-4 drop-shadow-sm flex items-center gap-2">
              <Activity className="w-5 h-5 text-prosumia-red" />
              Evolución y Alertas (Mensual)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisCards.map((card, idx) => (
                <div key={idx} className={cn("p-4 rounded-xl border flex gap-3 items-start transition-all hover:shadow-md", 
                  card.type === 'warning' ? "bg-red-50/50 border-red-200" :
                  card.type === 'success' ? "bg-green-50/50 border-green-200" :
                  "bg-blue-50/50 border-blue-200"
                )}>
                    <div className={cn("p-2 rounded-lg shrink-0",
                      card.type === 'warning' ? "bg-red-100 text-red-600 border border-red-200" :
                      card.type === 'success' ? "bg-green-100 text-green-600 border border-green-200" :
                      "bg-blue-100 text-blue-600 border border-blue-200"
                  )}>
                    {card.type === 'warning' ? <TrendingDown className="w-4 h-4" /> : 
                      card.type === 'success' ? <TrendingUp className="w-4 h-4" /> :
                      <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        card.context === "Regional" ? "bg-white text-blue-700 border-blue-200" : "bg-white text-purple-700 border-purple-200"
                      )}>{card.context}</span>
                      <h4 className={cn("font-bold text-sm", 
                          card.type === 'warning' ? "text-red-900" :
                          card.type === 'success' ? "text-green-900" :
                          "text-blue-900"
                      )}>{card.metric}</h4>
                    </div>
                    <p className={cn("text-xs leading-relaxed font-medium mt-1", 
                        card.type === 'warning' ? "text-red-800/80" :
                        card.type === 'success' ? "text-green-800/80" :
                        "text-blue-800/80"
                    )}>{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {evolutionCards.length > 0 && (
          <div className="mt-8 space-y-8">
            <h3 className="text-lg font-poppins font-bold text-prosumia-dark mb-4 drop-shadow-sm flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-prosumia-red" />
              Hitos Evolutivos
            </h3>
            {["Global", "FB", "IG", "TW", "TIK TOK"].map(net => {
              const cards = evolutionCards.filter((c: any) => c.network === net);
              if (cards.length === 0) return null;
              
              const netLabel = net === "Global" ? "Análisis Global" : (net === "TW" ? "X" : net);
              
              return (
                <div key={net} className="space-y-3 pb-2 border-b border-prosumia-gray-light/30 last:border-0">
                  <h4 className={cn("text-sm font-bold uppercase tracking-widest pl-2 border-l-4", 
                    net === "Global" ? "border-prosumia-dark/30 text-prosumia-dark" : 
                    net === "FB" ? "border-[#1877F2]/50 text-[#1877F2]" :
                    net === "IG" ? "border-[#c13584]/50 text-[#c13584]" :
                    "border-black/30 text-black"
                  )}>{netLabel}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cards.map((card: any, idx: number) => (
                      <div key={idx} className={cn("p-4 rounded-xl border flex gap-3 items-start transition-all hover:shadow-sm", 
                        card.type === 'warning' ? "bg-red-50/50 border-red-200" :
                        card.type === 'success' ? "bg-green-50/50 border-green-200" :
                        "bg-blue-50/50 border-blue-200"
                      )}>
                          <div className={cn("p-2 rounded-lg shrink-0",
                            card.type === 'warning' ? "text-red-600 bg-red-100" :
                            card.type === 'success' ? "text-green-600 bg-green-100" :
                            "text-blue-600 bg-blue-100"
                        )}>
                          {card.type === 'warning' ? <TrendingDown className="w-4 h-4" /> : 
                           card.type === 'success' ? <TrendingUp className="w-4 h-4" /> :
                           <Activity className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-prosumia-dark mb-1">{card.metric}</h4>
                          <p className="text-xs leading-relaxed font-medium text-prosumia-gray line-clamp-3">{card.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const isMultiple = selectedGovs.length > 1;

  const renderComparison = () => {
    if (!isMultiple) return null;
    
    // Compare the selected Govs overall metrics.
    const selectedStats = selectedGovs.map((gov: string) => allCurrentStats.find(s => s.gov === gov)).filter(Boolean) as any[];
    
    const maxFansGov = [...selectedStats].sort((a,b) => b.totalFans - a.totalFans)[0];
    const maxEngGov = [...selectedStats].sort((a,b) => b.totalEng - a.totalEng)[0];
    const maxPubsGov = [...selectedStats].sort((a,b) => b.totalPubs - a.totalPubs)[0];

    return (
      <div className="mb-12 border-2 border-prosumia-red/20 bg-prosumia-red/5 rounded-2xl p-8 relative overflow-hidden">
        <h2 className="text-2xl font-poppins font-bold tracking-tight text-prosumia-dark mb-4 flex items-center gap-3">
          <Users className="w-6 h-6 text-prosumia-red" />
          Análisis Comparativo Directo
        </h2>
        <p className="text-prosumia-gray font-medium mb-6">
          Evaluando {selectedGovs.length} gobernadores de forma conjunta: {selectedGovs.join(", ")}.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl border border-prosumia-red/10 shadow-sm flex flex-col items-center text-center">
             <div className="text-sm font-bold text-prosumia-gray uppercase tracking-widest mb-2">Mayor Alcance (Seguidores)</div>
             <img src={GOBERNADORES_INFO[maxFansGov.gov]?.image} className={cn("w-16 h-16 rounded-full mb-3 shadow-md bg-white", GOBERNADORES_INFO[maxFansGov.gov]?.isGobierno ? "object-contain p-2" : "object-cover")} />
             <div className="font-poppins font-bold text-lg text-prosumia-dark">{maxFansGov.gov}</div>
             <div className="text-prosumia-red font-bold text-xl">{Math.round(maxFansGov.totalFans).toLocaleString("es-AR")}</div>
           </div>
           
           <div className="bg-white p-6 rounded-xl border border-prosumia-red/10 shadow-sm flex flex-col items-center text-center">
             <div className="text-sm font-bold text-prosumia-gray uppercase tracking-widest mb-2">Más Actividad (Posteos)</div>
             <img src={GOBERNADORES_INFO[maxPubsGov.gov]?.image} className={cn("w-16 h-16 rounded-full mb-3 shadow-md bg-white", GOBERNADORES_INFO[maxPubsGov.gov]?.isGobierno ? "object-contain p-2" : "object-cover")} />
             <div className="font-poppins font-bold text-lg text-prosumia-dark">{maxPubsGov.gov}</div>
             <div className="text-prosumia-red font-bold text-xl">{Math.round(maxPubsGov.totalPubs).toLocaleString("es-AR")} <span className="text-sm text-prosumia-gray font-sans">posts</span></div>
           </div>

           <div className="bg-white p-6 rounded-xl border border-prosumia-red/10 shadow-sm flex flex-col items-center text-center">
             <div className="text-sm font-bold text-prosumia-gray uppercase tracking-widest mb-2">Mejor Engagement</div>
             <img src={GOBERNADORES_INFO[maxEngGov.gov]?.image} className={cn("w-16 h-16 rounded-full mb-3 shadow-md bg-white", GOBERNADORES_INFO[maxEngGov.gov]?.isGobierno ? "object-contain p-2" : "object-cover")} />
             <div className="font-poppins font-bold text-lg text-prosumia-dark">{maxEngGov.gov}</div>
             <div className="text-prosumia-red font-bold text-xl">{Math.round(maxEngGov.totalEng).toLocaleString("es-AR")} <span className="text-sm text-prosumia-gray font-sans">reac/post</span></div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-12 space-y-6">
       {renderComparison()}
       {selectedGovs.map((gov: string) => renderGovAnalysis(gov))}
    </div>
  );
}
