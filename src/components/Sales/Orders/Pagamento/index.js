import React, { Component } from "react";
import {
  Divider,
  Button,
  Spin,
  Icon,
  Popconfirm,
  Row,
  Col,
  Card,
  Form,
  Select,
  Input
} from "antd";
import debounce from "lodash/debounce";
import moment from "moment";
import "moment/locale/pt-br";

import * as OrderService from "services/orders";
import * as OrderItemsService from "services/orders.items";
import * as OrderPaymentService from "services/orders.payment";
import { list as ListUnitMeasureService } from "services/units-measures";
import { list as ListShipTableOrderItemsService } from "services/shiptable";
import SimpleTable from "common/SimpleTable";
import { fatorConversaoUM, currency } from "common/utils";
import { flashWithSuccess, flashWithError } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import ModalForm from "./modal";
import * as IBGEService from "services/ibge";
import { configAPP } from "config/app";

class OrderPaymentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      calculandoFrete: false,
      formData: {
        pagamento: {
          parcelas: []
        }
      },
      list: [],
      loadingData: true,
      order_id: this.props.match.params.order_id,
      order_data: null,
      tabelasFrete: [],
      estados: [],
      unidadesMedidas: [],
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
    this.calcularFrete = debounce(this.calcularFrete, 300);
  }

  async initializeList(aqp) {
    try {
      const items = await OrderItemsService.list(this.state.order_id)(aqp);
      const orderData = await OrderService.get(this.state.order_id, {
        fields:
          "tabela_preco_base, numero, cliente, propriedade, pagamento, cidade, estado"
      });
      this.setState(prev => ({
        ...prev,
        list: items.docs,
        loadingData: false,
        order_data: orderData,
        formData: {
          pagamento: orderData.pagamento
        },
        pagination: {
          total: items.total
        }
      }));
      this.props.dadosPedido(orderData);
    } catch (error) {
      // if (error && error.response && error.response.data) parseErrors(error);
      // this.props.history.push(`/pedidos`);
    } finally {
      this.setState({ loadingData: false });
    }
  }

  async componentDidMount() {
    await this.initializeList({
      fields:
        "produto, quantidade, desconto, total_preco_item, status, embalagem"
    });

    const estados = await IBGEService.listaEstados();

    const tabelasFrete = await ListShipTableOrderItemsService().then(
      response => response.docs
    );

    const unidadesMedidas = await ListUnitMeasureService({
      limit: -1,
      fields: "fator_conversao, nome, sigla, unidade_basica_id"
    }).then(response => response.docs);

    await this.setState(prev => ({
      ...prev,
      estados,
      tabelasFrete,
      unidadesMedidas
    }));

    this.calcularPeso({
      itens: this.state.list,
      pagamento: this.state.formData.pagamento,
      estado: this.state.order_data.estado
    });

    this.setState({
      total_pedido: this.state.list
        .map(t => t.total_preco_item)
        .reduce((a, b) => Number(a) + Number(b), 0)
      // this.state.saldo_a_parcelar
    });
  }

  changeStatus = async (id, newStatus) => {
    try {
      await OrderItemsService.changeStatus(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
          recordName = item.nome;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `O item, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do item", err);
    }
  };

  removeRecord = async index => {
    // try {
    //   let { parcelas } = this.state.order_data.pagamento;
    //   if(!parcelas) return;
    //   await OrderPaymentService.update(this.state.order_id)(parcelas);
    //   this.setState({
    //     order_data: this.state.form
    //   });
    //   flashWithSuccess(
    //     "",
    //     `O item, ${produto.nome}, foi removido com sucesso!`
    //   );
    // } catch (err) {
    //   if (err && err.response && err.response.data) parseErrors(err);
    //   console.log("Erro interno ao remover um item do pedido", err);
    // }
  };

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
    this.calcularFrete();
  };

  tableConfig = () => [
    {
      title: "Data de Vencimento",
      dataIndex: "data_vencimento",
      key: "data_vencimento",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => (text ? moment(text).format("DD/MM/YYYY") : undefined)
    },
    {
      title: "Forma de Pagamento",
      dataIndex: "forma_pagamento.descricao",
      key: "forma_pagamento.descricao",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Tipo de Pagamento",
      dataIndex: "tipo_pagamento.descricao",
      key: "tipo_pagamento.descricao",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Valor Parcela",
      dataIndex: "valor_parcela",
      key: "valor_parcela",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Ações",
      dataIndex: "action",
      render: (text, record, index) => {
        return (
          <span>
            <Button size="small" onClick={() => this.showModal(record, index)}>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>

            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Popconfirm
              title={`Tem certeza em excluir este item?`}
              onConfirm={() => this.removeRecord(record)}
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

  handleTableChange = (pagination, filter, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filter
    });
  };

  showModal = (record, index) => {
    this.setState(prev => ({
      ...prev,
      modalVisible: true,
      record,
      editedRecord: index || null,
      editMode: !!record
    }));
  };

  handleModalCancel = e => {
    this.setState({
      modalVisible: false,
      editedRecord: null
    });
  };

  handleModalOk = async modalData => {
    let { parcelas } = this.state.formData.pagamento;

    if (this.state.editedRecord !== null) {
      parcelas[this.state.editedRecord] = modalData;
    } else parcelas = [...this.state.formData.pagamento.parcelas, modalData];

    await this.setState(prev => ({
      modalVisible: false,
      formData: {
        ...prev.formData,
        pagamento: {
          ...prev.formData.pagamento,
          parcelas
        }
      }
    }));

    OrderPaymentService.update(this.state.order_id)(
      this.state.formData.pagamento
    );
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    return (
      <div>
        <SimpleBreadCrumb to={`/pedidos`} history={this.props.history} />

        <Row gutter={24}>
          <Col span={5}>
            <Card
              bordered
              style={{
                boxShadow: "0px 8px 0px 0px #009d55 inset",
                color: "#009d55"
              }}>
              {this.state.order_data && (
                <div>
                  <p>{`Cliente: ${this.state.order_data.cliente.nome}`}</p>
                  <p>{`CPF/CNPJ: ${this.state.order_data.cliente.cpf_cnpj}`}</p>
                  <p>{`Propriedade: ${
                    this.state.order_data.propriedade.nome
                  } - ${this.state.order_data.propriedade.ie}`}</p>
                </div>
              )}
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  this.props.history.push(
                    `/pedidos/${this.state.order_id}/edit`,
                    { returnTo: this.props.history.location }
                  );
                }}>
                <Icon type="edit" /> Editar
              </Button>
            </Card>
            <Card
              bordered
              style={{
                marginTop: "5px",
                boxShadow: "0px 8px 0px 0px #338c63 inset",
                color: "#338c63"
              }}>
              {this.state.order_data && (
                <div>
                  {configAPP.detalharPrecoPorCaracteristica() && (
                    <React.Fragment>
                      <p>{`Preço Total Royalties: ${
                        this.state.order_data.cliente.cpf_cnpj
                      }`}</p>
                      <p>{`Preço Total Germoplasma: ${
                        this.state.order_data.cliente.cpf_cnpj
                      }`}</p>
                      <p>{`Preço Total Tratamento: ${
                        this.state.order_data.cliente.cpf_cnpj
                      }`}</p>
                    </React.Fragment>
                  )}

                  <p>{`Preço Total Frete: ${currency()(
                    this.state.formData.total_pedido_frete || 0
                  )}`}</p>
                  <p>{`Total Pedido: ${currency()(
                    Number(this.state.total_pedido) +
                      Number(this.state.formData.total_pedido_frete || 0) || 0
                  )}`}</p>
                  <p>{`Saldo a parcelar: ${currency()(
                    Number(this.state.total_pedido) -
                      this.valorTotalParcelas() || 0
                  )}`}</p>
                </div>
              )}
            </Card>
          </Col>
          <Col span={19}>
            <Card
              title={
                <div>
                  Frete
                  <Spin
                    spinning={this.state.calculandoFrete}
                    indicator={
                      <Icon type="loading" style={{ fontSize: 24 }} spin />
                    }
                  />
                </div>
              }
              bordered={false}>
              <Form onChange={this.handleFormState}>
                <Row
                  gutter={8}
                  type="flex"
                  justify="space-between"
                  align="middle">
                  <Col span={8}>
                    <Form.Item label="Estado">
                      <Select
                        value={
                          this.state.formData.estado ||
                          (this.state.order_data &&
                            this.state.order_data.estado)
                        }
                        name="estado"
                        showAction={["focus", "click"]}
                        showSearch
                        placeholder="Selecione um estado..."
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={e => {
                          this.handleFormState({
                            target: {
                              name: "estado",
                              value: e
                            }
                          });
                        }}>
                        {this.state.estados.map(uf => (
                          <Select.Option key={uf} value={uf}>
                            {uf}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Distância">
                      <Input name="distancia" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Peso">
                      <Input name="peso" value={this.state.formData.peso} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
            <Card
              title="Parcelas"
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  onClick={() => this.showModal()}>
                  Adicionar Parcela
                </Button>
              }>
              <SimpleTable
                pagination={this.state.pagination}
                spinning={this.state.loadingData}
                rowKey={() => new Date().getTime() + Math.random()}
                columns={this.tableConfig()}
                dataSource={this.state.formData.pagamento.parcelas}
                onChange={this.handleTableChange}
              />
            </Card>
          </Col>
        </Row>
        <ModalForm
          visible={this.state.modalVisible}
          onCancel={this.handleModalCancel}
          onCreate={this.handleModalOk}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
        />
      </div>
    );
  }

  calcularFrete = () => {
    this.setState({ calculandoFrete: true });
    const { peso, distancia, estado } = this.state.formData;
    let tab = this.state.tabelasFrete.find(i => i.estado.includes(estado));
    if (!tab) {
      this.setState(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          total_pedido_frete: 0
        },
        calculandoFrete: false
      }));
      flashWithError(
        "Não foi possível encontrar uma tabela de frete para o estado selecionado: " +
          this.state.order_data.estado
      );
      return;
    }
    let preco_frete = 0;
    tab.range_km.forEach(range => {
      if (
        parseInt(range.km_de) <= parseInt(distancia) &&
        parseInt(range.km_ate) >= parseInt(distancia)
      ) {
        range.range_volume.forEach(volume => {
          if (
            parseInt(volume.pesokg_de) <= peso &&
            parseInt(volume.pesokg_ate) >= peso
          ) {
            preco_frete = volume.preco;
          }
        });
      }
    });
    preco_frete = parseFloat(preco_frete).toFixed(2);

    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        total_pedido_frete: preco_frete
      },
      calculandoFrete: false
    }));
  };

  calcularPeso = pedido => {
    let peso = 0;
    let fator = 1;
    pedido.itens.forEach(item => {
      fator = fatorConversaoUM(
        this.state.unidadesMedidas,
        item.embalagem,
        "kg"
      );
      peso += fator * item.quantidade;
    });
    this.setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        estado: pedido.pagamento.estado
          ? pedido.pagamento.estado
          : pedido.estado,
        peso
      }
    }));
  };

  valorTotalParcelas() {
    return (
      this.state.formData.pagamento &&
      this.state.formData.pagamento.parcelas &&
      this.state.formData.pagamento.parcelas
        .map(p => Number(p.valor_parcela))
        .reduce((a, b) => a + b, 0)
    );
  }
}

export default OrderPaymentForm;
