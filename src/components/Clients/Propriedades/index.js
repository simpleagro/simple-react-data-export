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
import * as ClientsService from "../../../services/clients";
import SimpleTable from "../../common/SimpleTable";
// import Form from "./form";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class Properties extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: false,
      client_id: this.props.match.params.client_id,
      client_data: {}
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ClientsPropertyService.list(this.state.client_id)(aqp);
    const clientData = await ClientsService.get(this.state.client_id);

    this.setState(prev => ({
      ...prev,
      list: data,
      loadingData: false,
      client_data: clientData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await ClientsPropertyService.changeStatus(this.state.client_id)(
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
        `A propriedade, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da propriedade", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await ClientsPropertyService.remove(this.state.client_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A propriedade, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma propriedade", err);
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
      title: "Inscrição Estadual",
      dataIndex: "inscricao_estadual",
      key: "inscricao_estadual",
      render: text => text
    },
    {
      title: "Cidade",
      dataIndex: "cidade",
      key: "cidade",
      render: text => text
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: text => text
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
            title={`Tem certeza em ${statusTxt} o propriedade?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title={`${statusTxt.toUpperCase()} a propriedade`}>
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
              href={`/clientes/${this.state.client_id}/propriedades/${record._id}/edit`}
            >
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir a propriedade?`}
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
            <Tooltip title="Veja os talhões da propriedade">
              <Button
                size="small"
                href={`/clientes/${this.state.client_id}/propriedades/${
                  record._id
                }`}
              >
                <FontAwesomeIcon icon="map-marked-alt" size="lg" />
              </Button>
            </Tooltip>
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
              <Icon type="arrow-left" />
              Voltar para a tela anterior
            </Button>
          </Breadcrumb.Item>
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
              <p>{`Cliente: ${this.state.client_data.nome}`}</p>
              <p>{`CPF/CNPJ: ${this.state.client_data.cpf_cnpj}`}</p>
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
              title="Propriedades"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  href={`/clientes/${this.state.client_id}/propriedades/new`}
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

export default Properties;
