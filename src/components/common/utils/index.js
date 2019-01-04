export const addMaskNumber = number => {  
    try {
      number =  number.replace(/[^\d]+/g,'');
    } catch(e){
      return number
    }
    return number
}

export const addMaskReais = number => {  
  try {
    number =  number.replace(/[^\d]+/g,'');
    let tmp = number+'';

    if ( tmp.length > 2 ) {
      tmp = tmp.replace(/^0+/, '')
    }

    if( tmp.length == 2) {
      tmp = "0"+tmp
    }

    if( tmp.length == 1) {
      tmp = "00"+tmp
    }

    tmp = tmp.replace(/([0-9]{2})$/g, ",$1");

    if( tmp.length > 6 )
      tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
    
    if( tmp.length > 10 )
      tmp = tmp.replace(/([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g, ".$1.$2,$3");
    
    number = tmp
  } catch(e){
    return number
  }
  return number
}

export const formatDate = data => {
  const novaData = new Date(data);
  return `${zeroEsquerda(novaData.getDate())}/${zeroEsquerda(novaData.getMonth() +1)}/${novaData.getFullYear()}`;
};

const zeroEsquerda = (data) => {
  return (data < 10 ? '0' : '') + data
}
