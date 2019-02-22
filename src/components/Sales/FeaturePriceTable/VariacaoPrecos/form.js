import React, { Component } from "react";
import { Button, Icon, Input, Form, Select, Affix } from "antd";

import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { PainelHeader } from "common/PainelHeader";
import * as PriceVariationsService from "services/feature-table-prices.price-variations";
import * as UnitMeasuresService from "services/units-measures";
import * as ProductGroupsService from "services/productgroups";
import * as FeaturePriceTableService from "services/feature-table-prices";

const Option = Select.Option;

class PriceVariations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false
    };
  }

  async componentDidMount() {
    const { tabela_id, id } = this.props.match.params;
    const dataUnitMeasure = await UnitMeasuresService.list();
    const dataProductGroup = await ProductGroupsService.list();
    const dataFeaturePriceTable = await FeaturePriceTableService.list();

    this.setState(prev => ({
      ...prev,
      listUnit: dataUnitMeasure.docs,
      listProductGroup: dataProductGroup.docs,
      listFeaturePriceTable: dataFeaturePriceTable.docs,
      tabela_id: this.props.match.params.tabela_id
    }));

    if (id) {
      const formData = await PriceVariationsService.get(tabela_id)(id);

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

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await PriceVariationsService.create(
              this.state.tabela_id
            )(this.state.formData);
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/tabela-preco-caracteristica/${
                this.props.match.params.tabela_id
              }/variacao-de-preco`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);

            this.setState({ savingForm: false });
          }
        } else {
          try {
            const updated = await PriceVariationsService.update(
              this.state.tabela_id
            )(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/tabela-preco-caracteristica/${
                this.props.match.params.tabela_id
              }/variacao-de-preco`
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

  getProductGroupOption() {
    let arr = [];
    this.state.listFeaturePriceTable &&
      this.state.listFeaturePriceTable.map(
        fpt =>
          fpt._id === this.props.match.params.tabela_id &&
          this.state.listProductGroup &&
          this.state.listProductGroup.map(
            pg =>
              pg._id === fpt.grupo_produto.id &&
              pg.caracteristicas &&
              pg.caracteristicas.map(
                caract =>
                  caract._id === fpt.caracteristica.id &&
                  caract.opcoes.map(opc => arr.push({label: opc.label, value: opc.value}))
              )
          )
      );
    return arr;
  }

  async onSelectOpcao(e){
    await this.setState(prev => ({
      formData: {...prev.formData, opcao_label: e.label, opcao_chave: e.value }
    }))
  }

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
              : `/tabela-preco-caracteristica/${
                  this.state.tabela_id
                }/variacao-de-preco`
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={[
              this.state.editMode ? "Editando" : "Nova",
              " Variação de Preço"
            ]}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Variação de Preço
            </Button>
          </PainelHeader>
        </Affix>

        <Form onChange={this.handleFormState}>
          <Form.Item label="Opção" {...formItemLayout}>
            {getFieldDecorator("opcao_label", {
              rules: [{ required: true, message: "Este campo é obragatório!" }],
              initialValue: this.state.formData.opcao_label
            })(
              <Select
                name="opcao_label"
                allowClear
                showAction={["focus", "click"]}
                showSearch
                //style={{ width: 200 }}
                placeholder="Selecione uma opção...."
                onChange={e => {
                  this.handleFormState({
                    target: { name: "opcao_label", value: JSON.parse(e) }
                  });
                  this.onSelectOpcao(JSON.parse(e))
                }}>
                  {this.getProductGroupOption().map(element => (
                    <Option key={element.label} value={JSON.stringify(element)}>
                      {" "}
                      {element.label}{" "}
                    </Option>
                  ))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label="Valor" {...formItemLayout}>
            {getFieldDecorator("valor", {
              rules: [{ required: true, message: "Este campo é obragatório!" }],
              initialValue: this.state.formData.valor
            })(
              <Input
                name="valor"
                prefix="R$"
                ref={input => (this.titleInput = input)}
                //style={{ width: 200 }}
              />
            )}
          </Form.Item>

        </Form>
      </div>
    );
  }
}

const WrappepPriceVariations = Form.create()(PriceVariations);

export default WrappepPriceVariations;
