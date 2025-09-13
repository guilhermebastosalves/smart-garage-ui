import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClienteDataService from "../../services/clienteDataService";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import ModeloDataService from "../../services/modeloDataService";
import MarcaDataService from "../../services/marcaDataService";
import ConsignacaoDataService from "../../services/consignacaoDataService";
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import { FaCar, FaFileSignature } from "react-icons/fa";


const Consignacao = () => {

    const { user } = useAuth();

    const navigate = useNavigate();

    const location = useLocation();
    const clienteId = location.state?.clienteId;

    const [modeloNegocio, setModeloNegocio] = useState(null);


    useEffect(() => {
        const negocio = sessionStorage.getItem("NegocioAtual");
        if (negocio) {
            setModeloNegocio(JSON.parse(negocio));
        }
    }, []);

    const initialAutomovelState = {
        id: null,
        ano_fabricacao: "",
        ano_modelo: "",
        cor: "",
        combustivel: "",
        km: "",
        origem: "",
        placa: "",
        renavam: "",
        valor: "",
        marcaId: "",
        imagem: "",
        modeloId: ""
    };

    const [automovel, setAutomovel] = useState(initialAutomovelState);

    useEffect(() => {
        if (modeloNegocio?.negocio) {
            setAutomovel(prev => ({
                ...prev,
                origem: modeloNegocio.negocio
            }));
        }
    }, [modeloNegocio]);

    // States para as opções dos selects
    const [marcasOptions, setMarcasOptions] = useState([]);
    const [modelosOptions, setModelosOptions] = useState([]);
    const [isModelosLoading, setIsModelosLoading] = useState(false);

    // Busca as marcas ao carregar a página
    useEffect(() => {
        MarcaDataService.getAll().then(response => {
            setMarcasOptions(response.data.map(m => ({ value: m.id, label: m.nome })));
        });
        // ... (busque clientes, etc. aqui também)
    }, []);

    // 2. EFEITO EM CASCATA: Busca os modelos quando uma marca é selecionada
    useEffect(() => {
        // Se nenhuma marca estiver selecionada, limpa as opções de modelo
        if (!automovel.marcaId) {
            setModelosOptions([]);
            setAutomovel(prev => ({ ...prev, modeloId: '' })); // Limpa o modelo selecionado
            return;
        }

        setIsModelosLoading(true);
        ModeloDataService.getByMarca(automovel.marcaId)
            .then(response => {
                const options = response.data.map(modelo => ({
                    value: modelo.id,
                    label: modelo.nome
                }));
                setModelosOptions(options);
            })
            .catch(e => console.error("Erro ao buscar modelos:", e))
            .finally(() => setIsModelosLoading(false));

    }, [automovel?.marcaId]); // Roda toda vez que o marcaId mudar


    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);


    const initialConsignacaoState = {
        id: null,
        valor: "",
        data_inicio: "",
        data_fim: "",
        automovelId: "",
        clienteId: "",
        funcionarioId: user?.id
    };

    const [consignacao, setConsignacao] = useState(initialConsignacaoState);

    useEffect(() => {
        setConsignacao(prev => ({
            ...prev,
            // automovelId: automovelId || "",
            clienteId: clienteId || ""
        }));
    }, [clienteId]);

    const handleInputChangeConsignacao = event => {
        const { name, value } = event.target;
        setConsignacao({ ...consignacao, [name]: value });
    };

    const handleProprietarioChange = (selectedOption) => {
        setConsignacao({ ...consignacao, clienteId: selectedOption ? selectedOption.value : "" });
    };

    // --- Event Handlers ---
    const handleInputChangeAutomovel = event => {
        const { name, value } = event.target;
        setAutomovel({ ...automovel, [name]: value });
    };

    const handleSelectChange = (selectedOption, fieldName) => {
        setAutomovel(prev => ({ ...prev, [fieldName]: selectedOption ? selectedOption.value : '' }));
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll()
        ]).then(([clientes, fisica, juridica]) => {
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data);
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
        if (!consignacao.data_inicio) vazioErros.push("data_inicio");
        if (!consignacao.clienteId) vazioErros.push("clienteId");
        if (!consignacao.valor) vazioErros.push("valorConsig");

        if (!automovel.valor) vazioErros.push("valor");
        if (!automovel.ano_fabricacao) vazioErros.push("ano_fabricacao");
        if (!automovel.ano_modelo) vazioErros.push("ano_modelo");
        if (!automovel.renavam) vazioErros.push("renavam");
        if (!automovel.placa) vazioErros.push("placa");
        if (!automovel.origem) vazioErros.push("origem");
        if (!automovel.km) vazioErros.push("km");
        if (!automovel.combustivel) vazioErros.push("combustivel");
        if (!automovel.cor) vazioErros.push("cor");
        if (!automovel.modeloId) vazioErros.push("modelo");
        if (!automovel.marcaId) vazioErros.push("marca");

        // Tamanho
        if (automovel.renavam && (automovel.renavam.length !== 11 || isNaN(automovel.renavam))) tamanhoErros.push("renavam");
        if (automovel.placa && automovel.placa.length !== 7) tamanhoErros.push("placa");

        // Tipo
        if (consignacao.valor && (isNaN(consignacao.valor) || consignacao.valor <= 0)) tipoErros.push("valorConsig");
        if (consignacao.data_inicio && consignacao.data_inicio > new Date()) tipoErros.push("data_inicio");

        if (automovel.ano_fabricacao && isNaN(automovel.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (automovel.ano_modelo && isNaN(automovel.ano_modelo)) tipoErros.push("ano_modelo");
        if (automovel.valor && (isNaN(automovel.valor) || automovel.valor <= 0)) tipoErros.push("valor");
        if (automovel.km && isNaN(automovel.km)) tipoErros.push("km");
        if (automovel.cor && (!isNaN(automovel.cor))) tipoErros.push("cor");
        if (automovel.ano_fabricacao > automovel.ano_modelo) tipoErros.push("ano_modelo_fabricacao");



        return { vazioErros, tamanhoErros, tipoErros };
    };

    const optionsFornecedor = cliente?.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            // value: d.id,
            // label: `Nome: ${d.nome || ""}\n${pessoaJuridica ? pessoaJuridica?.razao_social + "\n" : ""}${pessoaFisica ? "CPF: " + pessoaFisica?.cpf + "\n" : ""}${pessoaJuridica ? "CNPJ: " + pessoaJuridica?.cnpj : ""}`

            value: d.id,

            label: {
                nome: d.nome,
                razaoSocial: pessoaJuridica?.razao_social,
                cpf: pessoaFisica?.cpf,
                cnpj: pessoaJuridica?.cnpj,
                // Adicionamos um 'tipo' para facilitar a lógica na formatação
                tipo: pessoaJuridica ? 'juridica' : 'fisica'
            }
        }
    });


    const getCustomStyles = (fieldName) => ({
        option: (provided, state) => ({
            ...provided,
            padding: 10,
            fontSize: '1rem',
            fontWeight: 'normal',
            backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
            color: 'black',
            whiteSpace: 'pre-wrap',
        }),
        control: (provided) => ({
            ...provided,
            fontSize: '1rem',
            // Adiciona a borda vermelha se o campo tiver erro
            borderColor: hasError(fieldName) ? '#dc3545' : provided.borderColor,
            '&:hover': {
                borderColor: hasError(fieldName) ? '#dc3545' : provided['&:hover']?.borderColor,
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            fontWeight: 'normal',
            color: '#333',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    });


    const formatOptionLabelFornecedor = ({ value, label }) => {

        // Define o ícone e o título principal com base no tipo de fornecedor
        const isPessoaJuridica = label.tipo === 'juridica';
        const IconePrincipal = isPessoaJuridica ? FaBuilding : FaUserTie;

        // const titulo = label.nome;

        // --- LÓGICA CORRIGIDA ---
        // CORREÇÃO 1: Se for PJ, tenta usar a Razão Social. Se for nula, usa o Nome como fallback.
        const titulo = isPessoaJuridica ? (label.razaoSocial || label.nome) : label.nome;

        return (
            <div className="d-flex align-items-center">
                {/* Ícone principal à esquerda (Empresa ou Pessoa) */}
                <IconePrincipal size="2.5em" color="#0d6efd" className="me-3" />

                {/* Div para o conteúdo de texto */}
                <div>
                    {/* Linha Principal: Razão Social ou Nome */}
                    <div className="fw-bold fs-6">{titulo}</div>

                    {/* Linha Secundária: Nome Fantasia (se for PJ) ou Documento */}
                    <div className="small text-muted d-flex align-items-center mt-1">
                        {isPessoaJuridica ? (
                            <>
                                <FaFileContract className="me-1" />
                                <span>CNPJ: {label.cnpj}</span>
                            </>
                        ) : (
                            <>
                                <FaIdCard className="me-1" />
                                <span>CPF: {label.cpf}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    const saveAutomovel = async (e) => {

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


            // --- ETAPA 4: Criação do Automóvel ---
            const formData = new FormData();

            formData.append("ano_fabricacao", automovel.ano_fabricacao);
            formData.append("ano_modelo", automovel.ano_modelo);
            formData.append("cor", automovel.cor);
            formData.append("combustivel", automovel.combustivel);
            formData.append("km", automovel.km);
            formData.append("origem", automovel.origem);
            formData.append("placa", automovel.placa);
            formData.append("renavam", automovel.renavam);
            formData.append("valor", automovel.valor);
            formData.append("marcaId", automovel.marcaId);
            formData.append("modeloId", automovel.modeloId);
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

            var dataConsignacao = {
                valor: consignacao.valor,
                data_inicio: consignacao.data_inicio,
                data_fim: consignacao.data_fim || null,
                clienteId: consignacao.clienteId,
                automovelId: automovelResp?.data.id,
                funcionarioId: consignacao.funcionarioId
            }

            const consignacaoResp = await ConsignacaoDataService.create(dataConsignacao)
                .catch(e => {
                    console.error("Erro ao criar consignacao:", e);
                });

            setConsignacao(consignacaoResp.data);

            // --- SUCESSO! ---
            setSucesso(true);
            setMensagemSucesso("Operação de consignação realizada com sucesso!");

            // sessionStorage.removeItem("Venda");
            // sessionStorage.removeItem("Consignacao");
            // sessionStorage.removeItem("Compra");
            // sessionStorage.removeItem("Troca");

            sessionStorage.removeItem("NegocioAtual");

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
    };

    // Função auxiliar para checar se um campo tem erro e aplicar a classe
    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    useEffect(() => {
        if (erro) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [erro]);

    return (
        <>
            <Header />

            <div className="container">
                {/* Cabeçalho da Página */}
                <div className="mb-4 mt-3">
                    <h1 className="fw-bold">Registro de Consignação</h1>
                    <p className="text-muted">Preencha os dados abaixo para registrar uma nova consignação no sistema.</p>
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
                <form onSubmit={saveAutomovel} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="form-card card mb-4">
                        <div className="card-header d-flex align-items-center">
                            <FaCar className="me-2" /> {/* Ícone para a seção */}
                            Informações Principais do Veículo
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="marca" className="form-label">Marca</label>
                                    {/* <input type="text" className={`form-control ${hasError("marca") && "is-invalid"}`} id="marca" name="marca" onChange={handleInputChangeMarca} /> */}
                                    <Select
                                        placeholder="Selecione uma marca..."
                                        options={marcasOptions}
                                        value={marcasOptions.find(option => option.value === automovel.marcaId) || null}
                                        onChange={(option) => handleSelectChange(option, 'marcaId')}
                                        isClearable isSearchable
                                        styles={getCustomStyles("marca")}
                                    />

                                    {vazio.includes("marca") && <div className="form-text text-danger ms-1">Informe a marca.</div>}

                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="modelo" className="form-label">Modelo</label>
                                    {/* <input type="text" className={`form-control ${hasError("modelo") && "is-invalid"}`} id="modelo" name="modelo" onChange={handleInputChangeModelo} /> */}
                                    <Select
                                        placeholder="Selecione um modelo..."
                                        options={modelosOptions}
                                        value={modelosOptions.find(option => option.value === automovel.modeloId) || null}
                                        onChange={(option) => handleSelectChange(option, 'modeloId')}
                                        isDisabled={!automovel.marcaId} // Desabilita se nenhuma marca for selecionada
                                        isLoading={isModelosLoading}   // Mostra um spinner enquanto carrega
                                        isClearable isSearchable
                                        styles={getCustomStyles("modelo")}
                                    />
                                    {vazio.includes("modelo") && <div className="form-text text-danger ms-1">Informe o modelo.</div>}

                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="cor" className="form-label">Cor</label>
                                    <input type="text" className={`form-control ${hasError("cor") && "is-invalid"}`} id="cor" name="cor" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("cor") && <div className="invalid-feedback ms-1">Informe a cor.</div>}
                                    {tipo.includes("cor") && <div className="invalid-feedback ms-1">Cor inválida.</div>}
                                </div>

                                <div className="col-md-2">
                                    <label htmlFor="anofabricacao" className="form-label">Ano Fabricação</label>
                                    <input type="text" className={`form-control ${hasError("ano_fabricacao") && "is-invalid"} ${hasError("ano_modelo_fabricacao") && "is-invalid"}`} id="anofabricacao" name="ano_fabricacao" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("ano_fabricacao") && <div className="invalid-feedback ms-1">Informe o ano de fabricação.</div>}
                                    {tipo.includes("ano_fabricacao") && <div className="invalid-feedback ms-1">Ano de fabricação inválido.</div>}
                                    {tipo.includes("ano_modelo_fabricacao") && <div className="invalid-feedback ms-1">Ano de fabricação posterior a ano modelo.</div>}
                                </div>
                                <div className="col-md-2">
                                    <label htmlFor="anomodelo" className="form-label">Ano Modelo</label>
                                    <input type="text" className={`form-control ${hasError("ano_modelo") && "is-invalid"}`} id="anomodelo" name="ano_modelo" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("ano_modelo") && <div className="invalid-feedback ms-1">Informe o ano modelo.</div>}
                                    {tipo.includes("ano_modelo") && <div className="invalid-feedback ms-1">Ano modelo inválido.</div>}
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="placa" className="form-label">Placa</label>
                                    <input type="text" className={`form-control ${hasError("placa") && "is-invalid"}`} id="placa" name="placa" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("placa") && <div className="invalid-feedback ms-1">Informe a placa.</div>}
                                    {tamanho.includes("placa") && <div className="invalid-feedback ms-1">Placa inválida (deve ter 7 caracteres).</div>}
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="renavam" className="form-label">Renavam</label>
                                    <input type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("renavam") && <div className="invalid-feedback ms-1">Informe o Renavam.</div>}
                                    {tamanho.includes("renavam") && <div className="invalid-feedback ms-1">Renavam inválido (deve ter 11 dígitos numéricos).</div>}
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="km" className="form-label">Quilometragem</label>
                                    <input type="text" className={`form-control ${hasError("km") && "is-invalid"}`} id="km" name="km" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("km") && <div className="invalid-feedback ms-1">Informe a quilometragem.</div>}
                                    {tipo.includes("km") && <div className="invalid-feedback ms-1">Quilometragem inválida.</div>}
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
                                    {vazio.includes("combustivel") && <div className="invalid-feedback ms-1">Informe o combustível.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="origem" className="form-label">Origem do Veículo</label>
                                    <select className={`form-select ${hasError("origem") && "is-invalid"}`} id="origem" name="origem" value={automovel.origem} onChange={handleInputChangeAutomovel}>
                                        <option value="">Selecione...</option>
                                        <option value="Compra">Compra</option>
                                        <option value="Consignacao">Consignação</option>
                                        <option value="Troca">Troca</option>
                                    </select>
                                    {vazio.includes("origem") && <div className="invalid-feedback ms-1">Informe a origem.</div>}
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="valor" className={`form-label ${hasError("valor") && "is-invalid"}`}>Valor (R$)</label>
                                    <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("valor") && <div className="invalid-feedback ms-1">Informe o valor.</div>}
                                    {tipo.includes("valor") && <div className="invalid-feedback ms-1">Valor inválido.</div>}
                                </div>

                                <div className="col-md-8">
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
                        </div>
                    </div>

                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" /> {/* Ícone para a seção */}
                            Detalhes da Consignação
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label for="valor" class="form-label">Valor Acordado (R$)</label>
                                    <input type="text" class={`form-control ${hasError("valorConsig") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeConsignacao} />
                                    {vazio.includes("valorConsig") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor acordado.</div>}
                                    {tipo.includes("valorConsig") && <div id="valorHelp" class="form-text text-danger ms-1">Valor da consignação inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="data" class="form-label">Data Inicio</label><br />
                                    <DatePicker

                                        className={`form-control ${hasError("data_inicio") && "is-invalid"}`}
                                        calendarClassName="custom-datepicker-container"
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data_inicio"
                                        name="data_inicio"
                                        selected={consignacao.data_inicio}
                                        onChange={(date) => setConsignacao({ ...consignacao, data_inicio: date })}
                                        dateFormat="dd/MM/yyyy" // Formato da data
                                    />
                                    {vazio.includes("data_inicio") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                    {tipo.includes("data_inicio") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}

                                </div>
                                <div className="col-md-4">
                                    <label for="fornecedor" class="form-label">Proprietario</label>
                                    <Select formatOptionLabel={formatOptionLabelFornecedor} isSearchable={true} class="form-select" id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleProprietarioChange} value={optionsFornecedor.find(option => option.value === consignacao.clienteId) || null} isClearable={true}
                                        styles={getCustomStyles("clienteId")}
                                        filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.nome,
                                                label.razaoSocial,
                                                label.cpf,
                                                label.cnpj
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("clienteId") && <div className="form-text text-danger ms-1">Informe o fornecedor.</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botão de Submissão */}
                    <div className="d-flex justify-content-end pb-3">
                        <button type="button" className="btn btn-outline-secondary d-flex align-items-center btn-lg px-4 me-3" onClick={() => navigate(-1)}>
                            Voltar
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg px-4" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Salvando..
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </button>
                    </div>
                </form >
            </div >
        </>
    )
}


export default Consignacao;