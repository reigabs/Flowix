import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Notificacao {
  id: number;
  mensagem: string;
  tipo: 'analise' | 'aprovado' | 'rejeitado';
  tempo: string;
  lida: boolean;
}

@Component({
  selector: 'app-notificacoes-responsavel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.css'
})
export class NotificacoesResponsavel {
  abas: string[] = ['Todos', 'Não lidas', 'Lidas'];
  abaSelecionada: string = 'Todos';

  listaNotificacoes: Notificacao[] = [
    {
      id: 1,
      mensagem: 'Sua justificativa #3458 está em análise',
      tipo: 'analise',
      tempo: 'há 10 min',
      lida: false
    },
    {
      id: 2,
      mensagem: 'Sua justificativa #3457 foi aprovada',
      tipo: 'aprovado',
      tempo: 'há 7 dias',
      lida: true
    },
    {
      id: 3,
      mensagem: 'Sua justificativa #3456 foi aprovada',
      tipo: 'aprovado',
      tempo: 'há 1 mês',
      lida: true
    },
    {
      id: 4,
      mensagem: 'Envie um novo documento para a justificativa #3455',
      tipo: 'rejeitado',
      tempo: 'há 1 mês',
      lida: false
    },
    {
      id: 5,
      mensagem: 'Sua justificativa #3454 foi aprovada',
      tipo: 'aprovado',
      tempo: 'há 2 meses',
      lida: true
    },
    {
      id: 6,
      mensagem: 'Sua justificativa #3453 foi reprovada',
      tipo: 'rejeitado',
      tempo: 'há 2 meses',
      lida: true
    }
  ];

  get notificacoesVisiveis(): Notificacao[] {
    if (this.abaSelecionada === 'Todos') {
      return this.listaNotificacoes;
    }
    if (this.abaSelecionada === 'Não lidas') {
      return this.listaNotificacoes.filter(n => !n.lida);
    }
    if (this.abaSelecionada === 'Lidas') {
      return this.listaNotificacoes.filter(n => n.lida);
    }
    return this.listaNotificacoes;
  }

  selecionarAba(aba: string) {
    this.abaSelecionada = aba;
  }

  marcarTodasComoLidas() {
    this.listaNotificacoes.forEach(n => n.lida = true);
  }

  abrirNotificacao(item: Notificacao) {
    item.lida = true;
    // Aqui você pode adicionar a navegação para os detalhes da justificativa se desejar
  }
}