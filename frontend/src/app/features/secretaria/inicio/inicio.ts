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
  
  nomeUsuario = 'Usuário'; 
  
  resumoSolicitacoes = {
    pendentes: 0,
    emAnalise: 0,
    aprovadas: 0,
    rejeitadas: 0,
    total: 0
  };

  anoAtual = 2026;
  mesAtual = 1; 
  diasMes: { dia: number | null, ativo: boolean }[] = [];
  diasDestaque: number[] = [];
  constructor() {
    this.gerarCalendarioReal();
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

  gerarCalendarioReal() {
    const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1).getDay(); 
    const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0).getDate();

    let listaDias: { dia: number | null, ativo: boolean }[] = [];

    for (let i = 0; i < primeiroDia; i++) {
      listaDias.push({ dia: null, ativo: false });
    }

    for (let i = 1; i <= ultimoDia; i++) {
      listaDias.push({
        dia: i,
        ativo: false
      });
    }

    this.diasMes = listaDias;
  }
}