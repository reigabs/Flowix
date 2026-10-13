import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhes-solicitacao.html',
  styleUrl: './detalhes-solicitacao.css'
})
export class HistoricoComponent {
  itemSelecionado: any | null = null;
  paginaAtual: number = 1;

  listaHistorico: any[] = []; 

  verDetalhes(item: any) {
    this.itemSelecionado = item;
  }

  voltarParaLista() {
    this.itemSelecionado = null;
  }

  mudarPagina(pagina: number) {
    this.paginaAtual = pagina;
  }
}