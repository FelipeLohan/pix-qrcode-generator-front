import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { PixRequest, PixResponse } from '../models/pix.models';

@Injectable({ providedIn: 'root' })
export class PixService {
  private readonly http = inject(HttpClient);

  gerarQrCode(payload: PixRequest): Observable<PixResponse> {
    return this.http
      .post<PixResponse>('/api/pix/gerar', payload)
      .pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.message ?? 'Erro ao gerar QR Code. Tente novamente.';
    return throwError(() => new Error(message));
  }
}
