import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Location } from '../../models/locations/location.models';
import { runtimeEnvConfig } from '../../config/runtime-env';

@Injectable({
  providedIn: 'root',
})
export class LocationsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = runtimeEnvConfig.apiBaseUrl;

  getLocations(search = '') {
    return firstValueFrom(
      this.http.get<Location[]>(`${this.apiBaseUrl}/locations`, {
        params: {
          search,
        },
      }),
    );
  }
}
