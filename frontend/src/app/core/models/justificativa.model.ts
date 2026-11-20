export type StatusJustificativa = 'pendente' | 'aceita' | 'rejeitada';
export type PerfilEnvio = 'aluno' | 'responsavel';
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
}

export interface Notificacao {
  id: string;
  destinatario: PerfilEnvio;
  nomeAluno: string;
  justificativaId: string;
  tipo: TipoNotificacao;
  mensagem: string;
  data: string;
  lida: boolean;
}