const fetchAdditionalFunds = (walletAddress) => {
	// Don't show modal yet, just fetch data first
	genericGetData({
		dispatch: props.dispatch,
		url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${walletAddress}&fundId=${row.fundID}`,
		successCb: (data) => {
			if (data && data.data && data.data.length > 0) {
				// Only open modal if there's data
				const filteredData = data.data.map(item => ({
					businessClientRelationshipReportingName: item.businessClientRelationshipReportingName,
					clientName: item.clientName
				}));
				setModalData(filteredData);
				setCurrentWalletAddress(walletAddress);
				setModalLoading(false);
				setModalVisible(true);
			} else {
				// No data - show message but don't open modal
				props.alert.info('No additional funds found for this wallet address');
			}
		},
		errorCb: (err) => {
			props.alert.error('Failed to fetch additional funds data');
		}
	});
};

{
	field: 'walletAddress',
	headerName: 'Wallet Address',
	initialWidth: 350,
	headerTooltip: 'Wallet Address',
	cellRenderer: (params) => {
		const [iconState, setIconState] = useState('default'); // 'default', 'disabled', 'enabled'
		
		const handleIconClick = () => {
			if (iconState === 'disabled') return;
			
			// Check data availability first
			genericGetData({
				dispatch: props.dispatch,
				url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${params.data.walletAddress}&fundId=${row.fundID}`,
				successCb: (data) => {
					if (data && data.data && data.data.length > 0) {
						setIconState('enabled');
						// Open modal with data
						const filteredData = data.data.map(item => ({
							businessClientRelationshipReportingName: item.businessClientRelationshipReportingName,
							clientName: item.clientName
						}));
						setModalData(filteredData);
						setCurrentWalletAddress(params.data.walletAddress);
						setModalLoading(false);
						setModalVisible(true);
					} else {
						setIconState('disabled');
						props.alert.info('No additional funds found for this wallet address');
					}
				},
				errorCb: (err) => {
					setIconState('disabled');
					props.alert.error('Failed to fetch additional funds data');
				}
			});
		};
		
		const getTooltip = () => {
			switch(iconState) {
				case 'disabled': return 'No additional funds available for this wallet';
				case 'enabled': return 'View additional funds for this wallet';
				default: return 'Click to check additional funds for this wallet';
			}
		};
		
		return (
			<div style={{ 
				display: 'flex', 
				alignItems: 'center', 
				justifyContent: 'space-between',
				width: '100%',
				height: '100%',
				padding: '0 8px'
			}}>
				<span style={{ 
					overflow: 'hidden', 
					textOverflow: 'ellipsis', 
					whiteSpace: 'nowrap',
					flex: 1,
					marginRight: '8px'
				}}>
					{params.data.walletAddress}
				</span>
				<Tooltip title={getTooltip()}>
					<InfoCircleOutlined 
						style={{ 
							color: iconState === 'disabled' ? '#d9d9d9' : '#1890ff', 
							cursor: iconState === 'disabled' ? 'not-allowed' : 'pointer',
							fontSize: '14px',
							flexShrink: 0
						}}
						onClick={handleIconClick}
					/>
				</Tooltip>
			</div>
		);
	},
	cellStyle: {
		padding: 0,
		display: 'flex',
		alignItems: 'center'
	}
},
