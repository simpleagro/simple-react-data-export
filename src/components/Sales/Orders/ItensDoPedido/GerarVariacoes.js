import React, { Component } from "react";
import { Form, Button, Card, Spin, Select } from "antd";

class GerarVariacoes extends Component {
  state = { variacoesSelecionadas: {}, variacoes: [] };

  static getDerivedStateFromProps(props, state) {
    console.log(props, state);
    if (props.variacoes && props.variacoes.length)
      return { variacoes: props.variacoes };
    return null;
  }

  componentDidUpdate(props, state) {
    console.log("DID UPDATE");
    console.log(props, state);
  }

  gerarCardVariacao = () => {

    return (
      (this.state.variacoes.length && (
        <Card
          title="Variações do Produto"
          extra={
            <Button onClick={() => this.resetVariacoes()}>
              Limpar Variações
            </Button>
          }
          bordered
          style={{ marginBottom: 20 }}>
          {this.state.variacoes
            .sort((a, b) => (b.obrigatorio ? 1 : -1))
            .map((v, index, arr) => {
              return v.opcoes.length && this.geraVariacaoWrapper(v);
            })}
        </Card>
      )) ||
      null
    );
  };

  geraVariacaoWrapper = variacao => (
    <React.Fragment key={`variacao_fragm_${variacao.chave}`}>
      <Spin
        tip={"Carregando variações para " + variacao.label}
        key="spin_loading_inputs_variacoes"
        spinning={this.state[`loadingVariacoes_${variacao.chave}`] === true}>
        > {this.geraVariacaoItem(variacao)} variacoesinputs{" "}
      </Spin>
    </React.Fragment>
  );

  geraVariacaoItem = variacao => {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { xl: 4, xxl: 3 },
      wrapperCol: { span: 12 }
    };
    return (
      <Form.Item
        label={variacao.label}
        key={variacao.chave}
        {...formItemLayout}>
        {getFieldDecorator(variacao.chave, {
          valuePropName: "value",
          rules: [
            {
              required: variacao.obrigatorio,
              message: "Este campo é obrigatório!"
            }
          ],
          initialValue:
            this.props.formData[variacao.chave] &&
            this.props.formData[variacao.chave].label
        })(this.geraVariacaoItemSelect(variacao))}
      </Form.Item>
    );
  };

  geraVariacaoItemSelect = variacao => (
    <Select
      name={variacao.chave}
      showAction={["focus", "click"]}
      showSearch
      placeholder="Selecione..."
      onChange={e => this.variacaoItemChanged(e, variacao.chave)}>
      {variacao.opcoes.map((o, index) => (
        <Select.Option
          key={`${variacao.chave}_${index}`}
          value={JSON.stringify(o)}>
          {o.label}
        </Select.Option>
      ))}
    </Select>
  );

  variacaoItemChanged = async (ev, variacao) => {
    ev = JSON.parse(ev);

    await this.setState(prev => ({
      ...prev,
      variacoesSelecionadas: {
        ...prev.variacoesSelecionadas,
        ...{ [variacao]: ev.value }
      }
    }));

    console.log(this.state);

    this.props.handleFormState({
      target: {
        name: variacao,
        value: ev
      }
    });

    setTimeout(() => {
      this.carregaProximasVariacoes(variacao);
      window.meuState = { state: this.state, props: this.props };
    }, 0);
  };

  carregaProximasVariacoes(variacaoSelecionada) {
    this.state.variacoes
      .map((v, index, arr) => v.chave)
      .splice(
        this.state.variacoes.findIndex(v => v.chave === variacaoSelecionada) + 1
      )
      .map(v2 => {
        this.setState(prev => ({
          ...prev,
          formData: {
            ...prev.formData,
            [v2]: undefined
          }
        }));
        this.getVals(v2);
      });
  }

  getVals(chave) {
    function search(sChave) {
      return Object.keys(this).every(
        key => sChave[key] && sChave[key].value === this[key]
      );
    }

    let opcoes = JSON.parse(this.props.form.getFieldValue("produto"));
    let filtro = this.state.variacoesSelecionadas || {};

    opcoes = opcoes.variacoes.filter(search, filtro).map(c => c[chave]);

    // removendo duplicados
    let resultOpcoes = [];
    opcoes.forEach(function(item) {
      if (item && !resultOpcoes.find(r => r.value === item.value)) {
        resultOpcoes.push(item);
      }
    });

    opcoes = resultOpcoes;

    let variacoes = this.state.variacoes;
    variacoes.map(v => {
      if (v.chave === chave) v.opcoes = opcoes;
    });

    this.props.form.resetFields([chave]);
    let variacoesSelecionadas = this.state.variacoesSelecionadas;
    delete variacoesSelecionadas[chave];

    this.setState({
      variacoes,
      variacoesSelecionadas
      // mostrarResumo: true
    });
    // this.calcularResumo();
  }

  render() {
    return this.gerarCardVariacao();
  }
}

GerarVariacoes.defaultProps = {
  variacoes: []
};

export default GerarVariacoes;
