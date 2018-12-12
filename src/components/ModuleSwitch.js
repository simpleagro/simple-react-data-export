import React, { Component } from "react";
import Styled from "styled-components";
import { Card, Row, Col, Select } from "antd";
import { userSwitchedModule } from "../actions/painelActions";
import { withCookies } from "react-cookie";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

const Container = Styled.div`
width: 100vw;
height: 100vh;
display: block;
overflow: hidden;
text-align: center;

img.logo { padding: 10px; margin-bottom: 60px; width: 250px; height: auto; }
`;

const Option = Select.Option;

class ModuleSwitch extends Component {
  render() {
    return (
      <Container className="bg-green">
        <Row
          style={{ height: "100%" }}
          type="flex"
          align="middle"
          justify="center">
          <Col>
            <Card
              style={{
                width: 400,
                height: 450,
                boxShadow: "-1px 8px 14px 0px #056839"
              }}>
              <img src="logo.png" className="logo" />
              <p>Selecione um módulo para continuar...</p>
              <Select
                showArrow
                showSearch
                style={{ width: 300 }}
                placeholder="Selecione..."
                onChange={e => {
                  const modulo = JSON.parse(e);
                  this.props.userSwitchedModule({
                    nome: modulo.nome,
                    slug: modulo.slug
                  });
                  this.props.history.push("/");
                }}>
                {this.props.modulosDaEmpresa &&
                  this.props.modulosDaEmpresa.map(modulo => {
                    return (
                      <Option
                        key={modulo._id}
                        value={JSON.stringify({
                          nome: modulo.nome,
                          slug: modulo.slug
                        })}>
                        {modulo.nome}
                      </Option>
                    );
                  })}
              </Select>
              <br />
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  return {
    modulosDaEmpresa:
      (painelState.userData && painelState.userData.modulosDaEmpresa) || null
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userSwitchedModule
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withCookies(ModuleSwitch));
