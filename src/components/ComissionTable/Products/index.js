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
import * as ComissionRulesService from "../../../services/comissiontable.rules";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"

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
      comissiontable_id: this.props.match.params.comissiontable_id || 0,
      rule_id: this.props.match.params.rule_id || 0,
      productgroup_id: this.props.match.params.productgroup_id || 0,
      rule_data: {},
      productgroup_data: {},
      visible: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ProductsService.list(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(aqp);
    const regraData = await ComissionRulesService.get(this.state.comissiontable_id)(this.state.rule_id);
    const grupoData = regraData.grupo_produto.find(grupo => grupo.id == this.state.productgroup_id)

    console.log(regraData)

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      rule_data: regraData,
      productgroup_data: grupoData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await ProductsService.changeStatus(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(
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
      await ProductsService.remove(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(_id);
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
      }
    },
    {
      title: "Nome Comercial",
      dataIndex: "nome_comercial",
      key: "nome_comercial",
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
            <Tooltip title="Veja as variações da comissão">
              <Button
                size="small"
                onClick={() =>
                  this.props.history.push(`/tabela-comissao/${this.state.comissiontable_id}/regras/${this.state.rule_id}/grupos-produto/${this.state.productgroup_id}/produtos/${record.id}/variacoes`) 
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
        const created = await ProductsService.create(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(obj);

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
        const updated = await ProductsService.update(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)(obj);
        const data = await ProductsService.list(this.state.comissiontable_id)(this.state.rule_id)(this.state.productgroup_id)();

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
  
  render() {
    return (
      <div>
        {this.props.match.params.comissiontable_id ? (
          <div>
            <SimpleBreadCrumb to={`/tabela-comissao/${this.state.comissiontable_id}/regras`} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Tipo de Venda: ${this.state.rule_data.tipo_venda || ''}`}</p>
                  <p>{`Uso Semente: ${this.state.rule_data.uso_semente || ''}`}</p>
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
