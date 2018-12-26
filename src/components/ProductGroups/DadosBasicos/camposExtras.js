import React from "react";
import { Button, Icon, Card, Divider, Popconfirm, Tooltip } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SimpleTable from "../../common/SimpleTable";
import styled from "styled-components";
import ModalForm from './modal'

const CardStyled = styled(Card)`
  background: #fff;
  padding: 5px;
  margin-bottom: 20px;
  border: 1px solid #e3cccc;
`;


export default (props) => {
    const tableConfig = () => [
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
                title={`Tem certeza em ${statusTxt} o campo extra?`}
                onConfirm={e => props.changeStatus(record._id, !record.status, record.chave)}
                okText="Sim"
                cancelText="Não"
              >
                <Tooltip title={`${statusTxt.toUpperCase()} o campo extra`}>
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
                  onClick={ () => props.showModal(record) }
                >
                  <Icon type="edit" style={{ fontSize: "16px" }} />
                </Button>
                <Divider
                  style={{ fontSize: "10px", padding: 0, margin: 2 }}
                  type="vertical"
                />
    
                <Popconfirm
                  title={`Tem certeza em excluir o campo extra?`}
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
    ];

    return (
        <div>
            <CardStyled 
            type="inner" 
            title={props.titleCard} 
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
                spinning={props.loadingData}
                columns={tableConfig()}
                dataSource={props.formData.fields || []}
                pagination={false}
            />
            </CardStyled>

            <ModalForm
                visible={props.visible}
                onCancel={props.handleCancel}
                onCreate={props.handleOk}
                wrappedComponentRef={props.saveFormRef}
                record={props.record}
            />
        </div>
    );
}