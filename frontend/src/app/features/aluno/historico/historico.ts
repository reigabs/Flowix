import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
// e adiciona em imports: [RouterLink, RouterLinkActive]


@Component({
  imports: [RouterLink, RouterLinkActive ],
  selector: 'app-historico',
  styleUrl: './historico.css',
  templateUrl: './historico.html',
})
export class Historico {}
