import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ComissaoDataService from '../services/comissaoDataService';
import { Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'

const GerenciarComissoes = () => {
    const [regras, setRegras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState({ tipo: '', msg: '' });
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        ComissaoDataService.getAll()
            .then(response => {
                if (response.data && response.data.length > 0) {
                    setRegras(response.data);
                } else {
                    const regrasPadrao = [
                        { id: `temp-0`, valor_minimo: 0, valor_maximo: 50000, valor_comissao: '' },
                        { id: `temp-1`, valor_minimo: 50000, valor_maximo: 100000, valor_comissao: '' },
                        { id: `temp-2`, valor_minimo: 100000, valor_maximo: null, valor_comissao: '' },
                    ];
                    setRegras(regrasPadrao);
                }
            })
            .catch((e) => {
                console.error("Erro detalhado da API:", e);
                setFeedback({ tipo: 'danger', msg: 'Erro ao carregar as regras.' });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleInputChange = (index, field) => (e) => {
        const novasRegras = [...regras];
        const valorInput = e.target.value;

        // Atualiza o valor do campo que foi modificado
        novasRegras[index][field] = valorInput === '' && field === 'valor_maximo' ? null : valorInput;

        // --- NOVA LÓGICA DE ATUALIZAÇÃO EM CASCATA ---
        // Se o campo alterado foi um 'valor_maximo' e não é a última faixa
        if (field === 'valor_maximo' && index < novasRegras.length - 1) {
            const valorMaximoNumerico = parseFloat(valorInput);

            // Verifica se o valor é um número válido para evitar erros
            if (!isNaN(valorMaximoNumerico)) {
                // Calcula o novo valor mínimo para a próxima faixa e formata com 2 casas decimais
                novasRegras[index + 1].valor_minimo = (valorMaximoNumerico + 0.01).toFixed(2);
            }
        }

        setRegras(novasRegras);
    };

    const handleAdicionarFaixa = () => {
        if (regras.length === 0) return;

        const ultimaRegra = regras[regras.length - 1];
        const valorMaximoAnterior = parseFloat(ultimaRegra.valor_maximo);

        if (isNaN(valorMaximoAnterior)) {
            setFeedback({ tipo: 'warning', msg: 'Defina um valor máximo para a penúltima faixa antes de adicionar uma nova.' });
            return;
        }

        // Lógica de +0.01 aplicada aqui também
        const novoValorMinimo = (valorMaximoAnterior + 0.01).toFixed(2);

        const regrasAtualizadas = [...regras];
        regrasAtualizadas[regras.length - 1].valor_maximo = valorMaximoAnterior;

        setRegras([
            ...regrasAtualizadas,
            { id: `temp-${regras.length}`, valor_minimo: novoValorMinimo, valor_maximo: null, valor_comissao: '' }
        ]);
    };

    const handleRemoverFaixa = (indexParaRemover) => {
        if (regras.length <= 1) return;
        const novasRegras = regras.filter((_, index) => index !== indexParaRemover);
        if (novasRegras.length > 0) {
            novasRegras[novasRegras.length - 1].valor_maximo = null;
        }
        setRegras(novasRegras);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setFeedback({ tipo: '', msg: '' });
        try {
            // CORREÇÃO: Removemos o ID temporário antes de salvar
            const regrasParaSalvar = regras.map(regra => ({
                valor_minimo: regra.valor_minimo,
                valor_maximo: regra.valor_maximo,
                valor_comissao: regra.valor_comissao
            }));
            await ComissaoDataService.updateAll(regrasParaSalvar);
            setFeedback({ tipo: 'success', msg: 'Regras de comissão salvas com sucesso!' });
        } catch (error) {
            setFeedback({ tipo: 'danger', msg: 'Erro ao salvar as regras. Verifique os valores.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h1 className="fw-bold">
                            Gerenciar Comissões</h1>
                        <p className="text-muted">Defina as faixas de valor e as comissões correspondentes para vendas e trocas.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate('/home')}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                {feedback.msg && <Alert variant={feedback.tipo}>{feedback.msg}</Alert>}

                <Card className="form-card">
                    <Card.Header as="h5">Regras de Comissão</Card.Header>
                    <Card.Body>
                        {loading ? <Spinner animation="border" /> : (
                            regras.map((regra, index) => (
                                <InputGroup className="mb-3" key={regra.id || `temp-key-${index}`}>
                                    <InputGroup.Text>De R$</InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        value={regra.valor_minimo}
                                        onChange={handleInputChange(index, 'valor_minimo')}
                                        readOnly={index > 0}
                                    />
                                    <InputGroup.Text>Até R$</InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        placeholder="acima"
                                        value={regra.valor_maximo === null ? '' : regra.valor_maximo}
                                        onChange={handleInputChange(index, 'valor_maximo')}
                                    // disabled={index === regras.length - 1 && regras.length > 2}
                                    />
                                    <InputGroup.Text>Comissão de R$</InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        placeholder="0.00"
                                        value={regra.valor_comissao}
                                        onChange={handleInputChange(index, 'valor_comissao')}
                                    />
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => handleRemoverFaixa(index)}
                                        disabled={regras.length <= 1}
                                    >
                                        <i className="bi bi-trash-fill"></i>
                                    </Button>
                                </InputGroup>
                            ))
                        )}
                        <Button variant="outline-primary" onClick={handleAdicionarFaixa}>
                            <i className="bi bi-plus-lg me-2"></i>
                            Adicionar Valores
                        </Button>
                    </Card.Body>
                    <Card.Footer className="text-end">
                        <Button onClick={handleSave} disabled={isSaving || loading}>
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </Card.Footer>
                </Card>
            </div>
        </>
    );
};

export default GerenciarComissoes;