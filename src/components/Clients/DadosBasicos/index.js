import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, Tooltip, Input } from "antd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import * as ClientService from "../../../services/clients";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { simpleTableSearch } from "../../../lib/simpleTableSearch";
import { PainelHeader } from "../../common/PainelHeader";
import { novoPlantio } from "../../../actions/plantioActions";

class Clients extends Component {
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

    try {
      const data = await ClientService.list(aqp);
      this.setState(prev => ({
        ...prev,
        list: data.docs,
        loadingData: false,
        pagination: {
          total: data.total
        }
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
    } finally {
      this.setState({ loadingData: false });
    }
  }

  async componentDidMount() {
    this.props.novoPlantio({});
    await this.initializeList({ carteira: this.props.carteira });
  }

  changeStatus = async (id, newStatus) => {
    try {
      await ClientService.changeStatus(id, newStatus);

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
        `O cliente, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do cliente", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await ClientService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O cliente, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um cliente", err);
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
      ...simpleTableSearch(this)("nome"),
      render: text => text
    },
    {
      title: "CPF / CNPJ",
      dataIndex: "cpf_cnpj",
      key: "cpf_cnpj",
      ...simpleTableSearch(this)("cpf_cnpj"),
      render: text => text
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      render: text => text,
      filters: [
        { text: "Produtor", value: "PRODUTOR" },
        { text: "Cooperado", value: "COOPERADO" },
        { text: "Distribuidor", value: "DISTRIBUIDOR" }
      ],
      onFilter: (value, record) => record.tipo === value
    },
    {
      title: "Gerenciamento de Carteira",
      dataIndex: "gerenciarCarteiraPorPropriedade",
      key: "gerenciarCarteiraPorPropriedade",
      render: text => (text === true ? "Por Propriedade" : "Por Cliente"),
      filters: [
        { text: "Por Propriedade", value: true },
        { text: "Por Cliente", value: false }
      ],
      onFilter: (value, record) =>
        record.gerenciarCarteiraPorPropriedade.toString() === value
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        const statusTxt = record.status ? "desativar" : "ativar";
        const statusBtn = record.status ? "unlock" : "lock";
        return (
          <Popconfirm
            placement="rightTop"
            title={`Tem certeza em ${statusTxt} o cliente?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} o cliente`}>
              <Button size="small">
                <FontAwesomeIcon icon={statusBtn} size="lg" />
              </Button>
            </Tooltip>
          </Popconfirm>
        );
      }
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
                this.props.history.push(`/clientes/${record._id}/edit`)
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir o cliente?`}
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
            <Tooltip title="Veja as propriedades do cliente">
              <Button
                size="small"
                onClick={() =>
                  this.props.history.push(
                    `/clientes/${record._id}/propriedades`
                  )
                }>
                <FontAwesomeIcon icon="list" size="lg" />
              </Button>
            </Tooltip>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            {this.props.seletorModulo &&
              this.props.seletorModulo.slug !== "sales" && (
                <Tooltip title="Veja os planejamentos de plantio do cliente">
                  <Button
                    size="small"
                    onClick={() => {
                      this.props.novoPlantio(record);
                      this.props.history.push(
                        `/clientes/${record._id}/plantio`
                      );
                    }}>
                    <FontAwesomeIcon icon="seedling" size="lg" />
                  </Button>
                </Tooltip>
              )}
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
        <PainelHeader title="Clientes">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.props.history.push("/clientes/new")}>
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

const mapStateToProps = ({ painelState }) => {
  return {
    carteira:
      (painelState && painelState.userData && painelState.userData.carteira) ||
      "",
    seletorModulo: painelState.seletorModulo || null
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      novoPlantio
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Clients);
