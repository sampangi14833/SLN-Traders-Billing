import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailOtpService {
  private readonly emailjsEndpoint = 'https://api.emailjs.com/api/v1.0/email/send';

  constructor(private readonly http: HttpClient) {}

  isConfigured(): boolean {
    const config = environment.emailjs;

    return Boolean(config.serviceId?.trim() && config.templateId?.trim() && config.publicKey?.trim());
  }

  sendOtp(email: string, otp: string, purpose: string): Observable<void> {
    const config = environment.emailjs;

    if (!this.isConfigured()) {
      return throwError(() => ({
        error: {
          message:
            'EmailJS is not configured. Connect Gmail in EmailJS, then add serviceId, templateId, and publicKey in the environment files.'
        }
      }));
    }

    return this.http
      .post(
        this.emailjsEndpoint,
        {
          service_id: config.serviceId,
          template_id: config.templateId,
          user_id: config.publicKey,
          template_params: {
            to_email: email,
            email,
            user_email: email,
            recipient_email: email,
            reply_to: email,
            otp,
            purpose,
            message: `Your SLN Traders Billing ${purpose} OTP is ${otp}. It expires in 5 minutes.`,
            from_name: config.fromName
          }
        },
        { responseType: 'text' }
      )
      .pipe(map(() => undefined));
  }
}
