import React from "react";
import { Card, Col, Row } from "antd";
import moment from "moment";

const ConfigurarFPCaracteristica = props => {
    const record = props.record
    return (
      <div style={{ paddingTop: "20px", paddingBottom: '20px' }}>
        <Row>
          <Col sm={{ span: 12 }}>
            <Card title="Data Vencimento" bodyStyle={{ padding: 10 }}>
              {record.venc_germoplasma && 
                <div>Germoplasma: {moment.parseZone(record.venc_germoplasma).format("DD/MM/YYYY")}</div>
              }
              {record.venc_royalties &&
                <div>Royalties: {moment.parseZone(record.venc_royalties).format("DD/MM/YYYY")}</div>
              }
              {record.venc_tratamento &&
                <div>Tratamento: {moment.parseZone(record.venc_tratamento).format("DD/MM/YYYY")}</div>
              }
              {record.venc_frete &&
                <div>Frete: {moment.parseZone(record.venc_frete).format("DD/MM/YYYY")}</div>
              }
            </Card>
          </Col>
          <Col sm={{ span: 12 }}>
            <Card title="Forma de Pagamento" bodyStyle={{ padding: 10 }}>
              {record.pgto_germoplasma && 
                <div>Germoplasma: {record.pgto_germoplasma}</div>
              }
              {record.pgto_royalties &&
                <div>Royalties: {record.pgto_royalties}</div>
              }
              {record.pgto_tratamento &&
                <div>Tratamento: {record.pgto_tratamento}</div>
              }
              {record.pgto_frete &&
                <div>Frete: {record.pgto_frete}</div>
              }
            </Card>
          </Col>
        </Row>
      </div>
    );
}

export default ConfigurarFPCaracteristica;
