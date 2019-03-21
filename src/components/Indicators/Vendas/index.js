import React, { Component } from "react";
import { Button, Select, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { vendas as IndicatorVendasService } from "services/indicators";
import { list as ProductGroupServiceList } from "services/productgroups";
import SimpleTable from "common/SimpleTable";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { PainelHeader } from "common/PainelHeader";
import { simpleTableSearch } from "lib/simpleTableSearch";

class VendasIndicator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      grupoProdutos: [],
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(grupo = null, aqp) {
    let data = [];

    grupo = grupo ? JSON.parse(grupo) : null;

    if (grupo) {
      this.setState(previousState => {
        return { ...previousState, loadingData: true };
      });
      data = await IndicatorVendasService({
        grupo_produto: grupo.id,
        ...aqp
      });
    }

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

  async componentDidMount() {
    const grupoProdutos = await ProductGroupServiceList({
      limit: -1,
      fields: "nome"
    });

    this.setState(prev => ({
      ...prev,
      grupoProdutos: grupoProdutos.docs
    }));

    this.initializeList();
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
      render: () => {
        return (
          <span>
            <Tooltip title="Veja por variação">
              <Button
                size="small"
                >
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
    this.initializeList(JSON.stringify(this.state.selectedGroup), {
      page: pagination.current,
      limit: pagination.pageSize,
      ...this.state.tableSearch
    });
  };

  render() {
    return (
      <div>
        <SimpleBreadCrumb to={`/indicadores`} history={this.props.history} />
        <PainelHeader title="Vendas" />

        <h4>Selecione um grupo de produtos para começar:</h4>
        <Select
          value={
            this.state.selectedGroup && JSON.stringify(this.state.selectedGroup)
          }
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
          rowKey="idProduto"
          columns={this.tableConfig()}
          dataSource={this.state.list}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }

  filtrarPorVariacao = () => (
    <React.Fragment>
      <h4>Filtrar também por variação:</h4>
      <Select
        value={
          this.state.selectedVariation &&
          JSON.stringify(this.state.selectedVariation)
        }
        style={{ width: "100%", marginBottom: 20 }}
        showAction={["focus", "click"]}
        showSearch
        placeholder="Selecione uma variação..."
        onChange={e => this.initializeList(e)}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
    </React.Fragment>
  );
}

export default VendasIndicator;
