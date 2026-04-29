import type { INodeProperties } from 'n8n-workflow';

export type MobiliaHttpMethod = 'DELETE' | 'GET' | 'POST' | 'PUT';
export type MobiliaFieldKind =
	| 'boolean'
	| 'csvInteger'
	| 'csvString'
	| 'dateTime'
	| 'enum'
	| 'integer'
	| 'multiEnum'
	| 'number'
	| 'string';
export type MobiliaFieldLocation = 'body' | 'path' | 'query';

export interface MobiliaFieldDefinition {
	name: string;
	displayName: string;
	description: string;
	kind: MobiliaFieldKind;
	required?: boolean;
	options?: string[];
	placeholder?: string;
}

export interface MobiliaOperation {
	name: string;
	value: string;
	resource: string;
	method: MobiliaHttpMethod;
	path: string;
	summary: string;
	pathFields: MobiliaFieldDefinition[];
	queryFields: MobiliaFieldDefinition[];
	bodyFields: MobiliaFieldDefinition[];
	supportsPagination: boolean;
}

const enumValues = {
	agentesSortField: ['IdAgente', 'NombreUsuario', 'Email'],
	clienteSortField: ['FechaAlta', 'NombreUsuario', 'FechaUltimoContacto'],
	estadoCivil: ['Soltero', 'Casado', 'Viudo', 'Divorciado', 'Separado', 'ParejaDeHecho'],
	estadosTarea: ['Pendiente', 'Finalizado', 'Cancelado', 'Aplazado', 'Archivado'],
	estadosVisita: ['Pendiente', 'Finalizado', 'Cancelado', 'Aplazado', 'Archivado'],
	inmuebleSortField: ['Referencia', 'FechaModificacionWeb'],
	operacion: ['Venta', 'Alquiler', 'Traspaso'],
	promocionSortField: ['Referencia', 'FechaUltimaModificacion', 'AnoConstruccion'],
	solicitudEstado: ['Sin_atender', 'Atendido', 'En_espera', 'No_contesta', 'Descartada', 'Archivado'],
	solicitudSortField: ['Fecha', 'Estado'],
	sortDirection: ['Ascendente', 'Descendente'],
	tareaSortField: ['FechaCreacion', 'FechaInicio', 'FechaFin'],
	tipoBorradoRecurrente: ['SoloEvento', 'TodosAPartirDelEvento', 'Todos'],
	tipoCliente: ['Propietario', 'Demandante', 'Captador', 'Newsletter'],
	tipoSolicitud: ['Llamada', 'Email', 'VisitaInmobiliaria', 'Web', 'Otros', 'API'],
	visitaSortField: ['FechaCreacion', 'FechaInicio', 'FechaFin'],
} as const;

const stringField = (
	name: string,
	displayName: string,
	description = '',
	required = false,
	placeholder?: string,
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'string',
	required,
	placeholder,
});

const dateTimeField = (
	name: string,
	displayName: string,
	description = '',
	required = false,
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'dateTime',
	required,
	placeholder: '2026-01-31 15:30:00',
});

const integerField = (
	name: string,
	displayName: string,
	description = '',
	required = false,
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'integer',
	required,
	placeholder: '123',
});

const numberField = (
	name: string,
	displayName: string,
	description = '',
	required = false,
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'number',
	required,
	placeholder: '123456.78',
});

const booleanField = (
	name: string,
	displayName: string,
	description = '',
	required = false,
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'boolean',
	required,
});

const enumField = (
	name: string,
	displayName: string,
	options: readonly string[],
	description = '',
	required = false,
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'enum',
	required,
	options: [...options],
});

const multiEnumField = (
	name: string,
	displayName: string,
	options: readonly string[],
	description = '',
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'multiEnum',
	options: [...options],
});

const csvIntegerField = (
	name: string,
	displayName: string,
	description = '',
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'csvInteger',
	placeholder: '1,2,3',
});

const csvStringField = (
	name: string,
	displayName: string,
	description = '',
): MobiliaFieldDefinition => ({
	name,
	displayName,
	description,
	kind: 'csvString',
	placeholder: 'REF001,REF002',
});

const pageField = integerField('NumeroPagina', 'Numero Pagina', 'Número de página a obtener (mínimo 1).');
const pageSizeField = integerField(
	'TamanoPagina',
	'Tamano Pagina',
	'Número de elementos por página (máximo 100).',
);
const sortDirectionField = enumField(
	'Ordenacion',
	'Ordenacion',
	enumValues.sortDirection,
	'Dirección de ordenación',
);

export const mobiliaResources = [
	{ name: 'Agenda', value: 'agenda' },
	{ name: 'Agentes', value: 'agentes' },
	{ name: 'Aplicaciones Cliente', value: 'aplicacionesCliente' },
	{ name: 'Campanas', value: 'campanas' },
	{ name: 'Clientes', value: 'clientes' },
	{ name: 'Cuentas', value: 'cuentas' },
	{ name: 'Estados Administrativos', value: 'estadosAdministrativos' },
	{ name: 'Grupos', value: 'grupos' },
	{ name: 'Inmuebles', value: 'inmuebles' },
	{ name: 'Promociones', value: 'promociones' },
	{ name: 'Solicitudes', value: 'solicitudes' },
	{ name: 'Status', value: 'status' },
	{ name: 'Tareas', value: 'tareas' },
	{ name: 'Visitas', value: 'visitas' },
	{ name: 'Custom Request', value: 'customRequest' },
] as const;

