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

import * as ProductsService from "../../../services/comissiontable.products";
import * as VariationsService from "../../../services/comissiontable.variations";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import * as GroupsFeaturesService from "../../../services/productgroups";

class VariationComission extends Component {
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
      comissiontable_id: this.props.match.params.comissiontable_id || 0,
      rule_id: this.props.match.params.rule_id || 0,
      productgroup_id: this.props.match.params.productgroup_id || 0,
      product_id: this.props.match.params.product_id || 0,
      product_data: {},
      visible: false,
      group_caracteristicas:[],
      group_regra_preco:[]
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await VariationsService.list(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(this.state.product_id)(aqp);
    const productData = await ProductsService.get(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(this.state.product_id);
    const groupData = await GroupsFeaturesService.get(this.state.productgroup_id);
    const groupDataCaracteristicas = groupData.caracteristicas;
    const groupDataPrecoBase = groupData.preco_base_regra;

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      group_caracteristicas: groupDataCaracteristicas,
      group_regra_preco: groupDataPrecoBase,
      product_data: productData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await VariationsService.changeStatus(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(this.state.product_id)(
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
        `A variação, ${recordName} foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da variação", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await VariationsService.remove(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(this.state.product_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A variação, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma variação", err);
    }
  };

  tableConfig = () => {
    const caracteristicas = this.state.group_caracteristicas //[{chave:'peneira', label:'Peneira'}, {chave:'tratamento', label:'Tratamento'}]
    const colunasCaracteristicas = caracteristicas.map(item => {
      return (
        {
          title: item.label,
          dataIndex: `${item.chave}`,
          key: `${item.chave}`,
          sorter: (a, b) => this.ordenaTabela(a, b, `${item.chave}`)
        }
      )
    });

    const regra_preco = this.state.group_regra_preco //[{chave:'peneira', label:'Peneira'}, {chave:'tratamento', label:'Tratamento'}]
    const colunasRegraPreco = regra_preco.map(item => {
      console.log(item)
      return (
        {
          title: `${item.label} (%)`,
          dataIndex: `comissao_${item.chave}`,
          key: `comissao_${item.chave}`,
          sorter: (a, b) => this.ordenaTabela(a, b, `${item.chave}`)
        }
      )
    });

    return [
      ...colunasCaracteristicas,
      ...colunasRegraPreco,
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, record) => {
          const statusTxt = record.status ? "desativar" : "ativar";
          const statusBtn = record.status ? "unlock" : "lock";
          return (
            <Popconfirm
              title={`Tem certeza em ${statusTxt} a variação?`}
              onConfirm={e => this.changeStatus(record._id, !record.status)}
              okText="Sim"
              cancelText="Não">
              <Tooltip title={`${statusTxt.toUpperCase()} a variação`}>
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
                title={`Tem certeza em excluir a variação?`}
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
        const created = await VariationsService.create(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(this.state.product_id)(item);

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
        console.log("Erro interno ao adicionar uma variação", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await VariationsService.update(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(this.state.product_id)(item);
        const data = await VariationsService.list(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(this.state.product_id)();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar uma variação", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleCancel = (e) => {
    this.setState({
      visible: false
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  
  render() {
    return (
      <div>
        {this.props.match.params.comissiontable_id ? (
          <div>
            <SimpleBreadCrumb to={`/tabela-comissao/${this.state.comissiontable_id}/regras/${this.state.rule_id}/grupos-produto/${this.state.productgroup_id}/produtos`} history={this.props.history} />
            <Row gutter={24}> 
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Produto: ${this.state.product_data.nome || ''}`}</p>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Variação de Comissão"
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
                  />
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <div>
            <PainelHeader title="Variação de Comissão">
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
      </div>
    );
  }
}

export default withRouter(VariationComission);
