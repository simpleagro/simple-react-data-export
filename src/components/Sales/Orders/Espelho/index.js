import React, { Component } from 'react';
import { Row, Col } from "antd";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import * as OrderService from "services/orders";
import moment from "moment";

/* #region company */
const empresa = {
  logo: "./ssf_logo.PNG",
  nome: "Sementes Sao Francisco Ltda.",
  endereco_faz: "Fazenda  São  Francisco,  BR  060, Km 422 à direita 65 Km - Zona Rural - Rio Verde-GO",
  endereco_esc: "Escritório Rua Ana Mota, 174 - Bairro Santo Antônio - Caixa Postal nº 337",
  complemento: "CEP 75 906-360 - Rio Verde - GO",
  site: "www.sementessaofrancisco.com.br",
  ie: "10.549.711-8",
  cnpj: "09.022.330/0001-52",
  telefone: "64 2101-2900"
}
/* #endregion */

/* #region CSS */
const pageStyle = {
  // backgroundColor: '#f5f5f5',
  height: "210mm",
  width: "295mm",
  marginLeft: 'auto',
  marginRight: 'auto',
  fontSize: 12,
  paddingLeft: 15,
  paddingTop: 15,
  paddingRight: 15
}

const headerBox = {
  /*backgroundColor: "#b2cdff",*/
  height: 150
};
const headerBoxCompanie = {
  /*backgroundColor: "#ffaa3a",*/
  height: "100%",
  borderStyle: "solid",
  borderBottomStyle: "none"
};
const headerBoxDate = {
  /*backgroundColor: "#ffc77f",*/
  height: "100%"
};
const headerBoxOrder = {
  /*backgroundColor: "#ffd6a0",*/
  height: "100%",
  textAlign: "center",
  borderStyle: "solid",
  borderBottomStyle: "none",
  paddingTop: 5
};

const bodyBox = {
  /*backgroundColor: "#b2ffeb",*/
  height: 475
};
const bodyRowTop = {
  /*backgroundColor: "#ff6868",*/
  borderStyle: "solid",
  padding: 5
};
const bodyTable = {
  /*backgroundColor: "#ff9393"*/
};

const checkBoxFrete = {
  box: {
    width: 20,
    height: 20,
    borderStyle: "solid",
    marginRight: 5
  },
  checked: {
    backgroundColor: "gray"
  }
}
const checkBoxFormaPagamento = {
  box: {
    width: 35,
    height: 20,
    borderStyle: "solid",
    marginRight: 5
  },
  checked: {
    backgroundColor: "gray"
  }
}
const drawLines = {
  borderStyle: "solid",
  borderWidth: .5,
  borderLeftStyle: "none",
  borderTopStyle: "none",
  borderRightStyle: "solid",
  height: 18.5
};

const footerBox = {
  /*backgroundColor: "#b2ffb8",*/
  height: 170
};
const footerBoxRow1 = {
  /*backgroundColor: "#9fff72",*/
  padding: 20,
  borderStyle: "solid",
  borderBottomStyle: "none"
};
const footerBoxRow2 = {
  /*backgroundColor: "#7dc65b"*/
};
const footerBoxRow3 = {
  /*backgroundColor: "#639e48",*/
  padding: 10,
  borderStyle: "solid",
  marginTop: 1
};
/* #endregion */

