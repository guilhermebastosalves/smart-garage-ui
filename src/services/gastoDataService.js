import http from '../http-common';

class GastoDataService {

    getAll() {
        return http.get('/api/gasto')
    }

    create(data) {
        return http.post('/api/gasto', data)
    }
}
export default new GastoDataService()