import Header from "../Header";
import { useState } from "react";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import Select from "react-select";

import { FaCar } from "react-icons/fa";

const EditarAutomovel = () => {

    const { id } = useParams();

    const [formData, setFormData] = useState({
        // Campos do Automóvel
        ano_fabricacao: "", ano_modelo: "", cor: "", combustivel: "",
        km: "", origem: "", placa: "", renavam: "", valor: "",

        // IDs das associações
        marcaId: null,
        modeloId: null,

        // Arquivo de imagem
        file: null
    });

    useEffect(() => {
        // 1. Busca o automóvel
        AutomovelDataService.getById(id).then(automovelResp => {
            const automovel = automovelResp.data;
            // Coloca os dados do automóvel no formData
            setFormData(prev => ({ ...prev, ...automovel }));

        }).catch(e => console.error("Erro ao carregar dados:", e));
    }, [id]); // Roda apenas uma vez quando o ID muda


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
        if (!formData.marcaId) {
            setModelosOptions([]);
            setFormData(prev => ({ ...prev, modeloId: '' })); // Limpa o modelo selecionado
            return;
        }

        setIsModelosLoading(true);
        ModeloDataService.getByMarca(formData.marcaId)
            .then(response => {
                const options = response.data.map(modelo => ({
                    value: modelo.id,
                    label: modelo.nome
                }));
                setModelosOptions(options);
            })
            .catch(e => console.error("Erro ao buscar modelos:", e))
            .finally(() => setIsModelosLoading(false));

    }, [formData.marcaId]); // Roda toda vez que o marcaId mudar


    // States para as opções dos selects
    const [marcasOptions, setMarcasOptions] = useState([]);
    const [modelosOptions, setModelosOptions] = useState([]);
    const [isModelosLoading, setIsModelosLoading] = useState(false);


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => {
        setFormData(prev => ({ ...prev, file: event.target.files[0] }));
    };

    const handleSelectChange = (selectedOption, fieldName) => {
        setFormData(prev => ({ ...prev, [fieldName]: selectedOption ? selectedOption.value : '' }));
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

    const navigate = useNavigate();


    const validateFields = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!formData.valor) vazioErros.push("valor");
        if (!formData.ano_fabricacao) vazioErros.push("ano_fabricacao");
        if (!formData.ano_modelo) vazioErros.push("ano_modelo");
        if (!formData.renavam) vazioErros.push("renavam");
        if (!formData.placa) vazioErros.push("placa");
        if (!formData.origem) vazioErros.push("origem");
        if (!formData.km) vazioErros.push("km");
        if (!formData.combustivel) vazioErros.push("combustivel");
        if (!formData.cor) vazioErros.push("cor");
        if (!formData.modeloId) vazioErros.push("modelo");
        if (!formData.marcaId) vazioErros.push("marca");

        // Tamanho
        if (formData.renavam && (formData.renavam.length !== 11 || isNaN(formData.renavam))) tamanhoErros.push("renavam");
        if (formData.placa && formData.placa.length !== 7) tamanhoErros.push("placa");

        // Tipo
        if (formData.ano_fabricacao && isNaN(formData.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (formData.ano_modelo && isNaN(formData.ano_modelo)) tipoErros.push("ano_modelo");
        if (formData.valor && (isNaN(formData.valor) || formData.valor <= 0)) tipoErros.push("valor");
        if (formData.km && isNaN(formData.km)) tipoErros.push("km");
        if (formData.cor && (!isNaN(formData.cor))) tipoErros.push("cor");

        return { vazioErros, tamanhoErros, tipoErros };
    };


    const editAutomovel = async (e) => {

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

            // --- ETAPA 1: ATUALIZAR MARCA (se o nome mudou) ---
            // Aqui você pode adicionar uma lógica para verificar se o nome da marca foi realmente alterado
            // antes de fazer a chamada à API, para evitar chamadas desnecessárias.
            // if (formData.marcaId) {
            //     await MarcaDataService.update(formData.marcaId, { nome: formData.marcaNome });
            // }

            // --- ETAPA 2: ATUALIZAR MODELO (se o nome mudou) ---
            // if (formData.modeloId) {
            //     await ModeloDataService.update(formData.modeloId, { nome: formData.modeloNome });
            // }

            // --- ETAPA 3: ATUALIZAR AUTOMÓVEL ---
            const automovelData = new FormData();
            automovelData.append("ano_fabricacao", formData.ano_fabricacao);
            automovelData.append("ano_modelo", formData.ano_modelo);
            automovelData.append("cor", formData.cor);
            automovelData.append("combustivel", formData.combustivel);
            automovelData.append("km", formData.km);
            automovelData.append("origem", formData.origem);
            automovelData.append("placa", formData.placa);
            automovelData.append("renavam", formData.renavam);
            automovelData.append("valor", formData.valor);
            automovelData.append("marcaId", formData.marcaId);
            automovelData.append("modeloId", formData.modeloId);
            automovelData.append("file", formData.file);


            await AutomovelDataService.update(id, automovelData, {
                headers: { "Content-type": "multipart/form-data" }
            });

            // --- ETAPA 4: SUCESSO ---
            setSucesso(true);
            setMensagemSucesso("Atualizações realizadas com sucesso!");
            setTimeout(() => navigate(`/detalhes/${id}`), 1500);

        } catch (error) {
            console.error("Erro ao atualizar automovel:", error);
            // Lógica para tratar erros...
        } finally {
            setIsSubmitting(false);
        }

    }

    // Função auxiliar para checar se um campo tem erro e aplicar a classe
    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

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


    return (
        <>
            <Header />

            <div className="container">

                <div className="mb-4 mt-3">
                    <h1 className="fw-bold">Edição do Automóvel</h1>
                    <p className="text-muted">Preencha os dados abaixo para editar o automóvel slecionado.</p>
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
                <form onSubmit={editAutomovel} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="form-card card mb-4">
                        <div className="card-header d-flex align-items-center">
                            <FaCar className="me-2" /> {/* Ícone para a seção */}
                            Informações Principais do Veículo
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="marca" className="form-label">Marca</label>
                                    {/* <input value={formData.marcaNome ?? ""} type="text" className={`form-control ${hasError("marca") && "is-invalid"}`} id="marcaNome" name="marcaNome" onChange={handleInputChange} /> */}
                                    <Select
                                        placeholder="Selecione uma marca..."
                                        options={marcasOptions}
                                        value={marcasOptions.find(option => option.value === formData.marcaId) || null}
                                        onChange={(option) => handleSelectChange(option, 'marcaId')}
                                        isClearable isSearchable
                                        styles={getCustomStyles("marca")}
                                    />
                                    {vazio.includes("marca") && <div className="form-text text-danger ms-1">Informe a marca.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="modelo" className="form-label">Modelo</label>
                                    {/* <input value={formData.modeloNome ?? ""} type="text" className={`form-control ${hasError("modelo") && "is-invalid"}`} id="modeloNome" name="modeloNome" onChange={handleInputChange} /> */}
                                    <Select
                                        placeholder="Selecione um modelo..."
                                        options={modelosOptions}
                                        value={modelosOptions.find(option => option.value === formData.modeloId) || null}
                                        onChange={(option) => handleSelectChange(option, 'modeloId')}
                                        isDisabled={!formData.marcaId} // Desabilita se nenhuma marca for selecionada
                                        isLoading={isModelosLoading}   // Mostra um spinner enquanto carrega
                                        isClearable isSearchable
                                        styles={getCustomStyles("modelo")}
                                    />
                                    {vazio.includes("modelo") && <div className="form-text text-danger ms-1">Informe o modelo.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="cor" className="form-label">Cor</label>
                                    <input value={formData.cor ?? ""} type="text" className={`form-control ${hasError("cor") && "is-invalid"}`} id="cor" name="cor" onChange={handleInputChange} />
                                    {vazio.includes("cor") && <div className="invalid-feedback">Informe a cor.</div>}
                                    {tipo.includes("cor") && <div className="invalid-feedback">Cor inválida.</div>}
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="anofabricacao" className="form-label">Ano Fabricação</label>
                                    <input value={formData.ano_fabricacao ?? ""} type="text" className={`form-control ${hasError("ano_fabricacao") && "is-invalid"}`} id="anofabricacao" name="ano_fabricacao" onChange={handleInputChange} />
                                    {vazio.includes("ano_fabricacao") && <div className="invalid-feedback">Informe o ano.</div>}
                                    {tipo.includes("ano_fabricacao") && <div className="invalid-feedback">Ano inválido.</div>}
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="anomodelo" className="form-label">Ano Modelo</label>
                                    <input value={formData.ano_modelo ?? ""} type="text" className={`form-control ${hasError("ano_modelo") && "is-invalid"}`} id="anomodelo" name="ano_modelo" onChange={handleInputChange} />
                                    {vazio.includes("ano_modelo") && <div className="invalid-feedback">Informe o ano.</div>}
                                    {tipo.includes("ano_modelo") && <div className="invalid-feedback">Ano inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="placa" className="form-label">Placa</label>
                                    <input value={formData.placa ?? ""} type="text" className={`form-control ${hasError("placa") && "is-invalid"}`} id="placa" name="placa" onChange={handleInputChange} />
                                    {vazio.includes("placa") && <div className="invalid-feedback">Informe a placa.</div>}
                                    {tamanho.includes("placa") && <div className="invalid-feedback">Placa inválida (deve ter 7 caracteres).</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="renavam" className="form-label">Renavam</label>
                                    <input value={formData.renavam ?? ""} type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" onChange={handleInputChange} />
                                    {vazio.includes("renavam") && <div className="invalid-feedback">Informe o Renavam.</div>}
                                    {tamanho.includes("renavam") && <div className="invalid-feedback">Renavam inválido (deve ter 11 dígitos numéricos).</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="km" className="form-label">Quilometragem</label>
                                    <input value={formData.km ?? ""} type="text" className={`form-control ${hasError("km") && "is-invalid"}`} id="km" name="km" onChange={handleInputChange} />
                                    {vazio.includes("km") && <div className="invalid-feedback">Informe a quilometragem.</div>}
                                    {tipo.includes("km") && <div className="invalid-feedback">Quilometragem inválida.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="combustivel" className="form-label">Combustível</label>
                                    <select value={formData.combustivel ?? ""} className={`form-select ${hasError("combustivel") && "is-invalid"}`} id="combustivel" name="combustivel" onChange={handleInputChange}>
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
                                    <select value={formData.origem ?? ""} className={`form-select ${hasError("origem") && "is-invalid"}`} id="origem" name="origem" onChange={handleInputChange}>
                                        <option value="">Selecione...</option>
                                        <option value="Compra">Compra</option>
                                        <option value="Consignacao">Consignação</option>
                                        <option value="Troca">Troca</option>
                                    </select>
                                    {vazio.includes("origem") && <div className="invalid-feedback">Informe a origem.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="valor" className="form-label">Valor (R$)</label>
                                    <input value={formData.valor ?? ""} type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" onChange={handleInputChange} />
                                    {vazio.includes("valor") && <div className="invalid-feedback">Informe o valor.</div>}
                                    {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="foto" className="form-label">Foto do Veículo</label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        id="foto"
                                        name="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>

                            </div>
                        </div>
                    </div>


                    {/* Botão de Submissão */}
                    <div className="d-flex justify-content-end">
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
            </div>
        </>
    );
}

export default EditarAutomovel;