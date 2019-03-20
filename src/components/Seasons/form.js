import React, { Component } from "react";
import locale from "antd/lib/date-picker/locale/pt_BR";
import moment from "moment";
import "moment/locale/pt-br";

import { Button, Input, Form, Affix, DatePicker } from "antd";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as SeasonService from "../../services/seasons";
import { SimpleBreadCrumb } from "../common/SimpleBreadCrumb";

class SeasonForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await SeasonService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }


  }

  handleFormState = event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
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
            await SeasonService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            // if (this.props.location.state && this.props.location.state.returnTo)
            //   this.props.history.push(this.props.location.state.returnTo);
            // else this.props.history.push("/safras");
            this.props.history.push("/safras");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar a safra", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await SeasonService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/safras");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar a safra ", err);
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
          to={
            this.props.location.state && this.props.location.state.returnTo
              ? this.props.location.state.returnTo.pathname
              : "/safras"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Safra" : "Nova Safra"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Safra
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Descrição" {...formItemLayout}>
            {getFieldDecorator("descricao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.descricao
            })(
              <Input
                name="descricao"
                disabled={ this.state.editMode && true }
                autoFocus
              />
            )}
          </Form.Item>
          <Form.Item label="Data de início" {...formItemLayout}>
            {getFieldDecorator("inicio", {
              initialValue: this.state.formData.inicio
                ? moment(this.state.formData.inicio)
                : null
            })(
              <DatePicker
                format="DD/MM/YYYY"
                locale={locale}
                onChange={e =>
                  this.handleFormState({
                    target: { name: "inicio", value: e }
                  })
                }
                name="inicio"
              />
            )}
          </Form.Item>
          <Form.Item label="Data de fim" {...formItemLayout}>
            {getFieldDecorator("fim", {
              initialValue: this.state.formData.fim
                ? moment(this.state.formData.fim)
                : null
            })(
              <DatePicker
                format="DD/MM/YYYY"
                locale={locale}
                onChange={e =>
                  this.handleFormState({
                    target: { name: "fim", value: e }
                  })
                }
                name="fim"
              />
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepSeasonForm = Form.create()(SeasonForm);

export default WrappepSeasonForm;
