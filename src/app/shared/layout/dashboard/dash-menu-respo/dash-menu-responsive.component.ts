// dash-menu-responsive.component.ts
import { Component, OnInit } from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import { AuthService } from "../../../../core/services/auth-service";
import {NgClass, NgForOf} from "@angular/common";

interface MenuItem {
  path: string;
  icon: string;
}

@Component({
  selector: 'app-dash-menu-responsive',
  templateUrl: './dash-menu-responsive.component.html',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    NgClass
  ],
  styleUrls: ['./dash-menu-responsive.component.css']
})
export class DashMenuResponsiveComponent implements OnInit {
  activeLink: string = '';
  userRole: string = '';
  menuItems: MenuItem[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const userRole = this.authService.getCurrentUserRole();
    if (userRole) {
      try {
        this.userRole = userRole || '';
        this.loadMenuItems();
      } catch (error) {
        console.error('Erreur lors de la lecture des données JWT:', error);
      }
    }

    // Suivre les changements de route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveLink(this.router.url);
      }
    });

    // Initialiser le lien actif
    this.updateActiveLink(this.router.url);
  }

  loadMenuItems(): void {
    switch (this.userRole.toLowerCase()) {
      case 'admin':
        this.menuItems = [
          { path: '/dashboard/admin', icon: 'pi pi-home' },
          { path: '/dashboard/admin/gestion-profs', icon: 'pi pi-chart-pie' },
          { path: '/dashboard/admin/classe', icon: 'pi pi-objects-column' },
          { path: '/dashboard/admin/session', icon: 'pi pi-calendar' },
          { path: '/dashboard/admin/parent', icon: 'pi pi-clipboard' }
        ];
        break;
      case 'eleve':
      case 'parent':
        this.menuItems = [
          { path: '/eleve-dashboard', icon: 'pi pi-home' },
          { path: '/eleve-dashboard/statistics', icon: 'pi pi-chart-pie' },
          { path: '/eleve-dashboard/result', icon: 'pi pi-clipboard' },
          { path: '/eleve-dashboard/calendar', icon: 'pi pi-calendar' }
        ];
        break;
      case 'enseignant':
      case 'prof':
        this.menuItems = [
          { path: '/prof-dashboard', icon: 'pi pi-home' },
          { path: '/prof-dashboard/dash-gestion', icon: 'pi pi-sitemap' },
          { path: '/prof-dashboard/dash-examens', icon: 'pi pi-clipboard' },
          { path: '/prof-dashboard/info-eleves', icon: 'pi pi-id-card' }
        ];
        break;
      default:
        // Menu par défaut ou redirection vers la page de connexion
        this.menuItems = [];
        break;
    }
  }

  setActiveLink(link: string): void {
    this.activeLink = link;
  }

  updateActiveLink(url: string): void {
    this.activeLink = url;
  }

  isLinkActive(link: string): boolean {
    return this.activeLink === link;
  }

  logout(): void {
    localStorage.removeItem('jwtData');
    this.router.navigateByUrl('');
  }

  // Obtenir le préfixe de base pour les routes en fonction du rôle
  getBasePath(): string {
    switch (this.userRole.toLowerCase()) {
      case 'admin': return '/admin-dashboard';
      case 'eleve':
      case 'parent': return '/eleve-dashboard';
      case 'enseignant':
      case 'prof': return '/prof-dashboard';
      default: return '';
    }
  }
}
