import React from 'react';
import styled from 'styled-components';

const AnchorContainer = styled.a`
    color: #1971c2;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

function Anchor({ children, href }) {
    return (
        <AnchorContainer href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </AnchorContainer>
    );
}

export default Anchor;
