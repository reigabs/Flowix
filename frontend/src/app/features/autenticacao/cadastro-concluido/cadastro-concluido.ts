import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cadastro-concluido',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cadastro-concluido.html',
  styleUrls: ['./cadastro-concluido.css']
})
export class CadastroConcluido {
  emailUsuario: string = '';

  constructor(private router: Router) {
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
    this.router.navigate(['/login']);
  }

  reenviarEmail() {
    if (this.emailUsuario) {
      alert('E-mail reenviado para: ' + this.emailUsuario);
    }
  }
}