# Registro de Decisiones de Diseño y UX: Washy OS
**Proyecto:** Local-First ADHD Laundry Ritual OS  
**Fecha:** Septiembre 2026  
**Estado:** Vigente / Aprobado

---

## 1. Contexto y Propósito
Este documento complementa a `marco_ritual_ropa.md` y `ui_architecture.md`. Registra las decisiones críticas de arquitectura conductual, psicología de la interfaz y prevención de autoengaño (anti-avoidance) acordadas durante la construcción del prototipo interactivo omnicanal.

---

## 2. La Simetría de las Dos Mitades (Fases Pasivas vs. Activas)
El proceso de lavado no es un flujo continuo lineal; se compone de dos ciclos físicos simétricos, cada uno con una fase pasiva (trabajo de máquinas o elementos) y una fase activa (esfuerzo humano con riesgo de fuga):

```
[CICLO 1: LAVADO]
├── 1. Fase Pasiva (Lavadora ~45 min): El motor trabaja. El usuario no interviene.
└── 2. Fase Activa (Transición tambor → tendedero): Requiere manos. Sacudida técnica y colgar.
        Punto de fuga: Ropa mojada olvidada en el tambor (olor a humedad).

[CICLO 2: SECADO & CIERRE]
├── 3. Fase Pasiva (Tendedero ~4 a 8 hrs): El sol y el viento trabajan. Lavadora libre.
└── 4. Fase Activa (Descolgar y Doblar): Requiere manos. Subir al cuarto y cerrar.
        Punto de fuga: Ropa tostada días en la cuerda o montaña arrugada en la cama.
```

### Reglas de Diseño Anti-Avoidance (Anti-Evitación):
*   **Prohibido el botón "Dejar secando" antes de colgar:** La interfaz no debe ofrecer escapatorias textuales ambiguas. Mientras la ropa esté mojada dentro de la lavadora, el sistema declara con verdad clínica: *"Ropa mojada esperando en el tambor"*. Solo el botón explícito `[ Ya colgué toda la tanda ]` libera la lavadora en la base de datos y avanza el estado a `DRYING`.
*   **Separar "Descolgar" de "Doblar":** Descolgar libera el tendedero físicamente (permitiendo colgar otra tanda). Doblar ocurre después, en el cuarto. Si se juntan en una sola acción obligatoria, el usuario pospone descolgar durante días por miedo al tedio de doblar.

---

## 3. Secuencia de Cierre: Intención → Acción Física → Registro
Para erradicar la trampa de la **dopamina falsa** (marcar como completada una tarea antes de realizarla con las manos), la pantalla de cierre sigue estrictamente este orden:

1.  **Paso 1: Declarar la Meta (Intención):**  
    El usuario elige su nivel de *Elastic Habits* para hoy según su energía real:
    *   `Mini` (Doblado express a la mitad)
    *   `Plus` (Doblar lo urgente)
    *   `Elite` (Guardado completo en clóset)
2.  **Paso 2: Modo Ejecución con Anclaje Auditivo:**  
    La pantalla **no se cierra ni felicita**. Permanece abierta mostrando la **Definición de Hecho (DoD)** del nivel elegido e incita al emparejamiento de estímulo (*Stimulus Bundling*): *"Ponte audífonos con música o un podcast para vencer el tedio del movimiento repetitivo"*.
3.  **Paso 3: Registrar la Acción Cumplida:**  
    Solo aparece un botón de confirmación: `[ ¡Listo, ya terminé de doblar! 🎉 ]`. Al pulsarlo, se actualiza el estado a `DONE` en SQLite y se muestra el refuerzo positivo. Incluye una opción secundaria para degradar el nivel (ej. de Elite a Mini) si la energía decae a la mitad.

---

## 4. Prevención de la Teoría de las Ventanas Rotas (*Broken Windows*)
El orden en el TDAH no se destruye por la ropa sucia en el canasto, sino por los micro-desórdenes tolerados que invitan al colapso en cadena. Existen dos zonas críticas con dinámicas distintas:

### A. Ventanas Rotas en el Tránsito (Post-Lavado)
*   **La Ventana Rota #1 (Ropa húmeda en tambor cerrado):** Dejar la ropa lavada 3 horas adentro genera olor a humedad. Cuando se saca, da culpa colgarla así o pereza lavarla de nuevo.
    *   *Regla:* Alarma de transición inmediata y estatus honesto: *"Ropa mojada esperando en el tambor"*.
*   **La Ventana Rota #2 (El "Despiece Selectivo" del Tendedero):** Usar la cuerda como clóset exterior (arrancar solo la playera del día dejando el resto colgado). Bloquea el tendedero para nuevas tandas y la ropa se tuesta al sol.
    *   *Regla:* `[ Ya descolgué y subí al cuarto ]` es una acción de todo o nada: el tendedero queda 100% libre.
*   **La Ventana Rota #3 (El "Ping-Pong" Cama-Silla):** Dejar la ropa en la cama para "después". De noche pasa a la silla; de día a la cama. En el tercer viaje termina en el suelo.
    *   *Regla:* El flujo obliga a cerrar el ciclo con la Definición de Hecho (DoD) antes de dar por terminada la tanda.
