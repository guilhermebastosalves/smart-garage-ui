import { useState, useEffect } from "react";
import Header from "../components/Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from "react-router-dom";
import AutomovelDataService from "../services/automovelDataService";
import ModeloDataService from "../services/modeloDataService";
import MarcaDataService from "../services/marcaDataService";
import GastoDataService from "../services/gastoDataService";


const Gasto = () => {

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

    const initialGastoState = {
        id: null,
        data: "",
        descricao: "",
        valor: "",
        automovelId: ""
    };

    const [gasto, setGasto] = useState(initialGastoState);


    const handleInputChangeGasto = event => {
        const { name, value } = event.target;
        setGasto({ ...gasto, [name]: value });
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

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([automoveis, modelos, marcas]) => {
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
        const nomeModelo = modelo?.find(modelo => modelo.marcaId === nomeMarca.id);

        return {
            value: d.id,
            label: `Modelo: ${nomeModelo ? nomeModelo?.nome + " |" : ""} Marca: ${nomeMarca ? nomeMarca?.nome + " |" : ""} | Renavam: ${d.renavam} | Ano: ${d.ano_modelo}`
        };
    });


    const buscarAutomovel = async (e) => {

        e.preventDefault();

        try {

            const autoResp = await AutomovelDataService.getByRenavam(renavam)
                .catch(e => {
                    console.error("Erro ao buscar automovel:", e);
                });

            console.log(autoResp?.data);

            if (autoResp && autoResp.data) {

                setGasto(prev => ({
                    ...prev,
                    automovelId: autoResp?.data.id || ""
                }));

            }

        } catch (error) {
            // Se qualquer 'await' falhar, o código vem para cá
            console.error("Erro no processo de busca pelo automovel:", error);
        }
    }

    const saveGasto = async (e) => {

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

            var dataGasto = {
                data: gasto.data,
                valor: gasto.valor,
                descricao: gasto.descricao,
                automovelId: gasto.automovelId,
            }

            const gastoResp = await GastoDataService.create(dataGasto)
                .catch(e => {
                    console.error("Erro ao registrar gasto:", e);
                });

            setGasto(gastoResp.data);

            // --- SUCESSO! ---
            setSucesso(true);
            setMensagemSucesso("Registro de gasto realizado com sucesso!");

            setTimeout(() => {
                navigate('/listagem/gastos');
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
                    <h1 className="fw-bold">Registro de Gastos</h1>
                    <p className="text-muted">Preencha os dados abaixo para registrar um novo gasto.</p>
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

                <form className="mb-5">
                    <legend className="h5 fw-bold mb-3 border-bottom pb-2">Busca pelo Automóvel</legend>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label for="valor" class="form-label">Renavam</label>
                            <input type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" aria-describedby="renavamHelp" onChange={handleInputChangeRenavam} />
                            {vazio.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o renavam.</div>}
                            {tipo.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Renavam inválido.</div>}
                        </div>
                        <div className="col-md-3 d-flex align-items-center">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={buscarAutomovel}
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                </form>

                {/* Formulário com Seções */}
                <form onSubmit={saveGasto} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    {/* Seção 4: Troca */}
                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Detalhes do Gasto</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label for="valor" class="form-label">Valor</label>
                                <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeGasto} />
                                {vazio.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor.</div>}
                                {tipo.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Valor inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="descricao" class="form-label">Descrição</label>
                                <input type="text" className={`form-control ${hasError("descricao") && "is-invalid"}`} id="descricao" name="descricao" aria-describedby="descricaoHelp" onChange={handleInputChangeGasto} />

                                {tipo.includes("descricao") && <div id="descricaohelp" class="form-text text-danger ms-1">Descrição inválida.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="data" class="form-label">Data</label><br />
                                <DatePicker
                                    style={{ width: "100%;" }}
                                    className={`form-control ${hasError("data") && "is-invalid"}`}
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data"
                                    name="data"
                                    selected={gasto.data}
                                    onChange={(date) => setGasto({ ...gasto, data: date })}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />
                                {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="automovel" class="form-label">Automóvel</label>
                                <Select isSearchable={true} className={`${hasError("automovel") && "is-invalid"}`} id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setGasto({ ...gasto, automovelId: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === gasto.automovelId) || null} isClearable={true}>
                                </Select>
                                {vazio.includes("automovel") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel.</div>}
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
            </div >
        </>
    )
}

export default Gasto;