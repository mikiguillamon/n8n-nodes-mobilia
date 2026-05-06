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
export type MobiliaLoadOptionsMethod =
	| 'getAccounts'
	| 'getAdministrativeStates'
	| 'getAgents'
	| 'getCampaigns'
	| 'getClientGroups'
	| 'getPropertyGroups'
	| 'getTaskStates'
	| 'getTaskTypes'
	| 'getVisitStates'
	| 'getVisitTypes';

export interface MobiliaFieldDefinition {
	name: string;
	displayName: string;
	description: string;
	kind: MobiliaFieldKind;
	required?: boolean;
	options?: string[];
	placeholder?: string;
}

interface MobiliaFieldUiMetadata {
	description?: string;
	displayName?: string;
	loadOptionsMethod?: MobiliaLoadOptionsMethod;
	placeholder?: string;
	type?: 'multiOptions' | 'options' | 'string';
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

const baseFieldUiMetadata: Record<string, MobiliaFieldUiMetadata> = {
	Busqueda: {
		displayName: 'Búsqueda',
		description: 'Texto de búsqueda.',
		placeholder: 'Escribe un texto para filtrar',
	},
	DescripcionImagenes: {
		displayName: 'Añadir descripción a las imágenes',
		description: 'Incluye la descripción de cada imagen en la respuesta.',
	},
	FechaDesde: {
		displayName: 'Fecha desde',
		description: 'Fecha mínima a partir de la que buscar.',
	},
	FechaHasta: {
		displayName: 'Fecha hasta',
		description: 'Fecha máxima hasta la que buscar.',
	},
	FechaUltimaModificacion: {
		displayName: 'Modificados desde',
		description: 'Trae solo registros modificados desde esta fecha.',
	},
	IdAgente: {
		displayName: 'Agente',
		description: 'Agente relacionado con la consulta.',
		loadOptionsMethod: 'getAgents',
		type: 'options',
	},
	IdCampana: {
		displayName: 'Campaña',
		description: 'Campaña relacionada.',
		loadOptionsMethod: 'getCampaigns',
		type: 'options',
	},
	IdCuenta: {
		displayName: 'Cuenta',
		description: 'Cuenta relacionada.',
		loadOptionsMethod: 'getAccounts',
		type: 'options',
	},
	IdCuentas: {
		displayName: 'Cuentas',
		description: 'Selecciona una o varias cuentas.',
		loadOptionsMethod: 'getAccounts',
		type: 'multiOptions',
	},
	IdEstadoTarea: {
		displayName: 'Estado',
		description: 'Estado de la tarea.',
		loadOptionsMethod: 'getTaskStates',
		type: 'options',
	},
	IdEstadoVisita: {
		displayName: 'Estado',
		description: 'Estado de la visita.',
		loadOptionsMethod: 'getVisitStates',
		type: 'options',
	},
	IdEstadosAdministrativos: {
		displayName: 'Estados administrativos',
		description: 'Filtra por uno o varios estados administrativos.',
		loadOptionsMethod: 'getAdministrativeStates',
		type: 'multiOptions',
	},
	IdExcluyeCuentas: {
		displayName: 'Excluir cuentas',
		description: 'Cuentas que deben quedar fuera del resultado.',
		loadOptionsMethod: 'getAccounts',
		type: 'multiOptions',
	},
	IdExcluyeGrupos: {
		displayName: 'Excluir grupos',
		description: 'Grupos que deben quedar fuera del resultado.',
		type: 'multiOptions',
	},
	IdGrupos: {
		displayName: 'Grupos',
		description: 'Selecciona uno o varios grupos.',
		type: 'multiOptions',
	},
	IdPropietario: {
		displayName: 'Referencia del propietario',
		description: 'Referencia interna del propietario en Mobilia.',
		placeholder: '12345',
	},
	IdTipo: {
		displayName: 'Tipo',
		description: 'Tipo relacionado con la operación.',
		type: 'options',
	},
	MarcaAguaImagenes: {
		displayName: 'Aplicar marca de agua',
		description: 'Devuelve las imágenes con marca de agua.',
	},
	NumeroPagina: {
		displayName: 'Página',
		description: 'Página a recuperar.',
	},
	Ordenacion: {
		displayName: 'Dirección del orden',
		description: 'Orden ascendente o descendente.',
	},
	OrdenarPor: {
		displayName: 'Ordenar por',
		description: 'Campo que se usará para ordenar.',
	},
	PrecioMaximo: {
		displayName: 'Precio máximo',
		description: 'Importe máximo.',
	},
	PrecioVentaDesde: {
		displayName: 'Precio de venta mínimo',
		description: 'Trae solo inmuebles desde este precio.',
	},
	TamanoPagina: {
		displayName: 'Resultados por página',
		description: 'Número de resultados por página. Máximo 100.',
	},
	TiposCliente: {
		displayName: 'Tipos de cliente',
		description: 'Selecciona los perfiles de cliente que quieres recuperar.',
	},
	TiposOperacion: {
		displayName: 'Tipos de operación',
		description: 'Selecciona las operaciones que quieres incluir.',
	},
	email: {
		displayName: 'Email',
		description: 'Correo electrónico.',
		placeholder: 'cliente@ejemplo.com',
	},
	grupos: {
		displayName: 'Grupos',
		description: 'Grupos a vincular.',
		type: 'multiOptions',
	},
	idAgente: {
		displayName: 'Agente',
		description: 'Agente relacionado con la operación.',
		loadOptionsMethod: 'getAgents',
		type: 'options',
	},
	idCampana: {
		displayName: 'Campaña',
		description: 'Campaña relacionada.',
		loadOptionsMethod: 'getCampaigns',
		type: 'options',
	},
	idTipo: {
		displayName: 'Tipo',
		description: 'Tipo relacionado con la operación.',
		type: 'options',
	},
	idsAgentesSincronizar: {
		displayName: 'Agentes a sincronizar',
		description: 'Agentes con los que se sincronizará el contacto.',
		loadOptionsMethod: 'getAgents',
		type: 'multiOptions',
	},
	inmuebles: {
		displayName: 'Referencias de inmuebles',
		description: 'Una o varias referencias de inmuebles.',
		placeholder: 'REF-001, REF-002',
	},
	referenciaCliente: {
		displayName: 'Referencia del cliente',
		description: 'Referencia interna del cliente en Mobilia.',
	},
	referenciaInmueble: {
		displayName: 'Referencia del inmueble',
		description: 'Referencia interna del inmueble en Mobilia.',
		placeholder: 'REF-001',
	},
};

const operationFieldUiMetadata: Record<string, Record<string, MobiliaFieldUiMetadata>> = {
	agendaGetPendingVisits: {
		idAgente: {
			description: 'Agente del que quieres consultar la agenda.',
		},
	},
	clientesCreate: {
		cuentas: {
			loadOptionsMethod: 'getAccounts',
			type: 'multiOptions',
		},
		grupos: {
			loadOptionsMethod: 'getClientGroups',
			type: 'multiOptions',
		},
	},
	clientesGetMany: {
		Busqueda: {
			description: 'Busca por nombre, email o texto relacionado con el cliente.',
		},
		IdCampana: {
			loadOptionsMethod: 'getCampaigns',
		},
		IdCuenta: {
			loadOptionsMethod: 'getAccounts',
		},
		IdExcluyeGrupos: {
			loadOptionsMethod: 'getClientGroups',
		},
		IdGrupos: {
			loadOptionsMethod: 'getClientGroups',
		},
	},
	clientesUpdate: {
		cuentas: {
			loadOptionsMethod: 'getAccounts',
			type: 'multiOptions',
		},
		grupos: {
			loadOptionsMethod: 'getClientGroups',
			type: 'multiOptions',
		},
	},
	inmueblesGetAll: {
		Busqueda: {
			displayName: 'Referencia',
			description:
				'Texto para buscar en la referencia del inmueble. Mobilia aplica este filtro sobre la referencia, no sobre calle, zona o descripción.',
			placeholder: 'REF-001',
		},
		IdCuentas: {
			loadOptionsMethod: 'getAccounts',
		},
		IdEstadosAdministrativos: {
			loadOptionsMethod: 'getAdministrativeStates',
		},
		IdExcluyeCuentas: {
			loadOptionsMethod: 'getAccounts',
		},
		IdExcluyeGrupos: {
			loadOptionsMethod: 'getPropertyGroups',
		},
		IdGrupos: {
			loadOptionsMethod: 'getPropertyGroups',
		},
	},
	inmueblesGetDisabled: {
		Busqueda: {
			displayName: 'Referencia',
			description:
				'Texto para buscar en la referencia del inmueble. Mobilia aplica este filtro sobre la referencia, no sobre calle, zona o descripción.',
			placeholder: 'REF-001',
		},
		IdCuentas: {
			loadOptionsMethod: 'getAccounts',
		},
		IdExcluyeCuentas: {
			loadOptionsMethod: 'getAccounts',
		},
		IdExcluyeGrupos: {
			loadOptionsMethod: 'getPropertyGroups',
		},
		IdGrupos: {
			loadOptionsMethod: 'getPropertyGroups',
		},
	},
	inmueblesGetMany: {
		Busqueda: {
			displayName: 'Referencia',
			description:
				'Texto para buscar en la referencia del inmueble. Mobilia aplica este filtro sobre la referencia, no sobre calle, zona o descripción.',
			placeholder: 'REF-001',
		},
		IdCuentas: {
			loadOptionsMethod: 'getAccounts',
		},
		IdExcluyeCuentas: {
			loadOptionsMethod: 'getAccounts',
		},
		IdExcluyeGrupos: {
			loadOptionsMethod: 'getPropertyGroups',
		},
		IdGrupos: {
			loadOptionsMethod: 'getPropertyGroups',
		},
	},
	solicitudesCreate: {
		idAgente: {
			loadOptionsMethod: 'getAgents',
		},
		idCampana: {
			loadOptionsMethod: 'getCampaigns',
		},
	},
	solicitudesUpdate: {
		idAgente: {
			loadOptionsMethod: 'getAgents',
		},
		idCampana: {
			loadOptionsMethod: 'getCampaigns',
		},
	},
	tareasCreate: {
		idTipo: {
			loadOptionsMethod: 'getTaskTypes',
		},
	},
	tareasGetMany: {
		IdTipo: {
			loadOptionsMethod: 'getTaskTypes',
		},
	},
	tareasUpdate: {
		idTipo: {
			loadOptionsMethod: 'getTaskTypes',
		},
	},
	visitasCreate: {
		idTipo: {
			loadOptionsMethod: 'getVisitTypes',
		},
	},
	visitasGetMany: {
		IdTipo: {
			loadOptionsMethod: 'getVisitTypes',
		},
	},
	visitasUpdate: {
		idTipo: {
			loadOptionsMethod: 'getVisitTypes',
		},
	},
};

export const mobiliaResources = [
	{ name: 'Agenda', value: 'agenda' },
	{ name: 'Agentes', value: 'agentes' },
	{ name: 'Aplicaciones Cliente', value: 'aplicacionesCliente' },
	{ name: 'Campañas', value: 'campanas' },
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
	{ name: 'Petición Personalizada', value: 'customRequest' },
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

type QueryCollectionKey = 'filters' | 'pagination' | 'presentation';

export interface MobiliaQueryFieldGroup {
	displayName: string;
	fields: MobiliaFieldDefinition[];
	key: QueryCollectionKey;
	placeholder: string;
}

export type MobiliaLocalFilterKind = 'boolean' | 'enum' | 'number' | 'string';
export type MobiliaLocalFilterOperator = 'contains' | 'equals' | 'max' | 'min';

export interface MobiliaLocalFilterDefinition {
	description: string;
	displayName: string;
	kind: MobiliaLocalFilterKind;
	name: string;
	options?: string[];
	operator: MobiliaLocalFilterOperator;
	path: string;
	placeholder?: string;
	role?: 'config' | 'filter';
}

export interface MobiliaLocalFilterGroup {
	displayName: string;
	name: string;
	operationValues: string[];
	placeholder: string;
	filters: MobiliaLocalFilterDefinition[];
}

const inmuebleListOperationValues = ['inmueblesGetMany', 'inmueblesGetDisabled', 'inmueblesGetAll'] as const;
const agenteListOperationValues = ['agentesGetMany'] as const;
const clienteListOperationValues = ['clientesGetMany'] as const;
const promocionListOperationValues = ['promocionesGetMany'] as const;
const solicitudListOperationValues = ['solicitudesGetMany'] as const;
const tareaListOperationValues = ['tareasGetMany'] as const;
const visitaListOperationValues = ['visitasGetMany'] as const;

const localStringFilter = (
	name: string,
	displayName: string,
	path: string,
	description: string,
	placeholder?: string,
	operator: MobiliaLocalFilterOperator = 'contains',
): MobiliaLocalFilterDefinition => ({
	name,
	displayName,
	path,
	description,
	placeholder,
	operator,
	kind: 'string',
});

const localNumberFilter = (
	name: string,
	displayName: string,
	path: string,
	description: string,
	operator: MobiliaLocalFilterOperator,
	placeholder?: string,
): MobiliaLocalFilterDefinition => ({
	name,
	displayName,
	path,
	description,
	placeholder,
	operator,
	kind: 'number',
});

const localBooleanFilter = (
	name: string,
	displayName: string,
	path: string,
	description: string,
): MobiliaLocalFilterDefinition => ({
	name,
	displayName,
	path,
	description,
	operator: 'equals',
	kind: 'boolean',
});

const localExactNumberFilter = (
	name: string,
	displayName: string,
	path: string,
	description: string,
	placeholder?: string,
): MobiliaLocalFilterDefinition =>
	localNumberFilter(name, displayName, path, description, 'equals', placeholder);

const localNumberRangeFilters = (
	namePrefix: string,
	displayName: string,
	path: string,
	description: string,
	minPlaceholder?: string,
	maxPlaceholder?: string,
): MobiliaLocalFilterDefinition[] => [
	localNumberFilter(
		`${namePrefix}MinLocal`,
		`${displayName} Mínimo`,
		path,
		description,
		'min',
		minPlaceholder,
	),
	localNumberFilter(
		`${namePrefix}MaxLocal`,
		`${displayName} Máximo`,
		path,
		description,
		'max',
		maxPlaceholder,
	),
];

const localEnumConfig = (
	name: string,
	displayName: string,
	description: string,
	options: string[],
	placeholder?: string,
): MobiliaLocalFilterDefinition => ({
	name,
	displayName,
	path: '',
	description,
	placeholder,
	operator: 'equals',
	kind: 'enum',
	options,
	role: 'config',
});

const propertyAdvancedPriceFilters: MobiliaLocalFilterDefinition[] = [
	localEnumConfig(
		'priceContextLocal',
		'Contexto De Precio',
		'Define qué precio debe usar el nodo para comparar rangos. Automático intenta deducirlo a partir de las operaciones activas del inmueble.',
		['Automatico', 'Venta', 'Alquiler', 'Traspaso'],
	),
	localNumberFilter(
		'priceMinLocal',
		'Precio Mínimo',
		'$propertyPrice',
		'Precio mínimo según el contexto seleccionado.',
		'min',
		'250000',
	),
	localNumberFilter(
		'priceMaxLocal',
		'Precio Máximo',
		'$propertyPrice',
		'Precio máximo según el contexto seleccionado.',
		'max',
		'450000',
	),
	localNumberFilter(
		'priceM2MinLocal',
		'Precio M2 Mínimo',
		'$propertyPricePerSquareMeter',
		'Precio mínimo por metro cuadrado según el contexto seleccionado.',
		'min',
		'1500',
	),
	localNumberFilter(
		'priceM2MaxLocal',
		'Precio M2 Máximo',
		'$propertyPricePerSquareMeter',
		'Precio máximo por metro cuadrado según el contexto seleccionado.',
		'max',
		'3500',
	),
	localBooleanFilter(
		'priceOnRequestLocal',
		'Precio A Consultar',
		'$propertyPriceOnRequest',
		'Filtra inmuebles cuyo precio principal esté marcado como a consultar según el contexto seleccionado.',
	),
];

const propertyAdvancedSizeFilters: MobiliaLocalFilterDefinition[] = [
	{
		name: 'metrosConstruidosMinLocal',
		displayName: 'M2 Construidos Mínimos',
		description: 'Filtra por metros construidos.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.metrosConstruidos',
		placeholder: '80',
	},
	{
		name: 'metrosConstruidosMaxLocal',
		displayName: 'M2 Construidos Máximos',
		description: 'Filtra por metros construidos.',
		kind: 'number',
		operator: 'max',
		path: 'caracteristicas.metrosConstruidos',
		placeholder: '200',
	},
	{
		name: 'metrosUtilesMinLocal',
		displayName: 'M2 Útiles Mínimos',
		description: 'Filtra por metros útiles.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.metrosUtiles',
		placeholder: '70',
	},
	{
		name: 'metrosUtilesMaxLocal',
		displayName: 'M2 Útiles Máximos',
		description: 'Filtra por metros útiles.',
		kind: 'number',
		operator: 'max',
		path: 'caracteristicas.metrosUtiles',
		placeholder: '160',
	},
	{
		name: 'metrosParcelaMinLocal',
		displayName: 'M2 Parcela Mínimos',
		description: 'Filtra por metros de parcela.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.metrosParcela',
		placeholder: '200',
	},
	{
		name: 'metrosParcelaMaxLocal',
		displayName: 'M2 Parcela Máximos',
		description: 'Filtra por metros de parcela.',
		kind: 'number',
		operator: 'max',
		path: 'caracteristicas.metrosParcela',
		placeholder: '1000',
	},
	{
		name: 'metrosTerrazasMinLocal',
		displayName: 'M2 Terraza Mínimos',
		description: 'Filtra por metros de terraza.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.metrosTerrazas',
		placeholder: '10',
	},
	{
		name: 'metrosTerrazasMaxLocal',
		displayName: 'M2 Terraza Máximos',
		description: 'Filtra por metros de terraza.',
		kind: 'number',
		operator: 'max',
		path: 'caracteristicas.metrosTerrazas',
		placeholder: '60',
	},
	{
		name: 'anoConstruccionDesdeLocal',
		displayName: 'Año Construcción Desde',
		description: 'Filtra inmuebles construidos a partir de este año.',
		kind: 'number',
		operator: 'min',
		path: 'anoConstruccion',
		placeholder: '2000',
	},
	{
		name: 'anoConstruccionHastaLocal',
		displayName: 'Año Construcción Hasta',
		description: 'Filtra inmuebles construidos hasta este año.',
		kind: 'number',
		operator: 'max',
		path: 'anoConstruccion',
		placeholder: '2024',
	},
];

const propertyAdvancedRoomFilters: MobiliaLocalFilterDefinition[] = [
	{
		name: 'habitacionesMinLocal',
		displayName: 'Habitaciones Mínimas',
		description: 'Filtra por número mínimo de habitaciones.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.habitaciones',
		placeholder: '2',
	},
	{
		name: 'habitacionesMaxLocal',
		displayName: 'Habitaciones Máximas',
		description: 'Filtra por número máximo de habitaciones.',
		kind: 'number',
		operator: 'max',
		path: 'caracteristicas.habitaciones',
		placeholder: '4',
	},
	{
		name: 'banosMinLocal',
		displayName: 'Baños Mínimos',
		description: 'Filtra por número mínimo de baños.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.banos',
		placeholder: '1',
	},
	{
		name: 'banosMaxLocal',
		displayName: 'Baños Máximos',
		description: 'Filtra por número máximo de baños.',
		kind: 'number',
		operator: 'max',
		path: 'caracteristicas.banos',
		placeholder: '3',
	},
	{
		name: 'aseosMinLocal',
		displayName: 'Aseos Mínimos',
		description: 'Filtra por número mínimo de aseos.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.aseos',
		placeholder: '1',
	},
	{
		name: 'aseosMaxLocal',
		displayName: 'Aseos Máximos',
		description: 'Filtra por número máximo de aseos.',
		kind: 'number',
		operator: 'max',
		path: 'caracteristicas.aseos',
		placeholder: '2',
	},
	{
		name: 'plazasParkingMinLocal',
		displayName: 'Plazas Parking Mínimas',
		description: 'Filtra por número mínimo de plazas de parking.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.plazasParking',
		placeholder: '1',
	},
	{
		name: 'plazasGarajeMinLocal',
		displayName: 'Plazas Garaje Mínimas',
		description: 'Filtra por número mínimo de plazas de garaje.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.plazasGaraje',
		placeholder: '1',
	},
	{
		name: 'terrazasMinLocal',
		displayName: 'Terrazas Mínimas',
		description: 'Filtra por número mínimo de terrazas.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.terrazas',
		placeholder: '1',
	},
];

const propertyAdvancedLocationFilters: MobiliaLocalFilterDefinition[] = [
	{
		name: 'codigoPostalLocal',
		displayName: 'Código Postal',
		description: 'Busca por código postal.',
		kind: 'string',
		operator: 'contains',
		path: 'codigoPostal',
		placeholder: '29680',
	},
	{
		name: 'poblacionLocal',
		displayName: 'Población',
		description: 'Busca por población.',
		kind: 'string',
		operator: 'contains',
		path: 'poblacion',
		placeholder: 'Estepona',
	},
	{
		name: 'provinciaLocal',
		displayName: 'Provincia',
		description: 'Busca por provincia.',
		kind: 'string',
		operator: 'contains',
		path: 'provincia',
		placeholder: 'Málaga',
	},
	{
		name: 'urbanizacionLocal',
		displayName: 'Urbanización',
		description: 'Busca por urbanización.',
		kind: 'string',
		operator: 'contains',
		path: 'urbanizacion',
		placeholder: 'Bahía Azul',
	},
	{
		name: 'nombreZonaLocal',
		displayName: 'Zona',
		description: 'Busca por zona.',
		kind: 'string',
		operator: 'contains',
		path: 'nombreZona',
		placeholder: 'Centro',
	},
	{
		name: 'direccionPublicaLocal',
		displayName: 'Dirección Pública',
		description: 'Busca por la dirección pública del inmueble.',
		kind: 'string',
		operator: 'contains',
		path: 'direccionPublica',
		placeholder: 'Avenida',
	},
	{
		name: 'referenciaCatastralLocal',
		displayName: 'Referencia Catastral',
		description: 'Busca por referencia catastral.',
		kind: 'string',
		operator: 'contains',
		path: 'referenciaCatastral',
		placeholder: '1234567UF',
	},
];

const propertyAdvancedFeatureFilters: MobiliaLocalFilterDefinition[] = [
	{
		name: 'activoLocal',
		displayName: 'Activo',
		description: 'Filtra por inmuebles activos o inactivos.',
		kind: 'boolean',
		operator: 'equals',
		path: 'activo',
	},
	{
		name: 'publicarEnWebLocal',
		displayName: 'Publicado En Web',
		description: 'Filtra por inmuebles publicados o no publicados en web.',
		kind: 'boolean',
		operator: 'equals',
		path: 'publicarEnWeb',
	},
	{
		name: 'reservadoLocal',
		displayName: 'Reservado',
		description: 'Filtra por inmuebles reservados.',
		kind: 'boolean',
		operator: 'equals',
		path: 'reservado',
	},
	{
		name: 'amuebladoLocal',
		displayName: 'Amueblado',
		description: 'Filtra por inmuebles amueblados.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.amueblado',
	},
	{
		name: 'jardinLocal',
		displayName: 'Jardín',
		description: 'Filtra por inmuebles con jardín.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.jardin',
	},
	{
		name: 'piscinaPrivadaLocal',
		displayName: 'Piscina Privada',
		description: 'Filtra por inmuebles con piscina privada.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.piscinaPrivada',
	},
	{
		name: 'piscinaComunitariaLocal',
		displayName: 'Piscina Comunitaria',
		description: 'Filtra por inmuebles con piscina comunitaria.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.piscinaComunitaria',
	},
	{
		name: 'ascensorLocal',
		displayName: 'Ascensor',
		description: 'Filtra por inmuebles con ascensor.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.ascensor',
	},
	{
		name: 'aireAcondicionadoLocal',
		displayName: 'Aire Acondicionado',
		description: 'Filtra por inmuebles con aire acondicionado.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.aireAcondicionado',
	},
	{
		name: 'admiteMascotasLocal',
		displayName: 'Admite Mascotas',
		description: 'Filtra por inmuebles que admiten mascotas.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.admiteMascotas',
	},
	{
		name: 'trasteroLocal',
		displayName: 'Con Trastero',
		description: 'Filtra por inmuebles con al menos un trastero.',
		kind: 'number',
		operator: 'min',
		path: 'caracteristicas.trastero',
		placeholder: '1',
	},
	{
		name: 'primeraLineaPlayaLocal',
		displayName: 'Primera Línea De Playa',
		description: 'Filtra por inmuebles en primera línea de playa.',
		kind: 'boolean',
		operator: 'equals',
		path: 'caracteristicas.primeraLineaPlaya',
	},
];

const propertyAdvancedIdentityFilters: MobiliaLocalFilterDefinition[] = [
	localStringFilter(
		'propertyReferenceLocal',
		'Referencia Exacta',
		'referencia',
		'Busca por referencia exacta del inmueble.',
		'REF-001',
		'equals',
	),
	localExactNumberFilter(
		'propertyPortalIdLocal',
		'Portal ID',
		'portalId',
		'Filtra por portal ID exacto.',
		'123',
	),
	localExactNumberFilter(
		'propertyPromotionReferenceLocal',
		'Referencia Promoción',
		'referenciaPromocion',
		'Filtra por referencia de promoción exacta.',
		'456',
	),
	localStringFilter(
		'propertyFamilyLocal',
		'Familia',
		'familiaInmueble.familiaInmueble',
		'Busca por familia del inmueble.',
		'Piso',
	),
	localStringFilter(
		'propertyTypeLocal',
		'Tipo De Inmueble',
		'tipoInmueble.tipoInmueble',
		'Busca por tipo de inmueble.',
		'Ático',
	),
	localStringFilter(
		'propertyUseLocal',
		'Uso Del Inmueble',
		'usoInmueble.uso',
		'Busca por uso del inmueble.',
		'Residencial',
	),
	localStringFilter(
		'propertyStateTextLocal',
		'Estado Comercial',
		'estado',
		'Busca por el estado comercial mostrado por Mobilia.',
		'Disponible',
	),
	localStringFilter(
		'propertyConservationLocal',
		'Conservación',
		'conservacionInmueble.conservacion',
		'Busca por el estado de conservación.',
		'Reformado',
	),
	localStringFilter(
		'propertyHeatingTypeLocal',
		'Tipo De Calefacción',
		'calefaccion.tipoCalefaccion',
		'Busca por tipo de calefacción.',
		'Central',
	),
	localStringFilter(
		'propertyLicenseTypeLocal',
		'Tipo De Licencia',
		'tipoLicencia.licencia',
		'Busca por tipo de licencia.',
		'Turística',
	),
	localStringFilter(
		'propertyCampaignNameLocal',
		'Nombre De Campaña',
		'nombreCampana',
		'Busca por el nombre de la campaña asociada.',
		'Primavera',
	),
	localStringFilter(
		'propertyGroupNameLocal',
		'Nombre De Grupo',
		'grupos.nombreGrupo',
		'Busca por nombre de grupo del inmueble.',
		'Captación',
	),
	localStringFilter(
		'propertyAccountNameLocal',
		'Nombre De Cuenta',
		'cuentas.nombre',
		'Busca por nombre de cuenta del inmueble.',
		'Delegación Costa',
	),
];

const propertyAdvancedCommercialFilters: MobiliaLocalFilterDefinition[] = [
	...([
		['propertyVentaLocal', 'Venta Activa', 'venta', 'Filtra inmuebles que admiten venta.'],
		['propertyAlquilerLocal', 'Alquiler Activo', 'alquiler', 'Filtra inmuebles que admiten alquiler.'],
		['propertyTraspasoLocal', 'Traspaso Activo', 'traspaso', 'Filtra inmuebles que admiten traspaso.'],
		[
			'propertyAlquilerTemporadaLocal',
			'Alquiler De Temporada',
			'alquilerTemporada',
			'Filtra inmuebles con alquiler de temporada.',
		],
		[
			'propertyAlquilerVacacionalLocal',
			'Alquiler Vacacional',
			'alquilerVacacional',
			'Filtra inmuebles con alquiler vacacional.',
		],
		[
			'propertyAlquilerOpcionCompraLocal',
			'Alquiler Con Opción A Compra',
			'alquilerOpcionCompra',
			'Filtra inmuebles con alquiler con opción a compra.',
		],
	].map(([name, displayName, path, description]) =>
		localBooleanFilter(name, displayName, path, description),
	)),
	localExactNumberFilter(
		'propertySaleAgentIdLocal',
		'ID Agente Venta',
		'idAgenteVenta',
		'Filtra por el agente responsable de venta.',
		'12',
	),
	localExactNumberFilter(
		'propertyRentalAgentIdLocal',
		'ID Agente Alquiler',
		'idAgenteAlquiler',
		'Filtra por el agente responsable de alquiler.',
		'12',
	),
	localExactNumberFilter(
		'propertyTransferAgentIdLocal',
		'ID Agente Traspaso',
		'idAgenteTraspaso',
		'Filtra por el agente responsable de traspaso.',
		'12',
	),
	localExactNumberFilter(
		'propertySaleCaptorIdLocal',
		'ID Captador Venta',
		'idAgenteCaptadorVenta',
		'Filtra por el agente captador de venta.',
		'12',
	),
	localExactNumberFilter(
		'propertyRentalCaptorIdLocal',
		'ID Captador Alquiler',
		'idAgenteCaptadorAlquiler',
		'Filtra por el agente captador de alquiler.',
		'12',
	),
	localExactNumberFilter(
		'propertyTransferCaptorIdLocal',
		'ID Captador Traspaso',
		'idAgenteCaptadorTraspaso',
		'Filtra por el agente captador de traspaso.',
		'12',
	),
	localExactNumberFilter(
		'propertySaleStateIdLocal',
		'ID Estado Venta',
		'idEstadoVenta',
		'Filtra por ID de estado de venta.',
		'1',
	),
	localExactNumberFilter(
		'propertyRentalStateIdLocal',
		'ID Estado Alquiler',
		'idEstadoAlquiler',
		'Filtra por ID de estado de alquiler.',
		'1',
	),
	localExactNumberFilter(
		'propertyTransferStateIdLocal',
		'ID Estado Traspaso',
		'idEstadoTraspaso',
		'Filtra por ID de estado de traspaso.',
		'1',
	),
];

const propertyAdvancedPublicationFilters: MobiliaLocalFilterDefinition[] = [
	localBooleanFilter(
		'propertyCoverWebLocal',
		'Portada Web',
		'portadaWeb',
		'Filtra por inmuebles marcados como portada web.',
	),
	localBooleanFilter(
		'propertyShowExactAddressLocal',
		'Mostrar Dirección Exacta',
		'mostrarDireccionExacta',
		'Filtra por inmuebles con dirección exacta visible.',
	),
	localBooleanFilter(
		'propertyShowAgeLocal',
		'Mostrar Antigüedad',
		'mostrarAntiguedad',
		'Filtra por inmuebles en los que se muestra la antigüedad.',
	),
];

const propertyAdvancedMediaFilters: MobiliaLocalFilterDefinition[] = [
	localNumberFilter(
		'propertyPhotosMinLocal',
		'Fotos Mínimas',
		'fotos.length',
		'Filtra por número mínimo de fotos.',
		'min',
		'1',
	),
	localNumberFilter(
		'propertyPhotos360MinLocal',
		'Fotos 360 Mínimas',
		'fotos360.length',
		'Filtra por número mínimo de fotos 360.',
		'min',
		'1',
	),
	localNumberFilter(
		'propertyVideosMinLocal',
		'Vídeos Mínimos',
		'videos.length',
		'Filtra por número mínimo de vídeos.',
		'min',
		'1',
	),
	localNumberFilter(
		'propertyDocumentsMinLocal',
		'Documentos Mínimos',
		'archivos.length',
		'Filtra por número mínimo de documentos.',
		'min',
		'1',
	),
];

const propertyAdvancedConditionFilters: MobiliaLocalFilterDefinition[] = [
	...localNumberRangeFilters(
		'propertyCommunityFee',
		'Gastos De Comunidad',
		'caracteristicas.gastosComunidad',
		'Filtra por gastos de comunidad.',
		'50',
		'250',
	),
	...localNumberRangeFilters(
		'propertyIbi',
		'IBI',
		'caracteristicas.ibi',
		'Filtra por importe de IBI.',
		'100',
		'1000',
	),
	...localNumberRangeFilters(
		'propertyWasteTax',
		'Basuras',
		'caracteristicas.basuras',
		'Filtra por importe de basuras.',
		'50',
		'400',
	),
	...localNumberRangeFilters(
		'propertyEnergyConsumption',
		'Consumo Energético',
		'caracteristicas.consumo',
		'Filtra por consumo energético.',
		'50',
		'300',
	),
	...localNumberRangeFilters(
		'propertyEmissions',
		'Emisiones',
		'caracteristicas.emisiones',
		'Filtra por emisiones.',
		'10',
		'100',
	),
	localStringFilter(
		'propertyOrientationLocal',
		'Orientación',
		'caracteristicas.orientacion',
		'Busca por orientación.',
		'Sur',
	),
	localStringFilter(
		'propertyPreviousActivityLocal',
		'Actividad Anterior',
		'caracteristicas.actividadAnterior',
		'Busca por actividad anterior.',
		'Restaurante',
	),
	localStringFilter(
		'propertyZoneOperatorsLocal',
		'Operadores De Zona',
		'caracteristicas.operadoresZona',
		'Busca por operadores de la zona.',
		'Fibra',
	),
	localStringFilter(
		'propertyHabitabilityCertificateLocal',
		'Cédula De Habitabilidad',
		'caracteristicas.cedulaHabitabilidad',
		'Busca por el texto de la cédula de habitabilidad.',
		'Vigente',
	),
];

const propertyAdvancedDimensionExtensionFilters: MobiliaLocalFilterDefinition[] = [
	...localNumberRangeFilters(
		'metrosJardin',
		'M2 Jardín',
		'caracteristicas.metrosJardin',
		'Filtra por metros de jardín.',
		'20',
		'300',
	),
	...localNumberRangeFilters(
		'metrosParking',
		'M2 Parking',
		'caracteristicas.metrosParking',
		'Filtra por metros de parking.',
		'10',
		'40',
	),
	...localNumberRangeFilters(
		'metrosGaraje',
		'M2 Garaje',
		'caracteristicas.metrosGaraje',
		'Filtra por metros de garaje.',
		'10',
		'50',
	),
	...localNumberRangeFilters(
		'metrosPorches',
		'M2 Porches',
		'caracteristicas.metrosPorches',
		'Filtra por metros de porches.',
		'10',
		'100',
	),
	...localNumberRangeFilters(
		'metrosFachada',
		'M2 Fachada',
		'caracteristicas.metrosFachada',
		'Filtra por metros de fachada.',
		'5',
		'50',
	),
	...localNumberRangeFilters(
		'metrosFachadaSecundaria',
		'M2 Fachada Secundaria',
		'caracteristicas.metrosFachadaSecundaria',
		'Filtra por metros de fachada secundaria.',
		'5',
		'50',
	),
	...localNumberRangeFilters(
		'metrosEdificables',
		'M2 Edificables',
		'caracteristicas.metrosEdificables',
		'Filtra por metros edificables.',
		'100',
		'1000',
	),
	...localNumberRangeFilters(
		'metrosOficinas',
		'M2 Oficinas',
		'caracteristicas.metrosOficinas',
		'Filtra por metros de oficinas.',
		'20',
		'500',
	),
	...localNumberRangeFilters(
		'alturaTecho',
		'Altura De Techo',
		'caracteristicas.alturaTecho',
		'Filtra por altura de techo.',
		'2.5',
		'8',
	),
	...localNumberRangeFilters(
		'superficieOcupacion',
		'Superficie De Ocupación',
		'caracteristicas.superficieOcupacion',
		'Filtra por superficie de ocupación.',
		'50',
		'500',
	),
	...localNumberRangeFilters(
		'repercusionMetros',
		'Repercusión De Metros',
		'caracteristicas.repercusionMetros',
		'Filtra por repercusión de metros.',
		'100',
		'2000',
	),
	...localNumberRangeFilters(
		'superficiePlantaBaja',
		'Superficie Planta Baja',
		'caracteristicas.superficiePlantaBaja',
		'Filtra por superficie de planta baja.',
		'50',
		'500',
	),
];

const propertyAdvancedRoomExtensionFilters: MobiliaLocalFilterDefinition[] = [
	...localNumberRangeFilters(
		'habitacionesServicio',
		'Habitaciones De Servicio',
		'caracteristicas.habitacionesServicio',
		'Filtra por número de habitaciones de servicio.',
		'1',
		'4',
	),
	...localNumberRangeFilters(
		'despachos',
		'Despachos',
		'caracteristicas.despachos',
		'Filtra por número de despachos.',
		'1',
		'10',
	),
	...localNumberRangeFilters(
		'salasReunion',
		'Salas De Reunión',
		'caracteristicas.salasReunion',
		'Filtra por número de salas de reunión.',
		'1',
		'6',
	),
	...localNumberRangeFilters(
		'numeroOficinas',
		'Número De Oficinas',
		'caracteristicas.numeroOficinas',
		'Filtra por número de oficinas.',
		'1',
		'20',
	),
	...localNumberRangeFilters(
		'numPlantas',
		'Plantas Del Inmueble',
		'caracteristicas.numPlantas',
		'Filtra por número de plantas del inmueble.',
		'1',
		'6',
	),
	...localNumberRangeFilters(
		'aforo',
		'Aforo',
		'caracteristicas.aforo',
		'Filtra por aforo.',
		'10',
		'300',
	),
	...localNumberRangeFilters(
		'capacidad',
		'Capacidad',
		'caracteristicas.capacidad',
		'Filtra por capacidad.',
		'10',
		'300',
	),
];

const propertyAdvancedLocationExtensionFilters: MobiliaLocalFilterDefinition[] = [
	localStringFilter(
		'propertyPrivateAddressLocal',
		'Dirección Privada',
		'direccionPrivada',
		'Busca por dirección privada.',
		'Calle Mayor',
	),
	localStringFilter(
		'propertyBlockLocal',
		'Bloque',
		'bloque',
		'Busca por bloque.',
		'B',
	),
	localStringFilter(
		'propertyStaircaseLocal',
		'Escalera',
		'escalera',
		'Busca por escalera.',
		'2',
	),
	localStringFilter(
		'propertyFloorLocal',
		'Planta',
		'planta',
		'Busca por planta.',
		'3',
	),
	localStringFilter(
		'propertyLetterLocal',
		'Letra',
		'letra',
		'Busca por letra.',
		'A',
	),
	localStringFilter(
		'propertyPlotLocal',
		'Parcela',
		'parcela',
		'Busca por parcela.',
		'12',
	),
	localStringFilter(
		'propertyZoneGroupNameLocal',
		'Grupo De Zona',
		'nombreGrupoZona',
		'Busca por nombre de grupo de zona.',
		'Costa',
	),
];

const propertyAdvancedInteriorFilters: MobiliaLocalFilterDefinition[] = [
	...([
		['propertyKitchenLocal', 'Cocina', 'caracteristicas.cocina', 'Filtra por inmuebles con cocina.'],
		[
			'propertyFurnishedKitchenLocal',
			'Cocina Amueblada',
			'caracteristicas.cocinaAmueblada',
			'Filtra por inmuebles con cocina amueblada.',
		],
		['propertyWardrobesLocal', 'Armarios', 'caracteristicas.armarios', 'Filtra por inmuebles con armarios.'],
		['propertyDiningRoomLocal', 'Comedor', 'caracteristicas.comedor', 'Filtra por inmuebles con comedor.'],
		['propertyPatioLocal', 'Patio', 'caracteristicas.patio', 'Filtra por inmuebles con patio.'],
		['propertyLoftLocal', 'Buhardilla', 'caracteristicas.buhardilla', 'Filtra por inmuebles con buhardilla.'],
		[
			'propertyGroundFloorRoomLocal',
			'Habitación En Planta Baja',
			'caracteristicas.habitacionPlantaBaja',
			'Filtra por inmuebles con habitación en planta baja.',
		],
		['propertyLaundryLocal', 'Lavadero', 'caracteristicas.lavadero', 'Filtra por inmuebles con lavadero.'],
		[
			'propertyDishwasherLocal',
			'Lavavajillas',
			'caracteristicas.lavavajillas',
			'Filtra por inmuebles con lavavajillas.',
		],
	].map(([name, displayName, path, description]) =>
		localBooleanFilter(name, displayName, path, description),
	)),
	localNumberFilter(
		'propertyFireplaceMinLocal',
		'Chimeneas Mínimas',
		'caracteristicas.chimenea',
		'Filtra por número mínimo de chimeneas.',
		'min',
		'1',
	),
];

const propertyAdvancedExteriorFilters: MobiliaLocalFilterDefinition[] = [
	...([
		['propertySolariumLocal', 'Solarium', 'caracteristicas.solarium', 'Filtra por inmuebles con solarium.'],
		['propertyBarbecueLocal', 'Barbacoa', 'caracteristicas.barbacoa', 'Filtra por inmuebles con barbacoa.'],
		[
			'propertyTerraceDryingAreaLocal',
			'Terraza Tendedero',
			'caracteristicas.terrazaTendedero',
			'Filtra por inmuebles con terraza tendedero.',
		],
		[
			'propertySecondLineBeachLocal',
			'Segunda Línea De Playa',
			'caracteristicas.segundaLineaPlaya',
			'Filtra por inmuebles en segunda línea de playa.',
		],
		[
			'propertyCornerLocal',
			'En Esquina',
			'caracteristicas.enEsquina',
			'Filtra por inmuebles en esquina.',
		],
		[
			'propertyIsolatedLocal',
			'Aislada',
			'caracteristicas.aislada',
			'Filtra por inmuebles aislados.',
		],
	].map(([name, displayName, path, description]) =>
		localBooleanFilter(name, displayName, path, description),
	)),
	localNumberFilter(
		'propertyPorchesMinLocal',
		'Porches Mínimos',
		'caracteristicas.porches',
		'Filtra por número mínimo de porches.',
		'min',
		'1',
	),
];

const propertyAdvancedCommunityFilters: MobiliaLocalFilterDefinition[] = [
	...([
		['propertyCommonAreasLocal', 'Zonas Comunes', 'caracteristicas.zonasComunes', 'Filtra por inmuebles con zonas comunes.'],
		['propertyGreenAreasLocal', 'Zonas Verdes', 'caracteristicas.zonasVerdes', 'Filtra por inmuebles con zonas verdes.'],
		['propertyKidsAreaLocal', 'Zona Infantil', 'caracteristicas.zonaInfantil', 'Filtra por inmuebles con zona infantil.'],
		['propertyGymLocal', 'Gimnasio', 'caracteristicas.gimnasio', 'Filtra por inmuebles con gimnasio.'],
		['propertyPadelLocal', 'Pádel', 'caracteristicas.padel', 'Filtra por inmuebles con pádel.'],
		['propertyTennisLocal', 'Pista De Tenis', 'caracteristicas.pistaTenis', 'Filtra por inmuebles con pista de tenis.'],
		[
			'propertySportsCourtLocal',
			'Pista Multiusos',
			'caracteristicas.pistaMultiusos',
			'Filtra por inmuebles con pista multiusos.',
		],
		[
			'propertyCommunityRoomLocal',
			'Sala Comunitaria',
			'caracteristicas.salaComunitaria',
			'Filtra por inmuebles con sala comunitaria.',
		],
		['propertyConciergeLocal', 'Conserje', 'caracteristicas.conserje', 'Filtra por inmuebles con conserje.'],
	].map(([name, displayName, path, description]) =>
		localBooleanFilter(name, displayName, path, description),
	)),
];

const propertyAdvancedInfrastructureFilters: MobiliaLocalFilterDefinition[] = [
	...([
		['propertyGasLocal', 'Gas', 'caracteristicas.gas', 'Filtra por inmuebles con gas.'],
		['propertyElectricityLocal', 'Luz', 'caracteristicas.luz', 'Filtra por inmuebles con luz.'],
		['propertyWaterLocal', 'Agua', 'caracteristicas.agua', 'Filtra por inmuebles con agua.'],
		['propertyPhoneLocal', 'Teléfono', 'caracteristicas.telefono', 'Filtra por inmuebles con teléfono.'],
		['propertyInternetLocal', 'Internet', 'caracteristicas.internet', 'Filtra por inmuebles con internet.'],
		['propertyLiftLocal', 'Ascensor', 'caracteristicas.ascensor', 'Filtra por inmuebles con ascensor.'],
		[
			'propertyAirConditioningLocal',
			'Aire Acondicionado',
			'caracteristicas.aireAcondicionado',
			'Filtra por inmuebles con aire acondicionado.',
		],
		['propertyInteriorLocal', 'Interior', 'caracteristicas.interior', 'Filtra por inmuebles interiores.'],
		['propertyExteriorLocal', 'Exterior', 'caracteristicas.exterior', 'Filtra por inmuebles exteriores.'],
		['propertyPavedLocal', 'Asfaltado', 'caracteristicas.asfaltado', 'Filtra por inmuebles en zona asfaltada.'],
		['propertyLightingLocal', 'Alumbrado', 'caracteristicas.alumbrado', 'Filtra por inmuebles con alumbrado.'],
		['propertyUrbanizedLocal', 'Urbanizado', 'caracteristicas.urbanizado', 'Filtra por inmuebles urbanizados.'],
		[
			'propertyFireProtectionLocal',
			'Sistema Antiincendios',
			'caracteristicas.sistemaAntiincendios',
			'Filtra por inmuebles con sistema antiincendios.',
		],
		['propertyRoofedLocal', 'Cubierta', 'caracteristicas.cubierta', 'Filtra por inmuebles con cubierta.'],
		['propertyIntranetLocal', 'Intranet', 'caracteristicas.intranet', 'Filtra por inmuebles con intranet.'],
		[
			'propertyEmergencyExitLocal',
			'Salida De Emergencia',
			'caracteristicas.salidaEmergencia',
			'Filtra por inmuebles con salida de emergencia.',
		],
		['propertyFencedLocal', 'Vallado', 'caracteristicas.vallado', 'Filtra por inmuebles vallados.'],
		['propertyServiceLinesLocal', 'Acometidas', 'caracteristicas.acometidas', 'Filtra por inmuebles con acometidas.'],
		['propertyLoadingCraneLocal', 'Grúa Montacargas', 'caracteristicas.gruaMontacargas', 'Filtra por inmuebles con grúa montacargas.'],
		['propertyLoadingDockLocal', 'Muelle De Carga', 'caracteristicas.muelleCarga', 'Filtra por inmuebles con muelle de carga.'],
		[
			'propertyForkliftBridgeLocal',
			'Puente Grúa',
			'caracteristicas.puenteGrua',
			'Filtra por inmuebles con puente grúa.',
		],
		[
			'propertyColdStorageLocal',
			'Cámara Frigorífica',
			'caracteristicas.camaraFrigorifica',
			'Filtra por inmuebles con cámara frigorífica.',
		],
		['propertyWeighbridgeLocal', 'Báscula', 'caracteristicas.bascula', 'Filtra por inmuebles con báscula.'],
		['propertyHoistLocal', 'Montacargas', 'caracteristicas.montacargas', 'Filtra por inmuebles con montacargas.'],
		['propertyVadoLocal', 'Vado', 'caracteristicas.vado', 'Filtra por inmuebles con vado.'],
		[
			'propertyChargingPointLocal',
			'Punto De Recarga',
			'caracteristicas.puntoRecarga',
			'Filtra por inmuebles con punto de recarga.',
		],
		['propertySolarPanelLocal', 'Panel Solar', 'caracteristicas.panelSolar', 'Filtra por inmuebles con panel solar.'],
	].map(([name, displayName, path, description]) =>
		localBooleanFilter(name, displayName, path, description),
	)),
	localNumberFilter(
		'propertySmokeOutletMinLocal',
		'Salida De Humos Mínima',
		'caracteristicas.salidaHumos',
		'Filtra por inmuebles con al menos este nivel de salida de humos.',
		'min',
		'1',
	),
];

const propertyAdvancedSecurityFilters: MobiliaLocalFilterDefinition[] = [
	...([
		[
			'propertyInteriorAlarmLocal',
			'Alarma Interior',
			'caracteristicas.alarmaInterior',
			'Filtra por inmuebles con alarma interior.',
		],
		[
			'propertyPerimeterAlarmLocal',
			'Alarma Perimetral',
			'caracteristicas.alarmaPerimetral',
			'Filtra por inmuebles con alarma perimetral.',
		],
		[
			'propertyArmoredDoorLocal',
			'Puerta Blindada',
			'caracteristicas.puertaBlindada',
			'Filtra por inmuebles con puerta blindada.',
		],
		['propertySurveillanceLocal', 'Vigilancia', 'caracteristicas.vigilancia', 'Filtra por inmuebles con vigilancia.'],
		['propertySafeLocal', 'Caja Fuerte', 'caracteristicas.cajaFuerte', 'Filtra por inmuebles con caja fuerte.'],
		[
			'propertyWindowBarsLocal',
			'Rejas En Ventanas',
			'caracteristicas.rejasEnVentanas',
			'Filtra por inmuebles con rejas en ventanas.',
		],
		['propertyAdaptedLocal', 'Adaptado', 'caracteristicas.adaptado', 'Filtra por inmuebles adaptados.'],
		[
			'propertyDisabledAccessLocal',
			'Acceso Minusválidos',
			'caracteristicas.accesoMinusvalidos',
			'Filtra por inmuebles con acceso para personas con movilidad reducida.',
		],
		[
			'propertyAccessSurveillanceLocal',
			'Vigilancia De Acceso',
			'caracteristicas.vigilanciaAcceso',
			'Filtra por inmuebles con vigilancia de acceso.',
		],
		[
			'propertyVideoSurveillanceLocal',
			'Videovigilancia',
			'caracteristicas.videoVigilancia',
			'Filtra por inmuebles con videovigilancia.',
		],
		[
			'propertyAntiSquatDoorLocal',
			'Puerta Anti-Okupa',
			'caracteristicas.puertaAntiOkupa',
			'Filtra por inmuebles con puerta anti-okupa.',
		],
	].map(([name, displayName, path, description]) =>
		localBooleanFilter(name, displayName, path, description),
	)),
];

const propertyAdvancedBusinessFilters: MobiliaLocalFilterDefinition[] = [
	...([
		['propertyDivisionsLocal', 'Divisiones', 'caracteristicas.divisiones', 'Filtra por inmuebles con divisiones.'],
		['propertyShopWindowLocal', 'Escaparate', 'caracteristicas.escaparate', 'Filtra por inmuebles con escaparate.'],
		['propertyGroundFloorLocal', 'Planta Baja', 'caracteristicas.plantaBaja', 'Filtra por inmuebles en planta baja.'],
		['propertyMezzanineLocal', 'Altillo', 'caracteristicas.altillo', 'Filtra por inmuebles con altillo.'],
		[
			'propertyChangingRoomsLocal',
			'Vestuarios',
			'caracteristicas.vestuarios',
			'Filtra por inmuebles con vestuarios.',
		],
		['propertyWellLocal', 'Pozo', 'caracteristicas.pozo', 'Filtra por inmuebles con pozo.'],
		['propertyCommercialAreaLocal', 'Zona Comercial', 'caracteristicas.zonaComercial', 'Filtra por inmuebles en zona comercial.'],
		[
			'propertyHasOfficesLocal',
			'Tiene Oficinas',
			'caracteristicas.tieneOficinas',
			'Filtra por inmuebles con oficinas.',
		],
		['propertyStorageLocal', 'Almacén', 'caracteristicas.almacen', 'Filtra por inmuebles con almacén.'],
		[
			'propertyFireproofTreatmentLocal',
			'Tratamiento Ignífugo',
			'caracteristicas.tratamientoIgnifugo',
			'Filtra por inmuebles con tratamiento ignífugo.',
		],
		[
			'propertySoundproofedLocal',
			'Insonorizado',
			'caracteristicas.insonorizado',
			'Filtra por inmuebles insonorizados.',
		],
		['propertyCabreteLocal', 'Cabrete', 'caracteristicas.cabrete', 'Filtra por inmuebles con cabrete.'],
	].map(([name, displayName, path, description]) =>
		localBooleanFilter(name, displayName, path, description),
	)),
	...localNumberRangeFilters(
		'propertyEntrances',
		'Entradas',
		'caracteristicas.entradas',
		'Filtra por número de entradas.',
		'1',
		'20',
	),
	...localNumberRangeFilters(
		'propertyEntradasTir',
		'Entradas TIR',
		'caracteristicas.entradasTIR',
		'Filtra por número de entradas TIR.',
		'1',
		'10',
	),
	...localNumberRangeFilters(
		'propertyShowcases',
		'Escaparates',
		'caracteristicas.numeroEscaparates',
		'Filtra por número de escaparates.',
		'1',
		'20',
	),
	...localNumberRangeFilters(
		'propertyTransferMinimumYears',
		'Años Traspaso Mínimos',
		'caracteristicas.anosTraspasoMinimo',
		'Filtra por años mínimos de traspaso.',
		'1',
		'20',
	),
];

export const mobiliaPropertyAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	{
		name: 'propertyAdvancedIdentityFilters',
		displayName: 'Identificación Y Clasificación',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de identificación',
		filters: propertyAdvancedIdentityFilters,
	},
	{
		name: 'propertyAdvancedCommercialFilters',
		displayName: 'Operación, Estados Y Responsables',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro comercial',
		filters: propertyAdvancedCommercialFilters,
	},
	{
		name: 'propertyAdvancedPriceFilters',
		displayName: 'Contexto Comercial Y Precio',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro comercial',
		filters: propertyAdvancedPriceFilters,
	},
	{
		name: 'propertyAdvancedSizeFilters',
		displayName: 'Filtros Avanzados De Superficie',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de superficie',
		filters: [...propertyAdvancedSizeFilters, ...propertyAdvancedDimensionExtensionFilters],
	},
	{
		name: 'propertyAdvancedRoomFilters',
		displayName: 'Filtros Avanzados De Estancias',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de estancias',
		filters: [...propertyAdvancedRoomFilters, ...propertyAdvancedRoomExtensionFilters],
	},
	{
		name: 'propertyAdvancedLocationFilters',
		displayName: 'Filtros Avanzados De Ubicación',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de ubicación',
		filters: [...propertyAdvancedLocationFilters, ...propertyAdvancedLocationExtensionFilters],
	},
	{
		name: 'propertyAdvancedFeatureFilters',
		displayName: 'Publicación Y Estado General',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de características',
		filters: propertyAdvancedFeatureFilters,
	},
	{
		name: 'propertyAdvancedPublicationFilters',
		displayName: 'Visibilidad Y Presentación',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de visibilidad',
		filters: propertyAdvancedPublicationFilters,
	},
	{
		name: 'propertyAdvancedMediaFilters',
		displayName: 'Multimedia Y Documentación',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de medios',
		filters: propertyAdvancedMediaFilters,
	},
	{
		name: 'propertyAdvancedInteriorFilters',
		displayName: 'Interior Y Confort',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de interior',
		filters: propertyAdvancedInteriorFilters,
	},
	{
		name: 'propertyAdvancedExteriorFilters',
		displayName: 'Exterior Y Entorno',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro exterior',
		filters: propertyAdvancedExteriorFilters,
	},
	{
		name: 'propertyAdvancedCommunityFilters',
		displayName: 'Comunidad Y Zonas Comunes',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de comunidad',
		filters: propertyAdvancedCommunityFilters,
	},
	{
		name: 'propertyAdvancedInfrastructureFilters',
		displayName: 'Servicios E Infraestructura',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de infraestructura',
		filters: propertyAdvancedInfrastructureFilters,
	},
	{
		name: 'propertyAdvancedSecurityFilters',
		displayName: 'Seguridad Y Accesibilidad',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro de seguridad',
		filters: propertyAdvancedSecurityFilters,
	},
	{
		name: 'propertyAdvancedBusinessFilters',
		displayName: 'Comercial, Industrial Y Oficinas',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro profesional',
		filters: propertyAdvancedBusinessFilters,
	},
	{
		name: 'propertyAdvancedConditionFilters',
		displayName: 'Gastos, Certificados Y Datos Técnicos',
		operationValues: [...inmuebleListOperationValues],
		placeholder: 'Añadir filtro técnico',
		filters: propertyAdvancedConditionFilters,
	},
];

export const mobiliaPropertyAdvancedFilterDefinitions = mobiliaPropertyAdvancedFilterGroups.flatMap(
	(group) => group.filters,
);

export const mobiliaAgentAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	{
		name: 'agentAdvancedIdentityFilters',
		displayName: 'Filtros Avanzados De Identidad',
		operationValues: [...agenteListOperationValues],
		placeholder: 'Añadir filtro de agente',
		filters: [
			localNumberFilter('agentIdMinLocal', 'ID Agente Mínimo', 'idAgente', 'Filtra por ID mínimo de agente.', 'min', '1'),
			localNumberFilter('agentIdMaxLocal', 'ID Agente Máximo', 'idAgente', 'Filtra por ID máximo de agente.', 'max', '9999'),
			localStringFilter('agentNameLocal', 'Nombre', 'nombreUsuario', 'Busca por nombre del agente.', 'María'),
			localStringFilter('agentEmailLocal', 'Email', 'email', 'Busca por email del agente.', 'agente@dominio.com'),
		],
	},
];

