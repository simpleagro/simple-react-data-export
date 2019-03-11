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

import * as ZoneLocationsService from "services/zone.locations";
import * as ZoneServices from "services/zone";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import ModalForm from "./modal";
import ModalZone from "../DadosBasicos/modal";
import { simpleTableSearch } from "../../../lib/simpleTableSearch";
import { SimpleLazyLoader } from "common/SimpleLazyLoader";

class ZoneLocations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      loadingForm: true,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      },
      zone_id: this.props.match.params.zone_id || 0,
      city_id: this.props.match.params.cidade_id || 0,
      zoneData: {},
      visible: false,
      visibleZone: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ZoneLocationsService.list(this.state.zone_id)(
      this.state.city_id
    )(aqp);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false
    }));
  }

  async componentDidMount() {
    try {
      const zoneData = await ZoneServices.get(
        this.state.zone_id
      )();
      this.setState(prev => ({
        ...prev,
        zoneData
      }));
      await this.initializeList();
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
    }
    finally {
      this.setState(prev => ({
        ...prev,
        loadingForm: false
      }));
    }

  }

  changeStatus = async (id, newStatus) => {
    try {
      await ZoneLocationsService.changeStatus(this.state.zone_id)(
        this.state.city_id
      )(id, newStatus);

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
        `O local de entrega, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do local de entrega", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {

    try {
      await ZoneLocationsService.remove(this.state.zone_id)(
        this.state.city_id
      )(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O local de entrega, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um local de entrega", err);
    }
  };

  tableConfig = () => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("nome"),
      render: text => text
    },
    {
      title: "Transbordo",
      dataIndex: "transbordo",
      key: "transbordo",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("transbordo"),
      render: text => text
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
            title={`Tem certeza em ${statusTxt} o local de entrega?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} o local de entrega`}>
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
              title={`Tem certeza em excluir o local de entrega?`}
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

  showModal = record => {
    this.setState({
      visible: true,
      record,
      editMode: !!record
    });
  };

  handleOk = async item => {

    this.setState({ savingForm: true });

    if (!this.state.editMode) {
      try {
        const created = await ZoneLocationsService.create(this.state.zone_id)(
          this.state.city_id
        )(item);

        this.setState(prev => {
          if (prev.list.length > 0) {
            return {
              openForm: false,
              editMode: false,
              visible: false,
              list: [...prev.list, created]
            };
          }
          return {
            openForm: false,
            editMode: false,
            visible: false,
            list: [created]
          };
        });
        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao adicionar um produto", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await ZoneLocationsService.update(this.state.zone_id)(
          this.state.city_id
        )(item);
        const data = await ZoneLocationsService.list(this.state.zone_id)(
          this.state.city_id
        )();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar um local de entrega ", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  };

  showModalZone = record => {
    this.setState({
      visibleZone: true,
      record,
      editMode: !!record
    });
  };

  handleOkZone = async item => {

    this.setState({ savingForm: true });
    if (this.state.editMode) {
      try {
        const updated = await ZoneServices.update(item);

        this.setState({
          openForm: false,
          editMode: false,
          visibleZone: false,
          zoneData: updated
        });

        flashWithSuccess(
          "",
          `A região ${item.nome} foi atualizado com sucesso!`
        );
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log(`Erro interno ao atualizar a região ${item.nome} `, err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  };

  handleCancel = e => {
    this.setState({
      visible: false,
      visibleZone: false
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

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
      <SimpleLazyLoader isLoading={this.state.loadingForm}>
      <div>

          <div>
            <SimpleBreadCrumb
              to={"/regioes"}
              history={this.props.history}
            />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Região: ${this.state.zoneData.nome ||
                    ""}`}</p>
                  <Button
                  loading={this.state.savingForm}
                    style={{ width: "100%" }}
                    onClick={() => {
                      this.showModalZone(this.state.zoneData);
                    }}>
                    <Icon type="edit" /> Editar
                  </Button>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Locais de Entrega"
                  bordered={false}
                  extra={
                    <Button
                      type="primary"
                      icon="plus"
                      onClick={() => this.showModal()}>
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

        <ModalForm
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
          grupo_produto_id={this.state.productgroup_id}
        />
        <ModalZone
          visible={this.state.visibleZone}
          onCancel={this.handleCancel}
          onCreate={this.handleOkZone}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.zoneData}
        />
      </div>
      </SimpleLazyLoader>
    );
  }
}

export default withRouter(ZoneLocations);
