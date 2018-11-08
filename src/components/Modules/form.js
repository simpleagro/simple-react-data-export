import React, { Component } from "react";
import { Button, Icon, Input, Form, Select, Affix } from "antd";

import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as ModuleService from "../../services/modules";
import * as EntityService from "../../services/entities";
import { SimpleBreadCrumb } from "../common/SimpleBreadCrumb";

const Option = Select.Option;

class ModuleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {}
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const dataModule = await ModuleService.list();
    const dataEntity = await EntityService.list();

    this.setState(prev => ({
      ...prev,
      listModule: dataModule,
      listEntity: dataEntity.docs
    }));

    if (id) {
      const formData = await ModuleService.get(id);

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
            const created = await ModuleService.create(this.state.formData);
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
            // else this.props.history.push("/modulos");
            this.props.history.push("/modulos/");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um módulo", err);
          }
        } else {
          try {
            const updated = await ModuleService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/modulos");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um módulo ", err);
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
              : "/modulos"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={[this.state.editMode ? "Editando" : "Novo", " Módulo"]}>
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar módulo
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

          <Form.Item label="Entidade" {...formItemLayout}>
            {getFieldDecorator("entidades", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.entidades
            })(
              <Select
                name="entidades"
                showAction={["focus", "click"]}
                showSearch
                mode="multiple"
                style={{ width: 200 }}
                placeholder="Selecione uma entidade..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "entidades", value: e }
                  })
                }>
                {this.state.listEntity &&
                  this.state.listEntity.map((ent, index) => (
                    <Option key={index} value={ent._id}>
                      {" "}
                      {ent.nome}{" "}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepModuleForm = Form.create()(ModuleForm);

export default WrappepModuleForm;
