import Header from "../Header";
import { useState } from "react";
import ManutencaoDataService from "../../services/manutencaoDataService";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaTag } from "react-icons/fa";
import React from "react";

const EditarManutencao = () => {

    const { id } = useParams();

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const [loading, setLoading] = useState(true);


    const [formData, setFormData] = useState({
        // Campos do Automóvel
        valor: "", data_envio: "", descricao: "", previsao_retorno: "",


        // IDs das associações
        automovelId: null,

    });


    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            ManutencaoDataService.getById(id),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
        ]).then(([manutencaoId, automoveis, modelos, marcas]) => {
            const manutencao = manutencaoId.data;
            setFormData(prev => ({ ...prev, ...manutencao }));

            // Ajusta a data da compra antes de colocá-la no estado
            const dataEnvioAjustada = ajustarDataParaFusoLocal(manutencao.data_envio);
            const previsaoRetornoAjustada = ajustarDataParaFusoLocal(manutencao.previsao_retorno);
            // Define o estado do formulário com a data já corrigida
            setFormData({
                ...manutencao,
                data_envio: dataEnvioAjustada,
                previsao_retorno: previsaoRetornoAjustada
            });

            // setCompra(compras.data);
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

    const navigate = useNavigate();

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



    const editarManutencao = async (e) => {

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

            const manutencaoData = new FormData();
            manutencaoData.append("data_envio", formData.data_envio);
            manutencaoData.append("previsao_retorno", formData.previsao_retorno);
            manutencaoData.append("valor", formData.valor);
            manutencaoData.append("descricao", formData.descricao);
            manutencaoData.append("automovelId", formData.automovelId);

            await ManutencaoDataService.update(id, manutencaoData);

            setSucesso(true);
            setMensagemSucesso("Manutencão editada com sucesso!");

            setTimeout(() => {
                navigate('/listagem/manutencoes');
            }, 1500)

        } catch (error) {
            console.error("Erro ao atualizar manutenção:", error);
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
                <h1>Edição</h1>
                <p>Esta é a página de edição de manutenções.</p>
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
                <form onSubmit={editarManutencao} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações sobre a manutenção</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label for="valor" class="form-label">Valor</label>
                                <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChange} value={formData.valor ?? ""} />
                                {vazio.includes("valor") && <div className="invalid-feedback">Informe o valor.</div>}
                                {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>}
                            </div>

                            <div className="col-md-4">
                                <label for="data" class="form-label">Data de envio</label><br />
                                <DatePicker
                                    calendarClassName="custom-datepicker-container"
                                    customInput={
                                        <CustomDateInput className={`form-control ${hasError("data") && "is-invalid"}`} />
                                    }
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data"
                                    name="data"
                                    selected={formData.data_envio}
                                    onChange={(date) => setFormData({ ...formData, data_envio: date })}
                                    dateFormat="dd/MM/yyyy"
                                />

                                {/* {vazio.includes("data") && <div className="invalid-feedback">Informe a data.</div>}
                                {tipo.includes("data") && <div className="invalid-feedback">Data inválida.</div>} */}

                                {(vazio.includes("data_envio") || tipo.includes("data_envio")) && (
                                    <div className="invalid-feedback" style={{ display: "block" }}>
                                        {vazio.includes("data_envio") ? "Informe a data." : "Data inválida."}
                                    </div>
                                )}

                            </div>
                            <div className="col-md-4">
                                <label for="data" class="form-label">Previsão de retorno</label><br />
                                <DatePicker
                                    calendarClassName="custom-datepicker-container"
                                    customInput={
                                        <CustomDateInput className={`form-control ${hasError("data") && "is-invalid"}`} />
                                    }
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data"
                                    name="data"
                                    selected={formData.previsao_retorno}
                                    onChange={(date) => setFormData({ ...formData, previsao_retorno: date })}
                                    dateFormat="dd/MM/yyyy"
                                />

                                {/* {vazio.includes("data") && <div className="invalid-feedback">Informe a data.</div>}
                                {tipo.includes("data") && <div className="invalid-feedback">Data inválida.</div>} */}

                                {(vazio.includes("previsao_retorno") || tipo.includes("previsao_retorno")) && (
                                    <div className="invalid-feedback" style={{ display: "block" }}>
                                        {vazio.includes("previsao_retorno") ? "Informe a previsao de retorno." : "Data inválida."}
                                    </div>
                                )}

                            </div>
                            <div className="col-md-4">
                                <label for="automovel" class="form-label">Automóvel</label>
                                <Select styles={customStyles} formatOptionLabel={formatOptionLabel} isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovel" name="automovelId" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === formData.automovelId) || null} isClearable={true}>
                                </Select>
                                {vazio.includes("automovelId") && <div className="invalid-feedback">Informe o automóvel.</div>}
                            </div>
                            <div className="col-md-8">
                                <label for="descricao" class="form-label">Descrição</label>
                                <textarea type="text" rows="3" className={`form-control ${hasError("descricao") && "is-invalid"}`} id="descricao" name="descricao" aria-describedby="descricaoHelp" onChange={handleInputChange} value={formData.descricao ?? ""} />

                                {tipo.includes("descricao") && <div id="descricaohelp" class="form-text text-danger ms-1">Descrição inválida.</div>}
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
                                "Salvar"
                            )}
                        </button>
                    </div>

                </form>

            </div >
        </>
    )
}

export default EditarManutencao;