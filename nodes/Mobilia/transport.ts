import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import {
	getFieldPropertyName,
	getAdvancedFilterGroupsForOperation,
	isAdvancedFilterOperation,
	getQueryCollectionFieldNames,
	getQueryCollectionPropertyName,
	getQueryFieldGroups,
	mobiliaAdvancedFilterDefinitions,
	type MobiliaFieldDefinition,
	type MobiliaHttpMethod,
	type MobiliaLocalFilterDefinition,
	type MobiliaOperation,
} from './operations';

export interface MobiliaCredentials {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
	licenseKey: string;
	licenseValidationUrl?: string;
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

interface MobiliaCustomPropertyRule {
	operator: 'contains' | 'equals' | 'max' | 'min';
	path: string;
	value: boolean | number | string;
}

interface TokenCacheEntry {
	token: string;
	expiresAt: number;
}

interface LicenseCacheEntry {
	expiresAt: number;
	message?: string;
	valid: boolean;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const licenseCache = new Map<string, LicenseCacheEntry>();
const TOKEN_REFRESH_BUFFER_MS = 60_000;
const DEFAULT_TOKEN_EXPIRES_IN_SECONDS = 7200;
const DEFAULT_LICENSE_CACHE_TTL_MS = 15 * 60 * 1000;
const INVALID_LICENSE_CACHE_TTL_MS = 60 * 1000;
const LOCAL_LICENSE_MIN_LENGTH = 10;

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

function parseJsonArrayField(context: IExecuteFunctions, value: string, label: string): unknown[] {
	try {
		const parsed = JSON.parse(value);
		if (!Array.isArray(parsed)) {
			throw new Error(`${label} must be a JSON array`);
		}
		return parsed;
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

function getLocalFilterValue(
	context: IExecuteFunctions,
	filter: MobiliaLocalFilterDefinition,
	rawValue: unknown,
): boolean | number | string | undefined {
	if (filter.kind === 'boolean') {
		if (rawValue === '__unset' || rawValue === undefined || rawValue === '') {
			return undefined;
		}

		if (typeof rawValue === 'boolean') {
			return rawValue;
		}

		return rawValue === 'true';
	}

	if (filter.kind === 'enum') {
		if (typeof rawValue !== 'string' || rawValue.trim() === '') {
			return undefined;
		}

		return rawValue;
	}

	if (filter.kind === 'number') {
		if (typeof rawValue === 'number') {
			return Number.isFinite(rawValue) ? rawValue : undefined;
		}

		if (typeof rawValue !== 'string' || rawValue.trim() === '') {
			return undefined;
		}

		const parsed = Number(rawValue);

		if (!Number.isFinite(parsed)) {
			throw new NodeOperationError(
				context.getNode(),
				`Field "${filter.displayName}" must be a valid number`,
			);
		}

		return parsed;
	}

	if (typeof rawValue !== 'string' || rawValue.trim() === '') {
		return undefined;
	}

	return rawValue.trim();
}

type PropertyPriceContext = 'Alquiler' | 'Traspaso' | 'Venta';
type PropertyPriceContextSelection = PropertyPriceContext | 'Automatico';

const PROPERTY_PRICE_CONTEXT_FIELDS = {
	Alquiler: {
		active: 'alquiler',
		price: 'precioAlquiler',
		priceM2: 'precioM2Alquiler',
		priceOnRequest: 'precioAlquilerAConsultar',
	},
	Traspaso: {
		active: 'traspaso',
		price: 'precioTraspaso',
		priceM2: 'precioM2Traspaso',
		priceOnRequest: 'precioTraspasoAConsultar',
	},
	Venta: {
		active: 'venta',
		price: 'precioVenta',
		priceM2: 'precioM2Venta',
		priceOnRequest: 'precioVentaAConsultar',
	},
} as const;

function getPropertyPriceContexts(
	item: IDataObject,
	filters: Record<string, boolean | number | string>,
): PropertyPriceContext[] {
	const selectedContext = filters.priceContextLocal as PropertyPriceContextSelection | undefined;

	if (
		selectedContext === 'Venta' ||
		selectedContext === 'Alquiler' ||
		selectedContext === 'Traspaso'
	) {
		return [selectedContext];
	}

	const activeContexts = (Object.keys(PROPERTY_PRICE_CONTEXT_FIELDS) as PropertyPriceContext[]).filter(
		(context) => Boolean(getNestedValue(item, PROPERTY_PRICE_CONTEXT_FIELDS[context].active)),
	);

	if (activeContexts.length > 0) {
		return activeContexts;
	}

	return ['Venta', 'Alquiler', 'Traspaso'];
}

function getDynamicFilterValues(
	item: IDataObject,
	filterDefinition: MobiliaLocalFilterDefinition,
	filters: Record<string, boolean | number | string>,
): unknown[] {
	if (filterDefinition.path === '$propertyPrice') {
		return getPropertyPriceContexts(item, filters)
			.map((context) => getNestedValue(item, PROPERTY_PRICE_CONTEXT_FIELDS[context].price))
			.filter((value) => value !== undefined && value !== null);
	}

	if (filterDefinition.path === '$propertyPricePerSquareMeter') {
		return getPropertyPriceContexts(item, filters)
			.map((context) => getNestedValue(item, PROPERTY_PRICE_CONTEXT_FIELDS[context].priceM2))
			.filter((value) => value !== undefined && value !== null);
	}

	if (filterDefinition.path === '$propertyPriceOnRequest') {
		return getPropertyPriceContexts(item, filters)
			.map((context) => getNestedValue(item, PROPERTY_PRICE_CONTEXT_FIELDS[context].priceOnRequest))
			.filter((value) => value !== undefined && value !== null);
	}

	return [getNestedValue(item, filterDefinition.path)];
}

function collectAdvancedFilters(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: MobiliaOperation | undefined,
): Record<string, boolean | number | string> {
	if (!isAdvancedFilterOperation(operation)) {
		return {};
	}

	const filters: Record<string, boolean | number | string> = {};

	for (const group of getAdvancedFilterGroupsForOperation(operation)) {
		const values = context.getNodeParameter(group.name, itemIndex, {}) as IDataObject;

		for (const filter of group.filters) {
			const value = getLocalFilterValue(context, filter, values[filter.name]);

			if (value !== undefined) {
				filters[filter.name] = value;
			}
		}
	}

	return filters;
}

function hasAdvancedFilters(filters: Record<string, boolean | number | string>): boolean {
	return mobiliaAdvancedFilterDefinitions.some(
		(filterDefinition) =>
			filterDefinition.role !== 'config' && filters[filterDefinition.name] !== undefined,
	);
}

function collectAdvancedJsonRules(
	context: IExecuteFunctions,
	itemIndex: number,
	operation: MobiliaOperation | undefined,
): MobiliaCustomPropertyRule[] {
	if (!isAdvancedFilterOperation(operation)) {
		return [];
	}

	const rawValue = context.getNodeParameter('propertyAdvancedJsonRules', itemIndex, '[]') as string;
	const parsed = parseJsonArrayField(context, rawValue, 'Property Advanced JSON Rules');
	const rules: MobiliaCustomPropertyRule[] = [];

	for (const entry of parsed) {
		if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
			throw new NodeOperationError(
				context.getNode(),
				'Each advanced JSON rule must be an object with path, operator and value',
			);
		}

		const candidate = entry as IDataObject;
		const path = candidate.path;
		const operator = candidate.operator;
		const value = candidate.value;

		if (typeof path !== 'string' || path.trim() === '') {
			throw new NodeOperationError(context.getNode(), 'Each advanced JSON rule requires a non-empty path');
		}

		if (
			operator !== 'contains' &&
			operator !== 'equals' &&
			operator !== 'min' &&
			operator !== 'max'
		) {
			throw new NodeOperationError(
				context.getNode(),
				'Each advanced JSON rule requires an operator: contains, equals, min or max',
			);
		}

		if (
			typeof value !== 'string' &&
			typeof value !== 'number' &&
			typeof value !== 'boolean'
		) {
			throw new NodeOperationError(
				context.getNode(),
				'Each advanced JSON rule requires a scalar value: string, number or boolean',
			);
		}

		rules.push({
			path: path.trim(),
			operator,
			value,
		});
	}

	return rules;
}

function getNestedValue(data: IDataObject, path: string): unknown {
	return path.split('.').reduce<unknown>((current, segment) => {
		if (!current || typeof current !== 'object' || Array.isArray(current)) {
			return undefined;
		}

		return (current as IDataObject)[segment];
	}, data);
}

function matchesPropertyAdvancedFilters(
	item: IDataObject,
	filters: Record<string, boolean | number | string>,
): boolean {
	for (const filterDefinition of mobiliaAdvancedFilterDefinitions) {
		if (filterDefinition.role === 'config') {
			continue;
		}

		const expectedValue = filters[filterDefinition.name];

		if (expectedValue === undefined) {
			continue;
		}

		const actualValues = getDynamicFilterValues(item, filterDefinition, filters).filter(
			(value) => value !== undefined && value !== null,
		);

		if (actualValues.length === 0) {
			return false;
		}

		if (filterDefinition.kind === 'string') {
			const expectedText = String(expectedValue).toLocaleLowerCase('es');
			const matches = actualValues.some((actualValue) => {
				const actualText = String(actualValue).toLocaleLowerCase('es');

				if (filterDefinition.operator === 'equals') {
					return actualText === expectedText;
				}

				return actualText.includes(expectedText);
			});

			if (!matches) {
				return false;
			}

			continue;
		}

		if (filterDefinition.kind === 'boolean') {
			const matches = actualValues.some((actualValue) => Boolean(actualValue) === expectedValue);

			if (!matches) {
				return false;
			}

			continue;
		}

		const expectedNumber = Number(expectedValue);
		const matches = actualValues.some((actualValue) => {
			const actualNumber = Number(actualValue);

			if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) {
				return false;
			}

			if (filterDefinition.operator === 'min') {
				return actualNumber >= expectedNumber;
			}

			if (filterDefinition.operator === 'max') {
				return actualNumber <= expectedNumber;
			}

			if (filterDefinition.operator === 'equals') {
				return actualNumber === expectedNumber;
			}

			return false;
		});

		if (!matches) {
			return false;
		}
	}

	return true;
}

function matchesCustomPropertyRule(item: IDataObject, rule: MobiliaCustomPropertyRule): boolean {
	const actualValue = getNestedValue(item, rule.path);

	if (actualValue === undefined || actualValue === null) {
		return false;
	}

	if (typeof rule.value === 'string') {
		const actualText = String(actualValue).toLocaleLowerCase('es');
		const expectedText = rule.value.toLocaleLowerCase('es');

		if (rule.operator === 'equals') {
			return actualText === expectedText;
		}

		if (rule.operator === 'contains') {
			return actualText.includes(expectedText);
		}
	}

	if (typeof rule.value === 'boolean') {
		if (rule.operator !== 'equals') {
			return false;
		}

		return Boolean(actualValue) === rule.value;
	}

	const actualNumber = Number(actualValue);
	const expectedNumber = Number(rule.value);

	if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) {
		return false;
	}

