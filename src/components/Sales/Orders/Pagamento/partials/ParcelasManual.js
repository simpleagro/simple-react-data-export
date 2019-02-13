import React, { Component } from "react";
import { Card, Button, Icon, Divider, Popconfirm } from "antd";
import moment from "moment";
import "moment/locale/pt-br";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import { dadosPedido } from "actions/pedidoActions";
import SimpleTable from "common/SimpleTable";
import { configAPP } from "config/app";
import ModalForm from "./modal";
import * as OrderPaymentService from "services/orders.payment";
import { flashWithSuccess, flashWithError } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";

class ParcelasManual extends Component {
  state = {
    formData: {
      pagamento: {
        parcelas: []
      }
    },
    modalVisible: false,
    record: null
  };

  showModal = (record, index = null) => {
    this.setState(prev => ({
      ...prev,
      modalVisible: true,
      record,
      editedRecord: index,
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
    try {
      let { parcelas } = this.props.pedido.pagamento;
      debugger
      if (this.state.editedRecord !== null) {
        parcelas[this.state.editedRecord] = modalData;
      } else parcelas = [...parcelas, modalData];

      await this.setState(prev => ({
        modalVisible: false
      }));

      this.props.dadosPedido({
        ...this.props.pedido,
        pagamento: {
          parcelas
        }
      });
      console.log(parcelas);
      await OrderPaymentService.update(this.props.pedido._id)({parcelas});
      flashWithSuccess("", `A parcela foi adicionada com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao adicionar parcelas do pagamento", err);
    }
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
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
      ...(!configAPP.usarConfiguracaoFPCaracteristica() && {
        title: "Forma de Pagamento",
        dataIndex: "forma_pagamento.descricao",
        key: "forma_pagamento.descricao",
        sorter: (a, b, sorter) => {
          if (sorter === "ascendent") return -1;
          else return 1;
        }
      })
    },
    {
      ...(!configAPP.usarConfiguracaoFPCaracteristica() && {
        title: "Tipo de Pagamento",
        dataIndex: "tipo_pagamento.descricao",
        key: "tipo_pagamento.descricao",
        sorter: (a, b, sorter) => {
          if (sorter === "ascendent") return -1;
          else return 1;
        }
      })
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
      ...(!configAPP.usarConfiguracaoFPCaracteristica() && {
        title: "Ações",
        dataIndex: "action",
        render: (text, record, index) => {
          return (
            <span>
              <Button
                size="small"
                onClick={() => this.showModal(record, index)}>
                <Icon type="edit" style={{ fontSize: "16px" }} />
              </Button>

              <Divider
                style={{ fontSize: "10px", padding: 0, margin: 2 }}
                type="vertical"
              />

              <Popconfirm
                title={`Tem certeza em excluir esta parcela?`}
                onConfirm={() => this.removeRecord(index)}
                okText="Sim"
                cancelText="Não">
                <Button size="small">
                  <Icon type="delete" style={{ fontSize: "16px" }} />
                </Button>
              </Popconfirm>
            </span>
          );
        }
      })
    }
  ];

  removeRecord = async index => {
    try {
      let { parcelas } = this.props.pedido.pagamento;
      if (!parcelas) return;

      parcelas.splice(index, 1);

      await this.setState(prev => ({
        modalVisible: false
      }));

      this.props.dadosPedido({
        ...this.props.pedido,
        pagamento: {
          parcelas
        }
      });

      await OrderPaymentService.update(this.props.pedido._id)({parcelas});
      flashWithSuccess("", `A parcela foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um item do pedido", err);
    }
  };

  render() {
    return (
      <React.Fragment>
        <Card
          title="Parcelas"
          bordered={false}
          extra={
            !configAPP.usarConfiguracaoFPCaracteristica() && (
              <Button
                type="primary"
                icon="plus"
                onClick={() => this.showModal()}>
                Adicionar Parcela
              </Button>
            )
          }>
          <SimpleTable
            pagination={false}
            spinning={false}
            rowKey={() => new Date().getTime() + Math.random()}
            columns={this.tableConfig()}
            dataSource={
              (this.props.pedido &&
                this.props.pedido.pagamento &&
                this.props.pedido.pagamento.parcelas) ||
              []
            }
          />
        </Card>
        <ModalForm
          visible={this.state.modalVisible}
          onCancel={this.handleModalCancel}
          onCreate={this.handleModalOk}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({ pedidoState }) => {
  return {
    pedido: pedidoState.pedidoData || null
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      dadosPedido
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ParcelasManual);
