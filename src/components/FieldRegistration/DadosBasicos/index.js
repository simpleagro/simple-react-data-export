import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, Tooltip } from "antd";

import * as FieldRegistrationService from "../../../services/field-registration";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import { simpleTableSearch } from "../../../lib/simpleTableSearch";
import moment from "moment";

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

  removeRecord = async ({ _id, numero_inscricao_campo }) => {
    try {
      await FieldRegistrationService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A inscrição de campo, ${numero_inscricao_campo}, foi removido com sucesso!`);
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
      title: "Contrato",
      dataIndex: "contrato",
      key: "contrato",
      fixed: "left",
      ...simpleTableSearch(this)("contrato"),
      render: text => text
    },
    {
      title: "Cliente",
      dataIndex: "cliente.nome",
      key: "cliente.nome",
      fixed: "left",
      ...simpleTableSearch(this)("cliente.nome"),
      render: text => text
    },
    {
      title: "Safra",
      dataIndex: "safra.descricao",
      key: "safra.descricao",
      render: text => text
    },
    {
      title: "Propriedade",
      dataIndex: "propriedade.nome",
      key: "propriedade.nome",
      ...simpleTableSearch(this)("propriedade.nome"),
      render: text => text
    },
    {
      title: "Cultivar",
      dataIndex: "cultivar.nome",
      key: "cultivar.nome",
      ...simpleTableSearch(this)("cultivar.nome"),
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
      dataIndex: "data_inicio_colheita",
      key: "data_inicio_colheita",
      render: (text) => {
        return moment(text).format("DD/MM/YYYY")
      }
    },
    {
      title: "Fim Colheita",
      dataIndex: "data_fim_colheita",
      key: "data_fim_colheita",
      render: (text) => {
        return moment(text).format("DD/MM/YYYY")
      }
    },
    {
      title: "Produção",
      dataIndex: "prod_estimada",
      key: "prod_estimada",
      render: text => text
    },
    {
      title: "Categoria Plantada",
      dataIndex: "categ_plantada",
      key: "categ_plantada",
      render: text => text
    },
    {
      title: "Categoria Colhida",
      dataIndex: "categ_colhida",
      key: "categ_colhida",
      render: text => text
    },
    {
      title: "Ações",
      dataIndex: "action",
      fixed: "right",
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
                <FontAwesomeIcon icon="leaf" size="lg" />
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
          scroll={{ x: window.innerWidth }}
        />
      </div>
    );
  }
}

export default FieldRegistration;
