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
    const dataUsers = await UsersService.list({limit: 9999999});

    this.setState(prev => ({ ...prev, listCargo: dataConsultants.docs, listUser: dataUsers.docs, isGerent: false }));

    if (id) {
      const formData = await ConsultantsService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          listCargo: dataConsultants.docs,
          listUser: dataUsers.docs,
          isGerent: false
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
    //this.createNewUser(event.target)
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
    console.log(this.state)
    this.state.listUser.map((fDNome) =>
      fDNome.nome === nome
        ? this.setState({ formData: {
            nome: fDNome.nome,
            email: fDNome.email,
            usuario_id: fDNome.nome
          }}
        ) : null )
  }

  createNewUser(ev){

   if ((ev.name === "nome") && (!this.state.editMode))
      this.setState(prev => ({ ...prev, formData: {usuario_id: ev.value}}))

    console.log(this.state)
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
              initialValue: this.state.formData.usuario_id
            })(
              <Select
                name="usuario_id"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um usuário..."
                onChange={e =>
                  (this.handleFormState({
                    target: { name: "usuario_id", value: e }
                  }), this.setUser(e))
                  //}))
                }
              >
                { this.state.listUser
                  ? this.state.listUser.map((user, index) =>
                    <Option key={index} value={user.nome}> {user.nome} </Option>)
                  : null
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

          <Form.Item label="Senha" {...formItemLayout}>
            {getFieldDecorator("senha", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
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
              initialValue: this.state.formData.cargo[0]
            })(
              <Select
                name="cargo"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um cargo..."
                onChange={e =>
                  (this.handleFormState({
                    target: { name: "cargo", value: e }
                  }),
                  e === "GERENTE" ? this.setState({ isGerent: true }) : this.setState({ isGerent: false }) )
                }
              >
                <Option value="CONSULTOR">Consultor</Option>
                <Option value="GERENTE">Gerente</Option>
                <Option value="AP">AP</Option>
                <Option value="ATS">ATS</Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Gerente" {...formItemLayout}>
            {getFieldDecorator("gerente_id", {
              initialValue: this.state.isGerent ? null : this.state.formData.gerente_id,
              rules: [{ required: this.state.formData.cargo && this.state.formData.cargo.includes("GERENTE") ? false : true, message: "Este campo é obrigatório!" }]
            })(
              <Select
                disabled={this.state.formData.cargo && this.state.formData.cargo.includes("GERENTE") ? true : false}
                name="gerente"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                mode="multiple"
                placeholder="Selecione um gerente..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "gerente_id", value: e }
                  })
                }
              >
                { this.state.listCargo
                  ? this.state.listCargo.map((cargo, index) =>
                  cargo.cargo && cargo.cargo.includes("GERENTE") && !this.state.isGerent
                      ? <Option key={index} value={cargo.nome}>{cargo.nome}</Option>
                      : "" )
                  : ""
                }
              </Select>
            )}
          </Form.Item>

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
        </Form>
      </div>
    );
  }
}

const WrappepConsultantForm = Form.create()(ConsultantForm);

export default WrappepConsultantForm;
