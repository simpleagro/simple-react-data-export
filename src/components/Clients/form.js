import React, { Component } from "react";
import { Breadcrumb, Button, Icon, Input, Form, Select, Tabs } from "antd";
import styled from "styled-components";

import { PainelHeader } from "../PainelHeader";

const { TabPane } = Tabs;
const Option = Select.Option;

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
      openForm: true,
      formData: this.props.formData
    };
  }

  componentDidMount() {
    console.log(this.state);
  }

  componentWillUpdate(newProps) {
    // somente se for abrir o form setar o focus no input
    if (newProps.openForm === true && this.state.openForm === false) {
      setTimeout(() => {
        this.titleInput.focus();
      }, 0);
      this.setState(prev => ({ ...prev, openForm: true }));
    }

    // fechando o form
    if (newProps.openForm === false && this.state.openForm === true) {
      this.setState(prev => ({ ...prev, openForm: false }));
      // this.props.form.resetFields();
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
        <PainelHeader title="Novo Cliente">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.props.saveForm()}
          >
            Salvar Cliente
          </Button>
        </PainelHeader>
        <Form
          style={this.props.style}
          layout={this.props.layout}
          onChange={this.props.handleFormState}
          ref={form => (this.form = form)}
        >
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" ref={input => (this.titleInput = input)} />)}
          </Form.Item>
          <Form.Item label="Sobrenome" {...formItemLayout}>
            {getFieldDecorator("sobrenome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.sobrenome
            })(<Input name="sobrenome" />)}
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
