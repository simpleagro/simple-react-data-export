import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Select,
  Affix
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as PaymentFormService from "../../../services/form-of-payment";

const Option = Select.Option;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class TypeForm extends Component {
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
    const dataType = await PaymentFormService.list();

    this.setState(prev => ({
      ...prev,
      listType: dataType,
    }));

    if (id) {
      const formData = await PaymentFormService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          listType: dataType
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
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            await PaymentFormService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();

            this.props.history.push("/forma-de-pagamento/");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma forma de pagamento", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await PaymentFormService.update(this.state.formData);
            flashWithSuccess();

            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/forma-de-pagamento");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma forma de pagamento ", err);
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
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button
              href={
                this.props.location.state && this.props.location.state.returnTo
                  ? this.props.location.state.returnTo.pathname
                  : "/forma-de-pagamento"
              }
            >
              <Icon type="arrow-left" />
              Voltar para tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={[ this.state.editMode ? "Editando" : "Novo", " Forma de Pagamento" ]}
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Forma de Pagamento
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>

          <Form.Item label="Descrição" {...formItemLayout}>
            {getFieldDecorator("descricao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.descricao
            })(<Input name="descricao" ref={input => (this.titleInput = input)} />)}
          </Form.Item>

        </Form>

      </div>
    );
  }
}

const WrappepTypeForm = Form.create()(TypeForm);

export default WrappepTypeForm;