import { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import AutomovelDataService from '../../services/automovelDataService';

function ModalVerificarAutomovel({ show, onHide, onAutomovelVerificado }) {
    const [identificador, setIdentificador] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ tipo: '', msg: '' });

    const handleVerificar = async () => {
        setLoading(true);
        setFeedback({ tipo: '', msg: '' });
        try {

            const isPlaca = identificador.length <= 7;
            const data = isPlaca ? { placa: identificador.toUpperCase() } : { renavam: identificador };

            const response = await AutomovelDataService.verificarStatus(data);
            console.log(response.data);
            onAutomovelVerificado(response.data);
            onHide();
        } catch (error) {
            const data = error.response?.data;
            if (data && data.status === 'ativo') {
                setFeedback({ tipo: 'danger', msg: data.mensagem });
            } else {
                setFeedback({ tipo: 'danger', msg: 'Erro ao verificar o automóvel.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIdentificador('');
        setFeedback({ tipo: '', msg: '' });
        onHide();
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Verificar Automóvel</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {feedback.msg && <Alert variant={feedback.tipo}>{feedback.msg}</Alert>}
                <Form.Group>
                    <Form.Label>Informe a Placa ou o Renavam do Automóvel</Form.Label>
                    <Form.Control
                        type="text"
                        value={identificador}
                        onChange={(e) => setIdentificador(e.target.value)}
                        autoFocus
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleVerificar} disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Verificar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalVerificarAutomovel;