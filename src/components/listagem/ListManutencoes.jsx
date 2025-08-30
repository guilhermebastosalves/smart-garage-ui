import Header from '../Header';
import ManutencaoDataService from '../../services/manutencaoDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacao from '../modais/ModalConfirmacao';


const Manutencao = () => {

    const navigate = useNavigate();

    const [manutencao, setManutencao] = useState([]);
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
            setManutencao(prev => prev.filter(t => t.id !== itemParaDeletar.id));
            setManutencaoRecente(prev => prev.filter(t => t.id !== itemParaDeletar.id));

            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar manutenção:", error);
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
            ManutencaoDataService.getAll(),
            ManutencaoDataService.getAllByDataEnvio(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            // VendaDataServive.getByData()
        ]).then(([manutencoes, manutencoesrecentes, automoveis, modelos, marcas]) => {
            setManutencao(manutencoes.data);
            setManutencaoRecente(manutencoesrecentes.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            // setVendaRecente(vendasRecentes.data)
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

    const recordsManutencoes = manutencao.slice(firstIndex, lastIndex);
    const npageManutencoes = Math.ceil(manutencao.length / recordsPerPage);
    const numbersManutencoes = [...Array(npageManutencoes + 1).keys()].slice(1);

    const recordsManutencoesRecentes = manutencaoRecente.slice(firstIndex, lastIndex);
    const npageManutencoesRecentes = Math.ceil(manutencaoRecente.length / recordsPerPage);
    const numbersManutencoesRecentes = [...Array(npageManutencoesRecentes + 1).keys()].slice(1);


    function nextPage() {
        if (currentPage !== npageManutencoes) {
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
                            <option value="">Padrão</option>
                            <option value="recente">Mais Recentes</option>
                        </select>
                    </div>

                    <div className="card-body">
                        {/* Sua lógica de renderização da tabela ou mensagem "Sem resultados" vai aqui dentro */}
                        {opcao === '' && (
                            manutencao.length > 0 ? (
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
                                                <th scope="col">Data Envio</th>
                                                <th scope="col">Previsão de Retorno</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">Descrição</th>
                                                <th scope="col">Editar</th>
                                                <th scope="col">Excluir</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsManutencoes.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td> {/* Formatar data */}
                                                        <td>{new Date(d.previsao_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
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
                                                                onClick={() => { editarManutencao(d.id) }}
                                                                title="Editar Manutenção" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                        </td>
                                                        <td>
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
                                </>
                            ) : (

                                <div className="text-center p-5">
                                    <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                    <h4 className="mt-3">Nenhuma manutenção encontrada</h4>
                                </div>

                            )
                        )}

                        {opcao === 'recente' && (
                            manutencaoRecente.length > 0 ? (
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
                                                <th scope="col">Data Envio</th>
                                                <th scope="col">Previsão de Retorno</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">Descrição</th>
                                                <th scope="col">Editar</th>
                                                <th scope="col">Excluir</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsManutencoesRecentes.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                        <td>{new Date(d.previsao_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
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
                                                                onClick={() => { editarManutencao(d.id) }}
                                                                title="Editar Manutenção" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
                                                            </button>
                                                        </td>
                                                        <td>
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
                                </>
                            ) : (

                                <div className="text-center p-5">
                                    <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                    <h4 className="mt-3">Nenhuma manutenção encontrada</h4>

                                </div>

                            )
                        )}
                    </div>

                    <div className="card-footer bg-light">
                        {/* Sua paginação vai aqui */}
                        {opcao === '' && (
                            manutencao.length > 0 ? (
                                <>
                                    <nav className="col-md-9 mt-3"></nav>
                                    <nav className="mt-3 col-md-3">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={prePage}>Previous</span>
                                            </li>
                                            {numbersManutencoes.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === npageManutencoes ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={nextPage}>Next</span>
                                            </li>
                                        </ul>
                                    </nav>
                                </>
                            ) : (""))
                        }

                        {opcao === 'recente' && (
                            manutencaoRecente.length > 0 ? (
                                <>
                                    <nav className="col-md-9 mt-3"></nav>
                                    <nav className="mt-3 col-md-3">
                                        <ul className="pagination">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <span className="page-link pointer" href="#" onClick={prePage}>Previous</span>
                                            </li>
                                            {numbersManutencoesRecentes.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}
                                                    </span>
                                                </li>
                                            ))}
                                            <li className={`page-item ${currentPage === npageManutencoesRecentes ? 'disabled' : ''}`}>
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
        </>
    );

}

export default Manutencao;