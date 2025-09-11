import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/authDataService';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const ResetarSenha = () => {
    const { token } = useParams(); // Pega o token da URL
    const navigate = useNavigate();

    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (senha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }
        setLoading(true);
        setErro('');
        setMensagem('');
        try {
            const response = await AuthService.resetarSenha(token, { senha });
            setMensagem(response.data.mensagem);
            setTimeout(() => navigate('/'), 2000); // Redireciona para o login
        } catch (error) {
            setErro(error.response?.data?.mensagem || 'Erro ao redefinir a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <Card className="shadow-lg border-0 login-card-animated" style={{ maxWidth: '450px' }}>
                <Card.Body className="p-5">
                    <h3 className="text-center mb-4">Crie uma Nova Senha</h3>
                    {mensagem && <Alert variant="success">{mensagem}</Alert>}
                    {erro && (
                        <div className='d-flex align-items-center mb-3 container'>
                            <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                            <div className="text text-danger">{erro}</div>
                        </div>

                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nova Senha</Form.Label>
                            <Form.Control type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Nova Senha</Form.Label>
                            <Form.Control type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                        </Form.Group>
                        <div className="d-grid">
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Redefinir Senha'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ResetarSenha;