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
const tableTitle = {
  /*backgroundColog: "ffaa00",*/
  fontWeight: "bold",
  borderStyle: "solid",
  borderWidth: 1.5,
  borderTopStyle: "none",
  borderLeftStyle: "none",
  height: 40,
  paddingTop: 10
};
const tableTitle2 = {
  /*backgroundColor: "ff00aa",*/
  fontWeight: "bold",
  borderStyle: "solid",
  borderWidth: 2,
  borderTopStyle: "none",
  borderLeftStyle: "none",
  borderBottomStyle: "none",
  height: 18.5 }
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
const bodyTopLabel = {
  fontWeight: "bold",
  paddingRight: 10
}

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

const maxLinesTable = 12

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

  addPages(pdf){
    let totalPages = this.state.list.itens && parseInt(Object.keys(this.state.list.itens).length % maxLinesTable) - 1
    console.log("total de paginas adicionais: ", totalPages)

    for(let i = 0; i < totalPages; i++){
      console.log("add new page");
      pdf.addPage('a4', 'l');
      pdf.text(20, 20, `Pagina ${i+1} de ${totalPages}`);
    }
  }

  printDocument() {
    const input = document.getElementById('divToPrint');
    html2canvas(input)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg');
        const pdf = new jsPDF('l');
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

        this.addPages(pdf);

        pdf.output('dataurlnewwindow');
        //pdf.save("download.pdf");
      })
    ;
  }

  /* #region functions setTable */
  setTable(){
    let obj = [], count =0

    this.state.list.itens &&
      this.state.list.itens.map((element, index) => (obj.push(Object.assign({
        quantidade: element.quantidade,
        embalagem: element.embalagem.label,
        descricaoProduto: element.produto.nome,
        peneira: element.peneira.label,
        tratamento: element.tratamento.label
      })), count++))

      while(this.state.list.itens && count < 12){
        obj.push(Object.assign({
          quantidade: null,
          embalagem: null,
          descricaoProduto: null,
          peneira: null,
          tratamento: null
        }))
        count++
      }

      console.log("setTable:", obj)
      return obj;
  }

  setTablePermutaSoja(){
    let obj = [], count =0

    this.state.list.itens &&
      this.state.list.itens.map((element, index) => (obj.push(Object.assign({
        valorUnit: (parseFloat(element.total_preco_item_graos)/element.quantidade).toFixed(2),
        valorTotal: element.total_preco_item_graos
      })), count++))

      while(this.state.list.itens && count < 12){
        obj.push(Object.assign({
          valorUnit: null,
          valorTotal: null
        }))
        count++
      }

      console.log("setTablePermutaSoja:", obj)
      return obj
  }

  setTableReais(){
    let obj = [], count = 0

    this.state.list.itens &&
      this.state.list.itens.map((element, index) => (obj.push(Object.assign({
        valorUnit: (parseFloat(element.total_preco_item_reais)/element.quantidade).toFixed(2),
        valorTotal: element.total_preco_item_reais
      })), count++))

      while(this.state.list.itens && count < 12){
        obj.push(Object.assign({
          valorUnit: null,
          valorTotal: null
        }))
        count++
      }

      console.log("setTableReais:", obj)
      return obj;
  }

  setFormaPagamento(){
    let obj = [], count = 0

    this.state.list.pagamento &&
      this.state.list.pagamento.parcelas.map((e, i) => (obj.push(Object.assign({
        valor_parcela: e.valor_parcela,
        data_vencimento: moment(e.data_vencimento).format("DD/MM/YYYY")
      })), count++))

      while(this.state.list.pagamento && count < 3){
        obj.push(Object.assign({valor: 0, data: 0}))
        count++
      }

      return obj
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
                  <Row>{moment(this.state.list.create_at).format("DD/MM/YYYY")}</Row>
                </Row>
                <Row style={{ height: 10 }} />
                <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", paddingBottom: 5 }}>
                  Rep. Comercial
                  <Row>{this.state.list.vendedor && this.state.list.vendedor.nome}</Row>
                </Row>
                <Row style={{ height: 10 }} />
                <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", borderBottomStyle: "none", paddingBottom: 19 }}>
                  Revenda/Agente
                  <Row>{this.state.list.tipo_venda && this.state.list.tipo_venda.toLowerCase().includes("agenciada") && this.state.list.agente ? this.state.list.agente.nome : null}</Row>
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
                    <span style={bodyTopLabel}>Cliente:</span>{this.state.list.cliente && this.state.list.cliente.nome}
                  </Row>
                  <Row>
                    <span style={bodyTopLabel}>Fazenda:</span>{this.state.list.propriedade && this.state.list.propriedade.nome}
                  </Row>
                  {/* <Row><span><b>Tel. Fixo:</b></span></Row> */}
                </Col>

                <Col span={8}>
                  <Row>
                    <span style={bodyTopLabel}>CPF/CNPJ:</span>{this.state.list.cliente && this.state.list.cliente.cpf_cnpj}
                  </Row>
                  <Row>
                    <span style={bodyTopLabel}>Município:</span>{this.state.list.cidade}
                  </Row>
                  {/* <Row><span><b>Cel./WhatsApp:</b></span></Row> */}
                </Col>

                <Col span={8}>
                  <Row>
                    <span style={bodyTopLabel}>Inscr. Estadual:</span>{this.state.list.propriedade && this.state.list.propriedade.ie}
                  </Row>
                  <Row>
                    <span style={bodyTopLabel}>UF:</span>{this.state.list.estado}
                  </Row>
                  {/* <Row><span><b>E-mail:</b></span></Row> */}
                </Col>
              </Row>

              <Row style={bodyTable}>
                <Row style={{ borderStyle: "solid", borderTopStyle: "none", textAlign: "center" }}>

                  <Col span={13}>
                    <Row>
                      <Col span={5} style={tableTitle}>Quantidade em kg</Col>
                      <Col span={4} style={tableTitle}>Embalagem</Col>
                      <Col span={6} style={tableTitle}>Descrição do Produto</Col>
                      <Col span={3} style={tableTitle}>Peneira</Col>
                      <Col span={6} style={tableTitle}>Tratamento</Col>
                    </Row>
                    <Row>
                      {this.setTable().map((element, index) => (
                        <div key={index}>
                          <Col span={5}>
                            <Row style={drawLines}>{element.quantidade}</Row>
                          </Col>

                          <Col span={4}>
                            <Row style={drawLines}>{element.embalagem}</Row>
                          </Col>

                          <Col span={6}>
                            <Row style={drawLines}>{element.descricaoProduto}</Row>
                          </Col>

                          <Col span={3}>
                            <Row style={drawLines}>{element.peneira}</Row>
                          </Col>

                          <Col span={6}>
                            <Row style={drawLines}>{element.tratamento}</Row>
                          </Col>
                        </div>
                      ))}
                    </Row>
                  </Col>

                  <Col span={6} style={{ textAlign: "center" }}>
                    <Row style={tableTitle2}>Permuta Soja</Row>
                    <Row>
                      <Col span={7} style={{ borderStyle: "solid", borderWidth: 2, borderRightStyle: "none", borderLeftStyle: "none" }}>Val. Unit</Col>
                      <Col span={17} style={{ borderStyle: "solid", borderWidth: 2 }}>Volume total</Col>
                    </Row>

                    {this.setTablePermutaSoja().map((element, index) => (
                      <div key={index}>
                        <Col span={7}><Row style={drawLines} span={6}>{element.valorUnit}</Row></Col>
                        <Col span={17}><Row style={drawLines} span={18}>{element.valorTotal}</Row></Col>
                      </div>
                    ))}

                  </Col>

                  <Col span={5} style={{ textAlign: "center" }}>
                    <Row style={tableTitle2}>Reais</Row>
                      <Row>
                        <Col span={7} style={{ borderStyle: "solid", borderWidth: 2, borderLeftStyle: "none" }}>Val. Unit</Col>
                        <Col span={17} style={{ borderStyle: "solid", borderWidth: 2, borderLeftStyle: "none" }}>Valor Total R$</Col>
                      </Row>

                      {this.setTableReais().map((element, index) => (
                        <div key={index}>
                          <Col span={7}> <Row style={drawLines} span={6}>{element.valorUnit}</Row></Col>
                          <Col span={17}> <Row style={drawLines} span={18}>{element.valorTotal}</Row></Col>
                        </div>
                      ))}

                  </Col>
                </Row>

                <Row>
                  <Col span={3} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderRightStyle: "none", height: 20 }} />
                  <Col span={10} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderRightStyle: "none", textAlign: "right", paddingRight: 10 }}><b>Totais:</b></Col>
                  <Col span={6} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", borderRightStyle: "none", height: 20, textAlign: "center" }}> {this.state.list.pagamento && this.state.list.pagamento.total_pedido_graos} </Col>
                  <Col span={5} style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", height: 20, textAlign: "center" }}> {this.state.list.pagamento && this.state.list.pagamento.total_pedido_reais} </Col>
                </Row>

                <Row style={{ paddingTop: 5 }}>
                  <Col span={9}>
                    <Row>FRETE</Row>
                    <Row>
                      <Col span={8}>
                        {this.state.list.tipo_frete && this.state.list.tipo_frete.toLowerCase() === "cif" ? <span><Col span={1} style={{...checkBoxFrete.box, ...checkBoxFrete.checked}}/>CIF</span> : null }
                      </Col>
                        {this.state.list.tipo_frete && this.state.list.tipo_frete.toLowerCase() === "cif" ? <Col span={9}>Km Frete: {this.state.list.pagamento.distancia ? this.state.list.pagamento.distancia : "_______________"}</Col> : null}
                    </Row>
                    <Row>
                      {this.state.list.tipo_frete && this.state.list.tipo_frete.toLowerCase() === "fob" ? <span><Col span={1} style={{...checkBoxFrete.box, ...checkBoxFrete.checked}}/>FOB</span> : null }
                    </Row>
                  </Col>
                  <Col span={15} style={{ borderStyle: "solid" }}>
                    <Row style={{ textAlign: "center" }}><b>Pagamento em Grãos</b></Row>
                    <Row style={drawLines}>
                      <Col span={12} style={{paddingLeft: 10}}>Volume kg: {this.state.list.pagamento && this.state.list.pagamento.peso_graos}</Col>
                      <Col span={12} style={{paddingLeft: 10}}>Vencimento: {this.state.list.pagamento && moment(this.state.list.pagamento.data_pgto_graos).format("DD/MM/YYYY")}</Col>
                    </Row>
                    <Row>
                      <Col span={12} style={{paddingLeft: 10}}>Armazém: {this.state.list.pagamento && this.state.list.pagamento.entrega_graos}</Col>
                      <Col span={12} style={{paddingLeft: 10}}>Município:</Col>
                    </Row>
                  </Col>
                </Row>
              </Row>
            </Row>

            <Row style={footerBox}>
              <Row style={footerBoxRow1}>
                <Col span={3}>Forma Pagamento:</Col>

                {this.state.list.pgto_germoplasma && this.state.list.pgto_germoplasma.toLowerCase().includes("grãos")
                    || this.state.list.pgto_royalties && this.state.list.pgto_royalties.toLowerCase().includes("grãos")
                    || this.state.list.pgto_tratamento && this.state.list.pgto_tratamento.toLowerCase().includes("grãos")
                    || this.state.list.pgto_frete && this.state.list.pgto_frete.toLowerCase().includes("grãos")
                    ? <Col span={3}>
                        <Col style={{...checkBoxFormaPagamento.checked, ...checkBoxFormaPagamento.box}} span={1} />
                        Reais + Grãos
                      </Col>

                    : <Col span={3}>
                        <Col style={{...checkBoxFormaPagamento.checked, ...checkBoxFormaPagamento.box}} span={1} />
                        Reais
                      </Col>}

              </Row>
              <Row style={footerBoxRow2} type="flex" justify="space-between">

              {this.setFormaPagamento().map((element, index) => (
                <Col key={index} span={7} style={{ borderStyle: "solid" }}>
                    <Row style={{ textAlign: "center" }}><b>Vencimento {index+1}</b></Row>
                    <Row>
                      <Col span={12} style={{paggindLeft: 10}}>R$: {element.valor_parcela}</Col>
                      <Col span={12} style={{paddingLeft: 10}}>Data: {element.data_vencimento}</Col>
                    </Row>
                </Col>
                  ))}

              </Row>
              <Row style={footerBoxRow3}>
                <Col span={2}><b>Observações:</b></Col>
                <Col span={22}>{this.state.list.observacao}</Col>
              </Row>
            </Row>
            { console.log("STATE: ", this.state) }
          </Row>
      </div>
    );
  }
}
