import React, { Component } from "react";
import {
  Divider,
  Button,
  Icon,
  Popconfirm,
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

import * as OrderService from "services/orders";
import * as OrderItemsService from "services/orders.items";
import * as OrderPaymentService from "services/orders.payment";
import { dadosPedido } from "actions/pedidoActions";


import { currency, getNumber } from "common/utils";
import { flashWithSuccess, flashWithError } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";


import { configAPP } from "config/app";
import { SimpleLazyLoader } from "common/SimpleLazyLoader";
import CalculoFrete from "./partials/CalculoFrete";
import CalculoPagamentoGraos from "./partials/CalculoPagamentoGraos";
import ParcelasManual from "./partials/ParcelasManual";

class OrderPaymentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      calculandoFrete: false,
      formData: {
        pagamento: {
          parcelas: []
        }
      },
      list: [],
      loadingData: true,
      order_id: this.props.match.params.order_id,
      orderData: null,
      tabelasFrete: [],
      estados: [],
      unidadesMedidas: [],
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      },
      loadingForm: false
    };

    // this.calcularFrete = debounce(this.calcularFrete, 300);
  }

  async componentDidMount() {
    const orderData = await OrderService.get(this.state.order_id, {
      fields:
        "tabela_preco_base, numero, cliente, propriedade, pagamento, cidade, estado, pgto_germoplasma, pgto_royalties, pgto_tratamento, pgto_frete, venc_germoplasma, venc_royalties, venc_tratamento, venc_frete, itens"
    });

    // await this.initializeList({
    //   fields:
    //     "produto, quantidade, desconto, total_preco_item, status, embalagem, preco_total_royalties, preco_total_germoplasma, preco_total_tratamento, total_preco_item_graos, total_preco_item_reais"
    // });

    const parcelas = orderData.pagamento && orderData.pagamento.parcelas;

    // const pesoFrete = this.calcularPesoFrete({
    //   itens: parcelas,
    //   pagamento: orderData.pagamento,
    //   estado: orderData.estado
    // });
    this.props.dadosPedido(orderData);
    this.setState(prev => ({
      ...prev,
      orderData,
      total_pedido: parcelas
        .map(t => t.total_preco_item)
        .reduce((a, b) => Number(a) + Number(b), 0),
      formData: {
        ...prev.formData,
        total_pedido_royalties: parcelas
          .map(t => t[`preco_total_royalties`])
          .reduce((a, b) => Number(a) + Number(b), 0),
        total_pedido_germoplasma: parcelas
          .map(t => t[`preco_total_germoplasma`])
          .reduce((a, b) => Number(a) + Number(b), 0),
        total_pedido_tratamento: parcelas
          .map(t => t[`preco_total_tratamento`])
          .reduce((a, b) => Number(a) + Number(b), 0),
        peso_graos: parcelas
          .map(t => t[`total_preco_item_graos`])
          .reduce((a, b) => Number(a) + Number(b), 0)
      },
      loadingForm: false
    }));

    // if (
    //   configAPP.usarConfiguracaoFPCaracteristica() &&
    //   (this.state.orderData.pagamento &&
    //     this.state.orderData.pagamento.parcelas &&
    //     this.state.orderData.pagamento.parcelas.length === 0)
    // ) {
    //   items = this.gerarParcelasAutomaticasVencimento(this.state.orderData);
    //   await OrderPaymentService.update(this.state.order_id)({
    //     parcelas: items
    //   });
    // }
  }

  changeStatus = async (id, newStatus) => {
    try {
      await OrderItemsService.changeStatus(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
          recordName = item.nome;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `O item, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do item", err);
    }
  };

  removeRecord = async index => {
    // try {
    //   let { parcelas } = this.state.orderData.pagamento;
    //   if(!parcelas) return;
    //   await OrderPaymentService.update(this.state.order_id)(parcelas);
    //   this.setState({
    //     orderData: this.state.form
    //   });
    //   flashWithSuccess(
    //     "",
    //     `O item, ${produto.nome}, foi removido com sucesso!`
    //   );
    // } catch (err) {
    //   if (err && err.response && err.response.data) parseErrors(err);
    //   console.log("Erro interno ao remover um item do pedido", err);
    // }
  };

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
    this.calcularFrete();
  };






  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
      }
    });
  };

  gerarParcelasAutomaticasVencimento = order => {
    debugger;
    let chaves = Object.keys(order).filter(chave => chave.includes("pgto_"));
    let parcelas = [];
    chaves.forEach(chave => {
      if (order[chave] == "REAIS") {
        console.log(this.state);
        let valor = this.state[`total_pedido_${chave.replace("pgto_", "")}`];
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

      this.setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          pagamento: {
            parcelas
          }
        }
      }));
    });
    //set state parcelas
    return parcelas;
  };

  existePagamentoEmGraos() {
    return (
      this.props.pedido &&
      Object.keys(this.props.pedido).some(
        c => /pgto_/.test(c) && this.props.pedido[c] != "REAIS"
      )
    );
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <SimpleLazyLoader isLoading={this.state.loadingForm}>
        <div>
          <SimpleBreadCrumb to={`/pedidos`} history={this.props.history} />

          <Row gutter={24}>
            <Col span={5}>
              <Card
                bordered
                style={{
                  boxShadow: "0px 8px 0px 0px #009d55 inset",
                  color: "#009d55"
                }}>
                {this.state.orderData && (
                  <div>
                    <p>{`Cliente: ${this.state.orderData.cliente.nome}`}</p>
                    <p>{`CPF/CNPJ: ${
                      this.state.orderData.cliente.cpf_cnpj
                    }`}</p>
                    <p>{`Propriedade: ${
                      this.state.orderData.propriedade.nome
                    } - ${this.state.orderData.propriedade.ie}`}</p>
                  </div>
                )}
                <Button
                  style={{ width: "100%" }}
                  onClick={() => {
                    this.props.history.push(
                      `/pedidos/${this.state.order_id}/edit`,
                      { returnTo: this.props.history.location }
                    );
                  }}>
                  <Icon type="edit" /> Editar
                </Button>
              </Card>
              <Card
                bordered
                style={{
                  marginTop: "5px",
                  boxShadow: "0px 8px 0px 0px #338c63 inset",
                  color: "#338c63"
                }}>
                {this.state.orderData && (
                  <div>
                    <p>{`Preço Total Frete: ${(this.props.pedido &&
                      this.props.pedido.pagamento &&
                      this.props.pedido.pagamento.total_pedido_frete) ||
                      "0,00"}`}</p>

                    {configAPP.detalharPrecoPorCaracteristica() && (
                      <React.Fragment>
                        <p>{`Preço Total Royalties: ${currency()(
                          this.state.formData.total_pedido_royalties || 0
                        )}`}</p>
                        <p>{`Preço Total Germoplasma: ${currency()(
                          this.state.formData.total_pedido_germoplasma || 0
                        )}`}</p>
                        <p>{`Preço Total Tratamento: ${currency()(
                          this.state.formData.total_pedido_tratamento || 0
                        )}`}</p>
                      </React.Fragment>
                    )}

                    {configAPP.usarConfiguracaoFPCaracteristica() && (
                      <React.Fragment>
                        <p>{`Total Pedido REAIS: ${currency()(
                          this.state.list
                            .map(t => t.total_preco_item_reais)
                            .reduce(
                              (a, b) => Number(a) + Number(b),
                              this.state.formData.total_pedido_frete || 0
                            ) || 0
                        )}`}</p>
                        <p>{`Saldo a parcelar REAIS: ${currency()(0)}`}</p>
                        <p>{`Total Pedido GRÃOS: ${currency()(
                          this.state.list
                            .map(t => t.total_preco_item_graos)
                            .reduce((a, b) => Number(a) + Number(b), 0) || 0
                        )}`}</p>
                        <p>{`Saldo a parcelar GRÃOS: ${currency()(0)}`}</p>
                      </React.Fragment>
                    )}

                    {!configAPP.usarConfiguracaoFPCaracteristica() && (
                      <React.Fragment>
                        <p>{`Total Pedido: ${currency()(
                          Number(this.state.total_pedido) +
                            Number(
                              this.state.formData.total_pedido_frete || 0
                            ) || 0
                        )}`}</p>
                        <p>{`Saldo a parcelar: ${currency()(
                          Number(this.state.total_pedido) -
                            this.valorTotalParcelas() || 0
                        )}`}</p>
                      </React.Fragment>
                    )}
                  </div>
                )}
              </Card>
            </Col>
            <Col span={19}>
              <Card
                title="Finalizar Pedido"
                size="small"
                extra={
                  <Button type="primary" icon="save">
                    Concluir Pedido
                  </Button>
                }>
                <CalculoFrete atualizaTotais={() => null} formData={{}} />
                {configAPP.usarConfiguracaoFPCaracteristica() &&
                  this.existePagamentoEmGraos() && <CalculoPagamentoGraos />}
                {!configAPP.usarConfiguracaoFPCaracteristica() && (
                  <ParcelasManual />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </SimpleLazyLoader>
    );
  }



  valorTotalParcelas() {
    return (
      this.state.formData.pagamento &&
      this.state.formData.pagamento.parcelas &&
      this.state.formData.pagamento.parcelas
        .map(p => Number(p.valor_parcela))
        .reduce((a, b) => a + b, 0)
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

const WrappepOrderPaymentForm = Form.create()(OrderPaymentForm);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WrappepOrderPaymentForm);
