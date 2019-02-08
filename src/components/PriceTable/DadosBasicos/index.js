import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, Tooltip, Badge } from "antd";

import * as PriceTableService from "../../../services/pricetable";
import * as PTGroupService from "../../../services/pricetable.group";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import ModalForm from "./modal"
import ModalFormGroup from "../../common/ModalProductGroup"
import { formatDate } from '../../common/utils'

class PriceTable extends Component {
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
      visible: false,
      visibleGroup: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await PriceTableService.list(aqp);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      loadingData: false,
      pagination: {
        total: data.total
      },
      editMode: false,
      formData: {},
      savingForm: false
    }));
  }

  async componentDidMount() {
    await this.initializeList();
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

  changeStatus = async (id, newStatus) => {
    try {
      await PriceTableService.changeStatus(id, newStatus);

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
        `A tabela de preço, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da tabela de preço", err);
    }
  };

  changeStatusGrupo = async (id, newStatus, price_table_id) => {
    console.log(newStatus)
    try {
      await PTGroupService.changeStatus(price_table_id)(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(priceTable => {
        if(priceTable._id == price_table_id){
          let _priceTableGP = priceTable.grupo_produto.map( gp => {
              if(gp.id == id){
                gp.status = newStatus
                recordName = gp.nome
              }
              return gp
            }
          )
          priceTable.grupo_produto = _priceTableGP
        }
        return priceTable
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `O grupo de produto, ${recordName}, foi ${
          newStatus ? "ativado" : "bloqueado"
        } da tabela de preço com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status do grupo de produto", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await PriceTableService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A tabela de preço, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma tabela de preço", err);
    }
  };

  removeGroup = async ({ id, nome }, price_table_id) => {
    try {
      await PTGroupService.remove(price_table_id)(id);
      let _list = this.state.list.map(priceTable => {
        if(priceTable._id == price_table_id){
          priceTable.grupo_produto = [ ...priceTable.grupo_produto.filter(gp => gp.id != id)]
        }
        return priceTable
      })

      this.setState({
        list: _list
      });

      flashWithSuccess("", `O grupo de produto, ${nome}, foi removida com sucesso da tabela de preço!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um grupo de produto da tabela de preço", err);
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
      title: "Safra",
      dataIndex: "safra",
      key: "safra",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: (text) => text.descricao
    },
    {
      title: "Data Base",
      dataIndex: "data_base",
      key: "data_base",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: (text) => text ? formatDate(text) : ''
    },
    {
      title: "Moeda",
      dataIndex: "moeda",
      key: "moeda",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    /* {
      title: "Validade De",
      dataIndex: "data_validade_de",
      key: "data_validade_de",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: (text) => text ? formatDate(text) : ''
    },
    {
      title: "Validade Até",
      dataIndex: "data_validade_ate",
      key: "data_validade_ate",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: (text) => text ? formatDate(text) : ''
    }, */
    {
      title: "Versão",
      dataIndex: "versao",
      key: "versao",
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
            title={`Tem certeza em ${statusTxt} a tabela de preço?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title={`${statusTxt.toUpperCase()} a tabela de preço`}>
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
              onClick={() => this.showModal(record) }
            >
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />

            <Popconfirm
              title={`Tem certeza em excluir a tabela de preço?`}
              onConfirm={() => this.removeRecord(record)}
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

            <Tooltip title="Adicionar Grupo de Produto">
              <Button
                size="small"
                onClick={() => this.showModalGroup(record._id) }
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
              onConfirm={e => this.changeStatusGrupo(record.id, !record.status, tabela._id)}
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
                title={`Tem certeza em excluir o grupo de produto da tabela de preço?`}
                onConfirm={() => this.removeGroup(record, tabela._id)}
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
  
              <Tooltip title="Veja os produtos da tabela de preço">
                <Button
                  size="small"
                  onClick={() =>
                    this.props.history.push(`/tabela-preco/${tabela._id}/grupo-produto/${record.id}/produtos`) 
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
        rowKey="id"
        spinning={this.state.loadingData}
        dataSource={tabela.grupo_produto}
        pagination={false}
      />
    );
  };

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

  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      editMode: !!record
    });
  }

  showModalGroup = (price_table_id) => {
    this.setState({
      visibleGroup: true,
      price_table_id
    });
  }

  handleOk = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */
      try {
        const created = await PriceTableService.create(item);
        
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
        console.log("Erro interno ao adicionar uma tabela de preço", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const tabela_updade = Object.assign({}, item);
        delete tabela_updade.grupo_produto;
        
        const updated = await PriceTableService.update(tabela_updade);
        const data = await PriceTableService.list();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar uma tabela de preço", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleOkGroup = async (item) => {
    await this.getDatabase();
    await this.setStatus();

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */
      try {
        const created = await PTGroupService.create(this.state.price_table_id)(item.grupo_produto);
        
        this.setState(prev => {
          let _list = prev.list.map(priceTable => {
            if(priceTable._id == this.state.price_table_id){
              priceTable.grupo_produto = [ ...priceTable.grupo_produto, created]
            }
            return priceTable
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

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visibleGroup: false
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  render() {
    return (
      <div>
        <PainelHeader title="Tabela de Preço">
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.showModal() } 
          >
            Adicionar
          </Button>
        </PainelHeader>
        <SimpleTable
          className="components-table-demo-nested"
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="_id"
          columns={this.tableConfig()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
          expandedRowRender={this.expandedRowRender}
        />
        <ModalForm
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
        />

        <ModalFormGroup
          visible={this.state.visibleGroup}
          onCancel={this.handleCancel}
          onCreate={this.handleOkGroup}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
        />

      </div>
    );
  }
}

export default PriceTable;
