import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Layout, Menu, Icon, Dropdown, Button, Affix } from "antd";
import { withCookies, Cookies } from "react-cookie";
import { instanceOf } from "prop-types";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../styles/painel.css";
import Menus from "../config/menus";
console.log(Menus);

const { Header, Content, Footer, Sider } = Layout;

const menu = (
  <Menu>
    <Menu.Item>
      <Link to="/meu-perfil">
        {" "}
        <Icon type="user" /> Meu Perfil
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link to="/logout">
        {" "}
        <Icon type="logout" /> Sair{" "}
      </Link>
    </Menu.Item>
  </Menu>
);

class Painel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsed: false
    };
  }

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    const { pathname: location } = window.location;
    return (
      <Layout>
        <Sider
          trigger={null}
          width="236px"
          collapsible
          collapsed={this.state.collapsed}
          style={{ overflow: "auto", height: "100vh" }}
        >
          <div className="logo" style={{ backgroundImage: "url(logo-branca.png)" }} />

          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["/"]}
            selectedKeys={[location]}
          >
            {Menus.map(m => (
              <Menu.Item key={m.key}>
                <Link to={m.link}>
                  <FontAwesomeIcon icon={m.icon} size="lg" />
                  <span className="nav-text">{m.label}</span>
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout>
          <Header
            className="painel-header"
            style={{ background: "#fff", padding: 0 }}
          >
            <div style={{ float: "left" }}>
              <Icon
                className="trigger"
                type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                onClick={this.toggle}
              />
            </div>
            <div style={{ float: "right", marginRight: 15 }}>
              <Dropdown overlay={menu}>
                <Button className="no-border" ghost>
                  {this.props.username}
                  <FontAwesomeIcon
                    style={{ marginLeft: 8 }}
                    size="lg"
                    icon="caret-down"
                  />
                </Button>
              </Dropdown>
            </div>
          </Header>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              background: "#fff",
              minHeight: 280
            }}
          >
            {/* <Router> */}
            {this.props.children}
            {/* </Router> */}
          </Content>
          <Footer style={{ textAlign: "center" }}>SimpleAgro ©2018</Footer>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = ({ painelState }) => ({
  username: painelState.username
});

export default withRouter(connect(mapStateToProps)(withCookies(Painel)));
