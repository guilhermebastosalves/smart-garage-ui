import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import VendedorDataService from '../../services/vendedorDataService';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const RegistroVendedor = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ nome: '', usuario: '', senha: '' });
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');
        setSucesso('');

        try {
            await VendedorDataService.create(formData);
            setSucesso('Vendedor cadastrado com sucesso!');
            setTimeout(() => navigate('/listagem/vendedores'), 1500);
        } catch (error) {
            setErro(error.response?.data?.mensagem || 'Erro ao cadastrar vendedor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <Card className="form-card mx-auto" style={{ maxWidth: '600px' }}>
                    <Card.Header>
                        <h3 className="mb-0">Cadastrar Novo Vendedor</h3>
                    </Card.Header>
                    <Card.Body>
                        {sucesso && <Alert variant="success">{sucesso}</Alert>}
                        {erro && <Alert variant="danger">{erro}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="nome">Nome Completo</Form.Label>
                                <Form.Control id="nome" name="nome" type="text" onChange={handleInputChange} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="usuario">Nome de Usuário (para login)</Form.Label>
                                <Form.Control id="usuario" name="usuario" type="text" onChange={handleInputChange} required />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label htmlFor="senha">Senha</Form.Label>
                                <Form.Control id="senha" name="senha" type="password" onChange={handleInputChange} required />
                            </Form.Group>
                            <div className="d-grid">
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Cadastrar Vendedor'}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </>
    );
};

export default RegistroVendedor;