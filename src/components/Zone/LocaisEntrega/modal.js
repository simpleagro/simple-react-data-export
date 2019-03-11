import React from "react";
import { Modal, Form, Button, Input } from "antd";

const ModalForm = Form.create()(
  class extends React.Component {
    state = { formData: {} };

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
          this.props.onCreate(this.state.formData);
        }
      });
    };

    componentDidUpdate(prevProps) {
      if (!prevProps.visible && this.props.visible) {
        this.props.form.resetFields();
        if (this.props.record) this.setState({ formData: this.props.record });
        else this.setState({ formData: {} });
      }
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title={`${this.props.record ? "Editar" : "Adicionar"} Local de Entrega`}
          onCancel={onCancel}
          maskClosable={false}
          footer={[
            <Button key="back" onClick={onCancel}>
              Cancelar
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.onSalve()}>
              {`${this.props.record ? "Editar" : "Adicionar"}`}
            </Button>
          ]}>
          <Form layout="vertical" onChange={this.onHadleChange}>
            <Form.Item label="Nome">
              {getFieldDecorator("nome", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.nome
              })(<Input name="nome" />)}
            </Form.Item>
            <Form.Item label="Transbordo">
              {getFieldDecorator("transbordo", {
                initialValue: this.state.formData.transbordo
              })(<Input name="transbordo" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);

export default ModalForm;
