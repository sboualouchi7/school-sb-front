import {Component, OnInit} from '@angular/core';
import {LoadingComponent} from "./shared/components/loading/loading.component";
import {NgIf} from "@angular/common";
import AOS from 'aos';
import {RouterOutlet} from "@angular/router";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'school-frontend';
  isLoading = false;
  ngOnInit() {
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }
  }
}
