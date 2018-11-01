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

import * as CompaniesBranchService from "../../../services/companies.branchs";
import * as CompaniesService from "../../../services/companies";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class Companies extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: false,
      company_id: this.props.match.params.company_id,
      company_data: {}
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await CompaniesBranchService.list(this.state.company_id)(aqp);
    const companyData = await CompaniesService.get(this.state.company_id);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      loadingData: false,
      company_data: companyData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await CompaniesBranchService.changeStatus(this.state.company_id)(
        id,
        newStatus
      );

      let recordName = "";

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
          recordName = item.razao_social;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `A filial, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da filial", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await CompaniesBranchService.remove(this.state.company_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A filial, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma filial", err);
    }
  };

  tableConfig = () => [
    {
      title: "Razao Social",
      dataIndex: "razao_social",
      key: "razao_social",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Nome Fantasia",
      dataIndex: "nome_fantasia",
      key: "nome_fantasia",
      render: text => text
    },
    {
      title: "CPF/CNPJ",
      dataIndex: "cpf_cnpj",
      key: "cpf_cnpj",
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
            title={`Tem certeza em ${statusTxt} a filial?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title={`${statusTxt.toUpperCase()} a filial`}>
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
              href={`/empresas/${this.state.company_id}/filiais/${record._id}/edit`}
            >
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir a filial?`}
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
            <Button onClick={() => this.props.history.push("/empresas")}>
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
              <p>{`Empresa: ${this.state.company_data.razao_social}`}</p>
              <p>{`CPF/CNPJ: ${this.state.company_data.cpf_cnpj}`}</p>
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  this.props.history.push(
                    `/empresas/${this.state.company_id}/edit`,
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
              title="Filiais"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  href={`/empresas/${this.state.company_id}/filiais/new`}
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

export default Companies;
