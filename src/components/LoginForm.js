import React, { Component } from "react";
import { instanceOf } from "prop-types";
import { Form, Icon, Input, Button, notification } from "antd";
import axios from "axios";
import { withCookies, Cookies } from "react-cookie";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { userLoggedIn } from "../actions/painelActions";

import { API_URL } from "../config";
import "../styles/login.css";

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}
class LoginForm extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies, location } = this.props;
    this.state = {
      token: cookies.get("token") || "",
      ...(location.state || { from: { pathname: "/" } })
    };
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    const { form } = this.props;
    form.validateFields();

    if (this.state.token) this.props.history.push("/");
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields(async (err, values) => {
      console.log(values);
      if (err) {
        console.log("Error... received values of form: ", values);
      } else {
        try {
          const url = `${API_URL}/auth/login`;
          const response = await axios.post(url, values);

          if (!response) throw new Error("Houve um erro ao logar");

          this.props.cookies.set("token", response.data.token, { path: "/" });
          this.setState({ token: response.data.token });
          console.log(this.state.from.pathname);
          this.props.history.push(this.state.from.pathname);
          this.props.userLoggedIn(response.data);
          notification.success({
            message: `Seja bem vindo, ${response.data.user.nome}`
          });
        } catch (error) {
          if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.error
          )
            notification.error({ message: error.response.data.error });
          else notification.error({ message: error.toString() });
        }
      }
    });
  };

  submitWithEnterKey(e) {
    if (e.keyCode === 13) this.handleSubmit(e);
  }

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      isFieldTouched,
      getFieldError
    } = this.props.form;

    // Only show error after a field is touched.
    const loginError = isFieldTouched("login") && getFieldError("login");
    const senhaError = isFieldTouched("senha") && getFieldError("senha");

    return (
      <div className="container">
        <div className="boxLeft">
          <img className="login-logo" src="logo.png" />
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem
              validateStatus={loginError ? "error" : ""}
              help={loginError || ""}
            >
              {getFieldDecorator("login", {
                rules: [
                  {
                    required: true,
                    message: "Por favor, informe seu login ou email."
                  }
                ]
              })(
                <Input
                  autoFocus
                  addonBefore={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="Usuário"
                />
              )}
            </FormItem>
            <FormItem
              validateStatus={senhaError ? "error" : ""}
              help={senhaError || ""}
            >
              {getFieldDecorator("senha", {
                rules: [
                  { required: true, message: "Por favor, informe sua senha." }
                ]
              })(
                <Input
                  addonBefore={
                    <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  type="password"
                  placeholder="Senha"
                />
              )}
            </FormItem>
            <FormItem>
              <Button
                htmlType="submit"
                disabled={hasErrors(getFieldsError())}
                type="primary"
                style={{ width: "100%" }}
              >
                Entrar
              </Button>
            </FormItem>
            {/* <FormItem className="text-center">
              <a href="">Esqueceu sua senha?</a>
            </FormItem> */}
          </Form>
        </div>
        <div className="boxRight" />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userLoggedIn
    },
    dispatch
  );

export default connect(
  null,
  mapDispatchToProps
)(withCookies(Form.create()(LoginForm)));
