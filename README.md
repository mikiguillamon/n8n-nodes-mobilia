# n8n-nodes-mobilia

Node de comunidad para trabajar con la API pública de Mobilia desde n8n.

## Qué hace

- Autenticación con `client_id` y `client_secret`
- Obtención y renovación automática del token OAuth
- Cobertura de todos los endpoints publicados en el Swagger actual
- Operaciones preconfiguradas para consultas, altas, cambios y borrados
- Selectores dinámicos para agentes, cuentas, campañas, grupos, estados y tipos cuando la API dispone de esos catálogos
- Modo de petición personalizada para endpoints o combinaciones que prefieras construir manualmente

## Requisitos

- Node.js 20 o 22 LTS para desarrollar o compilar el paquete

## Credenciales

La credencial del nodo pide:

- `Base URL`
- `Client ID`
- `Client Secret`
- `License Key`

Por defecto la URL es `https://api.mobiliagestion.es`.

De forma opcional también puedes indicar `License Validation URL` si quieres validar la licencia contra tu propio servidor. Si ese campo queda vacío, el nodo usa la validación local configurada en el paquete.

## Licencia del nodo

El nodo puede distribuirse libremente, pero necesita una licencia para ejecutarse. En la configuración actual, cualquier clave con 10 o más caracteres activa el nodo.

Si rellenas `License Validation URL`, el nodo hará un `POST` JSON a ese endpoint con este payload:

```json
{
  "licenseKey": "tu-clave",
  "product": "n8n-nodes-mobilia",
  "nodeType": "n8n-nodes-mobilia.mobilia",
  "nodeVersion": 1,
  "baseUrl": "https://api.mobiliagestion.es",
  "clientId": "..."
}
```

El servidor puede responder con cualquiera de estos flags booleanos: `valid`, `active`, `licensed` o `allowed`. También puede devolver `message`, `expiresAt` o `cacheTtlSeconds` para controlar mejor la expiración de la validación.

## Uso en n8n

El nodo está pensado para que las operaciones más habituales se puedan configurar sin tener que pelearse con nombres de parámetros de la API. En las búsquedas de clientes, inmuebles, tareas, visitas y solicitudes se agrupan los filtros y, cuando Mobilia expone catálogos auxiliares, el nodo carga las opciones automáticamente.

Si necesitas cubrir un caso no contemplado en el formulario, puedes usar `Petición personalizada` y enviar la ruta, los parámetros y el body directamente.

## Agentes y MCP

El nodo está marcado como `usableAsTool`, así que puede utilizarse directamente como herramienta dentro de los agentes de n8n.

Si en algún momento necesitas exponer estas operaciones hacia clientes MCP externos, lo normal es montar un workflow en n8n y publicarlo con `MCP Server Trigger`.

## Referencia

- Documentación oficial de Mobilia: [Swagger](https://api.mobiliagestion.es/swagger/index.html)
