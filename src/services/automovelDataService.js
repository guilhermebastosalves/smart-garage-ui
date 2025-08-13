import http from "../http-common";

class AutomovelDataService {

    getAll() {
        return http.get("/api/automovel");
    }

    getById(id) {
        return http.get(`api/automovel/${id}`);
    }

    create(data) {
        return http.post("/api/automovel", data);
    }

    duplicidade(data) {
        return http.post("/api/automovel/verificar", data);
    }

    update(id, data) {
        return http.put(`/api/automovel/${id}`, data)
    }

}

export default new AutomovelDataService(); 