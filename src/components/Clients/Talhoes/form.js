import React, { Component } from "react";
import {
  Button,
  Icon,
  Input,
  Form,
  Row,
  Col,
  Affix,
  Card,
  InputNumber,
  Spin
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as ClientSpotService from "../../../services/clients.plots";
import { SimpleMap } from "../../SimpleMap";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { calculateArea, calculateCenter } from "../../../lib/mapUtils";

const google = window.google; // é necessário para inicializar corretamente

const CardStyled = styled(Card)`
  background: #ececec;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e3cccc;
`;

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
      isMarkerShown: false,
      drawingMap: false,
      editingMap: false,
      savingForm: false
    };
  }

  async componentDidMount() {
    this.delayedShowMarker();

    const { client_id, property_id, id } = this.props.match.params;

    if (this.props.location.state.propriedade) {
      this.setState({
        markerCentroTalhao: [
          {
            position: {
              lat: parseFloat(this.props.location.state.propriedade.latitude),
              lng: parseFloat(this.props.location.state.propriedade.longitude)
            }
          }
        ]
      });

      this.setGPS(
        this.props.location.state.propriedade.latitude,
        this.props.location.state.propriedade.longitude
      );
    }

    if (id) {
      const formData = await ClientSpotService.get(client_id)(property_id)(id);

      if (formData) {
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          editingMap: id ? true : false
        }));
        // console.log(formData);
        this.atualizarMapa(this.state.formData.coordenadas);
      }
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
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await ClientSpotService.create(
              this.state.client_id
            )(this.state.property_id)(this.state.formData);
            this.setState(prev => ({
              ...prev,
              openForm: false,
              formData: {},
              editMode: false
            }));
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/propriedades/${
                this.props.match.params.property_id
              }/talhoes`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um cliente", err);
            this.setState({ savingForm: false });
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
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  adicionarPontosAoMapa() {
    let draw = false;
    let edit = false;

    switch (this.state.editMode) {
      case true:
        if (
          (this.state.formData.coordenadas &&
            this.state.formData.coordenadas.length === 0) ||
          this.state.formData.coordenadas === undefined
        )
          draw = true;
        else edit = true;
        break;
      case false:
        draw = true;
        break;
    }

    this.setState(prev => ({
      ...prev,
      drawingMap: draw,
      editingMap: edit
    }));

    // console.log("ADDDDDD",this.state);
  }

  salvarMapa(coordenadas) {
    this.setState(prev => ({
      ...prev,
      drawingMap: false,
      formData: {
        ...prev.formData,
        coordenadas
      }
    }));
    this.atualizarMapa(coordenadas);
  }

  atualizarMapa(coordenadas) {
    const novoCentroMapa = calculateCenter(coordenadas);
    if(!novoCentroMapa) return;
    this.setGPS(novoCentroMapa.latitude, novoCentroMapa.longitude);
    this.setState(prev => ({
      ...prev,
      areaDoPoligono: coordenadas ? calculateArea(coordenadas) : 0,
      markerCentroTalhao: novoCentroMapa
        ? [
            {
              position: {
                lat: novoCentroMapa.latitude,
                lng: novoCentroMapa.longitude
              }
            }
          ]
        : []
    }));
  }

  setGPS(latitude, longitude) {
    const _newState = this.state;
    // console.log(_newState);
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
        <SimpleBreadCrumb
          to={`/clientes/${this.props.match.params.client_id}/propriedades/${
            this.props.match.params.property_id
          }/talhoes`}
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Talhão" : "Novo Talhão"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
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
            wrapperCol={{ span: 3 }}>
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
            <Form.Item label="Área Calculada" {...formItemLayout}>
              <Input
                addonAfter="Ha"
                style={{ width: 250 }}
                value={this.state.areaDoPoligono}
                readOnly
              />
            </Form.Item>
          </CardStyled>
          <CardStyled type="inner" title="Mapa do Talhão" bordered>
            <Row>
              <Col span={24}>
                <SimpleMap
                  polygonData={
                    this.state.formData.coordenadas &&
                    this.state.formData.coordenadas.length > 0
                      ? this.state.formData.coordenadas.map(
                          c => new google.maps.LatLng(c.latitude, c.longitude)
                        )
                      : []
                  }
                  markers={this.state.markerCentroTalhao}
                  adicionarPontosAoMapa={() => this.adicionarPontosAoMapa()}
                  salvarMapa={coordenadas => this.salvarMapa(coordenadas)}
                  drawingMap={this.state.drawingMap}
                  editingMap={this.state.editingMap}
                  latitude={this.state.formData.latitude}
                  longitude={this.state.formData.longitude}
                  containerElement={<div style={{ height: `400px` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  setGPS={(latitude, longitude) =>
                    this.setGPS(latitude, longitude)
                  }
                  limparMapa={() =>
                    this.setState(prev => ({
                      ...prev,
                      formData: { ...prev.formData, coordenadas: [] }
                    }))
                  }
                />
              </Col>
            </Row>
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
    // console.log(cidade);
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
