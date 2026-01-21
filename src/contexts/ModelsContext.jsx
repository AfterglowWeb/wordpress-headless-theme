import {
	createContext,
	useContext,
	useState,
	useEffect,
	useReducer,
} from '@wordpress/element';
import { useAdminData } from './AdminDataContext';
import modelsReducer from './modelsReducer';

const ModelsContext = createContext( null );

const initialState = {
	schemas: {
		post_types_schemas: {
			post: { label: 'Post', kind: 'post_type', fields: {} },
			page: { label: 'Page', kind: 'post_type', fields: {} },
		},
		taxonomies_schemas: {
			category: { label: 'Category', kind: 'taxonomy', fields: {} },
		},
		loaded: false,
	},

	models: {
		byId: {},
		allIds: [],
		loaded: false,
	},

	ui: {
		activeModelId: null,
		activeRestType: null,
	},
};

export function ModelsProvider( { children } ) {
	const { adminData } = useAdminData();
	const [ state, dispatch ] = useReducer( modelsReducer, initialState );

	const loadSchemas = async () => {
		if ( state.schemas.loaded ) {
			return;
		}

		const res = await fetch( adminData.ajaxurl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams( {
				action: 'blank_read_schemas',
				nonce: adminData.nonce,
			} ),
		} );

		const json = await res.json();
		if ( json?.success ) {
			dispatch( {
				type: 'SCHEMAS_LOADED',
				payload: json.data,
			} );
		}
	};

	const saveModel = async ( model ) => {
		dispatch( { type: 'MODEL_UPDATE', payload: model } );
	};

	const deleteModel = async ( uuid ) => {
		dispatch( { type: 'MODEL_DELETE', payload: uuid } );
	};

	return (
		<ModelsContext.Provider
			value={ {
				state,
				loadSchemas,
				saveModel,
				deleteModel,
			} }
		>
			{ children }
		</ModelsContext.Provider>
	);
}

export const useModels = () => useContext( ModelsContext );
