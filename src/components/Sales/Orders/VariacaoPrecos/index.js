import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, message, Tooltip } from "antd";

import * as FeatureTablePricesService from "../../../../services/feature-table-prices";
import * as PriceVariationsService from "../../../../services/feature-table-prices.price-variations";
import SimpleTable from "../../../common/SimpleTable";
import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import { simpleTableSearch } from "../../../../lib/simpleTableSearch";

class PriceVariation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      tabela_id: this.props.match.params.tabela_id,
      tabela_data: {},
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

    const data = await PriceVariationsService.list(this.state.tabela_id)(aqp);
    const dataFTP = await FeatureTablePricesService.list();

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      listFTP: dataFTP.docs,
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
      await PriceVariationsService.changeStatus(id, newStatus);

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

  removeRecord = async ({ _id, opcao_chave }) => {
    try {
      await PriceVariationsService.remove(this.state.tabela_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A variação de preço, ${opcao_chave}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma variação de preço", err);
    }
  };

  tableConfig = () => [
    {
      title: "Opção",
      dataIndex: "opcao_chave",
      key: "precos.opcao_chave",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)('precos.opcao_chave'),
      render: text => text
    },
    {
      title: "Valor",
      dataIndex: "valor",
      key: "precos.valor",
      ...simpleTableSearch(this)('precos.valor')
    },
    {
      title: "Unidade de Medida",
      dataIndex: "u_m",
      key: "precos.u_m",
      ...simpleTableSearch(this)('precos.u_m')
    },
    {
      title: "Ações",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() => this.props.history.push(`/tabela-preco-caracteristica/${this.state.tabela_id}/variacao-de-preco/${record._id}/edit`)}>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>

            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Popconfirm
              title={`Tem certeza em excluir a variação de preço?`}
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
        <PainelHeader title="Variação de Preço">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.props.history.push("/tabela-preco-caracteristica/"+ this.state.tabela_id +"/variacao-de-preco/new")}>
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
