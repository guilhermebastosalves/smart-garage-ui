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
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaFileSignature } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';


const Troca = () => {

    const { user } = useAuth();

    const navigate = useNavigate();

    const location = useLocation();
    const clienteId = location.state?.clienteId;
    const fisicaId = location.state?.fisicaId;
    const juridicaId = location.state?.juridicaId;

    const [modeloNegocio, setModeloNegocio] = useState(null);

    useEffect(() => {
        const negocio = sessionStorage.getItem("NegocioAtual");
        if (negocio) {
            setModeloNegocio(JSON.parse(negocio));
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

    }, [automovel.marcaId]); // Roda toda vez que o marcaId mudar


    const [automovelOpt, setAutomovelOpt] = useState([]);
    const [modeloOpt, setModeloOpt] = useState([]);
    const [marcaOpt, setMarcaOpt] = useState([]);

    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);

    const initialTrocaState = {
        id: null,
        comissao: "",
        forma_pagamento: "",
        valor: "",
        data: null,
        automovelId: "",
        clienteId: "",
        funcionarioId: user?.id,
        automovel_fornecido: "",
        valor_aquisicao: ""
    };

    const [troca, setTroca] = useState(initialTrocaState);

    useEffect(() => {
        setTroca(prev => ({
            ...prev,
            clienteId: clienteId || ""
        }));
    }, [clienteId]);

    useEffect(() => {
        // Só atualiza se o usuário não digitou manualmente
        // if (!troca.comissao) {
        let comissao = "";
        if (troca?.valor_aquisicao !== "") {
            comissao = troca?.valor_aquisicao < 50000 ? 300 : troca?.valor_aquisicao > 100000 ? 1500 : 500;
        }
        setTroca(prev => ({
            ...prev,
            comissao: comissao
        }));
        // }
    }, [troca?.valor_aquisicao]);

    const handleInputChangeTroca = event => {
        const { name, value } = event.target;
        setTroca({ ...troca, [name]: value });
    };

    const handleFornecedorChange = (selectedOption) => {
        setTroca({ ...troca, clienteId: selectedOption ? selectedOption.value : "" });
    };

    // --- Event Handlers ---
    const handleInputChangeAutomovel = event => {
        const { name, value } = event.target;
        setAutomovel({ ...automovel, [name]: value });
    };

    const handleSelectChange = (selectedOption, fieldName) => {
        setAutomovel(prev => ({ ...prev, [fieldName]: selectedOption ? selectedOption.value : '' }));
    };

    useEffect(() => {
        // 1. Pega e converte o valor do NOVO automóvel (que está sendo cadastrado)
        // Usamos parseFloat para garantir que é um número. Se for inválido, será NaN.
        const valorCarroNovo = parseFloat(troca.valor_aquisicao);

        // 2. Encontra as informações do automóvel FORNECIDO na lista já carregada
        // Isto evita uma chamada desnecessária à API.
        const carroFornecidoInfo = automovelOpt.find(
            (carro) => carro.id === troca.automovel_fornecido
        );

        // Pega e converte o valor do automóvel FORNECIDO
        const valorCarroFornecido = carroFornecidoInfo
            ? parseFloat(carroFornecidoInfo.valor)
            : NaN;

        // 3. Verifica se ambos os valores são números válidos
        if (!isNaN(valorCarroNovo) && !isNaN(valorCarroFornecido)) {
            // Se ambos são válidos, calcula a diferença
            // const diferenca = valorCarroNovo - valorCarroFornecido;
            const diferenca = valorCarroFornecido - valorCarroNovo;

            // Atualiza o estado da 'troca' de forma segura, sem apagar os outros campos

            // if (diferenca >= 0) {
            setTroca(prevTroca => ({
                ...prevTroca,
                valor: diferenca.toString() // Converte para string para o input
            }));
            // } else {
            // setTroca(prevTroca => ({
            //     ...prevTroca,
            //     valor: "" // Define como string vazia
            // }));
            // }


        } else {
            // Se um dos valores for limpo ou inválido, limpa o campo de diferença
            setTroca(prevTroca => ({
                ...prevTroca,
                valor: "" // Define como string vazia
            }));
        }
        // 4. O efeito roda sempre que um dos valores de origem mudar
    }, [troca.valor_aquisicao, troca.automovel_fornecido, automovelOpt]);

    const [loading, setLoading] = useState(true);
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        // Limpa erros anteriores
        setFileError('');

        if (!file) {
            setAutomovel({ ...automovel, file: null });
            return;
        }

        // 1. Validação do Tipo/Extensão
        const tiposPermitidos = ['image/jpeg', 'image/png'];
        if (!tiposPermitidos.includes(file.type)) {
            setFileError('Formato de arquivo inválido. Por favor, envie apenas imagens JPG ou PNG.');
            e.target.value = null; // Limpa o input
            setAutomovel({ ...automovel, file: null });
            return;
        }

        // 2. Validação do Tamanho (5 MB)
        const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
        if (file.size > tamanhoMaximo) {
            setFileError('Arquivo muito grande. O tamanho máximo permitido é de 5 MB.');
            e.target.value = null; // Limpa o input
            setAutomovel({ ...automovel, file: null });
            return;
        }

        // Se passou em todas as validações, armazena o arquivo
        setAutomovel({ ...automovel, file });
    };


    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll(),
            AutomovelDataService.getByAtivo(),
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
        if (!troca.automovel_fornecido) vazioErros.push("automovel_fornecido");
        if (!troca.valor_aquisicao) vazioErros.push("valor_aquisicao");
        // if (!troca.forma_pagamento) vazioErros.push("forma_pagamento");

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
        // if (troca.valor && isNaN(troca.valor)) tipoErros.push("valor_diferenca");
        if (troca.comissao && isNaN(troca.comissao)) tipoErros.push("comissao");
        if (troca.valor_aquisicao && (isNaN(troca.valor_aquisicao) || troca.valor_aquisicao <= 0)) tipoErros.push("valor_aquisicao");
        if (troca.data && troca.data > new Date()) tipoErros.push("data");

        if (automovel.ano_fabricacao && isNaN(automovel.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (automovel.ano_modelo && isNaN(automovel.ano_modelo)) tipoErros.push("ano_modelo");
        if (automovel.valor && (isNaN(automovel.valor) || automovel.valor <= 0)) tipoErros.push("valor");
        if (automovel.km && isNaN(automovel.km)) tipoErros.push("km");
        if (automovel.cor && (!isNaN(automovel.cor))) tipoErros.push("cor");
        if (automovel.ano_fabricacao && automovel.ano_modelo && automovel.ano_fabricacao > automovel.ano_modelo) tipoErros.push("ano_modelo_fabricacao");



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

    const optionsAutomovel = automovelOpt?.map((d) => {
        const nomeMarca = marcaOpt?.find(marca => marca.id === d.marcaId);
        const nomeModelo = modeloOpt?.find(modelo => modelo.id === d.modeloId);

        return {
            // value: d.id,
            // label: `Modelo: ${nomeModelo ? nomeModelo?.nome + " |" : ""} Marca: ${nomeMarca ? nomeMarca?.nome + " |" : ""} | Renavam: ${d.renavam} | Ano: ${d.ano_modelo}`

            value: d.id,

            label: {
                marca: nomeMarca?.nome,
                modelo: nomeModelo?.nome,
                renavam: d.renavam,
                ano: d.ano_modelo,
                placa: d.placa
            }
        };
    });

    const formatOptionLabel = ({ value, label }) => (
        <div className="d-flex align-items-center">
            {/* Ícone principal à esquerda */}
            <FaCar size="2.5em" color="#0d6efd" className="me-3" />

            {/* Div para o conteúdo de texto */}
            <div>
                {/* Linha Principal: Marca e Modelo */}
                <div className="fw-bold fs-6">
                    {label.marca || "Marca não encontrada"} {label.modelo || ""}
                </div>

                {/* Linha Secundária: Renavam e Ano com ícones */}
                <div className="small text-muted d-flex align-items-center mt-1">
                    <FaRegIdCard className="me-1" />
                    <span>Renavam: {label.renavam}</span>
                    <span className="mx-2">|</span>
                    <FaCalendarAlt className="me-1" />
                    <span>Ano: {label.ano}</span>
                </div>
            </div>
        </div>
    );

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

    const getCustomStyles = (fieldName) => ({
        option: (provided, state) => ({
            ...provided,
            padding: 15,
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

    // Função auxiliar para checar se um campo tem erro e aplicar a classe
    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    useEffect(() => {
        if (erro) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [erro]);


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

            const trocaData = new FormData();

            trocaData.append("comissao", troca.comissao);
            trocaData.append("valor", troca.valor);
            trocaData.append("data", troca.data);
            trocaData.append("forma_pagamento", troca.forma_pagamento);
            trocaData.append("clienteId", troca.clienteId);
            trocaData.append("automovelId", automovelResp?.data.id);
            trocaData.append("automovel_fornecido", troca.automovel_fornecido);
            trocaData.append("funcionarioId", troca.funcionarioId);
            trocaData.append("valor_aquisicao", troca.valor_aquisicao);

            const trocaResp = await TrocaDataService.create(trocaData)
                .catch(e => {
                    console.error("Erro ao criar troca:", e);
                });

            setTroca(trocaResp.data);

            const autoFornecidoResp = await AutomovelDataService.update(troca?.automovel_fornecido,
                { ativo: false }
            ).catch(e => {
                console.error("Erro ao inativar automóvel fornecido:", e);
            });


            // --- SUCESSO! ---
            setSucesso(true);
            setMensagemSucesso("Operação de troca realizada com sucesso!");

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

    }


    return (
        <>
            <Header />

            <div className="container">

                {/* Cabeçalho da Página */}
                <div className="mb-4 mt-3">
                    <h1 className="fw-bold">Registro de Troca</h1>
                    <p className="text-muted">Preencha os dados abaixo para registrar uma nova troca no sistema.</p>
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

                    <div className="form-card card mb-4">
                        <div className="card-header d-flex align-items-center">
                            <FaCar className="me-2" /> {/* Ícone para a seção */}
                            Informações Principais do Automóvel
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
                                    {vazio.includes("cor") && <div className="invalid-feedback">Informe a cor.</div>}
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
                                    <label htmlFor="origem" className="form-label">Origem do Automóvel</label>
                                    <select className={`form-select ${hasError("origem") && "is-invalid"}`} id="origem" name="origem" value={automovel.origem} onChange={handleInputChangeAutomovel}>
                                        <option value="">Selecione...</option>
                                        <option value="Compra">Compra</option>
                                        <option value="Consignacao">Consignação</option>
                                        <option value="Troca">Troca</option>
                                    </select>
                                    {vazio.includes("origem") && <div className="invalid-feedback ms-1">Informe a origem.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="valor" className="form-label">Valor (R$)</label>
                                    <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" onChange={handleInputChangeAutomovel} />
                                    {vazio.includes("valor") && <div className="invalid-feedback ms-1">Informe o valor.</div>}
                                    {tipo.includes("valor") && <div className="invalid-feedback ms-1">Valor inválido.</div>}
                                </div>
                                <div className="col-md-8">
                                    <label htmlFor="foto" className="form-label">Foto do Automóvel</label>
                                    <input
                                        type="file"
                                        className={`form-control ${fileError ? 'is-invalid' : ''}`}
                                        id="foto"
                                        name="file"
                                        accept="image/png, image/jpeg" // Sugere os tipos corretos para o usuário
                                        onChange={handleFileChange} // Usa a nova função de validação
                                    />
                                    {fileError && <div className="invalid-feedback d-block">{fileError}</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" /> {/* Ícone para a seção */}
                            Detalhes da Troca
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label for="fornecedor" class="form-label">Fornecedor</label>
                                    <Select formatOptionLabel={formatOptionLabelFornecedor} isSearchable={true} className={`${hasError("fornecedor") && "is-invalid"}`} id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleFornecedorChange} value={optionsFornecedor.find(option => option.value === troca.clienteId) || null} isClearable={true}
                                        styles={getCustomStyles("clienteId")}
                                        filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.nome,
                                                label.razaoSocial,
                                                label.cpf,
                                                label.cnpj,
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("clienteId") && <div className="form-text text-danger ms-1">Informe o cliente.</div>}
                                </div>

                                <div className="col-md-4">
                                    <label for="automovel_fornecido" class="form-label">Automóvel Fornecido</label>
                                    <Select formatOptionLabel={formatOptionLabel} isSearchable={true} className={`${hasError("automovel_fornecido") && "is-invalid"}`} id="automovel_fornecido" name="automovel_fornecido" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setTroca({ ...troca, automovel_fornecido: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === troca.automovel_fornecido) || null} isClearable={true}
                                        styles={getCustomStyles("automovel_fornecido")}
                                        filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.marca,
                                                label.modelo,
                                                label.renavam,
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("automovel_fornecido") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel fornecido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="valor_aquisicao" class="form-label">Valor Aquisição (R$)</label>
                                    <input type="text" className={`form-control ${hasError("valor_aquisicao") && "is-invalid"}`} id="valor_aquisicao" name="valor_aquisicao" aria-describedby="valorHelp" onChange={handleInputChangeTroca} />
                                    {vazio.includes("valor_aquisicao") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor de aquisição.</div>}
                                    {tipo.includes("valor_aquisicao") && <div id="valorHelp" class="form-text text-danger ms-1">Valor aquisição inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="valor" class="form-label">Valor Diferença (R$)</label>
                                    <input type="text" className={`form-control ${hasError("valor_diferenca") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" readOnly value={troca.valor || ""} />
                                    {/* {vazio.includes("valor_diferenca") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor diferença.</div>}
                                    {tipo.includes("valor_diferenca") && <div id="valorHelp" class="form-text text-danger ms-1">Valor diferença inválido.</div>} */}
                                </div>
                                <div className="col-md-3">
                                    <label for="forma_pagamento" class="form-label">Forma de Pagamento</label>
                                    <Select className={`${hasError("forma_pagamento") && "is-invalid"}`} id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === troca.forma_pagamento)} onChange={(option) => setTroca({ ...troca, forma_pagamento: option ? option.value : null })} options={optionsFormaPagamento} isClearable={true}
                                        isDisabled={!troca.valor || troca.valor === 0 || troca.valor === "0" || troca.valor < 0}>
                                    </Select>
                                    {vazio.includes("forma_pagamento") && <div id="formapagamentohelp" class="form-text text-danger ms-1">Informe a forma de pagamento.</div>}
                                </div>
                                <div className="col-md-3">
                                    <label for="comissao" class="form-label">Comissão</label>
                                    <input type="text" className={`form-control ${hasError("comissao") && "is-invalid"}`} id="comissao" name="comissao" aria-describedby="comissaoHelp" value={troca.comissao} />
                                    {vazio.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Informe o valor de comissão.</div>}
                                    {tipo.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Valor de comissão inválido.</div>}
                                </div>
                                <div className="col-md-2">
                                    <label for="data" class="form-label">Data</label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
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
    );
}

export default Troca;