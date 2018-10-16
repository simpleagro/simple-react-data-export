import React, { Component } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Divider, Button, Icon, Popconfirm, message, Tooltip } from "antd";

import * as SeasonService from "../../services/visits";
import SimpleTable from "../common/SimpleTable";
import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";

class Seasons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await SeasonService.list(aqp);

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      loadingData: false,
      pagination: {
        total: data.total
      }
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  changeStatus = async (id, newStatus) => {
    try {
      await SeasonService.changeStatus(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
          recordName = item.descricao;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `A safra, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da safra", err);
    }
  };

  removeRecord = async ({ _id, descricao }) => {
    try {
      await SeasonService.remove(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A safra, ${descricao}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover um safra", err);
    }
  };

  tableConfig = () => [
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      filters: [
        {
          text: "Comercial",
          value: "COMERCIAL"
        },
        {
          text: "Monitoramento",
          value: "MONITORAMENTO"
        }
      ],
      onFilter: (value, record) => record.tipo === value
    },
    {
      title: "Safra",
      dataIndex: "safra",
      key: "safra",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      filters: [
        {
          text: "2018",
          value: "2018"
        },
        {
          text: "2017",
          value: "2017"
        }
      ],
      onFilter: (value, record) => record.safra === value
    },
    {
      title: "Cliente",
      dataIndex: "cliente.nome",
      key: "cliente.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
    },
    {
      title: "Data de Conclusão",
      dataIndex: "visitou_em",
      key: "visitou_em",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      render: text => moment(text).format("DD/MM/YYYY")
    },
    {
      title: "Consultor",
      dataIndex: "consultor.nome",
      key: "consultor.nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      filters: [
        {
          text: "Gerente SimpleAgro",
          value: "Gerente SimpleAgro"
        },
      ],
      onFilter: (value, record) => record.consultor.nome === value
    },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (text, record) => {
    //     const statusTxt = record.status ? "desativar" : "ativar";
    //     const statusBtn = record.status ? "unlock" : "lock";
    //     return (
    //       <Popconfirm
    //         title={`Tem certeza em ${statusTxt} a safra?`}
    //         onConfirm={e => this.changeStatus(record._id, !record.status)}
    //         okText="Sim"
    //         cancelText="Não"
    //       >
    //         <Tooltip title={`${statusTxt.toUpperCase()} a safra`}>
    //           <Button size="small">
    //             <FontAwesomeIcon icon={statusBtn} size="lg" />
    //           </Button>
    //         </Tooltip>
    //       </Popconfirm>
    //     );
    //   }
    // },
    {
      title: "",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            {
              <Button size="small" href={`/visitas/${record._id}`}>
                <Icon type="eye" style={{ fontSize: "16px" }} />
              </Button>
              /*
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir esta safra?`}
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
            /> */
            }
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
        <PainelHeader title="Visitas">
          {/* <Button type="primary" icon="plus" href="/visitas/new">
            Adicionar
          </Button> */}
        </PainelHeader>
        <SimpleTable
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="_id"
          columns={this.tableConfig()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default Seasons;
