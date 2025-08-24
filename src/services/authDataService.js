import http from "../http-common"; // Seu cliente axios

const login = (data) => {
    return http.post("/api/login", data);
};

const logout = () => {
    localStorage.removeItem("user_token");
};

const getCurrentUserToken = () => {
    return localStorage.getItem("user_token");
};

const authService = {
    login,
    logout,
    getCurrentUserToken,
};

export default authService;