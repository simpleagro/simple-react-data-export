import React, { Component } from "react";
import { Button, Input, Form, Select, Affix } from "antd";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as UnitMeasuresService from "../../services/units-measures";
import { SimpleBreadCrumb } from "../common/SimpleBreadCrumb";

const Option = Select.Option;

class UnitMeasureForm extends Component {
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
    const dataUnitMeasures = await UnitMeasuresService.list();

    this.setState(prev => ({
      ...prev,
      listUnidade: [
        { _id: null, nome: "Nenhuma opção" },
        ...dataUnitMeasures.docs
      ]
    }));

    if (id) {
      const formData = await UnitMeasuresService.get(id);

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
            await UnitMeasuresService.create(this.state.formData);
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
            // else this.props.history.push("/unidades-medidas");
            this.props.history.push("/unidades-medidas/");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma unidade", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await UnitMeasuresService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/unidades-medidas");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma unidade ", err);
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
              : "/unidades-medidas"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Unidade" : "Nova Unidade"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Unidade
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" ref={input => (this.titleInput = input)} />)}
          </Form.Item>

          <Form.Item label="Sigla" {...formItemLayout}>
            {getFieldDecorator("sigla", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.sigla
            })(<Input name="sigla" />)}
          </Form.Item>

          <Form.Item label="Unidade Básica" {...formItemLayout}>
            {getFieldDecorator("unidade_basica_id", {
              rules: [
                { required: false, message: "Este campo é obrigatório!" }
              ],
              initialValue: this.state.formData.unidade_basica_id
            })(
              <Select
                name="unidade_basica_id"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione uma unidade básica..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "unidade_basica_id", value: e }
                  })
                }>
                {this.state.listUnidade &&
                  this.state.listUnidade.map((unidade, index) => (
                    <Option key={index} value={unidade._id}>
                      {unidade.nome}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Fator de Conversão" {...formItemLayout}>
            {getFieldDecorator("fator_conversao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.fator_conversao
            })(<Input name="fator_conversao" />)}
          </Form.Item>
          {console.log(this.state.formData)}
        </Form>
      </div>
    );
  }
}

const WrappepUnitMeasureForm = Form.create()(UnitMeasureForm);

export default WrappepUnitMeasureForm;
