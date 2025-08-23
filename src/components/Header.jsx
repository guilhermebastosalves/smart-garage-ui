import { Link, useLocation } from "react-router-dom";

const Header = () => {

    const location = useLocation();

    return (
        <>
            <nav className="navbar navbar-color">
                <div className="container-fluid mx-5">
                    <a className="navbar-brand fs-4" href="#">Smart Garage</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                        <div class="offcanvas-header">
                            <h4 class="mb-0" id="offcanvasNavbarLabel">Menu</h4>
                            <button type="button" class="btn-close mb-0" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body ">
                            <hr className="mt-0"></hr>
                            <div className="d-flex flex-column flex-shrink-0 bg-body-primary">
                                <ul className="nav nav-pills flex-column mb-auto">
                                    <li className="nav-item">
                                        <Link to="/home" className={`nav-link  ${location.pathname === '/home' ? 'active' : 'link-body-emphasis'}`} aria-current="page"> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlink:href="#home"></use></svg>
                                            <i className="bi bi-house-fill me-2"></i>Home</Link>
                                    </li>
                                    <li>
                                        <Link to="/listagem/vendas" className={`nav-link  ${location.pathname === '/listagem/vendas' ? 'active' : 'link-body-emphasis'}`} ><svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlink:href="#speedometer2"></use></svg>
                                            <i className="bi bi-cash-coin me-2"></i>Vendas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/listagem/trocas" className={`nav-link  ${location.pathname === '/listagem/trocas' ? 'active' : 'link-body-emphasis'}`} ><svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlink:href="#table"></use></svg>
                                            Trocas
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/relatorios" className={`nav-link ${location.pathname === '/relatorios' ? 'active' : 'link-body-emphasis'}`}> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlink:href="#grid"></use></svg>
                                            <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>Relatórios
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/listagem/gastos" className={`nav-link ${location.pathname === '/listagem/gastos' ? 'active' : 'link-body-emphasis'}`}> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlink:href="#people-circle"></use></svg>
                                            <i class="bi bi-safe2-fill me-2"></i>Gastos
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/listagem/compras" className={`nav-link ${location.pathname === '/listagem/compras' ? 'active' : 'link-body-emphasis'}`}> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlink:href="#people-circle"></use></svg>
                                            <i className="bi bi-cart-fill me-2"></i>Compras
                                        </Link>
                                    </li>
                                </ul>
                                <hr></hr>

                                <div>
                                    <a href="#" className="d-flex align-items-center text-dark text-decoration-none">
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        <strong>Sair</strong>
                                    </a>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </nav >
        </>
    )
}

export default Header;
