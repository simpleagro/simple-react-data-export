import React from "react";
import PropTypes from "prop-types";
import { Tooltip, Form, Input } from "antd";
import debounce from "lodash/debounce";
import { currency, getNumber, addMaskReais } from "common/utils";

export const SFFPorcentagem = props => {
  return (
    <Tooltip title={props.helpText}>
      <span>
        <Form.Item label={props.label} {...props.formItemLayout}>
          {props.getFieldDecorator(props.name, {
            rules: [
              { required: props.required, message: "Este campo é obrigatório!" }
            ],
            initialValue: addMaskReais(props.initialValue),
            getValueFromEvent: e => addMaskReais(e.target.value),
            onChange: e => {
              if (e.target) {
                const handleFormState = debounce(props.handleFormState, 300);
                handleFormState({
                  target: {
                    name: e.target.name,
                    value: addMaskReais(e.target.value)
                  }
                });

                if (props.trigger) {
                  const trigger = debounce(props.trigger, props.delay);
                  trigger(addMaskReais(e.target.value));
                }
              } else return false;
            }
          })(<Input suffix="%" disabled={props.disabled} readOnly={props.readOnly} name={props.name} />)}
        </Form.Item>
        {/* <Form.Item label={props.label} {...props.formItemLayout}>
          {props.getFieldDecorator(props.name, {
            rules: [
              { required: props.required, message: "Este campo é obrigatório!" }
            ]
          })(
            <span>
              <Input
              value={props.initialValue || 0}
                disabled={props.disabled}
                step={0.01}
                min={0}
                max={1}
                formatter={props.formatter}
                parser={props.parser}
                onChange={e => {
                  props.handleFormState({
                    target: { name: props.name, value: e }
                  });

                  if (props.trigger) {
                    const trigger = debounce(props.trigger, props.delay);
                    trigger(e);
                  }
                }}
                style={{ width: "90%" }}
              />{" "}
              %
            </span>
          )}
        </Form.Item> */}
      </span>
    </Tooltip>
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
  delay: 300,
  disabled: false,
  readOnly: false,
  label: "Desconto",
  required: false
};