*   **La Ventana Rota #4 (La primera prenda en el suelo):** En cuanto una prenda toca el piso, el cerebro reclasifica el suelo como basurero textil.
    *   *Regla:* El piso está 100% prohibido como drop zone en Washy.

### B. Ventanas Rotas en el Clóset (Almacén Final)
*   **El "Efecto Jenga" en las repisas:** Pilas horizontales planas de 7 playeras. Al sacar una del medio con prisa, la pila colapsa y se convierte en una masa amorfa.
    *   *Solución:* Doblado vertical (archivo) o migrar prendas al tubo de ganchos.
*   **El Espacio Robado (Objetos no-ropa):** Cajas, bocinas y cables en repisas rompen la frontera visual. Si hay una caja, el cerebro asume que cabe cualquier desorden.
    *   *Regla:* Las repisas de ropa son sagradas; no conviven con objetos ajenos.
*   **El Limbo del Semi-Uso (El piso junto al clóset):** Ropa usada 2 horas dejada en el suelo. Se vuelve un imán de acumulación.
    *   *Solución:* Destino formal de semi-uso (perchero o ganchos detrás de la puerta), nunca el piso.
*   **El Tubo de Colgar Vacío:** Evitar usar ganchos fuerza al usuario al tedio del doblado de repisas, bloqueando la entrada de ropa al clóset.

---

## 5. Gestión del Límite de WIP (2/2) sin Sobrecarga Cognitiva
*   **Prohibición de IDs técnicos:** El usuario jamás debe ver hashes o UUIDs (`batch #8f3a9...`).
*   **Mapeo por Ubicación Física y Tela:** Solo existen 2 ranuras posibles en el mundo físico real:
    *   **Ranura 1 (Lavadora):** Máximo 1 tanda (`WASHING` / `SOAKING`). Se identifica por su categoría (`🛡️ Armor`, `⚡ Tech`, `☁️ Soft`).
    *   **Ranura 2 (Tendedero):** Máximo 1 tanda (`DRYING`). Se identifica por su categoría.
*   **Cero ruido:** En el Dashboard solo existen hasta 2 tarjetas activas directas para retomar. No hay listas desbordantes ni selectores complejos.

---

## 6. Cero Matemáticas y Horas Absolutas
*   **Prohibición de cronómetros regresivos:** No mostrar `34:12 restante`. Las cuentas regresivas aumentan la ceguera temporal y la ansiedad por anticipación.
*   **Hora de Reloj Absoluta:** Siempre mostrar la hora estimada de finalización: *"Termina a las 4:15 PM"*.
*   **Motor de Reconciliación Silencioso (`useReconciliation`):** Si el usuario abandona la app durante horas, al reabrirla la app compara la hora actual contra `expectedEnd`. Si expiró, rescata la tanda al estado de alerta cálida: *"Lavado finalizado a las 4:15 PM. Tu ropa espera en el tambor"*, sin juzgar ni culpar al usuario.

---

## 7. El Ciclo de Vida del Nivel Mini y la Tolerancia Silla-Clóset
¿Qué ocurre si la ropa se queda en la silla en nivel Mini y nunca se pasa al clóset?

### A. La Silla como "Buffer de Consumo Rápido" (No es Deuda Pendiente)
*   **Validez total de Elastic Habits:** Si la app le reclamara al usuario días después *"no has guardado la ropa de la silla en el clóset"*, destruiría la filosofía de Stephen Guise y reviviría la culpa. Para la app, la tanda está **100% CERRADA (`DONE`)**.
*   **Consumo Natural:** En la vida real, una persona sola vacía la silla usándola: el martes toma una playera, el miércoles otra, el jueves un pantalón. Para el viernes, la silla está limpia porque la ropa se consumió directamente de la pila ordenada. La silla limpia actúa como inventario de alta rotación.

### B. El Problema Real: La "Colisión de Tandas" (Buffer Collision)
El peligro ocurre **únicamente cuando llega una NUEVA tanda (Tanda B) y la silla todavía tiene ropa de la anterior (Tanda A)**. Apilar ropa nueva sobre ropa vieja crea inestabilidad y detona la Ventana Rota #2.

### C. La Solución: Umbral de 3 Días (`autoDoneDaysThreshold: 3`)
*   Definido en `packages/washy-core/src/db/schema.ts` (`autoDoneDaysThreshold = 3`).
*   **Micro-Prompt de Despeje Preventivo:** Cuando una tanda nueva entra a fase `CLOSURE`, si la base de datos detecta actividad reciente, muestra un aviso sereno:
    > *"🧺 Aviso de Espacio: Si aún quedan 2-3 prendas de la tanda anterior en la silla, cuélgalas rápido en un gancho o úsalas hoy antes de colocar la nueva tanda."*
*   **Alternativa Física Recomendada:** Sustituir la silla por un **Canasto de Ropa Limpia (Drop Zone formal)**. Mantiene la ropa en rotación activa dentro de un contenedor digno y libera la silla para sentarse.
