import http from '../http-common';

class JuridicaDataService {

    getAll() {
        return http.get('/api/juridica');
    }

    create(data) {
        return http.post('/api/juridica', data);
    }
}

export default new JuridicaDataService();