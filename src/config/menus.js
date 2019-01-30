import Loadable from "react-loadable";
import dashboard from "./Menus/dashboard";
import dashboardSale from "./Menus/dashboard";
import empresas from "./Menus/empresas";
import filiais from "./Menus/filiais";
import modulos from "./Menus/modulos";
import entidades from "./Menus/entidades";
import usuarios from "./Menus/usuarios";
import consultores from "./Menus/consultores";
import clientes from "./Menus/clientes";
import carteiraDeClientes from "./Menus/carteira-de-clientes";
import gruposDeProdutos from "./Menus/grupos-produtos";
import safras from "./Menus/safras";
import etapasCultura from "./Menus/etapas-cultura";
import unidadesMedida from "./Menus/unidades-medidas";
import plantio from "./Menus/plantio";
import gestaoDeProjetosAgricolas from "./Menus/gestao-projetos-agricolas";
import tipoVendedores from "./Menus/tipo-de-vendedores";
import agenteVendas from "./Menus/agente-de-vendas";
import tipoGarantia from "./Menus/tipo-de-garantia";
import tipoVenda from "./Menus/tipo-de-vendas";
import usoSemente from "./Menus/uso-da-semente";
import formaPagamento from "./Menus/forma-de-pagamento";
import tipoPagamento from "./Menus/tipo-de-pagamento";
import tabelaPrecoCaracteristica from "./Menus/tabela-preco-caracteristica";
import tabelaFrete from "./Menus/tabela-frete";
import tabelaPreco from "./Menus/tabela-preco";
import metas from "./Menus/metas";
import cotas from "./Menus/cotas";
import tabelaComissao from "./Menus/tabela-comissao";
import pedidos from "./Menus/pedidos";
import inscricaoCampo from "./Menus/inscricao-de-campo";
import preColheitaLab from "./Menus/pre-colheita";
import moeda from "./Menus/moeda";
import configuracoes from "./Menus/configuracoes";

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  field: {
    ...carteiraDeClientes,
    ...clientes,
    ...configuracoes,
    ...consultores,
    ...dashboard,
    ...empresas,
    ...entidades,
    ...etapasCultura,
    ...filiais,
    ...gestaoDeProjetosAgricolas,
    ...gruposDeProdutos,
    ...inscricaoCampo,
    ...modulos,
    ...preColheitaLab,
    ...plantio,
    ...safras,
    ...unidadesMedida,
    ...usuarios
  },
  sales: {
    ...agenteVendas,
    ...carteiraDeClientes,
    ...clientes,
    ...consultores,
    ...cotas,
    ...dashboardSale,
    ...filiais,
    ...formaPagamento,
    ...gruposDeProdutos,
    ...moeda,
    ...metas,
    ...pedidos,
    ...safras,
    ...tabelaComissao,
    ...tabelaFrete,
    ...tabelaPreco,
    ...tabelaPrecoCaracteristica,
    ...tipoGarantia,
    ...tipoPagamento,
    ...tipoVenda,
    ...tipoVendedores,
    ...unidadesMedida,
    ...usoSemente,
    ...usuarios
    // ...alcadasDeAprovacao,
    // ...fluxoCaixaComissoes,
    // ...programacaoDeEntrega,
  }
};

export { menus };
