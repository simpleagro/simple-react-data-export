import React, { Component } from "react";
import { Button, Select, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { vendas as IndicatorVendasService } from "services/indicators";
import { list as ProductGroupServiceList } from "services/productgroups";
import SimpleTable from "common/SimpleTable";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { PainelHeader } from "common/PainelHeader";
import { simpleTableSearch } from "lib/simpleTableSearch";
import VendasVariacoesIndicator from "./variacoes";

class VendasIndicator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: false,
      grupoProdutos: [],
      selectedProduct: null,
      selectedGroup: null,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      },
      mostrarVariacoes: false
    };
  }

  async initializeList(grupo = null, aqp) {
    let data = [];

    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    if (grupo) {
      this.setState(previousState => {
        return { ...previousState, loadingData: true };
      });
      data = await IndicatorVendasService({
        grupo_produto: grupo._id,
        ...aqp
      });
      this.setState(prev => ({
        ...prev,
        list: data.docs,
        loadingData: false,
        selectedGroup: grupo,
        pagination: {
          total: data.total
        }
      }));
    }

    this.setState(prev => ({
      ...prev,
      loadingData: false
    }));
  }

  async componentDidMount() {
    const grupoProdutos = await ProductGroupServiceList({
      limit: -1,
      fields: "nome, caracteristicas"
    });

    this.setState(prev => ({
      ...prev,
      grupoProdutos: grupoProdutos.docs
    }));

    // this.initializeList();
  }

  tableConfig = () => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("itens.produto.nome")
    },
    {
      title: "Nome Comercial",
      dataIndex: "nome_comercial",
      key: "nome_comercial",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
      ...simpleTableSearch(this)("nome_comercial")
    },
    {
      title: "UM",
      dataIndex: "u_m_primaria",
      key: "u_m_primaria",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Quantidade",
      dataIndex: "quantidadeConvertida",
      key: "quantidadeConvertida",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    },
    {
      title: "Ações",
      render: (text, record) => {
        console.log("REND", record);
        return (
          <span>
            <Tooltip title="Veja por variação">
              <Button
                size="small"
                onClick={() => {
                  this.setState({
                    mostrarVariacoes: true,
                    selectedProduct: record
                  });
                }}>
                <FontAwesomeIcon icon="plus" size="lg" />
              </Button>
            </Tooltip>
          </span>
        );
      }
    }
  ];

  handleTableChange = (pagination, sorter) => {
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList(this.state.selectedGroup, {
      page: pagination.current,
      limit: pagination.pageSize,
      ...this.state.tableSearch
    });
  };

  render() {
    console.log("REND2");
    return (
      <div>
        {!this.state.mostrarVariacoes && (
          <React.Fragment>
          <SimpleBreadCrumb to={`/indicadores`} history={this.props.history} />
          <PainelHeader title="Vendas" />
            <h4>Selecione um grupo de produtos para começar:</h4>
            <Select
              value={this.state.selectedGroup && this.state.selectedGroup.nome}
              style={{ width: "100%", marginBottom: 20 }}
              showAction={["focus", "click"]}
              showSearch
              placeholder="Selecione um grupo de produto..."
              onChange={(e, { props }) => {
                this.initializeList(props["data-obj"]);
              }}
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }>
              {this.state.grupoProdutos.length &&
                this.state.grupoProdutos.map(gp => (
                  <Select.Option data-obj={gp} key={gp._id} value={gp.nome}>
                    {gp.nome}
                  </Select.Option>
                ))}
            </Select>

            <SimpleTable
              pagination={this.state.pagination}
              spinning={this.state.loadingData}
              rowKey="idProduto"
              columns={this.tableConfig()}
              dataSource={this.state.list}
              onChange={this.handleTableChange}
            />
          </React.Fragment>
        )}

        {this.state.mostrarVariacoes && (
          <VendasVariacoesIndicator
            grupoProduto={this.state.selectedGroup}
            produto={this.state.selectedProduct}
            fechar={() => this.setState({ mostrarVariacoes: false })}
          />
        )}
      </div>
    );
  }
}

export default VendasIndicator;
