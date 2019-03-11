import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, Tooltip } from "antd";

import * as ZoneService from "services/zone";
import * as ZoneCitiesService from "services/zone.cities";
import SimpleTable from "common/SimpleTable";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { PainelHeader } from "common/PainelHeader";
import ModalForm from "./modal"
import ModalFormCidade from "./modalCidade"
import { simpleTableSearch } from "lib/simpleTableSearch"

class Zone extends Component {
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
      visibleCidade: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await ZoneService.list(aqp);

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
      await ZoneService.changeStatus(id, newStatus);

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
        `A região, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da região", err);
    }
  };

  changeStatusCidade = async (id, newStatus, zone_id) => {
    console.log(newStatus)
    try {
      await ZoneCitiesService.changeStatus(zone_id)(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(zoneTable => {
        if(zoneTable._id === zone_id){
          let _zoneTableGP = zoneTable.cidades.map( cidade => {
              if(cidade._id === id){
                cidade.status = newStatus
                recordName = cidade.nome
              }
              return cidade
            }
          )
          zoneTable.cidades = _zoneTableGP
        }
        return zoneTable
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `A cidade, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da cidade", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await ZoneService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A região, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma região", err);
    }
  };

  removeCidade = async ({ _id, nome }, zone_id) => {
    try {
      await ZoneCitiesService.remove(zone_id)(_id);
      let _list = this.state.list.map(zoneTable => {
        if(zoneTable._id == zone_id){
          zoneTable.cidades = [ ...zoneTable.cidades.filter(cid => cid._id != _id)]
        }
        return zoneTable
      })

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A cidade, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma cidade da região", err);
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
      title: "Ágio",
      dataIndex: "agio",
      key: "agio",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
    },
    {
      title: "Deságio",
      dataIndex: "desagio",
      key: "desagio",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("estado"),
    },
    {
      title: "Cidades",
      dataIndex: "cidades",
      key: "cidades",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: (cidades) => {
        return cidades.map( cidade => <pre key={cidade.nome}>{cidade.nome}</pre>)
      },
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
            title={`Tem certeza em ${statusTxt} a região ${record.nome}?`}
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
              title={`Tem certeza em excluir a região ${record.nome}?`}
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

            <Tooltip title="Adicionar Cidade">
              <Button
                size="small"
                onClick={() => this.showModalCidade(record) }
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
      { title: 'Cidades', dataIndex: 'nome', key: 'nome' },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, record) => {
          const statusTxt = record.status ? "desativar" : "ativar";
          const statusBtn = record.status ? "unlock" : "lock";
          return (
            <Popconfirm
              title={`Tem certeza em ${statusTxt} a cidade ${record.nome}?`}
              onConfirm={e => this.changeStatusCidade(record._id, !record.status, tabela._id)}
              okText="Sim"
              cancelText="Não"
            >
              <Tooltip title={`${statusTxt.toUpperCase()} a cidade`}>
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
                title={`Tem certeza em excluir a cidade ${record.nome} da região ${tabela.nome}?`}
                onConfirm={() => this.removeCidade(record, tabela._id)}
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

              <Tooltip title={`Veja os locais de entrega da cidade ${record.nome}`}>
                <Button
                  size="small"
                  onClick={() =>
                    this.props.history.push(`/regioes/${tabela._id}/cidade/${record._id}/locais-de-entrega`)
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
        rowKey="_id"
        spinning={this.state.loadingData}
        dataSource={tabela.cidades}
        pagination={false}
      />
    );
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

  showModal = (record) => {
    this.setState({
      visible: true,
      record,
      editMode: !!record
    });
  }

  showModalCidade = (record) => {
    this.setState({
      visibleCidade: true,
      record
    });
  }

  handleOk = async (item) => {

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */
      try {
        const created = await ZoneService.create(item);

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
        console.log("Erro interno ao adicionar uma região", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const regioes_update = Object.assign({}, item);
        delete regioes_update.cidades;
        delete regioes_update.estado;

        const updated = await ZoneService.update(regioes_update);
        const data = await ZoneService.list();

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

  handleOkCidade = async (item) => {

    this.setState({ savingForm: true });
    if (!this.state.editMode) {
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */
      try {
        const created = await ZoneCitiesService.create(item._id)(item.cidades);

        this.setState(prev => {
          let _list = prev.list.map(zoneTable => {
            if(zoneTable._id == item._id){
              zoneTable.cidades = [ ...zoneTable.cidades, created]
            }
            return zoneTable
          })

          return({
            openForm: false,
            editMode: false,
            visibleCidade: false,
            list: _list
          })
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao adicionar uma cidade na região", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  }

  handleCancel = (e) => {
    this.setState({
      visible: false,
      visibleCidade: false
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  render() {
    return (
      <div>
        <PainelHeader title="Regiões">
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

        <ModalFormCidade
          visible={this.state.visibleCidade}
          onCancel={this.handleCancel}
          onCreate={this.handleOkCidade}
          wrappedComponentRef={this.saveFormRef}
          record={this.state.record}
        />

      </div>
    );
  }
}

export default Zone;
