import { useState, useEffect } from "react";
import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from "react-router-dom";
import AutomovelDataService from "../../services/automovelDataService";
import ModeloDataService from "../../services/modeloDataService";
import MarcaDataService from "../../services/marcaDataService";
import ManutencaoDataService from "../../services/manutencaoDataService";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaTag } from "react-icons/fa";



const Manutencao = () => {

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([automoveis, modelos, marcas]) => {
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



    const [renavam, setRenavam] = useState("");

    const navigate = useNavigate();

    const initialManutencaoState = {
        id: null,
        // ativo: "",
        data_envio: "",
        data_retorno: null,
        previsao_retorno: null,
        descricao: "",
        valor: "",
        automovelId: "",
        // gerenteId: ""
    };

    const [manutencao, setManutencao] = useState(initialManutencaoState);


    const handleInputChangeManutencao = event => {
        const { name, value } = event.target;
        setManutencao({ ...manutencao, [name]: value });
    }

    const handleInputChangeRenavam = event => {
        const { value } = event.target;
        setRenavam(value);
    }

    const [loading, setLoading] = useState(true);

    const [automovelOpt, setAutomovelOpt] = useState([]);
    const [modeloOpt, setModeloOpt] = useState([]);
    const [marcaOpt, setMarcaOpt] = useState([]);
    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);


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

        // Tamanho

        // Tipo

        return { vazioErros, tamanhoErros, tipoErros };
    };

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


    const buscarAutomovel = async (e) => {

        e.preventDefault();

        try {

            const autoResp = await AutomovelDataService.getByRenavam(renavam)
            // .catch(e => {
            //     console.error("Erro ao buscar automovel:", e);
            // });

            if (autoResp.data.erro) {
                setErro(autoResp.data.erro); // erro vindo do back
                setMensagemErro(autoResp.data.mensagemErro);
                throw new Error(autoResp.data.mensagemErro);

            }

            if (autoResp && autoResp.data) {

                setManutencao(prev => ({
                    ...prev,
                    automovelId: autoResp?.data.id || ""
                }));

            }

        } catch (error) {
            // Se qualquer 'await' falhar, o código vem para cá
            console.error("Erro no processo de busca pelo automovel:", error);
            setErro(true);
            // Tenta pegar a mensagem de erro da resposta da API, ou usa uma mensagem padrão
            const mensagem = error.response?.data?.mensagemErro || error.message || "Ocorreu um erro inesperado.";
            setMensagemErro(mensagem);
        }
    }

    const saveManutencao = async (e) => {

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

            var dataManutencao = {
                ativo: manutencao.ativo,
                data_envio: manutencao.data_envio,
                data_retorno: manutencao.data_retorno,
                previsao_retorno: manutencao.previsao_retorno,
                valor: manutencao.valor,
                descricao: manutencao.descricao,
                automovelId: manutencao.automovelId,
                // gerenteId: manutencao.gerenteId
            }

            const manutencaoResp = await ManutencaoDataService.create(dataManutencao)
                .catch(e => {
                    console.error("Erro ao registrar manutenção:", e);
                });

            setManutencao(manutencaoResp.data);

            // --- SUCESSO! ---
            setSucesso(true);
            setMensagemSucesso("Registro de manutenção realizado com sucesso!");

            setTimeout(() => {
                navigate('/listagem/manutencoes');
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


    return (
        <>
            <Header />
            <div className="container">

                {/* Cabeçalho da Página */}
                <div className="mb-4">
                    <h1 className="fw-bold">Registro de Manutenções</h1>
                    <p className="text-muted">Preencha os dados abaixo para registrar uma nova manutenção.</p>
                </div>

                {/* Alertas */}
                {/* {erro && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{mensagemErro}</div>
                    </div>
                )} */}
                {sucesso && (
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{mensagemSucesso}</div>
                    </div>
                )}

                <form className={`mb-5 ${sucesso ? "d-none" : ""}`}>
                    <legend className="h5 fw-bold mb-3 border-bottom pb-2">Busca pelo Automóvel</legend>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label for="valor" class="form-label">Renavam</label>
                            <input type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" aria-describedby="renavamHelp" onChange={handleInputChangeRenavam} />
                            {vazio.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o renavam.</div>}
                            {tipo.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Renavam inválido.</div>}
                        </div>
                        <div className="col-md-3 d-flex align-items-center mt-5">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={buscarAutomovel}
                            >
                                Buscar
                            </button>
                        </div>
                        <div className="col-md-3"></div>
                        {erro && (
                            <div className="d-flex align-items-center col-md-3" role="alert">
                                <i className="bi text-danger bi-exclamation-triangle-fill me-2"></i>
                                <div class="form-text text-danger">{mensagemErro}</div>
                            </div>
                        )}
                    </div>
                </form>

                {/* Formulário com Seções */}
                <form onSubmit={saveManutencao} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    {/* Seção 4: Troca */}
                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Detalhes da Manutenção</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label for="valor" class="form-label">Valor</label>
                                <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeManutencao} />
                                {vazio.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor.</div>}
                                {tipo.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Valor inválido.</div>}
                            </div>

                            <div className="col-md-4">
                                <label for="data" class="form-label">Data Envio</label><br />

                                <DatePicker

                                    className={`form-control ${hasError("data") && "is-invalid"}`}
                                    calendarClassName="custom-datepicker-container"
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data"
                                    name="data_envio"
                                    selected={manutencao.data_envio}
                                    onChange={(date) => setManutencao({ ...manutencao, data_envio: date })}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />

                                {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="data" class="form-label">Previsão de Retorno</label><br />
                                <div className="w-100">
                                    <DatePicker
                                        style={{ width: "100%;" }}
                                        className={`form-control ${hasError("data") && "is-invalid"}`}
                                        calendarClassName="custom-datepicker-container"
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="previsao_retorno"
                                        selected={manutencao.previsao_retorno}
                                        onChange={(date) => setManutencao({ ...manutencao, previsao_retorno: date })}
                                        dateFormat="dd/MM/yyyy" // Formato da data
                                    />
                                </div>
                                {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="automovel" class="form-label">Automóvel</label>
                                <Select formatOptionLabel={formatOptionLabel} isSearchable={true} className={`${hasError("automovel") && "is-invalid"}`} id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setManutencao({ ...manutencao, automovelId: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === manutencao.automovelId) || null} isClearable={true} styles={customStyles}
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
                                {vazio.includes("automovel") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel.</div>}
                            </div>
                            <div className="col-md-8">
                                <label for="descricao" class="form-label">Descrição</label>
                                <textarea type="text" value={manutencao.descricao} placeholder="Detalhes do serviço, peças trocadas, etc." rows="3" className={`form-control ${hasError("descricao") && "is-invalid"}`} id="descricao" name="descricao" aria-describedby="descricaoHelp" onChange={handleInputChangeManutencao} />

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
                                "Registrar Manutenção"
                            )}
                        </button>
                    </div>
                </form >
            </div >
        </>
    )
}

export default Manutencao;