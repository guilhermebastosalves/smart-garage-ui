import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import ManutencaoDataService from '../../services/manutencaoDataService';

const DetalhesManutencao = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [detalhes, setDetalhes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        ManutencaoDataService.getDetalhesById(id)
            .then(response => {
                setDetalhes(response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar detalhes da manutenção:", e);
                setError("Não foi possível carregar os detalhes da manutenção. Tente novamente mais tarde.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando detalhes...</span>
                    </div>
                    <p className="mt-2">Carregando detalhes da manutenção...</p>
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
                    <h4 className="alert-heading">Manutencao Não Encontrada</h4>
                    <p>Nenhuma informação detalhada foi encontrada para a manutenção com ID #{id}.</p>
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

    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
                {/* Título da Página e Botão Voltar */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h1 className="fw-bold mb-0 text-primary">
                            <i className="bi bi-file-earmark-text me-3"></i>
                            Detalhes da Manutenção</h1>
                        <p className="text-muted fs-6 mt-1">Visão completa das informações sobre a manutenção.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                <div className="row g-4">
                    {/* Card de Informações da Venda */}
                    <div className="col-lg-6 col-md-12">
                        <div className="card shadow-sm h-100 border-start border-secondary border-4">
                            <div className="card-header bg-light d-flex align-items-center">
                                <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                <h5 className="mb-0 fw-bold">Detalhes da Operação</h5>
                            </div>
                            <div className="card-body">
                                <p className="mb-2"><strong>ID da Manutenção:</strong> {detalhes.id}</p>
                                <p className="mb-2"><strong>Data de Envio:</strong> {detalhes?.data_envio ? new Date(detalhes?.data_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                                <p className="mb-2"><strong>Data de Retorno:</strong> {detalhes?.data_retorno ? new Date(detalhes?.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                                <p className="mb-2"><strong>Valor:</strong> <span className="text fs-6">{formatter.format(detalhes.valor)}</span></p>
                                <p className="mb-2"><strong>Descrição:</strong> <span className="text fs-6">{detalhes.descricao}</span></p>
                                <p className="mb-0">
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card de Detalhes do Automóvel */}
                    <div className="col-lg-6 col-md-12">
                        <div className="card shadow-sm h-100 border-start border-secondary border-4">
                            <div className="card-header bg-light d-flex align-items-center">
                                <i className="bi bi-car-front-fill text-primary me-2"></i>
                                <h5 className="mb-0 fw-bold">Detalhes do Automóvel</h5>
                            </div>
                            <div className="card-body">
                                <p className="mb-2"><strong>Marca:</strong> {automovel?.marca?.nome || 'N/A'}</p>
                                <p className="mb-2"><strong>Modelo:</strong> {automovel?.modelo?.nome || 'N/A'}</p>
                                <p className="mb-2"><strong>Ano/Modelo:</strong> {`${automovel?.ano_fabricacao || 'N/A'}/${automovel?.ano_modelo || 'N/A'}`}</p>
                                <p className="mb-2"><strong>Placa:</strong> {automovel?.placa || 'N/A'}</p>
                                <p className="mb-2"><strong>Cor:</strong> {automovel?.cor || 'N/A'}</p>
                                <p className="mb-0"><strong>Renavam:</strong> {automovel?.renavam || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default DetalhesManutencao;