import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import TrocaDataService from '../../services/trocaDataService';
import AutomovelDataService from '../../services/automovelDataService';
import FuncionarioDataService from '../../services/funcionarioDataService';
import EnderecoDataService from '../../services/enderecoDataService';
import CidadeDataService from '../../services/cidadeDataService';
import EstadoDataService from '../../services/estadoDataService';


const DetalhesTroca = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [detalhes, setDetalhes] = useState(null);
    const [automovelFornecido, setAutomovelFornecido] = useState(null);
    const [funcionario, setFuncionario] = useState([]);
    const [endereco, setEndereco] = useState([]);
    const [cidade, setCidade] = useState([]);
    const [estado, setEstado] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        TrocaDataService.getDetalhesById(id)
            .then(response => {
                const detalhesTroca = response.data;
                setDetalhes(detalhesTroca);

                {
                    AutomovelDataService.getDetalhesById(detalhesTroca.automovel_fornecido)
                        .then(autoResp => {
                            setAutomovelFornecido(autoResp.data);
                        })
                        .catch(e => {
                            console.error("Erro ao buscar automóvel fornecido:", e);
                            // Define um erro amigável caso o carro não seja encontrado
                            setAutomovelFornecido({ error: "Automóvel fornecido não encontrado." });
                        });
                }
            })
            .catch(e => {
                console.error("Erro ao buscar detalhes da troca:", e);
                setError("Não foi possível carregar os detalhes da troca. Tente novamente mais tarde.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

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
                    <p className="mt-2">Carregando detalhes da troca...</p>
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
                    <h4 className="alert-heading">Troca Não Encontrada</h4>
                    <p>Nenhuma informação detalhada foi encontrada para a troca com ID #{id}.</p>
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
    // const modeloDoAutomovelFornecido = automovelFornecido?.modelos?.[0];

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
                            Detalhes da Troca</h1>
                        <p className="text-muted fs-6 mt-1">Visão completa das informações da troca.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                <div className="row g-4">

                    <div className="accordion" id="accordionDetalhesTroca">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#trocaInfo">
                                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                    Informações da Troca
                                </button>
                            </h2>
                            <div id="trocaInfo" className="accordion-collapse collapse" data-bs-parent="#accordionDetalhesTroca">
                                <div className="accordion-body">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Funcionário responsável:</strong> {funcionarioNome?.nome ? funcionarioNome?.nome : "N/A"}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Data:</strong> {new Date(detalhes.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Valor de Aquisicão:</strong> <span className="text fs-6">{detalhes.valor_aquisicao ? formatter.format(detalhes.valor_aquisicao) : "N/A "}</span></p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Valor de Diferença:</strong> <span className="text fs-6">{((detalhes.valor) >= 0) ? formatter.format(detalhes.valor) : (formatter.format(detalhes.valor) + " (Valor cedido)")}</span></p>
                                        </li>
                                        {((detalhes.valor) > 0) &&
                                            <li className="list-group-item d-flex justify-content-between">
                                                <p className="mb-2"><strong>Forma de Pagamento:</strong> <span className="text  fs-6">{detalhes.forma_pagamento ? detalhes.forma_pagamento : "N/A"}</span></p>
                                            </li>
                                        }
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Comissão:</strong> <span className="text fs-6">{formatter.format(detalhes.comissao)}</span></p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="accordion" id="accordionDetalhesAutoFor">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#AutoForInfo">
                                    <i className="bi bi-car-front-fill text-primary me-2"></i>
                                    Detalhes do Automóvel Fornecido
                                </button>
                            </h2>
                            <div id="AutoForInfo" className="accordion-collapse collapse" data-bs-parent="#accordionDetalhesAutoFor">
                                <div className="accordion-body">
                                    {automovelFornecido ? (
                                        automovelFornecido.error ? (
                                            <div className="alert alert-danger p-2">{automovelFornecido.error}</div>
                                        ) : (
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-2"><strong>Marca:</strong> {automovelFornecido.marca?.nome || 'N/A'}</p>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-2"><strong>Modelo:</strong> {automovelFornecido?.modelo?.nome || 'N/A'}</p>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-2"><strong>Ano/Modelo:</strong> {`${automovelFornecido.ano_fabricacao || 'N/A'}/${automovelFornecido.ano_modelo || 'N/A'}`}</p>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-2"><strong>Placa:</strong> {automovelFornecido.placa || 'N/A'}</p>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-2"><strong>Cor:</strong> {automovelFornecido?.cor || 'N/A'}</p>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between">
                                                    <p className="mb-0"><strong>Renavam:</strong> {automovelFornecido.renavam || 'N/A'}</p>
                                                </li>
                                            </ul>
                                        )
                                    ) : (
                                        <p className="text-muted">Nenhum automóvel foi fornecido nesta troca.</p>
                                    )}

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="accordion" id="accordionDetalhesAutoRec">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#AutoRecInfo">
                                    <i className="bi bi-car-front-fill text-primary me-2"></i>
                                    Detalhes do Automóvel Recebido
                                </button>
                            </h2>
                            <div id="AutoRecInfo" className="accordion-collapse collapse" data-bs-parent="#accordionDetalhesAutoRec">
                                <div className="accordion-body">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Marca:</strong> {automovel?.marca?.nome || 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Modelo:</strong> {automovel?.modelo?.nome || 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Ano/Modelo:</strong> {`${automovel?.ano_fabricacao || 'N/A'}/${automovel?.ano_modelo || 'N/A'}`}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Placa:</strong> {automovel?.placa || 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Cor:</strong> {automovel?.cor || 'N/A'}</p>
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
                                    Informações do Fornecedor
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

export default DetalhesTroca;