import React, { Component } from "react";
import locale from "antd/lib/date-picker/locale/pt_BR";
import moment from "moment";
import "moment/locale/pt-br";

import { Breadcrumb, Button, Icon, Input, Form, Affix, DatePicker } from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as SeasonService from "../../services/seasons";
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class SeasonForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {}
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

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  handleFormState = event => {
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await SeasonService.create(this.state.formData);
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
          }
        } else {
          try {
            const updated = await SeasonService.update(this.state.formData);
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
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button
              href={
                this.props.location.state && this.props.location.state.returnTo
                  ? this.props.location.state.returnTo.pathname
                  : "/safras"
              }
            >
              <Icon type="arrow-left" />
              Voltar para tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Safra" : "Nova Safra"}
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
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
                ref={input => (this.titleInput = input)}
              />
            )}
          </Form.Item>
          <Form.Item label="Data de início" {...formItemLayout}>
            {getFieldDecorator("inicio", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: moment(this.state.formData.inicio)
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
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: moment(this.state.formData.fim)
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