export const mobiliaOperations: MobiliaOperation[] = [
	{
		name: 'Get Pending Visits by Agent and Date',
		value: 'agendaGetPendingVisits',
		resource: 'agenda',
		method: 'GET',
		path: '/api/v1/agenda/visitas',
		summary: 'Consulta las visitas pendientes de un agente en una fecha',
		pathFields: [],
		queryFields: [
			integerField('idAgente', 'ID Agente', 'Id del agente'),
			dateTimeField('fecha', 'Fecha', 'Fecha para consultar las visitas'),
		],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Agents',
		value: 'agentesGetMany',
		resource: 'agentes',
		method: 'GET',
		path: '/api/v1/agentes',
		summary: 'Consulta una lista de agentes',
		pathFields: [],
		queryFields: [
			stringField('Busqueda', 'Busqueda', 'Texto para buscar por nombre, email e idAgente'),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.agentesSortField, 'Campo de ordenación'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Get Agent by Email',
		value: 'agentesGetByEmail',
		resource: 'agentes',
		method: 'GET',
		path: '/api/v1/agentes/by-email',
		summary: 'Consulta un agente',
		pathFields: [],
		queryFields: [stringField('email', 'Email', 'Correo electrónico del agente', true)],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Agent by ID',
		value: 'agentesGet',
		resource: 'agentes',
		method: 'GET',
		path: '/api/v1/agentes/{idAgente}',
		summary: 'Consulta un agente',
		pathFields: [integerField('idAgente', 'ID Agente', 'Id del agente', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Current Client Application',
		value: 'aplicacionesClienteCurrent',
		resource: 'aplicacionesCliente',
		method: 'GET',
		path: '/api/v1/aplicaciones-cliente/current',
		summary: 'Consulta la información de la aplicación cliente',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Campaigns',
		value: 'campanasGetMany',
		resource: 'campanas',
		method: 'GET',
		path: '/api/v1/campanas',
		summary: 'Consulta una lista de campañas',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Create Client',
		value: 'clientesCreate',
		resource: 'clientes',
		method: 'POST',
		path: '/api/v1/clientes',
		summary: 'Crea un cliente',
		pathFields: [],
		queryFields: [],
		bodyFields: [
			stringField('dni', 'DNI', 'DNI del cliente'),
			stringField('nombre', 'Nombre', 'Nombre completo del cliente'),
			stringField('email', 'Email', 'Correo electrónico del cliente'),
			stringField('alias', 'Alias', 'Alias del cliente'),
			stringField('direccion', 'Direccion', 'Dirección del cliente'),
			stringField('codigoPostal', 'Codigo Postal', 'Código postal del cliente'),
			stringField('urlWeb', 'URL Web', 'URL de la web del cliente'),
			stringField('observaciones', 'Observaciones', 'Observaciones del cliente'),
			stringField('telefonoMovil', 'Telefono Movil', 'Teléfono móvil 1 del cliente'),
			stringField('telefono2', 'Telefono 2', 'Teléfono 2 del cliente'),
			stringField('telefono3', 'Telefono 3', 'Teléfono 3 del cliente'),
			integerField('idAgente', 'ID Agente', 'Id del agente que hace la petición'),
			enumField('estadoCivil', 'Estado Civil', enumValues.estadoCivil, 'Estado civil del cliente'),
			booleanField('recibirAlertasEmail', 'Recibir Alertas Email', 'Recibir alertas de email automáticas'),
			booleanField('recibirEmailManuales', 'Recibir Emails Manuales', 'Recibir alertas de email manuales'),
			booleanField('tipoPropietario', 'Es Propietario', 'Es propietario'),
			booleanField('tipoDemandante', 'Es Demandante', 'Es demandante'),
			booleanField('tipoCliente', 'Es Cliente', 'Es cliente'),
			booleanField('tipoNewsletter', 'Es Newsletter', 'Es newsletter'),
			integerField('idCampana', 'ID Campana', 'Id de la campaña'),
			csvIntegerField('grupos', 'Grupos', 'Lista de Ids de grupos para vincular al cliente'),
			csvIntegerField('cuentas', 'Cuentas', 'Lista de Ids de cuentas para vincular al cliente'),
			csvIntegerField(
				'idsAgentesSincronizar',
				'IDs Agentes Sincronizar',
				'Lista de Ids de agentes para sincronizar el cliente con Google Contact',
			),
		],
		supportsPagination: false,
	},
	{
		name: 'Delete Client',
		value: 'clientesDelete',
		resource: 'clientes',
		method: 'DELETE',
		path: '/api/v1/clientes/{referencia}',
		summary: 'Elimina un cliente',
		pathFields: [integerField('referencia', 'Referencia', 'Referencia del cliente', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Client by Email',
		value: 'clientesGetByEmail',
		resource: 'clientes',
		method: 'GET',
		path: '/api/v1/clientes/by-email',
		summary: 'Consulta un cliente',
		pathFields: [],
		queryFields: [stringField('email', 'Email', 'Correo electrónico del cliente', true)],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Client by Reference',
		value: 'clientesGet',
		resource: 'clientes',
		method: 'GET',
		path: '/api/v1/clientes/{referencia}',
		summary: 'Consulta un cliente',
		pathFields: [integerField('referencia', 'Referencia', 'Referencia del cliente', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Clients',
		value: 'clientesGetMany',
		resource: 'clientes',
		method: 'GET',
		path: '/api/v1/clientes',
		summary: 'Consulta una lista de clientes',
		pathFields: [],
		queryFields: [
			multiEnumField('TiposCliente', 'Tipos Cliente', enumValues.tipoCliente, 'Filtrar por tipo de cliente'),
			csvIntegerField('IdGrupos', 'IDs Grupos', 'Grupos a los que pertenecen los clientes'),
			csvIntegerField('IdExcluyeGrupos', 'IDs Excluye Grupos', 'Grupos a excluir'),
			integerField('IdCampana', 'ID Campana', 'Id de campaña'),
			dateTimeField('UltimoContactoDesde', 'Ultimo Contacto Desde', 'Fecha mínima del último contacto'),
			dateTimeField('UltimoContactoHasta', 'Ultimo Contacto Hasta', 'Fecha máxima del último contacto'),
			integerField('IdCuenta', 'ID Cuenta', 'Id de cuenta'),
			dateTimeField('FechaDesde', 'Fecha Desde', 'Fecha mínima de alta'),
			dateTimeField('FechaHasta', 'Fecha Hasta', 'Fecha máxima de alta'),
			stringField('Busqueda', 'Busqueda', 'Texto de búsqueda que se aplicará al nombre de usuario o email'),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.clienteSortField, 'Campo de ordenación'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Update Client',
		value: 'clientesUpdate',
		resource: 'clientes',
		method: 'PUT',
		path: '/api/v1/clientes/{referencia}',
		summary: 'Actualiza un cliente',
		pathFields: [integerField('referencia', 'Referencia', 'Referencia del cliente', true)],
		queryFields: [],
		bodyFields: [
			stringField('dni', 'DNI', 'DNI del cliente'),
			stringField('nombre', 'Nombre', 'Nombre completo del cliente'),
			stringField('email', 'Email', 'Correo electrónico del cliente'),
			stringField('alias', 'Alias', 'Alias del cliente'),
			stringField('direccion', 'Direccion', 'Dirección del cliente'),
			stringField('codigoPostal', 'Codigo Postal', 'Código postal del cliente'),
			stringField('urlWeb', 'URL Web', 'URL de la web del cliente'),
			stringField('observaciones', 'Observaciones', 'Observaciones del cliente'),
			stringField('telefonoMovil', 'Telefono Movil', 'Teléfono móvil 1 del cliente'),
			stringField('telefono2', 'Telefono 2', 'Teléfono 2 del cliente'),
			stringField('telefono3', 'Telefono 3', 'Teléfono 3 del cliente'),
			integerField('idAgente', 'ID Agente', 'Id del agente que hace la petición'),
			enumField('estadoCivil', 'Estado Civil', enumValues.estadoCivil, 'Estado civil del cliente'),
			booleanField('recibirAlertasEmail', 'Recibir Alertas Email', 'Recibir alertas de email automáticas'),
			booleanField('recibirEmailManuales', 'Recibir Emails Manuales', 'Recibir alertas de email manuales'),
			booleanField('tipoPropietario', 'Es Propietario', 'Es propietario'),
			booleanField('tipoDemandante', 'Es Demandante', 'Es demandante'),
			booleanField('tipoCliente', 'Es Cliente', 'Es cliente'),
			booleanField('tipoNewsletter', 'Es Newsletter', 'Es newsletter'),
			integerField('idCampana', 'ID Campana', 'Id de la campaña'),
			csvIntegerField('grupos', 'Grupos', 'Lista de Ids de grupos para vincular al cliente'),
			csvIntegerField('cuentas', 'Cuentas', 'Lista de Ids de cuentas para vincular al cliente'),
			csvIntegerField(
				'idsAgentesSincronizar',
				'IDs Agentes Sincronizar',
				'Lista de Ids de agentes para sincronizar el cliente con Google Contact',
			),
		],
		supportsPagination: false,
	},
	{
		name: 'Get Many Accounts',
		value: 'cuentasGetMany',
		resource: 'cuentas',
		method: 'GET',
		path: '/api/v1/cuentas',
		summary: 'Consulta una lista de cuentas',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Administrative States',
		value: 'estadosAdministrativosGetMany',
		resource: 'estadosAdministrativos',
		method: 'GET',
		path: '/api/v1/estadosadministrativos',
		summary: 'Consulta una lista de estados administrativos',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Client Groups',
		value: 'gruposGetClientes',
		resource: 'grupos',
		method: 'GET',
		path: '/api/v1/grupos/clientes',
		summary: 'Consulta una lista de grupos',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Property Groups',
		value: 'gruposGetInmuebles',
		resource: 'grupos',
		method: 'GET',
		path: '/api/v1/grupos/inmuebles',
		summary: 'Consulta una lista de grupos',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Download Property Document',
		value: 'inmueblesDownloadDocument',
		resource: 'inmuebles',
		method: 'GET',
		path: '/api/v1/inmuebles/{referencia}/documentos/{idDocumento}/descargar',
		summary: 'Descarga un documento de un inmueble',
		pathFields: [
			stringField('referencia', 'Referencia Inmueble', 'Referencia del inmueble', true),
			integerField('idDocumento', 'ID Documento', 'Id del documento', true),
		],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Available Properties',
		value: 'inmueblesGetMany',
		resource: 'inmuebles',
		method: 'GET',
		path: '/api/v1/inmuebles',
		summary: 'Consulta una lista de inmuebles',
		pathFields: [],
		queryFields: [
			stringField('Busqueda', 'Busqueda', 'Texto para buscar en la referencia de los inmuebles'),
			csvIntegerField('IdGrupos', 'IDs Grupos', 'Grupos a los que pertenece el inmueble'),
			csvIntegerField('IdExcluyeGrupos', 'IDs Excluye Grupos', 'Grupos a excluir'),
			csvIntegerField('IdCuentas', 'IDs Cuentas', 'Cuentas a las que pertenece el inmueble'),
			csvIntegerField('IdExcluyeCuentas', 'IDs Excluye Cuentas', 'Cuentas a excluir'),
			dateTimeField(
				'FechaUltimaModificacion',
				'Fecha Ultima Modificacion',
				'Formato ISO 8601, por ejemplo 2023-01-01T00:00:00Z',
			),
			numberField('PrecioVentaDesde', 'Precio Venta Desde', 'Precio mínimo de venta'),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.inmuebleSortField, 'Campo de ordenación'),
			booleanField('MarcaAguaImagenes', 'Marca Agua Imagenes', 'Incluye la marca de agua a las imágenes'),
			booleanField('DescripcionImagenes', 'Descripcion Imagenes', 'Añade las descripciones a las imágenes'),
			multiEnumField('TiposOperacion', 'Tipos Operacion', enumValues.operacion, 'Operaciones a filtrar'),
			integerField('IdAgente', 'ID Agente', 'Id del agente responsable'),
			integerField('IdPropietario', 'ID Propietario', 'Id del propietario'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Get Many Disabled Properties',
		value: 'inmueblesGetDisabled',
		resource: 'inmuebles',
		method: 'GET',
		path: '/api/v1/inmuebles/desactivados',
		summary: 'Consulta los inmuebles no disponibles o no publicados en web',
		pathFields: [],
		queryFields: [
			stringField('Busqueda', 'Busqueda', 'Texto para buscar en la referencia de los inmuebles'),
			csvIntegerField('IdGrupos', 'IDs Grupos', 'Grupos a los que pertenece el inmueble'),
			csvIntegerField('IdExcluyeGrupos', 'IDs Excluye Grupos', 'Grupos a excluir'),
			csvIntegerField('IdCuentas', 'IDs Cuentas', 'Cuentas a las que pertenece el inmueble'),
			csvIntegerField('IdExcluyeCuentas', 'IDs Excluye Cuentas', 'Cuentas a excluir'),
			dateTimeField(
				'FechaUltimaModificacion',
				'Fecha Ultima Modificacion',
				'Formato ISO 8601, por ejemplo 2023-01-01T00:00:00Z',
			),
			numberField('PrecioVentaDesde', 'Precio Venta Desde', 'Precio mínimo de venta'),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.inmuebleSortField, 'Campo de ordenación'),
			booleanField('MarcaAguaImagenes', 'Marca Agua Imagenes', 'Incluye la marca de agua a las imágenes'),
			booleanField('DescripcionImagenes', 'Descripcion Imagenes', 'Añade las descripciones a las imágenes'),
			multiEnumField('TiposOperacion', 'Tipos Operacion', enumValues.operacion, 'Operaciones a filtrar'),
			integerField('IdAgente', 'ID Agente', 'Id del agente responsable'),
			integerField('IdPropietario', 'ID Propietario', 'Id del propietario'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Get Many Properties Including Unpublished',
		value: 'inmueblesGetAll',
		resource: 'inmuebles',
		method: 'GET',
		path: '/api/v1/inmuebles/todos',
		summary: 'Consulta una lista de todos los inmuebles',
		pathFields: [],
		queryFields: [
			booleanField('Disponible', 'Disponible', 'Filtra los inmuebles disponibles'),
			booleanField('PublicarEnWeb', 'Publicar En Web', 'Filtra los inmuebles publicados en web'),
			csvIntegerField(
				'IdEstadosAdministrativos',
				'IDs Estados Administrativos',
				'Filtra por IdEstadoAdministrativo',
			),
			stringField('Busqueda', 'Busqueda', 'Texto para buscar en la referencia de los inmuebles'),
			csvIntegerField('IdGrupos', 'IDs Grupos', 'Grupos a los que pertenece el inmueble'),
			csvIntegerField('IdExcluyeGrupos', 'IDs Excluye Grupos', 'Grupos a excluir'),
			csvIntegerField('IdCuentas', 'IDs Cuentas', 'Cuentas a las que pertenece el inmueble'),
			csvIntegerField('IdExcluyeCuentas', 'IDs Excluye Cuentas', 'Cuentas a excluir'),
			dateTimeField(
				'FechaUltimaModificacion',
				'Fecha Ultima Modificacion',
				'Formato ISO 8601, por ejemplo 2023-01-01T00:00:00Z',
			),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.inmuebleSortField, 'Campo de ordenación'),
			booleanField('MarcaAguaImagenes', 'Marca Agua Imagenes', 'Incluye la marca de agua a las imágenes'),
			booleanField('DescripcionImagenes', 'Descripcion Imagenes', 'Añade las descripciones a las imágenes'),
			integerField('IdPropietario', 'ID Propietario', 'Id del propietario'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Get Property Documents',
		value: 'inmueblesGetDocuments',
		resource: 'inmuebles',
		method: 'GET',
		path: '/api/v1/inmuebles/{referencia}/documentos',
		summary: 'Consulta los documentos de un inmueble',
		pathFields: [stringField('referencia', 'Referencia Inmueble', 'Referencia del inmueble', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Property Keys',
		value: 'inmueblesGetKeyRing',
		resource: 'inmuebles',
		method: 'GET',
		path: '/api/v1/inmuebles/{referencia}/llavero',
		summary: 'Consulta el llavero de un inmueble',
		pathFields: [stringField('referencia', 'Referencia Inmueble', 'Referencia del inmueble', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Property Owners',
		value: 'inmueblesGetOwners',
		resource: 'inmuebles',
		method: 'GET',
		path: '/api/v1/inmuebles/{referencia}/propietarios',
		summary: 'Consulta los propietarios de un inmueble',
		pathFields: [stringField('referencia', 'Referencia Inmueble', 'Referencia del inmueble', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Promotions',
		value: 'promocionesGetMany',
		resource: 'promociones',
		method: 'GET',
		path: '/api/v1/promociones',
		summary: 'Consulta una lista de promociones',
		pathFields: [],
		queryFields: [
			enumField('OrdenarPor', 'Ordenar Por', enumValues.promocionSortField, 'Campo de ordenación'),
			booleanField('MarcaAguaImagenes', 'Marca Agua Imagenes', 'Incluye la marca de agua a las imágenes'),
			booleanField('DescripcionImagenes', 'Descripcion Imagenes', 'Añade las descripciones a las imágenes'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Create Lead Request',
		value: 'solicitudesCreate',
		resource: 'solicitudes',
		method: 'POST',
		path: '/api/v1/solicitudes',
		summary: 'Crea una solicitud',
		pathFields: [],
		queryFields: [],
		bodyFields: [
			stringField('email', 'Email', 'Correo electrónico del solicitante'),
			stringField('nombre', 'Nombre', 'Nombre completo del solicitante'),
			stringField('telefono', 'Telefono', 'Número de teléfono del solicitante'),
			stringField('mensaje', 'Mensaje', 'Mensaje o comentario enviado por el solicitante'),
			integerField('idCampana', 'ID Campana', 'Id de la campaña'),
			enumField('tipoOperacion', 'Tipo Operacion', enumValues.operacion, 'Tipo de operación'),
			enumField('estado', 'Estado', enumValues.solicitudEstado, 'Estado de la solicitud'),
			enumField('tipoSolicitud', 'Tipo Solicitud', enumValues.tipoSolicitud, 'Tipo de solicitud'),
			integerField('idAgente', 'ID Agente', 'Id del agente que hace la petición'),
			csvStringField('inmuebles', 'Inmuebles', 'Referencias de inmuebles a vincular'),
			integerField('referenciaCliente', 'Referencia Cliente', 'Referencia del cliente a vincular'),
			stringField('poblacion', 'Poblacion', 'Población de la solicitud'),
			stringField('zona', 'Zona', 'Zona de la solicitud'),
			stringField('precioMaximo', 'Precio Maximo', 'Precio máximo de la solicitud'),
		],
		supportsPagination: false,
	},
	{
		name: 'Delete Lead Request',
		value: 'solicitudesDelete',
		resource: 'solicitudes',
		method: 'DELETE',
		path: '/api/v1/solicitudes/{referencia}',
		summary: 'Elimina una solicitud',
		pathFields: [integerField('referencia', 'Referencia', 'Referencia de la solicitud', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Lead Request by Reference',
		value: 'solicitudesGet',
		resource: 'solicitudes',
		method: 'GET',
		path: '/api/v1/solicitudes/{referencia}',
		summary: 'Consulta una solicitud',
		pathFields: [integerField('referencia', 'Referencia', 'Referencia de la solicitud', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Lead Requests',
		value: 'solicitudesGetMany',
		resource: 'solicitudes',
		method: 'GET',
		path: '/api/v1/solicitudes',
		summary: 'Consulta una lista de solicitudes',
		pathFields: [],
		queryFields: [
			dateTimeField('FechaDesde', 'Fecha Desde', 'Fecha mínima (inclusive) desde la que traer registros'),
			dateTimeField('FechaHasta', 'Fecha Hasta', 'Fecha máxima (inclusive) hasta la que traer registros'),
			enumField('Estado', 'Estado', enumValues.solicitudEstado, 'Estado de la solicitud'),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.solicitudSortField, 'Campo de ordenación'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Update Lead Request',
		value: 'solicitudesUpdate',
		resource: 'solicitudes',
		method: 'PUT',
		path: '/api/v1/solicitudes/{referencia}',
		summary: 'Actualiza una solicitud',
		pathFields: [integerField('referencia', 'Referencia', 'Referencia de la solicitud', true)],
		queryFields: [],
		bodyFields: [
			stringField('email', 'Email', 'Correo electrónico del solicitante'),
			stringField('nombre', 'Nombre', 'Nombre completo del solicitante'),
			stringField('telefono', 'Telefono', 'Número de teléfono del solicitante'),
			stringField('mensaje', 'Mensaje', 'Mensaje o comentario enviado por el solicitante'),
			integerField('idCampana', 'ID Campana', 'Id de la campaña'),
			enumField('tipoOperacion', 'Tipo Operacion', enumValues.operacion, 'Tipo de operación'),
			enumField('estado', 'Estado', enumValues.solicitudEstado, 'Estado de la solicitud'),
			enumField('tipoSolicitud', 'Tipo Solicitud', enumValues.tipoSolicitud, 'Tipo de solicitud'),
			integerField('idAgente', 'ID Agente', 'Id del agente que hace la petición'),
			csvStringField('inmuebles', 'Inmuebles', 'Referencias de inmuebles a vincular'),
			integerField('referenciaCliente', 'Referencia Cliente', 'Referencia del cliente a vincular'),
			stringField('poblacion', 'Poblacion', 'Población de la solicitud'),
			stringField('zona', 'Zona', 'Zona de la solicitud'),
			stringField('precioMaximo', 'Precio Maximo', 'Precio máximo de la solicitud'),
		],
		supportsPagination: false,
	},
	{
		name: 'Get API Status',
		value: 'statusGet',
		resource: 'status',
		method: 'GET',
		path: '/api/v1/status',
		summary: 'Consulta el estado de la API',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Create Task',
		value: 'tareasCreate',
		resource: 'tareas',
		method: 'POST',
		path: '/api/v1/tareas',
		summary: 'Crea una tarea',
		pathFields: [],
		queryFields: [],
		bodyFields: [
			integerField('idAgente', 'ID Agente', 'Id del agente'),
			integerField('referenciaCliente', 'Referencia Cliente', 'Referencia del cliente a vincular'),
			stringField('referenciaInmueble', 'Referencia Inmueble', 'Referencia del inmueble a vincular'),
			integerField('referenciaSolicitud', 'Referencia Solicitud', 'Referencia de la solicitud a vincular'),
			integerField('referenciaDemanda', 'Referencia Demanda', 'Referencia de la demanda a vincular'),
			integerField('referenciaOperacion', 'Referencia Operacion', 'Referencia de la operación a vincular'),
			enumField('estado', 'Estado', enumValues.estadosTarea, 'Estado de la tarea'),
			integerField('idTipo', 'ID Tipo', 'Id del tipo de tarea'),
			stringField('asunto', 'Asunto', 'Asunto de la tarea'),
			stringField('comentarios', 'Comentarios', 'Comentarios de la tarea'),
			dateTimeField('fechaInicio', 'Fecha Inicio', 'Fecha de inicio de la tarea'),
			dateTimeField('fechaFin', 'Fecha Fin', 'Fecha de fin de la tarea'),
			booleanField('sincronizar', 'Sincronizar', 'Sincronizar la tarea con Google Calendar'),
		],
		supportsPagination: false,
	},
	{
		name: 'Delete Task',
		value: 'tareasDelete',
		resource: 'tareas',
		method: 'DELETE',
		path: '/api/v1/tareas/{idTarea}',
		summary: 'Elimina una tarea',
		pathFields: [integerField('idTarea', 'ID Tarea', 'Id de la tarea', true)],
		queryFields: [
			enumField(
				'tipoBorradoRecurrente',
				'Tipo Borrado Recurrente',
				enumValues.tipoBorradoRecurrente,
				'Tipo de borrado para tareas recurrentes',
			),
		],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Tasks',
		value: 'tareasGetMany',
		resource: 'tareas',
		method: 'GET',
		path: '/api/v1/tareas',
		summary: 'Consulta una lista de tareas',
		pathFields: [],
		queryFields: [
			dateTimeField('FechaDesde', 'Fecha Desde', 'Fecha mínima (inclusive) desde la que traer registros de tareas'),
			dateTimeField('FechaHasta', 'Fecha Hasta', 'Fecha máxima (inclusive) hasta la que traer registros de tareas'),
			stringField('Busqueda', 'Busqueda', 'Texto de búsqueda que se aplicará al asunto y al comentario'),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.tareaSortField, 'Campo de ordenación'),
			integerField('IdAgente', 'ID Agente', 'Obtener las tareas de un agente concreto'),
			integerField('IdTipo', 'ID Tipo', 'Obtener las tareas de un tipo concreto'),
			integerField('IdEstadoTarea', 'ID Estado Tarea', 'Filtrar por el estado de una tarea'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Get Task by ID',
		value: 'tareasGet',
		resource: 'tareas',
		method: 'GET',
		path: '/api/v1/tareas/{idTarea}',
		summary: 'Consulta una tarea',
		pathFields: [integerField('idTarea', 'ID Tarea', 'Id de la tarea', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Task States',
		value: 'tareasGetStates',
		resource: 'tareas',
		method: 'GET',
		path: '/api/v1/tareas/estados',
		summary: 'Consulta los estados de tareas',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Task Types',
		value: 'tareasGetTypes',
		resource: 'tareas',
		method: 'GET',
		path: '/api/v1/tareas/tipos',
		summary: 'Consulta los tipos de tareas',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Update Task',
		value: 'tareasUpdate',
		resource: 'tareas',
		method: 'PUT',
		path: '/api/v1/tareas/{idTarea}',
		summary: 'Actualiza una tarea',
		pathFields: [integerField('idTarea', 'ID Tarea', 'Id de la tarea', true)],
		queryFields: [],
		bodyFields: [
			integerField('idAgente', 'ID Agente', 'Id del agente'),
			integerField('referenciaCliente', 'Referencia Cliente', 'Referencia del cliente a vincular'),
			stringField('referenciaInmueble', 'Referencia Inmueble', 'Referencia del inmueble a vincular'),
			integerField('referenciaSolicitud', 'Referencia Solicitud', 'Referencia de la solicitud a vincular'),
			integerField('referenciaDemanda', 'Referencia Demanda', 'Referencia de la demanda a vincular'),
			integerField('referenciaOperacion', 'Referencia Operacion', 'Referencia de la operación a vincular'),
			enumField('estado', 'Estado', enumValues.estadosTarea, 'Estado de la tarea'),
			integerField('idTipo', 'ID Tipo', 'Id del tipo de tarea'),
			stringField('asunto', 'Asunto', 'Asunto de la tarea'),
			stringField('comentarios', 'Comentarios', 'Comentarios de la tarea'),
			dateTimeField('fechaInicio', 'Fecha Inicio', 'Fecha de inicio de la tarea'),
			dateTimeField('fechaFin', 'Fecha Fin', 'Fecha de fin de la tarea'),
			booleanField('sincronizar', 'Sincronizar', 'Sincronizar la tarea con Google Calendar'),
		],
		supportsPagination: false,
	},
	{
		name: 'Create Visit',
		value: 'visitasCreate',
		resource: 'visitas',
		method: 'POST',
		path: '/api/v1/visitas',
		summary: 'Crea una visita',
		pathFields: [],
		queryFields: [],
		bodyFields: [
			integerField('idAgente', 'ID Agente', 'Id del agente'),
			integerField('referenciaCliente', 'Referencia Cliente', 'Referencia del cliente a vincular'),
			stringField('referenciaInmueble', 'Referencia Inmueble', 'Referencia del inmueble a vincular'),
			integerField('referenciaSolicitud', 'Referencia Solicitud', 'Referencia de la solicitud a vincular'),
			integerField('referenciaDemanda', 'Referencia Demanda', 'Referencia de la demanda a vincular'),
			enumField('operacion', 'Operacion', enumValues.operacion, 'Operación de la visita'),
			integerField('idTipo', 'ID Tipo', 'Id del tipo de visita'),
			stringField('lugar', 'Lugar', 'Lugar de la visita'),
			enumField('estado', 'Estado', enumValues.estadosVisita, 'Estado de la visita'),
			dateTimeField('fechaInicio', 'Fecha Inicio', 'Fecha de inicio de la visita'),
			dateTimeField('fechaFin', 'Fecha Fin', 'Fecha de fin de la visita'),
			booleanField(
				'enviarEmailPropietario',
				'Enviar Email Propietario',
				'Enviar email al propietario si la visita está finalizada',
				true,
			),
			booleanField('sincronizar', 'Sincronizar', 'Sincronizar la visita con Google Calendar'),
		],
		supportsPagination: false,
	},
	{
		name: 'Delete Visit',
		value: 'visitasDelete',
		resource: 'visitas',
		method: 'DELETE',
		path: '/api/v1/visitas/{idVisita}',
		summary: 'Elimina una visita',
		pathFields: [integerField('idVisita', 'ID Visita', 'Id de la visita', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Visit by ID',
		value: 'visitasGet',
		resource: 'visitas',
		method: 'GET',
		path: '/api/v1/visitas/{idVisita}',
		summary: 'Consulta una visita',
		pathFields: [integerField('idVisita', 'ID Visita', 'Id de la visita', true)],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Visit States',
		value: 'visitasGetStates',
		resource: 'visitas',
		method: 'GET',
		path: '/api/v1/visitas/estados',
		summary: 'Consulta los estados de visitas',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Visit Interest Types',
		value: 'visitasGetInterestTypes',
		resource: 'visitas',
		method: 'GET',
		path: '/api/v1/visitas/interesmostrado',
		summary: 'Consulta una lista de los tipos de interés mostrado',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Get Many Visits',
		value: 'visitasGetMany',
		resource: 'visitas',
		method: 'GET',
		path: '/api/v1/visitas',
		summary: 'Consulta una lista de visitas',
		pathFields: [],
		queryFields: [
			dateTimeField('FechaDesde', 'Fecha Desde', 'Fecha mínima (inclusive) desde la que traer registros de visitas'),
			dateTimeField('FechaHasta', 'Fecha Hasta', 'Fecha máxima (inclusive) hasta la que traer registros de visitas'),
			stringField('Busqueda', 'Busqueda', 'Texto de búsqueda que se aplicará al lugar'),
			enumField('OrdenarPor', 'Ordenar Por', enumValues.visitaSortField, 'Campo de ordenación'),
			integerField('IdAgente', 'ID Agente', 'Obtener las visitas de un agente concreto'),
			integerField('IdTipo', 'ID Tipo', 'Obtener las visitas de un tipo concreto'),
			integerField('IdEstadoVisita', 'ID Estado Visita', 'Filtrar por el estado de una visita'),
			pageField,
			pageSizeField,
			sortDirectionField,
		],
		bodyFields: [],
		supportsPagination: true,
	},
	{
		name: 'Get Visit Types',
		value: 'visitasGetTypes',
		resource: 'visitas',
		method: 'GET',
		path: '/api/v1/visitas/tipos',
		summary: 'Consulta los tipos de visitas',
		pathFields: [],
		queryFields: [],
		bodyFields: [],
		supportsPagination: false,
	},
	{
		name: 'Update Visit',
		value: 'visitasUpdate',
		resource: 'visitas',
		method: 'PUT',
		path: '/api/v1/visitas/{idVisita}',
		summary: 'Actualiza una visita',
		pathFields: [integerField('idVisita', 'ID Visita', 'Id de la visita', true)],
		queryFields: [],
		bodyFields: [
			integerField('idAgente', 'ID Agente', 'Id del agente'),
			integerField('referenciaCliente', 'Referencia Cliente', 'Referencia del cliente a vincular'),
			stringField('referenciaInmueble', 'Referencia Inmueble', 'Referencia del inmueble a vincular'),
			integerField('referenciaSolicitud', 'Referencia Solicitud', 'Referencia de la solicitud a vincular'),
			integerField('referenciaDemanda', 'Referencia Demanda', 'Referencia de la demanda a vincular'),
			enumField('operacion', 'Operacion', enumValues.operacion, 'Operación de la visita'),
			integerField('idTipo', 'ID Tipo', 'Id del tipo de visita'),
			stringField('lugar', 'Lugar', 'Lugar de la visita'),
			enumField('estado', 'Estado', enumValues.estadosVisita, 'Estado de la visita'),
			dateTimeField('fechaInicio', 'Fecha Inicio', 'Fecha de inicio de la visita'),
			dateTimeField('fechaFin', 'Fecha Fin', 'Fecha de fin de la visita'),
			booleanField(
				'enviarEmailPropietario',
				'Enviar Email Propietario',
				'Enviar email al propietario si la visita está finalizada',
				true,
			),
			booleanField('sincronizar', 'Sincronizar', 'Sincronizar la visita con Google Calendar'),
		],
		supportsPagination: false,
	},
];

export function getOperationByValue(value: string): MobiliaOperation | undefined {
	return mobiliaOperations.find((operation) => operation.value === value);
}

export function getFieldPropertyName(
	location: MobiliaFieldLocation,
	operationValue: string,
	fieldName: string,
): string {
	return `${location}_${operationValue}_${fieldName}`;
}

function getFieldPropertyType(field: MobiliaFieldDefinition): INodeProperties['type'] {
	if (field.kind === 'enum' || field.kind === 'boolean') {
		return 'options';
	}

	if (field.kind === 'multiEnum') {
		return 'multiOptions';
	}

	return 'string';
}

function getFieldPropertyOptions(field: MobiliaFieldDefinition): INodeProperties['options'] | undefined {
	if (field.kind === 'boolean') {
		if (field.required) {
			return [
				{ name: 'True', value: 'true' },
				{ name: 'False', value: 'false' },
			];
		}

		return [
			{ name: 'Not Set', value: '__unset' },
			{ name: 'True', value: 'true' },
			{ name: 'False', value: 'false' },
		];
	}

	if (field.kind === 'enum') {
		const options = (field.options ?? []).map((value) => ({ name: value, value }));
		return field.required ? options : [{ name: 'Not Set', value: '' }, ...options];
	}

	if (field.kind === 'multiEnum') {
		return (field.options ?? []).map((value) => ({ name: value, value }));
	}

	return undefined;
}

function getFieldDefaultValue(field: MobiliaFieldDefinition): INodeProperties['default'] {
	if (field.kind === 'boolean') {
		return field.required ? 'false' : '__unset';
	}

	if (field.kind === 'enum') {
		return field.required ? field.options?.[0] ?? '' : '';
	}

	if (field.kind === 'multiEnum') {
		return [];
	}

	return '';
}

function buildFieldProperty(
	field: MobiliaFieldDefinition,
	location: MobiliaFieldLocation,
	operation: MobiliaOperation,
): INodeProperties {
	return {
		displayName: field.displayName,
		name: getFieldPropertyName(location, operation.value, field.name),
		type: getFieldPropertyType(field),
		required: field.required ?? false,
		default: getFieldDefaultValue(field),
		options: getFieldPropertyOptions(field),
		placeholder: field.placeholder,
		description: field.description,
		displayOptions: {
			show: {
				resource: [operation.resource],
				operation: [operation.value],
			},
		},
	};
}

function buildOperationProperties(): INodeProperties[] {
	const properties: INodeProperties[] = [];

	for (const resource of mobiliaResources) {
		if (resource.value === 'customRequest') {
			continue;
		}

		const operations = mobiliaOperations.filter((operation) => operation.resource === resource.value);

			// n8n's lint rule cannot infer the generated default for operation selectors.
			// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
			properties.push({
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: [resource.value],
				},
			},
			options: operations.map((operation) => ({
				name: operation.name,
				value: operation.value,
				description: `${operation.method} ${operation.path} · ${operation.summary}`,
			})),
			default: operations[0]?.value ?? '',
		});

		for (const operation of operations) {
			for (const field of operation.pathFields) {
				properties.push(buildFieldProperty(field, 'path', operation));
			}

			for (const field of operation.queryFields) {
				properties.push(buildFieldProperty(field, 'query', operation));
			}

			for (const field of operation.bodyFields) {
				properties.push(buildFieldProperty(field, 'body', operation));
			}
		}
	}

	return properties;
}

export const mobiliaNodeProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: mobiliaResources.map((resource) => ({
			name: resource.name,
			value: resource.value,
		})),
		default: 'clientes',
	},
	...buildOperationProperties(),
	{
		displayName: 'Method',
		name: 'customMethod',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		options: [
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'GET', value: 'GET' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
		],
		default: 'GET',
	},
	{
		displayName: 'Path',
		name: 'customPath',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '/api/v1/status',
		placeholder: '/api/v1/clientes/12345',
			description: 'Ruta relativa de la API. Se admiten placeholders como /api/v1/clientes/{referencia}.',
	},
	{
		displayName: 'Path Parameters JSON',
		name: 'pathParametersJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '{}',
			description: 'Objeto JSON con los parámetros de path. Ejemplo: {"referencia": 1234}.',
	},
	{
		displayName: 'Query Parameters JSON',
		name: 'queryParametersJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '{}',
			description: 'Objeto JSON con los parámetros query. Se respetan arrays para filtros múltiples.',
	},
	{
		displayName: 'Body JSON',
		name: 'bodyJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '{}',
			description: 'Objeto JSON para POST o PUT',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
			description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Split Into Items',
		name: 'splitIntoItems',
		type: 'boolean',
		default: true,
			description: 'Whether to return array responses as separate items',
	},
	{
		displayName: 'Simplify Response',
		name: 'simplifyResponse',
		type: 'boolean',
		default: true,
			description: 'Whether to unwrap common response envelopes such as datos or elementos',
	},
];
