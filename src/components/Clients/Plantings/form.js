import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Select,
  Affix,
  Card,
  InputNumber,
  Tooltip,
  Spin,
  Row,
  Col
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as ClientService from "../../../services/clients";
// import * as ProductGroupService from "../../../services/product-group";
import * as SeasonService from "../../../services/seasons";
import * as IBGEService from "../../../services/ibge";
import * as ClientPlantingService from "../../../services/clients.plantings";

const Option = Select.Option;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

const CardStyled = styled(Card)`
  background: #ececec;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e3cccc;
`;

class ClientPlantingForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      client_id: this.props.match.params.client_id,
      propriedades: [],
      talhoes: [],
      safras: [],
      clientes: [],
      fetchingCidade: false,
      estados: [],
      cidades: []
    };
  }

  async componentDidMount() {
    const { client_id, id } = this.props.match.params;

    if (id) {
      const formData = await ClientPlantingService.get(client_id)(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
      console.log(formData);
    }

    const estados = await IBGEService.listaEstados();
    const safras = await SeasonService.list({
      limit: 999999999999,
      fields: "descricao"
    }).then(response => response.docs);

    const clientes = await ClientService.list({
      fields: "nome _id propriedades"
    }).then(response => response.docs);

    this.setState(prev => ({
      ...prev,
      safras,
      estados,
      clientes,
      fetchingCidade: false
    }));
  }

  async listaCidadesPorEstado(estado) {
    await this.setState({ fetchingCidade: true, cidades: [], cidade: "" });
    await this.handleFormState({
      target: { name: "estado", value: estado.label }
    });
    // await this.handleFormState({
    //   target: { name: "estado", value: estado.label}
    // });
    // await this.handleFormState({
    //   target: { name: "estado_codigo", value: estado.key }
    // });
    const cidades = await IBGEService.listaCidadesPorEstado(estado.key);
    this.setState(prev => ({ ...prev, cidades, fetchingCidade: false }));
  }

  handleFormState = async event => {
    console.log(event);
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
    console.log(this.state.formData);
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await ClientPlantingService.create(
              this.state.client_id
            )(this.state.formData);
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/propriedades/${
                created._id
              }/talhoes`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um cliente", err);
          }
        } else {
          try {
            const updated = await ClientPlantingService.update(
              this.state.client_id
            )(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/propriedades/${
                updated._id
              }/talhoes`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um cliente ", err);
          }
        }
      }
    });
  };

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

  async onChangeSelectCidade(cidade) {
    console.log(cidade);
    await this.setState(prev => ({
      ...prev,
      fetchingCidade: false
    }));
    // await this.handleFormState({
    //   target: { name: "cidade_codigo", value: e.key }
    // });
    // await this.handleFormState({
    //   target: { name: "cidade", value: e.label }
    // });
    await this.handleFormState({
      target: { name: "cidade", value: cidade }
    });
  }

  async onChangeCliente(e) {
    const { _id: id, nome, propriedades } = JSON.parse(e);
    this.props.form.setFields({
      propriedade: { value: null },
      talhao: { value: null },
    });

    await this.setState(prev => ({
      ...prev,
      formData: { ...prev.formData, propriedade: undefined, talhao: undefined },
      propriedades: [],
      talhoes: []
    }));
    await this.setState(prev => ({
      ...prev,
      propriedades: propriedades.filter(
        p => p.talhoes.length > 0 && p.status === true
      )
    }));
    await this.handleFormState({
      target: {
        name: "cliente",
        value: { id, nome }
      }
    });
  }

  async selectPropriedade(e) {
    const { _id: id, nome, ie, cidade, estado, talhoes } = JSON.parse(e);
    this.props.form.setFields({
      talhao: { value: null },
    });
    await this.handleFormState({
      target: {
        name: "propriedade",
        value: { id, nome, ie }
      }
    });
    await this.handleFormState({
      target: {
        name: "cidade",
        value: cidade
      }
    });
    await this.handleFormState({
      target: {
        name: "estado",
        value: estado
      }
    });
    this.setState(prev => ({
      ...prev,
      talhoes: talhoes.filter(t => t.status === true)
    }));

  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };
    const { latitude, longitude } = this.state.formData;

    return (
      <div>
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button
              href={`/clientes/${this.props.match.params.client_id}/plantio`}
            >
              <Icon type="arrow-left" />
              Voltar para a tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={
              this.state.editMode
                ? "Editando Planejamento de Plantio"
                : "Novo Planejamento de Plantio"
            }
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Planejamento
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Safra" {...formItemLayout}>
            {getFieldDecorator("safra", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.safra
            })(
              <Select
                name="safra"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e =>
                  this.handleFormState({ target: { name: "safra", value: e } })
                }
              >
                {this.state.safras.map(s => (
                  <Option key={s._id} value={s.descricao}>
                    {s.descricao}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Cliente" {...formItemLayout}>
            {getFieldDecorator("cliente", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cliente
            })(
              <Select
                name="cliente"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                // labelInValue
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSelect={e => this.onChangeCliente(e)}
              >
                {this.state.clientes.map(c => (
                  <Option key={c._id} value={JSON.stringify(c)}>
                    {c.nome}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label="Propriedade"
            {...formItemLayout}
            help={
              this.state.formData.cliente === undefined
                ? "Selecione primeiro um cliente!"
                : ""
            }
            validateStatus={
              this.state.formData.cliente === undefined ? "warning" : ""
            }
          >
            {getFieldDecorator("propriedade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.propriedade
            })(
              <Select
                disabled={this.state.formData.cliente === undefined}
                name="propriedade"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                // labelInValue
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSelect={e => this.selectPropriedade(e)}
              >
                {this.state.propriedades.length > 0
                  ? this.state.propriedades.map(p => (
                      <Option key={p._id} value={JSON.stringify(p)}>
                        {p.nome} - {p.ie}
                      </Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label="Talhão"
            {...formItemLayout}
            help={
              this.state.formData.propriedade === undefined
                ? "Selecione primeiro uma propriedade!"
                : ""
            }
            validateStatus={
              this.state.formData.propriedade === undefined ? "warning" : ""
            }
          >
            {getFieldDecorator("talhao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.talhao
            })(
              <Select
                disabled={this.state.formData.propriedade === undefined}
                name="talhao"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                // labelInValue
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSelect={e =>
                  this.handleFormState({
                    target: {
                      name: "talhao",
                      value: { id: e._id, nome: e.nome }
                    }
                  })
                }
              >
                {this.state.talhoes.length > 0
                  ? this.state.talhoes.map(t => (
                      <Option key={t._id} value={JSON.stringify(t)}>{t.nome}</Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label="Cidade"
            {...formItemLayout}
            help="cidade da propriedade escolhida"
          >
            {getFieldDecorator("cidade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cidade
            })(<Input style={{ width: 200 }} disabled name="cidade" />)}
          </Form.Item>
          <Form.Item
            label="Estado"
            {...formItemLayout}
            help="estado da propriedade escolhida"
          >
            {getFieldDecorator("estado", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.estado
            })(<Input style={{ width: 200 }} disabled name="estado" />)}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepClientPlantingForm = Form.create()(ClientPlantingForm);

export default WrappepClientPlantingForm;
