import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aluno-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class Inicio {
  nomeAluno: string = 'Bia Santos';

  // Dados dos cards de resumo
  resumo = {
    pendentes: 2,
    emAnalise: 1,
    aprovadas: 2,
    rejeitadas: 1
  };

  // Lista de solicitações recentes baseada na imagem
  solicitacoesRecentes = [
    { id: '#3458', data: '17/05/2026', tipo: 'Consulta médica', status: 'Em andamento', statusClass: 'em-andamento' },
    { id: '#3457', data: '10/05/2026', tipo: 'Atestado médico', status: 'Aprovada', statusClass: 'aprovada' },
    { id: '#3456', data: '16/04/2026', tipo: 'Consulta odontológica', status: 'Aprovada', statusClass: 'aprovada' },
    { id: '#3455', data: '02/04/2026', tipo: 'Declaração', status: 'Rejeitada', statusClass: 'rejeitada' }
  ];
}