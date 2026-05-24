import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

function Campo({ label, tipo = 'text', valor, onChange, placeholder }) {
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
          borderColor: focused ? '#f97316' : '#2a2a2a',
        }}
      />
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const set = (campo) => (val) => setForm((f) => ({ ...f, [campo]: val }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await login(form.email, form.senha);
      navigate('/pedidos');
    } catch {
      setErro('E-mail ou senha inválidos.');
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-card { animation: fadeUp 0.5s ease both; }
        .submit-btn { transition: background 0.2s, transform 0.15s; }
        .submit-btn:hover:not(:disabled) { background: #ea6c05 !important; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={styles.page}>
        <div style={styles.bgDeco} aria-hidden="true">🍕</div>

        <div style={styles.wrapper}>
          <div style={styles.brand}>
            <span style={{ fontSize: 28 }}>🔥</span>
            <span style={styles.brandName}>Pizzaria</span>
          </div>

          <div className="login-card" style={styles.card}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={styles.titulo}>Bem-vindo de volta</h1>
              <p style={styles.sub}>Entre para ver seus pedidos</p>
            </div>

            {erro && (
              <div style={styles.erroGeral}>
                <span>⚠</span> {erro}
              </div>
            )}

            <Campo
              label="E-mail"
              tipo="email"
              valor={form.email}
              onChange={set('email')}
              placeholder="joao@email.com"
            />
            <Campo
              label="Senha"
              tipo="password"
              valor={form.senha}
              onChange={set('senha')}
              placeholder="Sua senha"
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
              {enviando ? <span style={styles.spinner} /> : 'Entrar'}
            </button>

            <p style={styles.cadastroLink}>
              Não tem conta?{' '}
              <Link to="/cadastro" style={styles.link}>
                Criar conta
              </Link>
            </p>
          </div>
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
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#9a9a9a',
    marginBottom: 7,
    letterSpacing: 0.2,
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
    alignItems: 'center',
    marginBottom: 24,
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
  cadastroLink: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b6b6b',
  },
  link: {
    color: '#f97316',
    textDecoration: 'none',
    fontWeight: 600,
  },
};