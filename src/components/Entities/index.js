import React, { Component } from 'react';
import { Row, Col, Divider, Button, Icon, Modal } from 'antd';

import * as EntidadeService from "../../services/entities";
import SimpleTable from "../common/SimpleTable";
import EntidadeForm from './form';
import { flashWithSuccess } from "../common/FlashMessages";

class Entidades extends Component {

  constructor(props) {
    super(props);
    this.state = {
      entidades: [],
      loadingData: true,
      editMode: false,
      modalVisible: false,
      pagination: false,
      form: {}
    };
  }

  initializeList() {
    this.setState(...this.state, { loadingData: true });
    setTimeout(() => {
      EntidadeService.list().then(data => {
        this.setState(...this.state, {
          entidades: data,
          loadingData: false,
          pagination: data.lenght > 10
        });
      });
    }, 1000);
  }

  componentDidMount() {
    this.initializeList();
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
            modalVisible: false,
            entidades: [...this.state.entidades, this.state.form],
            form: {}
          });
        } else {
          // let _data = this.state.entidades.map((item) => {
          //   if (item.id === this.state.form.id) {
          //     item = this.state.form;
          //   }
          //   return item;
          // });

          EntidadeService.update(this.state.form).then(response => {
            this.initializeList();
            this.setState({
              modalVisible: false,
              form: {}
            });
            flashWithSuccess();
          });
        }
      }
    });

    this.setState({
      modalVisible: false,
      form: {}
    });
  };

  handleCancel = e => {
    this.setState({
      modalVisible: false,
      form: {}
    });
  };

  handleFormState = event => {
    let form = Object.assign({}, this.state.form, {
      [event.target.name]: event.target.value
    });
    this.setState({ form });
  };

  showModal = editData => {
    this.setState(...this.state, {
      modalVisible: true,
      editMode: editData ? true : false,
      form: editData || {}
    });
  };
  //#endregion

  render() {
    const columns = [
      {
        title: "Nome",
        dataIndex: "nome",
        render: text => text
      },
      {
        title: "Descrição",
        dataIndex: "descricao",
        render: text => text
      },
      {
        title: "",
        dataIndex: "action",
        render: (text, record) => {
          return (
            <span>
              <Button size="small" onClick={() => this.showModal(record)}>
                <Icon type="edit" style={{ fontSize: "16px" }} />
              </Button>
              <Divider
                style={{ fontSize: "10px", padding: 0, margin: 2 }}
                type="vertical"
              />
              <Button size="small" onClick={this.showModal}>
                <Icon type="delete" style={{ fontSize: "16px" }} />
              </Button>
            </span>
          );
        }
      }
    ];

    return (
      <div>
        <Row type="flex" justify="space-between">
          <Col>
            <h3 style={{ fontWeight: 400 }}>Entidades</h3>
          </Col>
          <Col>
            <Button
              type="primary"
              icon="plus"
              onClick={() => this.showModal(null)}
            >
              Adicionar
            </Button>
          </Col>
          <Divider />
          <SimpleTable
            pagination={this.state.pagination}
            spinning={this.state.loadingData}
            rowKey="_id"
            columns={columns}
            dataSource={this.state.entidades}
          />
        </Row>
        <Modal
          bodyStyle={{ overflow: "scroll", height: "50vh" }}
          width="99vmax"
          destroyOnClose={true}
          title={this.state.editMode ? "Editando Registro" : "Novo Registro"}
          visible={this.state.modalVisible}
          onCancel={this.handleCancel}
          footer={
            <Button type="primary" icon="save" onClick={this.handleOk}>
              Salvar
            </Button>
          }
        >
          <EntidadeForm
            wrappedComponentRef={this.saveFormRef}
            formData={this.state.form}
            handleFormState={this.handleFormState}
          />
        </Modal>
      </div>
    );
  }
}

export default Entidades;
