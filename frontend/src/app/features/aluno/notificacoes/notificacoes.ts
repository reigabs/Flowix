
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type TipoNotificacao = 'analise' | 'aprovada' | 'rejeitada';

interface Notificacao {
  id: number;
  mensagem: string;
  tempo: string;
  tipo: TipoNotificacao;
  lida: boolean;
  detalhes: string;
}

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.css'
})
export class Notificacoes {
  filtroSelecionado = 'Todos';

  notificacaoSelecionada: Notificacao | null = null;

  filtros = ['Todos', 'Não lidas', 'Lidas'];

  notificacoes: Notificacao[] = [
    {
      id: 1,
      mensagem: 'Sua justificativa #3458 está em análise',
      tempo: 'há 10 min',
      tipo: 'analise',
      lida: false,
      detalhes: 'Sua justificativa foi recebida e está aguardando a análise da secretaria.'
    },
    {
      id: 2,
      mensagem: 'Sua justificativa #3457 foi aprovada',
      tempo: 'há 7 dias',
      tipo: 'aprovada',
      lida: false,
      detalhes: 'A secretaria analisou seu documento e aprovou sua justificativa.'
    },
    {
      id: 3,
      mensagem: 'Sua justificativa #3456 foi aprovada',
      tempo: 'há 1 mês',
      tipo: 'aprovada',
      lida: true,
      detalhes: 'Sua justificativa foi aprovada pela secretaria.'
    },
    {
      id: 4,
      mensagem: 'Envie um novo documento para a justificativa #3455',
      tempo: 'há 1 mês',
      tipo: 'rejeitada',
      lida: false,
      detalhes: 'É necessário enviar um novo documento. Procure a secretaria caso precise de orientações.'
    },
    {
      id: 5,
      mensagem: 'Sua justificativa #3454 foi aprovada',
      tempo: 'há 2 meses',
      tipo: 'aprovada',
      lida: true,
      detalhes: 'Sua justificativa foi analisada e aprovada.'
    },
    {
      id: 6,
      mensagem: 'Sua justificativa #3453 foi reprovada',
      tempo: 'há 2 meses',
      tipo: 'rejeitada',
      lida: true,
      detalhes: 'Sua justificativa não foi aprovada. Entre em contato com a secretaria para saber mais.'
    }
  ];

  get notificacoesFiltradas(): Notificacao[] {
    if (this.filtroSelecionado === 'Não lidas') {
      return this.notificacoes.filter(item => !item.lida);
    }

    if (this.filtroSelecionado === 'Lidas') {
      return this.notificacoes.filter(item => item.lida);
    }

    return this.notificacoes;
  }

  get quantidadeNaoLidas(): number {
    return this.notificacoes.filter(item => !item.lida).length;
  }

  selecionarFiltro(filtro: string): void {
    this.filtroSelecionado = filtro;
  }

  marcarTodasComoLidas(): void {
    this.notificacoes = this.notificacoes.map(item => ({
      ...item,
      lida: true
    }));
  }

  abrirNotificacao(item: Notificacao): void {
    this.notificacoes = this.notificacoes.map(notificacao =>
      notificacao.id === item.id
        ? { ...notificacao, lida: true }
        : notificacao
    );

    this.notificacaoSelecionada = {
      ...item,
      lida: true
    };
  }

  fecharDetalhes(): void {
    this.notificacaoSelecionada = null;
  }

  sair(): void {
    window.alert('A função de sair será implementada posteriormente.');
  }
}
