import { Routes } from '@angular/router';

export const routes: Routes = [
  // 1. Página inicial com a logo do Flowix
  {
    path: '',
    redirectTo: 'pagina-inicial',
    pathMatch: 'full'
  },
  {
    path: 'pagina-inicial',
    loadComponent: () =>
      import('./features/pagina-inicial/pagina-inicial')
        .then(m => m.PaginaInicial)
  },

  // 2. Página pública do Flowix
  {
    path: 'home-publica',
    loadComponent: () =>
      import('./features/autenticacao/home-publica/home-publica')
        .then(m => m.HomePublica)
  },

  // 3. Cadastro de perfil
  {
    path: 'cadastro-perfil',
    loadComponent: () =>
      import('./features/autenticacao/cadastro/cadastro')
        .then(m => m.Cadastro)
  },

  // 4. Login
  {
    path: 'login',
    loadComponent: () =>
      import('./features/autenticacao/login/login')
        .then(m => m.Login)
  },

  // Páginas principais de cada perfil
  {
    path: 'aluno',
    loadComponent: () =>
      import('./features/aluno/inicio/inicio')
        .then(m => m.Inicio)
  },
  {
    path: 'secretaria',
    loadComponent: () =>
      import('./features/secretaria/inicio/inicio')
        .then(m => m.Inicio)
  },
  {
    path: 'responsavel',
    loadComponent: () =>
      import('./features/responsavel/inicio/inicio')
        .then(m => m.Inicio)
  },

  // Redireciona rotas inexistentes
  {
    path: '**',
    redirectTo: ''
  }
];