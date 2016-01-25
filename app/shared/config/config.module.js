angular
    .module('ConfigModule', [])
    .constant('config', {
        bikaApiRest: {
            production: {
                rest_url: 'http://localhost:8088',
                bika_host: 'http://localhost:8080/CRS4',
                callback: 'JSON_CALLBACK'},
            develop: {
                rest_url: 'http://localhost:8088',
                bika_host: 'http://localhost:8080/CRS4',
                callback: 'JSON_CALLBACK'},
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
                create_batch: '/bika/create/batch',
                create_analysis_request:'/bika/create/analysis_request',
                cancel_batch: '/bika/cancel/batch',
                cancel_analysis_request:'/bika/cancel/analysis_request',
                reinstate_batch: '/bika/reinstate/batch',
                reinstate_analysis_request:'/bika/reinstate/analysis_request',
                open_batch: '/bika/action/open_batch',
                close_batch: '/bika/action/close_batch',
                receive_sample: '/bika/action/receive_sample',
                submit: '/bika/action/submit',
                verify: '/bika/action/verify',
                assign: '/bika/action/assign',
                publish: '/bika/action/publish',
				set_analysis_result : '/bika/set/analysis_result',
				set_analyses_results : '/bika/set/analyses_results',
				count_samples: '/bika/count/samples',
				count_analysis_requests: '/bika/count/analysis_requests',
				create_worksheet: '/bika/create/worksheet',
				update_worksheet: '/bika/update/worksheet',

            },
            plone_url: {
            	develop: 'http://localhost:8080',
            	production: 'http://localhost:8080',
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
        	stickers_path: '/CRS4/analysisrequests',
        	path: 'sticker?autoprint=1&template=Code_128_1x48mm.pt',
        }


    });

