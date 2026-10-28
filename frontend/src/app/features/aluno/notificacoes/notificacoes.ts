import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aluno-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.css'
})
export class Notificacoes {
  filtroAtual: string = 'Todos';

  // Lista de notificações baseada no protótipo
  notificacoes = [
    {
      id: 1,
      mensagem: 'Sua justificativa #3458 está em análise',
      tempo: 'há 10 min',
      lida: false,
      tipo: 'analise',
      icone: '⏳'
    },
    {
      id: 2,
      mensagem: 'Sua justificativa #3457 foi aprovada',
      tempo: 'há 7 dias',
      lida: false,
      tipo: 'aprovado',
      icone: '✅'
    },
    {
      id: 3,
      mensagem: 'Sua justificativa #3456 foi aprovada',
      tempo: 'há 1 mês',
      lida: true,
      tipo: 'aprovado',
      icone: '✅'
    },
    {
      id: 4,
      mensagem: 'Envie um novo documento para a justificativa #3455',
      tempo: 'há 1 mês',
      lida: false,
      tipo: 'rejeitado',
      icone: '❌'
    },
    {
      id: 5,
      mensagem: 'Sua justificativa #3454 foi aprovada',
      tempo: 'há 2 meses',
      lida: true,
      tipo: 'aprovado',
      icone: '✅'
    },
    {
      id: 6,
      mensagem: 'Sua justificativa #3453 foi reprovada',
      tempo: 'há 2 meses',
      lida: true,
      tipo: 'rejeitado',
      icone: '❌'
    }
  ];

  filtrar(filtro: string) {
    this.filtroAtual = filtro;
  }

  get notificacoesFiltradas() {
    if (this.filtroAtual === 'Não lidas') {
      return this.notificacoes.filter(n => !n.lida);
    }
    if (this.filtroAtual === 'Lidas') {
      return this.notificacoes.filter(n => n.lida);
    }
    return this.notificacoes;
  }

  marcarTodasComoLidas() {
    this.notificacoes.forEach(n => n.lida = true);
  }

  abrirNotificacao(notificacao: any) {
    notificacao.lida = true;
    console.log('Abrir detalhes da notificação:', notificacao.id);
  }
}