import { Component, input } from '@angular/core';

@Component({
  selector: 'app-qr-display',
  standalone: true,
  templateUrl: './qr-display.component.html',
})
export class QrDisplayComponent {
  readonly qrCodeBase64 = input.required<string>();

  download(): void {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${this.qrCodeBase64()}`;
    link.download = 'pix-qrcode.png';
    link.click();
  }
}
