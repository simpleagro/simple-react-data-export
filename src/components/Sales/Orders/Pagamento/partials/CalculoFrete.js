import React, { Component } from "react";
import { Spin, Icon, Row, Col, Card, Form, Select, Input } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import debounce from "lodash/debounce";

import { fatorConversaoUM, currency, getNumber } from "common/utils";
import { list as ListShipTableOrderItemsService } from "services/shiptable";
import * as OrderPaymentService from "services/orders.payment";
import * as IBGEService from "services/ibge";
import { flashWithError } from "common/FlashMessages";
import { list as ListUnitMeasureService } from "services/units-measures";
import {
  dadosPedidoFrete,
  dadosPedidoParcelaAutomatica
} from "actions/pedidoActions";
import { configAPP } from "config/app";
import parseErrors from "lib/parseErrors";

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

    this.props.dadosPedidoFrete({
      ...this.state.formData,
      total_pedido_frete: preco_frete
    });

    if (configAPP.usarConfiguracaoFPCaracteristica()) {
      this.gerarParcelasAutomaticasVencimento();
    }

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
          item.embalagem ? item.embalagem.value : "",
          "kg"
        );
        if (fator !== "erro") peso += fator * item.quantidade;
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

  async gerarParcelasAutomaticasVencimento() {
    const order = this.props.pedido;
    let chaves = Object.keys(order).filter(chave => chave.includes("pgto_"));
    let parcelas = [];
    chaves.forEach(chave => {
      if (order[chave] == "REAIS") {
        let valor =
          order &&
          order.itens
            .map(t => t[`preco_total_${chave.replace("pgto_", "")}`])
            .reduce((a, b) => Number(a) + Number(b), 0);
        if (chave === "pgto_frete")
          valor = order.pagamento.total_pedido_frete || 0;
        if (
          parcelas.find(
            parcela =>
              parcela.data_vencimento ==
              order[`venc_${chave.replace("pgto_", "")}`]
          )
        ) {
          parcelas.forEach(parcela => {
            if (
              parcela.data_vencimento ==
              order[`venc_${chave.replace("pgto_", "")}`]
            ) {
              let nova_parcela = 0;
              nova_parcela =
                getNumber(parcela.valor_parcela || "0,00") +
                getNumber(valor || "0,00");
              parcela.valor_parcela = currency()(nova_parcela);
            }
          });
        } else {
          parcelas.push({
            data_vencimento: order[`venc_${chave.replace("pgto_", "")}`],
            valor_parcela: currency()(valor)
          });
        }
      }
    });

    try {
      await OrderPaymentService.update(this.props.pedido._id)({ parcelas });
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log(
        "Erro interno ao adicionar parcelas automáticas no pagamento",
        err
      );
    }

    this.setState({
      gerarParcelas: false
    });

    this.props.dadosPedidoParcelaAutomatica(
      parcelas.sort(
        (a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento)
      )
    );
  }

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
                  <Input
                    name="distancia"
                    type="number"
                    value={
                      this.state.formData.distancia ||
                      (this.props.pedido &&
                        this.props.pedido.pagamento &&
                        this.props.pedido.pagamento.distancia) || undefined
                    }
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Peso">
                  <Input
                    name="peso"
                    value={
                      this.state.formData.peso ||
                      (this.props.pedido && this.props.pedido.peso)
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

const mapStateToProps = ({ pedidoState }) => {
  return {
    pedido: pedidoState.pedidoData || null
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      dadosPedidoFrete,
      dadosPedidoParcelaAutomatica
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CalculoFrete);
