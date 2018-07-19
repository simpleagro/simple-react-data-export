import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom'
import { Layout, Menu, Icon, Dropdown, Button } from 'antd';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';
import { connect } from 'react-redux';

import "../styles/painel.css";

const { Header, Content, Footer, Sider } = Layout;

const menu = (
  <Menu>
    <Menu.Item>
      <Link to="/meu-perfil"> <Icon type="user" /> Meu Perfil</Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/logout"> <Icon type="logout" /> Sair </Link>
    </Menu.Item>
  </Menu>
);

class Painel extends Component {

  constructor(props) {
    super(props);

    this.state = {
      collapsed: false,
    };

  }

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const { pathname: location } = window.location;
    console.log(location);
    return (
      <Layout>
        <Sider trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          style={{ overflow: 'auto', height: '100vh' }}>
          <div className='logo' style={{ backgroundImage: 'url(logo.png)' }} />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['/']}
            selectedKeys={[location]}>
            <Menu.Item key="/entidades">
              <Link to="/entidades">
                <Icon type="file" />
                <span className="nav-text">Entidades</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="/modulos">
              <Link to="/modulos">
                <Icon type="appstore-o" />
                <span className="nav-text">Módulos</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <div style={{ float: 'left' }}>
              <Icon
                className="trigger"
                type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                onClick={this.toggle}
              />
            </div>
            <div style={{ float: 'right', marginRight: 15 }}>
              <Dropdown overlay={menu} placement="bottomRight">
                <Button><Icon type="smile-o" />{this.props.username}</Button>
              </Dropdown>
            </div>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            {/* <Router> */}
            {this.props.children}
            {/* </Router> */}
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            SimpleAgro ©2018
            </Footer>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = ({ painelState }) => ({
  username: painelState.username
});

export default withRouter(connect(mapStateToProps)(withCookies(Painel)));
