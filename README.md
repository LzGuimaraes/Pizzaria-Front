# Pizzaria Frontend - Aplicação Web

Aplicação web desenvolvida com **React 19**, **Vite** e **React Router** para permitir que usuários façam pedidos de pizzas e admins gerenciem esses pedidos de forma interativa com um painel Kanban.

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Páginas da Aplicação](#páginas-da-aplicação)
- [Contexts e State Management](#contexts-e-state-management)
- [Integração com Backend](#integração-com-backend)
- [Executando a Aplicação](#executando-a-aplicação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## 🏗️ Arquitetura

O frontend segue a arquitetura **componentes baseados em React** com divisão clara entre:

```
pizzaria-front/
├── src/
│   ├── main.jsx                    # Ponto de entrada (rotas e providers)
│   ├── context/
│   │   ├── AuthContext.jsx         # Contexto de autenticação
│   │   └── PedidoContext.jsx       # Contexto de pedidos (Admin)
│   ├── pages/
│   │   ├── Login.jsx               # Página de login
│   │   ├── Cadastro.jsx            # Página de registro
│   │   ├── Pedidos.jsx             # Listagem de pedidos (cliente/admin)
│   │   └── NovoPedido.jsx          # Criação de novo pedido
│   ├── components/
│   │   ├── PrivateRoute.jsx        # Componente de rota protegida
│   │   └── PedidoCard.jsx          # Card de pedido
│   └── api/
│       └── api.js                  # Cliente Axios configurado
├── vite.config.js                  # Configuração do Vite
└── package.json
```

### Arquitetura em Camadas

1. **Pages**: Páginas completas da aplicação
2. **Components**: Componentes reutilizáveis
3. **Context**: Gerenciamento de estado global (Auth e Pedidos)
4. **API**: Camada de requisições HTTP com Axios

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Descrição |
|---|---|---|
| **React** | 19.2.6 | Biblioteca de UI |
| **React DOM** | 19.2.6 | Renderização no DOM |
| **React Router** | 7.15.1 | Roteamento SPA |
| **Vite** | 8.0.12 | Build tool e dev server |
| **Axios** | 1.16.1 | Cliente HTTP |
| **ESLint** | 10.3.0 | Linter para JavaScript |

---

## 📦 Pré-requisitos

- **Node.js** (v18+)
- **npm** ou **yarn**
- **Backend rodando** em `http://localhost:3000` (veja README do backend)

---

## 🚀 Instalação

1. **Clone o repositório**:
```bash
cd pizzaria-front
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Verificar configuração do backend**:
   - O arquivo `src/api/api.js` está configurado para `http://localhost:3000`
   - Certifique-se de que o backend está rodando nessa porta

---

## 📂 Estrutura do Projeto

### 📄 `src/main.jsx`
Arquivo principal que configura:
- **BrowserRouter**: Roteamento da SPA
- **AuthProvider**: Contexto de autenticação
- **Routes**: Definição de rotas da aplicação

```jsx
<BrowserRouter>
  <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/pedidos" element={<PrivateRoute><Pedidos /></PrivateRoute>} />
      <Route path="/pedidos/novo" element={<PrivateRoute><NovoPedido /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/pedidos" />} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

---

## 🔐 Fluxo de Autenticação

### 1. Login (AuthContext.jsx)

```javascript
const login = async (email, senha) => {
  const { data } = await api.post('/usuarios/login', { email, senha });
  localStorage.setItem('token', data.token);           // Armazena token
  localStorage.setItem('usuario', JSON.stringify(data.usuario)); // Armazena dados do usuário
  setUsuario(data.usuario);                            // Atualiza state
};
```

**Fluxo:**
1. Usuário preenche email e senha
2. Backend valida credenciais
3. Backend retorna JWT token + dados do usuário
4. Frontend armazena token e dados no localStorage
5. Context atualiza o estado global

### 2. Token nos Headers (api.js)

Antes de cada requisição, o Axios injeta automaticamente o token:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Validação de Token (api.js)

Se o servidor retornar 401 (token expirado/inválido):

```javascript
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';  // Redireciona para login
    }
    return Promise.reject(err);
  }
);
```

### 4. PrivateRoute - Rotas Protegidas

Componente que valida se o usuário está autenticado:

```javascript
export default function PrivateRoute({ children }) {
  const { usuario } = useAuth();
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

---

## 📄 Páginas da Aplicação

### 🔑 Login (`Login.jsx`)

**Função**: Autenticar usuário

**Fluxo**:
1. Usuário preenche email e senha
2. Clica em "Entrar"
3. AuthContext executa `login(email, senha)`
4. Se bem-sucedido: redireciona para `/pedidos`
5. Se falhar: exibe erro "E-mail ou senha inválidos"

**Design**:
- Dark mode com tema laranja (#f97316)
- Animação fade-up ao carregar
- Validação ao enviar
- Link para criação de conta

---

### 📝 Cadastro (`Cadastro.jsx`)

**Função**: Registrar novo usuário

**Validações**:
- Nome: mínimo 2 caracteres
- Email: formato válido
- Senha: mínimo 6 caracteres
- Confirmar senha: deve coincidir

**Fluxo**:
1. Usuário preenche formulário
2. Frontend valida dados
3. Envia POST para `/usuarios/cadastro`
4. Se bem-sucedido: exibe mensagem de sucesso por 2 segundos
5. Redireciona automaticamente para `/login`

---

### 🍕 Pedidos (`Pedidos.jsx`)

**Função**: Listar e gerenciar pedidos

**Duas visões**:

#### Visão Cliente (Usuário comum)
- Lista todos os seus pedidos
- Status de cada pedido com badges coloridas
- Botão "Cancelar" para pedidos com status "PENDENTE"
- Exibe endereço de entrega formatado
- Botão "Novo Pedido" para fazer outro pedido
- Botão "Sair" para logout

#### Visão Admin (Kanban Board)
- Acesso via botão "Ver todos os pedidos"
- Quadro Kanban com 5 colunas de status:
  - **PENDENTE**: Pedidos novos aguardando processamento
  - **EM_PREPARO**: Pizzas sendo preparadas
  - **SAIU_PARA_ENTREGA**: Pedido saiu com entregador
  - **ENTREGUE**: Pedido entregue com sucesso
  - **CANCELADO**: Pedido cancelado

**Cada card no Kanban mostra**:
- ID do pedido
- Preço total
- Nome do cliente
- Endereço completo
- Dropdown para mudar status em tempo real

**Estilos de Status**:
```css
PENDENTE: Laranja (#f97316)
EM_PREPARO: Azul
SAIU_PARA_ENTREGA: Roxo
ENTREGUE: Verde
CANCELADO: Vermelho
```

---

### ➕ Novo Pedido (`NovoPedido.jsx`)

**Função**: Criar novo pedido com múltiplos itens e endereço

**Seções**:

#### 🍕 Seleção de Pizzas
Para cada item do pedido:

1. **Sabor**: Dropdown com opções
   - Margherita
   - Calabresa
   - Frango
   - Portuguesa
   - Quatro Queijos

2. **Tamanho**: Botões com preço
   - P (Pequena): R$ 29,90
   - M (Média): R$ 39,90
   - G (Grande): R$ 49,90

3. **Quantidade**: Controle de quantidade (+ / -)

4. **Subtotal**: Cálculo automático (quantidade × preço unitário)

**Ações**:
- Adicionar outra pizza
- Remover pizza (se houver mais de uma)

#### 📍 Endereço de Entrega

1. **CEP**: 
   - Mascara automática (00000-000)
   - Busca em tempo real na ViaCEP
   - Valida se existe

2. **Número**: Campo obrigatório para endereço

3. **Complemento**: Campo opcional (apto, bloco, etc)

4. **Auto-preenchimento**:
   - Quando CEP é válido, busca rua, bairro, cidade, estado automaticamente
   - Exibe confirmação com ✓ verde

#### 💰 Rodapé
- Total do pedido em destaque
- Botão "Cancelar" (volta para `/pedidos`)
- Botão "Confirmar Pedido" (envia POST para `/pedidos`)

**Validações**:
- CEP obrigatório e válido
- Endereço deve ser encontrado na ViaCEP
- Mínimo 1 item no pedido

---

## 🎯 Contexts e State Management

### AuthContext.jsx

**Estado global de autenticação**:

```javascript
const [usuario, setUsuario] = useState(
  JSON.parse(localStorage.getItem('usuario') || 'null')
);
```

**Métodos fornecidos**:

| Método | Descrição |
|---|---|
| `login(email, senha)` | Autentica usuário |
| `logout()` | Limpa dados e faz logout |

**Hook de uso**:
```javascript
const { usuario, login, logout } = useAuth();
```

**Dados do usuário**:
```javascript
{
  id: number,
  nome: string,
  email: string,
  admin: boolean  // true se é administrador
}
```

---

### PedidoContext.jsx (Admin)

**Estado global para gerenciamento de pedidos**:

```javascript
const [board, setBoard] = useState({
  PENDENTE: [],
  EM_PREPARO: [],
  SAIU_PARA_ENTREGA: [],
  ENTREGUE: []
});
```

**Métodos fornecidos**:

| Método | Descrição |
|---|---|
| `carregarPedidos()` | Busca todos os pedidos (GET `/admin/pedidos`) |
| `atualizarStatus(id, novoStatus)` | Muda status do pedido (PATCH `/admin/pedidos/{id}/status`) |

**Hook de uso**:
```javascript
const { board, carregarPedidos, atualizarStatus } = usePedidos();
```

**Dados de um pedido**:
```javascript
{
  id: number,
  status: 'PENDENTE' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO',
  preco: number,
  usuario: { id, nome, email },
  rua: string,
  bairro: string,
  cidade: string,
  estado: string,
  cep: string,
  numero: string,
  complemento: string,
  itens: [{
    id: number,
    quantidade: number,
    sabor: string,
    tamanho: string,
    precoUnitario: number
  }]
}
```

---

## 🔌 Integração com Backend

### Cliente Axios (`api/api.js`)

O arquivo `api.js` configura um cliente Axios reutilizável:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000'  // URL do backend
});
```

**Features**:
- Injeção automática de token JWT nos headers
- Interceptor de resposta que redireciona para login se token expirar
- Reutilização em toda a aplicação

**Uso em componentes**:
```javascript
import api from '../api/api';

// GET
const { data } = await api.get('/pedidos');

// POST
await api.post('/pedidos', { itens, cep, numero, complemento });

// PATCH
await api.patch('/pedidos/:id/status', { status: 'ENTREGUE' });
```

---

## ▶️ Executando a Aplicação

### Modo Desenvolvimento

```bash
npm run dev
```

- Inicia servidor de desenvolvimento em `http://localhost:5173`
- Hot Module Replacement (HMR) ativado
- Auto-reload ao salvar arquivos

### Build para Produção

```bash
npm run build
```

- Cria bundle otimizado em `/dist`
- Minificação de assets
- Pronto para deploy

### Preview de Build

```bash
npm run preview
```

- Simula a versão produção localmente

### Lint

```bash
npm run lint
```

- Verifica código com ESLint
- Identifica erros e más práticas

---

## 🔧 Variáveis de Ambiente

O frontend não precisa de arquivo `.env` (a URL do backend está hardcoded em `src/api/api.js`).

Se desejar tornar configurável:

1. Criar arquivo `.env`:
```env
VITE_API_URL=http://localhost:3000
```

2. Usar em `api.js`:
```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});
```

---

## 🎨 Estilo e Design

### Temas

**Login e Cadastro**:
- Fundo: #111 (preto profundo)
- Primária: #f97316 (laranja)
- Texto: #f5f0e8 (off-white)

**Novo Pedido**:
- Fundo: #f9fafb (cinza claro)
- Cards: #fff (branco)
- Primária: #f97316 (laranja)

**Pedidos (Listagem)**:
- Layout responsivo
- Kanban para desktop
- Adaptável para mobile

### Fontes

- **DM Sans**: Fonte padrão (sans-serif)
- **Playfair Display**: Títulos elegantes (serif)

---

## 📱 Responsividade

A aplicação é otimizada para:
- **Desktop**: Kanban completo, layout em colunas
- **Tablet**: Adaptações de layout
- **Mobile**: Ajustes de padding e font-size

---

## 🚨 Tratamento de Erros

**Try-catch em requisições**:
```javascript
try {
  await api.post('/pedidos', dados);
} catch (err) {
  const mensagem = err.response?.data?.error ?? 'Erro ao criar pedido.';
  setErro(mensagem);
}
```

**Exibição ao usuário**:
- Mensagens de erro inline nos formulários
- Alerts para ações críticas
- Status loading durante requisições

---

## 🔄 Fluxo Completo (Usuário Novo)

```
1. Acessa http://localhost:5173
   ↓
2. Redireciona para /login (sem autenticação)
   ↓
3. Clica em "Criar conta"
   ↓
4. Preenche formulário de cadastro
   ↓
5. Backend cria usuário
   ↓
6. Exibe "Conta criada!" por 2 segundos
   ↓
7. Redireciona para /login
   ↓
8. Faz login com email/senha
   ↓
9. Frontend armazena token + usuário no localStorage
   ↓
10. Redireciona para /pedidos (PrivateRoute liberado)
    ↓
11. Vê seus pedidos (vazio no início)
    ↓
12. Clica em "+ Novo Pedido"
    ↓
13. Seleciona pizzas, tamanhos, quantidades
    ↓
14. Preenche CEP (busca automática)
    ↓
15. Número e complemento do endereço
    ↓
16. Clica "Confirmar Pedido"
    ↓
17. Backend cria pedido com itens
    ↓
18. Volta para /pedidos
    ↓
19. Vê seu novo pedido com status "PENDENTE"
    ↓
20. Pode cancelar enquanto estiver PENDENTE
    ↓
21. Admin visualiza no Kanban e muda status
    ↓
22. Cliente vê atualizações em tempo real (recarregando página)
```

---

## 📚 Recursos Adicionais

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
- [ViaCEP API](https://viacep.com.br)

---

## 🤝 Contribuindo

Para contribuir:
1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Push para a branch
4. Abra um Pull Request

---

## 📧 Contato

Dúvidas sobre a aplicação? Verifique a documentação ou entre em contato com o time de desenvolvimento.
