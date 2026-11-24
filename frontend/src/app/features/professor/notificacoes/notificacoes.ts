import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Notificacao } from '../../../core/models/justificativa.model';

interface ItemNotificacao {
  id: string;
  justificativaId: string;
  mensagem: string;
  tempo: string;
  lida: boolean;
  tipo: string;
  icone: string;
}

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.css'
})
export class Notificacoes implements OnInit {
  private justificativaService = inject(JustificativaService);
  private router = inject(Router);

  filtroAtual: 'Todos' | 'Não lidas' | 'Lidas' = 'Todos';

  notificacoes: ItemNotificacao[] = [];

  itensPorPagina = 5;
  paginaAtual = 1;

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes(): void {
    const notificacoes = this.justificativaService.listarNotificacoes('professor');

    this.notificacoes = notificacoes.map(notificacao =>
      this.paraItem(notificacao)
    );

    this.paginaAtual = 1;
  }

  private paraItem(notificacao: Notificacao): ItemNotificacao {
    let icone = '⏳';

    if (notificacao.tipo === 'aprovado') {
      icone = '✅';
    } else if (notificacao.tipo === 'rejeitado') {
      icone = '❌';
    }

    return {
      id: notificacao.id,
      justificativaId: notificacao.justificativaId,
      mensagem: notificacao.mensagem,
      tempo: this.tempoRelativo(notificacao.data),
      lida: notificacao.lida,
      tipo: notificacao.tipo,
      icone
    };
  }

  private tempoRelativo(data: string): string {
    const dataNotificacao = new Date(data).getTime();
    const agora = Date.now();
    const diferenca = Math.max(0, agora - dataNotificacao);

    const minutos = Math.floor(diferenca / 60000);

    if (minutos < 1) {
      return 'Agora mesmo';
    }

    if (minutos < 60) {
      return `Há ${minutos} min`;
    }

    const horas = Math.floor(minutos / 60);

    if (horas < 24) {
      return `Há ${horas} h`;
    }

    const dias = Math.floor(horas / 24);

    if (dias < 30) {
      return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
    }

    const meses = Math.floor(dias / 30);

    if (meses < 12) {
      return `Há ${meses} mês${meses > 1 ? 'es' : ''}`;
    }

    const anos = Math.floor(meses / 12);

    return `Há ${anos} ano${anos > 1 ? 's' : ''}`;
  }

  filtrar(filtro: 'Todos' | 'Não lidas' | 'Lidas'): void {
    this.filtroAtual = filtro;
    this.paginaAtual = 1;
  }

  get notificacoesFiltradas(): ItemNotificacao[] {
    if (this.filtroAtual === 'Não lidas') {
      return this.notificacoes.filter(item => !item.lida);
    }

    if (this.filtroAtual === 'Lidas') {
      return this.notificacoes.filter(item => item.lida);
    }

    return this.notificacoes;
  }

  get totalPaginas(): number {
    return Math.ceil(this.notificacoesFiltradas.length / this.itensPorPagina);
  }

  get notificacoesDaPagina(): ItemNotificacao[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;

    return this.notificacoesFiltradas.slice(
      inicio,
      inicio + this.itensPorPagina
    );
  }

  get paginas(): number[] {
    return Array.from(
      { length: this.totalPaginas },
      (_, indice) => indice + 1
    );
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  marcarTodasComoLidas(): void {
    this.justificativaService.marcarTodasComoLidas('professor');

    this.notificacoes.forEach(item => {
      item.lida = true;
    });
  }

  verRelatorio(item: ItemNotificacao): void {
    this.justificativaService.marcarNotificacaoComoLida(item.id);

    item.lida = true;

    this.router.navigate(['/professor/historico'], {
      queryParams: {
        justificativaId: item.justificativaId
      }
    });
  }
}
