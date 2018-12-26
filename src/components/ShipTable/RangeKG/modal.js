import React from 'react'
import { Modal, Form, InputNumber, Button } from 'antd';

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}}

      onHadleChange = event => {
        if (!event.target.name) return;
        let form = Object.assign({}, this.state.formData, {
            [event.target.name]: event.target.value
          });
          this.setState(prev => ({ ...prev, formData: form }));
         // console.log(form)
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
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                {`${this.props.record? 'Editar':'Adicionar'}`}
              </Button>
            ]}
          >
            <Form layout="vertical" onChange={this.onHadleChange}>
              <Form.Item label="KG de">
                {getFieldDecorator('pesokg_de', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.pesokg_de
                })(
                  <InputNumber
                    name="pesokg_de"
                    ref={input => (this.titleInput = input)}
                    style={{width:'100%'}}
                    parser={value => value.replace(/[^\d]+/g,'')}
                  />
                )}
              </Form.Item>
              <Form.Item label="KG até">
                {getFieldDecorator('pesokg_ate', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.pesokg_ate
                })(
                  <InputNumber 
                    name="pesokg_ate"
                    style={{width:'100%'}}
                    parser={value => value.replace(/[^\d]+/g,'')} 
                  />
                )}
              </Form.Item>
              <Form.Item label="Preço">
                {getFieldDecorator('preco', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.preco
                })(
                  <InputNumber 
                    name="preco"
                    style={{width:'100%'}}
                    //formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={value => value.replace(/[^\d]+/g,'')}/>
)}
              </Form.Item>
            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 