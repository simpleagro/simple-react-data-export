import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, message, Tooltip } from "antd";

import * as FeaturePriceTableService from "services/feature-table-prices";
import SimpleTable from "common/SimpleTable";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { PainelHeader } from "common/PainelHeader";
import moment from "moment";

class PaymentForm extends Component {
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

    const data = await FeaturePriceTableService.list(aqp);

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
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await FeaturePriceTableService.changeStatus(id, newStatus);

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
        `A tabela de preço de característica, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da tabela de preço de característica", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await FeaturePriceTableService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A tabela de preço de característica, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma tabela de preço de característica", err);
    }
  };

  tableConfig = () => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => text
    },
    {
      title: "Moeda",
      dataIndex: "moeda",
      key: "moeda",
      render: text => text
    },
    {
      title: "Safra",
      dataIndex: "safra.descricao",
      key: "safra.descricao",
      render: text => text
    },
    // {
    //   title: "Validade de",
    //   dataIndex: "data_validade_de",
    //   key: "data_validade_de",
    //   render: text => {
    //     return moment(text).format("DD/MM/YYYY")
    //   }
    // },
    // {
    //   title: "Validade até",
    //   dataIndex: "data_validade_ate",
    //   key: "data_validade_ate",
    //   render: text => {
    //     return moment(text).format("DD/MM/YYYY")
    //   }
    // },
    {
      title: "Data Base",
      dataIndex: "data_base",
      key: "data_base",
      render: text => {
        return moment(text).format("DD/MM/YYYY")
      }
    },
    {
      title: "Unidade",
      dataIndex: "u_m_preco",
      key: "u_m_preco",
      render: text => text
    },
    {
      title: "Caracteristica",
      dataIndex: "caracteristica.label",
      key: "caracteristica.label",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => text
    },
    {
      title: "Ações",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() => this.props.history.push(`/tabela-preco-caracteristica/${record._id}/edit`)}>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>

            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Tooltip title="Veja as variações de preços">
              <Button
                size="small"
                onClick={() => this.props.history.push(`/tabela-preco-caracteristica/${record._id}/variacao-de-preco`)}>
                <Icon type="dollar" style={{ fontSize: "16px"}} />
              </Button>
            </Tooltip>

            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Popconfirm
              title={`Tem certeza em excluir a tabela de preço de característica?`}
              onConfirm={() => this.removeRecord(record)}
              okText="Sim"
              cancelText="Não"
            >
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
      limit: pagination.pageSize
    });
  };

  render() {
    return (
      <div>
        <PainelHeader title="Tabela Preço Característica">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.props.history.push("/tabela-preco-caracteristica/new")}>
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

export default PaymentForm;
