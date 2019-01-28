import React, { Component } from "react";
import {
  Button,
  Input,
  Form,
  Affix,
  InputNumber,
  DatePicker,
  Checkbox
} from "antd";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as PreHarvestService from "../../../services/field-registration.pre-harvest";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import moment from "moment";
import TextArea from "antd/lib/input/TextArea";

class PreHarvestForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      estados: [],
      cidades: [],
      field_registration_id: this.props.match.params.field_registration_id,
      fetchingCidade: false,
      drawingMap: false,
      editingMap: false,
      savingForm: false
    };
  }

  async componentDidMount() {
    const { field_registration_id, id } = this.props.match.params;

    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        responsavel: {
          nome: JSON.parse(localStorage.getItem("simpleagro_painel")).painelState.userData.user.nome,
          id: JSON.parse(localStorage.getItem("simpleagro_painel")).painelState.userData.user._id
        }
      }
    }))

    if (id) {
      const formData = await PreHarvestService.get(field_registration_id)(id);

      if (formData) {
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          editingMap: id ? true : false,
        }));
      }
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);

    this.setState(prev => ({ ...prev }));
  }

  handleFormState = async event => {
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
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await PreHarvestService.create(
              this.state.field_registration_id
            )(this.state.formData);
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/inscricao-de-campo/${this.props.match.params.field_registration_id}/pre-colheita/${
                created._id
              }/autorizacao`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            const updated = await PreHarvestService.update(
              this.state.field_registration_id
            )(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              this.props.location.state.returnTo === "preColheitaLab"
              ?  "/pre-colheita"
              : `/inscricao-de-campo/${this.props.match.params.field_registration_id}/pre-colheita`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar", err);
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <div>
        <SimpleBreadCrumb
          to={ this.props.location.state.returnTo === "preColheitaLab"
            ? "/pre-colheita"
            : `/inscricao-de-campo/${this.props.match.params.field_registration_id}/pre-colheita`}
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={
              this.state.editMode ? "Editando Pré Colheita" : "Nova Pré Colheita"
            }>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Pré Colheita
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>

          <Form.Item label="Responsável" {...formItemLayout}>
            {getFieldDecorator("responsavel", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.responsavel && this.state.formData.responsavel.nome
            })(<Input name="responsavel" disabled ref={input => (this.titleInput = input)} />)}
          </Form.Item>

          <Form.Item label="Reamostra" {...formItemLayout}>
            {getFieldDecorator("reamostra", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.reamostra
            })(<Checkbox
              checked={this.state.formData.reamostra}
              onChange={e =>
                this.handleFormState({
                  target: {
                    name: "reamostra",
                    value: e.target.checked
                  }
                })
              } />)}
          </Form.Item>

          <Form.Item label="Aprovado" {...formItemLayout}>
            {getFieldDecorator("aprovado", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.aprovado
            })(<Checkbox
              checked={this.state.formData.aprovado}
              onChange={e =>
                this.handleFormState({
                  target: {
                    name: "aprovado",
                    value: e.target.checked
                  }
                })
              } />)}
          </Form.Item>

          <Form.Item label="Código ERP" {...formItemLayout}>
            {getFieldDecorator("codigo_erp", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.codigo_erp
            })(<InputNumber min={0} name="codigo_erp" />)}
          </Form.Item>

          <Form.Item label="Nome do Talhão" {...formItemLayout}>
            {getFieldDecorator("nome_talhao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome_talhao
            })(<Input name="nome_talhao" />)}
          </Form.Item>

          <Form.Item label="Data" {...formItemLayout}>
            {getFieldDecorator("data", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.data ? moment(
                this.state.formData.data
                  ? this.state.formData.data
                  : new Date(), "YYYY-MM-DD"
                ) : null
            })(<DatePicker
              onChange={(data, dataString) =>
                this.handleFormState({
                  target: {
                    name: "data",
                    value: moment(dataString, "DD/MM/YYYY").format("YYYY-MM-DD"
                    )}})}
              allowClear
              format={"DD/MM/YYYY"}
              style={{ width: 200 }}
              name="data"
              />)}
          </Form.Item>

          <Form.Item label="Nº Colhedoras" {...formItemLayout}>
            {getFieldDecorator("num_colhedoras", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.num_colhedoras
            })(<InputNumber min={0} name="num_colhedoras" />)}
          </Form.Item>

          <Form.Item label="Data da Colheita" {...formItemLayout}>
            {getFieldDecorator("data_colheita", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.data_colheita ? moment(
                this.state.formData.data_colheita
                  ? this.state.formData.data_colheita
                  : new Date(), "YYYY-MM-DD"
                ) : null
            })(<DatePicker
              onChange={(data, dataString) =>
                this.handleFormState({
                  target: {
                    name: "data_colheita",
                    value: moment(dataString, "DD/MM/YYYY").format("YYYY-MM-DD"
                    )}})}
              allowClear
              format={"DD/MM/YYYY"}
              style={{ width: 200 }}
              name="data_colheita"
              />)}
          </Form.Item>

          <Form.Item label="Área do Talhão" {...formItemLayout}>
            {getFieldDecorator("area_talhao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.area_talhao
            })(<InputNumber min={0} name="area_talhao" />)}
          </Form.Item>

          <Form.Item label="Produtividade" {...formItemLayout}>
            {getFieldDecorator("produtividade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.produtividade
            })(<InputNumber min={0} name="produtividade" />)}
          </Form.Item>

          <Form.Item label="Observação" {...formItemLayout}>
            {getFieldDecorator("observacao", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.observacao
            })(<TextArea name="observacao" />)}
          </Form.Item>

        </Form>

      </div>
    );
  }
}

const WrappepPreHarvestForm = Form.create()(PreHarvestForm);

export default WrappepPreHarvestForm;
