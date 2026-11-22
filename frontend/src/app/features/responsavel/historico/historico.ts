
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

interface ItemHistorico {
  id: string;
  aluno: string;
  numero: string;
  data: string;
  motivo: string;
  status: 'Em análise' | 'Pendente' | 'Aprovado' | 'Rejeitado';
  descricao: string;
  temDocumento: boolean;
  docNome: string;
  docTipo: string;
}

@Component({
  selector: 'app-historico-responsavel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historico.html',
  styleUrl: './historico.css'
})
export class HistoricoResponsavel implements OnInit {
  private justificativaService = inject(JustificativaService);
  private sanitizer = inject(DomSanitizer);

  abas: string[] = ['Todas', 'Pendentes', 'Em análise', 'Aprovados', 'Rejeitados'];
  abaSelecionada: string = 'Todas';

  listaJustificativas: ItemHistorico[] = [];

  justificativaSelecionada: ItemHistorico | null = null;

  itensPorPagina: number = 5;
  paginaAtual: number = 1;

  mensagemDocumento: string = '';

  visualizando = false;
  docAtual: ItemHistorico | null = null;
  docEhImagem = false;
  docDataUrl = '';
  docPdfUrl: SafeResourceUrl | null = null;

  // foi implementado isso aqui: carrega as justificativas dos filhos cadastrados
  ngOnInit() {
    const nomesDosFilhos = this.justificativaService.obterNomesDosFilhos();

    this.listaJustificativas = this.justificativaService
      .listar()
      .filter(j => nomesDosFilhos.includes(j.nomeAluno))
      .map(j => this.paraItem(j));
  }

  // foi implementado isso aqui: converte a justificativa salva para o formato da tela
  private paraItem(j: Justificativa): ItemHistorico {
    const status: ItemHistorico['status'] = {
      pendente: 'Em análise',
      aceita: 'Aprovado',
      rejeitada: 'Rejeitado'
    }[j.status] as ItemHistorico['status'];

    let descricao = 'Aguardando análise da secretaria.';

    if (j.status === 'aceita') {
      descricao = j.observacaoAprovacao?.trim() || 'Justificativa aceita pela secretaria.';
    } else if (j.status === 'rejeitada') {
      descricao = j.motivoRejeicao?.trim()
        ? j.motivoRejeicao
        : 'Justificativa rejeitada pela secretaria.';
    }

    return {
      id: j.id,
      aluno: j.nomeAluno,
      numero: this.justificativaService.formatarNumero(j.numero),
      data: this.justificativaService.formatarDataFalta(j.dataFalta),
      motivo: j.motivo,
      status,
      descricao,
      temDocumento: !!j.documento,
      docNome: j.documento?.nome ?? '',
      docTipo: j.documento?.tipo ?? ''
    };
  }

  // foi implementado isso aqui: solicita a senha e limpa somente as justificativas enviadas pela Responsável
  limparHistorico() {
    const senha = window.prompt('Digite a senha para limpar o histórico da Responsável:');

    if (senha === null) return;

    if (senha !== '341657') {
      window.alert('Senha incorreta. O histórico não foi alterado.');
      return;
    }

    const nomesDosFilhos = this.justificativaService.obterNomesDosFilhos();

    const quantidadeRemovida = this.justificativaService.limparJustificativasDaResponsavel(nomesDosFilhos);

    // foi implementado isso aqui: fecha o visualizador e os detalhes antes de atualizar a lista
    this.fecharDocumento();
    this.fecharDetalhes();

    this.listaJustificativas = this.justificativaService
      .listar()
      .filter(j => nomesDosFilhos.includes(j.nomeAluno))
      .map(j => this.paraItem(j));

    this.abaSelecionada = 'Todas';
    this.paginaAtual = 1;

    if (quantidadeRemovida === 0) {
      window.alert('Não havia justificativas enviadas pela Responsável para limpar.');
      return;
    }

    window.alert(
      `${quantidadeRemovida} justificativa(s) enviada(s) pela Responsável foram removidas, junto com seus documentos e notificações relacionadas.`
    );
  }

  get justificativasFiltradas(): ItemHistorico[] {
    if (this.abaSelecionada === 'Todas') {
      return this.listaJustificativas;
    }

    return this.listaJustificativas.filter(item => {
      if (this.abaSelecionada === 'Pendentes') return item.status === 'Em análise';
      if (this.abaSelecionada === 'Em análise') return item.status === 'Em análise';
      if (this.abaSelecionada === 'Aprovados') return item.status === 'Aprovado';
      if (this.abaSelecionada === 'Rejeitados') return item.status === 'Rejeitado';
      return true;
    });
  }

  get justificativasVisiveis(): ItemHistorico[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.justificativasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.justificativasFiltradas.length / this.itensPorPagina));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  selecionarAba(aba: string) {
    this.abaSelecionada = aba;
    this.paginaAtual = 1;
  }

  verDetalhes(item: ItemHistorico) {
    this.justificativaSelecionada = item;
    this.mensagemDocumento = '';
  }

  fecharDetalhes() {
    this.justificativaSelecionada = null;
    this.mensagemDocumento = '';
  }

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  // ---------- documento ----------

  // foi implementado isso aqui: exibe o documento diretamente pela Data URL original, sem conversão para Blob
  verDocumento(item: ItemHistorico) {
    const dataUrl = this.justificativaService.buscarDocumento(item.id);

    if (!dataUrl) {
      this.mensagemDocumento = 'Esta justificativa não tem documento anexado.';
      return;
    }

    this.fecharDocumento();

    this.mensagemDocumento = '';
    this.docAtual = item;
    this.docDataUrl = dataUrl;
    this.docEhImagem = item.docTipo.startsWith('image/');

    // foi implementado isso aqui: solicita ao visualizador PDF que oculte a barra de ferramentas e o painel de navegação
    if (!this.docEhImagem) {
      this.docPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${dataUrl}#toolbar=0&navpanes=0`
      );
    }

    this.visualizando = true;
  }

  // foi implementado isso aqui: fecha o visualizador e limpa os dados do documento atual
  fecharDocumento() {
    this.visualizando = false;
    this.docAtual = null;
    this.docDataUrl = '';
    this.docPdfUrl = null;
  }

  // foi implementado isso aqui: o botão Sair fecha o documento e também os detalhes da justificativa selecionada
  sairDocumento() {
    this.fecharDocumento();
    this.fecharDetalhes();
  }

  sair() {
    // Lógica de logout
  }
}
