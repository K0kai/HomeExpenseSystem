# Livro-Caixa de Residência
Projeto de demonstração para visualização e gerenciamento de despesas de uma residência fictícia. O objetivo é apresentar uma aplicação full‑stack com backend em ASP.NET Core (.NET 10) e frontend em React + TypeScript.

## Objetivo

Mostrar competências em:
- Desenvolvimento backend com .NET 10 e C#
- Desenvolvimento frontend com React e TypeScript (Vite)
- Organização de projeto e boas práticas
- Integração com banco local (SQLite) e seed de dados

## Tecnologias

- .NET 10 / ASP.NET Core
- Entity Framework
- C#
- React
- TypeScript
- Vite
- SQLite

## Pré-requisitos

Instale as ferramentas abaixo antes de executar o projeto:

- .NET 10 SDK
- Node.js 18+ e npm (ou yarn/pnpm)
- Docker (opcional, para containerização)

## Estrutura do Repositório (resumo)

- HES_backend/: backend ASP.NET Core (API, DbContext, Services)
	- [HES_backend/Repository/DbSeeder.cs](HES_backend/Repository/DbSeeder.cs)
	- [HES_backend/Repository/AppDbContext.cs](HES_backend/Repository/AppDbContext.cs)
	- [HES_backend/Controllers/TransactionsController.cs](HES_backend/Controllers/TransactionsController.cs)
	- [HES_backend/Controllers/UsersController.cs](HES_backend/Controllers/UsersController.cs)
- HES_frontend/: frontend React + TypeScript (Vite)

## Decisões Técnicas

Principais escolhas realizadas durante o desenvolvimento:

- Optou‑se por SQLite para persistência por facilitar o clone e a execução local sem necessidade de configurar um servidor de banco. Em produção recomendaria um banco gerenciado em nuvem.
- Não foi incluída a biblioteca TanStack Query por decisão de reduzir o escopo do teste técnico; a integração poderia melhorar o cache, sincronização e UX em uma versão futura.


## Trade-offs

Durante o desenvolvimento foram considerados compromissos entre prazo, complexidade e manutenção:

- Usar um banco local facilita o teste, mas implica que dados podem não persistir entre deploys em serviços como Render ou plataformas similares.
- Não usar TanStack Query deixou algumas chamadas e estados mais verbosos e com menos otimizações de cache/revalidação; isso foi aceito para reduzir a complexidade do teste.

## Configuração e execução

Siga os passos abaixo para rodar a aplicação em desenvolvimento local.

### Backend (API)

1. Abra um terminal e entre na pasta do backend:

```bash
cd HES_backend
```

2. Restaurar dependências e executar:

```bash
dotnet restore
dotnet build
dotnet run
```

3. O backend deve iniciar e expor a API (por padrão em `https://localhost:7208` ou `http://localhost:5299`).

4. Seed de dados: o projeto já inclui o `DbSeeder` para popular a base SQLite em ambiente de desenvolvimento. Se necessário, verifique o chamador do seeder em [HES_backend/Program.cs](HES_backend/Program.cs).

### Frontend (UI)

1. Abra outro terminal e entre na pasta do frontend:

```bash
cd HES_frontend
```

2. Instale dependências e rode em modo dev:

```bash
npm install
npm run dev
```

3. O Vite irá servir a aplicação normalmente em `http://localhost:5173` (ou porta indicada no terminal).

4. Para gerar build de produção:

```bash
npm run build
npm run preview
```

## Endpoints principais

- Transações: `/api/transactions` (veja [HES_backend/Controllers/TransactionsController.cs](HES_backend/Controllers/TransactionsController.cs))
- Usuários: `/api/users` (veja [HES_backend/Controllers/UsersController.cs](HES_backend/Controllers/UsersController.cs))

Use ferramentas como `curl` ou Postman para testar as rotas. Exemplo:

```bash
curl http://localhost:5299/api/transactions
```

## Docker (opcional)

O backend inclui um `Dockerfile` em `HES_backend/`. Exemplo de build e execução:

```bash
docker build -f HES_backend/Dockerfile -t hes-backend:latest .
docker run -p 5299:80 --name hes-backend hes-backend:latest
```

Adapte portas e variáveis de ambiente conforme necessário.

## Desenvolvimento e contribuições

- Código do backend em [HES_backend/](HES_backend/)
- Código do frontend em [HES_frontend/](HES_frontend/)

Contribuições são bem-vindas: abra issues ou pull requests com melhorias ou correções.

## Licença

Este projeto é um exemplo para fins de portfólio e avaliação técnica. Sinta-se à vontade para usar como referência.

## Contato

Para dúvidas ou comentários, abra uma issue no repositório ou me contate diretamente.