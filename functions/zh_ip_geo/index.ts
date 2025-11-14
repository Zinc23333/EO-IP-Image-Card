import mainProvince from '@/lib/translate/main_province.json'
import mainCities from '@/lib/translate/main_cities.json'
import otherRegions from '@/lib/translate/other_regions.json'

export function onRequest({ request }: { request: EORequest }) {
  const eo = request.eo;
  let name = "";

  if (eo.geo.countryCodeAlpha2 === "CN") {
    const provinceCode = eo.geo.regionCode.substring(3);
    name += mainProvince[provinceCode];
    if (provinceCode) {
        name += mainCities[provinceCode][eo.geo.cityName];
    }
  } else {
    name += otherRegions[eo.geo.countryCodeAlpha2];
  }

  return new Response(name);
}