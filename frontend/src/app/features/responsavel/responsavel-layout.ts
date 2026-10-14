import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-responsavel-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Menu Lateral Roxo -->
      <aside class="sidebar">
        <div class="logo-area">
          <img src="protótipo-FloWix.png" alt="Logo Flowix" class="cat-logo-img" />
          <h2>Flowix</h2>
        </div>

        <nav class="nav-links">
          <a routerLink="/responsavel/inicio" routerLinkActive="active">
            🏠 Painel
          </a>
          <a routerLink="/responsavel/nova-justificativa" routerLinkActive="active">
            📄 Nova justificativa
          </a>
          <a routerLink="/responsavel/historico" routerLinkActive="active">
            🕒 Meu histórico
          </a>
          <a routerLink="/responsavel/notificacoes" routerLinkActive="active">
            🔔 Notificações
          </a>
          <a routerLink="/responsavel/perfil" routerLinkActive="active">
            👤 Meu perfil
          </a>
          <a routerLink="/responsavel/perfil-filhos" routerLinkActive="active">
            👥 Perfil dos filhos
          </a>
        </nav>

        <div class="logout-area">
          <a routerLink="/login" class="logout-link">
            ⬅ Sair da conta
          </a>
        </div>
      </aside>

      <!-- Área central onde as páginas são carregadas -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f8f9fa;
      font-family: 'Inter', sans-serif;
    }

    .sidebar {
      width: 260px;
      background-color: #1a0b2e;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 16px;
      position: fixed;
      height: 100vh;
      top: 0;
      left: 0;
      z-index: 100;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 12px;
      margin-bottom: 40px;
    }

    .cat-logo-img {
      width: 32px;
      height: 32px;
      object-fit: contain;
    }

    .logo-area h2 {
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      margin: 0;
    }

    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #a0aec0;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
    }

    .nav-links a:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #fff;
    }

    .nav-links a.active {
      background-color: #581c87;
      color: #fff;
    }

    .logout-area {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 16px;
    }

    .logout-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #f87171;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      border-radius: 8px;
    }

    .logout-link:hover {
      background-color: rgba(239, 68, 68, 0.1);
    }

    .main-content {
      margin-left: 260px;
      flex: 1;
      background-color: #f8f9fa;
      min-height: 100vh;
    }
  `]
})
export class ResponsavelLayoutComponent {}