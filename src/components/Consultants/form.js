import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Select,
  Affix,
  Steps
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as ConsultantsService from "../../services/consultants";
import * as UsersService from "../../services/users";

const Option = Select.Option;
const Step = Steps.Step;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class ConsultantForm extends Component {
 
  constructor(props) {
    
    super(props);
    this.state = {
      editMode: false,
      formData: {}
    };
  }

  async componentDidMount() {

    const { id } = this.props.match.params;
    const dataConsultants = await ConsultantsService.list();
    const dataUsers = await UsersService.list({limit: 999999999});

    this.setState(prev => ({ 
      ...prev, 
      listCargo: 
      dataConsultants.docs, 
      listUser: dataUsers.docs, 
    }));

    if (id) {
      const formData = await ConsultantsService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          listCargo: dataConsultants.docs,
          listUser: dataUsers.docs,
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

    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await ConsultantsService.create(this.state.formData);
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
            this.props.history.push(
              "/consultores/"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um consultor", err);
          }
        } else {
          try {
            const updated = await ConsultantsService.update(this.state.formData);
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
          }
        }
      }
    });
  };

  setUser = nome => {
    this.state.listUser.map((fDNome) =>
      fDNome.nome === nome && !this.state.editMode
        ? this.setState({ formData: {
            nome: fDNome.nome,
            email: fDNome.email,
            usuario_id: fDNome.nome
          }}
        ) : null )
  }

  setLogin = email => {
    const emailRegex = /[@][a-z0-9-_]+[.com]+[.br]*/g;
    let userLogin = email.split(emailRegex).join("");
    
    this.setState((prevState) => ({ 
      formData: {
        login: userLogin, 
        ...prevState.formData
      } 
    }))
  }

  removeGerent = (cargo) => {
    if(cargo === "GERENTE"){
      this.setState((prevState) => ({
        formData: {
          gerente_id: "Novo Gerente",
          ...prevState.formData
        }
      }))
      console.log(">Removendo: ", cargo)

    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <div>
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button
              href={
                this.props.location.state && this.props.location.state.returnTo
                  ? this.props.location.state.returnTo.pathname
                  : "/consultores"
              }
            >
              <Icon type="arrow-left" />
              Voltar para tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Consultor" : "Novo Consultor"}
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar consultor
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>

          <Form.Item label="Usuário" {...formItemLayout}>
            {getFieldDecorator("usuario_id", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(
              <Select
                name="usuario_id"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um usuário..."
                onChange={e =>
                  (this.handleFormState({
                    target: { name: "usuario_id", value: e }
                  }), this.setUser(e))
                }
              >
                { this.state.listUser 
                  && this.state.listUser.map((user, index) => 
                    <Option key={index} value={user.nome}> {user.nome} </Option>)
                }
              </Select>
            )}
          </Form.Item>

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

          {!this.state.editMode && <Form.Item label="Login" {...formItemLayout}>
            {getFieldDecorator("login", {
              rules: [{required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.login
            })(<Input name="login" onFocus={() => this.setLogin(this.state.formData.email)} />)}
          </Form.Item>}

          {!this.state.editMode && <Form.Item label="Tipo de Login" {...formItemLayout}>
            {getFieldDecorator("tipoLogin", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: "API"
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
                }
              >
                <Option value="API">API</Option>
                <Option value="AD">AD</Option>
              </Select>
            )}
          </Form.Item>}

          <Form.Item label="Senha" {...formItemLayout}>
            {getFieldDecorator("senha", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.senha
            })(<Input name="senha" />)}
          </Form.Item>

          <Form.Item label="Contato" {...formItemLayout}>
            {getFieldDecorator("contato", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.contato
            })(<Input name="contato" />)}
          </Form.Item>

          <Form.Item label="Cargo" {...formItemLayout}>
            {getFieldDecorator("cargo", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cargo
            })(
              <Select
                name="cargo"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 330 }}
                placeholder="Selecione um cargo..."
                //mode="multiple"
                onChange={e =>
                  (this.handleFormState({
                    target: { name: "cargo", value: e }
                  }), this.removeGerent(e) )
                }
              >
                <Option value="CONSULTOR">Consultor</Option>
                <Option value="GERENTE">Gerente</Option>
                <Option value="AP">AP</Option>
                <Option value="ATS">ATS</Option>
              </Select>
            )}
          </Form.Item>

          {this.state.formData.cargo !== "GERENTE" && <Form.Item label="Gerente" {...formItemLayout}>
            {getFieldDecorator("gerente_id", {
              rules: [{ required: this.state.formData.cargo === "GERENTE" ? false : true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cargo === "GERENTE" ? null : this.state.formData.gerente_id
            })(
              <Select                
                disabled={this.state.formData.cargo === "GERENTE" ? true : false}
                name="gerente_id"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um gerente..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "gerente_id", value: e }
                  })
                }
              > 
                { this.state.listCargo
                    && this.state.listCargo.map((cargo, index) => cargo.cargo === "GERENTE" 
                         && <Option key={index} value={cargo.nome}> {cargo.nome} </Option>)
                }
              </Select>
            )}
          </Form.Item>}

          <Form.Item label="Tipo" {...formItemLayout}>
            {getFieldDecorator("tipo", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
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
                }
              >
                <Option value="PRODUCAO">Produção</Option>
                <Option value="COMERCIAL">Comercial</Option>
              </Select>
            )}
          </Form.Item>
          { console.log(this.state.formData) }
        </Form>
      </div>
    );
  }
}

const WrappepConsultantForm = Form.create()(ConsultantForm);

export default WrappepConsultantForm;
