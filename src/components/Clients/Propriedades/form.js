import React, { Component } from "react";
import {
  Button,
  Icon,
  Input,
  Form,
  Select,
  Affix,
  Card,
  InputNumber,
  Tooltip,
  Spin,
  Row,
  Col
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as ClientPropertyService from "../../../services/clients.properties";
import * as IBGEService from "../../../services/ibge";
import { SimpleMap } from "../../SimpleMap";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import { calculateArea, calculateCenter } from "../../../lib/mapUtils";

const google = window.google; // é necessário para inicializar corretamente

const Option = Select.Option;

const CardStyled = styled(Card)`
  background: #ececec;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e3cccc;
`;

class ClientPropertyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      estados: [],
      cidades: [],
      client_id: this.props.match.params.client_id,
      fetchingCidade: false,
      drawingMap: false,
      editingMap: false,
      savingForm: false
    };
  }

  async componentDidMount() {
    const { client_id, id } = this.props.match.params;

    if (id) {
      const formData = await ClientPropertyService.get(client_id)(id);

      if (formData) {
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false,
          editingMap: id ? true : false
        }));
        this.atualizarMapa(this.state.formData.coordenadas);
      }
      // console.log(formData);
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);

    const estados = await IBGEService.listaEstados();
    this.setState(prev => ({ ...prev, estados, fetchingCidade: false }));
  }

  async listaCidadesPorEstado(estado) {
    await this.setState({ fetchingCidade: true, cidades: [], cidade: "" });
    await this.handleFormState({
      target: { name: "estado", value: estado.label }
    });
    // await this.handleFormState({
    //   target: { name: "estado", value: estado.label}
    // });
    // await this.handleFormState({
    //   target: { name: "estado_codigo", value: estado.key }
    // });
    const cidades = await IBGEService.listaCidadesPorEstado(estado.key);
    this.setState(prev => ({ ...prev, cidades, fetchingCidade: false }));
  }

  handleFormState = async event => {
    // console.log(event);
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    await this.setState(prev => ({ ...prev, formData: form }));
    // console.log(this.state.formData);
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
            const created = await ClientPropertyService.create(
              this.state.client_id
            )(this.state.formData);
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/propriedades/${
                created._id
              }/talhoes`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            // console.log("Erro interno ao adicionar um cliente", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            const updated = await ClientPropertyService.update(
              this.state.client_id
            )(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/clientes/${this.props.match.params.client_id}/propriedades`
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
    const { latitude, longitude } = this.state.formData;

    return (
      <div>
        <SimpleBreadCrumb
          to={`/clientes/${this.props.match.params.client_id}/propriedades`}
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={
              this.state.editMode ? "Editando Propriedade" : "Nova propriedade"
            }>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Propriedade
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
          <Form.Item label="Inscrição Estadual" {...formItemLayout}>
            {getFieldDecorator("ie", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.ie
            })(
              <InputNumber
                onChange={e =>
                  this.handleFormState({
                    target: { name: "ie", value: e }
                  })
                }
                style={{ width: 250 }}
                disabled={this.state.editMode}
                name="ie"
              />
            )}
          </Form.Item>
          <Form.Item label="Matrículas" {...formItemLayout}>
            {getFieldDecorator("matriculas", {
              initialValue: this.state.formData.matriculas
            })(
              <Tooltip
                title="Aqui você pode incluir várias matrículas. Basta digitar o valor e quando finalizar utilize o ENTER para salvar a matrícula"
                trigger="focus">
                <Select
                  name="matriculas"
                  mode="tags"
                  showSearch
                  allowClear
                  placeholder="Informe as matrículas..."
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "matriculas", value: e }
                    })
                  }
                />
              </Tooltip>
            )}
          </Form.Item>
          <Form.Item
            label="Área"
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 3 }}>
            {getFieldDecorator("area", {
              initialValue: this.state.formData.area
            })(<Input type="number" name="area" addonAfter="ha" />)}
          </Form.Item>
          <CardStyled type="inner" title="Endereço" bordered>
            <Form.Item label="Endereço" {...formItemLayout}>
              {getFieldDecorator("endereco", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.endereco
              })(<Input name="endereco" />)}
            </Form.Item>
            <Form.Item label="Estado" {...formItemLayout}>
              {getFieldDecorator("estado", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: {
                  key: this.state.formData.estado_codigo || 0,
                  label: this.state.formData.estado || ""
                }
              })(
                <Select
                  name="estado"
                  showAction={["focus", "click"]}
                  showSearch
                  labelInValue={true}
                  style={{ width: 200 }}
                  placeholder="Selecione um estado..."
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onSelect={e => this.listaCidadesPorEstado(e)}>
                  {this.state.estados.map(uf => (
                    <Option key={uf.codigo} value={(uf.nome, uf.codigo)}>
                      {uf.nome}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label="Cidade"
              {...formItemLayout}
              help={this.generateHelper()}
              validateStatus={
                this.state.formData.estado === undefined ? "warning" : ""
              }>
              {getFieldDecorator("cidade", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.cidade
              })(
                <Select
                  disabled={this.state.formData.estado === undefined}
                  name="cidade"
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 200 }}
                  // labelInValue={true}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onSelect={e => {
                    this.onChangeSelectCidade(e);
                  }}>
                  {this.state.cidades.map(c => (
                    <Option key={c.codigo} value={c.nome}>
                      {c.nome}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            {/* <Form.Item
              label="CEP"
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 3 }}
            >
              {getFieldDecorator("cep", {
                initialValue: this.state.formData.cep
              })(
                <InputNumber
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "cep", value: e }
                    })
                  }
                  maxLength="8"
                  style={{ width: "200px" }}
                  name="cep"
                  placeholder="Apenas números"
                />
              )}
            </Form.Item>
            <Form.Item
              label="Caixa Postal"
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 3 }}
            >
              {getFieldDecorator("caixa_postal", {
                initialValue: this.state.formData.caixa_postal
              })(
                <InputNumber
                  onChange={e =>
                    this.handleFormState({
                      target: { name: "caixa_postal", value: e }
                    })
                  }
                  style={{ width: "200px" }}
                  name="caixa_postal"
                  placeholder="Apenas números"
                />
              )}
            </Form.Item> */}
          </CardStyled>
          <CardStyled type="inner" title="Geolocalização" bordered>
            <Row>
              <Col span={5}>
                <Form.Item label="Latitude">
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
                      style={{ width: '90%' }}
                      name="latitude"
                    />
                  )}
                </Form.Item>
                <Form.Item label="Longitude">
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
                      style={{ width: '90%' }}
                      name="longitude"
                    />
                  )}
                </Form.Item>
                <Form.Item label="Área Calculada">
                  <Input
                    addonAfter="Ha"
                    style={{ width: '90%' }}
                    value={this.state.areaDoPoligono}
                    readOnly
                  />
                </Form.Item>
              </Col>
              <Col span={19}>
                <p>
                  Digite o nome da região ou cidade no campo abaixo e utilize o
                  marcador em vermelho para pegar a latitude e longitude:
                </p>
                <div style={{ position: "relative" }}>
                  <SimpleMap
                    polygonData={
                      this.state.formData.coordenadas
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
                </div>
              </Col>
            </Row>
          </CardStyled>
        </Form>
      </div>
    );
  }

  adicionarPontosAoMapa() {
    let draw = false;
    let edit = false;

    switch (this.state.editMode) {
      case true:
        if (
          this.state.formData.coordenadas &&
          this.state.formData.coordenadas.length === 0
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

  salvarMapa(coordenadas) {
    this.setState(prev => ({
      ...prev,
      drawingMap: false,
      formData: {
        ...prev.formData,
        coordenadas
      }
    }));
    // console.log("SAlvar mapa ", this.state);
    this.atualizarMapa(coordenadas);
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

const WrappepClientPropertyForm = Form.create()(ClientPropertyForm);

export default WrappepClientPropertyForm;
