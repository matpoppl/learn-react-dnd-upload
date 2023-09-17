import React, { useReducer, useEffect  } from 'react';
import { useAppContext, AppContextInteface, FormEnctype } from './AppContext';

interface State {
   ok: boolean,
   loaded: number,
   progress: number,
   percent: string,
   errors?: string[],
};

enum ResponseStatus {
  ERROR = 'ERROR',
  SUCCESS = 'STATUS'
}

interface Response {
	status: ResponseStatus
	messages?: string[],
};

type StateAction =
  | { type: "progress"; value: { total : number, loaded: number } }
  | { type: "error"; value: string[] }
  | { type: "done"; value: Response }

type ProgressFn = (total: number, loaded: number) => void;

const initialState: State = {
	ok: false,
	loaded: 0,
	progress: 0,
	percent: '0',
	errors: undefined,
};

function stateReducer(state: State, action: StateAction): State {
	
	const { type, value } = action;
	
	switch (type) {
		case "progress":
			const { total, loaded } = value;
			const progress = (loaded / total);
			return { ...state, percent: (progress * 100).toFixed(0), progress: progress, loaded: loaded };
		case "error":
			return { ...state, errors: value };
		case "done":

			switch (value.status) {
				case ResponseStatus.ERROR:
					return { ...state, errors: value.messages };
				case ResponseStatus.SUCCESS:
					return { ...state, ok: true };
				default:
					throw new Error(`Unknown response status '${value.status}'`);
			}

		default:
			throw new Error("Unknown action");
	}
}

function upload(appCtx : AppContextInteface, file : File, progress : ProgressFn)
{
	return new Promise<XMLHttpRequest>(( resolve, reject ) => {
		
		const xhr = new XMLHttpRequest();
		
		xhr.responseType = 'json';
		
		const { formaction, formmethod, formenctype } = appCtx.config;
		
		if (! formaction || ! formmethod || ! formenctype) {
			throw new Error('FormConfig required')
		}
		
		xhr.addEventListener('error', () => { reject(xhr) });
		xhr.addEventListener('abort', () => { reject(xhr) });
		xhr.addEventListener('load', () => { resolve(xhr) });
		
		xhr.upload.addEventListener('progress', ({ total, loaded }) => {
			progress(total, loaded);
		});
		
		xhr.open(formmethod, formaction);
		
		let data = null;
		
		switch (formenctype) {
			case FormEnctype.FORM_DATA:
				data = new FormData();
				data.set('file', file);
				break;
			default:
				throw new Error(`Form enctype '${formenctype}' not supported`);
		}
		
		xhr.send(data);
	});
}

interface BytesFormatterUnit
{
	unit: string;
	treshold: number;
}

class BytesFormatter
{
	units : BytesFormatterUnit[];
	
	constructor()
	{
		this.units = [
			{unit: 'Z', treshold: Math.pow(1024, 6)},
			{unit: 'P', treshold: Math.pow(1024, 5)},
			{unit: 'T', treshold: Math.pow(1024, 4)},
			{unit: 'G', treshold: Math.pow(1024, 3)},
			{unit: 'M', treshold: Math.pow(1024, 2)},
			{unit: 'K', treshold: Math.pow(1024, 1)},
		];
	}
	
	format(bytes: number) : string
	{
		for (const {unit, treshold} of this.units) {
			if (bytes > treshold) {
				const ret = (bytes / treshold).toFixed(0);
				return `${ret}${unit}b`;
			}
		}
		
		return `${bytes}b`;
	}
}

export default function UploadItem({ file } : { file : File }) {

	const [state, dispatch] = useReducer(stateReducer, initialState);
	const appCtx = useAppContext();
	
	useEffect(() => {
		upload(appCtx, file, (total, loaded) => {
			dispatch({ type: 'progress', value: { total, loaded } });
		}).then((xhr) => {
			dispatch({ type: 'done', value: xhr.response });
		}, () => {
			dispatch({ type: 'error', value: ['raz err', 'dwa err'] });
		});
			
	}, [ file ]);

	const bf = new BytesFormatter();

	return (
		<>
			<span data-el="name">{file.name}</span>
			<progress data-el="progress" max="0" value={state.progress}></progress>
			<span data-el="percent">{state.percent}</span>
			<span data-el="loaded">{bf.format(state.loaded)}</span>
			<span data-el="size">{bf.format(file.size)}</span>
			<ul data-el="errors">{state.errors ? state.errors.map((err, i) => <li key={i}>{err}</li>) : ''}</ul>
		</>
  );
}
