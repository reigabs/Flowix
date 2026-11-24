
import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { JustificativaService } from '../../../core/services/justificativa.service';
import { Justificativa } from '../../../core/models/justificativa.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  justificativaService = inject(JustificativaService);
  private router = inject(Router);

  nomeUsuario = 'Rafael Carvalho';

  resumoJustificativas = {
    aceitas: 0,
    rejeitadas: 0,
    emProcessamento: 0,
    total: 0
  };

  gradiente: string = 'conic-gradient(#e5e7eb 0% 100%)';

  private justificativas: Justificativa[] = [];

  notificacoesRecentes: Justificativa[] = [];

  private intervalo: ReturnType<typeof setInterval> | null = null;

  private assinaturaCalendario = '';

  dataAtual: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mesNome: string = '';
  diasMes: { dia: number | null, ativo: boolean }[] = [];
  diasDestaque: number[] = [];

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

      this.atualizarDados();

      this.intervalo = setInterval(() => {
        this.atualizarDados();
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.intervalo !== null) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  private atualizarDados() {
    this.justificativas = this.justificativaService.listar();

    this.calcularResumo();
    this.atualizarNotificacoesRecentes();
    this.atualizarCalendarioSeNecessario();
  }

  private calcularResumo() {
    const lista = this.justificativas;

    const aceitas = lista.filter(j => j.status === 'aceita').length;
    const rejeitadas = lista.filter(j => j.status === 'rejeitada').length;
    const emProcessamento = lista.filter(j => j.status === 'pendente').length;
    const total = lista.length;

    this.resumoJustificativas = {
      aceitas,
      rejeitadas,
      emProcessamento,
      total
    };

    if (total === 0) {
      this.gradiente = 'conic-gradient(#e5e7eb 0% 100%)';
      return;
    }

    const fimAceitas = (aceitas / total) * 100;
    const fimRejeitadas = fimAceitas + (rejeitadas / total) * 100;

    this.gradiente =
      `conic-gradient(` +
      `#10b981 0% ${fimAceitas}%, ` +
      `#ef4444 ${fimAceitas}% ${fimRejeitadas}%, ` +
      `#f97316 ${fimRejeitadas}% 100%)`;
  }

  percentual(valor: number): string {
    const total = this.resumoJustificativas.total;
    return total ? ((valor / total) * 100).toFixed(1) : '0.0';
  }

  private atualizarNotificacoesRecentes() {
    const agora = Date.now();
    const quinzeMinutos = 15 * 60 * 1000;

    this.notificacoesRecentes = this.justificativas
      .filter(j => {
        if (!j.respostaEm || j.status === 'pendente') {
          return false;
        }

        const horarioResposta = new Date(j.respostaEm).getTime();
        const tempoDecorrido = agora - horarioResposta;

        return (
          !Number.isNaN(horarioResposta) &&
          tempoDecorrido >= 0 &&
          tempoDecorrido < quinzeMinutos
        );
      })
      .sort((a, b) => {
        return new Date(b.respostaEm!).getTime() - new Date(a.respostaEm!).getTime();
      })
      .slice(0, 4);
  }

  nomeRemetente(justificativa: Justificativa): string {
    if (justificativa.enviadoPor === 'responsavel') {
      return justificativa.nomeResponsavel?.trim() || 'Responsável';
    }

    return justificativa.nomeAluno;
  }

  origemEnvio(justificativa: Justificativa): string {
    return justificativa.enviadoPor === 'responsavel'
      ? 'Enviado pelo responsável'
      : 'Enviado pelo aluno';
  }

  tempoRestante(justificativa: Justificativa): string {
    if (!justificativa.respostaEm) {
      return '00:00';
    }

    const quinzeMinutos = 15 * 60 * 1000;
    const horarioResposta = new Date(justificativa.respostaEm).getTime();
    const restante = Math.max(0, quinzeMinutos - (Date.now() - horarioResposta));

    const minutos = Math.floor(restante / 60000);
    const segundos = Math.floor((restante % 60000) / 1000);

    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }

  nomeStatus(status: Justificativa['status']): string {
    switch (status) {
      case 'aceita':
        return 'Justificativa aceita';
      case 'rejeitada':
        return 'Justificativa rejeitada';
      default:
        return 'Em processamento';
    }
  }

  verRelatorio(id: string) {
    this.router.navigate(['/professor/historico'], {
      queryParams: { justificativaId: id }
    });
  }

  mudarMes(direcao: number) {
    this.dataAtual = new Date(
      this.dataAtual.getFullYear(),
      this.dataAtual.getMonth() + direcao,
      1
    );

    this.atualizarCalendario();
  }

  private atualizarCalendarioSeNecessario() {
    const assinatura = this.justificativas
      .map(j => `${j.id}:${j.dataFalta}`)
      .join('|');

    if (assinatura !== this.assinaturaCalendario) {
      this.assinaturaCalendario = assinatura;
      this.atualizarCalendario();
    }
  }

  atualizarCalendario() {
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();

    this.mesNome = this.dataAtual.toLocaleString('pt-BR', { month: 'long' });
    this.mesNome = this.mesNome.charAt(0).toUpperCase() + this.mesNome.slice(1);

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

    const listaDias: { dia: number | null, ativo: boolean }[] = [];

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
