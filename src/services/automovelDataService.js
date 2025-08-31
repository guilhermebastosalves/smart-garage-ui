import http from "../http-common";

class AutomovelDataService {

    getAll() {
        return http.get("/api/automovel");
    }

    getById(id) {
        return http.get(`api/automovel/${id}`);
    }

    getByRenavam(renavam) {
        return http.get(`api/automovel/renavam/${renavam}`);
    }

    getByAtivo() {
        return http.get(`api/automovel/ativo`);
    }

    getByInativo() {
        return http.get(`api/automovel/inativo`);
    }

    getDetalhesById(id) {
        return http.get(`/api/automovel/detalhes/${id}`);
    };

    create(data, config) {
        return http.post("/api/automovel", data, config);
    }

    duplicidade(data) {
        return http.post("/api/automovel/verificar", data);
    }

    update(id, data, config) {
        return http.put(`/api/automovel/${id}`, data, config)
    }

}

export default new AutomovelDataService(); 