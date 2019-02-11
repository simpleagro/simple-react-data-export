import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Divider, Button, Icon, Popconfirm, Tooltip, Row, Col, Select } from "antd";

import * as FieldRegistrationService from "services/field-registration";
import * as PreHarvestService from "services/field-registration.pre-harvest";

import SimpleTable from "common/SimpleTable";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { simpleTableSearch } from "lib/simpleTableSearch";

import * as SeasonService from "services/seasons";

const Option = Select.Option;

class PreHarvest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingData: true,
      field_registration_id: null,
      pre_harvest_data: {},
      listFieldRegistration: [],
      listPreHarvest: [],
      list: [],
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
      const dataFieldRegistration = await FieldRegistrationService.list({ limit: 999999 });
      const dataPreHarvest = await FieldRegistrationService.list({
        "todasPrecolheitasPorInscricaoCampo": true,
        ...aqp
      });
      const dataSafra = await SeasonService.list({ limit: 999999 });

      this.setState(prev => ({
        ...prev,
        loadingData: false,
        listSafra: dataSafra.docs,
        listFieldRegistration: dataFieldRegistration.docs,
        listPreHarvest: dataPreHarvest.docs,
        pagination: {
          total: dataPreHarvest.total
        }
      }));

    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
      this.props.history.push(`/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita`);
    } finally {
      this.setState({ loadingData: false });
    }

  }

  changeStatus = async (id, newStatus) => {
    try {
      await PreHarvestService.changeStatus(this.state.field_registration_id)(
        id,
        newStatus
      );

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
        `A pré colheita, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao mudar status da pré colheita", err);
    }
  };

  async componentDidMount() {
    await this.initializeList();

  }

  removeRecord = async ({ _id, pre_colheita }) => {

    try {
      await PreHarvestService.remove(_id)(pre_colheita._id);
      let _list = this.state.listPreHarvest.filter(record => record.pre_colheita._id !== pre_colheita._id);

      this.setState({
        listPreHarvest: _list
      });

      flashWithSuccess("", `A pré colheita, ${pre_colheita.nome_talhao}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma pré colheita", err);
    }
  };

  tableConfig = () => [
    // {
    //   title: "Pré-Colheita",
    //   dataIndex: "numero_pre_colheita",
    //   key: "numero_pre_colheita",
    //   fixed: "left",
    // },
    {
      title: "Cliente",
      dataIndex: "cliente.nome",
      key: "cliente.nome",
      ...simpleTableSearch(this)("cliente.nome"),
      fixed: "left",
      width: 250,
    },
    {
      title: "Código ERP",
      dataIndex: "pre_colheita.codigo_erp",
      key: "pre_colheita.codigo_erp"
    },
    {
      title: "Contrato",
      dataIndex: "contrato",
      key: "contrato",
      ...simpleTableSearch(this)("contrato")
    },
    // {
    //   title: "Safra",
    //   dataIndex: "safra.descricao",
    //   key: "safra.descricao"
    // },
    {
      title: "Propriedade",
      dataIndex: "propriedade.nome",
      key: "propriedade.nome",
      ...simpleTableSearch(this)("propriedade.nome")
    },
    {
      title: "Talhão",
      dataIndex: "pre_colheita.nome_talhao",
      key: "pre_colheita.nome_talhao",
      ...simpleTableSearch(this)("pre_colheita.nome_talhao")
    },
    {
      title: "Número de Colhedoras",
      dataIndex: "pre_colheita.num_colhedoras",
      key: "pre_colheita.num_colhedoras"
    },
    {
      title: "Produtividade",
      dataIndex: "pre_colheita.produtividade",
      key: "pre_colheita.produtividade"
    },
    {
      title: "Responsável",
      dataIndex: "pre_colheita.responsavel.nome",
      key: "pre_colheita.responsavel.nome",
      ...simpleTableSearch(this)("pre_colheita.responsavel.nome")
    },
    {
      title: "Ações",
      dataIndex: "action",
      fixed: "right",
      width: 150,
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() =>
                this.props.history.push(
                  `/inscricao-de-campo/${record._id}/pre-colheita/${
                    record.pre_colheita._id
                  }/edit`, { returnTo: "preColheitaLab" }
                )
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir a pré colheita?`}
              onConfirm={() => this.removeRecord(record)}
              okText="Sim"
              cancelText="Não">
                <Button size="small">
                  <Icon type="delete" style={{ fontSize: "16px" }} />
                </Button>
            </Popconfirm>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            {this.props.seletorModulo &&
              this.props.seletorModulo.slug !== "sales" && (
                <Tooltip title="Veja as autorizações">
                  <Button
                    size="small"
                    onClick={() =>
                      this.props.history.push(
                        `/inscricao-de-campo/${record._id}/pre-colheita/${
                          record.pre_colheita._id
                        }/autorizacao`
                      )
                    }>
                    <FontAwesomeIcon icon="map-marked-alt" size="lg" />
                  </Button>
                </Tooltip>
              )}
              <Button
              size="small"
              onClick={() =>
                this.props.history.push(
                  `/inscricao-de-campo/${record._id}/pre-colheita/${
                    record.pre_colheita._id
                  }/autorizacao`
                )
              }>
              <Icon type="key" style={{ fontSize: "16px" }} />
            </Button>
          </span>
        );
      }
    }
  ];

  handleTableChange = (pagination, filters) => {
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

  render() {
    return (
      <div>
        <Row gutter={30}>
          <Col>
            <Card
              title={
                <span>
                  Pré-Colheita <span style={{ marginLeft: 150}}>Safra:</span>
                  <Select
                    showSearch
                    allowClear
                    showArrow
                    style={{ width: 200, marginLeft: 15 }}
                    onChange={e => this.initializeList({ "safra.id": e })}
                    placeholder="Selecione a safra...">
                      {this.state.listSafra &&
                          this.state.listSafra.map((safra, i) =>
                            <Option key={i} value={safra._id}>
                              {safra.descricao}
                            </Option>
                      )}
                  </Select>
                </span>
              }
              bordered={false}>
              <SimpleTable
                pagination={this.state.pagination}
                spinning={this.state.loadingData}
                rowKey={record => record.pre_colheita._id}
                columns={this.tableConfig()}
                dataSource={this.state.listPreHarvest}
                onChange={this.handleTableChange}
                scroll={{ x: window.innerWidth + 400 }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default PreHarvest;
