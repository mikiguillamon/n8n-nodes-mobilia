import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import {
	getFieldPropertyName,
	getQueryCollectionFieldNames,
	getQueryCollectionPropertyName,
	getQueryFieldGroups,
	type MobiliaFieldDefinition,
	type MobiliaHttpMethod,
	type MobiliaOperation,
} from './operations';

export interface MobiliaCredentials {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
}

type MobiliaRequestContext = IExecuteFunctions | ILoadOptionsFunctions;

interface MobiliaAuthenticatedRequestOptions {
	body?: IDataObject;
	headers?: IDataObject;
	json?: boolean;
	method: MobiliaHttpMethod;
	path: string;
	qs?: IDataObject;
}

interface TokenCacheEntry {
	token: string;
	expiresAt: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const TOKEN_REFRESH_BUFFER_MS = 60_000;
const DEFAULT_TOKEN_EXPIRES_IN_SECONDS = 7200;

function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.replace(/\/+$/, '');
}

function parseJsonField(context: IExecuteFunctions, value: string, label: string): IDataObject {
	try {
		const parsed = JSON.parse(value);
		if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
			throw new Error(`${label} must be a JSON object`);
		}
		return parsed as IDataObject;
	} catch (error) {
		throw new NodeOperationError(
			context.getNode(),
			`${label} is not valid JSON: ${(error as Error).message}`,
		);
	}
}

function parseCsvString(value: string): string[] {
	const trimmed = value.trim();

	if (trimmed === '') {
		return [];
	}

	if (trimmed.startsWith('[')) {
		let parsed: unknown;

		try {
			parsed = JSON.parse(trimmed);
		} catch (error) {
			throw new Error(`Expected a JSON array or comma-separated list: ${(error as Error).message}`);
		}

		if (!Array.isArray(parsed)) {
			throw new Error('Expected a JSON array');
		}

		return parsed.map((entry) => String(entry));
	}

	return trimmed
		.split(',')
		.map((entry) => entry.trim())
		.filter((entry) => entry !== '');
}

function parseCsvInteger(value: string): number[] {
	return parseCsvString(value).map((entry) => {
		const parsed = Number(entry);

		if (!Number.isFinite(parsed)) {
			throw new Error(`"${entry}" is not a valid integer`);
		}

		return parsed;
	});
}

function coerceTypedFieldValue(
	context: IExecuteFunctions,
	field: MobiliaFieldDefinition,
	value: boolean | string | string[] | number | undefined,
): unknown {
	switch (field.kind) {
		case 'boolean':
			if (typeof value === 'boolean') {
				return value;
			}

			if (value === '__unset') {
				return undefined;
			}

			return value === 'true';

		case 'csvInteger':
			if (Array.isArray(value)) {
				return value.map((entry) => {
					const parsed = Number(entry);

					if (!Number.isFinite(parsed)) {
						throw new NodeOperationError(
							context.getNode(),
							`Field "${field.displayName}" must contain valid numbers`,
						);
					}

					return parsed;
				});
			}

			if (typeof value !== 'string' || value.trim() === '') {
				return undefined;
			}

			try {
				return parseCsvInteger(value);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					`Field "${field.displayName}" must be a comma-separated list of integers: ${
						(error as Error).message
					}`,
				);
				}

		case 'csvString':
			if (Array.isArray(value)) {
				return value.filter((entry) => entry !== '');
			}

			if (typeof value !== 'string' || value.trim() === '') {
				return undefined;
			}

			try {
				return parseCsvString(value);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					`Field "${field.displayName}" must be a comma-separated list or JSON array: ${
						(error as Error).message
					}`,
				);
			}

		case 'dateTime':
		case 'string':
			if (typeof value !== 'string' || value.trim() === '') {
				return undefined;
			}

			return value;

		case 'enum':
			if (typeof value !== 'string' || value === '') {
				return undefined;
			}

			return value;

		case 'integer':
		case 'number': {
			if (typeof value === 'number') {
				return Number.isFinite(value) ? value : undefined;
			}

			if (typeof value !== 'string' || value.trim() === '') {
				return undefined;
			}

			const parsed = Number(value);
			if (!Number.isFinite(parsed)) {
				throw new NodeOperationError(
					context.getNode(),
					`Field "${field.displayName}" must be a valid number`,
				);
			}

			return parsed;
		}

		case 'multiEnum':
			if (!Array.isArray(value) || value.length === 0) {
				return undefined;
			}

			return value;

		default:
			return undefined;
	}
}

