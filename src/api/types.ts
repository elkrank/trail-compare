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
  gpxUrl?: string;
  gpxFileUrl?: string;
  hasGpx?: boolean;
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

export interface CreateRaceWithGpxPayload extends CreateRaceDto {
  gpxFile?: File;
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

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminRefreshRequest {
  refreshToken: string;
}

export interface AdminTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
}

export interface ApiErrorResponse {
  message?: string;
  details?: unknown;
}
