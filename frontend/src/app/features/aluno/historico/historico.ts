// foi implementado isso aqui (OnDestroy adicionado ao import, para liberar o PDF aberto ao sair da tela)
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// foi implementado isso aqui (necessário para exibir o PDF dentro da página)
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// foi implementado isso aqui (service e model compartilhados)
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

// foi implementado isso aqui (formato de cada linha do histórico, montado a partir da justificativa real)
interface ItemHistorico {
  id: string;
  numero: string;
  data: string;        // data da falta
  dataEnvio: string;
  tipo: string;        // motivo
  status: string;
  statusClass: string;
  observacao: string;
  // foi implementado isso aqui (dados do documento e se ainda está em análise, para o visualizador)
  emAnalise: boolean;
  temDocumento: boolean;
  docNome: string;
  docTipo: string;
}

@Component({
  selector: 'app-aluno-historico',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './historico.html',
  styleUrl: './historico.css'
})
// foi implementado isso aqui (implements OnDestroy)
export class Historico implements OnInit, OnDestroy {
  // foi implementado isso aqui (service injetado)
  private justificativaService = inject(JustificativaService);
  // foi implementado isso aqui (sanitizer injetado)
  private sanitizer = inject(DomSanitizer);

  filtroAtual: string = 'Todas';

  // foi implementado isso aqui (lista real, começa vazia; a lista de exemplo saiu)
  todasSolicitacoes: ItemHistorico[] = [];

  // foi implementado isso aqui (paginação real: 5 itens por página; antes era [1, 2, 3] fixo)
  itensPorPagina: number = 5;
  paginaAtual: number = 1;

  solicitacaoSelecionada: ItemHistorico | null = null;
  exibirModal: boolean = false;

  // foi implementado isso aqui (aviso quando o documento não abre)
  mensagemDocumento: string = '';

  // foi implementado isso aqui (estado do visualizador de documento, que abre dentro da página)
  visualizando = false;
  docAtual: ItemHistorico | null = null;
  docEhImagem = false;
  docDataUrl = '';
  docPdfUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;
  editando = false;
  rotacao = 0;
  zoom = 1;
  avisoDoc = '';

  // foi implementado isso aqui (carrega só as justificativas do aluno logado)
  ngOnInit() {
    this.carregar();
  }

  // foi implementado isso aqui (libera o PDF da memória ao sair da tela)
  ngOnDestroy() {
    this.liberarBlob();
  }

  // foi implementado isso aqui (separado do ngOnInit para poder recarregar depois de salvar a edição)
  private carregar() {
    const nome = this.justificativaService.obterNomeAlunoLogado();

    // a lista do service já vem da mais nova para a mais antiga
    this.todasSolicitacoes = this.justificativaService
      .listar()
      .filter(j => j.nomeAluno === nome)
      .map(j => this.paraItem(j));
  }

