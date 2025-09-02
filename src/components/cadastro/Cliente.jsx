import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useCallback, useEffect } from "react";
import ClienteDataService from "../../services/clienteDataService";
import CidadeDataService from '../../services/cidadeDataService';
import EstadoDataService from '../../services/estadoDataService';
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import EnderecoDataService from "../../services/enderecoDataService";
import { useNavigate } from "react-router-dom";
import ToggleButton from 'react-bootstrap/ToggleButton';
import { ButtonGroup } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const Cliente = () => {

    const navigate = useNavigate();

    const consignacao = { negocio: "Consignacao" };
    const compra = { negocio: "Compra" };
    const troca = { negocio: "Troca" };

    const location = useLocation();
    const automovelId = location.state?.automovelId;

    const initialClienteState = { nome: "", email: "", telefone: "" };
    const initialFisicaState = { cpf: "", rg: "" };
    const initialJuridicaState = { cnpj: "", razao_social: "", nome_responsavel: "" };
    const initialEnderecoState = { cep: "", logradouro: "", bairro: "", numero: "" };
    const initialCidadeState = { nome: "" };
    const initialEstadoState = { uf: "" };

    const [cliente, setCliente] = useState(initialClienteState);
    const [fisica, setFisica] = useState(initialFisicaState);
    const [juridica, setJuridica] = useState(initialJuridicaState);
    const [endereco, setEndereco] = useState(initialEnderecoState);
    const [cidade, setCidade] = useState(initialCidadeState);
    const [estado, setEstado] = useState(initialEstadoState);
    const [opcao, setOpcao] = useState('fisica');

    const resetFormulario = () => {
        setCliente(initialClienteState);
        setFisica(initialFisicaState);
        setJuridica(initialJuridicaState);
        setEndereco(initialEnderecoState);
        setCidade(initialCidadeState);
        setEstado(initialEstadoState);
        // Também limpa as mensagens de erro/validação
        setVazio([]);
        setTamanho([]);
        setTipo([]);
        setErro(false);
        setMensagemErro('');
    };


    const [modeloNegocio, setModeloNegocio] = useState(null);

    useEffect(() => {
        const negocio = sessionStorage.getItem("NegocioAtual");
        if (negocio) {
            setModeloNegocio(JSON.parse(negocio));
        }
    }, []);


    const radios = [
        { name: 'Pessoa Física', value: 'fisica' },
        { name: 'Pessoa Jurídica', value: 'juridica' }
    ];

    const [radioValue, setRadioValue] = useState('fisica');



    const handleInputChangeCliente = event => {
        const { name, value } = event.target;
        setCliente({ ...cliente, [name]: value });
    };

    const handleInputChangeEndereco = event => {
        const { name, value } = event.target;
        setEndereco({ ...endereco, [name]: value });
    };

    const handleInputChangeCidade = event => {
        const { value } = event.target;
        setCidade({ ...cidade, nome: value });
    };

    const handleInputChangeEstado = (selectedOption) => {
        setEstado({ uf: selectedOption?.value ?? "" });
    };

    const handleInputChangeFisica = event => {
        const { name, value } = event.target;
        setFisica({ ...fisica, [name]: value });
    };

    const handleInputChangeJuridica = event => {
        const { name, value } = event.target;
        setJuridica({ ...juridica, [name]: value });
    };

    const optionsEstados = [
        {
            label: "AC",
            value: "AC"
        },
        {
            label: "AL",
            value: "AL"
        },
        {
            label: "AP",
            value: "AP"
        },
        {
            label: "AM",
            value: "AM"
        },
        {
            label: "BA",
            value: "BA"
        },
        {
            label: "CE",
            value: "CE"
        },
        {
            label: "DF",
            value: "DF"
        },
        {
            label: "ES",
            value: "ES"
        },
        {
            label: "GO",
            value: "GO"
        },
        {
            label: "Ma",
            value: "MA"
        },
        {
            label: "MT",
            value: "MT"
        },
        {
            label: "MS",
            value: "MS"
        },
        {
            label: "MG",
            value: "MG"
        },
        {
            label: "PA",
            value: "PA"
        },
        {
            label: "PB",
            value: "PB"
        },
        {
            label: "PR",
            value: "PR"
        },
        {
            label: "PE",
            value: "PE"
        },
        {
            label: "PI",
            value: "PI"
        },
        {
            label: "RJ",
            value: "RJ"
        },
        {
            label: "RN",
            value: "RN"
        },
        {
            label: "RS",
            value: "RS"
        },
        {
            label: "RO",
            value: "RO"
        },
        {
            label: "RR",
            value: "RR"
        },
        {
            label: "SC",
            value: "SC"
        },
        {
            label: "SP",
            value: "SP"
        },
        {
            label: "SE",
            value: "SE"
        },
        {
            label: "TO",
            value: "TO"
        }
    ];


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


    const validateFieldsPessoaFisica = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!cliente.nome) vazioErros.push("nome");
        if (!cliente.email) vazioErros.push("email");
        if (!cliente.telefone) vazioErros.push("telefone");

        if (!fisica.cpf) vazioErros.push("cpf");
        if (!fisica.rg) vazioErros.push("rg");

        if (!endereco.cep) vazioErros.push("cep");
        if (!endereco.logradouro) vazioErros.push("logradouro");
        if (!endereco.bairro) vazioErros.push("bairro");
        if (!endereco.numero) vazioErros.push("numero");

        if (!cidade.nome) vazioErros.push("cidade");

        if (!estado.uf) vazioErros.push("estado");


        // Tamanho
        if (cliente.telefone && (isNaN(cliente.telefone))) tamanhoErros.push("telefone");

        if (fisica.cpf && (fisica.cpf != '' && (fisica.cpf.length !== 11) || isNaN(fisica.cpf))) tamanhoErros.push("cpf");
        if (fisica.rg && (fisica.rg != '' && (fisica.rg.length !== 9) || isNaN(fisica.rg))) tamanhoErros.push("rg");

        if (endereco.cep && (endereco.cep != '' && (endereco.cep.length !== 8) || isNaN(endereco.cep))) tamanhoErros.push("cep");

        // Tipo
        if (endereco.numero && isNaN(endereco.numero)) tipoErros.push("numero");

        if (cliente.data_cadastro && cliente.data_cadastro > new Date()) tipoErros.push("data_cadastro");

        return { vazioErros, tamanhoErros, tipoErros };
    };

    const validateFieldsPessoaJuridica = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!cliente.nome) vazioErros.push("nome");
        // if (!cliente.data_cadastro) vazioErros.push("data");
        if (!cliente.email) vazioErros.push("email");
        if (!cliente.telefone) vazioErros.push("telefone");

        if (!juridica.nome_responsavel) vazioErros.push("nome_responsavel");
        if (!juridica.cnpj) vazioErros.push("cnpj");

        if (!endereco.cep) vazioErros.push("cep");
        if (!endereco.logradouro) vazioErros.push("logradouro");
        if (!endereco.bairro) vazioErros.push("bairro");
        if (!endereco.numero) vazioErros.push("numero");

        if (!cidade.nome) vazioErros.push("cidade");

        if (!estado.uf) vazioErros.push("estado");


        // Tamanho
        if (cliente.telefone && (cliente.telefone.length !== 11 || isNaN(cliente.telefone))) tamanhoErros.push("telefone");

        if (juridica.cnpj && (juridica.cnpj != '' && (juridica.cnpj.length !== 14) || isNaN(juridica.cnpj))) tamanhoErros.push("cnpj");

        if (endereco.cep && (endereco.cep != '' && (endereco.cep.length !== 8) || isNaN(endereco.cep))) tamanhoErros.push("cep");

        // Tipo
        if (endereco.numero && isNaN(endereco.numero)) tipoErros.push("numero");

        if (cliente.data_cadastro && cliente.data_cadastro > new Date()) tipoErros.push("data_cadastro");


        return { vazioErros, tamanhoErros, tipoErros };
    };


    useEffect(() => {
        if (erro) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [erro, mensagemErro]);


    const saveCliente = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
        setTamanho([]);
        setTipo([]);
        setIsSubmitting(true); // Desabilita o botão

        const { vazioErros, tamanhoErros, tipoErros } = validateFieldsPessoaFisica();

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
            const verificacao = await FisicaDataService.duplicidade({
                rg: fisica.rg,
                cpf: fisica.cpf
            })

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro); // erro vindo do back
                setMensagemErro(verificacao.data.mensagemErro);
                throw new Error(verificacao.data.mensagemErro);
            }

            var dataCliente = {
                // ativo: cliente.ativo,
                // data_cadastro: cliente.data_cadastro,
                data_cadastro: new Date(),
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone
            }

            const verificacaoemail = await ClienteDataService.duplicidade({
                email: cliente.email
            })

            if (verificacaoemail.data.erro) {
                setErro(verificacaoemail.data.erro); // erro vindo do back
                setMensagemErro(verificacaoemail.data.mensagemErro);
                throw new Error(verificacaoemail.data.mensagemErro);
            }

            const clienteResp = await ClienteDataService.create(dataCliente)
                .catch(e => {
                    console.error("Erro ao criar cliente:", e);
                });

            setCliente(clienteResp.data);

            var dataFisica = {
                cpf: fisica.cpf,
                rg: fisica.rg,
                clienteId: clienteResp?.data.id
            }

            const fisicaResp = await FisicaDataService.create(dataFisica)
                .catch(e => {
                    console.error("Erro ao criar pessoa fisica:", e);
                });

            setFisica(fisicaResp.data);

            var dataEstado = {
                uf: estado.uf
            }

            const estadoResp = await EstadoDataService.create(dataEstado)
                .catch(e => {
                    console.error("Erro ao criar estado:", e);
                });

            setEstado(estadoResp.data);

            var dataCidade = {
                nome: cidade.nome,
                estadoId: estadoResp?.data.id
            }

            const cidadeResp = await CidadeDataService.create(dataCidade)
                .catch(e => {
                    console.error("Erro ao criar cidade:", e);
                });

            setCidade(cidadeResp.data);

            var dataEndereco = {
                bairro: endereco.bairro,
                cep: endereco.cep,
                logradouro: endereco.logradouro,
                numero: endereco.numero,
                clienteId: clienteResp?.data.id,
                cidadeId: cidadeResp?.data.id
            }

            const enderecoResp = await EnderecoDataService.create(dataEndereco)
                .catch(e => {
                    console.error("Erro ao criar endereco:", e);
                });

            setEndereco(enderecoResp.data);

            setSucesso(true);
            setMensagemSucesso("Cliente cadastrado com sucesso!");

            // sessionStorage.removeItem("Venda");
            // sessionStorage.removeItem("Consignacao");
            // sessionStorage.removeItem("Compra");
            // sessionStorage.removeItem("Troca");

            sessionStorage.removeItem("NegocioAtual");

            setTimeout(() => {
                if (modeloNegocio?.negocio === "Venda") {
                    navigate('/venda', { state: { clienteId: clienteResp.data.id, automovelId: automovelId } });
                }
                if (modeloNegocio?.negocio === "Consignacao") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(consignacao));
                    navigate('/consignacao', { state: { clienteId: clienteResp.data.id } });
                }
                if (modeloNegocio?.negocio === "Compra") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(compra));
                    navigate('/compra', { state: { clienteId: clienteResp.data.id } });
                }
                if (modeloNegocio?.negocio === "Troca") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(troca));
                    navigate('/troca', { state: { clienteId: clienteResp.data.id } });
                }

            }, 1500);
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

    const saveClienteJuridica = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();
        setIsSubmitting(true);

        const { vazioErros, tamanhoErros, tipoErros } = validateFieldsPessoaJuridica();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        // Só continua se não houver erros
        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }

        try {

            const verificacao = await JuridicaDataService.duplicidade({
                cnpj: juridica.cnpj,
                razao_social: juridica.razao_social
            })

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro); // erro vindo do back
                setMensagemErro(verificacao.data.mensagemErro);
                // return; // não continua
                throw new Error(verificacao.data.mensagemErro);
            }

            var dataCliente = {
                // ativo: cliente.ativo,
                // data_cadastro: cliente.data_cadastro,
                data_cadastro: new Date(),
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone
            }

            const verificacaoemail = await ClienteDataService.duplicidade({
                email: cliente.email
            })

            if (verificacaoemail.data.erro) {
                setErro(verificacaoemail.data.erro); // erro vindo do back
                setMensagemErro(verificacaoemail.data.mensagemErro);
                throw new Error(verificacaoemail.data.mensagemErro);
            }

            const clienteJuridicaResp = await ClienteDataService.create(dataCliente)
                .catch(e => {
                    console.error("Erro ao criar cliente:", e);
                });

            setCliente(clienteJuridicaResp.data);

            var dataJuridica = {
                cnpj: juridica.cnpj,
                razao_social: juridica.razao_social,
                nome_responsavel: juridica.nome_responsavel,
                clienteId: clienteJuridicaResp?.data.id
            }

            console.log(dataJuridica);

            const juridicaResp = await JuridicaDataService.create(dataJuridica)
                .catch(e => {
                    console.error("Erro ao criar pessoa jurídica:", e);
                });

            setJuridica(juridicaResp.data);

            var dataEstado = {
                uf: estado.uf
            }

            const estadoResp = await EstadoDataService.create(dataEstado)
                .catch(e => {
                    console.error("Erro ao criar estado:", e);
                });

            setEstado(estadoResp.data);

            var dataCidade = {
                nome: cidade.nome,
                estadoId: estadoResp?.data.id
            }

            const cidadeResp = await CidadeDataService.create(dataCidade)
                .catch(e => {
                    console.error("Erro ao criar cidade:", e);
                });

            setCidade(cidadeResp.data);

            var dataEndereco = {
                bairro: endereco.bairro,
                cep: endereco.cep,
                logradouro: endereco.logradouro,
                numero: endereco.numero,
                clienteId: clienteJuridicaResp?.data.id,
                cidadeId: cidadeResp?.data.id
            }

            const enderecoResp = await EnderecoDataService.create(dataEndereco)
                .catch(e => {
                    console.error("Erro ao criar endereco:", e);
                });

            setEndereco(enderecoResp.data);

            setSucesso(true);
            setMensagemSucesso("Cliente cadastrado com sucesso!");

            // sessionStorage.removeItem("Venda");
            // sessionStorage.removeItem("Consignacao");
            // sessionStorage.removeItem("Compra");
            // sessionStorage.removeItem("Troca");

            sessionStorage.removeItem("NegocioAtual");


            setTimeout(() => {
                if (modeloNegocio?.negocio === "Venda") {
                    navigate('/venda', { state: { clienteId: clienteJuridicaResp.data.id, automovelId: automovelId } });
                }
                if (modeloNegocio?.negocio === "Consignacao") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(consignacao));
                    navigate('/consignacao', { state: { clienteId: clienteJuridicaResp.data.id } });
                }
                if (modeloNegocio?.negocio === "Compra") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(compra));
                    navigate('/compra', { state: { clienteId: clienteJuridicaResp.data.id } });
                }
                if (modeloNegocio?.negocio === "Troca") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(troca));
                    navigate('/troca', { state: { clienteId: clienteJuridicaResp.data.id } });
                }

            }, 1500);
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

    // Função auxiliar para checar se um campo tem erro e aplicar a classe
    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);


    return (
        <>
            <Header />
            {/* Cabeçalho da Página */}
            <div className={`mb-4 mt-3 container`}>
                <h1 className="fw-bold">Cadastro de Cliente</h1>
                <p className="text-muted">Preencha os dados abaixo para registrar um novo cliente no sistema.</p>
            </div>
            <div className="container">

                {/* Alertas */}
                {erro && (
                    <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
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

                <div className={`row mt-4 ${sucesso && "d-none"}`}>
                    <ButtonGroup className="mb-2">
                        {radios.map((radio, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`radio-${idx}`}
                                type="radio"
                                variant="outline-primary"
                                name="radio"
                                value={radio.value}
                                checked={radioValue === radio.value}
                                onChange={(e) => {
                                    setRadioValue(e.currentTarget.value);
                                    setOpcao(radio.value);
                                    resetFormulario();
                                }}
                            >
                                {radio.name}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>

                </div>


                {opcao === 'fisica' &&

                    <form onSubmit={saveCliente} className={`mt-5 ${sucesso && "d-none"}`}>

                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações do Cliente</legend>
                            <div className="row g-3">
                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Nome</label>
                                    <input type="text" className={`form-control ${hasError("nome") && "is-invalid"}`} id="nome" name="nome" aria-describedby="nomeHelp" value={cliente.nome} onChange={handleInputChangeCliente} />
                                    {vazio.includes("nome") && <div className="invalid-feedback">Informe o nome.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Email</label>
                                    <input type="text" className={`form-control ${hasError("email") && "is-invalid"}`} id="email" name="email" aria-describedby="emailHelp" value={cliente.email} onChange={handleInputChangeCliente} />
                                    {vazio.includes("email") && <div className="invalid-feedback">Informe o email.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="telefone" class="form-label">Telefone</label>
                                    <input type="text" className={`form-control ${hasError("telefone") && "is-invalid"}`} id="telefone" name="telefone" aria-describedby="telefoneHelp" value={cliente.telefone} onChange={handleInputChangeCliente} />
                                    {vazio.includes("telefone") && <div className="invalid-feedback">Informe o telefone.</div>}
                                    {tamanho.includes("telefone") && <div className="invalid-feedback">Telefone inválido.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="cpf" class="form-label">CPF</label>
                                    <input type="text" className={`form-control ${hasError("cpf") && "is-invalid"}`} id="cpf" name="cpf" aria-describedby="cpfeHelp" value={fisica.cpf} onChange={handleInputChangeFisica} />
                                    {vazio.includes("cpf") && <div className="invalid-feedback">Informe o CPF.</div>}
                                    {tamanho.includes("cpf") && <div className="invalid-feedback">CPF inválidO (deve ter 11 caracteres numéricos).</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="rg" class="form-label">RG</label>
                                    <input type="text" className={`form-control ${hasError("rg") && "is-invalid"}`} id="rg" name="rg" aria-describedby="rgHelp" value={fisica.rg} onChange={handleInputChangeFisica} />
                                    {vazio.includes("rg") && <div className="invalid-feedback">Informe o RG.</div>}
                                    {tamanho.includes("rg") && <div className="invalid-feedback">RG inválido (deve ter 9 caracteres numéricos).</div>}
                                </div>
                                {/* <div class="col-md-4 ">
                                    <label for="data" class="form-label">Data cadastro</label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        className={`form-control ${hasError("data") && "is-invalid"}`}
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data_cadastro"
                                        name="data_cadastro"
                                        selected={cliente.data_cadastro}
                                        onChange={(date) => setCliente({ ...cliente, data_cadastro: date })}
                                        dateFormat="dd/MM/yyyy" // Formato da data
                                    />
                                    {vazio.includes("data") && <div className="invalid-feedback">Informe a data de cadastro.</div>}
                                    {tipo.includes("data") && <div className="invalid-feedback">Data inválida.</div>}

                                </div> */}
                            </div>
                        </fieldset>

                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações de Endereço</legend>
                            <div className="row g-3">
                                <div class="col-md-4">
                                    <label for="cep" class="form-label">CEP</label>
                                    <input type="text" className={`form-control ${hasError("cep") && "is-invalid"}`} id="cep" name="cep" aria-describedby="cepHelp" value={endereco.cep} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("cep") && <div className="invalid-feedback">Informe o CEP.</div>}
                                    {tamanho.includes("cep") && <div className="invalid-feedback">CEP inválido (deve ter 8 caracteres numéricos).</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="cidade" class="form-label">Cidade</label>
                                    <input type="text" className={`form-control ${hasError("cidade") && "is-invalid"}`} id="cidade" name="cidade" aria-describedby="cidadeHelp" value={cidade.nome} onChange={handleInputChangeCidade} />
                                    {vazio.includes("cidade") && <div className="invalid-feedback">Informe a cidade.</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="uf" class="form-label">Estado</label>
                                    <Select isSearchable={true} isClearable={true} className={`${hasError("estado") && "is-invalid"}`} id="uf" name="uf" placeholder="Selecione o estado" options={optionsEstados} value={optionsEstados.find(option => option.value === estado.uf)} onChange={handleInputChangeEstado}>
                                    </Select>
                                    {vazio.includes("estado") && <div className="invalid-feedback">Informe o estado.</div>}
                                </div>


                                <div class="col-md-4">
                                    <label for="logradouro" class="form-label">Logradouro</label>
                                    <input type="text" className={`form-control ${hasError("logradouro") && "is-invalid"}`} id="logradouro" name="logradouro" aria-describedby="logradourodeHelp" value={endereco.logradouro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("logradouro") && <div className="invalid-feedback">Informe o logradouro.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="bairro" class="form-label">Bairro</label>
                                    <input type="text" className={`form-control ${hasError("bairro") && "is-invalid"}`} id="bairro" name="bairro" aria-describedby="bairroHelp" value={endereco.bairro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("bairro") && <div className="invalid-feedback">Informe o bairro.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="numero" class="form-label">Número</label>
                                    <input type="text" className={`form-control ${hasError("numero") && "is-invalid"}`} id="numero" name="numero" aria-describedby="numerodeHelp" value={endereco.numero} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("numero") && <div className="invalid-feedback">Informe o número.</div>}
                                    {tipo.includes("numero") && <div className="invalid-feedback">Número inválido.</div>}
                                </div>

                            </div>
                        </fieldset>

                        {/* Botão de Submissão */}
                        <div className="d-flex justify-content-end pb-3">
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

                    </form >}

                {opcao === 'juridica' &&
                    <form onSubmit={saveClienteJuridica} className={`mt-5 ${sucesso && "d-none"}`}>

                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações do Cliente</legend>
                            <div className="row g-3">
                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Nome</label>
                                    <input type="text" className={`form-control ${hasError("nome") && "is-invalid"}`} id="nome" name="nome" aria-describedby="nomeHelp" value={cliente.nome} onChange={handleInputChangeCliente} />
                                    {vazio.includes("nome") && <div className="invalid-feedback">Informe o nome.</div>}

                                </div>

                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Email</label>
                                    <input type="text" className={`form-control ${hasError("email") && "is-invalid"}`} id="email" name="email" aria-describedby="emailHelp" value={cliente.email} onChange={handleInputChangeCliente} />

                                    {vazio.includes("email") && <div className="invalid-feedback">Informe o email.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="telefone" class="form-label">Telefone</label>
                                    <input type="text" className={`form-control ${hasError("telefone") && "is-invalid"}`} id="telefone" name="telefone" aria-describedby="telefoneHelp" value={cliente.telefone} onChange={handleInputChangeCliente} />

                                    {vazio.includes("telefone") && <div className="invalid-feedback">Informe o telefone.</div>}
                                    {tamanho.includes("telefone") && <div className="invalid-feedback">Telefone inválido.</div>}
                                </div>
                                <div class="col-md-4">
                                    <label for="cnpj" class="form-label">CNPJ</label>
                                    <input type="text" className={`form-control ${hasError("cnpj") && "is-invalid"}`} id="cpf" name="cnpj" aria-describedby="cnpjHelp" value={juridica.cnpj} onChange={handleInputChangeJuridica} />

                                    {vazio.includes("cnpj") && <div className="invalid-feedback">Informe o CNPJ.</div>}
                                    {tamanho.includes("cnpj") && <div className="invalid-feedback">CNPJ inválido (deve ter 14 caracteres numéricos).</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="razao_social" class="form-label">Razão Social</label>
                                    <input type="text" class="form-control" id="razao_social" name="razao_social" aria-describedby="razao_socialHelp" value={juridica.razao_social} onChange={handleInputChangeJuridica} />
                                </div>

                                <div class="col-md-4">
                                    <label for="nome_responsavel" class="form-label">Nome do responsável</label>
                                    <input type="text" className={`form-control ${hasError("nome_responsavel") && "is-invalid"}`} id="nome_responsavel" name="nome_responsavel" aria-describedby="nome_responsavelHelp" value={juridica.nome_responsavel} onChange={handleInputChangeJuridica} />

                                    {vazio.includes("nome_responsavel") && <div className="invalid-feedback">Informe o nome do responsável.</div>}
                                </div>
                                {/* <div class="col-md-4">
                                    <label for="data" class="form-label">Data cadastro</label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        className={`form-control ${hasError("data") && "is-invalid"}`}
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data_cadastro"
                                        name="data_cadastro"
                                        selected={cliente.data_cadastro}
                                        onChange={(date) => setCliente({ ...cliente, data_cadastro: date })}
                                        dateFormat="dd/MM/yyyy" // Formato da data
                                    />

                                    {vazio.includes("data") && <div className="invalid-feedback">Informe a data.</div>}
                                    {tipo.includes("data") && <div className="invalid-feedback">Data inválida.</div>}
                                </div> */}
                            </div>
                        </fieldset>


                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações de Endereço</legend>
                            <div className="row g-3">
                                <div class="col-md-4">
                                    <label for="cep" class="form-label">CEP</label>
                                    <input type="text" className={`form-control ${hasError("cep") && "is-invalid"}`} id="cep" name="cep" aria-describedby="cepHelp" value={endereco.cep} onChange={handleInputChangeEndereco} />

                                    {vazio.includes("cep") && <div className="invalid-feedback">Informe o CEP.</div>}
                                    {tamanho.includes("cep") && <div className="invalid-feedback">CEP inválido (deve ter 8 caracteres numéricos).</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="cidade" class="form-label">Cidade</label>
                                    <input type="text" className={`form-control ${hasError("cidade") && "is-invalid"}`} id="cidade" name="cidade" aria-describedby="cidadeHelp" value={cidade.nome} onChange={handleInputChangeCidade} />
                                    {vazio.includes("cidade") && <div className="invalid-feedback">Informe a cidade.</div>}

                                </div>

                                <div class="col-md-4">
                                    <label for="uf" class="form-label">Estado</label>
                                    <Select isSearchable={true} className={`${hasError("estado") && "is-invalid"}`} id="uf" name="uf" placeholder="Selecione o estado" options={optionsEstados} value={optionsEstados.find(option => option.value === estado.uf)} onChange={handleInputChangeEstado}>
                                    </Select>

                                    {vazio.includes("estado") && <div className="invalid-feedback">Informe o estado.</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="logradouro" class="form-label">Logradouro</label>
                                    <input type="text" className={`form-control ${hasError("logradouro") && "is-invalid"}`} id="logradouro" name="logradouro" aria-describedby="logradourodeHelp" value={endereco.logradouro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("logradouro") && <div className="invalid-feedback">Informe o logradouro.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="bairro" class="form-label">Bairro</label>
                                    <input type="text" className={`form-control ${hasError("bairro") && "is-invalid"}`} id="bairro" name="bairro" aria-describedby="bairroHelp" value={endereco.bairro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("bairro") && <div className="invalid-feedback">Informe o bairro.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="numero" class="form-label">Número</label>
                                    <input type="text" className={`form-control ${hasError("numero") && "is-invalid"}`} id="numero" name="numero" aria-describedby="numerodeHelp" value={endereco.numero} onChange={handleInputChangeEndereco} />

                                    {vazio.includes("numero") && <div className="invalid-feedback">Informe o número.</div>}
                                    {tipo.includes("numero") && <div className="invalid-feedback">Número inválido.</div>}
                                </div>
                            </div>
                        </fieldset>

                        {/* Botão de Submissão */}
                        <div className="d-flex justify-content-end pb-3">
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

                    </form >}
            </div >
        </>
    )
}


export default Cliente;