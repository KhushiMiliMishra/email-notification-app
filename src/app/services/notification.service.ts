import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmailNotification {
  recipientEmail: string;
  recipientName: string;
  notificationType: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  sendEmail(notification: EmailNotification): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/notifications/email`, notification);
  }
}
