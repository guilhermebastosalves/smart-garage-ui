import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Venda from './components/cadastro/Venda'
import Gastos from './components/Gastos'
import Troca from './components/cadastro/Troca'
import Relatorios from './components/Relatorios'
import Estoque from './components/Estoque'
import Automovel from './components/cadastro/Automovel'
import Detalhes from './components/Detalhes'
import Compra from './components/cadastro/Compra';
import Consignacao from './components/cadastro/Consignacao'
import EditarAutomovel from './components/editar/EditarAutomovel';
import EditarConsignacao from './components/editar/EditarConsignacao';
import EditarCompra from './components/editar/EditarCompra'
import Historico from './components/cadastro/Historico'
import Cliente from './components/cadastro/Cliente'
import ListCompras from './components/listagem/ListCompras';
import ListConsignacao from './components/listagem/ListConsignacao';
import ListTrocas from './components/listagem/ListTrocas';
import ListVendas from './components/listagem/ListVendas';
import ListGastos from "./components/listagem/ListGastos";

function App() {

  return (
    <>
      <div className='App'>
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<Home />}></Route>
            <Route path="/venda" element={<Venda />}></Route>
            <Route path="/gastos" element={<Gastos />}></Route>
            <Route path="/troca" element={<Troca />}></Route>
            <Route path="/relatorios" element={<Relatorios />}></Route>
            <Route path="/estoque" element={<Estoque />}></Route>
            <Route path="/cadastro/automoveis" element={<Automovel />}></Route>
            <Route path="/detalhes/:id" element={<Detalhes />}></Route>
            <Route path="/compra" element={<Compra />}></Route>
            <Route path='/consignacao' element={<Consignacao />}></Route>
            <Route path='/editar-automovel/:id' element={<EditarAutomovel />}></Route>
            <Route path='/editar-consignacao/:id' element={<EditarConsignacao />}></Route>
            <Route path='/editar-compra/:id' element={<EditarCompra />}></Route>
            <Route path='/historico' element={<Historico />}></Route>
            <Route path='/cliente' element={<Cliente />}></Route>
            <Route path='/listagem/compras' element={<ListCompras />}></Route>
            <Route path='/listagem/consignacoes' element={<ListConsignacao />}></Route>
            <Route path='/listagem/trocas' element={<ListTrocas />}></Route>
            <Route path='/listagem/vendas' element={<ListVendas />}></Route>
            <Route path='/listagem/gastos' element={<ListGastos />}></Route>
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
