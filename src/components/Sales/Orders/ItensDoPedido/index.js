import React, { Component } from "react";
import { Divider, Button, Icon, Popconfirm, Row, Col, Card } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import * as OrderService from "services/orders";
import * as OrderItemsService from "services/orders.items";
import SimpleTable from "common/SimpleTable";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { simpleTableSearch } from "lib/simpleTableSearch";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { dadosPedido } from "actions/pedidoActions";
import { addMaskReais, currency } from "common/utils";
import { configAPP } from "config/app";

class OrderItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      order_id: this.props.match.params.order_id,
      order_data: null,
      tabela_data: {},
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(aqp) {
    try {
      // const items = await OrderItemsService.list(this.state.order_id)(aqp);
      const orderData = await OrderService.get(this.state.order_id, {
        fields:
          "tabela_preco_base, numero, cliente, propriedade, estado, cidade, pgto_royalties, pgto_tratamento, pgto_germoplasma, itens, status_pedido"
      });
      this.setState(prev => ({
        ...prev,
        list: orderData.itens,
        loadingData: false,
        order_data: orderData
      }));
      this.props.dadosPedido(orderData);
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
      this.props.history.push(`/pedidos`);
    } finally {
      this.setState({ loadingData: false });
    }
  }

  async componentDidMount() {
    await this.initializeList({
      fields: "produto, quantidade, desconto, total_preco_item, status"
    });
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

  removeRecord = async ({ _id, produto }) => {
    try {
      await OrderItemsService.remove(this.state.order_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess(
        "",
        `O item, ${produto.nome}, foi removido com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um item do pedido", err);
    }
  };

  tableConfig = () => {
    const colunaDesconto =
      (!configAPP.usarConfiguracaoFPCaracteristica() && {
        title: "Desconto",
        dataIndex: "desconto",
        key: "desconto",
        align: "center"
      }) ||
      null;

    const colunaTotalItem = configAPP.usarConfiguracaoFPCaracteristica()
      ? {
          title: "Totais",
          align: "center",
          render: (text, record, index) => (
            <React.Fragment>
              <pre key={`${record.total_preco_item_reais}_${index}`}>
                Em Reais: {currency()(record.total_preco_item_reais || 0)}
              </pre>
              <pre key={`${record.total_preco_item_graos}_${index}`}>
                Em Grãos: {currency()(record.total_preco_item_graos || 0)}
              </pre>
            </React.Fragment>
          )
        }
      : {
          title: "Total Item",
          dataIndex: "total_preco_item",
          key: "total_preco_item",
          align: "right",
          render: text => currency()(text || 0)
        };

    const colunaAcao = this.pedidoPodeSerEditado()
      ? {
          title: "Ações",
          dataIndex: "action",
          render: (text, record) => {
            return (
              <span>
                <Button
                  size="small"
                  onClick={() =>
                    this.props.history.push(
                      `/pedidos/${this.state.order_id}/itens-do-pedido/${
                        record._id
                      }/edit`
                    )
                  }>
                  <Icon type="edit" style={{ fontSize: "16px" }} />
                </Button>

                <Divider
                  style={{ fontSize: "10px", padding: 0, margin: 2 }}
                  type="vertical"
                />

                <Popconfirm
                  title={`Tem certeza em excluir este item?`}
                  onConfirm={() => this.removeRecord(record)}
                  okText="Sim"
                  cancelText="Não">
                  <Button size="small">
                    <Icon type="delete" style={{ fontSize: "16px" }} />
                  </Button>
                </Popconfirm>
                <Divider
                  style={{ fontSize: "10px", padding: 0, margin: 2 }}
                  type="vertical"
                />
              </span>
            );
          }
        }
      : {};

    return [
      {
        title: "Produto",
        dataIndex: "produto.nome",
        key: "produto.nome",
        sorter: (a, b, sorter) => {
          if (sorter === "ascendent") return -1;
          else return 1;
        },
        ...simpleTableSearch(this)("produto.nome")
      },
      {
        title: "Quantidade",
        dataIndex: "quantidade",
        key: "quantidade",
        align: "center"
      },
      { ...colunaDesconto },
      { ...colunaTotalItem },
      { ...colunaAcao }
    ];
  };

  handleTableChange = (pagination, filter, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filter
    });
  };

  render() {
    return (
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
              {this.state.order_data && (
                <div>
                  <p>{`Cliente: ${this.state.order_data.cliente.nome}`}</p>
                  <p>{`CPF/CNPJ: ${this.state.order_data.cliente.cpf_cnpj}`}</p>
                  <p>{`Propriedade: ${
                    this.state.order_data.propriedade.nome
                  } - ${this.state.order_data.propriedade.ie}`}</p>
                </div>
              )}
              {this.pedidoPodeSerEditado() && (
                <React.Fragment>
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
                  <Button
                    type="primary"
                    style={{ width: "100%", marginTop: "5px" }}
                    onClick={() => {
                      this.props.history.push(
                        `/pedidos/${this.state.order_id}/finalizar-pedido`,
                        { returnTo: this.props.history.location }
                      );
                    }}>
                    <Icon type="shopping" /> Finalizar Pedido
                  </Button>
                </React.Fragment>
              )}
            </Card>
          </Col>
          <Col span={19}>
            <Card
              title="Itens do Pedido"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  onClick={() =>
                    this.props.history.push(
                      "/pedidos/" + this.state.order_id + "/itens-do-pedido/new"
                    )
                  }>
                  Adicionar
                </Button>
              }>
              <SimpleTable
                pagination={this.state.pagination}
                spinning={this.state.loadingData}
                rowKey="_id"
                columns={this.tableConfig()}
                dataSource={this.state.list}
                onChange={this.handleTableChange}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  pedidoPodeSerEditado() {
    if (!this.state.order_data) return false;
    return (
      this.state.order_data.status_pedido.includes("Em cotação") ||
      this.state.order_data.status_pedido.includes("Reprovado")
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      dadosPedido
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
)(OrderItem);
