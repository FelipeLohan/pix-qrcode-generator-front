import { Component } from '@angular/core';
import { LucideAngularModule, Github, Linkedin } from 'lucide-angular';
import { PixFormComponent } from './components/pix-form/pix-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PixFormComponent, LucideAngularModule],
  providers: [{ provide: 'LucideIconConfig', useValue: { icons: { Github, Linkedin } } }],
  templateUrl: './app.html',
})
export class App {
  readonly Github = Github;
  readonly Linkedin = Linkedin;
}
