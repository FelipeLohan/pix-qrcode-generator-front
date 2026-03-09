import { Component } from '@angular/core';
import { PixFormComponent } from './components/pix-form/pix-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PixFormComponent],
  templateUrl: './app.html',
})
export class App {}
