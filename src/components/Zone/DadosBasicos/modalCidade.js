import React from "react";
import { Modal, Form, Button, Select } from "antd";
import { debounce } from "lodash/debounce";

import * as IBGEService from "services/ibge";
import { addMaskReais } from "common/utils";

const ModalFormCidade = Form.create()(
  class extends React.Component {
    state = { formData: {}, cidades: [], fetchingCidade: false };

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

    async componentDidUpdate(prevProps) {
      if (!prevProps.visible && this.props.visible) {
        this.props.form.resetFields();
        if (this.props.record) {
          let cidades = await IBGEService.listaCidadesPorEstado(
            this.props.record.estado
          );
          const cidadesSelecionadas = this.props.record.cidades;
          cidades = cidades.filter(c => {
            if (cidadesSelecionadas.find(rc => rc.nome === c.nome))
              return false;
            return true;
          });
          this.setState({ cidades, formData: { _id: this.props.record._id } });
        }
      }
    }

    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title={`Nova Cidade`}
          onCancel={onCancel}
          maskClosable={false}
          footer={[
            <Button key="back" onClick={onCancel}>
              Cancelar
            </Button>,
            <Button key="submit" type="primary" onClick={() => this.onSalve()}>
              Adicionar
            </Button>
          ]}>
          <Form layout="vertical" onChange={this.onHadleChange}>
            <Form.Item label="Cidades">
              {getFieldDecorator("cidades", {
                rules: [
                  {
                    required: true,
                    message: "Este campo é obrigatório!"
                  }
                ]
              })(
                <Select
                  autoComplete="false"
                  name="cidades"
                  showAction={["focus", "click"]}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={e => {
                    console.log(e);
                    e = JSON.parse(e);
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

export default ModalFormCidade;
