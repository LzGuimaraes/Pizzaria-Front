import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const SABORES = ['Margherita', 'Calabresa', 'Frango', 'Portuguesa', 'Quatro Queijos'];
const TAMANHOS = [
  { label: 'P', valor: 'P', preco: 29.9 },
  { label: 'M', valor: 'M', preco: 39.9 },
  { label: 'G', valor: 'G', preco: 49.9 },
];

function itemVazio() {
  return { sabor: SABORES[0], tamanho: 'M', quantidade: 1, precoUnitario: 39.9 };
}

export default function NovoPedido() {
  const navigate = useNavigate();
  const [itens, setItens] = useState([itemVazio()]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // ✅ Novos estados para CEP e endereço
  const [cep, setCep] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [endereco, setEndereco] = useState(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState('');

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
  const removerItem = (index) => setItens((prev) => prev.filter((_, i) => i !== index));

  const total = itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0);

  // ✅ Busca o endereço na ViaCEP ao sair do campo CEP
  const buscarCep = async (valor) => {
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    setErroCep('');
    setEndereco(null);

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErroCep('CEP não encontrado.');
      } else {
        setEndereco(data);
      }
    } catch {
      setErroCep('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (e) => {
    // Máscara 00000-000
    const valor = e.target.value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .slice(0, 9);
    setCep(valor);
    if (valor.replace(/\D/g, '').length === 8) buscarCep(valor);
  };

  const handleSubmit = async () => {
    setErro('');

    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setErro('Informe um CEP válido.');
      return;
    }
    if (!endereco) {
      setErro('Aguarde a validação do CEP.');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/pedidos', {
        itens,
        cep: cep.replace(/\D/g, ''),
        numero: numero || undefined,
        complemento: complemento || undefined,
      });
      navigate('/pedidos');
    } catch (e) {
      setErro(e.response?.data?.error ?? 'Erro ao criar pedido.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <button style={s.back} onClick={() => navigate('/pedidos')}>← Voltar</button>
        <h1 style={s.title}>Novo Pedido</h1>

        {/* ── Itens ── */}
        <p style={s.sectionLabel}>🍕 Pizzas</p>
        {itens.map((item, index) => (
          <div key={index} style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardIndex}>Item {index + 1}</span>
              {itens.length > 1 && (
                <button style={s.removeBtn} onClick={() => removerItem(index)}>Remover</button>
              )}
            </div>

            <label style={s.label}>Sabor</label>
            <select
              style={s.select}
              value={item.sabor}
              onChange={(e) => atualizarItem(index, 'sabor', e.target.value)}
            >
              {SABORES.map((s) => <option key={s}>{s}</option>)}
            </select>

            <label style={s.label}>Tamanho</label>
            <div style={s.tamanhoGroup}>
              {TAMANHOS.map((t) => (
                <button
                  key={t.valor}
                  style={{ ...s.tamanhoBtn, ...(item.tamanho === t.valor ? s.tamanhoBtnActive : {}) }}
                  onClick={() => atualizarItem(index, 'tamanho', t.valor)}
                >
                  <span style={s.tamanhoLabel}>{t.label}</span>
                  <span style={s.tamanhoPreco}>R$ {t.preco.toFixed(2)}</span>
                </button>
              ))}
            </div>

            <label style={s.label}>Quantidade</label>
            <div style={s.qtdGroup}>
              <button style={s.qtdBtn} onClick={() => atualizarItem(index, 'quantidade', Math.max(1, item.quantidade - 1))}>−</button>
              <span style={s.qtdNum}>{item.quantidade}</span>
              <button style={s.qtdBtn} onClick={() => atualizarItem(index, 'quantidade', item.quantidade + 1)}>+</button>
            </div>

            <div style={s.subtotal}>
              Subtotal: <strong>R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</strong>
            </div>
          </div>
        ))}

        <button style={s.addBtn} onClick={adicionarItem}>+ Adicionar outra pizza</button>

        {/* ── Endereço de entrega ── */}
        <p style={s.sectionLabel}>📍 Endereço de entrega</p>
        <div style={s.card}>
          <div style={s.enderecoGrid}>
            <div style={{ ...s.fieldGroup, flex: '0 0 160px' }}>
              <label style={s.label}>CEP *</label>
              <input
                style={{ ...s.input, ...(erroCep ? s.inputErro : {}) }}
                placeholder="00000-000"
                value={cep}
                onChange={handleCepChange}
                maxLength={9}
              />
              {buscandoCep && <span style={s.hint}>Buscando…</span>}
              {erroCep && <span style={s.hintErro}>{erroCep}</span>}
            </div>

            <div style={{ ...s.fieldGroup, flex: 1 }}>
              <label style={s.label}>Número</label>
              <input
                style={s.input}
                placeholder="Ex: 42"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
          </div>

          {/* Endereço preenchido automaticamente */}
          {endereco && (
            <div style={s.enderecoConfirm}>
              <span style={s.enderecoIcon}>✓</span>
              <div>
                <p style={s.enderecoRua}>{endereco.logradouro || 'Logradouro não informado'}</p>
                <p style={s.enderecoCidade}>
                  {endereco.bairro && `${endereco.bairro} · `}{endereco.localidade} – {endereco.uf}
                </p>
              </div>
            </div>
          )}

          <div style={s.fieldGroup}>
            <label style={s.label}>Complemento</label>
            <input
              style={s.input}
              placeholder="Apto, bloco, referência…"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
          </div>
        </div>

        {/* ── Rodapé ── */}
        {erro && <p style={s.erro}>{erro}</p>}

        <div style={s.footer}>
          <span style={s.total}>Total: R$ {total.toFixed(2)}</span>
          <div style={s.actions}>
            <button style={s.cancelarBtn} onClick={() => navigate('/pedidos')}>Cancelar</button>
            <button
              style={{ ...s.confirmarBtn, opacity: enviando ? 0.6 : 1 }}
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

const s = {
  page: { minHeight: '100vh', background: '#f9fafb', padding: '32px 16px' },
  container: { maxWidth: 560, margin: '0 auto' },
  back: { background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, marginBottom: 16 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardIndex: { fontWeight: 600, fontSize: 13, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', fontSize: 13, cursor: 'pointer' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#6b7280', marginBottom: 6, marginTop: 12 },
  select: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', background: '#fff' },
  input: { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, color: '#111827', background: '#fff', boxSizing: 'border-box' },
  inputErro: { borderColor: '#f87171' },
  hint: { fontSize: 12, color: '#9ca3af', marginTop: 4, display: 'block' },
  hintErro: { fontSize: 12, color: '#dc2626', marginTop: 4, display: 'block' },
  tamanhoGroup: { display: 'flex', gap: 8 },
  tamanhoBtn: { flex: 1, padding: '10px 4px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  tamanhoBtnActive: { border: '2px solid #f97316', background: '#fff7ed' },
  tamanhoLabel: { fontSize: 15, fontWeight: 700, color: '#374151' },
  tamanhoPreco: { fontSize: 11, color: '#6b7280' },
  qtdGroup: { display: 'flex', alignItems: 'center', gap: 16 },
  qtdBtn: { width: 36, height: 36, borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' },
  qtdNum: { fontSize: 18, fontWeight: 600, color: '#111827', minWidth: 24, textAlign: 'center' },
  subtotal: { textAlign: 'right', fontSize: 13, color: '#6b7280', marginTop: 12 },
  addBtn: { width: '100%', padding: 12, borderRadius: 10, border: '2px dashed #d1d5db', background: 'none', color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 24 },
  enderecoGrid: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  fieldGroup: { display: 'flex', flexDirection: 'column' },
  enderecoConfirm: { display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', marginTop: 12 },
  enderecoIcon: { fontSize: 16, color: '#16a34a', marginTop: 1 },
  enderecoRua: { margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' },
  enderecoCidade: { margin: 0, fontSize: 13, color: '#6b7280', marginTop: 2 },
  erro: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  footer: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  total: { fontSize: 18, fontWeight: 700, color: '#111827' },
  actions: { display: 'flex', gap: 10 },
  cancelarBtn: { padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  confirmarBtn: { padding: '10px 24px', borderRadius: 8, border: 'none', background: '#f97316', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};