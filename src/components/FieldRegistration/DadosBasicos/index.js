import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, Tooltip } from "antd";

import * as FieldRegistrationService from "../../../services/field-registration";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";

class FieldRegistration extends Component {
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
      const data = await FieldRegistrationService.list(aqp);
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
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await FieldRegistrationService.changeStatus(id, newStatus);

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
        `A incrição de campo, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da inscrição de campo", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await FieldRegistrationService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A inscrição de campo, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma inscrição de campo", err);
    }
  };

  tableConfig = () => [
    {
      title: "Nº de Inscrição",
      dataIndex: "numero_inscricao_campo",
      key: "numero_inscricao_campo",
      fixed: "left",
      render: text => text
    },
    {
      title: "Cliente",
      dataIndex: "cliente.nome",
      key: "cliente.nome",
      fixed: "left",
      render: text => text
    },
    {
      title: "Propriedade",
      dataIndex: "propriedade.nome",
      key: "propriedade.nome",
      render: text => text
    },
    {
      title: "Cultivar",
      dataIndex: "cultivar.nome",
      key: "cultivar.nome",
      render: text => text
    },
    {
      title: "Área Inscrita",
      dataIndex: "area_inscrita",
      key: "area_inscrita",
      render: text => text
    },
    {
      title: "Início Colheita",
      dataIndex: "inicio_colheita",
      key: "inicio_colheita",
      render: text => text
    },
    {
      title: "Produção",
      dataIndex: "producao",
      key: "producao",
      render: text => text
    },
    {
      title: "Ações",
      dataIndex: "action",
      //fixed: "right",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() =>
                this.props.history.push(`/inscricao-de-campo/${record._id}/edit`)
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir a inscrição de campo?`}
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
            <Tooltip title="Veja as pré-colheitas">
              <Button
                size="small"
                onClick={() =>
                  this.props.history.push(
                    `/inscricao-de-campo/${record._id}/pre-colheita`
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
                <Tooltip title="Veja as autorizações">
                  <Button
                    size="small"
                    onClick={() => {
                      this.props.novoPlantio(record);
                      this.props.history.push(
                        `/inscricao-de-campo/${record._id}/autorizacao`
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
        <PainelHeader title="Inscrição de Campo">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.props.history.push("/inscricao-de-campo/new")}>
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
          scroll={{ x: 1500 }}
        />
      </div>
    );
  }
}

export default FieldRegistration;
