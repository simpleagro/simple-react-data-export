import React from 'react'
import { Modal, Form, Button, Input } from 'antd';
import { addMaskReais, addMaskNumeroPonto } from '../../common/utils';

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}}

      onHadleChange = (name, value) => {
        if (!name) return;
        let form = Object.assign({}, this.state.formData, {
            [name]: value
          });
          this.setState(prev => ({ ...prev, formData: form }));
         console.log(name, form)
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
            title={`${this.props.record? 'Editar':'Add'} Range de KG`}
            onCancel={onCancel}
            maskClosable={false}
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                {`${this.props.record? 'Editar':'Adicionar'}`}
              </Button>
            ]}
          >
            <Form layout="vertical" /* onChange={this.onHadleChange} */>
              <Form.Item label="KG de">
                {getFieldDecorator('pesokg_de', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue:  addMaskNumeroPonto(`${this.state.formData.pesokg_de}`),
                  getValueFromEvent: e => addMaskNumeroPonto(e.target.value),
                  onChange: (e) => e.target ? this.onHadleChange(e.target.name, e.target.value.replace(/\./g,'')) : false
                })(
                  <Input name="pesokg_de"/>
                )}
              </Form.Item>
              <Form.Item label="KG até">
                {getFieldDecorator('pesokg_ate', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue:  addMaskNumeroPonto(`${this.state.formData.pesokg_ate}`),
                  getValueFromEvent: e => addMaskNumeroPonto(e.target.value),
                  onChange: (e) => e.target ? this.onHadleChange(e.target.name, e.target.value.replace(/\./g,'')) : false
                })(
                  <Input name="pesokg_ate"/>
                )}
              </Form.Item>
              <Form.Item label="Preço">
                {getFieldDecorator('preco', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: addMaskReais(this.state.formData.preco),
                  getValueFromEvent: e => addMaskReais(e.target.value),
                  onChange: (e) => e.target ? this.onHadleChange(e.target.name, addMaskReais(e.target.value)) : false
                })(
                    <Input name="preco"/>
                )}
              </Form.Item>
            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 