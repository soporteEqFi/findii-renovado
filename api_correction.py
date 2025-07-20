# Corrección para la función get_all_data en la API
# El problema está en el mapeo de campos en la sección donde se combinan los datos

def get_all_data(self):
    max_retries = 3
    retry_delay = 4  # seconds

    for attempt in range(max_retries):
        try:
            # Consultas a las tablas
            tablas = {
                "agents_info": "ASESORES",
                "solicitantes": "SOLICITANTES",
                "location": "UBICACION",
                "economic_activity": "ACTIVIDAD_ECONOMICA",
                "financial_info": "INFORMACION_FINANCIERA",
                "product": "PRODUCTO_SOLICITADO",
                "solicitud": "SOLICITUDES",
                "documentos": "PRUEBA_IMAGEN"
            }

            # Consultas a las tablas de Supabase en un solo paso con ordenamiento descendente
            registros = {}
            
            # Para cada tabla, aplicar ordenamiento descendente según su clave primaria
            for clave, tabla in tablas.items():
                if tabla == "SOLICITANTES":
                    # Ordenar por solicitante_id descendente
                    registros[clave] = supabase.table(tabla).select("*").order("solicitante_id", desc=True).execute().data
                elif tabla == "SOLICITUDES":
                    # Ordenar por id descendente
                    registros[clave] = supabase.table(tabla).select("*").order("id", desc=True).execute().data
                elif tabla == "PRUEBA_IMAGEN":
                    # Ordenar por id descendente
                    registros[clave] = supabase.table(tabla).select("*").order("id", desc=True).execute().data
                else:
                    # Para las demás tablas, ordenar por id descendente
                    registros[clave] = supabase.table(tabla).select("*").order("id", desc=True).execute().data

            if all(len(value) == 0 for value in registros.values()):
                return jsonify({"mensaje": "No hay registros en estas tablas"}), 200

            # Combinar datos por cada solicitante
            solicitantes = registros.get("solicitantes", [])
            activity = registros.get("economic_activity", [])
            financial = registros.get("financial_info", [])
            location = registros.get("location", [])
            product = registros.get("product", [])
            solicitud = registros.get("solicitud", [])
            documentos = registros.get("documentos", [])
            
            datos_combinados = []
            
            for solicitante in solicitantes:
                actividad = next((a for a in activity if a.get("solicitante_id") == solicitante.get("solicitante_id")), {})
                finanzas = next((f for f in financial if f.get("solicitante_id") == solicitante.get("solicitante_id")), {})
                ubicacion = next((l for l in location if l.get("solicitante_id") == solicitante.get("solicitante_id")), {})
                producto = next((p for p in product if p.get("solicitante_id") == solicitante.get("solicitante_id")), {})
                solicitud_info = next((s for s in solicitud if s.get("solicitante_id") == solicitante.get("solicitante_id")), {})
                documento = next((d for d in documentos if d.get("id_solicitante") == solicitante.get("solicitante_id")), {})
                
                datos_combinados.append({
                    # Info solicitante - CORREGIDO: Mapear ambos nombres para compatibilidad
                    "id_solicitante": solicitante.get("solicitante_id", "N/A"),
                    "nombre": solicitante.get("nombre_completo", "N/A"),  # Campo principal
                    "nombre_completo": solicitante.get("nombre_completo", "N/A"),  # Campo alternativo
                    "tipo_documento": solicitante.get("tipo_documento", "N/A"),
                    "fecha_nacimiento": solicitante.get("fecha_nacimiento", "N/A"),
                    "numero_documento": solicitante.get("numero_documento", "N/A"),
                    "correo": solicitante.get("correo_electronico", "N/A"),  # Campo principal
                    "correo_electronico": solicitante.get("correo_electronico", "N/A"),  # Campo alternativo
                    "profesion": solicitante.get("profesion", "N/A"),
                    "personas_a_cargo": solicitante.get("personas_a_cargo", "N/A"),
                    "numero_celular": solicitante.get("numero_celular", "N/A"),
                    "nivel_estudio": solicitante.get("nivel_estudio", "N/A"),
                    "estado_civil": solicitante.get("estado_civil", "N/A"),
                    
                    # Actividad económica - CORREGIDO: Mapear ambos nombres
                    "actividad_economica": actividad.get("actividad_economica", "N/A"),
                    "cargo_actual": actividad.get("cargo_actual", "N/A"),
                    "empresa_labora": actividad.get("empresa_labora", "N/A"),
                    "direccion_empresa": actividad.get("direccion_empresa", "N/A"),
                    "telefono_empresa": actividad.get("telefono_empresa", "N/A"),
                    "tipo_de_contrato": actividad.get("tipo_contrato", "N/A"),  # Campo principal
                    "tipo_contrato": actividad.get("tipo_contrato", "N/A"),  # Campo alternativo
                    "fecha_vinculacion": actividad.get("fecha_vinculacion", "N/A"),
                    
                    # Finanzas - CORREGIDO: Mapear ambos nombres
                    "ingresos": finanzas.get("ingresos", "N/A"),
                    "total_egresos": finanzas.get("total_egresos", "N/A"),  # Campo principal
                    "egresos": finanzas.get("total_egresos", "N/A"),  # Campo alternativo
                    "cuota_inicial": finanzas.get("cuota_inicial", "N/A"),
                    "porcentaje_financiar": finanzas.get("porcentaje_financiar", "N/A"),
                    "total_activos": finanzas.get("total_activos", "N/A"),
                    "total_pasivos": finanzas.get("total_pasivos", "N/A"),
                    "valor_inmueble": finanzas.get("valor_inmueble", "N/A"),
                    
                    # Ubicación - CORREGIDO: Mapear ambos nombres
                    "ciudad_gestion": ubicacion.get("ciudad_gestion", "N/A"),
                    "departamento": ubicacion.get("departamento", "N/A"),
                    "direccion": ubicacion.get("direccion_residencia", "N/A"),  # Campo principal
                    "direccion_residencia": ubicacion.get("direccion_residencia", "N/A"),  # Campo alternativo
                    "barrio": ubicacion.get("barrio", "N/A"),
                    "estrato": ubicacion.get("estrato", "N/A"),
                    "tipo_vivienda": ubicacion.get("tipo_vivienda", "N/A"),
                    
                    # Producto - CORREGIDO: Mapear ambos nombres
                    "tipo_credito": producto.get("tipo_credito", "N/A"),  # Campo principal
                    "tipo_de_credito": producto.get("tipo_credito", "N/A"),  # Campo alternativo
                    "observacion": producto.get("observacion", "N/A"),
                    "plazo_meses": producto.get("plazo_meses", "N/A"),
                    "segundo_titular": producto.get("segundo_titular", "N/A"),
                    "estado": producto.get("estado", "N/A"),
                    "informacion_producto": producto.get("informacion_producto", "N/A"),
                    
                    # Documentos
                    "archivos": documento.get("imagen", "N/A"),
                    
                    # Solicitud
                    "banco": solicitud_info.get("banco", "N/A"),
                    "created_at": solicitud_info.get("created_at", "N/A"),
                })
            
            # Ordenar datos_combinados por id_solicitante de forma descendente
            datos_combinados_ordenados = sorted(datos_combinados, key=lambda x: x.get("id_solicitante", 0), reverse=True)
            
            # Mantener los registros originales y agregar los datos combinados
            return jsonify({
                "registros": registros,
                "datos_combinados": datos_combinados_ordenados
            }), 200

        except Exception as e:
            if isinstance(e, OSError) and e.errno == errno.WSAEWOULDBLOCK:
                print(f"Attempt {attempt + 1} failed due to non-blocking socket operation: {e}")
                if attempt < max_retries - 1:
                    std_time.sleep(retry_delay)
                else:
                    return jsonify({"mensaje": "Error en la lectura debido a operación de socket no bloqueante"}), 500
            else:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    std_time.sleep(retry_delay)
                else:
                    return jsonify({"mensaje": "Error en la lectura"}), 500 