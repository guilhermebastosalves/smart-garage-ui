import http from '../http-common';

class ManutencaoDataService {

    getAll() {
        return http.get('/api/manutencao')
    }

    create(data) {
        return http.post('/api/manutencao', data)
    }
}
export default new ManutencaoDataService()