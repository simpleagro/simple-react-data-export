import React, { Component } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { Layout, Menu, Icon } from 'antd';
import { withCookies, Cookies } from 'react-cookie';
import { instanceOf } from 'prop-types';


import LoginForm from './LoginForm';
import Home from './Home';
import Teste from './Teste';

const { Header, Content, Footer, Sider } = Layout;

const StyledLayout = styled(Layout) `
    .logo{
        height: 32px;
        background: rgba(255,255,255,.2);
        margin:16px;
    }
    .trigger{
        font-size: 18px;
        line-height: 64px;
        padding: 0 24px;
        cursor: pointer;
        transition: color .3s;
    }
    .trigger::hover{
        color: #1890ff;
    }
`;

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
    return (
        <StyledLayout>
          <Layout>
            <Sider trigger={null}
              collapsible
              collapsed={this.state.collapsed}
              style={{ overflow: 'auto', height: '100vh' }}>
              <div className='logo' />
              <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                <Menu.Item key="1">
                  <Icon type="user" />
                  <span className="nav-text">nav 1</span>
                </Menu.Item>
              </Menu>
            </Sider>
            <Layout>
              <Header style={{ background: '#fff', padding: 0 }}>
                <Icon
                  className="trigger"
                  type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
                  onClick={this.toggle}
                />
              </Header>
              <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
                {/* <Router> */}
                <Route path="/" exact component={Home} />
                <Route path="/teste" component={Teste}/>
                {/* </Router> */}
              </Content>
              <Footer style={{ textAlign: 'center' }}>
                Ant Design ©2016 Created by Ant UED
                        </Footer>
            </Layout>
          </Layout>
        </StyledLayout>
    );
  }
}

export default withCookies(Painel);
