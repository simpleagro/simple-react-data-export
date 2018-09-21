import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Layout, Menu, Icon, Dropdown, Button, Affix } from "antd";
import { withCookies, Cookies } from "react-cookie";
import { instanceOf } from "prop-types";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../styles/painel.css";
import { menus } from "../config/menus";

const { Header, Content, Footer, Sider } = Layout;

const MenuHeader = () => (
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
      collapsed: false,
      siderWidth: 236,
      marginContent: 236,
      headerContent: 236
    };
  }

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
      marginContent: this.state.collapsed ? 236 : 80,
      headerContent: this.state.collapsed ? 236 : 80
    });
  };

  showMenu = mOnlyAccess => {
    if (mOnlyAccess && mOnlyAccess.length > 0)
      return !!mOnlyAccess.find(access => access === this.props.userType);

    return true;
  };

  render() {
    let { pathname: location } = window.location;
    location = `/${location.split("/")[1]}`;

    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          id="menuLeft"
          trigger={null}
          width={this.state.siderWidth}
          collapsible
          collapsed={this.state.collapsed}
          style={{
            overflow: "auto",
            height: "100vh",
            position: "fixed",
            left: 0
          }}
        >
          <div
            className="logo"
            style={{ backgroundImage: "url(logo-branca.png)" }}
          />

          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["/"]}
            selectedKeys={[location]}
          >
            {Object.keys(menus).map(mKey => {
              const { path: mPath, icon: mIcon, label: mLbl, showMenu } = menus[
                mKey
              ];

              return (
                !!this.showMenu(menus[mKey].onlyAccess) &&
                showMenu === true && (
                  <Menu.Item key={mKey}>
                    <Link to={mPath}>
                      <FontAwesomeIcon icon={mIcon} size="lg" />
                      <span className="nav-text">{mLbl}</span>
                    </Link>
                  </Menu.Item>
                )
              );
            })}
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: this.state.marginContent }}>
          <Header
            className="painel-header"
            style={{ marginLeft: this.state.headerContent }}
          >
            <div style={{ float: "left" }}>
              <Icon
                className="trigger"
                type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                onClick={this.toggle}
              />
            </div>
            <div style={{ float: "right", marginRight: 15 }}>
              <Dropdown overlay={<MenuHeader />}>
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
              margin: "85px 16px 0",
              padding: 24,
              background: "#fff"
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

const mapStateToProps = ({ painelState }) => {
  return {
    username: painelState.userData.user.nome,
    userType: painelState.userData.user.usertype
  };
};

export default withRouter(connect(mapStateToProps)(withCookies(Painel)));