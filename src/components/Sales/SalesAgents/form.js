import React, { Component } from "react";
import { Button, Icon, Input, Form, Select, Affix, Spin } from "antd";

import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import { SFFPorcentagem } from "../../common/formFields/SFFPorcentagem";
import * as AgentSalesService from "../../../services/sales-agents";
import * as IBGEService from "../../../services/ibge";

const Option = Select.Option;

class AgentSalesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      estados: [],
      cidades: [],
      formData: {},
      savingForm: false
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const dataAgentSales = await AgentSalesService.list();

    this.setState(prev => ({
      ...prev,
      listAgentSales: [
        { _id: null, nome: "Nenhuma opção" },
        ...dataAgentSales.docs
      ]
    }));

    if (id) {
      const formData = await AgentSalesService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          agentSaleId: id,
          listAgentSales: this.state.listAgentSales.filter(
            ag => ag._id !== id && (ag.agente_pai && ag.agente_pai.id !== id)
          ),
          editMode: id ? true : false
        }));
    }

    const estados = await IBGEService.listaEstados();
    this.setState(prev => ({ ...prev, estados, fetchingCidade: false }));
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
            await AgentSalesService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();

            this.props.history.push("/agente-de-vendas");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um agente de vendas", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await AgentSalesService.update(this.state.formData);
            flashWithSuccess();

            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/agente-de-vendas");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um agente de vendas ", err);
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
              : "/agente-de-vendas"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={[
              this.state.editMode ? "Editando" : "Novo",
              " Agente de Vendas"
            ]}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Agente de Vendas
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" autoFocus />)}
          </Form.Item>

          <Form.Item label="CPF/CNPJ" {...formItemLayout}>
            {getFieldDecorator("cpf_cnpj", {
              rules: [{ required: true, message: "Este campo é obrigatótio!" }],
              initialValue: this.state.formData.cpf_cnpj
            })(<Input name="cpf_cnpj" />)}
          </Form.Item>

          <Form.Item label="Estado" {...formItemLayout}>
            {getFieldDecorator("estado", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.estado
            })(
              <Select
                name="estado"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um estado..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSelect={e => this.listaCidadesPorEstado(e)}>
                {this.state.estados.map(uf => (
                  <Option key={uf} value={uf}>
                    {uf}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            label="Cidade"
            {...formItemLayout}
            help={this.generateHelper()}
            validateStatus={
              this.state.formData.estado === undefined ? "warning" : ""
            }>
            {getFieldDecorator("cidade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cidade
            })(
              <Select
                disabled={this.state.formData.estado === undefined}
                name="cidade"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSelect={e => {
                  this.onChangeSelectCidade(e);
                }}>
                {this.state.cidades.map(c => (
                  <Option key={c.id} value={c.nome}>
                    {c.nome}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Agente Pai" {...formItemLayout}>
            {getFieldDecorator("agente_pai", {
              initialValue:
                this.state.formData.agente_pai &&
                this.state.formData.agente_pai.nome
            })(
              <Select
                name="agente_pai"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um Agente Pai"
                onChange={e => {
                  let obj = JSON.parse(e);
                  if (!obj.id) obj = null;
                  this.handleFormState({
                    target: { name: "agente_pai", value: obj }
                  });
                }}>
                {this.state.listAgentSales &&
                  this.state.listAgentSales.map(ag => (
                    <Option
                      key={ag._id}
                      value={JSON.stringify({ id: ag._id, nome: ag.nome })}>
                      {ag.nome}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Logradouro" {...formItemLayout}>
            {getFieldDecorator("logradouro", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.logradouro
            })(<Input name="logradouro" />)}
          </Form.Item>

          <Form.Item label="Bairro" {...formItemLayout}>
            {getFieldDecorator("bairro", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.bairro
            })(<Input name="bairro" />)}
          </Form.Item>

          <Form.Item label="Complemento" {...formItemLayout}>
            {getFieldDecorator("complemento", {
              initialValue: this.state.formData.complemento
            })(<Input name="complemento" />)}
          </Form.Item>

          <Form.Item label="Numero" {...formItemLayout}>
            {getFieldDecorator("numero", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.numero
            })(<Input name="numero" />)}
          </Form.Item>

          <Form.Item label="CEP" {...formItemLayout}>
            {getFieldDecorator("cep", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cep
            })(<Input name="cep" />)}
          </Form.Item>

          <SFFPorcentagem
            name="comissao"
            label="Comissão"
            formItemLayout={formItemLayout}
            getFieldDecorator={getFieldDecorator}
            handleFormState={this.handleFormState}
          />
        </Form>
      </div>
    );
  }

  async onChangeSelectCidade(cidade) {
    await this.setState(prev => ({
      ...prev,
      fetchingCidade: false
    }));

    await this.handleFormState({
      target: { name: "cidade", value: cidade }
    });
  }

  async listaCidadesPorEstado(estado) {
    await this.setState({ fetchingCidade: true, cidades: [], cidade: "" });
    await this.handleFormState({
      target: { name: "estado", value: estado }
    });

    const cidades = await IBGEService.listaCidadesPorEstado(estado);
    this.setState(prev => ({ ...prev, cidades, fetchingCidade: false }));
  }

  generateHelper() {
    if (this.state.formData.estado === undefined)
      return "Selecione um estado primeiro";

    if (this.state.fetchingCidade === true)
      return (
        <Spin
          indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
        />
      );

    return null;
  }
}

const WrappepAgentSalesForm = Form.create()(AgentSalesForm);

export default WrappepAgentSalesForm;
