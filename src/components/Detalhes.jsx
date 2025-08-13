import { useEffect } from "react";
import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import AutomovelDataService from "../services/automovelDataService";
import React from "react";
import { useCallback } from "react";

const Detalhes = () => {

    const { id } = useParams();
    const [automovel, setAutomovel] = React.useState({});

    const navigate = useNavigate();


    const consulta = useCallback(() => {
        AutomovelDataService.getById(id)
            .then(response => {
                setAutomovel(response.data);
            }).catch(e => {
                console.log("Erro ao buscar automóvel:", e);
            })
    });

    useEffect(() => {
        consulta();
    }, [consulta]);

    const editarAutomovel = (id) => {
        navigate(`/editar-automovel/${id}`);
    }

    return (
        <>
            <Header />
            <div>
                <h1>Detalhes</h1>
                <p>Esta é a página de detalhes.</p>
            </div>
            <div>
                {automovel &&
                    (
                        <div className="col-md-4">
                            <div key={automovel.id} className="card mt-5" style={{ height: "350px" }}>
                                <img src="/fotos/gol.jpg" className="card-img-top p-1" style={{ height: "200px" }} />
                                <div className="card-body">
                                    <div className="row">
                                        <h5 className="card-title">{automovel.valor}</h5>
                                        <p className="card-text">{automovel.cor}</p>
                                        <div className="col-md-6">
                                            <p className="card-text">{automovel.ano_fabricacao}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <button onClick={() => { editarAutomovel(automovel.id) }} className="btn btn-secondary">Editar informações</button>                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )

                }
            </div>
        </>
    );
}

export default Detalhes; 