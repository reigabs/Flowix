import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nova-justificativa',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './nova-justificativa.html',
  styleUrl: './nova-justificativa.css'
})
export class NovaJustificativa implements OnDestroy {
  motivo = '';
  dataFalta = '';
  arquivo: File | null = null;

  arrastando = false;
  enviando = false;
  progresso = 0;
  mensagemErro = '';

  private intervalo: ReturnType<typeof setInterval> | undefined;

  constructor(private router: Router) {}

  selecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (arquivo) {
      this.validarArquivo(arquivo);
    }

    input.value = '';
  }

  validarArquivo(arquivo: File): void {
    this.mensagemErro = '';

    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      this.mensagemErro =
        'Formato inválido. Selecione um PDF, JPG ou PNG.';
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      this.mensagemErro =
        'O arquivo deve ter no máximo 5 MB.';
      return;
    }

    this.arquivo = arquivo;
  }

  aoArrastar(event: DragEvent): void {
    event.preventDefault();
    this.arrastando = true;
  }

  aoSairDaArea(event: DragEvent): void {
    event.preventDefault();
    this.arrastando = false;
  }

  aoSoltar(event: DragEvent): void {
    event.preventDefault();
    this.arrastando = false;

    const arquivo = event.dataTransfer?.files?.[0];

    if (arquivo) {
      this.validarArquivo(arquivo);
    }
  }

  removerArquivo(): void {
    this.arquivo = null;
    this.mensagemErro = '';
  }

  cancelar(): void {
    if (!this.enviando) {
      this.router.navigate(['/aluno/inicio']);
    }
  }

  enviar(): void {
    this.mensagemErro = '';

    if (!this.motivo.trim()) {
      this.mensagemErro = 'Descreva o motivo da falta.';
      return;
    }

    if (!this.dataFalta) {
      this.mensagemErro = 'Selecione a data da falta.';
      return;
    }

    if (!this.arquivo) {
      this.mensagemErro = 'Anexe o documento da justificativa.';
      return;
    }

    this.enviando = true;
    this.progresso = 0;

    this.intervalo = setInterval(() => {
      this.progresso += 5;

      if (this.progresso >= 100) {
        this.progresso = 100;

        if (this.intervalo) {
          clearInterval(this.intervalo);
          this.intervalo = undefined;
        }

        // Demonstração visual:
        // ainda não envia os dados para um servidor.
        setTimeout(() => {
          this.enviando = false;

          window.alert(
            'Demonstração concluída! Para registrar a justificativa, ' +
            'é necessário conectar o formulário a um backend.'
          );

          this.router.navigate(['/aluno/inicio']);
        }, 700);
      }
    }, 150);
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }
}