import React, { useContext, createContext, ReactNode } from 'react';

export enum FormEnctype {
	URLENCODED = 'application/x-www-form-urlencoded',
	FORM_DATA = 'multipart/form-data',
	PLAIN = 'text/plain',
};

export enum FormMethod {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
};

export type FormConfig = {
	formaction?: string,
	formmethod?: FormMethod,
	formenctype?: FormEnctype,
};

export type ConfigMap = FormConfig & {
	[key: string]: any
};

export interface AppContextInteface
{
	config: ConfigMap;
	setFormConfig(config : FormConfig) : void;
}

class AppContextClass
{
	config = {
		formaction: '',
		formmethod: FormMethod.POST,
		formenctype: FormEnctype.FORM_DATA,
	}
	
	setFormConfig(config : FormConfig)
	{
		this.config = { ...this.config, ...config }
	}
}

const app = new AppContextClass();

const AppContext = createContext(app);

export function useAppContext()
{
	return useContext(AppContext);
}

export function AppProvider({ children } : { children : ReactNode }) {
	
	
	return (
	<>
		<AppContext.Provider value={app}>
		{ children }
		</AppContext.Provider>
	</>
	);
}
