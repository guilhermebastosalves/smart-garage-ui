import http from '../http-common';

class GastoDataService {

    getAll() {
        return http.get('/api/gasto')
    }

    getById(id) {
        return http.get(`/api/gasto/${id}`)
    }

    create(data) {
        return http.post('/api/gasto', data)
    }

    update(id, data) {
        return http.put(`/api/gasto/${id}`, data)
    }

}
export default new GastoDataService()