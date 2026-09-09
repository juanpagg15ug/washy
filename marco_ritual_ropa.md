# Marco de diseño: sistema de ropa limpia y clóset ordenado

## 1. Reencuadre del problema

No es un cuello de botella único. Es un **funnel de 6+ pasos donde cada transición tiene su propia probabilidad de fuga**:

```
Decidir lavar → Iniciar máquina → [zona ciega: ~45 min sin verlo]
             → Sacarla a tiempo → Colgar a secar (sin secadora, depende del sol)
             → Ropa seca → Subirla al cuarto (a veces otra persona la sube)
             → Doblar → Guardar en clóset
             → Uso → Canasto de sucia se acumula
```

Como cada paso puede fallar independientemente, la probabilidad de que **una sola tanda** llegue completa y ordenada al clóset se derrumba mientras más pasos tenga la cadena — aunque cada paso individual "casi siempre" se logre. Esto no es inconsistencia de carácter: es la matemática normal de un proceso largo sin puntos de recuperación.

**Consecuencia de diseño:** el sistema no puede depender de que *tú* recuerdes activamente cada transición. Necesita puntos de recuperación en cada fuga, no solo motivación al inicio.

## 2. Los tres tipos de fuga (no se resuelven con la misma herramienta)

| Tipo de fuga | Ejemplo | Qué NO la resuelve | Qué SÍ la resuelve |
|---|---|---|---|
| **Restricción externa** | Secado sin secadora, depende del sol | Recordatorios, fuerza de voluntad | Decidir el *momento de inicio* con la restricción ya calculada (semáforo horario) |
| **Zona ciega / memoria de trabajo** | Olvidar que la lavadora sigue corriendo, olvidar entrar la ropa que alguien más colgó | Listas, buenas intenciones | Temporizador activo con notificación de regreso forzada |
| **Energía / arranque** | Doblar a las 8pm sin nada de disciplina | Exigir el resultado completo | Nivel mínimo predefinido sin culpa (Elastic Habits) |

Tu propio ranking confirma este orden de dificultad real:
1. **Secado** (restricción externa — la más difícil, no depende de ti)
2. **Zona ciega del lavado** (memoria de trabajo)
3. **Doblado a las 8pm** (energía)
4. **Canasto acumulándose** (la menos urgente por ahora)

## 3. Límite de scope: círculo de control

La app vive **dentro de tu círculo de control**. Lo que hacen otros (alguien te sube la ropa mientras trabajas) es un **evento externo que dispara tu flujo**, nunca algo que la app intenta gestionar o corregir. El único punto de control tuyo ahí es: *qué haces tú cuando encuentras la ropa ya en tu cuarto.*

## 4. Visión vs. sistema operativo diario

Aquí hay una tensión que ya nombraste tú mismo y vale la pena resolverla explícitamente, porque si no, sabotea el diseño:

- **La visión** (Marie Kondo, clóset con 12 zapateras, todo en su lugar) es válida y puede vivir como el "norte" del proyecto — la imagen que te recuerda por qué importa.
- **El sistema operativo diario** no puede exigir ese nivel. Si cada día el sistema te pide el estándar Marie Kondo, vuelves al perfeccionismo que ya identificaste como enemigo. El sistema diario opera en modo **Elastic Habits**: mini (mover ropa de la cama a una silla), plus (doblar lo urgente), elite (clóset completo tipo Kondo) — y el nivel se elige el mismo día, no se planea.

**Regla de diseño:** la visión no aparece en cada interacción diaria. Aparece como recordatorio ocasional de "para qué", no como estándar de cumplimiento.

## 5. Scope v1 — dentro (para no repetir el error de sistemas anteriores)

- Semáforo horario de inicio (hora + clima/sol si es posible) → ataca la fuga #1, la más difícil
- Temporizador de transición forzosa (lavado → colgar) → ataca la fuga #2
- Niveles Elastic Habits para doblado/guardado → ataca la fuga #3, sin exigir el estándar Kondo
- Registro de estado por tanda (última vez lavada) tipo barras Tody, sin fechas de vencimiento culposas
- **Sprint semanal ligero** (de Scrum): marco de expectativa, no compromiso rígido — ej. "esta semana, máximo 3 tandas", ajustado por Heijunka/demanda variable, nunca un checklist que hay que cumplir sí o sí
- **Definition of Done por nivel** (de Scrum, cruzado con Elastic Habits): mini/plus/elite tienen cada uno una definición explícita y declarada de antemano de qué cuenta como "hecho" — elimina la ambigüedad de si algo "cuenta" y le pone cierre formal a la tarea (ataca el Efecto Zeigarnik directamente)
- **Captura de impulso** (de GTD): un botón de un toque para guardar la intención de lavar cuando llega en mal momento (ej. 10am trabajando), sin exigir ejecución inmediata — se mueve al backlog con prioridad alta y espera la próxima ventana válida del semáforo