export const mobiliaClientAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	{
		name: 'clientAdvancedIdentityFilters',
		displayName: 'Filtros Avanzados De Identidad',
		operationValues: [...clienteListOperationValues],
		placeholder: 'Añadir filtro de identidad',
		filters: [
			localNumberFilter('clientReferenceMinLocal', 'Referencia Mínima', 'referencia', 'Filtra por referencia mínima de cliente.', 'min', '1000'),
			localNumberFilter('clientReferenceMaxLocal', 'Referencia Máxima', 'referencia', 'Filtra por referencia máxima de cliente.', 'max', '9999'),
			localStringFilter('clientDniLocal', 'DNI', 'dni', 'Busca por DNI.', '12345678A'),
			localStringFilter('clientNameLocal', 'Nombre', 'nombre', 'Busca por nombre.', 'Juan'),
			localStringFilter('clientAliasLocal', 'Alias', 'alias', 'Busca por alias.', 'Inversor Centro'),
			localStringFilter('clientEmailLocal', 'Email', 'email', 'Busca por email.', 'cliente@dominio.com'),
		],
	},
	{
		name: 'clientAdvancedContactFilters',
		displayName: 'Filtros Avanzados De Contacto',
		operationValues: [...clienteListOperationValues],
		placeholder: 'Añadir filtro de contacto',
		filters: [
			localStringFilter('clientPhoneLocal', 'Teléfono', 'telefonoMovil', 'Busca por teléfono móvil.', '600'),
			localStringFilter('clientPhone2Local', 'Teléfono 2', 'telefono2', 'Busca por teléfono secundario.', '900'),
			localStringFilter('clientPhone3Local', 'Teléfono 3', 'telefono3', 'Busca por teléfono adicional.', '910'),
			localStringFilter('clientAddressLocal', 'Dirección', 'direccion', 'Busca por dirección.', 'Calle Real'),
			localStringFilter('clientPostalCodeLocal', 'Código Postal', 'codigoPostal', 'Busca por código postal.', '28001'),
			localStringFilter(
				'clientLanguageLocal',
				'Idioma De Comunicación',
				'idiomaComunicacion',
				'Busca por idioma de comunicación.',
				'Español',
			),
			localStringFilter(
				'clientCivilStatusLocal',
				'Estado Civil',
				'estadoCivil',
				'Busca por estado civil.',
				'Casado',
				'equals',
			),
			localStringFilter('clientNotesLocal', 'Observaciones', 'observaciones', 'Busca por observaciones.', 'inversor'),
		],
	},
	{
		name: 'clientAdvancedClassificationFilters',
		displayName: 'Filtros Avanzados De Clasificación',
		operationValues: [...clienteListOperationValues],
		placeholder: 'Añadir filtro de clasificación',
		filters: [
			localBooleanFilter('clientOwnerLocal', 'Propietario', 'propietario', 'Filtra por clientes propietarios.'),
			localBooleanFilter('clientBuyerLocal', 'Demandante', 'demandante', 'Filtra por clientes demandantes.'),
			localBooleanFilter('clientCustomerLocal', 'Cliente', 'tipoCliente', 'Filtra por clientes marcados como cliente.'),
			localBooleanFilter('clientNewsletterLocal', 'Newsletter', 'tipoNewsletter', 'Filtra por clientes suscritos a newsletter.'),
			localBooleanFilter('clientEmailAlertsLocal', 'Recibe Alertas Email', 'recibirAlertasEmail', 'Filtra por recepción de alertas email.'),
			localBooleanFilter('clientManualEmailsLocal', 'Recibe Emails Manuales', 'recibirEmailManuales', 'Filtra por recepción de emails manuales.'),
		],
	},
	{
		name: 'clientAdvancedRelationFilters',
		displayName: 'Filtros Avanzados De Relaciones',
		operationValues: [...clienteListOperationValues],
		placeholder: 'Añadir filtro de relación',
		filters: [
			localExactNumberFilter('clientCampaignIdLocal', 'ID Campaña', 'idCampana', 'Filtra por ID de campaña.', '5'),
			localExactNumberFilter('clientCreatedByAgentLocal', 'ID Agente Creador', 'idAgenteCrea', 'Filtra por ID de agente creador.', '12'),
			localExactNumberFilter('clientUpdatedByAgentLocal', 'ID Agente Modificador', 'idAgenteModifica', 'Filtra por ID de agente modificador.', '12'),
			localStringFilter(
				'clientGroupNameLocal',
				'Nombre De Grupo',
				'grupos.nombreGrupo',
				'Busca por nombre de grupo del cliente.',
				'Compradores',
			),
			localStringFilter(
				'clientAccountNameLocal',
				'Nombre De Cuenta',
				'cuentas.nombre',
				'Busca por nombre de cuenta del cliente.',
				'Delegación Centro',
			),
		],
	},
];

