import React, { Component } from "react";
import { InputNumber, Button, Form, Select, Affix, Tooltip } from "antd";

import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import * as ProductGroupService from "services/productgroups";
import * as OrderItemService from "../../../../services/orders.items";
import { SimpleBreadCrumb } from "../../../common/SimpleBreadCrumb";
import { SimpleLazyLoader } from "../../../common/SimpleLazyLoader";

const Option = Select.Option;

class OrderItemForm extends Component {
  constructor(props) {
    debugger
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false,
      loadingForm: true,
      gruposDeProdutos: [],
      produtos: [],
      order_id: this.props.match.params.order_id
    };

    window.getVariacoes = this.getVariacoes;
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
      fields: "nome, produtos, caracteristicas",
      limit: -1
    }).then(response => response.docs);

    this.setState(prev => ({
      ...prev,
      loadingForm: false,
      gruposDeProdutos
    }));

    setTimeout(() => {
      // this.titleInput.focus();
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
  }

  async getVariacoes(chave, valor) {
    const grupo = JSON.parse(this.props.form.getFieldValue("grupo_produto"));
    console.log(grupo);
    const produto = JSON.parse(this.props.form.getFieldValue("produto"));
    console.log(produto);

    const filterVariacoes = (variacao, caract, valor) => {
      if (valor) return variacao[caract] === valor;
      return variacao[caract];
    };

    let variacoes = grupo.caracteristicas.map(c => {
      // this.props.form.resetFields([c.chave]);
      return {
        chave: c.chave,
        label: c.label,
        obrigatorio: c.obrigatorio,
        opcoes: new Set(
          produto.variacoes
            .filter(v => filterVariacoes(v, chave || c.chave, valor || null))
            .map(v => v[c.chave])
        )
      };
    });
    // trás as variações obrigatórias para cima
    variacoes = variacoes.sort((a, b) => (b.obrigatorio ? 1 : -1));
    this.setState({ variacoes });
    console.log(variacoes);
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
            {this.state.variacoes &&
              this.state.variacoes.map((v, index) => {
                console.log(v);
                const opcoes = Array.from(v.opcoes) || [];
                return (
                  <Form.Item key={v.chave} label={v.label} {...formItemLayout}>
                    {getFieldDecorator(v.chave, {
                      rules: [
                        {
                          required: v.obrigatorio,
                          message: "Este campo é obrigatório!"
                        }
                      ],
                      initialValue: ""
                    })(
                      <Select
                        // disabled={this.state.formData.grupo_produto === undefined}
                        name={v.chave}
                        showAction={["focus", "click"]}
                        showSearch
                        style={{ width: 200 }}
                        onSelect={e => this.getVariacoes(v.chave, e)}
                        placeholder="Selecione...">
                        {opcoes.length > 0
                          ? opcoes.map((t, index) => {
                              return (
                                t !== undefined && (
                                  <Option key={`${v.chave}_${index}`} value={t}>
                                    {t}
                                  </Option>
                                )
                              );
                            })
                          : ""}
                      </Select>
                    )}
                  </Form.Item>
                );
              })}
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
                    formatter={value => `${value*100}`}
                    parser={value =>
                      value.replace("%", "").replace(",", ".") / 100
                    }
                    onChange={
                      e => console.log("desconto", e)
                      // this.handleFormState({
                      //   target: { name: "desconto", value: e }
                      // })
                    }
                    style={{ width: 200 }}
                    name="desconto"
                  />
                  {" "}%
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
}

const WrappepOrderItemForm = Form.create()(OrderItemForm);

export default WrappepOrderItemForm;
