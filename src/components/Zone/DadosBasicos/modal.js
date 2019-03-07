import React from "react";
import { Modal, Form, Input, Button, Select, DatePicker, Checkbox } from "antd";
import { debounce } from "lodash/debounce";

import * as IBGEService from "services/ibge";
import { addMaskReais } from "common/utils";

const ModalForm = Form.create()(
  class extends React.Component {
    state = { formData: {}, cidades: [], estados: [], fetchingCidade: false };

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
      this.setState(prev => ({ ...prev, estados, fetchingCidade: false }));
    }

    componentDidUpdate(prevProps) {
      if (!prevProps.visible && this.props.visible) {
        this.props.form.resetFields();
        this.setState({ formData: { ...this.props.record } });
      }
    }

    async listaCidadesPorEstado(estado) {
      await this.setState({ fetchingCidade: true, cidades: [], cidade: "" });
      await this.onHadleChange({
        target: { name: "estado", value: estado }
      });

      const cidades = await IBGEService.listaCidadesPorEstado(estado);
      this.setState(prev => ({ ...prev, cidades, fetchingCidade: false }));
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title={`${this.props.record ? "Editar" : "Nova"} Região`}
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
              })(
                <Input
                  autoComplete="false"
                  name="nome"
                  ref={input => (this.titleInput = input)}
                />
              )}
            </Form.Item>

            <Form.Item label="Ágio">
              {getFieldDecorator("agio", {
                // rules: [
                //   { required: true, message: "Este campo é obrigatório!" }
                // ],
                initialValue: addMaskReais(this.state.formData.agio),
                getValueFromEvent: e => addMaskReais(e.target.value),
                onChange: e => {
                  e.persist();
                  e.target
                    ? setTimeout(() => {
                        this.onHadleChange({
                          target: {
                            name: "agio",
                            value: addMaskReais(e.target.value)
                          }
                        });
                      }, 0)
                    : false;
                }
              })(<Input name="agio" />)}
            </Form.Item>

            <Form.Item label="Deságio">
              {getFieldDecorator("desagio", {
                // rules: [
                //   { required: true, message: "Este campo é obrigatório!" }
                // ],
                initialValue: addMaskReais(this.state.formData.desagio),
                getValueFromEvent: e => addMaskReais(e.target.value),
                onChange: e => {
                  e.persist();
                  e.target
                    ? setTimeout(() => {
                        this.onHadleChange({
                          target: {
                            name: "desagio",
                            value: addMaskReais(e.target.value)
                          }
                        });
                      }, 0)
                    : false;
                }
              })(<Input name="desagio" />)}
            </Form.Item>

            <Form.Item label="Estado">
              {getFieldDecorator("estado", {
                rules: [
                  {
                    required: !this.props.record,
                    message: "Este campo é obrigatório!"
                  }
                ],
                initialValue: this.state.formData.estado
              })(
                <Select
                  autoComplete="false"
                  disabled={!!this.props.record}
                  name="estado"
                  showAction={["focus", "click"]}
                  showSearch
                  placeholder="Selecione um estado..."
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onSelect={e => this.listaCidadesPorEstado(e)}>
                  {this.state.estados.map(uf => (
                    <Select.Option key={uf} value={uf}>
                      {uf}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>

            <Form.Item label="Cidades">
              {getFieldDecorator("cidades", {
                rules: [
                  {
                    required: !this.props.record,
                    message: "Este campo é obrigatório!"
                  }
                ],
                initialValue: this.state.formData.cidades
                  ? this.state.formData.cidades.map(c => c.nome)
                  : undefined
              })(
                <Select
                  autoComplete="false"
                  disabled={
                    this.state.formData.estado === undefined ||
                    !!this.props.record
                  }
                  name="cidades"
                  showAction={["focus", "click"]}
                  showSearch
                  mode="multiple"
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={e => {
                    console.log(e);
                    e = e.map(item => JSON.parse(item));
                    this.onHadleChange({
                      target: { name: "cidades", value: e }
                    });
                  }}>
                  {this.state.cidades.map((c, index) => (
                    <Select.Option
                      key={`${c.nome}_${index}`}
                      value={JSON.stringify({
                        nome: c.nome
                      })}>
                      {c.nome}
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
