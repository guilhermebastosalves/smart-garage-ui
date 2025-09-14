import Header from '../Header';
import TrocaDataService from '../../services/trocaDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import ClienteDataService from '../../services/clienteDataService';
import FisicaDataService from '../../services/fisicaDataService';
import JuridicaDataService from '../../services/juridicaDataService';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalTroca from '../modais/ModalTroca';
import ModalConfirmacao from '../modais/ModalConfirmacao';
import { useAuth } from '../../context/AuthContext';


const Trocas = () => {

    const { user } = useAuth();

    const trocaLocalStorage = { negocio: "Troca" };
    const [showModal, setShowModal] = useState(false);

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [todasTrocas, setTodasTrocas] = useState([]);


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

    const handleDeletarTroca = async () => {
        if (!itemParaDeletar) return;

        setDeleteLoading(true);
        try {
            await TrocaDataService.remove(itemParaDeletar.id);

            // Atualiza a UI removendo o item da lista para feedback instantâneo
            setTodasTrocas(prev => prev.filter(t => t.id !== itemParaDeletar.id));

            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar troca:", error);
            // Opcional: Adicionar um alerta de erro para o usuário aqui
        } finally {
            setDeleteLoading(false);
        }
    };

    const navigate = useNavigate();

    const [periodo, setPeriodo] = useState('todos');

    const handleInputChangePeriodo = event => {
        const { value } = event.target;
        setPeriodo(value);
    }

    const [loading, setLoading] = useState(true);


    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            TrocaDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll()
        ]).then(([trocas, automoveis, modelos, marcas]) => {
            setTodasTrocas(trocas.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
            clearTimeout(timeout);
        });
    }, []);

    const listaAtual = useMemo(() => {
        // 1. Define a data de início do filtro de período
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

        // 2. Aplica os filtros em sequência
        return todasTrocas
            .filter(item => {
                // Primeiro, filtra por período (se não for "todos")
                if (!dataFiltro) return true; // Se for "todos", passa todos
                return new Date(item.data) >= dataFiltro;
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));

    }, [periodo, todasTrocas]);

    useEffect(() => {
        setCurrentPage(1);
    }, [periodo]);


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 15;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const records = listaAtual.slice(firstIndex, lastIndex);
    const npage = Math.ceil(listaAtual.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    // Funções de controle da paginação (agora funcionam para qualquer lista)
    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < npage) setCurrentPage(currentPage + 1); };

    const editarTroca = (id) => {
        navigate(`/editar-troca/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-troca/${id}`);
    }

    return (
        <>
            <Header />
            <div className="container">

                <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                    <div>
                        <h1 className="mb-0">Trocas</h1>
                        <p className="text-muted">Listagem e gerenciamento de trocas.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-circle-fill me-2"></i>
                        Nova Troca
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Trocas</h5>
                        {/* Filtro/Dropdown vai aqui */}
                        {/* <select name="opcao" id="opcao" className="form-select w-auto" onChange={handleInputChangeOpcao}>
                            <option value="">Padrão</option>
                            <option value="data">Mais Recentes</option>
                        </select> */}

                        <select name="periodo" id="periodo" className="form-select w-auto" onChange={handleInputChangePeriodo} value={periodo}>
                            <option value="todos">Todo o Período</option>
                            <option value="ultimo_mes">Último Mês</option>
                            <option value="ultimos_3_meses">Últimos 3 Meses</option>
                            <option value="ultimo_semestre">Último Semestre</option>
                        </select>
                    </div>

                    <div className="card-body">
                        {/* Sua lógica de renderização da tabela ou mensagem "Sem resultados" vai aqui dentro */}
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
                                        <th scope="col">Data</th>
                                        <th scope="col">Automóvel Recebido</th>
                                        <th scope="col">Automóvel Fornecido</th>
                                        <th scope="col">Valor Diferença</th>
                                        <th scope="col" className="text-center" style={{ width: '180px' }}>Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((d) => {
                                        const auto = automovel.find(a => a.id === d.automovelId);
                                        const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                        const nomeModelo = modelo.find(mo => mo.id === auto?.modeloId);

                                        const autoFornecido = automovel.find(a => a.id === d.automovel_fornecido);
                                        const nomeMarcaFornecido = marca.find(m => m.id === autoFornecido?.marcaId);
                                        const noModeloFornecido = modelo.find(mo => mo.id === autoFornecido?.modeloId);

                                        return (
                                            <tr key={d.id} className="align-middle">
                                                <th scope="row">{d.id}</th>
                                                <td>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                <td>
                                                    <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${nomeModelo?.nome ?? ''}`}</div>
                                                    <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                </td>
                                                <td>
                                                    <div className="fw-bold">{`${nomeMarcaFornecido?.nome ?? ''} ${noModeloFornecido?.nome ?? ''}`}</div>
                                                    <small className="text-muted">{`Placa: ${autoFornecido?.placa}`}</small>
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
                                                    {user.role === "gerente" &&
                                                        <button
                                                            className='btn btn-outline-warning btn-sm me-2'
                                                            onClick={() => { editarTroca(d.id) }}
                                                            title="Editar Troca" // Dica para o usuário
                                                        >
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>}
                                                    {user.role === "gerente" &&
                                                        <button
                                                            className='btn btn-outline-danger btn-sm'
                                                            onClick={() => handleAbrirModalConfirmacao(d)}
                                                            title="Excluir Troca"
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>}
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

                <ModalTroca
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    troca={trocaLocalStorage}
                />

                {/* 5. Renderize o modal de confirmação */}
                <ModalConfirmacao
                    show={showConfirmModal}
                    onHide={handleFecharModalConfirmacao}
                    onConfirm={handleDeletarTroca}
                    loading={deleteLoading}
                    titulo="Confirmar Exclusão de Troca"
                    corpo={
                        <>
                            <p>Você tem certeza que deseja excluir a troca <strong>#{itemParaDeletar?.id}</strong>?</p>
                            <p className="text-danger fw-bold">Atenção: Esta ação é complexa e não pode ser desfeita.</p>
                            <ul>
                                <li>O registro desta <strong>troca</strong> será excluído.</li>
                                <li>O automóvel <strong>recebido</strong> pela loja será excluído permanentemente.</li>
                                <li>O automóvel <strong>fornecido</strong> pelo cliente voltará ao status de "Ativo" no estoque.</li>
                            </ul>
                        </>
                    }
                />

            </div >
        </>
    );

}

export default Trocas;