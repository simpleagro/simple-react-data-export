import React from 'react'
import { Modal, Form, Input, Button, Select, DatePicker } from 'antd';
import * as GroupsServices from "../../../services/productgroups";
import * as SeasonsServices from "../../../services/seasons";
import locale from "antd/lib/date-picker/locale/pt_BR";
import moment from "moment";
import "moment/locale/pt-br";

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, grupos_produtos: [], moedas: [], safras: []}

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
        const grupos_produtos = await GroupsServices.list({
          limit: -1,
          status: true,
          fields: "nome,_id"
        });
        const safras = await SeasonsServices.list({
          limit: -1,
          status: true,
          fields: "descricao,_id"
        });
        this.setState(prev => ({ ...prev, grupos_produtos: grupos_produtos.docs, safras: safras.docs }));
      }

      componentDidUpdate(prevProps) {
         if(!prevProps.visible && this.props.visible){
          this.props.form.resetFields();
          this.setState({formData:{...this.props.record}});
         }
      }

      listarGruposProdutos = (grupos_produtos) => {
        return grupos_produtos.map(gp => (
          <Select.Option key={gp._id} value={JSON.stringify({id: gp._id, nome: gp.nome})}>
            {gp.nome}
          </Select.Option>
        ))
      }

      listarMoedas = (moedas) => {
        return moedas.map(moeda => (
          <Select.Option key={moeda.id} value={moeda.id}>
            {moeda.nome}
          </Select.Option>
        ))
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
            title={`${this.props.record? 'Editar':'Add'} Tabela de Preço`}
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
              {/* <Form.Item label="Moeda">
                {getFieldDecorator("moeda", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.moeda
                })(
                  <Select
                    name="moeda"
                    showAction={["focus", "click"]}
                    showSearch
                    placeholder="Selecione uma moeda..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={e =>
                      this.onHadleChange({
                        target: { name: "moeda", value: e }
                      })
                    }
                  >
                    {this.listarMoedas(this.state.moedas)}
                  </Select>
                )}
              </Form.Item> */}
              <Form.Item label="Data Validade">
                {getFieldDecorator("data_validade", {
                  initialValue: this.state.formData.data_validade
                    ? moment(this.state.formData.data_validade, "DD/MM/YYYY")
                    : undefined
                })(
                  <DatePicker
                    format="DD/MM/YYYY"
                    locale={locale}
                    style={{width: '100%'}}
                    onChange={e => {
                      this.onHadleChange({
                        target: { name: "data_validade", value: e.format("DD/MM/YYYY") }
                      })}
                    }
                    name="data_validade"
                  />
                )}
              </Form.Item>
              <Form.Item label="Taxa Adição">
                {getFieldDecorator('taxa_adicao', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.taxa_adicao
                })(
                  <Input
                    name="taxa_adicao"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              <Form.Item label="Taxa Supressão">
                {getFieldDecorator('taxa_supressao', {
                  rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.taxa_supressao
                })(
                  <Input
                    name="taxa_supressao"
                    ref={input => (this.titleInput = input)}
                  />
                )}
              </Form.Item>
              {!this.props.record && <Form.Item label="Grupo de Produto">
                {getFieldDecorator("grupo_produto", {
                  initialValue: this.state.formData.grupo_produto
                    ? this.state.formData.grupo_produto.map(gp => JSON.stringify({id: gp.id, nome: gp.nome}))
                    : undefined
                })(
                  <Select
                    name="grupo_produto"
                    showAction={["focus", "click"]}
                    mode="multiple"
                    showSearch
                    placeholder="Selecione um grupo de produto..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={e => {
                      console.log(e)
                      e = e.map(item => JSON.parse(item))
                      this.onHadleChange({
                        target: { name: "grupo_produto", value: e }
                      })}
                    }
                  >
                    {this.listarGruposProdutos(this.state.grupos_produtos)}
                  </Select>
                )}
              </Form.Item>}
            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 