export default class Export extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      list: {}
    };
  }

  async componentDidMount() {
    const id = this.props.match.params.order_id;
    const data = await OrderService.get(id);

    this.setState(prev => ({
      ...prev,
      list: data
    }));

  }

  printDocument() {
    const input = document.getElementById('divToPrint');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF('l');
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        pdf.output('dataurlnewwindow');
        //pdf.save("download.pdf");
      })
    ;
  }

  /* #region functions setTable */
  setTableQuantidade(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element) =>
        (obj.push(element.quantidade), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTableEmbalagem(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element) =>
        (obj.push(element.embalagem.label), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTableDescricaoProduto(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element) =>
        (obj.push(element.produto.nome), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTablePeneira(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element) =>
        (obj.push(element.peneira.label), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTableTratamento(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element) =>
        (obj.push(element.tratamento.label), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTablePermutaSojaValUnit() {
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element, index) => (obj.push((parseFloat(element.total_preco_item_graos)/element.quantidade).toFixed(2)), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTablePermutaSojaVolumeTotal(){
    let obj = [], count = 0
    this.state.list.itens &&
      this.state.list.itens.map((element, index) => (obj.push(element.total_preco_item_graos), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTableReaisValUnit(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element, index) => (obj.push((parseFloat(element.total_preco_item_reais)/element.quantidade).toFixed(2)), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }

  setTableReaisValorTotal(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element, index) => (obj.push(element.total_preco_item_reais), count++))

    while(count < 12){
      obj.push(0)
      count++
    }

    return obj;
  }
  /* #endregion */

  render() {
    return (
      <div>

        <div className="mb5">
          <button onClick={async () => this.printDocument()}>Print</button>
        </div>

          <Row style={pageStyle} id="divToPrint">

            <Row style={headerBox}>
              <Col span={13} style={ headerBoxCompanie }>
                <Col span={15} style={{ paddingTop: 10}}>
                  <Row><img alt="logo" src={empresa.logo} style={{ height: 90 }} /></Row>
                  <Row style={{ fontSize: 9, paddingLeft: 5 }}>{empresa.endereco_faz}</Row>
                  <Row style={{ fontSize: 9, paddingLeft: 5 }}>{empresa.endereco_esc}</Row>
                  <Row style={{ fontSize: 9, paddingLeft: 5 }}>{empresa.complemento} - {empresa.site}</Row>
                </Col>
                <Col span={9} style={{ textAlign: "center" }}>
                  <Row style={{ paddingTop: 25 }}><b>{empresa.nome}</b></Row>
                  <Row style={{ paddingTop: 5 }}>Insc. Est. {empresa.ie}</Row>
                  <Row style={{ paddingTop: 5 }}>CNPJ: {empresa.cnpj}</Row>
                  <Row style={{ paddingTop: 5 }}><b>{empresa.telefone}</b></Row>
                  <Row>{empresa.site}</Row>
                </Col>
              </Col>
              <Col span={7} style={ headerBoxDate }>
                <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", paddingBottom: 5 }}>
                  Data de Emissão
                  <Row>DATA_EMISSAO</Row>
                </Row>
                <Row style={{ height: 10 }} />
                <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", paddingBottom: 5 }}>
                  Rep. Comercial
                  <Row>{this.state.list.vendedor && this.state.list.vendedor.nome}</Row>
                </Row>
                <Row style={{ height: 10 }} />
                <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", borderBottomStyle: "none", paddingBottom: 19 }}>
                  Revenda/Agente
                  <Row>{this.state.list.tipo_venda && this.state.list.tipo_venda.toLowerCase().includes("agenciada") && this.state.list.agente.nome}</Row>
                </Row>
              </Col>
              <Col span={4} style={ headerBoxOrder }>
                <Row><b>Pedido</b></Row>
                <Row style={{fontSize: 20}}>{this.state.list.numero}</Row>
              </Col>
            </Row>

            <Row style={bodyBox}>
              <Row style={bodyRowTop}>
                <Col span={8}>
                  <Row>
                    <span><b>Cliente:</b>{this.state.list.cliente && this.state.list.cliente.nome}</span>
                  </Row>
                  <Row>
                    <span><b>Fazenda:</b>{this.state.list.propriedade && this.state.list.propriedade.nome}</span>
                  </Row>
                  {/* <Row><span><b>Tel. Fixo:</b></span></Row> */}
                </Col>

                <Col span={8}>
                  <Row>
                    <span><b>CPF/CNPJ:</b>{this.state.list.cliente && this.state.list.cliente.cpf_cnpj}</span>
                  </Row>
                  <Row>
                    <span><b>Município:</b>{this.state.list.cidade}</span>
                  </Row>
                  {/* <Row><span><b>Cel./WhatsApp:</b></span></Row> */}
                </Col>

                <Col span={8}>
                  <Row>
                    <span><b>Inscr. Estadual:</b>{this.state.list.propriedade && this.state.list.propriedade.ie}</span>
                  </Row>
                  <Row>
                    <span><b>UF:</b>{this.state.list.estado}</span>
                  </Row>
                  {/* <Row><span><b>E-mail:</b></span></Row> */}
                </Col>
              </Row>

              <Row style={bodyTable}>
                <Row style={{ borderStyle: "solid", borderTopStyle: "none", textAlign: "center" }}>
                  <Col span={3}>
                    <Row style={{ borderStyle: "solid", borderWidth: 1.5, borderTopStyle: "none", borderLeftStyle: "none", height: 40, paddingTop: 10 }}><b>Quantidade (em kg)</b></Row>
                    {this.setTableQuantidade().map((element, index) => (<Row key={index} style={drawLines}>{element}</Row>))}
                  </Col>


                  <Col span={2}>
                    <Row style={{ borderStyle: "solid", borderWidth: 1.5, borderTopStyle: "none", borderLeftStyle: "none", height: 40, paddingTop: 10 }}><b>Embalagem</b></Row>
                    {this.setTableEmbalagem().map((element, index) => (<Row key={index} style={drawLines}>{element}</Row>))}
                  </Col>

                  <Col span={4}>
                    <Row style={{ borderStyle: "solid", borderWidth: 1.5, borderTopStyle: "none", borderLeftStyle: "none", height: 40, paddingTop: 10 }}><b>Descrição do Produto</b></Row>
                    {this.setTableDescricaoProduto().map((element, index) => (<Row key={index} style={drawLines}>{element}</Row>))}
                  </Col>

                  <Col span={1}>
                    <Row style={{ borderStyle: "solid", borderWidth: 1.5, borderTopStyle: "none", borderLeftStyle: "none", height: 40, textAlign: "center", paddingTop: 10 }}><b>Peneira</b></Row>
                    {this.setTablePeneira().map((element, index) => (<Row key={index} style={drawLines}>{element}</Row>))}
                  </Col>

                  <Col span={3}>
                    <Row style={{ borderStyle: "solid", borderWidth: 1.5, borderTopStyle: "none", borderLeftStyle: "none", height: 40, paddingTop: 10 }}><b>Tratamento</b></Row>
                    {this.setTableTratamento().map((element, index) => (<Row key={index} style={drawLines}>{element}</Row>))}
                  </Col>
                  <Col span={6} style={{ textAlign: "center" }}>
                    <Row style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderBottomStyle: "none", height: 18.5, borderLeftStyle: "none" }}><b>Permuta Soja</b></Row>
                    <Row>
                      <Col span={7} style={{ borderStyle: "solid", borderWidth: 2, borderRightStyle: "none", borderLeftStyle: "none" }}>Val. Unit</Col>
                      <Col span={17} style={{ borderStyle: "solid", borderWidth: 2 }}>Volume total</Col>
                    </Row>

                    <Col span={7}>
                      {this.setTablePermutaSojaValUnit().map((element, index) => (<Row key={index} style={drawLines} span={6}>{element}</Row>))}
                    </Col>
                    <Col span={17}>
                      {this.setTablePermutaSojaVolumeTotal().map((element, index) => (<Row key={index} style={drawLines} span={18}>{element}</Row>))}
                    </Col>
                  </Col>

                  <Col span={5} style={{ textAlign: "center" }}>
                    <Row style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderLeftStyle: "none", borderBottomStyle: "none", height: 18.5 }}><b>Reais</b></Row>
                      <Row>
                        <Col span={7} style={{ borderStyle: "solid", borderWidth: 2, borderLeftStyle: "none" }}>Val. Unit</Col>
                        <Col span={17} style={{ borderStyle: "solid", borderWidth: 2, borderLeftStyle: "none" }}>Valor Total R$</Col>
                      </Row>

                      <Col span={7}>
                      {this.setTableReaisValUnit().map((element, index) => (<Row key={index} style={drawLines} span={6}>{element}</Row>))}
                    </Col>
                    <Col span={17}>
                      {this.setTableReaisValorTotal().map((element, index) => (<Row key={index} style={drawLines} span={18}>{element}</Row>))}
                    </Col>

                  </Col>
                </Row>

                <Row>
                  <Col span={3} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderRightStyle: "none", height: 20 }} />
                  <Col span={10} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderRightStyle: "none", textAlign: "right", paddingRight: 10 }}><b>Totais:</b></Col>
                  <Col span={6} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderRightStyle: "none", height: 20, textAlign: "center" }}> {this.state.list.total_pedido_graos} </Col>
                  <Col span={5} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", height: 20, textAlign: "center" }}> {this.state.list.total_pedido_reais} </Col>
                </Row>

                <Row style={{ paddingTop: 5 }}>
                  <Col span={9}>
                    <Row>FRETE</Row>
                    <Row>
                      <Col span={8}>
                        <Col span={1} style={this.state.list.tipo_frete === "CIF" ? {...checkBoxFrete.checked, ...checkBoxFrete.box} : checkBoxFrete.box}/> CIF
                      </Col>
                      <Col span={9}>Km Frete: {this.state.list.tipo_frete === "CIF" ? this.state.list.pagamento.distancia : "_______________"}</Col>
                    </Row>
                    <Row>
                      <Col span={1} style={this.state.list.tipo_frete === "FOB" ? {...checkBoxFrete.checked, ...checkBoxFrete.box} : checkBoxFrete.box}/> FOB
                    </Row>
                  </Col>
                  <Col span={15} style={{ borderStyle: "solid" }}>
                    <Row style={{ textAlign: "center" }}><b>Pagamento em Grãos</b></Row>
                    <Row style={drawLines}>
                      <Col span={12} style={{paddingLeft: 10}}>Volume kg: {this.state.list.peso_graos}</Col>
                      <Col span={12} style={{paddingLeft: 10}}>Vencimento: {moment(this.state.list.data_pgto_graos).format("DD/MM/YYYY")}</Col>
                    </Row>
                    <Row>
                      <Col span={12} style={{paddingLeft: 10}}>Armazém: {this.state.list.entrega_graos}</Col>
                      <Col span={12} style={{paddingLeft: 10}}>Município:</Col>
                    </Row>
                  </Col>
                </Row>
              </Row>
            </Row>

            <Row style={footerBox}>
              <Row style={footerBoxRow1}>
                <Col span={3}>Forma Pagamento:</Col>
                <Col span={3}>
                  <Col style={(this.state.list.pgto_germoplasma && this.state.list.pgto_germoplasma.toLowerCase().includes("grãos")
                    && this.state.list.pgto_royalties && this.state.list.pgto_royalties.toLowerCase().includes("grãos")
                    && this.state.list.pgto_tratamento && this.state.list.pgto_tratamento.toLowerCase().includes("grãos")
                    && this.state.list.pgto_frete && this.state.list.pgto_frete.toLowerCase().includes("grãos"))
                    ? {...checkBoxFormaPagamento.checked, ...checkBoxFormaPagamento.box}
                    : checkBoxFormaPagamento.box} span={1}/>
                  Reais
                </Col>
                {/* <Col span={3}>
                  <Col style={checkBoxFormaPagamento} span={1}/>
                  Grãos
                </Col> */}
                <Col span={3}>
                <Col style={(this.state.list.pgto_frete && this.state.list.pgto_frete.toLowerCase() === "reais"
                       && this.state.list.pgto_germoplasma && this.state.list.pgto_germoplasma.toLowerCase() === "reais"
                       && this.state.list.pgto_royalties && this.state.list.pgto_royalties.toLowerCase() === "reais"
                       && this.state.list.pgto_tratamento && this.state.list.pgto_tratamento.toLowerCase() === "reais")
                    ? {...checkBoxFormaPagamento.checked, ...checkBoxFormaPagamento.box}
                    : checkBoxFormaPagamento.box} span={1}/>
                  Reais + Grãos
                </Col>
              </Row>
              <Row style={footerBoxRow2} type="flex" justify="space-between">
                <Col span={7} style={{ borderStyle: "solid" }}>
                  <Row style={{ textAlign: "center" }}><b>Vencimento 1</b></Row>
                  <Row>
                    <Col span={12} style={{paddingLeft: 10}}>R$ {this.state.list.pagamento && this.state.list.pagamento.parcelas[0].valor_parcela}</Col>
                    <Col span={12} style={{paddingLeft: 10}}>Data: {this.state.list.pagamento && moment(this.state.list.pagamento.parcelas[0].data_vencimento).format("DD/DD/YYYY")}</Col>
                  </Row>
                </Col>
                <Col span={7} style={{ borderStyle: "solid", marginLeft: 0, marginRight: 0 }}>
                  <Row style={{ textAlign: "center" }}><b>Vencimento 2</b></Row>
                  <Row>
                    <Col span={12} style={{paddingLeft: 10}}>R$ {this.state.list.pagamento && this.state.list.pagamento.parcelas[1].valor_parcela}</Col>
                    <Col span={12} style={{paddingLeft: 10}}>Data: {this.state.list.pagamento && moment(this.state.list.pagamento.parcelas[1].data_vencimento).format("DD/MM/YYYY")}</Col>
                  </Row>
                </Col>
                <Col span={7} style={{ borderStyle: "solid" }}>
                  <Row style={{ textAlign: "center" }}><b>Vencimento 3</b></Row>
                  <Row>
                    <Col span={12} style={{paddingLeft: 10}}>R$ {this.state.list.pagamento && this.state.list.pagamento.parcelas[2].valor_parcela}</Col>
                    <Col span={12} style={{paddingLeft: 10}}>Data: {this.state.list.pagamento && moment(this.state.list.pagamento.parcelas[2].data_vencimento).format("DD/MM/YYYY")}</Col>
                  </Row>
                </Col>
              </Row>
              <Row style={footerBoxRow3}>
                <Col span={2}><b>Observações:</b></Col>
                <Col span={22}>{this.state.list.observacao}</Col>
              </Row>
            </Row>
          </Row>
      </div>
    );
  }
}
