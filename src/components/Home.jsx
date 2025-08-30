import { Link } from "react-router-dom";
import Header from "./Header";
import ModalConsignacao from "./modais/ModalConsignacao";
import { useState } from "react";
import "../../public/static/style.css";
import { useAuth } from '../context/AuthContext'; // Importe o hook

const Home = () => {
    const { user } = useAuth(); // Pegue o usuário e a função de logout

    return (
        <>
            <Header />

            <div className="container py-5">
                {/* Cabeçalho da Página */}
                <div className="page-header mb-5">
                    <h1 className="display-5 fw-bold">Bem-vindo, {user.nome}!</h1>
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
                                <Link to="/listagem/manutencoes" className="btn btn-primary mt-auto">Acessar</Link>
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