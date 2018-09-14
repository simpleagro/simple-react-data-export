import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, message, Tooltip } from "antd";

import * as ClientsPropertyService from "../../../services/clients.properties";
import SimpleTable from "../../common/SimpleTable";
// import Form from "./form";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";

class Properties extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: false,
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ClientsPropertyService.list(this.props.match.params.client_id)(aqp);

    this.setState(prev => ({
      ...prev,
      list: data,
      loadingData: false,
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await ClientsPropertyService.changeStatus(id, newStatus);

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
        `O propriedade, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do propriedade", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await ClientsPropertyService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O propriedade, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um propriedade", err);
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
      render: text => text,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: text => text,
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
            <Tooltip title={`${statusTxt.toUpperCase()} o propriedade`}>
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
            <Button size="small" href={`/propriedades/${record._id}/edit`}>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir o propriedade?`}
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
                href={`/clientes/${this.props.match.params.client_id}/propriedades/${record._id}`}
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
        <PainelHeader title="Propriedades">
          <Button
            type="primary"
            icon="plus"
            href="/propriedades/new"
          >
            Adicionar
          </Button>
        </PainelHeader>
        <SimpleTable
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="_id"
          columns={this.tableConfig()}
          dataSource={this.state.list}
        />
      </div>
    );
  }
}

export default Properties;
