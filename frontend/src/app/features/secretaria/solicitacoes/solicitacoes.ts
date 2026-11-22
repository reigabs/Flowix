
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

@Component({
  selector: 'app-secretaria-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoes.html',
  styleUrl: './solicitacoes.css'
})
export class SolicitacoesComponent implements OnInit {
  private service = inject(JustificativaService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  filtroAtual: string = 'Pendentes';
  solicitacoes: Justificativa[] = [];
  mensagem: string = '';

  // Paginação: 5 solicitações por página
  itensPorPagina: number = 5;
  paginaAtual: number = 1;

  // IDs dos cartões abertos pelo botão "Ver solicitação"
  private abertos = new Set<string>();

  // Modal único para aceitar e rejeitar
  exibirModal = false;
  acaoModal: 'aceitar' | 'rejeitar' = 'aceitar';
  alvoModal: Justificativa | null = null;
  observacao = '';
  erroModal = '';

  // Estado do visualizador de documentos
  visualizando = false;
  docAtual: Justificativa | null = null;
  docEhImagem = false;
  docDataUrl = '';
  docPdfUrl: SafeResourceUrl | null = null;

  ngOnInit() {
    this.carregar();
  }

  private carregar() {
    this.solicitacoes = this.service.listar();
  }

  filtrar(filtro: string) {
    this.filtroAtual = filtro;
    this.mensagem = '';
    this.paginaAtual = 1;
  }

  get solicitacoesFiltradas(): Justificativa[] {
    const mapa: Record<string, string> = {
      Pendentes: 'pendente',
      Aprovadas: 'aceita',
      Rejeitadas: 'rejeitada'
    };

    const alvo = mapa[this.filtroAtual];

    return alvo
      ? this.solicitacoes.filter(j => j.status === alvo)
      : this.solicitacoes;
  }

  // Total de páginas calculado a partir da lista filtrada
  get totalPaginas(): number {
    return Math.max(
      1,
      Math.ceil(this.solicitacoesFiltradas.length / this.itensPorPagina)
    );
  }

  // Números dos botões de página
  get paginas(): number[] {
    return Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );
  }

  // Solicitações da página atual
  get solicitacoesDaPagina(): Justificativa[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;

    return this.solicitacoesFiltradas.slice(
      inicio,
      inicio + this.itensPorPagina
    );
  }

  // Só permite navegar para páginas existentes
  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  // Ajusta a página depois de aceitar ou rejeitar uma solicitação
  private ajustarPagina() {
    if (this.paginaAtual > this.totalPaginas) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  contar(status: 'pendente' | 'aceita' | 'rejeitada'): number {
    return this.solicitacoes.filter(j => j.status === status).length;
  }

  // ---------- exibição ----------

  numero(j: Justificativa): string {
    return this.service.formatarNumero(j.numero);
  }

  dataFalta(j: Justificativa): string {
    return this.service.formatarDataFalta(j.dataFalta);
  }

  dataEnvio(j: Justificativa): string {
    return new Date(j.dataEnvio).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  statusTexto(j: Justificativa): string {
    return {
      pendente: 'Em análise',
      aceita: 'Aprovada',
      rejeitada: 'Rejeitada'
    }[j.status];
  }

  statusClasse(j: Justificativa): string {
    return {
      pendente: 'em-analise',
      aceita: 'aprovado',
      rejeitada: 'rejeitado'
    }[j.status];
  }

  enviadoPor(j: Justificativa): string {
    return j.enviadoPor === 'responsavel'
      ? 'Responsável'
      : 'Aluno';
  }

  // ---------- detalhes da solicitação ----------

  alternarDetalhes(j: Justificativa) {
    if (this.abertos.has(j.id)) {
      this.abertos.delete(j.id);
    } else {
      this.abertos.add(j.id);
    }
  }

  estaAberto(j: Justificativa): boolean {
    return this.abertos.has(j.id);
  }

  // ---------- documento ----------

  // foi ajustado isso aqui: abre o documento diretamente pela Data URL, sem aguardar fetch ou conversão para Blob
  verDocumento(j: Justificativa) {
    this.mensagem = '';

    const dataUrl = this.service.buscarDocumento(j.id);

    if (!dataUrl) {
      this.mensagem =
        `A justificativa ${this.numero(j)} não tem documento anexado.`;

      return;
    }

    this.fecharDocumento();

    this.docAtual = j;
    this.docDataUrl = dataUrl;
    this.docEhImagem = (j.documento?.tipo ?? '').startsWith('image/');

    // foi ajustado isso aqui: utiliza a Data URL original para exibir o PDF imediatamente
    if (!this.docEhImagem) {
      this.docPdfUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(
          `${dataUrl}#toolbar=0&navpanes=0`
        );
    }

    // foi ajustado isso aqui: ativa o visualizador sem esperar processamento assíncrono
    this.visualizando = true;

    // Atualiza a interface imediatamente após preparar o documento
    this.cdr.detectChanges();
  }

  // foi implementado isso aqui: permite à Secretaria baixar o documento original diretamente pelo Flowix
  baixarDocumento(j: Justificativa) {
    this.mensagem = '';

    const dataUrl = this.service.buscarDocumento(j.id);

    if (!dataUrl) {
      this.mensagem =
        `A justificativa ${this.numero(j)} não tem documento anexado.`;

      return;
    }

    // foi implementado isso aqui: utiliza o nome original do arquivo no download
    const nomeArquivo = j.documento?.nome?.trim() || `documento-${this.numero(j)}`;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = nomeArquivo;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  fecharDocumento() {
    this.visualizando = false;
    this.docAtual = null;
    this.docDataUrl = '';
    this.docPdfUrl = null;
  }

  // ---------- responder ----------

  abrirAceitar(j: Justificativa) {
    this.abrirModal(j, 'aceitar');
  }

  abrirRejeicao(j: Justificativa) {
    this.abrirModal(j, 'rejeitar');
  }

  private abrirModal(
    j: Justificativa,
    acao: 'aceitar' | 'rejeitar'
  ) {
    this.alvoModal = j;
    this.acaoModal = acao;
    this.observacao = '';
    this.erroModal = '';
    this.exibirModal = true;
  }

  fecharModal() {
    this.exibirModal = false;
    this.alvoModal = null;
  }

  // Observação opcional ao aceitar e obrigatória ao rejeitar
  confirmarModal() {
    if (!this.alvoModal) return;

    const texto = this.observacao.trim();

    if (this.acaoModal === 'rejeitar' && !texto) {
      this.erroModal = 'Informe o motivo da rejeição.';
      return;
    }

    const j = this.alvoModal;
    const aceitar = this.acaoModal === 'aceitar';

    this.service.responder(
      j.id,
      aceitar ? 'aceita' : 'rejeitada',
      texto
    );

    this.fecharModal();
    this.carregar();

    // Garante que a página atual ainda existe depois da resposta
    this.ajustarPagina();

    this.mensagem =
      `Justificativa ${this.numero(j)} ${aceitar ? 'aprovada' : 'rejeitada'}. ` +
      `Aluno e responsável foram notificados.`;
  }
}