export const mobiliaPromotionAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	{
		name: 'promotionAdvancedIdentityFilters',
		displayName: 'Filtros Avanzados De Identidad',
		operationValues: [...promocionListOperationValues],
		placeholder: 'Añadir filtro de promoción',
		filters: [
			localStringFilter('promotionReferenceLocal', 'Referencia', 'referencia', 'Busca por referencia de promoción.', 'PROMO-001'),
			localStringFilter('promotionNameLocal', 'Nombre', 'nombre', 'Busca por nombre de promoción.', 'Residencial'),
			localStringFilter('promotionBuilderLocal', 'Constructor', 'constructor', 'Busca por constructor.', 'Sacyr'),
			localStringFilter('promotionDeveloperLocal', 'Promotor', 'promotor', 'Busca por promotor.', 'Grupo Costa'),
		],
	},
	{
		name: 'promotionAdvancedAvailabilityFilters',
		displayName: 'Filtros Avanzados De Disponibilidad',
		operationValues: [...promocionListOperationValues],
		placeholder: 'Añadir filtro de disponibilidad',
		filters: [
			localBooleanFilter('promotionAvailableLocal', 'Disponible', 'disponible', 'Filtra por promociones disponibles.'),
			localBooleanFilter('promotionPublishWebLocal', 'Publicado En Web', 'publicarEnWeb', 'Filtra por promociones publicadas en web.'),
			localBooleanFilter('promotionFeaturedLocal', 'Destacada', 'destacada', 'Filtra por promociones destacadas.'),
			localBooleanFilter('promotionPoolLocal', 'Piscina', 'piscina', 'Filtra por promociones con piscina.'),
			localBooleanFilter('promotionGardenLocal', 'Jardín', 'jardin', 'Filtra por promociones con jardín.'),
			localBooleanFilter('promotionGarageLocal', 'Garaje', 'garaje', 'Filtra por promociones con garaje.'),
			localBooleanFilter('promotionStorageLocal', 'Trastero', 'trastero', 'Filtra por promociones con trastero.'),
		],
	},
	{
		name: 'promotionAdvancedClassificationFilters',
		displayName: 'Filtros Avanzados De Clasificación',
		operationValues: [...promocionListOperationValues],
		placeholder: 'Añadir filtro de clasificación',
		filters: [
			localStringFilter(
				'promotionTypeLocal',
				'Tipo De Promoción',
				'tipoPromocion.tipo',
				'Busca por tipo de promoción.',
				'Residencial',
			),
			localStringFilter(
				'promotionCommercializationTypeLocal',
				'Tipo De Comercialización',
				'tipoComercializacion.tipo',
				'Busca por tipo de comercialización.',
				'Obra nueva',
			),
			localStringFilter(
				'promotionVpoTypeLocal',
				'Tipo VPO',
				'tipoVpo.tipo',
				'Busca por tipo VPO.',
				'General',
			),
			localStringFilter(
				'promotionTitleLocal',
				'Título Web',
				'tituloWeb.txtTituloWeb',
				'Busca por título web de la promoción.',
				'Residencial Mar',
			),
		],
	},
	{
		name: 'promotionAdvancedLocationFilters',
		displayName: 'Filtros Avanzados De Ubicación',
		operationValues: [...promocionListOperationValues],
		placeholder: 'Añadir filtro de ubicación',
		filters: [
			localStringFilter('promotionTownLocal', 'Población', 'poblacion', 'Busca por población.', 'Marbella'),
			localStringFilter('promotionProvinceLocal', 'Provincia', 'provincia', 'Busca por provincia.', 'Málaga'),
			localStringFilter('promotionStreetLocal', 'Calle', 'calle', 'Busca por calle.', 'Avenida del Mar'),
			localStringFilter('promotionPostalCodeLocal', 'Código Postal', 'codigoPostal', 'Busca por código postal.', '29600'),
			localNumberFilter('promotionYearMinLocal', 'Año Construcción Desde', 'anoConstruccion', 'Filtra promociones construidas a partir de este año.', 'min', '2020'),
			localNumberFilter('promotionYearMaxLocal', 'Año Construcción Hasta', 'anoConstruccion', 'Filtra promociones construidas hasta este año.', 'max', '2026'),
		],
	},
	{
		name: 'promotionAdvancedMediaFilters',
		displayName: 'Filtros Avanzados De Contenido',
		operationValues: [...promocionListOperationValues],
		placeholder: 'Añadir filtro de contenido',
		filters: [
			localNumberFilter('promotionPhotosMinLocal', 'Fotos Mínimas', 'fotos.length', 'Filtra por número mínimo de fotos.', 'min', '1'),
			localNumberFilter('promotionVideosMinLocal', 'Vídeos Mínimos', 'videos.length', 'Filtra por número mínimo de vídeos.', 'min', '1'),
			localNumberFilter('promotionFilesMinLocal', 'Documentos Mínimos', 'archivos.length', 'Filtra por número mínimo de documentos.', 'min', '1'),
			localStringFilter(
				'promotionPropertyReferenceLocal',
				'Referencias De Inmueble',
				'inmuebles.referencia',
				'Busca por referencias de inmuebles incluidos en la promoción.',
				'REF-001',
			),
			localNumberFilter(
				'promotionPropertiesMinLocal',
				'Inmuebles Mínimos',
				'inmuebles.length',
				'Filtra por número mínimo de inmuebles asociados.',
				'min',
				'1',
			),
		],
	},
];

