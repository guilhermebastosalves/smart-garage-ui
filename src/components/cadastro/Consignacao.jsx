import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClienteDataService from "../../services/clienteDataService";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import ModeloDataService from "../../services/modeloDataService";
import MarcaDataService from "../../services/marcaDataService";
import ConsignacaoDataService from "../../services/consignacaoDataService";

const Consignacao = () => {

    const navigate = useNavigate();

    const location = useLocation();
    const automovelId = location.state?.automovelId;
    const clienteId = location.state?.clienteId;

    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const initialConsignacaoState = {
        id: null,
        valor: "",
        data_inicio: "",
        data_fim: "",
        automovelId: "",
        clienteId: "",
        funcionarioId: ""
    };

    const [consignacao, setConsignacao] = useState(initialConsignacaoState);

    useEffect(() => {
        setConsignacao(prev => ({
            ...prev,
            automovelId: automovelId || "",
            clienteId: clienteId || ""
        }));
    }, [automovelId, clienteId]);

    const handleInputChangeConsignacao = event => {
        const { name, value } = event.target;
        setConsignacao({ ...consignacao, [name]: value });
    };

    const handleProprietarioChange = (selectedOption) => {
        setConsignacao({ ...consignacao, clienteId: selectedOption ? selectedOption.value : "" });
    };

    const handleAutomovelChange = (selectedOption) => {
        setConsignacao({ ...consignacao, automovelId: selectedOption ? selectedOption.value : "" });
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([clientes, fisica, juridica, automoveis, modelos, marcas]) => {
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data);
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
        if (!consignacao.valor) vazioErros.push("valor");
        if (!consignacao.data_inicio) vazioErros.push("data_inicio");
        if (!consignacao.clienteId) vazioErros.push("clienteId");
        if (!consignacao.automovelId) vazioErros.push("automovelId");

        // Tipo
        if (consignacao.valor && isNaN(consignacao.valor)) tipoErros.push("valor");
        if (consignacao.data_inicio && consignacao.data_inicio > new Date()) tipoErros.push("data_inicio");


        return { vazioErros, tamanhoErros, tipoErros };
    };

    const optionsFornecedor = cliente.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            value: d.id,
            label: `Nome: ${d.nome || ""}\n${pessoaJuridica ? pessoaJuridica?.razao_social + "\n" : ""}${pessoaFisica ? "CPF: " + pessoaFisica?.cpf + "\n" : ""}${pessoaJuridica ? "CNPJ: " + pessoaJuridica?.cnpj : ""}`
        };
    });

    const optionsAutomovel = automovel.map((d) => {
        const nomeMarca = marca.find(marca => marca.id === d.marcaId);
        // const nomeModelo = modelo.find(modelo => modelo.marcaId === nomeMarca.id);
        const nomeModelo = modelo.find(modelo => nomeMarca && modelo.marcaId === nomeMarca.id);

        return {
            value: d.id,
            label: `Modelo: ${nomeModelo ? nomeModelo?.nome + " |" : ""} Marca: ${nomeMarca ? nomeMarca?.nome + " |" : ""} | Renavam: ${d.renavam} | Ano: ${d.ano_modelo}`
        };
    });

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


    const saveConsignacao = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();

        const { vazioErros, tamanhoErros, tipoErros } = validateFields();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        // Só continua se não houver erros
        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            return;
        }

        var dataConsignacao = {
            valor: consignacao.valor,
            data_inicio: consignacao.data_inicio,
            data_fim: consignacao.data_fim,
            clienteId: consignacao.clienteId,
            automovelId: consignacao.automovelId,
            // funcionarioId: consignacao.funcionarioId
        }

        const consignacaoResp = await ConsignacaoDataService.create(dataConsignacao)
            .catch(e => {
                console.error("Erro ao criar consignacao:", e);
            });

        setConsignacao(consignacaoResp.data);

        setTimeout(() => {
            navigate('/listagem/consignacoes');
        }, 1500)
    }


    return (
        <>
            <Header />
            <div className="container">
                <div>Página de Consignacao</div>
            </div>

            <div className="container">
                <form className="mt-5">
                    <div className="row">
                        <div class="mb-3 col-md-3 ">
                            <label for="valor" class="form-label">Valor</label>
                            <input type="text" class="form-control" id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeConsignacao} />
                            {
                                vazio.includes("valor") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor.</div>
                            }
                            {
                                tipo.includes("valor") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Valor inválido.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3 ">
                            <label for="data" class="form-label">Data Inicio</label><br />
                            <DatePicker
                                style={{ width: "100%;" }}
                                className="form-control"
                                type="text"
                                aria-describedby="dataHelp"
                                id="data_inicio"
                                name="data_inicio"
                                selected={consignacao.data_inicio}
                                onChange={(date) => setConsignacao({ ...consignacao, data_inicio: date })}
                                dateFormat="dd/MM/yyyy" // Formato da data
                            />
                            {
                                vazio.includes("data_inicio") &&
                                <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>
                            }
                            {
                                tipo.includes("data_inicio") &&
                                <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="fornecedor" class="form-label">Proprietario</label>
                            <Select isSearchable={true} class="form-select" id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleProprietarioChange} value={optionsFornecedor.find(option => option.value === consignacao.clienteId) || null} isClearable={true}
                                styles={customStyles}>
                            </Select>
                            {
                                vazio.includes("clienteId") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Informe o proprietário.</div>
                            }
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="automovel" class="form-label">Automóvel</label>
                            <Select isSearchable={true} class="form-select" id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === consignacao.automovelId) || null} isClearable={true}>
                            </Select>
                            {
                                vazio.includes("automovelId") &&
                                <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel.</div>
                            }
                        </div>

                    </div >

                    <button type="submit" onClick={saveConsignacao} class="btn btn-primary">Submit</button>

                </form >
            </div >
        </>
    )
}


export default Consignacao;