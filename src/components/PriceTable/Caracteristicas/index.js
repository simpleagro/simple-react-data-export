import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Card,
  Divider,
  Button,
  Icon,
  Popconfirm,
  Tooltip,
  Row,
  Col
} from "antd";
import { withRouter } from "react-router-dom";

import * as ProductsService from "../../../services/pricetable.products";
import * as FeaturesService from "../../../services/pricetable.features";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import ModalProduct from '../Products/modal'
import * as GroupsFeaturesService from "../../../services/productgroups";
import { simpleTableSearch } from "../../../lib/simpleTableSearch"

class CaracteristicasPriceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      },
      pricetable_id: this.props.match.params.pricetable_id || 0,
      productgroup_id: this.props.match.params.productgroup_id || 0,
      product_id: this.props.match.params.product_id || 0,
      product_data: {},
      visible: false,
      visiblePriceTable: false,
      group_caracteristicas:[],
      group_regra_preco:[]
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await FeaturesService.list(this.state.pricetable_id)(this.state.productgroup_id)(this.state.product_id)(aqp);
    const groupData = await GroupsFeaturesService.get(this.state.productgroup_id);
    const productData = await ProductsService.get(this.state.pricetable_id)(this.state.productgroup_id)(this.state.product_id);
    const groupDataCaracteristicas = groupData.caracteristicas;
    const groupDataPrecoBase = groupData.preco_base_regra;

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      group_caracteristicas: groupDataCaracteristicas.filter(item => item.tipo_preco == 'TABELA_BASE'),
      group_regra_preco: groupDataPrecoBase,
      product_data: productData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await FeaturesService.changeStatus(this.state.pricetable_id)(this.state.productgroup_id)(this.state.product_id)(
        id,
        newStatus
      );

      let recordName = ",";

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
          recordName = item.razao_social;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `A característica, ${recordName} foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da característica", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await FeaturesService.remove(this.state.pricetable_id)(this.state.productgroup_id)(this.state.product_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A característica, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma característica", err);
    }
  };

  ordenaTabela = (a, b, chave) => {
    if(a[chave] && b[chave]) {
      if(a[chave].toLowerCase() < b[chave].toLowerCase()) 
        return -1
      return 1
    }
    return 1
  }

  tableConfig = () => {
    const caracteristicas = this.state.group_caracteristicas //[{chave:'peneira', label:'Peneira'}, {chave:'tratamento', label:'Tratamento'}]
    const colunasCaracteristicas = caracteristicas.map(item => {
      return (
        {
          title: item.label,
          dataIndex: `${item.chave}`,
          key: `${item.chave}`,
          sorter: (a, b) => this.ordenaTabela(a, b, `${item.chave}`),
          ...simpleTableSearch(this)(`${item.chave}`),
          render: text => text
        }
      )
    });

    const regra_preco = this.state.group_regra_preco
    const colunasRegraPreco = regra_preco.map(item => {
      //console.log(item)
      return (
        {
          title: item.label,
          dataIndex: `preco_${item.chave}`,
          key: `preco_${item.chave}`,
          sorter: (a, b) => this.ordenaTabela(a, b, `preco_${item.chave}`)
        }
      )
    });

    const regraTotalPreco = dado => {
      let preco = 0
      regra_preco.forEach(item => {
        if(dado[`preco_${item.chave}`])
          preco = preco + parseFloat(dado[`preco_${item.chave}`].replace(',', '.'))
      });

      return preco.toFixed(2).toString().replace('.',',')
    }

    return [
      ...colunasCaracteristicas,
      ...colunasRegraPreco,
      {
        title: "Preço Total",
        dataIndex: `preco_total`,
        key: `preco_total`,
        sorter: (a, b) => this.ordenaTabela(a, b, `preco_total`),
        render: (text, record) => regraTotalPreco(record)
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, record) => {
          const statusTxt = record.status ? "desativar" : "ativar";
          const statusBtn = record.status ? "unlock" : "lock";
          return (
            <Popconfirm
              title={`Tem certeza em ${statusTxt} a característica?`}
              onConfirm={e => this.changeStatus(record._id, !record.status)}
              okText="Sim"
              cancelText="Não">
              <Tooltip title={`${statusTxt.toUpperCase()} a característica`}>
                <Button size="small">
                  <FontAwesomeIcon icon={statusBtn} size="lg" />
                </Button>
              </Tooltip>
            </Popconfirm>
          );
        }
      },
      {
        title: "",
        dataIndex: "action",
        render: (text, record) => {
          return (
            <span>
              <Button
                size="small"
                onClick={() => this.showModal(record) }>
                <Icon type="edit" style={{ fontSize: "16px" }} />
              </Button>
              <Divider
                style={{ fontSize: "10px", padding: 0, margin: 2 }}
                type="vertical"
              />
              <Popconfirm
                title={`Tem certeza em excluir a característica?`}
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
  }

  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      editMode: !!record
    });
  }

  getDatabase = () => {
    const link = window.location.href;
    const suffixRegex = /(([http]*[s]*[:][/][/])+)/g;
    const linkRegex = /((.simpleagro.com.br)+(:[0-9]*)([/a-z0-9]*)*)/g;

    let newLink = link.replace(suffixRegex, "").replace(linkRegex, "");

    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        database: newLink
      }
    }));
  };

  setStatus = () => {
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        status: true
      }
    }));
  };

  handleOk = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */
      try {
        const created = await FeaturesService.create(this.state.pricetable_id)(this.state.productgroup_id)(this.state.product_id)(item);

        this.setState(prev => {
          if(prev.list.length > 0){
            return({
              openForm: false,
              editMode: false,
              visible: false,
              list: [...prev.list,created]
            })
          }
          return({
            openForm: false,
            editMode: false,
            visible: false,
            list: [created]
          })
        });
        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao adicionar uma característica", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await FeaturesService.update(this.state.pricetable_id)(this.state.productgroup_id)(this.state.product_id)(item);
        const data = await FeaturesService.list(this.state.pricetable_id)(this.state.productgroup_id)(this.state.product_id)();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar uma característica", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  showModalProduct = (record) => {
    this.setState({
      visiblePriceTable: true,
      record,
      editMode: !!record
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visiblePriceTable: false
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
      ...this.state.tableSearch
    });
  };

  render() {
    return (
      <div>
        {this.props.match.params.pricetable_id ? (
          <div>
            <SimpleBreadCrumb to={`/tabela-preco/${this.state.pricetable_id}/grupo-produto/${this.state.productgroup_id}/produtos`} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Produto: ${this.state.product_data.nome || ''}`}</p>
                  <p>{`Unidade de Medida: ${this.state.product_data.u_m_preco || ''}`}</p>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Variação de Preço"
                  bordered={false}
                  extra={
                    <Button
                      type="primary"
                      icon="plus"
                      onClick={() => this.showModal() }>
                      Adicionar
                    </Button>
                  }>
                  <SimpleTable
                    pagination={this.state.pagination}
                    spinning={this.state.loadingData}
                    rowKey="_id"
                    columns={this.tableConfig()}
                    dataSource={this.state.list}
                    onChange={this.handleTableChange}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <div>
            <PainelHeader title="Variação de Preço">
              <Button
                type="primary"
                icon="plus"
                onClick={() => this.showModal() }>
                Adicionar
              </Button>
            </PainelHeader>
            <SimpleTable
              pagination={this.state.pagination}
              spinning={this.state.loadingData}
              rowKey="_id"
              columns={this.tableConfig()}
              dataSource={this.state.list}
              onChange={this.handleTableChange}
            />
          </div>
        )}
        <ModalForm
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
          group_caracteristicas={this.state.group_caracteristicas}
          group_regra_preco={this.state.group_regra_preco}
        />
        <ModalProduct
          visible={this.state.visiblePriceTable}
          onCancel={this.handleCancel}
          //onCreate={this.handleOkPriceTable}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.product_data}
          grupo_produto_id={this.state.productgroup_id}
        />
      </div>
    );
  }
}

export default withRouter(CaracteristicasPriceTable);
