import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/api';

const PedidoContext = createContext();

const STATUS = [
  'PENDENTE',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE'
];

export function PedidoProvider({ children }) {
  const [board, setBoard] = useState({
    PENDENTE: [],
    EM_PREPARO: [],
    SAIU_PARA_ENTREGA: [],
    ENTREGUE: []
  });

  const carregarPedidos = async () => {
    const { data } = await api.get('/admin/pedidos');

    const agrupado = {
      PENDENTE: [],
      EM_PREPARO: [],
      SAIU_PARA_ENTREGA: [],
      ENTREGUE: []
    };

    data.forEach(pedido => {
      if (agrupado[pedido.status]) {
        agrupado[pedido.status].push(pedido);
      }
    });

    setBoard(agrupado);
  };

  const atualizarStatus = async (id, novoStatus) => {
    await api.patch(`/admin/pedidos/${id}/status`, {
      status: novoStatus
    });

    setBoard(prev => {
      const novoBoard = { ...prev };

      // remove do status antigo
      for (const status in novoBoard) {
        novoBoard[status] = novoBoard[status].filter(p => p.id !== id);
      }

      // adiciona no novo status
      const pedido = Object.values(prev)
        .flat()
        .find(p => p.id === id);

      if (pedido) {
        pedido.status = novoStatus;
        novoBoard[novoStatus].push(pedido);
      }

      return novoBoard;
    });
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  return (
    <PedidoContext.Provider value={{ board, carregarPedidos, atualizarStatus }}>
      {children}
    </PedidoContext.Provider>
  );
}

export const usePedidos = () => useContext(PedidoContext);