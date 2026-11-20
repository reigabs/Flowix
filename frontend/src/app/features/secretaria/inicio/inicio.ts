import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
// foi implementado isso aqui (service e model compartilhados)
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  // foi implementado isso aqui (service injetado)
  private justificativaService = inject(JustificativaService);
  
  nomeUsuario = 'Marcia Oliveira'; 
  
  // foi implementado isso aqui (contagens reais; começam zeradas e são calculadas no ngOnInit)
  resumoSolicitacoes = {
    emAnalise: 0,
    aprovadas: 0,
    rejeitadas: 0,
    total: 0
  };

  // foi implementado isso aqui (fundo da rosca, calculado a partir das contagens)
  gradiente: string = 'conic-gradient(#e5e7eb 0% 100%)';

  // foi implementado isso aqui (todas as justificativas, usadas no resumo e no calendário)
  private justificativas: Justificativa[] = [];

  // foi implementado isso aqui (calendário abre no mês atual, em vez de fevereiro/2026 fixo)
  dataAtual: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1); 
  mesNome: string = '';
  diasMes: { dia: number | null, ativo: boolean }[] = [];
  // foi implementado isso aqui (dias do mês com faltas, calculados em atualizarCalendario)
  diasDestaque: number[] = []; 

  // foi implementado isso aqui (o constructor não calcula mais o calendário; isso passou para o ngOnInit)
  constructor() {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSalvoStr = localStorage.getItem('usuario_cadastrado');
      if (usuarioSalvoStr) {
        try {
          const usuario = JSON.parse(usuarioSalvoStr);
          if (usuario.nome) {
            this.nomeUsuario = usuario.nome;
          }
        } catch (e) {
          console.error('Erro ao ler dados do usuário', e);
        }
      }
    }

    // foi implementado isso aqui (carrega as justificativas reais e monta resumo, rosca e calendário)
    this.justificativas = this.justificativaService.listar();
    this.calcularResumo();
    this.atualizarCalendario();
  }

  // foi implementado isso aqui (conta por status e monta o gradiente da rosca)
  private calcularResumo() {
    const lista = this.justificativas;

    const emAnalise = lista.filter(j => j.status === 'pendente').length;
    const aprovadas = lista.filter(j => j.status === 'aceita').length;
    const rejeitadas = lista.filter(j => j.status === 'rejeitada').length;
    const total = lista.length;

    this.resumoSolicitacoes = { emAnalise, aprovadas, rejeitadas, total };

    if (total === 0) {
      this.gradiente = 'conic-gradient(#e5e7eb 0% 100%)';
      return;
    }

    const fimAnalise = (emAnalise / total) * 100;
    const fimAprovadas = fimAnalise + (aprovadas / total) * 100;

    this.gradiente =
      `conic-gradient(` +
      `#f97316 0% ${fimAnalise}%, ` +
      `#10b981 ${fimAnalise}% ${fimAprovadas}%, ` +
      `#ef4444 ${fimAprovadas}% 100%)`;
  }

  // foi implementado isso aqui (porcentagem de cada status para a legenda)
  percentual(valor: number): string {
    const total = this.resumoSolicitacoes.total;
    return total ? ((valor / total) * 100).toFixed(1) : '0.0';
  }

  // foi implementado isso aqui (usa o dia 1 do mês, evitando erro quando o dia atual é 29, 30 ou 31)
  mudarMes(direcao: number) {
    this.dataAtual = new Date(
      this.dataAtual.getFullYear(),
      this.dataAtual.getMonth() + direcao,
      1
    );
    this.atualizarCalendario();
  }

  atualizarCalendario() {
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();

    this.mesNome = this.dataAtual.toLocaleString('pt-BR', { month: 'long' });
    this.mesNome = this.mesNome.charAt(0).toUpperCase() + this.mesNome.slice(1);

    // foi implementado isso aqui (destaca os dias do mês exibido que têm falta com solicitação; lê o texto 'YYYY-MM-DD' sem Date para não errar por fuso)
    const prefixo = `${ano}-${String(mes + 1).padStart(2, '0')}-`;
    const dias = new Set<number>();
    this.justificativas.forEach(j => {
      if (j.dataFalta.startsWith(prefixo)) {
        dias.add(Number(j.dataFalta.slice(8, 10)));
      }
    });
    this.diasDestaque = [...dias];

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); 
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();

    let listaDias: { dia: number | null, ativo: boolean }[] = [];

    for (let i = 0; i < primeiroDiaSemana; i++) {
      listaDias.push({ dia: null, ativo: false });
    }
    for (let i = 1; i <= ultimoDiaMes; i++) {
      listaDias.push({
        dia: i,
        ativo: this.diasDestaque.includes(i)
      });
    }

    this.diasMes = listaDias;
  }
}