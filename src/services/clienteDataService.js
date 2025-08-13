import http from '../http-common';

class ClienteDataService {

    getAll() {
        return http.get('/api/cliente');
    }

    create(data) {
        return http.post('/api/cliente', data);
    }
}

export default new ClienteDataService();