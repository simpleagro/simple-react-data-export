import React, { Component } from "react";
import { Button, Icon, Input, Form, Select, Affix } from "antd";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as EntityService from "../../services/entities";
import { SimpleBreadCrumb } from "../common/SimpleBreadCrumb";

const Option = Select.Option;

class EntityForm extends Component {
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
    const dataEntity = await EntityService.list();

    this.setState(prev => ({
      ...prev,
      listCargo: dataEntity
    }));

    if (id) {
      const formData = await EntityService.get(id);

      if (formData) {
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: !!id
        }));
      }
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  handleFormState = event => {
    const form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      this.setState({ savingForm: true });
      if (!this.state.editMode) {
        if (Object.keys(this.state.formData).length === 0) {
          flashWithSuccess("Sem alterações para salvar", " ");
        }

        try {
          const created = await EntityService.create(this.state.formData);
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
          // else this.props.history.push("/entidades");
          this.props.history.push("/entidades/");
        } catch (err) {
          if (err && err.response && err.response.data) parseErrors(err);
          console.log("Erro interno ao adicionar uma entidade", err);
          this.setState({ savingForm: false });
        }
      } else {
        try {
          const updated = await EntityService.update(this.state.formData);
          flashWithSuccess();
          // a chamada do formulário pode vir por fluxos diferentes
          // então usamos o returnTo para verificar para onde ir
          // ou ir para o fluxo padrão
          if (this.props.location.state && this.props.location.state.returnTo) {
            this.props.history.push(this.props.location.state.returnTo);
          } else this.props.history.push("/entidades");
        } catch (err) {
          if (err && err.response && err.response.data) parseErrors(err);
          console.log("Erro interno ao atualizar uma entidade ", err);
          this.setState({ savingForm: false });
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
              : "/entidades"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={[this.state.editMode ? "Editando" : "Nova", " Entidade"]}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Entidade
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

          <Form.Item label="Filial" {...formItemLayout}>
            {getFieldDecorator("multiFilial", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.multiFilial ? "Sim" : "Nao"
            })(
              <Select
                name="multiFilial"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione uma opção..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "multiFilial", value: e }
                  })
                }>
                <Option value="false">Não</Option>
                <Option value="true">Sim</Option>
              </Select>
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepEntityForm = Form.create()(EntityForm);

export default WrappepEntityForm;
