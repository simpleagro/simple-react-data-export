import React, { Component } from "react";
import moment from "moment";
import { Divider, Button, Icon, Popconfirm, message, Tooltip } from "antd";

import * as SeasonService from "../../services/visits";
import SimpleTable from "../common/SimpleTable";
import { flashWithSuccess } from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";

class Indicators extends Component {
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

    try {
      const data = {
        docs: [
          {
            label: "Vendas",
            url: "vendas"
          }
        ],
        total: 1
      };

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

  tableConfig = () => [
    {
      title: "Indicador",
      dataIndex: "label",
      key: "label",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
    },
    {
      title: "Ações",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            {
              <Button
                size="small"
                onClick={() =>
                  this.props.history.push(`/indicadores/${record.url}`)
                }>
                <Icon type="eye" style={{ fontSize: "16px" }} />
              </Button>
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
        <PainelHeader title="Indicadores" />

        <SimpleTable
          pagination={this.state.pagination}
          spinning={this.state.loadingData}
          rowKey="label"
          columns={this.tableConfig()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default Indicators;
