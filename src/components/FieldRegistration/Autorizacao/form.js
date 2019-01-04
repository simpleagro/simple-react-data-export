import React, { Component } from "react";
import {
  Button,
  Icon,
  Input,
  Form,
  Affix,
  InputNumber,
  DatePicker,
} from "antd";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as AuthorizationService from "../../../services/field-registration.transport-authorization";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import moment from "moment";

class AuthorizationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      field_registration_id: this.props.match.params.field_registration_id,
      pre_harvest_id: this.props.match.params.pre_harvest_id,
      isMarkerShown: false,
      editingMap: false,
      savingForm: false
    };
  }

  async componentDidMount() {

    const { field_registration_id, pre_harvest_id, id } = this.props.match.params;

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
      const formData = await AuthorizationService.get(field_registration_id)(pre_harvest_id)(id);

      if (formData) {
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          editingMap: id ? true : false
        }));
      }
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  };

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
            const created = await AuthorizationService.create(
              this.state.field_registration_id
            )(this.state.pre_harvest_id)(this.state.formData);
            this.setState(prev => ({
              ...prev,
              openForm: false,
              formData: {},
              editMode: false
            }));
            flashWithSuccess();
            this.props.history.push(
              `/inscricao-de-campo/${this.props.match.params.field_registration_id}/pre-colheita/${
                this.props.match.params.pre_harvest_id
              }/autorizacao`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma autorização", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            const updated = await AuthorizationService.update(
              this.state.field_registration_id
            )(this.state.pre_harvest_id)(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/inscricao-de-campo/${this.props.match.params.field_registration_id}/pre-colheita/${
                this.props.match.params.pre_harvest_id
              }/autorizacao`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma autorização ", err);
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
          to={`/inscricao-de-campo/${this.props.match.params.field_registration_id}/pre-colheita/${
            this.props.match.params.pre_harvest_id
          }/autorizacao`}
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Autorização" : "Nova Autorização"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Autorização
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>

          <Form.Item label="Nº da Autorização" {...formItemLayout}>
            {getFieldDecorator("numero_autorizacao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.numero_autorizacao
            })(<Input name="numero_autorizacao" ref={input => (this.titleInput = input)} />)}
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

          <Form.Item label="Motorista" {...formItemLayout}>
            {getFieldDecorator("motorista", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.motorista
            })(<Input name="motorista" />)}
          </Form.Item>

          <Form.Item label="Placa" {...formItemLayout}>
            {getFieldDecorator("placa", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.placa
            })(<Input name="placa" style={{ width: 200 }}  />)}
          </Form.Item>

          <Form.Item label="CPF" {...formItemLayout}>
            {getFieldDecorator("cpf", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cpf
            })(<Input name="cpf" style={{ width: 200 }} />)}
          </Form.Item>

          <Form.Item label="Documento" {...formItemLayout}>
            {getFieldDecorator("dm", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.dm
            })(<Input name="dm" />)}
          </Form.Item>

          <Form.Item label="Saída do Caminhão" {...formItemLayout}>
            {getFieldDecorator("saida_caminhao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.saida_caminhao ? moment(
                this.state.formData.saida_caminhao
                  ? this.state.formData.saida_caminhao
                  : new Date(), "YYYY-MM-DD"
                ) : null
            })(<DatePicker
                showTime
                onChange={(data, dataString) =>
                  this.handleFormState({
                    target: {
                      name: "saida_caminhao",
                      value: moment(dataString, "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm"
                      )}})}
                allowClear
                format={"DD/MM/YYYY HH:mm"}
                style={{ width: 200 }}
                name="saida_caminhao"
              />)}
          </Form.Item>

          <Form.Item label="Responsável" {...formItemLayout}>
            {getFieldDecorator("responsavel", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.responsavel && this.state.formData.responsavel.nome
            })(<Input name="responsavel" disabled />)}
          </Form.Item>

        </Form>

        {[ console.log(this.state), console.log(this.props) ]}

      </div>
    );
  }
}

const WrappepAuthorizationForm = Form.create()(AuthorizationForm);

export default WrappepAuthorizationForm;
