export default function modelsReducer( state, action ) {
	switch ( action.type ) {
		case 'SCHEMAS_LOADED':
			return {
				...state,
				schemas: {
					...action.payload,
					loaded: true,
				},
			};

		case 'MODELS_LOADED':
			return {
				...state,
				models: {
					byId: action.payload,
					allIds: Object.keys( action.payload ),
					loaded: true,
				},
			};

		case 'MODEL_UPDATE':
			return {
				...state,
				models: {
					...state.models,
					byId: {
						...state.models.byId,
						[ action.payload.uuid ]: action.payload,
					},
				},
			};

		case 'MODEL_DELETE': {
			const { [ action.payload ]: _, ...rest } = state.models.byId;
			return {
				...state,
				models: {
					byId: rest,
					allIds: state.models.allIds.filter(
						( id ) => id !== action.payload
					),
				},
			};
		}

		default:
			return state;
	}
}
