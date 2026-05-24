import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Pedidos.css';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Extraímos o logout e também os dados do usuario do seu AuthContext
  const { logout, usuario } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/pedidos')
      .then(({ data }) => {
        setPedidos(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar pedidos", error);
        setLoading(false);
      });
  }, []);

  const cancelar = async (id) => {
    try {
      await api.patch(`/pedidos/${id}/status`, { status: 'CANCELADO' });
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'CANCELADO' } : p))
      );
    } catch (error) {
      console.error("Erro ao cancelar o pedido", error);
      alert("Não foi possível cancelar o pedido. Tente novamente.");
    }
  };

  const handleLogout = () => {
    logout(); // Limpa o localStorage e o estado do usuário via AuthContext
    navigate('/login'); // Redireciona para a tela de login
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'PENDENTE': return 'badge-pendente';
      case 'CANCELADO': return 'badge-cancelado';
      case 'CONCLUIDO': return 'badge-concluido';
      default: return 'badge-padrao';
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="pedidos-container">
      <div className="pedidos-content">
        
        <header className="pedidos-header">
          <div>
            {/* Saudação amigável aproveitando o objeto de usuário do contexto */}
            {usuario && (
              <span className="saudacao">Olá, {usuario.nome || usuario.email}</span>
            )}
            <h1 className="pedidos-titulo">Meus Pedidos</h1>
          </div>
          
          <div className="header-acoes">
            <Link to="/pedidos/novo" className="btn-novo-pedido">
              + Novo Pedido
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        </header>

        {loading ? (
          <div className="mensagem-estado">
            <p>Carregando seus pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="mensagem-estado empty-state">
            <h3>Nenhum pedido encontrado</h3>
            <p>Você ainda não realizou nenhuma compra.</p>
            <Link to="/pedidos/novo" className="link-destaque">
              Fazer meu primeiro pedido &rarr;
            </Link>
          </div>
        ) : (
          <div className="pedidos-lista">
            {pedidos.map((p) => (
              <div key={p.id} className="pedido-card">
                
                <div className="pedido-info">
                  <h2>Pedido #{p.id}</h2>
                  <p className="pedido-preco">{formatarMoeda(p.preco)}</p>
                </div>

                <div className="pedido-acoes">
                  <span className={`badge ${getBadgeClass(p.status)}`}>
                    {p.status}
                  </span>
                  
                  {p.status === 'PENDENTE' && (
                    <button 
                      onClick={() => cancelar(p.id)}
                      className="btn-cancelar"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}