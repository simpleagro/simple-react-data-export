import React from 'react'
import { Modal, Form, Input, Button, Select, DatePicker } from 'antd';
import * as IBGEService from "../../../services/ibge";
import locale from "antd/lib/date-picker/locale/pt_BR";
import moment from "moment";
import "moment/locale/pt-br";

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, estados: []}

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
                this.props.onCreate(this.state.formData)
            }
        });
      }

      async componentDidMount() {
        const estados = await IBGEService.listaEstados();
        this.setState(prev => ({ ...prev, estados }));
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
            title={`${this.props.record? 'Editar':'Add'} Tabela de Frete`}
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
              <Form.Item label="Nome">
                {getFieldDecorator('nome', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.nome
                })(
                  <Input
                    name="nome"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item label="Data Base">
                {getFieldDecorator("data_base", {
                  initialValue: this.state.formData.data_base
                    ? moment(this.state.formData.data_base)
                    : undefined
                })(
                  <DatePicker
                    format="DD/MM/YYYY"
                    locale={locale}
                    style={{width: '100%'}}
                    onChange={e => {
                      this.onHadleChange({
                        target: { name: "data_base", value: e }
                      })}
                    }
                    name="data_base"
                  />
                )}
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
                    }
                  >
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
 