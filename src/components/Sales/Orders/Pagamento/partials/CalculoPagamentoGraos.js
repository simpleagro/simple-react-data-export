import React, { Component } from "react";
import { getNumber, currency } from "common/utils";
import {
  Divider,
  Button,
  Icon,
  Popover,
  Row,
  Col,
  Card,
  Form,
  Input,
  DatePicker
} from "antd";
import moment from "moment";
import "moment/locale/pt-br";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { dadosPedido } from "actions/pedidoActions";

class CalculoPagamentoGraos extends Component {
  state = {
    formData: {}
  };

  atualizarPedido() {
    this.props.dadosPedido({
      ...this.props.pedido,
      pagamento: {
        ...this.props.pedido.pagamento,
        ...this.state.formData
      }
    });
  }

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));

    this.atualizarPedido();
  };

  calcularKGSC(peso) {
    return getNumber((getNumber(peso || "0,00") / 60).toFixed(0));
  }

  componentDidMount() {
    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        peso_graos: currency()(
          this.props.pedido.itens
            .map(t => t[`total_preco_item_graos`])
            .reduce((a, b) => Number(a) + Number(b), 0) || 0
        )
      }
    }));
    this.atualizarPedido();
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <React.Fragment>
        <Card title="Grãos" bordered={false}>
          <Form onChange={this.handleFormState}>
            <Row gutter={8} type="flex" justify="space-between" align="middle">
              <Col span={8}>
                <Form.Item label="Data Pagamento">
                  {getFieldDecorator("data_pgto_graos", {
                    initialValue:
                      this.state.formData.data_pgto_graos ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.data_pgto_graos)
                        ? moment(this.props.pedido.pagamento.data_pgto_graos)
                        : undefined
                  })(
                    <DatePicker
                      style={{ width: "100%" }}
                      onChange={(data, dataString) =>
                        this.handleFormState({
                          target: {
                            name: "data_pgto_graos",
                            value: dataString
                              ? moment(dataString, "DD/MM/YYYY").format(
                                  "YYYY-MM-DD"
                                )
                              : undefined
                          }
                        })
                      }
                      allowClear
                      format={"DD/MM/YYYY"}
                      name="data_pgto_graos"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Valor em kg:"
                  help={`em sacas: ${this.calcularKGSC(
                    this.state.formData.peso_graos
                  )}`}>
                  <Input
                    name="peso_graos"
                    value={
                      this.state.formData.peso_graos ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.peso_graos)
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Local Entrega">
                  <Input
                    name="entrega_graos"
                    value={
                      this.state.formData.entrega_graos ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.entrega_graos)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </React.Fragment>
    );
  }
}

const WrappepCalculoPagamentoGraos = Form.create()(CalculoPagamentoGraos);

const mapStateToProps = ({ pedidoState }) => {
  return {
    pedido: pedidoState.pedidoData || null
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      dadosPedido
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WrappepCalculoPagamentoGraos);
