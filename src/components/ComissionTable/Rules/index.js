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

import * as ComissionRulesService from "../../../services/comissiontable.rules";
import * as ComissionsService from "../../../services/comissiontable";
import * as QuotasGroupService from "../../../services/quotas.productsgroup";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import ModalComission from '../DadosBasicos/modal'
import ModalFormGroup from "../../common/ModalProductGroup"

class Rules extends Component {
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
      comissiontable_data: {},
      visible: false,
      visibleComission: false,
      visibleGroup: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ComissionRulesService.list(this.state.comissiontable_id)(aqp);
    const comissiontableData = await ComissionsService.get(this.state.comissiontable_id);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      pagination: {
        total: data.total
      },
      loadingData: false,
      comissiontable_data: comissiontableData 
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await ComissionRulesService.changeStatus(this.state.comissiontable_id)(
        id,
        newStatus
      );

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `A regra, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da regra", err);
    }
  };

  changeStatusGrupo = async (id, newStatus, regra_id) => {
    try {
      await QuotasGroupService.changeStatus(this.state.comissiontable_id)(regra_id)(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(regra => {
        if(regra._id == regra_id){
          let _regraGP = regra.grupo_produto.map( gp => {
              if(gp.id == id){
                gp.status = newStatus
                recordName = gp.nome
              }
              return gp
            }
          )
          regra.grupo_produto = _regraGP
        }
        return regra
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

  removeRecord = async ({ _id }) => {
    try {
      await ComissionRulesService.remove(this.state.comissiontable_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A regra, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma regra", err);
    }
  };

  removeGroup = async ({ id, nome }, regra_id) => {
    try {
      await QuotasGroupService.remove(this.state.comissiontable_id)(regra_id)(id);
      let _list = this.state.list.map(regra => {
        if(regra._id == regra_id){
          regra.grupo_produto = [ ...regra.grupo_produto.filter(gp => gp.id == id)]
        }
        return regra
      })

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O grupo de produto, ${nome}, foi removido com sucesso da regra!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um grupo de produto da regra", err);
    }
  };

  tableConfig = () => [
    {
      title: "Tipo Venda",
      dataIndex: "tipo_venda",
      key: "tipo_venda",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Uso Semente",
      dataIndex: "uso_semente",
      key: "uso_semente",
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
            title={`Tem certeza em ${statusTxt} a regra?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip title={`${statusTxt.toUpperCase()} a regra`}>
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
              title={`Tem certeza em excluir a regra?`}
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
    console.log(tabela)
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
                    this.props.history.push(`/tabela-comissao/${this.state.comissiontable_id}/regras/${tabela._id}/grupos-produto/${record.id}/produtos`) 
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

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */

      try {
        const created = await ComissionRulesService.create(this.state.comissiontable_id)(item);

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
        console.log("Erro interno ao adicionar uma regra", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await ComissionRulesService.update(this.state.comissiontable_id)(item);
        const data = await ComissionRulesService.list(this.state.comissiontable_id)();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar uma regra ", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  showModalGroup = (regra_id) => {
    this.setState({
      visibleGroup: true,
      regra_id
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
        const created = await QuotasGroupService.create(this.state.comissiontable_id)(this.state.regra_id)(item.grupo_produto);
        this.setState(prev => {
          let _list = prev.list.map(regra => {
            if(regra.id == this.state.regra_id){
              regra.grupo_produto = [ ...regra.grupo_produto, created]
            }
            return regra
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

  showModalComission = (record) => {
    this.setState({
      visibleComission: true,
      record,
      editMode: !!record
    });
  }

  handleOkComission = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (this.state.editMode) {
      try {
        const updated = await ComissionsService.update(item);

        this.setState({
          openForm: false,
          editMode: false,
          visibleComission: false,
          comissiontable_data: updated
        });

        flashWithSuccess(
          "",
          `O cabeçalho da comissão foi atualizado com sucesso!`
        );
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar um cabeçalho de comissão ", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visibleComission: false,
      visibleGroup: false,
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
            <SimpleBreadCrumb to={"/tabela-comissao"} history={this.props.history} />
            <Row gutter={24}>
              <Col span={5}>
                <Card
                  bordered
                  style={{
                    boxShadow: "0px 8px 0px 0px #009d55 inset",
                    color: "#009d55"
                  }}>
                  <p>{`Tabela de Comissão: ${this.state.comissiontable_data.nome || ''}`}</p>
                  <Button
                    style={{ width: "100%" }}
                    onClick={() => { this.showModalComission(this.state.comissiontable_data)}}>
                    <Icon type="edit" /> Editar
                  </Button>
                </Card>
              </Col>
              <Col span={19}>
                <Card
                  title="Regra de Comissão"
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
            <PainelHeader title="Regra de Comissão">
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
        <ModalComission
          visible={this.state.visibleComission}
          onCancel={this.handleCancel}
          onCreate={this.handleOkComission}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.comissiontable_data}
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

export default withRouter(Rules);
