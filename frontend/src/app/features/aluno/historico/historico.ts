import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aluno-historico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historico.html',
  styleUrl: './historico.css'
})
export class Historico implements OnInit {
  private platformId = inject(PLATFORM_ID);

  filtroAtual: string = 'Todas';

  // Lista padrão de exemplo
  solicitacoesPadrao = [
    { 
      id: '#3458', 
      data: '17/05/2026', 
      tipo: 'Consulta médica', 
      status: 'Em análise', 
      statusClass: 'em-analise',
      observacao: 'Consulta com pediatra agendada no período da manhã.' 
    },
    { 
      id: '#3457', 
      data: '10/05/2026', 
      tipo: 'Atestado médico', 
      status: 'Aprovado', 
      statusClass: 'aprovado',
      observacao: 'Atestado de 1 dia por motivo de saúde (CID apresentado).' 
    },
    { 
      id: '#3456', 
      data: '16/04/2026', 
      tipo: 'Consulta odontológica', 
      status: 'Aprovado', 
      statusClass: 'aprovado',
      observacao: 'Retorno de tratamento ortodôntico.' 
    },
    { 
      id: '#3455', 
      data: '02/04/2026', 
      tipo: 'Declaração', 
      status: 'Rejeitado', 
      statusClass: 'rejeitado',
      observacao: 'Documento enviado ilegível. Favor reenviar com melhor qualidade.' 
    }
  ];

  todasSolicitacoes: any[] = [];

  paginas = [1, 2, 3];
  paginaAtual: number = 1;

  solicitacaoSelecionada: any = null;
  exibirModal: boolean = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const salvas = localStorage.getItem('lista_solicitacoes');
      if (salvas) {
        try {
          const listaDoStorage = JSON.parse(salvas);
          this.todasSolicitacoes = [...listaDoStorage, ...this.solicitacoesPadrao];
        } catch (e) {
          this.todasSolicitacoes = this.solicitacoesPadrao;
        }
      } else {
        this.todasSolicitacoes = this.solicitacoesPadrao;
        localStorage.setItem('lista_solicitacoes', JSON.stringify(this.solicitacoesPadrao));
      }
    } else {
      this.todasSolicitacoes = this.solicitacoesPadrao;
    }
  }

  filtrar(status: string) {
    this.filtroAtual = status;
  }

  get solicitacoesFiltradas() {
    if (this.filtroAtual === 'Todas') {
      return this.todasSolicitacoes;
    }
    const statusFiltroMap: { [key: string]: string } = {
      'Em análise': 'Em análise',
      'Aprovado': 'Aprovado',
      'Rejeitado': 'Rejeitado',
      'Pendentes': 'Em análise'
    };
    
    const statusBuscado = statusFiltroMap[this.filtroAtual] || this.filtroAtual;
    return this.todasSolicitacoes.filter(item => item.status === statusBuscado);
  }

  visualizarDetalhes(item: any) {
    this.solicitacaoSelecionada = item;
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
    this.solicitacaoSelecionada = null;
  }

  mudarPagina(pagina: number) {
    this.paginaAtual = pagina;
  }
}