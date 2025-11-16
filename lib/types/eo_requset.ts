interface EORequest extends Request {
  eo: {
    geo: {
      asn: number;
      countryName: string;
      countryCodeAlpha2: string;
      countryCodeAlpha3: string;
      countryCodeNumeric: string;
      regionName: string;
      regionCode: string;
      cityName: string;
      latitude: number;
      longitude: number;
      cisp: string;
    };
    uuid: string;
    clientIp: string;
  };
}