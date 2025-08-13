import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useCallback, useEffect } from "react";
import ClienteDataService from "../../services/clienteDataService";
import CidadeDataService from '../../services/cidadeDataService';
import EstadoDataService from '../../services/estadoDataService';
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import EnderecoDataService from "../../services/enderecoDataService";
import { useNavigate } from "react-router-dom";
import ToggleButton from 'react-bootstrap/ToggleButton';
import { ButtonGroup } from "react-bootstrap";

const Cliente = () => {

    const navigate = useNavigate();

    const radios = [
        { name: 'Pessoa Física', value: 'fisica' },
        { name: 'Pessoa Jurídica', value: 'juridica' }
    ];

    const [checkedFisica, setCheckedFisica] = useState(false);
    const [checkedJuridica, setCheckedJuridica] = useState(false);

    const [radioValue, setRadioValue] = useState('1');

    const [cliente, setCliente] = useState('');
    const [fisica, setFisica] = useState('');
    const [juridica, setJuridica] = useState('');
    const [endereco, setEndereco] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [opcao, setOpcao] = useState('');


    const handleInputChangeCliente = event => {
        const { name, value } = event.target;
        setCliente({ ...cliente, [name]: value });
    };

    const handleInputChangeEndereco = event => {
        const { name, value } = event.target;
        setEndereco({ ...endereco, [name]: value });
    };

    const handleInputChangeCidade = event => {
        const { value } = event.target;
        setCidade({ ...cidade, nome: value });
    };

    const handleInputChangeEstado = (selectedOption) => {
        setEstado({ uf: selectedOption?.value ?? "" });
    };

    const handleInputChangeFisica = event => {
        const { name, value } = event.target;
        setFisica({ ...fisica, [name]: value });
    };

    const handleInputChangeJuridica = event => {
        const { name, value } = event.target;
        setJuridica({ ...juridica, [name]: value });
    };

    const optionsEstados = [
        {
            label: "AC",
            value: "AC"
        },
        {
            label: "AL",
            value: "AL"
        },
        {
            label: "AP",
            value: "AP"
        },
        {
            label: "AM",
            value: "AM"
        },
        {
            label: "BA",
            value: "BA"
        },
        {
            label: "CE",
            value: "CE"
        },
        {
            label: "DF",
            value: "DF"
        },
        {
            label: "ES",
            value: "ES"
        },
        {
            label: "GO",
            value: "GO"
        },
        {
            label: "Ma",
            value: "MA"
        },
        {
            label: "MT",
            value: "MT"
        },
        {
            label: "MS",
            value: "MS"
        },
        {
            label: "MG",
            value: "MG"
        },
        {
            label: "PA",
            value: "PA"
        },
        {
            label: "PB",
            value: "PB"
        },
        {
            label: "PR",
            value: "PR"
        },
        {
            label: "PE",
            value: "PE"
        },
        {
            label: "PI",
            value: "PI"
        },
        {
            label: "RJ",
            value: "RJ"
        },
        {
            label: "RN",
            value: "RN"
        },
        {
            label: "RS",
            value: "RS"
        },
        {
            label: "RO",
            value: "RO"
        },
        {
            label: "RR",
            value: "RR"
        },
        {
            label: "SC",
            value: "SC"
        },
        {
            label: "SP",
            value: "SP"
        },
        {
            label: "SE",
            value: "SE"
        },
        {
            label: "TO",
            value: "TO"
        }
    ];

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);


    const saveCliente = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();

        // VERIFICAÇÃO - VAZIO
        // let vazioErros = [];

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

        // VERIFICAÇÃO - TIPO
        // let tipoErros = [];

        // if (isNaN(automovel.ano_fabricacao)) {
        //     tipoErros.push("ano_fabricacao");
        // }


        // if (tipoErros.length > 0 || tamanhoErros.length > 0 || vazioErros > 0) {
        //     setTamanho(tamanhoErros);
        //     setTipo(tipoErros);
        //     setVazio(vazioErros);
        //     return;
        // }

        var dataCliente = {
            ativo: cliente.ativo,
            data_cadastro: cliente.data_cadastro,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone
        }

        const clienteResp = await ClienteDataService.create(dataCliente)
            .catch(e => {
                console.error("Erro ao criar cliente:", e);
            });

        setCliente(clienteResp.data);

        var dataFisica = {
            cpf: fisica.cpf,
            rg: fisica.rg,
            clienteId: clienteResp?.data.id
        }

        const fisicaResp = await FisicaDataService.create(dataFisica)
            .catch(e => {
                console.error("Erro ao criar pessoa fisica:", e);
            });

        setFisica(fisicaResp.data);

        var dataEstado = {
            uf: estado.uf
        }

        const estadoResp = await EstadoDataService.create(dataEstado)
            .catch(e => {
                console.error("Erro ao criar estado:", e);
            });

        setEstado(estadoResp.data);

        var dataCidade = {
            nome: cidade.nome,
            estadoId: estadoResp?.data.id
        }

        const cidadeResp = await CidadeDataService.create(dataCidade)
            .catch(e => {
                console.error("Erro ao criar cidade:", e);
            });

        setCidade(cidadeResp.data);

        var dataEndereco = {
            bairro: endereco.bairro,
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            numero: endereco.numero,
            clienteId: clienteResp?.data.id,
            cidadeId: cidadeResp?.data.id
        }

        const enderecoResp = await EnderecoDataService.create(dataEndereco)
            .catch(e => {
                console.error("Erro ao criar endereco:", e);
            });

        setEndereco(enderecoResp.data);

        setSucesso(true);
        setMensagemSucesso("Cliente cadastrado com sucesso!");

        setTimeout(() => {
            navigate('/cadastro/automoveis', { state: { clienteId: clienteResp.data.id } });
        }, 1500);

    }

    const saveClienteJuridica = async (e) => {

        // Prevents the default page refresh
        e.preventDefault();

        // VERIFICAÇÃO - VAZIO
        // let vazioErros = [];

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

        // VERIFICAÇÃO - TIPO
        // let tipoErros = [];

        // if (isNaN(automovel.ano_fabricacao)) {
        //     tipoErros.push("ano_fabricacao");
        // }


        // if (tipoErros.length > 0 || tamanhoErros.length > 0 || vazioErros > 0) {
        //     setTamanho(tamanhoErros);
        //     setTipo(tipoErros);
        //     setVazio(vazioErros);
        //     return;
        // }

        var dataCliente = {
            ativo: cliente.ativo,
            data_cadastro: cliente.data_cadastro,
            nome: cliente.nome,
            email: cliente.email,
            telefone: cliente.telefone
        }

        const clienteJuridicaResp = await ClienteDataService.create(dataCliente)
            .catch(e => {
                console.error("Erro ao criar cliente:", e);
            });

        setCliente(clienteJuridicaResp.data);

        var dataJuridica = {
            cnpj: juridica.cnpj,
            razao_social: juridica.razao_social,
            nome_responsavel: juridica.nome_responsavel,
            clienteId: clienteJuridicaResp?.data.id
        }

        const juridicaResp = await JuridicaDataService.create(dataJuridica)
            .catch(e => {
                console.error("Erro ao criar pessoa jurídica:", e);
            });

        setJuridica(juridicaResp.data);

        var dataEstado = {
            uf: estado.uf
        }

        const estadoResp = await EstadoDataService.create(dataEstado)
            .catch(e => {
                console.error("Erro ao criar estado:", e);
            });

        setEstado(estadoResp.data);

        var dataCidade = {
            nome: cidade.nome,
            estadoId: estadoResp?.data.id
        }

        const cidadeResp = await CidadeDataService.create(dataCidade)
            .catch(e => {
                console.error("Erro ao criar cidade:", e);
            });

        setCidade(cidadeResp.data);

        var dataEndereco = {
            bairro: endereco.bairro,
            cep: endereco.cep,
            logradouro: endereco.logradouro,
            numero: endereco.numero,
            clienteId: clienteJuridicaResp?.data.id,
            cidadeId: cidadeResp?.data.id
        }

        const enderecoResp = await EnderecoDataService.create(dataEndereco)
            .catch(e => {
                console.error("Erro ao criar endereco:", e);
            });

        setEndereco(enderecoResp.data);

        setTimeout(() => {
            navigate('/cadastro/automoveis', { state: { clienteId: clienteJuridicaResp.data.id } });
        }, 1500);

    }


    return (
        <>
            <Header />
            <div className="container">
                <div>Página de clientes</div>
            </div>

            <div className="container">
                {
                    sucesso &&

                    <div class="alert alert-success" role="alert">
                        {mensagemSucesso}
                    </div>

                }

                <div className={`row mt-5 ${sucesso && "d-none"}`}>
                    {/* <form action="">
                        <div className="col-md-2 text-center">
                            <label for="fisica">Pessoa Física</label><br />
                            <input type="radio" name="opcao" id="fisica" value="fisica" onChange={() => { setOpcao('fisica') }} />
                        </div>
                        <div className="col-md-2 text-center">
                            <label for="juridica">Pessoa Jurídica</label><br />
                            <input type="radio" name="opcao" id="juridica" value="juridica" onChange={() => { setOpcao('juridica') }} />
                        </div>
                    </form> */}
                    {/* <form action="">
                        <div className="col-md-2 text-center">
                            <ToggleButton
                                className="mb-2"
                                id="toggle-check"
                                type="radio"
                                name="opcao"
                                variant="outline-primary"
                                checked={checkedFisica}
                                onChange={(e) => { setCheckedFisica(e.currentTarget.checked); setOpcao('fisica') }}
                            >
                                Checked
                            </ToggleButton>
                        </div>
                        <div className="col-md-2 text-center">
                            <ToggleButton
                                className="mb-2"
                                id="toggle-check"
                                type="radio"
                                name="opcao"
                                variant="outline-primary"
                                checked={checkedJuridica}
                                onChange={(e) => { setCheckedJuridica(e.currentTarget.checked); setOpcao('juridica') }}
                            >
                                Checked
                            </ToggleButton>
                        </div>
                    </form> */}
                    <ButtonGroup className="mb-2">
                        {radios.map((radio, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`radio-${idx}`}
                                type="radio"
                                variant="outline-primary"
                                name="radio"
                                value={radio.value}
                                checked={radioValue === radio.value}
                                onChange={(e) => { setRadioValue(e.currentTarget.value); setOpcao(radio.value) }}
                            >
                                {radio.name}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>

                </div>

                {opcao === 'fisica' &&
                    <form className={`mt-5 ${sucesso && "d-none"}`}>
                        <div className="row">
                            <div class="mb-3 col-md-3 ">
                                <label for="valor" class="form-label">Nome</label>
                                <input type="text" class="form-control" id="nome" name="nome" aria-describedby="nomeHelp" value={cliente.nome} onChange={handleInputChangeCliente} />
                                <div id="nomeHelp" class="form-text">Informe o nome.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="data" class="form-label">Data cadastro</label><br />
                                <DatePicker
                                    style={{ width: "100%;" }}
                                    className="form-control"
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data_cadastro"
                                    name="data_cadastro"
                                    selected={cliente.data_cadastro}
                                    onChange={(date) => setCliente({ ...cliente, data_cadastro: date })}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />

                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="valor" class="form-label">Email</label>
                                <input type="text" class="form-control" id="email" name="email" aria-describedby="emailHelp" value={cliente.email} onChange={handleInputChangeCliente} />
                                <div id="emailHelp" class="form-text">Informe o email.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="telefone" class="form-label">Telefone</label>
                                <input type="text" class="form-control" id="telefone" name="telefone" aria-describedby="telefoneHelp" value={cliente.telefone} onChange={handleInputChangeCliente} />
                                <div id="telefoneHelp" class="form-text">Informe o telefone.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="cpf" class="form-label">CPF</label>
                                <input type="text" class="form-control" id="cpf" name="cpf" aria-describedby="cpfeHelp" value={fisica.cpf} onChange={handleInputChangeFisica} />
                                <div id="cpfHelp" class="form-text">Informe o CPF.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="rg" class="form-label">RG</label>
                                <input type="text" class="form-control" id="rg" name="rg" aria-describedby="rgHelp" value={fisica.rg} onChange={handleInputChangeFisica} />
                                <div id="rgfHelp" class="form-text">Informe o RG.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="cep" class="form-label">CEP</label>
                                <input type="text" class="form-control" id="cep" name="cep" aria-describedby="cepHelp" value={endereco.cep} onChange={handleInputChangeEndereco} />
                                <div id="cepHelp" class="form-text">Informe o CEP.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="cidade" class="form-label">Cidade</label>
                                <input type="text" class="form-control" id="cidade" name="cidade" aria-describedby="cidadeHelp" value={cidade.nome} onChange={handleInputChangeCidade} />
                                <div id="cidadeHelp" class="form-text">Informe a cidade.</div>
                            </div>

                            <div class="mb-3 col-md-3">
                                <label for="uf" class="form-label">Estado</label>
                                <Select isSearchable={true} class="form-select" id="uf" name="uf" placeholder="Selecione o estado" options={optionsEstados} value={optionsEstados.find(option => option.value === estado.uf)} onChange={handleInputChangeEstado}>
                                </Select>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="logradouro" class="form-label">Logradouro</label>
                                <input type="text" class="form-control" id="logradouro" name="logradouro" aria-describedby="logradourodeHelp" value={endereco.logradouro} onChange={handleInputChangeEndereco} />
                                <div id="logradouroHelp" class="form-text">Informe o logradouro.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="bairro" class="form-label">Bairro</label>
                                <input type="text" class="form-control" id="bairro" name="bairro" aria-describedby="bairroHelp" value={endereco.bairro} onChange={handleInputChangeEndereco} />
                                <div id="bairroHelp" class="form-text">Informe o bairro.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="numero" class="form-label">Número</label>
                                <input type="text" class="form-control" id="numero" name="numero" aria-describedby="numerodeHelp" value={endereco.numero} onChange={handleInputChangeEndereco} />
                                <div id="numeroHelp" class="form-text">Informe o numero.</div>
                            </div>

                        </div >

                        <button type="submit" onClick={saveCliente} class="btn btn-primary">Submit</button>

                    </form >}

                {opcao === 'juridica' &&
                    <form className={`mt-5 ${sucesso && "d-none"}`}>
                        <div className="row">
                            <div class="mb-3 col-md-3 ">
                                <label for="valor" class="form-label">Nome</label>
                                <input type="text" class="form-control" id="nome" name="nome" aria-describedby="nomeHelp" value={cliente.nome} onChange={handleInputChangeCliente} />
                                <div id="nomeHelp" class="form-text">Informe o nome.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="data" class="form-label">Data cadastro</label><br />
                                <DatePicker
                                    style={{ width: "100%;" }}
                                    className="form-control"
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data_cadastro"
                                    name="data_cadastro"
                                    selected={cliente.data_cadastro}
                                    onChange={(date) => setCliente({ ...cliente, data_cadastro: date })}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />

                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="valor" class="form-label">Email</label>
                                <input type="text" class="form-control" id="email" name="email" aria-describedby="emailHelp" value={cliente.email} onChange={handleInputChangeCliente} />
                                <div id="emailHelp" class="form-text">Informe o email.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="telefone" class="form-label">Telefone</label>
                                <input type="text" class="form-control" id="telefone" name="telefone" aria-describedby="telefoneHelp" value={cliente.telefone} onChange={handleInputChangeCliente} />
                                <div id="telefoneHelp" class="form-text">Informe o telefone.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="cnpj" class="form-label">CNPJ</label>
                                <input type="text" class="form-control" id="cpf" name="cnpj" aria-describedby="cnpjHelp" value={juridica.cnpj} onChange={handleInputChangeJuridica} />
                                <div id="cnpjHelp" class="form-text">Informe o CNPJ.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="razao_social" class="form-label">Razão Social</label>
                                <input type="text" class="form-control" id="razao_social" name="razao_social" aria-describedby="razao_socialHelp" value={juridica.razao_social} onChange={handleInputChangeJuridica} />
                                <div id="razao_socialHelp" class="form-text">Informe a razão social.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="nome_responsavel" class="form-label">Nome do responável</label>
                                <input type="text" class="form-control" id="nome_responsavel" name="nome_responsavel" aria-describedby="nome_responsavelHelp" value={juridica.nome_responsavel} onChange={handleInputChangeJuridica} />
                                <div id="nome_responsavelHelp" class="form-text">Informe o nome do responsável.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="cep" class="form-label">CEP</label>
                                <input type="text" class="form-control" id="cep" name="cep" aria-describedby="cepHelp" value={endereco.cep} onChange={handleInputChangeEndereco} />
                                <div id="cepHelp" class="form-text">Informe o CEP.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="cidade" class="form-label">Cidade</label>
                                <input type="text" class="form-control" id="cidade" name="cidade" aria-describedby="cidadeHelp" value={cidade.nome} onChange={handleInputChangeCidade} />
                                <div id="cidadeHelp" class="form-text">Informe a cidade.</div>
                            </div>

                            <div class="mb-3 col-md-3">
                                <label for="uf" class="form-label">Estado</label>
                                <Select isSearchable={true} class="form-select" id="uf" name="uf" placeholder="Selecione o estado" options={optionsEstados} value={optionsEstados.find(option => option.value === estado.uf)} onChange={handleInputChangeEstado}>
                                </Select>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="logradouro" class="form-label">Logradouro</label>
                                <input type="text" class="form-control" id="logradouro" name="logradouro" aria-describedby="logradourodeHelp" value={endereco.logradouro} onChange={handleInputChangeEndereco} />
                                <div id="logradouroHelp" class="form-text">Informe o logradouro.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="bairro" class="form-label">Bairro</label>
                                <input type="text" class="form-control" id="bairro" name="bairro" aria-describedby="bairroHelp" value={endereco.bairro} onChange={handleInputChangeEndereco} />
                                <div id="bairroHelp" class="form-text">Informe o bairro.</div>
                            </div>

                            <div class="mb-3 col-md-3 ">
                                <label for="numero" class="form-label">Número</label>
                                <input type="text" class="form-control" id="numero" name="numero" aria-describedby="numerodeHelp" value={endereco.numero} onChange={handleInputChangeEndereco} />
                                <div id="numeroHelp" class="form-text">Informe o numero.</div>
                            </div>

                        </div >

                        <button type="submit" onClick={saveClienteJuridica} class="btn btn-primary">Submit</button>

                    </form >}
            </div >
        </>
    )
}


export default Cliente;