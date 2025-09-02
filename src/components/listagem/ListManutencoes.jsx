import Header from '../Header';
import ManutencaoDataService from '../../services/manutencaoDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacao from '../modais/ModalConfirmacao';
import ModalFinalizarManutencao from '../modais/ModalFinalizarManutencao';


const Manutencao = () => {

    const navigate = useNavigate();

    const [manutencaoAtiva, setManutencaoAtiva] = useState([]);
    const [manutencaoInativa, setManutencaoInativa] = useState([]);
    const [manutencaoRecente, setManutencaoRecente] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    // 2. Adicione os states para controlar o modal de exclusão
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemParaDeletar, setItemParaDeletar] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // 3. Crie as funções para controlar o modal e a exclusão
    const handleAbrirModalConfirmacao = (troca) => {
        setItemParaDeletar(troca);
        setShowConfirmModal(true);
    };

    const handleFecharModalConfirmacao = () => {
        setItemParaDeletar(null);
        setShowConfirmModal(false);
    };

    const handleDeletarManutencao = async () => {
        if (!itemParaDeletar) return;

        setDeleteLoading(true);
        try {
            await ManutencaoDataService.remove(itemParaDeletar.id);

            // Atualiza a UI removendo o item da lista para feedback instantâneo
            setManutencaoAtiva(prev => prev.filter(t => t.id !== itemParaDeletar.id));
            setManutencaoInativa(prev => prev.filter(t => t.id !== itemParaDeletar.id));
            setManutencaoRecente(prev => prev.filter(t => t.id !== itemParaDeletar.id));

            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar manutenção:", error);
            // Opcional: Adicionar um alerta de erro para o usuário aqui
        } finally {
            setDeleteLoading(false);
        }
    };


    //FINALIAR MANUTENCAO
    const [showFinalizarModal, setShowFinalizarModal] = useState(false);
    const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);

    // Funções para o novo modal
    const handleAbrirModalFinalizar = (manutencao) => {
        setManutencaoSelecionada(manutencao);
        setShowFinalizarModal(true);
    };

    const handleFinalizacaoSucesso = (idManutencaoFinalizada) => {
        // Remove a manutenção da lista de ativos para feedback instantâneo
        // setManutencaoAtiva(prev => prev.filter(m => m.id !== idManutencaoFinalizada));
        fetchData();
    };



    const [opcao, setOpcao] = useState('ativas');

    const handleInputChangeOpcao = event => {
        const { value } = event.target;
        setOpcao(value);
    }

    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     setLoading(true);
    //     const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
    //     // Use Promise.all para esperar todas as chamadas essenciais terminarem
    //     Promise.all([
    //         ManutencaoDataService.getByAtivo(),
    //         ManutencaoDataService.getByInativo(),
    //         ManutencaoDataService.getAllByDataEnvio(),
    //         AutomovelDataService.getAll(),
    //         ModeloDataService.getAll(),
    //         MarcaDataService.getAll(),
    //         // VendaDataServive.getByData()
    //     ]).then(([ativas, inativas, recentes, automoveis, modelos, marcas]) => {
    //         setManutencaoAtiva(ativas.data);
    //         setManutencaoInativa(inativas.data);
    //         setManutencaoRecente(recentes.data);
    //         setAutomovel(automoveis.data);
    //         setModelo(modelos.data);
    //         setMarca(marcas.data);
    //         // setVendaRecente(vendasRecentes.data)
    //     }).catch((err) => {
    //         console.error("Erro ao carregar dados:", err);
    //         setLoading(false); // Garante que o loading não fica travado
    //     }).finally(() => {
    //         setLoading(false); // Esconde o loading quando tudo terminar
    //         clearTimeout(timeout);
    //     });
    // }, []);


    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            ManutencaoDataService.getByAtivo(),
            ManutencaoDataService.getByInativo(),
            ManutencaoDataService.getAllByDataEnvio(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            // VendaDataServive.getByData()
        ]).then(([ativas, inativas, recentes, automoveis, modelos, marcas]) => {
            setManutencaoAtiva(ativas.data);
            setManutencaoInativa(inativas.data);
            setManutencaoRecente(recentes.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            // setVendaRecente(vendasRecentes.data)
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
        });
    }, []);

    // 2. CHAME A FUNÇÃO DE BUSCA QUANDO O COMPONENTE MONTAR
    useEffect(() => {
        fetchData();
    }, [fetchData]); // Depende da função fetchData



    // 2. UNIFICAÇÃO DA FONTE DE DADOS
    const listaAtual = useMemo(() => {
        switch (opcao) {
            case 'inativas':
                return manutencaoInativa;
            case 'data_envio':
                return manutencaoRecente;
            case 'ativas':
            default:
                return manutencaoAtiva;
        }
    }, [opcao, manutencaoAtiva, manutencaoInativa, manutencaoRecente]);

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

    const editarManutencao = (id) => {
        navigate(`/editar-manutencao/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-manutencao/${id}`);
    }


    return (
        <>
            <Header />
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-0">Manutenções</h1>
                        <p className="text-muted">Listagem e gerenciamento de manutenções.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={() => { navigate('/manutencao') }}>
                        <i className="bi bi-plus-circle-fill me-2"></i> {/* Ícone opcional */}
                        Nova Manutenção
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Manutenções</h5>
                        {/* Filtro/Dropdown vai aqui */}
                        <select name="opcao" id="opcao" className="form-select w-auto" onChange={handleInputChangeOpcao}>
                            <option value="ativas">Ativas</option>
                            <option value="inativas">Finalizadas</option>
                            <option value="data_envio">Mais Recentes</option>
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
                                        <th scope="col">Data Envio</th>
                                        {/* <th scope="col">Previsão de Retorno</th> */}
                                        <th scope="col">
                                            {opcao === 'ativas' ? 'Previsão de Retorno' : 'Data Retorno'}
                                        </th>
                                        <th scope="col">Automóvel</th>
                                        <th scope="col">Valor</th>
                                        <th scope="col" className="text-center" style={{ width: '180px' }}>Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((d) => {
                                        const auto = automovel.find(a => a.id === d.automovelId);
                                        const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                        const noModelo = modelo.find(mo => mo.id === auto?.modeloId);

                                        return (
                                            <tr key={d.id} className="align-middle">
                                                <th scope="row">{d.id}</th>
                                                <td>{new Date(d.data_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                {/* <td>{d.previsao_retorno ? new Date(d.previsao_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</td> */}
                                                <td>
                                                    {d.ativo ?
                                                        // Se estiver ativa, mostra a previsão
                                                        (d.previsao_retorno ? new Date(d.previsao_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A')
                                                        :
                                                        // Se estiver finalizada, mostra a data de retorno real
                                                        (d.data_retorno ? new Date(d.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A')
                                                    }
                                                </td>

                                                <td>
                                                    <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
                                                    <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                </td>
                                                <td className="text-dark fw-bold">{d.valor && `${parseFloat(d.valor).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`}</td>
                                                <td className='text-center'>
                                                    <button
                                                        className='btn btn-outline-info btn-sm me-2'
                                                        onClick={() => { verDetalhes(d.id) }}
                                                        title="Ver Detalhes"
                                                    >
                                                        <i className="bi bi-eye-fill"></i>
                                                    </button>

                                                    <button
                                                        className='btn btn-outline-warning btn-sm me-2'
                                                        onClick={() => { editarManutencao(d.id) }}
                                                        title="Editar Manutenção" // Dica para o usuário
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>

                                                    {d.ativo && (
                                                        <button
                                                            className='btn btn-outline-success btn-sm me-2'
                                                            onClick={() => handleAbrirModalFinalizar(d)}
                                                            title="Finalizar Manutenção"
                                                        >
                                                            <i className="bi bi-check-circle-fill"></i>
                                                        </button>
                                                    )}


                                                    <button
                                                        className='btn btn-outline-danger btn-sm'
                                                        onClick={() => handleAbrirModalConfirmacao(d)}
                                                        title="Excluir Manutenção"
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma manutenção encontrada</h4>
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
            </div>

            <ModalConfirmacao
                show={showConfirmModal}
                onHide={handleFecharModalConfirmacao}
                onConfirm={handleDeletarManutencao}
                loading={deleteLoading}
                titulo="Confirmar Exclusão de Manutenção"
                corpo={
                    <>
                        <p>Você tem certeza que deseja excluir o registro de manutenção?</p>
                        <p><strong>Atenção:</strong> Esta ação <strong>não</strong> pode ser desfeita.</p>
                        <ul>
                            <li>O registro dessa <strong>manutenção</strong> será excluído <strong>permanentemente</strong>.</li>
                        </ul>
                    </>
                }
            />

            {manutencaoSelecionada && (
                <ModalFinalizarManutencao
                    show={showFinalizarModal}
                    onHide={() => setShowFinalizarModal(false)}
                    manutencao={manutencaoSelecionada}
                    onSuccess={handleFinalizacaoSucesso}
                />
            )}
        </>
    );

}

export default Manutencao;