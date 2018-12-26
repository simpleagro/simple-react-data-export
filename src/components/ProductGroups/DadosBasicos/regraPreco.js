import React from "react";
import { Button, Card, Icon, Divider, Popconfirm, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import styled from "styled-components";
import SimpleTable from "../../common/SimpleTable";
import ModalForm from './modalRegraPreco';


const CardStyled = styled(Card)`
  background: #fff;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e3cccc;
`;

const RegraPreco = props => {
  const tableConfig = () => {
    return ([
      {
          title: "Nome",
          dataIndex: "label",
          key: "label",
          sorter: (a, b, sorter) => {
            if (sorter === "ascendent") return -1;
            else return 1;
          }
      },
      {
          title: "Obrigatório",
          dataIndex: "obrigatorio",
          key: "obrigatorio",
          render: (item) => item? "Sim" : "Não"
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, record) => {
          const statusTxt = record.status ? "desativar" : "ativar";
          const statusBtn = record.status ? "unlock" : "lock";
          return (
            <Popconfirm
              title={`Tem certeza em ${statusTxt} a regra de preço base?`}
              onConfirm={e => props.changeStatus(record._id, !record.status)}
              okText="Sim"
              cancelText="Não"
            >
              <Tooltip title={`${statusTxt.toUpperCase()} a regra de preço base`}>
                <Button size="small">
                  <FontAwesomeIcon icon={statusBtn} size="lg" />
                </Button>
              </Tooltip>
            </Popconfirm>
          );
        }
      },
      {
        title: "Ações",
        dataIndex: "action",
        render: (text, record) => {
          return (
            <span>
              <Button
                size="small"
                onClick={() => props.showModal(record) }
              >
                <Icon type="edit" style={{ fontSize: "16px" }} />
              </Button>
              <Divider
                style={{ fontSize: "10px", padding: 0, margin: 2 }}
                type="vertical"
              />

              <Popconfirm
                title={`Tem certeza em excluir a regra de preço base?`}
                onConfirm={() => props.removeRecord(record)}
                okText="Sim"
                cancelText="Não"
              >
                <Button size="small">
                  <Icon type="delete" style={{ fontSize: "16px" }} />
                </Button>
              </Popconfirm>
            </span>
          );
        }
      }
    ])
  }

    return (
      <div style={{marginTop: 30}}>
        <CardStyled 
          type="inner" 
          title="Regra de Preço Base" 
          bordered 
          extra={
            <Button
              type="primary"
              icon="plus"
              onClick={() => props.showModal()}
            >
              Adicionar
            </Button>
          }
        >
          <SimpleTable
            rowKey="_id"
            spinning={false}
            columns={tableConfig()}
            dataSource={props.formData.preco_base_regra || []}
            onChange={props.handleTableChange}
            pagination={false}
          />
        </CardStyled>

        <ModalForm
          visible={props.visible}
          onCancel={props.handleCancel}
          onCreate={props.handleOk}
          wrappedComponentRef={props.saveFormRef}
          group_id={props.group_id}
          record={props.record}
        />
        
      </div>
    );
}


export default RegraPreco;
