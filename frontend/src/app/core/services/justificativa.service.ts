import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Justificativa, Notificacao, PerfilEnvio, StatusJustificativa, TipoNotificacao
} from '../models/justificativa.model';

const CHAVE_JUSTIFICATIVAS = 'flowix_justificativas';
const CHAVE_NOTIFICACOES = 'flowix_notificacoes';
const PREFIXO_DOC = 'flowix_doc_';

@Injectable({ providedIn: 'root' })
export class JustificativaService {
  private platformId = inject(PLATFORM_ID);

  private get navegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private ler<T>(chave: string): T[] {
    if (!this.navegador) return [];
    try {
      return JSON.parse(localStorage.getItem(chave) || '[]');
    } catch {
      return [];
    }
  }

  private gravar(chave: string, valor: unknown) {
    localStorage.setItem(chave, JSON.stringify(valor));
  }

  private lerArquivo(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result as string);
      leitor.onerror = () => reject(leitor.error);
      leitor.readAsDataURL(arquivo);
    });
  }

  /** Aceita um nome ou vários, para o responsável com vários filhos. */
  private nomeCombina(nomeAluno: string, filtro?: string | string[]): boolean {
    if (filtro === undefined) return true;
    return Array.isArray(filtro) ? filtro.includes(nomeAluno) : filtro === nomeAluno;
  }

  // ---------- Formatação ----------

  /** Formata 'YYYY-MM-DD' sem passar por Date (evita cair um dia por causa do fuso). */
  formatarDataFalta(iso: string): string {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  /** 1 -> '#0001' */
  formatarNumero(numero?: number): string {
    return numero ? '#' + String(numero).padStart(4, '0') : '#----';
  }

  /** Nome do usuário logado (o login grava em 'usuario_cadastrado') */
  obterNomeAlunoLogado(): string {
    if (this.navegador) {
      try {
        const usuario = JSON.parse(localStorage.getItem('usuario_cadastrado') || '{}');
        if (usuario.nome) return usuario.nome;
      } catch {}
    }
    return 'Aluno';
  }

  /** Nomes dos filhos cadastrados pelo responsável. */
  obterNomesDosFilhos(): string[] {
    if (!this.navegador) return [];
    try {
      const filhos = JSON.parse(localStorage.getItem('meus_filhos') || '[]');
      return filhos.map((f: { nome: string }) => f.nome);
    } catch {
      return [];
    }
  }

  // ---------- Justificativas ----------

  async criar(
    dados: {
      enviadoPor: PerfilEnvio;
      nomeAluno: string;
      nomeResponsavel?: string;
      motivo: string;
      dataFalta: string;
    },
    arquivo: File | null
  ): Promise<Justificativa> {
    const id = crypto.randomUUID();
    const numero =
      this.listar().reduce((max, j) => Math.max(max, j.numero ?? 0), 0) + 1;

    const justificativa: Justificativa = {
      id,
      numero,
      ...dados,
      dataEnvio: new Date().toISOString(),
      status: 'pendente',
      documento: arquivo
        ? { nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size }
        : undefined
    };

    // Grava o arquivo primeiro: se estourar a cota do localStorage, nada fica pela metade
    if (arquivo) {
      const conteudo = await this.lerArquivo(arquivo);
      localStorage.setItem(PREFIXO_DOC + id, conteudo);
    }

    try {
      const lista = this.listar();
      lista.unshift(justificativa);
      this.gravar(CHAVE_JUSTIFICATIVAS, lista);
    } catch (e) {
      localStorage.removeItem(PREFIXO_DOC + id);
      throw e;
    }

    this.notificarAlunoEResponsavel(justificativa, 'analise', 'está em análise.');

    return justificativa;
  }

  listar(): Justificativa[] {
    return this.ler<Justificativa>(CHAVE_JUSTIFICATIVAS);
  }

  listarPendentes(): Justificativa[] {
    return this.listar().filter(j => j.status === 'pendente');
  }

  buscarDocumento(id: string): string | null {
    return this.navegador ? localStorage.getItem(PREFIXO_DOC + id) : null;
  }

  // foi implementado isso aqui (troca o documento salvo pela versão editada; lança erro se não couber no localStorage)
  substituirDocumento(id: string, dataUrl: string, tamanho: number) {
    localStorage.setItem(PREFIXO_DOC + id, dataUrl);

    const lista = this.listar();
    const j = lista.find(x => x.id === id);
    if (j?.documento) {
      j.documento.tamanho = tamanho;
      this.gravar(CHAVE_JUSTIFICATIVAS, lista);
    }
  }

  /** Secretaria aceita ou rejeita e já gera a notificação para aluno e responsável. */
  responder(id: string, status: Exclude<StatusJustificativa, 'pendente'>, observacao?: string) {
    const lista = this.listar();
    const j = lista.find(x => x.id === id);
    if (!j) return;

    const obs = observacao?.trim() || undefined;

    j.status = status;
    j.respostaEm = new Date().toISOString();
    j.motivoRejeicao = status === 'rejeitada' ? obs : undefined;
    j.observacaoAprovacao = status === 'aceita' ? obs : undefined;
    this.gravar(CHAVE_JUSTIFICATIVAS, lista);

    const dataFalta = this.formatarDataFalta(j.dataFalta);

    if (status === 'aceita') {
      this.notificarAlunoEResponsavel(
        j, 'aprovado',
        `(falta do dia ${dataFalta}) foi aprovada.`
          + (obs ? ` Observação: ${obs}` : '')
      );
    } else {
      this.notificarAlunoEResponsavel(
        j, 'rejeitado',
        `(falta do dia ${dataFalta}) foi rejeitada.`
          + (obs ? ` Motivo: ${obs}` : '')
      );
    }
  }

  // ---------- Notificações ----------

  /** Gera as duas notificações de uma vez, com texto próprio para cada um. */
  private notificarAlunoEResponsavel(j: Justificativa, tipo: TipoNotificacao, complemento: string) {
    const numero = this.formatarNumero(j.numero);

    this.adicionarNotificacao(j, 'aluno', tipo, `Sua justificativa ${numero} ${complemento}`);
    this.adicionarNotificacao(
      j, 'responsavel', tipo,
      `A justificativa ${numero} de ${j.nomeAluno} ${complemento}`
    );
  }

  private adicionarNotificacao(
    j: Justificativa,
    destinatario: PerfilEnvio,
    tipo: TipoNotificacao,
    mensagem: string
  ) {
    const lista = this.ler<Notificacao>(CHAVE_NOTIFICACOES);
    lista.unshift({
      id: crypto.randomUUID(),
      destinatario,
      nomeAluno: j.nomeAluno,
      justificativaId: j.id,
      tipo,
      mensagem,
      data: new Date().toISOString(),
      lida: false
    });
    this.gravar(CHAVE_NOTIFICACOES, lista);
  }

  listarNotificacoes(destinatario: PerfilEnvio, nomeAluno?: string | string[]): Notificacao[] {
    return this.ler<Notificacao>(CHAVE_NOTIFICACOES).filter(n =>
      n.destinatario === destinatario && this.nomeCombina(n.nomeAluno, nomeAluno)
    );
  }

  contarNaoLidas(destinatario: PerfilEnvio, nomeAluno?: string | string[]): number {
    return this.listarNotificacoes(destinatario, nomeAluno).filter(n => !n.lida).length;
  }

  marcarNotificacaoComoLida(id: string) {
    const lista = this.ler<Notificacao>(CHAVE_NOTIFICACOES);
    const n = lista.find(x => x.id === id);
    if (n && !n.lida) {
      n.lida = true;
      this.gravar(CHAVE_NOTIFICACOES, lista);
    }
  }

  marcarTodasComoLidas(destinatario: PerfilEnvio, nomeAluno?: string | string[]) {
    const lista = this.ler<Notificacao>(CHAVE_NOTIFICACOES);
    lista.forEach(n => {
      if (n.destinatario === destinatario && this.nomeCombina(n.nomeAluno, nomeAluno)) {
        n.lida = true;
      }
    });
    this.gravar(CHAVE_NOTIFICACOES, lista);
  }
}