import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Select,
  Affix,
  InputNumber
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import * as FeaturePriceTableService from "../../../../services/feature-table-prices";
import * as ProductGroupService from "../../../../services/productgroups";
import * as SeasonsService from "../../../../services/seasons";

const Option = Select.Option;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

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

    this.setState(prev => ({
      ...prev,
      listType: dataType.docs,
      listSeasons: dataSeasons.docs,
      listProductGroup: dataProductGroup
    }));

    if (id) {
      const formData = await FeaturePriceTableService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
        }));
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  handleFormState = event => {
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  setCaracteristicaId = e =>{
    this.setState({
      id_caracteristica: JSON.parse(e).id
    });
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        this.setState({ savingForm: true });
        await this.validateLogin(this.state.formData.login);
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            await FeaturePriceTableService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            // if (this.props.location.state && this.props.location.state.returnTo)
            //   this.props.history.push(this.props.location.state.returnTo);
            // else this.props.history.push("/usuarios");
            this.props.history.push("/tabela-preco-caracteristica/");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um usuário", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await FeaturePriceTableService.update(this.state.formData);
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/tabela-preco-caracteristica");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um usuário ", err);
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
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button
              href={
                this.props.location.state && this.props.location.state.returnTo
                  ? this.props.location.state.returnTo.pathname
                  : "/tabela-preco-caracteristica"
              }
            >
              <Icon type="arrow-left" />
              Voltar para tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={[ this.state.editMode ? "Editando" : "Novo", " Tabela Preço Caracteristica" ]}
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Tabela Preço Característica
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>

          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" ref={input => (this.titleInput = input)} />)}
          </Form.Item>

          <Form.Item label="Moeda" {...formItemLayout}>
            {getFieldDecorator("moeda", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.moeda
            })(<Select
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
                 }}
               >
                 <Option value="REAIS"> Reais </Option>
                 <Option value="SOJA"> Soja </Option>
               </Select>)}
          </Form.Item>

          <Form.Item label="Safra" {...formItemLayout}>
            {getFieldDecorator("safra", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.safra && this.state.formData.safra.descricao
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
                    target: { name: "safra", value: JSON.parse(e)}
                  })
                }}
              >
                {this.state.listSeasons &&
                  this.state.listSeasons.map(s => (<Option key={s._id} value={ JSON.stringify({id: s._id, descricao: s.descricao }) }>{ s.descricao }</Option>))
                }
              </Select>)}
          </Form.Item>

          <Form.Item label="Versão" {...formItemLayout}>
            {getFieldDecorator("versao", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.versao
            })(<InputNumber name="versao" onChange={e => {
              this.handleFormState({
                target: { name: "versao", value: e }
              })}}/>)}
          </Form.Item>

          <Form.Item label="Data de Validade" {...formItemLayout}>
            {getFieldDecorator("data_validade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.data_validade
            })(<Input name="data_validade" />)}
          </Form.Item>

          <Form.Item label="Grupo de Produtos" {...formItemLayout}>
            {getFieldDecorator("grupo_produto", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.grupo_produto && this.state.formData.grupo_produto.nome
            })(<Select
                 name="grupo_produto"
                 allowClear
                 showAction={["focus", "click"]}
                 showSearch
                 style={{ width: 200 }}
                 placeholder="Selecione um grupo..."
                 onChange={e => {
                   this.handleFormState({
                     target: { name: "grupo_produto", value: JSON.parse(e)}
                   });
                   this.setCaracteristicaId(e);
                 }}
               >
                {this.state.listProductGroup &&
                  this.state.listProductGroup.map(gp => (<Option key={gp._id} value={ JSON.stringify({id: gp._id, nome: gp.nome}) }>{ gp.nome }</Option>))}
               </Select>)}
          </Form.Item>

          <Form.Item label="Característica" {...formItemLayout}>
            {getFieldDecorator("caracteristica", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.caracteristica && this.state.formData.caracteristica.label
            })(<Select
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
                    this.state.listProductGroup.map(pg => pg._id === this.state.id_caracteristica
                      ? pg.caracteristicas.map(pgc =>
                          (<Option key={pgc._id}
                            value={ JSON.stringify({
                              id: pgc._id,
                              label: pgc.label,
                              chave: pgc.chave
                            })}
                          >
                            {pgc.label}
                          </Option>))
                      : null )}
               </Select>)}
          </Form.Item>

          {[
            console.clear(),
            console.log("state: ",this.state),
            console.log("props: ",this.props)
          ]}

        </Form>

      </div>
    );
  }
}

const WrappepFeaturePriceTable = Form.create()(FeaturePriceTable);

export default WrappepFeaturePriceTable;