function getTypedFieldValue(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: MobiliaOperation,
	location: 'body' | 'path' | 'query',
	field: MobiliaFieldDefinition,
): unknown {
	const propertyName = getFieldPropertyName(location, operation.value, field.name);
	const value = context.getNodeParameter(propertyName, itemIndex) as
		| boolean
		| number
		| string
		| string[]
		| undefined;

	return coerceTypedFieldValue(context, field, value);
}

function collectTypedFieldValues(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: MobiliaOperation,
	location: 'body' | 'path' | 'query',
	fields: MobiliaFieldDefinition[],
): IDataObject {
	const data: IDataObject = {};

	for (const field of fields) {
		const value = getTypedFieldValue(context, itemIndex, operation, location, field);

		if (value !== undefined) {
			data[field.name] = value as never;
		}
	}

	return data;
}

function collectQueryCollectionValues(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: MobiliaOperation,
): IDataObject {
	const data: IDataObject = {};

	for (const group of getQueryFieldGroups(operation)) {
		const collectionValues = context.getNodeParameter(
			getQueryCollectionPropertyName(operation.value, group.key),
			itemIndex,
			{},
		) as IDataObject;

		for (const field of group.fields) {
			const rawValue = collectionValues[field.name] as
				| boolean
				| number
				| string
				| string[]
				| undefined;
			const value = coerceTypedFieldValue(context, field, rawValue);

			if (value !== undefined) {
				data[field.name] = value as never;
			}
		}
	}

	return data;
}

function replacePathParameters(path: string, pathParameters: IDataObject): string {
	return path.replace(/\{([^}]+)\}/g, (_, key: string) => {
		const value = pathParameters[key];

		if (value === undefined || value === null || value === '') {
			throw new Error(`Missing required path parameter "${key}"`);
		}

		return encodeURIComponent(String(value));
	});
}

function normalizeRelativePath(context: IExecuteFunctions, path: string): string {
	const trimmedPath = path.trim();

	if (trimmedPath === '') {
		throw new NodeOperationError(context.getNode(), 'Path cannot be empty');
	}

	if (/^https?:\/\//i.test(trimmedPath)) {
		throw new NodeOperationError(
			context.getNode(),
			'Custom Request path must be relative, for example /api/v1/status',
		);
	}

	return trimmedPath.startsWith('/') ? trimmedPath : `/${trimmedPath}`;
}

function buildCacheKey(credentials: MobiliaCredentials): string {
	return `${normalizeBaseUrl(credentials.baseUrl)}::${credentials.clientId}`;
}

function parseTokenResponse(context: MobiliaRequestContext, response: unknown): IDataObject {
	if (typeof response === 'string') {
		try {
			const parsed = JSON.parse(response);

			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return parsed as IDataObject;
			}
		} catch (error) {
			throw new NodeOperationError(
				context.getNode(),
				`Mobilia token response was not valid JSON: ${(error as Error).message}`,
			);
		}
	}

	if (response && typeof response === 'object' && !Array.isArray(response)) {
		return response as IDataObject;
	}

	throw new NodeOperationError(
		context.getNode(),
		`Mobilia token response had an unexpected type: ${typeof response}`,
	);
}

