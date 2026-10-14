import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Justificativa {
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
export class HistoricoResponsavel {
  abas: string[] = ['Todas', 'Pendentes', 'Em análise', 'Aprovados', 'Rejeitados'];
  abaSelecionada: string = 'Todas';

  // Dados mockados baseados no protótipo do responsável
  listaJustificativas: Justificativa[] = [
    {
      aluno: 'Flávia Santos',
      numero: '3458',
      data: '17/05/2026',
      motivo: 'Consulta médica',
      status: 'Em análise',
      descricao: 'Consulta com pediatra agendada no período da manhã.'
    },
    {
      aluno: 'Henrique Santos',
      numero: '3457',
      data: '10/05/2026',
      motivo: 'Atestado médico',
      status: 'Aprovado',
      descricao: 'Repouso necessário devido a quadro gripal.'
    },
    {
      aluno: 'Henrique Santos',
      numero: '3456',
      data: '16/04/2026',
      motivo: 'Consulta odontológica',
      status: 'Aprovado',
      descricao: 'Ajuste de aparelho ortodôntico.'
    },
    {
      aluno: 'Flávia Santos',
      numero: '3455',
      data: '02/04/2026',
      motivo: 'Declaração',
      status: 'Rejeitado',
      descricao: 'Documento enviado sem assinatura válida.'
    },
    {
      aluno: 'Flávia Santos',
      numero: '3454',
      data: '20/03/2026',
      motivo: 'Atestado médico',
      status: 'Aprovado',
      descricao: 'Afastamento por motivos de saúde.'
    }
  ];

  justificativaSelecionada: Justificativa | null = null;

  // Paginação
  paginas: number[] = [1, 2, 3];
  paginaAtual: number = 1;
  totalPaginas: number = 3;

  get justificativasVisiveis(): Justificativa[] {
    if (this.abaSelecionada === 'Todas') {
      return this.listaJustificativas;
    }
    
    // Mapeamento das abas para os status correspondentes
    return this.listaJustificativas.filter(item => {
      if (this.abaSelecionada === 'Pendentes') return item.status === 'Pendente';
      if (this.abaSelecionada === 'Em análise') return item.status === 'Em análise';
      if (this.abaSelecionada === 'Aprovados') return item.status === 'Aprovado';
      if (this.abaSelecionada === 'Rejeitados') return item.status === 'Rejeitado';
      return true;
    });
  }

  selecionarAba(aba: string) {
    this.abaSelecionada = aba;
    this.paginaAtual = 1;
  }

  verDetalhes(item: Justificativa) {
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