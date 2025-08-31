import Header from '../Header';
import ConsignacaoDataService from '../../services/consignacaoDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useCallback, useEffect, useMemo } from 'react';
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
    const [consignacaoInativo, setConsignacaoInativo] = useState([]);
    const [consignacaoDataInicio, setConsignacaoDataInicio] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const [opcao, setOpcao] = useState('ativos');

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
            ConsignacaoDataService.getByInativo(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ConsignacaoDataService.getAllByDataInicio()
        ]).then(([ativos, inativos, automoveis, modelos, marcas, datainicio]) => {
            setConsignacaoAtivo(ativos.data);
            setConsignacaoInativo(inativos.data)
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


    // 2. UNIFICAÇÃO DA FONTE DE DADOS
    const listaAtual = useMemo(() => {
        switch (opcao) {
            case 'inativos':
                return consignacaoInativo;
            case 'data_inicio':
                return consignacaoDataInicio;
            case 'ativos':
            default:
                return consignacaoAtivo;
        }
    }, [opcao, consignacaoAtivo, consignacaoInativo, consignacaoDataInicio]);

    // 3. RESETA A PÁGINA QUANDO O FILTRO MUDA
    useEffect(() => {
        setCurrentPage(1);
    }, [opcao]);


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const records = listaAtual.slice(firstIndex, lastIndex);
    const npage = Math.ceil(listaAtual.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    // Funções de controle da paginação (agora funcionam para qualquer lista)
    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < npage) setCurrentPage(currentPage + 1); };

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
                            <option value="ativos">Ativas</option>
                            <option value="inativos">Finalizadas</option>
                            <option value="data_inicio">Mais Recentes</option>
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
                                        <th scope="col">ID</th>
                                        <th scope="col">Data Início</th>
                                        <th scope="col">Automóvel</th>
                                        <th scope="col">Valor</th>
                                        <th scope="col" className="text-center" style={{ width: '180px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((d) => {
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
                                                <td className="text-dark fw-bold">{d.valor && `${parseFloat(d.valor).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`}</td>
                                                <td className="text-center">
                                                    <button className='btn btn-outline-info btn-sm me-2' onClick={() => verDetalhes(d.id)} title="Ver Detalhes"><i className="bi bi-eye-fill"></i></button>
                                                    <button className='btn btn-outline-warning btn-sm me-2' onClick={() => editarConsignacao(d.id)} title="Editar"><i className="bi bi-pencil-fill"></i></button>
                                                    {d.ativo && ( // Mostra o botão de encerrar apenas se estiver ativa
                                                        <button className='btn btn-outline-success btn-sm me-2' onClick={() => handleAbrirModalEncerramento(d)} title="Encerrar"><i className="bi bi-check-circle-fill"></i></button>
                                                    )}
                                                    <button className='btn btn-outline-danger btn-sm' onClick={() => handleAbrirModalConfirmacao(d)} title="Excluir"><i className="bi bi-trash-fill"></i></button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma consignação encontrada</h4>
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