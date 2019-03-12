import React, { Component } from "react";
import { Button, Select } from "antd";

import * as QuotaService from "../../../services/quotas";
import SimpleTable from "../../common/SimpleTable";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import { currency, getNumber } from "../../common/utils";
import { simpleTableSearch } from "../../../lib/simpleTableSearch";

class Quota extends Component {
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
      quota_id: this.props.match.params.quota_id,
      grupoProdutos: []
    };
  }

  async initializeList(grupo = {}, aqp) {
    grupo = Object.keys(grupo).length ? JSON.parse(grupo) : {};

    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await QuotaService.getResume(this.state.quota_id)(grupo.id, {
      ...aqp
    });

    data.docs = data.docs.map(doc => {
      doc.total_cota = doc.cota_valor.reduce(
        (acc, obj) => acc + getNumber(obj),
        0
      );
      return doc;
    });

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      grupoProdutos: data.grupoProdutos,
      loadingData: false,
      pagination: {
        total: data.total
      },
      editMode: false,
      formData: {},
      savingForm: false,
      selectedGroup: grupo
    }));
  }

  async componentDidMount() {
    const data = await QuotaService.getResume(this.state.quota_id)();

    this.setState(prev => ({
      ...prev,
      grupoProdutos: data.grupoProdutos
    }));

    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await QuotaService.changeStatus(id, newStatus);

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
        `A cota, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da cota", err);
    }
  };

  removeRecord = async ({ _id, nome }) => {
    try {
      await QuotaService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A cota, ${nome}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma cota", err);
    }
  };

  tableConfigProdutos = () => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("produtos.nome"),
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
      ...simpleTableSearch(this)("produtos.nome_comercial"),
      render: text => text
    },
    {
      title: "UM",
      dataIndex: "cota_um",
      key: "cota_um",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => text
    },
    {
      title: "Valor Cota",
      dataIndex: "total_cota",
      key: "total_cota",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => currency()(text || 0)
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
      /* if (Object.keys(this.state.formData).length === 0)
        flashWithSuccess("Sem alterações para salvar", " "); */

      try {
        const created = await QuotaService.create(item);

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
        console.log("Erro interno ao adicionar uma cota", err);
      } finally {
        this.setState({ savingForm: false });
      }
    } else {
      try {
        const updated = await QuotaService.update(item);
        const data = await QuotaService.list();

        this.setState({
          openForm: false,
          editMode: false,
          visible: false,
          list: data.docs
        });

        flashWithSuccess();
      } catch (err) {
        if (err && err.response && err.response.data) parseErrors(err);
        console.log("Erro interno ao atualizar uma cota", err);
      } finally {
        this.setState({ savingForm: false });
      }
    }
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  handleTableChangeProdutos = (pagination, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList(JSON.stringify(this.state.selectedGroup), {
      page: pagination.current,
      limit: pagination.pageSize,
      ...this.state.tableSearch
    });
  };

  render() {
    return (
      <div>
        <SimpleBreadCrumb to={`/cotas`} history={this.props.history} />
        <PainelHeader title="Cotas - Resumo Geral" />

        <h4>Selecione um grupo de produtos para começar:</h4>

        <Select
          value={this.state.selectedGroup && this.state.selectedGroup.nome}
          style={{ width: "100%", marginBottom: 20 }}
          showAction={["focus", "click"]}
          showSearch
          placeholder="Selecione um grupo de produto..."
          onChange={e => this.initializeList(e)}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }>
          {this.state.grupoProdutos.length &&
            this.state.grupoProdutos.map(gp => (
              <Select.Option
                key={gp._id}
                value={JSON.stringify({ id: gp._id, nome: gp.nome })}>
                {gp.nome}
              </Select.Option>
            ))}
        </Select>

        <SimpleTable
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="_id"
          columns={this.tableConfigProdutos()}
          dataSource={this.state.list}
          onChange={this.handleTableChangeProdutos}
        />
      </div>
    );
  }
}

export default Quota;
