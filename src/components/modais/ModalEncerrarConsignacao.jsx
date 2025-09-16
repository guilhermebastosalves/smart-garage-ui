import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ConsignacaoDataService from '../../services/consignacaoDataService';

const ModalEncerrarConsignacao = ({ show, onHide, consignacao, onSuccess }) => {
    const [dataFim, setDataFim] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {

        if (show) {
            setError('');
            setDataFim(new Date());
        }
    }, [show]);

    const handleEncerrar = async () => {
        if (!consignacao || !consignacao.id) return;

        setLoading(true);
        setError('');

        try {

            await ConsignacaoDataService.encerrar(consignacao.id, {
                data_termino: dataFim
            });

            onSuccess(consignacao.id);
            onHide();
        } catch (err) {
            const msg = err.response?.data?.mensagemErro || "Erro ao encerrar consignação.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Encerrar Consignação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                <p>Por favor, selecione a data de término para esta consignação. Esta ação definirá a consignação como <strong>inativa</strong>.</p>

                <Form.Group>
                    <Form.Label className="fw-bold">Data de Término</Form.Label>
                    <DatePicker
                        className="form-control"
                        selected={dataFim}
                        onChange={(date) => setDataFim(date)}
                        dateFormat="dd/MM/yyyy"
                        required
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleEncerrar} disabled={loading}>
                    {loading ? 'Encerrando...' : 'Confirmar Encerramento'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalEncerrarConsignacao;