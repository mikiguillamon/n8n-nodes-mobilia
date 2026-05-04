import type { Icon, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class MobiliaApi implements ICredentialType {
	name = 'mobiliaApi';

	displayName = 'Mobilia API';

	documentationUrl = 'https://api.mobiliagestion.es/swagger/index.html';

	icon: Icon = { light: 'file:../icons/mobilia.svg', dark: 'file:../icons/mobilia.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.mobiliagestion.es',
			required: true,
			description: 'URL base de la API de Mobilia.',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'Client ID entregado por Mobilia.',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Client secret entregado por Mobilia.',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/token',
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: '={{"grant_type=client_credentials&client_id=" + encodeURIComponent($credentials.clientId) + "&client_secret=" + encodeURIComponent($credentials.clientSecret)}}',
		},
	};
}
