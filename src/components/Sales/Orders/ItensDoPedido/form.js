import React, { Component } from "react";
import {
  InputNumber,
  Button,
  Form,
  Select,
  Affix,
  Tooltip,
  Card,
  Input,
  Row,
  Col
} from "antd";
import { connect } from "react-redux";
import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import * as ProductGroupService from "services/productgroups";
import * as OrderItemService from "../../../../services/orders.items";
import * as PriceTableService from "../../../../services/pricetable";
import { SimpleBreadCrumb } from "../../../common/SimpleBreadCrumb";
import { SimpleLazyLoader } from "../../../common/SimpleLazyLoader";

const Option = Select.Option;

class OrderItemForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {
        tabela_preco_base:
          this.props.pedido &&
          this.props.pedido._id === this.props.match.params.order_id &&
          this.props.pedido.tabela_preco_base
      },
      savingForm: false,
      loadingForm: true,
      gruposDeProdutos: [],
      tabelaPrecos: [],
      produtos: [],
      order_id: this.props.match.params.order_id
    };
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
      loadingForm: false,
      gruposDeProdutos,
      tabelaPrecos
    }));
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
    // debugger
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

    // somente variações que possuem opções
    // variacoes = variacoes.filter( v => v.opcoes.size );
    // trás as variações obrigatórias para cima
    // variacoes = variacoes.sort((a, b) => (b.obrigatorio ? 1 : -1));
    this.setState({ variacoes });
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
      variacoesSelecionadas
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <SimpleLazyLoader loadingForm={this.state.loadingForm}>
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
          <Form onChange={this.handleFormState}>
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
                  ? this.state.formData.grupo_produto.nome
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

            {this.state.variacoes && (
              <Card
                title="Variações do Produto"
                extra={
                  <Button onClick={() => this.getVariacoes()}>
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
                            initialValue: ""
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
                                this.atualizaValorVariacaoTabelaPreco(v.chave);
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

                        {this.geraVariacoesInputsDinamicos(
                          v,
                          getFieldDecorator
                        )}
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
            <Form.Item label="Desconto" {...formItemLayout}>
              {getFieldDecorator("desconto", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.desconto || 0
              })(
                <Tooltip title="Informe de 0 a 100 se houver desconto">
                  <InputNumber
                    step={0.01}
                    min={0}
                    max={1}
                    formatter={value => `${value * 100}`}
                    parser={value =>
                      value.replace("%", "").replace(",", ".") / 100
                    }
                    onChange={e =>
                      this.handleFormState({
                        target: { name: "desconto", value: e }
                      })
                    }
                    style={{ width: 200 }}
                    name="desconto"
                  />{" "}
                  %
                </Tooltip>
              )}
            </Form.Item>
            <Form.Item label="Quantidade" {...formItemLayout}>
              {getFieldDecorator("quantidade", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.quantidade || 1
              })(
                <InputNumber
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "quantidade", value: e }
                    })
                  }
                  style={{ width: 200 }}
                  name="quantidade"
                />
              )}
            </Form.Item>
            <Form.Item label="Preço Final Item" {...formItemLayout}>
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
            </Form.Item>
          </Form>
        </div>
      </SimpleLazyLoader>
    );
  }

  geraVariacoesInputsDinamicos(variacao, getFieldDecorator) {
    const compInput = obj => (
      <Row key={`rowVariacaoDinamico_${obj.chave}`}>
        <Col span={8}>
          <Form.Item
            label={`Preço - ${obj.label}`}
            {...{
              labelCol: { span: 12 },
              wrapperCol: { span: 12 }
            }}>
            {getFieldDecorator(`preco_${obj.chave}`, {
              rules: [
                {
                  required: obj.obrigatorio,
                  message: "Este campo é obrigatório!"
                }
              ],
              initialValue: this.state.formData[`preco_${obj.chave}` || 0]
            })(<Input name={`preco_${obj.chave}`} />)}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label={`Desconto - ${obj.label}`}
            {...{
              labelCol: { span: 12 },
              wrapperCol: { span: 12 }
            }}>
            {getFieldDecorator(`desconto_${obj.chave}`, {
              initialValue: this.state.formData[`desconto_${obj.chave}` || 0]
            })(<Input name={`desconto_${obj.chave}`} />)}
          </Form.Item>
        </Col>
      </Row>
    );

    if (variacao.tipoTabela === "TABELA_CARACTERISTICA") {
      return compInput(variacao);
    }
    if (variacao.tipoTabela === "TABELA_BASE" && variacao.regraPrecoBase) {
      return variacao.regraPrecoBase.map(rpb => compInput(rpb));
    }
  }

  async atualizaValorVariacaoTabelaPreco(chave) {
    const tabelaPreco = await PriceTableService.get(
      this.state.formData.tabela_preco_base.id
    )({
      fields: "grupo_produto.produtos,grupo_produto.$",
      "grupo_produto.id": this.state.formData.grupo_produto.id
    });
  }
}

const mapStateToProps = ({ pedidoState }) => {
  return {
    pedido: pedidoState.pedidoData
  };
};
const WrappepOrderItemForm = Form.create()(OrderItemForm);

export default connect(mapStateToProps)(WrappepOrderItemForm);
