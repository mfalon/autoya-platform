// ============================================================
// AutoYa — Inventario de Vehículos (Sprint 1 — datos locales)
// precio_ars: INTEGER — nunca float, nunca USD
// ============================================================

export type BodyType = 'sedan' | 'hatchback' | 'suv' | 'pickup';
export type FuelType = 'Nafta' | 'Diesel' | 'Eléctrico' | 'Híbrido';
export type Condition = '0km' | 'Usado';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  condition: Condition;
  km: number;            // 0 si es 0km
  body_type: BodyType;
  fuel_type: FuelType;
  precio_ars: number;    // INTEGER — pesos argentinos
  precio_piso_ars: number; // INTEGER — precio mínimo de venta (piso)
  color: string;
  estado?: 'disponible' | 'reservado' | 'vendido';
  specs: {
    power_cv: number;
    acceleration: string;
    top_speed: string;
    autonomy: string;
  };
  image: string;
  featured: boolean;
}

export const VEHICLES: Vehicle[] = [
  // ── SEDANES ──────────────────────────────────────
  {
    id: 'toyota-corolla-xei-2024',
    brand: 'Toyota',
    model: 'Corolla',
    version: 'XEI 2.0 CVT',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'sedan',
    fuel_type: 'Nafta',
    precio_ars: 38_500_000,
    precio_piso_ars: 34_650_000,
    color: 'Blanco Perlado',
    specs: { power_cv: 170, acceleration: '9,2s', top_speed: '205 km/h', autonomy: '580 km' },
    image: '/cars/sedan.png',
    featured: true,
  },
  {
    id: 'fiat-cronos-drive-2024',
    brand: 'Fiat',
    model: 'Cronos',
    version: 'Drive 1.3 GSE',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'sedan',
    fuel_type: 'Nafta',
    precio_ars: 19_500_000,
    precio_piso_ars: 17_550_000,
    color: 'Blanco Banchisa',
    specs: { power_cv: 109, acceleration: '10,8s', top_speed: '185 km/h', autonomy: '620 km' },
    image: '/cars/sedan.png',
    featured: false,
  },
  {
    id: 'vw-vento-highline-2023',
    brand: 'Volkswagen',
    model: 'Vento',
    version: 'Highline 1.4 TSI',
    year: 2023,
    condition: 'Usado',
    km: 18_000,
    body_type: 'sedan',
    fuel_type: 'Nafta',
    precio_ars: 27_000_000,
    precio_piso_ars: 24_300_000,
    color: 'Plata Metalizado',
    specs: { power_cv: 150, acceleration: '9,6s', top_speed: '200 km/h', autonomy: '600 km' },
    image: '/cars/sedan.png',
    featured: false,
  },

  // ── HATCHBACKS ────────────────────────────────────
  {
    id: 'vw-polo-track-2024',
    brand: 'Volkswagen',
    model: 'Polo',
    version: 'Track 1.6 MSI',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'hatchback',
    fuel_type: 'Nafta',
    precio_ars: 22_000_000,
    precio_piso_ars: 19_800_000,
    color: 'Blanco Candy',
    specs: { power_cv: 110, acceleration: '11,2s', top_speed: '175 km/h', autonomy: '560 km' },
    image: '/cars/hatchback.png',
    featured: true,
  },
  {
    id: 'chevrolet-onix-lt-2024',
    brand: 'Chevrolet',
    model: 'Onix',
    version: 'LT 1.0 Turbo',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'hatchback',
    fuel_type: 'Nafta',
    precio_ars: 22_500_000,
    precio_piso_ars: 20_250_000,
    color: 'Rojo Cajun',
    specs: { power_cv: 100, acceleration: '10,5s', top_speed: '178 km/h', autonomy: '540 km' },
    image: '/cars/hatchback.png',
    featured: false,
  },
  {
    id: 'peugeot-208-active-2024',
    brand: 'Peugeot',
    model: '208',
    version: 'Active 1.6 VTi',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'hatchback',
    fuel_type: 'Nafta',
    precio_ars: 24_000_000,
    precio_piso_ars: 21_600_000,
    color: 'Azul Vertigo',
    specs: { power_cv: 115, acceleration: '10,2s', top_speed: '185 km/h', autonomy: '520 km' },
    image: '/cars/hatchback.png',
    featured: false,
  },

  // ── SUVs / CROSSOVERS ─────────────────────────────
  {
    id: 'chevrolet-tracker-premier-2024',
    brand: 'Chevrolet',
    model: 'Tracker',
    version: 'Premier 1.2T AT',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'suv',
    fuel_type: 'Nafta',
    precio_ars: 33_000_000,
    precio_piso_ars: 29_700_000,
    color: 'Gris Satin',
    specs: { power_cv: 133, acceleration: '9,6s', top_speed: '190 km/h', autonomy: '530 km' },
    image: '/cars/suv.png',
    featured: true,
  },
  {
    id: 'renault-duster-intens-2024',
    brand: 'Renault',
    model: 'Duster',
    version: 'Intens 1.6 CVT 4x2',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'suv',
    fuel_type: 'Nafta',
    precio_ars: 28_500_000,
    precio_piso_ars: 25_650_000,
    color: 'Naranja Dune',
    specs: { power_cv: 115, acceleration: '11,5s', top_speed: '175 km/h', autonomy: '600 km' },
    image: '/cars/suv.png',
    featured: false,
  },
  {
    id: 'vw-taos-comfortline-2024',
    brand: 'Volkswagen',
    model: 'Taos',
    version: 'Comfortline 1.4 TSI',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'suv',
    fuel_type: 'Nafta',
    precio_ars: 37_500_000,
    precio_piso_ars: 33_750_000,
    color: 'Azul Lapiz',
    specs: { power_cv: 150, acceleration: '9,1s', top_speed: '200 km/h', autonomy: '560 km' },
    image: '/cars/suv.png',
    featured: false,
  },

  // ── PICKUPS ───────────────────────────────────────
  {
    id: 'toyota-hilux-sr-2024',
    brand: 'Toyota',
    model: 'Hilux',
    version: 'SR 2.8 TDi 4x4 AT',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'pickup',
    fuel_type: 'Diesel',
    precio_ars: 55_000_000,
    precio_piso_ars: 49_500_000,
    color: 'Blanco Perlado',
    specs: { power_cv: 204, acceleration: '11,8s', top_speed: '175 km/h', autonomy: '900 km' },
    image: '/cars/pickup.png',
    featured: true,
  },
  {
    id: 'ford-ranger-xls-2024',
    brand: 'Ford',
    model: 'Ranger',
    version: 'XLS 3.2 TDCi 4x4 AT',
    year: 2024,
    condition: '0km',
    km: 0,
    body_type: 'pickup',
    fuel_type: 'Diesel',
    precio_ars: 57_000_000,
    precio_piso_ars: 51_300_000,
    color: 'Gris Magnetic',
    specs: { power_cv: 200, acceleration: '12,0s', top_speed: '170 km/h', autonomy: '850 km' },
    image: '/cars/pickup.png',
    featured: false,
  },
];