export const mobiliaRequestAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	{
		name: 'requestAdvancedIdentityFilters',
		displayName: 'Filtros Avanzados De Identidad',
		operationValues: [...solicitudListOperationValues],
		placeholder: 'Añadir filtro de solicitud',
		filters: [
			localNumberFilter('requestReferenceMinLocal', 'Referencia Mínima', 'referencia', 'Filtra por referencia mínima.', 'min', '1'),
			localNumberFilter('requestReferenceMaxLocal', 'Referencia Máxima', 'referencia', 'Filtra por referencia máxima.', 'max', '9999'),
			localStringFilter('requestNameLocal', 'Nombre', 'nombre', 'Busca por nombre del lead.', 'Lucía'),
			localStringFilter('requestEmailLocal', 'Email', 'email', 'Busca por email del lead.', 'lead@dominio.com'),
			localStringFilter('requestPhoneLocal', 'Teléfono', 'telefono', 'Busca por teléfono del lead.', '600'),
		],
	},
	{
		name: 'requestAdvancedBusinessFilters',
		displayName: 'Filtros Avanzados De Negocio',
		operationValues: [...solicitudListOperationValues],
		placeholder: 'Añadir filtro de negocio',
		filters: [
			localNumberFilter('requestAgentIdLocal', 'ID Agente', 'idAgente', 'Filtra por ID de agente.', 'equals', '12'),
			localNumberFilter('requestCampaignIdLocal', 'ID Campaña', 'idCampana', 'Filtra por ID de campaña.', 'equals', '5'),
			localNumberFilter('requestClientIdLocal', 'ID Cliente', 'idCliente', 'Filtra por ID de cliente.', 'equals', '1234'),
			localStringFilter('requestTownLocal', 'Población', 'poblacion', 'Busca por población.', 'Valencia'),
			localStringFilter('requestZoneLocal', 'Zona', 'zona', 'Busca por zona.', 'Centro'),
			localNumberFilter('requestPriceMaxMinLocal', 'Precio Máximo Mínimo', 'precioMaximo', 'Filtra solicitudes cuyo precio máximo sea igual o superior a este valor.', 'min', '200000'),
			localNumberFilter('requestPriceMaxMaxLocal', 'Precio Máximo Máximo', 'precioMaximo', 'Filtra solicitudes cuyo precio máximo sea igual o inferior a este valor.', 'max', '500000'),
		],
	},
	{
		name: 'requestAdvancedStatusFilters',
		displayName: 'Filtros Avanzados De Estado',
		operationValues: [...solicitudListOperationValues],
		placeholder: 'Añadir filtro de estado',
		filters: [
			localStringFilter('requestStatusLocal', 'Estado', 'estado', 'Busca por estado de la solicitud.', 'Atendido', 'equals'),
			localStringFilter(
				'requestOperationTypeLocal',
				'Tipo De Operación',
				'tipoOperacion',
				'Busca por tipo de operación.',
				'Venta',
				'equals',
			),
			localStringFilter(
				'requestSourceTypeLocal',
				'Tipo De Solicitud',
				'tipoSolicitud',
				'Busca por tipo de solicitud.',
				'Web',
				'equals',
			),
		],
	},
	{
		name: 'requestAdvancedContentFilters',
		displayName: 'Filtros Avanzados De Contenido',
		operationValues: [...solicitudListOperationValues],
		placeholder: 'Añadir filtro de contenido',
		filters: [
			localStringFilter('requestMessageLocal', 'Mensaje', 'mensaje', 'Busca por contenido del mensaje.', 'ático'),
			localStringFilter(
				'requestPropertyReferenceLocal',
				'Referencias De Inmueble',
				'inmuebles',
				'Busca por referencias de inmueble incluidas en la solicitud.',
				'REF-001',
			),
			localNumberFilter(
				'requestPropertyCountMinLocal',
				'Inmuebles Vinculados Mínimos',
				'inmuebles.length',
				'Filtra por número mínimo de inmuebles vinculados.',
				'min',
				'1',
			),
		],
	},
];

