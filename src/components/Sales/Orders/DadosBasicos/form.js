import React, { Component } from "react";
import { Button, Form, Select, Affix, Spin, Icon, Input } from "antd";
import debounce from "lodash/debounce";

import { SimpleBreadCrumb } from "../../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import { SFFPorcentagem } from "../../../common/formFields/SFFPorcentagem";
import { list as SeasonServiceList } from "../../../../services/seasons";
import * as OrderService from "../../../../services/orders";
import { list as ClientsServiceList } from "../../../../services/clients";
import { list as TypesOfWarrantyServiceList } from "../../../../services/types-of-warranty";
import { list as TypesOfSaleServiceList } from "../../../../services/types-of-sale";
import { list as SeedUseServiceList } from "../../../../services/seed-use";
import { list as PriceTableServiceList } from "../../../../services/pricetable";
import { list as AgentSalesServiceList } from "../../../../services/sales-agents";
import { list as ConsultantServiceList } from "../../../../services/consultants";
import ConfigurarFPCaracteristica from "./ConfigurarFPCaracteristica";
import { configAPP } from "config/app";

const Option = Select.Option;
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

class OrderForm extends Component {
  constructor(props) {
    super(props);
    this.lastFetchClientId = 0;
    this.lastFetchAgentId = 0;
    this.lastFetchConsultantId = 0;
    this.searchClient = debounce(this.searchClient, 400);
    this.searchAgent = debounce(this.searchAgent, 400);
    this.searchConsultant = debounce(this.searchConsultant, 400);
    this.state = {
      editMode: false,
      loadingForm: true,
      savingForm: false,
      formData: {
        itens: []
      },
      fetchingClients: false,
      fetchingAgents: false,
      fetchingConsultants: false,
      clients: [],
      tiposDeFrete: ["SEM FRETE", "FOB", "CIF"]
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    let formData = null;

    if (id) {
      formData = await OrderService.get(id);

      if (formData) {
        formData.itens = formData.itens.filter(i => i.deleted === false);
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          loadingForm: false
        }));
      }
    }

    const clients = await this.fetchClients({
      fields: "nome,cpf_cnpj,propriedades,-propriedades.talhoes"
    }).then(response => response.docs);

    if (formData && !clients.some(c => c._id === formData.cliente.id))
      await this.fetchClients({ _id: formData.cliente.id }).then(response => {
        this.setState(prev => ({
          ...prev,
          clients: [...prev.clients, ...response.docs]
        }));
      });

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
    // const formasDePagamento = await FormOfPaymentServiceList({
    //   limit: -1,
    //   fields: "descricao",
    //   status: true
    // }).then(response => response.docs);
    // const tiposDePagamento = await TypeOfPaymentServiceList({
    //   limit: -1,
    //   fields: "descricao",
    //   status: true
    // }).then(response => response.docs);
    const tabelasDePreco = await PriceTableServiceList({
      limit: -1,
      fields: "nome",
      status: true
    }).then(response => response.docs);

    const agents = await this.fetchAgents({
      fields: "nome,cpf_cnpj,-endereco,-cidade,-estado,-agente_pai"
    }).then(response => response.docs);

    const consultants = await this.fetchConsultants().then(
      response => response.docs
    );

    this.setState(prev => ({
      ...prev,
      listSeasons: safras,
      clients,
      garantias,
      tiposDeVendas,
      usosDaSemente,
      // formasDePagamento,
      // tiposDePagamento,
      tabelasDePreco,
      agents,
      consultants,
      loadingForm: false
    }));
  }

  handleFormState = async event => {
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
      fields: "nome, cpf_cnpj",
      status: true,
      ...aqp
    });
  }

  async fetchAgents(aqp = {}) {
    return await AgentSalesServiceList({
      limit: 25,
      fields: "nome, cpf_cnpj",
      status: true,
      ...aqp
    });
  }

  async fetchConsultants(aqp = {}) {
    return await ConsultantServiceList({
      limit: 25,
      fields: "nome",
      status: true,
      vendedor: true,
      ...aqp
    });
  }

  searchClient = async value => {

    this.lastFetchClientId += 1;
    const fetchId = this.lastFetchClientId;
    this.setState({ clients: [], fetchingClients: true });

    const clients = await this.fetchClients({
      filter:
        `{"$or":[ {"nome": { "$regex": "${value}", "$options" : "i"  } }, {"cpf_cnpj": { "$regex": "${value}"  } } ]}`
    }).then(response => response.docs);

    if (fetchId !== this.lastFetchClientId) return;

    this.setState({
      clients,
      fetchingClients: false
    });
  };

  searchAgent = async value => {
    this.lastFetchAgentId += 1;
    const fetchId = this.lastFetchAgentId;
    this.setState({ agents: [], fetchingAgents: true });

    const agents = await this.fetchAgents({ nome: `/${value}/i` }).then(
      response => response.docs
    );

    if (fetchId !== this.lastFetchAgentId) return;

    this.setState({
      agents,
      fetchingAgents: false
    });
  };

  searchConsultant = async value => {
    this.lastFetchConsultantId += 1;
    const fetchId = this.lastFetchConsultantId;
    this.setState({ consultants: [], fetchConsultants: true });

    const consultants = await this.fetchConsultants({
      nome: `/${value}/i`
    }).then(response => response.docs);

    if (fetchId !== this.lastFetchConsultantId) return;

    this.setState({
      consultants,
      fetchConsultants: false
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

  onChangeAgente(e) {
    const { _id: id, nome, cpf_cnpj } = JSON.parse(e);

    this.handleFormState({
      target: {
        name: "agente_venda",
        value: {
          nome,
          cpf_cnpj,
          id
        }
      }
    });
  }

  onChangeConsultant(e) {
    const { _id: id, nome } = JSON.parse(e);

    this.handleFormState({
      target: {
        name: "vendedor",
        value: {
          nome,
          id
        }
      }
    });
  }

  render() {
    const { fetchingClients, fetchingAgents, fetchingConsultants } = this.state;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
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
          <Form.Item label="Vendedor" {...formItemLayout}>
            {getFieldDecorator("vendedor", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.vendedor &&
                this.state.formData.vendedor.nome
            })(
              <Select
                name="vendedor"
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onSearch={this.searchConsultant}
                showAction={["focus", "click"]}
                notFoundContent={
                  fetchingConsultants ? <Spin size="small" /> : null
                }
                showSearch
                placeholder="Selecione..."
                onChange={e => this.onChangeConsultant(e)}>
                {this.state.consultants &&
                  this.state.consultants.map(c => (
                    <Option key={c._id} value={JSON.stringify(c)}>
                      {c.nome}
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
                onSearch={this.searchClient}
                showAction={["focus", "click"]}
                notFoundContent={fetchingClients ? <Spin size="small" /> : null}
                showSearch
                placeholder="Selecione..."
                onChange={e => this.onChangeCliente(e)}>
                {this.state.clients &&
                  this.state.clients.map(c => (
                    <Option key={c._id} value={JSON.stringify(c)}>
                      {c.nome} - {c.cpf_cnpj}
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
                  this.onSelectPropriedade(e);
                }}>
                {this.state.propriedades && this.state.propriedades.length > 0
                  ? this.state.propriedades.map(p => (
                      <Option
                        title={`${p.nome}/${p.ie}`}
                        key={p._id}
                        value={JSON.stringify({
                          nome: p.nome,
                          ie: p.ie,
                          id: p._id,
                          estado: p.estado,
                          cidade: p.cidade
                        })}>
                        {p.nome} / {p.ie}
                      </Option>
                    ))
                  : ""}
              </Select>
            )}
          </Form.Item>

          {this.state.formData.propriedade && (
            <React.Fragment>
              <Form.Item label="Cidade" {...formItemLayout}>
                <Input value={this.state.formData.cidade} readOnly />
              </Form.Item>

              <Form.Item label="Estado" {...formItemLayout}>
                <Input value={this.state.formData.estado} readOnly />
              </Form.Item>
            </React.Fragment>
          )}

          <Form.Item label="Tipo de Frete" {...formItemLayout}>
            {getFieldDecorator("tipo_frete", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.tipo_frete
            })(
              <Select
                name="tipo_frete"
                showAction={["focus", "click"]}
                showSearch
                placeholder="Selecione..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  if (e !== "CIF")
                    setTimeout(() => {
                      this.setState(prev => ({
                        ...prev,
                        formData: {
                          ...prev.formData,
                          pgto_frete: "",
                          venc_frete: ""
                        }
                      }));
                    }, 0);

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
              initialValue: this.state.formData.garantia
            })(
              <Select
                name="garantia"
                showAction={["focus", "click"]}
                showSearch
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
          {/* <Form.Item label="Forma de Pagamento" {...formItemLayout}>
            {getFieldDecorator("forma_pagamento", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.forma_pagamento
            })(
              <Select
                name="forma_pagamento"
                showAction={["focus", "click"]}
                showSearch

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
          </Form.Item> */}
          {/* <Form.Item label="Tipo de Pagamento" {...formItemLayout}>
            {getFieldDecorator("tipo_pagamento", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.tipo_pagamento
            })(
              <Select
                name="tipo_pagamento"
                showAction={["focus", "click"]}
                showSearch

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
          </Form.Item> */}
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
          {this.state.formData.tipo_venda &&
            this.ehVendaAgenciada() && (
              <React.Fragment>
                <Form.Item label="Agente de Venda" {...formItemLayout}>
                  {getFieldDecorator("agente_venda", {
                    rules: [
                      { required: true, message: "Este campo é obrigatório!" }
                    ],
                    initialValue:
                      this.state.formData.agente_venda &&
                      this.state.formData.agente_venda.nome
                  })(
                    <Select
                      name="agente_venda"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onSearch={this.searchAgent}
                      showAction={["focus", "click"]}
                      notFoundContent={
                        fetchingAgents ? <Spin size="small" /> : null
                      }
                      showSearch
                      placeholder="Selecione..."
                      onChange={e => this.onChangeAgente(e)}>
                      {this.state.agents &&
                        this.state.agents.map(c => (
                          <Option key={c._id} value={JSON.stringify(c)}>
                            {c.nome}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
                <SFFPorcentagem
                  initialValue={this.state.formData.comissao_agente}
                  name="comissao_agente"
                  label="Comissão"
                  formItemLayout={formItemLayout}
                  getFieldDecorator={getFieldDecorator}
                  handleFormState={this.handleFormState}
                />
              </React.Fragment>
            )}
          {/* São Francisco */}
          {configAPP.usarConfiguracaoFPCaracteristica() && (
            <ConfigurarFPCaracteristica
              showFrete={this.state.formData.tipo_frete === "CIF"}
              handleFormState={this.handleFormState}
              form={this.props.form}
              formData={this.state.formData}
            />
          )}
          {/* São Francisco */}
        </Form>
      </div>
    );
  }

  async onSelectPropriedade(e) {
    const { estado, cidade, ...propriedade } = JSON.parse(e);
    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        propriedade,
        cidade,
        estado
      }
    }));
  }

  ehVendaAgenciada() {
    return this.state.formData.tipo_venda.toUpperCase().includes("AGENCIADA"); // tratando como um padrão de CONSTANTE
  }
}

const WrappepOrderForm = Form.create()(OrderForm);

export default WrappepOrderForm;
