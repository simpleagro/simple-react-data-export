import React, { Component } from "react";

import { PainelHeader } from "common/PainelHeader";
import * as ClientService from "services/clients";
import * as CustomerWalletService from "services/customerswallet";
import * as QuotaService from "services/quotas";
import * as TargetService from "services/targets";
import * as VisitService from "services/visits";

import moment from "moment";
import { Select } from "antd";
import { LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Text, Bar, BarChart } from 'recharts';

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
      arrClient: [],
      arrClientArea: [],
      arrCustomerWallet: [],
      arrQuota: [],
      arrTarget: []
    };
  }

  async initializeList(aqp) {
    this.setState(previousState => {
      return { ...previousState, loadingData: true };
    });

    this.setState({
      loadingData: false
    });

    this.showClientArea();
    this.showClientCredit();
    this.showCustomerWalletChart();
    this.showQuotaChart();
    this.showTargetChart();
    this.showVisitsMonth();

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

  showVisitsMonth(){
    let sumMonths = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    let arrVisitas = [
      { name: "Jan" }, { name: "Fev" }, { name: "Mar" }, { name: "Abr" },
      { name: "Mai" }, { name: "Jun" }, { name: "Jul" }, { name: "Ago" },
      { name: "Set" }, { name: "Out" }, { name: "Nov" }, { name: "Dez" }
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

  showClientArea() {
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

  showClientCredit() {
    let arrClient = [];
    Object.assign(
      arrClient, this.state.listClient && this.state.listClient.map(client =>
        ({
          name: client.nome,
          value: Number(client.credito)
        })
      )
    );
    this.setState({ arrClient: arrClient });
  }

  showCustomerWalletChart() {
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

  showQuotaChart() {
    let arrQuota = [];
    let totalCotas = 0;
    this.state.listQuota && this.state.listQuota.map((q, index) => (totalCotas++));
    Object.assign(arrQuota, {
      value: totalCotas
    });
    this.setState({ arrQuota: arrQuota });
  }

  showTargetChart() {
    let arrTarget = [];
    let totalMetas = 0;
    this.state.listTarget && this.state.listTarget.map((t, index) => (totalMetas++));
    Object.assign(arrTarget, {
      value: totalMetas
    });
    this.setState({ arrTarget: arrTarget });
  }

  render() {
    return (
      <div>
        <PainelHeader title="Dashboard" />
        <hr />
        <h3> Limite de Crédito por Cliente </h3>
        <LineChart width={500} height={200} data={this.state.arrClient} margin={{top: 5, right: 5, left: 5, bottom: 1}}>
          <CartesianGrid strokeDasharray="10 0"/>
          <XAxis dataKey="name" />
          <YAxis dataKey="value" />
          <Line type="monotone" dataKey="value" stroke="blue" activeDot={{r: 4}} />
          <Tooltip />
        </LineChart>

        <hr />
        <h3> Limite de Crédito por Cliente </h3>
        <PieChart width={400} height={400}>
          <Pie isAnimationActive={false} data={this.state.arrClient} dataKey="value" outerRadius={100} label >
            { this.state.arrClient.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>

        <hr />
        <h3> Área Total por Cliente </h3>
        <LineChart width={500} height={200} margin={{top: 5, right: 5, left: 5, bottom: 1}}>
          <CartesianGrid strokeDasharray="10 0" />
          <XAxis dataKey="name" />
          <YAxis dataKey="areaTotal" />
          <Line isAnimationActive={false} data={this.state.arrClientArea} type="monotone" dataKey="areaTotal" stroke="red" activeDot={{r: 4}} >
            { this.state.arrClientArea.map((entry, index) => <Cell key={index} />) }
          </Line>
          <Tooltip />
        </LineChart>

        <hr />
        <h3> Área Total por Cliente </h3>
        <Select style={{ width: 150 }}>
          { this.state.arrClient.map((cliente, index) =>
            <Option key={cliente.name} value={cliente.name}>{cliente.name}</Option>
          )}
        </Select>
        <PieChart width={400} height={400}>
          <Pie isAnimationActive={false} data={this.state.arrClientArea} dataKey="areaTotal" outerRadius={100} label >
            { this.state.arrClientArea.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
          </Pie>
          <Tooltip />
        </PieChart>

        <hr />
        <h3> Total de Clientes por Carteira </h3>
        <LineChart width={500} height={200}>
          <CartesianGrid strokeDasharray="10 0" />
          <XAxis dataKey="name" />
          <YAxis dataKey="totalClientes" />
          <Line isAnimationActive={false} data={this.state.arrCustomerWallet} dataKey="totalClientes" stroke="green" activeDot={{r: 4}}>
            { this.state.arrCustomerWallet.map((entry, index) => <Cell key={index} />)}
          </Line>
          <Tooltip />
        </LineChart>

        <hr />
        <h3> Total de Clientes por Carteira </h3>
        <PieChart width={400} height={400}>
          <Pie isAnimationActive={false} data={this.state.arrCustomerWallet} dataKey="totalClientes" outerRadius={100} label >
            { this.state.arrCustomerWallet.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
          </Pie>
          <Tooltip />
        </PieChart>

        <hr />
        <h3> Visitas por Mês </h3>
        <BarChart width={500} height={200} data={this.state.arrVisitasMes}>
          <CartesianGrid strokeDasharray="10 0" />
          <XAxis dataKey="name" />
          <YAxis dataKey="qtdVisitas" />
          <Bar dataKey="qtdVisitas" fill="#82ca9d" />
          <Tooltip />
        </BarChart>

      </div>
    );
  }
}

export default Dashboard;
