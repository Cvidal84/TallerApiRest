// --- HELPER: Función para sumar precios de los items ---
const calculateTotal = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;

  return items.reduce((acc, item) => {
    // BLINDAJE: Si no viene cantidad, asumimos 1. Si no viene precio, asumimos 0.
    const quantity = item.quantity !== undefined ? item.quantity : 1;
    const price = item.price !== undefined ? item.price : 0;

    return acc + quantity * price;
  }, 0);
};

module.exports = calculateTotal;
