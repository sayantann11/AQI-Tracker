import { StationMeasurement, CitySummary, AQIApiResponse } from '@/types/aqi';

export interface ProviderAttribution {
  dataset: string;
  organization: string;
  license: string;
  licenseUrl: string;
  datasetUrl: string;
}

export interface AQIDataProvider {
  readonly id: string;
  readonly name: string;
  readonly attribution: ProviderAttribution;
  fetchStations(): Promise<StationMeasurement[]>;
  isConfigured(): boolean;
}
