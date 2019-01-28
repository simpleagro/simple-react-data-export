import React from "react";
import { Modal, Form, Button, Select, DatePicker, InputNumber } from "antd";
import locale from "antd/lib/date-picker/locale/pt_BR";
import { list as ListFormOfPayments } from "services/form-of-payment";
import { list as ListTypeOfPayments } from "services/type-of-payment";
import moment from "moment";
import "moment/locale/pt-br";

const ModalForm = Form.create()(
  class extends React.Component {
    state = { formData: {}, formasDePagamento: [], tiposDePagamento: []};

    onHandleChange = event => {
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

    async componentDidMount() {
      const formasDePagamento = await ListFormOfPayments({
        limit: -1,
        status: true,
        fields: "descricao"
      }).then(response => response.docs);

      const tiposDePagamento = await ListTypeOfPayments({
        limit: -1,
        status: true,
        fields: "descricao"
      }).then(response => response.docs);

      this.setState(prev => ({
        ...prev,
        formasDePagamento,
        tiposDePagamento
      }));
    }

    componentDidUpdate(prevProps) {
      if (!prevProps.visible && this.props.visible) {
        this.props.form.resetFields();
        this.setState({ formData: { ...this.props.record } });
      }
    }

    listarFormasDePagamento = () => {
      const { formasDePagamento } = this.state;
      return formasDePagamento.map(fp => (
        <Select.Option
          key={fp._id}
          value={JSON.stringify({ id: fp._id, descricao: fp.descricao })}>
          {fp.descricao}
        </Select.Option>
      ));
    };

    listarTiposDePagamento = () => {
      const { tiposDePagamento } = this.state;
      return tiposDePagamento.map(tp => (
        <Select.Option
          key={tp._id}
          value={JSON.stringify({ id: tp._id, descricao: tp.descricao })}>
          {tp.descricao}
        </Select.Option>
      ));
    };

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title={`${this.props.record ? "Editar" : "Nova"} Parcela`}
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
          <Form layout="vertical" onChange={this.onHandleChange}>
            <Form.Item label="Data de Vencimento">
              {getFieldDecorator("data_vencimento", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.data_vencimento
                  ? moment(this.state.formData.data_vencimento)
                  : undefined
              })(
                <DatePicker
                  format="DD/MM/YYYY"
                  locale={locale}
                  style={{ width: "100%" }}
                  onChange={e =>
                    this.onHandleChange({
                      target: { name: "data_vencimento", value: e }
                    })
                  }
                  name="data_vencimento"
                />
              )}
            </Form.Item>

            <Form.Item label="Forma de Pagamento">
              {getFieldDecorator("forma_pagamento", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.forma_pagamento ? this.state.formData.forma_pagamento.descricao : undefined
              })(
                <Select
                  name="forma_pagamento"
                  showAction={["focus", "click"]}
                  showSearch
                  placeholder="Selecione uma forma de pagamento..."
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={e =>
                    this.onHandleChange({
                      target: { name: "forma_pagamento", value: JSON.parse(e) }
                    })
                  }>
                  {this.listarFormasDePagamento()}
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Tipo de Pagamento">
              {getFieldDecorator("tipo_pagamento", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.tipo_pagamento ? this.state.formData.tipo_pagamento.descricao : undefined
              })(
                <Select
                  name="tipo_pagamento"
                  showAction={["focus", "click"]}
                  showSearch
                  placeholder="Selecione uma forma de pagamento..."
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={e =>
                    this.onHandleChange({
                      target: { name: "tipo_pagamento", value: JSON.parse(e) }
                    })
                  }>
                  {this.listarTiposDePagamento()}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Valor Parcela">
              {getFieldDecorator("valor_parcela", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.valor_parcela || undefined
              })(<InputNumber name="valor_parcela" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);

export default ModalForm;
