import { Modal, Button } from 'react-bootstrap';

const ModalConfirmacao = ({ show, onHide, onConfirm, titulo, corpo, loading }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{titulo || "Confirmar Ação"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {corpo || "Você tem certeza que deseja prosseguir com esta ação?"}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="outline-danger" onClick={onConfirm} disabled={loading}>
                    {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalConfirmacao;