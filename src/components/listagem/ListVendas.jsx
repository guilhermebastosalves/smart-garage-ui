import Header from '../Header';
import VendaDataService from '../../services/vendaDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useMemo, useEffect } from 'react';
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

    const listaAtual = useMemo(() => {
        switch (opcao) {
            case 'data':
                return vendaRecente;
            case '':
            default:
                return venda;
        }
    }, [opcao, venda, vendaRecente]);

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
                <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
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
                            <option value="data">Mais Recentes</option>
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
                                        <th scope="col">Data</th>
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
                                        const nomeModelo = modelo.find(mo => mo.id === auto?.modeloId);

                                        return (
                                            <tr key={d.id} className="align-middle">
                                                <th scope="row">{d.id}</th>
                                                <td>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                <td>
                                                    <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${nomeModelo?.nome ?? ''}`}</div>
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
                                                        onClick={() => { editarVenda(d.id) }}
                                                        title="Editar Venda" // Dica para o usuário
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>

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
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma venda encontrada</h4>
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