import http from "../http-common";

class VendaDataService {

    getAll() {
        return http.get('/api/venda');
    }

    create(data) {
        return http.post('/api/venda', data);
    }
}

export default new VendaDataService();