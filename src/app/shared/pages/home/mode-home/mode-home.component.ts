import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import {DOCUMENT, NgClass} from '@angular/common';

@Component({
  selector: 'app-mode-home',
  templateUrl: './mode-home.component.html',
  standalone: true,
  imports: [
    NgClass
  ],
  styleUrls: ['./mode-home.component.css']
})
export class ModeHomeComponent implements OnInit{

  isDarkMode = false;
  title = 'my-portfolio';

  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark-theme' : '';
    this.renderer.setAttribute(this.document.body, 'class', theme);
    localStorage.setItem('theme', theme);
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark-theme';
    this.renderer.setAttribute(this.document.body, 'class', savedTheme || '');
  }
}
