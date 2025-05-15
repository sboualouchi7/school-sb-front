import { Component } from '@angular/core';
import {NgOptimizedImage, NgStyle} from "@angular/common";
import {SectionLoginComponent} from "./section-login/section-login.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgStyle,
    SectionLoginComponent,
    NgOptimizedImage
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  check: boolean = false;
  onOpenOrClose(check: boolean): void {
    this.check = check;
  }
}
