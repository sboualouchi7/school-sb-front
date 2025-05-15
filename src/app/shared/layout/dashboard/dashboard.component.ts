import { Component } from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {DashboardHeaderComponent} from "./dashboard-header/dashboard-header.component";
import {DashMenuComponent} from "./dash-menu/dash-menu.component";
import {DashMenuResponsiveComponent} from "./dash-menu-respo/dash-menu-responsive.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterOutlet,
    DashMenuResponsiveComponent,
    DashboardHeaderComponent,
    DashMenuComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
