# n8n-nodes-mobilia

Community node de n8n para trabajar con la API pública de Mobilia.

## Qué incluye

- Credencial propia basada en `client_id` + `client_secret`
- Obtención automática del bearer token en `/api/v1/token`
- Caché de token en memoria con renovación automática antes de caducar
- Operaciones predefinidas para todos los endpoints actuales del Swagger
- Formularios tipados para parámetros `path`, `query` y `body` en todas las operaciones predefinidas
- Enums, multiselección y booleanos triestado para no enviar filtros opcionales por accidente
- Modo `Custom Request` para cubrir cambios futuros de la API sin esperar una nueva versión del nodo
- `usableAsTool: true` para poder usarlo directamente como herramienta dentro de un `AI Agent` de n8n

## Compatibilidad

- Recomendado: Node.js 20 o 22 LTS
- Evita Node.js 23 para desarrollo del paquete. El scaffolding oficial de n8n falla con dependencias nativas en esa versión.

## Uso con Agentes y MCP

Si lo que quieres es que un Agente de IA dentro de n8n pueda usar Mobilia, en muchos casos no necesitas convertir este package en un MCP externo:

- Este nodo ya está marcado como `usableAsTool`, así que un `AI Agent` de n8n puede invocarlo como herramienta.
- Si más adelante quieres exponer workflows hacia clientes MCP externos, n8n ya trae `MCP Server Trigger` e incluso acceso MCP a nivel de instancia.

En otras palabras:

- Para agente dentro de n8n: este nodo como tool suele ser suficiente.
- Para exponer herramientas a clientes MCP externos: se monta un workflow MCP encima.
