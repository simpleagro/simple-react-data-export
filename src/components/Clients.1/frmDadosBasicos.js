import React, { Component } from "react";
import { Breadcrumb, Button, Icon, Tabs, Form, Select, Input } from "antd";

const { TabPane } = Tabs;
const Option = Select.Option;

class PartialDadosBasicos extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };
    return (
      <div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Dados Básicos" key="1">
              <Form.Item label="Nome" {...formItemLayout}>
                {getFieldDecorator("nome", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.props.formData.nome
                })(
                  <Input name="nome" ref={input => (this.titleInput = input)} />
                )}
              </Form.Item>
              <Form.Item label="Sobrenome" {...formItemLayout}>
                {getFieldDecorator("sobrenome", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.props.formData.sobrenome
                })(<Input name="sobrenome" />)}
              </Form.Item>
              <Form.Item label="Tipo do Cliente" {...formItemLayout}>
                {getFieldDecorator("tipo", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.props.formData.tipo
                })(
                  <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Selecione um tipo..."
                  >
                    <Option value="PRODUTOR">Produtor</Option>
                    <Option value="COOPERADO">Cooperado</Option>
                    <Option value="DISTRIBUIDOR">Distribuidor</Option>
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="CPF / CNPJ" {...formItemLayout}>
                {getFieldDecorator("cpf_cnpj", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
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
                  initialValue: this.props.formData.credito
                })(<Input name="credito" />)}
              </Form.Item>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export const FrmDadosBasicos = Form.create()(PartialDadosBasicos);
