import Header from "../Header";
import { useState } from "react";
import CompraDataService from "../../services/compraDataService";
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

const EditarCompra = () => {

    const { id } = useParams();

    const [automovel, setAutomovel] = useState([]);

    const [modelo, setModelo] = useState([]);

    const [marca, setMarca] = useState([]);

    const [cliente, setCliente] = useState([]);

    const [fisica, setFisica] = useState([]);

    const [juridica, setJuridica] = useState([]);

    const [compra, setCompra] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000); // 8 segundos de segurança
        // Use Promise.all para esperar todas as chamadas essenciais terminarem
        Promise.all([
            CompraDataService.getById(id),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll()
        ]).then(([compras, automoveis, modelos, marcas, clientes, fisica, juridica]) => {
            setCompra(compras.data);
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

    // --- Event Handlers ---
    const handleInputChangeConsignacao = event => {
        const { name, value } = event.target;
        setCompra({ ...compra, [name]: value });
    };

    const handleProprietarioChange = (selectedOption) => {
        setCompra({ ...compra, clienteId: selectedOption ? selectedOption.value : "" });
    };

    const handleAutomovelChange = (selectedOption) => {
        setCompra({ ...compra, automovelId: selectedOption ? selectedOption.value : "" });
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


    const editarCompra = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();
        // setErro(false);
        // setSucesso(false);
        // setVazio([]);

        // VERIFICAÇÃO - VAZIO
        let vazioErros = [];

        // if (!automovel.valor) {
        //     vazioErros.push("valor");
        // }

        // if (!automovel.ano_fabricacao) {
        //     vazioErros.push("ano_fabricacao");
        // }

        // if (!automovel.ano_modelo) {
        //     vazioErros.push("ano_modelo");
        // }

        // if (!automovel.renavam) {
        //     vazioErros.push("renavam");
        // }

        // if (!automovel.placa) {
        //     vazioErros.push("placa");
        // }

        // if (!automovel.origem) {
        //     vazioErros.push("origem");
        // }

        // if (!automovel.valor) {
        //     vazioErros.push("valor");
        // }

        // if (!automovel.km) {
        //     vazioErros.push("km");
        // }

        // if (!automovel.combustivel) {
        //     vazioErros.push("combustivel");
        // }

        // if (!automovel.cor) {
        //     vazioErros.push("cor");
        // }

        // if (!modelo.modelo) {
        //     vazioErros.push("modelo");
        // }

        // if (!marca.marca) {
        //     vazioErros.push("marca");
        // }

        // VERIFICAÇÃO - TAMANHO
        let tamanhoErros = [];

        // if (automovel.renavam.length != 11 || isNaN(automovel.renavam)) {
        //     tamanhoErros.push("renavam");
        // }

        // if (automovel.placa.length != 7) {
        //     tamanhoErros.push("placa");
        // }

        // // VERIFICAÇÃO - TIPO
        let tipoErros = [];

        // if (isNaN(automovel.ano_fabricacao)) {
        //     tipoErros.push("ano_fabricacao");
        // }

        // if (isNaN(automovel.ano_modelo)) {
        //     tipoErros.push("ano_modelo");
        // }

        // if (isNaN(automovel.renavam)) {
        //     tipoErros.push("renavam");
        // }

        // Verificação de duplicidade
        // try {
        //     const verificacao = await AutomovelDataService.duplicidade({
        //         placa: automovel.placa,
        //         renavam: automovel.renavam
        //     })

        //     if (verificacao.data.erro) {
        //         setErro(verificacao.data.erro); // erro vindo do back
        //         setMensagemErro(verificacao.data.mensagemErro);
        //         return; // não continua
        //     }

        // } catch (erro) {

        //     console.error("Erro na verificação de duplicidade:", erro);

        //     setErro(erro.response.data.erro);
        //     setMensagemErro(erro.response.data.mensagemErro);
        //     return;
        // }

        if (tipoErros.length > 0 || tamanhoErros.length > 0 || vazioErros > 0) {
            setTamanho(tamanhoErros);
            setTipo(tipoErros);
            setVazio(vazioErros);
            return;
        }


        var data = {
            valor: compra.valor,
            data: compra.data_inicio,
            automovelId: compra.automovelId,
            clienteId: compra.clienteId
        };

        const compraEdit = await CompraDataService.update(id, data)
            .catch(e => {
                console.error("Erro ao atualizar compra:", e);
            });

        setSucesso(true);
        setMensagemSucesso("Automóvel editado com sucesso!");

        setTimeout(() => {
            navigate('/listagem/compras');
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
                            <input type="text" class="form-control" id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeConsignacao} value={compra.valor} />
                            <div id="valorHelp" class="form-text">Informe o valor da compra.</div>
                        </div>

                        <div class="mb-3 col-md-3 ">
                            <label for="data" class="form-label">Data</label><br />
                            <DatePicker
                                style={{ width: "100%;" }}
                                className="form-control"
                                type="text"
                                aria-describedby="dataHelp"
                                id="data"
                                name="data"
                                selected={compra.data}
                                onChange={(date) => setConsignacao({ ...compra, data: date })}
                                dateFormat="dd/MM/yyyy" // Formato da data
                            />

                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="fornecedor" class="form-label">Proprietario</label>
                            <Select isSearchable={true} class="form-select" id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleProprietarioChange} value={optionsFornecedor.find(option => option.value === compra.clienteId) || null} isClearable={true}
                                styles={customStyles}>
                            </Select>
                        </div>

                        <div class="mb-3 col-md-3">
                            <label for="automovel" class="form-label">Automóvel</label>
                            <Select isSearchable={true} class="form-select" id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === compra.automovelId) || null} isClearable={true}>
                            </Select>
                        </div>

                    </div >

                    <button type="submit" onClick={editarCompra} class="btn btn-primary">Submit</button>

                </form >
            </div >
        </>
    )
}

export default EditarCompra;