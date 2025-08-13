import { Link } from "react-router-dom";
import Header from "./Header";
import ModalConsignacao from "./modais/ModalConsignacao";
import { useState } from "react";
import "../../public/static/style.css";

// const Home = () => {

//     const consignacao = { negocio: "Consignacao" };

//     const [showModal, setShowModal] = useState(false);

//     return (
//         <>
//             <Header />
//             <div className="container">
//                 <div className="row g-0 mt-5">
//                     <div className="col-md-6 mb-5 teste">
//                         <h2>Bem vindo(a), Usuário!</h2>
//                     </div>
//                     <div className="col-md-6"></div>
//                 </div>
//                 <div className="row g-5 mt-3">
//                     <div className="col-md-4 mt-5 text-center">
//                         <div className="card justify-content card-color" style={{ height: '330px' }}>
//                             <div className="">
//                                 <img className="mt-4" src="/static/img/car.png" style={{ width: "64px" }}></img>
//                                 <h3 style={{ marginTop: "20px" }}>Consignação</h3>
//                                 <p className="" style={{ marginTop: "40px" }}>Cadastre um automóvel no sistema</p>
//                                 <Link to="/listagem/consignacoes" className="btn btn-primary w-75" style={{ marginTop: "50px" }}>Acessar</Link>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="col-md-4 mt-5 text-center">
//                         <div className="card justify-content card-color" style={{ height: '330px' }}>
//                             <div className="">
//                                 <img className="mt-4" src="/static/img/files.png" style={{ width: "64px" }}></img>
//                                 <h3 style={{ marginTop: "20px" }}>Estoque</h3>
//                                 <p className="" style={{ marginTop: "40px" }}>Verifique todos os automóveis disponíveis e suas informações</p>
//                                 <Link to="/estoque" className="btn btn-primary w-75" style={{ marginTop: "26px" }}>Acessar</Link>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="col-md-4 mt-5 text-center">
//                         <div className="card justify-content card-color" style={{ height: '330px' }}>
//                             <div className="">
//                                 <img className="mt-4 mb-0" src="/static/img/wrench.png" style={{ width: "64px" }}></img>
//                                 <h3 style={{ marginTop: "20px" }}>Manutenções</h3>
//                                 <p className="" style={{ marginTop: "40px" }}>Verifique quais as manuteções em andamento</p>
//                                 <button className="btn btn-primary w-75" style={{ marginTop: "50px" }}>Acessar</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <ModalConsignacao
//                     show={showModal}
//                     onHide={() => setShowModal(false)}
//                     consignacao={consignacao}
//                 />

//             </div>
//         </>
//     )
// }

// export default Home;




const Home = () => {
    return (
        <>
            <Header />
            <div className="container py-5">
                {/* Cabeçalho da Página */}
                <div className="page-header mb-5">
                    <h1 className="display-5 fw-bold">Bem-vindo, Usuário!</h1>
                    <p className="text-muted fs-5">Selecione uma das opções abaixo para começar a gerenciar sua garagem.</p>
                </div>

                {/* Grid de Cards de Ação */}
                <div className="row row-cols-1 row-cols-md-3 g-4">

                    {/* Card 1: Consignação */}
                    <div className="col">
                        <div className="card h-100 text-center p-3 card-hover" >
                            {/* Usando d-flex para alinhar o conteúdo perfeitamente */}
                            <div className="card-body d-flex flex-column">
                                <img src="/static/img/car.png" alt="Consignação" className="mx-auto mb-3" style={{ width: "64px" }} />
                                <h3 className="card-title  mb-3">Consignação</h3>
                                <p className="card-text text-muted mb-5">Cadastre um automóvel em consignação, gerencie contratos e valores.</p>
                                {/* mt-auto empurra o botão para a base do card */}
                                <Link to="/listagem/consignacoes" className="btn btn-primary mt-auto">Acessar</Link>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Estoque */}
                    <div className="col">
                        <div className="card h-100 text-center p-3 card-hover">
                            <div className="card-body d-flex flex-column">
                                <img src="/static/img/files.png" alt="Estoque" className="mx-auto mb-3" style={{ width: "64px" }} />
                                <h3 className="card-title mb-3">Estoque</h3>
                                <p className="card-text text-muted mb-5">Verifique todos os automóveis disponíveis e suas informações detalhadas.</p>
                                <Link to="/estoque" className="btn btn-primary mt-auto">Acessar</Link>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Manutenções */}
                    <div className="col">
                        <div className="card h-100 text-center p-3 card-hover">
                            <div className="card-body d-flex flex-column">
                                <img src="/static/img/wrench.png" alt="Manutenções" className="mx-auto mb-3" style={{ width: "64px" }} />
                                <h3 className="card-title h4 mb-3">Manutenções</h3>
                                <p className="card-text text-muted mb-5">Acompanhe os gastos e o andamento das manutenções dos veículos.</p>
                                <button className="btn btn-primary mt-auto">Acessar</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seus modais comentados podem ficar aqui, se precisar deles no futuro.
                     Lembre-se da dica sobre o travamento da rolagem! */}
            </div>
        </>
    );
}

export default Home;