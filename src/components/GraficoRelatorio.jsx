import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Registra todos os elementos que vamos usar
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// --- Funções de Processamento de Dados ---

// Processador para Vendas e Consignações (o que já tínhamos)
const processarDadosPorDia = (dados, tipo) => {
    let dateKey = tipo === 'Consignacao' ? 'data_inicio' : 'data';
    const dadosAgrupados = dados.reduce((acc, item) => {
        const dataDoItem = item[dateKey];
        if (!dataDoItem) return acc;
        const dataFormatada = new Date(dataDoItem).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        if (!acc[dataFormatada]) acc[dataFormatada] = 0;
        acc[dataFormatada] += parseFloat(item.valor || 0);
        return acc;
    }, {});
    const labelsOrdenados = Object.keys(dadosAgrupados).sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));
    return {
        labels: labelsOrdenados,
        datasets: [{
            label: `Valor de ${tipo} por Dia`,
            data: labelsOrdenados.map(data => dadosAgrupados[data]),
            backgroundColor: 'rgba(13, 110, 253, 0.6)',
        }]
    };
};

// NOVO: Processador para Gastos/Manutenções por Categoria
const processarDadosPorCategoria = (dados, tipo) => {
    const dadosAgrupados = dados.reduce((acc, item) => {

        // ANTES:
        // const categoria = item.categoria || 'Sem Categoria';

        // DEPOIS:
        const categoria = getCategoriaFromDescricao(item.descricao); // Usa nossa função inteligente!

        if (!acc[categoria]) acc[categoria] = 0;
        acc[categoria] += parseFloat(item.valor || 0);
        return acc;
    }, {});
    return {
        labels: Object.keys(dadosAgrupados),
        datasets: [{
            label: `Distribuição de ${tipo}`,
            data: Object.values(dadosAgrupados),
            backgroundColor: ['#0d6efd', '#6c757d', '#6f42c1', '#1b4965ff', '#bd773eff', '#0d7d49ff', '#aa8106ff'],
        }]
    };
};

// NOVO: Processador para Trocas por Resultado
const processarTrocasPorResultado = (dados) => {
    const resultados = dados.reduce((acc, item) => {
        const valor = parseFloat(item.valor || 0);
        if (valor > 0) acc['Saldo Positivo'] += 1;
        else if (valor < 0) acc['Saldo Negativo'] += 1;
        else acc['Saldo Zero'] += 1;
        return acc;
    }, { 'Saldo Positivo': 0, 'Saldo Negativo': 0, 'Saldo Zero': 0 });
    return {
        labels: Object.keys(resultados),
        datasets: [{
            label: 'Resultado das Trocas',
            data: Object.values(resultados),
            backgroundColor: ['#198754', '#dc3545', '#6c757d'],
        }]
    };
};

const getCategoriaFromDescricao = (descricao) => {
    if (!descricao) return 'Não especificado';

    const desc = descricao.toLowerCase(); // Converte para minúsculas para a busca não diferenciar maiúsculas/minúsculas

    // Adicione aqui as palavras-chave e categorias do seu negócio
    if (desc.includes('óleo') || desc.includes('filtro')) return 'Troca de Óleo e Filtros';
    if (desc.includes('pneu') || desc.includes('roda') || desc.includes('alinhamento') || desc.includes('balanceamento')) return 'Pneus e Rodas';
    if (desc.includes('imposto') || desc.includes('ipva') || desc.includes('documento') || desc.includes('licenciamento')) return 'Documentação e Impostos';
    if (desc.includes('estética') || desc.includes('lavagem') || desc.includes('polimento') || desc.includes('limpeza')) return 'Estética e Limpeza';
    if (desc.includes('bateria') || desc.includes('elétrica')) return 'Parte Elétrica';
    if (desc.includes('freio') || desc.includes('pastilha')) return 'Sistema de Freios';
    if (desc.includes('marketing') || desc.includes('anúncio') || desc.includes('plataforma')) return 'Marketing e Vendas';
    if (desc.includes('salário') || desc.includes('comissão')) return 'Recursos Humanos';

    // Se nenhuma palavra-chave for encontrada, retorna uma categoria padrão
    return 'Outros';
};

const processarComprasPorMarca = (dados, todasAsMarcas) => {
    const dadosAgrupados = dados.reduce((acc, compra) => {
        // Encontra o nome da marca usando o marcaId do automóvel da compra
        const marcaDoAutomovel = todasAsMarcas.find(m => m.id === compra.automovel?.marcaId);
        const marcaNome = marcaDoAutomovel?.nome || 'Marca Desconhecida';

        if (!acc[marcaNome]) {
            acc[marcaNome] = 0;
        }

        // Soma o valor da compra para aquela marca
        acc[marcaNome] += parseFloat(compra.valor || 0);
        return acc;
    }, {});

    return {
        labels: Object.keys(dadosAgrupados),
        datasets: [{
            label: 'Valor de Compra',
            data: Object.values(dadosAgrupados),
            backgroundColor: ['#0d6efd', '#6c757d', '#6f42c1', '#1b4965ff', '#bd773eff', '#0d7d49ff', '#aa8106ff', '#0a9cb9ff'],
        }]
    };
};


// --- Componente Principal do Gráfico ---

const GraficoRelatorio = ({ dados, tipo, marcas }) => {
    if (!dados || dados.length === 0) {
        return <p className="text-center text-muted">Não há dados suficientes para gerar um gráfico.</p>;
    }

    // --- OPÇÕES GLOBAIS PARA OS GRÁFICOS ---
    // Vamos criar um objeto de opções base para evitar repetição
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false, // Fundamental para o CSS funcionar
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    // ESTA É A NOVA OPÇÃO PARA O ESPAÇAMENTO
                    padding: 20 // Aumenta a distância entre a legenda e o gráfico. Ajuste o valor como desejar.
                }
            },
            title: {
                display: true,
                // O texto do título será definido dinamicamente abaixo
            }
        }
    };

    // Decide qual tipo de gráfico e quais dados usar
    switch (tipo) {
        case 'Venda':
        case 'Consignacao':
            const dadosGraficoBarra = processarDadosPorDia(dados, tipo);
            const barOptions = {
                ...commonOptions, // Usa as opções comuns
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        ...commonOptions.plugins.title,
                        text: `Evolução de ${tipo}s no Período` // Define o título específico
                    }
                }
            };
            return <Bar data={dadosGraficoBarra} options={barOptions} />;

        case 'Gasto':
        case 'Manutencao':
        case 'Troca': // O gráfico de Troca também é Pizza
            // Define os dados (pode ser de Categoria ou de Resultado)
            const dadosGraficoPizza = tipo === 'Troca' ? processarTrocasPorResultado(dados) : processarDadosPorCategoria(dados, tipo);
            const pieOptions = {
                ...commonOptions, // Usa as opções comuns
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        ...commonOptions.plugins.title,
                        text: tipo === 'Troca' ? 'Proporção de Resultados das Trocas' : `Distribuição de ${tipo}s por Categoria` // Título dinâmico
                    }
                }
            };

            return <Pie
                data={dadosGraficoPizza}
                options={pieOptions}
            />;

        case 'Compra':
            const dadosGraficoPizzaCompra = processarComprasPorMarca(dados, marcas);
            return <Pie
                data={dadosGraficoPizzaCompra}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: {
                            display: true,
                            text: `Distribuição de Compras por Marca`
                        }
                    }
                }}
            />;

        // Adicione um case para 'Compra' se desejar um gráfico específico para ele

        default:
            return <p className="text-center text-muted">Visualização não disponível para este tipo de relatório.</p>;
    }
};

export default GraficoRelatorio;