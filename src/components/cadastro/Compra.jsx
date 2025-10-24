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
import CompraDataService from "../../services/compraDataService";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaFileSignature } from "react-icons/fa";
import { Alert } from "react-bootstrap";
import HelpPopover from '../HelpPopover';
import { NumericFormat } from 'react-number-format';

const Compra = () => {

    const navigate = useNavigate();

    const location = useLocation();
    const clienteId = location.state?.clienteId;

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
    const [isReativacao, setIsReativacao] = useState(false);

    useEffect(() => {
        const automovelExistente = location.state?.automovelExistente;
        const clienteIdPredefinido = location.state?.clienteId;
        const negocio = JSON.parse(sessionStorage.getItem("NegocioAtual"));

        if (automovelExistente) {
            setAutomovel(automovelExistente);
            setAutomovel(prev => ({ ...prev, origem: negocio.negocio }));
            setIsReativacao(true);
        } else if (negocio) {
            setAutomovel(prev => ({ ...prev, origem: negocio.negocio }));
        }

        if (clienteIdPredefinido) {
            setCompra(prev => ({ ...prev, clienteId: clienteIdPredefinido }));
        }

    }, [location.state]);


    const [marcasOptions, setMarcasOptions] = useState([]);
    const [modelosOptions, setModelosOptions] = useState([]);
    const [isModelosLoading, setIsModelosLoading] = useState(false);

    useEffect(() => {
        MarcaDataService.getAll().then(response => {
            setMarcasOptions(response.data.map(m => ({ value: m.id, label: m.nome })));
        });
    }, []);

    useEffect(() => {
        if (!automovel.marcaId) {
            setModelosOptions([]);
            // setAutomovel(prev => ({ ...prev, modeloId: '' }));
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

    }, [automovel.marcaId]);



    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);


    const initialCompraState = {
        id: null,
        valor: "",
        data: new Date(),
        automovelId: "",
        clienteId: ""
    };

    const [compra, setCompra] = useState(initialCompraState);

    useEffect(() => {
        setCompra(prev => ({
            ...prev,
            clienteId: clienteId || ""
        }));
    }, [clienteId]);

    const handleInputChangeCompra = event => {
        const { name, value } = event.target;
        setCompra({ ...compra, [name]: value });
    };

    const handleFornecedorChange = (selectedOption) => {
        setCompra({ ...compra, clienteId: selectedOption ? selectedOption.value : "" });
    };

    // Event Handlers 
    const handleInputChangeAutomovel = event => {
        const { name, value } = event.target;
        const finalValue = name === 'placa' ? value.toUpperCase() : value;
        setAutomovel({ ...automovel, [name]: finalValue });
    };



    const handleSelectChange = (selectedOption, fieldName) => {
        setAutomovel(prev => ({ ...prev, [fieldName]: selectedOption ? selectedOption.value : '' }));
    };

    const [loading, setLoading] = useState(true);
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        setFileError('');

        if (!file) {
            setAutomovel({ ...automovel, file: null });
            return;
        }

        const tiposPermitidos = ['image/jpeg', 'image/png'];
        if (!tiposPermitidos.includes(file.type)) {
            setFileError('Formato de arquivo inválido. Por favor, envie apenas imagens JPG ou PNG.');
            e.target.value = null; // Limpa o input
            setAutomovel({ ...automovel, file: null });
            return;
        }

        const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
        if (file.size > tamanhoMaximo) {
            setFileError('Arquivo muito grande. O tamanho máximo permitido é de 5 MB.');
            e.target.value = null;
            setAutomovel({ ...automovel, file: null });
            return;
        }

        setAutomovel({ ...automovel, file });
    };

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        Promise.all([
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll(),
        ]).then(([clientes, fisica, juridica]) => {
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data)
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false);
        }).finally(() => {
            setLoading(false);
            clearTimeout(timeout);
        });
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [mensagemErro, setMensagemErro] = useState('');
    const [erro, setErro] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);



    const optionsFornecedor = cliente?.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            value: d.id,

            label: {
                nome: d.nome,
                razaoSocial: pessoaJuridica?.razao_social,
                cpf: pessoaFisica?.cpf,
                cnpj: pessoaJuridica?.cnpj,
                tipo: pessoaJuridica ? 'juridica' : 'fisica'
            }
        }
    });



    const formatOptionLabelFornecedor = ({ value, label }) => {

        const isPessoaJuridica = label.tipo === 'juridica';
        const IconePrincipal = isPessoaJuridica ? FaBuilding : FaUserTie;

        const titulo = isPessoaJuridica ? (label.razaoSocial || label.nome) : label.nome;

        return (
            <div className="d-flex align-items-center">
                <IconePrincipal size="2.5em" color="#0d6efd" className="me-3" />

                <div>
                    <div className="fw-bold fs-6">{titulo}</div>

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


    const validateFields = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!compra.valor) vazioErros.push("valorCompra");
        if (!compra.data) vazioErros.push("data");
        if (!compra.clienteId) vazioErros.push("clienteId");

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
        if (compra.valor && (isNaN(compra.valor) || compra.valor <= 0)) tipoErros.push("valorCompra");
        if (compra.data && compra.data > new Date()) tipoErros.push("data");

        if (automovel.ano_fabricacao && isNaN(automovel.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (automovel.ano_modelo && isNaN(automovel.ano_modelo)) tipoErros.push("ano_modelo");
        if (automovel.valor && (isNaN(automovel.valor) || automovel.valor <= 0)) tipoErros.push("valor");
        if (automovel.km && isNaN(automovel.km)) tipoErros.push("km");
        if (automovel.cor && (!isNaN(automovel.cor))) tipoErros.push("cor");
        if (automovel.ano_fabricacao && automovel.ano_modelo && automovel.ano_fabricacao > automovel.ano_modelo) tipoErros.push("ano_modelo_fabricacao");
        const anoAtual = new Date().getFullYear();
        if (automovel.ano_modelo && (!/^\d{4}$/.test(automovel.ano_modelo) || Number(automovel.ano_modelo) > anoAtual + 1)) { tipoErros.push("ano_modelo_futuro"); }



        return { vazioErros, tamanhoErros, tipoErros };
    };

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

    useEffect(() => {
        if (erro) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [erro]);

    const saveCompra = async (e) => {

        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
        setTamanho([]);
        setTipo([]);
        setIsSubmitting(true);


        const { vazioErros, tamanhoErros, tipoErros } = validateFields();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }

        try {

            let automovelIdParaCompra;

            if (isReativacao) {

                const dadosUpdate = {
                    ativo: true,
                    km: automovel.km,
                    valor: automovel.valor,
                    origem: automovel.origem
                };

                await AutomovelDataService.update(automovel.id, dadosUpdate);

                automovelIdParaCompra = automovel.id;

            } else {

                const verificacao = await AutomovelDataService.duplicidade({
                    placa: automovel.placa,
                    renavam: automovel.renavam
                })

                if (verificacao.data.erro) {
                    setErro(verificacao.data.erro);
                    setMensagemErro(verificacao.data.mensagemErro);
                    throw new Error(verificacao.data.mensagemErro);
                }

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
                formData.append("file", automovel.file);

                const automovelResp = await AutomovelDataService.create(formData, {
                    headers: { "Content-type": "multipart/form-data" }
                })
                    .catch(e => {
                        console.error("Erro ao cadastrar automovel:", e.response?.data || e.message);
                    });

                automovelIdParaCompra = automovelResp.data.id;
            }

            if (!automovelIdParaCompra) {
                throw new Error("Falha ao processar o automóvel.");
            }

            const dataCompra = {
                valor: compra.valor,
                data: compra.data,
                clienteId: compra.clienteId,
                automovelId: automovelIdParaCompra
            }

            const compraResp = await CompraDataService.create(dataCompra)
                .catch(e => {
                    console.error("Erro ao criar compra:", e);
                });

            setCompra(compraResp.data);

            setSucesso(true);
            setMensagemSucesso("Operação de compra realizada com sucesso!");

            sessionStorage.removeItem("NegocioAtual");

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
                    navigate('/troca', { state: { automovelId: automovelResp.data.id, clienteId: clienteId } });
                }, 1500);
            }
        } catch (error) {
            console.error("Erro no processo de salvamento:", error);
            setErro(true);
            const mensagem = error.response?.data?.mensagemErro || error.message || "Ocorreu um erro inesperado.";
            setMensagemErro(mensagem);
        } finally {
            setIsSubmitting(false);
        }

    }

    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);



    return (
        <>
            <Header />
            <div className="container">

                <div className="mb-4 mt-3">
                    <div className="d-flex align-items-center">
                        <h1 className="fw-bold mb-0 me-2">Registro de Compra</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Registro de Compra"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Esta página é utilizada para registrar um automóvel adquirido através de uma compra direta, adicionando-o ao inventário como propriedade da empresa.
                                    </p>
                                    <strong>Fluxo de Trabalho:</strong>
                                    <ol className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Detalhes da Compra:</strong> Preencha o valor pago pelo automóvel, a data da transação e selecione o cliente que está vendendo (Fornecedor).
                                        </li>
                                        <li className="mb-1">
                                            <strong>Informações do Automóvel:</strong> Cadastre todos os dados do veículo que está entrando no estoque. O campo "Valor de Venda" refere-se ao preço pelo qual o automóvel será anunciado.
                                        </li>
                                        <li>
                                            <strong>Modo Reativação:</strong> Se a compra for de um veículo que já esteve no sistema, alguns campos estarão bloqueados. Você poderá atualizar os campos "Quilometragem", "Valor de Venda" e "Cor".
                                        </li>
                                    </ol>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted">Preencha os dados abaixo para registrar uma nova compra.</p>
                </div>

                <p className="text-muted small">
                    Campos com <span className="text-danger">*</span> são de preenchimento obrigatório.
                </p>

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


                <form onSubmit={saveCompra} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" />
                            Detalhes da Compra
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div class="col-md-4">
                                    <label for="valor" class="form-label">Valor da Compra (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat className={`form-control ${hasError("valorCompra") && "is-invalid"}`} id="valor" name="valor" placeholder="R$ 0,00" value={compra.valor}
                                        onValueChange={(values) => {
                                            const syntheticEvent = {
                                                target: {
                                                    name: "valor",
                                                    value: values.value
                                                }
                                            };
                                            handleInputChangeCompra(syntheticEvent);
                                        }}

                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                    />
                                    {vazio.includes("valorCompra") && <div className="invalid-feedback ms-1">Informe o valor da compra.</div>
                                    }
                                    {tipo.includes("valorCompra") && <div className="invalid-feedback ms-1">Valor de compra inválido.</div>
                                    }
                                </div>
                                <div class="col-md-4">
                                    <label for="data" class="form-label">Data <span className="text-danger">*</span></label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        className={`form-control date-picker ${hasError("data") && "is-invalid"}`}
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="data"
                                        selected={compra.data}
                                        onChange={(date) => setCompra({ ...compra, data: date })}
                                        dateFormat="dd/MM/yyyy"
                                    />
                                    {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                    {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}

                                </div>
                                <div class="col-md-4">
                                    <label for="fornecedor" className="form-label">Fornecedor <span className="text-danger">*</span></label>
                                    <Select formatOptionLabel={formatOptionLabelFornecedor} isSearchable={true} className={`${hasError("clienteId") && "is-invalid"}`} id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleFornecedorChange} value={optionsFornecedor.find(option => option.value === compra.clienteId) || null} isClearable={true} styles={getCustomStyles("clienteId")}
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
                                    {vazio.includes("clienteId") && <div className="form-text text-danger ms-1">Informe a comprador.</div>}

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-card card mb-4">
                        <div className="card-header d-flex align-items-center">
                            <FaCar className="me-2" />
                            Informações Principais do Automóvel
                        </div>
                        <div className="card-body">

                            {/* ALERTA DE REATIVAÇÃO */}
                            {isReativacao && (
                                <Alert variant="info">
                                    <strong>Modo de Reativação:</strong> Você está a consignar um automóvel que já existe no sistema. Os dados principais não podem ser alterados. Por favor, atualize a **Quilometragem** e o novo **Valor de Venda**.
                                </Alert>
                            )}

                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="marca" className="form-label">Marca <span className="text-danger">*</span></label>
                                    <Select
                                        placeholder="Selecione uma marca..."
                                        options={marcasOptions}
                                        value={marcasOptions.find(option => option.value === automovel.marcaId) || null}
                                        onChange={(option) => handleSelectChange(option, 'marcaId')}
                                        isClearable isSearchable
                                        styles={getCustomStyles("marca")}
                                        isDisabled={isReativacao}
                                    />
                                    {vazio.includes("marca") && <div className="form-text text-danger ms-1">Informe a marca.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="modelo" className="form-label">Modelo <span className="text-danger">*</span></label>
                                    <Select
                                        placeholder="Selecione um modelo..."
                                        options={modelosOptions}
                                        value={modelosOptions.find(option => option.value === automovel.modeloId) || null}
                                        onChange={(option) => handleSelectChange(option, 'modeloId')}
                                        isDisabled={isReativacao || !automovel.marcaId}
                                        isLoading={isModelosLoading}
                                        isClearable isSearchable
                                        styles={getCustomStyles("modelo")}
                                    />
                                    {vazio.includes("modelo") && <div className="form-text text-danger ms-1">Informe o modelo.</div>}

                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="cor" className="form-label">Cor <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("cor") && "is-invalid"}`} id="cor" name="cor" onChange={handleInputChangeAutomovel} value={automovel.cor} />
                                    {vazio.includes("cor") && <div className="invalid-feedback ms-1">Informe a cor.</div>}
                                    {tipo.includes("cor") && <div className="invalid-feedback ms-1">Cor inválida.</div>}
                                </div>
                                <div className="col-md-2">
                                    <label htmlFor="anofabricacao" className="form-label">Ano Fabricação <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("ano_fabricacao") && "is-invalid"} ${hasError("ano_modelo_fabricacao") && "is-invalid"}`} id="anofabricacao" name="ano_fabricacao" onChange={handleInputChangeAutomovel} value={automovel.ano_fabricacao} readOnly={isReativacao} />
                                    {vazio.includes("ano_fabricacao") && <div className="invalid-feedback ms-1">Informe o ano de fabricação.</div>}
                                    {tipo.includes("ano_fabricacao") && <div className="invalid-feedback ms-1">Ano de fabricação inválido.</div>}
                                    {tipo.includes("ano_modelo_fabricacao") && <div className="invalid-feedback ms-1">Ano de fabricação posterior a ano modelo.</div>}
                                </div>
                                <div className="col-md-2">
                                    <label htmlFor="anomodelo" className="form-label">Ano Modelo <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("ano_modelo") && "is-invalid"} ${hasError("ano_modelo_futuro") && "is-invalid"}`} id="anomodelo" name="ano_modelo" onChange={handleInputChangeAutomovel} value={automovel.ano_modelo} readOnly={isReativacao} />
                                    {vazio.includes("ano_modelo") && <div className="invalid-feedback ms-1">Informe o ano modelo.</div>}
                                    {tipo.includes("ano_modelo") && <div className="invalid-feedback ms-1">Ano modelo inválido.</div>}
                                    {tipo.includes("ano_modelo_futuro") && (<div className="invalid-feedback ms-1">Ano modelo inválido (não pode ser maior que {new Date().getFullYear() + 1}).</div>)}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="placa" className="form-label">Placa <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("placa") && "is-invalid"}`} id="placa" name="placa" onChange={handleInputChangeAutomovel} value={automovel.placa} readOnly={isReativacao} />
                                    {vazio.includes("placa") && <div className="invalid-feedback ms-1">Informe a placa.</div>}
                                    {tamanho.includes("placa") && <div className="invalid-feedback ms-1">Placa inválida (deve ter 7 caracteres).</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="renavam" className="form-label">Renavam <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" onChange={handleInputChangeAutomovel} value={automovel.renavam} readOnly={isReativacao} />
                                    {vazio.includes("renavam") && <div className="invalid-feedback ms-1">Informe o Renavam.</div>}
                                    {tamanho.includes("renavam") && <div className="invalid-feedback ms-1">Renavam inválido (deve ter 11 dígitos numéricos).</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="km" className="form-label">Quilometragem <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("km") && "is-invalid"}`} id="km" name="km" onChange={handleInputChangeAutomovel} value={automovel.km} />
                                    {vazio.includes("km") && <div className="invalid-feedback ms-1">Informe a quilometragem.</div>}
                                    {tipo.includes("km") && <div className="invalid-feedback ms-1">Quilometragem inválida.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="combustivel" className="form-label">Combustível <span className="text-danger">*</span></label>
                                    <select className={`form-select ${hasError("combustivel") && "is-invalid"}`} id="combustivel" name="combustivel" onChange={handleInputChangeAutomovel} value={automovel.combustivel} readOnly={isReativacao}>
                                        <option value="">Selecione...</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Etanol">Etanol</option>
                                        <option value="Elétrico">Elétrico</option>
                                        <option value="Flex">Flex</option>
                                        <option value="Gasolina">Gasolina</option>
                                        <option value="Híbrido">Híbrido</option>
                                    </select>
                                    {vazio.includes("combustivel") && <div className="invalid-feedback ms-1">Informe o combustível.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="origem" className="form-label">Origem do Automóvel <span className="text-danger">*</span></label>
                                    <select className={`form-select ${hasError("origem") && "is-invalid"}`} id="origem" name="origem" value={automovel.origem} readOnly={true}>
                                        <option value="">Selecione...</option>
                                        <option value="Compra">Compra</option>
                                        <option value="Consignacao">Consignação</option>
                                        <option value="Troca">Troca</option>
                                    </select>
                                    {vazio.includes("origem") && <div className="invalid-feedback ms-1">Informe a origem.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="valor" className="form-label">Valor de Venda (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" placeholder="R$ 0,00" value={automovel.valor}
                                        onValueChange={(values) => {
                                            const syntheticEvent = {
                                                target: {
                                                    name: "valor",
                                                    value: values.value
                                                }
                                            };
                                            handleInputChangeAutomovel(syntheticEvent);
                                        }}

                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                    />
                                    {vazio.includes("valor") && <div className="invalid-feedback ms-1">Informe o valor de venda.</div>}
                                    {tipo.includes("valor") && <div className="invalid-feedback ms-1">Valor de venda inválido.</div>}
                                </div>
                                <div className="col-md-8">
                                    <label htmlFor="foto" className="form-label">Foto do Automóvel</label>
                                    <input
                                        type="file"
                                        className={`form-control ${fileError ? 'is-invalid' : ''}`}
                                        id="foto"
                                        name="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleFileChange}
                                    />
                                    {fileError && <div className="invalid-feedback d-block">{fileError}</div>}
                                </div>
                            </div>
                        </div>
                    </div>


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
    );
}

export default Compra;