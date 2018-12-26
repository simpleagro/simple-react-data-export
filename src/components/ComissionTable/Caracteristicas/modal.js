import React from 'react'
import { Modal, Form, Button, Input, Select } from 'antd';
import * as ProductService from '../../../services/products'

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, produtos: []}

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
          limit: 100,
          status: true,
          fields: "nome,_id,nome_comercial"
        });
      
        this.setState(prev => ({ ...prev, produtos: produtos.docs }));
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

      componentDidUpdate(prevProps) {
         if(!prevProps.visible && this.props.visible){
          this.props.form.resetFields();
          this.setState({formData:{produto: {...this.props.record}}});
         }
      }

      render() {
        const { visible, onCancel, onCreate, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Produto`}
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                {`${this.props.record? 'Editar':'Adicionar'}`}
              </Button>
            ]}
          >
            <Form layout="vertical" onChange={this.onHadleChange}>
              <Form.Item label="Nome">
                  {getFieldDecorator("produto", {
                    initialValue: this.state.formData.produto
                    ? this.state.formData.produto.nome
                    : undefined
                  })(
                    <Select
                      name="produto"
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
              {/* <Form.Item label="Nome Comercial">
                {getFieldDecorator('nome_comercial',{initialValue: this.state.formData.nome_comercial})(
                  <Input
                    name="nome_comercial"
                    disabled
                  />
                )}
              </Form.Item> */}
            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 