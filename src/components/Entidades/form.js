import React, { Component } from 'react';
import { Form, Input, Tabs, Affix } from 'antd';

const { TabPane } = Tabs;

class EntidadeForm extends Component {

  componentDidMount() {
    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  onStatusChange = (value) => {
    this.props.handleFormState({ target: { name: "status", value } })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    
    return (
      <div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Informações Básicas" key="1">
            <Form onChange={this.props.handleFormState}>
              <Form.Item label="Nome da entidade">
                {getFieldDecorator('nome', {
                  rules: [
                    { required: true, message: 'Este campo é obrigatório!' },
                  ],
                  initialValue: this.props.formData.nome,
                })(
                  <Input disabled name="nome" ref={(input) => this.titleInput = input} />
                )}
              </Form.Item>
              <Form.Item label="Descrição da entidade">
                <Input.TextArea name="descricao" />
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Dicionário de Dados" key="2">Content of Tab Pane 2</TabPane>
        </Tabs>
      </div >
    )
  }
}


const WrappedRegistrationForm = Form.create()(EntidadeForm);


export default WrappedRegistrationForm;