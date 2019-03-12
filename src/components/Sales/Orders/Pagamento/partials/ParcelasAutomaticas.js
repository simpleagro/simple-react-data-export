import React, { Component } from "react";
import { Card } from "antd";
import moment from "moment";
import "moment/locale/pt-br";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import * as OrderPaymentService from "services/orders.payment";
import { dadosPedidoParcelaAutomatica } from "actions/pedidoActions";
import SimpleTable from "common/SimpleTable";
import { getNumber, currency } from "common/utils";
import parseErrors from "lib/parseErrors";

class ParcelasAutomaticas extends Component {
  state = {
    gerarParcelas: true
  };

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.gerarParcelas)
      await this.gerarParcelasAutomaticasVencimento();
  }

  tableConfig = () => [
    {
      title: "Data de Vencimento",
      dataIndex: "data_vencimento",
      key: "data_vencimento",
      render: text => (text ? moment(text).format("DD/MM/YYYY") : undefined)
    },
    {
      title: "Valor Parcela",
      dataIndex: "valor_parcela",
      key: "valor_parcela"
    }
  ];

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
            .reduce((a, b) => getNumber(a) + getNumber(b), 0);
        if (chave === "pgto_frete")
          valor = getNumber(order.pagamento.total_pedido_frete) || 0;
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
        <Card title="Parcelas" bordered={false}>
          <SimpleTable
            pagination={false}
            spinning={this.state.gerarParcelas}
            rowKey={() => new Date().getTime() + Math.random()}
            columns={this.tableConfig()}
            dataSource={
              (this.props.pedido &&
                this.props.pedido.pagamento &&
                this.props.pedido.pagamento.parcelas) ||
              []
            }
          />
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
      dadosPedidoParcelaAutomatica
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ParcelasAutomaticas);
