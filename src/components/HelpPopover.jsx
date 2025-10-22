import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import React, { forwardRef } from 'react';

/**
 * Um componente de ajuda reutilizável que exibe um Popover ao ser clicado.
 * @param {object} props
 * @param {string} props.title - O título que aparecerá no cabeçalho do popover.
 * @param {React.ReactNode} props.content - O conteúdo (pode ser texto, JSX, etc.) a ser exibido no corpo do popover.
 * @param {string} props.id - Um ID único para o elemento de gatilho.
 */
const HelpPopover = ({ title, content, id }) => {

    const popover = (
        <Popover id={`popover-help-${title.replace(/\s+/g, '')}`}>
            <Popover.Header as="h3">{title}</Popover.Header>
            <Popover.Body>{content}</Popover.Body>
        </Popover>
    );

    return (
        // OverlayTrigger é o componente do React Bootstrap que controla a exibição.
        // trigger="click" - abre ao clicar.
        // rootClose - fecha ao clicar em qualquer lugar fora do popover.
        // placement="auto" - posiciona o popover de forma inteligente.
        <OverlayTrigger trigger="click" rootClose placement="auto" overlay={popover}>
            <span
                id={id}
                className="ms-2 text-primary"
                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                aria-label="Ajuda"
            >
                <FaQuestionCircle />
            </span>
        </OverlayTrigger>
    );
};

export default HelpPopover;