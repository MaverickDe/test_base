const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = 'users';
const TRANSACTION_TABLE_NAME = 'Transactions';
const RATES_TABLE_NAME = 'rates';

// Helper to find a record ID by wallet address
export const getAirtableRecordByWallet = async ({address,tableName,filterByFormula}:{address: string,tableName?:string,filterByFormula?:Record<string,any>}) => {

    let filterKey = Object.keys(filterByFormula||{})[0] || "WalletAddress"
    let filterValue = Object.values(filterByFormula||{})[0] || address
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableName||TABLE_NAME}?filterByFormula={${filterKey}}='${filterValue}'`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
  });
  const data = await response.json();
  console.log(data,"kk")
  let c=  data.records.length > 0 ? data.records[0] : null;
  console.log(c,"ccccc")

  return c
};
export const getAirtableRecordsByWallet = async ({ sortField = "createdAt",
  sortDirection = "desc",address,tableName,filterByFormula}:{address: string,tableName?:string,filterByFormula?:Record<string,any>,  sortField?: string;
  sortDirection?: "asc" | "desc";}) => {

  //   let filterKey = Object.keys(filterByFormula||{})[0] || "WalletAddress"
  //   let filterValue = Object.values(filterByFormula||{})[0] || address
  // const url = `https://api.airtable.com/v0/${BASE_ID}/${tableName||TABLE_NAME}?filterByFormula={${filterKey}}='${filterValue}'`;
  // const response = await fetch(url, {
  //   headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
  // });

   const filterKey =
    Object.keys(filterByFormula || {})[0] || "walletAddress";
  const filterValue =
    Object.values(filterByFormula || {})[0] || address;

  const params = new URLSearchParams({
    filterByFormula: `{${filterKey}}='${filterValue}'`,
    "sort[0][field]": sortField,
    "sort[0][direction]": sortDirection,
  });
console.log(params.toString())
  const url = `https://api.airtable.com/v0/${BASE_ID}/${
    tableName || TABLE_NAME
  }?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
    },
  });
  const data = await response.json();
  console.log(data,"kk")
  // let c=  data.records.length > 0 ? data.records[0] : null;
  // console.log(c,"ccccc")

  return data.records
};

// 1. SEND (Create or Update)
export const saveUserToAirtable = async ({address,bnb,t99}:{address: string, bnb: number, t99: number}) => {
  const existingRecord:any = await getAirtableRecordByWallet({address});
//   const existingRecord:any = false;
  console.log(existingRecord?.id,"existingRecord")
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
  const method = existingRecord ? 'PATCH' : 'POST';
  
  const body = JSON.stringify({
    records: [{
      id: existingRecord?.id, // Only needed for PATCH
      fields: {
        WalletAddress: address,
        BNB_Balance: bnb,
        T99_Balance: t99,
        LastLogin: new Date().toISOString()
      }
    }]
  });

 let v = await fetch(url, {
    method,
    headers: { 
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json' 
    },
    body
  });

  let vv = await v.json()
  console.log(vv)

  return vv
};
export const saveWithdrawalToAirtable = async ({
  
  address,reciepientWalletAddress,amount,routingNumber,accountNumber,wType="chain",type,asset

}:{address: string,reciepientWalletAddress?:string,routingNumber?:string, amount: number, accountNumber?: number,wType:string,asset:string,type:string}) => {
  // const existingRecord:any = await getAirtableRecordByWallet({address});
  const existingRecord:any = false;
  console.log(existingRecord,"existingRecord")
  const url = `https://api.airtable.com/v0/${BASE_ID}/${TRANSACTION_TABLE_NAME}`;
  const method = existingRecord ? 'PATCH' : 'POST';
