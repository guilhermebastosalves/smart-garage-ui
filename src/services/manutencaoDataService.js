import http from '../http-common';

class ManutencaoDataService {

    getAll() {
        return http.get('/api/manutencao')
    }

    getById(id) {
        return http.get(`/api/manutencao/${id}`)
    }


    create(data) {
        return http.post('/api/manutencao', data)
    }

    update(id, data) {
        return http.put(`/api/manutencao/${id}`, data)
    }

}
export default new ManutencaoDataService()