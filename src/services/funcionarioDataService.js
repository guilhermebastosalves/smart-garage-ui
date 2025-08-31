import http from '../http-common';

class FuncionarioDataService {

    getAll() {
        return http.get('/api/funcionario');
    }

}

export default new FuncionarioDataService();