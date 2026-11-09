import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NotificationService } from './services/notification.service';
import { environment } from '../environments/environment';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly notificationService = inject(NotificationService);

  protected readonly apiBaseUrl = environment.apiBaseUrl;
  protected readonly environmentName = environment.production ? 'Production' : 'Development';
  protected readonly emailNotificationsEnabled = signal<boolean>(
    environment.featureFlags.emailNotifications,
  );
  protected readonly deliveryAnalyticsEnabled = signal<boolean>(
    environment.featureFlags.deliveryAnalytics,
  );
  protected readonly sending = signal(false);
  protected readonly sendStatus = signal<'success' | 'error' | null>(null);
  protected readonly message = signal('');

  protected recipientEmail = '';
  protected recipientName = '';
  protected notificationType = 'welcome';

  protected toggleEmailNotifications(): void {
    this.emailNotificationsEnabled.update((enabled) => !enabled);
  }

  protected toggleDeliveryAnalytics(): void {
    this.deliveryAnalyticsEnabled.update((enabled) => !enabled);
  }

  protected clearMessage(): void {
    this.message.set('');
    this.sendStatus.set(null);
  }

  protected sendNotification(form: NgForm): void {
    if (form.invalid || this.sending() || !this.emailNotificationsEnabled()) {
      form.control.markAllAsTouched();
      return;
    }

    this.clearMessage();
    this.sending.set(true);

    this.notificationService
      .sendEmail({
        recipientEmail: this.recipientEmail,
        recipientName: this.recipientName,
        notificationType: this.notificationType,
      })
      .subscribe({
        next: () => {
          this.sendStatus.set('success');
          this.message.set(
            `Your ${this.notificationType.replace('-', ' ')} was sent to ${this.recipientEmail}.`,
          );
          this.sending.set(false);
          form.resetForm({ notificationType: 'welcome' });
        },
        error: () => {
          this.sendStatus.set('error');
          this.message.set(
            'The email service could not be reached. Check the API connection and try again.',
          );
          this.sending.set(false);
        },
      });
  }
}
