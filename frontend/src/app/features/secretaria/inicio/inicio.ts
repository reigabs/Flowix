import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  nomeUsuario = 'Marcia Oliveira'; 
  
  resumoSolicitacoes = {
    pendentes: 14,
    emAnalise: 10,
    aprovadas: 54,
    rejeitadas: 23,
    total: 101
  };

  dataAtual: Date = new Date(2026, 1, 1); 
  mesNome: string = '';
  diasMes: { dia: number | null, ativo: boolean }[] = [];
  diasDestaque: number[] = [10, 21]; 

  constructor() {
    this.atualizarCalendario();
  }

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
  }

  mudarMes(direcao: number) {
    this.dataAtual.setMonth(this.dataAtual.getMonth() + direcao);
    this.dataAtual = new Date(this.dataAtual); 
    this.atualizarCalendario();
  }

  atualizarCalendario() {
    const ano = this.dataAtual.getFullYear();
    const mes = this.dataAtual.getMonth();

    this.mesNome = this.dataAtual.toLocaleString('pt-BR', { month: 'long' });
    this.mesNome = this.mesNome.charAt(0).toUpperCase() + this.mesNome.slice(1);

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