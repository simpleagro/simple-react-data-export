import React, { Component, Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, message, Tooltip } from "antd";

import * as ClientService from "../../../services/clients";
import SimpleTable from "../../common/SimpleTable";
import Form from "./form";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";

class Clients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      editMode: false,
      openForm: false,
      pagination: false,
      form: {}
    };
  }

  async initializeList() {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ClientService.list();

    this.setState(prev => ({
      ...prev,
      list: data,
      loadingData: false,
      pagination: data.lenght > 10
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  //#region  Form

  saveFormRef = formRef => {
    if (formRef) this.formRef = formRef.props.form;
  };

  handleOk = async e => {
    this.formRef.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.form).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await ClientService.create(this.state.form);
            this.setState({
              openForm: false,
              form: {},
              editMode: false
            });
            flashWithSuccess();
            this.formRef.resetFields();
            this.initializeList();
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um cliente", err);
          }
        } else {
          try {
            const updated = await ClientService.update(this.state.form);
            this.setState({
              openForm: false,
              form: {},
              editMode: false
            });
            flashWithSuccess();
            this.formRef.resetFields();
            this.initializeList();
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um cliente ", err);
          }
        }
      }
    });
  };

  closeForm = e => {
    this.setState(prev => ({
      ...prev,
      openForm: false,
      form: {},
      editMode: false
    }));

    this.formRef.resetFields();
  };

  handleFormState = event => {
    let form = Object.assign({}, this.state.form, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, form }));
  };

  openForm = editData => {
    this.setState(prev => ({
      ...prev,
      openForm: true,
      editMode: editData ? true : false,
      form: editData || {}
    }));
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await ClientService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O cliente, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um cliente", err);
    }
  };
  //#endregion

  changeStatus = async (id, newStatus) => {
    try {
      await ClientService.changeStatus(id, newStatus);

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
        `O cliente, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do cliente", err);
    }
  };

  tableConfig = () => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      render: text => text
    },
    {
      title: "CPF / CNPJ",
      dataIndex: "cpf_cnpj",
      key: "cpf_cnpj",
      render: text => text
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
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
            title={`Tem certeza em ${statusTxt} o cliente?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title={`${statusTxt.toUpperCase()} o cliente`}>
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
            <Button size="small" onClick={() => this.openForm(record)}>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir o cliente?`}
              onConfirm={e => this.removeRecord(record)}
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
            <Tooltip title="Veja as propriedades do cliente">
              <Button size="small">
                <FontAwesomeIcon icon="list" size="lg" />
              </Button>
            </Tooltip>
          </span>
        );
      }
    }
  ];

  render() {
    return (
      <Fragment>
        <div style={{ display: this.state.openForm ? "none" : "block" }}>
          <PainelHeader title="Clientes">
            <Button
              type="primary"
              icon="plus"
              onClick={() => this.openForm(null)}
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

        <Form
          wrappedComponentRef={this.saveFormRef}
          formData={this.state.form}
          handleFormState={this.handleFormState}
          openForm={this.state.openForm}
          closeForm={this.closeForm}
          saveForm={this.handleOk}
        />
      </Fragment>
    );
  }
}

export default Clients;