async function getAccessToken(
	context: MobiliaRequestContext,
	credentials: MobiliaCredentials,
	forceRefresh = false,
): Promise<string> {
	const cacheKey = buildCacheKey(credentials);
	const cached = tokenCache.get(cacheKey);
	const now = Date.now();

	if (!forceRefresh && cached && cached.expiresAt - TOKEN_REFRESH_BUFFER_MS > now) {
		return cached.token;
	}

	const body = new URLSearchParams({
		grant_type: 'client_credentials',
		client_id: credentials.clientId,
		client_secret: credentials.clientSecret,
	});

	const response = (await context.helpers.httpRequest({
		method: 'POST',
		url: `${normalizeBaseUrl(credentials.baseUrl)}/api/v1/token`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: body.toString(),
	})) as unknown;

	const tokenResponse = parseTokenResponse(context, response);
	const token = tokenResponse.token ?? tokenResponse.access_token ?? tokenResponse.accessToken;
	const expiresIn = Number(
		tokenResponse.expiresIn ?? tokenResponse.expires_in ?? DEFAULT_TOKEN_EXPIRES_IN_SECONDS,
	);

	if (typeof token !== 'string' || token.length === 0) {
		const responseKeys = Object.keys(tokenResponse);
		throw new NodeOperationError(
			context.getNode(),
			`Could not obtain a valid bearer token from Mobilia. Token response keys: ${
				responseKeys.length > 0 ? responseKeys.join(', ') : 'none'
			}`,
		);
	}

	tokenCache.set(cacheKey, {
		token,
		expiresAt: now + expiresIn * 1000,
	});

	return token;
}

function shouldPaginate(operation: MobiliaOperation | undefined, returnAll: boolean): boolean {
	return Boolean(returnAll && operation?.supportsPagination);
}

function simplifyResponseData(response: unknown, simplifyResponse: boolean): unknown {
	if (!simplifyResponse || response === null || typeof response !== 'object' || Array.isArray(response)) {
		return response;
	}

	const responseObject = response as IDataObject;

	if ('datos' in responseObject) {
		return responseObject.datos;
	}

	if ('elementos' in responseObject) {
		return responseObject.elementos;
	}

	return response;
}

function toItemArray(data: unknown): IDataObject[] {
	if (Array.isArray(data)) {
		return data as IDataObject[];
	}

	if (data && typeof data === 'object') {
		return [data as IDataObject];
	}

	return [{ value: data } as IDataObject];
}

function isUnauthorizedError(error: unknown): boolean {
	if (!error || typeof error !== 'object') {
		return false;
	}

	const candidate = error as {
		statusCode?: number;
		response?: {
			statusCode?: number;
			status?: number;
		};
	};

	return (
		candidate.statusCode === 401 ||
		candidate.response?.statusCode === 401 ||
		candidate.response?.status === 401
	);
}

export async function mobiliaAuthenticatedRequest(
	context: MobiliaRequestContext,
	requestOptions: MobiliaAuthenticatedRequestOptions,
): Promise<unknown> {
	const credentials = (await context.getCredentials('mobiliaApi')) as unknown as MobiliaCredentials;
	const url = `${normalizeBaseUrl(credentials.baseUrl)}${requestOptions.path}`;

	const executeRequest = async (forceTokenRefresh = false): Promise<unknown> => {
		const token = await getAccessToken(context, credentials, forceTokenRefresh);
		const options: {
			arrayFormat: 'repeat';
			body?: IDataObject;
			headers: IDataObject;
			json?: boolean;
			method: MobiliaHttpMethod;
			qs: IDataObject;
			url: string;
		} = {
			method: requestOptions.method,
			url,
			qs: requestOptions.qs ?? {},
			arrayFormat: 'repeat',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/json',
				...(requestOptions.headers ?? {}),
			},
		};

		if (requestOptions.body !== undefined) {
			options.body = requestOptions.body;
			options.json = requestOptions.json ?? true;

			if (options.headers['Content-Type'] === undefined) {
				options.headers['Content-Type'] = 'application/json';
			}
		}

		return await context.helpers.httpRequest(options);
	};

	try {
		return await executeRequest(false);
	} catch (error) {
		if (!isUnauthorizedError(error)) {
			throw error;
		}

		return await executeRequest(true);
	}
}

