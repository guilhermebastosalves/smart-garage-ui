import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useCallback, useEffect } from "react";
import ClienteDataService from "../../services/clienteDataService";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import ModeloDataService from "../../services/modeloDataService";
import MarcaDataService from "../../services/marcaDataService";
import TrocaDataService from "../../services/trocaDataService";
import { useLocation, useNavigate } from "react-router-dom";

const Troca = () => {

    const navigate = useNavigate();

    const location = useLocation();
    const automovelId = location.state?.automovelId;
    const clienteId = location.state?.clienteId;

    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const initialTrocaState = {
        id: null,
        comissao: "",
        forma_pagamento: "",
        valor: "",
        data: "",
        automovelId: "",
        clienteId: "",
        funcionarioId: "",
        automovel_fornecido: ""
    };

    const [troca, setTroca] = useState(initialTrocaState);

    useEffect(() => {
        setTroca(prev => ({
            ...prev,
            automovelId: automovelId || "",
            clienteId: clienteId || ""
        }));
    }, [automovelId, clienteId]);

    const handleInputChangeTroca = event => {
        const { name, value } = event.target;
        setTroca({ ...troca, [name]: value });
    };

    const handleFornecedorChange = (selectedOption) => {
        setTroca({ ...troca, clienteId: selectedOption ? selectedOption.value : "" });
    };

    const handleAutomovelChange = (selectedOption) => {
        setTroca({ ...troca, automovelId: selectedOption ? selectedOption.value : "" });
    };

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

    const retrieveAutomovel = useCallback(() => {
        AutomovelDataService.getAll()
            .then(response => {
                setAutomovel(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar automóveis:", e);
            });
    }, []);

    useEffect(() => {
        retrieveAutomovel();
    }, [retrieveAutomovel]);

    const retrieveModelo = useCallback(() => {
        ModeloDataService.getAll()
            .then(response => {
                setModelo(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar automóveis:", e);
            });
    }, []);

    useEffect(() => {
        retrieveModelo();
    }, [retrieveModelo]);

    const retrieveMarca = useCallback(() => {
        MarcaDataService.getAll()
            .then(response => {
                setMarca(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar automóveis:", e);
            });
    }, []);

    useEffect(() => {
        retrieveMarca();
    }, [retrieveMarca]);


    const optionsFornecedor = cliente.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            value: d.id,
            label: `nome: ${d.nome || ""} | ${pessoaJuridica ? pessoaJuridica?.razao_social + " |" : ""} ${pessoaFisica ? "cpf: " + pessoaFisica?.cpf + " |" : ""}  ${pessoaJuridica ? "cnpj: " + pessoaJuridica?.cnpj : ""}`
        };
    });

    const optionsAutomovel = automovel.map((d) => {
        const nomeMarca = marca.find(marca => marca.id === d.marcaId);
        const nomeModelo = modelo.find(modelo => modelo.marcaId === nomeMarca.id);

        return {
            value: d.id,
            label: `Modelo: ${nomeModelo ? nomeModelo?.nome + " |" : ""} Marca: ${nomeMarca ? nomeMarca?.nome + " |" : ""} | Renavam: ${d.renavam} | Ano: ${d.ano_modelo}`
        };
    });

    const optionsFormaPagamento = [
        {
            label: "Cartão",
            value: "Cartao"
        },
        {
            label: "Dinheiro",
            value: "Dinheiro"
        },
        {
            label: "Financiamento",
            value: "Financiamento"
        },
        {
            label: "Pix",
            value: "Pix"
        }
    ];

    const saveTroca = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();

        // VERIFICAÇÃO - VAZIO
        // let vazioErros = [];

        // if (!automovel.valor) {
        //     vazioErros.push("valor");
        // }

        // if (!automovel.ano_fabricacao) {
        //     vazioErros.push("ano_fabricacao");
        // }

        // if (!automovel.ano_modelo) {
        //     vazioErros.push("ano_modelo");
        // }

        // if (!automovel.renavam) {
        //     vazioErros.push("renavam");
        // }

        // VERIFICAÇÃO - TIPO
        // let tipoErros = [];

        // if (isNaN(automovel.ano_fabricacao)) {
        //     tipoErros.push("ano_fabricacao");
        // }


        // if (tipoErros.length > 0 || tamanhoErros.length > 0 || vazioErros > 0) {
        //     setTamanho(tamanhoErros);
        //     setTipo(tipoErros);
        //     setVazio(vazioErros);
        //     return;
        // }

        var dataTroca = {
            comissao: troca.comissao,
            valor: troca.valor,
            data: troca.data,
            forma_pagamento: troca.forma_pagamento,
            clienteId: troca.clienteId,
            automovelId: troca.automovelId,
            automovel_fornecido: troca.automovel_fornecido,
            // funcionarioId: troca.funcionarioId
        }

        const trocaResp = await TrocaDataService.create(dataTroca)
            .catch(e => {
                console.error("Erro ao criar troca:", e);
            });

        setTroca(trocaResp.data);

        setTimeout(() => {
            navigate('/listagem/trocas');
        }, 1500)
    }


    return (
        <>
            <Header />
            <div className="container">
                <h1>Cadastro</h1>
                <p>Esta é a página de cadastro de trocas.</p>
            </div>

            <div className="container">
                <form className="mt-5">
                    <div className="row">
                        <div class="mb-3 col-md-3 ">
                            <label for="valor" class="form-label">Valor Diferença</label>
                            <input type="text" class="form-control" id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeTroca} />
                            <div id="valorHelp" class="form-text">Informe o valor de diferença da troca.</div>
                        </div>

                        <div class="mb-3 col-md-3 ">
                            <label for="forma_pagamento" class="form-label">Forma de Pagamento</label>
                            <Select class="form-select" id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === troca.forma_pagamento)} onChange={(option) => setTroca({ ...troca, forma_pagamento: option.value })} options={optionsFormaPagamento} isClearable={true}>
                            </Select>
                            <div id="formaPagementoHelp" class="form-text">Informe a forma de pagamento.</div>
                        </div>

                        <div class="mb-3 col-md-3 ">
                            <label for="comissao" class="form-label">Comissão</label>
                            <input type="text" class="form-control" id="comissao" name="comissao" aria-describedby="comissaoHelp" onChange={handleInputChangeTroca} />
                            <div id="comissaoHelp" class="form-text">Informe o valor de comissao.</div>
                        </div>

                        <div class="mb-3 col-md-3 ">
                            <label for="data" class="form-label">Data</label><br />
                            <DatePicker
                                style={{ width: "100%;" }}
                                className="form-control"
                                type="text"
                                aria-describedby="dataHelp"
                                id="data"
                                name="data"
                                selected={troca.data}
                                onChange={(date) => setTroca({ ...troca, data: date })}
                                // onChange={handleInputChangeCompra}
                                dateFormat="dd/MM/yyyy" // Formato da data
                            />

                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="fornecedor" class="form-label">Fornecedor</label>
                            <Select isSearchable={true} class="form-select" id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleFornecedorChange} value={optionsFornecedor.find(option => option.value === troca.clienteId) || null} isClearable={true}>
                            </Select>
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="automovel" class="form-label">Automóvel Recebido</label>
                            <Select isSearchable={true} class="form-select" id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === troca.automovelId) || null} isClearable={true}>
                            </Select>
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="automovel_fornecido" class="form-label">Automóvel Fornecido</label>
                            <Select isSearchable={true} class="form-select" id="automovel_fornecido" name="automovel_fornecido" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setTroca({ ...troca, automovel_fornecido: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === troca.automovel_fornecido) || null} isClearable={true}>
                            </Select>
                        </div>

                    </div >

                    <button type="submit" onClick={saveTroca} class="btn btn-primary">Submit</button>

                </form >
            </div >
        </>
    );
}

export default Troca;