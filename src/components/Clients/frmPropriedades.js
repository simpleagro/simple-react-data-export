import React, { Component } from "react";
import { Breadcrumb, Button, Icon, Tabs, Form, Select, Input } from "antd";

const { TabPane } = Tabs;
const Option = Select.Option;

class PartialPropriedades extends Component {
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
          <TabPane tab="Propriedades" key="1">
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
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export const FrmPropriedades = Form.create()(PartialPropriedades);
