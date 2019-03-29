import React, { Component } from "react";
import { Select, DatePicker, Form, Checkbox } from "antd";
import PropTypes from "prop-types";

export default class DataFixaVencimentosPedido extends Component {
  render() {
    return (
      <React.Fragment>
        <Form.Item>
          {this.props.getFieldDecorator("usar_datas_fixas", {
            initialValue: this.props.formData.usar_datas_fixas
          })(
            <Checkbox
              checked={this.props.formData.usar_datas_fixas}
              onChange={e => {
                this.props.onHadleChange({
                  target: {
                    name: "usar_datas_fixas",
                    value: e.target.checked
                  }
                });
                if (!e.target.checked || e.target.checked === false) {
                  this.props.onClearDataFixa();
                }
              }}>
              Usar datas fixas para vencimentos?
            </Checkbox>
          )}
        </Form.Item>
        {this.props.formData.usar_datas_fixas && (
          <div style={{ background: "#eeeeee", padding: 10 }}>

            <Form.Item label="Selecione as datas fixas de vencimento:">
              <DatePicker
                style={{ paddingBottom: 3 }}
                name="datas_fixas_picker"
                onChange={this.props.onChangeDataFixa}
                allowClear={false}
                format="DD/MM/YYYY"
                value={undefined}
              />
            </Form.Item>

            <Form.Item>
              {this.props.getFieldDecorator("venc_datas_fixas", {
                rules: [
                  {
                    required: this.props.formData.usar_datas_fixas || false,
                    message: "Este campo é obrigatório!"
                  }
                ],
                initialValue:
                  this.props.formData && this.props.formData.venc_datas_fixas
              })(
                <Select
                  onDeselect={this.props.onDeselect}
                  mode="tags"
                  name="venc_datas_fixas"
                  style={{ width: "100%" }}
                  placeholder="Utilize o campo acima para adicionar as datas"
                />
              )}
            </Form.Item>
          </div>
        )}
      </React.Fragment>
    );
  }
}

DataFixaVencimentosPedido.propTypes = {
  getFieldDecorator: PropTypes.func.isRequired,
  onHadleChange: PropTypes.func.isRequired,
  onDeselect: PropTypes.func.isRequired,
  onChangeDataFixa: PropTypes.func.isRequired,
  onClearDataFixa: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired
};
