import { createContext, useContext } from '@wordpress/element';

const AdminDataContext = createContext( null );

export const AdminDataProvider = ( {
	children,
	adminData,
} ) => {
	
	return (
		<AdminDataContext.Provider value={ adminData || {} }>
			{ children }
		</AdminDataContext.Provider>
	);
};

export const useAdminData = () => {
	const context = useContext( AdminDataContext );
	if ( ! context ) {
		throw new Error( 'useAdminData must be used within AdminDataProvider' );
	}
	return context;
};
