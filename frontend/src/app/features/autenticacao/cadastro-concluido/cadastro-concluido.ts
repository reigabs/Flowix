import { Component } from '@angular/core';

@Component({
  selector: 'app-cadastro-concluido',
  templateUrl: './cadastro-concluido.html',
  styleUrls: ['./cadastro-concluido.css']
})
export class CadastroConcluido {
  emailUsuario: string = '';

  constructor() {
    // Pega o e-mail salvo do navegador
    if (typeof window !== 'undefined' && window.localStorage) {
      const salvo = window.localStorage.getItem('emailTemp');
      if (salvo) {
        this.emailUsuario = salvo;
      }
    }
  }

  irParaLogin() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('emailTemp');
    }
  }

  reenviarEmail() {
    if (this.emailUsuario) {
      alert('E-mail reenviado para: ' + this.emailUsuario);
    }
  }
}