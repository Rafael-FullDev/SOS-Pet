<div align="center">
  <img src="assets/images/home/LogoSOSPet.png" alt="Logo do SOS Pet" width="180">

  # SOS Pet

  **A rede de socorro inteligente para a causa animal.**

  Uma plataforma colaborativa que conecta tutores, voluntários, ONGs e a comunidade para localizar animais perdidos, apoiar animais de rua, promover adoções e mobilizar ajuda.

  ![Status](https://img.shields.io/badge/status-em%20desenvolvimento-E63946?style=for-the-badge)
  ![HTML](https://img.shields.io/badge/HTML5-1E1E24?style=for-the-badge&logo=html5&logoColor=F2CB51)
  ![CSS](https://img.shields.io/badge/CSS3-1E1E24?style=for-the-badge&logo=css&logoColor=F2CB51)
</div>

---

## Sobre o projeto

O SOS Pet foi pensado para centralizar informações que normalmente ficam espalhadas em grupos, publicações e mensagens. A proposta é facilitar a divulgação de animais perdidos, pedidos de ajuda, adoções e ações de cuidado com animais em situação de vulnerabilidade.

## Funcionalidades apresentadas

- Página inicial com apresentação da plataforma, serviços e histórias da comunidade.
- Página de animais de rua com busca, filtros, categorias e animais disponíveis para ajuda.
- Feed com publicações sobre pets perdidos, adoção e pedidos de ajuda.
- Página de pedidos de ajuda com filtros, cards, ações e paginação.
- Páginas de login e cadastro.
- Navegação integrada entre todas as páginas existentes.
- Seções para animais perdidos, pedidos, adoção e informações sobre o projeto.

## Páginas

| Página | Arquivo | Descrição |
| --- | --- | --- |
| Início | `index.html` | Apresenta a proposta, os serviços e a comunidade SOS Pet. |
| Animais de Rua | `pages/animais-de-rua.html` | Reúne filtros, necessidades e animais que precisam de apoio. |
| Feed | `pages/feed.html` | Exibe publicações de membros e organizações da comunidade. |
| Pedidos de Ajuda | `pages/pedidos-de-ajuda.html` | Apresenta pedidos urgentes, doações e resgates da comunidade. |
| Login | `pages/login.html` | Tela de acesso à plataforma. |
| Cadastro | `pages/cadastro.html` | Formulário para criação de conta. |

## Estrutura do projeto

```text
SOS-Pet-main/
├── assets/
│   └── images/
│       ├── animais-de-rua/
│       ├── home/
│       ├── pedidos-de-ajuda/
│       └── shared/
├── css/
│   ├── animais-de-rua.css
│   ├── cadastro.css
│   ├── feed.css
│   ├── global.css
│   ├── home.css
│   ├── login.css
│   └── pedidos-de-ajuda.css
├── pages/
│   ├── animais-de-rua.html
│   ├── cadastro.html
│   ├── feed.html
│   ├── login.html
│   └── pedidos-de-ajuda.html
├── index.html
└── README.md
```

## Como executar

O projeto é estático e não exige instalação de dependências.

### Pelo VS Code

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**, caso ainda não tenha.
3. Clique com o botão direito em `index.html`.
4. Selecione **Open with Live Server**.

### Pelo terminal

Se você tiver Python instalado, execute na raiz do projeto:

```bash
python -m http.server 5500
```

Depois, acesse `http://localhost:5500` no navegador.

## Tecnologias

- HTML5 para estrutura e conteúdo.
- CSS3 para layout, identidade visual e animações.
- Google Fonts para as tipografias do projeto.
- Font Awesome para os ícones de redes sociais.

## Observações

- O projeto atual é uma interface estática; os formulários, filtros e botões ainda não possuem integração com banco de dados.
- Algumas fotografias do feed são carregadas por links externos e precisam de conexão com a internet para aparecer.
- A identidade visual, os textos, as imagens e os estilos originais foram preservados na organização dos arquivos.

## Próximos passos

- Implementar as páginas completas de animais perdidos e adoção.
- Adicionar interações e validações com JavaScript.
- Integrar autenticação, banco de dados e funcionalidades do usuário.
- Conectar buscas, filtros e publicações a dados reais.

---

<div align="center">
  Feito com cuidado pela equipe <strong>SOS Pet</strong> 🐾
</div>
