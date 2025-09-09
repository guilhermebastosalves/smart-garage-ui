import Header from "../Header";
import { useState } from "react";
import TrocaDataService from "../../services/trocaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import ClienteDataService from "../../services/clienteDataService";
import Select from "react-select";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaFileSignature } from "react-icons/fa";
import React from "react";

const EditarTroca = () => {

    const { id } = useParams();

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);

    const [loading, setLoading] = useState(true);


    const [formData, setFormData] = useState({
        // Campos do Automóvel
        valor: "", data: "", forma_pagamento: "", comissao: "", valor_aquisicao: "",


        // IDs das associações
        clienteId: null,
        automovelId: null,
        automovel_fornecido: null

    });


    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            TrocaDataService.getById(id),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll()
        ]).then(([trocaId, automoveis, modelos, marcas, clientes, fisica, juridica]) => {
            const troca = trocaId.data;
            setFormData(prev => ({ ...prev, ...troca }));

            // Ajusta a data da compra antes de colocá-la no estado
            const dataTrocaAjustada = ajustarDataParaFusoLocal(troca.data);
            // Define o estado do formulário com a data já corrigida
            setFormData({
                ...troca,
                data: dataTrocaAjustada
            });

            // setCompra(compras.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
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

    const ajustarDataParaFusoLocal = (dataString) => {
        if (!dataString) return null;

        const dataUtc = new Date(dataString);

        // getTimezoneOffset() retorna a diferença em minutos entre UTC e o local (ex: 180 para GMT-3)
        const timezoneOffsetEmMs = dataUtc.getTimezoneOffset() * 60 * 1000;

        // Cria uma nova data somando o tempo UTC com o offset, efetivamente "cancelando" a conversão.
        const dataCorrigida = new Date(dataUtc.valueOf() + timezoneOffsetEmMs);

        return dataCorrigida;
    };


    // --- Event Handlers ---
    const handleProprietarioChange = (selectedOption) => {
        setFormData({ ...formData, clienteId: selectedOption ? selectedOption.value : "" });
    };

    const handleAutomovelChange = (selectedOption) => {
        setFormData({ ...formData, automovelId: selectedOption ? selectedOption.value : "" });
    };

    const handleAutomovelFornecidoChange = (selectedOption) => {
        setFormData({ ...formData, automovel_fornecido: selectedOption ? selectedOption.value : "" });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // COMISSAO EM CIMA DO VALOR DO AUTOMÓVEL, VALOR ESSE QUE A PRINCÍPIO NÃO É EDITÁVEL

    // useEffect(() => {
    //     // Só atualiza se o usuário não digitou manualmente
    //     // if (!troca.comissao) {
    //     let comissao = "";
    //     if (formData?.valor !== "") {
    //         comissao = formData?.valor < 50000 ? 300 : formData?.valor >= 100000 ? 700 : 500;
    //     }
    //     setFormData(prev => ({
    //         ...prev,
    //         comissao: comissao
    //     }));
    //     // }
    // }, [formData?.valor]);

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

    const navigate = useNavigate();

    const validateFields = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!formData.data) vazioErros.push("data");
        // if (!formData.valor) vazioErros.push("valor");
        if (!formData.valor_aquisicao) vazioErros.push("valor_aquisicao");
        if (!formData.clienteId) vazioErros.push("clienteId");
        if (!formData.automovelId) vazioErros.push("automovelId");
        if (!formData.automovel_fornecido) vazioErros.push("automovel_fornecido");
        // if (!formData.forma_pagamento) vazioErros.push("forma_pagamento");

        // Tipo
        if (formData.valor && isNaN(formData.valor)) tipoErros.push("valor");
        if (formData.valor && formData.valor < 0) tipoErros.push("valor");
        if (formData.valor_aquisicao && isNaN(formData.valor_aquisicao)) tipoErros.push("valor_aquisicao");
        if (formData.valor_aquisicao && formData.valor_aquisicao <= 0) tipoErros.push("valor_aquisicao");
        if (formData.data && formData.data > new Date()) tipoErros.push("data");

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

    const optionsAutomovel = automovel?.map((d) => {
        const nomeMarca = marca?.find(marca => marca.id === d.marcaId);
        const nomeModelo = modelo?.find(modelo => modelo.marcaId === nomeMarca.id);

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



    const editarTroca = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
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

            const trocaData = new FormData();
            trocaData.append("data", formData.data);
            trocaData.append("valor", formData.valor);
            trocaData.append("forma_pagamento", formData.forma_pagamento);
            trocaData.append("clienteId", formData.clienteId);
            trocaData.append("automovelId", formData.automovelId);
            trocaData.append("automovel_fornecido", formData.automovel_fornecido);
            trocaData.append("valor_aquisicao", formData.valor_aquisicao);

            await TrocaDataService.update(id, trocaData);

            setSucesso(true);
            setMensagemSucesso("Troca editada com sucesso!");

            setTimeout(() => {
                navigate('/listagem/trocas');
            }, 1500)

        } catch (error) {
            console.error("Erro ao atualizar troca:", error);
            // Lógica para tratar erros...
        } finally {
            setIsSubmitting(false);
        }
    }

    // Função auxiliar para checar se um campo tem erro e aplicar a classe
    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    const CustomDateInput = React.forwardRef(({ value, onClick, className }, ref) => (
        <>
            <input
                type="text"
                className={className}
                onClick={onClick}
                ref={ref}
                value={value}
                readOnly
            />
        </>
    ));

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



    return (
        <>
            <Header />

            <div className="container">
                <div className="mb-4 mt-3">
                    <h1 className="fw-bold">Edição de Troca</h1>
                    <p className="text-muted">Preencha os dados abaixo para editar a troca desejada.</p>
                </div>

                {erro &&
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{mensagemErro}</div>
                    </div>
                }
                {sucesso &&
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{mensagemSucesso}</div>
                    </div>
                }

                {/* Formulário com Seções */}
                <form onSubmit={editarTroca} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" /> {/* Ícone para a seção */}
                            Detalhes da Troca
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label for="valor" class="form-label">Valor Aquisicão (R$)</label>
                                    <input type="text" className={`form-control ${hasError("valor_aquisicao") && "is-invalid"}`} id="valora_aquisicao" name="valor_aquisicao" aria-describedby="valorHelp" onChange={handleInputChange} value={formData.valor_aquisicao ?? ""} />
                                    {vazio.includes("valor_aquisicao") && <div className="invalid-feedback">Informe o valor de aquisição.</div>}
                                    {tipo.includes("valor_aquisicao") && <div className="invalid-feedback">Valor aquisição inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="valor" class="form-label">Valor Diferença (R$)</label>
                                    <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChange} value={formData.valor ?? ""} />
                                    {vazio.includes("valor") && <div className="invalid-feedback">Informe o valor.</div>}
                                    {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="forma_pagamento" class="form-label">Forma de Pagamento</label>
                                    <Select className={`${hasError("forma_pagamento") && "is-invalid"}`} id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === formData.forma_pagamento) || null} onChange={(option) => setFormData(prevFormData => ({ ...prevFormData, forma_pagamento: option ? option.value : null }))} options={optionsFormaPagamento} isClearable={true}
                                        isDisabled={!formData.valor || formData.valor === 0 || formData.valor === "0" || formData.valor < 0}>
                                    </Select>
                                    {vazio.includes("forma_pagamento") && <div id="formapagamentohelp" class="form-text text-danger ms-1">Informe a forma de pagamento.</div>}
                                </div>

                                <div className="col-md-4">
                                    <label for="data" class="form-label">Data</label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        customInput={
                                            <CustomDateInput className={`form-control ${hasError("data") && "is-invalid"}`} />
                                        }
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="data"
                                        selected={formData.data}
                                        onChange={(date) => setFormData({ ...formData, data: date })}
                                        dateFormat="dd/MM/yyyy"
                                    />

                                    {(vazio.includes("data") || tipo.includes("data")) && (
                                        <div className="invalid-feedback" style={{ display: "block" }}>
                                            {vazio.includes("data") ? "Informe a data." : "Data inválida."}
                                        </div>
                                    )}

                                </div>
                                <div className="col-md-4">
                                    <label for="fornecedor" class="form-label">Proprietario</label>
                                    <Select formatOptionLabel={formatOptionLabelFornecedor} isSearchable={true} className={`${hasError("clienteId") && "is-invalid"}`} id="fornecedor" name="clienteId" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleProprietarioChange} value={optionsFornecedor.find(option => option.value === formData.clienteId) || null} isClearable={true}
                                        styles={getCustomStyles("clienteId")}
                                        filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.nome,
                                                label.razaoSocial,
                                                label.marca,
                                                label.modelo,
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("clienteId") && <div className="form-text text-danger ms-1">Informe o cliente.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="automovel" class="form-label">Automóvel</label>
                                    <Select formatOptionLabel={formatOptionLabel} isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovel" name="automovelId" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === formData.automovelId) || null} isClearable={true}
                                        styles={getCustomStyles("automovelId")}
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
                                    {vazio.includes("automovelId") && <div className="form-text text-danger ms-1">Informe o automóvel.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="automovel" class="form-label">Automóvel Fornecido</label>
                                    <Select formatOptionLabel={formatOptionLabel} isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovel" name="automovel_fornecido" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelFornecidoChange} value={optionsAutomovel.find(option => option.value === formData.automovel_fornecido) || null} isClearable={true}
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

                            </div>
                        </div>
                    </div>


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

                </form>

            </div >
        </>
    )
}

export default EditarTroca;