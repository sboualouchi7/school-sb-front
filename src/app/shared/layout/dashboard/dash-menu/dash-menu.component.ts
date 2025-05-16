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

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveLink(this.router.url);
      }
    });

    this.updateActiveLink(this.router.url);
  }

  defineMenuItems(): void {
    // Liste complète des items du menu, avec les rôles autorisés pour chacun
    const allMenuItems: MenuItem[] = [
      {
        label: 'Étudiants',
        path: '/dashboard/admin/student',
        icon: 'pi pi-users',
        roles: [Role.ADMIN]
      },
      {
        label: 'Enseignants',
        path: '/dashboard/admin/profs',
        icon: 'pi pi-users',
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
        label: 'Évaluations',
        path: '/dashboard/enseignant/evaluations',
        icon: 'pi pi-chart-bar',
        roles: [Role.ENSEIGNANT]
      },
      // Ajoutez ici d'autres items pour les autres rôles
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
    this.activeLink = url;
  }

  isLinkActive(link: string): boolean {
    return this.activeLink === link;
  }
}
