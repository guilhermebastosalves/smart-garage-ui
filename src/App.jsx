import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './components/Login'
import Home from './components/Home'
import Venda from './components/cadastro/Venda'
import Gasto from './components/cadastro/Gasto'
import Manutencao from './components/cadastro/Manutencao';
import Troca from './components/cadastro/Troca'
import Relatorios from './components/Relatorios'
import Estoque from './components/Estoque'
import Automovel from './components/cadastro/Automovel'
import Detalhes from './components/Detalhes'
import DetalhesConsignacao from './components/detalhes/DetalhesConsignacao'
import DetalhesCompra from './components/detalhes/DetalhesCompra'
import DetalhesTroca from './components/detalhes/DetalhesTroca'
import DetalhesVenda from './components/detalhes/DetalhesVenda'
import DetalhesGasto from './components/detalhes/DetalhesGasto'
import DetalhesManutencao from './components/detalhes/DetalhesManutencao'
import Compra from './components/cadastro/Compra';
import Consignacao from './components/cadastro/Consignacao'
import EditarAutomovel from './components/editar/EditarAutomovel';
import EditarConsignacao from './components/editar/EditarConsignacao';
import EditarCompra from './components/editar/EditarCompra'
import EditarTroca from './components/editar/EditarTroca'
import EditarVenda from './components/editar/EditarVenda'
import EditarGasto from './components/editar/EditarGasto'
import EditarManutencao from './components/editar/EditarManutencao'
import Historico from './components/cadastro/Historico'
import Cliente from './components/cadastro/Cliente'
import ListCompras from './components/listagem/ListCompras';
import ListConsignacao from './components/listagem/ListConsignacao';
import ListTrocas from './components/listagem/ListTrocas';
import ListVendas from './components/listagem/ListVendas';
import ListGastos from "./components/listagem/ListGastos";
import ListManutencoes from "./components/listagem/ListManutencoes";
import ProtectedRoute from './components/RotaProtegida'; // Importe a rota protegida
import AcessoNegado from './components/AcessoNegado';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importe o CSS

function App() {

  const location = useLocation();

  useEffect(() => {
    // Esta função será executada toda vez que a URL (location) mudar

    // Remove a classe que os modais do Bootstrap adicionam
    document.body.classList.remove('modal-open');

    // Garante que o estilo de overflow seja restaurado para o padrão
    document.body.style.overflow = 'auto';

    // NOVO: Remove o padding de compensação da barra de rolagem
    document.body.style.paddingRight = ''; // Define como string vazia para remover o estilo inline

  }, [location]); // A "lista de dependências" garante que o efeito rode a cada navegação


  return (
    <>
      <div className='App'>
        <Routes>
          <Route path="/" element={<Login />}></Route>

          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/venda" element={<Venda />}></Route>
            <Route path="/troca" element={<Troca />}></Route>
            <Route path="/estoque" element={<Estoque />}></Route>
            <Route path="/cadastro/automoveis" element={<Automovel />}></Route>
            <Route path="/detalhes/:id" element={<Detalhes />}></Route>
            <Route path="/detalhes-consignacao/:id" element={<DetalhesConsignacao />}></Route>
            <Route path="/detalhes-compra/:id" element={<DetalhesCompra />}></Route>
            <Route path="/detalhes-troca/:id" element={<DetalhesTroca />}></Route>
            <Route path="/detalhes-venda/:id" element={<DetalhesVenda />}></Route>
            <Route path="/compra" element={<Compra />}></Route>
            <Route path='/consignacao' element={<Consignacao />}></Route>
            <Route path='/editar-automovel/:id' element={<EditarAutomovel />}></Route>
            <Route path='/editar-consignacao/:id' element={<EditarConsignacao />}></Route>
            <Route path='/editar-compra/:id' element={<EditarCompra />}></Route>
            <Route path='/editar-troca/:id' element={<EditarTroca />}></Route>
            <Route path='/editar-venda/:id' element={<EditarVenda />}></Route>
            <Route path='/historico' element={<Historico />}></Route>
            <Route path='/cliente' element={<Cliente />}></Route>
            <Route path='/listagem/compras' element={<ListCompras />}></Route>
            <Route path='/listagem/consignacoes' element={<ListConsignacao />}></Route>
            <Route path='/listagem/trocas' element={<ListTrocas />}></Route>
            <Route path='/listagem/vendas' element={<ListVendas />}></Route>
            <Route path="/acesso-negado" element={<AcessoNegado />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['gerente']} />}>
            <Route path="/relatorios" element={<Relatorios />}></Route>
            <Route path="/manutencao" element={<Manutencao />}></Route>
            <Route path="/gastos" element={<Gasto />}></Route>
            <Route path="/detalhes-gasto/:id" element={<DetalhesGasto />}></Route>
            <Route path="/detalhes-manutencao/:id" element={<DetalhesManutencao />}></Route>
            <Route path='/editar-gasto/:id' element={<EditarGasto />}></Route>
            <Route path='/editar-manutencao/:id' element={<EditarManutencao />}></Route>
            <Route path='/listagem/gastos' element={<ListGastos />}></Route>
            <Route path='/listagem/manutencoes' element={<ListManutencoes />}></Route>
          </Route>

        </Routes>


        {/* <ToastContainer
          position="top-right"
          autoClose={5000} // Fecha após 5 segundos
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        /> */}
      </div >
    </>
  )
}

export default App
