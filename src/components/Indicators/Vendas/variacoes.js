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
      },
      agruparPor: "peneira"
    };
  }

  async initializeList(variacao = null, aqp) {
    const list = await IndicatorVendasService({
      agruparPor: this.state.agruparPor,
      grupo_produto: this.props.grupoProduto._id,
      ...(variacao && { "itens.peneira.value": `/^${variacao}$/` }),
      ...aqp,
      ...{"itens.produto.id" : this.props.produto.idProduto}
    }).then(result => result.docs);
    this.setState({ list: list, selectPeneira: variacao });
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
    },
    {
      title: "Nome Comercial",
      dataIndex: "nome_comercial",
      key: "nome_comercial",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      },
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
      title: "Peneira",
      dataIndex: "peneira",
      key: "peneira",
      sorter: (a, b, sorter) => {
        if (sorter === "ascendent") return -1;
        else return 1;
      }
    }
  ];

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
        <Select
          style={{ width: "100%", marginBottom: 20 }}
          onChange={e => this.initializeList(e)} defaultValue="">
          <Select.Option value="">Todas peneiras</Select.Option>
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
          rowKey={record => `${record.idProduto}_${new Date().getTime()}`}
          columns={this.tableConfig()}
          dataSource={this.state.list}
          pagination={false}
        />
      </div>
    );
  }
}

export default VendasVariacoesIndicator;
