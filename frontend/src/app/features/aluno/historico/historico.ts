
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

type StatusJustificativa =
  | 'Em análise'
  | 'Pendente'
  | 'Aprovado'
  | 'Rejeitado';

interface Justificativa {
  numero: string;
  data: string;
  motivo: string;
  status: StatusJustificativa;
  descricao: string;
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './historico.html',
  styleUrl: './historico.css'
})
export class Historico {
  abaSelecionada = 'Todas';
  paginaAtual = 1;
  itensPorPagina = 5;
  justificativaSelecionada: Justificativa | null = null;

  abas = [
    'Todas',
    'Pendentes',
    'Em análise',
    'Aprovados',
    'Rejeitados'
  ];

  justificativas: Justificativa[] = [
    {
      numero: '3458',
      data: '17/05/2026',
      motivo: 'Consulta médica',
      status: 'Em análise',
      descricao: 'Justificativa enviada para análise da secretaria.'
    },
    {
      numero: '3457',
      data: '10/05/2026',
      motivo: 'Atestado médico',
      status: 'Aprovado',
      descricao: 'Documento analisado e aprovado pela secretaria.'
    },
    {
      numero: '3456',
      data: '16/04/2026',
      motivo: 'Consulta odontológica',
      status: 'Aprovado',
      descricao: 'Justificativa aprovada pela secretaria.'
    },
    {
      numero: '3455',
      data: '02/04/2026',
      motivo: 'Declaração',
      status: 'Rejeitado',
      descricao: 'Documento não aceito. Consulte a secretaria para verificar o motivo.'
    },
    {
      numero: '3454',
      data: '20/03/2026',
      motivo: 'Atestado médico',
      status: 'Aprovado',
      descricao: 'Documento analisado e aprovado pela secretaria.'
    },
    {
      numero: '3453',
      data: '12/03/2026',
      motivo: 'Problema de saúde',
      status: 'Pendente',
      descricao: 'Aguardando análise da secretaria.'
    },
    {
      numero: '3452',
      data: '05/03/2026',
      motivo: 'Consulta médica',
      status: 'Aprovado',
      descricao: 'Justificativa aprovada pela secretaria.'
    },
    {
      numero: '3451',
      data: '22/02/2026',
      motivo: 'Problema familiar',
      status: 'Rejeitado',
      descricao: 'Justificativa não aprovada. Procure a secretaria para mais informações.'
    },
    {
      numero: '3450',
      data: '15/02/2026',
      motivo: 'Atestado médico',
      status: 'Aprovado',
      descricao: 'Documento analisado e aprovado pela secretaria.'
    },
    {
      numero: '3449',
      data: '08/02/2026',
      motivo: 'Consulta médica',
      status: 'Pendente',
      descricao: 'Aguardando análise da secretaria.'
    },
    {
      numero: '3448',
      data: '28/01/2026',
      motivo: 'Consulta odontológica',
      status: 'Aprovado',
      descricao: 'Justificativa aprovada pela secretaria.'
    },
    {
      numero: '3447',
      data: '15/01/2026',
      motivo: 'Declaração',
      status: 'Rejeitado',
      descricao: 'Documento não aprovado pela secretaria.'
    }
  ];

  get justificativasFiltradas(): Justificativa[] {
    if (this.abaSelecionada === 'Todas') {
      return this.justificativas;
    }

    const statusPorAba: Record<string, StatusJustificativa> = {
      'Pendentes': 'Pendente',
      'Em análise': 'Em análise',
      'Aprovados': 'Aprovado',
      'Rejeitados': 'Rejeitado'
    };

    const status = statusPorAba[this.abaSelecionada];

    return this.justificativas.filter(
      item => item.status === status
    );
  }

  get justificativasVisiveis(): Justificativa[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;

    return this.justificativasFiltradas.slice(
      inicio,
      inicio + this.itensPorPagina
    );
  }

  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.justificativasFiltradas.length / this.itensPorPagina)
    );
  }

  get paginas(): number[] {
    return Array.from(
      { length: this.totalPaginas },
      (_, indice) => indice + 1
    );
  }

  selecionarAba(aba: string): void {
    this.abaSelecionada = aba;
    this.paginaAtual = 1;
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  verDetalhes(item: Justificativa): void {
    this.justificativaSelecionada = item;
  }

  fecharDetalhes(): void {
    this.justificativaSelecionada = null;
  }

  sair(): void {
  }
}
