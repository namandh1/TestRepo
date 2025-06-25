// Add these new state variables after your existing useState declarations
const [modalVisible, setModalVisible] = useState(false);
const [modalData, setModalData] = useState([]);
const [modalLoading, setModalLoading] = useState(false);
const [currentWalletAddress, setCurrentWalletAddress] = useState('');


const fetchAdditionalFunds = (walletAddress) => {
	setModalLoading(true);
	setCurrentWalletAddress(walletAddress);
	
	genericGetData({
		dispatch: props.dispatch,
		url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${walletAddress}&fundId=${row.fundID}`,
		successCb: (data) => {
			if (data && data.data) {
				// Filter to only include the columns we want
				const filteredData = data.data.map(item => ({
					businessClientRelationshipReportingName: item.businessClientRelationshipReportingName,
					clientName: item.clientName
				}));
				setModalData(filteredData);
			} else {
				setModalData([]);
			}
			setModalLoading(false);
			setModalVisible(true);
		},
		errorCb: (err) => {
			setModalLoading(false);
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
		return (
			<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
				<span>{params.data.walletAddress}</span>
				<Tooltip title="View additional funds for this wallet">
					<InfoCircleOutlined 
						style={{ 
							color: '#1890ff', 
							cursor: 'pointer',
							fontSize: '14px'
						}}
						onClick={() => fetchAdditionalFunds(params.data.walletAddress)}
					/>
				</Tooltip>
			</div>
		);
	}
},



{/* Modal for Additional Funds */}
<Modal
	title={`Additional Funds for Wallet: ${currentWalletAddress}`}
	open={modalVisible}
	onCancel={() => setModalVisible(false)}
	footer={[
		<Button key="close" onClick={() => setModalVisible(false)}>
			Close
		</Button>
	]}
	width={600}
>
	<Table
		dataSource={modalData}
		loading={modalLoading}
		pagination={false}
		size="small"
		scroll={{ y: 300 }}
		locale={{ emptyText: 'No additional funds found for this wallet address' }}
		columns={[
			{
				title: 'Business Client Name',
				dataIndex: 'businessClientRelationshipReportingName',
				key: 'businessClientRelationshipReportingName',
				width: '50%'
			},
			{
				title: 'Client Name', 
				dataIndex: 'clientName',
				key: 'clientName',
				width: '50%'
			}
		]}
	/>
</Modal>


cellRenderer: (params) => {
	const [hasData, setHasData] = useState(null); // null = not checked, true = has data, false = no data
	
	// Check if wallet has additional data on component mount
	useEffect(() => {
		if (params.data.walletAddress) {
			genericGetData({
				dispatch: props.dispatch,
				url: `api/walletverificationapi/GetAdditionalFundsForWalletConfiguration?walletAddress=${params.data.walletAddress}&fundId=${row.fundID}`,
				successCb: (data) => {
					setHasData(data && data.data && data.data.length > 0);
				},
				errorCb: () => {
					setHasData(false);
				}
			});
		}
	}, [params.data.walletAddress]);
	
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<span>{params.data.walletAddress}</span>
			<Tooltip title={hasData === false ? "No additional funds available" : "View additional funds for this wallet"}>
				<InfoCircleOutlined 
					style={{ 
						color: hasData === false ? '#d9d9d9' : '#1890ff', 
						cursor: hasData === false ? 'not-allowed' : 'pointer',
						fontSize: '14px'
					}}
					onClick={() => hasData !== false && fetchAdditionalFunds(params.data.walletAddress)}
				/>
			</Tooltip>
		</div>
	);
}


