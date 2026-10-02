# Flowix — Frontend

Sistema de gestão escolar | Projeto Frontend Angular

---

## Sumário
- [Sobre o Projeto](#sobre-o-projeto)
- [Fluxo de Navegação](#fluxo-de-navegação)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Instalação e Execução](#instalação-e-execução)
- [Rotas](#rotas)
- [Commits Semânticos](#commits-semânticos)
- [Tecnologias](#tecnologias)
- [Observações](#observações)

---

## Sobre o Projeto

O **Flowix** é um sistema voltado para ambientes escolares, com três perfis de usuário:

| Perfil         | Descrição                                      |
|----------------|------------------------------------------------|
| 🧑‍🎓 Aluno        | Acesso do aluno                                |
| 🏫 Secretaria   | Gestão e proteção de dados dos alunos          |
| 👨‍👩‍👧 Responsável | Acompanhamento das atividades do aluno         |

---

## Fluxo de Navegação


> ⚠️ **Importante:** Acesse sempre por `http://localhost:4200`. Não entre diretamente em `/cadastro-perfil`, pois a rota raiz garante a passagem pela tela de carregamento.

---

## Estrutura de Pastas


---

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
ng serve
# ou
npm start

# Acessar no navegador
http://localhost:4200

Mensagem	Descrição
feat: adicionar página inicial com tempo de espera e redirecionamento	Criada tela de abertura com redirecionamento automático após 3s
refactor(routes): definir rota padrão para página inicial	Rota raiz apontando para a tela inicial
style: remover borda branca da interface	Ajuste visual — sem alteração de lógica
feat: estilizar página de cadastro de perfil	Estrutura e estilos da página de escolha de perfil
refactor: ajustar estrutura do componente raiz	Organização do app.component e garantia do router-outlet

