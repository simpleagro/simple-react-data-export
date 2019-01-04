import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import * as FieldRegistrationService from "../../../services/field-registration";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { simpleTableSearch } from "../../../lib/simpleTableSearch";

class PreHarvest extends Component {
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
      field_registration_id: this.props.match.params.field_registration_id,
      pre_harvest_data: {}
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    try {
      const data = await PreHarvestService.list(this.state.field_registration_id)(aqp);
      const fieldRegistrationData = await FieldRegistrationService.get(this.state.field_registration_id);

      this.setState(prev => ({
        ...prev,
        list: data.docs,
        loadingData: false,
        pagination: {
          total: data.total
        },
        pre_harvest_data: fieldRegistrationData
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
      this.props.history.push(`/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita`);
    } finally {
      this.setState({ loadingData: false });
    }
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await PreHarvestService.changeStatus(this.state.field_registration_id)(
        id,
        newStatus
      );

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
        `A pré colheita, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da pré colheita", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await PreHarvestService.remove(this.state.field_registration_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A pré colheita, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma pré colheita", err);
    }
  };

  tableConfig = () => [
    {
      title: "Talhão",
      dataIndex: "nome_talhao",
      key: "pre-colheita.nome_talhao",
      ...simpleTableSearch(this)("pre-colheita.nome_talhao")
    },
    {
      title: "Data",
      dataIndex: "data",
      key: "pre-colheita.data",
      ...simpleTableSearch(this)("pre-colheita.data")
    },
    {
      title: "Número de Colhedoras",
      dataIndex: "num_colhedoras",
      key: "pre-colheita.num_colhedoras",
      ...simpleTableSearch(this)("pre-colheita.num_colhedoras")
    },
    {
      title: "Produtividade",
      dataIndex: "produtividade",
      key: "pre-colheita.produtividade",
      ...simpleTableSearch(this)("pre-colheita.produtividade")
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
              title={`Tem certeza em excluir a pré colheita?`}
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
            {this.props.seletorModulo &&
              this.props.seletorModulo.slug !== "sales" && (
                <Tooltip title="Veja as autorizações">
                  <Button
                    size="small"
                    onClick={() =>
                      this.props.history.push(
                        `/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita/${
                          record._id
                        }/autorizacao`
                      )
                    }>
                    <FontAwesomeIcon icon="map-marked-alt" size="lg" />
                  </Button>
                </Tooltip>
              )}
          </span>
        );
      }
    }
  ];

  handleTableChange = (pagination, filters) => {
    //let _this = this;
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...this.state.tableSearch
      // ..._this.state.tableSearch ? _this.state.tableSearch : null
    });
  };

  render() {
    return (
      <div>
        <SimpleBreadCrumb to={"/inscricao-de-campo"} history={this.props.history} />
        <Row gutter={24}>
          <Col span={5}>
            <Card
              bordered
              style={{
                boxShadow: "0px 8px 0px 0px #009d55 inset",
                color: "#009d55"
              }}>
              <p>{`Inscrição: ${this.state.pre_harvest_data.nome}`}</p>
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  this.props.history.push(
                    `/inscricao-de-campo/${this.state.field_registration_id}/edit`,
                    { returnTo: this.props.history.location }
                  );
                }}>
                <Icon type="edit" /> Editar
              </Button>
            </Card>
          </Col>
          <Col span={19}>
            <Card
              title="Pré Colheita"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  onClick={() =>
                    this.props.history.push(
                      `/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita/new`
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

export default PreHarvest;
