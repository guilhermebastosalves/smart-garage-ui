import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import CompraDataService from '../../services/compraDataService';

const DetalhesCompra = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [detalhes, setDetalhes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        CompraDataService.getDetalhesById(id)
            .then(response => {
                setDetalhes(response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar detalhes da compra:", e);
                setError("Não foi possível carregar os detalhes da compra. Tente novamente mais tarde.");
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
                    <p className="mt-2">Carregando detalhes da compra...</p>
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
                    <h4 className="alert-heading">Compra Não Encontrada</h4>
                    <p>Nenhuma informação detalhada foi encontrada para a compra com ID #{id}.</p>
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
    const modeloDoAutomovel = automovel?.modelos?.[0]; // Pega o primeiro modelo

    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
                {/* Título da Página e Botão Voltar */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h1 className="fw-bold mb-0 text-primary">
                            <i className="bi bi-file-earmark-text me-3"></i>
                            Detalhes da Compra</h1>
                        <p className="text-muted fs-6 mt-1">Visão completa das informações da compra.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                <div className="row g-4">
                    {/* Card de Informações da Compra */}
                    <div className="col-lg-6 col-md-12">
                        <div className="card shadow-sm h-100 border-start border-secondary border-4">
                            <div className="card-header bg-light d-flex align-items-center">
                                <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                <h5 className="mb-0 fw-bold">Detalhes da Operação</h5>
                            </div>
                            <div className="card-body">
                                <p className="mb-2"><strong>ID da Troca:</strong> {detalhes.id}</p>
                                <p className="mb-2"><strong>Data:</strong> {new Date(detalhes.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                <p className="mb-2"><strong>Valor:</strong> <span className="text fw-bold fs-6">{formatter.format(detalhes.valor)}</span></p>
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
                                <p className="mb-2"><strong>Modelo:</strong> {modeloDoAutomovel?.nome || 'N/A'}</p>
                                <p className="mb-2"><strong>Ano/Modelo:</strong> {`${automovel?.ano_fabricacao || 'N/A'}/${automovel?.ano_modelo || 'N/A'}`}</p>
                                <p className="mb-2"><strong>Placa:</strong> {automovel?.placa || 'N/A'}</p>
                                <p className="mb-2"><strong>Cor:</strong> {automovel?.cor || 'N/A'}</p>
                                <p className="mb-0"><strong>Renavam:</strong> {automovel?.renavam || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card de Informações do Consignante */}
                    {cliente && (
                        <div className="col-12">
                            <div className="card shadow-sm border-start border-secondary border-4">
                                <div className="card-header bg-light d-flex align-items-center">
                                    <i className="bi bi-person-fill text-primary me-2"></i>
                                    <h5 className="mb-0 fw-bold">Informações do Fornecedor (Cliente)</h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2"><strong>Nome Completo:</strong> {cliente.nome || 'N/A'}</p>
                                    {cliente?.fisica?.cpf && <p className="mb-2"><strong>CPF:</strong> {cliente?.fisica?.cpf}</p>}
                                    {cliente?.juridica?.cnpj && <p className="mb-2"><strong>CNPJ:</strong> {cliente?.juridica.cnpj}</p>}
                                    {cliente?.juridica?.razao_social && <p className="mb-2"><strong>Razão Social:</strong> {cliente?.juridica.razao_social}</p>}
                                    <p className="mb-2"><strong>Telefone:</strong> {cliente.telefone || 'N/A'}</p>
                                    <p className="mb-0"><strong>Email:</strong> {cliente.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DetalhesCompra;