import React, { Component } from "react";

import { PainelHeader } from "../common/PainelHeader";
import * as ClientService from "../../services/clients";
import * as CustomerWalletService from "../../services/customerswallet";
import * as QuotaService from "../../services/quotas";
import * as TargetService from "../../services/targets";
import * as VisitService from "../../services/visits";
import moment from "moment";

import { LineChart, Line, Legend, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Text, Bar, BarChart } from 'recharts';

let arrClientArea = [{}], arrClient = [{}], arrCustomerWallet = [{}], arrQuota = [{}], arrTarget = [{}], arrVisitasMes = [{}];
let sumMonths = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
arrVisitasMes = [
  { name: "Jan" },
  { name: "Fev" },
  { name: "Mar" },
  { name: "Abr" },
  { name: "Mai" },
  { name: "Jun" },
  { name: "Jul" },
  { name: "Ago" },
  { name: "Set" },
  { name: "Out" },
  { name: "Nov" },
  { name: "Dez" }
];

const colors = ["#4286f4", "#41f4d9", "#41f462", "#a9f441", "#41c4f4", "#4af441"];

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listClient: [],
      listCustomerWallet: [],
      listQuota: [],
      listTarget: []
    };
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

  }

  sumMonth(){
    let month;
    this.state.listVisit && this.state.listVisit.map(v => ( month = new Date(moment(v.data_agenda, "DD/MM/YYYY").format("MM/DD/YYYY")), sumMonths[month.getMonth()]++,console.log("mes: ", month.getMonth())))
    arrVisitasMes.forEach((element, index) => {
      Object.assign(element, {qtd: sumMonths[index]})
    });
    console.log("arrVisitasMes", arrVisitasMes);
  }

  sum(num, total) {
    return num + total
  }

  showClientArea() {
    Object.assign(arrClientArea, this.state.listClient && this.state.listClient.map(client => (
      {
        name: client.nome,
        areaTotal: client.propriedades.map(p => p.area).reduce(this.sum)
      }
    )))
  }

  showClientCredit() {
    Object.assign(
      arrClient, this.state.listClient && this.state.listClient.map(client =>
        ({
          name: client.nome,
          value: Number(client.credito)
        })
      )
    );
  }

  showCustomerWalletChart() {
    Object.assign(arrCustomerWallet, this.state.listCustomerWallet && this.state.listCustomerWallet.map(cw => (
      {
        name: cw.nome,
        totalClientes: cw.clientes.length
      }
    )))
  }

  showQuotaChart() {
    let totalCotas = 0;
    this.state.listQuota && this.state.listQuota.map((q, index) => (totalCotas++));
    Object.assign(arrQuota, { value: totalCotas });
  }

  showTargetChart() {
    let totalMetas = 0;
    this.state.listTarget && this.state.listTarget.map((t, index) => (totalMetas++));
    Object.assign(arrTarget, { value: totalMetas })
  }

  render() {
    return (
      <div>
        <PainelHeader title="Dashboard" />

        {[ console.clear(),

          this.showClientArea(),
          this.showClientCredit(),
          this.showCustomerWalletChart(),
          this.showQuotaChart(),
          this.showTargetChart(),
          this.sumMonth(),

          console.log("arrClientArea: ", arrClientArea),
          console.log("arrClient: ", arrClient),
          console.log("arrCustomerWallet: ", arrCustomerWallet),
          console.log("arrQuota: ", arrQuota),
          console.log("arrTarget: ", arrTarget),

          console.log("state: ", this.state) ]}

        <h3> Limite de Crédito por Cliente </h3>
        <LineChart width={500} height={200} margin={{top: 5, right: 5, left: 5, bottom: 1}}>
          <CartesianGrid strokeDasharray="10 0"/>
          <XAxis dataKey="name" />
          <YAxis dataKey="value" />
          <Line isAnimationActive={false} data={arrClient} type="step" dataKey="value" stroke="blue" activeDot={{r: 4}} >
            { arrClient.map((entry, index) => <Cell key={index} />) }
          </Line>
          <Tooltip />
          <Text angle={90} />
        </LineChart>

        <h3> Limite de Crédito por Cliente </h3>
        <PieChart width={400} height={400}>
          <Pie isAnimationActive={false} data={arrClient} dataKey="value" outerRadius={100} label >
            { arrClient.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>

        <h3> Área Total por Cliente </h3>
        <LineChart width={500} height={200} margin={{top: 5, right: 5, left: 5, bottom: 1}}>
          <CartesianGrid strokeDasharray="10 0" />
          <XAxis dataKey="name" />
          <YAxis dataKey="areaTotal" />
          <Line isAnimationActive={false} data={arrClientArea} type="monotone" dataKey="areaTotal" stroke="red" activeDot={{r: 4}} >
            { arrClientArea.map((entry, index) => <Cell key={index} />) }
          </Line>
          <Tooltip />
        </LineChart>

        <h3> Área Total por Cliente </h3>
        <PieChart width={400} height={400}>
          <Pie isAnimationActive={false} data={arrClientArea} dataKey="areaTotal" outerRadius={100} label >
            { arrClientArea.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
          </Pie>
          <Tooltip />
        </PieChart>

        <h3> Total de Clientes por Carteira </h3>
        <LineChart width={500} height={200}>
          <CartesianGrid strokeDasharray="10 0" />
          <XAxis dataKey="name" />
          <YAxis dataKey="totalClientes" />
          <Line isAnimationActive={false} data={arrCustomerWallet} dataKey="totalClientes" stroke="green" activeDot={{r: 4}}>
            { arrCustomerWallet.map((entry, index) => <Cell key={index} />)}
          </Line>
          <Tooltip />
        </LineChart>

        <h3> Total de Clientes por Carteira </h3>
        <PieChart width={400} height={400}>
          <Pie isAnimationActive={false} data={arrCustomerWallet} dataKey="totalClientes" outerRadius={100} label >
            { arrCustomerWallet.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
          </Pie>
          <Tooltip />
        </PieChart>

        <h3> Visitas por Mês </h3>
        <BarChart width={500} height={200}>
          <CartesianGrid strokeDasharray="10 0" />
          <XAxis dataKey="name" />
          <YAxis dataKey="qtd" />
          <Tooltip />
          <Bar isAnimationActive={false} data={arrVisitasMes} dataKey="qtd" label>
            { arrVisitasMes.map((entry, index) => <Cell key={index} fill={colors[index % colors.length]} />) }
          </Bar>
        </BarChart>

      </div>
    );
  }
}

export default Dashboard;

