import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Breadcrumb,
  Card,
  Divider,
  Button,
  Icon,
  Popconfirm,
  Tooltip,
  Row,
  Col
} from "antd";

import * as PreHarvestService from "../../../services/field-registration.pre-harvest";
import * as AuthorizationService from "../../../services/field-registration.authorization";

import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess, flashWithError } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { simpleTableSearch } from "../../../lib/simpleTableSearch";

class Plots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      },
      pre_harvest_id: this.props.match.params.pre_harvest_id,
      field_registration_id: this.props.match.params.field_registration_id,
      pre_harvest_data: {}
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    try {
      const data = await AuthorizationService.list(this.state.field_registration_id)(
        this.props.match.params.pre_harvest_id
      )(aqp);

      const preHarvestData = await PreHarvestService.get(
        this.state.field_registration_id
      )(this.props.match.params.pre_harvest_id);
      this.setState(prev => ({
        ...prev,
        list: data.docs,
        loadingData: false,
        pre_harvest_data: preHarvestData
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
      this.props.history.push(`/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita/${this.state.pre_harvest_id}/autorizacao`);
    } finally {
      this.setState({ loadingData: false });
    }
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await AuthorizationService.changeStatus(this.state.field_registration_id)(
        this.state.pre_harvest_id
      )(id, newStatus);

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
        `A autorização, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da autorização", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await AuthorizationService.remove(this.state.field_registration_id)(
        this.state.pre_harvest_id
      )(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A autorização, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover a autorização", err);
    }
  };

  tableConfig = () => [
    {
      title: "Número",
      dataIndex: "numero_autorizacao",
      key: "pre-colheita.numero_autorizacao",
      ...simpleTableSearch(this)("pre-colheita.numero_autorizacao")
    },
    {
      title: "Data",
      dataIndex: "data",
      key: "pre-colheita.data",
      ...simpleTableSearch(this)("pre-colheita.data")
    },
    {
      title: "Motorista",
      dataIndex: "motorista",
      key: "pre-colheita.motorista",
      ...simpleTableSearch(this)("pre-colheita.motorista")
    },
    {
      title: "Placa",
      dataIndex: "placa",
      key: "pre-colheita.placa",
      ...simpleTableSearch(this)("pre-colheita.placa")
    },
    {
      title: "Saída",
      dataIndex: "saida_caminhao",
      key: "pre-colheita.saida_caminhao",
      ...simpleTableSearch(this)("pre-colheita.saida_caminhao")
    },
    {
      title: "Responsável",
      dataIndex: "responsavel.nome",
      key: "pre-colheita.responsavel.nome",
      ...simpleTableSearch(this)("pre-colheita.responsavel.nome")
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
                  `/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita/${
                    this.state.pre_harvest_id
                  }/autorizacao/${record._id}/edit`
                )
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir?`}
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

  handleTableChange = (pagination, filters) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...this.state.tableSearch
    });
  };

  render() {
    return (
      <div>
        <SimpleBreadCrumb>
          <Breadcrumb.Item>
            <Button onClick={() => this.props.history.push("/inscricao-de-campo")}>
              Inscrição de Campo
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Button
              onClick={() =>
                this.props.history.push(
                  `/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita`
                )
              }>
              Pré Colheita
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Autorização</Breadcrumb.Item>
        </SimpleBreadCrumb>
        <Row gutter={24}>
          <Col span={5}>
            <Card
              bordered
              style={{
                boxShadow: "0px 8px 0px 0px #009d55 inset",
                color: "#009d55"
              }}>
              <p>{`Pré Colheita: ${this.state.pre_harvest_data.nome}`}</p>
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  this.props.history.push(
                    `/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita/${
                      this.state.pre_harvest_id
                    }/edit`,
                    { returnTo: this.props.history.location }
                  );
                }}>
                <Icon type="edit" /> Editar
              </Button>
            </Card>
          </Col>
          <Col span={19}>
            <Card
              title="Autorização"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  onClick={() =>
                    this.props.history.push(
                      `/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita/${
                        this.state.pre_harvest_id
                      }/autorizacao/new`,
                      { pre_harvest: this.state.pre_harvest_data }
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
}

export default Plots;