## 6. Fuera de scope v1 (para revisar después, no ahora)

- Organización tipo Marie Kondo del clóset completo / sistema de zapateras
- Gestión de lo que hacen otras personas en la casa
- Cualquier otro ritual ejecutivo (cama, dientes, oficina) — aunque comparta filosofía, es un dominio aparte
- Gamificación tipo Habitica (ya descartada explícitamente por sentirse infantil)
- Retrospectiva tipo Scrum (reflexión de sistema, no de desempeño) — valiosa pero no urgente para v1

### Descartado explícitamente (para que no vuelva a aparecer como tentación)

- **Daily standup / cadencia de rendición de cuentas diaria** (Scrum y 4 Disciplinas de la Ejecución) — circular en un sistema solo-usuario; el time-check del ritual de Patric ya cumple esa función sin ceremonia extra
- **Story points, burndown chart, roles tipo Product Owner/Scrum Master** — complejidad de equipo sin función real para un sistema de una sola persona

### Wishlist para versiones futuras (no v1, no v2 necesariamente — solo anotado para no perderlo)

- **Integración con Whering** (app de inventario de guardarropa): útil como fuente de verdad de qué prendas existen y su categoría, para no reconstruir el diccionario de prendas desde cero. **Nota de factibilidad:** Whering es una app propietaria sin API pública documentada — hoy no hay forma real de conectarla automáticamente. Queda como intención, no como dependencia de arquitectura, a menos que en el futuro ofrezcan API para desarrolladores.

## 7. WIP, backlog, flujo y demanda variable

Hasta la sección 6 el marco resuelve **ejecución** (cómo no quedarte a medias en una tanda). Pero no resuelve **flujo** — cuánta ropa entra al sistema, a qué ritmo, y qué pasa cuando la entrada supera tu capacidad real. Ahí es donde nacieron las 10 tandas la primera vez: no porque cada tanda individual fallara, sino porque el sistema nunca tuvo un límite de cuánto podía acumular antes de colapsar.

**Límite de WIP (Work In Progress, de Kanban):** en vez de dejar que el número de tandas pendientes crezca sin techo, el sistema define un máximo de tandas "activas" a la vez (probablemente 1, quizás 2). Todo lo demás no desaparece — vive en el **backlog**, visible pero explícitamente *fuera de la atención activa* hasta que haya espacio. Esto es distinto a una lista de pendientes normal: el backlog no genera culpa porque su función declarada es *esperar*, no *estar atrasado*.

**Triage del backlog, no procesamiento en orden de llegada:** cuando hay espacio para activar una tanda nueva, no se elige "la más vieja" — se elige la más crítica según uso real (esto ya lo intuiste en la conversación con Gemini: "de 10 tandas, solo 2 son de supervivencia esta semana"). El resto puede envejecer en el backlog sin culpa mientras no sea crítico.

**Demanda variable según actividad (esto es nuevo y es clave):** el volumen y tipo de ropa sucia no es constante — depende de lo que hiciste. Gym genera categoría "Performance & Tech" a mayor ritmo. Quedarte en casa casi no genera demanda. Una fiesta genera una prenda específica fuera del ciclo normal. Esto convierte tu sistema de reactivo ("veo que hay mucho, lavo") a **predictivo** ("si esta semana tengo 3 días de gym, sé que la categoría Tech va a tocar techo antes que las demás").

Esto se conecta directo con el semáforo horario ya diseñado: no solo responde "¿es buen momento para lavar?", sino "¿qué categoría específica necesita salir primero, dado lo que he hecho estos días?"

**Otras piezas de flujo evaluadas y su función:**

| Concepto | Función | Estado |
|---|---|---|
| Personal Kanban (Benson/DeMaria) | Nombra formalmente lo que ya tienes: visualizar + limitar WIP | Vocabulario, no cambia diseño |
| Pull vs. Push | Solo entra trabajo nuevo cuando hay capacidad libre, nunca por defecto | Ya integrado vía WIP + triage |
| Ley de Little (tiempo de flujo = WIP ÷ throughput) | Justificación matemática de por qué bajar el WIP acelera, no limita | Ya integrado, sirve como argumento cuando la tentación diga "mete una más" |
| Heijunka / nivelación de carga (Toyota) | Distribuir el trabajo parejo en el tiempo en vez de en ráfagas | Ya integrado vía "máximo 1-2 tandas/día" + Sprint semanal ligero |


