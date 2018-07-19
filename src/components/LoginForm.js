import React, { Component } from 'react';
import { Form, Icon, Input, Button, Card } from 'antd';
import axios from "axios";
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from "react-redux";
import { userLoggedIn } from '../actions/painelActions';


import { API_URL } from "../config";
import '../styles/login.css';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class LoginForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      token: this.props.cookies.get("token") || "",
      ...this.props.location.state || { from: { pathname: "/" } }
    }
  }

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
  }

  componentWillMount() {
    if (this.state.token) this.props.history.push("/");
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(values);
      if (err) {
        console.log('Error... received values of form: ', values);
        return;
      }
      else {
        const url = API_URL + "/painel/login";

        axios.post(url, values).then(response => {
          console.log(response.data);
          this.props.cookies.set("token", response.data.token, { path: "/" });
          this.setState({ token: response.data.token });
          console.log(this.state.from.pathname);
          this.props.history.push(this.state.from.pathname);
          this.props.userLoggedIn(response.data.username);
        })
          .catch(err => alert(err.response.data));
      }

    });
  }

  submitWithEnterKey(e) {
    if (e.keyCode === 13) this.handleSubmit(e);
  }

  render() {

    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;

    // Only show error after a field is touched.
    const loginError = isFieldTouched('login') && getFieldError('login');
    const senhaError = isFieldTouched('senha') && getFieldError('senha');

    return (
      <div id="loginView">
        <Card title="Login" bordered={true} style={{ width: 300 }}>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem
              validateStatus={loginError ? 'error' : ''}
              help={loginError || ''}
            >
              {getFieldDecorator('login', {
                rules: [{ required: true, message: 'Por favor, informe seu login ou email.' }],
              })(
                <Input autoFocus addonBefore={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Usuário" />
              )}
            </FormItem>
            <FormItem
              validateStatus={senhaError ? 'error' : ''}
              help={senhaError || ''}
            >
              {getFieldDecorator('senha', {
                rules: [{ required: true, message: 'Por favor, informe sua senha.' }],
              })(
                <Input addonBefore={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Senha" onKeyDown={(e) => this.submitWithEnterKey(e)} />
              )}
            </FormItem>
            <FormItem>
              <a className="login-form-forgot" href="">Esqueceu sua senha?</a>
              <Button type="primary" htmlType="submit" className="login-form-button pull-right" disabled={hasErrors(getFieldsError())}>
                Ok </Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators({
    userLoggedIn
  }, dispatch);

export default connect(null, mapDispatchToProps)(withCookies(Form.create()(LoginForm)));
