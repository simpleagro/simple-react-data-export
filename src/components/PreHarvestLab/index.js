import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Divider, Button, Icon, Popconfirm, Tooltip, Row, Col, Select } from "antd";

import * as FieldRegistrationService from "services/field-registration";
import * as PreHarvestService from "services/field-registration.pre-harvest";

import SimpleTable from "common/SimpleTable";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
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
      },
    };
  }

  setList(){
    let listData = [];
    let num = 1;
    this.state.listPreHarvest.map(lph => (
      this.state.listFieldRegistration.map(lfr => (
        lfr._id === lph._id && lph.pre_colheita.map(ph => (
          listData.push(
            Object.assign({
              inscricao_campo_id: lfr._id,
              numero_pre_colheita: num,
              numero_inscricao_campo: lfr.numero_inscricao_campo,
              contrato: lfr.contrato,
              cliente: lfr.cliente,
              safra: lfr.safra,
              propriedade: lfr.propriedade,
              area_talhao: ph.area_talhao,
              autorizacao_transporte: ph.autorizacao_transporte,
              data: ph.data,
              data_colheita: ph.data_colheita,
              nome_talhao: ph.nome_talhao,
              num_colhedoras: ph.num_colhedoras,
              observacao: ph.observacao,
              produtividade: ph.produtividade,
              codigo_erp: ph.codigo_erp,
              responsavel: ph.responsavel.nome,
              _id: ph._id
            })
          ),
          num++
        ))
      ))
    ));

    this.setState({
      list: listData
    })

  }

  async initializeList(aqp) {

    const dataFieldRegistration = await FieldRegistrationService.list();
    const dataPreHarvest = await FieldRegistrationService.list({ fields: "pre_colheita,todasPrecolheitasPorInscricaoCampo", "todasPrecolheitasPorInscricaoCampo": true, ...aqp });
    const dataSafra = await SeasonService.list({ limit: 999999 });

    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    try {

      this.setState(prev => ({
        ...prev,
        loadingData: false,
        listSafra: dataSafra.docs,
        listFieldRegistration: dataFieldRegistration.docs,
        listPreHarvest: dataPreHarvest.docs,
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
      this.props.history.push(`/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita`);
    } finally {
      this.setState({ loadingData: false });
    }

    this.setList();

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

  removeRecord = async ({ _id, nome_talhao }, field_registration_id) => {
    try {
      await PreHarvestService.remove(field_registration_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess("", `A pré colheita, ${nome_talhao}, foi removida com sucesso!`);
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log("Erro interno ao remover uma pré colheita", err);
    }
  };

  tableConfig = () => [
    {
      title: "Pré-Colheita",
      dataIndex: "numero_pre_colheita",
      key: "numero_pre_colheita",
      fixed: "left",
    },
    {
      title: "Cliente",
      dataIndex: "cliente.nome",
      key: "cliente.nome",
      ...simpleTableSearch(this)("cliente.nome"),
      fixed: "left"
    },
    {
      title: "Código ERP",
      dataIndex: "codigo_erp",
      key: "codigo_erp"
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
      dataIndex: "nome_talhao",
      key: "pre_colheita.nome_talhao",
      ...simpleTableSearch(this)("pre_colheita.nome_talhao")
    },
    {
      title: "Número de Colhedoras",
      dataIndex: "num_colhedoras",
      key: "pre_colheita.num_colhedoras"
    },
    {
      title: "Produtividade",
      dataIndex: "produtividade",
      key: "pre_colheita.produtividade"
    },
    {
      title: "Responsável",
      dataIndex: "responsavel",
      key: "pre_colheita.responsavel",
      ...simpleTableSearch(this)("pre_colheita.responsavel")
    },
    {
      title: "Ações",
      dataIndex: "action",
      fixed: "right",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() =>
                this.props.history.push(
                  `/inscricao-de-campo/${record.inscricao_campo_id}/pre-colheita/${
                    record._id
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
              onConfirm={() => this.removeRecord(record, record.inscricao_campo_id)}
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
                        `/inscricao-de-campo/${record.inscricao_campo_id}/pre-colheita/${
                          record._id
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
                  `/inscricao-de-campo/${record.inscricao_campo_id}/pre-colheita/${
                    record._id
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
                    onChange={e => this.initializeList({ "safra.descricao": e })}
                    placeholder="Selecione a safra...">
                      {this.state.listSafra &&
                          this.state.listSafra.map((safra, i) =>
                            <Option key={i} value={safra.descricao}>
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
                rowKey="numero_pre_colheita"
                columns={this.tableConfig()}
                dataSource={this.state.list}
                onChange={this.handleTableChange}
              />
            </Card>
          </Col>
        </Row>
        { console.log(this.state) }
      </div>
    );
  }
}

export default PreHarvest;