## 8. Clasificación: ambigüedad, miedo y falta de guía

Este trigger no había aparecido en el mapeo original. Ocurre en un solo momento del proceso (antes de lavar, por tipo de tela/cuidado: Soft/Tech/Armor) — el clóset usa una taxonomía distinta pero ya aprendida y estable (por tipo de prenda física, en 4 estanterías), así que ahí no hay ambigüedad nueva, solo espacio limitado (ver sección 9).

Los tres mecanismos que reportaste combinados necesitan soluciones distintas, no una sola:

| Mecanismo | Solución de diseño |
|---|---|
| Ambigüedad | Reglas deterministas ("si es X, va en Y"), no juicio en el momento |
| Miedo a arruinar la prenda | Default seguro: ante la duda, siempre la opción más conservadora (agua fría, ciclo suave) |
| Falta de guía | Un diccionario personal de prendas que crece: decides una vez por prenda nueva, queda memorizado, nunca vuelves a decidir por esa prenda |

Dato clave: **no es cualquier prenda la que genera duda — es específicamente lo nuevo o poco usual.** Tu ropa habitual ya está resuelta en tu cabeza sin fricción. Esto reduce mucho el scope real del problema: no necesitas una regla perfecta para toda tu ropa, necesitas un mecanismo barato para las excepciones, que además se vuelve más pequeño con el tiempo (cada prenda nueva clasificada una vez deja de ser una excepción).

## 9. El problema de bootstrap y el tedio del doblado

### Observación de campo (foto del clóset real)

- Pilas planas/sueltas en las repisas, no doblado vertical tipo archivo — confirma que sacar una prenda de en medio colapsa el resto (la causa estructural del patrón desde la infancia).
- El área de colgado está prácticamente vacía y hay cajones organizadores pequeños casi sin uso — pero **no por infrautilización**: está vacía porque el backlog vive fuera del cuarto y nunca completa el viaje hasta el clóset. Hay capacidad real disponible que el sistema nunca llega a usar.
- Hay ropa en el piso alrededor del clóset — una tercera zona no reconocida formalmente por el sistema (ni "clóset" ni "canasto de sucia"), que funciona como backlog informal.
- Parte del espacio de las repisas está compartido con objetos que no son ropa (bocina, cajas, decoración) — espacio "robado" al inventario de ropa sin que nadie lo haya decidido así.

**Conclusión:** el clóset no es el sitio del problema — es el espejo del estado del funnel completo. La foto no pide rediseñar el clóset; pide resolver el suministro (el backlog fuera del cuarto) y, una vez que fluya, aprovechar la capacidad de colgado ya disponible para reducir la dependencia del doblado que ya sabemos que te aburre.

Dos hallazgos nuevos que cambian el orden de trabajo:

**Nunca has visto el sistema en estado cero.** No sabes si tu inventario cabe en las 4 estanterías porque siempre ha habido WIP — ropa en tránsito, nunca todo adentro a la vez. Esto es un **problema de bootstrap**, distinto a un problema de diseño de sistema: no puedes diseñar la capacidad correcta de un sistema que nunca has visto vacío. Antes de afinar reglas de mantenimiento, hace falta un evento único de reinicio — procesar todo el WIP acumulado una sola vez para conocer tu línea base real (cuánta ropa tienes, si cabe, qué sobra). Esto no es parte del sistema diario; es un evento aparte, una sola vez, con su propio scope acotado (no confundir con el proyecto completo de Marie Kondo del punto 6, que sí puede ser recurrente y más ambicioso).

**El doblado no es un problema de energía, es tedio puro.** Confirmaste que no es que te falte disciplina a las 8pm — es que el movimiento repetitivo en sí te aburre, sin importar la hora. Esto cambia la solución: Elastic Habits (bajar el nivel exigido) ayuda pero no ataca la causa. Lo que sí ataca el tedio es **agrupar el doblado con estímulo externo** (el mismo principio del "ancla auditiva" que ya tenía el ritual de Patric: música, podcast, algo que ocupe la atención mientras las manos hacen algo aburrido). Vale la pena considerar también reducir el volumen que necesita doblado — colgar más, usar contenedores para lo que no necesita doblado técnico — en vez de exigir que todo pase por la misma técnica que te aburre.

## 10. Marcos de referencia usados

