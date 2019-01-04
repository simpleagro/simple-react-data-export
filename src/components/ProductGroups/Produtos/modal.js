import React from 'react'
import { Modal, Form, Input, Button, Select } from 'antd';
import * as GroupsFeaturesService from "../../../services/productgroups.features";

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

      async componentDidMount() {
        if(this.props.group_id){
          const groupData = await GroupsFeaturesService.list(this.props.group_id)();
          
          if (groupData)
            this.setState(prev => ({
              ...prev,
              group_caracteristicas: groupData.docs
            }));
            
        }
      }   

      gerarCamposExtras = (caracteristicas, getFieldDecorator) => {
        let fields = []

        caracteristicas.forEach(item => {
          if(item.fields)
            fields = [...fields, ...item.fields]
        });

        return fields.map( field => 
          <Form.Item
            label={`${field.label}`}
            key= { `${field.chave}` }
          >
            {getFieldDecorator(`${field.chave}`, {
              initialValue: this.state.formData[`${field.chave}`],
              rules: [{ required: field.obrigatorio, message: 'Este campo é obrigatório!'}],
            })(
                <Input
                  name={`${field.chave}`}
                />
            )}
          </Form.Item>
        )
        
      }
      
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

      render() {
        const { visible, onCancel, form } = this.props;
        const { getFieldDecorator } = form;
        
        return (
          <Modal
            visible={visible}
            title={`${this.props.record? 'Editar':'Add'} Variação`}
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
              {this.state.group_caracteristicas && this.gerarFormulario(this.state.group_caracteristicas, getFieldDecorator)}
              {this.state.group_caracteristicas && this.gerarCamposExtras(this.state.group_caracteristicas, getFieldDecorator)}
            </Form>
          </Modal>
        );
      }
    }
  );

  export default ModalForm;
 