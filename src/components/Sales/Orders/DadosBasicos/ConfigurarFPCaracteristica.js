import React, { Component } from "react";
import { Form, Card, Col, Row, Select, DatePicker } from "antd";
import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { simpleDate, date2Db } from "common/utils";

const { Option } = Select;

class ConfigurarFPCaracteristica extends Component {
  geraSeletorDeData(variacao) {
    const { preco_base_regra } = this.props.grupoProduto || {};
    const { getFieldDecorator } = this.props.form;

    const {
      usar_datas_fixas: usarDatasFixas,
      venc_datas_fixas: vencDatasFixas
    } =
      (preco_base_regra &&
        preco_base_regra.find(regra => regra.chave === variacao)) ||
      false;

    if (
      (this.props.userRules &&
        this.props.userRules.some(
          p =>
            p.subject === "Order" &&
            p.actions.includes(
              "usarCalendarioNaDataVencimentoDeCaractNoCabDoPedido"
            )
        )) ||
      !usarDatasFixas
    )
      return (
        <React.Fragment>
          {getFieldDecorator(`venc_${variacao}`, {
            initialValue: simpleDate(this.props.formData[`venc_${variacao}`])
          })(
            <DatePicker
              disabled={!!this.props.formData.itens.length}
              onChange={data =>
                this.props.handleFormState({
                  target: {
                    name: `venc_${variacao}`,
                    value: date2Db(data)
                  }
                })
              }
              allowClear
              format={"DD/MM/YYYY"}
              name={`venc_${variacao}`}
              style={{ width: "100%" }}
            />
          )}
        </React.Fragment>
      );

    return (
      <React.Fragment>
        {getFieldDecorator(`venc_${variacao}`, {
          initialValue: this.props.formData[`venc_${variacao}`]
            ? moment(
                this.props.formData[`venc_${variacao}`],
                "YYYY-MM-DD"
              ).format("DD/MM/YYYY")
            : undefined
        })(
          <Select
            disabled={!!this.props.formData.itens.length}
            name={`venc_${variacao}`}
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
                  name: `venc_${variacao}`,
                  value: date2Db(e, undefined, "YYYY-MM-DD")
                }
              });
            }}>
            {vencDatasFixas &&
              vencDatasFixas.map((d, index) => {
                return (
                  <Option key={`${index}`} value={d}>
                    {d}
                  </Option>
                );
              })}
          </Select>
        )}
      </React.Fragment>
    );
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div style={{ background: "#ECECEC", padding: "30px" }}>
        <Row gutter={0} type="flex" justify="space-around" align="middle">
          <Col span={5}>
            <Card title="Data Vencimento">
              <React.Fragment>
                <Form.Item label="Germoplasma">
                  {this.geraSeletorDeData("germoplasma")}
                </Form.Item>
                <Form.Item label="Royalties">
                  {this.geraSeletorDeData("royalties")}
                </Form.Item>
                <Form.Item label="Tratamento">
                  {this.geraSeletorDeData("tratamento")}
                </Form.Item>
              </React.Fragment>

              {this.props.showFrete && (
                <Form.Item label="Frete">
                  {this.geraSeletorDeData("frete")}
                </Form.Item>
              )}
            </Card>
          </Col>
          <Col span={7} pull={6}>
            <Card title="Forma de Pagamento" bordered={false}>
              <React.Fragment>
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
                      disabled={!!this.props.formData.itens.length}
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
                      disabled={!!this.props.formData.itens.length}
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
                      disabled={!!this.props.formData.itens.length}
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

const mapStateToProps = ({ painelState }) => {
  return {
    userRules:
      Object.keys(painelState.userData.rules).length > 0
        ? painelState.userData.rules
        : []
  };
};

export default connect(mapStateToProps)(ConfigurarFPCaracteristica);
