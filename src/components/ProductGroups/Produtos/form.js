import React, { Component } from "react";
import {
  Button,
  Input,
  Form,
  Affix,
  Checkbox,
  Card,
  Icon,
  Divider,
  Popconfirm,
  Tooltip,
  Select
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import * as ProductsService from "../../../services/products";
import * as UnidadeMedidaService from "../../../services/units-measures";
import styled from "styled-components";
import SimpleTable from "../../common/SimpleTable";
import ModalForm from "./modal";

const CardStyled = styled(Card)`
  background: #fff;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e3cccc;
`;

class ProductForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      group_id: this.props.match.params.group_id || this.props.group,
      savingForm: false,
      visible: false,
      group_fields: [],
      group_caracteristicas: [],
      u_ms: []
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const { group_data } = this.props.location.state;

    if (id) {
      const formData = await ProductsService.get(this.state.group_id)(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          group_fields: group_data.fields || [],
          group_caracteristicas: group_data.caracteristicas
            ? group_data.caracteristicas.filter(item => !item.deleted)
            : [],
          editMode: id ? true : false
        }));
    }

    const u_ms = await UnidadeMedidaService.list({
      limit: -1,
      status: true,
      fields: "nome,_id,sigla"
    });

    this.setState(prev => ({
      ...prev,
      group_fields: group_data.fields || [],
      group_caracteristicas: group_data.caracteristicas || [],
      u_ms: u_ms.docs
    }));

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  handleFormState = async event => {
    //console.log(event);
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
            await ProductsService.create(this.state.group_id)(
              this.state.formData
            );
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              this.props.match.params.group_id
                ? `/grupos-produtos/${
                    this.props.match.params.group_id
                  }/produtos/`
                : "/produtos"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma característica", err);
          } finally {
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await ProductsService.update(this.state.group_id)(
              this.state.formData
            );
            flashWithSuccess();
            this.props.history.push(
              this.props.match.params.group_id
                ? `/grupos-produtos/${
                    this.props.match.params.group_id
                  }/produtos/`
                : "/produtos"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma característica ", err);
          } finally {
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  showModal = record => {
    this.setState({
      visible: true,
      record,
      editarVariacao: !!record
    });
  };

  handleOk = item => {
    this.setState(prev => {
      if (prev.formData.variacoes) {
        const dados = prev.formData;
        if (this.state.editarVariacao) {
          dados.variacoes = dados.variacoes.map(dado => {
            if (dado._id == this.state.record._id) return item;
            return dado;
          });

          return {
            visible: false,
            formData: { ...dados },
            editarVariacao: false
          };
          //dados.variacoes = dados.variacoes.filter(dado => dado != this.state.record)
        }
        return {
          visible: false,
          formData: { ...dados, variacoes: [...prev.formData.variacoes, item] },
          editarVariacao: false
        };
      }
      return {
        visible: false,
        formData: { ...prev.formData, variacoes: [item] },
        editarVariacao: false
      };
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  removerVariacao = variacao => {
    if (variacao) {
      this.setState(prev => {
        if (prev.formData.variacoes)
          return {
            formData: {
              ...prev.formData,
              variacoes: prev.formData.variacoes.filter(
                item => item !== variacao
              )
            }
          };
      });
    }
  };

  ordenaTabela = (a, b, chave) => {
    if (a[chave] && b[chave]) {
      if (a[chave].toLowerCase() < b[chave].toLowerCase()) return -1;
      return 1;
    }
    return 1;
  };

  tableConfig = () => {
    const caracteristicas = this.state.group_caracteristicas; //[{chave:'peneira', label:'Peneira'}, {chave:'tratamento', label:'Tratamento'}]
    const colunasCaracteristicas = caracteristicas.map(item => {
      // console.log(item)
      return {
        title: item.label,
        dataIndex: `${item.chave}`,
        key: `${item.chave}`,
        sorter: (a, b) => this.ordenaTabela(a, b, `${item.chave}`),
        render: text => {
          return text ? text.label : "";
        }
      };
    });

    return [
      ...colunasCaracteristicas,
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, record) => {
          const statusTxt = record.status ? "desativar" : "ativar";
          const statusBtn = record.status ? "unlock" : "lock";
          return (
            <Popconfirm
              title={`Tem certeza em ${statusTxt} o campo extra?`}
              onConfirm={e => this.changeStatus(record._id, !record.status)}
              okText="Sim"
              cancelText="Não">
              <Tooltip title={`${statusTxt.toUpperCase()} o campo extra`}>
                <Button size="small">
                  <FontAwesomeIcon icon={statusBtn} size="lg" />
                </Button>
              </Tooltip>
            </Popconfirm>
          );
        }
      },
      {
        title: "Ações",
        dataIndex: "action",
        render: (text, record) => {
          return (
            <span>
              <Button size="small" onClick={() => this.showModal(record)}>
                <Icon type="edit" style={{ fontSize: "16px" }} />
              </Button>
              <Divider
                style={{ fontSize: "10px", padding: 0, margin: 2 }}
                type="vertical"
              />

              <Popconfirm
                title={`Tem certeza em excluir o campo extra?`}
                onConfirm={() => this.removerVariacao(record)}
                okText="Sim"
                cancelText="Não">
                <Button size="small">
                  <Icon type="delete" style={{ fontSize: "16px" }} />
                </Button>
              </Popconfirm>
            </span>
          );
        }
      }
    ];
  };

  gerarFormulario = (fields, getFieldDecorator, formItemLayout) => {
    return fields.map(field => (
      <Form.Item
        label={`${field.label}`}
        key={`${field.chave}`}
        {...formItemLayout}>
        {getFieldDecorator(`${field.chave}`, {
          initialValue: this.state.formData[`${field.chave}`],
          rules: [
            {
              required: field.obrigatorio,
              message: "Este campo é obrigatório!"
            }
          ]
        })(<Input name={`${field.chave}`} />)}
      </Form.Item>
    ));
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };
    const tailFormItemLayout = {
      wrapperCol: { span: 12, offset: 2 }
    };

    return (
      <div>
        <SimpleBreadCrumb
          to={
            this.props.match.params.group_id
              ? `/grupos-produtos/${this.props.match.params.group_id}/produtos`
              : "/produtos"
          }
          history={this.props.history}
        />

        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Produto" : "Novo Produto"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Produto
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
          <Form.Item label="Nome Comercial" {...formItemLayout}>
            {getFieldDecorator("nome_comercial", {
              initialValue: this.state.formData.nome_comercial
            })(<Input name="nome_comercial" />)}
          </Form.Item>
          <Form.Item label="Unid. Medida Primária" {...formItemLayout}>
            {getFieldDecorator("u_m_primaria", {
              // rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.u_m_primaria
                ? JSON.stringify(this.state.formData.u_m_primaria)
                : undefined
            })(
              <Select
                name="u_m_primaria"
                showAction={["focus", "click"]}
                showSearch
                placeholder="Selecione uma unidade de medida..."
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                onChange={e => {
                  this.handleFormState({
                    target: { name: "u_m_primaria", value: JSON.parse(e) }
                  });
                }}>
                {this.state.u_ms.map(u_m => (
                  <Select.Option
                    key={u_m._id}
                    value={JSON.stringify({
                      value: u_m.sigla,
                      label: u_m.sigla
                    })}>
                    {u_m.sigla}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>

          {this.state.group_fields &&
            this.gerarFormulario(
              this.state.group_fields,
              getFieldDecorator,
              formItemLayout
            )}

          <Form.Item {...tailFormItemLayout}>
            {getFieldDecorator("possui_variacao", {
              initialValue: this.state.formData.possui_variacao
            })(
              <Checkbox
                checked={this.state.formData.possui_variacao}
                onChange={e =>
                  this.handleFormState({
                    target: {
                      name: "possui_variacao",
                      value: e.target.checked
                    }
                  })
                }>
                Possui variação?
              </Checkbox>
            )}
          </Form.Item>
        </Form>

        {this.state.formData.possui_variacao && (
          <CardStyled
            type="inner"
            title="Variações"
            bordered
            extra={
              <Button
                type="primary"
                icon="plus"
                onClick={() => this.showModal()}>
                Adicionar
              </Button>
            }>
            <SimpleTable
              rowKey="_id"
              spinning={false}
              columns={this.tableConfig()}
              dataSource={this.state.formData.variacoes || []}
              onChange={this.handleTableChange}
              pagination={false}
            />
          </CardStyled>
        )}

        <ModalForm
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          wrappedComponentRef={this.saveFormRef}
          group_id={this.state.group_id}
          record={this.state.record}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  return {
    group: painelState.userData.group
  };
};

const WrappepProductForm = Form.create()(ProductForm);

export default withRouter(connect(mapStateToProps)(WrappepProductForm));
