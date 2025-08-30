import Header from '../Header';
import ClienteDataService from '../../services/clienteDataService';
import FisicaDataService from '../../services/fisicaDataService';
import JuridicaDataService from '../../services/juridicaDataService';
import ConsignacaoDataService from '../../services/consignacaoDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalConsignacao from '../modais/ModalConsignacao';
import ModalEncerrarConsignacao from '../modais/ModalEncerrarConsignacao';
import ModalConfirmacao from '../modais/ModalConfirmacao';


const Consignacoes = () => {

    const navigate = useNavigate();

    const consignacaoLocalStorage = { negocio: "Consignacao" };
    const [showModal, setShowModal] = useState(false);

    const [showEncerrarModal, setShowEncerrarModal] = useState(false);
    const [consignacaoSelecionada, setConsignacaoSelecionada] = useState(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemParaDeletar, setItemParaDeletar] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleAbrirModalEncerramento = (consignacao) => {
        setConsignacaoSelecionada(consignacao);
        setShowEncerrarModal(true);
    };

    const handleEncerramentoSucesso = (idConsignacaoEncerrada) => {
        // Remove a consignação da lista de ativos na tela, dando feedback instantâneo
        setConsignacaoAtivo(prev => prev.filter(c => c.id !== idConsignacaoEncerrada));
    };

    // Função para abrir o modal de confirmação da exclusão
    const handleAbrirModalConfirmacao = (consignacao) => {
        setItemParaDeletar(consignacao);
        setShowConfirmModal(true);
    };

    // Função para fechar o modal de exclusão
    const handleFecharModalConfirmacao = () => {
        setItemParaDeletar(null);
        setShowConfirmModal(false);
    };

    // Função que executa a exclusão
    const handleDeletarConsignacao = async () => {
        if (!itemParaDeletar) return;

        setDeleteLoading(true);
        try {
            await ConsignacaoDataService.remove(itemParaDeletar?.id);

            // Atualiza a UI removendo o item da lista
            setConsignacaoAtivo(prev => prev.filter(c => c.id !== itemParaDeletar?.id));
            setConsignacaoDataInicio(prev => prev.filter(c => c.id !== itemParaDeletar?.id));

            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar consignação:", error);
            // Opcional: Adicionar um alerta de erro para o usuário
        } finally {
            setDeleteLoading(false);
        }
    };

    const [consignacaoAtivo, setConsignacaoAtivo] = useState([]);
    const [consignacaoDataInicio, setConsignacaoDataInicio] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const [opcao, setOpcao] = useState('');

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
            ConsignacaoDataService.getByAtivo(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ConsignacaoDataService.getAllByDataInicio()
        ]).then(([consignacoes, automoveis, modelos, marcas, datainicio]) => {
            setConsignacaoAtivo(consignacoes.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            setConsignacaoDataInicio(datainicio.data)
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

    const recordsConsignacao = consignacaoAtivo.slice(firstIndex, lastIndex);
    const npageConsignacao = Math.ceil(consignacaoAtivo.length / recordsPerPage);
    const numbersConsignacao = [...Array(npageConsignacao + 1).keys()].slice(1);

    const recordsConsignacaoDataInicio = consignacaoDataInicio.slice(firstIndex, lastIndex);
    const npageConsignacaoDataInico = Math.ceil(consignacaoDataInicio.length / recordsPerPage);
    const numbersConsignacaoDataInicio = [...Array(npageConsignacaoDataInico + 1).keys()].slice(1);


    function nextPage() {
        // Usar npageConsignacao como o limite dinâmico
        if (currentPage !== npageConsignacao) {
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

    const editarConsignacao = (id) => {
        navigate(`/editar-consignacao/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-consignacao/${id}`);
    }

    return (
        <>
            <Header />
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-0">Consignações</h1>
                        <p className="text-muted">Listagem e gerenciamento de consignações ativas.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-circle-fill me-2"></i> {/* Ícone opcional */}
                        Nova Consignação
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Consignações Ativas</h5>
                        {/* Filtro/Dropdown vai aqui */}
                        <select name="opcao" id="opcao" className="form-select w-auto" onChange={handleInputChangeOpcao}>
                            <option value="">Padrão</option>
                            <option value="data_inicio">Mais Recentes</option>
                        </select>

                    </div>

                    <div className="card-body">
                        {/* Sua lógica de renderização da tabela ou mensagem "Sem resultados" vai aqui dentro */}
                        {opcao === '' && (
                            consignacaoAtivo.length > 0 ? (
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
                                                <th scope="col">Data Início</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">Detalhes</th>
                                                <th scope="col">Editar</th>
                                                <th scope="col">Encerrar</th>
                                                <th scope="col">Excluir</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsConsignacao.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
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
                                                                className='btn btn-outline-warning btn-sm ms-2'
                                                                onClick={() => { editarConsignacao(d.id) }}
                                                                title="Editar Consignação" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-success btn-sm ms-3'
                                                                onClick={() => handleAbrirModalEncerramento(d)}
                                                                title="Encerrar Consignação"
                                                            >
                                                                <i className="bi bi-check-circle-fill"></i>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-danger btn-sm'
                                                                onClick={() => handleAbrirModalConfirmacao(d)}
                                                                title="Excluir Consignação"
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
                                    <h4 className="mt-3">Nenhuma consignação encontrada</h4>
                                    <p className="text-muted">Que tal adicionar a primeira? Clique em "Nova Consignação" para começar.</p>
                                </div>

                            )
                        )}

                        {opcao === 'data_inicio' && (
                            consignacaoDataInicio.length > 0 ? (
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
                                                <th scope="col">Data Início</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">Detalhes</th>
                                                <th scope="col">Editar</th>
                                                <th scope="col">Encerrar</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsConsignacaoDataInicio.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                        <td>
                                                            <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
                                                            <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                        </td>
                                                        <td className="text-dark fw-bold">{`R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-info btn-sm'
                                                                onClick={() => { verDetalhes(d.id) }}
                                                                title="Ver Detalhes"
                                                            >
                                                                <i className="bi bi-eye-fill"></i>
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-warning btn-sm'
                                                                onClick={() => { editarConsignacao(d.id) }}
                                                                title="Editar Consignação" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                        </td>

                                                        <td>
                                                            <td>
                                                                <button
                                                                    className='btn btn-outline-success btn-sm ms-3'
                                                                    onClick={() => handleAbrirModalEncerramento(d)}
                                                                    title="Encerrar Consignação"
                                                                >
                                                                    <i className="bi bi-check-circle-fill"></i>
                                                                </button>
                                                            </td>
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
                                    <h4 className="mt-3">Nenhuma consignação encontrada</h4>
                                    <p className="text-muted">Que tal adicionar a primeira? Clique em "Nova Consignação" para começar.</p>
                                </div>

                            )
                        )}
                    </div>

                    <div className="card-footer bg-light">
                        {/* Sua paginação vai aqui */}
                        {opcao === '' && (
                            consignacaoAtivo.length > 0 ? (
                                <>
                                    <nav className="col-md-9 mt-3"></nav>
                                    <nav className="mt-3 col-md-3">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={prePage}>Previous</span>
                                            </li>
                                            {numbersConsignacao.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === npageConsignacao ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={nextPage}>Next</span>
                                            </li>
                                        </ul>
                                    </nav>
                                </>
                            ) : (""))
                        }

                        {opcao === 'data_inicio' && (
                            consignacaoDataInicio.length > 0 ? (
                                <>
                                    <nav className="col-md-9 mt-3"></nav>
                                    <nav className="mt-3 col-md-3">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={prePage}>Previous</span>
                                            </li>
                                            {numbersConsignacaoDataInicio.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === npageConsignacao ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={nextPage}>Next</span>
                                            </li>
                                        </ul>
                                    </nav>
                                </>
                            ) : (""))
                        }
                    </div>
                </div>

                <ModalConsignacao
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    consignacao={consignacaoLocalStorage}
                />

                {consignacaoSelecionada && (
                    <ModalEncerrarConsignacao
                        show={showEncerrarModal}
                        onHide={() => { setShowEncerrarModal(false) }}
                        consignacao={consignacaoSelecionada}
                        onSuccess={handleEncerramentoSucesso}
                    />
                )}

                <ModalConfirmacao
                    show={showConfirmModal}
                    onHide={handleFecharModalConfirmacao}
                    onConfirm={handleDeletarConsignacao}
                    loading={deleteLoading}
                    titulo="Confirmar Exclusão de Consignação"
                    corpo={
                        <>
                            <p>Você tem certeza que deseja excluir esse registro de consignação?</p>
                            <p className="text"><strong>Atenção:</strong> Esta ação também <strong>excluirá permanentemente</strong> o automóvel associado a ela. Esta operação <strong>não</strong> pode ser desfeita.</p>
                        </>
                    }
                />

            </div>
        </>
    );

}

export default Consignacoes;