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
import * as QuotaSellersService from "../../../services/quotas.sellers";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import { simpleTableSearch } from "../../../lib/simpleTableSearch"

class ProductsQuota extends Component {
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
      salesman_data: {},
      productgroup_data: {},
      visible: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ProductsService.list(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(aqp);
    const vendedorData = await QuotaSellersService.get(this.state.quota_id)(this.state.saleman_id);
    const grupoData = vendedorData.grupo_produto.find(grupo => grupo.id == this.state.productgroup_id)

    console.log(vendedorData)

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      salesman_data: vendedorData,
      productgroup_data: grupoData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await ProductsService.changeStatus(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(
        id,
        newStatus
      );

      let recordName = "";

      let _list = this.state.list.map(item => {
        if (item.id === id) {
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
        `O produto, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do produto", err);
    }
  };

  removeRecord = async ({ id, nome }) => {
    const _id = id;
    try {
      await ProductsService.remove(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(_id);
      let _list = this.state.list.filter(record => record.id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O produto, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um produto", err);
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
      title: "Nome Comercial",
      dataIndex: "nome_comercial",
      key: "nome_comercial",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("nome_comercial"),
      render: text => text
    },
    {
      title: "Valor Cota",
      dataIndex: "cota_valor",
      key: "cota_valor",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "UM",
      dataIndex: "cota_um",
      key: "cota_um",
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
            title={`Tem certeza em ${statusTxt} o produto?`}
            onConfirm={e => this.changeStatus(record.id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} o produto`}>
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
              title={`Tem certeza em excluir o produto?`}
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
            <Tooltip title="Veja as variações da cota">
              <Button
                size="small"
                onClick={() =>
                  this.props.history.push(`/cotas/${this.state.quota_id}/vendedores/${this.state.saleman_id}/grupos-produto/${this.state.productgroup_id}/produtos/${record.id}/variacoes`) 
                }
              >
                <FontAwesomeIcon icon="chart-pie" size="lg" />
              </Button>
            </Tooltip>
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

    const obj = {...item, ...item.produto}
    delete obj.produto

    console.log(obj)

    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */
        
      try {
        const created = await ProductsService.create(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(obj);

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
        console.log("Erro interno ao adicionar um produto", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await ProductsService.update(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)(obj);
        const data = await ProductsService.list(this.state.quota_id)(this.state.saleman_id)(this.state.productgroup_id)();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar um produto ", err);
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
            <SimpleBreadCrumb to={`/cotas/${this.state.quota_id}/vendedores`} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Vendedor: ${this.state.salesman_data.nome || ''}`}</p>
                  <p>{`Grupo de Produto: ${this.state.productgroup_data.nome || ''}`}</p>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Produtos"
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
                    rowKey="id"
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
            <PainelHeader title="Produtos">
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
              rowKey="id"
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
          grupo_produto_id={this.state.productgroup_id}
        />
      </div>
    );
  }
}

export default withRouter(ProductsQuota);
