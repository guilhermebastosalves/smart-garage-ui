import { Modal, Button } from 'react-bootstrap';
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from 'react';

function ModalVenda({ show, onHide, venda, automovelId }) {
    const navigate = useNavigate();

    const handleRedirect = (path) => {
        localStorage.setItem("Venda", JSON.stringify(venda));
        onHide(); // Fecha o modal
        navigate(path, { state: { automovelId: automovelId } });
    };

    useEffect(() => {
        if (show) {
            // Aplica o bloqueio de rolagem apenas quando o modal está aberto
            document.body.style.overflow = 'hidden';
        }

        // A função de "limpeza" do useEffect será executada quando o modal for fechado
        // ou quando o componente for desmontado.
        return () => {
            document.body.style.overflow = 'auto'; // ou 'unset'
        };

    }, [show]); // ESSA É A PARTE MAIS IMPORTANTE!
    // O efeito será re-executado toda vez que o valor de 'show' mudar.

    // Se o modal não deve ser mostrado, não renderiza nada.
    if (!show) {
        return null;
    }

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Registro de Venda</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                O comprador do automóvel já está cadastrado no sistema?
            </Modal.Body>
            <Modal.Footer className="g-0">
                <Button variant="primary" onClick={() => handleRedirect('/vendas')}>
                    Sim, já está!
                </Button>
                <Button variant="secondary" onClick={() => handleRedirect('/cliente')}>
                    Não, preciso cadastrá-lo!
                </Button>
                <Button variant="dark" onClick={onHide}>
                    Voltar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalVenda;