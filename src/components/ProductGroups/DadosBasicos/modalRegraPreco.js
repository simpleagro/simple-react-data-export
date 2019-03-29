import React from "react";
import { Modal, Form, Input, Button, Checkbox } from "antd";
import DataFixaVencimentosPedido from "common/DataFixaVencimentosPedido";

const ModalForm = Form.create()(
  class extends React.Component {
    state = {
      formData: {}
    };

    onDeselect = (e, opt) => {
      this.setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          venc_datas_fixas:
            prev.formData && prev.formData.venc_datas_fixas
              ? [
                  ...prev.formData.venc_datas_fixas.filter(
                    d => d !== opt.props.children
                  )
                ]
              : []
        }
      }));
    };

    onClearDataFixa = () => {
      this.setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          venc_datas_fixas: []
        }
      }));
    };

    onChangeDataFixa = (date, dateString) => {
      this.setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          venc_datas_fixas:
            prev.formData && prev.formData.venc_datas_fixas
              ? [
                  ...prev.formData.venc_datas_fixas.filter(
                    d => d !== dateString
                  ),
                  dateString
                ]
              : [dateString]
        }
      }));
    };

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
          this.props.onCreate(this.state.formData);
        }
      });
    };

    componentDidUpdate(prevProps) {
      if (!prevProps.visible && this.props.visible) {
        this.props.form.resetFields();
        this.setState({ formData: { ...this.props.record } });
      }
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title={`${this.props.record ? "Editar" : "Add"} Regra de Preço`}
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
              {getFieldDecorator("label", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.label
              })(<Input name="label" autoFocus />)}
            </Form.Item>
            <Form.Item label="Chave">
              {getFieldDecorator("chave", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.chave
              })(<Input name="chave" />)}
            </Form.Item>
            <Form.Item label="Centro de Custo">
              {getFieldDecorator("centro_custo", {
                /* rules: [{ required: true, message: "Este campo é obrigatório!" }], */
                initialValue: this.state.formData.centro_custo
              })(<Input name="centro_custo" />)}
            </Form.Item>
            <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 12 }}>
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
            <DataFixaVencimentosPedido
              onDeselect={this.onDeselect}
              onChangeDataFixa={this.onChangeDataFixa}
              onHadleChange={this.onHadleChange}
              formData={this.state.formData}
              onClearDataFixa={this.onClearDataFixa}
              getFieldDecorator={getFieldDecorator}
            />
          </Form>
        </Modal>
      );
    }
  }
);

export default ModalForm;
