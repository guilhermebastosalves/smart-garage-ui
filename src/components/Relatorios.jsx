import { useState } from 'react';
import Header from '../components/Header';
import { Form, Button, Card, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import RelatorioDataService from '../services/relatorioDataService';
import { format } from 'date-fns'; // Biblioteca para manipular datas facilmente (npm install date-fns)
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Relatorios = () => {
    // Estados para os filtros
    const [tipoRelatorio, setTipoRelatorio] = useState('Venda');
    const [tipoRelatorioGerado, setTipoRelatorioGerado] = useState('');
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
            setTipoRelatorioGerado(params.tipo); // <-- ADICIONE ESTA LINHA
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
        const ticketmedio = valorTotal / quantidadeRegistros;

        setSumario({
            valorTotal,
            quantidadeRegistros,
            ticketmedio
        });
    };


    // Dentro do componente Relatorios

    const renderTabelaRelatorio = () => {
        // Formata a data para o padrão brasileiro
        const formatDate = (dateString) => {
            // Se a string da data for nula, indefinida ou vazia, retorna um valor padrão.
            if (!dateString) {
                return 'N/A'; // Ou 'Data Inválida', ou uma string vazia ''
            }
            // Tenta formatar a data. Se falhar, retorna um valor de erro.
            try {
                return format(new Date(dateString), 'dd/MM/yyyy');
            } catch (error) {
                console.error("Erro ao formatar data:", dateString, error);
                return 'Data Inválida';
            }
        };

        // Formata um valor para moeda
        const formatCurrency = (value) => parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        switch (tipoRelatorioGerado) {
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

    // Dentro do seu componente Relatorios, após receber os dados da API
    // const processarDadosParaGrafico = (dados) => {
    //     const vendasPorDia = dados.reduce((acc, venda) => {
    //         const data = format(new Date(venda.data), 'dd/MM');
    //         if (!acc[data]) {
    //             acc[data] = 0;
    //         }
    //         acc[data] += parseFloat(venda.valor);
    //         return acc;
    //     }, {});

    //     return {
    //         labels: Object.keys(vendasPorDia),
    //         datasets: [{
    //             label: 'Valor de Venda por Dia',
    //             data: Object.values(vendasPorDia),
    //             backgroundColor: 'rgba(13, 110, 253, 0.6)',
    //             borderColor: 'rgba(13, 110, 253, 1)',
    //             borderWidth: 1,
    //         }]
    //     };
    // };

    const processarDadosParaGrafico = (dados, tipo) => {
        // Se não houver dados ou tipo, retorna uma estrutura vazia para o gráfico
        if (!dados || dados.length === 0 || !tipo) {
            return { labels: [], datasets: [] };
        }

        // 1. Configurações dinâmicas com base no tipo de relatório
        let dateKey = 'data';
        let valueKey = 'valor';
        let label = 'Valor por Dia';

        switch (tipo) {
            case 'Venda':
                label = 'Valor de Venda por Dia';
                break;
            case 'Troca':
                label = 'Valor de Troca por Dia';
                break;
            case 'Gasto':
                label = 'Valor de Gasto por Dia';
                break;
            case 'Consignacao':
                label = 'Valor de Consignação por Dia';
                dateKey = 'data_inicio'; // Chave de data específica para Consignacao
                break;
            case 'Manutencao':
                label = 'Custo de Manutenção por Dia';
                dateKey = 'data_envio'; // Chave de data específica para Manutencao
                break;
        }

        // 2. Agrupa os dados por dia, somando os valores
        const dadosAgrupados = dados.reduce((acc, item) => {
            const dataDoItem = item[dateKey]; // Acessa a data usando a chave dinâmica

            // Pula itens que não têm uma data válida
            if (!dataDoItem) {
                return acc;
            }

            // Agrupa por 'yyyy-MM-dd' para garantir a ordenação correta
            const dataFormatada = format(new Date(dataDoItem), 'yyyy-MM-dd');

            if (!acc[dataFormatada]) {
                acc[dataFormatada] = 0;
            }

            // Acessa o valor usando a chave dinâmica e garante que é um número
            acc[dataFormatada] += parseFloat(item[valueKey] || 0);
            return acc;
        }, {});

        // 3. Ordena as datas (chaves do objeto) cronologicamente
        const labelsOrdenados = Object.keys(dadosAgrupados).sort();

        // 4. Prepara os dados finais para o gráfico no formato correto
        const dadosFinais = {
            // Formata as labels para exibição (dd/MM) após a ordenação
            labels: labelsOrdenados.map(data => format(new Date(data), 'dd/MM')),
            datasets: [{
                label: label, // Usa a label dinâmica
                // Pega os valores na ordem correta das labels ordenadas
                data: labelsOrdenados.map(data => dadosAgrupados[data]),
                backgroundColor: 'rgba(13, 110, 253, 0.6)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1,
            }]
        };

        return dadosFinais;
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

                {/* Logo abaixo dos filtros e acima da tabela */}
                {/* <Row className="mt-4 g-3">
                    <Col md={3}><Card className="text-center"> ... Total de Registros ... </Card></Col>
                    <Col md={3}><Card className="text-center"> ... Valor Total ... </Card></Col>
                    <Col md={3}><Card className="text-center">
                        <Card.Body>
                            <Card.Title className="text-muted">Ticket Médio</Card.Title>
                            <p className="fs-2 fw-bold"></p>
                        </Card.Body>
                    </Card></Col>
                    <Col md={3}><Card className="text-center">
                        <Card.Body>
                            <Card.Title className="text-muted">Venda Destaque</Card.Title>
                            <p className="fs-2 fw-bold"></p>
                        </Card.Body>
                    </Card></Col>
                </Row> */}


                {/* ... (Área de resultados virá aqui) ... */}
                {/* // Dentro do container, após o Card dos filtros */}

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
                                    <Col md={4}>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title className="text-muted">Total de Registros</Card.Title>
                                                <p className="fs-2 fw-bold">{sumario?.quantidadeRegistros}</p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title className="text-muted">Valor Total Movimentado</Card.Title>
                                                <p className="fs-2 fw-bold">
                                                    {sumario?.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={4}>
                                        <Card className="text-center">
                                            <Card.Body>
                                                <Card.Title className="text-muted">Ticket Médio</Card.Title>
                                                <p className="fs-2 fw-bold">
                                                    {sumario?.ticketmedio?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Seção da Tabela de Detalhes */}
                                <Card className="form-card mt-4">
                                    <Card.Header>Detalhes do Relatório de {tipoRelatorioGerado}</Card.Header>
                                    <Card.Body>
                                        {renderTabelaRelatorio()}
                                    </Card.Body>
                                </Card>

                                {/* ... dentro do seu JSX de Relatorios, acima da tabela */}
                                <Card className="form-card mt-4">
                                    <Card.Header>Desempenho no Período</Card.Header>
                                    <Card.Body>
                                        <Bar data={processarDadosParaGrafico(dados, tipoRelatorioGerado)} />
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