import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Affix
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as CompanyBranchService from "../../../services/companies.branchs";

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class CompanyBranchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      company_id: this.props.match.params.company_id
    };
  }

  async componentDidMount() {
    const { company_id, id } = this.props.match.params;

    if (id) {
      const formData = await CompanyBranchService.get(company_id)(id);

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
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await CompanyBranchService.create(
              this.state.company_id
            )(this.state.formData);
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/empresas/${this.props.match.params.company_id}/filiais/`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma filial", err);
          }
        } else {
          try {
            const updated = await CompanyBranchService.update(
              this.state.company_id
            )(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/empresas/${this.props.match.params.company_id}/filiais/`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma filial ", err);
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
              href={`/empresas/${
                this.props.match.params.company_id
              }/filiais`}
            >
              <Icon type="arrow-left" />
              Voltar para a tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={
              this.state.editMode ? "Editando Filial" : "Nova Filial"
            }
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Filial
            </Button>
          </PainelHeader>
        </Affix>
        
        <Form onChange={this.handleFormState}>

          <Form.Item label="Razão Social" {...formItemLayout}>
            {getFieldDecorator("razao_social", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.razao_social
            })(<Input name="razao_social" ref={input => (this.titleInput = input)} />)}
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

const WrappepCompanyBranchForm = Form.create()(CompanyBranchForm);

export default WrappepCompanyBranchForm;
