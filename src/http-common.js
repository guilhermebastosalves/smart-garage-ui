import axios from "axios";

export default axios.create({
    // Inserir o endereço do servidor onde a API está hospedada
    baseURL: "http://localhost:3000",
    headers: {
        "Content-type": "application/json"
    }

});
