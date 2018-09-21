import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Card,
  Divider,
  Button,
  Icon,
  Popconfirm,
  Breadcrumb,
  Tooltip,
  Row,
  Col
} from "antd";
import styled from "styled-components";

import * as ClientsPropertyService from "../../../services/clients.properties";
import * as ClientsPlotsService from "../../../services/clients.plots";
// import * as TalhoesService from "../../../services/clients.talhoes";
import SimpleTable from "../../common/SimpleTable";
// import Form from "./form";
import { flashWithSuccess, flashWithError } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class Plots extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: false,
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
        list: data,
        loadingData: false,
        property_data: propertyData
      }));
    } catch (err) {
      const {
        error = "Houve um erro ao visualizar os dados"
      } = err.response.data;

      flashWithError(error);

      this.props.history.push(`/clientes/${this.state.client_id}/propriedades`);
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
      await ClientsPlotsService.remove(this.state.client_id)(this.state.property_id)(_id);
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
      key: "nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
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
            cancelText="Não"
          >
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
      title: "",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              href={`/clientes/${this.state.client_id}/propriedades/${
                this.state.property_id
              }/talhoes/${record._id}/edit`}
            >
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

  render() {
    return (
      <div>
        <BreadcrumbStyled>
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
              }
            >
              Propriedades
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Talhões</Breadcrumb.Item>
        </BreadcrumbStyled>
        <Row gutter={24}>
          <Col span={5}>
            <Card
              bordered
              style={{
                boxShadow: "0px 8px 0px 0px #009d55 inset",
                color: "#009d55"
              }}
            >
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
                    `/clientes/${this.state.client_id}/edit`,
                    { returnTo: this.props.history.location }
                  );
                }}
              >
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
                  href={`/clientes/${this.state.client_id}/propriedades/${
                    this.state.property_id
                  }/talhoes/new`}
                >
                  Adicionar
                </Button>
              }
            >
              <SimpleTable
                pagination={this.state.pagination}
                spinning={this.state.loadingData}
                rowKey="_id"
                columns={this.tableConfig()}
                dataSource={this.state.list}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Plots;