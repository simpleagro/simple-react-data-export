import React, { Component } from "react";
import { Breadcrumb, Button, Icon, Input, Form, Select, Affix } from "antd";

import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as SalesTypeService from "../../../services/types-of-sale";

const Option = Select.Option;

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
    const dataType = await SalesTypeService.list();

    this.setState(prev => ({
      ...prev,
      listType: dataType
    }));

    if (id) {
      const formData = await SalesTypeService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          listType: dataType
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
            await SalesTypeService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();

            this.props.history.push("/tipo-de-vendas");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um tipo de venda", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await SalesTypeService.update(this.state.formData);
            flashWithSuccess();

            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/tipo-de-vendas");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um tipo de venda ", err);
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
              : "/tipo-de-vendas"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={[
              this.state.editMode ? "Editando" : "Novo",
              " Tipo de Venda"
            ]}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Tipo de Venda
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
                autoFocus
              />
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepTypeForm = Form.create()(TypeForm);

export default WrappepTypeForm;
