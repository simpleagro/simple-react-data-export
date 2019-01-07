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
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import * as GroupFeaturesService from "../../../services/productgroups.features";
import * as GroupsService from "../../../services/productgroups";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";

class Caracteristicas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      group_id: this.props.group || this.props.match.params.group_id || 0,
      group_data: {},
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

    const data = await GroupFeaturesService.list(this.state.group_id)(aqp);
    const groupData = await GroupsService.get(this.state.group_id);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      loadingData: false,
      group_data: groupData,
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
      await GroupFeaturesService.changeStatus(this.state.group_id)(
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
        `A característica, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da característica", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await GroupFeaturesService.remove(this.state.group_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A característica, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma característica", err);
    }
  };

  tableConfig = () => [
    {
      title: "Nome",
      dataIndex: "label",
      key: "label",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Opções",
      dataIndex: "opcoes",
      key: "opcoes",
      render: (opcoes) => {
        return opcoes.map( opcao => <pre key={`${opcao.value}`}>{opcao.label}</pre>)
      }
    },
    {
      title: "Obrigatório",
      dataIndex: "obrigatorio",
      key: "obrigatorio",
      render: (item) => item? "Sim" : "Não"
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
            title={`Tem certeza em ${statusTxt} a característica?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} a característica`}>
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
              onClick={() =>
                this.editarCaracteristica(record)
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir a característica?`}
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

  editarCaracteristica (record) {
    return this.props.match.params.group_id
      ? this.props.history.push(`/grupos-produtos/${this.state.group_id}/caracteristicas-produtos/${record._id}/edit`)
      : this.props.history.push(`/caracteristicas-produtos/${record._id}/edit`);
  }

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
        {this.props.match.params.group_id ? (
          <div>
            <SimpleBreadCrumb to={"/grupos-produtos"} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Grupo: ${this.state.group_data.nome || ''}`}</p>
                  <Button
                    style={{ width: "100%" }}
                    onClick={() => {
                      this.props.history.push(
                        `/grupos-produtos/${this.state.group_id}/edit`,
                        { returnTo: this.props.history.location }
                      );
                    }}>
                    <Icon type="edit" /> Editar
                  </Button>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Características"
                  bordered={false}
                  extra={
                    <Button
                      type="primary"
                      icon="plus"
                      onClick={() =>
                        this.props.history.push(
                          `/grupos-produtos/${this.state.group_id}/caracteristicas-produtos/new`
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
        ) : (
          <div>
            <PainelHeader title="Características">
              <Button
                type="primary"
                icon="plus"
                onClick={() => this.props.history.push(`/grupos-produtos/${this.state.group_id}/caracteristicas-produtos/new`)}>
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
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  return {
    group: painelState.userData.group
  };
};

export default withRouter(connect(mapStateToProps)(Caracteristicas));