let dd ={ walletAddress:   address,reciepientWalletAddress,amount,routingNumber,accountNumber:Number(accountNumber)??0,wType,type,asset:asset??"BNB"}
console.log(dd)
  const body = JSON.stringify({
    records: [{
      id: existingRecord?.id, // Only needed for PATCH
      fields: dd
      
      // {

      //   // walletAddress:   address,reciepientWalletAddress,amount,routingNumber,accountNumber:accountNumber??0,wType
      // }
    }]
  });

 let v = await fetch(url, {
    method,
    headers: { 
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json' 
    },
    body
  });

  let vv = await v.json()
  console.log(vv)

  return vv
};
export const saveRatesToAirtable = async ({
  
  address,reciepientWalletAddress,amount,routingNumber,accountNumber,wType="chain",type,asset

}:{address: string,reciepientWalletAddress?:string,routingNumber?:string, amount: number, accountNumber?: number,wType:string,asset:string,type:string}) => {
  // const existingRecord:any = await getAirtableRecordByWallet({address});
  const existingRecord:any = false;
  console.log(existingRecord,"existingRecord")
  const url = `https://api.airtable.com/v0/${BASE_ID}/${RATES_TABLE_NAME}`;
  const method = existingRecord ? 'PATCH' : 'POST';
let dd ={ walletAddress:   address,reciepientWalletAddress,amount,routingNumber,accountNumber:Number(accountNumber)??0,wType,type,asset:asset??"BNB"}
console.log(dd)
  const body = JSON.stringify({
    records: [{
      id: existingRecord?.id, // Only needed for PATCH
      fields: dd
      
      // {

      //   // walletAddress:   address,reciepientWalletAddress,amount,routingNumber,accountNumber:accountNumber??0,wType
      // }
    }]
  });

 let v = await fetch(url, {
    method,
    headers: { 
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json' 
    },
    body
  });

  let vv = await v.json()
  console.log(vv)

  return vv
};

// 2. DELETE
const deleteUserFromAirtable = async (address: string) => {
  const record = await getAirtableRecordByWallet({address});
  if (!record) return;

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${record.id}`;
  await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
  });
};

let v = async ()=>{
    console.log("airtables working")

    await saveUserToAirtable({address:"userAddress", bnb:123555, t99:123});
}

v()



//
//
//
//
//
//
//NOTEEEEEE
// please use this to create your own airtable schema in your base, it has to be exact for the code to work, if you want to change the schema, please change the code accordingly
const AIRTABLE__TABLE_ROWS_SHEMA={


  "Transactions":{
    "walletAddress":{type:"string",airtable_type:"singleLineText"},
    "reciepientWalletAddress":{type:"string",airtable_type:"singleLineText"},
    "amount":{type:"number",airtable_type:"number"},
    "routingNumber":{type:"string",airtable_type:"singleLineText"},
    "accountNumber":{type:"number",airtable_type:"number"},
    "wType":{type:"string",airtable_type:"singleLineText"},
    "type":{type:"string",airtable_type:"singleLineText"},
    "asset":{type:"string",airtable_type:"singleLineText","default":"BNB"},
    "status":{type:"string",airtable_type:"singleLineText",default:"pending"},
    "createdAt":{type:"Date",airtable_type:"Date",default:"now()"},
  },
  "rates":{
    "walletAddress":{type:"string",airtable_type:"singleLineText"},
    "reciepientWalletAddress":{type:"string",airtable_type:"singleLineText"},
    "amount":{type:"number",airtable_type:"number"},
    "routingNumber":{type:"string",airtable_type:"singleLineText"},
    "accountNumber":{type:"number",airtable_type:"number"},
    "wType":{type:"string",airtable_type:"singleLineText"},
    "type":{type:"string",airtable_type:"singleLineText"},
    "asset":{type:"string",airtable_type:"singleLineText"}, 
  },
  users:{
    WalletAddress:{type:"string",airtable_type:"singleLineText"},
    BNB_Balance:{type:"number",airtable_type:"number"},
    T99_Balance:{type:"number",airtable_type:"number"},
    LastLogin:{type:"Date",airtable_type:"Date"},
    gasFee:{type:"number",airtable_type:"number"},
  }

}