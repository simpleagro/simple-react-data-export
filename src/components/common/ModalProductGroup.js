import React from 'react'
import { Modal, Form, Button, Select } from 'antd';
import * as GroupsServices from "../../services/productgroups";

const ModalForm = Form.create()(
    class extends React.Component {
      state = {formData:{}, grupos_produtos: []}

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
        this.setState(prev => ({ ...prev, grupos_produtos: grupos_produtos.docs }));
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
            title={`${this.props.record? 'Editar':'Add'} Grupo de Produto`}
            onCancel={onCancel}
            footer={[
              <Button key="back" onClick={onCancel}>Cancelar</Button>,
              <Button key="submit" type="primary" onClick={() => this.onSalve()}>
                {`${this.props.record? 'Editar':'Adicionar'}`}
              </Button>
            ]}
          >
            <Form layout="vertical" onChange={this.onHadleChange}>
              <Form.Item /* label="Grupo de Produto" */>
                {getFieldDecorator("grupo_produto", {
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.grupo_produto
                    ? this.state.formData.grupo_produto
                    : undefined
                })(
                  <Select
                    name="grupo_produto"
                    showAction={["focus", "click"]}
                    showSearch
                    placeholder="Selecione um grupo de produto..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={e => {
                      e = JSON.parse(e)
                      this.onHadleChange({
                        target: { name: "grupo_produto", value: e }
                      })}
                    }
                  >
                    {this.listarGruposProdutos(this.state.grupos_produtos)}
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
 