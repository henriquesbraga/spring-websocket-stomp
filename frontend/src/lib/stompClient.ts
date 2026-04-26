import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import type { Item, ItemId } from '../types';

const SOCKET_URL = 'ws://192.168.1.161:8080/ws';
const LIST_DESTINATION = '/user/queue/list';
const REMOVE_DESTINATION = '/topic/remove';
const CLICK_DESTINATION = '/app/click';

export interface StompHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (message: string) => void;
  onInitialList?: (items: Item[]) => void;
  onRemove?: (id: ItemId) => void;
}

const normalizeId = (value: unknown): ItemId | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const parseInitialList = (message: IMessage): Item[] => {
  const parsed = JSON.parse(message.body) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const candidate = entry as Record<string, unknown>;
    const id = normalizeId(candidate.id);
    const nome = typeof candidate.nome === 'string' ? candidate.nome : '';

    if (id === null || !nome) {
      return [];
    }

    return [{ id, nome }];
  });
};

const parseRemoveId = (message: IMessage): ItemId | null => {
  const parsed = JSON.parse(message.body) as unknown;
  return normalizeId(parsed);
};

export class ItemsStompClient {
  private client: Client;
  private subscriptions: StompSubscription[] = [];

  constructor(private handlers: StompHandlers) {
    this.client = new Client({
      brokerURL: SOCKET_URL,
      reconnectDelay: 5000,
      debug: () => undefined,
      onConnect: () => {
        this.handlers.onConnect?.();
        this.subscribeToTopics();
      },
      onStompError: (frame) => {
        const details = frame.headers.message ?? 'Erro STOMP no broker.';
        this.handlers.onError?.(details);
      },
      onWebSocketClose: () => {
        this.clearSubscriptions();
        this.handlers.onDisconnect?.();
      },
      onWebSocketError: () => {
        this.handlers.onError?.('Falha na conexao WebSocket.');
      },
    });
  }

  activate() {
    this.client.activate();
  }

  deactivate() {
    this.clearSubscriptions();
    return this.client.deactivate();
  }

  publishClick(id: ItemId) {
    this.client.publish({
      destination: CLICK_DESTINATION,
      body: JSON.stringify(id),
    });
  }

  private subscribeToTopics() {
    this.clearSubscriptions();

    this.subscriptions.push(
      this.client.subscribe(LIST_DESTINATION, (message) => {
        try {
          const items = parseInitialList(message);
          this.handlers.onInitialList?.(items);
        } catch {
          this.handlers.onError?.('Nao foi possivel ler a lista inicial.');
        }
      }),
    );

    this.subscriptions.push(
      this.client.subscribe(REMOVE_DESTINATION, (message) => {
        try {
          const id = parseRemoveId(message);

          if (id !== null) {
            this.handlers.onRemove?.(id);
            return;
          }

          this.handlers.onError?.('Recebido id invalido para remocao.');
        } catch {
          this.handlers.onError?.('Nao foi possivel ler a mensagem de remocao.');
        }
      }),
    );
  }

  private clearSubscriptions() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
