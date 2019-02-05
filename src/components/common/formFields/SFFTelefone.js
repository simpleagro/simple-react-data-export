import React, { Component } from "react";
import { Input, Form } from "antd";
import ReactInputMask from "react-input-mask";
import PropTypes from "prop-types";

class SFFTelefone extends Component {
  render() {
    console.log(this.props);
    const mask =
      this.props.initialValue && this.props.initialValue.replace(/\D/g, "").length <= 10
        ? "(99) 9999-9999?"
        : "(99) 99999-9999";
    return (
      <Form.Item label={this.props.label} {...this.props.formItemLayout}>
        {this.props.getFieldDecorator(this.props.name, {
          rules: [
            {
              required: this.props.required,
              message: "Este campo é obrigatório!"
            }
          ],
          initialValue: this.props.initialValue
        })(
          <ReactInputMask
            mask={mask}
            formatChars={this.props.formatChars}
            maskChar={this.props.maskChar}
            disabled={this.props.disabled}>
            {inputProps => <Input name={this.props.name} {...inputProps} />}
          </ReactInputMask>
        )}
      </Form.Item>
    );
  }
}

SFFTelefone.propTypes = {
  label: PropTypes.string,
  getFieldDecorator: PropTypes.func.isRequired,
  required: PropTypes.bool,
  handleFormState: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  initialValue: PropTypes.string,
};

SFFTelefone.defaultProps = {
  formatChars: { 9: "[0-9]", "?": "[0-9 ]" },
  maskChar: null,
  disabled: false,
  initialValue: "",
};

export default SFFTelefone;
