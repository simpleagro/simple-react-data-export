import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Layout, Menu, Icon, Dropdown, Button } from "antd";
import { withCookies, Cookies } from "react-cookie";
import { instanceOf } from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { version } from "../../package.json";
import moment from "moment";
import "moment/locale/pt-br";

import "../styles/painel.css";
import { menus } from "../config/menus";
import { logout } from "../services/auth";
import { userSwitchedModule } from "../actions/painelActions";
import SeletorModuloOpcoes from "../config/modulos";

const { Header, Content, Footer, Sider } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

const MenuHeader = () => (
  <Menu>
    <Menu.Item>
      <Link to="/meu-perfil">
        {" "}
        <Icon type="user" /> Meu Perfil
      </Link>
    </Menu.Item>
    <Menu.Item>
      <Link
        to="#"
        onClick={e => {
          e.preventDefault();
          logout();
        }}>
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
      siderWidth: 256,
      marginContent: 256,
      headerContent: 256
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

  showMenu = (mOnlyAccess, subject) => {
    if (this.props.userType === "SuperUser") return true;

    if (subject)
      return this.props.permissoes.some(p => {
        if (p.subject === "all") return true;
        else if (
          p.subject === subject &&
          (p.actions.includes("read") || p.actions.includes("manage"))
        )
          return true;
      });

    return false;
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
          className="ant-menu-image">
          <div
            className="logo"
            style={{ backgroundImage: "url(logo-branca.png)" }}
          />

          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["/"]}
            selectedKeys={[location]}>
            {Object.keys(menus).map(modulo => {
              {
                if (modulo === this.props.seletorModulo.slug)
                  return Object.keys(menus[modulo]).map(mKey => {
                    const {
                      path: mPath,
                      icon: mIcon,
                      label: mLbl,
                      showMenu,
                      submenu = false,
                      subKey,
                      subIcon,
                      subTitle,
                      subs = []
                    } = menus[modulo][mKey];

                    if (
                      submenu &&
                      !!this.showMenu(
                        menus[modulo][mKey].onlyAccess,
                        menus[modulo][mKey].rule
                      ) &&
                      showMenu === true
                    )
                      return (
                        <SubMenu
                          key={subKey}
                          title={
                            <span>
                              <FontAwesomeIcon icon={subIcon} size="lg" />
                              <span className="nav-text">{subTitle}</span>
                            </span>
                          }>
                          {subs.map(sub => (
                            <Menu.Item key={sub.key}>
                              <Link to={sub.path}>
                                <FontAwesomeIcon icon="angle-right" />
                                <span className="nav-text">{sub.label}</span>
                              </Link>
                            </Menu.Item>
                          ))}
                        </SubMenu>
                      );

                    if (
                      !submenu &&
                      !!this.showMenu(
                        menus[modulo][mKey].onlyAccess,
                        menus[modulo][mKey].rule
                      ) &&
                      showMenu === true
                    )
                      return (
                        <Menu.Item key={mKey}>
                          <Link to={`${mPath}`}>
                            <FontAwesomeIcon icon={mIcon} size="lg" />
                            <span className="nav-text">{mLbl}</span>
                          </Link>
                        </Menu.Item>
                      );
                  });
              }
            })}
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: this.state.marginContent }}>
          <Header
            className="painel-header"
            style={{ marginLeft: this.state.headerContent }}>
            <div style={{ float: "left" }}>
              <Icon
                className="trigger"
                type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                onClick={this.toggle}
              />
              <Dropdown
                overlay={<SeletorModuloOpcoes />}
                disabled={this.props.permitirTrocarModulo}>
                <Button>
                  {this.props.seletorModulo.nome}
                  <FontAwesomeIcon
                    style={{ marginLeft: 8 }}
                    size="lg"
                    icon="caret-down"
                  />
                </Button>
              </Dropdown>
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
            }}>
            {/* <Router> */}
            {this.props.children}
            {/* </Router> */}
          </Content>
          <Footer style={{ textAlign: "center" }}>
            SimpleAgro ©{moment().format("YYYY")} - v.
            {version}
          </Footer>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = ({ painelState }) => {
  if (
    !painelState.userData.modulosDaEmpresa ||
    !painelState.seletorModulo ||
    !(painelState.userData && painelState.userData.rules)
  )
    window.location.href = "logout";
  return {
    userType:
      (painelState &&
        painelState.userData &&
        painelState.userData.user &&
        painelState.userData.user.usertype) ||
      "",
    username:
      (painelState &&
        painelState.userData &&
        painelState.userData.user &&
        painelState.userData.user.nome) ||
      "",
    seletorModulo: painelState.seletorModulo || null,
    permitirTrocarModulo:
      painelState.userData &&
      painelState.userData.modulosDaEmpresa &&
      painelState.userData.modulosDaEmpresa.length <= 1,
    permissoes: painelState.userData && painelState.userData.rules
  };
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userSwitchedModule
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withCookies(Painel))
);
