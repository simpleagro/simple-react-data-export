import React from "react";
import { Select, Modal, Form, Input, Button, Checkbox, DatePicker } from "antd";
import moment from "moment";
import FormItem from "antd/lib/form/FormItem";

const ModalForm = Form.create()(
  class extends React.Component {
    state = {
      formData: {},
      dataSelecionada: undefined
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
        },
        dataSelecionada: undefined
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
            <Form.Item>
              {getFieldDecorator("usar_datas_fixas", {
                initialValue: this.state.formData.usar_datas_fixas
              })(
                <Checkbox
                  checked={this.state.formData.usar_datas_fixas}
                  onChange={e => {
                    this.onHadleChange({
                      target: {
                        name: "usar_datas_fixas",
                        value: e.target.checked
                      }
                    });
                    if (!e.target.checked || e.target.checked === false) {
                      this.setState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          dataSelecionada: undefined,
                          venc_datas_fixas: []
                        }
                      }));
                    }
                  }}>
                  Usar datas fixas para vencimentos?
                </Checkbox>
              )}
            </Form.Item>
            {this.state.formData.usar_datas_fixas && (
              <div style={{ background: "#eeeeee", padding: 10 }}>
                <p>Selecione as datas fixas de vencimento:</p>
                <DatePicker
                  style={{ paddingBottom: 3 }}
                  name="datas_fixas_picker"
                  onChange={this.onChangeDataFixa}
                  allowClear={false}
                  format="DD/MM/YYYY"
                  value={this.state.dataSelecionada}
                />

                <Form.Item>
                  {getFieldDecorator("obrigatorio", {
                    rules: [
                      {
                        required: this.state.formData.usar_datas_fixas || false,
                        message: "Este campo é obrigatório!"
                      }
                    ],
                    initialValue:
                      this.state.formData &&
                      this.state.formData.venc_datas_fixas
                  })(
                    <Select
                      onDeselect={this.onDeselect}
                      mode="tags"
                      name="venc_datas_fixas"
                      style={{ width: "100%" }}
                      placeholder="Utilize o campo acima para adicionar as datas"
                    />
                  )}
                </Form.Item>
              </div>
            )}
          </Form>
        </Modal>
      );
    }
  }
);

export default ModalForm;
