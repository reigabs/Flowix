import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
// e adiciona em imports: [RouterLink, RouterLinkActive]

@Component({
  imports: [RouterLink, RouterLinkActive ],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {}
