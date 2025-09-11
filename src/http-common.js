import axios from "axios";

const apiClient = axios.create({
    // Inserir o endereço do servidor onde a API está hospedada
    baseURL: "http://localhost:3000",
    headers: {
        "Content-type": "application/json"
    }
});

// A MÁGICA ACONTECE AQUI:
// Adicionamos um interceptor que roda ANTES de cada requisição ser enviada
apiClient.interceptors.request.use(
    (config) => {
        // Pega o token do localStorage
        const token = localStorage.getItem("user_token");

        // Se o token existir, adiciona ao cabeçalho 'Authorization'
        if (token) {
            config.headers["Authorization"] = 'Bearer ' + token;
        }

        // Retorna a configuração modificada para a requisição continuar
        return config;
    },
    (error) => {
        // Em caso de erro na configuração, rejeita a promessa
        return Promise.reject(error);
    }
);

export default apiClient;
