import Header from "../Header";
import { useState } from "react";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback } from "react";
import ClienteDataService from "../../services/clienteDataService";
import Select from "react-select";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";

const Automovel = () => {

    const location = useLocation();
    const clienteId = location.state?.clienteId;

    const [modeloNegocio, setModeloNegocio] = useState(null);

    useEffect(() => {

        const compra = localStorage.getItem("Compra");
        const consignacao = localStorage.getItem("Consignacao");
        const troca = localStorage.getItem("Troca");

        if (compra) {
            setModeloNegocio(JSON.parse(compra));
            localStorage.removeItem("Compra"); // Opcional: apaga após usar
        }

        if (consignacao) {
            setModeloNegocio(JSON.parse(consignacao));
            localStorage.removeItem("Consignacao"); // Opcional: apaga após usar
        }

        if (troca) {
            setModeloNegocio(JSON.parse(troca));
            localStorage.removeItem("Troca"); // Opcional: apaga após usar
        }
    }, []);

    useEffect(() => {
        if (modeloNegocio?.negocio) {
            setAutomovel(prev => ({
                ...prev,
                origem: modeloNegocio.negocio
            }));
        }
    }, [modeloNegocio]);


    const initialAutomovelState = {
        id: null,
        ano_fabricacao: "",
        ano_modelo: "",
        ativo: false,
        cor: "",
        combustivel: "",
        km: "",
        origem: "",
        placa: "",
        renavam: "",
        valor: "",
        marcaId: ""
    };



    // no bd o campo de ambos é 'nome', porém no form chamo os campos input de 'marca' e 'modelo',
    // por isso aqui chamo por esses nomes

    const initialMarcaState = {
        id: null,
        marca: ""
    };

    const initialModeloState = {
        id: null,
        modelo: "",
        marcaId: ""
    };

    const [automovel, setAutomovel] = useState(initialAutomovelState);

    const [modelo, setModelo] = useState(initialModeloState);

    const [marca, setMarca] = useState(initialMarcaState);

    const [cliente, setCliente] = useState([]);

    const [fisica, setFisica] = useState([]);

    const [juridica, setJuridica] = useState([]);


    // --- Event Handlers ---
    const handleInputChangeAutomovel = event => {
        const { name, value } = event.target;
        setAutomovel({ ...automovel, [name]: value });
    };

    const handleInputChangeModelo = event => {
        const { name, value } = event.target;
        setModelo({ ...modelo, [name]: value });
    };

    const handleInputChangeMarca = event => {
        const { name, value } = event.target;
        setMarca({ ...marca, [name]: value });
    };

    // Mensagens de sucesso e erro
    const [mensagemErro, setMensagemErro] = useState('');
    const [erro, setErro] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);

    const navigate = useNavigate();


    const retrieveCliente = useCallback(() => {
        ClienteDataService.getAll()
            .then(response => {
                setCliente(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar clientes:", e);
            });
    }, []);


    useEffect(() => {
        retrieveCliente();
    }, [retrieveCliente]);

    const retrieveFisica = useCallback(() => {
        FisicaDataService.getAll()
            .then(response => {
                setFisica(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar pessoas físicas:", e);
            });
    }, []);


    useEffect(() => {
        retrieveFisica();
    }, [retrieveFisica]);

    const retrieveJuridica = useCallback(() => {
        JuridicaDataService.getAll()
            .then(response => {
                setJuridica(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar pessoas físicas:", e);
            });
    }, []);


    useEffect(() => {
        retrieveJuridica();
    }, [retrieveJuridica]);

    const options = cliente.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            value: d.id,
            label: `nome: ${d.nome || ""} | ${pessoaJuridica ? pessoaJuridica?.razao_social + " |" : ""} ${pessoaFisica ? "cpf: " + pessoaFisica?.cpf + " |" : ""}  ${pessoaJuridica ? "cnpj: " + pessoaJuridica?.cnpj : ""}`
        };
    });


    const saveAutomovel = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);

        // VERIFICAÇÃO - VAZIO
        let vazioErros = [];

        if (!automovel.valor) {
            vazioErros.push("valor");
        }

        if (!automovel.ano_fabricacao) {
            vazioErros.push("ano_fabricacao");
        }

        if (!automovel.ano_modelo) {
            vazioErros.push("ano_modelo");
        }

        if (!automovel.renavam) {
            vazioErros.push("renavam");
        }

        if (!automovel.placa) {
            vazioErros.push("placa");
        }

        if (!automovel.origem) {
            vazioErros.push("origem");
        }

        if (!automovel.valor) {
            vazioErros.push("valor");
        }

        if (!automovel.km) {
            vazioErros.push("km");
        }

        if (!automovel.combustivel) {
            vazioErros.push("combustivel");
        }

        if (!automovel.cor) {
            vazioErros.push("cor");
        }

        if (!modelo.modelo) {
            vazioErros.push("modelo");
        }

        if (!marca.marca) {
            vazioErros.push("marca");
        }

        // VERIFICAÇÃO - TAMANHO
        let tamanhoErros = [];

        if (automovel.renavam.length != 11 || isNaN(automovel.renavam)) {
            tamanhoErros.push("renavam");
        }

        if (automovel.placa.length != 7) {
            tamanhoErros.push("placa");
        }

        // VERIFICAÇÃO - TIPO
        let tipoErros = [];

        if (isNaN(automovel.ano_fabricacao)) {
            tipoErros.push("ano_fabricacao");
        }

        if (isNaN(automovel.ano_modelo)) {
            tipoErros.push("ano_modelo");
        }

        // Verificação de duplicidade
        try {
            const verificacao = await AutomovelDataService.duplicidade({
                placa: automovel.placa,
                renavam: automovel.renavam
            })

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro); // erro vindo do back
                setMensagemErro(verificacao.data.mensagemErro);
                return; // não continua
            }

        } catch (erro) {

            console.error("Erro na verificação de duplicidade:", erro);

            setErro(erro.response.data.erro);
            setMensagemErro(erro.response.data.mensagemErro);
            return;
        }

        if (tipoErros.length > 0 || tamanhoErros.length > 0 || vazioErros > 0) {
            setTamanho(tamanhoErros);
            setTipo(tipoErros);
            setVazio(vazioErros);
            return;
        }


        // aqui crio os JSON's auxiliares, para ficar igual no bd, chamo os campos de nome
        var dataMarca = {
            nome: marca.marca
        }

        const marcaResp = await MarcaDataService.create(dataMarca)
            .catch(e => {
                console.error("Erro ao criar marca:", e);
            });

        // const marcaId = marcaResp.data.id;

        setMarca(marcaResp.data);

        var dataModelo = {
            nome: modelo.modelo,
            marcaId: marcaResp?.data.id
        }

        var data = {
            ano_fabricacao: automovel.ano_fabricacao,
            ano_modelo: automovel.ano_modelo,
            ativo: automovel.ativo,
            cor: automovel.cor,
            combustivel: automovel.combustivel,
            km: automovel.km,
            origem: automovel.origem,
            placa: automovel.placa,
            renavam: automovel.renavam,
            valor: automovel.valor,
            marcaId: marcaResp?.data.id
        }

        const modeloResp = await ModeloDataService.create(dataModelo)
            .catch(e => {
                console.error("Erro ao criar marca:", e);
            });

        setModelo(modeloResp.data);

        console.log("Dados enviados para automóvel:", data);

        const automovelResp = await AutomovelDataService.create(data)
            .catch(e => {
                // console.error("Erro ao cadastrar automovel:", e);
                console.error("Erro ao cadastrar automovel:", e.response?.data || e.message);
            });

        setSucesso(true);
        setMensagemSucesso("Automóvel cadastrado com sucesso!");


        if (automovel.origem === "Compra" && automovelResp?.data?.id) {
            setTimeout(() => {
                navigate('/compra', { state: { automovelId: automovelResp.data.id, clienteId: clienteId } });
            }, 1500);
        }


        if (automovel.origem === "Consignacao") {
            setTimeout(() => {
                navigate('/consignacao', { state: { automovelId: automovelResp.data.id, clienteId: clienteId } });
            }, 1500);
        }

        if (automovel.origem === "Troca") {
            setTimeout(() => {
                navigate('/troca', { state: { automovelId: automovelResp.data.id, clienteId: clienteId } });
            }, 1500);
        }
    }


    return (
        <>
            <Header />
            <div className="container">
                <h1>Cadastro</h1>
                <p>Esta é a página de cadastro de automóveis.</p>
            </div>

            <div className="container">
                {
                    erro &&

                    <div class="alert alert-danger" role="alert">
                        {mensagemErro}
                    </div>

                }
                {
                    sucesso &&

                    <div class="alert alert-success" role="alert">
                        {mensagemSucesso}
                    </div>

                }
                <form className={`mt-5 ${sucesso && "d-none"}`}>
                    <div className="row">

                        <div class="mb-3 col-md-3">
                            <label for="anofabricacao" class="form-label">Ano fabricação</label>
                            <input type="text" class="form-control" id="anofabricacao" name="ano_fabricacao" aria-describedby="anofabricacaoHelp" onChange={handleInputChangeAutomovel} />
                            <div id="anofabricacaoHelp" class="form-text">Informe o ano de fabricação.</div>
                            {
                                vazio.includes("ano_fabricacao") &&
                                <div id="anoFabricacaoHelp" class="form-text text-danger">Informe o ano de fabricação.</div>
                            }
                            {
                                tipo.includes("ano_fabricacao") &&
                                <div id="anoFabricacaoHelp2" class="form-text text-danger">Ano de fabricação inválido.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="anomodelo" class="form-label">Ano modelo</label>
                            <input type="text" class="form-control" id="anomodelo" name="ano_modelo" onChange={handleInputChangeAutomovel} />
                            {
                                vazio.includes("ano_modelo") &&
                                <div id="anoModeloHelp" class="form-text text-danger">Informe o ano do modelo.</div>
                            }
                            {
                                tipo.includes("ano_modelo") &&
                                <div id="anoModeloHelp2" class="form-text text-danger">Ano do modelo inválido.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="renavam" class="form-label">Renavam</label>
                            <input type="text" class="form-control" id="renavam" name="renavam" onChange={handleInputChangeAutomovel} />
                            {
                                vazio.includes("renavam") &&
                                <div id="renavamHelp" class="form-text text-danger">Informe o renavam.</div>
                            }
                            {
                                tamanho.includes("renavam") &&
                                <div id="renavamHelp2" class="form-text text-danger">Renavam inválido.</div>
                            }
                            {
                                tipo.includes("renavam") &&
                                <div id="renavamHelp3" class="form-text text-danger">Renavam inválido.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="placa" class="form-label">Placa</label>
                            <input type="text" class="form-control" id="placa" name="placa" onChange={handleInputChangeAutomovel} />
                            {
                                vazio.includes("placa") &&
                                <div id="placaHelp" class="form-text text-danger">Informe a placa.</div>
                            }
                            {
                                tamanho.includes("placa") &&
                                <div id="placaHelp2" class="form-text text-danger">Placa inválida.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="valor" class="form-label">Valor</label>
                            <input type="text" class="form-control" id="valor" name="valor" onChange={handleInputChangeAutomovel} />
                            {
                                vazio.includes("valor") &&
                                <div id="valorHelp" class="form-text text-danger">Informe o valor.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="origem" class="form-label">Origem</label>
                            <select class="form-select" id="origem" name="origem" value={automovel.origem} onChange={handleInputChangeAutomovel}>
                                <option value="" >Selecione a origem</option>
                                <option value="Compra">Compra</option>
                                <option value="Consignacao">Consignação</option>
                                <option value="Troca">Troca</option>
                            </select>
                            {
                                vazio.includes("origem") &&
                                <div id="origemHelp" class="form-text text-danger">Informe a origem.</div>
                            }
                        </div>
                        <div class="mb-3 col-md-3">
                            <label for="km" class="form-label">Quilometragem</label>
                            <input type="text" class="form-control" id="km" name="km" onChange={handleInputChangeAutomovel} />
                            {
                                vazio.includes("km") &&
                                <div id="kmHelp" class="form-text text-danger">Informe a quilometragem.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="combustivel" class="form-label">Combustivel</label>
                            <select class="form-select" id="combustivel" name="combustivel" onChange={handleInputChangeAutomovel}>
                                <option selected>Selecione o combustível</option>
                                <option value="Diesel">Diesel</option>
                                <option value="Etanol">Etanol</option>
                                <option value="Flex">Flex</option>
                                <option value="Gasolina">Gasolina</option>
                            </select>
                            {
                                vazio.includes("combustivel") &&
                                <div id="combustivelHelp" class="form-text text-danger">Informe o combustivel.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="cor" class="form-label">Cor</label>
                            <input type="text" class="form-control" id="cor" name="cor" onChange={handleInputChangeAutomovel} />
                            {
                                vazio.includes("cor") &&
                                <div id="corHelp" class="form-text text-danger">Informe a cor.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="modelo" class="form-label">Modelo</label>
                            <input type="text" class="form-control" id="modelo" name="modelo" onChange={handleInputChangeModelo} />
                            {
                                vazio.includes("modelo") &&
                                <div id="modeloHelp" class="form-text text-danger">Informe o modelo.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="marca" class="form-label">Marca</label>
                            <input type="text" class="form-control" id="marca" name="marca" onChange={handleInputChangeMarca} />
                            {
                                vazio.includes("marca") &&
                                <div id="marcaHelp" class="form-text text-danger">Informe a marca.</div>
                            }
                        </div>

                        {/* <div class="mb-3 form-check col-md-3 d-flex justify-content-start align-items-center">
                            <input type="checkbox" class="form-check-input" id="ativo" value={true} name="ativo" onChange={handleInputChangeAutomovel} />
                            <label class="form-check-label ms-2" for="ativo">Ativo</label>
                        </div> */}
                        {/* <div class="mb-3 col-md-3">
                            <label for="proprietario" class="form-label">Proprietário</label>
                            <Select isSearchable={true} class="form-select" id="proprietario" name="proprietario" placeholder="Selecione o proprietário" options={options}>
                            </Select>
                        </div> */}

                    </div>

                    <button onClick={saveAutomovel} type="submit" class="btn btn-primary">Submit</button>

                </form>
            </div>
        </>
    );
}

export default Automovel;