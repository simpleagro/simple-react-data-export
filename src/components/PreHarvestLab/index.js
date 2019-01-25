import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, Divider, Button, Icon, Popconfirm, Tooltip, Row, Col } from "antd";

import * as FieldRegistrationService from "services/field-registration";
import * as PreHarvestService from "services/field-registration.pre-harvest";

import SimpleTable from "common/SimpleTable";
import { flashWithSuccess } from "common/FlashMessages";
import parseErrors from "lib/parseErrors";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { simpleTableSearch } from "lib/simpleTableSearch";

let listData = [];
let num = 1;

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

  setList(){
    this.state.listPreHarvest.map((lph, indexLPH) => (
      this.state.listFieldRegistration.map((lfr, indexLFR) => (
        lfr._id === lph._id && lph.pre_colheita.map((ph, indexPH) => (
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
              responsavel: ph.responsavel,
              _id: ph._id
            })
          ),
          num++
        ))
      ))
    ));

    this.setState(prev => ({
      ...prev,
      list: listData
    }))
  }

  async initializeList(aqp) {

    const dataFieldRegistration = await FieldRegistrationService.list();
    const dataPreHarvest = await FieldRegistrationService.list({ fields: "pre_colheita,todasPrecolheitasPorInscricaoCampo", "todasPrecolheitasPorInscricaoCampo": true });

    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    try {
      this.setState(prev => ({
        ...prev,
        loadingData: false,
        listFieldRegistration: dataFieldRegistration.docs,
        listPreHarvest: dataPreHarvest.docs,
        pagination: {
        }
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
      this.props.history.push(`/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita`);
    } finally {
      this.setState({ loadingData: false });
    }

  }

  async componentDidMount() {
    await this.initializeList();
    // this.setList();

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
      title: "Inscrição",
      dataIndex: "numero_inscricao_campo",
      key: "numero_inscricao_campo"
    },
    {
      title: "Contrato",
      dataIndex: "contrato",
      key: "contrato"
    },
    {
      title: "Safra",
      dataIndex: "safra.descricao",
      key: "safra.descricao"
    },
    {
      title: "Talhão",
      dataIndex: "nome_talhao",
      key: "pre_colheita.nome_talhao",
      ...simpleTableSearch(this)("pre_colheita.nome_talhao")
    },
    {
      title: "Propriedade",
      dataIndex: "propriedade.nome",
      key: "propriedade.nome",
      ...simpleTableSearch(this)("propriedade.nome")
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
                  }/edit`
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
      ...this.state.tableSearch
    });
  };

  render() {
    return (
      <div>
        <SimpleBreadCrumb to={"/inscricao-de-campo"} history={this.props.history} />
        <Row gutter={30}>
          <Col>
            <Card
              title="Pré Colheita"
              bordered={false}
              // extra={
              //   <Button
              //     type="primary"
              //     icon="plus"
              //     onClick={() =>
              //       this.props.history.push(
              //         `/inscricao-de-campo/${this.state.field_registration_id}/pre-colheita/new`
              //       )
              //     }>
              //     Adicionar
              //   </Button>
              // }
              >
              <SimpleTable
                pagination={this.state.pagination}
                spinning={this.state.loadingData}
                rowKey="numero_pre_colheita"
                columns={this.tableConfig()}
                dataSource={this.state.list}
                onChange={this.handleTableChange}
                scroll={{ x: window.innerWidth }}
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
