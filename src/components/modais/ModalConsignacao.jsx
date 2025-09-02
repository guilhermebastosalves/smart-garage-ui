import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import FisicaDataService from '../../services/fisicaDataService';
import JuridicaDataService from '../../services/juridicaDataService';

function ModalCadastro({ show, onHide, consignacao }) {
    const navigate = useNavigate();
    const [identificacao, setId] = useState('');
    const [cadastro, setCadastro] = useState(false);

    const handleRedirect = (path, state) => {
        sessionStorage.setItem("NegocioAtual", JSON.stringify(consignacao));
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

            const [fisicaResp, juridicaResp] = await Promise.all([
                FisicaDataService.getByCpf(identificacao)
                    .catch(error => {
                        console.warn(`CPF não encontrado ou erro na busca: ${error.message}`);
                        return null; // Retorna null em caso de erro
                    }),
                JuridicaDataService.getByCnpj(identificacao)
                    .catch(error => {
                        console.warn(`CNPJ não encontrado ou erro na busca: ${error.message}`);
                        return null; // Retorna null em caso de erro
                    })
            ]);


            const fisicaEncontrada = fisicaResp?.data?.[0];
            const juridicaEncontrada = juridicaResp?.data?.[0];


            if (fisicaEncontrada?.id && fisicaEncontrada?.clienteId) {

                handleRedirect('/consignacao', {
                    fisicaId: fisicaEncontrada.id,
                    clienteId: fisicaEncontrada.clienteId
                });

            } else if (juridicaEncontrada?.id && juridicaEncontrada?.clienteId) {

                handleRedirect('/consignacao', {
                    juridicaId: juridicaEncontrada.id,
                    clienteId: juridicaEncontrada.clienteId
                });

            } else {
                // Se nenhum foi encontrado, ativa o modo de cadastro.
                setCadastro(true);
                // Opcional: alertar o usuário.
                // alert('Proprietário não encontrado. Verifique o CPF/CNPJ ou cadastre um novo cliente.');
            }
        } catch (e) {
            console.log("Erro na busca do cliente:", e);
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