import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoes.html',
  styleUrl: './solicitacoes.css'
})
export class SolicitacoesComponent {
  abaAtiva: string = 'Todas';

  // Dados baseados no protótipo
  listaSolicitacoes: any[] = [
    {
      protocolo: '#6739',
      aluno: 'Gabriel Queiroz',
      turma: '9º ano E',
      enviadoEm: '20/05/2026 13:01',
      status: 'Pendente',
      motivo: 'Consulta médica de rotina com apresentação de atestado.',
      documento: 'atestado.pdf (1.2MB)'
    },
    {
      protocolo: '#6738',
      aluno: 'Ana Beatriz Lima',
      turma: '7º ano B',
      enviadoEm: '20/05/2026 10:30',
      status: 'Pendente',
      motivo: 'Problemas de saúde estomacal.',
      documento: 'atestado_ana.pdf (850KB)'
    },
    {
      protocolo: '#6733',
      aluno: 'Bruno Santos',
      turma: '8º ano A',
      enviadoEm: '17/05/2026 17:01',
      status: 'Em análise',
      motivo: 'Atraso devido a transporte escolar quebrado.',
      documento: 'declaracao.pdf (500KB)'
    },
    {
      protocolo: '#6732',
      aluno: 'Carla Mendes',
      turma: '5º ano D',
      enviadoEm: '17/05/2026 16:22',
      status: 'Em análise',
      motivo: 'Consulta oftalmológica.',
      documento: 'receita.pdf (2.1MB)'
    },
    {
      protocolo: '#6730',
      aluno: 'Eduardo Alves',
      turma: '9º ano A',
      enviadoEm: '16/05/2026 14:12',
      status: 'Pendente',
      motivo: 'Febre alta e repouso indicado.',
      documento: 'atestado_eduardo.pdf (1.1MB)'
    },
    {
      protocolo: '#6728',
      aluno: 'Maria Clara',
      turma: '7º ano C',
      enviadoEm: '16/05/2026 08:43',
      status: 'Pendente',
      motivo: 'Exames laboratoriais.',
      documento: 'comprovante.pdf (900KB)'
    }
  ];

  itemSelecionado: any | null = null;

  modalAcao: 'aprovar' | 'rejeitar' | null = null;
  observacao: string = '';

  // Filtra as solicitações de acordo com a aba selecionada
  get solicitacoesFiltradas() {
    if (this.abaAtiva === 'Todas') {
      return this.listaSolicitacoes;
    }
    return this.listaSolicitacoes.filter(item => item.status === this.abaAtiva);
  }

  mudarAba(aba: string) {
    this.abaAtiva = aba;
  }

  verDetalhes(item: any) {
    this.itemSelecionado = item;
    this.modalAcao = null;
    this.observacao = '';
  }

  voltarParaLista() {
    this.itemSelecionado = null;
    this.modalAcao = null;
    this.observacao = '';
  }

  abrirModal(acao: 'aprovar' | 'rejeitar') {
    this.modalAcao = acao;
  }

  fecharModal() {
    this.modalAcao = null;
    this.observacao = '';
  }

  confirmarAprovacao() {
    if (this.itemSelecionado) {
      this.listaSolicitacoes = this.listaSolicitacoes.filter(i => i.protocolo !== this.itemSelecionado.protocolo);
    }
    this.fecharModal();
    this.voltarParaLista();
  }

  confirmarRejeicao() {
    if (this.itemSelecionado) {
      this.listaSolicitacoes = this.listaSolicitacoes.filter(i => i.protocolo !== this.itemSelecionado.protocolo);
    }
    this.fecharModal();
    this.voltarParaLista();
  }
}