import React, { Component } from "react";
import { Button, Form, Select, Affix } from "antd";

import { flashWithSuccess } from "../../../common/FlashMessages";
import parseErrors from "../../../../lib/parseErrors";
import { PainelHeader } from "../../../common/PainelHeader";
import * as ProductGroupsService from "../../../../services/productgroups";
import * as OrderItemService from "../../../../services/orders.items";
import { SimpleBreadCrumb } from "../../../common/SimpleBreadCrumb";
import { SimpleLazyLoader } from "../../../common/SimpleLazyLoader";

const Option = Select.Option;

class PriceVariations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      formData: {},
      savingForm: false,
      loadingForm: true,
      order_id: this.props.match.params.order_id
    };
  }

  async componentDidMount() {
    const { id } = this.props.match.params;

    if (id) {
      const formData = await OrderItemService.get(this.state.order_id)(id);

      if (formData)
        this.setState(prev => ({
          ...prev,
          formData,
          editMode: id ? true : false
        }));
    }

    this.setState(prev => ({
      ...prev,
      loadingForm: false,
    }));

    setTimeout(() => {
      // this.titleInput.focus();
    }, 0);
  }

  handleFormState = event => {
    if (!event.target.name) return;
    let form = Object.assign({}, this.state.formData, {
      [event.target.name]: event.target.value
    });
    this.setState(prev => ({ ...prev, formData: form }));
  };

  saveForm = async e => {
    this.props.form.validateFields(async err => {
      if (err) return;
      else {
        this.setState({ savingForm: true });
        if (!this.state.editMode) {
          if (Object.keys(this.state.formData).length === 0)
            flashWithSuccess("Sem alterações para salvar", " ");

          try {
            const created = await OrderItemService.create(
              this.state.order_id
            )(this.state.formData);
            this.setState({
              openForm: false,
              formData: {},
              editMode: false
            });
            flashWithSuccess();
            this.props.history.push(
              `/pedidos/${
                this.props.match.params.order_id
              }/itens-do-pedido`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);

            this.setState({ savingForm: false });
          }
        } else {
          try {
            const updated = await OrderItemService.update(
              this.state.order_id
            )(this.state.formData);
            flashWithSuccess();
            this.props.history.push(
              `/pedidos/${
                this.props.match.params.order_id
              }/itens-do-pedido`
            );
          } catch (err) {
            if (err && err.response && err.response.data) parseErrors(err);
            console.log(
              "Erro interno ao atualizar uma variação de preço ",
              err
            );
            this.setState({ savingForm: false });
          }
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 12 }
    };

    return (
      <SimpleLazyLoader loadingForm={this.state.loadingForm}>
        <div>
          <SimpleBreadCrumb
            to={
              this.props.location.state && this.props.location.state.returnTo
                ? this.props.location.state.returnTo.pathname
                : `/pedidos/${
                    this.state.order_id
                  }/itens-do-pedido`
            }
            history={this.props.history}
          />
          <Affix offsetTop={65}>
            <PainelHeader
              title={[
                this.state.editMode ? "Editando" : "Novo",
                " Item do Pedido"
              ]}>
              <Button
                type="primary"
                icon="save"
                onClick={() => this.saveForm()}
                loading={this.state.savingForm}>
                Salvar Item do Pedido
              </Button>
            </PainelHeader>
          </Affix>

          <Form onChange={this.handleFormState}>
          </Form>
        </div>
      </SimpleLazyLoader>
    );
  }
}

const WrappepPriceVariations = Form.create()(PriceVariations);

export default WrappepPriceVariations;
