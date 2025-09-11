// Importe os ícones que vamos usar
import { FaCar, FaUserAlt, FaLock } from 'react-icons/fa';
import { InputGroup, Form } from 'react-bootstrap'; // Importe os componentes do react-bootstrap se ainda não o fez

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authDataService';
import { useAuth } from '../context/AuthContext'; // <-- Importe o hook

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // <-- Use o hook para pegar a função de login

    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            const response = await AuthService.login({ usuario, senha });

            if (response?.data.token) {
                // Salva o token no localStorage
                localStorage.setItem("user_token", response?.data.token);

                // AGORA CHAMAMOS A FUNÇÃO DE LOGIN DO CONTEXTO
                login(response.data.token);

                // Redireciona para a página principal (ou um dashboard)
                navigate('/home'); // Ou para a página que você desejar
            }
        } catch (error) {
            const mensagemErro = error.response?.data?.mensagem || "Erro ao tentar fazer login.";
            setErro(mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    return (


        // MELHORIA: Wrapper com a classe do gradiente
        <div className="login-page-wrapper">
            {/* MELHORIA: Adicionada classe de animação e removido estilo inline */}
            <div className="card shadow-lg border-0 login-card-animated" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="card-body p-5">

                    {/* MELHORIA: Cabeçalho com identidade visual */}
                    <div className={`text-center ${!erro ? "mb-5" : "mb-2"}`}>
                        {/* <FaCar size="3em" className="text-primary mb-3" /> */}
                        <img src="/static/img/logoapenas.png" alt="Smart Garage Logo" className="navbar-logo mb-1" />
                        <h1 className="fw-bold">Smart Garage</h1>
                        <p className="text-muted">Faça login para continuar</p>
                    </div>

                    {erro && (
                        // MELHORIA: Margem inferior para espaçamento
                        // <div className="alert alert-danger mb-4">{erro}</div>
                        <div className='d-flex align-items-center mb-3 container'>
                            <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                            <div className="text text-danger">{erro}</div>
                        </div>

                    )}

                    <form onSubmit={handleLogin}>
                        {/* MELHORIA: Input com ícone para clareza */}
                        <InputGroup className="mb-3">
                            <InputGroup.Text><FaUserAlt /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Nome de usuário"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                            />
                        </InputGroup>

                        {/* MELHORIA: Input com ícone para clareza */}
                        <InputGroup className="mb-4">
                            <InputGroup.Text><FaLock /></InputGroup.Text>
                            <Form.Control
                                type="password"
                                placeholder="Senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </InputGroup>

                        <div className="d-grid mb-3">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </div>

                        {/* MELHORIA: Link de "Esqueci a senha" (visual, sem lógica) */}
                        <div className="text-center">
                            <a href="#" className="text-decoration-none small">Esqueceu a senha?</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;