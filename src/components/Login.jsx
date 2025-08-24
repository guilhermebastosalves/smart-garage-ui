// src/pages/Login.jsx

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
        <div className="container-fluid d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body p-5">
                    <h2 className="card-title text-center fw-bold mb-4">Smart Garage</h2>

                    {erro && (
                        <div className="alert alert-danger">{erro}</div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label htmlFor="usuario" className="form-label">Usuário</label>
                            <input
                                type="text"
                                className="form-control"
                                id="usuario"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="senha" className="form-label">Senha</label>
                            <input
                                type="password"
                                className="form-control"
                                id="senha"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;