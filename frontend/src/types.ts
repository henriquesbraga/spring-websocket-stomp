export type ItemId = number;

export interface Item {
  id: ItemId;
  nome: string;
}

export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';
