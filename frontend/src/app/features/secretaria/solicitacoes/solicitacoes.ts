import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

@Component({
  selector: 'app-secretaria-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitacoes.html',
  styleUrl: './solicitacoes.css'
})
export class SolicitacoesComponent implements OnInit, OnDestroy {
  private service = inject(JustificativaService);
  private sanitizer = inject(DomSanitizer);

  filtroAtual: string = 'Pendentes';
  solicitacoes: Justificativa[] = [];
  mensagem: string = '';

  // foi implementado isso aqui (paginação: 5 solicitações por página)
  itensPorPagina: number = 5;
  paginaAtual: number = 1;

  // ids dos cartões abertos pelo botão "Ver solicitação"
  private abertos = new Set<string>();

  // um único modal para aceitar e rejeitar
  exibirModal = false;
  acaoModal: 'aceitar' | 'rejeitar' = 'aceitar';
  alvoModal: Justificativa | null = null;
  observacao = '';
  erroModal = '';

  // estado do visualizador de documento, que abre dentro da página
  visualizando = false;
  docAtual: Justificativa | null = null;
  docEhImagem = false;
  docDataUrl = '';
  docPdfUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;
  editando = false;
  rotacao = 0;
  zoom = 1;
  avisoDoc = '';

  ngOnInit() {
    this.carregar();
  }

  ngOnDestroy() {
    this.liberarBlob();
  }

  private carregar() {
    this.solicitacoes = this.service.listar();
  }

  filtrar(filtro: string) {
    this.filtroAtual = filtro;
    this.mensagem = '';
    // foi implementado isso aqui (ao trocar de aba, volta para a página 1)
    this.paginaAtual = 1;
  }

  get solicitacoesFiltradas(): Justificativa[] {
    const mapa: Record<string, string> = {
      Pendentes: 'pendente',
      Aprovadas: 'aceita',
      Rejeitadas: 'rejeitada'
    };
    const alvo = mapa[this.filtroAtual];
    return alvo ? this.solicitacoes.filter(j => j.status === alvo) : this.solicitacoes;
  }

  // foi implementado isso aqui (total de páginas, calculado a partir da lista filtrada)
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.solicitacoesFiltradas.length / this.itensPorPagina));
  }

  // foi implementado isso aqui (números dos botões de página: 1, 2, 3...)
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // foi implementado isso aqui (só as solicitações da página atual; a página 2 mostra as mais antigas)
  get solicitacoesDaPagina(): Justificativa[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.solicitacoesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  // foi implementado isso aqui (só muda para uma página que existe)
  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  // foi implementado isso aqui (depois de aceitar ou rejeitar a lista encolhe; se a página atual deixou de existir, volta para a última)
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
    return { pendente: 'Em análise', aceita: 'Aprovada', rejeitada: 'Rejeitada' }[j.status];
  }

  statusClasse(j: Justificativa): string {
    return { pendente: 'em-analise', aceita: 'aprovado', rejeitada: 'rejeitado' }[j.status];
  }

  enviadoPor(j: Justificativa): string {
    return j.enviadoPor === 'responsavel' ? 'Responsável' : 'Aluno';
  }

  // abre e fecha os detalhes do cartão
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
  async verDocumento(j: Justificativa) {
    this.mensagem = '';
    const dataUrl = this.service.buscarDocumento(j.id);

    if (!dataUrl) {
      this.mensagem = `A justificativa ${this.numero(j)} não tem documento anexado.`;
      return;
    }

    this.fecharDocumento();

    this.docAtual = j;
    this.docDataUrl = dataUrl;
    this.docEhImagem = (j.documento?.tipo ?? '').startsWith('image/');

    // PDF: precisa virar um endereço temporário para aparecer dentro da página
    if (!this.docEhImagem) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        this.blobUrl = URL.createObjectURL(blob);
        this.docPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
      } catch {
        this.docAtual = null;
        this.mensagem = 'Não foi possível abrir o documento.';
        return;
      }
    }

    this.visualizando = true;
  }

  fecharDocumento() {
    this.visualizando = false;
    this.docAtual = null;
    this.docDataUrl = '';
    this.docPdfUrl = null;
    this.editando = false;
    this.rotacao = 0;
    this.zoom = 1;
    this.avisoDoc = '';
    this.liberarBlob();
  }

  private liberarBlob() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  iniciarEdicao() {
    if (!this.docEhImagem) return;
    this.avisoDoc = '';
    this.rotacao = 0;
    this.zoom = 1;
    this.editando = true;
  }

  cancelarEdicao() {
    this.editando = false;
    this.rotacao = 0;
    this.zoom = 1;
  }

  girar(graus: number) {
    this.rotacao = (this.rotacao + graus) % 360;
  }

  alterarZoom(passo: number) {
    this.zoom = Math.min(3, Math.max(0.5, Math.round((this.zoom + passo) * 10) / 10));
  }

  get transformacao(): string {
    return `rotate(${this.rotacao}deg) scale(${this.zoom})`;
  }

  async salvarEdicao() {
    if (!this.docAtual) return;

    const graus = ((this.rotacao % 360) + 360) % 360;

    // nada foi girado: só sai do modo de edição
    if (graus === 0) {
      this.cancelarEdicao();
      return;
    }

    try {
      const novo = await this.rotacionarImagem(
        this.docDataUrl,
        graus,
        this.docAtual.documento?.tipo ?? 'image/jpeg'
      );

      // tamanho aproximado do arquivo, a partir do texto base64
      const tamanho = Math.round(novo.length * 0.75);

      this.service.substituirDocumento(this.docAtual.id, novo, tamanho);

      this.docDataUrl = novo;
      this.cancelarEdicao();
      this.carregar();
      this.avisoDoc = 'Alterações salvas no documento.';
    } catch {
      this.avisoDoc = 'Não foi possível salvar. A imagem editada pode ser grande demais.';
    }
  }

  private rotacionarImagem(dataUrl: string, graus: number, tipo: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const trocaLados = graus === 90 || graus === 270;
        const canvas = document.createElement('canvas');
        canvas.width = trocaLados ? img.height : img.width;
        canvas.height = trocaLados ? img.width : img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas indisponível'));
          return;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((graus * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const saida = tipo === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(saida, 0.92));
      };

      img.onerror = () => reject(new Error('imagem inválida'));
      img.src = dataUrl;
    });
  }

  // ---------- responder ----------
  abrirAceitar(j: Justificativa) {
    this.abrirModal(j, 'aceitar');
  }

  abrirRejeicao(j: Justificativa) {
    this.abrirModal(j, 'rejeitar');
  }

  private abrirModal(j: Justificativa, acao: 'aceitar' | 'rejeitar') {
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

  // observação opcional ao aceitar, obrigatória ao rejeitar
  confirmarModal() {
    if (!this.alvoModal) return;

    const texto = this.observacao.trim();

    if (this.acaoModal === 'rejeitar' && !texto) {
      this.erroModal = 'Informe o motivo da rejeição.';
      return;
    }

    const j = this.alvoModal;
    const aceitar = this.acaoModal === 'aceitar';

    this.service.responder(j.id, aceitar ? 'aceita' : 'rejeitada', texto);
    this.fecharModal();
    this.carregar();
    // foi implementado isso aqui (garante que a página atual ainda existe depois da resposta)
    this.ajustarPagina();
    this.mensagem =
      `Justificativa ${this.numero(j)} ${aceitar ? 'aprovada' : 'rejeitada'}. ` +
      `Aluno e responsável foram notificados.`;
  }
}