import { useRealtimeItems } from './hooks/useRealtimeItems';
import type { ConnectionStatus } from './types';

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Conectando',
  connected: 'Conectado',
  disconnected: 'Desconectado',
  error: 'Erro',
};

function App() {
  const { items, connectionStatus, errorMessage, removeItem } = useRealtimeItems();

  return (
    <main className="page-shell">
      <section className="app-card">
        <header className="hero">
          <div>
            <p className="eyebrow">React + STOMP</p>
            <h1>Lista sincronizada em tempo real</h1>
            <p className="hero-copy">
              O cliente recebe a lista inicial pelo destino do usuario e aplica
              as remocoes publicadas em tempo real para todos os clientes.
            </p>
          </div>

          <div className={`status-pill status-${connectionStatus}`}>
            <span className="status-dot" />
            {statusLabels[connectionStatus]}
          </div>
        </header>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Itens disponiveis</h2>
              <p>{items.length} item(ns) visivel(is)</p>
            </div>
            <code>ws://192.168.1.161:8080/ws</code>
          </div>

          {errorMessage ? <div className="alert">{errorMessage}</div> : null}

          {items.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhum item na lista.</strong>
              <span>
                Aguarde a lista inicial do backend ou a sincronizacao entre os
                clientes.
              </span>
            </div>
          ) : (
            <ul className="item-list">
              {items.map((item) => (
                <li key={item.id} className="item-card">
                  <div>
                    <strong>{item.nome}</strong>
                    <span>ID: {item.id}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="remove-button"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
