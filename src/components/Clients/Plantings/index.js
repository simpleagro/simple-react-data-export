import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Card,
  Divider,
  Button,
  Icon,
  Popconfirm,
  Tooltip,
  Select,
  Row,
  Col
} from "antd";
import styled from "styled-components";

import * as PlantingService from "../../../services/clients.plantings";
import * as ClientsService from "../../../services/clients";
import SimpleTable from "../../common/SimpleTable";
import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { simpleTableSearch } from "../../../lib/simpleTableSearch";

const Option = Select.Option;

class Plantings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: false,
      client_id: this.props.match.params.client_id,
      client_data: {},
      filtro_safras: [],
      safra_selecionada: null
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return {
        ...previousState,
        loadingData: true,
        safra_selecionada: aqp && aqp.safra ? aqp.safra : null
      };
    });

    try {
      const clientData = await ClientsService.get(this.state.client_id);
      this.setState(prev => ({
        ...prev,
        client_data: clientData
      }));
    } catch (error) {
      if (error && error.response && error.response.data) parseErrors(error);
    }

    try {
      const params = new URLSearchParams(window.location.search);
      aqp = {
        ...aqp,
        "talhao.id": params.get("talhao") ? params.get("talhao") : null
      };
      const data = await PlantingService.list(this.state.client_id)(aqp);

      this.setState(prev => ({
        ...prev,
        list: data.docs,
        filtro_safras: data.safrasFiltro,
        safra_selecionada: data.safraSelecionada,
        loadingData: false
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

  changeStatus = async (id, newStatus) => {
    try {
      await PlantingService.changeStatus(this.state.client_id)(id, newStatus);

      let recordName = "";

      let _list = this.state.list.map(item => {
        if (item._id === id) {
          item.status = newStatus;
          recordName = `${item.nome} - ${item.propriedade.ie}`;
        }
        return item;
      });

      this.setState(prev => ({
        ...prev,
        list: _list
      }));

      flashWithSuccess(
        "",
        `O planejamento de plantio para a propriedade, ${recordName}, foi ${
          newStatus ? "ativada" : "bloqueada"
        } com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log(
        "Erro interno ao mudar status do planejamento de plantio para a propriedade",
        err
      );
    }
  };

  removeRecord = async ({ _id, propriedade: { nome, ie } }) => {
    try {
      await PlantingService.remove(this.state.client_id)(_id);
      let _list = this.state.list.filter(record => record._id !== _id);

      this.setState({
        list: _list
      });

      flashWithSuccess(
        "",
        `O planejamento de plantio para a propriedade, ${nome} - ${ie}, foi removido com sucesso!`
      );
    } catch (err) {
      if (err && err.response && err.response.data) parseErrors(err);
      console.log(
        "Erro interno ao remover o planejamento de plantio para a propriedade",
        err
      );
    }
  };

  tableConfig = () => [
    {
      title: "Propriedade",
      dataIndex: "propriedade.nome",
      key: "propriedade.nome",
      ...simpleTableSearch(this)("propriedades.nome")
    },
    {
      title: "Inscrição Estadual",
      dataIndex: "propriedade.ie",
      key: "propriedade.ie",
      ...simpleTableSearch(this)("propriedades.ie")
    },
    {
      title: "Talhão",
      dataIndex: "talhao.nome",
      key: "talhao.nome",
      ...simpleTableSearch(this)("propriedades.talhao.nome")
    },
    {
      title: "Produto",
      dataIndex: "produto.nome",
      key: "produto.nome",
      ...simpleTableSearch(this)("produto.nome")
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => {
        const statusTxt = record.status ? "desativar" : "ativar";
        const statusBtn = record.status ? "unlock" : "lock";
        return (
          <Popconfirm
            title={`Tem certeza em ${statusTxt} este planejamento de plantio?`}
            onConfirm={e => this.changeStatus(record._id, !record.status)}
            okText="Sim"
            cancelText="Não">
            <Tooltip
              title={`${statusTxt.toUpperCase()} planejamento de plantio`}>
              <Button size="small">
                <FontAwesomeIcon icon={statusBtn} size="lg" />
              </Button>
            </Tooltip>
          </Popconfirm>
        );
      }
    },
    {
      title: "Ações",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <span>
            <Button
              size="small"
              onClick={() =>
                this.props.history.push(
                  `/clientes/${this.state.client_id}/plantio/${record._id}/edit`
                )
              }>
              <Icon type="edit" style={{ fontSize: "16px" }} />
            </Button>
            <Divider
              style={{ fontSize: "10px", padding: 0, margin: 2 }}
              type="vertical"
            />
            <Popconfirm
              title={`Tem certeza em excluir este planejamento de plantio?`}
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
          </span>
        );
      }
    }
  ];

  handleTableChange = (pagination, filters) => {
    let _this = this;
    const pager = { ...this.state.pagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager
    });
    this.initializeList({
      page: pagination.current,
      limit: pagination.pageSize,
      ...this.state.tableSearch
      // ..._this.state.tableSearch ? _this.state.tableSearch : null
    });
  };

  render() {
    return (
      <div>
        <SimpleBreadCrumb
          history={this.props.history}
          className="breadcrumbStyled"
          to={`/clientes/${this.state.client_id}/propriedades/${this.props.location.state.propriedade_id}/talhoes`}
        />

        <Row gutter={24}>
          <Col span={5}>
            <Card
              bordered
              style={{
                boxShadow: "0px 8px 0px 0px #009d55 inset",
                color: "#009d55"
              }}>
              <p>{`Cliente: ${this.state.client_data.nome}`}</p>
              <p>{`CPF/CNPJ: ${this.state.client_data.cpf_cnpj}`}</p>
              <Button
                style={{ width: "100%" }}
                onClick={() => {
                  this.props.history.push(
                    `/clientes/${this.state.client_id}/edit`,
                    { returnTo: this.props.history.location }
                  );
                }}>
                <Icon type="edit" /> Editar
              </Button>
            </Card>
          </Col>
          <Col span={19}>
            <Card
              title={
                <span>
                  Planejamentos de Plantio - para o período de:
                  <Select
                    showAction={["focus", "click"]}
                    showSearch
                    style={{ width: 150, marginLeft: 10 }}
                    value={this.state.safra_selecionada}
                    onChange={e => this.initializeList({ "safra.id": e })}
                    placeholder="Selecione a safra..."
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }>
                    {this.state.filtro_safras &&
                      this.state.filtro_safras.map(s => (
                        <Option key={s._id} value={s._id}>
                          {s.descricao}
                        </Option>
                      ))}
                  </Select>
                </span>
              }
              bordered={false}
              extra={
                <Button
                  type="primary"
                  icon="plus"
                  onClick={() =>
                    this.props.history.push(
                      `/clientes/${this.state.client_id}/plantio/new`
                    )
                  }>
                  Adicionar
                </Button>
              }>
              <SimpleTable
                pagination={this.state.pagination}
                spinning={this.state.loadingData}
                rowKey="_id"
                columns={this.tableConfig()}
                dataSource={this.state.list}
                onChange={this.handleTableChange}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Plantings;
