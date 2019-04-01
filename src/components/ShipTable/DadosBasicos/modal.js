import React from "react";
import { Checkbox, Modal, Form, Input, Button, Select, DatePicker } from "antd";
import * as IBGEService from "services/ibge";
import locale from "antd/lib/date-picker/locale/pt_BR";

import "moment/locale/pt-br";
import { simpleDate, date2Db } from "common/utils";
import DataFixaVencimentosPedido from "common/DataFixaVencimentosPedido";

const ModalForm = Form.create()(
  class extends React.Component {
    state = { formData: {}, estados: [] };

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

    async componentDidMount() {
      const estados = await IBGEService.listaEstados();
      this.setState(prev => ({ ...prev, estados }));
    }

    componentDidUpdate(prevProps) {
      if (!prevProps.visible && this.props.visible) {
        this.props.form.resetFields();
        this.setState({ formData: { ...this.props.record } });
      }
    }

    // configuração de datas fixas SSF
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
    // *******************************

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title={`${this.props.record ? "Editar" : "Add"} Tabela de Frete`}
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
              })(<Input name="nome" autoFocus />)}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator("eh_tabela_base_frete", {
                initialValue: this.state.formData.eh_tabela_base_frete
              })(
                <Checkbox
                  checked={this.state.formData.eh_tabela_base_frete}
                  onChange={e => {
                    this.onHadleChange({
                      target: {
                        name: "eh_tabela_base_frete",
                        value: e.target.checked
                      }
                    });
                    if (!e.target.checked || e.target.checked === false) {
                      this.setState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          usar_datas_fixas: false,
                          venc_datas_fixas: []
                        }
                      }));
                    }
                  }}>
                  Usar tabela como tabela base de frete
                </Checkbox>
              )}
            </Form.Item>
            {this.state.formData.eh_tabela_base_frete && (
              <div
                style={{
                  marginBottom: 30
                }}>
                <DataFixaVencimentosPedido
                  onDeselect={this.onDeselect}
                  onChangeDataFixa={this.onChangeDataFixa}
                  onHadleChange={this.onHadleChange}
                  formData={this.state.formData}
                  onClearDataFixa={this.onClearDataFixa}
                  getFieldDecorator={getFieldDecorator}
                />
              </div>
            )}
            <Form.Item label="Data Base">
              {getFieldDecorator("data_base", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: simpleDate(this.state.formData.data_base)
              })(
                <DatePicker
                  format="DD/MM/YYYY"
                  locale={locale}
                  style={{ width: "100%" }}
                  onChange={e => {
                    this.onHadleChange({
                      target: { name: "data_base", value: date2Db(e) }
                    });
                  }}
                  name="data_base"
                />
              )}
            </Form.Item>
            <Form.Item label="Taxa Adição">
              {getFieldDecorator("taxa_adicao", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.taxa_adicao
              })(<Input name="taxa_adicao" />)}
            </Form.Item>
            <Form.Item label="Taxa Supressão">
              {getFieldDecorator("taxa_supressao", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.taxa_supressao
              })(<Input name="taxa_supressao" />)}
            </Form.Item>
            <Form.Item label="Estado">
              {getFieldDecorator("estado", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.estado
              })(
                <Select
                  name="estado"
                  showAction={["focus", "click"]}
                  mode="multiple"
                  showSearch
                  placeholder="Selecione um estado..."
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={e =>
                    this.onHadleChange({
                      target: { name: "estado", value: e }
                    })
                  }>
                  {this.state.estados.map(uf => (
                    <Select.Option key={uf} value={uf}>
                      {uf}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);

export default ModalForm;
