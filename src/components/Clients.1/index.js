import React, { Component, Fragment } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, message } from "antd";

import * as ClientService from "../../services/clients";
import SimpleTable from "../SimpleTable";
import Form from "./form";
import { flashWithSuccess } from "../FlashMessages";
import { PainelHeader } from "../PainelHeader";

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

    await this.setState(previousState => {
      return {
        ...previousState,
        list: data,
        loadingData: false,
        pagination: data.lenght > 10
      };
    });
  }

  async componentDidMount() {
    await this.initializeList();
  }

  saveFormRef = formRef => {
    if (formRef) this.formValidate = formRef.props.form;
  };

  //#region  Modal
  handleOk = e => {
    this.formValidate.validateFields(err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          this.setState({
            openForm: false,
            list: [...this.state.list, this.state.form],
            form: {}
          });
        } else {
          ClientService.update(this.state.form).then(response => {
            this.initializeList();
            this.setState({
              openForm: false,
              form: {}
            });
            flashWithSuccess();
          });
        }
      }
    });

    this.setState({
      openForm: false,
      form: {}
    });
  };

  closeForm = e => {
    this.setState(prev => ({
      ...prev,
      openForm: false,
      form: {}
    }));
  };

  handleFormState = event => {
    let form = Object.assign({}, this.state.form, {
      [event.target.name]: event.target.value
    });
    this.setState({ form });
  };

  openForm = editData => {
    this.setState(prev => ({
      ...prev,
      openForm: true,
      editMode: editData ? true : false,
      form: editData || {}
    }));
  };
  //#endregion

  changeStatus = async (id, newStatus) => {
    await ClientService.changeStatus(id, newStatus);
    await this.initializeList();
    message.success("Alterado com sucesso");
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
            <Button size="small">
              <FontAwesomeIcon icon={statusBtn} size="lg" />
            </Button>
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
            <Button size="small" onClick={this.openForm}>
              <Icon type="delete" style={{ fontSize: "16px" }} />
            </Button>
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
        />
      </Fragment>
    );
  }
}

export default Clients;
