import React from "react";
import { Table, Spin, Pagination, Button } from "antd";

const SimpleTable = ({ spinning, ...props }) => {


  props.columns = props.columns.map((c,index) => {
    if (c.dataIndex === "action") {
      c.width = c.width || 150;
      c.fixed = c.fixed || "right";
    } else {
      if (c.hasOwnProperty("fixed")) c.width = c.width || 100;
    }

    return c;
  });

  return (
    <Spin spinning={spinning} tip="Carregando..." size="large">
      {/* <Button
      ghost
      type="primary"
      icon="reload"
      onClick={() => window.location.reload()}>
      Atualizar
    </Button> */}
      <Table
        {...{
          scroll: {
            x:
            document.querySelector(".ant-layout-content").offsetWidth +
              props.columns.reduce(function(prev, elem) {
                return prev + (elem.hasOwnProperty("fixed") && elem.width);
              }, 0)
          },
          ...props
        }}
      />
      {/* scroll={{ y: 240 }} */}
    </Spin>
  );
};

export default SimpleTable;
