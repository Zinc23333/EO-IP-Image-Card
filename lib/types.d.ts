interface MainProvince {
  [provinceCode: string]: string;
}

interface MainCities {
  [provinceCode: string]: {
    [cityEnglish: string]: string;
  };
}

interface OtherRegions {
  [regionCode: string]: string;
}

declare module '@/lib/translate/main_province.json' {
  const value: MainProvince;
  export default value;
}

declare module '@/lib/translate/main_cities.json' {
  const value: MainCities;
  export default value;
}

declare module '@/lib/translate/other_regions.json' {
  const value: OtherRegions;
  export default value;
}
