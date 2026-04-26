# Socketexample

Este projeto e um backend Spring Boot com WebSocket + STOMP. Ele demonstra um fluxo simples de notificacao em tempo real: o cliente recebe uma lista inicial de itens ao se inscrever e, quando algum item e clicado/removido, todos os clientes conectados recebem esse evento.

## Objetivo do projeto

O backend foi montado para atender um frontend que:

- conecta via WebSocket em `/ws`
- assina a fila do usuario em `/user/queue/list` para receber a lista inicial
- assina o topico `/topic/remove` para receber remocoes em tempo real
- envia mensagens para `/app/click` quando o usuario clica em um item

## Fluxo geral

1. A aplicacao Spring Boot sobe normalmente.
2. O cliente abre conexao WebSocket em `/ws`.
3. O cliente faz subscribe em `/user/queue/list`.
4. O backend detecta esse subscribe e envia a lista inicial apenas para aquela sessao.
5. O cliente tambem faz subscribe em `/topic/remove`.
6. Quando um cliente envia um `itemId` para `/app/click`, o backend recebe essa mensagem.
7. O backend publica esse `itemId` em `/topic/remove`.
8. Todos os clientes inscritos nesse topico recebem o evento e podem remover o item localmente.

## Estrutura das classes

### `SocketexampleApplication`

Arquivo: [src/main/java/dev/henriquesbraga/socketexample/SocketexampleApplication.java](/abs/path/C:/Users/henri/IdeaProjects/socketexample/src/main/java/dev/henriquesbraga/socketexample/SocketexampleApplication.java:1)

Funcao:

- e a classe principal do Spring Boot
- possui o metodo `main`
- chama `SpringApplication.run(...)` para inicializar o contexto da aplicacao

Na pratica, ela:

- sobe o servidor web embutido
- carrega os beans Spring
- ativa as configuracoes, controllers e listeners do projeto

### `WebSocketConfig`

Arquivo: [src/main/java/dev/henriquesbraga/socketexample/configuration/WebSocketConfig.java](/abs/path/C:/Users/henri/IdeaProjects/socketexample/src/main/java/dev/henriquesbraga/socketexample/configuration/WebSocketConfig.java:1)

Funcao:

- habilita o suporte a WebSocket com broker de mensagens STOMP
- define por onde o cliente conecta
- define para onde o cliente envia mensagens
- define por onde o backend publica eventos

Pontos principais da classe:

- `@EnableWebSocketMessageBroker`
  Ativa a infraestrutura de mensageria WebSocket/STOMP do Spring.

- `configureMessageBroker(...)`
  Configura os destinos usados no projeto:
  - `/topic`: canal de publicacao para eventos compartilhados
  - `/queue`: canal usado para destinos de usuario
  - `/app`: prefixo das mensagens enviadas do cliente para metodos anotados com `@MessageMapping`
  - `/user`: prefixo de destino especifico por sessao/usuario

- `registerStompEndpoints(...)`
  Registra o endpoint WebSocket:
  - `/ws`

Esse e o endpoint que o frontend deve usar para abrir a conexao STOMP.

### `WebSocketEventListener`

Arquivo: [src/main/java/dev/henriquesbraga/socketexample/configuration/WebSocketEventListener.java](/abs/path/C:/Users/henri/IdeaProjects/socketexample/src/main/java/dev/henriquesbraga/socketexample/configuration/WebSocketEventListener.java:1)

Funcao:

- escuta eventos internos do ciclo de vida do WebSocket/STOMP
- envia a lista inicial para o cliente quando ele realmente se inscreve em `/user/queue/list`

Por que essa classe existe:

- enviar a lista no momento do `CONNECT` pode falhar, porque o cliente ainda nao terminou o `SUBSCRIBE`
- por isso o envio foi movido para o `SessionSubscribeEvent`

Como ela funciona:

- o metodo anotado com `@EventListener` recebe um `SessionSubscribeEvent`
- o `StompHeaderAccessor` extrai o destino do subscribe
- a classe verifica se o destino e `/user/queue/list`
- se nao for esse destino, ela ignora o evento
- se for, ela monta a lista inicial
- depois usa `SimpMessagingTemplate.convertAndSendToUser(...)` para enviar a lista apenas para aquela sessao

