export type IsoDateString = `${number}-${number}-${number}`;

export interface RaceDto {
  id: string;
  name: string;
  location: string;
  date: IsoDateString;
  distanceKm: number;
  elevationGainM: number;
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
  date: IsoDateString;
  distanceKm: number;
  elevationGainM: number;
}

export interface UpdateRaceDto {
  name?: string;
  location?: string;
  date?: IsoDateString;
  distanceKm?: number;
  elevationGainM?: number;
  isCancelled?: boolean;
}

export interface AdminLoginRequestDto { username: string; password: string; }
export interface AdminLoginResponseDto { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number; }
export interface AdminRefreshRequestDto { refreshToken: string; }
export interface AdminRefreshResponseDto { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number; }
