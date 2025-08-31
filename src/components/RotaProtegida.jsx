import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// A função agora aceita uma prop `allowedRoles` que será um array de strings
const ProtectedRoute = ({ allowedRoles }) => {
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

    // --- NOVA LÓGICA DE VERIFICAÇÃO DE CARGO ---
    // Se 'allowedRoles' foi passado e o cargo do usuário não está na lista,
    // redireciona para uma página segura (como a home).
    // if (allowedRoles && !allowedRoles.includes(user.role)) {
    //     // O usuário está logado, mas não tem permissão para acessar esta página.
    //     return <Navigate to="/home" replace />; // ou para uma página de "Acesso Negado"
    // }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/acesso-negado" replace />;
    }

    // Se houver usuário, renderiza a página solicitada
    return <Outlet />;
};

export default ProtectedRoute;