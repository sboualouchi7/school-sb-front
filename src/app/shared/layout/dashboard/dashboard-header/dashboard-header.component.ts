import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT, NgIf } from "@angular/common";
import { Router } from "@angular/router";
import { ModeHomeComponent } from "../../../pages/home/mode-home/mode-home.component";
import { AuthService } from "../../../../core/services/auth-service";
import { Role } from "../../../../core/enums/Role";

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [
    NgIf,
    ModeHomeComponent
  ],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.css'
})
export class DashboardHeaderComponent implements OnInit {
  username!: string;
  personId!: number;
  role!: Role | null;
  notifications: number = 0;
  private hasRedirected = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.updateUserDetails(user);
      } else {
        const currentRole = this.authService.getCurrentUserRole();
        if (!currentRole && !this.hasRedirected) {
          this.hasRedirected = true;
          console.log('No current user found, redirecting to login');
          this.authService.logout();
        }
      }
    });
  }

  /**
   * Update user interface with user details
   */
  updateUserDetails(user: any): void {
    if (!user) return;

    this.username = user.sub || user.username || '';
    const userRole = this.authService.getCurrentUserRole();
    this.role = userRole;
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    const elem = this.document.documentElement;

    if (!this.document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      }
    }
  }

  /**
   * Log out the user using AuthService
   */
  logout() {
    this.authService.logout();
  }
}
