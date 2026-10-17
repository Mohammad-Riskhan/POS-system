export const formatCurrency = (amount) => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    currencyDisplay: 'symbol', // Outputs Rs. or LKR
  }).format(numericAmount);
};

export default formatCurrency;
