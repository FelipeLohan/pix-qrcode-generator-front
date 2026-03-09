import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PixRequest, PixResponse } from '../models/pix.models';

@Injectable({ providedIn: 'root' })
export class PixService {
  private readonly http = inject(HttpClient);

  gerarQrCode(payload: PixRequest): Observable<PixResponse> {
    return this.http.post<PixResponse>('/api/pix/gerar', payload);
  }
}
