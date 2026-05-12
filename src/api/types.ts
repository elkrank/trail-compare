export type IsoDateString = `${number}-${number}-${number}`;
export type TerrainType = 'MOUNTAIN' | 'FOREST' | 'MIXED' | 'ROAD' | 'DESERT';
export type TechnicalityLevel = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

export interface RaceDto {
  id: string;
  name: string;
  location: string;
  region: string;
  date: IsoDateString;
  distanceKm: number;
  elevationGainM: number;
  terrainType: TerrainType;
  technicalityLevel: TechnicalityLevel;
  cutoffTimeMinutes: number;
  lastFinisherTimeMinutes: number;
  medianFinisherTimeMinutes: number;
  aidStationsCount: number;
  priceEur: number;
  description: string;
  tags: string[];
  sourceUrl?: string;
  isCancelled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RaceListResponseDto {
  items: RaceDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SpringPageResponseDto<T> {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
}

export interface RaceFiltersDto {
  region?: string;
  terrain?: string;
  minDistance?: number;
  maxDistance?: number;
  minDate?: IsoDateString;
  maxDate?: IsoDateString;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateRaceDto {
  name: string;
  location: string;
  region: string;
  date: IsoDateString;
  distanceKm: number;
  elevationGainM: number;
  terrainType: TerrainType;
  technicalityLevel: TechnicalityLevel;
  cutoffTimeMinutes: number;
  lastFinisherTimeMinutes: number;
  medianFinisherTimeMinutes: number;
  aidStationsCount: number;
  priceEur: number;
  description: string;
  tags: string[];
  sourceUrl?: string;
}

export interface UpdateRaceDto {
  name?: string;
  location?: string;
  region?: string;
  date?: IsoDateString;
  distanceKm?: number;
  elevationGainM?: number;
  terrainType?: TerrainType;
  technicalityLevel?: TechnicalityLevel;
  cutoffTimeMinutes?: number;
  lastFinisherTimeMinutes?: number;
  medianFinisherTimeMinutes?: number;
  aidStationsCount?: number;
  priceEur?: number;
  description?: string;
  tags?: string[];
  sourceUrl?: string;
  isCancelled?: boolean;
}

export interface AdminLoginRequestDto { username: string; password: string; }
export interface AdminLoginResponseDto { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number; }
export interface AdminRefreshRequestDto { refreshToken: string; }
export interface AdminRefreshResponseDto { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number; }
