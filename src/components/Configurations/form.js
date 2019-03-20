
import React, { Component } from "react";
import ModalForm from "./modal";
import "moment/locale/pt-br";

import { Button, Input, Form, Affix, Icon, Divider, Popconfirm, Card } from "antd";

import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { PainelHeader } from "common/PainelHeader";
import * as ConfigurationService from "services/configurations";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import SimpleTable from "common/SimpleTable"

class ConfigurationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false,
      loadingData: true
    };
  }

  async initializeList(aqp) {
    this.setState({
      loadingData: false
    });
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await ConfigurationService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }


    await this.initializeList();
  }

  removeRecord = async ({ _id, rules }) => {
    try {
      await ConfigurationService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A configuração, ${rules.label}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma tabela de preço", err);
    }
  };

  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      editMode: !!record
    });
  }

  handleFormState = event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            await ConfigurationService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            // if (this.props.location.state && this.props.location.state.returnTo)
            //   this.props.history.push(this.props.location.state.returnTo);
            // else this.props.history.push("/configuracoes");
            this.props.history.push("/configuracoes");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar a configuração", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await ConfigurationService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/configuracoes");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar a configuração ", err);
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  tableConfig = () => [
    {
      title: "Label",
      dataIndex: "label",
      key: "label"
    },
    {
      title: "Key",
      dataIndex: "key",
      key: "key"
    },
    {
      title: "Ações",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() => this.showModal(record)}>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>

            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Popconfirm
              title={`Tem certeza em excluir o tipo de venda?`}
              onConfirm={() => [this.removeRecord(record), console.log("record:", record)]}
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

  handleOk = async (item) => {
    this.setState({ savingForm: true });
    if (!this.state.editMode) {

      try {
        const created = await ConfigurationService.create(item);

        this.setState(prev => {
          if(prev.rules.length > 0){
            return({
              openForm: false,
              editMode: false,
              visible: false,
              //rules: [...prev.rules,created],
              formData: {
                rules: [...prev.rules,created]
              }
            })
          }
          return({
            openForm: false,
            editMode: false,
            visible: false,
            //rules: [created],
            formData: {
              rules: [created]
            }
          })
        });
        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao adicionar uma tabela de preço", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const tabela_updade = Object.assign({}, item);
        delete tabela_updade.grupo_produto;

        const updated = await ConfigurationService.update(tabela_updade);
        const data = await ConfigurationService.list();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          rules: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar uma tabela de preço", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visibleGroup: false
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <div>
        <SimpleBreadCrumb
          to={"/configuracoes"}
          history={this.props.history}
        />

        <ModalForm
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Configuração" : "Nova Configuração"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Configuração
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>

          <Form.Item label="Tela">
            {getFieldDecorator("screen", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.screen
            })(<Input name="screen" style={{ width: 400 }} autoFocus />)}
          </Form.Item>

          <Form.Item label="">
            <Card
              title="Regras"
              extra={<Button style={{ marginRight: 150 }} type="primary" onClick={() => this.showModal()} > + </Button>}
            >
              <SimpleTable
                rowKey="_id"
                columns={this.tableConfig()}
                dataSource={this.state.formData.rules}
                spinning={this.state.loadingData}
                scroll={{ x: false }}
              />
            </Card>
          </Form.Item>

        </Form>
        {[
          console.log("\nForm > State: ", this.state),
          // console.log("Form > Props: ", this.props)
        ]}
      </div>
    );
  }
}

const WrappepConfigurationForm = Form.create()(ConfigurationForm);

export default WrappepConfigurationForm;
