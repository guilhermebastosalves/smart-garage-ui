// src/pages/Relatorios.jsx

import { useState } from 'react';
import Header from '../components/Header';
import { Form, Button, Card, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import RelatorioDataService from '../services/relatorioDataService';
import { format } from 'date-fns'; // Biblioteca para manipular datas facilmente (npm install date-fns)

const Relatorios = () => {
    // Estados para os filtros
    const [tipoRelatorio, setTipoRelatorio] = useState('Venda');
    const [periodo, setPeriodo] = useState('ultimo_mes');

    // Estados para os dados e controle de UI
    const [dados, setDados] = useState([]);
    const [sumario, setSumario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [relatorioGerado, setRelatorioGerado] = useState(false);

    // ... (lógica e JSX virão aqui) ...
    // Dentro do componente Relatorios

    const handleGerarRelatorio = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setDados([]);
        setSumario(null);
        setRelatorioGerado(false);

        // 1. Calcular as datas com base no período
        const hoje = new Date();
        let dataInicio = new Date();
        const dataFim = format(hoje, 'yyyy-MM-dd');

        switch (periodo) {
            case 'ultimo_mes':
                dataInicio.setMonth(hoje.getMonth() - 1);
                break;
            case 'ultimos_3_meses':
                dataInicio.setMonth(hoje.getMonth() - 3);
                break;
            case 'ultimo_semestre':
                dataInicio.setMonth(hoje.getMonth() - 6);
                break;
            default:
                dataInicio.setMonth(hoje.getMonth() - 1);
        }

        const params = {
            tipo: tipoRelatorio,
            dataInicio: format(dataInicio, 'yyyy-MM-dd'),
            dataFim: dataFim,
        };

        // 2. Chamar a API
        try {
            const response = await RelatorioDataService.gerarRelatorio(params);
            setDados(response.data);
            calcularSumario(response.data); // Função para calcular os totais
            setRelatorioGerado(true);
        } catch (error) {
            setErro('Falha ao buscar dados do relatório. Tente novamente.');
            console.error("Erro ao gerar relatório:", error);
        } finally {
            setLoading(false);
        }
    };

    const calcularSumario = (dadosRelatorio) => {
        if (!dadosRelatorio || dadosRelatorio.length === 0) {
            setSumario(null);
            return;
        }

        // Calcula o valor total. A propriedade 'valor' pode ter nomes diferentes.
        const valorTotal = dadosRelatorio.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
        const quantidadeRegistros = dadosRelatorio.length;

        setSumario({
            valorTotal,
            quantidadeRegistros,
        });
    };


    // Dentro do componente Relatorios

    const renderTabelaRelatorio = () => {
        // Formata a data para o padrão brasileiro
        const formatDate = (dateString) => format(new Date(dateString), 'dd/MM/yyyy');

        // Formata um valor para moeda
        const formatCurrency = (value) => parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        switch (tipoRelatorio) {
            case 'Venda':
                return (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Veículo</th>
                                <th>Valor</th>
                                <th>Forma de Pagamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data)}</td>
                                    <td>{item.cliente?.nome || 'N/A'}</td>
                                    <td>{item.automovel?.placa || 'N/A'}</td>
                                    <td>{formatCurrency(item.valor)}</td>
                                    <td>{item.forma_pagamento}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'Gasto':
                return (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Veículo (Placa)</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dados.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data)}</td>
                                    <td>{item.descricao}</td>
                                    <td>{item.automovel?.placa || 'Gasto Geral'}</td>
                                    <td>{formatCurrency(item.valor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            // ... Crie outros 'case' para Troca, Consignacao, Manutencao
            default:
                return <p>Tipo de relatório não configurado para exibição.</p>;
        }
    };

    return (
        <>
            <Header />
            {/* Dentro do return do componente Relatorios */}

            <div className="container mt-4">
                <div className="mb-4">
                    <h1 className="fw-bold">Central de Relatórios</h1>
                    <p className="text-muted">Selecione os filtros para gerar um relatório detalhado.</p>
                </div>

                <Card className="form-card mb-4">
                    <Card.Header>Filtros do Relatório</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleGerarRelatorio}>
                            <Row className="align-items-end g-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Tipo de Relatório</Form.Label>
                                        <Form.Select value={tipoRelatorio} onChange={(e) => setTipoRelatorio(e.target.value)}>
                                            <option value="Venda">Vendas</option>
                                            <option value="Troca">Trocas</option>
                                            <option value="Consignacao">Consignações</option>
                                            <option value="Gasto">Gastos</option>
                                            <option value="Manutencao">Manutenções</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label>Período</Form.Label>
                                        <Form.Select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                                            <option value="ultimo_mes">Último Mês</option>
                                            <option value="ultimos_3_meses">Últimos 3 Meses</option>
                                            <option value="ultimo_semestre">Último Semestre</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <div className="d-grid">
                                        <Button type="submit" variant="primary" disabled={loading}>
                                            {loading ? 'Gerando...' : 'Gerar Relatório'}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {/* ... (Área de resultados virá aqui) ... */}
                // Dentro do container, após o Card dos filtros

                {loading && (
                    <div className="text-center mt-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Carregando dados...</p>
                    </div>
                )}

                {erro && <Alert variant="danger" className="mt-4">{erro}</Alert>}

                {/* Exibe o sumário e a tabela apenas se não estiver carregando e não houver erro */}
                {!loading && !erro && relatorioGerado && (
                    <>
                        {dados.length > 0 ? (
                            <>
                                {/* Seção de Sumário */}
                                <Row className="mt-4">
                                    <Col md={6}>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title className="text-muted">Total de Registros</Card.Title>
                                                <p className="fs-2 fw-bold">{sumario?.quantidadeRegistros}</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6}>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title className="text-muted">Valor Total Movimentado</Card.Title>
                                                <p className="fs-2 fw-bold">
                                                    {sumario?.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Seção da Tabela de Detalhes */}
                                <Card className="form-card mt-4">
                                    <Card.Header>Detalhes do Relatório de {tipoRelatorio}</Card.Header>
                                    <Card.Body>
                                        {renderTabelaRelatorio()}
                                    </Card.Body>
                                </Card>
                            </>
                        ) : (
                            <Alert variant="info" className="mt-4">
                                Nenhum dado encontrado para os filtros selecionados.
                            </Alert>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default Relatorios;