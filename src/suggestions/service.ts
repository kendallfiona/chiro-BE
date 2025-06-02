import axios from 'axios';
import { GeonamesCity, GeonamesResponse, CitySuggestion } from './types';

export class CityService {
  static async getCitySuggestions(query: string): Promise<CitySuggestion[]> {
    const geonamesUsername = process.env.GEONAMES_USERNAME;
    if (!geonamesUsername) {
      throw new Error("GEONAMES_USERNAME environment variable not set.");
    }

    const response = await axios.get<GeonamesResponse>(
      `http://api.geonames.org/searchJSON?name_startsWith=${query}&featureClass=P&featureCode=PPL&featureCode=PPLA&featureCode=PPLA2&featureCode=PPLC&maxRows=5&orderby=relevance&username=${geonamesUsername}`
    );

    return response.data.geonames.map((city: GeonamesCity) => ({
      name: city.toponymName,
      state: city.adminName1,
      country: city.countryCode,
      coordinates: { lat: parseFloat(city.lat), lon: parseFloat(city.lng) },
      fullLabel: `${city.name}, ${city.adminName1}, ${city.countryCode}`,
    }));
  }
} 