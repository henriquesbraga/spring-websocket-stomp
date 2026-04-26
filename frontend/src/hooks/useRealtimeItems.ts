import { useEffect, useRef, useState } from 'react';
import { ItemsStompClient } from '../lib/stompClient';
import type { ConnectionStatus, Item, ItemId } from '../types';

interface UseRealtimeItemsResult {
  items: Item[];
  connectionStatus: ConnectionStatus;
  errorMessage: string | null;
  removeItem: (id: ItemId) => void;
}

export const useRealtimeItems = (): UseRealtimeItemsResult => {
  const [items, setItems] = useState<Item[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clientRef = useRef<ItemsStompClient | null>(null);

  useEffect(() => {
    const client = new ItemsStompClient({
      onConnect: () => {
        setConnectionStatus('connected');
        setErrorMessage(null);
      },
      onDisconnect: () => {
        setConnectionStatus('disconnected');
      },
      onError: (message) => {
        setConnectionStatus('error');
        setErrorMessage(message);
      },
      onInitialList: (nextItems) => {
        setItems(nextItems);
      },
      onRemove: (removedId) => {
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== removedId),
        );
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      clientRef.current = null;
      void client.deactivate();
    };
  }, []);

  const removeItem = (id: ItemId) => {
    clientRef.current?.publishClick(id);
  };

  return {
    items,
    connectionStatus,
    errorMessage,
    removeItem,
  };
};
