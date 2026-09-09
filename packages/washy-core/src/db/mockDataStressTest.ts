// ==========================================
// MOCK DATA: STRESS TEST & EDGE CASES
// ==========================================
// Usar estos datos para poner a prueba la resiliencia de la interfaz 
// y el Motor de Reconciliación. Si la app no maneja esto bien, se trabará.

export const mockStressBatches = [
  {
    id: 'edge-1-frankenstein-extremo',
    status: 'WASHING',
    priorityScore: 0,
    ownerId: 'user-1',
    handlerId: 'user-1',
    createdAt: new Date(),
    _notes: 'ESTRÉS LÓGICO: Esta tanda mezcló Armor (Jeans) con Soft (Seda). La UI debe atrapar esto y mostrar la alerta de "Bolsa de Malla" en vez de crashear intentando promediar los tiempos.',
    _linkedCategories: ['cat-armor', 'cat-soft'] // Debe aplicar la regla del eslabón más débil (cat-soft)
  },
  {
    id: 'edge-2-agujero-negro-temporal',
    status: 'SOAKING',
    priorityScore: 0,
    ownerId: 'user-1',
    handlerId: 'user-1',
    // Creado hace 45 días.
    createdAt: new Date(new Date().getTime() - (45 * 24 * 60 * 60 * 1000)),
    _notes: 'ESTRÉS DE RELOJ: El usuario la dejó en remojo hace mes y medio. La UI no debe renderizar "-1080 horas restantes". Debe detonar la alerta de agua estancada y limpiar el timer.'
  },
  {
    id: 'edge-3-handler-fantasma',
    status: 'DRYING',
    priorityScore: 0,
    ownerId: 'user-1',
    handlerId: null, // NADIE la está manejando
    createdAt: new Date(),
    _notes: 'ESTRÉS DE REFERENCIA NULA: Una tanda huérfana sin operador actual. La UI no debe dar "Undefined is not an object", debe asignar al owner como handler fallback o mostrar "Máquina ocupada por fantasma".'
  },
  {
    id: 'edge-4-tanda-vacia',
    status: 'BACKLOG',
    priorityScore: 0,
    ownerId: 'user-1',
    handlerId: 'user-1',
    createdAt: new Date(),
    _notes: 'ESTRÉS DE ARRAY VACÍO: Una tanda creada por error sin prendas ni categorías. Si el usuario le da "Iniciar Lavadora", la app debe desactivar el botón o mostrar un warning amigable, no romper la ejecución de SQL.'
  }
];

export const mockStressGarments = [
  {
    id: 'edge-g-1-paradoja-reglas',
    categoryId: 'cat-armor', // Es categoría ruda (Armor)
    photoUri: null, // Estrés de UI: Imagen rota o no cargada
    hasPrint: true, 
    isDelicateBlend: true, // PARADOJA: Es Armor pero tiene un blend frágil (Ej. Jeans con parches de seda).
    _notes: 'ESTRÉS DE REGLAS: La UI debe forzar esto a "Delicado" a pesar de que su categoría es "Armor", y mostrar el icono de Fallback de Imagen.'
  }
];
