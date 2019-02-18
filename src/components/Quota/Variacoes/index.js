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

import * as ProductsService from "../../../services/quotas.products";
import * as VariationsService from "../../../services/quotas.variations";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import * as GroupsFeaturesService from "../../../services/productgroups.features";
import { simpleTableSearch } from "../../../lib/simpleTableSearch"

class VariacaoCota extends Component {
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
      quota_id: this.props.match.params.quota_id || 0,
      saleman_id: this.props.match.params.saleman_id || 0,
      productgroup_id: this.props.match.params.productgroup_id || 0,
      product_id: this.props.match.params.product_id || 0,
      product_data: {},
      visible: false,
      group_caracteristicas:[]
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await VariationsService.list(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(this.state.product_id)(aqp);
    const groupDataCaracteristicas = await GroupsFeaturesService.list(this.state.productgroup_id)();
    const productData = await ProductsService.get(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(this.state.product_id);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      group_caracteristicas: groupDataCaracteristicas.docs,
      product_data: productData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await VariationsService.changeStatus(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(this.state.product_id)(
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
      await VariationsService.remove(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(this.state.product_id)(_id);
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
          sorter: (a, b) => this.ordenaTabela(a, b, `${item.chave}`),
          ...simpleTableSearch(this)(`${item.chave}`),
          render: text => text
        }
      )
    });

    return [
      ...colunasCaracteristicas,
      {
        title: "Valor Cota",
        dataIndex: "cota_valor",
        key: "cota_valor",
        sorter: (a, b, sorter) => {
          if (sorter === "ascendent") return -1;
          else return 1;
        }
      },
      /* {
        title: "UM",
        dataIndex: "cota_um",
        key: "cota_um",
        sorter: (a, b, sorter) => {
          if (sorter === "ascendent") return -1;
          else return 1;
        }
      }, */
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
        const created = await VariationsService.create(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(this.state.product_id)(item);

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
        const updated = await VariationsService.update(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(this.state.product_id)(item);
        const data = await VariationsService.list(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(this.state.product_id)();

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
        {this.props.match.params.quota_id ? (
          <div>
            <SimpleBreadCrumb to={`/cotas/${this.state.quota_id}/vendedores/${this.state.saleman_id}/grupos-produto/${this.state.productgroup_id}/produtos`} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Produto: ${this.state.product_data.nome || ''}`}</p>
                  <p>{`Cota: ${this.state.product_data.cota_valor || ''} ${this.state.product_data.cota_um || ''}`}</p>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Variação de Cota"
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
            <PainelHeader title="Variação de Cota">
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
        />
      </div>
    );
  }
}

export default withRouter(VariacaoCota);
