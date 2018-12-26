import React from 'react'
import { Modal, Form, Button, Select } from 'antd';
import * as GroupsServices from "../../../services/productgroups";
import * as SeedUsesServices from "../../../services/seeduse";
import * as TypesOfSalesServices from "../../../services/typesofsales";

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, grupos_produtos: [], tipo_venda: [], uso_semente: []}

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
        const uso_semente = await SeedUsesServices.list({
          limit: -1,
          status: true,
          fields: "descricao,_id"
        });
        const tipo_venda = await TypesOfSalesServices.list({
          limit: -1,
          status: true,
          fields: "descricao,_id"
        });
        this.setState(prev => ({ ...prev, grupos_produtos: grupos_produtos.docs, uso_semente: uso_semente.docs, tipo_venda: tipo_venda.docs }));
      }

      listarTipoVenda = (tipo_venda) => {
        return tipo_venda.map(tv => (
          <Select.Option key={tv._id} value={tv.descricao}>
            {tv.descricao}
          </Select.Option>
        ))
      }

      listarUsoSemente = (uso_semente) => {
        return uso_semente.map(us => (
          <Select.Option key={us._id} value={us.descricao}>
            {us.descricao}
          </Select.Option>
        ))
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

      render() {
        const { visible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Regra`}
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                {`${this.props.record? 'Editar':'Adicionar'}`}
              </Button>
            ]}
          >
            <Form layout="vertical" onChange={this.onHadleChange}>
              <Form.Item label="Tipo Venda">
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
 