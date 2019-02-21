import React, { Component } from "react";
import {
  InputNumber,
  Button,
  Form,
  Select,
  Affix,
  Card,
  Input,
  Row,
  Col,
  Spin,
  Layout
} from "antd";
import { connect } from "react-redux";
import * as Promise from "bluebird";

import {
  flashWithSuccess,
  flashWithError
} from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import * as ProductGroupService from "services/productgroups";
import * as OrderItemService from "../../../../services/orders.items";
import { get as GetVariation } from "../../../../services/microservices/price-table-variations";
import * as PriceTableService from "services/pricetable";
import * as PriceTableProductService from "services/pricetable.products";
import * as FeaturePriceTableService from "services/feature-table-prices";
import { list as ListUnitsMeasures } from "services/units-measures";
import { fatorConversaoUM } from "common/utils";
import { SimpleBreadCrumb } from "../../../common/SimpleBreadCrumb";
import { SimpleLazyLoader } from "../../../common/SimpleLazyLoader";
import { SFFPorcentagem } from "../../../common/formFields/SFFPorcentagem";
import debounce from "lodash/debounce";

const Option = Select.Option;

class OrderItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mostrarResumo: false,
      editMode: false,
      formData: {
        tabela_preco_base:
          this.props.pedido &&
          this.props.pedido._id === this.props.match.params.order_id &&
          this.props.pedido.tabela_preco_base,
        quantidade: 1
      },
      savingForm: false,
      loadingForm: true,
      gruposDeProdutos: [],
      tabelaPrecos: [],
      produtos: [],
      order_id: this.props.match.params.order_id
    };
    window.calcularResumo = this.calcularResumo.bind(this);
    this.calcularResumo = debounce(this.calcularResumo, 300);
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await OrderItemService.get(this.state.order_id)(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }

    const gruposDeProdutos = await ProductGroupService.list({
      fields: "nome, produtos, caracteristicas, preco_base_regra",
      limit: -1
    }).then(response => response.docs);

    const tabelaPrecos = await PriceTableService.list({
      fields: "nome",
      status: true,
      limit: -1
    }).then(response => response.docs);

    // const pedido = await OrderService.get(order_id, {fields})

    this.setState(prev => ({
      ...prev,
      gruposDeProdutos,
      tabelaPrecos
    }));

    if (id) {
      this.onSelectGrupoProduto(
        JSON.stringify(
          JSON.parse(this.props.form.getFieldValue("grupo_produto"))
        )
      );

      setTimeout(() => {
        this.onSelectProduto(
          JSON.stringify(JSON.parse(this.props.form.getFieldValue("produto")))
        );
      }, 0);
    }
    setTimeout(() => {
      this.setState({
        loadingForm: false
      });
    }, 300);
  }

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
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
            const created = await OrderItemService.create(this.state.order_id)(
              this.state.formData
            );
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/pedidos/${this.props.match.params.order_id}/itens-do-pedido`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);

            this.setState({ savingForm: false });
          }
        } else {
          try {
            const updated = await OrderItemService.update(this.state.order_id)(
              this.state.formData
            );
            flashWithSuccess();
            this.props.history.push(
              `/pedidos/${this.props.match.params.order_id}/itens-do-pedido`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log(
              "Erro interno ao atualizar uma variação de preço ",
              err
            );
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

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

  async onSelectProduto(e) {
    e = JSON.parse(e);
    await this.handleFormState({
      target: {
        name: "produto",
        value: { id: e._id, nome: e.nome }
      }
    });

    if (e.possui_variacao) this.getVariacoes();
    else {
      this.setState({
        variacoes: undefined,
        variacoesSelecionadas: undefined
      });
    }
  }

  async getVariacoes() {
    const grupo = JSON.parse(this.props.form.getFieldValue("grupo_produto"));
    const produto = JSON.parse(this.props.form.getFieldValue("produto"));

    let variacoes = grupo.caracteristicas.map((c, index, arr) => {
      if (this.state.formData[c.chave])
        this.setState(prev => ({
          ...prev,
          variacoesSelecionadas: {
            ...prev.variacoesSelecionadas,
            [c.chave]: this.state.formData[c.chave]
          }
        }));
      return {
        chave: c.chave,
        label: c.label,
        obrigatorio: c.obrigatorio,
        tipoTabela: c.tipo_preco,
        regraPrecoBase:
          c.tipo_preco === "TABELA_BASE" ? grupo.preco_base_regra : null,
        variacaoPreco: c.variacao_preco,
        prevField: index > 0 ? arr[index - 1].chave : null,
        nextField: index + 1 < arr.length ? arr[index + 1].chave : null,
        opcoes: new Set(
          produto.variacoes.filter(v => v[c.chave]).map(v => v[c.chave])
        )
      };
    });

    this.setState({ variacoes });
    this.calcularResumo();
  }

  resetVariacoes() {
    // debugger;
    const campos = [
      ...Object.keys(this.state.formData).filter(
        f => f.match(/^preco_/i) || f.match(/^desconto_/i)
      ),
      ...this.state.variacoes.map(v => v.chave)
    ];
    this.props.form.resetFields(campos);

    let formData = this.state.formData;

    campos.forEach(c => {
      delete formData[c];
    });

    this.setState({ formData });

    this.getVariacoes();
  }

  getVals(chave) {
    function search(user) {
      return Object.keys(this).every(key => user[key] === this[key]);
    }

    let opcoes = JSON.parse(this.props.form.getFieldValue("produto"));
    let filtro = this.state.variacoesSelecionadas || {};

    opcoes = new Set(
      opcoes.variacoes.filter(search, filtro).map(c => c[chave])
    );

    opcoes.delete(undefined);

    let variacoes = this.state.variacoes;
    variacoes.map(v => {
      if (v.chave === chave) v.opcoes = opcoes;
    });

    this.props.form.resetFields([chave]);
    let variacoesSelecionadas = this.state.variacoesSelecionadas;
    delete variacoesSelecionadas[chave];

    this.setState({
      variacoes,
      variacoesSelecionadas,
      mostrarResumo: true
    });
    this.calcularResumo();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { xl: 4, xxl: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <SimpleLazyLoader isLoading={this.state.loadingForm}>
        <div>
          <SimpleBreadCrumb
            to={
              this.props.location.state && this.props.location.state.returnTo
                ? this.props.location.state.returnTo.pathname
                : `/pedidos/${this.state.order_id}/itens-do-pedido`
            }
            history={this.props.history}
          />
          <Affix offsetTop={65}>
            <PainelHeader
              title={[
                this.state.editMode ? "Editando" : "Novo",
                " Item do Pedido"
              ]}>
              <Button
                type="primary"
                icon="save"
                onClick={() => this.saveForm()}
                loading={this.state.savingForm}>
                Salvar Item do Pedido
              </Button>
            </PainelHeader>
          </Affix>
          <Form id="orderItemForm" onChange={this.handleFormState}>
            <Form.Item label="Tabela de Preço" {...formItemLayout}>
              {getFieldDecorator("tabela_preco_base", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.tabela_preco_base
                  ? this.state.formData.tabela_preco_base.nome
                  : ""
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
                      target: {
                        name: "tabela_preco_base",
                        value: JSON.parse(e)
                      }
                    });
                  }}>
                  {this.state.tabelaPrecos.length > 0
                    ? this.state.tabelaPrecos.map(t => (
                        <Option
                          key={t._id}
                          value={JSON.stringify({ id: t._id, nome: t.nome })}>
                          {t.nome}
                        </Option>
                      ))
                    : ""}
                </Select>
              )}
            </Form.Item>
            <Form.Item label="Grupo de Produto" {...formItemLayout}>
              {getFieldDecorator("grupo_produto", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.grupo_produto
                  ? JSON.stringify(
                      this.state.gruposDeProdutos.find(
                        g => g._id === this.state.formData.grupo_produto.id
                      )
                    )
                  : ""
              })(
                <Select
                  name="grupo_produto"
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Selecione..."
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
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.produto
                  ? JSON.stringify(
                      this.state.produtos.find(
                        g => g._id === this.state.formData.produto.id
                      )
                    )
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

            {this.state.variacoes && (
              <Card
                title="Variações do Produto"
                extra={
                  <Button onClick={() => this.resetVariacoes()}>
                    Limpar Variações
                  </Button>
                }
                bordered
                style={{ marginBottom: 20 }}>
                {this.state.variacoes
                  .sort((a, b) => (b.obrigatorio ? 1 : -1))
                  .map((v, index, arr) => {
                    return v.opcoes.size ? (
                      <React.Fragment key={`variacao_fragm_${index}`}>
                        <Spin
                          tip={"Carregando variações para " + v.label}
                          key="spin_loading_inputs_variacoes"
                          spinning={
                            this.state[`loadingVariacoes_${v.chave}`] === true
                          }>
                          <Form.Item
                            label={v.label}
                            key={v.chave}
                            {...formItemLayout}>
                            {getFieldDecorator(v.chave, {
                              valuePropName: "value",
                              rules: [
                                {
                                  required: v.obrigatorio,
                                  message: "Este campo é obrigatório!"
                                }
                              ],
                              initialValue: this.state.formData[v.chave]
                            })(
                              <Select
                                // disabled={
                                //   index === 0
                                //     ? false
                                //     : this.state.formData[v.prevField] === undefined
                                // }
                                name={v.chave}
                                showAction={["focus", "click"]}
                                showSearch
                                // onFocus={() => this.getVals(v.chave)}
                                style={{ width: 200 }}
                                onChange={async e => {
                                  this.setState(prev => ({
                                    ...prev,
                                    variacoesSelecionadas: {
                                      ...prev.variacoesSelecionadas,
                                      ...{ [v.chave]: e }
                                    }
                                  }));
                                  await this.handleFormState({
                                    target: { name: v.chave, value: e }
                                  });
                                  arr
                                    .map(v => v.chave)
                                    .splice(index + 1)
                                    .map(v2 => {
                                      this.setState(prev => ({
                                        ...prev,
                                        formData: {
                                          ...prev.formData,
                                          [v2]: undefined
                                        }
                                      }));
                                      this.getVals(v2);
                                    });
                                  this.atualizaValorVariacao(v, e);
                                }}
                                placeholder="Selecione...">
                                {Array.from(v.opcoes).map((o, index) => (
                                  <Option key={`${v.chave}_${index}`} value={o}>
                                    {o}
                                  </Option>
                                ))}
                              </Select>
                            )}
                          </Form.Item>

                          {this.geraVariacoesInputsDinamicos(v)}
                        </Spin>
                      </React.Fragment>
                    ) : (
                      ""
                    );
                  })}
              </Card>
            )}
            <Form.Item label="Área" {...formItemLayout}>
              {getFieldDecorator("area", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
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
            <SFFPorcentagem
              name={`desconto`}
              label={`Desconto`}
              formItemLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
              handleFormState={this.handleFormState}
              trigger={() => this.calcularResumo()}
            />
            <Form.Item label="Quantidade" {...formItemLayout}>
              {getFieldDecorator("quantidade", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.quantidade || 1
              })(
                <InputNumber
                  onKeyUp={() => this.calcularResumo()}
                  onChange={async e => {
                    if (isNaN(e)) return;
                    await this.handleFormState({
                      target: { name: "quantidade", value: e }
                    });
                  }}
                  style={{ width: 200 }}
                  name="quantidade"
                />
              )}
            </Form.Item>
            {/* <Form.Item label="Preço Final Item" {...formItemLayout}>
              {getFieldDecorator("preco_final_item", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.preco_final_item
              })(
                <InputNumber
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "preco_final_item", value: e }
                    })
                  }
                  style={{ width: 200 }}
                  name="preco_final_item"
                />
              )}
            </Form.Item> */}
          </Form>
          <br />
          <br />
          <Affix offsetBottom={0}>
            <Layout.Footer style={{ borderTop: "2px solid gray" }}>
              <h3>Resumo:</h3>

              {this.state.variacoes &&
                this.state.variacoes.map(v => {
                  if (v.tipoTabela === "TABELA_CARACTERISTICA")
                    return (
                      <div key={`resumoItem_${v.chave}`}>
                        <b>
                          Total Preço {v.label}:{" "}
                          {this.state.formData[`preco_total_${v.chave}`] || 0}
                        </b>
                      </div>
                    );
                  if (v.tipoTabela === "TABELA_BASE" && v.regraPrecoBase)
                    return v.regraPrecoBase.map(rpb => (
                      <div key={`resumoItem_${rpb.chave}`}>
                        <b>
                          Total Preço {rpb.label}:{" "}
                          {this.state.formData[`preco_total_${rpb.chave}`] || 0}
                        </b>
                      </div>
                    ));
                })}
              <div key={`resumoItem_total`}>
                <b>Total Geral: {this.state.formData.total_preco_item || 0}</b>
              </div>
            </Layout.Footer>
          </Affix>
        </div>
      </SimpleLazyLoader>
    );
  }

  geraVariacoesInputsDinamicos(variacao) {
    const { getFieldDecorator } = this.props.form;
    const compInput = obj => (
      <Row
        key={`rowVariacaoDinamico_${obj.chave}`}
        id={`rowVariacaoDinamico_${obj.chave}`}>
        <Col span={12}>
          <Form.Item
            help={
              !this.state.variacoesSelecionadas ||
              !this.state.variacoesSelecionadas.hasOwnProperty(variacao.chave)
                ? "Selecione um(a) " + variacao.label + " primeiro"
                : ""
            }
            validateStatus={
              !this.state.variacoesSelecionadas ||
              !this.state.variacoesSelecionadas.hasOwnProperty(variacao.chave)
                ? "warning"
                : ""
            }
            label={`Preço - ${obj.label}`}
            {...{
              labelCol: { span: 12 },
              wrapperCol: { span: 12 }
            }}>
            {getFieldDecorator(`preco_${obj.chave}`, {
              normalize: value => value && value.toString().replace(",", "."),
              rules: [
                {
                  required: obj.obrigatorio,
                  message: "Este campo é obrigatório!"
                }
              ],
              initialValue: this.state.formData[`preco_${obj.chave}`]
                ? this.state.formData[`preco_${obj.chave}`]
                    .toString()
                    .replace(",", ".")
                : undefined
            })(
              <Input
                disabled={
                  !this.state.variacoesSelecionadas ||
                  !this.state.variacoesSelecionadas.hasOwnProperty(
                    variacao.chave
                  )
                }
                onKeyUp={() => this.calcularResumo()}
                name={`preco_${obj.chave}`}
              />
            )}
          </Form.Item>
        </Col>
        <Col span={12}>
          <SFFPorcentagem
            disabled={
              !this.state.variacoesSelecionadas ||
              !this.state.variacoesSelecionadas.hasOwnProperty(variacao.chave)
            }
            name={`desconto_${obj.chave}`}
            label={`Desconto - ${obj.label}`}
            formItemLayout={{
              labelCol: { span: 12 },
              wrapperCol: { span: 12 }
            }}
            getFieldDecorator={getFieldDecorator}
            handleFormState={this.handleFormState}
            trigger={() => this.calcularResumo()}
          />
        </Col>
      </Row>
    );

    if (variacao.tipoTabela === "TABELA_CARACTERISTICA")
      return compInput(variacao);

    if (variacao.tipoTabela === "TABELA_BASE" && variacao.regraPrecoBase) {
      return variacao.regraPrecoBase.map(rpb => compInput(rpb));
    }
  }

  async atualizaValorVariacao(variacao, valor) {
    try {
      this.setState({ [`loadingVariacoes_${variacao.chave}`]: true });

      if (variacao.tipoTabela === "TABELA_CARACTERISTICA") {
        const tabelaCaract = await FeaturePriceTableService.list({
          status: true,
          "grupo_produto.id": this.state.formData.grupo_produto.id,
          "caracteristica.chave": variacao.chave,
          fields: "u_m_preco, grupo_produto,caracteristica,precos.$",
          "precos.deleted": false,
          limit: 1
        }).then(response => response.docs);

        if (tabelaCaract && tabelaCaract.length) {
          const precos = tabelaCaract[0].precos || [];
          this.props.form.resetFields([
            `preco_${variacao.chave}`,
            `desconto_${variacao.chave}`
          ]);

          if (precos.length) {
            const { valor: valorVariacao } = precos.find(
              p => p.opcao_chave === valor
            );

            this.setState(prev => ({
              ...prev,
              formData: {
                ...prev.formData,
                [`preco_${variacao.chave}`]:
                  (valorVariacao &&
                    valorVariacao.toString().replace(",", ".")) ||
                  undefined,
                [`desconto_${variacao.chave}`]: 0,
                [`fator_conversao_${variacao.chave}`]: tabelaCaract[0].u_m_preco
              }
            }));
          }
        }
      }
      if (variacao.tipoTabela === "TABELA_BASE") {
        variacao.regraPrecoBase.map(rpb => {
          this.props.form.resetFields([
            `preco_${rpb.chave}`,
            `desconto_${rpb.chave}`
          ]);
          this.setState(prev => ({
            ...prev,
            formData: {
              ...prev.formData,
              [`preco_${rpb.chave}`]: 0,
              [`desconto_${rpb.chave}`]: 0
            }
          }));
        });

        const tabelaPreco = await GetVariation({
          priceTable: this.state.formData.tabela_preco_base.id,
          productGroup: this.state.formData.grupo_produto.id,
          productID: this.state.formData.produto.id,
          variacao: variacao.chave,
          valor,
          orderID: this.state.order_id
        });

        if (tabelaPreco !== false)
          this.setState(prev => ({
            ...prev,
            formData: { ...prev.formData, ...tabelaPreco }
          }));
      }
      this.calcularResumo();
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
    } finally {
      this.setState({ [`loadingVariacoes_${variacao.chave}`]: false });
    }
  }

  async getFatorConversaoTabelaPrecoCaract(chave) {
    // debugger
    const unid_med_preco = this.state.formData[`fator_conversao_${chave}`];
    const { embalagem } = this.state.formData;
    let fatorConversao = 1;

    // Se a unid. medida que veio da tabela de preço base for diferente, fazer conversão *******
    if (unid_med_preco !== embalagem) {
      const unidadesDeMedida = await ListUnitsMeasures({
        limit: -1,
        status: true
      }).then(response => response.docs);

      if (!unidadesDeMedida) {
        flashWithError(
          `Não existem unidades de medidas disponíveis para realizar a conversão de ${embalagem} para ${unid_med_preco}`
        );
      } else {
        fatorConversao = fatorConversaoUM(
          unidadesDeMedida,
          embalagem,
          unid_med_preco
        );

        if (fatorConversao === "erro") {
          fatorConversao = 1;
          flashWithError(
            `[fatorConversaoUM TBLPC] - Não conseguir realizar a conversão de ${embalagem} para ${unid_med_preco}`
          );
        }
      }
    }

    return fatorConversao;
  }

  async getFatorConversaoTabelaBase() {
    const {
      tabela_preco_base: { id: tabelaPrecoID },
      grupo_produto: { id: grupoProdutoID },
      produto: { id: produtoID },
      embalagem
    } = this.state.formData;

    let fatorConversao = 1;

    if (embalagem && tabelaPrecoID && grupoProdutoID && produtoID) {
      const produtoTabelaPreco = await PriceTableProductService.get(
        tabelaPrecoID
      )(grupoProdutoID)(produtoID);

      // Se a unid. medida que veio da tabela de preço base for diferente, fazer conversão *******
      if (produtoTabelaPreco && produtoTabelaPreco.u_m_preco !== embalagem) {
        const unidadesDeMedida = await ListUnitsMeasures({
          limit: -1,
          status: true
        }).then(response => response.docs);

        if (!unidadesDeMedida) {
          flashWithError(
            `Não existem unidades de medidas disponíveis para realizar a conversão de ${embalagem} para ${
              produtoTabelaPreco.u_m_preco
            }`
          );
        } else {
          fatorConversao = fatorConversaoUM(
            unidadesDeMedida,
            embalagem,
            produtoTabelaPreco.u_m_preco
          );

          if (fatorConversao === "erro") {
            fatorConversao = 1;
            flashWithError(
              `[fatorConversaoUM TPB] - Não conseguir realizar a conversão de ${embalagem} para ${
                produtoTabelaPreco.u_m_preco
              }`
            );
          }
        }
      }
    }

    return fatorConversao;
  }

  async calcularResumo() {
    let fatorConversaoChaves = {};
    let calculaTotalCaract = (chave, fatorConversao) => {
      return (
        fatorConversao *
          (this.state.formData[`preco_${chave}`] -
            this.state.formData[`preco_${chave}`] *
              this.state.formData[`desconto_${chave}`]) *
          this.state.formData.quantidade || 0
      );
    };
    calculaTotalCaract = calculaTotalCaract.bind(this);

    if (
      this.state.formData.quantidade &&
      (this.state.variacoesSelecionadas &&
        Object.keys(this.state.variacoesSelecionadas).length)
    ) {
      // debugger;
      let totais = {
        total_preco_item: 0
      };

      await Promise.all(
        await Object.keys(this.state.variacoesSelecionadas).map(async vs => {
          let { tipoTabela, regraPrecoBase } = this.state.variacoes.find(
            v => v.chave === vs
          );

          if (tipoTabela === "TABELA_CARACTERISTICA") {
            const fatorCaract = await this.getFatorConversaoTabelaPrecoCaract(
              vs
            );

            fatorConversaoChaves[`fator_conversao_${vs}`] = this.state.formData
              .embalagem
              ? this.state.formData.embalagem
              : "";
            totais[`preco_total_${vs}`] = calculaTotalCaract(vs, fatorCaract);
            totais["total_preco_item"] += totais[`preco_total_${vs}`];
          }
          if (tipoTabela === "TABELA_BASE" && regraPrecoBase) {
            const fatorCaract = await this.getFatorConversaoTabelaBase();
            return regraPrecoBase.forEach(rpb => {
              fatorConversaoChaves[`fator_conversao_${rpb.chave}`] = this.state
                .formData.embalagem
                ? this.state.formData.embalagem
                : "";
              totais[`preco_total_${rpb.chave}`] = calculaTotalCaract(
                rpb.chave,
                fatorCaract
              );
              totais["total_preco_item"] += totais[`preco_total_${rpb.chave}`];
            });
          }
          return true;
        })
      );

      // Desconto no item
      totais["total_preco_item"] -=
        totais["total_preco_item"] * this.state.formData.desconto || 0;

      this.setState(prev => ({
        ...prev,
        formData: { ...prev.formData, ...totais, ...fatorConversaoChaves }
      }));
    }
  }
}

const mapStateToProps = ({ pedidoState }) => {
  return {
    pedido: pedidoState.pedidoData
  };
};
const WrappepOrderItemForm = Form.create()(OrderItemForm);

export default connect(mapStateToProps)(WrappepOrderItemForm);
