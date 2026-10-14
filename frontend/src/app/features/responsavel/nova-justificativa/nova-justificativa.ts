import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nova-justificativa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-justificativa.html',
  styleUrl: './nova-justificativa.css'
})
export class NovaJustificativa {
  alunoSelecionado: string = '';
  motivo: string = '';
  dataFalta: string = '';
  arquivo: File | null = null;
  
  arrastando: boolean = false;
  enviando: boolean = false;
  progresso: number = 0;
  mensagemErro: string = '';

  filhos = [
    { nome: 'Flávia Santos', turma: '7º ano C' },
    { nome: 'Henrique Santos', turma: '7º ano B' }
  ];

  constructor(private router: Router) {}

  selecionarArquivo(event: any) {
    const file = event.target.files[0];
    this.validarEAtribuirArquivo(file);
  }

  aoArrastar(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = true;
  }

  aoSairDaArea(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = false;
  }

  aoSoltar(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.validarEAtribuirArquivo(file);
    }
  }

  validarEAtribuirArquivo(file: File) {
    this.mensagemErro = '';
    const tamanhoMaximo = 5 * 1024 * 1024; // 5 MB
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!tiposPermitidos.includes(file.type)) {
      this.mensagemErro = 'Formato inválido. Apenas PDF, JPG e PNG são permitidos.';
      return;
    }

    if (file.size > tamanhoMaximo) {
      this.mensagemErro = 'O arquivo é muito grande. O tamanho máximo permitido é 5 MB.';
      return;
    }

    this.arquivo = file;
  }

  removerArquivo() {
    this.arquivo = null;
    this.mensagemErro = '';
  }

  enviar() {
    if (!this.alunoSelecionado || !this.motivo || !this.dataFalta) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.enviando = true;
    this.progresso = 0;

    const intervalo = setInterval(() => {
      this.progresso += 10;
      if (this.progresso > 100) {
        this.progresso = 100;
        clearInterval(intervalo);
        setTimeout(() => {
          this.router.navigate(['/responsavel/inicio']);
        }, 500);
      }
    }, 200);
  }

  cancelar() {
    this.router.navigate(['/responsavel/inicio']);
  }
}