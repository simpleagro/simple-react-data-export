import React, { Component } from "react";
import { Spin, Icon, Row, Col, Card, Form, Select, Input } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import debounce from "lodash/debounce";

import { fatorConversaoUM, currency, getNumber } from "common/utils";
import { list as ListShipTableOrderItemsService } from "services/shiptable";
import * as IBGEService from "services/ibge";
import { flashWithError } from "common/FlashMessages";
import { list as ListUnitMeasureService } from "services/units-measures";
import { dadosPedido } from "actions/pedidoActions";

class CalculoFrete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calculandoFrete: false,
      formData: {},
      tabelasFrete: [],
      unidadesMedidas: [],
      estados: []
    };
    this.calcularFrete = debounce(this.calcularFrete, 300);
  }

  async componentDidMount() {
    const unidadesMedidas = await ListUnitMeasureService({
      limit: -1,
      fields: "fator_conversao, nome, sigla, unidade_basica_id"
    }).then(response => response.docs);

    const estados = await IBGEService.listaEstados();

    const tabelasFrete = await ListShipTableOrderItemsService().then(
      response => response.docs
    );

    this.setState(prev => ({
      ...prev,
      estados,
      tabelasFrete,
      unidadesMedidas
    }));

    this.calcularPesoFrete();
  }

  calcularFrete = () => {
    this.setState({ calculandoFrete: true });
    const { peso, distancia, estado } = this.state.formData;
    let tab = this.state.tabelasFrete.find(i => i.estado.includes(estado));
    if (!tab) {
      this.setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData
        },
        calculandoFrete: false
      }));
      flashWithError(
        "Não foi possível encontrar uma tabela de frete para o estado selecionado: " +
          this.props.pedido.estado
      );
      return;
    }
    let preco_frete = 0;
    tab.range_km.forEach(range => {
      if (
        parseInt(range.km_de) <= parseInt(distancia) &&
        parseInt(range.km_ate) >= parseInt(distancia)
      ) {
        range.range_volume.forEach(volume => {
          if (
            parseInt(volume.pesokg_de) <= peso &&
            parseInt(volume.pesokg_ate) >= peso
          ) {
            preco_frete = volume.preco;
          }
        });
      }
    });
    preco_frete = window.simpleagroapp.currency()(
      parseFloat(preco_frete).toFixed(2)
    );

    this.props.dadosPedido({
      ...this.props.pedido,
      pagamento: {
        ...this.props.pedido.pagamento,
        ...this.state.formData,
        total_pedido_frete: preco_frete
      }
    });

    setTimeout(() => {
      this.setState({
        calculandoFrete: false
      });
    }, 300);
  };

  calcularPesoFrete = () => {
    let peso = 0;
    let fator = 1;
    this.props.pedido &&
      this.props.pedido.itens.forEach(item => {
        fator = fatorConversaoUM(
          this.state.unidadesMedidas,
          item.embalagem,
          "kg"
        );
        peso += fator * item.quantidade;
      });

    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        estado:
          this.props.pedido.pagamento && this.props.pedido.pagamento.estado
            ? this.props.pedido.pagamento.estado
            : this.props.pedido.estado,
        peso
      }
    }));
  };

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
    this.calcularFrete();
  };

  render() {
    return (
      <React.Fragment>
        <Card
          title={
            <div>
              Frete{" "}
              <Spin
                spinning={this.state.calculandoFrete}
                indicator={
                  <Icon type="loading" style={{ fontSize: 24 }} spin />
                }
              />
            </div>
          }
          bordered={false}>
          <Form onChange={this.handleFormState}>
            <Row gutter={8} type="flex" justify="space-between" align="middle">
              <Col span={8}>
                <Form.Item label="Estado">
                  <Select
                    value={
                      this.state.formData.estado ||
                      (this.props.pedido && this.props.pedido.estado)
                    }
                    name="estado"
                    showAction={["focus", "click"]}
                    showSearch
                    placeholder="Selecione um estado..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={e => {
                      this.handleFormState({
                        target: {
                          name: "estado",
                          value: e
                        }
                      });
                    }}>
                    {this.state.estados &&
                      this.state.estados.map(uf => (
                        <Select.Option key={uf} value={uf}>
                          {uf}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Distância">
                  <Input name="distancia" type="number" step={0.01} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Peso">
                  <Input name="peso" value={this.state.formData.peso} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </React.Fragment>
    );
  }
}

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
)(CalculoFrete);
