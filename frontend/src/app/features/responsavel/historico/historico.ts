// foi implementado isso aqui (OnDestroy adicionado ao import, para liberar o PDF aberto ao sair da tela)
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
// foi implementado isso aqui (necessário para exibir o PDF dentro da página)
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// foi implementado isso aqui (service e model compartilhados)
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

// foi implementado isso aqui (interface renomeada de Justificativa para ItemHistorico, para não conflitar com o model)
interface ItemHistorico {
  // foi implementado isso aqui (id da justificativa, para buscar e salvar o documento)
  id: string;
  aluno: string;
  numero: string;
  data: string;
  motivo: string;
  status: 'Em análise' | 'Pendente' | 'Aprovado' | 'Rejeitado';
  descricao: string;
  // foi implementado isso aqui (dados do documento e se ainda está em análise, para o visualizador)
  emAnalise: boolean;
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
// foi implementado isso aqui (implements OnInit e OnDestroy)
export class HistoricoResponsavel implements OnInit, OnDestroy {
  // foi implementado isso aqui (service injetado)
  private justificativaService = inject(JustificativaService);
  // foi implementado isso aqui (sanitizer injetado)
  private sanitizer = inject(DomSanitizer);

  abas: string[] = ['Todas', 'Pendentes', 'Em análise', 'Aprovados', 'Rejeitados'];
  abaSelecionada: string = 'Todas';

  // foi implementado isso aqui (lista real, começa vazia; os dados mockados saíram)
  listaJustificativas: ItemHistorico[] = [];

  justificativaSelecionada: ItemHistorico | null = null;

  // foi implementado isso aqui (paginação real: 5 itens por página)
  itensPorPagina: number = 5;
  paginaAtual: number = 1;

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

  // foi implementado isso aqui (carrega as justificativas dos filhos cadastrados)
  ngOnInit() {
    const nomesDosFilhos = this.justificativaService.obterNomesDosFilhos();

    // a lista do service já vem da mais nova para a mais antiga
    this.listaJustificativas = this.justificativaService
      .listar()
      .filter(j => nomesDosFilhos.includes(j.nomeAluno))
      .map(j => this.paraItem(j));
  }

  // foi implementado isso aqui (libera o PDF da memória ao sair da tela)
  ngOnDestroy() {
    this.liberarBlob();
  }

  // foi implementado isso aqui (converte a justificativa salva para o formato da tela)
  private paraItem(j: Justificativa): ItemHistorico {
    const status: ItemHistorico['status'] = {
      pendente: 'Em análise',
      aceita: 'Aprovado',
      rejeitada: 'Rejeitado'
    }[j.status] as ItemHistorico['status'];

    let descricao = 'Aguardando análise da secretaria.';
    if (j.status === 'aceita') {
      // foi implementado isso aqui (mostra a observação opcional que a secretaria escreveu ao aceitar)
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
      // foi implementado isso aqui (dados do documento para o visualizador)
      emAnalise: j.status === 'pendente',
      temDocumento: !!j.documento,
      docNome: j.documento?.nome ?? '',
      docTipo: j.documento?.tipo ?? ''
    };
  }

  // foi implementado isso aqui (todas as que batem com a aba, sem cortar por página)
  get justificativasFiltradas(): ItemHistorico[] {
    if (this.abaSelecionada === 'Todas') {
      return this.listaJustificativas;
    }

    // "Pendentes" e "Em análise" apontam para o mesmo status, igual ao aluno
    return this.listaJustificativas.filter(item => {
      if (this.abaSelecionada === 'Pendentes') return item.status === 'Em análise';
      if (this.abaSelecionada === 'Em análise') return item.status === 'Em análise';
      if (this.abaSelecionada === 'Aprovados') return item.status === 'Aprovado';
      if (this.abaSelecionada === 'Rejeitados') return item.status === 'Rejeitado';
      return true;
    });
  }

  // foi implementado isso aqui (a tela usa este getter: só os itens da página atual)
  get justificativasVisiveis(): ItemHistorico[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.justificativasFiltradas.slice(inicio, inicio + this.itensPorPagina);
  }

  // foi implementado isso aqui (total de páginas calculado, antes era fixo em 3)
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.justificativasFiltradas.length / this.itensPorPagina));
  }

  // foi implementado isso aqui (lista de páginas calculada, antes era [1, 2, 3])
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

  sair() {
    // Lógica de logout
  }
}