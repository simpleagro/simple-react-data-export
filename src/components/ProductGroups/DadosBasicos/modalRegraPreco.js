import React from 'react'
import { Modal, Form, Input, Button, Checkbox } from 'antd';

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
            this.props.form.resetFields();
            this.setState({formData:{...this.props.record}});
         }
      }

      render() {
        const { visible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Regra de Preço`}
            onCancel={onCancel}
            maskClosable={false}
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                {`${this.props.record? 'Editar':'Adicionar'}`}
              </Button>
            ]}
          >
            <Form layout="vertical" onChange={this.onHadleChange}>
              <Form.Item label="Nome">
                {getFieldDecorator('label', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.label
                })(
                  <Input
                    name="label"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item label="Chave">
                {getFieldDecorator('chave', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.chave
                })(
                  <Input
                    name="chave"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item label="Centro de Custo">
                {getFieldDecorator('centro_custo', {
                  /* rules: [{ required: true, message: "Este campo é obrigatório!" }], */
                  initialValue: this.state.formData.centro_custo
                })(
                  <Input
                    name="centro_custo"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 12 }}>
                {getFieldDecorator("obrigatorio", {
                    initialValue: this.state.formData.obrigatorio
                })(
                <Checkbox
                    checked={this.state.formData.obrigatorio}
                    onChange={e =>
                    this.onHadleChange({
                        target: {
                        name: "obrigatorio",
                        value: e.target.checked
                        }
                    })
                    }>
                    Campo extra obrigatório?
                </Checkbox>
                )}
              </Form.Item>

            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 