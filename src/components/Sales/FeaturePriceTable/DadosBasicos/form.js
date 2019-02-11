import React, { Component } from "react";
import {
  Button,
  Input,
  Form,
  Select,
  Affix,
  InputNumber,
  DatePicker
} from "antd";
import moment from "moment";

import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { PainelHeader } from "common/PainelHeader";
import * as FeaturePriceTableService from "services/feature-table-prices";
import * as ProductGroupService from "services/productgroups";
import * as SeasonsService from "services/seasons";
import * as UnitMeasureService from "services/units-measures";

const Option = Select.Option;

class FeaturePriceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      savingForm: false,
      formData: {}
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const dataType = await FeaturePriceTableService.list();
    const dataSeasons = await SeasonsService.list();
    const dataProductGroup = await ProductGroupService.list();
    const dataUnitMeasure = await UnitMeasureService.list();

    this.setState(prev => ({
      ...prev,
      listType: dataType.docs,
      listSeasons: dataSeasons.docs,
      listProductGroup: dataProductGroup.docs,
      listUnitMeasure: dataUnitMeasure.docs
    }));

    if (id) {
      const formData = await FeaturePriceTableService.get(id);

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
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  setCaracteristicaId = e => {
    this.setState({
      id_caracteristica: JSON.parse(e).id
    });
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
            const created = await FeaturePriceTableService.create(
              this.state.formData
            );
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();

            this.props.history.push(
              "/tabela-preco-caracteristica/" +
                created._id +
                "/variacao-de-preco"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log(
              "Erro interno ao adicionar uma tabela de preço de caracteristica",
              err
            );
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await FeaturePriceTableService.update(this.state.formData);
            flashWithSuccess();

            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/tabela-preco-caracteristica/");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log(
              "Erro interno ao atualizar uma tabela de preço de caracteristica ",
              err
            );
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
              : "/tabela-preco-caracteristica"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={[
              this.state.editMode ? "Editando" : "Novo",
              " Tabela Preço Caracteristica"
            ]}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Tabela Preço Característica
            </Button>
          </PainelHeader>
        </Affix>

        <Form onChange={this.handleFormState}>
          <Form.Item label="Centro de Custo" {...formItemLayout}>
            {getFieldDecorator("centro_custo", {
              rules: [
                { required: false, message: "Este campo é obrigatório!" }
              ],
              initialValue: this.state.formData.centro_custo
            })(
              <Input
                name="centro_custo"
                ref={input => (this.titleInput = input)}
              />
            )}
          </Form.Item>

          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" />)}
          </Form.Item>

          <Form.Item label="Moeda" {...formItemLayout}>
            {getFieldDecorator("moeda", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.moeda
            })(
              <Select
                name="moeda"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione uma moeda"
                onChange={e => {
                  this.handleFormState({
                    target: { name: "moeda", value: e }
                  });
                }}>
                <Option key="REAIS" value="REAIS"> Reais </Option>
                <Option key="GRÃOS" value="GRÃOS"> Grãos </Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Safra" {...formItemLayout}>
            {getFieldDecorator("safra", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.safra && this.state.formData.safra.descricao
            })(
              <Select
                name="safra"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione uma safra..."
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

          <Form.Item label="Data Base" {...formItemLayout}>
            {getFieldDecorator("data_base", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.data_base
                ? moment(
                    this.state.formData.data_base
                      ? this.state.formData.data_base
                      : new Date(),
                    "YYYY-MM-DD"
                  )
                : null
            })(
              <DatePicker
                onChange={(data, dataString) =>
                  this.handleFormState({
                    target: {
                      name: "data_base",
                      value: moment(dataString, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                      )
                    }
                  })
                }
                allowClear
                format={"DD/MM/YYYY"}
                style={{ width: 200 }}
                name="data_base"
              />
            )}
          </Form.Item>

          <Form.Item label="Versão" {...formItemLayout}>
            {getFieldDecorator("versao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.versao
            })(
              <InputNumber
                name="versao"
                onChange={e => {
                  this.handleFormState({
                    target: { name: "versao", value: e }
                  });
                }}
              />
            )}
          </Form.Item>

          <Form.Item label="Validade de" {...formItemLayout}>
            {getFieldDecorator("data_validade_de", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.data_validade_de
                ? moment(
                    this.state.formData.data_validade_de
                      ? this.state.formData.data_validade_de
                      : new Date(),
                    "YYYY-MM-DD"
                  )
                : null
            })(
              <DatePicker
                onChange={(data, dataString) =>
                  this.handleFormState({
                    target: {
                      name: "data_validade_de",
                      value: moment(dataString, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                      )
                    }
                  })
                }
                allowClear
                format={"DD/MM/YYYY"}
                style={{ width: 200 }}
                name="data_validade_de"
              />
            )}
          </Form.Item>

          <Form.Item label="Validade até" {...formItemLayout}>
            {getFieldDecorator("data_validade_ate", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.data_validade_ate
                ? moment(
                    this.state.formData.data_validade_ate
                      ? this.state.formData.data_validade_ate
                      : new Date(),
                    "YYYY-MM-DD"
                  )
                : null
            })(
              <DatePicker
                onChange={(data, dataString) =>
                  this.handleFormState({
                    target: {
                      name: "data_validade_ate",
                      value: moment(dataString, "DD/MM/YYYY").format(
                        "YYYY-MM-DD"
                      )
                    }
                  })
                }
                allowClear
                format={"DD/MM/YYYY"}
                style={{ width: 200 }}
                name="data_validade_ate"
              />
            )}
          </Form.Item>

          <Form.Item label="Taxa de Adição" {...formItemLayout}>
            {getFieldDecorator("taxa_adicao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.taxa_adicao
            })(
              <InputNumber
                onChange={e => {
                  this.handleFormState({
                    target: { name: "taxa_adicao", value: e }
                  });
                }}
                name="taxa_adicao"
              />
            )}
          </Form.Item>

          <Form.Item label="Taxa de Supressão" {...formItemLayout}>
            {getFieldDecorator("taxa_supressao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.taxa_supressao
            })(
              <InputNumber
                onChange={e => {
                  this.handleFormState({
                    target: { name: "taxa_supressao", value: e }
                  });
                }}
                name="taxa_supressao"
              />
            )}
          </Form.Item>

          <Form.Item label="Grupo de Produtos" {...formItemLayout}>
            {getFieldDecorator("grupo_produto", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.grupo_produto &&
                this.state.formData.grupo_produto.nome
            })(
              <Select
                name="grupo_produto"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um grupo..."
                onChange={e => {
                  this.handleFormState({
                    target: { name: "grupo_produto", value: JSON.parse(e) }
                  });
                  this.setCaracteristicaId(e);
                }}>
                {this.state.listProductGroup &&
                  this.state.listProductGroup.map(gp => (
                    <Option
                      key={gp._id}
                      value={JSON.stringify({ id: gp._id, nome: gp.nome })}>
                      {gp.nome}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Característica" {...formItemLayout}>
            {getFieldDecorator("caracteristica", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:
                this.state.formData.caracteristica &&
                this.state.formData.caracteristica.label
            })(
              <Select
                name="caracteristica"
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione um caracterista"
                onChange={e => {
                  this.handleFormState({
                    target: { name: "caracteristica", value: JSON.parse(e) }
                  });
                }}>
                {this.state.id_caracteristica &&
                  this.state.listProductGroup.map(
                    pg =>
                      pg._id === this.state.id_caracteristica &&
                      pg.caracteristicas
                        ? pg.caracteristicas.map(pgc => (
                            <Option
                              key={pgc._id}
                              value={JSON.stringify({
                                id: pgc._id,
                                label: pgc.label,
                                chave: pgc.chave
                              })}>
                              {pgc.label}
                            </Option>
                          ))
                        : []
                  )}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Unidade de Medida" {...formItemLayout}>
            {getFieldDecorator("u_m_preco", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.u_m_preco
            })(
              <Select
                name="u_m_preco"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione uma unidade..."
                onChange={e => {
                  this.handleFormState({
                    target: { name: "u_m_preco", value: e }
                  });
                }}>
                {this.state.listUnitMeasure &&
                  this.state.listUnitMeasure.map(un => (
                    <Option key={un._id} value={un.sigla}>
                      {un.nome}
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

const WrappepFeaturePriceTable = Form.create()(FeaturePriceTable);

export default WrappepFeaturePriceTable;
