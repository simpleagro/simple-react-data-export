import React, { Component } from "react";
import { Button, Form, Select, Affix, Spin, Icon } from "antd";
import debounce from "lodash/debounce";

import { SimpleBreadCrumb } from "../../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import { list as SeasonServiceList } from "../../../../services/seasons";
import * as OrderService from "../../../../services/orders";
import { list as ClientsServiceList } from "../../../../services/clients";
import { list as TypesOfWarrantyServiceList } from "../../../../services/types-of-warranty";
import { list as TypesOfSaleServiceList } from "../../../../services/types-of-sale";
import { list as SeedUseServiceList } from "../../../../services/seed-use";
import { list as FormOfPaymentServiceList } from "../../../../services/form-of-payment";
import { list as TypeOfPaymentServiceList } from "../../../../services/type-of-payment";
import { list as PriceTableServiceList } from "../../../../services/pricetable";

const Option = Select.Option;
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class OrderForm extends Component {
  constructor(props) {
    super(props);
    this.lastFetchClientId = 0;
    this.searchClient = debounce(this.searchClient, 400);
    this.state = {
      editMode: false,
      loadingForm: true,
      savingForm: false,
      formData: {},
      fetchingClients: false,
      tiposDeFrete: ["FOB", "CIF"]
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await OrderService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          loadingForm: false
        }));
    }

    const clients = await this.fetchClients({
      fields: "nome,cpf_cnpj,propriedades,-propriedades.talhoes"
    }).then(response => response.docs);

    const safras = await SeasonServiceList({
      limit: -1,
      fields: "descricao"
    }).then(response => response.docs);

    const garantias = await TypesOfWarrantyServiceList({
      limit: -1,
      fields: "descricao",
      status: true
    }).then(response => response.docs);
    const tiposDeVendas = await TypesOfSaleServiceList({
      limit: -1,
      fields: "descricao",
      status: true
    }).then(response => response.docs);
    const usosDaSemente = await SeedUseServiceList({
      limit: -1,
      fields: "descricao",
      status: true
    }).then(response => response.docs);
    const formasDePagamento = await FormOfPaymentServiceList({
      limit: -1,
      fields: "descricao",
      status: true
    }).then(response => response.docs);
    const tiposDePagamento = await TypeOfPaymentServiceList({
      limit: -1,
      fields: "descricao",
      status: true
    }).then(response => response.docs);
    const tabelasDePreco = await PriceTableServiceList({
      limit: -1,
      fields: "descricao",
      status: true
    }).then(response => response.docs);

    this.setState(prev => ({
      ...prev,
      listSeasons: safras,
      clients,
      garantias,
      tiposDeVendas,
      usosDaSemente,
      formasDePagamento,
      tiposDePagamento,
      tabelasDePreco,
      loadingForm: false
    }));
  }

  handleFormState = event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
    console.log(form);
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
            const created = await OrderService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();

            this.props.history.push(
              "/pedidos/" + created._id + "/itens-do-pedido"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um pedido", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await OrderService.update(this.state.formData);
            flashWithSuccess();

            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/pedidos");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um pedido", err);
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  async fetchClients(aqp = {}) {
    return await ClientsServiceList({
      limit: 25,
      fields: "nome",
      status: true,
      ...aqp
    });
  }

  searchClient = async value => {
    console.log("fetching client", value);
    this.lastFetchClientId += 1;
    const fetchId = this.lastFetchClientId;
    this.setState({ clients: [], fetchingClients: true });

    const clients = await this.fetchClients({ nome: `/${value}/i` }).then(
      response => response.docs
    );

    if (fetchId !== this.lastFetchClientId) return;

    this.setState({
      clients,
      fetchingClients: false
    });
  };

  onChangeCliente(e) {
    const { _id: id, nome, cpf_cnpj, propriedades } = JSON.parse(e);

    this.props.form.setFields({
      propriedade: { value: null }
    });

    this.handleFormState({
      target: {
        name: "cliente",
        value: {
          nome,
          cpf_cnpj,
          id
        }
      }
    });

    this.setState(prev => ({
      ...prev,
      propriedades: propriedades.filter(t => t.status === true)
    }));
  }

  render() {
    const { fetchingClients } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return this.state.loadingForm ? (
      <Spin tip="Carregando..." size="large" indicator={antIcon} />
    ) : (
      <div>
        <SimpleBreadCrumb
          to={
            this.props.location.state && this.props.location.state.returnTo
              ? this.props.location.state.returnTo.pathname
              : "/pedidos"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={[
              this.state.editMode ? "Editando" : "Novo",
              " Cabeçalho do Pedido"
            ]}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Cabeçalho do Pedido
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
                onChange={e => {
                  this.handleFormState({
                    target: { name: "safra", value: JSON.parse(e) }
                  });
                }}>
                {this.state.listSeasons &&
                  this.state.listSeasons.map(s => (
                    <Option
                      key={s._id}
                      value={JSON.stringify({
                        id: s._id,
                        descricao: s.descricao
                      })}>
                      {s.descricao}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Cliente" {...formItemLayout}>
            {getFieldDecorator("cliente", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.cliente && this.state.formData.cliente.nome
            })(
              <Select
                name="cliente"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSearch={this.searchClient}
                showAction={["focus", "click"]}
                notFoundContent={fetchingClients ? <Spin size="small" /> : null}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                onChange={e => this.onChangeCliente(e)}>
                {this.state.clients &&
                  this.state.clients.map(c => (
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
            }>
            {getFieldDecorator("propriedade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.propriedade &&
                this.state.formData.propriedade.nome
            })(
              <Select
                disabled={this.state.formData.cliente === undefined}
                name="propriedade"
                showAction={["focus", "click"]}
                showSearch
                placeholder="Selecione..."
                // labelInValue
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSelect={e => {
                  this.handleFormState({
                    target: {
                      name: "propriedade",
                      value: JSON.parse(e)
                    }
                  });
                }}>
                {this.state.propriedades && this.state.propriedades.length > 0
                  ? this.state.propriedades.map(p => (
                      <Option
                        title={`${p.nome}/${p.ie}`}
                        key={p._id}
                        value={JSON.stringify({
                          nome: p.nome,
                          ie: p.ie,
                          id: p._id
                        })}>
                        {p.nome} / {p.ie}
                      </Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Tipo de Frete" {...formItemLayout}>
            {getFieldDecorator("tipo_frete", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.tipo_frete
            })(
              <Select
                name="tipo_frete"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "tipo_frete", value: e }
                  });
                }}>
                {this.state.tiposDeFrete &&
                  this.state.tiposDeFrete.map((tpf, index) => (
                    <Option key={index} value={tpf}>
                      {tpf}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Garantia" {...formItemLayout}>
            {getFieldDecorator("garantia", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.garantia
            })(
              <Select
                name="garantia"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "garantia", value: e }
                  });
                }}>
                {this.state.garantias &&
                  this.state.garantias.map(g => (
                    <Option key={g._id} value={g.descricao}>
                      {g.descricao}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Tipo de Venda" {...formItemLayout}>
            {getFieldDecorator("tipo_venda", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.tipo_venda
            })(
              <Select
                name="tipo_venda"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "tipo_venda", value: e }
                  });
                }}>
                {this.state.tiposDeVendas &&
                  this.state.tiposDeVendas.map(g => (
                    <Option key={g._id} value={g.descricao}>
                      {g.descricao}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Uso da Semente" {...formItemLayout}>
            {getFieldDecorator("uso_semente", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.uso_semente
            })(
              <Select
                name="uso_semente"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "uso_semente", value: e }
                  });
                }}>
                {this.state.usosDaSemente &&
                  this.state.usosDaSemente.map(g => (
                    <Option key={g._id} value={g.descricao}>
                      {g.descricao}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Forma de Pagamento" {...formItemLayout}>
            {getFieldDecorator("forma_pagamento", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.forma_pagamento
            })(
              <Select
                name="forma_pagamento"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "forma_pagamento", value: e }
                  });
                }}>
                {this.state.formasDePagamento &&
                  this.state.formasDePagamento.map(g => (
                    <Option key={g._id} value={g.descricao}>
                      {g.descricao}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Tipo de Pagamento" {...formItemLayout}>
            {getFieldDecorator("tipo_pagamento", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.tipo_pagamento
            })(
              <Select
                name="tipo_pagamento"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "tipo_pagamento", value: e }
                  });
                }}>
                {this.state.tiposDePagamento &&
                  this.state.tiposDePagamento.map(g => (
                    <Option key={g._id} value={g.descricao}>
                      {g.descricao}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Tabela de Preço Base" {...formItemLayout}>
            {getFieldDecorator("tabela_preco_base", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.tabela_preco_base &&
                this.state.formData.tabela_preco_base.nome
            })(
              <Select
                name="tabela_preco_base"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "tabela_preco_base", value: JSON.parse(e) }
                  });
                }}>
                {this.state.tabelasDePreco &&
                  this.state.tabelasDePreco.map(s => (
                    <Option
                      key={s._id}
                      value={JSON.stringify({
                        id: s._id,
                        nome: s.nome
                      })}>
                      {s.nome}
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

const WrappepOrderForm = Form.create()(OrderForm);

export default WrappepOrderForm;
