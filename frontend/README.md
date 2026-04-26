# Frontend React com STOMP

Aplicacao frontend em React + Vite + TypeScript para consumir um backend Spring Boot com WebSocket STOMP puro em `ws://localhost:8080/ws`.

## Requisitos

- Node.js 20+ recomendado
- Backend Spring Boot rodando em `localhost:8080`

## Dependencias

- `react`
- `react-dom`
- `@stomp/stompjs`
- `vite`
- `typescript`
- `@vitejs/plugin-react`
- `@types/react`
- `@types/react-dom`

## Instalar

```bash
npm install
```

## Rodar em desenvolvimento

```bash
npm run dev
```

Abra o endereco mostrado pelo Vite, normalmente `http://localhost:5173`.

## Gerar build

```bash
npm run build
```

## Como funciona

- Conecta em `ws://localhost:8080/ws` usando `@stomp/stompjs`
- Assina `/user/queue/list` para receber a lista inicial
- Assina `/topic/remove` para receber ids removidos em tempo real
- Publica em `/app/click` quando o usuario clica em remover
- Normaliza `id` como numero para evitar problema de comparacao entre `string` e `number`
- Usa reconexao automatica com `reconnectDelay: 5000`

## Estrutura

```text
react-stomp-list/
├─ index.html
├─ package.json
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ README.md
└─ src/
   ├─ App.tsx
   ├─ main.tsx
   ├─ styles.css
   ├─ types.ts
   ├─ hooks/
   │  └─ useRealtimeItems.ts
   └─ lib/
      └─ stompClient.ts
```
