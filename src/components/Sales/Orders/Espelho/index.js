import React, { Component } from 'react';
import { Row, Col, Affix, Button } from "antd";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import * as OrderService from "services/orders";
import * as UnitService from "services/units-measures";
import moment from "moment";
import { currency, getNumber, fatorConversaoUM } from "common/utils"
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";
import { PainelHeader } from "common/PainelHeader";

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
const divToPrintStryle = {
  /*backgroundColor: "lightblue",*/
  width: "295mm"
}
const pageStyle = {
  /*backgroundColor: 'lightgray',*/
  height: "210mm",
  width: "295mm",
  marginLeft: 'auto',
  marginRight: 'auto',
  fontSize: 12,
  paddingLeft: 5,
  paddingTop: 15,
  paddingRight: 15,
  fontVariant: "normal"
  //marginBottom: 50
}

const headerBox = {
  /*backgroundColor: "#b2cdff",*/
  height: 170
};
const headerBoxCompanie = {
  /*backgroundColor: "#ffaa3a",*/
  height: 170,
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
  height: 325
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
  height: 150
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

/* #region Components */
const Header = (props) => (
  <Row style={headerBox}>

    <Col span={13} style={ headerBoxCompanie }>
      <Col span={15} style={{ paddingTop: 10}}>
        <Row><img alt="logo" src={empresa.logo} style={{ height: 90 }} /></Row>
        <Row style={{ fontSize: 9, paddingLeft: 5 }}>{empresa.endereco_faz}</Row>
        <Row style={{ fontSize: 9, paddingLeft: 5 }}>{empresa.endereco_esc}</Row>
        <Row style={{ fontSize: 9, paddingLeft: 5 }}>{empresa.complemento} - {empresa.site}</Row>
      </Col>

      <Col span={9} style={{ textAlign: "center" }}>
        <Row style={{ paddingTop: 25, fontWeight: "bold" }}>{empresa.nome}</Row>
        <Row style={{ paddingTop: 5 }}>Insc. Est. {empresa.ie}</Row>
        <Row style={{ paddingTop: 5 }}>CNPJ: {empresa.cnpj}</Row>
        <Row style={{ paddingTop: 5, fontWeight: "bold" }}>{empresa.telefone}</Row>
        <Row>{empresa.site}</Row>
      </Col>
    </Col>

    <Col span={7} style={ headerBoxDate }>
      <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", paddingBottom: 5 }}>
        Data de Emissão
        <Row>{props.dataEmissao}</Row>
      </Row>
      <Row style={{ height: 10 }} />
      <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", paddingBottom: 5 }}>
        Rep. Comercial
        <Row>{props.repComercial}</Row>
      </Row>
      <Row style={{ height: 10 }} />
      <Row style={{ textAlign: "center", borderStyle: "solid", borderLeftStyle: "none", borderRightStyle: "none", borderBottomStyle: "none", paddingBottom: 19 }}>
        Revenda/Agente
        <Row>{props.revendaAgente}</Row>
      </Row>
    </Col>

    <Col span={4} style={ headerBoxOrder }>
      <Row style={{fontWeight: "bold"}}>Pedido</Row>
      <Row style={{fontSize: 20}}>{props.pedido}</Row>
    </Col>

  </Row>
)

const ClientLine = (props) => (
  <Row style={bodyRowTop}>
    <Col span={8}>
      <Row><span style={bodyTopLabel}>Cliente:</span>{props.cliente}</Row>
      <Row><span style={bodyTopLabel}>Fazenda:</span>{props.fazenda}</Row>
    </Col>

    <Col span={8}>
      <Row><span style={bodyTopLabel}>CPF/CNPJ:</span>{props.cpf_cnpj}</Row>
      <Row><span style={bodyTopLabel}>Município:</span>{props.municipio}</Row>
    </Col>

    <Col span={8}>
      <Row><span style={bodyTopLabel}>Inscr. Estadual:</span>{props.inscrEstadual}</Row>
      <Row><span style={bodyTopLabel}>UF:</span>{props.uf}</Row>
    </Col>
  </Row>
)

const TableLinesLeft = (props) => (
  <Row>
    <Col span={5}>
      <Row style={drawLines}>{fatorConversaoUM(props.arr_unidades, props.data.embalagem, 'kg') === "erro"
        ? props.data.quantidade * 1
        : props.data.quantidade * fatorConversaoUM(props.arr_unidades, props.data.embalagem, 'kg') }
      </Row>

    </Col>

    <Col span={4}>
      <Row style={drawLines}>{props.data.embalagem}</Row>
    </Col>

    <Col span={6}>
      <Row style={drawLines}>{props.data.descricaoProduto}</Row>
    </Col>

    <Col span={3}>
      <Row style={drawLines}>{props.data.peneira}</Row>
    </Col>

    <Col span={6}>
      <Row style={drawLines}>{props.data.tratamento}</Row>
    </Col>
  </Row>
)

const TableLinesRight = (props) => (
  <div>
    <div>
      <Col span={7}><Row style={drawLines} span={6}>{props.coluna === "PS" ? props.data.valorUnitPS : props.data.valorUnitR}</Row></Col>
      <Col span={17}><Row style={drawLines} span={18}>{props.coluna === "PS" ? props.data.valorTotalPS : props.data.valorTotalR}</Row></Col>
    </div>
  </div>
)

const Parcel = props => (
  <Col span={7} style={{ borderStyle: "solid" }}>
    <Row style={{ textAlign: "center", fontWeight: "bold" }}>Vencimento</Row>
    <Row>
      <Col span={11} style={{marginLeft: 10}}>R$: {props.parcelaValor}</Col>
      <Col span={11} style={{marginLeft: 10}}>Data: {props.parcelaData}</Col>
    </Row>
  </Col>
)

const Footer = (props) => (
  <Row style={footerBox}>

    <Row style={footerBoxRow1}>
      <Col span={3}>Forma Pagamento:</Col>
        <Col span={3}>
          <Col style={{...checkBoxFormaPagamento.checked, ...checkBoxFormaPagamento.box}} span={1} /> {props.formaPagamento}
        </Col>
    </Row>

    <Row style={footerBoxRow2} type="flex" justify="space-between">
      {props.parcelas.map((element, index) => <Parcel key={index} parcelaData={element.data_vencimento} parcelaValor={element.valor_parcela} /> )}
    </Row>

    <Row style={footerBoxRow3}>
      <Col span={2} style={{fontWeight: "bold"}}>Observações:</Col>
      <Col span={22}>{props.observacoes}</Col>
    </Row>

    <Row style={{textAlign: "center", paddingTop: 30, fontWeight: "bold"}}>
      <Row>_______________________________________________________________________________</Row>
      <Row>{props.cliente}</Row>
    </Row>

  </Row>
)
/* #endregion */

const maxLinesTable = 10

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
    const dataUnit = await UnitService.list();

    this.setState(prev => ({
      ...prev,
      list: data,
      listUnit: dataUnit.docs,
      pagination: []
    }));
  }

  setTable2(){
    let obj = [], count = 0, max = maxLinesTable, newObj = [], posInit = 0, posEnd = max

    this.state.list.itens &&
      this.state.list.itens.map((element) => (obj.push(Object.assign({
        quantidade: element.quantidade,
        embalagem: element.embalagem.label,
        descricaoProduto: element.produto.nome,
        peneira: element.peneira.label,
        tratamento: element.tratamento.label,
        valorUnitPS: element.quantidade && element.total_preco_item_graos ? currency()(getNumber(element.total_preco_item_graos)/element.quantidade) : null,
        valorTotalPS: element.total_preco_item_graos,
        valorUnitR: element.quantidade && element.total_preco_item_graos ? currency()(getNumber(element.total_preco_item_reais)/element.quantidade) : null,
        valorTotalR: element.total_preco_item_reais
      })), count++))

    count = 0

    while(count < obj.length){
      if(count % max === 0){
        newObj.push(obj.slice(posInit, posEnd))
        posInit = posEnd
        posEnd = posEnd + max
      }
      count++
    }

    for(let i = 0; i < newObj.length; i++){
      if(newObj[i].length < maxLinesTable){
        for(let j = newObj[i].length; j < maxLinesTable; j++){
          newObj[i].push(Object.assign({
            quantidade: null,
            embalagem: null,
            descricaoProduto: null,
            peneira: null,
            tratamento: null,
            valorUnitPS: null,
            valorTotalPS: null,
            valorUnitR: null,
            valorTotalR: null
          }))
        }
      }
    }
    return newObj
  }

  setFormaPagamento(){
    let obj = [], count = 0

    this.state.list.pagamento &&
      this.state.list.pagamento.parcelas.map((element) => (obj.push(Object.assign({
        valor_parcela: element.valor_parcela,
        data_vencimento: moment(element.data_vencimento).format("DD/MM/YYYY")
      })), count++))

    while(this.state.list.pagamento && count < 3){
      obj.push(Object.assign({valor: 0, data: 0}))
      count++
    }
    return obj
  }

  printDocument() {
    const input = document.getElementById('divToPrint');
    html2canvas(input, { width: 1200, height: 1588, scale: 3, logging: false })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg');
        //const pdf = new jsPDF('l');
        //pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

        var imgWidth = 297;
        var pageHeight = 210;
        var imgHeight = canvas.height * imgWidth / canvas.width;
        var heightLeft = imgHeight;
        var add = 27

        var pdf = new jsPDF("l");
        var positionY = 0;
        var positionX = 12;

        pdf.addImage(imgData, 'JPEG', positionX, positionY, imgWidth, imgHeight + add);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          positionY = heightLeft - imgHeight;
          if(input.offsetHeight > 794){
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', positionX, positionY, imgWidth, imgHeight + add);
          }
          heightLeft -= pageHeight;
        }
        pdf.output('dataurlnewwindow');
        //pdf.save("download.pdf");
      })
    ;
  }

  render() {
    return (
      <div>

        <div>
          <SimpleBreadCrumb
            to={
              this.props.location.state && this.props.location.state.returnTo
                ? this.props.location.state.returnTo.pathname
                : "/pedidos"
            }
            history={this.props.history}
          />
        </div>

        <Affix offsetTop={65}>
          <PainelHeader title="Visualização do Espelho">
            <Button
              type="primary"
              icon="file-text"
              onClick={async () => await this.printDocument()}>
                Gerar PDF
            </Button>
          </PainelHeader>
        </Affix>


        <Row style={{ textAlign: "center", fontWeight: "bold" }}>Total de Paginas: {this.setTable2().length}</Row>

        <div id="divToPrint" style={divToPrintStryle}>

          {this.setTable2().map((page, indexPage) => (
            <Row key={indexPage} style={pageStyle}>

              <Header
                dataEmissao={moment(this.state.list.create_at).format("DD/MM/YYYY")}
                repComercial={this.state.list.vendedor && this.state.list.vendedor.nome}
                revendaAgente={this.state.list.tipo_venda && this.state.list.tipo_venda.toLowerCase().includes("agenciada") && this.state.list.agente ? this.state.list.agente.nome : null}
                pedido={this.state.list.numero}
              />

              <ClientLine
                cliente={this.state.list.cliente && this.state.list.cliente.nome}
                cpf_cnpj={this.state.list.cliente && this.state.list.cliente.cpf_cnpj}
                inscrEstadual={this.state.list.propriedade && this.state.list.propriedade.ie}
                fazenda={this.state.list.propriedade && this.state.list.propriedade.nome}
                municipio={this.state.list.cidade}
                uf={this.state.list.estado}
              />

              <Row style={bodyBox}>
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
                      {page.map((pageItem, indexPI) => ( <TableLinesLeft key={indexPI} data={pageItem} arr_unidades={this.state.listUnit && this.state.listUnit} /> ))}
                    </Col>

                    <Col span={6} style={{ textAlign: "center" }}>
                      <Row style={tableTitle2}>Permuta Soja</Row>
                      <Row>
                        <Col span={7} style={{ borderStyle: "solid", borderWidth: 2, borderRightStyle: "none", borderLeftStyle: "none" }}>Val. Unit</Col>
                        <Col span={17} style={{ borderStyle: "solid", borderWidth: 2 }}>Volume total</Col>
                      </Row>
                      {page.map((pageItem, indexPI) => ( <TableLinesRight key={indexPI} data={pageItem} coluna={"PS"} /> ))}
                    </Col>

                    <Col span={5} style={{ textAlign: "center" }}>
                      <Row style={tableTitle2}>Reais</Row>
                        <Row>
                          <Col span={7} style={{ borderStyle: "solid", borderWidth: 2, borderLeftStyle: "none" }}>Val. Unit</Col>
                          <Col span={17} style={{ borderStyle: "solid", borderWidth: 2, borderLeftStyle: "none" }}>Valor Total R$</Col>
                        </Row>
                        {page.map((pageItem, indexPI) => ( <TableLinesRight key={indexPI} data={pageItem} coluna={"R"} /> ))}
                    </Col>
                  </Row>

                  <Row>
                    <Col style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", height: 20, borderRightStyle: "none", textAlign: "right", paddingRight: 10, fontWeight: "bold" }} span={13}>Totais:</Col>
                    <Col style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", height: 20, borderRightStyle: "none", textAlign: "center" }} span={6}> {this.state.list.pagamento && this.state.list.pagamento.total_pedido_graos} </Col>
                    <Col style={{ borderStyle: "solid", borderWidth: 2, borderTopStyle: "none", height: 20, textAlign: "center" }} span={5}> {this.state.list.pagamento && this.state.list.pagamento.total_pedido_reais} </Col>
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
                      <Row style={{ textAlign: "center", fontWeight: "bold" }}>Pagamento em Grãos</Row>
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

              <Footer
                cliente={this.state.list.cliente && this.state.list.cliente.nome}
                observacoes={this.state.list.observacao}
                parcelas={this.setFormaPagamento()}
                formaPagamento={ this.state.list.pgto_germoplasma && this.state.list.pgto_germoplasma.toLowerCase().includes("grãos")
                || this.state.list.pgto_royalties && this.state.list.pgto_royalties.toLowerCase().includes("grãos")
                || this.state.list.pgto_tratamento && this.state.list.pgto_tratamento.toLowerCase().includes("grãos")
                || this.state.list.pgto_frete && this.state.list.pgto_frete.toLowerCase().includes("grãos")
                  ? "Reais + Grãos"
                  : "Reais" }
              />
            </Row>
            ))}
          </div>
          {/* { console.log("STATE: ", this.state) }
          { console.log("PROPS: ", this.props) } */}
      </div>
    );
  }
}
