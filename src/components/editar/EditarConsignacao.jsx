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
import 'react-datepicker/dist/react-datepicker.css';

const EditarConsignacao = () => {

    const { id } = useParams();

    const [automovel, setAutomovel] = useState([]);

    const [modelo, setModelo] = useState([]);

    const [marca, setMarca] = useState([]);

    const [cliente, setCliente] = useState([]);

    const [fisica, setFisica] = useState([]);

    const [juridica, setJuridica] = useState([]);

    const [consignacao, setConsignacao] = useState('');


    const retrieveAutomovel = useCallback(() => {
        AutomovelDataService.getAll()
            .then(response => {
                setAutomovel(response.data);
                // console.log("Automóvel carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar automovel:", e);
            });
    }, [id]);

    useEffect(() => {
        retrieveAutomovel();
    }, [retrieveAutomovel]);


    const retrieveMarca = useCallback(() => {
        MarcaDataService.getAll()
            .then(response => {
                setMarca(response.data);
                // console.log("Marcas carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar marcas:", e);
            });
    }, []);


    useEffect(() => {
        retrieveMarca();
    }, [retrieveMarca]);


    const retrieveModelo = useCallback(() => {

        ModeloDataService.getAll()
            .then(response => {
                setModelo(response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar modelo:", e);
            });
    }, [marca]);

    useEffect(() => {
        retrieveModelo();
    }, [retrieveModelo]);

    const retrieveConsignacao = useCallback(() => {
        ConsignacaoDataService.getById(id)
            .then(response => {
                setConsignacao(response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar consignação:", e);
            });
    }, [id]);

    useEffect(() => {
        retrieveConsignacao();
    }, [retrieveConsignacao]);


    // --- Event Handlers ---
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


    // Mensagens de sucesso e erro
    const [mensagemErro, setMensagemErro] = useState('');
    const [erro, setErro] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);

    const navigate = useNavigate();


    const retrieveCliente = useCallback(() => {
        ClienteDataService.getAll()
            .then(response => {
                setCliente(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar clientes:", e);
            });
    }, []);


    useEffect(() => {
        retrieveCliente();
    }, [retrieveCliente]);

    const retrieveFisica = useCallback(() => {
        FisicaDataService.getAll()
            .then(response => {
                setFisica(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar pessoas físicas:", e);
            });
    }, []);


    useEffect(() => {
        retrieveFisica();
    }, [retrieveFisica]);

    const retrieveJuridica = useCallback(() => {
        JuridicaDataService.getAll()
            .then(response => {
                setJuridica(response.data);
                // console.log("Automóveis carregados:", response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar pessoas físicas:", e);
            });
    }, []);


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

    // console.log(automovel);


    const editarConsignacao = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();
        // setErro(false);
        // setSucesso(false);
        // setVazio([]);

        // VERIFICAÇÃO - VAZIO
        let vazioErros = [];

        // VERIFICAÇÃO - TAMANHO
        let tamanhoErros = [];
        // // VERIFICAÇÃO - TIPO
        let tipoErros = [];


        if (tipoErros.length > 0 || tamanhoErros.length > 0 || vazioErros > 0) {
            setTamanho(tamanhoErros);
            setTipo(tipoErros);
            setVazio(vazioErros);
            return;
        }


        var data = {
            valor: consignacao.valor,
            data_inicio: consignacao.data_inicio,
            automovelId: consignacao.automovelId,
            clienteId: consignacao.clienteId
        };

        const consignacaoEdit = await ConsignacaoDataService.update(id, data)
            .catch(e => {
                console.error("Erro ao atualizar automovel:", e);
            });

        setSucesso(true);
        setMensagemSucesso("Automóvel editado com sucesso!");

        setTimeout(() => {
            navigate('/listagem/consignacoes');
        }, 1500)


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
                            <input type="text" class="form-control" id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeConsignacao} value={consignacao.valor} />
                            <div id="valorHelp" class="form-text">Informe o valor da compra.</div>
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

                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="fornecedor" class="form-label">Proprietario</label>
                            <Select isSearchable={true} class="form-select" id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleProprietarioChange} value={optionsFornecedor.find(option => option.value === consignacao.clienteId) || null} isClearable={true}
                                styles={customStyles}>
                            </Select>
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="automovel" class="form-label">Automóvel</label>
                            <Select isSearchable={true} class="form-select" id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === consignacao.automovelId) || null} isClearable={true}>
                            </Select>
                        </div>

                    </div >

                    <button type="submit" onClick={editarConsignacao} class="btn btn-primary">Submit</button>

                </form >
            </div >
        </>
    )
}

export default EditarConsignacao;