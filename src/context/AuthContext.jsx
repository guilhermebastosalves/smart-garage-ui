import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Corrigido para a nova importação
import AuthService from '../services/authDataService'; // Seu serviço que busca o token

// 1. Criar o Contexto
const AuthContext = createContext(null);

// 2. Criar o Provedor (o componente que vai "segurar" a informação)
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // 1. Adicionamos o estado de loading, começando como 'true'
    const [loading, setLoading] = useState(true);

    // Este efeito roda uma vez quando a aplicação carrega
    useEffect(() => {
        const token = AuthService.getCurrentUserToken();
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                // Define o usuário no estado se o token for válido
                setUser(decodedUser);
            } catch (error) {
                console.error("Token inválido:", error);
                // Limpa o token inválido
                AuthService.logout();
            } finally {
                // 2. Ao final da verificação (com ou sem sucesso), definimos loading como 'false'
                setLoading(false);
            }
        }
    }, []);

    // Função de login que será chamada pela página de Login
    const login = (token) => {
        localStorage.setItem("user_token", token);
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
    };

    // Função de logout
    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    // O valor que será compartilhado com todos os componentes
    const value = {
        user,
        loading, // <-- NOVO
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Criar um Hook customizado para facilitar o uso do contexto
export const useAuth = () => {
    return useContext(AuthContext);
};