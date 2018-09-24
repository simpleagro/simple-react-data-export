import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Select,
  Affix,
  Card,
  InputNumber,
  Spin
} from "antd";
import styled from "styled-components";
import { MapWithASearchBox } from "../../Map";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as ClientSpotService from "../../../services/clients.plots";

const Option = Select.Option;

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
  border: 1px solid #e3cccc;
`;

const google = window.google;

class ClientPropertySpotForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      estados: [],
      cidades: [],
      client_id: this.props.match.params.client_id,
      property_id: this.props.match.params.property_id,
      fetchingCidade: false,
      isMarkerShown: false
    };
  }

  async componentDidMount() {
    this.delayedShowMarker();

    const { client_id, property_id, id } = this.props.match.params;

    if (id) {
      const formData = await ClientSpotService.get(client_id)(property_id)(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
      console.log(formData);
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);
  }

  delayedShowMarker = () => {
    setTimeout(() => {
      this.setState({ isMarkerShown: true });
    }, 3000);
  };

  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false });
    this.delayedShowMarker();
  };

  handleFormState = async event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await ClientSpotService.create(
              this.state.client_id
            )(this.state.property_id)(this.state.formData);
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/propriedades/${
                this.props.match.params.property_id
              }/talhoes`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um cliente", err);
          }
        } else {
          try {
            const updated = await ClientSpotService.update(
              this.state.client_id
            )(this.state.property_id)(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/propriedades/${
                this.props.match.params.property_id
              }/talhoes`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar um cliente ", err);
          }
        }
      }
    });
  };

  setGPS(latitude, longitude) {
    const _newState = this.state;
    console.log(_newState);
    _newState.formData.latitude = latitude;
    _newState.formData.longitude = longitude;
    this.setState(prev => ({ ...prev, _newState }));
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
              href={`/clientes/${
                this.props.match.params.client_id
              }/propriedades/${this.props.match.params.property_id}/talhoes`}
            >
              <Icon type="arrow-left" />
              Voltar para a tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Talhão" : "Novo Talhão"}
          >
            <Button type="primary" icon="save" onClick={() => this.saveForm()}>
              Salvar Talhão
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" ref={input => (this.titleInput = input)} />)}
          </Form.Item>
          <Form.Item
            label="Área"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 3 }}
          >
            {getFieldDecorator("area", {
              initialValue: this.state.formData.area
            })(<Input type="number" name="area" addonAfter="ha" />)}
          </Form.Item>
          <CardStyled type="inner" title="Geolocalização" bordered>
            <Form.Item label="Latitude" {...formItemLayout}>
              {getFieldDecorator("latitude", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.latitude
              })(
                <InputNumber
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "latitude", value: e }
                    })
                  }
                  style={{ width: 250 }}
                  name="latitude"
                />
              )}
            </Form.Item>
            <Form.Item label="Longitude" {...formItemLayout}>
              {getFieldDecorator("longitude", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.longitude
              })(
                <InputNumber
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "longitude", value: e }
                    })
                  }
                  style={{ width: 250 }}
                  name="longitude"
                />
              )}
            </Form.Item>
          </CardStyled>
          <CardStyled type="inner" title="Mapa do Talhão" bordered>
            <MapWithASearchBox setGPS={this.setGPS.bind(this)} />
          </CardStyled>
        </Form>
      </div>
    );
  }

  generateHelper() {
    if (this.state.formData.estado === undefined)
      return "Selecione um estado primeiro";

    if (this.state.fetchingCidade === true)
      return (
        <Spin
          indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
        />
      );

    return null;
  }

  async onChangeSelectCidade(cidade) {
    console.log(cidade);
    await this.setState(prev => ({
      ...prev,
      fetchingCidade: false
    }));
    // await this.handleFormState({
    //   target: { name: "cidade_codigo", value: e.key }
    // });
    // await this.handleFormState({
    //   target: { name: "cidade", value: e.label }
    // });
    await this.handleFormState({
      target: { name: "cidade", value: cidade }
    });
  }
}

const WrappepClientPropertySpotForm = Form.create()(ClientPropertySpotForm);

export default WrappepClientPropertySpotForm;
