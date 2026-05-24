import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import api from '../api/api';

const INPUT_BASE = {
  width: '100%',
  padding: '13px 16px',
  borderRadius: 10,
  border: '1.5px solid #2a2a2a',
  background: '#1a1a1a',
  color: '#f5f0e8',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: '"DM Sans", sans-serif',
};

function Campo({ label, tipo = 'text', valor, onChange, erro, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={styles.label}>{label}</label>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...INPUT_BASE,
          borderColor: erro ? '#ef4444' : focused ? '#f97316' : '#2a2a2a',
        }}
      />
      {erro && <span style={styles.erroInline}>{erro}</span>}
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const set = (campo) => (val) => setForm((f) => ({ ...f, [campo]: val }));

  const validar = () => {
    const e = {};
    if (!form.nome.trim() || form.nome.trim().length < 2)
      e.nome = 'Nome deve ter ao menos 2 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'E-mail inválido.';
    if (form.senha.length < 6)
      e.senha = 'Senha deve ter ao menos 6 caracteres.';
    if (form.senha !== form.confirmar)
      e.confirmar = 'As senhas não coincidem.';
    return e;
  };

  const handleSubmit = async () => {
    setErroGeral('');
    const e = validar();
    setErros(e);
    if (Object.keys(e).length > 0) return;

    setEnviando(true);
    try {
      await api.post('/usuarios/cadastro', {
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha, 
      });
      setSucesso(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Erro ao criar conta.';
      const detalhes = err.response?.data?.detalhes;
      setErroGeral(detalhes ? detalhes.join(' ') : msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #111; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pop {
          0%   { transform: scale(0.8); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }

        .cadastro-card {
          animation: fadeUp 0.5s ease both;
        }

        .submit-btn {
          transition: background 0.2s, transform 0.15s;
        }
        .submit-btn:hover:not(:disabled) {
          background: #ea6c05 !important;
          transform: translateY(-1px);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .sucesso-box {
          animation: pop 0.4s cubic-bezier(.34,1.56,.64,1) both;
        }
      `}</style>

      <div style={styles.page}>
        {/* Decoração: fatia de pizza grande no fundo */}
        <div style={styles.bgDeco} aria-hidden="true">🍕</div>

        <div style={styles.wrapper}>
          {/* Marca */}
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🔥</span>
            <span style={styles.brandName}>Pizzaria</span>
          </div>

          {sucesso ? (
            <div className="sucesso-box" style={styles.sucessoCard}>
              <div style={styles.sucessoIcone}>✓</div>
              <h2 style={styles.sucessoTitulo}>Conta criada!</h2>
              <p style={styles.sucessoSub}>Redirecionando para o login…</p>
            </div>
          ) : (
            <div className="cadastro-card" style={styles.card}>
              <div style={styles.cardHeader}>
                <h1 style={styles.titulo}>Crie sua conta</h1>
                <p style={styles.sub}>Peça suas pizzas favoritas em minutos</p>
              </div>

              {erroGeral && (
                <div style={styles.erroGeral}>
                  <span>⚠</span> {erroGeral}
                </div>
              )}

              <Campo
                label="Nome completo"
                valor={form.nome}
                onChange={set('nome')}
                erro={erros.nome}
                placeholder="João Silva"
              />
              <Campo
                label="E-mail"
                tipo="email"
                valor={form.email}
                onChange={set('email')}
                erro={erros.email}
                placeholder="joao@email.com"
              />
              <Campo
                label="Senha"
                tipo="password"
                valor={form.senha}
                onChange={set('senha')}
                erro={erros.senha}
                placeholder="Mínimo 6 caracteres"
              />
              <Campo
                label="Confirmar senha"
                tipo="password"
                valor={form.confirmar}
                onChange={set('confirmar')}
                erro={erros.confirmar}
                placeholder="Repita a senha"
              />

              <button
                className="submit-btn"
                style={{
                  ...styles.btn,
                  opacity: enviando ? 0.7 : 1,
                  cursor: enviando ? 'not-allowed' : 'pointer',
                }}
                onClick={handleSubmit}
                disabled={enviando}
              >
                {enviando ? (
                  <span style={styles.spinner} />
                ) : (
                  'Criar conta'
                )}
              </button>

              <p style={styles.loginLink}>
                Já tem conta?{' '}
                <Link to="/login" style={styles.link}>
                  Entrar
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#111111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 16px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"DM Sans", sans-serif',
  },
  bgDeco: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    fontSize: 340,
    opacity: 0.04,
    userSelect: 'none',
    pointerEvents: 'none',
    transform: 'rotate(-20deg)',
    lineHeight: 1,
  },
  wrapper: {
    width: '100%',
    maxWidth: 420,
    position: 'relative',
    zIndex: 1,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
    justifyContent: 'center',
  },
  brandIcon: {
    fontSize: 28,
  },
  brandName: {
    fontFamily: '"Playfair Display", serif',
    fontStyle: 'italic',
    fontWeight: 700,
    fontSize: 28,
    color: '#f97316',
    letterSpacing: -0.5,
  },
  card: {
    background: '#181818',
    border: '1px solid #252525',
    borderRadius: 20,
    padding: '36px 32px',
  },
  cardHeader: {
    marginBottom: 28,
  },
  titulo: {
    fontFamily: '"Playfair Display", serif',
    fontWeight: 700,
    fontSize: 26,
    color: '#f5f0e8',
    marginBottom: 6,
    lineHeight: 1.2,
  },
  sub: {
    fontSize: 14,
    color: '#6b6b6b',
    fontWeight: 400,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#9a9a9a',
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  erroInline: {
    display: 'block',
    marginTop: 5,
    fontSize: 12,
    color: '#ef4444',
  },
  erroGeral: {
    background: '#2a1414',
    border: '1px solid #5a2020',
    borderRadius: 10,
    padding: '12px 16px',
    color: '#f87171',
    fontSize: 13,
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
    marginBottom: 24,
    lineHeight: 1.5,
  },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: '#f97316',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: '"DM Sans", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    minHeight: 50,
  },
  spinner: {
    width: 18,
    height: 18,
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  loginLink: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b6b6b',
  },
  link: {
    color: '#f97316',
    textDecoration: 'none',
    fontWeight: 600,
  },
  // Tela de sucesso
  sucessoCard: {
    background: '#181818',
    border: '1px solid #252525',
    borderRadius: 20,
    padding: '52px 32px',
    textAlign: 'center',
  },
  sucessoIcone: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: '#14532d',
    color: '#4ade80',
    fontSize: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontWeight: 700,
  },
  sucessoTitulo: {
    fontFamily: '"Playfair Display", serif',
    fontSize: 24,
    color: '#f5f0e8',
    fontWeight: 700,
    marginBottom: 8,
  },
  sucessoSub: {
    color: '#6b6b6b',
    fontSize: 14,
  },
};