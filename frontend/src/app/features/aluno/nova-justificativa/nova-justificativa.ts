import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
// e adiciona em imports: [RouterLink, RouterLinkActive]

@Component({
  imports: [RouterLink, RouterLinkActive ],
  selector: 'app-nova-justificativa',
  styleUrl: './nova-justificativa.css',
  templateUrl: './nova-justificativa.html',
})
export class NovaJustificativa {}
