import React from 'react'
import { Modal, Form, Button, Input, Select } from 'antd';
import * as GroupsServices from '../../../services/productgroups'
import * as ConsultantsServices from '../../../services/consultants'

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, vendedores: [], grupos_produtos: []}

      onHadleChange = event => {
        //console.log(event.target)
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

      listarVendedores = (vendedores) => {
        return vendedores.map(vendedor => (
          <Select.Option key={vendedor._id} value={JSON.stringify({id: vendedor._id, nome: vendedor.nome})}>
            {vendedor.nome}
          </Select.Option>
        ))
      }

      listarGruposProdutos = (grupos_produtos) => {
        return grupos_produtos.map(gp => (
          <Select.Option key={gp._id} value={JSON.stringify({id: gp._id, nome: gp.nome})}>
            {gp.nome}
          </Select.Option>
        ))
      }

      async componentDidMount() {
        const grupos_produtos = await GroupsServices.list({
          limit: -1,
          status: true,
          fields: "nome,_id"
        });

        const vendedores = await ConsultantsServices.list({
          limit: -1,
          status: true,
          fields: "nome,_id"
        });
      
        this.setState(prev => ({ ...prev, grupos_produtos: grupos_produtos.docs, vendedores: vendedores.docs }));
      }

      componentDidUpdate(prevProps) {
         if(!prevProps.visible && this.props.visible){
          this.props.form.resetFields();
          if(this.props.record)
            this.setState({formData:{vendedor: {nome: this.props.record.nome, id: this.props.record.id}, ...this.props.record}});
          else
            this.setState({formData:{}});
         }
         
      }

      render() {
        const { visible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Vendedor`}
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
              <Form.Item label="Vendedor">
                  {getFieldDecorator("vendedor", {
                    initialValue: this.state.formData.vendedor
                    ? `${this.state.formData.vendedor.nome}`
                    : undefined,
                    rules: [
                      { required: true, message: "Este campo é obrigatório!" }
                    ],
                  })(
                    <Select
                      name="vendedor"
                      showAction={["focus", "click"]}
                      disabled={!!this.props.record}
                      showSearch
                      placeholder="Selecione um vendedor..."
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={e =>
                        this.onHadleChange({
                          target: { name: "vendedor", value: JSON.parse(e) }
                        })
                      }
                    >
                      {this.listarVendedores(this.state.vendedores)}
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
 