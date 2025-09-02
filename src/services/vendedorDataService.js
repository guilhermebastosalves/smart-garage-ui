import http from '../http-common';

class VendedorDataService {

    getByFuncionarioId(funcionarioId) {
        return http.get(`/api/vendedor/${funcionarioId}`);
    }

}

export default new VendedorDataService();