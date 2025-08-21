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
    const clienteId = location.state?.clienteId;
    const fisicaId = location.state?.fisicaId;
    const juridicaId = location.state?.juridicaId;

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
        marcaId: "",
        imagem: ""
    };


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
    const [automovelOpt, setAutomovelOpt] = useState([]);
    const [modelo, setModelo] = useState(initialModeloState);
    const [modeloOpt, setModeloOpt] = useState([]);
    const [marca, setMarca] = useState(initialMarcaState);
    const [marcaOpt, setMarcaOpt] = useState([]);

    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);

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
            clienteId: clienteId || ""
        }));
    }, [clienteId]);

    const handleInputChangeTroca = event => {
        const { name, value } = event.target;
        setTroca({ ...troca, [name]: value });
    };

    const handleFornecedorChange = (selectedOption) => {
        setTroca({ ...troca, clienteId: selectedOption ? selectedOption.value : "" });
    };

    // const handleAutomovelChange = (selectedOption) => {
    //     setTroca({ ...troca, automovelId: selectedOption ? selectedOption.value : "" });
    // };

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
            setAutomovelOpt(automoveis.data);
            setModeloOpt(modelos.data);
            setMarcaOpt(marcas.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
            clearTimeout(timeout);
        });
    }, []);

    // NOVO ESTADO PARA O BOTÃO
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        // if (!troca.valor) vazioErros.push("valor_diferenca");
        if (!troca.data) vazioErros.push("data");
        if (!troca.clienteId) vazioErros.push("clienteId");
        if (!troca.comissao) vazioErros.push("comissao");
        // if (!troca.forma_pagamento) vazioErros.push("forma_pagamento");
        if (!troca.automovel_fornecido) vazioErros.push("automovel_fornecido");

        if (!automovel.valor) vazioErros.push("valor");
        if (!automovel.ano_fabricacao) vazioErros.push("ano_fabricacao");
        if (!automovel.ano_modelo) vazioErros.push("ano_modelo");
        if (!automovel.renavam) vazioErros.push("renavam");
        if (!automovel.placa) vazioErros.push("placa");
        if (!automovel.origem) vazioErros.push("origem");
        if (!automovel.km) vazioErros.push("km");
        if (!automovel.combustivel) vazioErros.push("combustivel");
        if (!automovel.cor) vazioErros.push("cor");
        if (!modelo.modelo) vazioErros.push("modelo");
        if (!marca.marca) vazioErros.push("marca");

        // Tamanho
        if (automovel.renavam && (automovel.renavam.length !== 11 || isNaN(automovel.renavam))) tamanhoErros.push("renavam");
        if (automovel.placa && automovel.placa.length !== 7) tamanhoErros.push("placa");


        // Tipo
        if (troca.valor && isNaN(troca.valor)) tipoErros.push("valor");
        if (troca.comissao && isNaN(troca.comissao)) tipoErros.push("comissao");
        if (troca.data && troca.data > new Date()) tipoErros.push("data");

        if (automovel.ano_fabricacao && isNaN(automovel.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (automovel.ano_modelo && isNaN(automovel.ano_modelo)) tipoErros.push("ano_modelo");
        if (automovel.valor && isNaN(automovel.valor)) tipoErros.push("valor");
        if (automovel.km && isNaN(automovel.km)) tipoErros.push("km");


        return { vazioErros, tamanhoErros, tipoErros };
    };



    const optionsFornecedor = cliente?.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            value: d.id,
            label: `nome: ${d.nome || ""} | ${pessoaJuridica ? pessoaJuridica?.razao_social + " |" : ""} ${pessoaFisica ? "cpf: " + pessoaFisica?.cpf + " |" : ""}  ${pessoaJuridica ? "cnpj: " + pessoaJuridica?.cnpj : ""}`
        };
    });

    const optionsAutomovel = automovelOpt?.map((d) => {
        const nomeMarca = marcaOpt?.find(marca => marca.id === d.marcaId);
        const nomeModelo = modeloOpt?.find(modelo => modelo.marcaId === nomeMarca.id);

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

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            padding: 15,
            fontSize: '1rem',
            fontWeight: state.isSelected ? 'bold' : 'normal',
            backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
            color: 'black',
            whiteSpace: 'pre-wrap', // quebra linhas se necessário
        }),
        control: (provided) => ({
            ...provided,
            // minHeight: '45px',
            fontSize: '1rem',
        }),
        singleValue: (provided) => ({
            ...provided,
            fontWeight: 'bold',
            color: '#333',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999, // garante que fique acima de outros elementos
        }),
    };

    // Função auxiliar para checar se um campo tem erro e aplicar a classe
    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);


    const saveTroca = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
        setTamanho([]);
        setTipo([]);
        setIsSubmitting(true); // Desabilita o botão

        const { vazioErros, tamanhoErros, tipoErros } = validateFields();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        // Só continua se não houver erros
        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }


        try {
            // --- ETAPA 1: Verificação de duplicidade ---
            const verificacao = await AutomovelDataService.duplicidade({
                placa: automovel.placa,
                renavam: automovel.renavam
            })

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro); // erro vindo do back
                setMensagemErro(verificacao.data.mensagemErro);
                // return; // não continua
                throw new Error(verificacao.data.mensagemErro);
            }

            // --- ETAPA 2: Criação da Marca ---
            var dataMarca = {
                nome: marca.marca
            }

            const marcaResp = await MarcaDataService.create(dataMarca)
                .catch(e => {
                    console.error("Erro ao criar marca:", e);
                });

            setMarca(marcaResp.data);
            const marcaId = marcaResp.data.id;
            if (!marcaId) throw new Error("Falha ao obter ID da marca.");

            // --- ETAPA 3: Criação do Modelo ---
            var dataModelo = {
                nome: modelo.modelo,
                marcaId: marcaResp?.data.id
            }

            const modeloResp = await ModeloDataService.create(dataModelo)
                .catch(e => {
                    console.error("Erro ao criar marca:", e);
                });

            setModelo(modeloResp.data);

            // --- ETAPA 4: Criação do Automóvel ---
            const formData = new FormData();

            formData.append("ano_fabricacao", automovel.ano_fabricacao);
            formData.append("ano_modelo", automovel.ano_modelo);
            formData.append("ativo", automovel.ativo);
            formData.append("cor", automovel.cor);
            formData.append("combustivel", automovel.combustivel);
            formData.append("km", automovel.km);
            formData.append("origem", automovel.origem);
            formData.append("placa", automovel.placa);
            formData.append("renavam", automovel.renavam);
            formData.append("valor", automovel.valor);
            formData.append("marcaId", marcaResp?.data.id);
            formData.append("file", automovel.file); // importante: nome "file" igual ao backend

            const automovelResp = await AutomovelDataService.create(formData, {
                headers: { "Content-type": "multipart/form-data" }
            })
                .catch(e => {
                    // console.error("Erro ao cadastrar automovel:", e);
                    console.error("Erro ao cadastrar automovel:", e.response?.data || e.message);
                });

            const automovelId = automovelResp.data.id;
            if (!automovelId) throw new Error("Falha ao obter ID do automóvel.");

            var dataTroca = {
                comissao: troca.comissao,
                valor: troca.valor,
                data: troca.data,
                forma_pagamento: troca.forma_pagamento,
                clienteId: troca.clienteId,
                automovelId: automovelResp?.data.id,
                automovel_fornecido: troca.automovel_fornecido,
                // funcionarioId: troca.funcionarioId
            }

            const trocaResp = await TrocaDataService.create(dataTroca)
                .catch(e => {
                    console.error("Erro ao criar troca:", e);
                });

            setTroca(trocaResp.data);

            // --- SUCESSO! ---
            setSucesso(true);
            setMensagemSucesso("Operação de consignação realizada com sucesso!");

            // --- ETAPA 6: Redirecionamento ---
            if (automovel.origem === "Compra") {
                setTimeout(() => {
                    navigate('/listagem/compras');
                }, 1500);
            }


            if (automovel.origem === "Consignacao") {
                setTimeout(() => {
                    navigate('/listagem/consignacoes');
                }, 1500);
            }

            if (automovel.origem === "Troca") {
                setTimeout(() => {
                    navigate('/listagem/trocas');
                }, 1500);
            }
        } catch (error) {
            // Se qualquer 'await' falhar, o código vem para cá
            console.error("Erro no processo de salvamento:", error);
            setErro(true);
            // Tenta pegar a mensagem de erro da resposta da API, ou usa uma mensagem padrão
            const mensagem = error.response?.data?.mensagemErro || error.message || "Ocorreu um erro inesperado.";
            setMensagemErro(mensagem);
        } finally {
            // Este bloco será executado sempre no final, tanto em caso de sucesso quanto de erro
            setIsSubmitting(false); // Reabilita o botão aqui!
        }

    }


    return (
        <>
            <Header />

            <div className="container">
                <div>Página de Automóveis para Troca</div>
            </div>

            <div className="container">

                {/* Cabeçalho da Página */}
                <div className="mb-4">
                    <h1 className="fw-bold">Cadastro de Automóvel</h1>
                    <p className="text-muted">Preencha os dados abaixo para registrar um novo veículo no sistema.</p>
                </div>

                {/* Alertas */}
                {erro && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{mensagemErro}</div>
                    </div>
                )}
                {sucesso && (
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{mensagemSucesso}</div>
                    </div>
                )}

                {/* Formulário com Seções */}
                <form onSubmit={saveTroca} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    {/* Seção 1: Informações Principais */}

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações Principais</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="marca" className="form-label">Marca</label>
                                <input type="text" className={`form-control ${hasError("marca") && "is-invalid"}`} id="marca" name="marca" onChange={handleInputChangeMarca} />
                                {vazio.includes("marca") && <div className="invalid-feedback">Informe a marca.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="modelo" className="form-label">Modelo</label>
                                <input type="text" className={`form-control ${hasError("modelo") && "is-invalid"}`} id="modelo" name="modelo" onChange={handleInputChangeModelo} />
                                {vazio.includes("modelo") && <div className="invalid-feedback">Informe o modelo.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="cor" className="form-label">Cor</label>
                                <input type="text" className={`form-control ${hasError("cor") && "is-invalid"}`} id="cor" name="cor" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("cor") && <div className="invalid-feedback">Informe a cor.</div>}
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="anofabricacao" className="form-label">Ano Fabricação</label>
                                <input type="text" className={`form-control ${hasError("ano_fabricacao") && "is-invalid"}`} id="anofabricacao" name="ano_fabricacao" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("ano_fabricacao") && <div className="invalid-feedback">Informe o ano.</div>}
                                {tipo.includes("ano_fabricacao") && <div className="invalid-feedback">Ano inválido.</div>}
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="anomodelo" className="form-label">Ano Modelo</label>
                                <input type="text" className={`form-control ${hasError("ano_modelo") && "is-invalid"}`} id="anomodelo" name="ano_modelo" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("ano_modelo") && <div className="invalid-feedback">Informe o ano.</div>}
                                {tipo.includes("ano_modelo") && <div className="invalid-feedback">Ano inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="foto" className="form-label">Foto do Veículo</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="foto"
                                    name="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setAutomovel({ ...automovel, file });
                                            // ou só file.name, dependendo do backend
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </fieldset>


                    {/* Seção 2: Documentação e Valores */}


                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Documentação e Valores</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="placa" className="form-label">Placa</label>
                                <input type="text" className={`form-control ${hasError("placa") && "is-invalid"}`} id="placa" name="placa" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("placa") && <div className="invalid-feedback">Informe a placa.</div>}
                                {tamanho.includes("placa") && <div className="invalid-feedback">Placa inválida (deve ter 7 caracteres).</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="renavam" className="form-label">Renavam</label>
                                <input type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("renavam") && <div className="invalid-feedback">Informe o Renavam.</div>}
                                {tamanho.includes("renavam") && <div className="invalid-feedback">Renavam inválido (deve ter 11 dígitos numéricos).</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="valor" className="form-label">Valor (R$)</label>
                                <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("valor") && <div className="invalid-feedback">Informe o valor.</div>}
                                {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>}
                            </div>
                        </div>
                    </fieldset>


                    {/* Seção 3: Detalhes Adicionais */}

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Detalhes Adicionais</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="km" className="form-label">Quilometragem</label>
                                <input type="text" className={`form-control ${hasError("km") && "is-invalid"}`} id="km" name="km" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("km") && <div className="invalid-feedback">Informe a quilometragem.</div>}
                                {tipo.includes("km") && <div className="invalid-feedback">Valor inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="combustivel" className="form-label">Combustível</label>
                                <select className={`form-select ${hasError("combustivel") && "is-invalid"}`} id="combustivel" name="combustivel" onChange={handleInputChangeAutomovel}>
                                    <option value="">Selecione...</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Etanol">Etanol</option>
                                    <option value="Flex">Flex</option>
                                    <option value="Gasolina">Gasolina</option>
                                </select>
                                {vazio.includes("combustivel") && <div className="invalid-feedback">Informe o combustível.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="origem" className="form-label">Origem do Veículo</label>
                                <select className={`form-select ${hasError("origem") && "is-invalid"}`} id="origem" name="origem" value={automovel.origem} onChange={handleInputChangeAutomovel}>
                                    <option value="">Selecione...</option>
                                    <option value="Compra">Compra</option>
                                    <option value="Consignacao">Consignação</option>
                                    <option value="Troca">Troca</option>
                                </select>
                                {vazio.includes("origem") && <div className="invalid-feedback">Informe a origem.</div>}
                            </div>
                        </div>
                    </fieldset>

                    {/* Seção 4: Troca */}
                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Detalhes Consignação</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label for="valor" class="form-label">Valor Diferença</label>
                                <input type="text" className={`form-control ${hasError("valor_diferenca") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeTroca} />
                                {vazio.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor.</div>}
                                {tipo.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Valor inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="forma_pagamento" class="form-label">Forma de Pagamento</label>
                                <Select className={`${hasError("forma_pagamento") && "is-invalid"}`} id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === troca.forma_pagamento)} onChange={(option) => setTroca({ ...troca, forma_pagamento: option.value })} options={optionsFormaPagamento} isClearable={true}>
                                </Select>
                                {vazio.includes("forma_pagamento") && <div id="formapagamentohelp" class="form-text text-danger ms-1">Informe a forma de pagamento.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="comissao" class="form-label">Comissão</label>
                                <input type="text" className={`form-control ${hasError("comissao") && "is-invalid"}`} id="comissao" name="comissao" aria-describedby="comissaoHelp" onChange={handleInputChangeTroca} />
                                {vazio.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Informe o valor de comissão.</div>}
                                {tipo.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Valor de comissão inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="data" class="form-label">Data</label><br />
                                <DatePicker
                                    style={{ width: "100%;" }}
                                    className={`form-control ${hasError("data") && "is-invalid"}`}
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data"
                                    name="data"
                                    selected={troca.data}
                                    onChange={(date) => setTroca({ ...troca, data: date })}
                                    // onChange={handleInputChangeCompra}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />
                                {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="fornecedor" class="form-label">Fornecedor</label>
                                <Select isSearchable={true} className={`${hasError("fornecedor") && "is-invalid"}`} id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleFornecedorChange} value={optionsFornecedor.find(option => option.value === troca.clienteId) || null} isClearable={true}>
                                </Select>
                                {vazio.includes("clienteId") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o proprietário.</div>}
                            </div>
                            {/* <div className="col-md-4">
                                <label for="automovel" class="form-label">Automóvel Recebido</label>
                                <Select isSearchable={true} className={`form-control ${hasError("km") && "is-invalid"}`} id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === troca.automovelId) || null} isClearable={true}>
                                </Select>
                                {vazio.includes("automovelId") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel recebido.</div>}
                            </div> */}
                            <div className="col-md-4">
                                <label for="automovel_fornecido" class="form-label">Automóvel Fornecido</label>
                                <Select isSearchable={true} className={`${hasError("automovel_fornecido") && "is-invalid"}`} id="automovel_fornecido" name="automovel_fornecido" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setTroca({ ...troca, automovel_fornecido: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === troca.automovel_fornecido) || null} isClearable={true}>
                                </Select>
                                {vazio.includes("automovel_fornecido") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel fornecido.</div>}
                            </div>
                        </div>
                    </fieldset>

                    {/* Botão de Submissão */}
                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Salvando..
                                </>
                            ) : (
                                "Cadastrar Automóvel"
                            )}
                        </button>
                    </div>
                </form >
            </div >
        </>
    );
}

export default Troca;