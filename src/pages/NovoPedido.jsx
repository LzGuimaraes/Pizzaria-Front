import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const SABORES = ['Margherita', 'Calabresa', 'Frango', 'Portuguesa', 'Quatro Queijos'];
const TAMANHOS = [
  { label: 'Pequena (P)', valor: 'P', preco: 29.9 },
  { label: 'Média (M)',   valor: 'M', preco: 39.9 },
  { label: 'Grande (G)',  valor: 'G', preco: 49.9 },
];

function itemVazio() {
  return { sabor: SABORES[0], tamanho: 'M', quantidade: 1, precoUnitario: 39.9 };
}

export default function NovoPedido() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([itemVazio()]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const atualizarItem = (index, campo, valor) => {
    setItens((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const atualizado = { ...item, [campo]: valor };
        if (campo === 'tamanho') {
          atualizado.precoUnitario =
            TAMANHOS.find((t) => t.valor === valor)?.preco ?? item.precoUnitario;
        }
        return atualizado;
      })
    );
  };

  const adicionarItem = () => setItens((prev) => [...prev, itemVazio()]);

  const removerItem = (index) =>
    setItens((prev) => prev.filter((_, i) => i !== index));

  const total = itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0);

  const handleSubmit = async () => {
    setErro('');
    setEnviando(true);
    try {
      await api.post('/pedidos', { itens });
      navigate('/pedidos');
    } catch (e) {
      setErro(e.response?.data?.error ?? 'Erro ao criar pedido.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Novo Pedido</h1>

        {itens.map((item, index) => (
          <div key={index} style={styles.itemCard}>
            <div style={styles.itemHeader}>
              <span style={styles.itemLabel}>Item {index + 1}</span>
              {itens.length > 1 && (
                <button style={styles.removeBtn} onClick={() => removerItem(index)}>
                  Remover
                </button>
              )}
            </div>

            <div style={styles.row}>
              <label style={styles.label}>Sabor</label>
              <select
                style={styles.select}
                value={item.sabor}
                onChange={(e) => atualizarItem(index, 'sabor', e.target.value)}
              >
                {SABORES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={styles.row}>
              <label style={styles.label}>Tamanho</label>
              <div style={styles.tamanhoGroup}>
                {TAMANHOS.map((t) => (
                  <button
                    key={t.valor}
                    style={{
                      ...styles.tamanhoBtn,
                      ...(item.tamanho === t.valor ? styles.tamanhoBtnActive : {}),
                    }}
                    onClick={() => atualizarItem(index, 'tamanho', t.valor)}
                  >
                    {t.label}
                    <span style={styles.tamanhoPreco}>R$ {t.preco.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.row}>
              <label style={styles.label}>Quantidade</label>
              <div style={styles.qtdGroup}>
                <button
                  style={styles.qtdBtn}
                  onClick={() =>
                    atualizarItem(index, 'quantidade', Math.max(1, item.quantidade - 1))
                  }
                >−</button>
                <span style={styles.qtdNum}>{item.quantidade}</span>
                <button
                  style={styles.qtdBtn}
                  onClick={() => atualizarItem(index, 'quantidade', item.quantidade + 1)}
                >+</button>
              </div>
            </div>

            <div style={styles.subtotal}>
              Subtotal: R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
            </div>
          </div>
        ))}

        <button style={styles.addBtn} onClick={adicionarItem}>
          + Adicionar outra pizza
        </button>

        {erro && <p style={styles.erro}>{erro}</p>}

        <div style={styles.footer}>
          <span style={styles.total}>Total: R$ {total.toFixed(2)}</span>
          <div style={styles.actions}>
            <button style={styles.cancelarBtn} onClick={() => navigate('/pedidos')}>
              Cancelar
            </button>
            <button
              style={{ ...styles.confirmarBtn, opacity: enviando ? 0.6 : 1 }}
              onClick={handleSubmit}
              disabled={enviando}
            >
              {enviando ? 'Enviando…' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f9fafb',
    padding: '32px 16px',
  },
  container: {
    maxWidth: 560,
    margin: '0 auto',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 24,
  },
  itemCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '20px',
    marginBottom: 16,
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemLabel: {
    fontWeight: 600,
    fontSize: 14,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: 13,
    cursor: 'pointer',
    padding: 0,
  },
  row: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#6b7280',
    marginBottom: 6,
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    color: '#111827',
    background: '#fff',
  },
  tamanhoGroup: {
    display: 'flex',
    gap: 8,
  },
  tamanhoBtn: {
    flex: 1,
    padding: '8px 4px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    color: '#374151',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  tamanhoBtnActive: {
    border: '2px solid #f97316',
    color: '#ea580c',
    background: '#fff7ed',
  },
  tamanhoPreco: {
    fontSize: 11,
    color: '#6b7280',
  },
  qtdGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  qtdBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#374151',
  },
  qtdNum: {
    fontSize: 18,
    fontWeight: 600,
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  subtotal: {
    textAlign: 'right',
    fontSize: 13,
    fontWeight: 600,
    color: '#6b7280',
    marginTop: 4,
  },
  addBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: 10,
    border: '2px dashed #d1d5db',
    background: 'none',
    color: '#6b7280',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    marginBottom: 24,
  },
  erro: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  total: {
    fontSize: 18,
    fontWeight: 700,
    color: '#111827',
  },
  actions: {
    display: 'flex',
    gap: 10,
  },
  cancelarBtn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  confirmarBtn: {
    padding: '10px 24px',
    borderRadius: 8,
    border: 'none',
    background: '#f97316',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};