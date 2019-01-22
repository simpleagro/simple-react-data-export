import React from "react";
import PropTypes from "prop-types";
import { Tooltip, Form, InputNumber } from "antd";
import debounce from "lodash/debounce";

export const SFFPorcentagem = props => {
  return (
    <Form.Item label={props.label} {...props.formItemLayout}>
      {props.getFieldDecorator(props.name, {
        rules: [
          { required: props.required, message: "Este campo é obrigatório!" }
        ],
        initialValue: props.initialValue || 0
      })(
        <Tooltip title="Informe de 0 a 100 se houver desconto">
          <InputNumber
            step={0.01}
            min={0}
            max={1}
            formatter={value => value * 100}
            parser={value => value.replace("%", "").replace(",", ".") / 100}
            onChange={e => {
              props.handleFormState({
                target: { name: props.name, value: e }
              });

              if (props.trigger) {
                const trigger = debounce(props.trigger, 400);
                trigger();
              }
            }}
            style={{ width: 200 }}
          />{" "}
          %
        </Tooltip>
      )}
    </Form.Item>
  );
};

SFFPorcentagem.propTypes = {
  label: PropTypes.string,
  getFieldDecorator: PropTypes.func.isRequired,
  required: PropTypes.bool,
  handleFormState: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

SFFPorcentagem.defaultProps = {
  label: "Desconto",
  required: false,
  step: 0.01,
  min: 0,
  max: 1,
  formatter: value => `${value * 100}`,
  parser: value => value.replace("%", "").replace(",", ".") / 100
};
