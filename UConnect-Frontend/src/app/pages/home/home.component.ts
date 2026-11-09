import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AnnouncementsApiService } from '../../core/services/announcements/announcements-api.service';
import { LocationsApiService } from '../../core/services/locations/locations-api.service';
import type { Announcement } from '../../core/models/announcements/announcement.models';
import type { Location } from '../../core/models/locations/location.models';

@Component({
  selector: 'app-home',
  imports: [CommonModule, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly announcementsApi = inject(AnnouncementsApiService);
  private readonly locationsApi = inject(LocationsApiService);

  protected readonly announcements = signal<Announcement[]>([]);
  protected readonly locations = signal<Location[]>([]);
  protected readonly loading = signal(false);

  protected readonly highPriorityCount = computed(
    () =>
      this.announcements().filter((item) => item.priority === 'HIGH' || item.priority === 'URGENT')
        .length,
  );

  protected readonly collegeCount = computed(
    () => this.locations().filter((location) => location.category === 'College').length,
  );

  async ngOnInit() {
    this.loading.set(true);
    try {
      const [items, locations] = await Promise.all([
        this.announcementsApi.getAnnouncements(false),
        this.locationsApi.getLocations(''),
      ]);

      this.announcements.set(items);
      this.locations.set(locations);
    } finally {
      this.loading.set(false);
    }
  }
}
