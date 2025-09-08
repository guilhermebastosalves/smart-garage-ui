import http from "../http-common";

class RelatorioDataService {

    gerarRelatorio(params) {
        // params será um objeto como { tipo, dataInicio, dataFim }
        return http.get("api/relatorio", { params });
    }
}

export default new RelatorioDataService();