import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Input,
  Form,
  Select,
  Steps,
  Card,
  InputNumber,
  Tooltip,
  Spin
} from "antd";
import styled from "styled-components";

import { flashWithSuccess } from "../../common/FlashMessages";
import parseErrors from "../../../lib/parseErrors";
import { PainelHeader } from "../../common/PainelHeader";
import * as ClientPropertyService from "../../../services/clients.properties";
import * as ClientService from "../../../services/clients";
import * as IBGEService from "../../../services/ibge";

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

class ClientPropertyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      estados: [],
      cidades: [],
      client_id: this.props.match.params.client_id,
      fetchingCidade: false
    };
  }

  async componentDidMount() {
    const { client_id, id } = this.props.match.params;

    if (id) {
      const formData = await ClientPropertyService.get(client_id)(id);

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

    const estados = await IBGEService.listaEstados();
    this.setState(prev => ({ ...prev, estados, fetchingCidade: false }));
  }

  async listaCidadesPorEstado(estado) {
    this.setState({ fetchingCidade: true });

    this.handleFormState({
      target: { name: "estado", value: estado }
    });
    const cidades = await IBGEService.listaCidadesPorEstado(estado);
    this.setState(prev => ({ ...prev, cidades, fetchingCidade: false }));
  }

  handleFormState = event => {
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
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
              `/clientes/${this.props.match.params.client_id}/propriedades`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log("Erro interno ao adicionar um cliente", err);
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
          }
        }
      }
    });
  };

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
            <Button href={`/clientes/${this.props.match.params.client_id}/propriedades`}>
              <Icon type="arrow-left" />
              Voltar para a tela anterior
            </Button>
          </Breadcrumb.Item>
        </BreadcrumbStyled>
        <PainelHeader
          title={
            this.state.editMode ? "Editando Propriedade" : "Nova propriedade"
          }
        >
          <Button type="primary" icon="save" onClick={() => this.saveForm()}>
            Salvar Propriedade
          </Button>
        </PainelHeader>
        <Form onChange={this.handleFormState}>
          <Form.Item label="Nome" {...formItemLayout}>
            {getFieldDecorator("nome", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.nome
            })(<Input name="nome" ref={input => (this.titleInput = input)} />)}
          </Form.Item>
          <Form.Item label="Inscrição Estadual" {...formItemLayout}>
            {getFieldDecorator("inscricao_estadual", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.inscricao_estadual
            })(<Input name="inscricao_estadual" />)}
          </Form.Item>
          <Form.Item label="Matrículas" {...formItemLayout}>
            {getFieldDecorator("matriculas", {
              rules: [{ required: true, message: "Este campo é obrigatório!" }],
              initialValue: this.state.formData.matriculas
            })(
              <Tooltip
                title="Aqui você pode incluir várias matrículas. Basta digitar o valor e quando finalizar utilize o ENTER para salvar a matrícula"
                trigger="focus"
              >
                <Select
                  name="matriculas"
                  value={this.state.formData.matriculas}
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

          <CardStyled type="inner" title="Endereço" bordered>
            <Form.Item label="Logradouro" {...formItemLayout}>
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
                initialValue: this.state.formData.estado
              })(
                <Select
                  name="estado"
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Selecione um estado..."
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={e => this.listaCidadesPorEstado(e)}
                >
                  {this.state.estados.map(uf => (
                    <Option key={uf.id} value={uf.id}>
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
              validateStatus={!this.state.formData.estado ? "warning" : ""}
            >
              {getFieldDecorator("cidade", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.cidade
              })(
                <Select
                  disabled={!this.state.formData.estado}
                  name="cidade"
                  showAction={["focus", "click"]}
                  showSearch
                  style={{ width: 200 }}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={e => {
                    this.onChangeSelectCidade(e);
                  }}
                >
                  {this.state.cidades.map(c => (
                    <Option key={c.id} value={c.id}>
                      {c.nome}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </CardStyled>
          <CardStyled type="inner" title="Geolocalização" bordered>
            <Form.Item label="Latitude" {...formItemLayout}>
              {getFieldDecorator("latitude", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.latitude
              })(<InputNumber style={{ width: 250 }} name="latitude" />)}
            </Form.Item>
            <Form.Item label="Longitude" {...formItemLayout}>
              {getFieldDecorator("longitude", {
                rules: [
                  { required: true, message: "Este campo é obrigatório!" }
                ],
                initialValue: this.state.formData.longitude
              })(<InputNumber style={{ width: 250 }} name="longitude" />)}
            </Form.Item>
          </CardStyled>
        </Form>
      </div>
    );
  }

  generateHelper() {
    if (
      this.state.formData.estado == "" ||
      this.state.formData.estado === undefined
    )
      return "Selecione um estado primeiro";

    if (this.state.fetchingCidade === true)
      return (
        <Spin
          indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
        />
      );

    return null;
  }

  onChangeSelectCidade(e) {
    this.setState(prev => ({
      ...prev,
      fetchingCidade: false
    }));
    this.handleFormState({
      target: { name: "cidade", value: e }
    });
  }
}

const WrappepClientPropertyForm = Form.create()(ClientPropertyForm);

export default WrappepClientPropertyForm;