export const mobiliaTaskAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	{
		name: 'taskAdvancedIdentityFilters',
		displayName: 'Filtros Avanzados De Identidad',
		operationValues: [...tareaListOperationValues],
		placeholder: 'Añadir filtro de tarea',
		filters: [
			localNumberFilter('taskIdMinLocal', 'ID Tarea Mínimo', 'idTarea', 'Filtra por ID mínimo de tarea.', 'min', '1'),
			localNumberFilter('taskIdMaxLocal', 'ID Tarea Máximo', 'idTarea', 'Filtra por ID máximo de tarea.', 'max', '9999'),
			localStringFilter('taskSubjectLocal', 'Asunto', 'asunto', 'Busca por asunto.', 'Seguimiento'),
			localStringFilter('taskCommentsLocal', 'Comentarios', 'comentarios', 'Busca por comentarios.', 'llamar'),
		],
	},
	{
		name: 'taskAdvancedRelationFilters',
		displayName: 'Filtros Avanzados De Relaciones',
		operationValues: [...tareaListOperationValues],
		placeholder: 'Añadir filtro de relación',
		filters: [
			localNumberFilter('taskAgentIdLocal', 'ID Agente', 'idAgente', 'Filtra por ID de agente.', 'equals', '12'),
			localNumberFilter('taskStateIdLocal', 'ID Estado Tarea', 'idEstadoTarea', 'Filtra por ID de estado de tarea.', 'equals', '1'),
			localNumberFilter('taskTypeIdLocal', 'ID Tipo', 'idTipo', 'Filtra por ID de tipo.', 'equals', '3'),
			localNumberFilter('taskClientRefLocal', 'Referencia Cliente', 'referenciaCliente', 'Filtra por referencia de cliente.', 'equals', '1001'),
			localStringFilter('taskPropertyRefLocal', 'Referencia Inmueble', 'referenciaInmueble', 'Busca por referencia de inmueble.', 'REF-001', 'equals'),
			localNumberFilter('taskRequestRefLocal', 'Referencia Solicitud', 'referenciaSolicitud', 'Filtra por referencia de solicitud.', 'equals', '555'),
			localNumberFilter('taskDemandRefLocal', 'Referencia Demanda', 'referenciaDemanda', 'Filtra por referencia de demanda.', 'equals', '777'),
			localNumberFilter('taskOperationRefLocal', 'Referencia Operación', 'referenciaOperacion', 'Filtra por referencia de operación.', 'equals', '888'),
		],
	},
	{
		name: 'taskAdvancedStatusFilters',
		displayName: 'Filtros Avanzados De Estado',
		operationValues: [...tareaListOperationValues],
		placeholder: 'Añadir filtro de estado',
		filters: [
			localStringFilter('taskStateTextLocal', 'Estado Texto', 'estado', 'Busca por nombre del estado.', 'Pendiente', 'equals'),
			localBooleanFilter('taskSyncLocal', 'Sincronizar', 'sincronizar', 'Filtra por tareas sincronizadas con calendario.'),
		],
	},
];

