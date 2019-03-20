import React, { Component } from "react";
import { Button, Input, Form, Affix } from "antd";

import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { PainelHeader } from "common/PainelHeader";
import * as ProvidersService from "services/providers";

class ProvidersForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const dataType = await ProvidersService.list();

    this.setState(prev => ({
      ...prev,
      listType: dataType
    }));

    if (id) {
      const formData = await ProvidersService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          listType: dataType
        }));
    }
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
            await ProvidersService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();

            this.props.history.push("/fornecedores");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um fornecedor", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await ProvidersService.update(this.state.formData);
            flashWithSuccess();

            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/fornecedores");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um fornecedor", err);
            this.setState({ savingForm: false });
          }
        }
      }
    });
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
              : "/fornecedores"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={[
              this.state.editMode ? "Editando" : "Novo",
              " Fornecedor"
            ]}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Fornecedor
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
                autoFocus
              />
            )}
          </Form.Item>

          <Form.Item label="Nome Fantasia" {...formItemLayout}>
            {getFieldDecorator("nome_fantasia", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome_fantasia
            })(
              <Input
                name="nome_fantasia"
              />
            )}
          </Form.Item>

          <Form.Item label="CPF/CNPJ" {...formItemLayout}>
            {getFieldDecorator("cpf_cnpj", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cpf_cnpj
            })(
              <Input
                name="cpf_cnpj"
              />
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepProvidersForm = Form.create()(ProvidersForm);

export default WrappepProvidersForm;
