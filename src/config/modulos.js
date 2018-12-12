import React, { Component } from "react";
import { Menu } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { userSwitchedModule } from "../actions/painelActions";

class SeletorModuloOpcoes extends Component {
  render() {
    return (
      <Menu
        onClick={e => {
          const modulo = JSON.parse(e.key);
          this.props.userSwitchedModule(modulo);
        }}>
        {this.props.modulosDaEmpresa.length &&
          this.props.modulosDaEmpresa.map(modulo => (
            <Menu.Item key={JSON.stringify(modulo)}>{modulo.nome}</Menu.Item>
          ))}
      </Menu>
    );
  }
}

const mapStateToProps = ({ painelState }) => ({
  modulosDaEmpresa:
    (painelState.userData && painelState.userData.modulosDaEmpresa) || null
});

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
)(SeletorModuloOpcoes);
