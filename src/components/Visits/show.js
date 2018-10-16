import React, { Component } from "react";
import { cloneDeep as _cloneDeep } from "lodash";
import moment from "moment";
import "moment/locale/pt-br";

import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Affix,
  Card,
  Radio,
  Tabs
} from "antd";
import styled from "styled-components";

import {
  flashWithSuccess,
  flashWithError,
  flashModalWithError
} from "../common/FlashMessages";
import parseErrors from "../../lib/parseErrors";
import { PainelHeader } from "../common/PainelHeader";
import * as CustomerWalletService from "../../services/customerswallet";
import { list as ConsultantsServiceList } from "../../services/consultants";
import { list as ClientsServiceList } from "../../services/clients";
import * as VisitsService from "../../services/visits";

const TabPane = Tabs.TabPane;
const TextArea = Input.TextArea;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 45px;
  margin: -24px;
  margin-bottom: 30px;
`;

const CardStyled = styled(Card)`
  background: #ececec;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e8e8e8;
`;

const CardProblemas = styled(Card)`
  padding: 5px;
  border: 1px solid #e8e8e8;
  margin-bottom: 10px;
  box-shadow: 1px 3px 2px 0px #d9d9d9;
`;

class VisitForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      consultants: [],
      clients: [],
      selectedClient: {},
      walletTree: [],
      walletTreeCheckeds: [],
      errorOnWalletTree: []
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    console.log("ID", id);

    if (id) {
      const formData = await VisitsService.get(id);
      console.log("formData", formData);
      if (formData) {
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
      }
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <div>
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button
              href={
                this.props.location.state && this.props.location.state.returnTo
                  ? this.props.location.state.returnTo.pathname
                  : "/visitas"
              }
            >
              <Icon type="arrow-left" />
              Voltar para tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader title="Detalhes da Visita" />
        </Affix>
        <Form>
          <Tabs defaultActiveKey="1">
            <TabPane tab="Descrição da Visita" key="1">
              <Form.Item label="Tipo de Visita" {...formItemLayout}>
                {getFieldDecorator("tipo", {
                  initialValue: this.state.formData.tipo
                    ? this.state.formData.tipo
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Safra" {...formItemLayout}>
                {getFieldDecorator("safra", {
                  initialValue: this.state.formData.safra
                    ? this.state.formData.safra
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Motivo da Visita" {...formItemLayout}>
                {getFieldDecorator("motivo", {
                  initialValue: this.state.formData.motivo
                    ? this.state.formData.motivo
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Potencial de Venda" {...formItemLayout}>
                {getFieldDecorator("potencial_venda", {
                  initialValue: this.state.formData.potencial_venda
                    ? this.state.formData.potencial_venda
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Observação" {...formItemLayout}>
                {getFieldDecorator("observacao", {
                  initialValue: this.state.formData.observacao
                    ? this.state.formData.observacao
                    : ""
                })(<TextArea rows={2} readOnly />)}
              </Form.Item>
              <Form.Item label="Consultor" {...formItemLayout}>
                {getFieldDecorator("consultor.nome", {
                  initialValue: this.state.formData.consultor
                    ? this.state.formData.consultor.nome
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Data Agendamento" {...formItemLayout}>
                {getFieldDecorator("data_agenda", {
                  initialValue: this.state.formData.data_agenda
                    ? moment(this.state.formData.data_agenda).format(
                        "DD/MM/YYYY"
                      )
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Hora Agendamento" {...formItemLayout}>
                {getFieldDecorator("hora_agenda", {
                  initialValue: this.state.formData.hora_agenda
                    ? this.state.formData.hora_agenda
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Concluiu a Visita?" {...formItemLayout}>
                {getFieldDecorator("concluiu_visita", {
                  initialValue: this.state.formData.concluiu_visita
                })(
                  <Radio.Group size="large" buttonStyle="solid">
                    <Radio.Button value={true}>Sim</Radio.Button>
                    <Radio.Button value={false}>Não</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
              <Form.Item label="Visitou em" {...formItemLayout}>
                {getFieldDecorator("visitou_em", {
                  initialValue: this.state.formData.visitou_em
                    ? moment(this.state.formData.visitou_em).format(
                        "DD/MM/YYYY"
                      )
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
            </TabPane>
            <TabPane tab="Dados do Cliente" key="2">
              <Form.Item label="Cliente" {...formItemLayout}>
                {getFieldDecorator("cliente.nome", {
                  initialValue: this.state.formData.cliente
                    ? this.state.formData.cliente.nome
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Propriedade" {...formItemLayout}>
                {getFieldDecorator("propriedade.nome", {
                  initialValue: this.state.formData.propriedade
                    ? this.state.formData.propriedade.nome
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <Form.Item label="Talhão" {...formItemLayout}>
                {getFieldDecorator("talhao.nome", {
                  initialValue: this.state.formData.talhao
                    ? this.state.formData.talhao.nome
                    : ""
                })(<Input readOnly />)}
              </Form.Item>
              <CardStyled type="inner" title="Geolocalização" bordered>
                <Form.Item label="Latitude" {...formItemLayout}>
                  {getFieldDecorator("geolocalizacao.latitude", {
                    initialValue: this.state.formData.geolocalizacao
                      ? this.state.formData.geolocalizacao.latitude
                      : ""
                  })(<Input readOnly />)}
                </Form.Item>
                <Form.Item label="Longitude" {...formItemLayout}>
                  {getFieldDecorator("geolocalizacao.longitude", {
                    initialValue: this.state.formData.geolocalizacao
                      ? this.state.formData.geolocalizacao.longitude
                      : ""
                  })(<Input readOnly />)}
                </Form.Item>
              </CardStyled>
            </TabPane>
            <TabPane tab="Diagnósticos e Recomendações" key="3">
              {this.state.formData.problemas &&
              this.state.formData.problemas.length > 0
                ? this.state.formData.problemas.map((p, index) => (
                    <CardProblemas key={index}>
                      <h3>Diagnóstico:</h3>
                      <p>
                        - Agrupamento: {p.diagnostico.agrupamento}
                        <br />- Problema Sanitário:{" "}
                        {p.diagnostico.problema_sanitario}
                        <br />- Nível de Infestação:{" "}
                        {p.diagnostico.nivel_infestacao}
                        <br />
                      </p>
                      <h3>Recomendação:</h3>
                      <p>
                        - Grupo de Produto: {p.recomendacao.grupo_produto.nome}
                        <br />- Nome do Produto: {p.recomendacao.produto.nome}
                      </p>
                    </CardProblemas>
                  ))
                : "Sem registros no momento"}
            </TabPane>
          </Tabs>
        </Form>
      </div>
    );
  }
}

const WrappepVisitForm = Form.create()(VisitForm);

export default WrappepVisitForm;
