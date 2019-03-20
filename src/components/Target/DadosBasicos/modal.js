import React from 'react'
import { Modal, Form, Input, Button, Select, DatePicker } from 'antd';
import locale from "antd/lib/date-picker/locale/pt_BR";
import * as SeasonsServices from '../../../services/seasons'
import moment from "moment";
import "moment/locale/pt-br";

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, safras: []}

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
        const grupos_produtos = [] //await IBGEService.listaEstados();
        const safras = await SeasonsServices.list({
          limit: -1,
          status: true,
          fields: "descricao,_id"
        });
        this.setState(prev => ({ ...prev, grupos_produtos, safras: safras.docs }));
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
            title={`${this.props.record? 'Editar':'Add'} Meta`}
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
                    autoFocus
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
                    onChange={e =>
                      this.onHadleChange({
                        target: { name: "safra", value: JSON.parse(e) }
                      })}
                  >
                    {this.listarSafras(this.state.safras)}
                  </Select>
                )}
              </Form.Item>
              <Form.Item label="Versão">
                {getFieldDecorator('versao', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.versao
                })(
                  <Input
                    name="versao"
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
