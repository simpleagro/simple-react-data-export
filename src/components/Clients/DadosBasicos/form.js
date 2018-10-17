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

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as ClientService from "../../../services/clients";

const Option = Select.Option;
const Step = Steps.Step;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class ClientForm extends Component {
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
      const formData = await ClientService.get(id);

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
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await ClientService.create(this.state.formData);
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
            // else this.props.history.push("/clientes");
            this.props.history.push(
              "/clientes/" + created._id + "/propriedades"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um cliente", err);
          }
        } else {
          try {
            const updated = await ClientService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/clientes");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um cliente ", err);
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
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button
              href={
                this.props.location.state && this.props.location.state.returnTo
                  ? this.props.location.state.returnTo.pathname
                  : "/clientes"
              }
            >
              <Icon type="arrow-left" />
              Voltar para tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Cliente" : "Novo Cliente"}
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Cliente
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

          <Form.Item label="Tipo do Cliente" {...formItemLayout}>
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
                <Option value="PRODUTOR">Produtor</Option>
                <Option value="COOPERADO">Cooperado</Option>
                <Option value="DISTRIBUIDOR">Distribuidor</Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item label="CPF / CNPJ" {...formItemLayout}>
            {getFieldDecorator("cpf_cnpj", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cpf_cnpj
            })(<Input name="cpf_cnpj" />)}
          </Form.Item>

          <Form.Item label="Tel. Fixo" {...formItemLayout}>
            {getFieldDecorator("tel_fixo", {
              initialValue: this.state.formData.tel_fixo
            })(<Input name="tel_fixo" />)}
          </Form.Item>

          <Form.Item label="Tel. Cel." {...formItemLayout}>
            {getFieldDecorator("tel_cel", {
              initialValue: this.state.formData.tel_cel
            })(<Input name="tel_cel" />)}
          </Form.Item>

          <Form.Item label="Email" {...formItemLayout}>
            {getFieldDecorator("email", {
              initialValue: this.state.formData.email
            })(<Input name="email" />)}
          </Form.Item>

          <Form.Item label="Lim. Crédito" {...formItemLayout}>
            {getFieldDecorator("credito", {
              // rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.credito
            })(<Input name="credito" />)}
          </Form.Item>
          
        </Form>
      </div>
    );
  }
}

const WrappepClientForm = Form.create()(ClientForm);

export default WrappepClientForm;
