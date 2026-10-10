import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
// e adiciona em imports: [RouterLink, RouterLinkActive]

@Component({
  imports: [ RouterLink, RouterLinkActive ],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil {}
