import React, { useReducer, useId, } from 'react';
import UploadItem from './UploadItem';
import { AppProvider, useAppContext } from './AppContext';
import type { ConfigMap, FormConfig } from './AppContext';

interface State {
   files ?: FileList, 
};

type CounterAction =
  | { type: "drop"; value: React.DragEvent<HTMLFormElement> }
  | { type: "input"; value: React.FormEvent<HTMLInputElement> }

const initialState: State = { files: undefined };

function stateReducer(_: State, action: CounterAction): State {
  switch (action.type) {
    case "drop":
	  const dropEvent = action.value;
	  dropEvent.preventDefault();
	  
	  /*
		const label = dropEvent.target as HTMLLabelElement;
		const control = label.control as HTMLInputElement;
		control.files = dropEvent.dataTransfer.files;
	  //control.triggerEvent('input');
*/
      return { files: dropEvent.dataTransfer.files };
    case "input":
	  const input = action.value.target as HTMLInputElement;
	  const files = (input.files) ? input.files : undefined;
      return { files: files };
    default:
      throw new Error("Unknown action");
  }
}

const AppContext = {};

export { AppContext };

export default function App({ config } : { config: FormConfig }) {
  const [state, dispatch] = useReducer(stateReducer, initialState);
  const inputId = useId();
  
  const app = useAppContext();
  app.setFormConfig(config);
  
  const onDrop = (evt : React.DragEvent<HTMLFormElement>) => dispatch({ type: "drop", value: evt });
  const onInput = (evt : React.FormEvent<HTMLInputElement>) => dispatch({ type: "input", value: evt });

  return (
  <AppProvider>
    <div className='dnd-upload'>
    
      <form onDragOver={e => e.preventDefault()} onDrop={e => onDrop(e)} method="post" encType="multipart/form-data">
      	<input type="file" id={inputId} onInput={e => onInput(e)} accept="image/*,.pdf" multiple />
      	<label htmlFor={inputId}>
      		Click here to choose Files to upload or drop file here.
      	</label>
      </form>
      
      <ul data-el="items">{ Array.from(state.files ? state.files : []).map((file, i) => <li key={i} data-el="item"><UploadItem file={file} /></li>) }</ul>
      
    </div>
  </AppProvider>
  );
}
