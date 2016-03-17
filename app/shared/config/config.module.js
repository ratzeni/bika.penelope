angular
    .module('ConfigModule', [])
    .constant('config', {
        bikaApiRest: {
            methods: {
                check_status: '/web/check/status',
                login: '/bika/login',
                get_clients: '/bika/get/clients',
                get_contacts: '/bika/get/contacts',
                get_samples: '/bika/get/samples',
                get_analysis_profiles: '/bika/get/analysis_profiles',
                get_analysis_services: '/bika/get/analysis_services',
                get_sample_types: '/bika/get/sample_types',
                get_batches: '/bika/get/batches',
                get_analysis_requests:'/bika/get/analysis_requests',
                get_users:'/bika/get/users',
                get_manager_users:'/bika/get/manager_users',
                get_analyst_users:'/bika/get/analyst_users',
                get_clerk_users:'/bika/get/clerk_users',
                get_client_users:'/bika/get/client_users',
                get_worksheets:'/bika/get/worksheets',
                get_supply_orders:'/bika/get/supply_orders',
                create_batch: '/bika/create/batch',
                create_worksheet: '/bika/create/worksheet',
                create_analysis_request:'/bika/create/analysis_request',
                create_supply_order:'/bika/create/supply_order',
                cancel_batch: '/bika/cancel/batch',
                cancel_worksheet: '/bika/cancel/worksheet',
                cancel_analysis_request:'/bika/cancel/analysis_request',
                reinstate_batch: '/bika/reinstate/batch',
                reinstate_worksheet: '/bika/reinstate/worksheet',
                reinstate_analysis_request:'/bika/reinstate/analysis_request',
                open_batch: '/bika/action/open_batch',
                close_batch: '/bika/action/close_batch',
                open_worksheet: '/bika/action/open_worksheet',
                close_worksheet: '/bika/action/close_worksheet',
                receive_sample: '/bika/action/receive_sample',
                submit: '/bika/action/submit',
                verify: '/bika/action/verify',
                assign: '/bika/action/assign',
                publish: '/bika/action/publish',
                activate_supply_order: '/bika/action/activate_supply_order',
                deactivate_supply_order: '/bika/action/deactivate_supply_order',
                dispatch_supply_order: '/bika/action/dispatch_supply_order',
				set_analysis_result : '/bika/set/analysis_result',
				set_analyses_results : '/bika/set/analyses_results',
				count_samples: '/bika/count/samples',
				count_analysis_requests: '/bika/count/analysis_requests',
				update_worksheet: '/bika/update/worksheet',
				update_worksheets: '/bika/update/worksheets',
				update_batch: '/bika/update/batch',
				update_batches: '/bika/update/batches',
				update_analysis_request: '/bika/update/analysis_request',
				update_analysis_requests: '/bika/update/analysis_requests',
				update_supply_order: '/bika/update/supply_order',
				update_supply_orders: '/bika/update/supply_orders',
            },
            data_source: {
				container_types: [
					{label: 'Tube', 	value: 'Tube',},
					{label: 'Plate',	value: 'Plate',},
					{label: 'Flowcell Pack', value: 'Flowcell Pack',},
				],
				export_mode: [
					{label: 'FTP', 	value: 'FTP',},
					{label: 'LIBRARY',	value: 'LIBRARY',},
					{label: 'MOUNT', value: 'MOUNT',},
				],
				reads: [
					{label: '51', value: '51'},
					{label: '76', value: '76'},
					{label: '101', value: '101'},
					{label: '251', value: '251'},
					{label: '301', value: '301'},
				],
				indexes: [
					{label: '6', value: '6'},
					{label: '7', value: '7'},
					{label: '8', value: '8'},
					{label: '9', value: '9'},
					{label: '10', value: '10'},
					{label: '11', value: '11'},
					{label: '12', value: '12'},
					{label: '13', value: '13'},
				],

        	}
        },
        irodsApiRest: {
        	methods: {
        		get_running_folders: '/irods/get/running',
        		put_samplesheet: '/irods/put/samplesheet'
        	}
        },
        legend: {
        	analysis_result: {
        		1: "Success",
        		0: "Failed",
        	},
        	analysis_result_todo: "To do",
        },
        stickers: {
        	stickers_path: '/analysisrequests',
        	path: 'sticker?autoprint=1&template=Code_128_1x48mm.pt',
        },
        instruments: {
        	SN526: 'Diabolik',
        }




    });

