import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import ClienteDataService from '../../services/clienteDataService';
import JuridicaDataService from '../../services/juridicaDataService';
import FisicaDataService from '../../services/fisicaDataService';
import Select from "react-select";
import { Form, Button, Card, Alert, Spinner, ToggleButton, ButtonGroup, Row, Col } from 'react-bootstrap';

const EditarCliente = () => {
    const { id } = useParams(); // Pega o ID da URL
    const navigate = useNavigate();

    // Estados para os dados do formulário
    const [cliente, setCliente] = useState({ nome: "", email: "", telefone: "" });
    const [fisica, setFisica] = useState({ cpf: "", rg: "" });
    const [juridica, setJuridica] = useState({ cnpj: "", razao_social: "", nome_responsavel: "" });
    const [endereco, setEndereco] = useState({ cep: "", logradouro: "", bairro: "", numero: "" });
    const [cidade, setCidade] = useState({ nome: "" });
    const [estado, setEstado] = useState({ uf: "" });

    // Estados de controle da UI
    const [opcao, setOpcao] = useState(''); // 'fisica' ou 'juridica'
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);

    // Efeito para buscar os dados do cliente quando o componente carrega
    useEffect(() => {
        if (id) {
            setLoading(true);
            ClienteDataService.get(id)
                .then(response => {
                    const { cliente, fisica, juridica, endereco } = response.data;

                    setCliente(cliente || { nome: "", email: "", telefone: "" });
                    setEndereco(endereco || { cep: "", logradouro: "", bairro: "", numero: "" });

                    if (fisica) {
                        setFisica(fisica);
                        setOpcao('fisica');
                    }
                    if (juridica) {
                        setJuridica(juridica);
                        setOpcao('juridica');
                    }
                    if (endereco?.cidade) {
                        setCidade(endereco.cidade);
                        if (endereco.cidade.estado) {
                            setEstado(endereco.cidade.estado);
                        }
                    }
                })
                .catch(e => {
                    console.error("Erro ao buscar cliente para edição:", e);
                    setErro("Não foi possível carregar os dados do cliente.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Lógica de validação (copiada e adaptada do seu Cliente.jsx)
    const validateFields = () => {
        // ... (Cole aqui suas funções 'validateFieldsPessoaFisica' e 'validateFieldsPessoaJuridica' do Cliente.jsx)
        // Você pode unificá-las em uma única função se preferir.
        return { vazioErros: [], tamanhoErros: [], tipoErros: [] }; // Placeholder
    };

    const handleInputChange = (setter) => (e) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (erro) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [erro]);

    // Função para salvar as alterações
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErro('');
        setSucesso('');

        // ... (Sua lógica de validação aqui)


        const dataPayload = {
            cliente,
            fisica: opcao === 'fisica' ? fisica : null,
            juridica: opcao === 'juridica' ? juridica : null,
            endereco,
            cidade,
            estado
        };

        try {
            if (opcao === "juridica") {
                const verificacaoJuridica = await JuridicaDataService.duplicidade({
                    cnpj: juridica.cnpj,
                    razao_social: juridica.razao_social,
                    idClienteAtual: id
                })

                if (verificacaoJuridica.data.erro) {
                    setErro(verificacaoJuridica.data.mensagemErro);
                    throw new Error(verificacaoJuridica.data.mensagemErro);
                }
            }

            if (opcao === "fisica") {
                const verificacaoFisica = await FisicaDataService.duplicidade({
                    rg: fisica.rg,
                    cpf: fisica.cpf,
                    idClienteAtual: id
                })

                if (verificacaoFisica.data.erro) {
                    setErro(verificacaoFisica.data.erro);
                    throw new Error(verificacaoFisica.data.mensagemErro);
                }
            }
            await ClienteDataService.update(id, dataPayload);
            setSucesso("Cliente atualizado com sucesso!");
            setTimeout(() => navigate('/listagem/clientes'), 1500);
        } catch (error) {
            const mensagem = error.response?.data?.mensagemErro || error.message || "Erro ao atualizar cliente.";
            setErro(mensagem);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="mb-4">
                    <h1 className="fw-bold">Editar Cliente</h1>
                    <p className="text-muted">Altere os dados abaixo para atualizar o cliente.</p>
                </div>

                {sucesso &&
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{sucesso}</div>
                    </div>}

                {erro &&
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{erro}</div>
                    </div>
                }

                <form onSubmit={handleUpdate} className={sucesso ? 'd-none' : ''}>
                    {/* Botões de tipo de pessoa - desabilitados na edição */}
                    <ButtonGroup className="mb-4">
                        <ToggleButton variant="outline-primary" checked={opcao === 'fisica'} disabled type="radio">Pessoa Física</ToggleButton>
                        <ToggleButton variant="outline-primary" checked={opcao === 'juridica'} disabled type="radio">Pessoa Jurídica</ToggleButton>
                    </ButtonGroup>

                    {/* Formulário de Informações do Cliente (comum a ambos) */}
                    <Card className="form-card mb-4">
                        <Card.Header>Informações Gerais</Card.Header>
                        <Card.Body>
                            <Row className="g-3">
                                <Col md={4}><Form.Group><Form.Label>Nome</Form.Label><Form.Control name="nome" value={cliente.nome} onChange={handleInputChange(setCliente)} /></Form.Group></Col>
                                <Col md={4}><Form.Group><Form.Label>Email</Form.Label><Form.Control name="email" type="email" value={cliente.email} onChange={handleInputChange(setCliente)} /></Form.Group></Col>
                                <Col md={4}><Form.Group><Form.Label>Telefone</Form.Label><Form.Control name="telefone" value={cliente.telefone} onChange={handleInputChange(setCliente)} /></Form.Group></Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Formulário Condicional para Pessoa Física ou Jurídica */}
                    {opcao === 'fisica' && (
                        <Card className="form-card mb-4">
                            <Card.Header>Documentos (Pessoa Física)</Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col md={6}><Form.Group><Form.Label>CPF</Form.Label><Form.Control name="cpf" value={fisica.cpf} onChange={handleInputChange(setFisica)} /></Form.Group></Col>
                                    <Col md={6}><Form.Group><Form.Label>RG</Form.Label><Form.Control name="rg" value={fisica.rg} onChange={handleInputChange(setFisica)} /></Form.Group></Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}
                    {opcao === 'juridica' && (
                        <Card className="form-card mb-4">
                            <Card.Header>Documentos (Pessoa Jurídica)</Card.Header>
                            <Card.Body>
                                {/* ... Campos para CNPJ, Razão Social, etc. ... */}
                                <Row className="g-3">
                                    <Col md={4}><Form.Group><Form.Label>CNPJ</Form.Label><Form.Control name="cnpj" value={juridica.cnpj} onChange={handleInputChange(setJuridica)} /></Form.Group></Col>
                                    <Col md={4}><Form.Group><Form.Label>Razão Social</Form.Label><Form.Control name="razao_social" value={juridica.razao_social} onChange={handleInputChange(setJuridica)} /></Form.Group></Col>
                                    <Col md={4}><Form.Group><Form.Label>Nome do Responsável</Form.Label><Form.Control name="nome_responsavel" value={juridica.nome_responsavel} onChange={handleInputChange(setJuridica)} /></Form.Group></Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Formulário de Endereço */}
                    <Card className="form-card mb-4">
                        <Card.Header>Endereço</Card.Header>
                        <Card.Body>
                            {/* ... Seus campos de endereço aqui, usando os estados 'endereco', 'cidade', 'estado' ... */}
                            <Row className="g-3">
                                <Col md={6}><Form.Group><Form.Label>CEP</Form.Label><Form.Control name="cep" value={endereco.cep} onChange={handleInputChange(setEndereco)} /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Logradouro</Form.Label><Form.Control name="logradouro" value={endereco.logradouro} onChange={handleInputChange(setEndereco)} /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Bairro</Form.Label><Form.Control name="bairro" value={endereco.bairro} onChange={handleInputChange(setEndereco)} /></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label>Numero</Form.Label><Form.Control name="numero" value={endereco.numero} onChange={handleInputChange(setEndereco)} /></Form.Group></Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Botões de Ação */}
                    <div className="d-flex justify-content-end pb-3">
                        <Button variant="outline-secondary" size="lg" className="me-3" onClick={() => navigate('/listagem/clientes')}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditarCliente;