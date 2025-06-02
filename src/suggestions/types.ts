export interface GeonamesCity {
  toponymName: string;
  adminName1: string;
  countryCode: string;
  lat: string;
  lng: string;
  name: string;
}

export interface GeonamesResponse {
  geonames: GeonamesCity[];
}

export interface CitySuggestion {
  name: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  fullLabel: string;
} 