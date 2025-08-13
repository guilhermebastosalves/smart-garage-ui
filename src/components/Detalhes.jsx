import { useEffect } from "react";
import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import AutomovelDataService from "../services/automovelDataService";
import React from "react";
import { useCallback, useState } from "react";

const Detalhes = () => {

    const { id } = useParams();
    const [automovel, setAutomovel] = useState({});
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const consulta = useCallback(() => {
        AutomovelDataService.getById(id)
            .then(response => {
                setAutomovel(response.data);
            }).catch(e => {
                console.log("Erro ao buscar automóvel:", e);
                // Opcional: redirecionar para uma página de erro ou estoque
                // navigate('/estoque');
            }).finally(() => {
                setLoading(false);
            });
    }, [id, navigate]);

    useEffect(() => {
        consulta();
    }, [consulta]);


    if (loading) {
        return (
            <>
                <Header />
                <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando Detalhes...</span>
                    </div>
                </div>
            </>
        );
    }

    if (!automovel) {
        return (
            <>
                <Header />
                <div className="container py-5 text-center">
                    <h2>Veículo não encontrado</h2>
                    <p>O veículo que você está procurando não existe ou foi removido.</p>
                    <Link to="/estoque" className="btn btn-primary">Voltar ao Estoque</Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container py-5">
                <div className="row">
                    {/* Coluna da Imagem */}
                    <div className="col-lg-7">
                        <img
                            src={automovel.imageUrl || '/fotos/gol.jpg'}
                            alt="Imagem do Veículo"
                            className="img-fluid rounded shadow-lg w-100"
                            style={{ objectFit: 'cover', maxHeight: '500px' }}
                        />
                    </div>

                    {/* Coluna das Informações */}
                    <div className="col-lg-5">
                        <div className="p-3">
                            <h1 className="display-5 fw-bold">{`Volkswagen Gol`}</h1> {/* Exemplo, idealmente viria do DB */}
                            <p className="lead text-muted">ID do Veículo: {automovel && automovel.id}</p>

                            <h2 className="text-primary my-4">{automovel && automovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</h2>

                            <dl className="row">
                                <dt className="col-sm-4">Ano/Modelo</dt>
                                <dd className="col-sm-8">{automovel && automovel.ano_fabricacao} / {automovel && automovel.ano_modelo}</dd>

                                <dt className="col-sm-4">Cor</dt>
                                <dd className="col-sm-8">{automovel && automovel.cor}</dd>

                                <dt className="col-sm-4">Placa</dt>
                                <dd className="col-sm-8">{automovel && automovel.placa}</dd>

                                <dt className="col-sm-4">KM</dt>
                                <dd className="col-sm-8">{automovel && automovel.quilometragem} km</dd>
                            </dl>

                            <hr />

                            {/* Botões de Ação */}
                            <div className="d-grid gap-2 d-md-flex justify-content-md-start mt-4">
                                <button onClick={() => navigate(`/editar-automovel/${automovel.id}`)} className="btn btn-primary btn-lg px-4 me-md-2">
                                    <i className="bi bi-pencil-fill me-2"></i>Editar
                                </button>
                                <button className="btn btn-outline-secondary btn-lg px-4 me-md-2">
                                    <i className="bi bi-tag-fill me-2"></i>Vender
                                </button>
                                <button onClick={() => navigate(`/estoque`)} className="btn btn-outline-secondary btn-lg px-4">
                                    <i class="bi bi-arrow-return-left me-2"></i>Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}



//     const editarAutomovel = (id) => {
//         navigate(`/editar-automovel/${id}`);
//     }

//     return (
//         <>
//             <Header />
//             <div>
//                 <h1>Detalhes</h1>
//                 <p>Esta é a página de detalhes.</p>
//             </div>
//             <div>
//                 {automovel &&
//                     (
//                         <div className="col-md-4">
//                             <div key={automovel.id} className="card mt-5" style={{ height: "350px" }}>
//                                 <img src="/fotos/gol.jpg" className="card-img-top p-1" style={{ height: "200px" }} />
//                                 <div className="card-body">
//                                     <div className="row">
//                                         <h5 className="card-title">{automovel.valor}</h5>
//                                         <p className="card-text">{automovel.cor}</p>
//                                         <div className="col-md-6">
//                                             <p className="card-text">{automovel.ano_fabricacao}</p>
//                                         </div>
//                                         <div className="col-md-6">
//                                             <button onClick={() => { editarAutomovel(automovel.id) }} className="btn btn-secondary">Editar informações</button>                                        </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )

//                 }
//             </div>
//         </>
//     );
// }

export default Detalhes; 