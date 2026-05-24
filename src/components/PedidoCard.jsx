const STATUS_CONFIG = {
  PENDENTE:   { label: 'Pendente',   color: '#b45309', bg: '#fef3c7' },
  EM_PREPARO: { label: 'Em preparo', color: '#1d4ed8', bg: '#dbeafe' },
  ENTREGUE:   { label: 'Entregue',   color: '#15803d', bg: '#dcfce7' },
  CANCELADO:  { label: 'Cancelado',  color: '#b91c1c', bg: '#fee2e2' },
};

export default function PedidoCard({ pedido, onCancelar }) {
  const { id, status, preco, itens = [] } = pedido;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDENTE;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.id}>Pedido #{id}</span>
        <span style={{ ...styles.badge, color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>
      </div>

      {itens.length > 0 && (
        <ul style={styles.list}>
          {itens.map((item) => (
            <li key={item.id} style={styles.item}>
              <span style={styles.itemName}>
                {item.quantidade}× {item.sabor} ({item.tamanho})
              </span>
              <span style={styles.itemPrice}>
                R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={styles.footer}>
        <span style={styles.total}>Total: R$ {preco.toFixed(2)}</span>
        {status === 'PENDENTE' && onCancelar && (
          <button style={styles.cancelBtn} onClick={() => onCancelar(id)}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 16,
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  id: {
    fontWeight: 600,
    fontSize: 15,
    color: '#111827',
  },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    letterSpacing: 0.3,
  },
  list: {
    listStyle: 'none',
    margin: '0 0 12px',
    padding: 0,
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    color: '#374151',
    padding: '4px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  itemName: { color: '#4b5563' },
  itemPrice: { fontWeight: 500, color: '#111827' },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  total: {
    fontWeight: 700,
    fontSize: 15,
    color: '#111827',
  },
  cancelBtn: {
    background: 'none',
    border: '1px solid #ef4444',
    color: '#ef4444',
    borderRadius: 8,
    padding: '5px 14px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  },
};