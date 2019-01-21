//#region IMPORTS
import React, { Component } from "react";
import {
  Button,
  InputNumber,
  Icon,
  Input,
  Form,
  Select,
  Affix,
  Spin,
  DatePicker
} from "antd";

import { connect } from "react-redux";
import moment from "moment";

import { addMaskReais } from "../../common/utils";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as ClientService from "../../../services/clients";
import * as SeasonService from "../../../services/seasons";
import * as IBGEService from "../../../services/ibge";
import * as ClientPlantingService from "../../../services/clients.plantings";
import * as ProductGroupService from "../../../services/productgroups";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
//#endregion

const Option = Select.Option;
const { TextArea } = Input;

class ClientPlantingForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingForm: true,
      editMode: false,
      formData: {
        data_inicio: moment(new Date(), "YYYY-MM-DD"),
        data_fim: undefined
      },
      client_id: this.props.match.params.client_id,
      propriedades: [],
      talhoes: [],
      safras: [],
      gruposDeProdutos: [],
      produtos: [],
      espacamentos: [45, 50]
    };
  }

  async componentWillMount() {
    const { client_id, id } = this.props.match.params;
    const clienteAtual = await ClientService.get(client_id, {
      fields: "nome,propriedades",
      limit: 999999999999
    });

    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        cliente: { id: clienteAtual._id, nome: clienteAtual.nome }
      },
      propriedades: clienteAtual.propriedades
    }));
  }

  async componentDidMount() {
    const { client_id, id } = this.props.match.params;
    let talhoes = [];

    if (id) {
      const formData = await ClientPlantingService.get(client_id)(id);

      talhoes = this.state.propriedades.map(p => {
        if (p._id === formData.propriedade.id) return p.talhoes;
        return [];
      })[0];

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          talhoes,
          populacaoFinal: this.calculaPopulacaoFinal(
            formData.espacamento,
            formData.plantas_metro
          )
        }));
    }

    const gruposDeProdutos = await ProductGroupService.list({
      fields: "nome,produtos",
      limit: -1
    }).then(response => response.docs);

    const safras = await SeasonService.list({
      limit: 999999999999,
      fields: "descricao"
    }).then(response => response.docs);

    this.setState(prev => ({
      ...prev,
      safras,
      gruposDeProdutos,
      loadingForm: false
    }));
  }

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
    console.log(form);
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
              `/clientes/${this.props.match.params.client_id}/plantio`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log(
              "Erro interno ao adicionar um planejamento de plantio",
              err
            );
          }
        } else {
          try {
            const updated = await ClientPlantingService.update(
              this.state.client_id
            )(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/plantio`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log(
              "Erro interno ao atualizar um planejamento de plantio",
              err
            );
          }
        }
      }
    });
  };

  async onChangeCliente(e) {
    const { _id: id, nome, propriedades } = JSON.parse(e);
    this.props.form.setFields({
      propriedade: { value: null },
      talhao: { value: null }
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
      talhao: { value: null }
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

  async onSelectGrupoProduto(e) {
    e = JSON.parse(e);
    await this.handleFormState({
      target: {
        name: "grupo_produto",
        value: { id: e._id, nome: e.nome }
      }
    });
    await this.setState(prev => ({ ...prev, produtos: e.produtos }));
  }

  async onSelectSafra(e) {
    e = JSON.parse(e);
    await this.handleFormState({
      target: {
        name: "safra",
        value: { id: e._id, descricao: e.descricao }
      }
    });
  }

  async onSelectProduto(e) {
    e = JSON.parse(e);
    await this.handleFormState({
      target: {
        name: "produto",
        value: { id: e._id, nome: e.nome }
      }
    });
  }

  calculaPopulacaoFinal(espacamento, plantasPorM) {
    const k45 = 22222.222;
    const k50 = 20000;
    if (!espacamento || !plantasPorM) return 0;

    const calculo = espacamento == 45 ? plantasPorM * k45 : plantasPorM * k50;
    return calculo.toFixed(2);
  }

  getAreaTalhao(t) {
    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        area: t.area
      }
    }));
    console.log("getAreaTalhao: ", t.area);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };
    const { latitude, longitude } = this.state.formData;

    const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

    return this.state.loadingForm ? (
      <Spin tip="Carregando..." size="large" indicator={antIcon} />
    ) : (
      <div>
        <SimpleBreadCrumb
          to={`/clientes/${this.props.match.params.client_id}/plantio`}
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={
              this.state.editMode
                ? "Editando Planejamento de Plantio"
                : "Novo Planejamento de Plantio - " +
                  (this.state.formData.cliente
                    ? this.state.formData.cliente.nome
                    : "")
            }>
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Planejamento
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Safra" {...formItemLayout}>
            {getFieldDecorator("safra", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.safra && this.state.formData.safra.descricao
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
                onSelect={e => this.onSelectSafra(e)}>
                {this.state.safras.map(s => (
                  <Option key={s._id} value={JSON.stringify(s)}>
                    {s.descricao}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label="Propriedade"
            {...formItemLayout}
            help={
              !this.state.formData.cliente
                ? "Selecione primeiro um cliente!"
                : this.state.propriedades.length <= 0
                  ? "Este cliente não possui propriedades"
                  : ""
            }
            validateStatus={!this.state.formData.cliente ? "warning" : ""}>
            {getFieldDecorator("propriedade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.propriedade
                ? `${this.state.formData.propriedade.nome} - ${
                    this.state.formData.propriedade.ie
                  }`
                : ""
            })(
              <Select
                disabled={!this.state.formData.cliente}
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
                onSelect={e => this.selectPropriedade(e)}>
                {this.state.propriedades.length > 0 &&
                  this.state.propriedades.map(p => (
                    <Option key={p._id} value={JSON.stringify(p)}>
                      {p.nome} - {p.ie}
                    </Option>
                  ))}
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
            }>
            {getFieldDecorator("talhao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.talhao && this.state.formData.talhao.nome
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
                onSelect={e => {
                  e = JSON.parse(e);
                  this.handleFormState({
                    target: {
                      name: "talhao",
                      value: { id: e._id, nome: e.nome }
                    }
                  });
                  this.getAreaTalhao(e);
                }}>
                {this.state.talhoes && this.state.talhoes.length > 0
                  ? this.state.talhoes.map(t => (
                      <Option key={t._id} value={JSON.stringify(t)}>
                        {t.nome}
                      </Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>
          {/*
          <Form.Item
            label="Cidade"
            {...formItemLayout}
            help="cidade da propriedade escolhida">
            {getFieldDecorator("cidade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cidade
            })(<Input style={{ width: 200 }} disabled name="cidade" />)}
          </Form.Item>
          <Form.Item
            label="Estado"
            {...formItemLayout}
            help="estado da propriedade escolhida">
            {getFieldDecorator("estado", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.estado
            })(<Input style={{ width: 200 }} disabled name="estado" />)}
          </Form.Item>
          */}
          <Form.Item label="Grupo de Produto" {...formItemLayout}>
            {getFieldDecorator("grupo_produto", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.grupo_produto
                ? this.state.formData.grupo_produto.nome
                : ""
            })(
              <Select
                name="grupo_produto"
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
                onSelect={e => this.onSelectGrupoProduto(e)}>
                {this.state.gruposDeProdutos.length > 0
                  ? this.state.gruposDeProdutos.map(t => (
                      <Option key={t._id} value={JSON.stringify(t)}>
                        {t.nome}
                      </Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label="Produto"
            {...formItemLayout}
            validateStatus={
              this.state.formData.grupo_produto === undefined ? "warning" : ""
            }
            help={
              this.state.formData.grupo_produto === undefined
                ? "Selecione primeiro um grupo de produto!"
                : ""
            }>
            {getFieldDecorator("produto", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.produto
                ? this.state.formData.produto.nome
                : ""
            })(
              <Select
                disabled={this.state.formData.grupo_produto === undefined}
                name="produto"
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
                onSelect={e => this.onSelectProduto(e)}>
                {this.state.produtos.length > 0
                  ? this.state.produtos.map(t => (
                      <Option key={t._id} value={JSON.stringify(t)}>
                        {t.nome}
                      </Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Data de Início" {...formItemLayout}>
            {getFieldDecorator("data_inicio", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: moment(
                this.state.formData.data_inicio
                  ? this.state.formData.data_inicio
                  : new Date(),
                "YYYY-MM-DD"
              )
            })(
              <DatePicker
                onChange={(data, dataString) =>
                  this.handleFormState({
                    target: {
                      name: "data_inicio",
                      value: moment(dataString, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                      )
                    }
                  })
                }
                allowClear
                format={"DD/MM/YYYY"}
                style={{ width: 200 }}
                name="data_inicio"
              />
            )}
          </Form.Item>
          <Form.Item label="Data de Fim" {...formItemLayout}>
            {getFieldDecorator("data_fim", {
              rules: [
                { required: false, message: "Este campo é obrigatório!" }
              ],
              initialValue: this.state.formData.data_fim
                ? moment(
                    this.state.formData.data_fim
                      ? this.state.formData.data_fim
                      : new Date(),
                    "YYYY-MM-DD"
                  )
                : undefined
            })(
              <DatePicker
                onChange={(data, dataString) =>
                  this.handleFormState({
                    target: {
                      name: "data_fim",
                      value: dataString
                        ? moment(dataString, "DD/MM/YYYY").format("YYYY-MM-DD")
                        : null
                    }
                  })
                }
                showToday
                allowClear
                format={"DD/MM/YYYY"}
                style={{ width: 200 }}
                name="data_fim"
              />
            )}
          </Form.Item>

          <Form.Item label="Espaçamento" {...formItemLayout}>
            {getFieldDecorator("espacamento", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.espacamento
            })(
              <Select
                name="espacamento"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                onSelect={e => {
                  this.handleFormState({
                    target: { name: "espacamento", value: e }
                  });

                  this.setState(prev => ({
                    ...prev,
                    populacaoFinal: addMaskReais(
                      this.calculaPopulacaoFinal(
                        e,
                        this.state.formData.plantas_metro
                      )
                    )
                  }));
                }}>
                {this.state.espacamentos.length > 0
                  ? this.state.espacamentos.map(opt => (
                      <Option key={opt} value={opt}>
                        {opt}
                      </Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Sementes por Metro" {...formItemLayout}>
            {getFieldDecorator("sementes_metro", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.sementes_metro
            })(
              <InputNumber
                onChange={e =>
                  this.handleFormState({
                    target: { name: "sementes_metro", value: e }
                  })
                }
                style={{ width: 200 }}
                name="sementes_metro"
              />
            )}
          </Form.Item>
          <Form.Item label="Plantas por Metro" {...formItemLayout}>
            {getFieldDecorator("plantas_metro", {
              initialValue: this.state.formData.plantas_metro
            })(
              <InputNumber
                onChange={e => {
                  this.handleFormState({
                    target: { name: "plantas_metro", value: e }
                  });

                  this.setState(prev => ({
                    ...prev,
                    populacaoFinal: addMaskReais(
                      this.calculaPopulacaoFinal(
                        this.state.formData.espacamento,
                        e
                      )
                    )
                  }));
                }}
                style={{ width: 200 }}
                name="plantas_metro"
              />
            )}
          </Form.Item>
          <Form.Item
            style={{
              display:
                this.state.formData.populacao_final ||
                this.state.populacaoFinal
                  ? "block"
                  : "none"
            }}
            label="População Final"
            {...formItemLayout}>
            <Input
              readOnly
              value={
                this.state.populacaoFinal || this.state.formData.populacao_final
              }
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item
            label="Área"
            {...formItemLayout}
            validateStatus={
              this.state.formData.talhao === undefined ? "warning" : ""
            }>
            {getFieldDecorator("area", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.area
            })(
              <InputNumber
                onChange={e =>
                  this.handleFormState({
                    target: { name: "area", value: e }
                  })
                }
                style={{ width: 200 }}
                name="area"
              />
            )}
          </Form.Item>
          <Form.Item label="Produtividade (SC)" {...formItemLayout}>
            {getFieldDecorator("produtividade", {
              rules: [{ required: false }],
              initialValue: this.state.formData.produtividade
            })(<InputNumber name="produtividade" style={{ width: 200 }} />)}
          </Form.Item>
          <Form.Item label="Observações" {...formItemLayout}>
            {getFieldDecorator("observacoes", {
              rules: [{ required: false }],
              initialValue: this.state.formData.observacoes
            })(
              <TextArea
                name="observacoes"
                autosize={{ minRows: 2, maxRows: 7 }}
                style={{ width: 400 }}
              />
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = ({ plantioState }) => {
  return {
    cliente: plantioState.plantioData
  };
};

const WrappepClientPlantingForm = Form.create()(ClientPlantingForm);

export default connect(mapStateToProps)(WrappepClientPlantingForm);
