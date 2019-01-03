import React, { Component } from "react";
import { Button, Input, Form, Affix, Card } from "antd";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as GroupService from "../../../services/productgroups";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import CamposExtras from "./camposExtras";
import RegraPreco from './regraPreco'

class GroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false,
      loadingData: false,
      visible: false,
      visibleRegraPreco: false
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await GroupService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  handleFormState = event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    // await this.getDatabase();
    //console.log(this.state.formData);
    await this.setStatus();

    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await GroupService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            this.props.history.push("/grupos-produtos/" + created._id + "/caracteristicas-produtos");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um grupo de produto", err);
          } finally {
            this.setState({ savingForm: false });
          }
        } else {
          try {
            const updated = await GroupService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/grupos-produtos");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um grupo de produto ", err);
          } finally {
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

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


  changeStatusFields = async (id, newStatus, chave) => {
    try {
      //await GroupService.changeStatus(id, newStatus);
      let recordName = "";

      let _fields = this.state.formData.fields.map(item => {
        if (item.chave === chave) {
          item.status = newStatus;
          recordName = item.label;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        formData: {...prev.formData, fields: _fields }
      }));

      flashWithSuccess(
        "",
        `O campo extra, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do campo extra", err);
    }
  };

  changeStatusPreco = async (id, newStatus, chave) => {
    try {
      //await GroupService.changeStatus(id, newStatus);
      let recordName = "";

      let _preco_base_regra = this.state.formData.preco_base_regra.map(item => {
        if (item.chave === chave) {
          item.status = newStatus;
          recordName = item.label;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        formData: {...prev.formData, preco_base_regra: _preco_base_regra }
      }));

      flashWithSuccess(
        "",
        `A regra de preço, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da regra de preço base", err);
    }
  };

  removeRecordFields = (record) => {
    if (record) {
      this.setState(prev => {
        if(prev.formData.fields)
          return ({
            formData: {...prev.formData, fields: prev.formData.fields.filter(item => item.chave !== record.chave) }
          })
      });
    }
  }

  removeRecordPreco = (record) => {
    if (record) {
      this.setState(prev => {
        if(prev.formData.preco_base_regra)
          return ({
            formData: {...prev.formData, preco_base_regra: prev.formData.preco_base_regra.filter(item => item.chave !== record.chave) }
          })
      });
    }
  }

  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      editarField: !!record
    });
  }

  showModalRegraPreco = (record) => {
    this.setState({
      visibleRegraPreco: true,
      record,
      editarField: !!record
    });
  }

  handleOkFields = (item) => {
    this.setState(prev => {
      if(prev.formData.fields){
        const dados = prev.formData;
        if(this.state.editarField){
          dados.fields = dados.fields.filter(dado => dado != this.state.record)
        }
        return ({
          visible: false,
          formData: {...dados, fields: [...prev.formData.fields, item]},
          editarField: false
        })
      }

      return( {
        visible: false,
        formData: {...prev.formData, fields: [item]},
        editarField: false
      })
    });
  }

  handleOkPreco = (item) => {
    this.setState(prev => {
      if(prev.formData.preco_base_regra){
        const dados = prev.formData;
        if(this.state.editarField){
          dados.preco_base_regra = dados.preco_base_regra.filter(dado => dado != this.state.record)
        }
        return ({
          visibleRegraPreco: false,
          formData: {...dados, preco_base_regra: [...prev.formData.preco_base_regra, item]},
          editarField: false
        })
      }

      return( {
        visibleRegraPreco: false,
        formData: {...prev.formData, preco_base_regra: [item]},
        editarField: false
      })
    });
  }

  handleCancel = (e) => {
    //console.log(e);
    this.setState({
      visible: false,
      visibleRegraPreco: false
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
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
          to={
            this.props.location.state && this.props.location.state.returnTo
              ? this.props.location.state.returnTo.pathname
              : "/grupos-produtos"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Grupo de Produto" : "Novo Grupo de Produto"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Grupo de Produto
            </Button>
          </PainelHeader>
        </Affix>

        <Form onChange={this.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(
              <Input
                name="nome"
                ref={input => (this.titleInput = input)}
              />
            )}
          </Form.Item>

        </Form>

        <CamposExtras
          showModal={this.showModal}
          loadingData= {this.state.loadingData}
          changeStatus={this.changeStatusFields}
          removeRecord={this.removeRecordFields}
          formData={this.state.formData}
          visible={this.state.visible}
          handleCancel={this.handleCancel}
          handleOk={this.handleOkFields}
          saveFormRef={this.saveFormRef}
          record={this.state.record}
          titleCard="Campos Extras"
        />

        <RegraPreco
          showModal={this.showModalRegraPreco}
          loadingData= {this.state.loadingData}
          changeStatus={this.changeStatusPreco}
          removeRecord={this.removeRecordPreco}
          formData={this.state.formData}
          visible={this.state.visibleRegraPreco}
          handleCancel={this.handleCancel}
          handleOk={this.handleOkPreco}
          saveFormRef={this.saveFormRef}
          record={this.state.record}
        />

      </div>
    );
  }
}

const WrappepGroupForm = Form.create()(GroupForm);

export default WrappepGroupForm;
