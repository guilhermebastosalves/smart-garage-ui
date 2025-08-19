import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import FisicaDataService from '../../services/fisicaDataService';

function ModalCadastro({ show, onHide, consignacao }) {
    const navigate = useNavigate();
    const [identificacao, setId] = useState('');
    const [cadastro, setCadastro] = useState(false);

    const handleRedirect = (path, state) => {
        localStorage.setItem("Consignacao", JSON.stringify(consignacao));
        onHide(); // Fecha o modal
        navigate(path, { state });
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



    const buscaCliente = async (identificacao) => {

        try {
            const fisicaResp = await FisicaDataService.getByCpf(identificacao);

            const fisicaId = fisicaResp?.data?.[0]?.id;
            const clienteId = fisicaResp?.data?.[0]?.clienteId;

            if (fisicaId && clienteId) {
                handleRedirect('/consignacao', { fisicaId: fisicaId, clienteId: clienteId })
            } else {
                // alert('Proprietário não encontrado. Verifique o CPF/CNPJ ou cadastre um novo cliente.');
                setCadastro(true);
            }
        } catch (e) {
            console.log("Erro na busca de pessoas físicas:", e);
        }
    }

    // Função para lidar com o envio do formulário
    const handleSubmit = (event) => {
        event.preventDefault(); // Previne que a página recarregue
        if (identificacao.trim()) { // Verifica se o ID não está vazio
            buscaCliente(identificacao);
        } else {
            alert('Por favor, informe um CPF ou CNPJ.');
        }
    };


    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Registro de Consignação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className={cadastro ? "d-none" : ""} onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label htmlFor="cpfCnpj">Informe o CPF ou CNPJ do proprietário.</Form.Label>
                        <Form.Control
                            id="cpfCnpj"
                            type="text"
                            value={identificacao} // Controla o valor do input
                            onChange={(e) => setId(e.target.value)}
                            placeholder="Digite o CPF ou CNPJ"
                            autoFocus // Foca no campo ao abrir o modal
                        />
                    </Form.Group>
                    {/* O botão dentro de um form com type="submit" aciona o onSubmit do form */}
                    <Button variant="primary" type="submit" className="mt-3">
                        Buscar
                    </Button>
                    <Button variant="outline-dark" type="submit" className="mt-3" onClick={() => handleRedirect('/cliente')}>
                        O cliente não possui cadastro
                    </Button>
                </Form>
                {
                    cadastro &&
                    <>
                        <p>Proprietário não encontrado. Verifique o CPF/CNPJ ou cadastre um novo cliente.</p>
                        <Button variant='primary' onClick={() => { setCadastro(false) }}>Tentar novamente</Button>
                        <Button variant='outline-secondary' onClick={() => handleRedirect('/cliente')}>Cadastrar proprietário</Button>
                    </>
                }
            </Modal.Body>
            <Modal.Footer className="g-0">
                <Button variant="dark" onClick={onHide}>
                    Voltar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}


export default ModalCadastro;