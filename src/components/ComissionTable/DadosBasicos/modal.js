import React from 'react'
import { Modal, Form, Input, Button, Select, DatePicker } from 'antd';
//import * as GroupsServices from "../../../services/productgroups";
import * as SeasonsServices from "../../../services/seasons";
import locale from "antd/lib/date-picker/locale/pt_BR";
import moment from "moment";
import "moment/locale/pt-br";

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, tipo_venda: [], uso_semente: [], safras: []}

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
        const safras = await SeasonsServices.list({
          limit: -1,
          status: true,
          fields: "descricao,_id"
        });
        this.setState(prev => ({ ...prev, safras: safras.docs }));
      }

      componentDidUpdate(prevProps) {
         if(!prevProps.visible && this.props.visible){
          this.props.form.resetFields();
          this.setState({formData:{...this.props.record}});
         }
      }

      listarSafras = (safras) => {
        return safras.map(safra => (
          <Select.Option key={safra._id} value={JSON.stringify({id: safra._id, descricao: safra.descricao})}>
            {safra.descricao}
          </Select.Option>
        ))
      }

      render() {
        const { visible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Tabela de Comissão`}
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
              <Form.Item label="Versão">
                {getFieldDecorator('versao', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.versao
                })(
                  <Input
                    name="versao"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item label="Safra">
                {getFieldDecorator("safra", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.safra
                    ? `${this.state.formData.safra.descricao}`
                    : undefined
                })(
                  <Select
                    name="safra"
                    showAction={["focus", "click"]}
                    showSearch
                    placeholder="Selecione uma safra..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={e => {
                      e = JSON.parse(e)
                      this.onHadleChange({
                        target: { name: "safra", value: e }
                      })}
                    }
                  >
                    {this.listarSafras(this.state.safras)}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Data Validade de">
                {getFieldDecorator("data_validade_de", {
                  initialValue: this.state.formData.data_validade_de
                    ? moment(this.state.formData.data_validade_de)
                    : undefined
                })(
                  <DatePicker
                    format="DD/MM/YYYY"
                    locale={locale}
                    style={{width: '100%'}}
                    onChange={e => {
                      this.onHadleChange({
                        target: { name: "data_validade_de", value: e }
                      })}
                    }
                    name="data_validade_de"
                  />
                )}
              </Form.Item>
              <Form.Item label="Data Validade até">
                {getFieldDecorator("data_validade_ate", {
                  initialValue: this.state.formData.data_validade_ate
                    ? moment(this.state.formData.data_validade_ate)
                    : undefined
                })(
                  <DatePicker
                    format="DD/MM/YYYY"
                    locale={locale}
                    style={{width: '100%'}}
                    onChange={e => {
                      this.onHadleChange({
                        target: { name: "data_validade_ate", value: e }
                      })}
                    }
                    name="data_validade_ate"
                  />
                )}
              </Form.Item>
              {/* <Form.Item label="Tipo Venda">
                {getFieldDecorator("tipo_venda", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.tipo_venda
                })(
                  <Select
                    name="tipo_venda"
                    showAction={["focus", "click"]}
                    showSearch
                    placeholder="Selecione uma tipo de venda..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={e =>
                      this.onHadleChange({
                        target: { name: "tipo_venda", value: e }
                      })
                    }
                  >
                    {this.listarTipoVenda(this.state.tipo_venda)}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Uso Semente">
                {getFieldDecorator("uso_semente", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.uso_semente
                })(
                  <Select
                    name="uso_semente"
                    showAction={["focus", "click"]}
                    showSearch
                    placeholder="Selecione o uso da semente..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={e =>
                      this.onHadleChange({
                        target: { name: "uso_semente", value: e }
                      })
                    }
                  >
                    {this.listarUsoSemente(this.state.uso_semente)}
                  </Select>
                )}
              </Form.Item> */}
            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 