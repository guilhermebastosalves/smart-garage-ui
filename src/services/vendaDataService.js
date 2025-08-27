import http from "../http-common";

class VendaDataService {

    getAll() {
        return http.get('/api/venda');
    }

    getByData() {
        return http.get('/api/venda/data');
    }

    getById(id) {
        return http.get(`/api/venda/${id}`);
    }

    create(data) {
        return http.post('/api/venda', data);
    }

    update(id, data) {
        return http.put(`/api/venda/${id}`, data);
    }
}

export default new VendaDataService();