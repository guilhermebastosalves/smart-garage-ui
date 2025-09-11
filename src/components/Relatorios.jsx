import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { Form, Button, Card, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import RelatorioDataService from '../services/relatorioDataService';
import AutomovelDataService from '../services/automovelDataService';
import { format } from 'date-fns'; // Biblioteca para manipular datas facilmente (npm install date-fns)
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import GraficoRelatorio from '../components/GraficoRelatorio'; // Ajuste o caminho se necessário
import MarcaDataService from '../services/marcaDataService';

const Relatorios = () => {
    // Estados para os filtros
    const [tipoRelatorio, setTipoRelatorio] = useState('Venda');
    const [tipoRelatorioGerado, setTipoRelatorioGerado] = useState('');
    const [periodo, setPeriodo] = useState('ultimo_mes');
    const resultadosRef = useRef(null);

    // Estados para os dados e controle de UI
    const [dados, setDados] = useState([]);
    const [sumario, setSumario] = useState(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');


    const [todosAutomoveis, setTodosAutomoveis] = useState([]); // <-- Novo estado
    const [marcas, setMarcas] = useState([]);

    // Carregue os automóveis  emarcas junto com o restante dos dados
    useEffect(() => {
        Promise.all([
            AutomovelDataService.getAll(),
            MarcaDataService.getAll() // <-- Adicione esta chamada
        ]).then(([automoveisResp, marcasResp]) => {
            setTodosAutomoveis(automoveisResp.data);
            setMarcas(marcasResp.data); // <-- Guarde os dados das marcas
        }).catch(e => console.error("Erro ao buscar dados iniciais:", e));
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10; // Ou o número de registros que preferir por página
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    // A única mudança é aqui: usamos 'dados' em vez de 'listaAtual'
    const records = dados.slice(firstIndex, lastIndex);
    const npage = Math.ceil(dados.length / recordsPerPage);
    // Previne a criação de um array com 'NaN' ou 'Infinity' se npage não for um número válido
    const numbers = npage > 0 && isFinite(npage) ? [...Array(npage + 1).keys()].slice(1) : [];

    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < npage) setCurrentPage(currentPage + 1); };

    const [relatorioGerado, setRelatorioGerado] = useState(false);

    useEffect(() => {
        // Se a referência estiver anexada a um elemento, role suavemente para a visão dele
        if (resultadosRef.current) {
            resultadosRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]); // A Mágica: Este efeito roda toda vez que 'currentPage' muda

    // ... (lógica e JSX virão aqui) ...
    // Dentro do componente Relatorios

    const handleGerarRelatorio = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setDados([]);
        setSumario(null);
        setRelatorioGerado(false);
        setCurrentPage(1); // <-- ADICIONE ESTA LINHA AQUI

        // 1. Calcular as datas com base no período
        const hoje = new Date();
        let dataInicio = new Date();
        const dataFim = new Date();

        // Define dataFim para o ÚLTIMO milissegundo do dia de hoje
        dataFim.setHours(23, 59, 59, 999);

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

        // Define dataInicio para o PRIMEIRO milissegundo do dia de início
        dataInicio.setHours(0, 0, 0, 0);

        const params = {
            tipo: tipoRelatorio,
            dataInicio: dataInicio.toISOString(),
            dataFim: dataFim.toISOString(),
        };

        // 2. Chamar a API
        try {
            const response = await RelatorioDataService.gerarRelatorio(params);
            setDados(response.data);
            calcularSumario(response.data, params.tipo);  // Função para calcular os totais
            setRelatorioGerado(true);
            setTipoRelatorioGerado(params.tipo); // <-- ADICIONE ESTA LINHA
        } catch (error) {
            setErro('Falha ao buscar dados do relatório. Tente novamente.');
            console.error("Erro ao gerar relatório:", error);
        } finally {
            setLoading(false);
        }
    };

    const calcularSumario = (dadosRelatorio, tipo) => {

        if (!dadosRelatorio || dadosRelatorio.length === 0) {
            setSumario(null);
            return;
        }

        const quantidadeRegistros = dadosRelatorio.length;

        if (tipo === 'Venda') {
            // A lógica de Venda agora foca em Lucro
            const lucroTotal = dadosRelatorio.reduce((acc, item) => acc + parseFloat(item.lucro || 0), 0);
            const valorTotalVendido = dadosRelatorio.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
            // Margem de Lucro Média (%)
            const margemMedia = valorTotalVendido > 0 ? (lucroTotal / valorTotalVendido) * 100 : 0;

            setSumario({
                quantidadeRegistros,
                valorTotal: valorTotalVendido,
                lucroTotal,
                margemMedia
            });

        }
        //  LÓGICA CONDICIONAL: Se for um relatório de Troca
        else if (tipo === 'Troca') {
            const totalRecebido = dadosRelatorio
                .filter(item => parseFloat(item.valor) > 0)
                .reduce((acc, item) => acc + parseFloat(item.valor), 0);

            const totalPago = dadosRelatorio
                .filter(item => parseFloat(item.valor) < 0)
                .reduce((acc, item) => acc + Math.abs(parseFloat(item.valor)), 0); // Usamos Math.abs para somar como um total positivo de saídas

            const saldoFinal = totalRecebido - totalPago;

            setSumario({
                quantidadeRegistros,
                totalRecebido,
                totalPago,
                saldoFinal,
            });

        }
        else {
            // LÓGICA PADRÃO para todos os outros relatórios
            const valorTotal = dadosRelatorio.reduce((acc, item) => acc + parseFloat(item.valor || 0), 0);
            const ticketmedio = valorTotal / quantidadeRegistros;

            setSumario({
                valorTotal,
                quantidadeRegistros,
                ticketmedio,
            });
        }
    };



    // Dentro do componente Relatorios

    const renderTabelaRelatorio = () => {
        // Formata a data para o padrão brasileiro

        const formatDate = (dateString) => {
            if (!dateString) {
                return 'N/A';
            }
            try {
                const date = new Date(dateString);
                // Pega o deslocamento do fuso horário do usuário em minutos e converte para milissegundos
                // Ex: Para o Brasil (UTC-3), o offset é 180.
                const userTimezoneOffset = date.getTimezoneOffset() * 60000;

                // "Corrige" a data, somando o deslocamento para que a data local corresponda ao dia em UTC
                const correctedDate = new Date(date.getTime() + userTimezoneOffset);

                return format(correctedDate, 'dd/MM/yyyy');
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
                                <th>Automóvel</th>
                                <th>Origem</th>
                                <th>Valor</th>
                                <th>Forma de Pagamento</th>
                                <th>Valor Aquisição</th>
                                <th>Comissão</th>
                                <th>Lucro</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data)}</td>
                                    <td>{item.cliente?.nome || 'N/A'}</td>
                                    <td>{item.automovel?.placa || 'N/A'}</td>
                                    <td>{item.origem || 'N/A'}</td>
                                    <td className='text-end'>{formatCurrency(item.valor)}</td>
                                    <td>{item.forma_pagamento}</td>
                                    <td className='text-end'>{formatCurrency(item.custo)}</td>
                                    <td className='text-end'>{formatCurrency(item.comissao)}</td>
                                    <td className={`text-end  ${item.lucro > 0 ? 'text-success' : 'text-danger'}`}>
                                        {formatCurrency(item.lucro)}
                                    </td>
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
                                <th>Automóvel (Placa)</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data)}</td>
                                    <td>{item.descricao}</td>
                                    <td>{item.automovel?.placa || 'Gasto Geral'}</td>
                                    <td className='text-end'>{formatCurrency(item.valor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'Troca':
                return (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Automóvel Recebido</th>
                                <th>Automóvel Fornecido</th>
                                <th>Valor Diferença</th>
                                <th>Forma de Pagamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(item => {

                                const automovelFornecidoInfo = todosAutomoveis.find(
                                    auto => auto.id === item.automovel_fornecido
                                );

                                return (
                                    <tr key={item.id}>
                                        <td>{formatDate(item.data)}</td>
                                        <td>{item.cliente?.nome || 'N/A'}</td>
                                        <td>{item.automovel?.placa || 'N/A'}</td>
                                        <td>{automovelFornecidoInfo?.placa || 'N/A'}</td>
                                        <td className='text-end'>{formatCurrency(item.valor)}</td>
                                        <td>{item.forma_pagamento || '-'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                );
            case 'Consignacao':
                return (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Data Início</th>
                                <th>Cliente</th>
                                <th>Automóvel (Placa)</th>
                                <th>Valor</th>
                                <th>Situação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data_inicio)}</td>
                                    <td>{item.cliente?.nome || 'N/A'}</td>
                                    <td>{item.automovel?.placa || 'N/A'}</td>
                                    <td className='text-end'>{formatCurrency(item.valor)}</td>
                                    <td>{item.ativo === true ? "Ativa" : "Inativa"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'Manutencao':
                return (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Data Envio</th>
                                <th>Descrição</th>
                                <th>Automóvel (Placa)</th>
                                <th>Valor</th>
                                <th>Situação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data_envio)}</td>
                                    <td>{item.descricao}</td>
                                    <td>{item.automovel?.placa || 'N/A'}</td>
                                    <td className='text-end'>{formatCurrency(item.valor)}</td>
                                    <td>{item.ativo === true ? "Ativa" : "Inativa"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                );
            case 'Compra':
                return (
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Fornecedor</th>
                                <th>Automóvel</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.data)}</td>
                                    <td>{item.cliente?.nome || 'N/A'}</td>
                                    <td>{item.automovel?.placa || 'N/A'}</td>
                                    <td className='text-end'>{formatCurrency(item.valor)}</td>
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


    // const processarDadosParaGrafico = (dados, tipo) => {
    //     // Se não houver dados ou tipo, retorna uma estrutura vazia para o gráfico
    //     if (!dados || dados.length === 0 || !tipo) {
    //         return { labels: [], datasets: [] };
    //     }

    //     // 1. Configurações dinâmicas com base no tipo de relatório
    //     let dateKey = 'data';
    //     let valueKey = 'valor';
    //     let label = 'Valor por Dia';

    //     switch (tipo) {
    //         case 'Venda':
    //             label = 'Valores de Venda por Dia';
    //             break;
    //         case 'Compra':
    //             label = 'Valores de Compra por Dia';
    //             break;
    //         case 'Troca':
    //             label = 'Valor diferença de Troca por Dia';
    //             break;
    //         case 'Gasto':
    //             label = 'Custo de Gasto por Dia';
    //             break;
    //         case 'Consignacao':
    //             label = 'Valores de Consignação por Dia';
    //             dateKey = 'data_inicio'; // Chave de data específica para Consignacao
    //             break;
    //         case 'Manutencao':
    //             label = 'Custo de Manutenção por Dia';
    //             dateKey = 'data_envio'; // Chave de data específica para Manutencao
    //             break;
    //     }

    //     // 2. Agrupa os dados por dia, somando os valores
    //     const dadosAgrupados = dados.reduce((acc, item) => {
    //         const dataDoItem = item[dateKey]; // Acessa a data usando a chave dinâmica

    //         // Pula itens que não têm uma data válida
    //         if (!dataDoItem) {
    //             return acc;
    //         }

    //         // Agrupa por 'yyyy-MM-dd' para garantir a ordenação correta
    //         const dataFormatada = format(new Date(dataDoItem), 'yyyy-MM-dd');

    //         if (!acc[dataFormatada]) {
    //             acc[dataFormatada] = 0;
    //         }

    //         // Acessa o valor usando a chave dinâmica e garante que é um número
    //         acc[dataFormatada] += parseFloat(item[valueKey] || 0);
    //         return acc;
    //     }, {});

    //     // 3. Ordena as datas (chaves do objeto) cronologicamente
    //     const labelsOrdenados = Object.keys(dadosAgrupados).sort();

    //     // 4. Prepara os dados finais para o gráfico no formato correto
    //     const dadosFinais = {
    //         // Formata as labels para exibição (dd/MM) após a ordenação
    //         labels: labelsOrdenados.map(data => format(new Date(data), 'dd/MM')),
    //         datasets: [{
    //             label: label, // Usa a label dinâmica
    //             // Pega os valores na ordem correta das labels ordenadas
    //             data: labelsOrdenados.map(data => dadosAgrupados[data]),
    //             backgroundColor: 'rgba(13, 110, 253, 0.6)',
    //             borderColor: 'rgba(13, 110, 253, 1)',
    //             borderWidth: 1,
    //         }]
    //     };

    //     return dadosFinais;
    // };

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
                                            <option value="Compra">Compras</option>
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
                                <Row className="mt-4 g-3">
                                    {tipoRelatorioGerado === 'Troca' ? (
                                        <>
                                            {/* --- UI Específica para Relatório de Troca --- */}
                                            <Col md={3}>
                                                <Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Total de Trocas</Card.Title>
                                                        <p className="fs-2 fw-bold">{sumario?.quantidadeRegistros}</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Total Recebido</Card.Title>
                                                        <p className="fs-2 fw-bold">
                                                            {(sumario?.totalRecebido ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Total Pago</Card.Title>
                                                        <p className="fs-2 fw-bold">
                                                            {(sumario?.totalPago ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={3}>
                                                <Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Saldo Final</Card.Title>
                                                        <p className={`fs-2 fw-bold ${sumario?.saldoFinal >= 0 ? 'text-success' : 'text-danger'}`}>
                                                            {(sumario?.saldoFinal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </>
                                    )

                                        : tipoRelatorioGerado === 'Venda' ? (
                                            <>
                                                <Col md={3}><Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Total de Registros</Card.Title>
                                                        <p className="fs-2 fw-bold">{sumario?.quantidadeRegistros}</p>
                                                    </Card.Body>
                                                </Card></Col>
                                                <Col md={3}><Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Faturamento Total</Card.Title>
                                                        <p className="fs-2 fw-bold">
                                                            {(sumario?.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </Card.Body>
                                                </Card></Col>
                                                <Col md={3}><Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Lucro Bruto Total</Card.Title>
                                                        <p className="fs-2 fw-bold text-success">
                                                            {(sumario?.lucroTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                    </Card.Body>
                                                </Card></Col>
                                                <Col md={3}><Card className="text-center h-100">
                                                    <Card.Body>
                                                        <Card.Title className="text-muted">Margem Média</Card.Title>
                                                        <p className="fs-2 fw-bold">
                                                            {`${(sumario?.margemMedia ?? 0).toFixed(2)}%`}
                                                        </p>
                                                    </Card.Body>
                                                </Card></Col>
                                            </>
                                        ) : (
                                            <>
                                                {/* --- UI Padrão para Outros Relatórios --- */}
                                                <Col md={4}>
                                                    <Card className="text-center h-100">
                                                        <Card.Body>
                                                            <Card.Title className="text-muted">Total de Registros</Card.Title>
                                                            <p className="fs-2 fw-bold">{sumario?.quantidadeRegistros}</p>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                                <Col md={4}>
                                                    <Card className="text-center h-100">
                                                        <Card.Body>
                                                            <Card.Title className="text-muted">Valor Total Movimentado</Card.Title>
                                                            <p className="fs-2 fw-bold">
                                                                {(sumario?.valorTotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </p>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                                <Col md={4}>
                                                    <Card className="text-center h-100">
                                                        <Card.Body>
                                                            <Card.Title className="text-muted">Ticket Médio</Card.Title>
                                                            <p className="fs-2 fw-bold">
                                                                {(sumario?.ticketmedio ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                            </p>
                                                        </Card.Body>
                                                    </Card>
                                                </Col>
                                            </>
                                        )}
                                </Row>

                                {/* Seção da Tabela de Detalhes */}
                                <Card ref={resultadosRef} className="form-card mt-4">
                                    <Card.Header>Detalhes do Relatório de {tipoRelatorioGerado}</Card.Header>
                                    <Card.Body>
                                        {renderTabelaRelatorio()}
                                    </Card.Body>

                                    <Card.Footer className="bg-light">
                                        {!loading && dados.length > 0 && npage > 1 && (
                                            <nav className="d-flex justify-content-center">
                                                <ul className="pagination mb-0">
                                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={prePage}>Anterior</button>
                                                    </li>
                                                    {numbers.map((n) => (
                                                        <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                                                            <button className="page-link" onClick={() => changeCPage(n)}>{n}</button>
                                                        </li>
                                                    ))}
                                                    <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
                                                        <button className="page-link" onClick={nextPage}>Próximo</button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        )}
                                    </Card.Footer>
                                </Card>
                                {/* ... dentro do seu JSX de Relatorios, acima da tabela */}
                                <Card className="form-card mt-4 mb-4">
                                    <Card.Header>Desempenho no Período</Card.Header>
                                    <Card.Body>
                                        <div className="chart-container">
                                            <GraficoRelatorio periodo={periodo} marcas={marcas} dados={dados} tipo={tipoRelatorioGerado} />
                                        </div>
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