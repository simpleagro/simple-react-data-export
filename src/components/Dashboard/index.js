import React, { Component } from "react";

import { PainelHeader } from "common/PainelHeader";
import * as ClientService from "services/clients";
import * as CustomerWalletService from "services/customerswallet";
import * as QuotaService from "services/quotas";
import * as TargetService from "services/targets";
import * as VisitService from "services/visits";

import moment from "moment";
import { Select, Card, Row, Col } from "antd";
import { Legend, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Bar, BarChart, LabelList } from 'recharts';

const Option = Select.Option;
const colors = ["#4286f4", "#41f4d9", "#41f462", "#a9f441", "#41c4f4", "#4af441"];

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      arrClientArea: [],
      arrClientCreditLimit: [],
      arrClientProps: [],
      arrCustomerWallet: [],
      arrProps: [],
      arrQuota: [],
      arrTarget: [],
      arrVisitasMes: [],
      listClient: [],
      listCustomerWallet: [],
      listQuota: [],
      listTarget: [],
      listVisit: [],
      listYears: [],
      loadingData: true
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    this.setState({
      loadingData: false
    });

    this.showAllClientArea();
    this.showAllClientCredit();

    this.showAllProps();

    this.showAllCustomerWallet();
    this.showAllQuotaChart();

    this.showAllTargetChart();
    this.showAllVisitsMonth();

    console.log( this.state );

  }

  async componentDidMount() {
    const dataClient = await ClientService.list({ limit: 999999 });
    const dataCustomerWallet = await CustomerWalletService.list({ limit: 999999 });
    const dataQuota = await QuotaService.list({ limit: 999999 });
    const dataTarget = await TargetService.list({ limit: 999999 });
    const dataVisit = await VisitService.list({ limit: 999999 });

    this.setState({
      listClient: dataClient.docs,
      listCustomerWallet: dataCustomerWallet.docs,
      listQuota: dataQuota.docs,
      listTarget: dataTarget.docs,
      listVisit: dataVisit.docs
    });
    await this.initializeList();

  }

  showAllProps(){
    let obj = [];
    Object.assign(obj, this.state.listClient.map(client =>
      ({
        name: client.nome,
        qtdProps: client.propriedades.length
      })
    ))
    this.setState({ arrProps: obj });
  }

  showAllVisitsMonth(paramYear){
    let sumMonths = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    let years = [];
    let month, year, yearsArray;
    let actualDate = new Date();
    let compYear = actualDate.getFullYear();
    let arrVisitas = [
      { name: "Jan", fullName: "Janeiro", index: 1 }, { name: "Fev", fullName: "Fevereiro", index: 2 }, { name: "Mar", fullName: "Março", index: 3 },
      { name: "Abr", fullName: "Abril", index: 4 }, { name: "Mai", fullName: "Maio", index: 5 }, { name: "Jun", fullName: "Junho", index: 6 },
      { name: "Jul", fullName: "Julho", index: 7 }, { name: "Ago", fullName: "Agosto", index: 8 }, { name: "Set", fullName: "Setembro", index: 9 },
      { name: "Out", fullName: "Outrubro", index: 10 }, { name: "Nov", fullName: "Novembro", index: 11 }, { name: "Dez", fullName: "Dezembro", index: 12 }
    ];

    if(paramYear){
      compYear = paramYear
    }

    this.setState({ ano: compYear });

    this.state.listVisit.map(v => (
      years.push(year = new Date(moment(v.data_agenda, "DD/MM/YYYY").format("MM/DD/YYYY")).getFullYear()),
      month = new Date(moment(v.data_agenda, "DD/MM/YYYY").format("MM/DD/YYYY")), month.getFullYear() === compYear
        ? sumMonths[month.getMonth()]++
        : null));

    arrVisitas.forEach((element, index) => {
      Object.assign(element, { qtdVisitas: Number(sumMonths[index]) })});

    yearsArray = years.filter( function( elem, index, years ){
      return years.indexOf(elem) === index
    }).sort().reverse()

    this.setState({
      arrVisitasMes: arrVisitas,
      listYears: yearsArray
    });
  }

  sum(num, total) {
    return num + total;
  }

  showAllClientArea() {
    let arrClientArea = [];
    Object.assign(
      arrClientArea, this.state.listClient && this.state.listClient.map(client =>
        ({
          name: client.nome,
          areaTotal: client.propriedades && client.propriedades.map(p => p.area).reduce(this.sum)
        })
      )
    );
    this.setState({ arrClientArea: arrClientArea });
  }

  showAllClientCredit() {
    let arrClient = [];
    Object.assign(
      arrClient, this.state.listClient && this.state.listClient.map(client =>
        ({
          name: client.nome,
          value: Number(client.credito)
        })
      )
    );
    this.setState({ arrClientCreditLimit: arrClient });
  }

  showAllCustomerWallet() {
    let arrCustomerWallet = [];
    Object.assign(
      arrCustomerWallet, this.state.listCustomerWallet && this.state.listCustomerWallet.map(cw =>
        ({
          name: cw.nome,
          totalClientes: cw.clientes.length
        })
      )
    );
    this.setState({ arrCustomerWallet: arrCustomerWallet });
  }

  showAllQuotaChart() {
    let arrQuota = [];
    let totalCotas = 0;
    this.state.listQuota && this.state.listQuota.map((q, index) => (totalCotas++));
    Object.assign(arrQuota, {
      value: totalCotas
    });
    this.setState({ arrQuota: arrQuota });
  }

  showAllTargetChart() {
    let arrTarget = [];
    let totalMetas = 0;
    this.state.listTarget && this.state.listTarget.map((t, index) => (totalMetas++));
    Object.assign(arrTarget, {
      value: totalMetas
    });
    this.setState({ arrTarget: arrTarget });
  }

  showClientProps(client){
    if(client !== "all"){
      let obj = []
      Object.assign(obj, this.state.listClient.map(c => c.nome === client ? { name: c.nome, qtdProps: c.propriedades.length } : null))
      this.setState({ arrProps: obj })
      console.log(obj)
    } else {
      this.showAllProps()
    }
  }

  showCreditLimitClient(client){
    if (client !== "all"){
      let obj = []
      this.state.listClient.map(c =>
        c.nome === client ? obj.push(Object.assign({name: c.nome, value: Number(c.credito)})) : null)
      this.setState({ arrClientCreditLimit: obj })
    } else {
      this.showAllClientCredit()
    }
  }

  showClientArea(client){
    if(client !== "all"){
        let obj = []
        this.state.listClient.map(c =>
          c.nome === client && c.propriedades.map(p =>
            obj.push(Object.assign({ name: p.nome, areaTotal: Number(p.area) }))))
        this.setState({ arrClientArea: obj })
        console.log(obj)
      } else {
        this.showAllClientArea()
      }
  }

  showCustomerWallet(client){
    if(client !== "all"){
      let obj = [];
      let count = 0;
      this.state.listCustomerWallet.map(cw => cw.nome === client && cw.clientes.map(c => count++))
      obj.push(Object.assign({ name: client, totalClientes: count }))
      this.setState({ arrCustomerWallet: obj })
    } else {
      this.showAllCustomerWallet()
    }
  }

  showVisitsMonth(paramMonth, paramYear){
    this.state.listVisit.map(visit => (
      Number(visit.data_agenda.split("/")[1]) === paramMonth && Number(visit.data_agenda.split("/")[2]) === paramYear
        ? console.log("Clientes visitados no mes", paramMonth, "de", paramYear, ":", visit.cliente.nome)
        : null
      )
    )
  }

  // showTeste(paramClient){
  //   if(paramClient.length === 0){
  //     this.showAllClientArea()
  //   } else {
  //     let obj = []
  //     paramClient.forEach((element) =>
  //       this.state.listClient.map((cliente) => (
  //         cliente.nome === element && cliente.propriedades.map((prop) => (
  //           obj.push(Object.assign({ nameClient: cliente.nome, name: prop.nome, areaTotal: prop.area }))
  //         ))
  //       ))
  //     )
  //     console.log("obj",obj)
  //     this.setState({ arrClientArea: obj })
  //   }
  // }

  render() {
    return (
      <div>
        <PainelHeader title="Dashboard" />
        <Row gutter={16}>
          <Col span={12}>
            <Card
              title="Crédito por Cliente"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione um cliente"
                    style={{ paddingLeft: 10, width: 250 }}
                    onSelect={(e) => this.showCreditLimitClient(e)}>
                      <Option key="all" value="all"> Exibir Todos </Option>
                      { this.state.listClient.map((cliente) => <Option key={cliente.nome} value={cliente.nome}>{cliente.nome}</Option>) }
                  </Select>
                </div>
              }>
                {/* <LineChart width={525} height={300} data={this.state.arrClientCreditLimit} margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                  <CartesianGrid strokeDasharray="10 0"/>
                  <XAxis dataKey="name" />
                  <YAxis dataKey="value" />
                  <Line type="monotone" dataKey="value" stroke="blue" activeDot={{r: 4}} />
                  <Tooltip />
                </LineChart> */}

                <PieChart
                  width={400}
                  height={400}
                  margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                  <Pie
                    isAnimationActive
                    data={this.state.arrClientCreditLimit}
                    dataKey="value"
                    outerRadius={100}
                    label
                    onClick={e => this.showCreditLimitClient(e.name)}>
                    { this.state.arrClientCreditLimit.map((entry, index) =>
                      <Cell key={index} fill={colors[index % colors.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              title="Área por Cliente"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione um cliente..."
                    style={{ paddingLeft: 10, width: 250 }}
                    onSelect={e => this.showClientArea(e)} >
                      <Option key="all" value="all"> Exibir Todos </Option>
                      { this.state.listClient.map((cliente) =>
                        <Option key={cliente.nome} value={cliente.nome}> {cliente.nome} </Option>)}
                  </Select>
                </div>}>
                <PieChart
                  width={400}
                  height={400}
                  margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                    <Pie
                      isAnimationActive
                      data={this.state.arrClientArea}
                      dataKey="areaTotal"
                      outerRadius={100}
                      label
                      onClick={e => this.showClientArea(e.name)}>
                      { this.state.arrClientArea.map((entry, index) => (
                        <Cell key={index} fill={colors[index % colors.length]} />)) }
                    </Pie>
                    <Tooltip />
                  </PieChart>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card
              title="Cotas"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione uma cota"
                    style={{ paddingLeft: 10, width: 250 }}
                    onSelect={e => console.log(e)}>
                      <Option key="all" value="all"> Exibir Todos </Option>
                      { this.state.listQuota.map(quota =>
                        <Option key={quota._id} value={quota.nome}> {quota.nome} </Option>) }
                    </Select>
                </div>
              } />
          </Col>

          <Col span={12}>
            <Card
              title="Metas"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione uma meta"
                    style={{ paddingLeft: 10, width: 250 }}
                    onSelect={e => console.log(e)}>
                      <Option key="all" value="all"> Exibir Todos </Option>
                      { this.state.listTarget.map(target =>
                        <Option key={target._id} value={target.nome}> {target.nome} </Option>) }
                    </Select>
                </div>
              } />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card
              title="Clientes por Carteira"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione uma carteira..."
                    style={{ paddingLeft: 10, width: 250 }}
                    onSelect={e => this.showCustomerWallet(e)} >
                      <Option key="all" value="all"> Exibir Todos </Option>
                      { this.state.listCustomerWallet.map((cw) =>
                        <Option key={cw.nome} value={cw.nome}> {cw.nome} </Option>) }
                  </Select>
                </div>}>
                {/* <LineChart width={525} height={300} margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                  <CartesianGrid strokeDasharray="10 0" />
                  <XAxis dataKey="name" />
                  <YAxis dataKey="totalClientes" />
                  <Line isAnimationActive={false} data={this.state.arrCustomerWallet} dataKey="totalClientes" stroke="green" activeDot={{r: 4}}>
                    { this.state.arrCustomerWallet.map((entry, index) => <Cell key={index} />)}
                  </Line>
                  <Tooltip />
                </LineChart> */}
                <PieChart
                  width={400}
                  height={400}
                  margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                  <Pie
                    isAnimationActive
                    data={this.state.arrCustomerWallet}
                    dataKey="totalClientes"
                    outerRadius={100}
                    label
                    onClick={e => this.showCustomerWallet(e.name)}>
                    { this.state.arrCustomerWallet.map((entry, index) =>
                      <Cell key={index} fill={colors[index % colors.length]} />) }
                  </Pie>
                  <Tooltip />
                </PieChart>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              title="Visitas Mensais"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione um mês"
                    style={{ paddingLeft: 10, width: 250 }}
                    onSelect={(e) => this.showAllVisitsMonth(e)}>
                      { this.state.listYears.map(year =>
                        <Option key={year} value={year}> {year} </Option>) }
                  </Select>
                </div>
              }>
              <BarChart
                width={525}
                height={300}
                data={this.state.arrVisitasMes}
                margin={{top: 50, right: 5, left: 5, bottom: 1}}>
                  <CartesianGrid strokeDasharray="10 0" />
                  <XAxis dataKey="name" />
                  <YAxis dataKey="qtdVisitas" />
                  <Bar
                    isAnimationActive
                    dataKey="qtdVisitas"
                    fill="#82ca9d"
                    onClick={e => this.showVisitsMonth(e.index, this.state.ano)} >
                       {/* <LabelList dataKey="name" position="top" angle={270} offset={15} /> */}
                    </Bar>
                  <Tooltip />
              </BarChart>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card
              title="Propriedades"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione um cliente..."
                    style={{ paddingLeft: 10, width: 250 }}
                    onSelect={e => this.showClientProps(e)} >
                      <Option key="all" value="all"> Exibir Todos </Option>
                      { this.state.listClient.map((cliente) =>
                        <Option key={cliente.nome} value={cliente.nome}> {cliente.nome} </Option>) }
                  </Select>
                </div>} >
                  <PieChart
                    width={400}
                    height={400}
                    margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                    <Pie
                      isAnimationActive
                      data={this.state.arrProps}
                      dataKey="qtdProps"
                      outerRadius={100}
                      label
                      onClick={e => this.showClientProps(e.name)}>
                      { this.state.arrProps.map((entry, index) =>
                        <Cell key={index} fill={colors[index % colors.length]} />) }
                    </Pie>
                    <Tooltip />
                  </PieChart>
              </Card>
          </Col>

          {/* <Col span={12}>
            <Card
              title="Teste"
              type="inner"
              style={{ marginBottom: 15 }}
              extra={
                <div>
                  <span>Selecione</span>
                  <Select
                    allowClear
                    showSearch
                    placeholder="Selecione um cliente..."
                    style={{ paddingLeft: 10, width: 250 }}
                    onChange={e => this.showTeste(e)}
                    mode="tags" >
                      { this.state.listClient.map((cliente) =>
                        <Option key={cliente.nome} value={cliente.nome}> {cliente.nome} </Option>) }
                  </Select>
                </div>}>
                  <PieChart
                    width={400}
                    height={400}
                    margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                      <Pie
                        isAnimationActive
                        data={this.state.arrClientArea}
                        dataKey="areaTotal"
                        outerRadius={100}
                        onClick={e => this.showClientArea(e.name)}>
                        { this.state.arrClientArea.map((entry, index) => (
                          <Cell key={index} fill={colors[index % colors.length]} /> ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                </Card>
          </Col> */}
        </Row>
      </div>
    );
  }
}

export default Dashboard;
