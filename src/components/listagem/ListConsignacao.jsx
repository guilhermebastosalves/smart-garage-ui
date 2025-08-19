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


const Consignacoes = () => {

    const navigate = useNavigate();

    const consignacaoLocalStorage = { negocio: "Consignacao" };
    const [showModal, setShowModal] = useState(false);

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
                        {/* <div className="btn-group" role="group">
                            <button
                                type="button"
                                className={`btn ${opcao === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setOpcao('')}>
                                Padrão
                            </button>
                            <button
                                type="button"
                                className={`btn ${opcao === 'data_inicio' ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setOpcao('data_inicio')}>
                                Mais Recentes
                            </button>
                        </div> */}
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
                                                <th scope="col">Data</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">-</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recordsConsignacao.map((d, i) => {
                                                const auto = automovel.find(a => a.id === d.automovelId);
                                                const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                                const noModelo = modelo.find(mo => mo.marcaId === nomeMarca?.id);

                                                // return (
                                                //     <tr key={d.id}>
                                                //         <th scope="row">{d.id}</th>
                                                //         <td>{d.data_inicio}</td>
                                                //         <td>{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</td>
                                                //         <td>{`${auto?.placa}`}</td>
                                                //         <td>{d.valor}</td>
                                                //         <td><button className='btn btn-warning' onClick={() => { editarConsignacao(d.id) }}>Editar</button></td>
                                                //     </tr>
                                                // );
                                                return (
                                                    <tr key={d.id} className="align-middle">
                                                        <th scope="row">{d.id}</th>
                                                        <td>{new Date(d.data_inicio).toLocaleDateString('pt-BR')}</td> {/* Formatar data */}
                                                        <td>
                                                            <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
                                                            <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                        </td>
                                                        <td className="text-dark fw-bold">{`R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td> {/* Formatar valor */}
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-warning btn-sm'
                                                                onClick={() => { editarConsignacao(d.id) }}
                                                                title="Editar Consignação" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
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
                                                <th scope="col">Data</th>
                                                <th scope="col">Automóvel</th>
                                                <th scope="col">Valor</th>
                                                <th scope="col">-</th>
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
                                                        <td>{new Date(d.data_inicio).toLocaleDateString('pt-BR')}</td> {/* Formatar data */}
                                                        <td>
                                                            <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
                                                            <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                        </td>
                                                        <td className="text-dark fw-bold">{`R$ ${d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}</td> {/* Formatar valor */}
                                                        <td>
                                                            <button
                                                                className='btn btn-outline-warning btn-sm'
                                                                onClick={() => { editarConsignacao(d.id) }}
                                                                title="Editar Consignação" // Dica para o usuário
                                                            >
                                                                <i className="bi bi-pencil-fill"></i>
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


            </div>
        </>
    );

}

export default Consignacoes;