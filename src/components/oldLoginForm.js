import React from "react";
import { Form, Icon, Input, Button, Checkbox } from 'antd';
import styled from 'styled-components';
import axios from "axios";
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';

const FormItem = Form.Item;

const Style = styled.div`
.Aligner{
    display: flex;
    align-items: center;
    min-height: 100vh;
    justify-content: center;
}
.Aligner-item--fixed {
  flex: none;
  max-width: 50%;
}
 .login-form {
    max-width: 300px;
    margin: 0 auto;
  }
  .login-form-forgot {
    float: right;
  }
  .login-form-button {
    width: 100%;
  }
`;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

const DemoBox = props => <p style={{ height: 400, width: 400, background: "red" }}>{props.children}</p>;


class NormalLoginForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      token: this.props.cookies.get("token") || ""
    }
  }

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
    console.log(this.props.cookies.get("token"));

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
        const url = 'http://localhost:3000/painel/login';

        axios.post(url, values).then(response => {
          console.log(response);
          this.props.cookies.set("token", response.data.token, { path: "/" });
          // this.setState({token : response.data.token});
        });
      }
    });
  }
  render() {
    const { getFieldDecorator, getFieldsError, isFieldTouched, getFieldError } = this.props.form;
    // Only show error after a field is touched.
    const loginError = isFieldTouched('login') && getFieldError('login');
    const senhaError = isFieldTouched('senha') && getFieldError('senha');
    console.log(this.state);
    return (
      <Style>
        <div class="Aligner">
          <div class="Aligner-item Aligner-item--fixed">
            <Form onSubmit={this.handleSubmit} className="login-form">
              <FormItem
                validateStatus={loginError ? 'error' : ''}
                help={loginError || ''}
              >
                {getFieldDecorator('login', {
                  rules: [{ required: true, message: 'Por favor, informe seu login ou email.' }],
                })(
                  <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Login" />
                )}
              </FormItem>
              <FormItem
                validateStatus={senhaError ? 'error' : ''}
                help={senhaError || ''}
              >
                {getFieldDecorator('senha', {
                  rules: [{ required: true, message: 'Por favor, informe sua senha.' }],
                })(
                  <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Senha" />
                )}
              </FormItem>
              <FormItem>


                {/* {getFieldDecorator('lembrar', {
                              valuePropName: 'checked',
                              initialValue: true,
                          })(
                              <Checkbox>Lembre-se de mim</Checkbox>
                          )}
                          <a className="login-form-forgot" href="">Esqueceu sua senha?</a> */}

                <Button type="primary" htmlType="submit" className="login-form-button" disabled={hasErrors(getFieldsError())}>
                  Ok </Button>
                {/* Ou <a href="">Registre-se</a> */}
              </FormItem>
            </Form>
          </div>
        </div>
      </Style>
      //   <Style>
      //     
      //   </Style>
    );
  }
}

export default withCookies(Form.create()(NormalLoginForm));
