import React, { Component } from "react";
import { Button, Icon, Input, Form, Affix } from "antd";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as CompanyService from "../../../services/companies";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";

class CompanyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {}
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await CompanyService.get(id);

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
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    await this.getDatabase();
    await this.setStatus();

    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await CompanyService.create(this.state.formData);
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
            // else this.props.history.push("/empresas");
            this.props.history.push("/empresas/" + created._id + "/filiais");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma empresa", err);
          }
        } else {
          try {
            const updated = await CompanyService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/empresas");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma empresa ", err);
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
              : "/empresas"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Empresa" : "Nova Empresa"}>
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Empresa
            </Button>
          </PainelHeader>
        </Affix>

        <Form onChange={this.handleFormState}>
          <Form.Item label="Razão Social" {...formItemLayout}>
            {getFieldDecorator("razao_social", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.razao_social
            })(
              <Input
                name="razao_social"
                ref={input => (this.titleInput = input)}
              />
            )}
          </Form.Item>

          <Form.Item label="Nome Fantasia" {...formItemLayout}>
            {getFieldDecorator("nome_fantasia", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome_fantasia
            })(<Input name="nome_fantasia" />)}
          </Form.Item>

          <Form.Item label="CPF/CNPJ" {...formItemLayout}>
            {getFieldDecorator("cpf_cnpj", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cpf_cnpj
            })(<Input name="cpf_cnpj" />)}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepCompanyForm = Form.create()(CompanyForm);

export default WrappepCompanyForm;
