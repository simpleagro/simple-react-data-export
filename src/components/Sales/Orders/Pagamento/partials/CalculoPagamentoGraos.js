import React, { Component } from "react";
import { getNumber, currency } from "common/utils";
import { Select, Row, Col, Card, Form, Input, DatePicker } from "antd";
import moment from "moment";
import "moment/locale/pt-br";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { simpleDate, date2Db } from "common/utils";

import { dadosPedido } from "actions/pedidoActions";
import * as IBGEService from "services/ibge";
import { getByUfCity as ZonesByUfCity } from "services/zone";

class CalculoPagamentoGraos extends Component {
  state = {
    formData: {},
    estados: [],
    cidades: [],
    locais: [],
    fetchingCidade: false
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

  async componentDidMount() {
    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        estado_entrega: this.props.pedido.estado,
        cidade_entrega: this.props.pedido.cidade,
        peso_graos: currency()(
          this.props.pedido.itens
            .map(t => t[`total_preco_item_graos`])
            .reduce((a, b) => getNumber(a) + getNumber(b), 0) || 0
        )
      }
    }));
    this.atualizarPedido();
    const estados = await IBGEService.listaEstados();
    this.setState(prev => ({ ...prev, estados, fetchingCidade: false }));
    await this.listaCidadesPorEstado(this.props.pedido.estado);
    await this.onChangeSelectCidade(this.props.pedido.cidade);
  }

  async listaCidadesPorEstado(estado) {
    await this.setState({ fetchingCidade: true, cidades: [], cidade: "" });
    await this.handleFormState({
      target: { name: "estado_entrega", value: estado }
    });
    const cidades = await IBGEService.listaCidadesPorEstado(estado);
    this.setState(prev => ({ ...prev, cidades, fetchingCidade: false }));
  }

  async onChangeSelectCidade(cidade) {
    // console.log(cidade);

    await this.handleFormState({
      target: { name: "cidade_entrega", value: cidade }
    });

    const locais = await ZonesByUfCity(this.state.formData.estado_entrega)(
      this.state.formData.cidade_entrega
    );

    await this.setState(prev => ({
      ...prev,
      fetchingCidade: false,
      locais
    }));
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <React.Fragment>
        <Card title="Grãos" bordered={false}>
          <Form onChange={this.handleFormState}>
            <Row gutter={8} type="flex" justify="space-between" align="middle">
              <Col span={12}>
                <Form.Item label="Data Pagamento">
                  {getFieldDecorator("data_pgto_graos", {
                    initialValue:
                      this.state.formData.data_pgto_graos ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.data_pgto_graos)
                        ? simpleDate(this.props.pedido.pagamento.data_pgto_graos)
                        : undefined
                  })(
                    <DatePicker
                      style={{ width: "100%" }}
                      onChange={(data, dataString) =>
                        this.handleFormState({
                          target: {
                            name: "data_pgto_graos",
                            value: date2Db(data)
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
              <Col span={12}>
                <Form.Item
                  label="Valor em kg:"
                  help={`em sacas: ${this.calcularKGSC(
                    this.state.formData.peso_graos
                  )}`}>
                  <Input
                    name="peso_graos"
                    readOnly
                    value={
                      this.state.formData.peso_graos ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.peso_graos)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8} type="flex" justify="space-between" align="middle">
              <Col span={12}>
                <Form.Item label="Estado">
                  <Select
                    name="estado_entrega"
                    showSearch
                    value={
                      this.state.formData.estado_entrega ||
                      (this.props.pedido &&
                        this.props.pedido.estado) ||
                        (this.props.pedido &&
                          this.props.pedido.pagamento &&
                          this.props.pedido.pagamento.estado_entrega)
                    }
                    onSelect={e => this.listaCidadesPorEstado(e)}>
                    {this.state.estados.map(uf => (
                      <Select.Option key={uf} value={uf}>
                        {uf}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Cidade">
                  <Select
                    disabled={this.state.formData.estado_entrega === undefined}
                    name="cidade_entrega"
                    showSearch
                    onSelect={e => {
                      this.onChangeSelectCidade(e);
                    }}
                    value={
                      this.state.formData.cidade_entrega ||
                      (this.props.pedido &&
                        this.props.pedido.cidade) ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.cidade_entrega)
                    }>
                    {this.state.cidades.map((c, index) => (
                      <Select.Option key={index} value={c.nome}>
                        {c.nome}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={8} type="flex" justify="space-between" align="middle">
              <Col span={24}>
                <Form.Item label="Local de Entrega">
                  <Select
                    name="entrega_graos"
                    value={
                      this.state.formData.entrega_graos ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.entrega_graos)
                    }
                    onChange={(e) => {
                      this.handleFormState({
                        target: { name: "entrega_graos", value: e }
                      });
                    }}
                    >
                    {this.state.locais.map(c => (
                      <Select.Option key={`${c.nome}_${new Date().getTime()}`} value={c.nome}>
                        {c.nome}
                      </Select.Option>
                    ))}
                  </Select>
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
