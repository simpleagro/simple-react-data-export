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

import { PainelHeader } from "../PainelHeader";

const { TabPane } = Tabs;
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
      openForm: true
    };
  }

  componentDidUpdate(newProps) {
    // somente se for abrir o form setar o focus no input
    if (newProps.openForm === true && this.state.openForm === false) {
      setTimeout(() => {
        this.titleInput.focus();
      }, 0);
      this.setState(prev => ({ ...prev, openForm: true }));
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <div style={{ display: this.props.openForm ? "block" : "none" }}>
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button onClick={this.props.closeForm}>
              <Icon type="arrow-left" />
              Voltar para a listagem de clientes
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <PainelHeader
          title="Novo Cliente"
          extra={
            <Steps current={0} progressDot>
              <Step title="Dados do Cliente" />
              <Step title="Propriedades" />
            </Steps>
          }
        >
          <Button
            type="primary"
            icon="save"
            onClick={() => this.props.saveForm()}
          >
            Salvar Cliente
          </Button>
        </PainelHeader>
        <Form onChange={this.props.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.props.formData.nome
            })(<Input name="nome" ref={input => (this.titleInput = input)} />)}
          </Form.Item>
          <Form.Item label="Sobrenome" {...formItemLayout}>
            {getFieldDecorator("sobrenome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.props.formData.sobrenome
            })(<Input name="sobrenome" />)}
          </Form.Item>
          <Form.Item label="Tipo do Cliente" {...formItemLayout}>
            {getFieldDecorator("tipo", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.props.formData.tipo
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
              initialValue: this.props.formData.cpf_cnpj
            })(<Input name="cpf_cnpj" />)}
          </Form.Item>
          <Form.Item label="Tel. Fixo" {...formItemLayout}>
            {getFieldDecorator("tel_fixo", {
              initialValue: this.props.formData.tel_fixo
            })(<Input name="tel_fixo" />)}
          </Form.Item>
          <Form.Item label="Tel. Cel." {...formItemLayout}>
            {getFieldDecorator("tel_cel", {
              initialValue: this.props.formData.tel_cel
            })(<Input name="tel_cel" />)}
          </Form.Item>
          <Form.Item label="Email" {...formItemLayout}>
            {getFieldDecorator("email", {
              initialValue: this.props.formData.email
            })(<Input name="email" />)}
          </Form.Item>
          <Form.Item label="Lim. Crédito" {...formItemLayout}>
            {getFieldDecorator("credito", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.props.formData.credito
            })(<Input name="credito" />)}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepClientForm = Form.create()(ClientForm);

export default WrappepClientForm;
