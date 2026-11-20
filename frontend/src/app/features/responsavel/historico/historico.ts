// foi implementado isso aqui (OnInit e inject adicionados ao import)
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// foi implementado isso aqui (service e model compartilhados)
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

// foi implementado isso aqui (interface renomeada de Justificativa para ItemHistorico, para não conflitar com o model)
interface ItemHistorico {
  aluno: string;
  numero: string;
  data: string;
  motivo: string;
  status: 'Em análise' | 'Pendente' | 'Aprovado' | 'Rejeitado';
  descricao: string;
}

@Component({
  selector: 'app-historico-responsavel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historico.html',
  styleUrl: './historico.css'
})
// foi implementado isso aqui (implements OnInit)
export class HistoricoResponsavel implements OnInit {
  // foi implementado isso aqui (service injetado)
  private justificativaService = inject(JustificativaService);

  abas: string[] = ['Todas', 'Pendentes', 'Em análise', 'Aprovados', 'Rejeitados'];
  abaSelecionada: string = 'Todas';

  // foi implementado isso aqui (lista real, começa vazia; os dados mockados saíram)
  listaJustificativas: ItemHistorico[] = [];

  justificativaSelecionada: ItemHistorico | null = null;

  // foi implementado isso aqui (paginação real: 5 itens por página)
  itensPorPagina: number = 5;
  paginaAtual: number = 1;

  // foi implementado isso aqui (carrega as justificativas dos filhos cadastrados)
  ngOnInit() {
    const nomesDosFilhos = this.justificativaService.obterNomesDosFilhos();

    // a lista do service já vem da mais nova para a mais antiga
    this.listaJustificativas = this.justificativaService
      .listar()
      .filter(j => nomesDosFilhos.includes(j.nomeAluno))
      .map(j => this.paraItem(j));
  }

  // foi implementado isso aqui (converte a justificativa salva para o formato da tela)
  private paraItem(j: Justificativa): ItemHistorico {
    const status: ItemHistorico['status'] = {
      pendente: 'Em análise',
      aceita: 'Aprovado',
      rejeitada: 'Rejeitado'
    }[j.status] as ItemHistorico['status'];

    let descricao = 'Aguardando análise da secretaria.';
    if (j.status === 'aceita') {
      descricao = 'Justificativa aceita pela secretaria.';
    } else if (j.status === 'rejeitada') {
      descricao = j.motivoRejeicao?.trim()
        ? j.motivoRejeicao
        : 'Justificativa rejeitada pela secretaria.';
    }

    return {
      aluno: j.nomeAluno,
      numero: this.justificativaService.formatarNumero(j.numero),
      data: this.justificativaService.formatarDataFalta(j.dataFalta),
      motivo: j.motivo,
      status,
      descricao
    };
  }

  // foi implementado isso aqui (todas as que batem com a aba, sem cortar por página)
  get justificativasFiltradas(): ItemHistorico[] {
    if (this.abaSelecionada === 'Todas') {
      return this.listaJustificativas;
    }

    // "Pendentes" e "Em análise" apontam para o mesmo status, igual ao aluno
    return this.listaJustificativas.filter(item => {
      if (this.abaSelecionada === 'Pendentes') return item.status === 'Em análise';
      if (this.abaSelecionada === 'Em análise') return item.status === 'Em análise';
      if (this.abaSelecionada === 'Aprovados') return item.status === 'Aprovado';
      if (this.abaSelecionada === 'Rejeitados') return item.status === 'Rejeitado';
      return true;
    });
  }

  // foi implementado isso aqui (a tela usa este getter: só os itens da página atual)
  get justificativasVisiveis(): ItemHistorico[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.justificativasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  // foi implementado isso aqui (total de páginas calculado, antes era fixo em 3)
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.justificativasFiltradas.length / this.itensPorPagina));
  }

  // foi implementado isso aqui (lista de páginas calculada, antes era [1, 2, 3])
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  selecionarAba(aba: string) {
    this.abaSelecionada = aba;
    this.paginaAtual = 1;
  }

  verDetalhes(item: ItemHistorico) {
    this.justificativaSelecionada = item;
  }

  fecharDetalhes() {
    this.justificativaSelecionada = null;
  }

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  sair() {
    // Lógica de logout
  }
}