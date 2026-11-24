
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Justificativa,
  Notificacao,
  PerfilEnvio,
  PerfilDestinatarioNotificacao,
  StatusJustificativa,
  TipoNotificacao
} from '../models/justificativa.model';

const CHAVE_JUSTIFICATIVAS = 'flowix_justificativas';
const CHAVE_NOTIFICACOES = 'flowix_notificacoes';

// foi implementado isso aqui (prefixo correto utilizado para localizar todos os documentos armazenados pelo Flowix)
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

    return Array.isArray(filtro)
      ? filtro.includes(nomeAluno)
      : filtro === nomeAluno;
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
        ? {
            nome: arquivo.name,
            tipo: arquivo.type,
            tamanho: arquivo.size
          }
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

    this.notificarAlunoEResponsavel(
      justificativa,
      'analise',
      'está em análise.'
    );

    return justificativa;
  }

  listar(): Justificativa[] {
    return this.ler<Justificativa>(CHAVE_JUSTIFICATIVAS);
  }

  listarPendentes(): Justificativa[] {
    return this.listar().filter(j => j.status === 'pendente');
  }

  buscarDocumento(id: string): string | null {
    return this.navegador
      ? localStorage.getItem(PREFIXO_DOC + id)
      : null;
  }

  // foi implementado isso aqui (remove justificativas do aluno, documentos e notificações relacionadas)
  limparJustificativasDoAluno(nomeAluno: string): number {
    if (!this.navegador) return 0;

    const justificativas = this.listar();

    // foi implementado isso aqui (seleciona somente as justificativas enviadas pelo próprio aluno)
    const justificativasDoAluno = justificativas.filter(j =>
      j.enviadoPor === 'aluno' && j.nomeAluno === nomeAluno
    );

    // foi implementado isso aqui (identifica todas as justificativas desse aluno, inclusive as enviadas pelo responsável)
    const todasJustificativasDoAluno = justificativas.filter(j =>
      j.nomeAluno === nomeAluno
    );

    // foi implementado isso aqui (guarda os IDs das justificativas enviadas pelo aluno)
    const idsRemovidos = new Set(justificativasDoAluno.map(j => j.id));

    // foi implementado isso aqui (guarda os IDs de todas as justificativas do aluno para limpar as notificações dele)
    const idsNotificacoes = new Set(todasJustificativasDoAluno.map(j => j.id));

    // foi implementado isso aqui (remove do histórico somente as justificativas enviadas pelo aluno)
    const justificativasRestantes = justificativas.filter(j =>
      !idsRemovidos.has(j.id)
    );

    this.gravar(CHAVE_JUSTIFICATIVAS, justificativasRestantes);

    // foi implementado isso aqui (remove as notificações destinadas ao Aluno relacionadas às justificativas dele)
    const notificacoes = this.ler<Notificacao>(CHAVE_NOTIFICACOES);

    const notificacoesRestantes = notificacoes.filter(n =>
      !(n.destinatario === 'aluno' && idsNotificacoes.has(n.justificativaId))
    );

    this.gravar(CHAVE_NOTIFICACOES, notificacoesRestantes);

    // foi implementado isso aqui (apaga os documentos somente das justificativas enviadas pelo aluno)
    idsRemovidos.forEach(id => {
      localStorage.removeItem(PREFIXO_DOC + id);
    });

    return idsRemovidos.size;
  }

  // foi implementado isso aqui (limpa somente as justificativas enviadas pela Responsável, seus documentos e TODAS as notificações da caixa da Responsável)
  limparJustificativasDaResponsavel(nomesAlunos: string[]): number {
    if (!this.navegador) return 0;

    const justificativas = this.listar();

    // foi implementado isso aqui (seleciona somente as justificativas enviadas pela Responsável para os filhos vinculados)
    const justificativasDaResponsavel = justificativas.filter(j =>
      j.enviadoPor === 'responsavel' && nomesAlunos.includes(j.nomeAluno)
    );

    // foi implementado isso aqui (guarda os IDs das justificativas da Responsável que serão removidas)
    const idsRemovidos = new Set(
      justificativasDaResponsavel.map(j => j.id)
    );

    // foi implementado isso aqui (remove do histórico somente as justificativas enviadas pela Responsável)
    const justificativasRestantes = justificativas.filter(j =>
      !idsRemovidos.has(j.id)
    );

    this.gravar(CHAVE_JUSTIFICATIVAS, justificativasRestantes);

    // foi implementado isso aqui (apaga TODAS as notificações destinadas à Responsável, incluindo lidas, não lidas, antigas e sem justificativa correspondente)
    const notificacoes = this.ler<Notificacao>(CHAVE_NOTIFICACOES);

    const notificacoesRestantes = notificacoes.filter(n =>
      n.destinatario !== 'responsavel'
    );

    this.gravar(CHAVE_NOTIFICACOES, notificacoesRestantes);

    // foi implementado isso aqui (apaga os documentos anexados às justificativas enviadas pela Responsável)
    idsRemovidos.forEach(id => {
      localStorage.removeItem(PREFIXO_DOC + id);
    });

    return idsRemovidos.size;
  }

  // foi implementado isso aqui (limpeza global: apaga todas as justificativas, notificações e documentos do Flowix, sem apagar contas ou cadastros)
  limparTodosOsDadosDaSecretaria(): number {
    if (!this.navegador) return 0;

    // foi implementado isso aqui (contabiliza as justificativas existentes antes da limpeza)
    const totalJustificativas = this.listar().length;

    // foi implementado isso aqui (remove todas as justificativas armazenadas)
    localStorage.removeItem(CHAVE_JUSTIFICATIVAS);

    // foi implementado isso aqui (remove todas as notificações de todos os destinatários)
    localStorage.removeItem(CHAVE_NOTIFICACOES);

    // foi implementado isso aqui (identifica todos os documentos do Flowix, inclusive arquivos sem justificativa correspondente)
    const documentos = Object.keys(localStorage).filter(chave =>
      chave.startsWith(PREFIXO_DOC)
    );

    // foi implementado isso aqui (remove todos os documentos identificados)
    documentos.forEach(chave => {
      localStorage.removeItem(chave);
    });

    return totalJustificativas;
  }

  /** Secretaria aceita ou rejeita e já gera as notificações para aluno, responsável e professor. */
  responder(
    id: string,
    status: Exclude<StatusJustificativa, 'pendente'>,
    observacao?: string
  ) {
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
        j,
        'aprovado',
        `(falta do dia ${dataFalta}) foi aprovada.` +
          (obs ? ` Observação: ${obs}` : '')
      );

      // foi implementado isso aqui (envia ao Professor uma notificação individual quando a Secretaria aprova a justificativa)
      this.notificarProfessor(
        j,
        'aprovado',
        `(falta do dia ${dataFalta}) foi aprovada.`
      );
    } else {
      this.notificarAlunoEResponsavel(
        j,
        'rejeitado',
        `(falta do dia ${dataFalta}) foi rejeitada.` +
          (obs ? ` Motivo: ${obs}` : '')
      );

      // foi implementado isso aqui (envia ao Professor uma notificação individual quando a Secretaria rejeita a justificativa)
      this.notificarProfessor(
        j,
        'rejeitado',
        `(falta do dia ${dataFalta}) foi rejeitada.`
      );
    }
  }

  // ---------- Notificações ----------

  /** Gera as duas notificações de uma vez, com texto próprio para cada um. */
  private notificarAlunoEResponsavel(
    j: Justificativa,
    tipo: TipoNotificacao,
    complemento: string
  ) {
    const numero = this.formatarNumero(j.numero);

    this.adicionarNotificacao(
      j,
      'aluno',
      tipo,
      `Sua justificativa ${numero} ${complemento}`
    );

    this.adicionarNotificacao(
      j,
      'responsavel',
      tipo,
      `A justificativa ${numero} de ${j.nomeAluno} ${complemento}`
    );
  }

  // foi implementado isso aqui (gera uma notificação exclusiva para o Professor, vinculada à justificativa respondida pela Secretaria)
  private notificarProfessor(
    j: Justificativa,
    tipo: TipoNotificacao,
    complemento: string
  ) {
    const numero = this.formatarNumero(j.numero);
    const remetente = j.enviadoPor === 'responsavel' && j.nomeResponsavel
      ? ` enviada pelo responsável ${j.nomeResponsavel}`
      : ' enviada pelo aluno';

    this.adicionarNotificacao(
      j,
      'professor',
      tipo,
      `A justificativa ${numero} de ${j.nomeAluno}${remetente} ${complemento}`
    );
  }

  // foi implementado isso aqui (permite que o método de criação receba notificações destinadas ao Professor sem alterar o tipo de remetente da justificativa)
  private adicionarNotificacao(
    j: Justificativa,
    destinatario: PerfilDestinatarioNotificacao,
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

  // foi implementado isso aqui (permite consultar notificações do Professor sem filtrar pelo nome do aluno, mantendo os filtros anteriores para Aluno e Responsável)
  listarNotificacoes(
    destinatario: PerfilDestinatarioNotificacao,
    nomeAluno?: string | string[]
  ): Notificacao[] {
    return this.ler<Notificacao>(CHAVE_NOTIFICACOES).filter(n =>
      n.destinatario === destinatario &&
      this.nomeCombina(n.nomeAluno, nomeAluno)
    );
  }

  // foi implementado isso aqui (permite contabilizar notificações não lidas de qualquer destinatário, incluindo o Professor)
  contarNaoLidas(
    destinatario: PerfilDestinatarioNotificacao,
    nomeAluno?: string | string[]
  ): number {
    return this.listarNotificacoes(destinatario, nomeAluno)
      .filter(n => !n.lida).length;
  }

  marcarNotificacaoComoLida(id: string) {
    const lista = this.ler<Notificacao>(CHAVE_NOTIFICACOES);
    const n = lista.find(x => x.id === id);

    if (n && !n.lida) {
      n.lida = true;
      this.gravar(CHAVE_NOTIFICACOES, lista);
    }
  }

  // foi implementado isso aqui (permite marcar todas as notificações do Professor como lidas sem alterar as caixas de Aluno e Responsável)
  marcarTodasComoLidas(
    destinatario: PerfilDestinatarioNotificacao,
    nomeAluno?: string | string[]
  ) {
    const lista = this.ler<Notificacao>(CHAVE_NOTIFICACOES);

    lista.forEach(n => {
      if (
        n.destinatario === destinatario &&
        this.nomeCombina(n.nomeAluno, nomeAluno)
      ) {
        n.lida = true;
      }
    });

    this.gravar(CHAVE_NOTIFICACOES, lista);
  }
}
