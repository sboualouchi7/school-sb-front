// src/app/shared/layout/dashboard/dash-menu/dash-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { NgClass, NgIf, NgFor } from "@angular/common";
import { AuthService } from "../../../../core/services/auth-service";
import { Role } from "../../../../core/enums/Role";

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles: Role[];
}

@Component({
  selector: 'app-dash-menu',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    NgIf,
    NgFor
  ],
  templateUrl: './dash-menu.component.html',
  styleUrl: './dash-menu.component.css'
})
export class DashMenuComponent implements OnInit {
  activeLink: string = '';
  menuItems: MenuItem[] = [];
  userRole: Role | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Récupérer le rôle de l'utilisateur
    this.userRole = this.authService.getCurrentUserRole();

    // Définir les éléments du menu
    this.defineMenuItems();

    // Écouter les changements de route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveLink(event.url);
      }
    });

    // Initialiser avec l'URL actuelle
    this.updateActiveLink(this.router.url);
  }

  defineMenuItems(): void {
    // Liste complète des items du menu, avec les rôles autorisés pour chacun
    const allMenuItems: MenuItem[] = [
      // Menu Admin
      {
        label: 'Dashboard',
        path: '/dashboard/admin/dashboard',
        icon: 'pi pi-home',
        roles: [Role.ADMIN]
      },
      {
        label: 'Étudiants',
        path: '/dashboard/admin/student',
        icon: 'pi pi-users',
        roles: [Role.ADMIN]
      },
      {
        label: 'Enseignants',
        path: '/dashboard/admin/profs',
        icon: 'pi pi-user-edit',
        roles: [Role.ADMIN]
      },
      {
        label: 'Classes',
        path: '/dashboard/admin/classe',
        icon: 'pi pi-sitemap',
        roles: [Role.ADMIN]
      },
      {
        label: 'Modules',
        path: '/dashboard/admin/module',
        icon: 'pi pi-book',
        roles: [Role.ADMIN]
      },
      {
        label: 'Parents',
        path: '/dashboard/admin/parent',
        icon: 'pi pi-user',
        roles: [Role.ADMIN]
      },
      {
        label: 'Évaluations',
        path: '/dashboard/admin/evaluations',
        icon: 'pi pi-chart-bar',
        roles: [Role.ADMIN]
      },
      {
        label: 'Absences',
        path: '/dashboard/admin/absences',
        icon: 'pi pi-calendar-times',
        roles: [Role.ADMIN]
      },
      {
        label: 'Documents',
        path: '/dashboard/admin/documents',
        icon: 'pi pi-file',
        roles: [Role.ADMIN]
      },
      {
        label: 'Séances',
        path: '/dashboard/admin/seances',
        icon: 'pi pi-calendar',
        roles: [Role.ADMIN]
      },

      // Menu pour les enseignants
      {
        label: 'Tableau de bord',
        path: '/dashboard/enseignant',
        icon: 'pi pi-home',
        roles: [Role.ENSEIGNANT]
      },
      {
        label: 'Absences',
        path: '/dashboard/enseignant/absences',
        icon: 'pi pi-calendar-times',
        roles: [Role.ENSEIGNANT]
      },
      {
        label: 'Notes',
        path: '/dashboard/enseignant/notes',
        icon: 'pi pi-chart-bar',
        roles: [Role.ENSEIGNANT]
      },
      {
        label: 'Mes Séances',
        path: '/dashboard/enseignant/seances',
        icon: 'pi pi-calendar',
        roles: [Role.ENSEIGNANT]
      },

      // Menu pour les étudiants
      {
        label: 'Tableau de bord',
        path: '/dashboard/etudiant',
        icon: 'pi pi-home',
        roles: [Role.ETUDIANT]
      },
      {
        label: 'Mes absences',
        path: '/dashboard/etudiant/absences',
        icon: 'pi pi-calendar-times',
        roles: [Role.ETUDIANT]
      },
      {
        label: 'Mes notes',
        path: '/dashboard/etudiant/notes',
        icon: 'pi pi-chart-bar',
        roles: [Role.ETUDIANT]
      },
      {
        label: 'Mes demandes',
        path: '/dashboard/etudiant/demandes',
        icon: 'pi pi-file',
        roles: [Role.ETUDIANT]
      },

      // Menu pour les parents
      {
        label: 'Tableau de bord',
        path: '/dashboard/parent',
        icon: 'pi pi-home',
        roles: [Role.PARENT]
      }/*,
      {
        label: 'Notes enfants',
        path: '/dashboard/parent/notes-enfant',
        icon: 'pi pi-chart-bar',
        roles: [Role.PARENT]
      },
      {
        label: 'Absences enfants',
        path: '/dashboard/parent/absences-enfant',
        icon: 'pi pi-calendar-times',
        roles: [Role.PARENT]
      }*/
    ];

    // Filtrer les items en fonction du rôle de l'utilisateur
    if (this.userRole) {
      this.menuItems = allMenuItems.filter(item =>
        item.roles.includes(this.userRole as Role)
      );
    }
  }

  setActiveLink(link: string): void {
    this.activeLink = link;
  }

  updateActiveLink(url: string): void {
    // Nettoyer l'URL
    const cleanUrl = url.split('?')[0].split('#')[0];

    // Chercher une correspondance exacte d'abord
    const exactMatch = this.menuItems.find(item => item.path === cleanUrl);
    if (exactMatch) {
      this.activeLink = exactMatch.path;
      return;
    }

    // Si pas de correspondance exacte, chercher la plus longue correspondance
    let bestMatch = '';
    let maxLength = 0;

    for (const item of this.menuItems) {
      if (cleanUrl.startsWith(item.path) && item.path.length > maxLength) {
        bestMatch = item.path;
        maxLength = item.path.length;
      }
    }

    if (bestMatch) {
      this.activeLink = bestMatch;
    }
  }

  isLinkActive(link: string): boolean {
    return this.activeLink === link;
  }

  // Méthode pour gérer le clic
  onMenuItemClick(item: MenuItem): void {
    this.setActiveLink(item.path);
  }

  // Déconnexion
  logout(): void {
    this.authService.logout();
  }

  // TrackBy pour performance
  trackByPath(index: number, item: MenuItem): string {
    return item.path;
  }
}
