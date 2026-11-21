import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Notificacao } from '../../../core/models/justificativa.model';

interface ItemNotificacao {
  id: string;
  mensagem: string;
  tempo: string;
  lida: boolean;
  tipo: string;
  icone: string;
}

@Component({
  selector: 'app-aluno-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.css'
})
export class Notificacoes implements OnInit {
  private justificativaService = inject(JustificativaService);
  private router = inject(Router);

  filtroAtual: string = 'Todos';
  notificacoes: ItemNotificacao[] = [];

  // foi implementado isso aqui (paginação: 5 notificações por página)
  itensPorPagina: number = 5;
  paginaAtual: number = 1;

  private get nomeAluno(): string {
    return this.justificativaService.obterNomeAlunoLogado();
  }

  ngOnInit() {
    this.carregar();
  }

  private carregar() {
    this.notificacoes = this.justificativaService
      .listarNotificacoes('aluno', this.nomeAluno)
      .map(n => this.paraItem(n));
  }

  private paraItem(n: Notificacao): ItemNotificacao {
    const icones: Record<string, string> = {
      analise: '⏳',
      aprovado: '✅',
      rejeitado: '❌'
    };
    const tipo = n.tipo ?? 'analise';

    return {
      id: n.id,
      mensagem: n.mensagem,
      tempo: this.tempoRelativo(n.data),
      lida: n.lida,
      tipo,
      icone: icones[tipo]
    };
  }

  private tempoRelativo(iso: string): string {
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `há ${min} min`;

    const horas = Math.floor(min / 60);
    if (horas < 24) return `há ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 30) return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;

    const meses = Math.floor(dias / 30);
    if (meses < 12) return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;

    const anos = Math.floor(dias / 365);
    return anos === 1 ? 'há 1 ano' : `há ${anos} anos`;
  }

  filtrar(filtro: string) {
    this.filtroAtual = filtro;
    // foi implementado isso aqui (ao trocar de aba, volta para a página 1)
    this.paginaAtual = 1;
  }

  get notificacoesFiltradas(): ItemNotificacao[] {
    if (this.filtroAtual === 'Não lidas') {
      return this.notificacoes.filter(n => !n.lida);
    }
    if (this.filtroAtual === 'Lidas') {
      return this.notificacoes.filter(n => n.lida);
    }
    return this.notificacoes;
  }

  // foi implementado isso aqui (total de páginas, calculado a partir da lista filtrada)
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.notificacoesFiltradas.length / this.itensPorPagina));
  }

  // foi implementado isso aqui (números dos botões de página: 1, 2, 3...)
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // foi implementado isso aqui (só as notificações da página atual; a página 2 mostra as mais antigas)
  get notificacoesDaPagina(): ItemNotificacao[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.notificacoesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  // foi implementado isso aqui (só muda para uma página que existe)
  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  marcarTodasComoLidas() {
    this.justificativaService.marcarTodasComoLidas('aluno', this.nomeAluno);
    this.notificacoes.forEach(n => (n.lida = true));
    // foi implementado isso aqui (na aba "Não lidas" a lista esvazia, então volta para a página 1)
    this.paginaAtual = 1;
  }

  abrirNotificacao(notificacao: ItemNotificacao) {
    this.justificativaService.marcarNotificacaoComoLida(notificacao.id);
    notificacao.lida = true;
    this.router.navigate(['/aluno/historico']);
  }
}