import { getAirtableRecordByWallet, saveUserToAirtable, saveWithdrawalToAirtable } from "@/lib/airtable";

export async function POST(req: Request) {
  const data = await req.json();

  const result = await saveWithdrawalToAirtable(data);
console.log(result)
  return Response.json({record:result?.records[0]});
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return Response.json({ error: 'address required' }, { status: 400 });
  }

  // const user = await findUserByWallet(address);
    const existingRecord:any = await getAirtableRecordByWallet({address,tableName:"Transactions"});
    console.log(existingRecord,"llllllll")
  return Response.json({existingRecord});
}