import React, { Component } from "react";
import { Button, Input, Form, Select, Affix } from "antd";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as UsersService from "../../services/users";
import { list as RulesListService } from "../../services/rules";
import { list as BranchsListService } from "../../services/companies.branchs";
import { SimpleBreadCrumb } from "../common/SimpleBreadCrumb";
const Option = Select.Option;

class UserForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      filiais: [],
      rules: []
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    const rules = await RulesListService({ limit: -1, fields: "nome" });

    const { empresa } = JSON.parse(
      localStorage.getItem("simpleagro_painel")
    ).painelState.userData;

    const filiais = await BranchsListService(empresa)({
      limit: -1,
      fields: "filiais.nome_fantasia, filiais._id"
    });

    if (id) {
      const formData = await UsersService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }

    this.setState(prev => ({
      ...prev,
      rules,
      filiais: filiais.docs
    }));

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
    await this.validateLogin(this.state.formData.login);

    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            await UsersService.create(this.state.formData);
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
            // else this.props.history.push("/usuarios");
            this.props.history.push("/usuarios/");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um usuário", err);
          }
        } else {
          try {
            await UsersService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/usuarios");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um usuário ", err);
          }
        }
      }
    });
  };

  validateLogin = async login => {
    let newLogin = login
      .split(" ")
      .join(".")
      .toLowerCase();
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        login: newLogin
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
              : "/usuarios"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Usuário" : "Novo Usuário"}>
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Usuário
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" ref={input => (this.titleInput = input)} />)}
          </Form.Item>

          <Form.Item label="Email" {...formItemLayout}>
            {getFieldDecorator("email", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.email
            })(<Input name="email" />)}
          </Form.Item>

          <Form.Item label="Login" {...formItemLayout}>
            {getFieldDecorator("login", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.login
            })(<Input name="login" />)}
          </Form.Item>

          <Form.Item label="Filial" {...formItemLayout}>
            {getFieldDecorator("filiais", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.filiais
            })(
              <Select
                name="filiais"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                mode="multiple"
                placeholder="Selecione uma filial..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "filiais", value: e }
                  })
                }>
                {this.state.filiais &&
                  this.state.filiais.map((f, idx) => (
                    <Option value={f._id} key={f._id}>{f.nome_fantasia}</Option>
                  ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Tipo de Login" {...formItemLayout}>
            {getFieldDecorator("tipoLogin", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.tipoLogin || "API"
            })(
              <Select
                name="tipoLogin"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um tipo de Login..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "tipoLogin", value: e }
                  })
                }>
                <Option value="API">API</Option>
                <Option value="AD">AD</Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Grupo de Permissão" {...formItemLayout}>
            {getFieldDecorator("grupo_id", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.grupo_id
            })(
              <Select
                name="grupo_id"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um grupo de permissão..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "grupo_id", value: e }
                  })
                }>
                {this.state.rules &&
                  this.state.rules.map(r => (
                    <Option key={r._id} value={r._id}>
                      {r.nome}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            label="Senha"
            {...formItemLayout}
            help={
              this.state.editMode
                ? "Caso seja necessário trocar a senha, informe uma nova aqui."
                : ""
            }>
            {getFieldDecorator("senha", {
              rules: [
                { required: false, message: "Este campo é obrigatório!" }
              ],
              initialValue: this.state.formData.senha
            })(<Input name="senha" />)}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepUserForm = Form.create()(UserForm);

export default WrappepUserForm;
