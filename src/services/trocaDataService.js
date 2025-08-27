import http from '../http-common';

class TrocaDataService {

    getAll() {
        return http.get('/api/troca');
    }

    getById(id) {
        return http.get(`api/troca/${id}`);
    }

    create(data) {
        return http.post('/api/troca', data);
    }

    update(id, data) {
        return http.put(`/api/troca/${id}`, data);
    }

}

export default new TrocaDataService();