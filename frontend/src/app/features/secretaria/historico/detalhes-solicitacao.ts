// foi implementado isso aqui (inject adicionado ao import; PLATFORM_ID e isPlatformBrowser saíram, não são mais usados)
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhes-solicitacao.html',
  styleUrl: './detalhes-solicitacao.css'
})
export class HistoricoComponent implements OnInit {
  // foi implementado isso aqui (service injetado)
  private service = inject(JustificativaService);

  itemSelecionado: ItemHistorico | null = null;
  paginaAtual: number = 1;

  // foi implementado isso aqui (5 itens por página)
  itensPorPagina: number = 5;

  // foi implementado isso aqui (aviso quando o documento não abre)
  mensagemDocumento: string = '';

  // foi implementado isso aqui (lista real, começa vazia; a lista de exemplo saiu)
  listaHistorico: ItemHistorico[] = [];

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
        : (j.motivoRejeicao?.trim() || 'Justificativa rejeitada pela secretaria.')
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

  // foi implementado isso aqui (abre o PDF ou a imagem em outra aba)
  async abrirDocumento(item: ItemHistorico) {
    this.mensagemDocumento = '';
    const dataUrl = this.service.buscarDocumento(item.id);

    if (!dataUrl) {
      this.mensagemDocumento = 'Esta solicitação não tem documento anexado.';
      return;
    }

    // abre a aba antes do await para o navegador não bloquear o pop-up
    const aba = window.open('', '_blank');
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const url = URL.createObjectURL(blob);
      if (aba) {
        aba.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch {
      aba?.close();
      this.mensagemDocumento = 'Não foi possível abrir o documento.';
    }
  }
}