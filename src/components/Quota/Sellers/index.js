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

import * as QuotasSellersService from "../../../services/quotas.sellers";
import * as QuotasService from "../../../services/quotas";
import * as QuotasGroupService from "../../../services/quotas.productsgroup";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import ModalVendedor from '../DadosBasicos/modal'
import ModalFormGroup from "../../common/ModalProductGroup"

class Sellers extends Component {
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
      quota_data: {},
      visible: false,
      visibleVendedor: false,
      visibleGroup: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await QuotasSellersService.list(this.state.quota_id)(aqp);
    const quotaData = await QuotasService.get(this.state.quota_id);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      quota_data: quotaData
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await QuotasSellersService.changeStatus(this.state.quota_id)(
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
        `O vendedor, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do vendedor", err);
    }
  };

  changeStatusGrupo = async (id, newStatus, vendedor_id) => {
    try {
      await QuotasGroupService.changeStatus(this.state.quota_id)(vendedor_id)(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(vendedor => {
        if(vendedor.id == vendedor_id){
          let _vendedorGP = vendedor.grupo_produto.map( gp => {
              if(gp.id == id){
                gp.status = newStatus
                recordName = gp.nome
              }
              return gp
            }
          )
          vendedor.grupo_produto = _vendedorGP
        }
        return vendedor
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `O grupo de produto, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } da cota com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do grupo de produto", err);
    }
  };

  removeRecord = async ({ id, nome }) => {
    try {
      await QuotasSellersService.remove(this.state.quota_id)(id);
      let _list = this.state.list.filter(record => record.id !== id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O vendedor, ${nome}, foi removido com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um vendedor", err);
    }
  };

  removeGroup = async ({ id, nome }, vendedor_id) => {
    try {
      await QuotasGroupService.remove(this.state.quota_id)(vendedor_id)(id);
      let _list = this.state.list.map(vendedor => {
        if(vendedor.id == vendedor_id){
          vendedor.grupo_produto = [ ...vendedor.grupo_produto.filter(gp => gp.id != id)]
        }
        return vendedor
      })

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O grupo de produto, ${nome}, foi removido com sucesso do vendedor!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um grupo de produto do vendedor", err);
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        const statusTxt = record.status ? "desativar" : "ativar";
        const statusBtn = record.status ? "unlock" : "lock";
        return (
          <Popconfirm
            title={`Tem certeza em ${statusTxt} o vendedor?`}
            onConfirm={e => this.changeStatus(record.id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} o vendedor`}>
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
              title={`Tem certeza em excluir o vendedor?`}
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

            <Tooltip title="Adicionar Grupo de Produto">
              <Button
                size="small"
                onClick={() => this.showModalGroup(record.id)} 
              >
                <FontAwesomeIcon icon="plus" size="lg" />
              </Button>
            </Tooltip>
          </span>
        );
      }
    }
  ];

  expandedRowRender = (tabela) => {
    const columns = [
      { title: 'Grupo de Produto', dataIndex: 'nome', key: 'nome' },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, record) => {
          const statusTxt = record.status ? "desativar" : "ativar";
          const statusBtn = record.status ? "unlock" : "lock";
          return (
            <Popconfirm
              title={`Tem certeza em ${statusTxt} o grupo de produto?`}
              onConfirm={e => this.changeStatusGrupo(record.id, !record.status, tabela.id)}
              okText="Sim"
              cancelText="Não"
            >
              <Tooltip title={`${statusTxt.toUpperCase()} o grupo de produto`}>
                <Button size="small">
                  <FontAwesomeIcon icon={statusBtn} size="lg" />
                </Button>
              </Tooltip>
            </Popconfirm>
          );
        }
      },
      {
        title: 'Ação',
        dataIndex: 'action',
        render: (text, record) => {
          return (
            <span>
              <Popconfirm
                title={`Tem certeza em excluir o grupo de produto?`}
                onConfirm={() => this.removeGroup(record, tabela.id)}
                okText="Sim"
                cancelText="Não"
              >
                <Button size="small">
                  <Icon type="delete" style={{ fontSize: "16px" }} />
                </Button>
              </Popconfirm>
              <Divider
                style={{ fontSize: "10px", padding: 0, margin: 2 }}
                type="vertical"
              /> 
  
              <Tooltip title="Veja os produtos do grupo de produto">
                <Button
                  size="small"
                  onClick={() =>
                    this.props.history.push(`/cotas/${this.state.quota_id}/vendedores/${tabela.id}/grupos-produto/${record.id}/produtos`) 
                  }
                >
                  <FontAwesomeIcon icon="clipboard-list" size="lg" />
                </Button>
              </Tooltip>
  
            </span>
          );
        }
      },
    ];

    return (
      <SimpleTable
        columns={columns}
        spinning={this.state.loadingData}
        dataSource={tabela.grupo_produto}
        pagination={false}
        rowKey={'id'}
      />
    );
  };

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

    const obj = {...item.vendedor, ...item}
    delete obj.vendedor

    console.log(obj)

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */

      try {
        const created = await QuotasSellersService.create(this.state.quota_id)(obj);

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
        console.log("Erro interno ao adicionar um vendedor", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await QuotasSellersService.update(this.state.quota_id)(obj);
        const data = await QuotasSellersService.list(this.state.quota_id)();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar um vendedor ", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  showModalGroup = (vendedor_id) => {
    this.setState({
      visibleGroup: true,
      vendedor_id
    });
  }

  handleOkGroup = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */
      try {
        const created = await QuotasGroupService.create(this.state.quota_id)(this.state.vendedor_id)(item.grupo_produto);
        this.setState(prev => {
          let _list = prev.list.map(vendedor => {
            if(vendedor.id == this.state.vendedor_id){
              vendedor.grupo_produto = [ ...vendedor.grupo_produto, created]
            }
            return vendedor
          })

          return({
            openForm: false,
            editMode: false,
            visibleGroup: false,
            list: _list
          })
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao adicionar um grupo de produto na tabela de preço", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } 
  }

  showModalVendedor = (record) => {
    this.setState({
      visibleVendedor: true,
      record,
      editMode: !!record
    });
  }

  handleOkVendedor = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (this.state.editMode) {
      try {
        const updated = await QuotasService.update(item);

        this.setState({
          openForm: false,
          editMode: false,
          visibleVendedor: false,
          quota_data: updated
        });

        flashWithSuccess(
          "",
          `O cabeçalho da cota foi atualizado com sucesso!`
        );
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar um cabeçalho de cota ", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visibleVendedor: false,
      visibleGroup: false,
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }
  
  render() {
    return (
      <div>
        {this.props.match.params.quota_id ? (
          <div>
            <SimpleBreadCrumb to={"/cotas"} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Cota: ${this.state.quota_data.nome || ''}`}</p>
                  <Button
                    style={{ width: "100%" }}
                    onClick={() => { this.showModalVendedor(this.state.quota_data)}}>
                    <Icon type="edit" /> Editar
                  </Button>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Vendedores"
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
                    onChange={this.handleTableChange}
                    dataSource={this.state.list}
                    expandedRowRender={this.expandedRowRender}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <div>
            <PainelHeader title="Vendedores">
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
              expandedRowRender={this.expandedRowRender}
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
        <ModalVendedor
          visible={this.state.visibleVendedor}
          onCancel={this.handleCancel}
          onCreate={this.handleOkVendedor}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.quota_data}
        />
        <ModalFormGroup
          visible={this.state.visibleGroup}
          onCancel={this.handleCancel}
          onCreate={this.handleOkGroup}
          wrappedComponentRef={this.saveFormRef}
        />
      </div>
    );
  }
}

export default withRouter(Sellers);
