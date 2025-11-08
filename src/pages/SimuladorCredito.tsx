import React, { useEffect, useMemo, useState } from 'react';

type TipoVehiculo = 'Nuevo' | 'Usado' | '';
type ActividadEconomica = 'Empleado' | 'Independiente' | 'Pensionado' | '';

type Pago = {
  mes: number;
  cuota: number;
  interes: number;
  abonoCapital: number;
  saldoRestante: number;
};

const formatearMoneda = (valor: number) => {
  try {
    return valor
      .toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(/\u200E/g, '');
  } catch {
    return `$${valor.toFixed(2)}`;
  }
};

const parseMoneda = (valor: string) => {
  // Normaliza formatos comunes en CO: "30.000.000", "30,000,000", "30.000,50"
  const s = valor.replace(/[^0-9.,]/g, '');
  if (!s) return 0;
  let normalized = s;
  if (s.includes(',') && s.includes('.')) {
    // Asumir '.' miles y ',' decimales
    normalized = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (s.includes(',')) {
    // Puede ser decimal con ',' o miles con ','; trátalo como decimal
    normalized = s.replace(/,/g, '.');
  } else if (s.includes('.')) {
    // Sin comas: considerar '.' como separador de miles, eliminar todos
    normalized = s.replace(/\./g, '');
  } else {
    // Solo dígitos
    normalized = s;
  }
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

const usarFormatoMostrar = (valor: string) => {
  // Mantener solo dígitos para máscara, insertar puntos como separadores de miles
  const digits = valor.replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const calcularCuota = (valorCredito: number, interesMensual: number, plazoMeses: number) => {
  if (valorCredito <= 0 || plazoMeses <= 0) return 0;
  return (valorCredito * interesMensual) / (1 - Math.pow(1 + interesMensual, -plazoMeses));
};

const generarPlanPagos = (valorCredito: number, interesMensual: number, plazoMeses: number, cuota: number): Pago[] => {
  const pagos: Pago[] = [];
  let saldoRestante = valorCredito;
  for (let mes = 1; mes <= plazoMeses; mes++) {
    const interes = saldoRestante * interesMensual;
    const abonoCapital = cuota - interes;
    saldoRestante = Math.max(saldoRestante - abonoCapital, 0);
    pagos.push({ mes, cuota, interes, abonoCapital, saldoRestante });
  }
  return pagos;
};

const SimuladorCredito: React.FC = () => {
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>('');
  const [valorVehiculoRaw, setValorVehiculoRaw] = useState('');
  const [cuotaInicialTiene, setCuotaInicialTiene] = useState('');
  const [cuotaInicialRaw, setCuotaInicialRaw] = useState('');
  const [plazoMeses, setPlazoMeses] = useState<number>(0);
  const [edad, setEdad] = useState('');
  const [actividad, setActividad] = useState<ActividadEconomica>('');
  const [tipoContrato, setTipoContrato] = useState('');
  const [ingresosRaw, setIngresosRaw] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [showResults, setShowResults] = useState(false);

  const valorVehiculo = parseMoneda(valorVehiculoRaw);
  const cuotaInicialValor = parseMoneda(cuotaInicialRaw);
  const ingresosMensuales = parseMoneda(ingresosRaw);

  const interesAnual = 0.12;
  const interesMensual = interesAnual / 12;

  const valorCredito = Math.max(valorVehiculo - (cuotaInicialTiene === 'si' ? cuotaInicialValor : 0), 0);

  const cuota = useMemo(() => calcularCuota(valorCredito, interesMensual, plazoMeses || 0), [valorCredito, interesMensual, plazoMeses]);

  const pagos = useMemo(() => generarPlanPagos(valorCredito, interesMensual, plazoMeses || 0, cuota || 0), [valorCredito, interesMensual, plazoMeses, cuota]);

  const puedeCalcular = tipoVehiculo && valorVehiculo > 0 && plazoMeses > 0 && edad && actividad && ingresosMensuales > 0 && ciudad;

  // Ocultar resultados si el usuario modifica cualquier entrada
  useEffect(() => {
    setShowResults(false);
  }, [
    tipoVehiculo,
    valorVehiculoRaw,
    cuotaInicialTiene,
    cuotaInicialRaw,
    plazoMeses,
    edad,
    actividad,
    tipoContrato,
    ingresosRaw,
    ciudad,
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-[#145069] dark:text-blue-300 text-center">Simulador de Crédito de Vehículo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Tipo de vehículo</label>
            <select value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value as TipoVehiculo)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
              <option value="">Seleccione</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Usado">Usado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Costo aproximado del vehículo</label>
            <input value={valorVehiculoRaw} onChange={(e) => setValorVehiculoRaw(usarFormatoMostrar(e.target.value))} placeholder="Ingrese el costo del vehículo" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">¿Cuentas con cuota inicial?</label>
            <select value={cuotaInicialTiene} onChange={(e) => setCuotaInicialTiene(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
              <option value="">Seleccione</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          {cuotaInicialTiene === 'si' && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ingresa tu cuota inicial</label>
              <input value={cuotaInicialRaw} onChange={(e) => setCuotaInicialRaw(usarFormatoMostrar(e.target.value))} placeholder="Ingrese la cuota inicial" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Plazo en meses</label>
            <select value={plazoMeses || ''} onChange={(e) => setPlazoMeses(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
              <option value="">Seleccione</option>
              {[12,24,36,48,60,72,84].map((m) => (
                <option key={m} value={m}>{m} meses</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Edad del cliente</label>
            <input value={edad} onChange={(e) => setEdad(e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ingrese su edad" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Actividad económica principal</label>
            <select value={actividad} onChange={(e) => setActividad(e.target.value as ActividadEconomica)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
              <option value="">Seleccione</option>
              <option value="Empleado">Empleado</option>
              <option value="Independiente">Independiente</option>
              <option value="Pensionado">Pensionado</option>
            </select>
          </div>
          {actividad === 'Empleado' && (
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Tipo de contrato</label>
              <select value={tipoContrato} onChange={(e) => setTipoContrato(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
                <option value="">Seleccione</option>
                <option value="Prestación de servicio">Prestación de servicio</option>
                <option value="Indefinido">Indefinido</option>
                <option value="Fijo">Fijo</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ingresos mensuales</label>
            <input value={ingresosRaw} onChange={(e) => setIngresosRaw(usarFormatoMostrar(e.target.value))} placeholder="Ingrese sus ingresos mensuales" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Ciudad</label>
            <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
              <option value="">Seleccione una ciudad</option>
              {['Bogotá','Medellín','Cali','Barranquilla','Cartagena','Cúcuta','Bucaramanga','Pereira','Santa Marta','Manizales','Ibagué','Villavicencio','Neiva','Pasto','Popayán','Quibdó','Armenia','Sincelejo','Montería','Valledupar','Riohacha','Tumaco','Florencia','Yopal'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            disabled={!puedeCalcular}
            onClick={() => setShowResults(true)}
            className="w-full py-3 rounded-full text-white text-lg bg-[#6B2EE6] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5a25b5] transition-colors"
          >
            Calcular
          </button>
        </div>
        {puedeCalcular && showResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Resultados</h3>
            <div className="mt-2 text-gray-700 dark:text-gray-200 space-y-1">
              <p>Valor del vehículo (COP): {formatearMoneda(valorVehiculo)}</p>
              <p>Cuota inicial (COP): {formatearMoneda(cuotaInicialTiene === 'si' ? cuotaInicialValor : 0)}</p>
              <p>Valor del crédito (COP): {formatearMoneda(valorCredito)}</p>
              <p>Plazo en meses: {plazoMeses}</p>
              <p className="font-bold">Cuota mensual (COP): {formatearMoneda(cuota)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">El monto aprobado y la tasa dependerán de tu información financiera y nuestro análisis crediticio. El valor indicado no incluye seguros.</p>
            </div>
          </div>
        )}
      </div>

      {puedeCalcular && showResults && (
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Plan de Pagos (COP)</h3>
          <div className="overflow-x-auto mt-3">
            <table className="min-w-full border border-gray-200 dark:border-slate-700 text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300">Mes</th>
                  <th className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300">Cuota (COP)</th>
                  <th className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300">Interés (COP)</th>
                  <th className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300">Abono Capital (COP)</th>
                  <th className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300">Saldo Restante (COP)</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.mes} className="odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800">
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 text-center">{p.mes}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 text-center">{formatearMoneda(p.cuota)}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 text-center">{formatearMoneda(p.interes)}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 text-center">{formatearMoneda(p.abonoCapital)}</td>
                    <td className="px-3 py-2 border-b border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 text-center">{formatearMoneda(Math.max(p.saldoRestante, 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimuladorCredito;
