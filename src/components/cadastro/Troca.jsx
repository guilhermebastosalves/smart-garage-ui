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


    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([clientes, fisica, juridica, automoveis, modelos, marcas]) => {
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
            clearTimeout(timeout);
        });
    }, []);



    // Mensagens de sucesso e erro
    const [mensagemErro, setMensagemErro] = useState('');
    const [erro, setErro] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);


    const validateFields = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!troca.valor) vazioErros.push("valor");
        if (!troca.data) vazioErros.push("data");
        if (!troca.clienteId) vazioErros.push("clienteId");
        if (!troca.automovelId) vazioErros.push("automovelId");
        if (!troca.comissao) vazioErros.push("comissao");
        if (!troca.forma_pagamento) vazioErros.push("forma_pagamento");
        if (!troca.automovel_fornecido) vazioErros.push("automovel_fornecido");

        // Tipo
        if (troca.valor && isNaN(troca.valor)) tipoErros.push("valor");
        if (troca.comissao && isNaN(troca.comissao)) tipoErros.push("comissao");
        if (troca.data && troca.data > new Date()) tipoErros.push("data");


        return { vazioErros, tamanhoErros, tipoErros };
    };



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

        const { vazioErros, tamanhoErros, tipoErros } = validateFields();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        // Só continua se não houver erros
        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            return;
        }

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
                            {
                                vazio.includes("valor") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor.</div>
                            }
                            {
                                tipo.includes("valor") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Valor inválido.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3 ">
                            <label for="forma_pagamento" class="form-label">Forma de Pagamento</label>
                            <Select class="form-select" id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === troca.forma_pagamento)} onChange={(option) => setTroca({ ...troca, forma_pagamento: option.value })} options={optionsFormaPagamento} isClearable={true}>
                            </Select>
                            {
                                vazio.includes("forma_pagamento") &&
                                <div id="formapagamentohelp" class="form-text text-danger ms-1">Informe a forma de pagamento.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3 ">
                            <label for="comissao" class="form-label">Comissão</label>
                            <input type="text" class="form-control" id="comissao" name="comissao" aria-describedby="comissaoHelp" onChange={handleInputChangeTroca} />
                            {
                                vazio.includes("comissao") &&
                                <div id="comissaohelp" class="form-text text-danger ms-1">Informe o valor de comissão.</div>
                            }
                            {
                                tipo.includes("comissao") &&
                                <div id="comissaohelp" class="form-text text-danger ms-1">Valor de comissão inválido.</div>
                            }
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
                            {
                                vazio.includes("data") &&
                                <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>
                            }
                            {
                                tipo.includes("data") &&
                                <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="fornecedor" class="form-label">Fornecedor</label>
                            <Select isSearchable={true} class="form-select" id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleFornecedorChange} value={optionsFornecedor.find(option => option.value === troca.clienteId) || null} isClearable={true}>
                            </Select>
                            {
                                vazio.includes("clienteId") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Informe o proprietário.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="automovel" class="form-label">Automóvel Recebido</label>
                            <Select isSearchable={true} class="form-select" id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === troca.automovelId) || null} isClearable={true}>
                            </Select>
                            {
                                vazio.includes("automovelId") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel recebido.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="automovel_fornecido" class="form-label">Automóvel Fornecido</label>
                            <Select isSearchable={true} class="form-select" id="automovel_fornecido" name="automovel_fornecido" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setTroca({ ...troca, automovel_fornecido: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === troca.automovel_fornecido) || null} isClearable={true}>
                            </Select>
                            {
                                vazio.includes("automovel_fornecido") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel fornecido.</div>
                            }
                        </div>

                    </div >

                    <button type="submit" onClick={saveTroca} class="btn btn-primary">Submit</button>

                </form >
            </div >
        </>
    );
}

export default Troca;