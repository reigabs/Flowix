
// foi implementado isso aqui (OnDestroy para liberar a URL temporária do documento quando o componente for destruído)
import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// foi implementado isso aqui (DomSanitizer e SafeResourceUrl para exibir o PDF com segurança no iframe)
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
// foi implementado isso aqui (service e model compartilhados)
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

// foi implementado isso aqui (formato de cada linha do histórico, montado a partir da justificativa real)
interface ItemHistorico {
  id: string;
  protocolo: string;
  aluno: string;
  dataFalta: string;
  enviadoEm: string;
  enviadoPor: string;
  status: 'Aprovado' | 'Rejeitado';
  motivo: string;
  documento: string;
  temDocumento: boolean;
  observacaoAnalise: string;
  // foi implementado isso aqui (tipo e nome originais do arquivo para identificar como exibi-lo no visualizador)
  tipoDocumento?: string;
  nomeDocumento?: string;
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhes-solicitacao.html',
  styleUrl: './detalhes-solicitacao.css'
})
// foi implementado isso aqui (OnDestroy para limpar recursos do visualizador ao sair da tela)
export class HistoricoComponent implements OnInit, OnDestroy {
  // foi implementado isso aqui (service injetado)
  private service = inject(JustificativaService);

  // foi implementado isso aqui (sanitizador usado para liberar a URL temporária do PDF no iframe)
  private sanitizer = inject(DomSanitizer);

  // foi implementado isso aqui (atualiza a interface depois do carregamento assíncrono do PDF)
  private cdr = inject(ChangeDetectorRef);

  itemSelecionado: ItemHistorico | null = null;
  paginaAtual: number = 1;

  // foi implementado isso aqui (5 itens por página)
  itensPorPagina: number = 5;

  // foi implementado isso aqui (aviso quando o documento não abre)
  mensagemDocumento: string = '';

  // foi implementado isso aqui (lista real, começa vazia; a lista de exemplo saiu)
  listaHistorico: ItemHistorico[] = [];

  // foi implementado isso aqui (estado do visualizador dentro da própria tela)
  visualizando: boolean = false;
  docAtual: ItemHistorico | null = null;
  docEhImagem: boolean = false;
  docDataUrl: string = '';
  docPdfUrl: SafeResourceUrl | null = null;
  private blobUrl: string | null = null;

  ngOnInit() {
    this.carregarHistorico();
  }

  // foi implementado isso aqui (só o que já foi respondido, da resposta mais recente para a mais antiga)
  carregarHistorico() {
    this.listaHistorico = this.service
      .listar()
      .filter(j => j.status !== 'pendente')
      .sort((a, b) => (b.respostaEm ?? '').localeCompare(a.respostaEm ?? ''))
      .map(j => this.paraItem(j));
  }

  // foi implementado isso aqui (converte a justificativa salva para o formato da tela)
  private paraItem(j: Justificativa): ItemHistorico {
    const aprovada = j.status === 'aceita';

    return {
      id: j.id,
      protocolo: this.service.formatarNumero(j.numero),
      aluno: j.nomeAluno,
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
      // foi implementado isso aqui (na aprovação mostra a observação opcional que a secretaria escreveu; sem ela, o texto padrão)
      observacaoAnalise: aprovada
        ? (j.observacaoAprovacao?.trim() || 'Justificativa aceita pela secretaria.')
        : (j.motivoRejeicao?.trim() || 'Justificativa rejeitada pela secretaria.'),
      // foi implementado isso aqui (guarda o tipo MIME original para diferenciar imagens de outros documentos)
      tipoDocumento: j.documento?.tipo,
      // foi implementado isso aqui (guarda o nome original para mostrar no cabeçalho do visualizador)
      nomeDocumento: j.documento?.nome
    };
  }

  // foi implementado isso aqui (700 KB, 1.2 MB...)
  private formatarTamanho(bytes: number): string {
    return bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
      : `${Math.round(bytes / 1024)}KB`;
  }

  // foi implementado isso aqui (total de páginas e lista de páginas calculados, antes eram botões fixos 1, 2 e 3)
  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.listaHistorico.length / this.itensPorPagina));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  // foi implementado isso aqui (só os itens da página atual)
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

  // foi implementado isso aqui (a página só muda se existir; antes o › podia passar do total)
  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  // foi implementado isso aqui (solicita a senha exclusiva e executa a limpeza global dos dados do Flowix)
  limparHistoricoCompleto() {
    const senha = window.prompt('Digite a senha para limpar todos os dados do Flowix:');

    if (senha === null) {
      return;
    }

    // foi implementado isso aqui (valida a senha exclusiva da limpeza da Secretaria)
    if (senha.trim() !== '1990') {
      window.alert('Senha incorreta. Nenhum dado foi apagado.');
      return;
    }

    // foi implementado isso aqui (executa a limpeza global de justificativas, notificações e documentos)
    const totalRemovido = this.service.limparTodosOsDadosDaSecretaria();

    // foi implementado isso aqui (fecha qualquer documento aberto e atualiza a tela após a limpeza)
    this.fecharDocumento();
    this.itemSelecionado = null;
    this.paginaAtual = 1;
    this.mensagemDocumento = '';
    this.carregarHistorico();

    // foi implementado isso aqui (informa a conclusão da limpeza)
    window.alert(
      `Limpeza concluída! ${totalRemovido} justificativa(s) removida(s). Todos os documentos e notificações também foram apagados.`
    );
  }

  // foi implementado isso aqui (abre o documento dentro de um painel central, sem criar outra aba)
  async abrirDocumento(item: ItemHistorico) {
    this.mensagemDocumento = '';

    const dataUrl = this.service.buscarDocumento(item.id);

    if (!dataUrl) {
      this.mensagemDocumento = 'Não foi possível encontrar o documento anexado.';
      return;
    }

    // foi implementado isso aqui (fecha e limpa qualquer documento que já estivesse aberto)
    this.fecharDocumento();

    this.docAtual = item;
    this.docDataUrl = dataUrl;
    this.docEhImagem = item.tipoDocumento?.startsWith('image/') ?? false;

    // foi implementado isso aqui (imagens são exibidas diretamente no painel)
    if (this.docEhImagem) {
      this.visualizando = true;
      return;
    }

    // foi implementado isso aqui (PDF e outros documentos compatíveis são carregados no iframe do painel)
    try {
      const resposta = await fetch(dataUrl);
      const blob = await resposta.blob();

      this.blobUrl = URL.createObjectURL(blob);

      // foi implementado isso aqui (remove os controles internos do visualizador PDF, mantendo o documento no iframe)
      this.docPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.blobUrl}#toolbar=0&navpanes=0`
      );

      this.visualizando = true;

      // foi implementado isso aqui (força a atualização da interface assim que o PDF termina de carregar)
      this.cdr.detectChanges();
    } catch {
      this.fecharDocumento();
      this.mensagemDocumento = 'Não foi possível abrir o documento.';

      // foi implementado isso aqui (atualiza a mensagem de erro após a falha no carregamento assíncrono)
      this.cdr.detectChanges();
    }
  }

  // foi implementado isso aqui (fecha o painel e limpa os dados do documento exibido)
  fecharDocumento() {
    this.visualizando = false;
    this.docAtual = null;
    this.docEhImagem = false;
    this.docDataUrl = '';
    this.docPdfUrl = null;

    // foi implementado isso aqui (revoga a URL temporária para liberar memória)
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }

  // foi implementado isso aqui (libera a URL temporária caso o componente seja destruído com o visualizador aberto)
  ngOnDestroy() {
    this.fecharDocumento();
  }
}
