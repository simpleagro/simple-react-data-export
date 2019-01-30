import React from 'react'
import { Modal, Form, Input, Button, Select } from 'antd';

const ModalForm = Form.create()(

    class extends React.Component {
      state = { formData: {}, rules: {} }

      onHadleChange = event => {
        if (!event.target.name) return;
        let form = Object.assign({}, this.state.formData, {
          [event.target.name]: event.target.value
        });
        console.log("form: ", form);
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
          this.props.form.resetFields();
          this.setState({formData:{...this.props.record}});
         }
      }

      render() {
        const { visible, onCancel, form, onCreate } = this.props;
        const { getFieldDecorator } = form;

        return (
          <Modal
            visible={visible}
            title={ `${this.props.record? 'Editar' : 'Adicionar'} Regra` }
            onCancel={onCancel}
            maskClosable={false}
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                {`${ this.props.record? 'Editar' : 'Adicionar' }`}
              </Button>
            ]}
          >
            <Form layout="vertical" onChange={this.onHadleChange}>
              <Form.Item label="Label">
                {getFieldDecorator('label', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.rules && this.state.formData.rules.label
                })(<Input name="label" ref={input => (this.titleInput = input)} />)}
              </Form.Item>

              <Form.Item label="Key" onChange={this.onHadleChange}>
                {getFieldDecorator('key', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.rules && this.state.formData.rules.key
                })( <Input name="key" /> )}
              </Form.Item>

            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
