import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhes-solicitacao.html',
  styleUrl: './detalhes-solicitacao.css'
})
export class HistoricoComponent implements OnInit {
  itemSelecionado: any | null = null;
  paginaAtual: number = 1;

  listaHistoricoBase: any[] = [
    {
      protocolo: '#6737',
      aluno: 'João Guimarães Rosa',
      turma: '7º ano B',
      enviadoEm: '19/05/2026 11:00',
      status: 'Rejeitado',
      motivo: 'Ausência sem comprovação médica válida dentro do prazo.',
      documento: 'declaracao_invalida.pdf (700KB)',
      observacaoAnalise: 'Documento ilegível.'
    },
    {
      protocolo: '#6736',
      aluno: 'Isaac Newton',
      turma: '5º ano A',
      enviadoEm: '19/05/2026 10:30',
      status: 'Aprovado',
      motivo: 'Consulta médica especialista.',
      documento: 'atestado_Isaac.pdf (1.1MB)',
      observacaoAnalise: 'Tudo em ordem.'
    },
    {
      protocolo: '#6735',
      aluno: 'Hipátia de Alexandria',
      turma: '9º ano A',
      enviadoEm: '19/05/2026 10:14',
      status: 'Aprovado',
      motivo: 'Participação em olimpíada de matemática.',
      documento: 'declaracao_oficial.pdf (950KB)',
      observacaoAnalise: 'Justificativa aceita pela direção.'
    },
    {
      protocolo: '#6734',
      aluno: 'Clarice Lispector',
      turma: '6º ano C',
      enviadoEm: '18/05/2026 13:12',
      status: 'Rejeitado',
      motivo: 'Viagem familiar.',
      documento: 'aviso_pais.pdf (500KB)',
      observacaoAnalise: 'Motivo não previsto em regimento escolar.'
    },
    {
      protocolo: '#6731',
      aluno: 'Carlos Drummond de Andrade',
      turma: '7º ano B',
      enviadoEm: '17/05/2026 15:41',
      status: 'Rejeitado',
      motivo: 'Consulta odontológica sem atestado de horas.',
      documento: 'comprovante_parcial.pdf (400KB)',
      observacaoAnalise: 'Faltou comprovar o horário de permanência.'
    },
    {
      protocolo: '#6729',
      aluno: 'Graciliano Ramos',
      turma: '9º ano E',
      enviadoEm: '16/05/2026 10:21',
      status: 'Aprovado',
      motivo: 'Doença com atestado de repouso.',
      documento: 'atestado_medico.pdf (1.3MB)',
      observacaoAnalise: 'Aprovado conforme regras.'
    },
    {
      protocolo: '#6727',
      aluno: 'Machado de Assis',
      turma: '5º ano A',
      enviadoEm: '16/05/2026 08:19',
      status: 'Aprovado',
      motivo: 'Exame médico preventivo.',
      documento: 'atestado.pdf (800KB)',
      observacaoAnalise: 'Validado.'
    }
  ];

  listaHistorico: any[] = [];

  ngOnInit() {
    this.carregarHistorico();
  }

  carregarHistorico() {
    const historicoSalvo = localStorage.getItem('flowix_historico');
    const itensNovos = historicoSalvo ? JSON.parse(historicoSalvo) : [];
    const listaCompleta = [...itensNovos, ...this.listaHistoricoBase];

    this.listaHistorico = listaCompleta.filter((item, index, self) =>
      index === self.findIndex((t) => t.protocolo === item.protocolo)
    );
  }

  verDetalhes(item: any) {
    this.itemSelecionado = item;
  }

  voltarParaLista() {
    this.itemSelecionado = null;
  }

  mudarPagina(pagina: number) {
    this.paginaAtual = pagina;
  }
}