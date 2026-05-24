import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Pedidos.css';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verTodos, setVerTodos] = useState(false);

  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  const colunasKanban = ['PENDENTE', 'EM_PREPARO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'];

  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/pedidos', {
          params: verTodos ? { adminView: true } : {},
        });
        setPedidos(data);
      } catch (error) {
        console.error('Erro ao buscar pedidos', error);
      } finally {
        setLoading(false);
      }
    };
    carregarPedidos();
  }, [verTodos]);

  const alterarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/pedidos/${id}/status`, { status: novoStatus });
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p))
      );
    } catch (error) {
      console.error('Erro ao alterar o status do pedido', error);
      alert('Não foi possível alterar o status. Tente novamente.');
    }
  };

  const cancelar = (id) => alterarStatus(id, 'CANCELADO');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBadgeClass = (status) => {
    const map = {
      PENDENTE: 'badge-pendente',
      EM_PREPARO: 'badge-preparo',
      SAIU_PARA_ENTREGA: 'badge-saiu-entrega',
      ENTREGUE: 'badge-entregue',
      CANCELADO: 'badge-cancelado',
    };
    return map[status] ?? 'badge-padrao';
  };

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const formatarStatusNome = (status) => status.replace(/_/g, ' ');

  // ✅ Formata endereço completo a partir dos campos retornados pela API
  const formatarEndereco = (p) => {
    if (!p.rua) return null;
    const partes = [p.rua];
    if (p.numero) partes.push(p.numero);
    if (p.complemento) partes.push(p.complemento);
    partes.push(`${p.bairro} · ${p.cidade} – ${p.estado}`);
    return partes.join(', ');
  };

  return (
    <div className="pedidos-container">
      <div className={`pedidos-content ${verTodos ? 'conteudo-largo' : ''}`}>

        <header className="pedidos-header">
          <div>
            {usuario && (
              <span className="saudacao">Olá, {usuario.nome || usuario.email}</span>
            )}
            <h1 className="pedidos-titulo">
              {verTodos ? 'Gestão de Pedidos (Kanban)' : 'Meus Pedidos'}
            </h1>
          </div>

          <div className="header-acoes">
            {usuario?.admin && (
              <button onClick={() => setVerTodos((prev) => !prev)} className="btn-admin">
                {verTodos ? 'Ver meus pedidos' : 'Ver todos os pedidos'}
              </button>
            )}
            <Link to="/pedidos/novo" className="btn-novo-pedido">+ Novo Pedido</Link>
            <button onClick={handleLogout} className="btn-logout">Sair</button>
          </div>
        </header>

        {loading ? (
          <div className="mensagem-estado"><p>Carregando pedidos...</p></div>
        ) : pedidos.length === 0 ? (
          <div className="mensagem-estado empty-state">
            <h3>Nenhum pedido encontrado</h3>
            <p>{verTodos ? 'Não há pedidos registrados no sistema.' : 'Você ainda não realizou nenhuma compra.'}</p>
            {!verTodos && (
              <Link to="/pedidos/novo" className="link-destaque">Fazer meu primeiro pedido →</Link>
            )}
          </div>
        ) : verTodos ? (
          /* ── VISÃO ADMIN: KANBAN ── */
          <div className="kanban-board">
            {colunasKanban.map((statusColuna) => (
              <div key={statusColuna} className="kanban-coluna">
                <h3 className={`kanban-titulo-coluna badge-${statusColuna.toLowerCase().replace(/_/g, '')}`}>
                  {formatarStatusNome(statusColuna)}
                </h3>
                <div className="kanban-cards">
                  {pedidos
                    .filter((p) => p.status === statusColuna)
                    .map((p) => (
                      <div key={p.id} className="kanban-card">
                        <div className="kanban-card-header">
                          <span className="kanban-id">#{p.id}</span>
                          <span className="kanban-preco">{formatarMoeda(p.preco)}</span>
                        </div>

                        <div className="kanban-cliente">
                          <strong>Cliente:</strong>{' '}
                          {p.usuario?.nome || p.usuario?.email || 'Desconhecido'}
                        </div>

                        {/* ✅ Endereço no card do Kanban */}
                        {formatarEndereco(p) && (
                          <div className="kanban-endereco">
                            <span className="kanban-endereco-icon">📍</span>
                            <span>{formatarEndereco(p)}</span>
                          </div>
                        )}

                        <div className="kanban-acao">
                          <label htmlFor={`status-${p.id}`}>Status:</label>
                          <select
                            id={`status-${p.id}`}
                            value={p.status}
                            onChange={(e) => alterarStatus(p.id, e.target.value)}
                            className={`select-status select-${p.status.toLowerCase()}`}
                          >
                            <option value="PENDENTE">Pendente</option>
                            <option value="EM_PREPARO">Em Preparo</option>
                            <option value="SAIU_PARA_ENTREGA">Saiu para Entrega</option>
                            <option value="ENTREGUE">Entregue</option>
                            <option value="CANCELADO">Cancelado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── VISÃO CLIENTE: LISTA ── */
          <div className="pedidos-lista">
            {pedidos.map((p) => (
              <div key={p.id} className="pedido-card">
                <div className="pedido-info">
                  <h2>Pedido #{p.id}</h2>
                  <p className="pedido-preco">{formatarMoeda(p.preco)}</p>
                  {/* ✅ Endereço no card do cliente */}
                  {formatarEndereco(p) && (
                    <p className="pedido-endereco">📍 {formatarEndereco(p)}</p>
                  )}
                </div>

                <div className="pedido-acoes">
                  <span className={`badge ${getBadgeClass(p.status)}`}>
                    {formatarStatusNome(p.status)}
                  </span>
                  {p.status === 'PENDENTE' && (
                    <button onClick={() => cancelar(p.id)} className="btn-cancelar">
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