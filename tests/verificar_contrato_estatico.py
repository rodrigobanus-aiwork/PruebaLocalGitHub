#!/usr/bin/env python3
"""Comprobaciones iniciales de texto y datos sin cambiar archivos.
No reemplaza la compilación de TypeScript ni las pruebas de navegador.
Ejemplo: python tests/verificar_contrato_estatico.py
"""
from pathlib import Path
import csv, sys

root = Path(__file__).resolve().parents[1]
dashboard = root / 'src/components/Dashboard.tsx'
legacy = root / 'public/data.csv'
mega = root / 'public/mega_metricas.csv'
errors = []
warnings = []

def check(condition, description):
    (print('[OK] ' if condition else '[ERROR] ') + description) if False else print(('[OK] ' if condition else '[ERROR] ') + description)
    if not condition: errors.append(description)

if not dashboard.exists():
    warnings.append('Dashboard.tsx ausente: se ejecuta solo al incorporar contrato a la raíz del proyecto.')
else:
    code = dashboard.read_text(encoding='utf-8-sig')
    for token in ['function EvolutivosView', 'LineChart', 'RankingCard', 'ProgressBar', 'LecturaView', 'ComparacionView', 'selectedGovs', 'showHistorical', 'calculationMode', 'seriesPanelOpen']:
        check(token in code, 'Componente/control presente: ' + token)
    for label in ['Penetración Padrón', 'Engagement / Post', 'Impacto Padrón']:
        check(label in code,'Métrica histórica visible en fuente: ' + label)
if not legacy.exists():
    warnings.append('No se encontró public/data.csv')
else:
    with legacy.open(encoding='utf-8-sig',newline='') as f:
        fields = next(csv.reader(f,delimiter=';'),[])
    check(fields in (["año","Período","mes_n","RRSS","Gobernador","Atributo","Valor","Provincia","tipo"],["año","Periodo","mes_n","RRSS","Gobernador","Atributo","Valor","Provincia","tipo"]), 'Esquema histórico de nueve columnas (Período/Periodo)')
if mega.exists():
    with mega.open(encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f,delimiter=';');fields=reader.fieldnames or [];rows=list(reader)
    check(fields==['Año','Mes','Mes_num','Red','Entidad','Métrica','Valor','Provincia','Categoría'],'Esquema V4 de nueve columnas')
    categories={r['Categoría'] for r in rows}
    check(categories=={'Detractor','Municipio','Intendente','Ministro provincial','Figuras nacionales','Ministerio provincial'},'Seis categorías originales del megaarchivo')
    print(f'[INFO] Filas en V4: {len(rows)} (la referencia aportada tenía 8503)')
else:
    warnings.append('No se encontró public/mega_metricas.csv; puede ser normal antes de incorporar V4')
for w in warnings: print('[AVISO]',w)
print('Resultado:',len(errors),'errores en controles estáticos; NO certifica funcionamiento ni equivalencia visual.')
sys.exit(1 if errors else 0)
