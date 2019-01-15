import React, { Component } from "react";
import { Button, Input, Form, Select, Affix, InputNumber, DatePicker, Spin, Icon } from "antd";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import { SimpleBreadCrumb } from "../../common/SimpleBreadCrumb";
import * as FieldRegistrationService from "../../../services/field-registration";
import * as ClientService from "../../../services/clients";
import * as ProductGroupService from "../../../services/productgroups";
import * as SeasonService from "../../../services/seasons";
import * as ConsultantService from "../../../services/consultants";
import * as IBGEService from "../../../services/ibge";
import moment from "moment";


const Option = Select.Option;

class FieldRegistrationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false,
      estados: [],
      cidades: []
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;
    const dataClient = await ClientService.list({ limit: 9999999999 });
    const dataProductGroup = await ProductGroupService.list({ limit: 9999999999 });
    const dataSeason = await SeasonService.list({ limit: 9999999999 });
    const dataConsultant = await ConsultantService.list({ tipo: "PRODUCAO" })

    this.setState(prev => ({
      ...prev,
      listClient: dataClient.docs,
      listProductGroup: dataProductGroup.docs,
      listSeason: dataSeason.docs,
      listConsultant: dataConsultant.docs,
      /*formData: {
        ...prev.formData,
        responsavel: {
          nome: JSON.parse(localStorage.getItem("simpleagro_painel")).painelState.userData.user.nome,
          id: JSON.parse(localStorage.getItem("simpleagro_painel")).painelState.userData.user._id
        }
      }*/
    }))

    if (id) {
      const formData = await FieldRegistrationService.get(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }

    setTimeout(() => {
      this.titleInput.focus();
    }, 0);

    const estados = await IBGEService.listaEstados();
    this.setState(prev => ({ ...prev, estados, fetchingCidade: false }));
  }

  handleFormState = event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
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
            const created = await FieldRegistrationService.create(this.state.formData);
            this.setState({
              openForm: false,
              editMode: false
            });
            flashWithSuccess();

            this.props.history.push(
              "/inscricao-de-campo/" + created._id + "/pre-colheita"
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar uma inscrição de campo", err);
            this.setState({ savingForm: false });
          }
        } else {
          try {
            await FieldRegistrationService.update(this.state.formData);
            flashWithSuccess();

            if (this.props.location.state && this.props.location.state.returnTo)
              this.props.history.push(this.props.location.state.returnTo);
            else this.props.history.push("/inscricao-de-campo");
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao atualizar uma inscrição de campo ", err);
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  async onChangeSelectCidade(cidade) {

    await this.setState(prev => ({
      ...prev,
      fetchingCidade: false
    }));

    await this.handleFormState({
      target: { name: "cidade", value: cidade }
    });
  }

  async listaCidadesPorEstado(estado) {
    await this.setState({ fetchingCidade: true, cidades: [], cidade: "" });
    await this.handleFormState({
      target: { name: "estado", value: estado }
    });

    const cidades = await IBGEService.listaCidadesPorEstado(estado);
    this.setState(prev => ({ ...prev, cidades, fetchingCidade: false }));
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

  setCultivarId = e =>{
    this.setState({
      id_cultivar: JSON.parse(e).id
    });
  };

  async setGeolocalization(ClientId, PropId){
    this.state.listClient.map(client =>
      client._id === ClientId
        ? client.propriedades.map(prop =>
          prop._id === PropId
            ? this.setState( prev => ({
              formData: {
                ...prev.formData,
                geolocalizacao: {
                  latitude: prop.latitude,
                  longitude: prop.longitude
                },
                cidade: prop.cidade,
                estado: prop.estado
              }
            }))
            : null)
        : null )
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
          to={
            this.props.location.state && this.props.location.state.returnTo
              ? this.props.location.state.returnTo.pathname
              : "/inscricao-de-campo"
          }
          history={this.props.history}
        />
        <Affix offsetTop={65}>
          <PainelHeader
            title={this.state.editMode ? "Editando Incrição de Campo" : "Nova Inscrição de Campo"}>
            <Button
              type="primary"
              icon="save"
              onClick={() => this.saveForm()}
              loading={this.state.savingForm}>
              Salvar Inscrição de Campo
            </Button>
          </PainelHeader>
        </Affix>
        <Form onChange={this.handleFormState}>

        <Form.Item label="Safra" {...formItemLayout}>
            {getFieldDecorator("safra", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.safra && this.state.formData.safra.descricao
            })(<Select
                name="safra"
                showAction={["focus", "click"]}
                showSearch
                placeholder="Selecione a safra..."
                ref={input => (this.titleInput = input)}
                onChange={e => {
                  this.handleFormState({
                    target: { name: "safra", value: JSON.parse(e) }
                  })
                }}
              >
                {this.state.listSeason && this.state.listSeason.map(season =>
                  <Option key={season._id} value={JSON.stringify({
                    id: season._id,
                    descricao: season.descricao
                  })}>
                    {season.descricao}
                  </Option>)
                }
              </Select>)}
          </Form.Item>

          <Form.Item label="Cliente" {...formItemLayout}>
            {getFieldDecorator("cliente", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cliente && this.state.formData.cliente.nome
            })(<Select
                  name="cliente"
                  showAction={["focus", "click"]}
                  showSearch
                  placeholder="Selecione um cliente..."
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "cliente", value: JSON.parse(e) }
                    })
                  }}
                >
                  {this.state.listClient && this.state.listClient.map((client) => (
                    <Option key={client._id} value={ JSON.stringify({
                      id: client._id,
                      nome: client.nome,
                      cpf_cnpj: client.cpf_cnpj
                    })}>
                      {client.nome}
                    </Option>
                  ))}
                </Select>)}
          </Form.Item>

          <Form.Item
            label="Propriedade"
            {...formItemLayout}
          >
            {getFieldDecorator("propriedade", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.propriedade && this.state.formData.propriedade.nome
            })(<Select
                  name="propriedade"
                  disabled={this.state.formData.cliente === undefined}
                  showAction={["focus", "click"]}
                  showSearch
                  placeholder="Selecione a propriedade..."
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "propriedade", value: JSON.parse(e) }
                    });
                    this.setGeolocalization(this.state.formData.cliente.id, JSON.parse(e).id);
                  }}
                >
                  {this.state.formData.cliente && this.state.listClient.map(client => (
                    client._id === this.state.formData.cliente.id
                      ? client.propriedades.map(prop =>
                        <Option key={prop._id} value={JSON.stringify({
                          id: prop._id,
                          nome: prop.nome,
                          ie: prop.ie
                        })}>
                          {prop.nome}
                        </Option>)
                      : null ))}
              </Select>)}
          </Form.Item>

          <Form.Item label="Inscrição" {...formItemLayout}>
            {getFieldDecorator("ie", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.propriedade && this.state.formData.propriedade.ie
            })(<InputNumber name="ie" disabled />)}
          </Form.Item>

          <Form.Item label="Latitude" {...formItemLayout}>
            {getFieldDecorator("latitude", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.geolocalizacao && this.state.formData.geolocalizacao.latitude
            })(<InputNumber name="latitude"  />)}
          </Form.Item>

          <Form.Item label="Longitude" {...formItemLayout}>
            {getFieldDecorator("longitude", {
              rules: [{ required: false, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.geolocalizacao && this.state.formData.geolocalizacao.longitude
            })(<InputNumber name="longitude"  />)}
          </Form.Item>

          {/*
          <Form.Item label="Nº Inscrição de Campo" {...formItemLayout}>
            {getFieldDecorator("numero_inscricao_capo", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.numero_inscricao_capo
            })(<Input name="numero_inscricao_capo" />)}
          </Form.Item>
          */}

          <Form.Item label="Estado" {...formItemLayout}>
              {getFieldDecorator("estado", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.estado
              })(
                <Select
                  name="estado"
                  showAction={["focus", "click"]}
                  showSearch
                  placeholder="Selecione um estado..."
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onSelect={e => this.listaCidadesPorEstado(e)}>
                  {this.state.estados.map(uf => (
                    <Option key={uf} value={uf}>
                      {uf}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>

            <Form.Item
              label="Cidade"
              {...formItemLayout}
            >
              {getFieldDecorator("cidade", {
                rules: [{ required: true, message: "Este campo é obrigatório!" }],
                initialValue: this.state.formData.cidade
              })(
                <Select
                  disabled={this.state.formData.estado === undefined}
                  name="cidade"
                  showAction={["focus", "click"]}
                  showSearch
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onSelect={e => {
                    this.onChangeSelectCidade(e);
                  }}>
                  {this.state.cidades.map(c => (
                    <Option key={c.id} value={c.nome}>
                      {c.nome}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>

          <Form.Item label="Grupo de Produtos" {...formItemLayout}>
            {getFieldDecorator("grupo_produto", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.grupo_produto && this.state.formData.grupo_produto.nome
            })(<Select
                 name="grupo_produto"
                 allowClear
                 showAction={["focus", "click"]}
                 showSearch
                 placeholder="Selecione um grupo..."
                 onChange={e => {
                   this.handleFormState({
                     target: { name: "grupo_produto", value: JSON.parse(e)}
                   });
                   this.setCultivarId(e);
                 }}>
                    {this.state.listProductGroup &&
                      this.state.listProductGroup.map(gp => (<Option key={gp._id} value={ JSON.stringify({
                        id: gp._id,
                        nome: gp.nome
                      })}>
                        { gp.nome }
                      </Option>))
                    }
              </Select>)}
          </Form.Item>

          <Form.Item
            validateState={this.state.formData.grupo_produto === undefined ? "warning" : "" }
            label="Cultivar"
            {...formItemLayout}
          >
            {getFieldDecorator("cultivar", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.cultivar && this.state.formData.cultivar.nome
            })(<Select
                name="cultivar"
                disabled={this.state.formData.grupo_produto === undefined}
                showAction={["focus", "click"]}
                showSearch
                placeholder="Selecione um caracterista"
                onChange={e => {
                  this.handleFormState({
                    target: { name: "cultivar", value: JSON.parse(e) }
                  });
                }}>
                  {this.state.id_cultivar &&
                    this.state.listProductGroup.map(pg => pg._id === this.state.id_cultivar
                      ? pg.produtos.map(pgc =>
                          (<Option key={pgc._id}
                            value={ JSON.stringify({
                              id: pgc._id,
                              nome: pgc.label
                            })}
                          >
                            {pgc.label}
                          </Option>))
                      : null )}
              </Select>)}
          </Form.Item>

          <Form.Item label="Categoria Plantada" {...formItemLayout}>
            {getFieldDecorator("categ_plantada", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.categ_plantada
            })(<Select
                  name="categ_plantada"
                  showAction={["focus","click"]}
                  placeholder="Selecione..."
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "categ_plantada", value: e }
                    })
                  }}>
                    <Option value="GN" key="GN" >Genética</Option>
                    <Option value="BS" key="BS" >Básica</Option>
                    <Option value="C1" key="C1" >Certificada de 1ª Geração</Option>
                    <Option value="C2" key="C2" >Certificada de 2ª Geração</Option>
                    <Option value="S1" key="S1" >Fiscalizada de 1ª Geração</Option>
                    <Option value="S2" key="S2" >Fiscalizada de 2ª Geração</Option>
              </Select>)}
          </Form.Item>

          <Form.Item label="Categoria Colhida" {...formItemLayout}>
            {getFieldDecorator("categ_colhida", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.categ_colhida
            })(<Select
                  name="categ_colhida"
                  showAction={["focus","click"]}
                  placeholder="Selecione..."
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "categ_colhida", value: e }
                    })
                  }}>
                    <Option value="GN" key="GN" >Genética</Option>
                    <Option value="BS" key="BS" >Básica</Option>
                    <Option value="C1" key="C1" >Certificada de 1ª Geração</Option>
                    <Option value="C2" key="C2" >Certificada de 2ª Geração</Option>
                    <Option value="S1" key="S1" >Fiscalizada de 1ª Geração</Option>
                    <Option value="S2" key="S2" >Fiscalizada de 2ª Geração</Option>
                </Select>)}
          </Form.Item>

          <Form.Item label="Área Inscrita" {...formItemLayout}>
            {getFieldDecorator("area_inscrita", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.area_inscrita
            })(<InputNumber min={0} name="area_inscrita" />)}
          </Form.Item>

          <Form.Item label="Área Plantada" {...formItemLayout}>
            {getFieldDecorator("area_plantada", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.area_plantada
            })(<InputNumber min={0} name="area_plantada" />)}
          </Form.Item>

          <Form.Item label="Data do Plantio" {...formItemLayout}>
            {getFieldDecorator("data_plantio", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:  this.state.formData.data_plantio ? moment(
                this.state.formData.data_plantio
                  ? this.state.formData.data_plantio
                  : new Date(), "YYYY-MM-DD"
                ) : null
            })(<DatePicker
              onChange={(data, dataString) =>
                this.handleFormState({
                  target: {
                    name: "data_plantio",
                    value: moment(dataString, "DD/MM/YYYY").format("YYYY-MM-DD"
                    )}})}
              allowClear
              format={"DD/MM/YYYY"}
              name="data_plantio"
              />)}
          </Form.Item>

          <Form.Item label="Data do Inicio da Colheira" {...formItemLayout}>
            {getFieldDecorator("data_inicio_colheita", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:  this.state.formData.data_inicio_colheita ? moment(
                this.state.formData.data_inicio_colheita
                  ? this.state.formData.data_inicio_colheita
                  : new Date(), "YYYY-MM-DD"
                ) : null
            })(<DatePicker
              onChange={(data, dataString) =>
                this.handleFormState({
                  target: {
                    name: "data_inicio_colheita",
                    value: moment(dataString, "DD/MM/YYYY").format("YYYY-MM-DD"
                    )}})}
              allowClear
              format={"DD/MM/YYYY"}
              name="data_inicio_colheita"
              />)}
          </Form.Item>

          <Form.Item label="Data do Fim da Colheita" {...formItemLayout}>
            {getFieldDecorator("data_fim_colheita", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue:  this.state.formData.data_fim_colheita ? moment(
                this.state.formData.data_fim_colheita
                  ? this.state.formData.data_fim_colheita
                  : new Date(), "YYYY-MM-DD"
                ) : null
            })(<DatePicker
              onChange={(data, dataString) =>
                this.handleFormState({
                  target: {
                    name: "data_fim_colheita",
                    value: moment(dataString, "DD/MM/YYYY").format("YYYY-MM-DD"
                    )}})}
              allowClear
              format={"DD/MM/YYYY"}
              name="data_fim_colheita"
              />)}
          </Form.Item>

          <Form.Item label="Produção Estimada" {...formItemLayout}>
            {getFieldDecorator("prod_estimada", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.prod_estimada
            })(<InputNumber min={0} name="prod_estimada" />)}
          </Form.Item>

          <Form.Item label="Responsável" {...formItemLayout}>
            {getFieldDecorator("responsavel", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.responsavel && this.state.formData.responsavel.nome
            })(<Select
                  name="responsavel"
                  showAction={["focus","click"]}
                  placeholder="Selecione..."
                  onChange={e => {
                    this.handleFormState({
                      target: { name: "responsavel", value: JSON.parse(e) }
                    })
                  }}>
                    {this.state.listConsultant && this.state.listConsultant.map(consultant =>
                      (<Option key={consultant._id} value={JSON.stringify({
                        id: consultant._id,
                        nome: consultant.nome
                      })}>
                        {consultant.nome}
                      </Option>))}
              </Select>)}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappepFieldRegistrationForm = Form.create()(FieldRegistrationForm);

export default WrappepFieldRegistrationForm;
