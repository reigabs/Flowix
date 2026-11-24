
export type StatusJustificativa = 'pendente' | 'aceita' | 'rejeitada';
export type PerfilEnvio = 'aluno' | 'responsavel';
// foi implementado isso aqui (permite que notificações também sejam destinadas ao Professor, sem alterar os perfis que podem enviar justificativas)
export type PerfilDestinatarioNotificacao = PerfilEnvio | 'professor';
export type TipoNotificacao = 'analise' | 'aprovado' | 'rejeitado';

export interface Justificativa {
  id: string;
  numero: number;      // sequencial, para mostrar #0001, #0002...
  enviadoPor: PerfilEnvio;
  nomeAluno: string;
  nomeResponsavel?: string;
  motivo: string;
  dataFalta: string;   // 'YYYY-MM-DD' (do input date, sem fuso)
  dataEnvio: string;   // ISO completo
  status: StatusJustificativa;
  documento?: { nome: string; tipo: string; tamanho: number };
  respostaEm?: string;
  motivoRejeicao?: string;
  // foi implementado isso aqui (observação opcional da secretaria ao aprovar)
  observacaoAprovacao?: string;
}

export interface Notificacao {
  id: string;
  // foi implementado isso aqui (utiliza o tipo específico de destinatário, que também contempla o Professor)
  destinatario: PerfilDestinatarioNotificacao;
  nomeAluno: string;
  justificativaId: string;
  tipo: TipoNotificacao;
  mensagem: string;
  data: string;
  lida: boolean;
}
