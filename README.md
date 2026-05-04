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

Por defecto la URL es `https://api.mobiliagestion.es`.

## Uso en n8n

El nodo está pensado para que las operaciones más habituales se puedan configurar sin tener que pelearse con nombres de parámetros de la API. En las búsquedas de clientes, inmuebles, tareas, visitas y solicitudes se agrupan los filtros y, cuando Mobilia expone catálogos auxiliares, el nodo carga las opciones automáticamente.

Si necesitas cubrir un caso no contemplado en el formulario, puedes usar `Petición personalizada` y enviar la ruta, los parámetros y el body directamente.

## Agentes y MCP

El nodo está marcado como `usableAsTool`, así que puede utilizarse directamente como herramienta dentro de los agentes de n8n.

Si en algún momento necesitas exponer estas operaciones hacia clientes MCP externos, lo normal es montar un workflow en n8n y publicarlo con `MCP Server Trigger`.

## Referencia

- Documentación oficial de Mobilia: [Swagger](https://api.mobiliagestion.es/swagger/index.html)
