import http from '../http-common';

class FisicaDataService {

    getAll() {
        return http.get('/api/fisica');
    }

    create(data) {
        return http.post('/api/fisica', data);
    }
}

export default new FisicaDataService();