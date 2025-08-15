import http from "../http-common";

class AutomovelDataService {

    getAll() {
        return http.get("/api/automovel");
    }

    getById(id) {
        return http.get(`api/automovel/${id}`);
    }

    create(data, config) {
        return http.post("/api/automovel", data, config);
    }

    duplicidade(data) {
        return http.post("/api/automovel/verificar", data);
    }

    update(id, data) {
        return http.put(`/api/automovel/${id}`, data)
    }

}

export default new AutomovelDataService(); 