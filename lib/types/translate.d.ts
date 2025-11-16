interface MainCities {
  [provinceCode: string]: {
    [cityEnglish: string]: string; // cityChinese
  };
}

interface MainProvinces {
  [provinceCode: string]: string; // provinceChinese
}

interface OtherRegions {
  [countryCode: string]: string; // countryChinese
}

declare module '@/lib/translate/main_cities.json' {
  const value: MainCities;
  export default value;
}

declare module '@/lib/translate/main_provinces.json' {
  const value: MainProvinces;
  export default value;
}

declare module '@/lib/translate/other_regions.json' {
  const value: OtherRegions;
  export default value;
}