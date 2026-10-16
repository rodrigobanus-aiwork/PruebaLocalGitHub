/** Catálogo verificado contra mega_metricas.csv. No modificar rutas en las vistas. */
export const ENTITY_PHOTOS: Record<string, string> = {
  "Figuras nacionales\u001fCristina Kirchner": "figuras-nacionales--cristina-kirchner.png",
  "Figuras nacionales\u001fJavier Milei": "figuras-nacionales--javier-milei.png",
  "Figuras nacionales\u001fMauricio Macri": "figuras-nacionales--mauricio-macri.png",
  "Figuras nacionales\u001fMyriam Bregman": "figuras-nacionales--myriam-bregman.png",
  "Figuras nacionales\u001fPatricia Bullrich": "figuras-nacionales--patricia-bullrich.png",
  "Figuras nacionales\u001fSergio Massa": "figuras-nacionales--sergio-massa.png",
  "Figuras nacionales\u001fVictoria Villarruel": "figuras-nacionales--victoria-villarruel.png",
  "Intendente\u001fAdrian Maderna": "intendente--adrian-maderna.png",
  "Intendente\u001fAdrián Dario Maderna": "intendente--adrian-maderna.png",
  "Intendente\u001fArmando Molina": "intendente--armando-molina.png",
  "Intendente\u001fDamián Biss": "intendente--damian-biss.png",
  "Intendente\u001fDaniel Passerini": "intendente--daniel-passerini.png",
  "Intendente\u001fGustavo Saadi": "intendente--gustavo-saadi.png",
  "Intendente\u001fGustavo_Saadi": "intendente--gustavo-saadi.png",
  "Intendente\u001fJuan Pablo Luque": "intendente--juan-pablo-luque.png",
  "Intendente\u001fRossana Chahla": "intendente--rossana-chahla.png",
  "Intendente\u001fSusana Zenteno": "intendente--susana-zenteno.png",
  "Ministerio provincial\u001fMinisterio de Gobierno, Seguridad y Justicia de Catamarca": "ministerio-provincial--ministerio-de-gobierno-seguridad-y-justicia-de-catamarca.png",
  "Municipio\u001fMunicipalidad Comodoro": "municipio--municipalidad-de-comodoro-rivadavia.png",
  "Municipio\u001fMunicipalidad Comodoro Rivadavia": "municipio--municipalidad-de-comodoro-rivadavia.png",
  "Municipio\u001fMunicipalidad Trelew": "municipio--municipalidad-de-trelew.png",
  "Municipio\u001fMunicipalidad de Esquel": "municipio--municipalidad-de-esquel.png",
  "Municipio\u001fMunicipalidad de Puerto Madryn": "municipio--municipalidad-de-puerto-madryn.png",
  "Municipio\u001fMunicipalidad de Rawson": "municipio--municipalidad-de-rawson.png",
  "Municipio\u001fMunicipalidad de Salta": "municipio--municipalidad-de-salta.png",
  "Municipio\u001fMunicipalidad de San Miguel de Tucumán": "municipio--municipalidad-de-san-miguel-de-tucuman.png",
  "Municipio\u001fMunicipalidad de Trelew": "municipio--municipalidad-de-trelew.png",
  "Municipio\u001fMunicipalidad de la Ciudad de Salta": "municipio--municipalidad-de-salta.png",
  "Municipio\u001fMunicipio Capital de La Rioja": "municipio--municipio-capital-de-la-rioja.png",
};
export function entityPhoto(category:string, entity:string): string | undefined {
  const name = ENTITY_PHOTOS[category + "\u001f" + entity];
  return name ? `${import.meta.env.BASE_URL}imagenes/${name}` : undefined;
}
