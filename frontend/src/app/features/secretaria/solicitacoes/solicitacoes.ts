import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoes.html',
  styleUrl: './solicitacoes.css'
})
export class SolicitacoesComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  abaAtiva: string = 'Todas';

  listaSolicitacoesBase: any[] = [
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
    }
  ];

  listaSolicitacoes: any[] = [];
  itemSelecionado: any | null = null;
  modalAcao: 'aprovar' | 'rejeitar' | null = null;
  observacao: string = '';

  ngOnInit() {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes() {
    if (isPlatformBrowser(this.platformId)) {
      const salvo = localStorage.getItem('flowix_solicitacoes_ativas');
      if (salvo) {
        try {
          this.listaSolicitacoes = JSON.parse(salvo);
        } catch (e) {
          this.listaSolicitacoes = [...this.listaSolicitacoesBase];
        }
      } else {
        this.listaSolicitacoes = [...this.listaSolicitacoesBase];
        this.salvarSolicitacoesAtivas();
      }
    }
  }

  private salvarSolicitacoesAtivas() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('flowix_solicitacoes_ativas', JSON.stringify(this.listaSolicitacoes));
    }
  }

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
      const itemHistorico = {
        ...this.itemSelecionado,
        status: 'Aprovado',
        observacaoAnalise: this.observacao || 'Aprovado sem observações.'
      };

      this.salvarNoHistorico(itemHistorico);

      this.listaSolicitacoes = this.listaSolicitacoes.filter(i => i.protocolo !== this.itemSelecionado.protocolo);
      this.salvarSolicitacoesAtivas();
    }
    this.fecharModal();
    this.voltarParaLista();
  }

  confirmarRejeicao() {
    if (this.itemSelecionado) {
      const itemHistorico = {
        ...this.itemSelecionado,
        status: 'Rejeitado',
        observacaoAnalise: this.observacao || 'Rejeitado sem observações.'
      };

      this.salvarNoHistorico(itemHistorico);

      this.listaSolicitacoes = this.listaSolicitacoes.filter(i => i.protocolo !== this.itemSelecionado.protocolo);
      this.salvarSolicitacoesAtivas();
    }
    this.fecharModal();
    this.voltarParaLista();
  }

  private salvarNoHistorico(novoItem: any) {
    if (isPlatformBrowser(this.platformId)) {
      const historicoSalvo = localStorage.getItem('flowix_historico');
      let listaHistorico = historicoSalvo ? JSON.parse(historicoSalvo) : [];
      
      listaHistorico.unshift(novoItem);
      
      localStorage.setItem('flowix_historico', JSON.stringify(listaHistorico));
    }
  }
}