import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';

import { PixService } from '../../services/pix.service';
import { TipoChave } from '../../models/pix.models';
import { QrDisplayComponent } from '../qr-display/qr-display.component';

/** Validadores de formato por tipo de chave — usado apenas no frontend. */
const CHAVE_VALIDATORS: Record<TipoChave, ValidatorFn> = {
  // CPF valida o valor já formatado (000.000.000-00)
  CPF:      Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  CNPJ:     Validators.pattern(/^\d{14}$/),
  EMAIL:    Validators.email,
  TELEFONE: Validators.pattern(/^\+55\d{10,11}$/),
  EVP:      Validators.pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
};

const CHAVE_PLACEHOLDERS: Record<TipoChave, string> = {
  CPF:      '000.000.000-00',
  CNPJ:     '00000000000000',
  EMAIL:    'exemplo@email.com',
  TELEFONE: '+5511999999999',
  EVP:      'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
};

function formatCpf(digits: string): string {
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

@Component({
  selector: 'app-pix-form',
  standalone: true,
  imports: [ReactiveFormsModule, QrDisplayComponent],
  templateUrl: './pix-form.component.html',
})
export class PixFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pixService = inject(PixService);

  readonly tiposChave: TipoChave[] = ['CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'EVP'];

  readonly isLoading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly qrCodeResult = signal<string | null>(null);
  readonly chavePlaceholder = signal(CHAVE_PLACEHOLDERS['CPF']);

  readonly form = this.fb.group({
    tipoChave:     ['CPF' as TipoChave, Validators.required],
    chavePix:      ['', [Validators.required, CHAVE_VALIDATORS['CPF']]],
    nomeRecebedor: ['', [Validators.required, Validators.maxLength(25)]],
    cidade:        ['', [Validators.required, Validators.maxLength(15)]],
  });

  ngOnInit(): void {
    this.form.get('tipoChave')!.valueChanges.subscribe(tipo => {
      if (!tipo) return;
      const chaveCtrl = this.form.get('chavePix')!;
      chaveCtrl.setValidators([Validators.required, CHAVE_VALIDATORS[tipo]]);
      chaveCtrl.setValue('');
      chaveCtrl.updateValueAndValidity();
      this.chavePlaceholder.set(CHAVE_PLACEHOLDERS[tipo]);
    });
  }

  onChavePixInput(event: Event): void {
    if (this.form.get('tipoChave')!.value !== 'CPF') return;

    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 11);
    const formatted = formatCpf(digits);

    // Armazena o valor formatado no form control.
    // O Angular chama writeValue(formatted) e escreve de volta ao input,
    // preservando a máscara sem conflito com o DefaultValueAccessor.
    this.form.get('chavePix')!.setValue(formatted, { emitEvent: false });
    this.form.get('chavePix')!.markAsTouched();
  }

  hasError(field: keyof typeof this.form.controls): boolean {
    const ctrl = this.form.get(field)!;
    return ctrl.invalid && ctrl.touched;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMsg.set(null);
    this.qrCodeResult.set(null);

    const { tipoChave, chavePix, nomeRecebedor, cidade } = this.form.getRawValue();

    // CPF: envia apenas os dígitos (sem pontuação) para o backend
    const chaveParaEnviar = tipoChave === 'CPF'
      ? chavePix!.replace(/\D/g, '')
      : chavePix!;

    this.pixService.gerarQrCode({
      chavePix:      chaveParaEnviar,
      nomeRecebedor: nomeRecebedor!,
      cidade:        cidade!,
    }).subscribe({
      next: resp => {
        this.qrCodeResult.set(resp.qrCodeBase64);
        this.isLoading.set(false);
      },
      error: (err: Error) => {
        this.errorMsg.set(err.message);
        this.isLoading.set(false);
      },
    });
  }
}
