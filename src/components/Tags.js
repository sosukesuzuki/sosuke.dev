import React from "react";
import styled from "styled-components";
import { Link } from "gatsby";

const TagsContainer = styled.div`
  display: flex;
  margin: 25px 0;
`;
const Tag = styled.div`
  background: gray;
  color: white;
  padding: 5px;
  border-radius: 5px;
  margin-right: 5px;
`;

const Tags = ({ tags }) => {
  return (
    <TagsContainer>
      {tags.map((tag) => (
        <Link to={`/tags/${tag}`} key={tag}>
          <Tag>{tag}</Tag>
        </Link>
      ))}
    </TagsContainer>
  );
};

export default Tags;
