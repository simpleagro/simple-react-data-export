import React, { Component } from "react";
import { Button, Input, Form, Select, Affix, Checkbox } from "antd";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as ConsultantsService from "../../services/consultants";
import * as UsersService from "../../services/users";
import * as SalesmanService from "../../services/salesman-types";
import { SimpleBreadCrumb } from "../common/SimpleBreadCrumb";
import { SimpleLazyLoader } from "../common/SimpleLazyLoader";
import { list as RulesListService } from "../../services/rules";
import { list as BranchsListService } from "../../services/companies.branchs";

const Option = Select.Option;

class ConsultantForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      loadingForm: true,
      editMode: false,
      formData: {},
      userHasSelected: false,
      savingForm: false,
      filiais: [],
      rules: []
    };
  }

  async componentDidMount() {
    try {
      const { id } = this.props.match.params;

      if (id) {
        const formData = await ConsultantsService.get(id);

        if (formData)
          this.setState(prev => ({
            ...prev,
            formData,
            editMode: id ? true : false
          }));
      }

      const dataConsultants = await ConsultantsService.list({
        limit: -1,
        fields: "cargo, _id, nome"
      });
      const dataUsers = await UsersService.list({
        limit: -1,
        fields: "nome, _id, email, login, tipoLogin, grupo_id, filiais"
      });
      const dataSalesman = await SalesmanService.list();
      const rules = await RulesListService({ limit: -1, fields: "nome" });

      const { empresa } = JSON.parse(
        localStorage.getItem("simpleagro_painel")
      ).painelState.userData;

      const filiais = await BranchsListService(empresa)({
        limit: -1,
        fields: "nome_fantasia"
      });

      this.setState(prev => ({
        ...prev,
        listCargo: dataConsultants.docs,
        listUser: dataUsers.docs,
        listSalesman: dataSalesman.docs,
        rules: rules.docs,
        filiais: filiais.docs
      }));

      setTimeout(() => {
        this.titleInput.focus();
      }, 0);
    } catch (error) {
      // if (error && error.response && error.response.data) parseErrors(error);
    } finally {
      this.setState(prev => ({
        ...prev,
        loadingForm: false
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
            await ConsultantsService.create(this.state.formData);
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
            // else this.props.history.push("/consultores");
            this.props.history.push("/consultores/");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um consultor", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await ConsultantsService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/consultores");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um consultor ", err);
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  setUser = usuario_id => {
    let idx = -1;
    let user = null;
    this.state.listUser.some((u, index) => {
      if (u._id === usuario_id) {
        user = u;
        return true;
      }
    });

    if (!this.state.editMode) {
      user &&
        this.setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            nome: user.nome,
            email: user.email,
            login: user.login,
            tipoLogin: user.tipoLogin,
            grupo_id: user.grupo_id._id,
            filiais: user.filiais
          },
          userHasSelected: true
        }));

      !user &&
        this.setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            nome: "",
            email: "",
            login: "",
            tipoLogin: "",
            grupo_id: null,
            filiais: []
          },
          userHasSelected: false
        }));
    }
  };

  toggleChecked = () => {
    this.setState({ checked: !this.state.checked });
  };

  setLogin = email => {
    if (!email) return;
    const emailRegex = /[@][a-z0-9-_]+[.com]+[.br]*/g;
    let userLogin = email.split(emailRegex).join("");

    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        login: userLogin
      }
    }));
  };

  removeGerent = cargo => {
    if (cargo === "GERENTE") {
      this.setState(prevState => ({
        formData: {
          ...prevState.formData,
          gerente_id: null
        }
      }));
      this.props.form.setFields({ gerente_id: "" });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <SimpleLazyLoader loadingForm={this.state.loadingForm}>
        <div>
          <SimpleBreadCrumb
            to={
              this.props.location.state && this.props.location.state.returnTo
                ? this.props.location.state.returnTo.pathname
                : "/consultores"
            }
            history={this.props.history}
          />
          <Affix offsetTop={65}>
            <PainelHeader
              title={
                this.state.editMode ? "Editando Consultor" : "Novo Consultor"
              }>
              <Button
                type="primary"
                icon="save"
                onClick={() => this.saveForm()}
                loading={this.state.savingForm}>
                Salvar Consultor
              </Button>
            </PainelHeader>
          </Affix>
          <Form onChange={this.handleFormState}>
            <Form.Item label="Usuário" {...formItemLayout}>
              {getFieldDecorator("usuario_id", {
                rules: [
                  { required: false, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.usuario_id
              })(
                <Select
                  name="usuario_id"
                  allowClear
                  optionFilterProp="data-filter"
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Selecione um usuário..."
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "usuario_id", value: e }
                    });
                    this.setUser(e);
                  }}>
                  <Option key="sem_opcao" value="">
                    Sem opção
                  </Option>
                  {this.state.listUser &&
                    this.state.listUser.map((user, index) => (
                      <Option
                        data-filter={user.nome}
                        key={user._id}
                        value={user._id}>
                        {user.nome}
                      </Option>
                    ))}
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Nome" {...formItemLayout}>
              {getFieldDecorator("nome", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.nome
              })(
                <Input name="nome" ref={input => (this.titleInput = input)} />
              )}
            </Form.Item>

            <Form.Item label="Email" {...formItemLayout}>
              {getFieldDecorator("email", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.email
              })(<Input name="email" />)}
            </Form.Item>

            {!this.state.editMode && (
              <Form.Item label="Login" {...formItemLayout}>
                {getFieldDecorator("login", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.login
                })(
                  <Input
                    disabled={this.state.userHasSelected}
                    name="login"
                    onFocus={() => this.setLogin(this.state.formData.email)}
                  />
                )}
              </Form.Item>
            )}

            {!this.state.editMode && (
              <Form.Item
                label="Tipo de Login"
                {...formItemLayout}
                style={{
                  display: this.state.userHasSelected ? "none" : "block"
                }}>
                {getFieldDecorator("tipoLogin", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.tipoLogin,
                  defaultValue: "API"
                })(
                  <Select
                    disabled={this.state.userHasSelected}
                    name="tipoLogin"
                    showAction={["focus", "click"]}
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Selecione um tipo de Login..."
                    onChange={e => {
                      this.props.form.resetFields(['senha']);
                      this.handleFormState({
                        target: { name: "tipoLogin", value: e }
                      })
                    }
                    }>
                    <Option value="API">API</Option>
                    <Option value="AD">AD</Option>
                  </Select>
                )}
              </Form.Item>
            )}

            <Form.Item
              label="Senha"
              {...formItemLayout}
              style={{
                display:
                  this.state.userHasSelected ||
                  this.state.editMode ||
                  this.state.formData.tipoLogin !== "API"
                    ? "none"
                    : "block"
              }}>
              {getFieldDecorator("senha", {
                rules: [
                  {
                    required:
                      this.state.formData.tipoLogin === "API" ? true : false,
                    message: "Este campo é obrigatório!"
                  }
                ],
                initialValue: this.state.formData.senha
              })(<Input type="password" name="senha" />)}
            </Form.Item>

            {!this.state.editMode && (
              <Form.Item
                label="Filial"
                {...formItemLayout}
                style={{
                  display: this.state.userHasSelected ? "none" : "block"
                }}>
                {getFieldDecorator("filiais", {
                  initialValue: this.state.formData.filiais
                })(
                  <Select
                    disabled={this.state.userHasSelected}
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
                        <Option value={f._id} key={f._id}>
                          {f.nome_fantasia}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            )}

            {!this.state.editMode && (
              <Form.Item
                label="Grupo de Permissão"
                {...formItemLayout}
                style={{
                  display: this.state.userHasSelected ? "none" : "block"
                }}>
                {getFieldDecorator("grupo_id", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.grupo_id
                })(
                  <Select
                    disabled={this.state.userHasSelected}
                    optionFilterProp="data-filter"
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
                        <Option data-filter={r.nome} key={r._id} value={r._id}>
                          {r.nome}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            )}

            <Form.Item label="Contato" {...formItemLayout}>
              {getFieldDecorator("contato", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.contato
              })(<Input name="contato" />)}
            </Form.Item>

            <Form.Item label="Cargo" {...formItemLayout}>
              {getFieldDecorator("cargo", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.cargo
                  ? this.state.formData.cargo[0]
                  : ""
              })(
                <Select
                  name="cargo"
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 330 }}
                  placeholder="Selecione um cargo..."
                  //mode="multiple"
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "cargo", value: e }
                    });
                    this.removeGerent(e);
                  }}>
                  <Option value="CONSULTOR">Consultor</Option>
                  <Option value="GERENTE">Gerente</Option>
                  <Option value="AP">AP</Option>
                  <Option value="ATS">ATS</Option>
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Gerente" {...formItemLayout}>
              {getFieldDecorator("gerente_id", {
                rules: [
                  {
                    required:
                      this.state.formData.cargo &&
                      this.state.formData.cargo.includes("GERENTE")
                        ? false
                        : true,
                    message: "Este campo é obrigatório!"
                  }
                ],
                initialValue: this.state.isGerent
                  ? ""
                  : this.state.formData.gerente_id
              })(
                <Select
                  disabled={
                    this.state.formData.cargo &&
                    this.state.formData.cargo.includes("GERENTE")
                      ? true
                      : false
                  }
                  name="gerente_id"
                  optionFilterProp="data-filter"
                  allowClear
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Selecione um gerente..."
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "gerente_id", value: e }
                    })
                  }>
                  {this.state.listCargo &&
                    this.state.listCargo.map(
                      (cargo, index) =>
                        cargo.cargo &&
                        cargo.cargo.includes("GERENTE") && (
                          <Option
                            data-filter={cargo.nome}
                            key={index}
                            value={cargo._id}>
                            {cargo.nome}
                          </Option>
                        )
                    )}
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Tipo" {...formItemLayout}>
              {getFieldDecorator("tipo", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.tipo
              })(
                <Select
                  name="tipo"
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Selecione um tipo..."
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "tipo", value: e }
                    })
                  }>
                  <Option value="PRODUCAO">Produção</Option>
                  <Option value="COMERCIAL">Comercial</Option>
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Vendedor" {...formItemLayout}>
              {getFieldDecorator("vendedor", {
                initialValue: this.state.checked
              })(
                <Checkbox
                  name="vendedor"
                  onClick={this.toggleChecked}
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "vendedor", value: e }
                    });
                  }}
                />
              )}
            </Form.Item>

            {this.state.checked && (
              <Form.Item label="Tipo de Vendedor" {...formItemLayout}>
                {getFieldDecorator("tipo_vendedor_id", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.tipo_vendedor_id
                })(
                  <Select
                    name="tipo_vendedor_id"
                    allowClear
                    showAction={["focus", "click"]}
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Selecione um tipo de vendedor..."
                    onChange={e => {
                      this.handleFormState({
                        target: { name: "tipo_vendedor_id", value: e }
                      });
                    }}>
                    {this.state.listSalesman &&
                      this.state.listSalesman.map((salesman, index) => (
                        <Option key={salesman._id} value={salesman._id}>
                          {salesman.descricao}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            )}
          </Form>
        </div>
      </SimpleLazyLoader>
    );
  }
}

const WrappepConsultantForm = Form.create()(ConsultantForm);

export default WrappepConsultantForm;
