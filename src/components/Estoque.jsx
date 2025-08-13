import Header from "./Header";
import Data from "../Data.json";
import { useState } from "react";
import React from "react";
import { useEffect, useCallback } from "react";
import AutomovelDataService from "../services/automovelDataService";
import MarcaDataService from "../services/marcaDataService";
import ModeloDataService from "../services/modeloDataService";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Estoque = () => {

    const navigate = useNavigate();

    const [automovel, setAutomovel] = React.useState([]);
    const [marca, setMarca] = React.useState([]);
    const [modelo, setModelo] = React.useState([]);


    // useCallback garante que retrieveArtigos não mude em cada renderização, a menos que seja necessário
    const retrieveAutomovel = useCallback(() => {
        AutomovelDataService.getAll()
            .then(response => {
                setAutomovel(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar automóveis:", e);
            });
    }, []); // Matriz de dependência vazia significa que esta função é criada uma vez

    // Execute retrieveAutomovel quando o componente for montado
    useEffect(() => {
        retrieveAutomovel();
    }, [retrieveAutomovel]); // Depende do retrieveAutomovel memorizado


    const retrieveMarca = useCallback(() => {
        MarcaDataService.getAll()
            .then(response => {
                setMarca(response.data);
                // console.log("Marcas carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar marcas:", e);
            });
    }, []);

    useEffect(() => {
        retrieveMarca();
    }, [retrieveMarca]);


    const retrieveModelo = useCallback(() => {
        ModeloDataService.getAll()
            .then(response => {
                setModelo(response.data);
                // console.log("Modelos carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar modelos:", e);
            });
    }, []);

    useEffect(() => {
        retrieveModelo();
    }, [retrieveModelo]);

    const [search, setSearch] = React.useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 3;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const records = automovel.slice(firstIndex, lastIndex);
    const npage = Math.ceil(automovel.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const modelo_filtrado = modelo.filter((auto) => auto.nome.toLowerCase().includes(search.toLowerCase()));
    const modelo_filtrado_slice = modelo_filtrado.slice(firstIndex, lastIndex);
    const npage_filtrado = Math.ceil(modelo_filtrado.length / recordsPerPage);
    const numbers_filtrado = [...Array(npage_filtrado + 1).keys()].slice(1);


    function nextPage() {
        if (currentPage !== npage) {
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

    const detalhesAutomovel = (id) => {
        navigate('/detalhes/' + id);
    }


    return (
        <>
            <Header />
            <div className="col-md-12">
                <h1>Estoque</h1>
                <p>Esta é a página de estoque.</p>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-md-10 mb-0 mt-4">
                        <Link to="/cadastro/automoveis" className="btn btn-success">Cadastrar</Link>
                    </div>
                    <div className="col-md-2 mb-0 mt-4">
                        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    {
                        search === "" ? (
                            <>
                                {records.map((d, i) => {
                                    const nomeModelo = modelo.find(modelo => modelo.marcaId === d.marcaId);
                                    const nomeMarca = marca.find(marca => marca.id === d.marcaId);

                                    return (
                                        <div className="col-md-4">
                                            <div key={d.id} className="card mt-5" style={{ height: "350px" }}>
                                                <img src="/fotos/gol.jpg" className="card-img-top p-1" style={{ height: "200px" }} />
                                                <div className="card-body">
                                                    <div className="row">
                                                        <h5 className="card-title">{nomeModelo ? nomeModelo.nome : ""}</h5>
                                                        <p className="card-text">{nomeMarca ? nomeMarca.nome : ""}</p>
                                                        <div className="col-md-6">
                                                            <p className="card-text">{d.ano_fabricacao}</p>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <button onClick={() => { detalhesAutomovel(d.id) }} className="btn btn-primary ms-4">Mais informações</button>

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );

                                })}

                                <nav className="col-md-8 mt-3"></nav>
                                <nav className="mt-3 col-md-4">
                                    <ul className="pagination">
                                        <li className="page-item">
                                            <span className="page-link pointer" href="#" onClick={prePage}>
                                                Previous</span>
                                        </li>
                                        {
                                            numbers.map((n, i) => (
                                                <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                        {n}</span>
                                                </li>
                                            ))
                                        }
                                        <li className="page-item">
                                            <span className="page-link pointer" href="#" onClick={nextPage}>
                                                Next
                                            </span>
                                        </li>
                                    </ul>
                                </nav>

                            </>
                        )
                            : (
                                <>
                                    {
                                        modelo_filtrado_slice.length > 0 ? (
                                            <>

                                                {modelo_filtrado_slice.map((d, i) => {
                                                    const nomeModelo = modelo.find(modelo => modelo.marcaId === d.marcaId).nome;
                                                    const nomeMarca = marca.find(marca => marca.id === d.marcaId).nome;
                                                    const anoAuto = automovel.find(auto => auto.marcaId === d.id);

                                                    return (
                                                        <div className="col-md-4">
                                                            <div className="card mt-5" style={{ height: "350px" }}>
                                                                <img src="/fotos/gol.jpg" className="card-img-top p-1" style={{ height: "200px" }} />
                                                                <div className="card-body">
                                                                    <div className="row">
                                                                        <h5 className="card-title">{nomeModelo}</h5>
                                                                        <p className="card-text">{nomeMarca}</p>
                                                                        <div className="col-md-6">
                                                                            <p className="card-text">{anoAuto && anoAuto.ano_fabricacao}</p>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <button className="btn btn-primary ms-4">Mais informações</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                <nav className="col-md-9 mt-3"></nav>
                                                <nav className="mt-3 col-md-3">
                                                    <ul className="pagination">
                                                        <li className="page-item">
                                                            <span className="page-link pointer" href="#" onClick={prePage}>
                                                                Previous</span>
                                                        </li>
                                                        {
                                                            numbers_filtrado.map((n, i) => (
                                                                <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
                                                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                                                        {n}</span>
                                                                </li>
                                                            ))
                                                        }
                                                        <li className="page-item">
                                                            <span className="page-link pointer" href="#" onClick={nextPage}>
                                                                Next
                                                            </span>
                                                        </li>
                                                    </ul>
                                                </nav>

                                            </>
                                        )
                                            : (
                                                <>
                                                    <div className="col-md-12">
                                                        <p>Sem registros!</p>
                                                    </div>
                                                </>
                                            )
                                    }


                                </>
                            )
                    }

                    {/* <nav className="col-md-9 mt-3"></nav>
                    <nav className="mt-3 col-md-3">
                        <ul className="pagination">
                            <li className="page-item">
                                <span className="page-link pointer" href="#" onClick={prePage}>
                                    Previous</span>
                            </li>
                            {
                                numbers.map((n, i) => (
                                    <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
                                        <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
                                            {n}</span>
                                    </li>
                                ))
                            }
                            <li className="page-item">
                                <span className="page-link pointer" href="#" onClick={nextPage}>
                                    Next
                                </span>
                            </li>
                        </ul>
                    </nav> */}
                </div>
            </div>

        </>
    )
}

export default Estoque;