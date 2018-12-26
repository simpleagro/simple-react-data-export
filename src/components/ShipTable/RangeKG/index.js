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
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

import * as RangeKMService from "../../../services/shiptable.rangekm";
import * as RangeKGService from "../../../services/shiptable.rangekg";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import ModalKMForm from '../RangeKM/modal'

class RangeKG extends Component {
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
      shiptable_id: this.props.ship_table || this.props.match.params.shiptable_id || 0,
      rangekm_id: this.props.range_km || this.props.match.params.rangekm_id || 0,
      rangekm_data: {},
      visible: false,
      visibleKM: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await RangeKGService.list(this.state.shiptable_id)(this.state.rangekm_id)(aqp);
    const rangekmData = await RangeKMService.get(this.state.shiptable_id)(this.state.rangekm_id);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      rangekm_data: rangekmData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await RangeKGService.changeStatus(this.state.shiptable_id)(this.state.rangekm_id)(
        id,
        newStatus
      );

      let recordName = "";

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
        `O range, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do range", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await RangeKGService.remove(this.state.shiptable_id)(this.state.rangekm_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O range, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um range", err);
    }
  };

  tableConfig = () => [
    {
      title: "KG de",
      dataIndex: "pesokg_de",
      key: "pesokg_de",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return a.pesokg_de-b.pesokg_de;
        else return b.pesokg_de-a.pesokg_de;
      }
    },
    {
      title: "KG até",
      dataIndex: "pesokg_ate",
      key: "pesokg_ate"
    },
    {
      title: "Preço",
      dataIndex: "preco",
      key: "preco"
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
            title={`Tem certeza em ${statusTxt} o range?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} o range`}>
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
              title={`Tem certeza em excluir o range?`}
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

  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      editMode: !!record
    });
  }

  showModalKM = (record) => {
    this.setState({
      visibleKM: true,
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
        const created = await RangeKGService.create(this.state.shiptable_id)(this.state.rangekm_id)(item);

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
        console.log("Erro interno ao adicionar um range de KG", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await RangeKGService.update(this.state.shiptable_id)(this.state.rangekm_id)(item);
        const data = await RangeKGService.list(this.state.shiptable_id)(this.state.rangekm_id)();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar um range de KG ", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleOkKM = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (this.state.editMode) {
      try {
        const updated = await RangeKMService.update(this.state.shiptable_id)(item);

        this.setState({
          openForm: false,
          editMode: false,
          visibleKM: false,
          rangekm_data: updated
        });

        flashWithSuccess(
          "",
          `O range de KM foi atualizado com sucesso!`
        );
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar um range de km ", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visibleKM: false
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  
  render() {
    return (
      <div>
        {this.props.match.params.shiptable_id ? (
          <div>
            <SimpleBreadCrumb to={`/tabela-frete/${this.state.shiptable_id}/range-km`} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`KM de: ${this.state.rangekm_data.km_de || ''}`}</p>
                  <p>{`KM até: ${this.state.rangekm_data.km_ate || ''}`}</p>
                  <Button
                    style={{ width: "100%" }}
                    onClick={() => { this.showModalKM(this.state.rangekm_data) }}>
                    <Icon type="edit" /> Editar
                  </Button>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Range KG"
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
            <PainelHeader title="Range KG">
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
        />
        <ModalKMForm
          visible={this.state.visibleKM}
          onCancel={this.handleCancel}
          onCreate={this.handleOkKM}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.rangekm_data}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  return {
    ship_table: painelState.userData.ship_table,
    range_km: painelState.userData.range_km
  };
};

export default withRouter(connect(mapStateToProps)(RangeKG));
