import Header from "../Header";
import { useState } from "react";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import ClienteDataService from "../../services/clienteDataService";
import Select from "react-select";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";

const EditarAutomovel = () => {

    const { id } = useParams();

    const [automovel, setAutomovel] = useState('');
    const [modelo, setModelo] = useState([]);
    const [nomeModelo, setNomeModelo] = useState('');
    const [modeloId, setModeloId] = useState('');
    const [marca, setMarca] = useState('');
    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);

    const [formData, setFormData] = useState({
        // Campos do Automóvel
        ano_fabricacao: "", ano_modelo: "", cor: "", combustivel: "",
        km: "", origem: "", placa: "", renavam: "", valor: "",

        // IDs das associações
        marcaId: null,
        modeloId: null,

        // Nomes para os inputs de edição
        marcaNome: "",
        modeloNome: "",

        // Arquivo de imagem
        file: null
    });

    useEffect(() => {
        // 1. Busca o automóvel
        AutomovelDataService.getById(id).then(automovelResp => {
            const automovel = automovelResp.data;
            // Coloca os dados do automóvel no formData
            setFormData(prev => ({ ...prev, ...automovel }));

            // 2. Busca a marca com base no automovel.marcaId
            if (automovel?.marcaId) {
                // Carrega a marca
                MarcaDataService.getById(automovel.marcaId).then(marcaResp => {
                    setFormData(prev => ({ ...prev, marcaNome: marcaResp.data.nome }));

                    // Carrega TODOS os modelos e encontra o primeiro da marca
                    ModeloDataService.getAll().then(modelosResp => {
                        const primeiroModelo = modelosResp.data.find(m => m.marcaId === automovel?.marcaId);
                        if (primeiroModelo) {
                            setFormData(prev => ({
                                ...prev,
                                modeloNome: primeiroModelo.nome,
                                modeloId: primeiroModelo.id // Salva o ID do primeiro modelo
                            }));
                        }
                    });
                });
            }

        }).catch(e => console.error("Erro ao carregar dados:", e));
    }, [id]); // Roda apenas uma vez quando o ID muda


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => {
        setFormData(prev => ({ ...prev, file: event.target.files[0] }));
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
        if (!formData.modeloNome) vazioErros.push("modelo");
        if (!formData.marcaNome) vazioErros.push("marca");

        // Tamanho
        if (formData.renavam && (formData.renavam.length !== 11 || isNaN(formData.renavam))) tamanhoErros.push("renavam");
        if (formData.placa && formData.placa.length !== 7) tamanhoErros.push("placa");

        // Tipo
        if (formData.ano_fabricacao && isNaN(formData.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (formData.ano_modelo && isNaN(formData.ano_modelo)) tipoErros.push("ano_modelo");
        if (formData.valor && isNaN(formData.valor)) tipoErros.push("valor");
        if (formData.km && isNaN(formData.km)) tipoErros.push("km");

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
            if (formData.marcaId) {
                await MarcaDataService.update(formData.marcaId, { nome: formData.marcaNome });
            }

            // --- ETAPA 2: ATUALIZAR MODELO (se o nome mudou) ---
            if (formData.modeloId) {
                await ModeloDataService.update(formData.modeloId, { nome: formData.modeloNome });
            }

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
            automovelData.append("marcaId", formData.marcaId); // O ID da marca não muda
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


    return (
        <>
            <Header />
            <div className="container">
                <h1>Edição</h1>
                <p>Esta é a página de edição de automóveis.</p>
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
                <form onSubmit={editAutomovel} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    {/* Seção 1: Informações Principais */}

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações Principais</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="marca" className="form-label">Marca</label>
                                <input value={formData.marcaNome ?? ""} type="text" className={`form-control ${hasError("marca") && "is-invalid"}`} id="marcaNome" name="marcaNome" onChange={handleInputChange} />
                                {vazio.includes("marca") && <div className="invalid-feedback">Informe a marca.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="modelo" className="form-label">Modelo</label>
                                <input value={formData.modeloNome ?? ""} type="text" className={`form-control ${hasError("modelo") && "is-invalid"}`} id="modeloNome" name="modeloNome" onChange={handleInputChange} />
                                {vazio.includes("modelo") && <div className="invalid-feedback">Informe o modelo.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="cor" className="form-label">Cor</label>
                                <input value={formData.cor ?? ""} type="text" className={`form-control ${hasError("cor") && "is-invalid"}`} id="cor" name="cor" onChange={handleInputChange} />
                                {vazio.includes("cor") && <div className="invalid-feedback">Informe a cor.</div>}
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
                    </fieldset>


                    {/* Seção 2: Documentação e Valores */}


                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Documentação e Valores</legend>
                        <div className="row g-3">
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
                                <label htmlFor="valor" className="form-label">Valor (R$)</label>
                                <input value={formData.valor ?? ""} type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" onChange={handleInputChange} />
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
                                <input value={formData.km ?? ""} type="text" className={`form-control ${hasError("km") && "is-invalid"}`} id="km" name="km" onChange={handleInputChange} />
                                {vazio.includes("km") && <div className="invalid-feedback">Informe a quilometragem.</div>}
                                {tipo.includes("km") && <div className="invalid-feedback">Valor inválido.</div>}
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
            </div>
        </>
    );
}

export default EditarAutomovel;