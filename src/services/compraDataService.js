import http from '../http-common';

class CompraDataService {

    getAll() {
        return http.get('/api/compra');
    }

    getById(id) {
        return http.get(`/api/compra/${id}`);
    }

    create(data) {
        return http.post('/api/compra', data);
    }

    update(id, data) {
        return http.put(`/api/compra/${id}`, data);
    }

}

export default new CompraDataService();