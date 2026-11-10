/**
 * Realistic API Fixtures for Unit Testing and Separated Development Mode.
 *
 * NOTE: These fixtures are strictly for automated unit tests, build validation,
 * and developer offline testing. In production, AirScope India NEVER presents
 * test fixtures as live readings; if upstream APIs or credentials are unavailable,
 * an explicit "Service Offline / Live API Key Required" state is rendered.
 */

export interface CPCBRecordFixture {
  id: number;
  country: string;
  state: string;
  city: string;
  station: string;
  last_update: string; // "DD-MM-YYYY HH:MM:SS"
  pollutant_id: string; // "PM2.5" | "PM10" | "NO2" | "SO2" | "CO" | "OZONE" | "NH3"
  pollutant_min: number;
  pollutant_max: number;
  pollutant_avg: number;
  pollutant_unit: string;
  latitude?: number;
  longitude?: number;
}

export const CPCB_SAMPLE_RECORDS: CPCBRecordFixture[] = [
  // Anand Vihar, Delhi
  {
    id: 101,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Anand Vihar, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM2.5',
    pollutant_min: 180,
    pollutant_max: 340,
    pollutant_avg: 265,
    pollutant_unit: 'µg/m3',
    latitude: 28.6468,
    longitude: 77.3160,
  },
  {
    id: 102,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Anand Vihar, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM10',
    pollutant_min: 220,
    pollutant_max: 460,
    pollutant_avg: 385,
    pollutant_unit: 'µg/m3',
  },
  {
    id: 103,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Anand Vihar, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'NO2',
    pollutant_min: 45,
    pollutant_max: 120,
    pollutant_avg: 82,
    pollutant_unit: 'µg/m3',
  },
  {
    id: 104,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Anand Vihar, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'CO',
    pollutant_min: 1.2,
    pollutant_max: 3.5,
    pollutant_avg: 2.3,
    pollutant_unit: 'mg/m3',
  },
  {
    id: 105,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Anand Vihar, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'OZONE',
    pollutant_min: 20,
    pollutant_max: 65,
    pollutant_avg: 42,
    pollutant_unit: 'µg/m3',
  },

  // Dwarka Sector 8, Delhi
  {
    id: 106,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Dwarka-Sector 8, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM2.5',
    pollutant_min: 85,
    pollutant_max: 170,
    pollutant_avg: 135,
    pollutant_unit: 'µg/m3',
    latitude: 28.5766,
    longitude: 77.0766,
  },
  {
    id: 107,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Dwarka-Sector 8, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM10',
    pollutant_min: 140,
    pollutant_max: 280,
    pollutant_avg: 215,
    pollutant_unit: 'µg/m3',
  },
  {
    id: 108,
    country: 'India',
    state: 'Delhi',
    city: 'Delhi',
    station: 'Dwarka-Sector 8, Delhi - DPCC',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'NO2',
    pollutant_min: 30,
    pollutant_max: 75,
    pollutant_avg: 48,
    pollutant_unit: 'µg/m3',
  },

  // Sector 62 Noida
  {
    id: 109,
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Noida',
    station: 'Sector-62, Noida - IMD',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM2.5',
    pollutant_min: 110,
    pollutant_max: 220,
    pollutant_avg: 175,
    pollutant_unit: 'µg/m3',
  },
  {
    id: 110,
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Noida',
    station: 'Sector-62, Noida - IMD',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM10',
    pollutant_min: 190,
    pollutant_max: 330,
    pollutant_avg: 260,
    pollutant_unit: 'µg/m3',
  },

  // Vikas Sadan, Gurugram
  {
    id: 111,
    country: 'India',
    state: 'Haryana',
    city: 'Gurugram',
    station: 'Vikas Sadan, Gurugram - HSPCB',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM2.5',
    pollutant_min: 95,
    pollutant_max: 195,
    pollutant_avg: 152,
    pollutant_unit: 'µg/m3',
  },
  {
    id: 112,
    country: 'India',
    state: 'Haryana',
    city: 'Gurugram',
    station: 'Vikas Sadan, Gurugram - HSPCB',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM10',
    pollutant_min: 160,
    pollutant_max: 290,
    pollutant_avg: 230,
    pollutant_unit: 'µg/m3',
  },

  // Vasundhara, Ghaziabad
  {
    id: 113,
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Ghaziabad',
    station: 'Vasundhara, Ghaziabad - UPPCB',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM2.5',
    pollutant_min: 170,
    pollutant_max: 310,
    pollutant_avg: 245,
    pollutant_unit: 'µg/m3',
  },
  {
    id: 114,
    country: 'India',
    state: 'Uttar Pradesh',
    city: 'Ghaziabad',
    station: 'Vasundhara, Ghaziabad - UPPCB',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM10',
    pollutant_min: 240,
    pollutant_max: 410,
    pollutant_avg: 340,
    pollutant_unit: 'µg/m3',
  },

  // Sector-16A, Faridabad
  {
    id: 115,
    country: 'India',
    state: 'Haryana',
    city: 'Faridabad',
    station: 'Sector 16A, Faridabad - HSPCB',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM2.5',
    pollutant_min: 120,
    pollutant_max: 240,
    pollutant_avg: 182,
    pollutant_unit: 'µg/m3',
  },
  {
    id: 116,
    country: 'India',
    state: 'Haryana',
    city: 'Faridabad',
    station: 'Sector 16A, Faridabad - HSPCB',
    last_update: '10-11-2026 14:00:00',
    pollutant_id: 'PM10',
    pollutant_min: 180,
    pollutant_max: 310,
    pollutant_avg: 250,
    pollutant_unit: 'µg/m3',
  },
];
