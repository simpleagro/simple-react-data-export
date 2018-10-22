import React from "react";
import { Breadcrumb, Button, Icon } from "antd";
import styled from "styled-components";

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

export const SimpleBreadCrumb = ({
  className,
  to,
  noDefault = false,
  children,
  history
}) => {
  return (
    !children && (
      <BreadcrumbStyled className={className}>
        <Breadcrumb.Item>
          <Button onClick={() => history.push(to)}>
            <Icon type="arrow-left" />
            Voltar para a tela anterior
          </Button>
        </Breadcrumb.Item>
      </BreadcrumbStyled>
    )
  );
};
