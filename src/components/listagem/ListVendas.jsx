import Header from '../Header';
import VendaDataService from '../../services/vendaDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacao from '../modais/ModalConfirmacao';


const Vendas = () => {

    const [venda, setVenda] = useState([]);
    const [vendaRecente, setVendaRecente] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    // Adicione os states para controlar o modal de exclusão
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemParaDeletar, setItemParaDeletar] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Crie as funções para controlar o modal e a exclusão
    const handleAbrirModalConfirmacao = (venda) => {
        setItemParaDeletar(venda);
        setShowConfirmModal(true);
    };

    const handleFecharModalConfirmacao = () => {
        setItemParaDeletar(null);
        setShowConfirmModal(false);
    };

    const handleDeletarVenda = async () => {
        if (!itemParaDeletar) return;

        setDeleteLoading(true);
        try {
            await VendaDataService.remove(itemParaDeletar.id);

            // Atualiza a UI removendo o item da lista para feedback instantâneo
            setVenda(prev => prev.filter(v => v.id !== itemParaDeletar.id));

            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar venda:", error);
            // Opcional: Adicionar um alerta de erro para o usuário aqui
        } finally {
            setDeleteLoading(false);
        }
    };

    const [opcao, setOpcao] = useState('');
    const navigate = useNavigate();

    const handleInputChangeOpcao = event => {
        const { value } = event.target;
        setOpcao(value);
    }

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            VendaDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            VendaDataService.getByData()
        ]).then(([vendas, automoveis, modelos, marcas, vendasRecentes]) => {
            setVenda(vendas.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            setVendaRecente(vendasRecentes.data)
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
            clearTimeout(timeout);
        });
    }, []);


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const recordsVendas = venda.slice(firstIndex, lastIndex);
    const npageVenda = Math.ceil(venda.length / recordsPerPage);
    const numbersVenda = [...Array(npageVenda + 1).keys()].slice(1);

    const recordsVendasRecentes = vendaRecente.slice(firstIndex, lastIndex);
    const npageVendasRecentes = Math.ceil(vendaRecente.length / recordsPerPage);
    const numbersVendasRecentes = [...Array(npageVendasRecentes + 1).keys()].slice(1);


    function nextPage() {
        if (currentPage !== npageVenda) {
            setCurrentPage(currentPage + 1);
        }
    }

    function prePage() {
        if (currentPage !== 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    function changeCPage(id) {
        setCurrentPage(id)
    }

    const editarVenda = (id) => {
        navigate(`/editar-venda/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-venda/${id}`);
    }

    return (
        <>
            <Header />
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-0">Vendas</h1>
                        <p className="text-muted">Listagem e gerenciamento de vendas.</p>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Vendas</h5>
                        {/* Filtro/Dropdown vai aqui */}
                        <select name="opcao" id="opcao" className="form-select w-auto" onChange={handleInputChangeOpcao}>
                            <option value="">Padrão</option>
                            <option value="recente">Mais Recentes</option>
                        </select>
                    </div>

                    <div className="card-body">
                        {/* Sua lógica de renderização da tabela ou mensagem "Sem resultados" vai aqui dentro */}
                        {opcao === '' && (
                            venda.length > 0 ? (
                                <>
                                    {loading &&

                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Carregando...</span>
                                            </div>
                                        </div>

                                    }

                                    <table className="table mt-4">
                                        <thead>
                                            <tr>
                                                <th scope="col">ID</th>
                                                <th scope="col">Data</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">Detalhes</th>
                                                <th scope="col">Editar</th>
                                                <th scope="col">Excluir</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsVendas.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                        <td>
                                                            <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
                                                            <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                        </td>
                                                        <td className="text-dark fw-bold">{`R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-info btn-sm ms-3'
                                                                onClick={() => { verDetalhes(d.id) }}
                                                                title="Ver Detalhes"
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-warning btn-sm'
                                                                onClick={() => { editarVenda(d.id) }}
                                                                title="Editar Venda" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                        </td>

                                                        <td>
                                                            <button
                                                                className='btn btn-outline-danger btn-sm'
                                                                onClick={() => handleAbrirModalConfirmacao(d)}
                                                                title="Cancelar Venda"
                                                            >
                                                                <i className="bi bi-trash-fill"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </>
                            ) : (

                                <div className="text-center p-5">
                                    <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                    <h4 className="mt-3">Nenhuma venda encontrada</h4>
                                </div>

                            )
                        )}

                        {opcao === 'recente' && (
                            vendaRecente.length > 0 ? (
                                <>
                                    {loading &&

                                        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Carregando...</span>
                                            </div>
                                        </div>

                                    }

                                    <table className="table mt-4">
                                        <thead>
                                            <tr>
                                                <th scope="col">ID</th>
                                                <th scope="col">Data</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">-</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsVendasRecentes.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                        <td>
                                                            <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
                                                            <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                        </td>
                                                        <td className="text-dark fw-bold">{`R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-warning btn-sm'
                                                                onClick={() => { editarVenda(d.id) }}
                                                                title="Editar Venda" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                            <button
                                                                className='btn btn-outline-info btn-sm'
                                                                onClick={() => { verDetalhes(d.id) }}
                                                                title="Ver Detalhes"
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </>
                            ) : (

                                <div className="text-center p-5">
                                    <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                    <h4 className="mt-3">Nenhuma venda encontrada</h4>

                                </div>

                            )
                        )}
                    </div>

                    <div className="card-footer bg-light">
                        {/* Sua paginação vai aqui */}
                        {opcao === '' && (
                            venda.length > 0 ? (
                                <>
                                    <nav className="col-md-9 mt-3"></nav>
                                    <nav className="mt-3 col-md-3">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={prePage}>Previous</span>
                                            </li>
                                            {numbersVenda.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === npageVenda ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={nextPage}>Next</span>
                                            </li>
                                        </ul>
                                    </nav>
                                </>
                            ) : (""))
                        }

                        {opcao === 'recente' && (
                            vendaRecente.length > 0 ? (
                                <>
                                    <nav className="col-md-9 mt-3"></nav>
                                    <nav className="mt-3 col-md-3">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={prePage}>Previous</span>
                                            </li>
                                            {numbersVendasRecentes.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === npageVenda ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={nextPage}>Next</span>
                                            </li>
                                        </ul>
                                    </nav>
                                </>
                            ) : (""))
                        }
                    </div>
                </div>
            </div>

            <ModalConfirmacao
                show={showConfirmModal}
                onHide={handleFecharModalConfirmacao}
                onConfirm={handleDeletarVenda}
                loading={deleteLoading}
                titulo="Confirmar Cancelamento de Venda"
                corpo={
                    <>
                        <p>Você tem certeza que deseja cancelar a venda?</p>
                        <p > <strong>Atenção:</strong> Esta ação excluirá <strong>permanentemente</strong> o registro da venda. O automóvel associado retornará ao status de "Ativo" no estoque.</p>
                    </>
                }
            />
        </>
    );

}

export default Vendas;