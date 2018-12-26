import React from 'react'
import { Modal, Form, Input, Button } from 'antd';

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}}

      onHadleChange = event => {
        if (!event.target.name) return;
        let form = Object.assign({}, this.state.formData, {
            [event.target.name]: event.target.value
          });
        this.setState(prev => ({ ...prev, formData: form }));
      };

      onSalve = () => {
        this.props.form.validateFields(async err => {
            if (err) return;
            else {
                this.props.onCreate(this.state.formData)
            }
        });
      }

      componentDidUpdate(prevProps) {
         if(!prevProps.visible && this.props.visible){
            this.setState({formData:{}});
            this.props.form.resetFields();
         }
      }

      render() {
        const { visible, onCancel, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title="Add Opção"
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                Adicionar
              </Button>
            ]}
          >
            <Form layout="vertical" onChange={this.onHadleChange}>
              <Form.Item label="Nome">
                {getFieldDecorator('label', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                })(
                  <Input
                    name="label"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item label="Valor">
                {getFieldDecorator('value', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                })(
                  <Input
                    name="value"
                  />
                )}
              </Form.Item>
            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 