Detalhe importante:

- o envio usa o `sessionId` da conexao e headers com esse mesmo `sessionId`
- isso garante que a mensagem va para o cliente correto dentro do destino de usuario

Hoje a lista inicial esta mockada diretamente na classe:

```java
List<Object> lista = List.of(
    Map.of("id", 1, "nome", "Item 1"),
    Map.of("id", 2, "nome", "Item 2")
);
```

Em um cenario real, essa lista normalmente viria de:

- banco de dados
- servico de dominio
- cache
- API externa

### `NotificationController`

Arquivo: [src/main/java/dev/henriquesbraga/socketexample/controller/NotificationController.java](/abs/path/C:/Users/henri/IdeaProjects/socketexample/src/main/java/dev/henriquesbraga/socketexample/controller/NotificationController.java:1)

Funcao:

- recebe mensagens enviadas pelos clientes
- retransmite eventos para todos os clientes interessados

Como ela funciona:

- o metodo `handleClick(String itemId)` esta anotado com `@MessageMapping("click")`
- isso significa que o frontend deve publicar em `/app/click`
- o payload esperado e um `String` com o identificador do item
- ao receber esse `itemId`, a classe publica o mesmo valor em `/topic/remove`

Resultado:

- qualquer cliente inscrito em `/topic/remove` recebe o `itemId`
- cada frontend decide localmente remover esse item da sua interface

Esse controller nao retorna HTTP REST. Ele participa apenas do fluxo STOMP sobre WebSocket.

### `SocketexampleApplicationTests`

Arquivo: [src/test/java/dev/henriquesbraga/socketexample/SocketexampleApplicationTests.java](/abs/path/C:/Users/henri/IdeaProjects/socketexample/src/test/java/dev/henriquesbraga/socketexample/SocketexampleApplicationTests.java:1)

Funcao:

- valida que o contexto Spring sobe sem erros

O teste atual:

- usa `@SpringBootTest`
- executa um teste simples `contextLoads()`
- serve como verificacao basica de bootstrap da aplicacao

Ele nao testa o fluxo WebSocket em detalhe. Se o projeto crescer, vale adicionar testes de integracao para:

- conexao STOMP
- subscribe em `/user/queue/list`
- envio para `/app/click`
- recebimento em `/topic/remove`

## Dependencias principais

O `pom.xml` inclui estas dependencias mais relevantes:

- `spring-boot-starter-webmvc`
  Suporte web base da aplicacao.

- `spring-boot-starter-websocket`
  Suporte a WebSocket e STOMP.

- `spring-boot-devtools`
  Facilita desenvolvimento local.

- `spring-boot-starter-webmvc-test`
  Suporte a testes.

## Contrato de comunicacao com o frontend

### Conexao

- WebSocket endpoint: `ws://<host>:8080/ws`

Exemplos:

- no mesmo computador: `ws://localhost:8080/ws`
- no celular na mesma rede: `ws://IP_DO_PC:8080/ws`

### Subscribes do frontend

- `/user/queue/list`
  Recebe a lista inicial apenas da propria sessao.

- `/topic/remove`
  Recebe eventos globais de remocao.

### Envios do frontend

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

ou, dependendo do cliente STOMP, como texto simples:

```text
1
```

Por isso o frontend deve tratar `id` com alguma tolerancia entre `string` e `number`.

## Resumo arquitetural

Este backend tem dois tipos de comunicacao:

- comunicacao ponto a ponto
  Usada para entregar a lista inicial a uma sessao especifica com `/user/queue/list`

- comunicacao broadcast
  Usada para notificar todos os clientes em `/topic/remove`

Essa separacao e util porque:

- a carga inicial nao precisa ser enviada para todos
- os eventos de alteracao precisam ser compartilhados entre todos os clientes conectados

## Como explicar isso rapidamente para a equipe

Uma forma simples de apresentar o projeto e:

"O cliente conecta em `/ws`, assina uma fila privada para receber sua lista inicial e assina um topico publico para receber remocoes em tempo real. Quando algum cliente clica em um item, ele envia esse `id` para `/app/click`, e o backend redistribui o evento em `/topic/remove` para sincronizar todas as telas."

