import http from '../http-common';

class ConsignacaoDataService {

    getAll() {
        return http.get('/api/consignacao');
    }

    getById(id) {
        return http.get(`api/consignacao/${id}`);
    }

    getByAutomovel(automovelId) {
        return http.get(`api/consignacao/automovel/${automovelId}`);
    }

    getByAtivo() {
        return http.get(`api/consignacao/ativo`);
    }

    getDetalhesById(id) {
        return http.get(`/api/consignacao/detalhes/${id}`);
    };

    create(data) {
        return http.post('/api/consignacao', data)
    }

    getAllByDataInicio() {
        return http.get('/api/consignacao/datainicio');
    }

    update(id, data) {
        return http.put(`/api/consignacao/${id}`, data)
    }
}

export default new ConsignacaoDataService();