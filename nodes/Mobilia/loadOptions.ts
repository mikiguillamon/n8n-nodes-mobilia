import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import type { MobiliaHttpMethod } from './operations';
import { mobiliaAuthenticatedRequest } from './transport';

function getCollectionItems(response: unknown): IDataObject[] {
	if (Array.isArray(response)) {
		return response as IDataObject[];
	}

	if (response && typeof response === 'object') {
		const objectResponse = response as IDataObject;

		if (Array.isArray(objectResponse.elementos)) {
			return objectResponse.elementos as IDataObject[];
		}

		if (Array.isArray(objectResponse.datos)) {
			return objectResponse.datos as IDataObject[];
		}
	}

	return [];
}

function toLabel(name: string, id: number | string): string {
	return `${name} (#${id})`;
}

function sortOptions(options: INodePropertyOptions[]): INodePropertyOptions[] {
	return [...options].sort((left, right) => left.name.localeCompare(right.name, 'es'));
}

function mapOptions(
	items: IDataObject[],
	getId: (item: IDataObject) => number | undefined,
	getName: (item: IDataObject) => string,
): INodePropertyOptions[] {
	const options: INodePropertyOptions[] = [];

	for (const item of items) {
		const id = getId(item);
		const name = getName(item);

		if (id === undefined || name === '') {
			continue;
		}

		options.push({
			name: toLabel(name, id),
			value: String(id),
		});
	}

	return options;
}

function toNumber(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === 'string' && value.trim() !== '') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : undefined;
	}

	return undefined;
}

function toText(value: unknown): string {
	if (typeof value === 'string') {
		return value;
	}

	if (typeof value === 'number') {
		return String(value);
	}

	return '';
}

async function requestCollection(
	context: ILoadOptionsFunctions,
	path: string,
	qs?: IDataObject,
	method: MobiliaHttpMethod = 'GET',
): Promise<IDataObject[]> {
	try {
		const response = await mobiliaAuthenticatedRequest(context, {
			method,
			path,
			qs,
		});

		return getCollectionItems(response);
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`No se pudieron cargar las opciones desde Mobilia: ${(error as Error).message}`,
		);
	}
}

async function getAgents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const options: INodePropertyOptions[] = [];
	let page = 1;
	let totalElements = Number.POSITIVE_INFINITY;

	while (options.length < totalElements) {
		const response = (await mobiliaAuthenticatedRequest(this, {
			method: 'GET',
			path: '/api/v1/agentes',
			qs: {
				NumeroPagina: page,
				TamanoPagina: 100,
			},
		})) as IDataObject;
		const items = getCollectionItems(response);
		totalElements = toNumber(response.totalElementos) ?? items.length;

		for (const item of items) {
			const id = toNumber(item.idAgente);
			if (id === undefined) {
				continue;
			}

			const name = toText(item.nombreUsuario) || `Agente ${id}`;
			const email = toText(item.email);

			options.push({
				name: toLabel(name, id),
				value: String(id),
				description: email || undefined,
			});
		}

		if (items.length === 0 || items.length < 100) {
			break;
		}

		page += 1;
	}

	return sortOptions(options);
}

async function getAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/cuentas');

	return sortOptions(mapOptions(items, (item) => toNumber(item.idCuenta), (item) => toText(item.nombre)));
}

async function getCampaigns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/campanas');

	return sortOptions(mapOptions(items, (item) => toNumber(item.idCampana), (item) => toText(item.nombre)));
}

async function getClientGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/grupos/clientes');

	return sortOptions(
		mapOptions(items, (item) => toNumber(item.idGrupo), (item) => toText(item.nombreGrupo)),
	);
}

async function getPropertyGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/grupos/inmuebles');

	return sortOptions(
		mapOptions(items, (item) => toNumber(item.idGrupo), (item) => toText(item.nombreGrupo)),
	);
}

async function getAdministrativeStates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/estadosadministrativos');

	return sortOptions(
		mapOptions(
			items,
			(item) => toNumber(item.idEstadoAdministrativo),
			(item) => toText(item.nombre),
		),
	);
}

async function getTaskTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/tareas/tipos');

	return sortOptions(
		mapOptions(items, (item) => toNumber(item.idTipo), (item) => toText(item.nombreTipo)),
	);
}

async function getTaskStates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/tareas/estados');

	return sortOptions(
		mapOptions(items, (item) => toNumber(item.idEstadoEvento), (item) => toText(item.estado)),
	);
}

async function getVisitTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/visitas/tipos');

	return sortOptions(
		mapOptions(items, (item) => toNumber(item.idTipo), (item) => toText(item.nombreTipo)),
	);
}

async function getVisitStates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const items = await requestCollection(this, '/api/v1/visitas/estados');

	return sortOptions(
		mapOptions(items, (item) => toNumber(item.idEstadoEvento), (item) => toText(item.estado)),
	);
}

export const mobiliaLoadOptions = {
	getAccounts,
	getAdministrativeStates,
	getAgents,
	getCampaigns,
	getClientGroups,
	getPropertyGroups,
	getTaskStates,
	getTaskTypes,
	getVisitStates,
	getVisitTypes,
};
