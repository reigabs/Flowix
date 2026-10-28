import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-secretaria-layout',
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
          <a routerLink="/secretaria" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            🏠 Painel
          </a>
          <a routerLink="/secretaria/solicitacoes" routerLinkActive="active">
            📄 Solicitações
          </a>
          <a routerLink="/secretaria/historico" routerLinkActive="active">
            🕒 Histórico
          </a>
          <a routerLink="/secretaria/perfil" routerLinkActive="active">
            👤 Meu perfil
          </a>
        </nav>

        <div class="logout-area">
          <a routerLink="/login" class="logout-link">
            ⬅ Sair da conta
          </a>
        </div>
      </aside>

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
      background-color: #2D1054; 
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px 16px;
      position: fixed;
      height: 100vh;
      top: 0;
      left: 0;
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
      color: #d1c4e9; 
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.2s;
    }

    .nav-links a:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .nav-links a.active {
      background-color: #6930C3;
      color: #fff;
      font-weight: 600;
    }

    .logout-area {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 16px;
    }

    .logout-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #ff8a8a;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      border-radius: 8px;
    }

    .logout-link:hover {
      background-color: rgba(239, 68, 68, 0.12);
    }

    .main-content {
      margin-left: 260px;
      flex: 1;
      background-color: #f8f9fa;
      min-height: 100vh;
    }
  `]
})
export class SecretariaLayoutComponent {}