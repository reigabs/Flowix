// foi implementado isso aqui (OnInit, inject e imports do service e do model)
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

// foi implementado isso aqui (formato de cada linha das solicitações recentes)
interface ItemRecente {
  id: string;
  data: string;
  tipo: string;
  status: string;
  statusClass: string;
}

@Component({
  selector: 'app-aluno-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
// foi implementado isso aqui (implements OnInit)
export class Inicio implements OnInit {
  // foi implementado isso aqui (service injetado)
  private justificativaService = inject(JustificativaService);

  // foi implementado isso aqui (nome vem do login, não mais fixo)
  nomeAluno: string = '';

  // foi implementado isso aqui (cards calculados a partir das justificativas reais)
  resumo = {
    total: 0,
    emAnalise: 0,
    aprovadas: 0,
    rejeitadas: 0
  };

  // foi implementado isso aqui (lista real, começa vazia)
  solicitacoesRecentes: ItemRecente[] = [];

  // foi implementado isso aqui (carrega nome, contagens e as 4 últimas solicitações)
  ngOnInit() {
    this.nomeAluno = this.justificativaService.obterNomeAlunoLogado();

    const minhas = this.justificativaService
      .listar()
      .filter(j => j.nomeAluno === this.nomeAluno);

    this.resumo = {
      total: minhas.length,
      emAnalise: minhas.filter(j => j.status === 'pendente').length,
      aprovadas: minhas.filter(j => j.status === 'aceita').length,
      rejeitadas: minhas.filter(j => j.status === 'rejeitada').length
    };

    // a lista já vem da mais nova para a mais antiga
    this.solicitacoesRecentes = minhas.slice(0, 4).map(j => this.paraItem(j));
  }

  // foi implementado isso aqui (converte a justificativa para a linha exibida)
  private paraItem(j: Justificativa): ItemRecente {
    const status = {
      pendente:  { texto: 'Em análise', classe: 'em-andamento' },
      aceita:    { texto: 'Aprovada',   classe: 'aprovada' },
      rejeitada: { texto: 'Rejeitada',  classe: 'rejeitada' }
    }[j.status];

    return {
      id: this.justificativaService.formatarNumero(j.numero),
      data: this.justificativaService.formatarDataFalta(j.dataFalta),
      tipo: j.motivo,
      status: status.texto,
      statusClass: status.classe
    };
  }
}