export const mobiliaVisitAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	{
		name: 'visitAdvancedIdentityFilters',
		displayName: 'Filtros Avanzados De Identidad',
		operationValues: [...visitaListOperationValues],
		placeholder: 'Añadir filtro de visita',
		filters: [
			localNumberFilter('visitIdMinLocal', 'ID Visita Mínimo', 'idVisita', 'Filtra por ID mínimo de visita.', 'min', '1'),
			localNumberFilter('visitIdMaxLocal', 'ID Visita Máximo', 'idVisita', 'Filtra por ID máximo de visita.', 'max', '9999'),
			localStringFilter('visitPlaceLocal', 'Lugar', 'lugar', 'Busca por lugar de la visita.', 'Oficina'),
			localStringFilter('visitOperationLocal', 'Operación', 'operacion', 'Busca por operación.', 'Venta', 'equals'),
		],
	},
	{
		name: 'visitAdvancedRelationFilters',
		displayName: 'Filtros Avanzados De Relaciones',
		operationValues: [...visitaListOperationValues],
		placeholder: 'Añadir filtro de relación',
		filters: [
			localNumberFilter('visitAgentIdLocal', 'ID Agente', 'idAgente', 'Filtra por ID de agente.', 'equals', '12'),
			localNumberFilter('visitStateIdLocal', 'ID Estado Visita', 'idEstadoVisita', 'Filtra por ID de estado de visita.', 'equals', '2'),
			localNumberFilter('visitTypeIdLocal', 'ID Tipo', 'idTipo', 'Filtra por ID de tipo.', 'equals', '3'),
			localNumberFilter('visitClientRefLocal', 'Referencia Cliente', 'referenciaCliente', 'Filtra por referencia de cliente.', 'equals', '1001'),
			localNumberFilter('visitPropertyRefLocal', 'Referencia Inmueble', 'referenciaInmueble', 'Filtra por referencia de inmueble.', 'equals', '2001'),
			localNumberFilter('visitRequestRefLocal', 'Referencia Solicitud', 'referenciaSolicitud', 'Filtra por referencia de solicitud.', 'equals', '555'),
			localNumberFilter('visitDemandRefLocal', 'Referencia Demanda', 'referenciaDemanda', 'Filtra por referencia de demanda.', 'equals', '777'),
		],
	},
	{
		name: 'visitAdvancedStatusFilters',
		displayName: 'Filtros Avanzados De Estado',
		operationValues: [...visitaListOperationValues],
		placeholder: 'Añadir filtro de estado',
		filters: [
			localBooleanFilter('visitSyncLocal', 'Sincronizar', 'sincronizar', 'Filtra por visitas sincronizadas con calendario.'),
		],
	},
];

