import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-dash-menu',
  standalone: true,
  imports: [
    RouterLink,
    NgClass
  ],
  templateUrl: './dash-menu.component.html',
  styleUrl: './dash-menu.component.css'
})
export class DashMenuComponent  implements OnInit {
  activeLink: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateActiveLink(this.router.url);
      }
    });


    this.updateActiveLink(this.router.url);
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
