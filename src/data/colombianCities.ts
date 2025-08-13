// Datos de ciudades principales de Colombia como respaldo
export const colombianCities = {
  "Antioquia": [
    "Medellín", "Bello", "Itagüí", "Envigado", "Sabaneta", "La Estrella", "Caldas", "Copacabana", "Girardota", "Barbosa"
  ],
  "Atlántico": [
    "Barranquilla", "Soledad", "Malambo", "Sabanagrande", "Galapa", "Baranoa", "Puerto Colombia", "Palmar de Varela", "Luruaco", "Ponedera"
  ],
  "Bolívar": [
    "Cartagena", "Magangué", "Turbaco", "Arjona", "San Juan Nepomuceno", "Carmen de Bolívar", "El Carmen de Bolívar", "San Jacinto", "María la Baja", "San Pablo"
  ],
  "Boyacá": [
    "Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Villa de Leyva", "Paipa", "Nobsa", "Samacá", "Moniquirá", "Garagoa"
  ],
  "Caldas": [
    "Manizales", "La Dorada", "Chinchiná", "Villamaría", "Riosucio", "Aguadas", "Anserma", "Pensilvania", "Salamina", "Supía"
  ],
  "Caquetá": [
    "Florencia", "San Vicente del Caguán", "Cartagena del Chairá", "La Montañita", "Puerto Rico", "El Paujíl", "Solano", "Milán", "Valparaíso", "Morelia"
  ],
  "Cauca": [
    "Popayán", "Santander de Quilichao", "Patía", "Puerto Tejada", "Piendamó", "El Tambo", "Cajibío", "Timbío", "Miranda", "Corinto"
  ],
  "Cesar": [
    "Valledupar", "Aguachica", "Codazzi", "La Jagua de Ibirico", "Chimichagua", "Curumaní", "El Paso", "Bosconia", "San Alberto", "San Martín"
  ],
  "Córdoba": [
    "Montería", "Cereté", "Lorica", "Sahagún", "Tierralta", "Montelíbano", "San Andrés de Sotavento", "Ciénaga de Oro", "Ayapel", "San Pelayo"
  ],
  "Cundinamarca": [
    "Bogotá", "Soacha", "Facatativá", "Zipaquirá", "Chía", "Girardot", "Mosquera", "Madrid", "Funza", "Fusagasugá"
  ],
  "Huila": [
    "Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Palermo", "San Agustín", "Isnos", "Aipe", "Hobo"
  ],
  "La Guajira": [
    "Riohacha", "Maicao", "Uribia", "Manaure", "Fonseca", "Barrancas", "San Juan del Cesar", "Dibulla", "Albania", "Hatonuevo"
  ],
  "Magdalena": [
    "Santa Marta", "Ciénaga", "Fundación", "Aracataca", "El Retén", "Plato", "Pivijay", "Salamina", "Remolino", "Zona Bananera"
  ],
  "Meta": [
    "Villavicencio", "Acacías", "Granada", "Puerto López", "Puerto Gaitán", "San Martín", "Puerto Lleras", "Cumaral", "Castilla la Nueva", "San Carlos de Guaroa"
  ],
  "Nariño": [
    "Pasto", "Tumaco", "Ipiales", "La Unión", "Túquerres", "El Charco", "Buesaco", "La Tola", "Sandoná", "Consacá"
  ],
  "Norte de Santander": [
    "Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios", "Bucarasica", "El Zulia", "Sardinata", "Tibú", "Abrego"
  ],
  "Quindío": [
    "Armenia", "Calarcá", "La Tebaida", "Circasia", "Montenegro", "Salento", "Pijao", "Quimbaya", "Buenavista", "Córdoba"
  ],
  "Risaralda": [
    "Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Belén de Umbría", "Marsella", "Pueblo Rico", "Guática", "Quinchía", "Mistrató"
  ],
  "Santander": [
    "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil", "Málaga", "Socorro", "Oiba", "Puerto Wilches"
  ],
  "Sucre": [
    "Sincelejo", "Corozal", "Sampués", "San Marcos", "Coveñas", "Tolú", "San Onofre", "Palmito", "Los Palmitos", "Morroa"
  ],
  "Tolima": [
    "Ibagué", "Espinal", "Honda", "Mariquita", "Líbano", "Fresno", "Chaparral", "Purificación", "Melgar", "Guamo"
  ],
  "Valle del Cauca": [
    "Cali", "Buenaventura", "Palmira", "Tuluá", "Buga", "Cartago", "Jamundí", "Yumbo", "Florida", "Candelaria"
  ]
};

export const departments = Object.keys(colombianCities).sort();

export const getCitiesByDepartment = (department: string): string[] => {
  return colombianCities[department as keyof typeof colombianCities] || [];
};
