import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  Announcement,
  AnnouncementPayload,
} from '../../models/announcements/announcement.models';
import { runtimeEnvConfig } from '../../config/runtime-env';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = runtimeEnvConfig.apiBaseUrl;

  getAnnouncements(includeInactive = false) {
    return firstValueFrom(
      this.http.get<Announcement[]>(`${this.apiBaseUrl}/announcements`, {
        params: {
          includeInactive: String(includeInactive),
        },
      }),
    );
  }

  validateAdminKey(adminKey: string) {
    return firstValueFrom(
      this.http.get<{ ok: true }>(`${this.apiBaseUrl}/admin/auth`, {
        headers: new HttpHeaders({ 'x-admin-key': adminKey }),
      }),
    );
  }

  createAnnouncement(adminKey: string, payload: AnnouncementPayload) {
    return firstValueFrom(
      this.http.post<Announcement>(`${this.apiBaseUrl}/admin/announcements`, payload, {
        headers: new HttpHeaders({ 'x-admin-key': adminKey }),
      }),
    );
  }

  updateAnnouncement(adminKey: string, id: number, payload: AnnouncementPayload) {
    return firstValueFrom(
      this.http.put<Announcement>(`${this.apiBaseUrl}/admin/announcements/${id}`, payload, {
        headers: new HttpHeaders({ 'x-admin-key': adminKey }),
      }),
    );
  }

  deleteAnnouncement(adminKey: string, id: number) {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiBaseUrl}/admin/announcements/${id}`, {
        headers: new HttpHeaders({ 'x-admin-key': adminKey }),
      }),
    );
  }
}
