import Header from "./Header";
import { useState } from "react";
import { useMemo } from "react";
import React from "react";
import { useEffect } from "react";
import AutomovelDataService from "../services/automovelDataService";
import MarcaDataService from "../services/marcaDataService";
import ModeloDataService from "../services/modeloDataService";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Estoque = () => {

    const navigate = useNavigate();

    const [automovel, setAutomovel] = useState([]);
    const [marca, setMarca] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Carrega todos os dados em paralelo para melhor performance
        Promise.all([
            AutomovelDataService.getAll(),
            MarcaDataService.getAll(),
            ModeloDataService.getAll(),
        ]).then(([automoveisRes, marcasRes, modelosRes]) => {
            setAutomovel(automoveisRes.data);
            setMarca(marcasRes.data);
            setModelo(modelosRes.data);
        }).catch(e => {
            console.error("Erro ao carregar dados do estoque:", e);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const [search, setSearch] = useState("");

    // Hook 'useMemo' para calcular a lista filtrada de forma eficiente
    const automoveisFiltrados = useMemo(() => {
        if (!search) return automovel;

        return automovel.filter(auto => {
            const modelo2 = modelo.find(m => m.id === auto.modeloId);
            const marca2 = marca.find(m => m.id === auto.marcaId);
            const searchTerm = search.toLowerCase();

            return (
                modelo2?.nome.toLowerCase().includes(searchTerm) ||
                marca2?.nome.toLowerCase().includes(searchTerm) ||
                auto.ano_fabricacao.toString().includes(searchTerm)
            );
        });
    }, [search, automovel, modelo, marca]);


    // Lógica de Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const records = automoveisFiltrados.slice(firstIndex, lastIndex);
    const npage = Math.ceil(automoveisFiltrados.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage !== 1) setCurrentPage(currentPage - 1) };
    const nextPage = () => { if (currentPage !== npage) setCurrentPage(currentPage + 1) };


    //const [currentPage, setCurrentPage] = useState(1);
    //const recordsPerPage = 3;
    // const lastIndex = currentPage * recordsPerPage;
    // const firstIndex = lastIndex - recordsPerPage;
    // const records = automovel.slice(firstIndex, lastIndex);
    // const npage = Math.ceil(automovel.length / recordsPerPage);
    // const numbers = [...Array(npage + 1).keys()].slice(1);

    // const modelo_filtrado = modelo.filter((auto) => auto.nome.toLowerCase().includes(search.toLowerCase()));
    // const modelo_filtrado_slice = modelo_filtrado.slice(firstIndex, lastIndex);
    // const npage_filtrado = Math.ceil(modelo_filtrado.length / recordsPerPage);
    // const numbers_filtrado = [...Array(npage_filtrado + 1).keys()].slice(1);


    // function nextPage() {
    //     if (currentPage !== npage) {
    //         setCurrentPage(currentPage + 1)
    //     }
    // }

    // function prePage() {
    //     if (currentPage !== 1) {
    //         setCurrentPage(currentPage - 1)
    //     }
    // }

    // function changeCPage(id) {
    //     setCurrentPage(id)
    // }

    const detalhesAutomovel = (id) => {
        navigate('/detalhes/' + id);
    }


    const renderContent = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            );
        }

        if (records.length === 0) {
            return (
                <div className="col-12 text-center p-5">
                    <i className="bi bi-search" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                    <h4 className="mt-3">Nenhum veículo encontrado</h4>
                    <p className="text-muted">Tente ajustar os termos da sua busca ou adicione um novo veículo ao estoque.</p>
                </div>
            );
        }

        return (
            <>
                {records.map((auto) => {
                    const modelo2 = modelo.find(m => m.marcaId === auto.marcaId);
                    const marca2 = marca.find(m => m.id === auto.marcaId);

                    return (
                        <div key={auto.id} className="col">
                            <div className="card h-100 card-hover">
                                {/* Imagem do Carro */}
                                <img src={auto.imageUrl || "/fotos/gol.jpg"} className="card-img-top car-image" alt={`${marca2?.nome} ${modelo2?.nome}`} />

                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title">{marca2?.nome} {modelo2?.nome}</h5>
                                    <p className="card-text text-muted">{auto.ano_fabricacao} &bull; {auto.cor}</p>
                                    <h4 className="mb-3">
                                        {auto.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </h4>
                                    <button onClick={() => navigate(`/detalhes/${auto.id}`)} className="btn btn-primary mt-auto">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

    return (
        <>
            <Header />
            <div className="container py-5">
                {/* Cabeçalho da Página */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold mb-0">Estoque de Veículos</h1>
                        <p className="text-muted">Consulte e gerencie todos os veículos disponíveis.</p>
                    </div>
                    <div className="d-flex align-items-center">
                        <input
                            type="search"
                            className="form-control me-2"
                            placeholder="Buscar por modelo, marca, ano..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Link to="/cadastro/automoveis" className="btn btn-success flex-shrink-0">
                            <i className="bi bi-plus-circle-fill me-2"></i> Cadastrar
                        </Link>
                    </div>
                </div>

                {/* Grid de Conteúdo */}
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {renderContent()}
                </div>

                {/* Paginação */}
                {!loading && records.length > 0 && npage > 1 && (
                    <nav className="d-flex justify-content-center mt-5">
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={prePage}>Anterior</button>
                            </li>
                            {numbers.map((n) => (
                                <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                                    <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>{n}</span>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
                                <span className="page-link pointer" href="#" onClick={nextPage}>Próximo</span>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </>
    );
}




//     return (
//         <>
//             <Header />
//             <div className="col-md-12">
//                 <h1>Estoque</h1>
//                 <p>Esta é a página de estoque.</p>
//             </div>
//             <div className="container">
//                 <div className="row">
//                     <div className="col-md-10 mb-0 mt-4">
//                         <Link to="/cadastro/automoveis" className="btn btn-success">Cadastrar</Link>
//                     </div>
//                     <div className="col-md-2 mb-0 mt-4">
//                         <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
//                     </div>

//                     {
//                         search === "" ? (
//                             <>
//                                 {records.map((d, i) => {
//                                     const nomeModelo = modelo.find(modelo => modelo.marcaId === d.marcaId);
//                                     const nomeMarca = marca.find(marca => marca.id === d.marcaId);

//                                     return (
//                                         <div className="col-md-4">
//                                             <div key={d.id} className="card mt-5" style={{ height: "350px" }}>
//                                                 <img src="/fotos/gol.jpg" className="card-img-top p-1" style={{ height: "200px" }} />
//                                                 <div className="card-body">
//                                                     <div className="row">
//                                                         <h5 className="card-title">{nomeModelo ? nomeModelo.nome : ""}</h5>
//                                                         <p className="card-text">{nomeMarca ? nomeMarca.nome : ""}</p>
//                                                         <div className="col-md-6">
//                                                             <p className="card-text">{d.ano_fabricacao}</p>
//                                                         </div>
//                                                         <div className="col-md-6">
//                                                             <button onClick={() => { detalhesAutomovel(d.id) }} className="btn btn-primary ms-4">Mais informações</button>

//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     );

//                                 })}

//                                 <nav className="col-md-8 mt-3"></nav>
//                                 <nav className="mt-3 col-md-4">
//                                     <ul className="pagination">
//                                         <li className="page-item">
//                                             <span className="page-link pointer" href="#" onClick={prePage}>
//                                                 Previous</span>
//                                         </li>
//                                         {
//                                             numbers.map((n, i) => (
//                                                 <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
//                                                     <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
//                                                         {n}</span>
//                                                 </li>
//                                             ))
//                                         }
//                                         <li className="page-item">
//                                             <span className="page-link pointer" href="#" onClick={nextPage}>
//                                                 Next
//                                             </span>
//                                         </li>
//                                     </ul>
//                                 </nav>

//                             </>
//                         )
//                             : (
//                                 <>
//                                     {
//                                         modelo_filtrado_slice.length > 0 ? (
//                                             <>

//                                                 {modelo_filtrado_slice.map((d, i) => {
//                                                     const nomeModelo = modelo.find(modelo => modelo.marcaId === d.marcaId).nome;
//                                                     const nomeMarca = marca.find(marca => marca.id === d.marcaId).nome;
//                                                     const anoAuto = automovel.find(auto => auto.marcaId === d.id);

//                                                     return (
//                                                         <div className="col-md-4">
//                                                             <div className="card mt-5" style={{ height: "350px" }}>
//                                                                 <img src="/fotos/gol.jpg" className="card-img-top p-1" style={{ height: "200px" }} />
//                                                                 <div className="card-body">
//                                                                     <div className="row">
//                                                                         <h5 className="card-title">{nomeModelo}</h5>
//                                                                         <p className="card-text">{nomeMarca}</p>
//                                                                         <div className="col-md-6">
//                                                                             <p className="card-text">{anoAuto && anoAuto.ano_fabricacao}</p>
//                                                                         </div>
//                                                                         <div className="col-md-6">
//                                                                             <button className="btn btn-primary ms-4">Mais informações</button>
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     );
//                                                 })}

//                                                 <nav className="col-md-9 mt-3"></nav>
//                                                 <nav className="mt-3 col-md-3">
//                                                     <ul className="pagination">
//                                                         <li className="page-item">
//                                                             <span className="page-link pointer" href="#" onClick={prePage}>
//                                                                 Previous</span>
//                                                         </li>
//                                                         {
//                                                             numbers_filtrado.map((n, i) => (
//                                                                 <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
//                                                                     <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
//                                                                         {n}</span>
//                                                                 </li>
//                                                             ))
//                                                         }
//                                                         <li className="page-item">
//                                                             <span className="page-link pointer" href="#" onClick={nextPage}>
//                                                                 Next
//                                                             </span>
//                                                         </li>
//                                                     </ul>
//                                                 </nav>

//                                             </>
//                                         )
//                                             : (
//                                                 <>
//                                                     <div className="col-md-12">
//                                                         <p>Sem registros!</p>
//                                                     </div>
//                                                 </>
//                                             )
//                                     }


//                                 </>
//                             )
//                     }

//                     {/* <nav className="col-md-9 mt-3"></nav>
//                     <nav className="mt-3 col-md-3">
//                         <ul className="pagination">
//                             <li className="page-item">
//                                 <span className="page-link pointer" href="#" onClick={prePage}>
//                                     Previous</span>
//                             </li>
//                             {
//                                 numbers.map((n, i) => (
//                                     <li className={`page-item ${currentPage === n ? "active" : ""}`} key={i}>
//                                         <span className="page-link pointer" href="#" onClick={() => changeCPage(n)}>
//                                             {n}</span>
//                                     </li>
//                                 ))
//                             }
//                             <li className="page-item">
//                                 <span className="page-link pointer" href="#" onClick={nextPage}>
//                                     Next
//                                 </span>
//                             </li>
//                         </ul>
//                     </nav> */}
//                 </div>
//             </div>

//         </>
//     )
// }

export default Estoque;