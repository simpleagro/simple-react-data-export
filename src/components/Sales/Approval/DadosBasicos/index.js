import React, { Component } from "react";
import { Divider, Button, Badge, Icon, Popconfirm, Tooltip } from "antd";
import moment from "moment";
import { connect } from "react-redux";

import { simpleTableSearch } from "lib/simpleTableSearch";
import * as OrderService from "services/orders";
import SimpleTable from "common/SimpleTable";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { PainelHeader } from "common/PainelHeader";
import ModalPedido from "./modal"
import * as GroupsFeaturesService from "../../../../services/productgroups.mobile";

class Approval extends Component {
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
      visible: false
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await OrderService.list({
      ...aqp, 
      /* fields: "-itens", */ sort: "-numero", status_pedido: "Aguardando Aprovação"
    });

    const groupData = await GroupsFeaturesService.list({fields: "-produtos", limit: "-1" });

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      loadingData: false,
      pagination: {
        total: data.total
      },
      groupData: groupData.docs
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  tableConfig = () => [
    {
      title: "Número",
      dataIndex: "numero",
      key: "numero",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("numero")
    },
    {
      title: "Cliente",
      dataIndex: "cliente.nome",
      key: "cliente.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("cliente.nome")
    },
    {
      title: "Propriedade",
      dataIndex: "propriedade.nome",
      key: "propriedade.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: (text, record) => `${text} / IE: ${record.propriedade.ie}`,
      ...simpleTableSearch(this)("propriedade.nome")
    },
    {
      title: "Safra",
      dataIndex: "safra.descricao",
      key: "safra.descricao",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("safra.descricao")
    },
    {
      title: "Data do Pedido",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => (text ? moment(text).format("DD/MM/YYYY") : ""),
      ...simpleTableSearch(this)("created_at", {
        tooltip: { title: "Utilize dd/mm/yyyy" },
        useRegex: false
      })
    },
    {
      title: "Status do Pedido",
      dataIndex: "status_pedido",
      key: "status_pedido",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("status_pedido")
    },
    {
      title: "Ações",
      width: 100,
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Tooltip title="Visualizar">
              <Button
                size="small"
                onClick={() =>
                  this.showModal(record)
                }>
                <Icon type="eye" style={{ fontSize: "16px" }} />
              </Button>
            </Tooltip>
          </span>
        );
      }
    }
  ];

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
      record
    });
  }

  handleCancel = (e) => {
    this.setState({
      visible: false
    });
  }

  handleApproval = async (item, status) => {
    await this.getDatabase();
    //await this.setStatus();
    //this.setState({ savingForm: true });
    try {
      const pedido = Object.assign({}, {_id: item._id, status_pedido: status });
      //console.log(pedido)
      const updated = await OrderService.update(pedido);
      const data = await OrderService.list({
        sort: "-numero", status_pedido: "Aguardando Aprovação"
      });

      this.setState({
        //openForm: false,
        //editMode: false,
        visible: false,
        list: data.docs
      });

      flashWithSuccess(`Pedido ${status} com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      //console.log("Erro interno ao aprovar um pedido", err);
    } /* finally {
      this.setState({ savingForm: false });
    } */
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

  render() {
    return (
      <div>
        <PainelHeader title="Aprovação de Pedidos"/>
        <SimpleTable
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="_id"
          columns={this.tableConfig()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
        />
        <ModalPedido
          visible={this.state.visible}
          onCancel={this.handleCancel}
          wrappedComponentRef={this.saveFormRef}
          pedido={this.state.record}
          groupData={this.state.groupData}
          onApproval={this.handleApproval}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  return {
    userRules: Object.keys(painelState.userData.rules).length > 0 ? painelState.userData.rules : []
  };
};

export default connect(mapStateToProps)(Approval);
