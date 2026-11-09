import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { LocationsApiService } from '../../core/services/locations/locations-api.service';
import type { Location } from '../../core/models/locations/location.models';

type CollegeCampusInfo = {
  campus: 'Main Campus' | 'Paseo del Rio Campus' | 'Rodolfo N. Pelaez Campus';
  source: string;
  verified: boolean;
  precision: 'Building-level' | 'Campus-level';
};

const CAMPUS_CENTER: L.LatLngExpression = [8.4856639, 124.6392658];
const CAMPUS_BOUNDS = L.latLngBounds([8.4845944, 124.6386066], [8.4872496, 124.6400191]);

const COLLEGE_CAMPUS_INFO: Record<string, CollegeCampusInfo> = {
  CAS: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  SBMA: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  CRIM: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  CIT: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  LAW: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  COM: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  HM: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  LIB: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  OSA: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  GYM: {
    campus: 'Main Campus',
    source: 'OpenStreetMap (LDCU Gym)',
    verified: true,
    precision: 'Building-level',
  },
  REG: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  ADM: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  ACC: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  MIS: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  PRS: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
  LIBG: {
    campus: 'Main Campus',
    source: 'Liceo official phone directory',
    verified: true,
    precision: 'Campus-level',
  },
};

const VERIFIED_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Coordinates are manually aligned to the visible OSM campus landmarks.
  // This avoids pseudo-random pin placement and keeps each code anchored to a stable point.
  ACC: { lat: 8.48546, lng: 124.63909 },
  ADM: { lat: 8.48573, lng: 124.63928 },
  CAS: { lat: 8.48566, lng: 124.63958 },
  CIT: { lat: 8.48597, lng: 124.63945 },
  COM: { lat: 8.48614, lng: 124.63962 },
  CRIM: { lat: 8.48622, lng: 124.63912 },
  GYM: { lat: 8.4853762, lng: 124.6389618 },
  HM: { lat: 8.48571, lng: 124.63969 },
  LAW: { lat: 8.48631, lng: 124.63933 },
  LIB: { lat: 8.48578, lng: 124.63948 },
  LIBG: { lat: 8.48641, lng: 124.63929 },
  MIS: { lat: 8.48598, lng: 124.63904 },
  OSA: { lat: 8.48562, lng: 124.63924 },
  PRS: { lat: 8.48558, lng: 124.63914 },
  REG: { lat: 8.48584, lng: 124.63912 },
  ROD: { lat: 8.48568, lng: 124.63917 },
  SBMA: { lat: 8.48552, lng: 124.63953 },
};

