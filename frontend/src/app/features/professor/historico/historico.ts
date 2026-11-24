
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

interface ItemHistorico {
  id: string;
  numeroRelatorio: string;
  usuario: string;
  dataFalta: string;
  enviadoEm: string;
  enviadoPor: string;
  status: 'Aprovado' | 'Rejeitado';
  motivo: string;
  documento: string;
  temDocumento: boolean;
  observacaoAnalise: string;
  tipoDocumento?: string;
  nomeDocumento?: string;
}

@Component({
  selector: 'app-professor-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historico.html',
  styleUrl: './historico.css'
})
export class Historico implements OnInit, OnDestroy {
  private service = inject(JustificativaService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  itemSelecionado: ItemHistorico | null = null;
  paginaAtual: number = 1;
  itensPorPagina: number = 5;
  mensagemDocumento: string = '';
  listaHistorico: ItemHistorico[] = [];

  visualizando: boolean = false;
  docAtual: ItemHistorico | null = null;
  docEhImagem: boolean = false;
  docDataUrl: string = '';
  docPdfUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;

  ngOnInit() {
    this.carregarHistorico();
  }

  carregarHistorico() {
    this.listaHistorico = this.service
      .listar()
      .filter(j => j.status !== 'pendente')
      .sort((a, b) => (b.respostaEm ?? '').localeCompare(a.respostaEm ?? ''))
      .map(j => this.paraItem(j));

    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  private paraItem(j: Justificativa): ItemHistorico {
    const aprovada = j.status === 'aceita';

    return {
      id: j.id,
      numeroRelatorio: `N° ${this.service.formatarNumero(j.numero)}`,
      usuario: j.enviadoPor === 'responsavel'
        ? (j.nomeResponsavel?.trim() || 'Responsável')
        : j.nomeAluno,
      dataFalta: this.service.formatarDataFalta(j.dataFalta),
      enviadoEm: new Date(j.dataEnvio).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }),
      enviadoPor: j.enviadoPor === 'responsavel' ? 'Responsável' : 'Aluno',
      status: aprovada ? 'Aprovado' : 'Rejeitado',
      motivo: j.motivo,
      documento: j.documento
        ? `${j.documento.nome} (${this.formatarTamanho(j.documento.tamanho)})`
        : 'Sem anexo',
      temDocumento: !!j.documento,
      observacaoAnalise: aprovada
        ? (j.observacaoAprovacao?.trim() || 'Justificativa aceita pela secretaria.')
        : (j.motivoRejeicao?.trim() || 'Justificativa rejeitada pela secretaria.'),
      tipoDocumento: j.documento?.tipo,
      nomeDocumento: j.documento?.nome
    };
  }

  private formatarTamanho(bytes: number): string {
    return bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
      : `${Math.round(bytes / 1024)}KB`;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.listaHistorico.length / this.itensPorPagina));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get itensDaPagina(): ItemHistorico[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.listaHistorico.slice(inicio, inicio + this.itensPorPagina);
  }

  verDetalhes(item: ItemHistorico) {
    this.itemSelecionado = item;
    this.mensagemDocumento = '';
  }

  voltarParaLista() {
    this.itemSelecionado = null;
    this.mensagemDocumento = '';
  }

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  limparHistoricoCompleto() {
    const senha = window.prompt('Digite a senha para limpar todos os dados do Flowix:');

    if (senha === null) {
      return;
    }

    if (senha.trim() !== '2026') {
      window.alert('Senha incorreta. Nenhum dado foi apagado.');
      return;
    }

    const totalRemovido = this.service.limparTodosOsDadosDaSecretaria();

    this.fecharDocumento();
    this.itemSelecionado = null;
    this.paginaAtual = 1;
    this.mensagemDocumento = '';
    this.carregarHistorico();

    window.alert(
      `Limpeza concluída! ${totalRemovido} justificativa(s) removida(s). Todos os documentos e notificações também foram apagados.`
    );
  }

  async abrirDocumento(item: ItemHistorico) {
    this.mensagemDocumento = '';

    const dataUrl = this.service.buscarDocumento(item.id);

    if (!dataUrl) {
      this.mensagemDocumento = 'Não foi possível encontrar o documento anexado.';
      return;
    }

    this.fecharDocumento();

    this.docAtual = item;
    this.docDataUrl = dataUrl;
    this.docEhImagem = item.tipoDocumento?.startsWith('image/') ?? false;

    if (this.docEhImagem) {
      this.visualizando = true;
      return;
    }

    try {
      const resposta = await fetch(dataUrl);
      const blob = await resposta.blob();

      this.blobUrl = URL.createObjectURL(blob);

      this.docPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.blobUrl}#toolbar=0&navpanes=0`
      );

      this.visualizando = true;
      this.cdr.detectChanges();
    } catch {
      this.fecharDocumento();
      this.mensagemDocumento = 'Não foi possível abrir o documento.';
      this.cdr.detectChanges();
    }
  }

  fecharDocumento() {
    this.visualizando = false;
    this.docAtual = null;
    this.docEhImagem = false;
    this.docDataUrl = '';
    this.docPdfUrl = null;

    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  ngOnDestroy() {
    this.fecharDocumento();
  }
}
