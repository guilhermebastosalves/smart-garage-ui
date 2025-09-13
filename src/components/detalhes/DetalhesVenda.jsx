import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import VendaDataService from '../../services/vendaDataService';
import FuncionarioDataService from '../../services/funcionarioDataService';
import EnderecoDataService from '../../services/enderecoDataService';
import CidadeDataService from '../../services/cidadeDataService';
import EstadoDataService from '../../services/estadoDataService';

const DetalhesVenda = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [detalhes, setDetalhes] = useState('');
    const [funcionario, setFuncionario] = useState([]);
    const [endereco, setEndereco] = useState([]);
    const [cidade, setCidade] = useState([]);
    const [estado, setEstado] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        VendaDataService.getDetalhesById(id)
            .then(response => {
                setDetalhes(response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar detalhes da venda:", e);
                setError("Não foi possível carregar os detalhes da venda. Tente novamente mais tarde.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    // useEffect(() => {
    //     FuncionarioDataService.getAll()
    //         .then(response => {
    //             setFuncionario(response.data)
    //         })
    //         .catch(e => {
    //             console.error("Erro ao buscar funcionário", e)
    //         })
    //         .finally(() => {
    //             setLoading(false)
    //         })
    // }, [])

    useEffect(() => {
        setLoading(true);
        // Carrega todos os dados em paralelo para melhor performance
        Promise.all([
            FuncionarioDataService.getAll(),
            EnderecoDataService.getAll(),
            CidadeDataService.getAll(),
            EstadoDataService.getAll()
        ]).then(([funcionarios, enderecos, cidades, estados]) => {
            setFuncionario(funcionarios.data);
            setEndereco(enderecos.data);
            setCidade(cidades.data);
            setEstado(estados.data);
        }).catch(e => {
            console.error("Erro ao carregar dados:", e);
        })
    }, []);

    if (loading) {
        return (
            <>
                <Header />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando detalhes...</span>
                    </div>
                    <p className="mt-2">Carregando detalhes da venda...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="alert alert-danger container mt-5" role="alert">
                    <h4 className="alert-heading">Erro ao Carregar!</h4>
                    <p>{error}</p>
                    <hr />
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Voltar</button>
                </div>
            </>
        );
    }

    if (!detalhes) {
        return (
            <>
                <Header />
                <div className="alert alert-warning container mt-5" role="alert">
                    <h4 className="alert-heading">Venda Não Encontrada</h4>
                    <p>Nenhuma informação detalhada foi encontrada para a venda com ID #{id}.</p>
                    <hr />
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Voltar</button>
                </div>
            </>
        );
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    // Variáveis auxiliares para facilitar o acesso aos dados
    const { automovel, cliente } = detalhes;
    // const modeloDoAutomovel = automovel?.modelos?.[0]; // Pega o primeiro modelo

    const funcionarioNome = funcionario?.find(f => f.id === detalhes?.funcionarioId);
    const enderecoInfo = endereco?.find(e => e.clienteId === cliente?.id)
    const cidadeInfo = cidade?.find(c => c.id === enderecoInfo?.cidadeId)
    const estadoInfo = estado?.find(e => e.id === cidadeInfo?.estadoId)

    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
                {/* Título da Página e Botão Voltar */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h1 className="fw-bold mb-0 text-primary">
                            <i className="bi bi-file-earmark-text me-3"></i>
                            Detalhes da Venda</h1>
                        <p className="text-muted fs-6 mt-1">Visão completa das informações da venda.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                <div className="row g-4">

                    <div className="accordion" id="accordionVenda">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#vendaInfo">
                                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                    Informações da Venda
                                </button>
                            </h2>
                            <div id="vendaInfo" className="accordion-collapse collapse" data-bs-parent="#accordionVenda">
                                <div className="accordion-body">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Funcionário responsável:</strong> {funcionarioNome?.nome ? funcionarioNome?.nome : "N/A"}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Data:</strong> {new Date(detalhes.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Valor:</strong> <span className="text fs-6">{formatter.format(detalhes.valor)}</span></p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Forma de Pagamento:</strong> <span className="text fs-6">{detalhes.forma_pagamento}</span></p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Comissão:</strong> <span className="text fs-6">{formatter.format(detalhes.comissao)}</span></p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="accordion" id="accordionDetalhesAuto">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#AutoInfo">
                                    <i className="bi bi-car-front-fill text-primary me-2"></i>
                                    Detalhes do Automóvel
                                </button>
                            </h2>
                            <div id="AutoInfo" className="accordion-collapse collapse" data-bs-parent="#accordionDetalhesAuto">
                                <div className="accordion-body">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-1"><strong>Marca:</strong> {automovel?.marca?.nome || 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-1"><strong>Modelo:</strong> {automovel?.modelo?.nome || 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-1"><strong>Ano/Modelo:</strong> {`${automovel?.ano_fabricacao || 'N/A'}/${automovel?.ano_modelo || 'N/A'}`}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-1"><strong>Placa:</strong> {automovel?.placa || 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-1"><strong>Cor:</strong> {automovel?.cor || 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-0"><strong>Renavam:</strong> {automovel?.renavam || 'N/A'}</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="accordion" id="accordionDetalhes">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#clienteInfo">
                                    <i className="bi bi-person-fill me-2 text-primary"></i>
                                    Informações do Comprador
                                </button>
                            </h2>
                            <div id="clienteInfo" className="accordion-collapse collapse" data-bs-parent="#accordionDetalhes">
                                <div className="accordion-body">
                                    {cliente && (
                                        <div className="col-12">
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item d-flex justify-content-between"><p className="mb-2"><strong>Nome Completo:</strong> {cliente.nome || 'N/A'}</p></li>
                                                {cliente?.fisica?.cpf &&
                                                    <li className="list-group-item d-flex justify-content-between">
                                                        {cliente?.fisica?.cpf && <p className="mb-2"><strong>CPF:</strong> {cliente?.fisica?.cpf}</p>}
                                                    </li>}
                                                {cliente?.juridica?.cnpj &&
                                                    < li className="list-group-item d-flex justify-content-between">
                                                        {cliente?.juridica?.cnpj && <p className="mb-2"><strong>CNPJ:</strong> {cliente?.juridica.cnpj}</p>}
                                                    </li>}
                                                {cliente?.juridica?.razao_social &&
                                                    <li className="list-group-item d-flex justify-content-between">
                                                        {cliente?.juridica?.razao_social && <p className="mb-2"><strong>Razão Social:</strong> {cliente?.juridica.razao_social}</p>}
                                                    </li>}
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-2"><strong>Telefone:</strong> {cliente.telefone || 'N/A'}</p>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-2"><strong>Email:</strong> {cliente.email || 'N/A'}</p>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-0"><strong>Endereço:</strong> {
                                                        enderecoInfo
                                                            ? `${enderecoInfo.logradouro}, ${enderecoInfo.bairro}, ${enderecoInfo.numero} - ${cidadeInfo?.nome || ''} (${estadoInfo?.uf || ''})`
                                                            : 'N/A'
                                                    }</p>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DetalhesVenda;