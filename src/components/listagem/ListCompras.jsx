import Header from '../Header';
import CompraDataService from '../../services/compraDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalCompra from '../modais/ModalCompra';
import ModalConfirmacao from '../modais/ModalConfirmacao';


const Compras = () => {

    const navigate = useNavigate();

    const compraLocalStorage = { negocio: "Compra" };
    const [showModal, setShowModal] = useState(false);

    const [compra, setCompra] = useState([]);
    const [compraRecente, setCompraRecente] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    // States para controlar o modal de exclusão
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemParaDeletar, setItemParaDeletar] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);


    // Funções para controlar o modal e a exclusão
    const handleAbrirModalConfirmacao = (compra) => {
        setItemParaDeletar(compra);
        setShowConfirmModal(true);
    };

    const handleFecharModalConfirmacao = () => {
        setItemParaDeletar(null);
        setShowConfirmModal(false);
    };

    const handleDeletarCompra = async () => {
        if (!itemParaDeletar) return;

        setDeleteLoading(true);
        try {
            await CompraDataService.remove(itemParaDeletar.id);

            // Atualiza a UI removendo o item da lista para feedback instantâneo
            setCompra(prev => prev.filter(c => c.id !== itemParaDeletar.id));

            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar compra:", error);
            // Opcional: Adicionar um alerta de erro para o usuário aqui
        } finally {
            setDeleteLoading(false);
        }
    };

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
            CompraDataService.getAll(),
            CompraDataService.getByData(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([compras, recentes, automoveis, modelos, marcas]) => {
            setCompra(compras.data);
            setCompraRecente(recentes.data);
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
        switch (opcao) {
            case 'data':
                return compraRecente;
            case '':
            default:
                return compra;
        }
    }, [opcao, compra, compraRecente]);

    useEffect(() => {
        setCurrentPage(1);
    }, [opcao]);


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
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-0">Compras</h1>
                        <p className="text-muted">Listagem e gerenciamento de compras.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-circle-fill me-2"></i> {/* Ícone opcional */}
                        Nova Compra
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Compras</h5>
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
                                        const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                        return (
                                            <tr key={d.id} className="align-middle">
                                                <th scope="row">{d.id}</th>
                                                <td>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
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
                                                        onClick={() => { editarCompra(d.id) }}
                                                        title="Editar Compra" // Dica para o usuário
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>

                                                    <button
                                                        className='btn btn-outline-danger btn-sm'
                                                        onClick={() => handleAbrirModalConfirmacao(d)}
                                                        title="Excluir Compra"
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
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    compra={compraLocalStorage}
                />

                <ModalConfirmacao
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
                />

            </div >
        </>

    );

}

export default Compras;