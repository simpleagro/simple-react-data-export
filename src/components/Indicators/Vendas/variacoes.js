import React, { Component } from "react";
import { Button, Select, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { vendas as IndicatorVendasService } from "services/indicators";
import { list as ProductGroupServiceList } from "services/productgroups";
import SimpleTable from "common/SimpleTable";
import { PainelHeader } from "common/PainelHeader";
import { simpleTableSearch } from "lib/simpleTableSearch";

class VendasVariacoesIndicator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: false,
      peneiras: [],
      selectPeneira: null,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(p) {
    const list = await IndicatorVendasService({
      grupo_produto: this.props.grupoProduto._id,
      "itens.peneira.value": `/^${p}$/`
    }).then(result => result.docs);
    this.setState({ list: list });
  }

  async componentDidMount() {
    console.log("this prosp variaco", this.props);
    const grupoProdutos = await ProductGroupServiceList({
      limit: -1,
      fields: "nome"
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
    this.initializeList(JSON.stringify(this.state.selectedGroup), {
      page: pagination.current,
      limit: pagination.pageSize,
      ...this.state.tableSearch
    });
  };

  render() {
    let { caracteristicas } = this.props.grupoProduto;
    caracteristicas = caracteristicas.filter(c => {
      if (c.deleted !== true && c.chave === "peneira" && c.status === true) {
        c.opcoes =
          c.opcoes &&
          c.opcoes.filter(op => op.deleted !== true && c.status === true);
        return true;
      }
      return false;
    });

    return (
      <div>
        <PainelHeader
          title="Vendas - Por variações"
          subTitle={`${this.props.grupoProduto &&
            this.props.grupoProduto.nome} -> ${this.props.produto &&
            this.props.produto.nome}${
            this.props.produto && this.props.produto.nome_comercial
              ? " " + this.props.produto.nome_comercial
              : ""
          }`}
          children={
            <Button
              onClick={() => this.props.fechar()}
              type="primary"
              size="large"
              icon="close-circle">
              Fechar
            </Button>
          }
        />

        <h4>Selecione uma peneira para começar:</h4>
        <Select style={{ width: "100%", marginBottom: 20 }} onChange={e => this.initializeList(e)}>
          {caracteristicas &&
            caracteristicas.map(
              caract =>
                caract.opcoes &&
                caract.opcoes.map(op => (
                  <Select.Option value={op.value}>{op.label}</Select.Option>
                ))
            )}
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

}

export default VendasVariacoesIndicator;
