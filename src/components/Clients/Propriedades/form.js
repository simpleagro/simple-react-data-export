import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Select,
  Tabs,
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
          if (Object.keys(this.state.form).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await ClientService.create(this.state.form);
            this.setState({
              openForm: false,
              form: {},
              editMode: false
            });
            flashWithSuccess();
            this.formRef.resetFields();
            this.initializeList();
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um cliente", err);
          }
        } else {
          try {
            const updated = await ClientService.update(this.state.formData);
            flashWithSuccess();
            this.props.history.push("/clientes");
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
            <Button href="/clientes">
              <Icon type="arrow-left" />
              Voltar para a listagem de clientes
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <PainelHeader
          title={this.state.editMode ? "Editando Cliente" : "Novo Cliente"}
          extra={
            <Steps current={0} progressDot>
              <Step title="Dados do Cliente" />
              <Step title="Propriedades" />
            </Steps>
          }
        >
          <Button type="primary" icon="save" onClick={() => this.saveForm()}>
            Salvar Cliente
          </Button>
        </PainelHeader>
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
                  this.props.handleFormState({
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
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
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