export function getRequestData(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: MobiliaOperation | undefined,
): {
	method: MobiliaHttpMethod;
	path: string;
	pathParameters: IDataObject;
	queryParameters: IDataObject;
	body: IDataObject;
	returnAll: boolean;
	simplifyResponse: boolean;
	splitIntoItems: boolean;
} {
	const resource = context.getNodeParameter('resource', itemIndex) as string;
	const returnAll = context.getNodeParameter('returnAll', itemIndex) as boolean;
	const splitIntoItems = context.getNodeParameter('splitIntoItems', itemIndex) as boolean;
	const simplifyResponse = context.getNodeParameter('simplifyResponse', itemIndex) as boolean;

	if (resource === 'customRequest') {
		const pathParameters = parseJsonField(
			context,
			context.getNodeParameter('pathParametersJson', itemIndex) as string,
			'Path Parameters',
		);
		const queryParameters = parseJsonField(
			context,
			context.getNodeParameter('queryParametersJson', itemIndex) as string,
			'Query Parameters',
		);
		const body = parseJsonField(
			context,
			context.getNodeParameter('bodyJson', itemIndex) as string,
			'Body',
		);

		return {
			method: context.getNodeParameter('customMethod', itemIndex) as MobiliaHttpMethod,
			path: normalizeRelativePath(
				context,
				context.getNodeParameter('customPath', itemIndex) as string,
			),
			pathParameters,
			queryParameters,
			body,
			returnAll,
			simplifyResponse,
			splitIntoItems,
		};
	}

	if (!operation) {
		throw new NodeOperationError(context.getNode(), 'Unknown Mobilia operation selected');
	}

	return {
		method: operation.method,
		path: operation.path,
		pathParameters: collectTypedFieldValues(context, itemIndex, operation, 'path', operation.pathFields),
		queryParameters: {
			...collectTypedFieldValues(
				context,
				itemIndex,
				operation,
				'query',
				operation.queryFields.filter((field) => !getQueryCollectionFieldNames(operation).has(field.name)),
			),
			...collectQueryCollectionValues(context, itemIndex, operation),
		},
		body: collectTypedFieldValues(context, itemIndex, operation, 'body', operation.bodyFields),
		returnAll,
		simplifyResponse,
		splitIntoItems,
	};
}

export async function mobiliaApiRequest(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: MobiliaOperation | undefined,
): Promise<unknown> {
	const requestData = getRequestData(context, itemIndex, operation);
	const path = replacePathParameters(requestData.path, requestData.pathParameters);

	try {
		if (shouldPaginate(operation, requestData.returnAll)) {
			const mergedElements: IDataObject[] = [];
			let page = Number(requestData.queryParameters.NumeroPagina ?? 1);
			const pageSize = Number(requestData.queryParameters.TamanoPagina ?? 100);
			let totalElements = Number.POSITIVE_INFINITY;

			while (mergedElements.length < totalElements) {
				const response = (await mobiliaAuthenticatedRequest(context, {
					method: requestData.method,
					path,
					qs: {
						...requestData.queryParameters,
						NumeroPagina: page,
						TamanoPagina: pageSize,
					},
				})) as IDataObject;

				const elements = Array.isArray(response.elementos)
					? (response.elementos as IDataObject[])
					: [];

				totalElements = Number(response.totalElementos ?? elements.length);
				mergedElements.push(...elements);

				if (elements.length === 0 || mergedElements.length >= totalElements) {
					break;
				}

				page += 1;
			}

			return requestData.simplifyResponse
				? mergedElements
				: {
						elementos: mergedElements,
						totalElementos: mergedElements.length,
				  };
		}

		const response = await mobiliaAuthenticatedRequest(context, {
			method: requestData.method,
			path,
			qs: requestData.queryParameters,
			body:
				requestData.method === 'POST' || requestData.method === 'PUT'
					? requestData.body
					: undefined,
		});
		return simplifyResponseData(response, requestData.simplifyResponse);
	} catch (error) {
		throw new NodeApiError(context.getNode(), error as JsonObject);
	}
}

export function normalizeExecutionOutput(
	data: unknown,
	splitIntoItems: boolean,
): IDataObject[] {
	if (
		splitIntoItems &&
		data &&
		typeof data === 'object' &&
		!Array.isArray(data) &&
		'elementos' in (data as IDataObject) &&
		Array.isArray((data as IDataObject).elementos)
	) {
		return toItemArray((data as IDataObject).elementos);
	}

	if (splitIntoItems) {
		return toItemArray(data);
	}

	if (Array.isArray(data)) {
		return [{ data } as IDataObject];
	}

	if (data && typeof data === 'object') {
		return [data as IDataObject];
	}

	return [{ value: data } as IDataObject];
}
