# README TÉCNICO — SISTEMA MAMÃE A BORDO

## 1. Introdução

O projeto **Mamãe a Bordo** é uma aplicação web e móvel voltada para auxiliar mães e gestantes em estado de vulnerabilidade, oferecendo informações e ferramentas práticas durante a gestação e os primeiros cuidados com o recém-nascido.  
A aplicação possui funcionalidades de cadastro e login, postagens e interações entre usuárias, agendamento de eventos pessoais e um chat privado em tempo real.

O sistema é dividido em **duas camadas principais**:  
- **Frontend**, responsável pela interface e interação com o usuário;  
- **Backend**, responsável pelo gerenciamento dos dados, autenticação, comunicação em tempo real e persistência no banco de dados.

---

## 2. Estrutura de Pastas

A organização dos arquivos segue uma divisão modular para facilitar a manutenção e escalabilidade do projeto:

```
MAMAE_A_BORDO/
│
├── src/
│   ├── backend/
│   │   ├── db_config.js           # Configuração da conexão com o banco de dados MySQL
│   │   ├── server.js              # Servidor principal (Express + Socket.IO)
│   │   ├── mamae_sql.sql          # Script SQL de criação das tabelas do sistema
│   │   ├── package.json           # Dependências e scripts do Node.js
│   │   └── package-lock.json      # Controle de versão das dependências
│   │
│   └── frontend/
│       ├── agenda/
│       │   ├── agenda.html
│       │   ├── agenda.css
│       │   └── agenda.js
│       │
│       ├── cadastro/
│       │   ├── cadastro.html
│       │   ├── cadastro.css
│       │   └── cadastro.js
│       │
│       ├── chat/
│       │   ├── online.html
│       │   ├── online.css
│       │   └── online.js
│       │
│       ├── login/
│       │   ├── login.html
│       │   ├── login.css
│       │   └── login.js
│       │
│       ├── perfil/
│       │   ├── perfil.html
│       │   ├── perfil.css
│       │   └── perfil.js
│       │
│       ├── postagem/
│       │   ├── postagem.html
│       │   ├── postagem.css
│       │   └── postagem.js
│       │
│       ├── principal/
│       │   ├── principal.html
│       │   ├── principal.css
│       │   ├── conteudos.css
│       │   ├── alimentacao*.html
│       │   ├── amamentacao*.html
│       │   ├── gestacao*.html
│       │   ├── puerpério*.html
│       │   └── recem_nascido*.html
│       │
│       └── assets/                # Imagens, ícones e arquivos estáticos
│
└── README.md                      # Documento técnico do sistema
```

---

## 3. Tecnologias Utilizadas

### Backend
- **Node.js** — Plataforma de execução JavaScript no lado do servidor.  
- **Express.js** — Framework para criação e gerenciamento de rotas HTTP.  
- **Socket.IO** — Biblioteca para comunicação em tempo real via WebSockets (chat).  
- **MySQL** — Banco de dados relacional utilizado para armazenamento persistente.  
- **CORS e JSON Middleware** — Suporte a comunicação entre domínios e parsing de requisições.

### Frontend
- **HTML5, CSS3 e JavaScript** — Estrutura, estilo e interatividade das páginas.  
- **Fetch API** — Comunicação assíncrona com o servidor via requisições HTTP.  
- **Socket.IO Client** — Conexão em tempo real com o servidor para o chat privado.  

---

## 4. Estrutura do Servidor (server.js)

O arquivo `server.js` é responsável pela inicialização e configuração de todo o backend da aplicação.  
As principais funcionalidades implementadas são:

### 4.1. Rotas de Usuário
- **POST `/usuario/cadastro`** — Cadastra novos usuários.  
- **GET `/usuario/listar`** — Retorna a lista completa de usuários.  
- **PUT `/usuario/editar/:id`** — Atualiza os dados de um usuário existente.  
- **DELETE `/usuario/deletar/:id`** — Remove o registro de um usuário do banco de dados.

### 4.2. Autenticação
- **POST `/login`** — Valida as credenciais de login e retorna o usuário autenticado.

### 4.3. Postagens e Respostas
- **POST `/posts`** — Cria uma nova postagem.  
- **GET `/posts`** — Lista todas as postagens.  
- **PUT `/posts/:id`** — Edita o conteúdo de uma postagem.  
- **DELETE `/posts/:id`** — Exclui uma postagem e suas respostas associadas.  
- **POST `/respostas`** — Adiciona uma resposta a uma postagem.  
- **GET `/respostas/:post_id`** — Lista respostas de uma postagem.  
- **PUT `/respostas/:id` e DELETE `/respostas/:id`** — Edita ou remove respostas.

### 4.4. Agenda de Eventos
- **POST `/eventos/salvar`** — Salva novos eventos pessoais.  
- **GET `/eventos/listar/:id_usuario`** — Retorna eventos do usuário logado.  
- **PUT `/agenda/evento/editar/:id`** — Atualiza informações de um evento.  
- **DELETE `/agenda/evento/deletar/:id`** — Exclui um evento do banco de dados.

### 4.5. Chat Privado (Socket.IO)
- Conexão e desconexão de usuários em tempo real.  
- Envio e recebimento de mensagens privadas.  
- Histórico de conversas entre dois usuários.  
- Edição e exclusão de mensagens já enviadas.  

---

## 5. Banco de Dados

O banco de dados **MySQL** armazena informações nas seguintes tabelas principais:
- `usuario` — Dados cadastrais e de autenticação.  
- `posts` — Postagens criadas pelos usuários.  
- `respostas` — Comentários associados às postagens.  
- `eventos` — Agenda pessoal dos usuários.  
- `private_messages` — Mensagens trocadas via chat privado.

O script de criação das tabelas está disponível no arquivo `mamae_sql.sql`.

---

## 6. Execução do Servidor

### Requisitos
- Node.js (versão 18 ou superior)
- MySQL Server instalado e configurado
- Arquivo `.env` ou configuração manual no `db_config.js` com as credenciais do banco

### Instalação
```bash
npm install
```

### Execução
```bash
node server.js
```

O servidor será iniciado por padrão na porta **3000**.  
A interface web pode ser acessada localmente através de `http://localhost:3000`.

---

## 7. Considerações Finais

A arquitetura modular do **Mamãe a Bordo** favorece a escalabilidade, manutenção e expansão de funcionalidades futuras, como integração de APIs externas e aprimoramento da segurança de autenticação.  
A utilização de **Express** e **Socket.IO** permite desempenho eficiente e comunicação em tempo real entre os usuários, consolidando a aplicação como uma ferramenta prática e socialmente relevante no apoio à maternidade.
