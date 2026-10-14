import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio {
  nomeAluno = 'Bia Santos';

  solicitacoes = [
    {
      numero: '3458',
      data: '17/05/2026',
      motivo: 'Consulta médica',
      status: 'Em andamento'
    },
    {
      numero: '3457',
      data: '10/05/2026',
      motivo: 'Atestado médico',
      status: 'Aprovada'
    },
    {
      numero: '3456',
      data: '16/04/2026',
      motivo: 'Consulta odontológica',
      status: 'Aprovada'
    },
    {
      numero: '3455',
      data: '02/04/2026',
      motivo: 'Declaração',
      status: 'Rejeitada'
    }
  ];

  sair(): void {
    alert('A função de sair será implementada posteriormente.');
  }
}
