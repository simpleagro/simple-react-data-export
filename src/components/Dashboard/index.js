import React, { Component } from "react";

import { PainelHeader } from "common/PainelHeader";
import * as ClientService from "services/clients";
import * as CustomerWalletService from "services/customerswallet";
import * as QuotaService from "services/quotas";
import * as TargetService from "services/targets";
import * as VisitService from "services/visits";

import moment from "moment";
import { Select, Card, Row, Col } from "antd";
import { LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Bar, BarChart } from 'recharts';

const Option = Select.Option;
const colors = ["#4286f4", "#41f4d9", "#41f462", "#a9f441", "#41c4f4", "#4af441"];

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listClient: [],
      listCustomerWallet: [],
      listQuota: [],
      listTarget: [],
      listVisit: [],
      loadingData: true,
      arrClientArea: [],
      arrVisitasMes: [],
      arrClientCreditLimit: [],
      arrCustomerWallet: [],
      arrQuota: [],
      arrTarget: [],
      arrTeste: [
        {
          name: "teste",
          valor: 1
        },
        {
          name: "teste2",
          valor: 3
        }
      ]
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

  showAllVisitsMonth(){
    let sumMonths = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    let arrVisitas = [
      { name: "Jan", fullName: "Janeiro" }, { name: "Fev", fullName: "Fevereiro" }, { name: "Mar", fullName: "Março" },
      { name: "Abr", fullName: "Abril" }, { name: "Mai", fullName: "Maio" }, { name: "Jun", fullName: "Junho" },
      { name: "Jul", fullName: "Julho" }, { name: "Ago", fullName: "Agosto" }, { name: "Set", fullName: "Setembro" },
      { name: "Out", fullName: "Outrubro" }, { name: "Nov", fullName: "Novembro" }, { name: "Dez", fullName: "Dezembro" }
    ];
    let month;
    this.state.listVisit.map(v => ( month = new Date(moment(v.data_agenda, "DD/MM/YYYY").format("MM/DD/YYYY")), sumMonths[month.getMonth()]++))
    arrVisitas.forEach((element, index) => {
      Object.assign(element, { qtdVisitas: Number(sumMonths[index]) })
    });
    this.setState({ arrVisitasMes: arrVisitas });
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
          areaTotal: client.propriedades.map(p => p.area).reduce(this.sum)
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
                {/* <LineChart width={525} height={300} data={this.state.arrClientCreditLimit} margin={{top: 25, right: 5, left: 5, bottom: 1}}>
                  <CartesianGrid strokeDasharray="10 0"/>
                  <XAxis dataKey="name" />
                  <YAxis dataKey="value" />
                  <Line type="monotone" dataKey="value" stroke="blue" activeDot={{r: 4}} />
                  <Tooltip />
                </LineChart> */}

                <PieChart width={400} height={400} margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                  <Pie isAnimationActive data={this.state.arrClientCreditLimit} dataKey="value" outerRadius={100} label >
                    { this.state.arrClientCreditLimit.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
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
                      { this.state.listClient.map((cliente) => <Option key={cliente.nome} value={cliente.nome}>{cliente.nome}</Option>) }
                  </Select>
                </div>}>
                <PieChart width={400} height={400} margin={{top: 0, right: 5, left: 5, bottom: 1}}>
                    <Pie isAnimationActive data={this.state.arrClientArea} dataKey="areaTotal" outerRadius={100} label >
                      { this.state.arrClientArea.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
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
                      <Option key="all" value="all">Exibir Todos</Option>
                      { this.state.listQuota.map(quota => <Option key={quota._id} value={quota.nome}>{quota.nome}</Option>) }
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
                      <Option key="all" value="all">Exibir Todos</Option>
                      { this.state.listTarget.map(target => <Option key={target._id} value={target.nome}>{target.nome}</Option>) }
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
                      { this.state.listCustomerWallet.map((cw) => <Option key={cw.nome} value={cw.nome}>{cw.nome}</Option>) }
                  </Select>
                </div>}>
                {/* <LineChart width={525} height={300} margin={{top: 25, right: 5, left: 5, bottom: 1}}>
                  <CartesianGrid strokeDasharray="10 0" />
                  <XAxis dataKey="name" />
                  <YAxis dataKey="totalClientes" />
                  <Line isAnimationActive={false} data={this.state.arrCustomerWallet} dataKey="totalClientes" stroke="green" activeDot={{r: 4}}>
                    { this.state.arrCustomerWallet.map((entry, index) => <Cell key={index} />)}
                  </Line>
                  <Tooltip />
                </LineChart> */}
              <PieChart width={400} height={400} margin={{top: 25, right: 5, left: 5, bottom: 1}}>
                  <Pie isAnimationActive data={this.state.arrCustomerWallet} dataKey="totalClientes" outerRadius={100} label >
                    { this.state.arrCustomerWallet.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
                  </Pie>
                  <Tooltip />
                </PieChart>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              title="Visitas por Mês"
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
                    onSelect={(e) => console.log(e)}>
                      <Option key="all" value="all">Exibir Todos</Option>
                      { this.state.arrVisitasMes.map(m => <Option key={m.name} value={m.name}>{m.fullName}</Option>) }
                  </Select>
                </div>
              }>
              <BarChart width={525} height={300} data={this.state.arrVisitasMes} margin={{top: 25, right: 5, left: 5, bottom: 1}}>
                <CartesianGrid strokeDasharray="10 0" />
                <XAxis dataKey="name" />
                <YAxis dataKey="qtdVisitas" />
                <Bar isAnimationActive dataKey="qtdVisitas" fill="#82ca9d" />
                <Tooltip />
              </BarChart>
            </Card>
          </Col>
        </Row>

      </div>
    );
  }
}

export default Dashboard;