  // foi implementado isso aqui (converte a justificativa salva para o formato da tela)
  private paraItem(j: Justificativa): ItemHistorico {
    const svc = this.justificativaService;

    const status = {
      pendente:  { texto: 'Em análise', classe: 'em-analise' },
      aceita:    { texto: 'Aprovado',   classe: 'aprovado' },
      rejeitada: { texto: 'Rejeitado',  classe: 'rejeitado' }
    }[j.status];

    let observacao = 'Aguardando análise da secretaria.';
    if (j.status === 'aceita') {
      // foi implementado isso aqui (mostra a observação opcional que a secretaria escreveu ao aceitar)
      observacao = j.observacaoAprovacao?.trim() || 'Justificativa aceita pela secretaria.';
    } else if (j.status === 'rejeitada') {
      observacao = j.motivoRejeicao?.trim()
        ? j.motivoRejeicao
        : 'Justificativa rejeitada pela secretaria.';
    }

    return {
      id: j.id,
      numero: svc.formatarNumero(j.numero),
      data: svc.formatarDataFalta(j.dataFalta),
      dataEnvio: new Date(j.dataEnvio).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      }),
      tipo: j.motivo,
      status: status.texto,
      statusClass: status.classe,
      observacao,
      // foi implementado isso aqui (dados do documento para o visualizador)
      emAnalise: j.status === 'pendente',
      temDocumento: !!j.documento,
      docNome: j.documento?.nome ?? '',
      docTipo: j.documento?.tipo ?? ''
    };
  }

  filtrar(status: string) {
    this.filtroAtual = status;
    // foi implementado isso aqui (ao trocar de aba, volta para a página 1)
    this.paginaAtual = 1;
  }

  get solicitacoesFiltradas(): ItemHistorico[] {
    if (this.filtroAtual === 'Todas') {
      return this.todasSolicitacoes;
    }
    // "Pendentes" e "Em análise" apontam para o mesmo status por enquanto
    const alvo = this.filtroAtual === 'Pendentes' ? 'Em análise' : this.filtroAtual;
    return this.todasSolicitacoes.filter(item => item.status === alvo);
  }

  // foi implementado isso aqui (total de páginas calculado a partir da lista filtrada)
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.solicitacoesFiltradas.length / this.itensPorPagina));
  }

  // foi implementado isso aqui (números dos botões de página: 1, 2, 3...)
  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // foi implementado isso aqui (só os itens da página atual; a página 2 mostra os mais antigos)
  get solicitacoesDaPagina(): ItemHistorico[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.solicitacoesFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  visualizarDetalhes(item: ItemHistorico) {
    this.solicitacaoSelecionada = item;
    this.exibirModal = true;
    this.mensagemDocumento = '';
  }

  fecharModal() {
    this.exibirModal = false;
    this.solicitacaoSelecionada = null;
    this.mensagemDocumento = '';
  }

  // foi implementado isso aqui (só muda para uma página que existe)
  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  // ---------- documento ----------
  // foi implementado isso aqui (abre o documento num painel dentro da própria página, sem trocar a URL e sem outra aba)
  async verDocumento(item: ItemHistorico) {
    this.mensagemDocumento = '';
    const dataUrl = this.justificativaService.buscarDocumento(item.id);

    if (!dataUrl) {
      this.mensagemDocumento = 'Esta justificativa não tem documento anexado.';
      return;
    }

    this.fecharDocumento();

    this.docAtual = item;
    this.docDataUrl = dataUrl;
    this.docEhImagem = item.docTipo.startsWith('image/');

    // PDF: precisa virar um endereço temporário para aparecer dentro da página
    if (!this.docEhImagem) {
      try {
        const blob = await (await fetch(dataUrl)).blob();
        this.blobUrl = URL.createObjectURL(blob);
        this.docPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
      } catch {
        this.docAtual = null;
        this.mensagemDocumento = 'Não foi possível abrir o documento.';
        return;
      }
    }

    this.visualizando = true;
  }

  // foi implementado isso aqui (botão "Sair": fecha o painel e descarta o que não foi salvo)
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

  // foi implementado isso aqui (a edição só vale para imagens e enquanto a justificativa está em análise)
  get podeEditar(): boolean {
    return this.docEhImagem && !!this.docAtual?.emAnalise;
  }

  // foi implementado isso aqui (texto que explica por que o botão "Editar documento" pode estar desativado)
  get dicaEdicao(): string {
    if (!this.docEhImagem) return 'A edição está disponível só para imagens (JPG e PNG)';
    if (!this.docAtual?.emAnalise) return 'O documento só pode ser editado enquanto a justificativa está em análise';
    return 'Girar e ampliar a imagem';
  }

  // foi implementado isso aqui (botão "Editar documento": liga as ferramentas)
  iniciarEdicao() {
    if (!this.podeEditar) return;
    this.avisoDoc = '';
    this.rotacao = 0;
    this.zoom = 1;
    this.editando = true;
  }

  // foi implementado isso aqui (botão "Cancelar" da edição: desfaz o que não foi salvo)
  cancelarEdicao() {
    this.editando = false;
    this.rotacao = 0;
    this.zoom = 1;
  }

  // foi implementado isso aqui (gira a imagem para a esquerda ou direita)
  girar(graus: number) {
    this.rotacao = (this.rotacao + graus) % 360;
  }

  // foi implementado isso aqui (amplia ou reduz a imagem, entre 50% e 300%)
  alterarZoom(passo: number) {
    this.zoom = Math.min(3, Math.max(0.5, Math.round((this.zoom + passo) * 10) / 10));
  }

  // foi implementado isso aqui (estilo aplicado na imagem enquanto edita)
  get transformacao(): string {
    return `rotate(${this.rotacao}deg) scale(${this.zoom})`;
  }

  // foi implementado isso aqui (botão "Salvar": grava a rotação no documento da justificativa)
  async salvarEdicao() {
    if (!this.docAtual) return;

    const graus = ((this.rotacao % 360) + 360) % 360;

    // nada foi girado: só sai do modo de edição
    if (graus === 0) {
      this.cancelarEdicao();
      return;
    }

    try {
      const novo = await this.rotacionarImagem(this.docDataUrl, graus, this.docAtual.docTipo);

      // tamanho aproximado do arquivo, a partir do texto base64
      const tamanho = Math.round(novo.length * 0.75);

      this.justificativaService.substituirDocumento(this.docAtual.id, novo, tamanho);

      this.docDataUrl = novo;
      this.cancelarEdicao();
      this.avisoDoc = 'Alterações salvas no documento.';
    } catch {
      this.avisoDoc = 'Não foi possível salvar. A imagem editada pode ser grande demais.';
    }
  }

  // foi implementado isso aqui (aplica a rotação na imagem de verdade, usando um canvas)
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
}