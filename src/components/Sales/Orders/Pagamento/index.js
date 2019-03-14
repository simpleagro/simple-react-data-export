import React, { Component } from "react";
import { Button, Icon, Row, Col, Card, Form } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import * as OrderService from "services/orders";
import * as OrderItemsService from "services/orders.items";
import * as OrderPaymentService from "services/orders.payment";
import { dadosPedido } from "actions/pedidoActions";
import { currency, normalizeString, getNumber } from "common/utils";
import { flashWithSuccess, flashModalWithError } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { configAPP } from "config/app";
import { SimpleLazyLoader } from "common/SimpleLazyLoader";
import CalculoFrete from "./partials/CalculoFrete";
import CalculoPagamentoGraos from "./partials/CalculoPagamentoGraos";
import ParcelasManual from "./partials/ParcelasManual";
import ParcelasAutomaticas from "./partials/ParcelasAutomaticas";

class OrderPaymentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order_id: this.props.match.params.order_id,
      orderData: null,
      loadingForm: false,
      savingForm: false
    };
  }

  async componentDidMount() {
    const orderData = await OrderService.get(this.state.order_id, {
      fields:
        "tabela_preco_base, numero, cliente, propriedade, pagamento, cidade, estado, pgto_germoplasma, pgto_royalties, pgto_tratamento, pgto_frete, venc_germoplasma, venc_royalties, venc_tratamento, venc_frete, itens, tipo_frete"
    });

    const parcelas = orderData.pagamento && orderData.pagamento.parcelas;

    this.props.dadosPedido(orderData);

    this.setState(prev => ({
      ...prev,
      orderData,
      total_pedido: parcelas
        .map(t => t.total_preco_item)
        .reduce((a, b) => Number(a) + Number(b), 0),
      formData: {
        ...prev.formData,
        total_pedido_royalties: currency()(
          orderData.itens
            .map(t => t[`preco_total_royalties`])
            .reduce((a, b) => Number(a) + Number(b), 0) || 0
        ),
        total_pedido_germoplasma: currency()(
          orderData.itens
            .map(t => t[`preco_total_germoplasma`])
            .reduce((a, b) => Number(a) + Number(b), 0) || 0
        ),
        total_pedido_tratamento: currency()(
          orderData.itens
            .map(t => t[`preco_total_tratamento`])
            .reduce((a, b) => Number(a) + Number(b), 0) || 0
        ),
        total_pedido_reais: currency()(
          orderData.itens
            .map(t => t[`total_preco_item_reais`])
            .reduce((a, b) => Number(a) + Number(b), 0) || 0
        ),
        total_pedido_graos: currency()(
          orderData.itens
            .map(t => t[`total_preco_item_graos`])
            .reduce((a, b) => Number(a) + Number(b), 0) || 0
        )
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

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
    this.calcularFrete();
  };

  saveForm = async e => {
    try {
      this.setState({ savingForm: true });

      if (
        this.props.pedido.tipo_frete === "CIF" &&
        !this.props.pedido.pagamento.total_pedido_frete
      )
        throw new Error(
          "Ainda não foi calculado o frete, por favor verifique."
        );

      if (this.existePagamentoEmGraos()) {
        if (!this.props.pedido.pagamento.data_pgto_graos)
          throw new Error(
            "Ainda não foi confirmado o campo DATA PAGAMENTO para grãos, por favor verifique."
          );
        if (
          !this.props.pedido.pagamento.peso_graos ||
          getNumber(this.props.pedido.pagamento.peso_graos) === 0
        )
          throw new Error(
            "Ainda não foi calculado o valor em kg para grãos, por favor verifique."
          );
        if (!this.props.pedido.pagamento.entrega_graos)
          throw new Error(
            "Ainda não foi definido o local de entrega para grãos, por favor verifique."
          );
      }

      try {
        await OrderPaymentService.update(this.props.pedido._id)({
          ...this.state.formData,
          ...this.props.pedido.pagamento
        });
        flashWithSuccess(
          `Pedido #${this.props.pedido.numero} finalizado com sucesso!`
        );
        this.props.history.push(`/pedidos`);
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao finalizar pedido ", err);
        this.setState({ savingForm: false });
      }
    } catch (err) {
      flashModalWithError(err.message);
      this.setState({ savingForm: false });
    }
  };

  existePagamentoEmGraos() {
    return (
      this.props.pedido &&
      Object.keys(this.props.pedido).some(
        c => /pgto_/.test(c) && this.props.pedido[c] && this.props.pedido[c] != "REAIS"
      )
    );
  }

  render() {
    return (
      <SimpleLazyLoader isLoading={this.state.loadingForm}>
        <div>
          <SimpleBreadCrumb
            to={
              this.props.location.state && this.props.location.state.returnTo
                ? this.props.location.state.returnTo.pathname
                : "/pedidos"
            }
            history={this.props.history}
          />

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
                    {this.props.pedido.tipo_frete === "CIF" && (
                      <p>
                        Preço Total Frete:
                        <br />
                        {currency()(
                          (this.props.pedido &&
                            this.props.pedido.pagamento &&
                            this.props.pedido.pagamento.total_pedido_frete) ||
                            0
                        )}
                      </p>
                    )}

                    {configAPP.detalharPrecoPorCaracteristica() && (
                      <React.Fragment>
                        <p>
                          Total Preço Royalties:
                          <br />
                          {currency()(
                            this.state.formData.total_pedido_royalties || 0
                          )}
                        </p>
                        <p>
                          Total Preço Germoplasma:
                          <br />
                          {currency()(
                            this.state.formData.total_pedido_germoplasma || 0
                          )}
                        </p>
                        <p>
                          Total Preço Tratamento:
                          <br />
                          {currency()(
                            this.state.formData.total_pedido_tratamento || 0
                          )}
                        </p>
                      </React.Fragment>
                    )}

                    {configAPP.usarConfiguracaoFPCaracteristica() && (
                      <React.Fragment>
                        {["REAIS", "GRÃOS"].map((t, index) => {
                          return (
                            <React.Fragment
                              key={`resumoItem_totais_${normalizeString(
                                t
                              )}_${index}_${new Date().getTime()}`}>
                              <p>
                                Total Pedido {t}:<br />
                                {currency()(
                                  this.state.formData[
                                    `total_pedido_${normalizeString(t)}`
                                  ] || 0
                                )}
                              </p>
                              <p key={`resumoItem_saldo_${normalizeString(t)}`}>
                                Saldo a Parcelar {t}:<br />
                                {currency()(
                                  this.state[
                                    `saldo_parcelar_${normalizeString(t)}`
                                  ] || 0
                                )}
                              </p>
                            </React.Fragment>
                          );
                        })}
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
                  <Button
                    type="primary"
                    icon="save"
                    onClick={() => this.saveForm()}
                    loading={this.state.savingForm}>
                    Concluir Pedido
                  </Button>
                }>
                <CalculoFrete />
                {configAPP.usarConfiguracaoFPCaracteristica() &&
                  this.existePagamentoEmGraos() && <CalculoPagamentoGraos />}
                {!configAPP.usarConfiguracaoFPCaracteristica() && (
                  <ParcelasManual />
                )}
                {configAPP.usarConfiguracaoFPCaracteristica() && (
                  <ParcelasAutomaticas />
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </SimpleLazyLoader>
    );
  }

  totalPedidoReais() {
    return (
      this.props.pedido.itens
        .map(t => t.total_preco_item_reais)
        .reduce(
          (a, b) => Number(a) + Number(b),
          this.state.formData.total_pedido_frete || 0
        ) || 0
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
