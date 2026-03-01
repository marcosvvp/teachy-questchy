# Questchy

**Quer melhorar o engajamento na sala de aula? Conheça o Questchy (Question + Teachy)!**

Questchy é uma plataforma para criar experiências de aula interativas entre alunos e professores em tempo real. O sistema permite criar perguntas durante uma apresentação para acompanhar o engajamento e a compreensão da turma.

## 🚀 Funcionalidades

Atualmente, o Questchy suporta três tipos de interações com os alunos:
- **Texto Livre** (O aluno digita a resposta correta em uma caixa de texto)
- **Múltipla Escolha** (O aluno escolhe por meio de uma ou mais alternativas predestinadas)
- **Ranking** (O aluno ordena cartões de opções por meio de um sistema de *drag and drop*)

### 👩‍🏫 Visão do Professor
O professor possui acesso ao painel de gerenciamento (a tela inicial "logada" na aplicação). 
Nela é possível:
1. Criar e gerenciar um banco de perguntas.
2. Definir o Título, as Alternativas e o Tipo da interação.
3. Iniciar uma **Apresentação ao vivo**. Ao iniciar, os alunos conseguem ingressar na sala usando o código exibido e ao encerrar a apresentação, os resultados ficam gravados!

### 👨‍🎓 Visão do Aluno
O aluno deve acessar a página pública designada (ou pelo link direto), informar seu nome, inserir o **Código da Sala** e responder durante a apresentação. 

Todas as respostas são processadas via arquitetura de streaming em **tempo real** para que o professor e os demais alunos acompanhem instantaneamente as respostas e participem simultaneamente de forma interativa.

---

## 🛠 Tecnologias e Stack

O projeto segue um fluxo moderno de ponta a ponta:
- **Frontend / React Base:** [Next.js](https://nextjs.org/) (App Router).
- **Estilização e Módulos:** [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados (ORM):** [Prisma](https://www.prisma.io/) apontando para um PostgreSQL.
- **WebSockets:** Servidor customizado (node server.js) usando **Socket.io**.

---

## 📦 Executando o Questchy Localmente

Infraestrutura Dockerizada configurada para subir o ambiente localmente.

### Usando Docker
O repositório contém um `docker-compose.yml`. Rode o comando abaixo para que o banco (Postgres) e a aplicação sejam executados em conjunto:

```bash
docker compose up -d
```

### Rodando Manualmente
1. Instancie o um banco de dados PostgreSQL.
2. Clone o repositório, rode o `npm install` para instalar as dependências.
3. Crie um arquivo `.env`, use o `.env.example` como base, e insira a *Connection String* no formato variável `DATABASE_URL`.
4. Rode a migração para criar as tabelas do banco de dados:
```bash
npx prisma db push
```
5. Em seguida, rode o servidor Next.js:
```bash
npm run dev
```
6. A aplicação estará disponível em `localhost:3000`.

---

## 🔮 Evolução do Projeto
Este é apenas o protótipo V1 para gerenciar perguntas isoladas.

Os **Próximos Passos** para a maturidade do sistema incluem:
- **Autenticação:** Implementar um sistema de autenticação para professores e alunos.
- **Agrupamento por Aulas:** Criar entidades de `"Aulas"` que podem agrupar várias perguntas (assim o professor constrói um plano de aula).
- **Comunidade:** Criar um sistema de comunidade para que os professores possam compartilhar suas aulas.
- **Separação de Módulos:** Isolar as páginas de Criação, Apresentação e Relatórios em roteamentos distintos para melhor modularização de código.
- **Otimização de Código:** Otimizar as chamadas dos endpoints para serem paginadas.