export const mobiliaAdvancedFilterGroups: MobiliaLocalFilterGroup[] = [
	...mobiliaPropertyAdvancedFilterGroups,
	...mobiliaAgentAdvancedFilterGroups,
	...mobiliaClientAdvancedFilterGroups,
	...mobiliaPromotionAdvancedFilterGroups,
	...mobiliaRequestAdvancedFilterGroups,
	...mobiliaTaskAdvancedFilterGroups,
	...mobiliaVisitAdvancedFilterGroups,
];

export const mobiliaAdvancedFilterDefinitions = mobiliaAdvancedFilterGroups.flatMap((group) => group.filters);
export const mobiliaAdvancedFilterOperationValues = Array.from(
	new Set(mobiliaAdvancedFilterGroups.flatMap((group) => group.operationValues)),
);

const paginationFieldNames = new Set(['NumeroPagina', 'Ordenacion', 'OrdenarPor', 'TamanoPagina']);
const presentationFieldNames = new Set(['DescripcionImagenes', 'MarcaAguaImagenes']);
const standaloneQueryFieldNames = new Set(['Busqueda']);

const operationOptionNameOverrides: Record<string, string> = {
	agendaGetPendingVisits: 'Ver visitas pendientes por agente y fecha',
	agentesGet: 'Ver agente por ID',
	agentesGetByEmail: 'Ver agente por email',
	agentesGetMany: 'Listar agentes',
	aplicacionesClienteCurrent: 'Ver aplicación cliente actual',
	campanasGetMany: 'Listar campañas',
	clientesCreate: 'Crear cliente',
	clientesDelete: 'Eliminar cliente',
	clientesGet: 'Ver cliente por referencia',
	clientesGetByEmail: 'Ver cliente por email',
	clientesGetMany: 'Listar clientes',
	clientesUpdate: 'Actualizar cliente',
	cuentasGetMany: 'Listar cuentas',
	estadosAdministrativosGetMany: 'Listar estados administrativos',
	gruposGetClientes: 'Listar grupos de clientes',
	gruposGetInmuebles: 'Listar grupos de inmuebles',
	inmueblesDownloadDocument: 'Descargar documento de inmueble',
	inmueblesGetAll: 'Listar todos los inmuebles',
	inmueblesGetDisabled: 'Listar inmuebles desactivados',
	inmueblesGetDocuments: 'Ver documentos de un inmueble',
	inmueblesGetKeyRing: 'Ver llavero de un inmueble',
	inmueblesGetMany: 'Listar inmuebles disponibles',
	inmueblesGetOwners: 'Ver propietarios de un inmueble',
	promocionesGetMany: 'Listar promociones',
	solicitudesCreate: 'Crear solicitud',
	solicitudesDelete: 'Eliminar solicitud',
	solicitudesGet: 'Ver solicitud por referencia',
	solicitudesGetMany: 'Listar solicitudes',
	solicitudesUpdate: 'Actualizar solicitud',
	statusGet: 'Ver estado de la API',
	tareasCreate: 'Crear tarea',
	tareasDelete: 'Eliminar tarea',
	tareasGet: 'Ver tarea por ID',
	tareasGetMany: 'Listar tareas',
	tareasGetStates: 'Listar estados de tarea',
	tareasGetTypes: 'Listar tipos de tarea',
	tareasUpdate: 'Actualizar tarea',
	visitasCreate: 'Crear visita',
	visitasDelete: 'Eliminar visita',
	visitasGet: 'Ver visita por ID',
	visitasGetInterestTypes: 'Listar tipos de interés mostrado',
	visitasGetMany: 'Listar visitas',
	visitasGetStates: 'Listar estados de visita',
	visitasGetTypes: 'Listar tipos de visita',
	visitasUpdate: 'Actualizar visita',
};

function getFieldUiMetadata(
	operation: MobiliaOperation,
	field: MobiliaFieldDefinition,
): MobiliaFieldUiMetadata {
	return {
		...baseFieldUiMetadata[field.name],
		...operationFieldUiMetadata[operation.value]?.[field.name],
	};
}

function getFieldPropertyType(
	field: MobiliaFieldDefinition,
	uiMetadata: MobiliaFieldUiMetadata,
): INodeProperties['type'] {
	if (uiMetadata.type) {
		return uiMetadata.type;
	}

	if (field.kind === 'enum' || field.kind === 'boolean') {
		return 'options';
	}

	if (field.kind === 'multiEnum') {
		return 'multiOptions';
	}

	return 'string';
}

