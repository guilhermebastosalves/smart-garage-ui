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
import CompraDataService from "../../services/compraDataService";
import { useLocation, useNavigate } from "react-router-dom";

const Compra = () => {

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

    const initialCompraState = {
        id: null,
        valor: "",
        data: "",
        automovelId: "",
        clienteId: ""
    };

    const [compra, setCompra] = useState(initialCompraState);

    useEffect(() => {
        setCompra(prev => ({
            ...prev,
            automovelId: automovelId || "",
            clienteId: clienteId || ""
        }));
    }, [automovelId, clienteId]);

    const handleInputChangeCompra = event => {
        const { name, value } = event.target;
        setCompra({ ...compra, [name]: value });
    };

    const handleFornecedorChange = (selectedOption) => {
        setCompra({ ...compra, clienteId: selectedOption ? selectedOption.value : "" });
    };

    const handleAutomovelChange = (selectedOption) => {
        setCompra({ ...compra, automovelId: selectedOption ? selectedOption.value : "" });
    };


    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll(),
        ]).then(([automoveis, modelos, marcas, clientes, fisica, juridica]) => {
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data)
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
            clearTimeout(timeout);
        });
    }, []);


    const optionsFornecedor = cliente.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            value: d.id,
            label: `nome: ${d.nome || ""} | ${pessoaJuridica ? pessoaJuridica?.razao_social + " |" : ""} ${pessoaFisica ? "cpf: " + pessoaFisica?.cpf + " |" : ""}  ${pessoaJuridica ? "cnpj: " + pessoaJuridica?.cnpj : ""}`
        };
    });

    const optionsAutomovel = automovel.map((d) => {
        const nomeMarca = marca.find(marca => marca.id === d.marcaId);
        const nomeModelo = modelo.find(modelo => modelo.marcaId === nomeMarca.id);

        return {
            value: d.id,
            label: `Modelo: ${nomeModelo ? nomeModelo?.nome + " |" : ""} Marca: ${nomeMarca ? nomeMarca?.nome + " |" : ""} | Renavam: ${d.renavam} | Ano: ${d.ano_modelo}`
        };
    });

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
        if (!compra.valor) vazioErros.push("valor");
        if (!compra.data) vazioErros.push("data");
        if (!compra.clienteId) vazioErros.push("clienteId");
        if (!compra.automovelId) vazioErros.push("automovelId");

        // Tipo
        if (compra.valor && isNaN(compra.valor)) tipoErros.push("valor");
        if (compra.data && compra.data > new Date()) tipoErros.push("data");


        return { vazioErros, tamanhoErros, tipoErros };
    };

    const saveCompra = async (e) => {

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

        var dataCompra = {
            valor: compra.valor,
            data: compra.data,
            clienteId: compra.clienteId,
            automovelId: compra.automovelId
        }

        const compraResp = await CompraDataService.create(dataCompra)
            .catch(e => {
                console.error("Erro ao criar compra:", e);
            });

        setCompra(compraResp.data);

        setTimeout(() => {
            navigate('/listagem/compras');
        }, 1500)
    }

    // Função auxiliar para checar se um campo tem erro e aplicar a classe
    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);



    return (
        <>
            <Header />
            <div className="container">
                <h1>Cadastro</h1>
                <p>Esta é a página de cadastro de compras.</p>
            </div>

            <div className="container">
                <form className="mt-5">

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações da Compra</legend>
                        <div className="row g-3">
                            <div class="col-md-3">
                                <label for="valor" class="form-label">Valor</label>
                                <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeCompra} />
                                {vazio.includes("valor") && <div className="invalid-feedback">Informe o valor.</div>
                                }
                                {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>
                                }
                            </div>

                            <div class="col-md-3">
                                <label for="fornecedor" className="form-label">Fornecedor</label>
                                <Select isSearchable={true} className={`${hasError("clienteId") && "is-invalid"}`} id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleFornecedorChange} value={optionsFornecedor.find(option => option.value === compra.clienteId) || null} isClearable={true}>
                                </Select>
                                {
                                    vazio.includes("clienteId") &&
                                    <div className="invalid-feedback">Informe o proprietário.</div>
                                }
                            </div>

                            <div class="col-md-3">
                                <label for="automovel" class="form-label">Automóvel</label>
                                <Select isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === compra.automovelId) || null} isClearable={true}>
                                </Select>
                                {
                                    vazio.includes("automovelId") &&
                                    <div className="invalid-feedback">Informe o automóvel.</div>
                                }
                            </div>

                            <div class="col-md-3">
                                <label for="data" class="form-label">Data</label><br />
                                <DatePicker

                                    className={`form-control date-picker ${hasError("data") && "is-invalid"}`}
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data"
                                    name="data"
                                    selected={compra.data}
                                    onChange={(date) => setCompra({ ...compra, data: date })}
                                    // onChange={handleInputChangeCompra}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />
                                {
                                    vazio.includes("data") &&
                                    <div className="invalid-feedback">Informe a data.</div>
                                }
                                {
                                    tipo.includes("data") &&
                                    <div className="invalid-feedback">Data inválida.</div>
                                }
                            </div>
                        </div>
                    </fieldset>





                    <button type="submit" onClick={saveCompra} class="btn btn-primary">Submit</button>

                </form >
            </div >
        </>
    );
}

export default Compra;