@Component({
  selector: 'app-map',
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly locationsApi = inject(LocationsApiService);

  @ViewChild('mapContainer', { static: false })
  private mapContainer?: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private markerLayer?: L.LayerGroup;

  protected readonly locations = signal<Location[]>([]);
  protected readonly search = signal('');
  protected readonly selectedCategory = signal('All');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly loading = signal(false);

  protected readonly categories = computed(() => {
    const values = new Set(this.locations().map((location) => location.category));
    return ['All', ...Array.from(values).sort()];
  });

  protected readonly filteredLocations = computed(() => {
    const token = this.search().toLowerCase().trim();
    const category = this.selectedCategory();

    return this.locations().filter((location) => {
      const matchesCategory = category === 'All' || location.category === category;
      const matchesSearch =
        !token ||
        location.name.toLowerCase().includes(token) ||
        location.description.toLowerCase().includes(token) ||
        location.code.toLowerCase().includes(token) ||
        location.category.toLowerCase().includes(token);

      return matchesCategory && matchesSearch;
    });
  });

  protected readonly selectedLocation = computed(() => {
    const currentId = this.selectedId();
    if (!currentId) {
      return null;
    }

    return this.filteredLocations().find((item) => item.id === currentId) ?? null;
  });

  protected readonly selectedLocationCampusInfo = computed(() => {
    const location = this.selectedLocation();
    if (!location) {
      return null;
    }

    return COLLEGE_CAMPUS_INFO[location.code] ?? null;
  });

  constructor() {
    effect(() => {
      this.filteredLocations();
      this.selectedId();
      this.renderPins();
    });
  }

  async ngOnInit() {
    this.loading.set(true);
    try {
      const locations = await this.locationsApi.getLocations('');
      this.locations.set(locations);
      if (locations.length > 0) {
        this.selectedId.set(locations[0].id);
      }
    } finally {
      this.loading.set(false);
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
    const selectedId = this.selectedId();
    if (selectedId) {
      this.focusOnLocation(selectedId);
    }
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private initializeMap() {
    if (!this.mapContainer || this.map) {
      return;
    }

    this.map = L.map(this.mapContainer.nativeElement, {
      center: CAMPUS_CENTER,
      zoom: 18,
      minZoom: 16,
      maxZoom: 20,
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
      maxBounds: CAMPUS_BOUNDS.pad(0.2),
      maxBoundsViscosity: 0.8,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    L.rectangle(CAMPUS_BOUNDS, {
      color: '#b70114',
      weight: 2,
      opacity: 0.18,
      fillColor: '#b70114',
      fillOpacity: 0.03,
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 0);
    this.renderPins();
  }

  private renderPins() {
    if (!this.map || !this.markerLayer) {
      return;
    }

    this.markerLayer.clearLayers();

    const locations = this.filteredLocations();

    locations.forEach((location) => {
      const coordinates = this.getLocationCoordinates(location);

      const marker = L.circleMarker([coordinates.lat, coordinates.lng], {
        radius: this.selectedId() === location.id ? 11 : 8,
        color: '#ffffff',
        weight: 3,
        fillColor: location.color,
        fillOpacity: 1,
      });

      marker
        .bindTooltip(location.name, {
          permanent: false,
          direction: 'top',
          opacity: 0.95,
          className: 'campus-tooltip',
        })
        .on('click', () => this.selectLocation(location.id));

      if (this.selectedId() === location.id) {
        marker.openTooltip();
      }

      marker.addTo(this.markerLayer!);
    });
  }

  private getLocationCoordinates(location: Location) {
    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }

    return VERIFIED_COORDINATES[location.code] ?? this.estimatePointWithinCampus(location.code);
  }

  private estimatePointWithinCampus(locationCode: string) {
    const [baseLat, baseLng] = CAMPUS_CENTER as [number, number];
    const hash = locationCode.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const latOffset = ((hash % 7) - 3) * 0.00012;
    const lngOffset = (((hash * 3) % 7) - 3) * 0.00012;

    return {
      lat: baseLat + latOffset,
      lng: baseLng + lngOffset,
    };
  }

  private focusOnLocation(locationId: number) {
    if (!this.map) {
      return;
    }

    const location = this.filteredLocations().find((item) => item.id === locationId);
    if (!location) {
      return;
    }

    const coordinates = this.getLocationCoordinates(location);
    this.map.flyTo([coordinates.lat, coordinates.lng], 19, {
      duration: 0.45,
    });
  }

  protected onSearchChange(value: string) {
    this.search.set(value);

    const found = this.filteredLocations();
    if (found.length > 0) {
      this.selectLocation(found[0].id);
    } else {
      this.selectedId.set(null);
      this.map?.fitBounds(CAMPUS_BOUNDS.pad(0.1));
    }
  }

  protected selectCategory(category: string) {
    this.selectedCategory.set(category);

    const found = this.filteredLocations();
    if (found.length > 0) {
      this.selectLocation(found[0].id);
    } else {
      this.selectedId.set(null);
      this.map?.fitBounds(CAMPUS_BOUNDS.pad(0.1));
    }
  }

  private scrollToMapSection() {
    const container = this.mapContainer?.nativeElement;
    if (!container) {
      return;
    }

    const header = document.querySelector('.top-header') as HTMLElement | null;
    const headerOffset = header?.offsetHeight ?? 0;
    const targetTop = window.scrollY + container.getBoundingClientRect().top - headerOffset - 10;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });
  }

  protected selectLocation(locationId: number, scrollToMap = false) {
    this.selectedId.set(locationId);
    this.renderPins();
    this.focusOnLocation(locationId);

    if (scrollToMap) {
      this.scrollToMapSection();
    }
  }

  protected clearSelected() {
    this.selectedId.set(null);
    this.renderPins();
    this.map?.fitBounds(CAMPUS_BOUNDS.pad(0.1));
  }
}
