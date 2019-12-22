import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';

const StyledLink = styled(Link)`
    color: #1971c2;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;
const StyledAnchor = styled.a`
    color: #1971c2;
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
`;

export default function Anchor({ children, href, gatsby, className }) {
    return gatsby ? (
        <StyledLink to={href} className={className}>
            {children}
        </StyledLink>
    ) : (
        <StyledAnchor
            className={className}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            {children}
        </StyledAnchor>
    );
}
