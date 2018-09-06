import React, { Component, Fragment } from "react";
import { Form, Input, Tabs, Checkbox } from "antd";

const { TabPane } = Tabs;

class ModuloForm extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  setConfig(e) {
    console.log(e);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { configuracoes } = this.props.formData;

    return (
      <div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informações Básicas" key="1">
            <Form onChange={this.props.handleFormState}>
              <Form.Item label="Nome do módulo">
                {getFieldDecorator("nome", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.props.formData.nome
                })(
                  <Input
                    disabled
                    name="nome"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item label="Descrição do módulo">
                {getFieldDecorator("descricao", {
                  initialValue: this.props.formData.descricao
                })(<Input.TextArea name="descricao" />)}
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Configurações" key="2">
            <Form onChange={this.props.handleFormState}>
              {Object.keys(configuracoes).map(k => (
                <Fragment key={k}>
                  <Form.Item>
                    {getFieldDecorator(`configuracoes.${k}.ativo`, {
                      valuePropName: "checked",
                      initialValue: configuracoes[k].ativo
                    })(<Checkbox onChange={this.setConfig}>{configuracoes[k].nome}</Checkbox>)}
                    <br />
                  </Form.Item>
                </Fragment>
              ))}
            </Form>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

const WrappedRegistrationForm = Form.create()(ModuloForm);

export default WrappedRegistrationForm;
