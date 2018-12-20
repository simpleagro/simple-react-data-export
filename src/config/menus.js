import Loadable                   from "react-loadable";
import dashboard                  from "./Menus/dashboard";
import empresas                   from "./Menus/empresas";
import modulos                    from "./Menus/modulos";
import entidades                  from "./Menus/entidades";
import usuarios                   from "./Menus/usuarios";
import consultores                from "./Menus/consultores";
import clientes                   from "./Menus/clientes";
import carteiraDeClientes         from "./Menus/carteira-de-clientes";
import caracteristicasProdutos    from "./Menus/caracteristicas-produtos";
import gruposDeProdutos           from "./Menus/grupos-produtos";
import produtos                   from "./Menus/produtos";
import safras                     from "./Menus/safras";
import etapasCultura              from "./Menus/etapas-cultura";
import unidadesMedida             from "./Menus/unidades-medidas";
import plantio                    from "./Menus/plantio";
import gestaoDeProjetosAgricolas  from "./Menus/gestao-projetos-agricolas";
import tipoVendedores             from "./Menus/tipo-de-vendedores";
import agenteVendas               from "./Menus/agente-de-vendas";
import tipoGarantia               from "./Menus/tipo-de-garantia";
import tipoVenda                  from "./Menus/tipo-de-vendas";
import usoSemente                 from "./Menus/uso-da-semente";
import formaPagamento             from "./Menus/forma-de-pagamento";
import tipoPagamento              from "./Menus/tipo-de-pagamento";
import tabelaPrecoCaracteristica  from "./Menus/tabela-preco-caracteristica"

const loadable = loader =>
  Loadable({
    loader,
    delay: false,
    loading: () => null
  });

const menus = {
  ...tabelaPrecoCaracteristica,
  ...dashboard,
  ...empresas,
  ...modulos,
  ...entidades,
  ...usuarios,
  ...consultores,
  ...clientes,
  ...plantio,
  ...carteiraDeClientes,
  ...gestaoDeProjetosAgricolas,
  ...caracteristicasProdutos,
  ...gruposDeProdutos,
  ...produtos,
  ...safras,
  ...etapasCultura,
  ...unidadesMedida,
  ...agenteVendas,
  ...tipoVendedores,
  ...tipoGarantia,
  ...tipoVenda,
  ...usoSemente,
  ...formaPagamento,
  ...tipoPagamento,
};

export { menus };
