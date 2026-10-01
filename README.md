# Derby de Caracoles

Aplicación web de apuestas de carreras de caracoles con datos simulados. Monorepo con React + TypeScript (frontend), Express + TypeScript (backend) y LocalStorage para guardar usuario, sesión, saldo y pagos.

## Requisitos

- Node.js 20.19 o superior (o 22.12+)

## Cómo ejecutarla

```bash
npm install          # instala frontend y backend (npm workspaces)
npm run dev:api      # backend en http://localhost:3001
npm run dev:web      # frontend en http://localhost:5173 (en otra terminal)
```

El frontend redirige `/snailpay` al backend con el proxy de Vite, así que ambos deben estar corriendo.

## Pruebas

```bash
npm test             # backend y frontend (Vitest)
npm run check        # pruebas + typecheck + build + lint
```

## Estructura

```
backend/src/
  app.ts, index.ts            Express (createApp separado para poder probarlo)
  snailpay/                   Pasarela simulada: rutas, reglas, validación, respuestas, configuración
frontend/src/
  features/auth/              Registro, login, sesión, hash de contraseña
  features/payments/          Cliente de SnailPay, validación de tarjeta, servicio de recarga
  features/stats/             Datos simulados y gráficas
  components/, pages/, lib/
```

## SnailPay (pasarela simulada)

`POST /snailpay/v1/payments` con JSON:

`card_number`, `expiration_date` (MM/AA), `cvv`, `cardholder_name`, `transaction_amount` (pesos, máximo 2 decimales, mayor que 0 y hasta 1,000,000), `payer_id`, `payer_email`.

Todas las respuestas (éxito, rechazo y error del sistema) tienen los mismos campos: `id`, `status`, `status_detail`, `transaction_amount`, `date_created`, `authorization_code` (null si no hay cobro aprobado), `reference`, `payer_id`, `payer_email`, `card_number` y `cvv`.

### Cómo reproducir cada respuesta

| Resultado | HTTP | status | status_detail | Cómo provocarlo |
|---|---|---|---|---|
| Cobro exitoso | 201 | approved | accredited | Tarjeta `1234123412341234`, vencimiento `12/26`, CVV `543`, cualquier nombre no vacío y monto > 0 |
| Fondos insuficientes | 402 | rejected | cc_rejected_insufficient_funds | Tarjeta `4000000000000002` |
| Otra tarjeta | 402 | rejected | cc_rejected_other_reason | Cualquier otra tarjeta de 16 dígitos, por ejemplo `1111222233334444` |
| Vencimiento incorrecto | 402 | rejected | cc_rejected_bad_filled_date | Tarjeta de éxito con otro vencimiento, por ejemplo `01/27` |
| CVV incorrecto | 402 | rejected | cc_rejected_bad_filled_security_code | Tarjeta de éxito con otro CVV, por ejemplo `999` |
| Datos inválidos | 422 | rejected | invalid_card_number, invalid_expiration_date, invalid_cvv, invalid_cardholder_name, invalid_amount, invalid_payer | Enviar el campo con formato incorrecto (la interfaz lo valida antes; para verlo usa curl) |
| JSON mal formado | 400 | rejected | invalid_request | Cuerpo que no es JSON válido |
| Error del sistema | 503 | error | system_unavailable | Backend con `SNAILPAY_MODE=down` |
| Lentitud (timeout) | 201 tras la espera | approved | accredited | Backend con `SNAILPAY_MODE=slow` |

El vencimiento solo se valida por formato, nunca contra la fecha actual.

### Modos de falla

Se activan con variables de entorno al iniciar el backend:

```powershell
# PowerShell
$env:SNAILPAY_MODE="down"; npm run dev:api     # error del sistema (503): no aprueba nada
$env:SNAILPAY_MODE="slow"; npm run dev:api     # responde tarde (15 s) y dispara el timeout del frontend (8 s)
Remove-Item Env:SNAILPAY_MODE                  # volver al modo normal
```

```bash
# Bash o Git Bash
SNAILPAY_MODE=down npm run dev:api
SNAILPAY_MODE=slow npm run dev:api
```

Opcionales: `SNAILPAY_SLOW_DELAY_MS` (por defecto 15000), `PORT` (3001) y `CORS_ORIGIN` (http://localhost:5173). Un valor inválido en `SNAILPAY_MODE` impide que el backend arranque.

Ejemplo directo al API (Bash):

```bash
curl -i -X POST http://localhost:3001/snailpay/v1/payments \
  -H "Content-Type: application/json" \
  -d '{"card_number":"1234123412341234","expiration_date":"12/26","cvv":"543","cardholder_name":"Ana Lopez","transaction_amount":100,"payer_id":"u1","payer_email":"ana@example.com"}'
```

En PowerShell, guarda el JSON en un archivo y usa `curl.exe -i -X POST <url> -H "Content-Type: application/json" --data-binary "@body.json"`.

## Decisiones y limitaciones

- La contraseña no se guarda en claro: PBKDF2-SHA256 con 210,000 iteraciones y sal aleatoria por usuario (Web Crypto). Es una simulación local; en un sistema real el hash se haría en el servidor.
- Número de tarjeta y CVV se devuelven en las respuestas y se guardan en LocalStorage porque el enunciado lo pide. Solo deben usarse datos ficticios.
- El saldo solo cambia cuando SnailPay responde 201 con `status: approved`. Cualquier otro resultado (rechazo, error del sistema, timeout, error de red) lo deja intacto.
- Los montos se manejan en centavos enteros.
- Los datos de carreras y apuestas son simulados y se derivan unos de otros: las victorias suman el número de carreras y las apuestas ganadas dependen del ganador de cada carrera.

## Funcionalidades

Terminadas:

- Registro, inicio y cierre de sesión, sesión que persiste al recargar, dashboard solo con sesión activa y saldo inicial de $0.
- Dashboard con nombre, saldo, donut de apuestas, barras de victorias y cierre de sesión.
- SnailPay con éxito, errores de transacción, error del sistema y lentitud.
- Recarga de saldo con manejo de rechazo, error del sistema, timeout (8 s) y error de red.
- Pruebas automáticas de validación, autenticación, hash, cliente de pagos, servicio de recarga, datos simulados y endpoint de SnailPay.

Pendientes y limitaciones conocidas:

- No hay pruebas de componentes ni de extremo a extremo; las gráficas y los formularios se verificaron a mano.
- El historial de pagos se guarda en LocalStorage pero no se muestra en la interfaz.
- Los tipos de SnailPay están duplicados entre frontend y backend.
- El bundle del frontend supera los 500 kB (por la librería de gráficas) y no está dividido.
- No hay aplicación desplegada.