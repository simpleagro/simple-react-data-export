import React from 'react'
import { Modal, Button, Row, Col, Card } from 'antd';
import ConfigurarFPCaracteristica from './ConfigurarFPCaracteristica'
import { currency } from "common/utils"
import moment from "moment"

const ModalPedido = (props) => {
  const { visible, onCancel, onApproval } = props;
  const pedido_selecionado = props.pedido || {}

  const gerarParcelas = (parcelas) => {
    return parcelas.map(parcela => 
      <Col sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 8 }}>
        <Card key={parcela.data_vencimento} style={{width: 280, marginTop: 10, marginBottom: 10}} bodyStyle={{ padding: 10 }}>
          <div>Data Vencimento: {moment.parseZone(parcela.data_vencimento).format("DD/MM/YYYY")}</div>
          <div>Valor Parcela: R$ {currency()(parcela.valor_parcela)}</div>
        </Card>
      </Col>
    )
  }

  const gerarItens = (itens) => {
    return itens.map(item => 
      <Col sm={{ span: 24 }} md={{ span: 12 }} lg={{ span: 8 }}>
        <Card key={item._id} style={{width: '99%', marginTop: 10, marginBottom: 10}} bodyStyle={{ padding: 10 }}>
          <div>Produto: {item.produto.nome}</div>
          {gerarVariacaoProduto(item, props.groupData)}
          <div style={{background:'#ecf0f1', paddingLeft: 5, paddingRight: 5}}>
            {gerarInputPrecoBase(item, props.groupData)}
            {gerarInputPrecoCaract(item, props.groupData)}
            {item.preco_item && item.desconto_item && gerarInputPreco(item)}
          </div>
          {item.quantidade && <div>Quantidade: {currency()(item.quantidade, {minimumFractionDigits: 0})}</div>}
          {item.total_preco_item_graos && <div>Preço Grãos: {currency()(item.total_preco_item_graos, {minimumFractionDigits: 0})}</div>}
          {item.total_preco_item_reais && <div>Preço Reais: R$ {currency()(item.total_preco_item_reais)}</div>}
          {item.total_preco_item && <div>Preço: {currency()(item.total_preco_item)}</div>}
        </Card>
      </Col>
    )
  }

  const calcularKGSC = (peso_kg) => {
    let peso_sc = parseFloat((peso_kg || "0,00" ).replace('.','').replace(',', '.')) / 60
    return peso_sc.toFixed(0).replace('.',',')
  }

  const gerarVariacaoProduto = (item, product_group = []) => {
    if(item.grupo_produto){
      let grupo = product_group.find(grupo => grupo._id == item.grupo_produto.id)
      if(grupo && grupo.caracteristicas){
        return grupo.caracteristicas.map( caracteristica => {
          if(item[caracteristica.chave] != undefined )
            return  <div key={caracteristica.label} >
                      <div>{`${caracteristica.label}: ${item[caracteristica.chave].label}`}</div>
                    </div>
          }
        )
      }
    }
  }

  const gerarInputPrecoBase = (item, product_group = []) => {
    if (item && item.grupo_produto) {
      let listaProdutos = product_group.find(
        grupo => grupo._id == item.grupo_produto.id
      );
      if (listaProdutos) {
        let group_regras_preco = listaProdutos.preco_base_regra;
        return group_regras_preco.map( regra_preco => 
          <div key={`${regra_preco.chave}`}>
            <div>
              {`Preço ${regra_preco.label}: ${item[`preco_${regra_preco.chave}`]}`}
            </div>
            <div>
              {`Desconto ${regra_preco.label} (%): ${item[`desconto_${regra_preco.chave}`]}`}
            </div>
          </div>
        )
      }
    }
  }

  const gerarInputPrecoCaract = (item, product_group = []) => {
    if (item && item.grupo_produto) {
      let listaProdutos = product_group.find(
        grupo => grupo._id == item.grupo_produto.id
      );
      if (listaProdutos) {
        let group_regras_preco = listaProdutos.caracteristicas.filter(caract => caract.tipo_preco == 'TABELA_CARACTERISTICA');
        return group_regras_preco.map( regra_preco => 
          <div key={`${regra_preco.chave}`}>
            <div>
              {`Preço ${regra_preco.label}: ${item[`preco_${regra_preco.chave}`]}`}
            </div>
            <div>
              {`Desconto ${regra_preco.label} (%): ${item[`desconto_${regra_preco.chave}`]}`}
            </div>
          </div>
        )
      }
    }
  }

  const gerarInputPreco = (item) => {
    return (
      <div key={`preco_item`}>
        <div>
          {`Preço Item: ${item[`preco_item`]}`}
        </div>
        <div>
          {`Desconto Item (%): ${item[`desconto_item`]}`}
        </div>
      </div>
    )
  }

  return (
    <Modal
      width= '97%'
      style={{top: 20}}
      visible={visible}
      title={`Pedido ${props.pedido? props.pedido.numero:''} - Status: ${props.pedido? props.pedido.status_pedido:''}`}
      onCancel={onCancel}
      maskClosable={false}
      footer={[
        <Button key="back" type="danger" onClick={() => {onApproval(pedido_selecionado, "Reprovado")}}>Reprovar</Button>,
        <Button key="submit" type="primary" onClick={() => {onApproval(pedido_selecionado, "Aprovado")}}>Aprovar</Button>
      ]}
    >
      <div style={{width:'100%'}}>
        {pedido_selecionado.safra && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Safra:</b> {pedido_selecionado.safra.descricao}
            </Col>
          </Row>
        )}

        {pedido_selecionado.vendedor && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Vendedor:</b> {pedido_selecionado.vendedor.nome}
            </Col>
          </Row>
        )}

        {pedido_selecionado.cliente && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Cliente:</b> {pedido_selecionado.cliente.nome}
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>CPF/CNPJ:</b> {pedido_selecionado.cliente.cpf_cnpj}
            </Col>
          </Row>
        )}

        {pedido_selecionado.propriedade && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Propriedade:</b> {pedido_selecionado.propriedade.nome}
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>IE:</b> {pedido_selecionado.propriedade.ie}
            </Col>
          </Row>
        )}

        {pedido_selecionado.tipo_frete && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Frete:</b> {pedido_selecionado.tipo_frete}
            </Col>
          </Row>
        )}

        {pedido_selecionado.tipo_venda && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Tipo de Venda:</b> {pedido_selecionado.tipo_venda}
            </Col>
          </Row>
        )}

        {(pedido_selecionado.tipo_venda && pedido_selecionado.tipo_venda.toLowerCase().includes('agenciada')) && pedido_selecionado.agente_venda && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Agente de Venda:</b> {pedido_selecionado.agente_venda.nome}
            </Col>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Comissão Agente (%):</b> {pedido_selecionado.comissao_agente}
            </Col>
          </Row>
        )}

        {(pedido_selecionado.forma_pagamento || pedido_selecionado.tipo_pagamento) && (
          <Row>
            {pedido_selecionado.forma_pagamento &&
              <Col md={{ span: 24 }} lg={{ span: 12 }}>
                <b>Forma Pagamento:</b> {pedido_selecionado.forma_pagamento}
              </Col>
            }
            {pedido_selecionado.tipo_pagamento &&
              <Col md={{ span: 24 }} lg={{ span: 12 }}>
                <b>Tipo Pagamento:</b> {pedido_selecionado.tipo_pagamento}
              </Col>
            }
          </Row>
        )}

        <Row>
          {pedido_selecionado.tabela_preco_base && (
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Tabela de Preço:</b> {pedido_selecionado.tabela_preco_base.nome}
            </Col>
          )}
          {pedido_selecionado.venc_pedido && (
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Vencimento:</b> {pedido_selecionado.venc_pedido}
            </Col>
          )}
        </Row>

        {pedido_selecionado.observacao && (
          <Row>
            <Col md={{ span: 24 }} lg={{ span: 12 }}>
              <b>Observação:</b> {pedido_selecionado.observacao}
            </Col>
          </Row>
        )}

      </div>

      {!pedido_selecionado.venc_pedido && 
        <ConfigurarFPCaracteristica record={pedido_selecionado} />
      }

      {(pedido_selecionado.pagamento) && 
        <div style={{marginBottom: 15, paddingTop: 5, borderTop: "1px solid #dfe6e9"}}>
            <div>
                <b style={{fontSize:16}}>Resumo Pedido</b>
            </div>
            <div>
                {pedido_selecionado.pagamento.total_pedido_reais && <div>Total Pedido Reais: R$ {currency()(pedido_selecionado.pagamento.total_pedido_reais)}</div>}
                {pedido_selecionado.pagamento.total_pedido_graos && <div>Total Pedido Grãos: {currency()(pedido_selecionado.pagamento.total_pedido_graos, {minimumFractionDigits: 0})}</div>}
                {pedido_selecionado.pagamento.total_pedido && <div>Total Pedido: {currency()(pedido_selecionado.pagamento.total_pedido)}</div>}
            </div>
        </div>
      }

      {(pedido_selecionado.pagamento && pedido_selecionado.pagamento.parcelas.length > 0) && 
        <div style={{marginBottom: 15, paddingTop: 5, borderTop: "1px solid #dfe6e9"}}>
            <div>
                <b style={{fontSize:16}}>Parcelas Reais Pedido</b>
            </div>
            <Row>
              { gerarParcelas(pedido_selecionado.pagamento.parcelas) }
            </Row>
        </div>
      }

      {(pedido_selecionado.pagamento && (pedido_selecionado.pagamento.data_pgto_graos && pedido_selecionado.pagamento.peso_graos)) && 
        <div style={{marginBottom: 15, paddingTop: 5, borderTop: "1px solid #dfe6e9"}}>
            <div>
              <b style={{fontSize:16}}>Parcela Grãos Pedido</b>
            </div>
            <div>
                {pedido_selecionado.pagamento.data_pgto_graos && <div>Data Entrega Grãos: {moment.parseZone(pedido_selecionado.pagamento.data_pgto_graos).format("DD/MM/YYYY")}</div>}
                {pedido_selecionado.pagamento.peso_graos && <div>Volume em kg: {currency()(pedido_selecionado.pagamento.peso_graos, {minimumFractionDigits: 0})}</div>}
                {pedido_selecionado.pagamento.peso_graos && <div>Volume em SC: {currency()(calcularKGSC(pedido_selecionado.pagamento.peso_graos), {minimumFractionDigits: 0})}</div>}
                {pedido_selecionado.pagamento.entrega_graos && <div>Local Entrega: { pedido_selecionado.pagamento.entrega_graos }</div>}
            </div>
        </div>
      }

      {(pedido_selecionado.tipo_frete == "CIF" && pedido_selecionado.pagamento) && 
        <div style={{marginBottom: 15, paddingTop: 5, borderTop: "1px solid #dfe6e9"}}>
          <div>
            <b style={{fontSize:16}}>Frete Pedido</b>
          </div>
          <div>
              {pedido_selecionado.pagamento.estado && <div>Estado: {pedido_selecionado.pagamento.estado}</div>}
              {pedido_selecionado.pagamento.distancia && <div>Distância (km): {pedido_selecionado.pagamento.distancia}</div>}
              {pedido_selecionado.pagamento.peso && <div>Peso: {currency()(pedido_selecionado.pagamento.peso, {minimumFractionDigits: 0})}</div>}
              {pedido_selecionado.pagamento.preco_frete_tabela && <div>Valor (kg): { currency()(pedido_selecionado.pagamento.preco_frete_tabela) }</div>}
              {pedido_selecionado.pagamento.total_pedido_frete && <div>Total Pedido Frete: { currency()(pedido_selecionado.pagamento.total_pedido_frete) }</div>}
              {pedido_selecionado.pagamento.roteiro && <div>Roteiro: { pedido_selecionado.pagamento.roteiro }</div>}
          </div>
        </div>    
      }
      
      {/* `${this.props.pedido_selecionado['pgto_frete'] == 'REAIS' ? `R$ ${addMaskReais(this.value("total_pedido_frete"))}`:`${addMaskReais(this.value("total_pedido_frete"))}`}`*/}        

      {(pedido_selecionado.itens && pedido_selecionado.itens.length > 0) && 
        <div style={{marginBottom: 5, paddingTop: 5, borderTop: "1px solid #dfe6e9"}} >
            <div>
              <b style={{fontSize:16}}>Itens</b>
            </div>
            <Row>
              { gerarItens(pedido_selecionado.itens) }
            </Row>
        </div>
      }
    </Modal>
  );
}


export default ModalPedido;
