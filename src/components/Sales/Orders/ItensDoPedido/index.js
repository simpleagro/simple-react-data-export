import React, { Component } from "react";
import { Divider, Button, Icon, Popconfirm } from "antd";

import * as OrderItemsService from "../../../../services/orders.items";
import SimpleTable from "../../../common/SimpleTable";
import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import { simpleTableSearch } from "../../../../lib/simpleTableSearch";
import { SimpleBreadCrumb } from "../../../common/SimpleBreadCrumb";

class PriceVariation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      order_id: this.props.match.params.order_id,
      tabela_data: {},
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(aqp) {
    const items = await OrderItemsService.list(this.state.order_id)(aqp);

    this.setState(prev => ({
      ...prev,
      list: items.docs,
      loadingData: false,
      pagination: {
        total: items.total
      }
    }));
  }

  async componentDidMount() {
    await this.initializeList({
      fields: "produto, quantidade, desconto, preco_final_item, status"
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
        `A variação de preço, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da variação de preço", err);
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

  tableConfig = () => [
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
    },
    {
      title: "Desconto",
      dataIndex: "desconto",
      key: "desconto",
    },
    {
      title: "Preço Final",
      dataIndex: "desconto",
      key: "desconto",
    },
    {
      title: "Ações",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() =>
                this.props.history.push(
                  `/pedidos/${
                    this.state.order_id
                  }/itens-do-pedido/${record._id}/edit`
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
  ];

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
        <PainelHeader title="Itens do Pedido">
          <Button
            type="primary"
            icon="plus"
            onClick={() =>
              this.props.history.push(
                "/pedidos/" +
                  this.state.order_id +
                  "/itens-do-pedido/new"
              )
            }>
            Adicionar
          </Button>
        </PainelHeader>
        <SimpleTable
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="_id"
          columns={this.tableConfig()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default PriceVariation;
