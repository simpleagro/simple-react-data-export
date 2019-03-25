import React from "react";
import { Row, Col, Button, Divider } from "antd";
import styled from "styled-components";

const PainelHeaderStyled = styled(Row)`
  background: #fff;
  h2 {
    font-weight: 400;
  }

  .ant-affix & {
    padding-top: 30px;
    box-shadow: 0px 0px 0px #333;
    transition: all 500ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }
`;

export const PainelHeader = props => (
  <PainelHeaderStyled className="painelHeaderStyled">
    <Row type="flex" justify="space-between">
      <Col>
        <h2>{props.title}</h2>
        {props.subTitle}
      </Col>
      <Col>{props.extra}</Col>
      <Col>{props.children}</Col>
      <Divider />
    </Row>
  </PainelHeaderStyled>
);
