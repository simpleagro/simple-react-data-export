import React, { Component } from "react";
import {
  Breadcrumb,
  Button,
  Icon,
  Tabs,
  Form,
  Select,
  Input,
  Affix
} from "antd";
import styled from "styled-components";
import { Link, Element, animateScroll as scroll } from "react-scroll";

import { PainelHeader } from "../PainelHeader";
import { FrmDadosBasicos } from "./frmDadosBasicos";
import { FrmPropriedades } from "./frmPropriedades";

const { TabPane } = Tabs;
const Option = Select.Option;

const BreadcrumbStyled = styled(Breadcrumb)`
  background: #eeeeee;
  height: 40px;
  margin: -24px;
  margin-bottom: 30px;
`;

const FastAccess = () => (
  <span>
    <Button style={{ marginRight: 5 }}>
      <Link
        to="dados-basicos"
        spy={true}
        smooth={true}
        offset={0}
        duration={500}
      >
        Ver dados básicos
      </Link>
    </Button>
    <Button>
      <Link
        to="propriedades"
        spy={true}
        smooth={true}
        offset={0}
        duration={500}
      >
        Ver propriedades
      </Link>
    </Button>
  </span>
);

class ClientForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openForm: this.props.openForm
    };
  }

  hideForm() {
    this.setState(prev => ({ ...prev, openForm: false }));
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };
    return (
      <div style={{ display: this.props.openForm ? "block" : "none" }}>
        <BreadcrumbStyled>
          <Breadcrumb.Item>
            <Button onClick={this.props.closeForm}>
              <Icon type="arrow-left" />
              Clientes
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Novo Cliente</Breadcrumb.Item>
        </BreadcrumbStyled>
        <PainelHeader title="Novo Cliente" extra={<FastAccess />}>
          <Button
            type="primary"
            icon="plus"
            onClick={() => this.showModal(null)}
          >
            Salvar Cliente
          </Button>
        </PainelHeader>

        <Form
          style={this.props.style}
          layout={this.props.layout}
          onChange={this.props.handleFormState}
        >
          <Element name="dados-basicos" className="element">
            <FrmDadosBasicos formData={this.props.formData} />
          </Element>

          <Element name="propriedades" className="element">
            <FrmPropriedades formData={this.props.formData} />
          </Element>
        </Form>
      </div>
    );
  }
}

const WrappepClientForm = Form.create()(ClientForm);

export default WrappepClientForm;
