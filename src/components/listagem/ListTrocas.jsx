import Header from '../Header';
import TrocaDataService from '../../services/trocaDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import ClienteDataService from '../../services/clienteDataService';
import FisicaDataService from '../../services/fisicaDataService';
import JuridicaDataService from '../../services/juridicaDataService';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalTroca from '../modais/ModalTroca';
import ModalConfirmacao from '../modais/ModalConfirmacao';


const Trocas = () => {

    const trocaLocalStorage = { negocio: "Troca" };
    const [showModal, setShowModal] = useState(false);

    const [troca, setTroca] = useState([]);
    const [trocaFornecido, setTrocaFornecido] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);

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
            setTroca(prev => prev.filter(t => t.id !== itemParaDeletar.id));

            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar troca:", error);
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
            TrocaDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll()
        ]).then(([trocas, automoveis, modelos, marcas, clientes, fisica, juridica]) => {
            setTroca(trocas.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
            clearTimeout(timeout);
        });
    }, []);


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 15;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const recordsTroca = troca.slice(firstIndex, lastIndex);
    const npageTroca = Math.ceil(troca.length / recordsPerPage);
    const numbersTroca = [...Array(npageTroca + 1).keys()].slice(1);


    function nextPage() {
        if (currentPage !== npageTroca) {
            setCurrentPage(currentPage + 1)
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

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-0">Trocas</h1>
                        <p className="text-muted">Listagem e gerenciamento de trocas.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={() => setShowModal(true)}>
                        <i className="bi bi-plus-circle-fill me-2"></i> {/* Ícone opcional */}
                        Nova Troca
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Trocas</h5>
                        {/* Filtro/Dropdown vai aqui */}
                        <select name="opcao" id="opcao" className="form-select w-auto" onChange={handleInputChangeOpcao}>
                            <option value="">Padrão</option>
                            <option value="data_inicio">Mais Recentes</option>
                        </select>
                    </div>

                    <div className="card-body">
                        {/* Sua lógica de renderização da tabela ou mensagem "Sem resultados" vai aqui dentro */}
                        {opcao === '' && (
                            troca.length > 0 ? (
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
                                                <th scope="col">Automóvel Recebido</th>
                                                <th scope="col">Automóvel Fornecido</th>
                                                <th scope="col">Valor Diferença</th>
                                                <th scope="col">-</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsTroca.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                const autoFornecido = automovel.find(a => a.id === d.automovel_fornecido);
                                                const nomeMarcaFornecido = marca.find(m => m.id === autoFornecido?.marcaId);
                                                const noModeloFornecido = modelo.find(mo => mo.marcaId === nomeMarcaFornecido?.id);

                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                        <td>
                                                            <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
                                                            <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                        </td>
                                                        <td>
                                                            <div className="fw-bold">{`${nomeMarcaFornecido?.nome ?? ''} ${noModeloFornecido?.nome ?? ''}`}</div>
                                                            <small className="text-muted">{`Placa: ${autoFornecido?.placa}`}</small>
                                                        </td>
                                                        <td className="text-dark fw-bold">{`R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td>
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-warning btn-sm'
                                                                onClick={() => { editarTroca(d.id) }}
                                                                title="Editar Troca" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                        </td>
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
                                                                className='btn btn-outline-danger btn-sm'
                                                                onClick={() => handleAbrirModalConfirmacao(d)}
                                                                title="Excluir Troca"
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
                                    <h4 className="mt-3">Nenhuma troca encontrada</h4>
                                    <p className="text-muted">Que tal adicionar a primeira? Clique em "Nova Troca" para começar.</p>
                                </div>

                            )
                        )}
                    </div>


                    <div className="card-footer bg-light">
                        {/* Sua paginação vai aqui */}
                        {opcao === '' && (
                            troca.length > 0 ? (
                                <>
                                    <nav className="col-md-9 mt-3"></nav>
                                    <nav className="mt-3 col-md-3">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={prePage}>Previous</span>
                                            </li>
                                            {numbersTroca.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === npageTroca ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={nextPage}>Next</span>
                                            </li>
                                        </ul>
                                    </nav>
                                </>
                            ) : (""))
                        }
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