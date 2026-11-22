
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
  data: string;
  dataEnvio: string;
  tipo: string;
  status: string;
  statusClass: string;
  observacao: string;
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
// foi implementado isso aqui (implements OnDestroy para liberar o PDF ao sair da tela)
export class Historico implements OnInit, OnDestroy {
  // foi implementado isso aqui (service injetado)
  private justificativaService = inject(JustificativaService);
  // foi implementado isso aqui (sanitizer injetado)
  private sanitizer = inject(DomSanitizer);

  filtroAtual: string = 'Todas';

  // foi implementado isso aqui (lista real, começa vazia; a lista de exemplo saiu)
  todasSolicitacoes: ItemHistorico[] = [];

  // foi implementado isso aqui (paginação real: 5 itens por página)
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

  // foi implementado isso aqui (carrega as justificativas do aluno logado)
  ngOnInit() {
    this.carregar();
  }

  // foi implementado isso aqui (libera o PDF da memória ao sair da tela)
  ngOnDestroy() {
    this.liberarBlob();
  }

  // foi implementado isso aqui (carrega novamente a lista de justificativas do aluno)
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
      pendente: { texto: 'Em análise', classe: 'em-analise' },
      aceita: { texto: 'Aprovado', classe: 'aprovado' },
      rejeitada: { texto: 'Rejeitado', classe: 'rejeitado' }
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
      // foi implementado isso aqui (mantém os dados necessários para exibir o documento anexado)
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

  // foi implementado isso aqui (solicita a senha e executa a limpeza do histórico do aluno)
  limparHistorico() {
    const senha = window.prompt('Digite a senha para limpar o histórico do Aluno:');

    if (senha === null) {
      return;
    }

    // foi implementado isso aqui (confere a senha exclusiva da limpeza)
    if (senha !== '175161214') {
      window.alert('Senha incorreta. Nenhum dado foi apagado.');
      return;
    }

    // foi implementado isso aqui (limpa somente as justificativas enviadas pelo próprio aluno)
    const nomeAluno = this.justificativaService.obterNomeAlunoLogado();
    const quantidadeRemovida = this.justificativaService.limparJustificativasDoAluno(nomeAluno);

    // foi implementado isso aqui (fecha possíveis janelas abertas antes de atualizar o histórico)
    this.fecharDocumento();
    this.fecharModal();

    // foi implementado isso aqui (atualiza o histórico depois da limpeza)
    this.filtroAtual = 'Todas';
    this.paginaAtual = 1;
    this.carregar();

    // foi implementado isso aqui (informa o resultado da limpeza)
    if (quantidadeRemovida > 0) {
      window.alert(`${quantidadeRemovida} justificativa(s) do Aluno foram apagadas com sucesso.`);
    } else {
      window.alert('Não foram encontradas justificativas enviadas pelo Aluno para apagar.');
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

        // foi implementado isso aqui: solicita ao visualizador PDF que oculte a barra de ferramentas e o painel de navegação
        this.docPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `${this.blobUrl}#toolbar=0&navpanes=0`
        );
      } catch {
        this.docAtual = null;
        this.mensagemDocumento = 'Não foi possível abrir o documento.';
        return;
      }
    }

    // foi implementado isso aqui: fecha automaticamente os detalhes para o visualizador aparecer imediatamente
    this.fecharModal();

    this.visualizando = true;
  }

  // foi implementado isso aqui (botão "Sair": fecha o painel e limpa o estado do visualizador)
  fecharDocumento() {
    this.visualizando = false;
    this.docAtual = null;
    this.docDataUrl = '';
    this.docPdfUrl = null;
    this.liberarBlob();
  }

  private liberarBlob() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }
}
