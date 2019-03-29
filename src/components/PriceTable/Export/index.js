import React, { Component } from "react";
import { Button, Row, Col } from "antd";

import * as PriceTableService from "services/pricetable";
import * as GroupFeaturesService from "services/productgroups.mobile";
import { PainelHeader } from "common/PainelHeader";
import { SimpleBreadCrumb } from "common/SimpleBreadCrumb";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SimpleTable from "common/SimpleTable";
import { formatDate } from 'common/utils'
import { simpleTableSearch } from "lib/simpleTableSearch"

import { CSVLink } from "react-csv";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import moment from "moment";



class ExportPriceTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loadingData: true,
      pagination: {
        showSizeChanger: true,
        defaultPageSize: 10,
        pageSizeOptions: ["10", "25", "50", "100"]
      }
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    const data = await PriceTableService.list({limit: "-1"});
    const dataGF = await GroupFeaturesService.list({fields: "-produtos",limit: "-1"})

    this.setState(prev => ({
      ...prev,
      list: data.docs,
      listGF: dataGF.docs,
      loadingData: false,
      pagination: {
        total: data.total
      }
    }));
  }

  async componentDidMount() {
    await this.initializeList();
  }

  setList(){
    let obj = [], max = 23, st = 0, end = max, total = this.state.list.length/max

    for(let i = 0; i < total; i++){
      obj.push(this.state.list.slice(st, end))
      st = end
      end = end + max
    }
    return obj
  }

  printDocument() {
    const input = document.getElementById('divToPrint');
    html2canvas(input, { width: 1200, height: 1588, scale: 3, logging: false })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg');

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

  contructObj(ele){
    let obj = [], newObj = []
    let nome = ""

    ele.map((el, i) => (
      obj.push({ grupo_produto_nomes: nome.concat(el.grupo_produto.map((gp) => gp.nome))}),
      newObj.push(Object.assign(obj[i], el))
    ))
    //this.state.list.forEach((element, i) => {
    //  newObj.push(Object.assign(obj[i], element))
    //});
    return newObj
  }

  async toCsv(){
    let obj = [], newObj = {}
    const dataSafra = await PriceTableService.list({fields: "_id,safra", limit: "-1"})

    // Gerando novas chaves para adicionar ao objeto
    this.state.list && this.state.list.map((el, ind) => (
      Object.keys(el).map((e, i) => (obj.push(ind + "_" + e)))
    ))

    obj.forEach((element) => {
      newObj[element] = "Vazio"
      console.log("element", element)
    });

    console.log("newObj",newObj)
    console.log("dataSafra", dataSafra)

  }

  showMgs(){
    console.log(this.state.listGF)
  }

  render() {
    return (
      <div>
        <div>
          <SimpleBreadCrumb
            to={
              this.props.location.state && this.props.location.state.returnTo
                ? this.props.location.state.returnTo.pathname
                : "/tabela-preco"
            }
            history={this.props.history}
          />
        </div>
        <PainelHeader title="Exportar">
          <Button
            type="secundary"
            icon="file-text"
            style={{ marginRight: 10 }}
            onClick={ () => this.showMgs() }
          >
            Console
          </Button>
          <Button
            type="secundary"
            icon="file-text"
            style={{ marginRight: 10 }}
            onClick={ () => this.toCsv() }
          >
            {/* <CSVLink
              data={this.state.list}
              separator={";"}
              filename="tabela_preco.csv"
            >
              Exportar para CSV
            </CSVLink> */}
          </Button>
          <Button
            type="primary"
            icon="file-pdf"
            style={{ marginRight: 10 }}
            onClick={ async () => (await this.printDocument()) }
          >
            Exportar para PDF
          </Button>
        </PainelHeader>

        <div id="divToPrint" style={divToPrintStryle}>
          {this.state.list && this.setList().map((ele, ind) => (
            <Row key={ind} style={ pageStyle }>
              <TableHeaderTitle key={ind} />
              {this.contructObj(ele).map((el, i) => (
                <TableBody
                  key={i}
                  nome={el.nome}
                  safra={el.safra.descricao}
                  data_base={el.data_base ? moment(el.data_base).format("DD/MM/YYYY") : "--"}
                  moeda={el.moeda}
                  versao={el.versao}
                  grupo_produto={el.grupo_produto_nomes}
                />
              ))}
            </Row>
          ))}
        </div>
        { console.log(this.state) }
      </div>
    );
  }
}

/* #redion CSS*/
const divToPrintStryle = {
  /*backgroundColor: "lightblue",*/
  width: "295mm"
}
const pageStyle = {
  /*backgroundColor: 'lightgray',*/
  fontVariant: "normal",
  height: "210mm",
  width: "295mm",
  marginLeft: 'auto',
  marginRight: 'auto',
  fontSize: 12,
  paddingLeft: 5,
  paddingTop: 15,
  paddingRight: 15,
  color: "black",
  fontWeight: 600
  //marginBottom: 50,
}
/* #endrerion */

/* #redion COMPONENTS*/
const TableHeaderTitle = () => (
  <div>
    <Row style={{ textAlign: "center", fontWeight: "bold", fontSize: 20 }}> Tabela de Preço </Row>
    <Row style={{ backgroundColor: "lightgray", textAlign: "center", marginTop: 10 }}>
      <Col style={{ fontWeight: "bold", borderWidth: 1, borderStyle: "solid", padding: 5 }} span={4}>Nome</Col>
      <Col style={{ fontWeight: "bold", borderWidth: 1, borderStyle: "solid", padding: 5 }} span={4}>Safra</Col>
      <Col style={{ fontWeight: "bold", borderWidth: 1, borderStyle: "solid", padding: 5 }} span={3}>Data Base</Col>
      <Col style={{ fontWeight: "bold", borderWidth: 1, borderStyle: "solid", padding: 5 }} span={3}>Moeda</Col>
      <Col style={{ fontWeight: "bold", borderWidth: 1, borderStyle: "solid", padding: 5 }} span={2}>Versao</Col>
      <Col style={{ fontWeight: "bold", borderWidth: 1, borderStyle: "solid", padding: 5 }} span={6}>Grupo de Produto</Col>
      <Col style={{ fontWeight: "bold", borderWidth: 1, borderStyle: "solid", padding: 5 }} span={2}>Itens</Col>
    </Row>
  </div>
)

const TableBody = props => (
  <Row style={{ textAlign: "center" }}>
    <Col style={{ borderWidth: 1, borderStyle: "solid", padding: 5 }} span={4}>{props.nome}</Col>
    <Col style={{ borderWidth: 1, borderStyle: "solid", padding: 5 }} span={4}>{props.safra}</Col>
    <Col style={{ borderWidth: 1, borderStyle: "solid", padding: 5 }} span={3}>{props.data_base}</Col>
    <Col style={{ borderWidth: 1, borderStyle: "solid", padding: 5 }} span={3}>{props.moeda}</Col>
    <Col style={{ borderWidth: 1, borderStyle: "solid", padding: 5 }} span={2}>{props.versao}</Col>
    <Col style={{ borderWidth: 1, borderStyle: "solid", padding: 5 }} span={6}>{props.grupo_produto}</Col>
    <Col style={{ borderWidth: 1, borderStyle: "solid", padding: 5 }} span={2}>--</Col>
  </Row>
)
/* #endrerion */


export default ExportPriceTable;
