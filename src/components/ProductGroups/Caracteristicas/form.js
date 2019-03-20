import React, { Component } from "react";
import { Button, Input, Form, Affix, Checkbox, Card, List, Icon, Select } from "antd";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import * as GroupFeaturesService from "../../../services/productgroups.features";
import styled from "styled-components";
import ModalForm from './modal'
import CamposExtras from '../DadosBasicos/camposExtras'

const CardStyled = styled(Card)`
  background: #fff;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e3cccc;
`;

class GroupFeatureForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      group_id: this.props.match.params.group_id || this.props.group,
      savingForm: false,
      visible: false,
      visibleCamposExtra: false,
      loadingData: false,
      record: {}
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await GroupFeaturesService.get(this.state.group_id)(
        id
      );

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }


  }

  handleFormState = async event => {
    //console.log(event);
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        //console.log(this.state.formData);
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            await GroupFeaturesService.create(this.state.group_id)(
              this.state.formData
            );
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              this.props.match.params.group_id
                ? `/grupos-produtos/${this.props.match.params.group_id}/caracteristicas-produtos/`
                : "/caracteristicas-produtos"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma característica", err);
          } finally {
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await GroupFeaturesService.update(this.state.group_id)(
              this.state.formData
            );
            flashWithSuccess();
            this.props.history.push(
              this.props.match.params.group_id
                ? `/grupos-produtos/${this.props.match.params.group_id}/caracteristicas-produtos/`
                : "/caracteristicas-produtos"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma característica ", err);
          } finally {
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  showModalCampoExtra = (record) => {
    this.setState({
      visibleCamposExtra: true,
      record,
      editarField: !!record
    });
  }

  handleOk = (item) => {
    this.setState(prev => {
      if(prev.formData.opcoes)
        return ({
          visible: false,
          formData: {...prev.formData, opcoes: [...prev.formData.opcoes, item]}
        })

      return( {
        visible: false,
        formData: {...prev.formData, opcoes: [item]}
      })
    });
  }

  handleOkCampoExtra = (item) => {
    this.setState(prev => {
      if(prev.formData.fields){
        const dados = prev.formData;
        if(this.state.editarField){
          dados.fields = dados.fields.filter(dado => dado != this.state.record)
        }
        return ({
          visibleCamposExtra: false,
          formData: {...dados, fields: [...prev.formData.fields, item]},
          editarField: false
        })
      }

      return( {
        visibleCamposExtra: false,
        formData: {...prev.formData, fields: [item]},
        editarField: false
      })
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visibleCamposExtra: false
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  removerOpcao = (opcao) => {
    if (opcao) {
      this.setState(prev => {
        if(prev.formData.opcoes)
          return ({
            formData: {...prev.formData, opcoes: prev.formData.opcoes.filter(item => item.value !== opcao) }
          })
      });
    }
  };

  changeStatus = async (id, newStatus, chave) => {
    try {
      //await GroupService.changeStatus(id, newStatus);
      let recordName = "";

      let _fields = this.state.formData.fields.map(item => {
        if (item.chave === chave) {
          item.status = newStatus;
          recordName = item.label;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        formData: {...prev.formData, fields: _fields }
      }));

      flashWithSuccess(
        "",
        `O campo extra, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do campo extra", err);
    }
  };

  removeRecord = (record) => {
    if (record) {
      this.setState(prev => {
        if(prev.formData.fields)
          return ({
            formData: {...prev.formData, fields: prev.formData.fields.filter(item => item.chave !== record.chave) }
          })
      });
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };
    const tailFormItemLayout = {
      wrapperCol: { span: 12, offset: 2 },
    };

    return (
      <div>
        <SimpleBreadCrumb
          to={
            this.props.match.params.group_id
              ? `/grupos-produtos/${this.props.match.params.group_id}/caracteristicas-produtos`
              : "/caracteristicas-produtos"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editar Característica" : "Nova Característica"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Característica
            </Button>
          </PainelHeader>
        </Affix>

        <Form onChange={this.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator('label', {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.label
            })(
              <Input
                name="label"
                autoFocus
              />
            )}
          </Form.Item>
          <Form.Item label="Chave" {...formItemLayout}>
            {getFieldDecorator('chave', {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.chave
            })(
              <Input
                name="chave"
              />
            )}
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            {getFieldDecorator("obrigatorio", {
                initialValue: this.state.formData.obrigatorio
            })(
            <Checkbox
                checked={this.state.formData.obrigatorio}
                onChange={e =>
                this.handleFormState({
                    target: {
                    name: "obrigatorio",
                    value: e.target.checked
                    }
                })
                }>
                Característica obrigatória?
            </Checkbox>
            )}
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            {getFieldDecorator("variacao_preco", {
                initialValue: this.state.formData.variacao_preco
            })(
            <Checkbox
                checked={this.state.formData.variacao_preco}
                onChange={e =>
                this.handleFormState({
                    target: {
                    name: "variacao_preco",
                    value: e.target.checked
                    }
                })
                }>
                Possui Variação de Preço?
            </Checkbox>
            )}
          </Form.Item>
          {this.state.formData.variacao_preco && <Form.Item label="Tipo Variação Preço" {...formItemLayout}>
            {getFieldDecorator("tipo_preco", {
              initialValue: this.state.formData.tipo_preco
            })(
              <Select
                name="tipo_preco"
                showAction={["focus", "click"]}
                showSearch
                placeholder="Selecione um tipo..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "tipo_preco", value: e }
                  })
                }>
                <Select.Option value="TABELA_BASE">Tabela Preço Base</Select.Option>
                <Select.Option value="TABELA_CARACTERISTICA">Tabela Preço Característica</Select.Option>
              </Select>
            )}
          </Form.Item>}
        </Form>
        <div style={{marginBottom: '30px'}} >
          <CamposExtras
            showModal={this.showModalCampoExtra}
            loadingData= {this.state.loadingData}
            changeStatus={this.changeStatus}
            removeRecord={this.removeRecord}
            formData={this.state.formData}
            visible={this.state.visibleCamposExtra}
            handleCancel={this.handleCancel}
            handleOk={this.handleOkCampoExtra}
            saveFormRef={this.saveFormRef}
            record={this.state.record}
            titleCard="Campos Extras"
          />
        </div>

        <CardStyled
          type="inner"
          title="Opções"
          bordered
          extra={
            <Button
              type="primary"
              icon="plus"
              onClick={() => this.showModal()}
            >
              Adicionar
            </Button>
          }
        >
          <List
            bordered
            size="small"
            dataSource={this.state.formData.opcoes || []}
            renderItem={item => (<List.Item actions={[
              <Icon type="close-circle" theme="filled" onClick={ () => this.removerOpcao(item.value)} />
            ]}>{item.label}</List.Item>)}
          />
        </CardStyled>

        <ModalForm
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          wrappedComponentRef={this.saveFormRef}
        />

      </div>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  return {
    group: painelState.userData.group
  };
};

const WrappepGroupFeatureForm = Form.create()(GroupFeatureForm);

export default withRouter(connect(mapStateToProps)(WrappepGroupFeatureForm));
