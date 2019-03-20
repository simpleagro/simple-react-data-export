import React, { Component } from "react";
import { Button, Input, Form, Affix } from "antd";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import * as CompanyBranchService from "../../../services/companies.branchs";

class CompanyBranchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      company_id: this.props.match.params.company_id || this.props.empresa,
      savingForm: false
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await CompanyBranchService.get(this.state.company_id)(
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
    console.log(event);
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
            await CompanyBranchService.create(this.state.company_id)(
              this.state.formData
            );
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              this.props.match.params.company_id
                ? `/empresas/${this.props.match.params.company_id}/filiais/`
                : "/filiais"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma filial", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await CompanyBranchService.update(this.state.company_id)(
              this.state.formData
            );
            flashWithSuccess();
            this.props.history.push(
              this.props.match.params.company_id
                ? `/empresas/${this.props.match.params.company_id}/filiais/`
                : "/filiais"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma filial ", err);
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
            this.props.match.params.company_id
              ? `/empresas/${this.props.match.params.company_id}/filiais`
              : "/filiais"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Filial" : "Nova Filial"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Filial
            </Button>
          </PainelHeader>
        </Affix>

        <Form onChange={this.handleFormState}>
          <Form.Item label="Razão Social" {...formItemLayout}>
            {getFieldDecorator("razao_social", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.razao_social
            })(
              <Input
                name="razao_social"
                autoFocus
              />
            )}
          </Form.Item>

          <Form.Item label="Nome Fantasia" {...formItemLayout}>
            {getFieldDecorator("nome_fantasia", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome_fantasia
            })(<Input name="nome_fantasia" />)}
          </Form.Item>

          <Form.Item label="CPF/CNPJ" {...formItemLayout}>
            {getFieldDecorator("cpf_cnpj", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cpf_cnpj
            })(<Input name="cpf_cnpj" />)}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  return {
    empresa: painelState.userData.empresa
  };
};

const WrappepCompanyBranchForm = Form.create()(CompanyBranchForm);

export default withRouter(connect(mapStateToProps)(WrappepCompanyBranchForm));
