import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, Tooltip, Badge } from "antd";

import * as QuotaService from "../../../services/quotas";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"

class Quota extends Component {
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
      visible: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await QuotaService.list(aqp);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      loadingData: false,
      pagination: {
        total: data.total
      },
      editMode: false,
      formData: {},
      savingForm: false
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  getDatabase = () => {
    const link = window.location.href;
    const suffixRegex = /(([http]*[s]*[:][/][/])+)/g;
    const linkRegex = /((.simpleagro.com.br)+(:[0-9]*)([/a-z0-9]*)*)/g;

    let newLink = link.replace(suffixRegex, "").replace(linkRegex, "");

    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        database: newLink
      }
    }));
  };

  setStatus = () => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        status: true
      }
    }));
  };

  changeStatus = async (id, newStatus) => {
    try {
      await QuotaService.changeStatus(id, newStatus);

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
        `A cota, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da cota", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await QuotaService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A cota, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma cota", err);
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
      title: "Validade de",
      dataIndex: "data_validade_de",
      key: "data_validade_de",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Validade até",
      dataIndex: "data_validade_ate",
      key: "data_validade_ate",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Versão",
      dataIndex: "versao",
      key: "versao",
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
            title={`Tem certeza em ${statusTxt} a cota?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title={`${statusTxt.toUpperCase()} a cota`}>
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
              onClick={() => this.showModal(record) }
            >
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Popconfirm
              title={`Tem certeza em excluir a cota?`}
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

            <Tooltip title="Veja os vendedores">
              <Button
                size="small"
                onClick={() =>
                  this.props.history.push(`/cotas/${record._id}/vendedores`) 
                }
              >
                <FontAwesomeIcon icon="users" size="lg" />
              </Button>
            </Tooltip>

          </span>
        );
      }
    }
  ];

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

  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      editMode: !!record
    });
  }

  handleOk = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */

      try {
        const created = await QuotaService.create(item);
        
        this.setState(prev => {
          if(prev.list.length > 0){
            return({
              openForm: false,
              editMode: false,
              visible: false,
              list: [...prev.list,created]
            })
          }
          return({
            openForm: false,
            editMode: false,
            visible: false,
            list: [created]
          })
        });
        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao adicionar uma cota", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await QuotaService.update(item);
        const data = await QuotaService.list();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar uma cota", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  render() {
    return (
      <div>
        <PainelHeader title="Cotas">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.showModal() } //this.props.history.push("/ship-table/new")}
          >
            Adicionar
          </Button>
        </PainelHeader>
        <SimpleTable
          className="components-table-demo-nested"
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="_id"
          columns={this.tableConfig()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
        />
        <ModalForm
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
        />
      </div>
    );
  }
}

export default Quota;
