import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Mostra um indicador de carregamento enquanto verifica o usuário
        // return <div>Carregando aplicação...</div>; // Ou um componente de spinner
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        // Se não houver usuário após o loading, redireciona para o login
        return <Navigate to="/" replace />;
    }

    // Se houver usuário, renderiza a página solicitada
    return <Outlet />;
};

export default ProtectedRoute;