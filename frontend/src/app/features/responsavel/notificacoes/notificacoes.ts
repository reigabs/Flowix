// foi implementado isso aqui (OnInit e inject adicionados ao import)
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// foi implementado isso aqui (Router adicionado ao import)
import { Router, RouterLink } from '@angular/router';
// foi implementado isso aqui (service e model compartilhados)
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Notificacao } from '../../../core/models/justificativa.model';

// foi implementado isso aqui (id agora é texto, vem do service)
interface ItemNotificacao {
  id: string;
  mensagem: string;
  tipo: 'analise' | 'aprovado' | 'rejeitado';
  tempo: string;
  lida: boolean;
}

@Component({
  selector: 'app-notificacoes-responsavel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.css'
})
// foi implementado isso aqui (implements OnInit)
export class NotificacoesResponsavel implements OnInit {
  // foi implementado isso aqui (injeções novas)
  private justificativaService = inject(JustificativaService);
  private router = inject(Router);

  abas: string[] = ['Todos', 'Não lidas', 'Lidas'];
  abaSelecionada: string = 'Todos';

  // foi implementado isso aqui (lista real, começa vazia)
  listaNotificacoes: ItemNotificacao[] = [];

  // foi implementado isso aqui (carrega as notificações dos filhos cadastrados)
  ngOnInit() {
    this.carregar();
  }

  // foi implementado isso aqui (lê do service só as notificações do responsável sobre os filhos dele)
  private carregar() {
    const nomesDosFilhos = this.justificativaService.obterNomesDosFilhos();

    this.listaNotificacoes = this.justificativaService
      .listarNotificacoes('responsavel', nomesDosFilhos)
      .map(n => this.paraItem(n));
  }

  // foi implementado isso aqui (converte a notificação salva para o formato da tela)
  private paraItem(n: Notificacao): ItemNotificacao {
    return {
      id: n.id,
      mensagem: n.mensagem,
      tipo: n.tipo ?? 'analise',
      tempo: this.tempoRelativo(n.data),
      lida: n.lida
    };
  }

  // foi implementado isso aqui (transforma a data em "há 10 min", "há 7 dias"...)
  private tempoRelativo(iso: string): string {
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (min < 1) return 'agora';
    if (min < 60) return `há ${min} min`;

    const horas = Math.floor(min / 60);
    if (horas < 24) return `há ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 30) return dias === 1 ? 'há 1 dia' : `há ${dias} dias`;

    const meses = Math.floor(dias / 30);
    if (meses < 12) return meses === 1 ? 'há 1 mês' : `há ${meses} meses`;

    const anos = Math.floor(dias / 365);
    return anos === 1 ? 'há 1 ano' : `há ${anos} anos`;
  }

  get notificacoesVisiveis(): ItemNotificacao[] {
    if (this.abaSelecionada === 'Todos') {
      return this.listaNotificacoes;
    }
    if (this.abaSelecionada === 'Não lidas') {
      return this.listaNotificacoes.filter(n => !n.lida);
    }
    if (this.abaSelecionada === 'Lidas') {
      return this.listaNotificacoes.filter(n => n.lida);
    }
    return this.listaNotificacoes;
  }

  selecionarAba(aba: string) {
    this.abaSelecionada = aba;
  }

  // foi implementado isso aqui (grava no service, não só na tela)
  marcarTodasComoLidas() {
    this.justificativaService.marcarTodasComoLidas(
      'responsavel',
      this.justificativaService.obterNomesDosFilhos()
    );
    this.listaNotificacoes.forEach(n => n.lida = true);
  }

  // foi implementado isso aqui (marca como lida no service e abre o histórico do responsável)
  abrirNotificacao(item: ItemNotificacao) {
    this.justificativaService.marcarNotificacaoComoLida(item.id);
    item.lida = true;
    this.router.navigate(['/responsavel/historico']);
  }
}