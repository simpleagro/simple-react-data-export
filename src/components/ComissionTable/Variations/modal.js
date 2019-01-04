import React from 'react'
import { Modal, Form, Input, Button, Select } from 'antd';

const ModalForm = Form.create()(
    class extends React.Component {
      state = {
        formData:{},
        camposExtras: []
      }

      onHadleChange = event => {
        if (!event.target.name) return;
        let form = Object.assign({}, this.state.formData, {
            [event.target.name]: event.target.value
          });
        this.setState(prev => ({ ...prev, formData: form }));
      };

      onSalve = () => {
        console.log(this.state.formData)
        this.props.form.validateFields(async err => {
            if (err) return;
            else {
                this.props.onCreate(this.state.formData)
            }
        });
      }

      componentDidUpdate(prevProps) {
         if(!prevProps.visible && this.props.visible){
          this.props.form.resetFields();
          this.setState({formData:{...this.props.record}});
          //console.log(this.props.record)
         }
      }

      /* async componentDidMount() {
        console.log('aqqq', this.props.group_caracteristicas)
        if(this.props.group_caracteristicas){
          const groupData = this.props.group_caracteristicas
          console.log('aqqq', this.props.group_caracteristicas)
          
          if (groupData)
            this.setState(prev => ({
              ...prev,
              group_caracteristicas: groupData
            }));
            
        }
      }   */
      
      gerarFormulario = (caracteristicas, getFieldDecorator) => {
        return caracteristicas.map( caracteristica => 
          <Form.Item
            label={`${caracteristica.label}`}
            key= { `${caracteristica.chave}` }
          >
            {getFieldDecorator(`${caracteristica.chave}`, {
              initialValue: this.state.formData[`${caracteristica.chave}`],
              rules: [{ required: caracteristica.obrigatorio, message: 'Selecione!'}],
            })(
              <Select 
                placeholder="Selecione"
                name= { `${caracteristica.chave}` }
                showSearch
                onChange={e =>{
                    this.onHadleChange({
                      target: { name: `${caracteristica.chave}`, value: e }
                    })
                  }
                }
              >
                {caracteristica.opcoes.map(opcao => 
                  <Select.Option value={opcao.value} key={opcao.value} >{opcao.label}</Select.Option>
                )}
              </Select>
            )}
          </Form.Item>
        )
      }

      gerarFormularioCarac = (caracteristicas, getFieldDecorator) => {
        return caracteristicas.map( caracteristica => 
          <Form.Item
            label={`${caracteristica.label}  (%)`}
            key= { `comissao_${caracteristica.chave}` }
          >
            {getFieldDecorator(`comissao_${caracteristica.chave}`, {
              initialValue: this.state.formData[`comissao_${caracteristica.chave}`],
              //rules: [{ required: caracteristica.obrigatorio, message: 'Selecione!'}],
            })(
              <Input
                name= { `comissao_${caracteristica.chave}` } />
            )}
          </Form.Item>
        )
      }

      gerarFormularioPreco = (group_regras_preco, getFieldDecorator) => {
        return group_regras_preco.map( regra_preco => 
          <Form.Item
            label={`${regra_preco.label} (%)`}
            key= { `comissao_${regra_preco.chave}` }
          >
            {getFieldDecorator(`comissao_${regra_preco.chave}`, {
              initialValue: this.state.formData[`comissao_${regra_preco.chave}`],
              //rules: [{ required: regra_preco.obrigatorio, message: 'Selecione!'}],
            })(
              <Input
                name= { `comissao_${regra_preco.chave}` } />
            )}
          </Form.Item>
        )
      }

      render() {
        const { visible, onCancel, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Preço`}
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
              {this.props.group_caracteristicas && this.gerarFormulario(this.props.group_caracteristicas, getFieldDecorator)}
              {this.props.group_regra_preco && this.gerarFormularioPreco(this.props.group_regra_preco, getFieldDecorator)}
              {this.props.group_caracteristicas && this.gerarFormularioCarac(this.props.group_caracteristicas.filter(item => item.tipo_preco == 'TABELA_CARACTERISTICA'), getFieldDecorator)}
              <Form.Item label="Frete (%)">
                {getFieldDecorator('comissao_frete', {
                  //rules: [{ required: true, message: "Este campo é obrigatório!" }],
                  initialValue: this.state.formData.comissao_frete
                })(
                  <Input
                    name="comissao_frete"
                    ref={input => (this.titleInput = input)}
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
 