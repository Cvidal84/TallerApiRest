// --- HELPER MÁGICO: Transforma vocales en comodines ---
// Convierte "civic" en "c[i,í,ï]v[i,í,ï]c"
const unaccent = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Separa tildes
    .replace(/[aA]/g, "[a,á,à,ä,A,Á,À,Ä]")
    .replace(/[eE]/g, "[e,é,ë,E,É,Ë]")
    .replace(/[iI]/g, "[i,í,ï,I,Í,Ï]")
    .replace(/[oO]/g, "[o,ó,ö,O,Ó,Ö]")
    .replace(/[uU]/g, "[u,ú,ü,U,Ú,Ü]");
};

module.exports = unaccent;
