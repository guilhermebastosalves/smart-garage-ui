import Header from '../Header';
import CompraDataService from '../../services/compraDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ModalCompra from '../modais/ModalCompra';
// import ModalConfirmacao from '../modais/ModalConfirmacao';
import ModalVerificarAutomovel from '../modais/ModalVerificarAutomovel';

const Compras = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const compraLocalStorage = { negocio: "Compra" };
    // const [showModal, setShowModal] = useState(false);

    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showAutomovelModal, setShowAutomovelModal] = useState(false);
    const [clienteSelecionadoId, setClienteSelecionadoId] = useState(null);

    useEffect(() => {
        // Pega os dados enviados pela página de cadastro de cliente
        const { startAutomovelCheck, clienteId } = location.state || {};

        // Se o sinal para iniciar a verificação do automóvel foi recebido...
        if (startAutomovelCheck && clienteId) {
            // ...guarda o ID do cliente que acabámos de criar...
            setClienteSelecionadoId(clienteId);

            // ...e abre o modal de verificação do automóvel para continuar o fluxo.
            setShowAutomovelModal(true);

            // Limpa o estado da navegação para evitar que o modal reabra se a página for atualizada
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [todasCompras, setTodasCompras] = useState([]);

    const handleNovaCompraClick = () => {
        sessionStorage.setItem("NegocioAtual", JSON.stringify({ negocio: "Compra" }));
        setShowClienteModal(true);
    };

    // Etapa 1: Chamado quando o cliente é encontrado ou selecionado no primeiro modal
    const handleClienteVerificado = (clienteId) => {
        setClienteSelecionadoId(clienteId); // Guarda o ID do cliente
        setShowClienteModal(false);         // Fecha o modal de cliente
        setShowAutomovelModal(true);        // Abre o modal de automóvel
    };

    // Etapa 2: Chamado quando o automóvel é verificado no segundo modal
    const handleAutomovelVerificado = (resultado) => {
        setShowAutomovelModal(false); // Fecha o modal de automóvel

        const statePayload = {
            clienteId: clienteSelecionadoId // Passa o ID do cliente da primeira etapa
        };

        if (resultado.status === 'inativo') {
            statePayload.automovelExistente = resultado.automovel; // Passa os dados do carro para reativação
        }

        // Navega para o formulário final com todos os dados necessários
        navigate('/compra', { state: statePayload });
    };

    // const [showConfirmModal, setShowConfirmModal] = useState(false);
    // const [itemParaDeletar, setItemParaDeletar] = useState(null);
    // const [deleteLoading, setDeleteLoading] = useState(false);


    // const handleAbrirModalConfirmacao = (compra) => {
    //     setItemParaDeletar(compra);
    //     setShowConfirmModal(true);
    // };

    // const handleFecharModalConfirmacao = () => {
    //     setItemParaDeletar(null);
    //     setShowConfirmModal(false);
    // };

    // const handleDeletarCompra = async () => {
    //     if (!itemParaDeletar) return;

    //     setDeleteLoading(true);
    //     try {
    //         await CompraDataService.remove(itemParaDeletar.id);

    //         setTodasCompras(prev => prev.filter(c => c.id !== itemParaDeletar.id));

    //         handleFecharModalConfirmacao();
    //     } catch (error) {
    //         console.error("Erro ao deletar compra:", error);
    //     } finally {
    //         setDeleteLoading(false);
    //     }
    // };

    const [periodo, setPeriodo] = useState('todos');

    const handleInputChangePeriodo = event => {
        const { value } = event.target;
        setPeriodo(value);
    }

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000);
        Promise.all([
            CompraDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([compras, automoveis, modelos, marcas]) => {
            setTodasCompras(compras.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false);
        }).finally(() => {
            setLoading(false);
            clearTimeout(timeout);
        });
    }, []);


    const listaAtual = useMemo(() => {

        let dataFiltro = null;

        if (periodo !== 'todos') {
            const hoje = new Date();
            const dataAlvo = new Date();

            if (periodo === 'ultimo_mes') dataAlvo.setMonth(hoje.getMonth() - 1);
            if (periodo === 'ultimos_3_meses') dataAlvo.setMonth(hoje.getMonth() - 3);
            if (periodo === 'ultimo_semestre') dataAlvo.setMonth(hoje.getMonth() - 6);

            dataFiltro = new Date(Date.UTC(
                dataAlvo.getFullYear(),
                dataAlvo.getMonth(),
                dataAlvo.getDate()
            ));

        }

        return todasCompras
            .filter(item => {
                if (!dataFiltro) return true;
                return new Date(item.data) >= dataFiltro;
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));

    }, [periodo, todasCompras]);

    useEffect(() => {
        setCurrentPage(1);
    }, [periodo]);


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const records = listaAtual.slice(firstIndex, lastIndex);
    const npage = Math.ceil(listaAtual.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < npage) setCurrentPage(currentPage + 1); };

    const editarCompra = (id) => {
        navigate(`/editar-compra/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-compra/${id}`);
    }


    return (
        <>
            <Header />

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                    <div>
                        <h1 className="mb-0">Compras</h1>
                        <p className="text-muted">Listagem e gerenciamento de compras.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={handleNovaCompraClick}>
                        <i className="bi bi-plus-circle-fill me-2"></i>
                        Nova Compra
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Compras</h5>
                        <select name="periodo" id="periodo" className="form-select w-auto" onChange={handleInputChangePeriodo} value={periodo}>
                            <option value="todos">Todo o Período</option>
                            <option value="ultimo_mes">Último Mês</option>
                            <option value="ultimos_3_meses">Últimos 3 Meses</option>
                            <option value="ultimo_semestre">Último Semestre</option>
                        </select>
                    </div>

                    <div className="card-body">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : records.length > 0 ? (
                            <table className="table mt-4 table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col" className='text-end pe-5' style={{ width: '10%' }}>ID</th>
                                        <th scope="col" className='ps-5' style={{ width: '25%' }}>Data</th>
                                        <th scope="col" className='' style={{ width: '35%' }}>Automóvel</th>
                                        <th scope="col" className='text-center' style={{ width: '10%' }}>Valor</th>
                                        <th scope="col" className="text-center" style={{ width: '20%' }}>Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((d) => {
                                        const auto = automovel.find(a => a.id === d.automovelId);
                                        const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                        const nomeModelo = modelo.find(mo => mo.id === auto?.modeloId);

                                        return (
                                            <tr key={d.id} className="align-middle">
                                                <th scope="row" className='text-end pe-5'>{d.id}</th>
                                                <td className='ps-5'>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                <td>
                                                    <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${nomeModelo?.nome ?? ''}`}</div>
                                                    <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                </td>
                                                <td className="text-dark fw-bold text-end">{d.valor && `${parseFloat(d.valor).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`}</td>
                                                <td className='text-center ps-3'>
                                                    <button
                                                        className='btn btn-outline-info btn-sm me-2'
                                                        onClick={() => { verDetalhes(d.id) }}
                                                        title="Ver Detalhes"
                                                    >
                                                        <i className="bi bi-eye-fill"></i>
                                                    </button>

                                                    <button
                                                        className='btn btn-outline-warning btn-sm me-2'
                                                        onClick={() => { editarCompra(d.id) }}
                                                        title="Editar Compra"
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>

                                                    {/* <button
                                                        className='btn btn-outline-danger btn-sm'
                                                        onClick={() => handleAbrirModalConfirmacao(d)}
                                                        title="Excluir Compra"
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button> */}
                                                </td>
                                            </tr>

                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma compra encontrada</h4>
                                <p className="text-muted">Não há registros que correspondam ao filtro selecionado.</p>
                            </div>
                        )}
                    </div>

                    <div className="card-footer bg-light">
                        {!loading && listaAtual.length > 0 && npage > 1 && (
                            <nav className="d-flex justify-content-center">
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={prePage}>Anterior</button>
                                    </li>
                                    {numbers.map((n) => (
                                        <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                                            <button className="page-link" onClick={() => changeCPage(n)}>{n}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={nextPage}>Próximo</button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>

                <ModalCompra
                    show={showClienteModal}
                    onHide={() => setShowClienteModal(false)}
                    compra={compraLocalStorage}
                    onClienteVerificado={handleClienteVerificado}
                />

                <ModalVerificarAutomovel
                    show={showAutomovelModal}
                    onHide={() => setShowAutomovelModal(false)}
                    onAutomovelVerificado={handleAutomovelVerificado}
                />

                {/* <ModalConfirmacao
                    show={showConfirmModal}
                    onHide={handleFecharModalConfirmacao}
                    onConfirm={handleDeletarCompra}
                    loading={deleteLoading}
                    titulo="Confirmar Exclusão de Compra"
                    corpo={
                        <>
                            <p>Você tem certeza que deseja excluir a compra ?</p>
                            <p ><strong>Atenção:</strong> Esta ação também excluirá <strong>permanentemente</strong> o automóvel associado a ela. Esta operação <strong>não </strong> pode ser desfeita.</p>
                        </>
                    }
                /> */}

            </div >
        </>

    );

}

export default Compras;