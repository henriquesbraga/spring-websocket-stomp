# Spring Socket

Projeto full stack com:

- backend em Spring Boot
- frontend em React + Vite + TypeScript
- comunicacao em tempo real via WebSocket + STOMP

O fluxo principal e simples: o frontend conecta no backend por WebSocket, recebe uma lista inicial privada da sua sessao e escuta um topico publico para sincronizar remocoes em tempo real entre todos os clientes conectados.

## Estrutura do projeto

```text
spring-socket/
├─ backend/
└─ frontend/
```

## Visao geral da comunicacao

1. O backend sobe normalmente na porta `8080`.
2. O frontend conecta em `/ws`.
3. O frontend assina `/user/queue/list` para receber a lista inicial da propria sessao.
4. O frontend assina `/topic/remove` para receber remocoes em tempo real.
5. Quando o usuario clica em um item, o frontend publica o `id` em `/app/click`.
6. O backend recebe esse evento e republica o `id` em `/topic/remove`.
7. Todos os clientes inscritos recebem a remocao e atualizam sua interface localmente.

## Contrato WebSocket/STOMP

### Conexao

- endpoint WebSocket: `ws://localhost:8080/ws`

### Subscribes

- `/user/queue/list`
  Recebe a lista inicial apenas para a sessao atual.

- `/topic/remove`
  Recebe eventos globais de remocao.

### Envios

- `/app/click`
  Envia o `id` do item clicado/removido.

### Payloads

Lista inicial:

```json
[
  { "id": 1, "nome": "Item 1" },
  { "id": 2, "nome": "Item 2" }
]
```

Evento de remocao:

```json
1
```

Ou, dependendo do cliente STOMP, como texto simples:

```text
1
```

Por isso o frontend normaliza o `id` para evitar comparacao entre `string` e `number`.

## Backend

O backend e uma aplicacao Spring Boot com suporte a WebSocket e STOMP. Ele foi montado para:

- expor o endpoint `/ws`
- receber mensagens em `/app/click`
- entregar a lista inicial em `/user/queue/list`
- publicar remocoes em `/topic/remove`

### Componentes principais

- `SocketexampleApplication`
  Classe principal da aplicacao Spring Boot.

- `WebSocketConfig`
  Habilita WebSocket/STOMP e configura os prefixos `/topic`, `/queue`, `/app` e `/user`, alem do endpoint `/ws`.

- `WebSocketEventListener`
  Escuta o `SessionSubscribeEvent` e envia a lista inicial quando a sessao se inscreve em `/user/queue/list`.

- `NotificationController`
  Recebe mensagens em `/app/click` e redistribui o `itemId` em `/topic/remove`.

### Dependencias principais

- `spring-boot-starter-webmvc`
- `spring-boot-starter-websocket`
- `spring-boot-devtools`
- `spring-boot-starter-webmvc-test`

### Rodar o backend

Entre na pasta `backend` e execute a aplicacao Spring Boot usando o fluxo que o projeto ja utiliza. Em projetos Maven, normalmente:

```bash
./mvnw spring-boot:run
```

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Se preferir, tambem e possivel rodar pela IDE.

## Frontend

O frontend foi feito com React + Vite + TypeScript e usa `@stomp/stompjs` para consumir o backend.

### Requisitos

- Node.js 20+ recomendado
- backend rodando em `localhost:8080`

### Dependencias principais

- `react`
- `react-dom`
- `@stomp/stompjs`
- `vite`
- `typescript`
- `@vitejs/plugin-react`

### Instalar dependencias

```bash
npm install
```

### Rodar em desenvolvimento

Entre na pasta `frontend` e execute:

```bash
npm run dev
```

Depois abra o endereco mostrado pelo Vite, normalmente `http://localhost:5173`.

### Gerar build

```bash
npm run build
```

### Comportamento do frontend

- conecta em `ws://localhost:8080/ws`
- assina `/user/queue/list`
- assina `/topic/remove`
- publica em `/app/click`
- normaliza `id` como numero
- usa reconexao automatica com `reconnectDelay: 5000`

## Como executar o projeto completo

1. Inicie o backend na pasta `backend`.
2. Inicie o frontend na pasta `frontend`.
3. Abra o frontend no navegador.
4. Conecte mais de uma aba ou mais de um cliente para validar a sincronizacao em tempo real.

## Resumo arquitetural

O projeto combina dois tipos de comunicacao:

- ponto a ponto
  Para entregar a lista inicial a uma sessao especifica em `/user/queue/list`

- broadcast
  Para propagar remocoes a todos os clientes em `/topic/remove`

Essa separacao evita enviar a carga inicial para todos e, ao mesmo tempo, permite sincronizar eventos compartilhados entre clientes conectados.
