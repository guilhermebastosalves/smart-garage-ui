import Header from "../Header";
import { useState } from "react";
import ConsignacaoDataService from "../../services/consignacaoDataService";
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
import React from "react";
import 'react-datepicker/dist/react-datepicker.css';
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaTag } from "react-icons/fa";

const EditarConsignacao = () => {

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
        valor: "", data_inicio: null,
        data_fim: "", ativo: "",

        // IDs das associações
        clienteId: null,
        automovelId: null,

    });

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            ConsignacaoDataService.getById(id),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll(),
        ]).then(([consignacaoId, automoveis, modelos, marcas, cliente, fisica, juridica]) => {
            const consignacao = consignacaoId.data;
            setFormData(prev => ({ ...prev, ...consignacao }));

            // Ajusta a data da compra antes de colocá-la no estado
            const dataCompraAjustada = ajustarDataParaFusoLocal(consignacao.data_inicio);
            // Define o estado do formulário com a data já corrigida

            setFormData({
                ...consignacao,
                data_inicio: dataCompraAjustada
            });


            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            setCliente(cliente.data);
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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
        // if (!formData.data) vazioErros.push("data");
        // if (!formData.valor) vazioErros.push("valor");
        // if (!formData.clienteId) vazioErros.push("clienteId");
        // if (!formData.automovelId) vazioErros.push("automovelId");

        // Tipo
        // if (formData.valor && isNaN(formData.valor)) tipoErros.push("valor");
        // if (formData.valor && formData.valor <= 0) tipoErros.push("valor");
        // if (formData.data && formData.data > new Date()) tipoErros.push("data");

        return { vazioErros, tamanhoErros, tipoErros };
    };

    const navigate = useNavigate();

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
        const nomeModelo = modelo?.find(modelo => modelo.id === d.modeloId);

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

    const editarConsignacao = async (e) => {

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

            const consigData = new FormData();
            consigData.append("data_inicio", formData.data_inicio);
            consigData.append("valor", formData.valor);
            consigData.append("clienteId", formData.clienteId);
            consigData.append("automovelId", formData.automovelId);



            await ConsignacaoDataService.update(id, consigData);

            setSucesso(true);
            setMensagemSucesso("Consignação editada com sucesso!");

            setTimeout(() => {
                navigate('/listagem/consignacoes');
            }, 1500)

        } catch (error) {
            console.error("Erro ao atualizar consignação:", error);
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


    return (
        <>
            <Header />
            <div className="container">
                <div>Página de Consignacao</div>
            </div>

            <div className="container">

                {erro &&
                    <div class="alert alert-danger" role="alert">
                        {mensagemErro}
                    </div>
                }
                {sucesso &&
                    <div class="alert alert-success" role="alert">
                        {mensagemSucesso}
                    </div>
                }

                {/* Formulário com Seções */}
                <form onSubmit={editarConsignacao} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações da Consignação</legend>
                        <div className="row g-3">
                            <div className="col-md-2">
                                <label for="valor" class="form-label">Valor</label>
                                <input type="text" class="form-control" id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChange} value={formData.valor ?? ""} />
                                {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>}
                            </div>
                            <div className="col-md-2">
                                <label for="data" class="form-label">Data Inicio</label><br />
                                <DatePicker
                                    calendarClassName="custom-datepicker-container"
                                    customInput={
                                        <CustomDateInput className={`form-control ${hasError("data") && "is-invalid"}`} />
                                    }
                                    className="form-control"
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data_inicio"
                                    name="data_inicio"
                                    selected={formData.data_inicio ? new Date(formData.data_inicio) : null}
                                    onChange={(date) => setFormData({ ...formData, data_inicio: date })}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />

                                {/* {vazio.includes("data") && <div className="invalid-feedback">Informe a data.</div>}
                                {tipo.includes("data") && <div className="invalid-feedback">Data inválida.</div>} */}

                                {(vazio.includes("data") || tipo.includes("data")) && (
                                    <div className="invalid-feedback" style={{ display: "block" }}>
                                        {vazio.includes("data") ? "Informe a data." : "Data inválida."}
                                    </div>
                                )}

                            </div>
                            <div className="col-md-4">
                                <label for="fornecedor" class="form-label">Proprietario</label>
                                <Select formatOptionLabel={formatOptionLabelFornecedor} isSearchable={true} class="form-select" id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleProprietarioChange} value={optionsFornecedor.find(option => option.value === formData.clienteId) || null} isClearable={true}
                                    styles={customStyles}
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
                                {vazio.includes("clienteId") && <div className="invalid-feedback">Informe o proprietário.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="automovel" class="form-label">Automóvel</label>
                                <Select formatOptionLabel={formatOptionLabel} isSearchable={true} class="form-select" id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === formData.automovelId) || null} isClearable={true}
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
                                {vazio.includes("automovelId") && <div className="invalid-feedback">Informe o automóvel.</div>}
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
                                "Editar Consignação"
                            )}
                        </button>
                    </div>
                </form>
            </div >
        </>
    )
}

export default EditarConsignacao;