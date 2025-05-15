import { Component } from '@angular/core';
import {HeaderComponent} from "../../components/header/header.component";
import {LoginComponent} from "../../../features/auth/login/login.component";
import {ModeHomeComponent} from "./mode-home/mode-home.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    LoginComponent,
    ModeHomeComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
