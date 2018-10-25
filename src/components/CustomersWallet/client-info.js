import React from "react";
import { Drawer, List, Avatar, Divider, Col, Row, Button, Layout } from "antd";
import { withRouter } from "react-router";
import { moreInfo } from "../../services/customerswallet";

const pStyle = {
  fontSize: 16,
  color: "rgba(0,0,0,0.85)",
  lineHeight: "24px",
  display: "block",
  marginBottom: 16
};

const DescriptionItem = ({ title, content }) => (
  <div
    style={{
      fontSize: 14,
      lineHeight: "22px",
      marginBottom: 7,
      color: "rgba(0,0,0,0.65)"
    }}
  >
    <p
      style={{
        marginRight: 8,
        display: "inline-block",
        color: "#333"
      }}
    >
      {title}:
    </p>
    {content}
  </div>
);

class ClientInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: props.visible };
  }

  // shouldComponentUpdate(nextProps) {
  //   console.log(nextProps);
  //   console.log(this.state);
  //   if (nextProps.visible === true && this.state.visible === false) {
  //     console.log("diferente");
  //     this.setState(prev => ({ ...prev, visible: true }));
  //     return true;
  //   } else if (nextProps.visible === false && this.state.visible === true) {
  //     this.setState(prev => ({ ...prev, visible: false }));
  //     return true;
  //   }
  //   return false;
  // }

  onClose = () => {
    this.setState(prev => ({
      ...prev,
      visible: false
    }));
  }

  render() {
    return (
      <div>
        <Drawer
          width={640}
          placement="right"
          closable={true}
          onClose={this.onClose}
          visible={this.state.visible}
          style={{ padding: 0 }}
          className="white-close"
        >
          <Layout style={{ background: "#fff" }}>
            <Layout.Header
              style={{
                position: "fixed",
                zIndex: 1,
                width: "100%",
                color: "#fff",
                paddingLeft: 20
              }}
            >
              <p>
                Informações Extras Da Carteira -{" "}
                {this.props.info && this.props.info.nome}
              </p>
            </Layout.Header>
            <Layout.Content
              style={{ padding: "0 20px", marginTop: 94, background: "#fff" }}
            >
              <h2
                style={{
                  textAlign: "center",
                  border: "1px solid #c0c0c0",
                  borderRadius: 10,
                  padding: 5,
                  marginBottom: 40
                }}
              >
                Total em carteira: 100ha
              </h2>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Nome" content="Lily" />{" "}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={() =>
                      this.props.history.push(
                        "/clientes/5bb630ba40e2a536b4d2930c/edit",
                        { returnTo: this.props.history.location }
                      )
                    }
                  >
                    Mais infos do cliente
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <DescriptionItem title="Total em área" content="100ha" />{" "}
                </Col>
              </Row>
              <Divider />
            </Layout.Content>
          </Layout>
        </Drawer>
      </div>
    );
  }
}

export default withRouter(ClientInfo);