	if (rule.operator === 'min') {
		return actualNumber >= expectedNumber;
	}

	if (rule.operator === 'max') {
		return actualNumber <= expectedNumber;
	}

	if (rule.operator === 'equals') {
		return actualNumber === expectedNumber;
	}

	return false;
}

function applyAdvancedFilters(
	data: unknown,
	filters: Record<string, boolean | number | string>,
	customRules: MobiliaCustomPropertyRule[],
): unknown {
	if (!hasAdvancedFilters(filters) && customRules.length === 0) {
		return data;
	}

	if (Array.isArray(data)) {
		return (data as IDataObject[]).filter(
			(item) =>
				matchesPropertyAdvancedFilters(item, filters) &&
				customRules.every((rule) => matchesCustomPropertyRule(item, rule)),
		);
	}

	if (
		data &&
		typeof data === 'object' &&
		!Array.isArray(data) &&
		Array.isArray((data as IDataObject).elementos)
	) {
		const filteredItems = ((data as IDataObject).elementos as IDataObject[]).filter((item) =>
			matchesPropertyAdvancedFilters(item, filters) &&
			customRules.every((rule) => matchesCustomPropertyRule(item, rule)),
		);

		return {
			...(data as IDataObject),
			elementos: filteredItems,
			totalElementos: filteredItems.length,
		};
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

function buildLicenseCacheKey(credentials: MobiliaCredentials): string {
	return `${credentials.licenseValidationUrl?.trim() ?? ''}::${credentials.licenseKey.trim()}`;
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

function parseLicenseResponse(context: MobiliaRequestContext, response: unknown): IDataObject {
	if (typeof response === 'string') {
		try {
			const parsed = JSON.parse(response);

			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return parsed as IDataObject;
			}
		} catch (error) {
			throw new NodeOperationError(
				context.getNode(),
				`License server response was not valid JSON: ${(error as Error).message}`,
			);
		}
	}

	if (response && typeof response === 'object' && !Array.isArray(response)) {
		return response as IDataObject;
	}

	throw new NodeOperationError(
		context.getNode(),
		`License server response had an unexpected type: ${typeof response}`,
	);
}

function getLicenseCacheTtlMs(
	response: IDataObject,
	defaultTtlMs: number,
): number {
	const rawTtl = response.cacheTtlSeconds ?? response.cacheTTLSeconds ?? response.ttlSeconds;
	const parsedTtl = Number(rawTtl);

	if (!Number.isFinite(parsedTtl) || parsedTtl <= 0) {
		return defaultTtlMs;
	}

	return parsedTtl * 1000;
}

function getLicenseCacheExpiry(
	response: IDataObject,
	defaultTtlMs: number,
): number {
	const rawExpiresAt = response.expiresAt ?? response.expires_at;

	if (typeof rawExpiresAt === 'string' && rawExpiresAt.trim() !== '') {
		const parsed = Date.parse(rawExpiresAt);

		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	if (typeof rawExpiresAt === 'number' && Number.isFinite(rawExpiresAt)) {
		return rawExpiresAt > 1_000_000_000_000 ? rawExpiresAt : rawExpiresAt * 1000;
	}

	return Date.now() + getLicenseCacheTtlMs(response, defaultTtlMs);
}

function getLicenseErrorMessage(message: string | undefined): string {
	return message?.trim() || 'La licencia del nodo no es valida o no esta activada';
}

function validateLicenseLocally(credentials: MobiliaCredentials): LicenseCacheEntry {
	const valid = credentials.licenseKey.trim().length >= LOCAL_LICENSE_MIN_LENGTH;

	return {
		valid,
		message: valid ? undefined : 'Introduce una licencia valida de al menos 10 caracteres',
		expiresAt: Date.now() + (valid ? DEFAULT_LICENSE_CACHE_TTL_MS : INVALID_LICENSE_CACHE_TTL_MS),
	};
}

async function validateLicenseRemotely(
	context: MobiliaRequestContext,
	credentials: MobiliaCredentials,
): Promise<LicenseCacheEntry> {
	const validationUrl = credentials.licenseValidationUrl?.trim();

	if (!validationUrl) {
		return validateLicenseLocally(credentials);
	}

	const response = (await context.helpers.httpRequest({
		method: 'POST',
		url: validationUrl,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: {
			licenseKey: credentials.licenseKey.trim(),
			product: 'n8n-nodes-mobilia',
			nodeType: context.getNode().type,
			nodeVersion: context.getNode().typeVersion,
			baseUrl: normalizeBaseUrl(credentials.baseUrl),
			clientId: credentials.clientId,
		},
		json: true,
	})) as unknown;

	const parsedResponse = parseLicenseResponse(context, response);
	const rawValidity =
		parsedResponse.valid ?? parsedResponse.active ?? parsedResponse.licensed ?? parsedResponse.allowed;

	if (typeof rawValidity !== 'boolean') {
		throw new NodeOperationError(
			context.getNode(),
			'License server response must include a boolean field named valid, active, licensed or allowed',
		);
	}

	const message =
		typeof parsedResponse.message === 'string'
			? parsedResponse.message
			: typeof parsedResponse.error === 'string'
				? parsedResponse.error
				: undefined;
	const defaultTtlMs = rawValidity ? DEFAULT_LICENSE_CACHE_TTL_MS : INVALID_LICENSE_CACHE_TTL_MS;

	return {
		valid: rawValidity,
		message,
		expiresAt: getLicenseCacheExpiry(parsedResponse, defaultTtlMs),
	};
}

async function ensureValidLicense(
	context: MobiliaRequestContext,
	credentials: MobiliaCredentials,
): Promise<void> {
	const cacheKey = buildLicenseCacheKey(credentials);
	const cached = licenseCache.get(cacheKey);
	const now = Date.now();

	if (cached && cached.expiresAt > now) {
		if (!cached.valid) {
			throw new NodeOperationError(context.getNode(), getLicenseErrorMessage(cached.message));
		}

		return;
	}

	const validationResult = await validateLicenseRemotely(context, credentials);
	licenseCache.set(cacheKey, validationResult);

	if (!validationResult.valid) {
		throw new NodeOperationError(
			context.getNode(),
			getLicenseErrorMessage(validationResult.message),
		);
	}
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
	await ensureValidLicense(context, credentials);
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
	propertyAdvancedJsonRules: MobiliaCustomPropertyRule[];
	propertyAdvancedFilters: Record<string, boolean | number | string>;
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
				propertyAdvancedJsonRules: [],
				propertyAdvancedFilters: {},
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
		propertyAdvancedJsonRules: collectAdvancedJsonRules(context, itemIndex, operation),
		propertyAdvancedFilters: collectAdvancedFilters(context, itemIndex, operation),
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
	const shouldForceFullPagination =
		isAdvancedFilterOperation(operation) &&
		(hasAdvancedFilters(requestData.propertyAdvancedFilters) ||
			requestData.propertyAdvancedJsonRules.length > 0);

	try {
		if (shouldPaginate(operation, requestData.returnAll) || shouldForceFullPagination) {
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

			const paginatedData = requestData.simplifyResponse
				? mergedElements
				: {
						elementos: mergedElements,
						totalElementos: mergedElements.length,
				  };

			return applyAdvancedFilters(
				paginatedData,
				requestData.propertyAdvancedFilters,
				requestData.propertyAdvancedJsonRules,
			);
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
		return applyAdvancedFilters(
			simplifyResponseData(response, requestData.simplifyResponse),
			requestData.propertyAdvancedFilters,
			requestData.propertyAdvancedJsonRules,
		);
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
