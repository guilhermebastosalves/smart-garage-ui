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

    const { automovel, cliente } = detalhes;

    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
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


                    <div className="accordion" id="accordionManu">
                        <div className="accordion-item">
                            <h2 className="accordion-header">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#manuInfo">
                                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                    Informações da Manutenção
                                </button>
                            </h2>
                            <div id="manuInfo" className="accordion-collapse collapse" data-bs-parent="#accordionManu">
                                <div className="accordion-body">
                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Data de Envio:</strong> {detalhes?.data_envio ? new Date(detalhes?.data_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Data de Retorno:</strong> {detalhes?.data_retorno ? new Date(detalhes?.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Valor:</strong> <span className="text fs-6">{formatter.format(detalhes.valor)}</span></p>
                                        </li>
                                        <li className="list-group-item d-flex justify-content-between">
                                            <p className="mb-2"><strong>Descrição:</strong> <span className="text fs-6 descricao-gasto">{detalhes.descricao}</span></p>
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
                </div>
            </div>
        </>
    );
};

export default DetalhesManutencao;