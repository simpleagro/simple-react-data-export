import React, { Component } from "react";
import debounce from "lodash/debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Divider,
  Button,
  Icon,
  Popconfirm,
  Tooltip,
  Drawer,
  Col,
  Row,
  Layout,
  Input
} from "antd";

import * as CustomerWalletService from "../../services/customerswallet";
import SimpleTable from "../common/SimpleTable";
import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";

const pStyle = {
  fontSize: 16,
  color: "rgba(0,0,0,0.85)",
  lineHeight: "24px",
  display: "block",
  marginBottom: 16
};

const Search = Input.Search;

const DescriptionItem = ({ title, content }) => (
  <div
    style={{
      fontSize: 14,
      lineHeight: "22px",
      marginBottom: 7,
      color: "rgba(0,0,0,0.65)"
    }}>
    <p
      style={{
        marginRight: 8,
        display: "inline-block",
        color: "#333"
      }}>
      {title}:
    </p>
    {content}
  </div>
);

class CustomersWallet extends Component {
  constructor(props) {
    super(props);
    this.filterInfoClients = debounce(this.filterInfoClients, 300);
    this.state = {
      list: [],
      loadingData: true,
      walletID: null,
      clientInfoIsVisible: false,
      info: {},
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(aqp = { fields: "nome, consultor_id, status" }) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    try {
      const data = await CustomerWalletService.list(aqp);

      this.setState(prev => ({
        ...prev,
        list: data.docs,
        loadingData: false,
        pagination: {
          total: data.total
        }
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
    } finally {
      this.setState({ loadingData: false });
    }
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await CustomerWalletService.changeStatus(id, newStatus);

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
        `A carteira de cliente, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da carteira de cliente", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await CustomerWalletService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A carteira, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma carteira", err);
    }
  };

  closeMoreInfo = () => {
    this.setState({ clientInfoIsVisible: false });
  };

  showMoreInfo = async walletID => {
    const info = await CustomerWalletService.moreInfo(walletID);

    this.setState(prev => ({
      ...prev,
      clientInfoIsVisible: true,
      info
    }));
  };

  filterInfoClients = val => {
    if (
      !this.state.oldInfoClients ||
      Object.keys(this.state.oldInfoClients).length <= 0
    )
      this.setState(prev => ({
        ...prev,
        oldInfoClients: this.state.info
      }));

    if (val === "")
      this.setState(prev => ({
        ...prev,
        oldInfoClients: {},
        info: this.state.oldInfoClients
      }));
    else
      this.setState(prev => ({
        ...prev,
        info: {
          ...prev.info,
          clientes: this.state.oldInfoClients.clientes.filter(c =>
            c.nome.toLowerCase().includes(val.toLowerCase())
          )
        }
      }));
  };

  tableConfig = () => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Consultor",
      dataIndex: "consultor_id.nome",
      key: "consultor_id.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
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
            title={`Tem certeza em ${statusTxt} esta carteira?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} esta carteira`}>
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
            <Button
              size="small"
              onClick={() => {
                this.props.history.push(
                  `/carteiras-de-clientes/${record._id}/edit`
                );
              }}>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir esta carteira?`}
              onConfirm={() => this.removeRecord(record)}
              okText="Sim"
              cancelText="Não">
              <Button size="small">
                <Icon type="delete" style={{ fontSize: "16px" }} />
              </Button>
            </Popconfirm>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Tooltip title="Informações estratégicas dos clientes da carteira">
              <Button
                size="small"
                onClick={() => this.showMoreInfo(record._id)}>
                <FontAwesomeIcon icon="user" size="lg" />
              </Button>
            </Tooltip>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
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
      limit: pagination.pageSize
    });
  };

  render() {
    return (
      <div>
        <PainelHeader title="Carteiras de Clientes">
          <Button
            type="primary"
            icon="plus"
            onClick={() => {
              this.props.history.push(`/carteiras-de-clientes/new`);
            }}>
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
        <Drawer
          width="30vw"
          placement="right"
          closable={true}
          onClose={this.closeMoreInfo}
          visible={this.state.clientInfoIsVisible}
          style={{ padding: 0 }}
          className="white-close">
          <Layout style={{ background: "#fff" }}>
            <Layout.Header
              style={{
                color: "#fff",
                paddingLeft: 20
              }}>
              <Row type="flex" justify="space-around" align="middle">
                <Col span={12}>
                  Informações Extras Da Carteira - {this.state.info.nome}
                </Col>
                <Col span={12}>
                  <Search
                    placeholder="Pesquisar por cliente"
                    onChange={e => this.filterInfoClients(e.target.value)}
                  />
                </Col>
              </Row>
            </Layout.Header>
            <Layout.Content
              style={{ padding: "0 20px", marginTop: 35, background: "#fff" }}>
              <h2
                style={{
                  textAlign: "center",
                  border: "1px solid #c0c0c0",
                  borderRadius: 10,
                  padding: 5,
                  marginBottom: 40
                }}>
                Total em carteira:{" "}
                {`${this.state.info.totalAreaCarteira || 0} ha`}
              </h2>

              {this.state.info &&
                this.state.info.clientes &&
                this.state.info.clientes.length > 0 &&
                this.state.info.clientes.map(c => (
                  <div key={c._id}>
                    <Row>
                      <Col span={12}>
                        <DescriptionItem title="Nome" content={c.nome} />{" "}
                      </Col>
                      <Col span={12}>
                        <Button
                          block
                          onClick={() =>
                            this.props.history.push(`/clientes/${c._id}/edit`, {
                              returnTo: this.props.history.location
                            })
                          }>
                          Mais infos do cliente
                        </Button>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <DescriptionItem
                          title="Total em área"
                          content={`${c.totalAreaPropriedades || 0} ha`}
                        />{" "}
                      </Col>
                    </Row>
                    <Divider />
                  </div>
                ))}
            </Layout.Content>
          </Layout>
        </Drawer>
      </div>
    );
  }
}

export default CustomersWallet;
