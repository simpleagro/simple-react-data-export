import React from 'react'
import { Modal, Form, Button, InputNumber } from 'antd';

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}}

      onHadleChange = event => {
        //console.log(event.target)
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
            title={`${this.props.record? 'Editar':'Add'} Range de KM`}
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
              <Form.Item label="KM de">
                {getFieldDecorator('km_de', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.km_de
                })(
                  <InputNumber
                    name="km_de"
                    ref={input => (this.titleInput = input)}
                    style={{width:'100%'}}
                    parser={value => value.replace(/[^\d]+/g,'')}
                  />
                )}
              </Form.Item>
              <Form.Item label="KM até">
                {getFieldDecorator('km_ate', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.km_ate
                })(
                  <InputNumber
                    name="km_ate"
                    style={{width:'100%'}}
                    parser={value => value.replace(/[^\d]+/g,'')}
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
 