- **B=MAP (BJ Fogg)** — el apalancamiento está en bajar Habilidad requerida y diseñar el Prompt correcto, no en subir Motivación
- **Elastic Habits (Stephen Guise)** — niveles mini/plus/elite elegidos el mismo día según energía real
- **Implementation intentions (Gollwitzer)** — reglas "si pasa X, hago Y" en vez de decisiones en el momento
- **Carga cognitiva (Sweller)** — una pantalla, un paso a la vez, no por estética sino por límite real de memoria de trabajo
- **Efecto Zeigarnik** — una tarea sin cierre formal (ropa limpia sin guardar) sigue ocupando atención aunque esté 90% resuelta
- **Círculo de control (Covey)** — límite explícito de scope: lo tuyo vs. lo de otros
- **Kanban (límites de WIP)** — capar cuántas tandas están "activas" a la vez para que el backlog nunca vuelva a convertirse en una montaña paralizante
- **Teoría de restricciones (Goldratt)** — el sistema completo va tan rápido como su restricción más lenta (aquí: el secado sin secadora); optimizar otros pasos sin atender esa restricción no cambia el resultado final
- **Pronóstico de demanda** — usar patrones de actividad (gym, salidas, fiestas, días en casa) como señal predictiva de qué categoría de ropa va a tocar techo primero, en vez de reaccionar solo cuando ya está acumulada
- **Recognition over recall (heurística de usabilidad, Nielsen)** — el diccionario de prendas existe precisamente para que no tengas que *recordar* la regla cada vez; solo *reconoces* la prenda y el sistema ya sabe
- **4 Disciplinas de la Ejecución (Covey/McChesney)** — adoptadas parcialmente: medidas de predicción (lead) en vez de resultado (lag) y un marcador simple ya están integrados vía Elastic Habits y las barras tipo Tody; la cadencia de rendición de cuentas semanal formal se descarta por circular (un sistema solo-usuario no puede rendirse cuentas a sí mismo de forma no-circular) y queda pendiente de resolver vía el tono del "buddy", no como ritual aparte
- **Stimulus bundling / habit pairing** — emparejar una tarea tediosa (doblado) con un estímulo agradable (audio) para hacerla tolerable, en vez de intentar resolver el tedio con fuerza de voluntad
- **Bootstrap / cold start** — un sistema de mantenimiento no puede diseñarse correctamente sin conocer su estado inicial; el primer evento no es "usar el sistema", es "vaciar el WIP una vez para medir la línea base"

## 11. Preguntas abiertas antes de pasar a arquitectura

1. ¿El semáforo necesita datos reales de clima/sol (vía API), o basta con hora del día como proxy razonable para v1?
2. Para el nivel "mini" del doblado — ¿cuál es tu piso real y honesto? (ej. "mover de la cama a una silla" contaba antes como fuga; ¿ahora cuenta como victoria mínima válida?)
3. ¿Quieres que el sistema pregunte tu nivel (mini/plus/elite) cada vez, o que asuma mini por default y tú "subas" solo si te sientes con energía?
4. ¿Cuál sería tu límite de WIP realista — cuántas tandas "activas" puede sostener tu cabeza a la vez sin que se sienta como sobrecarga? ¿Una, o dos si son de categorías distintas?
5. Sobre la demanda variable: ¿el registro de actividad (gym, fiesta, día en casa) lo vas a ingresar tú manualmente cada día, o preferirías que se alimente de algo que ya llevas (calendario, checklist de gym)?
6. ¿El backlog necesita ser visible siempre, o preferirías que solo aparezca cuando activamente decides "qué sigue"?
7. Para el default seguro de clasificación (cuando hay duda y miedo a arruinar la prenda): ¿"agua fría + ciclo suave" es un default que de verdad te tranquiliza, o hay excepciones donde ni eso te sentirías seguro y preferirías separar esa prenda para lavado manual/aparte?
8. ¿Cómo te gustaría registrar una prenda nueva en el diccionario la primera vez — una foto rápida con la categoría, o un texto corto tipo "camisa gris rayas = Soft"?
9. Sobre el evento de bootstrap: ¿estás dispuesto a agendar una sola sesión (probablemente larga, un fin de semana) para procesar todo el WIP acumulado y conocer tu línea base real, antes de que el sistema de mantenimiento diario empiece a correr?
10. Sobre el tedio del doblado: ¿qué proporción de tu ropa hoy *podría* colgarse en vez de doblarse si reorganizáramos el clóset — o la mayoría de tus 4 estanterías son de prendas que sí o sí necesitan doblado?
