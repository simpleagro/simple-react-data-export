import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "antd";

export default class FormBase extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleFormState = this.handleFormState.bind(this);
  }

  handleFormState(event) {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  }

  // handleSubmit(event) {
  //     event.preventDefault();

  //     if (Object.entries(this.state).length === 0) return;

  //     if (this.props.isAjax === true) {
  //         axios[this.props.method](this.props.action || "", this.state);
  //     }
  //     else
  //         event.target.submit();

  // }

  render() {
    return (
      <Form onChange={this.handleFormState}>{this.props.children}</Form>
    );
  }
}

Form.propTypes = {
  saveForm: PropTypes.func
};
