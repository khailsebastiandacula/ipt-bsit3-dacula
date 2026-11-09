import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnouncementsApiService } from '../../core/services/announcements/announcements-api.service';
import type {
  Announcement,
  AnnouncementPriority,
} from '../../core/models/announcements/announcement.models';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly announcementsApi = inject(AnnouncementsApiService);
  private readonly fb = inject(FormBuilder);

  protected readonly announcements = signal<Announcement[]>([]);
  protected readonly editingId = signal<number | null>(null);
  protected readonly isFormExpanded = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly adminKeyStatus = signal<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  protected readonly adminKeyStatusText = computed(() => {
    switch (this.adminKeyStatus()) {
      case 'valid':
        return 'Key verified';
      case 'checking':
        return 'Checking key...';
      case 'invalid':
        return 'Invalid key';
      default:
        return 'Enter a key and submit to unlock announcements';
    }
  });

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(180)]],
    message: ['', [Validators.required]],
    priority: ['NORMAL' as AnnouncementPriority, [Validators.required]],
    author_name: ['', [Validators.required, Validators.maxLength(120)]],
    is_active: [true],
  });

  protected readonly adminKey = signal(localStorage.getItem('uconnect-admin-key') ?? '');

  async ngOnInit() {
    const storedKey = this.adminKey().trim();
    if (storedKey) {
      this.adminKeyStatus.set('idle');
    }
  }

  protected saveAdminKey(value: string) {
    const trimmedValue = value.trim();
    this.adminKey.set(trimmedValue);
    localStorage.setItem('uconnect-admin-key', trimmedValue);
    this.errorMessage.set('');

    if (!trimmedValue) {
      this.adminKeyStatus.set('idle');
      this.cancelEdit();
      return;
    }

    if (this.adminKeyStatus() === 'valid') {
      this.adminKeyStatus.set('idle');
    }
  }

  protected async submitAdminKey() {
    const key = this.adminKey().trim();
    if (!key) {
      this.adminKeyStatus.set('invalid');
      this.errorMessage.set('Please enter an admin key first.');
      this.cancelEdit();
      return;
    }

    this.adminKeyStatus.set('checking');
    this.errorMessage.set('');

    try {
      await this.announcementsApi.validateAdminKey(key);
      this.adminKeyStatus.set('valid');
      this.errorMessage.set('');
      await this.reloadAnnouncements();
    } catch {
      this.adminKeyStatus.set('invalid');
      this.cancelEdit();
      this.errorMessage.set('Invalid admin key. Please check and try again.');
    }
  }

  protected async reloadAnnouncements() {
    if (this.adminKeyStatus() !== 'valid') {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const result = await this.announcementsApi.getAnnouncements(true);
      this.announcements.set(result);
    } catch {
      this.errorMessage.set('Failed to load announcements from server.');
    } finally {
      this.loading.set(false);
    }
  }

  protected startCreate() {
    if (this.adminKeyStatus() !== 'valid') {
      this.errorMessage.set('Please submit a valid admin key first.');
      return;
    }

    this.editingId.set(null);
    this.isFormExpanded.set(true);
    this.form.reset({
      title: '',
      message: '',
      priority: 'NORMAL',
      author_name: '',
      is_active: true,
    });
  }

  protected async startEdit(item: Announcement) {
    if (this.adminKeyStatus() !== 'valid') {
      this.errorMessage.set('Please submit a valid admin key first.');
      return;
    }

    this.errorMessage.set('');
    this.editingId.set(item.id);
    this.isFormExpanded.set(true);
    this.form.reset({
      title: item.title,
      message: item.message,
      priority: item.priority,
      author_name: item.author_name,
      is_active: item.is_active === 1,
    });
  }

  protected cancelEdit() {
    this.form.reset({
      title: '',
      message: '',
      priority: 'NORMAL',
      author_name: '',
      is_active: true,
    });
    this.editingId.set(null);
    this.isFormExpanded.set(false);
  }

  protected async submitForm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const key = this.adminKey().trim();
    if (!key || this.adminKeyStatus() !== 'valid') {
      this.errorMessage.set('Please submit a valid admin key first.');
      this.cancelEdit();
      return;
    }

    const payload = this.form.getRawValue();

    try {
      const id = this.editingId();
      if (id) {
        await this.announcementsApi.updateAnnouncement(key, id, payload);
      } else {
        await this.announcementsApi.createAnnouncement(key, payload);
      }

      await this.reloadAnnouncements();
      this.cancelEdit();
    } catch (error: unknown) {
      const isAuthError =
        error &&
        typeof error === 'object' &&
        'status' in error &&
        (error.status === 401 || error.status === 403);

      if (isAuthError) {
        this.adminKeyStatus.set('invalid');
        this.cancelEdit();
        this.errorMessage.set('Invalid admin key. Please check and try again.');
      } else {
        this.errorMessage.set('Admin request failed. Check your key and input values.');
      }
    }
  }

  protected async toggleForm() {
    if (this.isFormExpanded()) {
      this.cancelEdit();
      return;
    }

    this.startCreate();
  }

  protected async deleteItem(item: Announcement) {
    const key = this.adminKey().trim();
    if (!key || this.adminKeyStatus() !== 'valid') {
      this.errorMessage.set('Please submit a valid admin key first.');
      return;
    }

    try {
      await this.announcementsApi.deleteAnnouncement(key, item.id);
      await this.reloadAnnouncements();
    } catch (error: unknown) {
      const isAuthError =
        error &&
        typeof error === 'object' &&
        'status' in error &&
        (error.status === 401 || error.status === 403);

      if (isAuthError) {
        this.adminKeyStatus.set('invalid');
        this.errorMessage.set('Invalid admin key. Please check and try again.');
      } else {
        this.errorMessage.set('Failed to delete announcement.');
      }
    }
  }
}
