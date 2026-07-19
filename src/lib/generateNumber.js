import prisma from './prisma';

export async function generateDocumentNumber(model, prefix) {
  const today = new Date();
  const yy = String(today.getFullYear()).slice(-2);
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const dateStr = `${dd}${mm}${yy}`;
  
  const fullPrefix = `${prefix}-${dateStr}-`;
  
  const numberField = prefix === 'ORD' ? 'orderNumber' :
                      prefix === 'INV' ? 'invoiceNumber' :
                      prefix === 'PUR' ? 'purchaseNumber' :
                      prefix === 'EXP' ? 'expenseNumber' : 'id';
                      
  const lastDocument = await model.findFirst({
    where: {
      [numberField]: {
        startsWith: fullPrefix
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!lastDocument) {
    return `${fullPrefix}1`;
  }

  const lastNumberStr = lastDocument[numberField];
  const parts = lastNumberStr.split('-');
  const lastIndex = parseInt(parts[parts.length - 1], 10);
  
  if (isNaN(lastIndex)) {
    return `${fullPrefix}1`;
  }
  
  return `${fullPrefix}${lastIndex + 1}`;
}
