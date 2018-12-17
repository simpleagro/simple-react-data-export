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

import * as ClientsPropertyService from "../../../services/clients.properties";
import * as ClientsPlotsService from "../../../services/clients.plots";

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
      property_id: this.props.match.params.property_id,
      client_id: this.props.match.params.client_id,
      property_data: {}
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    try {
      const data = await ClientsPlotsService.list(this.state.client_id)(
        this.props.match.params.property_id
      )(aqp);

      const propertyData = await ClientsPropertyService.get(
        this.state.client_id
      )(this.props.match.params.property_id);
      this.setState(prev => ({
        ...prev,
        list: data.docs,
        loadingData: false,
        property_data: propertyData
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
      this.props.history.push(`/clientes/${this.state.client_id}/propriedades`);
    } finally {
      this.setState({ loadingData: false });
    }
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await ClientsPlotsService.changeStatus(this.state.client_id)(
        this.state.property_id
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
        `O talhão, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do talhão", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await ClientsPlotsService.remove(this.state.client_id)(
        this.state.property_id
      )(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O talhão, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um talhão", err);
    }
  };

  tableConfig = () => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "propriedades.talhoes.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("propriedades.talhoes.nome"),
      render: (text, record) => {
        return !record.poligonos || (record.poligonos && record.poligonos.length && record.poligonos[0].coordenadas.length < 3) ? (
          <Tooltip title="Este talhão ainda não possui pontos de mapeamento">
            <FontAwesomeIcon
              icon="exclamation-triangle"
              size="1x"
              color="red"
              style={{ marginRight: 8 }}
            />
            {text}
          </Tooltip>
        ) : (
          text
        );
      }
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
            title={`Tem certeza em ${statusTxt} o talhão?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} o talhão`}>
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
                this.props.history.push(
                  `/clientes/${this.state.client_id}/propriedades/${
                    this.state.property_id
                  }/talhoes/${record._id}/edit`
                )
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir o talhão?`}
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
            <Tooltip title="Veja os planejamentos de plantio para este talhão">
              <Button
                size="small"
                onClick={() => {
                  this.props.history.push(
                    `/clientes/${this.state.client_id}/plantio?talhao=${record._id}`
                  );
                }}>
                <FontAwesomeIcon icon="seedling" size="lg" />
              </Button>
            </Tooltip>
          </span>
        );
      }
    }
  ];

  handleTableChange = (pagination, filters) => {
    let _this = this;
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
        <SimpleBreadCrumb>
          <Breadcrumb.Item>
            <Button onClick={() => this.props.history.push("/clientes")}>
              Clientes
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Button
              onClick={() =>
                this.props.history.push(
                  `/clientes/${this.state.client_id}/propriedades`
                )
              }>
              Propriedades
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Talhões</Breadcrumb.Item>
        </SimpleBreadCrumb>
        <Row gutter={24}>
          <Col span={5}>
            <Card
              bordered
              style={{
                boxShadow: "0px 8px 0px 0px #009d55 inset",
                color: "#009d55"
              }}>
              <p>{`Propriedade: ${this.state.property_data.nome}`}</p>
              <p>{`I.E: ${this.state.property_data.ie}`}</p>
              <p>
                Cidade/Estado: <br />
                {`${this.state.property_data.cidade}/${
                  this.state.property_data.estado
                }`}
              </p>
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  this.props.history.push(
                    `/clientes/${this.state.client_id}/propriedades/${
                      this.state.property_id
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
              title="Talhões"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  onClick={() =>
                    this.props.history.push(
                      `/clientes/${this.state.client_id}/propriedades/${
                        this.state.property_id
                      }/talhoes/new`
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
