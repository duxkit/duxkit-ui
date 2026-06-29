import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

@Component({
  imports: [FooterComponent, HeaderComponent, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
