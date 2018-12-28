import React, { Component } from "react";
import "moment/locale/pt-br";
import { cloneDeep as _cloneDeep } from "lodash";

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
  Alert,
  Tooltip
} from "antd";
import styled from "styled-components";

import {
  flashWithSuccess,
  flashWithError,
  flashModalWithError
} from "../common/FlashMessages";
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
      status: true,
      validarClientesNaCarteira: true
    });

    if (id) {
      const formData = await CustomerWalletService.get(id);
      console.log(formData);
      if (formData) {
        let _clientesChecados = [];

        const _walletTree = _cloneDeep(formData.clientes).map(c => {
          if (c.gerenciarCarteiraPorPropriedade === true) {
            c.propriedades = c.propriedades.map(p => {
              if (p.fazParte && p.fazParte === true) {
                _clientesChecados.push(`${c.cliente_id}-${p._id}`);
              }
              return p;
            });
          } else _clientesChecados.push(c.cliente_id);

          delete c._id;
          console.log("C", c);
          return c;
        });

        const _formDataClientes = _cloneDeep(formData.clientes).map(c => {
          c.propriedades = c.propriedades.filter(
            p => p.fazParte && p.fazParte === true
          );
          console.log("C222", c);
          delete c._id;
          return c;
        });

        this.setState(prev => ({
          ...prev,
          formData: { ...formData, clientes: [..._formDataClientes] },
          walletTree: _walletTree,
          clientesChecados: _clientesChecados,
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

    setTimeout(() => {
      console.log("on EDIT", this.state);
    }, 1000);
  }

  handleFormState = event => {
    if (!event.target.name) return;
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
    const selectedClient = Object.assign(
      {},
      this.state.clients.find(c => c._id === cliente_id)
    );

    if (
      selectedClient.gerenciarCarteiraPorPropriedade === false &&
      selectedClient.clienteJaExisteEmOutraCarteira !== ""
    ) {
      flashModalWithError(
        `O cliente.:
      ${selectedClient.nome.toUpperCase()}
      já faz parte da carteira.:
      ${selectedClient.clienteJaExisteEmOutraCarteira.toUpperCase()}
      `,
        null,
        { centered: true }
      );
      return;
    }
    await this.setState(prev => ({ ...prev, selectedClient }));
  }

  async addClient() {
    const selectedClient = Object.assign({}, this.state.selectedClient);

    if (this.state.walletTree.find(wt => wt.cliente_id === selectedClient._id))
      return;

    this.setState(prev => ({
      ...prev,
      // ...{
      // formData: { ...prev.formData, clientesChecados },
      walletTree: [...prev.walletTree, selectedClient]
      // }
    }));
  }

  removeClient(cliente_id) {
    // debugger;
    let _walletTree = this.state.walletTree.filter(
      c =>
        (c.cliente_id !== undefined && c.cliente_id !== cliente_id) ||
        (c._id !== undefined && c._id !== cliente_id)
    );
    let _formDataClientes =
      this.state.formData && this.state.formData.clientes
        ? this.state.formData.clientes.filter(
            c =>
              (c.cliente_id !== undefined && c.cliente_id !== cliente_id) ||
              (c._id !== undefined && c._id !== cliente_id)
          )
        : [];

    this.setState(prev => ({
      ...prev,
      walletTree: _walletTree,
      formData: { ...prev.formData, clientes: _formDataClientes }
    }));
  }

  checkTreeNodes(checkeds, e) {
    // debugger;
    // aqui montamos a forma que queremos q o resultado da Tree seja salvo
    let clientes = this.state.formData.clientes
      ? this.state.formData.clientes
      : [];
    console.log("CLIENTES FORM", clientes);
    const {
      node: { props: nodeProps }
    } = e;

    const cliente = { propriedades: [], gerenciarCarteiraPorPropriedade: null };

    if (e.checked) {
      // debugger;
      if (nodeProps.ehCliente) {
        if (
          clientes.length > 0 &&
          clientes.find(c => c.cliente_id === nodeProps.dataRef.cliente_id)
        )
          return;
        cliente.cliente_id = nodeProps.dataRef._id;
        cliente.gerenciarCarteiraPorPropriedade =
          nodeProps.dataRef.gerenciarCarteiraPorPropriedade;
        if (nodeProps.dataRef.gerenciarCarteiraPorPropriedade)
          cliente.propriedades = nodeProps.dataRef.propriedades.map(p => p._id);

        clientes.push(cliente);

        this.setState(prev => ({
          ...prev,
          errorOnWalletTree: this.state.errorOnWalletTree.filter(
            err => err !== nodeProps.dataRef.nome
          )
        }));
      } else {
        // eh a propria propriedade
        // debugger;
        if (
          clientes.length > 0 &&
          clientes.find(c => {
            if (c.cliente_id === nodeProps.clienteID) {
              return c.propriedades.includes(nodeProps.dataRef._id.toString());
            }

            return false;
          })
        )
          return;

        clientes =
          clientes.length > 0
            ? clientes.map(c => {
                if (c.cliente_id && c.cliente_id === nodeProps.clienteID)
                  c.propriedades.push(nodeProps.dataRef._id);
                else
                  return {
                    cliente_id: nodeProps.clienteID,
                    propriedades: [nodeProps.dataRef._id],
                    gerenciarCarteiraPorPropriedade:
                      nodeProps.gerenciarCarteiraPorPropriedade
                  };
                return c;
              })
            : [
                {
                  cliente_id: nodeProps.clienteID,
                  propriedades: [nodeProps.dataRef._id],
                  gerenciarCarteiraPorPropriedade:
                    nodeProps.gerenciarCarteiraPorPropriedade
                }
              ];

        this.setState(prev => ({
          ...prev,
          errorOnWalletTree: this.state.errorOnWalletTree.filter(
            err => err !== nodeProps.clienteNome
          )
        }));
      }

      this.setState(prev => ({
        ...prev,
        formData: { ...prev.formData, clientes }
      }));

      //   console.log(this.state.formData);
    } else {
      if (nodeProps.ehCliente) {
        clientes = clientes.filter(
          c =>
            (nodeProps.dataRef._id !== undefined &&
              c.cliente_id !== nodeProps.dataRef._id) ||
            (nodeProps.dataRef.cliente_id !== undefined &&
              c.cliente_id !== nodeProps.dataRef.cliente_id)
        );

        // clientes = clientes.map(c => {
        //   if (c.cliente_id === nodeProps.dataRef._id) {
        //     if (
        //       c.gerenciarCarteiraPorPropriedade &&
        //       c.propriedades.length === 0
        //     ) {
        //       if (
        //         !this.state.errorOnWalletTree.find(
        //           err => err === nodeProps.clienteNome
        //         )
        //       )
        //         this.setState(prev => ({
        //           ...prev,
        //           errorOnWalletTree: [
        //             ...prev.errorOnWalletTree,
        //             nodeProps.clienteNome
        //           ]
        //         }));
        //     } else {
        //       this.setState(prev => ({
        //         ...prev,
        //         errorOnWalletTree: this.state.errorOnWalletTree.filter(
        //           err => err !== nodeProps.clienteNome
        //         )
        //       }));
        //     }
        //   }
        // });
      } else {
        // eh a propria propriedade

        // debugger;

        clientes = clientes.map(c => {
          if (c.cliente_id === nodeProps.clienteID) {
            c.propriedades = c.propriedades.filter(
              p =>
                (p._id !== undefined && p._id !== nodeProps.dataRef._id) ||
                (typeof p === "string" && p !== nodeProps.dataRef._id)
            );

            if (
              c.gerenciarCarteiraPorPropriedade &&
              c.propriedades.length === 0
            ) {
              if (
                !this.state.errorOnWalletTree.find(
                  err => err === nodeProps.clienteNome
                )
              )
                this.setState(prev => ({
                  ...prev,
                  errorOnWalletTree: [
                    ...prev.errorOnWalletTree,
                    nodeProps.clienteNome
                  ]
                }));
            } else {
              this.setState(prev => ({
                ...prev,
                errorOnWalletTree: this.state.errorOnWalletTree.filter(
                  err => err !== nodeProps.clienteNome
                )
              }));
            }
          }

          return c;
        });
      }
    }

    this.setState(prev => ({
      ...prev,
      formData: { ...prev.formData, clientes }
    }));

    setTimeout(() => {
      console.log(">>>>>", this.state);
    }, 1000);
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
            <Button
              disabled={this.state.errorOnWalletTree.length > 0}
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
            >
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
                    <p>
                      {" "}
                      Selecione um cliente para adicionar a carteira, <br />{" "}
                      logo após, marque o cliente ou apenas algumas de suas
                      propriedades que <br /> deseja gerenciar na carteira:{" "}
                    </p>
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
                    defaultCheckedKeys={this.state.clientesChecados}
                    onCheck={(checkedNodes, e) => {
                      this.checkTreeNodes(checkedNodes, e);
                    }}
                  >
                    {this.state.walletTree.map(
                      cliente => (
                        console.log(cliente),
                        (
                          <TreeNode
                            key={cliente.cliente_id || cliente._id}
                            dataRef={cliente}
                            ehCliente={true}
                            title={
                              <div>
                                {cliente.nome}
                                {cliente.gerenciarCarteiraPorPropriedade ? (
                                  <span style={{ fontSize: 10 }}>
                                    {" "}
                                    (Por propriedade)
                                  </span>
                                ) : (
                                  <span style={{ fontSize: 10 }}>
                                    {" "}
                                    (Por cliente)
                                  </span>
                                )}
                                <Button
                                  style={{ border: "none", marginLeft: 5 }}
                                  size="small"
                                  type="danger"
                                  shape="circle"
                                  onClick={e =>
                                    this.removeClient(
                                      cliente.cliente_id || cliente._id
                                    )
                                  }
                                >
                                  <Icon type="minus-circle" />
                                </Button>
                              </div>
                            }
                          >
                            {cliente.propriedades &&
                              cliente.propriedades.map(prop => (
                                <TreeNode
                                  disableCheckbox={
                                    prop.propriedadeJaExisteEmOutraCarteira !==
                                    ""
                                  }
                                  clienteID={cliente.cliente_id || cliente._id}
                                  clienteNome={cliente.nome}
                                  gerenciarCarteiraPorPropriedade={
                                    cliente.gerenciarCarteiraPorPropriedade
                                  }
                                  dataRef={prop}
                                  title={
                                    <Tooltip
                                      title={`Pertence a carteira.: ${prop.propriedadeJaExisteEmOutraCarteira}`}
                                    >
                                     {prop.nome}
                                    </Tooltip>
                                  }
                                  key={`${cliente.cliente_id || cliente._id}-${
                                    prop._id
                                  }`}
                                />
                              ))}
                          </TreeNode>
                        )
                      )
                    )}
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

// WEBPACK FOOTER //
// src/components/CustomersWallet/form.js

// WEBPACK FOOTER //
// src/components/CustomersWallet/form.js

// WEBPACK FOOTER //
// src/components/CustomersWallet/form.js

// WEBPACK FOOTER //
// src/components/CustomersWallet/form.js

// WEBPACK FOOTER //
// src/components/CustomersWallet/form.js

// WEBPACK FOOTER //
// src/components/CustomersWallet/form.js
