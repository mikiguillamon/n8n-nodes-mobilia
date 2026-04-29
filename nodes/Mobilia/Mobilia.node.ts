import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { getOperationByValue, mobiliaNodeProperties } from './operations';
import { mobiliaApiRequest, normalizeExecutionOutput } from './transport';

export class Mobilia implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mobilia',
		name: 'mobilia',
		icon: { light: 'file:../../icons/mobilia.svg', dark: 'file:../../icons/mobilia.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"]}}',
		description: 'Consume the Mobilia public API',
		defaults: {
			name: 'Mobilia',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'mobiliaApi',
				required: true,
			},
		],
		properties: mobiliaNodeProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const resource = this.getNodeParameter('resource', itemIndex) as string;
				const operationValue =
					resource === 'customRequest'
						? undefined
						: (this.getNodeParameter('operation', itemIndex) as string);
				const operation = operationValue ? getOperationByValue(operationValue) : undefined;
				const splitIntoItems = this.getNodeParameter('splitIntoItems', itemIndex) as boolean;
				const response = await mobiliaApiRequest(this, itemIndex, operation);
				const normalized = normalizeExecutionOutput(response, splitIntoItems);

				for (const entry of normalized) {
					returnData.push({
						json: entry as IDataObject,
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				throw error;
			}
		}

		return [returnData];
	}
}
