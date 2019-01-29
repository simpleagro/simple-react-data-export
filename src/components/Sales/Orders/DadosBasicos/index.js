import React, { Component } from "react";
import { Divider, Button, Icon, Popconfirm, Tooltip } from "antd";
import moment from "moment";

import { simpleTableSearch } from "../../../../lib/simpleTableSearch";
import * as OrderService from "../../../../services/orders";
import SimpleTable from "../../../common/SimpleTable";
import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";

class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await OrderService.list(aqp);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      loadingData: false,
      pagination: {
        total: data.total
      }
    }));
  }

  async componentDidMount() {
    await this.initializeList({ fields: "-itens" });
  }

  changeStatus = async (id, newStatus) => {
    try {
      await OrderService.changeStatus(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
          recordName = item.numero;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `O pedido, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do pedido", err);
    }
  };

  removeRecord = async ({ _id, numero }) => {
    try {
      await OrderService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O pedido, #${numero}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um pedido", err);
    }
  };

  tableConfig = () => [
    {
      title: "Número",
      dataIndex: "numero",
      key: "numero",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("numero")
    },
    {
      title: "Cliente",
      dataIndex: "cliente.nome",
      key: "cliente.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("cliente.nome")
    },
    {
      title: "Propriedade",
      dataIndex: "propriedade.nome",
      key: "propriedade.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: (text, record) => `${text} / IE: ${record.propriedade.ie}`,
      ...simpleTableSearch(this)("propriedade.nome")
    },
    {
      title: "Safra",
      dataIndex: "safra.descricao",
      key: "safra.descricao",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("safra.descricao")
    },
    {
      title: "Data do Pedido",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => (text ? moment(text).format("DD/MM/YYYY") : ""),
      ...simpleTableSearch(this)("created_at", {
        tooltip: { title: "Utilize dd/mm/yyyy" },
        useRegex: false
      })
    },
    {
      title: "Ações",
      width: 200,
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() =>
                this.props.history.push(`/pedidos/${record._id}/edit`)
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>

            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Popconfirm
              title={`Tem certeza em excluir este pedido?`}
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

            <Tooltip title="Veja os produtos do pedido">
              <Button
                size="small"
                onClick={() => {
                  this.props.history.push(
                    `/pedidos/${record._id}/itens-do-pedido`
                  );
                }}>
                <Icon type="bars" style={{ fontSize: "16px" }} />
              </Button>
            </Tooltip>

            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Tooltip title="Finalizar Pedido">
              <Button
                size="small"
                onClick={() => {
                  this.props.history.push(
                    `/pedidos/${record._id}/finalizar-pedido`
                  );
                }}>
                <Icon type="shopping" style={{ fontSize: "16px" }} />
              </Button>
            </Tooltip>
          </span>
        );
      }
    }
  ];

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
      ...this.state.tableSearch
    });
  };

  render() {
    return (
      <div>
        <PainelHeader title="Pedidos">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.props.history.push("/pedidos/new")}>
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

export default Orders;
