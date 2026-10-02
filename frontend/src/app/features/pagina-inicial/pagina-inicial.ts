import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pagina-inicial',
  standalone: true,
  imports: [],
  templateUrl: './pagina-inicial.html',
  styleUrls: ['./pagina-inicial.css']
})
export class PaginaInicial implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Redireciona após 3 segundos (3000ms) — altere se quiser mais tempo
    setTimeout(() => {
      this.router.navigate(['/cadastro-perfil']);
    }, 3000);
  }
}