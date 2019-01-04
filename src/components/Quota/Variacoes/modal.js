import React from 'react'
import { Modal, Form, Input, Button, Select } from 'antd';
import * as UnidadeMedidaService from '../../../services/units-measures'

const ModalForm = Form.create()(
    class extends React.Component {
      state = {
        formData:{},
        camposExtras: [],
        u_ms: []
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
        const u_ms = await UnidadeMedidaService.list({
          limit: 100,
          status: true,
          fields: "nome,_id,sigla"
        });
      
        this.setState(prev => ({ ...prev, u_ms: u_ms.docs }));
      }  
      
      listarUMs = (u_ms) => {
        return u_ms.map(u_m => (
          <Select.Option key={u_m._id} value={u_m.sigla}>
            {u_m.sigla}
          </Select.Option>
        ))
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
              {this.props.group_caracteristicas && this.gerarFormulario(this.props.group_caracteristicas, getFieldDecorator)}
              <Form.Item label="Unidade de Medida da Cota">
                  {getFieldDecorator("cota_um", {
                    rules: [
                      { required: true, message: "Selecione a unidade de medida!" }
                    ],
                    initialValue: this.state.formData.cota_um
                    ? this.state.formData.cota_um
                    : undefined
                  })(
                    <Select
                      name="cota_um"
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
                          target: { name: "cota_um", value: e }
                        })}
                      }
                    >
                      {this.listarUMs(this.state.u_ms)}
                    </Select>
                  )}
              </Form.Item>
              <Form.Item label="Valor da Cota">
                {getFieldDecorator('cota_valor',{
                  rules: [
                    { required: true, message: "Este campo é obrigatório!" }
                  ],
                  initialValue: this.state.formData.cota_valor
                })(
                  <Input
                    name="cota_valor"
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
 