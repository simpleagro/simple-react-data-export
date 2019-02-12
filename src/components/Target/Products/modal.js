import React from 'react'
import { Modal, Form, Button, Input, Select } from 'antd';
import * as ProductService from '../../../services/products'
import * as UnidadeMedidaService from '../../../services/units-measures'

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, produtos: [], u_ms: []}

      onHadleChange = event => {
        //console.log(event.target)
        if (!event.target.name) return;
        let form = Object.assign({}, this.state.formData, {
            [event.target.name]: event.target.value
          });
          this.setState(prev => ({ ...prev, formData: form }));
      };

      async componentDidMount() {
        const produtos = await ProductService.list(this.props.grupo_produto_id)({
          limit: -1,
          status: true,
          fields: "nome,_id,nome_comercial"
        });

        const u_ms = await UnidadeMedidaService.list({
          limit: 100,
          status: true,
          fields: "nome,_id,sigla"
        });
      
        this.setState(prev => ({ ...prev, produtos: produtos.docs, u_ms: u_ms.docs }));
      }

      onSalve = () => {
        this.props.form.validateFields(async err => {
            if (err) return;
            else {
                this.props.onCreate(this.state.formData)
            }
        });
      }

      listarProdutos = (produtos) => {
        return produtos.map(produto => (
          <Select.Option key={produto._id} value={JSON.stringify({id:produto._id, nome: produto.nome, nome_comercial: produto.nome_comercial})}>
            {produto.nome}
          </Select.Option>
        ))
      }

      listarUMs = (u_ms) => {
        return u_ms.map(u_m => (
          <Select.Option key={u_m._id} value={u_m.sigla}>
            {u_m.sigla}
          </Select.Option>
        ))
      }

      componentDidUpdate(prevProps) {
         if(!prevProps.visible && this.props.visible){
          this.props.form.resetFields();
          if(this.props.record)
            this.setState({formData:{produto: {nome: this.props.record.nome, nome_comercial: this.props.record.nome_comercial}, ...this.props.record}});
          else
            this.setState({formData:{}})
         }
      }

      render() {
        const { visible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Produto`}
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
              <Form.Item label="Produto">
                  {getFieldDecorator("produto", {
                    rules: [
                      { required: true, message: "Selecione um produto!" }
                    ],
                    initialValue: this.state.formData.produto
                    ? this.state.formData.produto.nome
                    : undefined
                  })(
                    <Select
                      name="produto"
                      disabled={!!this.props.record}
                      showAction={["focus", "click"]}
                      showSearch
                      placeholder="Selecione um produto..."
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={e =>{
                        this.onHadleChange({
                          target: { name: "produto", value: JSON.parse(e) }
                        })}
                      }
                    >
                      {this.listarProdutos(this.state.produtos)}
                    </Select>
                  )}
              </Form.Item>
              <Form.Item label="Unidade de Medida da Meta">
                  {getFieldDecorator("meta_um", {
                    rules: [
                      { required: true, message: "Selecione a unidade de medida!" }
                    ],
                    initialValue: this.state.formData.meta_um
                    ? this.state.formData.meta_um
                    : undefined
                  })(
                    <Select
                      name="meta_um"
                      showAction={["focus", "click"]}
                      showSearch
                      placeholder="Selecione uma unidade de medida..."
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={e =>{
                        this.onHadleChange({
                          target: { name: "meta_um", value: e }
                        })}
                      }
                    >
                      {this.listarUMs(this.state.u_ms)}
                    </Select>
                  )}
              </Form.Item>
              <Form.Item label="Valor da Meta">
                {getFieldDecorator('meta_valor',{
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.meta_valor
                })(
                  <Input
                    name="meta_valor"
                  />
                )}
              </Form.Item>
              <Form.Item label="Valor da Meta Reais">
                {getFieldDecorator('meta_valor_reais',{
                  /* rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ], */
                  initialValue: this.state.formData.meta_valor_reais
                })(
                  <Input
                    name="meta_valor_reais"
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
 