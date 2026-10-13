import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-solicitacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacoes.html',
  styleUrl: './solicitacoes.css'
})
export class SolicitacoesComponent {
  listaSolicitacoes: any[] = []; // Array vazio aguardando dados reais
  itemSelecionado: any | null = null;

  verDetalhes(item: any) {
    this.itemSelecionado = item;
  }

  voltarParaLista() {
    this.itemSelecionado = null;
  }

  aprovar() {
    // Lógica para aprovar quando houver backend
    this.voltarParaLista();
  }

  rejeitar() {
    // Lógica para rejeitar quando houver backend
    this.voltarParaLista();
  }
}