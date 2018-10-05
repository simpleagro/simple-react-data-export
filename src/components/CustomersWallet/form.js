import React, { Component } from "react";
import "moment/locale/pt-br";

import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Affix,
  Card,
  Select,
  Divider,
  Row,
  Col,
  Tree,
  Alert
} from "antd";
import styled from "styled-components";

import { flashWithSuccess, flashWithError } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as CustomerWalletService from "../../services/customerswallet";
import { list as ConsultantsServiceList } from "../../services/consultants";
import { list as ClientsServiceList } from "../../services/clients";
const Option = Select.Option;
const TreeNode = Tree.TreeNode;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

class CustomerWalletForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      consultants: [],
      clients: [],
      selectedClient: {},
      walletTree: [],
      walletTreeCheckeds: [],
      errorOnWalletTree: []
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    const consultants = await ConsultantsServiceList();
    const clients = await ClientsServiceList({
      limit: 99999999,
      fields: "nome,_id,propriedades,gerenciarCarteiraPorPropriedade",
      status: true
    });

    if (id) {
      const formData = await CustomerWalletService.get(id);

      if (formData) {
        let _walletTreeCheckeds = [];
        const _walletTree = formData.clientes
          ? formData.clientes.map(c => {
              // recuperando dados do cliente
              let cli = Object.assign(
                {},
                clients.docs.find(c2 => c2._id === c.cliente_id)
              );

              if (Object.keys(cli).length === 0) cli = c;

              if (cli.gerenciarCarteiraPorPropriedade) {
                cli.propriedades.forEach(propEl => {
                  const p = c.propriedades.find(c3 => c3 === propEl._id);
                  if (p) _walletTreeCheckeds.push(`${cli._id}-${propEl._id}`);
                });
              } else {
                _walletTreeCheckeds.push(`${cli._id}`);
              }

              return cli;
            })
          : [];

        this.setState(prev => ({
          ...prev,
          formData,
          walletTree: _walletTree,
          walletTreeCheckeds: _walletTreeCheckeds,
          editMode: id ? true : false
        }));
      }
    }

    this.setState(prev => ({
      ...prev,
      consultants: consultants.docs,
      clients: clients.docs
    }));

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

  saveForm = async e => {
    if (this.state.errorOnWalletTree.length > 0) {
      flashWithError(
        "Pelo menos uma propriedade por cliente precisa ser selecionado"
      );
      return;
    }

    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await CustomerWalletService.create(
              this.state.formData
            );
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
            // else this.props.history.push("/carteiras-de-clientes");
            this.props.history.push("/carteiras-de-clientes");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar a carteira de cliente", err);
          }
        } else {
          try {
            const updated = await CustomerWalletService.update(
              this.state.formData
            );
            flashWithSuccess();
            // a chamada do formulário pode vir por fluxos diferentes
            // então usamos o returnTo para verificar para onde ir
            // ou ir para o fluxo padrão
            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/carteiras-de-clientes");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log(
              "Erro interno ao atualizar a carteira de cliente ",
              err
            );
          }
        }
      }
    });
  };

  async selectedClient(cliente_id) {
    const selectedClient = this.state.clients.find(c => c._id === cliente_id);
    await this.setState(prev => ({ ...prev, selectedClient }));
  }

  async addClient() {
    const selectedClient = Object.assign({}, this.state.selectedClient);
    let _walletTree = this.state.walletTree;
    let _walletTreeCheckeds = this.state.walletTreeCheckeds;

    if (Object.keys(selectedClient).length === 0) return;

    if (!this.state.walletTree.find(w => w._id === selectedClient._id)) {
      if (selectedClient.gerenciarCarteiraPorPropriedade)
        _walletTree.push(selectedClient);
      else {
        selectedClient.propriedades = [];
        _walletTree.push(selectedClient);
      }

      let _formDataClientes = this.state.formData.clientes || [];

      if (!_formDataClientes.find(c => c._id === selectedClient._id)) {
        if (selectedClient.gerenciarCarteiraPorPropriedade) {
          _formDataClientes.push({
            cliente_id: selectedClient._id,
            propriedades: selectedClient.propriedades.map(p => p._id)
          });
          selectedClient.propriedades.forEach(el => {
            _walletTreeCheckeds.push(`${selectedClient._id}-${el._id}`);
          });
        } else {
          _formDataClientes.push({
            cliente_id: selectedClient._id
          });
          _walletTreeCheckeds.push(`${selectedClient._id}`);
        }
      }

      await this.setState(prev => ({
        ...prev,
        walletTree: [..._walletTree],
        selectedClient: {},
        walletTreeCheckeds: [..._walletTreeCheckeds],
        formData: { ...prev.formData, clientes: _formDataClientes }
      }));
    }
  }

  removeClient(cliente_id) {
    // debugger
    let _walletTree = this.state.walletTree.filter(c => c._id !== cliente_id);
    let _formDataClientes = this.state.formData.clientes.filter(
      c => c.cliente_id !== cliente_id
    );

    this.setState(prev => ({
      ...prev,
      walletTree: _walletTree,
      formData: { ...prev.formData, clientes: _formDataClientes }
    }));
  }

  checkTreeNodes(checkeds, e) {
    let _formDataClientes = Object.assign([], this.state.formData.clientes);
    let _walletTreeCheckeds = this.state.walletTreeCheckeds;

    this.setState({
      walletTreeCheckeds: e.checkedNodes.map(n => n.key)
    });

    // se n estiver mais marcado remover
    if (!e.checked) {
      _formDataClientes = _formDataClientes.map(cli => {
        if (cli.cliente_id === e.node.props["data-client-id"]) {
          cli.propriedades = cli.propriedades.filter(
            prop => prop !== e.node.props["data-prop-id"]
          );
          if (cli.propriedades.length === 0) {
            this.setState(prev => ({
              ...prev,
              errorOnWalletTree: [
                ...prev.errorOnWalletTree,
                this.state.clients.find(el => el._id === cli.cliente_id).nome
              ]
            }));
          } else
            this.setState(prev => ({
              ...prev,
              errorOnWalletTree: this.state.errorOnWalletTree.filter(
                e =>
                  e !==
                  this.state.clients.find(el => el._id === cli.cliente_id).nome
              )
            }));
        }
        return cli;
      });
    } else {
      _formDataClientes = _formDataClientes.map(cli => {
        if (cli.cliente_id === e.node.props["data-client-id"]) {
          cli.propriedades.push(e.node.props["data-prop-id"]);
          if (cli.propriedades.length === 0) {
            this.setState(prev => ({
              ...prev,
              errorOnWalletTree: [
                ...prev.errorOnWalletTree,
                this.state.clients.find(el => el._id === cli.cliente_id).nome
              ]
            }));
          } else
            this.setState(prev => ({
              ...prev,
              errorOnWalletTree: this.state.errorOnWalletTree.filter(
                e =>
                  e !==
                  this.state.clients.find(el => el._id === cli.cliente_id).nome
              )
            }));
        }
        return cli;
      });
    }

    // _formDataClientes.map(cli => {
    //   if (cli.propriedades.length === 0) {
    //     this.setState(prev => ({
    //       ...prev,
    //       errorOnWalletTree: this.state.clients.find(
    //         el => el._id === cli.cliente_id
    //       ).nome
    //     }));
    //   } else
    //     this.setState(prev => ({
    //       ...prev,
    //       errorOnWalletTree: false
    //     }));
    // });

    this.setState(prev => ({
      ...prev,
      formData: { ...prev.formData, clientes: _formDataClientes }
    }));
  }

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
                  : "/carteiras-de-clientes"
              }
            >
              <Icon type="arrow-left" />
              Voltar para tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={
              this.state.editMode
                ? "Editando Carteira de Cliente"
                : "Nova Carteira de Cliente"
            }
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Carteira de Cliente
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
          <Form.Item label="Consultor" {...formItemLayout}>
            {getFieldDecorator("consultor_id", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.consultor_id
            })(
              <Select
                defaultActiveFirstOption={false}
                name="consultor_id"
                showAction={["focus", "click"]}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "consultor_id", value: e }
                  })
                }
              >
                {this.state.consultants.map(c => (
                  <Option key={c._id} value={c._id}>
                    {c.nome}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="Gerente" {...formItemLayout}>
            {getFieldDecorator("gerente_id", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.gerente_id
            })(
              <Select
                defaultActiveFirstOption={false}
                name="gerente_id"
                showAction={["focus", "click"]}
                filterOption={(input, option) =>
                  option.props.children
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                showSearch
                style={{ width: 200 }}
                placeholder="Selecione..."
                onChange={e =>
                  this.handleFormState({
                    target: { name: "gerente_id", value: e }
                  })
                }
              >
                {this.state.consultants.map(c => (
                  <Option key={c._id} value={c._id}>
                    {c.nome}
                  </Option>
                ))}
              </Select>
            )}
          </Form.Item>

          <Row>
            <Col>
              <Card
                title={
                  <span>
                    <p> Selecione um cliente para adicionar a carteira: </p>
                    {this.state.errorOnWalletTree.length > 0 &&
                      this.state.errorOnWalletTree.map(err => (
                        <Alert
                          key={"err-" + err}
                          style={{ marginBottom: 20 }}
                          message="Erro"
                          description={`É necessário que o cliente: ${err.toUpperCase()}
                          tenha pelo menos 1 propriedade selecionada ou esteja selecionado (caso não seja por propriedade)`}
                          type="error"
                          showIcon
                        />
                      ))}
                    <Select
                      value={this.state.selectedClient._id}
                      name="cliente"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      showAction={["focus", "click"]}
                      showSearch
                      style={{ width: 200 }}
                      placeholder="Selecione..."
                      onChange={e => this.selectedClient(e)}
                    >
                      {this.state.clients.map(c => (
                        <Option key={c._id} value={c._id}>
                          {c.nome}
                        </Option>
                      ))}
                    </Select>
                    <Divider type="vertical" />
                    <Button
                      type="primary"
                      icon="plus"
                      onClick={() => this.addClient()}
                    >
                      Adicionar Cliente
                    </Button>
                  </span>
                }
              >
                {this.state.walletTree.length ? (
                  <Tree
                    checkable
                    checkedKeys={this.state.walletTreeCheckeds}
                    onCheck={(checkedKeys, e) =>
                      this.checkTreeNodes(checkedKeys, e)
                    }
                  >
                    {this.state.walletTree.map(data => (
                      <TreeNode
                        data-client-id={`${data._id}`}
                        key={`${data._id}`}
                        title={
                          <div>
                            {data.nome || data.cliente_id}
                            {data.gerenciarCarteiraPorPropriedade ? (
                              <span style={{ fontSize: 10 }}>
                                {" "}
                                (Por propriedade)
                              </span>
                            ) : (
                              <span style={{ fontSize: 10 }}>
                                {" "}
                                (Por Cliente)
                              </span>
                            )}
                            <Button
                              style={{ border: "none", marginLeft: 5 }}
                              size="small"
                              type="danger"
                              shape="circle"
                              onClick={e => this.removeClient(data._id)}
                            >
                              <Icon type="minus-circle" />
                            </Button>
                          </div>
                        }
                      >
                        {data.propriedades &&
                          data.propriedades.map(prop => (
                            <TreeNode
                              dataRef={data}
                              data-client-id={`${data._id || data}`}
                              data-prop-id={`${prop._id || prop}`}
                              title={prop.nome || prop}
                              key={`${data._id || data.cliente_id}-${prop._id ||
                                prop}`}
                            />
                          ))}
                      </TreeNode>
                    ))}
                  </Tree>
                ) : (
                  ""
                )}
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

const WrappepCustomerWalletForm = Form.create()(CustomerWalletForm);

export default WrappepCustomerWalletForm;