function getFieldPropertyOptions(
	field: MobiliaFieldDefinition,
	uiMetadata: MobiliaFieldUiMetadata,
): INodeProperties['options'] | undefined {
	if (uiMetadata.loadOptionsMethod) {
		return [];
	}

	if (field.kind === 'boolean') {
		if (field.required) {
			return [
				{ name: 'Sí', value: 'true' },
				{ name: 'No', value: 'false' },
			];
		}

			return [
				{ name: 'No Definir', value: '__unset' },
				{ name: 'Sí', value: 'true' },
				{ name: 'No', value: 'false' },
			];
		}

	if (field.kind === 'enum') {
		const options = (field.options ?? []).map((value) => ({ name: value, value }));
		return field.required ? options : [{ name: 'No Definir', value: '' }, ...options];
	}

	if (field.kind === 'multiEnum') {
		return (field.options ?? []).map((value) => ({ name: value, value }));
	}

	return undefined;
}

function getFieldDefaultValue(
	field: MobiliaFieldDefinition,
	uiMetadata: MobiliaFieldUiMetadata,
): INodeProperties['default'] {
	const type = getFieldPropertyType(field, uiMetadata);

	if (type === 'multiOptions') {
		return [];
	}

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

function getFieldPlaceholder(
	field: MobiliaFieldDefinition,
	uiMetadata: MobiliaFieldUiMetadata,
): string | undefined {
	return uiMetadata.placeholder ?? field.placeholder;
}

function getFieldDescription(
	field: MobiliaFieldDefinition,
	uiMetadata: MobiliaFieldUiMetadata,
): string {
	return uiMetadata.description ?? field.description;
}

function getFieldDisplayName(
	field: MobiliaFieldDefinition,
	uiMetadata: MobiliaFieldUiMetadata,
): string {
	return uiMetadata.displayName ?? field.displayName;
}

function getFieldTypeOptions(uiMetadata: MobiliaFieldUiMetadata): INodeProperties['typeOptions'] {
	if (!uiMetadata.loadOptionsMethod) {
		return undefined;
	}

	return {
		loadOptionsMethod: uiMetadata.loadOptionsMethod,
	};
}

function shouldUseQueryCollections(operation: MobiliaOperation): boolean {
	return operation.method === 'GET' && operation.queryFields.length >= 4;
}

function getQueryCollectionKey(fieldName: string): QueryCollectionKey {
	if (presentationFieldNames.has(fieldName)) {
		return 'presentation';
	}

	if (paginationFieldNames.has(fieldName)) {
		return 'pagination';
	}

	return 'filters';
}

function getQueryCollectionDisplayName(key: QueryCollectionKey): string {
	if (key === 'presentation') {
		return 'Opciones de imágenes';
	}

	if (key === 'pagination') {
		return 'Orden y paginación';
	}

	return 'Filtros';
}

function getQueryCollectionPlaceholder(key: QueryCollectionKey): string {
	if (key === 'presentation') {
		return 'Añadir opción de imágenes';
	}

	if (key === 'pagination') {
		return 'Añadir opción de orden o paginación';
	}

	return 'Añadir filtro';
}

export function getQueryFieldGroups(operation: MobiliaOperation): MobiliaQueryFieldGroup[] {
	if (!shouldUseQueryCollections(operation)) {
		return [];
	}

	const groups = new Map<QueryCollectionKey, MobiliaFieldDefinition[]>();

	for (const field of operation.queryFields) {
		if (standaloneQueryFieldNames.has(field.name)) {
			continue;
		}

		const key = getQueryCollectionKey(field.name);
		const existing = groups.get(key) ?? [];
		existing.push(field);
		groups.set(key, existing);
	}

	return (['filters', 'presentation', 'pagination'] as QueryCollectionKey[])
		.map((key) => {
			const fields = groups.get(key) ?? [];

			if (fields.length === 0) {
				return undefined;
			}

			return {
				key,
				displayName: getQueryCollectionDisplayName(key),
				fields,
				placeholder: getQueryCollectionPlaceholder(key),
			};
		})
		.filter((group): group is MobiliaQueryFieldGroup => group !== undefined);
}

export function getQueryCollectionPropertyName(
	operationValue: string,
	groupKey: QueryCollectionKey,
): string {
	return `query_collection_${operationValue}_${groupKey}`;
}

export function getQueryCollectionFieldNames(operation: MobiliaOperation): Set<string> {
	return new Set(getQueryFieldGroups(operation).flatMap((group) => group.fields.map((field) => field.name)));
}

export function isInmuebleListOperation(operation: MobiliaOperation | undefined): boolean {
	return Boolean(operation && inmuebleListOperationValues.includes(operation.value as never));
}

export function isAdvancedFilterOperation(operation: MobiliaOperation | undefined): boolean {
	return Boolean(
		operation && mobiliaAdvancedFilterOperationValues.includes(operation.value),
	);
}

export function getAdvancedFilterGroupsForOperation(
	operation: MobiliaOperation | undefined,
): MobiliaLocalFilterGroup[] {
	if (!operation) {
		return [];
	}

	return mobiliaAdvancedFilterGroups.filter((group) => group.operationValues.includes(operation.value));
}

function getLocalFilterDefaultValue(filter: MobiliaLocalFilterDefinition): INodeProperties['default'] {
	if (filter.kind === 'boolean') {
		return '__unset';
	}

	if (filter.kind === 'enum') {
		return filter.options?.[0] ?? '';
	}

	return '';
}

function getLocalFilterPropertyOptions(
	filter: MobiliaLocalFilterDefinition,
): INodeProperties['options'] | undefined {
	if (filter.kind === 'boolean') {
		return [
			{ name: 'No Definir', value: '__unset' },
			{ name: 'Sí', value: 'true' },
			{ name: 'No', value: 'false' },
		];
	}

	if (filter.kind === 'enum') {
		return (filter.options ?? []).map((option) => ({ name: option, value: option }));
	}

	return undefined;
}

function buildLocalFilterOption(filter: MobiliaLocalFilterDefinition): INodeProperties {
	return {
		displayName: filter.displayName,
		name: filter.name,
		type: filter.kind === 'boolean' || filter.kind === 'enum' ? 'options' : 'string',
		default: getLocalFilterDefaultValue(filter),
		options: getLocalFilterPropertyOptions(filter),
		placeholder: filter.placeholder,
		description: filter.description,
	};
}

function buildAdvancedFilterProperties(): INodeProperties[] {
	const groupedProperties: INodeProperties[] = mobiliaAdvancedFilterGroups.map((group) => ({
		displayName: group.displayName,
		name: group.name,
		type: 'collection',
		default: {},
		placeholder: group.placeholder,
		description:
			'Se aplican en el nodo después de recuperar los registros. Si hace falta, el nodo recorre todas las páginas para devolver resultados coherentes.',
		displayOptions: {
			show: {
				operation: group.operationValues,
			},
		},
		options: group.filters.map((filter) => buildLocalFilterOption(filter)),
	}));

	return [
		...groupedProperties,
		{
			displayName: 'Reglas Expertas Por Ruta',
			name: 'propertyAdvancedJsonRules',
			type: 'json',
			default: '[]',
			description:
				'Solo para casos muy concretos. La mayoría de filtros ya están cubiertos por la interfaz del nodo. Ejemplo: [{"path":"caracteristicas.panelSolar","operator":"equals","value":true},{"path":"precioVenta","operator":"max","value":450000}].',
			displayOptions: {
				show: {
					operation: mobiliaAdvancedFilterOperationValues,
				},
			},
		},
	];
}

function buildCollectionOption(
	field: MobiliaFieldDefinition,
	operation: MobiliaOperation,
): INodeProperties {
	const uiMetadata = getFieldUiMetadata(operation, field);

	return {
		displayName: getFieldDisplayName(field, uiMetadata),
		name: field.name,
		type: getFieldPropertyType(field, uiMetadata),
		required: field.required ?? false,
		default: getFieldDefaultValue(field, uiMetadata),
		options: getFieldPropertyOptions(field, uiMetadata),
		placeholder: getFieldPlaceholder(field, uiMetadata),
		description: getFieldDescription(field, uiMetadata),
		typeOptions: getFieldTypeOptions(uiMetadata),
	};
}

function buildQueryCollectionProperty(
	operation: MobiliaOperation,
	group: MobiliaQueryFieldGroup,
): INodeProperties {
	return {
		displayName: group.displayName,
		name: getQueryCollectionPropertyName(operation.value, group.key),
		type: 'collection',
		default: {},
		placeholder: group.placeholder,
		displayOptions: {
			show: {
				resource: [operation.resource],
				operation: [operation.value],
			},
		},
		options: group.fields.map((field) => buildCollectionOption(field, operation)),
	};
}

function getOperationOptionName(operation: MobiliaOperation): string {
	return operationOptionNameOverrides[operation.value] ?? operation.summary;
}

function buildFieldProperty(
	field: MobiliaFieldDefinition,
	location: MobiliaFieldLocation,
	operation: MobiliaOperation,
): INodeProperties {
	const uiMetadata = getFieldUiMetadata(operation, field);

	return {
		displayName: getFieldDisplayName(field, uiMetadata),
		name: getFieldPropertyName(location, operation.value, field.name),
		type: getFieldPropertyType(field, uiMetadata),
		required: field.required ?? false,
		default: getFieldDefaultValue(field, uiMetadata),
		options: getFieldPropertyOptions(field, uiMetadata),
		placeholder: getFieldPlaceholder(field, uiMetadata),
		description: getFieldDescription(field, uiMetadata),
		typeOptions: getFieldTypeOptions(uiMetadata),
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

		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing
		properties.push({
			displayName: 'Operación',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: [resource.value],
				},
			},
			options: operations.map((operation) => ({
				name: getOperationOptionName(operation),
				value: operation.value,
				description: `${operation.method} ${operation.path} · ${operation.summary}`,
			})),
			default: operations[0]?.value ?? '',
		});

		for (const operation of operations) {
			const queryCollectionFieldNames = getQueryCollectionFieldNames(operation);

			for (const field of operation.pathFields) {
				properties.push(buildFieldProperty(field, 'path', operation));
			}

			for (const group of getQueryFieldGroups(operation)) {
				properties.push(buildQueryCollectionProperty(operation, group));
			}

			for (const field of operation.queryFields) {
				if (queryCollectionFieldNames.has(field.name)) {
					continue;
				}

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
		displayName: 'Recurso',
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
	...buildAdvancedFilterProperties(),
	{
		displayName: 'Método',
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
		displayName: 'Ruta',
		name: 'customPath',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '/api/v1/status',
		placeholder: '/api/v1/clientes/12345',
		description: 'Ruta relativa de la API. Puedes usar placeholders como /api/v1/clientes/{referencia}.',
	},
	{
		displayName: 'JSON De Parámetros De Ruta',
		name: 'pathParametersJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '{}',
		description: 'Objeto JSON con los parámetros de ruta. Ejemplo: {"referencia": 1234}.',
	},
	{
		displayName: 'JSON De Query Params',
		name: 'queryParametersJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '{}',
		description: 'Objeto JSON con los parámetros query. Los arrays se envían como filtros múltiples.',
	},
	{
		displayName: 'JSON Del Body',
		name: 'bodyJson',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['customRequest'],
			},
		},
		default: '{}',
		description: 'Objeto JSON para peticiones POST o PUT',
	},
	{
		displayName: 'Traer Todo',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Separar En Items',
		name: 'splitIntoItems',
		type: 'boolean',
		default: true,
		description: 'Whether to split array responses into separate items',
	},
	{
		displayName: 'Simplificar Respuesta',
		name: 'simplifyResponse',
		type: 'boolean',
		default: true,
		description: 'Whether to unwrap common response envelopes such as datos or elementos',
	},
];
