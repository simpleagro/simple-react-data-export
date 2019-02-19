import React, { Component } from "react";
import { Form, Card, Col, Row, Select, DatePicker } from "antd";
import moment from "moment";
import PropTypes from "prop-types";

const { Option } = Select;

class ConfigurarFPCaracteristica extends Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{ background: "#ECECEC", padding: "30px" }}>
        <Row gutter={0} type="flex" justify="space-around" align="middle">
          <Col span={5}>
            <Card title="Data Vencimento">
              {!this.props.formData.itens.length && (
                <React.Fragment>
                  <Form.Item label="Royalties">
                    {getFieldDecorator("venc_royalties", {
                      initialValue: this.props.formData.venc_royalties
                        ? moment(
                            this.props.formData.venc_royalties,
                            "YYYY-MM-DD"
                          )
                        : undefined
                    })(
                      <DatePicker
                        onChange={(data, dataString) =>
                          this.props.handleFormState({
                            target: {
                              name: "venc_royalties",
                              value: dataString
                                ? moment(dataString, "DD/MM/YYYY").format(
                                    "YYYY-MM-DD"
                                  )
                                : undefined
                            }
                          })
                        }
                        allowClear
                        format={"DD/MM/YYYY"}
                        name="venc_royalties"
                      />
                    )}
                  </Form.Item>
                  <Form.Item label="Germoplasma">
                    {getFieldDecorator("venc_germoplasma", {
                      initialValue: this.props.formData.venc_germoplasma
                        ? moment(
                            this.props.formData.venc_germoplasma,
                            "YYYY-MM-DD"
                          )
                        : undefined
                    })(
                      <DatePicker
                        onChange={(data, dataString) =>
                          this.props.handleFormState({
                            target: {
                              name: "venc_germoplasma",
                              value: moment(dataString, "DD/MM/YYYY").format(
                                "YYYY-MM-DD"
                              )
                            }
                          })
                        }
                        allowClear
                        format={"DD/MM/YYYY"}
                        name="venc_germoplasma"
                      />
                    )}
                  </Form.Item>
                  <Form.Item label="Tratamento">
                    {getFieldDecorator("venc_tratamento", {
                      initialValue: this.props.formData.venc_tratamento
                        ? moment(
                            this.props.formData.venc_tratamento,
                            "YYYY-MM-DD"
                          )
                        : undefined
                    })(
                      <DatePicker
                        onChange={(data, dataString) =>
                          this.props.handleFormState({
                            target: {
                              name: "venc_tratamento",
                              value: moment(dataString, "DD/MM/YYYY").format(
                                "YYYY-MM-DD"
                              )
                            }
                          })
                        }
                        allowClear
                        format={"DD/MM/YYYY"}
                        name="venc_tratamento"
                      />
                    )}
                  </Form.Item>
                </React.Fragment>
              )}
              {this.props.showFrete && (
                <Form.Item label="Frete">
                  {getFieldDecorator("venc_frete", {
                    initialValue: this.props.formData.venc_frete
                      ? moment(this.props.formData.venc_frete, "YYYY-MM-DD")
                      : undefined
                  })(
                    <DatePicker
                      onChange={(data, dataString) =>
                        this.props.handleFormState({
                          target: {
                            name: "venc_frete",
                            value: moment(dataString, "DD/MM/YYYY").format(
                              "YYYY-MM-DD"
                            )
                          }
                        })
                      }
                      allowClear
                      format={"DD/MM/YYYY"}
                      name="venc_frete"
                    />
                  )}
                </Form.Item>
              )}
            </Card>
          </Col>
          <Col span={7} pull={6}>
            <Card title="Forma de Pagamento" bordered={false}>
              {!this.props.formData.itens.length && (
                <React.Fragment>
                  <Form.Item label="Royalties">
                    {getFieldDecorator("pgto_royalties", {
                      rules: [
                        {
                          required: this.props.formData.venc_royalties,
                          message: "Este campo é obrigatório!"
                        }
                      ],
                      initialValue: this.props.formData.pgto_royalties
                    })(
                      <Select
                        name="pgto_royalties"
                        showAction={["focus", "click"]}
                        showSearch
                        placeholder="Selecione..."
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={e => {
                          this.props.handleFormState({
                            target: {
                              name: "pgto_royalties",
                              value: e
                            }
                          });
                        }}>
                        {["REAIS"].map((s, index) => (
                          <Option key={`pgto_r_${index}`} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item label="Germoplasma">
                    {getFieldDecorator("pgto_germoplasma", {
                      rules: [
                        {
                          required: this.props.formData.venc_germoplasma,
                          message: "Este campo é obrigatório!"
                        }
                      ],
                      initialValue: this.props.formData.pgto_germoplasma
                    })(
                      <Select
                        name="pgto_germoplasma"
                        showAction={["focus", "click"]}
                        showSearch
                        placeholder="Selecione..."
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={e => {
                          this.props.handleFormState({
                            target: {
                              name: "pgto_germoplasma",
                              value: e
                            }
                          });
                        }}>
                        {["REAIS", "GRÃOS"].map((s, index) => (
                          <Option key={`pgto_g_${index}`} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item label="Tratamento">
                    {getFieldDecorator("pgto_tratamento", {
                      rules: [
                        {
                          required: this.props.formData.venc_tratamento,
                          message: "Este campo é obrigatório!"
                        }
                      ],
                      initialValue: this.props.formData.pgto_tratamento
                    })(
                      <Select
                        name="pgto_tratamento"
                        showAction={["focus", "click"]}
                        showSearch
                        placeholder="Selecione..."
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={e => {
                          this.props.handleFormState({
                            target: {
                              name: "pgto_tratamento",
                              value: e
                            }
                          });
                        }}>
                        {["REAIS", "GRÃOS"].map((s, index) => (
                          <Option key={`pgto_t_${index}`} value={s}>
                            {s}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </React.Fragment>
              )}
              {this.props.showFrete && (
                <Form.Item label="Frete">
                  {getFieldDecorator("pgto_frete", {
                    rules: [
                      {
                        required: this.props.formData.venc_frete,
                        message: "Este campo é obrigatório!"
                      }
                    ],
                    initialValue: this.props.formData.pgto_frete
                  })(
                    <Select
                      name="pgto_frete"
                      showAction={["focus", "click"]}
                      showSearch
                      placeholder="Selecione..."
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={e => {
                        this.props.handleFormState({
                          target: {
                            name: "pgto_frete",
                            value: e
                          }
                        });
                      }}>
                      {["REAIS"].map((s, index) => (
                        <Option key={`pgto_frt_${index}`} value={s}>
                          {s}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

ConfigurarFPCaracteristica.defaultProps = {
  showFrete: false,
  formData: {}
};

ConfigurarFPCaracteristica.propTypes = {
  form: PropTypes.object.isRequired,
  handleFormState: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired
};

export default ConfigurarFPCaracteristica;
