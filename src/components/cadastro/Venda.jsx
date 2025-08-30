import { useState, useEffect } from "react";
import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate } from "react-router-dom";
import ClienteDataService from "../../services/clienteDataService";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import ModeloDataService from "../../services/modeloDataService";
import MarcaDataService from "../../services/marcaDataService";
import VendaDataService from "../../services/vendaDataService";
import ConsignacaoDataService from "../../services/consignacaoDataService";
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaTag } from "react-icons/fa";

const Venda = () => {

    const location = useLocation();
    const automovelId = location.state?.automovelId;
    const clienteId = location.state?.clienteId;

    const [automovel, setAutomovel] = useState();

    const [id, setId] = useState();

    useEffect(() => {
        AutomovelDataService.getById(automovelId)
            .then((automovel) => {
                setAutomovel(automovel.data)
            }).catch((erro) => {
                console.error("Erro ao carregar dados:", erro);
            })
    }, [])

    const navigate = useNavigate();

    const initialVendaState = {
        id: null,
        valor: "",
        data: "",
        comissao: "",
        forma_pagamento: "",
        automovelId: "",
        clienteId: "",
        // funcionarioId: ""
    };

    const [venda, setVenda] = useState(initialVendaState);

    useEffect(() => {
        setVenda(prev => ({
            ...prev,
            clienteId: clienteId || "",
            automovelId: automovelId || ""
        }));
    }, [clienteId, automovelId]);


    const handleInputChangeVenda = event => {
        const { name, value } = event.target;
        setVenda({ ...venda, [name]: value });
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

    const optionsFornecedor = cliente?.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            // value: d.id,
            // label: `Nome: ${d.nome || ""}\n${pessoaJuridica ? pessoaJuridica?.razao_social + "\n" : ""}${pessoaFisica ? "CPF: " + pessoaFisica?.cpf + "\n" : ""}${pessoaJuridica ? "CNPJ: " + pessoaJuridica?.cnpj : ""}`

            value: d.id,

            label: {
                nome: d.nome,
                razaoSocial: pessoaJuridica?.razao_social,
                cpf: pessoaFisica?.cpf,
                cnpj: pessoaJuridica?.cnpj,
                // Adicionamos um 'tipo' para facilitar a lógica na formatação
                tipo: pessoaJuridica ? 'juridica' : 'fisica'
            }
        }
    });

    const formatOptionLabelFornecedor = ({ value, label }) => {

        // Define o ícone e o título principal com base no tipo de fornecedor
        const isPessoaJuridica = label.tipo === 'juridica';
        const IconePrincipal = isPessoaJuridica ? FaBuilding : FaUserTie;
        const titulo = isPessoaJuridica ? label.razaoSocial : label.nome;
        const subtitulo = isPessoaJuridica ? label.nome : '';

        return (
            <div className="d-flex align-items-center">
                {/* Ícone principal à esquerda (Empresa ou Pessoa) */}
                <IconePrincipal size="2.5em" color="#0d6efd" className="me-3" />

                {/* Div para o conteúdo de texto */}
                <div>
                    {/* Linha Principal: Razão Social ou Nome */}
                    <div className="fw-bold fs-6">{titulo}</div>

                    {/* Linha Secundária: Nome Fantasia (se for PJ) ou Documento */}
                    <div className="small text-muted d-flex align-items-center mt-1">
                        {isPessoaJuridica ? (
                            <>
                                <FaFileContract className="me-1" />
                                <span>CNPJ: {label.cnpj}</span>
                                {subtitulo && <span className="mx-2">|</span>}
                                {subtitulo && <span>({subtitulo})</span>}
                            </>
                        ) : (
                            <>
                                <FaIdCard className="me-1" />
                                <span>CPF: {label.cpf}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const optionsAutomovel = automovelOpt?.map((d) => {
        const nomeMarca = marcaOpt?.find(marca => marca.id === d.marcaId);
        const nomeModelo = modeloOpt?.find(modelo => modelo.marcaId === nomeMarca.id);

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

    const optionsFormaPagamento = [
        {
            label: "Cartão",
            value: "Cartao"
        },
        {
            label: "Dinheiro",
            value: "Dinheiro"
        },
        {
            label: "Financiamento",
            value: "Financiamento"
        },
        {
            label: "Pix",
            value: "Pix"
        }
    ];

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

    const saveVenda = async (e) => {

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

            var dataVenda = {
                comissao: venda.comissao,
                valor: automovel?.valor,
                data: venda.data,
                forma_pagamento: venda.forma_pagamento,
                clienteId: venda.clienteId,
                automovelId: venda.automovelId,
                // funcionarioId: troca.funcionarioId
            }

            const vendaResp = await VendaDataService.create(dataVenda)
                .catch(e => {
                    console.error("Erro ao criar venda:", e);
                });

            setVenda(vendaResp.data);

            //buscar consignacão pelo pelo automovelId
            const buscaConsignacao = await ConsignacaoDataService.getByAutomovel(automovelId)
                .catch(e => {
                    console.error("Erro ao buscar consignacao:", e);
                });


            //se retornar algo, devo setar essa consignação como inativa
            if (buscaConsignacao) {

                const id = buscaConsignacao.data.id;

                const updateConsignacao = await ConsignacaoDataService.update(id,
                    { ativo: false }
                )
                    .catch(e => {
                        console.error("Erro ao atualizar consignação:", e);
                    });
            }

            //setar automóvel como inativo
            const updateAutomovel = await AutomovelDataService.update(automovelId,
                { ativo: false }
            )
                .catch(e => {
                    console.error("Erro ao buscar automóvel:", e);
                });

            // --- SUCESSO! ---
            setSucesso(true);
            setMensagemSucesso("Operação de venda realizada com sucesso!");

            setTimeout(() => {
                navigate('/home');
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
                    <h1 className="fw-bold">Cadastro de Automóvel</h1>
                    <p className="text-muted">Preencha os dados abaixo para registrar um novo veículo no sistema.</p>
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

                {/* Formulário com Seções */}
                <form onSubmit={saveVenda} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    {/* Seção 4: Troca */}
                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Detalhes Venda</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label for="valor" class="form-label">Valor</label>
                                <input type="text" className={`form-control ${hasError("valor_diferenca") && "is-invalid"}`} id="valor" name="valor" aria-describedby="valorHelp" onChange={handleInputChangeVenda} value={automovel?.valor} />
                                {vazio.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor.</div>}
                                {tipo.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Valor inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="forma_pagamento" class="form-label">Forma de Pagamento</label>
                                <Select className={`${hasError("forma_pagamento") && "is-invalid"}`} id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === venda.forma_pagamento)} onChange={(option) => setVenda({ ...venda, forma_pagamento: option.value })} options={optionsFormaPagamento} isClearable={true}>
                                </Select>
                                {vazio.includes("forma_pagamento") && <div id="formapagamentohelp" class="form-text text-danger ms-1">Informe a forma de pagamento.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="comissao" class="form-label">Comissão</label>
                                <input type="text" className={`form-control ${hasError("comissao") && "is-invalid"}`} id="comissao" name="comissao" aria-describedby="comissaoHelp" onChange={handleInputChangeVenda} />
                                {vazio.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Informe o valor de comissão.</div>}
                                {tipo.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Valor de comissão inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="data" class="form-label">Data</label><br />
                                <DatePicker
                                    calendarClassName="custom-datepicker-container"
                                    className={`form-control ${hasError("data") && "is-invalid"}`}
                                    type="text"
                                    aria-describedby="dataHelp"
                                    id="data"
                                    name="data"
                                    selected={venda.data}
                                    onChange={(date) => setVenda({ ...venda, data: date })}
                                    dateFormat="dd/MM/yyyy" // Formato da data
                                />
                                {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="fornecedor" class="form-label">Fornecedor</label>
                                <Select formatOptionLabel={formatOptionLabelFornecedor} styles={customStyles} isSearchable={true} className={`${hasError("fornecedor") && "is-invalid"}`} id="fornecedor" name="fornecedor" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={(option) => setVenda({ ...venda, clienteIdlId: option ? option.value : "" })} value={optionsFornecedor.find(option => option.value === venda.clienteId) || null} isClearable={true} filterOption={(option, inputValue) => {
                                    const label = option.label;
                                    const texto = [
                                        label.nome,
                                        label.razaoSocial,
                                        label.cpf,
                                        label.cnpj,
                                    ].filter(Boolean).join(" ").toLowerCase();
                                    return texto.includes(inputValue.toLowerCase());
                                }}>
                                </Select>
                                {vazio.includes("clienteId") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o proprietário.</div>}
                            </div>
                            <div className="col-md-4">
                                <label for="automovel_fornecido" class="form-label">Automóvel Fornecido</label>
                                <Select formatOptionLabel={formatOptionLabel} styles={customStyles} isSearchable={true} className={`${hasError("automovel_fornecido") && "is-invalid"}`} id="automovel_fornecido" name="automovel_fornecido" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setVenda({ ...venda, automovelId: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === venda.automovelId) || null} isClearable={true}
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
                                {vazio.includes("automovel_fornecido") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel fornecido.</div>}
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

export default Venda;