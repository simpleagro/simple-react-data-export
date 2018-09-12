import React from "react";
import { Row, Col, Button, Divider } from "antd";

export const PainelHeader = props => (
  <Row type="flex" justify="space-between">
    <Col>
      <h2 style={{ fontWeight: 400 }}>{props.title}</h2>
    </Col>
    <Col>{props.extra}</Col>
    <Col>{props.children}</Col>
    <Divider style={{ margin: 0, marginBottom: 20 }} />
  </Row>
);
