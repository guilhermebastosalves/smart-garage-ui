import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import VendedorDataService from '../../services/vendedorDataService';
import { Table, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import ModalConfirmacao from '../modais/ModalConfirmacao';

const ListVendedores = () => {
    const navigate = useNavigate();
    const [vendedores, setVendedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');

    // Lógica do Modal de Confirmação
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({});

    const fetchData = useCallback(() => {
        setLoading(true);
        VendedorDataService.getAll()
            .then(response => {
                setVendedores(response.data);
            })
            .catch(() => setErro('Falha ao carregar a lista de vendedores.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = (vendedor) => {
        const novoStatus = !vendedor.funcionario.ativo;
        setModalConfig({
            vendedorId: vendedor.id,
            novoStatus: novoStatus,
            titulo: novoStatus ? 'Confirmar Reativação' : 'Confirmar Inativação',
            corpo: `Você tem certeza que deseja ${novoStatus ? 'reativar' : 'inativar'} o vendedor "${vendedor.funcionario.nome}"?`,
            botao: `Confirmar ${novoStatus ? "reativação" : "inativação"}`,
            onConfirm: () => performStatusChange(vendedor.id, novoStatus),
        });
        setShowModal(true);
    };

    const performStatusChange = async (vendedorId, novoStatus) => {
        try {
            await VendedorDataService.updateStatus(vendedorId, { ativo: novoStatus });
            fetchData(); // Recarrega a lista para mostrar o status atualizado
        } catch (error) {
            setErro('Falha ao alterar o status do vendedor.');
        } finally {
            setShowModal(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="fw-bold">Gerenciar Vendedores</h1>
                        <p className="text-muted">Cadastre, visualize e gerencie os acessos dos vendedores.</p>
                    </div>
                    <Button variant="primary" size="lg" onClick={() => navigate('/vendedor/novo')}>
                        <i className="bi bi-plus-circle-fill me-2"></i>
                        Novo Vendedor
                    </Button>
                </div>

                {erro && <Alert variant="danger">{erro}</Alert>}

                <Card className="form-card">
                    <Card.Header>Lista de Vendedores</Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="text-center"><Spinner animation="border" /></div>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Usuário</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendedores.map(v => (
                                        <tr key={v.id}>
                                            <td className="align-middle">{v.funcionario.nome}</td>
                                            <td className="align-middle">{v.funcionario.usuario}</td>
                                            <td className="text-center align-middle">
                                                <Badge bg={v.funcionario.ativo ? 'success' : 'danger'}>
                                                    {v.funcionario.ativo ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </td>
                                            <td className="text-center">
                                                {/* <Button variant="outline-secondary" size="sm" className="me-2" title="Editar">
                                                    <i className="bi bi-pencil-fill"></i>
                                                </Button> */}
                                                <Button variant={v.funcionario.ativo ? 'outline-danger' : 'outline-success'} size="sm" onClick={() => handleStatusChange(v)} title={v.funcionario.ativo ? 'Inativar' : 'Reativar'}>
                                                    <i className={v.funcionario.ativo ? 'bi bi-lock-fill' : 'bi bi-unlock-fill'}></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </div>

            <ModalConfirmacao
                show={showModal}
                onHide={() => setShowModal(false)}
                onConfirm={modalConfig.onConfirm}
                titulo={modalConfig.titulo}
                corpo={modalConfig.corpo}
                botao={modalConfig.botao}
                status={modalConfig.novoStatus}
            />
        </>
    );
};

export default ListVendedores;